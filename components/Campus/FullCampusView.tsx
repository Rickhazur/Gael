import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '@/types';

interface FullCampusViewProps {
    language: Language;
    userName: string;
}

export const FullCampusView: React.FC<FullCampusViewProps> = ({ language, userName }) => {
    return (
        <div className="relative w-full h-[100dvh] overflow-hidden bg-[#142438] flex flex-col items-center justify-center p-4">
            {/* 1. Full Campus Image - Optimized for Mobile Aspect Ratio */}
            <motion.div
                className="relative w-full flex items-center justify-center z-10 mb-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1.15 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            >
                <div className="w-full h-[65vh] flex items-center justify-center rounded-3xl overflow-hidden">
                    <img
                        src="/assets/city/campus_nav_mobile.jpg"
                        alt="Campus Nova Completo"
                        className="max-w-full max-h-full object-contain drop-shadow-[0_0_50px_rgba(0,183,255,0.5)] block outline-none"
                    />
                </div>
            </motion.div>

            {/* 2. Floating Content Overlay - Clear and Large for Mobile */}
            <div className="relative z-20 flex flex-col items-center text-center mt-4 space-y-4 px-2">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase drop-shadow-lg">
                        {language === 'es' ? 'Campus Nova' : 'Nova Campus'}
                    </h1>
                    <div className="h-1 w-12 bg-cyan-400 mx-auto rounded-full mt-1" />
                </motion.div>

                <motion.p
                    className="text-cyan-100 text-sm font-bold leading-relaxed max-w-[280px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    {language === 'es'
                        ? 'Todo tu aprendizaje conectado en un solo lugar.'
                        : 'Your entire learning journey connected in one place.'}
                </motion.p>

                <motion.div
                    className="pt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                >
                    <div className="px-6 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-xl">
                        <p className="text-white text-xs font-black tracking-wide">
                            {language === 'es' ? '¡HOLA,' : 'HELLO,'} <span className="text-cyan-400">{userName.toUpperCase()}</span>!
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* 3. Galaxy Background Atmos */}
            <div className="absolute inset-0 z-0 pointer-events-none" style={{
                background: `
                    radial-gradient(ellipse 80% 60% at 50% 50%, rgba(88, 28, 135, 0.3) 0%, transparent 50%),
                    radial-gradient(ellipse 60% 80% at 30% 40%, rgba(59, 130, 246, 0.2) 0%, transparent 45%),
                    radial-gradient(ellipse 50% 60% at 70% 60%, rgba(219, 39, 119, 0.15) 0%, transparent 40%)
                `
            }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[60%] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0f172a_80%)]" />
            </div>
        </div>
    );
};
