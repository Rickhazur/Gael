
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mic, Gamepad2, Newspaper, Archive, Brain, Volume2, ArrowRight, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

// --- RECEPTION EDITOR COMPONENT (OLLIE'S OFFICE) ---
// A vibrant, comic-book style office where Ollie guides the student.
const ReceptionEditor = ({
    onNavigate,
    studentName
}: {
    onNavigate: (view: any) => void,
    studentName: string
}) => {
    const [step, setStep] = useState(0);
    const [messages, setMessages] = useState<{ id: number, text_en: string, text_es: string, sender: 'ollie' | 'student' }[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    // Tutorial Script
    const tutorialSteps = [
        {
            id: 1,
            en: `Welcome to the Nova Newsroom, ${studentName}! 📰 I'm Ollie, your Editor-in-Chief.`,
            es: `¡Bienvenido a la Redacción Nova, ${studentName}! 📰 Soy Ollie, tu Editor Jefe.`,
            action: null
        },
        {
            id: 2,
            en: "Here, we turn students into EXPERT English Reporters. Let me show you our departments.",
            es: "Aquí convertimos estudiantes en Reporteros EXPERTOS de inglés. Déjame mostrarte nuestros departamentos.",
            action: 'show_map'
        },
        {
            id: 3,
            en: "1. The Voice Booth (Cabina): Speak with Rachelle and practice your conversation skills.",
            es: "1. La Cabina de Voz: Habla con Rachelle y practica tus habilidades de conversación.",
            highlight: 'talk'
        },
        {
            id: 4,
            en: "2. The Newsroom (Redacción): Read daily news articles to improve your reading.",
            es: "2. La Redacción: Lee artículos de noticias diarios para mejorar tu lectura.",
            highlight: 'dailynews'
        },
        {
            id: 5,
            en: "3. Broadcast Studio (Estudio de TV): Perfect your pronunciation with advanced tools.",
            es: "3. Estudio de TV: Perfecciona tu pronunciación con herramientas avanzadas.",
            highlight: 'pronunciation'
        },
        {
            id: 6,
            en: "4. The Archives (Archivos): Memorize vocabulary with our Flashcards system.",
            es: "4. Los Archivos: Memoriza vocabulario con nuestro sistema de Flashcards.",
            highlight: 'flashcards'
        },
        {
            id: 7,
            en: "5. Evaluation Center: Test your knowledge and earn your reporter badges!",
            es: "5. Sala de Evaluaciones: ¡Pon a prueba tu conocimiento y gana tus insignias de reportero!",
            highlight: 'eval'
        },
        {
            id: 8,
            en: "Ready to start? Head to the Voice Booth for your first assignment!",
            es: "¡Listo para empezar? ¡Ve a la Cabina de Voz para tu primera misión!",
            action: 'mission_start'
        }
    ];

    // Auto-play tutorial
    useEffect(() => {
        if (step < tutorialSteps.length) {
            const timer = setTimeout(() => {
                setIsTyping(true);
                setTimeout(() => {
                    const currentStep = tutorialSteps[step];
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        text_en: currentStep.en,
                        text_es: currentStep.es,
                        sender: 'ollie'
                    }]);
                    setIsTyping(false);
                    setStep(s => s + 1);
                }, 1500); // Typing duration
            }, 2000); // Pause between messages
            return () => clearTimeout(timer);
        }
    }, [step]);

    return (
        <div className="w-full max-w-5xl mx-auto h-[700px] relative overflow-hidden bg-white rounded-[3rem] border-8 border-slate-900 shadow-2xl flex flex-col md:flex-row">

            {/* BACKGROUND DECOR: Comic Dots */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-bl-[100%] border-l-4 border-b-4 border-black z-0"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300 rounded-tr-[100%] border-t-4 border-r-4 border-black z-0"></div>

            {/* LEFT PANEL: OLLIE VISUAL */}
            <div className="relative w-full md:w-1/3 p-8 flex flex-col items-center justify-center border-r-4 border-slate-900 bg-yellow-50/50">
                {/* Nameplate */}
                <div className="bg-slate-900 text-white px-6 py-2 rounded-xl border-4 border-yellow-400 shadow-[4px_4px_0_0_#ca8a04] mb-6 transform -rotate-2 z-10 text-center">
                    <h2 className="text-xl font-black uppercase tracking-widest">EDITOR OLLIE</h2>
                    <p className="text-[10px] text-yellow-300 font-bold tracking-wider">CHIEF OF STAFF</p>
                </div>

                {/* Ollie Avatar */}
                <div className="relative w-48 h-48">
                    <div className="absolute inset-0 bg-orange-400 rounded-full border-4 border-black shadow-[8px_8px_0_0_#000]"></div>
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ollie&backgroundColor=transparent&clothing=collarAndSweater&eyebrows=default&eyes=happy&mouth=smile"
                        alt="Ollie"
                        className="absolute inset-2 w-[90%] h-[90%] object-contain drop-shadow-lg" />

                    {/* Glasses accessory if not present in seed */}
                    <div className="absolute top-16 left-8 w-32 h-12 border-4 border-black rounded-2xl opacity-80 pointer-events-none"></div> {/* Fake glasses for comic effect */}
                    <div className="absolute w-4 h-4 bg-white rounded-full top-20 left-10"></div>
                </div>

                {/* Status */}
                <div className="mt-8 bg-white border-4 border-black px-4 py-2 rounded-full shadow-[4px_4px_0_0_#000] flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full border border-black animate-pulse"></span>
                    <span className="text-xs font-black uppercase">ONLINE & TEACHING</span>
                </div>
            </div>

            {/* RIGHT PANEL: CHAT & TUTORIAL */}
            <div className="flex-1 flex flex-col p-6 relative z-10 bg-white/30 backdrop-blur-sm">

                {/* Header */}
                <div className="border-b-4 border-slate-900 pb-4 mb-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 italic">LA OFICINA DE OLLIE</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase">LESSON 1: THE WELCOME</p>
                    </div>
                    <div className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded border-2 border-black transform rotate-2 animate-bounce">
                        LIVE
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: -50, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="flex gap-4 items-end"
                        >
                            <div className="w-10 h-10 rounded-full bg-orange-400 border-2 border-black flex items-center justify-center shrink-0 overflow-hidden">
                                <span className="font-black text-xs">OL</span>
                            </div>

                            <div className="bg-white border-4 border-black p-4 rounded-2xl rounded-bl-none shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] max-w-[80%] relative group cursor-pointer hover:scale-[1.02] transition-transform">
                                {/* Speech Bubble Tail */}
                                <div className="absolute w-4 h-4 bg-white border-l-4 border-b-4 border-black -left-2 bottom-0 transform skew-x-12"></div>
                                <div className="absolute w-4 h-5 bg-white -left-1 bottom-1"></div> {/* Cover border overlap */}

                                <p className="font-bold text-lg text-slate-800 mb-1">{msg.text_es}</p>
                                <p className="font-medium text-sm text-slate-500 italic border-t-2 border-slate-100 pt-1">{msg.text_en}</p>
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex gap-4 items-end"
                        >
                            <div className="w-10 h-10 rounded-full bg-orange-400 border-2 border-black flex items-center justify-center shrink-0">OL</div>
                            <div className="bg-slate-100 border-2 border-black px-4 py-2 rounded-2xl rounded-bl-none flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </motion.div>
                    )}

                    {/* Quick Actions (Appear at end of flow) */}
                    {step >= 8 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center mt-8 w-full"
                        >
                            <button onClick={() => onNavigate('talk')} className="w-full max-w-sm bg-rose-400 hover:bg-rose-300 border-4 border-black p-4 rounded-xl shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center gap-2 group">
                                <Mic className="w-10 h-10 text-black group-hover:scale-110 transition-transform" />
                                <span className="text-xl font-black text-black">IR A LA CABINA</span>
                                <span className="text-xs font-bold text-rose-900">GO TO VOICE BOOTH</span>
                            </button>
                        </motion.div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ReceptionEditor;
