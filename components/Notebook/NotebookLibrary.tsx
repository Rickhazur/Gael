import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Plus, Search, Archive, Filter, Download, Sparkles } from 'lucide-react';
import { supabase } from '@/services/supabase';
import { toast } from 'sonner';
import { NotebookCover } from './NotebookCover';
import { NotebookViewer } from './NotebookViewer';
import { CreateNotebookModal } from './CreateNotebookModal';
import { ScanNotebookModal } from './ScanNotebookModal';
import { Camera } from 'lucide-react';

interface Notebook {
    id: string;
    title: string;
    subject: string;
    color: string;
    cover_emoji: string;
    description: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    note_count: number;
    last_note_date: string | null;
}

interface NotebookLibraryProps {
    onClose?: () => void;
    language: 'es' | 'en';
    demoData?: {
        demoMode?: boolean;
        mathNotebookOpen?: boolean;
        scienceNotebookOpen?: boolean;
        shelfNotebooks?: ('math' | 'science')[];
    } | null;
}

const DEMO_MATH_NOTEBOOK: Notebook = {
    id: 'demo-math-notebook',
    title: 'Matemáticas',
    subject: 'math',
    color: '#34d399', // Matching the emerald/green from screenshot
    cover_emoji: '📗',
    description: 'Sesiones grabadas con la Profe Lina',
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    note_count: 1,
    last_note_date: '2026-01-28T10:00:00Z'
};

const DEMO_SCIENCE_NOTEBOOK: Notebook = {
    id: 'demo-science-notebook',
    title: 'Ciencias',
    subject: 'science',
    color: '#10B981',
    cover_emoji: '📙',
    description: 'Investigaciones guardadas',
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    note_count: 1,
    last_note_date: '2026-01-28T10:00:00Z'
};

export const NotebookLibrary: React.FC<NotebookLibraryProps> = ({ onClose, language, demoData }) => {
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [showArchived, setShowArchived] = useState(false);
    const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showScanModal, setShowScanModal] = useState(false);

    useEffect(() => {
        if (demoData?.scienceNotebookOpen) {
            setSelectedNotebook(DEMO_SCIENCE_NOTEBOOK);
        } else if (demoData?.mathNotebookOpen) {
            setSelectedNotebook(DEMO_MATH_NOTEBOOK);
        } else if (demoData?.shelfNotebooks) {
            setSelectedNotebook(null);
        }
    }, [demoData]);

    // Stable star positions to avoid flicker from Math.random() on each render
    const starPositions = useMemo(() =>
        [...Array(50)].map(() => ({ top: Math.random() * 100, left: Math.random() * 100 })),
        []
    );

    const subjects = [
        { id: 'all', label: language === 'es' ? 'Todas' : 'All', emoji: '📚', color: '#6B7280' },
        { id: 'math', label: language === 'es' ? 'Matemáticas' : 'Math', emoji: '📗', color: '#8B5CF6' },
        { id: 'english', label: 'English', emoji: '📘', color: '#3B82F6' },
        { id: 'science', label: language === 'es' ? 'Ciencias' : 'Science', emoji: '📙', color: '#10B981' },
        { id: 'history', label: language === 'es' ? 'Historia' : 'History', emoji: '📕', color: '#EF4444' },
        { id: 'other', label: language === 'es' ? 'Otros' : 'Other', emoji: '📓', color: '#F59E0B' },
    ];

    useEffect(() => {
        loadNotebooks();
    }, [showArchived, demoData?.demoMode, demoData?.shelfNotebooks?.join(',')]);

    const loadNotebooks = async () => {
        try {
            setLoading(true);

            // If in demo mode, inject demo notebooks immediately (shelf view only)
            if (demoData?.demoMode) {
                const all = [DEMO_MATH_NOTEBOOK, DEMO_SCIENCE_NOTEBOOK];
                const filter = demoData.shelfNotebooks;
                const list = filter?.length
                    ? all.filter(nb => filter.includes(nb.subject as 'math' | 'science'))
                    : all;
                setNotebooks(list);
                setLoading(false);
                return;
            }

            const { data: { user } } = await (supabase as any).auth.getUser();
            if (!user) {
                toast.error(language === 'es' ? 'Debes iniciar sesión' : 'You must be logged in');
                return;
            }

            const { data, error } = await (supabase as any)
                .rpc('get_student_notebooks', { student_uuid: user.id });

            if (error) throw error;

            let filteredData = showArchived
                ? data
                : data?.filter((nb: Notebook) => !nb.is_archived) || [];

            setNotebooks(filteredData || []);
        } catch (error) {
            console.error('Error loading notebooks:', error);
            // In demo mode, show demo notebook even on error
            if (demoData?.demoMode) {
                const all = [DEMO_MATH_NOTEBOOK, DEMO_SCIENCE_NOTEBOOK];
                const filter = demoData.shelfNotebooks;
                setNotebooks(filter?.length ? all.filter(nb => filter.includes(nb.subject as 'math' | 'science')) : all);
            } else {
                toast.error(language === 'es' ? 'Error al cargar cuadernos' : 'Error loading notebooks');
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredNotebooks = notebooks.filter(notebook => {
        const matchesSearch = notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            notebook.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = selectedSubject === 'all' || notebook.subject === selectedSubject;
        return matchesSearch && matchesSubject;
    });

    const handleCreateNotebook = async (notebookData: Partial<Notebook>) => {
        try {
            const { data: { user } } = await (supabase as any).auth.getUser();
            if (!user) {
                toast.error(language === 'es' ? 'Debes iniciar sesión para crear cuadernos' : 'You must be logged in to create notebooks');
                return;
            }

            const { error } = await (supabase as any)
                .from('notebooks')
                .insert({
                    student_id: user.id,
                    ...notebookData
                });

            if (error) throw error;

            toast.success(language === 'es' ? '¡Cuaderno creado!' : 'Notebook created!');
            loadNotebooks();
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error creating notebook:', error);
            toast.error(language === 'es' ? 'Error al crear cuaderno' : 'Error creating notebook');
        }
    };

    if (selectedNotebook) {
        return (
            <NotebookViewer
                notebook={selectedNotebook}
                onClose={() => setSelectedNotebook(null)}
                language={language}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden font-nunito selection:bg-indigo-500/30">
            {/* 🌌 DYNAMIC COSMIC BACKGROUND */}
            <div className="absolute inset-0 bg-[#020617]" />

            {/* Moving Nebula Blobs - static in demo to avoid mobile flicker */}
            <motion.div
                animate={demoData?.demoMode ? { scale: 1, x: 0, y: 0, opacity: 0.12 } : { scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0], opacity: [0.1, 0.2, 0.1] }}
                transition={demoData?.demoMode ? {} : { duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-purple-600 blur-[150px] rounded-full pointer-events-none"
            />
            <motion.div
                animate={demoData?.demoMode ? { scale: 1.1, x: 0, y: 0, opacity: 0.1 } : { scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, -60, 0], opacity: [0.1, 0.15, 0.1] }}
                transition={demoData?.demoMode ? {} : { duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-10%] right-[-5%] w-[70%] h-[70%] bg-indigo-500 blur-[150px] rounded-full pointer-events-none"
            />
            <motion.div
                animate={demoData?.demoMode ? { opacity: 0.07, scale: 1 } : { opacity: [0.05, 0.1, 0.05], scale: [1, 1.1, 1] }}
                transition={demoData?.demoMode ? {} : { duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-cyan-500 blur-[120px] rounded-full pointer-events-none"
            />

            {/* Twinkling Stars Layer - stable positions to avoid flicker */}
            <div className="absolute inset-0 pointer-events-none">
                {starPositions.map((pos, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                        animate={demoData?.demoMode ? { opacity: 0.5, scale: 1 } : { opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
                        transition={demoData?.demoMode ? {} : { duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.1 }}
                    />
                ))}
            </div>

            {/* Grid Overlay with Perspective */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:100px_100px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Header */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-7xl mx-auto mb-12 relative z-20 px-8 pt-12"
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
                    <div className="flex items-center gap-6">
                        <motion.div
                            animate={demoData?.demoMode ? { rotate: 0 } : { rotate: [0, 5, -5, 0] }}
                            transition={demoData?.demoMode ? {} : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.5)] border border-white/30 relative"
                        >
                            <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse" />
                            <Book className="w-10 h-10 text-white relative z-10" />
                        </motion.div>
                        <div>
                            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-200 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] tracking-tighter uppercase mb-1">
                                {language === 'es' ? '🚀 Archivo Estelar' : '🚀 Stellar Archive'}
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="h-0.5 w-12 bg-indigo-500 rounded-full" />
                                <p className="text-indigo-400 font-black tracking-widest text-sm uppercase">
                                    {language === 'es'
                                        ? `${filteredNotebooks.length} Núcleos de Memoria`
                                        : `${filteredNotebooks.length} Memory Cores`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {onClose && (
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="px-8 py-3 bg-white/5 backdrop-blur-xl text-white rounded-2xl border border-white/20 transition-all font-black tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                            >
                                {language === 'es' ? 'Desconectar' : 'Disconnect'}
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Search and Portals (Filters) */}
                <div className="flex flex-col lg:flex-row gap-6 items-center">
                    {/* Search Bar (Futuristic) */}
                    <div className="w-full lg:w-1/3 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition duration-500" />
                        <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 px-4">
                            <Search className="w-5 h-5 text-indigo-400" />
                            <input
                                type="text"
                                placeholder={language === 'es' ? 'Escanear archivos...' : 'Scan archives...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-3 pr-4 py-4 bg-transparent text-white placeholder:text-slate-500 focus:outline-none font-bold"
                            />
                            <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-indigo-500 rounded-full animate-ping" />
                                <span className="text-[10px] text-indigo-400 font-black tracking-widest">LIVE</span>
                            </div>
                        </div>
                    </div>

                    {/* Subject Portals */}
                    <div className="flex-1 flex gap-3 overflow-x-auto pb-4 scrollbar-hide w-full">
                        {subjects.map((subject) => (
                            <motion.button
                                key={subject.id}
                                whileHover={{ y: -5, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedSubject(subject.id)}
                                className={`px-5 py-3 rounded-2xl font-black text-xs tracking-widest uppercase whitespace-nowrap transition-all flex items-center gap-2 border ${selectedSubject === subject.id
                                    ? 'bg-white text-indigo-950 border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:text-white'
                                    }`}
                            >
                                <span className="text-xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{subject.emoji}</span>
                                {subject.label}
                            </motion.button>
                        ))}
                    </div>

                    {/* Archive Access */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowArchived(!showArchived)}
                        className={`p-3 rounded-2xl border transition-all ${showArchived
                            ? 'bg-amber-500 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-amber-500/50 hover:text-amber-400'
                            }`}
                    >
                        <Archive className="w-6 h-6" />
                    </motion.button>
                </div>
            </motion.div>

            {/* Notebooks Bookshelf */}
            <div className="max-w-7xl mx-auto pb-32">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-96 gap-6">
                        <div className="relative w-24 h-24">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-t-4 border-r-4 border-indigo-500 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 border-b-4 border-l-4 border-purple-500 rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-white animate-pulse" />
                            </div>
                        </div>
                        <p className="text-indigo-300 font-black tracking-widest text-sm animate-pulse">SYNCHRONIZING LIBRARY...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-24 mt-16">
                        {(() => {
                            const shelfSize = 4;
                            const allItems = filteredNotebooks;

                            const shelves = [];
                            for (let i = 0; i < allItems.length; i += shelfSize) {
                                shelves.push(allItems.slice(i, i + shelfSize));
                            }

                            if (allItems.length === 0) {
                                return (
                                    <div className="flex flex-col items-center justify-center h-64 text-center px-10">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                            <Archive className="w-10 h-10 text-slate-600" />
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">No data clusters found</h3>
                                        <p className="text-slate-500 font-bold">Scanning empty sectors... Ready for new entries.</p>
                                    </div>
                                );
                            }

                            return shelves.map((shelfItems, shelfIndex) => (
                                <div key={`shelf-${shelfIndex}`} className="relative group/shelf">
                                    {/* Sub-Shelf Ambient Light */}
                                    <div className="absolute inset-x-0 -top-20 h-40 bg-indigo-500/5 blur-[100px] pointer-events-none opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-1000" />

                                    {/* Shelf Content */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-8 relative z-10 items-end min-h-[320px]">
                                        {shelfItems.map((item, index) => (
                                            <NotebookCover
                                                key={item.id}
                                                notebook={item}
                                                onClick={() => setSelectedNotebook(item)}
                                                index={index + shelfIndex * shelfSize}
                                                language={language}
                                                demoMode={!!demoData?.demoMode}
                                            />
                                        ))}
                                    </div>

                                    {/* THE HOLOGRAPHIC ENERGY SHELF */}
                                    <div className="absolute -bottom-8 left-0 right-0 h-6 z-0 px-4">
                                        {/* Physical Base (Very faint) */}
                                        <div className="absolute inset-x-4 inset-y-0 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]" />

                                        {/* Energy Beam Line */}
                                        <motion.div
                                            animate={{ opacity: [1, 0.5, 1], scaleX: [1, 0.98, 1] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                            className="absolute inset-x-10 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                                        />

                                        {/* Scanning Pulse */}
                                        <motion.div
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                            className="absolute top-0 w-24 h-[2px] bg-white blur-sm opacity-30"
                                        />

                                        {/* Light Source (Glowing points) */}
                                        <div className="absolute -bottom-2 left-10 w-2 h-2 bg-indigo-500 rounded-full blur-[2px] animate-pulse" />
                                        <div className="absolute -bottom-2 right-10 w-2 h-2 bg-indigo-500 rounded-full blur-[2px] animate-pulse" />
                                    </div>

                                    {/* Float Particles near shelf */}
                                    <div className="absolute -bottom-12 left-1/4 w-1 h-1 bg-white rounded-full animate-ping opacity-20" />
                                    <div className="absolute -bottom-16 right-1/3 w-1 h-1 bg-white rounded-full animate-ping opacity-20 delay-500" />

                                    {/* Decorative Holograms */}
                                    {shelfIndex === 0 && (
                                        <motion.div
                                            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute -top-16 right-12 text-6xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] hidden lg:block select-none opacity-80"
                                        >
                                            🪐
                                        </motion.div>
                                    )}
                                    {shelfIndex === 1 && (
                                        <motion.div
                                            animate={{ y: [0, 10, 0], scale: [1, 1.1, 1] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute -top-20 left-16 text-6xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] hidden lg:block select-none opacity-80"
                                        >
                                            ✨
                                        </motion.div>
                                    )}
                                </div>
                            ));
                        })()}
                    </div>
                )}
            </div>

            {/* Bottom Creation Options */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto pb-24 px-6 relative z-20"
            >
                <div className="w-full h-px bg-white/10 mb-12 shadow-[0_1px_0_rgba(255,255,255,0.05)]" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* NEW NOTEBOOK BUTTON */}
                    <motion.button
                        onClick={() => setShowCreateModal(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative flex items-center gap-4 bg-slate-800/50 hover:bg-slate-700/80 p-4 rounded-2xl border-2 border-white/10 hover:border-amber-400/50 transition-all duration-300 shadow-xl backdrop-blur-md"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-amber-500/40 transition-all duration-300">
                            <Plus className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-amber-400 font-black text-xl tracking-tight mb-1">
                                {language === 'es' ? 'NUEVO GABINETE' : 'NEW CABINET'}
                            </span>
                            <span className="text-white/60 text-xs font-bold uppercase tracking-wider text-left">
                                {language === 'es' ? 'Organiza otra materia' : 'Organize another subject'}
                            </span>
                        </div>
                    </motion.button>

                    {/* MAGIC SCAN BUTTON */}
                    <motion.button
                        onClick={() => setShowScanModal(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative flex items-center gap-4 bg-indigo-900/50 hover:bg-indigo-800/80 p-4 rounded-2xl border-2 border-white/10 hover:border-indigo-400/50 transition-all duration-300 shadow-xl backdrop-blur-md"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/40 transition-all duration-300">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-indigo-300 font-black text-xl tracking-tight mb-1">
                                {language === 'es' ? 'ESCANEAR APUNTE' : 'SCAN NOTES'}
                            </span>
                            <span className="text-white/60 text-xs font-bold uppercase tracking-wider text-left">
                                {language === 'es' ? 'Sube fotos de tu cuaderno' : 'Upload photos of your notebook'}
                            </span>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[10px] font-black px-2 py-1 rounded-md rotate-12 shadow-lg opacity-100 animate-pulse">
                            AI POWERED
                        </div>
                    </motion.button>
                </div>

                <div className="flex flex-col items-center gap-4 mt-12">
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-indigo-300 text-xs font-black uppercase tracking-widest">
                            {language === 'es' ? 'Sistema Automatizado Activo' : 'Automated System Active'}
                        </span>
                    </div>
                    <p className="text-white/40 text-sm font-medium italic text-center max-w-lg leading-relaxed px-6">
                        {language === 'es'
                            ? '“Tus cuadernos se llenan mágicamente mientras investigas y guardas tus descubrimientos con Nova”'
                            : '"Your notebooks are magically populated as you research and save your discoveries with Nova"'}
                    </p>
                </div>
            </motion.div>

            {/* Create Notebook Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateNotebookModal
                        onClose={() => setShowCreateModal(false)}
                        onCreate={handleCreateNotebook}
                        language={language}
                    />
                )}
            </AnimatePresence>

            {/* Scan Notebook Modal */}
            <AnimatePresence>
                {showScanModal && (
                    <ScanNotebookModal
                        onClose={() => setShowScanModal(false)}
                        onScanComplete={() => {
                            toast.success(language === 'es' ? 'Imagen procesada y guardada' : 'Image processed and saved');
                            // Optionally reload notebooks if counts changed? Usually note counts are dynamic or fetched on view.
                            loadNotebooks();
                        }}
                        language={language}
                    />
                )}
            </AnimatePresence>
        </div >
    );
};
