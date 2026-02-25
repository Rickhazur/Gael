// WhatsApp Progress Reporting Service
// Sends automated progress reports to parents via WhatsApp API

export interface StudentProgress {
    studentId: string;
    studentName: string;
    grade: number;
    sessionDate: Date;
    topicsPracticed: string[];
    questionsAttempted: number;
    questionsCorrect: number;
    questionsIncorrect: number;
    accuracyRate: number;
    strugglingTopics: string[];
    remediationSuggested: boolean;
    remediationTopics: string[];
    timeSpent: number; // in minutes
    achievements: string[];
}

export interface ParentContact {
    parentName: string;
    parentPhone: string; // WhatsApp number with country code
    studentId: string;
    language: 'es' | 'en';
    reportFrequency: 'daily' | 'weekly' | 'session'; // When to send reports
}

// WhatsApp API Configuration (using Twilio or similar)
const WHATSAPP_API_URL = import.meta.env.VITE_WHATSAPP_API_URL || 'https://api.twilio.com/2010-04-01/Accounts';
const WHATSAPP_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const WHATSAPP_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const WHATSAPP_FROM_NUMBER = import.meta.env.VITE_WHATSAPP_FROM_NUMBER || 'whatsapp:+14155238886';

// Generate progress report message
export const generateProgressReport = (progress: StudentProgress, language: 'es' | 'en'): string => {
    const {
        studentName,
        grade,
        topicsPracticed,
        questionsAttempted,
        questionsCorrect,
        accuracyRate,
        strugglingTopics,
        remediationSuggested,
        remediationTopics,
        timeSpent,
        achievements
    } = progress;

    if (language === 'es') {
        let message = `📊 *Reporte de Progreso - Nova Tutor*\n\n`;
        message += `👤 *Estudiante:* ${studentName} (Grado ${grade})\n`;
        message += `📅 *Fecha:* ${new Date().toLocaleDateString('es-ES')}\n`;
        message += `⏱️ *Tiempo de práctica:* ${timeSpent} minutos\n\n`;

        message += `📚 *Temas practicados:*\n`;
        topicsPracticed.forEach(topic => {
            message += `  • ${topic}\n`;
        });

        message += `\n📈 *Rendimiento:*\n`;
        message += `  ✅ Respuestas correctas: ${questionsCorrect}/${questionsAttempted}\n`;
        message += `  📊 Tasa de precisión: ${accuracyRate}%\n`;

        if (strugglingTopics.length > 0) {
            message += `\n⚠️ *Áreas que necesitan refuerzo:*\n`;
            strugglingTopics.forEach(topic => {
                message += `  • ${topic}\n`;
            });
        }

        if (remediationSuggested) {
            message += `\n💡 *Recomendación del tutor:*\n`;
            message += `Se sugiere repasar los siguientes temas:\n`;
            remediationTopics.forEach(topic => {
                message += `  • ${topic}\n`;
            });
        }

        if (achievements.length > 0) {
            message += `\n🏆 *Logros de hoy:*\n`;
            achievements.forEach(achievement => {
                message += `  ⭐ ${achievement}\n`;
            });
        }

        message += `\n✨ *Nova Schola - Educación Personalizada*`;

        return message;
    } else {
        let message = `📊 *Progress Report - Nova Tutor*\n\n`;
        message += `👤 *Student:* ${studentName} (Grade ${grade})\n`;
        message += `📅 *Date:* ${new Date().toLocaleDateString('en-US')}\n`;
        message += `⏱️ *Practice time:* ${timeSpent} minutes\n\n`;

        message += `📚 *Topics practiced:*\n`;
        topicsPracticed.forEach(topic => {
            message += `  • ${topic}\n`;
        });

        message += `\n📈 *Performance:*\n`;
        message += `  ✅ Correct answers: ${questionsCorrect}/${questionsAttempted}\n`;
        message += `  📊 Accuracy rate: ${accuracyRate}%\n`;

        if (strugglingTopics.length > 0) {
            message += `\n⚠️ *Areas needing reinforcement:*\n`;
            strugglingTopics.forEach(topic => {
                message += `  • ${topic}\n`;
            });
        }

        if (remediationSuggested) {
            message += `\n💡 *Tutor recommendation:*\n`;
            message += `We suggest reviewing the following topics:\n`;
            remediationTopics.forEach(topic => {
                message += `  • ${topic}\n`;
            });
        }

        if (achievements.length > 0) {
            message += `\n🏆 *Today's achievements:*\n`;
            achievements.forEach(achievement => {
                message += `  ⭐ ${achievement}\n`;
            });
        }

        message += `\n✨ *Nova Schola - Personalized Education*`;

        return message;
    }
};

// Send WhatsApp message via Twilio
export const sendWhatsAppReport = async (
    parentContact: ParentContact,
    progress: StudentProgress
): Promise<boolean> => {
    try {
        const message = generateProgressReport(progress, parentContact.language);
        const toNumber = `whatsapp:${parentContact.parentPhone}`;

        // Twilio API call
        const response = await fetch(
            `${WHATSAPP_API_URL}/${WHATSAPP_ACCOUNT_SID}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(`${WHATSAPP_ACCOUNT_SID}:${WHATSAPP_AUTH_TOKEN}`)
                },
                body: new URLSearchParams({
                    From: WHATSAPP_FROM_NUMBER,
                    To: toNumber,
                    Body: message
                })
            }
        );

        if (response.ok) {
            // console.log(`✅ WhatsApp report sent to ${parentContact.parentName} (${parentContact.parentPhone})`);
            return true;
        } else {
            const error = await response.text();
            console.error(`❌ Failed to send WhatsApp report:`, error);
            return false;
        }
    } catch (error) {
        console.error('❌ WhatsApp API Error:', error);
        return false;
    }
};

/**
 * Enhanced function to send report directly from a TutorReport object
 * This maps TutorReport fields to the WhatsApp format
 */
export const sendWhatsAppTutorReport = async (
    uid: string,
    report: any // TutorReport
): Promise<boolean> => {
    try {
        const { supabase } = await import('./supabase');
        if (!supabase) return false;

        // 1. Fetch Profile info (Student Name & Parent Phone & Notification Toggle)
        const { data: profile, error: profError } = await supabase
            .from('profiles')
            .select('name, guardian_phone, grade_level, whatsapp_notifications_enabled')
            .eq('id', uid)
            .single();

        if (profError || !profile || !profile.guardian_phone) {
            console.warn('⚠️ No parent phone found for student:', uid);
            return false;
        }

        // Check if notifications are disabled
        if (profile.whatsapp_notifications_enabled === false) {
            // console.log('🔕 WhatsApp notifications are disabled for this user');
            return false;
        }


        // 2. Map TutorReport to StudentProgress format
        const progress: StudentProgress = {
            studentId: uid,
            studentName: profile.name || 'Estudiante',
            grade: profile.grade_level || 3,
            sessionDate: new Date(),
            topicsPracticed: [report.subject],
            questionsAttempted: 10, // Mocked for now, TutorReport doesn't have it
            questionsCorrect: Math.round((report.overallScore / 100) * 10),
            questionsIncorrect: 10 - Math.round((report.overallScore / 100) * 10),
            accuracyRate: report.overallScore,
            strugglingTopics: report.challenges?.map((c: any) => c.area) || [],
            remediationSuggested: (report.recommendations?.length || 0) > 0,
            remediationTopics: report.recommendations || [],
            timeSpent: 20, // Mocked
            achievements: []
        };

        const contact: ParentContact = {
            parentName: 'Padre/Madre',
            parentPhone: profile.guardian_phone,
            studentId: uid,
            language: 'es',
            reportFrequency: 'session'
        };

        return await sendWhatsAppReport(contact, progress);
    } catch (err) {
        console.error('Error in sendWhatsAppTutorReport:', err);
        return false;
    }
};

// Send immediate safety alert to parents
export const sendSafetyAlert = async (
    parentContact: ParentContact,
    studentName: string,
    content: string
): Promise<boolean> => {
    try {
        const message = `🚨 *ALERTA DE SEGURIDAD - Nova Schola*\n\n` +
            `Estimado(a) ${parentContact.parentName},\n\n` +
            `Se ha detectado una consulta inapropiada por parte de *${studentName}* en el Tutor Estelar.\n\n` +
            `💬 *Contenido detectado:* "${content}"\n\n` +
            `Nova Schola ha emitido una advertencia al estudiante y ha pausado la interacción sobre este tema. Le recomendamos conversar con su hijo(a) sobre el uso responsable de la plataforma.\n\n` +
            `✨ *Nova Schola - Cuidando su educación.*`;

        const toNumber = `whatsapp:${parentContact.parentPhone}`;

        const response = await fetch(
            `${WHATSAPP_API_URL}/${WHATSAPP_ACCOUNT_SID}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(`${WHATSAPP_ACCOUNT_SID}:${WHATSAPP_AUTH_TOKEN}`)
                },
                body: new URLSearchParams({
                    From: WHATSAPP_FROM_NUMBER,
                    To: toNumber,
                    Body: message
                })
            }
        );

        return response.ok;
    } catch (error) {
        console.error('❌ Error sending safety alert:', error);
        return false;
    }
};

// Check if report should be sent based on frequency
export const shouldSendReport = (
    frequency: 'daily' | 'weekly' | 'session',
    lastReportDate?: Date
): boolean => {
    if (frequency === 'session') {
        return true; // Send after every session
    }

    if (!lastReportDate) {
        return true; // First report
    }

    const now = new Date();
    const daysSinceLastReport = Math.floor(
        (now.getTime() - lastReportDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (frequency === 'daily') {
        return daysSinceLastReport >= 1;
    }

    if (frequency === 'weekly') {
        return daysSinceLastReport >= 7;
    }

    return false;
};

// Calculate achievements based on performance
export const calculateAchievements = (progress: StudentProgress, language: 'es' | 'en'): string[] => {
    const achievements: string[] = [];

    if (progress.accuracyRate >= 90) {
        achievements.push(
            language === 'es'
                ? '¡Excelente precisión! (90%+)'
                : 'Excellent accuracy! (90%+)'
        );
    }

    if (progress.questionsAttempted >= 20) {
        achievements.push(
            language === 'es'
                ? '¡Gran dedicación! (20+ preguntas)'
                : 'Great dedication! (20+ questions)'
        );
    }

    if (progress.timeSpent >= 30) {
        achievements.push(
            language === 'es'
                ? '¡Sesión de práctica extendida! (30+ minutos)'
                : 'Extended practice session! (30+ minutes)'
        );
    }

    if (progress.strugglingTopics.length === 0) {
        achievements.push(
            language === 'es'
                ? '¡Dominio completo de todos los temas!'
                : 'Complete mastery of all topics!'
        );
    }

    return achievements;
};

// Store progress in database (Supabase integration)
// Store progress in database (Supabase integration)
export const saveProgressToDatabase = async (progress: StudentProgress): Promise<boolean> => {
    try {
        // 1. Local Persistence (Immediate Memory)
        localStorage.setItem('nova_last_session', JSON.stringify({
            date: new Date().toISOString(),
            strugglingTopics: progress.strugglingTopics,
            achievements: progress.achievements
        }));

        // console.log('📝 Saving progress to database:', progress);

        // TODO: Implement Supabase insert when table is ready
        // const { data, error } = await supabase
        //   .from('student_progress')
        //   .insert([progress]);

        return true;
    } catch (error) {
        console.error('❌ Database save error:', error);
        return false;
    }
};
