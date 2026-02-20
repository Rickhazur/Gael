/**
 * English Tutor Content Library
 * Vocabulary, Grammar Challenges, Story Pieces, Reading Passages
 */

export interface FlashWord {
    id: string;
    word: string;
    translation: string;
    tags: string[];
}

export interface GrammarChallenge {
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

export interface StoryPiece {
    id: string;
    text: string;
    type: 'starter' | 'connector' | 'detail' | 'ending';
}

export interface ReadingPassage {
    id: string;
    title: string;
    text: string;
    events: { id: string; text: string; correctOrder: number }[];
    mainIdeaOptions: string[];
    correctMainIdea: string;
    grade?: number;
}

// Vocabulary by category
export const vocabularyLibrary: FlashWord[] = [
    // Science
    { id: 'sci-1', word: 'Scientist', translation: 'Científico', tags: ['science'] },
    { id: 'sci-2', word: 'Experiment', translation: 'Experimento', tags: ['science'] },
    { id: 'sci-3', word: 'Discovery', translation: 'Descubrimiento', tags: ['science'] },
    { id: 'sci-4', word: 'Laboratory', translation: 'Laboratorio', tags: ['science'] },
    { id: 'sci-5', word: 'Hypothesis', translation: 'Hipótesis', tags: ['science'] },
    { id: 'sci-6', word: 'Microscope', translation: 'Microscopio', tags: ['science'] },
    { id: 'sci-7', word: 'Molecule', translation: 'Molécula', tags: ['science'] },
    { id: 'sci-8', word: 'Research', translation: 'Investigación', tags: ['science'] },
    // Math
    { id: 'math-1', word: 'Addition', translation: 'Suma', tags: ['math'] },
    { id: 'math-2', word: 'Subtraction', translation: 'Resta', tags: ['math'] },
    { id: 'math-3', word: 'Multiply', translation: 'Multiplicar', tags: ['math'] },
    { id: 'math-4', word: 'Divide', translation: 'Dividir', tags: ['math'] },
    { id: 'math-5', word: 'Fraction', translation: 'Fracción', tags: ['math'] },
    { id: 'math-6', word: 'Equation', translation: 'Ecuación', tags: ['math'] },
    // History
    { id: 'hist-1', word: 'Ancient', translation: 'Antiguo', tags: ['history'] },
    { id: 'hist-2', word: 'Century', translation: 'Siglo', tags: ['history'] },
    { id: 'hist-3', word: 'Civilization', translation: 'Civilización', tags: ['history'] },
    { id: 'hist-4', word: 'Independence', translation: 'Independencia', tags: ['history'] },
    { id: 'hist-5', word: 'Revolution', translation: 'Revolución', tags: ['history'] },
    // General
    { id: 'gen-1', word: 'Beautiful', translation: 'Hermoso', tags: ['adjective'] },
    { id: 'gen-2', word: 'Important', translation: 'Importante', tags: ['adjective'] },
    { id: 'gen-3', word: 'Quickly', translation: 'Rápidamente', tags: ['adverb'] },
    { id: 'gen-4', word: 'Carefully', translation: 'Cuidadosamente', tags: ['adverb'] },
    { id: 'gen-5', word: 'Tomorrow', translation: 'Mañana', tags: ['time'] },
    { id: 'gen-6', word: 'Yesterday', translation: 'Ayer', tags: ['time'] },
    // Grade 6: Community and routines
    { id: 'g6-1', word: 'Usually', translation: 'Usualmente', tags: ['adverb', 'routine'] },
    { id: 'g6-2', word: 'Sometimes', translation: 'A veces', tags: ['adverb', 'routine'] },
    { id: 'g6-3', word: 'Breakfast', translation: 'Desayuno', tags: ['food', 'routine'] },
    { id: 'g6-4', word: 'Neighborhood', translation: 'Barrio/Vecindario', tags: ['community'] },
    { id: 'g6-5', word: 'Between', translation: 'Entre', tags: ['preposition'] },
    { id: 'g6-6', word: 'Because', translation: 'Porque', tags: ['connector'] },
];

// Grammar challenges by skill
export const grammarLibrary: GrammarChallenge[] = [
    // Third person singular
    { id: 'g-1', type: 'correct', question: "She don't like experiments.", correctAnswer: "She doesn't like experiments.", hint: 'Third person singular', rule: "With he/she/it use doesn't", tags: ['third-person'], grade: 3 },
    { id: 'g-2', type: 'correct', question: "He don't play soccer.", correctAnswer: "He doesn't play soccer.", hint: 'Third person singular', rule: "With he/she/it use doesn't", tags: ['third-person'], grade: 3 },
    { id: 'g-3', type: 'correct', question: "The dog don't bark.", correctAnswer: "The dog doesn't bark.", hint: 'Third person singular', rule: "With he/she/it use doesn't", tags: ['third-person'], grade: 3 },
    // Past tense
    { id: 'g-4', type: 'complete', question: 'The scientist ___ (discover) a cure yesterday.', options: ['discover', 'discovered', 'discovering', 'discovers'], correctAnswer: 'discovered', hint: 'Past action', rule: 'Use -ed for past tense', tags: ['past-tense'], grade: 3 },
    { id: 'g-5', type: 'complete', question: 'We ___ (play) in the park last weekend.', options: ['play', 'played', 'playing', 'plays'], correctAnswer: 'played', hint: 'Past action', rule: 'Use -ed for past tense', tags: ['past-tense'], grade: 3 },
    { id: 'g-6', type: 'complete', question: 'She ___ (walk) to school this morning.', options: ['walk', 'walked', 'walking', 'walks'], correctAnswer: 'walked', hint: 'Past action', rule: 'Use -ed for past tense', tags: ['past-tense'], grade: 3 },
    // Verb agreement
    { id: 'g-7', type: 'correct', question: 'They was happy.', correctAnswer: 'They were happy.', hint: 'Plural subject', rule: 'They + were', tags: ['verb-agreement'], grade: 2 },
    { id: 'g-8', type: 'correct', question: 'The children was playing.', correctAnswer: 'The children were playing.', hint: 'Plural subject', rule: 'Plural subjects use were', tags: ['verb-agreement'], grade: 3 },
    { id: 'g-9', type: 'correct', question: 'There is many books.', correctAnswer: 'There are many books.', hint: 'Plural noun', rule: 'Use are with plural nouns', tags: ['verb-agreement'], grade: 3 },
    // Articles
    { id: 'g-10', type: 'complete', question: 'I saw ___ elephant at the zoo.', options: ['a', 'an', 'the', '-'], correctAnswer: 'an', hint: 'Vowel sound', rule: 'Use an before vowel sounds', tags: ['articles'], grade: 2 },
    { id: 'g-11', type: 'complete', question: 'She is ___ honest person.', options: ['a', 'an', 'the', '-'], correctAnswer: 'an', hint: 'Silent H', rule: 'Use an before silent H', tags: ['articles'], grade: 4 },
    // Comparatives
    { id: 'g-12', type: 'correct', question: 'This book is more good than that one.', correctAnswer: 'This book is better than that one.', hint: 'Irregular comparative', rule: 'good → better', tags: ['comparatives'], grade: 4 },
    { id: 'g-13', type: 'complete', question: 'My house is ___ (big) than yours.', options: ['big', 'bigger', 'biggest', 'more big'], correctAnswer: 'bigger', hint: 'Comparative form', rule: 'Add -er for short adjectives', tags: ['comparatives'], grade: 4 },
    // Possessives
    { id: 'g-14', type: 'correct', question: "The dog wagged it's tail.", correctAnswer: "The dog wagged its tail.", hint: 'Possessive pronoun', rule: "its = possession, it's = it is", tags: ['possessives'], grade: 4 },
    { id: 'g-15', type: 'correct', question: "Thats my book.", correctAnswer: "That's my book.", hint: 'Contraction', rule: "That's = That is", tags: ['contractions'], grade: 3 },
    // Grade 6 Challenges
    { id: 'g6-c1', type: 'order', question: "usually / I / at 7 / wake up", correctAnswer: "I usually wake up at 7", hint: 'Adverb position', rule: "Adverbs of frequency go before the main verb", tags: ['adverbs', 'routine'], grade: 6 },
    { id: 'g6-c2', type: 'complete', question: "There ___ some apples on the table.", options: ['is', 'are', 'was', 'be'], correctAnswer: 'are', hint: 'Plural some', rule: "Use 'are' with plural countable nouns", tags: ['there-is-are', 'countable'], grade: 6 },
    { id: 'g6-c3', type: 'correct', question: "I am play soccer now.", correctAnswer: "I am playing soccer now.", hint: 'Current action', rule: "Use Present Continuous (be + -ing) for actions happening now", tags: ['present-continuous'], grade: 6 },
    { id: 'g6-c4', type: 'complete', question: "I like milk ___ I don't like coffee.", options: ['and', 'but', 'because', 'so'], correctAnswer: 'but', hint: 'Contrast', rule: "Use 'but' to show contrast", tags: ['connectors'], grade: 6 },
];

// Story pieces by theme
export const storyLibrary: Record<string, StoryPiece[]> = {
    'Science Discovery': [
        { id: 's1-1', text: 'Once upon a time, a scientist worked in her lab.', type: 'starter' },
        { id: 's1-2', text: 'However, she needed more equipment.', type: 'connector' },
        { id: 's1-3', text: 'She discovered a new element!', type: 'detail' },
        { id: 's1-4', text: 'Finally, she won the Nobel Prize.', type: 'ending' },
        { id: 's1-5', text: 'The experiment was very complex.', type: 'detail' },
    ],
    'Space Adventure': [
        { id: 's2-1', text: 'The astronaut prepared for the mission.', type: 'starter' },
        { id: 's2-2', text: 'Suddenly, the rocket began to shake.', type: 'connector' },
        { id: 's2-3', text: 'Stars surrounded the spaceship.', type: 'detail' },
        { id: 's2-4', text: 'In the end, they landed safely on Mars.', type: 'ending' },
        { id: 's2-5', text: 'The view of Earth was amazing.', type: 'detail' },
    ],
    'Ocean Exploration': [
        { id: 's3-1', text: 'A young marine biologist dove into the sea.', type: 'starter' },
        { id: 's3-2', text: 'Then, she saw something unusual.', type: 'connector' },
        { id: 's3-3', text: 'Colorful fish swam all around her.', type: 'detail' },
        { id: 's3-4', text: 'At last, she found a new species of coral.', type: 'ending' },
        { id: 's3-5', text: 'The water was crystal clear.', type: 'detail' },
    ],
    'Rainforest Journey': [
        { id: 's4-1', text: 'The explorer entered the Amazon rainforest.', type: 'starter' },
        { id: 's4-2', text: 'However, the path became very difficult.', type: 'connector' },
        { id: 's4-3', text: 'Monkeys jumped from tree to tree.', type: 'detail' },
        { id: 's4-4', text: 'Finally, they reached the hidden waterfall.', type: 'ending' },
        { id: 's4-5', text: 'Exotic birds sang beautiful songs.', type: 'detail' },
    ],
};

// Reading passages
export const readingLibrary: ReadingPassage[] = [
    {
        id: 'r-1',
        title: 'The Water Cycle',
        text: 'First, the sun heats the water in oceans and lakes. Then, the water evaporates and rises into the sky. Next, it forms clouds. Finally, the water falls as rain.',
        events: [
            { id: 'e1', text: 'The sun heats the water', correctOrder: 1 },
            { id: 'e2', text: 'Water evaporates and rises', correctOrder: 2 },
            { id: 'e3', text: 'Clouds form in the sky', correctOrder: 3 },
            { id: 'e4', text: 'Rain falls to the ground', correctOrder: 4 },
        ],
        mainIdeaOptions: ['How rain is made', 'Why oceans are salty', 'How fish swim'],
        correctMainIdea: 'How rain is made',
        grade: 3,
    },
    {
        id: 'r-2',
        title: 'The Life of a Butterfly',
        text: 'First, a butterfly lays eggs on a leaf. Then, a caterpillar hatches from the egg. Next, the caterpillar forms a chrysalis. Finally, a beautiful butterfly emerges.',
        events: [
            { id: 'e1', text: 'Butterfly lays eggs', correctOrder: 1 },
            { id: 'e2', text: 'Caterpillar hatches', correctOrder: 2 },
            { id: 'e3', text: 'Chrysalis is formed', correctOrder: 3 },
            { id: 'e4', text: 'Butterfly emerges', correctOrder: 4 },
        ],
        mainIdeaOptions: ['How butterflies grow', 'Why leaves are green', 'How birds fly'],
        correctMainIdea: 'How butterflies grow',
        grade: 2,
    },
    {
        id: 'r-3',
        title: 'Making Chocolate',
        text: 'First, farmers harvest cacao pods. Then, they remove the beans and dry them. Next, the beans are roasted and ground. Finally, the chocolate is ready to eat.',
        events: [
            { id: 'e1', text: 'Cacao pods are harvested', correctOrder: 1 },
            { id: 'e2', text: 'Beans are removed and dried', correctOrder: 2 },
            { id: 'e3', text: 'Beans are roasted and ground', correctOrder: 3 },
            { id: 'e4', text: 'Chocolate is ready', correctOrder: 4 },
        ],
        mainIdeaOptions: ['How chocolate is made', 'Why sugar is sweet', 'How plants grow'],
        correctMainIdea: 'How chocolate is made',
        grade: 3,
    },
    {
        id: 'r-4',
        title: 'The Solar System',
        text: 'Our solar system has eight planets. Mercury is the closest to the Sun. Earth is the third planet. Jupiter is the largest planet of all.',
        events: [
            { id: 'e1', text: 'Mercury is closest to Sun', correctOrder: 1 },
            { id: 'e2', text: 'Venus is second', correctOrder: 2 },
            { id: 'e3', text: 'Earth is third', correctOrder: 3 },
            { id: 'e4', text: 'Jupiter is largest', correctOrder: 4 },
        ],
        mainIdeaOptions: ['Facts about planets', 'How stars are born', 'Why the sky is blue'],
        correctMainIdea: 'Facts about planets',
        grade: 4,
    },
];

// Helper functions
export function getRandomGrammarChallenges(count: number = 5, grade?: number): GrammarChallenge[] {
    let filtered = grammarLibrary;
    if (grade) {
        filtered = grammarLibrary.filter(g => !g.grade || g.grade <= grade);
    }
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export function getRandomVocabulary(count: number = 10, tags?: string[]): FlashWord[] {
    let filtered = vocabularyLibrary;
    if (tags && tags.length > 0) {
        filtered = vocabularyLibrary.filter(w => w.tags.some(t => tags.includes(t)));
    }
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export function getRandomStoryTheme(): string {
    const themes = Object.keys(storyLibrary);
    return themes[Math.floor(Math.random() * themes.length)];
}

export function getRandomReadingPassage(grade?: number): ReadingPassage {
    let filtered = readingLibrary;
    if (grade) {
        filtered = readingLibrary.filter(r => !r.grade || r.grade <= grade);
    }
    return filtered[Math.floor(Math.random() * filtered.length)];
}
