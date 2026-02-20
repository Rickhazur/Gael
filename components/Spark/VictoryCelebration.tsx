/**
 * Victory Celebration - Confetti, animations, and celebration effects
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Confetto {
    id: string;
    x: number;
    delay: number;
    duration: number;
    rotation: number;
    scale: number;
}

interface VictoryCelebrationProps {
    visible: boolean;
    coinsEarned: number;
}

export const VictoryCelebration: React.FC<VictoryCelebrationProps> = ({
    visible,
    coinsEarned
}) => {
    const [confetti, setConfetti] = useState<Confetto[]>([]);

    useEffect(() => {
        if (visible) {
            // Generate confetti pieces
            const newConfetti: Confetto[] = Array.from({ length: 50 }).map((_, i) => ({
                id: `confetto-${i}`,
                x: Math.random() * 100,
                delay: Math.random() * 0.5,
                duration: 2 + Math.random() * 1,
                rotation: Math.random() * 360,
                scale: 0.5 + Math.random() * 1
            }));
            setConfetti(newConfetti);

            // Play victory sound
            const victoryAudio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFIZivrJBkA2ACACAAAAAAAAAAAAAAAAAAAAAA');
            victoryAudio.volume = 0.3;
            victoryAudio.play().catch(() => {/* Audio blocked */});
        }
    }, [visible]);

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Confetti pieces */}
                    {confetti.map((c) => (
                        <motion.div
                            key={c.id}
                            initial={{ top: '-10px', left: `${c.x}%`, opacity: 1, scale: c.scale }}
                            animate={{ top: '100vh', opacity: 0 }}
                            transition={{
                                duration: c.duration,
                                delay: c.delay,
                                ease: 'easeIn'
                            }}
                            style={{
                                position: 'fixed',
                                zIndex: 99,
                                pointerEvents: 'none'
                            }}
                        >
                            <motion.div
                                animate={{ rotate: c.rotation + 360 }}
                                transition={{ duration: c.duration }}
                                className="text-2xl"
                            >
                                {['🎉', '⭐', '🏆', '💰', '✨', '🎊'].at(Math.floor(Math.random() * 6))}
                            </motion.div>
                        </motion.div>
                    ))}

                    {/* Floating coins animation */}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                            key={`coin-${i}`}
                            initial={{
                                x: window.innerWidth / 2,
                                y: window.innerHeight / 2,
                                opacity: 1,
                                scale: 1
                            }}
                            animate={{
                                x: window.innerWidth / 2 + (Math.random() - 0.5) * 400,
                                y: window.innerHeight / 2 - 200 + Math.random() * 100,
                                opacity: 0,
                                scale: 0
                            }}
                            transition={{
                                duration: 2,
                                ease: 'easeOut',
                                delay: i * 0.1
                            }}
                            style={{
                                position: 'fixed',
                                zIndex: 98,
                                pointerEvents: 'none'
                            }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.5, repeat: 4 }}
                                className="text-3xl"
                            >
                                💰
                            </motion.div>
                        </motion.div>
                    ))}

                    {/* Center explosion effect */}
                    <motion.div
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 3, opacity: 0 }}
                        transition={{ duration: 1 }}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            marginTop: '-50px',
                            marginLeft: '-50px',
                            width: '100px',
                            height: '100px',
                            zIndex: 95,
                            pointerEvents: 'none'
                        }}
                    >
                        <div className="w-full h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />
                    </motion.div>

                    {/* Coins earned text */}
                    <motion.div
                        initial={{ scale: 0, y: 100, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            marginTop: '-40px',
                            marginLeft: '-100px',
                            zIndex: 97,
                            pointerEvents: 'none'
                        }}
                    >
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 0.5, repeat: 3 }}
                            className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 text-center"
                        >
                            +{coinsEarned}
                        </motion.div>
                        <motion.div
                            className="text-2xl text-yellow-400 font-black text-center mt-2"
                        >
                            MONEDAS
                        </motion.div>
                    </motion.div>

                    {/* Flash effect */}
                    <motion.div
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: '#FCD34D',
                            zIndex: 94,
                            pointerEvents: 'none'
                        }}
                    />
                </>
            )}
        </AnimatePresence>
    );
};

export default VictoryCelebration;
