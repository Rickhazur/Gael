import { describe, it, expect } from 'vitest';
import {
    getRandomGrammarChallenges,
    getRandomVocabulary,
    getRandomStoryTheme,
    getRandomReadingPassage,
    grammarLibrary,
    vocabularyLibrary,
    storyLibrary,
    readingLibrary,
} from './englishContent';

describe('englishContent', () => {
    it('has vocabulary library with items', () => {
        expect(vocabularyLibrary.length).toBeGreaterThan(10);
    });

    it('has grammar library with items', () => {
        expect(grammarLibrary.length).toBeGreaterThan(10);
    });

    it('has multiple story themes', () => {
        expect(Object.keys(storyLibrary).length).toBeGreaterThan(2);
    });

    it('has multiple reading passages', () => {
        expect(readingLibrary.length).toBeGreaterThan(2);
    });

    it('getRandomVocabulary returns requested count', () => {
        const words = getRandomVocabulary(5);
        expect(words.length).toBe(5);
    });

    it('getRandomGrammarChallenges returns requested count', () => {
        const challenges = getRandomGrammarChallenges(3, 3);
        expect(challenges.length).toBe(3);
    });

    it('getRandomStoryTheme returns a valid theme', () => {
        const theme = getRandomStoryTheme();
        expect(Object.keys(storyLibrary)).toContain(theme);
    });

    it('getRandomReadingPassage returns a passage with events', () => {
        const passage = getRandomReadingPassage(3);
        expect(passage.title).toBeDefined();
        expect(passage.events.length).toBeGreaterThan(0);
    });
});
