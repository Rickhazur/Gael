import { describe, it, expect } from 'vitest';
import { generateDailyMissions } from './missionService';

describe('missionService.generateDailyMissions', () => {
  it('generates a basic set of daily missions for a student', async () => {
    const missions = await generateDailyMissions('student-1', 3);

    // Should create a small fixed set of templates
    expect(missions.length).toBeGreaterThanOrEqual(3);

    // All missions should be for the same student and available
    for (const mission of missions) {
      expect(mission.student_id).toBe('student-1');
      expect(mission.status).toBe('AVAILABLE');
      expect(typeof mission.title).toBe('string');
      expect(mission.title.length).toBeGreaterThan(0);
      expect(typeof mission.reward_coins).toBe('number');
      expect(typeof mission.reward_xp).toBe('number');
    }

    // Ensure we include a math, english, and research style mission by subject
    const subjects = new Set(missions.map(m => m.subject));
    expect(subjects.has('MATH')).toBe(true);
    expect(subjects.has('ENGLISH')).toBe(true);
    expect(subjects.has('RESEARCH')).toBe(true);
  });
});

