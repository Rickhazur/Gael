import React, { useState, useEffect, useCallback } from 'react';
import {
    RefreshCw,
    CheckCircle,
    AlertCircle,
    BookOpen,
    Zap,
    Target,
    Trophy,
    Star,
    TrendingUp,
    Globe,
    Lock,
    Unlock,
    Activity,
    Cloud,
    Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ERROR_MESSAGES } from '@/utils/errorMessages';
import { useGamification } from '@/context/GamificationContext';
import { useLearning } from '../../context/LearningContext';
import { recordQuestCompletion } from '@/services/learningProgress';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getGoogleAuthUrl,
    exchangeCodeForTokens,
    fetchCourses,
    fetchAllAssignments,
    refreshAccessToken
} from '../../services/googleClassroom';
import {
    saveGoogleTokens,
    getGoogleTokens,
    syncGoogleClassroomCourses,
    syncGoogleClassroomAssignments,
    getGoogleClassroomAssignments,
    claimClassroomRewards,
    supabase
} from '../../services/supabase';
import { convertAssignmentsToMissions, markAssignmentAsSynced } from '../../services/missionConverter';
import { cn } from '@/lib/utils';

export const GoogleClassroomSync = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [missions, setMissions] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [userGrade, setUserGrade] = useState(5);
    const [showMissions, setShowMissions] = useState(false);

    const { addXP, addCoins } = useGamification();

    const loadAssignments = useCallback(async (uid: string) => {
        const dbData = await getGoogleClassroomAssignments(uid);

        // MERGE REAL DATA WITH EXISTING DEMO DATA (IF ANY)
        // This prevents the "flash" where demo tasks disappear because they aren't in the DB.
        setAssignments(prev => {
            const demoTasks = prev.filter(p => p.isDemo);
            // Deduplicate by ID just in case
            const newRealTasks = dbData.filter((d: any) => !demoTasks.find(dt => dt.id === d.id));
            return [...demoTasks, ...newRealTasks];
        });

        // Auto-convert to missions (Using the merged view would be ideal, but for now we convert real ones)
        const convertedMissions = convertAssignmentsToMissions(dbData, userGrade);
        setMissions(convertedMissions);
    }, [userGrade]);



    // NEW: Language Context
    const { setLanguage } = useLearning();

    // NEW: Debug Logs State
    const [debugLogs, setDebugLogs] = useState<string[]>(() => {
        const saved = sessionStorage.getItem('gc_debug_logs');
        return saved ? JSON.parse(saved) : [];
    });

    // We need a ref for logs to use them inside useCallback without dependency loops
    const addLog = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const newLog = `${timestamp}: ${msg}`;
        setDebugLogs(prev => {
            const updated = [...prev, newLog];
            sessionStorage.setItem('gc_debug_logs', JSON.stringify(updated));
            return updated;
        });
    };

    const clearLogs = () => {
        setDebugLogs([]);
        sessionStorage.removeItem('gc_debug_logs');
    }

    const handleSync = useCallback(async () => {
        if (!userId) return;

        setIsSyncing(true);
        setDebugLogs([]); // Clear previous logs
        addLog("Iniciando sincronización...");

        try {
            let tokens = await getGoogleTokens(userId);
            if (!tokens) {
                toast.error('No estás conectado a Google Classroom');
                addLog("Error: No tokens found.");
                return;
            }

            // Check if token expired
            if (new Date(tokens.expires_at) < new Date()) {
                addLog("Token expirado. Refrescando...");
                const newTokens = await refreshAccessToken(tokens.refresh_token);
                await saveGoogleTokens(userId, newTokens);
                tokens = await getGoogleTokens(userId);
            }

            // Fetch and sync courses
            addLog("Buscando cursos en Google...");
            const courses = await fetchCourses(tokens!.access_token);
            addLog(`Google API: ${courses.length} cursos encontrados.`);
            courses.forEach((c: any) => addLog(` - Curso: ${c.name} (${c.courseState})`));

            await syncGoogleClassroomCourses(userId, courses);

            // Fetch and sync assignments
            addLog("Buscando tareas en los cursos...");
            // Dynamic import to debug
            const { fetchCourseWork, fetchSubmissions } = await import('../../services/googleClassroom');
            const allAssignments = [];

            for (const course of courses) {
                try {
                    addLog(`🔍 Analizando curso: ${course.name}...`);
                    const coursework = await fetchCourseWork(tokens!.access_token, course.id);
                    addLog(`   > Tareas encontradas: ${coursework.length}`);

                    if (coursework.length > 0) {
                        for (const item of coursework) {
                            let submissionState = 'NEW';
                            try {
                                const submissions = await fetchSubmissions(tokens!.access_token, course.id, item.id);
                                if (submissions && submissions.length > 0) {
                                    submissionState = submissions[0].state;
                                }
                            } catch (err) { }

                            allAssignments.push({
                                ...item,
                                courseName: course.name,
                                courseId: course.id,
                                submissionState: submissionState
                            });
                        }
                    } else {
                        addLog("   ⚠️ 0 Tareas en este curso.");
                    }
                } catch (err: any) {
                    addLog(`❌ Error curso ${course.name}: ${err.message}`);

                    // FALLBACK FOR PERSONAL ACCOUNTS (Error 403)
                    // If Google blocks us because it's a personal Gmail, show a DEMO task so the user sees how it works.
                    if (err.message.includes('403') || err.message.includes('permission')) {
                        addLog("⚠️ Cuenta Personal detectada. Activando MODO DEMO PRO para presentación...");

                        // GENERATE 5 RICH DEMO TASKS FOR PRESENTATION
                        const demoTasks = [
                            {
                                id: `demo_math_01`,
                                title: "🧮 Taller de Multiplicaciones",
                                google_classroom_courses: { name: "Matemáticas 3°" },
                                description: "Resuelve los ejercicios de la página 45 del libro guía.",
                                dueDate: { year: 2026, month: 1, day: 20 },
                                due_date: "2026-01-20T23:59:59Z", // For UI
                                submissionState: 'NEW', // Pendiente
                                alternateLink: 'https://classroom.google.com',
                                maxPoints: 100,
                                isDemo: true
                            },
                            {
                                id: `demo_sci_01`,
                                title: "🌱 El Ciclo de las Plantas",
                                google_classroom_courses: { name: "Ciencias Naturales" },
                                description: "Dibuja y explica cómo crecen las plantas.",
                                dueDate: { year: 2026, month: 1, day: 15 },
                                due_date: "2026-01-15T23:59:59Z",
                                submissionState: 'TURNED_IN',
                                submission_state: 'TURNED_IN', // For UI
                                alternateLink: 'https://classroom.google.com',
                                maxPoints: 100,
                                isDemo: true
                            },
                            {
                                id: `demo_hist_01`,
                                title: "🇨🇴 Héroes de la Independencia",
                                google_classroom_courses: { name: "Historia" },
                                description: "Investiga sobre Simón Bolívar y escribe un resumen.",
                                dueDate: { year: 2026, month: 1, day: 10 },
                                due_date: "2026-01-10T23:59:59Z",
                                submissionState: 'RETURNED',
                                submission_state: 'RETURNED', // For UI
                                alternateLink: 'https://classroom.google.com',
                                maxPoints: 100,
                                isDemo: true
                            },
                            {
                                id: `demo_art_01`,
                                title: "🎨 Autorretrato Creativo",
                                google_classroom_courses: { name: "Artes Plásticas" },
                                description: "Usa colores cálidos para expresar tu emoción actual.",
                                dueDate: { year: 2026, month: 1, day: 25 },
                                due_date: "2026-01-25T23:59:59Z",
                                submissionState: 'NEW',
                                alternateLink: 'https://classroom.google.com',
                                maxPoints: 100,
                                isDemo: true
                            },
                            {
                                id: `demo_eng_01`,
                                title: "🦁 Animals and Habitats",
                                google_classroom_courses: { name: "English Level 1" },
                                description: "Mira el video y responde la evaluación.",
                                dueDate: { year: 2026, month: 1, day: 22 },
                                due_date: "2026-01-22T23:59:59Z",
                                submissionState: 'NEW',
                                alternateLink: 'https://classroom.google.com',
                                maxPoints: 100,
                                isDemo: true
                            }
                        ];

                        allAssignments.push(...demoTasks);
                        // FORCE UPDATE UI WITH DEMO TASKS IMMEDIATELY
                        setAssignments(prev => [...prev.filter(p => !p.isDemo), ...demoTasks]);
                    }
                }
            }

            addLog(`✅ Total final procesado: ${allAssignments.length} tareas.`);

            await syncGoogleClassroomAssignments(userId, allAssignments);

            // AUTO-CONVERT TO MISSIONS
            // We automatically create missions for these tasks so they appear in "Misiones"
            if (allAssignments.length > 0) {
                const newMissions = convertAssignmentsToMissions(allAssignments, userGrade);
                // We sync missions to Supabase here if needed, or just let the UI handle it via state
                // For now, let's update local state so user sees them immediately
                setMissions(newMissions);
                addLog(`✨ ${newMissions.length} Misiones generadas automáticamente.`);
            }

            // --- LANGUAGE DETECTION LOGIC ---
            // Combine all titles to detect dominant language
            const combinedText = [
                ...courses.map((c: any) => c.name),
                ...allAssignments.map((a: any) => a.title)
            ].join(' ').toLowerCase();

            const enKeywords = ['math', 'science', 'history', 'geography', 'physics', 'chemistry', 'grade', 'homework', 'assignment'];
            const esKeywords = ['matemática', 'matemáticas', 'ciencia', 'ciencias', 'historia', 'geografía', 'física', 'química', 'grado', 'tarea', 'deber'];

            let enScore = 0;
            let esScore = 0;

            enKeywords.forEach(word => { if (combinedText.includes(word)) enScore++; });
            esKeywords.forEach(word => { if (combinedText.includes(word)) esScore++; });

            if (enScore > esScore) {
                setLanguage('en');
                toast.info("Language updated based on your Classes!", { description: "We detected English content." });
            } else if (esScore > enScore) {
                setLanguage('es');
                toast.info("¡Idioma actualizado según tus Clases!", { description: "Detectamos contenido en Español." });
            }
            // --------------------------------

            toast.success(`✅ ${allAssignments.length} tareas sincronizadas`);

            // AUTOMATED REWARDS LOGIC
            const pendingRewards = await claimClassroomRewards(userId);
            if (pendingRewards.length > 0) {
                let totalXP = 0;
                let totalCoins = 0;

                for (const reward of pendingRewards) {
                    const xp = 50;
                    const coins = 20;

                    totalXP += xp;
                    totalCoins += coins;

                    await recordQuestCompletion(userId, `gc_${reward.google_assignment_id}`, {
                        title: `Classroom: ${reward.title}`,
                        category: 'math',
                        difficulty: 'medium',
                        wasCorrect: true,
                        coinsEarned: coins,
                        xpEarned: xp
                    });
                }

                addXP(totalXP);
                addCoins(totalCoins, `¡Por completar ${pendingRewards.length} tareas de Classroom!`);

                toast.success(`🌟 ¡Ganaste ${totalXP} XP y ${totalCoins} Monedas!`, {
                    description: `Detectamos ${pendingRewards.length} tareas completadas.`,
                    duration: 5000
                });
            }

            await loadAssignments(userId);
        } catch (e: any) {
            console.error('Sync error:', e);
            toast.error(ERROR_MESSAGES.sync('es'));
        } finally {
            setIsSyncing(false);
        }
    }, [userId, addXP, addCoins, loadAssignments, setLanguage]);

    useEffect(() => {
        const init = async () => {
            // Force log entry
            const timestamp = new Date().toLocaleTimeString();
            const initLog = `${timestamp}: 🔄 Component Mounted. Checking Session...`;
            setDebugLogs(prev => {
                const updated = [...prev, initLog];
                sessionStorage.setItem('gc_debug_logs', JSON.stringify(updated));
                return updated;
            });

            if (!supabase) {
                addLog("❌ Supabase client unavailable.");
                return;
            }

            if (!supabase) {
                addLog("❌ Supabase client unavailable.");
                return;
            }
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                addLog(`✅ User authenticated: ${user.email}`);

                // Get user grade from profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('grade')
                    .eq('id', user.id)
                    .single();

                if (profile?.grade) {
                    setUserGrade(parseInt(profile.grade) || 5);
                }

                const tokens = await getGoogleTokens(user.id);
                if (tokens) {
                    setIsConnected(true);
                    addLog("✅ Tokens found in database. Loading assignments...");
                    loadAssignments(user.id);
                    // Proactive sync check
                    const lastSync = localStorage.getItem(`last_gc_sync_${user.id}`);
                    const now = Date.now();
                    if (!lastSync || (now - parseInt(lastSync)) > 1000 * 60 * 10) { // Sync every 10 mins automatically
                        addLog("⏳ Auto-sync triggered.");
                        handleSync();
                        localStorage.setItem(`last_gc_sync_${user.id}`, now.toString());
                    }
                } else {
                    addLog("⚠️ No tokens found for user (Not Connected yet).");
                }
            } else {
                addLog("❌ User NOT authenticated in Auth Check.");
                console.warn("User not authenticated in Google Callback");
                toast.error("Debes iniciar sesión para sincronizar.");
                // REMOVED REDIRECT SO USER CAN SEE LOGS
                // setTimeout(() => { window.location.href = '/'; }, 2000);
            }
        };
        init();
    }, []);

    // NEW FUNCTION: Force Disconnect
    const handleDisconnect = async () => {
        if (!userId) return;
        try {
            // Delete tokens from Supabase
            if (supabase) {
                await supabase.from('google_classroom_tokens').delete().eq('user_id', userId);
            }

            // Clear local state
            setIsConnected(false);
            setAssignments([]);
            setMissions([]);
            setDebugLogs([]);
            localStorage.removeItem(`last_gc_sync_${userId}`);
            sessionStorage.removeItem('gc_debug_logs');

            addLog("⏹️ Desconectado. Tokens eliminados.");
            toast.success("Desconectado. Por favor conecta de nuevo.");

            // Force reload to clear memory
            setTimeout(() => window.location.reload(), 1000);
        } catch (e) {
            console.error(e);
            toast.error("Error al desconectar.");
        }
    }; // Wait, the previous useEffect had deps [userId, handleSync, loadAssignments]

    // SEPARATE EFFECT FOR CALLBACK HANDLING TO ENSURE IT RUNS WHEN USERID IS READY
    useEffect(() => {
        const checkCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const hash = window.location.hash;

            if (userId) {
                addLog(`🔍 CheckCallback running. UserId: ${userId}`);
                addLog(`   Hash present: ${hash ? 'YES' : 'NO'}`);
                addLog(`   Code present: ${code ? 'YES' : 'NO'}`);

                if (code) {
                    addLog("🚀 Code flow detected. Handling...");
                    await handleOAuthCallback(code);
                } else if (hash.includes('access_token=')) {
                    addLog("🚀 Implicit flow detected. Handling...");
                    await handleOAuthCallback('implicit');
                } else {
                    addLog("ℹ️ No callback params found in URL.");
                }
            } else {
                // addLog("⏳ UserId not ready yet for callback check...");
            }
        }
        checkCallback();
    }, [userId]); // Only run when userId is set

    const processingRef = React.useRef(false);

    const handleOAuthCallback = async (codeOrHash: string) => {
        if (!userId) {
            addLog("❌ handleOAuthCallback aborted: No User ID");
            return;
        }
        if (processingRef.current) {
            addLog("⚠️ handleOAuthCallback skipped: Already processing");
            return;
        }

        processingRef.current = true;
        addLog("⚙️ Processing OAuth Callback...");

        try {
            let accessToken = '';
            let refreshToken = '';

            if (codeOrHash === 'implicit' || window.location.hash.includes('access_token=')) {
                // IMPLICIT FLOW
                addLog("🔹 Parsing Implicit Token...");
                const params = new URLSearchParams(window.location.hash.substring(1));
                accessToken = params.get('access_token') || '';
                if (!accessToken) throw new Error('No access token in hash');
                addLog("✅ Access Token extracted.");
            } else {
                // CODE FLOW
                addLog("🔹 Exchanging Code for Token...");
                const tokens = await exchangeCodeForTokens(codeOrHash);
                accessToken = tokens.access_token;
                refreshToken = tokens.refresh_token;
                addLog("✅ Tokens exchanged.");
            }

            addLog("💾 Saving tokens to Supabase...");
            await saveGoogleTokens(userId, {
                access_token: accessToken,
                refresh_token: refreshToken || 'implicit_flow_no_refresh',
                expiry_date: Date.now() + 3500 * 1000
            });
            addLog("✅ Tokens SAVED.");

            setIsConnected(true);
            toast.success('¡Conectado a Google Classroom!');

            // Clear hash strictly
            window.history.replaceState({}, document.title, window.location.pathname);

            addLog("🔄 Triggering Sync...");
            await handleSync();
            addLog("🏁 Sync Sequence Complete.");

            // DISABLE AUTO REDIRECT FOR DEBUGGING
            // setTimeout(() => {
            //     window.location.href = '/?view=GOOGLE_CLASSROOM';
            // }, 2000);

        } catch (e: any) {
            console.error('OAuth Error:', e);
            addLog(`❌ OAuth Error: ${e.message}`);
            toast.error('Error de Conexión: ' + e.message, { duration: 10000 });
            processingRef.current = false; // Reset lock on error
        }
    };

    const handleConnect = () => {
        const authUrl = getGoogleAuthUrl();
        window.location.href = authUrl;
    };

    const handleConvertToMissions = async () => {
        if (missions.length === 0) {
            toast.error('No hay tareas para convertir');
            return;
        }

        try {
            for (const mission of missions) {
                await markAssignmentAsSynced(mission.sourceId, mission.id);
            }

            toast.success(`🎯 ${missions.length} misiones creadas!`);
            setShowMissions(true);
        } catch (e: any) {
            toast.error('Error al crear misiones: ' + e.message);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

            {/* Main Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:translate-y-[-2px] transition-transform">
                            <Cloud className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 font-fredoka flex items-center gap-2">
                                Centro de Sincronización
                            </h1>
                            <p className="text-slate-500 font-medium">Google Classroom • Nova Schola</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    {isConnected ? (
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl font-black text-sm flex items-center gap-2 border border-emerald-100">
                                <Activity className="w-4 h-4 animate-pulse" />
                                CONECTADO
                            </div>
                            <Button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="h-14 px-8 bg-indigo-600 hover:bg-black text-white font-black rounded-2xl shadow-xl transition-all flex items-center gap-3"
                            >
                                <RefreshCw className={cn("w-5 h-5", isSyncing && "animate-spin")} />
                                {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                            </Button>

                            {/* NEW: Disconnect Button */}
                            <button
                                onClick={handleDisconnect}
                                className="text-xs text-red-400 font-bold hover:text-red-600 underline"
                            >
                                Desconectar
                            </button>
                        </div>
                    ) : (
                        <Button
                            onClick={handleConnect}
                            className="h-14 px-8 bg-white border-2 border-slate-200 hover:border-black text-slate-700 font-black rounded-2xl shadow-md transition-all flex items-center gap-3"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                            Conectar con Google
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Dashboard Grid */}
            {isConnected && (
                <div className="grid md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-indigo-950 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-20 h-20" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Tareas Activas</div>
                        <div className="text-3xl font-black">{assignments.length}</div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-indigo-300 font-bold">
                            <TrendingUp className="w-4 h-4" />
                            Actualizado cada vez que sincronizas
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl relative overflow-hidden"
                    >
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Recompensas Nova</div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                <span className="text-2xl font-black text-slate-800">+50 XP</span>
                            </div>
                            <div className="w-px h-8 bg-slate-100" />
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="text-2xl font-black text-slate-800">+20 🪙</span>
                            </div>
                        </div>
                        <p className="mt-4 text-xs font-bold text-slate-400">Puntos por cada tarea entregada</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[2rem] text-white shadow-xl flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start">
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Misiones Automáticas</div>
                            <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-black mb-2">{missions.length} Listas</div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleConvertToMissions}
                                className="w-full h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white border-none font-bold backdrop-blur-sm"
                            >
                                Convertir Todas
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Assignments Table / List */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden min-h-[400px]">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                            <Layers className="w-5 h-5 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">
                            {showMissions ? "Tus Misiones Nova" : "Tareas de Classroom"}
                        </h3>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setShowMissions(false)}
                            className={cn("px-4 py-2 rounded-lg font-black text-xs transition-all", !showMissions ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                        >
                            TAREAS
                        </button>
                        <button
                            onClick={() => setShowMissions(true)}
                            className={cn("px-4 py-2 rounded-lg font-black text-xs transition-all", showMissions ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                        >
                            MISIONES
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    <AnimatePresence mode="popLayout">
                        {(showMissions ? missions : assignments).length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="p-20 text-center space-y-4"
                            >
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Globe className="w-10 h-10 text-slate-200" />
                                </div>
                                <h4 className="text-xl font-black text-slate-300">No hay datos por ahora</h4>
                                <p className="text-slate-400 font-medium">Sincroniza para ver tus tareas escolares</p>
                            </motion.div>
                        ) : (
                            (showMissions ? missions : assignments).map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-6 hover:bg-slate-50/50 transition-all group flex items-center gap-6"
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                                        item.submission_state === 'TURNED_IN' || item.synced_to_mission ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400"
                                    )}>
                                        {item.submission_state === 'TURNED_IN' ? <Trophy className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-black text-slate-800 text-lg truncate group-hover:text-indigo-600 transition-colors">
                                                {item.title}
                                            </h4>
                                            {item.submission_state === 'TURNED_IN' && (
                                                <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
                                                    Entregado
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                            <span className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                                                📚 {showMissions ? "Nova Mission" : (item.google_classroom_courses?.name || "General")}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                📅 {item.due_date ? new Date(item.due_date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : "Sin fecha"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex gap-2">
                                            <div className="bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-xl text-xs font-black border border-yellow-100">
                                                +{item.xpReward || 50} XP
                                            </div>
                                            <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-xs font-black border border-emerald-100">
                                                +{item.coinReward || 20} 🪙
                                            </div>
                                        </div>
                                        {item.reward_claimed && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-tight">
                                                <Star className="w-3 h-3 fill-emerald-500" />
                                                Recompensa Cobrada
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Insight */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16" />
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-xl">
                        <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black mb-1">Nova Detect: Sincronización Inteligente</h4>
                        <p className="text-slate-400 font-medium">
                            Nuestra IA revisa tus entregas en Classroom. Si entregas una tarea real, Nova te premia automáticamente.
                        </p>
                    </div>
                </div>

                {/* DEBUG LOG VIEW - REMOVED FOR PRODUCTION
                <div className="fixed bottom-4 left-4 z-[9999] w-80 bg-black/90 p-4 rounded-xl border-2 border-green-500/50 shadow-2xl backdrop-blur-md">
                     ...
                </div>
                */}
            </div>
        </div>
    );
};
