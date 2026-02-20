import React from 'react';
import { motion } from 'framer-motion';

interface FractionStep {
    numerator: number;
    denominator: number;
    label?: string;
    color?: string;
}

interface FractionBarsProps {
    numerator: number;
    denominator: number;
    label?: string;
    language?: 'es' | 'en';
}

export const FractionBars: React.FC<FractionBarsProps> = ({
    numerator,
    denominator,
    label,
    language = 'es'
}) => {
    // Ensure denominator is at least 1 to avoid division by zero
    const safeDenominator = Math.max(1, denominator);
    const segments = Array.from({ length: safeDenominator }, (_, i) => i < numerator);

    return (
        <div className="bg-white/80 p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            {label && (
                <h5 className="text-sm font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                    <span className="text-indigo-500">📊</span> {label}
                </h5>
            )}

            <div className="relative pt-2">
                {/* Fraction representation */}
                <div className="flex flex-col items-center mb-6">
                    <span className="text-2xl font-fredoka font-bold text-indigo-600 border-b-2 border-indigo-600 px-2 leading-none">
                        {numerator}
                    </span>
                    <span className="text-2xl font-fredoka font-bold text-slate-700 leading-none mt-1">
                        {safeDenominator}
                    </span>
                </div>

                {/* The Bar */}
                <div className="h-16 w-full bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 flex">
                    {segments.map((isFilled, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{
                                opacity: 1,
                                scaleX: 1,
                                backgroundColor: isFilled ? '#6366f1' : '#f1f5f9'
                            }}
                            transition={{ delay: idx * 0.1, duration: 0.3 }}
                            className="flex-1 border-r border-slate-200 last:border-r-0 relative"
                        >
                            {isFilled && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-gradient-to-t from-indigo-600/20 to-transparent"
                                />
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Labels/Legend */}
                <div className="mt-4 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>0</span>
                    <span>1</span>
                </div>
            </div>

            <p className="text-xs text-slate-500 italic text-center">
                {language === 'es'
                    ? `Visualizando ${numerator} de ${safeDenominator} partes iguales.`
                    : `Visualizing ${numerator} out of ${safeDenominator} equal parts.`}
            </p>
        </div>
    );
};
