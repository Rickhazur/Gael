import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SparkAvatar } from './SparkAvatar';
import { ChronosAvatar } from './ChronosAvatar';
import { RachelleAvatar } from '@/components/MathMaestro/tutor/RachelleAvatar';
import { CuriosityMenu } from './CuriosityMenu';
import { ConversationSaved } from './ConversationSaved';
import { VictoryCelebration } from './VictoryCelebration';
import { getSparkResponse, SparkResponse } from '@/services/sparkService';
import { edgeTTS } from '@/services/edgeTTS';
import { generateImage } from '@/services/ai_service';
import {
    Send, Rocket, Brain, Mic, Volume2, VolumeX,
    X, Sparkles, RotateCcw, Globe, Zap,
    Shield, Activity, Maximize2, Terminal, Clapperboard, Loader2,
    ZoomIn, ZoomOut, AlertTriangle, Star, Phone, PhoneIncoming, Video, User
} from 'lucide-react';
import { supabase } from '@/services/supabase';
import { sendSafetyAlert, ParentContact } from '@/services/whatsappReports';
import { useGamification } from '@/context/GamificationContext';
import { useAchievements } from '@/context/AchievementContext';
import { useLearning } from '@/context/LearningContext';
import { notebookService } from '@/services/notebookService';
import './SparkHologram.css';

interface Message {
    role: 'user' | 'spark';
    content: string;
    pronunciationConfidence?: number;
    data?: SparkResponse;
}

const highlightColors = {
    blue: 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]',
    green: 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]',
    orange: 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]',
    purple: 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]',
    red: 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]',
    yellow: 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]',
};

const highlightCardStyles = {
    blue: 'border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    green: 'border-green-500/50 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]',
    orange: 'border-orange-500/50 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]',
    purple: 'border-purple-500/50 bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
    red: 'border-red-500/50 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
    yellow: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]',
};

// Helper to highlight keywords
const formatMessage = (text: string, highlights: { text: string; color: string }[] = []) => {
    if (!text) return "";

    // First, process structural highlights from the 'highlights' array if they aren't already bolded
    let result: (string | JSX.Element)[] = [text];

    // Priority 1: Structural Highlights from AI
    if (highlights && highlights.length > 0) {
        highlights.forEach(h => {
            if (!h?.text) return; // Guard against missing highlight text

            const newResult: (string | JSX.Element)[] = [];
            result.forEach(part => {
                if (typeof part === 'string') {
                    // Shield special characters for RegExp
                    const escapedText = h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const pieces = part.split(new RegExp(`(${escapedText})`, 'gi'));
                    pieces.forEach((piece, i) => {
                        if (piece && piece.toLowerCase() === h.text.toLowerCase()) {
                            newResult.push(
                                <span key={`${h.text}-${i}`} className={`${highlightColors[h.color as keyof typeof highlightColors] || highlightColors.yellow} font-black animate-pulse`}>
                                    {piece}
                                </span>
                            );
                        } else if (piece) {
                            newResult.push(piece);
                        }
                    });
                } else {
                    newResult.push(part);
                }
            });
            result = newResult;
        });
    }

    // Priority 2: Standard **bold** markers
    const finalResult: (string | JSX.Element)[] = [];
    result.forEach((part, idx) => {
        if (typeof part === 'string') {
            const subParts = part.split(/(\*\*.*?\*\*)/g);
            subParts.forEach((subPart, subIdx) => {
                if (subPart.startsWith('**') && subPart.endsWith('**')) {
                    const content = subPart.slice(2, -2);
                    finalResult.push(
                        <span key={`bold-${idx}-${subIdx}`} className="text-yellow-400 font-black mx-0.5 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-pulse">
                            {content}
                        </span>
                    );
                } else if (subPart) {
                    finalResult.push(subPart);
                }
            });
        } else {
            finalResult.push(part);
        }
    });

    return finalResult;
};

export const SparkChat: React.FC = () => {
    const { addCoins } = useGamification();
    const { checkAndUnlockAchievements } = useAchievements();
    const { englishLevel, setEnglishLevel } = useLearning();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [panelImages, setPanelImages] = useState<(string | null)[]>([]);
    const [isGeneratingImages, setIsGeneratingImages] = useState<boolean[]>([]);
    const [sparkState, setSparkState] = useState<'idle' | 'speaking' | 'thinking' | 'excited'>('idle');
    const [currentNarrator, setCurrentNarrator] = useState<'spark' | 'chronos' | 'male' | 'female' | 'jorge' | 'gonzalo' | 'diego' | 'rachelle'>('rachelle');
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [translationEnabled, setTranslationEnabled] = useState(true); // Traductor Escudo toggle
    const [isOpening, setIsOpening] = useState(true);
    const [curtainOpen, setCurtainOpen] = useState(false);
    const [speakingTheme, setSpeakingTheme] = useState(true);
    const [cinemaFullscreen, setCinemaFullscreen] = useState(false);
    const [theaterManualDim, setTheaterManualDim] = useState(false);
    const [currentNoteIndex, setCurrentNoteIndex] = useState(0); // Pagination for the Storybook

    // Call Feature States
    const [isCalling, setIsCalling] = useState(false);
    const [isCallConnected, setIsCallConnected] = useState(false);
    const [callData, setCallData] = useState<SparkResponse['callCharacter'] | null>(null);
    const [callStartTime, setCallStartTime] = useState<number | null>(null);
    const [questionsInCall, setQuestionsInCall] = useState(0);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    // 3D Image Controls
    const [imageRotation, setImageRotation] = useState({ x: 0, y: 0 });
    const [imageZoom, setImageZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Recognition Ref to prevent multiple instances


    // Safety & User Info
    const [userProfile, setUserProfile] = useState<any>(null);
    const [lastPronunciationConfidence, setLastPronunciationConfidence] = useState<number | null>(null);
    const [lastViolation, setLastViolation] = useState<string | null>(null);

    // Track the current message ID to avoid state leaks
    const [currentStepId, setCurrentStepId] = useState<string | null>(null);

    const [lastError, setLastError] = useState<string | null>(null);

    // Conversation saved confirmation
    const [showSavedConfirmation, setShowSavedConfirmation] = useState(false);
    const [savedConversationInfo, setSavedConversationInfo] = useState<{
        character: string;
        questions: number;
        coins: number;
    } | null>(null);

    // Victory celebration
    const [showVictoryCelebration, setShowVictoryCelebration] = useState(false);
    const [celebrationCoins, setCelebrationCoins] = useState(0);
    const [noSpeechCount, setNoSpeechCount] = useState(0);
    const [transcriptPreview, setTranscriptPreview] = useState('');
    const [volume, setVolume] = useState(0);
    const recognitionRef = useRef<any>(null);
    const audioMeterRef = useRef<{ stream: MediaStream, context: AudioContext, source: MediaStreamAudioSourceNode } | null>(null);
    const isStartingMicRef = useRef(false);
    const audioIncomingRef = useRef<HTMLAudioElement | null>(null);
    const audioConnectedRef = useRef<HTMLAudioElement | null>(null);
    const audioAmbientRef = useRef<HTMLAudioElement | null>(null);
    const audioEpicRef = useRef<HTMLAudioElement | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        audioIncomingRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3');
        audioConnectedRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
        audioAmbientRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3'); // Smooth space ambient
        audioEpicRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3');    // More epic for heroes

        if (audioIncomingRef.current) audioIncomingRef.current.loop = true;
        if (audioAmbientRef.current) {
            audioAmbientRef.current.loop = true;
            audioAmbientRef.current.volume = 0.05; // Very subtle
        }
        if (audioEpicRef.current) {
            audioEpicRef.current.loop = true;
            audioEpicRef.current.volume = 0.08; // Subtle but heroic
        }
    }, []);

    // Manage Background Music (DISABLED - No music in Cine Estelar)
    useEffect(() => {
        // Background music disabled
        audioAmbientRef.current?.pause();
        audioEpicRef.current?.pause();
    }, []);

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    // Simular apertura de compuertas siderales + cortinas de teatro
    useEffect(() => {
        const gateTimer = setTimeout(() => {
            setIsOpening(false);
            setCurtainOpen(true);
        }, 1500);

        // Fetch user profile for safety reporting
        const fetchProfile = async () => {
            if (!supabase) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // [FIX] Simplificado: Solo traer datos del perfil sin joins complejos que dan Error 400
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setUserProfile(profile);
            }
        };
        fetchProfile();

        return () => {
            clearTimeout(gateTimer);
            // [FIX] Detener micrófono al desmontar
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { }
            }
        };
    }, []);

    // 🎤 Real-time Lipsync with edgeTTS + Cinema Auto-Close
    useEffect(() => {
        const onVoiceStart = (e: any) => {
            const voice = e.detail?.voice;
            if (voice === 'spark' || voice === 'chronos') {
                setSparkState('speaking');

                // Dim the overall theater lights to focus on the wisdom cards
                setTheaterManualDim(true);
            }
        };
        const onVoiceEnd = () => {
            setSparkState('idle');
            setTheaterManualDim(false);
        };

        window.addEventListener('nova-demo-voice', onVoiceStart);
        window.addEventListener('nova-demo-voice-end', onVoiceEnd);

        return () => {
            window.removeEventListener('nova-demo-voice', onVoiceStart);
            window.removeEventListener('nova-demo-voice-end', onVoiceEnd);
        };
    }, []);

    // 🎙️ AUTO-LISTEN: Trigger mic automatically when tutor finishes speaking in a call
    useEffect(() => {
        // [FIX] REDUCED RETRIES: If we fail 3 times, stop auto-triggering and ask user to use keyboard
        const maxRetries = 3;
        if (isCallConnected && sparkState === 'idle' && !isThinking && !isListening && noSpeechCount < maxRetries && !isStartingMicRef.current) {
            const delay = noSpeechCount === 0 ? 1500 : 3000;
            const autoMicTimer = setTimeout(() => {
                if (isCallConnected && sparkState === 'idle' && !isThinking && !isListening && !isStartingMicRef.current) {
                    console.log(`🎤 Auto-triggering mic (Attempt ${noSpeechCount + 1}/${maxRetries})...`);
                    toggleMic();
                }
            }, delay);
            return () => clearTimeout(autoMicTimer);
        } else if (noSpeechCount >= maxRetries && isListening) {
            // If we reached max retries, stop the current listening to avoid getting stuck
            setIsListening(false);
            stopAudioMeter();
        }
    }, [sparkState, isCallConnected, isThinking, isListening, noSpeechCount]);

    // 📞 Handle Triggered Placement Call (Phase 2: Oral)
    useEffect(() => {
        const onTriggerCall = (e: any) => {
            const { isAssessment, phase } = e.detail;

            setCallData({
                name: "Rachelle",
                gender: "female",
                en: "Hello! I saw your placement results. Now, let's talk for a few minutes to complete your test. Are you ready?",
                es: "¡Hola! Vi tus resultados del test. Ahora, hablemos por unos minutos para completar tu evaluación. ¿Estás listo?",
                greeting: "Hello! I saw your placement results. Now, let's talk for a few minutes to complete your test.",
                suggestions: ["Hello Rachelle!", "I am ready!", "Let's start!"],
                avatarPrompt: "3D Pixar style female teacher, red hair, futuristic radio station",
                isAssessment: isAssessment,
                questionIndex: 1
            });

            setIsCalling(true);
            setIsCallConnected(false);
            setCallStartTime(null);
            setQuestionsInCall(0);

            // Play random ringing sound
            if (audioIncomingRef.current) {
                audioIncomingRef.current.play().catch(console.error);
            }
        };

        window.addEventListener('trigger-rachelle-call', onTriggerCall);
        return () => window.removeEventListener('trigger-rachelle-call', onTriggerCall);
    }, []);

    // 🎯 Force "Traductor Escudo" OFF during Placement Test
    useEffect(() => {
        if (callData?.isAssessment) {
            setTranslationEnabled(false);
        }
    }, [callData?.isAssessment]);

    // 🧹 CLEANUP & MEMORY MANAGEMENT
    useEffect(() => {
        return () => {
            // Stop all audio on unmount
            if (audioIncomingRef.current) {
                audioIncomingRef.current.pause();
                audioIncomingRef.current.currentTime = 0;
                audioIncomingRef.current.loop = false;
            }
            if (audioConnectedRef.current) {
                audioConnectedRef.current.pause();
                audioConnectedRef.current.currentTime = 0;
            }
        };
    }, []);

    // 💾 LIMIT MESSAGES TO PREVENT MEMORY BLOAT
    useEffect(() => {
        if (messages.length > 50) {
            console.warn(`⚠️ [Memory] Trimming messages from ${messages.length} to 50 (keeping last 50 only)`);
            setMessages(messages.slice(-50));
        }
    }, [messages.length]);

    const handleStartSession = async () => {
        console.log("🚀 Starting Speaking session...");
        setIsThinking(true);
        setSparkState('thinking');

        try {
            const response = await getSparkResponse("¡Hola Miss Rachelle! Estoy listo para mi clase de hoy.", [], englishLevel);

            // Use English transcription as chat content for Rachelle, strip Spanish if present
            let initialChatText = (response.callCharacter?.name === 'Rachelle' && response.callCharacter.en)
                ? response.callCharacter.en
                : response.sparkResponse;

            // Aggressive Spanish stripping: remove anything after the first Spanish punctuation or the word '¡'
            if (response.callCharacter?.name === 'Rachelle') {
                const spanishMarkers = /[¡¿]/;
                if (spanishMarkers.test(initialChatText)) {
                    initialChatText = initialChatText.split(spanishMarkers)[0].trim();
                }
            }

            setMessages([{
                role: 'spark',
                content: initialChatText,
                data: response
            }]);

            const initialVoice = (response.callCharacter && response.callCharacter.name === 'Rachelle')
                ? 'rachelle'
                : (response.callCharacter)
                    ? (response.callCharacter.gender === 'female' ? 'female' : 'diego')
                    : (response.narrator || 'rachelle');

            setCurrentNarrator(initialVoice);

            if (!isMuted) {
                let introVoice = initialVoice;
                if (response.callCharacter && response.callCharacter.name === 'Rachelle') {
                    // Prevent English voice from reading Spanish intro
                    introVoice = 'spark';
                }
                edgeTTS.speak(response.sparkResponse, introVoice as any);
            }

            // Handle Character Call for Initial Session
            if (response.callCharacter) {
                setCallData(response.callCharacter);
                setIsCalling(true);
                setIsCallConnected(false);
                setCallStartTime(null);
                setQuestionsInCall(0);

                if (!isMuted) {
                    if (audioIncomingRef.current) {
                        audioIncomingRef.current.loop = true;
                        audioIncomingRef.current.volume = 0.3;
                        audioIncomingRef.current.currentTime = 0;
                    }
                    audioIncomingRef.current?.play().catch(console.error);

                    // Announcement from Spark (Robot) - Removed to avoid American voice speaking Spanish
                    if (response.callCharacter.name === 'Rachelle') {
                        // edgeTTS.speak("¡Hola! Tienes una llamada de Rachelle para practicar tu inglés. ¿Deseas contestarla?", "spark");
                    }
                }

                if (response.callCharacter.avatarPrompt) {
                    generateImage(response.callCharacter.avatarPrompt, 'cinematic').then(img => {
                        setAvatarUrl(img);
                    });
                }
            }

            // Handle Comic Data for Initial Session
            if (response.highlights) {
                const count = response.highlights.length;
                setPanelImages(new Array(count).fill(null));
                setIsGeneratingImages(new Array(count).fill(true));
                setCurrentNoteIndex(0); // Reset to page 1

                response.highlights.forEach((h, idx) => {
                    if (h.imagePrompt) {
                        generateImage(h.imagePrompt, 'cinematic').then(img => {
                            if (img) {
                                setPanelImages(prev => {
                                    const next = [...prev];
                                    next[idx] = img;
                                    return next;
                                });
                            }
                        }).finally(() => {
                            setIsGeneratingImages(prev => {
                                const next = [...prev];
                                next[idx] = false;
                                return next;
                            });
                        });
                    } else {
                        setIsGeneratingImages(prev => {
                            const next = [...prev];
                            next[idx] = false;
                            return next;
                        });
                    }
                });
            }

        } catch (e) {
            console.error("❌ Failed to start Spark session:", e);
            setMessages([{
                role: 'spark',
                content: "¡Ups! Mis antenas captaron un poco de interferencia espacial. 🛰️"
            }]);
            setSparkState('idle');
        } finally {
            setIsThinking(false);
        }
    };

    useEffect(() => {
        if (messages.length === 0) {
            handleStartSession();
        }
    }, []);

    const stopAudioMeter = () => {
        if (audioMeterRef.current) {
            audioMeterRef.current.stream.getTracks().forEach(t => t.stop());
            try {
                audioMeterRef.current.context.close();
            } catch (e) { }
            audioMeterRef.current = null;
        }
        setVolume(0);
    };

    const startAudioMeter = async () => {
        try {
            stopAudioMeter();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            const context = new AudioContextClass();
            const analyser = context.createAnalyser();
            const source = context.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 64;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            audioMeterRef.current = { stream, context, source };

            const update = () => {
                if (!audioMeterRef.current) return;
                analyser.getByteFrequencyData(dataArray);
                const sum = dataArray.reduce((a, b) => a + b, 0);
                const avg = sum / dataArray.length;
                // Scale volume for visualization (0 to 100)
                setVolume(Math.min(100, avg * 2));
                requestAnimationFrame(update);
            };
            update();
        } catch (e) {
            console.error("🎤 Audio Meter Error:", e);
        }
    };

    const toggleMic = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Tu navegador no soporta reconocimiento de voz. ¡Usa Chrome o Edge!");
            return;
        }

        // 1. If already listening, stop it.
        if (isListening) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
            setTranscriptPreview('');
            stopAudioMeter();
            return;
        }

        if (isStartingMicRef.current) return;

        // 2. Cleanup existing instances
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) { }
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognitionRef.current = recognition;
        isStartingMicRef.current = true;

        // Force English if it's Rachelle's call or an assessment
        const isRachelleCall = (isCalling && callData?.name === 'Rachelle') || callData?.isAssessment;
        recognition.lang = isRachelleCall ? 'en-US' : 'es-MX';

        console.log(`🎤 Starting Mic (Lang: ${recognition.lang}, Assessment: ${!!callData?.isAssessment})`);

        // Force continuous=false. It's much more stable across browsers for single-turn interactions.
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            isStartingMicRef.current = false;
            setLastError(null);
            setTranscriptPreview('');
            startAudioMeter();
        };

        // Safety timeout in case browser never fires onstart
        const safetyTimer = setTimeout(() => {
            if (isStartingMicRef.current) {
                console.warn("🎤 Mic start timeout - forcing state reset");
                isStartingMicRef.current = false;
                setIsListening(false);
                stopAudioMeter();
            }
        }, 5000);

        recognition.onsoundstart = () => {
            // User is making sound! Reset silence count
            if (noSpeechCount > 0) setNoSpeechCount(0);
        };

        recognition.onend = () => {
            setIsListening(false);
            isStartingMicRef.current = false;
            recognitionRef.current = null;
            clearTimeout(safetyTimer);
            stopAudioMeter();
            // Clear preview after a short delay
            setTimeout(() => setTranscriptPreview(''), 1000);
        };

        recognition.onerror = (event: any) => {
            console.error("🎤 Speech Recognition Error:", event.error);
            setIsListening(false);
            isStartingMicRef.current = false;
            setLastError(event.error);
            stopAudioMeter();

            if (event.error === 'no-speech') {
                setNoSpeechCount(prev => prev + 1);
                // [FIX] Give immediate feedback in chat if mic fails repeatedly
                if (noSpeechCount >= 2) {
                    setMessages(prev => [...prev, {
                        role: 'spark',
                        content: "⚠️ **Interferencia en el micrófono detectada.** No logro escucharte bien. Por favor, asegúrate de estar en un lugar silencioso o **escribe tu respuesta con el teclado** abajo. ✨"
                    }]);
                }
            }

            if (event.error === 'not-allowed') {
                alert("Permiso de micrófono denegado. Por favor actívalo en tu navegador.");
            }
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (interimTranscript) {
                setTranscriptPreview(interimTranscript);
                // Also reset silence count if we detect any sound/words
                if (noSpeechCount > 0) setNoSpeechCount(0);
            }

            if (finalTranscript) {
                setTranscriptPreview(finalTranscript);
                const confidence = event.results[0][0].confidence;

                // Stop immediately after result
                recognition.stop();
                setIsListening(false);
                setNoSpeechCount(0); // Reset cooldown on success!
                stopAudioMeter();

                if (!finalTranscript.trim()) return;

                setInput(finalTranscript);
                setLastPronunciationConfidence(confidence);

                // 🎯 AUTO-SEND logic for Calls/Assessment
                if (isCallConnected || callData?.isAssessment) {
                    handleSend(finalTranscript);
                }
            }
        };

        try {
            recognition.start();
        } catch (e) {
            console.error("🎤 Failed to start recognition:", e);
            setIsListening(false);
            isStartingMicRef.current = false;
            stopAudioMeter();
        }
    };

    const handleSend = async (text: string) => {
        if (!text.trim() || isThinking) return;

        // Stop listening immediately when sending
        if (isListening) setIsListening(false);

        const userMsg: Message = {
            role: 'user',
            content: text,
            pronunciationConfidence: lastPronunciationConfidence ?? undefined
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLastPronunciationConfidence(null); // Reset for next turn
        setIsThinking(true);
        setSparkState('thinking');

        try {
            // Build a prompt that includes the confidence if available
            let finalPrompt = text;
            if (userMsg.pronunciationConfidence !== undefined) {
                finalPrompt = `[STT CONFIDENCE: ${Math.round(userMsg.pronunciationConfidence * 100)}%] ${text}`;
            }
            const response = await getSparkResponse(finalPrompt, [...messages, userMsg], englishLevel);

            // 🚥 QUOTA CHECK: If we hit a 429 or similar error from AI
            if (response.sparkResponse.includes("429") || response.sparkResponse.includes("quota") || response.sparkResponse.includes("error 429")) {
                const quotaMsg = "🚀 ¡Oh no! Mis antenas cósmicas están sobrecargadas de tanto aprendizaje. **Descansaré 20 segundos** y estaré lista de nuevo. ¡Habla conmigo en un momento! ✨";
                setMessages(prev => [...prev, {
                    role: 'spark',
                    content: quotaMsg,
                    data: { ...response, sparkResponse: quotaMsg }
                }]);
                edgeTTS.speak("Mis antenas están un poco cansadas. ¡Dame un momento y vuelvo contigo!", 'spark');
                setIsThinking(false);
                setSparkState('idle');
                return;
            }
            let chatText = (response.callCharacter?.name === 'Rachelle' && response.callCharacter.en)
                ? response.callCharacter.en
                : response.sparkResponse;

            // Strip Spanish part if both are present in the transcription (cleaner English-only view)
            if (response.callCharacter?.name === 'Rachelle' && chatText.includes('¡')) {
                chatText = chatText.split(/[¡¿]/)[0].trim();
            }

            setMessages(prev => [...prev, {
                role: 'spark',
                content: chatText,
                data: response
            }]);

            // Determine the voice and text to use
            const isActiveCall = isCallConnected && callData;
            const isRachelle = isActiveCall && callData.name === 'Rachelle';
            const voiceToUse = isRachelle
                ? 'rachelle'
                : isActiveCall
                    ? (callData.gender === 'female' ? 'female' : 'diego')
                    : (response.narrator || 'rachelle');

            if (!isMuted) {
                // Bilingual Logic for Rachelle
                if (isRachelle && response.callCharacter?.en && response.callCharacter?.es) {
                    // 1. Speak English (Miss Rachelle)
                    await edgeTTS.speak(response.callCharacter.en, 'rachelle');

                    // 2. Speak Spanish (Lina) if translator is enabled
                    if (translationEnabled) {
                        await edgeTTS.speak(response.callCharacter.es, 'lina');
                    }
                } else {
                    // Normal behavior for other characters or spark system
                    let textToSpeak = (isActiveCall && response.callCharacter?.greeting)
                        ? response.callCharacter.greeting
                        : response.sparkResponse;

                    let finalVoice = voiceToUse;
                    // Prevent rachelle from speaking spanish intro on new call
                    if (response.callCharacter?.name === 'Rachelle' && !isActiveCall) {
                        finalVoice = 'spark';
                    }
                    edgeTTS.speak(textToSpeak, finalVoice as any);
                }
            }

            // Handle Safety Incident
            if (response.safetyIncident) {
                console.error('🚨 Safety incident detected!');
                setLastViolation(text);

                // Report to parents
                if (userProfile?.guardian_phone) {
                    const parentContact: ParentContact = {
                        parentName: userProfile.parent?.name || 'Padre/Madre',
                        parentPhone: userProfile.guardian_phone,
                        studentId: userProfile.id,
                        language: 'es',
                        reportFrequency: 'session'
                    };
                    sendSafetyAlert(parentContact, userProfile.name, text);
                }
            }

            // Handle Character Call
            if (response.callCharacter) {
                const isSamePerson = isCallConnected && callData?.name === response.callCharacter.name;

                if (!isSamePerson) {
                    // NEW CALL (First time or different person)
                    // Character update with transcription sync
                    let assessmentGreeting = response.callCharacter.en || response.callCharacter.greeting;
                    if (response.callCharacter.name === 'Rachelle') {
                        const spanishMarkers = /[¡¿]/;
                        if (spanishMarkers.test(assessmentGreeting)) {
                            assessmentGreeting = assessmentGreeting.split(spanishMarkers)[0].trim();
                        }
                    }

                    const updatedChar = {
                        ...response.callCharacter,
                        // Ensure greeting on screen matches what is heard (English transcription)
                        greeting: assessmentGreeting
                    };

                    setCallData(updatedChar);
                    setIsCalling(true);
                    setIsCallConnected(false); // Reset to "incoming" state
                    setCallStartTime(null); // Reset call timer
                    setQuestionsInCall(0); // Reset question counter

                    if (!isMuted) {
                        // RESET audio: restore loop and volume before playing
                        if (audioIncomingRef.current) {
                            audioIncomingRef.current.loop = true;
                            audioIncomingRef.current.volume = 0.3; // Slightly lower to hear the robot
                            audioIncomingRef.current.currentTime = 0;
                        }
                        audioIncomingRef.current?.play().catch(console.error);

                        // Announcement from Spark (Robot) in robotic voice - Removed to prevent American accent in Spanish
                        if (response.callCharacter.name === 'Rachelle') {
                            // edgeTTS.speak("¡Hola! Tienes una llamada de Rachelle para practicar tu inglés. ¿Deseas contestarla?", "spark");
                        }
                    }
                } else {
                    // Ensure greeting updates to the current English transcription
                    const updatedChar = {
                        ...response.callCharacter,
                        greeting: response.callCharacter.en || response.callCharacter.greeting
                    };
                    setCallData(updatedChar);

                    // 🎤 IMPORTANT: Ensure narrator state matches Rachelle or the character's gender
                    setCurrentNarrator(response.callCharacter.name === 'Rachelle' ? 'rachelle' : (response.callCharacter.gender === 'female' ? 'female' : 'diego'));
                    // Track this as a question in the conversation
                    setQuestionsInCall(prev => prev + 1);
                    // Award coins for quality engagement (+5 coins per thoughtful question)
                    addCoins(5, `Pregunta interesante para ${response.callCharacter.name}`);
                }

                if (response.callCharacter.avatarPrompt) {
                    generateImage(response.callCharacter.avatarPrompt, 'cinematic').then(img => {
                        setAvatarUrl(img);
                    });
                }

                // 🎯 Detect level assignment (A1, A2, B1, B2)
                const textToCheck = (response.callCharacter.en + " " + response.sparkResponse).toUpperCase();
                if (textToCheck.includes("NIVEL A1") || textToCheck.includes("LEVEL A1")) setEnglishLevel("A1");
                else if (textToCheck.includes("NIVEL A2") || textToCheck.includes("LEVEL A2")) setEnglishLevel("A2");
                else if (textToCheck.includes("NIVEL B1") || textToCheck.includes("LEVEL B1")) setEnglishLevel("B1");
                else if (textToCheck.includes("NIVEL B2") || textToCheck.includes("LEVEL B2")) setEnglishLevel("B2");

                if (response.callCharacter.objectPrompt) {
                    generateImage(response.callCharacter.objectPrompt, 'cinematic').then(img => {
                        setObjectUrl(img);
                    });
                } else {
                    setObjectUrl(null); // Clear if no object sent this time
                }
                // Add a fallback suggestion if recommendations are empty
                if (response.callCharacter.suggestions && response.callCharacter.suggestions.length === 0) {
                    setCallData(prev => prev ? { ...prev, suggestions: ["¿Cómo fue la batalla?", "¿Qué soñabas?", "¿Cuál es tu secreto?"] } : null);
                }
            } else if (isCallConnected && callData) {
                // SAFEGUARD: If we're in an active call but response has no callCharacter,
                // keep the call going and use the sparkResponse as the character's greeting
                console.warn('⚠️ [SparkChat] No callCharacter in response but call is active. Using sparkResponse as greeting.');
                setCallData(prev => prev ? {
                    ...prev,
                    greeting: response.sparkResponse || "¿Qué más quieres saber?",
                    suggestions: prev.suggestions || ["¿Qué más?", "Cuéntame más", "¿Y eso?"]
                } : null);
                // Keep the call connected - don't close it
                setCurrentNarrator(callData.gender === 'female' ? 'female' : 'diego');
            }

            // Pre-generate images for each highlight panel
            if (!response.safetyIncident && response.highlights) {
                const count = response.highlights.length;
                setPanelImages(new Array(count).fill(null));
                setIsGeneratingImages(new Array(count).fill(true));
                setCurrentNoteIndex(0); // Reset to page 1

                response.highlights.forEach((h, idx) => {
                    if (h.imagePrompt) {
                        generateImage(h.imagePrompt, 'cinematic').then(img => {
                            if (img) {
                                setPanelImages(prev => {
                                    const next = [...prev];
                                    next[idx] = img;
                                    return next;
                                });
                            }
                        }).finally(() => {
                            setIsGeneratingImages(prev => {
                                const next = [...prev];
                                next[idx] = false;
                                return next;
                            });
                        });
                    } else {
                        setIsGeneratingImages(prev => {
                            const next = [...prev];
                            next[idx] = false;
                            return next;
                        });
                    }
                });
            }

        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, {
                role: 'spark',
                content: "¡Vaya! Parece que un asteroide golpeó mis antenas. 🛰️"
            }]);
            setSparkState('idle');
        } finally {
            setIsThinking(false);
        }
    };

    const lastSparkMsg = messages.filter(m => m.role === 'spark').pop();
    const hasActiveComic = !!lastSparkMsg?.data?.highlights;

    // Theater becomes dark only when the user sends a message (starts the show)
    const theaterDark = theaterManualDim || (messages?.some(m => m.role === 'user') ?? false);

    return (
        <motion.div
            animate={{
                background: theaterDark ? '#0f172a' : '#f8fafc'
            }}
            transition={{ duration: 0.5 }}
            className="flex flex-col h-screen font-sans overflow-hidden relative pb-4 md:pb-0"
        >

            {/* --- APERTURA DE COMPUERTAS + CORTINAS DE TEATRO ESTELAR --- */}
            <AnimatePresence>
                {isOpening && (
                    <>
                        <motion.div
                            initial={{ y: 0 }}
                            exit={{ y: '-100%' }}
                            transition={{ duration: 1, ease: [0.7, 0, 0.3, 1] }}
                            className="absolute inset-0 z-[100] bg-slate-900 border-b-4 border-cyan-500/50 flex items-end justify-center pb-12"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-24 h-1 bg-cyan-500 animate-pulse rounded-full" />
                                <span className="text-[10px] font-black tracking-[0.5em] text-cyan-400 uppercase">Abriendo Compuertas</span>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ duration: 1, ease: [0.7, 0, 0.3, 1] }}
                            className="absolute inset-0 z-[100] bg-slate-900 border-t-4 border-cyan-500/50 flex items-start justify-center pt-12"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <span className="text-[10px] font-black tracking-[0.5em] text-purple-400 uppercase">Portal Cósmico Activo</span>
                                <div className="w-24 h-1 bg-purple-500 animate-pulse rounded-full" />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* --- PORTAL DE ENCUENTROS EXTRAORDINARIOS --- */}
            <AnimatePresence>
                {!isOpening && !curtainOpen && (
                    <>
                        {/* Portal Izquierdo (energía mágica) */}
                        <motion.div
                            initial={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                            className="absolute left-0 top-0 bottom-0 w-1/2 z-[99] bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-700 shadow-2xl"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3), transparent 50%)',
                            }}
                        >
                            {/* Efecto de energía */}
                            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_50%,rgba(59, 130, 246, 0.4),transparent)]" />

                            {/* Partículas mágicas */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-8 pr-8">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-3 h-3 rounded-full bg-purple-300 shadow-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                                ))}
                            </div>
                        </motion.div>

                        {/* Portal Derecho (energía mágica) */}
                        <motion.div
                            initial={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                            className="absolute right-0 top-0 bottom-0 w-1/2 z-[99] bg-gradient-to-l from-blue-900 via-blue-700 to-indigo-700 shadow-2xl"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.3), transparent 50%)',
                            }}
                        >
                            {/* Efecto de energía */}
                            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_70%_50%,rgba(59, 130, 246, 0.4),transparent)]" />

                            {/* Partículas mágicas */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-8 pl-8">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-3 h-3 rounded-full bg-purple-300 shadow-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                                ))}
                            </div>
                        </motion.div>

                        {/* Centro: Portal de Encuentro */}
                        <motion.div
                            initial={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
                        >
                            <div className="flex flex-col items-center gap-6 p-12 rounded-3xl bg-black/70 backdrop-blur-xl border-4 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.6)]">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full animate-pulse" />
                                    <Mic className="w-20 h-20 text-blue-300 animate-pulse relative z-10" />
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 tracking-wider uppercase italic">
                                    Speaking
                                </h1>
                                <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 tracking-widest uppercase">Class 🎤</h2>
                                <p className="text-sm md:text-lg font-bold text-blue-300 tracking-widest uppercase mt-4">
                                    ✨ ¡Habla inglés con Rachelle! ✨
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* --- FONDO SIDERAL DINÁMICO --- */}
            <motion.div
                className="absolute inset-0 z-0 pointer-events-none"
                animate={{ opacity: theaterDark ? 1 : 0 }}
                transition={{ duration: 1.5 }}
            >
                <div className="absolute inset-0 bg-[url('/img/stars_pattern.png')] opacity-20" />
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
            </motion.div>

            {/* --- HEADER --- */}
            <motion.div
                className="relative z-10 h-16 border-b-4 backdrop-blur-xl flex items-center justify-between px-6 shadow-xl"
                animate={{
                    backgroundColor: theaterDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.9)',
                    borderColor: theaterDark ? '#000000' : '#cbd5e1'
                }}
                transition={{ duration: 1.5 }}
            >
                <div className="flex items-center gap-4">
                    <div className="p-1 px-3 bg-black border-2 border-cyan-500/30 rounded-full flex items-center gap-2">
                        <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-black tracking-widest text-cyan-400/80">SISTEMA NOVA: ONLINE</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-2 rounded-lg transition-all ${isMuted ? 'bg-red-500/10 text-red-500' : theaterDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'}`}
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <button
                        onClick={handleStartSession}
                        className={`p-2 rounded-lg ${theaterDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'}`}
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </motion.div>

            {/* --- ÁREA PRINCIPAL --- */}
            <div className={`relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden border-x-4 transition-colors duration-1000 ${theaterDark ? 'border-black' : 'border-slate-200'}`}>

                {/* --- IZQUIERDA: TABLERO DE HISTORIETA --- */}
                <div className="flex-1 flex flex-col p-4 md:p-6 space-y-4 overflow-y-auto relative custom-scrollbar">
                    <motion.div
                        className="flex-1 relative rounded-3xl border-4 backdrop-blur-sm overflow-hidden group shadow-2xl"
                        animate={{
                            backgroundColor: theaterDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.5)',
                            borderColor: theaterDark ? '#000000' : '#cbd5e1'
                        }}
                        transition={{ duration: 1.5 }}
                    >
                        {/* Marco de Pantalla */}
                        <div className={`absolute inset-0 border-[16px] pointer-events-none transition-colors duration-1000 z-20 ${theaterDark ? 'border-black/20' : 'border-slate-300/20'}`} />
                        <div className={`absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-xl border-x border-b flex items-center gap-2 transition-colors duration-1000 z-30 ${theaterDark ? 'bg-black border-white/10' : 'bg-slate-200 border-slate-300'}`}>
                            <div className="w-1.5 h-1.5 bg-kid-yellow rounded-full animate-ping" />
                            <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${theaterDark ? 'text-slate-500' : 'text-slate-600'}`}>📞 TERMINAL CÓSMICO ACTIVO</span>
                        </div>

                        {/* Contenido Visual: TELÉFONO CÓSMICO ESPECTACULAR */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-900 to-black flex items-center justify-center overflow-hidden">
                            {/* FONDO CÓSMICO DINÁMICO */}
                            <div className="absolute inset-0">
                                {/* Gradientes radiales interplanetarios */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(168,85,247,0.3),transparent_50%)]" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.3),transparent_50%)]" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.15),transparent_60%)]" />

                                {/* Estrellas dinámicas */}
                                {[...Array(50)].map((_, i) => (
                                    <motion.div
                                        key={`star-${i}`}
                                        animate={{
                                            opacity: [0.3, 1, 0.3],
                                            scale: [0.5, 1, 0.5]
                                        }}
                                        transition={{
                                            duration: 3 + Math.random() * 3,
                                            repeat: Infinity,
                                            delay: Math.random() * 2
                                        }}
                                        className="absolute w-1.5 h-1.5 bg-white rounded-full blur-sm"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                            boxShadow: `0 0 ${4 + Math.random() * 4}px rgba(255,255,255,0.8)`
                                        }}
                                    />
                                ))}

                                {/* Líneas de energía gravitacional */}
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={`orbit-${i}`}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20 + i * 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0"
                                        style={{
                                            borderRadius: '50%',
                                            border: `2px solid rgba(${59 + i * 20},130,${246 - i * 10},${0.1 - i * 0.01})`
                                        }}
                                    />
                                ))}
                            </div>

                            <AnimatePresence>
                                {/* TELÉFONO CÓSMICO HOLOGRÁFICO */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="relative z-20"
                                    style={{ perspective: "1200px" }}
                                >
                                    {/* Aura de energía dinámica */}
                                    <motion.div
                                        animate={{
                                            boxShadow: [
                                                '0 0 40px rgba(168,85,247,0.6), inset 0 0 20px rgba(168,85,247,0.3)',
                                                '0 0 80px rgba(236,72,153,0.8), inset 0 0 30px rgba(236,72,153,0.4)',
                                                '0 0 40px rgba(168,85,247,0.6), inset 0 0 20px rgba(168,85,247,0.3)'
                                            ]
                                        }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="absolute -inset-12 rounded-3xl"
                                    />

                                    {/* Anillo de cuasares */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        className="absolute -inset-8 rounded-3xl"
                                        style={{
                                            border: '3px dashed rgba(34,211,238,0.3)',
                                            boxShadow: '0 0 30px rgba(34,211,238,0.5)'
                                        }}
                                    />

                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                        className="absolute -inset-4 rounded-3xl"
                                        style={{
                                            border: '2px solid rgba(236,72,153,0.2)',
                                            boxShadow: '0 0 20px rgba(236,72,153,0.4)'
                                        }}
                                    />

                                    {/* CUERPO DEL TELÉFONO */}
                                    <motion.div
                                        animate={{
                                            rotateX: [0, 2, -2, 0],
                                            rotateY: [0, -3, 3, 0],
                                            rotateZ: 360
                                        }}
                                        transition={{
                                            rotateX: { duration: 4, repeat: Infinity },
                                            rotateY: { duration: 5, repeat: Infinity },
                                            rotateZ: { duration: 8, repeat: Infinity, ease: "linear" }
                                        }}
                                        className="relative w-56 h-80"
                                    >
                                        <div className="w-full h-full bg-gradient-to-br from-purple-600 via-indigo-600 to-black rounded-3xl border-8 border-cyan-400/60 overflow-hidden relative shadow-2xl"
                                            style={{
                                                boxShadow: '0 0 50px rgba(34,211,238,0.8), inset 0 0 30px rgba(168,85,247,0.4)'
                                            }}
                                        >
                                            {/* Efecto de vidrio holográfico */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

                                            {/* PANTALLA HUD INTERPLANETARIA */}
                                            <div className="absolute inset-3 bg-black rounded-2xl border-2 border-cyan-400/40 overflow-hidden flex flex-col items-center justify-center gap-6 p-6 relative"
                                                style={{
                                                    boxShadow: 'inset 0 0 30px rgba(34,211,238,0.3)'
                                                }}
                                            >
                                                {/* Línea de escaneo superior */}
                                                <motion.div
                                                    animate={{ y: [0, 200, 0] }}
                                                    transition={{ duration: 3, repeat: Infinity }}
                                                    className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                                                    style={{
                                                        boxShadow: '0 0 10px rgba(34,211,238,0.8)'
                                                    }}
                                                />

                                                {/* CUADROS HUD EN ESQUINAS */}
                                                <div className="absolute top-2 left-2 w-12 h-12 border-2 border-cyan-400/50" style={{ boxShadow: '0 0 10px rgba(34,211,238,0.4)' }} />
                                                <div className="absolute top-2 right-2 w-12 h-12 border-2 border-magenta-400/50" style={{ boxShadow: '0 0 10px rgba(236,72,153,0.4)' }} />
                                                <div className="absolute bottom-2 left-2 w-12 h-12 border-2 border-magenta-400/50" style={{ boxShadow: '0 0 10px rgba(236,72,153,0.4)' }} />
                                                <div className="absolute bottom-2 right-2 w-12 h-12 border-2 border-cyan-400/50" style={{ boxShadow: '0 0 10px rgba(34,211,238,0.4)' }} />

                                                {/* CONTENIDO CENTRAL */}
                                                <motion.div
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="text-7xl relative z-10"
                                                >
                                                    📡
                                                </motion.div>

                                                {/* Texto con efecto de distorsión */}
                                                <motion.div
                                                    animate={{
                                                        textShadow: [
                                                            '0 0 10px rgba(34,211,238,0.8), 0 0 20px rgba(34,211,238,0.4)',
                                                            '0 0 20px rgba(236,72,153,0.8), 0 0 30px rgba(236,72,153,0.4)',
                                                            '0 0 10px rgba(34,211,238,0.8), 0 0 20px rgba(34,211,238,0.4)'
                                                        ]
                                                    }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="text-center relative z-10"
                                                >
                                                    <p className="text-cyan-400 font-black text-sm uppercase tracking-widest">Sincronización Cósmica</p>
                                                    <p className="text-magenta-300 font-bold text-xs mt-1">Transmisión Entrante</p>
                                                </motion.div>

                                                {/* Barra de carga dinámica */}
                                                <div className="w-32 h-1 bg-black/50 border-2 border-cyan-400/40 rounded-full overflow-hidden relative z-10 mt-4">
                                                    <motion.div
                                                        animate={{
                                                            width: ['0%', '100%', '0%'],
                                                            background: ['linear-gradient(90deg, transparent, cyan)', 'linear-gradient(90deg, cyan, magenta)', 'linear-gradient(90deg, magenta, transparent)']
                                                        }}
                                                        transition={{ duration: 2.5, repeat: Infinity }}
                                                        className="h-full"
                                                    />
                                                </div>

                                                {/* Indicadores de frecuencia */}
                                                <div className="flex gap-2 mt-2 relative z-10">
                                                    {[...Array(5)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            animate={{ height: ['4px', '16px', '4px'] }}
                                                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                                                            className="w-1.5 bg-gradient-to-t from-cyan-400 to-magenta-400 rounded-full"
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Destellos de interferencia */}
                                            <motion.div
                                                animate={{ opacity: [0, 0.3, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                                                className="absolute inset-0 rounded-2xl"
                                                style={{
                                                    background: 'linear-gradient(45deg, rgba(34,211,238,0.2), transparent)',
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                        </div>
                                    </motion.div>

                                    {/* PARTÍCULAS DE PLASMA ORBITALES */}
                                    {[...Array(16)].map((_, i) => {
                                        const angle = (i / 16) * Math.PI * 2;
                                        const radius = 150;
                                        const x = Math.cos(angle) * radius;
                                        const y = Math.sin(angle) * radius;

                                        return (
                                            <motion.div
                                                key={`plasma-${i}`}
                                                animate={{
                                                    x: [x, x * 1.3, x],
                                                    y: [y, y * 1.3, y],
                                                    scale: [1, 1.5, 1],
                                                    opacity: [0.4, 1, 0.4]
                                                }}
                                                transition={{
                                                    duration: 3 + (i % 3),
                                                    repeat: Infinity,
                                                    delay: i * 0.15
                                                }}
                                                className={`absolute w-3 h-3 rounded-full backdrop-blur-sm ${i % 2 === 0 ? 'bg-cyan-400' : 'bg-magenta-400'}`}
                                                style={{
                                                    left: '50%',
                                                    top: '50%',
                                                    marginLeft: '-6px',
                                                    marginTop: '-6px',
                                                    boxShadow: i % 2 === 0 ? '0 0 15px rgba(34,211,238,0.8)' : '0 0 15px rgba(236,72,153,0.8)'
                                                }}
                                            />
                                        );
                                    })}

                                    {/* RAYOS DE ENERGÍA DINÁMICOS */}
                                    {[...Array(8)].map((_, i) => (
                                        <motion.div
                                            key={`ray-${i}`}
                                            animate={{
                                                opacity: [0, 0.6, 0],
                                                scale: [0, 1, 0]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: i * 0.25
                                            }}
                                            className="absolute inset-0 rounded-3xl pointer-events-none"
                                            style={{
                                                border: `2px solid rgba(${i % 2 === 0 ? '34,211,238' : '236,72,153'},0.6)`,
                                                boxShadow: i % 2 === 0 ? '0 0 20px rgba(34,211,238,0.8)' : '0 0 20px rgba(236,72,153,0.8)'
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            </AnimatePresence>

                            {/* --- HOLOGRAPHIC CALL INTERFACE --- */}
                            <AnimatePresence>
                                {isCalling && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-50 bg-indigo-950/40 backdrop-blur-3xl flex flex-col items-center p-8 overflow-y-auto"
                                    >
                                        {/* Scanner Background */}
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                                            <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-cyan-500/50 to-transparent animate-scan" />
                                            <div className="absolute inset-0 border-[2px] border-cyan-500/20" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.05) 3px)' }} />
                                        </div>

                                        {!isCallConnected ? (
                                            /* INCOMING CALL SCREEN */
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="flex flex-col items-center gap-12 text-center"
                                            >
                                                <div className="relative">
                                                    <div className="w-48 h-48 rounded-full border-4 border-cyan-400/30 flex items-center justify-center animate-pulse">
                                                        <div className="w-40 h-40 rounded-full border-[10px] border-cyan-400 border-t-transparent animate-spin" />
                                                    </div>
                                                    <PhoneIncoming className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 text-cyan-400 animate-bounce" />
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-xl font-black text-cyan-400 tracking-[0.3em] uppercase italic">Transmisión Entrante</h3>
                                                    <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg">
                                                        {callData?.name}
                                                    </h2>
                                                </div>

                                                <div className="flex gap-8">
                                                    <button
                                                        onClick={() => {
                                                            setIsCalling(false);
                                                            setIsCallConnected(false);
                                                            setCallData(null);
                                                            setAvatarUrl(null);
                                                            if (audioIncomingRef.current) {
                                                                audioIncomingRef.current.loop = false;
                                                                audioIncomingRef.current.pause();
                                                                audioIncomingRef.current.currentTime = 0;
                                                                audioIncomingRef.current.volume = 0;
                                                            }
                                                        }}
                                                        className="w-24 h-24 rounded-full bg-red-500/20 border-4 border-red-500 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all hover:scale-110 active:scale-90"
                                                    >
                                                        <X className="w-10 h-10" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsCallConnected(true);
                                                            setCallStartTime(Date.now()); // Start tracking call duration
                                                            // COMPLETELY STOP incoming sound - disable loop, pause, mute
                                                            if (audioIncomingRef.current) {
                                                                audioIncomingRef.current.loop = false;
                                                                audioIncomingRef.current.pause();
                                                                audioIncomingRef.current.currentTime = 0;
                                                                audioIncomingRef.current.volume = 0;
                                                            }
                                                            if (!isMuted) {
                                                                audioConnectedRef.current?.play().catch(console.error);
                                                            }

                                                            if (callData?.greeting && !isMuted) {
                                                                // Use specific male/female voices, default to diego for male characters
                                                                const isRachelle = callData.name === 'Rachelle';
                                                                const voiceType = isRachelle ? 'rachelle' : (callData.gender === 'female' ? 'female' : 'diego');

                                                                if (isRachelle && callData.en && callData.es) {
                                                                    edgeTTS.speak(callData.en, 'rachelle').then(() => {
                                                                        if (translationEnabled) {
                                                                            edgeTTS.speak(callData.es!, 'lina');
                                                                        }
                                                                    });
                                                                } else {
                                                                    edgeTTS.speak(callData.greeting, voiceType as any);
                                                                }
                                                            }

                                                            // 💰 AWARD COINS FOR ACCEPTING CHALLENGE
                                                            addCoins(10, `Aceptaste el reto de conversar con ${callData?.name}`);
                                                        }}
                                                        className="w-32 h-32 rounded-full bg-green-500 border-4 border-white shadow-[0_0_50px_rgba(34,197,94,0.5)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all text-sm font-black uppercase tracking-widest"
                                                    >
                                                        <Phone className="w-12 h-12" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            /* ACTIVE CALL SCREEN */
                                            <motion.div
                                                initial={{ y: 50, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="w-full min-h-full flex flex-col items-center justify-start gap-12 py-12"
                                            >
                                                <div className="relative w-80 h-80 hologram-container hologram-flicker">
                                                    {/* Glow behind character */}
                                                    <div className="absolute inset-x-0 bottom-0 h-32 bg-cyan-500/40 blur-[120px] rounded-full" />

                                                    <div className="w-full h-full rounded-full border-[6px] border-cyan-400/50 p-2 overflow-hidden shadow-[0_0_80px_rgba(34,211,238,0.5)] bg-black/40 backdrop-blur-sm relative">
                                                        {avatarUrl ? (
                                                            <motion.img
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                src={avatarUrl}
                                                                className="w-full h-full object-cover rounded-full mix-blend-screen glitch-effect hologram-glow"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                                                                <User className="w-24 h-24 text-cyan-800" />
                                                            </div>
                                                        )}

                                                        {/* LIVE VOLUME METER ON AVATAR */}
                                                        {isListening && (
                                                            <div className="absolute inset-x-0 bottom-4 flex items-end justify-center gap-1 h-12 px-8 overflow-hidden">
                                                                {[...Array(12)].map((_, i) => (
                                                                    <motion.div
                                                                        key={i}
                                                                        animate={{
                                                                            height: [
                                                                                `${10 + Math.random() * 20}%`,
                                                                                `${Math.max(20, volume * (0.5 + Math.random()))}%`,
                                                                                `${10 + Math.random() * 20}%`
                                                                            ]
                                                                        }}
                                                                        transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.05 }}
                                                                        className="w-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-center space-y-4 px-12 relative">
                                                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                                                        {callData?.name}
                                                    </h2>

                                                    {/* --- NUEVO: TRADUCTOR ESCUDO & ASSESSMENT --- */}
                                                    <div className="flex flex-col items-center gap-4 py-2">
                                                        {callData?.name === 'Rachelle' && !callData?.isAssessment && (
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => setTranslationEnabled(!translationEnabled)}
                                                                className={`px-6 py-2 rounded-full border-2 flex items-center gap-3 transition-all ${translationEnabled
                                                                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                                                                    : 'bg-slate-800/40 border-slate-600 text-slate-400'
                                                                    }`}
                                                            >
                                                                <Shield className={`w-5 h-5 ${translationEnabled ? 'animate-pulse' : ''}`} />
                                                                <span className="font-black uppercase tracking-widest text-xs">
                                                                    Traductor Escudo: {translationEnabled ? 'Activado' : 'Desactivado'}
                                                                </span>
                                                            </motion.button>
                                                        )}

                                                        {callData?.isAssessment && (
                                                            <div className="w-80 space-y-2">
                                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-cyan-400">
                                                                    <span>Placement Test</span>
                                                                    <span>{englishLevel === 'UNKNOWN' ? 'Validación Oral' : `Paso ${callData.questionIndex || 1} de 15`}</span>
                                                                </div>
                                                                <div className="w-full h-3 bg-black/40 rounded-full border border-cyan-500/30 overflow-hidden p-0.5">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${((callData.questionIndex || 1) / 15) * 100}%` }}
                                                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Object 3D DISABLED */}

                                                    {callData?.isAssessment ? (
                                                        <div className="flex flex-col items-center gap-4 py-8 bg-black/40 rounded-2xl border-2 border-cyan-500/40 px-12 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                                                            <p className="text-cyan-100 text-2xl font-bold italic leading-relaxed max-w-2xl text-center">
                                                                "{callData?.greeting || "Listening..."}"
                                                            </p>
                                                            <div className="flex gap-1.5 opacity-50 mt-2">
                                                                {[...Array(3)].map((_, i) => (
                                                                    <motion.div
                                                                        key={i}
                                                                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                                                                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                                                                        className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_cyan]"
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-cyan-200 text-2xl font-bold italic leading-relaxed max-w-3xl border-l-4 border-cyan-500 pl-6 mx-auto bg-cyan-500/10 py-4 pr-12 rounded-r-2xl">
                                                            "{callData?.greeting}"
                                                        </p>
                                                    )}

                                                    {/* PISTAS GALÁCTICAS (Learning Clues) */}
                                                    {callData?.learningClues && callData.learningClues.length > 0 && (
                                                        <div className="flex flex-wrap justify-center gap-4 mt-8">
                                                            {callData.learningClues.map((clue, idx) => (
                                                                <motion.div
                                                                    key={idx}
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.5 + (idx * 0.2) }}
                                                                    className={`px-6 py-3 rounded-2xl border-4 border-black shadow-comic flex items-center gap-3 animate-pulse
                                                                        ${highlightCardStyles[clue.color as keyof typeof highlightCardStyles] || highlightCardStyles.yellow}
                                                                    `}
                                                                >
                                                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-black text-xl">
                                                                        💡
                                                                    </div>
                                                                    <span className="font-black italic uppercase tracking-tight text-sm">
                                                                        {clue.text}
                                                                    </span>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="w-full max-w-4xl space-y-6">
                                                    {callData?.isAssessment && (
                                                        <div className="flex flex-col items-center gap-4 py-4">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => {
                                                                    setNoSpeechCount(0);
                                                                    toggleMic();
                                                                }}
                                                                className={`w-24 h-24 rounded-full border-8 border-black flex items-center justify-center transition-all duration-500 shadow-comic relative overflow-hidden ${isListening ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.8)]' : 'bg-slate-700 hover:bg-slate-600'}`}
                                                            >
                                                                {/* Volume Meter Overlay */}
                                                                {isListening && (
                                                                    <motion.div
                                                                        initial={{ height: 0 }}
                                                                        animate={{ height: `${volume}%` }}
                                                                        className="absolute bottom-0 left-0 right-0 bg-white/20 pointer-events-none"
                                                                    />
                                                                )}

                                                                {/* Dynamic Aura when speaking */}
                                                                {isListening && volume > 10 && (
                                                                    <motion.div
                                                                        animate={{ scale: [1, 1.2 + volume / 100, 1] }}
                                                                        transition={{ duration: 0.2, repeat: Infinity }}
                                                                        className="absolute inset-0 rounded-full border-4 border-white opacity-50 pointer-events-none"
                                                                    />
                                                                )}

                                                                <Mic className={`w-10 h-10 relative z-10 ${isListening ? 'text-white' : 'text-slate-300'} ${isListening && volume > 20 ? 'animate-bounce' : ''}`} />
                                                            </motion.button>
                                                            <span className={`font-black text-xs uppercase tracking-[0.2em] transition-colors py-2 px-6 rounded-full bg-black/40 border-2 ${isListening ? 'text-red-400 border-red-500/50' : (noSpeechCount >= 4 ? 'text-orange-400 border-orange-500/50' : 'text-slate-500 border-white/10')}`}>
                                                                {isListening ? (transcriptPreview ? `"${transcriptPreview}"` : (volume > 5 ? 'Te escucho...' : '¡Habla ahora!')) : (noSpeechCount >= 4 ? 'Escribe tu respuesta abajo 👇' : 'Click para Hablar')}
                                                            </span>

                                                            {noSpeechCount >= 3 && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    className="flex flex-col items-center gap-4 mt-2 px-8 py-4 bg-black/60 rounded-3xl border-2 border-yellow-500/30 backdrop-blur-xl shadow-2xl max-w-md w-full"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <AlertTriangle className="w-6 h-6 text-yellow-500 animate-pulse" />
                                                                        <p className="text-yellow-400 text-xs font-black uppercase tracking-widest leading-relaxed">
                                                                            {noSpeechCount >= 4
                                                                                ? "El micrófono no responde. ¡Usa el teclado abajo!"
                                                                                : "No te escuchamos bien. ¿Tu micro está activo?"}
                                                                        </p>
                                                                    </div>

                                                                    {noSpeechCount >= 4 && (
                                                                        <div className="w-full space-y-3">
                                                                            <div className="flex gap-2">
                                                                                <input
                                                                                    type="text"
                                                                                    value={input}
                                                                                    onChange={(e) => setInput(e.target.value)}
                                                                                    onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                                                                                    placeholder="Escribe tu respuesta aquí..."
                                                                                    className="flex-1 bg-white/10 border-2 border-cyan-500/30 rounded-full px-6 py-3 text-white placeholder-cyan-500/40 focus:outline-none focus:border-cyan-500 transition-all font-bold"
                                                                                />
                                                                                <button
                                                                                    onClick={() => handleSend(input)}
                                                                                    className="p-3 bg-cyan-500 rounded-full text-black hover:scale-110 active:scale-95 transition-all"
                                                                                >
                                                                                    <Send size={20} />
                                                                                </button>
                                                                            </div>
                                                                            <p className="text-[10px] text-cyan-400/60 text-center font-bold">Lamentamos la falla técnica. ¡Sigamos por escrito!</p>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {!callData?.isAssessment && (
                                                        <h4 className="text-cyan-400 font-black text-center uppercase tracking-[0.4em] text-xs">Sugerencias para preguntar:</h4>
                                                    )}
                                                    {!callData?.isAssessment && (
                                                        <div className="flex flex-wrap justify-center gap-4">
                                                            <button
                                                                onClick={() => {
                                                                    handleSend("¡Acepto el reto de conocimiento! Ponme a prueba.");
                                                                    // Award coins for accepting challenge
                                                                    addCoins(10, `¡Aceptaste el reto de conocimiento con ${callData?.name}!`);
                                                                    // Start call timer when accepting
                                                                    setCallStartTime(Date.now());
                                                                }}
                                                                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black rounded-full border-4 border-black shadow-[0_4px_0_0_#000] hover:scale-105 transition-transform flex items-center gap-2 uppercase italic text-sm group"
                                                            >
                                                                <Star className="w-5 h-5 group-hover:animate-spin" />
                                                                ¡Acepto el Reto! (+10 NovaCoins)
                                                            </button>
                                                            {(callData?.suggestions && callData.suggestions.length > 0 ? callData.suggestions : ["¡Cuéntame más de tu historia!", "¿Cómo era el mundo en tu época?", "¿Qué consejo me darías?"]).map((s, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => {
                                                                        handleSend(s);
                                                                        // MUTE incoming sound while in active call conversation
                                                                        if (audioIncomingRef.current) {
                                                                            audioIncomingRef.current.loop = false;
                                                                            audioIncomingRef.current.pause();
                                                                            audioIncomingRef.current.volume = 0;
                                                                        }
                                                                    }}
                                                                    className="px-8 py-4 bg-white/10 hover:bg-cyan-500 hover:text-black hover:scale-105 active:scale-95 transition-all backdrop-blur-md rounded-2xl border-4 border-white/20 text-white font-black text-lg shadow-comic-sm uppercase italic tracking-tight"
                                                                >
                                                                    {s}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        // Award time-based bonus (50 coins for 5+ min conversation)
                                                        let totalCoinsThisSession = 0;
                                                        if (callStartTime) {
                                                            const callDuration = (Date.now() - callStartTime) / 1000 / 60; // minutes
                                                            if (callDuration >= 5) {
                                                                addCoins(50, `Conversación exitosa con ${callData?.name} (${Math.floor(callDuration)} min)`);
                                                                totalCoinsThisSession += 50;
                                                            } else if (callDuration >= 1) {
                                                                addCoins(20, `Conversación con ${callData?.name}`);
                                                                totalCoinsThisSession += 20;
                                                            }
                                                        }
                                                        // Award bonus for multiple questions
                                                        if (questionsInCall >= 3) {
                                                            addCoins(15, `Hiciste ${questionsInCall} preguntas profundas`);
                                                            totalCoinsThisSession += 15;
                                                        }

                                                        // 💾 SAVE CONVERSATION TO NOTEBOOK
                                                        const totalCoins = (questionsInCall * 5) + totalCoinsThisSession;
                                                        if (userProfile?.id && callData) {
                                                            const callDuration = callStartTime
                                                                ? Math.round((Date.now() - callStartTime) / 1000 / 60)
                                                                : 0;

                                                            notebookService.saveConversation(
                                                                userProfile.id,
                                                                callData.name,
                                                                questionsInCall,
                                                                totalCoins,
                                                                callDuration,
                                                                { silent: true } // Silent because we'll show custom confirmation
                                                            );

                                                            // Show confirmation toast
                                                            setSavedConversationInfo({
                                                                character: callData.name,
                                                                questions: questionsInCall,
                                                                coins: totalCoins
                                                            });
                                                            setShowSavedConfirmation(true);

                                                            // Trigger victory celebration
                                                            setCelebrationCoins(totalCoins);
                                                            setShowVictoryCelebration(true);
                                                            setTimeout(() => setShowVictoryCelebration(false), 2500);

                                                            // Check and unlock achievements
                                                            if (userProfile) {
                                                                checkAndUnlockAchievements({
                                                                    questionsAsked: questionsInCall,
                                                                    conversationsCompleted: 1,
                                                                    totalCoinsEarned: totalCoins,
                                                                    characterCount: 1
                                                                });
                                                            }
                                                        }

                                                        setIsCalling(false);
                                                        setIsCallConnected(false);
                                                        setCallData(null);
                                                        setAvatarUrl(null);
                                                        setCallStartTime(null);
                                                        setQuestionsInCall(0);
                                                        if (audioIncomingRef.current) {
                                                            audioIncomingRef.current.loop = false;
                                                            audioIncomingRef.current.pause();
                                                            audioIncomingRef.current.currentTime = 0;
                                                            audioIncomingRef.current.volume = 0;
                                                        }
                                                    }}
                                                    className="px-12 py-4 bg-red-600 border-4 border-black text-white font-black rounded-full shadow-comic-sm hover:bg-red-700 transition-all flex items-center gap-4 uppercase italic mb-8"
                                                >
                                                    Finalizar Llamada <X className="w-6 h-6" />
                                                </button>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Menú de Botones Inferiores */}
                    <div className="flex flex-col gap-4">
                        <AnimatePresence>
                            {lastSparkMsg?.data?.topicChoices && !isThinking && (
                                <motion.div className="flex flex-wrap justify-center gap-3">
                                    {lastSparkMsg.data?.topicChoices?.map((choice, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(choice.value)}
                                            className="px-6 py-2 bg-cyan-500 text-black font-black rounded-xl border-4 border-black shadow-comic-sm hover:scale-105 transition-transform text-xs uppercase italic"
                                        >
                                            {choice.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {lastSparkMsg?.data?.curiosityMenu && (
                            <CuriosityMenu
                                options={lastSparkMsg.data?.curiosityMenu || []}
                                onSelect={handleSend}
                                visible={!isThinking}
                                darkMode={theaterDark}
                            />
                        )}
                    </div>
                </div>

                {/* --- DERECHA: CHAT & AVATAR --- */}
                <motion.div
                    className="w-full md:w-[450px] flex flex-col border-t-4 md:border-t-0 md:border-l-4 backdrop-blur-md relative z-40"
                    animate={{
                        backgroundColor: theaterDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                        borderColor: theaterDark ? '#000000' : '#cbd5e1'
                    }}
                >
                    {/* Avatar Header */}
                    <div className="p-8 flex flex-col items-center border-b-4 border-black/10">
                        <div className="relative mb-6">
                            {currentNarrator === 'spark' ? (
                                <SparkAvatar size={110} state={isThinking ? 'thinking' : sparkState} />
                            ) : currentNarrator === 'rachelle' ? (
                                <RachelleAvatar size={110} state={isThinking ? 'thinking' : sparkState} />
                            ) : (
                                <ChronosAvatar size={110} state={sparkState === 'speaking' ? 'narrating' : (isThinking ? 'thinking' : 'idle')} />
                            )}
                            <div className="absolute -bottom-1 right-3 w-6 h-6 bg-green-500 rounded-full border-4 border-black shadow-[0_0_15px_#22c55e]" />
                        </div>
                        <h3 className={`text-xl font-black uppercase italic ${theaterDark ? 'text-white' : 'text-slate-800'}`}>
                            {currentNarrator === 'spark' ? 'Spark Guardian' : (currentNarrator === 'rachelle' ? 'Miss Rachelle' : 'Chronos Archivist')}
                        </h3>
                    </div>

                    {/* Chat History */}
                    <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${theaterDark ? "bg-black/20" : "bg-slate-50"}`}>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: m.role === 'user' ? 30 : -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`
                                    max-w-[90%] p-5 rounded-3xl text-sm font-bold border-4 border-black shadow-comic
                                    ${m.role === 'user' ? 'bg-kid-yellow' : 'bg-slate-800 text-white'}
                                    ${callData?.isAssessment && m.role === 'user' ? 'blur-md select-none opacity-40' : ''}
                                `}>
                                    {callData?.isAssessment && m.role === 'user' ? (
                                        <div className="flex items-center gap-2 italic text-[10px] uppercase opacity-60">
                                            <Mic className="w-3 h-3" /> Evaluating your Listening...
                                        </div>
                                    ) : (
                                        <div className="whitespace-pre-wrap">{formatMessage(m.content, m.data?.highlights)}</div>
                                    )}

                                    {m.role === 'user' && m.pronunciationConfidence !== undefined && !callData?.isAssessment && (
                                        <div className="mt-2 flex items-center gap-2 border-t-2 border-black/10 pt-2">
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`w-2 h-2 rounded-full ${idx < Math.round(m.pronunciationConfidence! * 5) ? 'bg-black' : 'bg-black/20'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] uppercase font-black tracking-tighter opacity-70">
                                                Pronunciation Quality: {Math.round(m.pronunciationConfidence * 100)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start p-4 bg-slate-800/40 rounded-2xl w-24 gap-2">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>

                    {/* Input Console */}
                    <div className="p-6 border-t-4 border-black/10">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                            className="relative"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribe tu pregunta..."
                                className={`w-full border-4 rounded-2xl px-6 py-4 text-base font-black focus:border-cyan-500 ${theaterDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300'}`}
                                disabled={isThinking}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={toggleMic}
                                    className={`p-3 rounded-xl border-4 border-black shadow-comic-sm transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                                >
                                    <Mic size={20} className={isListening ? 'animate-bounce' : ''} />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isThinking}
                                    className="p-3 bg-cyan-500 text-black rounded-xl border-4 border-black shadow-comic-sm hover:scale-105 transition-transform"
                                >
                                    {isThinking ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>

            <div className="absolute inset-0 pointer-events-none border-[12px] border-black/30 z-[60]" />


            {/* Conversation Saved Confirmation Toast */}
            {savedConversationInfo && (
                <ConversationSaved
                    characterName={savedConversationInfo.character}
                    questionsAsked={savedConversationInfo.questions}
                    coinsEarned={savedConversationInfo.coins}
                    visible={showSavedConfirmation}
                    onDismiss={() => setShowSavedConfirmation(false)}
                />
            )}

            {/* Victory Celebration */}
            <VictoryCelebration
                visible={showVictoryCelebration}
                coinsEarned={celebrationCoins}
            />
        </motion.div>
    );
};
