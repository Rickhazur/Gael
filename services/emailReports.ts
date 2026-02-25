import { StudentProgress } from './whatsappReports';

export interface EmailContact {
    parentName: string;
    parentEmail: string;
    studentId: string;
    language: 'es' | 'en';
}

/**
 * Generate a beautiful HTML email report
 */
export const generateEmailReportHTML = (progress: StudentProgress, language: 'es' | 'en'): string => {
    const isEs = language === 'es';

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
                  color: white; padding: 40px 20px; border-radius: 16px; text-align: center; margin-bottom: 24px; }
        .card { background: #ffffff; padding: 24px; margin: 16px 0; 
                border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .stat-box { background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center; }
        .stat-value { display: block; font-size: 24px; font-weight: bold; color: #4f46e5; }
        .stat-label { font-size: 14px; color: #6b7280; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600; }
        .badge-success { background: #d1fae5; color: #065f46; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .footer { text-align: center; color: #9ca3af; margin-top: 40px; font-size: 14px; }
        h2 { color: #111827; margin-top: 0; font-size: 18px; display: flex; align-items: center; gap: 8px; }
        .list-item { margin: 8px 0; display: flex; align-items: flex-start; gap: 8px; }
        .bullet { color: #4f46e5; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">${isEs ? '📊 Reporte de Progreso' : '📊 Progress Report'}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">
                ${isEs ? `Estudiante: ${progress.studentName}` : `Student: ${progress.studentName}`}
            </p>
        </div>
        
        <div class="card">
            <h2>📈 ${isEs ? 'Resumen de la Sesión' : 'Session Summary'}</h2>
            <div style="display: table; width: 100%; border-spacing: 12px;">
                <div style="display: table-row;">
                    <div style="display: table-cell; background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; width: 50%;">
                        <span style="display: block; font-size: 20px; font-weight: bold; color: #4f46e5;">${progress.timeSpent} min</span>
                        <span style="font-size: 12px; color: #6b7280; text-transform: uppercase;">${isEs ? 'Tiempo' : 'Time'}</span>
                    </div>
                    <div style="display: table-cell; background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; width: 50%;">
                        <span style="display: block; font-size: 20px; font-weight: bold; color: #10b981;">${progress.accuracyRate}%</span>
                        <span style="font-size: 12px; color: #6b7280; text-transform: uppercase;">${isEs ? 'Precisión' : 'Accuracy'}</span>
                    </div>
                </div>
            </div>
            
            <p style="margin-top: 20px;">
                ${isEs ? 'Temas practicados:' : 'Topics practiced:'}
                <div style="margin-top: 8px;">
                    ${progress.topicsPracticed.map(t => `<span class="badge badge-success" style="margin-right: 5px; margin-bottom: 5px;">${t}</span>`).join('')}
                </div>
            </p>
        </div>

        ${progress.strugglingTopics.length > 0 ? `
        <div class="card" style="border-left: 4px solid #ef4444;">
            <h2 style="color: #ef4444;">⚠️ ${isEs ? 'Áreas de Refuerzo' : 'Areas for Improvement'}</h2>
            <p>${isEs ? 'Se recomienda repasar los siguientes temas:' : 'We recommend reviewing the following topics:'}</p>
            <ul style="padding-left: 20px; margin: 10px 0;">
                ${progress.strugglingTopics.map(t => `<li style="margin-bottom: 5px;">${t}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        ${progress.achievements.length > 0 ? `
        <div class="card" style="border-left: 4px solid #f59e0b;">
            <h2 style="color: #d97706;">🏆 ${isEs ? 'Logros Alcanzados' : 'Achievements'}</h2>
            <ul style="list-style: none; padding: 0;">
                ${progress.achievements.map(a => `<li style="margin-bottom: 10px;">⭐ ${a}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        <div class="card">
            <h2>💡 ${isEs ? 'Siguiente Paso' : 'Next Step'}</h2>
            <p>${isEs
            ? 'Nova continuará adaptando las lecciones para fortalecer los puntos débiles identificados mientras mantiene el entusiasmo en sus fortalezas.'
            : 'Nova will continue adapting lessons to strengthen identified weak points while maintaining excitement in their strengths.'}
            </p>
        </div>
        
        <div class="footer">
            <p>${isEs ? 'Generado por Nova Schola' : 'Generated by Nova Schola'}</p>
            <p>${isEs ? '© 2026 Nova Schola. Todos los derechos reservados.' : '© 2026 Nova Schola. All rights reserved.'}</p>
        </div>
    </div>
</body>
</html>
    `;
};

/**
 * Send the email report using the /api/send-email endpoint
 */
export const sendEmailReport = async (
    contact: EmailContact,
    progress: StudentProgress
): Promise<boolean> => {
    try {
        const html = generateEmailReportHTML(progress, contact.language);
        const subject = contact.language === 'es'
            ? `📊 Reporte de Progreso: ${progress.studentName}`
            : `📊 Progress Report: ${progress.studentName}`;

        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: contact.parentEmail,
                subject: subject,
                html: html
            }),
        });

        if (response.ok) {
            console.log(`✅ Email report sent to ${contact.parentName} (${contact.parentEmail})`);
            return true;
        } else {
            const error = await response.json();
            console.error(`❌ Failed to send email report:`, error);
            return false;
        }
    } catch (error) {
        console.error('❌ Email Reporting Error:', error);
        return false;
    }
};

/**
 * High-level function to send an email report based on a TutorReport
 */
export const sendEmailTutorReport = async (
    uid: string,
    report: any // TutorReport
): Promise<boolean> => {
    try {
        const { supabase } = await import('./supabase');
        if (!supabase) return false;

        // 1. Fetch Profile info (Student Name & Parent Info)
        const { data: profile, error: profError } = await supabase
            .from('profiles')
            .select('name, parent_id, grade_level')
            .eq('id', uid)
            .single();

        if (profError || !profile) {
            console.warn('⚠️ No profile found for student:', uid);
            return false;
        }

        // 2. Fetch Parent Email
        if (!profile.parent_id) {
            // Check if student has their own email
            const { data: authUser } = await supabase.auth.getUser();
            if (authUser.user?.id === uid && authUser.user.email) {
                // Send to student directly if no parent linked
                const progress: StudentProgress = mapReportToProgress(uid, profile, report);
                return await sendEmailReport({
                    parentName: profile.name,
                    parentEmail: authUser.user.email,
                    studentId: uid,
                    language: 'es'
                }, progress);
            }
            console.warn('⚠️ No parent linked and no student email found for:', uid);
            return false;
        }

        const { data: parent, error: parentError } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', profile.parent_id)
            .single();

        if (parentError || !parent || !parent.email) {
            console.warn('⚠️ No parent email found for parent_id:', profile.parent_id);
            return false;
        }

        // 3. Map Report to Progress
        const progress: StudentProgress = mapReportToProgress(uid, profile, report);

        const contact: EmailContact = {
            parentName: parent.name || 'Padre/Madre',
            parentEmail: parent.email,
            studentId: uid,
            language: 'es'
        };

        return await sendEmailReport(contact, progress);
    } catch (err) {
        console.error('Error in sendEmailTutorReport:', err);
        return false;
    }
};

/**
 * Helper to map TutorReport to StudentProgress
 */
function mapReportToProgress(uid: string, profile: any, report: any): StudentProgress {
    return {
        studentId: uid,
        studentName: profile.name || 'Estudiante',
        grade: profile.grade_level || 3,
        sessionDate: new Date(),
        topicsPracticed: [report.subject],
        questionsAttempted: 10,
        questionsCorrect: Math.round((report.overallScore / 100) * 10),
        questionsIncorrect: 10 - Math.round((report.overallScore / 100) * 10),
        accuracyRate: report.overallScore,
        strugglingTopics: report.challenges?.map((c: any) => c.area) || [],
        remediationSuggested: (report.recommendations?.length || 0) > 0,
        remediationTopics: report.recommendations || [],
        timeSpent: 20,
        achievements: []
    };
}
/**
 * Generate a persuasive trial end notice HTML
 */
export const generateTrialEndNoticeHTML = (parentName: string, studentName: string, language: 'es' | 'en'): string => {
    const isEs = language === 'es';

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
        .header { background: #1e1b4b; color: white; padding: 40px 20px; border-radius: 20px 20px 0 0; }
        .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 20px 20px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .price-tag { font-size: 48px; font-weight: 900; color: #4f46e5; margin: 20px 0; }
        .button { display: inline-block; padding: 16px 32px; background: #4f46e5; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 18px; margin: 20px 0; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3); }
        .footer { color: #9ca3af; margin-top: 30px; font-size: 12px; }
        .check { color: #10b981; font-weight: bold; margin-right: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🚀 ${isEs ? '¡Tu semana de prueba ha terminado!' : 'Your trial week has ended!'}</h1>
        </div>
        <div class="content">
            <p style="font-size: 18px;">${isEs ? `Hola ${parentName},` : `Hello ${parentName},`}</p>
            <p>
                ${isEs
            ? `Esperamos que <b>${studentName}</b> haya disfrutado su primera semana con Nova Schola. Hemos visto grandes avances en su proceso bilingüe.`
            : `We hope <b>${studentName}</b> enjoyed their first week with Nova Schola. We've seen great progress in their bilingual journey.`}
            </p>
            
            <p style="font-weight: bold;">${isEs ? 'No dejes que el impulso se detenga:' : 'Don\'t let the momentum stop:'}</p>
            
            <div style="text-align: left; background: #f8fafc; padding: 20px; border-radius: 16px; margin: 20px 0;">
                <div style="margin-bottom: 10px;"><span class="check">✓</span> ${isEs ? 'Tutoría Ilimitada 24/7' : 'Unlimited 24/7 Tutoring'}</div>
                <div style="margin-bottom: 10px;"><span class="check">✓</span> ${isEs ? 'Reportes de Progreso Detallados' : 'Detailed Progress Reports'}</div>
                <div style="margin-bottom: 10px;"><span class="check">✓</span> ${isEs ? 'Inmersión Total en Inglés Académico' : 'Full Academic English Immersion'}</div>
                <div><span class="check">✓</span> ${isEs ? 'Gamificación y Motivación' : 'Gamification & Motivation'}</div>
            </div>

            <p>${isEs ? 'Activa tu membresía mensual por solo' : 'Activate your monthly membership for only'}</p>
            <div class="price-tag">$49,900 COP</div>
            
            <a href="https://novaschola.app/subscription" class="button">
                ${isEs ? '¡Continuar Aprendiendo!' : 'Continue Learning!'}
            </a>
            
            <p style="font-size: 14px; color: #6b7280;">
                ${isEs
            ? 'Menos de lo que cuesta una hora de un tutor tradicional por todo un mes de IA.'
            : 'Less than what one hour with a traditional tutor costs, for a full month of AI.'}
            </p>
        </div>
        <div class="footer">
            <p>Nova Schola AI Academy<br>${isEs ? 'Excelencia Bilingüe a tu Alcance' : 'Bilingual Excellence Within Reach'}</p>
        </div>
    </div>
</body>
</html>
    `;
};

/**
 * Send the trial end notice
 */
export const sendTrialEndNotice = async (
    parentEmail: string,
    parentName: string,
    studentName: string,
    language: 'es' | 'en' = 'es'
): Promise<boolean> => {
    try {
        const html = generateTrialEndNoticeHTML(parentName, studentName, language);
        const subject = language === 'es'
            ? `🚀 ¡El futuro de ${studentName} comienza hoy!`
            : `🚀 ${studentName}'s future starts today!`;

        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: parentEmail,
                subject: subject,
                html: html
            }),
        });

        return response.ok;
    } catch (error) {
        console.error('❌ Error sending trial end notice:', error);
        return false;
    }
};
