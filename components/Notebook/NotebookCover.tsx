import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, FileText, Sparkles } from 'lucide-react';

interface Notebook {
    id: string;
    title: string;
    subject: string;
    color: string;
    cover_emoji: string;
    description: string;
    note_count: number;
    last_note_date: string | null;
    updated_at: string;
}

interface NotebookCoverProps {
    notebook: Notebook;
    onClick: () => void;
    index: number;
    language: 'es' | 'en';
    /** In demo mode, reduce animations to avoid flickering on mobile */
    demoMode?: boolean;
}

export const NotebookCover: React.FC<NotebookCoverProps> = ({ notebook, onClick, index, language, demoMode }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getSubjectLabel = (subject: string) => {
        const labels: Record<string, { es: string; en: string }> = {
            math: { es: 'Matemáticas', en: 'Math' },
            english: { es: 'Inglés', en: 'English' },
            science: { es: 'Ciencias', en: 'Science' },
            history: { es: 'Historia', en: 'History' },
            other: { es: 'Otros', en: 'Other' }
        };
        return labels[subject]?.[language] || subject;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 20 }}
            animate={{
                opacity: 1,
                y: demoMode ? 0 : [0, -10, 0],
                rotateX: demoMode ? 0 : [0, 2, 0],
            }}
            transition={
                demoMode
                    ? { delay: index * 0.05, duration: 0.5 }
                    : {
                        delay: index * 0.1,
                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                        rotateX: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                    }
            }
            whileHover={{ y: -20, scale: 1.05, rotateY: 5 }}
            onClick={onClick}
            className="cursor-pointer group perspective-1000 relative"
        >
            {/* Magnetic Field Glow */}
            <div className={`absolute -inset-10 bg-gradient-to-br opacity-0 group-hover:opacity-20 blur-[50px] transition-opacity duration-700 rounded-full`}
                style={{ backgroundColor: notebook.color }} />

            {/* Notebook 3D Container */}
            <div className="relative aspect-[3/4.2] transform-style-3d transition-transform duration-500">

                {/* Ambient Shadow (Space) */}
                <div className="absolute inset-0 bg-black/40 blur-2xl translate-y-12 scale-90 opacity-40 group-hover:opacity-60 transition-opacity" />

                {/* Notebook Cover */}
                <div
                    className="absolute inset-0 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden border border-white/20 group-hover:border-white/40 transition-all duration-500"
                    style={{
                        background: `linear-gradient(135deg, ${notebook.color} 0%, #0f172a 100%)`,
                    }}
                >
                    {/* Pulsing Stellar Core - reduced in demo to avoid flicker */}
                    <motion.div
                        animate={demoMode ? { opacity: 0.15, scale: 1 } : { opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
                        transition={demoMode ? {} : { duration: 3, repeat: Infinity }}
                        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[60px] pointer-events-none"
                        style={{ backgroundColor: notebook.color }}
                    />

                    {/* Circuitry / Constellation Lines Overlay */}
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                    {/* Glass Surface Shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />

                    {/* Content */}
                    <div className="relative h-full p-6 flex flex-col z-10">
                        {/* Top Section */}
                        <div className="flex-1">
                            {/* Emoji Hologram */}
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150 animate-pulse" />
                                <div className="text-7xl relative transform group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-500 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                    {notebook.cover_emoji}
                                </div>
                            </div>

                            {/* Title with Cosmic Glow */}
                            <h3 className="text-2xl font-black text-white mb-2 line-clamp-2 leading-tight tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-300 transition-all">
                                {notebook.title}
                            </h3>

                            {/* Subject Badge (Futuristic) */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: notebook.color }} />
                                <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">
                                    {getSubjectLabel(notebook.subject)}
                                </span>
                            </div>
                        </div>

                        {/* Bottom Section - Stats (Holographic Panel) */}
                        <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white/70">
                                    <FileText className="w-4 h-4 text-indigo-400" />
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {notebook.note_count} {language === 'es' ? 'NOTAS' : 'NOTES'}
                                    </span>
                                </div>
                                <Sparkles className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity animate-spin-slow" />
                            </div>

                            {/* Date with Progress look */}
                            {notebook.last_note_date && (
                                <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-2 text-white/50 mb-1">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Last Entry</span>
                                    </div>
                                    <div className="text-[11px] text-white font-black">
                                        {formatDate(notebook.last_note_date)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cyber-Spine (Left side) */}
                    <div className="absolute left-0 top-0 bottom-0 w-10 bg-black/30 border-r border-white/10 overflow-hidden">
                        <div className="h-full flex flex-col justify-around py-6 px-1.5">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="w-full h-[1px] bg-white/10 shadow-[0_0_5px_rgba(255,255,255,0.1)]" />
                            ))}
                        </div>
                        {/* Glow on spine */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
                    </div>

                    {/* Corner Tag */}
                    <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none">
                        <div className="absolute top-4 right-[-30px] w-[120px] py-1 bg-white/5 backdrop-blur-md border border-white/10 rotate-45 text-[8px] font-black text-white/30 text-center tracking-[0.3em] uppercase">
                            STLV-X{index + 100}
                        </div>
                    </div>
                </div>

                {/* 3D Depth Spine */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-3 rounded-l-2xl"
                    style={{
                        background: `linear-gradient(to right, #000, ${notebook.color}99)`,
                        transform: 'translateX(-3px) rotateY(-10deg)',
                        transformOrigin: 'right center',
                    }}
                />
            </div>
        </motion.div>
    );
};
