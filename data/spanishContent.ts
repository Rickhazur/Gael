/**
 * Spanish Tutor Content Library
 * Vocabulario, Retos de Gramática, Fragmentos de Historias, Pasajes de Lectura
 */

export interface SpanishWord {
    id: string;
    word: string;
    translation: string;
    tags: string[];
}

export interface SpanishGrammarChallenge {
    id: string;
    type: 'correct' | 'complete' | 'order';
    question: string;
    options?: string[];
    correctAnswer: string;
    hint: string;
    rule: string;
    tags: string[];
    grade?: number;
}

export interface SpanishStoryPiece {
    id: string;
    text: string;
    type: 'starter' | 'connector' | 'detail' | 'ending';
}

export interface SpanishReadingPassage {
    id: string;
    title: string;
    text: string;
    events: { id: string; text: string; correctOrder: number }[];
    mainIdeaOptions: string[];
    correctMainIdea: string;
    grade?: number;
}

// Vocabulario por categoría (MEN estándares)
export const spanishVocabularyLibrary: SpanishWord[] = [
    // Ciencias Naturales
    { id: 'sci-1', word: 'Ecosistema', translation: 'Sistema biológico constituido por una comunidad de organismos vivos.', tags: ['ciencias'] },
    { id: 'sci-2', word: 'Fotosíntesis', translation: 'Proceso químico que tiene lugar en las plantas con clorofila.', tags: ['ciencias'] },
    { id: 'sci-3', word: 'Biodiversidad', translation: 'Variedad de seres vivos que habitan en la Tierra.', tags: ['ciencias'] },
    { id: 'sci-4', word: 'Mamífero', translation: 'Animal vertebrado que amamanta a sus crías.', tags: ['ciencias'] },
    // Matemáticas
    { id: 'math-1', word: 'Dividendo', translation: 'Número que en la operación de dividir se divide por otro.', tags: ['matemáticas'] },
    { id: 'math-2', word: 'Geometría', translation: 'Parte de las matemáticas que estudia las figuras.', tags: ['matemáticas'] },
    { id: 'math-3', word: 'Fracción', translation: 'Número que expresa una cantidad determinada de porciones.', tags: ['matemáticas'] },
    // Lenguaje/General
    { id: 'lang-1', word: 'Sinónimo', translation: 'Palabra que tiene el mismo significado que otra.', tags: ['lenguaje'] },
    { id: 'lang-2', word: 'Antónimo', translation: 'Palabra que tiene un significado opuesto a otra.', tags: ['lenguaje'] },
    { id: 'lang-3', word: 'Metáfora', translation: 'Figura retórica de pensamiento.', tags: ['lenguaje'] },
];

// Retos de gramática y ortografía
export const spanishGrammarLibrary: SpanishGrammarChallenge[] = [
    // Acentuación
    { id: 'g-1', type: 'correct', question: "La cancion es muy bonita.", correctAnswer: "La canción es muy bonita.", hint: 'Palabra aguda', rule: "Las palabras agudas con terminación n, s o vocal llevan tilde.", tags: ['acentuación'], grade: 3 },
    { id: 'g-2', type: 'correct', question: "Me gusta el futbol.", correctAnswer: "Me gusta el fútbol.", hint: 'Palabra grave', rule: "Las palabras graves que no terminan en n, s o vocal llevan tilde.", tags: ['acentuación'], grade: 4 },
    // Uso de B y V
    { id: 'g-3', type: 'complete', question: "El barco era muy ___ (viejo).", options: ['biejo', 'viejo'], correctAnswer: 'viejo', hint: 'Ortografía B/V', rule: "Se escribe con V las palabras que empiezan por vice- y villa-.", tags: ['ortografía'], grade: 2 },
    // Concordancia
    { id: 'g-4', type: 'correct', question: 'Los niña corren rápido.', correctAnswer: 'Los niños corren rápido.', hint: 'Concordancia de género', rule: 'El artículo y el sustantivo deben coincidir en género.', tags: ['gramática'], grade: 2 },
    // Tiempos verbales
    { id: 'g-5', type: 'complete', question: 'Mañana nosotros ___ (ir) al parque.', options: ['fuimos', 'vamos', 'iremos', 'iremos'], correctAnswer: 'iremos', hint: 'Futuro', rule: 'Usa el tiempo futuro para acciones que no han ocurrido.', tags: ['verbos'], grade: 3 },
];

// Fragmentos de historias (Lina's World)
export const spanishStoryLibrary: Record<string, SpanishStoryPiece[]> = {
    'Aventura en la Selva': [
        { id: 'ls-1', text: 'En lo profundo de la selva amazónica, un explorador encontró un mapa.', type: 'starter' },
        { id: 'ls-2', text: 'Sin embargo, el mapa estaba en un idioma antiguo.', type: 'connector' },
        { id: 'ls-3', text: 'De repente, un jaguar apareció entre los árboles.', type: 'detail' },
        { id: 'ls-4', text: 'Finalmente, el explorador descifró el secreto del mapa.', type: 'ending' },
    ],
    'El Tesoro del Galeón': [
        { id: 'st-1', text: 'Hace muchos años, un barco español navegaba por el Caribe.', type: 'starter' },
        { id: 'st-2', text: 'Entonces, una gran tormenta sacudió el océano.', type: 'connector' },
        { id: 'st-3', text: 'Las olas eran tan altas como montañas.', type: 'detail' },
        { id: 'st-4', text: 'Al final, el tesoro quedó oculto bajo la arena blanca.', type: 'ending' },
    ],
};

// Pasajes de lectura (Estándares MEN)
export const spanishReadingLibrary: SpanishReadingPassage[] = [
    {
        id: 'sr-1',
        title: 'El Cóndor de los Andes',
        text: 'El cóndor es el ave voladora más grande del mundo. Vive en la cordillera de los Andes. Se alimenta de animales muertos y es un símbolo de libertad en muchos países de Sudamérica.',
        events: [
            { id: 'se1', text: 'El cóndor vive en los Andes', correctOrder: 1 },
            { id: 'se2', text: 'Es el ave más grande', correctOrder: 2 },
            { id: 'se3', text: 'Se alimenta de carroña', correctOrder: 3 },
        ],
        mainIdeaOptions: ['La vida del cóndor', 'Cómo vuelan las aves', 'Los volcanes de los Andes'],
        correctMainIdea: 'La vida del cóndor',
        grade: 3,
    },
    {
        id: 'sr-2',
        title: 'La Leyenda del Dorado',
        text: 'Cuenta la historia que en la laguna de Guatavita, los muiscas realizaban ceremonias con oro. El cacique se cubría de polvo de oro y se lanzaba al agua para honrar a los dioses.',
        events: [
            { id: 'se1', text: 'Ceremonias en Guatavita', correctOrder: 1 },
            { id: 'se2', text: 'Cacique cubierto de oro', correctOrder: 2 },
            { id: 'se3', text: 'Ofrendas a los dioses', correctOrder: 3 },
        ],
        mainIdeaOptions: ['Una tradición muisca', 'Cómo encontrar oro', 'La historia de Bogotá'],
        correctMainIdea: 'Una tradición muisca',
        grade: 4,
    },
];

// Funciones ayudantes
export function getSpanishGrammarChallenges(count: number = 5, grade?: number): SpanishGrammarChallenge[] {
    let filtered = spanishGrammarLibrary;
    if (grade) {
        filtered = spanishGrammarLibrary.filter(g => !g.grade || g.grade <= grade);
    }
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export function getSpanishVocabulary(count: number = 10, tags?: string[]): SpanishWord[] {
    let filtered = spanishVocabularyLibrary;
    if (tags && tags.length > 0) {
        filtered = spanishVocabularyLibrary.filter(w => w.tags.some(t => tags.includes(t)));
    }
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export function getSpanishStoryTheme(): string {
    const themes = Object.keys(spanishStoryLibrary);
    return themes[Math.floor(Math.random() * themes.length)];
}

export function getSpanishReadingPassage(grade?: number): SpanishReadingPassage {
    let filtered = spanishReadingLibrary;
    if (grade) {
        filtered = spanishReadingLibrary.filter(r => !r.grade || r.grade <= grade);
    }
    return filtered[Math.floor(Math.random() * filtered.length)];
}
