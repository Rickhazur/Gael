import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/services/supabase';
import { toast } from 'sonner';
import { VirtualBook } from './VirtualBook';
import { Loader2, ArrowLeft, Star, FileText, Calendar } from 'lucide-react';
import { UniversalNotebook } from './UniversalNotebook';

interface Notebook {
    id: string;
    title: string;
    subject: string;
    color: string;
    cover_emoji: string;
    description: string;
}

interface Note {
    id: string;
    topic: string;
    date: string;
    subject: 'math' | 'english' | 'science' | 'art';
    summary: string;
    created_at: string;
    board_image?: string; // Standardize casing
    boardImage?: string;
    highlights?: string[];
}

interface NotebookViewerProps {
    notebook: Notebook;
    onClose: () => void;
    language: 'es' | 'en';
}

export const NotebookViewer: React.FC<NotebookViewerProps> = ({ notebook, onClose, language }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    useEffect(() => {
        loadNotes();
    }, [notebook.id]);

    const loadNotes = async () => {
        if (notebook.id === 'demo-science-notebook') {
            setNotes([
                {
                    id: 'note-sci-1',
                    topic: 'El Ciclo del Agua',
                    date: new Date().toISOString(),
                    subject: 'science',
                    summary: 'Investigación sobre el ciclo del agua.\n\nDescubrí que el agua circula entre la tierra, los océanos y la atmósfera.\n\n1. Evaporación: el sol calienta el agua.\n2. Condensación: se forman las nubes.\n3. Precipitación: llueve o nieva.\n4. Infiltración: el agua vuelve a la tierra.\n\n¡La investigación me ayudó a entenderlo mejor!',
                    created_at: new Date().toISOString(),
                    highlights: ['Investigación completada']
                }
            ]);
            setLoading(false);
            return;
        }
        if (notebook.id === 'demo-math-notebook') {
            setNotes([
                {
                    id: 'note-1',
                    topic: 'Suma de Fracciones',
                    date: new Date().toISOString(),
                    subject: 'math',
                    summary: 'Hoy aprendimos con el Tutor Lina sobre las fracciones.\n\nPara sumar 1/2 + 1/4:\n1. Buscar denominador común (4).\n2. 1/2 es igual a 2/4.\n3. 2/4 + 1/4 = 3/4.\n\n¡Es muy fácil cuando usas pizzas para visualizarlo!',
                    created_at: new Date().toISOString(),
                    highlights: ['Excelente razonamiento']
                },
                {
                    id: 'note-2',
                    topic: 'Multiplicación por 10, 100, 1000',
                    date: new Date().toISOString(),
                    subject: 'math',
                    summary: 'Regla de oro: Mover la coma hacia la derecha según cuántos ceros haya.\n\nEjemplo: 2.5 x 100 = 250\n\nMovimos la coma dos lugares. ¡Nova me ayudó a no equivocarme!',
                    created_at: new Date().toISOString()
                },
                {
                    id: 'note-3',
                    topic: 'Divisiones con Resto',
                    date: new Date().toISOString(),
                    subject: 'math',
                    summary: 'El resto es lo que sobra cuando no podemos repartir de forma exacta.\n\nSi tengo 7 manzanas y 2 amigos:\nCada uno recibe 3 y sobra 1.\n\n7 / 2 = 3 resto 1.',
                    created_at: new Date().toISOString(),
                    highlights: ['Concepto dominado']
                }
            ]);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await (supabase as any)
                .from('notes')
                .select('*')
                .eq('notebook_id', notebook.id)
                .order('created_at', { ascending: true }); // Oldest first (chronological)

            if (error) throw error;
            setNotes(data || []);
        } catch (error) {
            console.error('Error loading notes:', error);
            // toast.error(language === 'es' ? 'Error al cargar notas' : 'Error loading notes');
        } finally {
            setLoading(false);
        }
    };

    // --- PAGE GENERATION ---
    const generatePages = () => {
        const pages: { front: React.ReactNode; back: React.ReactNode }[] = [];

        // 1. COVER SHEET
        // Front: The Cover Art
        // Back: The Title Page / Index
        pages.push({
            front: (
                <div
                    className="w-full h-full flex flex-col items-center justify-center p-8 border-[16px] relative overflow-hidden"
                    style={{
                        backgroundColor: notebook.color,
                        borderColor: 'rgba(0,0,0,0.2)',
                        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3)'
                    }}
                >
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-40 mix-blend-multiply" />

                    <div className="bg-white/20 backdrop-blur-sm p-8 rounded-full border-4 border-white/30 shadow-2xl relative z-10 mb-4 transform rotate-[-5deg]">
                        <span className="text-[6rem] drop-shadow-md">{notebook.cover_emoji}</span>
                    </div>

                    <div className="bg-white px-8 py-4 shadow-[0_10px_20px_rgba(0,0,0,0.2)] transform rotate-2 relative z-10 max-w-full">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 text-center font-handwriting uppercase tracking-widest leading-none">
                            {notebook.title}
                        </h1>
                    </div>

                    <div className="absolute bottom-12 text-white/80 font-bold font-mono text-sm uppercase tracking-[0.2em] relative z-10">
                        Nova Schola Library
                    </div>
                </div>
            ),
            back: (
                <div className="w-full h-full p-8 md:p-12 bg-[#fdfdf0] flex flex-col relative">
                    <div className="absolute inset-4 border-2 border-slate-300 border-dashed rounded-lg opacity-50 pointer-events-none" />

                    <h2 className="text-3xl font-handwriting font-bold text-slate-800 text-center mb-2 mt-4">
                        {language === 'es' ? 'Este cuaderno pertenece a:' : 'This notebook belongs to:'}
                    </h2>
                    <div className="border-b-2 border-slate-800 w-3/4 mx-auto mb-12" />

                    <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                        <h3 className="font-bold text-indigo-600 uppercase tracking-widest text-sm mb-4 border-b border-indigo-100 pb-2">
                            {language === 'es' ? 'Índice de Contenidos' : 'Table of Contents'}
                        </h3>
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
                        ) : (
                            <ul className="space-y-3">
                                {notes.map((note, i) => (
                                    <li key={note.id} className="flex items-baseline justify-between text-sm group cursor-pointer hover:bg-slate-100 p-1 rounded">
                                        <span className="font-handwriting font-bold text-slate-700 truncate mr-2 group-hover:text-indigo-600">
                                            {i + 1}. {note.topic}
                                        </span>
                                        <span className="text-slate-400 font-mono text-xs flex-shrink-0">
                                            {new Date(note.created_at).toLocaleDateString()}
                                        </span>
                                    </li>
                                ))}
                                {notes.length === 0 && (
                                    <li className="text-slate-400 italic text-sm text-center py-4">
                                        {language === 'es' ? '(Vacío)' : '(Empty)'}
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            )
        });

        // 2. CONTENT SHEETS
        // Determine number of sheets needed (Math.ceil(notes.length / 2))
        // We map notes to pages. 
        // Note 0 -> Side A (Front of Sheet 1)
        // Note 1 -> Side B (Back of Sheet 1)

        const noteCount = notes.length;
        // If 0 notes, add blanks? No need.

        for (let i = 0; i < noteCount; i += 2) {
            const noteA = notes[i];
            const noteB = notes[i + 1] || null;

            pages.push({
                front: renderNotePage(noteA, i + 1),
                back: noteB ? renderNotePage(noteB, i + 2) : renderBlankPage()
            });
        }

        // If no notes, add at least one blank sheet for feel?
        if (noteCount === 0) {
            pages.push({
                front: renderBlankPage(language === 'es' ? '¡Empieza a escribir!' : 'Start writing!'),
                back: renderBlankPage()
            });
        }

        return pages;
    };

    const renderNotePage = (note: Note, pageNum: number) => (
        <div className="w-full h-full bg-[#fdfdf0] flex flex-col relative overflow-hidden group">
            {/* Lined Paper Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px)',
                backgroundSize: '100% 1.5rem',
                marginTop: '4rem'
            }} />

            {/* Header Area */}
            <div className="h-16 border-b-2 border-red-200/50 flex items-center justify-between px-6 bg-yellow-50/30">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-red-400 font-bold text-lg">#{pageNum}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                        {new Date(note.created_at).toLocaleDateString()}
                    </span>
                </div>
                {/* Interaction Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent page flip
                        setSelectedNote(note);
                    }}
                    className="p-1.5 hover:bg-indigo-50 rounded-full text-indigo-400 hover:text-indigo-600 transition-colors"
                    title="Ver pantalla completa"
                >
                    <FileText className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 md:p-8 flex-1 overflow-hidden relative z-10 cursor-text"
                onClick={(e) => {
                    e.stopPropagation(); // Allow text selection without flipping
                    // Actually parent onClick handles flipping. We need to decide if clicking content flips or not.
                    // Let's allow clicking content to flip for now, unless selecting text.
                    // The parent <div onClick> handles it.
                    // If we stop propagation here, the page won't flip on content click.
                    // User might want to flip by clicking edge.
                    // For now, let's NOT stop propagation so page feels responsive, 
                    // but maybe add specific "Interactive Area" if needed.
                }}
            >
                <h3 className="font-handwriting text-2xl font-bold text-slate-800 mb-4 leading-tight">
                    {note.topic}
                </h3>

                {/* Note Content Preview */}
                <div className="font-handwriting text-slate-600 text-lg leading-[1.5rem]" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
                    {note.summary.split('\n').slice(0, 12).map((line, idx) => (
                        <p key={idx} className="min-h-[1.5rem] whitespace-pre-wrap">{line}</p>
                    ))}
                    {note.summary.split('\n').length > 12 && (
                        <p className="text-indigo-400 italic mt-2">... {language === 'es' ? '(continúa)' : '(more)'}</p>
                    )}
                </div>

                {/* Sticker / Stamp */}
                {note.highlights && note.highlights.length > 0 && (
                    <div className="absolute bottom-6 right-6 transform rotate-[-12deg] opacity-80 pointer-events-none">
                        <Star className="w-12 h-12 text-yellow-400 fill-yellow-200 drop-shadow-md" />
                    </div>
                )}
            </div>
        </div>
    );

    const renderBlankPage = (msg?: string) => (
        <div className="w-full h-full bg-[#fdfdf0] relative flex items-center justify-center">
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{
                backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px)',
                backgroundSize: '100% 1.5rem',
                marginTop: '4rem'
            }} />
            {msg && <p className="text-slate-300 font-handwriting text-xl -rotate-6">{msg}</p>}
        </div>
    );

    // If a note is selected for full view/study
    if (selectedNote) {
        return (
            <UniversalNotebook
                isOpen={true}
                onClose={() => setSelectedNote(null)}
                language={language}
                getNoteData={() => ({
                    ...selectedNote,
                    boardImage: selectedNote.board_image || selectedNote.boardImage // Handle snake_case from DB
                })}
                onStudy={() => { }}
            />
        );
    }

    return (
        <VirtualBook
            pages={generatePages()}
            onClose={onClose}
            bookColor={notebook.color}
        />
    );
};
