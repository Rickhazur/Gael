import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { generateSocraticSteps, generateImage } from '../../../services/ai_service';
import { LinaAvatar } from './LinaAvatar';
import { RachelleAvatar } from './RachelleAvatar';
import { Button } from '@/components/ui/button';
import { generateSpeech, LINA_GREETING_AUDIO_TEXTS } from '../../../services/edgeTTS';
import { Cloud, ChevronDown, ChevronUp, Sparkles, Zap, Upload, Send, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CelebrationOverlay } from './CelebrationOverlay';
import { ShopModal } from './ShopModal';
import { GamificationMini } from './GamificationBar';
import { useGamification } from '../../../hooks/useGamification';
import { usePetContext } from '@/context/PetContext';
// 🧮 MATH VALIDATOR - For perfect calculations
import {
    generateStepsForProblem,
    parseMathProblem,
    validateAnswer,
    type VerticalOpStep
} from '@/services/mathValidator';

import { AlgorithmicTutor } from '../../../services/algorithmicTutor';
import { WordProblemTutor } from '../../../services/tutors/WordProblemTutor';
import { parseGenericWordProblem, parseWordProblem } from '../../../data/wordProblemParser';
import { normalizePastedFractions } from '@/utils/normalizePastedFractions';
import type { TutorChatProps } from './TutorChat.types';

interface Message {
    role: 'nova' | 'user';
    content: string;
    type?: 'text' | 'image';
    timestamp: number;
    detailedExplanation?: string;
    isHidden?: boolean;
    visualState?: any;
}

export interface TutorChatRef {
    analyzeImage: (base64: string, context: string) => Promise<void>;
    analyzeText: (text: string, isSystemHidden?: boolean) => Promise<void>;
    startSession: (taskTitle: string) => void;
    getAllMessages: () => Message[];
    stopAudio: () => void;
    addTutorMessage: (content: string) => Promise<void>;
    /** Clear chat so the user can propose another operation (e.g. after clearing the board). */
    clearChat: () => void;
}

// ANIMATED TEXT COMPONENT (Typewriter Effect - with Bold/Color Support)
const AnimatedWordText = ({ text }: { text: string }) => {
    // Split by bold markers
    const parts = text.split(/(\*\*.*?\*\*)/g);

    // We need a cumulative index for smooth global animation across parts
    let charGlobalIndex = 0;

    return (
        <span className="whitespace-pre-wrap font-medium">
            {parts.map((part, partIndex) => {
                const isBold = part.startsWith('**') && part.endsWith('**');
                const content = isBold ? part.slice(2, -2) : part;
                const chars = Array.from(content.replace(/\\n/g, '\n'));

                return chars.map((char, i) => {
                    const delay = charGlobalIndex * 0.010; // Faster animation
                    charGlobalIndex++;

                    return (
                        <motion.span
                            key={`${partIndex}-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                                duration: 0.1,
                                delay: delay,
                                ease: "linear"
                            }}
                            className={isBold ? "font-extrabold text-yellow-300 drop-shadow-md" : ""}
                        >
                            {char}
                        </motion.span>
                    );
                });
            })}
        </span>
    );
};

const TutorChatComponent = (
    { language, grade = 3, curriculum = 'ib-pyp', studentName, tutor = 'lina', initialTask, onSendToBoard, onDrawDivisionStep, onDrawGeometry, onDrawFraction, onDrawFractionEquation, onDrawDataPlot, onDrawVerticalOp, onDrawBase10Blocks, onDrawDecomposition, onDrawAlgebra, onDrawCoordinateGrid, onDrawMultiplicationGroups, onTriggerCelebration, divisionStyle, onShowDivisionSelector, onDrawText, onDrawImage, masteryMode, isDemo, onExerciseComplete, onPersistProgress, onExerciseError, onSetupDragAndDrop, onDrawProportionTable, onDrawConcreteFractions, onDrawConcreteMath }: TutorChatProps,
    ref: React.ForwardedRef<TutorChatRef>
) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastSendRef = useRef(0);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [supportsSpeech, setSupportsSpeech] = useState(false);
    const recognitionRef = useRef<any>(null);
    const internalAnalyzeTextRef = useRef<(text: string, isSystemHidden?: boolean) => Promise<void>>(() => Promise.resolve());

    // VISUAL PERSISTENCE STATE
    const lastVisualState = useRef<{ type: string, data: any } | null>(null);

    // --- GAME STATE ---
    const gamification = useGamification();
    const [showShop, setShowShop] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationType, setCelebrationType] = useState<'correct' | 'streak' | 'complete' | 'levelUp'>('correct');

    // Check if PetContext is available
    const petContext = usePetContext();
    const hasPet = petContext?.hasPet; // Safe access

    const [avatarState, setAvatarState] = useState<'idle' | 'thinking' | 'speaking'>('idle');

    // Demo: sincronizar lipsync con eventos de voz del tour (Lina/Rachelle hablan)
    useEffect(() => {
        if (!isDemo) return;
        const onVoice = (e: CustomEvent<{ voice?: string }>) => {
            const v = e.detail?.voice;
            if (v === 'lina' || v === 'rachelle') setIsSpeaking(true);
        };
        const onEnd = () => setIsSpeaking(false);
        window.addEventListener('nova-demo-voice', onVoice as EventListener);
        window.addEventListener('nova-demo-voice-end', onEnd);
        return () => {
            window.removeEventListener('nova-demo-voice', onVoice as EventListener);
            window.removeEventListener('nova-demo-voice-end', onEnd);
        };
    }, [isDemo]);

    // Microphone: Web Speech API for "continuar" / voice commands without switching to chat
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'es' ? 'es-ES' : 'en-US';
        recognitionRef.current = recognition;
        recognition.onresult = (event: any) => {
            const transcript = (event.results?.[0]?.[0]?.transcript ?? '').trim();
            if (transcript) internalAnalyzeTextRef.current(transcript);
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        setSupportsSpeech(true);
        return () => {
            try { recognitionRef.current?.abort?.(); } catch (_) { }
            recognitionRef.current = null;
        };
    }, [language]);

    const toggleListening = () => {
        if (isListening) {
            try { recognitionRef.current?.stop?.(); } catch (_) { }
            setIsListening(false);
        } else if (!isThinking && recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.warn('Speech recognition start failed', e);
                setIsListening(false);
            }
        }
    };

    // --- STATE GUARDIANS ---
    const isGuidedMode = useRef(false);
    const currentProblemSteps = useRef<any[]>([]); // Current step-by-step plan
    const currentStepIndex = useRef(0);
    const originalOperands = useRef<any>({});
    const pendingDivisionProblem = useRef<{ num1: number, num2: number } | null>(null);

    const toggleExplanation = (index: number) => {
        setExpandedExplanations(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // 🔊 TEXT TO SPEECH – Solo voz de Lina (Azure/ElevenLabs); sin fallback a otra voz
    const playAudio = async (text: string) => {
        if (!text) return;
        if (isDemo) {
            console.log("🤐 Silent mode: skipping tutor audio during demo");
            return;
        }
        try {
            setIsSpeaking(true);
            // EdgeTTS now handles playback directly
            await generateSpeech(text, tutor === 'lina' ? 'lina' : 'rachelle');
            setIsSpeaking(false);
        } catch (e) {
            console.error("Audio generation error", e);
            setIsSpeaking(false);
        }
    };

    // Reproducir MP3 directo (p. ej. /audio/lina/wp_mitad_pregunta.mp3) para que la tutora siempre pregunte en voz
    const playAudioFromUrl = async (url: string) => {
        if (!url) return;
        if (isDemo) return;
        try {
            setIsSpeaking(true);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = () => setIsSpeaking(false);
            audio.onerror = () => setIsSpeaking(false);
            await audio.play();
        } catch (e) {
            console.warn("Play MP3 failed, falling back to TTS", e);
            setIsSpeaking(false);
        }
    };

    // Asegurar que cuando el mensaje es una pregunta, el niño siempre oiga la pregunta real en voz (no solo en chat)
    const getEffectiveSpeech = (content: string, speechText?: string | null): string => {
        const isQuestion = /\?/.test(content);
        const hasShortSpeech = speechText && speechText.length > 0 && speechText.length <= 350;
        if (hasShortSpeech) return speechText;
        // Si es pregunta y no tenemos speech corto, usar el texto del mensaje (sin markdown) para leer la pregunta en voz
        if (isQuestion && content) {
            const stripped = content.replace(/\*\*/g, '').replace(/\\n/g, ' ').trim();
            if (stripped.length > 0 && stripped.length <= 400) return stripped;
        }
        if (isQuestion)
            return language === 'es'
                ? '¿Qué piensas? Dime tu respuesta o di continuar.'
                : 'What do you think? Tell me your answer or say continue.';
        return content;
    };

    const internalStopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsSpeaking(false);
        }
    };

    const addMessage = async (
        role: 'nova' | 'user',
        content: string,
        detailedExplanation?: string,
        speechText?: string | null,
        type: 'text' | 'image' = 'text',
        visualState?: any,
        options?: { skipAudio?: boolean }
    ) => {
        const timestamp = Date.now();
        const msg: Message = { role, content, type, timestamp, detailedExplanation, visualState };
        setMessages(prev => [...prev, msg]);

        if (role === 'nova' && type === 'text' && !options?.skipAudio) {
            const toSpeak = getEffectiveSpeech(content, speechText ?? undefined);
            await playAudio(toSpeak);
        }
    };

    // 💡 SOCRATIC STEP PROCESSOR
    const processAIResponse = async (response: any) => {
        if (!response) return;

        // 🛡️ SAFETY VALIDATOR: Ensure response is not malformed
        try {
            // Handle potential stringified JSON (common AI error)
            if (typeof response === 'string') {
                try {
                    response = JSON.parse(response);
                } catch (e) {
                    console.warn("Raw string response received:", response);
                    await addMessage('nova', response); // Just show the text if parsing fails
                    return;
                }
            }

            // If it's a direct response (no steps)
            if (response.message && !response.steps) {
                await addMessage('nova', response.message);
                return;
            }

            // Normalization: If AI forgot to wrap in "steps" array
            if (Array.isArray(response)) {
                response = { steps: response };
            } else if (response && typeof response === 'object' && !response.steps) {
                // Look for any array in the object that might be the steps
                const possibleArrayKey = Object.keys(response).find(k => Array.isArray(response[k]));
                if (possibleArrayKey) {
                    response.steps = response[possibleArrayKey];
                } else if (response.visualType || response.text || response.visualData || response.speech) {
                    // It's a flat object representing a single step
                    response = { steps: [response] };
                } else if (response.message) {
                    // It has a message but no steps
                    response.steps = [{ text: response.message, visualType: 'none' }];
                }
            }
        } catch (e) {
            console.error("Critical AI Response Error:", e);
            await addMessage('nova', language === 'es' ? "¡Ups! Mis notas se desordenaron. ¿Me repites eso?" : "Oops! My notes got messy. Can you say that again?");
            return;
        }

        // If it defines steps, we set up guided mode

        if (response.steps && response.steps.length > 0) {
            isGuidedMode.current = true;
            currentProblemSteps.current = response.steps;
            currentStepIndex.current = 0;

            const step = response.steps[0];
            let skipStepMessage = false;

            // Sync Visual State
            const visualDataPayload = step.visualData || {
                operand1: step.operand1, operand2: step.operand2, operator: step.operator, result: step.result, carry: step.carry, highlight: step.highlight
            };
            lastVisualState.current = { type: step.visualType || 'vertical_op', data: visualDataPayload };

            // DRAW BOARD LOGIC - Restore robustness
            const vType = step.visualType || 'vertical_op';

            // 🥕 DRAG & DROP: Interactive Scene for 1st Grade
            if (vType === 'drag_and_drop' && onSetupDragAndDrop) {
                const bgPrompt = step.visualData?.bgPrompt || "A magical landscape";
                const items = step.visualData?.items || [];
                try {
                    // 1. Generate Background
                    const { generateImage } = await import('../../../services/ai_service');
                    const bgUrl = await generateImage(bgPrompt + ", empty background, scenery", 'vivid');

                    // 2. Generate Items
                    const processedItems = [];
                    for (const item of items) {
                        // Ensure sticker style for items
                        const itemPrompt = (item.prompt || "object") + ", sticker style, white background, isolated, cute 3D render";
                        const itemUrl = await generateImage(itemPrompt, 'vivid');
                        if (itemUrl) {
                            processedItems.push({ id: item.id || 'item', imgUrl: itemUrl, count: item.count || 1 });
                        }
                    }

                    if (bgUrl && processedItems.length > 0) {
                        onSetupDragAndDrop(bgUrl, processedItems);
                    }
                } catch (ddErr) {
                    console.warn("Drag & Drop setup failed", ddErr);
                }
            }

            // 🎨 STORY IMAGE / GENERATED IMAGE: Generate AI image and draw on whiteboard
            if ((vType === 'story_image' || vType === 'generated_image') && onDrawImage) {
                const imagePrompt = step.visualData?.imagePrompt || step.visualData?.prompt || '';
                if (imagePrompt) {
                    try {
                        const { generateImage } = await import('../../../services/ai_service');
                        const imageUrl = await generateImage(imagePrompt, 'vivid');
                        if (imageUrl) {
                            onDrawImage(imageUrl);
                        }
                    } catch (imgErr) {
                        console.warn('🎨 Story image generation failed:', imgErr);
                    }
                }
            } else if (vType === 'fraction' && onDrawFraction) {
                const v = step.visualData || {};
                if (typeof v === 'object' && (v.type === 'lcm_list' || v.type === 'mcm_intro')) {
                    onDrawFraction(v);
                } else {
                    const num = v.numerator ?? v.num ?? 1;
                    const den = v.denominator ?? v.den ?? 1;
                    const type = v.type || 'bar';
                    onDrawFraction(num, den, type);
                }
            } else if ((vType === 'fraction_equation' || vType === 'fraction_op') && onDrawFractionEquation) {
                onDrawFractionEquation(step.visualData);
            } else if ((vType === 'division' || step.operator === '÷' || vType === 'long_division') && onDrawDivisionStep && step.visualData) {
                const v = step.visualData;
                const effectiveStyle = (divisionStyle === 'latin' || divisionStyle === 'us') ? divisionStyle : (v.divisionStyle || 'us');

                if (onShowDivisionSelector && v.isNew) {
                    onShowDivisionSelector();
                }

                onDrawDivisionStep(
                    v.dividend || step.operand1 || "0",
                    v.divisor || step.operand2 || "1",
                    v.quotient || step.result || "",
                    v.product,
                    v.remainder,
                    v.highlight || step.highlight,
                    effectiveStyle,
                    v.highlightDigit?.col,
                    { ...v, divisionStyle: effectiveStyle, highlight: v.highlight || step.highlight }
                );
            } else if (vType === 'fraction' && onDrawFraction) {
                onDrawFraction(step.visualData, undefined, step.visualData.type);
            } else if (vType === 'geometry_interactive' && onDrawGeometry) {
                // Siempre activar el componente interactivo de geometría
                onDrawGeometry(step.visualData.shape, step.visualData);
            } else if (vType === 'geometry' && onDrawGeometry) {
                onDrawGeometry(step.visualData.shape, step.visualData);
            } else if (vType === 'algebra_op' && onDrawAlgebra) {
                onDrawAlgebra(step.visualData.equation || "", step.visualData.variable || "x", step.visualData.phase || "algebra_start", step.visualData.highlight);
            } else if (vType === 'coordinate_grid' && onDrawCoordinateGrid) {
                onDrawCoordinateGrid(step.visualData.points || [], step.visualData.currentPoint, step.visualData.phase);
            } else if (vType === 'proportion_table' && onDrawProportionTable) {
                const v = step.visualData;
                onDrawProportionTable(
                    String(v.a1 || ""),
                    String(v.b1 || ""),
                    String(v.a2 || ""),
                    String(v.b2 || ""),
                    v.unitA || "A",
                    v.unitB || "B",
                    v.highlight
                );
            } else if (vType === 'base10_blocks' && onDrawBase10Blocks) {
                onDrawBase10Blocks(step.visualData);
            } else if (vType === 'decomposition' && onDrawDecomposition) {
                const v = step.visualData;
                onDrawDecomposition(v.n1, v.f1, v.n2, v.f2);
            } else if (vType === 'concrete_fractions' && onDrawConcreteFractions) {
                onDrawConcreteFractions(step.visualData);
            } else if (vType === 'concrete_math' && onDrawConcreteMath) {
                const v = step.visualData;
                onDrawConcreteMath(v.n1 || 0, v.n2 || 0, v.operator || '+', v.itemEmoji);
            } else if (vType === 'text_only' && onDrawText) {
                const rawText = (step.visualData?.text ?? step.text ?? (typeof step.message === 'object' ? step.message?.[language] : step.message) ?? '').toString();
                const normalizedText = normalizePastedFractions(rawText).trim();
                const rawHls = step.visualData?.highlights || [];
                const formattedHls = rawHls.map((h: any) =>
                    typeof h === 'string' ? { text: h, color: 'gold' } : h
                );
                if (normalizedText) onDrawText(normalizedText, formattedHls);
            } else if (onDrawVerticalOp) {
                // Handles addition, subtraction, multiplication
                const v = step.visualData || {};
                // PASS THROUGH EVERYTHING
                const op1 = v.operands || v.operand1 || step.operand1 || "0";
                const op2 = v.operand2 || step.operand2 || "";
                const resultToUse = v.result || step.result || "";
                const operatorToUse = v.operator || step.operator || "+";

                onDrawVerticalOp(
                    op1,
                    op2,
                    resultToUse,
                    operatorToUse,
                    v.carry || step.carry || "",
                    v.highlight || step.highlight || "",
                    v.borrows || step.borrows,
                    v.helpers || step.helpers,
                    v
                );
            }

            if (!skipStepMessage) {
                let stepContent = typeof step.text === 'object' ? step.text[language] : (step.text || (typeof step.message === 'object' ? step.message[language] : step.message));
                if (vType === 'text_only' && typeof stepContent === 'string') {
                    stepContent = normalizePastedFractions(stepContent);
                }

                let stepSpeech = typeof step.speech === 'object' ? step.speech[language] : (step.speech || (typeof step.message === 'object' ? step.message[language] : step.message));

                if (!stepContent || !String(stepContent).trim()) {
                    stepContent = language === 'es'
                        ? '🧩 **Mira el tablero.** ¿Qué datos te dan? ¿Qué te piden que calcules? Vamos paso a paso.'
                        : '🧩 **Look at the board.** What information do they give you? What do they ask you to find? Let\'s go step by step.';
                    stepSpeech = language === 'es' ? 'Mira el tablero. ¿Qué datos te dan? ¿Qué te piden que calcules? Vamos paso a paso.' : 'Look at the board. What information do they give you? What do they ask you to find? Let\'s go step by step.';
                }

                const audioPath = (step as any).audioPath;
                const detailedExpl = typeof step.detailedExplanation === 'object' ? step.detailedExplanation[language] : (step.detailedExplanation || "");

                if (audioPath) {
                    await playAudioFromUrl(audioPath);
                    await addMessage('nova', stepContent, detailedExpl, null, 'text', visualDataPayload, { skipAudio: true });
                } else {
                    await addMessage('nova', String(stepContent), detailedExpl, stepSpeech ? String(stepSpeech) : null, 'text', visualDataPayload);
                }
            }

            // Auto-guardar en cuaderno (máx. 5 por operación): inferir tipo y notificar + persistir progreso
            if (step.visualData?.highlight === 'done') {
                const vType = step.visualType;
                const op = step.visualData?.operator;
                let operationType = 'other';
                if (vType === 'division') operationType = 'division';
                else if (vType === 'fraction' || vType === 'fraction_equation' || vType === 'fraction_op') operationType = 'fraction';
                else if (vType === 'vertical_op' && op === '×') operationType = 'multiplication';
                else if (vType === 'vertical_op' && op === '+') operationType = 'addition';
                else if (vType === 'vertical_op' && op === '-') operationType = 'subtraction';
                else if (vType === 'geometry' || vType === 'geometry_interactive') operationType = 'geometry';
                else if (vType === 'algebra_op') operationType = 'algebra';
                else if (vType === 'coordinate_grid') operationType = 'coordinates';

                if (operationType !== 'other') {
                    onExerciseComplete?.(operationType);
                    onPersistProgress?.(operationType);
                }
            } else {
                // Adaptive difficulty: If the AI gave a corrective hint or flagged an error, report it
                const expl = step.detailedExplanation;
                const esExpl = typeof expl === 'object' ? expl?.es : expl;
                const enExpl = typeof expl === 'object' ? expl?.en : expl;

                const stepTextContent = typeof step.text === 'object' ? step.text[language] : (step.text || (typeof step.message === 'object' ? step.message[language] : step.message));

                const isError =
                    (typeof esExpl === 'string' && esExpl.toLowerCase().includes('correctiva')) ||
                    (typeof enExpl === 'string' && enExpl.toLowerCase().includes('corrective')) ||
                    (typeof stepTextContent === 'string' && /(Hmm, no|Casi|no exactamente|wrong|incorrect)/i.test(stepTextContent));

                if (isError) {
                    const vType = step.visualType || lastVisualState.current?.type;
                    const op = step.visualData?.operator || lastVisualState.current?.data?.operator;
                    let operationType = 'other';
                    if (vType === 'division') operationType = 'division';
                    else if (vType === 'fraction' || vType === 'fraction_equation' || vType === 'fraction_op') operationType = 'fraction';
                    else if (vType === 'vertical_op' && op === '×') operationType = 'multiplication';
                    else if (vType === 'vertical_op' && op === '+') operationType = 'addition';
                    else if (vType === 'vertical_op' && op === '-') operationType = 'subtraction';
                    else if (vType === 'geometry' || vType === 'geometry_interactive') operationType = 'geometry';
                    else if (vType === 'algebra_op') operationType = 'algebra';
                    else if (vType === 'coordinate_grid') operationType = 'coordinates';

                    if (operationType !== 'other') {
                        onExerciseError?.(operationType);
                    }
                }
            }
        }
    };

    const internalAnalyzeText = async (text: string, isSystemHidden = false) => {
        // 💎 INTERCEPT SYSTEM STYLE CHANGE: Handle locally without calling AI to avoid context reset
        if (text.includes('[SYSTEM: Cambiar estilo a ') || text.includes('[SYSTEM: Change style to ')) {
            const newStyle: 'latin' | 'us' = text.toLowerCase().includes('latin') ? 'latin' : 'us';
            const confirmMsg = language === 'es'
                ? `¡Entendido! Cambiando a estilo **${newStyle === 'latin' ? 'tradicional' : 'americano'}**...`
                : `Got it! Switching to **${newStyle === 'latin' ? 'traditional' : 'american'}** style...`;

            // 1. Update visual context immediately
            let lastState: any = null;
            for (let i = messages.length - 1; i >= 0; i--) {
                const m = messages[i] as any;
                if (m.visualState) {
                    lastState = m.visualState;
                    break;
                }
            }

            // 2. Try to refresh the tutor step with the NEW style
            // We pass an empty string to trigger "persistence" or "intro" logic which simply restates the current step
            const algoRef = AlgorithmicTutor.generateResponse("", messages, language, newStyle, studentName, grade);

            if (algoRef) {
                // If the tutor generated a valid step, show it!
                await processAIResponse(algoRef);
            } else {
                // Fallback: just confirm
                const visualData = lastState ? { ...lastState, divisionStyle: newStyle } : { divisionStyle: newStyle };
                await addMessage('nova', confirmMsg, "", null, 'text', visualData);
            }
            return;
        }

        // Normalizar fracciones mal leídas (3443→3/4, 2552→2/5) para que el word problem parser las reconozca
        const normalizedText = normalizePastedFractions(text.trim());
        text = normalizedText;

        // 🧩 [BLOQUE ELIMINADO]: No redirigir problemas verbales. El usuario quiere que se resuelvan aquí mismo.

        // 🛡️ PRIORITY CHECK: If we're in guided mode, let AlgorithmicTutor handle it FIRST
        if (isGuidedMode.current) {
            console.log("📍 Guided Mode Active - Checking if this is an answer...");

            // Add user message to history BEFORE checking with AlgorithmicTutor
            const tempHistory = [
                ...messages,
                { role: 'user' as const, content: text }
            ];

            const algoResponse = AlgorithmicTutor.generateResponse(text, tempHistory, language, divisionStyle || undefined, studentName, grade);
            if (algoResponse) {
                console.log("✅ AlgorithmicTutor handled the answer:", algoResponse);
                // Add the user message to the actual messages
                if (!isSystemHidden) {
                    setMessages(prev => [...prev, { role: 'user', content: text, type: 'text', timestamp: Date.now() }]);
                }
                await processAIResponse(algoResponse);
                return;
            }
            // 🧩 FALLBACK "no sé" / respuestas no reconocidas: si estamos en problema verbal (wpPhase en estado), intentar WordProblemTutor
            let lastVisualState: any = null;
            for (let i = tempHistory.length - 1; i >= 0; i--) {
                const m = tempHistory[i] as { role?: string; visualState?: any };
                if (m.role === 'assistant' || m.role === 'nova') {
                    lastVisualState = m.visualState;
                    break;
                }
            }
            if (lastVisualState?.wpPhase && (lastVisualState?.wpParsed || lastVisualState?.text)) {
                const prob = lastVisualState.wpParsed || {
                    type: 'wordProblem' as const,
                    text: lastVisualState.text || '',
                    highlights: Array.isArray(lastVisualState.highlights) ? lastVisualState.highlights : [],
                };
                const wpResponse = WordProblemTutor.handleWordProblem(text, prob, language, tempHistory, studentName);
                if (wpResponse?.steps?.length) {
                    console.log("🧩 WordProblemTutor handled (e.g. 'no sé') in guided mode:", wpResponse);
                    if (!isSystemHidden) {
                        setMessages(prev => [...prev, { role: 'user', content: text, type: 'text', timestamp: Date.now() }]);
                    }
                    isGuidedMode.current = true;
                    currentProblemSteps.current = wpResponse.steps as any;
                    currentStepIndex.current = 0;
                    await processAIResponse(wpResponse);
                    return;
                }
            }
            // If AlgorithmicTutor returns null and no word-problem state, fall through to reset
            console.log("⚠️ AlgorithmicTutor returned null - treating as new problem");
        }

        // RESET GUARDIAN (only if not handled above)
        console.log("🎆 NEW PROBLEM - Resetting guardian");
        originalOperands.current = {};
        isGuidedMode.current = false;
        currentProblemSteps.current = [];
        currentStepIndex.current = 0;

        // Detect Grade and Complexity
        const gradeNum = typeof grade === 'number' ? grade : parseInt(String(grade).replace(/\D/g, '') || '3');

        // Relaxed complexity check: Only bypass if it's REALLY long and doesn't look like a direct math question
        const mathKeywords = /sumar|restar|multiplicar|dividir|add|subtract|multiply|divide|total|más|mas|vínculos|vínculo/i;
        const isMathExpression = /[\d\/\+\-\*÷x\(\)=]/.test(text) || (mathKeywords.test(text) && /\d+/.test(text));
        const isComplexText = text.length > 60 && /[a-zA-ZáéíóúñÁÉÍÓÚ]/.test(text) && !text.includes('=') && !mathKeywords.test(text);

        const shouldBypassAlgo = isComplexText && !isMathExpression;

        if (!shouldBypassAlgo) {
            const algoRef = AlgorithmicTutor.generateResponse(text, messages, language, divisionStyle || undefined, studentName, grade, masteryMode);
            if (algoRef) {
                console.log("🚀 Specialized Math Logic Intercepted:", algoRef);
                isGuidedMode.current = true;
                currentProblemSteps.current = algoRef.steps as any;
                currentStepIndex.current = 0;
                if (!isSystemHidden) {
                    setMessages(prev => [...prev, { role: 'user', content: text.trim(), type: 'text', timestamp: Date.now() }]);
                }
                await processAIResponse(algoRef);
                return;
            }
        }

        const steps = generateStepsForProblem(text);
        const problem = parseMathProblem(text);

        // División: Invitamos al niño a elegir su estilo favorito (Americano o Colombiano/Tradicional)
        if (problem && !isComplexText && (problem as any).operator === '÷') {
            if (onShowDivisionSelector) onShowDivisionSelector();
        }

        if (steps && steps.length > 0) {
            isGuidedMode.current = true;
            currentProblemSteps.current = steps;
            currentStepIndex.current = 0;
            const step = steps[0];

            // Sync Visual State
            const visualDataPayload = step.visualData || { operand1: step.operand1, operand2: step.operand2, operator: step.operator, result: step.result, carry: step.carry, highlight: step.highlight };
            lastVisualState.current = { type: step.visualType || 'vertical_op', data: visualDataPayload };

            // Immediate Draw
            if (step.visualType === 'fraction_bar' && onDrawFraction) {
                onDrawFraction(step.visualData?.numerator || 1, step.visualData?.denominator || 2, 'bar');
            } else if (onDrawVerticalOp) {
                const v = step.visualData || {};
                onDrawVerticalOp(
                    v.operands || step.operand1,
                    step.operand2,
                    step.result,
                    step.operator,
                    step.carry,
                    step.highlight,
                    v.borrows,
                    v.helpers,
                    v
                );
            }

            await processAIResponse({ steps: steps });
            return;
        }

        await handleAIcall(text, false, undefined, isSystemHidden, true);
    };

    const handleAIcall = async (text: string, isMathFallback = false, imgBase64?: string, isHidden = false, bypassMathCheck = false) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey && (text.length > 50 || imgBase64)) {
            alert("Falta la API Key de Gemini. Configure VITE_GEMINI_API_KEY en .env");
            setIsThinking(false);
            return;
        }

        const isMathStory = (text.length > 50 && (
            text.toLowerCase().includes('perimetro') ||
            text.toLowerCase().includes('área') ||
            text.toLowerCase().includes('fracci') ||
            text.toLowerCase().includes('mcm') ||
            text.toLowerCase().includes('lcm') ||
            text.toLowerCase().includes('divid') ||
            text.toLowerCase().includes('repart') ||
            text.toLowerCase().includes('multiplic')
        ));
        // 🛡️ MATH GUARDIAN: Check if this is a math answer or a new operation
        if (!bypassMathCheck && !imgBase64 && (text.length < 150 || isMathStory || isGuidedMode.current)) {
            const algoRef = AlgorithmicTutor.generateResponse(text, messages, language, divisionStyle || undefined, studentName, grade, masteryMode);
            if (algoRef) {
                console.log("🚀 Algorithmic Tutor Intercepted:", algoRef);
                isGuidedMode.current = true;
                await processAIResponse(algoRef);
                setIsThinking(false);
                return;
            }

            // Only intercept as a NEW problem if we aren't already in one
            if (!isGuidedMode.current) {
                const potentialMath = parseMathProblem(text);
                if (potentialMath) {
                    console.log("🛡️ Intercepted Math Problem in generic flow:", text);
                    await internalAnalyzeText(text, isHidden);
                    return;
                }
            }
        }

        setIsThinking(true);
        const shouldHide = isHidden || text.trim().startsWith('[SYSTEM:');
        const newMsg: Message = { role: 'user', content: text, type: imgBase64 ? 'image' : 'text', timestamp: Date.now(), isHidden: shouldHide };
        if (!shouldHide) setMessages(prev => [...prev, newMsg]);

        try {
            const history = messages.map(m => ({
                role: (m.role === 'nova' ? 'assistant' : 'user') as 'user' | 'assistant',
                content: m.type === 'image' ? (language === 'es' ? '[Imagen subida por usuario]' : '[User uploaded image]') : m.content
            }));

            if (lastVisualState.current && lastVisualState.current.data) {
                // INJECT STATE AS JSON SO ALGORITHMIC TUTOR CAN RECOVER IT
                // The regex in AlgorithmicTutor looks for { ... } and expects steps[0].visualData
                const recoveryState = {
                    steps: [{
                        visualData: lastVisualState.current.data
                    }]
                };
                history.push({
                    role: 'assistant',
                    content: `[SYSTEM_STATE_RECOVERY] ${JSON.stringify(recoveryState)}`
                });
            }

            // Only add guided mode context if not new
            if (isGuidedMode.current && currentProblemSteps.current.length > 0) {
                const step = currentProblemSteps.current[currentStepIndex.current];
                if (step) {
                    history.push({
                        role: 'assistant',
                        content: `[GUIDED_MODE_ACTIVE] Step ${currentStepIndex.current}. Instruction: "${step.text}". Visual: ${JSON.stringify(step.visualData || {})}`
                    });
                }
            }

            if (masteryMode) {
                history.push({
                    role: 'assistant',
                    content: language === 'es'
                        ? `[SISTEMA: MODO_MAESTRO_ACTIVO] El estudiante ha elegido resolver esto SIN PISTAS para ganar DOBLE RECOMPENSA. 
                           NUNCA des pasos directos o soluciones. Solo preguntas socráticas desafiantes.`
                        : `[SYSTEM: MASTERY_MODE_ACTIVE] The student has chosen to solve this WITHOUT HINTS for DOUBLE REWARDS. 
                           NEVER give direct steps. Only challenging socratic questions.`
                });
            }

            const response = await generateSocraticSteps(text, grade, language, [curriculum || 'ib-pyp'], history, imgBase64);
            await processAIResponse(response);

            // 🛡️ FALLBACK: Si la IA no devolvió pasos ni mensaje (ej. problema de fracciones mal parseado), la profe no se queda muda
            const hasContent = response?.message || (response?.steps && response.steps.length > 0) || (response?.visualType);
            if (!hasContent) {
                if (lastVisualState.current?.type === 'vertical_op' || lastVisualState.current?.type === 'division') {
                    addMessage('nova', language === 'es'
                        ? '¡Sigamos adelante! 🚀 Mira la operación en la pizarra, ¿cuál crees que es el siguiente paso?'
                        : 'Let’s keep going! 🚀 Look at the operation on the board, what do you think is the next step?');
                } else {
                    addMessage('nova', language === 'es'
                        ? 'Hmmm... la pizarra está un poco confusa. 🤔 ¿Puedes darme más detalles o escribir un ejercicio para resolver juntos?'
                        : 'Hmmm... the board is a bit confusing. 🤔 Can you give me more details or write an exercise to solve together?');
                }
            }

            // --- REWARD LOGIC ---
            // Detect if the tutor is celebrating a correct answer to give points/coins
            // We look for common celebration emojis or keywords in the response
            const responseMsg = response?.message || (response?.steps && response.steps[response.steps.length - 1]?.text) || "";
            const isCelebration = /🎉|Correcto|Excelente|Perfecto|Muy bien|Correct|Congratulations|¡Woooow!|¡Increíble!|¡BOOM!|¡Genial!|¡Fantástico!/i.test(responseMsg);

            if (isCelebration) {
                // Award points via hook
                gamification.recordCorrectAnswer();
            }
        } catch (error: any) {
            console.error("AI Call Error:", error);
            // 🛡️ FALLBACK: Si Gemini falla (sin API key o red), intentar solo motor algorítmico
            const isGeminiUnavailable = !error?.message || /gemini|clave|api key|VITE_GOOGLE|unavailable|fetch failed|network|timeout|conexión/i.test(String(error?.message || ''));
            if (isGeminiUnavailable) {
                const algoRef = AlgorithmicTutor.generateResponse(text, messages, language, divisionStyle || undefined, studentName, grade);
                if (algoRef) {
                    isGuidedMode.current = true;
                    await processAIResponse(algoRef);
                    return;
                }
                const problem = parseMathProblem(text);
                if (problem) {
                    const steps = generateStepsForProblem(text);
                    if (steps && steps.length > 0) {
                        isGuidedMode.current = true;
                        currentProblemSteps.current = steps;
                        currentStepIndex.current = 0;
                        await processAIResponse({ steps });
                        return;
                    }
                }
            }
            const errorMsg = isGeminiUnavailable
                ? (language === 'es'
                    ? (String(error?.message || '').includes('429')
                        ? "🧠 ¡Ups! He trabajado mucho y necesito un pequeño descanso. Pero mientras tanto, ¡probemos con una operación! Escribe algo como **25 + 18** o **48 ÷ 6** y la resolvemos juntos 💪"
                        : "🧠 ¡Ups! Mi cerebrito se desconectó un momentito. Pero no te preocupes, ¡sigo aquí! Prueba con una operación como **25 + 18** o **48 ÷ 6** y la resolvemos paso a paso 😊")
                    : (String(error?.message || '').includes('429')
                        ? "🧠 Oops! I've been working hard and need a tiny break. But meanwhile, let's try an operation! Type something like **25 + 18** or **48 ÷ 6** and we'll solve it together 💪"
                        : "🧠 Oops! My brain disconnected for a moment. But don't worry, I'm still here! Try an operation like **25 + 18** or **48 ÷ 6** and we'll solve it step by step 😊"))
                : (language === 'es'
                    ? "🤔 Hmm, no entendí bien esa pregunta. ¿Me la puedes escribir de otra forma? ¡O prueba con un ejercicio de mates! 📝"
                    : "🤔 Hmm, I didn't quite understand that question. Can you write it differently? Or try a math exercise! 📝");
            addMessage('nova', errorMsg);
        } finally {
            setIsThinking(false);
        }
    };
    internalAnalyzeTextRef.current = internalAnalyzeText;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            await addMessage('user', language === 'es' ? "📸 [Imagen de mi cuaderno]" : "📸 [Image of my notebook]");
            await handleAIcall(language === 'es' ? "Ayúdame con el ejercicio de esta foto" : "Help me with the exercise in this photo", true, base64);
        };
        reader.readAsDataURL(file);
    };

    const handleMagicVision = () => {
        const prompt = language === 'es'
            ? "[SYSTEM: USER PRESSED THE 'MAGIC VISION' BUTTON. The student is STUCK. Please generating a 'visualType': 'generated_image'.]"
            : "[SYSTEM: USER PRESSED THE 'MAGIC VISION' BUTTON. The student is STUCK. Please generating a 'visualType': 'generated_image'.]";
        handleAIcall(prompt);
    };

    const internalStartSession = async (taskTitle: string) => {
        const rawName = studentName || (language === 'es' ? "Campeón" : "Champion");
        const firstName = rawName.split(' ')[0];
        let greeting = "";

        const hasSeenIntro = localStorage.getItem('nova_lina_intro_seen');
        const isFirstTime = !hasSeenIntro;

        // Check for Active Mission Context
        let missionContext: any = null;
        try {
            const missionParams = localStorage.getItem('nova_mission_params');
            if (missionParams) {
                missionContext = JSON.parse(missionParams);
                console.log("🎯 Mission Context Detected in TutorChat:", missionContext);
            }
        } catch (e) {
            console.error("Error parsing mission params in TutorChat", e);
        }

        // Misiones de operaciones matemáticas (MATH): mismo script que al hacer clic en Profe de mate y escribir un ejercicio.
        const isMathOperationMission = missionContext?.subject === 'MATH';

        // Si hay misión activa que NO es MATH, usar saludos específicos de misión
        if (missionContext && !isMathOperationMission) {
            console.log("🛠️ Processing Mission Context in TutorChat:", missionContext);
            const missionTitle = missionContext.missionTitle || missionContext.topic || missionContext.title || (language === 'es' ? "tu misión" : "your mission");
            const mode = missionContext.mode || 'practice';

            if (isFirstTime) {
                const missionIntroEs = mode === 'exam_review' ? '¡Es preparación para examen! 📚 Vamos a repasar todo lo importante.' : mode === 'remedial' ? '¡Vamos a reforzar este tema juntos! 💪' : '¡En un momento te dejo el primer ejercicio en la pizarra. Escribe o di **continuar** activando el micrófono 🎤 y empezamos! 📝';
                const missionIntroEn = mode === 'exam_review' ? "It's exam prep time! 📚 Let's review everything important." : mode === 'remedial' ? "Let's strengthen this topic together! 💪" : "In a moment I'll put the first exercise on the board. Write or say **continue** by activating the microphone 🎤 and we'll solve it together! 📝";
                const titleBold = '**' + missionTitle + '**';
                greeting = tutor === 'lina'
                    ? '¡Hola ' + firstName + '! 👋 Soy la Profe Lina 🇨🇴\n\n¡Me encantan las mates! 💜 Veo que tienes una misión activa: ' + titleBold + '.\n\n' + missionIntroEs
                    : 'Hi ' + firstName + '! 👋 I\'m Ms. Rachelle! 💙\n\nI see you have an active mission: ' + titleBold + '.\n\n' + missionIntroEn;
                localStorage.setItem('nova_lina_intro_seen', 'true');
            } else {
                const missionContEs = mode === 'exam_review' ? '¡A prepararnos para ese examen! 🎯' : '¡Te dejo el ejercicio en la pizarra y vamos! 💪';
                const missionContEn = mode === 'exam_review' ? "Let's prep for that exam! 🎯" : "I'll put the exercise on the board and let's go! 💪";
                const titleBold = '**' + missionTitle + '**';
                greeting = tutor === 'lina'
                    ? '¡Hola ' + firstName + '! 👋 Continuemos con tu misión: ' + titleBold + '. ' + missionContEs
                    : 'Hi ' + firstName + '! 👋 Let\'s continue with your mission: ' + titleBold + '. ' + missionContEn;
            }
        }
        // Misiones MATH: saludo al estudiante; audio aleatorio (MP3) para no sonar robotizado.
        if (isMathOperationMission) {
            const mathIntroLina = '¡Hola ' + firstName + '! 👋 Soy la Profe Lina 🇨🇴\n\n¡Me encantan las mates! 💜 En un momento te dejo el ejercicio en la pizarra. Escribe o di **continuar** activando el micrófono 🎤 y empezamos paso a paso. ¡Tú puedes! 🎯';
            const mathIntroRachelle = 'Hi ' + firstName + '! 👋 I\'m Ms. Rachelle! 💙\n\nI love math! 💜 In a moment I\'ll put the exercise on the board. Write or say **continue** by activating the microphone 🎤 and we\'ll work through it step by step. You\'ve got this! 🎯';
            greeting = tutor === 'lina' ? mathIntroLina : mathIntroRachelle;
            const speechText = tutor === 'lina' && LINA_GREETING_AUDIO_TEXTS.length > 0
                ? LINA_GREETING_AUDIO_TEXTS[Math.floor(Math.random() * LINA_GREETING_AUDIO_TEXTS.length)]
                : undefined;
            await addMessage('nova', greeting, undefined, speechText);
            return;
        }
        // Mismo script que "Profe de mate" / Sesión Abierta
        // 📖 SPECIAL 1ST GRADE: Story-based greeting with image
        const gradeNum = typeof grade === 'number' ? grade : parseInt(String(grade).replace(/\D/g, '') || '3');
        if (gradeNum <= 1 && (taskTitle.includes("Abierta") || taskTitle.includes("Open"))) {
            const storyGreetings = [
                `¡Hola ${firstName}! 🌟 Soy la Profe Lina, ¡tu cuenta-cuentos de números! 📖✨\n\n¿Sabías que los números son personajes mágicos? 🔢🪄 Cada vez que resolvemos un problema, ¡es como una aventura!\n\nDime un number o escríbelo en la pizarra... y te contaré su historia. 🐰🎈 ¡O di **continuar** y te cuento la primera aventura! 🚀`,
                `¡${firstName}! 🎉 ¡Bienvenido al mundo mágico de los números! ✨\n\nSoy la Profe Lina y hoy te voy a contar historias increíbles donde TÚ eres el héroe 🦸‍♂️🌈\n\n¡Escribe un número en la pizarra o di **continuar** para empezar la aventura! 🚀🎈`,
                `¡Hooola ${firstName}! 👋🌈 ¡Qué alegría verte!\n\nSoy la Profe Lina, ¡y tengo una historia INCREÍBLE que contarte! 📚⭐\n\n¿Estás listo para la aventura? ¡Escribe algo en la pizarra o di **continuar**! 🐰🎉`
            ];
            greeting = storyGreetings[Math.floor(Math.random() * storyGreetings.length)];
            localStorage.setItem('nova_lina_intro_seen', 'true');

            // Generate a welcoming image on the whiteboard for 1st graders
            if (onDrawImage) {
                try {
                    const { generateImage } = await import('../../../services/ai_service');
                    const welcomePrompt = 'A magical colorful classroom with cute cartoon numbers 1 through 10 as friendly characters with faces and arms, a warm female teacher with brown hair smiling, rainbow decorations, stars and sparkles, 3D Pixar style for kids, vibrant and cheerful';
                    const imgUrl = await generateImage(welcomePrompt, 'vivid');
                    if (imgUrl) onDrawImage(imgUrl);
                } catch (e) { console.warn('Welcome image failed', e); }
            }

            const speechText = `¡Hola ${firstName}! Soy la Profe Lina, tu cuenta-cuentos de números. ¡Hoy tenemos aventuras increíbles! ¿Listo?`;
            await addMessage('nova', greeting, undefined, speechText);
            return;
        }
        if (taskTitle.includes("Abierta") || taskTitle.includes("Open")) {
            if (isFirstTime) {
                const abiertaLina = '¡Hola ' + firstName + '! 👋 Soy la Profe Lina 🇨🇴\n\n¡Me ENCANTAN las matemáticas! 💜🔢 Son como pequeños acertijos que podemos resolver juntos.\n\nEscribe cualquier ejercicio en la pizarra o di **continuar** activando el micrófono 🎤, ¡y lo resolvemos paso a pasito! 🎯';
                const abiertaRachelle = 'Hey ' + firstName + '! 👋 I\'m so happy to meet you!\n\nI\'m Ms. Rachelle and I absolutely LOVE math! 💙🔢 Write any problem on the board or say **continue** by activating the microphone 🎤, and let\'s figure it out together! 🎯';
                greeting = tutor === 'lina' ? abiertaLina : abiertaRachelle;
                localStorage.setItem('nova_lina_intro_seen', 'true');
                const greetingSpeech = tutor === 'lina'
                    ? '¡Hola ' + firstName + '! Soy la Profe Lina. Escribe en la pizarra o di continuar activando el micrófono. ¿Listo?'
                    : 'Hey ' + firstName + '! I\'m Ms. Rachelle. Write on the board or say continue by activating the microphone. Let\'s go!';
                await addMessage('nova', greeting, undefined, greetingSpeech);
                return;
            } else {
                const shortGreetings = tutor === 'lina'
                    ? [
                        `¡Woooow, ${firstName}! 👋✨ ¡Qué alegría verte de nuevo! ¿Listo para conquistar los números hoy? 🔢💥`,
                        `¡Esa es la actitud, ${firstName}! 😊 ¡Hoy vamos a resolverlo todo con mucha energía! 🚀💜`,
                        `¡${firstName}! ¡Mi campeón matemático favorito! 🏆✨ ¿Cuál es el reto de hoy? ¡Estoy súper emocionada! 🤩`,
                        `¡Hola, hola, ${firstName}! 👋 ¡Afila ese lápiz mental porque hoy vamos a brillar! ✨🔢 ¡Vamos con toda!`
                    ]
                    : [
                        `Hi ${firstName}! 👋 Ready for math? 🔢`,
                        `Hey ${firstName}! 😊 Let's solve some problems!`,
                        `${firstName}! Great to see you! 💙 What are we working on?`
                    ];
                greeting = shortGreetings[Math.floor(Math.random() * shortGreetings.length)];
            }
        }
        else {
            if (isFirstTime) {
                const taskLina = '¡Hola ' + firstName + '! 👋 Soy la Profe Lina 🇨🇴\n\n¡Me encantan las mates! 💜 Veo que tenemos: "' + taskTitle + '".\n\nEscribe el primer ejercicio en la pizarra o di **continuar** activando el micrófono 🎤. 📝';
                const taskRachelle = 'Hi ' + firstName + '! 👋 I\'m Ms. Rachelle! 💙\n\nI see we have: "' + taskTitle + '".\n\nWrite the first problem on the board or say **continue** by activating the microphone 🎤. 📝';
                greeting = tutor === 'lina' ? taskLina : taskRachelle;
                localStorage.setItem('nova_lina_intro_seen', 'true');
            } else {
                greeting = tutor === 'lina' ? '¡Hola ' + firstName + '! 👋 Tenemos: "' + taskTitle + '". ¡Vamos! 💪' : 'Hi ' + firstName + '! 👋 We have: "' + taskTitle + '". Let\'s go! 💪';
            }
        }

        await addMessage('nova', greeting);
        // Sin segundo mensaje automático: la profe no "se contesta sola"
    };

    const hasGreeted = useRef(false);
    useEffect(() => {
        if (!hasGreeted.current) {
            hasGreeted.current = true;
            const defaultTask = language === 'es' ? "Sesión Abierta" : "Open Session";
            const task = initialTask || defaultTask;
            internalStartSession(task);

            const problem = parseMathProblem(task);
            if (problem) {
                setTimeout(() => internalAnalyzeText(task, true), 500);
            }
        }
    }, [initialTask]);

    useImperativeHandle(ref, () => ({
        analyzeImage: async (base64: string, context: string) => {
            await addMessage('user', language === 'es' ? "📝 [Revisando Pizarra]" : "📝 [Checking Board]");
            await handleAIcall(context, false, base64, true);
        },
        analyzeText: async (text: string, isSystemHidden = false) => {
            await internalAnalyzeText(text, isSystemHidden);
        },
        startSession: (taskTitle: string) => internalStartSession(taskTitle),
        getAllMessages: () => messages,
        stopAudio: () => internalStopAudio(),
        addTutorMessage: async (content: string) => {
            await addMessage('nova', content);
        },
        clearChat: () => {
            internalStopAudio();
            setMessages([]);
            lastVisualState.current = null;
            isGuidedMode.current = false;
            currentProblemSteps.current = [];
            currentStepIndex.current = 0;
            pendingDivisionProblem.current = null;
        }
    }), [language, studentName, messages, grade, divisionStyle, onDrawDivisionStep, onDrawVerticalOp, onDrawFraction, onDrawGeometry, onDrawText]);

    return (
        <div className="flex flex-col h-full bg-slate-900/[0.01] relative overflow-hidden text-slate-100">
            <CelebrationOverlay
                trigger={showCelebration}
                type={celebrationType}
                points={gamification.pendingCelebration?.points}
                message={gamification.pendingCelebration?.message}
                onComplete={() => {
                    setShowCelebration(false);
                    gamification.clearCelebration();
                }}
            />

            <ShopModal
                isOpen={showShop}
                onClose={() => setShowShop(false)}
                coins={gamification.novaCoins}
                inventory={gamification.inventory}
                equippedItems={gamification.equippedItems}
                onBuy={gamification.buyItem}
                onToggleEquip={gamification.toggleEquip}
                language={language}
            />

            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2" />

            <div className="p-4 lg:p-6 flex flex-col items-center bg-slate-950/30 backdrop-blur-md border-b border-white/5 shadow-sm z-10">
                <div className="absolute top-2 right-2 lg:top-3 lg:right-3">
                    <GamificationMini
                        points={gamification.points}
                        novaCoins={gamification.novaCoins}
                        streak={gamification.streak}
                        level={gamification.getLevelInfo(language).level}
                        levelIcon={gamification.getLevelInfo(language).icon}
                        onOpenShop={() => setShowShop(true)}
                    />
                </div>

                <div className="w-20 h-20 lg:w-28 lg:h-28 relative mb-3 group transition-transform hover:scale-105 duration-300">
                    <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    {tutor === 'lina' ? (
                        <LinaAvatar
                            state={isThinking ? 'thinking' : (isSpeaking ? 'speaking' : 'idle')}
                            size={112}
                            equippedItems={gamification.equippedItems}
                            className="drop-shadow-2xl relative z-10 scale-75 lg:scale-100"
                        />
                    ) : (
                        <RachelleAvatar
                            state={isThinking ? 'thinking' : (isSpeaking ? 'speaking' : 'idle')}
                            size={112}
                            equippedItems={gamification.equippedItems}
                            className="drop-shadow-2xl relative z-10 scale-75 lg:scale-100"
                        />
                    )}
                </div>
                <div className="text-center group">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <h3 className="font-black text-white text-lg tracking-tight">
                            {tutor === 'lina' ? "Profesora Lina" : "Ms. Rachelle"}
                        </h3>
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {isSpeaking ? (language === 'es' ? 'Hablando' : 'Speaking') : (language === 'es' ? 'En línea' : 'Online')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth scrollbar-hide bg-[transparent]" ref={scrollRef}>
                {messages.filter(m => !m.isHidden).map((m, i) => (
                    <div key={i} className={`animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mb-8`}>
                        {m.role === 'user' ? (
                            <div className="flex justify-end gap-3 pl-10">
                                <div className="relative group max-w-[90%] md:max-w-[75%]">
                                    <div className="absolute inset-0 bg-cyan-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
                                    <div className="relative bg-slate-800/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl rounded-tr-sm px-6 py-5 shadow-xl">
                                        <div className="flex items-center justify-end gap-2 mb-2 pb-2 border-b border-white/5">
                                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                                                {studentName || (language === 'es' ? 'TÚ' : 'YOU')}
                                            </span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
                                        </div>

                                        <p className="text-xl md:text-2xl text-white font-medium leading-relaxed whitespace-pre-wrap text-right font-['Comic_Sans_MS',_'Chalkboard_SE',_sans-serif]">
                                            {m.content.replace(/\\n/g, '\n')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-start pr-2 md:pr-10">
                                <div className="flex-1 max-w-[90%] md:max-w-[95%]">
                                    <div className="relative group">
                                        <div className="relative bg-gradient-to-br from-indigo-900/40 to-slate-900/40 backdrop-blur-xl border border-indigo-500/30 rounded-3xl rounded-tl-sm px-6 py-5 shadow-xl shadow-indigo-900/10 hover:shadow-indigo-500/10 transition-shadow duration-300">

                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-500/20">
                                                <Sparkles className="w-3 h-3 text-yellow-400" />
                                                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                                                    {tutor === 'lina' ? "PROFESORA LINA" : "MS. RACHELLE"}
                                                </span>
                                            </div>

                                            {m.type === 'image' ? (
                                                <div className="rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl my-2 bg-slate-950/50">
                                                    <img
                                                        src={m.content}
                                                        alt="Magic Vision"
                                                        className="w-full h-auto object-cover max-h-80"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="font-['Outfit',_sans-serif] text-[22px] md:text-[26px] text-slate-100 leading-loose tracking-wide drop-shadow-sm">
                                                    <AnimatedWordText key={m.content} text={m.content} />
                                                </div>
                                            )}
                                        </div>

                                        {m.detailedExplanation && (
                                            <div className="mt-3 ml-2">
                                                <motion.button
                                                    onClick={() => toggleExplanation(i)}
                                                    className={`group/btn flex items-center gap-2 pl-1 pr-4 py-1.5 rounded-full text-xs font-bold transition-all ${expandedExplanations[i] ? 'bg-indigo-600 text-white shadow-indigo-500/30' : 'bg-transparent text-indigo-400 hover:bg-white/5'}`}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <div className={`p-1.5 rounded-full ${expandedExplanations[i] ? 'bg-indigo-500' : 'bg-slate-800 border border-indigo-500/30 group-hover/btn:border-indigo-400'}`}>
                                                        {expandedExplanations[i] ? <ChevronUp className="w-3 h-3" /> : <Cloud className="w-3 h-3" />}
                                                    </div>
                                                    {expandedExplanations[i] ? (language === 'es' ? 'Ocultar explicación' : 'Hide explanation') : (language === 'es' ? '¿Por qué paso esto?' : 'Why did this happen?')}
                                                </motion.button>

                                                <AnimatePresence>
                                                    {expandedExplanations[i] && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0, y: -10 }}
                                                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                                                            exit={{ opacity: 0, height: 0, y: -10 }}
                                                            className="mt-3 ml-4 bg-indigo-950/40 border-l-2 border-indigo-500 rounded-r-xl p-5 relative overflow-hidden"
                                                        >
                                                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-indigo-500/50 to-transparent" />
                                                            <p className="text-base text-indigo-100 leading-relaxed font-medium">
                                                                {m.detailedExplanation}
                                                            </p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {isThinking && (
                    <div className="flex items-start gap-4 pr-10 pl-2 animate-in fade-in duration-300">
                        <div className="w-10 h-10 rounded-full bg-slate-800/50 animate-pulse" />
                        <div className="flex items-center gap-3 mt-3">
                            <div className="flex gap-1.5">
                                <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" />
                            </div>
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{language === 'es' ? 'Pensando...' : 'Thinking...'}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-5 lg:p-8 pb-8 bg-slate-900/50 backdrop-blur-md border-t border-white/5 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.2)] z-20 relative min-h-[120px]">
                <div className="flex justify-center mb-3 lg:mb-5">
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleMagicVision}
                        className="flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-yellow-500 via-amber-600 to-orange-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.6)] border border-white/20 hover:shadow-[0_0_30px_rgba(245,158,11,0.8)] transition-all group"
                    >
                        <Zap className="w-5 h-5 text-white group-hover:scale-125 transition-transform" />
                        {language === 'es' ? '¡VISIÓN BANANA PRO!' : 'BANANA PRO VISION!'}
                    </motion.button>
                </div>
                <form className="relative group lg" onSubmit={(e) => {
                    e.preventDefault();
                    if (!inputText.trim()) return;
                    internalAnalyzeText(inputText);
                    setInputText('');
                }}>
                    <div className="relative flex items-center gap-3">
                        <div className="relative flex-1 min-w-0 group/input">
                            <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur opacity-10 group-focus-within/input:opacity-30 transition-opacity duration-500" />
                            <textarea
                                value={inputText}
                                onChange={(e) => {
                                    setInputText(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (inputText.trim()) {
                                            internalAnalyzeText(inputText);
                                            setInputText('');
                                            if (e.currentTarget) e.currentTarget.style.height = 'auto';
                                        }
                                    } else if (e.key === 'Escape') {
                                        e.preventDefault();
                                        setInputText('');
                                        if (e.currentTarget) e.currentTarget.style.height = 'auto';
                                    }
                                }}
                                placeholder={language === 'es' ? "Escribe o pega tu problema aquí... (Enter enviar, Shift+Enter nueva línea)" : "Type or paste your problem here... (Enter send, Shift+Enter new line)"}
                                className="w-full bg-slate-800/80 text-white placeholder-slate-400/70 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-cyan-500/10 transition-all text-lg font-medium shadow-inner relative z-50 pointer-events-auto touch-manipulation min-h-[72px] resize-none overflow-y-auto"
                                autoComplete="off"
                                rows={1}
                                aria-label={language === 'es' ? "Campo de respuesta matemática" : "Math answer input"}
                            />
                        </div>

                        <div className="flex shrink-0">
                            <button
                                type="button"
                                disabled={!inputText.trim() || isThinking}
                                onClick={(e) => {
                                    e.preventDefault();
                                    const now = Date.now();
                                    if (now - lastSendRef.current < 400) return;
                                    if (inputText.trim() && !isThinking) {
                                        lastSendRef.current = now;
                                        internalAnalyzeText(inputText);
                                        setInputText('');
                                    }
                                }}
                                onTouchEnd={(e) => {
                                    e.preventDefault();
                                    const now = Date.now();
                                    if (now - lastSendRef.current < 400) return;
                                    if (inputText.trim() && !isThinking) {
                                        lastSendRef.current = now;
                                        internalAnalyzeText(inputText);
                                        setInputText('');
                                    }
                                }}
                                className="touch-manipulation select-none min-h-[72px] min-w-[72px] h-[72px] w-[72px] rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center justify-center"
                                aria-label={language === 'es' ? 'Enviar' : 'Send'}
                            >
                                <Send className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const TutorChat = forwardRef(TutorChatComponent) as React.ForwardRefExoticComponent<TutorChatProps & React.RefAttributes<TutorChatRef>>;
