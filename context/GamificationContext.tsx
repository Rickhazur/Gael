import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { supabase, getUserEconomy, getLearningProgress, adminAwardCoins, consignToBank, subscribeToEconomy, subscribeToLearning } from '@/services/supabase';

interface GamificationState {
    coins: number;
    points: number;
    savingsBalance: number;
    xp: number;
    level: number;
    streak: number;
    maxStreak: number;
    problemsCompleted: number;
    correctAnswers: number;
    totalAttempts: number;
    achievements: string[];
    dailyGoal: number;
    dailyProgress: number;
    creditDebt: number;
    creditLimit: number;
    inventory: string[];
    equippedItems: string[];
}

interface GamificationContextType extends GamificationState {
    novaCoins: number;
    addCoins: (amount: number, reason: string) => void;
    earnCoins: (amount: number, reason?: string) => void;
    spendCoins: (amount: number, item?: string, shouldSync?: boolean) => boolean;
    addXP: (amount: number) => void;
    addCoinsToBank: (amount: number) => Promise<boolean>;
    withdrawCoinsFromBank: (amount: number) => Promise<boolean>;
    useCredit: (amount: number) => boolean;
    repayDebt: (amount: number) => boolean;
    recordCorrectAnswer: () => void;
    recordIncorrectAnswer: () => void;
    recordProblemComplete: () => void;
    addAchievement: (id: string, name: string) => void;
    updateDailyGoal: (goal: number) => void;
    buyItem: (item: string, cost: number) => boolean;
    getLevelInfo: (language: string) => { level: string; icon: string };
    pendingCelebration: { points: number; message: string } | null;
    clearCelebration: () => void;
    toggleEquip: (item: string) => void;
}

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<GamificationState>(() => {
        const saved = localStorage.getItem('nova_gamification');
        const defaultState = {
            coins: 50,
            points: 0,
            savingsBalance: 0,
            xp: 0,
            level: 1,
            streak: 0,
            maxStreak: 0,
            problemsCompleted: 0,
            correctAnswers: 0,
            totalAttempts: 0,
            achievements: [],
            dailyGoal: 5,
            dailyProgress: 0,
            creditDebt: 0,
            creditLimit: 500,
            inventory: [],
            equippedItems: []
        };
        if (saved) {
            try {
                return { ...defaultState, ...JSON.parse(saved) };
            } catch (e) {
                return defaultState;
            }
        }
        return defaultState;
    });


    // Load from Supabase first when logged in (source of truth), then localStorage only for pilot/offline
    useEffect(() => {
        let unsubscribeEconomy: (() => void) | undefined;
        let unsubscribeLearning: (() => void) | undefined;

        const syncWithSupabase = async () => {
            if (!supabase) {
                const saved = localStorage.getItem('nova_gamification');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        setState(prev => ({ ...prev, ...parsed }));
                    } catch (e) {
                        console.error("Failed to load gamification state", e);
                    }
                }
                return;
            }
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const userId = session.user.id;
                // Source of truth: load coins and XP from Supabase so parent rewards persist after logout
                const [economy, progress] = await Promise.all([
                    getUserEconomy(userId),
                    getLearningProgress(userId)
                ]);
                const coins = economy?.coins ?? 0;
                const savingsBalance = economy?.savings_balance ?? 0;
                const totalXp = progress?.total_xp ?? 0;
                const level = totalXp < 100 ? 1 : Math.min(11, Math.floor(totalXp / 1000) + 1);

                setState(prev => ({
                    ...prev,
                    coins,
                    savingsBalance,
                    xp: totalXp,
                    level
                }));
                // Persist to localStorage so pilot/offline fallback stays in sync
                localStorage.setItem('nova_gamification', JSON.stringify({
                    coins,
                    savingsBalance,
                    xp: totalXp,
                    level,
                    creditDebt: state.creditDebt,
                    creditLimit: state.creditLimit
                }));

                // Subscribe to Economy Changes (Real-time from Parent updates)
                unsubscribeEconomy = subscribeToEconomy(userId, (newEconomy) => {
                    console.log("Realtime Economy Update:", newEconomy);
                    const newCoins = newEconomy.coins;
                    const newSavings = newEconomy.savings_balance;

                    setState(prev => ({
                        ...prev,
                        coins: newCoins,
                        savingsBalance: newSavings
                    }));

                    // Show toast if coins OR savings increased
                    if (newCoins > state.coins || newSavings > state.savingsBalance) {
                        // Since fetch isn't atomic with state, we trust the realtime paylod
                        toast({
                            title: "¡Recibiste Monedas! 🪙",
                            description: "¡Has ganado una recompensa!",
                            className: "bg-emerald-100 border-2 border-emerald-500 text-emerald-900"
                        });
                        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
                    }
                });

                // Subscribe to Learning (XP) Changes
                unsubscribeLearning = subscribeToLearning(userId, (newProgress) => {
                    if (newProgress && typeof newProgress.total_xp === 'number') {
                        setState(prev => {
                            const oldXP = prev.xp;
                            const newXP = newProgress.total_xp;

                            // Calculate level from XP (simple / 1000 + 1 logic or threshold check)
                            // Re-using local XP logic for consistency if complex, or just storing XP
                            // For display, we just update XP. Level logic is usually derived or stored.
                            // Assuming simple derived level here for display sync:
                            const newLevel = Math.floor(newXP / 1000) + 1;

                            if (newXP > oldXP) {
                                toast({
                                    title: "¡Ganaste Experiencia! ⚡",
                                    description: `+${newXP - oldXP} XP`,
                                    className: "bg-blue-100 border-2 border-blue-500 text-blue-900"
                                });
                            }

                            return { ...prev, xp: newXP, level: newLevel };
                        });
                    }
                });
            } else {
                // No session (pilot or offline): use localStorage so premios/state persist
                const saved = localStorage.getItem('nova_gamification');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        setState(prev => ({ ...prev, ...parsed }));
                    } catch (e) {
                        console.error("Failed to load gamification from localStorage", e);
                    }
                }
            }
        };

        if (supabase) syncWithSupabase();

        return () => {
            if (unsubscribeEconomy) unsubscribeEconomy();
            if (unsubscribeLearning) unsubscribeLearning();
        };
    }, []); // Run once on mount

    // When pilot logs in, App sets nova_gamification and dispatches this event so we sync without refresh
    useEffect(() => {
        const onUpdated = () => {
            const saved = localStorage.getItem('nova_gamification');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setState(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error("Failed to sync gamification from localStorage", e);
                }
            }
        };
        window.addEventListener('nova_gamification_updated', onUpdated);
        return () => window.removeEventListener('nova_gamification_updated', onUpdated);
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('nova_gamification', JSON.stringify(state));
    }, [state]);

    const [pendingCelebration, setPendingCelebration] = useState<{ points: number; message: string } | null>(null);

    const clearCelebration = () => setPendingCelebration(null);

    const toggleEquip = (item: string) => {
        setState(prev => {
            const isEquipped = prev.equippedItems.includes(item);
            const newEquipped = isEquipped
                ? prev.equippedItems.filter(i => i !== item)
                : [...prev.equippedItems, item];
            return { ...prev, equippedItems: newEquipped };
        });
    };

    const addCoins = async (amount: number, reason: string) => {
        // Optimistic UI Update
        setState(prev => ({ ...prev, coins: prev.coins + amount }));

        toast({
            title: `+${amount} Monedas! 🪙`,
            description: reason,
            className: "bg-kid-yellow border-2 border-black font-fredoka shadow-comic text-black"
        });

        if (amount >= 20) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FFFFFF']
            });
        }

        // Sync to DB
        if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await adminAwardCoins(session.user.id, amount);
            }
        }
    };

    const spendCoins = (amount: number, item: string = "compra", shouldSync: boolean = true): boolean => {
        if (state.coins < amount) {
            toast({
                title: "¡No tienes suficientes monedas! 😢",
                description: `Necesitas ${amount} monedas para ${item}`,
                variant: "destructive"
            });
            return false;
        }

        // Optimistic Update
        setState(prev => ({ ...prev, coins: prev.coins - amount }));

        // Sync to DB
        if (supabase && shouldSync) {
            (async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    // We reuse award with negative amount or implement a spend function
                    await adminAwardCoins(session.user.id, -amount);
                }
            })();
        }

        return true;
    };

    const addXP = (amount: number) => {
        setState(prev => {
            const newXP = prev.xp + amount;
            let newLevel = prev.level;
            const nextThreshold = LEVEL_THRESHOLDS[prev.level] || Infinity;

            if (newXP >= nextThreshold) {
                newLevel += 1;
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#FF69B4', '#00BFFF', '#7FFF00']
                });
                toast({
                    title: "¡SUBISTE DE NIVEL! 🌟",
                    description: `¡Ahora eres Nivel ${newLevel}!`,
                    className: "bg-kid-purple border-2 border-black font-fredoka shadow-comic text-white"
                });
            }
            return { ...prev, xp: newXP, level: newLevel };
        });
    };

    const addCoinsToBank = async (amount: number) => {
        if (state.coins < amount) return false;

        // Optimistic
        setState(prev => ({
            ...prev,
            coins: prev.coins - amount,
            savingsBalance: prev.savingsBalance + amount
        }));

        if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Call both (ideally this should be an RPC transaction, but for now individual calls)
                await Promise.all([
                    adminAwardCoins(session.user.id, -amount),
                    consignToBank(session.user.id, amount)
                ]);
            }
        }
        return true;
    };

    const withdrawCoinsFromBank = async (amount: number) => {
        if (state.savingsBalance < amount) return false;

        // Optimistic
        setState(prev => ({
            ...prev,
            coins: prev.coins + amount,
            savingsBalance: prev.savingsBalance - amount
        }));

        if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await Promise.all([
                    adminAwardCoins(session.user.id, amount),
                    consignToBank(session.user.id, -amount)
                ]);
            }
        }
        return true;
    };

    const useCredit = (amount: number) => {
        if (state.creditDebt + amount <= state.creditLimit) {
            setState(prev => ({ ...prev, creditDebt: prev.creditDebt + amount }));
            return true;
        }
        return false;
    };

    const repayDebt = (amount: number) => {
        if (state.coins >= amount && state.creditDebt > 0) {
            const actualRepayment = Math.min(amount, state.creditDebt);
            setState(prev => ({
                ...prev,
                coins: prev.coins - actualRepayment,
                creditDebt: prev.creditDebt - actualRepayment
            }));

            // Sync coin reduction to DB
            if (supabase) {
                (async () => {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await adminAwardCoins(session.user.id, -actualRepayment);
                    }
                })();
            }
            return true;
        }
        return false;
    };

    const recordCorrectAnswer = () => {
        setState(prev => {
            const newCorrect = prev.correctAnswers + 1;
            const newTotal = prev.totalAttempts + 1;
            const newDaily = prev.dailyProgress + 1;

            // Check for daily goal completion
            if (newDaily === prev.dailyGoal) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#FFA500', '#FF4500']
                });
                toast({
                    title: "¡Meta diaria cumplida! 🏆",
                    description: "Has completado tu objetivo de hoy. ¡Sigue así!",
                });
            }

            return {
                ...prev,
                correctAnswers: newCorrect,
                totalAttempts: newTotal,
                dailyProgress: newDaily,
                streak: prev.streak + 1,
                maxStreak: Math.max(prev.maxStreak, prev.streak + 1),
                points: prev.points + 10,
                xp: prev.xp + 15
            };
        });
    };

    const recordIncorrectAnswer = () => {
        setState(prev => ({
            ...prev,
            totalAttempts: prev.totalAttempts + 1,
            streak: 0
        }));
    };

    const recordProblemComplete = () => {
        setState(prev => ({
            ...prev,
            problemsCompleted: prev.problemsCompleted + 1,
            xp: prev.xp + 50,
            points: prev.points + 30
        }));
    };

    const addAchievement = (id: string, name: string) => {
        if (!state.achievements.includes(id)) {
            setState(prev => ({
                ...prev,
                achievements: [...prev.achievements, id]
            }));
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.5 }
            });
            toast({
                title: "¡Logro Desbloqueado! 🌟",
                description: `Has ganado el trofeo: ${name}`,
            });
        }
    };

    const updateDailyGoal = (goal: number) => {
        setState(prev => ({ ...prev, dailyGoal: goal, dailyProgress: 0 }));
    };

    const buyItem = (item: string, cost: number) => {
        if (state.coins >= cost) {
            setState(prev => ({
                ...prev,
                coins: prev.coins - cost,
                inventory: [...prev.inventory, item]
            }));
            return true;
        }
        return false;
    };

    const getLevelInfo = (language: string) => {
        const ranges = [
            { level: 1, nameEn: "Novice", nameEs: "Novato", icon: "🌱" },
            { level: 2, nameEn: "Apprentice", nameEs: "Aprendiz", icon: "⭐" },
            { level: 3, nameEn: "Explorer", nameEs: "Explorador", icon: "🧭" },
            { level: 4, nameEn: "Pro", nameEs: "Pro", icon: "🏆" },
            { level: 5, nameEn: "Master", nameEs: "Maestro", icon: "👑" },
            { level: 6, nameEn: "Legend", nameEs: "Leyenda", icon: "🐉" },
            { level: 7, nameEn: "Mythic", nameEs: "Mítico", icon: "✨" },
            { level: 8, nameEn: "Divine", nameEs: "Divino", icon: "⚡" },
            { level: 9, nameEn: "Cosmic", nameEs: "Cósmico", icon: "🌌" },
            { level: 10, nameEn: "Infinite", nameEs: "Infinito", icon: "♾️" }
        ];
        const current = ranges.find(r => r.level === state.level) || ranges[ranges.length - 1];
        return {
            level: language === 'es' ? current.nameEs : current.nameEn,
            icon: current.icon
        };
    };

    return (
        <GamificationContext.Provider value={{
            ...state,
            novaCoins: state.coins,
            addCoins,
            earnCoins: (amt: number, reason: string = "Recompensa") => addCoins(amt, reason),
            spendCoins,
            addXP,
            addCoinsToBank,
            withdrawCoinsFromBank,
            useCredit,
            repayDebt,
            recordCorrectAnswer,
            recordIncorrectAnswer,
            recordProblemComplete,
            addAchievement,
            updateDailyGoal,
            buyItem,
            getLevelInfo,
            pendingCelebration,
            clearCelebration,
            toggleEquip
        }}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};
