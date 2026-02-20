import { useDemoTour } from '@/context/DemoTourContext';
import { DEFAULT_GRADE } from '@/constants';
import { useTranslation } from '@/hooks/useTranslation';
import { GradeSelector } from './GradeSelector';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Smartphone, ShieldCheck, Eye, EyeOff, Globe, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { registerStudent } from '../services/supabase';
import { Toaster, toast } from 'sonner';
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

                if (result.success) {
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
            } else if (error.message?.includes('Email not confirmed')) {
                msg = language === 'es'
                    ? "📧 Tu correo no ha sido verificado. Revisa tu bandeja de entrada y spam."
                    : "📧 Your email has not been verified. Check your inbox and spam folder.";
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
                            onClick={() => { setMode('PARENT'); setIsRegistering(false); }}
                            className={`flex-1 py-3 text-xs font-black relative z-10 transition-colors ${mode === 'PARENT' ? 'text-white' : 'text-slate-500'}`}
                        >
                            PADRES
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* REGISTRATION FIELDS */}
                        <AnimatePresence>
                            {isRegistering && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden">

                                    {/* Parent Name (Parent Mode) */}
                                    {mode === 'PARENT' && (
                                        <>
                                            <div className="space-y-1">
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-slate-800/60 border border-white/5 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-bold placeholder:text-slate-600"
                                                    placeholder="Tu Nombre Completo"
                                                />
                                            </div>
                                            {/* Mobile WhatsApp Field */}
                                            <div className="space-y-1 pt-1">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-[10px] text-stone-400 font-bold uppercase">WhatsApp (Opcional)</label>
                                                    <span className="text-[9px] text-emerald-400 bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-500/30">Para Reportes</span>
                                                </div>
                                                <input
                                                    type="tel"
                                                    value={formData.whatsappPhone}
                                                    onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
                                                    className="w-full bg-slate-800/60 border border-white/5 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold placeholder:text-slate-600"
                                                    placeholder="+57 300..."
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Student Name (Both Modes) */}
                                    {(mode === 'STUDENT' || mode === 'PARENT') && (
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                value={mode === 'STUDENT' ? formData.name : formData.studentName}
                                                onChange={(e) => mode === 'STUDENT' ? setFormData({ ...formData, name: e.target.value }) : setFormData({ ...formData, studentName: e.target.value })}
                                                className="w-full bg-slate-800/60 border border-white/5 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-bold placeholder:text-slate-600"
                                                placeholder={mode === 'PARENT' ? "Nombre del Estudiante" : "Tu Nombre Completo"}
                                            />
                                        </div>
                                    )}

                                    {/* Student Email (Parent Mode) */}
                                    {mode === 'PARENT' && (
                                        <div className="space-y-1">
                                            <input
                                                type="email"
                                                value={formData.studentEmail}
                                                onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                                                className="w-full bg-slate-800/60 border border-white/5 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-bold placeholder:text-slate-600"
                                                placeholder="Correo del Estudiante"
                                            />
                                        </div>
                                    )}

                                    {/* Grade Selection */}
                                    <div className="bg-slate-800/40 p-3 rounded-xl border border-white/5">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Grado Escolar</label>
                                        <GradeSelector
                                            selectedGrade={formData.gradeLevel}
                                            onSelect={(g) => setFormData({ ...formData, gradeLevel: g })}
                                            variant="mobile"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* EMAIL & PASSWORD (ALWAYS VISIBLE) */}
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
                            ) : (isRegistering ? "CREAR MI CUENTA" : "INICIAR AVENTURA")}
                        </Button>
                    </form>

                    {/* Toggle Login/Register (solo padres pueden crear cuenta; el niño solo inicia sesión) */}
                    <div className="mt-6 flex flex-col items-center gap-4">
                        {mode === 'PARENT' && (
                            <button
                                onClick={() => setIsRegistering(!isRegistering)}
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

                {/* Footer */}
                <div className="absolute bottom-6 text-center z-0 opacity-50">
                    <p className="text-slate-600 text-[10px] font-bold tracking-widest uppercase">Nova Schola Inc. © 2024</p>
                </div>
                <Toaster position="top-center" theme="dark" />
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
                            onClick={() => { setMode('PARENT'); setIsRegistering(false); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all duration-300 ${mode === 'PARENT'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'text-stone-500 hover:text-stone-700'
                                }`}
                        >
                            <Brain className="w-4 h-4" />
                            {text.parent}
                        </button>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white/80 backdrop-blur-xl border border-stone-200 rounded-3xl p-8 shadow-xl">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-stone-900 mb-2">
                                {isRegistering ? text.welcomeRegister : text.welcomeLogin}
                            </h2>
                            <p className="text-stone-500 text-sm">
                                {isRegistering ? (mode === 'PARENT' ? text.subtitleRegisterParent : text.subtitleRegisterStudent) : (mode === 'PARENT' ? text.subtitleLoginParent : text.subtitleLoginStudent)}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {isRegistering && mode === 'PARENT' && (
                                <div className="space-y-6">
                                    {/* Parent Info Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                                            <span className="text-sm font-bold text-stone-800 uppercase tracking-wider">{text.parentInfo}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.parentName}</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all"
                                                placeholder={text.placeholderName}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.parentEmail}</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all"
                                                placeholder={text.placeholderEmail}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.password} (Padre)</label>
                                            <div className="relative">
                                                <input
                                                    type={showParentPassword ? "text" : "password"}
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    required
                                                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowParentPassword(!showParentPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                                                >
                                                    {showParentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        {/* Optional WhatsApp Field */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.parentPhone}</label>
                                                <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                                                    <Smartphone className="w-3 h-3" /> Reportes
                                                </span>
                                            </div>
                                            <input
                                                type="tel"
                                                value={formData.whatsappPhone}
                                                onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
                                                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-green-500 transition-all focus:ring-1 focus:ring-green-500/20 placeholder:text-stone-400"
                                                placeholder="+57 300 123 4567"
                                            />
                                            <p className="text-[10px] text-stone-400 ml-1">
                                                {text.parentPhoneDesc}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Student Info Section */}
                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                                            <Brain className="w-4 h-4 text-indigo-600" />
                                            <span className="text-sm font-bold text-stone-800 uppercase tracking-wider">{text.studentInfo}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.studentName}</label>
                                            <input
                                                type="text"
                                                value={formData.studentName}
                                                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all"
                                                placeholder={text.placeholderName}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.studentEmail}</label>
                                            <input
                                                type="email"
                                                value={formData.studentEmail}
                                                onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                                                required
                                                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all"
                                                placeholder="estudiante@ejemplo.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">{text.password} (Estudiante)</label>
                                            <div className="relative">
                                                <input
                                                    type={showStudentPassword ? "text" : "password"}
                                                    value={formData.studentPassword}
                                                    onChange={(e) => setFormData({ ...formData, studentPassword: e.target.value })}
                                                    required={isRegistering && mode === 'PARENT'}
                                                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                                                >
                                                    {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Grade Selection for Parent-Student Register */}
                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-stone-500 uppercase ml-1">
                                                    {text.gradeSelect}
                                                </label>
                                                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-wider">
                                                    {text.grade} {formData.gradeLevel}°
                                                </span>
                                            </div>
                                            <GradeSelector
                                                selectedGrade={formData.gradeLevel}
                                                onSelect={(g) => setFormData({ ...formData, gradeLevel: g })}
                                                variant="desktop"
                                            />
                                        </div>

                                        {/* Bilingual School Toggle */}
                                        <div className="space-y-3 pt-2">
                                            <div className="flex items-center justify-between bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-stone-800">{text.isBilingual}</p>
                                                    <p className="text-[10px] text-stone-500 leading-tight pr-4">{text.bilingualDesc}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, isBilingual: !formData.isBilingual })}
                                                    className={`w-14 h-8 rounded-full transition-all relative ${formData.isBilingual ? 'bg-indigo-600' : 'bg-stone-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${formData.isBilingual ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Moodle Connection - Optional */}
                                        <div className="space-y-3 pt-4 border-t border-stone-100">
                                            <div className="flex items-center justify-between bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                                                <div className="flex-1 flex items-center gap-2">
                                                    <BookOpen className="w-5 h-5 text-orange-600" />
                                                    <div>
                                                        <p className="text-sm font-bold text-stone-800">
                                                            {language === 'es' ? '¿Tu colegio usa Moodle?' : 'Does your school use Moodle?'}
                                                        </p>
                                                        <p className="text-[10px] text-stone-500 leading-tight pr-2">
                                                            {language === 'es'
                                                                ? 'Conecta las tareas de tu hijo. No guardamos la contraseña.'
                                                                : 'Connect your child\'s tasks. We don\'t store the password.'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, connectMoodle: !formData.connectMoodle })}
                                                    className={`w-14 h-8 rounded-full transition-all relative ${formData.connectMoodle ? 'bg-orange-600' : 'bg-stone-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${formData.connectMoodle ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            {formData.connectMoodle && (
                                                <div className="space-y-3 p-4 rounded-2xl bg-orange-50/30 border border-orange-100">
                                                    <input
                                                        type="url"
                                                        value={formData.moodleUrl}
                                                        onChange={(e) => setFormData({ ...formData, moodleUrl: e.target.value })}
                                                        placeholder={language === 'es' ? 'URL de Moodle (ej: https://virtual.colegio.edu.co)' : 'Moodle URL (e.g. https://virtual.school.edu)'}
                                                        className="w-full bg-white border border-stone-200 text-stone-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={formData.moodleUsername}
                                                        onChange={(e) => setFormData({ ...formData, moodleUsername: e.target.value })}
                                                        placeholder={language === 'es' ? 'Usuario Moodle del niño' : 'Child\'s Moodle username'}
                                                        className="w-full bg-white border border-stone-200 text-stone-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                                                    />
                                                    <input
                                                        type="password"
                                                        value={formData.moodlePassword}
                                                        onChange={(e) => setFormData({ ...formData, moodlePassword: e.target.value })}
                                                        placeholder={language === 'es' ? 'Contraseña Moodle del niño' : 'Child\'s Moodle password'}
                                                        className="w-full bg-white border border-stone-200 text-stone-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Original Fields (Only if not dual register) */}
                            {(!isRegistering || mode !== 'PARENT') && (
                                <>
                                    {/* Student Name Key Field (Only Register Mode) */}
                                    {isRegistering && mode === 'STUDENT' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">
                                                {text.studentName}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-stone-400"
                                            />
                                        </div>
                                    )}

                                    {/* Grade Selection (Only Student Register) */}
                                    {isRegistering && mode === 'STUDENT' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-stone-500 uppercase ml-1">
                                                    {text.gradeSelect}
                                                </label>
                                                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-wider">
                                                    {text.grade} {formData.gradeLevel}°
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-7 gap-2">
                                                {[1, 2, 3, 4, 5, 6, 7].map((g) => (
                                                    <button
                                                        key={g}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, gradeLevel: g })}
                                                        className={`h-12 rounded-2xl font-bold transition-all transform active:scale-95 ${formData.gradeLevel === g
                                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-200'
                                                            : 'bg-stone-50 text-stone-400 border border-stone-100 hover:border-indigo-300 hover:text-indigo-500 hover:bg-white'
                                                            }`}
                                                    >
                                                        {g}°
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-stone-400 font-medium px-1 flex items-center gap-1.5 leading-relaxed">
                                                <Smartphone className="w-3 h-3 text-indigo-400" />
                                                {language === 'es' ? 'Crucial para adaptar el vocabulario y retos DBA.' : 'Crucial for adapting vocabulary and DBA challenges.'}
                                            </p>

                                            {/* Bilingual School Toggle for Student */}
                                            <div className="flex items-center justify-between bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mt-4">
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-stone-800">{text.isBilingual}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, isBilingual: !formData.isBilingual })}
                                                    className={`w-14 h-8 rounded-full transition-all relative ${formData.isBilingual ? 'bg-indigo-600' : 'bg-stone-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${formData.isBilingual ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-500 uppercase ml-1">
                                            {mode === 'STUDENT' ? text.studentEmail : text.email}
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-stone-400"
                                            placeholder={text.placeholderEmail}
                                        />
                                    </div>

                                    {/* Removed guardianPhone section */}
                                </>
                            )}

                            {(!isRegistering || mode !== 'PARENT') && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-stone-500 uppercase ml-1">
                                        {text.password}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                            className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-stone-400"
                                            placeholder={text.placeholderPass}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Habeas Data Checkbox - ONLY FOR REGISTRATION */}
                            {isRegistering && (
                                <div className="flex items-start gap-3 mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                    <div className="pt-0.5">
                                        <input
                                            type="checkbox"
                                            id="habeasData"
                                            checked={isHabeasAccepted}
                                            onChange={(e) => setIsHabeasAccepted(e.target.checked)}
                                            className="w-5 h-5 rounded-md border-2 border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </div>
                                    <label htmlFor="habeasData" className="text-xs text-stone-600 leading-relaxed cursor-pointer select-none">
                                        {text.habeasData}
                                    </label>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 text-base mt-2 disabled:opacity-50"
                            >
                                {loading ? '...' : (isRegistering ? text.registerButton : text.loginButton)}
                            </Button>

                            {/* DEMO MODE BUTTON - For Presentations */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-stone-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-stone-400 font-bold">
                                        {language === 'es' ? 'Modo Presentación' : 'Presentation Mode'}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    // Auto-login with demo credentials
                                    setFormData({
                                        ...formData,
                                        email: 'sofia.demo@novaschola.com',
                                        password: 'demo2024'
                                    });
                                    // Trigger login, then start the tour
                                    onLogin({ email: 'sofia.demo@novaschola.com', password: 'demo2024' }, 'STUDENT');
                                    // Start tour after a short delay to ensure login completes
                                    setTimeout(() => startTour(), 500);
                                }}
                                className="w-full h-14 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-500 hover:via-orange-600 hover:to-rose-600 text-white font-black rounded-2xl shadow-xl shadow-orange-200 text-base transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 border-2 border-white/20"
                            >
                                <span className="text-2xl">🎬</span>
                                <span>{language === 'es' ? 'VER DEMO INTERACTIVA' : 'VIEW INTERACTIVE DEMO'}</span>
                            </button>

                            <p className="text-center text-xs text-stone-400 -mt-2">
                                {language === 'es'
                                    ? 'Perfecto para presentaciones en colegios y padres de familia'
                                    : 'Perfect for school and parent presentations'}
                            </p>

                            <div className="flex flex-col items-center gap-4 mt-6">
                                {!isRegistering && (
                                    <button type="button" className="text-sm text-stone-400 hover:text-indigo-600 transition-colors">
                                        {text.forgotPass}
                                    </button>
                                )}

                                {/* Solo el padre puede crear cuenta; el estudiante solo inicia sesión */}
                                {mode === 'PARENT' && !isRegistering && (
                                    <div className="flex items-center gap-1 text-sm text-stone-500">
                                        <span>{text.noAccount}</span>
                                        <button
                                            type="button"
                                            onClick={() => setIsRegistering(true)}
                                            className="text-indigo-600 font-bold hover:underline"
                                        >
                                            {text.createAccount}
                                        </button>
                                    </div>
                                )}

                                {mode === 'PARENT' && isRegistering && (
                                    <div className="flex items-center gap-1 text-sm text-stone-500">
                                        <span>{text.hasAccount}</span>
                                        <button
                                            type="button"
                                            onClick={() => setIsRegistering(false)}
                                            className="text-indigo-600 font-bold hover:underline"
                                        >
                                            {text.loginLink}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Toaster />
        </div >
    );
};

export default LoginPage;
