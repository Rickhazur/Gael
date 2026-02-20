import React from 'react';
import { motion } from 'framer-motion';
import { usePetContext, SPECIALTY_STYLES, PET_SPECIES } from '../../context/PetContext';

// ============================================================================
// MINI PET WIDGET - For Header / Sidebar Display
// ============================================================================

interface PetWidgetProps {
    onClick?: () => void;
    className?: string;
}

export const PetWidget: React.FC<PetWidgetProps> = ({ onClick, className = '' }) => {
    const { pet, hasPet, levelProgress, specialtyStyle } = usePetContext();

    if (!hasPet) return null;

    const speciesData = PET_SPECIES.find(s => s.id === pet.species);
    const petEmoji = pet.stage === 'egg' ? '🥚' : (speciesData?.emoji || '🐉');

    // Mood-based animation
    const moodAnimation = {
        y: pet.mood === 'sad' ? [0, 2, 0] : [0, -3, 0],
        transition: {
            repeat: Infinity,
            duration: pet.mood === 'ecstatic' ? 0.5 : pet.mood === 'sad' ? 2 : 1
        }
    };

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                flex items-center gap-2 px-3 py-2 rounded-full
                bg-gradient-to-r ${specialtyStyle.color}
                border border-white/20 backdrop-blur-sm
                shadow-lg shadow-purple-500/20
                transition-all ${className}
            `}
        >
            {/* Pet Avatar */}
            <motion.div
                className="relative"
                animate={moodAnimation}
            >
                <span className="text-2xl">{petEmoji}</span>

                {/* Specialty indicator */}
                <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full w-4 h-4 flex items-center justify-center">
                    {specialtyStyle.icon}
                </span>

                {/* Mood indicators */}
                {pet.mood === 'sad' && (
                    <span className="absolute -top-1 -right-1 text-xs">💧</span>
                )}
                {pet.mood === 'sleepy' && (
                    <motion.span
                        className="absolute -top-1 -right-1 text-xs"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        💤
                    </motion.span>
                )}
            </motion.div>

            {/* Info */}
            <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">
                    {pet.name}
                </p>
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-white/80">Lv.{pet.level}</span>
                    {/* Mini XP bar */}
                    <div className="w-10 h-1 bg-black/30 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-white"
                            style={{ width: `${levelProgress}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${levelProgress}%` }}
                        />
                    </div>
                </div>
            </div>
        </motion.button>
    );
};

export default PetWidget;
