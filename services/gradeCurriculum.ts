// Grade-Level Curriculum Mapping
// Defines which topics are appropriate for each grade level

export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface CurriculumMap {
    grade: GradeLevel;
    topics: string[];
    prerequisites?: string[]; // Topics from lower grades that can be reviewed
}

// Comprehensive Grade-Level Curriculum Mapping
export const GRADE_CURRICULUM: Record<GradeLevel, CurriculumMap> = {
    1: {
        grade: 1,
        topics: [
            // Grade 1: Basic Operations (single-digit)
            'addition',           // Simple addition (0-20)
            'subtraction',        // Simple subtraction (0-20)
            'patterns',           // Simple number patterns
            'shapes_2d',          // Basic 2D shapes
            'measurement',        // Length, weight (basic)
            'time',              // Telling time (hours)
            'money',             // Counting coins
            'word_problems'      // Simple word problems
        ],
        prerequisites: []
    },

    2: {
        grade: 2,
        topics: [
            // Grade 2: Two-digit operations
            'addition',           // Two-digit addition
            'subtraction',        // Two-digit subtraction
            'multiplication',     // Introduction (2, 5, 10 tables)
            'patterns',           // Number & shape patterns
            'shapes_2d',          // 2D shapes & properties
            'measurement',        // Length, weight, volume
            'time',              // Time to 5 minutes
            'money',             // Making change
            'word_problems',     // Two-step problems
            'graphs'             // Reading simple graphs
        ],
        prerequisites: ['addition', 'subtraction', 'patterns', 'shapes_2d']
    },

    3: {
        grade: 3,
        topics: [
            // Grade 3: Multiplication, Division, Fractions intro
            'addition',           // Multi-digit addition with carrying
            'subtraction',        // Multi-digit subtraction with borrowing
            'multiplication',     // All tables (0-12)
            'division',          // Division with remainders
            'fractions',         // Introduction to fractions
            'fraction_addition', // Simple fractions (same denominator)
            'geometry',          // Perimeter & area
            'area',              // Rectangle area
            'perimeter',         // Rectangle perimeter
            'measurement',       // All units
            'time',              // Elapsed time
            'money',             // Word problems with money
            'word_problems',     // Multi-step problems
            'graphs',            // Bar graphs, pictographs
            'patterns'           // Advanced patterns
        ],
        prerequisites: ['addition', 'subtraction', 'multiplication', 'shapes_2d', 'measurement']
    },

    4: {
        grade: 4,
        topics: [
            // Grade 4: Advanced fractions, decimals, geometry
            'multiplication',     // Multi-digit multiplication
            'division',          // Long division
            'fractions',         // All fraction operations
            'fraction_addition',
            'fraction_subtraction',
            'fraction_multiplication',
            'equivalent_fractions',
            'decimals',          // Introduction to decimals
            'decimal_addition',
            'decimal_subtraction',
            'geometry',          // All shapes
            'area',              // Triangle, circle area
            'perimeter',         // All shapes
            'angles',            // Measuring angles
            'shapes_2d',         // Properties of shapes
            'shapes_3d',         // 3D shapes introduction
            'measurement',       // Conversions
            'length',            // Unit conversions
            'weight',
            'volume',
            'statistics',        // Mean, median, mode
            'graphs',            // Line graphs
            'word_problems',
            'patterns'
        ],
        prerequisites: ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'geometry']
    },

    5: {
        grade: 5,
        topics: [
            // Grade 5: All topics (mastery & advanced)
            'multiplication',     // Advanced algorithms
            'division',          // Complex division
            'fractions',         // All operations
            'fraction_addition',
            'fraction_subtraction',
            'fraction_multiplication',
            'fraction_division',
            'mixed_numbers',
            'equivalent_fractions',
            'decimals',          // All decimal operations
            'decimal_addition',
            'decimal_subtraction',
            'decimal_multiplication',
            'decimal_division',
            'geometry',          // Advanced geometry
            'area',              // All shapes
            'perimeter',
            'angles',
            'shapes_2d',
            'shapes_3d',
            'measurement',       // All conversions
            'length',
            'weight',
            'volume',
            'time',
            'money',
            'statistics',        // All statistics
            'data',
            'graphs',
            'probability',
            'word_problems',     // Complex problems
            'patterns'           // Advanced patterns
        ],
        prerequisites: ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'decimals', 'geometry', 'measurement']
    },

    6: {
        grade: 6,
        topics: [
            // BIMESTRE 1: Números Enteros y Racionales
            'integers',            // Conjuntos numéricos, recta numérica
            'integer_addition',    // Suma de enteros
            'integer_subtraction', // Resta de enteros
            'fractions',           // Racionales
            'equivalent_fractions',
            // BIMESTRE 2: Fracciones, Decimales y Porcentajes
            'fraction_operations', // Operaciones con racionales
            'decimals',
            'decimal_operations',
            'percentage',          // Conversión fracción-decimal-porcentaje
            // BIMESTRE 3: Geometría y Medición
            'polygons',            // Polígonos
            'perimeter',
            'area',
            'angles',
            'coordinate_plane',    // Plano cartesiano
            // BIMESTRE 4: Estadística, Probabilidad y Patrones
            'statistics',          // Tablas, gráficos, media, moda, mediana
            'probability',         // Probabilidad simple
            'patterns',            // Secuencias
            'word_problems'
        ],
        prerequisites: ['multiplication', 'division', 'fractions', 'decimals', 'geometry', 'statistics']
    },

    7: {
        grade: 7,
        topics: [
            // BIMESTRE 1: Pre-álgebra y Expresiones
            'integers',            // Operaciones con enteros
            'integer_operations',  // Multiplicación y división de enteros
            'expressions',         // Expresiones algebraicas
            'equations',           // Ecuaciones lineales simples
            // BIMESTRE 2: Proporcionalidad y Porcentajes
            'ratios',              // Razones y proporciones
            'proportions',         // Proporcionalidad directa e inversa
            'percentage',          // Porcentajes avanzados
            'scale',               // Escalas y mapas
            // BIMESTRE 3: Geometría Avanzada
            'geometry',            // Geometría avanzada
            'transformations',     // Traslaciones, rotaciones, reflexiones
            'congruence',          // Congruencia y semejanza
            'pythagorean',         // Introducción al teorema de Pitágoras
            'area',                // Áreas de figuras compuestas
            'volume',              // Volumen de prismas y cilindros
            // BIMESTRE 4: Estadística y Probabilidad Avanzada
            'statistics',          // Medidas de tendencia central avanzadas
            'probability',         // Probabilidad experimental
            'data',                // Análisis de datos
            'graphs',              // Gráficos avanzados
            'inequalities',        // Desigualdades
            'word_problems'
        ],
        prerequisites: ['integers', 'fractions', 'decimals', 'percentage', 'geometry', 'statistics', 'coordinate_plane']
    },

    8: {
        grade: 8,
        topics: [
            // BIMESTRE 1: Álgebra y Ecuaciones
            'expressions',         // Expresiones algebraicas avanzadas
            'equations',           // Ecuaciones lineales de dos pasos
            'linear_systems',      // Sistemas de ecuaciones simples
            'inequalities',        // Desigualdades lineales
            // BIMESTRE 2: Funciones y Gráficas
            'functions',           // Funciones lineales (y = mx + b)
            'slope',               // Pendiente e intercepto
            'coordinate_plane',    // Gráficas en el plano cartesiano
            'patterns',            // Patrones y secuencias algebraicas
            // BIMESTRE 3: Geometría y Medición Avanzada
            'pythagorean',         // Teorema de Pitágoras (aplicaciones completas)
            'transformations',     // Transformaciones geométricas
            'similarity',          // Semejanza de figuras
            'volume',              // Volumen de cilindros, conos, esferas
            'area',                // Áreas de figuras compuestas
            // BIMESTRE 4: Estadística, Probabilidad y Potencias
            'exponents',           // Potencias y raíces cuadradas
            'scientific_notation', // Notación científica
            'statistics',          // Diagramas de dispersión, correlación
            'probability',         // Probabilidad compuesta
            'data',                // Análisis de datos avanzado
            'word_problems'        // Problemas con modelado algebraico
        ],
        prerequisites: ['integers', 'expressions', 'equations', 'fractions', 'decimals', 'percentage', 'geometry', 'statistics', 'pythagorean']
    }
};

// Helper function to check if a topic is appropriate for a grade
export const isTopicAppropriateForGrade = (topic: string, grade: GradeLevel): boolean => {
    const curriculum = GRADE_CURRICULUM[grade];
    return curriculum.topics.includes(topic);
};

// Helper function to get all available topics for a grade (including prerequisites)
export const getAvailableTopicsForGrade = (grade: GradeLevel, includePrerequisites: boolean = false): string[] => {
    const curriculum = GRADE_CURRICULUM[grade];

    if (!includePrerequisites) {
        return curriculum.topics;
    }

    // Include topics from current grade and all lower grades (for remediation)
    const allTopics = new Set<string>();

    for (let g = 1; g <= grade; g++) {
        GRADE_CURRICULUM[g as GradeLevel].topics.forEach(topic => allTopics.add(topic));
    }

    return Array.from(allTopics);
};

// Helper function to suggest remediation topics based on struggles
export const getRemediationTopics = (currentGrade: GradeLevel, strugglingTopic: string): string[] => {
    const remediationMap: Record<string, string[]> = {
        // If struggling with fractions, review multiplication/division
        'fractions': ['multiplication', 'division'],
        'fraction_addition': ['addition', 'fractions'],
        'fraction_subtraction': ['subtraction', 'fractions'],
        'fraction_multiplication': ['multiplication', 'fractions'],
        'fraction_division': ['division', 'fractions'],

        // If struggling with decimals, review fractions
        'decimals': ['fractions'],
        'decimal_addition': ['addition', 'decimals'],
        'decimal_subtraction': ['subtraction', 'decimals'],
        'decimal_multiplication': ['multiplication', 'decimals'],
        'decimal_division': ['division', 'decimals'],

        // If struggling with division, review multiplication
        'division': ['multiplication', 'subtraction'],

        // If struggling with multiplication, review addition
        'multiplication': ['addition'],

        // If struggling with geometry, review basic shapes
        'area': ['multiplication', 'shapes_2d'],
        'perimeter': ['addition', 'shapes_2d'],
        'angles': ['shapes_2d'],

        // If struggling with statistics, review operations
        'statistics': ['addition', 'division'],
        'data': ['graphs', 'statistics']
    };

    return remediationMap[strugglingTopic] || [];
};

// Helper function to determine if student needs remediation
export const needsRemediation = (incorrectAttempts: number, threshold: number = 2): boolean => {
    return incorrectAttempts >= threshold;
};

// Difficulty levels for adaptive learning
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export const getDifficultyForGrade = (topic: string, grade: GradeLevel): DifficultyLevel => {
    const curriculum = GRADE_CURRICULUM[grade];

    // If topic is a prerequisite (from lower grade), it should be easier
    if (curriculum.prerequisites && curriculum.prerequisites.includes(topic)) {
        return 'easy';
    }

    // If topic is in current grade, medium difficulty
    if (curriculum.topics.includes(topic)) {
        return 'medium';
    }

    // If topic is from higher grade, it's hard (shouldn't normally happen)
    return 'hard';
};
