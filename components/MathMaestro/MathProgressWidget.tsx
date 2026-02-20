import { useState, useEffect } from 'react';
import { BarChart3, Plus, Minus, X, Divide, Percent, Shapes } from 'lucide-react';
import { getMathOperationProgress, MathOperationProgress } from '../../services/learningProgress';
import { motion, AnimatePresence } from 'framer-motion';

const OP_ICONS: Record<string, React.ReactNode> = {
    addition: <Plus className="w-4 h-4" />,
    subtraction: <Minus className="w-4 h-4" />,
    multiplication: <X className="w-4 h-4" />,
    division: <Divide className="w-4 h-4" />,
    fraction: <Percent className="w-4 h-4" />,
    geometry: <Shapes className="w-4 h-4" />,
};

const OP_LABELS_ES: Record<string, string> = {
    addition: 'Suma',
    subtraction: 'Resta',
    multiplication: 'Mult',
    division: 'Div',
    fraction: 'Fracc',
    geometry: 'Geom',
};

const OP_LABELS_EN: Record<string, string> = {
    addition: 'Add',
    subtraction: 'Sub',
    multiplication: 'Mult',
    division: 'Div',
    fraction: 'Frac',
    geometry: 'Geom',
};

interface MathProgressWidgetProps {
    userId?: string;
    language: 'es' | 'en';
}

export function MathProgressWidget({ userId, language }: MathProgressWidgetProps) {
    const [progress, setProgress] = useState<MathOperationProgress | null>(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!userId) return;
        getMathOperationProgress(userId).then(setProgress);
    }, [userId]);

    if (!progress || Object.values(progress).every(p => p.count === 0)) {
        return null;
    }

    const labels = language === 'es' ? OP_LABELS_ES : OP_LABELS_EN;
    const total = Object.values(progress).reduce((s, p) => s + p.count, 0);
    if (total === 0) return null;

    return (
        <div className="rounded-xl bg-slate-800/80 border border-slate-700/50 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-700/50 transition-colors"
            >
                <div className="flex items-center gap-2 text-cyan-400">
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-bold text-sm">
                        {language === 'es' ? 'Mi progreso' : 'My progress'}
                    </span>
                </div>
                <span className="text-xs font-bold text-slate-400">
                    {total} {language === 'es' ? 'resueltos' : 'solved'}
                </span>
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-700/50"
                    >
                        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(progress)
                                .filter(([, p]) => p.count > 0)
                                .map(([op, p]) => (
                                    <div
                                        key={op}
                                        className="flex items-center gap-2 bg-slate-900/60 rounded-lg px-2 py-2"
                                    >
                                        <span className="text-cyan-400">
                                            {OP_ICONS[op] || <BarChart3 className="w-4 h-4" />}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-slate-200 truncate">
                                                {labels[op] || op}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                {p.count} ✓ · {p.accuracy}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
