import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// VIRTUAL PET SYSTEM - Cross-Subject Learning Companion
// ============================================================================

// Pet Evolution Stages
export type PetStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'legend';

// Pet Mood based on recent activity
export type PetMood = 'ecstatic' | 'happy' | 'neutral' | 'sad' | 'sleepy' | 'excited' | 'proud';

// Specialty based on most practiced subject
export type PetSpecialty = 'math' | 'reading' | 'science' | 'art' | 'sports' | 'balanced';

// Subject tracking
interface SubjectProgress {
    xp: number;
    lessonsCompleted: number;
    lastActivity: Date | null;
}

interface PetState {
    // Identity
    name: string;
    species: string; // 'dragon', 'phoenix', 'unicorn', etc.

    // Evolution
    stage: PetStage;
    level: number;
    xp: number;
    xpToNextLevel: number;

    // Emotional state
    mood: PetMood;
    happiness: number; // 0-100
    energy: number; // 0-100

    // Visual appearance
    specialty: PetSpecialty;
    accessories: string[]; // Unlocked cosmetics

    // Stats
    totalXpEarned: number;
    daysSinceCreation: number;
    consecutiveDays: number;
    lastInteraction: string; // ISO date

    // Subject-specific progress
    subjects: {
        math: SubjectProgress;
        reading: SubjectProgress;
        science: SubjectProgress;
        art: SubjectProgress;
        sports: SubjectProgress;
    };
}

// XP thresholds for each stage
const STAGE_THRESHOLDS: Record<PetStage, number> = {
    egg: 0,
    baby: 50,
    child: 200,
    teen: 500,
    adult: 1200,
    legend: 3000
};

// Level XP requirements (increases each level)
const getLevelXP = (level: number) => 50 + (level * 25);

// ============================================================================
// PET SPECIES BY GRADE LEVEL - Age-Appropriate Companions
// ============================================================================

// Species data structure
export interface PetSpeciesInfo {
    id: string;
    name: string;
    emoji: string;
    description: string;
    personality: string;
}

// 3° Grado (8-9 años) - Criaturas tiernas, coloridas y mágicas
export const GRADE_3_SPECIES: PetSpeciesInfo[] = [
    {
        id: 'bunny',
        name: 'Conejito Mágico',
        emoji: '🐰',
        description: 'Un conejito esponjoso que salta de alegría cuando aprendes',
        personality: 'Tierno y juguetón'
    },
    {
        id: 'kitten',
        name: 'Gatito Estrella',
        emoji: '🐱',
        description: 'Un gatito curioso que ronronea con cada logro',
        personality: 'Curioso y cariñoso'
    },
    {
        id: 'puppy',
        name: 'Perrito Feliz',
        emoji: '🐶',
        description: 'Un cachorrito leal que celebra tus victorias',
        personality: 'Leal y entusiasta'
    },
    {
        id: 'panda',
        name: 'Pandita Sabio',
        emoji: '🐼',
        description: 'Un pequeño panda que ama aprender contigo',
        personality: 'Tranquilo y dulce'
    },
    {
        id: 'unicorn_baby',
        name: 'Unicornio Bebé',
        emoji: '🦄',
        description: 'Un unicornio pequeñito lleno de magia y color',
        personality: 'Mágico y soñador'
    },
    {
        id: 'butterfly',
        name: 'Mariposa Arcoíris',
        emoji: '🦋',
        description: 'Una mariposa colorida que vuela con tus sueños',
        personality: 'Libre y colorida'
    },
];

// 4° Grado (9-10 años) - Criaturas aventureras, divertidas y con personalidad
export const GRADE_4_SPECIES: PetSpeciesInfo[] = [
    {
        id: 'fox',
        name: 'Zorro Astuto',
        emoji: '🦊',
        description: 'Un zorro inteligente que te ayuda a resolver problemas',
        personality: 'Astuto y amigable'
    },
    {
        id: 'owl',
        name: 'Búho Nocturno',
        emoji: '🦉',
        description: 'Un búho sabio que conoce muchos secretos',
        personality: 'Sabio y misterioso'
    },
    {
        id: 'penguin',
        name: 'Pingüino Explorador',
        emoji: '🐧',
        description: 'Un pingüino aventurero listo para descubrir',
        personality: 'Valiente y divertido'
    },
    {
        id: 'koala',
        name: 'Koala Tranquilo',
        emoji: '🐨',
        description: 'Un koala relajado que te da calma al estudiar',
        personality: 'Relajado y paciente'
    },
    {
        id: 'dolphin',
        name: 'Delfín Juguetón',
        emoji: '🐬',
        description: 'Un delfín super inteligente y divertido',
        personality: 'Alegre e inteligente'
    },
    {
        id: 'wolf_pup',
        name: 'Lobito Guardián',
        emoji: '🐺',
        description: 'Un lobito que protege tu camino de aprendizaje',
        personality: 'Protector y fiel'
    },
];

// 5° Grado (10-11 años) - Criaturas míticas, "cool" y sofisticadas
export const GRADE_5_SPECIES: PetSpeciesInfo[] = [
    {
        id: 'dragon',
        name: 'Dragón de Fuego',
        emoji: '🐉',
        description: 'Un dragón poderoso que domina los desafíos',
        personality: 'Poderoso y valiente'
    },
    {
        id: 'phoenix',
        name: 'Fénix Legendario',
        emoji: '🔥',
        description: 'Un ave mítica que renace con cada nuevo reto',
        personality: 'Resiliente y épico'
    },
    {
        id: 'tiger',
        name: 'Tigre Feroz',
        emoji: '🐅',
        description: 'Un tigre majestuoso con fuerza y astucia',
        personality: 'Fuerte y determinado'
    },
    {
        id: 'eagle',
        name: 'Águila Dorada',
        emoji: '🦅',
        description: 'Un águila que vuela alto hacia tus metas',
        personality: 'Ambicioso y veloz'
    },
    {
        id: 'lion',
        name: 'León Alpha',
        emoji: '🦁',
        description: 'El rey de la selva que lidera con coraje',
        personality: 'Líder y noble'
    },
    {
        id: 'kraken',
        name: 'Kraken Místico',
        emoji: '🐙',
        description: 'Una criatura marina con poderes ocultos',
        personality: 'Misterioso y poderoso'
    },
];

// Complete species map by grade
export const PET_SPECIES_BY_GRADE: Record<number, PetSpeciesInfo[]> = {
    3: GRADE_3_SPECIES,
    4: GRADE_4_SPECIES,
    5: GRADE_5_SPECIES,
};

// Flat list of all species (for backwards compatibility)
export const PET_SPECIES = [
    ...GRADE_3_SPECIES,
    ...GRADE_4_SPECIES,
    ...GRADE_5_SPECIES,
];

// Get species for a specific grade
export const getSpeciesForGrade = (grade: number): PetSpeciesInfo[] => {
    // Default to grade 3 for younger, grade 5 for older
    if (grade <= 3) return GRADE_3_SPECIES;
    if (grade === 4) return GRADE_4_SPECIES;
    return GRADE_5_SPECIES;
};

// Get species info by ID
export const getSpeciesById = (id: string): PetSpeciesInfo | undefined => {
    return PET_SPECIES.find(s => s.id === id);
};

// Get grade recommendation for a species
export const getGradeForSpecies = (speciesId: string): number => {
    if (GRADE_3_SPECIES.some(s => s.id === speciesId)) return 3;
    if (GRADE_4_SPECIES.some(s => s.id === speciesId)) return 4;
    return 5;
};

// Specialty appearances
export const SPECIALTY_STYLES: Record<PetSpecialty, { color: string; icon: string; title: string }> = {
    math: { color: 'from-blue-500 to-purple-600', icon: '🔢', title: 'Mago Numérico' },
    reading: { color: 'from-amber-500 to-orange-600', icon: '📚', title: 'Sabio Literario' },
    science: { color: 'from-green-500 to-teal-600', icon: '🧪', title: 'Científico' },
    art: { color: 'from-pink-500 to-rose-600', icon: '🎨', title: 'Artista' },
    sports: { color: 'from-red-500 to-orange-600', icon: '⚡', title: 'Atleta' },
    balanced: { color: 'from-yellow-400 to-amber-500', icon: '🌟', title: 'Leyenda Equilibrada' }
};

const STORAGE_KEY = 'nova_pet_state';

const getDefaultState = (): PetState => ({
    name: '',
    species: 'dragon',
    stage: 'egg',
    level: 1,
    xp: 0,
    xpToNextLevel: getLevelXP(1),
    mood: 'happy',
    happiness: 80,
    energy: 100,
    specialty: 'balanced',
    accessories: [],
    totalXpEarned: 0,
    daysSinceCreation: 0,
    consecutiveDays: 0,
    lastInteraction: new Date().toISOString(),
    subjects: {
        math: { xp: 0, lessonsCompleted: 0, lastActivity: null },
        reading: { xp: 0, lessonsCompleted: 0, lastActivity: null },
        science: { xp: 0, lessonsCompleted: 0, lastActivity: null },
        art: { xp: 0, lessonsCompleted: 0, lastActivity: null },
        sports: { xp: 0, lessonsCompleted: 0, lastActivity: null },
    }
});

export function usePet() {
    const [pet, setPet] = useState<PetState>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to load pet state:', e);
                }
            }
        }
        return getDefaultState();
    });

    const [isHatching, setIsHatching] = useState(false);
    const [isEvolving, setIsEvolving] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pet));
    }, [pet]);

    // Update mood based on time since last interaction
    useEffect(() => {
        const checkMood = () => {
            const lastInteraction = new Date(pet.lastInteraction);
            const now = new Date();
            const hoursSince = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);

            setPet(prev => {
                let newMood: PetMood = prev.mood;
                let newHappiness = prev.happiness;
                let newEnergy = Math.min(100, prev.energy + 5); // Slowly recover energy

                if (hoursSince > 48) {
                    newMood = 'sad';
                    newHappiness = Math.max(20, prev.happiness - 10);
                } else if (hoursSince > 24) {
                    newMood = 'sleepy';
                    newHappiness = Math.max(40, prev.happiness - 5);
                } else if (hoursSince > 12) {
                    newMood = 'neutral';
                } else {
                    // Keep current positive mood
                }

                return { ...prev, mood: newMood, happiness: newHappiness, energy: newEnergy };
            });
        };

        checkMood();
        const interval = setInterval(checkMood, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [pet.lastInteraction]);

    // Calculate specialty based on subject XP
    const calculateSpecialty = useCallback((subjects: PetState['subjects']): PetSpecialty => {
        const totals = {
            math: subjects.math.xp,
            reading: subjects.reading.xp,
            science: subjects.science.xp,
            art: subjects.art.xp,
            sports: subjects.sports.xp,
        };

        const max = Math.max(...Object.values(totals));
        const total = Object.values(totals).reduce((a, b) => a + b, 0);

        if (total === 0) return 'balanced';

        // If no subject is more than 40% of total, it's balanced
        if (max / total < 0.4) return 'balanced';

        // Find the dominant subject
        for (const [subject, xp] of Object.entries(totals)) {
            if (xp === max) return subject as PetSpecialty;
        }

        return 'balanced';
    }, []);

    // Calculate stage from total XP
    const calculateStage = useCallback((totalXp: number): PetStage => {
        if (totalXp >= STAGE_THRESHOLDS.legend) return 'legend';
        if (totalXp >= STAGE_THRESHOLDS.adult) return 'adult';
        if (totalXp >= STAGE_THRESHOLDS.teen) return 'teen';
        if (totalXp >= STAGE_THRESHOLDS.child) return 'child';
        if (totalXp >= STAGE_THRESHOLDS.baby) return 'baby';
        return 'egg';
    }, []);

    // Create/hatch the pet
    const createPet = useCallback((name: string, species: string) => {
        setIsHatching(true);

        setTimeout(() => {
            setPet(prev => ({
                ...prev,
                name,
                species,
                stage: 'baby',
                mood: 'ecstatic',
                happiness: 100,
                lastInteraction: new Date().toISOString(),
            }));
            setIsHatching(false);
        }, 3000); // 3 second hatching animation
    }, []);

    // Feed XP to the pet (from any activity)
    const feedXP = useCallback((amount: number, subject?: keyof PetState['subjects']) => {
        setPet(prev => {
            let newXp = prev.xp + amount;
            let newLevel = prev.level;
            let newXpToNext = prev.xpToNextLevel;
            let didLevelUp = false;

            // Check for level up
            while (newXp >= newXpToNext) {
                newXp -= newXpToNext;
                newLevel++;
                newXpToNext = getLevelXP(newLevel);
                didLevelUp = true;
            }

            if (didLevelUp) {
                setShowLevelUp(true);
                setTimeout(() => setShowLevelUp(false), 3000);
            }

            const newTotalXp = prev.totalXpEarned + amount;
            const newStage = calculateStage(newTotalXp);

            // Check for evolution
            if (newStage !== prev.stage) {
                setIsEvolving(true);
                setTimeout(() => setIsEvolving(false), 4000);
            }

            // Update subject if specified
            const newSubjects = { ...prev.subjects };
            if (subject && newSubjects[subject]) {
                newSubjects[subject] = {
                    ...newSubjects[subject],
                    xp: newSubjects[subject].xp + amount,
                    lastActivity: new Date(),
                };
            }

            const newSpecialty = calculateSpecialty(newSubjects);

            return {
                ...prev,
                xp: newXp,
                level: newLevel,
                xpToNextLevel: newXpToNext,
                totalXpEarned: newTotalXp,
                stage: newStage,
                subjects: newSubjects,
                specialty: newSpecialty,
                mood: 'happy',
                happiness: Math.min(100, prev.happiness + 5),
                energy: Math.max(0, prev.energy - 2),
                lastInteraction: new Date().toISOString(),
            };
        });
    }, [calculateStage, calculateSpecialty]);

    // Complete a lesson (bigger XP boost)
    const completeLesson = useCallback((subject: keyof PetState['subjects'], xpAmount: number = 25) => {
        feedXP(xpAmount, subject);

        setPet(prev => ({
            ...prev,
            subjects: {
                ...prev.subjects,
                [subject]: {
                    ...prev.subjects[subject],
                    lessonsCompleted: prev.subjects[subject].lessonsCompleted + 1,
                }
            },
            mood: 'proud',
        }));
    }, [feedXP]);

    // Pet interaction (petting, playing)
    const interact = useCallback(() => {
        setPet(prev => ({
            ...prev,
            mood: 'ecstatic',
            happiness: Math.min(100, prev.happiness + 10),
            lastInteraction: new Date().toISOString(),
        }));
    }, []);

    // Get stage progress percentage
    const getStageProgress = useCallback(() => {
        const currentThreshold = STAGE_THRESHOLDS[pet.stage];
        const stages: PetStage[] = ['egg', 'baby', 'child', 'teen', 'adult', 'legend'];
        const currentIndex = stages.indexOf(pet.stage);
        const nextStage = stages[currentIndex + 1];

        if (!nextStage) return 100; // Already at legend

        const nextThreshold = STAGE_THRESHOLDS[nextStage];
        const progress = ((pet.totalXpEarned - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

        return Math.min(100, Math.max(0, progress));
    }, [pet.stage, pet.totalXpEarned]);

    // Check if pet exists
    const hasPet = pet.name !== '';

    return {
        // State
        pet,
        hasPet,
        isHatching,
        isEvolving,
        showLevelUp,

        // Computed
        stageProgress: getStageProgress(),
        levelProgress: (pet.xp / pet.xpToNextLevel) * 100,
        specialtyStyle: SPECIALTY_STYLES[pet.specialty],

        // Actions
        createPet,
        feedXP,
        completeLesson,
        interact,
    };
}

export type { PetState, SubjectProgress };
export { STAGE_THRESHOLDS, getLevelXP };
