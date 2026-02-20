import React, { useState, useEffect } from 'react';
import {
    Layers,
    RotateCcw,
    CheckCircle2,
    Brain,
    XCircle,
    Sparkles,
    Trophy,
    Zap,
    Wand2,
    BookOpen,
    ArrowRight,
    ArrowLeft,
    Share2,
    Download,
    HelpCircle,
    Copy,
    Settings,
    Layout,
    PlusCircle,
    Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFlashcards } from '../services/ai_service';
import { getGoogleClassroomAssignments } from '../services/supabase';
import { useGamification } from '@/context/GamificationContext';
import { recordQuestCompletion } from '@/services/learningProgress';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AvatarDisplay } from './Gamification/AvatarDisplay';
import { CardScanner } from './CardScanner';
import confetti from 'canvas-confetti';

interface Flashcard {
    id: string;
    front: string;
    back: string;
    category?: 'math' | 'science' | 'language';
    lastReviewed?: number;
    correctCount: number;
    incorrectCount: number;
}

const DEMO_MATH_FLASHCARDS: Flashcard[] = [
    {
        id: 'demo-frac-1',
        front: '¿Cómo se encuentra el MCM?',
        back: 'El MCM (Mínimo Común Múltiplo) es el primer número que aparece en las tablas de ambos denominadores.\n\nEjemplo: para 2 y 4, contamos de 2 en 2: 2, 4, 6... y de 4 en 4: 4, 8... El primer número en común es el 4. ¡Ese es el MCM!',
        category: 'math',
        correctCount: 0,
        incorrectCount: 0
    }
];

/** Resalta palabras clave con colores vivos para que el niño las vea claramente */
function renderWithKeywordHighlights(text: string, category: 'math' | 'science' | 'language'): React.ReactNode {
    const mathKeywords = [
        { word: 'MCM', color: 'text-cyan-400 font-black drop-shadow-[0_0_10px_rgba(34,211,238,0.9)] bg-cyan-500/20 px-1 rounded' },
        { word: 'Mínimo Común Múltiplo', color: 'text-cyan-300 font-black' },
        { word: 'denominadores', color: 'text-amber-400 font-black' },
        { word: 'tablas', color: 'text-amber-400 font-black' },
        { word: 'Ejemplo', color: 'text-fuchsia-300 font-black' },
        { word: 'primer número en común', color: 'text-emerald-400 font-black' },
        { word: '¡Ese es el MCM!', color: 'text-yellow-400 font-black drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' },
        { word: 'el 4', color: 'text-lime-400 font-black' },
    ];
    const keywords = category === 'math' ? mathKeywords : [];
    if (keywords.length === 0) return text;

    const parts: React.ReactNode[] = [];
    let remaining = text;
    const sorted = [...keywords].sort((a, b) => b.word.length - a.word.length);

    while (remaining.length > 0) {
        let found = false;
        for (const { word, color } of sorted) {
            const idx = remaining.toLowerCase().indexOf(word.toLowerCase());
            if (idx !== -1) {
                if (idx > 0) parts.push(remaining.slice(0, idx));
                parts.push(<span key={`${parts.length}-${word}`} className={color}>{remaining.slice(idx, idx + word.length)}</span>);
                remaining = remaining.slice(idx + word.length);
                found = true;
                break;
            }
        }
        if (!found) {
            parts.push(remaining);
            break;
        }
    }
    return <>{parts}</>;
}

interface FlashcardsProps {
    userId: string;
    userName: string;
    language: 'es' | 'en';
    demoData?: { demoMode?: boolean; mathFlashcards?: boolean } | null;
}

const MagicCards: React.FC<FlashcardsProps> = ({ userId, userName, language, demoData }) => {
    const { addXP, addCoins } = useGamification();
    const [deck, setDeck] = useState<Flashcard[]>(() => {
        if (demoData?.mathFlashcards) return DEMO_MATH_FLASHCARDS;
        const saved = localStorage.getItem(`flashcard_deck_${userId}`);
        return saved ? JSON.parse(saved) : [
            { id: '1', front: "¡Bienvenido! Genera tarjetas para empezar.", back: "Welcome! Generate cards to start.", correctCount: 0, incorrectCount: 0 },
        ];
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'math' | 'science' | 'language'>('math');
    const [sessionStats, setSessionStats] = useState({ correct: 0, reviewed: 0 });
    const [isFinished, setIsFinished] = useState(false);
    const [combo, setCombo] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [studyOpportunities, setStudyOpportunities] = useState<any[]>([]);

    useEffect(() => {
        if (demoData?.mathFlashcards) return;
        localStorage.setItem(`flashcard_deck_${userId}`, JSON.stringify(deck));
    }, [deck, userId, demoData?.mathFlashcards]);

    useEffect(() => {
        if (demoData?.mathFlashcards) {
            setDeck(DEMO_MATH_FLASHCARDS);
            setCurrentIndex(0);
            setIsFlipped(false);
            setIsFinished(false);
        }
    }, [demoData?.mathFlashcards]);

    // Demo: voltear la tarjeta automáticamente después de un momento
    useEffect(() => {
        if (!demoData?.mathFlashcards || isFlipped || isFinished) return;
        const t = setTimeout(() => setIsFlipped(true), 1800);
        return () => clearTimeout(t);
    }, [demoData?.mathFlashcards, isFlipped, isFinished]);

    useEffect(() => {
        loadStudyOpportunities();
    }, [userId]);

    const loadStudyOpportunities = async () => {
        try {
            const assignments = await getGoogleClassroomAssignments(userId);
            if (!assignments) return;

            const keywords = ['examen', 'exam', 'quiz', 'test', 'evaluación', 'repaso', 'review', 'parcial'];
            const relevant = assignments.filter((a: any) =>
                keywords.some(k => a.title.toLowerCase().includes(k)) &&
                a.state !== 'TURNED_IN' &&
                a.state !== 'RETURNED'
            );

            setStudyOpportunities(relevant);
        } catch (error) {
            console.error("Failed to load study opps", error);
        }
    };

    const handleNext = () => {
        setIsFlipped(false);
        if (currentIndex < deck.length - 1) {
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 300);
        } else {
            handleCompleteSession();
        }
    };

    const handleResponse = (correct: boolean) => {
        const currentCard = deck[currentIndex];
        const updatedDeck = [...deck];

        if (correct) {
            updatedDeck[currentIndex] = {
                ...currentCard,
                correctCount: currentCard.correctCount + 1,
                lastReviewed: Date.now()
            };
            setSessionStats(prev => ({ ...prev, correct: prev.correct + 1, reviewed: prev.reviewed + 1 }));
            addXP(10 + (combo * 5));
            setCombo(prev => prev + 1);
        } else {
            updatedDeck[currentIndex] = {
                ...currentCard,
                incorrectCount: currentCard.incorrectCount + 1,
                lastReviewed: Date.now()
            };
            setSessionStats(prev => ({ ...prev, reviewed: prev.reviewed + 1 }));
            addXP(2);
            setCombo(0);
        }

        setDeck(updatedDeck);
        handleNext();
    };

    const handleCompleteSession = async () => {
        setIsFinished(true);
        const coinsEarned = Math.floor(sessionStats.correct * 5);
        const xpEarned = sessionStats.reviewed * 5;
        addCoins(coinsEarned, language === 'es' ? "Repaso de Tarjetas" : "Flashcard Review");
        addXP(xpEarned);
    };

    const handleGenerate = async (topic: string) => {
        setIsGenerating(true);
        try {
            const newCards = await generateFlashcards(`${activeCategory}: ${topic}`);
            if (newCards && newCards.length > 0) {
                processNewCards(newCards);
            }
        } catch (error: any) {
            console.error("Flashcard generation error:", error);
            toast.error(language === 'es'
                ? `Error al generar tarjetas: ${error.message || 'Error desconocido'}`
                : `Error generating cards: ${error.message || 'Unknown error'}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const processNewCards = (newCards: any[]) => {
        const formattedCards = newCards.map((c: any, i: number) => ({
            id: `gen-${Date.now()}-${i}`,
            front: c.front,
            back: c.back,
            category: activeCategory,
            correctCount: 0,
            incorrectCount: 0
        }));
        setDeck(formattedCards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsFinished(false);
        setSessionStats({ correct: 0, reviewed: 0 });
        setCombo(0);
        toast.success(language === 'es' ? "¡Nuevas tarjetas creadas!" : "New cards generated!");
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22d3ee', '#818cf8', '#c084fc']
        });
    };

    const currentCard = deck[currentIndex];

    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-900 font-fredoka">
            {/* 🌌 IMMERSIVE BACKGROUND */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
                style={{
                    backgroundImage: 'url("/backgrounds/magic_cards_bg.png")',
                    filter: isGenerating ? 'blur(10px) brightness(0.5)' : 'none'
                }}
            />

            {/* OVERLAYS FOR DEPTH */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />
            <div className="absolute inset-0 bg-indigo-900/10 mix-blend-overlay pointer-events-none" />

            {/* 💎 HUD: TOP CONTROLS */}
            <div className="absolute top-0 w-full p-6 flex justify-between items-start z-50">
                <div className="flex items-center gap-4">
                    <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-2xl">
                        <Layers className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white drop-shadow-lg tracking-tight">
                            Magic Cards
                        </h1>
                        <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Bienvenido, {localStorage.getItem('nova_user_name') || 'Héroe'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {[
                        { icon: Share2, label: 'Share' },
                        { icon: Copy, label: 'Duplicate' },
                        { icon: Layout, label: 'Layout' },
                        { icon: Download, label: 'Settings' }
                    ].map((btn, i) => (
                        <button key={i} className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-all hover:scale-110 active:scale-95 shadow-xl">
                            <btn.icon className="w-5 h-5" />
                        </button>
                    ))}
                </div>
            </div>

            {/* 📚 THE FLOATING HOLOGRAPHIC BOOK (CENTER PIECE) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                {deck.length > 1 || (deck.length === 1 && deck[0].id !== '1') ? (
                    null // Hide main piece when deck is active
                ) : (
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            rotateX: [0, 5, 0],
                            rotateY: [0, 10, 0]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative group"
                    >
                        {/* Glow under book */}
                        <div className="absolute -inset-20 bg-cyan-400/20 blur-[60px] rounded-full animate-pulse" />

                        {/* Hologram Book SVG/Icon Placeholder - In a real app we'd use a 3D model or better asset */}
                        <div className="relative bg-gradient-to-br from-indigo-500/80 to-purple-600/80 p-8 rounded-3xl backdrop-blur-3xl border-2 border-cyan-400/50 shadow-[0_0_50px_rgba(34,211,238,0.4)]">
                            <BookOpen className="w-48 h-48 text-cyan-200 opacity-90" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-24 h-24 text-white animate-spin-slow opacity-30" />
                            </div>
                        </div>

                        {/* Particle lines escaping the book */}
                        <div className="absolute top-0 -left-10 w-1 h-32 bg-gradient-to-t from-cyan-400 to-transparent blur-sm animate-pulse" />
                        <div className="absolute bottom-0 -right-10 w-1 h-32 bg-gradient-to-b from-indigo-400 to-transparent blur-sm animate-pulse delay-700" />
                    </motion.div>
                )}
            </div>

            {/* 🧙‍♂️ NARRATOR MESSAGE */}
            {!isFinished && (deck.length <= 1 && deck[0].id === '1') && (
                <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 text-center z-30 w-full px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h2 className="text-4xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                            ¡Comienza tu Aventura!
                        </h2>
                        <p className="text-lg text-indigo-100 font-medium max-w-md mx-auto drop-shadow-md">
                            Selecciona una misión de Google Classroom arriba o pide nuevas tarjetas.
                        </p>
                    </motion.div>
                </div>
            )}

            {/* 🃏 MAGIC CARDS HAND (WHEN ACTIVE) */}
            <AnimatePresence>
                {(deck.length > 1 || (deck.length === 1 && deck[0]?.id !== '1')) && !isFinished && (
                    <div className="absolute inset-0 flex items-center justify-center z-40 p-10">
                        {/* MAIN CARD CONTAINER */}
                        <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center gap-12">

                            {/* THE CARD */}
                            <motion.div
                                key={currentIndex}
                                initial={{ scale: 0.8, opacity: 0, rotateY: -180 }}
                                animate={{ scale: 1, opacity: 1, rotateY: isFlipped ? 180 : 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                onClick={() => setIsFlipped(!isFlipped)}
                                className="relative w-full max-w-md aspect-[3/4] cursor-pointer preserve-3d group"
                            >
                                {/* FRONT */}
                                <div className={cn(
                                    "absolute inset-0 rounded-[3rem] border-4 p-1 bg-slate-900/40 backdrop-blur-2xl backface-hidden flex flex-col items-center justify-center text-center transition-all",
                                    activeCategory === 'math' ? "border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.3)]" :
                                        activeCategory === 'science' ? "border-emerald-400/50 shadow-[0_0_30px_rgba(52,211,153,0.3)]" : "border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.3)]"
                                )}>
                                    <div className="absolute inset-4 rounded-[2.5rem] border border-white/10" />
                                    <div className="p-8 relative z-10 w-full h-full flex flex-col items-center justify-between">
                                        <div className="w-16 h-1 bg-white/20 rounded-full" />
                                        <h2 className="text-4xl font-black text-white leading-tight px-4">
                                            {demoData?.mathFlashcards && currentCard.front.includes('MCM')
                                                ? <>¿Cómo se encuentra el <span className="text-cyan-400 font-black drop-shadow-[0_0_15px_rgba(34,211,238,0.9)] bg-cyan-500/30 px-2 py-0.5 rounded-lg">MCM</span>?</>
                                                : currentCard.front}
                                        </h2>
                                        <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-widest animate-pulse">
                                            <Wand2 className="w-4 h-4" /> REVELAR MAGIA
                                        </div>
                                    </div>
                                </div>

                                {/* BACK */}
                                <div className={cn(
                                    "absolute inset-0 rounded-[3rem] p-1 bg-gradient-to-br backface-hidden rotate-y-180 flex flex-col items-center justify-center text-center text-white overflow-hidden",
                                    activeCategory === 'math' ? "from-cyan-500 to-indigo-700 shadow-[0_0_50px_rgba(34,211,238,0.5)]" :
                                        activeCategory === 'science' ? "from-emerald-500 to-teal-700 shadow-[0_0_50px_rgba(52,211,153,0.5)]" : "from-amber-500 to-orange-700 shadow-[0_0_50px_rgba(251,191,36,0.5)]"
                                )}>
                                    <div className="absolute inset-0 bg-white/5 opacity-50" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                                    <div className="p-12 relative z-10">
                                        <CheckCircle2 className="w-20 h-20 text-white/90 mx-auto mb-6 scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
                                        <h3 className="text-3xl font-black whitespace-pre-line leading-relaxed text-white [&_span]:inline-block">
                                            {demoData?.mathFlashcards && currentCard.category
                                                ? renderWithKeywordHighlights(currentCard.back, currentCard.category)
                                                : currentCard.back}
                                        </h3>
                                    </div>
                                </div>
                            </motion.div>

                            {/* CONTROLS AREA */}
                            <div className="flex items-center gap-12 w-full max-w-lg z-50">
                                <motion.button
                                    whileHover={{ scale: 1.1, x: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => { e.stopPropagation(); handleResponse(false); }}
                                    className="w-24 h-24 rounded-full bg-slate-900/60 backdrop-blur-xl border-2 border-rose-500/50 text-rose-400 flex items-center justify-center shadow-2xl hover:bg-rose-500 hover:text-white transition-all group"
                                >
                                    <XCircle className="w-10 h-10 group-hover:rotate-12" />
                                </motion.button>

                                <div className="flex-1 flex flex-col items-center gap-2">
                                    <div className="text-white/40 text-xs font-black tracking-widest uppercase">Combo</div>
                                    <div className="text-5xl font-black text-white italic drop-shadow-glow animate-bounce">
                                        x{combo}
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.1, x: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => { e.stopPropagation(); handleResponse(true); }}
                                    className="w-24 h-24 rounded-full bg-slate-900/60 backdrop-blur-xl border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center shadow-2xl hover:bg-emerald-500 hover:text-white transition-all group"
                                >
                                    <CheckCircle2 className="w-10 h-10 group-hover:scale-125 transition-transform" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* 🛰️ RECOMMENDED MISSIONS HUD (BOTTOM LEFT/CENTER) */}
            <div className={`absolute bottom-8 left-8 right-32 z-40 transition-all duration-1000 ${deck.length > 1 ? 'opacity-20 pointer-events-none scale-90 translate-y-10' : 'opacity-100'}`}>
                <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/10 shadow-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-white font-black tracking-wide text-sm uppercase">Misiones Sugeridas</h3>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                        {studyOpportunities.length > 0 ? studyOpportunities.map((opp, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleGenerate(opp.title)}
                                className="flex-shrink-0 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl w-64 text-left transition-all active:scale-95 group"
                            >
                                <div className="text-indigo-200 text-sm font-bold truncate mb-1 group-hover:text-indigo-400">
                                    {opp.title}
                                </div>
                                <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest flex items-center gap-1">
                                    Generar Misión <ArrowRight className="w-3 h-3" />
                                </div>
                            </button>
                        )) : (
                            <div className="text-white/20 text-xs font-bold italic py-2">
                                No se detectaron misiones inmediatas. ¡Crea una tarjeta nueva!
                            </div>
                        )}

                        <button
                            onClick={() => setIsScanning(true)}
                            className="flex-shrink-0 bg-cyan-600 shadow-xl p-4 rounded-2xl w-64 text-left transition-all active:scale-95 flex items-center gap-3 border-b-4 border-cyan-800"
                        >
                            <Camera className="w-6 h-6 text-white" />
                            <div className="text-white font-black text-sm">Escaneo de Libro</div>
                        </button>

                    </div>
                </div>
            </div>

            {/* 📸 SCANNER OVERLAY */}
            <AnimatePresence>
                {isScanning && (
                    <CardScanner
                        language={language}
                        onClose={() => setIsScanning(false)}
                        onCardsGenerated={processNewCards}
                    />
                )}
            </AnimatePresence>

            {/* 🦾 STATUS HUD LABELS (SIDES) - SPECTACULAR FLOATING UI */}
            <div className="absolute top-1/2 left-6 -translate-y-1/2 hidden xl:flex flex-col gap-10 items-center opacity-40 hover:opacity-100 transition-opacity z-10">
                <div className="rotate-[-90deg] origin-center whitespace-nowrap">
                    <span className="text-indigo-400 font-bold tracking-[0.5em] text-[10px] uppercase">STATION-AI-CORE // 10.4.0</span>
                </div>
                <div className="w-px h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
                <div className="flex flex-col gap-4">
                    <Layout className="w-4 h-4 text-cyan-400" />
                    <Settings className="w-4 h-4 text-cyan-400" />
                </div>
            </div>

            <div className="absolute top-1/2 right-6 -translate-y-1/2 hidden xl:flex flex-col gap-10 items-center opacity-40 hover:opacity-100 transition-opacity z-10">
                <div className="flex flex-col gap-4 items-center">
                    <div className="w-8 h-1 bg-cyan-400" />
                    <div className="w-4 h-1 bg-cyan-400" />
                    <div className="w-6 h-1 bg-cyan-400" />
                </div>
                <div className="w-px h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
                <div className="rotate-[90deg] origin-center whitespace-nowrap">
                    <span className="text-indigo-400 font-bold tracking-[0.5em] text-[10px] uppercase">HOLOGRAPHIC_PROCESSOR // ONLINE</span>
                </div>
            </div>

            {/* 🏆 SESSION FINISHED OVERLAY */}
            <AnimatePresence>
                {isFinished && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-[100] bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-12 text-center max-w-lg w-full shadow-[0_0_100px_rgba(79,70,229,0.5)] border-4 border-indigo-100 relative overflow-hidden"
                        >
                            {/* Confetti & Shine */}
                            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-yellow-100/50 to-transparent pointer-events-none" />

                            <div className="relative z-10 space-y-8">
                                <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                                    <Trophy className="w-12 h-12 text-white" />
                                </div>

                                <h2 className="text-5xl font-black text-slate-800">¡Insuperable!</h2>
                                <p className="text-xl text-slate-600 font-bold">Has dominado la magia de estas tarjetas.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100">
                                        <div className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">XP</div>
                                        <div className="text-4xl font-black text-indigo-600">+{sessionStats.reviewed * 5}</div>
                                    </div>
                                    <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-100">
                                        <div className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">COINS</div>
                                        <div className="text-4xl font-black text-emerald-600">+{Math.floor(sessionStats.correct * 5)}</div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => {
                                        setIsFinished(false);
                                        setCurrentIndex(0);
                                        setSessionStats({ correct: 0, reviewed: 0 });
                                        setCombo(0);
                                        setDeck([{ id: '1', front: "¡Bienvenido! Genera tarjetas para empezar.", back: "Welcome! Generate cards to start.", correctCount: 0, incorrectCount: 0 }]);
                                    }}
                                    className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-xl font-black text-white shadow-xl shadow-indigo-200 transition-all active:scale-95"
                                >
                                    <RotateCcw className="mr-2" /> REPETIR MISIÓN
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ⚙️ GENERATING OVERLAY */}
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-6"
                    >
                        <div className="relative">
                            <div className="w-32 h-32 border-4 border-cyan-400/20 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-12 h-12 text-cyan-400 animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-white mb-2">Canalizando Energía...</h3>
                            <p className="text-cyan-400 font-bold animate-pulse text-sm uppercase tracking-[0.3em]">IA HOLOGRÁFICA ACTIVADA</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default MagicCards;
