export interface TopicStats {
    attempts: number;
    successes: number;
    avgTimeSeconds: number;
    lastStrategUsed: 'standard' | 'visual' | 'metaphor';
}

export interface GlobalInsights {
    difficultTopics: string[]; // e.g. ['long_division', 'fractions_subtraction']
    effectiveStrategies: Record<string, string>; // topic -> best_strategy
}

class LearningContextService {
    private static instance: LearningContextService;
    private studentStats: Record<string, TopicStats> = {};

    // "Global" insights (mocked backend data)
    private globalInsights: GlobalInsights = {
        difficultTopics: ['long_division', 'mixed_fractions'],
        effectiveStrategies: {
            'division': 'money_metaphor', // "Repartir dinero" works best
            'subtraction': 'giving_away', // "Regalar juguetes"
            'geometry': 'building_blocks'
        }
    };

    private constructor() {
        // Load from localStorage if available
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('nova_student_stats');
            if (saved) this.studentStats = JSON.parse(saved);
        }
    }

    static getInstance(): LearningContextService {
        if (!LearningContextService.instance) {
            LearningContextService.instance = new LearningContextService();
        }
        return LearningContextService.instance;
    }

    /**
     * Records a student interaction to improve future tutoring
     */
    logInteraction(topic: string, success: boolean, timeSeconds: number) {
        if (!this.studentStats[topic]) {
            this.studentStats[topic] = { attempts: 0, successes: 0, avgTimeSeconds: 0, lastStrategUsed: 'standard' };
        }

        const s = this.studentStats[topic];
        s.attempts++;
        if (success) s.successes++;
        s.avgTimeSeconds = (s.avgTimeSeconds * (s.attempts - 1) + timeSeconds) / s.attempts;

        // Save
        if (typeof window !== 'undefined') {
            localStorage.setItem('nova_student_stats', JSON.stringify(this.studentStats));
        }

        // Simulating "Global Learning" update
        if (!success && this.globalInsights.difficultTopics.indexOf(topic) === -1) {
            // If user fails a lot, maybe it becomes a "difficult topic" globally
            // (In a real app, this would send to server)
        }
    }

    /**
     * Returns a prompt snippet to inject into the AI Tutor
     */
    getPedagogicalContext(currentTopic?: string): string {
        let prompt = `\n### 🧠 ALGORITHMIC LEARNING CONTEXT (REAL-TIME ADAPTATION)\n`;

        // 1. Global Insights (Collective Intelligence)
        prompt += `**GLOBAL STUDENT INSIGHTS**:\n`;
        prompt += `- Hardest Topics for 4th Graders: ${this.globalInsights.difficultTopics.join(', ')}.\n`;
        if (currentTopic && this.globalInsights.effectiveStrategies[currentTopic]) {
            prompt += `- RECOMMENDED STRATEGY for '${currentTopic}': Use "${this.globalInsights.effectiveStrategies[currentTopic]}" analogy. (Success rate +15% globally).\n`;
        }

        // 2. Individual Profile
        const stats = currentTopic ? this.studentStats[currentTopic] : null;
        if (stats) {
            const successRate = stats.successes / stats.attempts;
            prompt += `\n**CURRENT STUDENT PROFILE**:\n`;
            prompt += `- Topic Mastery ('${currentTopic}'): ${Math.round(successRate * 100)}% (${stats.attempts} attempts).\n`;

            if (successRate < 0.5) {
                prompt += `🚨 **ADAPTATION TRIGGER**: Student is struggleing. SWITCH to "Concrete Examples" mode. Use shorter sentences. Be extremely encouraging.\n`;
            } else if (successRate > 0.9) {
                prompt += `🚀 **ADAPTATION TRIGGER**: Student is mastering this. CHALLENGE them. Ask "Why?" questions.\n`;
            }
        } else {
            prompt += `\n(New topic for this student. Start with standard balanced approach.)\n`;
        }

        return prompt;
    }
}

export const learningContext = LearningContextService.getInstance();
