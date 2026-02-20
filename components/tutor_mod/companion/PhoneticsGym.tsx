import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Play, MousePointer2, Sparkles, Star, Mic, ChevronRight, ChevronLeft, Info, Trophy } from 'lucide-react';
import { generateSpeech } from '@/services/edgeTTS';
import { Button } from '@/components/ui/button';

interface PhoneticPhrase {
    id: string;
    category: 'school' | 'social' | 'common';
    english: string;
    spanish: string;
    phoneticChunks: { text: string; soundsLike: string; highlight?: boolean; tip?: string }[];
    tipBody?: string;
}

const PHONETIC_DATA: PhoneticPhrase[] = [
    {
        id: 'p1',
        category: 'school',
        english: "Can I go to the bathroom, please?",
        spanish: "¿Puedo ir al baño, por favor?",
        phoneticChunks: [
            { text: "Can ai", soundsLike: "Kän ai", tip: "Di 'Kän' como una campana" },
            { text: "gou tu de", soundsLike: "góu tu dda", tip: "Muerde suavemente tu lengua en 'dda'" },
            { text: "bá-drum", soundsLike: "bá-drum", tip: "No digas 'room', di 'drum'" },
            { text: "plís?", soundsLike: "plíis", tip: "Sonríe mientras dices la 'i'" }
        ],
        tipBody: "En inglés, la 'th' de 'the' suena como si pusieras la punta de la lengua entre los dientes y soplaras un poquito."
    },
    {
        id: 'p2',
        category: 'social',
        english: "Nice to meet you!",
        spanish: "¡Gusto en conocerte!",
        phoneticChunks: [
            { text: "Nais tu", soundsLike: "Náis tu" },
            { text: "mit yu!", soundsLike: "míit yiú", tip: "La 'ee' suena como una 'i' larga española" }
        ]
    },
    {
        id: 'p3',
        category: 'school',
        english: "How do you say ruler?",
        spanish: "¿Cómo se dice regla?",
        phoneticChunks: [
            { text: "Jau du yu", soundsLike: "Jáu du iú", tip: "La 'H' suena como una exhalación suave de aire" },
            { text: "sei rú-ler?", soundsLike: "séi rú-lar", tip: "La 'R' no vibra como en español, levanta la lengua sin tocar el paladar" }
        ]
    },
    {
        id: 'p4',
        category: 'common',
        english: "I am ten years old",
        spanish: "Tengo diez años",
        phoneticChunks: [
            { text: "Ai am ten", soundsLike: "Ai am ten" },
            { text: "yers óuld", soundsLike: "íiars óuld", tip: "Pronuncia la 'd' final clarita" }
        ]
    },
    {
        id: 'p5',
        category: 'school',
        english: "I have a question",
        spanish: "Tengo una pregunta",
        phoneticChunks: [
            { text: "Ai jav", soundsLike: "Ai jáv", tip: "La 'V' suena vibrando tus dientes superiores con el labio de abajo" },
            { text: "a cués-shon", soundsLike: "a cués-shon", tip: "La 'sh' suena como cuando mandas a alguien a callar: ¡Shhh!" }
        ]
    }
];

export function PhoneticsGym({ onClose }: { onClose?: () => void }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [activeChunk, setActiveChunk] = useState<number | null>(null);
    const [showTip, setShowTip] = useState(false);
    const [speed, setSpeed] = useState<'normal' | 'slow'>('normal');

    const phrase = PHONETIC_DATA[currentIndex];

    const handlePlayAll = async () => {
        if (isSpeaking) return;
        setIsSpeaking(true);
        setActiveChunk(null);

        try {
            // Emulamos el resaltado de bloques mientras suena
            let currentOffset = 0;
            const chunkDuration = speed === 'slow' ? 1200 : 800;

            phrase.phoneticChunks.forEach((_, i) => {
                setTimeout(() => setActiveChunk(i), currentOffset);
                currentOffset += chunkDuration;
            });

            setTimeout(() => setActiveChunk(null), currentOffset);

            await generateSpeech(phrase.english, 'rachelle', { rate: speed === 'slow' ? -40 : 0 });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSpeaking(false);
        }
    };

    const handlePlayChunk = async (index: number) => {
        if (isSpeaking) return;
        setIsSpeaking(true);
        setActiveChunk(index);
        try {
            await generateSpeech(phrase.phoneticChunks[index].text, 'rachelle', { rate: -20 });
        } finally {
            setIsSpeaking(false);
            setActiveChunk(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 overflow-hidden font-fredoka border-x-4 border-indigo-500/20">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 flex items-center justify-between border-b-2 border-indigo-500/30">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                        <Star className="text-white w-7 h-7 fill-white" />
                    </div>
                    <div>
                        <h2 className="text-white text-xl font-black tracking-tight">GIMNASIO FÓNICO</h2>
                        <span className="text-indigo-300 text-[10px] uppercase font-bold tracking-widest bg-indigo-500/20 px-2 py-0.5 rounded-full">Profe Rachelle</span>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <span className="text-2xl font-black">✕</span>
                    </button>
                )}
            </div>

            {/* Main Trainer Area */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
                {/* Background Sparkles */}
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    <Sparkles className="w-full h-full text-indigo-400" />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={phrase.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-lg"
                    >
                        {/* The English Phrase */}
                        <div className="text-center mb-10">
                            <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest block mb-2">Frase en Inglés:</span>
                            <h3 className="text-4xl font-black text-white leading-tight">
                                {phrase.english}
                            </h3>
                            <p className="text-slate-400 mt-2 text-lg italic font-medium">"{phrase.spanish}"</p>
                        </div>

                        {/* Phonetic Mirroring (Chunking) */}
                        <div className="bg-slate-800/50 p-6 rounded-[2rem] border-2 border-indigo-500/20 shadow-2xl relative">
                            <span className="absolute -top-3 left-6 bg-indigo-600 px-3 py-1 rounded-full text-[10px] text-white font-black uppercase tracking-wider shadow-md">
                                ¿Cómo se lee? (Fonética Mágica)
                            </span>

                            <div className="flex flex-wrap gap-3 justify-center mt-2">
                                {phrase.phoneticChunks.map((chunk, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handlePlayChunk(i)}
                                        className={`
                                            px-4 py-3 rounded-2xl border-2 transition-all relative group
                                            ${activeChunk === i
                                                ? 'bg-yellow-400 border-yellow-200 text-black shadow-[0_0_20px_rgba(250,204,21,0.4)]'
                                                : 'bg-white/5 border-white/10 text-indigo-200 hover:border-indigo-500/50'}
                                        `}
                                    >
                                        <span className="text-2xl font-black block leading-none">
                                            {chunk.soundsLike}
                                        </span>
                                        <span className="text-[10px] opacity-40 block mt-1 uppercase font-bold tracking-tighter">
                                            {chunk.text}
                                        </span>

                                        {chunk.tip && (
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 bg-slate-900 border border-indigo-400/30 p-2 rounded-xl text-[9px] text-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-xl leading-snug">
                                                {chunk.tip}
                                            </div>
                                        )}

                                        {/* Play Icon on hover */}
                                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                                                <Volume2 className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Controls Area */}
                <div className="flex flex-col items-center space-y-4 w-full">
                    <div className="flex items-center gap-4">
                        {/* Speed Toggle */}
                        <button
                            onClick={() => setSpeed(s => s === 'normal' ? 'slow' : 'normal')}
                            className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${speed === 'normal' ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-lg'}`}
                        >
                            🐢 MODO LENTO: {speed === 'slow' ? 'ON' : 'OFF'}
                        </button>

                        <button
                            onClick={handlePlayAll}
                            disabled={isSpeaking}
                            className="w-20 h-20 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl shadow-[0_10px_0_0_rgba(79,70,229,0.4)] hover:shadow-[0_5px_0_0_rgba(79,70,229,0.4)] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all flex items-center justify-center group"
                        >
                            <Play className={`w-10 h-10 fill-white ${isSpeaking ? 'animate-pulse' : ''}`} />
                        </button>
                    </div>

                    <p className="text-indigo-300/50 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <MousePointer2 className="w-3 h-3" /> toca cada bloque para practicar
                    </p>
                </div>
            </div>

            {/* Bottom Nav / Tip Section */}
            <div className="p-6 bg-slate-900/50 border-t-2 border-indigo-500/20 flex items-center justify-between">
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/10 h-12 w-12 rounded-2xl"
                        onClick={() => setCurrentIndex(prev => (prev - 1 + PHONETIC_DATA.length) % PHONETIC_DATA.length)}
                    >
                        <ChevronLeft />
                    </Button>
                    <div className="flex flex-col justify-center px-4">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Progresión</span>
                        <div className="flex gap-1 mt-1">
                            {PHONETIC_DATA.map((_, i) => (
                                <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${i === currentIndex ? 'bg-indigo-500 w-10' : 'bg-slate-700'}`} />
                            ))}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/10 h-12 w-12 rounded-2xl"
                        onClick={() => setCurrentIndex(prev => (prev + 1) % PHONETIC_DATA.length)}
                    >
                        <ChevronRight />
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowTip(!showTip)}
                        className={`p-3 rounded-2xl border-2 transition-all ${showTip ? 'bg-indigo-500 border-indigo-300 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-indigo-500/50'}`}
                    >
                        <Info className="w-6 h-6" />
                    </button>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Trophy className="w-4 h-4" />
                            <span className="font-black text-sm">+50 XP</span>
                        </div>
                        <span className="text-[9px] text-slate-500 uppercase font-black">Por practicar</span>
                    </div>
                </div>
            </div>

            {/* Floating Tip Box */}
            <AnimatePresence>
                {showTip && phrase.tipBody && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-24 left-6 right-6 p-6 bg-indigo-600 rounded-3xl border-2 border-indigo-400 shadow-2xl z-50 text-white"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="font-black text-lg mb-1 uppercase tracking-tight">Secretos de Rachelle:</h4>
                                <p className="text-indigo-50 text-sm leading-relaxed font-medium">
                                    {phrase.tipBody}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowTip(false)}
                            className="absolute top-4 right-4 text-white/50 hover:text-white"
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
