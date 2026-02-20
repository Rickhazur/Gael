/**
 * Conversation Saved Confirmation - Visual feedback when conversation is stored
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, BookOpen, Award, MessageSquare } from 'lucide-react';

interface ConversationSavedProps {
    characterName: string;
    questionsAsked: number;
    coinsEarned: number;
    visible: boolean;
    onDismiss?: () => void;
}

export const ConversationSaved: React.FC<ConversationSavedProps> = ({
    characterName,
    questionsAsked,
    coinsEarned,
    visible,
    onDismiss
}) => {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onDismiss?.();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [visible, onDismiss]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.8 }}
                    className="fixed bottom-8 right-8 z-50"
                >
                    <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl shadow-2xl border-2 border-emerald-300 overflow-hidden">
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_25%,rgba(255,255,255,.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,.1)_75%,rgba(255,255,255,.1))] bg-[length:40px_40px] animate-[slide_3s_linear_infinite]" />

                        <div className="relative p-6 space-y-3 text-white">
                            {/* Header with Icon */}
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.8, repeat: 2 }}
                                >
                                    <CheckCircle2 className="w-8 h-8 text-emerald-200" />
                                </motion.div>
                                <div>
                                    <p className="text-xl font-black tracking-tight">
                                        ¡Conversación Guardada!
                                    </p>
                                    <p className="text-sm text-emerald-100 font-bold">
                                        En tu cuaderno 📚
                                    </p>
                                </div>
                            </div>

                            {/* Character Name */}
                            <div className="bg-white/20 rounded-xl px-4 py-2.5 backdrop-blur">
                                <p className="text-sm font-bold text-emerald-100">Conversación Con:</p>
                                <p className="text-lg font-black text-white">{characterName}</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white/10 rounded-lg p-2.5 flex items-center gap-2"
                                >
                                    <MessageSquare className="w-5 h-5 text-cyan-200" />
                                    <div>
                                        <p className="text-xs text-cyan-100 font-bold">Preguntas</p>
                                        <p className="text-lg font-black">{questionsAsked}</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white/10 rounded-lg p-2.5 flex items-center gap-2"
                                >
                                    <Award className="w-5 h-5 text-yellow-200" />
                                    <div>
                                        <p className="text-xs text-yellow-100 font-bold">Monedas</p>
                                        <p className="text-lg font-black">+{coinsEarned}</p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center gap-2 text-xs text-emerald-100 pt-2 border-t border-white/20">
                                <BookOpen className="w-4 h-4" />
                                <span className="font-semibold">
                                    Ver en tu biblioteca de cuadernos
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConversationSaved;
