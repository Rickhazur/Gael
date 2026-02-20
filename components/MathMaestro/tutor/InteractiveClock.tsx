import React, { useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { sfx } from '../../../services/soundEffects';

interface InteractiveClockProps {
    targetHour: number;
    targetMinute: number;
    instruction: string;
    language: 'es' | 'en';
    onComplete: () => void;
}

export const InteractiveClock: React.FC<InteractiveClockProps> = ({
    targetHour,
    targetMinute,
    instruction,
    language,
    onComplete
}) => {
    const [currentHour, setCurrentHour] = useState(12);
    const [currentMinute, setCurrentMinute] = useState(0);
    const [isCorrect, setIsCorrect] = useState(false);

    const minuteRotation = useMotionValue(0);
    const hourRotation = useMotionValue(0);

    const handleMinuteDrag = (_: any, info: any) => {
        // Simplified rotation-to-time logic
        const rot = minuteRotation.get() % 360;
        const normalizedRot = rot < 0 ? 360 + rot : rot;
        const newMin = Math.round(normalizedRot / 6) % 60;
        setCurrentMinute(newMin);
    };

    const checkTime = () => {
        // Basic validation for target time
        if (currentHour === targetHour && currentMinute === targetMinute) {
            setIsCorrect(true);
            sfx.playSuccess();
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
            setTimeout(onComplete, 2000);
        } else {
            sfx.playPop();
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-blue-100 flex flex-col items-center gap-6 max-w-md mx-auto">
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-indigo-600">
                    <Clock className="w-5 h-5" />
                    <h3 className="font-fredoka font-bold text-xl uppercase tracking-wider">
                        {language === 'es' ? 'Aprende la Hora' : 'Learn the Time'}
                    </h3>
                </div>
                <p className="text-slate-600 font-medium">{instruction}</p>
            </div>

            <div className="relative w-64 h-64 bg-slate-50 rounded-full border-8 border-slate-800 shadow-inner flex items-center justify-center">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute font-bold text-slate-400"
                        style={{
                            transform: `rotate(${i * 30}deg) translateY(-100px) rotate(-${i * 30}deg)`
                        }}
                    >
                        {i === 0 ? 12 : i}
                    </div>
                ))}

                <motion.div
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    style={{ rotate: hourRotation }}
                    onDrag={() => {
                        const rot = (currentHour * 30);
                        hourRotation.set(rot);
                    }}
                    className="absolute w-2 h-20 bg-slate-800 rounded-full origin-bottom bottom-1/2 cursor-pointer z-10"
                />

                <motion.div
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    style={{ rotate: minuteRotation }}
                    onDrag={handleMinuteDrag}
                    className="absolute w-1.5 h-28 bg-indigo-500 rounded-full origin-bottom bottom-1/2 cursor-grab active:cursor-grabbing z-20"
                />

                <div className="w-4 h-4 bg-slate-900 rounded-full z-30 shadow-md" />
            </div>

            <div className="space-y-4 w-full text-center">
                <div className="bg-slate-800 text-white font-mono text-3xl px-6 py-3 rounded-2xl shadow-lg inline-flex items-center gap-2">
                    <span>{String(currentHour).padStart(2, '0')}</span>
                    <span className="animate-pulse">:</span>
                    <span>{String(currentMinute).padStart(2, '0')}</span>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-xl text-indigo-600 border-indigo-200 font-bold"
                        onClick={() => {
                            const nextHour = (currentHour % 12) + 1;
                            setCurrentHour(nextHour);
                            hourRotation.set(nextHour * 30);
                        }}
                    >
                        +1 h
                    </Button>
                    <Button
                        className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200"
                        onClick={checkTime}
                        disabled={isCorrect}
                    >
                        <Check className="mr-2 w-5 h-5" />
                        {language === 'es' ? 'Comprobar' : 'Check'}
                    </Button>
                </div>
            </div>

            {isCorrect && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-600 font-bold"
                >
                    {language === 'es' ? '¡Excelente! Has puesto la hora correcta.' : 'Excellent! You set the right time.'}
                </motion.div>
            )}
        </div>
    );
};
