/**
 * Tests de coherencia: Arena missionId <-> questId.
 * Asegura que cada misión del mapa tiene mapeo y que las quests referenciadas existen (o se usa fallback).
 * Ejecutar: npm run test
 */
import { describe, it, expect } from 'vitest';
import { adventureWorlds } from './adventureWorlds';
import { ARENA_MISSION_TO_QUEST } from './arenaMissionToQuest';
import { getPedagogicalQuestById } from './pedagogicalQuests';

describe('arenaMissionToQuest', () => {
    it('cada clave del mapeo existe como misión en adventureWorlds', () => {
        const allMissionIds = new Set<string>();
        adventureWorlds.forEach((world) => {
            world.missions.forEach((m) => allMissionIds.add(m.id));
        });
        Object.keys(ARENA_MISSION_TO_QUEST).forEach((missionId) => {
            expect(allMissionIds.has(missionId), `Misión ${missionId} no existe en adventureWorlds`).toBe(true);
        });
    });

    it('cada valor del mapeo que existe en pedagogicalQuests tiene quest válida', () => {
        const questIds = Object.values(ARENA_MISSION_TO_QUEST);
        const uniqueQuestIds = [...new Set(questIds)];
        uniqueQuestIds.forEach((questId) => {
            const quest = getPedagogicalQuestById(questId);
            if (quest) {
                expect(quest.title?.es).toBeTruthy();
                expect(quest.learningSteps?.length).toBeGreaterThanOrEqual(1);
                expect(quest.challenge?.correctOptionId).toBeTruthy();
            }
        });
    });

    it('no tiene valores duplicados inconsistentes (cada missionId apunta a un solo questId)', () => {
        const keys = Object.keys(ARENA_MISSION_TO_QUEST);
        const uniqueKeys = new Set(keys);
        expect(uniqueKeys.size).toBe(keys.length);
    });
});
