import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, BookOpen, Calculator, Globe, Star, ArrowRight, Zap, CheckCircle, Lock, LayoutDashboard, Trophy, Calendar, Clock, ChevronRight, X, Heart, RefreshCw, Layers, ScanLine, Upload, FileText, Loader2, Sparkles, Camera, Cloud } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ViewState } from '@/types';
import { sfx } from '@/services/soundEffects';
import { fetchParentMissions, completeParentMission, getGoogleClassroomAssignments, getMoodleAssignments } from '@/services/supabase';
import { extractHomeworkFromImage } from '@/services/ai_service';
import { fetchNativeMissions, generateDailyMissions, createNativeMission, type NativeMission } from '@/services/missionService';
import { toast } from 'sonner';
import { ERROR_MESSAGES, EMPTY_STATE_MESSAGES } from '@/utils/errorMessages';

// Types
export type Subject = 'MATH' | 'ENGLISH' | 'RESEARCH' | 'ART' | 'PARENT' | 'GOOGLE' | 'MOODLE' | 'EXAM_PREP';

export interface AcademicTask {
    id: string;
    title: string;
    description: string;
    subject: Subject;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
    progress: number; // 0 to 100
    reward: number; // Coins
    dueDate: Date;
    route: ViewState; // ViewState enum
    params?: any; // To pass to the destination
    googleLink?: string; // If it's a deep link to Classroom
}

// Misión de fracciones para el demo (conectada con tutoría y cuaderno)
const DEMO_FRACTIONS_TASK: AcademicTask = {
    id: 't-math-frac-demo',
    title: 'Suma de Fracciones',
    description: 'Aprende a sumar fracciones con distinto denominador. La Profe Lina te guía paso a paso.',
    subject: 'MATH',
    difficulty: 'MEDIUM',
    status: 'AVAILABLE',
    progress: 0,
    reward: 50,
    dueDate: new Date(),
    route: ViewState.MATH_TUTOR,
    params: { mode: 'fractions', topic: 'sum' }
};

// Misión de investigación para el demo (conectada con Research Center)
const DEMO_RESEARCH_TASK: AcademicTask = {
    id: 't-research-demo',
    title: 'Investigación: El Ciclo del Agua',
    description: 'Investiga el ciclo del agua y crea un reporte. El Centro de Investigación te guía paso a paso.',
    subject: 'RESEARCH',
    difficulty: 'MEDIUM',
    status: 'AVAILABLE',
    progress: 0,
    reward: 50,
    dueDate: new Date(),
    route: ViewState.RESEARCH_CENTER,
    params: { topic: 'water-cycle' }
};

interface TaskControlCenterProps {
    onNavigate: (view: ViewState) => void;
    userId: string;
    language?: 'es' | 'en';
    demoData?: { showExampleMission?: boolean; showResearchMission?: boolean; highlightEvaluation?: boolean; demoTasks?: AcademicTask[] } | null;
}

// Helpers
const getDayLabel = (date: Date) => {
    const days = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    return days[date.getDay()];
};

const getRelativeDay = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays < 0) return 'Vencida';
    return `${date.getDate()}/${date.getMonth() + 1}`;
};

const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};

// Misiones internas Nova (aparecen en el Centro de Mando; p. ej. para Andrés en 5°)
const NOVA_TASKS: AcademicTask[] = [
    {
        id: 't-math-01',
        title: 'Misión Multiplicación',
        description: 'Domina las tablas del 6 y 7 para desbloquear el siguiente nivel.',
        subject: 'MATH',
        difficulty: 'MEDIUM',
        status: 'AVAILABLE',
        progress: 0,
        reward: 50,
        dueDate: new Date(), // Due Today
        route: ViewState.MATH_TUTOR,
        params: { mode: 'multiplication', difficulty: 2 }
    },
    {
        id: 't-math-02',
        title: 'División inexacta por dos cifras',
        description: 'Practica divisiones con divisor de dos cifras y residuo. La Profe Lina te guía paso a paso.',
        subject: 'MATH',
        difficulty: 'MEDIUM',
        status: 'AVAILABLE',
        progress: 0,
        reward: 50,
        dueDate: new Date(),
        route: ViewState.MATH_TUTOR,
        params: { mode: 'division', difficulty: 2 }
    },
    {
        id: 't-eng-01',
        title: 'Vocabulario Espacial',
        description: 'Aprende 10 palabras nuevas sobre el universo en inglés.',
        subject: 'ENGLISH',
        difficulty: 'EASY',
        status: 'IN_PROGRESS',
        progress: 40,
        reward: 30,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Due Tomorrow
        route: ViewState.BUDDY_LEARN,
        params: { topic: 'space', activity: 'flashcards' }
    }
];

const SubjectIcons: Record<Subject, React.ReactNode> = {
    MATH: <Calculator className="w-5 h-5" />,
    ENGLISH: <Globe className="w-5 h-5" />,
    RESEARCH: <BookOpen className="w-5 h-5" />,
    ART: <Star className="w-5 h-5" />,
    PARENT: <Heart className="w-5 h-5 text-pink-400" />,
    GOOGLE: <img src="https://upload.wikimedia.org/wikipedia/commons/5/59/Google_Classroom_Logo.png" className="w-5 h-5" alt="G" />,
    MOODLE: <span className="text-lg">📚</span>,
    EXAM_PREP: <Layers className="w-5 h-5 text-purple-400" />
};

const SubjectColors: Record<Subject, string> = {
    MATH: 'bg-blue-600',
    ENGLISH: 'bg-indigo-600',
    RESEARCH: 'bg-emerald-600',
    ART: 'bg-pink-600',
    PARENT: 'bg-rose-600',
    GOOGLE: 'bg-amber-600', // Classroom Amber
    MOODLE: 'bg-orange-600', // Moodle Orange
    EXAM_PREP: 'bg-purple-600'
};

export function TaskControlCenter({ onNavigate, userId, language = 'es', demoData }: TaskControlCenterProps) {
    const [showPlatformModal, setShowPlatformModal] = useState(false);
    const isDemoStep2 = Boolean(demoData?.showExampleMission);
    const showResearchMission = Boolean(demoData?.showResearchMission);
    const demoTasks = demoData?.demoTasks ?? (
        showResearchMission ? [DEMO_RESEARCH_TASK, DEMO_FRACTIONS_TASK, ...NOVA_TASKS.slice(0, 1)] :
            isDemoStep2 ? [DEMO_FRACTIONS_TASK, ...NOVA_TASKS.slice(0, 2)] : null
    );
    const [tasks, setTasks] = useState<AcademicTask[]>(demoTasks || NOVA_TASKS);
    const [selectedTask, setSelectedTask] = useState<AcademicTask | null>(null);
    const [evalHighlight, setEvalHighlight] = useState(false);

    // Demo: inyectar tareas de demo (fracciones primero)
    useEffect(() => {
        setTasks(demoTasks || NOVA_TASKS);
    }, [demoTasks]);

    // Demo: seleccionar misión según el paso
    useEffect(() => {
        if ((isDemoStep2 || showResearchMission) && tasks.length > 0 && !selectedTask) {
            const task = showResearchMission
                ? tasks.find(t => t.id === 't-research-demo') || tasks[0]
                : tasks.find(t => t.id === 't-math-frac-demo') || tasks.find(t => t.subject === 'MATH') || tasks[0];
            if (task) setSelectedTask(task);
        }
    }, [isDemoStep2, showResearchMission, tasks, selectedTask]);

    // Demo: evaluación solo hace blink cuando la presentadora la menciona (~12s en audio paso 2)
    useEffect(() => {
        const onHighlight = () => setEvalHighlight(true);
        const onEnd = () => setEvalHighlight(false);
        window.addEventListener('nova-demo-highlight-evaluation', onHighlight);
        window.addEventListener('nova-demo-highlight-evaluation-end', onEnd);
        return () => {
            window.removeEventListener('nova-demo-highlight-evaluation', onHighlight);
            window.removeEventListener('nova-demo-highlight-evaluation-end', onEnd);
        };
    }, []);

    const [showCelebration, setShowCelebration] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Scanner States
    const [showScanner, setShowScanner] = useState(false);
    const [scanMode, setScanMode] = useState<'EXAM' | 'HOMEWORK'>('EXAM');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showCameraView, setShowCameraView] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Activar cámara cuando se muestra la vista "Tomar foto"
    useEffect(() => {
        if (!showCameraView || !showScanner) return;
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Error al activar la cámara:', err);
                toast.error('No se pudo activar la cámara. Revisa los permisos.');
                setShowCameraView(false);
            }
        };
        startCamera();
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
            if (videoRef.current) videoRef.current.srcObject = null;
        };
    }, [showCameraView, showScanner]);

    const handleAnalyzeWithFile = async (file: File) => {
        if (!file) return;
        setIsAnalyzing(true);
        setShowCameraView(false);

        if (scanMode === 'HOMEWORK') {
            try {
                // Convert file to base64 or use URL if supported, for now assume we have a way or sim.
                // In a real app we'd upload to Supabase Storage first. 
                // For this demo, we can assume 'extractHomeworkFromImage' *might* accept a blob URL if we modify it, 
                // but usually OpenAI needs a public URL or base64. 
                // Let's create a temporary object URL and pretend/hope our service handles it or we mock it.
                // NOTE: In production, upload to storage first!
                const imageUrl = URL.createObjectURL(file);

                // Call AI
                const extractedTasks = await extractHomeworkFromImage(imageUrl, 'es');

                if (extractedTasks.length > 0) {
                    const newTasks: AcademicTask[] = extractedTasks.map((t: any, i: number) => ({
                        id: `hw-${Date.now()}-${i}`,
                        title: t.title,
                        description: t.description,
                        subject: t.subject as Subject, // Ensure mapping matches 'Subject' type
                        difficulty: 'MEDIUM',
                        status: 'AVAILABLE',
                        progress: 0,
                        reward: 50,
                        dueDate: new Date(Date.now() + (t.estimated_due_days || 1) * 86400000),
                        route: ViewState.DASHBOARD, // Generic route or determine based on subject
                        params: { source: 'scan' } // Explicitly tag as scanned for School tab
                    }));

                    setTasks(prev => [...newTasks, ...prev]);
                    toast.success(`¡Wow! Encontré ${newTasks.length} tareas nuevas en tu agenda.`);
                    triggerCelebration();
                } else {
                    toast.error("No encontré tareas claras. Intenta con otra foto.");
                }

            } catch (err) {
                console.error(err);
                toast.error("Error analizando la tarea.");
            } finally {
                setIsAnalyzing(false);
                setShowScanner(false);
            }
            return;
        }

        // --- EXAM MODE (Existing Simulation) ---
        setTimeout(() => {
            setIsAnalyzing(false);
            setShowScanner(false);

            // 50/50 Chance of Success vs Remedial for demo
            const isSuccess = Math.random() > 0.5;

            if (isSuccess) {
                triggerCelebration();
                toast.success("¡Wow! ¡Qué buena nota! Tienes un bonus de XP.", { duration: 5000 });
                // Add Bonus Task completed
                addXPTask("Bonus de Excelencia", 200);
            } else {
                // Create Remedial
                const remedialTask: AcademicTask = {
                    id: `remedial-${Date.now()}`,
                    title: 'Refuerzo Bilingüe: Geometría',
                    description: 'Tus tutoras han detectado que fallamos en Geometría. ¡Miss Lina te ayudará a fortalecer este punto!',
                    subject: 'MATH',
                    difficulty: 'EASY',
                    status: 'AVAILABLE',
                    progress: 0,
                    reward: 150, // High reward to motivate
                    dueDate: new Date(),
                    route: ViewState.MATH_TUTOR,
                    params: { mode: 'remedial', topic: 'geometry_basics' }
                };

                setTasks(prev => [remedialTask, ...prev]);
                setSelectedTask(remedialTask);
                toast.message("Plan de Mejora Creado", {
                    description: "Nova ha detectado áreas de mejora y creó una nueva misión para ti.",
                    icon: <Sparkles className="w-5 h-5 text-yellow-500" />
                });
                sfx.playWhoosh();
            }
        }, 3000);
    };

    const handleAnalyzeResult = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleAnalyzeWithFile(file);
        e.target.value = '';
    };

    const handleCapturePhoto = () => {
        const video = videoRef.current;
        if (!video || !video.srcObject || video.readyState < 2) {
            toast.error('Espera a que la cámara esté lista.');
            return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(
            (blob) => {
                if (!blob) return;
                const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
                handleAnalyzeWithFile(file);
            },
            'image/jpeg',
            0.9
        );
    };

    const addXPTask = (title: string, amount: number) => {
        // Logic to just award XP or add a completed entry
        toast.success(`+${amount} XP ganados!`);
    };

    // Initial Data Load
    useEffect(() => {
        loadAllMissions();
    }, [userId]);

    const loadAllMissions = async () => {
        if (!userId) return;
        setIsLoading(true);

        try {
            // 1. Fetch Parent Missions
            const parentMissionsData = await fetchParentMissions(userId);
            const parentTasks: AcademicTask[] = (parentMissionsData || []).map((m: any) => {
                let route = ViewState.DASHBOARD;
                if (m.category === 'math') route = ViewState.MATH_TUTOR;
                else if (m.category === 'language') route = ViewState.BUDDY_LEARN;
                else if (m.category === 'science' || m.category === 'history') route = ViewState.RESEARCH_CENTER;

                return {
                    id: m.id,
                    title: `Misión: ${m.title}`,
                    description: m.category === 'math' ? 'Refuerzo especial diseñado por Nova para tu boletín.' : `Recompensa especial: ¡${m.reward_coins} estrellas!`,
                    subject: 'PARENT',
                    difficulty: 'MEDIUM',
                    status: 'AVAILABLE',
                    progress: 0,
                    reward: m.reward_coins,
                    dueDate: new Date(),
                    route,
                    params: m.metadata || { topic: m.title }
                };
            });

            // 2. Fetch Google Classroom Assignments (from DB Sync)
            const googleData = await getGoogleClassroomAssignments(userId);

            // 2b. Fetch Moodle Assignments (from DB Sync)
            const moodleData = await getMoodleAssignments(userId);

            // KEYWORDS for Exam detection
            const examKeywords = ['examen', 'exam', 'quiz', 'test', 'evaluación', 'repaso', 'review', 'parcial'];
            const mathKeywords = ['matemáticas', 'math', 'algebra', 'geometría', 'geometry', 'arithmetic', 'aritmetica', 'suma', 'resta', 'multiplicacion', 'division', 'cálculo', 'calculus', 'numeros', 'numbers'];

            const googleTasks: AcademicTask[] = (googleData || []).map((g: any) => {
                const titleLower = g.title.toLowerCase();
                const isExam = examKeywords.some(k => titleLower.includes(k));
                const isMath = mathKeywords.some(k => titleLower.includes(k));

                let route = ViewState.GOOGLE_CLASSROOM;
                let subject: Subject = 'GOOGLE';
                let description = `Tarea de Google Classroom - ${g.google_classroom_courses?.name || 'Clase'}. ${g.description || ''}`;
                let params = undefined;

                if (isExam) {
                    subject = 'EXAM_PREP';
                    if (isMath) {
                        route = ViewState.MATH_TUTOR;
                        description = `¡Alerta de Examen de Matemáticas! Entrena con tu Tutora IA para dominar este tema.`;
                        params = { topic: g.title, mode: 'exam_review' };
                    } else {
                        route = ViewState.FLASHCARDS;
                        description = `¡Alerta de Examen! Usa las Tarjetas Mágicas para estudiar este tema de ${g.google_classroom_courses?.name || 'Clase'}.`;
                        params = { topic: g.title, autoGenerate: true };
                    }
                }

                return {
                    id: g.google_assignment_id,
                    title: g.title,
                    description,
                    subject,
                    difficulty: isExam ? 'HARD' : 'MEDIUM',
                    status: (g.submission_state === 'TURNED_IN' || g.submission_state === 'RETURNED') ? 'COMPLETED' : 'AVAILABLE',
                    progress: (g.submission_state === 'TURNED_IN' || g.submission_state === 'RETURNED') ? 100 : 0,
                    reward: g.max_points || (isExam ? 150 : 50), // More XP for exams
                    dueDate: g.due_date ? new Date(g.due_date) : new Date(new Date().setDate(new Date().getDate() + 7)), // Default +7 days if null
                    route,
                    googleLink: g.alternateLink,
                    params
                }
            });

            const moodleTasks: AcademicTask[] = (moodleData || []).map((m: any) => {
                const titleLower = m.title.toLowerCase();
                const isExam = examKeywords.some((k: string) => titleLower.includes(k));
                const isMath = mathKeywords.some((k: string) => titleLower.includes(k));
                let route = ViewState.MOODLE_SYNC;
                let subject: Subject = 'MOODLE';
                let description = `Tarea de Moodle - ${m.course_name || 'Clase'}. ${m.description || ''}`;
                let params = undefined;
                if (isExam) {
                    subject = 'EXAM_PREP';
                    if (isMath) {
                        route = ViewState.MATH_TUTOR;
                        description = `¡Alerta de Examen de Matemáticas! Entrena con tu Tutora IA para dominar este tema.`;
                        params = { topic: m.title, mode: 'exam_review' };
                    } else {
                        route = ViewState.FLASHCARDS;
                        description = `¡Alerta de Examen! Usa las Tarjetas Mágicas para estudiar este tema de ${m.course_name || 'Clase'}.`;
                        params = { topic: m.title, autoGenerate: true };
                    }
                }
                return {
                    id: `moodle_${m.moodle_assignment_id}`,
                    title: m.title,
                    description,
                    subject,
                    difficulty: isExam ? 'HARD' : 'MEDIUM',
                    status: (m.submission_state === 'TURNED_IN' || m.submission_state === 'RETURNED') ? 'COMPLETED' : 'AVAILABLE',
                    progress: (m.submission_state === 'TURNED_IN' || m.submission_state === 'RETURNED') ? 100 : 0,
                    reward: m.max_points || (isExam ? 150 : 50),
                    dueDate: m.due_date ? new Date(m.due_date) : new Date(new Date().setDate(new Date().getDate() + 7)),
                    route,
                    params
                };
            });

            // 3. Fetch Native Missions (Supabase 'missions' table)
            let nativeMissionsRaw = await fetchNativeMissions(userId);

            // 4. Auto-Generate Daily Missions if Empty
            const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';

            if (googleTasks.length === 0 && nativeMissionsRaw.length === 0 && !isDemoMode) {
                console.log("Generating Daily Missions...");
                const automatedMissions = await generateDailyMissions(userId, 3);

                const savedMissions = [];
                for (const m of automatedMissions) {
                    const saved = await createNativeMission(m);
                    if (saved) savedMissions.push(saved);
                }

                if (savedMissions.length > 0) {
                    nativeMissionsRaw = savedMissions;
                    toast.success("¡Misiones diarias generadas!");
                }
            }

            const nativeTasks: AcademicTask[] = nativeMissionsRaw.map(m => ({
                id: m.id,
                title: m.title,
                description: m.description,
                subject: m.subject as Subject,
                difficulty: m.difficulty,
                status: m.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : (m.status === 'COMPLETED' ? 'COMPLETED' : 'AVAILABLE'),
                progress: m.status === 'COMPLETED' ? 100 : 0,
                reward: m.reward_xp || 50,
                dueDate: new Date(m.due_date),
                route: m.subject === 'MATH' ? ViewState.MATH_TUTOR : ViewState.DASHBOARD,
                params: m.metadata
            }));

            // 5. Combine with Mocks (Nova System Missions)
            // Filter out mocks if we have real data? No, keep them mixed.

            // Avoid duplicates by ID
            const allTasks = [...NOVA_TASKS, ...parentTasks, ...googleTasks, ...moodleTasks, ...nativeTasks];

            // Unique by ID
            const uniqueTasks = Array.from(new Map(allTasks.map(item => [item.id, item])).values());

            setTasks(uniqueTasks);

            if (!selectedTask && uniqueTasks.length > 0) {
                const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
                let taskToSelect;

                if (isDemoMode) {
                    taskToSelect = uniqueTasks.find(t => t.subject === 'EXAM_PREP') || uniqueTasks[0];
                } else {
                    taskToSelect = uniqueTasks.find(t => t.status === 'AVAILABLE') || uniqueTasks[0];
                }

                setSelectedTask(taskToSelect);
            }

        } catch (err) {
            console.error("Error loading missions:", err);
            const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
            if (!isDemoMode) toast.error(ERROR_MESSAGES.missions('es'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleLaunchMission = async (task: AcademicTask) => {
        if (task.subject === 'PARENT' && task.route === ViewState.DASHBOARD) {
            try {
                await completeParentMission(task.id);
                setTasks(prev => prev.map(t =>
                    t.id === task.id
                        ? { ...t, status: 'COMPLETED', progress: 100 }
                        : t
                ));
                triggerCelebration();
                toast.success('¡Misión especial completada!');
            } catch (error) {
                console.error('Failed to complete mission:', error);
                toast.error('No se pudo completar la misión');
            }
            return;
        }

        console.log(`🚀 Launching mission: ${task.title} -> ${task.route}`);

        // Save Params for Destination View
        const missionInfo = {
            ...(task.params || {}),
            missionTitle: task.title,
            missionDescription: task.description,
            subject: task.subject,
            missionId: task.id,
            isParentMission: task.subject === 'PARENT'
        };
        localStorage.setItem('nova_mission_params', JSON.stringify(missionInfo));
        // Marca para Math: solo cargar misión si el usuario viene del Centro de Mando (no si abre Math desde el menú).
        if (task.route === ViewState.MATH_TUTOR) {
            sessionStorage.setItem('nova_mission_from_center', '1');
        }

        onNavigate(task.route);
    };

    // Helper for celebration
    const triggerCelebration = () => {
        if (showCelebration) return;
        setShowCelebration(true);
        sfx.playSuccess();

        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    // Tabs State
    const [activeTab, setActiveTab] = useState<'SCHOOL' | 'NOVA'>(() => (demoData?.showExampleMission || demoData?.showResearchMission ? 'NOVA' : 'SCHOOL'));

    // Filter Tasks based on Tab
    const filteredTasks = tasks.filter(task => {
        const isSchool =
            task.subject === 'GOOGLE' ||
            task.subject === 'MOODLE' ||
            task.subject === 'EXAM_PREP' ||
            task?.params?.source === 'scan'; // Scanned homework is School

        return activeTab === 'SCHOOL' ? isSchool : !isSchool;
    });

    // Grouping for Agenda (using filtered tasks)
    const agendaGroups = filteredTasks.reduce((acc, task) => {
        const key = getRelativeDay(task.dueDate);
        if (!acc[key]) acc[key] = [];
        acc[key].push(task);
        return acc;
    }, {} as Record<string, AcademicTask[]>);

    const sortedGroups = Object.entries(agendaGroups).sort((a, b) => {
        const priority = { 'Hoy': 1, 'Mañana': 2, 'Vencida': 0 };
        // Valid helper to get sort index
        const getIdx = (k: string) => priority[k as keyof typeof priority] ?? 99;

        const idxA = getIdx(a[0]);
        const idxB = getIdx(b[0]);

        if (idxA !== idxB) return idxA - idxB;
        return 0;
    });

    // Mobile Detection
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Stats (Global)
    const totalXP = tasks.filter(t => t.status === 'COMPLETED').reduce((acc, t) => acc + t.reward, 0);
    const progressPercent = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100) : 0;

    // Helper to get Button Text
    const getButtonText = (task: AcademicTask) => {
        if (task.subject === 'GOOGLE') return 'ABRIR TAREA';
        if (task.subject === 'MOODLE') return 'ABRIR TAREA';
        if (task.subject === 'EXAM_PREP') {
            if (task.route === ViewState.MATH_TUTOR) return 'TUTORÍA MATEMÁTICA (IA)';
            return 'PREPARAR EVALUACIÓN (IA)';
        }
        return 'INICIAR MISIÓN';
    };

    return (
        <div className="h-screen bg-[#020617] text-white font-nunito overflow-hidden relative flex flex-col">

            {/* 🌌 IMERSIVE NEBULA BACKGROUND */}
            <div className="absolute inset-0 bg-[#020617] overflow-hidden pointer-events-none">
                {/* Nebula Core */}
                <div className="absolute top-[20%] left-[10%] w-[80%] h-[60%] bg-indigo-600/20 rounded-[100%] blur-[120px] animate-pulse pointer-events-none" />
                <div className="absolute -bottom-[10%] right-[5%] w-[50%] h-[50%] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" style={{ animationDelay: '3s' }} />
                <div className="absolute top-0 right-[20%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

                {/* 🌟 Starry Night Overlay */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(1px_1px_at_20px_30px,white,transparent),radial-gradient(1.5px_1.5px_at_40px_70px,white,transparent),radial-gradient(1px_1px_at_50px_160px,white,transparent),radial-gradient(1.5px_1.5px_at_90px_40px,white,transparent)] bg-[length:200px_200px]" />

                {/* Floating Dust Particles */}
                <div className="absolute inset-0 bg-scanline opacity-[0.02]" />
            </div>

            {/* Celebration Overlay */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setShowCelebration(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 100 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 border-2 border-yellow-500 rounded-[2rem] p-8 max-w-xl w-full text-center relative shadow-[0_0_50px_rgba(234,179,8,0.3)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Trophy className="w-32 h-32 text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
                            <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-wide">¡Misión Cumplida!</h2>
                            <p className="text-slate-300 text-lg mb-8">Has dominado este objetivo. ¡Excelente trabajo!</p>
                            <Button onClick={() => setShowCelebration(false)} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg px-8 py-6 rounded-xl">
                                CONTINUAR
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PLATFORM SELECTION MODAL */}
            <AnimatePresence>
                {showPlatformModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setShowPlatformModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border-2 border-emerald-500/50 rounded-[2rem] p-8 max-w-lg w-full shadow-[0_0_60px_rgba(16,185,129,0.2)] relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <button
                                onClick={() => setShowPlatformModal(false)}
                                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
                                    <Cloud className="w-8 h-8 text-emerald-400" />
                                    {language === 'es' ? '¿Qué usa tu colegio?' : 'What does your school use?'}
                                </h3>
                                <p className="text-slate-400 text-sm mb-6">
                                    {language === 'es' ? 'Elige la plataforma para sincronizar tus tareas' : 'Choose the platform to sync your tasks'}
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            sfx.playSuccess();
                                            setShowPlatformModal(false);
                                            onNavigate(ViewState.GOOGLE_CLASSROOM);
                                        }}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-emerald-500/20 border-2 border-emerald-500/30 hover:border-emerald-400 transition-all group text-left"
                                    >
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/59/Google_Classroom_Logo.png" alt="Google Classroom" className="w-12 h-12 rounded-xl" />
                                        <div className="flex-1">
                                            <div className="font-black text-white group-hover:text-emerald-300">Google Classroom</div>
                                            <div className="text-xs text-slate-400">{language === 'es' ? 'Disponible ahora' : 'Available now'}</div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>

                                    <button
                                        disabled
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border-2 border-slate-700/50 opacity-60 cursor-not-allowed text-left"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                            <span className="text-2xl">💼</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-400">Microsoft Teams</div>
                                            <div className="text-xs text-slate-500">{language === 'es' ? 'Próximamente' : 'Coming soon'}</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            sfx.playSuccess();
                                            setShowPlatformModal(false);
                                            onNavigate(ViewState.MOODLE_SYNC);
                                        }}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-orange-500/20 border-2 border-orange-500/30 hover:border-orange-400 transition-all group text-left"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                            <span className="text-2xl">📚</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-white group-hover:text-orange-300">Moodle</div>
                                            <div className="text-xs text-slate-400">{language === 'es' ? 'Disponible ahora' : 'Available now'}</div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </div>

                                <p className="text-xs text-slate-500 mt-6 text-center">
                                    {language === 'es' ? 'Google Classroom requiere cuenta del colegio (ej: alumno@colegio.edu.co)' : 'Google Classroom requires a school account (e.g. student@school.edu.co)'}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`container mx-auto lg:px-6 px-4 py-4 lg:py-6 h-full flex flex-col relative z-10 ${(isDemoStep2 || showResearchMission) ? 'pb-52' : ''}`}>

                {/* 🛰️ PREMIUM HUD HEADER */}
                <header className="flex flex-col lg:flex-row items-center justify-between mb-8 shrink-0 gap-6 relative">
                    <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-start">
                        <div className="flex items-center gap-5">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={loadAllMissions}
                                className="relative rounded-full p-3 border-2 border-cyan-400/50 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-105 transition-all"
                            >
                                <RefreshCw className={cn("w-6 h-6", isLoading && "animate-spin")} />
                            </Button>
                            <div className="relative">
                                <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter flex items-center gap-3">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-indigo-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">CENTRO DE MANDO</span>
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
                                    <p className="text-xs lg:text-sm text-cyan-400/80 font-black uppercase tracking-[0.2em]">Panel de Control Académico</p>
                                </div>
                            </div>
                        </div>

                        {isMobile && (
                            <div className="bg-[#0f172a]/80 backdrop-blur-md border border-white/10 rounded-3xl p-3 px-5 flex flex-col items-end gap-1 shadow-2xl">
                                <div className="text-[10px] font-black text-emerald-400 tracking-wider">PROGRESO: {progressPercent}%</div>
                                <div className="text-[10px] font-black text-yellow-400 tracking-wider">XP: {totalXP}</div>
                            </div>
                        )}
                    </div>

                    {!isMobile && (
                        <div className="flex gap-4">
                            {/* RADAR PROGRESS */}
                            <motion.div
                                whileHover={{ scale: 1.05, y: -2 }}
                                className="bg-[#0f172a]/60 backdrop-blur-xl rounded-2xl p-4 px-10 border border-white/10 flex flex-col items-center shadow-2xl overflow-hidden group min-w-[160px]"
                            >
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-1">PROGRESO GLOBAL</span>
                                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]">{progressPercent}%</div>
                                <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05, y: -2 }}
                                className="bg-[#0f172a]/60 backdrop-blur-xl rounded-2xl p-4 px-10 border border-white/10 flex flex-col items-center shadow-2xl overflow-hidden group min-w-[160px]"
                            >
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-1">EXPERIENCIA</span>
                                <div className="text-3xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)] flex items-center gap-2">
                                    {totalXP.toLocaleString()} <span className="text-xs text-yellow-500/50">XP</span>
                                </div>
                            </motion.div>

                            {/* HUD BUTTONS */}
                            <div className="flex bg-[#0f172a]/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10 gap-2 shadow-2xl">
                                <Button
                                    onClick={() => { sfx.playClick(); setShowPlatformModal(true); }}
                                    className="h-full rounded-xl px-6 py-8 flex flex-col items-center justify-center gap-2 transition-all duration-300 bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border-2 border-emerald-400/50 hover:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                                >
                                    <Cloud className="w-6 h-6" />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{language === 'es' ? 'SINCRONIZAR COLEGIO' : 'SYNC SCHOOL'}</span>
                                </Button>
                                <Button
                                    onClick={() => { setScanMode('EXAM'); setShowScanner(true); }}
                                    className={cn(
                                        "h-full rounded-xl px-6 py-8 flex flex-col items-center justify-center gap-2 transition-all duration-300",
                                        evalHighlight
                                            ? "bg-indigo-600 text-white border-2 border-cyan-400 shadow-[0_0_30px_rgba(99,102,241,0.6)] animate-pulse"
                                            : "bg-indigo-500/15 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-400/20 hover:border-indigo-400"
                                    )}
                                >
                                    <ScanLine className="w-6 h-6" />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">EVALUACIÓN</span>
                                </Button>
                                <Button
                                    onClick={() => { setScanMode('HOMEWORK'); setShowScanner(true); }}
                                    className="h-full rounded-xl bg-cyan-500/15 hover:bg-cyan-600 text-cyan-300 hover:text-white px-6 py-8 flex flex-col items-center justify-center gap-2 border border-cyan-400/20 hover:border-cyan-400 transition-all duration-300"
                                >
                                    <BookOpen className="w-6 h-6" />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">TAREA/AGENDA</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </header>

                <AnimatePresence>
                    {showScanner && (
                        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-slate-900 border-2 border-white/10 p-10 rounded-[3rem] max-w-lg w-full text-center relative overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.1)]"
                            >
                                {/* Background Glow */}
                                <div className={cn("absolute -top-24 -right-24 w-64 h-64 blur-[80px] opacity-20 animate-pulse rounded-full", scanMode === 'EXAM' ? 'bg-indigo-500' : 'bg-cyan-500')} />

                                <button
                                    onClick={() => {
                                        if (!isAnalyzing) {
                                            setShowScanner(false);
                                            setShowCameraView(false);
                                        }
                                    }}
                                    className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10"
                                >
                                    <X className="w-8 h-8" />
                                </button>

                                {showCameraView ? (
                                    <div className="space-y-6 w-full max-w-md mx-auto">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                                            Cámara activa
                                        </h3>
                                        <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] border-2 border-cyan-500/50">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex gap-4 justify-center">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowCameraView(false)}
                                                className="rounded-xl border-2 border-slate-500 text-slate-300 hover:bg-slate-800"
                                            >
                                                Volver
                                            </Button>
                                            <Button
                                                onClick={handleCapturePhoto}
                                                className={cn(
                                                    "rounded-xl font-black px-8 gap-2",
                                                    scanMode === 'EXAM' ? "bg-indigo-600 hover:bg-indigo-500" : "bg-cyan-600 hover:bg-cyan-500"
                                                )}
                                            >
                                                <Camera className="w-5 h-5" />
                                                Capturar foto
                                            </Button>
                                        </div>
                                    </div>
                                ) : isAnalyzing ? (
                                    <div className="py-12 space-y-10">
                                        <div className="relative w-48 h-48 mx-auto">
                                            {/* Rotating Rings */}
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-b-2 border-cyan-500 rounded-full" />
                                            <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-4 border-t-2 border-purple-500 rounded-full" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" />
                                                <ScanLine className="w-16 h-16 text-cyan-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Descifrando Pergamino...</h3>
                                            <p className="text-cyan-400/60 font-black text-xs uppercase tracking-[0.3em]">IA_ANALYSIS_IN_PROGRESS</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div className={cn("w-32 h-32 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform -rotate-3 border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all hover:rotate-0 hover:scale-110 duration-500 relative overflow-hidden group",
                                            scanMode === 'EXAM' ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-400" : "bg-cyan-600/20 border-cyan-500/50 text-cyan-400"
                                        )}>
                                            <Upload className="w-12 h-12 relative z-10" />
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover:animate-shine" />
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                                                {scanMode === 'EXAM' ? 'Escanear Examen' : 'Escanear Agenda'}
                                            </h3>
                                            <p className="text-slate-400 text-lg font-medium max-w-sm mx-auto">
                                                {scanMode === 'EXAM'
                                                    ? "Sube tu evaluación o toma una foto para que Nova cree un plan de estudio bilingüe."
                                                    : "Sube tu tarea o toma una foto de tu agenda y convertiremos cada tarea en una misión."}
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 px-4 w-full">
                                            <label className="flex-1 cursor-pointer group block">
                                                <input type="file" accept="image/*,.pdf" onChange={handleAnalyzeResult} className="hidden" />
                                                <div className={cn(
                                                    "h-24 sm:h-28 bg-gradient-to-r rounded-3xl flex items-center justify-center gap-3 text-white font-black text-lg sm:text-xl shadow-2xl group-hover:scale-[1.02] transition-all relative overflow-hidden border-b-8 border-black/30",
                                                    scanMode === 'EXAM' ? "from-indigo-600 to-indigo-800" : "from-cyan-600 to-cyan-800"
                                                )}>
                                                    <Upload className="w-8 h-8 group-hover:animate-pulse flex-shrink-0" />
                                                    <span className="tracking-widest uppercase italic">Subir archivo</span>
                                                    <div className="absolute inset-x-0 top-0 h-1 bg-white/20" />
                                                </div>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowCameraView(true)}
                                                className={cn(
                                                    "flex-1 h-24 sm:h-28 bg-gradient-to-r rounded-3xl flex items-center justify-center gap-3 text-white font-black text-lg sm:text-xl shadow-2xl hover:scale-[1.02] transition-all relative overflow-hidden border-b-8 border-black/30",
                                                    scanMode === 'EXAM' ? "from-indigo-500 to-indigo-700" : "from-cyan-500 to-cyan-700"
                                                )}
                                            >
                                                <Camera className="w-8 h-8 flex-shrink-0" />
                                                <span className="tracking-widest uppercase italic">Tomar foto</span>
                                                <div className="absolute inset-x-0 top-0 h-1 bg-white/20" />
                                            </button>
                                        </div>

                                        <div className="pt-4">
                                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">Protocolos de Seguridad Encriptados</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Main Grid / Stack */}
                <div className="flex-1 lg:grid lg:grid-cols-12 gap-6 min-h-0 relative">

                    {/* LEFT: Task List (The 'Log') - Hidden on Mobile if Task Selected */}
                    {/* 📜 LEFT: ANCIENT MISSION SCROLL (PERGAMINO) */}
                    {(!isMobile || !selectedTask) && (
                        <div className="col-span-12 lg:col-span-4 flex flex-col relative h-full">

                            {/* Scroll Top Roll */}
                            <div className="absolute -top-4 left-0 right-0 h-8 bg-[#e2c9a1] rounded-full border-b-4 border-black/10 shadow-lg z-30" />

                            {/* The Scroll Body */}
                            <div className="flex-1 bg-[#fdf2d9] rounded-[2rem] border-x-[12px] border-[#e2b06e] relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
                                {/* Paper Texture Overlay */}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] opacity-30 pointer-events-none" />

                                {/* Scroll Content Header */}
                                <div className="p-8 pt-10 border-b border-black/5 relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-serif text-3xl font-black text-amber-900 tracking-tighter drop-shadow-sm uppercase italic">
                                            Misiones Principales
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={() => { sfx.playClick(); setShowPlatformModal(true); }}
                                                className="lg:hidden rounded-xl px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 border-2 border-emerald-700 shadow-lg"
                                            >
                                                <Cloud className="w-4 h-4" />
                                                {language === 'es' ? 'Sincronizar' : 'Sync'}
                                            </Button>
                                            <FileText className="w-6 h-6 text-amber-800 opacity-50" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setActiveTab('SCHOOL')}
                                            className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                                activeTab === 'SCHOOL' ? "bg-amber-800 text-amber-50" : "bg-amber-200/50 text-amber-900/60 hover:bg-amber-200")
                                            }
                                        >📜 Campaña</button>
                                        <button
                                            onClick={() => setActiveTab('NOVA')}
                                            className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                                activeTab === 'NOVA' ? "bg-amber-800 text-amber-50" : "bg-amber-200/50 text-amber-900/60 hover:bg-amber-200")
                                            }
                                        >✨ Aventuras</button>
                                    </div>
                                </div>

                                {/* Mission List on Scroll */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
                                    {tasks.length === 0 && !isLoading && (
                                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                            <Rocket className="w-16 h-16 text-amber-600/60 mb-4" />
                                            <p className="font-serif text-lg font-bold text-amber-900/80 mb-2">{EMPTY_STATE_MESSAGES.missions('es').split('. ')[0]}.</p>
                                            <p className="text-sm text-amber-900/60 max-w-xs mb-6">{EMPTY_STATE_MESSAGES.missions('es').split('. ').slice(1).join('. ')}</p>
                                            <Button
                                                onClick={() => { sfx.playClick(); setShowPlatformModal(true); }}
                                                className="rounded-2xl px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center gap-3 border-2 border-emerald-700 shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.2)] transition-all"
                                            >
                                                <Cloud className="w-5 h-5" />
                                                {language === 'es' ? 'Sincronizar con mi colegio' : 'Sync with my school'}
                                            </Button>
                                        </div>
                                    )}
                                    {sortedGroups.map(([day, dayTasks]) => (
                                        <div key={day}>
                                            <h4 className="font-serif text-sm font-black text-amber-900/40 uppercase tracking-[0.2em] mb-4 ml-2 border-b border-amber-950/10 pb-1">
                                                {day}
                                            </h4>
                                            <div className="space-y-4">
                                                {dayTasks.map(task => (
                                                    <motion.div
                                                        key={task.id}
                                                        whileHover={{ x: 8, scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => { sfx.playTick(); setSelectedTask(task); }}
                                                        className={cn(
                                                            "p-5 rounded-2xl transition-all group relative overflow-hidden",
                                                            selectedTask?.id === task.id
                                                                ? "bg-amber-900/10 border-2 border-amber-900 shadow-xl"
                                                                : "bg-black/5 border-2 border-transparent hover:bg-black/10 hover:border-black/5"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4 relative z-10">
                                                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-black/10",
                                                                selectedTask?.id === task.id ? "bg-amber-900 text-amber-50" : "bg-amber-200 text-amber-800"
                                                            )}>
                                                                {SubjectIcons[task.subject]}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h5 className="font-serif font-black text-lg text-amber-950 truncate drop-shadow-sm leading-tight uppercase italic">{task.title}</h5>
                                                                <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mt-0.5">{task.subject}</p>
                                                            </div>
                                                            {task.status === 'COMPLETED' ? (
                                                                <CheckCircle className="w-5 h-5 text-green-700" />
                                                            ) : (
                                                                <ChevronRight className="w-5 h-5 text-amber-900/30 group-hover:text-amber-950 group-hover:translate-x-1 transition-all" />
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Scroll Bottom Roll */}
                            <div className="absolute -bottom-4 left-0 right-0 h-10 bg-[#c79a5b] rounded-full border-t-4 border-black/20 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] z-30 flex items-center justify-center">
                                <div className="w-32 h-1 bg-black/10 rounded-full" />
                            </div>
                        </div>
                    )}


                    {/* RIGHT: Task Detail - Full Screen on Mobile */}
                    {/* 🏝️ RIGHT: FLOATING ISLANDS LANDSCAPE */}
                    {(!isMobile || selectedTask) && (
                        <div className="col-span-12 lg:col-span-8 flex flex-col h-full absolute lg:relative inset-0 bg-slate-950 lg:bg-transparent z-30">
                            <AnimatePresence mode="wait">
                                {selectedTask ? (
                                    /* --- MISSION DETAIL TABLET --- */
                                    <motion.div
                                        key={selectedTask.id}
                                        initial={{ opacity: 0, rotateY: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        className="h-full flex items-center justify-center p-4 lg:p-12"
                                    >
                                        <div className="relative w-full max-w-4xl h-full max-h-[92%] lg:h-full lg:max-h-[90%] bg-cyan-900/10 backdrop-blur-3xl rounded-[3rem] border border-cyan-400/30 shadow-[0_0_100px_rgba(34,211,238,0.1)] overflow-hidden flex flex-col">
                                            {/* Tablet Top Bezel */}
                                            <div className="h-8 bg-black/40 flex items-center justify-center gap-2 border-b border-white/5 shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                                <div className="text-[10px] text-cyan-400/50 font-black uppercase tracking-[0.5em]">HOLOGRAPHIC_INTERFACE_V4</div>
                                            </div>

                                            {/* Tablet Content */}
                                            <div className="flex-1 p-6 lg:p-10 flex flex-col relative min-h-0">
                                                {/* Mobile Back Button */}
                                                {isMobile && (
                                                    <button onClick={() => setSelectedTask(null)} className="mb-6 flex items-center gap-2 text-cyan-400 font-black uppercase text-xs">
                                                        <ChevronRight className="w-4 h-4 rotate-180" /> REGRESAR AL MAPA
                                                    </button>
                                                )}

                                                {/* Mission Detail Header */}
                                                <div className="mb-6 shrink-0">
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <div className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg",
                                                            selectedTask.status === 'COMPLETED' ? "bg-green-500/20 text-green-400 border-green-500/40" : "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                                                        )}>
                                                            {selectedTask.status === 'COMPLETED' ? 'OPERACIÓN COMPLETADA' : 'ESTADO: DESPLEGANDO'}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{selectedTask.subject} // ID_{selectedTask.id.slice(0, 6)}</div>
                                                    </div>
                                                    <h2 className="text-3xl lg:text-5xl font-black text-white leading-[1.1] tracking-tighter uppercase italic drop-shadow-2xl">
                                                        {selectedTask.title}
                                                    </h2>
                                                </div>

                                                {/* Intelligence Report */}
                                                <div className="flex-1 bg-black/20 rounded-3xl p-6 lg:p-8 border border-white/5 mb-6 overflow-y-auto custom-scrollbar min-h-0">
                                                    <h4 className="text-[10px] font-black text-cyan-500/50 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                                        <ScanLine className="w-3 h-3" /> TRANSMISIÓN DE DATOS
                                                    </h4>
                                                    <p className="text-lg lg:text-2xl text-slate-200 font-medium leading-relaxed">
                                                        {selectedTask.description}
                                                    </p>
                                                </div>

                                                {/* Footer Actions & Rewards */}
                                                <div className="mt-auto flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 pb-12 lg:pb-0 border-t border-white/5 shrink-0">
                                                    <div className="flex gap-8">
                                                        <div>
                                                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">RECOMPENSA</div>
                                                            <div className="text-2xl font-black text-yellow-400">+{selectedTask.reward} XP</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">DIFICULTAD</div>
                                                            <div className="text-3xl font-black text-cyan-400">{selectedTask.difficulty}</div>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        onClick={() => { sfx.playClick(); handleLaunchMission(selectedTask); }}
                                                        className="w-full lg:w-auto h-16 px-10 bg-cyan-500 hover:bg-white text-black font-black text-lg rounded-2xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(34,211,238,0.4)] uppercase tracking-widest"
                                                    >
                                                        {getButtonText(selectedTask)}
                                                    </Button>
                                                </div>

                                                {/* Decorative Tablet Scanline */}
                                                <div className="absolute inset-x-0 top-0 h-1 bg-cyan-500/20 animate-scanline pointer-events-none" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* --- FLOATING ISLANDS MAP (EMPTY STATE) --- */
                                    <div className="h-full relative overflow-hidden flex items-center justify-center p-12">

                                        {/* Focal Point (Rocket/Command) */}
                                        <div className="relative z-20">
                                            <motion.div
                                                animate={{ y: [0, -20, 0], rotate: [0, 2, -2, 0] }}
                                                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                                                className="relative"
                                            >
                                                <div className="absolute inset-0 bg-cyan-500 rounded-full blur-[100px] opacity-20" />
                                                <Rocket className="w-56 h-56 text-slate-800 pointer-events-none drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]" />
                                            </motion.div>

                                            {/* Holographic Radar Rings */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-cyan-500/10 rounded-full animate-spin-slow" />
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-purple-500/10 rounded-full animate-reverse-spin" />
                                        </div>

                                        {/* Floating Islands Decor */}
                                        <motion.div
                                            animate={{ y: [0, 30, 0] }}
                                            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                                            className="absolute top-[10%] right-[10%] w-48 h-24 bg-slate-800 rounded-[50%] border-t-8 border-slate-700 shadow-2xl skew-x-12"
                                        >
                                            <div className="absolute -top-10 left-10 w-4 h-12 bg-purple-500/40 blur-xl animate-pulse" />
                                            <div className="absolute -top-6 left-10 w-2 h-8 bg-purple-400 rounded-full shadow-[0_0_15px_purple]" />
                                        </motion.div>

                                        <motion.div
                                            animate={{ y: [0, -40, 0] }}
                                            transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 1 }}
                                            className="absolute bottom-[15%] left-[5%] w-64 h-32 bg-slate-900 rounded-[50%] border-t-8 border-slate-800 shadow-2xl -skew-x-12"
                                        >
                                            <div className="absolute -top-12 right-12 w-6 h-16 bg-cyan-500/30 blur-xl animate-pulse" />
                                            <div className="absolute -top-8 right-12 w-3 h-10 bg-cyan-400 rounded-full shadow-[0_0_20px_cyan]" />
                                        </motion.div>

                                        {/* Welcome Text */}
                                        <div className="absolute bottom-20 left-0 right-0 text-center z-30">
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                                <h3 className="text-3xl font-black text-white uppercase tracking-widest italic mb-2">Sector Nova Controlado</h3>
                                                <p className="text-slate-500 font-bold uppercase tracking-[0.25em] text-sm">Selecciona una misión en el pergamino para iniciar</p>
                                            </motion.div>
                                        </div>

                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
