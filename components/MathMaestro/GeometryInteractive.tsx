import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeometryInteractiveProps {
    problem: string;
    shape: 'rectangle' | 'circle' | 'triangle' | 'square';
    dimensions: { [key: string]: number };
    solutionSteps?: string[];
    onStepComplete?: (step: number) => void;
}

export const GeometryInteractive: React.FC<GeometryInteractiveProps> = ({
    problem,
    shape,
    dimensions,
    solutionSteps,
    onStepComplete
}) => {
    const [currentStep, setCurrentStep] = useState<'text' | 'shape' | 'formula' | 'solve'>('text');
    const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
    const [rotation, setRotation] = useState(0);
    const [scale, setScale] = useState(1);

    // Palabras clave por tipo de problema
    const keywords = {
        perimeter: ['perímetro', 'perimeter', 'largo', 'ancho', 'length', 'width'],
        area: ['área', 'area', 'superficie', 'surface'],
        volume: ['volumen', 'volume'],
        radius: ['radio', 'radius'],
        diameter: ['diámetro', 'diameter']
    };

    // Detectar tipo de problema
    const problemType = problem.toLowerCase().includes('perímetro') || problem.toLowerCase().includes('perimeter')
        ? 'perimeter'
        : problem.toLowerCase().includes('área') || problem.toLowerCase().includes('area')
            ? 'area'
            : 'perimeter';

    // Fórmulas según forma y tipo
    const formulas = {
        rectangle: {
            perimeter: 'P = 2(largo + ancho)',
            area: 'A = largo × ancho'
        },
        square: {
            perimeter: 'P = 4 × lado',
            area: 'A = lado²'
        },
        circle: {
            perimeter: 'P = 2πr',
            area: 'A = πr²'
        },
        triangle: {
            perimeter: 'P = a + b + c',
            area: 'A = (base × altura) ÷ 2'
        }
    };

    // Resaltar palabras clave progresivamente
    useEffect(() => {
        if (currentStep === 'text') {
            const relevantKeywords = keywords[problemType] || [];
            let index = 0;
            const interval = setInterval(() => {
                if (index < relevantKeywords.length) {
                    setHighlightedWords(prev => [...prev, relevantKeywords[index]]);
                    index++;
                } else {
                    clearInterval(interval);
                    setTimeout(() => setCurrentStep('shape'), 1000);
                }
            }, 800);
            return () => clearInterval(interval);
        }
    }, [currentStep, problemType]);

    // Renderizar texto con palabras resaltadas
    const renderHighlightedText = () => {
        const words = problem.split(' ');
        return (
            <div className="text-2xl font-bold text-slate-800 leading-relaxed">
                {words.map((word, idx) => {
                    const isHighlighted = highlightedWords.some(kw =>
                        word.toLowerCase().includes(kw.toLowerCase())
                    );
                    return (
                        <motion.span
                            key={idx}
                            className={`inline-block mx-1 ${isHighlighted ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500' : ''}`}
                            animate={isHighlighted ? {
                                scale: [1, 1.2, 1],
                                textShadow: ['0 0 0px rgba(6,182,212,0)', '0 0 20px rgba(6,182,212,0.8)', '0 0 0px rgba(6,182,212,0)']
                            } : {}}
                            transition={{ duration: 0.6 }}
                        >
                            {word}
                        </motion.span>
                    );
                })}
            </div>
        );
    };

    // Imagen 3D de la figura
    const shapeImages = {
        rectangle: '/assets/geometry/rectangle_3d.png',
        circle: '/assets/geometry/circle_3d.png',
        triangle: '/assets/geometry/triangle_3d.png',
        square: '/assets/geometry/square_3d.png'
    };

    return (
        <div className="relative w-full h-full min-h-[600px] bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 overflow-hidden">
            {/* Fondo animado */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-400 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8">
                {/* PASO 1: Texto con palabras resaltadas */}
                <AnimatePresence mode="wait">
                    {currentStep === 'text' && (
                        <motion.div
                            key="text"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-3xl text-center"
                        >
                            {renderHighlightedText()}
                        </motion.div>
                    )}

                    {/* PASO 2: Figura 3D interactiva */}
                    {currentStep === 'shape' && (
                        <motion.div
                            key="shape"
                            initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="relative"
                        >
                            <motion.img
                                src={shapeImages[shape]}
                                alt={shape}
                                className="w-96 h-96 object-contain cursor-grab active:cursor-grabbing"
                                style={{
                                    transform: `rotate(${rotation}deg) scale(${scale})`
                                }}
                                drag
                                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                whileHover={{ scale: 1.1 }}
                                onDrag={(_, info) => {
                                    setRotation(prev => prev + info.delta.x * 0.5);
                                }}
                            />

                            {/* Etiquetas de dimensiones */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-cyan-500 text-white px-4 py-2 rounded-full font-bold shadow-lg"
                            >
                                {Object.entries(dimensions).map(([key, value]) => (
                                    <span key={key} className="mx-2">
                                        {key}: {value} cm
                                    </span>
                                ))}
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                onClick={() => setCurrentStep('formula')}
                                className="mt-8 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                            >
                                Ver Fórmula 🧮
                            </motion.button>
                        </motion.div>
                    )}

                    {/* PASO 3: Fórmula */}
                    {currentStep === 'formula' && (
                        <motion.div
                            key="formula"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-8"
                        >
                            <motion.div
                                className="bg-white rounded-3xl p-12 shadow-2xl border-4 border-purple-400"
                                animate={{
                                    boxShadow: [
                                        '0 20px 60px rgba(168, 85, 247, 0.3)',
                                        '0 20px 80px rgba(168, 85, 247, 0.5)',
                                        '0 20px 60px rgba(168, 85, 247, 0.3)'
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                    {formulas[shape][problemType]}
                                </div>
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                onClick={() => setCurrentStep('solve')}
                                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                            >
                                ¡Vamos a Resolverlo! 🚀
                            </motion.button>
                        </motion.div>
                    )}

                    {/* PASO 4: Resolver paso a paso */}
                    {currentStep === 'solve' && (
                        <motion.div
                            key="solve"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full max-w-2xl"
                        >
                            <div className="bg-white rounded-3xl p-8 shadow-2xl">
                                <h3 className="text-3xl font-black text-slate-800 mb-6">
                                    Paso a Paso 📝
                                </h3>
                                <div className="space-y-4 text-xl">
                                    {solutionSteps && solutionSteps.length > 0 ? (
                                        solutionSteps.map((stepText, idx) => {
                                            const colors = [
                                                { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600' },
                                                { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
                                                { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
                                                { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' }
                                            ];
                                            const color = colors[idx % colors.length];
                                            return (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ x: -50, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: 0.2 + (idx * 0.2) }}
                                                    className={`p-4 ${color.bg} rounded-xl border-2 ${color.border}`}
                                                >
                                                    <span className={`font-bold ${color.text}`}>Paso {idx + 1}:</span> {stepText}
                                                </motion.div>
                                            );
                                        })
                                    ) : (
                                        <>
                                            <motion.div
                                                initial={{ x: -50, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="p-4 bg-cyan-50 rounded-xl border-2 border-cyan-200"
                                            >
                                                <span className="font-bold text-cyan-600">Paso 1:</span> Identifica los valores
                                            </motion.div>
                                            <motion.div
                                                initial={{ x: -50, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                                className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200"
                                            >
                                                <span className="font-bold text-purple-600">Paso 2:</span> Sustituye en la fórmula
                                            </motion.div>
                                            <motion.div
                                                initial={{ x: -50, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.6 }}
                                                className="p-4 bg-green-50 rounded-xl border-2 border-green-200"
                                            >
                                                <span className="font-bold text-green-600">Paso 3:</span> Calcula el resultado
                                            </motion.div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
