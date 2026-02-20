/**
 * Mapeo missionId (Arena) -> questId (PedagogicalQuest).
 * Única fuente de verdad para coherencia entre adventureWorlds y pedagogicalQuests.
 * Usado por: AdventureArena, tests de coherencia.
 */
export const ARENA_MISSION_TO_QUEST: Record<string, string> = {
    // Grade 1
    'm-g1-1': 'counting-to-20',
    'm-g1-2': 'addition-within-100',
    'm-g1-3': 'subtraction-g1',
    'm-g1-4': 'shapes-g1',
    'm-g1-10': 'legend-valle-g1',
    // Grade 2
    'm-g2-1': 'counting-to-999',
    'm-g2-2': 'golden-sacks-g2',
    'm-g2-3': 'subtraction-within-100',
    'm-g2-4': 'desert-tales-g2',
    'm-g2-5': 'sand-clock-g2',
    'm-g2-6': 'oasis-life-g2',
    'm-g2-7': 'spice-market-g2',
    'm-g2-8': 'ancient-routes-g2',
    'm-g2-9': 'multiplication-tables-5',
    'm-g2-10': 'ancestral-patterns-g2',
    // Grade 3
    'm-g3-1': 'multiplication-tables-5',
    'm-g3-2': 'fractions-intro-1',
    'm-g3-3': 'word-problems-g3',
    'm-g3-7': 'island-history-g3',
    'm-g3-9': 'plants-parts',
    // Grade 4
    'm-g4-1': 'area-perimeter',
    'm-g4-2': 'decimals-intro',
    'm-g4-3': 'fractions-intro-1',
    'm-g4-4': 'air-messages-g4',
    'm-g4-5': 'historical-timeline-1',
    'm-g4-6': 'water-cycle-1',
    'm-g4-7': 'angle-types-1',
    'm-g4-8': 'symmetry-concepts-1',
    'm-g4-9': 'data-averages-1',
    'm-g4-10': 'coordinate-plane-1',
    // Grade 5
    'm-g5-1': 'decimals-intro',
    'm-g5-2': 'fractions-complex-1',
    'm-g5-3': 'percentages-g5',
    'm-g5-4': 'data-statistics-1',
    'm-g5-5': 'area-triangles-1',
    'm-g5-6': 'volume-intro-1',
    'm-g5-7': 'time-ethics-g5',
    'm-g5-8': 'probability-intro-1',
    'm-g5-9': 'direct-proportion-1',
    'm-g5-10': 'equations-intro-1',
};
