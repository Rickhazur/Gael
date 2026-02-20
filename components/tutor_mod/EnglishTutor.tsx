import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Volume2, Globe, ArrowRight, Loader2, Coins as CoinsIcon, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LinaAvatar, type AvatarState } from '@/components/MathMaestro/tutor/LinaAvatar';
import { callChatApi } from '@/services/ai_service';
import { useLearning } from '@/context/LearningContext';
import { useGamification } from '@/context/GamificationContext';
import { generateSpeech } from '@/services/edgeTTS';
import { toast } from 'sonner';
import { PhoneticsGym } from './companion/PhoneticsGym';

interface EnglishMessage {
    id: string;
    role: 'tutor' | 'student';
    content: string;
    translation?: string;
    phonetic?: string;
    correction?: string;
    options?: (string | { en: string; es: string })[];
    mood?: AvatarState;
}

interface EnglishTutorProps {
    initialMessage?: string;
    onClose?: () => void;
}

export function EnglishTutor({ initialMessage, onClose }: EnglishTutorProps) {
    const { immersionMode, englishLevel } = useLearning();
    const { addCoins, addXP } = useGamification();
    const [messages, setMessages] = useState<EnglishMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [avatarState, setAvatarState] = useState<AvatarState>('idle');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [view, setView] = useState<'chat' | 'gym'>('chat');
    const scrollRef = useRef<HTMLDivElement>(null);

    const isNonBilingual = immersionMode === 'standard';

    // Pedagogy Prompt for A1 Colombian Grade 5
    const SYSTEM_PROMPT = `
Actúa como un chatbot educativo de inglés llamado "Profe Lina" o "Ms. Rachelle" para niños de quinto grado en Colombia (10–11 años), nivel A1.

CONTEXTO PEDAGÓGICO:
- Estudiante hispanohablante, no bilingüe.
- Lenguaje amigable, paciente y muy motivador.
- USA FRASES CORTAS (máx. 8 palabras).
- Vocabulario de alta frecuencia: school, arepa, football, family, routine.
- Estructuras clave: I am, I like, I have, She is.
- NO uses gramática compleja ni explicaciones largas.
- NO digas "Wrong" o "Incorrect". Si hay un error, valida y reformula amablemente.

FORMATO DE RESPUESTA (JSON):
Debes responder SIEMPRE en formato JSON con esta estructura:
{
  "english": "Sentence in English",
  "spanish": "Traducción al español para apoyo",
  "phonetic": "Escritura fonética en español para leer de corrido (e.g., 'Jelou ja-yu')",
  "correction": "Si el niño cometió un error, corrígelo amablemente aquí en español. Si no, pon null.",
  "options": [{"en": "Option 1", "es": "Traducción 1"}, {"en": "Option 2", "es": "Traducción 2"}],
  "mood": "happy|thinking|excited|encouraging|celebrating",
  "praise": true/false
}

REGLAS DE INTERACCIÓN:
1. Saludo amigable y bilingüe si es necesario para dar confianza.
2. Ayuda SIEMPRE con la pronunciación fonética en el campo "phonetic".
3. Usa el español en "spanish" como un puente pedagógico (técnica sandwich: explica el concepto en inglés, luego apóyate en el español).
4. Si el niño comete un error gramatical o de vocabulario, corrígelo amablemente en "correction" en ESPAÑOL.
5. Las "options" DEBEN ser respuestas lógicas y fáciles de pronunciar.
6. El español se usa SOLO como apoyo en los campos correspondientes.
`;

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSpeak = async (text: string, translation?: string) => {
        if (isSpeaking) return;
        setIsSpeaking(true);
        setAvatarState('speaking');
        try {
            // First speak English (Rachelle)
            await generateSpeech(text, 'rachelle');

            // If there's a translation and we are in non-bilingual mode, speak it too (Lina)
            if (isNonBilingual && translation) {
                await generateSpeech(translation, 'lina');
            }
        } catch (error) {
            console.error('Speech error:', error);
        } finally {
            setIsSpeaking(false);
            setAvatarState('idle');
        }
    };

    const processAiResponse = async (userText: string, history: EnglishMessage[]) => {
        setIsLoading(true);
        setAvatarState('thinking');

        const apiMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history.map(m => ({
                role: m.role === 'tutor' ? 'assistant' : 'user',
                content: m.content
            })),
            { role: 'user', content: userText }
        ];

        try {
            const response = await callChatApi(apiMessages, 'gemini-1.5-flash', true);
            const data = JSON.parse(response.choices[0].message.content);

            const tutorMsg: EnglishMessage = {
                id: Date.now().toString(),
                role: 'tutor',
                content: data.english,
                translation: data.spanish,
                phonetic: data.phonetic,
                correction: data.correction,
                options: data.options,
                mood: data.mood as AvatarState || 'happy'
            };

            setMessages(prev => [...prev, tutorMsg]);
            setAvatarState(tutorMsg.mood || 'idle');

            if (data.praise) {
                addCoins(10, isNonBilingual ? '¡Gran esfuerzo en inglés!' : 'Great effort in English!');
                addXP(20);
            }

            // Auto-speak the tutor message (with translation support for non-bilinguals)
            handleSpeak(data.english, data.spanish);

        } catch (error) {
            console.error('AI Error:', error);
            toast.error(isNonBilingual ? 'Oh no, perdí la conexión' : 'Oops, I lost connection');
            setAvatarState('idle');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        const studentMsg: EnglishMessage = {
            id: Date.now().toString(),
            role: 'student',
            content: text
        };

        setMessages(prev => [...prev, studentMsg]);
        setInput('');
        processAiResponse(text, messages);
    };

    const handleOptionClick = (option: string | { en: string; es: string }) => {
        const text = typeof option === 'string' ? option : option.en;
        handleSendMessage(text);
    };

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0) {
            const initialText = initialMessage || (isNonBilingual ? "Hello! Let's practice English together." : "Hi! Are you ready to learn English?");
            processAiResponse(initialText, []);
        }
    }, []);

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl bg-slate-900 rounded-[2.5rem] border-4 border-indigo-500/30 overflow-hidden shadow-2xl relative">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute top-10 left-10 text-6xl rotate-12">🇬🇧</div>
                <div className="absolute bottom-10 right-10 text-6xl -rotate-12">🇺🇸</div>
                <div className="absolute top-1/2 left-1/4 text-4xl opacity-20">A B C</div>
            </div>

            {/* Header */}
            <div className="px-6 py-4 bg-indigo-600/20 border-b border-indigo-500/30 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-white/20">
                        <Globe className="w-6 h-6 text-white animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-white font-black tracking-tight font-fredoka">
                            English Lab A1
                        </h2>
                        <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest bg-indigo-900/50 px-2 py-0.5 rounded-full">
                            {isNonBilingual ? 'Modo Colombia' : 'Bilingual Track'}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setView(v => v === 'chat' ? 'gym' : 'chat')}
                        className={`px-3 py-1 rounded-full text-[10px] font-black transition-all border-2 ${view === 'gym' ? 'bg-indigo-500 border-indigo-300 text-white' : 'bg-slate-800 border-slate-700 text-indigo-300 hover:border-indigo-500'}`}
                    >
                        {view === 'chat' ? (isNonBilingual ? '🏋️ GIMNASIO FÓNICO' : '🏋️ PHONETIC GYM') : (isNonBilingual ? '💬 VOLVER AL CHAT' : '💬 BACK TO CHAT')}
                    </button>
                    <div className="flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/30 px-3 py-1 rounded-full">
                        <CoinsIcon className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-xs font-black text-yellow-500">PRO</span>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                            <span className="text-xl">✕</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {view === 'chat' ? (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute inset-0 flex flex-col"
                        >
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none scroll-smooth bg-gradient-to-b from-transparent to-slate-950/30"
                            >
                                <AnimatePresence>
                                    {messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'} items-end gap-3`}
                                        >
                                            {msg.role === 'tutor' && (
                                                <div className="flex-shrink-0 mb-1">
                                                    <LinaAvatar state={avatarState} size={60} />
                                                </div>
                                            )}

                                            <div className={`max-w-[85%] group relative ${msg.role === 'student' ? 'order-1' : 'order-2'}`}>
                                                <div className={`
                                    p-4 rounded-[1.5rem] shadow-lg border-2
                                    ${msg.role === 'student'
                                                        ? 'bg-indigo-600 border-indigo-400 text-white rounded-br-none font-bold'
                                                        : 'bg-slate-800 border-slate-700 text-slate-100 rounded-bl-none'}
                                `}>
                                                    <p className="text-base leading-relaxed">
                                                        {msg.content}
                                                    </p>

                                                    {msg.role === 'tutor' && msg.translation && (
                                                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                                                            <p className="text-xs font-medium text-slate-400 italic">
                                                                {msg.translation}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* NEW: Correction & Phonetic */}
                                                    {msg.role === 'tutor' && msg.correction && (
                                                        <div className="mt-2 p-2 rounded-lg bg-amber-900/20 border border-amber-500/30 text-amber-200 text-xs">
                                                            <span className="font-bold">✨ Tip: </span> {msg.correction}
                                                        </div>
                                                    )}

                                                    {msg.role === 'tutor' && msg.phonetic && (
                                                        <div className="mt-2 p-2 rounded-lg bg-indigo-900/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono">
                                                            <span className="opacity-50 uppercase block mb-1">Pronunciación:</span>
                                                            "{msg.phonetic}"
                                                        </div>
                                                    )}

                                                    {msg.role === 'tutor' && (
                                                        <button
                                                            onClick={() => handleSpeak(msg.content)}
                                                            className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-600"
                                                        >
                                                            <Volume2 className="w-4 h-4 text-cyan-400" />
                                                        </button>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-500 mt-1 block px-2">
                                                    {msg.role === 'tutor' ? 'Ms. Rachelle' : 'Estudiante'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {isLoading && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center gap-3">
                                            <LinaAvatar state="thinking" size={60} />
                                            <div className="bg-slate-800/50 px-4 py-3 rounded-2xl border border-slate-700">
                                                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Bottom Panel: Options & Input */}
                            <div className="p-4 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 space-y-4">
                                {/* AI Suggestions / Options */}
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                                    {messages.length > 0 && messages[messages.length - 1].role === 'tutor' && messages[messages.length - 1].options?.map((opt, i) => (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            onClick={() => handleOptionClick(opt)}
                                            className="whitespace-nowrap rounded-2xl bg-indigo-950/40 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/60 hover:text-white transition-all flex flex-col items-center py-6 px-6 border-2 group/opt"
                                        >
                                            <span className="text-sm font-black group-hover/opt:scale-105 transition-transform flex items-center">
                                                {typeof opt === 'string' ? opt : opt.en} <ArrowRight className="w-3.5 h-3.5 ml-2 opacity-50" />
                                            </span>
                                            {typeof opt !== 'string' && opt.es && (
                                                <span className="text-[10px] text-indigo-400 font-bold italic opacity-80">
                                                    {opt.es}
                                                </span>
                                            )}
                                        </Button>
                                    ))}
                                </div>

                                {/* Input Input */}
                                <div className="flex gap-3">
                                    <div className="relative flex-1 group">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
                                            placeholder={isNonBilingual ? "Responde en inglés..." : "Type in English..."}
                                            className="w-full bg-slate-800/50 border-2 border-slate-700 text-white placeholder:text-slate-500 px-5 py-4 rounded-[2rem] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-base font-medium"
                                            disabled={isLoading}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-0 group-focus-within:opacity-100 transition-opacity">
                                            ✨
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleSendMessage(input)}
                                        disabled={!input.trim() || isLoading}
                                        className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center p-0 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        <Send className="w-6 h-6 text-white" />
                                    </Button>
                                </div>

                                {/* Effort Badge */}
                                <div className="flex items-center justify-center gap-1.5 py-1">
                                    <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        {isNonBilingual ? 'Gana NovaCoins por tu esfuerzo' : 'Earn NovaCoins for your effort'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="gym"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="absolute inset-0"
                        >
                            <PhoneticsGym />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default EnglishTutor;
