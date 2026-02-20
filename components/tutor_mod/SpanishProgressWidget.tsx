import { useState, useEffect } from 'react';
import { BarChart3, BookOpen, MessageCircle, Mic, PenTool, FileText, Languages, Sparkles } from 'lucide-react';
import { getSpanishSkillProgress, SpanishSkillProgress } from '../../services/learningProgress';
import { motion, AnimatePresence } from 'framer-motion';

const SKILL_ICONS: Record<string, React.ReactNode> = {
    lectura: <FileText className="w-4 h-4" />,
    escritura: <PenTool className="w-4 h-4" />,
    oralidad: <Mic className="w-4 h-4" />,
    vocabulario: <BookOpen className="w-4 h-4" />,
    gramatica: <PenTool className="w-4 h-4" />,
    ortografia: <Sparkles className="w-4 h-4" />,
    acentuacion: <Languages className="w-4 h-4" />,
};

const SKILL_LABELS_ES: Record<string, string> = {
    lectura: 'Lectura',
    escritura: 'Escritura',
    oralidad: 'Oralidad',
    vocabulario: 'Vocab',
    gramatica: 'Gramática',
    ortografia: 'Ortografía',
    acentuacion: 'Acentos',
};

const SKILL_LABELS_EN: Record<string, string> = {
    lectura: 'Reading',
    escritura: 'Writing',
    oralidad: 'Speaking',
    vocabulario: 'Vocab',
    gramatica: 'Grammar',
    ortografia: 'Spelling',
    acentuacion: 'Accents',
};

interface SpanishProgressWidgetProps {
    userId?: string;
    language: 'es' | 'en';
}

export function SpanishProgressWidget({ userId, language }: SpanishProgressWidgetProps) {
    const [progress, setProgress] = useState<SpanishSkillProgress | null>(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!userId) return;
        getSpanishSkillProgress(userId).then(setProgress);
    }, [userId]);

    if (!progress || Object.values(progress).every(p => p.count === 0)) {
        return null;
    }

    const labels = language === 'es' ? SKILL_LABELS_ES : SKILL_LABELS_EN;
    const total = Object.values(progress).reduce((s, p) => s + p.count, 0);
    if (total === 0) return null;

    return (
        <div className="rounded-xl bg-purple-900/80 border border-purple-700/50 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-purple-800/50 transition-colors"
            >
                <div className="flex items-center gap-2 text-purple-300">
                    <Languages className="w-5 h-5" />
                    <span className="font-bold text-sm">
                        {language === 'es' ? 'Mi progreso en Español' : 'My Spanish Progress'}
                    </span>
                </div>
                <span className="text-xs font-bold text-purple-400">
                    {total} {language === 'es' ? 'practicados' : 'practiced'}
                </span>
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-purple-700/50"
                    >
                        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(progress)
                                .filter(([, p]) => p.count > 0)
                                .map(([skill, p]) => (
                                    <div
                                        key={skill}
                                        className="flex items-center gap-2 bg-purple-950/60 rounded-lg px-2 py-2"
                                    >
                                        <span className="text-purple-300">
                                            {SKILL_ICONS[skill] || <BarChart3 className="w-4 h-4" />}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-purple-100 truncate">
                                                {labels[skill] || skill}
                                            </div>
                                            <div className="text-[10px] text-purple-400">
                                                {p.count} · {p.accuracy}%
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
