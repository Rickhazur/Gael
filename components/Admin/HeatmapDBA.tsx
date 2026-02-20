import React, { useEffect, useState } from 'react';
import { getDBAPerformance } from '../../services/supabase';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const HeatmapDBA: React.FC = () => {
    const [performance, setPerformance] = useState<{ name: string; score: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await getDBAPerformance();
            setPerformance(data);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="p-10 text-center animate-pulse">Cargando mapa de calor...</div>;

    if (performance.length === 0) return (
        <div className="p-10 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed">
            No hay suficientes datos para generar el mapa de calor de DBAs.
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">Mapa de Calor: Desempeño por DBA</h4>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                        <div className="w-3 h-3 bg-rose-500 rounded-sm" /> Crítico
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                        <div className="w-3 h-3 bg-amber-500 rounded-sm" /> En Riesgo
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                        <div className="w-3 h-3 bg-emerald-500 rounded-sm" /> Dominado
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {performance.map((dba, idx) => {
                    const color = dba.score < 60 ? 'bg-rose-50 border-rose-200' : dba.score < 80 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200';
                    const textColor = dba.score < 60 ? 'text-rose-700' : dba.score < 80 ? 'text-amber-700' : 'text-emerald-700';
                    const barColor = dba.score < 60 ? 'bg-rose-500' : dba.score < 80 ? 'bg-amber-500' : 'bg-emerald-500';
                    const Icon = dba.score < 60 ? AlertTriangle : dba.score < 80 ? Info : CheckCircle;

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`${color} border-2 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition-all cursor-help relative group`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className={`${barColor} p-2 rounded-lg text-white shadow-sm`}>
                                    <Icon size={16} />
                                </div>
                                <span className={`text-2xl font-black ${textColor}`}>{dba.score}%</span>
                            </div>

                            <div>
                                <h5 className="font-bold text-slate-800 text-sm mb-2 uppercase line-clamp-2">{dba.name}</h5>
                                <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${dba.score}%` }}
                                        className={`h-full ${barColor}`}
                                    />
                                </div>
                            </div>

                            {/* Tooltip on hover */}
                            <div className="absolute inset-0 bg-slate-900/90 text-white p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center text-center pointer-events-none z-10">
                                <p className="text-xs font-bold leading-tight">
                                    {dba.score < 60 ? 'Requiere refuerzo urgente. El 40% de los estudiantes no comprende este concepto.' :
                                        dba.score < 80 ? 'Buen progreso, pero necesita práctica adicional en problemas aplicados.' :
                                            'Concepto dominado satisfactoriamente por la mayoría del grupo.'}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
