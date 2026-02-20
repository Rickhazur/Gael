import { describe, it, expect } from 'vitest';
import { parseGenericWordProblem } from './wordProblemParser';

describe('parseGenericWordProblem', () => {
    it('parses multi-step: tenía 50, compró 30, vendió 20', () => {
        const r = parseGenericWordProblem('Un tanque tenía 50 litros. Compré 30 litros más. Vendí 20. ¿Cuántos litros quedan?');
        expect(r).not.toBeNull();
        expect(r!.type).toBe('multi_step');
        if (r!.type === 'multi_step') {
            expect(r.n1).toBe(50);
            expect(r.n2).toBe(30);
            expect(r.n3).toBe(20);
            expect(r.op2).toBe('+');
            expect(r.op3).toBe('-');
            expect(r.unit).toBe('litros');
        }
    });

    it('parses add_quantities: X kg + Y kg', () => {
        const r = parseGenericWordProblem('Ana compró 2.5 kg y 1.75 kg de manzanas. ¿Cuántos kg en total?');
        expect(r).not.toBeNull();
        expect(r!.type).toBe('add_quantities');
    });
});
