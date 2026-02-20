import React, { useState, useEffect } from 'react';
import { useDemoTour } from '@/context/DemoTourContext';
import { useLearning } from '@/context/LearningContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SpaceAtmosphere } from './SpaceAtmosphere';

export function DemoOverlay() {
    const { tourState, getCurrentStepData, startTour, nextStep } = useDemoTour();
    const { immersionMode } = useLearning();
    const currentStep = getCurrentStepData();
    const [isDeepVoice, setIsDeepVoice] = useState(false);
    const [isAvatarLoading, setIsAvatarLoading] = useState(false);

    useEffect(() => {
        const handleVoice = (e: any) => {
            if (e.detail?.voice === 'onyx') setIsDeepVoice(true);
            else setIsDeepVoice(false);
        };
        const handleEnd = () => {
            setIsDeepVoice(false);
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

    // Check if demo mode is active in storage to persist blocking even if tour ends
    const isDemoPersist = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';

    // If neither active nor persisting, don't show anything
    if (!tourState.isActive && !isDemoPersist) return null;

    // Research Center step: reduce overlay to not cover content (step 8 after adding account-creation step)
    const isResearchStep = currentStep?.id === 7;

    return (
        <>
            {/* 📝 ACCOUNT CREATION STEP - Full overlay before tour starts */}
            <AnimatePresence>
                {tourState.isActive && currentStep?.isAccountCreationStep && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border-2 border-indigo-200 p-8 md:p-10"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl">
                                    📝
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-slate-800">
                                        Cómo crear tu cuenta
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Para padres e hijos
                                    </p>
                                </div>
                            </div>
                            <ol className="space-y-4 mb-8 text-slate-700 font-medium">
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-sm">1</span>
                                    <span>En la pantalla de inicio, haz clic en <strong>Iniciar Sesión</strong></span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-sm">2</span>
                                    <span>Luego pulsa <strong>Crear cuenta</strong></span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-sm">3</span>
                                    <span>Elige <strong>Padres</strong> para crear tu cuenta y la de tu hijo en un solo paso</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-sm">4</span>
                                    <span>Completa el formulario con tus datos y los de tu hijo</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-sm">5</span>
                                    <span>¡Listo! Recibirás un correo cuando las cuentas estén aprobadas</span>
                                </li>
                            </ol>
                            <button
                                onClick={() => {
                                    window.speechSynthesis?.cancel();
                                    nextStep();
                                }}
                                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                            >
                                ✨ Continuar al recorrido
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SPECTACULAR STATION AI TRANSMISSION - HUD ONLY (Research: avatar va DENTRO de la pantalla NOVA SENTINEL, no aquí) */}
            <AnimatePresence>
                {(isDeepVoice || isAvatarLoading) && !isResearchStep && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10001] flex flex-col items-center justify-center pointer-events-none"
                    >
                        <SpaceAtmosphere />

                        {/* Status HUD Metadata */}
                        <div className="flex flex-col items-center gap-2 w-max absolute bottom-20 left-1/2 -translate-x-1/2">
                            <motion.div
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="flex items-center gap-3 px-4 py-1.5 bg-cyan-950/60 rounded-full border border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                            >
                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                                <span className="text-cyan-400 font-black tracking-[0.4em] text-[10px] uppercase">
                                    {isResearchStep ? 'STATION-AI' : 'STAI-01-SENTINEL: TRANSMITTING'}
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay que bloquea absolutamente todos los clicks - SOLO CUANDO EL TOUR ESTÁ ACTIVO */}
            {tourState.isActive && (
                <div
                    className="fixed inset-0 z-[9999] pointer-events-auto cursor-not-allowed"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0)',
                        touchAction: 'none'
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                />
            )}

            {/* Mensaje flotante indicando que es solo demostración - compacto en móvil cuando es Research Center para no tapar el avatar */}
            <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] px-4 md:px-6 py-2 md:py-3 rounded-full shadow-2xl font-bold text-xs md:text-sm flex items-center gap-2 md:gap-4 pointer-events-auto select-none transition-all duration-500 ${currentStep?.id === 7 ? 'max-md:top-2 max-md:px-3 max-md:py-1.5' : ''} ${isDeepVoice ? 'bg-cyan-600 text-white ring-4 ring-cyan-300 animate-pulse border-2 border-white/20' : 'bg-amber-500 text-white border-2 border-white/20'}`}>
                <div className="flex items-center gap-2">
                    <span className="text-xl">{isDeepVoice ? '🛰️' : '🎬'}</span>
                    <span className="tracking-wide">
                        {isDeepVoice
                            ? 'SYSTEMS OVERRIDE - Station AI Online'
                            : 'MODO DEMOSTRACIÓN - Navegación Protegida'}
                    </span>
                </div>

                {!tourState.isActive && (
                    <button
                        onClick={() => startTour({ variant: immersionMode })}
                        className="bg-white text-amber-600 px-4 py-1 rounded-full text-xs font-black shadow-lg hover:scale-110 active:scale-95 transition-transform flex items-center gap-1"
                    >
                        ✨ VER RECORRIDO
                    </button>
                )}
            </div>

            {/* 🔥 HOTSPOTS LAYER (Small Notes) - Hidden on mobile for Research Center so avatar stays visible */}
            {tourState.isActive && currentStep?.hotspots?.map((hotspot: any, idx: number) => (
                <div
                    key={idx}
                    className={`fixed z-[10001] flex items-center justify-center pointer-events-none ${currentStep?.id === 7 ? 'max-md:hidden' : ''}`}
                    style={{
                        top: `${hotspot.y}%`,
                        left: `${hotspot.x}%`,
                    }}
                >
                    {/* Pulsing Effect */}
                    <div className="absolute w-12 h-12 bg-indigo-500 rounded-full animate-ping opacity-20" />

                    {/* Core Dot */}
                    <div className="relative w-4 h-4 bg-white rounded-full border-4 border-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10" />

                    {/* Tooltip / Label */}
                    <div className={`absolute z-20 backdrop-blur-md bg-slate-900/90 text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border border-indigo-500/50 shadow-2xl animate-fade-in
                        ${hotspot.position === 'top' ? '-top-12' :
                            hotspot.position === 'bottom' ? 'top-8' :
                                hotspot.position === 'left' ? 'right-8' :
                                    'left-8'}
                    `}>
                        {hotspot.label}
                        {/* Little Arrow */}
                        <div className={`absolute w-3 h-3 bg-slate-900 border-indigo-500/50 transform rotate-45
                            ${hotspot.position === 'top' ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r' :
                                hotspot.position === 'bottom' ? 'top-[-6px] left-1/2 -translate-x-1/2 border-t border-l' :
                                    hotspot.position === 'left' ? 'top-1/2 -translate-y-1/2 right-[-6px] border-t border-r' :
                                        'top-1/2 -translate-y-1/2 left-[-6px] border-b border-l'}
                        `} />
                    </div>
                </div>
            ))}
        </>
    );
}
