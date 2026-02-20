

export type AvatarId = 'leon_v1' | 'leon_v2' | 'leon_v3' | 'leon_v4' | 'leon_v5' | 'leon_v6' | 'delfin_segundo' | 'aguila_tercero' | 'tigre_cuarto' | 'dragon_quinto' | 'dragon_sexto' | 'koala_exploradorx' | 'zorro_aventurero';

export interface AvatarBase {
    id: AvatarId;
    name: string;
    description: string;
    grade: number; // 1-5 for elementary, 0 for universal
    imageUrl: string;
    color: string;
    personality: string;
}

export interface Accessory {
    id: string;
    name: string;
    type: 'head' | 'eyes' | 'neck' | 'back' | 'hand' | 'body';
    description: string;
    cost: number;
    icon: string; // Emoji for now?
    minLevel?: number;
}

export const AVATARS: AvatarBase[] = [
    // --- PRIMERO (1st Grade) - Leones (Variaciones) ---
    {
        id: 'leon_v1',
        name: 'Leo Solar',
        description: 'Brillante como el sol',
        grade: 1,
        imageUrl: '/avatars/leon_v1.png',
        color: '#facc15', // Yellow
        personality: '¡Energía pura! Siempre listo para aprender.'
    },
    {
        id: 'leon_v2',
        name: 'Leo Fuego',
        description: 'Cálido y valiente',
        grade: 1,
        imageUrl: '/avatars/leon_v2.png',
        color: '#fb923c', // Orange
        personality: '¡Corazón valiente! No teme a los retos.'
    },
    {
        id: 'leon_v3',
        name: 'Leo Arena',
        description: 'Tranquilo y constante',
        grade: 1,
        imageUrl: '/avatars/leon_v3.png',
        color: '#d4d4d8', // Tan/Beige
        personality: '¡Paso a paso! La constancia es su poder.'
    },
    {
        id: 'leon_v4',
        name: 'Leo Nube',
        description: 'Soñador y creativo',
        grade: 1,
        imageUrl: '/avatars/leon_v4.png',
        color: '#f1f5f9', // White
        personality: '¡Imaginación sin límites! Crea mundos nuevos.'
    },
    {
        id: 'leon_v5',
        name: 'Leo Bosque',
        description: 'Fuerte y amable',
        grade: 1,
        imageUrl: '/avatars/leon_v5.png',
        color: '#a16207', // Brown
        personality: '¡Raíces fuertes! Crece alto y seguro.'
    },
    {
        id: 'leon_v6',
        name: 'Leo Volcán',
        description: 'Intenso y apasionado',
        grade: 1,
        imageUrl: '/avatars/leon_v6.png',
        color: '#ef4444', // Reddish
        personality: '¡Pasión por saber! Aprende con intensidad.'
    },

    // --- SEGUNDO (2nd Grade) - Delfines (Placeholder IDs for now) ---
    {
        id: 'delfin_segundo',
        name: 'Dina la Delfín',
        description: 'La Nadadora de Segundo',
        grade: 2,
        imageUrl: '/avatars/delfin.png',
        color: '#3b82f6',
        personality: '¡Salta entre las olas del conocimiento!'
    },

    // --- TERCERO (3rd Grade) - Águila ---
    {
        id: 'aguila_tercero',
        name: 'Águila el Águila',
        description: 'El Volador de Tercero',
        grade: 3,
        imageUrl: '/avatars/aguila.png',
        color: '#8b5cf6',
        personality: '¡Vuela alto en ciencias!'
    },

    // --- CUARTO (4th Grade) - Tigre ---
    {
        id: 'tigre_cuarto',
        name: 'Tina la Tigre',
        description: 'La Cazadora de Cuarto',
        grade: 4,
        imageUrl: '/avatars/tigre.png',
        color: '#f97316',
        personality: '¡Caza el conocimiento!'
    },

    // --- QUINTO (5th Grade) - Dragón ---
    {
        id: 'dragon_quinto',
        name: 'Drake el Dragón',
        description: 'El Sabio de Quinto',
        grade: 5,
        imageUrl: '/avatars/dragon.png',
        color: '#dc2626',
        personality: '¡Fuego de sabiduría!'
    },

    // --- SEXTO (6th Grade) - Dragón ---
    {
        id: 'dragon_sexto',
        name: 'Drake el Maestro',
        description: 'El Sabio de Sexto',
        grade: 6,
        imageUrl: '/avatars/dragon.png',
        color: '#991b1b', // Un rojo un poco más oscuro
        personality: '¡Sabiduría ancestral para retos mayores!'
    },

    // --- UNIVERSAL ---
    {
        id: 'koala_exploradorx',
        name: 'Kira la Koala',
        description: 'La Exploradora',
        grade: 0,
        imageUrl: '/avatars/koala.png',
        color: '#14b8a6',
        personality: '¡Abraza el aprendizaje!'
    },
    {
        id: 'zorro_aventurero',
        name: 'Foxy el Zorro',
        description: 'El Aventurero',
        grade: 0,
        imageUrl: '/avatars/fox.png',
        color: '#ea580c',
        personality: '¡Astucia y diversión!'
    }
];

export const ACCESSORIES: Accessory[] = [
    // HEAD
    { id: 'h1', name: 'Gorra de Pensar', type: 'head', description: 'Ayuda a concentrarse', cost: 50, icon: '🧢' },
    { id: 'h2', name: 'Corona de Laurel', type: 'head', description: 'Para campeones', cost: 500, icon: '👑', minLevel: 10 },
    { id: 'h3', name: 'Casco Espacial', type: 'head', description: 'Listo para el despegue', cost: 200, icon: '👩‍🚀' },

    // EYES
    { id: 'e1', name: 'Gafas de Lectura', type: 'eyes', description: 'Visión +10', cost: 100, icon: '👓' },
    { id: 'e2', name: 'Monóculo', type: 'eyes', description: 'Muy elegante', cost: 150, icon: '🧐' },
    { id: 'e3', name: 'Gafas de Sol', type: 'eyes', description: 'Demasiado brillante', cost: 80, icon: '🕶️' },

    // BODY/NECK
    { id: 'n1', name: 'Bufanda Matemática', type: 'neck', description: 'Calentita y lógica', cost: 120, icon: '🧣' },
    { id: 'b1', name: 'Capa de Héroe', type: 'body', description: 'Vuela alto', cost: 300, icon: '🦸' },
    { id: 'b2', name: 'Bata de Laboratorio', type: 'body', description: 'Ciencia seria', cost: 250, icon: '🥼' },

    // HAND
    { id: 'ha1', name: 'Lápiz Gigante', type: 'hand', description: 'Para grandes ideas', cost: 150, icon: '✏️' },
    { id: 'ha2', name: 'Cetro de Graduación', type: 'hand', description: 'Poder académico', cost: 1000, icon: '🎓' },

    // BACK
    { id: 'bk1', name: 'Mochila Exploradora', type: 'back', description: 'Lleva todo', cost: 200, icon: '🎒' },
    { id: 'bk2', name: 'Jetpack', type: 'back', description: 'Impuso extra', cost: 800, icon: '🚀' }
];
