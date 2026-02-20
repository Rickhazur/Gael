
import React from 'react';
import { motion } from 'framer-motion';

interface ChronosAvatarProps {
    state?: 'idle' | 'narrating' | 'thinking';
    size?: number;
}

export const ChronosAvatar: React.FC<ChronosAvatarProps> = ({ state = 'idle', size = 120 }) => {
    const isNarrating = state === 'narrating';

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Outer Glow */}
            <AnimatePresence>
                {isNarrating && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1.1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl"
                    />
                )}
            </AnimatePresence>

            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                {/* Head Structure - More angular, protocol droid style */}
                <motion.path
                    d="M60,40 L140,40 L150,80 L140,140 L60,140 L50,80 Z"
                    fill="url(#stellar-gradient)" // Cosmic Gradient
                    stroke="#D4AF37" // Gold border
                    strokeWidth="4"
                    initial={{ y: 0 }}
                    animate={{ y: state === 'thinking' ? [0, -5, 0] : 0 }}
                    transition={{ duration: 4, repeat: Infinity }}
                />

                <defs>
                    <linearGradient id="stellar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e3a8a" /> {/* Deep Blue */}
                        <stop offset="100%" stopColor="#581c87" /> {/* Deep Purple */}
                    </linearGradient>
                </defs>

                {/* Crown/Sensor Array - Gold */}
                <rect x="85" y="30" width="30" height="15" fill="#FFD700" rx="2" stroke="#B8860B" strokeWidth="2" />

                {/* Eye Sockets */}
                <circle cx="75" cy="85" r="18" fill="#0f172a" />
                <circle cx="125" cy="85" r="18" fill="#0f172a" />

                {/* Eyes - Glowing CYAN/WHITE (Star style) */}
                <motion.circle
                    cx="75" cy="85" r="10"
                    fill="#A5F3FC"
                    animate={{
                        opacity: isNarrating ? [1, 0.6, 1] : 1,
                        scale: isNarrating ? [1, 1.2, 1] : 1,
                        fill: isNarrating ? ["#A5F3FC", "#FFFFFF", "#A5F3FC"] : "#A5F3FC"
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.circle
                    cx="125" cy="85" r="10"
                    fill="#A5F3FC"
                    animate={{
                        opacity: isNarrating ? [1, 0.6, 1] : 1,
                        scale: isNarrating ? [1, 1.2, 1] : 1,
                        fill: isNarrating ? ["#A5F3FC", "#FFFFFF", "#A5F3FC"] : "#A5F3FC"
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                />

                {/* Mechanical Mouth - Moving while narrating */}
                <motion.rect
                    x="80" y="115" width="40" height="8"
                    fill="#2c1e14"
                    rx="2"
                    animate={{
                        scaleY: isNarrating ? [1, 2, 1, 3, 1] : 1,
                        y: isNarrating ? [0, -2, 0] : 0
                    }}
                    transition={{ duration: 0.2, repeat: isNarrating ? Infinity : 0 }}
                />

                {/* Copper Details */}
                <path d="M70,45 L130,45" stroke="#B87333" strokeWidth="2" strokeDasharray="4 2" />
                <circle cx="100" cy="155" r="12" fill="#D4AF37" stroke="#4a3728" strokeWidth="3" /> {/* Neck pivot */}
            </svg>
        </div>
    );
};

import { AnimatePresence } from 'framer-motion';
