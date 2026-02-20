import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { Loader2 } from 'lucide-react';



interface StationAvatarProps {

    isSpeaking: boolean;

    size?: number;

    isLoading?: boolean;

}



export function StationAvatar({ isSpeaking, size = 100, isLoading = false }: StationAvatarProps) {

    const [mouthOpen, setMouthOpen] = useState(false);



    // Sync mouth animation with speaking state

    useEffect(() => {

        let interval: NodeJS.Timeout;

        if (isSpeaking) {

            interval = setInterval(() => {

                setMouthOpen(prev => !prev);

            }, 150);

        } else {

            setMouthOpen(false);

        }

        return () => clearInterval(interval);

    }, [isSpeaking]);



    return (

        <div

            className="relative flex items-center justify-center"

            style={{ width: size, height: size }}

        >

            {/* Pulsing Aura - Cybernetic Glow */}

            <motion.div

                className="absolute inset-0 rounded-full blur-2xl opacity-40 bg-cyan-400"

                animate={{

                    scale: isSpeaking ? [1, 1.2, 1] : [1, 1.05, 1],

                    opacity: isSpeaking ? [0.4, 0.7, 0.4] : [0.3, 0.5, 0.3],

                }}

                transition={{

                    duration: 2,

                    repeat: Infinity,

                    ease: "easeInOut"

                }}

            />



            {/* Orbiting Tech Ring */}

            <motion.div

                className="absolute inset-[-15%] border-2 border-dashed border-cyan-500/30 rounded-full"

                animate={{ rotate: 360 }}

                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}

            />



            {/* Main Avatar Unit */}

            <div className="relative w-full h-full rounded-full border-[4px] border-cyan-400 bg-slate-900 shadow-[0_0_30px_rgba(34,211,238,0.5)] overflow-hidden">



                {/* --- SHUTTER / CURTAIN LAYER (REPLICATING RESEARCH CENTER) --- */}

                <AnimatePresence>

                    {isLoading && (

                        <motion.div

                            initial={{ translateY: "-100%" }}

                            animate={{ translateY: 0 }}

                            exit={{ translateY: "-100%" }}

                            transition={{ duration: 0.5, ease: "easeInOut" }}

                            className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center border-b-4 border-cyan-500 shadow-xl"

                        >

                            {/* Texture & Signal Noise */}

                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:10px_10px]" />

                            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,0,0,0.5)_2px,rgba(0,0,0,0.5)_3px)]" />

                            <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] opacity-10 mix-blend-overlay" />



                            <div className="relative z-10 flex flex-col items-center">

                                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-1" />

                                <span className="text-[8px] font-black tracking-widest text-cyan-400 animate-pulse">

                                    TUNING...

                                </span>

                            </div>

                        </motion.div>

                    )}

                </AnimatePresence>



                {/* CRT Screen Overlays */}

                <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] opacity-10 mix-blend-screen pointer-events-none z-10" />

                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,0,0,0.2)_2px,rgba(0,0,0,0.2)_3px)] pointer-events-none z-10" />



                <motion.img

                    src={mouthOpen ? '/images/nova_talking.png' : '/images/nova_idle.png'}

                    alt="Station AI"

                    className="w-full h-full object-cover scale-110 contrast-125 brightness-110 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]"

                    animate={isSpeaking ? { scale: [1.1, 1.15, 1.1] } : { scale: 1.1 }}

                    transition={{ duration: 0.15, repeat: Infinity }}

                />



                {/* Scanline Sweep */}

                <motion.div

                    className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent h-1/2 w-full z-20"

                    animate={{ top: ['-50%', '150%'] }}

                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}

                />

            </div>



            {/* Glowing Power Indicator */}

            <div className="absolute bottom-0 right-1/4 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />

        </div>

    );

}

