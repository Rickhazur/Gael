import { describe, it, expect } from 'vitest';
import { parseMathProblem, generateStepsForProblem } from './mathValidator';

describe('parseMathProblem', () => {
    it('parses basic operations', () => {
        expect(parseMathProblem('25 + 18')).toEqual({ num1: 25, num2: 18, operator: '+' });
        expect(parseMathProblem('50 - 12')).toEqual({ num1: 50, num2: 12, operator: '-' });
        expect(parseMathProblem('6 × 7')).toEqual({ num1: 6, num2: 7, operator: '×' });
        expect(parseMathProblem('48 ÷ 6')).toEqual({ num1: 48, num2: 6, operator: '÷' });
    });

    it('parses parenthesized expressions', () => {
        const r = parseMathProblem('(12 + 8) × 3');
        expect(r).not.toBeNull();
        expect(r!.num1).toBe(20);
        expect(r!.num2).toBe(3);
        expect(r!.operator).toBe('×');
    });

    it('parses add-sub chain (extracts first addition)', () => {
        const r = parseMathProblem('25 + 18 - 10');
        expect(r).not.toBeNull();
        expect(r!.num1).toBe(25);
        expect(r!.num2).toBe(18);
        expect(r!.operator).toBe('+');
    });
});

describe('generateStepsForProblem', () => {
    it('generates steps for addition', () => {
        const steps = generateStepsForProblem('47 + 38');
        expect(steps.length).toBeGreaterThan(0);
        expect(steps[0].operator).toBe('+');
    });

    it('generates steps for parenthesized multiplication', () => {
        const steps = generateStepsForProblem('(12 + 8) × 3');
        expect(steps.length).toBeGreaterThan(0);
    });
});
