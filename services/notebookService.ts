import { supabase } from './supabase';
import { toast } from 'sonner';
import { ERROR_MESSAGES } from '../utils/errorMessages';

/**
 * Al guardar una nota (matemáticas, inglés, investigación, etc.) se crea o reutiliza
 * el cuaderno de esa materia en la biblioteca (getOrCreateNotebook). Así, cada vez
 * que el usuario guarda trabajo en cualquier materia, tiene su cuaderno en la biblioteca.
 */

export interface NoteData {
    topic: string;
    date: string;
    summary: string;
    boardImage?: string | null;
    subject: string;
    highlights?: string[];
    type?: 'note' | 'diagnostic'; // Added 'diagnostic' type
}

/** Prefijos de tema por tipo de operación (máx. 5 notas por operación en el cuaderno). */
const MATH_OPERATION_TOPIC_PREFIX: Record<string, string> = {
    fraction: 'Fracciones - ',
    addition: 'Suma - ',
    subtraction: 'Resta - ',
    multiplication: 'Multiplicación - ',
    division: 'División - ',
    percentage: 'Porcentajes - ',
    decimal: 'Decimales - ',
    geometry: 'Geometría - '
};

/** Conceptos clave y datos clave por operación para el cuaderno. */
export const MATH_OPERATION_KEY_CONCEPTS: Record<string, { topic: string; summary: string }> = {
    fraction: {
        topic: 'Fracciones',
        summary: 'MCM: Mínimo Común Múltiplo. Fracciones homogéneas: mismo denominador, se suman/restan numeradores. Heterogéneas: hallar MCM, amplificar cada fracción, luego operar numeradores. Simplificar al final.'
    },
    addition: {
        topic: 'Suma',
        summary: 'Sumar de derecha a izquierda (unidades, decenas…). Llevadas: si la suma de una columna ≥ 10, se lleva 1 a la siguiente.'
    },
    subtraction: {
        topic: 'Resta',
        summary: 'Restar de derecha a izquierda. Si el de arriba es menor, se pide prestado al vecino (se resta 1 y se suman 10).'
    },
    multiplication: {
        topic: 'Multiplicación',
        summary: 'Multiplicar de derecha a izquierda. Productos parciales por cada dígito del multiplicador. Luego sumar los parciales.'
    },
    division: {
        topic: 'División',
        summary: 'Dividir, multiplicar (cociente × divisor), restar, bajar siguiente cifra. Repetir hasta terminar o obtener decimales.'
    },
    percentage: {
        topic: 'Porcentajes',
        summary: 'Porcentaje = parte de 100. Convertir a decimal (÷100) o fracción. Luego multiplicar por la base.'
    },
    decimal: {
        topic: 'Decimales',
        summary: 'Alinear las comas. Operar como enteros y volver a colocar la coma según los decimales originales.'
    },
    geometry: {
        topic: 'Geometría',
        summary: 'Perímetro del rectángulo: 2×(largo+ancho). Área del rectángulo: largo×ancho.'
    }
};

const MAX_NOTES_PER_OPERATION = 5;

export const notebookService = {
    /** Guarda la nota y crea el cuaderno en la biblioteca si no existe (getOrCreateNotebook). */
    async saveNote(note: NoteData, options?: { silent?: boolean }) {
        try {
            const { data: { user } } = await (supabase as any).auth.getUser();
            if (!user) {
                if (!options?.silent) toast.error("Please log in to save notes.");
                return null;
            }

            let notebookId;
            try {
                notebookId = await this.getOrCreateNotebook(user.id, note.subject);
            } catch (nbError) {
                console.error("Notebook creation failed:", nbError);
                throw new Error("Could not create notebook");
            }

            const payload = {
                student_id: user.id,
                notebook_id: notebookId,
                topic: note.topic || "Untitled Note",
                date: note.date,
                subject: note.subject,
                summary: note.summary || "",
            };

            const { data, error } = await (supabase as any)
                .from('notes')
                .insert(payload)
                .select()
                .single();

            if (error) {
                console.error("Supabase insert error:", error);
                throw error;
            }

            if (!options?.silent) {
                toast.success(
                    window.location.pathname.includes('/en/')
                        ? "Note saved to your notebook!"
                        : "¡Apunte guardado en tu cuaderno!"
                );
            }

            return data;
        } catch (error: any) {
            console.error("FINAL SAVE ERROR:", error);
            if (!options?.silent) toast.error(ERROR_MESSAGES.save('es'));
            return null;
        }
    },

    /** Guarda una conversación con personaje histórico como nota en el cuaderno de Encuentros Extraordinarios */
    async saveConversation(
        userId: string,
        characterName: string,
        totalQuestions: number,
        totalCoins: number,
        durationMinutes: number,
        options?: { silent?: boolean }
    ) {
        try {
            if (!supabase) return null;

            const notebookId = await this.getOrCreateNotebook(userId, 'encounters');

            const date = new Date().toISOString().slice(0, 10);
            const summary = `Conversación socrática con ${characterName}. ${totalQuestions} preguntas profundas. Duración: ${durationMinutes} minutos. Ganaste ${totalCoins} monedas.`;

            const payload = {
                student_id: userId,
                notebook_id: notebookId,
                topic: `Speaking con ${characterName} 📞`,
                date,
                subject: 'encounters',
                summary,
                highlights: [
                    `${totalQuestions} preguntas`,
                    `${totalCoins} monedas`,
                    `${durationMinutes} min`
                ]
            };

            const { data, error } = await supabase
                .from('notes')
                .insert(payload)
                .select()
                .single();

            if (error) {
                console.error("Failed to save conversation:", error);
                return null;
            }

            if (!options?.silent) {
                console.log(`✅ Conversación guardada en tu cuaderno de Speaking`);
            }

            return data;
        } catch (error: any) {
            console.error("Exception saving conversation:", error);
            return null;
        }
    },

    /** Garantiza que exista un cuaderno por materia para el usuario; si no existe, lo crea en la biblioteca. */
    async getOrCreateNotebook(userId: string, subject: string) {
        // Try to find an existing notebook for this subject
        const { data: existing } = await (supabase as any)
            .from('notebooks')
            .select('id')
            .eq('student_id', userId)
            .eq('subject', subject)
            .eq('is_archived', false)
            .limit(1)
            .maybeSingle();

        if (existing) return (existing as any).id;

        // Create a new one if not found
        const defaultCovers: Record<string, { title: string, emoji: string, color: string }> = {
            math: { title: 'Matemáticas', emoji: '📗', color: '#8B5CF6' },
            english: { title: 'English', emoji: '📘', color: '#3B82F6' },
            science: { title: 'Ciencias', emoji: '📙', color: '#10B981' },
            history: { title: 'Historia', emoji: '📕', color: '#EF4444' },
            geography: { title: 'Geografía', emoji: '🌍', color: '#0EA5E9' },
            art: { title: 'Arte', emoji: '🎨', color: '#EC4899' },
            encounters: { title: 'Clase de Speaking', emoji: '🎤', color: '#F59E0B' },
            other: { title: 'Notas Varias', emoji: '📓', color: '#6B7280' }
        };

        const config = defaultCovers[subject] || defaultCovers.other;

        const { data: created, error } = await (supabase as any)
            .from('notebooks')
            .insert({
                student_id: userId,
                subject,
                title: config.title,
                cover_emoji: config.emoji,
                color: config.color,
                description: `Mis notas de ${config.title}`
            })
            .select('id')
            .single();

        if (error) throw error;
        return created.id;
    },

    /** Cuenta cuántas notas de matemáticas tiene el usuario con topic que empiece por el prefijo dado. */
    async countNotesByTopicPrefix(userId: string, subject: string, topicPrefix: string): Promise<number> {
        if (!supabase) return 0;
        const { count, error } = await (supabase as any)
            .from('notes')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', userId)
            .eq('subject', subject)
            .like('topic', topicPrefix + '%');
        if (error) return 0;
        return count ?? 0;
    },

    /**
     * Guarda en el cuaderno de matemáticas un ejercicio completado (datos clave y conceptos clave).
     * Solo guarda si hay menos de MAX_NOTES_PER_OPERATION notas para esa operación.
     */
    async saveMathExerciseIfAllowed(operationType: string, problemLabel?: string): Promise<boolean> {
        try {
            const { data: { user } } = await (supabase as any).auth.getUser();
            if (!user) return false;

            const prefix = MATH_OPERATION_TOPIC_PREFIX[operationType] || 'Matemáticas - ';
            const keyConcepts = MATH_OPERATION_KEY_CONCEPTS[operationType];
            const topic = (prefix + (problemLabel || keyConcepts?.topic || operationType)).slice(0, 100);
            const summary = keyConcepts?.summary || `Ejercicio de ${operationType}.`;

            const count = await this.countNotesByTopicPrefix(user.id, 'math', prefix);
            if (count >= MAX_NOTES_PER_OPERATION) return false;

            const note: NoteData = {
                topic,
                date: new Date().toISOString().slice(0, 10),
                summary,
                subject: 'math'
            };
            await this.saveNote(note, { silent: true });
            return true;
        } catch {
            return false;
        }
    }
};
