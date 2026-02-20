// Exercise Generator Service
// Generates unique math exercises without repetition

export type MathOperation = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface MathExercise {
    id: string;
    operation: MathOperation;
    difficulty: DifficultyLevel;
    problem: string;
    operands: number[];
    correctAnswer: string | number;
    hint?: string;
    explanation?: string;
}

interface ExerciseConstraints {
    operation: MathOperation;
    difficulty: DifficultyLevel;
    count: number;
    grade?: number;
    /** For division missions "inexacta" / "residuo": generate division with remainder (same logic as rest of app). */
    divisionWithRemainder?: boolean;
}

// Track generated exercises to avoid repetition
const generatedExercises = new Map<string, Set<string>>();

/**
 * Generate a unique hash for an exercise to track it
 */
function getExerciseHash(operation: MathOperation, operands: number[]): string {
    return `${operation}:${operands.join('-')}`;
}

/**
 * Check if exercise was already generated in this session
 */
function isExerciseUnique(operation: MathOperation, operands: number[]): boolean {
    const hash = getExerciseHash(operation, operands);
    const sessionKey = `${operation}`;

    if (!generatedExercises.has(sessionKey)) {
        generatedExercises.set(sessionKey, new Set());
    }

    const exerciseSet = generatedExercises.get(sessionKey)!;

    if (exerciseSet.has(hash)) {
        return false;
    }

    exerciseSet.add(hash);
    return true;
}

/**
 * Get number range based on difficulty
 */
function getNumberRange(difficulty: DifficultyLevel, operation: MathOperation): { min: number; max: number } {
    const ranges = {
        addition: {
            easy: { min: 1, max: 20 },
            medium: { min: 10, max: 100 },
            hard: { min: 100, max: 1000 },
            expert: { min: 1000, max: 10000 }
        },
        subtraction: {
            easy: { min: 1, max: 20 },
            medium: { min: 10, max: 100 },
            hard: { min: 100, max: 1000 },
            expert: { min: 1000, max: 10000 }
        },
        multiplication: {
            easy: { min: 1, max: 10 },
            medium: { min: 2, max: 12 },
            hard: { min: 10, max: 50 },
            expert: { min: 20, max: 100 }
        },
        division: {
            easy: { min: 1, max: 20 },
            medium: { min: 10, max: 100 },
            hard: { min: 100, max: 500 },
            expert: { min: 100, max: 1000 }
        },
        fractions: {
            easy: { min: 1, max: 10 },
            medium: { min: 1, max: 20 },
            hard: { min: 1, max: 50 },
            expert: { min: 1, max: 100 }
        }
    };

    return ranges[operation][difficulty];
}

/**
 * Generate random number within range
 */
function randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a unique addition exercise
 */
function generateAddition(difficulty: DifficultyLevel): MathExercise | null {
    const range = getNumberRange(difficulty, 'addition');
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
        const a = randomInRange(range.min, range.max);
        const b = randomInRange(range.min, range.max);

        if (isExerciseUnique('addition', [a, b])) {
            return {
                id: `add-${Date.now()}-${Math.random()}`,
                operation: 'addition',
                difficulty,
                problem: `${a} + ${b}`,
                operands: [a, b],
                correctAnswer: a + b,
                hint: 'Suma columna por columna, empezando por las unidades',
                explanation: `${a} + ${b} = ${a + b}`
            };
        }
        attempts++;
    }

    return null;
}

/**
 * Generate a unique subtraction exercise
 */
function generateSubtraction(difficulty: DifficultyLevel): MathExercise | null {
    const range = getNumberRange(difficulty, 'subtraction');
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
        const a = randomInRange(range.min, range.max);
        const b = randomInRange(range.min, a); // b <= a to avoid negative results

        if (isExerciseUnique('subtraction', [a, b])) {
            return {
                id: `sub-${Date.now()}-${Math.random()}`,
                operation: 'subtraction',
                difficulty,
                problem: `${a} - ${b}`,
                operands: [a, b],
                correctAnswer: a - b,
                hint: 'Resta columna por columna. Si necesitas, pide prestado del siguiente lugar',
                explanation: `${a} - ${b} = ${a - b}`
            };
        }
        attempts++;
    }

    return null;
}

/**
 * Generate a unique multiplication exercise
 */
function generateMultiplication(difficulty: DifficultyLevel): MathExercise | null {
    const range = getNumberRange(difficulty, 'multiplication');
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
        const a = randomInRange(range.min, range.max);
        const b = randomInRange(range.min, range.max);

        if (isExerciseUnique('multiplication', [a, b])) {
            return {
                id: `mul-${Date.now()}-${Math.random()}`,
                operation: 'multiplication',
                difficulty,
                problem: `${a} × ${b}`,
                operands: [a, b],
                correctAnswer: a * b,
                hint: 'Multiplica dígito por dígito y suma los productos parciales',
                explanation: `${a} × ${b} = ${a * b}`
            };
        }
        attempts++;
    }

    return null;
}

/**
 * Generate a unique division exercise. Same format as rest of app: "dividend ÷ divisor".
 * When divisionWithRemainder is true (e.g. mission "inexacta"), generates division with remainder.
 */
function generateDivision(difficulty: DifficultyLevel, divisionWithRemainder = false): MathExercise | null {
    const range = getNumberRange(difficulty, 'division');
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
        const divisor = randomInRange(Math.max(2, range.min), Math.min(range.max, 20));
        let dividend: number;
        let quotient: number;
        let remainder = 0;

        if (divisionWithRemainder) {
            quotient = randomInRange(range.min, Math.max(1, Math.floor(range.max / divisor)));
            remainder = randomInRange(1, divisor - 1);
            dividend = divisor * quotient + remainder;
        } else {
            quotient = randomInRange(range.min, range.max / divisor);
            dividend = divisor * quotient;
        }

        if (isExerciseUnique('division', [dividend, divisor])) {
            const correctAnswer = divisionWithRemainder ? `${quotient} R ${remainder}` : quotient;
            return {
                id: `div-${Date.now()}-${Math.random()}`,
                operation: 'division',
                difficulty,
                problem: `${dividend} ÷ ${divisor}`,
                operands: [dividend, divisor],
                correctAnswer,
                hint: divisionWithRemainder
                    ? 'Reparto equitativo; lo que sobra es el residuo.'
                    : '¿Cuántas veces cabe el divisor en el dividendo?',
                explanation: divisionWithRemainder
                    ? `${dividend} ÷ ${divisor} = ${quotient} con residuo ${remainder}`
                    : `${dividend} ÷ ${divisor} = ${quotient}`
            };
        }
        attempts++;
    }

    return null;
}

/**
 * Generate a unique fraction exercise
 */
function generateFraction(difficulty: DifficultyLevel): MathExercise | null {
    const range = getNumberRange(difficulty, 'fractions');
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
        const num1 = randomInRange(range.min, range.max);
        const den1 = randomInRange(range.min + 1, range.max);
        const num2 = randomInRange(range.min, range.max);
        const den2 = den1; // Same denominator for easier addition

        if (isExerciseUnique('fractions', [num1, den1, num2, den2])) {
            const resultNum = num1 + num2;
            const resultDen = den1;

            return {
                id: `frac-${Date.now()}-${Math.random()}`,
                operation: 'fractions',
                difficulty,
                problem: `${num1}/${den1} + ${num2}/${den2}`,
                operands: [num1, den1, num2, den2],
                correctAnswer: `${resultNum}/${resultDen}`,
                hint: 'Como tienen el mismo denominador, solo suma los numeradores',
                explanation: `${num1}/${den1} + ${num2}/${den2} = ${resultNum}/${resultDen}`
            };
        }
        attempts++;
    }

    return null;
}

/**
 * Main function to generate exercises. Same logic used by missions (centro de mando) and rest of app.
 */
export function generateExercises(constraints: ExerciseConstraints): MathExercise[] {
    const { operation, difficulty, count, divisionWithRemainder } = constraints;
    const exercises: MathExercise[] = [];

    for (let i = 0; i < count; i++) {
        let exercise: MathExercise | null = null;
        if (operation === 'addition') exercise = generateAddition(difficulty);
        else if (operation === 'subtraction') exercise = generateSubtraction(difficulty);
        else if (operation === 'multiplication') exercise = generateMultiplication(difficulty);
        else if (operation === 'division') exercise = generateDivision(difficulty, !!divisionWithRemainder);
        else if (operation === 'fractions') exercise = generateFraction(difficulty);
        if (exercise) {
            exercises.push(exercise);
        } else {
            console.warn(`Could not generate unique ${operation} exercise after maximum attempts`);
        }
    }

    return exercises;
}

/**
 * Clear exercise history (useful for testing or new sessions)
 */
export function clearExerciseHistory(operation?: MathOperation): void {
    if (operation) {
        generatedExercises.delete(operation);
    } else {
        generatedExercises.clear();
    }
}

/**
 * Get exercise statistics
 */
export function getExerciseStats() {
    const stats: Record<string, number> = {};

    generatedExercises.forEach((exercises, operation) => {
        stats[operation] = exercises.size;
    });

    return stats;
}
