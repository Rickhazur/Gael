import React, { createContext, useContext, ReactNode, useState } from 'react';
import {
    usePet,
    PetState,
    PET_SPECIES,
    SPECIALTY_STYLES,
    getSpeciesForGrade,
    PetSpeciesInfo
} from '../hooks/usePet';

// ============================================================================
// PET CONTEXT - Global Access to Pet System
// Provides grade-appropriate pet companions for 3rd, 4th, and 5th grade students
// ============================================================================

interface PetContextType {
    // State
    pet: PetState;
    hasPet: boolean;
    isHatching: boolean;
    isEvolving: boolean;
    showLevelUp: boolean;

    // Grade-based species
    gradeLevel: number;
    setGradeLevel: (grade: number) => void;
    availableSpecies: PetSpeciesInfo[];

    // Computed
    stageProgress: number;
    levelProgress: number;
    specialtyStyle: { color: string; icon: string; title: string };

    // Actions
    createPet: (name: string, species: string) => void;
    feedXP: (amount: number, subject?: 'math' | 'reading' | 'science' | 'art' | 'sports') => void;
    completeLesson: (subject: 'math' | 'reading' | 'science' | 'art' | 'sports', xpAmount?: number) => void;
    interact: () => void;

    // UI State
    isPetPanelOpen: boolean;
    setIsPetPanelOpen: (open: boolean) => void;
}

const PetContext = createContext<PetContextType | null>(null);

interface PetProviderProps {
    children: ReactNode;
    initialGradeLevel?: number;
}

export const PetProvider: React.FC<PetProviderProps> = ({ children, initialGradeLevel = 3 }) => {
    const petHook = usePet();
    const [isPetPanelOpen, setIsPetPanelOpen] = useState(false);
    const [gradeLevel, setGradeLevel] = useState(initialGradeLevel);

    // Get species appropriate for the current grade
    const availableSpecies = getSpeciesForGrade(gradeLevel);

    return (
        <PetContext.Provider value={{
            ...petHook,
            isPetPanelOpen,
            setIsPetPanelOpen,
            gradeLevel,
            setGradeLevel,
            availableSpecies
        }}>
            {children}
        </PetContext.Provider>
    );
};

export const usePetContext = () => {
    const context = useContext(PetContext);
    if (!context) {
        throw new Error('usePetContext must be used within a PetProvider');
    }
    return context;
};

// Re-export constants for convenience
export { PET_SPECIES, SPECIALTY_STYLES };

