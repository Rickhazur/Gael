export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AccessoryType = 'head' | 'face' | 'glasses' | 'torso' | 'sticker' | 'legs' | 'socks' | 'feet' | 'back' | 'pet' | 'effect' | 'hand' | 'watch';
export type UnlockCondition = 'coins_earned' | 'level' | 'mission' | 'event' | 'none';

export interface Avatar {
    id: string;
    name: string;
    description: string;
    personality: string;
    colors: string[];
    style: string;
    baseImage: string;
    offsets?: Partial<Record<AccessoryType, { x: number, y: number, scale: number, rotate?: number }>>;
}

export interface Accessory {
    id: string;
    name: string;
    type: AccessoryType;
    rarity: Rarity;
    cost: number;
    conditionType: UnlockCondition;
    conditionValue?: number | string;
    icon: string;
    backIcon?: string; // For layered rendering (e.g. back of the collar)
}

// Standard Humanoid Offsets for consistent jersey/accessory fitment
const SIMPLE_3D_OFFSETS = {
    head: { x: 0, y: -2, scale: 0.95 },
    face: { x: 0, y: 10, scale: 0.9 },
    torso: { x: 0, y: 0, scale: 1 },
    watch: { x: -4, y: -12, scale: 1.1, rotate: -12 }
};

// 1st Grade Avatars (Fantasy Animals & Cute Heroes - Standardized Pose)
export const AVATARS_GRADE_1: Avatar[] = [
    {
        id: 'g1_bunny',
        name: 'Super Conejo',
        description: 'Salta muy alto y es muy rápido.',
        personality: 'Enérgico',
        colors: ['#FFC0CB', '#FFFFFF'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g1_dino',
        name: 'Dino Rex',
        description: 'Un pequeño T-Rex con gran corazón.',
        personality: 'Valiente',
        colors: ['#32CD32', '#FFFF00'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g1_knight',
        name: 'Caballero Mini',
        description: 'Defensor del castillo de juguetes.',
        personality: 'Noble',
        colors: ['#C0C0C0', '#4169E1'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g1_cat',
        name: 'Gato Mágico',
        description: 'Tiene siete vidas y muchos trucos.',
        personality: 'Astuto',
        colors: ['#FFA500', '#FFFFFF'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_girl_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g1_robot',
        name: 'Robo-Amigo',
        description: 'Un robot que ayuda con las tareas.',
        personality: 'Inteligente',
        colors: ['#00BFFF', '#CCCCCC'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g1_hero_girl',
        name: 'Chica Maravilla',
        description: 'Salva el día con su súper fuerza.',
        personality: 'Fuerte',
        colors: ['#FF4500', '#FFD700'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_girl_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g1_hero_boy',
        name: 'Chico Rayo',
        description: 'Corre más rápido que el viento.',
        personality: 'Veloz',
        colors: ['#FFFF00', '#FF0000'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    }
];

// 2nd Grade Avatars (Adventure & Nature - Standardized Pose)
export const AVATARS_GRADE_2: Avatar[] = [
    {
        id: 'g2_explorer_g',
        name: 'Exploradora de la Selva',
        description: 'Descubre templos antiguos.',
        personality: 'Curiosa',
        colors: ['#228B22', '#F4A460'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_girl_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g2_explorer_b',
        name: 'Explorador del Desierto',
        description: 'Encuentra tesoros en la arena.',
        personality: 'Aventurero',
        colors: ['#DAA520', '#A52A2A'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g2_mermaid',
        name: 'Sirena del Mar',
        description: 'Protege los océanos y corales.',
        personality: 'Protectora',
        colors: ['#00CED1', '#FF1493'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_girl_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g2_pirate',
        name: 'Pirata Valiente',
        description: 'Navega los siete mares.',
        personality: 'Temerario',
        colors: ['#000000', '#FF0000'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g2_fairy',
        name: 'Hada del Bosque',
        description: 'Cuida de las plantas y flores.',
        personality: 'Dulce',
        colors: ['#32CD32', '#FFC0CB'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_girl_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g2_elf',
        name: 'Elfo Arquero',
        description: 'Tiene una puntería perfecta.',
        personality: 'Certero',
        colors: ['#006400', '#8B4513'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g2_doc',
        name: 'Doctora Juguetes',
        description: 'Cura a todos sus amigos peluches.',
        personality: 'Cuidadosa',
        colors: ['#FFFFFF', '#FF69B4'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_girl_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g2_builder',
        name: 'Constructor Maestro',
        description: 'Puede construir cualquier cosa.',
        personality: 'Creativo',
        colors: ['#FFA500', '#0000FF'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    }
];

// 3rd Grade Avatars (Fantasy Classes & Cool Kids - Unique Characters, Ages 8-9)
export const AVATARS_GRADE_3: Avatar[] = [
    {
        id: 'g3_princess',
        name: 'Luna (Princesa Hada)',
        description: 'Usa magia de estrellas para ayudar.',
        personality: 'Amable',
        colors: ['#FF69B4', '#DA70D6'],
        style: 'Simple 3D',
        baseImage: '/avatars/g3_girl_princess.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g3_wizard',
        name: 'Aprendiz de Mago',
        description: 'Estudia hechizos antiguos.',
        personality: 'Sabio',
        colors: ['#4B0082', '#DAA520'],
        style: 'Simple 3D',
        baseImage: '/avatars/g3_boy_wizard.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g3_witch',
        name: 'Brujita Estelar',
        description: 'Vuela en escoba por la galaxia.',
        personality: 'Misteriosa',
        colors: ['#9932CC', '#000000'],
        style: 'Simple 3D',
        baseImage: '/avatars/g3_girl_witch.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g3_skater_g',
        name: 'Skater Pro',
        description: 'Domina las rampas y trucos.',
        personality: 'Radical',
        colors: ['#FF00FF', '#00FFFF'],
        style: 'Simple 3D',
        baseImage: '/avatars/g3_girl_skater.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g3_skater_b',
        name: 'Roller King',
        description: 'El más rápido sobre ruedas.',
        personality: 'Veloz',
        colors: ['#0000FF', '#FFFF00'],
        style: 'Simple 3D',
        baseImage: '/avatars/g3_boy_skater.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g3_detective',
        name: 'Detective Joven',
        description: 'Resuelve misterios difíciles.',
        personality: 'Analítico',
        colors: ['#8B4513', '#F5DEB3'],
        style: 'Simple 3D',
        baseImage: '/avatars/g3_boy_detective.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g3_ninja',
        name: 'Mini Ninja',
        description: 'Silencioso como una sombra.',
        personality: 'Sigiloso',
        colors: ['#000000', '#FF0000'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g3_artist',
        name: 'Artista Colorida',
        description: 'Pinta el mundo de colores.',
        personality: 'Expresiva',
        colors: ['#FF1493', '#00CED1'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_girl_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g3_rock',
        name: 'Estrella de Rock',
        description: 'Toca la guitarra eléctrica.',
        personality: 'Ruidoso',
        colors: ['#000000', '#FFD700'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    }
];

// 4th Grade Avatars (Standardized to Simple 3D for perfect fit)
export const AVATARS_GRADE_4: Avatar[] = [
    {
        id: 'g4_astro',
        name: 'Astro-Explorer',
        description: 'Explora el cosmos digital con su traje de última generación.',
        personality: 'Curioso y Valiente',
        colors: ['#00BFFF', '#CCCCCC'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g4_pixel',
        name: 'Pixel Paladin',
        description: 'Defensor del reino con armadura de vóxels.',
        personality: 'Leal y Fuerte',
        colors: ['#A9A9A9', '#00FF7F'],
        style: 'Simple 3D',
        baseImage: '/avatars/g4_pixel.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g4_street',
        name: 'Street Stylist',
        description: 'Marca tendencia con su estilo urbano único.',
        personality: 'Creativa y Audaz',
        colors: ['#FF69B4', '#00CED1'],
        style: 'Simple 3D',
        baseImage: '/avatars/g4_street.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g4_tech',
        name: 'Tech Savvy',
        description: 'Experto en gadgets y soluciones inteligentes.',
        personality: 'Inteligente y Práctico',
        colors: ['#FFA500', '#2F4F4F'],
        style: 'Simple 3D',
        baseImage: '/avatars/g4_tech.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g4_anime',
        name: 'Anime Ace',
        description: 'Espadachina tradicional con un toque moderno.',
        personality: 'Disciplinada y Veloz',
        colors: ['#FFC0CB', '#800080'],
        style: 'Simple 3D',
        baseImage: '/avatars/g4_anime.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g4_gamer',
        name: 'Gamer Guru',
        description: 'Capitán del equipo de e-sports.',
        personality: 'Competitivo y Estratega',
        colors: ['#FF4500', '#111111'],
        style: 'Simple 3D',
        baseImage: '/avatars/g4_gamer.png',
        offsets: SIMPLE_3D_OFFSETS
    }
];

// 5th Grade Avatars (Based on Screenshot 2)
// 5th Grade Avatars (Nova Simple Collection - Pilot 2026)
export const AVATARS_GRADE_5: Avatar[] = [
    {
        id: 'g5_boy_1',
        name: 'Andrés (Simple)',
        description: 'Avatar base con camiseta blanca, ideal para personalizar.',
        personality: 'Equilibrado',
        colors: ['#FFFFFF', '#3B82F6'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g5_boy_2',
        name: 'Mateo (Simple)',
        description: 'Avatar base con cabello rizado y estilo limpio.',
        personality: 'Alegre',
        colors: ['#FFFFFF', '#10B981'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g5_boy_3',
        name: 'Santi (Simple)',
        description: 'Avatar base rubio con diseño minimalista.',
        personality: 'Curioso',
        colors: ['#FFFFFF', '#F59E0B'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g5_boy_4',
        name: 'Kenji (Simple)',
        description: 'Avatar base de estilo urbano y despejado.',
        personality: 'Enfocado',
        colors: ['#FFFFFF', '#EF4444'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g5_girl_1',
        name: 'Lucía (Simple)',
        description: 'Avatar base femenino con diseño limpio y moderno.',
        personality: 'Líder',
        colors: ['#FFFFFF', '#EC4899'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_girl_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g5_girl_2',
        name: 'Emma (Simple)',
        description: 'Avatar base femenino con un look deportivo y sencillo.',
        personality: 'Dinámica',
        colors: ['#FFFFFF', '#8B5CF6'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_girl_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g5_girl_3',
        name: 'Sara (Simple)',
        description: 'Avatar base femenino con rasgos expresivos y neutros.',
        personality: 'Creativa',
        colors: ['#FFFFFF', '#F97316'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_girl_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g5_girl_4',
        name: 'Mía (Simple)',
        description: 'Avatar base femenino ideal para cualquier accesorio.',
        personality: 'Inteligente',
        colors: ['#FFFFFF', '#06B6D4'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_girl_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    }
];

// 6th Grade Avatars (Pre-teens 11-12 years - Nova Intermediate Collection)
export const AVATARS_GRADE_6: Avatar[] = [
    {
        id: 'g6_boy_diego',
        name: 'Diego (Estratega)',
        description: 'Lidera expediciones y resuelve acertijos complejos.',
        personality: 'Estratega',
        colors: ['#FFFFFF', '#2563EB'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g6_girl_valentina',
        name: 'Valentina (Carismática)',
        description: 'Inspira a todos con su visión y determinación.',
        personality: 'Carismática',
        colors: ['#FFFFFF', '#DB2777'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_girl_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g6_boy_tomas',
        name: 'Tomás (Ingenioso)',
        description: 'Crea máquinas increíbles con materiales reciclados.',
        personality: 'Ingenioso',
        colors: ['#FFFFFF', '#059669'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g6_girl_camila',
        name: 'Camila (Visionaria)',
        description: 'Transforma ideas en arte digital impresionante.',
        personality: 'Visionaria',
        colors: ['#FFFFFF', '#9333EA'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_girl_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    }
];

// 7th Grade Avatars (Early teens 12-13 years - Nova Advanced Collection)
export const AVATARS_GRADE_7: Avatar[] = [
    {
        id: 'g7_boy_sebastian',
        name: 'Sebastián (Visionario)',
        description: 'Ve el futuro con claridad y lidera el cambio.',
        personality: 'Visionario',
        colors: ['#FFFFFF', '#1D4ED8'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g7_girl_mariana',
        name: 'Mariana (Emprendedora)',
        description: 'Lidera startups y cambia el mundo.',
        personality: 'Emprendedora',
        colors: ['#FFFFFF', '#BE185D'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_girl_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g7_boy_samuel',
        name: 'Samuel (Hacker Ético)',
        description: 'Protege el mundo digital con sus habilidades.',
        personality: 'Protector',
        colors: ['#FFFFFF', '#047857'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_boy_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    },
    {
        id: 'g7_girl_gabriela',
        name: 'Gabriela (Metódica)',
        description: 'Investiga los misterios de la vida y la materia.',
        personality: 'Metódica',
        colors: ['#FFFFFF', '#7E22CE'],
        style: 'Simple 3D',
        baseImage: '/avatars/g5_girl_relaxed.png',
        offsets: SIMPLE_3D_OFFSETS
    }
];

// Combine all avatars for the main export
export const AVATARS: Avatar[] = [
    ...AVATARS_GRADE_1,
    ...AVATARS_GRADE_2,
    ...AVATARS_GRADE_3,
    ...AVATARS_GRADE_4,
    ...AVATARS_GRADE_5,
    ...AVATARS_GRADE_6,
    ...AVATARS_GRADE_7
];

export const ACCESSORIES: Accessory[] = [
    // --- HEAD (CABEZA) REMOVED ---

    // --- GLASSES (GAFAS) - ELITE & PREMIUM COLLECTION ---
    {
        id: 'acc_glasses_fire_wings',
        name: 'Alas de Fuego Eterno (Legendary)',
        type: 'glasses', rarity: 'legendary', cost: 2800, conditionType: 'none',
        icon: '/accessories/glass_fire_wings.png'
    },
    {
        id: 'acc_glasses_tech_tracker',
        name: 'Visor Táctico V-99 (Legendary)',
        type: 'glasses', rarity: 'legendary', cost: 3000, conditionType: 'none',
        icon: '/accessories/glass_tech_tracker.png'
    },
    {
        id: 'acc_glasses_astro_hud',
        name: 'Holo-Visor Estelar (Legendary)',
        type: 'glasses', rarity: 'legendary', cost: 3500, conditionType: 'none',
        icon: '/accessories/glass_astro_visor.png'
    },
    {
        id: 'acc_glasses_phoenix_wings',
        name: 'Alas de Fénix Tropical (Sin Patas)',
        type: 'glasses', rarity: 'legendary', cost: 1500, conditionType: 'none',
        icon: '/accessories/glass_wings.png'
    },
    {
        id: 'acc_glasses_holo_butterfly',
        name: 'Alas de Mariposa Prismáticas',
        type: 'glasses', rarity: 'legendary', cost: 2500, conditionType: 'none',
        icon: '/accessories/glass_wings.png'
    },
    { id: 'acc_glasses_cat_cosmic', name: 'Gato Cósmico (Premium)', type: 'glasses', rarity: 'legendary', cost: 1200, conditionType: 'none', icon: '/accessories/glass_cat.png' },
    { id: 'acc_glasses_puppy_play', name: 'Puppy Play (Premium)', type: 'glasses', rarity: 'epic', cost: 850, conditionType: 'none', icon: '/accessories/glass_puppy.png' },
    { id: 'acc_glasses_owl_bronze', name: 'Búho de Bronce Antiguo', type: 'glasses', rarity: 'epic', cost: 900, conditionType: 'none', icon: '/accessories/glass_simple.png' },



    // --- TORSO / BELT REMOVED ITEMS WITHOUT IMAGES ---

    // --- STICKERS ESTADIOS MUNDIAL 2026 (USA) ---
    { id: 'acc_sticker_stadium_atlanta', name: 'Mercedes-Benz Stadium (Atlanta)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '/avatars/stickers/stadium_atlanta.png' },
    { id: 'acc_sticker_stadium_boston', name: 'Gillette Stadium (Boston)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '/avatars/stickers/stadium_boston.png' },
    { id: 'acc_sticker_stadium_dallas', name: 'AT&T Stadium (Dallas)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '/avatars/stickers/stadium_dallas.png' },
    { id: 'acc_sticker_stadium_houston', name: 'NRG Stadium (Houston)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '/avatars/stickers/stadium_houston.png' },
    { id: 'acc_sticker_stadium_kc', name: 'Arrowhead Stadium (Kansas City)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '/avatars/stickers/stadium_kc.png' },
    { id: 'acc_sticker_stadium_la', name: 'SoFi Stadium (Los Angeles)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '/avatars/stickers/stadium_la.png' },
    { id: 'acc_sticker_stadium_miami', name: 'Hard Rock Stadium (Miami)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '/avatars/stickers/stadium_miami.png' },
    { id: 'acc_sticker_stadium_ny', name: 'MetLife Stadium (NY/NJ)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '/avatars/stickers/stadium_ny.png' },
    { id: 'acc_sticker_stadium_philly', name: 'Lincoln Financial Field (Philly)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '/avatars/stickers/stadium_philly.png' },
    { id: 'acc_sticker_stadium_sf', name: 'Levi\'s Stadium (San Francisco)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '/avatars/stickers/stadium_sf.png' },
    { id: 'acc_sticker_stadium_seattle', name: 'Lumen Field (Seattle)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '/avatars/stickers/stadium_seattle.png' },

    // --- RELOJES PREMIUM (WATCHES) ---
    { id: 'acc_watch_elite_gmpt', name: 'Smartwatch Elite Pro', type: 'watch', rarity: 'legendary', cost: 1500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_6y3whi6y3whi6y3w.png' },

    // --- ÚTILES DE CLASE REMOVED ITEMS WITHOUT IMAGES ---

    // --- COLECCIÓN DE MALETAS MEGA PREMIUM 3D ---
    { id: 'acc_backpack_cyber_x', name: 'Maleta Cyber X-Treme', type: 'back', rarity: 'legendary', cost: 1800, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_Generated_Image_yhqyhxyhqyhxyhqy.png' },
    { id: 'acc_backpack_galaxy_star', name: 'Maleta Galaxy Star', type: 'back', rarity: 'legendary', cost: 1800, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_Generated_Image_vdc3nivdc3nivdc3.png' },
    { id: 'acc_backpack_mecha_core', name: 'Maleta Mecha Core V2', type: 'back', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_Generated_Image_obsjp3obsjp3obsj.png' },
    { id: 'acc_backpack_fairy_dust', name: 'Maleta Hada Mágica', type: 'back', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_Generated_Image_m0cmsqm0cmsqm0cm.png' },
    { id: 'acc_backpack_neon_pulse', name: 'Maleta Neon Pulse', type: 'back', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_Generated_Image_jbahlqjbahlqjbah.png' },
    { id: 'acc_backpack_crystal_gem', name: 'Maleta Crystal Gem', type: 'back', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_Generated_Image_bmclq6bmclq6bmcl.png' },
    { id: 'acc_backpack_neon_nova', name: 'Maleta Neo-Nova (Premium)', type: 'back', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_4s7p.png' },
    { id: 'acc_backpack_astronaut', name: 'Maleta Astronauta Pro', type: 'back', rarity: 'legendary', cost: 2000, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_Generated_Image_an27ppan27ppan27.png' },
    // --- ÚTILES DE CLASE REMOVED ITEMS WITHOUT IMAGES ---

    // --- NOVA SOCCER PRO 2026 REMOVED ---

    { id: 'acc_jersey_pro_retro', name: 'Camiseta Pro Retro Edition', type: 'torso', rarity: 'epic', cost: 450, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_dx3jofdx3jofdx3j.png' },
    { id: 'acc_jersey_pro_diamond', name: 'Camiseta Pro Diamond Edition', type: 'torso', rarity: 'legendary', cost: 1500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_es3k4bes3k4bes3k.png' },
    { id: 'acc_jersey_pro_black', name: 'Camiseta Pro Black Edition', type: 'torso', rarity: 'legendary', cost: 1200, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_z53g7qz53g7qz53g.png' },
    { id: 'acc_jersey_spiderman_3d', name: 'Camiseta Spiderman 3D', type: 'torso', rarity: 'legendary', cost: 1200, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_prgeelprgeelprge.png' },

    // --- NOVA EXCLUSIVE COLLECTION (PERFECT FIT) ---
    { id: 'acc_jersey_nova_official', name: 'Camiseta Nova Oficial', type: 'torso', rarity: 'legendary', cost: 100, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_xns16exns16exns1.png' },
    { id: 'acc_jersey_velocidad', name: 'Camiseta Velocidad Explosiva', type: 'torso', rarity: 'legendary', cost: 500, conditionType: 'none', icon: '/avatars/jerseys/image (2).png' },
    { id: 'acc_jersey_nova_premium', name: 'Camiseta Super Héroes Nova', type: 'torso', rarity: 'legendary', cost: 200, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_e9mtfoe9mtfoe9mt.png' },
    { id: 'acc_jersey_nova_gold', name: 'Camiseta Nova Gold', type: 'torso', rarity: 'legendary', cost: 50, conditionType: 'none', icon: '/avatars/jerseys/jersey_monster_blue.png' },
    { id: 'acc_jersey_nova_neon', name: 'Camiseta Nova Neon', type: 'torso', rarity: 'epic', cost: 50, conditionType: 'none', icon: '/avatars/jerseys/jersey_flash_green.png' },
    { id: 'acc_jersey_gemini_45wt', name: 'Camiseta Gemini Special Edition', type: 'torso', rarity: 'legendary', cost: 1200, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_45wtsz45wtsz45wt.png' },
    { id: 'acc_jersey_gemini_qcfk', name: 'Camiseta Gemini Supernova', type: 'torso', rarity: 'legendary', cost: 1200, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_qcfk8jqcfk8jqcfk.png' },
    { id: 'acc_jersey_gemini_aigen_1', name: 'Camiseta Gemini Quantum', type: 'torso', rarity: 'legendary', cost: 1200, conditionType: 'none', icon: '/avatars/jerseys/jersey_nova_aigen_1.png' },
    { id: 'acc_jersey_gemini_aigen_2', name: 'Camiseta Gemini Cyber', type: 'torso', rarity: 'legendary', cost: 1200, conditionType: 'none', icon: '/avatars/jerseys/jersey_nova_aigen_2.png' },
    { id: 'acc_jersey_gemini_aigen_3', name: 'Camiseta Gemini Nexus', type: 'torso', rarity: 'legendary', cost: 1200, conditionType: 'none', icon: '/avatars/jerseys/jersey_nova_aigen_3.png' },
    { id: 'acc_jersey_gemini_aigen_4', name: 'Camiseta Gemini Zenith', type: 'torso', rarity: 'legendary', cost: 1200, conditionType: 'none', icon: '/avatars/jerseys/jersey_nova_aigen_4.png' },

    // --- CAMISETAS COOL KIDS 2025 (tendencias modernas, iconos: emoji fallback si no hay PNG) ---
    { id: 'acc_jersey_axolotl', name: 'Camiseta Ajolote Mágico', type: 'torso', rarity: 'epic', cost: 650, conditionType: 'none', icon: '/avatars/jerseys/jersey_axolotl.png' },
    { id: 'acc_jersey_capybara', name: 'Camiseta Capybara Chill', type: 'torso', rarity: 'epic', cost: 600, conditionType: 'none', icon: '/avatars/jerseys/jersey_capybara.png' },
    { id: 'acc_jersey_frog', name: 'Camiseta Ranita Kawaii', type: 'torso', rarity: 'rare', cost: 450, conditionType: 'none', icon: '/avatars/jerseys/jersey_frog.png' },
    { id: 'acc_jersey_rainbow', name: 'Camiseta Arcoíris Tie-Dye', type: 'torso', rarity: 'rare', cost: 500, conditionType: 'none', icon: '/avatars/jerseys/jersey_rainbow.png' },
    { id: 'acc_jersey_unicorn', name: 'Camiseta Unicornio Galáctico', type: 'torso', rarity: 'legendary', cost: 950, conditionType: 'none', icon: '/avatars/jerseys/jersey_unicorn.png' },
    { id: 'acc_jersey_dragon', name: 'Camiseta Dragón de Fuego', type: 'torso', rarity: 'legendary', cost: 1000, conditionType: 'none', icon: '/avatars/jerseys/jersey_dragon.png' },
    { id: 'acc_jersey_neon', name: 'Camiseta Neón Glow', type: 'torso', rarity: 'epic', cost: 680, conditionType: 'none', icon: '/avatars/jerseys/jersey_neon.png' },
    { id: 'acc_jersey_galaxy', name: 'Camiseta Galaxia Infinita', type: 'torso', rarity: 'legendary', cost: 900, conditionType: 'none', icon: '/avatars/jerseys/jersey_galaxy.png' },
    { id: 'acc_jersey_robot', name: 'Camiseta Robo Futuro', type: 'torso', rarity: 'epic', cost: 720, conditionType: 'none', icon: '/avatars/jerseys/jersey_robot.png' },
    { id: 'acc_jersey_anime', name: 'Camiseta Anime Power', type: 'torso', rarity: 'epic', cost: 800, conditionType: 'none', icon: '/avatars/jerseys/jersey_anime.png' },
    { id: 'acc_jersey_squish', name: 'Camiseta Squishmallow Style', type: 'torso', rarity: 'rare', cost: 550, conditionType: 'none', icon: '/avatars/jerseys/jersey_squish.png' },
    { id: 'acc_jersey_eco', name: 'Camiseta Eco Superhéroe', type: 'torso', rarity: 'rare', cost: 480, conditionType: 'none', icon: '/avatars/jerseys/jersey_eco.png' },
    { id: 'acc_jersey_butterfly', name: 'Camiseta Mariposa Y2K', type: 'torso', rarity: 'epic', cost: 650, conditionType: 'none', icon: '/avatars/jerseys/jersey_butterfly.png' },

    // --- POP-UP 3D CHARACTERS REMOVED ---


    { id: 'acc_jersey_coquette', name: 'Camiseta Coquette Bows', type: 'torso', rarity: 'epic', cost: 680, conditionType: 'none', icon: '/avatars/jerseys/jersey_coquette.png' },
    { id: 'acc_jersey_pixel', name: 'Camiseta Cyber Pixel', type: 'torso', rarity: 'epic', cost: 750, conditionType: 'none', icon: '/avatars/jerseys/jersey_pixel.png' },
    { id: 'acc_jersey_fortnite', name: 'Camiseta Battle Royale', type: 'torso', rarity: 'legendary', cost: 850, conditionType: 'none', icon: '/avatars/jerseys/jersey_fortnite.png' },
    { id: 'acc_jersey_monster', name: 'Camiseta Monstruo Cute', type: 'torso', rarity: 'rare', cost: 420, conditionType: 'none', icon: '/avatars/jerseys/jersey_monster.png' },
    { id: 'acc_jersey_sloth', name: 'Camiseta Perezoso Zen', type: 'torso', rarity: 'rare', cost: 400, conditionType: 'none', icon: '/avatars/jerseys/jersey_sloth.png' },

    // --- REMOVED LEGS AND SOCKS ---

    // --- TORSO / STICKERS REMOVED ITEMS WITHOUT IMAGES ---

    // --- STICKERS DE JUGADORES (COLECCIONABLES ELITE) ---
    { id: 'acc_sticker_messi', name: 'Sticker Lionel Messi (🇦🇷)', type: 'sticker', rarity: 'legendary', cost: 1200, conditionType: 'none', icon: '/stickers/messi.png' },
    { id: 'acc_sticker_ronaldo', name: 'Sticker Cristiano Ronaldo (🇵🇹)', type: 'sticker', rarity: 'legendary', cost: 1200, conditionType: 'none', icon: '/stickers/ronaldo.png' },
    { id: 'acc_sticker_lucho_col', name: 'Sticker Lucho Díaz (🇨🇴 - Selección)', type: 'sticker', rarity: 'legendary', cost: 1300, conditionType: 'none', icon: '/stickers/lucho.png' },
    // --- STICKERS REMOVED ITEMS WITHOUT IMAGES ---
    { id: 'acc_sticker_mbappe', name: 'Sticker Kylian Mbappé (🇫🇷)', type: 'sticker', rarity: 'legendary', cost: 1100, conditionType: 'none', icon: '/stickers/mbappe.png' },
    { id: 'acc_sticker_haaland', name: 'Sticker Erling Haaland (🇳🇴)', type: 'sticker', rarity: 'legendary', cost: 1100, conditionType: 'none', icon: '/stickers/haaland.png' },
    { id: 'acc_sticker_lamine', name: 'Sticker Lamine Yamal (🇪🇸)', type: 'sticker', rarity: 'epic', cost: 1000, conditionType: 'none', icon: '/stickers/lamine.png' },
    { id: 'acc_sticker_musiala', name: 'Sticker Jamal Musiala (🇩🇪)', type: 'sticker', rarity: 'epic', cost: 950, conditionType: 'none', icon: '/stickers/musiala.png' },
    { id: 'acc_sticker_wirtz', name: 'Sticker Florian Wirtz (🇩🇪)', type: 'sticker', rarity: 'epic', cost: 800, conditionType: 'none', icon: '/stickers/wirtz.png' },
    { id: 'acc_sticker_kane', name: 'Sticker Harry Kane (🏴󠁧󠁢󠁥󠁮󠁧󠁿)', type: 'sticker', rarity: 'epic', cost: 850, conditionType: 'none', icon: '/stickers/kane.png' },
    { id: 'acc_sticker_ballon_dor', name: 'Sticker Balón de Oro (🏆)', type: 'sticker', rarity: 'legendary', cost: 3000, conditionType: 'mission', conditionValue: 'm_all_done', icon: '/stickers/ballon_dor.png' },


    // --- ACCESORIOS DE LUJO REMOVED ---
    // --- ACCESORIOS DE LUJO (RELOJES Y MÁS) ---
    // --- RELOJES PREMIUM REMOVED ---
    { id: 'acc_watch_quantum_phantom', name: 'Quantum Phantom Watch', type: 'watch', rarity: 'legendary', cost: 3500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_9eoppp9eoppp9eop.png' },
    { id: 'acc_watch_galactic_nova', name: 'Galactic Nova Pro', type: 'watch', rarity: 'legendary', cost: 4000, conditionType: 'none', icon: '/avatars/jerseys/image (1).png' },
    { id: 'acc_watch_elite_front', name: 'Elite Chrono (Front View)', type: 'watch', rarity: 'legendary', cost: 5000, conditionType: 'none', icon: '/accessories/watch_elite_front.png' },

    // --- MEGA-COLECCIÓN DE RELOJES CHROMA (HUE-ROTATE DINÁMICOS) ---
    { id: 'acc_watch_nova_chroma_orange', name: 'Smartwatch Chroma Orange', type: 'watch', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/assets/store/watches/reloj_naranja.png' },
    { id: 'acc_watch_nova_chroma_blue', name: 'Smartwatch Chroma Blue', type: 'watch', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/assets/store/watches/reloj_azul.png' },
    { id: 'acc_watch_nova_chroma_red', name: 'Smartwatch Chroma Red', type: 'watch', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/assets/store/watches/reloj_rojo.png' },
    { id: 'acc_watch_nova_chroma_green', name: 'Smartwatch Chroma Green', type: 'watch', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/assets/store/watches/reloj_verde.png' },
    { id: 'acc_watch_nova_chroma_yellow', name: 'Smartwatch Chroma Yellow', type: 'watch', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/assets/store/watches/reloj_amarillo.png' },
    { id: 'acc_watch_nova_chroma_purple', name: 'Smartwatch Chroma Purple', type: 'watch', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/assets/store/watches/reloj_violeta.png' },
    { id: 'acc_watch_nova_chroma_pink', name: 'Smartwatch Chroma Pink', type: 'watch', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/assets/store/watches/reloj_rosa.png' },
    { id: 'acc_watch_nova_chroma_cyan', name: 'Smartwatch Chroma Cyan', type: 'watch', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/assets/store/watches/reloj_cian.png' },
    { id: 'acc_watch_nova_chroma_silver', name: 'Smartwatch Chroma Silver', type: 'watch', rarity: 'legendary', cost: 1500, conditionType: 'none', icon: '/assets/store/watches/reloj_plata.png' },
    { id: 'acc_watch_nova_chroma_gold', name: 'Smartwatch Chroma Gold', type: 'watch', rarity: 'legendary', cost: 2000, conditionType: 'none', icon: '/assets/store/watches/reloj_oro.png' },
    // --- ACCESORIOS DE LUJO REMOVED ---

    // --- ACCESORIOS AVANZADOS G6/G7 (SÓLO PRENDAS TRIDIMENSIONALES) ---
    { id: 'acc_glasses_tech_noir', name: 'Gafas Tech Noir', type: 'glasses', rarity: 'epic', cost: 1800, conditionType: 'level', conditionValue: 6, icon: '/accessories/glasses_tech_noir.png' },
    {
        id: 'acc_jersey_startup_pro',
        name: 'Jersey Startup Pro 🚀',
        type: 'torso',
        rarity: 'legendary',
        cost: 2500,
        conditionType: 'level',
        conditionValue: 7,
        icon: '/avatars/jerseys/Gemini_Generated_Image_6204zf6204zf6204.png',
        backIcon: '/avatars/jerseys/Gemini_Generated_Image_6204zf6204zf6204.png' // Lógica de sándwich automática
    },
    {
        id: 'acc_jersey_nova_elite',
        name: 'Jersey Nova Elite ✨',
        type: 'torso',
        rarity: 'legendary',
        cost: 3000,
        conditionType: 'none',
        icon: '/avatars/jerseys/Gemini_Generated_Image_z53g7qz53g7qz53g.png',
        backIcon: '/avatars/jerseys/Gemini_Generated_Image_z53g7qz53g7qz53g.png'
    },
    {
        id: 'acc_jersey_nova_aurora',
        name: 'Jersey Nova Aurora 🌈',
        type: 'torso',
        rarity: 'legendary',
        cost: 3500,
        conditionType: 'none',
        icon: '/avatars/jerseys/Gemini_Generated_Image_22ybdi22ybdi22yb.png',
        backIcon: '/avatars/jerseys/Gemini_Generated_Image_22ybdi22ybdi22yb.png'
    },
    {
        id: 'acc_jersey_nova_nebula',
        name: 'Jersey Nova Nebula 🌌',
        type: 'torso',
        rarity: 'legendary',
        cost: 3500,
        conditionType: 'none',
        icon: '/avatars/jerseys/Gemini_Generated_Image_es3k4bes3k4bes3k.png',
        backIcon: '/avatars/jerseys/Gemini_Generated_Image_es3k4bes3k4bes3k.png'
    },
    {
        id: 'acc_jersey_nova_vortex',
        name: 'Jersey Nova Vortex 🌀',
        type: 'torso',
        rarity: 'legendary',
        cost: 3500,
        conditionType: 'none',
        icon: '/avatars/jerseys/Gemini_Generated_Image_ql53drql53drql53.png',
        backIcon: '/avatars/jerseys/Gemini_Generated_Image_ql53drql53drql53.png'
    },
    {
        id: 'acc_jersey_nova_quantum',
        name: 'Jersey Nova Quantum ⚛️',
        type: 'torso',
        rarity: 'legendary',
        cost: 4000,
        conditionType: 'none',
        icon: '/avatars/jerseys/Gemini_Generated_Image_bmclq6bmclq6bmcl.png',
        backIcon: '/avatars/jerseys/Gemini_Generated_Image_bmclq6bmclq6bmcl.png'
    },
    {
        id: 'acc_jersey_nova_photon',
        name: 'Jersey Nova Photon 💡',
        type: 'torso',
        rarity: 'legendary',
        cost: 4000,
        conditionType: 'none',
        icon: '/avatars/jerseys/Gemini_Generated_Image_m0cmsqm0cmsqm0cm.png',
        backIcon: '/avatars/jerseys/Gemini_Generated_Image_m0cmsqm0cmsqm0cm.png'
    },
    {
        id: 'acc_jersey_nova_stellar',
        name: 'Jersey Nova Stellar ✨',
        type: 'torso',
        rarity: 'legendary',
        cost: 4500,
        conditionType: 'none',
        icon: '/avatars/jerseys/Gemini_Generated_Image_vdc3nivdc3nivdc3.png',
        backIcon: '/avatars/jerseys/Gemini_Generated_Image_obsjp3obsjp3obsj.png'
    },
    {
        id: 'acc_watch_nova_orbit',
        name: 'Nova Orbit Smartwatch',
        type: 'watch',
        rarity: 'legendary',
        cost: 3000,
        conditionType: 'none',
        icon: '/accessories/watch_nova_orbit_front.png',
        backIcon: '/accessories/watch_nova_orbit_back.png' // La pulsera abraza la muñeca
    },
    {
        id: 'acc_pants_tech_urban',
        name: 'Pantalones Neo-Urbanos',
        type: 'legs',
        rarity: 'epic',
        cost: 1500,
        conditionType: 'none',
        icon: '/accessories/pants_tech_urban_front.png',
        backIcon: '/accessories/pants_tech_urban_back.png' // Cintura tridimensional
    },

    // --- MOCHILAS (MORRALES MÁGICOS) ---
    {
        id: 'acc_back_superheroe',
        name: 'Morral Súper Héroe',
        type: 'back',
        rarity: 'epic',
        cost: 1200,
        conditionType: 'none',
        icon: '/accessories/back/morral_superheroe_1771699019291.png'
    },
    {
        id: 'acc_back_princesa',
        name: 'Morral de Princesa',
        type: 'back',
        rarity: 'epic',
        cost: 1200,
        conditionType: 'none',
        icon: '/accessories/back/morral_princesa_1771699034547.png'
    },
    {
        id: 'acc_back_astronauta',
        name: 'Morral Astronauta',
        type: 'back',
        rarity: 'epic',
        cost: 1200,
        conditionType: 'none',
        icon: '/accessories/back/morral_astronauta_1771699048742.png'
    },
    {
        id: 'acc_back_dino',
        name: 'Morral Dino',
        type: 'back',
        rarity: 'epic',
        cost: 1200,
        conditionType: 'none',
        icon: '/accessories/back/morral_dinosaurio_1771699064369.png'
    },
    {
        id: 'acc_back_unicornio',
        name: 'Morral Unicornio',
        type: 'back',
        rarity: 'legendary',
        cost: 1500,
        conditionType: 'none',
        icon: '/accessories/back/morral_unicornio_1771699078898.png'
    },
    {
        id: 'acc_back_pirata',
        name: 'Morral Pirata',
        type: 'back',
        rarity: 'epic',
        cost: 1200,
        conditionType: 'none',
        icon: '/accessories/back/morral_pirata_1771699093106.png'
    },
    {
        id: 'acc_back_ninja',
        name: 'Morral Ninja',
        type: 'back',
        rarity: 'epic',
        cost: 1200,
        conditionType: 'none',
        icon: '/accessories/back/morral_ninja_1771699108889.png'
    },
    {
        id: 'acc_back_monstruo',
        name: 'Morral Monstruo',
        type: 'back',
        rarity: 'epic',
        cost: 1200,
        conditionType: 'none',
        icon: '/accessories/back/morral_monstruo_1771699122116.png'
    },
    {
        id: 'acc_back_robot',
        name: 'Morral Robo-Bot',
        type: 'back',
        rarity: 'legendary',
        cost: 1500,
        conditionType: 'none',
        icon: '/accessories/back/morral_robot_1771699136488.png'
    },
    {
        id: 'acc_back_sirenita',
        name: 'Morral Sirenita',
        type: 'back',
        rarity: 'epic',
        cost: 1200,
        conditionType: 'none',
        icon: '/accessories/back/morral_sirenita_1771699148397.png'
    },

    // --- MOCHILAS LEYENDAS DEL FÚTBOL ⚽ ---
    {
        id: 'acc_back_messi',
        name: 'Morral Messi ⭐',
        type: 'back',
        rarity: 'legendary',
        cost: 2000,
        conditionType: 'none',
        icon: '/accessories/back/morral_messi.png'
    },
    {
        id: 'acc_back_cr7',
        name: 'Morral CR7 🔥',
        type: 'back',
        rarity: 'legendary',
        cost: 2000,
        conditionType: 'none',
        icon: '/accessories/back/morral_cr7.png'
    },
    {
        id: 'acc_back_neymar',
        name: 'Morral Neymar Jr ⚡',
        type: 'back',
        rarity: 'epic',
        cost: 1800,
        conditionType: 'none',
        icon: '/accessories/back/morral_neymar.png'
    },
    {
        id: 'acc_back_mbappe',
        name: 'Morral Mbappé 💨',
        type: 'back',
        rarity: 'epic',
        cost: 1800,
        conditionType: 'none',
        icon: '/accessories/back/morral_mbappe.png'
    },
    {
        id: 'acc_back_maradona',
        name: 'Morral Maradona 👑',
        type: 'back',
        rarity: 'legendary',
        cost: 2500,
        conditionType: 'none',
        icon: '/accessories/back/morral_maradona.png'
    },

    // --- JUGUETES, SNACKS Y DEPORTES REMOVED ITEMS WITHOUT IMAGES ---

    // --- MASCOTAS MÁGICAS ---
    { id: 'acc_pet_dragon', name: 'Bebé Dragón', type: 'pet', rarity: 'legendary', cost: 2500, conditionType: 'level', conditionValue: 5, icon: '/pets/dragon_baby.png' },
    { id: 'acc_pet_robot', name: 'Bebé Bot', type: 'pet', rarity: 'legendary', cost: 2500, conditionType: 'level', conditionValue: 5, icon: '/pets/robot_baby.png' },

    // --- EFFECTS ---
    // --- EFFECTS REMOVED ITEMS WITHOUT IMAGES ---
];
