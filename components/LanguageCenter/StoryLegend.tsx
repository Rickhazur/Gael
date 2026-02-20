import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Sparkles, ChevronRight, ArrowLeft, Volume2,
    Star, Ghost, Compass, Zap, Heart, Shield, Sword,
    Trees, Mountain, Cloud, Sun, Moon, Flame,
    Anchor, Crown, Rocket, Fish, Bird, Cat, Dog, Bug, Bot,
    Award, BookMarked, HelpCircle, ShoppingBag
} from 'lucide-react';
import { edgeTTS } from '@/services/edgeTTS';
import { useGamification } from '@/hooks/useGamification';
import { callChatApi } from '@/services/ai_service';
import { useNovaSound } from '@/hooks/useNovaSound';

// ─────────── TYPES ───────────
interface VocabWord {
    word: string;
    translation: string;
    definition: string; // Simple definition in Spanish for the child
    emoji: string;      // Visual emoji to help the child associate
}

interface StoryChoice {
    id: string;
    textEn: string;
    textEs: string;
    emoji: string;
}

interface StoryScene {
    id: string;
    textEn: string;
    textEs: string;
    visualMotif: string;
    atmosphere: string;
    emotion: string;
    entity: string;
    sceneEmoji: string; // Large emoji illustration for the scene
    vocab: VocabWord[];
    choices: StoryChoice[];
}

// ─────────── FLOATING PARTICLES ───────────
const FloatingParticles: React.FC<{ color: string; count?: number }> = ({ color, count = 12 }) => {
    const particles = useMemo(() =>
        Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 6 + 3,
            dur: Math.random() * 5 + 4,
            del: Math.random() * 3,
        })),
        [count]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, backgroundColor: color, opacity: 0.35 }}
                    animate={{ y: [-15, 15, -15], opacity: [0.15, 0.5, 0.15], scale: [0.8, 1.3, 0.8] }}
                    transition={{ duration: p.dur, repeat: Infinity, delay: p.del, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
};

// ─────────── THE BIG SCENE ILLUSTRATION ───────────
const SceneIllustration: React.FC<{ sceneEmoji: string; entity: string; emotion: string; atmosphere: string }> = ({ sceneEmoji, entity, emotion, atmosphere }) => {
    const emotionAnim = (() => {
        switch (emotion) {
            case 'joy': case 'wonder': case 'happy':
                return { y: [0, -15, 0], scale: [1, 1.1, 1], rotate: [0, 5, -5, 0], transition: { duration: 2, repeat: Infinity } };
            case 'fear': case 'scary':
                return { x: [-3, 3, -3], transition: { duration: 0.2, repeat: Infinity } };
            case 'sadness': case 'sad':
                return { y: [5, 15, 5], scale: [0.95, 0.9, 0.95], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const } };
            case 'courage': case 'brave': case 'heroic':
                return { scale: [1, 1.08, 1], transition: { duration: 2.5, repeat: Infinity } };
            default:
                return { y: [-8, 8, -8], rotate: [-2, 2, -2], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const } };
        }
    })();

    const bgGlow: Record<string, string> = {
        magical: 'shadow-[0_0_80px_40px_rgba(167,139,250,0.3)]',
        tense: 'shadow-[0_0_80px_40px_rgba(251,146,60,0.3)]',
        peaceful: 'shadow-[0_0_80px_40px_rgba(110,231,183,0.3)]',
        heroic: 'shadow-[0_0_80px_40px_rgba(251,191,36,0.3)]',
        scary: 'shadow-[0_0_80px_40px_rgba(168,85,247,0.3)]',
        happy: 'shadow-[0_0_80px_40px_rgba(253,186,116,0.3)]',
        mysterious: 'shadow-[0_0_80px_40px_rgba(129,140,248,0.3)]',
    };

    return (
        <motion.div
            className={`flex items-center justify-center rounded-full ${bgGlow[atmosphere] || bgGlow.magical}`}
            animate={emotionAnim}
        >
            <span className="text-[100px] md:text-[130px] select-none filter drop-shadow-lg leading-none">
                {sceneEmoji || '✨'}
            </span>
        </motion.div>
    );
};

// ─────────── VISUAL BACKGROUND ───────────
const VisualBackground: React.FC<{ atmosphere: string; motif: string }> = ({ atmosphere, motif }) => {
    const gradients: Record<string, string> = {
        magical: 'from-violet-500 via-fuchsia-400 to-pink-400',
        tense: 'from-orange-500 via-red-400 to-rose-500',
        peaceful: 'from-emerald-400 via-teal-300 to-cyan-300',
        heroic: 'from-blue-500 via-indigo-400 to-amber-300',
        scary: 'from-slate-600 via-purple-700 to-gray-700',
        happy: 'from-yellow-400 via-orange-300 to-pink-300',
        mysterious: 'from-indigo-600 via-purple-500 to-blue-500',
        sad: 'from-blue-300 via-slate-300 to-gray-300',
    };

    const pColors: Record<string, string> = {
        magical: '#e879f9', tense: '#fb923c', peaceful: '#6ee7b7',
        heroic: '#fbbf24', scary: '#a78bfa', happy: '#fdba74',
        mysterious: '#818cf8', sad: '#93c5fd',
    };

    const bg = gradients[atmosphere] || gradients.magical;

    const MotifDecor = () => {
        switch (motif) {
            case 'space': return <><motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity }} className="absolute top-10 right-10 text-white/20"><Rocket size={100} /></motion.div>{[...Array(12)].map((_, i) => <motion.div key={i} className="absolute text-white" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}><Star size={Math.random() * 4 + 2} /></motion.div>)}</>;
            case 'forest': return <><motion.div className="absolute bottom-0 left-0 text-emerald-200/30"><Trees size={250} /></motion.div>{[...Array(8)].map((_, i) => <motion.div key={i} className="absolute text-yellow-100" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: Math.random() * 4 + 3, repeat: Infinity }}><Sparkles size={8} /></motion.div>)}</>;
            case 'ocean': return <><motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute bottom-10 right-10 text-cyan-200/30"><Anchor size={120} /></motion.div>{[...Array(8)].map((_, i) => <motion.div key={i} className="absolute bg-cyan-200/20 rounded-full" style={{ width: Math.random() * 15 + 8, height: Math.random() * 15 + 8, bottom: -30, left: `${Math.random() * 100}%` }} animate={{ bottom: '110%' }} transition={{ duration: Math.random() * 8 + 4, repeat: Infinity }} />)}</>;
            case 'castle': return <motion.div className="absolute bottom-5 left-10 text-amber-200/30"><Crown size={100} /></motion.div>;
            case 'cave': return <motion.div className="absolute top-10 right-10 text-purple-200/20"><Mountain size={140} /></motion.div>;
            case 'volcano': return <motion.div className="absolute bottom-0 right-0 text-red-300/30"><Flame size={150} /></motion.div>;
            case 'sky': return <><motion.div className="absolute top-10 left-10 text-white/25"><Cloud size={140} /></motion.div><motion.div className="absolute top-20 right-20 text-yellow-200/30"><Sun size={80} /></motion.div></>;
            case 'candy': return <><motion.div className="absolute bottom-10 left-10 text-pink-200/40 rotate-12"><ShoppingBag size={100} /></motion.div>{[...Array(6)].map((_, i) => <motion.div key={i} className="absolute text-4xl" style={{ top: `${Math.random() * 80}%`, left: `${Math.random() * 90}%` }} animate={{ y: [0, -20, 0], rotate: [0, 20, -20, 0] }} transition={{ duration: 4 + i, repeat: Infinity }}>🍭</motion.div>)}</>;
            default: return <motion.div className="absolute top-10 left-10 text-white/20"><Cloud size={120} /></motion.div>;
        }
    };

    return (
        <div className={`absolute inset-0 bg-gradient-to-br ${bg} overflow-hidden transition-all duration-1000`}>
            <FloatingParticles color={pColors[atmosphere] || '#e879f9'} count={18} />
            <MotifDecor />
            <div className="absolute inset-0 bg-[radial-gradient(transparent_40%,_rgba(0,0,0,0.2)_100%)] pointer-events-none" />
        </div>
    );
};

// ─────────── THEME DEFINITIONS ───────────
const THEMES = {
    SPACE: {
        id: 'SPACE',
        nameEn: 'Galactic Voyage',
        nameEs: 'Viaje Galáctico',
        description: 'Explore unknown planets and stars',
        emoji: '🚀',
        sceneEmoji: '🪐',
        gradient: 'from-indigo-500 via-purple-500 to-pink-500',
        border: 'border-indigo-300',
        bg: 'bg-indigo-900',
        initialPrompt: "You are the captain of the Starship Nova. You have just arrived at a mysterious purple nebula."
    },
    FANTASY: {
        id: 'FANTASY',
        nameEn: 'Magic Forest',
        nameEs: 'Bosque Mágico',
        description: 'Magic, fairies and ancient secrets',
        emoji: '🧚',
        sceneEmoji: '🌳',
        gradient: 'from-emerald-400 via-teal-400 to-cyan-400',
        border: 'border-emerald-300',
        bg: 'bg-emerald-800',
        initialPrompt: "You are a young guardian of the enchanted forest. A tiny glowing fairy asks for your help."
    },
    OCEAN: {
        id: 'OCEAN',
        nameEn: 'Ocean Mystery',
        nameEs: 'Misterio del Mar',
        description: 'Underwater cities and sea creatures',
        emoji: '🌊',
        sceneEmoji: '🐠',
        gradient: 'from-cyan-400 via-blue-400 to-indigo-400',
        border: 'border-cyan-300',
        bg: 'bg-cyan-800',
        initialPrompt: "You are an explorer in a high-tech submarine. You see lights in the dark ocean."
    },
    DINO: {
        id: 'DINO',
        nameEn: 'Dino World',
        nameEs: 'Mundo Dino',
        description: 'Travel to the past and meet giant dinosaurs',
        emoji: '🦖',
        sceneEmoji: '🌋',
        gradient: 'from-orange-500 via-amber-500 to-yellow-500',
        border: 'border-orange-300',
        bg: 'bg-orange-900',
        initialPrompt: "You travel in a time machine to the land of dinosaurs. A giant T-Rex is eating leaves."
    },
    CANDY: {
        id: 'CANDY',
        nameEn: 'Candy Kingdom',
        nameEs: 'Reino Dulce',
        description: 'A world made of candy and chocolate',
        emoji: '🍭',
        sceneEmoji: '🍦',
        gradient: 'from-pink-400 via-rose-300 to-purple-300',
        border: 'border-pink-200',
        bg: 'bg-pink-100',
        initialPrompt: "You wake up in a field of cotton candy clouds. A gingerbread man invites you to a chocolate castle."
    },
    MONSTERS: {
        id: 'MONSTERS',
        nameEn: 'Monster Party',
        nameEs: 'Fiesta Monster',
        description: 'Funny monsters and cool jokes',
        emoji: '👾',
        sceneEmoji: '🎈',
        gradient: 'from-purple-500 via-indigo-400 to-blue-400',
        border: 'border-purple-300',
        bg: 'bg-purple-900',
        initialPrompt: "You are invited to the birthday party of a three-eyed monster. It is a very loud and colorful party."
    },
    PIRATES: {
        id: 'PIRATES',
        nameEn: 'Pirate Treasure',
        nameEs: 'Tesoro Pirata',
        description: 'Sail the seas in search of gold',
        emoji: '🏴‍☠️',
        sceneEmoji: '🦜',
        gradient: 'from-blue-600 via-sky-500 to-blue-400',
        border: 'border-blue-400',
        bg: 'bg-blue-900',
        initialPrompt: "You are the leader of a pirate ship. You have a map that leads to a secret island with gold."
    },
    DRAGONS: {
        id: 'DRAGONS',
        nameEn: 'Dragon Mountain',
        nameEs: 'Montaña Dragón',
        description: 'Fly with dragons and find magic',
        emoji: '🐲',
        sceneEmoji: '🏰',
        gradient: 'from-red-600 via-orange-500 to-amber-500',
        border: 'border-red-400',
        bg: 'bg-red-900',
        initialPrompt: "You climb a very high mountain. A friendly red dragon wants to fly with you."
    },
    SAFARI: {
        id: 'SAFARI',
        nameEn: 'Great Safari',
        nameEs: 'Gran Safari',
        description: 'Adventure with jungle animals',
        emoji: '🦁',
        sceneEmoji: '🦒',
        gradient: 'from-green-600 via-lime-500 to-yellow-400',
        border: 'border-green-400',
        bg: 'bg-green-900',
        initialPrompt: "You are on a safari in Africa. You use your binoculars to see a family of lions."
    },
    HEROES: {
        id: 'HEROES',
        nameEn: 'Hero Academy',
        nameEs: 'Escuela de Héroes',
        description: 'Learn to fly and save the world!',
        emoji: '🦸',
        sceneEmoji: '⚡',
        gradient: 'from-blue-500 via-red-500 to-yellow-500',
        border: 'border-blue-300',
        bg: 'bg-blue-800',
        initialPrompt: "You are a student at the Hero Academy. Today you find your super power."
    }
};

// ─────────── MAIN COMPONENT ───────────
const StoryLegend: React.FC = () => {
    const { playClick, playSuccess } = useNovaSound();
    const { recordCorrectAnswer } = useGamification();

    const [started, setStarted] = useState(false);
    const [theme, setTheme] = useState<keyof typeof THEMES | null>(null);
    const [scene, setScene] = useState<StoryScene | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [learnedWords, setLearnedWords] = useState<VocabWord[]>([]);
    const [activeVocab, setActiveVocab] = useState<string | null>(null);
    const [showWordList, setShowWordList] = useState(false);
    const [sceneCount, setSceneCount] = useState(0);


    const generateScene = useCallback(async (choiceText?: string, themeOverride?: keyof typeof THEMES) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (process as any).env?.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            alert("Falta la API Key de Gemini. Configure VITE_GEMINI_API_KEY en .env");
            return;
        }

        const effectiveTheme = themeOverride || theme;
        if (!effectiveTheme) return;

        setLoading(true);
        setActiveVocab(null);

        try {
            const systemPrompt = `
You are a master storyteller for children (ages 6-8) learning English.
Use CEFR Level A1/A2 English. SIMPLE words only.

Theme: ${THEMES[effectiveTheme].nameEn}
Story so far: ${history.slice(-6).join(" -> ")}
User chose: ${choiceText || "Start the story."}

RULES:
1. "textEn": Write 2-3 SHORT sentences. Max 8 words each.
   CRITICAL: WRAP ALL KEY WORDS (nouns, adjectives, verbs) in asterisks like *this*.
   Example: "The *red* *dragon* is *happy*."
   Only wrap single words.
2. "textEs": Spanish translation.
3. "vocab": Array of objects for each starred word.
   - "word": the English word
   - "translation": Spanish translation
   - "definition": Simple 1-sentence explanation in Spanish for a child.
   - "emoji": A clear emoji for this word.
4. "visualMotif": [space, forest, ocean, castle, cave, volcano, sky, candy]
5. "atmosphere": [magical, tense, peaceful, heroic, scary, happy, mysterious]
6. "entity": Character/Object
7. "emotion": [joy, sadness, fear, courage, curiosity, wonder]
8. "sceneEmoji": 2-3 emojis.
9. "choices": Exactly 3 choices.
   - "textEn": Short English choice (3-5 words)
   - "textEs": Spanish translation
   - "emoji": One emoji

Output ONLY valid JSON.`;

            const responseObj = await callChatApi([{ role: "system", content: systemPrompt }], "gemini-1.5-flash", true);
            const response = JSON.parse(responseObj.choices[0].message.content);

            if (response && response.textEn) {
                const newScene: StoryScene = {
                    id: Date.now().toString(),
                    textEn: response.textEn || '',
                    textEs: (response.textEs || '').replace(/\*/g, ''),
                    visualMotif: response.visualMotif || 'forest',
                    atmosphere: response.atmosphere || 'magical',
                    entity: response.entity || 'star',
                    emotion: response.emotion || 'wonder',
                    sceneEmoji: response.sceneEmoji || '✨',
                    vocab: (response.vocab || []).map((v: any) => ({
                        word: v.word || '',
                        translation: v.translation || '',
                        definition: v.definition || `"${v.word}" significa "${v.translation}" en español.`,
                        emoji: v.emoji || '📖',
                    })),
                    choices: (response.choices || []).map((c: any, i: number) => ({
                        id: c.id || `c${i}`,
                        textEn: c.textEn || 'Continue adventure',
                        textEs: c.textEs || 'Continuar aventura',
                        emoji: c.emoji || '✨'
                    })).slice(0, 3),
                };
                setScene(newScene);
                setSceneCount(prev => prev + 1);
                setHistory(prev => [...prev, choiceText || "Started", newScene.textEn].slice(-12));

                if (newScene.vocab?.length) {
                    setLearnedWords(prev => {
                        const existing = new Set(prev.map(w => w.word.toLowerCase()));
                        const newWords = newScene.vocab.filter(w => !existing.has(w.word.toLowerCase()));
                        if (newWords.length > 0) recordCorrectAnswer();
                        return [...prev, ...newWords];
                    });
                }

                const cleanText = newScene.textEn.replace(/\*/g, '');
                edgeTTS.speak(cleanText, 'rachelle');
            }
        } catch (e) {
            console.error("AI Story Error:", e);
        } finally {
            setLoading(false);
        }
    }, [theme, history, recordCorrectAnswer]);

    const handleThemeSelect = (key: keyof typeof THEMES) => {
        playClick();
        setTheme(key);
        setStarted(true);
        setHistory([THEMES[key].initialPrompt]);
        setLearnedWords([]);
        setSceneCount(0);
        generateScene(THEMES[key].initialPrompt, key);
    };

    const handleChoice = (choice: StoryChoice) => {
        playClick();
        playSuccess();
        generateScene(choice.textEn);
    };

    const handleReadEnglish = () => {
        if (scene) edgeTTS.speak(scene.textEn.replace(/\*/g, ''), 'rachelle');
    };

    const handleReadSpanish = () => {
        if (scene) edgeTTS.speak(scene.textEs, 'lina');
    };

    const WORD_COLORS = [
        { bg: '#fce7f3', border: '#f472b6', text: '#be185d', ring: '#db2777' },
        { bg: '#dbeafe', border: '#60a5fa', text: '#1d4ed8', ring: '#2563eb' },
        { bg: '#dcfce7', border: '#4ade80', text: '#15803d', ring: '#16a34a' },
        { bg: '#ffedd5', border: '#fb923c', text: '#c2410c', ring: '#ea580c' },
        { bg: '#f3e8ff', border: '#a78bfa', text: '#7e22ce', ring: '#9333ea' },
    ];

    const getWordStyle = (word: string, isActive: boolean) => {
        const colorIndex = word.length % WORD_COLORS.length;
        const colorSet = WORD_COLORS[colorIndex];
        return {
            className: `inline-block cursor-pointer font-black px-2 py-0.5 mx-0.5 rounded-lg border-b-4 transition-all ${isActive ? `ring-2 ring-offset-1` : 'hover:-translate-y-1 hover:brightness-95'}`,
            style: {
                backgroundColor: colorSet.bg,
                borderColor: colorSet.border,
                color: colorSet.text,
                '--tw-ring-color': colorSet.ring,
            } as React.CSSProperties
        };
    };

    const renderEnglishText = (text: string, vocab: VocabWord[]) => {
        const parts = text.split('*');
        return parts.map((chunk, index) => {
            if (index % 2 === 0) return <span key={index}>{chunk}</span>;
            const subWords = chunk.split(' ').filter(s => s.trim().length > 0);
            return (
                <span key={index} className="inline-flex flex-wrap items-baseline">
                    {subWords.map((subWord, subIndex) => {
                        const cleanWord = subWord.replace(/[^a-zA-Z]/g, '');
                        const vocabEntry = vocab.find(v => v.word.toLowerCase() === cleanWord.toLowerCase());
                        const isActive = activeVocab === cleanWord;
                        const visualStyle = getWordStyle(cleanWord, isActive);

                        return (
                            <motion.span
                                key={`${index}-${subIndex}`}
                                className={visualStyle.className}
                                style={visualStyle.style}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isActive) {
                                        setActiveVocab(null);
                                    } else {
                                        setActiveVocab(cleanWord);
                                        if (vocabEntry) {
                                            edgeTTS.speak(`${vocabEntry.word} significa ${vocabEntry.translation}. ${vocabEntry.definition}`, 'lina');
                                        } else {
                                            edgeTTS.speak(cleanWord, 'rachelle');
                                        }
                                    }
                                }}
                            >
                                {vocabEntry?.emoji && <span className="mr-1">{vocabEntry.emoji}</span>}
                                {subWord}
                            </motion.span>
                        );
                    })}
                </span>
            );
        });
    };

    const activeVocabEntry = scene?.vocab.find(v => v.word.toLowerCase() === activeVocab?.toLowerCase());

    return (
        <div className="w-full h-full relative overflow-hidden font-sans select-none bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
            <AnimatePresence>
                {!started && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 z-50 flex flex-col items-center p-6 bg-gradient-to-br from-amber-100 via-orange-50 to-pink-100 overflow-y-auto custom-scrollbar"
                    >
                        <FloatingParticles color="#fbbf24" count={20} />
                        <motion.div
                            initial={{ y: -30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="text-center mt-12 mb-10 relative z-10 shrink-0"
                        >
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="inline-block mb-3"
                            >
                                <span className="text-7xl md:text-8xl drop-shadow-xl">📖</span>
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-pink-500 tracking-tight">
                                Magic Book
                            </h1>
                            <p className="text-lg text-amber-700/70 font-medium max-w-lg mx-auto mt-2 italic">
                                Choose your adventure and learn English! ✨
                            </p>
                        </motion.div>

                        <div className="flex gap-6 flex-wrap justify-center relative z-10 max-w-7xl px-4 pb-20">
                            {Object.entries(THEMES).map(([key, t], i) => (
                                <motion.button
                                    key={key}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 + i * 0.03, type: "spring", bounce: 0.4 }}
                                    whileHover={{ scale: 1.06, y: -8 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleThemeSelect(key as any)}
                                    className={`w-64 rounded-[2.5rem] bg-gradient-to-br ${t.gradient} p-7 relative overflow-hidden border-4 ${t.border} shadow-2xl transition-all h-[340px] flex flex-col`}
                                >
                                    <div className="relative z-10 flex flex-col items-center text-center gap-4 py-2 flex-1">
                                        <div className="w-20 h-20 bg-white/25 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-inner shrink-0">
                                            <span className="text-5xl filter drop-shadow-md">{t.emoji}</span>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="text-xl font-black text-white leading-tight drop-shadow-md mb-1 uppercase tracking-tight">{t.nameEn}</h3>
                                            <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-2 italic">{t.nameEs}</p>
                                            <p className="text-white/80 text-xs font-bold leading-tight line-clamp-2 px-2">{t.description}</p>
                                        </div>
                                        <div className="mt-auto w-full py-3 bg-white text-indigo-950 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-50 transition-colors shrink-0">
                                            Read now! →
                                        </div>
                                    </div>
                                    <FloatingParticles color="rgba(255,255,255,0.4)" count={4} />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {started && (
                <div className="absolute inset-0 flex flex-col overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        {scene ? (
                            <VisualBackground atmosphere={scene.atmosphere} motif={scene.visualMotif} />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
                        )}
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="p-3 flex justify-between items-center">
                            <button
                                onClick={() => { setStarted(false); setScene(null); }}
                                className="flex items-center gap-2 bg-white/90 hover:bg-white text-slate-700 px-3 py-2 rounded-full shadow-lg transition-all hover:scale-105"
                            >
                                <ArrowLeft size={16} className="text-orange-500" />
                                <span className="text-xs font-black uppercase tracking-wider">Volver</span>
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1.5 bg-white/90 rounded-full shadow-lg flex items-center gap-2">
                                    <BookOpen size={13} className="text-amber-500" />
                                    <span className="text-xs font-black text-slate-700">Página {sceneCount}</span>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowWordList(!showWordList)}
                                    className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full shadow-lg flex items-center gap-2 border-2 border-white"
                                >
                                    <Award size={13} className="text-white" />
                                    <span className="text-xs font-black text-white">{learnedWords.length} words</span>
                                </motion.button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {showWordList && (
                                <motion.div
                                    initial={{ x: 300, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 300, opacity: 0 }}
                                    className="absolute top-14 right-3 z-50 w-72 max-h-[55vh] bg-white rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden"
                                >
                                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-3 text-white">
                                        <h3 className="font-black text-base flex items-center gap-2"><Award size={18} /> Mis Palabras Nuevas</h3>
                                        <p className="text-[10px] text-white/80">¡Toca una palabra para escucharla!</p>
                                    </div>
                                    <div className="p-2 overflow-y-auto max-h-[42vh] space-y-1.5 custom-scrollbar">
                                        {learnedWords.length === 0 ? (
                                            <p className="text-center text-slate-400 text-sm py-6">Las palabras aparecerán aquí ✨</p>
                                        ) : (
                                            learnedWords.map((w, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    onClick={() => edgeTTS.speak(`${w.word} significa ${w.translation}`, 'lina')}
                                                    className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl hover:bg-amber-100 cursor-pointer transition-colors border border-amber-100"
                                                >
                                                    <span className="text-xl">{w.emoji}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-slate-800 text-sm">{w.word}</p>
                                                        <p className="text-amber-600 text-[11px] truncate">{w.translation}</p>
                                                    </div>
                                                    <Volume2 size={12} className="text-amber-400 shrink-0" />
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex-1 flex items-center justify-center px-3 pb-3 overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl text-center border-4 border-amber-100 max-w-sm"
                                    >
                                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                            <span className="text-7xl block mb-4">📖</span>
                                        </motion.div>
                                        <p className="text-amber-600 font-black text-lg animate-pulse">✨ Escribiendo tu historia...</p>
                                    </motion.div>
                                ) : scene && (
                                    <motion.div
                                        key={scene.id}
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -40 }}
                                        transition={{ type: "spring", bounce: 0.3 }}
                                        className="w-full max-w-3xl space-y-4"
                                    >
                                        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden border-4 border-white">
                                            <div className="h-2 bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300" />
                                            <div className="p-6 md:p-8">
                                                <div className="flex justify-center mb-5">
                                                    <SceneIllustration
                                                        sceneEmoji={scene.sceneEmoji}
                                                        entity={scene.entity}
                                                        emotion={scene.emotion}
                                                        atmosphere={scene.atmosphere}
                                                    />
                                                </div>

                                                <p className="text-2xl md:text-3xl font-black text-slate-800 leading-snug tracking-tight text-center mb-2">
                                                    {renderEnglishText(scene.textEn, scene.vocab)}
                                                </p>

                                                <AnimatePresence>
                                                    {activeVocabEntry && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden mb-3"
                                                        >
                                                            <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-200 flex items-center gap-4 shadow-sm">
                                                                <span className="text-4xl shrink-0">{activeVocabEntry.emoji || '📖'}</span>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                        <span className="text-lg font-black text-amber-800">{activeVocabEntry.word}</span>
                                                                        <span className="text-sm font-bold text-amber-500">= {activeVocabEntry.translation}</span>
                                                                    </div>
                                                                    <p className="text-sm text-slate-600 leading-snug">{activeVocabEntry.definition}</p>
                                                                </div>
                                                                <div className="flex flex-col gap-1.5 shrink-0">
                                                                    <button
                                                                        onClick={() => edgeTTS.speak(activeVocabEntry.word, 'rachelle')}
                                                                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-[11px] font-bold hover:bg-blue-600 transition-colors flex items-center gap-1"
                                                                    >
                                                                        <Volume2 size={11} /> 🇺🇸
                                                                    </button>
                                                                    <button
                                                                        onClick={() => edgeTTS.speak(`${activeVocabEntry.word} significa ${activeVocabEntry.translation}. ${activeVocabEntry.definition}`, 'lina')}
                                                                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-[11px] font-bold hover:bg-green-600 transition-colors flex items-center gap-1"
                                                                    >
                                                                        <Volume2 size={11} /> 🇲🇽
                                                                    </button>
                                                                </div>
                                                                <button onClick={() => setActiveVocab(null)} className="text-slate-300 hover:text-slate-500 text-xl font-bold shrink-0">×</button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-100 mb-4">
                                                    <p className="text-base md:text-lg text-slate-600 font-medium italic leading-relaxed">
                                                        {scene.textEs}
                                                    </p>
                                                </div>

                                                <div className="flex gap-3 justify-center">
                                                    <button onClick={handleReadEnglish} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-md transition-all active:scale-95">
                                                        <Volume2 size={15} /> Listen
                                                    </button>
                                                    <button onClick={handleReadSpanish} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors shadow-md transition-all active:scale-95">
                                                        <Volume2 size={15} /> Traducción
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-center py-2"
                                        >
                                            <span className="inline-block bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40 shadow-sm">
                                                <span className="text-sm font-black text-slate-700 mr-2">❓ What happens next?</span>
                                                <span className="text-[11px] font-bold text-slate-500 italic">¿Qué pasa después?</span>
                                            </span>
                                        </motion.div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pb-6">
                                            {scene.choices.map((choice, i) => (
                                                <motion.button
                                                    key={choice.id}
                                                    initial={{ opacity: 0, y: 25 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 + i * 0.05, type: "spring" }}
                                                    whileHover={{ scale: 1.04, y: -3 }}
                                                    whileTap={{ scale: 0.96 }}
                                                    onClick={() => handleChoice(choice)}
                                                    className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 text-left shadow-xl border-b-4 border-amber-300 hover:border-amber-400 transition-all flex items-start gap-2"
                                                >
                                                    <span className="text-2xl shrink-0">{choice.emoji}</span>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-black text-slate-800 leading-snug">{choice.textEn}</h4>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">{choice.textEs}</p>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default StoryLegend;
