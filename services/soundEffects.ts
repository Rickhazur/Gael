class SoundManager {
    private context: AudioContext | null = null;

    public getContext() {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        return this.context;
    }

    playTone(freq: number, type: OscillatorType, duration: number, startTime = 0) {
        const ctx = this.getContext();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
    }

    playSuccess() {
        // C Major Arpeggio
        this.playTone(523.25, 'sine', 0.5, 0);       // C5
        this.playTone(659.25, 'sine', 0.5, 0.1);     // E5
        this.playTone(783.99, 'sine', 0.5, 0.2);     // G5
        this.playTone(1046.50, 'sine', 0.8, 0.3);    // C6
    }

    playError() {
        // Soft error
        this.playTone(200, 'triangle', 0.3, 0);
        this.playTone(150, 'triangle', 0.4, 0.1);
    }

    playPop() {
        this.playTone(800, 'sine', 0.1, 0);
    }

    playCoin() {
        this.playTone(1200, 'sine', 0.1, 0);
        this.playTone(1600, 'sine', 0.4, 0.05);
    }

    playWhoosh() {
        if (!this.context) this.getContext();
        const ctx = this.context!;

        // White noise buffer logic could be complex purely with web audio simpler oscillator sweep
        // Creating a quick sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    }

    playPageFlip() {
        if (!this.context) this.getContext();
        const ctx = this.context!;

        // Use a buffer for noise if possible, or just a quick filtered sweep
        const bufferSize = ctx.sampleRate * 0.5; // 0.5 sec
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
    }

    playTick() {
        this.playTone(800, 'sine', 0.05);
    }

    playClick() {
        this.playTone(400, 'sine', 0.1);
    }
    playCountdownSequence(startTimeOffset: number = 0) {
        if (!this.context) this.getContext();
        const ctx = this.context!;

        // Ensure context is running
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime + startTimeOffset;

        // Timings match RocketLaunchOverlay: 
        // 1.5s -> 3
        // 2.5s -> 2
        // 3.5s -> 1
        // 4.5s -> Lift Off

        // 3
        this.playTone(600, 'sine', 0.2, 1.5);
        // 2
        this.playTone(600, 'sine', 0.2, 2.5);
        // 1
        this.playTone(600, 'sine', 0.2, 3.5);

        // Lift Off (4.5s)
        const liftOffTime = now + 4.5;

        // 1. High Energy Burst
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(200, liftOffTime);
        osc.frequency.exponentialRampToValueAtTime(50, liftOffTime + 3);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, liftOffTime);
        gain.gain.exponentialRampToValueAtTime(0.01, liftOffTime + 4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(liftOffTime);
        osc.stop(liftOffTime + 4);

        // 2. White Noise Rumble
        const bufferSize = ctx.sampleRate * 4.0;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.0, liftOffTime);
        noiseGain.gain.linearRampToValueAtTime(0.2, liftOffTime + 0.5);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, liftOffTime + 4.0);

        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(liftOffTime);
    }

    playFuturisticTypewriter() {
        const ctx = this.getContext();
        // Skip if context suspended to avoid buildup
        if (ctx.state === 'suspended') return;

        const now = ctx.currentTime;

        // High-pitched electronic blip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.03);

        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.03);
    }
}

export const sfx = new SoundManager();
