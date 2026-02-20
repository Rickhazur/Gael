/**

 * Frases de feedback de la Profe Luna/Lina cuando el niño o la niña contesta bien.

 * Variedad para no repetir siempre "¡Vas volando!" y a veces usar el nombre del estudiante.

 */



// Frases cortas de celebración (sin nombre) - español

const CORRECT_FEEDBACK_ES: string[] = [

    '¡Vas volando!',

    '¡Qué bien!',

    '¡Así se hace!',

    '¡Excelente!',

    '¡Muy bien!',

    '¡Genial!',

    '¡Perfecto!',

    '¡Lo lograste!',

    '¡Eso es!',

    '¡Bien hecho!',

    '¡Súper!',

    '¡Increíble!',

    '¡Me encanta cómo piensas!',

    '¡Eres un genio!',

    '¡Sigue así!',

    '¡Bravo!',

    '¡Campeón o campeona!',

    '¡Qué ojo!',

    '¡Exacto!',

    '¡Muy buena!',

];



// Frases con nombre - español (se sustituye {name} por el nombre del niño/niña)

const CORRECT_FEEDBACK_WITH_NAME_ES: string[] = [

    '¡Muy bien, {name}!',

    '¡Qué bien, {name}!',

    '¡Así se hace, {name}!',

    '¡Excelente, {name}!',

    '¡Genial, {name}!',

    '¡Perfecto, {name}!',

    '¡Lo lograste, {name}!',

    '¡Súper, {name}!',

    '¡Increíble, {name}!',

    '¡Sigue así, {name}!',

    '¡Bravo, {name}!',

    '¡Eres un genio, {name}!',

    '¡Exacto, {name}!',

];



// Frases cortas (sin nombre) - inglés

const CORRECT_FEEDBACK_EN: string[] = [

    "You're flying!",

    'Great job!',

    'Well done!',

    'Excellent!',

    'Very good!',

    'Perfect!',

    'You did it!',

    'That\'s it!',

    'Super!',

    'Incredible!',

    'Keep it up!',

    'Bravo!',

    'Exactly!',

];



// Frases con nombre - inglés

const CORRECT_FEEDBACK_WITH_NAME_EN: string[] = [

    'Well done, {name}!',

    'Excellent, {name}!',

    'Great job, {name}!',

    'Perfect, {name}!',

    'You did it, {name}!',

    'Super, {name}!',

    'Keep it up, {name}!',

];



/**

 * Devuelve una frase de feedback aleatoria cuando el estudiante contesta bien.

 * Si se pasa studentName, a veces usa una frase con el nombre (50% de probabilidad).

 */

export function getCorrectFeedback(lang: 'es' | 'en', studentName?: string): string {

    const useName = studentName && studentName.trim().length > 0 && Math.random() < 0.5;

    if (lang === 'es') {

        if (useName) {

            const phrase = CORRECT_FEEDBACK_WITH_NAME_ES[Math.floor(Math.random() * CORRECT_FEEDBACK_WITH_NAME_ES.length)];

            return phrase.replace(/\{name\}/g, studentName!.trim());

        }

        return CORRECT_FEEDBACK_ES[Math.floor(Math.random() * CORRECT_FEEDBACK_ES.length)];

    }

    if (useName) {

        const phrase = CORRECT_FEEDBACK_WITH_NAME_EN[Math.floor(Math.random() * CORRECT_FEEDBACK_WITH_NAME_EN.length)];

        return phrase.replace(/\{name\}/g, studentName!.trim());

    }

    return CORRECT_FEEDBACK_EN[Math.floor(Math.random() * CORRECT_FEEDBACK_EN.length)];

}



/**

 * Todas las frases fijas (sin nombre) para pre-grabar MP3 con Azure.

 * Usado por el script de generación de audio y por el mapa LOCAL_AUDIO_MAP.

 */

export function getAllFixedPhrasesForAudio(): { es: string[]; en: string[] } {

    return {

        es: [...CORRECT_FEEDBACK_ES],

        en: [...CORRECT_FEEDBACK_EN],

    };

}

