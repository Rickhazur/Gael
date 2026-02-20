import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generateStudyPlan } from '@/services/ai_service';
import { Loader2, Sparkles, Highlighter, Brain, ChevronLeft, CheckCircle, XCircle } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { sfx } from '@/services/soundEffects';
import confetti from 'canvas-confetti';

export interface NoteData {
    topic: string;
    date: string;
    summary: string;
    boardImage?: string | null;
    subject?: 'math' | 'english' | 'science' | 'art';
    highlights?: string[];
}

interface UniversalNotebookProps {
    isOpen: boolean;
    onClose: () => void;
    language: 'es' | 'en';
    getNoteData: () => NoteData;
    onStudy: (data: NoteData) => void;
    onSave?: (data: NoteData) => void;
}

interface StudyPlan {
    summary_points: string[];
    eval_questions: {
        question: string;
        options: string[];
        correct_index: number;
        explanation: string;
    }[];
    fun_fact: string;
}

export function UniversalNotebook({
    isOpen,
    onClose,
    language,
    getNoteData,
    onStudy,
    onSave
}: UniversalNotebookProps) {
    const { addCoins, addXP } = useGamification();
    const [step, setStep] = useState(0);
    const [mode, setMode] = useState<'read' | 'study'>('read');
    const [data, setData] = useState<NoteData | null>(null);
    const [highlights, setHighlights] = useState<string[]>([]);
    const [isHighlighting, setIsHighlighting] = useState(false);

    // Study Mode State
    const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
    const [isLoadingPlan, setIsLoadingPlan] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const notebookRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setMode('read');
            setStudyPlan(null);
            setTimeout(() => {
                const noteData = getNoteData();
                setData(noteData);
                setHighlights(noteData.highlights || []);
                setStep(1);
            }, 1000);
        }
    }, [isOpen]);

    const handleDownload = async () => {
        if (!notebookRef.current) return;

        try {
            const canvas = await html2canvas(notebookRef.current, {
                scale: 2,
                backgroundColor: '#fffef0'
            });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${data?.topic || 'Nova_Note'}.pdf`);

            toast.success(language === 'es' ? "¡PDF descargado! Listo para Classroom." : "PDF Downloaded! Ready for Classroom.");
        } catch (e) {
            console.error(e);
            toast.error("Error creating PDF");
        }
    };

    const handleSave = async () => {
        if (!data) return;
        setIsSaving(true);
        try {
            if (onSave) {
                await onSave({ ...data, highlights });
            }
            toast.success(language === 'es' ? "¡Apunte guardado en tu Cuaderno Mágico!" : "Note saved to your Magic Notebook!");
            onClose();
        } catch (error) {
            console.error("Save failed:", error);
            toast.error(language === 'es' ? "No se pudo guardar el apunte" : "Could not save the note");
        } finally {
            setIsSaving(false);
        }
    };

    const handleTextSelection = () => {
        if (!isHighlighting) return;
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;

        const text = selection.toString().trim();
        if (text.length > 0 && !highlights.includes(text)) {
            setHighlights([...highlights, text]);
            // Clear selection
            selection.removeAllRanges();
        }
    };

    const toggleHighlight = (text: string) => {
        // Toggle highlight removal if clicked directly? 
        // For now, let's just allow adding via selection.
        if (highlights.includes(text)) {
            setHighlights(highlights.filter(h => h !== text));
        }
    };

    const renderTextWithHighlights = (text: string) => {
        if (!highlights.length) return text;
        // Simple highlighter matching (case sensitive check)
        const parts = text.split(new RegExp(`(${highlights.map(h => h.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`, 'g'));

        return parts.map((part, i) =>
            highlights.includes(part) ? (
                <mark key={i}
                    className="bg-yellow-200 cursor-pointer hover:bg-red-200 transition-colors rounded px-1"
                    onClick={() => isHighlighting && toggleHighlight(part)}
                    title={language === 'es' ? "Clic para borrar" : "Click to remove"}
                >
                    {part}
                </mark>
            ) : part
        );
    };

    const startStudySession = async () => {
        setMode('study');
        if (!studyPlan && data?.summary) {
            setIsLoadingPlan(true);
            try {
                const plan = await generateStudyPlan(data.summary, language);
                setStudyPlan(plan);
                setCurrentQuestionIndex(0);
                setSelectedAnswer(null);
                setShowExplanation(false);
            } catch (error) {
                toast.error("Failed to generate study plan");
                setMode('read');
            } finally {
                setIsLoadingPlan(false);
            }
        }
    };

    const handleAnswer = (index: number) => {
        if (showExplanation) return;
        setSelectedAnswer(index);
        setShowExplanation(true);
    };

    const nextQuestion = () => {
        if (studyPlan && currentQuestionIndex < studyPlan.eval_questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            // Finished
            toast.success(language === 'es' ? "¡Repaso completado!" : "Review completed!");

            // Gamification Rewards
            addCoins(30, "Smart Student Bonus");
            addXP(50);
            sfx.playSuccess();
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });

            setMode('read');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.9, rotate: 2 }}
                    className="bg-[#fffef0] rounded-[4px] w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl relative min-h-[600px]"
                    style={{
                        boxShadow: '10px 10px 20px rgba(0,0,0,0.3)',
                        borderLeft: '14px solid #ef4444'
                    }}
                >
                    {/* Spiral Binding Effect */}
                    <div className="absolute top-0 left-[-20px] bottom-0 w-8 flex flex-col gap-4 py-4 z-20" data-html2canvas-ignore>
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-12 h-4 bg-zinc-300 rounded-full shadow-inner transform -rotate-12 border border-zinc-400" />
                        ))}
                    </div>

                    {step === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-center space-y-6 flex-1">
                            <div className="w-20 h-20 relative animate-bounce">
                                <div className="text-6xl">✏️</div>
                            </div>
                            <h3 className="text-2xl font-handwriting font-bold text-slate-800 rotate-1">
                                {language === 'es' ? 'Preparando tu cuaderno...' : 'Preparing your notebook...'}
                            </h3>
                        </div>
                    ) : mode === 'read' ? (
                        <>
                            {/* WRAPPER FOR PDF CAPTURE */}
                            <div ref={notebookRef} className="bg-[#fffef0] flex flex-col flex-1">
                                {/* Notify Header */}
                                <div className="p-6 border-b-2 border-slate-200/50 flex items-center justify-between bg-[linear-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:100%_2rem]">
                                    <div>
                                        <h3 className="text-3xl font-handwriting text-indigo-900 leading-none">
                                            {data?.topic}
                                        </h3>
                                        <p className="text-sm font-mono text-slate-500 mt-1">
                                            {data?.date}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setIsHighlighting(!isHighlighting)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transform transition-transform ${isHighlighting ? 'bg-yellow-300 scale-110 ring-2 ring-yellow-500' : 'bg-white hover:bg-yellow-100'}`}
                                            title={language === 'es' ? "Subrayador" : "Highlighter"}
                                            data-html2canvas-ignore
                                        >
                                            <Highlighter className={`w-5 h-5 ${isHighlighting ? 'text-yellow-800' : 'text-slate-400'}`} />
                                        </button>
                                        <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center shadow-md transform rotate-12 border-2 border-yellow-400">
                                            <span className="text-2xl font-black text-yellow-600">A+</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notebook Body */}
                                <div
                                    className={`p-6 overflow-y-auto max-h-[60vh] space-y-6 bg-[linear-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:100%_1.5rem] relative min-h-[400px] ${isHighlighting ? 'cursor-text selection:bg-yellow-200 selection:text-black' : ''}`}
                                    onMouseUp={handleTextSelection}
                                >

                                    {data?.boardImage && (
                                        <div className="bg-white p-2 shadow-lg transform -rotate-2 border border-slate-200 w-3/4 mx-auto relative mb-6">
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-yellow-200/50 transform rotate-1"></div>
                                            <img src={data.boardImage} className="w-full h-auto grayscale-[20%] contrast-125" alt="Board" />
                                        </div>
                                    )}

                                    <div className="font-handwriting text-xl text-slate-700 leading-[1.5rem] px-2" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
                                        <p className="font-bold text-indigo-600 mb-2">
                                            {language === 'es' ? 'Lo que aprendí hoy:' : 'What I learned today:'}
                                        </p>
                                        {data?.summary ? data.summary.split('\n').map((line, i) => (
                                            <p key={i} className="mb-4 whitespace-pre-wrap">{renderTextWithHighlights(line)}</p>
                                        )) : (
                                            <p className="italic text-slate-400">...</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer - HIDDEN FROM PDF */}
                            <div className="p-4 bg-[#f8f8f0] border-t-2 border-slate-200 border-dashed flex gap-3 z-10 relative" data-html2canvas-ignore>
                                <Button variant="ghost" className="text-slate-500 font-handwriting text-lg hover:bg-red-50 hover:text-red-500" onClick={onClose}>
                                    🗑️ {language === 'es' ? 'Cerrar' : 'Close'}
                                </Button>

                                <div className="flex-1 flex gap-2 justify-end">
                                    <Button
                                        onClick={handleDownload}
                                        className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-handwriting text-lg border border-amber-300 shadow-sm"
                                    >
                                        📥 {language === 'es' ? 'Descargar' : 'PDF'}
                                    </Button>
                                    <Button
                                        onClick={startStudySession}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-handwriting text-lg border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 shadow-sm flex items-center gap-2"
                                    >
                                        <Brain className="w-5 h-5" />
                                        {language === 'es' ? 'Estudiar con Nova' : 'Study with Nova'}
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-handwriting text-lg shadow-md border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 min-w-[120px]"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                        ) : (
                                            <>💾 {language === 'es' ? 'Guardar' : 'Save'}</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // STUDY MODE
                        <div className="flex flex-col h-full bg-indigo-50">
                            {/* Header */}
                            <div className="p-4 bg-white border-b-2 border-indigo-100 flex items-center justify-between">
                                <Button variant="ghost" size="sm" onClick={() => setMode('read')} className="text-indigo-600 font-bold">
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    {language === 'es' ? 'Volver al cuaderno' : 'Back to notebook'}
                                </Button>
                                <div className="flex items-center gap-2 text-indigo-900 font-black font-fredoka">
                                    <Brain className="w-5 h-5 text-indigo-500" />
                                    <span>{language === 'es' ? 'Modo Evaluación' : 'Evaluation Mode'}</span>
                                </div>
                                <div className="w-8" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                                {isLoadingPlan ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                                        <p className="text-indigo-600 font-handwriting text-xl animate-pulse">
                                            {language === 'es' ? 'Nova está leyendo tus notas...' : 'Nova is reading your notes...'}
                                        </p>
                                    </div>
                                ) : studyPlan ? (
                                    <div className="w-full max-w-lg space-y-6">
                                        {/* Progress */}
                                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-indigo-500 h-full transition-all duration-500"
                                                style={{ width: `${((currentQuestionIndex + 1) / studyPlan.eval_questions.length) * 100}%` }}
                                            />
                                        </div>

                                        {/* Question Card */}
                                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-indigo-100">
                                            <div className="bg-indigo-600 p-6 text-white text-center relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                                <h3 className="text-xl font-bold relative z-10">
                                                    {language === 'es' ? `Pregunta ${currentQuestionIndex + 1}` : `Question ${currentQuestionIndex + 1}`}
                                                </h3>
                                                <p className="mt-2 text-lg font-medium opacity-90 relative z-10">
                                                    {studyPlan.eval_questions[currentQuestionIndex].question}
                                                </p>
                                            </div>

                                            <div className="p-6 space-y-3">
                                                {studyPlan.eval_questions[currentQuestionIndex].options.map((option, idx) => {
                                                    let stateClass = "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50";
                                                    const isSelected = selectedAnswer === idx;
                                                    const isCorrect = idx === studyPlan.eval_questions[currentQuestionIndex].correct_index;

                                                    if (showExplanation) {
                                                        if (isCorrect) stateClass = "bg-green-100 border-green-500 text-green-900";
                                                        else if (isSelected && !isCorrect) stateClass = "bg-red-50 border-red-300 opacity-60";
                                                        else stateClass = "border-slate-100 opacity-50";
                                                    } else if (isSelected) {
                                                        stateClass = "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200";
                                                    }

                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => !showExplanation && handleAnswer(idx)}
                                                            className={`w-full p-4 text-left rounded-xl border-2 transition-all font-medium flex items-center justify-between group ${stateClass}`}
                                                            disabled={showExplanation}
                                                        >
                                                            <span>{option}</span>
                                                            {showExplanation && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                                                            {showExplanation && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {showExplanation && (
                                                <div className="bg-indigo-50 p-4 border-t border-indigo-100 animate-in slide-in-from-bottom-2 fade-in">
                                                    <p className="text-sm text-indigo-800 font-medium">
                                                        💡 {studyPlan.eval_questions[currentQuestionIndex].explanation}
                                                    </p>
                                                    <Button onClick={nextQuestion} className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white">
                                                        {currentQuestionIndex < studyPlan.eval_questions.length - 1
                                                            ? (language === 'es' ? 'Siguiente Pregunta' : 'Next Question')
                                                            : (language === 'es' ? 'Terminar Repaso' : 'Finish Review')}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Summary / Tip */}
                                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex gap-3 items-start">
                                            <Sparkles className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                                            <div>
                                                <h4 className="font-bold text-yellow-800 text-sm uppercase tracking-wide">
                                                    {language === 'es' ? 'Recuerda:' : 'Remember:'}
                                                </h4>
                                                <p className="text-yellow-900 text-sm mt-1">
                                                    {studyPlan.summary_points[currentQuestionIndex % studyPlan.summary_points.length]}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-8 text-slate-500">
                                        {language === 'es' ? 'No pudimos generar un plan de estudio.' : 'Could not generate study plan.'}
                                        <Button onClick={() => setMode('read')} variant="link">
                                            {language === 'es' ? 'Volver' : 'Go back'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
