import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Minus, MoveRight, Sparkles } from 'lucide-react';

interface SmartVisualArithmeticProps {
    n1: number;
    n2: number;
    operator: '+' | '-';
    itemEmoji?: string;
    onComplete?: (result: number) => void;
    language?: 'es' | 'en';
}

export const SmartVisualArithmetic: React.FC<SmartVisualArithmeticProps> = ({
    n1,
    n2,
    operator,
    itemEmoji = '🔵',
    onComplete,
    language = 'es'
}) => {
    const [phase, setPhase] = useState<'initial' | 'animating' | 'result'>('initial');
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        const newItems: any[] = [];

        // Group 1
        for (let i = 0; i < n1; i++) {
            newItems.push({
                id: `n1-${i}`,
                group: 1,
                emoji: itemEmoji,
                color: 'blue'
            });
        }

        // Group 2
        for (let i = 0; i < n2; i++) {
            newItems.push({
                id: `n2-${i}`,
                group: 2,
                emoji: operator === '+' ? '🔴' : itemEmoji, // Red for added items, same for removed
                color: operator === '+' ? 'red' : 'blue'
            });
        }

        setItems(newItems);
        setPhase('initial');
    }, [n1, n2, operator, itemEmoji]);

    const handleAction = () => {
        setPhase('animating');
        setTimeout(() => {
            setPhase('result');
            if (onComplete) {
                onComplete(operator === '+' ? n1 + n2 : n1 - n2);
            }
        }, 1500);
    };

    const resultCount = operator === '+' ? n1 + n2 : n1 - n2;

    return (
        <div className="w-full min-h-[450px] bg-white rounded-[2.5rem] border-4 border-slate-100 shadow-2xl p-8 flex flex-col items-center overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-10 left-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-50 rounded-full blur-3xl opacity-50" />
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-8 font-fredoka tracking-wide flex items-center gap-3">
                {phase === 'initial' && (
                    <>
                        <span>{language === 'es' ? '¡Mira los grupos!' : 'Look at the groups!'}</span>
                        <span className="text-3xl">🧐</span>
                    </>
                )}
                {phase === 'animating' && (
                    <>
                        <span>{operator === '+' ? (language === 'es' ? '¡Juntándolos!' : 'Joining them!') : (language === 'es' ? '¡Quitándolos!' : 'Taking them away!')}</span>
                        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>✨</motion.span>
                    </>
                )}
                {phase === 'result' && (
                    <>
                        <span>{language === 'es' ? '¡Increíble!' : 'Amazing!'}</span>
                        <Sparkles className="text-yellow-500 w-8 h-8 fill-yellow-200" />
                    </>
                )}
            </h3>

            <div className="flex-1 w-full flex flex-col lg:flex-row items-center justify-around gap-8 relative">

                {/* GROUP 1 CONTAINER */}
                <div className="flex flex-col items-center gap-4">
                    <div className="text-xs font-black text-blue-500 uppercase tracking-widest">{language === 'es' ? 'Grupo 1' : 'Group 1'}</div>
                    <div className={`w-[200px] h-[180px] bg-blue-50/50 border-4 border-dashed border-blue-200 rounded-[2rem] flex flex-wrap content-start p-4 gap-2 transition-all duration-500 ${phase !== 'initial' ? 'opacity-30 scale-95' : ''}`}>
                        <AnimatePresence>
                            {items.filter(it => it.group === 1).map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    layoutId={item.id}
                                    initial={{ scale: 0 }}
                                    animate={{
                                        scale: 1,
                                        x: phase === 'result' ? 240 - (idx % 8) * 35 : 0,
                                        y: phase === 'result' ? 200 - Math.floor(idx / 8) * 35 : 0
                                    }}
                                    className="text-3xl drop-shadow-sm select-none"
                                >
                                    {item.emoji}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* OPERATOR ICON */}
                <motion.div
                    animate={phase !== 'initial' ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center"
                >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white font-bold text-2xl ${operator === '+' ? 'bg-indigo-500' : 'bg-rose-500'}`}>
                        {operator === '+' ? <Plus strokeWidth={4} /> : <Minus strokeWidth={4} />}
                    </div>
                </motion.div>

                {/* GROUP 2 CONTAINER */}
                <div className="flex flex-col items-center gap-4">
                    <div className="text-xs font-black text-rose-500 uppercase tracking-widest">{language === 'es' ? 'Grupo 2' : 'Group 2'}</div>
                    <div className={`w-[200px] h-[180px] bg-rose-50/50 border-4 border-dashed border-rose-200 rounded-[2rem] flex flex-wrap content-start p-4 gap-2 transition-all duration-500 ${phase !== 'initial' ? 'opacity-30 scale-95' : ''}`}>
                        <AnimatePresence>
                            {items.filter(it => it.group === 2).map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    layoutId={item.id}
                                    initial={{ scale: 0 }}
                                    animate={{
                                        scale: phase === 'result' && operator === '-' ? 0 : 1,
                                        opacity: phase === 'result' && operator === '-' ? 0 : 1,
                                        x: phase === 'result' ? -240 + ((idx + n1) % 8) * 35 : 0,
                                        y: phase === 'result' ? 200 + Math.floor((idx + n1) / 8) * 35 : 0
                                    }}
                                    className="text-3xl drop-shadow-sm select-none"
                                >
                                    {item.emoji}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* CENTRAL RESULT AREA (Hidden initially) */}
                <AnimatePresence>
                    {phase === 'result' && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute inset-x-0 bottom-[-40px] flex flex-col items-center"
                        >
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-[3rem] shadow-2xl border-4 border-white transform -rotate-1">
                                <span className="text-4xl lg:text-5xl font-black text-white font-fredoka tracking-tighter">
                                    {n1} {operator} {n2} = {resultCount}
                                </span>
                            </div>

                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="mt-4 text-emerald-500 font-black text-sm uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200"
                            >
                                ¡PRÓXIMA MISIÓN! 🚀
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ACTION BUTTON */}
            {phase === 'initial' && (
                <Button
                    size="lg"
                    onClick={handleAction}
                    className="mt-8 px-12 py-8 text-2xl font-black rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 border-b-8 border-indigo-800 hover:brightness-110 flex items-center gap-4"
                >
                    {operator === '+' ? (
                        <>
                            <span>{language === 'es' ? '¡JUNTAR TODO!' : 'JOIN EVERYTHING!'}</span>
                            <MoveRight className="w-8 h-8" strokeWidth={3} />
                        </>
                    ) : (
                        <>
                            <span>{language === 'es' ? '¡QUITAR OBJETOS!' : 'TAKE AWAY!'}</span>
                            <Minus className="w-8 h-8" strokeWidth={3} />
                        </>
                    )}
                </Button>
            )}

            {/* PROGRESS OVERLAY */}
            <AnimatePresence>
                {phase === 'animating' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center p-12"
                    >
                        <div className="w-full max-w-md h-6 bg-slate-200 rounded-full overflow-hidden shadow-inner border-2 border-slate-300">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
