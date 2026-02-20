import { useState, useEffect } from 'react';
import { BarChart3, BookOpen, MessageCircle, Mic, PenTool, FileText, Languages } from 'lucide-react';
import { getEnglishSkillProgress, EnglishSkillProgress } from '../../services/learningProgress';
import { motion, AnimatePresence } from 'framer-motion';

const SKILL_ICONS: Record<string, React.ReactNode> = {
    vocabulary: <BookOpen className="w-4 h-4" />,
    grammar: <PenTool className="w-4 h-4" />,
    reading: <FileText className="w-4 h-4" />,
    pronunciation: <Mic className="w-4 h-4" />,
    writing: <PenTool className="w-4 h-4" />,
    conversation: <MessageCircle className="w-4 h-4" />,
};

const SKILL_LABELS_ES: Record<string, string> = {
    vocabulary: 'Vocab',
    grammar: 'Gram',
    reading: 'Lectura',
    pronunciation: 'Pronun',
    writing: 'Escrit',
    conversation: 'Conv',
};

const SKILL_LABELS_EN: Record<string, string> = {
    vocabulary: 'Vocab',
    grammar: 'Gram',
    reading: 'Read',
    pronunciation: 'Speak',
    writing: 'Write',
    conversation: 'Talk',
};

interface EnglishProgressWidgetProps {
    userId?: string;
    language: 'es' | 'en';
}

export function EnglishProgressWidget({ userId, language }: EnglishProgressWidgetProps) {
    const [progress, setProgress] = useState<EnglishSkillProgress | null>(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!userId) return;
        getEnglishSkillProgress(userId).then(setProgress);
    }, [userId]);

    if (!progress || Object.values(progress).every(p => p.count === 0)) {
        return null;
    }

    const labels = language === 'es' ? SKILL_LABELS_ES : SKILL_LABELS_EN;
    const total = Object.values(progress).reduce((s, p) => s + p.count, 0);
    if (total === 0) return null;

    return (
        <div className="rounded-xl bg-indigo-900/80 border border-indigo-700/50 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-indigo-800/50 transition-colors"
            >
                <div className="flex items-center gap-2 text-indigo-300">
                    <Languages className="w-5 h-5" />
                    <span className="font-bold text-sm">
                        {language === 'es' ? 'Mi progreso' : 'My progress'}
                    </span>
                </div>
                <span className="text-xs font-bold text-indigo-400">
                    {total} {language === 'es' ? 'practicados' : 'practiced'}
                </span>
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-indigo-700/50"
                    >
                        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(progress)
                                .filter(([, p]) => p.count > 0)
                                .map(([skill, p]) => (
                                    <div
                                        key={skill}
                                        className="flex items-center gap-2 bg-indigo-950/60 rounded-lg px-2 py-2"
                                    >
                                        <span className="text-indigo-300">
                                            {SKILL_ICONS[skill] || <BarChart3 className="w-4 h-4" />}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-indigo-100 truncate">
                                                {labels[skill] || skill}
                                            </div>
                                            <div className="text-[10px] text-indigo-400">
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
