import { describe, it, expect } from 'vitest';
import type { PersonalizedContent, PersonalizedVocabulary, PersonalizedSentence } from './usePersonalizedContent_mod';
import {
  generatePersonalizedEvalQuestions,
  generatePersonalizedFlashcards,
} from './usePersonalizedContent_mod';

const buildMockContent = (): PersonalizedContent => {
  const vocab: PersonalizedVocabulary[] = [
    {
      word: 'hypothesis',
      definition: 'An educated guess about what will happen',
      translation: 'hipótesis',
      example: 'My hypothesis is that plants need sunlight to grow.',
      category: 'science',
      difficulty: 'medium',
    },
    {
      word: 'experiment',
      definition: 'A test to find out if something is true',
      translation: 'experimento',
      example: 'We did an experiment with magnets.',
      category: 'science',
      difficulty: 'easy',
    },
    {
      word: 'total',
      definition: 'The whole amount or number',
      translation: 'total',
      example: 'The total of 5 and 3 is 8.',
      category: 'math',
      difficulty: 'easy',
    },
  ];

  const sentences: PersonalizedSentence[] = [
    {
      sentence: 'First, we mixed the chemicals. Then, we observed the reaction.',
      translation: undefined,
      focusArea: 'Instructions',
      grammarPoint: 'Sequence words',
      difficulty: 'easy',
    },
    {
      sentence: 'The experiment was successful because we followed the steps.',
      translation: undefined,
      focusArea: 'Science',
      grammarPoint: 'Cause and effect',
      difficulty: 'medium',
    },
  ];

  return {
    vocabulary: vocab,
    sentences,
    focusAreas: ['Science', 'Math'],
    gradeLevel: 3,
    challenges: [],
  };
};

describe('usePersonalizedContent helpers', () => {
  it('generates evaluation questions mixing vocabulary and grammar', () => {
    const content = buildMockContent();
    const questions = generatePersonalizedEvalQuestions(content, 4);

    expect(questions.length).toBe(4);

    // At least one vocabulary and one grammar question
    const skills = new Set(questions.map(q => q.skill));
    expect(skills.has('vocabulary')).toBe(true);
    expect(skills.has('grammar')).toBe(true);

    // All questions should have an id, question text and correctAnswer
    for (const q of questions) {
      expect(q.id).toMatch(/^pq-/);
      expect(q.question.length).toBeGreaterThan(0);
      expect(q.correctAnswer.length).toBeGreaterThan(0);
    }
  });

  it('generates flashcards from personalized vocabulary', () => {
    const content = buildMockContent();
    const cards = generatePersonalizedFlashcards(content);

    expect(cards.length).toBe(content.vocabulary.length);
    cards.forEach((card, idx) => {
      expect(card.id).toBe(`pfc-${idx}`);
      expect(card.front).toContain(content.vocabulary[idx].word);
      expect(card.back).toContain(content.vocabulary[idx].definition);
    });
  });
});

