
import { createClient } from "@supabase/supabase-js";
import { Infraction, StoreItem, EducationalPlan, ViewState, AppMessage } from "../types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isOffline = !SUPABASE_URL || !SUPABASE_KEY;
export const supabase = isOffline ? null : createClient(SUPABASE_URL, SUPABASE_KEY);


/* ===================================================
   AUTH - USUARIOS 100% REALES
   ...
=================================================== */

export const loginWithSupabase = async (email: string, password: string, intendedRole: string = 'STUDENT') => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const normalizedEmail = email.toLowerCase().trim();
  const isAdminEmail = normalizedEmail === 'rickhazur@gmail.com';

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Login error:', error);
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Correo o contraseña incorrectos. Inténtalo de nuevo.');
    }
    if (error.message.includes('Email not confirmed')) {
      throw new Error('⚠️ Tu correo no ha sido verificado. Por favor revisa tu bandeja de entrada y haz clic en el enlace de confirmación antes de entrar.');
    }
    throw error;
  }

  // Fetch profile — handle errors gracefully (RLS may block, profile may not exist)
  let profile: any = null;
  try {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user!.id)
      .maybeSingle();

    if (profileError) {
      console.warn('Profile fetch during login:', profileError.message);
      // For admin, continue with null profile
    } else {
      profile = profileData;
    }
  } catch (profileErr) {
    console.warn('Profile fetch exception during login:', profileErr);
  }

  let finalRole = profile?.role || intendedRole;

  // Emergency bypass for primary admin — always override role
  if (isAdminEmail) {
    finalRole = 'ADMIN';
  }

  // Account status check — admin always bypasses
  if (finalRole !== 'ADMIN') {
    if (profile?.account_status === 'pending') {
      await supabase.auth.signOut();
      throw new Error('Tu cuenta está pendiente de aprobación por el administrador. Por favor espera a ser contactado.');
    } else if (profile?.account_status === 'rejected') {
      await supabase.auth.signOut();
      throw new Error('Tu cuenta ha sido desactivada. Contacta al soporte.');
    }
  }

  return {
    uid: data.user!.id,
    email: normalizedEmail,
    name: profile?.name || normalizedEmail.split('@')[0],
    role: finalRole,
    level: profile?.level || "TEEN",
    gradeLevel: profile?.grade_level || 3,
    isBilingual: profile?.is_bilingual || false,
    agreementAccepted: true,
    mustChangePassword: profile?.must_change_password || false
  };
};

export const logoutSupabase = async () => {
  if (supabase) await supabase.auth.signOut();
  return true;
};

export const sendPasswordReset = async (email: string) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  // Use the current origin so the recovery link redirects back to our app
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.novaschola.co';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: siteUrl,
  });
  if (error) throw error;
  return { success: true };
};


export const registerStudent = async (data: { email: string; password: string; name: string; gradeLevel: number; guardianPhone?: string; isBilingual?: boolean }) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  // 1. SignUp en Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      data: {
        name: data.name,
        role: 'STUDENT',
        level: 'primary',
        grade_level: data.gradeLevel,
        is_bilingual: data.isBilingual || false
      }
    }
  });

  if (authError) {
    console.error("Auth signup error:", authError);
    if (authError.message?.includes('Database error saving new user') || authError.message?.includes('saving new user')) {
      throw new Error("No se pudo guardar la cuenta en la base de datos. Ejecuta en Supabase SQL Editor el archivo supabase/FIX_COMPLETE_SYSTEM.sql y luego intenta de nuevo.");
    }
    throw authError;
  }
  if (!authData.user) throw new Error("No se pudo crear el usuario.");

  // 2. Crear/Actualizar Perfil (upsert; cuenta pendiente de activación)
  // El trigger handle_new_user puede haberlo creado ya, pero hacemos upsert para asegurar toda la data
  const profilePayload: Record<string, unknown> = {
    id: authData.user.id,
    name: data.name,
    guardian_phone: data.guardianPhone,
    role: 'STUDENT',
    level: 'primary',
    grade_level: data.gradeLevel,
    is_bilingual: data.isBilingual || false,
    account_status: 'pending',
    email: data.email
  };

  let profileSaved = false;

  // Attempt 1: Full upsert with email
  try {
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: 'id' });

    if (!profileError) {
      profileSaved = true;
    } else if (profileError.message?.includes('email') || profileError.message?.includes('column')) {
      // Attempt 2: Retry without email column if it doesn't exist
      delete profilePayload.email;
      const { error: retryError } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: 'id' });

      if (!retryError) {
        profileSaved = true;
      } else {
        console.error("Profile upsert retry failed:", retryError);
      }
    } else {
      console.error("Profile upsert failed:", profileError);
    }
  } catch (e) {
    console.error("Profile upsert exception:", e);
  }

  // Attempt 3: If upsert failed, check if the trigger already created it
  if (!profileSaved) {
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (existingProfile) {
        // Profile exists (created by trigger), just update the missing fields
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            name: data.name,
            guardian_phone: data.guardianPhone,
            grade_level: data.gradeLevel,
            is_bilingual: data.isBilingual || false,
            account_status: 'pending'
          })
          .eq("id", authData.user.id);

        if (!updateError) {
          profileSaved = true;
        } else {
          console.warn("Profile update failed:", updateError);
        }
      }
    } catch (checkErr) {
      console.warn("Profile check failed:", checkErr);
    }
  }

  if (!profileSaved) {
    console.warn("Profile could not be saved, but auth user was created. The trigger may handle it.");
    // Don't throw here — the auth user was created successfully, and the trigger
    // should have created a basic profile. The admin can always fix it from the panel.
  }

  // 3. Inicializar Economía (ignorar si ya existe o falla por RLS)
  supabase.from("economy").insert({
    user_id: authData.user.id,
    coins: 200 // Bono de bienvenida
  }).then(({ error }) => { if (error) console.warn("Economy init:", error); });

  // Notificar Admin
  notifyAdminOfNewUser({
    type: 'STUDENT',
    name: data.name,
    email: data.email,
    details: `Grado: ${data.gradeLevel}° | Colegio: ${data.isBilingual ? 'Bilingüe' : 'Estándar'}`
  }).catch(console.error);

  return {
    success: true,
    user: authData.user,
    session: authData.session,
    emailConfirmationRequired: !authData.session // Si no hay sesión inmediata, es que falta confirmar email
  };
};

export const notifyAdminOfNewUser = async (data: { type: 'STUDENT' | 'PARENT_STUDENT', name: string, email: string, details?: string }) => {
  try {
    const html = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5;">🚀 Nuevo Usuario Registrado (Pendiente)</h2>
        <p>Un nuevo usuario ha completado el registro y requiere aprobación.</p>
        <ul style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
           <li><strong>Tipo:</strong> ${data.type === 'PARENT_STUDENT' ? 'Familia (Padre + Estudiante)' : 'Estudiante Independiente'}</li>
           <li><strong>Nombre:</strong> ${data.name}</li>
           <li><strong>Email:</strong> ${data.email}</li>
           ${data.details ? `<li><strong>Detalles:</strong> ${data.details}</li>` : ''}
        </ul>
        <p>Por favor ingresa al <strong>Panel Administrativo</strong> para aprobar o rechazar esta cuenta.</p>
        <a href="https://nova-schola.vercel.app/" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Ir al Panel</a>
      </div>
    `;

    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'rickhazur@gmail.com',
        subject: `🔔 Nuevo Registro: ${data.name}`,
        html: html
      })
    });
  } catch (err) {
    console.error("Failed to notify admin:", err);
  }
};

/** Envía correo al padre/estudiante cuando el administrador activa la cuenta. */
export const notifyParentAccountActivated = async (data: { toEmail: string; userName: string; studentName?: string }) => {
  try {
    const studentLine = data.studentName
      ? `<p>La cuenta del estudiante <strong>${data.studentName}</strong> ha sido activada.</p>`
      : '<p>Tu cuenta ha sido activada.</p>';
    const html = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #059669;">Cuenta activada – Nova Schola</h2>
        <p>Hola ${data.userName},</p>
        ${studentLine}
        <p>Ya puedes iniciar sesión y usar la plataforma.</p>
        <a href="https://nova-schola.vercel.app/" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Ir a Nova Schola</a>
      </div>
    `;
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: data.toEmail,
        subject: 'Tu cuenta en Nova Schola ha sido activada',
        html
      })
    });
  } catch (err) {
    console.error("Failed to send activation email:", err);
  }
};

export const registerParentAndStudent = async (data: {
  parentEmail: string;
  parentPassword: string;
  parentName: string;
  studentEmail: string;
  studentPassword: string;
  studentName: string;
  studentGradeLevel: number;
  isBilingual: boolean;
  whatsappPhone?: string;
}) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  // 1. Registrar Estudiante
  const { data: studentAuth, error: studentError } = await supabase.auth.signUp({
    email: data.studentEmail,
    password: data.studentPassword,
    options: {
      data: {
        name: data.studentName,
        role: 'STUDENT',
        level: 'primary',
        grade_level: data.studentGradeLevel,
        is_bilingual: data.isBilingual
      }
    }
  });

  if (studentError) throw studentError;

  // Inicializar economía del estudiante
  if (studentAuth.user) {
    await supabase.from("economy").insert({
      user_id: studentAuth.user.id,
      coins: 200
    });
  }

  // 2. Crear Perfil del estudiante (Upsert; debe ocurrir antes de cerrar sesión por RLS)
  // El trigger handle_new_user puede haberlo creado ya
  if (studentAuth.user) {
    const studentPayload: Record<string, unknown> = {
      id: studentAuth.user.id,
      name: data.studentName,
      role: 'STUDENT',
      level: 'primary',
      grade_level: data.studentGradeLevel,
      is_bilingual: data.isBilingual,
      account_status: 'pending',
      email: data.studentEmail,
      guardian_phone: data.whatsappPhone
    };

    try {
      let err = (await supabase.from("profiles").upsert(studentPayload, { onConflict: 'id' })).error;
      if (err && (err.message?.includes('email') || err.message?.includes('column'))) {
        delete studentPayload.email;
        err = (await supabase.from("profiles").upsert(studentPayload, { onConflict: 'id' })).error;
      }
      if (err) {
        console.warn("Student profile upsert warning (trigger may have created it):", err.message);
      }
    } catch (e) {
      console.warn("Student profile upsert exception:", e);
    }
  }

  // Cerrar sesión del estudiante para registrar al padre
  await supabase.auth.signOut();

  // 2. Registrar o Buscar Padre
  let parentId = null;
  let isNewParent = true;

  try {
    const { data: parentAuth, error: parentError } = await supabase.auth.signUp({
      email: data.parentEmail,
      password: data.parentPassword,
      options: {
        data: {
          name: data.parentName,
          role: 'PARENT'
        }
      }
    });

    if (parentError) {
      // Si el usuario ya existe, intentamos recuperar su ID
      if (parentError.message.includes('already registered') || parentError.status === 422) {
        isNewParent = false;
        const { data: existingId, error: fetchError } = await supabase.rpc('get_user_id_by_email', {
          email_input: data.parentEmail
        });

        if (fetchError || !existingId) throw parentError;
        parentId = existingId;
      } else {
        throw parentError;
      }
    } else {
      parentId = parentAuth.user?.id;
    }
  } catch (error) {
    console.error("Error gestionando padre:", error);
    throw error;
  }

  // 4. Crear Perfiles del padre si no existen (Upsert)
  if (parentId && isNewParent) {
    const parentPayload: Record<string, unknown> = {
      id: parentId,
      name: data.parentName,
      role: 'PARENT',
      account_status: 'pending',
      email: data.parentEmail,
      guardian_phone: data.whatsappPhone
    };

    try {
      let err = (await supabase.from("profiles").upsert(parentPayload, { onConflict: 'id' })).error;
      if (err && (err.message?.includes('email') || err.message?.includes('column'))) {
        delete parentPayload.email;
        err = (await supabase.from("profiles").upsert(parentPayload, { onConflict: 'id' })).error;
      }
      if (err) {
        console.warn("Parent profile upsert warning (trigger may have created it):", err.message);
      }
    } catch (e) {
      console.warn("Parent profile upsert exception:", e);
    }
  }

  // Vincular Estudiante con el Padre usando RPC
  if (parentId && studentAuth.user) {
    const { error: linkError } = await supabase.rpc("link_student_to_parent", {
      student_id_param: studentAuth.user.id,
      parent_id_param: parentId
    });

    if (linkError) {
      console.error("Error linking student via RPC:", linkError);
    }
  }

  // Notificar al Admin
  notifyAdminOfNewUser({
    type: 'PARENT_STUDENT',
    name: data.parentName,
    email: data.parentEmail,
    details: `Hijo: ${data.studentName} (${data.studentGradeLevel}°) | Colegio: ${data.isBilingual ? 'Bilingüe' : 'Estándar'}`
  }).catch(e => console.error(e));

  // MUY IMPORTANTE: Cerrar la sesión final del padre para evitar que App.tsx intente
  // loguearlo al dashboard mientras su cuenta aún dice "pending".
  await supabase.auth.signOut();

  return {
    success: true,
    user: studentAuth.user,
    session: studentAuth.session,
    emailConfirmationRequired: true,
    message: isNewParent ? "Cuenta creada exitosamente" : "Estudiante creado y vinculado a tu cuenta de Padre existente."
  };
};

export const updateUserProfile = async (uid: string, profileData: { name?: string; avatar?: string; whatsapp_notifications_enabled?: boolean }) => {
  if (!supabase) return { success: false };
  const { error } = await supabase.from("profiles").update(profileData).eq("id", uid);
  if (error) throw error;
  return { success: true };
};

export const updateUserStatus = async (uid: string, status: 'active' | 'pending' | 'rejected') => {
  if (!supabase) return { success: false };
  const { error } = await supabase.from("profiles").update({ account_status: status }).eq("id", uid);
  if (error) {
    console.error("Error updating status:", error);
    return { success: false, error: error.message };
  }

  // Si estamos activando la cuenta, intentemos notificar por correo y activar también 
  // la cuenta del padre si existe.
  if (status === 'active') {
    try {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (profile) {
        // Enviar notificación de activación y verificar padre
        if (profile.parent_id) {
          const { data: parent } = await supabase.from("profiles").select("*").eq("id", profile.parent_id).maybeSingle();
          if (parent) {
            // Activar padre si estaba pendiente
            await supabase.from("profiles").update({ account_status: 'active' }).eq("id", parent.id);

            // Encomendar el correo de activación al padre
            await notifyParentAccountActivated({
              toEmail: parent.email,
              userName: parent.name,
              studentName: profile.name
            });
          }
        } else {
          // Notificar directamente al estudiante o cuenta independiente
          if (profile.email) {
            await notifyParentAccountActivated({
              toEmail: profile.email,
              userName: profile.name
            });
          }
        }
      }
    } catch (e) {
      console.warn("No se pudo notificar la activación de la cuenta", e);
    }
  }

  return { success: true };
};

export const updateUserPassword = async (newPass: string) => {
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn("No active session – Mocking password update success for bypass mode.");
      return { success: true };
    }
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) throw error;
  }
  return { success: true };
};

export const markPasswordChanged = async (uid: string) => {
  if (supabase) {
    const { error } = await supabase
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", uid);
    if (error) throw error;
  }
  return { success: true };
};

/* ===================================================
   PLANES Y MENU
=================================================== */

const DEFAULT_PLANS: EducationalPlan[] = [
  {
    id: 'plan_essential', name: 'Plan Esencial', description: 'Enfoque academico.',
    allowedViews: [ViewState.DASHBOARD, ViewState.SCHEDULE, ViewState.CURRICULUM, ViewState.REPOSITORY, ViewState.PROGRESS, ViewState.AI_CONSULTANT]
  },
  {
    id: 'plan_standard', name: 'Plan Estandar IB', description: 'Programa completo.',
    allowedViews: [ViewState.DASHBOARD, ViewState.SCHEDULE, ViewState.CURRICULUM, ViewState.REPOSITORY, ViewState.AI_CONSULTANT, ViewState.FLASHCARDS, ViewState.METRICS, ViewState.PROGRESS, ViewState.REWARDS]
  },
  {
    id: 'plan_elite', name: 'Plan Elite', description: 'Acceso total.',
    allowedViews: [ViewState.DASHBOARD, ViewState.SCHEDULE, ViewState.CURRICULUM, ViewState.REPOSITORY, ViewState.AI_CONSULTANT, ViewState.FLASHCARDS, ViewState.METRICS, ViewState.SOCIAL, ViewState.REWARDS, ViewState.PROGRESS, ViewState.SETTINGS]
  }
];

export const fetchPlansConfig = async (): Promise<EducationalPlan[]> => DEFAULT_PLANS;
export const savePlansConfig = async (plans: EducationalPlan[]) => true;
export const fetchStudentPlanAssignment = async (uid: string): Promise<string> => 'plan_standard';
export const assignPlanToStudent = async (uid: string, planId: string) => true;
export const fetchStudentAllowedViews = async (uid: string): Promise<string[]> => DEFAULT_PLANS[1].allowedViews;
export const fetchStudentMenuConfig = async () => null;
export const updateStudentMenuConfig = async (visibleItems: string[]) => false;

/* ===================================================
   ECONOMIA
=================================================== */

export const getUserEconomy = async (uid: string) => {
  if (!supabase) return { coins: 0, savings_balance: 0 };

  // Use maybeSingle to avoid errors on missing records
  const { data, error } = await supabase
    .from("economy")
    .select("coins, savings_balance")
    .eq("user_id", uid)
    .maybeSingle();

  if (error) {
    console.error("Error fetching economy:", error.message);
    return { coins: 0, savings_balance: 0 };
  }

  // If record is missing, initialize it (important for new users)
  if (!data) {
    console.log("Initializing economy for user:", uid);
    try {
      const { data: newData, error: insertError } = await supabase
        .from("economy")
        .insert({
          user_id: uid,
          coins: 0, // Now empty wallet
          savings_balance: 200, // Now 200 in bank from day 1
          last_updated: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (!insertError && newData) {
        return newData as { coins: number; savings_balance: number };
      }
    } catch (e) {
      console.warn("Failed to initialize economy record:", e);
    }
    return { coins: 0, savings_balance: 200 };
  }

  return data as { coins: number; savings_balance: number };
};

/** Fetch learning progress (XP) for a user — used so child sees Supabase as source of truth after login. */
export const getLearningProgress = async (uid: string): Promise<{ total_xp: number } | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase.from("learning_progress").select("total_xp").eq("user_id", uid).maybeSingle();
  if (error || !data) return null;
  return data;
};

export const subscribeToEconomy = (userId: string, onUpdate: (data: { coins: number; savings_balance: number }) => void) => {
  if (!supabase) return () => { };
  // console.log('📡 Suscribiendo a economy para:', userId);

  const handlePayload = (payload: any) => {
    if (payload.new) {
      onUpdate({
        coins: payload.new.coins ?? 0,
        savings_balance: payload.new.savings_balance ?? 0
      });
    }
  };

  const channel = supabase
    .channel(`economy-${userId}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'economy', filter: `user_id=eq.${userId}` },
      (payload) => {
        // console.log('💰 Cambio en economy (UPDATE):', payload);
        handlePayload(payload);
      }
    )
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'economy', filter: `user_id=eq.${userId}` },
      (payload) => {
        // console.log('💰 Cambio en economy (INSERT):', payload);
        handlePayload(payload);
      }
    )
    .subscribe((status) => { /* console.log('Economy status:', status) */ });

  return () => { supabase.removeChannel(channel); };
};

export const subscribeToLearning = (userId: string, onUpdate: (data: any) => void) => {
  if (!supabase) return () => { };
  // console.log('📡 Suscribiendo a learning_progress para:', userId);

  const channel = supabase
    .channel(`learning-${userId}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'learning_progress', filter: `user_id=eq.${userId}` },
      (payload) => {
        // console.log('🧠 Cambio en learning:', payload);
        if (payload.new) {
          onUpdate(payload.new);
        }
      }
    )
    .subscribe((status) => { /* console.log('Learning status:', status) */ });

  return () => { supabase.removeChannel(channel); };
};

export const subscribeToProfile = (userId: string, onUpdate: (data: any) => void) => {
  if (!supabase) return () => { };
  const channel = supabase
    .channel(`profile-${userId}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
      (payload) => {
        if (payload.new) onUpdate(payload.new);
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
};

/** Test pilot parent ID: when used, return mock student (Piloto Quinto) so panel works without Supabase. */
const TEST_PILOT_PARENT_ID = 'test-pilot-parent';
const TEST_PILOT_STUDENT_ID = 'test-pilot-quinto';

export const getManagedStudents = async (parentId: string) => {
  // Bypass: padre de prueba sin Supabase — devolver hijo simulado (Piloto Quinto)
  if (parentId === TEST_PILOT_PARENT_ID) {
    return [
      {
        id: TEST_PILOT_STUDENT_ID,
        name: 'Piloto Quinto',
        role: 'STUDENT',
        avatar: 'g5_boy_1',
        equipped_accessories: [],
        economy: [{ user_id: TEST_PILOT_STUDENT_ID, coins: 99999, last_updated: new Date().toISOString() }],
        learning_progress: [{
          user_id: TEST_PILOT_STUDENT_ID,
          total_xp: 1200,
          total_quests_completed: 0,
          quests_by_category: { math: 0, science: 0, language: 0 },
          last_updated: new Date().toISOString()
        }]
      }
    ];
  }

  if (!supabase) return [];

  // Fetch profiles first
  const { data, error } = await supabase
    .from("profiles")
    .select("*, learning_progress(*), economy(*)")
    .eq("parent_id", parentId);

  if (error) {
    console.error("Error fetching managed students:", error);
    // Try even simpler fetch if fallback needed
    const { data: fallbackData } = await supabase
      .from("profiles")
      .select("*")
      .eq("parent_id", parentId);
    return fallbackData || [];
  }
  return data;
};

export const linkStudentByEmail = async (studentEmail: string, parentId: string) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const { data, error } = await supabase.rpc("link_student_by_email", {
    student_email_param: studentEmail,
    parent_id_param: parentId
  });

  if (error) throw error;
  return data as { success: boolean; message: string };
};

// --- PARENT REWARDS (premios por meta en Supabase) ---
export type ParentRewardRow = { id: string; parent_id: string; student_id: string; name: string; cost: number; description: string | null; created_at?: string };

const PARENT_REWARDS_LOCAL_KEY = (parentId: string, studentId: string) => `nova_parent_rewards_${parentId}_${studentId}`;

export const getParentRewards = async (parentId: string, studentId: string): Promise<ParentRewardRow[]> => {
  if (parentId === TEST_PILOT_PARENT_ID) {
    try {
      const raw = localStorage.getItem(PARENT_REWARDS_LOCAL_KEY(parentId, studentId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("parent_rewards")
    .select("id, parent_id, student_id, name, cost, description, created_at")
    .eq("parent_id", parentId)
    .eq("student_id", studentId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("getParentRewards error", error);
    return [];
  }
  return (data as ParentRewardRow[]) || [];
};

export const insertParentReward = async (
  parentId: string,
  studentId: string,
  payload: { name: string; cost: number; description?: string }
): Promise<ParentRewardRow | null> => {
  if (parentId === TEST_PILOT_PARENT_ID) {
    const row: ParentRewardRow = {
      id: `custom-${Date.now()}`,
      parent_id: parentId,
      student_id: studentId,
      name: payload.name,
      cost: payload.cost,
      description: payload.description ?? null
    };
    const list = await getParentRewards(parentId, studentId);
    list.push(row);
    localStorage.setItem(PARENT_REWARDS_LOCAL_KEY(parentId, studentId), JSON.stringify(list));
    return row;
  }
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("parent_rewards")
    .insert({
      parent_id: parentId,
      student_id: studentId,
      name: payload.name,
      cost: payload.cost,
      description: payload.description ?? ""
    })
    .select("id, parent_id, student_id, name, cost, description, created_at")
    .single();
  if (error) {
    console.error("insertParentReward error", error);
    return null;
  }
  return data as ParentRewardRow;
};

export const deleteParentReward = async (parentId: string, rewardId: string, studentId: string): Promise<boolean> => {
  if (parentId === TEST_PILOT_PARENT_ID) {
    const list = (await getParentRewards(parentId, studentId)).filter((r) => r.id !== rewardId);
    localStorage.setItem(PARENT_REWARDS_LOCAL_KEY(parentId, studentId), JSON.stringify(list));
    return true;
  }
  if (!supabase) return false;
  const { error } = await supabase.from("parent_rewards").delete().eq("id", rewardId).eq("parent_id", parentId);
  if (error) {
    console.error("deleteParentReward error", error);
    return false;
  }
  return true;
};

// --- SECURE AWARDING VIA RPC (Bypasses RLS complexity) ---

export const adminAwardCoins = async (studentId: string, amount: number) => {
  // Bypass: estudiante piloto de prueba — no hay usuario en Supabase; la UI ya hizo update optimista
  if (studentId === TEST_PILOT_STUDENT_ID) return true;

  if (!supabase) return false;

  // 1. Try Secure RPC first
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('award_coins_secure', {
      p_student_id: studentId,
      p_amount: amount
    });
    if (!rpcError && rpcData === true) return true;
  } catch (e) {
    console.warn("RPC invocation failed", e);
  }

  // 2. Fallback: Robust Upsert with Defaults
  // Fetch current to calculate new total correctly if record exists
  const { data: current } = await supabase.from("economy").select("coins").eq("user_id", studentId).maybeSingle();
  const newTotal = (current?.coins || 0) + amount;

  const { error } = await supabase
    .from("economy")
    .upsert({
      user_id: studentId,
      coins: newTotal,
      last_updated: new Date().toISOString()
    });

  if (error) {
    console.error('Fallback Coin Error:', error.message, error.details);
    return false;
  }
  return true;
};

export const consignToBank = async (studentId: string, amount: number) => {
  if (studentId === TEST_PILOT_STUDENT_ID) return true;

  if (!supabase) return false;

  try {
    const { data, error } = await supabase.rpc('consign_to_bank', {
      p_student_id: studentId,
      p_amount: amount
    });
    if (!error && data === true) return true;
  } catch (e) {
    console.warn("RPC consign_to_bank failed", e);
  }

  // Fallback direct update
  const { data: current } = await supabase.from("economy").select("savings_balance").eq("user_id", studentId).maybeSingle();
  const newTotal = (current?.savings_balance || 0) + amount;

  const { error } = await supabase
    .from("economy")
    .upsert({
      user_id: studentId,
      savings_balance: newTotal,
      last_updated: new Date().toISOString()
    });

  return !error;
};

/**
 * Award coins to BOTH wallet (cash) and bank (savings) in one go.
 * This is the preferred method for parent rewards to ensure synchronization.
 */
export const awardCoinsDual = async (studentId: string, amount: number) => {
  if (studentId === TEST_PILOT_STUDENT_ID) return true;
  if (!supabase) return false;

  console.log(`💎 Awarding Dual Coins: ${amount} to ${studentId}`);

  // 1. Try single dual RPC first (Atomic, High Performance & SECURITY DEFINER)
  try {
    const { data, error } = await supabase.rpc('award_dual_coins_secure', {
      p_student_id: studentId,
      p_amount: amount
    });
    if (!error && data === true) {
      console.log("✅ award_dual_coins_secure RPC Success");
      return true;
    }
    if (error) console.error("❌ award_dual_coins_secure RPC error:", error.message, error.hint);
  } catch (e) {
    console.warn("⚠️ RPC award_dual_coins_secure exception:", e);
  }

  // 2. Sequential Fallback using individual RPCs
  console.log("🔄 Attempting sequential RPC fallback for dual award...");
  const coinsSuccess = await adminAwardCoins(studentId, amount);
  const bankSuccess = await consignToBank(studentId, amount);

  if (coinsSuccess && bankSuccess) {
    console.log("✅ Sequential Fallback Success");
    return true;
  }

  // 3. Last Resort: Proactive Upsert that creates the record if missing
  console.log("🩹 Last Resort: Proactive Upsert for economy...");
  try {
    const { data: current, error: fetchError } = await supabase
      .from("economy")
      .select("coins, savings_balance")
      .eq("user_id", studentId)
      .maybeSingle();

    if (fetchError) console.error("❌ Fetch current economy error:", fetchError.message);

    const newCoins = (current?.coins || 0) + amount;
    const newSavings = (current?.savings_balance || 0) + amount;

    const { error: upsertError } = await supabase
      .from("economy")
      .upsert({
        user_id: studentId,
        coins: newCoins,
        savings_balance: newSavings,
        last_updated: new Date().toISOString()
      });

    if (upsertError) {
      console.error("❌ Last Resort Upsert Failed:", upsertError.message, upsertError.details);
      return false;
    }

    console.log("✅ Last Resort Upsert Success");
    return true;
  } catch (e) {
    console.error("❌ Critical economy update failure:", e);
    return false;
  }
};

export const adminAwardXP = async (studentId: string, amount: number) => {
  // Bypass: estudiante piloto de prueba — no hay usuario en Supabase; la UI ya hizo update optimista
  if (studentId === TEST_PILOT_STUDENT_ID) return true;

  if (!supabase) return false;

  console.log(`⚡ Awarding XP: ${amount} to ${studentId}`);

  // 1. Try Secure RPC first
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('award_xp_secure', {
      p_student_id: studentId,
      p_amount: amount
    });
    if (!rpcError && rpcData === true) {
      console.log("✅ award_xp_secure RPC Success");
      return true;
    }
    if (rpcError) console.error("❌ award_xp_secure RPC error:", rpcError.message);
  } catch (e) {
    console.warn("⚠️ RPC invocation failed", e);
  }

  // 2. Fallback: Robust Upsert with Defaults
  console.log("🩹 Last Resort: Proactive Upsert for XP...");
  const { data: current, error: fetchError } = await supabase.from("learning_progress").select("*").eq("user_id", studentId).maybeSingle();

  if (fetchError) console.error("❌ Fetch current XP error:", fetchError.message);

  const newTotal = (current?.total_xp || 0) + amount;

  // Preserve existing progress or initialize defaults
  const questsByCategory = current?.quests_by_category || { math: 0, science: 0, language: 0 };
  const totalQuests = current?.total_quests_completed || 0;

  const { error } = await supabase
    .from("learning_progress")
    .upsert({
      user_id: studentId,
      total_xp: newTotal,
      quests_by_category: questsByCategory,
      total_quests_completed: totalQuests,
      last_updated: new Date().toISOString()
    });

  if (error) {
    console.error('❌ Fallback XP Error:', error.message, error.details);
    return false;
  }

  console.log("✅ Last Resort XP Success");
  return true;
};

export const fetchStoreItems = async (): Promise<StoreItem[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from("store_items").select("*").order('cost', { ascending: true });
  if (error) return [];
  return data as StoreItem[];
};

// --- SECURE SHOP & AVATAR ---

export const buyAccessorySecure = async (userId: string, itemId: string, cost: number) => {
  if (!supabase) return { success: false, message: "Offline" };

  const { data, error } = await supabase.rpc('buy_accessory_secure', {
    p_user_id: userId,
    p_item_id: itemId,
    p_cost: cost
  });

  if (error) {
    console.error("RPC Buy Error:", error);
    return { success: false, message: error.message };
  }
  return data;
};

export const saveAvatarSetup = async (userId: string, avatarId: string, equipped: any) => {
  if (!supabase) return false;

  const { data, error } = await supabase.rpc('save_avatar_setup', {
    p_user_id: userId,
    p_avatar_id: avatarId,
    p_equipped: equipped
  });

  if (error) {
    console.error("RPC Avatar Save Error:", error);
    return false;
  }
  return data;
};

export const saveStoreItemToDb = async (item: StoreItem) => {
  if (!supabase) return false;

  try {
    // 1. Prepare data for DB
    const { owned, ...dbItem } = item;

    // Ensure we have a valid ID
    if (!dbItem.id) {
      dbItem.id = `item_${Date.now()}`;
    }

    console.log("Saving item to Supabase:", dbItem);

    // 2. Initial Upsert attempt
    const { error } = await supabase.from("store_items").upsert(dbItem);

    if (error) {
      console.warn("Primary upsert failed, trying manual column mapping...", error.message);

      // Fallback: If columns like 'subType' or 'image' don't exist yet, 
      // try mapping to legacy columns like 'type' and 'icon' if they exist.
      const legacyItem: any = {
        id: dbItem.id,
        name: dbItem.name,
        cost: dbItem.cost,
        description: (dbItem as any).description || "",
        rarity: dbItem.rarity || "rare",
        type: dbItem.subType || (dbItem as any).type || "misc",
        icon: dbItem.image || (dbItem as any).icon || ""
      };

      const { error: legacyError } = await supabase.from("store_items").upsert(legacyItem);

      if (legacyError) {
        console.error("Critical error saving item even with fallback:", legacyError);
        throw legacyError;
      }
    }

    return true;
  } catch (err) {
    console.error("Exception in saveStoreItemToDb:", err);
    throw err;
  }
};

export const uploadStoreImage = async (file: File) => {
  if (!supabase) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `store-items/${fileName}`;

  // Priorizar buckets configurados para la tienda
  const buckets = ['nova-store', 'Nova Store', 'assets', 'public-content', 'images', 'uploads', 'storage'];

  for (const bucketName of buckets) {
    try {
      console.log(`Intentando subir a bucket: ${bucketName}...`);
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data) {
        console.log(`✅ Subida exitosa al bucket: ${bucketName}`);
        const { data: publicUrl } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        return publicUrl.publicUrl;
      }

      if (error) {
        console.warn(`Bucket '${bucketName}' falló:`, error.message);
      }
    } catch (err) {
      // Sigue intentando con el siguiente bucket
    }
  }
  console.error("❌ Todos los buckets de subida fallaron. Por favor, crea un bucket llamado 'assets' o 'public-content' en Supabase Storage.");
  return null;
};

export const hideStoreItemGlobally = async (id: string) => {
  if (!supabase) return false;
  try {
    const GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000000';
    const { data: globalRow } = await supabase
      .from('profiles')
      .select('owned_accessories')
      .eq('id', GLOBAL_CONFIG_ID)
      .maybeSingle();

    const currentExclusions = (globalRow?.owned_accessories as string[]) || [];
    if (!currentExclusions.includes(id)) {
      await supabase.from('profiles').upsert({
        id: GLOBAL_CONFIG_ID,
        owned_accessories: [...currentExclusions, id],
        name: 'GLOBAL_CATALOG_CONFIG'
      }, { onConflict: 'id' });
    }
    return true;
  } catch (e) {
    console.error("Global exclusion failed:", e);
    return false;
  }
};

export const deleteStoreItemFromDb = async (id: string) => {
  if (!supabase) return false;

  // 1. Delete from dynamic table
  const { error } = await supabase.from("store_items").delete().eq("id", id);

  // 2. Also hide globally (in case it's a hardcoded item with same ID)
  await hideStoreItemGlobally(id);

  if (error) throw error;
  return true;
};

/* ===================================================
   REPORTES Y ESTADÍSTICAS (TUTOR REPORTS)
=================================================== */

import { TutorReport } from '../types/tutor';

export const saveTutorReport = async (uid: string, report: TutorReport) => {
  if (!supabase) return false;

  // Ensure ID is unique if not provided
  const reportId = report.id || crypto.randomUUID();

  const { error } = await supabase.from('tutor_reports').upsert({
    id: reportId,
    user_id: uid,
    source: report.source,
    subject: report.subject,
    emoji: report.emoji,
    overall_score: report.overallScore,
    trend: report.trend,
    challenges: report.challenges, // JSONB
    recommendations: report.recommendations, // JSONB
    created_at: new Date().toISOString() // Or report.date if available
  });

  if (error) {
    console.error('Error saving tutor report:', error);
    return false;
  }
  return true;
};

export const fetchTutorReports = async (uid: string): Promise<TutorReport[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('tutor_reports')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error fetching reports:', error);
    return [];
  }

  // Map DB fields back to TutorReport type
  return data.map((row: any) => ({
    id: row.id,
    source: row.source,
    subject: row.subject,
    emoji: row.emoji,
    overallScore: row.overall_score,
    trend: row.trend,
    challenges: row.challenges,
    recommendations: row.recommendations,
    date: row.created_at || new Date().toISOString()
  }));
};

/* ===================================================
   DISCIPLINA
=================================================== */

export const fetchStudentInfractions = async (uid: string): Promise<Infraction[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from("infractions").select("*").eq("student_id", uid).order('timestamp', { ascending: false });
  if (error) return [];
  return data as Infraction[];
};

export const logStudentInfraction = async (uid: string, infraction: Infraction) => {
  if (!supabase) return false;
  const { error } = await supabase.from("infractions").insert({
    student_id: uid, type: infraction.type, description: infraction.description,
    severity: infraction.severity, timestamp: infraction.timestamp
  });
  return !error;
};

/* ===================================================
   ACADEMICO
=================================================== */

export const fetchStudentAcademicResults = async (uid: string) => {
  if (!supabase) return [];
  const { data, error } = await supabase.from("academic_results").select("*").eq("student_id", uid).order('timestamp', { ascending: false });
  if (error) return [];
  return data || [];
};

export const saveAcademicResult = async (uid: string, result: any) => {
  if (!supabase) return false;
  const { error } = await supabase.from("academic_results").insert({ student_id: uid, ...result });
  return !error;
};

export const assignRemedialPlan = async (uid: string, subject: string, customPlan?: any[]) => {
  if (!supabase) return false;

  // Plan por defecto de Matemáticas (4 semanas)
  const defaultMathPlan = [
    { title: "Sesión 1: Factorización Básica", topic: "Identificar casos de factorización", duration: "25 min", status: "pending" },
    { title: "Sesión 2: Factorización Aplicada", topic: "Aplicar técnicas en ejercicios", duration: "25 min", status: "pending" },
    { title: "Sesión 3: Productos Notables", topic: "Binomios al cuadrado y diferencia de cuadrados", duration: "25 min", status: "pending" },
    { title: "Sesión 4: Evaluación Semana 1", topic: "Evaluación de factorización", duration: "25 min", status: "pending" },
    { title: "Sesión 5: Ecuaciones Lineales", topic: "Resolver ecuaciones de primer grado", duration: "25 min", status: "pending" },
    { title: "Sesión 6: Ecuaciones con Fracciones", topic: "Ecuaciones con denominadores", duration: "25 min", status: "pending" },
    { title: "Sesión 7: Sistemas de Ecuaciones", topic: "Método de sustitución", duration: "25 min", status: "pending" },
    { title: "Sesión 8: Evaluación Semana 2", topic: "Evaluación de ecuaciones", duration: "25 min", status: "pending" },
    { title: "Sesión 9: Funciones Lineales", topic: "Graficación y pendiente", duration: "25 min", status: "pending" },
    { title: "Sesión 10: Funciones Cuadráticas", topic: "Parábolas y vértice", duration: "25 min", status: "pending" },
    { title: "Sesión 11: Transformaciones", topic: "Traslaciones y reflexiones", duration: "25 min", status: "pending" },
    { title: "Sesión 12: Evaluación Semana 3", topic: "Evaluación de funciones", duration: "25 min", status: "pending" },
    { title: "Sesión 13: Repaso General", topic: "Todos los temas", duration: "25 min", status: "pending" },
    { title: "Sesión 14: Examen Final", topic: "Evaluación completa de nivelación", duration: "45 min", status: "pending" }
  ];

  const planToSave = customPlan || defaultMathPlan;

  // Verificar si ya existe un plan para este estudiante
  const { data: existing } = await supabase
    .from("academic_results")
    .select("id")
    .eq("student_id", uid)
    .eq("subject", subject)
    .single();

  if (existing) {
    // Actualizar plan existente
    const { error } = await supabase
      .from("academic_results")
      .update({
        remedial_plan: planToSave,
        timestamp: new Date().toISOString()
      })
      .eq("id", existing.id);

    if (error) {
      console.error('Error actualizando plan:', error);
      return false;
    }
  } else {
    // Crear nuevo plan
    const { error } = await supabase
      .from("academic_results")
      .insert({
        student_id: uid,
        subject: subject,
        remedial_plan: planToSave,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Error creando plan:', error);
      return false;
    }
  }

  // console.log('✅ Plan de nivelación asignado a:', uid);
  return true;
};

// Guardar WhatsApp del acudiente
export const saveGuardianPhone = async (uid: string, phone: string) => {
  if (!supabase) return false;

  const cleanPhone = phone.replace(/\D/g, ''); // Solo números

  const { error } = await supabase
    .from("profiles")
    .update({ guardian_phone: cleanPhone })
    .eq("id", uid);

  if (error) {
    console.error('Error guardando teléfono:', error);
    return false;
  }

  // console.log('📱 WhatsApp del acudiente guardado:', cleanPhone);
  return true;
};

// Obtener WhatsApp del acudiente
export const getGuardianPhone = async (uid: string) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("guardian_phone")
    .eq("id", uid)
    .single();

  if (error || !data) return null;
  return data.guardian_phone;
};

// Generar link de WhatsApp con reporte
export const generateWhatsAppLink = (phone: string, studentName: string, report: {
  sessionTitle: string;
  score?: number;
  feedback?: string;
  date: string;
}) => {
  // Limpiar teléfono (solo números)
  let cleanPhone = phone.replace(/\D/g, '');

  // Agregar código de país si no lo tiene (Colombia por defecto)
  if (cleanPhone.length === 10) {
    cleanPhone = '57' + cleanPhone;
  }

  // Construir mensaje
  const message = `
📚 *NOVA SCHOLA - Reporte de Tutoría*

👤 *Estudiante:* ${studentName}
📅 *Fecha:* ${report.date}
📖 *Sesión:* ${report.sessionTitle}
${report.score !== undefined ? `📊 *Nota de Tarea:* ${report.score}%` : ''}
${report.score !== undefined && report.score >= 90 ? '✅ *Estado:* Aprobado - Puede continuar' : ''}
${report.score !== undefined && report.score < 90 ? '⚠️ *Estado:* Necesita refuerzo' : ''}

${report.feedback ? `💬 *Feedback del Tutor:*\n${report.feedback}` : ''}

---
_Reporte generado automáticamente por Nova Schola AI_
  `.trim();

  // Codificar mensaje para URL
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

// Generar link de Email para Docente
export const generateTeacherEmailLink = (studentName: string, report: {
  sessionTitle: string;
  score?: number;
  feedback?: string;
  date: string;
}) => {
  const subject = `Reporte de Progreso Nova Schola: ${studentName}`;
  const body = `
Estimado Docente,

Comparto el reporte de progreso de ${studentName} en la sesión "${report.sessionTitle}".

📅 Fecha: ${report.date}
📖 Sesión: ${report.sessionTitle}
📊 Calificación: ${report.score !== undefined ? report.score + '%' : 'N/A'}
${report.score !== undefined && report.score >= 90 ? '✅ Estado: Aprobado' : '⚠️ Estado: Refuerzo sugerido'}

💬 Observaciones del Tutor AI:
${report.feedback || 'Sin comentarios adicionales.'}

Atentamente,
Plataforma Nova Schola
  `.trim();

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

// Obtener reportes de sesiones para Admin (con info del acudiente)
export const getSessionReportsForAdmin = async () => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("lesson_progress")
    .select(`
      *,
      profiles:student_id (
        name,
        email,
        guardian_phone
      )
    `)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error obteniendo reportes:', error);
    return [];
  }

  return data || [];
};

// Obtener plan de nivelación de un estudiante
export const getStudentRemedialPlan = async (uid: string) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("academic_results")
    .select("*")
    .eq("student_id", uid)
    .not("remedial_plan", "is", null)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
};

// Actualizar progreso de una sesión del plan
export const updateRemedialSessionStatus = async (uid: string, sessionIndex: number, newStatus: string) => {
  if (!supabase) return false;

  const { data: current } = await supabase
    .from("academic_results")
    .select("id, remedial_plan")
    .eq("student_id", uid)
    .not("remedial_plan", "is", null)
    .single();

  if (!current || !current.remedial_plan) return false;

  const updatedPlan = [...current.remedial_plan];
  if (updatedPlan[sessionIndex]) {
    updatedPlan[sessionIndex].status = newStatus;
  }

  const { error } = await supabase
    .from("academic_results")
    .update({ remedial_plan: updatedPlan })
    .eq("id", current.id);

  return !error;
};
export const unlockDailySession = async (uid: string) => true;

/* ===================================================
   TRACKING DE PROGRESO DE CLASES
=================================================== */

export const startLessonSession = async (
  studentId: string,
  lessonId: string,
  lessonTitle: string,
  subject: string
) => {
  if (!supabase) return null;

  // console.log('🎓 Iniciando sesión:', { studentId, lessonId, lessonTitle });

  const { data, error } = await supabase
    .from("lesson_progress")
    .insert({
      student_id: studentId,
      lesson_id: lessonId,
      lesson_title: lessonTitle,
      subject: subject,
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error iniciando sesión:', error);
    return null;
  }

  // console.log('✅ Sesión iniciada:', data);
  return data;
};

export const completeLessonSession = async (
  studentId: string,
  lessonId: string,
  sessionData: {
    score?: number;
    timeSpentMinutes?: number;
    feedback?: string;
    homeworkSubmitted?: boolean;
    homeworkScore?: number;
  }
) => {
  if (!supabase) return false;

  const canContinue = (sessionData.homeworkScore || 0) >= 90;

  // console.log('🏁 Completando sesión:', { studentId, lessonId, ...sessionData, canContinue });

  const { error } = await supabase
    .from("lesson_progress")
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      score: sessionData.score,
      time_spent_minutes: sessionData.timeSpentMinutes,
      feedback: sessionData.feedback,
      homework_submitted: sessionData.homeworkSubmitted || false,
      homework_score: sessionData.homeworkScore,
      can_continue: canContinue
    })
    .eq('student_id', studentId)
    .eq('lesson_id', lessonId)
    .eq('status', 'in_progress');

  if (error) {
    console.error('❌ Error completando sesión:', error);
    return false;
  }

  // console.log('✅ Sesión completada. Puede continuar:', canContinue);
  return true;
};

export const saveHomeworkGrade = async (
  studentId: string,
  lessonId: string,
  score: number,
  feedback: string
) => {
  if (!supabase) return { score: 0, canContinue: false };

  const canContinue = score >= 90;

  // console.log('📝 Guardando nota de tarea:', { studentId, lessonId, score, canContinue });

  const { error } = await supabase
    .from("lesson_progress")
    .update({
      homework_submitted: true,
      homework_score: score,
      can_continue: canContinue,
      feedback: feedback
    })
    .eq('student_id', studentId)
    .eq('lesson_id', lessonId);

  if (error) {
    console.error('❌ Error guardando nota:', error);
    return { score: 0, canContinue: false };
  }

  // console.log('✅ Tarea calificada: ' + score + '%. Puede continuar: ' + canContinue);
  return { score, canContinue };
};

export const getStudentProgress = async (studentId: string) => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("student_id", studentId)
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo progreso:', error);
    return [];
  }

  return data || [];
};

export const canStudentContinue = async (studentId: string, currentLessonId: string) => {
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("can_continue, homework_score")
    .eq("student_id", studentId)
    .eq("lesson_id", currentLessonId)
    .single();

  if (error || !data) return false;

  return data.can_continue === true;
};

export const getStudentProgressSummary = async (studentId: string) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("student_id", studentId)
    .order('started_at', { ascending: true });

  if (error || !data || data.length === 0) return null;

  const completed = data.filter(d => d.status === 'completed').length;
  const total = data.length;
  const scores = data.filter(d => d.homework_score != null).map(d => d.homework_score);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const lastSession = data[data.length - 1];

  return {
    totalSessions: total,
    completedSessions: completed,
    averageScore: Math.round(avgScore),
    lastSessionDate: lastSession?.completed_at || lastSession?.started_at,
    lastSessionTitle: lastSession?.lesson_title,
    canContinue: lastSession?.can_continue || false,
    sessions: data
  };
};

export const saveSessionFeedback = async (feedback: string, completed: boolean, uid: string) => {
  if (!supabase) return false;

  const { data: currentSession } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("student_id", uid)
    .eq("status", "in_progress")
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (!currentSession) {
    // console.log('⚠️ No hay sesión activa, creando registro');
    const { error } = await supabase
      .from("lesson_progress")
      .insert({
        student_id: uid,
        lesson_id: 'feedback-' + Date.now(),
        lesson_title: 'Sesión General',
        subject: 'General',
        status: completed ? 'completed' : 'in_progress',
        feedback: feedback,
        completed_at: completed ? new Date().toISOString() : null
      });
    return !error;
  }

  const { error } = await supabase
    .from("lesson_progress")
    .update({
      status: completed ? 'completed' : 'in_progress',
      completed_at: completed ? new Date().toISOString() : null,
      feedback: feedback
    })
    .eq('id', currentSession.id);

  if (error) {
    console.error('❌ Error guardando feedback:', error);
    return false;
  }

  // console.log('✅ Feedback guardado');
  return true;
};

/* ===================================================
   HOMEWORK
=================================================== */

export const submitHomework = async (uid: string, weekId: string, fileName: string) => {
  if (!supabase) return false;
  const { error } = await supabase.from("homework_submissions").insert({
    student_id: uid, week_id: weekId, file_name: fileName, status: 'submitted', timestamp: new Date().toISOString()
  });
  return !error;
};

export const fetchHomeworkSubmissions = async (uid: string) => {
  if (!supabase) return [];
  const { data, error } = await supabase.from("homework_submissions").select("*").eq("student_id", uid).order('timestamp', { ascending: false });
  if (error) return [];
  return data;
};

/* ===================================================
   GESTION USUARIOS
=================================================== */

export const getAllStudents = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('profiles').select('*').eq('role', 'STUDENT');

  if (error) {
    console.error("Error fetching students:", error);
    return [];
  }

  if (!data) return [];

  return data.map(s => ({
    uid: s.id,     // Primary mapping
    id: s.id,      // Backward compatibility
    name: s.name || s.email?.split('@')[0] || 'Estudiante',
    email: s.email || '',
    level: s.level || 'TEEN',
    guardian_phone: s.guardian_phone,
    account_status: s.account_status || 'active'
  }));
};

// --- ADMIN USER MANAGEMENT ---

export const adminCreateUser = async (email: string, password: string, name: string, guardianPhone: string, gradeLevel: number = 3) => {
  if (!supabase) return { success: false, error: 'No connection' };

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      data: { name, role: 'STUDENT', level: 'primary', gradeLevel } // Default metadata
    }
  });

  if (authError) return { success: false, error: authError.message };
  if (!authData.user) return { success: false, error: 'No user created' };

  // 2. Update profile with specific fields that might not be set by trigger
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      name,
      role: 'STUDENT',
      level: 'primary',
      grade_level: gradeLevel,
      guardian_phone: guardianPhone,
      must_change_password: true
    })
    .eq('id', authData.user.id);

  if (profileError) console.error('Error updating profile:', profileError);

  // 3. Initialize economy
  await supabase.from('economy').upsert({ user_id: authData.user.id, coins: 200 }, { onConflict: 'user_id' });

  return {
    success: true,
    uid: authData.user.id,
    isVerified: !!authData.session,
    message: authData.session
      ? "Usuario creado y logueado."
      : "Usuario creado. Se requiere verificación de correo (revisar configuración de Supabase)."
  };
};

export const adminUpdateUserStatus = async (uid: string, status: string) => {
  if (!supabase) return false;
  // Map 'Inactivo' to profile flag 'is_active'
  const isActive = status === 'Activo';
  const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', uid);
  return !error;
};

export const updateStudentLevel = async (uid: string, newLevel: string) => {
  if (!supabase) return false;

  const { error } = await supabase
    .from('profiles')
    .update({ level: newLevel })
    .eq('id', uid);

  if (error) {
    console.error('Error updating student level:', error);
    return false;
  }
  return true;
};

export const deleteStudentProfile = async (uid: string) => {
  if (!supabase) return { success: false, error: 'Supabase no inicializado' };

  // Try using the secure RPC function first (handles cascades)
  const { data, error: rpcError } = await supabase.rpc('delete_student_completely', { target_user_id: uid });

  if (!rpcError && data === true) {
    return { success: true };
  }

  console.warn('RPC delete failed, trying fallback delete...', rpcError);

  // Fallback: Standard delete (might fail if foreign keys exist)
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', uid);

  if (error) {
    console.error('Error deleting student profile:', error);
    const rpcMsg = rpcError?.message || 'RPC returned false';
    return { success: false, error: `${rpcMsg} | ${error.message}` };
  }
  return { success: true };
};

export const adminUpdateUserPlan = async (uid: string, plan: string) => {
  if (!supabase) return false;
  const { error } = await supabase.from('profiles').update({ plan: plan }).eq('id', uid);
  return !error;
};

export const adminDeleteUser = async (uid: string) => {
  // Caution: This usually requires Service Role key to delete from Auth. 
  // With anon key, we can only update profile to inactive.
  if (!supabase) return false;
  // We'll mark as inactive for safety unless we have an Edge Function.
  // But let's try calling the delete endpoint usually restricted.
  // Ideally, this should be soft-delete.
  const { error } = await supabase.from('profiles').update({ is_active: false, name: 'USUARIO ELIMINADO' }).eq('id', uid);
  return !error;
};

export const adminGetAllProfiles = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'STUDENT')
    .order('created_at', { ascending: false });

  if (error) return [];

  // Fetch economy for each
  const enriched = await Promise.all(data.map(async (p) => {
    const eco = await getUserEconomy(p.id);
    return {
      ...p,
      coins: eco.coins,
      status: p.is_active !== false ? 'Activo' : 'Inactivo', // Default to Active if null
      plan: p.plan || 'BASIC'
    };
  }));

  return enriched;
};

export const adminGetPendingUsers = async () => {
  if (!supabase) return [];

  // Fetch students and parents who are pending
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['STUDENT', 'PARENT'])
    .eq('account_status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending users:', error);
    return [];
  }

  // Enrich with economy and potential parent info
  const enriched = await Promise.all((users || []).map(async (s) => {
    const eco = await getUserEconomy(s.id);

    let parentName = "Sin Padre";
    if (s.parent_id) {
      const { data: parent } = await supabase.from('profiles').select('name').eq('id', s.parent_id).single();
      if (parent) parentName = parent.name;
    }

    return {
      ...s,
      coins: eco?.coins ?? 0,
      parentName,
      joinedAt: s.created_at
    };
  }));

  return enriched;
};

export const adminActivateSubscription = async (userId: string) => {
  // Delegates to server-side endpoint that uses SUPABASE_SERVICE_ROLE_KEY,
  // which bypasses RLS and can actually update other users' profiles.
  try {
    const res = await fetch('/api/admin/activate-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error('[adminActivateSubscription] server error:', body);
      return false;
    }
    const body = await res.json();
    if (!body.emailSent) {
      console.warn('[adminActivateSubscription] activation ok but email not sent:', body.emailError ?? body.reason);
    }
    return body.success === true;
  } catch (err) {
    console.error('[adminActivateSubscription] fetch error:', err);
    return false;
  }
};

export const updateGlobalConfig = async (roomCheckEnabled: boolean) => {
  if (!supabase) return false;
  const { error } = await supabase.from('app_settings').upsert({ key: 'room_check_enabled', value: roomCheckEnabled, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  return !error;
};

export const fetchGlobalConfig = async () => {
  if (!supabase) return true;
  const { data } = await supabase.from('app_settings').select('value').eq('key', 'room_check_enabled').single();
  return data ? data.value : true;
};

/* ===================================================
   MENSAJERIA
=================================================== */

export const sendFlashMessage = async (msg: AppMessage) => {
  if (!supabase) return false;
  // console.log('📤 Enviando mensaje a:', msg.receiverId);

  // 1. Guardar en base de datos
  const { error: dbError } = await supabase.from('messages').insert({
    sender_id: msg.senderId,
    sender_name: msg.senderName,
    receiver_id: msg.receiverId,
    content: msg.content,
    type: msg.type,
    read: false,
    created_at: new Date().toISOString()
  });

  if (dbError) {
    console.error('Error guardando mensaje:', dbError);
  }

  // 2. Enviar por Realtime Broadcast para notificación instantánea
  try {
    const channel = supabase.channel(`flash-${msg.receiverId}`);
    await channel.subscribe();
    await new Promise(r => setTimeout(r, 100));
    await channel.send({ type: 'broadcast', event: 'flash', payload: msg });
    setTimeout(() => supabase.removeChannel(channel), 1000);
  } catch (e) {
    // console.log('Broadcast opcional falló, mensaje guardado en DB');
  }

  return true;
};

export const subscribeToMessages = (userId: string, callback: (msg: AppMessage) => void) => {
  if (!supabase) return () => { };
  // console.log('📡 Suscribiendo a mensajes:', userId);

  // Suscribirse a Broadcast
  const channel = supabase
    .channel(`flash-${userId}`)
    .on('broadcast', { event: 'flash' }, (payload) => {
      console.log('📥 Mensaje recibido (broadcast):', payload);
      callback(payload.payload as AppMessage);
    })
    .subscribe();

  // También suscribirse a cambios en la tabla messages
  const dbChannel = supabase
    .channel(`messages-db-${userId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` },
      (payload) => {
        console.log('📥 Mensaje recibido (DB):', payload);
        const msg = payload.new;
        callback({
          id: msg.id,
          senderId: msg.sender_id,
          senderName: msg.sender_name,
          receiverId: msg.receiver_id,
          content: msg.content,
          type: msg.type,
          timestamp: msg.created_at,
          read: msg.read
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
    supabase.removeChannel(dbChannel);
  };
};

// Obtener mensajes para Admin (tickets de soporte)
export const getAdminMessages = async () => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('type', 'SUPPORT_TICKET') // Simplified query to avoid UUID issues with 'ADMIN_INBOX'
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error obteniendo mensajes:', JSON.stringify(error));
    return [];
  }

  return data.map((msg: any) => ({
    id: msg.id,
    senderId: msg.sender_id,
    senderName: msg.sender_name,
    receiverId: msg.receiver_id,
    content: msg.content,
    type: msg.type,
    timestamp: msg.created_at,
    read: msg.read
  }));
};

// Marcar mensaje como leído
export const markMessageAsRead = async (messageId: string) => {
  if (!supabase) return false;

  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId);

  return !error;
};

// Suscribirse a nuevos tickets (para Admin)
export const subscribeToAdminMessages = (callback: (msg: AppMessage) => void) => {
  if (!supabase) return () => { };
  console.log('📡 Admin suscrito a tickets de soporte');

  const channel = supabase
    .channel('admin-messages')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        const msg = payload.new;
        // Solo notificar tickets de soporte o mensajes para admin
        if (msg.type === 'SUPPORT_TICKET' || msg.receiver_id === 'ADMIN_INBOX') {
          console.log('📥 Nuevo ticket de soporte:', payload);
          callback({
            id: msg.id,
            senderId: msg.sender_id,
            senderName: msg.sender_name,
            receiverId: msg.receiver_id,
            content: msg.content,
            type: msg.type,
            timestamp: msg.created_at,
            read: msg.read
          });
        }
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
};

/* ===================================================
   DEBUG
=================================================== */

export const checkSupabaseConnection = async () => {
  if (!supabase) return { success: false, message: "No inicializado" };
  const { error } = await supabase.from('profiles').select('count').limit(1);
  if (error) return { success: false, message: error.message };
  return { success: true, message: "Conexion OK" };
};

/* ===================================================
   PHASE 1: LANGUAGE & AGE PREFERENCES
=================================================== */

export const updateLanguagePreference = async (userId: string, language: 'es' | 'en' | 'bilingual') => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('profiles')
    .update({ language_preference: language })
    .eq('id', userId);
  return !error;
};

export const updateStudentAge = async (userId: string, age: number) => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('profiles')
    .update({ student_age: age })
    .eq('id', userId);
  return !error;
};

export const getUserPreferences = async (userId: string) => {
  if (!supabase) return { language: 'es', age: 8, tts_settings: {} };
  const { data, error } = await supabase
    .from('profiles')
    .select('language_preference, student_age, tts_settings')
    .eq('id', userId)
    .single();

  if (error || !data) return { language: 'es', age: 8, tts_settings: {} };

  return {
    language: data.language_preference || 'es',
    age: data.student_age || 8,
    tts_settings: data.tts_settings || {}
  };
};

/* ===================================================
   PHASE 1: STEP VALIDATION TRACKING
=================================================== */

export const createStepValidationSession = async (
  studentId: string,
  problemId: string,
  problemTitle: string,
  subject: string,
  totalSteps: number
) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('step_validations')
    .insert({
      student_id: studentId,
      problem_id: problemId,
      problem_title: problemTitle,
      subject: subject,
      total_steps: totalSteps,
      current_step: 1,
      completed_steps: 0,
      steps_data: []
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating validation session:', error);
    return null;
  }

  return data;
};

export const updateStepValidation = async (
  sessionId: string,
  stepNumber: number,
  isValid: boolean,
  attempts: number,
  hintsUsed: number,
  studentWorkSnapshot?: string,
  novaGuidanceSnapshot?: string
) => {
  if (!supabase) return false;

  // Get current session data
  const { data: session } = await supabase
    .from('step_validations')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (!session) return false;

  // Update steps data
  const stepsData = Array.isArray(session.steps_data) ? session.steps_data : [];
  stepsData.push({
    step: stepNumber,
    validated: isValid,
    attempts: attempts,
    timestamp: new Date().toISOString()
  });

  // Update snapshots
  const studentSnapshots = Array.isArray(session.student_work_snapshots) ? session.student_work_snapshots : [];
  const novaSnapshots = Array.isArray(session.nova_guidance_snapshots) ? session.nova_guidance_snapshots : [];

  if (studentWorkSnapshot) studentSnapshots.push(studentWorkSnapshot);
  if (novaGuidanceSnapshot) novaSnapshots.push(novaGuidanceSnapshot);

  const { error } = await supabase
    .from('step_validations')
    .update({
      current_step: isValid ? stepNumber + 1 : stepNumber,
      completed_steps: isValid ? session.completed_steps + 1 : session.completed_steps,
      steps_data: stepsData,
      attempts_count: session.attempts_count + attempts,
      hints_used: session.hints_used + hintsUsed,
      student_work_snapshots: studentSnapshots,
      nova_guidance_snapshots: novaSnapshots
    })
    .eq('id', sessionId);

  return !error;
};

export const completeStepValidationSession = async (sessionId: string) => {
  if (!supabase) return false;

  // Get session data to calculate scores
  const { data: session } = await supabase
    .from('step_validations')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (!session) return false;

  // Calculate accuracy score (first attempt success rate)
  const stepsData = Array.isArray(session.steps_data) ? session.steps_data : [];
  const firstAttemptSuccess = stepsData.filter((s: any) => s.attempts === 1 && s.validated).length;
  const accuracyScore = session.total_steps > 0 ? (firstAttemptSuccess / session.total_steps) * 100 : 0;

  // Calculate help score (penalize for hints and multiple attempts)
  const baseScore = (session.completed_steps / session.total_steps) * 100;
  const hintPenalty = session.hints_used * 5; // 5% penalty per hint
  const attemptPenalty = (session.attempts_count - session.total_steps) * 2; // 2% penalty per extra attempt
  const helpScore = Math.max(0, baseScore - hintPenalty - attemptPenalty);

  // Calculate time spent
  const startedAt = new Date(session.started_at);
  const completedAt = new Date();
  const timeSpentMinutes = Math.round((completedAt.getTime() - startedAt.getTime()) / 60000);

  const { error } = await supabase
    .from('step_validations')
    .update({
      status: 'completed',
      completed_at: completedAt.toISOString(),
      time_spent_minutes: timeSpentMinutes,
      accuracy_score: accuracyScore,
      help_score: helpScore
    })
    .eq('id', sessionId);

  return !error;
};

export const getStudentStepValidations = async (studentId: string, limit: number = 10) => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('step_validations')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching validations:', error);
    return [];
  }

  return data || [];
};

export const getDBAPerformance = async () => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('step_validations')
      .select('subject, accuracy_score');

    if (error) {
      console.error("Error fetching DBA performance:", error);
      return [];
    }

    const subjects: Record<string, { totalScore: number, count: number }> = {};
    data?.forEach(item => {
      if (!item.subject) return;
      if (!subjects[item.subject]) subjects[item.subject] = { totalScore: 0, count: 0 };
      subjects[item.subject].totalScore += item.accuracy_score || 0;
      subjects[item.subject].count += 1;
    });

    return Object.entries(subjects).map(([name, stats]) => ({
      name,
      score: Math.round(stats.totalScore / stats.count)
    }));
  } catch (e) {
    return [];
  }
};



/* ===================================================
   PHASE 2: RESEARCH SYSTEM FUNCTIONS
=================================================== */

import { ResearchSource, PlagiarismCheck, ParaphrasingAttempt, ResearchSession } from "../types";

// ===== RESEARCH SOURCES =====

export const saveResearchSource = async (source: Omit<ResearchSource, 'id' | 'createdAt'>) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const { data, error } = await supabase
    .from("research_sources")
    .insert({
      user_id: source.userId,
      project_id: source.projectId,
      title: source.title,
      author: source.author,
      url: source.url,
      domain: source.domain,
      date_accessed: source.dateAccessed,
      date_published: source.datePublished,
      notes: source.notes,
      highlights: source.highlights,
      screenshots: source.screenshots,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getResearchSources = async (userId: string, projectId?: string): Promise<ResearchSource[]> => {
  if (!supabase) return [];

  let query = supabase
    .from("research_sources")
    .select("*")
    .eq("user_id", userId);

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    title: row.title,
    author: row.author,
    url: row.url,
    domain: row.domain,
    dateAccessed: row.date_accessed,
    datePublished: row.date_published,
    notes: row.notes,
    highlights: row.highlights || [],
    screenshots: row.screenshots || [],
    createdAt: row.created_at,
  }));
};

export const updateResearchSource = async (id: string, updates: Partial<ResearchSource>) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const updateData: any = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.author !== undefined) updateData.author = updates.author;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.highlights !== undefined) updateData.highlights = updates.highlights;
  if (updates.screenshots !== undefined) updateData.screenshots = updates.screenshots;

  const { data, error } = await supabase
    .from("research_sources")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteResearchSource = async (id: string) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const { error } = await supabase
    .from("research_sources")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
};

// ===== RESEARCH SESSIONS =====

export const saveResearchSession = async (session: Omit<ResearchSession, 'id' | 'createdAt'>) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const { data, error } = await supabase
    .from("research_sessions")
    .insert({
      user_id: session.userId,
      project_id: session.projectId,
      start_time: session.startTime,
      end_time: session.endTime,
      visited_urls: session.visitedUrls,
      saved_highlights: session.savedHighlights,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateResearchSession = async (id: string, updates: Partial<ResearchSession>) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const updateData: any = {};
  if (updates.endTime !== undefined) updateData.end_time = updates.endTime;
  if (updates.visitedUrls !== undefined) updateData.visited_urls = updates.visitedUrls;
  if (updates.savedHighlights !== undefined) updateData.saved_highlights = updates.savedHighlights;

  const { data, error } = await supabase
    .from("research_sessions")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getResearchSessions = async (userId: string, projectId?: string) => {
  if (!supabase) return [];

  let query = supabase
    .from("research_sessions")
    .select("*")
    .eq("user_id", userId);

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query.order("start_time", { ascending: false });

  if (error) throw error;
  return data || [];
};

// ===== PLAGIARISM CHECKS =====

export const savePlagiarismCheck = async (check: PlagiarismCheck) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const { data, error } = await supabase
    .from("plagiarism_checks")
    .insert({
      id: check.id,
      user_id: check.userId,
      project_id: check.projectId,
      student_text: check.studentText,
      source_ids: check.sources.map(s => s.id),
      overall_similarity: check.results.overallSimilarity,
      matches: check.results.matches,
      timestamp: check.timestamp,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPlagiarismChecks = async (userId: string, projectId?: string) => {
  if (!supabase) return [];

  let query = supabase
    .from("plagiarism_checks")
    .select("*")
    .eq("user_id", userId);

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query.order("timestamp", { ascending: false });

  if (error) throw error;
  return data || [];
};

// ===== PARAPHRASING HISTORY =====

export const saveParaphrasingAttempt = async (attempt: ParaphrasingAttempt) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const { data, error } = await supabase
    .from("paraphrasing_history")
    .insert({
      id: attempt.id,
      user_id: attempt.userId,
      project_id: attempt.projectId,
      original_text: attempt.originalText,
      paraphrased_versions: attempt.paraphrasedVersions,
      selected_version: attempt.selectedVersion,
      timestamp: attempt.timestamp,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getParaphrasingHistory = async (userId: string, projectId?: string) => {
  if (!supabase) return [];

  let query = supabase
    .from("paraphrasing_history")
    .select("*")
    .eq("user_id", userId);

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query.order("timestamp", { ascending: false });

  if (error) throw error;
  return data || [];
};

// ===== RESEARCH PROJECTS =====

export const createResearchProject = async (userId: string, title: string, description?: string, subject?: string, dueDate?: string) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const { data, error } = await supabase
    .from("research_projects")
    .insert({
      user_id: userId,
      title,
      description,
      subject,
      due_date: dueDate,
      status: 'in_progress',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getResearchProjects = async (userId: string) => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("research_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateResearchProject = async (id: string, updates: any) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const { data, error } = await supabase
    .from("research_projects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ===== RESEARCH STATISTICS =====

export const getResearchStats = async (userId: string) => {
  if (!supabase) return null;

  const { data, error } = await supabase.rpc('get_research_stats', { user_uuid: userId });

  if (error) {
    console.error('Error fetching research stats:', error);
    return null;
  }

  return data;
};

// ===== PARENT/TEACHER MONITORING =====

export const getStudentResearchActivity = async (studentId: string, startDate?: string, endDate?: string) => {
  if (!supabase) return null;

  try {
    // Get all research activity for a student
    const [sources, sessions, plagiarismChecks, paraphrasingAttempts] = await Promise.all([
      getResearchSources(studentId),
      getResearchSessions(studentId),
      getPlagiarismChecks(studentId),
      getParaphrasingHistory(studentId),
    ]);

    return {
      sources,
      sessions,
      plagiarismChecks,
      paraphrasingAttempts,
      summary: {
        totalSources: sources.length,
        totalSessions: sessions.length,
        totalChecks: plagiarismChecks.length,
        totalParaphrases: paraphrasingAttempts.length,
        averageSimilarity: plagiarismChecks.length > 0
          ? plagiarismChecks.reduce((sum: number, check: any) => sum + check.overall_similarity, 0) / plagiarismChecks.length
          : 0,
      },
    };
  } catch (error) {
    console.error('Error fetching student research activity:', error);
    return null;
  }
};

/* ===================================================
   ARENA DE JUEGOS (QUESTS)
================================================== */

import { ArenaQuest } from '../data/arenaMockData';

export const fetchArenaQuests = async (grade: number): Promise<ArenaQuest[]> => {
  if (!supabase) return [];

  // Fetch quests suitable for this grade
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .lte('min_grade', grade)
    .gte('max_grade', grade);

  if (error) {
    console.error('Error fetching quests:', error);
    return [];
  }

  // Map DB fields to ArenaQuest interface
  return data.map((row: any) => ({
    id: row.id,
    title: { en: row.title_en, es: row.title_es },
    description: { en: row.description_en, es: row.description_es },
    difficulty: row.difficulty,
    category: row.category,
    reward: { coins: row.reward_coins, xp: row.reward_xp },
    duration: row.duration_minutes,
    minPlayers: 1, // Default for now
    maxPlayers: 1, // Default for now
    icon: row.icon,
    dbaReference: row.dba_reference,
    minGrade: row.min_grade,
    maxGrade: row.max_grade,
    challenge: row.challenge_data // JSONB matches the structure
  }));
};

export const fetchUserQuestProgress = async (uid: string): Promise<string[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('user_quest_progress')
    .select('quest_id')
    .eq('user_id', uid);

  if (error) return [];
  return data.map((r: any) => r.quest_id);
};

export const completeQuest = async (uid: string, quest: ArenaQuest) => {
  if (!supabase) return false;

  // 1. Check if already completed
  const { data: existing } = await supabase
    .from('user_quest_progress')
    .select('id')
    .eq('user_id', uid)
    .eq('quest_id', quest.id)
    .single();

  if (existing) return true; // Already done

  // 2. Mark as complete
  const { error: insertError } = await supabase
    .from('user_quest_progress')
    .insert({ user_id: uid, quest_id: quest.id });

  if (insertError) {
    console.error('Error completing quest:', insertError);
    return false;
  }

  // 3. Award Coins (Server-side accumulation)
  // We use the economy table update method we already have
  await adminAwardCoins(uid, quest.reward.coins);

  return true;
};

/* ===================================================
   CURRICULUM SYNC - Upload School Plans
=================================================== */

export const uploadCurriculumPlan = async (
  studentId: string,
  file: File,
  metadata: {
    title: string;
    schoolName?: string;
    gradeLevel?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  // 1. Upload file to Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${studentId}/${Date.now()}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('curriculum-plans')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  // 2. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('curriculum-plans')
    .getPublicUrl(fileName);

  // 3. Insert plan record
  const { data: planData, error: planError } = await supabase
    .from('student_curriculum_plans')
    .insert({
      student_id: studentId,
      title: metadata.title,
      school_name: metadata.schoolName,
      grade_level: metadata.gradeLevel,
      start_date: metadata.startDate,
      end_date: metadata.endDate,
      original_file_url: publicUrl,
      status: 'processing'
    })
    .select()
    .single();

  if (planError) throw planError;

  return planData;
};

export const processCurriculumPlan = async (planId: string, fileUrl: string, language: 'es' | 'en' = 'es') => {
  if (!supabase) throw new Error("Sistema desconectado.");

  // Dynamic import to avoid circular dependency
  const { extractCurriculumTopics } = await import('./ai_service');

  // 1. Extract topics using AI
  const topics = await extractCurriculumTopics(fileUrl, language);

  if (topics.length === 0) {
    // Update plan status to error
    await supabase
      .from('student_curriculum_plans')
      .update({ status: 'error' })
      .eq('id', planId);
    throw new Error('No se pudieron extraer temas del documento');
  }

  // 2. Insert topics into database
  const topicsToInsert = topics.map((topic: any, index: number) => ({
    plan_id: planId,
    week_number: topic.week_number || index + 1,
    start_date: topic.estimated_start_date,
    topic_name: topic.topic_name,
    mapped_internal_topic: topic.mapped_internal_topic,
    description: topic.description,
    status: 'pending'
  }));

  const { error: topicsError } = await supabase
    .from('curriculum_topics')
    .insert(topicsToInsert);

  if (topicsError) throw topicsError;

  // 3. Update plan status to active
  await supabase
    .from('student_curriculum_plans')
    .update({ status: 'active' })
    .eq('id', planId);

  return topics;
};

export const getCurriculumPlans = async (studentId: string) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const { data, error } = await supabase
    .from('student_curriculum_plans')
    .select('*, curriculum_topics(*)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getCurrentWeekTopic = async (studentId: string) => {
  if (!supabase) return null;

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('curriculum_topics')
    .select('*, student_curriculum_plans!inner(student_id)')
    .eq('student_curriculum_plans.student_id', studentId)
    .eq('student_curriculum_plans.status', 'active')
    .lte('start_date', today)
    .order('start_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    topic_name: data.topic_name,
    mapped_topic: data.mapped_internal_topic,
    description: data.description
  };
};

/* ===================================================
   GOOGLE CLASSROOM SYNC
=================================================== */

export const saveGoogleTokens = async (userId: string, tokens: any) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  let expiresAt: Date;
  if (tokens.expiry_date) {
    expiresAt = new Date(tokens.expiry_date);
  } else if (tokens.expires_in) {
    expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  } else {
    expiresAt = new Date(Date.now() + 3599 * 1000); // Default 1h
  }

  const { error } = await supabase
    .from('google_classroom_tokens')
    .upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
};

export const getGoogleTokens = async (userId: string) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('google_classroom_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data;
};

export const syncGoogleClassroomCourses = async (userId: string, courses: any[]) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const coursesToInsert = courses.map(course => ({
    user_id: userId,
    google_course_id: course.id,
    name: course.name,
    section: course.section,
    description: course.descriptionHeading,
    teacher_name: course.ownerId, // Could be enhanced with teacher lookup
    is_active: course.courseState === 'ACTIVE'
  }));

  const { error } = await supabase
    .from('google_classroom_courses')
    .upsert(coursesToInsert, { onConflict: 'user_id,google_course_id' });

  if (error) throw error;
};

export const syncGoogleClassroomAssignments = async (userId: string, assignments: any[]) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  console.log('DEBUG: Iniciando sync de', assignments.length, 'tareas');

  // First, get course mappings
  const { data: courses } = await supabase
    .from('google_classroom_courses')
    .select('id, google_course_id')
    .eq('user_id', userId);

  console.log('DEBUG: Cursos encontrados en DB:', courses?.length);

  const courseMap = new Map(courses?.map(c => [c.google_course_id, c.id]) || []);

  const assignmentsToInsert = assignments.map(assignment => {
    const courseId = courseMap.get(assignment.courseId);
    if (!courseId) console.warn('DEBUG: Curso no encontrado para tarea:', assignment.title);

    return {
      user_id: userId,
      course_id: courseId, // Puede ser undefined si no se sincronizó el curso antes
      google_assignment_id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.dueDate ? new Date(
        assignment.dueDate.year,
        assignment.dueDate.month - 1,
        assignment.dueDate.day
      ).toISOString() : null,
      max_points: assignment.maxPoints,
      state: assignment.state,
      submission_state: assignment.submissionState || 'NEW', // New field from Classroom API
      work_type: assignment.workType,
      updated_at: new Date().toISOString()
    }
  });

  // Filtrar tareas que no tengan curso válido
  const validAssignments = assignmentsToInsert.filter(a => a.course_id);
  console.log('DEBUG: Tareas válidas a insertar:', validAssignments.length);

  if (validAssignments.length === 0) return;

  const { error } = await supabase
    .from('google_classroom_assignments')
    .upsert(validAssignments, { onConflict: 'user_id,google_assignment_id' });

  if (error) {
    console.error('DEBUG: Error insertando tareas:', error);
    throw error;
  } else {
    console.log('DEBUG: Tareas insertadas correctamente.');
  }
};

export const getGoogleClassroomAssignments = async (userId: string) => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('google_classroom_assignments')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const subscribeToClassroomAssignments = (userId: string, onUpdate: () => void) => {
  if (!supabase) return () => { };

  const channel = supabase
    .channel(`classroom-${userId}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'google_classroom_assignments', filter: `user_id=eq.${userId}` },
      () => {
        onUpdate();
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
};


/* ===================================================
   MOODLE SYNC
=================================================== */

export const saveMoodleCredentials = async (userId: string, moodleUrl: string, moodleToken: string, siteName?: string) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const { error } = await supabase
    .from('moodle_credentials')
    .upsert({
      user_id: userId,
      moodle_url: moodleUrl,
      moodle_token: moodleToken,
      site_name: siteName,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (error) throw error;
};

export const getMoodleCredentials = async (userId: string) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('moodle_credentials')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data;
};

export const syncMoodleAssignments = async (userId: string, assignments: Array<{
  id: number;
  name: string;
  intro?: string;
  duedate: number;
  grade: number;
  course: number;
  courseName: string;
  courseShortname?: string;
}>) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const toInsert = assignments.map(a => ({
    user_id: userId,
    moodle_assignment_id: String(a.id),
    course_id: a.course,
    course_name: a.courseName,
    course_shortname: a.courseShortname,
    title: a.name,
    description: a.intro || null,
    due_date: a.duedate > 0 ? new Date(a.duedate * 1000).toISOString() : null,
    max_points: a.grade > 0 ? a.grade : null,
    updated_at: new Date().toISOString()
  }));

  if (toInsert.length === 0) return;

  const { error } = await supabase
    .from('moodle_assignments')
    .upsert(toInsert, { onConflict: 'user_id,moodle_assignment_id' });

  if (error) throw error;
};

export const getMoodleAssignments = async (userId: string) => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('moodle_assignments')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const deleteMoodleCredentials = async (userId: string) => {
  if (!supabase) return;
  await supabase.from('moodle_credentials').delete().eq('user_id', userId);
  await supabase.from('moodle_assignments').delete().eq('user_id', userId);
};

export const claimClassroomRewards = async (userId: string) => {
  if (!supabase) return [];

  // 1. Fetch turned in but NOT claimed assignments
  const { data, error } = await supabase
    .from('google_classroom_assignments')
    .select('id, title, google_assignment_id')
    .eq('user_id', userId)
    .eq('submission_state', 'TURNED_IN')
    .eq('reward_claimed', false);

  if (error || !data || data.length === 0) return [];

  // 2. Mark them as claimed
  const ids = data.map(a => a.id);
  const { error: updateError } = await supabase
    .from('google_classroom_assignments')
    .update({ reward_claimed: true })
    .in('id', ids);

  if (updateError) {
    console.error('Error marking rewards as claimed:', updateError);
    return [];
  }

  return data;
};

export const assignParentMission = async (mission: {
  student_id: string;
  parent_id: string;
  title: string;
  category: string;
  reward_coins: number;
  reward_xp: number;
  metadata?: any;
}) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const { error } = await supabase
    .from('parent_missions')
    .insert([mission]);

  if (error) throw error;
};



export const fetchParentMissions = async (studentId: string) => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('parent_missions')
    .select('*')
    .eq('student_id', studentId)
    .eq('is_completed', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const completeParentMission = async (missionId: string) => {
  if (!supabase) throw new Error("Sistema desconectado.");

  // 1. Get mission details to know student and rewards
  const { data: mission, error: fetchError } = await supabase
    .from('parent_missions')
    .select('student_id, reward_coins, reward_xp, title, is_completed')
    .eq('id', missionId)
    .single();

  if (fetchError || !mission) throw new Error("Misión no encontrada");
  if (mission.is_completed) return; // Avoid double reward

  // 2. Mark as complete
  const { error: updateError } = await supabase
    .from('parent_missions')
    .update({
      is_completed: true,
      completed_at: new Date().toISOString()
    })
    .eq('id', missionId);

  if (updateError) throw updateError;

  // 3. Award Rewards
  await adminAwardCoins(mission.student_id, mission.reward_coins);
  await adminAwardXP(mission.student_id, mission.reward_xp);

  console.log(`✅ Misión "${mission.title}" completada y recompensada.`);
};

export const getParentMissionsForParent = async (studentId: string) => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('parent_missions')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
};

export const subscribeToParentMissions = (studentId: string, onUpdate: () => void) => {
  if (!supabase) return () => { };

  const channel = supabase
    .channel(`parent-missions-${studentId}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'parent_missions', filter: `student_id=eq.${studentId}` },
      () => {
        onUpdate();
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
};


export const updateStudentPreferences = async (userId: string, interests: string[], animals: string[]) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .update({
      learning_interests: interests,
      favorite_animals: animals
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating preferences:', error);
    return null;
  }
  return data;
};

export const getStudentPreferences = async (userId: string) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('learning_interests, favorite_animals')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching preferences:', error);
    return null;
  }
  return data;
};
