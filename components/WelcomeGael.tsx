import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Stars, ChevronRight, ShieldCheck } from 'lucide-react';

interface WelcomeGaelProps {
    onClose: () => void;
}

export const WelcomeGael: React.FC<WelcomeGaelProps> = ({ onClose }) => {
    const [step, setStep] = useState(1);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-[#1B4D3E]/95 backdrop-blur-xl flex items-center justify-center p-6 text-white text-center"
            >
                <div className="max-w-md w-full">
                    {step === 1 && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="space-y-8"
                        >
                            <div className="relative mx-auto w-48 h-48 sm:w-64 sm:h-64">
                                {/* Decoraciones animadas */}
                                <motion.div 
                                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute inset-[-20px] bg-emerald-400/20 blur-3xl rounded-full"
                                />
                                
                                <div className="relative w-full h-full rounded-[3rem] overflow-hidden border-4 border-white/20 shadow-2xl">
                                    <img 
                                        src="/gael.png" 
                                        alt="Gael" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback if image doesn't exist yet
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800';
                                        }}
                                    />
                                </div>
                                <motion.div 
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -bottom-4 -right-4 bg-white text-[#1B4D3E] p-3 rounded-2xl shadow-xl"
                                >
                                    <Heart className="w-6 h-6 fill-current" />
                                </motion.div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                                    ¡Bienvenida, <span className="text-emerald-300">Danna</span>!
                                </h2>
                                <p className="text-lg text-emerald-100/80 leading-relaxed">
                                    Estás aquí por él, por tu futuro y por el de Gael. 
                                    Academia Gael te acompañará paso a paso para que logres tu bachillerato con éxito.
                                </p>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-5 bg-white text-[#1B4D3E] rounded-2xl font-black text-xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                                CONTINUAR <ChevronRight className="w-6 h-6" />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="space-y-8"
                        >
                            <div className="w-20 h-20 bg-emerald-400/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-10 h-10 text-emerald-300" />
                            </div>
                            
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold">Seguridad Primero</h2>
                                <p className="text-emerald-100/80">
                                    Para proteger tu cuenta, es necesario que personalices tu contraseña en este momento.
                                </p>
                            </div>

                            <div className="p-6 bg-white/10 rounded-3xl border border-white/10 text-left space-y-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Instrucciones</p>
                                <ul className="text-sm space-y-2 list-disc pl-4 text-emerald-50">
                                    <li>Usa al menos 8 caracteres.</li>
                                    <li>Incluye una letra mayúscula.</li>
                                    <li>No compartas tu cuenta con nadie.</li>
                                </ul>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                                CAMBIAR MI CLAVE 🚀
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
