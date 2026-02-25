import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Block {
    id: string;
    emoji: string;
    x: number;
    y: number;
    group: 'initial' | 'action';
}

interface VirtualBlocksProps {
    initialAmount: number | string;
    actionAmount: number | string;
    action: string;
    itemEmoji?: string;
    secondaryEmoji?: string;
}

export const VirtualBlocks: React.FC<VirtualBlocksProps> = ({
    initialAmount,
    actionAmount,
    action,
    itemEmoji = '🟦',
    secondaryEmoji = '🟥'
}) => {
    const [blocks, setBlocks] = useState<Block[]>([]);

    useEffect(() => {
        const newBlocks: Block[] = [];

        // Helper to handle fraction strings like "3/4"
        const parseAmount = (val: any) => {
            const s = String(val);
            if (s.includes('/')) {
                const [num, den] = s.split('/').map(n => parseInt(n));
                if (!isNaN(num) && !isNaN(den) && den !== 0) {
                    // For CPA, if it's 3/4, maybe we show 4 blocks and the prompt tells them to pick 3?
                    // Or we show 12 blocks (multiple of den) to allow grouping.
                    // For now, let's just show the numerator blocks if we're in "Concrete" phase.
                    return num;
                }
            }
            return parseInt(s) || 0;
        };

        const safeInitial = Math.min(parseAmount(initialAmount), 50);
        const safeAction = Math.min(parseAmount(actionAmount), 50);

        // Generate initial pool
        for (let i = 0; i < safeInitial; i++) {
            newBlocks.push({
                id: `init-${i}`,
                emoji: itemEmoji,
                x: 20 + (i % 5) * 40,
                y: 20 + Math.floor(i / 5) * 40,
                group: 'initial'
            });
        }

        // Generate action pool
        for (let i = 0; i < safeAction; i++) {
            newBlocks.push({
                id: `act-${i}`,
                emoji: secondaryEmoji,
                x: 250 + (i % 5) * 40,
                y: 20 + Math.floor(i / 5) * 40,
                group: 'action'
            });
        }

        setBlocks(newBlocks);
    }, [initialAmount, actionAmount, itemEmoji, secondaryEmoji]);

    const handleDragEnd = (_e: any, info: any, id: string) => {
        setBlocks(prev => prev.map(b => {
            if (b.id === id) {
                return {
                    ...b,
                    x: b.x + info.offset.x,
                    y: b.y + info.offset.y
                }
            }
            return b;
        }));
    };

    return (
        <div className="w-full h-64 bg-slate-50 rounded-2xl border-4 border-dashed border-purple-200 relative overflow-hidden mt-4 mb-4 shadow-inner">
            <div className="absolute top-2 left-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Zona de Juego (Mueve los objetos)
            </div>

            {/* Draw zones depending on the action to help visual grouping */}
            <div className="absolute left-4 top-10 w-[200px] h-[180px] rounded-xl border-2 border-slate-200 bg-white/50" />
            <div className="absolute left-[240px] top-10 w-[200px] h-[180px] rounded-xl border-2 border-slate-200 bg-blue-50/50" />

            <AnimatePresence>
                {blocks.map(block => (
                    <motion.div
                        key={block.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, x: block.x, y: block.y }}
                        exit={{ scale: 0, opacity: 0 }}
                        drag
                        dragMomentum={false}
                        onDragEnd={(e, info) => handleDragEnd(e, info, block.id)}
                        whileHover={{ scale: 1.2, cursor: 'grab' }}
                        whileDrag={{ scale: 1.3, cursor: 'grabbing', zIndex: 100 }}
                        className="absolute text-4xl select-none filter drop-shadow-md top-0 left-0"
                    >
                        {block.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
