
import React from 'react';
import { motion } from 'framer-motion';

interface SparkAvatarProps {
    state?: 'idle' | 'speaking' | 'thinking' | 'excited';
    size?: number;
}

export const SparkAvatar: React.FC<SparkAvatarProps> = ({ state = 'idle', size = 120 }) => {
    const eyeColors = {
        idle: '#00f7ff', // Neon Cyan
        speaking: '#ffdd00', // Electric Gold
        thinking: '#bd00ff', // Galactic Purple
        excited: '#ff007a', // Plasma Pink
    };

    const currentColor = eyeColors[state];

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Soft Nebula Glow - Alien atmosphere */}
            <motion.div
                className="absolute inset-0 rounded-full blur-3xl opacity-30"
                style={{ backgroundColor: currentColor }}
                animate={{
                    scale: state === 'speaking' ? [1, 1.4, 1] : [1, 1.2, 1],
                    opacity: state === 'thinking' ? [0.2, 0.5, 0.2] : 0.3,
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    {/* Alien Metal Finish */}
                    <linearGradient id="alienMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="50%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>

                    <filter id="softGlow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Floating Alien Ears / Sensors (Soft & Curved) */}
                <motion.path
                    d="M 45 60 C 20 40, 20 100, 45 100"
                    stroke={currentColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    animate={{ rotate: [-10, 10, -10], x: [-2, 2, -2] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    opacity="0.6"
                />
                <motion.path
                    d="M 155 60 C 180 40, 180 100, 155 100"
                    stroke={currentColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    animate={{ rotate: [10, -10, 10], x: [2, -2, 2] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    opacity="0.6"
                />

                {/* Main Body - Kind and Rounded Alien-Bot */}
                <motion.path
                    d="M 100 40 C 60 40, 40 70, 40 110 C 40 150, 70 170, 100 170 C 130 170, 160 150, 160 110 C 160 70, 140 40, 100 40 Z"
                    fill="url(#alienMetal)"
                    stroke="#475569"
                    strokeWidth="3"
                    animate={{
                        scaleY: [1, 1.03, 1],
                        y: [0, -3, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Face Visor (Heart shaped for kindness) */}
                <path
                    d="M 100 135 C 100 135, 60 120, 60 90 C 60 70, 80 60, 100 80 C 120 60, 140 70, 140 90 C 140 120, 100 135, 100 135 Z"
                    fill="#020617"
                    opacity="0.8"
                />

                {/* Giant, Kind, expressive "Star" Eyes */}
                <g filter="url(#softGlow)">
                    {/* Left Eye */}
                    <motion.circle
                        cx="85" cy="95" r="12"
                        fill={currentColor}
                        animate={{
                            scale: state === 'thinking' ? [1, 1.3, 0.1, 1] : [1, 1.15, 1],
                            opacity: [0.9, 1, 0.9]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                    {/* Left Pupil / Star Sparkle */}
                    <motion.path
                        d="M 85 88 L 87 95 L 94 95 L 88 98 L 90 105 L 85 100 L 80 105 L 82 98 L 76 95 L 83 95 Z"
                        fill="white"
                        animate={{ opacity: [0.5, 1, 0.5], rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Right Eye */}
                    <motion.circle
                        cx="115" cy="95" r="12"
                        fill={currentColor}
                        animate={{
                            scale: state === 'thinking' ? [1, 1.3, 0.1, 1] : [1, 1.15, 1],
                            opacity: [0.9, 1, 0.9]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0.15 }}
                    />
                    {/* Right Pupil / Star Sparkle */}
                    <motion.path
                        d="M 115 88 L 117 95 L 124 95 L 118 98 L 120 105 L 115 100 L 110 105 L 112 98 L 106 95 L 113 95 Z"
                        fill="white"
                        animate={{ opacity: [0.5, 1, 0.5], rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    />
                </g>

                {/* Subtle Robotic Mouth (Waveform) */}
                {state === 'speaking' ? (
                    <motion.path
                        d="M 85 130 Q 100 120 115 130"
                        stroke={currentColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        animate={{
                            d: [
                                "M 85 130 Q 100 120 115 130",
                                "M 85 130 Q 100 140 115 130",
                                "M 85 130 Q 100 120 115 130"
                            ]
                        }}
                        transition={{ duration: 0.1, repeat: Infinity }}
                    />
                ) : (
                    <motion.rect
                        x="92" y="130" width="16" height="2" rx="1"
                        fill={currentColor}
                        opacity="0.4"
                    />
                )}

                {/* Little Antenna (Flower-like or alien-like) */}
                <line x1="100" y1="40" x2="100" y2="20" stroke="#475569" strokeWidth="2" />
                <motion.circle
                    cx="100" cy="20" r="5"
                    fill={currentColor}
                    animate={{
                        scale: [1, 1.5, 1],
                        filter: ['blur(0px)', 'blur(4px)', 'blur(0px)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </svg>
        </div>
    );
};
