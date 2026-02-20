// ============================================================================
// PET SYSTEM - Central Export
// Age-appropriate companions for 3rd, 4th, and 5th grade students
// ============================================================================

// Components
export { VirtualPet } from './VirtualPet';
export { PetWidget } from './PetWidget';
export { PetPanel } from './PetPanel';

// Types and Constants from hook
export {
    usePet,
    PET_SPECIES,
    SPECIALTY_STYLES,
    STAGE_THRESHOLDS,
    getLevelXP,
    // Grade-based species
    GRADE_3_SPECIES,
    GRADE_4_SPECIES,
    GRADE_5_SPECIES,
    PET_SPECIES_BY_GRADE,
    getSpeciesForGrade,
    getSpeciesById,
    getGradeForSpecies
} from '../../hooks/usePet';

export type {
    PetState,
    SubjectProgress,
    PetSpeciesInfo
} from '../../hooks/usePet';

