import { describe, it, expect } from 'vitest';
import { AlgorithmicTutor } from './algorithmicTutor';

describe('AlgorithmicTutor', () => {
    const emptyHistory: { role: string; content: string }[] = [];

    describe('generateResponse - addition', () => {
        it('handles simple addition 25 + 18', () => {
            const r = AlgorithmicTutor.generateResponse('25 + 18', emptyHistory, 'es');
            expect(r).not.toBeNull();
            expect(r!.steps?.length).toBeGreaterThan(0);
            const op = r!.steps?.[0].operator ?? r!.steps?.[0].visualData?.operator;
            expect(op === '+' || r!.steps?.[0].visualType === 'vertical_op').toBeTruthy();
        });

        it('handles addition in English', () => {
            const r = AlgorithmicTutor.generateResponse('47 + 38', emptyHistory, 'en');
            expect(r).not.toBeNull();
            expect(r!.steps?.length).toBeGreaterThan(0);
        });
    });

    describe('generateResponse - subtraction', () => {
        it('handles subtraction 50 - 18', () => {
            const r = AlgorithmicTutor.generateResponse('50 - 18', emptyHistory, 'es');
            expect(r).not.toBeNull();
            expect(r!.steps?.length).toBeGreaterThan(0);
            const op = r!.steps?.[0].operator ?? r!.steps?.[0].visualData?.operator;
            expect(op === '-' || r!.steps?.[0].visualType === 'vertical_op').toBeTruthy();
        });
    });

    describe('generateResponse - multiplication', () => {
        it('handles multiplication 6 × 7', () => {
            const r = AlgorithmicTutor.generateResponse('6 x 7', emptyHistory, 'es');
            expect(r).not.toBeNull();
            expect(r!.steps?.length).toBeGreaterThan(0);
        });
    });

    describe('generateResponse - division', () => {
        it('handles division 48 ÷ 6', () => {
            const r = AlgorithmicTutor.generateResponse('48 ÷ 6', emptyHistory, 'es', 'latin');
            expect(r).not.toBeNull();
            expect(r!.steps?.length).toBeGreaterThan(0);
        });
    });

    describe('generateResponse - fractions', () => {
        it('handles fraction addition 1/2 + 1/4', () => {
            const r = AlgorithmicTutor.generateResponse('1/2 + 1/4', emptyHistory, 'es');
            expect(r).not.toBeNull();
            expect(r!.steps?.length).toBeGreaterThan(0);
        });
    });

    describe('generateResponse - no match', () => {
        it('returns null for non-math text', () => {
            const r = AlgorithmicTutor.generateResponse('¿Qué hora es?', emptyHistory, 'es');
            expect(r).toBeNull();
        });

        it('returns null for empty input', () => {
            const r = AlgorithmicTutor.generateResponse('', emptyHistory, 'es');
            expect(r).toBeNull();
        });
    });
});
