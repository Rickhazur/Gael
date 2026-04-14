import React, { useEffect, useState } from 'react';
import { Users, Clock, TrendingUp, CheckCircle, Lock, Monitor, CreditCard, RefreshCw } from 'lucide-react';
import { adminGetPendingUsers, adminActivateSubscription, adminGetAllProfiles } from '../../services/supabase';

const AdminDashboard: React.FC = () => {
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        setLoading(true);
        const timeoutMs = 12000;
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeoutMs)
        );
        try {
            const [pending, all] = await Promise.all([
                Promise.race([adminGetPendingUsers(), timeoutPromise]),
                adminGetAllProfiles()
            ]);
            setPendingUsers(pending);
            setAllUsers(all);
        } catch (e) {
            console.error('Error cargando solicitudes:', e);
            setPendingUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleActivate = async (userId: string, userName: string) => {
        if (window.confirm(`¿Estás seguro de activar la suscripción para ${userName}?`)) {
            const success = await adminActivateSubscription(userId);
            if (success) {
                // alert('Usuario activado exitosamente');
                loadUsers(); // Refresh list
            } else {
                alert('Error al activar. Verifica tu conexión o permisos.');
            }
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans animate-fade-in text-stone-800">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Panel de Control</h1>
                    <p className="text-stone-500">Gestión de Nuevas Inscripciones</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => loadUsers()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-bold text-stone-600 shadow-sm hover:bg-stone-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-stone-800">
                        Configuración
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Estudiantes Pendientes */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-stone-900">{pendingUsers.length}</h3>
                        <p className="text-xs text-stone-500 font-medium">{pendingUsers.length === 1 ? 'Solicitud Pendiente' : 'Solicitudes Pendientes'}</p>
                    </div>
                </div>

                {/* Prueba - Dynamic */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                    <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-stone-900">
                            {allUsers.filter(u => u.subscription_status === 'trial').length}
                        </h3>
                        <p className="text-xs text-stone-500 font-medium">Estudiantes en Prueba</p>
                    </div>
                </div>

                {/* Mejora - Static */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-stone-900">+15%</h3>
                        <p className="text-xs text-stone-500 font-medium">Mejora promedio</p>
                    </div>
                </div>

                {/* Tareas - Static */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-stone-900">28</h3>
                        <p className="text-xs text-stone-500 font-medium">Tareas completadas</p>
                    </div>
                </div>
            </div>

            {/* Pro Section - Locked content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 min-h-[200px] flex flex-col justify-center">
                    <div className="h-4 w-3/4 bg-stone-200 rounded mb-4 mx-auto opacity-50"></div>
                    <div className="h-4 w-1/2 bg-stone-200 rounded mx-auto opacity-50"></div>
                </div>

                {/* Function Exclusive Pro Card 1 */}
                <div className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 text-indigo-500">
                        <Lock className="w-5 h-5" />
                    </div>
                    <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full mb-2">Plan PRO</span>
                    <h3 className="font-bold text-stone-900 mb-2">Reportes Avanzados</h3>
                    <p className="text-xs text-stone-500 max-w-[200px] mb-6">Actualiza tu plan para desbloquear analíticas detalladas.</p>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-200">
                        Actualizar a PRO
                    </button>
                </div>

                {/* Function Exclusive Pro Card 2 */}
                <div className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 text-indigo-500">
                        <Lock className="w-5 h-5" />
                    </div>
                    <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full mb-2">Plan PRO</span>
                    <h3 className="font-bold text-stone-900 mb-2">Gestión Masiva</h3>
                    <p className="text-xs text-stone-500 max-w-[200px] mb-6">Herramientas para gestionar múltiples estudiantes a la vez.</p>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-200">
                        Actualizar a PRO
                    </button>
                </div>
            </div>

            {/* Trial Expiration Section - NEW */}
            {allUsers.some(u => u.subscription_status === 'trial') && (
                <div className="bg-amber-50/50 rounded-3xl p-8 border border-amber-100 mb-8 animate-fade-in">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-stone-900">Seguimiento de Periodos de Prueba</h3>
                            <p className="text-xs text-stone-500">Estudiantes disfrutando de los 7 días de acceso gratuito</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allUsers.filter(u => u.subscription_status === 'trial').map(u => {
                            const diff = Math.ceil((new Date(u.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={u.id} className="bg-white p-4 rounded-2xl border border-amber-50 shadow-sm flex justify-between items-center hover:border-amber-200 transition-colors">
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-stone-800 text-sm truncate">{u.name}</p>
                                        <p className="text-[10px] text-stone-400 truncate">{u.email}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-xs font-black shrink-0 ${diff <= 2 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-amber-100 text-amber-600'}`}>
                                        {diff > 0 ? `${diff}d restantes` : 'Expiró'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-stone-900">Solicitudes de Inscripción</h3>
                            <p className="text-xs text-stone-500">Nuevos estudiantes esperando aprobación</p>
                        </div>
                    </div>
                    <button
                        onClick={() => loadUsers()}
                        className="text-xs font-bold text-stone-500 flex items-center gap-1 hover:text-stone-800"
                    >
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Recargar
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-stone-400 font-bold uppercase tracking-wider border-b border-stone-100">
                                <th className="pb-4 pl-4">Estudiante / Acudiente</th>
                                <th className="pb-4">Plan Solicitado</th>
                                <th className="pb-4">Estado</th>
                                <th className="pb-4">Fecha</th>
                                <th className="pb-4">Bilingüe</th>
                                <th className="pb-4 text-right pr-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-stone-400">
                                        Cargando solicitudes...
                                    </td>
                                </tr>
                            ) : pendingUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-stone-400 font-medium">
                                        ✅ No hay solicitudes pendientes. Todo al día.
                                    </td>
                                </tr>
                            ) : (
                                pendingUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0">
                                        <td className="py-4 pl-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-stone-700">{user.name}</span>
                                                <span className="text-[10px] text-stone-500 font-medium">Acudiente: <span className="text-indigo-600">{user.parentName}</span></span>
                                                <span className="text-[10px] text-stone-400">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 w-fit">
                                                {user.plan || 'Plan Estandar'} <Monitor className="w-3 h-3" />
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded flex items-center gap-1 w-fit">
                                                <Clock className="w-3 h-3" /> Esperando Aprobación
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-stone-500 text-xs">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="py-4 font-mono text-stone-500 text-xs">
                                            {user.is_bilingual ? 'Sí' : 'No'}
                                        </td>
                                        <td className="py-4 pr-4 text-right">
                                            <button
                                                onClick={() => handleActivate(user.id, user.name)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-md shadow-indigo-200"
                                            >
                                                Activar Suscripción
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

        </div>
    );
};

export default AdminDashboard;
