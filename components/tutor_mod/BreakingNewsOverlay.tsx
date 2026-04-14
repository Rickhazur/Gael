import React, { useState, useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { RachelleAvatar } from '@/components/MathMaestro/tutor/RachelleAvatar';

import { Globe2, Radio, Zap } from 'lucide-react';

import { generateSpeech } from '@/services/edgeTTS';



const headlines: string[] = [
    "Explorers find new star system!",
    "Water discovered on distant moon!",
    "Intergalactic Education Summit starts today!",
    "New robotic pets arriving at Nova Campus!",
];



export const BreakingNewsOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [currentHead, setCurrentHead] = useState(0);
    const [phase, setPhase] = useState<'intro' | 'anchor1' | 'conclusion'>('intro');
    const hasRunRef = useRef(false);
    const onCompleteRef = useRef(onComplete);



    // Keep onComplete ref updated
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);



    useEffect(() => {
        // Solo ejecutar una vez cuando el componente se monta
        if (hasRunRef.current) return;
        hasRunRef.current = true;



        const runSequence = async () => {
            // Stage 1: Intro
            await new Promise(r => setTimeout(r, 1000));

            // Stage 2: Rachelle
            setPhase('anchor1');
            await generateSpeech("Good morning students! This is Rachelle reporting live for The Nova Times.", 'rachelle');

            // Final delay then close
            await new Promise(r => setTimeout(r, 1500));
            onCompleteRef.current();
        };



        runSequence();



        const headInterval = setInterval(() => {
            setCurrentHead(prev => (prev + 1) % headlines.length);
        }, 2500);



        return () => {
            clearInterval(headInterval);
        };
    }, []); // Sin dependencias - solo se ejecuta una vez al montar



    return (
        <div className="fixed inset-0 z-[150] flex flex-col bg-slate-900 overflow-hidden font-sans">
            {/* HUD Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            </div>



            {/* Top Bar: Live Indicator */}
            <div className="h-16 bg-red-600 flex items-center justify-between px-8 border-b-4 border-red-800 shadow-xl z-20">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <span className="text-white font-black tracking-tighter text-2xl">LIVE: NOVA NEWS</span>
                </div>
                <div className="text-white/80 font-mono text-sm uppercase tracking-widest hidden md:block">
                    Grid Sector 7G | Orbital Station
                </div>
            </div>



            {/* Main Content: The Studio */}
            <div className="flex-1 relative flex items-center justify-center p-8">



                {/* Anchor 1: Rachelle (English) */}
                <AnimatePresence mode="wait">
                    {phase === 'anchor1' && (
                        <motion.div
                            key="rachelle"
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            className="absolute left-[10%] bottom-[20%] flex flex-col items-center"
                        >
                            <div className="bg-blue-900/40 p-6 rounded-3xl border-2 border-blue-400/50 backdrop-blur-md relative">
                                <RachelleAvatar state="speaking" size={160} />
                                <div className="absolute -top-4 -left-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">RACHELLE</div>
                            </div>
                            <motion.div
                                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                                className="mt-6 bg-white/95 p-4 rounded-xl shadow-2xl max-w-xs border-l-8 border-blue-600 origin-top"
                            >
                                <p className="text-slate-900 font-bold leading-tight">
                                    "Good morning students! This is Rachelle reporting live for The Nova Times."
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>



                {/* Global News Visuals (Center) */}
                <div className="w-64 h-64 relative">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <Globe2 className="w-full h-full text-blue-500/30" />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Radio className="w-20 h-20 text-blue-400 animate-pulse" />
                    </div>
                </div>
            </div>



            {/* Bottom Ticker */}
            <div className="h-20 bg-slate-900 border-t-4 border-blue-600 flex overflow-hidden z-20">
                <div className="bg-blue-600 flex items-center px-6 gap-2 shrink-0">
                    <Zap className="text-white fill-white w-5 h-5" />
                    <span className="text-white font-black whitespace-nowrap">BREAKING NEWS</span>
                </div>
                <div className="flex-1 flex items-center bg-black/50 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentHead}
                            initial={{ x: '100%' }}
                            animate={{ x: '-10%' }}
                            exit={{ x: '-110%' }}
                            transition={{ duration: 2.5, ease: "linear" }}
                            className="absolute whitespace-nowrap flex gap-12"
                        >
                            <span className="text-blue-400 font-mono font-bold text-xl uppercase tracking-tighter">
                                {headlines[currentHead]}
                            </span>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>



            {/* Screen Effects */}

            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">

                <div className="w-full h-1 bg-blue-500/10 absolute top-[-5%] animate-[scanline_8s_linear_infinite]" />

                <div className="w-full h-[2px] bg-white/5 absolute top-1/2" />

            </div>



            <style>{`

        @keyframes scanline {

          0% { top: -5%; }

          100% { top: 105%; }

        }

      `}</style>

        </div>

    );

};

