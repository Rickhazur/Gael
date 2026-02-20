// Free High-Quality Voice Service
// Uses Web Speech API with optimized voice selection

export interface VoiceConfig {
  name: string;
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
}

export interface TutorVoiceProfile {
  tutorId: string;
  preferredVoices: string[];
  fallbackVoice: string;
  config: Partial<VoiceConfig>;
  personality: 'enthusiastic' | 'patient' | 'challenging' | 'supportive';
}

class FreeVoiceService {
  private static instance: FreeVoiceService;
  private voices: SpeechSynthesisVoice[] = [];
  private voiceCache = new Map<string, SpeechSynthesisVoice>();
  private isInitialized = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  // High-quality voice configurations for each tutor
  private readonly TUTOR_PROFILES: TutorVoiceProfile[] = [
    {
      tutorId: 'lina',
      preferredVoices: [
        'Microsoft Sabina - Spanish (Mexico)',
        'Microsoft Helena - Spanish (Spain)',
        'Google español de México',
        'es-MX-Standard-A'
      ],
      fallbackVoice: 'Microsoft Sabina - Spanish (Mexico)',
      config: { rate: 1.15, pitch: 1.2, volume: 1.0 },
      personality: 'enthusiastic'
    },
    {
      tutorId: 'rachelle',
      preferredVoices: [
        'Microsoft Zira - English (United States)',
        'Microsoft Jenny - English (United States)',
        'Google US English',
        'en-US-Standard-A'
      ],
      fallbackVoice: 'Microsoft Zira - English (United States)',
      config: { rate: 1.1, pitch: 1.1, volume: 1.0 },
      personality: 'enthusiastic'
    },
    {
      tutorId: 'male',
      preferredVoices: [
        'Microsoft Raul - Spanish (Mexico)',
        'Microsoft Daniel - Spanish (Spain)',
        'Microsoft Jorge - Spanish (Mexico)',
        'Google español de México'
      ],
      fallbackVoice: 'Microsoft Raul - Spanish (Mexico)',
      config: { rate: 0.85, pitch: 0.75, volume: 1.0 },
      personality: 'supportive'
    },
    {
      tutorId: 'jorge',
      preferredVoices: [
        'Microsoft Jorge - Spanish (Mexico)',
        'Microsoft Raul - Spanish (Mexico)',
        'Microsoft Carlos - Spanish (Mexico)',
        'Google español de México'
      ],
      fallbackVoice: 'Microsoft Jorge - Spanish (Mexico)',
      config: { rate: 0.85, pitch: 0.75, volume: 1.0 },
      personality: 'supportive'
    },
    {
      tutorId: 'dr-mathematics',
      preferredVoices: [
        'Microsoft Helena - Spanish (Spain)',
        'Microsoft Sabina - Spanish (Mexico)',
        'Microsoft Laura - Spanish (Mexico)'
      ],
      fallbackVoice: 'Microsoft Helena - Spanish (Spain)',
      config: { rate: 1.0, pitch: 1.1, volume: 1.0 },
      personality: 'challenging'
    },
    {
      tutorId: 'dr-science',
      preferredVoices: [
        'Microsoft Raul - Spanish (Mexico)',
        'Microsoft Jorge - Spanish (Mexico)',
        'Microsoft Carlos - Spanish (Mexico)'
      ],
      fallbackVoice: 'Microsoft Raul - Spanish (Mexico)',
      config: { rate: 1.2, pitch: 1.1, volume: 1.0 },
      personality: 'enthusiastic'
    },
    {
      tutorId: 'prof-literature',
      preferredVoices: [
        'Microsoft Helena - Spanish (Spain)',
        'Microsoft Laura - Spanish (Mexico)',
        'Microsoft Sabina - Spanish (Mexico)'
      ],
      fallbackVoice: 'Microsoft Helena - Spanish (Spain)',
      config: { rate: 1.0, pitch: 1.0, volume: 1.0 },
      personality: 'supportive'
    },
    {
      tutorId: 'prof-physics',
      preferredVoices: [
        'Microsoft Daniel - Spanish (Spain)',
        'Microsoft Raul - Spanish (Mexico)',
        'Microsoft Jorge - Spanish (Mexico)'
      ],
      fallbackVoice: 'Microsoft Daniel - Spanish (Spain)',
      config: { rate: 1.0, pitch: 1.0, volume: 1.0 },
      personality: 'challenging'
    }
  ];

  static getInstance(): FreeVoiceService {
    if (!FreeVoiceService.instance) {
      FreeVoiceService.instance = new FreeVoiceService();
    }
    return FreeVoiceService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve) => {
      const loadVoices = () => {
        this.voices = speechSynthesis.getVoices();
        this.isInitialized = true;
        console.log(`✅ Loaded ${this.voices.length} voices`);
        
        // Log available high-quality voices
        const highQualityVoices = this.getHighQualityVoices();
        console.log('🎯 High-quality voices available:', highQualityVoices.map(v => v.name));
        
        resolve();
      };

      if (speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    });
  }

  private getHighQualityVoices(): SpeechSynthesisVoice[] {
    const qualityKeywords = [
      'Microsoft', 'Google', 'Amazon', 'Apple',
      'Neural', 'WaveNet', 'Premium', 'Natural',
      'Standard', 'HD', 'Studio', 'Enhanced'
    ];

    return this.voices.filter(voice => 
      qualityKeywords.some(keyword => 
        voice.name.includes(keyword) || 
        voice.voiceURI.includes(keyword)
      )
    );
  }

  private selectBestVoice(tutorId: string, language: string = 'es'): SpeechSynthesisVoice {
    const cacheKey = `${tutorId}-${language}`;
    
    if (this.voiceCache.has(cacheKey)) {
      return this.voiceCache.get(cacheKey)!;
    }

    const profile = this.TUTOR_PROFILES.find(p => p.tutorId === tutorId);
    if (!profile) {
      console.warn(`No voice profile found for tutor: ${tutorId}`);
      return this.getDefaultVoice(language);
    }

    // Try preferred voices first
    for (const preferredName of profile.preferredVoices) {
      const voice = this.voices.find(v => 
        v.name.includes(preferredName.split(' - ')[0]) ||
        v.name === preferredName ||
        v.voiceURI.includes(preferredName)
      );
      
      if (voice && voice.lang.startsWith(language)) {
        this.voiceCache.set(cacheKey, voice);
        console.log(`🎤 Selected voice for ${tutorId}: ${voice.name}`);
        return voice;
      }
    }

    // Try fallback voice
    const fallbackVoice = this.voices.find(v => 
      v.name.includes(profile.fallbackVoice.split(' - ')[0]) ||
      v.name === profile.fallbackVoice
    );

    if (fallbackVoice) {
      this.voiceCache.set(cacheKey, fallbackVoice);
      console.log(`🎤 Using fallback voice for ${tutorId}: ${fallbackVoice.name}`);
      return fallbackVoice;
    }

    // Final fallback to any voice in the language
    const languageVoice = this.voices.find(v => v.lang.startsWith(language));
    if (languageVoice) {
      this.voiceCache.set(cacheKey, languageVoice);
      console.log(`🎤 Using language voice for ${tutorId}: ${languageVoice.name}`);
      return languageVoice;
    }

    // Last resort
    const defaultVoice = this.getDefaultVoice(language);
    this.voiceCache.set(cacheKey, defaultVoice);
    return defaultVoice;
  }

  private getDefaultVoice(language: string): SpeechSynthesisVoice {
    const voice = this.voices.find(v => v.lang.startsWith(language)) || this.voices[0];
    console.log(`🎤 Using default voice: ${voice?.name || 'None'}`);
    return voice!;
  }

  private applyPersonalityConfig(utterance: SpeechSynthesisUtterance, profile: TutorVoiceProfile): void {
    const baseConfig = profile.config;
    
    // Apply personality-based variations
    switch (profile.personality) {
      case 'enthusiastic':
        utterance.rate = (baseConfig.rate || 1) * 1.1;
        utterance.pitch = (baseConfig.pitch || 1) * 1.1;
        break;
      case 'patient':
        utterance.rate = (baseConfig.rate || 1) * 0.9;
        utterance.pitch = baseConfig.pitch || 1;
        break;
      case 'challenging':
        utterance.rate = baseConfig.rate || 1;
        utterance.pitch = (baseConfig.pitch || 1) * 0.95;
        break;
      case 'supportive':
        utterance.rate = (baseConfig.rate || 1) * 0.95;
        utterance.pitch = (baseConfig.pitch || 1) * 1.05;
        break;
    }

    // Add natural variation
    utterance.rate += (Math.random() - 0.5) * 0.1; // ±5% variation
    utterance.pitch += (Math.random() - 0.5) * 0.05; // ±2.5% variation

    // Clamp values
    utterance.rate = Math.max(0.5, Math.min(2, utterance.rate));
    utterance.pitch = Math.max(0.5, Math.min(2, utterance.pitch));
    utterance.volume = baseConfig.volume || 1;
  }

  async speak(text: string, tutorId: string, options?: Partial<VoiceConfig>): Promise<void> {
    await this.initialize();

    // Stop any current speech
    this.stop();

    return new Promise((resolve, reject) => {
      try {
        const profile = this.TUTOR_PROFILES.find(p => p.tutorId === tutorId);
        const language = tutorId === 'rachelle' ? 'en' : 'es';
        
        const voice = this.selectBestVoice(tutorId, language);
        const utterance = new SpeechSynthesisUtterance(text);

        // Set voice
        utterance.voice = voice;

        // Apply configuration
        utterance.rate = options?.rate || profile?.config.rate || 1;
        utterance.pitch = options?.pitch || profile?.config.pitch || 1;
        utterance.volume = options?.volume || profile?.config.volume || 1;

        // Apply personality if profile exists
        if (profile) {
          this.applyPersonalityConfig(utterance, profile);
        }

        // Event handlers
        utterance.onstart = () => {
          console.log(`🎤 ${tutorId} speaking: "${text.substring(0, 50)}..."`);
        };

        utterance.onend = () => {
          console.log(`✅ ${tutorId} finished speaking`);
          this.currentUtterance = null;
          resolve();
        };

        utterance.onerror = (event) => {
          console.error(`❌ Voice error for ${tutorId}:`, event);
          this.currentUtterance = null;
          reject(new Error(`Voice synthesis error: ${event}`));
        };

        // Store reference and speak
        this.currentUtterance = utterance;
        speechSynthesis.speak(utterance);

      } catch (error) {
        console.error(`❌ Failed to speak with ${tutorId}:`, error);
        reject(error);
      }
    });
  }

  stop(): void {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      this.currentUtterance = null;
      console.log('🛑 Speech stopped');
    }
  }

  pause(): void {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      console.log('⏸️ Speech paused');
    }
  }

  resume(): void {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      console.log('▶️ Speech resumed');
    }
  }

  isSpeaking(): boolean {
    return speechSynthesis.speaking;
  }

  isPaused(): boolean {
    return speechSynthesis.paused;
  }

  // Get available voices for debugging
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  // Get voice info for specific tutor
  getTutorVoiceInfo(tutorId: string): { voice: SpeechSynthesisVoice; profile: TutorVoiceProfile } | null {
    const profile = this.TUTOR_PROFILES.find(p => p.tutorId === tutorId);
    if (!profile) return null;

    const language = tutorId === 'rachelle' ? 'en' : 'es';
    const voice = this.selectBestVoice(tutorId, language);

    return { voice, profile };
  }

  // Test all tutor voices
  async testAllVoices(): Promise<void> {
    await this.initialize();
    
    console.log('🧪 Testing all tutor voices...');
    
    for (const profile of this.TUTOR_PROFILES) {
      try {
        const testText = profile.tutorId === 'rachelle' 
          ? `Hello, I am ${profile.tutorId} and this is a voice test.`
          : `Hola, soy ${profile.tutorId} y esta es una prueba de voz.`;
        
        console.log(`🎤 Testing ${profile.tutorId}...`);
        await this.speak(testText, profile.tutorId);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between tests
      } catch (error) {
        console.error(`❌ Failed to test ${profile.tutorId}:`, error);
      }
    }
    
    console.log('✅ Voice testing complete');
  }
}

// Export singleton instance
export const freeVoiceService = FreeVoiceService.getInstance();

// Convenience functions for backward compatibility
export async function speak(text: string, tutorId: string, options?: Partial<VoiceConfig>): Promise<void> {
  return freeVoiceService.speak(text, tutorId, options);
}

export function stopSpeaking(): void {
  freeVoiceService.stop();
}

export function isSpeaking(): boolean {
  return freeVoiceService.isSpeaking();
}
