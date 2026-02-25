/**
 * Adaptive difficulty: tracks recent math performance per operation
 * and suggests easy/medium/hard/expert based on success rate.
 */

const STORAGE_KEY = 'nova_math_performance';
const DIFF_STORAGE_KEY = 'nova_math_difficulties';
const STREAK_NEEDED = 3;

interface PerfEntry {
    operation: string;
    correct: boolean;
    ts: number;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

const diffOrder: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];

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
    } catch (_) { }
}

/**
 * Get the currently suggested difficulty for an operation.
 */
export function getSuggestedDifficulty(operation: string): DifficultyLevel {
    try {
        const raw = localStorage.getItem(DIFF_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed[operation] === 'string') {
                return parsed[operation] as DifficultyLevel;
            }
        }
    } catch (_) { }
    return 'medium';
}

function saveSuggestedDifficulty(operation: string, difficulty: DifficultyLevel) {
    try {
        const raw = localStorage.getItem(DIFF_STORAGE_KEY);
        let parsed: Record<string, string> = {};
        if (raw) parsed = JSON.parse(raw) || {};
        parsed[operation] = difficulty;
        localStorage.setItem(DIFF_STORAGE_KEY, JSON.stringify(parsed));
    } catch (_) { }
}

/**
 * Record a math attempt for adaptive difficulty.
 * Evaluates streaks to automatically step difficulty up or down.
 */
export function recordMathAttempt(operation: string, wasCorrect: boolean): void {
    const entries = loadPerf();
    entries.push({ operation, correct: wasCorrect, ts: Date.now() });
    savePerf(entries.slice(-100));

    // Get latest entries for this operation
    const opEntries = entries.filter(e => e.operation === operation);

    if (opEntries.length >= STREAK_NEEDED) {
        // Take the last 3
        const recent = opEntries.slice(-STREAK_NEEDED);

        const allCorrect = recent.every(e => e.correct);
        const allWrong = recent.every(e => !e.correct);

        let currentDiff = getSuggestedDifficulty(operation);
        let currentIdx = diffOrder.indexOf(currentDiff);

        let changed = false;
        if (allCorrect && currentIdx < diffOrder.length - 1) {
            // Level UP!
            currentDiff = diffOrder[currentIdx + 1];
            changed = true;
            console.log(`[Adaptive] ${operation} Level UP to ${currentDiff}`);
        } else if (allWrong && currentIdx > 0) {
            // Level DOWN!
            currentDiff = diffOrder[currentIdx - 1];
            changed = true;
            console.log(`[Adaptive] ${operation} Level DOWN to ${currentDiff}`);
        }

        if (changed) {
            saveSuggestedDifficulty(operation, currentDiff);
            // Clear the history for this operation to start fresh on the new level
            const newEntries = entries.filter(e => e.operation !== operation);
            savePerf(newEntries);

            // Dispatch event for UI updates globally
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('nova_math_diff_updated', {
                    detail: { operation, difficulty: currentDiff }
                }));
            }
        }
    }
}
