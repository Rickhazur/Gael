import React, { useEffect, useState } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';

export type AvatarState = 'idle' | 'speaking' | 'thinking' | 'celebrating' | 'waiting' | 'excited' | 'encouraging';

interface LinaAvatarProps {
    state: AvatarState;
    className?: string;
    size?: number;
    equippedItems?: string[];
    mode?: 'math' | 'spanish';
}

const MATH_SYMBOLS = ['+', '−', '×', '÷', '=', 'π', '√', 'Σ', '%', '∞'];
const LANGUAGE_SYMBOLS = ['¡', '¿', 'á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '...', '¿', '¡', '«', '»'];

export const LinaAvatar: React.FC<LinaAvatarProps> = ({ state, className = '', size = 120, equippedItems = [], mode = 'math' }) => {
    const [blink, setBlink] = useState(false);
    const [mouthOpen, setMouthOpen] = useState(false);
    const [bounce, setBounce] = useState(0);
    const [activeSymbols, setActiveSymbols] = useState<{ id: number; symbol: string; x: number; y: number }[]>([]);

    // 👁️ Natural Blinking - More Frequent & Random
    useEffect(() => {
        const randomBlink = () => {
            setBlink(true);
            setTimeout(() => setBlink(false), 120);
            const nextBlink = 1500 + Math.random() * 3000; // Slightly more frequent
            setTimeout(randomBlink, nextBlink);
        };
        const timeout = setTimeout(randomBlink, 1000);
        return () => clearTimeout(timeout);
    }, []);

    // 👄 Mouth Animation - Synced with speaking (sutil, que medio se note)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state === 'speaking' || state === 'excited') {
            interval = setInterval(() => {
                setMouthOpen(prev => !prev);
            }, 240 + Math.random() * 80); // Más lento = menos exagerado
        } else {
            setMouthOpen(false);
        }
        return () => clearInterval(interval);
    }, [state]);

    // ✨ Floating Symbols for Speaking/Excited/Celebrating (Math or Language)
    useEffect(() => {
        if (state === 'speaking' || state === 'excited' || state === 'celebrating') {
            const symbols = mode === 'spanish' ? LANGUAGE_SYMBOLS : MATH_SYMBOLS;
            const interval = setInterval(() => {
                if (activeSymbols.length < 5) {
                    const newSymbol = {
                        id: Date.now(),
                        symbol: symbols[Math.floor(Math.random() * symbols.length)],
                        x: (Math.random() - 0.5) * 120, // Random X offset
                        y: 0
                    };
                    setActiveSymbols(prev => [...prev, newSymbol]);
                    setTimeout(() => {
                        setActiveSymbols(prev => prev.filter(s => s.id !== newSymbol.id));
                    }, 2000);
                }
            }, 400);
            return () => clearInterval(interval);
        } else {
            setActiveSymbols([]);
        }
    }, [state, activeSymbols.length, mode]);

    // 🎉 Celebration Bounce
    useEffect(() => {
        if (state === 'celebrating') {
            let count = 0;
            const interval = setInterval(() => {
                setBounce(Math.sin(count) * 15); // More intense bounce
                count += 0.6;
            }, 40);
            return () => clearInterval(interval);
        } else {
            setBounce(0);
        }
    }, [state]);

    // 🎬 Animation Variants - More Dynamic & Energetic!
    const containerVariants: Variants = {
        idle: {
            y: [0, -10, 0, -6, 0], // More pronounced "breathing"
            rotate: [0, 3, 0, -3, 0], // More swaying
            scale: [1, 1.02, 1],
            transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } // Energetic idle
        },
        speaking: {
            y: [0, -8, 0],
            scale: [1, 1.08, 1], // Stronger pulsing
            rotate: [0, 2, -2, 0],
            transition: { repeat: Infinity, duration: 0.5, ease: "easeInOut" }
        },
        thinking: {
            rotate: [0, 15, 0, -15, 0], // more curious tilting
            y: [0, -5, 0],
            scale: [1, 0.95, 1],
            transition: { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
        },
        celebrating: {
            y: [0, -35, 0], // EVEN HIGHER JUMPS!
            rotate: [0, -15, 15, 0],
            scale: [1, 1.25, 1],
            transition: { repeat: Infinity, duration: 0.3, ease: "easeOut" } // Super fast & happy
        },
        waiting: {
            y: [0, -6, 0],
            rotate: [0, 5, -5, 0],
            transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
        },
        excited: {
            y: [0, -15, 0],
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
            transition: { repeat: Infinity, duration: 0.35, ease: "easeOut" }
        },
        encouraging: {
            y: [0, -10, 0],
            rotate: [0, 12, 0],
            scale: [1, 1.1, 1],
            transition: { repeat: Infinity, duration: 0.7, ease: "easeInOut" }
        }
    };

    // 🌈 Dynamic Aura Colors
    const auraColors: Record<AvatarState, string> = {
        idle: 'from-indigo-400/50 to-purple-400/50',
        speaking: 'from-cyan-400/60 to-blue-500/60',
        thinking: 'from-amber-400/50 to-orange-400/50',
        celebrating: 'from-yellow-400/70 via-pink-500/70 to-purple-500/70',
        waiting: 'from-slate-300/40 to-gray-400/40',
        excited: 'from-emerald-400/60 to-cyan-500/60',
        encouraging: 'from-rose-400/60 to-pink-500/60'
    };

    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>

            {/* ✨ Animated Background Aura - High Performance */}
            <motion.div
                animate={{
                    scale: state === 'speaking' || state === 'celebrating' || state === 'excited' ? [1, 1.4, 1] : [1, 1.15, 1],
                    opacity: [0.4, 0.7, 0.4],
                    rotate: [0, 360]
                }}
                transition={{
                    scale: { repeat: Infinity, duration: state === 'celebrating' ? 0.4 : 1.5 },
                    opacity: { repeat: Infinity, duration: 2 },
                    rotate: { repeat: Infinity, duration: 10, ease: "linear" }
                }}
                className={`absolute inset-[-25%] bg-gradient-to-br ${auraColors[state]} rounded-full blur-2xl`}
            />

            {/* 🔢 Floating Symbols Layer */}
            <AnimatePresence>
                {activeSymbols.map((s) => (
                    <motion.div
                        key={s.id}
                        initial={{ opacity: 0, scale: 0, y: 0, x: s.x }}
                        animate={{ opacity: 0.8, scale: 1.2, y: -size * 0.8, x: s.x + (Math.random() - 0.5) * 30 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] z-30"
                        style={{ fontSize: size * 0.18 }}
                    >
                        {s.symbol}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* 🎀 Lina's Image Container */}
            <motion.div
                variants={containerVariants}
                animate={state}
                className="relative w-full h-full flex items-center justify-center"
                style={{ y: bounce }}
            >
                {/* Main Avatar Image */}
                <motion.div className="relative w-full h-full">
                    <motion.img
                        src={(() => {
                            if (typeof window !== 'undefined') {
                                const storedGrade = localStorage.getItem('nova_user_grade');
                                if (mode === 'math' && (storedGrade === '1' || storedGrade === '0')) {
                                    return '/avatars/g1_robot.png';
                                }
                            }
                            return mouthOpen ? "/assets/avatars/lina_talking.png" : "/assets/avatars/lina_avatar.png";
                        })()}
                        alt="Tutor"
                        className="w-full h-full object-cover rounded-full shadow-2xl relative z-10 bg-white"
                        animate={{
                            filter: state === 'speaking' ? 'brightness(1.2)' :
                                state === 'celebrating' || state === 'excited' ? 'brightness(1.25) saturate(1.2)' :
                                    'brightness(1.05)',
                        }}
                        style={{
                            border: state === 'celebrating' ? '5px solid #fbbf24' :
                                state === 'speaking' ? '4px solid #06b6d4' :
                                    '4px solid transparent'
                        }}
                    />

                    {/* Outer Glow Ring */}
                    <motion.div
                        animate={{ opacity: [0, 0.5, 0], scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 rounded-full border-4 border-white/30 z-0"
                    />
                </motion.div>

                {/* 😊 Expression Overlay for Blinking */}
                {blink && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <div className="relative" style={{ width: '40%', marginTop: '-15%' }}>
                            <div className="flex justify-between">
                                <motion.div animate={{ scaleY: [1, 0.1, 1] }} className="w-3 h-1.5 bg-slate-900/80 rounded-full" />
                                <motion.div animate={{ scaleY: [1, 0.1, 1] }} className="w-3 h-1.5 bg-slate-900/80 rounded-full" />
                            </div>
                        </div>
                    </div>
                )}

                {/* 💭 Thinking Bubbles - Even More Dynamic! */}
                {state === 'thinking' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-10 -right-10 z-30"
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="relative"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="w-5 h-5 bg-white border-2 border-amber-400 rounded-full absolute bottom-0 left-0 shadow-lg"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                                className="w-8 h-8 bg-white border-2 border-amber-400 rounded-full absolute bottom-4 left-4 shadow-lg"
                            />
                            <motion.div
                                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2.5 }}
                                className="w-14 h-14 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-center justify-center absolute bottom-12 left-8 shadow-2xl"
                            >
                                <span className="text-3xl">🧐</span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}

                {/* 🎉 Celebrating Sparkles - MEGA! */}
                {state === 'celebrating' && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-[-40%] pointer-events-none z-40"
                        >
                            {/* Confetti particles */}
                            {[...Array(12)].map((_, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: [0, 1, 0],
                                        y: [0, -100 - Math.random() * 50],
                                        x: [(Math.random() - 0.5) * 150, (Math.random() - 0.5) * 200],
                                        rotate: [0, 720],
                                        scale: [0, 1.5, 0]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1 + Math.random(),
                                        delay: i * 0.1
                                    }}
                                    className="absolute text-2xl filter drop-shadow-md"
                                    style={{
                                        top: '50%',
                                        left: '50%',
                                    }}
                                >
                                    {['✨', '⭐', '🌟', '💫', '🎉', '🎊', '🔥', '💎', '🌈', '💯', '🚀', '💖'][i]}
                                </motion.span>
                            ))}
                        </motion.div>

                        {!equippedItems.some(item => item.includes('crown')) && (
                            <motion.div
                                initial={{ y: -40, opacity: 0, scale: 0 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                className="absolute -top-12 z-20"
                            >
                                <motion.span
                                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.3, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.4 }}
                                    className="text-4xl drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                                >
                                    👑
                                </motion.span>
                            </motion.div>
                        )}
                    </>
                )}

                {/* 🎒 EQUIPPED ITEMS RENDERING */}
                {equippedItems.map((itemId) => {
                    if (itemId === 'golden_crown') {
                        return (
                            <motion.div key={itemId} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute -top-14 z-30">
                                <motion.span animate={{ rotate: [0, 5, -5, 0], y: [0, -5, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-5xl drop-shadow-xl">👑</motion.span>
                            </motion.div>
                        );
                    }
                    if (itemId === 'cool_shades') {
                        return (
                            <motion.div key={itemId} className="absolute top-[32%] z-20">
                                <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-4xl grayscale brightness-125 opacity-90 drop-shadow-md">🕶️</motion.span>
                            </motion.div>
                        );
                    }
                    if (itemId === 'magic_wand') {
                        return (
                            <motion.div key={itemId} className="absolute -right-10 bottom-4 z-30">
                                <motion.span animate={{ rotate: [0, 60, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-4xl drop-shadow-lg">🪄</motion.span>
                            </motion.div>
                        );
                    }
                    if (itemId === 'robot_pet') {
                        return (
                            <motion.div key={itemId} className="absolute -left-12 bottom-0 z-30">
                                <motion.span animate={{ y: [0, -10, 0], x: [0, 5, 0], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="text-4xl drop-shadow-lg">🤖</motion.span>
                            </motion.div>
                        );
                    }
                    return null;
                })}

                {/* 💪 Encouraging State */}
                {state === 'encouraging' && (
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -right-8 -top-8 z-30"
                    >
                        <motion.span
                            animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.4, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                            className="text-5xl filter drop-shadow-lg"
                        >
                            💪
                        </motion.span>
                    </motion.div>
                )}

                {/* 🗣️ Speech Indicator - Enhanced */}
                {(state === 'speaking' || state === 'excited') && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 items-end h-8"
                    >
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    height: [6, 16 + Math.random() * 12, 6],
                                    backgroundColor: ['#06b6d4', '#ec4899', '#8b5cf6', '#06b6d4']
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 0.3 + Math.random() * 0.2,
                                    delay: i * 0.05
                                }}
                                className="w-2 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                            />
                        ))}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

