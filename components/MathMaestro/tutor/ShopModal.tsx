import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ShoppingCart, Sparkles, Coins, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShopItem {
    id: string;
    name: { es: string, en: string };
    price: number;
    icon: string;
    description: { es: string, en: string };
}

const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'golden_crown',
        name: { es: 'Corona de Oro', en: 'Golden Crown' },
        price: 50,
        icon: '👑',
        description: { es: 'Para los reyes de las matemáticas.', en: 'For the kings of math.' }
    },
    {
        id: 'cool_shades',
        name: { es: 'Gafas Pro', en: 'Cool Shades' },
        price: 30,
        icon: '🕶️',
        description: { es: 'El estilo más cool del salón.', en: 'The coolest style in class.' }
    },
    {
        id: 'magic_wand',
        name: { es: 'Varita Mágica', en: 'Magic Wand' },
        price: 75,
        icon: '🪄',
        description: { es: 'Multiplica con magia pura.', en: 'Multiply with pure magic.' }
    },
    {
        id: 'robot_pet',
        name: { es: 'Mini Robot', en: 'Mini Robot' },
        price: 150,
        icon: '🤖',
        description: { es: 'Un compañero metálico.', en: 'A metallic companion.' }
    }
];

interface ShopModalProps {
    isOpen: boolean;
    onClose: () => void;
    coins: number;
    inventory: string[];
    equippedItems: string[];
    onBuy: (id: string, price: number) => void;
    onToggleEquip: (id: string) => void;
    language: 'es' | 'en';
}

export const ShopModal: React.FC<ShopModalProps> = ({
    isOpen,
    onClose,
    coins,
    inventory,
    equippedItems,
    onBuy,
    onToggleEquip,
    language
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-indigo-900/40 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-500/20 rounded-2xl">
                                    <ShoppingBag className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">
                                        {language === 'es' ? 'Tienda de Tesoros' : 'Treasure Shop'}
                                    </h2>
                                    <p className="text-slate-400 text-sm font-medium">
                                        {language === 'es' ? '¡Colecciónalos todos!' : 'Collect them all!'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-slate-800 rounded-full px-4 py-2 border border-white/5 shadow-inner">
                                    <Coins className="w-5 h-5 text-amber-400" />
                                    <span className="font-black text-white text-lg">{coins}</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                                >
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Items Grid */}
                        <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {SHOP_ITEMS.map((item) => {
                                    const isOwned = inventory.includes(item.id);
                                    const isEquipped = equippedItems.includes(item.id);
                                    const canAfford = coins >= item.price;

                                    return (
                                        <motion.div
                                            key={item.id}
                                            whileHover={{ y: -4 }}
                                            className={`relative p-4 rounded-3xl border-2 transition-all ${isOwned
                                                ? 'bg-slate-800/50 border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                                                : 'bg-slate-900/50 border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white/5">
                                                    {item.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-white text-lg leading-tight">
                                                        {item.name[language]}
                                                    </h3>
                                                    <p className="text-slate-400 text-xs mt-1 font-medium">
                                                        {item.description[language]}
                                                    </p>
                                                    {!isOwned && (
                                                        <div className="flex items-center gap-1 mt-2">
                                                            <Coins className="w-3 h-3 text-amber-400" />
                                                            <span className={`text-sm font-black ${canAfford ? 'text-amber-400' : 'text-rose-400'}`}>
                                                                {item.price}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                {isOwned ? (
                                                    <Button
                                                        onClick={() => onToggleEquip(item.id)}
                                                        className={`flex-1 rounded-xl font-bold transition-all ${isEquipped
                                                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                                            }`}
                                                    >
                                                        {isEquipped
                                                            ? (language === 'es' ? 'Equipado' : 'Equipped')
                                                            : (language === 'es' ? 'Equipar' : 'Equip')}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        disabled={!canAfford}
                                                        onClick={() => onBuy(item.id, item.price)}
                                                        className={`flex-1 rounded-xl font-black transition-all ${canAfford
                                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/20'
                                                            : 'bg-slate-800 text-slate-500 grayscale cursor-not-allowed'
                                                            }`}
                                                    >
                                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                                        {language === 'es' ? 'Comprar' : 'Buy'}
                                                    </Button>
                                                )}
                                            </div>

                                            {isEquipped && (
                                                <div className="absolute top-2 right-2">
                                                    <CheckCircle2 className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-900/80 border-t border-white/5 flex justify-center">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                {language === 'es' ? 'Gana monedas resolviendo ejercicios' : 'Earn coins by solving exercises'}
                                <Sparkles className="w-3 h-3 text-amber-500" />
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
