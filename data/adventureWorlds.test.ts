/**
 * Tests básicos para datos críticos: Arena (worlds y misiones).
 * Ejecutar: npm run test
 */
import { describe, it, expect } from 'vitest';
import { adventureWorlds, type AdventureMission } from './adventureWorlds';

describe('adventureWorlds', () => {
    it('tiene un mundo por cada grado 1-5', () => {
        const grades = adventureWorlds.map((w) => w.grade);
        expect(grades).toContain(1);
        expect(grades).toContain(2);
        expect(grades).toContain(3);
        expect(grades).toContain(4);
        expect(grades).toContain(5);
        expect(adventureWorlds.length).toBeGreaterThanOrEqual(5);
    });

    it('world-g5 (Ciudadela del Tiempo) existe y tiene 10 misiones', () => {
        const g5 = adventureWorlds.find((w) => w.grade === 5);
        expect(g5).toBeDefined();
        expect(g5!.id).toBe('world-g5');
        expect(g5!.title.es).toMatch(/Ciudadela/i);
        expect(g5!.missions.length).toBe(10);
    });

    it('misiones de grado 5 tienen id m-g5-N y tutorIntro opcional', () => {
        const g5 = adventureWorlds.find((w) => w.grade === 5)!;
        const missions = g5.missions as (AdventureMission & { tutorIntro?: { es: string; en: string } })[];
        missions.forEach((m, i) => {
            expect(m.id).toBe(`m-g5-${i + 1}`);
            expect(m.title.es).toBeTruthy();
            expect(m.title.en).toBeTruthy();
            expect(m.problem.es).toBeTruthy();
            expect(m.reward.coins).toBeGreaterThan(0);
            expect(m.reward.xp).toBeGreaterThan(0);
        });
        // Las 10 misiones de g5 tienen tutorIntro e imagePrompt (definidos en el código)
        const withTutor = missions.filter((m) => m.tutorIntro);
        expect(withTutor.length).toBe(10);
    });

    it('cada mundo tiene lore y al menos una misión disponible', () => {
        adventureWorlds.forEach((world) => {
            expect(world.lore.es).toBeTruthy();
            expect(world.lore.en).toBeTruthy();
            const available = world.missions.some((m) => m.status === 'available');
            expect(available).toBe(true);
        });
    });
});
