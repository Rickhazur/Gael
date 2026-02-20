/**
 * Mensajes de error y estados vacíos centralizados.
 * Mantiene tono consistente ES/EN y evita copy disperso.
 */
export type Lang = 'es' | 'en';

export const ERROR_MESSAGES = {
    network: (lang: Lang) =>
        lang === 'es'
            ? 'No pudimos conectar. Revisa tu conexión e intenta de nuevo.'
            : "We couldn't connect. Check your connection and try again.",
    save: (lang: Lang) =>
        lang === 'es'
            ? 'No se pudo guardar. Revisa tu conexión o inicia sesión.'
            : "Could not save. Check your connection or log in.",
    load: (lang: Lang) =>
        lang === 'es'
            ? 'No pudimos cargar. Revisa tu conexión.'
            : "We couldn't load. Check your connection.",
    missions: (lang: Lang) =>
        lang === 'es'
            ? 'No pudimos cargar las misiones. Revisa tu conexión. Si tu colegio usa Google Classroom, aparecerán aquí cuando se vincule.'
            : "We couldn't load missions. Check your connection. If your school uses Google Classroom, they'll appear here once linked.",
    sync: (lang: Lang) =>
        lang === 'es'
            ? 'No se pudo sincronizar. Revisa tu conexión. La sincronización estará disponible cuando tu colegio vincule Google Classroom.'
            : "Could not sync. Check your connection. Sync will be available when your school links Google Classroom.",
    analyze: (lang: Lang) =>
        lang === 'es'
            ? 'No pudimos analizar. Intenta de nuevo.'
            : "We couldn't analyze. Try again.",
    loginRequired: (lang: Lang) =>
        lang === 'es' ? 'Debes iniciar sesión.' : 'You must log in.',
} as const;

export const EMPTY_STATE_MESSAGES = {
    missions: (lang: Lang) =>
        lang === 'es'
            ? 'Tus misiones aparecerán aquí. Si tu colegio usa Google Classroom, se sincronizarán cuando se vincule. Mientras tanto, explora la Arena o el Tutor de Matemáticas.'
            : "Your missions will appear here. If your school uses Google Classroom, they'll sync when linked. Meanwhile, explore the Arena or Math Tutor.",
} as const;
