import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, X, Check, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/services/supabase';
import { notebookService } from '@/services/notebookService';
import { useGamification } from '@/context/GamificationContext';
import { sfx } from '@/services/soundEffects';

interface ScanNotebookModalProps {
    onClose: () => void;
    onScanComplete: () => void;
    language: 'es' | 'en';
}

export const ScanNotebookModal: React.FC<ScanNotebookModalProps> = ({ onClose, onScanComplete, language }) => {
    const { addCoins, addXP } = useGamification();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [step, setStep] = useState<'capture' | 'review' | 'subjects'>('capture');

    // Subject identification
    const [selectedSubject, setSelectedSubject] = useState<string>('other');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const subjects = [
        { id: 'math', label: language === 'es' ? 'Matemáticas' : 'Math', emoji: '📗', bg: 'bg-violet-100 border-violet-300 text-violet-800' },
        { id: 'english', label: 'English', emoji: '📘', bg: 'bg-blue-100 border-blue-300 text-blue-800' },
        { id: 'science', label: language === 'es' ? 'Ciencias' : 'Science', emoji: '📙', bg: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
        { id: 'history', label: language === 'es' ? 'Historia' : 'History', emoji: '📕', bg: 'bg-rose-100 border-rose-300 text-rose-800' },
        { id: 'art', label: language === 'es' ? 'Arte' : 'Art', emoji: '🎨', bg: 'bg-pink-100 border-pink-300 text-pink-800' },
        { id: 'other', label: language === 'es' ? 'Notas Varias' : 'General Notes', emoji: '📓', bg: 'bg-slate-100 border-slate-300 text-slate-800' }
    ];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setStep('review');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!imageFile) return;
        setIsUploading(true);

        try {
            // 1. Upload Image to Supabase Storage
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `notebook-scans/${fileName}`;

            const { error: uploadError } = await (supabase as any).storage
                .from('notebook-pages')
                .upload(filePath, imageFile);

            if (uploadError) {
                console.error("Storage upload error:", uploadError);
                throw new Error("Failed to upload image. Make sure 'notebook-pages' bucket exists.");
            }

            const { data: { publicUrl } } = (supabase as any).storage
                .from('notebook-pages')
                .getPublicUrl(filePath);

            // 2. Analyze with AI (Gemini Vision) - DIAGNOSTIC MODE
            let aiSummary = language === 'es' ? 'Análisis de Evaluación.' : 'Evaluation Analysis.';

            try {
                const { callGeminiSocratic } = await import('@/services/gemini');

                toast.message(language === 'es' ? '👩‍⚕️ Diagnosticando...' : '👩‍⚕️ Diagnosing...', {
                    description: language === 'es' ? 'Nova está buscando tus fortalezas y áreas de mejora...' : 'Nova is identifying strengths and areas for improvement...'
                });

                const prompt = language === 'es'
                    ? `Analiza esta imagen de una EVALUACIÓN o EXAMEN de estudiante. Tu misión es ser un DETECTIVE DE APRENDIZAJE:
                       1. Identifica qué temas se evaluaron.
                       2. Detecta los ERRORES cometidos (si los hay) y explica brevemente por qué fallaron.
                       3. Detecta las DEBILIDADES conceptuales (ej: "Falla en la resta prestando").
                       4. GENERAL UN PLAN DE ACCIÓN: Crea 3 "Mini-Misiones" o temas específicos que el estudiante debe repasar en Nova Schola para corregir estas fallas.
                       
                       Devuelve un JSON con el campo 'content': string (formateado en Markdown bonito para el estudiante).`
                    : `Analyze this student EVALUATION or EXAM image. Be a LEARNING DETECTIVE:
                       1. Identify the evaluated topics.
                       2. Detect ERRORS and explain why they happened.
                       3. specific CONCEPTUAL WEAKNESSES.
                       4. ACTION PLAN: Generate 3 "Mini-Missions" to fix these gaps.
                       
                       Return a JSON with field 'content': string.`;

                const aiResponse = await callGeminiSocratic(
                    "You are an expert diagnostic teacher.",
                    [],
                    [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: publicUrl } }
                    ],
                    language,
                    true
                );

                if (aiResponse && aiResponse.content) {
                    aiSummary = aiResponse.content;
                }

            } catch (aiError) {
                console.error("AI Analysis failed:", aiError);
                toast.error(language === 'es' ? 'Error en el diagnóstico' : 'Diagnostic failed');
            }

            // 3. Save as Diagnostic Report
            const noteTopic = language === 'es'
                ? `Diagnóstico: Evaluación de ${selectedSubject}`
                : `Diagnostic: ${selectedSubject} Evaluation`;

            await notebookService.saveNote({
                topic: noteTopic,
                date: new Date().toLocaleDateString(),
                summary: aiSummary,
                boardImage: publicUrl,
                subject: selectedSubject,
                highlights: [],
                type: 'diagnostic' // New type to distinguish from regular notes
            });

            // 4. Reward & Close
            addCoins(50, language === 'es' ? 'Diagnóstico Completado' : 'Diagnostic Complete');
            addXP(100);
            sfx.playSuccess();
            onScanComplete();
            onClose();

        } catch (error) {
            console.error('Scan process failed:', error);
            toast.error(language === 'es' ? 'Error al guardar la imagen' : 'Failed to save image');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center text-white">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Camera className="w-6 h-6" />
                            {language === 'es' ? 'Escanear Evaluación' : 'Scan Evaluation'}
                        </h3>
                        <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        {step === 'capture' && (
                            <div className="flex flex-col items-center justify-center space-y-8 py-8">
                                <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center border-4 border-indigo-100 animate-pulse">
                                    <Camera className="w-16 h-16 text-indigo-400" />
                                </div>

                                <div className="text-center space-y-2">
                                    <h4 className="font-black text-slate-800 text-lg">
                                        {language === 'es' ? 'Toma una foto de tu evaluación' : 'Take a photo of your evaluation'}
                                    </h4>
                                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                        {language === 'es'
                                            ? 'Asegúrate de que haya buena luz y el texto se lea claramente.'
                                            : 'Make sure there is good lighting and text is readable.'}
                                    </p>
                                </div>

                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Camera className="w-6 h-6" />
                                    {language === 'es' ? 'Abrir Cámara' : 'Open Camera'}
                                </button>

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-2"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    {language === 'es' ? 'Subir desde galería' : 'Upload from gallery'}
                                </button>
                            </div>
                        )}

                        {step === 'review' && imagePreview && (
                            <div className="space-y-6">
                                <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200 bg-slate-100 aspect-[3/4] max-h-[50vh]">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setImagePreview(null); setStep('capture'); }}
                                        className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        {language === 'es' ? 'Repetir' : 'Retake'}
                                    </button>
                                    <button
                                        onClick={() => setStep('subjects')}
                                        className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-5 h-5" />
                                        {language === 'es' ? 'Usar Foto' : 'Use Photo'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'subjects' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h4 className="font-black text-slate-800 text-lg mb-2">
                                        {language === 'es' ? '¿A qué cuaderno va esto?' : 'Where does this go?'}
                                    </h4>
                                    <p className="text-slate-500 text-xs">
                                        {language === 'es' ? 'Selecciona la materia correcta' : 'Select the correct subject'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto p-1">
                                    {subjects.map(subject => (
                                        <button
                                            key={subject.id}
                                            onClick={() => setSelectedSubject(subject.id)}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${selectedSubject === subject.id
                                                ? 'border-indigo-500 shadow-md transform scale-[1.02] bg-indigo-50'
                                                : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className="text-3xl">{subject.emoji}</span>
                                            <span className={`font-bold text-sm ${selectedSubject === subject.id ? 'text-indigo-700' : 'text-slate-600'}`}>
                                                {subject.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {language === 'es' ? 'Subiendo...' : 'Uploading...'}
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 text-yellow-300" />
                                            {language === 'es' ? 'Guardar en Biblioteca' : 'Save to Library'}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
