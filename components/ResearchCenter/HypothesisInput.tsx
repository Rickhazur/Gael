import React, { useState } from 'react';
import { Lightbulb, ArrowRight, BookOpen } from 'lucide-react';

interface HypothesisInputProps {
    value: string;
    onChange: (value: string) => void;
    onNext: () => void;
    language: 'es' | 'en';
    customTitle?: string;
    customDescription?: string;
}

export function HypothesisInput({ value, onChange, onNext, language, customTitle, customDescription }: HypothesisInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="bg-white rounded-[2rem] p-8 border-2 border-dashed border-yellow-300 shadow-comic-lg relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-50 rounded-bl-full -z-10" />

            <div className="flex gap-4 items-start mb-6">
                <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center border-2 border-yellow-200 shadow-sm shrink-0">
                    <Lightbulb className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                    <h2 className="font-fredoka text-2xl font-black text-slate-800">
                        {customTitle || (language === 'es' ? 'Paso 1: ¿Qué crees que pasará?' : 'Step 1: What do you think?')}
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">
                        {customDescription || (language === 'es'
                            ? 'Antes de investigar, escribe tu idea o hipótesis sobre el tema.'
                            : 'Before researching, write your idea or hypothesis about the topic.')}
                    </p>
                </div>
            </div>

            <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={language === 'es'
                        ? 'Yo creo que los dinosaurios se extinguieron porque...'
                        : 'I think dinosaurs went extinct because...'}
                    className="w-full h-40 p-6 rounded-2xl border-2 border-stone-200 resize-none font-handwriting text-xl leading-relaxed focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 focus:outline-none transition-all placeholder:text-stone-300 text-slate-700 bg-[#fffdf5]"
                />
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={onNext}
                    disabled={!value || value.length < 10}
                    className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-xl font-bold text-lg shadow-comic transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center gap-2"
                >
                    {language === 'es' ? 'Continuar' : 'Continue'}
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>

            {/* Tiny Tip */}
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-yellow-600/60 justify-center">
                <BookOpen className="w-3 h-3" />
                {language === 'es' ? 'Los grandes científicos siempre empiezan con una duda.' : 'Great scientists always start with a question.'}
            </div>
        </div>
    );
}
