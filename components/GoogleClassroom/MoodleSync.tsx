import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Cloud, BookOpen, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    fetchAllMoodleAssignments,
    getMoodleSiteInfo,
    getMoodleTokenFromLogin,
} from '@/services/moodleService';
import {
    saveMoodleCredentials,
    getMoodleCredentials,
    syncMoodleAssignments,
    getMoodleAssignments,
    deleteMoodleCredentials,
    supabase
} from '@/services/supabase';
import { cn } from '@/lib/utils';

interface MoodleSyncProps {
    language?: 'es' | 'en';
}

export const MoodleSync: React.FC<MoodleSyncProps> = ({ language = 'es' }) => {
    const [moodleUrl, setMoodleUrl] = useState('');
    const [moodleToken, setMoodleToken] = useState('');
    const [moodleUsername, setMoodleUsername] = useState('');
    const [moodlePassword, setMoodlePassword] = useState('');
    const [useToken, setUseToken] = useState(false); // false = user+pass (easier)
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase?.auth.getUser() || { data: { user: null } };
            if (user?.id) {
                setUserId(user.id);
                const creds = await getMoodleCredentials(user.id);
                if (creds) {
                    setIsConnected(true);
                    setMoodleUrl(creds.moodle_url);
                    const data = await getMoodleAssignments(user.id);
                    setAssignments(data || []);
                }
            }
        };
        init();
    }, []);

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        const baseUrl = moodleUrl.replace(/\/$/, '');
        if (!userId || !baseUrl) {
            toast.error(language === 'es' ? 'Ingresa la URL de Moodle' : 'Enter Moodle URL');
            return;
        }
        if (useToken && !moodleToken.trim()) {
            toast.error(language === 'es' ? 'Ingresa el token de API' : 'Enter API token');
            return;
        }
        if (!useToken && (!moodleUsername.trim() || !moodlePassword.trim())) {
            toast.error(language === 'es' ? 'Ingresa usuario y contraseña de Moodle' : 'Enter Moodle username and password');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            let token: string;
            if (useToken) {
                const siteInfo = await getMoodleSiteInfo(baseUrl, moodleToken.trim());
                token = moodleToken.trim();
                await saveMoodleCredentials(userId, baseUrl, token, siteInfo.sitename);
            } else {
                token = await getMoodleTokenFromLogin(baseUrl, moodleUsername.trim(), moodlePassword.trim());
                const siteInfo = await getMoodleSiteInfo(baseUrl, token);
                await saveMoodleCredentials(userId, baseUrl, token, siteInfo.sitename);
            }
            setIsConnected(true);
            setMoodleToken('');
            setMoodlePassword('');
            toast.success(language === 'es' ? '¡Conectado a Moodle!' : 'Connected to Moodle!');
            handleSync();
        } catch (err: any) {
            setError(err.message || (language === 'es' ? 'No se pudo conectar. Verifica los datos.' : 'Could not connect. Verify your data.'));
            toast.error(err.message);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSync = useCallback(async () => {
        if (!userId) return;

        const creds = await getMoodleCredentials(userId);
        if (!creds) {
            toast.error(language === 'es' ? 'No estás conectado a Moodle' : 'Not connected to Moodle');
            return;
        }

        setIsSyncing(true);
        setError(null);

        try {
            const moodleAssignments = await fetchAllMoodleAssignments(creds.moodle_url, creds.moodle_token);
            await syncMoodleAssignments(userId, moodleAssignments.map(a => ({
                id: a.id,
                name: a.name,
                intro: a.intro,
                duedate: a.duedate,
                grade: a.grade,
                course: a.course,
                courseName: a.courseName,
                courseShortname: a.courseShortname,
            })));

            const data = await getMoodleAssignments(userId);
            setAssignments(data || []);
            toast.success(language === 'es' ? `¡${moodleAssignments.length} tareas sincronizadas!` : `${moodleAssignments.length} tasks synced!`);
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsSyncing(false);
        }
    }, [userId, language]);

    const handleDisconnect = async () => {
        if (!userId) return;
        await deleteMoodleCredentials(userId);
        setIsConnected(false);
        setAssignments([]);
        setMoodleUrl('');
        setMoodleToken('');
        setError(null);
        toast.success(language === 'es' ? 'Desconectado' : 'Disconnected');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center transform -rotate-3">
                            <span className="text-3xl">📚</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 font-fredoka">
                                {language === 'es' ? 'Sincronizar Moodle' : 'Sync Moodle'}
                            </h1>
                            <p className="text-slate-500 text-sm">
                                {language === 'es' ? 'Tu colegio usa Moodle. Conecta para importar tus tareas.' : 'Your school uses Moodle. Connect to import your tasks.'}
                            </p>
                        </div>
                    </div>
                </div>

                {!isConnected ? (
                    <form onSubmit={handleConnect} className="mt-8 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                {language === 'es' ? 'URL de Moodle' : 'Moodle URL'}
                            </label>
                            <input
                                type="url"
                                value={moodleUrl}
                                onChange={(e) => setMoodleUrl(e.target.value)}
                                placeholder="https://virtual.colegio.edu.co"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none"
                            />
                        </div>

                        {!useToken ? (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        {language === 'es' ? 'Usuario de Moodle' : 'Moodle username'}
                                    </label>
                                    <input
                                        type="text"
                                        value={moodleUsername}
                                        onChange={(e) => setMoodleUsername(e.target.value)}
                                        placeholder={language === 'es' ? 'Tu usuario en Moodle' : 'Your Moodle username'}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        {language === 'es' ? 'Contraseña de Moodle' : 'Moodle password'}
                                    </label>
                                    <input
                                        type="password"
                                        value={moodlePassword}
                                        onChange={(e) => setMoodlePassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">
                                        {language === 'es'
                                            ? 'Usamos tus credenciales solo para obtener acceso. No guardamos tu contraseña.'
                                            : 'We use your credentials only to get access. We don\'t store your password.'}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    {language === 'es' ? 'Token de API' : 'API Token'}
                                </label>
                                <input
                                    type="password"
                                    value={moodleToken}
                                    onChange={(e) => setMoodleToken(e.target.value)}
                                    placeholder="••••••••••••••••"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none"
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    {language === 'es'
                                        ? 'Obtén tu token en Moodle: Perfil → Preferencias → Tokens de seguridad'
                                        : 'Get your token in Moodle: Profile → Preferences → Security keys'}
                                </p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setUseToken(!useToken)}
                            className="text-xs text-orange-600 hover:text-orange-700 font-bold"
                        >
                            {useToken
                                ? (language === 'es' ? '← Usar usuario y contraseña' : '← Use username and password')
                                : (language === 'es' ? 'Usar token de API en su lugar' : 'Use API token instead')}
                        </button>
                        {error && (
                            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}
                        <Button
                            type="submit"
                            disabled={isConnecting || !moodleUrl.trim() || (useToken ? !moodleToken.trim() : (!moodleUsername.trim() || !moodlePassword.trim()))}
                            className="w-full h-14 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl"
                        >
                            {isConnecting ? (
                                <><RefreshCw className="w-5 h-5 animate-spin mr-2" /> {language === 'es' ? 'Conectando...' : 'Connecting...'}</>
                            ) : (
                                <><Cloud className="w-5 h-5 mr-2" /> {language === 'es' ? 'Conectar' : 'Connect'}</>
                            )}
                        </Button>
                    </form>
                ) : (
                    <div className="mt-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                <CheckCircle className="w-5 h-5" />
                                {language === 'es' ? 'Conectado' : 'Connected'} • {moodleUrl}
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                    className="bg-orange-600 hover:bg-orange-500"
                                >
                                    <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing && "animate-spin")} />
                                    {isSyncing ? (language === 'es' ? 'Sincronizando...' : 'Syncing...') : (language === 'es' ? 'Sincronizar' : 'Sync')}
                                </Button>
                                <button
                                    onClick={handleDisconnect}
                                    className="text-sm text-red-500 font-bold hover:underline"
                                >
                                    {language === 'es' ? 'Desconectar' : 'Disconnect'}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                                <button onClick={() => setError(null)} className="ml-auto">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="font-bold text-slate-800 mb-4">
                                {language === 'es' ? 'Tareas importadas' : 'Imported tasks'} ({assignments.length})
                            </h3>
                            {assignments.length === 0 ? (
                                <p className="text-slate-500 text-sm">
                                    {language === 'es' ? 'Sincroniza para ver tus tareas de Moodle.' : 'Sync to see your Moodle tasks.'}
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    <AnimatePresence>
                                        {assignments.map((a, i) => (
                                            <motion.div
                                                key={a.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3"
                                            >
                                                <BookOpen className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <div className="font-bold text-slate-800">{a.title}</div>
                                                    <div className="text-xs text-slate-500">{a.course_name}</div>
                                                    {a.due_date && (
                                                        <div className="text-xs text-orange-600 mt-1">
                                                            {language === 'es' ? 'Entrega:' : 'Due:'} {new Date(a.due_date).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
