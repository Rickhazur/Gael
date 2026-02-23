

export type AvatarId = string;

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

    // --- 5to, 6to y 7mo Grado (3D Simple Collection) ---
    { id: 'g5_boy_1', name: 'Andrés (Simple)', description: 'Avatar base con camiseta blanca, ideal para personalizar.', grade: 5, imageUrl: '/avatars/g5_boy_1.png', color: '#3B82F6', personality: 'Equilibrado' },
    { id: 'g5_boy_2', name: 'Mateo (Simple)', description: 'Avatar base con cabello rizado y estilo limpio.', grade: 5, imageUrl: '/avatars/g5_boy_2.png', color: '#10B981', personality: 'Alegre' },
    { id: 'g5_boy_3', name: 'Santi (Simple)', description: 'Avatar base rubio con diseño minimalista.', grade: 5, imageUrl: '/avatars/g5_boy_3.png', color: '#F59E0B', personality: 'Curioso' },
    { id: 'g5_boy_4', name: 'Kenji (Simple)', description: 'Avatar base de estilo urbano y despejado.', grade: 5, imageUrl: '/avatars/g5_boy_4.png', color: '#EF4444', personality: 'Enfocado' },
    { id: 'g5_girl_1', name: 'Lucía (Simple)', description: 'Avatar base femenino con diseño limpio y moderno.', grade: 5, imageUrl: '/avatars/g5_girl_1_1769540901853.png', color: '#EC4899', personality: 'Líder' },
    { id: 'g5_girl_2', name: 'Emma (Simple)', description: 'Avatar base femenino con un look deportivo y sencillo.', grade: 5, imageUrl: '/avatars/g5_girl_2_1769540916141.png', color: '#8B5CF6', personality: 'Dinámica' },
    { id: 'g5_girl_3', name: 'Sara (Simple)', description: 'Avatar base femenino con rasgos expresivos y neutros.', grade: 5, imageUrl: '/avatars/g5_girl_3_1769540930925.png', color: '#F97316', personality: 'Creativa' },
    { id: 'g5_girl_4', name: 'Mía (Simple)', description: 'Avatar base femenino ideal para cualquier accesorio.', grade: 5, imageUrl: '/avatars/g5_girl_3_1769540930925.png', color: '#06B6D4', personality: 'Inteligente' },

    // Grado 6
    { id: 'g6_boy_1', name: 'Andrés (Simple)', description: 'Avatar base con camiseta blanca, ideal para personalizar.', grade: 6, imageUrl: '/avatars/g5_boy_1.png', color: '#3B82F6', personality: 'Equilibrado' },
    { id: 'g6_boy_2', name: 'Mateo (Simple)', description: 'Avatar base con cabello rizado y estilo limpio.', grade: 6, imageUrl: '/avatars/g5_boy_2.png', color: '#10B981', personality: 'Alegre' },
    { id: 'g6_boy_3', name: 'Santi (Simple)', description: 'Avatar base rubio con diseño minimalista.', grade: 6, imageUrl: '/avatars/g5_boy_3.png', color: '#F59E0B', personality: 'Curioso' },
    { id: 'g6_boy_4', name: 'Kenji (Simple)', description: 'Avatar base de estilo urbano y despejado.', grade: 6, imageUrl: '/avatars/g5_boy_4.png', color: '#EF4444', personality: 'Enfocado' },
    { id: 'g6_girl_1', name: 'Lucía (Simple)', description: 'Avatar base femenino con diseño limpio y moderno.', grade: 6, imageUrl: '/avatars/g5_girl_1_1769540901853.png', color: '#EC4899', personality: 'Líder' },
    { id: 'g6_girl_2', name: 'Emma (Simple)', description: 'Avatar base femenino con un look deportivo y sencillo.', grade: 6, imageUrl: '/avatars/g5_girl_2_1769540916141.png', color: '#8B5CF6', personality: 'Dinámica' },
    { id: 'g6_girl_3', name: 'Sara (Simple)', description: 'Avatar base femenino con rasgos expresivos y neutros.', grade: 6, imageUrl: '/avatars/g5_girl_3_1769540930925.png', color: '#F97316', personality: 'Creativa' },
    { id: 'g6_girl_4', name: 'Mía (Simple)', description: 'Avatar base femenino ideal para cualquier accesorio.', grade: 6, imageUrl: '/avatars/g5_girl_3_1769540930925.png', color: '#06B6D4', personality: 'Inteligente' },

    // Grado 7
    { id: 'g7_boy_1', name: 'Andrés (Simple)', description: 'Avatar base con camiseta blanca, ideal para personalizar.', grade: 7, imageUrl: '/avatars/g5_boy_1.png', color: '#3B82F6', personality: 'Equilibrado' },
    { id: 'g7_boy_2', name: 'Mateo (Simple)', description: 'Avatar base con cabello rizado y estilo limpio.', grade: 7, imageUrl: '/avatars/g5_boy_2.png', color: '#10B981', personality: 'Alegre' },
    { id: 'g7_boy_3', name: 'Santi (Simple)', description: 'Avatar base rubio con diseño minimalista.', grade: 7, imageUrl: '/avatars/g5_boy_3.png', color: '#F59E0B', personality: 'Curioso' },
    { id: 'g7_boy_4', name: 'Kenji (Simple)', description: 'Avatar base de estilo urbano y despejado.', grade: 7, imageUrl: '/avatars/g5_boy_4.png', color: '#EF4444', personality: 'Enfocado' },
    { id: 'g7_girl_1', name: 'Lucía (Simple)', description: 'Avatar base femenino con diseño limpio y moderno.', grade: 7, imageUrl: '/avatars/g5_girl_1_1769540901853.png', color: '#EC4899', personality: 'Líder' },
    { id: 'g7_girl_2', name: 'Emma (Simple)', description: 'Avatar base femenino con un look deportivo y sencillo.', grade: 7, imageUrl: '/avatars/g5_girl_2_1769540916141.png', color: '#8B5CF6', personality: 'Dinámica' },
    { id: 'g7_girl_3', name: 'Sara (Simple)', description: 'Avatar base femenino con rasgos expresivos y neutros.', grade: 7, imageUrl: '/avatars/g5_girl_3_1769540930925.png', color: '#F97316', personality: 'Creativa' },
    { id: 'g7_girl_4', name: 'Mía (Simple)', description: 'Avatar base femenino ideal para cualquier accesorio.', grade: 7, imageUrl: '/avatars/g5_girl_3_1769540930925.png', color: '#06B6D4', personality: 'Inteligente' },

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
