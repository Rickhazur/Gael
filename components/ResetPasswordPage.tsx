import React, { useState } from 'react';
import { Lock, ShieldCheck, CheckCircle2, AlertTriangle, Save, Loader2, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { updateUserPassword } from '../services/supabase';

interface ResetPasswordPageProps {
    /** Called when the password has been changed successfully. The parent should navigate to login. */
    onSuccess: () => void;
    /** Called when the user wants to cancel and go to login. */
    onCancel: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onSuccess, onCancel }) => {
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPass.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (newPass !== confirmPass) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);

        try {
            await updateUserPassword(newPass);
            setSuccess(true);
            // Wait a moment so the user sees the success message, then redirect
            setTimeout(() => {
                onSuccess();
            }, 3000);
        } catch (err: any) {
            console.error('Password reset error:', err);
            if (err.message?.includes('should be different')) {
                setError('La nueva contraseña debe ser diferente a la anterior.');
            } else if (err.message?.includes('weak')) {
                setError('La contraseña es muy débil. Usa al menos 6 caracteres.');
            } else {
                setError(err.message || 'Error al actualizar la contraseña. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
                {/* Success State */}
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border-4 border-emerald-400 animate-in fade-in zoom-in duration-500">
                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-10 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ring-4 ring-emerald-300 animate-bounce">
                            <CheckCircle className="w-14 h-14 text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-3">
                            ¡Contraseña Actualizada!
                        </h2>
                        <p className="text-emerald-100 font-medium text-lg">
                            Tu nueva contraseña ha sido guardada exitosamente.
                        </p>
                    </div>
                    <div className="p-8 text-center">
                        <p className="text-slate-500 font-medium mb-6">
                            Redirigiendo al inicio de sesión...
                        </p>
                        <div className="flex justify-center">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                        <button
                            onClick={onSuccess}
                            className="mt-6 text-indigo-600 font-bold hover:text-indigo-800 transition-colors underline"
                        >
                            Ir al login ahora
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/15 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-cyan-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative border-4 border-indigo-500 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-indigo-400">
                        <ShieldCheck className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">
                        Nueva Contraseña
                    </h2>
                    <p className="text-indigo-100 font-medium">
                        Escribe tu nueva contraseña secreta para tu cuenta de Nova Schola.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-500 ml-2 mb-1 uppercase tracking-wider">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPass}
                                    onChange={(e) => setNewPass(e.target.value)}
                                    className="w-full pl-12 pr-14 py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 outline-none"
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-500 ml-2 mb-1 uppercase tracking-wider">
                                Confirmar Contraseña
                            </label>
                            <div className="relative">
                                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPass}
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 outline-none"
                                    placeholder="Repite la contraseña"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password strength indicator */}
                    {newPass.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        className={`h-1.5 flex-1 rounded-full transition-all ${newPass.length >= level * 3
                                                ? level <= 1 ? 'bg-red-400' : level <= 2 ? 'bg-orange-400' : level <= 3 ? 'bg-yellow-400' : 'bg-emerald-400'
                                                : 'bg-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-[11px] text-slate-400">
                                {newPass.length < 6 ? '⚠️ Mínimo 6 caracteres' : newPass.length < 9 ? '👍 Bien' : '💪 ¡Excelente!'}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 p-4 rounded-xl flex items-center gap-3 font-bold text-sm animate-pulse">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="w-6 h-6" />
                                Guardar Nueva Contraseña
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full text-slate-400 hover:text-slate-600 font-medium text-sm py-2 flex items-center justify-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al inicio de sesión
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
