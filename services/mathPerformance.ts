/**
 * Adaptive difficulty: tracks recent math performance per operation
 * and suggests easy/medium/hard based on success rate.
 */

const STORAGE_KEY = 'nova_math_performance';
const MAX_RECENT = 10;
const RECENT_CORRECT_FOR_HARD = 4;
const RECENT_WRONG_FOR_EASY = 2;

interface PerfEntry {
    operation: string;
    correct: boolean;
    ts: number;
}

function loadPerf(): PerfEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function savePerf(entries: PerfEntry[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-50)));
    } catch (_) {}
}

/**
 * Record a math attempt for adaptive difficulty
 */
export function recordMathAttempt(operation: string, wasCorrect: boolean): void {
    const entries = loadPerf();
    entries.push({ operation, correct: wasCorrect, ts: Date.now() });
    savePerf(entries.slice(-MAX_RECENT * 3));
}

/**
 * Get suggested difficulty for an operation based on recent performance
 */
export function getSuggestedDifficulty(operation: string): 'easy' | 'medium' | 'hard' {
    const entries = loadPerf().filter(e => e.operation === operation).slice(-MAX_RECENT);
    if (entries.length < 2) return 'medium';

    const recentCorrect = entries.filter(e => e.correct).length;
    const recentWrong = entries.length - recentCorrect;

    if (recentWrong >= RECENT_WRONG_FOR_EASY) return 'easy';
    if (recentCorrect >= RECENT_CORRECT_FOR_HARD && recentWrong === 0) return 'hard';
    return 'medium';
}
