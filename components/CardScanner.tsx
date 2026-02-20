
import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Sparkles, X, Minimize2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFlashcardsFromImage } from '../services/ai_service';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface CardScannerProps {
    onCardsGenerated: (cards: any[]) => void;
    onClose: () => void;
    language: 'es' | 'en';
}

export const CardScanner: React.FC<CardScannerProps> = ({ onCardsGenerated, onClose, language }) => {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const webcamRef = useRef<Webcam>(null);

    const handleCapture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
        }
    }, [webcamRef]);

    const compressImage = (base64Str: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1024;
                const MAX_HEIGHT = 1024;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
        });
    };

    const handleAnalyze = async () => {
        if (!capturedImage) return;
        setIsAnalyzing(true);
        try {
            const compressed = await compressImage(capturedImage);
            const cards = await generateFlashcardsFromImage(compressed, language);
            if (cards && cards.length > 0) {
                onCardsGenerated(cards);
                onClose();
            } else {
                toast.error(language === 'es' ? "No pudimos detectar conceptos claros. ¡Prueba otra vez!" : "We couldn't detect clear concepts. Try again!");
            }
        } catch (error) {
            toast.error(language === 'es' ? "Error al procesar la imagen." : "Error processing image.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
        >
            <div className="relative w-full max-w-2xl bg-slate-900 rounded-[2.5rem] border border-white/20 shadow-[0_0_100px_rgba(34,211,238,0.2)] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Camera className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-white font-black tracking-tight text-xl">
                                {language === 'es' ? "Escáner Místico" : "Mystic Scanner"}
                            </h2>
                            <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                IA Vision Active
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    {!capturedImage ? (
                        <div className="space-y-6">
                            <div className="relative rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl aspect-video bg-black flex items-center justify-center">
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{ facingMode: "user" }}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 border-[20px] border-slate-900/40 pointer-events-none" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-cyan-400/50 rounded-3xl pointer-events-none animate-pulse" />
                            </div>

                            <div className="text-center space-y-4">
                                <p className="text-indigo-200 text-sm font-medium">
                                    {language === 'es' ? "Apunta a un libro, cuaderno o dibujo para crear magia." : "Point at a book, notebook, or drawing to create magic."}
                                </p>
                                <Button
                                    onClick={handleCapture}
                                    className="w-full h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-xl font-black text-white shadow-xl shadow-cyan-500/20 active:scale-95 transition-all"
                                >
                                    <Camera className="mr-2 w-6 h-6" /> {language === 'es' ? "CAPTURAR" : "CAPTURE"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="relative rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl aspect-video">
                                <img src={capturedImage} className="w-full h-full object-cover" alt="Capture" />
                                {isAnalyzing && (
                                    <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center text-white gap-4">
                                        <div className="relative">
                                            <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin" />
                                            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                                        </div>
                                        <p className="font-black tracking-widest uppercase text-sm animate-pulse">Procesando Pergamino...</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setCapturedImage(null)}
                                    disabled={isAnalyzing}
                                    className="h-14 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-2xl"
                                >
                                    <RefreshCw className="mr-2 w-4 h-4" /> {language === 'es' ? "REPETIR" : "RETAKE"}
                                </Button>
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl"
                                >
                                    <Sparkles className="mr-2 w-5 h-5" /> {language === 'es' ? "TRANSMUTAR" : "TRANSMUTE"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Decoration Footer */}
                <div className="px-8 pb-6 text-center text-[10px] text-white/20 font-mono tracking-widest">
                    SYSTEM-VISION-UNIT-01 // COGNITIVE SCANNER READY
                </div>
            </div>
        </motion.div>
    );
};
