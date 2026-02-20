/**
 * Achievement Badge System - Tracks and displays student achievements
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Trophy, Zap, Brain, Star } from 'lucide-react';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    unlockedAt?: Date;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}

export interface AchievementContextType {
    achievements: Achievement[];
    unlockedAchievements: string[];
    unlockAchievement: (id: string) => void;
    checkAndUnlockAchievements: (stats: {
        questionsAsked: number;
        conversationsCompleted: number;
        totalCoinsEarned: number;
        characterCount: number;
    }) => Promise<void>;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

// Predefined achievements
const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-question',
        title: 'Primera Palabra Profunda',
        description: 'Tuviste tu primera práctica de Speaking con Rachelle',
        icon: '🎯',
        rarity: 'common'
    },
    {
        id: 'three-questions',
        title: 'Conversación Socrática',
        description: 'Completaste una conversación con 3+ preguntas profundas',
        icon: '🏅',
        rarity: 'uncommon'
    },
    {
        id: 'five-conversations',
        title: 'Explorador de Historias',
        description: 'Completaste conversaciones con 5 personajes diferentes',
        icon: '🌟',
        rarity: 'uncommon'
    },
    {
        id: 'socratic-master',
        title: 'Maestro Socrático',
        description: 'Completaste 5 conversaciones con 3+ preguntas cada una',
        icon: '🧠',
        rarity: 'rare'
    },
    {
        id: 'coin-collector',
        title: 'Coleccionista de Monedas',
        description: 'Acumulaste 500+ monedas practicando inglés',
        icon: '💰',
        rarity: 'common'
    },
    {
        id: 'marathon-talker',
        title: 'Conversador Incansable',
        description: 'Completaste una conversación de 10+ minutos',
        icon: '⏱️',
        rarity: 'rare'
    },
    {
        id: 'dialogue-legend',
        title: 'Leyenda del Diálogo',
        description: 'Desbloquea todo lo anterior - eres un verdadero educador socrático',
        icon: '👑',
        rarity: 'epic'
    }
];

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

    const unlockAchievement = useCallback((id: string) => {
        setUnlockedAchievements(prev => {
            if (!prev.includes(id)) {
                return [...prev, id];
            }
            return prev;
        });
    }, []);

    const checkAndUnlockAchievements = useCallback(async (stats: {
        questionsAsked: number;
        conversationsCompleted: number;
        totalCoinsEarned: number;
        characterCount: number;
    }) => {
        // First question
        if (stats.questionsAsked >= 1 && !unlockedAchievements.includes('first-question')) {
            unlockAchievement('first-question');
        }

        // 3+ questions conversation
        if (stats.questionsAsked >= 3 && !unlockedAchievements.includes('three-questions')) {
            unlockAchievement('three-questions');
        }

        // 5 conversations
        if (stats.conversationsCompleted >= 5 && !unlockedAchievements.includes('five-conversations')) {
            unlockAchievement('five-conversations');
        }

        // Socratic master (5 conversations with 3+ questions avg)
        if (
            stats.conversationsCompleted >= 5 &&
            stats.questionsAsked / stats.conversationsCompleted >= 3 &&
            !unlockedAchievements.includes('socratic-master')
        ) {
            unlockAchievement('socratic-master');
        }

        // Coin collector
        if (stats.totalCoinsEarned >= 500 && !unlockedAchievements.includes('coin-collector')) {
            unlockAchievement('coin-collector');
        }

        // Marathon talker - tracked separately in SparkChat
        // This will be unlocked when callDuration >= 10 minutes

        // Dialogue legend (all others)
        const otherAchievements = unlockedAchievements.filter(a => !['dialogue-legend'].includes(a));
        if (otherAchievements.length >= 6 && !unlockedAchievements.includes('dialogue-legend')) {
            unlockAchievement('dialogue-legend');
        }
    }, [unlockedAchievements, unlockAchievement]);

    return (
        <AchievementContext.Provider
            value={{
                achievements: ACHIEVEMENTS,
                unlockedAchievements,
                unlockAchievement,
                checkAndUnlockAchievements
            }}
        >
            {children}
        </AchievementContext.Provider>
    );
};

export const useAchievements = () => {
    const context = useContext(AchievementContext);
    if (!context) {
        throw new Error('useAchievements must be used within AchievementProvider');
    }
    return context;
};

// Achievement Toast Component
export interface AchievementPopupProps {
    achievement: Achievement | null;
    visible: boolean;
    onDismiss?: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({
    achievement,
    visible,
    onDismiss
}) => {
    React.useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onDismiss?.();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [visible, onDismiss]);

    const rarityColors = {
        common: 'from-green-600 to-green-500',
        uncommon: 'from-blue-600 to-blue-500',
        rare: 'from-purple-600 to-purple-500',
        epic: 'from-red-600 via-yellow-500 to-red-500'
    };

    return (
        <AnimatePresence>
            {visible && achievement && (
                <motion.div
                    initial={{ scale: 0, opacity: 0, y: -50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: -50 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="fixed top-8 left-1/2 -translate-x-1/2 z-[100]"
                >
                    <div className={`bg-gradient-to-r ${rarityColors[achievement.rarity]} rounded-2xl shadow-2xl border-2 border-white/30 overflow-hidden backdrop-blur`}>
                        <div className="relative p-6 space-y-3 text-white">
                            {/* Animated background */}
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_25%,rgba(255,255,255,.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,.1)_75%,rgba(255,255,255,.1))] bg-[length:40px_40px] animate-[slide_3s_linear_infinite]" />

                            <div className="relative">
                                {/* Icon */}
                                <motion.div
                                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: 1 }}
                                    className="text-6xl mb-3 text-center"
                                >
                                    {achievement.icon}
                                </motion.div>

                                {/* Content */}
                                <div className="text-center space-y-1">
                                    <p className="text-xs font-bold text-white/80 uppercase tracking-widest">
                                        ¡LOGRO DESBLOQUEADO!
                                    </p>
                                    <h3 className="text-2xl font-black">{achievement.title}</h3>
                                    <p className="text-sm text-white/90">{achievement.description}</p>
                                    <div className="flex items-center justify-center gap-1 pt-2">
                                        {Array.from({ length: achievement.rarity === 'epic' ? 5 : achievement.rarity === 'rare' ? 4 : achievement.rarity === 'uncommon' ? 3 : 2 }).map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
