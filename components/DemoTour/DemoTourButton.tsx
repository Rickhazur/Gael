import React from 'react';
import { useDemoTour } from '@/context/DemoTourContext';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RachelleAvatar } from '@/components/MathMaestro/tutor/RachelleAvatar';
import { LinaAvatar } from '@/components/MathMaestro/tutor/LinaAvatar';
import { PresenterAvatar } from './PresenterAvatar';

export function DemoTourButton() {
    const { tourState, nextStep, previousStep, endTour, getCurrentStepData } = useDemoTour();
    const [isDeepVoice, setIsDeepVoice] = React.useState(false);
    const [currentVoice, setCurrentVoice] = React.useState<string | null>(null);
    const [isAvatarLoading, setIsAvatarLoading] = React.useState(false);

    React.useEffect(() => {
        const handleVoice = (e: any) => {
            const voice = e.detail?.voice || null;
            setIsDeepVoice(voice === 'onyx');
            setCurrentVoice(voice);
        };
        const handleEnd = () => {
            setIsDeepVoice(false);
            setCurrentVoice(null);
            setIsAvatarLoading(false);
        };
        const handleLoading = (e: any) => {
            setIsAvatarLoading(e.detail?.active || false);
        };

        window.addEventListener('nova-demo-voice', handleVoice);
        window.addEventListener('nova-demo-voice-end', handleEnd);
        window.addEventListener('nova-demo-voice-loading', handleLoading);
        return () => {
            window.removeEventListener('nova-demo-voice', handleVoice);
            window.removeEventListener('nova-demo-voice-end', handleEnd);
            window.removeEventListener('nova-demo-voice-loading', handleLoading);
        };
    }, []);

    if (!tourState.isActive) return null;

    const currentStep = getCurrentStepData();
    // Hide progress card during account-creation step (has its own overlay with Continuar)
    if (currentStep?.isAccountCreationStep) return null;
    const progress = (tourState.currentStep / tourState.totalSteps) * 100;

    // Show the small monitor for Lina/Rachelle/Nova (NOT for Onyx/Station - Step 7 avatar solo en pantalla NOVA)
    // Hide in Step 10 (Nova Shop) - no Miss Rachel/Lina during tienda
    const showSmallMonitor = currentVoice &&
        currentVoice !== 'onyx' &&
        !isAvatarLoading &&
        currentStep?.id !== 10 &&
        !(currentStep?.id === 2 && (currentVoice === 'rachelle' || currentVoice === 'en')) &&
        !(currentStep?.id === 3 && (currentVoice === 'lina' || currentVoice === 'rachelle' || currentVoice === 'en'));

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 right-8 z-[10002] flex flex-col gap-3"
            >
                {/* Space TV Avatar Experience: Lina/Rachelle/Nova en monitor pequeño (Research: avatar solo en pantalla NOVA) */}
                <AnimatePresence>
                    {showSmallMonitor && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0, x: 20 }}
                            animate={{ scale: 1, opacity: 1, x: 0 }}
                            exit={{ scale: 0, opacity: 0, x: 20 }}
                            className={`absolute -left-[110px] top-0 z-[10003] transition-opacity duration-300 ${currentStep?.id === 5 ? 'opacity-40' : ''}`}
                        >
                            <div className="w-24 h-24 rounded-full border-[4px] border-indigo-400 bg-slate-900/90 backdrop-blur-xl shadow-[0_0_20px_rgba(99,102,241,0.5)] flex items-center justify-center overflow-hidden relative">
                                {/* CRT / Signal Noise Effect */}
                                <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] opacity-20 mix-blend-overlay pointer-events-none z-20" />
                                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,0,0,0.2)_2px,rgba(0,0,0,0.2)_3px)] pointer-events-none z-20" />

                                {(currentVoice === 'rachelle' || currentVoice === 'en') ? (
                                    <RachelleAvatar state="speaking" size={75} />
                                ) : (currentVoice === 'nova' || currentVoice === 'narrator') ? (
                                    <PresenterAvatar isSpeaking={true} size={75} />
                                ) : (
                                    <LinaAvatar state="speaking" size={75} />
                                )}
                            </div>

                            {/* Projected Base / Glow */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-indigo-500/40 blur-sm rounded-full animate-pulse" />
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-indigo-500 rounded text-[8px] font-black text-white tracking-widest uppercase">
                                {currentVoice === 'rachelle' ? 'RACHELLE-LINK' : currentVoice === 'nova' ? 'NOVA-SYNC' : 'LINA-SYNC'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Card con información del paso actual */}
                <motion.div
                    className={`bg-white rounded-2xl shadow-2xl border-2 p-4 max-w-sm transition-all duration-500 ${isDeepVoice ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)]' : 'border-indigo-500'}`}
                    animate={isDeepVoice ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                    transition={isDeepVoice ? { repeat: Infinity, duration: 2 } : {}}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            {isDeepVoice ? (
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                                    <span className="text-sm font-black text-cyan-600 tracking-tighter uppercase animate-pulse">
                                        Station AI Sync
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                    <span className="text-sm font-bold text-indigo-600">
                                        Paso {tourState.currentStep} de {tourState.totalSteps}
                                    </span>
                                </>
                            )}
                        </div>
                        <button
                            onClick={endTour}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Salir del tour"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    {/* Contenido del paso */}
                    {currentStep && (
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 mb-1">
                                {currentStep.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {currentStep.description.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                        return <span key={i} className="text-indigo-600 font-extrabold">{part.slice(2, -2)}</span>;
                                    }
                                    return part;
                                })}
                            </p>
                        </div>
                    )}

                    {/* Navigation buttons removed to enforce automatic flow */}
                    <div className="flex justify-center mt-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                            Narración en curso...
                        </span>
                    </div>
                </motion.div>

                {/* Indicador flotante pequeño (opcional, para no obstruir) */}
                <motion.div
                    className={`px-4 py-2 rounded-full shadow-lg text-xs font-bold text-center transition-colors duration-300 ${isDeepVoice ? 'bg-cyan-600 text-white border-2 border-cyan-300 animate-pulse' : 'bg-indigo-600 text-white'}`}
                    animate={isDeepVoice ? { scale: [1, 1.1, 1] } : { scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: isDeepVoice ? 1 : 2 }}
                >
                    {isDeepVoice ? '🛰️ ANALIZANDO SISTEMAS...' : '🎬 Modo Demo Activo'}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
