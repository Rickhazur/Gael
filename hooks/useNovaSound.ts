import { useCallback } from 'react';
import { sfx } from '@/services/soundEffects';

// Nova Sound Synthesizer - 100% Code Generated Audio
// Connected to the shared global sfx manager context

const initAudio = () => {
    // Usamos el contexto global compartido para evitar conflictos de hardware
    return sfx.getContext();
};

export const useNovaSound = () => {

    const playHover = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Sci-Fi Blip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.05); // Zip up to A6

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }, []);

    const playClick = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;

        // Mechanical "Thud" + High "Chime" (Selection)
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.2); // Drop pitch

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3); // High ping

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc2.start();
        osc.stop(ctx.currentTime + 0.2);
        osc2.stop(ctx.currentTime + 0.2);
    }, []);

    const playSuccess = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;

        // Major Chord Arpeggio (C Major: C, E, G, C)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        const now = ctx.currentTime;

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const time = now + (i * 0.08); // Staggered

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.05, time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(time);
            osc.stop(time + 0.6);
        });
    }, []);

    const playBack = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }, []);

    const playStoreOpen = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;

        const now = ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880]; // A Major Chord

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq / 2, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 2, now + 1.5);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.04, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 2);
        });
    }, []);

    const playPurchase = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;

        const now = ctx.currentTime;
        for (let i = 0; i < 6; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const time = now + (i * 0.05);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200 + (Math.random() * 800), time);

            gain.gain.setValueAtTime(0.08, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 0.1);
        }
    }, []);

    const playStickerApply = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.1);
    }, []);

    const playNudge = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(100, ctx.currentTime);

        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
    }, []);

    const playTypewriter = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // High-pitched electronic blip (futuristic typewriter)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.03);

        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(now + 0.03);
    }, []);

    const playClassroomChatter = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;

        const now = ctx.currentTime;

        // CROWD BABBLE SYNTHESIZER
        // We simulate "formants" (vowel sounds like 'a', 'e', 'o') using band-pass filters
        const createBabbler = (isEnglish: boolean, delay: number) => {
            const startTime = now + delay;
            const duration = 4.0;

            const osc = ctx.createOscillator();
            const modulator = ctx.createOscillator();
            const modGain = ctx.createGain();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            // kids: 200-400Hz, adults: 100-200Hz
            const baseFreq = isEnglish ? 180 + Math.random() * 50 : 250 + Math.random() * 50;
            osc.frequency.setValueAtTime(baseFreq, startTime);

            // Intonation modulation
            modulator.frequency.value = 4 + Math.random() * 4;
            modGain.gain.value = 25;
            modulator.connect(modGain);
            modGain.connect(osc.frequency);

            filter.type = 'bandpass';
            filter.Q.value = 8;
            filter.frequency.setValueAtTime(500 + Math.random() * 1000, startTime);
            filter.frequency.exponentialRampToValueAtTime(800 + Math.random() * 500, startTime + 1);
            filter.frequency.exponentialRampToValueAtTime(400 + Math.random() * 1200, startTime + 2);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.12, startTime + 0.5); // Louder
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.type = Math.random() > 0.5 ? 'sawtooth' : 'triangle';
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            modulator.start(startTime);
            osc.start(startTime);
            osc.stop(startTime + duration);
            modulator.stop(startTime + duration);
        };

        // Trigger 15 overlapping babblers for a dense crowd
        for (let i = 0; i < 15; i++) {
            createBabbler(i % 2 === 0, Math.random() * 0.5);
        }
    }, []);

    return { playHover, playClick, playSuccess, playBack, playStoreOpen, playPurchase, playStickerApply, playNudge, playTypewriter, playClassroomChatter };
};

