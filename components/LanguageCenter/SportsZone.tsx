import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { edgeTTS } from '@/services/edgeTTS';
import { motion, AnimatePresence } from 'framer-motion';
import { useNovaSound } from '@/hooks/useNovaSound';
import { ArrowLeft, Mic, Volume2, Trophy, Star, RotateCcw, Zap, Timer } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   📚 SENTENCE DATA
   ═══════════════════════════════════════════════════════════════ */
interface Sentence { en: string; es: string; keywords: string[]; }

const SOCCER_SENTENCES: Sentence[] = [
    { en: "The player kicks the ball", es: "El jugador patea el balón", keywords: ["player", "kicks", "ball"] },
    { en: "The goalkeeper saves the shot", es: "El portero ataja el disparo", keywords: ["goalkeeper", "saves", "shot"] },
    { en: "The team scores a goal", es: "El equipo anota un gol", keywords: ["team", "scores", "goal"] },
    { en: "The referee blows the whistle", es: "El árbitro sopla el silbato", keywords: ["referee", "blows", "whistle"] },
    { en: "The ball goes into the net", es: "El balón entra en la red", keywords: ["ball", "goes", "net"] },
    { en: "The fans cheer loudly", es: "Los aficionados aplauden fuerte", keywords: ["fans", "cheer", "loudly"] },
    { en: "The striker runs very fast", es: "El delantero corre muy rápido", keywords: ["striker", "runs", "fast"] },
    { en: "The defender blocks the pass", es: "El defensa bloquea el pase", keywords: ["defender", "blocks", "pass"] },
    { en: "The coach gives instructions", es: "El entrenador da instrucciones", keywords: ["coach", "gives", "instructions"] },
    { en: "He passes the ball forward", es: "Él pasa el balón adelante", keywords: ["passes", "ball", "forward"] },
];

const TRACK_SENTENCES: Sentence[] = [
    { en: "The runners take their positions", es: "Los corredores toman sus posiciones", keywords: ["runners", "take", "positions"] },
    { en: "Ready, set, go!", es: "¡En sus marcas, listos, fuera!", keywords: ["ready", "set", "go"] },
    { en: "The sprinter runs the fastest", es: "El velocista corre más rápido", keywords: ["sprinter", "runs", "fastest"] },
    { en: "She jumps over the hurdle", es: "Ella salta la valla", keywords: ["jumps", "over", "hurdle"] },
    { en: "The relay team passes the baton", es: "El equipo de relevo pasa la estafeta", keywords: ["relay", "passes", "baton"] },
    { en: "He crosses the finish line first", es: "Él cruza la meta primero", keywords: ["crosses", "finish", "first"] },
    { en: "The athlete wins the gold medal", es: "El atleta gana la medalla de oro", keywords: ["athlete", "wins", "gold"] },
    { en: "They train every morning early", es: "Ellos entrenan cada mañana temprano", keywords: ["train", "every", "morning"] },
    { en: "The race begins in one minute", es: "La carrera empieza en un minuto", keywords: ["race", "begins", "minute"] },
    { en: "She breaks the world record", es: "Ella rompe el récord mundial", keywords: ["breaks", "world", "record"] },
];

const SWIM_SENTENCES: Sentence[] = [
    { en: "The swimmer dives into the pool", es: "El nadador se zambulle en la piscina", keywords: ["swimmer", "dives", "pool"] },
    { en: "She swims freestyle very fast", es: "Ella nada estilo libre muy rápido", keywords: ["swims", "freestyle", "fast"] },
    { en: "He does the backstroke perfectly", es: "Él hace el estilo espalda perfectamente", keywords: ["backstroke", "perfectly"] },
    { en: "The breaststroke is very elegant", es: "El estilo pecho es muy elegante", keywords: ["breaststroke", "very", "elegant"] },
    { en: "The butterfly stroke needs strength", es: "El estilo mariposa necesita fuerza", keywords: ["butterfly", "stroke", "strength"] },
    { en: "The relay team touches the wall", es: "El equipo de relevo toca la pared", keywords: ["relay", "touches", "wall"] },
    { en: "She wears goggles and a swim cap", es: "Ella usa gafas y gorro de natación", keywords: ["goggles", "swim", "cap"] },
    { en: "The pool has eight swimming lanes", es: "La piscina tiene ocho carriles", keywords: ["pool", "eight", "lanes"] },
    { en: "He kicks his legs underwater", es: "Él patea sus piernas bajo el agua", keywords: ["kicks", "legs", "underwater"] },
    { en: "She wins the gold in swimming", es: "Ella gana el oro en natación", keywords: ["wins", "gold", "swimming"] },
];

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
const TOTAL_ROUNDS = 5;
const GOAL_ZONES = ['left', 'center', 'right'] as const;
type GoalZone = typeof GOAL_ZONES[number];

/* ═══════════════════════════════════════════════════════════════
   🎙️ SHARED: Speech Recognition Hook
   ═══════════════════════════════════════════════════════════════ */
function useSpeechRecognition(onResult: (transcript: string) => void) {
    const recRef = useRef<any>(null);
    const [listening, setListening] = useState(false);
    const callbackRef = useRef(onResult);
    callbackRef.current = onResult;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;
        const rec = new SR();
        rec.continuous = false; rec.lang = 'en-US'; rec.interimResults = false;
        rec.onstart = () => setListening(true);
        rec.onend = () => setListening(false);
        rec.onresult = (e: any) => callbackRef.current(e.results[0][0].transcript.toLowerCase().trim());
        rec.onerror = () => setListening(false);
        recRef.current = rec;
    }, []);

    const start = () => { try { recRef.current?.start(); } catch (e) { } };
    return { listening, start };
}

/* ═══════════════════════════════════════════════════════════════
   🎙️ SHARED: Sentence Challenge Panel
   ═══════════════════════════════════════════════════════════════ */
interface ChallengePanelProps {
    sentence: Sentence;
    phase: 'listen' | 'speak' | 'result';
    pronunciationOk: boolean | null;
    isListening: boolean;
    spokenText: string;
    onListen: () => void;
    onSpeak: () => void;
}

const ChallengePanel: React.FC<ChallengePanelProps> = ({
    sentence, phase, pronunciationOk, isListening, spokenText, onListen, onSpeak
}) => (
    <div className="bg-black/80 backdrop-blur-xl rounded-3xl p-5 border-2 border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${phase === 'listen' ? 'bg-blue-400 animate-pulse' : 'bg-blue-400'}`} />
            <div className={`w-8 h-0.5 ${phase !== 'listen' ? 'bg-green-400' : 'bg-white/20'}`} />
            <div className={`w-2 h-2 rounded-full ${phase === 'speak' ? 'bg-green-400 animate-pulse' : pronunciationOk ? 'bg-green-400' : 'bg-white/20'}`} />
            <div className={`w-8 h-0.5 ${pronunciationOk ? 'bg-yellow-400' : 'bg-white/20'}`} />
            <div className={`w-2 h-2 rounded-full ${pronunciationOk ? 'bg-yellow-400' : 'bg-white/20'}`} />
        </div>
        <div className="text-center mb-4">
            <p className="text-white text-lg md:text-xl font-black leading-snug">🇺🇸 "{sentence.en}"</p>
            <p className="text-indigo-300 text-sm font-bold mt-1 italic">🇪🇸 "{sentence.es}"</p>
        </div>
        <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onListen}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl flex flex-col items-center gap-1 transition-all border-b-4 border-blue-700 active:border-b-0 font-black">
                <Volume2 size={22} /><span className="text-[9px] uppercase">Listen / Escucha</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onSpeak}
                disabled={isListening || pronunciationOk === true}
                className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all border-b-4 active:border-b-0 font-black
                    ${isListening ? 'bg-red-500 border-red-700 text-white animate-pulse' :
                        pronunciationOk === true ? 'bg-green-500 border-green-700 text-white' :
                            pronunciationOk === false ? 'bg-orange-500 border-orange-700 text-white' :
                                'bg-yellow-400 border-yellow-600 text-yellow-900 hover:bg-yellow-300'}`}>
                {pronunciationOk === true ? <Star size={22} /> : <Mic size={22} />}
                <span className="text-[9px] uppercase">
                    {isListening ? 'Listening...' : pronunciationOk === true ? 'Perfect!' : pronunciationOk === false ? 'Try Again!' : 'Speak / Habla'}
                </span>
            </motion.button>
        </div>
        {spokenText && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-center">
                <p className="text-white/40 text-[10px] font-bold uppercase">You said:</p>
                <p className={`text-sm font-bold ${pronunciationOk ? 'text-green-400' : pronunciationOk === false ? 'text-red-400' : 'text-white/70'}`}>"{spokenText}"</p>
            </motion.div>
        )}
    </div>
);

/* ═══════════════════════════════════════════════════════════════
   ⚽ PENALTY GAME
   ═══════════════════════════════════════════════════════════════ */
interface GameProps {
    onFinish: (won: number, total: number) => void;
    onBack: () => void;
    playClick: () => void;
    playSuccess: () => void;
}

const PenaltyGame: React.FC<GameProps> = ({ onFinish, onBack, playClick, playSuccess }) => {
    const [round, setRound] = useState(0);
    const [goals, setGoals] = useState(0);
    const [phase, setPhase] = useState<'listen' | 'speak' | 'result' | 'shoot' | 'celebrate'>('listen');
    const [pronunciationOk, setPronunciationOk] = useState<boolean | null>(null);
    const [spokenText, setSpokenText] = useState('');
    const [shotResult, setShotResult] = useState<'goal' | 'saved' | null>(null);
    const [ballTarget, setBallTarget] = useState<GoalZone>('center');
    const [keeperDive, setKeeperDive] = useState<GoalZone>('center');
    const [subtitle, setSubtitle] = useState<{ en: string; es: string } | null>(null);

    const sentences = useMemo(() => shuffle(SOCCER_SENTENCES).slice(0, TOTAL_ROUNDS), []);
    const current = sentences[round];
    const particles = useMemo(() => Array.from({ length: 20 }).map(() => ({
        x: Math.random() * 100, delay: Math.random() * 2, dur: 1.5 + Math.random(),
        emoji: ['👏', '🎉', '⭐', '🔥'][Math.floor(Math.random() * 4)],
    })), []);

    const handleSpeech = useCallback((transcript: string) => {
        if (!current) return;
        const kws = current.keywords;
        const matched = kws.filter(kw => transcript.includes(kw.toLowerCase()));
        if (matched.length / kws.length >= 0.66) {
            setPronunciationOk(true); setPhase('result'); playSuccess();
            edgeTTS.speak("Great! Now shoot!", "rachelle");
            setTimeout(() => setPhase('shoot'), 1800);
        } else {
            setPronunciationOk(false); setPhase('result');
            edgeTTS.speak("Try again!", "rachelle");
            setTimeout(() => { setPhase('listen'); setPronunciationOk(null); setSpokenText(''); }, 2200);
        }
    }, [round]);

    const { listening, start: startRec } = useSpeechRecognition((t) => { setSpokenText(t); handleSpeech(t); });

    const speakSentence = async () => {
        if (!current) return;
        setSubtitle({ en: current.en, es: current.es });
        await edgeTTS.speak(current.en, "rachelle"); await edgeTTS.speak(current.es, "lina");
        await new Promise(r => setTimeout(r, 500)); setSubtitle(null);
    };

    const shoot = (zone: GoalZone) => {
        playClick();
        setBallTarget(zone);

        const kd = GOAL_ZONES[Math.floor(Math.random() * 3)];
        setKeeperDive(kd);

        // Physic logic: Goal occurs only if dive zone is different
        const isGoal = zone !== kd;

        setShotResult(isGoal ? 'goal' : 'saved');
        setPhase('celebrate');

        if (isGoal) {
            setGoals(g => g + 1);
            playSuccess();
            edgeTTS.speak("GOAL!", "rachelle");
        } else {
            edgeTTS.speak("What a save!", "rachelle");
        }

        setTimeout(() => {
            if (round + 1 >= TOTAL_ROUNDS) onFinish(goals + (isGoal ? 1 : 0), TOTAL_ROUNDS);
            else {
                setRound(r => r + 1);
                setPhase('listen');
                setShotResult(null);
                setPronunciationOk(null);
                setSpokenText('');
            }
        }, 2800);
    };

    const keeperX = keeperDive === 'left' ? -130 : keeperDive === 'right' ? 130 : 0;
    const ballFinalX = shotResult === 'saved' ? keeperX * 0.8 : (ballTarget === 'left' ? -140 : ballTarget === 'right' ? 140 : 0);
    const ballFinalY = shotResult === 'saved' ? -100 : -190;

    return (
        <div className="h-full flex flex-col relative overflow-hidden select-none">
            {/* Stadium */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-slate-800 to-green-900" />
            {/* Crowd */}
            <div className="absolute top-[12%] left-0 right-0 h-[25%] z-[3] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/80" />
                <div className="flex justify-center gap-0 items-end h-full opacity-30">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <motion.div key={i} animate={{ y: [0, -2 - (i % 3) * 2, 0] }}
                            transition={{ repeat: Infinity, duration: 1 + (i % 4) * 0.3, delay: (i % 5) * 0.2 }}
                            className="text-lg" style={{ opacity: 0.3 + (i % 3) * 0.2 }}>
                            {['🙋', '🙋‍♂️', '🧑', '👦', '👧'][i % 5]}
                        </motion.div>
                    ))}
                </div>
            </div>
            {/* Pitch */}
            <div className="absolute bottom-0 left-0 right-0 h-[48%] z-[4]"
                style={{ background: 'repeating-linear-gradient(90deg, #2d7a3a 0, #2d7a3a 48px, #338844 48px, #338844 96px)' }}>
                <div className="absolute top-2 left-[8%] right-[8%] h-[40%] border-2 border-white/20 rounded-sm" />
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-3 h-3 bg-white/60 rounded-full" />
            </div>
            {/* Goal */}
            <div className="absolute bottom-[38%] left-1/2 -translate-x-1/2 z-[10] w-[340px] md:w-[440px] h-[130px] md:h-[160px]">
                <div className="absolute inset-0 rounded-t-lg opacity-30" style={{
                    backgroundImage: 'linear-gradient(0deg, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
                    backgroundSize: '12px 12px'
                }} />
                <div className="absolute -top-3 -left-2 -right-2 h-4 bg-white rounded-full shadow-[0_2px_10px_rgba(255,255,255,0.5)]" />
                <div className="absolute -left-2 -top-3 w-4 h-[calc(100%+12px)] bg-white rounded-full" />
                <div className="absolute -right-2 -top-3 w-4 h-[calc(100%+12px)] bg-white rounded-full" />

                {/* Keeper */}
                <motion.div
                    animate={phase === 'celebrate' ? { x: keeperX, scale: shotResult === 'saved' ? 1.25 : 1, rotate: shotResult === 'saved' ? [0, -15, 15, 0] : 0 } : { x: [-160, 160] }}
                    transition={phase === 'celebrate' ? { type: "spring", stiffness: 500, damping: 20 } : { repeat: Infinity, duration: 0.7, repeatType: 'reverse', ease: "easeInOut" }}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">

                    {phase === 'celebrate' && shotResult === 'saved' ? (
                        <div className="relative group">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }} className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap shadow-xl border-2 border-white">
                                IMPOSSIBLE SAVE! 🧤
                            </motion.div>
                            <div className="relative flex flex-col items-center">
                                {/* Fully Geared Keeper - Neon Pink Professional Kit */}
                                <div className="w-14 h-16 bg-gradient-to-b from-fuchsia-500 to-fuchsia-700 rounded-t-2xl relative border-x-4 border-t-4 border-fuchsia-400 shadow-2xl">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                                        <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black text-white">1</div>
                                    </div>
                                    {/* Professional Long Sleeves */}
                                    <div className="absolute -left-4 top-1 w-5 h-12 bg-fuchsia-600 rounded-full rotate-45 shadow-md border-r-2 border-fuchsia-400" />
                                    <div className="absolute -right-4 top-1 w-5 h-12 bg-fuchsia-600 rounded-full -rotate-45 shadow-md border-l-2 border-fuchsia-400" />
                                </div>
                                <div className="text-4xl -mt-20 mb-2 filter drop-shadow-md z-10">👦</div>
                                <div className="absolute -left-12 -top-4 text-5xl filter drop-shadow-lg transform -rotate-45">🧤</div>
                                <div className="absolute -right-12 -top-4 text-5xl filter drop-shadow-lg transform rotate-45">🧤</div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex flex-col items-center">
                            {/* Professional Goalkeeper Kit - Neon Green/Black */}
                            <div className="w-14 h-16 bg-gradient-to-b from-lime-400 to-green-600 rounded-t-2xl relative border-x-4 border-t-4 border-lime-300 shadow-2xl overflow-hidden">
                                {/* Texture/Design */}
                                <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
                                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, black 10px, black 20px)' }} />

                                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                                    <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black text-white">1</div>
                                </div>
                            </div>

                            {/* Long Protective Sleeves */}
                            <div className="absolute -left-4 top-2 w-5 h-12 bg-lime-500 rounded-full rotate-12 shadow-md border border-lime-400" />
                            <div className="absolute -right-4 top-2 w-5 h-12 bg-lime-500 rounded-full -rotate-12 shadow-md border border-lime-400" />

                            {/* Professional Gloves */}
                            <motion.div animate={{ y: [0, -10, 0], rotate: [-15, -20, -15] }} transition={{ repeat: Infinity, duration: 0.6 }}
                                className="absolute -left-14 -top-2 text-6xl filter drop-shadow-lg">🧤</motion.div>
                            <motion.div animate={{ y: [0, -10, 0], rotate: [15, 20, 15] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
                                className="absolute -right-14 -top-2 text-6xl filter drop-shadow-lg">🧤</motion.div>

                            <div className="text-4xl -mt-20 mb-2 filter drop-shadow-md z-10">👦</div>
                        </div>
                    )}
                </motion.div>
                {/* Shoot zones */}
                <AnimatePresence>
                    {phase === 'shoot' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 grid grid-cols-3 gap-1 z-30">
                            {GOAL_ZONES.map(z => (
                                <motion.button key={z} whileHover={{ backgroundColor: 'rgba(250,204,21,0.4)' }} whileTap={{ scale: 0.95 }}
                                    onClick={() => shoot(z)}
                                    className="rounded-lg border-2 border-dashed border-yellow-400/50 bg-yellow-400/10 flex items-center justify-center cursor-crosshair hover:border-yellow-400">
                                    <span className="text-yellow-300 font-black text-sm uppercase drop-shadow-md">
                                        {z === 'left' ? '👈' : z === 'right' ? '👉' : '👆'}
                                    </span>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {/* Ball */}
            <motion.div animate={phase === 'celebrate' ? { x: ballFinalX, y: ballFinalY, scale: shotResult === 'saved' ? [1, 0.8, 1, 0.7] : [1, 0.6], rotate: 720 } : { y: [0, -3, 0] }}
                transition={phase === 'celebrate' ? { duration: 0.45, ease: "easeOut" } : { repeat: Infinity, duration: 2 }}
                className="absolute bottom-[22%] left-1/2 -translate-x-1/2 z-[15] text-4xl md:text-5xl filter drop-shadow-xl">⚽</motion.div>
            {/* Kicker */}
            <motion.div animate={phase === 'celebrate' ? { scale: 1.1 } : { y: [0, -2, 0] }}
                transition={{ repeat: phase !== 'celebrate' ? Infinity : 0, duration: 1.5 }}
                className="absolute bottom-[12%] left-1/2 -translate-x-1/2 z-[12] text-5xl md:text-6xl filter drop-shadow-xl">🏃</motion.div>
            {/* GOAL/SAVED overlay */}
            <AnimatePresence>
                {phase === 'celebrate' && shotResult && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.5, 1] }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[50] flex items-center justify-center pointer-events-none">
                        <div className={`text-6xl md:text-8xl font-black drop-shadow-[0_8px_0_rgba(0,0,0,0.5)] ${shotResult === 'goal' ? 'text-yellow-400' : 'text-fuchsia-400'}`}>
                            {shotResult === 'goal' ? '⚽ GOAL!' : '🧤 SAVED!'}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Celebration particles */}
            {phase === 'celebrate' && shotResult === 'goal' && particles.slice(0, 12).map((p, i) => (
                <motion.div key={`c-${i}`} initial={{ y: '50%', x: `${p.x}%`, scale: 0 }}
                    animate={{ y: '-20%', opacity: 0, scale: 1.5 }} transition={{ duration: p.dur, delay: p.delay * 0.3 }}
                    className="absolute text-2xl z-[45] pointer-events-none">{p.emoji}</motion.div>
            ))}
            {/* HUD */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[40] flex items-center gap-3">
                <button onClick={onBack} className="bg-black/50 backdrop-blur text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-black/70 font-bold text-xs border border-white/10">
                    <ArrowLeft size={14} /> Exit
                </button>
                <div className="bg-black/70 backdrop-blur px-5 py-2 rounded-xl border border-white/20 flex items-center gap-4">
                    <div className="text-center"><div className="text-[8px] font-bold text-green-300 uppercase">Round</div><div className="text-lg font-black text-white">{round + 1}/{TOTAL_ROUNDS}</div></div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center"><div className="text-[8px] font-bold text-yellow-300 uppercase">Goals</div><div className="text-lg font-black text-yellow-400">⚽ {goals}</div></div>
                </div>
            </div>
            {/* Challenge Panel */}
            <AnimatePresence mode="wait">
                {(phase === 'listen' || phase === 'speak' || phase === 'result') && current && (
                    <motion.div key={`p-${round}`} initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[40] w-[92%] max-w-lg">
                        <ChallengePanel sentence={current} phase={phase === 'result' ? 'result' : phase}
                            pronunciationOk={pronunciationOk} isListening={listening} spokenText={spokenText}
                            onListen={speakSentence} onSpeak={() => { setPhase('speak'); setSpokenText(''); setPronunciationOk(null); startRec(); }} />
                    </motion.div>
                )}
            </AnimatePresence>
            {phase === 'shoot' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[40]">
                    <div className="bg-yellow-400 text-yellow-900 px-8 py-3 rounded-full font-black text-lg shadow-2xl border-b-4 border-yellow-600 animate-bounce">
                        👆 Click where to shoot! / ¡Dispara!
                    </div>
                </motion.div>
            )}
            {subtitle && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[60] w-[85%] max-w-md pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center shadow-2xl">
                        <p className="text-white text-base font-black">{subtitle.en}</p>
                        <p className="text-indigo-300 text-sm font-bold italic mt-1">{subtitle.es}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   🏃 TRACK & FIELD GAME
   ═══════════════════════════════════════════════════════════════ */
interface Runner { name: string; emoji: string; color: string; speed: number; pos: number; isPlayer: boolean; }

const TrackGame: React.FC<GameProps> = ({ onFinish, onBack, playClick, playSuccess }) => {
    const [round, setRound] = useState(0);
    const [wins, setWins] = useState(0);
    const [phase, setPhase] = useState<'listen' | 'speak' | 'result' | 'countdown' | 'race' | 'raceEnd'>('listen');
    const [pronunciationOk, setPronunciationOk] = useState<boolean | null>(null);
    const [spokenText, setSpokenText] = useState('');
    const [subtitle, setSubtitle] = useState<{ en: string; es: string } | null>(null);

    // Race state
    const [runners, setRunners] = useState<Runner[]>([]);
    const [countdownNum, setCountdownNum] = useState(3);
    const [raceTime, setRaceTime] = useState(0);
    const [clickCount, setClickCount] = useState(0);
    const [playerSpeed, setPlayerSpeed] = useState(0);
    const [raceResult, setRaceResult] = useState<'win' | 'lose' | null>(null);
    const raceInterval = useRef<any>(null);
    const raceActive = useRef(false);

    const sentences = useMemo(() => shuffle(TRACK_SENTENCES).slice(0, TOTAL_ROUNDS), []);
    const current = sentences[round];

    // Opponent speeds (pre-computed per round to avoid randomness in render)
    const opponentSpeeds = useMemo(() =>
        Array.from({ length: TOTAL_ROUNDS }).map(() => [
            0.25 + Math.random() * 0.15, // slowish
            0.30 + Math.random() * 0.15, // medium
            0.35 + Math.random() * 0.10, // fastish
        ]), []);

    const handleSpeech = useCallback((transcript: string) => {
        if (!current) return;
        const matched = current.keywords.filter(kw => transcript.includes(kw.toLowerCase()));
        if (matched.length / current.keywords.length >= 0.66) {
            setPronunciationOk(true); setPhase('result'); playSuccess();
            edgeTTS.speak("Great! Get ready to race!", "rachelle");
            setTimeout(() => startCountdown(), 1800);
        } else {
            setPronunciationOk(false); setPhase('result');
            edgeTTS.speak("Try again!", "rachelle");
            setTimeout(() => { setPhase('listen'); setPronunciationOk(null); setSpokenText(''); }, 2200);
        }
    }, [round]);

    const { listening, start: startRec } = useSpeechRecognition((t) => { setSpokenText(t); handleSpeech(t); });

    const speakSentence = async () => {
        if (!current) return;
        setSubtitle({ en: current.en, es: current.es });
        await edgeTTS.speak(current.en, "rachelle"); await edgeTTS.speak(current.es, "lina");
        await new Promise(r => setTimeout(r, 500)); setSubtitle(null);
    };

    const startCountdown = () => {
        const speeds = opponentSpeeds[round];
        setRunners([
            { name: 'YOU', emoji: '🏃‍♂️', color: 'from-yellow-400 to-amber-500', speed: 0, pos: 0, isPlayer: true },
            { name: 'Bolt Jr', emoji: '🏃', color: 'from-blue-400 to-blue-600', speed: speeds[0], pos: 0, isPlayer: false },
            { name: 'Flash', emoji: '🏃‍♀️', color: 'from-red-400 to-red-600', speed: speeds[1], pos: 0, isPlayer: false },
            { name: 'Turbo', emoji: '🏃', color: 'from-green-400 to-green-600', speed: speeds[2], pos: 0, isPlayer: false },
        ]);
        setClickCount(0); setPlayerSpeed(0); setRaceTime(0); setRaceResult(null);
        setPhase('countdown'); setCountdownNum(3);

        let count = 3;
        const cdInterval = setInterval(() => {
            count--;
            setCountdownNum(count);
            if (count <= 0) {
                clearInterval(cdInterval);
                setPhase('race');
                raceActive.current = true;
                startRaceLoop();
            }
        }, 800);
    };

    const startRaceLoop = () => {
        const start = Date.now();
        raceInterval.current = setInterval(() => {
            const elapsed = (Date.now() - start) / 1000;
            setRaceTime(elapsed);

            setRunners(prev => {
                const updated = prev.map(r => {
                    if (r.isPlayer) return r; // player pos updated by clicks
                    return { ...r, pos: Math.min(r.pos + r.speed, 100) };
                });

                // Check if anyone finished
                const anyFinished = updated.some(r => r.pos >= 100);
                if (anyFinished && raceActive.current) {
                    raceActive.current = false;
                    clearInterval(raceInterval.current);
                    // Determine winner
                    const playerR = updated.find(r => r.isPlayer)!;
                    const isWin = playerR.pos >= 100 && !updated.some(r => !r.isPlayer && r.pos >= 100);
                    const firstToFinish = updated.reduce((best, r) => r.pos > best.pos ? r : best, updated[0]);

                    setTimeout(() => {
                        setRaceResult(firstToFinish.isPlayer ? 'win' : 'lose');
                        setPhase('raceEnd');
                        if (firstToFinish.isPlayer) {
                            setWins(w => w + 1); playSuccess();
                            edgeTTS.speak("You win the race!", "rachelle");
                        } else {
                            edgeTTS.speak(`${firstToFinish.name} wins!`, "rachelle");
                        }
                    }, 300);
                }
                return updated;
            });

            // Force end after 12 seconds
            if (elapsed > 12 && raceActive.current) {
                raceActive.current = false;
                clearInterval(raceInterval.current);
                setTimeout(() => { setRaceResult('lose'); setPhase('raceEnd'); }, 200);
            }
        }, 50);
    };

    useEffect(() => () => { clearInterval(raceInterval.current); raceActive.current = false; }, []);

    const handleTrackClick = () => {
        if (phase !== 'race' || !raceActive.current) return;
        playClick();
        setClickCount(c => c + 1);
        // Each click advances the player
        setRunners(prev => prev.map(r =>
            r.isPlayer ? { ...r, pos: Math.min(r.pos + 1.2, 100) } : r
        ));
    };

    const nextRound = () => {
        if (round + 1 >= TOTAL_ROUNDS) {
            onFinish(wins + (raceResult === 'win' ? 0 : 0), TOTAL_ROUNDS);// wins already updated
        } else {
            setRound(r => r + 1); setPhase('listen'); setPronunciationOk(null); setSpokenText('');
        }
    };

    const trackColors = ['bg-red-500/80', 'bg-blue-500/80', 'bg-green-500/80', 'bg-yellow-500/80'];

    return (
        <div className="h-full flex flex-col relative overflow-hidden select-none"
            onClick={phase === 'race' ? handleTrackClick : undefined}
            style={{ cursor: phase === 'race' ? 'pointer' : 'default' }}>

            {/* Sky */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-500 via-sky-400 to-emerald-600" />

            {/* Stadium Stands */}
            <div className="absolute top-0 left-0 right-0 h-[30%] z-[2] overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-[80%] bg-gradient-to-b from-slate-600 to-slate-700 rounded-b-[50%] border-b-4 border-slate-800" />
                <div className="absolute bottom-[10%] left-0 right-0 flex justify-center gap-0 items-end opacity-40">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div key={i} animate={{ y: [0, -(i % 3 + 1) * 2, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 + (i % 5) * 0.2, delay: (i % 7) * 0.1 }}
                            className="text-sm md:text-base">
                            {['🙋', '🧑', '👦', '👧', '🙋‍♂️'][i % 5]}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Track Surface */}
            <div className="absolute bottom-[10%] left-[3%] right-[3%] h-[45%] z-[5] rounded-3xl overflow-hidden border-4 border-red-900/50"
                style={{ background: 'linear-gradient(180deg, #c0392b 0%, #e74c3c 50%, #c0392b 100%)' }}>
                {/* Lane lines */}
                <div className="absolute inset-0 flex flex-col justify-evenly pointer-events-none">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-full h-px bg-white/30" />
                    ))}
                </div>
                {/* Finish line */}
                <div className="absolute right-[5%] top-0 bottom-0 w-3 z-10" style={{
                    backgroundImage: 'repeating-linear-gradient(180deg, white 0, white 6px, black 6px, black 12px)',
                }} />
                {/* Start line */}
                <div className="absolute left-[5%] top-0 bottom-0 w-1 bg-white/50" />

                {/* Runners in lanes */}
                <div className="absolute inset-0 flex flex-col justify-evenly px-[5%] z-20">
                    {runners.map((runner, i) => (
                        <div key={i} className="relative h-[22%] flex items-center">
                            {/* Lane bg */}
                            <div className={`absolute inset-0 ${trackColors[i]} opacity-20 rounded`} />
                            {/* Runner progress bar */}
                            <motion.div className="absolute left-0 top-0 bottom-0 bg-white/10 rounded-r"
                                animate={{ width: `${runner.pos}%` }} transition={{ duration: 0.1 }} />
                            {/* Runner emoji */}
                            <motion.div className="absolute z-10 flex items-center gap-1"
                                animate={{ left: `${Math.min(runner.pos, 92)}%` }} transition={{ duration: 0.1 }}>
                                <motion.span
                                    animate={phase === 'race' ? { rotate: [0, -12, 0, 12, 0], y: [0, -3, 0, -3, 0] } : {}}
                                    transition={{ repeat: Infinity, duration: 0.35 }}
                                    className="text-2xl md:text-3xl filter drop-shadow-lg inline-block"
                                    style={{ transform: 'scaleX(-1)' }}>
                                    {runner.emoji}
                                </motion.span>
                                {runner.isPlayer && (
                                    <span className="bg-yellow-400 text-yellow-900 text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md whitespace-nowrap">YOU</span>
                                )}
                            </motion.div>
                            {/* Name label */}
                            <span className="absolute left-1 top-0 text-[8px] font-black text-white/60 uppercase">{runner.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Click prompt during race */}
            <AnimatePresence>
                {phase === 'race' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[35]">
                        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 0.3 }}
                            className="bg-yellow-400 text-yellow-900 px-8 py-3 rounded-full font-black text-lg shadow-2xl border-b-4 border-yellow-600 flex items-center gap-3">
                            <span className="text-3xl">👆</span>
                            <div className="text-left">
                                <div>TAP FAST! / ¡TOCA RÁPIDO!</div>
                                <div className="text-xs font-bold text-yellow-700">Clicks: {clickCount}</div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Countdown */}
            <AnimatePresence>
                {phase === 'countdown' && (
                    <motion.div initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        key={countdownNum}
                        className="absolute inset-0 z-[50] flex items-center justify-center pointer-events-none">
                        <span className="text-9xl font-black text-white drop-shadow-[0_8px_0_rgba(0,0,0,0.5)]">
                            {countdownNum > 0 ? countdownNum : '🏁 GO!'}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Race End overlay */}
            <AnimatePresence>
                {phase === 'raceEnd' && raceResult && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[50] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                        <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="text-center">
                            <div className={`text-6xl md:text-8xl font-black drop-shadow-[0_8px_0_rgba(0,0,0,0.5)] ${raceResult === 'win' ? 'text-yellow-400' : 'text-red-400'}`}>
                                {raceResult === 'win' ? '🏆 YOU WIN!' : '😤 SO CLOSE!'}
                            </div>
                            <div className="text-white/60 text-lg font-bold mt-2">
                                {raceResult === 'win' ? '¡Ganaste la carrera!' : '¡Casi lo logras!'} · {clickCount} clicks
                            </div>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => { raceResult === 'win' && setWins(w => w); nextRound(); }}
                                className="mt-6 bg-white text-slate-800 px-8 py-3 rounded-xl font-black border-b-4 border-slate-300 shadow-lg">
                                {round + 1 >= TOTAL_ROUNDS ? '🏆 See Results' : '➡️ Next Race'}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HUD */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[40] flex items-center gap-3">
                <button onClick={onBack} className="bg-black/50 backdrop-blur text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-black/70 font-bold text-xs border border-white/10">
                    <ArrowLeft size={14} /> Exit
                </button>
                <div className="bg-black/70 backdrop-blur px-5 py-2 rounded-xl border border-white/20 flex items-center gap-4">
                    <div className="text-center"><div className="text-[8px] font-bold text-red-300 uppercase">Race</div><div className="text-lg font-black text-white">{round + 1}/{TOTAL_ROUNDS}</div></div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center"><div className="text-[8px] font-bold text-yellow-300 uppercase">Wins</div><div className="text-lg font-black text-yellow-400">🏆 {wins}</div></div>
                </div>
            </div>

            {/* Challenge Panel (before race) */}
            <AnimatePresence mode="wait">
                {(phase === 'listen' || phase === 'speak' || phase === 'result') && current && (
                    <motion.div key={`t-${round}`} initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[40] w-[92%] max-w-lg">
                        <ChallengePanel sentence={current} phase={phase === 'result' ? 'result' : phase}
                            pronunciationOk={pronunciationOk} isListening={listening} spokenText={spokenText}
                            onListen={speakSentence} onSpeak={() => { setPhase('speak'); setSpokenText(''); setPronunciationOk(null); startRec(); }} />
                    </motion.div>
                )}
            </AnimatePresence>
            {subtitle && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[60] w-[85%] max-w-md pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center">
                        <p className="text-white text-base font-black">{subtitle.en}</p>
                        <p className="text-indigo-300 text-sm font-bold italic mt-1">{subtitle.es}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   🏊 SWIM RACE GAME
   ═══════════════════════════════════════════════════════════════ */
interface Swimmer { name: string; emoji: string; style: string; speed: number; pos: number; isPlayer: boolean; }

const SwimGame: React.FC<GameProps> = ({ onFinish, onBack, playClick, playSuccess }) => {
    const [round, setRound] = useState(0);
    const [wins, setWins] = useState(0);
    const [phase, setPhase] = useState<'listen' | 'speak' | 'result' | 'countdown' | 'race' | 'raceEnd'>('listen');
    const [pronunciationOk, setPronunciationOk] = useState<boolean | null>(null);
    const [spokenText, setSpokenText] = useState('');
    const [subtitle, setSubtitle] = useState<{ en: string; es: string } | null>(null);
    const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
    const [countdownNum, setCountdownNum] = useState(3);
    const [clickCount, setClickCount] = useState(0);
    const [raceResult, setRaceResult] = useState<'win' | 'lose' | null>(null);
    const raceInterval = useRef<any>(null);
    const raceActive = useRef(false);

    const sentences = useMemo(() => shuffle(SWIM_SENTENCES).slice(0, TOTAL_ROUNDS), []);
    const current = sentences[round];
    const opponentSpeeds = useMemo(() =>
        Array.from({ length: TOTAL_ROUNDS }).map(() => [
            0.22 + Math.random() * 0.14,
            0.28 + Math.random() * 0.14,
            0.32 + Math.random() * 0.10,
        ]), []);

    // Water bubble positions
    const bubbles = useMemo(() => Array.from({ length: 20 }).map(() => ({
        x: Math.random() * 100, dur: 2 + Math.random() * 3, delay: Math.random() * 3, size: 4 + Math.random() * 10,
    })), []);

    const handleSpeech = useCallback((transcript: string) => {
        if (!current) return;
        const matched = current.keywords.filter(kw => transcript.includes(kw.toLowerCase()));
        if (matched.length / current.keywords.length >= 0.66) {
            setPronunciationOk(true); setPhase('result'); playSuccess();
            edgeTTS.speak("Great! Get ready to swim!", "rachelle");
            setTimeout(() => startCountdown(), 1800);
        } else {
            setPronunciationOk(false); setPhase('result');
            edgeTTS.speak("Try again!", "rachelle");
            setTimeout(() => { setPhase('listen'); setPronunciationOk(null); setSpokenText(''); }, 2200);
        }
    }, [round]);

    const { listening, start: startRec } = useSpeechRecognition((t) => { setSpokenText(t); handleSpeech(t); });

    const speakSentence = async () => {
        if (!current) return;
        setSubtitle({ en: current.en, es: current.es });
        await edgeTTS.speak(current.en, "rachelle"); await edgeTTS.speak(current.es, "lina");
        await new Promise(r => setTimeout(r, 500)); setSubtitle(null);
    };

    const startCountdown = () => {
        const speeds = opponentSpeeds[round];
        setSwimmers([
            { name: 'YOU', emoji: '🏊', style: 'Freestyle', speed: 0, pos: 0, isPlayer: true },
            { name: 'Aqua', emoji: '🏊‍♀️', style: 'Backstroke', speed: speeds[0], pos: 0, isPlayer: false },
            { name: 'Dolphin', emoji: '🏊‍♂️', style: 'Butterfly', speed: speeds[1], pos: 0, isPlayer: false },
            { name: 'Wave', emoji: '🏊', style: 'Breaststroke', speed: speeds[2], pos: 0, isPlayer: false },
        ]);
        setClickCount(0); setRaceResult(null);
        setPhase('countdown'); setCountdownNum(3);
        let count = 3;
        const cdInterval = setInterval(() => {
            count--; setCountdownNum(count);
            if (count <= 0) { clearInterval(cdInterval); setPhase('race'); raceActive.current = true; startRaceLoop(); }
        }, 800);
    };

    const startRaceLoop = () => {
        const start = Date.now();
        raceInterval.current = setInterval(() => {
            const elapsed = (Date.now() - start) / 1000;
            setSwimmers(prev => {
                const updated = prev.map(r => r.isPlayer ? r : { ...r, pos: Math.min(r.pos + r.speed, 100) });
                const anyFinished = updated.some(r => r.pos >= 100);
                if (anyFinished && raceActive.current) {
                    raceActive.current = false; clearInterval(raceInterval.current);
                    const first = updated.reduce((b, r) => r.pos > b.pos ? r : b, updated[0]);
                    setTimeout(() => {
                        setRaceResult(first.isPlayer ? 'win' : 'lose'); setPhase('raceEnd');
                        if (first.isPlayer) { setWins(w => w + 1); playSuccess(); edgeTTS.speak("You win!", "rachelle"); }
                        else edgeTTS.speak(`${first.name} wins!`, "rachelle");
                    }, 300);
                }
                return updated;
            });
            if (elapsed > 12 && raceActive.current) {
                raceActive.current = false; clearInterval(raceInterval.current);
                setTimeout(() => { setRaceResult('lose'); setPhase('raceEnd'); }, 200);
            }
        }, 50);
    };

    useEffect(() => () => { clearInterval(raceInterval.current); raceActive.current = false; }, []);

    const handleClick = () => {
        if (phase !== 'race' || !raceActive.current) return;
        playClick(); setClickCount(c => c + 1);
        setSwimmers(prev => prev.map(r => r.isPlayer ? { ...r, pos: Math.min(r.pos + 1.2, 100) } : r));
    };

    const nextRound = () => {
        if (round + 1 >= TOTAL_ROUNDS) onFinish(wins, TOTAL_ROUNDS);
        else { setRound(r => r + 1); setPhase('listen'); setPronunciationOk(null); setSpokenText(''); }
    };

    const laneColors = ['bg-yellow-400/15', 'bg-blue-400/15', 'bg-pink-400/15', 'bg-green-400/15'];

    return (
        <div className="h-full flex flex-col relative overflow-hidden select-none"
            onClick={phase === 'race' ? handleClick : undefined}
            style={{ cursor: phase === 'race' ? 'pointer' : 'default' }}>

            {/* Sky + Stadium */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-cyan-400 to-blue-600" />

            {/* Arena roof */}
            <div className="absolute top-0 left-0 right-0 h-[20%] z-[2] bg-gradient-to-b from-slate-700 via-slate-600 to-transparent">
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-0 items-end opacity-30">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <motion.div key={i} animate={{ y: [0, -(i % 3 + 1) * 2, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 + (i % 5) * 0.2, delay: (i % 7) * 0.1 }}
                            className="text-sm">{['🙋', '🧑', '👦', '👧', '🙋‍♂️'][i % 5]}</motion.div>
                    ))}
                </div>
            </div>

            {/* Water bubbles */}
            {bubbles.map((b, i) => (
                <motion.div key={`bub-${i}`}
                    animate={{ y: [0, -40, -80], opacity: [0.6, 0.3, 0] }}
                    transition={{ repeat: Infinity, duration: b.dur, delay: b.delay }}
                    className="absolute z-[3] rounded-full bg-white/20 pointer-events-none"
                    style={{ left: `${b.x}%`, bottom: '15%', width: b.size, height: b.size }} />
            ))}

            {/* Pool */}
            <div className="absolute bottom-[8%] left-[2%] right-[2%] h-[55%] z-[5] rounded-2xl overflow-hidden border-4 border-blue-900/60"
                style={{ background: 'linear-gradient(180deg, #1a7bc4 0%, #0e5fa3 30%, #0c4f8a 60%, #0a3d6e 100%)' }}>

                {/* Water surface ripples */}
                <div className="absolute top-0 left-0 right-0 h-4 z-[8] opacity-40" style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.15) 20px, rgba(255,255,255,0.15) 22px)',
                }} />

                {/* Lane ropes */}
                <div className="absolute inset-0 flex flex-col justify-evenly pointer-events-none z-[6]">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-full h-1.5 flex">
                            {Array.from({ length: 40 }).map((_, j) => (
                                <div key={j} className={`flex-1 h-full ${j % 2 === 0 ? (i % 2 === 0 ? 'bg-red-500/40' : 'bg-blue-300/40') : 'bg-white/20'}`} />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Wall at finish (right) */}
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-cyan-300/40 z-[7] border-l-2 border-cyan-200/50" />
                {/* Wall at start (left) */}
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-cyan-300/40 z-[7] border-r-2 border-cyan-200/50" />

                {/* Lane numbers */}
                <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-evenly z-[9] pointer-events-none">
                    {[1, 2, 3, 4].map(n => (
                        <span key={n} className="text-[10px] font-black text-white/30 w-4 text-center">{n}</span>
                    ))}
                </div>

                {/* Swimmers in lanes */}
                <div className="absolute inset-0 flex flex-col justify-evenly px-[3%] z-[10]">
                    {swimmers.map((sw, i) => (
                        <div key={i} className="relative h-[22%] flex items-center">
                            <div className={`absolute inset-0 ${laneColors[i]} rounded`} />
                            <motion.div className="absolute left-0 top-0 bottom-0 bg-white/8 rounded-r"
                                animate={{ width: `${sw.pos}%` }} transition={{ duration: 0.1 }} />
                            <motion.div className="absolute z-10 flex items-center gap-1"
                                animate={{ left: `${Math.min(sw.pos, 92)}%` }} transition={{ duration: 0.1 }}>
                                <motion.span
                                    animate={phase === 'race' ? { rotate: [0, -10, 0, 10, 0], y: [0, -2, 0, -2, 0] } : {}}
                                    transition={{ repeat: Infinity, duration: 0.4 }}
                                    className="text-2xl md:text-3xl filter drop-shadow-lg inline-block"
                                    style={{ transform: 'scaleX(-1)' }}>
                                    {sw.emoji}
                                </motion.span>
                                {sw.isPlayer && (
                                    <span className="bg-yellow-400 text-yellow-900 text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md whitespace-nowrap">YOU</span>
                                )}
                            </motion.div>
                            <span className="absolute left-5 top-0 text-[7px] font-black text-white/40 uppercase">{sw.name} · {sw.style}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Click prompt */}
            <AnimatePresence>
                {phase === 'race' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 z-[35]">
                        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 0.3 }}
                            className="bg-cyan-400 text-cyan-900 px-8 py-3 rounded-full font-black text-lg shadow-2xl border-b-4 border-cyan-600 flex items-center gap-3">
                            <span className="text-3xl">🏊</span>
                            <div className="text-left">
                                <div>SWIM! TAP FAST! / ¡NADA!</div>
                                <div className="text-xs font-bold text-cyan-700">Strokes: {clickCount}</div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Countdown */}
            <AnimatePresence>
                {phase === 'countdown' && (
                    <motion.div initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        key={countdownNum}
                        className="absolute inset-0 z-[50] flex items-center justify-center pointer-events-none">
                        <span className="text-9xl font-black text-white drop-shadow-[0_8px_0_rgba(0,0,0,0.5)]">
                            {countdownNum > 0 ? countdownNum : '🏊 SWIM!'}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Race End */}
            <AnimatePresence>
                {phase === 'raceEnd' && raceResult && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[50] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                        <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="text-center">
                            <div className={`text-6xl md:text-8xl font-black drop-shadow-[0_8px_0_rgba(0,0,0,0.5)] ${raceResult === 'win' ? 'text-yellow-400' : 'text-red-400'}`}>
                                {raceResult === 'win' ? '🏆 YOU WIN!' : '🌊 SO CLOSE!'}
                            </div>
                            <div className="text-white/60 text-lg font-bold mt-2">
                                {raceResult === 'win' ? '¡Ganaste la carrera!' : '¡Casi lo logras!'} · {clickCount} strokes
                            </div>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={nextRound}
                                className="mt-6 bg-white text-slate-800 px-8 py-3 rounded-xl font-black border-b-4 border-slate-300 shadow-lg">
                                {round + 1 >= TOTAL_ROUNDS ? '🏆 See Results' : '➡️ Next Race'}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HUD */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[40] flex items-center gap-3">
                <button onClick={onBack} className="bg-black/50 backdrop-blur text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-black/70 font-bold text-xs border border-white/10">
                    <ArrowLeft size={14} /> Exit
                </button>
                <div className="bg-black/70 backdrop-blur px-5 py-2 rounded-xl border border-white/20 flex items-center gap-4">
                    <div className="text-center"><div className="text-[8px] font-bold text-cyan-300 uppercase">Heat</div><div className="text-lg font-black text-white">{round + 1}/{TOTAL_ROUNDS}</div></div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center"><div className="text-[8px] font-bold text-yellow-300 uppercase">Wins</div><div className="text-lg font-black text-yellow-400">🏆 {wins}</div></div>
                </div>
            </div>

            {/* Challenge Panel */}
            <AnimatePresence mode="wait">
                {(phase === 'listen' || phase === 'speak' || phase === 'result') && current && (
                    <motion.div key={`sw-${round}`} initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[40] w-[92%] max-w-lg">
                        <ChallengePanel sentence={current} phase={phase === 'result' ? 'result' : phase}
                            pronunciationOk={pronunciationOk} isListening={listening} spokenText={spokenText}
                            onListen={speakSentence} onSpeak={() => { setPhase('speak'); setSpokenText(''); setPronunciationOk(null); startRec(); }} />
                    </motion.div>
                )}
            </AnimatePresence>
            {subtitle && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[60] w-[85%] max-w-md pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center">
                        <p className="text-white text-base font-black">{subtitle.en}</p>
                        <p className="text-indigo-300 text-sm font-bold italic mt-1">{subtitle.es}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   🏟️ MAIN: HUB + RESULTS + ROUTING
   ═══════════════════════════════════════════════════════════════ */
interface SportsZoneProps { onBack: () => void; }
type GameId = 'penalty' | 'track' | 'swim';

const SportsZone: React.FC<SportsZoneProps> = ({ onBack }) => {
    const { playClick, playSuccess, playStickerApply } = useNovaSound();
    const [view, setView] = useState<'hub' | 'game' | 'results'>('hub');
    const [activeGame, setActiveGame] = useState<GameId>('penalty');
    const [lastScore, setLastScore] = useState({ won: 0, total: 0 });

    const startGame = (id: GameId) => { playClick(); setActiveGame(id); setView('game'); };

    const handleFinish = (won: number, total: number) => {
        setLastScore({ won, total }); setView('results');
    };

    // ── RESULTS ──
    if (view === 'results') {
        const pct = Math.round((lastScore.won / lastScore.total) * 100);
        const medal = pct >= 90 ? '🥇' : pct >= 60 ? '🥈' : pct >= 40 ? '🥉' : '💪';
        const label = pct >= 90 ? 'CHAMPION!' : pct >= 60 ? 'GREAT!' : pct >= 40 ? 'GOOD!' : 'KEEP TRYING!';
        const confetti = useMemo(() => Array.from({ length: 20 }).map(() => ({
            x: Math.random() * 100, d: Math.random() * 2, emoji: ['⭐', '🎉', '✨', '🏆'][Math.floor(Math.random() * 4)]
        })), [view]);

        return (
            <div className="h-full flex flex-col items-center justify-center relative overflow-hidden select-none">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-green-950" />
                {pct >= 60 && confetti.map((p, i) => (
                    <motion.div key={i} initial={{ y: -20, x: `${p.x}%` }} animate={{ y: '110vh', rotate: 360 }}
                        transition={{ duration: 2 + p.d, repeat: Infinity, delay: p.d * 0.4 }}
                        className="absolute text-xl pointer-events-none">{p.emoji}</motion.div>
                ))}
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="z-20 flex flex-col items-center">
                    <span className="text-8xl mb-3">{medal}</span>
                    <h2 className="text-white text-4xl font-black">{label}</h2>
                    <p className="text-white/50 font-bold mt-1">{activeGame === 'penalty' ? 'Penalty Shootout' : activeGame === 'track' ? 'Track & Field' : 'Swimming Race'}</p>
                    <div className="mt-6 bg-black/50 backdrop-blur px-8 py-4 rounded-2xl border border-white/20">
                        <div className="text-5xl font-black text-white">{lastScore.won}/{lastScore.total}</div>
                        <div className="text-white/40 text-sm font-bold text-center">{pct}%</div>
                    </div>
                    <div className="flex gap-4 mt-8">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setView('game')}
                            className="flex items-center gap-2 bg-white text-slate-800 px-6 py-3 rounded-xl font-black border-b-4 border-slate-300 shadow-lg">
                            <RotateCcw size={18} /> Play Again
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setView('hub')}
                            className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-xl font-black border-b-4 border-yellow-600 shadow-lg">
                            <Trophy size={18} /> Hub
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ── GAME ──
    if (view === 'game') {
        const props: GameProps = { onFinish: handleFinish, onBack: () => { playClick(); setView('hub'); }, playClick, playSuccess };
        if (activeGame === 'penalty') return <PenaltyGame {...props} />;
        if (activeGame === 'track') return <TrackGame {...props} />;
        return <SwimGame {...props} />;
    }

    // ── HUB ──
    const games = [
        {
            id: 'penalty' as GameId, title: 'PENALTY MASTER', titleEs: 'Tiros Penales',
            emoji: '⚽', gradient: 'from-green-600 to-emerald-800', border: 'border-green-400/30',
            desc: 'Say the sentence → Shoot the penalty!', descEs: 'Di la frase → ¡Dispara el penal!',
            icons: '🧑‍🦱 ⚽ 🧤',
        },
        {
            id: 'track' as GameId, title: 'TRACK SPRINT', titleEs: 'Sprint de Pista',
            emoji: '🏃', gradient: 'from-red-600 to-rose-800', border: 'border-red-400/30',
            desc: 'Say the sentence → Click fast to win the race!', descEs: 'Di la frase → ¡Clickea rápido para ganar!',
            icons: '🏃‍♂️ 🏃 🏃‍♀️ 🏃',
        },
        {
            id: 'swim' as GameId, title: 'SWIM RACE', titleEs: 'Carrera de Natación',
            emoji: '🏊', gradient: 'from-cyan-600 to-blue-800', border: 'border-cyan-400/30',
            desc: 'Say the sentence → Click fast to swim to victory!', descEs: 'Di la frase → ¡Clickea rápido para nadar!',
            icons: '🏊 🏊‍♀️ 🏊‍♂️ 🏊',
        },
    ];

    return (
        <div className="h-full flex flex-col overflow-hidden relative select-none">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900" />
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '30px 30px'
            }} />

            <div className="relative z-10 p-4 md:p-6">
                <button onClick={onBack} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all font-bold text-sm backdrop-blur border border-white/10 mb-4">
                    <ArrowLeft size={18} /> Back to City
                </button>
                <div className="text-center">
                    <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="text-4xl md:text-5xl font-black tracking-tight">
                        <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent">SPORTS</span>
                        {' '}<span className="text-white">ACADEMY</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="text-indigo-300/70 text-sm font-bold mt-1">
                        🎙️ Speak → Play → Win! / ¡Habla → Juega → Gana!
                    </motion.p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative z-10 px-6 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl">
                    {games.map((g, i) => (
                        <motion.button key={g.id}
                            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.15 }}
                            whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}
                            onClick={() => startGame(g.id)}
                            className={`w-full text-left rounded-3xl overflow-hidden border-2 ${g.border} hover:border-white/40 transition-all shadow-2xl group relative`}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${g.gradient}`} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="relative z-10 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-5xl filter drop-shadow-lg">{g.emoji}</span>
                                    <span className="text-2xl opacity-50">{g.icons}</span>
                                </div>
                                <h3 className="text-white text-xl font-black">{g.title}</h3>
                                <p className="text-white/40 text-xs font-bold mb-3">{g.titleEs}</p>
                                <div className="bg-black/30 rounded-xl p-3 mb-4">
                                    <p className="text-white/80 text-xs font-bold">{g.desc}</p>
                                    <p className="text-white/40 text-xs italic">{g.descEs}</p>
                                </div>
                                <div className="flex items-center justify-center gap-2 bg-yellow-400 text-yellow-900 py-3 rounded-xl font-black border-b-4 border-yellow-600 group-hover:bg-yellow-300 transition-all">
                                    <Zap size={18} /> PLAY
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SportsZone;
