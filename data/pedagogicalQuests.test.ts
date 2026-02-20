/**
 * Tests para pedagogicalQuests: estructura y cobertura del mapping Arena (g5).
 * Ejecutar: npm run test
 */
import { describe, it, expect } from 'vitest';
import {
    pedagogicalQuests,
    getPedagogicalQuestById,
    getPedagogicalQuestsByGrade,
    type PedagogicalQuestData,
} from './pedagogicalQuests';

describe('pedagogicalQuests', () => {
    it('tiene al menos una quest por grado 1-5', () => {
        for (let grade = 1; grade <= 5; grade++) {
            const byGrade = getPedagogicalQuestsByGrade(grade);
            expect(byGrade.length).toBeGreaterThanOrEqual(1);
        }
    });

    it('todas las quests tienen id único', () => {
        const ids = pedagogicalQuests.map((q) => q.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
    });

    it('cada quest tiene estructura válida (title, learningSteps, challenge, reward)', () => {
        pedagogicalQuests.forEach((q: PedagogicalQuestData) => {
            expect(q.id).toBeTruthy();
            expect(q.title?.es).toBeTruthy();
            expect(q.title?.en).toBeTruthy();
            expect(q.learningObjective?.es).toBeTruthy();
            expect(Array.isArray(q.learningSteps)).toBe(true);
            expect(q.learningSteps.length).toBeGreaterThanOrEqual(1);
            expect(q.challenge?.question?.es).toBeTruthy();
            expect(Array.isArray(q.challenge?.options)).toBe(true);
            expect(q.challenge?.correctOptionId).toBeTruthy();
            expect(typeof q.reward?.coins).toBe('number');
            expect(typeof q.reward?.xp).toBe('number');
        });
    });

    it('quests referenciadas por Arena g5 (m-g5-1, m-g5-3, m-g5-7) existen', () => {
        const arenaG5QuestIds = ['decimals-intro', 'percentages-g5', 'time-ethics-g5'];
        arenaG5QuestIds.forEach((id) => {
            const quest = getPedagogicalQuestById(id);
            expect(quest).toBeDefined();
            expect(quest!.grade).toBe(5);
        });
    });

    it('getPedagogicalQuestsByGrade(5) devuelve solo quests de grado 5', () => {
        const g5 = getPedagogicalQuestsByGrade(5);
        g5.forEach((q) => expect(q.grade).toBe(5));
    });
});
