import { describe, it, expect } from 'vitest';
import { AnswerValidator } from './utils';

describe('AnswerValidator', () => {
    describe('validate - digits', () => {
        it('accepts numeric digits', () => {
            expect(AnswerValidator.validate('15', 15)).toEqual({ isCorrect: true, userAnswer: 15, isNumericInput: true });
            expect(AnswerValidator.validate('42', 42)).toEqual({ isCorrect: true, userAnswer: 42, isNumericInput: true });
            expect(AnswerValidator.validate('0', 0)).toEqual({ isCorrect: true, userAnswer: 0, isNumericInput: true });
        });

        it('rejects wrong digits', () => {
            expect(AnswerValidator.validate('15', 16).isCorrect).toBe(false);
            expect(AnswerValidator.validate('42', 43).isCorrect).toBe(false);
        });

        it('extracts first number from input', () => {
            expect(AnswerValidator.validate('la respuesta es 25', 25).isCorrect).toBe(true);
            expect(AnswerValidator.validate('creo que es 7', 7).isCorrect).toBe(true);
        });

        it('handles decimals with tolerance', () => {
            expect(AnswerValidator.validate('3.14', 3.14, 0.01).isCorrect).toBe(true);
            expect(AnswerValidator.validate('0.5', 0.5).isCorrect).toBe(true);
        });
    });

    describe('validate - word numbers (ES/EN)', () => {
        it('accepts simple Spanish words', () => {
            expect(AnswerValidator.validate('quince', 15).isCorrect).toBe(true);
            expect(AnswerValidator.validate('veinte', 20).isCorrect).toBe(true);
            expect(AnswerValidator.validate('cero', 0).isCorrect).toBe(true);
        });

        it('accepts compound Spanish 21-29', () => {
            expect(AnswerValidator.validate('veinticinco', 25).isCorrect).toBe(true);
            expect(AnswerValidator.validate('veintiocho', 28).isCorrect).toBe(true);
        });

        it('accepts Spanish "X y Y" compounds', () => {
            expect(AnswerValidator.validate('treinta y dos', 32).isCorrect).toBe(true);
            expect(AnswerValidator.validate('la respuesta es cuarenta y cinco', 45).isCorrect).toBe(true);
        });

        it('accepts English hyphenated compounds', () => {
            expect(AnswerValidator.validate('twenty-five', 25).isCorrect).toBe(true);
            expect(AnswerValidator.validate('thirty-two', 32).isCorrect).toBe(true);
        });

        it('accepts English spaced compounds', () => {
            expect(AnswerValidator.validate('forty five', 45).isCorrect).toBe(true);
            expect(AnswerValidator.validate('ninety nine', 99).isCorrect).toBe(true);
        });
    });

    describe('validate - units stripping', () => {
        it('strips common units (metros, cm, etc)', () => {
            expect(AnswerValidator.validate('15 metros', 15).isCorrect).toBe(true);
            expect(AnswerValidator.validate('42 cm', 42).isCorrect).toBe(true);
            expect(AnswerValidator.validate('7 unidades', 7).isCorrect).toBe(true);
        });
    });

    describe('validate - numbers >100 and fractions in words', () => {
        it('accepts Spanish hundreds', () => {
            expect(AnswerValidator.validate('ciento veinticinco', 125).isCorrect).toBe(true);
            expect(AnswerValidator.validate('doscientos', 200).isCorrect).toBe(true);
        });

        it('accepts fractions in words', () => {
            expect(AnswerValidator.validate('tres cuartos', 0.75).isCorrect).toBe(true);
            expect(AnswerValidator.validate('un medio', 0.5).isCorrect).toBe(true);
            expect(AnswerValidator.validate('half', 0.5).isCorrect).toBe(true);
        });

        it('accepts EU number format (1.000,50)', () => {
            expect(AnswerValidator.validate('1.000', 1000).isCorrect).toBe(true);
            expect(AnswerValidator.validate('3,14', 3.14, 0.01).isCorrect).toBe(true);
        });
    });

    describe('validate - non-numeric input', () => {
        it('returns isNumericInput false for non-numeric text', () => {
            const r = AnswerValidator.validate('no sé', 15);
            expect(r.isNumericInput).toBe(false);
            expect(r.userAnswer).toBeNull();
        });
    });
});
