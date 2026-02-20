import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PresenterAvatarProps {
    isSpeaking: boolean;
    size?: number;
}

export function PresenterAvatar({ isSpeaking, size = 100 }: PresenterAvatarProps) {
    const [mouthOpen, setMouthOpen] = useState(false);

    // Sync mouth animation with speaking state
    useEffect(() => {
        let interval: any;
        if (isSpeaking) {
            interval = setInterval(() => {
                setMouthOpen(prev => !prev);
            }, 100); // Faster mouth movement for natural speech
        } else {
            setMouthOpen(false);
        }
        return () => clearInterval(interval);
    }, [isSpeaking]);

    return (
        <div
            className="relative flex items-center justify-center overflow-hidden rounded-full"
            style={{ width: size, height: size }}
        >
            <motion.img
                src={mouthOpen ? '/images/presenter_talking.png' : '/images/presenter_idle.png'}
                alt="Nova Presenter"
                className="w-full h-full object-cover"
                // Slight bounce when speaking for liveliness
                animate={isSpeaking ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Glossy Overlay for 'Screen' look if needed, but keeping generally clean for now */}
        </div>
    );
}
