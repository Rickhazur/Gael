import { useState, useEffect, useCallback } from 'react';

// Types
export interface WordRecord {
    word: string;
    translation: string;
    category: string; // 'farm', 'diner', 'space', etc.
    timestamp: number;
    masteryLevel: number; // 0-100
}

export interface ActivityRecord {
    id: string;
    type: 'pronunciation' | 'scan' | 'sentence' | 'mission';
    detail: string; // e.g., "Harvested Corn", "Served Burger"
    timestamp: number;
}

const STORAGE_KEY_VOCAB = 'nova_vocabulary_v1';
const STORAGE_KEY_ACTIVITY = 'nova_activity_log_v1';

export const useLearningProgress = () => {
    const [vocabulary, setVocabulary] = useState<WordRecord[]>([]);
    const [recentActivity, setRecentActivity] = useState<ActivityRecord[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        try {
            const savedVocab = localStorage.getItem(STORAGE_KEY_VOCAB);
            const savedActivity = localStorage.getItem(STORAGE_KEY_ACTIVITY);

            if (savedVocab) setVocabulary(JSON.parse(savedVocab));
            if (savedActivity) setRecentActivity(JSON.parse(savedActivity));
        } catch (e) {
            console.error("Failed to load learning progress", e);
        }
    }, []);

    // Save to local storage whenever state changes
    useEffect(() => {
        if (vocabulary.length > 0) {
            localStorage.setItem(STORAGE_KEY_VOCAB, JSON.stringify(vocabulary));
        }
    }, [vocabulary]);

    useEffect(() => {
        if (recentActivity.length > 0) {
            localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(recentActivity));
        }
    }, [recentActivity]);

    const learnWord = useCallback((word: string, translation: string, category: string) => {
        setVocabulary(prev => {
            // Check if word exists
            const existingIndex = prev.findIndex(w => w.word.toLowerCase() === word.toLowerCase());

            if (existingIndex >= 0) {
                // Update mastery and timestamp
                const newBocab = [...prev];
                newBocab[existingIndex] = {
                    ...newBocab[existingIndex],
                    timestamp: Date.now(),
                    masteryLevel: Math.min(100, newBocab[existingIndex].masteryLevel + 10)
                };
                return newBocab;
            } else {
                // Add new word
                return [...prev, {
                    word,
                    translation,
                    category,
                    timestamp: Date.now(),
                    masteryLevel: 10
                }];
            }
        });

        // Add to activity log implicitly
        logActivity('pronunciation', `Learned word: ${word}`);
    }, []);

    const logActivity = useCallback((type: ActivityRecord['type'], detail: string) => {
        setRecentActivity(prev => {
            const newLog = {
                id: Date.now().toString(),
                type,
                detail,
                timestamp: Date.now()
            };
            // Keep last 50 activities
            return [newLog, ...prev].slice(0, 50);
        });
    }, []);

    const getRecentVocabulary = useCallback((limit: number = 10) => {
        return [...vocabulary]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }, [vocabulary]);

    return {
        vocabulary,
        recentActivity,
        learnWord,
        logActivity,
        getRecentVocabulary
    };
};
