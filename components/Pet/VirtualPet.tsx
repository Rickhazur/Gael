import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePet, PET_SPECIES, SPECIALTY_STYLES, PetStage, getSpeciesForGrade, PetSpeciesInfo } from '../../hooks/usePet';
import { Heart, Star, Zap, Sparkles, Info } from 'lucide-react';

// ============================================================================
// VIRTUAL PET COMPONENT - Animated Learning Companion
// Age-appropriate pets for 3rd, 4th, and 5th grade students
// ============================================================================

interface VirtualPetProps {
    size?: 'small' | 'medium' | 'large';
    showStats?: boolean;
    interactive?: boolean;
    className?: string;
    gradeLevel?: number; // Student's grade (3, 4, or 5)
}

// Emoji representations for each stage (will be replaced with actual images later)
const STAGE_EMOJI: Record<PetStage, string> = {
    egg: '🥚',
    baby: '🐣',
    child: '🐥',
    teen: '🦅',
    adult: '🐉',
    legend: '✨🐉✨'
};

export const VirtualPet: React.FC<VirtualPetProps> = ({
    size = 'medium',
    showStats = true,
    interactive = true,
    className = '',
    gradeLevel = 3
}) => {
    const {
        pet,
        hasPet,
        isHatching,
        isEvolving,
        showLevelUp,
        stageProgress,
        levelProgress,
        specialtyStyle,
        createPet,
        interact
    } = usePet();

    const [isInteracting, setIsInteracting] = useState(false);
    const [showHearts, setShowHearts] = useState(false);
    const [petName, setPetName] = useState('');
    const [selectedSpecies, setSelectedSpecies] = useState<string>('');
    const [hoveredSpecies, setHoveredSpecies] = useState<PetSpeciesInfo | null>(null);

    // Get species for the student's grade
    const availableSpecies = getSpeciesForGrade(gradeLevel);

    // Set default selection when species load
    React.useEffect(() => {
        if (!selectedSpecies && availableSpecies.length > 0) {
            setSelectedSpecies(availableSpecies[0].id);
        }
    }, [availableSpecies, selectedSpecies]);

    // Size configurations
    const sizeConfig = {
        small: { container: 'w-16 h-16', pet: 'text-3xl', stats: 'text-xs' },
        medium: { container: 'w-24 h-24', pet: 'text-5xl', stats: 'text-sm' },
        large: { container: 'w-32 h-32', pet: 'text-6xl', stats: 'text-base' },
    };

    const config = sizeConfig[size];

    // Handle pet interaction
    const handleInteract = () => {
        if (!interactive || !hasPet) return;

        setIsInteracting(true);
        setShowHearts(true);
        interact();

        setTimeout(() => setIsInteracting(false), 500);
        setTimeout(() => setShowHearts(false), 2000);
    };

    // Handle pet creation
    const handleCreatePet = () => {
        if (petName.trim() && selectedSpecies) {
            createPet(petName.trim(), selectedSpecies);
        }
    };

    // Get pet emoji (species + stage combined)
    const getPetEmoji = () => {
        if (isHatching) return '🥚💫';
        if (isEvolving) return '✨🌟✨';

        const speciesData = PET_SPECIES.find(s => s.id === pet.species);
        if (pet.stage === 'egg') return '🥚';
        if (pet.stage === 'baby') return speciesData?.emoji || '🐣';
        if (pet.stage === 'legend') return `✨${speciesData?.emoji}✨`;
        return speciesData?.emoji || '🐉';
    };

    // Mood-based animations
    const moodAnimations = {
        ecstatic: {
            y: [0, -15, 0],
            rotate: [0, -10, 10, 0],
            scale: [1, 1.1, 1],
            transition: { repeat: Infinity, duration: 0.5 }
        },
        happy: {
            y: [0, -5, 0],
            transition: { repeat: Infinity, duration: 1 }
        },
        excited: {
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0],
            transition: { repeat: Infinity, duration: 0.6 }
        },
        proud: {
            scale: [1, 1.05, 1],
            transition: { repeat: Infinity, duration: 1.5 }
        },
        neutral: {
            y: [0, -2, 0],
            transition: { repeat: Infinity, duration: 3 }
        },
        sad: {
            y: [0, 2, 0],
            rotate: [-2, 2, -2],
            transition: { repeat: Infinity, duration: 2 }
        },
        sleepy: {
            rotate: [-5, 5, -5],
            transition: { repeat: Infinity, duration: 4 }
        }
    };

    // Grade label for display
    const getGradeLabel = () => {
        switch (gradeLevel) {
            case 3: return '3° Grado - Mascotas Mágicas';
            case 4: return '4° Grado - Compañeros Aventureros';
            case 5: return '5° Grado - Criaturas Legendarias';
            default: return `Grado ${gradeLevel}`;
        }
    };

    // If no pet exists, show creation UI
    if (!hasPet && !isHatching) {
        const selectedSpeciesData = availableSpecies.find(s => s.id === selectedSpecies);

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-gradient-to-br from-purple-900/90 to-indigo-900/90 rounded-2xl p-6 border border-purple-500/30 max-w-md ${className}`}
            >
                {/* Grade Badge */}
                <div className="text-center mb-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-700/50 rounded-full text-sm text-purple-200">
                        <Star className="w-4 h-4 text-yellow-400" />
                        {getGradeLabel()}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-4 text-center">
                    ¡Adopta tu Compañero! 🐾
                </h3>

                <div className="space-y-4">
                    {/* Species Selection with improved UI */}
                    <div>
                        <label className="text-sm text-purple-200 mb-2 block flex items-center gap-1">
                            <span>Elige tu mascota:</span>
                            <Info className="w-3 h-3 text-purple-400" />
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {availableSpecies.map(species => (
                                <motion.button
                                    key={species.id}
                                    onClick={() => setSelectedSpecies(species.id)}
                                    onMouseEnter={() => setHoveredSpecies(species)}
                                    onMouseLeave={() => setHoveredSpecies(null)}
                                    whileHover={{ scale: 1.05, y: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`
                                        relative p-3 rounded-xl text-3xl transition-all flex flex-col items-center
                                        ${selectedSpecies === species.id
                                            ? 'bg-gradient-to-br from-pink-500 to-purple-600 ring-2 ring-pink-300 shadow-lg shadow-pink-500/30'
                                            : 'bg-purple-800/50 hover:bg-purple-700/50'}
                                    `}
                                >
                                    <span className="text-3xl">{species.emoji}</span>
                                    <span className="text-xs mt-1 text-white/80 font-medium truncate w-full text-center">
                                        {species.name.split(' ')[0]}
                                    </span>
                                    {selectedSpecies === species.id && (
                                        <motion.div
                                            layoutId="selected-pet"
                                            className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                                        >
                                            <span className="text-xs">✓</span>
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Species Description Card */}
                    <AnimatePresence mode="wait">
                        {selectedSpeciesData && (
                            <motion.div
                                key={selectedSpeciesData.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-purple-800/40 rounded-lg p-3 border border-purple-500/20"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-4xl">{selectedSpeciesData.emoji}</span>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white">{selectedSpeciesData.name}</h4>
                                        <p className="text-xs text-purple-200 mt-1">
                                            {selectedSpeciesData.description}
                                        </p>
                                        <span className="inline-flex items-center gap-1 mt-2 text-xs text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded-full">
                                            <Sparkles className="w-3 h-3" />
                                            {selectedSpeciesData.personality}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Name Input */}
                    <div>
                        <label className="text-sm text-purple-200 mb-2 block">Dale un nombre:</label>
                        <input
                            type="text"
                            value={petName}
                            onChange={(e) => setPetName(e.target.value)}
                            placeholder="Ej: Spark, Luna, Max..."
                            className="w-full px-4 py-3 bg-purple-800/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg"
                            maxLength={15}
                        />
                    </div>

                    {/* Create Button */}
                    <motion.button
                        onClick={handleCreatePet}
                        disabled={!petName.trim() || !selectedSpecies}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                            w-full py-4 rounded-xl font-bold text-lg text-white transition-all flex items-center justify-center gap-2
                            ${petName.trim() && selectedSpecies
                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-500/30'
                                : 'bg-gray-600 cursor-not-allowed'}
                        `}
                    >
                        <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            🥚
                        </motion.span>
                        ¡Adoptar Huevo!
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {/* Hatching Animation Overlay */}
            <AnimatePresence>
                {isHatching && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
                    >
                        <motion.div
                            className="text-center"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                        >
                            <motion.span
                                className="text-9xl block"
                                animate={{
                                    rotate: [-5, 5, -5],
                                    y: [0, -10, 0]
                                }}
                                transition={{ repeat: Infinity, duration: 0.3 }}
                            >
                                🥚
                            </motion.span>
                            <p className="text-2xl text-white mt-4 font-bold">
                                ¡Tu huevo está eclosionando!
                            </p>
                            <motion.div
                                className="flex justify-center gap-2 mt-2"
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                            >
                                <Sparkles className="text-yellow-400" />
                                <Sparkles className="text-pink-400" />
                                <Sparkles className="text-purple-400" />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Evolution Animation Overlay */}
            <AnimatePresence>
                {isEvolving && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gradient-to-br from-purple-900/95 to-pink-900/95 z-50 flex items-center justify-center"
                    >
                        <motion.div
                            className="text-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.5, 1] }}
                            transition={{ duration: 2 }}
                        >
                            <motion.span
                                className="text-9xl block"
                                animate={{
                                    rotate: [0, 360],
                                    scale: [1, 1.3, 1]
                                }}
                                transition={{ duration: 2 }}
                            >
                                {getPetEmoji()}
                            </motion.span>
                            <motion.p
                                className="text-3xl text-white mt-4 font-black"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                            >
                                ¡{pet.name} evolucionó!
                            </motion.p>
                            <motion.p
                                className="text-xl text-purple-200 mt-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                            >
                                Ahora es: <span className="font-bold capitalize">{pet.stage}</span>
                            </motion.p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Level Up Animation */}
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        className="absolute -top-16 left-1/2 -translate-x-1/2 z-20"
                    >
                        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 rounded-full shadow-lg">
                            <span className="text-white font-bold text-sm flex items-center gap-1">
                                <Star className="w-4 h-4 fill-white" />
                                ¡Nivel {pet.level}!
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hearts Animation */}
            <AnimatePresence>
                {showHearts && (
                    <>
                        {[...Array(5)].map((_, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 0, x: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    y: -50 - (i * 10),
                                    x: (i - 2) * 15
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className="absolute top-0 left-1/2 text-2xl pointer-events-none"
                            >
                                ❤️
                            </motion.span>
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Main Pet Container */}
            <motion.div
                className={`
                    ${config.container} relative flex items-center justify-center 
                    rounded-full cursor-pointer select-none
                    bg-gradient-to-br ${specialtyStyle.color}
                    shadow-lg shadow-purple-500/20
                `}
                onClick={handleInteract}
                whileHover={interactive ? { scale: 1.05 } : {}}
                whileTap={interactive ? { scale: 0.95 } : {}}
            >
                {/* Glowing Aura */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-white/20 blur-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                />

                {/* Pet Emoji */}
                <motion.span
                    className={`${config.pet} relative z-10`}
                    animate={moodAnimations[pet.mood]}
                    style={{ transformOrigin: 'center' }}
                >
                    {getPetEmoji()}
                </motion.span>

                {/* Specialty Badge */}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                    <span className="text-base">{specialtyStyle.icon}</span>
                </div>

                {/* Mood Indicator */}
                {pet.mood === 'sad' && (
                    <motion.span
                        className="absolute -top-2 -right-2 text-xl"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    >
                        💧
                    </motion.span>
                )}
                {pet.mood === 'sleepy' && (
                    <motion.span
                        className="absolute -top-2 right-0 text-lg"
                        animate={{ opacity: [0, 1, 0], y: [0, -10] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        💤
                    </motion.span>
                )}
            </motion.div>

            {/* Stats Panel */}
            {showStats && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-center"
                >
                    {/* Name & Level */}
                    <p className={`font-bold text-white ${config.stats}`}>
                        {pet.name}
                        <span className="ml-1 text-purple-300">Lv.{pet.level}</span>
                    </p>

                    {/* XP Bar */}
                    <div className="mt-1 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${levelProgress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    {/* Stats Icons */}
                    <div className="flex justify-center gap-3 mt-2">
                        <div className="flex items-center gap-1" title="Felicidad">
                            <Heart className={`w-4 h-4 ${pet.happiness > 50 ? 'text-pink-400' : 'text-gray-400'}`} />
                            <span className={`text-xs ${pet.happiness > 50 ? 'text-pink-300' : 'text-gray-400'}`}>
                                {pet.happiness}%
                            </span>
                        </div>
                        <div className="flex items-center gap-1" title="Energía">
                            <Zap className={`w-4 h-4 ${pet.energy > 30 ? 'text-yellow-400' : 'text-gray-400'}`} />
                            <span className={`text-xs ${pet.energy > 30 ? 'text-yellow-300' : 'text-gray-400'}`}>
                                {pet.energy}%
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default VirtualPet;
