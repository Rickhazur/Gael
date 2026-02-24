export interface RemediationEvent {
    topic: string;
    wordIds: string[];
    timestamp: number;
}

const TOPIC_WORD_MAP: Record<string, string[]> = {
    // Math mapping (Fractions and Word problems mostly based on existing solvers)
    'fractions': ['food_piz', 'fr_piz', 'f_pizza', 'adj_full', 'adj_empty', 'k_knife', 'f_apple', 'f_orange'],
    'word_problems': ['st_note', 'st_pencil', 'st_rule', 'st_erase', 'lib_h', 'adj_big', 'adj_small'],
    'addition': ['st_rule', 'st_pencil', 'st_note', 'st_erase', 'adj_big', 'adj_small'],
    'subtraction': ['st_rule', 'st_pencil', 'st_note', 'st_erase', 'adj_big', 'adj_small'],
    'multiplication': ['st_rule', 'st_pencil', 'st_note', 'adj_fast', 'adj_big'],
    'division': ['f_pizza', 'p_piz', 'adj_small', 'adj_empty', 'st_scis'],
    'geometry': ['st_rule', 'st_pencil', 'shape', 'adj_big', 'adj_small', 'st_note'],
    // Default/Fallback
    'general_math': ['st_pencil', 'st_note', 'st_rule', 'st_erase'],
    'science_animals': ['dog', 'cat', 'bird', 'lion', 'elephant', 'tiger', 'monkey'],
    'science_space': ['sun', 'moon', 'star', 'rocket_s', 'planet', 'tele2'],
};

export const remediationStore = {
    getRemediationWords: (): string[] => {
        if (typeof window === 'undefined') return [];
        try {
            const stored = localStorage.getItem('nova_remediation_words');
            if (!stored) return [];
            const events: RemediationEvent[] = JSON.parse(stored);
            // Get all unique word ids
            const ids = new Set<string>();
            events.forEach(e => e.wordIds.forEach(id => ids.add(id)));
            return Array.from(ids);
        } catch (e) {
            return [];
        }
    },

    addFailureMapping: (topic: string) => {
        if (typeof window === 'undefined') return;
        const wordIds = TOPIC_WORD_MAP[topic] || TOPIC_WORD_MAP['general_math'];
        try {
            const stored = localStorage.getItem('nova_remediation_words');
            let events: RemediationEvent[] = stored ? JSON.parse(stored) : [];

            // Add new event
            events.push({ topic, wordIds, timestamp: Date.now() });

            // Keep only last 5 remediation events
            if (events.length > 5) events = events.slice(events.length - 5);

            localStorage.setItem('nova_remediation_words', JSON.stringify(events));

            // Dispatch a global event so UI can update immediately
            window.dispatchEvent(new Event('nova_remediation_updated'));
        } catch (e) {
            console.error(e);
        }
    },

    clearRemediations: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('nova_remediation_words');
        window.dispatchEvent(new Event('nova_remediation_updated'));
    }
};
