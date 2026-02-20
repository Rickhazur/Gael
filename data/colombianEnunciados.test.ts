/**
 * Verifica que el bot reconozca enunciados típicos de matemáticas
 * de quinto grado en colegios colombianos (MEN, problemas verbales y geometría).
 */

import { describe, it, expect } from 'vitest';
import { parseWordProblem, parseGenericWordProblem } from './wordProblemParser';
import { AlgorithmicTutor } from '../services/algorithmicTutor';
import { ENUNCIADOS_COLOMBIANOS } from './colombianEnunciados';

describe('Enunciados colombianos - Parser de problemas verbales', () => {
    ENUNCIADOS_COLOMBIANOS.filter((e) => e.expectWordProblemParser).forEach((enunciado) => {
        it(`reconoce: ${enunciado.id} (${enunciado.text.slice(0, 50)}...)`, () => {
            const tank = parseWordProblem(enunciado.text);
            const generic = parseGenericWordProblem(enunciado.text);
            expect(tank != null || generic != null).toBe(true);
        });
    });
});

describe('Enunciados colombianos - Bot completo (AlgorithmicTutor)', () => {
    ENUNCIADOS_COLOMBIANOS.forEach((enunciado) => {
        it(`bot responde a: ${enunciado.id}`, () => {
            const response = AlgorithmicTutor.generateResponse(
                enunciado.text,
                [],
                'es',
                undefined,
                undefined
            );
            expect(response).not.toBeNull();
            expect(response!.steps).toBeDefined();
            expect(response!.steps!.length).toBeGreaterThan(0);
        });
    });
});
