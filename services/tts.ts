
// Age-Adaptive Text-to-Speech Service using Web Speech API
// Free, browser-native, no API costs

export type VoiceProfile = 'default' | 'station'; // station = deep, robotic Spanish for Research Center avatar

export interface TTSSettings {
    rate: number;      // Speech rate (0.1 to 10, default 1)
    pitch: number;     // Voice pitch (0 to 2, default 1)
    volume: number;    // Volume (0 to 1, default 1)
    voice: string | null; // Voice name or null for default
    language: string;  // Language code (es-ES, en-US, etc.)
    voiceProfile?: VoiceProfile; // station = deep/robotic Spanish (free, browser TTS)
}

class TTSService {
    private synth: SpeechSynthesis;
    private utterance: SpeechSynthesisUtterance | null = null;
    private settings: TTSSettings;
    private voiceProfile: VoiceProfile = 'default';
    private isSupported: boolean;

    constructor() {
        this.synth = window.speechSynthesis;
        this.isSupported = 'speechSynthesis' in window;

        // Default settings for age 8
        this.settings = this.getAgeAdaptiveSettings(8, 'es');
    }

    /** Set voice profile: 'station' = deep, robotic Spanish for Research Center avatar (free browser TTS). */
    setVoiceProfile(profile: VoiceProfile) {
        this.voiceProfile = profile;
    }

    getVoiceProfile(): VoiceProfile {
        return this.voiceProfile;
    }

    // Get age-adaptive TTS settings
    getAgeAdaptiveSettings(age: number, language: string): TTSSettings {
        // Younger children (6-7): Slower, higher pitch, friendly
        if (age <= 7) {
            return {
                rate: 0.8,          // Slower speech
                pitch: 1.3,         // Higher pitch (child-friendly)
                volume: 1.0,
                voice: null,
                language: language === 'es' ? 'es-ES' : 'en-US'
            };
        }

        // Middle primary (8-9): Moderate pace, normal pitch
        if (age <= 9) {
            return {
                rate: 0.9,          // Normal pace
                pitch: 1.1,         // Slightly higher pitch
                volume: 1.0,
                voice: null,
                language: language === 'es' ? 'es-ES' : 'en-US'
            };
        }

        // Older primary (10-11): Normal speech, adult-like
        return {
            rate: 1.0,              // Normal rate
            pitch: 1.0,             // Normal pitch
            volume: 1.0,
            voice: null,
            language: language === 'es' ? 'es-ES' : 'en-US'
        };
    }

    // Update settings based on age and language
    updateSettings(age: number, language: string) {
        this.settings = this.getAgeAdaptiveSettings(age, language);
        // Clear manual voice selection to allow native auto-selection for the profile
        this.settings.voice = null;
    }

    // Get available voices
    getAvailableVoices(): SpeechSynthesisVoice[] {
        if (!this.isSupported) return [];
        return this.synth.getVoices();
    }

    // Get child-friendly voices (filtered by language and characteristics)
    public getChildFriendlyVoices(language: string): SpeechSynthesisVoice[] {
        const voices = this.getAvailableVoices();
        const langCode = language === 'es' ? 'es' : 'en';

        if (langCode === 'es') {
            // STRICT NATIVE LATIN AMERICAN FILTER
            // We EXPLICITLY filter out ANY voice that sounds like a foreigner (US/English) or has a Spain accent.
            const nativeLatamVoices = voices.filter(v => {
                const name = v.name.toLowerCase();
                const lang = v.lang.toLowerCase();

                // Exclude all non-native Spanish variants and robotic English fallbacks
                const isForeigner = name.includes('english') || name.includes('us english') || name.includes('zira') || name.includes('david') || name.includes('google us') || name.includes('google us spanish');
                const isSpain = lang.includes('es-es') || name.includes('spain') || name.includes('castilian');
                const isLikelyLatam = lang.includes('mx') || lang.includes('co') || lang.includes('419') ||
                    name.includes('mexico') || name.includes('colombia') || name.includes('latino') ||
                    name.includes('america') || name.includes('sabina') || name.includes('paulina') ||
                    name.includes('hilda') || name.includes('helena'); // Common Latam names in some systems

                return lang.startsWith('es') && !isForeigner && !isSpain && isLikelyLatam;
            });

            if (nativeLatamVoices.length > 0) {
                // Return prioritized Latam list
                return nativeLatamVoices;
            }

            // Fallback: strictly ANY Spanish voice that is NOT Spain and NOT US-English
            const strictFallback = voices.filter(v =>
                v.lang.startsWith('es') &&
                !v.lang.toLowerCase().includes('es-es') &&
                !v.name.toLowerCase().includes('english') &&
                !v.name.toLowerCase().includes('spain')
            );

            if (strictFallback.length > 0) return strictFallback;
        }

        return voices.filter(voice =>
            voice.lang.startsWith(langCode) &&
            (voice.name.includes('Female') || voice.name.includes('female') || !voice.name.includes('Male'))
        );
    }

    // Get a male voice (or closest equivalent) for the specified language
    // Get a male voice (or closest equivalent) for the specified language
    public getMaleVoice(language: string): SpeechSynthesisVoice | null {
        const voices = this.getAvailableVoices();
        const langCode = language === 'es' ? 'es' : 'en';

        // Latin American Preference for Spanish
        const preferredVoices = voices.filter(v => {
            if (langCode === 'es') {
                const lang = v.lang.toLowerCase();
                const name = v.name.toLowerCase();
                return lang.startsWith('es') &&
                    !lang.includes('es-es') && // Check LANG for es-es
                    !name.includes('spain') &&
                    !name.includes('españa') &&
                    !name.includes('castilian');
            }
            return v.lang.startsWith(langCode);
        });

        // Use preferred pool if available, otherwise just language match
        const targetPool = preferredVoices.length > 0 ? preferredVoices : voices.filter(v => v.lang.startsWith(langCode));

        // Prioritize explicitly Male or known male names
        const maleVoice = targetPool.find(v => {
            const name = v.name.toLowerCase();
            return name.includes('male') || name.includes('pablo') || name.includes('gonzalo') || name.includes('david') || name.includes('miguel') || name.includes('raul') || name.includes('alvaro');
        });

        // Fallback: Google Voice (often robust/neutral) or just the first available Latam voice
        // Note: Even a female Latam voice pitch-shifted (0.1) sounds like a Robot Male and better than a Spain Male.
        return maleVoice || targetPool.find(v => v.name.includes('Google')) || targetPool[0] || null;
    }

    /** Chrome and some browsers truncate long SpeechSynthesisUtterance (~200–300 chars). Chunk so the full idea is spoken. */
    private static readonly MAX_UTTERANCE_CHARS = 220;

    // Speak text with current settings
    // Updated to support bilingual segments for 'Lina' and long-text chunking (Research Center avatar says full idea)
    speak(text: string, onEnd?: () => void) {
        if (!this.isSupported || !text) {
            console.warn('TTS not supported or no text provided');
            if (onEnd) onEnd();
            return;
        }

        // No pronunciar asteriscos ni markdown (**bold**, *italic*)
        const stripped = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '');
        const trimmed = stripped.trim();
        if (!trimmed) {
            if (onEnd) onEnd();
            return;
        }

        // 1. SPLIT BILINGUAL TEXT (Lina speaks both ES and EN native)
        const segments = this.getBilingualSegments(trimmed);
        if (segments.length > 1) {
            this.speakQueue(segments, onEnd);
            return;
        }

        // 2. CHUNK LONG TEXT so browser TTS doesn't cut off mid-sentence (e.g. Research Center intro)
        if (trimmed.length > TTSService.MAX_UTTERANCE_CHARS) {
            const chunks = this.chunkBySentences(trimmed, TTSService.MAX_UTTERANCE_CHARS);
            if (chunks.length > 1) {
                const segmentList = chunks.map(t => ({ text: t, isEnglish: this.isEnglishText(t) }));
                this.speakQueue(segmentList, onEnd);
                return;
            }
        }

        // Cancel any ongoing speech
        this.stop();

        // Create new utterance (single chunk)
        this.utterance = new SpeechSynthesisUtterance(trimmed);

        // Determine language for this single segment
        const isEnglish = this.isEnglishText(trimmed);
        const langCode = isEnglish ? 'en-US' : (this.settings.language.startsWith('es') ? 'es-MX' : this.settings.language);
        this.utterance.lang = langCode;

        // STATION PROFILE: deep, robotic Spanish (Research Center avatar - free, matches “onyx” style)
        const useStation = this.voiceProfile === 'station';
        if (useStation) {
            this.utterance.rate = 0.9;
            this.utterance.pitch = 0.85; // deeper, more robotic
            this.utterance.volume = this.settings.volume;
            const lang = isEnglish ? 'en' : 'es';
            const maleVoice = this.getMaleVoice(lang);
            if (maleVoice) {
                this.utterance.voice = maleVoice;
            }
        } else {
            this.utterance.rate = this.settings.rate;
            this.utterance.pitch = this.settings.pitch;
            this.utterance.volume = this.settings.volume;
        }

        // PRE-PROCESS TEXT FOR PRONUNCIATION (Only for Spanish)
        const textToSpeak = isEnglish ? trimmed : this.preprocessText(trimmed);
        this.utterance.text = textToSpeak;

        // Voice Selection (when not using station profile)
        if (!useStation) {
            if (this.settings.voice) {
                const voices = this.getAvailableVoices();
                const selectedVoice = voices.find(v => v.name === this.settings.voice);
                if (selectedVoice) this.utterance.voice = selectedVoice;
            } else {
                const languageForVoice = isEnglish ? 'en' : 'es';
                const childFriendlyVoices = this.getChildFriendlyVoices(languageForVoice);

                if (childFriendlyVoices.length > 0) {
                    if (isEnglish) {
                        const preferredEn = childFriendlyVoices.find(v =>
                            v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Female')
                        );
                        this.utterance.voice = preferredEn || childFriendlyVoices[0];
                    } else {
                        this.utterance.voice = childFriendlyVoices[0];
                    }
                }
            }
        }

        // Event handlers
        this.utterance.onend = () => {
            // console.log('TTS finished');
            if (onEnd) onEnd();
        };

        this.utterance.onerror = (error) => {
            console.error('TTS error:', error);
            if (onEnd) onEnd();
        };

        // Speak
        this.synth.speak(this.utterance);
    }

    // Helper to detect if a sentence is English even if the service is set to Spanish
    private isEnglishText(text: string): boolean {
        const lowerText = text.toLowerCase();
        // Markers for English sentences
        const hasEnglishMarkers = lowerText.includes('welcome') || lowerText.includes(' research ') ||
            lowerText.includes('hello') || lowerText.includes('and ') || lowerText.includes('the ') ||
            lowerText.startsWith('and ') || lowerText.startsWith('we ');

        // Check for lack of Spanish special characters
        const noSpanishChars = !/[áéíóúñ¿¡]/.test(text);

        return (hasEnglishMarkers && noSpanishChars) || (this.settings.language === 'en');
    }

    // Split text into segments based on detected language
    private getBilingualSegments(text: string): { text: string, isEnglish: boolean }[] {
        if (this.settings.language === 'en') return [{ text, isEnglish: true }];

        const sentences = text.match(/[^.!?]+[.!?]*|[^.!?]+$/g) || [text];
        const segments: { text: string, isEnglish: boolean }[] = [];

        sentences.forEach(s => {
            const isEn = this.isEnglishText(s);
            if (segments.length > 0 && segments[segments.length - 1].isEnglish === isEn) {
                segments[segments.length - 1].text += s;
            } else {
                segments.push({ text: s, isEnglish: isEn });
            }
        });

        return segments;
    }

    /** Split long text into chunks at sentence boundaries so each chunk is under maxChars (avoids browser truncation). */
    private chunkBySentences(text: string, maxChars: number): string[] {
        if (text.length <= maxChars) return [text];
        const sentences = text.match(/[^.!?]+[.!?]*\s*|[^.!?]+$/g) || [text];
        const chunks: string[] = [];
        let current = '';
        for (const s of sentences) {
            const trimmed = s.trim();
            if (!trimmed) continue;
            if (current.length + trimmed.length + 1 <= maxChars) {
                current = current ? current + ' ' + trimmed : trimmed;
            } else {
                if (current) chunks.push(current);
                if (trimmed.length > maxChars) {
                    const subChunks = trimmed.match(new RegExp(`(.{1,${maxChars}}(?:\\s|$))`, 'g')) || [trimmed];
                    chunks.push(...subChunks.map(c => c.trim()).filter(Boolean));
                    current = '';
                } else {
                    current = trimmed;
                }
            }
        }
        if (current) chunks.push(current);
        return chunks.length > 0 ? chunks : [text];
    }

    // Queue-based speech for multiple segments
    private speakQueue(segments: { text: string, isEnglish: boolean }[], finalCallback?: () => void) {
        this.stop();
        let currentIndex = 0;

        const speakNext = () => {
            if (currentIndex >= segments.length) {
                if (finalCallback) finalCallback();
                return;
            }

            const segment = segments[currentIndex];
            currentIndex++;

            // Temporarily update settings for the segment if it's English
            const originalLang = this.settings.language;
            if (segment.isEnglish) this.settings.language = 'en';

            this.speak(segment.text, () => {
                this.settings.language = originalLang;
                speakNext();
            });
        };

        speakNext();
    }

    // --- PHONETIC PRE-PROCESSING ---
    private preprocessText(text: string): string {
        if (this.settings.language !== 'es') return text;

        let clean = text;

        // ============================================
        // MATH TERM PRONUNCIATION FIXES (Spanish)
        // ============================================

        // Division terms
        clean = clean.replace(/\bdivisor\b/gi, "divisór");
        clean = clean.replace(/\bdividendo\b/gi, "dividéndo");
        clean = clean.replace(/\bcociente\b/gi, "cociénte");
        clean = clean.replace(/\bresiduo\b/gi, "residúo");

        // Fraction terms
        clean = clean.replace(/\bnumerador\b/gi, "numeradór");
        clean = clean.replace(/\bdenominador\b/gi, "denominadór");
        clean = clean.replace(/\bMCM\b/g, "mínimo común múltiplo");
        clean = clean.replace(/\bmcm\b/g, "mínimo común múltiplo");
        clean = clean.replace(/\bLCM\b/g, "mínimo común múltiplo");

        // Percentage
        clean = clean.replace(/\bporcentaje\b/gi, "porcentáje");

        // Operations symbols -> spoken words
        clean = clean.replace(/×/g, " por ");
        clean = clean.replace(/\bx\b/g, " por ");
        clean = clean.replace(/\boperar\b/gi, "operár");
        clean = clean.replace(/\boperemos\b/gi, "operémos");
        clean = clean.replace(/÷/g, " entre ");
        clean = clean.replace(/=/g, " igual a ");

        // Ensure numbers with decimals use "punto" or "coma" clearly
        // Example: "3.14" -> "tres punto catorce" (handled by TTS usually, but explicit helps)

        // Large numbers: Ensure "mil" is separated
        // The TTS usually handles this, but we can add explicit logic if needed.

        return clean;
    }

    // Stop current speech
    stop() {
        if (this.isSupported && this.synth.speaking) {
            this.synth.cancel();
        }
    }

    // Pause current speech
    pause() {
        if (this.isSupported && this.synth.speaking) {
            this.synth.pause();
        }
    }

    // Resume paused speech
    resume() {
        if (this.isSupported && this.synth.paused) {
            this.synth.resume();
        }
    }

    // Check if currently speaking
    isSpeaking(): boolean {
        return this.isSupported && this.synth.speaking;
    }

    // Check if TTS is supported
    isAvailable(): boolean {
        return this.isSupported;
    }

    // Get current settings
    getSettings(): TTSSettings {
        return { ...this.settings };
    }

    // Set custom settings
    setCustomSettings(settings: Partial<TTSSettings>) {
        this.settings = { ...this.settings, ...settings };
    }
}

// Create singleton instance
const ttsService = new TTSService();

export default ttsService;

// Helper function to speak text with age adaptation
export function speakWithAge(text: string, age: number, language: string, onEnd?: () => void) {
    ttsService.updateSettings(age, language);
    ttsService.speak(text, onEnd);
}

// Helper function to stop speaking
export function stopSpeaking() {
    ttsService.stop();
}
