import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, ZoomIn, ZoomOut, Check, Sparkles } from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import { Accessory } from './data/avatars';
import { useAvatar } from '@/context/AvatarContext';

interface FittingRoomProps {
    accessory: Accessory;
    onSave: (offsets: { x: number; y: number; scale: number; rotate: number; skewX: number; skewY: number; neck?: number; shoulders?: number; sleeves?: number }) => void;
    onClose: () => void;
    language?: 'es' | 'en';
    /** Valores iniciales cuando se abre para ajustar un accesorio ya equipado */
    initialOffsets?: { x: number; y: number; scale: number; rotate?: number; skewX?: number; skewY?: number; neck?: number; shoulders?: number; sleeves?: number };
}

export const FittingRoom: React.FC<FittingRoomProps> = ({
    accessory,
    onSave,
    onClose,
    language = 'es',
    initialOffsets
}) => {
    const { currentAvatar } = useAvatar();
    const [offsets, setOffsets] = useState(() => ({
        x: initialOffsets?.x ?? 0,
        y: initialOffsets?.y ?? 0,
        scale: initialOffsets?.scale ?? 1,
        rotate: initialOffsets?.rotate ?? 0,
        skewX: initialOffsets?.skewX ?? 0,
        skewY: initialOffsets?.skewY ?? 0,
        neck: initialOffsets?.neck ?? 22,
        shoulders: initialOffsets?.shoulders ?? 0,
        sleeves: initialOffsets?.sleeves ?? 0
    }));

    const [isProMode, setIsProMode] = useState(false);

    const updateOffset = (field: keyof typeof offsets, value: number) => {
        setOffsets(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(offsets);
        onClose();
    };

    const text = {
        es: {
            title: '¡Probador Virtual!',
            subtitle: 'Ajusta tu nuevo accesorio',
            posX: 'Mover Horizontal',
            posY: 'Mover Vertical',
            scale: 'Tamaño',
            rotate: 'Rotar',
            skewX: 'Inclinación Horizontal (X)',
            skewY: 'Inclinación Vertical (Y)',
            proMode: 'Modo Pro (Pixel Perfect)',
            proModeActive: 'MODO PRO ACTIVO',
            reset: 'Resetear',
            neck: 'Ajuste de Cuello',
            shoulders: 'Ancho de Hombros',
            sleeves: 'Largo de Manga',
            save: '¡Me queda perfecto!',
            tip: '💡 Usa el Modo Pro para ajustes milimétricos'
        },
        en: {
            title: 'Virtual Fitting Room!',
            subtitle: 'Adjust your new accessory',
            posX: 'Move Horizontal',
            posY: 'Move Vertical',
            scale: 'Size',
            rotate: 'Rotate',
            skewX: 'Horizontal Skew (X)',
            skewY: 'Vertical Skew (Y)',
            proMode: 'Pro Mode (Pixel Perfect)',
            proModeActive: 'PRO MODE ACTIVE',
            reset: 'Reset',
            neck: 'Neck Adjustment',
            shoulders: 'Shoulder Width',
            sleeves: 'Sleeve Length',
            save: 'Perfect Fit!',
            tip: '💡 Use Pro Mode for millimeter precision'
        }
    };

    const t = text[language];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10100] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl border-4 border-yellow-400/50 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-[url('/patterns/stars.png')] opacity-20"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-purple-900 flex items-center gap-2">
                                    <Sparkles className="w-8 h-8" />
                                    {t.title}
                                </h2>
                                <p className="text-purple-800 font-bold mt-1">{t.subtitle}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => { setIsProMode(!isProMode); }}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 border-2 ${isProMode ? 'bg-purple-900 text-yellow-400 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 'bg-purple-800/50 text-purple-200 border-purple-500/30'}`}
                                >
                                    <Sparkles className={`w-4 h-4 ${isProMode ? 'animate-pulse' : ''}`} />
                                    {isProMode ? t.proModeActive : t.proMode}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label={language === 'es' ? 'Cerrar' : 'Close'}
                                    className="w-12 h-12 bg-purple-900 hover:bg-purple-800 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto p-8 grid md:grid-cols-2 gap-8">
                        {/* LEFT: Avatar Preview */}
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border-2 border-purple-500/30">
                                <div className="flex items-center justify-center h-96 bg-gradient-to-br from-purple-950/50 to-blue-950/50 rounded-xl relative overflow-hidden">
                                    {/* Decorative mirror frame */}
                                    <div className="absolute inset-0 border-8 border-yellow-400/20 rounded-xl"></div>
                                    <div className="absolute top-4 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                                    <AvatarDisplay
                                        avatarId={currentAvatar || undefined}
                                        size="xl"
                                        accessoriesOverride={{ [accessory.type]: accessory.id }}
                                        accessoryOffsetsOverride={{ [accessory.id]: offsets }}
                                    />
                                </div>
                            </div>

                            {/* Tip */}
                            <div className="bg-cyan-500/20 border-2 border-cyan-400/50 rounded-xl p-4">
                                <p className="text-cyan-100 text-sm font-bold text-center">
                                    {t.tip}
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: Controls */}
                        <div className="space-y-6">
                            {/* Accessory Info */}
                            <div className="bg-gradient-to-br from-purple-800/50 to-indigo-800/50 rounded-2xl p-6 border-2 border-purple-400/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-4xl">
                                        {accessory.icon.startsWith('/') || accessory.icon.startsWith('http') ? (
                                            <img src={accessory.icon} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            accessory.icon
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">{accessory.name}</h3>
                                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${accessory.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900' :
                                            accessory.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                                                accessory.rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                                                    'bg-gray-500 text-white'
                                            }`}>
                                            {accessory.rarity.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Position Controls */}
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border-2 border-purple-500/30 space-y-5">
                                {/* X Position */}
                                <div>
                                    <label className="text-sm font-bold text-purple-300 mb-2 flex items-center justify-between">
                                        <span>← {t.posX} →</span>
                                        <span className="text-yellow-400 text-lg">{offsets.x > 0 ? '+' : ''}{offsets.x}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="-150"
                                        max="150"
                                        step={isProMode ? "0.2" : "1"}
                                        value={offsets.x}
                                        onChange={(e) => updateOffset('x', Number(e.target.value))}
                                        className="fitting-room-range w-full h-3 bg-purple-900/50 rounded-full appearance-none cursor-pointer accent-orange-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-yellow-400 [&::-webkit-slider-thumb]:to-orange-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                                    />
                                </div>

                                {/* Y Position */}
                                <div>
                                    <label className="text-sm font-bold text-purple-300 mb-2 flex items-center justify-between">
                                        <span>↑ {t.posY} ↓</span>
                                        <span className="text-yellow-400 text-lg">{offsets.y > 0 ? '+' : ''}{offsets.y}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="-150"
                                        max="150"
                                        step={isProMode ? "0.2" : "1"}
                                        value={offsets.y}
                                        onChange={(e) => updateOffset('y', Number(e.target.value))}
                                        className="fitting-room-range w-full h-3 bg-purple-900/50 rounded-full appearance-none cursor-pointer accent-cyan-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-cyan-400 [&::-webkit-slider-thumb]:to-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                                    />
                                </div>

                                {/* Scale */}
                                <div>
                                    <label className="text-sm font-bold text-purple-300 mb-2 flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <ZoomIn className="w-4 h-4" />
                                            {t.scale}
                                        </span>
                                        <span className="text-yellow-400 text-lg">{offsets.scale.toFixed(2)}x</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0.05"
                                        max="3.5"
                                        step={isProMode ? "0.01" : "0.05"}
                                        value={offsets.scale}
                                        onChange={(e) => updateOffset('scale', Number(e.target.value))}
                                        className="fitting-room-range w-full h-3 bg-purple-900/50 rounded-full appearance-none cursor-pointer accent-green-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-green-400 [&::-webkit-slider-thumb]:to-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                                    />
                                </div>

                                {/* Rotation */}
                                <div>
                                    <label className="text-sm font-bold text-purple-300 mb-2 flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <RotateCw className="w-4 h-4" />
                                            {t.rotate}
                                        </span>
                                        <span className="text-yellow-400 text-lg">{offsets.rotate}°</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="-180"
                                        max="180"
                                        step={isProMode ? "0.5" : "1"}
                                        value={offsets.rotate}
                                        onChange={(e) => updateOffset('rotate', Number(e.target.value))}
                                        className="fitting-room-range w-full h-3 bg-purple-900/50 rounded-full appearance-none cursor-pointer accent-pink-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-pink-400 [&::-webkit-slider-thumb]:to-rose-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                                    />
                                </div>

                                {/* Skew Controls */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-purple-300 mb-2 flex items-center justify-between">
                                            <span>{t.skewX}</span>
                                            <span className="text-yellow-400 font-mono">{offsets.skewX}°</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="-45"
                                            max="45"
                                            step={isProMode ? "0.5" : "1"}
                                            value={offsets.skewX}
                                            onChange={(e) => updateOffset('skewX', Number(e.target.value))}
                                            className="fitting-room-range w-full h-2 bg-purple-900/50 rounded-full appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-purple-300 mb-2 flex items-center justify-between">
                                            <span>{t.skewY}</span>
                                            <span className="text-yellow-400 font-mono">{offsets.skewY}°</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="-45"
                                            max="45"
                                            step={isProMode ? "0.5" : "1"}
                                            value={offsets.skewY}
                                            onChange={(e) => updateOffset('skewY', Number(e.target.value))}
                                            className="fitting-room-range w-full h-2 bg-purple-900/50 rounded-full appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Neck Adjustment (Jerseys only) */}
                                {(accessory.type === 'torso' || accessory.id.includes('jersey') || accessory.id.includes('tshirt')) && (
                                    <div className="pt-4 border-t border-purple-500/20">
                                        <label className="text-sm font-bold text-yellow-400 mb-2 flex items-center justify-between">
                                            <span>👔 {t.neck}</span>
                                            <span className="text-white bg-purple-900/80 px-2 py-0.5 rounded text-xs font-mono">{offsets.neck}%</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            step={isProMode ? "0.5" : "1"}
                                            value={offsets.neck}
                                            onChange={(e) => updateOffset('neck', Number(e.target.value))}
                                            className="fitting-room-range w-full h-3 bg-purple-950 rounded-full appearance-none cursor-pointer accent-yellow-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                                        />
                                        <p className="text-[10px] text-purple-400 mt-2 italic">Aumenta para agrandar el escote, disminuye para cerrarlo.</p>
                                    </div>
                                )}

                                {/* Shoulders & Sleeves (Jerseys only) */}
                                {(accessory.type === 'torso' || accessory.id.includes('jersey') || accessory.id.includes('tshirt')) && (
                                    <>
                                        {/* Shoulders */}
                                        <div className="pt-4 border-t border-purple-500/20">
                                            <label className="text-sm font-bold text-yellow-400 mb-2 flex items-center justify-between">
                                                <span>↔️ {t.shoulders}</span>
                                                <span className="text-white bg-purple-900/80 px-2 py-0.5 rounded text-xs font-mono">{offsets.shoulders}%</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="-20"
                                                max="20"
                                                step={isProMode ? "0.5" : "1"}
                                                value={offsets.shoulders}
                                                onChange={(e) => updateOffset('shoulders', Number(e.target.value))}
                                                className="fitting-room-range w-full h-3 bg-purple-950 rounded-full appearance-none cursor-pointer accent-orange-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                                            />
                                        </div>

                                        {/* Sleeves */}
                                        <div className="pt-4 border-t border-purple-500/20">
                                            <label className="text-sm font-bold text-yellow-400 mb-2 flex items-center justify-between">
                                                <span>✂️ {t.sleeves}</span>
                                                <span className="text-white bg-purple-900/80 px-2 py-0.5 rounded text-xs font-mono">{offsets.sleeves}%</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="-40"
                                                max="60"
                                                step={isProMode ? "0.5" : "1"}
                                                value={offsets.sleeves}
                                                onChange={(e) => updateOffset('sleeves', Number(e.target.value))}
                                                className="fitting-room-range w-full h-3 bg-purple-950 rounded-full appearance-none cursor-pointer accent-pink-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Reset Button */}
                                <button
                                    type="button"
                                    onClick={() => setOffsets({ x: 0, y: 0, scale: 1, rotate: 0, skewX: 0, skewY: 0, neck: 22, shoulders: 0, sleeves: 0 })}
                                    className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-400/50 text-red-300 font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {t.reset}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Botón Guardar siempre visible abajo */}
                    <div className="shrink-0 p-6 pt-0 bg-gradient-to-t from-purple-900/80 to-transparent">
                        <motion.button
                            type="button"
                            onClick={handleSave}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-black text-xl rounded-2xl shadow-2xl flex items-center justify-center gap-3 border-4 border-green-300/50"
                        >
                            <Check className="w-7 h-7" />
                            {t.save}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
