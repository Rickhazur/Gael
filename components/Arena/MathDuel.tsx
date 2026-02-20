import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Timer, Zap, Trophy, X, Brain } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';

interface MathDuelProps {
    opponentName: string;
    opponentAvatar: string;
    difficulty: 'easy' | 'medium' | 'hard';
    onClose: () => void;
    onWin: (coins: number, xp: number) => void;
}

export const MathDuel: React.FC<MathDuelProps> = ({ opponentName, opponentAvatar, difficulty, onClose, onWin }) => {
    const { addCoins, addXP } = useGamification();
    const [gameState, setGameState] = useState<'counting' | 'playing' | 'result'>('counting');
    const [countdown, setCountdown] = useState(3);
    const [timeLeft, setTimeLeft] = useState(30);
    const [score, setScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [currentProblem, setCurrentProblem] = useState<{ q: string, a: number } | null>(null);
    const [userAnswer, setUserAnswer] = useState('');

    const generateProblem = () => {
        let n1, n2, op;
        if (difficulty === 'easy') {
            n1 = Math.floor(Math.random() * 10) + 1;
            n2 = Math.floor(Math.random() * 10) + 1;
            op = '+';
        } else if (difficulty === 'medium') {
            n1 = Math.floor(Math.random() * 50) + 10;
            n2 = Math.floor(Math.random() * 50) + 10;
            op = Math.random() > 0.5 ? '+' : '-';
        } else {
            n1 = Math.floor(Math.random() * 12) + 1;
            n2 = Math.floor(Math.random() * 12) + 1;
            op = '×';
        }

        const q = `${n1} ${op} ${n2}`;
        const a = op === '+' ? n1 + n2 : op === '-' ? n1 - n2 : n1 * n2;
        setCurrentProblem({ q, a });
    };

    useEffect(() => {
        if (gameState === 'counting') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setGameState('playing');
                generateProblem();
            }
        }
    }, [countdown, gameState]);

    useEffect(() => {
        if (gameState === 'playing') {
            if (timeLeft > 0) {
                const timer = setTimeout(() => {
                    setTimeLeft(timeLeft - 1);
                    // Opponent scores randomly
                    if (Math.random() > (difficulty === 'easy' ? 0.9 : difficulty === 'medium' ? 0.85 : 0.8)) {
                        setOpponentScore(prev => prev + 1);
                    }
                }, 1000);
                return () => clearTimeout(timer);
            } else {
                setGameState('result');
                if (score > opponentScore) {
                    onWin(100, 50);
                }
            }
        }
    }, [timeLeft, gameState, score, opponentScore]);

    const handleAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProblem) return;

        if (parseInt(userAnswer) === currentProblem.a) {
            setScore(prev => prev + 1);
            setUserAnswer('');
            generateProblem();
        } else {
            // Shake effect or feedback
            setUserAnswer('');
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl border-4 border-black relative"
            >
                {/* Header Duelo */}
                <div className="bg-black text-white p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Swords className="text-pink-500 w-8 h-8" />
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Duelo Relámpago</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-8 h-8" />
                    </button>
                </div>

                <div className="p-8">
                    {gameState === 'counting' && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <motion.div
                                key={countdown}
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1.5, rotate: 0 }}
                                className="text-9xl font-black text-indigo-600 mb-8"
                            >
                                {countdown === 0 ? '¡YA!' : countdown}
                            </motion.div>
                            <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Prepárate...</p>
                        </div>
                    )}

                    {gameState === 'playing' && (
                        <div className="space-y-10">
                            <div className="flex justify-between items-center px-10">
                                {/* Player */}
                                <div className="text-center space-y-2">
                                    <div className="w-24 h-24 bg-indigo-100 rounded-3xl border-4 border-indigo-600 flex items-center justify-center text-5xl shadow-lg">🦁</div>
                                    <div className="font-black text-xl">Tú</div>
                                    <div className="text-4xl font-black text-indigo-600">{score}</div>
                                </div>

                                {/* Vs & Timer */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="text-6xl font-black text-slate-200">VS</div>
                                    <div className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] border-4 border-indigo-500 shadow-xl flex items-center gap-3">
                                        <Timer className={`w-8 h-8 ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'}`} />
                                        <span className="text-4xl font-black font-mono">{timeLeft}s</span>
                                    </div>
                                </div>

                                {/* Opponent */}
                                <div className="text-center space-y-2">
                                    <div className="w-24 h-24 bg-pink-100 rounded-3xl border-4 border-pink-600 flex items-center justify-center text-5xl shadow-lg">{opponentAvatar}</div>
                                    <div className="font-black text-xl">{opponentName}</div>
                                    <div className="text-4xl font-black text-pink-600">{opponentScore}</div>
                                </div>
                            </div>

                            {/* Problem Area */}
                            <div className="bg-slate-50 rounded-[3rem] p-12 text-center border-4 border-dashed border-slate-200 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Brain size={120} /></div>
                                <div className="text-6xl font-black text-slate-800 mb-8 tracking-tighter">
                                    {currentProblem?.q} = ?
                                </div>
                                <form onSubmit={handleAnswer} className="max-w-xs mx-auto relative">
                                    <input
                                        autoFocus
                                        type="number"
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        className="w-full bg-white border-4 border-black rounded-3xl p-6 text-4xl font-black text-center focus:outline-none focus:ring-4 ring-indigo-500/20 transition-all placeholder:text-slate-200"
                                        placeholder="?"
                                    />
                                    <button type="submit" className="hidden">Enviar</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {gameState === 'result' && (
                        <div className="text-center py-10 space-y-8 animate-in zoom-in duration-500">
                            <div className="relative inline-block">
                                <Trophy className={`w-40 h-40 mx-auto ${score > opponentScore ? 'text-yellow-500' : 'text-slate-300'}`} />
                                {score > opponentScore && <Zap className="absolute -top-4 -right-4 w-12 h-12 text-blue-500 animate-bounce" />}
                            </div>
                            <div>
                                <h3 className="text-5xl font-black text-slate-900 mb-2 uppercase">
                                    {score > opponentScore ? '¡ERES EL GANADOR!' : score === opponentScore ? '¡EMPATE!' : '¡MÁS SUERTE LA PRÓXIMA!'}
                                </h3>
                                <p className="text-xl font-bold text-slate-500">Lograste {score} puntos frente a {opponentScore} de {opponentName}</p>
                            </div>

                            {score > opponentScore && (
                                <div className="flex justify-center gap-6">
                                    <div className="bg-amber-100 px-6 py-3 rounded-2xl border-2 border-amber-200 flex items-center gap-2">
                                        <span className="text-2xl">🪙</span>
                                        <span className="font-black text-amber-700">+100 NOVA COINS</span>
                                    </div>
                                    <div className="bg-indigo-100 px-6 py-3 rounded-2xl border-2 border-indigo-200 flex items-center gap-2">
                                        <span className="text-2xl">⭐</span>
                                        <span className="font-black text-indigo-700">+50 XP</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                className="bg-black text-white px-10 py-5 rounded-[2rem] font-black text-xl hover:scale-105 transition-transform"
                            >
                                VOLVER A LA ARENA
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
