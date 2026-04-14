

export type AvatarId = string;

export interface AvatarBase {
    id: AvatarId;
    name: string;
    description: string;
    grade: number; // 1-7 for elementary/middle, 0 for universal
    imageUrl: string;
    color: string;
    personality: string;
    style?: string;
    offsets?: Record<string, { x: number; y: number; scale: number; rotate?: number }>;
    colors?: string[]; // Para compatibilidad con versiones antiguas
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
    // --- UNIVERSAL 3D HUMAN MODELS (For all grades) ---
    {
        id: 'g5_boy_1', name: 'Andrés (3D)', description: 'Avatar aventurero y equilibrado.', grade: 0,
        imageUrl: '/avatars/g5_boy_1_arms_down.png', color: '#3B82F6', personality: 'Equilibrado',
        offsets: { head: { x: 0, y: 0.5, scale: 0.98, rotate: 2 }, glasses: { x: 0, y: 0, scale: 1 } }
    },
    {
        id: 'g5_boy_2', name: 'Mateo (3D)', description: 'Estilo limpio y moderno.', grade: 0,
        imageUrl: '/avatars/g5_boy_2_arms_down.png', color: '#10B981', personality: 'Alegre',
        offsets: { head: { x: 0, y: 1.5, scale: 1.05, rotate: 2 } }
    },
    {
        id: 'g5_boy_3', name: 'Santi (3D)', description: 'Diseño minimalista y listo para aprender.', grade: 0,
        imageUrl: '/avatars/g5_boy_3_arms_down.png', color: '#F59E0B', personality: 'Curioso',
        offsets: { head: { x: 0, y: 0.5, scale: 0.98, rotate: 2 } }
    },
    {
        id: 'g5_girl_1', name: 'Lucía (3D)', description: 'Líder nata con gran visión.', grade: 0,
        imageUrl: '/avatars/g5_girl_1_arms_down.png', color: '#EC4899', personality: 'Líder',
        offsets: { head: { x: 0, y: -0.5, scale: 0.95, rotate: 0 } }
    },
    {
        id: 'g5_girl_2', name: 'Emma (3D)', description: 'Estilo deportivo y dinámico.', grade: 0,
        imageUrl: '/avatars/g5_girl_2_arms_down.png', color: '#8B5CF6', personality: 'Dinámica',
        offsets: { head: { x: 0, y: 0, scale: 0.98, rotate: 0 } }
    },
    {
        id: 'g5_girl_3', name: 'Sara (3D)', description: 'Expresiva, creativa y amigable.', grade: 0,
        imageUrl: '/avatars/g5_girl_3_arms_down.png', color: '#F97316', personality: 'Creativa',
        offsets: { head: { x: 0, y: -0.5, scale: 0.95, rotate: 0 } }
    },

    // --- ELITE & COSMIC VARIATIONS (Available for higher levels or as special versions) ---
    {
        id: 'g6_boy_1', name: 'Andrés Elite', description: 'Versión avanzada enfocada al éxito.', grade: 6,
        imageUrl: '/avatars/g5_boy_1.png', color: '#1E40AF', personality: 'Enfocado',
        offsets: { head: { x: 0, y: -2, scale: 0.9, rotate: 2 } }
    },
    {
        id: 'g6_girl_1', name: 'Lucía Elite', description: 'Visión de futuro y liderazgo.', grade: 6,
        imageUrl: '/avatars/g5_girl_1_1769540901853.png', color: '#9D174D', personality: 'Visionaria',
        offsets: { head: { x: 0, y: -3, scale: 0.88, rotate: 1 } }
    },
    { id: 'g7_boy_1', name: 'Andrés Cósmico', description: 'Sabiduría de las estrellas.', grade: 7, imageUrl: '/avatars/g5_boy_1.png', color: '#000000', personality: 'Sabio', offsets: { head: { x: 0, y: -2, scale: 0.9, rotate: 2 } } },
    { id: 'g7_girl_1', name: 'Lucía Cósmica', description: 'Liderazgo intergaláctico.', grade: 7, imageUrl: '/avatars/g5_girl_1_1769540901853.png', color: '#312E81', personality: 'Brillante', offsets: { head: { x: 0, y: -3, scale: 0.88, rotate: 1 } } },
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
