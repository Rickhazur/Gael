// Microsoft Edge TTS Service - Free voices
// Uses the Web Speech API available in modern browsers

export interface EdgeVoiceConfig {
    name: string;
    altNames?: string[];
    lang: string;
    rate: number;
    pitch: number;
    gender?: 'male' | 'female';
}

export interface SpeechOptions {
    rate?: number;
    pitch?: number;
}

/**
 * Preprocesador de símbolos matemáticos para TTS.
 * Convierte notación matemática a español hablado natural.
 * Ejemplo: "2/3 + 1/4 = 5/6" → "dos tercios más un cuarto es igual a cinco sextos"
 */
export function preprocessMathForSpeech(text: string): string {
    let result = text;

    // ─── Operadores básicos ───
    result = result.replace(/\s*\+\s*/g, ' más ');
    result = result.replace(/\s*-\s*/g, ' menos ');
    result = result.replace(/\s*[×x✕]\s*/gi, ' por ');
    result = result.replace(/\s*[÷/]\s*(?=\d)/g, ' entre ');
    result = result.replace(/\s*=\s*/g, ' es igual a ');
    result = result.replace(/\s*≠\s*/g, ' no es igual a ');
    result = result.replace(/\s*≈\s*/g, ' es aproximadamente ');
    result = result.replace(/\s*≥\s*/g, ' es mayor o igual que ');
    result = result.replace(/\s*≤\s*/g, ' es menor o igual que ');
    result = result.replace(/\s*>\s*/g, ' es mayor que ');
    result = result.replace(/\s*<\s*/g, ' es menor que ');
    
    // ─── Flechas de relación (ej: Regla de tres) ───
    result = result.replace(/\s*(→|->|=>)\s*/g, ', son, ');

    // ─── Raíz cuadrada ───
    result = result.replace(/√(\d+)/g, 'raíz cuadrada de $1');
    result = result.replace(/√/g, 'raíz cuadrada de ');

    // ─── Potencias ───
    result = result.replace(/(\d+)²/g, '$1 al cuadrado');
    result = result.replace(/(\d+)³/g, '$1 al cubo');
    result = result.replace(/(\d+)\^(\d+)/g, '$1 elevado a la $2');

    // ─── Pi ───
    result = result.replace(/π/g, 'pi');
    result = result.replace(/∞/g, 'infinito');

    // ─── Fracciones comunes habladas ───
    result = result.replace(/\b1\/2\b/g, 'un medio');
    result = result.replace(/\b1\/3\b/g, 'un tercio');
    result = result.replace(/\b2\/3\b/g, 'dos tercios');
    result = result.replace(/\b1\/4\b/g, 'un cuarto');
    result = result.replace(/\b3\/4\b/g, 'tres cuartos');
    result = result.replace(/\b1\/5\b/g, 'un quinto');
    result = result.replace(/\b2\/5\b/g, 'dos quintos');
    result = result.replace(/\b3\/5\b/g, 'tres quintos');
    result = result.replace(/\b4\/5\b/g, 'cuatro quintos');
    result = result.replace(/\b1\/6\b/g, 'un sexto');
    result = result.replace(/\b5\/6\b/g, 'cinco sextos');
    result = result.replace(/\b1\/8\b/g, 'un octavo');
    result = result.replace(/\b3\/8\b/g, 'tres octavos');
    result = result.replace(/\b1\/10\b/g, 'un décimo');

    // ─── Fracciones genéricas (a/b) ───
    const fractionNames: Record<string, string> = {
        '2': 'medios', '3': 'tercios', '4': 'cuartos', '5': 'quintos',
        '6': 'sextos', '7': 'séptimos', '8': 'octavos', '9': 'novenos',
        '10': 'décimos', '12': 'dozavos', '100': 'centésimos'
    };
    result = result.replace(/(\d+)\/(\d+)/g, (_, num, den) => {
        const denName = fractionNames[den];
        if (denName) return `${num} ${denName}`;
        return `${num} sobre ${den}`;
    });

    // ─── Porcentajes ───
    result = result.replace(/(\d+)%/g, '$1 por ciento');

    // ─── Paréntesis (sólo pausa visual/auditiva en vez de leer literal) ───
    result = result.replace(/\(/g, ', ');
    result = result.replace(/\)/g, ', ');

    // ─── Signos financieros ───
    result = result.replace(/\$\s*(\d[\d.,]*)/g, '$1 pesos');

    // ─── Cleanup multiple spaces ───
    result = result.replace(/\s{2,}/g, ' ').trim();

    return result;
}

// Voces optimizadas para Lina (español colombiano) y Rachelle (inglés americano)
export const EDGE_VOICES = {
    lina: {
        name: 'Salomé',
        altNames: ['Dalia', 'Elena', 'Laura', 'colombia', 'latino'],
        lang: 'es-CO',
        rate: 1.15, // Faster pace for dynamic explanations
        pitch: 1.1, // Slightly higher for warmth and energy
        gender: 'female'
    } as EdgeVoiceConfig,
    female: {
        name: 'Salomé',
        altNames: ['Dalia', 'Elena', 'Laura', 'colombia', 'latino'],
        lang: 'es-CO',
        rate: 0.9,
        pitch: 1.0,
        gender: 'female'
    } as EdgeVoiceConfig,
    male: {
        name: 'Jorge',
        altNames: ['Gonzalo', 'mexico', 'natural', 'gerardo', 'latino'],
        lang: 'es-MX',
        rate: 0.8,
        pitch: 0.75,
        gender: 'male'
    } as EdgeVoiceConfig,
    rachelle: {
        name: 'Microsoft Jenny Online (Natural)',
        altNames: ['Samantha', 'Victoria', 'Jenny', 'Jenny Online', 'English', 'Google US English', 'US English', 'Female'],
        lang: 'en-US',
        rate: 0.85, // Slower for ESL learners
        pitch: 1.1,
        gender: 'female'
    } as EdgeVoiceConfig,
    spark: {
        name: 'Jorge',
        altNames: ['mexico', 'natural', 'latino'],
        lang: 'es-MX',
        rate: 0.9,
        pitch: 1.05,
        gender: 'male'
    } as EdgeVoiceConfig,
    chronos: {
        name: 'Gonzalo',
        lang: 'es-CO',
        rate: 0.9,
        pitch: 1.0,
        gender: 'male'
    } as EdgeVoiceConfig,
    jorge: {
        name: 'Jorge',
        altNames: ['Gonzalo', 'mexico', 'natural', 'gerardo', 'latino'],
        lang: 'es-MX',
        rate: 0.8,
        pitch: 0.75,
        gender: 'male'
    } as EdgeVoiceConfig,
    gonzalo: {
        name: 'Gonzalo',
        lang: 'es-CO',
        rate: 0.9,
        pitch: 1.0,
        gender: 'male'
    } as EdgeVoiceConfig,
    diego: {
        name: 'Diego',
        altNames: ['juan', 'carlos', 'mexico', 'latino'],
        lang: 'es-MX',
        rate: 0.85,
        pitch: 0.85,
        gender: 'male'
    } as EdgeVoiceConfig,
    guy: {
        name: 'Microsoft Guy Online (Natural)',
        lang: 'en-US',
        rate: 0.8, // Clear and slow for instruction
        pitch: 1.0,
        gender: 'male'
    } as EdgeVoiceConfig,
    ana: {
        name: 'Microsoft Ana Online (Natural)',
        lang: 'en-US',
        rate: 0.85,
        pitch: 1.1,
        gender: 'female'
    } as EdgeVoiceConfig
};

// Textos de saludo pregrabados para Lina (se usarán con TTS dinámico)
export const LINA_GREETING_TEXTS = [
    "¡Hola! Soy la Profe Lina. ¿Listo para aprender matemáticas?",
    "¡Woooow! ¡Qué alegría verte! Vamos a resolver esto juntos.",
    "¡Hola campeón! ¿Qué ejercicio vamos a conquistar hoy?",
    "¡Esa es la actitud! Hoy vamos a brillar con las matemáticas."
];

class EdgeTTSService {
    private synth: SpeechSynthesis;
    private voices: SpeechSynthesisVoice[] = [];
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private voicesReady: boolean = false;

    constructor() {
        this.synth = window.speechSynthesis;
        this.loadVoices();
    }

    private loadVoices() {
        const load = () => {
            const allVoices = this.synth.getVoices();
            if (allVoices.length > this.voices.length) {
                this.voices = allVoices;
                this.voicesReady = true;
                console.log('✅ Edge TTS loaded', this.voices.length, 'voices');
                // Log available Spanish voices for debugging
                const spanishVoices = this.voices.filter(v => v.lang.toLowerCase().startsWith('es'));
                console.log('🇪🇸 Spanish voices:', spanishVoices.map(v => `${v.name} (${v.lang})`).join(', '));
            }
        };

        // Load immediately if available
        load();

        // ALWAYS listen for voiceschanged — browser loads voices in phases
        // First phase: ~3 basic voices. Second phase: ALL voices including Dalia
        this.synth.onvoiceschanged = load;

        // Fallback: poll for voices every 500ms for 5 seconds
        let attempts = 0;
        const poll = setInterval(() => {
            load();
            attempts++;
            if (this.voices.length > 10 || attempts > 10) {
                clearInterval(poll);
            }
        }, 500);
    }

    // Force refresh voices before speaking (in case they loaded late)
    private refreshVoices() {
        const fresh = this.synth.getVoices();
        if (fresh.length > this.voices.length) {
            this.voices = fresh;
            console.log('🔄 Voices refreshed:', this.voices.length, 'voices');
        }
    }

    // BLOCKED: Never use Spain Spanish voices
    private isSpainVoice(v: SpeechSynthesisVoice): boolean {
        const lang = v.lang.toLowerCase();
        const name = v.name.toLowerCase();
        return lang === 'es-es' || name.includes('españa') || name.includes('spain')
            || name.includes('alvaro') || name.includes('elvira') || name.includes('helena');
    }

    private findBestVoice(config: EdgeVoiceConfig): SpeechSynthesisVoice | null {
        const langGroup = config.lang.split('-')[0].toLowerCase();

        // For Spanish voices: NEVER use es-ES (Spain)
        const isSpanish = langGroup === 'es';
        const filter = (v: SpeechSynthesisVoice) => !isSpanish || !this.isSpainVoice(v);

        // 1. Exact name match in correct language family
        const exactMatch = this.voices.find(v =>
            filter(v) &&
            v.name.toLowerCase().includes(config.name.toLowerCase()) &&
            v.lang.toLowerCase().includes(langGroup)
        );
        if (exactMatch) {
            console.log(`🎤 Voice selected: "${exactMatch.name}" (${exactMatch.lang}) [exact name]`);
            return exactMatch;
        }

        // 2. Try altNames
        if (config.altNames) {
            for (const alt of config.altNames) {
                const altMatch = this.voices.find(v =>
                    filter(v) &&
                    v.name.toLowerCase().includes(alt.toLowerCase()) &&
                    v.lang.toLowerCase().includes(langGroup)
                );
                if (altMatch) {
                    console.log(`🎤 Voice selected: "${altMatch.name}" (${altMatch.lang}) [altName: ${alt}]`);
                    return altMatch;
                }
            }
        }

        // 3. Prefer female voices for English female configs
        if (config.gender === 'female' && !isSpanish) {
            const exactLangMatchFemale = this.voices.find(v =>
                filter(v) && v.lang.toLowerCase() === config.lang.toLowerCase() &&
                (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('victoria') || v.name.toLowerCase().includes('jenny'))
            );
            if (exactLangMatchFemale) {
                console.log(`🎤 Voice selected: "${exactLangMatchFemale.name}" (${exactLangMatchFemale.lang}) [female exact lang]`);
                return exactLangMatchFemale;
            }
        }

        // 4. Exact lang match (e.g., es-MX)
        const exactLangMatch = this.voices.find(v =>
            filter(v) && v.lang.toLowerCase() === config.lang.toLowerCase()
        );
        if (exactLangMatch) {
            console.log(`🎤 Voice selected: "${exactLangMatch.name}" (${exactLangMatch.lang}) [exact lang]`);
            return exactLangMatch;
        }

        // 5. For Spanish: prioritize Latin American variants
        if (isSpanish) {
            const latinCodes = ['es-mx', 'es-co', 'es-ar', 'es-us', 'es-cl', 'es-pe', 'es-ve'];
            for (const code of latinCodes) {
                const latinMatch = this.voices.find(v =>
                    v.lang.toLowerCase() === code
                );
                if (latinMatch) {
                    console.log(`🎤 Voice selected: "${latinMatch.name}" (${latinMatch.lang}) [latin fallback]`);
                    return latinMatch;
                }
            }
            // Any Spanish that is NOT Spain
            const anyLatinSpanish = this.voices.find(v =>
                v.lang.toLowerCase().startsWith('es') && !this.isSpainVoice(v)
            );
            if (anyLatinSpanish) {
                console.log(`🎤 Voice selected: "${anyLatinSpanish.name}" (${anyLatinSpanish.lang}) [any latin]`);
                return anyLatinSpanish;
            }
        }

        // 5. Any voice in the same language group (non-Spain for Spanish)
        const langMatch = this.voices.find(v =>
            filter(v) && v.lang.toLowerCase().startsWith(langGroup)
        );
        if (langMatch) {
            console.log(`🎤 Voice selected: "${langMatch.name}" (${langMatch.lang}) [lang group]`);
            return langMatch;
        }

        // 5. Last resort fallback: ONLY if the language matches!
        // Never ever return a Spanish voice as a fallback for English (and vice versa)
        // because it sounds like a foreigner trying to speak (the "Latin accent" issue).
        const finalSameLangFallback = this.voices.find(v => v.lang.toLowerCase().startsWith(langGroup));
        if (finalSameLangFallback) {
            console.log(`🎤 Voice selected: "${finalSameLangFallback.name}" (${finalSameLangFallback.lang}) [last same-lang fallback]`);
            return finalSameLangFallback;
        }

        console.warn(`⚠️ No suitable voice found for "${langGroup}". Allowing browser default.`);
        return null;
    }

    private addExpressiveness(utterance: SpeechSynthesisUtterance, tutor: string, config: EdgeVoiceConfig): void {
        // Add dynamic pitch and rate variation for Lina and Rachelle to make them more expressive
        if (tutor === 'lina') {
            const basePitch = utterance.pitch;
            const baseRate = utterance.rate;

            // DYNAMIC pitch variation — wider swings for an energetic teacher
            const pitchVariation = (Math.sin(Date.now() * 0.0012) * 0.15) + (Math.random() * 0.08);
            utterance.pitch = basePitch + pitchVariation;

            // DYNAMIC rate variation — faster cycling for rapid explanations
            const rateVariation = (Math.sin(Date.now() * 0.001) * 0.12) + (Math.random() * 0.05);
            utterance.rate = baseRate + rateVariation;
        } else if (tutor === 'rachelle') {
            const basePitch = utterance.pitch;
            const baseRate = utterance.rate;

            // Dynamic pitch variation for expressiveness (subtler for English)
            const pitchVariation = (Math.sin(Date.now() * 0.0008) * 0.06) + (Math.random() * 0.03);
            utterance.pitch = basePitch + pitchVariation;

            // Dynamic rate variation for natural flow
            const rateVariation = (Math.sin(Date.now() * 0.0006) * 0.05) + (Math.random() * 0.02);
            utterance.rate = baseRate + rateVariation;
        } else if (tutor === 'spark') {
            // Robotic/AI: Clean, stable, slightly higher pitch for a futuristic feel
            utterance.pitch = 1.15;
            utterance.rate = 1.05;
        }

        // Clamp values to prevent extreme settings
        utterance.rate = Math.max(0.5, Math.min(2, utterance.rate));
        utterance.pitch = Math.max(0.5, Math.min(2, utterance.pitch));
    }

    async speak(text: string, tutor: keyof typeof EDGE_VOICES = 'lina', options?: SpeechOptions & { cancelExisting?: boolean }): Promise<void> {
        // Cancel previous speech to prevent queue buildup
        this.synth.cancel();
        this.currentUtterance = null;

        // Chrome bug: cancel() can leave synth stuck in paused state (common after tab
        // refresh or background tab). Resume before queuing next utterance.
        if (this.synth.paused) {
            this.synth.resume();
        }

        return new Promise((resolve) => {
            const config = EDGE_VOICES[tutor];

            // Clean emojis and weird characters from text so TTS doesn't read them
            let cleanText = text
                .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F0F5}\u{1F200}-\u{1F270}\u{2600}-\u{26FF}\u{2300}-\u{23FF}]/gu, '')
                .replace(/\*\*/g, '')
                .replace(/#+\s*/g, '') // Remove markdown headers
                .replace(/`[^`]*`/g, (m) => m.replace(/`/g, '')) // Remove backticks
                .replace(/\s+/g, ' ')
                .trim();

            // Apply math symbol preprocessing for Spanish speech
            if (config.lang.startsWith('es')) {
                cleanText = preprocessMathForSpeech(cleanText);
            }

            if (!cleanText) { resolve(); return; }

            const utterance = new SpeechSynthesisUtterance(cleanText);

            // CRITICAL: Set the language explicitly so the browser knows how to pronounce it!
            // Without this, Rachelle will speak English using Spanish phonetics (strong Latin accent).
            utterance.lang = config.lang;

            utterance.rate = options?.rate !== undefined ? (config.rate + (options.rate / 100)) : config.rate;
            utterance.pitch = options?.pitch !== undefined ? (config.pitch + (options.pitch / 100)) : config.pitch;
            utterance.volume = 1.0;

            this.refreshVoices();
            const selectedVoice = this.findBestVoice(config);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            this.addExpressiveness(utterance, tutor, config);

            utterance.onstart = () => {
                window.dispatchEvent(new CustomEvent('nova-demo-voice', { detail: { voice: tutor } }));
            };

            utterance.onend = () => {
                this.currentUtterance = null;
                window.dispatchEvent(new CustomEvent('nova-demo-voice-end', { detail: { voice: tutor } }));
                resolve();
            };

            utterance.onerror = (e) => {
                console.warn('🔇 TTS error:', (e as any).error);
                this.currentUtterance = null;
                window.dispatchEvent(new CustomEvent('nova-demo-voice-end', { detail: { voice: tutor } }));
                resolve();
            };

            this.currentUtterance = utterance;

            // Chrome bug: calling speak() immediately after cancel() on the same tick
            // causes the utterance to silently fail (no onstart, no onend).
            // A small delay lets the browser flush the cancel before queuing new speech.
            setTimeout(() => {
                if (this.synth.paused) this.synth.resume();
                this.synth.speak(utterance);
            }, 50);
        });
    }

    stop() {
        if (this.synth) {
            this.synth.cancel();
            this.currentUtterance = null;
        }
    }
}

export const edgeTTS = new EdgeTTSService();

export async function generateSpeech(text: string, voiceId?: string, options?: SpeechOptions & { cancelExisting?: boolean }): Promise<void> {
    let tutor: keyof typeof EDGE_VOICES = 'lina';
    if (voiceId?.includes('rachelle')) tutor = 'rachelle';
    else if (voiceId?.includes('ana')) tutor = 'ana';
    else if (voiceId?.includes('guy')) tutor = 'guy';
    else if (voiceId?.includes('spark')) tutor = 'spark';
    else if (voiceId?.includes('chronos')) tutor = 'chronos';
    else if (voiceId?.includes('male')) tutor = 'male';
    else if (voiceId?.includes('female')) tutor = 'female';
    else if (voiceId?.includes('jorge')) tutor = 'jorge';
    else if (voiceId?.includes('diego')) tutor = 'diego';
    return edgeTTS.speak(text, tutor, options);
}

export const LINA_GREETING_AUDIO_TEXTS = LINA_GREETING_TEXTS;
