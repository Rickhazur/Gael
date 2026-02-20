import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';

export type AvatarState = 'idle' | 'speaking' | 'thinking' | 'celebrating' | 'waiting' | 'excited' | 'encouraging';

interface RachelleAvatarProps {
    state: AvatarState;
    className?: string;
    size?: number;
    equippedItems?: string[];
}

export const RachelleAvatar: React.FC<RachelleAvatarProps> = ({ state, className = '', size = 120, equippedItems = [] }) => {
    const [blink, setBlink] = useState(false);
    const [bounce, setBounce] = useState(0);

    // 👁️ Natural Blinking - More Frequent & Random
    useEffect(() => {
        const randomBlink = () => {
            setBlink(true);
            setTimeout(() => setBlink(false), 120);
            const nextBlink = 2000 + Math.random() * 3000;
            setTimeout(randomBlink, nextBlink);
        };
        const timeout = setTimeout(randomBlink, 1500);
        return () => clearTimeout(timeout);
    }, []);

    // 🎉 Celebration Bounce
    useEffect(() => {
        if (state === 'celebrating') {
            let count = 0;
            const interval = setInterval(() => {
                setBounce(Math.sin(count) * 10);
                count += 0.5;
            }, 50);
            return () => clearInterval(interval);
        }
    }, [state]);

    // 🎬 Animation Variants - Super Dynamic!
    const containerVariants: Variants = {
        idle: {
            y: [0, -5, 0, -3, 0],
            rotate: [0, 1, 0, -1, 0],
            transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
        },
        speaking: {
            y: [0, -3, 0],
            scale: [1, 1.02, 1],
            transition: { repeat: Infinity, duration: 0.8, ease: "easeInOut" }
        },
        thinking: {
            rotate: [0, 8, 0, -8, 0],
            y: [0, -2, 0],
            transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
        },
        celebrating: {
            y: [0, -20, 0],
            rotate: [0, -5, 5, 0],
            scale: [1, 1.1, 1],
            transition: { repeat: Infinity, duration: 0.4, ease: "easeOut" }
        },
        waiting: {
            y: [0, -2, 0],
            transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
        },
        excited: {
            y: [0, -8, 0],
            scale: [1, 1.05, 1],
            rotate: [0, 3, -3, 0],
            transition: { repeat: Infinity, duration: 0.5, ease: "easeOut" }
        },
        encouraging: {
            y: [0, -4, 0],
            rotate: [0, 5, 0],
            transition: { repeat: Infinity, duration: 1, ease: "easeInOut" }
        }
    };

    // 🌈 Dynamic Aura Colors (Blue theme for Rachelle)
    const auraColors: Record<AvatarState, string> = {
        idle: 'from-blue-300/40 to-indigo-300/40',
        speaking: 'from-sky-400/50 to-cyan-400/50',
        thinking: 'from-violet-300/50 to-purple-300/50',
        celebrating: 'from-yellow-400/60 to-orange-400/60',
        waiting: 'from-slate-300/30 to-gray-300/30',
        excited: 'from-teal-400/50 to-emerald-400/50',
        encouraging: 'from-fuchsia-400/50 to-pink-400/50'
    };

    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>

            {/* ✨ Animated Background Aura - Multi-Layer */}
            <motion.div
                animate={{
                    scale: state === 'speaking' || state === 'celebrating' ? [1, 1.3, 1] : [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ repeat: Infinity, duration: state === 'celebrating' ? 0.5 : 2 }}
                className={`absolute inset-[-20%] bg-gradient-to-br ${auraColors[state]} rounded-full blur-xl`}
            />

            {/* Second Aura Layer - Rotating */}
            <motion.div
                animate={{
                    scale: [1.1, 1.3, 1.1],
                    rotate: [0, 180, 360]
                }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute inset-[-10%] bg-gradient-to-tr from-blue-200/20 via-transparent to-purple-200/20 rounded-full blur-lg"
            />

            {/* 💙 Rachelle's Image Container */}
            <motion.div
                variants={containerVariants}
                animate={state}
                className="relative w-full h-full flex items-center justify-center"
                style={{ y: bounce }}
            >
                {/* Main Avatar Image */}
                <motion.img
                    src="/assets/avatars/rachelle_avatar.png"
                    alt="Ms. Rachelle - English Tutor"
                    className="w-full h-full object-cover rounded-full shadow-lg"
                    animate={{
                        filter: state === 'speaking' ? 'brightness(1.15)' :
                            state === 'celebrating' ? 'brightness(1.2) saturate(1.1)' :
                                'brightness(1)',
                    }}
                    style={{
                        border: state === 'celebrating' ? '4px solid #fbbf24' :
                            state === 'speaking' ? '3px solid #0ea5e9' :
                                '3px solid transparent'
                    }}
                />

                {/* 💭 Thinking Bubbles - Fun! */}
                {state === 'thinking' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-6 -right-6"
                    >
                        <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="relative"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="w-4 h-4 bg-violet-200 border-2 border-violet-400 rounded-full absolute bottom-0 left-0 shadow-md"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                className="w-6 h-6 bg-violet-200 border-2 border-violet-400 rounded-full absolute bottom-3 left-3 shadow-md"
                            />
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-10 h-10 bg-violet-100 border-2 border-violet-400 rounded-xl flex items-center justify-center absolute bottom-8 left-6 shadow-lg"
                            >
                                <span className="text-xl">💭</span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}

                {/* 🎉 Celebrating Effects - MORE! */}
                {state === 'celebrating' && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 pointer-events-none"
                        >
                            {[...Array(8)].map((_, i) => (
                                <motion.span
                                    key={i}
                                    animate={{
                                        y: [0, -30, 0],
                                        x: [0, (i % 2 ? 10 : -10), 0],
                                        rotate: [0, 360],
                                        scale: [1, 1.3, 1]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 0.8 + (i * 0.1),
                                        delay: i * 0.1
                                    }}
                                    className="absolute text-2xl"
                                    style={{
                                        top: `${20 + (i * 10)}%`,
                                        left: `${10 + (i * 12)}%`,
                                    }}
                                >
                                    {['🌟', '⭐', '✨', '💙', '🎊', '🎉', '💎', '🌈'][i]}
                                </motion.span>
                            ))}
                        </motion.div>

                        {/* Victory Star (Only if not already equipped with something better or as default celebration) */}
                        {!equippedItems.some(item => item.includes('crown')) && (
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="absolute -top-8"
                            >
                                <motion.span
                                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.5 }}
                                    className="text-3xl"
                                >
                                    ⭐
                                </motion.span>
                            </motion.div>
                        )}
                    </>
                )}

                {/* 🎒 EQUIPPED ITEMS RENDERING */}
                {equippedItems.map((itemId) => {
                    if (itemId === 'golden_crown') {
                        return (
                            <motion.div key={itemId} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute -top-10 z-20">
                                <motion.span animate={{ rotate: [0, 3, -3, 0], y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-4xl drop-shadow-lg">👑</motion.span>
                            </motion.div>
                        );
                    }
                    if (itemId === 'cool_shades') {
                        return (
                            <motion.div key={itemId} className="absolute top-[30%] z-20">
                                <span className="text-3xl grayscale brightness-150 opacity-80">🕶️</span>
                            </motion.div>
                        );
                    }
                    if (itemId === 'magic_wand') {
                        return (
                            <motion.div key={itemId} className="absolute -right-6 bottom-4 z-20">
                                <motion.span animate={{ rotate: [0, 45, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-3xl">🪄</motion.span>
                            </motion.div>
                        );
                    }
                    if (itemId === 'robot_pet') {
                        return (
                            <motion.div key={itemId} className="absolute -left-10 bottom-0 z-20">
                                <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-3xl">🤖</motion.span>
                            </motion.div>
                        );
                    }
                    return null;
                })}

                {/* 🙌 Encouraging State */}
                {state === 'encouraging' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-4 -top-4"
                    >
                        <motion.span
                            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="text-3xl"
                        >
                            👏
                        </motion.span>
                    </motion.div>
                )}

                {/* 🗣️ Speech Indicator */}
                {(state === 'speaking' || state === 'excited') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1"
                    >
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    height: [4, 12, 4],
                                    backgroundColor: ['#0ea5e9', '#6366f1', '#0ea5e9']
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 0.4,
                                    delay: i * 0.1
                                }}
                                className="w-1.5 rounded-full"
                                style={{ minHeight: 4 }}
                            />
                        ))}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
