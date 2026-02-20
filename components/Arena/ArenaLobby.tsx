import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, Gamepad2, Skull, Sparkles, MessageCircle, Crown, Swords, X, Clock, CheckCircle2, PlayCircle, Lightbulb, BookOpen, TrendingUp, Waves, ArrowLeft, Globe, Scale, ChevronRight, ShoppingBag, Fingerprint, ShieldCheck, LockKeyholeOpen } from 'lucide-react';
import { useDemoTour } from '@/context/DemoTourContext';
import { useNovaSound } from '@/hooks/useNovaSound';
import { useGamification } from '../../context/GamificationContext';
import { useAvatar } from '@/context/AvatarContext';
import { AvatarDisplay } from '@/components/Gamification/AvatarDisplay';
import { AvatarShop } from '@/components/Gamification/AvatarShop';
import { mockArenaPlayers, getDailyQuests, ArenaQuest } from '../../data/arenaMockData';
import { fetchArenaQuests, fetchUserQuestProgress, completeQuest } from '../../services/supabase';
import { Language, GradeLevel, ViewState } from '../../types';
import { cn } from '@/lib/utils';
import { PedagogicalQuest } from './PedagogicalQuest';
import { pedagogicalQuests, getPedagogicalQuestsByGrade, type PedagogicalQuestData } from '../../data/pedagogicalQuests';
import { saberPrepQuests } from '../../data/saberPrepData';
import { recordQuestCompletion } from '../../services/learningProgress';
import { LearningProgress } from './LearningProgress';
import { usePresence } from '../../hooks/usePresence';
import { supabase } from '@/services/supabase';
import { PetPanel } from '../Gamification/PetPanel';
import { notifyArenaInteraction } from '@/services/notifications';
import { toast } from 'sonner';
import { AdventureArena } from './AdventureArena';
import { MathDuel } from './MathDuel';
import { MetricsDashboard } from '../Gamification/MetricsDashboard';

interface ArenaLobbyProps {
    language: Language;
    grade: GradeLevel;
    userId?: string;
    onNavigate?: (view: ViewState) => void;
}

export function ArenaLobby({ language, grade, userId, onNavigate }: ArenaLobbyProps) {
    // Gamification & Tabs
    const { xp, coins, addCoins, addXP } = useGamification();
    const { playPurchase, playStoreOpen, playClick } = useNovaSound();

    // DEMO TOUR INTERCEPTION
    const { tourState, getCurrentStepData } = useDemoTour();
    const currentStep = getCurrentStepData();
    const isGlobalMissionsMode = currentStep?.autoData?.showGlobalMissions;

    const [activeTab, setActiveTab] = useState<'lobby' | 'quests' | 'leaderboard' | 'shop' | 'pets'>(() =>
        isGlobalMissionsMode ? 'quests' : 'lobby'
    );

    // Entrance State for Demo
    const [hasEntered, setHasEntered] = useState(() => {
        // Only if it's the demo step with door
        return !(tourState.isActive && currentStep?.autoData?.openDoor);
    });
    const [isOpening, setIsOpening] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Quests State
    const [quests, setQuests] = useState<ArenaQuest[]>([]);
    const [isLoadingQuests, setIsLoadingQuests] = useState(true);
    const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([]);

    // Fetch Quests from Supabase (with fallback to mock)
    useEffect(() => {
        const loadQuests = async () => {
            setIsLoadingQuests(true);
            try {
                // 1. Fetch Quests
                const dbQuests = await fetchArenaQuests(grade);

                const mappedSaberQuests = saberPrepQuests.map(q => ({
                    ...q,
                    description: q.learningObjective,
                    duration: 10,
                    minPlayers: 1,
                    maxPlayers: 1,
                    minGrade: q.grade,
                    maxGrade: q.grade,
                    isSaberPrep: true
                }));

                if (dbQuests && dbQuests.length > 0) {
                    setQuests([...dbQuests, ...mappedSaberQuests] as any);
                } else {
                    // Fallback to mock data if DB is empty
                    console.log('Using mock quests fallback');
                    setQuests([...getDailyQuests(grade), ...mappedSaberQuests] as any);
                }

                // 2. Fetch Progress
                if (userId) {
                    const completed = await fetchUserQuestProgress(userId);
                    setCompletedQuestIds(completed);
                }
            } catch (error) {
                console.error('Error loading arena:', error);
                setQuests(getDailyQuests(grade));
            } finally {
                setIsLoadingQuests(false);
            }
        };

        loadQuests();
    }, [grade, userId]);

    // 🚀 DEMO TOUR AUTO-ENTRANCE
    useEffect(() => {
        const isDemo = localStorage.getItem('nova_demo_mode') === 'true';
        const openDoor = currentStep?.autoData?.openDoor;
        if (isDemo && openDoor && !hasEntered && !isOpening) {
            const timer = setTimeout(() => {
                handleEnter();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [hasEntered, isOpening, currentStep]);

    // 🛍️ DEMO: asegurar gafas
    useEffect(() => {
        const openDoor = currentStep?.autoData?.openDoor;
        if (!openDoor || !hasEntered) return;

        // Equipar gafas en el demo si no las tiene (por seguridad)
        const t = setTimeout(() => {
            window.dispatchEvent(new CustomEvent('nova-demo-shop-glasses'));
        }, 1500);
        return () => clearTimeout(t);
    }, [hasEntered, currentStep]);

    const handleEnter = () => {
        playClick();
        setIsScanning(true);
        // Step 1: Biometric Scan
        setTimeout(() => {
            playStoreOpen(); // Verification sound
            setIsAuthorized(true);
            // Step 2: Open Doors
            setTimeout(() => {
                setIsOpening(true);
                // Step 3: Enter Arena
                setTimeout(() => setHasEntered(true), 1500);
            }, 800);
        }, 1500);
    };

    // REAL-TIME: Online Players State
    const [onlinePlayers, setOnlinePlayers] = useState<any[]>([]);

    // AVATAR CONTEXT for User
    const { currentAvatar, equippedAccessories } = useAvatar();

    // MOCK: Current User Player
    const currentPlayer = {
        name: 'Tú (You)',
        level: Math.floor(xp / 1000) + 1,
        avatar: currentAvatar,
        accessories: equippedAccessories,
        coins: coins,
        grade: grade
    };

    // TRACK PRESENCE:
    usePresence(userId, currentPlayer.name, 'arena', currentAvatar || undefined, equippedAccessories, grade);

    useEffect(() => {
        if (!supabase) return;

        const fetchOnlinePlayers = async () => {
            if (!supabase) return;
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60000).toISOString();
            const { data } = await supabase
                .from('players_presence')
                .select('*')
                .eq('current_view', 'arena')
                .gt('last_seen', fiveMinutesAgo)
                .eq('grade', grade); // Only show classmates from SAME GRADE

            if (data && supabase) {
                setOnlinePlayers(data.filter(p => p.user_id !== userId));
            }
        };

        fetchOnlinePlayers();

        const channel = supabase
            .channel('online-players')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'players_presence',
                filter: `current_view=eq.arena`
            }, () => {
                fetchOnlinePlayers();
            })
            .subscribe();

        return () => {
            if (supabase) {
                supabase.removeChannel(channel);
            }
        };
    }, [userId]);

    const [duelConfig, setDuelConfig] = useState<{ opponentName: string, opponentAvatar: string } | null>(null);

    const handleInteraction = async (player: any, type: 'wave' | 'challenge') => {
        if (!userId) {
            toast.error(language === 'es' ? 'Debes iniciar sesión' : 'You must log in');
            return;
        }

        if (type === 'challenge') {
            setDuelConfig({
                opponentName: player.user_name || player.name,
                opponentAvatar: player.avatar_id ? '🤖' : '👤'
            });
            return;
        }

        try {
            await notifyArenaInteraction(player.user_id, currentPlayer.name, type);
            toast.success(
                type === 'wave'
                    ? (language === 'es' ? `¡Has saludado a ${player.user_name}!` : `You waved to ${player.user_name}!`)
                    : (language === 'es' ? `¡Has desafiado a ${player.user_name}!` : `You challenged ${player.user_name}!`)
            );
        } catch (err) {
            console.error('Interaction failed:', err);
            toast.error(language === 'es' ? 'Error al interactuar' : 'Interaction failed');
        }
    };

    // Load Pedagogical Quests for current grade
    useEffect(() => {
        const pedQuests = getPedagogicalQuestsByGrade(grade);
        setPedagogicalQuestsForGrade(pedQuests);
    }, [grade]);

    // --- QUEST LOGIC ---
    const [selectedQuest, setSelectedQuest] = useState<ArenaQuest | null>(null);
    const [questStep, setQuestStep] = useState<'briefing' | 'active' | 'success'>('briefing');

    // Pedagogical Quest State
    const [selectedPedagogicalQuest, setSelectedPedagogicalQuest] = useState<PedagogicalQuestData | null>(null);
    const [pedagogicalQuestsForGrade, setPedagogicalQuestsForGrade] = useState<PedagogicalQuestData[]>([]);
    const [showStats, setShowStats] = useState(false);

    const speakArena = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
    };

    const handleStartMission = () => {
        if (!selectedQuest || !onNavigate) {
            setSelectedQuest(null);
            return;
        }

        // 1. Prepare Mission Context
        const missionContext = {
            id: selectedQuest.id,
            title: language === 'es' ? selectedQuest.title.es : selectedQuest.title.en,
            description: language === 'es' ? selectedQuest.description.es : selectedQuest.description.en,
            category: selectedQuest.category,
            difficulty: selectedQuest.difficulty,
            reward: selectedQuest.reward
        };

        // 2. Save to LocalStorage for the Tutor to pick up
        localStorage.setItem('nova_mission_params', JSON.stringify(missionContext));

        // 3. Navigate to appropriate tool
        const categoryMap: Record<string, ViewState> = {
            'math': ViewState.MATH_TUTOR,
            'sci': ViewState.RESEARCH_CENTER,
            'hist': ViewState.RESEARCH_CENTER,
            'lang': ViewState.BUDDY_LEARN,
            'spanish': ViewState.SPANISH_TUTOR,
            'art': ViewState.ARTS_TUTOR
        };

        const targetView = categoryMap[selectedQuest.category] || ViewState.MATH_TUTOR;

        speakArena(language === 'es' ? '¡Desplegando herramientas de misión!' : 'Deploying mission tools!');
        onNavigate(targetView);
    };

    const handleAnswer = (optionId: string) => {
        if (!selectedQuest?.challenge) return;

        if (optionId === selectedQuest.challenge.correctOptionId) {
            setQuestStep('success');
        } else {
            alert(language === 'es' ? '¡Inténtalo de nuevo!' : 'Try again!');
        }
    };

    const [showHint, setShowHint] = useState(false);

    const handleClaimReward = async () => {
        if (!selectedQuest || !userId) return;

        // Optimistic UI update
        addCoins(selectedQuest.reward.coins, `Misión Arena: ${selectedQuest.title.es}`);
        addXP(selectedQuest.reward.xp);
        setCompletedQuestIds([...completedQuestIds, selectedQuest.id]);

        // Persist to DB
        await completeQuest(userId, selectedQuest);

        setSelectedQuest(null);
    };

    // Pedagogical Quest Handlers
    const handlePedagogicalQuestComplete = async (questId: string, correct: boolean) => {
        const quest = pedagogicalQuestsForGrade.find(q => q.id === questId);
        if (!quest) return;

        // Award rewards
        const questTitle = language === 'es' ? quest.title.es : quest.title.en;
        addCoins(quest.reward.coins, `Misión Pedagógica: ${questTitle}`);
        addXP(quest.reward.xp);

        // Mark as completed
        setCompletedQuestIds([...completedQuestIds, questId]);

        // Save to database if userId available
        if (userId) {
            // Award Pet XP if the student has a pet
            const awardPetXP = async () => {
                if (!supabase) return;
                const { data: pet } = await supabase
                    .from('student_pets')
                    .select('*')
                    .eq('student_id', userId)
                    .maybeSingle();

                if (pet) {
                    const xpGained = 20;
                    let newLevel = pet.level;
                    const newXp = (pet.xp || 0) + xpGained;
                    const xpForNextLevel = (pet.level + 1) * 100;

                    if (newXp >= xpForNextLevel) {
                        newLevel += 1;
                    }

                    await supabase
                        .from('student_pets')
                        .update({ xp: newXp, level: newLevel })
                        .eq('id', pet.id);
                }
            };
            awardPetXP();

            // General Quest Completion (existing gamification)
            await completeQuest(userId, {
                id: questId,
                title: quest.title,
                description: { es: '', en: '' },
                icon: quest.icon,
                category: quest.category === 'language' ? 'history' : quest.category as any,
                difficulty: quest.difficulty,
                reward: quest.reward,
                challenge: quest.challenge as any,
                duration: 10,
                minPlayers: 1,
                maxPlayers: 1,
                minGrade: quest.grade,
                maxGrade: quest.grade
            });

            // Detailed Learning Progress Tracking
            await recordQuestCompletion(userId, questId, {
                title: questTitle,
                category: quest.category as any,
                difficulty: quest.difficulty,
                wasCorrect: correct,
                coinsEarned: quest.reward.coins,
                xpEarned: quest.reward.xp
            });
        }
    };

    if (isGlobalMissionsMode) {
        return (
            <div className="relative h-full w-full bg-slate-950 overflow-hidden font-fredoka flex flex-col">
                <AnimatePresence>
                    {!hasEntered && (
                        <motion.div
                            key="entrance-overlay-global"
                            exit={{ opacity: 0, transition: { duration: 1 } }}
                            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950 perspective-[2000px]"
                        >
                            {/* 🌌 DEEP SPACE BACKGROUND BEHIND DOORS */}
                            <div className="absolute inset-0 overflow-hidden opacity-40">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)]" />
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
                            </div>

                            {/* 🚪 THE HYPER-TECH VAULT DOORS */}
                            <div className="relative w-full h-full flex overflow-hidden">
                                {/* Left Master Wing */}
                                <motion.div
                                    initial={{ x: 0 }}
                                    animate={isOpening ? { x: '-100%', rotateY: -30, opacity: 0 } : {}}
                                    transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
                                    className="flex-1 bg-slate-900 border-r border-cyan-500/30 relative z-20 flex items-center justify-end overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-l from-cyan-500/5 to-transparent shadow-inner" />
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                                    <div className="relative mr-12 space-y-4">
                                        <div className="h-0.5 w-32 bg-cyan-500/20 rounded-full" />
                                        <div className="h-0.5 w-48 bg-cyan-500/40 rounded-full" />
                                        <div className="h-0.5 w-24 bg-cyan-500/20 rounded-full" />
                                    </div>
                                </motion.div>

                                {/* 📟 CENTRAL SECURITY HUD */}
                                {!isOpening && (
                                    <motion.div
                                        className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <div className="relative w-64 h-64 sm:w-96 sm:h-96 flex items-center justify-center">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 border-2 border-dashed border-cyan-500/20 rounded-full"
                                            />
                                            <motion.div
                                                animate={{ rotate: -360 }}
                                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-8 border-2 border-cyan-500/40 rounded-full border-t-cyan-500"
                                            />

                                            <div className="relative bg-black/40 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 shadow-[0_0_80px_rgba(6,182,212,0.2)] flex flex-col items-center pointer-events-auto">
                                                <AnimatePresence mode="wait">
                                                    {!isScanning && !isAuthorized ? (
                                                        <motion.div
                                                            key="idle"
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 1.2 }}
                                                            className="flex flex-col items-center"
                                                        >
                                                            <div className="w-24 h-24 bg-indigo-500/10 rounded-3xl border border-indigo-500/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                                                <Swords className="w-10 h-10 text-indigo-400" />
                                                            </div>
                                                            <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">Arena Nova</h2>
                                                            <p className="text-indigo-400/60 font-bold text-[10px] tracking-[0.3em] uppercase mb-8">Validación Biométrica</p>
                                                            <button
                                                                onClick={handleEnter}
                                                                className="group relative px-10 py-4 overflow-hidden rounded-full transition-all"
                                                            >
                                                                <div className="absolute inset-0 bg-indigo-600 group-hover:bg-white transition-colors" />
                                                                <span className="relative z-10 text-white font-black tracking-widest uppercase group-hover:text-indigo-600">Entrar</span>
                                                            </button>
                                                        </motion.div>
                                                    ) : isScanning && !isAuthorized ? (
                                                        <motion.div
                                                            key="scanning"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="flex flex-col items-center"
                                                        >
                                                            <div className="relative mb-8">
                                                                <div className="w-32 h-32 bg-cyan-500/20 rounded-full border border-cyan-500 animate-pulse" />
                                                                <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-cyan-400 animate-bounce" />
                                                                <motion.div
                                                                    animate={{ y: [-60, 60, -60] }}
                                                                    transition={{ duration: 2, repeat: Infinity }}
                                                                    className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_cyan] z-20"
                                                                />
                                                            </div>
                                                            <p className="text-cyan-400 font-black text-sm tracking-[0.5em] animate-pulse">ANALIZANDO IDENTIDAD...</p>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="authorized"
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="flex flex-col items-center"
                                                        >
                                                            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                                                                <ShieldCheck className="w-12 h-12 text-white" />
                                                            </div>
                                                            <h2 className="text-3xl font-black text-white italic tracking-tighter mb-1 uppercase">AUTORIZADO</h2>
                                                            <p className="text-emerald-400 font-bold text-[10px] tracking-[0.4em] mb-4">BIENVENIDO GUERRERO</p>
                                                            <LockKeyholeOpen className="w-6 h-6 text-emerald-400 animate-bounce mt-2" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Right Master Wing */}
                                <motion.div
                                    initial={{ x: 0 }}
                                    animate={isOpening ? { x: '100%', rotateY: 30, opacity: 0 } : {}}
                                    transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
                                    className="flex-1 bg-slate-900 border-l border-cyan-500/30 relative z-20 flex items-center justify-start overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent shadow-inner" />
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                                    <div className="relative ml-12 space-y-4">
                                        <div className="h-0.5 w-24 bg-cyan-500/20 rounded-full" />
                                        <div className="h-0.5 w-48 bg-cyan-500/40 rounded-full" />
                                        <div className="h-0.5 w-32 bg-cyan-500/20 rounded-full" />
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="h-full w-full bg-slate-950 p-6 overflow-y-auto relative z-10">
                    {/* Header de Impacto */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-emerald-500/20 rounded-full ring-2 ring-emerald-500/40">
                            <Globe className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">ARENA DE IMPACTO GLOBAL</h1>
                            <p className="text-emerald-400 font-bold text-lg">Misiones de vida real para salvar el planeta 🌍</p>
                        </div>
                    </div>

                    {/* Grid de Misiones por Grado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {currentStep && currentStep.autoData && currentStep.autoData.globalMissions && currentStep.autoData.globalMissions.map((mission: any, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`bg-slate-900 border-2 rounded-2xl p-6 relative overflow-hidden group ${mission.grade === grade ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-emerald-950/10' : 'border-slate-700 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all'}`}
                            >
                                {/* Badge de Grado */}
                                <div className="absolute top-4 right-4 bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-300 border border-slate-700">
                                    Grado {mission.grade}°
                                </div>

                                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{mission.title.split(' ')[0]}</div>
                                <h3 className="text-xl font-black text-white mb-2 leading-tight">{mission.title.substring(2)}</h3>
                                <p className="text-slate-300 text-sm mb-6 leading-relaxed font-medium">{mission.desc}</p>

                                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-800/50">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg shadow-lg">
                                        🦸‍♂️
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Guía de Misión</span>
                                        <span className="text-indigo-300 font-bold text-sm">{mission.guide}</span>
                                    </div>
                                </div>

                                {mission.grade === grade && (
                                    <div className="mt-6 w-full py-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white text-center font-black rounded-xl shadow-lg animate-pulse flex items-center justify-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        ¡TU MISIÓN DE GRADO!
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-950 overflow-hidden relative font-nunito text-slate-100">
            {/* Dark Tech Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[length:40px_40px] opacity-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 p-4 sticky top-0 z-20 flex justify-between items-center shadow-lg transform translate-z-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                        <Swords className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                            ARENA NOVA
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">ONLINE</span>
                        </h1>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Waves className="w-3 h-3 text-cyan-400" />
                            {language === 'es' ? `Zona de ${grade}° Grado` : `${grade === 1 ? '1st' : grade === 2 ? '2nd' : grade === 3 ? '3rd' : grade + 'th'} Grade Zone`}
                        </span>
                    </div>
                </div>

                {/* Navigation Tabs - Dark Capsules */}
                <div className="flex bg-slate-900/80 p-1 rounded-full border border-white/10 shadow-inner">
                    <button
                        onClick={() => setActiveTab('lobby')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all relative overflow-hidden ${activeTab === 'lobby' ? 'text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {activeTab === 'lobby' && <div className="absolute inset-0 bg-indigo-600 opacity-80" />}
                        <span className="relative z-10">Lobby</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('quests')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all relative overflow-hidden ${activeTab === 'quests' ? 'text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {activeTab === 'quests' && <div className="absolute inset-0 bg-purple-600 opacity-80" />}
                        <span className="relative z-10">{language === 'es' ? 'Misiones' : 'Quests'}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all relative overflow-hidden ${activeTab === 'leaderboard' ? 'text-white shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {activeTab === 'leaderboard' && <div className="absolute inset-0 bg-yellow-600 opacity-80" />}
                        <span className="relative z-10">Ranking</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('pets')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all relative overflow-hidden ${activeTab === 'pets' ? 'text-white shadow-[0_0_15px_rgba(225,29,72,0.5)]' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {activeTab === 'pets' && <div className="absolute inset-0 bg-rose-600 opacity-80" />}
                        <span className="relative z-10">{language === 'es' ? 'Mascotas' : 'Pets'}</span>
                    </button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveTab('shop')}
                        className="group relative px-4 py-2 rounded-xl bg-slate-800 border border-white/5 hover:border-yellow-500/50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xl group-hover:scale-110 transition-transform">🪙</span>
                            <span className="font-black text-yellow-400 text-lg shadow-yellow-500/20">{coins}</span>
                        </div>
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-6 z-10 custom-scrollbar">
                <AnimatePresence mode="wait">

                    {/* LOBBY VIEW - ORBITAL GALLERY */}
                    {activeTab === 'lobby' && (
                        <motion.div
                            key="lobby"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col lg:flex-row relative perspective-[1000px] overflow-hidden"
                        >
                            {/* 🌌 BACKGROUND ATMOSPHERE (Deep Space) */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-0 bg-[url('/patterns/stars.png')] opacity-60 animate-pulse-slow" />
                                <div className="absolute top-[-50%] right-[-20%] w-[80%] h-[80%] bg-blue-900/20 blur-[150px] rounded-full mix-blend-screen" />
                                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 blur-[150px] rounded-full mix-blend-screen" />
                                {/* Galactic Plane */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[500px] bg-gradient-to-r from-transparent via-cyan-900/10 to-transparent rotate-[-15deg] blur-3xl pointer-events-none" />
                            </div>

                            {/* 👈 LEFT PANEL: COMMANDER BASE (1/3 width) */}
                            <div className="lg:w-1/3 h-full flex flex-col justify-center items-center relative z-20 pl-10 pr-4">
                                {/* Floating Platform Container - INCREASED HEIGHT FOR FULL BODY */}
                                <div className="relative w-full max-w-sm h-[600px] flex flex-col items-center justify-end pb-10">

                                    {/* User Avatar - FULL BODY VISIBLE */}
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.8 }}
                                        className="relative z-20 w-full h-[450px] flex items-end justify-center drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-4"
                                    >
                                        {/* Avatar is now contained properly to show feet */}
                                        <div className="transform scale-110 origin-bottom hover:scale-115 transition-transform duration-500">
                                            <AvatarDisplay size="xl" isCurrentUser={true} showBackground={false} showName={true} />
                                        </div>

                                        {/* Floating Pet - Adjusted position */}
                                        <motion.div
                                            animate={{ y: [0, -15, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute bottom-20 -right-4 w-24 h-24 filter drop-shadow-lg z-30"
                                        >
                                            <img src="/avatars/pets/robot_pet.png" onError={(e) => e.currentTarget.style.display = 'none'} className="w-full h-full object-contain" />
                                        </motion.div>
                                    </motion.div>

                                    {/* Platform Base */}
                                    <div className="absolute bottom-24 w-72 h-20 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-[100%] shadow-[0_0_50px_rgba(6,182,212,0.2)] flex items-center justify-center transform perspective-[500px] rotateX(40deg)">
                                        <div className="absolute inset-0 rounded-[100%] bg-[conic-gradient(from_0deg,transparent,rgba(6,182,212,0.5),transparent)] animate-spin-slow opacity-50" />
                                        <div className="w-56 h-12 bg-cyan-500/10 rounded-[100%]" />
                                    </div>

                                    {/* Player Info Card - MOVED DOWN & SEPARATED */}
                                    <div className="relative w-64 bg-slate-900/90 backdrop-blur border border-white/10 px-6 py-4 rounded-2xl flex flex-col items-center shadow-2xl z-30 transform hover:scale-105 transition-transform cursor-pointer mt-4" onClick={() => setActiveTab('shop')}>
                                        <h2 className="text-2xl font-black text-white font-fredoka tracking-wide flex items-center justify-center gap-2 w-full">
                                            {currentPlayer.name.split(' ')[0]}
                                        </h2>
                                        <div className="flex items-center gap-3 mt-2 mb-3 justify-center w-full">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">Lvl {currentPlayer.level}</span>
                                            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                                                <Trophy className="w-3 h-3" /> RANK C
                                            </span>
                                        </div>
                                        <button className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-xs font-black text-white uppercase tracking-widest hover:brightness-110 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 border border-white/10">
                                            <Sparkles className="w-3 h-3" /> Personalizar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 👉 RIGHT PANEL: ORBITAL RADAR (2/3 width) */}
                            <div className="lg:w-2/3 h-full relative flex items-center justify-center">
                                {/* Large Radar Circle Background */}
                                <div className="absolute w-[800px] h-[800px] border border-white/5 rounded-full z-0 flex items-center justify-center">
                                    <div className="absolute w-[600px] h-[600px] border border-white/5 rounded-full" />
                                    <div className="absolute w-[400px] h-[400px] border border-dashed border-white/10 rounded-full animate-spin-slow duration-[60s]" />
                                </div>

                                {/* Radar Grid Lines */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none" />

                                {/* Orbiting Friends */}
                                <div className="relative w-full h-full z-10">
                                    {onlinePlayers.length === 0 ? (
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <div className="relative w-64 h-64 flex items-center justify-center">
                                                <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-ping-slow" />
                                                <div className="absolute inset-0 border-2 border-cyan-500/40 rounded-full animate-spin-reverse duration-[10s]" />
                                                <Users className="w-16 h-16 text-cyan-500/50" />
                                            </div>
                                            <h3 className="text-cyan-400 font-black text-xl mt-8 tracking-[0.2em] animate-pulse">ESCANEO ORBITAL ACTIVO...</h3>
                                            <p className="text-slate-500 font-medium mt-2">Buscando señales de vida en tu sector</p>
                                        </div>
                                    ) : (
                                        // 🪐 SOLAR SYSTEM LAYOUT for Friends
                                        onlinePlayers.map((player, idx) => {
                                            // Calculate simple orbital positions (mockup for visual)
                                            // In a real 3D implementation we'd use sin/cos based on index
                                            const total = onlinePlayers.length;
                                            const angle = (idx / total) * 2 * Math.PI;
                                            // Add some randomness to "orbit" distance so they aren't in a perfect boring line
                                            const radius = 200 + (idx % 2) * 80;
                                            const x = Math.cos(angle) * radius; // This would need actual absolute positioning logic or grid

                                            // For now, let's use a neat Grid that LOOKS like a system
                                            return (
                                                <div key={player.user_id} className="absolute top-1/2 left-1/2"
                                                    style={{
                                                        transform: `translate(-50%, -50%) translate(${Math.cos(angle) * 300}px, ${Math.sin(angle) * 200}px)`
                                                    }}
                                                >
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        whileHover={{ scale: 1.5, zIndex: 50 }}
                                                        className="group relative flex flex-col items-center cursor-pointer transition-all duration-300"
                                                        onClick={() => handleInteraction(player, 'wave')}
                                                    >
                                                        {/* Hover info bubble */}
                                                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap z-50 pointer-events-none border border-cyan-500/30">
                                                            {player.user_name}
                                                        </div>

                                                        {/* Avatar Container */}
                                                        <div className="relative">
                                                            {/* Crystal Bubble Background */}
                                                            <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-md group-hover:bg-cyan-500/20 transition-colors" />

                                                            {/* The Full Body Friend Avatar */}
                                                            <div className="w-32 h-32 relative flex items-center justify-center filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                                                                <AvatarDisplay
                                                                    avatarId={player.avatar_id}
                                                                    accessoriesOverride={player.equipped_accessories}
                                                                    size="md" // Smaller base size, zooms on hover
                                                                    showBackground={false}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Floating Platform Base for Friend */}
                                                        <div className="w-16 h-4 bg-white/10 rounded-[100%] mt-[-10px] border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_cyan] transition-all" />
                                                    </motion.div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* QUESTS VIEW */}
                    {activeTab === 'quests' && (
                        <motion.div
                            key="quests"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-6xl mx-auto"
                        >
                            <AdventureArena
                                grade={grade}
                                language={language}
                                userId={userId || ''}
                                completedMissionIds={completedQuestIds}
                                onComplete={handlePedagogicalQuestComplete}
                            />
                        </motion.div>
                    )}

                    {/* LEADERBOARD VIEW - E-SPORTS STYLE */}
                    {activeTab === 'leaderboard' && (
                        <motion.div
                            key="leaderboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl mx-auto bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-700"
                        >
                            <div className="bg-gradient-to-r from-yellow-600 to-amber-700 p-8 text-center text-white relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('/assets/hex-pattern.svg')] opacity-20" />
                                <Crown className="w-16 h-16 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                                <h2 className="text-3xl font-black font-fredoka mb-2 tracking-tight uppercase shadow-black drop-shadow-md">
                                    {language === 'es' ? 'Ranking de Elite' : 'Elite Ranking'}
                                </h2>
                                <p className="font-medium opacity-90 text-yellow-100">
                                    {language === 'es' ? 'Temporada 1 - Semana 4' : 'Season 1 - Week 4'}
                                </p>
                            </div>

                            <div className="p-6 space-y-2">
                                {[
                                    {
                                        id: userId || 'current_user',
                                        name: language === 'es' ? 'Tú (You)' : 'You',
                                        level: Math.floor(xp / 100) + 1,
                                        avatarUrl: '',
                                        grade: grade,
                                        coins: coins,
                                        status: 'online',
                                        badges: ['🌟'],
                                        isCurrentUser: true
                                    },
                                    ...mockArenaPlayers
                                ].sort((a, b) => b.coins - a.coins).map((player, idx) => (
                                    <div key={player.id} className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl transition border border-transparent",
                                        (player as any).isCurrentUser
                                            ? "bg-indigo-900/30 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                                            : "bg-slate-800/40 hover:bg-slate-800/60 hover:border-slate-700"
                                    )}>
                                        <div className={`w-10 h-10 flex items-center justify-center font-black rounded-lg text-lg transform rotate-3 shadow-lg ${idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                                            idx === 1 ? 'bg-slate-300 text-slate-800' :
                                                idx === 2 ? 'bg-orange-400 text-orange-900' : 'bg-slate-800 text-slate-500'
                                            }`}>
                                            {idx + 1}
                                        </div>

                                        {(player as any).isCurrentUser ? (
                                            <div className="w-12 h-12 flex items-center justify-center">
                                                <AvatarDisplay size="sm" showBackground={false} isCurrentUser={false} className="w-full h-full drop-shadow-md" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl border-2 border-slate-600">
                                                🤖
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <h4 className={cn("font-bold text-lg", (player as any).isCurrentUser ? "text-indigo-400" : "text-slate-200")}>
                                                {player.name}
                                            </h4>
                                            <div className="flex text-xs text-slate-500 gap-2 font-bold uppercase tracking-wider">
                                                <span>Lvl {player.level}</span>
                                                <span className="text-slate-700">•</span>
                                                <span>Rank C</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="font-black text-yellow-400 text-xl shadow-yellow-500/10 drop-shadow-sm">{(player as any).coins.toLocaleString()} 🪙</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* SHOP VIEW - DARK MARKET */}
                    {activeTab === 'shop' && (
                        <motion.div
                            key="shop"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="h-full bg-slate-900/40 rounded-[2rem] p-6 border border-slate-800"
                        >
                            <div className="flex items-center mb-6">
                                <button onClick={() => setActiveTab('lobby')} className="mr-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                                <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                                    <span className="text-pink-500">NEON</span> MARKETPLACE
                                </h2>
                            </div>
                            <div className="h-[calc(100%-80px)]">
                                <AvatarShop />
                            </div>
                        </motion.div>
                    )}

                    {/* PETS VIEW */}
                    {activeTab === 'pets' && (
                        <motion.div
                            key="pets"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto py-10"
                        >
                            <PetPanel userId={userId || ''} />


                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

            {/* QUEST MODAL - SCI-FI STYLE */}
            <AnimatePresence>
                {
                    selectedQuest && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-slate-900 border-2 border-cyan-500 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.3)] relative"
                            >
                                {/* Header */}
                                <div className="p-8 text-center relative overflow-hidden bg-slate-950">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.2),transparent)]" />

                                    <button
                                        onClick={() => setSelectedQuest(null)}
                                        className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>

                                    <div className="text-6xl mb-4 relative z-10 animate-bounce-slow drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                                        {selectedQuest.icon}
                                    </div>

                                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wide relative z-10">
                                        {language === 'en' ? selectedQuest.title.en : selectedQuest.title.es}
                                    </h2>

                                    <div className="flex justify-center gap-4 mt-4 relative z-10">
                                        <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 rounded-lg text-sm font-bold flex items-center gap-2">
                                            <Trophy className="w-3 h-3" /> +{selectedQuest.reward.coins}
                                        </span>
                                        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-400 rounded-lg text-sm font-bold flex items-center gap-2">
                                            <Sparkles className="w-3 h-3" /> +{selectedQuest.reward.xp} XP
                                        </span>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-8 bg-slate-900">
                                    {questStep === 'briefing' && (
                                        <div className="space-y-6">
                                            <p className="text-lg text-slate-300 font-medium leading-relaxed text-center">
                                                {language === 'en' ? selectedQuest.description.en : selectedQuest.description.es}
                                            </p>

                                            <button
                                                onClick={handleStartMission}
                                                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xl shadow-lg shadow-cyan-900/50 flex items-center justify-center gap-3 transition-transform active:scale-95"
                                            >
                                                <PlayCircle className="w-6 h-6" />
                                                {language === 'es' ? 'INICIAR MISIÓN' : 'START MISSION'}
                                            </button>
                                        </div>
                                    )}

                                    {questStep === 'success' && (
                                        <div className="space-y-6 text-center">
                                            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                                            </div>
                                            <h3 className="text-3xl font-black text-white uppercase tracking-widest">
                                                {language === 'es' ? '¡MISIÓN CUMPLIDA!' : 'MISSION ACCOMPLISHED!'}
                                            </h3>
                                            <button
                                                onClick={handleClaimReward}
                                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xl shadow-lg shadow-emerald-900/50 transition-colors"
                                            >
                                                {language === 'es' ? 'RECLAMAR RECOMPENSA' : 'CLAIM REWARD'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Pedagogical Quest Modal */}
            {selectedPedagogicalQuest && (
                <PedagogicalQuest
                    quest={selectedPedagogicalQuest}
                    onClose={() => setSelectedPedagogicalQuest(null)}
                    onComplete={(qId, correct) => handlePedagogicalQuestComplete(qId, correct)}
                    language={language === 'bilingual' ? 'es' : language}
                />
            )}

            {/* Stats Overlay */}
            {showStats && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-8 overflow-y-auto">
                    <div className="w-full max-w-6xl relative">
                        <button
                            onClick={() => setShowStats(false)}
                            className="fixed top-8 right-8 z-[110] bg-white text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <MetricsDashboard
                            userId={userId || ''}
                            language={language === 'bilingual' ? 'es' : language}
                        />
                    </div>
                </div>
            )}

            {/* MATH DUEL MODAL */}
            {duelConfig && (
                <MathDuel
                    opponentName={duelConfig.opponentName}
                    opponentAvatar={duelConfig.opponentAvatar}
                    difficulty={grade >= 4 ? 'hard' : grade >= 3 ? 'medium' : 'easy'}
                    onClose={() => setDuelConfig(null)}
                    onWin={(c, x) => {
                        addCoins(c, `Victoria en Duelo vs ${duelConfig.opponentName}`);
                        addXP(x);
                        toast.success(language === 'es' ? '¡Increíble victoria!' : 'Amazing victory!');
                        setDuelConfig(null);
                    }}
                />
            )}
        </div>
    );
}
