import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CarryOverHint {
    id: string;
    position: number;      // Columna donde ocurre (0 = unidades, 1 = decenas, etc.)
    value: number;         // Valor que se lleva o presta
    type: 'carry' | 'borrow';
    operation: 'addition' | 'subtraction' | 'multiplication' | 'division';
    explanation: string;   // "8 + 5 = 13, escribo 3 y llevo 1"
    detailedExplanation: string; // Explicación más larga para modo detallado
}

interface CarryOverBubbleProps {
    hint: CarryOverHint;
    showDetailed: boolean;
    columnWidth: number;   // Ancho de cada columna en píxeles
    topOffset?: number;    // Offset desde arriba
}

export const CarryOverBubble: React.FC<CarryOverBubbleProps> = ({
    hint,
    showDetailed,
    columnWidth,
    topOffset = -60
}) => {
    // Calcular posición horizontal basada en la columna
    const leftPosition = hint.position * columnWidth;

    // Colores según el tipo de operación
    const colors = {
        carry: {
            bg: 'bg-purple-100',
            border: 'border-purple-400',
            text: 'text-purple-700',
            textLight: 'text-purple-600'
        },
        borrow: {
            bg: 'bg-orange-100',
            border: 'border-orange-400',
            text: 'text-orange-700',
            textLight: 'text-orange-600'
        }
    };

    const colorScheme = colors[hint.type];

    // Emoji según el tipo
    const emoji = hint.type === 'carry' ? '⬆️' : '⬇️';

    return (
        <AnimatePresence>
            <motion.div
                key={hint.id}
                className={`absolute ${colorScheme.bg} ${colorScheme.border} border-2 rounded-2xl shadow-lg pointer-events-none z-50`}
                style={{
                    left: `${leftPosition}px`,
                    top: `${topOffset}px`,
                    minWidth: showDetailed ? '200px' : '40px',
                }}
                initial={{ scale: 0, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: -10 }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                }}
            >
                {showDetailed ? (
                    // Modo detallado: Explicación completa
                    <div className="p-3 space-y-1">
                        <div className={`text-sm font-bold ${colorScheme.text} flex items-center gap-1`}>
                            <span>{emoji}</span>
                            <span>
                                {hint.type === 'carry' ? 'Me llevo' : 'Pido prestado'} {hint.value}
                            </span>
                        </div>
                        <div className={`text-xs ${colorScheme.textLight}`}>
                            {hint.explanation}
                        </div>
                        {hint.detailedExplanation && (
                            <div className={`text-xs ${colorScheme.textLight} italic mt-1 pt-1 border-t ${colorScheme.border}`}>
                                💡 {hint.detailedExplanation}
                            </div>
                        )}
                    </div>
                ) : (
                    // Modo compacto: Solo el número
                    <div className="p-2 flex items-center justify-center">
                        <span className={`text-lg font-black ${colorScheme.text}`}>
                            {hint.value}
                        </span>
                    </div>
                )}

                {/* Flecha apuntando hacia abajo */}
                <div
                    className={`absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 ${colorScheme.border.replace('border-', 'border-t-')} border-l-transparent border-r-transparent`}
                />
            </motion.div>
        </AnimatePresence>
    );
};

// Componente contenedor para múltiples hints
interface CarryOverLayerProps {
    hints: CarryOverHint[];
    showDetailed: boolean;
    columnWidth: number;
    containerRef?: React.RefObject<HTMLDivElement>;
}

export const CarryOverLayer: React.FC<CarryOverLayerProps> = ({
    hints,
    showDetailed,
    columnWidth,
    containerRef
}) => {
    return (
        <div className="absolute inset-0 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {hints.map((hint) => (
                    <CarryOverBubble
                        key={hint.id}
                        hint={hint}
                        showDetailed={showDetailed}
                        columnWidth={columnWidth}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};
