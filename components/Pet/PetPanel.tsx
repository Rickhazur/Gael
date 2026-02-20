import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Zap, Star, Trophy, BookOpen, FlaskConical, Palette, Dumbbell, Calculator, Sparkles } from 'lucide-react';
import { usePetContext, SPECIALTY_STYLES, PET_SPECIES } from '../../context/PetContext';

// ============================================================================
// PET PANEL - Full Stats & Interaction Modal (with Adoption UI when !hasPet)
// ============================================================================

interface PetPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const SubjectIcon: Record<string, React.ReactNode> = {
    math: <Calculator className="w-4 h-4" />,
    reading: <BookOpen className="w-4 h-4" />,
    science: <FlaskConical className="w-4 h-4" />,
    art: <Palette className="w-4 h-4" />,
    sports: <Dumbbell className="w-4 h-4" />,
};

const SubjectColors: Record<string, string> = {
    math: 'from-blue-500 to-purple-500',
    reading: 'from-amber-500 to-orange-500',
    science: 'from-green-500 to-teal-500',
    art: 'from-pink-500 to-rose-500',
    sports: 'from-red-500 to-orange-500',
};

const SubjectNames: Record<string, { es: string; en: string }> = {
    math: { es: 'Matemáticas', en: 'Math' },
    reading: { es: 'Lectura', en: 'Reading' },
    science: { es: 'Ciencias', en: 'Science' },
    art: { es: 'Arte', en: 'Art' },
    sports: { es: 'Deportes', en: 'Sports' },
};

export const PetPanel: React.FC<PetPanelProps> = ({ isOpen, onClose }) => {
    const {
        pet,
        hasPet,
        isHatching,
        isEvolving,
        stageProgress,
        levelProgress,
        specialtyStyle,
        interact,
        createPet,
        availableSpecies,
        gradeLevel
    } = usePetContext();

    const [petName, setPetName] = useState('');
    const [selectedSpecies, setSelectedSpecies] = useState('');
    React.useEffect(() => {
        if (!selectedSpecies && availableSpecies.length > 0) {
            setSelectedSpecies(availableSpecies[0].id);
        }
    }, [availableSpecies, selectedSpecies]);

    const speciesData = PET_SPECIES.find(s => s.id === pet.species);

    const handleAdopt = () => {
        if (petName.trim() && selectedSpecies) {
            createPet(petName.trim(), selectedSpecies);
            setPetName('');
        }
    };

    // Get pet display based on stage
    const getPetDisplay = () => {
        if (pet.stage === 'egg') return '🥚';
        if (pet.stage === 'baby') return speciesData?.emoji || '🐣';
        if (pet.stage === 'legend') return `✨${speciesData?.emoji}✨`;
        return speciesData?.emoji || '🐉';
    };

    const stageLabels: Record<string, { es: string; en: string }> = {
        egg: { es: 'Huevo', en: 'Egg' },
        baby: { es: 'Bebé', en: 'Baby' },
        child: { es: 'Niño', en: 'Child' },
        teen: { es: 'Joven', en: 'Teen' },
        adult: { es: 'Adulto', en: 'Adult' },
        legend: { es: 'Leyenda', en: 'Legend' },
    };

    const moodLabels: Record<string, { es: string; emoji: string }> = {
        ecstatic: { es: '¡Eufórico!', emoji: '🤩' },
        happy: { es: 'Feliz', emoji: '😊' },
        excited: { es: 'Emocionado', emoji: '😃' },
        proud: { es: 'Orgulloso', emoji: '😌' },
        neutral: { es: 'Normal', emoji: '😐' },
        sad: { es: 'Triste', emoji: '😢' },
        sleepy: { es: 'Soñoliento', emoji: '😴' },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:max-h-[90vh] overflow-y-auto bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 rounded-3xl shadow-2xl z-50 border border-purple-500/30 scrollbar-hide"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>

                        {/* Content */}
                        <div className="p-6">
                            {/* Egg hatching animation - el niño ve el huevo crecer / eclosionar */}
                            {isHatching && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center py-12 space-y-6"
                                >
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.15, 1],
                                            rotate: [0, 5, -5, 0],
                                        }}
                                        transition={{
                                            duration: 0.6,
                                            repeat: Infinity,
                                            repeatDelay: 0.2,
                                        }}
                                        className="text-8xl drop-shadow-2xl"
                                    >
                                        🥚
                                    </motion.div>
                                    <motion.p
                                        animate={{ opacity: [0.7, 1, 0.7] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="text-xl font-bold text-white text-center"
                                    >
                                        ¡El huevo está eclosionando...!
                                    </motion.p>
                                    <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                            initial={{ width: '0%' }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 3, ease: 'linear' }}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Adoption UI when no pet and not hatching */}
                            {!hasPet && !isHatching && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-black text-white text-center">
                                        ¡Adopta tu Compañero! 🐾
                                    </h2>
                                    <p className="text-purple-300 text-center text-sm">
                                        Elige una mascota y dale un nombre. ¡Crecerá mientras aprendes matemáticas!
                                    </p>
                                    <div>
                                        <label className="block text-sm text-purple-200 mb-2">Elige tu mascota:</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableSpecies.map((s) => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => setSelectedSpecies(s.id)}
                                                    className={`p-3 rounded-xl text-2xl transition-all ${
                                                        selectedSpecies === s.id
                                                            ? 'bg-pink-500 ring-2 ring-pink-300'
                                                            : 'bg-purple-800/50 hover:bg-purple-700'
                                                    }`}
                                                >
                                                    {s.emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-purple-200 mb-2">Dale un nombre:</label>
                                        <input
                                            type="text"
                                            value={petName}
                                            onChange={(e) => setPetName(e.target.value)}
                                            placeholder="Ej: Luna, Spark..."
                                            className="w-full px-4 py-3 bg-purple-800/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-300/50"
                                            maxLength={15}
                                        />
                                    </div>
                                    <motion.button
                                        onClick={handleAdopt}
                                        disabled={!petName.trim() || !selectedSpecies}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 ${
                                            petName.trim() && selectedSpecies
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        🥚 ¡Adoptar Huevo!
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* Pet Display - only when hasPet (después de eclosionar el niño ve la mascota y las barras de crecimiento) */}
                            {hasPet && !isHatching && (
                            <>
                            {isEvolving && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mb-4 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-400/50 text-center"
                                >
                                    <span className="text-2xl">✨</span>
                                    <p className="text-white font-bold mt-1">¡{pet.name} está creciendo!</p>
                                    <p className="text-amber-200 text-sm">Evolución en curso...</p>
                                </motion.div>
                            )}
                            <div className="text-center mb-6">
                                <motion.div
                                    className={`
                                        inline-flex items-center justify-center w-32 h-32 rounded-full
                                        bg-gradient-to-br ${specialtyStyle.color}
                                        shadow-xl shadow-purple-500/30
                                    `}
                                    onClick={interact}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <motion.span
                                        className="text-7xl"
                                        animate={{
                                            y: [0, -8, 0],
                                            rotate: pet.mood === 'ecstatic' ? [-5, 5, -5] : 0
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: pet.mood === 'ecstatic' ? 0.5 : 1
                                        }}
                                    >
                                        {getPetDisplay()}
                                    </motion.span>
                                </motion.div>

                                <h2 className="text-2xl font-black text-white mt-4">
                                    {pet.name}
                                </h2>
                                <p className="text-purple-300">
                                    {stageLabels[pet.stage].es} • {speciesData?.name}
                                </p>
                                <p className="text-sm text-purple-400 mt-1">
                                    {moodLabels[pet.mood].emoji} {moodLabels[pet.mood].es}
                                </p>
                            </div>

                            {/* ✨ CALL TO ACTION MESSAGE (New) */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-2xl p-4 mb-6 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="flex gap-4 items-start relative z-10">
                                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 rounded-xl shadow-lg shadow-amber-500/20">
                                        <Sparkles className="w-6 h-6 text-white animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-amber-100 text-lg leading-tight mb-1">
                                            ¡{pet.name} te necesita! 🌟
                                        </h3>
                                        <p className="text-sm text-indigo-100/90 leading-relaxed font-medium">
                                            "Si contestas bien mis preguntas, ¡creceré grande y fuerte! Gana <span className="font-bold text-yellow-300">energía</span> aprendiendo."
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {/* Level */}
                                <div className="bg-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                                        <Star className="w-5 h-5 fill-yellow-400" />
                                        <span className="font-bold">Nivel {pet.level}</span>
                                    </div>
                                    <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
                                            animate={{ width: `${levelProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-purple-300 mt-1">
                                        {pet.xp} / {pet.xpToNextLevel} XP
                                    </p>
                                </div>

                                {/* Evolution */}
                                <div className="bg-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-pink-400 mb-2">
                                        <Trophy className="w-5 h-5" />
                                        <span className="font-bold">Evolución</span>
                                    </div>
                                    <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-pink-400 to-purple-500"
                                            animate={{ width: `${stageProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-purple-300 mt-1">
                                        {Math.round(stageProgress)}% al siguiente
                                    </p>
                                </div>

                                {/* Happiness */}
                                <div className="bg-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-pink-400 mb-2">
                                        <Heart className="w-5 h-5 fill-pink-400" />
                                        <span className="font-bold">Felicidad</span>
                                    </div>
                                    <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-pink-400 to-rose-500"
                                            animate={{ width: `${pet.happiness}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-purple-300 mt-1">
                                        {pet.happiness}%
                                    </p>
                                </div>

                                {/* Energy */}
                                <div className="bg-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                                        <Zap className="w-5 h-5 fill-yellow-400" />
                                        <span className="font-bold">Energía</span>
                                    </div>
                                    <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-yellow-400 to-green-400"
                                            animate={{ width: `${pet.energy}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-purple-300 mt-1">
                                        {pet.energy}%
                                    </p>
                                </div>
                            </div>

                            {/* Subject Progress */}
                            <div className="bg-white/10 rounded-xl p-4">
                                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                                    📊 Progreso por Materia
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(pet.subjects).map(([key, data]) => {
                                        const maxXP = Math.max(
                                            ...Object.values(pet.subjects).map(s => s.xp),
                                            1
                                        );
                                        const percentage = (data.xp / maxXP) * 100;

                                        return (
                                            <div key={key} className="flex items-center gap-3">
                                                <div className={`
                                                    p-2 rounded-lg bg-gradient-to-br ${SubjectColors[key]}
                                                    text-white
                                                `}>
                                                    {SubjectIcon[key]}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-white font-medium">
                                                            {SubjectNames[key].es}
                                                        </span>
                                                        <span className="text-purple-300">
                                                            {data.xp} XP
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-black/30 rounded-full h-1.5 mt-1 overflow-hidden">
                                                        <motion.div
                                                            className={`h-full bg-gradient-to-r ${SubjectColors[key]}`}
                                                            animate={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Specialty Badge */}
                            <div className="mt-4 text-center">
                                <div className={`
                                    inline-flex items-center gap-2 px-4 py-2 rounded-full
                                    bg-gradient-to-r ${specialtyStyle.color}
                                `}>
                                    <span className="text-xl">{specialtyStyle.icon}</span>
                                    <span className="font-bold text-white">{specialtyStyle.title}</span>
                                </div>
                            </div>

                            {/* Stats Summary */}
                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                <div className="bg-white/5 rounded-lg p-2">
                                    <p className="text-2xl font-black text-white">{pet.totalXpEarned}</p>
                                    <p className="text-xs text-purple-300">XP Total</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-2">
                                    <p className="text-2xl font-black text-white">{pet.consecutiveDays}</p>
                                    <p className="text-xs text-purple-300">Días seguidos</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-2">
                                    <p className="text-2xl font-black text-white">
                                        {Object.values(pet.subjects).reduce((a, b) => a + b.lessonsCompleted, 0)}
                                    </p>
                                    <p className="text-xs text-purple-300">Lecciones</p>
                                </div>
                            </div>
                            </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PetPanel;
