import { useDemoTour } from '@/context/DemoTourContext';
import { DEFAULT_GRADE } from '@/constants';
import { useTranslation } from '@/hooks/useTranslation';
import { GradeSelector } from './GradeSelector';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Smartphone, ShieldCheck, Eye, EyeOff, Globe, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { registerStudent, sendPasswordReset } from '../services/supabase';
import { toast } from 'sonner';
import { AvatarDisplay } from './Gamification/AvatarDisplay';

interface LoginPageProps {
    onLogin: (data: any, mode: 'STUDENT' | 'ADMIN' | 'PARENT') => void;
    onBack: () => void;
    defaultMode?: 'STUDENT' | 'ADMIN' | 'PARENT';
    intent?: any;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack, defaultMode = 'STUDENT' }) => {
    const [mode, setMode] = useState<'STUDENT' | 'ADMIN' | 'PARENT'>(defaultMode);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { startTour } = useDemoTour();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        studentName: '',
        studentEmail: '',
        studentPassword: '',
        gradeLevel: DEFAULT_GRADE,
        isBilingual: false,
        connectMoodle: false,
        moodleUrl: '',
        moodleUsername: '',
        moodlePassword: '',
        whatsappPhone: '' // Optional WhatsApp
    });
    const [language, setLanguage] = useState<'es' | 'en'>('es');
    const [loading, setLoading] = useState(false);
    const [showParentPassword, setShowParentPassword] = useState(false);
    const [showStudentPassword, setShowStudentPassword] = useState(false);
    const [isHabeasAccepted, setIsHabeasAccepted] = useState(false);
    const [regStep, setRegStep] = useState(1); // 1: Parent, 2: Child, 3: WhatsApp, 4: Consent

    const [savedAvatarId, setSavedAvatarId] = useState<string | null>(() => {
        return localStorage.getItem('nova_avatar_id');
    });

    const text = useTranslation(language);

    // Solo el padre puede crear cuenta: en modo Estudiante forzar solo login
    React.useEffect(() => {
        if (mode === 'STUDENT') setIsRegistering(false);
    }, [mode]);

    // Load persisted email on mount
    React.useEffect(() => {
        const lastEmail = localStorage.getItem('last_login_email');
        if (lastEmail) {
            setFormData(prev => ({ ...prev, email: lastEmail }));
        }
    }, []);

    // Mobile Detection
    const [isMobile, setIsMobile] = useState(false);
    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validation for Habeas Data
        if (isRegistering && !isHabeasAccepted) {
            toast.error(language === 'es' ? "⚠️ Debes aceptar la política de datos." : "⚠️ You must accept the data policy.");
            setLoading(false);
            return;
        }

        // Save email preference
        if (formData.email) {
            localStorage.setItem('last_login_email', formData.email);
        }

        try {
            if (isRegistering && mode === 'STUDENT') {
                const result = await registerStudent({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    gradeLevel: formData.gradeLevel,
                    isBilingual: formData.isBilingual
                });

                if (result.session || result.user) {
                    toast.message(
                        language === 'es' ? "Solicitud de Cuenta Enviada" : "Account Request Sent",
                        {
                            description: language === 'es'
                                ? "⏳ Tu cuenta ha sido creada y está pendiente de aprobación por el Administrador. Intenta ingresar más tarde."
                                : "⏳ Your account works pending Admin approval. Please try logging in later.",
                            duration: 8000,
                            icon: <ShieldCheck className="w-5 h-5 text-amber-500" />
                        }
                    );
                    setIsRegistering(false);
                } else {
                    toast.message(
                        language === 'es' ? "Verifica tu correo" : "Check your email",
                        { description: language === 'es' ? "Hemos enviado un enlace de confirmación." : "We sent a confirmation link." }
                    );
                    setIsRegistering(false);
                }
            } else if (isRegistering && mode === 'PARENT') {
                if (!formData.name.trim() || !formData.studentName.trim() || !formData.studentEmail.trim()) {
                    toast.error(language === 'es' ? "Todos los campos son obligatorios" : "All fields are required");
                    setLoading(false);
                    return;
                }

                const { registerParentAndStudent } = await import('../services/supabase');
                (window as any).isRegisteringInProgress = true;
                const result = await registerParentAndStudent({
                    parentEmail: formData.email,
                    parentPassword: formData.password,
                    parentName: formData.name,
                    studentEmail: formData.studentEmail,
                    studentPassword: formData.studentPassword || formData.password,
                    studentName: formData.studentName,
                    studentGradeLevel: formData.gradeLevel,
                    isBilingual: formData.isBilingual,
                    whatsappPhone: formData.whatsappPhone
                });
                (window as any).isRegisteringInProgress = false;

                if (result.success) {
                    setRegStep(1); // Reset step on success

                    // Opcional: conectar Moodle en segundo plano (sin que el niño tenga que hacer nada)
                    if (formData.connectMoodle && formData.moodleUrl?.trim() && formData.moodleUsername?.trim() && formData.moodlePassword?.trim() && result.user?.id) {
                        try {
                            const { getMoodleTokenFromLogin } = await import('../services/moodleService');
                            const { saveMoodleCredentials, syncMoodleAssignments } = await import('../services/supabase');
                            const { fetchAllMoodleAssignments } = await import('../services/moodleService');
                            const baseUrl = formData.moodleUrl.replace(/\/$/, '');
                            const token = await getMoodleTokenFromLogin(baseUrl, formData.moodleUsername.trim(), formData.moodlePassword.trim());
                            await saveMoodleCredentials(result.user.id, baseUrl, token);
                            const assignments = await fetchAllMoodleAssignments(baseUrl, token);
                            if (assignments.length > 0) {
                                await syncMoodleAssignments(result.user.id, assignments.map(a => ({
                                    id: a.id,
                                    name: a.name,
                                    intro: a.intro,
                                    duedate: a.duedate,
                                    grade: a.grade,
                                    course: a.course,
                                    courseName: a.courseName,
                                    courseShortname: a.courseShortname,
                                })));
                            }
                            toast.success(language === 'es' ? 'Moodle conectado. Las tareas se cargarán cuando tu hijo entre.' : 'Moodle connected. Tasks will load when your child logs in.');
                        } catch (moodleErr: any) {
                            console.warn('Moodle connection failed:', moodleErr);
                            toast.message(
                                language === 'es' ? 'Moodle no conectado' : 'Moodle not connected',
                                {
                                    description: language === 'es'
                                        ? 'Las cuentas se crearon correctamente. Tu hijo puede conectar Moodle más tarde desde el Centro de Mando.'
                                        : 'Accounts created successfully. Your child can connect Moodle later from the Command Center.',
                                    duration: 5000
                                }
                            );
                        }
                    }
                    toast.message(
                        language === 'es' ? "Registro Familiar Recibido" : "Family Registration Received",
                        {
                            description: language === 'es'
                                ? "⏳ Las cuentas de Padre e Hijo han sido creadas y están en espera de aprobación por el Administrador."
                                : "⏳ Parent and Student accounts created and awaiting Admin approval.",
                            duration: 8000,
                            icon: <ShieldCheck className="w-5 h-5 text-amber-500" />
                        }
                    );
                    setIsRegistering(false);
                } else {
                    toast.error(language === 'es' ? "Error al crear las cuentas" : "Error creating accounts");
                }
            } else {
                localStorage.removeItem('nova_demo_mode');
                onLogin(formData, mode);
            }
        } catch (error: any) {
            console.error("Auth error:", error);

            // Mensajes de error específicos y amigables
            let msg = error.message || (language === 'es' ? "Error en autenticación" : "Authentication error");

            if (error.message?.includes('Anonymous sign-ins are disabled')) {
                msg = language === 'es'
                    ? "⚠️ Configuración de Supabase incompleta. Por favor contacta al administrador para habilitar el registro de usuarios."
                    : "⚠️ Supabase configuration incomplete. Please contact the administrator to enable user registration.";
            } else if (error.message?.includes('Email address') && error.message?.includes('invalid')) {
                msg = language === 'es'
                    ? "❌ El correo electrónico no es válido. Por favor usa un correo real (ej: @gmail.com)"
                    : "❌ The email address is invalid. Please use a real email (e.g., @gmail.com)";
            } else if (error.message?.includes('No se pudo guardar la cuenta') || error.message?.includes('Database error saving new user') || error.message?.includes('saving new user')) {
                msg = error.message || (language === 'es'
                    ? "No se pudo guardar la cuenta en la base de datos. Si el problema persiste, contacta a soporte."
                    : "Could not save account to database. If the problem persists, contact support.");
            } else if (error.message?.includes('Invalid login credentials')) {
                msg = language === 'es'
                    ? "🔒 Correo o contraseña incorrectos. Inténtalo de nuevo."
                    : "🔒 Incorrect email or password. Try again.";
            } else if (error.message?.includes('User already registered')) {
                msg = language === 'es'
                    ? "👤 Este correo ya está registrado. Intenta iniciar sesión."
                    : "👤 This email is already registered. Try logging in.";
            }

            toast.error(msg, {
                duration: 6000,
                description: language === 'es'
                    ? "Si el problema persiste, contacta a soporte."
                    : "If the problem persists, contact support."
            });
            (window as any).isRegisteringInProgress = false;
        } finally {
            setLoading(false);
        }
    };

    // --- MOBILE NANO LOGIN LAYOUT ---
    if (isMobile) {
        return (
            <div className="min-h-screen relative overflow-hidden font-nunito bg-[#020617] flex flex-col items-center justify-center p-6">

                {/* Mobile Back Button - Only if needed, usually login is root */}
                {/* <button onClick={onBack} className="absolute top-6 left-6 text-slate-500 hover:text-white z-50">←</button> */}

                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-cyan-500/10 blur-[120px] rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                </div>

                {/* Header */}
                <div className="flex flex-col items-center z-10 mb-8 w-full max-w-sm">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.6)] mb-6 transform rotate-3 border border-white/20 relative group">
                        <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <Brain className="w-12 h-12 text-white relative z-10 drop-shadow-md" />
                    </div>
                    <h1 className="text-4xl font-black text-white text-center leading-none mb-2 tracking-tight">NOVA SCHOLA</h1>
                    <p className="text-cyan-400 font-bold tracking-[0.3em] text-[10px] uppercase glow-text">Nano Edition v2.0</p>
                </div>

                {/* Auth Container */}
                <div className="w-full max-w-sm z-10 flex flex-col">

                    {/* Mode Switcher */}
                    <div className="bg-slate-900/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 mb-6 flex relative overflow-hidden">
                        <div
                            className={`absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 transition-all duration-300 ease-spring ${mode === 'STUDENT' ? 'left-1.5 w-[calc(50%-6px)]' : 'left-[50%] w-[calc(50%-6px)]'}`}
                        />
                        <button
                            onClick={() => { setMode('STUDENT'); setIsRegistering(false); }}
                            className={`flex-1 py-3 text-xs font-black relative z-10 transition-colors ${mode === 'STUDENT' ? 'text-white' : 'text-slate-500'}`}
                        >
                            ESTUDIANTE
                        </button>
                        <button
                            onClick={() => { setMode('PARENT'); setIsRegistering(false); setRegStep(1); }}
                            className={`flex-1 py-3 text-xs font-black relative z-10 transition-colors ${mode === 'PARENT' ? 'text-white' : 'text-slate-500'}`}
                        >
                            PADRES
                        </button>
                    </div>

                    {/* Step Indicator (Only for Parent Registration) */}
                    {isRegistering && mode === 'PARENT' && (
                        <div className="flex justify-between mb-4 px-2">
                            {[1, 2, 3, 4].map((s) => (
                                <div
                                    key={s}
                                    className={`h-1.5 flex-1 mx-0.5 rounded-full transition-all ${s <= regStep ? 'bg-cyan-500' : 'bg-slate-800'}`}
                                />
                            ))}
                        </div>
                    )}


                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* REGISTRATION FIELDS */}
                        <AnimatePresence mode="wait">
                            {isRegistering && (
                                <motion.div
                                    key="register-fields"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    {/* Parent Multi-step Steps */}
                                    {mode === 'PARENT' && regStep === 1 && (
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-stone-400 font-bold uppercase ml-1">Tu Nombre Completo</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-slate-800/60 border border-white/5 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-cyan-500 transition-all font-bold placeholder:text-slate-600"
                                                    placeholder="Nombre del Padre/Madre"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-stone-400 font-bold uppercase ml-1">Tu Correo Electrónico</label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full bg-slate-800/60 border border-white/5 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-cyan-500 transition-all font-bold placeholder:text-slate-600"
                                                    placeholder="ejemplo@correo.com"
                                                />
                                            </div>
                                            <div className="space-y-1 relative">
                                                <label className="text-[10px] text-stone-400 font-bold uppercase ml-1">Contraseña Segura</label>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full bg-slate-800/60 border border-white/5 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-cyan-500 transition-all font-bold placeholder:text-slate-600"
                                                    placeholder="Mínimo 6 caracteres"
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 bottom-3.5 text-slate-500">
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    if (formData.name && formData.email && formData.password.length >= 6) setRegStep(2);
                                                    else toast.error("Completa todos los campos.");
                                                }}
                                                className="w-full h-12 bg-cyan-600 font-bold rounded-xl"
                                            >
                                                SIGUIENTE: DATOS DEL NIÑO →
                                            </Button>
                                        </div>
                                    )}

                                    {mode === 'PARENT' && regStep === 2 && (
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-stone-400 font-bold uppercase ml-1">Nombre del Niño/a</label>
                                                <input
                                                    type="text"
                                                    value={formData.studentName}
                                                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                                    className="w-full bg-slate-800/60 border border-white/5 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-cyan-500 transition-all font-bold placeholder:text-slate-600"
                                                    placeholder="Nombre de tu hijo/a"
                                                />
                                            </div>
                                            <div className="bg-slate-800/40 p-3 rounded-xl border border-white/5">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Grado Escolar</label>
                                                <GradeSelector
                                                    selectedGrade={formData.gradeLevel}
                                                    onSelect={(g) => setFormData({ ...formData, gradeLevel: g })}
                                                    variant="mobile"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button type="button" onClick={() => setRegStep(1)} className="flex-1 h-12 bg-slate-700 font-bold rounded-xl">ATRÁS</Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        if (formData.studentName) setRegStep(3);
                                                        else toast.error("Escribe el nombre de tu hijo/a.");
                                                    }}
                                                    className="flex-[2] h-12 bg-cyan-600 font-bold rounded-xl"
                                                >
                                                    CONTINUAR →
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {mode === 'PARENT' && regStep === 3 && (
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-stone-400 font-bold uppercase">WhatsApp para Reportes</label>
                                                <input
                                                    type="tel"
                                                    value={formData.whatsappPhone}
                                                    onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
                                                    className="w-full bg-slate-800/60 border border-white/5 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-emerald-500 transition-all font-bold placeholder:text-slate-600"
                                                    placeholder="+57 300..."
                                                />
                                                <p className="text-[10px] text-slate-500 px-1 italic">Recibirás boletines semanales.</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button type="button" onClick={() => setRegStep(2)} className="flex-1 h-12 bg-slate-700 font-bold rounded-xl">ATRÁS</Button>
                                                <Button type="button" onClick={() => setRegStep(4)} className="flex-[2] h-12 bg-cyan-600 font-bold rounded-xl">SIGUIENTE →</Button>
                                            </div>
                                        </div>
                                    )}

                                    {mode === 'PARENT' && regStep === 4 && (
                                        <div className="space-y-4">
                                            <div className="bg-slate-800/60 p-4 rounded-xl border border-white/5">
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isHabeasAccepted}
                                                        onChange={(e) => setIsHabeasAccepted(e.target.checked)}
                                                        className="w-5 h-5 mt-0.5 rounded border-2 border-cyan-500 bg-slate-900"
                                                    />
                                                    <label className="text-[11px] text-slate-300 leading-tight">
                                                        Acepto el tratamiento de datos para fines educativos (Ley 1581 de 2012).
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button type="button" onClick={() => setRegStep(3)} className="flex-1 h-12 bg-slate-700 font-bold rounded-xl">ATRÁS</Button>
                                                <Button type="submit" disabled={loading} className="flex-[2] h-12 bg-gradient-to-r from-cyan-600 to-blue-600 font-black rounded-xl">
                                                    {loading ? <Loader2 className="animate-spin" /> : "FINALIZAR REGISTRO 🚀"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Regular Student Register */}
                                    {mode === 'STUDENT' && (
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-slate-800/60 border border-white/5 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 font-bold"
                                                placeholder="Tu Nombre Completo"
                                            />
                                            <div className="bg-slate-800/40 p-3 rounded-xl border border-white/5">
                                                <GradeSelector
                                                    selectedGrade={formData.gradeLevel}
                                                    onSelect={(g) => setFormData({ ...formData, gradeLevel: g })}
                                                    variant="mobile"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>


                        {/* ONLY SHOW LOGIN FIELDS IF NOT PARENT REGISTERING */}
                        {(!isRegistering || (isRegistering && mode === 'STUDENT')) && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full bg-slate-800/60 border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500 font-bold"
                                        placeholder={mode === 'STUDENT' ? "Tu Correo" : "Tu Correo (Padre)"}
                                    />
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                            className="w-full bg-slate-800/60 border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500 font-bold"
                                            placeholder="Contraseña"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <Button
                                    type="submit" disabled={loading}
                                    className={`w-full h-14 font-black rounded-xl text-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all active:scale-95 ${mode === 'PARENT' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'}`}
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isRegistering ? "CREAR MI CUENTA" : "INICIAR AVENTURA")}
                                </Button>
                            </div>
                        )}


                        {/* Habeas Data Checkbox - ONLY FOR REGISTRATION */}
                        {isRegistering && (
                            <div className="flex items-start gap-3 px-1 py-2">
                                <div className="pt-1">
                                    <input
                                        type="checkbox"
                                        id="habeasDataMobile"
                                        checked={isHabeasAccepted}
                                        onChange={(e) => setIsHabeasAccepted(e.target.checked)}
                                        className="w-5 h-5 rounded border-2 border-indigo-500 text-indigo-600 focus:ring-indigo-500 bg-slate-800/50"
                                    />
                                </div>
                                <label htmlFor="habeasDataMobile" className="text-[10px] text-slate-400 leading-tight">
                                    Acepto el tratamiento de datos para fines educativos (Ley 1581 de 2012).
                                </label>
                            </div>
                        )}

                        <Button
                            type="submit" disabled={loading}
                            className={`w-full h-14 font-black rounded-xl text-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all active:scale-95 ${mode === 'PARENT' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'}`}
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (isRegistering ? (mode === 'PARENT' ? `REGISTRAR PASO ${regStep}/4` : "CREAR MI CUENTA") : "INICIAR AVENTURA")}
                        </Button>
                    </form>

                    {/* Toggle Login/Register */}
                    <div className="mt-6 flex flex-col items-center gap-4">
                        {mode === 'PARENT' && (
                            <button
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setRegStep(1);
                                }}
                                className="text-slate-400 text-sm font-medium hover:text-white transition-colors"
                            >
                                {isRegistering ? "¿Ya tienes cuenta? Inicia Sesión" : "¿No tienes cuenta? Regístrate Gratis"}
                            </button>
                        )}

                        <div className="w-full h-px bg-white/10 my-2"></div>

                        {/* Quick Demo Button */}
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({ ...formData, email: 'sofia.demo@novaschola.com', password: 'demo2024' });
                                onLogin({ email: 'sofia.demo@novaschola.com', password: 'demo2024' }, 'STUDENT');
                                setTimeout(() => startTour(), 500);
                            }}
                            className="w-full py-4 bg-slate-800/50 hover:bg-slate-800 border border-white/5 rounded-xl text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all group"
                        >
                            <span className="text-xl group-hover:scale-110 transition-transform">🎬</span> VER DEMO RÁPIDO
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-indigo-50 flex flex-col lg:flex-row relative overflow-hidden font-poppins selection:bg-indigo-200 selection:text-indigo-900">



            {/* Back Button */}
            <button
                onClick={onBack}
                className="absolute top-6 left-6 z-50 text-stone-500 hover:text-indigo-600 transition-colors flex items-center gap-2 font-medium"
            >
                ← {text.back}
            </button>

            {/* Language Toggle (Top Right) */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={() => setLanguage(l => l === 'es' ? 'en' : 'es')}
                    className="flex items-center gap-2 bg-white/80 border border-stone-200 rounded-full px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 transition-colors shadow-sm"
                >
                    <Globe className="w-4 h-4" />
                    <span>{language === 'es' ? 'Español' : 'English'}</span>
                </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 lg:pl-20">
                <div className="max-w-md text-center lg:text-left">
                    {savedAvatarId ? (
                        <div className="mb-8 mx-auto lg:mx-0 animate-float flex justify-center lg:justify-start">
                            <AvatarDisplay avatarId={savedAvatarId} size="xl" showBackground={false} className="drop-shadow-2xl" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-200 mb-8 mx-auto lg:mx-0 animate-float">
                            <Brain className="w-12 h-12 text-white" />
                        </div>
                    )}

                    <h1 className="text-5xl font-bold text-stone-900 mb-2 tracking-tight">
                        Nova Schola
                    </h1>
                    <p className="text-xl text-indigo-600 font-medium mb-12">
                        {language === 'es' ? 'La Educación del Futuro' : 'The Future of Education'}
                    </p>
                </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-[480px]">

                    {/* Role Toggle Switch */}
                    <div className="bg-white p-1.5 rounded-full flex mb-8 border border-stone-200 shadow-sm">
                        <button
                            onClick={() => { setMode('STUDENT'); setIsRegistering(false); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all duration-300 ${mode === 'STUDENT'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'text-stone-500 hover:text-stone-700'
                                }`}
                        >
                            <Smartphone className="w-4 h-4" />
                            {text.student}
                        </button>
                        <button
                            onClick={() => { setMode('ADMIN'); setIsRegistering(false); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all duration-300 ${mode === 'ADMIN'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'text-stone-500 hover:text-stone-700'
                                }`}
                        >
                            <ShieldCheck className="w-4 h-4" />
                            {text.admin}
                        </button>
                        <button
                            onClick={() => { setMode('PARENT'); setIsRegistering(false); setRegStep(1); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all duration-300 ${mode === 'PARENT'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'text-stone-500 hover:text-stone-700'
                                }`}
                        >
                            <Brain className="w-4 h-4" />
                            {text.parent}
                        </button>
                    </div>

                    {/* Desktop Step Indicator */}
                    {isRegistering && mode === 'PARENT' && (
                        <div className="flex items-center justify-center mb-8 gap-10">
                            {[1, 2, 3, 4].map((s) => (
                                <div key={s} className="flex flex-col items-center gap-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${s === regStep ? 'bg-indigo-600 text-white scale-110 shadow-lg' : s < regStep ? 'bg-green-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                                        {s < regStep ? '✓' : s}
                                    </div>
                                    <span className={`text-[9px] uppercase font-black tracking-widest ${s === regStep ? 'text-indigo-600' : 'text-stone-400'}`}>
                                        {s === 1 ? 'Acudiente' : s === 2 ? 'Estudiante' : s === 3 ? 'WhatsApp' : 'Legal'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}


                    {/* Form Card */}
                    <div className="bg-white/80 backdrop-blur-xl border border-stone-200 rounded-3xl p-8 shadow-xl">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-stone-900 mb-2">
                                {isRegistering ? text.welcomeRegister : text.welcomeLogin}
                            </h2>
                            <p className="text-stone-500 text-sm">
                                {isRegistering ? text.subtitleRegisterParent : (mode === 'PARENT' ? text.subtitleLoginParent : mode === 'ADMIN' ? 'Acceso administrativo' : text.subtitleLoginStudent)}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {isRegistering && mode === 'PARENT' ? (
                                <div className="space-y-6">
                                    {/* STEP 1: Parent Info */}
                                    {regStep === 1 && (
                                        <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.parentName}</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                                    placeholder={text.placeholderName}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.parentEmail}</label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                                    placeholder={text.placeholderEmail}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.password}</label>
                                                <div className="relative">
                                                    <input
                                                        type={showParentPassword ? "text" : "password"}
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                                        placeholder="Mínimo 6 caracteres"
                                                    />
                                                    <button type="button" onClick={() => setShowParentPassword(!showParentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">
                                                        {showParentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    if (formData.name && formData.email && formData.password.length >= 6) setRegStep(2);
                                                    else toast.error("Completa todos los campos de padre.");
                                                }}
                                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg mt-4"
                                            >
                                                SIGUIENTE: DATOS DEL ESTUDIANTE →
                                            </Button>
                                        </motion.div>
                                    )}

                                    {/* STEP 2: Student Info */}
                                    {regStep === 2 && (
                                        <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.studentName}</label>
                                                <input
                                                    type="text"
                                                    value={formData.studentName}
                                                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                                    placeholder="Nombre de tu hijo/a"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.studentEmail}</label>
                                                <input
                                                    type="email"
                                                    value={formData.studentEmail}
                                                    onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                                                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                                    placeholder="hijo@ejemplo.com"
                                                />
                                            </div>
                                            <div className="space-y-4 pt-2">
                                                <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.gradeSelect}</label>
                                                <GradeSelector
                                                    selectedGrade={formData.gradeLevel}
                                                    onSelect={(g) => setFormData({ ...formData, gradeLevel: g })}
                                                    variant="desktop"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                                                <span className="text-sm font-bold text-stone-800">{text.isBilingual}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, isBilingual: !formData.isBilingual })}
                                                    className={`w-14 h-8 rounded-full relative transition-all ${formData.isBilingual ? 'bg-indigo-600' : 'bg-stone-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.isBilingual ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            <div className="flex gap-4 mt-4">
                                                <Button type="button" onClick={() => setRegStep(1)} className="flex-1 h-12 bg-stone-100 text-stone-500 font-bold rounded-xl">VOLVER</Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        if (formData.studentName && formData.studentEmail) setRegStep(3);
                                                        else toast.error("Completa los datos de tu hijo/a.");
                                                    }}
                                                    className="flex-[2] h-12 bg-indigo-600 text-white font-bold rounded-xl"
                                                >
                                                    SIGUIENTE →
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 3: WhatsApp & Optional Integrations */}
                                    {regStep === 3 && (
                                        <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.parentPhone}</label>
                                                <input
                                                    type="tel"
                                                    value={formData.whatsappPhone}
                                                    onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
                                                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-green-500 transition-all font-bold"
                                                    placeholder="+57 300..."
                                                />
                                                <p className="text-[11px] text-stone-400 italic">{text.parentPhoneDesc}</p>
                                            </div>
                                            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <BookOpen className="w-5 h-5 text-orange-600" />
                                                    <span className="text-sm font-bold text-stone-800">Conectar Moodle</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, connectMoodle: !formData.connectMoodle })}
                                                    className={`w-14 h-8 rounded-full relative transition-all ${formData.connectMoodle ? 'bg-orange-600' : 'bg-stone-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${formData.connectMoodle ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            {formData.connectMoodle && (
                                                <div className="p-4 rounded-2xl bg-white border border-orange-100 space-y-3">
                                                    <input type="url" placeholder="URL Moodle" className="w-full p-2 border rounded-lg text-sm" value={formData.moodleUrl} onChange={e => setFormData({ ...formData, moodleUrl: e.target.value })} />
                                                    <input type="text" placeholder="Usuario" className="w-full p-2 border rounded-lg text-sm" value={formData.moodleUsername} onChange={e => setFormData({ ...formData, moodleUsername: e.target.value })} />
                                                    <input type="password" placeholder="Contraseña" className="w-full p-2 border rounded-lg text-sm" value={formData.moodlePassword} onChange={e => setFormData({ ...formData, moodlePassword: e.target.value })} />
                                                </div>
                                            )}
                                            <div className="flex gap-4 mt-4">
                                                <Button type="button" onClick={() => setRegStep(2)} className="flex-1 h-12 bg-stone-100 text-stone-500 font-bold rounded-xl">VOLVER</Button>
                                                <Button type="button" onClick={() => setRegStep(4)} className="flex-[2] h-12 bg-indigo-600 text-white font-bold rounded-xl">SIGUIENTE →</Button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 4: Consent */}
                                    {regStep === 4 && (
                                        <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                                            <div className="p-6 bg-indigo-50 border-2 border-indigo-100 rounded-3xl space-y-4">
                                                <div className="flex items-start gap-4">
                                                    <input
                                                        type="checkbox"
                                                        id="consentDesktop"
                                                        checked={isHabeasAccepted}
                                                        onChange={(e) => setIsHabeasAccepted(e.target.checked)}
                                                        className="w-6 h-6 rounded-md border-indigo-300 text-indigo-600 mt-1"
                                                    />
                                                    <label htmlFor="consentDesktop" className="text-sm text-stone-600 leading-relaxed font-medium">
                                                        {text.habeasData}
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <Button type="button" onClick={() => setRegStep(3)} className="flex-1 h-12 bg-stone-100 text-stone-500 font-bold rounded-xl">VOLVER</Button>
                                                <Button type="submit" disabled={loading} className="flex-[2] h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl text-lg">
                                                    {loading ? 'REGISTRANDO...' : '¡EMPEZAR AVENTURA! 🚀'}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-500 uppercase ml-1">
                                            {mode === 'STUDENT' ? text.studentEmail : (mode === 'ADMIN' ? 'Correo de Admin' : text.email)}
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                            placeholder={text.placeholderEmail}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.password}</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                                placeholder={text.placeholderPass}
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={loading} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl text-lg mt-2">
                                        {loading ? <Loader2 className="animate-spin" /> : text.loginButton}
                                    </Button>

                                    {!isRegistering && (
                                        <div className="flex justify-center">
                                            <button
                                                type="button"
                                                className="text-sm text-stone-400 hover:text-indigo-600 transition-colors"
                                                onClick={async () => {
                                                    if (!formData.email.trim()) {
                                                        toast.error(language === 'es' ? 'Escribe tu correo primero.' : 'Enter your email first.');
                                                        return;
                                                    }
                                                    try {
                                                        await sendPasswordReset(formData.email.trim());
                                                        toast.success(
                                                            language === 'es' ? 'Correo enviado' : 'Email sent',
                                                            { description: language === 'es' ? `Revisa tu bandeja de ${formData.email} para restablecer tu contraseña.` : `Check ${formData.email} for a password reset link.`, duration: 8000 }
                                                        );
                                                    } catch (err: any) {
                                                        toast.error(err.message || (language === 'es' ? 'No se pudo enviar el correo.' : 'Could not send email.'));
                                                    }
                                                }}
                                            >
                                                {text.forgotPass}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* DEMO MODE BUTTON */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-stone-100"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-stone-400 font-bold tracking-widest">
                                        {language === 'es' ? 'Presentación Rápida' : 'Quick Demo'}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({ ...formData, email: 'sofia.demo@novaschola.com', password: 'demo2024' });
                                    onLogin({ email: 'sofia.demo@novaschola.com', password: 'demo2024' }, 'STUDENT');
                                    setTimeout(() => startTour(), 500);
                                }}
                                className="w-full h-14 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-500 hover:via-orange-600 hover:to-rose-600 text-white font-black rounded-2xl shadow-xl shadow-orange-200 text-base transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 border-2 border-white/20"
                            >
                                <span className="text-2xl">🎬</span>
                                <span>{language === 'es' ? 'VER DEMO INTERACTIVA' : 'VIEW INTERACTIVE DEMO'}</span>
                            </button>

                            {mode === 'PARENT' && (
                                <div className="flex flex-col items-center gap-4 mt-8">
                                    <div className="flex items-center gap-1 text-sm text-stone-500">
                                        <span>{isRegistering ? text.hasAccount : text.noAccount}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsRegistering(!isRegistering);
                                                setRegStep(1);
                                            }}
                                            className="text-indigo-600 font-bold hover:underline"
                                        >
                                            {isRegistering ? text.loginLink : text.createAccount}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
