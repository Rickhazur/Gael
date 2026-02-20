// components/Gamification/HallOfFame.tsx
// Super Salón de la Fama: logros, medallas, mascota, héroes y recorrido

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Flame, Award, CheckCircle2, Target, Crown, Medal, Sparkles, Activity, Lock, ChevronRight, Egg } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLearningProgress, LearningProgressData } from '../../services/learningProgress';
import { AvatarDisplay } from './AvatarDisplay';
import { ViewState } from '../../types';
import { LinaAvatar } from '../MathMaestro/tutor/LinaAvatar';
import { useGamification } from '@/context/GamificationContext';
import { usePetContext } from '@/context/PetContext';

interface HallOfFameProps {
    userId: string;
    userName: string;
    language: 'es' | 'en';
    onNavigate?: (view: ViewState) => void;
    /** Show adopt pet section when user has no pet. Only true when used from Math context. */
    showAdoptSection?: boolean;
}

const defaultEmptyStats = (userId: string, coins: number, xp: number): LearningProgressData => ({
    user_id: userId,
    last_completed_date: null,
    quests_by_difficulty: { easy: 0, medium: 0, hard: 0 },
    total_xp: xp,
    total_quests_completed: 0,
    current_streak: 0,
    longest_streak: 0,
    accuracy_rate: 0,
    quests_by_category: { math: 0, science: 0, language: 0, social_studies: 0 },
    unlocked_badges: [],
    unlocked_trophies: [],
    total_coins: coins
});

export function HallOfFame({ userId, userName, language, onNavigate, showAdoptSection = false }: HallOfFameProps) {
    const { coins, xp } = useGamification();
    const petContext = usePetContext();
    const [stats, setStats] = useState<LearningProgressData | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'worlds' | 'heroes'>('overview');

    // DEMO DATA MOCK
    const demoStats: LearningProgressData = {
        user_id: 'demo-user-sofia',
        last_completed_date: new Date().toISOString(),
        quests_by_difficulty: { easy: 8, medium: 3, hard: 1 },
        total_xp: 2500,
        total_quests_completed: 12,
        current_streak: 3,
        longest_streak: 5,
        accuracy_rate: 98,
        quests_by_category: {
            math: 15,
            science: 10,
            language: 20,
            social_studies: 5
        },
        unlocked_badges: ['first-quest', 'math-genius'],
        unlocked_trophies: ['trophy-m-g1-1'],
        total_coins: 150
    };

    const safeName = (userName || '').toLowerCase();
    const isDemoUser = (typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true') ||
        safeName.includes('sofia');

    const [isDemoSpeaking, setIsDemoSpeaking] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            if (isDemoUser) {
                setStats(demoStats);
                return;
            }
            if (userId) {
                try {
                    const data = await getLearningProgress(userId);
                    setStats(data ?? defaultEmptyStats(userId, coins, xp));
                } catch (e) {
                    console.error(e);
                    setStats(defaultEmptyStats(userId, coins, xp));
                }
            } else {
                setStats(defaultEmptyStats('guest', coins, xp));
            }
        };
        loadStats();
    }, [userId, isDemoUser, coins, xp]);

    // Demo Voice Listener
    useEffect(() => {
        const startSpeaking = (e: any) => {
            // Only animate Lina if she is explicitly the one speaking
            // The Presenter/Narrator voice should NOT trigger Lina's mouth
            if (e.detail?.voice === 'lina') {
                setIsDemoSpeaking(true);
            }
        };
        const stopSpeaking = () => setIsDemoSpeaking(false);

        window.addEventListener('nova-demo-voice', startSpeaking);
        window.addEventListener('nova-demo-voice-end', stopSpeaking);
        return () => {
            window.removeEventListener('nova-demo-voice', startSpeaking);
            window.removeEventListener('nova-demo-voice-end', stopSpeaking);
        };
    }, []);

    const badges = [
        {
            id: 'first-quest',
            name: { es: 'Primer Paso', en: 'First Step' },
            description: { es: 'Completa tu primera misión', en: 'Complete your first quest' },
            icon: '🎯',
            rarity: 'common'
        },
        {
            id: 'quest-master',
            name: { es: 'Maestro de Misiones', en: 'Quest Master' },
            description: { es: 'Completa 10 misiones', en: 'Complete 10 quests' },
            icon: '🏆',
            rarity: 'rare'
        },
        {
            id: 'math-genius',
            name: { es: 'Genio Matemático', en: 'Math Genius' },
            description: { es: 'Completa 5 misiones de matemáticas', en: 'Complete 5 math quests' },
            icon: '🧮',
            rarity: 'rare'
        },
        {
            id: 'science-explorer',
            name: { es: 'Explorador Científico', en: 'Science Explorer' },
            description: { es: 'Completa 5 misiones de ciencias', en: 'Complete 5 science quests' },
            icon: '🔬',
            rarity: 'rare'
        },
        {
            id: 'streak-3',
            name: { es: 'Racha de Fuego', en: 'Fire Streak' },
            description: { es: 'Mantén una racha de 3 días', en: 'Maintain a 3-day streak' },
            icon: '🔥',
            rarity: 'uncommon'
        },
        {
            id: 'streak-7',
            name: { es: 'Semana Perfecta', en: 'Perfect Week' },
            description: { es: 'Mantén una racha de 7 días', en: 'Maintain a 7-day streak' },
            icon: '⭐',
            rarity: 'epic'
        },
        {
            id: 'hard-mode',
            name: { es: 'Modo Difícil', en: 'Hard Mode' },
            description: { es: 'Completa 3 misiones difíciles', en: 'Complete 3 hard quests' },
            icon: '💪',
            rarity: 'legendary'
        },
        {
            id: 'time-master',
            name: { es: 'Maestro del Tiempo', en: 'Master of Time' },
            description: { es: 'Domina el reloj interactivo', en: 'Master the interactive clock' },
            icon: '⏰',
            rarity: 'rare'
        },
        {
            id: 'fraction-hero',
            name: { es: 'Explorador de Partes', en: 'Fraction Explorer' },
            description: { es: 'Domina las barras de fracciones', en: 'Master the fraction bars' },
            icon: '🍰',
            rarity: 'rare'
        },
        {
            id: 'eagle-eye',
            name: { es: 'Ojo de Águila', en: 'Eagle Eye' },
            description: { es: 'Usa la cámara para que Nova vea tu trabajo', en: 'Use the camera for Nova to see your work' },
            icon: '🦅',
            rarity: 'uncommon'
        }
    ];

    const rarityStyles = {
        common: 'from-slate-100 to-slate-200 border-slate-300 text-slate-600',
        uncommon: 'from-blue-50 to-blue-100 border-blue-300 text-blue-600',
        rare: 'from-purple-50 to-purple-100 border-purple-300 text-purple-600',
        epic: 'from-pink-50 to-pink-100 border-pink-300 text-pink-600',
        legendary: 'from-amber-50 to-yellow-100 border-yellow-400 text-yellow-700 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
    };

    // Siempre mostrar salón: si no hay stats aún, usar datos por defecto con contexto (monedas/XP en vivo)
    const displayStats = stats ?? defaultEmptyStats(userId || 'guest', coins, xp);
    const liveCoins = stats ? stats.total_coins : coins;
    const liveXP = stats ? stats.total_xp : xp;

    const speakStats = () => {
        const s = displayStats;
        if (!s) return;
        const text = language === 'es'
            ? `¡Hola ${userName}! Tu nivel actual es ${Math.floor((s.total_xp || 0) / 1000) + 1}. Has completado ${s.total_quests_completed} misiones y tienes una racha de ${s.current_streak} días. ¡Sigue así, héroe!`
            : `Hello ${userName}! Your current level is ${Math.floor((s.total_xp || 0) / 1000) + 1}. You have completed ${s.total_quests_completed} quests and have a ${s.current_streak} day streak. Keep it up, hero!`;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
    };

    if (!stats && !userId) return (
        <div className="flex items-center justify-center p-20 min-h-[60vh]">
            <motion.div animate={{ opacity: [0.8, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-center">
                <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <p className="font-bold text-slate-500">{language === 'es' ? 'Cargando tu salón...' : 'Loading your hall...'}</p>
            </motion.div>
        </div>
    );

    const currentLevel = Math.floor((displayStats.total_xp || liveXP) / 1000) + 1;
    const nextLevelXP = currentLevel * 1000;
    const effectiveXP = displayStats.total_xp ?? liveXP;
    const progressToNextLevel = ((effectiveXP % 1000) / 1000) * 100;
    const isFirstTime = displayStats.total_quests_completed === 0;

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 font-fredoka animate-fade-in px-4">
            {/* Banner decorativo tipo salón */}
            <div className="relative h-2 rounded-full overflow-hidden bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]" />

            {/* Header / Hero Section - Super Salón */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-indigo-950 to-[#0F172A] rounded-[3.5rem] p-10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-amber-500/20">
                {/* LINA AVATAR FOR DEMO */}
                {isDemoUser && (
                    <div className="absolute top-0 right-0 z-50 pointer-events-none transform translate-y-4 -translate-x-4">
                        <LinaAvatar state={isDemoSpeaking ? 'speaking' : 'idle'} size={180} />
                    </div>
                )}
                {/* Estrellas / decoración de salón */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2 opacity-80">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-8 h-8 text-amber-400 fill-amber-400/40" />
                    ))}
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -ml-20 -mb-20" />
                <div className="absolute top-20 right-20 text-6xl opacity-20">🏆</div>
                <div className="absolute bottom-20 left-20 text-6xl opacity-20">⭐</div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    {/* Avatar Display with Glow */}
                    <div className="relative group">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-56 h-56 flex items-center justify-center p-6 relative"
                        >
                            <AvatarDisplay size="xl" />
                        </motion.div>

                        {/* Customize Button - Added to allow resizing/editing */}
                        {onNavigate && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onNavigate(ViewState.REWARDS)}
                                className="absolute top-0 right-0 bg-white text-indigo-600 p-3 rounded-full shadow-lg border-2 border-indigo-100 z-20 hover:bg-indigo-50"
                                title={language === 'es' ? "Editar Avatar" : "Edit Avatar"}
                            >
                                <Sparkles className="w-5 h-5" />
                            </motion.button>
                        )}

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-indigo-950 font-black px-6 py-2 rounded-2xl shadow-xl whitespace-nowrap flex items-center gap-2 border-4 border-indigo-950"
                        >
                            <Crown className="w-5 h-5 fill-indigo-950" />
                            NIVEL {currentLevel}
                        </motion.div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-md">
                                {language === 'es' ? 'Perfil Legendario' : 'Legendary Profile'}
                            </h1>
                            <button
                                onClick={speakStats}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10"
                                title={language === 'es' ? 'Escuchar mis logros' : 'Hear my achievements'}
                            >
                                <Activity className="w-6 h-6 text-yellow-400" />
                            </button>
                        </div>
                        <p className="text-2xl text-indigo-300/90 font-bold mb-4">
                            {language === 'es' ? `¡Bienvenido, ${userName}!` : `Welcome, ${userName}!`}
                        </p>
                        {isFirstTime && onNavigate && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-2xl bg-amber-400/20 border-2 border-amber-400/50">
                                <p className="text-amber-100 font-bold text-sm mb-3">
                                    {language === 'es' ? '¡Tu salón se llenará de trofeos con cada misión!' : 'Your hall will fill with trophies with every mission!'}
                                </p>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={() => onNavigate(ViewState.TASK_CONTROL)} className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-indigo-950 font-black rounded-xl shadow-lg">
                                    {language === 'es' ? 'Ir a mis misiones' : 'Go to my missions'} <ChevronRight className="w-5 h-5" />
                                </motion.button>
                            </motion.div>
                        )}

                        {/* XP Progress Bar */}
                        <div className="max-w-md space-y-2">
                            <div className="flex justify-between text-sm font-black text-indigo-300 uppercase tracking-widest">
                                <span>{effectiveXP} XP</span>
                                <span>{nextLevelXP} XP</span>
                            </div>
                            <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/10 p-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressToNextLevel}%` }}
                                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-[length:200%_100%] rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </div>
                            <p className="text-xs text-center text-white/40 font-bold">
                                {language === 'es' ? `Faltan ${nextLevelXP - effectiveXP} XP para subir de nivel` : `${nextLevelXP - effectiveXP} XP to next level`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={cn(
                        "px-8 py-3 rounded-2xl font-black transition-all shadow-lg border-2",
                        activeTab === 'overview' ? "bg-indigo-600 text-white border-indigo-400 translate-y-[-2px]" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                    )}
                >
                    📊 {language === 'es' ? 'Resumen' : 'Overview'}
                </button>
                <button
                    onClick={() => setActiveTab('badges')}
                    className={cn(
                        "px-8 py-3 rounded-2xl font-black transition-all shadow-lg border-2",
                        activeTab === 'badges' ? "bg-amber-500 text-white border-amber-400 translate-y-[-2px]" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                    )}
                >
                    🏅 {language === 'es' ? 'Medallas' : 'Medals'}
                </button>
                <button
                    onClick={() => setActiveTab('worlds')}
                    className={cn(
                        "px-8 py-3 rounded-2xl font-black transition-all shadow-lg border-2",
                        activeTab === 'worlds' ? "bg-emerald-600 text-white border-emerald-400 translate-y-[-2px]" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                    )}
                >
                    🏆 {language === 'es' ? 'Mundos' : 'Worlds'}
                </button>
                <button
                    onClick={() => setActiveTab('heroes')}
                    className={cn(
                        "px-8 py-3 rounded-2xl font-black transition-all shadow-lg border-2",
                        activeTab === 'heroes' ? "bg-amber-500 text-white border-amber-400 translate-y-[-2px]" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                    )}
                >
                    👑 {language === 'es' ? 'Héroes' : 'Heroes'}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-12"
                    >
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: language === 'es' ? 'Misiones' : 'Quests', value: displayStats.total_quests_completed, icon: Trophy, color: 'emerald' },
                                { label: language === 'es' ? 'Monedas' : 'Coins', value: liveCoins, icon: Sparkles, color: 'amber' },
                                { label: language === 'es' ? 'Racha 🔥' : 'Streak 🔥', value: displayStats.current_streak, icon: Flame, color: 'orange' },
                                { label: language === 'es' ? 'Precisión' : 'Accuracy', value: `${displayStats.accuracy_rate}%`, icon: Target, color: 'rose' }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-slate-100 flex flex-col items-center justify-center text-center gap-1 group"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                                        <stat.icon className={cn("w-6 h-6", `text-${stat.color}-500`)} />
                                    </div>
                                    <div className="text-3xl font-black text-slate-800">{stat.value}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Main Content Area */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Left Column: Learning Powers */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-slate-100">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-800 font-fredoka">
                                                {language === 'es' ? 'Poderes de Aprendizaje' : 'Learning Powers'}
                                            </h3>
                                            <p className="text-slate-400 font-bold text-sm">Tus puntos por completar tareas y flashcards</p>
                                        </div>
                                        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl font-black text-xs">
                                            ACTUALIZADO
                                        </div>
                                    </div>

                                    <div className="space-y-12">
                                        {[
                                            {
                                                id: 'math',
                                                label: language === 'es' ? 'Matemáticas' : 'Math',
                                                icon: '🧮',
                                                value: displayStats.quests_by_category.math,
                                                color: 'from-blue-400 to-indigo-600',
                                                glow: 'shadow-blue-500/20'
                                            },
                                            {
                                                id: 'science',
                                                label: language === 'es' ? 'Ciencias' : 'Science',
                                                icon: '🔬',
                                                value: displayStats.quests_by_category.science,
                                                color: 'from-emerald-400 to-teal-600',
                                                glow: 'shadow-emerald-500/20'
                                            },
                                            {
                                                id: 'language',
                                                label: language === 'es' ? 'Lenguaje' : 'Language',
                                                icon: '📚',
                                                value: displayStats.quests_by_category.language,
                                                color: 'from-purple-400 to-pink-600',
                                                glow: 'shadow-purple-500/20'
                                            },
                                            {
                                                id: 'social_studies',
                                                label: language === 'es' ? 'Sociales' : 'Social Studies',
                                                icon: '🌍',
                                                value: displayStats.quests_by_category.social_studies,
                                                color: 'from-orange-400 to-amber-600',
                                                glow: 'shadow-orange-500/20'
                                            }
                                        ].map((subject) => {
                                            const level = Math.floor(subject.value / 5) + 1;
                                            const progress = ((subject.value % 5) / 5) * 100;

                                            return (
                                                <div key={subject.id} className="group cursor-help">
                                                    <div className="flex justify-between items-end mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                                                                {subject.icon}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-2xl font-black text-slate-800">{subject.label}</span>
                                                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                                                        NIVEL {level}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm font-bold text-slate-400">
                                                                    {subject.value} {language === 'es' ? 'Puntos de Sabiduría' : 'Wisdom Points'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-4xl font-black text-slate-800">{Math.round(progress)}%</div>
                                                            <div className="text-[10px] font-black text-slate-400 uppercase">Progreso</div>
                                                        </div>
                                                    </div>
                                                    <div className="h-6 bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200 p-1">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.max(progress, 8)}%` }}
                                                            className={`h-full bg-gradient-to-r ${subject.color} rounded-xl shadow-lg ${subject.glow}`}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Badges & Streaks */}
                            <div className="space-y-8">
                                {/* Streaks Card */}
                                <div className="bg-gradient-to-br from-orange-400 to-red-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
                                    <Flame className="absolute -bottom-8 -right-8 w-40 h-40 opacity-20 rotate-12" />
                                    <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                                        <Flame className="w-6 h-6" />
                                        {language === 'es' ? 'Racha de Estudio' : 'Study Streak'}
                                    </h4>
                                    <div className="text-6xl font-black mb-2">{displayStats.current_streak}</div>
                                    <p className="text-orange-100 font-bold">
                                        {language === 'es' ? '¡Días seguidos aprendiendo!' : 'Days learning in a row!'}
                                    </p>
                                    <div className="mt-8 pt-6 border-t border-white/20 flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                        <span>Record: {displayStats.longest_streak} días</span>
                                        <div className="bg-white/20 px-3 py-1 rounded-full border border-white/20">
                                            {displayStats.current_streak >= 1 ? "ON FIRE 🔥" : "KEEP GOING"}
                                        </div>
                                    </div>
                                </div>

                                {/* Tu mascota - show adopt CTA only when showAdoptSection (Math context) */}
                                {petContext && (petContext.hasPet || showAdoptSection) && (
                                    <div className="bg-white rounded-[3rem] p-8 shadow-xl border-4 border-slate-100">
                                        <h4 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                                            <span className="text-2xl">🐾</span>
                                            {language === 'es' ? 'Tu mascota' : 'Your Pet'}
                                        </h4>
                                        {petContext.hasPet ? (
                                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-4xl">
                                                    {petContext.pet?.species === 'dog' ? '🐕' : petContext.pet?.species === 'cat' ? '🐈' : '🐣'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800">{petContext.pet?.name || (language === 'es' ? 'Compañero' : 'Buddy')}</p>
                                                    <p className="text-sm text-slate-500 font-bold">Nivel {petContext.levelProgress ?? 0}%</p>
                                                </div>
                                            </div>
                                        ) : showAdoptSection && (
                                            <div className="text-center p-6 bg-amber-50 rounded-2xl border-2 border-amber-200">
                                                <Egg className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                                                <p className="font-bold text-slate-600 mb-4 text-sm">
                                                    {language === 'es' ? '¡Adopta una mascota y llévala contigo!' : 'Adopt a pet and take it with you!'}
                                                </p>
                                                {onNavigate && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => onNavigate(ViewState.STORE)}
                                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white font-black rounded-xl shadow-lg mx-auto"
                                                    >
                                                        <Egg className="w-5 h-5" />
                                                        {language === 'es' ? '¡Adoptar!' : 'Adopt!'}
                                                    </motion.button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Mi recorrido / Últimos logros */}
                                <div className="bg-white rounded-[3rem] p-8 shadow-xl border-4 border-slate-100">
                                    <h4 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                                        <Trophy className="w-6 h-6 text-amber-500" />
                                        {language === 'es' ? 'Mi recorrido' : 'My Journey'}
                                    </h4>
                                    {displayStats.total_quests_completed === 0 ? (
                                        <p className="text-slate-400 font-bold text-sm text-center py-6">
                                            {language === 'es' ? 'Completa misiones para ver aquí tus últimos logros.' : 'Complete missions to see your recent achievements here.'}
                                        </p>
                                    ) : (
                                        <ul className="space-y-2">
                                            <li className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                                <span className="font-bold text-slate-700 text-sm">{displayStats.total_quests_completed} {language === 'es' ? 'misiones completadas' : 'quests completed'}</span>
                                            </li>
                                            {displayStats.unlocked_badges.length > 0 && (
                                                <li className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                                                    <Medal className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                                    <span className="font-bold text-slate-700 text-sm">{displayStats.unlocked_badges.length} {language === 'es' ? 'medallas desbloqueadas' : 'badges unlocked'}</span>
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                </div>

                                {/* Recent Badges Overlay */}
                                <div className="bg-white rounded-[3rem] p-8 shadow-xl border-4 border-slate-100">
                                    <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                        <Award className="w-6 h-6 text-purple-500" />
                                        {language === 'es' ? 'Tus Medallas' : 'Your Medals'}
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {badges.slice(0, 6).map((badge) => {
                                            const isUnlocked = displayStats.unlocked_badges.includes(badge.id);
                                            return (
                                                <div
                                                    key={badge.id}
                                                    title={badge.name[language]}
                                                    className={cn(
                                                        "aspect-square rounded-2xl flex items-center justify-center text-3xl",
                                                        isUnlocked ? "bg-slate-50 shadow-inner" : "bg-slate-100 opacity-20 scale-90"
                                                    )}
                                                >
                                                    {badge.icon}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('badges')}
                                        className="w-full mt-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 font-bold text-sm rounded-2xl transition-all"
                                    >
                                        {language === 'es' ? 'VER TODAS' : 'VIEW ALL'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : activeTab === 'badges' ? (
                    <motion.div
                        key="badges"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    >
                        {badges.map((badge) => {
                            const isUnlocked = displayStats.unlocked_badges.includes(badge.id);
                            return (
                                <motion.div
                                    key={badge.id}
                                    whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
                                    className={cn(
                                        "relative p-8 rounded-[2.5rem] border-4 transition-all flex flex-col items-center text-center",
                                        isUnlocked
                                            ? `bg-gradient-to-br ${rarityStyles[badge.rarity as keyof typeof rarityStyles]} shadow-2xl`
                                            : "bg-slate-100 border-slate-200 opacity-70"
                                    )}
                                >
                                    <div className="text-6xl mb-4 drop-shadow-lg relative">
                                        {badge.icon}
                                        {!isUnlocked && (
                                            <div className="absolute -top-2 -left-2 bg-slate-300 text-white p-1.5 rounded-full">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-black leading-tight mb-2">{badge.name[language]}</h3>
                                    <p className="text-xs font-medium opacity-80">{badge.description[language]}</p>

                                    {isUnlocked ? (
                                        <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg border-2 border-white">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-[10px] font-bold text-slate-500 uppercase">
                                            {language === 'es' ? 'Completa para desbloquear' : 'Complete to unlock'}
                                        </p>
                                    )}

                                    <div className="mt-4 px-3 py-1 rounded-full bg-black/5 text-[10px] font-black uppercase tracking-tighter">
                                        {badge.rarity}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : activeTab === 'heroes' ? (
                    <motion.div
                        key="heroes"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-12"
                    >
                        {/* Podio Héroes */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[3rem] p-10 shadow-2xl border-4 border-amber-200">
                            <h3 className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
                                <Crown className="w-8 h-8 text-amber-500" />
                                {language === 'es' ? 'Podio de Héroes' : 'Heroes Podium'}
                            </h3>
                            <p className="text-slate-500 font-bold text-sm mb-8">
                                {language === 'es' ? 'Los campeones del aprendizaje' : 'The learning champions'}
                            </p>
                            <div className="flex items-end justify-center gap-4 md:gap-8">
                                {/* 2º lugar */}
                                <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="flex flex-col items-center order-2 md:order-1">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-200 flex items-center justify-center text-3xl mb-2 border-4 border-slate-300">
                                        ?
                                    </div>
                                    <p className="text-xs font-black text-slate-400 uppercase">2º</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">{language === 'es' ? 'Próximamente' : 'Coming soon'}</p>
                                    <div className="w-24 h-24 md:w-32 md:h-24 bg-slate-200 rounded-t-2xl mt-4 border-4 border-slate-300 border-b-0" />
                                </motion.div>
                                {/* 1º lugar - TÚ */}
                                <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center order-1 md:order-2 -mt-4">
                                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl flex items-center justify-center p-2 bg-gradient-to-br from-amber-400 to-orange-500 border-4 border-amber-300 shadow-xl">
                                        <AvatarDisplay size="xl" />
                                    </div>
                                    <p className="text-sm font-black text-amber-600 uppercase mt-2">1º</p>
                                    <p className="text-sm font-black text-slate-800 truncate max-w-[120px]">{userName}</p>
                                    <div className="w-32 h-32 md:w-40 md:h-28 bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-2xl mt-4 border-4 border-amber-400 border-b-0 shadow-lg flex items-center justify-center">
                                        <Crown className="w-12 h-12 text-amber-800 fill-amber-600" />
                                    </div>
                                </motion.div>
                                {/* 3º lugar */}
                                <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center order-3">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-200 flex items-center justify-center text-3xl mb-2 border-4 border-slate-300">
                                        ?
                                    </div>
                                    <p className="text-xs font-black text-slate-400 uppercase">3º</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">{language === 'es' ? 'Próximamente' : 'Coming soon'}</p>
                                    <div className="w-24 h-24 md:w-32 md:h-20 bg-slate-200 rounded-t-2xl mt-4 border-4 border-slate-300 border-b-0" />
                                </motion.div>
                            </div>
                            <p className="text-center text-slate-500 font-bold text-sm mt-8">
                                {language === 'es' ? 'Completa misiones para subir en el ranking' : 'Complete missions to climb the leaderboard'}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="worlds"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-12"
                    >
                        {/* World Trophies Gallery */}
                        <div className="bg-white rounded-[3rem] p-10 shadow-xl border-4 border-slate-100">
                            <h3 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                <Crown className="w-8 h-8 text-yellow-500" />
                                {language === 'es' ? 'Trofeos de Aventura' : 'Adventure Trophies'}
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                                {[
                                    { id: 'm-g1-1', name: 'Censo G1', icon: '🐾' },
                                    { id: 'm-g1-2', name: 'Médico G1', icon: '🩺' },
                                    { id: 'm-g1-3', name: 'Boss G1', icon: '👑' },
                                    { id: 'm-g3-1', name: 'Energía G3', icon: '⚡' },
                                    { id: 'm-g5-1', name: 'Oxígeno G5', icon: '💨' },
                                ].map((trophy) => {
                                    const isUnlocked = displayStats.unlocked_trophies?.includes(`trophy-${trophy.id}`);
                                    return (
                                        <motion.div
                                            key={trophy.id}
                                            whileHover={isUnlocked ? { scale: 1.1, rotate: [0, -5, 5, 0] } : {}}
                                            className={cn(
                                                "relative aspect-square rounded-[2rem] flex flex-col items-center justify-center border-4 transition-all overflow-hidden p-4",
                                                isUnlocked
                                                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-200 shadow-xl"
                                                    : "bg-slate-100 border-slate-200 opacity-40"
                                            )}
                                        >
                                            <div className="text-5xl mb-2 filter drop-shadow-md">
                                                {isUnlocked ? trophy.icon : '❓'}
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest text-center leading-tight",
                                                isUnlocked ? "text-white" : "text-slate-400"
                                            )}>
                                                {isUnlocked ? trophy.name : 'Bloqueado'}
                                            </span>

                                            {/* Sparkle Effect for Unlocked */}
                                            {isUnlocked && (
                                                <motion.div
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className="absolute inset-0 bg-white/20 pointer-events-none"
                                                />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
