import React, { useEffect, useState } from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from 'recharts';
import { Brain, Star, Trophy, Zap, Clock, Target, TrendingUp, ShieldCheck } from 'lucide-react';
import { getLearningProgress, LearningProgressData } from '@/services/learningProgress';
import { motion } from 'framer-motion';

interface MetricsDashboardProps {
    userId: string;
    language: 'es' | 'en';
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ userId, language }) => {
    const [stats, setStats] = useState<LearningProgressData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await getLearningProgress(userId);
                setStats(data);
            } catch (error) {
                console.error("Error loading stats:", error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, [userId]);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-10 space-y-4">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold animate-pulse">
                    {language === 'es' ? 'Calculando tus superpoderes...' : 'Calculating your superpowers...'}
                </p>
            </div>
        );
    }

    if (!stats) return null;

    // Data for the Radar Chart (Subject Mastery)
    const radarData = [
        { subject: language === 'es' ? 'Matemáticas' : 'Math', A: stats.quests_by_category.math * 10, fullMark: 100 },
        { subject: language === 'es' ? 'Ciencias' : 'Science', A: stats.quests_by_category.science * 10, fullMark: 100 },
        { subject: language === 'es' ? 'Lenguaje' : 'Language', A: stats.quests_by_category.language * 10, fullMark: 100 },
        { subject: language === 'es' ? 'Sociales' : 'Social Studies', A: stats.quests_by_category.social_studies * 10, fullMark: 100 },
    ];

    // Data for Difficulty Distribution
    const difficultyData = [
        { name: language === 'es' ? 'Fácil' : 'Easy', value: stats.quests_by_difficulty.easy, color: '#10b981' },
        { name: language === 'es' ? 'Medio' : 'Medium', value: stats.quests_by_difficulty.medium, color: '#f59e0b' },
        { name: language === 'es' ? 'Difícil' : 'Hard', value: stats.quests_by_difficulty.hard, color: '#ef4444' },
    ];

    const t = {
        es: {
            title: "Mis Súper Poderes",
            subtitle: "Tu progreso real en la academia de héroes",
            accuracy: "Precisión",
            streak: "Racha Actual",
            totalQuests: "Misiones",
            xp: "Experiencia",
            level: "Nivel",
            masteryTitle: "Dominio de Temas",
            difficultyTitle: "Desafíos Superados",
            badgesTitle: "Insignias de Honor",
            trophiesTitle: "Salón de Trofeos",
            emptyBadges: "¡Pronto ganarás tu primera insignia!",
            accuracyDesc: "Aciertos totales",
            days: "días"
        },
        en: {
            title: "My Superpowers",
            subtitle: "Your real progress in the hero academy",
            accuracy: "Accuracy",
            streak: "Current Streak",
            totalQuests: "Missions",
            xp: "Experience",
            level: "Level",
            masteryTitle: "Subject Mastery",
            difficultyTitle: "Challenges Overcome",
            badgesTitle: "Badges of Honor",
            trophiesTitle: "Hall of Trophies",
            emptyBadges: "You'll earn your first badge soon!",
            accuracyDesc: "Total hit rate",
            days: "days"
        }
    };

    const text = t[language];

    return (
        <div className="space-y-8 animate-fade-in pb-20 font-nunito">
            {/* Header section with impact */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">{text.title}</h1>
                    <p className="text-indigo-100 font-bold opacity-90">{text.subtitle}</p>
                </div>
                <div className="flex gap-4 relative z-10">
                    <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 text-center">
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">{text.level}</div>
                        <div className="text-3xl font-black">{Math.floor(stats.total_xp / 1000) + 1}</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 text-center">
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">XP</div>
                        <div className="text-3xl font-black">{stats.total_xp}</div>
                    </div>
                </div>
            </div>

            {/* Core Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: text.accuracy, value: `${stats.accuracy_rate}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: text.accuracyDesc },
                    { label: text.streak, value: `${stats.current_streak} ${text.days}`, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Días consecutivos' },
                    { label: text.totalQuests, value: stats.total_quests_completed, icon: Trophy, color: 'text-indigo-500', bg: 'bg-indigo-50', desc: 'Retos cumplidos' },
                    { label: 'Nova Coins', value: stats.total_coins, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50', desc: 'Tesoro acumulado' },
                ].map((kpi, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-[2rem] border-4 border-black/5 shadow-xl hover:shadow-2xl transition-all group"
                    >
                        <div className={`w-12 h-12 ${kpi.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                        </div>
                        <div className="text-3xl font-black text-slate-800 mb-1">{kpi.value}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Radar Chart Card */}
                <div className="bg-white p-8 rounded-[3rem] border-4 border-black/5 shadow-xl flex flex-col">
                    <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                        <Brain className="w-8 h-8 text-indigo-600" />
                        {text.masteryTitle}
                    </h3>
                    <div className="h-80 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontWeight: 700, fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                                <Radar
                                    name="Poder"
                                    dataKey="A"
                                    stroke="#4f46e5"
                                    strokeWidth={4}
                                    fill="#4f46e5"
                                    fillOpacity={0.6}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Difficulty Bar Chart Card */}
                <div className="bg-white p-8 rounded-[3rem] border-4 border-black/5 shadow-xl flex flex-col">
                    <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-rose-600" />
                        {text.difficultyTitle}
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={difficultyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 800 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                                    {difficultyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Badges and Trophies */}
            <div className="bg-white p-8 rounded-[3rem] border-4 border-black/5 shadow-xl">
                <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-amber-500" />
                    {text.badgesTitle}
                </h3>

                {stats.unlocked_badges.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <div className="text-6xl mb-4">🎖️</div>
                        <p className="font-bold text-slate-400">{text.emptyBadges}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
                        {stats.unlocked_badges.map((badgeId) => (
                            <div key={badgeId} className="flex flex-col items-center group cursor-help">
                                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-110 transition-transform mb-2">
                                    <BadgeIcon id={badgeId} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight text-center text-slate-600">
                                    {badgeId.replace('-', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper component for Badge Icons
const BadgeIcon = ({ id }: { id: string }) => {
    const badges: Record<string, string> = {
        'first-quest': '🐣',
        'quest-master': '🎓',
        'quest-legend': '👑',
        'quest-champion': '🏆',
        'math-genius': '🧮',
        'science-explorer': '🧪',
        'language-master': '📖',
        'social-explorer': '🌍',
        'streak-3': '🔥',
        'streak-7': '⚡',
        'streak-14': '💎',
        'streak-30': '🎖️',
        'hard-mode': '🦾',
        'hard-master': '🔥'
    };
    return <span className="text-3xl">{badges[id] || '🏅'}</span>;
};
