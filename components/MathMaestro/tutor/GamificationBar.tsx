import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Trophy, Target, Zap, Coins, ShoppingCart } from 'lucide-react';

interface ProgressBarProps {
    points: number;
    streak: number;
    level: number;
    levelName: string;
    levelIcon: string;
    xpProgress: number; // 0-100
    problemsCompleted: number;
    dailyGoal: number;
    dailyProgress: number;
    novaCoins: number;
    onOpenShop?: () => void;
    language?: 'es' | 'en';
}

export const GamificationBar: React.FC<ProgressBarProps> = ({
    points,
    streak,
    level,
    levelName,
    levelIcon,
    xpProgress,
    problemsCompleted,
    dailyGoal,
    dailyProgress,
    novaCoins,
    onOpenShop,
    language = 'es'
}) => {
    const dailyGoalComplete = dailyProgress >= dailyGoal;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-md border-b border-white/10 px-4 py-3"
        >
            <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">

                {/* Level Badge */}
                <motion.div
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl px-3 py-1.5 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                >
                    <span className="text-xl">{levelIcon}</span>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
                            {language === 'es' ? 'Nivel' : 'Level'} {level}
                        </span>
                        <span className="text-xs font-black text-white -mt-0.5">{levelName}</span>
                    </div>
                </motion.div>

                {/* XP Progress Bar */}
                <div className="flex-1 max-w-[200px] hidden sm:block">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(xpProgress, 100)}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center mt-0.5">
                        {Math.round(xpProgress)}% {language === 'es' ? 'al siguiente nivel' : 'to next level'}
                    </p>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-3">

                    {/* Nova Coins & Shop Button */}
                    <motion.div
                        className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-lg pl-2.5 pr-1 py-1"
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="flex items-center gap-1.5">
                            <Coins className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-black text-amber-300">{novaCoins.toLocaleString()}</span>
                        </div>
                        <button
                            onClick={onOpenShop}
                            className="ml-2 p-1.5 bg-amber-500/20 hover:bg-amber-500/40 rounded-md transition-colors"
                        >
                            <ShoppingCart className="w-4 h-4 text-amber-400" />
                        </button>
                    </motion.div>

                    {/* Streak */}
                    <motion.div
                        className={`
                            flex items-center gap-1.5 rounded-lg px-2.5 py-1.5
                            ${streak >= 3
                                ? 'bg-orange-500/20 border border-orange-500/30'
                                : 'bg-slate-700/50 border border-slate-600/30'}
                        `}
                        animate={streak >= 3 ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <Flame className={`w-4 h-4 ${streak >= 3 ? 'text-orange-400' : 'text-slate-500'}`} />
                        <span className={`text-sm font-black ${streak >= 3 ? 'text-orange-300' : 'text-slate-400'}`}>
                            {streak}
                        </span>
                    </motion.div>

                    {/* Problems Completed */}
                    <motion.div
                        className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 hidden md:flex"
                        whileHover={{ scale: 1.05 }}
                    >
                        <Trophy className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-black text-emerald-300">{problemsCompleted}</span>
                    </motion.div>

                    {/* Daily Goal */}
                    <motion.div
                        className={`
                            flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hidden lg:flex
                            ${dailyGoalComplete
                                ? 'bg-green-500/20 border border-green-500/30'
                                : 'bg-cyan-500/20 border border-cyan-500/30'}
                        `}
                        animate={dailyGoalComplete ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ repeat: dailyGoalComplete ? 2 : 0, duration: 0.5 }}
                    >
                        <Target className={`w-4 h-4 ${dailyGoalComplete ? 'text-green-400' : 'text-cyan-400'}`} />
                        <span className={`text-sm font-black ${dailyGoalComplete ? 'text-green-300' : 'text-cyan-300'}`}>
                            {dailyProgress}/{dailyGoal}
                        </span>
                        {dailyGoalComplete && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-sm"
                            >
                                ✅
                            </motion.span>
                        )}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

// Mini version for compact spaces
export const GamificationMini: React.FC<{
    points: number;
    novaCoins: number;
    streak: number;
    level: string | number;
    levelIcon: string;
    onOpenShop?: () => void;
}> = ({ points, novaCoins, streak, level, levelIcon, onOpenShop }) => {
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 bg-indigo-600/80 rounded-full px-2 py-0.5">
                {levelIcon} <span className="font-bold text-white uppercase">{level}</span>
            </span>
            <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" /> {points}
            </span>
            {streak >= 2 && (
                <motion.span
                    className="flex items-center gap-1 text-orange-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                >
                    <Flame className="w-3 h-3" /> {streak}
                </motion.span>
            )}

            <motion.button
                onClick={onOpenShop}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 rounded-full px-2 py-0.5 ml-1"
            >
                <Coins className="w-3 h-3 text-amber-400" />
                <span className="font-black text-amber-300">{novaCoins}</span>
            </motion.button>
        </div>
    );
};

export default GamificationBar;
