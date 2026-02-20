import type { EnglishLevel } from '@/context/LearningContext';

export interface EnglishLevelConfig {
  level: EnglishLevel;
  /** High-level topics for missions and DailyNews. */
  targetTopics: string[];
  /** Vocabulary domains/tags to prioritise in activities like FlashRace. */
  vocabDomains: string[];
  /** Human-readable grammar points that the tutor can use in prompts. */
  grammarPoints: string[];
  /** Maximum words per sentence that tutors and generators should use. */
  maxSentenceWords: number;
  /** Maximum new words the tutor should introduce in a single turn. */
  maxNewWordsPerTurn: number;
  /**
   * Approximate Spanish support ratio (0–1) in BRIDGE mode.
   * Used as guidance for how much L1 meta-language and translation to provide.
   */
  bridgeSpanishRatio: number;
}

export const ENGLISH_CEFR_CONFIG: Record<EnglishLevel, EnglishLevelConfig> = {
  UNKNOWN: {
    level: 'UNKNOWN',
    targetTopics: ['me and my family', 'classroom', 'colors', 'numbers'],
    vocabDomains: ['basic', 'classroom', 'family', 'pets', 'colors'],
    grammarPoints: ['be', 'have', 'like', 'can'],
    maxSentenceWords: 5,
    maxNewWordsPerTurn: 3,
    bridgeSpanishRatio: 0.9,
  },
  A1: {
    level: 'A1',
    targetTopics: ['me and my family', 'classroom', 'colors', 'numbers'],
    vocabDomains: ['basic', 'classroom', 'family', 'pets', 'colors'],
    grammarPoints: ['be', 'have', 'like', 'can'],
    maxSentenceWords: 5,
    maxNewWordsPerTurn: 3,
    bridgeSpanishRatio: 0.7,
  },
  A2: {
    level: 'A2',
    targetTopics: ['daily routine', 'food', 'my town', 'hobbies'],
    vocabDomains: ['routine', 'food', 'town', 'hobbies'],
    grammarPoints: ['present simple', 'present continuous', 'past simple (limited)'],
    maxSentenceWords: 8,
    maxNewWordsPerTurn: 5,
    bridgeSpanishRatio: 0.5,
  },
  B1: {
    level: 'B1',
    targetTopics: ['school subjects', 'environment', 'technology', 'free time'],
    vocabDomains: ['school', 'environment', 'technology'],
    grammarPoints: [
      'past simple',
      'future (going to / will)',
      'present perfect (fixed phrases)',
      'first conditional',
    ],
    maxSentenceWords: 12,
    maxNewWordsPerTurn: 7,
    bridgeSpanishRatio: 0.3,
  },
  B2: {
    level: 'B2',
    targetTopics: ['opinions', 'projects', 'global issues'],
    vocabDomains: ['opinions', 'projects', 'global'],
    grammarPoints: [
      'present perfect',
      'conditionals 0/1',
      'relative clauses (who/that)',
      'advanced connectors (however / although / therefore / in addition)',
    ],
    maxSentenceWords: 15,
    maxNewWordsPerTurn: 7,
    bridgeSpanishRatio: 0.15,
  },
};

export const getEnglishLevelConfig = (level: EnglishLevel): EnglishLevelConfig =>
  ENGLISH_CEFR_CONFIG[level];

