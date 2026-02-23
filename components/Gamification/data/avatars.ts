export interface Accessory {
    id: string;
    name: string;
    type: 'head' | 'eyes' | 'glasses' | 'neck' | 'back' | 'hand' | 'body';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    cost: number;
    conditionType: 'none' | 'level' | 'mission';
    conditionValue?: number | string;
    icon: string;
}

export { AVATARS } from '../../../data/avatarData';

export const ACCESSORIES: Accessory[] = [
    // --- HEAD (CABEZA) ---
    { id: 'acc_crown_paper', name: 'Corona de Papel', type: 'head', rarity: 'common', cost: 75, conditionType: 'none', icon: '👑' },
    { id: 'acc_flower_crown', name: 'Corona de Flores', type: 'head', rarity: 'rare', cost: 200, conditionType: 'level', conditionValue: 2, icon: '🌸' },
    { id: 'acc_cap_lightning', name: 'Gorra de Rayo', type: 'head', rarity: 'rare', cost: 250, conditionType: 'none', icon: '🧢' },
    { id: 'acc_propeller_hat', name: 'Gorra Helice', type: 'head', rarity: 'rare', cost: 300, conditionType: 'none', icon: '🚁' },
    { id: 'acc_pirate_hat', name: 'Sombrero Pirata', type: 'head', rarity: 'epic', cost: 550, conditionType: 'none', icon: '🏴‍☠️' },
    { id: 'acc_party_hat', name: 'Gorro de Fiesta', type: 'head', rarity: 'common', cost: 100, conditionType: 'none', icon: '🥳' },
    { id: 'acc_halo', name: 'Chispas Mágicas', type: 'head', rarity: 'epic', cost: 500, conditionType: 'none', icon: '✨' },
    { id: 'acc_bow_fairy', name: 'Lazo de Hada', type: 'head', rarity: 'common', cost: 150, conditionType: 'none', icon: '🎀' },
    { id: 'acc_nova_cap', name: 'Birrete Nova', type: 'head', rarity: 'epic', cost: 600, conditionType: 'level', conditionValue: 4, icon: '🎓' },
    { id: 'acc_tophat', name: 'Sombrero de Copa', type: 'head', rarity: 'rare', cost: 300, conditionType: 'none', icon: '🎩' },
    { id: 'acc_viking', name: 'Casco Valiente', type: 'head', rarity: 'epic', cost: 550, conditionType: 'none', icon: '🪖' },
    { id: 'acc_tiara_princess', name: 'Tiara Real (💎)', type: 'head', rarity: 'legendary', cost: 2000, conditionType: 'mission', conditionValue: 'm_all_done', icon: '👑' },
    { id: 'acc_headphones_gamer', name: 'Audífonos Gamer RGB', type: 'head', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '🎧' },
    { id: 'acc_bunny_ears', name: 'Orejas de Conejito', type: 'head', rarity: 'common', cost: 200, conditionType: 'none', icon: '🐰' },

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
        id: 'acc_glasses_cyber_neon',
        name: 'Visor Neón Cyberpunk',
        type: 'glasses', rarity: 'legendary', cost: 4000, conditionType: 'none',
        icon: '👓'
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
    {
        id: 'acc_glasses_cyber_dragon',
        name: 'Visor Dragón Cibernético (Elite)',
        type: 'glasses', rarity: 'legendary', cost: 4500, conditionType: 'none',
        icon: '🐉'
    },
    { id: 'acc_glasses_cat_cosmic', name: 'Gato Cósmico (Premium)', type: 'glasses', rarity: 'legendary', cost: 1200, conditionType: 'none', icon: '/accessories/glass_cat.png' },
    { id: 'acc_glasses_puppy_play', name: 'Puppy Play (Premium)', type: 'glasses', rarity: 'epic', cost: 850, conditionType: 'none', icon: '/accessories/glass_puppy.png' },
    { id: 'acc_glasses_owl_bronze', name: 'Búho de Bronce Antiguo', type: 'glasses', rarity: 'epic', cost: 900, conditionType: 'none', icon: '/accessories/glass_simple.png' },

    // --- TORSO / BELT REMOVED ITEMS WITHOUT IMAGES ---

    // --- STICKERS ESTADIOS MUNDIAL 2026 (USA) ---
    { id: 'acc_sticker_stadium_atlanta', name: 'Mercedes-Benz Stadium (Atlanta)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '🏟️' },
    { id: 'acc_sticker_stadium_boston', name: 'Gillette Stadium (Boston)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '🏟️' },
    { id: 'acc_sticker_stadium_dallas', name: 'AT&T Stadium (Dallas)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '🏟️' },
    { id: 'acc_sticker_stadium_houston', name: 'NRG Stadium (Houston)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '🏟️' },
    { id: 'acc_sticker_stadium_kc', name: 'Arrowhead Stadium (Kansas City)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '🏟️' },
    { id: 'acc_sticker_stadium_la', name: 'SoFi Stadium (Los Angeles)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '🏟️' },
    { id: 'acc_sticker_stadium_miami', name: 'Hard Rock Stadium (Miami)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '🏟️' },
    { id: 'acc_sticker_stadium_ny', name: 'MetLife Stadium (NY/NJ)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '🏟️' },
    { id: 'acc_sticker_stadium_philly', name: 'Lincoln Financial Field (Philly)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '🏟️' },
    { id: 'acc_sticker_stadium_sf', name: 'Levi\'s Stadium (San Francisco)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '🏟️' },
    { id: 'acc_sticker_stadium_seattle', name: 'Lumen Field (Seattle)', type: 'sticker', rarity: 'epic', cost: 500, conditionType: 'none', icon: '🏟️' },

    { id: 'acc_belt_phone', name: 'Celular Cinturón', type: 'torso', rarity: 'rare', cost: 400, conditionType: 'none', icon: '📱' },
    { id: 'acc_belt_walkie', name: 'Walkie Cinturón', type: 'torso', rarity: 'rare', cost: 350, conditionType: 'level', conditionValue: 3, icon: '📻' },
    { id: 'acc_belt_bag', name: 'Riñonera Pro', type: 'torso', rarity: 'common', cost: 150, conditionType: 'none', icon: '👝' },
    { id: 'acc_compass', name: 'Brújula Cinturón', type: 'torso', rarity: 'common', cost: 100, conditionType: 'none', icon: '🧭' },
    { id: 'acc_watch', name: 'Reloj Pulsera', type: 'watch', rarity: 'rare', cost: 400, conditionType: 'none', icon: '⌚' },

    // --- RELOJES PREMIUM (WATCHES) ---
    { id: 'acc_watch_elite_gmpt', name: 'Smartwatch Elite Pro', type: 'watch', rarity: 'legendary', cost: 1500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_6y3whi6y3whi6y3w.png' },

    // --- COLECCIÓN DE MALETAS MEGA PREMIUM 3D ---
    { id: 'acc_backpack_cyber_x', name: 'Maleta Cyber X-Treme', type: 'back', rarity: 'legendary', cost: 1800, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_Generated_Image_yhqyhxyhqyhxyhqy.png' },
    { id: 'acc_backpack_galaxy_star', name: 'Maleta Galaxy Star', type: 'back', rarity: 'legendary', cost: 1800, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_Generated_Image_vdc3nivdc3nivdc3.png' },
    { id: 'acc_backpack_mecha_core', name: 'Maleta Mecha Core V2', type: 'back', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_Generated_Image_obsjp3obsjp3obsj.png' },
    { id: 'acc_backpack_fairy_dust', name: 'Maleta Hada Mágica', type: 'back', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_Generated_Image_m0cmsqm0cmsqm0cm.png' },
    { id: 'acc_backpack_neon_pulse', name: 'Maleta Neon Pulse', type: 'back', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_Generated_Image_jbahlqjbahlqjbah.png' },
    { id: 'acc_backpack_crystal_gem', name: 'Maleta Crystal Gem', type: 'back', rarity: 'epic', cost: 1200, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_Generated_Image_bmclq6bmclq6bmcl.png' },
    { id: 'acc_backpack_neon_nova', name: 'Maleta Neo-Nova (Premium)', type: 'back', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_4s7p.png' },
    { id: 'acc_backpack_astronaut', name: 'Maleta Astronauta Pro', type: 'back', rarity: 'legendary', cost: 2000, conditionType: 'none', icon: '/avatars/backpacks/bag_Gemini_Generated_Image_an27ppan27ppan27.png' },

    // --- NOVA SOCCER PRO 2026 (GRADO 5) ---
    // LEGENDARY (2500)
    { id: 'acc_jersey_colombia_pro', name: '¡NUEVA! Colombia Edition Pro #10', type: 'torso', rarity: 'legendary', cost: 3000, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_6204zf6204zf6204.png' },
    { id: 'acc_jersey_colombia_james', name: 'Colombia - James Rodriguez #7', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_73ndea73ndea73nd.png' },
    { id: 'acc_jersey_bayern_lucho', name: 'Bayern - Luis Díaz #7', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/bayern_lucho.jpg' },
    { id: 'acc_shorts_bayern', name: 'Shorts Bayern Red', type: 'legs', rarity: 'rare', cost: 1200, conditionType: 'none', icon: '/avatars/jerseys/shorts_bayern.jpg' },
    { id: 'acc_jersey_argentina_messi', name: 'Argentina - Messi #10 (New)', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_azhtclazhtclazht.png' },
    { id: 'acc_jersey_argentina_messi_v1', name: 'Argentina - Messi #10 (Classic)', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_72cwvn72cwvn72cw.png' },
    { id: 'acc_jersey_madrid', name: 'Real Madrid - Mbappé #10', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_ql53drql53drql53.png' },
    { id: 'acc_jersey_city', name: 'Man City - Haaland #9', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_oi3sk1oi3sk1oi3s.png' },
    { id: 'acc_jersey_alnassr', name: 'Al-Nassr - Ronaldo #7', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_jbahlqjbahlqjbah.png' },
    { id: 'acc_jersey_barca', name: 'FC Barcelona - Lamine #10', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_bmclq6bmclq6bmcl.png' },
    { id: 'acc_jersey_liverpool', name: 'Liverpool - Salah #11', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_m0cmsqm0cmsqm0cm.png' },
    { id: 'acc_jersey_portugal_ronaldo', name: 'Portugal - Ronaldo #7', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_vdc3nivdc3nivdc3.png' },

    { id: 'acc_jersey_colombia_7', name: 'Colombia - Luis Díaz #7', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_6204zf6204zf6204.png' },

    // SELECCIONES - JUGADORES FAMOSOS (misma imagen plana: poner archivo en public/avatars/jerseys/)
    { id: 'acc_jersey_monster_blue', name: 'Camiseta Monstruo Azul', type: 'torso', rarity: 'epic', cost: 1800, conditionType: 'none', icon: '/avatars/jerseys/jersey_monster_blue.png' },
    { id: 'acc_jersey_brasil_vinicius', name: 'Brasil - Vinicius Jr #7', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_f9fg55f9fg55f9fg.png' },
    { id: 'acc_jersey_flash_green', name: 'Camiseta Flash Verde', type: 'torso', rarity: 'epic', cost: 1800, conditionType: 'none', icon: '/avatars/jerseys/jersey_flash_green.png' },
    { id: 'acc_jersey_espana_morata', name: 'España - Morata #7', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_yhqyhxyhqyhxyhqy.png' },
    { id: 'acc_jersey_espana_pedri', name: 'España - Pedri #8', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_an27ppan27ppan27.png' },
    { id: 'acc_jersey_alemania_musiala', name: 'Alemania - Musiala #10', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_gkurxkgkurxkgkur.png' },
    { id: 'acc_jersey_inglaterra_kane', name: 'Inglaterra - Kane #9', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_j4n6wqj4n6wqj4n6.png' },
    { id: 'acc_jersey_inglaterra_bellingham', name: 'Inglaterra - Bellingham #10', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_k01nsqk01nsqk01n.png' },
    { id: 'acc_jersey_uruguay_valverde', name: 'Uruguay - Valverde #15', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '🇺🇾' },
    { id: 'acc_jersey_uruguay_nunez', name: 'Uruguay - Núñez #9', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '🇺🇾' },
    { id: 'acc_jersey_mexico_lozano', name: 'México - Lozano #22', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '🇲🇽' },
    { id: 'acc_jersey_chile_sanchez', name: 'Chile - Sánchez #7', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '🇨🇱' },
    { id: 'acc_jersey_ecuador_valencia', name: 'Ecuador - Valencia #13', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '🇪🇨' },
    { id: 'acc_jersey_peru_guerrero', name: 'Perú - Guerrero #9', type: 'torso', rarity: 'epic', cost: 1500, conditionType: 'none', icon: '🇵🇪' },
    { id: 'acc_jersey_venezuela_rondon', name: 'Venezuela - Rondón #23', type: 'torso', rarity: 'epic', cost: 1500, conditionType: 'none', icon: '🇻🇪' },
    { id: 'acc_jersey_usa_pulisic', name: 'USA - Pulisic #10', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '🇺🇸' },
    { id: 'acc_jersey_costa_rica_navas', name: 'Costa Rica - Keylor Navas #1', type: 'torso', rarity: 'epic', cost: 1500, conditionType: 'none', icon: '🇨🇷' },
    { id: 'acc_jersey_holanda_gakpo', name: 'Holanda - Gakpo #11', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '🇳🇱' },
    { id: 'acc_jersey_belgica_debruyne', name: 'Bélgica - De Bruyne #7', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '🇧🇪' },
    { id: 'acc_jersey_italia_chiellini', name: 'Italia - Selección #3', type: 'torso', rarity: 'legendary', cost: 2500, conditionType: 'none', icon: '🇮🇹' },

    { id: 'acc_jersey_bayern_kane', name: 'Bayern - Harry Kane #9', type: 'torso', rarity: 'epic', cost: 1500, conditionType: 'none', icon: '/avatars/jerseys/Gemini_Generated_Image_2j52142j52142j52.png' },

    // --- CAMISETAS COOL KIDS 2025 (tendencias modernas, iconos: emoji fallback si no hay PNG) ---
    { id: 'acc_jersey_axolotl', name: 'Camiseta Ajolote Mágico', type: 'torso', rarity: 'epic', cost: 650, conditionType: 'none', icon: '🦎' },
    { id: 'acc_jersey_capybara', name: 'Camiseta Capybara Chill', type: 'torso', rarity: 'epic', cost: 600, conditionType: 'none', icon: '🦦' },
    { id: 'acc_jersey_frog', name: 'Camiseta Ranita Kawaii', type: 'torso', rarity: 'rare', cost: 450, conditionType: 'none', icon: '🐸' },
    { id: 'acc_jersey_space', name: 'Camiseta Astronauta Cosmos', type: 'torso', rarity: 'epic', cost: 750, conditionType: 'none', icon: '🚀' },
    { id: 'acc_jersey_dino', name: 'Camiseta Dino Rex', type: 'torso', rarity: 'epic', cost: 700, conditionType: 'none', icon: '🦖' },
    { id: 'acc_jersey_rainbow', name: 'Camiseta Arcoíris Tie-Dye', type: 'torso', rarity: 'rare', cost: 500, conditionType: 'none', icon: '🌈' },
    { id: 'acc_jersey_unicorn', name: 'Camiseta Unicornio Galáctico', type: 'torso', rarity: 'legendary', cost: 950, conditionType: 'none', icon: '🦄' },
    { id: 'acc_jersey_dragon', name: 'Camiseta Dragón de Fuego', type: 'torso', rarity: 'legendary', cost: 1000, conditionType: 'none', icon: '🐉' },
    { id: 'acc_jersey_neon', name: 'Camiseta Neón Glow', type: 'torso', rarity: 'epic', cost: 680, conditionType: 'none', icon: '🌟' },
    { id: 'acc_jersey_galaxy', name: 'Camiseta Galaxia Infinita', type: 'torso', rarity: 'legendary', cost: 900, conditionType: 'none', icon: '🌌' },
    { id: 'acc_jersey_robot', name: 'Camiseta Robo Futuro', type: 'torso', rarity: 'epic', cost: 720, conditionType: 'none', icon: '🤖' },
    { id: 'acc_jersey_anime', name: 'Camiseta Anime Power', type: 'torso', rarity: 'epic', cost: 800, conditionType: 'none', icon: '👘' },
    { id: 'acc_jersey_squish', name: 'Camiseta Squishmallow Style', type: 'torso', rarity: 'rare', cost: 550, conditionType: 'none', icon: '🧸' },
    { id: 'acc_jersey_eco', name: 'Camiseta Eco Superhéroe', type: 'torso', rarity: 'rare', cost: 480, conditionType: 'none', icon: '🌱' },
    { id: 'acc_jersey_butterfly', name: 'Camiseta Mariposa Y2K', type: 'torso', rarity: 'epic', cost: 650, conditionType: 'none', icon: '🦋' },

    // --- POP-UP 3D CHARACTERS REMOVED ---


    { id: 'acc_jersey_coquette', name: 'Camiseta Coquette Bows', type: 'torso', rarity: 'epic', cost: 680, conditionType: 'none', icon: '🎀' },
    { id: 'acc_jersey_pixel', name: 'Camiseta Cyber Pixel', type: 'torso', rarity: 'epic', cost: 750, conditionType: 'none', icon: '👾' },
    { id: 'acc_jersey_fortnite', name: 'Camiseta Battle Royale', type: 'torso', rarity: 'legendary', cost: 850, conditionType: 'none', icon: '🎮' },
    { id: 'acc_jersey_monster', name: 'Camiseta Monstruo Cute', type: 'torso', rarity: 'rare', cost: 420, conditionType: 'none', icon: '👹' },
    { id: 'acc_jersey_sloth', name: 'Camiseta Perezoso Zen', type: 'torso', rarity: 'rare', cost: 400, conditionType: 'none', icon: '🦥' },

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
