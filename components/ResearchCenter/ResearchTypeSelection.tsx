import React from 'react';
import { Fish, Cloud, Sprout, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

/** Tres preguntas concretas de investigación (relevantes y claras). */
const RESEARCH_QUESTIONS = [
    {
        questionEs: '¿Cómo duermen los peces?',
        questionEn: 'How do fish sleep?',
        hintEs: 'Investigar sobre el descanso de los animales acuáticos.',
        hintEn: 'Research how aquatic animals rest.',
        type: 'scientific' as const,
        icon: Fish,
        color: 'cyan',
    },
    {
        questionEs: '¿Por qué el cielo es azul?',
        questionEn: 'Why is the sky blue?',
        hintEs: 'Investigar la luz, la atmósfera y los colores.',
        hintEn: 'Research light, the atmosphere and colours.',
        type: 'scientific' as const,
        icon: Cloud,
        color: 'sky',
    },
    {
        questionEs: '¿Cómo crecen las plantas?',
        questionEn: 'How do plants grow?',
        hintEs: 'Investigar semillas, raíces, luz y agua.',
        hintEn: 'Research seeds, roots, light and water.',
        type: 'scientific' as const,
        icon: Sprout,
        color: 'emerald',
    },
];

interface ResearchTypeSelectionProps {
    onSelect: (type: 'scientific' | 'informative', initialQuestion?: string) => void;
    language: 'es' | 'en';
}

const colorClasses: Record<string, string> = {
    cyan: 'border-cyan-400 shadow-[0_12px_0_0_#22d3ee] hover:shadow-[0_8px_0_0_#22d3ee] bg-cyan-50 group-hover:bg-cyan-100 text-cyan-600',
    sky: 'border-sky-400 shadow-[0_12px_0_0_#0ea5e9] hover:shadow-[0_8px_0_0_#0ea5e9] bg-sky-50 group-hover:bg-sky-100 text-sky-600',
    emerald: 'border-emerald-400 shadow-[0_12px_0_0_#34d399] hover:shadow-[0_8px_0_0_#34d399] bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600',
};

export function ResearchTypeSelection({ onSelect, language }: ResearchTypeSelectionProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
                <h2 className="font-fredoka text-4xl font-black text-white drop-shadow-lg">
                    {language === 'es' ? '🔬 Elige tu pregunta de investigación' : '🔬 Choose your research question'}
                </h2>
                <p className="text-xl font-medium text-white/80 max-w-2xl mx-auto">
                    {language === 'es'
                        ? 'Selecciona una pregunta concreta para investigar y redactar tu documento.'
                        : 'Pick one concrete question to research and write your document.'}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {RESEARCH_QUESTIONS.map((item, index) => {
                    const Icon = item.icon;
                    const question = language === 'es' ? item.questionEs : item.questionEn;
                    const hint = language === 'es' ? item.hintEs : item.hintEn;
                    const styles = colorClasses[item.color] || colorClasses.cyan;
                    return (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.03, translateY: -6 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(item.type, question)}
                            className={`group relative flex flex-col items-center text-center p-6 bg-white/95 backdrop-blur-sm rounded-[2rem] border-4 transition-all overflow-hidden ${styles}`}
                        >
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform group-hover:rotate-6 transition-transform bg-white/80">
                                <Icon className="w-8 h-8" />
                            </div>
                            <h3 className="font-fredoka text-xl font-black text-slate-800 mb-2 leading-tight">
                                {question}
                            </h3>
                            <p className="text-sm font-medium text-slate-600 mb-6 flex-1">
                                {hint}
                            </p>
                            <div className="flex items-center gap-2 font-black uppercase tracking-wider text-sm group-hover:translate-x-1 transition-transform">
                                {language === 'es' ? 'Investigar esta' : 'Research this'}
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/20 text-center">
                <p className="text-white/70 font-medium italic flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    {language === 'es'
                        ? 'Tu pregunta se usará como punto de partida. Luego buscarás información y redactarás con tus propias palabras.'
                        : 'Your question will be the starting point. Then you\'ll find information and write in your own words.'}
                </p>
            </div>
        </div>
    );
}
