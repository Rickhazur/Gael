// services/sounds.ts
// ============================================================================
// AUDIO FEEDBACK SYSTEM - Celebratory Sounds
// Uses Web Audio API for instant playback
// ============================================================================

// Pre-generated tones for instant feedback (no loading delay)
class SoundEffects {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;

    private getAudioContext(): AudioContext | null {
        if (!this.audioContext && typeof window !== 'undefined') {
            try {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio API not available');
            }
        }
        return this.audioContext;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    isEnabled() {
        return this.enabled;
    }

    // Simple beep generator
    private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
        if (!this.enabled) return;

        const ctx = this.getAudioContext();
        if (!ctx) return;

        try {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

            gainNode.gain.setValueAtTime(volume, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            console.warn('Sound playback failed:', e);
        }
    }

    // Play chord (multiple notes at once)
    private playChord(frequencies: number[], duration: number, type: OscillatorType = 'sine', volume: number = 0.2) {
        frequencies.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, duration, type, volume), i * 50);
        });
    }

    // ============================================================================
    // PUBLIC SOUND EFFECTS
    // ============================================================================

    // ✅ Correct answer - Happy ding
    playCorrect() {
        this.playChord([523.25, 659.25, 783.99], 0.3, 'sine', 0.2); // C5, E5, G5 (C Major)
    }

    // 🔥 Streak milestone - Ascending notes
    playStreak() {
        const notes = [392.00, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.15), i * 100);
        });
    }

    // 🏆 Problem complete - Fanfare
    playComplete() {
        const melody = [
            { freq: 523.25, delay: 0 },      // C5
            { freq: 659.25, delay: 100 },    // E5
            { freq: 783.99, delay: 200 },    // G5
            { freq: 1046.50, delay: 400 },   // C6
        ];
        melody.forEach(note => {
            setTimeout(() => this.playTone(note.freq, 0.4, 'triangle', 0.2), note.delay);
        });
    }

    // ⬆️ Level up - Epic ascending
    playLevelUp() {
        const notes = [
            261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
            329.63, 415.30, 523.25, 659.25, // E4, G#4, C5, E5
            392.00, 493.88, 587.33, 783.99, // G4, B4, D5, G5
        ];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.25, 'triangle', 0.15), i * 80);
        });
    }

    // ❌ Incorrect - Gentle nudge (not punishing)
    playIncorrect() {
        // Just a soft, short "think again" sound - not harsh
        this.playTone(220, 0.15, 'sine', 0.1); // A3
    }

    // 💡 Hint given - Soft notification
    playHint() {
        this.playTone(440, 0.1, 'sine', 0.1); // A4
        setTimeout(() => this.playTone(554.37, 0.1, 'sine', 0.1), 100); // C#5
    }

    // 🎉 Achievement unlocked
    playAchievement() {
        const fanfare = [
            { freq: 523.25, delay: 0 },
            { freq: 659.25, delay: 80 },
            { freq: 783.99, delay: 160 },
            { freq: 1046.50, delay: 300 },
            { freq: 1318.51, delay: 400 }, // E6
            { freq: 1567.98, delay: 500 }, // G6
        ];
        fanfare.forEach(note => {
            setTimeout(() => this.playTone(note.freq, 0.35, 'sine', 0.12), note.delay);
        });
    }

    // Button click
    playClick() {
        this.playTone(800, 0.05, 'sine', 0.08);
    }
}

// Singleton instance
export const sounds = new SoundEffects();

export default sounds;
