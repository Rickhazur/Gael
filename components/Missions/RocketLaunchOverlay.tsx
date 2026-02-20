import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sfx } from '@/services/soundEffects';

interface RocketLaunchOverlayProps {
    isVisible: boolean;
    onComplete: () => void;
}

export const RocketLaunchOverlay: React.FC<RocketLaunchOverlayProps> = ({ isVisible, onComplete }) => {
    const [step, setStep] = useState<'IDLE' | 'READY' | '3' | '2' | '1' | 'LIFT_OFF'>('IDLE');
    const hasTriggeredRef = useRef(false);
    const onCompleteRef = useRef(onComplete);

    // Keep onComplete ref updated
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (isVisible) {
            console.log("🚀 RocketLaunchOverlay triggered!");
            // Only trigger if not already triggered in this visibility cycle
            if (!hasTriggeredRef.current) {
                setStep('READY');

                // Trigger the sound sequence
                sfx.playCountdownSequence();
                hasTriggeredRef.current = true;

                // NASA Voice Helper with voice loading support
                const speak = (text: string) => {
                    const startSpeaking = () => {
                        const utterance = new SpeechSynthesisUtterance(text);
                        utterance.lang = 'en-US';
                        utterance.rate = 0.9;
                        utterance.pitch = 0.8;
                        const voices = window.speechSynthesis.getVoices();
                        const maleVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Mark')));
                        if (maleVoice) utterance.voice = maleVoice;
                        window.speechSynthesis.speak(utterance);
                    };

                    if (window.speechSynthesis.getVoices().length === 0) {
                        window.speechSynthesis.onvoiceschanged = () => {
                            startSpeaking();
                            window.speechSynthesis.onvoiceschanged = null;
                        };
                    } else {
                        startSpeaking();
                    }
                };

                // Initial Announcement
                speak("Ready for launch.");

                // Timeline (aligned with soundEffects.ts sequence: beeps at 1.5, 2.5, 3.5)
                const timers = [
                    setTimeout(() => { setStep('3'); speak("Three"); }, 1500),
                    setTimeout(() => { setStep('2'); speak("Two"); }, 2500),
                    setTimeout(() => { setStep('1'); speak("One"); }, 3500),
                    setTimeout(() => {
                        // Ignition and Lift Off happen at 4.5s in the SFX sequence
                        setStep('LIFT_OFF');
                        speak("Ignition. Lift off!");
                    }, 4500),
                    setTimeout(() => {
                        onCompleteRef.current();
                    }, 8500)
                ];

                return () => {
                    timers.forEach(clearTimeout);
                    window.speechSynthesis.cancel();
                };
            }
        } else {
            setStep('IDLE');
            hasTriggeredRef.current = false;
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
            {/* 🌌 Space Background */}
            <div className="absolute inset-0 bg-[#020617] pointer-events-none">
                {/* Simulated Moving Stars */}
                <StarsBackground />
                {/* Nebula */}
                <div className="absolute top-[20%] left-[10%] w-[80%] h-[60%] bg-indigo-600/20 rounded-[100%] blur-[120px] animate-pulse" />
            </div>

            {/* 🚀 Rocket Container */}
            <motion.div
                className="relative z-10 flex flex-col items-center justify-center"
                initial={{ y: 0 }}
                animate={step === 'LIFT_OFF' ? { y: -2000 } : { y: 0 }}
                transition={step === 'LIFT_OFF' ? { duration: 4, ease: "easeIn" } : {}}
            >
                {/* Shake Wrapper for Countdown */}
                <motion.div
                    animate={['3', '2', '1'].includes(step) ? { x: [-2, 2, -2, 2, 0], y: [-1, 1, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 0.1 }}
                    className="relative"
                >
                    {/* The Rocket */}
                    <Rocket
                        className={cn(
                            "w-48 h-48 lg:w-64 lg:h-64 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300",
                            step === 'LIFT_OFF' && "text-cyan-200 drop-shadow-[0_0_80px_cyan]"
                        )}
                        strokeWidth={1.5}
                    />

                    {/* Window Glow */}
                    <div className="absolute top-[34%] left-[34%] w-[32%] h-[32%] bg-cyan-400/50 rounded-full blur-md" />

                    {/* Engine Fire (Only visible right before/during launch) */}
                    <AnimatePresence>
                        {(step === '1' || step === 'LIFT_OFF') && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                                animate={{ opacity: 1, scale: [1, 1.2, 0.9, 1.1], y: 10 }}
                                exit={{ opacity: 0 }}
                                transition={{ repeat: Infinity, duration: 0.1 }}
                                className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-20 h-40 bg-gradient-to-t from-transparent via-orange-500 to-yellow-300 blur-xl rounded-full origin-top"
                            />
                        )}
                        {step === 'LIFT_OFF' && (
                            <motion.div
                                initial={{ scale: 1 }}
                                animate={{ scale: [1.5, 2.5], height: [200, 600], opacity: [1, 0] }}
                                className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-32 bg-gradient-to-t from-transparent via-orange-600 to-white blur-2xl rounded-full"
                            />
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Smoke/Clouds at Launchpad (Bottom of screen) */}
                <AnimatePresence>
                    {step === 'LIFT_OFF' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute top-[300px] w-[200vw] h-[500px] bg-gradient-to-t from-slate-200/50 via-gray-400/30 to-transparent blur-[80px]"
                        />
                    )}
                </AnimatePresence>
            </motion.div>

            {/* 🔢 Countdown Text Overlay */}
            <div className="absolute pointer-events-none z-20 inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {step === 'READY' && (
                        <motion.div
                            key="ready"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                            className="text-center"
                        >
                            <h2 className="text-4xl lg:text-6xl font-black text-cyan-400 tracking-widest uppercase italic drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]">
                                READY FOR LAUNCH
                            </h2>
                            <p className="text-white/60 font-mono text-xl mt-4 tracking-[0.5em] animate-pulse">INITIATING SEQUENCE</p>
                        </motion.div>
                    )}

                    {(['3', '2', '1'] as const).map((num) => (
                        step === num && (
                            <motion.div
                                key={num}
                                initial={{ opacity: 0, scale: 2, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.5, filter: 'blur(20px)' }}
                                transition={{ duration: 0.4, type: "spring", bounce: 0.5 }}
                                className="font-black text-[12rem] lg:text-[20rem] text-white leading-none drop-shadow-[0_0_50px_rgba(255,255,255,0.8)]"
                            >
                                {num}
                            </motion.div>
                        )
                    ))}

                    {step === 'LIFT_OFF' && (
                        <motion.div
                            key="liftoff"
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-20 text-center"
                        >
                            <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-500 to-red-500 uppercase italic tracking-tighter drop-shadow-xl">
                                LIFT OFF!
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// 🌌 Simple Starfield Component
const StarsBackground = () => {
    return (
        <div className="absolute inset-0">
            {/* Generate static stars for performance, or animated ones */}
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white rounded-full"
                    initial={{
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                        scale: Math.random() * 0.5 + 0.5,
                        opacity: Math.random() * 0.7 + 0.3
                    }}
                    animate={{
                        y: [null, 1000], // Stars fall down to simulate upward movement
                    }}
                    transition={{
                        duration: Math.random() * 2 + 0.5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 2
                    }}
                    style={{
                        width: Math.random() > 0.9 ? '3px' : '1px',
                        height: Math.random() > 0.9 ? '3px' : '1px',
                    }}
                />
            ))}
        </div>
    );
};
