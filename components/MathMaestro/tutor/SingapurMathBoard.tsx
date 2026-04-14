import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SingapurMathBoardProps {
    n1: number;
    n2: number;
    operator: '+' | '-';
    onComplete: (correct: boolean) => void;
    onClose: () => void;
    language?: 'es' | 'en';
}

type Phase = 'intro' | 'contar' | 'agrupar' | 'sumar' | 'manipular' | 'responder' | 'celebrar';

const CUBE_COLORS = {
    group1: { bg: '#DC2626', light: '#EF4444', shadow: '#991B1B', face: '#F87171' }, // Rojo
    group2: { bg: '#EAB308', light: '#FACC15', shadow: '#A16207', face: '#FDE047' }, // Amarillo
};

const SMILEY_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E', '#6366F1'];

/** 3D-ish Cube Component */
const Cube3D = ({ color, index, animate = true, size = 44, onClick, layoutId }: {
    color: typeof CUBE_COLORS.group1;
    index: number;
    animate?: boolean;
    size?: number;
    onClick?: () => void;
    layoutId?: string;
}) => (
    <motion.div
        layoutId={layoutId}
        initial={animate ? { scale: 0, rotate: -180 } : {}}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: index * 0.15, type: 'spring', stiffness: 300, damping: 15 }}
        whileHover={{ scale: 1.15, y: -4 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        style={{
            width: size,
            height: size,
            cursor: onClick ? 'pointer' : 'default',
            position: 'relative',
            transformStyle: 'preserve-3d',
        }}
        className="select-none"
    >
        {/* Top face */}
        <div style={{
            position: 'absolute',
            width: size,
            height: size * 0.3,
            top: 0,
            left: 0,
            background: `linear-gradient(135deg, ${color.light} 0%, ${color.bg} 100%)`,
            borderRadius: '6px 6px 0 0',
            transform: 'skewX(-25deg)',
            transformOrigin: 'bottom left',
            boxShadow: `inset 0 -2px 4px ${color.shadow}40`,
        }} />
        {/* Front face */}
        <div style={{
            position: 'absolute',
            width: size,
            height: size * 0.75,
            bottom: 0,
            left: 0,
            background: `linear-gradient(180deg, ${color.bg} 0%, ${color.shadow} 100%)`,
            borderRadius: '0 0 6px 6px',
            boxShadow: `0 4px 8px ${color.shadow}60, inset 0 1px 0 ${color.light}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {/* Shine */}
            <div style={{
                position: 'absolute',
                top: 4,
                left: 4,
                width: size * 0.3,
                height: size * 0.2,
                background: 'rgba(255,255,255,0.35)',
                borderRadius: '3px',
            }} />
        </div>
    </motion.div>
);

/** Smiley Counter */
const SmileyCounter = ({ filled, index, color }: { filled: boolean; index: number; color: string }) => (
    <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: filled ? 1 : 0.6, opacity: filled ? 1 : 0.2 }}
        transition={{ delay: filled ? index * 0.1 : 0, type: 'spring', stiffness: 400 }}
        style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: filled ? color : '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            boxShadow: filled ? `0 3px 10px ${color}60` : 'none',
            border: `2px solid ${filled ? color : '#d1d5db'}`,
        }}
    >
        {filled ? '😊' : ''}
    </motion.div>
);

/** Number Bar segment */
const NumberBarSegment = ({ number, highlighted, active, color }: {
    number: number;
    highlighted: boolean;
    active: boolean;
    color: string;
}) => (
    <motion.div
        animate={{
            backgroundColor: highlighted ? color : (active ? '#bfdbfe' : '#e5e7eb'),
            scale: highlighted ? 1.08 : 1,
        }}
        transition={{ duration: 0.3 }}
        style={{
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 800,
            color: highlighted ? '#fff' : (active ? '#1e40af' : '#9ca3af'),
            borderRight: '2px solid #d1d5db',
            borderRadius: number === 1 ? '10px 0 0 10px' : undefined,
        }}
    >
        {number}
    </motion.div>
);

export const SingapurMathBoard: React.FC<SingapurMathBoardProps> = ({
    n1, n2, operator, onComplete, onClose, language = 'es'
}) => {
    const [phase, setPhase] = useState<Phase>('intro');
    const [cubesJoined, setCubesJoined] = useState(false);
    const [movedCubes, setMovedCubes] = useState<number[]>([]);
    const [answer, setAnswer] = useState('');
    const [showError, setShowError] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const correctAnswer = operator === '+' ? n1 + n2 : n1 - n2;
    const maxNumber = Math.max(n1 + n2, 20); // For the number bar
    const barLength = Math.min(maxNumber, 20);

    const isEs = language === 'es';

    // Auto-advance phases with delays
    useEffect(() => {
        if (phase === 'intro') {
            const t = setTimeout(() => setPhase('contar'), 2500);
            return () => clearTimeout(t);
        }
        if (phase === 'contar') {
            const t = setTimeout(() => setPhase('agrupar'), 3000);
            return () => clearTimeout(t);
        }
        if (phase === 'agrupar') {
            const t = setTimeout(() => setPhase('sumar'), 2500);
            return () => clearTimeout(t);
        }
        if (phase === 'sumar') {
            const t = setTimeout(() => setPhase('manipular'), 2000);
            return () => clearTimeout(t);
        }
        if (phase === 'celebrar') {
            const t = setTimeout(() => onComplete(true), 4000);
            return () => clearTimeout(t);
        }
    }, [phase, onComplete]);

    // Focus input when reaching answer phase
    useEffect(() => {
        if (phase === 'responder') {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [phase]);

    const handleJoinCubes = () => {
        setCubesJoined(true);
        setTimeout(() => setPhase('responder'), 1500);
    };

    const handleMoveCube = (id: number) => {
        if (phase !== 'manipular' || cubesJoined) return;
        if (!movedCubes.includes(id)) {
            const newMoved = [...movedCubes, id];
            setMovedCubes(newMoved);
            // If all cubes have been moved...
            if (newMoved.length === n1 + n2) {
                setTimeout(() => handleJoinCubes(), 800);
            }
        }
    };

    const handleSubmitAnswer = () => {
        const num = parseInt(answer);
        if (num === correctAnswer) {
            setPhase('celebrar');
        } else {
            setShowError(true);
            setAttempts(a => a + 1);
            setTimeout(() => setShowError(false), 1500);
            if (attempts >= 2) {
                // After 3 attempts, show the answer
                setAnswer(String(correctAnswer));
                setTimeout(() => setPhase('celebrar'), 2000);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmitAnswer();
    };

    // Phase tab highlight
    const phaseIndex = ['intro', 'contar', 'agrupar', 'sumar', 'manipular', 'responder', 'celebrar'].indexOf(phase);
    const getPhaseTabActive = (tabPhase: number) => phaseIndex >= tabPhase;

    const robotMessage = () => {
        switch (phase) {
            case 'intro':
                return isEs ? `¡Hagamos un ejercicio!\n¿Cuánto es ${n1} ${operator} ${n2}?` : `Let's do an exercise!\nWhat is ${n1} ${operator} ${n2}?`;
            case 'contar':
                return isEs ? `¡Vamos a contar! Primero ${n1} cubos rojos, luego ${n2} amarillos.` : `Let's count! First ${n1} red cubes, then ${n2} yellow ones.`;
            case 'agrupar':
                return isEs ? '¡Muy bien! Ahora agrupemos los cubos juntos.' : 'Great! Now let\'s group the cubes together.';
            case 'sumar':
                return isEs ? `¿Cuánto es ${n1} ${operator === '+' ? 'más' : 'menos'} ${n2}?` : `What is ${n1} ${operator === '+' ? 'plus' : 'minus'} ${n2}?`;
            case 'manipular':
                return isEs ? '¡Toca o arrastra los cubos hacia la caja de la derecha para sumarlos todos!' : 'Tap or move the cubes to the right box to add them all!';
            case 'responder':
                return isEs ? '¡Ahora escribe la respuesta! ¿Cuántos cubos hay en total?' : 'Now write the answer! How many cubes are there in total?';
            case 'celebrar':
                return isEs ? `¡EXCELENTE! ${n1} ${operator} ${n2} = ${correctAnswer} 🎉` : `EXCELLENT! ${n1} ${operator} ${n2} = ${correctAnswer} 🎉`;
            default:
                return '';
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
        }}>
            <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                style={{
                    width: '96%',
                    maxWidth: 1100,
                    maxHeight: '94vh',
                    borderRadius: 32,
                    overflow: 'hidden',
                    boxShadow: '0 30px 100px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                }}
            >
                {/* === CHALKBOARD HEADER === */}
                <div style={{
                    background: 'linear-gradient(135deg, #1a5c2e 0%, #2d7a46 50%, #1a5c2e 100%)',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '4px solid #a0714f',
                    boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.3)',
                    position: 'relative',
                }}>
                    {/* Chalk dust texture */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'1\' height=\'1\' fill=\'rgba(255,255,255,0.05)\'/%3E%3C/svg%3E")',
                        pointerEvents: 'none',
                    }} />

                    <h1 style={{
                        color: 'white',
                        fontSize: 22,
                        fontWeight: 900,
                        fontStyle: 'italic',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                        fontFamily: "'Georgia', serif",
                        margin: 0,
                        position: 'relative',
                    }}>
                        {isEs ? 'Método Singapur – 1° de Primaria' : 'Singapore Method – 1st Grade'}
                    </h1>

                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            border: '2px solid rgba(255,255,255,0.3)',
                            color: 'white',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            fontSize: 20,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* === WOODEN DESK BODY === */}
                <div style={{
                    flex: 1,
                    background: 'linear-gradient(180deg, #f5e6d3 0%, #e8d5b8 30%, #dcc6a5 100%)',
                    padding: '20px 24px 24px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    position: 'relative',
                }}>
                    {/* Wood grain texture */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: `repeating-linear-gradient(
                            90deg,
                            transparent,
                            transparent 80px,
                            rgba(139,90,43,0.04) 80px,
                            rgba(139,90,43,0.04) 82px
                        )`,
                        pointerEvents: 'none',
                    }} />

                    {/* === TOP ROW: Robot + Phase Tabs + Step Preview === */}
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>

                        {/* Robot Tutor */}
                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    width: 90,
                                    height: 90,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 6px 20px rgba(59,130,246,0.3)',
                                    border: '3px solid #93c5fd',
                                    overflow: 'hidden'
                                }}
                            >
                                <img src="/avatars/g1_robot.png" alt="Robot Tutor" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
                            </motion.div>
                            <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Nova</span>
                        </div>

                        {/* Speech Bubble */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <motion.div
                                key={phase}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    background: 'white',
                                    borderRadius: 18,
                                    padding: '12px 18px',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                    border: '2px solid #e2e8f0',
                                    position: 'relative',
                                    fontSize: 15,
                                    lineHeight: 1.4,
                                    fontWeight: 700,
                                    color: '#334155',
                                }}
                            >
                                {/* Triangle pointer */}
                                <div style={{
                                    position: 'absolute',
                                    left: -10,
                                    top: 14,
                                    width: 0,
                                    height: 0,
                                    borderTop: '8px solid transparent',
                                    borderBottom: '8px solid transparent',
                                    borderRight: '10px solid white',
                                }} />
                                {robotMessage().split('\n').map((line, i) => (
                                    <div key={i}>{line.includes(`${n1}`) ? (
                                        <>
                                            {line.split(/(\d+)/).map((part, j) => (
                                                <span key={j} style={/\d+/.test(part) ? { color: '#2563eb', fontWeight: 900, fontSize: 18 } : {}}>
                                                    {part}
                                                </span>
                                            ))}
                                        </>
                                    ) : line}</div>
                                ))}
                            </motion.div>

                            {/* Phase Tabs */}
                            <div style={{ display: 'flex', gap: 8 }}>
                                {[
                                    { label: isEs ? '1. Contar' : '1. Count', color: '#3b82f6', phase: 1 },
                                    { label: isEs ? '2. Agrupar' : '2. Group', color: '#f97316', phase: 2 },
                                    { label: isEs ? '3. Sumar' : '3. Add', color: '#22c55e', phase: 3 },
                                ].map(tab => (
                                    <motion.div
                                        key={tab.label}
                                        animate={{
                                            backgroundColor: getPhaseTabActive(tab.phase) ? tab.color : '#e5e7eb',
                                            scale: getPhaseTabActive(tab.phase) ? 1.03 : 1,
                                        }}
                                        style={{
                                            padding: '8px 14px',
                                            borderRadius: 10,
                                            fontSize: 13,
                                            fontWeight: 800,
                                            color: getPhaseTabActive(tab.phase) ? 'white' : '#94a3b8',
                                            boxShadow: getPhaseTabActive(tab.phase) ? `0 3px 10px ${tab.color}40` : 'none',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        {tab.label}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Step preview: small cubes showing the concept */}
                        <div style={{
                            flexShrink: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            background: 'white',
                            borderRadius: 16,
                            padding: '10px 14px',
                            border: '2px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        }}>
                            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                {Array.from({ length: n1 }).map((_, i) => (
                                    <div key={`p1-${i}`} style={{ width: 14, height: 14, borderRadius: 3, background: CUBE_COLORS.group1.bg }} />
                                ))}
                                <span style={{ fontSize: 12, fontWeight: 900, color: '#64748b', margin: '0 2px' }}>+</span>
                                {Array.from({ length: n2 }).map((_, i) => (
                                    <div key={`p2-${i}`} style={{ width: 14, height: 14, borderRadius: 3, background: CUBE_COLORS.group2.bg }} />
                                ))}
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 900, color: '#1e293b' }}>
                                {n1}{operator === '+' ? '+' : '-'}{n2}=<span style={{ color: '#DC2626', fontSize: 22 }}>?</span>
                            </div>
                        </div>
                    </div>

                    {/* === MAIN INTERACTIVE AREA === */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16, position: 'relative', zIndex: 5 }}>

                        {/* Left: Unite the Cubes */}
                        <div style={{
                            background: 'white',
                            borderRadius: 20,
                            padding: 20,
                            border: '2px dashed #94a3b8',
                            minHeight: 180,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 12,
                        }}>
                            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
                                {isEs ? 'Une los Cubos' : 'Join the Cubes'}
                            </h3>

                            <AnimatePresence mode="wait">
                                {!cubesJoined ? (
                                    <motion.div
                                        key="separate"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        style={{ display: 'flex', gap: 24, width: '100%', justifyContent: 'space-around', alignItems: 'center' }}
                                    >
                                        {/* Left Side: Cubes to move */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', background: '#f8fafc', padding: 16, borderRadius: 16, flex: 1 }}>
                                            <span style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8' }}>{isEs ? 'INICIO' : 'START'}</span>
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                                                {Array.from({ length: n1 }).map((_, i) => !movedCubes.includes(i) && (
                                                    <Cube3D key={`g1-${i}`} layoutId={`cube-1-${i}`} color={CUBE_COLORS.group1} index={i} animate={phaseIndex >= 1} onClick={phase === 'manipular' ? () => handleMoveCube(i) : undefined} />
                                                ))}
                                                {Array.from({ length: n2 }).map((_, i) => !movedCubes.includes(i + n1) && (
                                                    <Cube3D key={`g2-${i}`} layoutId={`cube-2-${i}`} color={CUBE_COLORS.group2} index={i + n1} animate={phaseIndex >= 1} onClick={phase === 'manipular' ? () => handleMoveCube(i + n1) : undefined} />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right Side: Added cubes dropzone */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', background: phase === 'manipular' ? '#f0fdf4' : '#f8fafc', border: phase === 'manipular' ? '3px dashed #86efac' : '3px dashed transparent', padding: 16, borderRadius: 16, flex: 1, minHeight: 120 }}>
                                            <span style={{ fontSize: 12, fontWeight: 800, color: '#22c55e' }}>{isEs ? 'CAJA DE SUMA (DERECHA)' : 'SUM BOX (RIGHT)'}</span>
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                                                {Array.from({ length: n1 }).map((_, i) => movedCubes.includes(i) && (
                                                    <Cube3D key={`g1-moved-${i}`} layoutId={`cube-1-${i}`} color={CUBE_COLORS.group1} index={i} size={40} />
                                                ))}
                                                {Array.from({ length: n2 }).map((_, i) => movedCubes.includes(i + n1) && (
                                                    <Cube3D key={`g2-moved-${i}`} layoutId={`cube-2-${i}`} color={CUBE_COLORS.group2} index={i + n1} size={40} />
                                                ))}
                                            </div>
                                            {movedCubes.length === 0 && phase === 'manipular' && (
                                                <div style={{ color: '#bbf7d0', fontWeight: 800, fontSize: 13, textAlign: 'center', marginTop: 10 }}>DALE CLIC A LOS<br />CUBOS PARA MOVERLOS</div>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="joined"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', background: '#dcfce7', padding: 20, borderRadius: 24, border: '4px solid #4ade80' }}
                                    >
                                        {Array.from({ length: n1 }).map((_, i) => (
                                            <Cube3D key={`j1-${i}`} layoutId={`cube-1-${i}`} color={CUBE_COLORS.group1} index={i} animate size={40} />
                                        ))}
                                        {Array.from({ length: n2 }).map((_, i) => (
                                            <Cube3D key={`j2-${i}`} layoutId={`cube-2-${i}`} color={CUBE_COLORS.group2} index={i} animate size={40} />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Equation below cubes */}
                            <div style={{
                                fontSize: 28,
                                fontWeight: 900,
                                color: '#1e293b',
                                fontFamily: "'Courier New', monospace",
                            }}>
                                {n1} {operator} {n2} = {cubesJoined ? (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        style={{ color: '#16a34a', fontSize: 32 }}
                                    >
                                        {correctAnswer}
                                    </motion.span>
                                ) : (
                                    <span style={{ color: '#DC2626' }}>?</span>
                                )}
                            </div>
                        </div>

                        {/* Right: Contadores (10-Frame) */}
                        <div style={{
                            background: 'white',
                            borderRadius: 20,
                            padding: 16,
                            border: '2px dashed #94a3b8',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
                                {isEs ? 'Contadores' : 'Counters'}
                            </h3>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(5, 1fr)',
                                gap: 4,
                                padding: 8,
                                background: '#f8fafc',
                                borderRadius: 12,
                                border: '2px solid #e2e8f0',
                            }}>
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <SmileyCounter
                                        key={i}
                                        filled={phaseIndex >= 1 && i < (cubesJoined ? correctAnswer : (phaseIndex >= 2 ? n1 + n2 : n1))}
                                        index={i}
                                        color={i < n1 ? SMILEY_COLORS[0] : SMILEY_COLORS[3]}
                                    />
                                ))}
                            </div>

                            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textAlign: 'center' }}>
                                {cubesJoined ? `${correctAnswer} / 10` : phaseIndex >= 2 ? `${n1}+${n2} / 10` : `${n1} / 10`}
                            </div>
                        </div>
                    </div>

                    {/* === BOTTOM ROW: Number Bar + Answer === */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, position: 'relative', zIndex: 5 }}>

                        {/* Number Bar */}
                        <div style={{
                            background: 'white',
                            borderRadius: 20,
                            padding: 16,
                            border: '2px dashed #94a3b8',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
                                {isEs ? 'Barra Numérica' : 'Number Bar'}
                            </h3>

                            <div style={{
                                display: 'flex',
                                borderRadius: 12,
                                overflow: 'hidden',
                                border: '2px solid #d1d5db',
                                background: '#f1f5f9',
                            }}>
                                {Array.from({ length: Math.min(barLength, 15) }).map((_, i) => {
                                    const num = i + 1;
                                    const isN1Zone = num <= n1;
                                    const isN2Zone = num > n1 && num <= n1 + n2;
                                    const isHighlighted = cubesJoined ? (num <= correctAnswer) : (phaseIndex >= 1 ? isN1Zone || (phaseIndex >= 2 && isN2Zone) : false);
                                    const color = isN1Zone ? '#3b82f6' : '#22c55e';

                                    return (
                                        <NumberBarSegment
                                            key={num}
                                            number={num}
                                            highlighted={isHighlighted}
                                            active={num <= correctAnswer}
                                            color={color}
                                        />
                                    );
                                })}
                            </div>

                            {/* Cubes on top of bar */}
                            {phaseIndex >= 2 && (
                                <div style={{ display: 'flex', gap: 2, marginTop: -4 }}>
                                    {Array.from({ length: n1 }).map((_, i) => (
                                        <motion.div
                                            key={`bar-r-${i}`}
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.08 }}
                                            style={{ width: 18, height: 18, borderRadius: 3, background: CUBE_COLORS.group1.bg }}
                                        />
                                    ))}
                                    {Array.from({ length: n2 }).map((_, i) => (
                                        <motion.div
                                            key={`bar-y-${i}`}
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: (n1 + i) * 0.08 }}
                                            style={{ width: 18, height: 18, borderRadius: 3, background: CUBE_COLORS.group2.bg }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Write your answer */}
                        <div style={{
                            background: 'white',
                            borderRadius: 20,
                            padding: 16,
                            border: phase === 'responder' ? '3px solid #3b82f6' : '2px dashed #94a3b8',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: phase === 'responder' ? '0 0 20px rgba(59,130,246,0.2)' : 'none',
                            transition: 'all 0.3s',
                        }}>
                            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
                                {isEs ? 'Escribe la Respuesta' : 'Write the Answer'}
                            </h3>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 28, fontWeight: 900, color: '#1e293b' }}>
                                <span>{n1}</span>
                                <span style={{ color: '#6366f1' }}>{operator}</span>
                                <span>{n2}</span>
                                <span>=</span>
                                <motion.div
                                    animate={showError ? { x: [-4, 4, -4, 4, 0] } : {}}
                                    transition={{ duration: 0.3 }}
                                >
                                    <input
                                        ref={inputRef}
                                        type="number"
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        disabled={phase === 'celebrar'}
                                        style={{
                                            width: 60,
                                            height: 50,
                                            textAlign: 'center',
                                            fontSize: 28,
                                            fontWeight: 900,
                                            border: `3px solid ${showError ? '#ef4444' : phase === 'celebrar' ? '#22c55e' : '#3b82f6'}`,
                                            borderRadius: 12,
                                            outline: 'none',
                                            color: phase === 'celebrar' ? '#16a34a' : '#1e293b',
                                            background: phase === 'celebrar' ? '#dcfce7' : showError ? '#fef2f2' : '#eff6ff',
                                            boxShadow: showError ? '0 0 12px rgba(239,68,68,0.3)' : phase === 'celebrar' ? '0 0 12px rgba(34,197,94,0.3)' : '0 0 12px rgba(59,130,246,0.2)',
                                        }}
                                        placeholder="?"
                                    />
                                </motion.div>
                            </div>

                            {phase === 'responder' && (
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    onClick={handleSubmitAnswer}
                                    style={{
                                        padding: '10px 24px',
                                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 12,
                                        fontSize: 14,
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(34,197,94,0.4)',
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                    }}
                                >
                                    ✓ {isEs ? 'COMPROBAR' : 'CHECK'}
                                </motion.button>
                            )}

                            {showError && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ color: '#ef4444', fontWeight: 700, fontSize: 13, margin: 0 }}
                                >
                                    {isEs ? '¡Inténtalo de nuevo! Cuenta los cubos.' : 'Try again! Count the cubes.'}
                                </motion.p>
                            )}
                        </div>
                    </div>

                    {/* === CELEBRATION OVERLAY === */}
                    <AnimatePresence>
                        {phase === 'celebrar' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(255,255,255,0.85)',
                                    backdropFilter: 'blur(8px)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 16,
                                    zIndex: 50,
                                    borderRadius: 20,
                                }}
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    style={{ fontSize: 72 }}
                                >
                                    🎉
                                </motion.div>
                                <motion.h2
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    style={{
                                        fontSize: 36,
                                        fontWeight: 900,
                                        background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        textAlign: 'center',
                                    }}
                                >
                                    {isEs ? '¡EXCELENTE!' : 'EXCELLENT!'}
                                </motion.h2>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    style={{
                                        fontSize: 48,
                                        fontWeight: 900,
                                        color: '#1e293b',
                                        fontFamily: "'Courier New', monospace",
                                        background: 'linear-gradient(135deg, #dbeafe, #ede9fe)',
                                        padding: '12px 32px',
                                        borderRadius: 20,
                                        border: '3px solid #6366f1',
                                        boxShadow: '0 8px 30px rgba(99,102,241,0.2)',
                                    }}
                                >
                                    {n1} {operator} {n2} = {correctAnswer}
                                </motion.div>

                                {/* Confetti particles */}
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{
                                            x: 0,
                                            y: 0,
                                            opacity: 1,
                                        }}
                                        animate={{
                                            x: (Math.random() - 0.5) * 600,
                                            y: (Math.random() - 0.5) * 400,
                                            opacity: 0,
                                            rotate: Math.random() * 720,
                                        }}
                                        transition={{ duration: 2, delay: i * 0.05, ease: 'easeOut' }}
                                        style={{
                                            position: 'absolute',
                                            width: 12,
                                            height: 12,
                                            borderRadius: Math.random() > 0.5 ? '50%' : 2,
                                            background: SMILEY_COLORS[i % SMILEY_COLORS.length],
                                        }}
                                    />
                                ))}

                                <motion.button
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    onClick={() => onComplete(true)}
                                    style={{
                                        padding: '14px 32px',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 16,
                                        fontSize: 16,
                                        fontWeight: 900,
                                        cursor: 'pointer',
                                        boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                    }}
                                >
                                    🚀 {isEs ? '¡SIGUIENTE EJERCICIO!' : 'NEXT EXERCISE!'}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Decorative elements */}
                    <div style={{
                        position: 'absolute',
                        bottom: 16,
                        right: 20,
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 6,
                        opacity: 0.7,
                        pointerEvents: 'none',
                    }}>
                        <div style={{ fontSize: 24 }}>📚</div>
                        <div style={{ fontSize: 20 }}>✏️</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SingapurMathBoard;
