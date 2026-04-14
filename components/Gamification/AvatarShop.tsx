import React from 'react';
import { useAvatar, AVATAR_CHANGE_PENALTY_COINS } from '../../context/AvatarContext';
import { useGamification } from '../../context/GamificationContext';
import { AVATARS, ACCESSORIES, Accessory } from './data/avatars';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, UserCircle2, Sparkles, Check, Coins, Settings2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, Minus, X, Store, Lock, Key, Star, Trash2, RotateCcw, RotateCw, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ViewState } from '../../types';
import { AvatarDisplay } from './AvatarDisplay';
import { FittingRoom } from './FittingRoom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNovaSound } from '../../hooks/useNovaSound';

interface AvatarShopProps {
    demoData?: { showAccessories?: boolean; defaultCategory?: string; openStore?: boolean } | null;
    /** Show adopt pet egg button. Only true when used from Math Tutor context. */
    showAdoptButton?: boolean;
}

const DEMO_GLASSES_ID = 'acc_glasses_cyber_visor_frame'; // Gafas con imagen real

export const AvatarShop = ({ demoData = null, showAdoptButton = false }: AvatarShopProps) => {
    const {
        buyAccessory, equipAccessory, isOwned, unequipAccessory, deleteAccessory,
        ownedAccessories, equippedAccessories, setAvatar,
        currentAvatar, updateAccessoryOffset, accessoryOffsets, grade,
        userId, deletedCatalogItems, hideFromCatalog, userRole, fullCatalog
    } = useAvatar();

    const { coins, savingsBalance, withdrawCoinsFromBank, useCredit, spendCoins: spendCoinsGamification } = useGamification();
    const creditDebt = 0; // Will use actual state when available
    const creditLimit = 500; // Default credit limit
    const { playStoreOpen, playPurchase, playStickerApply, playNudge, playClick, playBack } = useNovaSound();

    const [mainTab, setMainTab] = React.useState<'characters' | 'accessories' | 'backpack'>('accessories');
    const VALID_CATEGORIES = ['glasses', 'jerseys', 'stickers', 'watches', 'hats', 'back', 'favorites', 'nova'];
    const [activeCategory, setActiveCategory] = React.useState(() =>
        demoData?.defaultCategory && VALID_CATEGORIES.includes(demoData.defaultCategory)
            ? demoData.defaultCategory
            : 'nova'
    );
    const [adjustingItem, setAdjustingItem] = React.useState<Accessory | null>(null);
    const [isStoreOpen, setIsStoreOpen] = React.useState(false);
    const [isOpening, setIsOpening] = React.useState(false);
    const [showFittingRoom, setShowFittingRoom] = React.useState(false);
    const [fittingAccessory, setFittingAccessory] = React.useState<Accessory | null>(null);
    const [failedImageIds, setFailedImageIds] = React.useState<Record<string, boolean>>({});
    const [imageUrlFallback, setImageUrlFallback] = React.useState<Record<string, string>>({});
    const [demoPurchaseItemId, setDemoPurchaseItemId] = React.useState<string | null>(null);
    const [pendingPurchaseItem, setPendingPurchaseItem] = React.useState<Accessory | null>(null);
    const [showPaymentModal, setShowPaymentModal] = React.useState(false);

    // Demo: forzar categoría "face" (Gafas) cuando se abre la tienda en modo demo
    React.useEffect(() => {
        if (demoData?.openStore && demoData?.defaultCategory === 'glasses') {
            setActiveCategory('glasses');
        }
    }, [demoData?.openStore, demoData?.defaultCategory]);

    // Demo: escuchar compra de gafas → animación de compra → mostrar avatar con gafas
    React.useEffect(() => {
        if (!demoData?.openStore && !demoData?.showAccessories) return;
        const onDemoGlasses = () => {
            const glasses = fullCatalog.find((a) => a.id === DEMO_GLASSES_ID);
            if (!glasses) return;
            // Asegurar que estamos en la categoría de gafas
            setActiveCategory('face');
            setDemoPurchaseItemId(DEMO_GLASSES_ID);
            playPurchase();
            setTimeout(() => {
                setFittingAccessory(glasses);
                setShowFittingRoom(true);
                setDemoPurchaseItemId(null);
            }, 1800);
        };
        window.addEventListener('nova-demo-shop-glasses', onDemoGlasses);
        return () => window.removeEventListener('nova-demo-shop-glasses', onDemoGlasses);
    }, [demoData?.openStore, demoData?.showAccessories, playPurchase]);

    const categories = ['glasses', 'jerseys', 'shorts', 'favorites', 'nova'];
    const availableAvatars = AVATARS;

    const handleOpenStore = () => {
        setIsOpening(true);
        playStoreOpen();
        setTimeout(() => {
            setIsStoreOpen(true);
            setIsOpening(false);
        }, 1500);
    };

    const handleBuy = (item: any) => {
        if (isOwned(item.id)) {
            equipAccessory(item);
            toast.success(`¡Ya tienes ${item.name}! Lo acabas de equipar.`);
            return;
        }
        // Show payment method selection modal
        setPendingPurchaseItem(item);
        setShowPaymentModal(true);
        playClick();
    };

    const handlePaymentConfirm = async (method: 'debit' | 'savings' | 'credit') => {
        if (!pendingPurchaseItem) return;
        const item = pendingPurchaseItem;

        if (method === 'debit') {
            if (coins < item.cost) {
                playBack();
                toast.error('No tienes suficientes monedas en tu billetera.');
                return;
            }
            playPurchase();
            await buyAccessory(item);
            equipAccessory(item);
        } else if (method === 'savings') {
            if (savingsBalance < item.cost) {
                playBack();
                toast.error('No tienes suficiente saldo en el banco.');
                return;
            }
            playPurchase();
            await withdrawCoinsFromBank(item.cost);
            await buyAccessory(item);
            equipAccessory(item);
        } else if (method === 'credit') {
            if (creditDebt + item.cost > creditLimit) {
                playBack();
                toast.error(`Tu límite de crédito es ${creditLimit} monedas. Deuda actual: ${creditDebt}.`);
                return;
            }
            playPurchase();
            useCredit(item.cost);
            await buyAccessory(item);
            equipAccessory(item);
            toast.info(`Se cargaron ${item.cost} monedas a tu tarjeta de crédito.`);
        }

        setShowPaymentModal(false);
        setPendingPurchaseItem(null);
        setFittingAccessory(item);
        setShowFittingRoom(true);
    };

    const handleSaveFitting = (offsets: { x: number; y: number; scale: number; rotate: number; skewX: number; skewY: number; neck?: number; shoulders?: number; sleeves?: number }) => {
        if (fittingAccessory) {
            updateAccessoryOffset(fittingAccessory.id, offsets.x, offsets.y, offsets.scale, offsets.rotate, offsets.skewX, offsets.skewY, offsets.neck, offsets.shoulders, offsets.sleeves);
            toast.success(`¡${fittingAccessory.name} guardado perfectamente!`);
        }
    };

    const handleSelectAvatar = (avatarId: string) => {
        const isChange = currentAvatar != null && avatarId !== currentAvatar;
        if (isChange) {
            const ok = window.confirm(
                `Tu avatar es permanente. Para cambiarlo aquí en la Tienda Nova se descontarán ${AVATAR_CHANGE_PENALTY_COINS} monedas. ¿Continuar?`
            );
            if (!ok) return;
        }
        playStickerApply();
        setAvatar(avatarId as any);
        if (!isChange) toast.success("¡Avatar elegido! Te acompañará siempre.");
        // Si es cambio, el toast ya lo muestra AvatarContext
    };

    const handleNudge = (dx: number, dy: number, ds: number, dr: number = 0, dkx: number = 0, dky: number = 0) => {
        if (!adjustingItem) return;
        playNudge();
        const current = accessoryOffsets[adjustingItem.id] || { x: 0, y: 0, scale: 1, rotate: 0, skewX: 0, skewY: 0 };
        updateAccessoryOffset(
            adjustingItem.id,
            current.x + dx,
            current.y + dy,
            Math.max(0.2, current.scale + ds),
            (current.rotate || 0) + dr,
            (current.skewX || 0) + dkx,
            (current.skewY || 0) + dky
        );
    };

    const StylistPanel = () => {
        if (!adjustingItem) return null;
        const [precision, setPrecision] = React.useState(false); // false = normal, true = pixel-perfect
        const current = accessoryOffsets[adjustingItem.id] || { x: 0, y: 0, scale: 1, rotate: 0, skewX: 0, skewY: 0 };
        const isWatch = adjustingItem.type === 'watch';
        const mult = precision ? 0.5 : 1;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
                <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-indigo-500 w-full max-w-sm animate-in zoom-in duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                                {adjustingItem.icon.startsWith('/') || adjustingItem.icon.startsWith('http') || adjustingItem.icon.includes('supabase') || adjustingItem.icon.includes('.png') || adjustingItem.icon.includes('.jpg') ? <img src={adjustingItem.icon} className="w-8 h-8 object-contain" /> : adjustingItem.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Sastrería Pro</h3>
                                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-tighter">{adjustingItem.name}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant={precision ? "default" : "outline"}
                                className={cn("h-8 rounded-lg text-[10px] font-bold px-2", precision ? "bg-emerald-500 hover:bg-emerald-600 border-none" : "text-slate-400")}
                                onClick={() => { playClick(); setPrecision(!precision); }}
                            >
                                <Sparkles className="w-3 h-3 mr-1" /> {precision ? 'MODO PRO' : 'MODO NORMAL'}
                            </Button>
                            <button onClick={() => { playBack(); setAdjustingItem(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posición</span>
                            <div className="grid grid-cols-3 gap-1">
                                <div />
                                <Button size="icon" variant="outline" className="rounded-xl w-10 h-10" onClick={() => handleNudge(0, -2 * mult, 0, 0)}><ChevronUp /></Button>
                                <div />
                                <Button size="icon" variant="outline" className="rounded-xl w-10 h-10" onClick={() => handleNudge(-2 * mult, 0, 0, 0)}><ChevronLeft /></Button>
                                <div className="bg-indigo-50 rounded-lg flex items-center justify-center text-[10px] font-mono text-indigo-400 font-bold">
                                    {current.x},{current.y}
                                </div>
                                <Button size="icon" variant="outline" className="rounded-xl w-10 h-10" onClick={() => handleNudge(2 * mult, 0, 0, 0)}><ChevronRight /></Button>
                                <div />
                                <Button size="icon" variant="outline" className="rounded-xl w-10 h-10" onClick={() => handleNudge(0, 2 * mult, 0, 0)}><ChevronDown /></Button>
                                <div />
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escala</span>
                            <div className="flex flex-col gap-2 h-full justify-center w-full">
                                <Button size="lg" variant="outline" className="rounded-xl w-full h-10 flex gap-2 text-xs font-bold" onClick={() => handleNudge(0, 0, 0.05 * mult, 0)}>
                                    <Plus className="w-4 h-4" /> Aumentar
                                </Button>
                                <div className="text-center font-mono text-xs text-indigo-500 font-bold bg-indigo-50 py-1 rounded-lg">
                                    {(current.scale * 100).toFixed(0)}%
                                </div>
                                <Button size="lg" variant="outline" className="rounded-xl w-full h-10 flex gap-2 text-xs font-bold" onClick={() => handleNudge(0, 0, -0.05 * mult, 0)}>
                                    <Minus className="w-4 h-4" /> Reducir
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inmclinación (X)</span>
                            <div className="flex items-center gap-3">
                                <Button size="icon" variant="outline" className="w-10 h-10 rounded-xl" onClick={() => handleNudge(0, 0, 0, 0, -5 * mult, 0)}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <div className="text-center w-8">
                                    <span className="text-xs font-bold text-slate-800">{current.skewX || 0}°</span>
                                </div>
                                <Button size="icon" variant="outline" className="w-10 h-10 rounded-xl" onClick={() => handleNudge(0, 0, 0, 0, 5 * mult, 0)}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inclinación (Y)</span>
                            <div className="flex items-center gap-3">
                                <Button size="icon" variant="outline" className="w-10 h-10 rounded-xl" onClick={() => handleNudge(0, 0, 0, 0, 0, -5 * mult)}>
                                    <ChevronUp className="w-4 h-4" />
                                </Button>
                                <div className="text-center w-8">
                                    <span className="text-xs font-bold text-slate-800">{current.skewY || 0}°</span>
                                </div>
                                <Button size="icon" variant="outline" className="w-10 h-10 rounded-xl" onClick={() => handleNudge(0, 0, 0, 0, 0, 5 * mult)}>
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3 mt-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rotación Libre</span>
                        <div className="flex items-center gap-6">
                            <Button size="icon" variant="outline" className="w-12 h-12 rounded-2xl" onClick={() => handleNudge(0, 0, 0, -15 * mult)}>
                                <RotateCcw className="w-5 h-5 text-indigo-500" />
                            </Button>
                            <div className="text-center">
                                <span className="block text-lg font-black text-slate-800">{current.rotate || 0}°</span>
                            </div>
                            <Button size="icon" variant="outline" className="w-12 h-12 rounded-2xl" onClick={() => handleNudge(0, 0, 0, 15 * mult)}>
                                <RotateCw className="w-5 h-5 text-indigo-500" />
                            </Button>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 border-slate-200"
                            onClick={() => { playClick(); updateAccessoryOffset(adjustingItem.id, 0, 0, 1, 0, 0, 0); }}
                        >
                            Reiniciar
                        </Button>
                        <Button className="flex-[2] h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-fredoka text-lg shadow-lg shadow-indigo-200" onClick={() => { playStickerApply(); setAdjustingItem(null); }}>
                            ¡Perfecto!
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    };

    // Simplified: Store is always open within the main PrizeStore wrapper
    // (Entrance is now handled by the parent Fifth Ave component)

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col h-full bg-transparent perspective-[1500px]"
            >
                {/* 🏆 MAIN TABS (Characters / Accessories / Backpack) */}
                <div className="flex justify-center pt-8 px-6 shrink-0 z-50">
                    <div className="bg-slate-900/10 backdrop-blur-md p-1.5 rounded-2xl flex gap-1 border border-slate-200 shadow-sm">
                        {[
                            { id: 'characters', label: 'Personajes', icon: UserCircle2 },
                            { id: 'accessories', label: 'Boutique', icon: ShoppingBag },
                            { id: 'backpack', label: 'Inventario', icon: Gift }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { playClick(); setMainTab(tab.id as any); }}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                                    mainTab === tab.id
                                        ? "bg-slate-900 text-white shadow-xl scale-105"
                                        : "text-slate-500 hover:bg-slate-200"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 🗂️ CATEGORY SELECTOR (Only for Accessories tab) */}
                <AnimatePresence>
                    {mainTab === 'accessories' && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex justify-center p-6 shrink-0 z-50"
                        >
                            <div className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl flex gap-2 shadow-2xl border border-white/50 overflow-x-auto max-w-full no-scrollbar">
                                {VALID_CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { playClick(); setActiveCategory(cat); }}
                                        className={cn(
                                            "px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all min-w-max",
                                            activeCategory === cat
                                                ? (cat === 'nova' ? "bg-amber-400 text-slate-900 border-2 border-amber-200 shadow-xl scale-110" : "bg-slate-900 text-white scale-105 shadow-lg shadow-slate-200")
                                                : "text-slate-400 hover:bg-slate-100"
                                        )}
                                    >
                                        {cat === 'glasses' ? 'GAFAS' :
                                            cat === 'jerseys' ? 'CAMISETAS' :
                                                cat === 'stickers' ? 'STICKERS' :
                                                    cat === 'watches' ? 'RELOJES' :
                                                        cat === 'back' ? 'MOCHILAS' :
                                                            cat === 'favorites' ? 'PERSONAJES 3D' :
                                                                cat === 'nova' ? 'EXCLUSIVO NOVA' :
                                                                    cat === 'hats' ? 'CACHUCAS NOVA' : cat.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <StylistPanel />

                <div className="flex-1 overflow-hidden relative min-h-0">
                    <ScrollArea className="h-full">
                        <div className="p-12 pt-0 pb-40 relative">
                            {/* THE PEDESTAL GRID */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32">
                                {mainTab === 'characters' && AVATARS
                                    .filter(av => av.grade === grade || av.grade === 0)
                                    .map((item, idx) => {
                                        const equipped = currentAvatar === item.id;
                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.05, type: 'spring' }}
                                                className="relative flex flex-col items-center group cursor-pointer"
                                                onClick={() => handleSelectAvatar(item.id)}
                                            >
                                                <div className="relative w-48 h-64 flex items-center justify-center">
                                                    <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] border border-white/60 rounded-t-[3rem] skew-y-1 transform group-hover:bg-white/50 transition-all duration-500 overflow-hidden" />
                                                    <div className="absolute bottom-[-20%] w-56 h-32 bg-white rounded-b-3xl border-b-8 border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center pt-8">
                                                        <div className="px-4 py-1.5 bg-slate-900 rounded-lg text-white text-[8px] font-black tracking-widest uppercase mb-1 flex items-center gap-1">
                                                            {equipped ? 'TU PERSONAJE' : 'ELEGIR'}
                                                        </div>
                                                        <div className="font-bold text-slate-400 text-[10px] uppercase truncate px-4">{item.name}</div>
                                                    </div>
                                                    <div className="relative z-10 transition-transform duration-500 group-hover:scale-125 group-hover:-translate-y-4">
                                                        <img src={item.imageUrl} className="w-40 h-40 object-contain drop-shadow-2xl" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                {mainTab !== 'characters' && (() => {
                                    const itemsToDisplay = fullCatalog.filter(i => {
                                        if (deletedCatalogItems.includes(i.id)) return false;
                                        if (mainTab === 'backpack') return isOwned(i.id);

                                        // Filter by category
                                        const type = i.type as string;
                                        const isEquipped = equippedAccessories[type] === i.id;

                                        let matchesCategory = false;
                                        if (activeCategory === 'glasses') matchesCategory = type === 'glasses';
                                        else if (activeCategory === 'jerseys') matchesCategory = type === 'torso' && (i.id.includes('jersey') || i.id.includes('tshirt') || i.id.includes('nova'));
                                        else if (activeCategory === 'stickers') matchesCategory = type === 'sticker' || (type === 'torso' && (i.id.includes('sticker') || i.id.includes('medal')));
                                        else if (activeCategory === 'watches') matchesCategory = type === 'watch';
                                        else if (activeCategory === 'hats') matchesCategory = type === 'head';
                                        else if (activeCategory === 'back') matchesCategory = type === 'back';
                                        else if (activeCategory === 'nova') matchesCategory = i.id.includes('nova');
                                        else if (activeCategory === 'favorites') matchesCategory = i.id.includes('popup');
                                        else matchesCategory = type === activeCategory;

                                        // ALWAYS show the equipped item of this slot in its relevant category shop
                                        if (isEquipped) {
                                            if (activeCategory === 'jerseys' && type === 'torso') matchesCategory = true;
                                            if (activeCategory === 'stickers' && type === 'torso') matchesCategory = true;
                                            if (activeCategory === 'glasses' && type === 'glasses') matchesCategory = true;
                                            if (activeCategory === 'watches' && type === 'watch') matchesCategory = true;
                                            if (activeCategory === 'hats' && type === 'head') matchesCategory = true;
                                            if (activeCategory === 'back' && type === 'back') matchesCategory = true;
                                        }

                                        return matchesCategory;
                                    });

                                    return (
                                        <>
                                            {/* ⚡ ADMIN SHORTCUT: Add Item */}
                                            {userRole === 'ADMIN' && mainTab === 'accessories' && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        window.dispatchEvent(new CustomEvent('nova_navigate', { detail: ViewState.STORE }));
                                                        // Brief delay to ensure component mounts before triggering modal
                                                        setTimeout(() => {
                                                            window.dispatchEvent(new CustomEvent('nova_open_admin_store'));
                                                        }, 100);
                                                    }}
                                                    className="aspect-square bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-indigo-400 hover:bg-indigo-100/50 transition-all group overflow-hidden"
                                                >
                                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                                                        <Plus className="w-8 h-8" />
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="block text-[10px] font-black text-indigo-600 uppercase tracking-tighter">AGREGAR</span>
                                                        <span className="block text-[8px] font-bold text-stone-400 uppercase tracking-tight">ACCESORIO</span>
                                                    </div>
                                                </motion.button>
                                            )}

                                            {itemsToDisplay.sort((a, b) => {
                                                const typeA = a.type as string;
                                                const typeB = b.type as string;
                                                const aEquipped = equippedAccessories[typeA] === a.id;
                                                const bEquipped = equippedAccessories[typeB] === b.id;
                                                if (aEquipped && !bEquipped) return -1;
                                                if (!aEquipped && bEquipped) return 1;
                                                return 0;
                                            }).map((item, idx) => {
                                                const owned = isOwned(item.id);
                                                const equipped = equippedAccessories[item.type] === item.id;
                                                return (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: idx * 0.05, type: 'spring' }}
                                                        className="relative flex flex-col items-center group cursor-pointer"
                                                        onClick={() => {
                                                            if (owned) {
                                                                if (!equipped) {
                                                                    playClick();
                                                                    equipAccessory(item);
                                                                    toast.success(`Equipaste ${item.name}`);
                                                                }
                                                            } else handleBuy(item);
                                                        }}
                                                    >
                                                        {/* 🧊 THE HEXAGONAL VITRINE */}
                                                        <div className={cn("relative w-48 h-64 flex items-center justify-center", demoPurchaseItemId === item.id && "ring-4 ring-emerald-500 ring-offset-4 rounded-3xl animate-pulse")}>
                                                            {mainTab === 'backpack' && equipped && (
                                                                <div className="absolute -top-4 -right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg z-50 animate-bounce">
                                                                    <Check className="w-5 h-5" />
                                                                </div>
                                                            )}
                                                            {/* Demo: overlay ¡Comprado! */}
                                                            {demoPurchaseItemId === item.id && (
                                                                <div className="absolute inset-0 z-30 flex items-center justify-center bg-emerald-500/90 rounded-t-[3rem] animate-in zoom-in duration-300">
                                                                    <div className="text-white font-black text-center px-4">
                                                                        <Check className="w-16 h-16 mx-auto mb-2" strokeWidth={4} />
                                                                        <span className="text-lg tracking-wide">¡Comprado!</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] border border-white/60 rounded-t-[3rem] skew-y-1 transform group-hover:bg-white/50 transition-all duration-500 overflow-hidden">
                                                                <div className="absolute inset-x-[-50%] top-[-20%] h-full w-[200%] bg-gradient-to-tr from-transparent via-white/20 to-transparent rotate-45 animate-scanline" />
                                                            </div>

                                                            <div className="absolute bottom-[-20%] w-56 h-32 bg-white rounded-b-3xl border-b-8 border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center pt-8">
                                                                <div className="absolute top-0 inset-x-0 h-4 bg-cyan-100/50 shadow-[0_0_15px_cyan] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <div className="px-4 py-1.5 bg-slate-900 rounded-lg text-white text-[8px] font-black tracking-widest uppercase mb-1 flex items-center gap-1">
                                                                        {owned ? (equipped ? 'PUESTO' : 'OBTENIDO') : <><span className="text-[10px]">🪙</span> {item.cost}</>}
                                                                    </div>
                                                                    {owned && (
                                                                        <div className="flex gap-1">
                                                                            {!equipped && (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="h-7 px-2 text-[10px] font-bold border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                                                                                    onClick={(e) => { e.stopPropagation(); playClick(); equipAccessory(item); }}
                                                                                >
                                                                                    Ponerse
                                                                                </Button>
                                                                            )}
                                                                            {equipped && (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="h-7 px-2 text-[10px] font-bold border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                                                                                    onClick={(e) => { e.stopPropagation(); playClick(); setFittingAccessory(item); setShowFittingRoom(true); }}
                                                                                >
                                                                                    Ajustar
                                                                                </Button>
                                                                            )}
                                                                            {equipped && (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="h-7 px-2 text-[10px] font-bold border-slate-300 text-slate-600 hover:bg-slate-100"
                                                                                    onClick={(e) => { e.stopPropagation(); playClick(); unequipAccessory(item.type); toast.success(`Quitaste ${item.name}`); }}
                                                                                >
                                                                                    Quitar
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="font-bold text-slate-400 text-[10px] uppercase truncate px-4">{item.name}</div>
                                                            </div>

                                                            {!owned && (
                                                                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-yellow-400 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg animate-bounce z-20">
                                                                    NUEVO
                                                                </div>
                                                            )}

                                                            {(userId === 'test-pilot-quinto' || userRole === 'ADMIN') && (
                                                                <div className="absolute top-4 left-4 z-50">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-100 border-none shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={(e) => { e.stopPropagation(); hideFromCatalog(item.id); }}
                                                                        title="Eliminar de la Tienda (Para Siempre)"
                                                                    >
                                                                        <X className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                                                                    </Button>
                                                                </div>
                                                            )}

                                                            {owned && (
                                                                <div className="absolute top-4 right-4 z-50">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="destructive"
                                                                        className="w-10 h-10 rounded-full shadow-lg border-2 border-white hover:scale-110 active:scale-95 transition-all group-hover:opacity-100 opacity-0 bg-rose-500 hover:bg-rose-600"
                                                                        onClick={(e) => { e.stopPropagation(); deleteAccessory(item.id); }}
                                                                        title="Eliminar de mi baúl"
                                                                    >
                                                                        <Trash2 className="w-5 h-5 text-white" />
                                                                    </Button>
                                                                </div>
                                                            )}

                                                            <div className="relative z-10 transition-transform duration-500 group-hover:scale-125 group-hover:-translate-y-4">
                                                                {(() => {
                                                                    let displayIcon = imageUrlFallback[item.id] || item.icon;
                                                                    const isUrl = displayIcon.startsWith('/') ||
                                                                        displayIcon.startsWith('http') ||
                                                                        displayIcon.startsWith('C:') ||
                                                                        displayIcon.startsWith('data:') ||
                                                                        displayIcon.includes('supabase') ||
                                                                        displayIcon.includes('.png') ||
                                                                        displayIcon.includes('.jpg') ||
                                                                        displayIcon.includes('.jpeg');

                                                                    if (isUrl) {
                                                                        if (failedImageIds[item.id] && !displayIcon.startsWith('C:')) {
                                                                            return (
                                                                                <div className="w-24 h-24 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 border-2 border-amber-300 text-amber-800 font-black text-[10px] text-center px-2 shadow-inner">
                                                                                    <span className="uppercase tracking-tighter leading-tight">{item.name.replace(' - ', '\n')}</span>
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return (
                                                                            <div className="relative group/img">
                                                                                {item.rarity === 'legendary' && <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-40 group-hover/img:opacity-70 animate-pulse transition-opacity" />}
                                                                                <img
                                                                                    src={displayIcon}
                                                                                    alt={item.name}
                                                                                    className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.3)] relative z-10"
                                                                                    onError={() => {
                                                                                        const url = imageUrlFallback[item.id] || item.icon;
                                                                                        if (url.endsWith('.png') && !imageUrlFallback[item.id]) {
                                                                                            setImageUrlFallback(prev => ({ ...prev, [item.id]: url.replace(/\.png$/i, '.jpg') }));
                                                                                        } else {
                                                                                            setFailedImageIds(prev => ({ ...prev, [item.id]: true }));
                                                                                        }
                                                                                    }}
                                                                                    style={{
                                                                                        filter: item.id.includes('nova_gold')
                                                                                            ? 'sepia(1) saturate(3) hue-rotate(10deg) brightness(0.9) contrast(1.2)'
                                                                                            : (item.id.includes('nova_neon')
                                                                                                ? 'hue-rotate(280deg) saturate(2) contrast(1.1) brightness(1.2)'
                                                                                                : (item.id.includes('nova_official') || item.id.includes('nova_premium') || item.id.includes('retro') || item.id.includes('spiderman') || item.id.includes('diamond') || item.id.includes('black')
                                                                                                    ? 'url(#premiumJerseyFilter)'
                                                                                                    : 'url(#premiumJerseyFilter)'))
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return <span className="text-7xl drop-shadow-2xl max-w-full break-all inline-block truncate">{item.icon.length > 2 ? item.icon : item.icon}</span>;
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-[-30%] left-1/2 -translate-x-1/2 w-40 h-2 bg-cyan-400/20 blur-xl opacity-0 group-hover:opacity-100" />
                                                    </motion.div>
                                                );
                                            })}
                                        </>
                                    );
                                })()}
                            </div >
                        </div>
                    </ScrollArea>
                </div>

                {/* 🥚 FLOAT ADOPT BUTTON (Bottom Right) - Only in Math context via showAdoptButton */}
                {showAdoptButton && (
                    <div className="absolute bottom-12 right-12 z-50">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-gradient-to-r from-[#9333ea] to-[#db2777] text-white px-10 py-5 rounded-full font-black text-xl shadow-[0_15px_40px_rgba(147,51,234,0.4)] flex items-center gap-3 active:shadow-none transition-all border-2 border-white/20"
                        >
                            🥚 <span className="tracking-tighter italic">¡Adoptar!</span>
                        </motion.button>
                    </div>
                )}
            </motion.div>

            {/* 💳 PAYMENT METHOD SELECTION MODAL */}
            <AnimatePresence>
                {showPaymentModal && pendingPurchaseItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => { setShowPaymentModal(false); setPendingPurchaseItem(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 40 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="bg-white rounded-[2rem] p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Coins className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">¿Cómo quieres pagar?</h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    <span className="font-bold text-slate-600">{pendingPurchaseItem.name}</span> — <span className="text-amber-600 font-bold">🪙 {pendingPurchaseItem.cost}</span>
                                </p>
                            </div>

                            {/* Payment Options */}
                            <div className="space-y-3">
                                {/* DEBIT CARD */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={coins < pendingPurchaseItem.cost}
                                    onClick={() => handlePaymentConfirm('debit')}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left",
                                        coins >= pendingPurchaseItem.cost
                                            ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100"
                                            : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md flex-shrink-0">
                                        <span className="text-2xl">💳</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-800 text-sm">Tarjeta Débito</div>
                                        <div className="text-xs text-slate-400">Billetera Nova</div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className={cn("font-black text-lg", coins >= pendingPurchaseItem.cost ? "text-emerald-600" : "text-red-400")}>
                                            🪙 {coins.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">disponible</div>
                                    </div>
                                </motion.button>

                                {/* BANK SAVINGS */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={savingsBalance < pendingPurchaseItem.cost}
                                    onClick={() => handlePaymentConfirm('savings')}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left",
                                        savingsBalance >= pendingPurchaseItem.cost
                                            ? "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100"
                                            : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md flex-shrink-0">
                                        <span className="text-2xl">🏦</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-800 text-sm">Cuenta de Ahorros</div>
                                        <div className="text-xs text-slate-400">Nova Bank</div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className={cn("font-black text-lg", savingsBalance >= pendingPurchaseItem.cost ? "text-blue-600" : "text-red-400")}>
                                            🪙 {savingsBalance.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">en el banco</div>
                                    </div>
                                </motion.button>

                                {/* CREDIT CARD */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={creditDebt + pendingPurchaseItem.cost > creditLimit}
                                    onClick={() => handlePaymentConfirm('credit')}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left",
                                        creditDebt + pendingPurchaseItem.cost <= creditLimit
                                            ? "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100"
                                            : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0">
                                        <span className="text-2xl">💎</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-800 text-sm">Tarjeta de Crédito</div>
                                        <div className="text-xs text-slate-400">Crédito Nova</div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className={cn("font-black text-lg", creditDebt + pendingPurchaseItem.cost <= creditLimit ? "text-purple-600" : "text-red-400")}>
                                            🪙 {(creditLimit - creditDebt).toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">crédito libre</div>
                                    </div>
                                </motion.button>
                            </div>

                            {/* Cancel Button */}
                            <button
                                onClick={() => { setShowPaymentModal(false); setPendingPurchaseItem(null); }}
                                className="w-full mt-4 py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                            >
                                Cancelar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fitting Room Modal (medidas: posición, tamaño, rotar) */}
            {showFittingRoom && fittingAccessory && (
                <FittingRoom
                    accessory={fittingAccessory}
                    onSave={handleSaveFitting}
                    onClose={() => setShowFittingRoom(false)}
                    language="es"
                    initialOffsets={accessoryOffsets[fittingAccessory.id] ? {
                        x: accessoryOffsets[fittingAccessory.id].x,
                        y: accessoryOffsets[fittingAccessory.id].y,
                        scale: accessoryOffsets[fittingAccessory.id].scale,
                        rotate: accessoryOffsets[fittingAccessory.id].rotate,
                        skewX: accessoryOffsets[fittingAccessory.id].skewX,
                        skewY: accessoryOffsets[fittingAccessory.id].skewY,
                        neck: accessoryOffsets[fittingAccessory.id].neck,
                        shoulders: accessoryOffsets[fittingAccessory.id].shoulders,
                        sleeves: accessoryOffsets[fittingAccessory.id].sleeves
                    } : undefined}
                />
            )}
        </>
    );
};

