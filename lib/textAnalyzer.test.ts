// lib/textAnalyzer.test.ts
// Tests unitarios para detección de plagio y análisis de texto
import { describe, it, expect } from 'vitest';
import { analyzeText, checkPlagiarism, generateTutorMessages } from './textAnalyzer';

describe('textAnalyzer', () => {
    describe('analyzeText', () => {
        it('counts words correctly', () => {
            const result = analyzeText('This is a test sentence with seven words.', 'en');
            expect(result.wordCount).toBe(8);
        });

        it('detects empty text', () => {
            const result = analyzeText('', 'es');
            expect(result.wordCount).toBe(0);
            expect(result.hasLists).toBe(false);
            expect(result.hasDates).toBe(false);
        });

        it('detects bullet lists', () => {
            const text = '- First item\n- Second item\n- Third item';
            const result = analyzeText(text, 'en');
            expect(result.hasLists).toBe(true);
        });

        it('detects numbered lists', () => {
            const text = '1. First item\n2. Second item\n3. Third item';
            const result = analyzeText(text, 'en');
            expect(result.hasLists).toBe(true);
        });

        it('detects Spanish ordinals as lists', () => {
            const text = 'Primero, debemos entender. Segundo, hay que practicar. Tercero, aplicar.';
            const result = analyzeText(text, 'es');
            expect(result.hasLists).toBe(true);
        });

        it('detects dates in DD/MM/YYYY format', () => {
            const text = 'El evento ocurrió el 15/03/2024 en la ciudad.';
            const result = analyzeText(text, 'es');
            expect(result.hasDates).toBe(true);
            expect(result.importantDates).toContain('15/03/2024');
        });

        it('detects year-only dates', () => {
            const text = 'The discovery was made in 1969 by scientists.';
            const result = analyzeText(text, 'en');
            expect(result.hasDates).toBe(true);
            expect(result.importantDates).toContain('1969');
        });

        it('detects Spanish month dates', () => {
            const text = 'Fue el 12 de octubre cuando llegó Colón.';
            const result = analyzeText(text, 'es');
            expect(result.hasDates).toBe(true);
        });

        it('detects English month dates', () => {
            const text = 'It happened on January 2020 during winter.';
            const result = analyzeText(text, 'en');
            expect(result.hasDates).toBe(true);
        });

        it('identifies long text (>150 words)', () => {
            const words = Array(160).fill('word').join(' ');
            const result = analyzeText(words, 'en');
            expect(result.isLongText).toBe(true);
        });

        it('identifies short text (<150 words)', () => {
            const words = Array(50).fill('word').join(' ');
            const result = analyzeText(words, 'en');
            expect(result.isLongText).toBe(false);
        });

        it('extracts key points from text with importance keywords', () => {
            const text = 'La idea principal es que el agua es importante para la vida. Esto es fundamental para entender el ciclo.';
            const result = analyzeText(text, 'es');
            expect(result.keyPoints.length).toBeGreaterThan(0);
        });

        it('extracts main ideas from English text', () => {
            const text = 'The main point is that water is essential for life. This is a key concept.';
            const result = analyzeText(text, 'en');
            expect(result.mainIdeas.length).toBeGreaterThan(0);
        });
    });

    describe('checkPlagiarism', () => {
        it('detects 100% copied text as plagiarism', () => {
            const source = 'The water cycle is an important natural process that affects all life on Earth.';
            const paraphrased = 'The water cycle is an important natural process that affects all life on Earth.';
            const result = checkPlagiarism(source, paraphrased);
            expect(result.isPlagiarism).toBe(true);
            expect(result.percentage).toBeGreaterThanOrEqual(90);
        });

        it('allows completely different text (good paraphrasing)', () => {
            const source = 'The water cycle is an important natural process that affects all life on Earth.';
            const paraphrased = 'Precipitation and evaporation create a continuous movement of moisture in our atmosphere.';
            const result = checkPlagiarism(source, paraphrased);
            expect(result.isPlagiarism).toBe(false);
            expect(result.percentage).toBeLessThan(40);
        });

        it('detects partial copying (moderate similarity)', () => {
            const source = 'The water cycle includes evaporation, condensation, and precipitation as main stages.';
            const paraphrased = 'The water cycle has evaporation and condensation plus other steps like precipitation.';
            const result = checkPlagiarism(source, paraphrased);
            // Should detect some similarity but may or may not trigger plagiarism
            expect(result.percentage).toBeGreaterThan(20);
        });

        it('detects consecutive phrase copying (3+ words)', () => {
            const source = 'Scientists discovered that plants need sunlight to grow properly and produce food.';
            const paraphrased = 'Research shows that plants need sunlight to develop and create nutrients.';
            const result = checkPlagiarism(source, paraphrased);
            // "plants need sunlight" is copied (3 consecutive words)
            expect(result.percentage).toBeGreaterThan(15);
        });

        it('handles empty source text', () => {
            const result = checkPlagiarism('', 'Some paraphrased text here.');
            expect(result.isPlagiarism).toBe(false);
            expect(result.percentage).toBe(0);
        });

        it('handles empty paraphrased text', () => {
            const result = checkPlagiarism('Some source text here.', '');
            expect(result.isPlagiarism).toBe(false);
            expect(result.percentage).toBe(0);
        });

        it('handles very short text with only small words', () => {
            // Words with length <= 3 are filtered out, so "Hi" and "the" should not count
            const result = checkPlagiarism('Hi the cat', 'Hi the dog');
            // Only "cat" and "dog" matter (length > 3), and they're different
            // So plagiarism should be low or zero
            expect(result.percentage).toBeLessThanOrEqual(50);
        });

        it('detects plagiarism even with short identical text', () => {
            const result = checkPlagiarism('Hello there friend', 'Hello there friend');
            // "Hello", "there", "friend" are all > 3 chars, all match
            expect(result.percentage).toBeGreaterThan(80);
        });

        it('is case insensitive', () => {
            const source = 'THE WATER CYCLE is important for our planet.';
            const paraphrased = 'the water cycle is important for our planet.';
            const result = checkPlagiarism(source, paraphrased);
            expect(result.percentage).toBeGreaterThan(80);
        });

        it('filters out small words (length <= 3)', () => {
            const source = 'The cat sat on the mat in the sun.';
            const paraphrased = 'A dog ran by the hat near the fun.';
            const result = checkPlagiarism(source, paraphrased);
            // Only words > 3 chars matter, so similarity should be low
            expect(result.percentage).toBeLessThan(50);
        });

        it('Spanish text plagiarism detection works', () => {
            const source = 'El ciclo del agua es un proceso natural muy importante para la vida en la Tierra.';
            const paraphrased = 'El ciclo del agua es un proceso natural muy importante para la vida en la Tierra.';
            const result = checkPlagiarism(source, paraphrased);
            expect(result.isPlagiarism).toBe(true);
        });

        it('Spanish good paraphrasing is not flagged', () => {
            const source = 'El ciclo del agua es un proceso natural muy importante para la vida en la Tierra.';
            const paraphrased = 'La evaporación y precipitación son fenómenos que permiten el movimiento del agua en nuestro planeta.';
            const result = checkPlagiarism(source, paraphrased);
            expect(result.isPlagiarism).toBe(false);
        });
    });

    describe('generateTutorMessages', () => {
        const baseAnalysis = {
            hasLists: false,
            hasDates: false,
            isLongText: false,
            mainIdeas: ['Main idea here'],
            keyPoints: ['Key point one'],
            importantDates: [],
            wordCount: 100,
            isPlagiarism: false,
            plagiarismPercentage: 0,
        };

        it('generates list tip when text has lists', () => {
            const analysis = { ...baseAnalysis, hasLists: true };
            const messages = generateTutorMessages(analysis, 3, 'es', 'analyze');
            expect(messages.some(m => m.id === 'list-tip')).toBe(true);
        });

        it('generates date tip when text has dates', () => {
            const analysis = { ...baseAnalysis, hasDates: true, importantDates: ['1969', '2024'] };
            const messages = generateTutorMessages(analysis, 4, 'es', 'analyze');
            expect(messages.some(m => m.id === 'dates-tip')).toBe(true);
        });

        it('generates long text tip when text is long', () => {
            const analysis = { ...baseAnalysis, isLongText: true, wordCount: 200 };
            const messages = generateTutorMessages(analysis, 5, 'en', 'analyze');
            expect(messages.some(m => m.id === 'long-tip')).toBe(true);
        });

        it('generates plagiarism warning when plagiarism detected', () => {
            const analysis = { ...baseAnalysis, isPlagiarism: true, plagiarismPercentage: 65 };
            const messages = generateTutorMessages(analysis, 3, 'es', 'paraphrase');
            const warning = messages.find(m => m.id === 'plagiarism-warning');
            expect(warning).toBeDefined();
            expect(warning?.type).toBe('warning');
            expect(warning?.message).toContain('65%');
        });

        it('generates grade-appropriate starters for grade 1', () => {
            const analysis = { ...baseAnalysis, hasLists: true };
            const messages = generateTutorMessages(analysis, 1, 'es', 'analyze');
            const listTip = messages.find(m => m.id === 'list-tip');
            expect(listTip?.starters).toBeDefined();
            expect(listTip?.starters?.some(s => s.includes('Me gustó'))).toBe(true);
        });

        it('generates grade-appropriate starters for grade 5', () => {
            const analysis = { ...baseAnalysis, hasLists: true };
            const messages = generateTutorMessages(analysis, 5, 'es', 'analyze');
            const listTip = messages.find(m => m.id === 'list-tip');
            expect(listTip?.starters).toBeDefined();
            expect(listTip?.starters?.some(s => s.includes('argumentos') || s.includes('fundamentales'))).toBe(true);
        });

        it('generates English messages when language is en', () => {
            const analysis = { ...baseAnalysis, hasLists: true };
            const messages = generateTutorMessages(analysis, 3, 'en', 'analyze');
            const listTip = messages.find(m => m.id === 'list-tip');
            expect(listTip?.message).toContain('This text has a list');
        });

        it('generates encouragement when no specific tips apply', () => {
            const analysis = { ...baseAnalysis, keyPoints: [] };
            const messages = generateTutorMessages(analysis, 3, 'es', 'analyze');
            expect(messages.some(m => m.type === 'encouragement')).toBe(true);
        });

        it('adapts word limit recommendation to grade level', () => {
            const analysis = { ...baseAnalysis, isLongText: true, wordCount: 200 };

            const grade1Messages = generateTutorMessages(analysis, 1, 'es', 'analyze');
            const grade5Messages = generateTutorMessages(analysis, 5, 'es', 'analyze');

            const grade1Tip = grade1Messages.find(m => m.id === 'long-tip');
            const grade5Tip = grade5Messages.find(m => m.id === 'long-tip');

            // Grade 1 should have lower word limit (30) vs Grade 5 (150)
            expect(grade1Tip?.message).toContain('30');
            expect(grade5Tip?.message).toContain('150');
        });

        it('asks for fewer list items for lower grades', () => {
            const analysis = { ...baseAnalysis, hasLists: true };

            const grade1Messages = generateTutorMessages(analysis, 1, 'es', 'analyze');
            const grade5Messages = generateTutorMessages(analysis, 5, 'es', 'analyze');

            const grade1Tip = grade1Messages.find(m => m.id === 'list-tip');
            const grade5Tip = grade5Messages.find(m => m.id === 'list-tip');

            // Grade 1-2 asks for 2 items, Grade 3+ asks for 3
            expect(grade1Tip?.message).toContain('2');
            expect(grade5Tip?.message).toContain('3');
        });
    });
});
