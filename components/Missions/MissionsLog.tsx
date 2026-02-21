import React, { useState } from 'react';
import { useGamification } from '@/context/GamificationContext';
import { AvatarDisplay } from '@/components/Gamification/AvatarDisplay';
import { CheckCircle2, Circle, Trophy, Star, Lightbulb, Heart, Swords, Bot, Flame } from 'lucide-react';
import { fetchParentMissions, completeParentMission, subscribeToParentMissions } from '@/services/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/services/supabase';

interface Mission {
    id: string;
    title: string;
    titleEn: string;
    description: string;
    xpReward: number;
    coinReward: number;
    isCompleted: boolean;
    progress: number;
    total: number;
    minGrade: number;
    maxGrade: number;
    isClassroom?: boolean;
    isParentMission?: boolean;
    claimed?: boolean;
    category?: string;
}

interface MissionsLogProps {
    language: 'es' | 'en';
    gradeLevel: number;
    onNavigate?: (view: any) => void;
}
import { ViewState } from '@/types';

export function MissionsLog({ language, gradeLevel, onNavigate }: MissionsLogProps) {
    const { addCoins, addXP } = useGamification();

    // State for Google Classroom missions only
    const [missions, setMissions] = useState<Mission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Google Classroom assignments and parent missions
    React.useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const fetchAllMissions = async () => {
            if (!supabase) return;

            try {
                // 1. Fetch Classroom Missions
                const { data: classroomData } = await supabase
                    .from('google_classroom_assignments')
                    .select('*')
                    .eq('synced_to_mission', true)
                    .order('due_date', { ascending: true });

                const classroomMissions: Mission[] = classroomData?.map(assignment => ({
                    id: assignment.id,
                    title: assignment.title,
                    titleEn: assignment.title,
                    description: assignment.description || `Tarea escolar de ${assignment.course_id || 'Clase'}.`,
                    xpReward: 100,
                    coinReward: 50,
                    isCompleted: ['TURNED_IN', 'GRADED'].includes(assignment.submission_state),
                    progress: ['TURNED_IN', 'GRADED'].includes(assignment.submission_state) ? 1 : 0,
                    total: 1,
                    minGrade: 0,
                    maxGrade: 12,
                    isClassroom: true,
                    claimed: assignment.reward_claimed
                })) || [];

                // 2. Fetch Parent Missions
                const { data: userData } = await supabase.auth.getUser();
                let parentMissions: Mission[] = [];
                if (userData.user) {
                    const dbParentMissions = await fetchParentMissions(userData.user.id);
                    parentMissions = dbParentMissions.map(m => ({
                        id: m.id,
                        title: m.title,
                        titleEn: m.title,
                        description: m.description || (language === 'es' ? 'Misión especial asignada por papá/mamá.' : 'Special mission assigned by mom/dad.'),
                        xpReward: m.reward_xp,
                        coinReward: m.reward_coins,
                        isCompleted: m.is_completed,
                        progress: m.is_completed ? 1 : 0,
                        total: 1,
                        minGrade: 0,
                        maxGrade: 12,
                        isParentMission: true,
                        category: m.category
                    }));

                    // Subscribe if we have a user
                    if (!unsubscribe) {
                        unsubscribe = subscribeToParentMissions(userData.user.id, () => {
                            console.log("🔔 Nueva misión detectada! Recargando...");
                            fetchAllMissions();
                        });
                    }
                }

                setMissions([...classroomMissions, ...parentMissions]);
            } catch (err) {
                console.error("Failed to load missions", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllMissions();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [language]);

    const handleClaim = async (missionId: string) => {
        const mission = missions.find(m => m.id === missionId);
        if (!mission || !supabase) return;

        // UI Optimistic Update
        setMissions(prev => prev.map(m => {
            if (m.id === missionId) {
                return { ...m, claimed: true, isCompleted: true };
            }
            return m;
        }));

        // Award Rewards
        addCoins(mission.coinReward, mission.isParentMission ? `Misión Familiar: ${mission.title}` : `Misión Escolar: ${mission.title}`);
        addXP(mission.xpReward);

        // Persist to DB
        try {
            if (mission.isParentMission) {
                await completeParentMission(missionId);
            } else {
                const { error } = await supabase
                    .from('google_classroom_assignments')
                    .update({ reward_claimed: true })
                    .eq('id', missionId);
                if (error) throw error;
            }
        } catch (err) {
            console.error("Error claiming reward:", err);
            toast.error("Error guardando el progreso. Pero te dimos las monedas igual 😉");
        }
    };

    const handleHint = (title: string, hint: string) => {
        toast.message(title, {
            description: hint,
            icon: <Lightbulb className="w-5 h-5 text-yellow-500" />
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-poppins p-8 space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between bg-white p-6 rounded-3xl border-b-4 border-black/5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center border-2 border-black shadow-comic -rotate-3">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="font-fredoka text-3xl font-black text-slate-800 tracking-tight">
                            {language === 'es' ? 'Tareas Escolares' : 'School Tasks'}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {language === 'es' ? '¡Completa tus deberes de Google Classroom!' : 'Complete your Google Classroom homework!'}
                        </p>
                    </div>
                </div>
                <div className="hidden sm:block">
                    <AvatarDisplay size="md" className="border-4 border-indigo-100" isCurrentUser={true} />
                </div>
            </header>

            {/* Missions List */}
            <div className="grid gap-4 max-w-4xl mx-auto">
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-400">Cargando misiones...</p>
                    </div>
                ) : missions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-400">
                            {language === 'es' ? 'No hay tareas escolares pendientes' : 'No pending school tasks'}
                        </h3>
                        <p className="text-slate-400 mt-2 mb-6">
                            {language === 'es' ? 'Sincroniza con tu colegio para importar tus tareas.' : 'Sync with your school to import your tasks.'}
                        </p>
                        {onNavigate && (
                            <Button
                                onClick={() => onNavigate(ViewState.GOOGLE_CLASSROOM)}
                                className="rounded-2xl px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 border-2 border-emerald-700 shadow-lg"
                            >
                                <span className="text-lg">📚</span>
                                {language === 'es' ? 'Sincronizar Google Classroom' : 'Sync Google Classroom'}
                            </Button>
                        )}
                    </div>
                ) : (
                    missions.map(mission => (
                        <div
                            key={mission.id}
                            className={cn(
                                "bg-white rounded-2xl border-2 p-4 flex items-center justify-between gap-4 transition-all",
                                mission.isCompleted
                                    ? "border-kid-green/50 shadow-comic-green"
                                    : "border-stone-200 shadow-sm"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center border-2",
                                    mission.isCompleted ? "bg-kid-green border-kid-green text-white" : "bg-stone-100 border-stone-300 text-stone-400"
                                )}>
                                    {mission.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                </div>

                                <div>
                                    <h3 className="font-fredoka text-lg font-bold text-slate-800 flex items-center gap-2">
                                        {language === 'es' ? mission.title : mission.titleEn}
                                        {mission.isClassroom && (
                                            <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold border border-blue-200 flex items-center gap-1">
                                                <Bot className="w-3 h-3" /> Classroom
                                            </span>
                                        )}
                                        {mission.isParentMission && (
                                            <span className="bg-rose-100 text-rose-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold border border-rose-200 flex items-center gap-1">
                                                <Heart className="w-3 h-3" /> {language === 'es' ? 'Familiar' : 'Family'}
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {mission.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {/* Status indicator instead of progress bar for now */}
                                        <span className={cn(
                                            "text-xs font-bold px-2 py-1 rounded-md",
                                            mission.isCompleted ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                                        )}>
                                            {mission.isCompleted ? (language === 'es' ? 'Completada' : 'Completed') : (language === 'es' ? 'Pendiente' : 'Pending')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-bold text-kid-purple">+{mission.xpReward} XP</div>
                                    <div className="text-sm font-bold text-kid-yellow">+{mission.coinReward} 🪙</div>
                                </div>

                                <Button
                                    disabled={(!mission.isCompleted && !mission.isParentMission) || (mission.isParentMission && !mission.isCompleted) || (mission as any).claimed}
                                    onClick={() => handleClaim(mission.id)}
                                    className={cn(
                                        "font-bold border-2 border-black shadow-comic",
                                        (mission.isCompleted && !(mission as any).claimed)
                                            ? "bg-kid-yellow hover:bg-kid-yellow/90 text-black animate-bounce"
                                            : "bg-stone-200 border-stone-300 text-stone-400 shadow-none"
                                    )}
                                >
                                    {(mission as any).claimed
                                        ? (language === 'es' ? '¡Reclamado!' : 'Claimed!')
                                        : mission.isCompleted
                                            ? (language === 'es' ? '¡Reclamar!' : 'Claim!')
                                            : (language === 'es' ? 'Pendiente' : 'Pending')
                                    }
                                </Button>

                                {(mission.isClassroom || mission.isParentMission) && !mission.isCompleted && !mission.claimed && onNavigate && (
                                    <Button
                                        onClick={() => {
                                            // Intelligent Routing Logic
                                            const lowerTitle = mission.title.toLowerCase() + ' ' + (mission.description || '').toLowerCase();
                                            const category = mission.category?.toLowerCase() || '';

                                            let targetView = ViewState.RESEARCH_CENTER;
                                            let derivedCategory = 'general';

                                            // 1. Check by category first (for Parent Missions)
                                            if (category === 'math') {
                                                targetView = ViewState.MATH_TUTOR;
                                                derivedCategory = 'math';
                                            } else if (category === 'english' || category === 'language') {
                                                targetView = ViewState.BUDDY_LEARN;
                                                derivedCategory = 'language';
                                            } else if (category === 'socials' || category === 'science' || category === 'history') {
                                                targetView = ViewState.RESEARCH_CENTER;
                                                derivedCategory = category;
                                            } else if (category === 'art') {
                                                targetView = ViewState.ARTS_TUTOR;
                                                derivedCategory = 'art';
                                            }
                                            // 2. Fallback to title matching
                                            else if (lowerTitle.match(/hist|geo|soc|sci|cien|bio|nat|chem|fis/)) {
                                                targetView = ViewState.RESEARCH_CENTER;
                                                derivedCategory = lowerTitle.match(/hist|geo|soc/) ? 'history' : 'science';
                                            } else if (lowerTitle.match(/eng|lan|len|read|writ|idiom/)) {
                                                targetView = ViewState.BUDDY_LEARN;
                                                derivedCategory = 'language';
                                            } else if (lowerTitle.match(/esp|span|leng|lect|escr|ortog|gramat/)) {
                                                targetView = ViewState.SPANISH_TUTOR;
                                                derivedCategory = 'spanish';
                                            } else if (lowerTitle.match(/art|draw|pint|dibuj|creat/)) {
                                                targetView = ViewState.ARTS_TUTOR;
                                                derivedCategory = 'art';
                                            } else if (lowerTitle.match(/mat|alg|geom|num|calc|sum|rest|mult/)) {
                                                targetView = ViewState.MATH_TUTOR;
                                                derivedCategory = 'math';
                                            }

                                            // 1. Prepare Mission Context
                                            const missionContext = {
                                                id: mission.id,
                                                title: mission.title,
                                                description: mission.isParentMission
                                                    ? `Meta de Refuerzo: ${mission.title}. ${mission.description}`
                                                    : `Vamos a estudiar para tu tarea de Classroom: ${mission.title}. ${mission.description}`,
                                                category: derivedCategory,
                                                difficulty: 'medium',
                                                reward: { coins: mission.coinReward, xp: mission.xpReward }
                                            };

                                            // 2. Save to LocalStorage
                                            localStorage.setItem('nova_mission_params', JSON.stringify(missionContext));
                                            if (targetView === ViewState.MATH_TUTOR) {
                                                sessionStorage.setItem('nova_mission_from_center', '1');
                                            }

                                            // 3. Navigate
                                            onNavigate(targetView);
                                        }}
                                        className={cn(
                                            "font-bold border-2 shadow-sm",
                                            mission.isParentMission
                                                ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-800"
                                                : "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-800"
                                        )}
                                    >
                                        <Flame className="w-4 h-4 mr-2" />
                                        {language === 'es' ? 'Estudiar' : 'Study'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
