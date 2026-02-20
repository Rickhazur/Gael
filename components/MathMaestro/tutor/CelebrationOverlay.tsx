import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationOverlayProps {
    trigger: boolean;
    type: 'correct' | 'streak' | 'complete' | 'levelUp';
    message?: string;
    points?: number;
    onComplete?: () => void;
}

// Confetti particle component
const Confetti = ({ delay, color }: { delay: number; color: string }) => {
    const randomX = Math.random() * 100;
    const randomRotation = Math.random() * 360;

    return (
        <motion.div
            initial={{ y: -20, x: `${randomX}vw`, opacity: 1, rotate: 0 }}
            animate={{
                y: '100vh',
                rotate: randomRotation + 720,
                opacity: [1, 1, 0]
            }}
            transition={{
                duration: 2 + Math.random(),
                delay,
                ease: 'easeOut'
            }}
            className="absolute w-3 h-3 pointer-events-none"
            style={{
                backgroundColor: color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px'
            }}
        />
    );
};

// Star burst component
const StarBurst = ({ x, y }: { x: string; y: string }) => (
    <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180]
        }}
        transition={{ duration: 0.8 }}
        className="absolute text-4xl pointer-events-none"
        style={{ left: x, top: y }}
    >
        ⭐
    </motion.div>
);

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
    trigger,
    type,
    message,
    points,
    onComplete
}) => {
    const [showOverlay, setShowOverlay] = useState(false);
    const [confetti, setConfetti] = useState<{ id: number; color: string; delay: number }[]>([]);
    const [stars, setStars] = useState<{ id: number; x: string; y: string }[]>([]);

    const celebrationColors = [
        '#FFD700', // Gold
        '#FF6B6B', // Coral
        '#4ECDC4', // Teal
        '#A78BFA', // Purple
        '#F472B6', // Pink
        '#34D399', // Emerald
        '#60A5FA', // Blue
        '#FBBF24', // Amber
    ];

    useEffect(() => {
        if (trigger) {
            setShowOverlay(true);

            // Generate confetti
            if (type === 'complete' || type === 'levelUp' || type === 'streak') {
                const newConfetti = Array.from({ length: 50 }, (_, i) => ({
                    id: i,
                    color: celebrationColors[Math.floor(Math.random() * celebrationColors.length)],
                    delay: Math.random() * 0.5
                }));
                setConfetti(newConfetti);
            }

            // Generate star bursts
            if (type === 'correct' || type === 'streak') {
                const newStars = Array.from({ length: 5 }, (_, i) => ({
                    id: i,
                    x: `${20 + Math.random() * 60}%`,
                    y: `${20 + Math.random() * 60}%`
                }));
                setStars(newStars);
            }

            // Auto-hide after animation
            const timeout = setTimeout(() => {
                setShowOverlay(false);
                setConfetti([]);
                setStars([]);
                onComplete?.();
            }, type === 'correct' ? 1500 : 3000);

            return () => clearTimeout(timeout);
        }
    }, [trigger, type, onComplete]);

    const getEmoji = () => {
        switch (type) {
            case 'correct': return '✅';
            case 'streak': return '🔥';
            case 'complete': return '🏆';
            case 'levelUp': return '⬆️';
            default: return '🌟';
        }
    };

    const getDefaultMessage = () => {
        switch (type) {
            case 'correct': return '¡Correcto!';
            case 'streak': return '¡Racha increíble!';
            case 'complete': return '¡Ejercicio completado!';
            case 'levelUp': return '¡Subiste de nivel!';
            default: return '¡Excelente!';
        }
    };

    return (
        <AnimatePresence>
            {showOverlay && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
                >
                    {/* Confetti */}
                    {confetti.map(c => (
                        <Confetti key={c.id} delay={c.delay} color={c.color} />
                    ))}

                    {/* Star bursts */}
                    {stars.map(s => (
                        <StarBurst key={s.id} x={s.x} y={s.y} />
                    ))}

                    {/* Central celebration badge */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{
                            scale: [0, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 15
                        }}
                        className={`
                            relative flex flex-col items-center justify-center
                            px-8 py-6 rounded-3xl shadow-2xl
                            ${type === 'complete' ? 'bg-gradient-to-br from-amber-400 to-yellow-500' :
                                type === 'streak' ? 'bg-gradient-to-br from-orange-500 to-red-500' :
                                    type === 'levelUp' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
                                        'bg-gradient-to-br from-emerald-400 to-cyan-500'}
                        `}
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-3xl bg-white/20 blur-xl" />

                        {/* Emoji */}
                        <motion.span
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, 15, -15, 0]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.5
                            }}
                            className="text-6xl mb-2 drop-shadow-lg relative z-10"
                        >
                            {getEmoji()}
                        </motion.span>

                        {/* Message */}
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-white font-black text-2xl tracking-tight drop-shadow-md relative z-10"
                        >
                            {message || getDefaultMessage()}
                        </motion.p>

                        {/* Points badge */}
                        {points && points > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4, type: 'spring' }}
                                className="absolute -top-4 -right-4 bg-white rounded-full px-4 py-2 shadow-lg"
                            >
                                <span className="text-lg font-black text-amber-500">
                                    +{points} ⭐
                                </span>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Background flash */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.3, 0] }}
                        transition={{ duration: 0.5 }}
                        className={`
                            absolute inset-0
                            ${type === 'complete' ? 'bg-amber-400' :
                                type === 'streak' ? 'bg-orange-500' :
                                    type === 'levelUp' ? 'bg-purple-500' :
                                        'bg-emerald-400'}
                        `}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CelebrationOverlay;
