import React, { useState, useRef } from 'react';
import { CarryOverLayer, CarryOverHint } from './CarryOverBubble';
import { generateOperationHints } from './operationHelpers';
import { ExplanationToggle } from './ExplanationToggle';
import { motion } from 'framer-motion';

/**
 * Componente de demostración del sistema de explicaciones visuales
 * Muestra ejemplos de todas las operaciones con llevadas/préstamos
 */
export const MathExplanationDemo: React.FC = () => {
    const [showDetailed, setShowDetailed] = useState(true);
    const [currentOperation, setCurrentOperation] = useState<'addition' | 'subtraction' | 'multiplication' | 'division'>('addition');
    const [hints, setHints] = useState<CarryOverHint[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Ejemplos predefinidos para cada operación
    const examples = {
        addition: { num1: '387', num2: '245', result: '632' },
        subtraction: { num1: '532', num2: '178', result: '354' },
        multiplication: { num1: '47', num2: '8', result: '376' },
        division: { num1: '156', num2: 12, result: '13' }
    };

    const loadExample = (operation: typeof currentOperation) => {
        setCurrentOperation(operation);
        const example = examples[operation];
        const detectedHints = generateOperationHints(operation, example.num1, example.num2);

        // Para multiplicación multi-dígito, aplanar el array
        if (Array.isArray(detectedHints[0])) {
            setHints((detectedHints as CarryOverHint[][]).flat());
        } else {
            setHints(detectedHints as CarryOverHint[]);
        }
    };

    const renderOperation = () => {
        const example = examples[currentOperation];
        const columnWidth = 60;

        switch (currentOperation) {
            case 'addition':
                return (
                    <div className="relative" ref={containerRef}>
                        <div className="text-5xl font-mono text-center space-y-2 py-16">
                            <div className="flex justify-end pr-8">
                                {example.num1.split('').map((digit, i) => (
                                    <span key={i} className="inline-block w-16 text-center">{digit}</span>
                                ))}
                            </div>
                            <div className="flex justify-end pr-8">
                                <span className="inline-block w-16 text-center">+</span>
                                {example.num2.split('').map((digit, i) => (
                                    <span key={i} className="inline-block w-16 text-center">{digit}</span>
                                ))}
                            </div>
                            <div className="border-t-4 border-slate-700 mx-auto w-64"></div>
                            <div className="flex justify-end pr-8 text-slate-400">
                                {example.result.split('').map((digit, i) => (
                                    <span key={i} className="inline-block w-16 text-center">{digit}</span>
                                ))}
                            </div>
                        </div>
                        <CarryOverLayer
                            hints={hints}
                            showDetailed={showDetailed}
                            columnWidth={columnWidth}
                            containerRef={containerRef}
                        />
                    </div>
                );

            case 'subtraction':
                return (
                    <div className="relative" ref={containerRef}>
                        <div className="text-5xl font-mono text-center space-y-2 py-16">
                            <div className="flex justify-end pr-8">
                                {example.num1.split('').map((digit, i) => (
                                    <span key={i} className="inline-block w-16 text-center">{digit}</span>
                                ))}
                            </div>
                            <div className="flex justify-end pr-8">
                                <span className="inline-block w-16 text-center">-</span>
                                {example.num2.split('').map((digit, i) => (
                                    <span key={i} className="inline-block w-16 text-center">{digit}</span>
                                ))}
                            </div>
                            <div className="border-t-4 border-slate-700 mx-auto w-64"></div>
                            <div className="flex justify-end pr-8 text-slate-400">
                                {example.result.split('').map((digit, i) => (
                                    <span key={i} className="inline-block w-16 text-center">{digit}</span>
                                ))}
                            </div>
                        </div>
                        <CarryOverLayer
                            hints={hints}
                            showDetailed={showDetailed}
                            columnWidth={columnWidth}
                            containerRef={containerRef}
                        />
                    </div>
                );

            case 'multiplication':
                return (
                    <div className="relative" ref={containerRef}>
                        <div className="text-5xl font-mono text-center space-y-2 py-16">
                            <div className="flex justify-end pr-8">
                                {example.num1.split('').map((digit, i) => (
                                    <span key={i} className="inline-block w-16 text-center">{digit}</span>
                                ))}
                            </div>
                            <div className="flex justify-end pr-8">
                                <span className="inline-block w-16 text-center">×</span>
                                {example.num2.toString().split('').map((digit, i) => (
                                    <span key={i} className="inline-block w-16 text-center">{digit}</span>
                                ))}
                            </div>
                            <div className="border-t-4 border-slate-700 mx-auto w-64"></div>
                            <div className="flex justify-end pr-8 text-slate-400">
                                {example.result.split('').map((digit, i) => (
                                    <span key={i} className="inline-block w-16 text-center">{digit}</span>
                                ))}
                            </div>
                        </div>
                        <CarryOverLayer
                            hints={hints}
                            showDetailed={showDetailed}
                            columnWidth={columnWidth}
                            containerRef={containerRef}
                        />
                    </div>
                );

            case 'division':
                return (
                    <div className="relative" ref={containerRef}>
                        <div className="text-4xl font-mono text-center py-16">
                            <div className="flex items-center justify-center gap-4">
                                <span>{example.num1}</span>
                                <span>÷</span>
                                <span>{example.num2}</span>
                                <span>=</span>
                                <span className="text-slate-400">{example.result}</span>
                            </div>
                        </div>
                        <CarryOverLayer
                            hints={hints}
                            showDetailed={showDetailed}
                            columnWidth={80}
                            containerRef={containerRef}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-slate-800 mb-2">
                        🎯 Sistema de Explicaciones Visuales
                    </h1>
                    <p className="text-lg text-slate-600">
                        Llevadas y Préstamos Explicados Paso a Paso
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex justify-center mb-8">
                    <ExplanationToggle
                        showDetailed={showDetailed}
                        onToggle={() => setShowDetailed(!showDetailed)}
                    />
                </div>

                {/* Operation Selector */}
                <div className="flex justify-center gap-4 mb-8">
                    {(['addition', 'subtraction', 'multiplication', 'division'] as const).map((op) => (
                        <motion.button
                            key={op}
                            onClick={() => loadExample(op)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${currentOperation === op
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                    : 'bg-white text-slate-700 hover:bg-slate-100'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {op === 'addition' && '➕ Suma'}
                            {op === 'subtraction' && '➖ Resta'}
                            {op === 'multiplication' && '✖️ Multiplicación'}
                            {op === 'division' && '➗ División'}
                        </motion.button>
                    ))}
                </div>

                {/* Operation Display */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
                    {renderOperation()}
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-100 border-2 border-purple-400 rounded-2xl p-6">
                        <div className="text-2xl font-bold text-purple-700 mb-2">
                            ⬆️ Llevadas (Morado)
                        </div>
                        <p className="text-purple-600">
                            Cuando la suma o multiplicación es ≥ 10, "llevamos" el exceso a la siguiente columna.
                        </p>
                    </div>
                    <div className="bg-orange-100 border-2 border-orange-400 rounded-2xl p-6">
                        <div className="text-2xl font-bold text-orange-700 mb-2">
                            ⬇️ Préstamos (Naranja)
                        </div>
                        <p className="text-orange-600">
                            Cuando el número de arriba es menor, "pedimos prestado" 10 de la siguiente columna.
                        </p>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-gradient-to-r from-cyan-100 to-blue-100 border-2 border-cyan-400 rounded-2xl p-6">
                    <div className="text-xl font-bold text-cyan-800 mb-3">
                        💡 Cómo usar este sistema:
                    </div>
                    <ul className="space-y-2 text-cyan-700">
                        <li>✅ <strong>Modo Detallado:</strong> Muestra explicaciones completas paso a paso</li>
                        <li>✅ <strong>Modo Compacto:</strong> Solo muestra los números (para estudiantes avanzados)</li>
                        <li>✅ <strong>Colores:</strong> Morado = Llevadas, Naranja = Préstamos</li>
                        <li>✅ <strong>Animaciones:</strong> Las burbujas aparecen suavemente para no distraer</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
