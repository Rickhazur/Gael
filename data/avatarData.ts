

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
    // --- PRIMERO (1st Grade) ---
    { id: 'g1_bunny', name: 'Super Conejo 🐰', description: '¡Salta muy alto y es súper rápido!', grade: 1, imageUrl: '/avatars/g1_bunny.png', color: '#FFC0CB', personality: 'Enérgico' },
    { id: 'g1_dino', name: 'Dino Rex 🦖', description: 'Un pequeño T-Rex con un gran corazón.', grade: 1, imageUrl: '/avatars/g1_dino.png', color: '#32CD32', personality: 'Valiente' },
    { id: 'g1_knight', name: 'Caballero Mini ⚔️', description: 'Defensor del castillo de juguetes.', grade: 1, imageUrl: '/avatars/g1_knight_1767624845473.png', color: '#C0C0C0', personality: 'Noble' },
    { id: 'g1_cat', name: 'Gato Mágico 🐱', description: 'Tiene siete vidas y muchos trucos.', grade: 1, imageUrl: '/avatars/g1_cat_1767624860507.png', color: '#FFA500', personality: 'Astuto' },
    { id: 'g1_robot', name: 'Robo-Amigo 🤖', description: 'Un robot que ayuda con las tareas.', grade: 1, imageUrl: '/avatars/g1_robot.png', color: '#00BFFF', personality: 'Inteligente' },
    { id: 'g1_hero_girl', name: 'Chica Maravilla 💪', description: 'Salva el día con su súper fuerza.', grade: 1, imageUrl: '/avatars/g1_hero_girl_1767624886408.png', color: '#FF4500', personality: 'Fuerte' },
    { id: 'g1_hero_boy', name: 'Chico Rayo ⚡', description: 'Corre más rápido que el viento.', grade: 1, imageUrl: '/avatars/g1_hero_boy_1767624902153.png', color: '#FFFF00', personality: 'Veloz' },

    // --- SEGUNDO (2nd Grade) ---
    { id: 'g2_explorer_g', name: 'Exploradora 🌴', description: 'Descubriendo templos antiguos.', grade: 2, imageUrl: '/avatars/g2_explorer_g_1767625050508.png', color: '#228B22', personality: 'Curiosa' },
    { id: 'g2_explorer_b', name: 'Explorador 🏜️', description: 'Encuentra tesoros mágicos.', grade: 2, imageUrl: '/avatars/g2_explorer_b_1767625065646.png', color: '#DAA520', personality: 'Aventurero' },
    { id: 'g2_mermaid', name: 'Sirena del Mar 🧜‍♀️', description: 'Protege los océanos y corales.', grade: 2, imageUrl: '/avatars/g2_mermaid_1767625081158.png', color: '#00CED1', personality: 'Protectora' },
    { id: 'g2_pirate', name: 'Pirata Valiente 🏴‍☠️', description: 'Navega los siete mares.', grade: 2, imageUrl: '/avatars/g2_pirate_1767625112049.png', color: '#000000', personality: 'Temerario' },
    { id: 'g2_fairy', name: 'Hada del Bosque 🧚', description: 'Cuida de las plantas y flores.', grade: 2, imageUrl: '/avatars/g2_fairy_1767625127946.png', color: '#32CD32', personality: 'Dulce' },
    { id: 'g2_elf', name: 'Elfo Arquero 🏹', description: 'Tiene una puntería perfecta.', grade: 2, imageUrl: '/avatars/g2_elf_1767625146813.png', color: '#006400', personality: 'Certero' },
    { id: 'g2_doc', name: 'Doctora Juguetes 👩‍⚕️', description: 'Cura a todos sus amigos peluches.', grade: 2, imageUrl: '/avatars/g2_doc_1767625162387.png', color: '#FFFFFF', personality: 'Cuidadosa' },
    { id: 'g2_builder', name: 'Constructor 👷', description: 'Puede construir cualquier cosa.', grade: 2, imageUrl: '/avatars/g2_builder_1767625177904.png', color: '#FFA500', personality: 'Creativo' },

    // --- TERCERO (3rd Grade) ---
    { id: 'g3_princess', name: 'Luna (Princesa Hada)', description: 'Usa magia de estrellas.', grade: 3, imageUrl: '/avatars/g1_princess_1767624829724.png', color: '#FF69B4', personality: 'Amable' },
    { id: 'g3_wizard', name: 'Aprendiz de Mago 🧙', description: 'Estudia hechizos antiguos.', grade: 3, imageUrl: '/avatars/g3_wizard_1767625207857.png', color: '#4B0082', personality: 'Sabio' },
    { id: 'g3_witch', name: 'Brujita Estelar 🧹', description: 'Vuela en escoba por la galaxia.', grade: 3, imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Witch&backgroundColor=b6e3f4', color: '#9932CC', personality: 'Misteriosa' },
    { id: 'g3_skater_g', name: 'Skater Pro 🛹', description: 'Domina las rampas y trucos.', grade: 3, imageUrl: '/avatars/g3_skater_g_1767625223776.png', color: '#FF00FF', personality: 'Radical' },
    { id: 'g3_skater_b', name: 'Roller King 🛼', description: 'El más rápido sobre ruedas.', grade: 3, imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=SkaterBoy&backgroundColor=d1d4f9', color: '#0000FF', personality: 'Veloz' },
    { id: 'g3_detective', name: 'Detective Joven 🔍', description: 'Resuelve misterios difíciles.', grade: 3, imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Detective&backgroundColor=c0c0c0', color: '#8B4513', personality: 'Analítico' },
    { id: 'g3_ninja', name: 'Mini Ninja 🥷', description: 'Silencioso como una sombra.', grade: 3, imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Ninja&backgroundColor=b6e3f4', color: '#000000', personality: 'Sigiloso' },
    { id: 'g3_artist', name: 'Artista Colorida 🎨', description: 'Pinta el mundo de colores.', grade: 3, imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Artist&backgroundColor=ffdfbf', color: '#FF1493', personality: 'Expresiva' },
    { id: 'g3_rock', name: 'Estrella de Rock 🎸', description: 'Toca la guitarra eléctrica.', grade: 3, imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=RockStar&backgroundColor=ffd5dc', color: '#000000', personality: 'Ruidoso' },


    // --- CUARTO (4th Grade) ---
    { id: 'g4_astro', name: 'Astro-Explorer 🚀', description: 'Explora el cosmos digital.', grade: 4, imageUrl: '/avatars/g4_tech.png', color: '#00BFFF', personality: 'Curioso' },
    { id: 'g4_pixel', name: 'Pixel Paladin 🎮', description: 'Defensor del reino de píxels.', grade: 4, imageUrl: '/avatars/g4_pixel.png', color: '#A9A9A9', personality: 'Leal' },
    { id: 'g4_street', name: 'Street Stylist 👟', description: 'Marca tendencia urbana.', grade: 4, imageUrl: '/avatars/g4_street.png', color: '#FF69B4', personality: 'Creativa' },
    { id: 'g4_tech', name: 'Tech Savvy 💻', description: 'Experto en gadgets inteligentes.', grade: 4, imageUrl: '/avatars/g4_tech.png', color: '#FFA500', personality: 'Inteligente' },
    { id: 'g4_anime', name: 'Anime Ace ⚔️', description: 'Espadachina tradicional moderna.', grade: 4, imageUrl: '/avatars/g4_anime.png', color: '#FFC0CB', personality: 'Disciplinada' },
    { id: 'g4_gamer', name: 'Gamer Guru 🕹️', description: 'Capitán de e-sports.', grade: 4, imageUrl: '/avatars/g4_gamer.png', color: '#FF4500', personality: 'Competitivo' },

    // --- QUINTO (5th Grade) - 3D Simple Collection ---
    { id: 'g5_boy_1', name: 'Andrés (3D)', description: 'Avatar para quinto grado.', grade: 5, imageUrl: '/avatars/g5_boy_1_arms_down.png', color: '#3B82F6', personality: 'Equilibrado' },
    { id: 'g5_boy_2', name: 'Mateo (3D)', description: 'Estilo limpio y moderno.', grade: 5, imageUrl: '/avatars/g5_boy_2_arms_down.png', color: '#10B981', personality: 'Alegre' },
    { id: 'g5_boy_3', name: 'Santi (3D)', description: 'Diseño minimalista.', grade: 5, imageUrl: '/avatars/g5_boy_3_arms_down.png', color: '#F59E0B', personality: 'Curioso' },
    { id: 'g5_girl_1', name: 'Lucía (3D)', description: 'Líder 3D de quinto grado.', grade: 5, imageUrl: '/avatars/g5_girl_1_arms_down.png', color: '#EC4899', personality: 'Líder' },
    { id: 'g5_girl_2', name: 'Emma (3D)', description: 'Estilo deportivo.', grade: 5, imageUrl: '/avatars/g5_girl_2_arms_down.png', color: '#8B5CF6', personality: 'Dinámica' },
    { id: 'g5_girl_3', name: 'Sara (3D)', description: 'Expresiva y creativa.', grade: 5, imageUrl: '/avatars/g5_girl_3_arms_down.png', color: '#F97316', personality: 'Creativa' },

    // --- SEXTO (6th Grade) - Elite 3D Collection ---
    { id: 'g6_boy_1', name: 'Andrés Elite', description: 'Versión avanzada para sexto grado.', grade: 6, imageUrl: '/avatars/g5_boy_1.png', color: '#1E40AF', personality: 'Enfocado' },
    { id: 'g6_boy_2', name: 'Mateo Pro', description: 'Liderazgo 3D.', grade: 6, imageUrl: '/avatars/g5_boy_2.png', color: '#065F46', personality: 'Líder' },
    { id: 'g6_boy_3', name: 'Santi Master', description: 'Maestro del diseño.', grade: 6, imageUrl: '/avatars/g5_boy_3.png', color: '#92400E', personality: 'Experto' },
    { id: 'g6_girl_1', name: 'Lucía Elite', description: 'Visión de futuro para sexto.', grade: 6, imageUrl: '/avatars/g5_girl_1_1769540901853.png', color: '#9D174D', personality: 'Visionaria' },
    { id: 'g6_girl_2', name: 'Emma Pro', description: 'Atleta master.', grade: 6, imageUrl: '/avatars/g5_girl_2_1769540916141.png', color: '#5B21B6', personality: 'Persistente' },
    { id: 'g6_girl_3', name: 'Sara Master', description: 'Arte avanzado en 3D.', grade: 6, imageUrl: '/avatars/g5_girl_3_1769540930925.png', color: '#9A3412', personality: 'Innovadora' },

    // --- SÉPTIMO (7th Grade) - Cosmic 3D Collection ---
    { id: 'g7_boy_1', name: 'Andrés Cósmico', description: 'Último nivel escolar.', grade: 7, imageUrl: '/avatars/g5_boy_1.png', color: '#000000', personality: 'Sabio' },
    { id: 'g7_boy_2', name: 'Mateo Cósmico', description: 'Explorador del infinito.', grade: 7, imageUrl: '/avatars/g5_boy_2.png', color: '#111827', personality: 'Sereno' },
    { id: 'g7_girl_1', name: 'Lucía Cósmica', description: 'Liderazgo intergaláctico.', grade: 7, imageUrl: '/avatars/g5_girl_1_1769540901853.png', color: '#312E81', personality: 'Brillante' },
    { id: 'g7_girl_2', name: 'Emma Cósmica', description: 'Energía de las estrellas.', grade: 7, imageUrl: '/avatars/g5_girl_2_1769540916141.png', color: '#4C1D95', personality: 'Radiante' },

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
