
import React from 'react';
import { motion } from 'framer-motion';
import { CuriosityOption } from '@/services/sparkService';
import { Zap, Search, Trophy, Rocket } from 'lucide-react';

interface CuriosityMenuProps {
    options: CuriosityOption[];
    onSelect: (question: string) => void;
    visible: boolean;
    darkMode?: boolean;
}

const categoryIcons = {
    mind_blowing: <Zap className="w-4 h-4" />,
    everyday_mystery: <Search className="w-4 h-4" />,
    challenge: <Trophy className="w-4 h-4" />,
    time_travel: <Rocket className="w-4 h-4" />,
};

const categoryColors = {
    mind_blowing: 'from-purple-400 to-indigo-600 shadow-indigo-500/20',
    everyday_mystery: 'from-cyan-400 to-blue-600 shadow-blue-500/20',
    challenge: 'from-yellow-400 to-orange-600 shadow-orange-500/20',
    time_travel: 'from-pink-500 to-purple-700 shadow-purple-500/30',
};

export const CuriosityMenu: React.FC<CuriosityMenuProps> = ({ options, onSelect, visible, darkMode = false }) => {
    if (!visible || options.length === 0) return null;

    return (
        <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                ¿Qué exploramos ahora? ✨
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {options.filter(o => o.label && o.question).map((option, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(option.question)}
                        className={`
              relative group flex items-start gap-4 p-4 rounded-2xl
              transition-all duration-300 text-left overflow-hidden
              ${darkMode
                                ? 'bg-white/5 border border-white/10 hover:border-white/30'
                                : 'bg-white border border-slate-200 hover:border-cyan-400 shadow-sm hover:shadow-cyan-100'}
            `}
                    >
                        {/* Hover Background Glow */}
                        <div className={`
              absolute inset-0 bg-gradient-to-br ${categoryColors[option.category]} 
              ${darkMode ? 'opacity-0 group-hover:opacity-10' : 'opacity-0 group-hover:opacity-5'} 
              transition-opacity duration-300
            `} />

                        {/* Icon */}
                        <div className={`
              mt-0.5 p-2.5 rounded-xl bg-gradient-to-br ${categoryColors[option.category]} 
              text-white shadow-lg group-hover:scale-110 transition-transform duration-300
            `}>
                            {categoryIcons[option.category]}
                        </div>

                        <div className="flex-1">
                            <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {option.label}
                            </span>
                            <p className={`text-sm font-bold leading-snug transition-colors ${darkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-700 group-hover:text-black'}`}>
                                {option.question}
                            </p>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
