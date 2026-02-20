import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfx } from '../../../services/soundEffects';
import confetti from 'canvas-confetti';

interface ManipulableItem {
    id: string;
    emoji: string;
    label: string;
}

interface InteractivePlaygroundProps {
    items: ManipulableItem[];
    targetCount: number;
    instruction: string;
    onComplete: () => void;
    language: 'es' | 'en';
}

export const InteractivePlayground: React.FC<InteractivePlaygroundProps> = ({
    items,
    targetCount,
    instruction,
    onComplete,
    language
}) => {
    const [basketItems, setBasketItems] = useState<ManipulableItem[]>([]);
    const [availableItems, setAvailableItems] = useState<ManipulableItem[]>(items);

    // Play instruction on mount
    useEffect(() => {
        // Optional: Synthesis could speak the instruction here
    }, []);

    const handleDragEnd = (item: ManipulableItem, info: any) => {
        // Simple logic: if dropped below a certain Y point, it goes to basket
        if (info.point.y > 200) {
            addToBasket(item);
        }
    };

    const addToBasket = (item: ManipulableItem) => {
        sfx.playPop(); // Corrected method
        setBasketItems(prev => [...prev, item]);
        setAvailableItems(prev => prev.filter(i => i.id !== item.id));
    };

    useEffect(() => {
        if (basketItems.length === targetCount) {
            sfx.playSuccess(); // Corrected method
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            setTimeout(onComplete, 1500);
        }
    }, [basketItems, targetCount, onComplete]);

    return (
        <div className="w-full h-96 bg-blue-50/50 rounded-2xl border-2 border-blue-200 overflow-hidden relative flex flex-col">
            {/* Header Instruction */}
            <div className="p-4 bg-white/80 backdrop-blur text-center border-b border-blue-100 z-10">
                <h3 className="text-xl font-bold text-blue-600 font-fredoka">{instruction}</h3>
                <p className="text-sm text-slate-500">
                    {language === 'es' ? 'Arrastra a la canasta 👇' : 'Drag to the basket 👇'}
                </p>
            </div>

            {/* Shelf (Source) */}
            <div className="flex-1 p-6 flex flex-wrap gap-4 justify-center items-start content-start">
                <AnimatePresence>
                    {availableItems.map(item => (
                        <motion.div
                            key={item.id}
                            layoutId={item.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            drag
                            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, info) => addToBasket(item)}
                            whileHover={{ scale: 1.2, cursor: 'grab' }}
                            whileDrag={{ scale: 1.5, cursor: 'grabbing', zIndex: 50 }}
                            className="text-6xl select-none filter drop-shadow-xl"
                        >
                            {item.emoji}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Basket (Target) */}
            <div className="h-40 bg-orange-100 border-t-4 border-orange-300 relative flex items-center justify-center">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full font-bold shadow-lg">
                    {basketItems.length} / {targetCount}
                </div>

                <div className="flex flex-wrap gap-2 px-8">
                    <AnimatePresence>
                        {basketItems.map(item => (
                            <motion.div
                                key={item.id}
                                layoutId={item.id}
                                initial={{ scale: 0, y: -50 }}
                                animate={{ scale: 1, y: 0 }}
                                className="text-4xl"
                            >
                                {item.emoji}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
