import React, { useState, useEffect, useRef } from 'react';
import {
    Users, BookOpen, BrainCircuit, GraduationCap,
    Clock, Award, ChevronRight, Calculator, Languages,
    Microscope, Palette, Music, Dumbbell, Globe, Calendar,
    CheckCircle2, XCircle, AlertCircle, TrendingUp,
    Shield, Star, Zap, Crown, Target, Gift,
    Trash2, Upload, FileText, Sparkles, ArrowRight,
    Settings, Check, Menu, X, Home, Ghost, Coins,
    Plus, Bot, Loader2, Bell, History, Building2,
    Bed, Utensils, Heart, FlaskConical, Flame, Trophy, Brain, PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    assignParentMission,
    getManagedStudents,
    fetchTutorReports,
    linkStudentByEmail,
    adminAwardCoins,
    adminAwardXP,
    consignToBank,
    getParentRewards,
    insertParentReward,
    deleteParentReward,
    subscribeToProfile,
    subscribeToEconomy,
    subscribeToLearning,
    getGoogleClassroomAssignments,
    updateStudentPreferences,
    getParentMissionsForParent,
    subscribeToParentMissions,
    subscribeToClassroomAssignments
} from '../../services/supabase';
import { notifyNewParentMission } from '../../services/notifications';
import { useLearning } from '../../context/LearningContext';
import { AvatarDisplay } from '../Gamification/AvatarDisplay';
import { callGeminiSocratic, callGeminiVision } from '../../services/gemini';
import type { Language } from '../../types';

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:image/...;base64,
        };
        reader.onerror = error => reject(error);
    });
}

interface ParentDashboardProps {
    parentId: string;
    language: Language;
}

// Mock Data for Progress Graph (could be enhanced later)
const progressData = [
    { day: 'Lun', coins: 120 },
    { day: 'Mar', coins: 180 },
    { day: 'Mié', coins: 150 },
    { day: 'Jue', coins: 210 },
    { day: 'Vie', coins: 250 },
    { day: 'Sáb', coins: 300 },
    { day: 'Dom', coins: 340 },
];

const choresList = [
    { id: 'chore1', label: { es: 'Arreglar la cama', en: 'Make the bed' }, coins: 25, icon: <Bed className="w-5 h-5 text-blue-500" /> },
    { id: 'chore2', label: { es: 'Lavar platos', en: 'Wash dishes' }, coins: 30, icon: <Utensils className="w-5 h-5 text-cyan-500" /> },
    { id: 'chore3', label: { es: 'Sacar la basura', en: 'Take out trash' }, coins: 20, icon: <Trash2 className="w-5 h-5 text-slate-600" /> },
    { id: 'chore4', label: { es: 'Ordenar su cuarto', en: 'Tidy room' }, coins: 35, icon: <Home className="w-5 h-5 text-green-500" /> },
    { id: 'chore5', label: { es: 'Poner la mesa', en: 'Set the table' }, coins: 20, icon: <Utensils className="w-5 h-5 text-orange-500" /> },
    { id: 'chore6', label: { es: 'Barrer o trapear', en: 'Sweep or mop' }, coins: 40, icon: <Home className="w-5 h-5 text-emerald-500" /> },
    { id: 'chore7', label: { es: 'Cuidar mascota', en: 'Pet care' }, coins: 35, icon: <Heart className="w-5 h-5 text-pink-500" /> },
    { id: 'chore8', label: { es: 'Ayudar con la ropa', en: 'Help with laundry' }, coins: 30, icon: <Star className="w-5 h-5 text-violet-500" /> },
    { id: 'chore9', label: { es: 'Comer vegetales', en: 'Eat vegetables' }, coins: 25, icon: <Utensils className="w-5 h-5 text-lime-500" /> },
    { id: 'chore10', label: { es: 'Meta de lectura', en: 'Reading goal' }, coins: 50, icon: <BookOpen className="w-5 h-5 text-amber-500" /> },
];

const realRewardsOptions = [
    { id: 'r1', label: { es: '15 min extra de pantalla', en: '15 min extra screen time' } },
    { id: 'r2', label: { es: 'Helado o postre', en: 'Ice cream or dessert' } },
    { id: 'r3', label: { es: 'Elegir la película', en: 'Choose the movie' } },
    { id: 'r4', label: { es: 'Salida al parque', en: 'Trip to the park' } },
    { id: 'r5', label: { es: 'Hora de juego extra', en: 'Extra play time' } },
    { id: 'r6', label: { es: 'Pizza o comida favorita', en: 'Pizza or favorite food' } },
];

export function ParentDashboard({ parentId, language }: ParentDashboardProps) {
    const { reports } = useLearning();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'summaries' | 'awards' | 'rewards' | 'school_sync' | 'settings'>('dashboard');
    const [students, setStudents] = useState<any[]>([]);
    const [activeStudentIdx, setActiveStudentIdx] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [rewards, setRewards] = useState<{ id: string; name: string; cost: number; description: string }[]>([]);
    const [rewardsLoading, setRewardsLoading] = useState(false);
    const [aiAlerts, setAiAlerts] = useState<any[]>([]);

    // School Sync State
    const [schoolConfig, setSchoolConfig] = useState({
        minGrade: 0,
        maxGrade: 100,
        passingGrade: 70
    });
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<any>(null);
    const [classroomAssignments, setClassroomAssignments] = useState<any[]>([]);
    const [isLoadingClassroom, setIsLoadingClassroom] = useState(false);
    const [studentReports, setStudentReports] = useState<any[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(false);
    const [assignedMissions, setAssignedMissions] = useState<any[]>([]);
    const [isLinking, setIsLinking] = useState(false);
    const [emailToLink, setEmailToLink] = useState('');
    const [isLinkingLoading, setIsLinkingLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Missing States for Modals
    const [showAddReward, setShowAddReward] = useState(false);
    const [showCustomAward, setShowCustomAward] = useState(false);
    const [customAward, setCustomAward] = useState({ reason: '', amount: '' });
    const [newReward, setNewReward] = useState({ name: '', cost: '', description: '' });
    const [choreWithRealReward, setChoreWithRealReward] = useState<{ choreLabel: string; coins: number } | null>(null);

    const loadStudents = async () => {
        setIsLoading(true);
        const dbData = await getManagedStudents(parentId);

        // --- LOCAL STORAGE BACKUP RECOVERY ---
        try {
            const backupKey = `nova_students_backup_${parentId}`;
            const localBackup = localStorage.getItem(backupKey);

            if (localBackup && dbData.length > 0) {
                const localData = JSON.parse(localBackup);

                // Intelligent Merge: Use the version with MORE coins/xp to avoid regression
                const mergedData = dbData.map((dbStudent: any) => {
                    const localStudent = localData.find((ls: any) => ls.id === dbStudent.id);
                    if (!localStudent) return dbStudent;

                    const dbCoins = dbStudent.economy?.[0]?.coins || 0;
                    const localCoins = localStudent.economy?.[0]?.coins || 0;

                    const dbXP = dbStudent.learning_progress?.[0]?.total_xp || 0;
                    const localXP = localStudent.learning_progress?.[0]?.total_xp || 0;

                    // If local has more progress, use local economy/progress structures
                    if (localCoins > dbCoins || localXP > dbXP) {
                        return {
                            ...dbStudent,
                            economy: localStudent.economy,
                            learning_progress: localStudent.learning_progress
                        };
                    }
                    return dbStudent;
                });

                setStudents(mergedData);
            } else {
                setStudents(dbData);
            }
        } catch (e) {
            console.error("Error reading local backup", e);
            setStudents(dbData);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        loadStudents();
    }, [parentId]);

    // Load parent rewards from Supabase (persisten tras logout)
    const activeStudent = students[activeStudentIdx];
    useEffect(() => {
        if (!parentId || !activeStudent?.id) {
            setRewards([]);
            return;
        }
        let cancelled = false;
        setRewardsLoading(true);
        getParentRewards(parentId, activeStudent.id).then((rows) => {
            if (!cancelled) {
                setRewards(rows.map((r) => ({ id: r.id, name: r.name, cost: r.cost, description: r.description || '' })));
            }
            setRewardsLoading(false);
        });
        return () => { cancelled = true; };
    }, [parentId, activeStudentIdx, activeStudent?.id]);

    // REAL-TIME UPDATES FOR STUDENTS (Avatar, Coins, XP)
    useEffect(() => {
        if (students.length === 0) return;

        const subs: (() => void)[] = [];

        students.forEach(student => {
            // 1. Profile (Avatar changes)
            subs.push(subscribeToProfile(student.id, (newProfile) => {
                setStudents(prev => prev.map(s => s.id === student.id ? { ...s, ...newProfile } : s));
            }));

            // 2. Economy (Coins & Savings)
            subs.push(subscribeToEconomy(student.id, (newEconomyData) => {
                setStudents(prev => prev.map(s => {
                    if (s.id !== student.id) return s;
                    // Update nested economy object
                    const newEconomy = [{
                        ...s.economy?.[0],
                        coins: newEconomyData.coins,
                        savings_balance: newEconomyData.savings_balance
                    }];
                    return { ...s, economy: newEconomy };
                }));
            }));

            // 3. Learning (XP)
            subs.push(subscribeToLearning(student.id, (newProgress) => {
                setStudents(prev => prev.map(s => {
                    if (s.id !== student.id) return s;
                    const newLearning = [newProgress];
                    return { ...s, learning_progress: newLearning };
                }));
            }));
        });

        return () => {
            subs.forEach(unsub => unsub());
        };
    }, [students.map(s => s.id).join(',')]); // Re-sub only if list changes


    // Save to backup whenever students change
    useEffect(() => {
        if (students.length > 0) {
            localStorage.setItem(`nova_students_backup_${parentId}`, JSON.stringify(students));
        }
    }, [students, parentId]);

    useEffect(() => {
        const loadClassroom = async () => {
            if (!activeStudent) return;
            // Only set loading on first load if empty
            if (classroomAssignments.length === 0) setIsLoadingClassroom(true);
            try {
                const data = await getGoogleClassroomAssignments(activeStudent.id);
                setClassroomAssignments(data);
            } catch (error) {
                // Suppress 400 errors for classroom (common if not linked)
                console.warn("Classroom sync note:", error);
                setClassroomAssignments([]);
            } finally {
                setIsLoadingClassroom(false);
            }
        };

        loadClassroom();

        const unsubClassroom = subscribeToClassroomAssignments(activeStudent?.id, () => {
            console.log("🔔 Cambio en Classroom detectado, recargando...");
            loadClassroom();
        });

        return () => {
            unsubClassroom();
        };
    }, [activeStudent]);

    useEffect(() => {
        const loadReports = async () => {
            if (!activeStudent) return;
            setIsLoadingReports(true);
            try {
                const data = await fetchTutorReports(activeStudent.id);
                setStudentReports(data);
            } catch (error) {
                console.error("Error loading reports:", error);
            } finally {
                setIsLoadingReports(false);
            }
        };

        const loadMissions = async () => {
            if (!activeStudent) return;
            try {
                const data = await getParentMissionsForParent(activeStudent.id);
                setAssignedMissions(data);
            } catch (error) {
                console.error("Error loading missions:", error);
            }
        };

        loadReports();
        loadMissions();

        // Subscribe to missions
        const unsubMissions = subscribeToParentMissions(activeStudent?.id, () => {
            console.log("🔔 Cambio en misiones detectado, recargando...");
            loadMissions();
        });

        return () => {
            unsubMissions();
        };
    }, [activeStudent]);

    // Preferences State
    const [interests, setInterests] = useState<string[]>([]);
    const [faveAnimals, setFaveAnimals] = useState<string[]>([]);
    const [isSavingPrefs, setIsSavingPrefs] = useState(false);

    useEffect(() => {
        if (activeStudent) {
            setInterests(activeStudent.learning_interests || []);
            setFaveAnimals(activeStudent.favorite_animals || []);
        }
    }, [activeStudentIdx, students]);

    const handleAddReward = async () => {
        if (!newReward.name || !newReward.cost || !activeStudent?.id) return;
        const cost = parseInt(newReward.cost, 10);
        if (isNaN(cost) || cost < 0) {
            toast.error(language === 'es' ? 'Ingresa una cantidad válida.' : 'Enter a valid amount.');
            return;
        }
        const row = await insertParentReward(parentId, activeStudent.id, {
            name: newReward.name,
            cost,
            description: newReward.description || ''
        });
        if (row) {
            setRewards((prev) => [...prev, { id: row.id, name: row.name, cost: row.cost, description: row.description || '' }]);
            setNewReward({ name: '', cost: '', description: '' });
            setShowAddReward(false);
            toast.success(language === 'es' ? 'Premio guardado en tu cuenta.' : 'Reward saved to your account.');
        } else {
            toast.error(language === 'es' ? 'No se pudo guardar el premio.' : 'Could not save reward.');
        }
    };

    const handleCustomAwardSubmit = async () => {
        if (!activeStudent || !customAward.reason || !customAward.amount) return;

        const amt = parseInt(customAward.amount);
        if (isNaN(amt) || amt <= 0) {
            toast.error("Por favor ingresa una cantidad válida.");
            return;
        }
        const xpAmount = amt;

        // 1. Optimistic Update (Immediate Feedback)
        const previousStudents = JSON.parse(JSON.stringify(students)); // Deep copy for rollback
        const updatedStudents = [...students];

        // Update Coins
        if (updatedStudents[activeStudentIdx].economy?.[0]) {
            updatedStudents[activeStudentIdx].economy[0].coins += amt;
        } else {
            updatedStudents[activeStudentIdx].economy = [{ coins: amt }];
        }

        // Update XP
        if (updatedStudents[activeStudentIdx].learning_progress?.[0]) {
            updatedStudents[activeStudentIdx].learning_progress[0].total_xp += xpAmount;
        } else {
            updatedStudents[activeStudentIdx].learning_progress = [{
                total_xp: xpAmount,
                quests_by_category: { math: 0, science: 0, language: 0 },
                total_quests_completed: 0
            }];
        }

        setStudents(updatedStudents);
        setCustomAward({ reason: '', amount: '' });
        setShowCustomAward(false);

        // 2. Background Save
        try {
            // Now conbsigning to Bank instead of direct wallet coins
            const coinsSuccess = await consignToBank(activeStudent.id, amt);
            const xpSuccess = await adminAwardXP(activeStudent.id, xpAmount);

            if (coinsSuccess && xpSuccess) {
                toast.success(`¡Consignación exitosa de ${amt} coins al Nova Bank!`);
                setTimeout(() => loadStudents(), 800);
            } else {
                // Soft Fail / Offline Mode
                console.warn("Backend sync failed, using local state.");
                toast.success(`¡Consignación registrada! (Guardado Offline)`, {
                    description: "Se sincronizará cuando la conexión se restablezca."
                });
            }
        } catch (error) {
            console.error(error);
            // Keep optimistic update
        }
    };

    const handleAwardCoins = async (reason: string, amt: number) => {
        if (!activeStudent) return;
        const xpAmount = amt;

        // 1. Optimistic UI Update
        const updatedStudents = [...students];

        if (updatedStudents[activeStudentIdx].economy?.[0]) {
            updatedStudents[activeStudentIdx].economy[0].coins += amt;
        } else {
            updatedStudents[activeStudentIdx].economy = [{ coins: amt }];
        }

        if (updatedStudents[activeStudentIdx].learning_progress?.[0]) {
            updatedStudents[activeStudentIdx].learning_progress[0].total_xp += xpAmount;
        } else {
            updatedStudents[activeStudentIdx].learning_progress = [{
                total_xp: xpAmount,
                quests_by_category: { math: 0, science: 0, language: 0 },
                total_quests_completed: 0
            }];
        }

        setStudents(updatedStudents);

        // 2. Background Save
        try {
            // Consign to Bank
            const coinsSuccess = await consignToBank(activeStudent.id, amt);
            const xpSuccess = await adminAwardXP(activeStudent.id, xpAmount);

            if (coinsSuccess && xpSuccess) {
                toast.success(`¡Has consignado ${amt} coins al Nova Bank por "${reason}"!`);
                setTimeout(() => loadStudents(), 800);
            } else {
                toast.success(`¡Depósito realizado! (Pendiente de nube)`);
            }
        } catch (error) {
            console.error(error);
            // Even on error, we keep the optimistic update so user is happy
        }
    };

    const handleChoreAward = async (chore: typeof choresList[0]) => {
        const label = chore.label[language === 'es' ? 'es' : 'en'];
        await handleAwardCoins(label, chore.coins);
        setChoreWithRealReward({ choreLabel: label, coins: chore.coins });
    };

    const handleSelectRealReward = (reward: typeof realRewardsOptions[0]) => {
        const label = reward.label[language === 'es' ? 'es' : 'en'];
        toast.success(
            language === 'es'
                ? `¡Perfecto! ${choreWithRealReward?.choreLabel || 'Labor'} completada. Recuerda darle: ${label}`
                : `Great! ${choreWithRealReward?.choreLabel || 'Chore'} done. Remember to give: ${label}`,
            { duration: 4000 }
        );
        setChoreWithRealReward(null);
    };



    const handleDeleteReward = async (id: string) => {
        if (!activeStudent?.id) return;
        const ok = await deleteParentReward(parentId, id, activeStudent.id);
        if (ok) {
            setRewards((prev) => prev.filter((r) => r.id !== id));
            toast.info(language === 'es' ? 'Premio eliminado.' : 'Reward removed.');
        } else {
            toast.error(language === 'es' ? 'No se pudo eliminar.' : 'Could not remove.');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        try {
            const b64 = await fileToBase64(file);
            const visionPrompt = `
                Eres Nova, una IA experta en pedagogía y análisis de boletines escolares.
                Analiza la imagen de este boletín o evaluación.
                Tu objetivo es:
                1. Extraer las materias y sus notas.
                2. Identificar debilidades (áreas con notas bajas).
                3. Proponer un plan de acción con misiones socráticas para el tutor Nova.

                Utiliza estos umbrales para el 'status' (escala 0-100):
                - < ${schoolConfig.passingGrade} : "danger"
                - < ${schoolConfig.passingGrade + 10} : "warning"
                - Resto: "good"

                Responde ÚNICAMENTE con este JSON exacto:
                {
                  "detectedText": "Breve descripción",
                  "subjects": [
                    { "name": "Materia", "grade": 85, "status": "good", "analysis": "...", "evaluations": [{ "name": "Examen", "type": "Sumativa", "grade": 80 }] }
                  ],
                  "planProposal": [
                    { "subject": "Materia", "task": "Nombre de la misión", "topic": "Tema específico para el tutor (ej: multiplicaciones)", "focus": "Explicación" }
                  ]
                }

                Idioma: ESPAÑOL.
            `;

            const result = await callGeminiVision(visionPrompt, b64, file.type);
            setScanResult(result);

            const hasDanger = result.subjects.some((s: any) => s.status === 'danger');
            if (hasDanger) {
                toast.error(language === 'es' ? "¡ATENCIÓN! Se han detectado fallos críticos que requieren acción inmediata." : "ATTENTION! Critical failures detected requiring immediate action.");
            } else {
                toast.success(language === 'es' ? "Análisis completado con éxito." : "Analysis completed successfully.");
            }
        } catch (error) {
            console.error("Error en scanner:", error);
            toast.error(language === 'es' ? "No se pudo analizar el boletín. Revisa tu conexión o la API Key." : "Could not analyze report. Check your connection or API Key.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleSyncPlan = async () => {
        if (!scanResult || !activeStudent || !parentId) return;

        setIsScanning(true);
        try {
            console.log("Starting plan sync for student:", activeStudent.id, "Parent:", parentId);
            for (const p of scanResult.planProposal) {
                console.log("Assigning mission:", p.task);
                await assignParentMission({
                    student_id: activeStudent.id,
                    parent_id: parentId,
                    title: p.task,
                    category: p.subject.toLowerCase().includes('mat') ? 'math' :
                        (p.subject.toLowerCase().includes('ing') || p.subject.toLowerCase().includes('leng')) ? 'language' :
                            (p.subject.toLowerCase().includes('soc') || p.subject.toLowerCase().includes('hist')) ? 'history' :
                                (p.subject.toLowerCase().includes('cie') || p.subject.toLowerCase().includes('nat')) ? 'science' :
                                    p.subject.toLowerCase().includes('art') ? 'art' :
                                        p.subject.toLowerCase().includes('tec') ? 'tech' : 'general',
                    reward_coins: 100,
                    reward_xp: 200,
                    metadata: {
                        topic: p.topic || p.subject,
                        mode: 'remedial',
                        source: 'bulletin_scan'
                    }
                });
            }

            // Optional: notify student
            try {
                await notifyNewParentMission(activeStudent.id, "¡Nueva Ruta de Aprendizaje Activa!");
            } catch (e) {
                console.warn("Notification failed, but mission saved", e);
            }

            toast.success(language === 'es' ? "¡Plan activado con éxito! El estudiante verá sus nuevas misiones en su panel." : "Plan successfully activated! The student will see their new missions.");
            setScanResult(null); // Clear result after successful sync
        } catch (error: any) {
            console.error("Critical error syncing plan:", error);
            const errorMsg = error?.message || "Error desconocido";
            toast.error(language === 'es' ? `Error al activar el plan: ${errorMsg}. Revisa la base de datos.` : `Error activating plan: ${errorMsg}. Check database.`);
        } finally {
            setIsScanning(false);
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const handleAssignSpecialMission = async (alert: any) => {
        if (!activeStudent || !parentId) return;

        try {
            const missionData = {
                student_id: activeStudent.id,
                parent_id: parentId,
                title: alert.title,
                category: alert.id.includes('math') ? 'math' : alert.id.includes('science') ? 'science' : 'general',
                reward_coins: 100, // Extra reward for parent missions
                reward_xp: 200
            };

            await assignParentMission(missionData);
            await notifyNewParentMission(activeStudent.id, alert.title);
            toast.success(language === 'es' ? "¡Misión Especial enviada al estudiante!" : "Special Mission sent to student!");
        } catch (error) {
            console.error("Error assigning mission:", error);
            toast.error(language === 'es' ? "Error al asignar misión." : "Error assigning mission.");
        }
    };

    const handleLinkStudent = async () => {
        if (!emailToLink.trim()) return;
        setIsLinkingLoading(true);
        try {
            const result = await linkStudentByEmail(emailToLink, parentId);
            if (result.success) {
                toast.success(result.message);
                setEmailToLink('');
                setIsLinking(false);
                await loadStudents();
            } else {
                toast.error(result.message);
            }
        } catch (error: any) {
            toast.error(error.message || "Error al vincular estudiante");
        } finally {
            setIsLinkingLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-fredoka text-indigo-600 animate-pulse">Cargando datos de tus pequeños genios...</p>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-[3rem] shadow-xl">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-12 h-12 text-indigo-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">¡Bienvenido al Panel de Padres!</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    Aún no tienes estudiantes vinculados a tu cuenta. Ingresa el correo de tu hijo para conectarlo.
                </p>

                {isLinking ? (
                    <div className="max-w-sm mx-auto space-y-4">
                        <Input
                            value={emailToLink}
                            onChange={(e) => setEmailToLink(e.target.value)}
                            placeholder="correo@estudiante.com"
                            className="bg-slate-50 border-slate-200 h-12 rounded-xl text-center"
                        />
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setIsLinking(false)}
                                variant="outline"
                                className="flex-1 h-12 rounded-xl"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleLinkStudent}
                                disabled={isLinkingLoading}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl shadow-lg shadow-indigo-100"
                            >
                                {isLinkingLoading ? 'Vinculando...' : 'Confirmar'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        onClick={() => setIsLinking(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-2xl"
                    >
                        Solicitar Vinculación
                    </Button>
                )}
            </div>
        );
    }

    const generateAIAlerts = (studentProgress: any) => {
        if (!activeStudent || !studentProgress) return [];
        const alerts = [];

        // 1. Category Imbalance
        const categories = studentProgress.quests_by_category || { math: 0, science: 0, language: 0 };
        const total = Object.values(categories).reduce((a: any, b: any) => a + b, 0) as number;
        if (total > 5) {
            if (categories.math < total * 0.1) {
                alerts.push({
                    id: 'low-math',
                    type: 'insight',
                    title: language === 'es' ? 'Oportunidad en Matemáticas' : 'Math Opportunity',
                    text: language === 'es'
                        ? `${activeStudent.name} ha estado muy activo en otras áreas, pero ha practicado poco Matemáticas esta semana.`
                        : `${activeStudent.name} has been very active in other areas, but hasn't practiced Math much this week.`,
                    icon: <Calculator className="w-5 h-5" />,
                    color: 'indigo'
                });
            }
            if (categories.science < total * 0.1) {
                alerts.push({
                    id: 'low-science',
                    type: 'insight',
                    title: language === 'es' ? 'Exploración de Ciencias' : 'Science Exploration',
                    text: language === 'es'
                        ? `${activeStudent.name} podría divertirse más explorando temas de Ciencias Naturales.`
                        : `${activeStudent.name} could have more fun exploring Natural Science topics.`,
                    icon: <FlaskConical className="w-5 h-5" />,
                    color: 'emerald'
                });
            }
        }

        // 2. Streak Alert
        if (studentProgress.current_streak === 0) {
            alerts.push({
                id: 'no-streak',
                type: 'warning',
                title: language === 'es' ? 'Racha en Pausa' : 'Streak on Pause',
                text: language === 'es'
                    ? `¡Es un buen momento para recordar a ${activeStudent.name} que mantenga su racha de estudio!`
                    : `It's a good time to remind ${activeStudent.name} to keep up their study streak!`,
                icon: <Flame className="w-5 h-5" />,
                color: 'orange'
            });
        }

        // 3. Classroom Pending
        const pendingTasks = classroomAssignments.filter(a => a.submission_state === 'NEW' || a.submission_state === 'CREATED').length;
        if (pendingTasks > 0) {
            alerts.push({
                id: 'classroom-pending',
                type: 'task',
                title: language === 'es' ? 'Tareas de Classroom' : 'Classroom Tasks',
                text: language === 'es'
                    ? `${activeStudent.name} tiene ${pendingTasks} tareas pendientes por entregar en Google Classroom.`
                    : `${activeStudent.name} has ${pendingTasks} tasks pending to turn in on Google Classroom.`,
                icon: <BookOpen className="w-5 h-5" />,
                color: 'blue'
            });
        }

        return alerts;
    };

    const progress = activeStudent.learning_progress?.[0] || {
        total_xp: 0,
        total_quests_completed: 0,
        current_streak: 0,
        quests_by_category: { math: 0, science: 0, language: 0, social_studies: 0 }
    };

    const studentLevel = Math.floor(progress.total_xp / 1000) + 1;
    const currentLevelXp = progress.total_xp % 1000;
    const coins = activeStudent.economy?.[0]?.coins || 0;
    const savingsBalance = activeStudent.economy?.[0]?.savings_balance || 0;
    const aiAlertsList = generateAIAlerts(progress);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">

            {/* Premium Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 to-slate-900 p-8 rounded-[3rem] text-white shadow-2xl border border-white/10">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                    <Target className="w-64 h-64 rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-2">
                                <AvatarDisplay
                                    size="lg"
                                    avatarId={activeStudent.avatar}
                                    accessoriesOverride={activeStudent.equipped_accessories}
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-indigo-950 font-black px-2 py-0.5 rounded-lg text-xs">
                                LVL {studentLevel}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black font-fredoka tracking-tight">
                                {language === 'es' ? 'Panel de' : 'Parent Panel'} <span className="text-indigo-400">{activeStudent.name}</span>
                            </h1>
                            <p className="text-indigo-200/70 font-medium">
                                {language === 'es' ? 'Supervisando el crecimiento de tu pequeño genio.' : 'Monitoring your little genius growth.'}
                            </p>

                            <div className="flex gap-3 mt-4">
                                <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    <span className="text-xs font-bold">{progress.total_xp} XP</span>
                                </div>
                                <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs font-bold">{progress.total_quests_completed} {language === 'es' ? 'Logros' : 'Achievements'}</span>
                                </div>
                                <div className="bg-white/5 px-3 py-1.5 rounded-full border border-orange-500/30 flex items-center gap-2">
                                    <Coins className="w-4 h-4 text-orange-400" />
                                    <span className="text-xs font-bold text-orange-200">{coins} <span className="text-[10px] opacity-60">Cartera</span></span>
                                </div>
                                <div className="bg-white/5 px-3 py-1.5 rounded-full border border-emerald-500/30 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs font-bold text-emerald-200">{savingsBalance} <span className="text-[10px] opacity-60">Nova Bank</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-right">
                        <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Progreso de Nivel</div>
                        <div className="w-48 h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentLevelXp / 1000) * 100}%` }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            />
                        </div>
                        <div className="text-[10px] text-white/40 font-bold">{currentLevelXp}/1000 XP para el siguiente nivel</div>
                    </div>
                </div>

                {/* Student Selector if multiple */}
                {students.length > 1 && (
                    <div className="flex gap-2 mt-8">
                        {students.map((s, idx) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveStudentIdx(idx)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                    activeStudentIdx === idx
                                        ? "bg-indigo-500 text-white"
                                        : "bg-white/5 text-white/60 hover:bg-white/10"
                                )}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Tabs Navigation */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-slate-100 rounded-[1.5rem] border border-slate-200">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp className="w-4 h-4" /> },
                    { id: 'summaries', label: 'Aprendizaje', icon: <Brain className="w-4 h-4" /> },
                    { id: 'school_sync', label: 'Colegio', icon: <FileText className="w-4 h-4" /> },
                    { id: 'awards', label: 'Premios', icon: <Gift className="w-4 h-4" /> },
                    { id: 'settings', label: 'Intereses', icon: <Settings className="w-4 h-4" /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
                            activeTab === tab.id
                                ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100'
                                : 'text-slate-500 hover:text-slate-800'
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Dynamic Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'dashboard' && (
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Learning Powers Card (Reused from HallOfFame style but parent-focused) */}
                            <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                                <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                    <Brain className="w-8 h-8 text-indigo-600" />
                                    {language === 'es' ? `Poderes de ${activeStudent.name}` : `${activeStudent.name}'s Subject Mastery`}
                                </h3>

                                <div className="space-y-8">
                                    {[
                                        { id: 'spanish', label: { es: 'Lengua Castellana', en: 'Spanish' }, icon: '📚', value: progress.quests_by_category.language || 0, color: 'indigo' },
                                        { id: 'english', label: { es: 'Inglés', en: 'English' }, icon: '🇬🇧', value: progress.quests_by_category.language || 0, color: 'blue' },
                                        { id: 'math', label: { es: 'Matemáticas', en: 'Math' }, icon: '🧮', value: progress.quests_by_category.math || 0, color: 'rose' },
                                        { id: 'science', label: { es: 'Ciencias Naturales', en: 'Science' }, icon: '🔬', value: progress.quests_by_category.science || 0, color: 'emerald' },
                                        { id: 'social', label: { es: 'Ciencias Sociales', en: 'Social' }, icon: '🌎', value: progress.quests_by_category.social_studies || 0, color: 'orange' },
                                        { id: 'arts', label: { es: 'Educación Artística', en: 'Arts' }, icon: '🎨', value: progress.quests_by_category.arts || 0, color: 'purple' },
                                        { id: 'pe', label: { es: 'Educación Física', en: 'PE' }, icon: '⚽', value: progress.quests_by_category.pe || 0, color: 'amber' },
                                        { id: 'tech', label: { es: 'Tecnología', en: 'Tech' }, icon: '💻', value: progress.quests_by_category.tech || 0, color: 'slate' },
                                        { id: 'ethics', label: { es: 'Valores y Ética', en: 'Ethics' }, icon: '🤝', value: progress.quests_by_category.ethics || 0, color: 'indigo' }
                                    ].map((subject) => (
                                        <div key={subject.id} className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm", {
                                                        'bg-indigo-50 text-indigo-600': subject.color === 'indigo',
                                                        'bg-blue-50 text-blue-600': subject.color === 'blue',
                                                        'bg-rose-50 text-rose-600': subject.color === 'rose',
                                                        'bg-emerald-50 text-emerald-600': subject.color === 'emerald',
                                                        'bg-orange-50 text-orange-600': subject.color === 'orange',
                                                        'bg-purple-50 text-purple-600': subject.color === 'purple',
                                                        'bg-amber-50 text-amber-600': subject.color === 'amber',
                                                        'bg-slate-50 text-slate-600': subject.color === 'slate'
                                                    })}>
                                                        {subject.icon}
                                                    </div>
                                                    <div>
                                                        <div className="text-xl font-black text-slate-800">{subject.label[language === 'es' ? 'es' : 'en']}</div>
                                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                            Nivel: {subject.value >= 10 ? 'Maestro' : subject.value >= 5 ? 'Avanzado' : 'Iniciante'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-2xl font-black text-slate-700">{subject.value}</div>
                                            </div>
                                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min((subject.value / 20) * 100, 100)}%` }}
                                                    className={cn("h-full rounded-full transition-all duration-1000", {
                                                        'bg-indigo-500': subject.color === 'indigo',
                                                        'bg-blue-500': subject.color === 'blue',
                                                        'bg-rose-500': subject.color === 'rose',
                                                        'bg-emerald-500': subject.color === 'emerald',
                                                        'bg-orange-500': subject.color === 'orange',
                                                        'bg-purple-500': subject.color === 'purple',
                                                        'bg-amber-500': subject.color === 'amber',
                                                        'bg-slate-500': subject.color === 'slate'
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <div className="space-y-6">
                                {/* Next Goal Card */}
                                <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-6 relative overflow-hidden">
                                    <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                    <CardTitle className="text-lg mb-4 flex items-center gap-2">
                                        <Target className="w-5 h-5" /> Siguiente Meta
                                    </CardTitle>
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                        <div className="font-bold text-lg mb-1">Ir al cine</div>
                                        <p className="text-xs text-indigo-100 mb-4 tracking-wide">Faltan 60 moneditas para ganar este premio familiar.</p>
                                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} className="h-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                                        </div>
                                        <div className="flex justify-between mt-2 text-[10px] font-bold uppercase opacity-80">
                                            <span>840 / 900 Coins</span>
                                            <span>84%</span>
                                        </div>
                                    </div>
                                </Card>

                                {/* Activity Summary */}
                                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-6">
                                    <CardTitle className="text-lg mb-4 flex items-center gap-2 font-black">
                                        <Bell className="w-5 h-5 text-indigo-500" /> Alertas Académicas
                                    </CardTitle>
                                    <div className="space-y-4">
                                        {aiAlertsList.length === 0 ? (
                                            <div className="text-center py-8 text-slate-400">
                                                <p className="text-xs font-bold uppercase tracking-widest">Sin alertas pendientes</p>
                                            </div>
                                        ) : (
                                            aiAlertsList.slice(0, 3).map((alert) => (
                                                <div key={alert.id} className={cn("flex gap-3 p-3 rounded-2xl border transition-all", {
                                                    'bg-indigo-50 border-indigo-100': alert.color === 'indigo',
                                                    'bg-orange-50 border-orange-100': alert.color === 'orange',
                                                    'bg-blue-50 border-blue-100': alert.color === 'blue',
                                                    'bg-emerald-50 border-emerald-100': alert.color === 'emerald',
                                                })}>
                                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white", {
                                                        'bg-indigo-500': alert.color === 'indigo',
                                                        'bg-orange-500': alert.color === 'orange',
                                                        'bg-blue-500': alert.color === 'blue',
                                                        'bg-emerald-500': alert.color === 'emerald',
                                                    })}>
                                                        {alert.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800 leading-tight">{alert.title}</p>
                                                        <p className="text-[10px] text-slate-500 mt-1 font-medium leading-tight line-clamp-2">
                                                            {alert.text}
                                                        </p>
                                                        {alert.type !== 'task' && (
                                                            <button
                                                                onClick={() => handleAssignSpecialMission(alert)}
                                                                className="mt-2 text-[8px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                                            >
                                                                <PlusCircle className="w-3 h-3" />
                                                                {language === 'es' ? 'Asignar Misión Extra' : 'Assign Extra Mission'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </Card>


                                {/* Assigned Missions Status */}
                                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-6">
                                    <CardTitle className="text-lg mb-4 flex items-center gap-2 font-black">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        {language === 'es' ? 'Misiones Asignadas' : 'Assigned Missions'}
                                    </CardTitle>
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {assignedMissions.length === 0 ? (
                                            <p className="text-sm text-slate-400 font-medium italic">
                                                {language === 'es' ? 'No hay misiones activas.' : 'No active missions.'}
                                            </p>
                                        ) : (
                                            assignedMissions.map((mission) => (
                                                <div key={mission.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700 leading-tight">{mission.title}</p>
                                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">{mission.category}</p>
                                                    </div>
                                                    <div className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                                        mission.is_completed
                                                            ? "bg-emerald-100 text-emerald-600"
                                                            : "bg-amber-100 text-amber-600"
                                                    )}>
                                                        {mission.is_completed
                                                            ? (language === 'es' ? 'Completada' : 'Completed')
                                                            : (language === 'es' ? 'Pendiente' : 'Pending')}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {
                        activeTab === 'summaries' && (
                            <div className="space-y-8">
                                {/* AI Insights Section */}
                                <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                                    <div className="z-10 text-center md:text-left flex-1">
                                        <h3 className="text-3xl font-black mb-4 flex items-center justify-center md:justify-start gap-3">
                                            <Bot className="w-10 h-10 text-indigo-300" />
                                            Insight del Tutor Nova
                                        </h3>
                                        <p className="text-lg text-indigo-100 max-w-2xl leading-relaxed font-fredoka">
                                            {aiAlertsList.length > 0
                                                ? `"${activeStudent.name} ${aiAlertsList[0].text.charAt(0).toLowerCase() + aiAlertsList[0].text.slice(1)}"`
                                                : `"${activeStudent.name} está demostrando un ritmo de aprendizaje sólido. Esta semana se ha enfocado en completar sus misiones diarias con gran entusiasmo."`}
                                        </p>
                                    </div>
                                    <div className="hidden md:flex flex-col items-center gap-2">
                                        <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center">
                                            <TrendingUp className="w-10 h-10 text-yellow-400" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-tighter opacity-60">Tendencia Positiva</span>
                                    </div>
                                </div>

                                <div className="grid gap-6">
                                    {isLoadingReports ? (
                                        <div className="text-center py-20">
                                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                                            <p className="text-slate-500 font-bold">Cargando reportes...</p>
                                        </div>
                                    ) : studentReports.length === 0 ? (
                                        <Card className="p-12 text-center rounded-[3rem] border-dashed border-2 border-slate-200 bg-slate-50">
                                            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500 font-bold">Aún no hay reportes de aprendizaje para esta semana.</p>
                                        </Card>
                                    ) : (
                                        studentReports.map((report: any) => (
                                            <Card key={report.id} className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden group hover:scale-[1.01] transition-all">
                                                <div className="flex flex-col md:flex-row">
                                                    <div className={cn("w-full md:w-56 p-8 flex flex-col items-center justify-center text-center", {
                                                        'bg-blue-50 text-blue-600': report.subject === 'Matemáticas',
                                                        'bg-emerald-50 text-emerald-600': report.subject === 'Ciencias',
                                                        'bg-amber-50 text-amber-600': report.subject === 'Inglés' || report.subject === 'Lenguaje',
                                                        'bg-indigo-50 text-indigo-600': !['Matemáticas', 'Ciencias', 'Inglés', 'Lenguaje'].includes(report.subject)
                                                    })}>
                                                        <span className="text-5xl mb-3">{report.emoji || '📝'}</span>
                                                        <span className="font-black uppercase tracking-tighter text-sm">{report.subject}</span>
                                                    </div>
                                                    <div className="flex-1 p-8">
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div>
                                                                <h3 className="text-2xl font-black text-slate-800">{report.challenges?.[0]?.area || 'Sesión General'}</h3>
                                                                <div className="flex items-center gap-6 mt-2">
                                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                        <Calendar className="w-3 h-3" /> {new Date(report.date || Date.now()).toLocaleDateString()}
                                                                    </p>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sesión Completada</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                                <ChevronRight className="w-6 h-6" />
                                                            </div>
                                                        </div>
                                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
                                                            <p className="text-slate-600 italic text-sm leading-relaxed">
                                                                "{report.recommendations?.join('. ') || 'Se completaron los objetivos de la sesión satisfactoriamente.'}"
                                                            </p>
                                                        </div>

                                                        {report.evidenceImage && (
                                                            <div className="mb-6">
                                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Evidencia de trabajo</p>
                                                                <div className="rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm max-w-sm">
                                                                    <img src={report.evidenceImage} alt="Trabajo" className="w-full h-auto bg-slate-50" />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex flex-wrap gap-4">
                                                            <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                                                Puntaje: {report.score || 100}%
                                                            </div>
                                                            <div className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                                                Enfoque: {report.focus || 'Práctica'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        )
                    }

                    {
                        activeTab === 'school_sync' && (
                            <div className="grid lg:grid-cols-2 gap-8">
                                <div className="space-y-8">
                                    <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10">
                                        <CardHeader className="px-0 pt-0">
                                            <CardTitle className="text-3xl font-black text-slate-800 flex items-center gap-3">
                                                <Settings className="w-8 h-8 text-slate-400" />
                                                Criterios del Colegio
                                            </CardTitle>
                                            <p className="text-slate-500 font-medium tracking-tight">Ayuda a Nova a entender cómo evalúan a {activeStudent.name}.</p>
                                        </CardHeader>
                                        <CardContent className="px-0 space-y-8">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <Label className="font-bold text-slate-700 uppercase text-xs tracking-widest">Nota Mínima</Label>
                                                    <Input type="number" value={schoolConfig.minGrade} className="h-14 rounded-2xl bg-slate-50 text-lg font-bold" onChange={e => setSchoolConfig({ ...schoolConfig, minGrade: Number(e.target.value) })} />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="font-bold text-slate-700 uppercase text-xs tracking-widest">Nota Máxima</Label>
                                                    <Input type="number" value={schoolConfig.maxGrade} className="h-14 rounded-2xl bg-slate-50 text-lg font-bold" onChange={e => setSchoolConfig({ ...schoolConfig, maxGrade: Number(e.target.value) })} />
                                                </div>
                                            </div>
                                            <div className="space-y-3 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                                                <Label className="font-bold text-indigo-900 uppercase text-xs tracking-widest">Mínimo para Aprobar</Label>
                                                <Input type="number" value={schoolConfig.passingGrade} className="h-14 rounded-2xl bg-white text-2xl font-black text-indigo-600 border-indigo-200" onChange={e => setSchoolConfig({ ...schoolConfig, passingGrade: Number(e.target.value) })} />
                                                <p className="text-xs text-indigo-400/80 italic">Nova te alertará si el promedio baja de esta nota.</p>
                                            </div>
                                            <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-black transition-all text-lg font-black shadow-lg shadow-indigo-200">
                                                Guardar Parámetros
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Real Google Classroom Assignments */}
                                    <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10">
                                        <CardHeader className="px-0 pt-0">
                                            <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                                <BookOpen className="w-6 h-6 text-blue-500" />
                                                Google Classroom
                                            </CardTitle>
                                            <p className="text-slate-500 font-medium tracking-tight">Tareas actuales y estado de entrega de {activeStudent.name}.</p>
                                        </CardHeader>
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                            {isLoadingClassroom ? (
                                                <div className="py-12 flex flex-col items-center justify-center gap-4 text-slate-400">
                                                    <Loader2 className="w-8 h-8 animate-spin" />
                                                    <p className="text-sm font-bold tracking-tight">Conectando con Classroom...</p>
                                                </div>
                                            ) : classroomAssignments.length === 0 ? (
                                                <div className="py-12 text-center text-slate-400">
                                                    <p className="text-sm font-bold">No hay tareas pendientes en Classroom.</p>
                                                </div>
                                            ) : (
                                                classroomAssignments.map((assignment) => (
                                                    <div key={assignment.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                                        <div className="flex justify-between items-start gap-4 mb-2">
                                                            <div className="flex-1">
                                                                <h5 className="font-bold text-slate-800 leading-tight">{assignment.title}</h5>
                                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">
                                                                    {assignment.google_classroom_courses?.name || 'Materia General'}
                                                                </p>
                                                            </div>
                                                            <div className={cn(
                                                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm whitespace-nowrap",
                                                                assignment.submission_state === 'TURNED_IN' ? 'bg-emerald-100 text-emerald-600' :
                                                                    assignment.submission_state === 'RETURNED' ? 'bg-blue-100 text-blue-600' :
                                                                        'bg-amber-100 text-amber-600'
                                                            )}>
                                                                {assignment.submission_state || 'NEW'}
                                                            </div>
                                                        </div>
                                                        {assignment.due_date && (
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                <Calendar className="w-3 h-3" />
                                                                {language === 'es' ? 'Entrega:' : 'Due:'} {new Date(assignment.due_date).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </Card>
                                </div>

                                <Card className="rounded-[3rem] border-none shadow-xl bg-slate-900 p-10 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                                    {isScanning ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                            <div className="relative">
                                                <div className="w-24 h-24 border-4 border-indigo-500/20 rounded-full animate-ping" />
                                                <div className="absolute inset-0 w-24 h-24 border-4 border-t-indigo-400 rounded-full animate-spin" />
                                                <FileText className="absolute inset-0 m-auto w-10 h-10 text-indigo-400 animate-pulse" />
                                            </div>
                                            <h3 className="text-2xl font-black">Digitalizando Boletín...</h3>
                                            <p className="text-slate-400 max-w-xs">Nuestra IA está extrayendo las notas y comparándolas con tus criterios.</p>
                                        </div>
                                    ) : scanResult ? (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xl font-black flex items-center gap-2">
                                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" /> Resultados Detectados
                                                </h4>
                                                <Button variant="ghost" className="text-slate-400 text-xs uppercase" onClick={() => setScanResult(null)}>Reset</Button>
                                            </div>

                                            <div className="space-y-4">
                                                {scanResult.subjects.map((sub: any, i: number) => (
                                                    <div key={i} className="space-y-3 p-6 bg-white/5 rounded-[2.5rem] border border-white/10">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <div className="font-black text-white text-lg tracking-wide">{sub.name}</div>
                                                                <div className={cn("text-2xl font-black mt-1", {
                                                                    'text-rose-400': sub.status === 'danger',
                                                                    'text-emerald-400': sub.status === 'good',
                                                                    'text-amber-400': sub.status === 'warning'
                                                                })}>
                                                                    {sub.grade}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                {sub.evaluations.map((ev: any, j: number) => (
                                                                    <div key={j} className="flex items-center gap-2 text-[10px] bg-white/10 px-2 py-0.5 rounded-lg">
                                                                        <span className="text-slate-400 font-bold">{ev.type}:</span>
                                                                        <span className="text-white font-black">{ev.grade}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 border-t border-white/5">
                                                            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Análisis de Desempeño</div>
                                                            <p className="text-sm text-slate-300 font-medium italic">"{sub.analysis}"</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="p-8 bg-indigo-500/10 rounded-[3rem] border border-indigo-500/20 mt-8">
                                                <h5 className="font-black text-indigo-300 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                                                    <Sparkles className="w-5 h-5" /> Nueva Ruta de Aprendizaje
                                                </h5>
                                                <div className="space-y-6">
                                                    {scanResult.planProposal.map((p: any, i: number) => (
                                                        <div key={i} className="flex gap-4 items-start bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg font-black">{i + 1}</div>
                                                            <div>
                                                                <div className="text-base font-bold text-white">{p.task}</div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{p.subject}</div>
                                                                    <div className="w-1 h-1 bg-slate-700 rounded-full" />
                                                                    <div className="text-[10px] text-indigo-300 uppercase font-black tracking-widest">{p.focus}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button
                                                    onClick={handleSyncPlan}
                                                    className="w-full mt-8 h-12 bg-white text-slate-900 hover:bg-indigo-400 hover:text-white font-black rounded-xl transition-all"
                                                >
                                                    Activar Plan en el Estudiante <ArrowRight className="ml-2 w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                accept="image/*,.pdf"
                                            />
                                            <div
                                                className="w-32 h-32 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10 flex items-center justify-center group hover:bg-white/10 cursor-pointer transition-all"
                                                onClick={triggerUpload}
                                            >
                                                <Upload className="w-12 h-12 text-slate-600 group-hover:text-indigo-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black mb-2">Sincroniza el Mundo Real</h4>
                                                <p className="text-slate-400 font-medium max-w-sm px-4">
                                                    Sube una foto del boletín o de una evaluación de papel. Nova la integrará al perfil de aprendizaje para dar apoyo personalizado.
                                                </p>
                                                <Button
                                                    onClick={triggerUpload}
                                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 font-bold text-lg rounded-2xl shadow-lg shadow-indigo-200 transition-all transform active:scale-95 flex items-center justify-center gap-3"
                                                >
                                                    <Upload className="w-6 h-6" />
                                                    Escanear Boletín / Evaluación
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        )
                    }

                    {/* Custom Award Modal */}
                    {
                        showCustomAward && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl relative"
                                >
                                    <button onClick={() => setShowCustomAward(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors bg-slate-100 p-2 rounded-full">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <h3 className="text-3xl font-black mb-2">Premio Especial</h3>
                                    <p className="text-slate-500 font-medium mb-8">Otorga coins por cualquier motivo que desees celebrar.</p>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Motivo del premio</Label>
                                            <Input
                                                className="h-14 rounded-2xl bg-slate-50 border-slate-200 px-6 font-bold text-lg focus:ring-4 focus:ring-indigo-100 transition-all"
                                                placeholder="Ej: Ayudó a limpiar el jardín"
                                                value={customAward.reason}
                                                onChange={e => setCustomAward({ ...customAward, reason: e.target.value })}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Cantidad de Coins</Label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    className="h-14 rounded-2xl bg-slate-50 border-slate-200 px-6 pl-14 font-black text-2xl text-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
                                                    placeholder="50"
                                                    value={customAward.amount}
                                                    onChange={e => setCustomAward({ ...customAward, amount: e.target.value })}
                                                />
                                                <Coins className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-amber-500" />
                                            </div>
                                        </div>
                                        <div className="flex gap-4 pt-4">
                                            <Button onClick={handleCustomAwardSubmit} className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-black transition-all text-lg font-black shadow-xl shadow-indigo-100">
                                                Confirmar Depósito al Banco
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'awards' && (
                            <div className="grid lg:grid-cols-3 gap-8">
                                <Card className="lg:col-span-2 rounded-[3rem] border-none shadow-xl bg-white p-10">
                                    <CardHeader className="px-0 pt-0">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <CardTitle className="text-3xl font-black text-slate-800">
                                                    {language === 'es' ? 'Consignaciones al Nova Bank' : 'Nova Bank Deposits'}
                                                </CardTitle>
                                                <p className="text-slate-500 font-medium">
                                                    {language === 'es'
                                                        ? 'Otorga ahorros directos y premios reales cuando tu hijo complete una labor.'
                                                        : 'Award direct savings and real rewards when your child completes a chore.'}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-center gap-4">
                                                <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-200">
                                                    <Coins className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Saldo Actual</p>
                                                    <p className="text-2xl font-black text-slate-800">{activeStudent.economy?.[0]?.coins || 0} <span className="text-sm text-slate-400 ml-1">Coins</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                                {language === 'es' ? 'Toca para dar puntos' : 'Tap to award points'}
                                            </p>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                {choresList.map((chore) => (
                                                    <button
                                                        key={chore.id}
                                                        onClick={() => handleChoreAward(chore)}
                                                        className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-indigo-600 hover:text-white border border-slate-100 rounded-[2rem] transition-all group group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-indigo-200 text-left"
                                                    >
                                                        <div className="min-w-[3.5rem] h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-all text-slate-700">
                                                            {chore.icon}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-700 group-hover:text-white leading-tight mb-1">{chore.label[language === 'es' ? 'es' : 'en']}</div>
                                                            <div className="text-xs font-black text-indigo-500 group-hover:text-indigo-200 flex items-center gap-1">
                                                                <Plus className="w-3 h-3" /> {chore.coins} Coins
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {choreWithRealReward && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl"
                                            >
                                                <p className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                                                    <Gift className="w-4 h-4" />
                                                    {language === 'es' ? '¿También dar premio real?' : 'Also give a real reward?'}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {realRewardsOptions.map((r) => (
                                                        <button
                                                            key={r.id}
                                                            onClick={() => handleSelectRealReward(r)}
                                                            className="px-4 py-2 rounded-xl bg-white border border-amber-200 hover:bg-amber-100 text-amber-900 text-sm font-bold transition-all"
                                                        >
                                                            {r.label[language === 'es' ? 'es' : 'en']}
                                                        </button>
                                                    ))}
                                                    <button
                                                        onClick={() => setChoreWithRealReward(null)}
                                                        className="px-4 py-2 rounded-xl text-slate-500 text-sm font-medium hover:text-slate-700"
                                                    >
                                                        {language === 'es' ? 'Omitir' : 'Skip'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </Card>

                                <div className="space-y-6">
                                    {/* Premios por meta: ej. "Si junta 2000 monedas → Ticket para cine" */}
                                    <Card className="rounded-[3rem] border-none shadow-xl bg-slate-900 p-8 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20" />
                                        <div className="relative z-10">
                                            <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                                                <Gift className="w-6 h-6 text-yellow-400" />
                                                {language === 'es' ? 'Premio por meta de monedas' : 'Reward by coin goal'}
                                            </h4>
                                            <p className="text-slate-400 text-sm mb-6 font-medium">
                                                {language === 'es'
                                                    ? 'Ej: "Si junta 2000 monedas → Ticket para cine". El niño verá la meta y podrá canjear cuando llegue.'
                                                    : 'E.g. "If they save 2000 coins → Cinema ticket". Your child sees the goal and can redeem when reached.'}
                                            </p>
                                            <Button
                                                onClick={() => setShowAddReward(true)}
                                                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-black h-12 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 mb-4"
                                            >
                                                <Plus className="w-5 h-5" /> {language === 'es' ? 'Crear premio (ej. 2000 → cine)' : 'Create reward (e.g. 2000 → cinema)'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowCustomAward(true)}
                                                className="w-full border-white/30 text-white hover:bg-white/10 font-bold h-11 rounded-xl"
                                            >
                                                <Building2 className="w-4 h-4 mr-2" /> {language === 'es' ? 'Depósito Manual al Banco' : 'Manual Bank Deposit'}
                                            </Button>
                                        </div>
                                    </Card>

                                    {/* Lista de premios por meta creados */}
                                    <Card className="rounded-[3rem] border-none shadow-xl bg-white p-6 border border-slate-100">
                                        <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2">
                                            <Gift className="w-5 h-5 text-indigo-500" /> {language === 'es' ? 'Premios que puede canjear' : 'Rewards they can redeem'}
                                        </h4>
                                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                                            {rewards.map((r) => (
                                                <li key={r.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                                                    <div>
                                                        <span className="font-bold text-slate-800">{r.name}</span>
                                                        {r.description && <span className="text-slate-500 text-xs block">{r.description}</span>}
                                                    </div>
                                                    <span className="font-black text-indigo-600 whitespace-nowrap">{r.cost} coins</span>
                                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-rose-500" onClick={() => handleDeleteReward(r.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                        {rewardsLoading && (
                                            <p className="text-slate-400 text-sm py-4 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {language === 'es' ? 'Cargando premios...' : 'Loading rewards...'}</p>
                                        )}
                                        {!rewardsLoading && rewards.length === 0 && (
                                            <p className="text-slate-400 text-sm py-4">{language === 'es' ? 'Aún no hay premios. Crea uno arriba.' : 'No rewards yet. Create one above.'}</p>
                                        )}
                                    </Card>

                                    <Card className="p-8 rounded-[3rem] bg-indigo-50 border border-indigo-100 shadow-sm">
                                        <h4 className="font-black text-indigo-950 mb-3 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-indigo-500" /> {language === 'es' ? '¿Por qué puntos y premios reales?' : 'Why points and real rewards?'}
                                        </h4>
                                        <p className="text-indigo-700/80 text-sm leading-relaxed font-medium">
                                            {language === 'es'
                                                ? `Los coins motivan en la app; los premios reales (helado, tiempo extra de pantalla, etc.) refuerzan en casa. Juntos, ${activeStudent.name} aprende que las labores tienen recompensas tangibles.`
                                                : `Coins motivate in the app; real rewards (ice cream, extra screen time, etc.) reinforce at home. Together, ${activeStudent.name} learns that chores have tangible rewards.`
                                            }
                                        </p>
                                    </Card>
                                </div>
                            </div>
                        )
                    }

                    {
                        activeTab === 'settings' && (
                            <div className="grid lg:grid-cols-3 gap-8">
                                <Card className="lg:col-span-2 p-8 rounded-[3rem] bg-white shadow-xl border-none">
                                    <h3 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                                        <Settings className="w-8 h-8 text-indigo-600" />
                                        {language === 'es' ? `Personalizar a ${activeStudent.name}` : `Personalize ${activeStudent.name}`}
                                    </h3>
                                    <p className="text-slate-500 mb-8 font-medium">Configura los intereses para que Nova Buddy use ejemplos personalizados en sus explicaciones.</p>

                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Intereses y Hobbies</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Dinosaurios', 'Espacio', 'Fútbol', 'LEGO', 'Roblox', 'Arte', 'Animales', 'Superhéroes', 'Cocina'].map(item => (
                                                    <button
                                                        key={item}
                                                        onClick={() => {
                                                            if (interests.includes(item)) setInterests(interests.filter(i => i !== item));
                                                            else setInterests([...interests, item]);
                                                        }}
                                                        className={cn(
                                                            "px-4 py-2 rounded-full text-sm font-bold border-2 transition-all",
                                                            interests.includes(item)
                                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                                                                : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200"
                                                        )}
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Animales Favoritos</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Dragón', 'Unicornio', 'Robot', 'Gato', 'Perro', 'León', 'Delfín'].map(item => (
                                                    <button
                                                        key={item}
                                                        onClick={() => {
                                                            if (faveAnimals.includes(item)) setFaveAnimals(faveAnimals.filter(i => i !== item));
                                                            else setFaveAnimals([...faveAnimals, item]);
                                                        }}
                                                        className={cn(
                                                            "px-4 py-2 rounded-full text-sm font-bold border-2 transition-all",
                                                            faveAnimals.includes(item)
                                                                ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-100"
                                                                : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200"
                                                        )}
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Button
                                            onClick={async () => {
                                                setIsSavingPrefs(true);
                                                await updateStudentPreferences(activeStudent.id, interests, faveAnimals);
                                                setIsSavingPrefs(false);
                                                toast.success("Preferencias guardadas", {
                                                    description: "Nova adaptará sus explicaciones pronto."
                                                });
                                            }}
                                            disabled={isSavingPrefs}
                                            className="w-full h-14 bg-indigo-600 hover:bg-black text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-100"
                                        >
                                            {isSavingPrefs ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Guardar Configuración'}
                                        </Button>
                                    </div>
                                </Card>

                                <div className="space-y-6">
                                    <Card className="p-8 rounded-[3rem] bg-indigo-50 border border-indigo-100">
                                        <h4 className="font-black text-indigo-950 mb-3 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-indigo-500" /> IA Personalizada
                                        </h4>
                                        <p className="text-indigo-700/80 text-sm leading-relaxed font-medium">
                                            "Cuando marcas 'Dinosaurios', Nova explicará las fracciones usando fósiles, o la gravedad usando el salto de un T-Rex. ¡El aprendizaje es más efectivo cuando es divertido!"
                                        </p>
                                    </Card>
                                </div>
                            </div>
                        )
                    }
                </motion.div >
            </AnimatePresence >


            {/* --- MODALS --- */}
            <AnimatePresence>
                {
                    showAddReward && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
                            >
                                <h3 className="text-2xl font-black text-slate-800 mb-2">Crear premio por meta</h3>
                                <p className="text-slate-500 text-sm mb-6">Ej: si junta 2000 monedas → ticket para cine. El niño verá la meta y podrá canjear cuando llegue.</p>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Nombre del premio</Label>
                                        <Input
                                            value={newReward.name}
                                            onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                                            placeholder="Ej: Ticket para cine"
                                        />
                                    </div>
                                    <div>
                                        <Label>Monedas que debe juntar (meta)</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={newReward.cost}
                                            onChange={(e) => setNewReward({ ...newReward, cost: e.target.value })}
                                            placeholder="Ej: 2000"
                                        />
                                    </div>
                                    <div>
                                        <Label>Descripción (opcional)</Label>
                                        <Input
                                            value={newReward.description}
                                            onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                                            placeholder="Ej: Salida familiar al cine con palomitas"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <Button variant="outline" className="flex-1" onClick={() => setShowAddReward(false)}>Cancelar</Button>
                                        <Button className="flex-1 bg-indigo-600" onClick={handleAddReward}>Guardar premio</Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }

                {
                    showCustomAward && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
                            >
                                <h3 className="text-2xl font-black text-slate-800 mb-2">Otorgar Puntos Extra</h3>
                                <p className="text-slate-500 mb-6 text-sm">Premia comportamientos positivos fuera de la app.</p>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Motivo</Label>
                                        <Input
                                            value={customAward.reason}
                                            onChange={(e) => setCustomAward({ ...customAward, reason: e.target.value })}
                                            placeholder="Ej: Ayudó a lavar los platos"
                                        />
                                    </div>
                                    <div>
                                        <Label>Cantidad de Puntos</Label>
                                        <Input
                                            type="number"
                                            value={customAward.amount}
                                            onChange={(e) => setCustomAward({ ...customAward, amount: e.target.value })}
                                            placeholder="Ej: 50"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <Button variant="outline" className="flex-1" onClick={() => setShowCustomAward(false)}>Cancelar</Button>
                                        <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={handleCustomAwardSubmit}>
                                            <Trophy className="w-4 h-4 mr-2" />
                                            Otorgar
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >
        </div >
    );
};
