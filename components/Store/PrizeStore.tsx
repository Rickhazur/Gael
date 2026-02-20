import React, { useState } from 'react';
import { useGamification } from '@/context/GamificationContext';
import { Sparkles, ShoppingBag, Gift, Palette, Ticket, Trophy, User, Fingerprint, ShieldCheck, LockKeyholeOpen, Heart, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { HallOfFame } from './HallOfFame';
import { AvatarShop } from '@/components/Gamification/AvatarShop';
import { AvatarDisplay } from '@/components/Gamification/AvatarDisplay';
import { useNovaSound } from '@/hooks/useNovaSound';

import { useAvatar } from '@/context/AvatarContext';
import { ACCESSORIES } from '../Gamification/data/avatars';
import { toast } from 'sonner';
import { supabase, getParentRewards, type ParentRewardRow } from '@/services/supabase';

const STORE_ITEMS = [
    {
        id: 'sticker_pack_1',
        name: 'Pack de Stickers Espaciales',
        nameEn: 'Space Sticker Pack',
        description: '¡Decora tus reportes con planetas y cohetes!',
        price: 100,
        icon: '🚀',
        color: 'bg-indigo-100 border-indigo-300',
        type: 'sticker',
        dept: 'stickers'
    },
    // --- STICKERS DE FÚTBOL (MUNDO DE STICKERS) ---
    { id: 'acc_sticker_messi', name: 'Sticker Lionel Messi', nameEn: 'Lionel Messi Sticker', description: 'El astro argentino (🇦🇷)', price: 1200, icon: '/stickers/messi.png', color: 'bg-blue-100 border-blue-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_ronaldo', name: 'Sticker Cristiano Ronaldo', nameEn: 'Cristiano Ronaldo Sticker', description: 'El comandante (🇵🇹)', price: 1200, icon: '/stickers/ronaldo.png', color: 'bg-red-100 border-red-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_james', name: 'Sticker James Rodríguez', nameEn: 'James Rodríguez Sticker', description: 'La zurda de oro (🇨🇴)', price: 1300, icon: '🔟', color: 'bg-yellow-100 border-yellow-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_lucho_col', name: 'Sticker Lucho Díaz', nameEn: 'Luis Díaz Sticker', description: 'Magia tricolor (🇨🇴)', price: 1300, icon: '/stickers/lucho.png', color: 'bg-yellow-100 border-yellow-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_vini', name: 'Sticker Vini Jr', nameEn: 'Vinícius Jr Sticker', description: 'Baila Vini (🇧🇷)', price: 1200, icon: '🕺', color: 'bg-amber-100 border-amber-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_neymar', name: 'Sticker Neymar Jr', nameEn: 'Neymar Jr Sticker', description: 'El 10 brasileño (🇧🇷)', price: 1150, icon: '🇧🇷', color: 'bg-yellow-100 border-yellow-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_rodrygo', name: 'Sticker Rodrygo', nameEn: 'Rodrygo Sticker', description: 'Juventud brasileña (🇧🇷)', price: 900, icon: '⚽', color: 'bg-yellow-100 border-yellow-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_julian', name: 'Sticker Julián Álvarez', nameEn: 'Julián Álvarez Sticker', description: 'La Araña (🇦🇷)', price: 950, icon: '🕷️', color: 'bg-blue-100 border-blue-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_dybala', name: 'Sticker Paulo Dybala', nameEn: 'Paulo Dybala Sticker', description: 'La Joya (🇦🇷)', price: 900, icon: '💎', color: 'bg-blue-100 border-blue-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_dibu', name: 'Sticker Dibu Martínez', nameEn: 'Dibu Martínez Sticker', description: 'El guardián (🇦🇷)', price: 1100, icon: '🧤', color: 'bg-emerald-100 border-emerald-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_bellingham', name: 'Sticker Jude Bellingham', nameEn: 'Jude Bellingham Sticker', description: 'Orgullo inglés (🏴󠁧󠁢󠁥󠁮󠁧󠁿)', price: 1250, icon: '⭐', color: 'bg-slate-100 border-slate-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_mbappe', name: 'Sticker Kylian Mbappé', nameEn: 'Kylian Mbappé Sticker', description: 'Velocidad francesa (🇫🇷)', price: 1100, icon: '/stickers/mbappe.png', color: 'bg-blue-100 border-blue-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_haaland', name: 'Sticker Erling Haaland', nameEn: 'Erling Haaland Sticker', description: 'El androide noruego (🇳🇴)', price: 1100, icon: '/stickers/haaland.png', color: 'bg-sky-100 border-sky-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_lamine', name: 'Sticker Lamine Yamal', nameEn: 'Lamine Yamal Sticker', description: 'El futuro ya está aquí (🇪🇸)', price: 1000, icon: '/stickers/lamine.png', color: 'bg-red-100 border-red-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_pedri', name: 'Sticker Pedri', nameEn: 'Pedri Sticker', description: 'Elegancia española (🇪🇸)', price: 900, icon: '🇪🇸', color: 'bg-red-100 border-red-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_musiala', name: 'Sticker Jamal Musiala', nameEn: 'Jamal Musiala Sticker', description: 'Talento alemán (🇩🇪)', price: 950, icon: '/stickers/musiala.png', color: 'bg-slate-100 border-slate-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_valverde', name: 'Sticker Fede Valverde', nameEn: 'Fede Valverde Sticker', description: 'El Halcón (🇺🇾)', price: 1050, icon: '🦅', color: 'bg-sky-100 border-sky-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_suarez', name: 'Sticker Luis Suárez', nameEn: 'Luis Suárez Sticker', description: 'El Pistolero (🇺🇾)', price: 1100, icon: '🔫', color: 'bg-sky-100 border-sky-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_darwin', name: 'Sticker Darwin Núñez', nameEn: 'Darwin Núñez Sticker', description: 'La Pantera (🇺🇾)', price: 850, icon: '💨', color: 'bg-sky-100 border-sky-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_kane', name: 'Sticker Harry Kane', nameEn: 'Harry Kane Sticker', description: 'Máximo goleador (🏴󠁧󠁢󠁥󠁮󠁧󠁿)', price: 850, icon: '/stickers/kane.png', color: 'bg-white border-slate-200', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_salah', name: 'Sticker Mohamed Salah', nameEn: 'Mohamed Salah Sticker', description: 'Faraón egipcio (🇪🇬)', price: 1100, icon: '🐫', color: 'bg-red-100 border-red-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_debruyne', name: 'Sticker Kevin De Bruyne', nameEn: 'Kevin De Bruyne Sticker', description: 'Cerebro belga (🇧🇪)', price: 1150, icon: '🇧🇪', color: 'bg-sky-100 border-sky-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_son', name: 'Sticker Son Heung-min', nameEn: 'Son Heung-min Sticker', description: 'Crack coreano (🇰🇷)', price: 950, icon: '📸', color: 'bg-red-100 border-red-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_champion', name: 'Sticker Campeón del Mundo', nameEn: 'World Champion Sticker', description: 'Para los que llegan a la cima (🌟)', price: 5000, icon: '⭐', color: 'bg-amber-100 border-amber-300', type: 'accessory', dept: 'stickers' },
    { id: 'acc_sticker_ballon_dor', name: 'Sticker Balón de Oro', nameEn: 'Ballon d\'Or Sticker', description: 'Solo para los mejores (🏆)', price: 3000, icon: '/stickers/ballon_dor.png', color: 'bg-amber-100 border-amber-300', type: 'accessory', dept: 'stickers' },
    {
        id: 'avatar_superhero',
        name: 'Avatar Superhéroe',
        nameEn: 'Superhero Avatar',
        description: 'Convierte a tu tutor en un héroe.',
        price: 250,
        icon: '🦸‍♂️',
        color: 'bg-red-100 border-red-300',
        type: 'avatar',
        dept: 'custom'
    },
    {
        id: 'theme_dark',
        name: 'Modo Nocturno Mágico',
        nameEn: 'Magic Dark Mode',
        description: 'Un tema oscuro con estrellas brillantes.',
        price: 500,
        icon: '🌙',
        color: 'bg-slate-800 border-slate-600 text-white',
        type: 'theme',
        dept: 'custom'
    },
    {
        id: 'real_break',
        name: '10 Minutos Extra de Recreo',
        nameEn: '10 Mins Extra Break',
        description: 'Canjéalo con tu profesor.',
        price: 1000,
        icon: '🎟️',
        color: 'bg-kid-yellow border-yellow-400',
        type: 'coupon',
        dept: 'coupons'
    },
    {
        id: 'power_boost',
        name: 'Súper Poder de Concentración',
        nameEn: 'Super Focus Power',
        description: 'Doble XP por 1 hora de estudio.',
        price: 350,
        icon: '⚡',
        color: 'bg-amber-100 border-amber-300',
        type: 'powerup',
        dept: 'utility'
    },
    {
        id: 'pet_cosmetic',
        name: 'Accesorio para Mascota',
        nameEn: 'Pet Accessory',
        description: '¡Viste a tu mascota virtual!',
        price: 175,
        icon: '🐾',
        color: 'bg-emerald-100 border-emerald-300',
        type: 'pet',
        dept: 'custom'
    },
    {
        id: 'extra_lives',
        name: '3 Vidas Extra en Arena',
        nameEn: '3 Extra Arena Lives',
        description: 'Sigue jugando en la Arena Nova.',
        price: 450,
        icon: '❤️',
        color: 'bg-rose-100 border-rose-300',
        type: 'arena',
        dept: 'utility'
    },
    {
        id: 'premium_report',
        name: 'Plantilla Premium de Reporte',
        nameEn: 'Premium Report Template',
        description: 'Crea reportes con diseño profesional.',
        price: 600,
        icon: '📋',
        color: 'bg-violet-100 border-violet-300',
        type: 'template',
        dept: 'utility'
    },
    {
        id: 'acc_glasses_fire_wings',
        name: 'Alas de Fuego Eterno',
        nameEn: 'Eternal Fire Wings',
        description: 'Vuela con el poder del fuego.',
        price: 2800,
        icon: '/accessories/glass_fire_wings.png',
        color: 'bg-orange-100 border-orange-300',
        type: 'glasses',
        dept: 'custom'
    },
    {
        id: 'acc_glasses_phoenix_wings',
        name: 'Alas de Fénix Tropical',
        nameEn: 'Tropical Phoenix Wings',
        description: 'Belleza y elegancia sin igual.',
        price: 1500,
        icon: '/accessories/glass_wings.png',
        color: 'bg-pink-100 border-pink-300',
        type: 'glasses',
        dept: 'custom'
    },
    {
        id: 'acc_sticker_nova',
        name: 'Insignia Nova',
        nameEn: 'Nova Badge',
        description: 'Insignia oficial de estudiante Nova.',
        price: 300,
        icon: '🎓',
        color: 'bg-purple-100 border-purple-300',
        type: 'accessory',
        dept: 'custom'
    },
    {
        id: 'acc_medal',
        name: 'Medalla de Honor',
        nameEn: 'Honor Medal',
        description: 'Para los verdaderos campeones.',
        price: 300,
        icon: '🥇',
        color: 'bg-yellow-100 border-yellow-300',
        type: 'accessory',
        dept: 'custom'
    },
    {
        id: 'acc_watch',
        name: 'Reloj Pulsera',
        nameEn: 'Wrist Watch',
        description: 'Siempre a tiempo para aprender.',
        price: 400,
        icon: '⌚',
        color: 'bg-gray-100 border-gray-300',
        type: 'accessory',
        dept: 'custom'
    },
    {
        id: 'acc_watch_cyber',
        name: 'Smartwatch Cyber-Blue',
        nameEn: 'Cyber-Blue Smartwatch',
        description: '¡Navega por la red desde tu muñeca!',
        price: 850,
        icon: '💻',
        color: 'bg-cyan-100 border-cyan-300',
        type: 'accessory',
        dept: 'custom'
    },
    {
        id: 'acc_watch_gold',
        name: 'Rolex de Oro',
        nameEn: 'Golden Rolex',
        description: 'Brilla como un campeón.',
        price: 2500,
        icon: '👑',
        color: 'bg-yellow-100 border-yellow-300',
        type: 'accessory',
        dept: 'custom'
    },
    {
        id: 'acc_watch_sport',
        name: 'FitBand Pro',
        nameEn: 'FitBand Pro',
        description: 'Mide tus pasos y tu energía.',
        price: 600,
        icon: '🏃',
        color: 'bg-red-100 border-red-300',
        type: 'accessory',
        dept: 'utility'
    },
    {
        id: 'acc_belt_phone',
        name: 'Celular Cinturón',
        nameEn: 'Belt Phone',
        description: 'Tecnología siempre a mano.',
        price: 400,
        icon: '📱',
        color: 'bg-blue-100 border-blue-300',
        type: 'accessory',
        dept: 'utility'
    },
    {
        id: 'acc_jersey_nova_official',
        name: 'Camiseta Nova Oficial',
        nameEn: 'Official Nova Jersey',
        description: 'La piel oficial de la academia. ¡Ajuste perfecto!',
        price: 100,
        icon: '/avatars/jerseys/Gemini_Generated_Image_xns16exns16exns1.png',
        color: 'bg-indigo-50 border-indigo-200',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_jersey_nova_premium',
        name: 'Camiseta Super Héroes Nova',
        nameEn: 'Nova Super Heroes Jersey',
        description: '¡Poderes activados! Diseño exclusivo de héroes.',
        price: 200,
        icon: '/avatars/jerseys/Gemini_Generated_Image_e9mtfoe9mtfoe9mt.png',
        color: 'bg-rose-50 border-rose-200',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_jersey_nova_gold',
        name: 'Camiseta Nova Gold',
        nameEn: 'Nova Gold Edition',
        description: 'Brilla como el oro con esta edición legendaria.',
        price: 50,
        icon: '/avatars/jerseys/jersey_monster_blue.png',
        color: 'bg-amber-50 border-amber-200',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_jersey_nova_neon',
        name: 'Camiseta Nova Neon',
        nameEn: 'Nova Neon Pulse',
        description: '¡Energía pura en cada fibra!',
        price: 50,
        icon: '/avatars/jerseys/jersey_flash_green.png',
        color: 'bg-purple-50 border-purple-200',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_belt_walkie',
        name: 'Walkie Cinturón',
        nameEn: 'Belt Walkie',
        description: 'Comunicación de corto alcance.',
        price: 350,
        icon: '📻',
        color: 'bg-green-100 border-green-300',
        type: 'accessory',
        dept: 'utility'
    },
    {
        id: 'acc_jersey_colombia_7',
        name: 'Jersey Colombia #7',
        nameEn: 'Colombia #7 Jersey',
        description: '¡Apoya a Lucho Díaz!',
        price: 2500,
        icon: '/avatars/jerseys/Gemini_Generated_Image_6204zf6204zf6204.png',
        color: 'bg-yellow-100 border-yellow-300',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_jersey_colombia_pro',
        name: '¡NUEVA! Jersey Colombia PRO #10',
        nameEn: 'NEW! Colombia PRO #10 Jersey',
        description: 'Edición Ultra-Especial Flat - Ajuste Perfecto de Cuello.',
        price: 3000,
        icon: '/avatars/jerseys/Gemini_Generated_Image_6204zf6204zf6204.png',
        color: 'bg-yellow-100 border-yellow-300',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_jersey_colombia_james',
        name: 'Jersey Colombia #7',
        nameEn: 'Colombia #7 Jersey',
        description: '¡James Rodríguez - Edición Clásica!',
        price: 2500,
        icon: '/avatars/jerseys/Gemini_Generated_Image_73ndea73ndea73nd.png',
        color: 'bg-yellow-100 border-yellow-300',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_jersey_bayern_lucho',
        name: 'Jersey Bayern - Luis Díaz',
        nameEn: 'Bayern - Lucho #7 Jersey',
        description: '¡El guajiro en el Bayern!',
        price: 2500,
        icon: '/avatars/jerseys/bayern_lucho.jpg',
        color: 'bg-red-100 border-red-300',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_shorts_bayern',
        name: 'Shorts Bayern Red',
        nameEn: 'Bayern Red Shorts',
        description: 'Completa el uniforme del Bayern.',
        price: 1200,
        icon: '/avatars/jerseys/shorts_bayern.jpg',
        color: 'bg-red-50 border-red-200',
        type: 'accessory',
        dept: 'custom'
    },
    {
        id: 'acc_jersey_argentina_messi',
        name: 'Jersey Argentina - Nueva',
        nameEn: 'Argentina - New Jersey',
        description: '¡La última versión de la leyenda!',
        price: 2500,
        icon: '/avatars/jerseys/Gemini_Generated_Image_azhtclazhtclazht.png',
        color: 'bg-blue-100 border-blue-300',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_jersey_argentina_messi_v1',
        name: 'Jersey Argentina - Clásica',
        nameEn: 'Argentina - Classic Jersey',
        description: '¡El diseño original!',
        price: 2500,
        icon: '/avatars/jerseys/Gemini_Generated_Image_72cwvn72cwvn72cw.png',
        color: 'bg-blue-50 border-blue-200',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_jersey_portugal_ronaldo',
        name: 'Jersey Portugal #7',
        nameEn: 'Portugal #7 Jersey',
        description: '¡CR7, el comandante portugués!',
        price: 2500,
        icon: '/avatars/jerseys/jersey_portugal_ronaldo.png',
        color: 'bg-red-100 border-red-300',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_jersey_monster_blue',
        name: 'Camiseta Monstruo',
        nameEn: 'Monster T-Shirt',
        description: '¡Desata tu bestia interior!',
        price: 1800,
        icon: '/avatars/jerseys/jersey_monster_blue.png',
        color: 'bg-blue-100 border-blue-300',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_jersey_spiderman_3d',
        name: 'Camiseta Spiderman 3D',
        nameEn: '3D Spiderman Jersey',
        description: '¡La araña salta de tu pecho!',
        price: 1200,
        icon: '/avatars/jerseys/Gemini_Generated_Image_prgeelprgeelprge.png',
        color: 'bg-red-100 border-red-300',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_jersey_flash_green',
        name: 'Camiseta Flash',
        nameEn: 'Flash T-Shirt',
        description: '¡Más rápido que la luz!',
        price: 1800,
        icon: '/avatars/jerseys/jersey_flash_green.png',
        color: 'bg-green-100 border-green-300',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_jersey_pro_retro',
        name: 'Camiseta Pro Retro',
        nameEn: 'Pro Retro Jersey',
        description: 'Estilo clásico con tecnología moderna.',
        price: 800,
        icon: '/avatars/jerseys/Gemini_Generated_Image_dx3jofdx3jofdx3j.png',
        color: 'bg-slate-100 border-slate-300',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_jersey_pro_diamond',
        name: 'Camiseta Pro Diamond Edition',
        nameEn: 'Pro Diamond Jersey',
        description: 'La joya de la corona. Edición limitada Élite.',
        price: 1500,
        icon: '/avatars/jerseys/Gemini_Generated_Image_es3k4bes3k4bes3k.png',
        color: 'bg-cyan-50 border-cyan-200',
        type: 'jersey',
        dept: 'custom'
    },
    {
        id: 'acc_jersey_pro_black',
        name: 'Camiseta Pro Black Edition',
        nameEn: 'Pro Black Jersey',
        description: 'Diseño sigiloso y elegante para campeones.',
        price: 1200,
        icon: '/avatars/jerseys/Gemini_Generated_Image_z53g7qz53g7qz53g.png',
        color: 'bg-zinc-800 border-zinc-600',
        type: 'jersey',
        dept: 'custom'
    }
];

// Mock Inventory (Ideally comes from Context/DB)
const MOCK_INVENTORY = [
    { id: 'sticker_pack_1', name: 'Pack de Stickers Espaciales', icon: '🚀' },
];

interface PrizeStoreProps {
    language: 'es' | 'en';
    demoData?: { demoMode?: boolean; openStore?: boolean; showGlassesSection?: boolean; demoGlassesPurchase?: boolean } | null;
}

export function PrizeStore({ language = 'es', demoData }: PrizeStoreProps) {
    const { coins, savingsBalance, spendCoins, xp, withdrawCoinsFromBank } = useGamification();
    const { buyAccessory, equipAccessory, ownedAccessories, deleteAccessory, userId, deletedCatalogItems, hideFromCatalog } = useAvatar();
    const [activeTab, setActiveTab] = useState<'avatar_shop' | 'general_shop' | 'trophies' | 'inventory' | 'family'>(() =>
        demoData?.openStore ? 'avatar_shop' : 'avatar_shop'
    );
    const [hasEntered, setHasEntered] = useState(false);
    const [demoGlassesEquipped, setDemoGlassesEquipped] = useState(false);
    React.useEffect(() => {
        if (demoData?.openStore) setActiveTab('avatar_shop');
    }, [demoData?.openStore]);
    const [isOpening, setIsOpening] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const { playPurchase, playStoreOpen, playClick } = useNovaSound();

    const [parentRewards, setParentRewards] = useState<ParentRewardRow[]>([]);
    const [loadingRewards, setLoadingRewards] = useState(false);

    // Fetch Parent Rewards
    React.useEffect(() => {
        const fetchRewards = async () => {
            if (!supabase) return;
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile } = await supabase.from('profiles').select('parent_id').eq('id', user.id).single();

                if (profile?.parent_id) {
                    setLoadingRewards(true);
                    const rewards = await getParentRewards(profile.parent_id, user.id);
                    setParentRewards(rewards);
                }
            } catch (error) {
                console.error("Error fetching parent rewards:", error);
            } finally {
                setLoadingRewards(false);
            }
        };

        fetchRewards();
    }, []);

    // 🚀 DEMO TOUR AUTO-ENTRANCE
    React.useEffect(() => {
        const isDemo = localStorage.getItem('nova_demo_mode') === 'true';
        if (isDemo && !hasEntered && !isOpening) {
            const timer = setTimeout(() => {
                handleEnter();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [hasEntered, isOpening]);

    // 🛍️ DEMO: al abrir la puerta (hasEntered) → mostrar sección gafas y avatar con gafas (en móvil más delay para que renderice)
    const isMobileStore = typeof window !== 'undefined' && (window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    React.useEffect(() => {
        if (!demoData?.openStore || !hasEntered) return;
        // Delay más largo para dar tiempo a que la tienda se vea
        const delayMs = isMobileStore ? 2800 : 1200;
        const t = setTimeout(() => {
            window.dispatchEvent(new CustomEvent('nova-demo-shop-glasses'));
            // Después de la animación de compra, marcar que las gafas están equipadas
            const equipDelay = setTimeout(() => {
                setDemoGlassesEquipped(true);
            }, 2500);
            return () => clearTimeout(equipDelay);
        }, delayMs);
        return () => clearTimeout(t);
    }, [demoData?.openStore, hasEntered, isMobileStore]);

    const handleEnter = () => {
        playClick();
        setIsScanning(true);
        // Step 1: Biometric Scan
        setTimeout(() => {
            playStoreOpen(); // Verification sound
            setIsAuthorized(true);
            // Step 2: Open Doors
            setTimeout(() => {
                setIsOpening(true);
                // Step 3: Enter Store
                setTimeout(() => setHasEntered(true), 1500);
            }, 800);
        }, 1500);
    };

    return (
        <div className="relative h-screen bg-[#f8fbff] font-poppins overflow-hidden">
            {/* Nova specialized filters for jerseys */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <filter id="whiteToAlphaJersey" colorInterpolationFilters="sRGB">
                    <feColorMatrix type="matrix" values="
                        1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        -1 -1 -1 0 2.88
                    " />
                </filter>
                <filter id="premiumJerseyFilter" colorInterpolationFilters="sRGB">
                    <feColorMatrix type="matrix" values="
                        1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        -4 -4 -4 0 11.5
                    " />
                </filter>
            </svg>

            <AnimatePresence>
                {!hasEntered && (
                    <motion.div
                        key="entrance-overlay"
                        exit={{ opacity: 0, transition: { duration: 1 } }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 perspective-[2000px]"
                    >
                        {/* 🌌 DEEP SPACE BACKGROUND BEHIND DOORS */}
                        <div className="absolute inset-0 overflow-hidden opacity-40">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)]" />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
                        </div>

                        {/* 🚪 THE HYPER-TECH VAULT DOORS */}
                        <div className="relative w-full h-full flex overflow-hidden">
                            {/* Left Master Wing */}
                            <motion.div
                                initial={{ x: 0 }}
                                animate={isOpening ? { x: '-100%', rotateY: -30, opacity: 0 } : {}}
                                transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
                                className="flex-1 bg-slate-900 border-r border-cyan-500/30 relative z-20 flex items-center justify-end overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-l from-cyan-500/5 to-transparent shadow-inner" />
                                {/* Door Texture */}
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                                <div className="relative mr-12 space-y-4">
                                    <div className="h-0.5 w-32 bg-cyan-500/20 rounded-full" />
                                    <div className="h-0.5 w-48 bg-cyan-500/40 rounded-full" />
                                    <div className="h-0.5 w-24 bg-cyan-500/20 rounded-full" />
                                </div>
                            </motion.div>

                            {/* 📟 CENTRAL SECURITY HUD */}
                            {!isOpening && (
                                <motion.div
                                    className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {/* Holographic Ring - responsive for mobile */}
                                    <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 border-2 border-dashed border-cyan-500/20 rounded-full"
                                        />
                                        <motion.div
                                            animate={{ rotate: -360 }}
                                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-8 border-2 border-cyan-500/40 rounded-full border-t-cyan-500"
                                        />

                                        {/* Interaction Panel */}
                                        <div className="relative bg-black/40 backdrop-blur-3xl p-6 sm:p-10 md:p-12 rounded-2xl md:rounded-[4rem] border border-white/10 shadow-[0_0_80px_rgba(6,182,212,0.2)] flex flex-col items-center pointer-events-auto max-w-[90vw]">
                                            <AnimatePresence mode="wait">
                                                {!isScanning && !isAuthorized ? (
                                                    <motion.div
                                                        key="idle"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 1.2 }}
                                                        className="flex flex-col items-center"
                                                    >
                                                        <div className="w-24 h-24 bg-cyan-500/10 rounded-3xl border border-cyan-500/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                                                            <ShoppingBag className="w-10 h-10 text-cyan-400" />
                                                        </div>
                                                        <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">Protocolo Nova</h2>
                                                        <p className="text-cyan-400/60 font-bold text-[10px] tracking-[0.3em] uppercase mb-8">Acceso de Élite Requerido</p>
                                                        <button
                                                            onClick={handleEnter}
                                                            className="group relative px-10 py-4 overflow-hidden rounded-full transition-all"
                                                        >
                                                            <div className="absolute inset-0 bg-cyan-500 group-hover:bg-white transition-colors" />
                                                            <span className="relative z-10 text-slate-950 font-black tracking-widest uppercase group-hover:text-cyan-600">Verificar ID</span>
                                                        </button>
                                                    </motion.div>
                                                ) : isScanning && !isAuthorized ? (
                                                    <motion.div
                                                        key="scanning"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="flex flex-col items-center"
                                                    >
                                                        <div className="relative mb-8">
                                                            <div className="w-32 h-32 bg-cyan-500/20 rounded-full border border-cyan-500 animate-pulse" />
                                                            <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-cyan-400 animate-bounce" />
                                                            <motion.div
                                                                animate={{ y: [-60, 60, -60] }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                                className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_cyan] z-20"
                                                            />
                                                        </div>
                                                        <p className="text-cyan-400 font-black text-sm tracking-[0.5em] animate-pulse">ANALIZANDO ADN...</p>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="authorized"
                                                        initial={{ opacity: 0, scale: 0.5 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="flex flex-col items-center"
                                                    >
                                                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                                                            <ShieldCheck className="w-12 h-12 text-white" />
                                                        </div>
                                                        <h2 className="text-3xl font-black text-white italic tracking-tighter mb-1 uppercase">AUTORIZADO</h2>
                                                        <p className="text-emerald-400 font-bold text-[10px] tracking-[0.4em] mb-4">BIENVENIDO A EXCELLENCE</p>
                                                        <LockKeyholeOpen className="w-6 h-6 text-emerald-400 animate-bounce mt-2" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Right Master Wing */}
                            <motion.div
                                initial={{ x: 0 }}
                                animate={isOpening ? { x: '100%', rotateY: 30, opacity: 0 } : {}}
                                transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
                                className="flex-1 bg-slate-900 border-l border-cyan-500/30 relative z-20 flex items-center justify-start overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent shadow-inner" />
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                                <div className="relative ml-12 space-y-4">
                                    <div className="h-0.5 w-24 bg-cyan-500/20 rounded-full" />
                                    <div className="h-0.5 w-48 bg-cyan-500/40 rounded-full" />
                                    <div className="h-0.5 w-32 bg-cyan-500/20 rounded-full" />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Store Content */}
            <motion.div
                className="p-4 sm:p-6 lg:p-12 space-y-4 sm:space-y-8 max-w-[1600px] mx-auto h-full flex flex-col overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={hasEntered ? { opacity: 1, scale: 1 } : { opacity: 0.1, scale: 0.95 }}
                transition={{ duration: 0.8 }}
            >
                {/* 🏷️ FLOATING PREMIUM HEADER - mobile optimized */}
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-100 p-4 sm:p-6 rounded-2xl sm:rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative z-20 shrink-0">
                    <div className="flex items-center gap-3 sm:gap-5">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border-2 border-white shrink-0">
                            <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-black text-xl sm:text-3xl text-slate-800 tracking-tight -mb-1 truncate">
                                Tienda Nova
                            </h1>
                            <p className="text-slate-400 font-bold text-xs sm:text-sm tracking-wide">
                                ¡Gana, compra y colecciona!
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                        {demoData?.openStore && hasEntered && demoGlassesEquipped && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur border-2 border-purple-300 px-3 py-2 sm:px-4 rounded-xl sm:rounded-2xl shadow-lg shrink-0 min-w-0"
                            >
                                <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                                    <AvatarDisplay size="md" showBackground showName={false} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs sm:text-sm font-black text-purple-700">¡Tu avatar con gafas!</span>
                                    <span className="text-[10px] text-purple-500">Visor Tech-Edge Alpha</span>
                                </div>
                            </motion.div>
                        )}
                        <div className="flex gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-4 bg-[#f0f7ff] px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-blue-100 shadow-sm">
                                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 shrink-0" />
                                <div className="font-black text-lg sm:text-xl text-slate-700">{xp} <span className="text-xs text-blue-400/60 ml-0.5">XP</span></div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 bg-[#fff9eb] px-4 sm:px-6 py-2 sm:py-4 rounded-xl sm:rounded-2xl border border-yellow-200 shadow-sm relative group cursor-help">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-black text-xs sm:text-sm shrink-0">🪙</div>
                                <div className="font-black text-xl sm:text-2xl text-slate-800 tracking-tight">{coins}</div>
                                <div className="absolute -bottom-10 right-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                    Monedas en Cartera (Efectivo)
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 bg-emerald-50 px-4 sm:px-6 py-2 sm:py-4 rounded-xl sm:rounded-2xl border border-emerald-200 shadow-sm relative group cursor-help">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-black text-xs sm:text-sm shrink-0 font-fredoka">🏦</div>
                                <div className="font-black text-xl sm:text-2xl text-emerald-700 tracking-tight">{savingsBalance}</div>
                                <div className="absolute -bottom-10 right-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                    Ahorros en el Nova Bank
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 🏛️ MUSEUM ARCHITECTURAL ELEMENTS */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] border-[40px] border-cyan-50/30 rounded-full blur-2xl" />
                    <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[100%] h-[70%] border-[2px] border-cyan-100/50 rounded-full" />
                    <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] border-[2px] border-cyan-100/30 rounded-full" />

                    {/* Glowing Lines on Floor */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-cyan-50/20 to-transparent" />
                </div>

                {/* 🔘 CENTRAL NAVIGATION TABS - scrollable on mobile */}
                <div className="flex justify-center shrink-0 relative z-20 overflow-x-auto pb-2 -mx-2">
                    <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-slate-100/50 shadow-xl flex gap-1 min-w-0 shrink-0">
                        <button
                            onClick={() => setActiveTab('avatar_shop')}
                            className={cn(
                                "px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-black transition-all flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest shrink-0",
                                activeTab === 'avatar_shop'
                                    ? "bg-[#9333ea] text-white shadow-[0_5px_15px_rgba(147,51,234,0.3)] scale-105"
                                    : "text-slate-400 hover:bg-slate-50"
                            )}
                        >
                            <Sparkles size={14} /> BOUTIQUE
                        </button>
                        <button
                            onClick={() => setActiveTab('general_shop')}
                            className={cn(
                                "px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-black transition-all flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest shrink-0",
                                activeTab === 'general_shop'
                                    ? "bg-[#06b6d4] text-white shadow-[0_5px_15px_rgba(6,182,212,0.3)] scale-105"
                                    : "text-slate-400 hover:bg-slate-50"
                            )}
                        >
                            <ShoppingBag size={14} /> PREMIOS
                        </button>
                        <button
                            onClick={() => setActiveTab('trophies')}
                            className={cn(
                                "px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-black transition-all flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest shrink-0",
                                activeTab === 'trophies'
                                    ? "bg-amber-400 text-white shadow-[0_5px_15px_rgba(251,191,36,0.3)] scale-105"
                                    : "text-slate-400 hover:bg-slate-50"
                            )}
                        >
                            <Trophy size={14} /> FAMA
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={cn(
                                "px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-black transition-all flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest shrink-0",
                                activeTab === 'inventory'
                                    ? "bg-slate-900 text-white shadow-[0_5px_15px_rgba(0,0,0,0.2)] scale-105"
                                    : "text-slate-400 hover:bg-slate-50"
                            )}
                        >
                            <Gift size={14} /> MI BAÚL
                        </button>
                        <button
                            onClick={() => setActiveTab('family')}
                            className={cn(
                                "px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-black transition-all flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest shrink-0",
                                activeTab === 'family'
                                    ? "bg-rose-500 text-white shadow-[0_5px_15px_rgba(244,63,94,0.3)] scale-105"
                                    : "text-slate-400 hover:bg-slate-50"
                            )}
                        >
                            <Heart size={14} /> FAMILIA
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* AVATAR SHOP TAB */}
                    {activeTab === 'avatar_shop' && (
                        <motion.div
                            key="avatar_shop"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex-1 min-h-0 overflow-hidden flex flex-col"
                        >
                            <AvatarShop demoData={demoData?.openStore ? { showAccessories: true, defaultCategory: 'nova', openStore: true } : undefined} />
                        </motion.div>
                    )}

                    {/* 🎁 PREMIUM GENERAL STORE TAB */}
                    {activeTab === 'general_shop' && (
                        <motion.div
                            key="shop"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-12"
                        >
                            {[
                                { id: 'custom', name: 'Departamento de Estilo', icon: '🎨', color: 'text-purple-600' },
                                { id: 'stickers', name: 'Mundo de Stickers', icon: '✨', color: 'text-pink-600' },
                                { id: 'utility', name: 'Súper Útiles', icon: '🛠️', color: 'text-blue-600' },
                                { id: 'coupons', name: 'Cupones Galácticos', icon: '🎟️', color: 'text-amber-600' }
                            ].map(dept => {
                                const deptItems = STORE_ITEMS
                                    .filter(i => (i as any).dept === dept.id)
                                    .filter(i => !deletedCatalogItems.includes(i.id));
                                if (deptItems.length === 0) return null;

                                return (
                                    <div key={dept.id} className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center text-xl">
                                                {dept.icon}
                                            </div>
                                            <h2 className={cn("text-2xl font-black uppercase tracking-tight", dept.color)}>
                                                {dept.name}
                                            </h2>
                                            <div className="flex-1 h-px bg-slate-200" />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                                            {deptItems.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    whileHover={{ y: -8 }}
                                                    className="bg-white rounded-2xl sm:rounded-[3rem] p-6 sm:p-8 border border-slate-100 shadow-xl flex flex-col items-center gap-4 sm:gap-6 relative overflow-hidden group transition-all"
                                                >
                                                    <div className={cn(
                                                        "w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-inner border-4 border-slate-50 relative z-10",
                                                        item.color
                                                    )}>
                                                        {typeof item.icon === 'string' && (item.icon.startsWith('/') || item.icon.startsWith('http')) ? (
                                                            <img
                                                                src={item.icon}
                                                                alt={item.name}
                                                                className="w-20 h-20 object-contain"
                                                                style={{
                                                                    filter: item.id.includes('nova_gold')
                                                                        ? 'sepia(1) saturate(3) hue-rotate(10deg) brightness(0.9) contrast(1.2)'
                                                                        : (item.id.includes('nova_neon')
                                                                            ? 'hue-rotate(280deg) saturate(2) contrast(1.1) brightness(1.2)'
                                                                            : ((item.id.includes('nova_official') || item.id.includes('nova_premium') || item.id.includes('retro') || item.id.includes('spiderman') || item.id.includes('diamond') || item.id.includes('black'))
                                                                                ? 'url(#premiumJerseyFilter)'
                                                                                : 'none'))
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="drop-shadow-lg">{item.icon}</span>
                                                        )}
                                                    </div>

                                                    {/* PILOT ADMIN: HIDE FROM CATALOG FOREVER */}
                                                    {userId === 'test-pilot-quinto' && (
                                                        <div className="absolute top-4 left-4 z-50">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="w-10 h-10 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                                                                onClick={(e) => { e.stopPropagation(); hideFromCatalog(item.id); }}
                                                                title="Eliminar de la Tienda (Para Siempre)"
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </Button>
                                                        </div>
                                                    )}

                                                    <div className="text-center relative z-10">
                                                        <h3 className="font-black text-slate-800 text-xl italic mb-2 tracking-tight">
                                                            {language === 'es' ? item.name : item.nameEn}
                                                        </h3>
                                                        <p className="text-sm text-slate-400 font-medium leading-tight mb-3">
                                                            {item.description}
                                                        </p>
                                                        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 border-2 border-amber-200 font-black text-amber-700 text-lg">
                                                            <span>🪙</span>
                                                            <span>{item.price}</span>
                                                            <span className="text-xs font-bold text-amber-600">
                                                                {language === 'es' ? 'Nova Coins' : 'Nova Coins'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        onClick={() => {
                                                            const accessory = ACCESSORIES.find(a => a.id === item.id);
                                                            if (accessory) {
                                                                buyAccessory(accessory);
                                                                equipAccessory(accessory);
                                                                toast.success(language === 'es' ? `¡Equipado: ${item.name}!` : `Equipped: ${item.nameEn}!`);
                                                            } else {
                                                                spendCoins(item.price, item.name);
                                                            }
                                                        }}
                                                        disabled={coins < item.price}
                                                        className={cn(
                                                            "w-full rounded-2xl h-14 font-black transition-all border-2",
                                                            coins >= item.price
                                                                ? "bg-[#06b6d4] hover:bg-white hover:text-[#06b6d4] hover:border-[#06b6d4] text-white shadow-lg shadow-cyan-100"
                                                                : "bg-slate-50 text-slate-300 border-slate-100 shadow-none cursor-not-allowed"
                                                        )}
                                                    >
                                                        {coins >= item.price
                                                            ? (language === 'es' ? `Cómpralo por ${item.price} 🪙` : `Buy for ${item.price} 🪙`)
                                                            : (language === 'es' ? `Faltan ${item.price - coins} 🪙` : `Need ${item.price - coins} 🪙`)
                                                        }
                                                    </Button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* 🏠 FAMILY REWARDS TAB */}
                    {activeTab === 'family' && (
                        <motion.div
                            key="family"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-8"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-4xl font-black text-rose-600 italic tracking-tight mb-2">Recompensas de Casa</h2>
                                <p className="text-rose-400/80 font-bold uppercase tracking-widest text-sm">Premios especiales creados por tus padres</p>
                            </div>

                            {loadingRewards ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
                                </div>
                            ) : parentRewards.length === 0 ? (
                                <div className="text-center py-20 bg-rose-50/50 rounded-[3rem] border border-rose-100">
                                    <Heart className="w-24 h-24 mx-auto mb-6 text-rose-200" />
                                    <h3 className="text-xl font-black text-rose-400 mb-2">Sin Recompensas Activas</h3>
                                    <p className="text-rose-300">Pide a tus padres que agreguen premios desde su panel.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {parentRewards.map((reward) => (
                                        <motion.div
                                            key={reward.id}
                                            whileHover={{ y: -8 }}
                                            className="bg-white rounded-[2rem] p-8 border-2 border-rose-100 shadow-xl flex flex-col items-center gap-6 relative overflow-hidden group transition-all"
                                        >
                                            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center text-5xl shadow-inner border-4 border-rose-50 text-rose-500">
                                                🎁
                                            </div>

                                            <div className="text-center z-10 w-full">
                                                <h3 className="font-black text-slate-800 text-xl italic mb-2 tracking-tight line-clamp-1">
                                                    {reward.name}
                                                </h3>
                                                <p className="text-sm text-slate-400 font-medium leading-tight mb-4 min-h-[2.5rem] line-clamp-2">
                                                    {reward.description || "¡Un premio genial para ti!"}
                                                </p>
                                                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 border-2 border-emerald-200 font-black text-emerald-700 text-lg mb-2">
                                                    <span>🏦 Meta:</span>
                                                    <span>{reward.cost}</span>
                                                </div>

                                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-4 border border-slate-200">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min((savingsBalance / reward.cost) * 100, 100)}%` }}
                                                        className={cn("h-full transition-all",
                                                            savingsBalance >= reward.cost ? "bg-emerald-500" : "bg-rose-400"
                                                        )}
                                                    />
                                                </div>

                                                <Button
                                                    onClick={async () => {
                                                        const success = await withdrawCoinsFromBank(reward.cost);
                                                        if (success) {
                                                            playPurchase();
                                                            toast.success(`¡Canjeaste: ${reward.name}!`, {
                                                                description: "Avísales a tus padres que ganaste este premio.",
                                                            });
                                                        }
                                                    }}
                                                    disabled={savingsBalance < reward.cost}
                                                    className={cn(
                                                        "w-full rounded-2xl h-12 font-black transition-all border-2",
                                                        savingsBalance >= reward.cost
                                                            ? "bg-rose-500 hover:bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200"
                                                            : "bg-slate-50 text-slate-300 border-slate-100 shadow-none cursor-not-allowed"
                                                    )}
                                                >
                                                    {savingsBalance >= reward.cost
                                                        ? "CANJEAR CON AHORROS"
                                                        : `FALTAN ${reward.cost - savingsBalance} PARA TU META`
                                                    }
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}


                    {/* 🏆 ELITE HALL OF FAME TAB */}
                    {
                        activeTab === 'trophies' && (
                            <motion.div
                                key="trophies"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 min-h-0 bg-white/40 backdrop-blur-xl rounded-2xl sm:rounded-[3rem] p-4 sm:p-8 lg:p-12 border border-white shadow-2xl relative z-10 overflow-y-auto custom-scrollbar"
                            >
                                <div className="text-center mb-12">
                                    <h2 className="text-4xl font-black text-slate-800 italic tracking-tight mb-2">Salón de la Fama</h2>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm text-amber-500">Logros Legendarios</p>
                                </div>
                                <HallOfFame language={language} />
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'inventory' && (
                            <motion.div
                                key="inventory"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1 min-h-0 bg-white/40 backdrop-blur-xl rounded-2xl sm:rounded-[3rem] p-4 sm:p-8 lg:p-12 border border-white shadow-2xl relative z-10 overflow-y-auto custom-scrollbar"
                            >
                                <div className="text-center mb-12">
                                    <h2 className="text-4xl font-black text-slate-800 italic tracking-tight mb-2">
                                        {language === 'es' ? 'Tu Colección Privada' : 'Your Stuff'}
                                    </h2>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Objetos Adquiridos</p>
                                </div>

                                {ownedAccessories.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                                        {ownedAccessories
                                            .filter(id => !deletedCatalogItems.includes(id))
                                            .map(id => {
                                                const item = ACCESSORIES.find(a => a.id === id) || STORE_ITEMS.find(i => i.id === id);
                                                if (!item) return null;

                                                return (
                                                    <motion.div
                                                        key={id}
                                                        whileHover={{ y: -5 }}
                                                        className="p-6 bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-lg flex flex-col items-center gap-4 transition-all relative group"
                                                    >
                                                        <div className="absolute top-2 right-2 z-20">
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => { e.stopPropagation(); deleteAccessory(id); }}
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>

                                                        <div className="w-20 h-20 flex items-center justify-center">
                                                            {typeof item.icon === 'string' && (item.icon.startsWith('/') || item.icon.startsWith('http')) ? (
                                                                <img src={item.icon} alt={item.name} className="w-full h-full object-contain drop-shadow-lg" />
                                                            ) : (
                                                                <span className="text-5xl drop-shadow-xl">{item.icon}</span>
                                                            )}
                                                        </div>
                                                        <div className="font-black text-slate-800 text-xs italic text-center leading-tight">
                                                            {language === 'es' ? item.name : (item as any).nameEn || item.name}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <div className="text-slate-300 py-32 text-center">
                                        <ShoppingBag className="w-24 h-24 mx-auto mb-6 opacity-20" />
                                        <p className="font-black uppercase tracking-widest text-xl">¿Aún no has comprado nada?</p>
                                        <button
                                            onClick={() => setActiveTab('avatar_shop')}
                                            className="mt-6 text-cyan-500 font-black hover:underline tracking-widest text-sm"
                                        >
                                            IR A LA BOUTIQUE
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )
                    }
                </AnimatePresence >
            </motion.div >
        </div >
    );
}
