
import { GradeLevel } from '../types';

export interface ArenaPlayer {
    id: string;
    name: string;
    level: number;
    avatarUrl: string; // Using DiceBear
    grade: GradeLevel;
    coins: number;
    status: 'online' | 'playing' | 'idle';
    badges: string[]; // Emojis or codes
    accessories: string[]; // E.g., 'crown', 'glasses'
}

export interface ArenaQuest {
    id: string;
    title: { en: string; es: string };
    description: { en: string; es: string };
    difficulty: 'easy' | 'medium' | 'hard';
    category: 'math' | 'science' | 'history' | 'geography' | 'logic';
    reward: { coins: number; xp: number };
    duration: number; // minutes
    minPlayers: number;
    maxPlayers: number;
    icon: string;
    dbaReference?: string; // e.g. "DBA 2: Interpreta y clasifica..."
    minGrade: number;
    maxGrade: number;
    challenge?: {
        type: 'eval' | 'input';
        question: { en: string; es: string };
        options?: { id: string; text: { en: string; es: string } }[];
        correctOptionId?: string;
        hint: { en: string; es: string };
    };
}

export const mockArenaPlayers: ArenaPlayer[] = [
    {
        id: 'p1', name: 'luna', level: 12,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna&backgroundColor=c0aede',
        grade: 3, coins: 1500, status: 'online', badges: ['👑', '⭐'], accessories: ['glasses']
    },
    {
        id: 'p2', name: 'Mateo L.', level: 10,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mateo&backgroundColor=b6e3f4',
        grade: 3, coins: 980, status: 'playing', badges: ['🚀'], accessories: []
    },
    {
        id: 'p3', name: 'Camila V.', level: 14,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Camila&backgroundColor=ffdfbf',
        grade: 4, coins: 2100, status: 'idle', badges: ['🎨', '🏆'], accessories: ['hat']
    },
    {
        id: 'p4', name: 'Lucas P.', level: 9,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas&backgroundColor=d1d4f9',
        grade: 2, coins: 850, status: 'online', badges: [], accessories: []
    },
    {
        id: 'p5', name: 'Ana M.', level: 11,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana&backgroundColor=fhdfbf',
        grade: 5, coins: 1200, status: 'playing', badges: ['🌟'], accessories: ['glasses']
    }
];

export const ALL_QUESTS: ArenaQuest[] = [
    // --- GRADES 1-2 ---
    {
        id: 'q_g1_1',
        title: { en: 'Shape Hunter', es: 'Cazador de Formas' },
        description: { en: 'Find objects that are circles, squares, and triangles.', es: 'Encuentra objetos que sean círculos, cuadrados y triángulos.' },
        difficulty: 'easy', category: 'math', reward: { coins: 30, xp: 50 }, duration: 10, minPlayers: 1, maxPlayers: 2, icon: '🔺',
        dbaReference: 'DBA 6 (Matemáticas 1°): Compara objetos según sus atributos.', minGrade: 1, maxGrade: 2,
        challenge: {
            type: 'eval',
            question: {
                en: 'You are building a ramp for your toy cars. Which shape block will make the best ramp to let them slide down fast?',
                es: 'Estás construyendo una rampa para tus carritos. ¿Qué bloque tiene la mejor forma para que bajen rápido?'
            },
            options: [
                { id: 'a', text: { en: 'A flat square block', es: 'Un bloque cuadrado plano' } },
                { id: 'b', text: { en: 'A triangular wedge block', es: 'Un bloque triangular inclinado' } },
                { id: 'c', text: { en: 'A round ball', es: 'Una pelota redonda' } }
            ],
            correctOptionId: 'b',
            hint: {
                en: 'Guardian Angel: Remember the "slide" at the park? It goes down like a triangle side!',
                es: 'Ángel Guardián: ¿Recuerdas el rodadero del parque? ¡Baja inclinado como el lado de un triángulo!'
            }
        }
    },
    {
        id: 'q_g1_2',
        title: { en: 'Animal Sounds', es: 'Sonidos Animales' },
        description: { en: 'Listen and identify which animal makes the sound.', es: 'Escucha e identifica qué animal hace el sonido.' },
        difficulty: 'easy', category: 'science', reward: { coins: 30, xp: 50 }, duration: 5, minPlayers: 1, maxPlayers: 4, icon: '🐄',
        dbaReference: 'DBA 3 (Ciencias 1°): Comprende que los seres vivos tienen características.', minGrade: 1, maxGrade: 2,
        challenge: {
            type: 'eval',
            question: {
                en: 'You are visiting a farm and hear a loud "Moooo"! You need to feed the animal that made that sound. Who do you look for?',
                es: 'Estás en una granja y escuchas un fuerte "¡Muuuu!". Debes alimentar al animal que hizo ese sonido. ¿A quién buscas?'
            },
            options: [
                { id: 'a', text: { en: 'The chickens', es: 'A las gallinas' } },
                { id: 'b', text: { en: 'The cow', es: 'A la vaca' } },
                { id: 'c', text: { en: 'The pig', es: 'Al cerdito' } }
            ],
            correctOptionId: 'b',
            hint: {
                en: 'Guardian Angel: Think about the animal that gives us milk. It says "Moo".',
                es: 'Ángel Guardián: Piensa en el animal grande que nos da leche. Ese es el que dice "Muu".'
            }
        }
    },
    {
        id: 'q_g1_3',
        title: { en: 'My Family Tree', es: 'Mi Árbol Familiar' },
        description: { en: 'Draw your family and identify who is who.', es: 'Dibuja a tu familia e identifica quién es quién.' },
        difficulty: 'medium', category: 'history', reward: { coins: 40, xp: 60 }, duration: 15, minPlayers: 1, maxPlayers: 1, icon: '🌳',
        dbaReference: 'DBA 4 (Sociales 1°): Reconoce su pertenencia a grupos sociales.', minGrade: 1, maxGrade: 2
    },
    {
        id: 'q_g1_4',
        title: { en: 'Number Jump', es: 'Salto de Números' },
        description: { en: 'Count by 2s and 5s to reach 50!', es: '¡Cuenta de 2 en 2 y de 5 en 5 hasta llegar a 50!' },
        difficulty: 'medium', category: 'math', reward: { coins: 35, xp: 55 }, duration: 10, minPlayers: 1, maxPlayers: 2, icon: '🔢',
        dbaReference: 'DBA 1 (Matemáticas 2°): Resuelve problemas aditivos.', minGrade: 1, maxGrade: 2
    },
    {
        id: 'q_g1_5',
        title: { en: 'Story Teller', es: 'Cuentacuentos' },
        description: { en: 'Create a story using 3 pictures.', es: 'Crea una historia usando 3 imágenes.' },
        difficulty: 'hard', category: 'logic', reward: { coins: 50, xp: 80 }, duration: 20, minPlayers: 1, maxPlayers: 2, icon: '📖',
        dbaReference: 'DBA 6 (Lenguaje 2°): Predice el contenido de textos.', minGrade: 1, maxGrade: 2
    },
    // --- NEW: Daily Life RPG Missions (Grades 1-2) ---
    {
        id: 'q_g1_life_1',
        title: { en: 'The Toy Architect', es: 'El Arquitecto del Orden' },
        description: { en: 'Your room is a city in chaos! Organize your toys by color or size to restore peace.', es: '¡Tu cuarto es una ciudad en caos! Organiza tus juguetes por color o tamaño para restaurar la paz.' },
        difficulty: 'easy', category: 'logic', reward: { coins: 50, xp: 40 }, duration: 15, minPlayers: 1, maxPlayers: 1, icon: '🧸',
        dbaReference: 'Habilidad de Vida: Orden y Clasificación', minGrade: 1, maxGrade: 2
    },
    {
        id: 'q_g1_life_2',
        title: { en: 'Smile Guardian', es: 'Guardián de la Sonrisa' },
        description: { en: 'Defeat the Cavity Monsters! Brush your teeth for 2 minutes perfectly.', es: '¡Derrota a los Monstruos de las Caries! Cepíllate los dientes por 2 minutos perfectamente.' },
        difficulty: 'easy', category: 'science', reward: { coins: 40, xp: 30 }, duration: 2, minPlayers: 1, maxPlayers: 1, icon: '🦷',
        dbaReference: 'Habilidad de Vida: Higiene Personal', minGrade: 1, maxGrade: 2
    },


    // --- GRADES 3-5 ---
    {
        id: 'q_g3_1',
        title: { en: 'The Lost Puppy', es: 'El Perrito Perdido' },
        description: { en: 'Use coordinates to find the puppy.', es: 'Usa coordenadas para encontrar al perrito.' },
        difficulty: 'medium', category: 'geography', reward: { coins: 60, xp: 120 }, duration: 10, minPlayers: 1, maxPlayers: 2, icon: '🐶',
        dbaReference: 'DBA 4 (Sociales 3°): Reconoce coordenadas en mapas.', minGrade: 3, maxGrade: 5,
        challenge: {
            type: 'eval',
            question: {
                en: 'You are a rescue pilot. Your radar says the lost puppy is at (3, 5). How do you fly your helicopter to save him?',
                es: 'Eres un piloto de rescate. Tu radar dice que el perrito perdido está en (3, 5). ¿Cómo vuelas tu helicóptero para salvarlo?'
            },
            options: [
                { id: 'a', text: { en: 'Fly 5 km East, then 3 km North', es: 'Volar 5 km al Este, luego 3 km al Norte' } },
                { id: 'b', text: { en: 'Fly 3 km East (Right), then 5 km North (Up)', es: 'Volar 3 km al Este (Derecha), luego 5 km al Norte (Arriba)' } },
                { id: 'c', text: { en: 'Fly anywhere', es: 'Volar a cualquier lado' } }
            ],
            correctOptionId: 'b',
            hint: {
                en: 'Guardian Angel: Active memory! In (X, Y), we crawl along the ground (X) before we climb the tree (Y).',
                es: 'Ángel Guardián: ¡Activa tu memoria! En (X, Y), primero caminamos por el suelo (X) antes de subir al árbol (Y).'
            }
        }
    },
    {
        id: 'q_g3_2',
        title: { en: 'Community Garden', es: 'Jardín Comunitario' },
        description: { en: 'Calculate area for flower beds.', es: 'Calcula el área para las flores.' },
        difficulty: 'easy', category: 'math', reward: { coins: 40, xp: 80 }, duration: 15, minPlayers: 1, maxPlayers: 3, icon: '🌻',
        dbaReference: 'DBA 3 (Ciencias 3°): Factores bióticos y abióticos.', minGrade: 3, maxGrade: 5,
        challenge: {
            type: 'eval',
            question: {
                en: 'We are designing a garden ecosystem. We need something that is NOT alive to help the plants grow by holding them up. What do we place?',
                es: 'Estamos diseñando un ecosistema de jardín. Necesitamos colocar algo que NO esté vivo para ayudar a las plantas a sostenerse. ¿Qué ponemos?'
            },
            options: [
                { id: 'a', text: { en: 'More Sunflowers', es: 'Más Girasoles' } },
                { id: 'b', text: { en: 'Earthworms', es: 'Lombrices' } },
                { id: 'c', text: { en: 'Large Rocks', es: 'Rocas Grandes' } }
            ],
            correctOptionId: 'c',
            hint: {
                en: 'Guardian Angel: Recall our Science class. Abiotic things like sun, water, and rocks support life but are not alive themselves.',
                es: 'Ángel Guardián: Recuerda la clase de Ciencias. Las cosas abióticas como el sol, el agua y las rocas apoyan la vida pero no están vivas.'
            }
        }
    },
    {
        id: 'q_g3_3',
        title: { en: 'Peace Negotiator', es: 'Negociador de Paz' },
        description: { en: 'Solve a conflict between friends.', es: 'Resuelve un conflicto entre amigos.' },
        difficulty: 'hard', category: 'logic', reward: { coins: 70, xp: 140 }, duration: 8, minPlayers: 1, maxPlayers: 2, icon: '🤝',
        dbaReference: 'DBA 8 (C. Ciudadanas): Resolución de conflictos.', minGrade: 3, maxGrade: 5,
        challenge: {
            type: 'eval',
            question: {
                en: 'You see two friends pulling on the same soccer ball, shouting "It is mine!". The game has stopped and everyone is sad. As a Peace Negotiator, what do you suggest?',
                es: 'Ves a dos amigos jalando el mismo balón, gritando "¡Es mío!". El juego se detuvo y todos están tristes. Como Negociador de Paz, ¿qué sugieres?'
            },
            options: [
                { id: 'a', text: { en: 'Shout louder than them to stop', es: 'Gritar más fuerte que ellos para que paren' } },
                { id: 'b', text: { en: 'Suggest taking turns: "Goalie first, then Striker!"', es: 'Sugerir turnos: "¡Primero portero, luego delantero!"' } },
                { id: 'c', text: { en: 'Take the ball away so no one plays', es: 'Quitarles el balón para que nadie juegue' } }
            ],
            correctOptionId: 'b',
            hint: {
                en: 'Guardian Angel: In Citizenship class, we learned that a "Win-Win" solution is better than fighting. How can they BOTH play?',
                es: 'Ángel Guardián: En la clase de Ciudadanía, aprendimos que una solución "Ganar-Ganar" es mejor que pelear. ¿Cómo pueden jugar AMBOS?'
            }
        }
    },
    {
        id: 'q_g3_4',
        title: { en: 'The Great Bake Off', es: 'Gran Horneada' },
        description: { en: 'Adjust a recipe using fractions.', es: 'Ajusta una receta usando fracciones.' },
        difficulty: 'medium', category: 'math', reward: { coins: 50, xp: 100 }, duration: 12, minPlayers: 1, maxPlayers: 2, icon: '🍪',
        dbaReference: 'DBA 1 (Matemáticas 3°): Problemas multiplicativos.', minGrade: 3, maxGrade: 5
    },
    {
        id: 'q_g3_5',
        title: { en: 'Eco-System Builder', es: 'Constructor de Ecosistemas' },
        description: { en: 'Balance producers, consumers, and decomposers.', es: 'Equilibra productores, consumidores y descomponedores.' },
        difficulty: 'hard', category: 'science', reward: { coins: 80, xp: 150 }, duration: 25, minPlayers: 1, maxPlayers: 4, icon: '🦁',
        dbaReference: 'DBA 5 (Ciencias 4°): Flujo de energía en ecosistemas.', minGrade: 3, maxGrade: 5
    },
    {
        id: 'q_g3_6',
        title: { en: 'History Detective', es: 'Detective Histórico' },
        description: { en: 'Identify the timeline of national independence.', es: 'Identifica la línea de tiempo de la independencia.' },
        difficulty: 'medium', category: 'history', reward: { coins: 60, xp: 110 }, duration: 15, minPlayers: 1, maxPlayers: 2, icon: '🕵️',
        dbaReference: 'DBA 4 (Sociales 5°): Periodos históricos de Colombia.', minGrade: 4, maxGrade: 5
    },
    // --- NEW: Daily Life RPG Missions (Grades 3-5) ---
    {
        id: 'q_g3_life_1',
        title: { en: 'Master Chef Helper', es: 'Ayudante de Chef Maestro' },
        description: { en: 'Assist in preparing a meal. Wash vegetables or set the table like a pro.', es: 'Ayuda a preparar una comida. Lava vegetales o pon la mesa como un profesional.' },
        difficulty: 'medium', category: 'science', reward: { coins: 60, xp: 70 }, duration: 20, minPlayers: 1, maxPlayers: 2, icon: '🥗',
        dbaReference: 'Habilidad de Vida: Colaboración en el Hogar', minGrade: 3, maxGrade: 5
    },
    {
        id: 'q_g3_life_2',
        title: { en: 'The Water Saver', es: 'El Ahorrador de Agua' },
        description: { en: 'Identify a way to save water at home today and do it!', es: '¡Identifica una forma de ahorrar agua en casa hoy y hazlo!' },
        difficulty: 'easy', category: 'science', reward: { coins: 40, xp: 50 }, duration: 5, minPlayers: 1, maxPlayers: 1, icon: '💧',
        dbaReference: 'Habilidad de Vida: Conciencia Ambiental', minGrade: 3, maxGrade: 5
    }

];

// Helper to get rotating quests
export const getDailyQuests = (grade: number): ArenaQuest[] => {
    // 1. Filter by Grade
    const validQuests = ALL_QUESTS.filter(q => grade >= q.minGrade && grade <= q.maxGrade);

    // 2. Simple seeded randomization based on date
    const today = new Date().toISOString().split('T')[0];
    const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);

    // Shuffle using seed (simple mock shuffle)
    // We modify the seed slightly for each sort comparison to emulate randomness daily
    const shuffled = [...validQuests].sort((a, b) => {
        const valA = a.id.charCodeAt(a.id.length - 1) + seed;
        const valB = b.id.charCodeAt(b.id.length - 1) + seed;
        return (valA % 3) - (valB % 3);
    });

    // Return first 4 (or all if less than 4)
    return shuffled.slice(0, 4);
};

// Original export for backward compatibility if needed, but we should switch to getDailyQuests
export const mockQuests = ALL_QUESTS.slice(0, 4);
