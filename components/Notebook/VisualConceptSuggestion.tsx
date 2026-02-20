import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, RefreshCw, Download, Loader2 } from 'lucide-react';
import { LinaAvatar } from '@/components/MathMaestro/tutor/LinaAvatar';
import { RachelleAvatar } from '@/components/MathMaestro/tutor/RachelleAvatar';
import { generateImage } from '@/services/ai_service';
import { toast } from 'sonner';

interface VisualConceptSuggestionProps {
    conceptName: string;
    conceptDescription: string;
    imagePrompt: string;
    tutorName: 'Lina' | 'Rachelle';
    language: 'es' | 'en';
    onAccept: (imageUrl: string) => void;
    onDismiss: () => void;
}

export const VisualConceptSuggestion: React.FC<VisualConceptSuggestionProps> = ({
    conceptName,
    conceptDescription,
    imagePrompt,
    tutorName,
    language,
    onAccept,
    onDismiss
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const messages = {
        es: {
            greeting: `¡Hola! Soy ${tutorName}`,
            suggestion: `Veo que estás estudiando sobre`,
            question: '¿Te gustaría que genere una imagen para entenderlo mejor?',
            reason: conceptDescription,
            generating: 'Generando tu imagen educativa...',
            regenerate: 'Regenerar',
            useThis: 'Usar esta imagen',
            cancel: 'No, gracias',
            success: '¡Imagen generada!',
            error: 'Error al generar imagen'
        },
        en: {
            greeting: `Hi! I'm ${tutorName}`,
            suggestion: `I see you're studying about`,
            question: 'Would you like me to generate an image to help you understand it better?',
            reason: conceptDescription,
            generating: 'Generating your educational image...',
            regenerate: 'Regenerate',
            useThis: 'Use this image',
            cancel: 'No, thanks',
            success: 'Image generated!',
            error: 'Error generating image'
        }
    };

    const msg = messages[language];

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const imageUrl = await generateImage(imagePrompt);
            setGeneratedImage(imageUrl);
            setShowPreview(true);
            toast.success(msg.success);
        } catch (error) {
            console.error('Error generating image:', error);
            toast.error(msg.error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAccept = () => {
        if (generatedImage) {
            onAccept(generatedImage);
            toast.success(language === 'es' ? '¡Imagen agregada a tu nota!' : 'Image added to your note!');
        }
    };

    const TutorAvatar = tutorName === 'Lina' ? LinaAvatar : RachelleAvatar;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="relative bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl border-2 border-indigo-200 p-6 mb-6"
            >
                {/* Close Button */}
                <button
                    onClick={onDismiss}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center transition-colors shadow-md"
                >
                    <X className="w-4 h-4 text-slate-600" />
                </button>

                <div className="flex gap-4">
                    {/* Tutor Avatar */}
                    <div className="flex-shrink-0">
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        >
                            <TutorAvatar state="thinking" size={80} />
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        {/* Greeting */}
                        <div className="mb-3">
                            <h3 className="text-lg font-black text-indigo-700 mb-1">
                                {msg.greeting} 👋
                            </h3>
                            <p className="text-slate-700">
                                {msg.suggestion} <strong className="text-indigo-600">{conceptName}</strong>.
                            </p>
                            <p className="text-sm text-slate-600 mt-1 italic">
                                💡 {msg.reason}
                            </p>
                        </div>

                        {/* Question */}
                        {!showPreview && !isGenerating && (
                            <div className="mb-4">
                                <p className="text-slate-700 font-semibold mb-3">
                                    {msg.question}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleGenerate}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        {language === 'es' ? '¡Sí, generar imagen!' : 'Yes, generate image!'}
                                    </button>
                                    <button
                                        onClick={onDismiss}
                                        className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                                    >
                                        {msg.cancel}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Generating State */}
                        {isGenerating && (
                            <div className="flex items-center gap-3 py-4">
                                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                <span className="text-slate-700 font-semibold">{msg.generating}</span>
                            </div>
                        )}

                        {/* Image Preview */}
                        {showPreview && generatedImage && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-3"
                            >
                                <div className="relative rounded-xl overflow-hidden border-4 border-indigo-200 shadow-lg">
                                    <img
                                        src={generatedImage}
                                        alt={conceptName}
                                        className="w-full h-auto"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAccept}
                                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        {msg.useThis}
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        {msg.regenerate}
                                    </button>
                                    <button
                                        onClick={onDismiss}
                                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-2 left-2 text-2xl opacity-20">✨</div>
                <div className="absolute bottom-2 right-2 text-2xl opacity-20">🎨</div>
            </motion.div>
        </AnimatePresence>
    );
};
