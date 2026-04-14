import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Service role client — bypasses RLS
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Nova Schola <onboarding@resend.dev>';
const REPLY_TO = process.env.RESEND_REPLY_TO ?? 'novaschola25@gmail.com';
const APP_URL = process.env.VITE_APP_URL ?? 'https://nova-schola.vercel.app';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId } = req.body ?? {};
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  // 1. Activate the student profile (service role bypasses RLS)
  const { error: updateError, count } = await supabaseAdmin
    .from('profiles')
    .update({
      account_status: 'active',
      subscription_status: 'trial', // Start with trial
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
    }, { count: 'exact' })
    .eq('id', userId);

  if (updateError) {
    console.error('[activate-user] update error:', updateError);
    return res.status(500).json({ error: updateError.message });
  }

  console.log(`[activate-user] rows updated: ${count}`);

  // 2. Fetch student profile
  const { data: student, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, name, parent_id')
    .eq('id', userId)
    .single();

  if (fetchError || !student) {
    console.error('[activate-user] fetch profile error:', fetchError);
    return res.status(500).json({ error: 'Could not fetch student profile' });
  }

  // 3. If student has a linked parent, activate parent too
  let emailTarget = { email: student.email, name: student.name, studentName: undefined as string | undefined };

  if (student.parent_id) {
    const { error: parentUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({ account_status: 'active', is_active: true })
      .eq('id', student.parent_id)
      .eq('account_status', 'pending');

    if (parentUpdateError) {
      console.error('[activate-user] parent update error:', parentUpdateError);
    }

    const { data: parentProfile } = await supabaseAdmin
      .from('profiles')
      .select('email, name')
      .eq('id', student.parent_id)
      .single();

    if (parentProfile?.email) {
      emailTarget = {
        email: parentProfile.email,
        name: parentProfile.name ?? 'Padre/Madre',
        studentName: student.name,
      };
    }
  }

  // 4. Send activation email
  if (!process.env.RESEND_API_KEY) {
    console.warn('[activate-user] RESEND_API_KEY not set — skipping email');
    return res.status(200).json({ success: true, emailSent: false, reason: 'RESEND_API_KEY not configured' });
  }

  const studentLine = emailTarget.studentName
    ? `<p>La cuenta del estudiante <strong>${emailTarget.studentName}</strong> ha sido activada.</p>`
    : '<p>Tu cuenta ha sido activada.</p>';

  const html = `
    <div style="font-family:sans-serif;padding:24px;border:1px solid #eee;border-radius:12px;max-width:480px">
      <h2 style="color:#059669;margin-top:0">Cuenta activada – Nova Schola</h2>
      <p>Hola <strong>${emailTarget.name}</strong>,</p>
      ${studentLine}
      <p>Ya puedes iniciar sesión y usar la plataforma con normalidad.</p>
      <a href="${APP_URL}"
         style="display:inline-block;margin-top:12px;background:#000;color:#fff;padding:10px 22px;text-decoration:none;border-radius:8px;font-weight:bold">
        Ir a Nova Schola
      </a>
      <p style="margin-top:24px;font-size:12px;color:#888">Nova Schola · Si no esperabas este correo puedes ignorarlo.</p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to: [emailTarget.email],
      subject: 'Cuenta activada – Nova Schola',
      html,
    });
    console.log('[activate-user] email sent:', result);
    return res.status(200).json({ success: true, emailSent: true, emailId: (result as any).id });
  } catch (emailErr: any) {
    // Activation succeeded even if email fails — log and return partial success
    console.error('[activate-user] email error:', emailErr);
    return res.status(200).json({ success: true, emailSent: false, emailError: emailErr.message });
  }
}
