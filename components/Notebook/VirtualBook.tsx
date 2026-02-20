import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, BookOpen } from 'lucide-react';
import { sfx } from '@/services/soundEffects';

interface VirtualBookProps {
    pages: { front: React.ReactNode; back: React.ReactNode }[]; // Each item is a SHEET (2 pages)
    onClose: () => void;
    bookColor?: string;
    coverContent?: React.ReactNode;
}

export const VirtualBook: React.FC<VirtualBookProps> = ({
    pages,
    onClose,
    bookColor = '#4f46e5',
    coverContent
}) => {
    const [currentSheetIndex, setCurrentSheetIndex] = useState(-1);
    // -1 means no sheet flipped (Cover closed)
    // 0 means Cover flipped (Open index)
    // 1 means Sheet 1 flipped, etc.

    // Combine cover into pages array for uniform handling, or handle cover specially?
    // Let's handle cover as page[0] if provided, but caller manages data structure.

    const playFlipSound = () => {
        try {
            sfx.playPageFlip();
        } catch (e) {
            console.error("Audio error", e);
        }
    };

    const flipNext = () => {
        if (currentSheetIndex < pages.length - 1) {
            setCurrentSheetIndex(prev => prev + 1);
            playFlipSound();
        }
    };

    const flipPrev = () => {
        if (currentSheetIndex >= -1) {
            setCurrentSheetIndex(prev => prev - 1);
            playFlipSound();
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') flipNext();
            if (e.key === 'ArrowLeft') flipPrev();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSheetIndex]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8 perspective-[2000px] overflow-hidden">
            {/* Environment Background */}
            <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30 pointer-events-none" style={{ backgroundImage: 'url("/assets/backgrounds/wood-desk.jpg")' }} />

            {/* Controls */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/50 hover:text-white z-[70] transition-colors bg-black/20 hover:bg-red-500/80 rounded-full p-2"
                title="Cerrar libro"
            >
                <X className="w-8 h-8" />
            </button>

            {/* Navigation Arrows */}
            <div className="absolute inset-x-2 md:inset-x-12 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-[70]">
                <button
                    onClick={flipPrev}
                    disabled={currentSheetIndex < -1}
                    className={`p-4 rounded-full bg-slate-900/40 hover:bg-slate-800/80 backdrop-blur text-white shadow-xl transition-all pointer-events-auto transform hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none`}
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                    onClick={flipNext}
                    disabled={currentSheetIndex >= pages.length - 1}
                    className={`p-4 rounded-full bg-slate-900/40 hover:bg-slate-800/80 backdrop-blur text-white shadow-xl transition-all pointer-events-auto transform hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none`}
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            </div>

            {/* THE BOOK */}
            <div className="relative w-full max-w-[1100px] aspect-[1.4/1] md:aspect-[1.8/1] flex items-center justify-center z-10 transition-all duration-500"
                style={{
                    // Shift slightly right when closed, center when open?
                    // transform: currentSheetIndex === -1 ? 'translateX(25%)' : 'translateX(0)'
                    // Actually, centering spine is safest.
                }}
            >
                {/* Back Cover (Static Base) */}
                <div className="absolute top-2 bottom-2 left-[2%] right-[2%] bg-[#2a2a2a] rounded-lg shadow-2xl skew-y-1 transform translate-y-2 translate-x-1" />

                {/* Spine */}
                <div className="absolute top-0 bottom-0 left-1/2 w-8 -translate-x-1/2 rounded-l-sm bg-gradient-to-r from-neutral-800 to-neutral-600 z-0 shadow-inner" style={{ background: bookColor, filter: 'brightness(0.5)' }} />

                {/* Render Sheets */}
                {pages.map((sheet, index) => {
                    const isFlipped = index <= currentSheetIndex;
                    // Dynamic Z-Order Calculation
                    // If flipped (Left Stack): Bottom sheets have lower Z. Top flipped sheet (currentSheetIndex) has highest Z.
                    // If not flipped (Right Stack): Bottom sheets (higher index) have lower Z. Top not-flipped sheet (currentSheetIndex + 1) has highest Z.

                    let zIndex = 0;
                    if (isFlipped) {
                        zIndex = index; // 0, 1, 2...
                    } else {
                        zIndex = pages.length - index; // 10, 9, 8...
                    }

                    // Special: During transition we might want a boost, but standard z-index works if ordered correctly.

                    return (
                        <motion.div
                            key={index}
                            initial={false}
                            animate={{
                                rotateY: isFlipped ? -180 : 0,
                                z: isFlipped ? 1 : 0 // Tiny Z adjustment
                            }}
                            transition={{
                                duration: 0.6,
                                ease: [0.645, 0.045, 0.355, 1.000], // Cubic bezier for paper feel
                            }}
                            style={{
                                transformOrigin: 'left center',
                                transformStyle: 'preserve-3d',
                                position: 'absolute',
                                top: 0,
                                left: '50%', // Spine
                                width: '48%', // Leaves room for spine? No, standard flip visual.
                                height: '100%',
                                zIndex: zIndex,
                                backfaceVisibility: 'hidden', // Parent handles rotation? No. Children handle visibility.
                            }}
                            className="cursor-pointer"
                            onClick={() => {
                                if (isFlipped) flipPrev();
                                else flipNext();
                            }}
                        >
                            {/* FRONT FACE (Right Page) */}
                            <div
                                className="absolute inset-0 w-full h-full bg-[#fffef0] shadow-md border-l border-slate-200 overflow-hidden flex flex-col"
                                style={{
                                    backfaceVisibility: 'hidden',
                                    borderRadius: '0 12px 12px 0', // Rounded right edge
                                    zIndex: 2,
                                    // box shadow for depth
                                }}
                            >
                                {/* Paper Gradient Overlay for Curvature */}
                                <div className="absolute inset-0 bg-gradient-to-l from-black/5 to-transparent w-full h-full pointer-events-none z-10" />
                                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10" />

                                {sheet.front}
                            </div>

                            {/* BACK FACE (Left Page) */}
                            <div
                                className="absolute inset-0 w-full h-full bg-[#fffef0] shadow-md border-r border-slate-200 overflow-hidden flex flex-col"
                                style={{
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)',
                                    borderRadius: '12px 0 0 12px', // Rounded left edge
                                    zIndex: 1,
                                }}
                            >
                                {/* Paper Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent w-full h-full pointer-events-none z-10" />
                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent pointer-events-none z-10" />

                                {sheet.back}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Page Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1 rounded-full text-sm font-bold backdrop-blur">
                {currentSheetIndex + 2} / {pages.length * 2}
            </div>
        </div>
    );
};
