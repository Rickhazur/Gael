import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Heart, Sparkles, Target, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FallingEgg {
    id: number;
    problem: string;
    answer: number;
    options: number[];
    y: number; // 0 to 100
    color: string;
    hit?: boolean;
    exploding?: boolean;
}

const playSound = (type: 'success' | 'fail' | 'move' | 'start' | 'gameover' | 'reward' | 'drop' | 'flap' | 'zoom') => {
    try {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const now = ctx.currentTime;

        if (type === 'success') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now); osc.stop(now + 0.5);
        } else if (type === 'fail') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(10, now + 0.5);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now); osc.stop(now + 0.5);
        } else if (type === 'zoom') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
        }
    } catch (e) {
        console.warn("Audio failed", e);
    }
};

// COMPONENT: NANO BANANA PRO FLYING PARROT (USING HIGH-RES SPRITE)
const NanoProParrot: React.FC<{ pos: number; isDropping: boolean; direction: number }> = ({ pos, isDropping, direction }) => {
    return (
        <motion.div
            className="relative w-64 h-64 flex items-center justify-center pointer-events-none"
            animate={{
                x: `${pos * 100}%`,
                rotate: direction * 15,
                y: [0, -20, 0],
                scale: isDropping ? 1.1 : 1
            }}
            transition={{
                x: { type: 'spring', stiffness: 70, damping: 14 },
                y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                rotate: { type: 'spring', stiffness: 50 }
            }}
        >
            <div className="relative">
                {/* Spritesheet/Image Parrot */}
                <motion.div
                    className="relative w-56 h-56 z-10 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.3)] saturate-[1.5]"
                    animate={isDropping ? { rotate: [0, -10, 10, 0], y: [0, 20, 0] } : {}}
                    transition={{ duration: 0.4 }}
                >
                    <img src="/assets/games/parrot.png" alt="Parrot" className="w-full h-full object-contain" />
                </motion.div>

                {/* Wind Particles when moving */}
                {direction !== 0 && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1, x: direction * -100 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="w-40 h-1 bg-white/40 blur-sm rounded-full" />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export const MultiStarRunner: React.FC = () => {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
    const [score, setScore] = useState(0);
    const [coins, setCoins] = useState(0);
    const [lives, setLives] = useState(3);
    const [lane, setLane] = useState(1);
    const [eggs, setEggs] = useState<FallingEgg[]>([]);
    const [eggsInBasket, setEggsInBasket] = useState(0);
    const [multiplier, setMultiplier] = useState(2);
    const [speed, setSpeed] = useState(0.5);
    const [isShielded, setIsShielded] = useState(false);
    const [shake, setShake] = useState(0);
    const [activeProblem, setActiveProblem] = useState<string>("");
    const [showCheer, setShowCheer] = useState(false);
    const [showReward, setShowReward] = useState(false);
    const [praiseText, setPraiseText] = useState("");

    const [birdPos, setBirdPos] = useState(1);
    const [birdDirection, setBirdDirection] = useState(0);
    const [isBirdDropping, setIsBirdDropping] = useState(false);

    const MAX_BASKET_CAPACITY = 8;
    const praises = ["¡ÉPICO!", "¡INCREÍBLE!", "¡SUPREMO!", "¡ESTELAR!", "¡MAJESTUOSO!"];
    const laneRef = useRef(1);

    const handleMove = useCallback((newLane: number) => {
        if (newLane < 0 || newLane > 2 || newLane === laneRef.current) return;
        laneRef.current = newLane;
        setLane(newLane);
        playSound('zoom');
    }, []);

    const generateProblem = useCallback(() => {
        const n1 = multiplier;
        const n2 = Math.floor(Math.random() * 10) + 1;
        const answer = n1 * n2;
        let options = [answer];
        while (options.length < 3) {
            const wrong = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
            if (wrong > 0 && !options.includes(wrong)) options.push(wrong);
        }
        options.sort(() => Math.random() - 0.5);
        return {
            id: Date.now() + Math.random(),
            problem: `${n1} × ${n2}`,
            answer,
            options,
            y: -5,
            color: "transparent", // Legacy
            hit: false,
            exploding: false
        };
    }, [multiplier]);

    useEffect(() => {
        if (gameState !== 'playing') return;
        const sequence = async () => {
            const target = Math.floor(Math.random() * 3);
            setBirdDirection(target > birdPos ? 1 : -1);
            setBirdPos(target);
            await new Promise(r => setTimeout(r, 1200));
            setBirdDirection(0);
            setIsBirdDropping(true);
            await new Promise(r => setTimeout(r, 400));
            setEggs(prev => [...prev, generateProblem()]);
            setIsBirdDropping(false);
        };
        const timer = setInterval(sequence, 5000);
        return () => clearInterval(timer);
    }, [gameState, birdPos, generateProblem]);

    useEffect(() => {
        if (gameState !== 'playing') return;
        const loop = setInterval(() => {
            setEggs(prev => {
                const updated = prev.map(m => ({ ...m, y: m.y + speed }));
                const target = updated.find(m => !m.hit && m.y > 80 && m.y < 88);
                if (target) {
                    target.hit = true;
                    const choice = target.options[laneRef.current];
                    if (choice === target.answer) {
                        target.exploding = true;
                        setScore(s => s + 10);
                        setShake(20);
                        setTimeout(() => setShake(0), 300);
                        playSound('success');
                        setEggsInBasket(e => {
                            const next = e + 1;
                            if (next >= MAX_BASKET_CAPACITY) {
                                playSound('reward');
                                setCoins(c => c + 150);
                                setShowReward(true);
                                setTimeout(() => { setShowReward(false); setEggsInBasket(0); }, 3000);
                                return MAX_BASKET_CAPACITY;
                            }
                            return next;
                        });
                        setPraiseText(praises[Math.floor(Math.random() * praises.length)]);
                        setShowCheer(true);
                        setTimeout(() => setShowCheer(false), 2000);
                        confetti({ particleCount: 200, spread: 100, origin: { y: 0.8 }, colors: ['#FFD700', '#ffffff'] });
                    } else {
                        if (!isShielded) {
                            setLives(l => {
                                if (l <= 1) setGameState('gameover');
                                return Math.max(0, l - 1);
                            });
                            setIsShielded(true);
                            playSound('fail');
                            setTimeout(() => setIsShielded(false), 2000);
                        }
                    }
                }
                return updated.filter(m => m.y < 120);
            });
        }, 16);
        return () => clearInterval(loop);
    }, [gameState, speed, isShielded]);

    useEffect(() => {
        const t = eggs.find(e => !e.hit && e.y < 80);
        if (t) setActiveProblem(t.problem);
    }, [eggs]);

    const startGame = () => {
        setScore(0); setCoins(0); setLives(3); setEggs([]); setEggsInBasket(0);
        setGameState('playing'); setBirdPos(1);
    };

    return (
        <div className="relative w-full h-[750px] bg-gradient-to-b from-[#00d2ff] via-[#4facfe] to-[#3a7bd5] rounded-[50px] overflow-hidden border-[12px] border-white/20 shadow-[-10px_40px_100px_rgba(0,0,0,0.5)] font-['Outfit'] select-none">

            <motion.div
                className="absolute inset-0"
                animate={{ x: [0, -shake, shake, 0], y: [0, shake, -shake, 0] }}
            >
                {/* 3D Parallax Cloud Background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ x: [-300, 1000] }}
                            transition={{ duration: 25 + i * 10, repeat: Infinity, ease: 'linear' }}
                            className="absolute bg-white/20 blur-[60px] rounded-full"
                            style={{ width: 400, height: 100, top: i * 120, left: i * 150 }}
                        />
                    ))}
                </div>

                {/* DYNAMIC ISLAND (Notch) - Fixes "Horrible" artifact by covering it with Pro aesthetics */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-black rounded-b-[2rem] z-[250] flex items-center justify-center shadow-2xl border-b border-x border-slate-800">
                    <div className="flex gap-3 items-center opacity-40">
                        <div className="w-3 h-3 rounded-full bg-indigo-900/50 box-inner-shadow" />
                        <div className="w-20 h-3 rounded-full bg-indigo-900/50 box-inner-shadow" />
                    </div>
                </div>

                {/* THE PARROT LAUNCHER (Lowered to avoid HUD) */}
                <div className="absolute top-28 left-0 right-0 z-10 pointer-events-none flex">
                    <NanoProParrot pos={birdPos} isDropping={isBirdDropping} direction={birdDirection} />
                </div>

                {/* PRO EGGS with SHADOWS */}
                <AnimatePresence>
                    {eggs.map(e => (
                        <div key={e.id} className="absolute w-full flex justify-around px-20" style={{ top: `${e.y}%` }}>
                            {e.options.map((opt, idx) => (
                                <div key={idx} className="relative flex-1 flex justify-center h-52">
                                    {!e.hit && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1, rotate: [0, 5, -5, 0] }}
                                            transition={{ rotate: { repeat: Infinity, duration: 2 } }}
                                            onClick={() => handleMove(idx)}
                                            className="relative w-36 h-44 flex items-center justify-center cursor-pointer pointer-events-auto group"
                                        >
                                            <img src="/assets/games/egg.png" alt="Egg" className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)] group-hover:scale-110 transition-transform" />
                                            <span className="relative z-10 text-6xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{opt}</span>
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </AnimatePresence>

                {/* PRO BASKET & CHICK */}
                <motion.div
                    className="absolute bottom-28 left-0 right-0 z-30 pointer-events-none flex"
                    animate={{ x: `${lane * 100}%` }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                >
                    <div className="w-1/3 flex justify-center">
                        <div className="relative w-48 h-48">
                            <motion.div className="relative w-full h-full">
                                <img src="/assets/games/basket.png" alt="Basket" className={`w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${isShielded ? 'opacity-40 grayscale' : ''}`} />
                                <div className="absolute inset-0 p-10 pt-16 flex flex-wrap-reverse justify-center content-start gap-1 overflow-hidden pointer-events-none">
                                    {[...Array(eggsInBasket)].map((_, i) => (
                                        <motion.div key={i} initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-6 h-8 bg-white border-2 border-yellow-100 rounded-full shadow-sm" />
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute -top-16 left-1/2 -translate-x-1/2 text-8xl drop-shadow-xl"
                            >
                                🐥
                            </motion.div>
                            <AnimatePresence>
                                {showReward && (
                                    <motion.div initial={{ y: 0, opacity: 0 }} animate={{ y: -200, opacity: 1 }} className="absolute -top-40 left-0 right-0 flex flex-col items-center">
                                        <div className="text-[10rem] animate-bounce drop-shadow-2xl">💰</div>
                                        <div className="bg-yellow-400 text-white px-10 py-4 lg:px-16 lg:py-6 rounded-full font-black text-4xl lg:text-5xl border-8 border-white shadow-2xl">¡+150 COINS!</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* SLEEK HUD: TOP LEFT (SCORE) */}
            <div className="absolute top-6 left-6 z-50 pointer-events-none">
                <div className="bg-black/20 backdrop-blur-xl px-10 py-4 rounded-[2rem] border-4 border-white/20 flex items-center gap-6 shadow-2xl">
                    <Trophy className="text-yellow-400 w-12 h-12" />
                    <span className="text-white text-5xl font-black">{score}</span>
                </div>
            </div>

            {/* SLEEK HUD: TOP RIGHT (COINS) */}
            <div className="absolute top-6 right-6 z-50 pointer-events-none">
                <div className="bg-black/20 backdrop-blur-xl px-10 py-4 rounded-[2rem] border-4 border-yellow-400/40 flex items-center gap-6 shadow-2xl">
                    <Coins className="text-amber-400 w-12 h-12 animate-bounce" />
                    <span className="text-white text-5xl font-black">{coins}</span>
                </div>
            </div>

            {/* SLEEK HUD: TOP CENTER (HEARTS) */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex gap-4">
                {[...Array(3)].map((_, i) => (
                    <motion.div key={i} animate={i < lives ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}>
                        <Heart className={`w-14 h-14 ${i < lives ? 'text-red-500 fill-red-500 drop-shadow-[0_0_15px_rgba(239, 68, 68, 0.5)]' : 'text-white/20'}`} />
                    </motion.div>
                ))}
            </div>

            {/* MATH DOCK: BOTTOM RIGHT */}
            <div className="absolute bottom-6 right-6 z-50 pointer-events-none">
                <motion.div
                    key={activeProblem}
                    initial={{ scale: 0.8, x: 100 }} animate={{ scale: 1, x: 0 }}
                    className="bg-white/95 px-12 py-8 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] border-8 border-emerald-500 flex items-center gap-6"
                >
                    <Target className="w-12 h-12 text-emerald-500 animate-spin-slow" />
                    <div className="text-emerald-900 text-6xl lg:text-8xl font-black italic tracking-tighter leading-none font-mono">
                        {activeProblem || "READY!"}
                    </div>
                </motion.div>
            </div>

            {/* PRAISE CHEER */}
            <AnimatePresence>
                {showCheer && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }} animate={{ x: 50, opacity: 1 }} exit={{ x: -300, opacity: 0 }}
                        className="absolute left-10 bottom-44 z-[60] flex items-center pointer-events-none"
                    >
                        <div className="relative">
                            <div className="absolute -top-24 left-20 bg-white text-emerald-600 px-12 py-5 rounded-[2.5rem] rounded-bl-none font-black text-5xl shadow-2xl border-4 border-emerald-500">{praiseText}</div>
                            <div className="w-48 h-48 rounded-full border-8 border-white bg-gradient-to-br from-yellow-200 to-white shadow-2xl flex items-center justify-center text-[10rem]">🐤</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* START SCREEN: COMPACTED FOR VISIBILITY */}
            {gameState === 'start' && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-800 to-sky-400 flex flex-col items-center justify-between z-[200] p-4 lg:p-8 text-center overflow-hidden py-12">

                    {/* Hero Image - Reduced Size */}
                    <img src="/assets/games/parrot.png" alt="Hero" className="w-40 h-40 lg:w-52 lg:h-52 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] animate-bounce mt-4" />

                    <div className="relative -mt-4">
                        <div className="absolute inset-0 bg-white/10 blur-xl rounded-full transform scale-150 opacity-50" />
                        <div className="relative bg-white/5 backdrop-blur-md border border-white/20 px-8 py-4 lg:px-12 lg:py-6 rounded-[2rem] shadow-2xl">
                            <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter drop-shadow-2xl leading-none">
                                ¡HUEVOS <span className="text-yellow-300">ESTELARES!</span>
                            </h1>
                        </div>
                    </div>

                    {/* Multiplier Grid - Compact */}
                    <div className="grid grid-cols-5 gap-3 lg:gap-4 bg-black/20 p-4 lg:p-6 rounded-[2rem] border-4 border-white/10 backdrop-blur-3xl">
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => (
                            <button
                                key={n}
                                onClick={(e) => { e.stopPropagation(); setMultiplier(n); playSound('move'); }}
                                className={`w-12 h-12 lg:w-16 lg:h-16 rounded-xl font-black text-2xl lg:text-4xl transition-all cursor-pointer pointer-events-auto shadow-lg border-2 ${multiplier === n ? 'bg-yellow-300 text-indigo-900 scale-110 border-white ring-4 ring-white' : 'bg-white text-indigo-500 border-transparent hover:scale-105'}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); startGame(); playSound('start'); }}
                        className="bg-emerald-500 text-white px-20 py-4 lg:px-32 lg:py-6 rounded-full text-4xl lg:text-6xl font-black shadow-[0_15px_0_#065f46] hover:translate-y-2 hover:shadow-none transition-all active:scale-95 border-b-0 border-[6px] border-white cursor-pointer pointer-events-auto mb-4"
                    >
                        ¡A VOLAR!
                    </button>
                </div>
            )}

            {/* GAME OVER: PERFECTED */}
            {gameState === 'gameover' && (
                <div className="absolute inset-0 bg-gradient-to-br from-rose-900 to-red-600 flex flex-col items-center justify-center z-[200] p-10 text-center text-white">
                    <div className="text-[18rem] mb-12 drop-shadow-2xl">🏆</div>
                    <h2 className="text-[10rem] lg:text-[14rem] font-black mb-10 tracking-tighter italic">¡ÉXITO TOTAL!</h2>
                    <div className="flex gap-16 bg-black/20 p-12 lg:p-16 rounded-[4rem] border-4 border-white/20 backdrop-blur-xl mb-16 shadow-2xl">
                        <div className="flex flex-col"><span className="text-3xl opacity-60">ATRAPADOS</span><span className="text-8xl lg:text-[12rem] font-black">{score / 10}</span></div>
                        <div className="flex flex-col border-l-4 border-white/20 pl-16"><span className="text-3xl opacity-60 text-yellow-300">MONEDAS</span><span className="text-8xl lg:text-[12rem] font-black text-yellow-300">{coins}</span></div>
                    </div>
                    <button onClick={startGame} className="bg-white text-rose-600 px-40 py-10 lg:py-14 rounded-full text-5xl lg:text-9xl font-black shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer pointer-events-auto border-8 border-rose-200">RELOG</button>
                </div>
            )}
        </div>
    );
};
