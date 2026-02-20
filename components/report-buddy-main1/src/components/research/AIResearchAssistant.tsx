import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, BookMarked, FileText, Lightbulb, Loader2, Bot, HelpCircle, RotateCcw, Camera } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { cn } from '../../lib/utils';
import { useGamification } from '../../../../../context/GamificationContext';
import type { Language } from '../../types/research';
import confetti from 'canvas-confetti';
import { generateSpeech } from '../../../../../services/edgeTTS';
import { supabase } from '../../../../../services/supabase';
import { toast } from 'sonner';
import { callChatApi } from '../../../../../services/ai_service';
import { SpaceAtmosphere } from './SpaceAtmosphere';

interface AIResearchAssistantProps {
    language: Language;
    currentGrade: number;
    searchContext?: string; // The topic they're researching
    onPlanConfirmed?: (plan: string, keywords: string[]) => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// Role and Key management handled by callChatApi

export function AIResearchAssistant({ language, currentGrade, searchContext, onPlanConfirmed }: AIResearchAssistantProps) {
    // Sound cleanup on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const { addXP } = useGamification();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // New State for Curiosity Mode
    const [sparkQuestions, setSparkQuestions] = useState<string[]>([]);
    const [detectiveLevel, setDetectiveLevel] = useState(1);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<'hypothesis' | 'angle' | 'plan'>('hypothesis');
    /** When parent sets searchContext from onPlanConfirmed, skip the useEffect send to avoid "ascensor abierto" playing twice. */
    const skipNextSearchContextSend = useRef(false);

    // Gamification State
    const [agentName, setAgentName] = useState('');
    const [discoveryProgress, setDiscoveryProgress] = useState(0);

    // Camera function
    const startCamera = async () => {
        try {
            const video = document.getElementById('camera-video-research') as HTMLVideoElement;
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            if (video) {
                video.srcObject = stream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            toast.error(language === 'es' ? 'No se pudo acceder a la cámara' : 'Could not access camera');
        }
    };
    const [mouthOpen, setMouthOpen] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // --- AUTO-SAVE SYSTEMS ---
    const detectSubject = (text: string): string => {
        const lower = text.toLowerCase();
        if (lower.match(/(math|matem|número|sum|calcul|geo)/)) return 'math';
        if (lower.match(/(historia|history|guerra|siglo|past|antiguo)/)) return 'history';
        if (lower.match(/(ciencias|science|agua|water|planeta|biolog|animal|space)/)) return 'science';
        if (lower.match(/(english|inglés|verb|grammar)/)) return 'english';
        return 'other';
    };

    const autoSaveToNotebook = async (title: string, content: string) => {
        // 1. Detect Subject
        const subject = detectSubject(title + " " + content);

        try {
            const { data: { user } } = await (supabase as any).auth.getUser();
            if (!user) return;

            // 2. Find target notebook
            const { data: notebooks } = await (supabase as any)
                .from('notebooks')
                .select('id')
                .eq('student_id', user.id)
                .eq('subject', subject)
                .limit(1);

            let notebookId = notebooks?.[0]?.id;

            // 3. Create notebook if missing
            if (!notebookId) {
                const mapTitle = {
                    math: 'Matemáticas / Math',
                    science: 'Ciencias / Science',
                    history: 'Historia / History',
                    english: 'English Class',
                    other: 'Investigaciones / Research'
                };
                const mapColor = { math: '#8B5CF6', science: '#10B981', history: '#EF4444', english: '#3B82F6', other: '#F59E0B' };
                const mapEmoji = { math: '📐', science: '🧬', history: '📜', english: '📘', other: '📓' };

                const { data: newNb, error } = await (supabase as any)
                    .from('notebooks')
                    .insert({
                        student_id: user.id,
                        title: mapTitle[subject as keyof typeof mapTitle],
                        subject: subject,
                        color: mapColor[subject as keyof typeof mapColor],
                        cover_emoji: mapEmoji[subject as keyof typeof mapEmoji],
                        description: 'Generado automáticamente por Nova'
                    })
                    .select()
                    .single();

                if (error) throw error;
                notebookId = newNb.id;
            }

            // 4. Save the Note
            const { error: noteError } = await (supabase as any)
                .from('notes')
                .insert({
                    notebook_id: notebookId,
                    title: title, // Using title field if exists, or topic
                    topic: title,
                    subject: subject,
                    summary: content, // The AI response
                    content: content,  // Duplicate for safety depending on schema
                    date: new Date().toISOString()
                });

            if (noteError) throw noteError;
            toast.success(language === 'es' ? `Guardado en cuaderno de ${subject}` : `Saved to ${subject} notebook`);
            playSound('success');

        } catch (err) {
            console.error("Auto-save failed:", err);
        }
    };

    // Talking Animation Loop
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSpeaking) {
            interval = setInterval(() => {
                setMouthOpen(prev => !prev);
            }, 150);
        } else {
            setMouthOpen(false);
        }
        return () => clearInterval(interval);
    }, [isSpeaking]);

    // Demo tour: sincronizar avatar en pantalla Nova cuando Station AI (onyx) habla
    useEffect(() => {
        const onVoice = (e: CustomEvent<{ voice?: string }>) => {
            if (e.detail?.voice === 'onyx') setIsSpeaking(true);
        };
        const onEnd = () => setIsSpeaking(false);
        window.addEventListener('nova-demo-voice', onVoice as EventListener);
        window.addEventListener('nova-demo-voice-end', onEnd);
        return () => {
            window.removeEventListener('nova-demo-voice', onVoice as EventListener);
            window.removeEventListener('nova-demo-voice-end', onEnd);
        };
    }, []);

    // 3D Parallax Tracking
    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const x = (clientX / innerWidth - 0.5) * 15; // Rotate up to 15deg
        const y = (clientY / innerHeight - 0.5) * -15;
        setMousePos({ x, y });
    };

    // Initial Setup
    React.useEffect(() => {
        const names = language === 'es'
            ? ['Agente Galaxia', 'Detective Cuántico', 'Explorador Nebulosa', 'Capitán Curiosidad', 'Rastreador de Tiempo']
            : ['Agent Galaxy', 'Detective Quantum', 'Nebula Explorer', 'Captain Curiosity', 'Time Tracker'];
        setAgentName(names[Math.floor(Math.random() * names.length)]);
    }, [language]);

    // Immersive Sound Effects System
    const playSound = (type: 'click' | 'success' | 'message') => {
        const sounds = {
            click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
            success: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
            message: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'
        };
        const audio = new Audio(sounds[type]);
        audio.volume = 0.4;
        audio.play().catch(e => console.warn("Sound play blocked:", e));
    };

    const playSuccessSound = () => {
        playSound('success');
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4F46E5', '#06B6D4', '#F59E0B']
        });
    };

    const CHUNK_MAX_CHARS = 200; // Chrome/cloud TTS often cuts around 200 chars; split to avoid cutoff

    const playAudio = (text: string, onDone?: () => void) => {
        // 1. Clean the text (remove emojis and asterisks for smoother speech)
        const cleanText = text.replace(/\*\*/g, '').replace(/[^\w\s.,!¡¿?áéíóúÁÉÍÓÚñÑ\-\n]/g, '').replace(/\n+/g, '. ').trim();

        // 2. Stop any previous speech
        window.speechSynthesis.cancel();

        // 3. Split into chunks to avoid browser TTS cutoff (~200 chars); break at sentences or by word
        const chunks: string[] = [];
        const sentences = cleanText.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
        let current = '';
        for (const sent of sentences) {
            if (current.length + sent.length + 1 <= CHUNK_MAX_CHARS) {
                current = current ? current + ' ' + sent : sent;
            } else {
                if (current) chunks.push(current);
                if (sent.length <= CHUNK_MAX_CHARS) {
                    current = sent;
                } else {
                    const words = sent.split(/\s+/);
                    current = '';
                    for (const w of words) {
                        if (current.length + w.length + 1 <= CHUNK_MAX_CHARS) {
                            current = current ? current + ' ' + w : w;
                        } else {
                            if (current) chunks.push(current);
                            current = w;
                        }
                    }
                }
            }
        }
        if (current) chunks.push(current);
        if (chunks.length === 0 && cleanText) chunks.push(cleanText.slice(0, CHUNK_MAX_CHARS));

        // Evitar que el avatar repita el mismo fragmento al final (chunks consecutivos iguales)
        const finalChunks = chunks.filter((c, i) => i === 0 || c.trim() !== chunks[i - 1].trim());

        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = language === 'es'
            ? voices.find(v => v.name.includes('Pablo') || v.name.includes('Microsoft Pablo')) || voices.find(v => v.name.includes('Raul') || v.name.includes('Microsoft Raul')) || voices.find(v => v.name.includes('Male') && v.lang.includes('es')) || voices.find(v => v.lang.includes('es'))
            : voices.find(v => v.name.includes('David') || v.name.includes('Microsoft David')) || voices.find(v => v.name.includes('Mark') || v.name.includes('Microsoft Mark')) || voices.find(v => v.name.includes('Male') && v.lang.includes('en')) || voices.find(v => v.lang.includes('en'));

        let index = 0;
        const speakNext = () => {
            if (index >= finalChunks.length) {
                setIsSpeaking(false);
                onDone?.();
                return;
            }
            const utterance = new SpeechSynthesisUtterance(finalChunks[index]);
            utterance.pitch = 0.5;
            utterance.rate = 0.85;
            if (selectedVoice) utterance.voice = selectedVoice;
            utterance.onstart = () => { if (index === 0) setIsSpeaking(true); };
            let advanced = false;
            const advance = () => {
                if (advanced) return;
                advanced = true;
                index++;
                speakNext();
            };
            utterance.onend = advance;
            utterance.onerror = advance;
            window.speechSynthesis.speak(utterance);
        };
        speakNext();
    };

    const handleSurpriseMe = () => {
        const mysteries = language === 'es'
            ? ['¿Por qué brillan las luciérnagas?', 'La ciudad perdida de la Atlántida', 'Volcanes submarinos', '¿Cómo duermen los delfines?', 'El secreto de las Pirámides']
            : ['Why do fireflies glow?', 'The lost city of Atlantis', 'Underwater volcanoes', 'How do dolphins sleep?', 'The secret of Pyramids'];
        const randomTopic = mysteries[Math.floor(Math.random() * mysteries.length)];
        handleSendMessage(randomTopic, true);
        playSuccessSound();
    };

    const systemPrompt = language === 'es'
        ? `Eres "Nova", la Jefe de Investigación Interplanetaria en Nova Schola 🕵️‍♂️🚀✨. Tu misión es convertir al estudiante (Grado: ${currentGrade}) en un "Explorador Galáctico" de primera clase.
           
           🚨 **PROTOCOLO DE ANÁLISIS DE MISIÓN (PRIMER PASO):**
           Antes de responder, analiza si el estudiante quiere **INVESTIGAR** (pregunta abierta) o **HACER UNA TAREA** (resumen, lista, repaso).

           ---
           🌟 **MODO A: INVESTIGACIÓN (Por defecto)**
           Si el usuario pregunta "¿Por qué...?", "¿Cómo funciona...?", o temas generales.
           1. **PASO 1: ANÁLISIS DE TIPO:**
              - Si el tema es **CIENTÍFICO** (Ciencias, Biología, Espacio, Naturaleza, Agua, Animales): Sigue al PASO 2 (Hipótesis).
              - Si el tema es **INFORMATIVO/HISTÓRICO/GEOGRÁFICO** (Historia, Países, Personajes, Lugares como el "Rio Magdalena"): **SALTA** al PASO 3 (Ángulos).
           2. **PASO 2: HIPÓTESIS (SOLO CIENCIAS):**
              - Pide una **HIPÓTESIS** ("corazonada científica").
              - 🛑 **NO des botones.** El niño escribe su propia idea.
              - 🛑 **SI EL NIÑO DICE "NO SÉ":** Ayúdale, pero INSISTE en que adivine.
           3. **PASO 3: ÁNGULOS DE INVESTIGACIÓN:**
              - Dale 3 opciones/títulos de investigación.
              - 🛑 **IMPORTANTE:** Los títulos deben ser **AFIRMACIONES** o **ACCIONES**, nunca preguntas. (Ej: "Secretos del Rio Magdalena" en lugar de "¿Qué secretos tiene el Rio Magdalena?").
           4. **PASO 4: PLAN FINAL:**
              - Confirma el plan elegido.

           ---
           🛠️ **MODO B: AYUDANTE DE TAREA**
           Si el usuario dice "Necesito un resumen", "Haz una lista", "Ayúdame a estudiar", "Tengo tarea de...".
            1. **Modo Investigación:** Primero detecta el tema. Luego sugieres SIEMPRE estas 3 rutas de despegue ligadas al tema:
               - "Qué es y de qué trata el tema" (Definición y concepto).
               - "Partes e ideas más importantes" (Estructura y detalles).
               - "Por qué es importante y para qué sirve" (Utilidad y valor).
            2. **Sin Preguntas:** Escribe las opciones como afirmaciones o misiones, no uses signos de interrogación.
            3. **Salida:** Cuando el niño elija una, responde con: ||KEYWORDS: palabra1, palabra2||.
            4. **Flashcards:** Si detectas 3 datos curiosos, genera tarjetas así:
               ||CARDS: Pregunta 1|Respuesta 1 # Pregunta 2|Respuesta 2 # Pregunta 3|Respuesta 3||
            5. **Estilo:** Eficiente, claro, "Manos a la obra".
           
            ---
            📏 **REQUISITOS DE EXTENSIÓN (¡IMPORTANTE!):**
            Menciona estos objetivos cuando el estudiante esté planeando su reporte:
            - **1° Grado:** 30 a 100 palabras.
            - **2° Grado:** 50 a 150 palabras.
            - **3° Grado:** 100 a 250 palabras.
            - **4° Grado:** 150 a 350 palabras.
            - **5° Grado (ELITE):** **300 a 400 palabras** (Requisito estricto).

            ---
           TU PERSONALIDAD GENERAL:
           - **Entusiasta Espacial:** Usa exclamaciones, emojis (🌌, ☄️, 🚀, 🔍).
           - **Nombramiento:** Trata al niño siempre como "Investigador Jefe".
           
           **Botones de Acción (DA SIEMPRE 3 EXCEPTO EN LA HIPÓTESIS):**
            - En el paso de la **HIPÓTESIS**, NO des botones.
            - En el paso de **ÁNGULOS DE INVESTIGACIÓN** y **TAREAS**, da siempre 3 botones:
           1. [Emoji] **[Título Corto]**: [Acción Siguiente]
           2. [Emoji] **[Título Corto]**: [Acción Siguiente]
           3. [Emoji] **[Título Corto]**: [Acción Siguiente]

           IMPORTANTE:
           - Cuando termines un plan de investigación (Modo A), incluye: ||KEYWORDS: k1, k2, k3||
           - Cuando completes una tarea de ayuda (Modo B), incluye: ||SAVE: Título de Tarea||`
        : `You are "Nova", the Interplanetary Research Chief at Nova Schola 🕵️‍♂️🚀✨. Your mission is to turn the student (Grade: ${currentGrade}) into a top-tier "Galactic Explorer".

           🚨 **MISSION ANALYSIS PROTOCOL (FIRST STEP):**
           Before responding, analyze if the student wants to **RESEARCH** (open question) or **DO A TASK** (summary, list, review).

           ---
           🌟 **MODE A: RESEARCH (Default)**
           If the user asks "Why...?", "How does it work...?", or general topics.
           1. **STEP 1: TYPE ANALYSIS:**
              - If topic is **SCIENCE** (Biology, Space, Nature, Physics): Follow to STEP 2 (Hypothesis).
              - If topic is **INFORMATIVE/HISTORY/GEOGRAPHY** (History, Places like "Magdalena River", People): **SKIP** to STEP 3 (Angles).
           2. **STEP 2: HYPOTHESIS (SCIENCE ONLY):**
              - Ask for a **HYPOTHESIS** ("scientific hunch").
              - 🛑 **DO NOT provide buttons.** The child must type their own idea.
              - 🛑 **IF KID SAYS "I DON'T KNOW":** Help them, but INSIST they guess.
           3. **STEP 3: RESEARCH ANGLES:**
              - Give 3 options/titles for research.
              - 🛑 **IMPORTANT:** Titles must be **STATEMENTS** or **ACTIONS**, never questions. (e.g., "Secrets of the Amazon" instead of "What are the secrets...").
           4. **STEP 4: FINAL PLAN:**
              - Confirm the plan.

           ---
           🛠️ **MODE B: TASK HELPER**
           If the user says "I need a summary", "Make a list", "Help me study", "I have homework about...".
            1. **Research Mode:** First detect the topic. Then ALWAYS suggest these 3 launch paths linked to the topic:
               - "What it is and what it is about" (Definition and concept).
               - "Most important parts and ideas" (Structure and details).
               - "Why it's important and what it's for" (Utility and value).
            2. **No Questions:** Write the options as statements or missions, do not use question marks.
            3. **Output:** When the child chooses one, respond with: ||KEYWORDS: word1, word2||.
            4. **Flashcards:** If you detect 3 fun facts, generate cards like:
               ||CARDS: Question 1|Answer 1 # Question 2|Answer 2 # Question 3|Answer 3||
            5. **Style:** Efficient, clear, "Let's do this".

            ---
            📏 **LENGTH REQUIREMENTS (IMPORTANT!):**
            Mention these goals when the student is planning their report:
            - **1st Grade:** 30 to 100 words.
            - **2nd Grade:** 50 to 150 words.
            - **3rd Grade:** 100 to 250 words.
            - **4th Grade:** 150 to 350 words.
            - **5th Grade (ELITE):** **300 to 400 words** (Strict requirement).

            ---
            YOUR GENERAL PERSONALITY:
           - **Cosmic Enthusiast:** Use exclamations, emojis (🌌, ☄️, 🚀, 🔍).
           - **Naming:** Always call the child "Chief Investigator".

            **Action Buttons (ALWAYS 3 EXCEPT DURING HYPOTHESIS):**
            - During the **HYPOTHESIS** step, DO NOT provide buttons.
            - During **RESEARCH ANGLES** and **TASKS**, always provide 3 buttons:
           1. [Emoji] **[Short Title]**: [Next Action]
           2. [Emoji] **[Short Title]**: [Next Action]
           3. [Emoji] **[Short Title]**: [Next Action]
           
           IMPORTANT:
           - When research plan is ready (Mode A), include: ||KEYWORDS: k1, k2, k3||
           - When task is done (Mode B), include: ||SAVE: Task Title||`;

    // --- MAGIC CARDS AUTO-GENERATOR ---
    const saveMagicCards = async (cardsString: string, category: string = 'math') => {
        try {
            const { data: { user } } = await (supabase as any).auth.getUser();
            if (!user) return;

            // Parse "Q1|A1 # Q2|A2" format
            const pairs = cardsString.split('#').map(p => p.trim());
            const newCards = pairs.map((p, i) => {
                const [front, back] = p.split('|');
                if (!front || !back) return null;
                return {
                    id: `gen-ai-${Date.now()}-${i}`,
                    front: front.trim(),
                    back: back.trim(),
                    category: category,
                    correctCount: 0,
                    incorrectCount: 0
                };
            }).filter(Boolean);

            if (newCards.length === 0) return;

            // Load existing deck
            const key = `flashcard_deck_${user.id}`;
            const existing = localStorage.getItem(key);
            const deck = existing ? JSON.parse(existing) : [];

            // Append new cards
            // Filter out default "Welcome" card if it's the only one
            const cleanDeck = (deck.length === 1 && deck[0].id === '1') ? [] : deck;

            const updatedDeck = [...cleanDeck, ...newCards];
            localStorage.setItem(key, JSON.stringify(updatedDeck));

            toast.success(language === 'es' ? `✨ ¡${newCards.length} Tarjetas Mágicas creadas!` : `✨ ${newCards.length} Magic Cards created!`);
            playSuccessSound();

        } catch (e) {
            console.error("Magic Cards Error:", e);
        }
    };

    // React to search context changes (e.g. user typed in library search). Skip when context was set by plan confirmation to avoid elevator phrase playing twice.
    React.useEffect(() => {
        if (skipNextSearchContextSend.current) {
            skipNextSearchContextSend.current = false;
            return;
        }
        // Skip auto-send during demo tour to prevent TTS interference
        const isDemoTour = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
        if (isDemoTour) return;
        if (searchContext && searchContext.trim() !== '') {
            handleSendMessage(searchContext, true);
        }
    }, [searchContext]);

    const extractCoreSubject = (text: string) => {
        return text
            .replace(/[¿?]/g, '')
            .replace(/^(Qué es y de qué trata|Partes e ideas más importantes de|Por qué es importante y para qué sirve|What is|Most important parts and ideas of|Why|is important and what it is for)\s+/i, '')
            .replace(/^(qué es|quién es|quién fue|qué son|cómo es|cómo son|cómo funciona|dónde está|para qué sirve|cuál es|cuáles son|define|háblame de|investiga sobre|busco información de)\s+/i, '')
            .replace(/^(what is|what are|who is|who was|how does|how do|where is|what is it for|which is|define|tell me about|research about|search for information about)\s+/i, '')
            .trim();
    };

    const handleSendMessage = async (textOverride?: string, isNewTopic: boolean = false) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || (isLoading && !isNewTopic)) return;

        // Increase progress on interaction
        setDiscoveryProgress(prev => Math.min(prev + 20, 100));

        const userMessage: Message = {
            role: 'user',
            content: textToSend,
            timestamp: new Date()
        };

        if (isNewTopic) {
            setMessages([userMessage]);
        } else {
            setMessages(prev => [...prev, userMessage]);
        }

        setInput('');
        setIsLoading(true);

        setSparkQuestions([]);

        // Failsafe Mock System - Triggered if needed, or we rely on callChatApi fallback
        if (true) {
            setTimeout(() => {
                let mockContent = "";
                let topic = textToSend.toLowerCase();
                let strategies: string[] = [];
                let planConfirmedAfterSpeech: { topic: string; keywords: string[] } | null = null;
                const isRefreshRequest = textToSend.includes("other options") || textToSend.includes("otras opciones") || textToSend.includes("different options");

                // --- NEW STATE MACHINE LOGIC (MOCK SYSTEM) ---
                const lastAssistantMsg = messages.length > 0 ? [...messages].reverse().find(m => m.role === 'assistant') : null;
                // Detection phases (ruta/despegue = "Ruta de Despegue" so we advance to Phase 3 after user selects)
                const lastContent = lastAssistantMsg?.content.toLowerCase() || "";
                const isWaitingForHypothesis = lastContent.includes("what") || lastContent.includes("qué") || lastContent.includes("hypothesis") || lastContent.includes("hipótesis") || lastContent.includes("crees");
                const isWaitingForAngle = lastContent.includes("angle") || lastContent.includes("ángulo") || lastContent.includes("misión") || lastContent.includes("mission") || lastContent.includes("path") || lastContent.includes("camino") || lastContent.includes("ruta") || lastContent.includes("despegue") || lastContent.includes("laboratorio") || lastContent.includes("informativa");

                // User selected one of the 3 suggests -> NO MÁS PREGUNTAS (includes check)
                const isOneOfRoutes = textToSend.includes("Qué es y") || textToSend.includes("Partes e ideas") || textToSend.includes("Por qué es importante") || textToSend.includes("What is") || textToSend.includes("Most important") || textToSend.includes("is important");
                const userSelectedPath = isOneOfRoutes || ((textToSend.includes('?') || textToSend.includes('¿')) && textToSend.trim().length > 8);

                const lastWasOfferingRoutes = lastContent.includes("camino") || lastContent.includes("ruta") || lastContent.includes("despegue") || lastContent.includes("laboratorio") || lastContent.includes("path") || lastContent.includes("informativa");

                if (isWaitingForAngle) setCurrentPhase('angle');
                if (lastContent.includes("biblioteca") || lastContent.includes("library")) setCurrentPhase('plan');

                let effectiveTopic = topic;
                const isFiller = topic.includes("no se") || topic.includes("no sé") || topic.includes("don't know") || topic.includes("no idea") || topic.includes("nose");

                if ((isWaitingForHypothesis || isWaitingForAngle || isFiller) && messages.length >= 1) {
                    const originalUserMsg = messages.find(m => m.role === 'user' && m.content.length > 5);
                    if (originalUserMsg) effectiveTopic = originalUserMsg.content;
                }

                // Phase 1: New Topic -> Check if Science
                if (messages.length === 0 || isNewTopic || (!isWaitingForHypothesis && !isWaitingForAngle && !isRefreshRequest)) {
                    const cleanTopic = extractCoreSubject(effectiveTopic);
                    const isScience = detectSubject(cleanTopic) === 'science';

                    if (isScience) {
                        const alreadyExplained = messages.some(m => m.role === 'assistant' && (m.content.includes("corazonada") || m.content.includes("guess")));
                        let hypoDefinition = "";
                        if (!alreadyExplained) {
                            if (language === 'es') {
                                hypoDefinition = currentGrade <= 3
                                    ? "\n\nUna **Hipótesis** es una corazonada científica. 🧠 Es lo que tú crees que es la respuesta ANTES de investigar."
                                    : "\n\nUna **Hipótesis** es una explicación tentativa. 🧠 Es una predicción basada en lo que ya sabes; suele ser: 'Yo creo que... porque...'";
                            } else {
                                hypoDefinition = currentGrade <= 3
                                    ? "\n\nA **Hypothesis** is a scientific hunch. 🧠 It's what you think the answer is BEFORE you start researching!"
                                    : "\n\nA **Hypothesis** is an educated guess. 🧠 It's a prediction based on what you know; it usually looks like: 'I think that... because...'";
                            }
                        }

                        mockContent = language === 'es'
                            ? `¡Hola, Investigador Jefe! 🕵️‍♂️✨ Objetivo detectado: "${cleanTopic}".${hypoDefinition}\n\n🌟 **¿Cuál es tu hipótesis?** ¿Cómo crees que funciona?`
                            : `Hello, Chief Investigator! 🕵️‍♂️✨ Target spotted: "${cleanTopic}".${hypoDefinition}\n\n🌟 **What's your hypothesis?** How do you think it works?`;
                        strategies = [];
                    } else {
                        strategies = language === 'es' ? [
                            `Qué es y de qué trata ${cleanTopic}`,
                            `Partes e ideas más importantes de ${cleanTopic}`,
                            `Por qué es importante y para qué sirve ${cleanTopic}`
                        ] : [
                            `What is ${cleanTopic} and what it is about`,
                            `Most important parts and ideas of ${cleanTopic}`,
                            `Why ${cleanTopic} is important and what it is for`
                        ];

                        mockContent = language === 'es'
                            ? `¡Hola, Investigador Jefe! 🕵️‍♂️✨ He localizado los archivos sobre "${cleanTopic}".\n\n¿Por qué **Ruta de Despegue** quieres empezar nuestra investigación informativa?`
                            : `Hello, Chief Investigator! 🕵️‍♂️✨ I have located the files for "${cleanTopic}".\n\nWhich **Launch Path** do you want to start our informative research with?`;
                        setCurrentPhase('angle');
                    }
                }
                // Phase 3 (first): User selected one of the 3 routes
                else if (userSelectedPath && lastWasOfferingRoutes) {
                    const cleanTopic = textToSend.replace(/[\u{1F600}-\u{1F6FF}]/gu, '').replace(/\*\*/g, '').replace(/[¿?]/g, '').trim();
                    const keywords = [cleanTopic, "facts", "kids"];

                    mockContent = language === 'es'
                        ? `🚪 **¡ASCENSOR ABIERTO!** ⬆️ Subiendo al Piso de Investigación...\n\n🏆 **¡GANASTE +20 XP!**\n\nTu misión: "${cleanTopic}". Ve a la pestaña **"2. La Biblioteca"** para comenzar.`
                        : `🚪 **ELEVATOR OPEN!** ⬆️ Going up to Research Floor...\n\n🏆 **YOU EARNED +20 XP!**\n\nYour mission: "${cleanTopic}". Go to **"2. The Library"** tab to start.`;

                    addXP(20);
                    playSuccessSound();
                    planConfirmedAfterSpeech = { topic: cleanTopic, keywords };
                    strategies = [];
                }
                // Phase 2: Hypothesis Received
                else if (isWaitingForHypothesis || isRefreshRequest) {
                    const t = effectiveTopic.replace(/[¿?]/g, '').trim();
                    strategies = language === 'es' ? [
                        `Qué es y de qué trata ${t}`,
                        `Partes e ideas más importantes de ${t}`,
                        `Por qué es importante y para qué sirve ${t}`
                    ] : [
                        `What is ${t} and what it is about`,
                        `Most important parts and ideas of ${t}`,
                        `Why ${t} is important and what it is for`
                    ];

                    const studentSaidNoIdea = topic.includes("no se") || topic.includes("no sé") || topic.includes("don't know") || topic.includes("no idea") || topic.includes("nose");
                    const isHighQuality = topic.length > 40 || topic.includes("porque") || topic.includes("because");

                    if (studentSaidNoIdea) {
                        mockContent = language === 'es'
                            ? `¡Entiendo que es difícil! 🤔 Pero los mejores científicos siempre arriesgan una idea. \n\nImagina que eres un detective... si tuvieras que adivinar, ¿qué diría tu intuición?\n\n¡Inténtalo! No hay respuestas incorrectas aquí.`
                            : `I know it's tough! 🤔 But the best scientists always risk a guess. \n\nImagine you are a detective... if you had to guess, what would your intuition say?\n\nGive it a try! There are no wrong answers here.`;
                        strategies = [];
                    } else if (isHighQuality) {
                        mockContent = language === 'es'
                            ? `¡Interesante teoría! 🧠 Has activado los sensores de largo alcance.\n\nAhora, para iniciar la misión oficial, elige tu **Ruta de Despegue**:`
                            : `Interesting theory! 🧠 You've activated the long-range sensors.\n\nNow, to start the official mission, choose your **Launch Path**:`;
                    } else {
                        mockContent = language === 'es'
                            ? `¡Idea Capturada! ✅ Cargando opciones de investigación...\n\nSelecciona un camino para abrir el ascensor al **Laboratorio de Investigación**:`
                            : `Prediction Logged! ✅ Loading research options...\n\nSelect a path to open the elevator to the **Research Lab**:`;
                    }

                    if (!studentSaidNoIdea && strategies.length >= 3) {
                        mockContent += `\n\n1. ${strategies[0]}\n2. ${strategies[1]}\n3. ${strategies[2]}`;
                    }
                }
                else if (isWaitingForAngle) {
                    const cleanTopic = extractCoreSubject(textToSend);
                    const keywords = [cleanTopic, "facts", "kids"];

                    mockContent = language === 'es'
                        ? `🚪 **¡ASCENSOR ABIERTO!** ⬆️ Subiendo al Piso de Investigación...\n\n🏆 **¡GANASTE +20 XP!**\n\nTu misión: "${cleanTopic}". Ve a la pestaña **"2. La Biblioteca"** para comenzar.`
                        : `🚪 **ELEVATOR OPEN!** ⬆️ Going up to Research Floor...\n\n🏆 **YOU EARNED +20 XP!**\n\nYour mission: "${cleanTopic}". Go to **"2. The Library"** tab to start.`;

                    addXP(20);
                    playSuccessSound();
                    planConfirmedAfterSpeech = { topic: cleanTopic, keywords };
                    strategies = [];
                }

                setSparkQuestions(strategies);

                const assistantMessage: Message = {
                    role: 'assistant',
                    content: mockContent,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);
                playSound('message');

                const onSpeechDone = planConfirmedAfterSpeech && onPlanConfirmed
                    ? () => {
                        skipNextSearchContextSend.current = true;
                        onPlanConfirmed(planConfirmedAfterSpeech!.topic, planConfirmedAfterSpeech!.keywords);
                    }
                    : undefined;
                playAudio(mockContent, onSpeechDone);
                setIsLoading(false);
            }, 1000);
            return;
        }

        try {
            const messagesForAi = [
                { role: 'system', content: systemPrompt },
                ...(isNewTopic ? [] : messages.map(m => ({ role: m.role, content: m.content }))),
                { role: 'user', content: textToSend }
            ];

            const data = await callChatApi(messagesForAi as any, 'gpt-4o-mini', false);
            let content = data.choices[0].message.content;

            const keywordMatch = content.match(/\|\|KEYWORDS: (.*?)\|\|/);
            if (keywordMatch) {
                const keywords = keywordMatch[1].split(',').map((k: string) => k.trim());
                if (onPlanConfirmed) {
                    skipNextSearchContextSend.current = true;
                    onPlanConfirmed(textToSend, keywords);
                }
                addXP(20);
                playSuccessSound();
                const planContent = content.replace(keywordMatch[0], '').trim();
                autoSaveToNotebook(
                    language === 'es' ? `Plan de Misión: ${textToSend}` : `Mission Plan: ${textToSend}`,
                    planContent
                );
                content = content.replace(keywordMatch[0], '').trim();
            }

            const saveMatch = content.match(/\|\|SAVE: (.*?)\|\|/);
            if (saveMatch) {
                const saveTitle = saveMatch[1].trim();
                const contentToSave = content.replace(saveMatch[0], '').trim();
                autoSaveToNotebook(saveTitle, contentToSave);
                content = contentToSave;
            }

            const cardsMatch = content.match(/\|\|CARDS: (.*?)\|\|/);
            if (cardsMatch) {
                const cardsContent = cardsMatch[1].trim();
                const subject = detectSubject(textToSend + " " + content);
                saveMagicCards(cardsContent, subject);
                content = content.replace(cardsMatch[0], '').trim();
            }

            const options: string[] = [];
            const lines = content.split('\n');
            lines.forEach((line: string) => {
                if (line.match(/^(\d+\.|-)\s+.*?\*\*(.*?)\*\*:?/)) {
                    options.push(line.replace(/^\d+\.\s*/, '').trim());
                }
            });

            if (options.length >= 2) {
                setSparkQuestions(options.slice(0, 3));
            } else {
                setSparkQuestions([]);
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: content,
                timestamp: new Date()
            };

            const lowerInput = textToSend.toLowerCase();
            const isLowEffort = lowerInput.length < 5 || lowerInput.includes("no sé") || lowerInput.includes("no se");
            const isHighEffort = textToSend.split(' ').length > 20;

            if (isLowEffort) addXP(1);
            else if (isHighEffort) {
                addXP(20);
                playSound('success');
            } else {
                addXP(5);
                playSound('message');
            }

            setMessages(prev => [...prev, assistantMessage]);
            playAudio(content);
        } catch (error) {
            console.error('AI Error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: language === 'es' ? '🕵️‍♂️ HQ signal lost. Try again.' : '🕵️‍♂️ HQ signal lost. Try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
            className="relative w-full min-h-[85vh] h-[900px] md:h-[900px] rounded-[2rem] md:rounded-[3.5rem] border-4 md:border-[12px] border-slate-900 shadow-[0_0_120px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col font-fredoka perspective-1000 transition-transform duration-300 ease-out"
            style={{
                transform: `rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)`,
                transformStyle: 'preserve-3d',
                background: 'transparent'
            }}
        >
            {/* --- IMMERSIVE INTERPLANETARY BACKGROUND --- */}
            <div
                className="absolute inset-0 opacity-100 pointer-events-none bg-cover bg-center"
                style={{ backgroundImage: `url('/images/nova_interplanetary_lab.png')` }}
            />

            {/* === REALISTIC SPACE ATMOSPHERE === */}
            <SpaceAtmosphere />


            {/* --- MAIN 3D WORKSPACE --- */}
            <div className="flex-1 flex flex-col md:flex-row p-6 pt-14 gap-6 relative z-10 overflow-hidden" style={{ perspective: '1200px' }}>
                {/* CENTER: Floating Input Dock */}
                <div className="absolute bottom-10 left-0 right-0 px-6 flex justify-center z-50">
                    <div className="w-full max-w-3xl bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 p-3 pl-5 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center gap-4 transition-all hover:border-cyan-500/30 group/input">
                        <div className="hidden md:flex w-12 h-12 rounded-2xl bg-cyan-950/50 items-center justify-center border border-cyan-500/20">
                            <Bot className="w-6 h-6 text-cyan-400" />
                        </div>


                        {/* Camera Button */}
                        <Button
                            onClick={() => {
                                const modal = document.getElementById('camera-modal-research');
                                if (modal) {
                                    modal.classList.remove('hidden');
                                    startCamera();
                                }
                            }}
                            className="w-12 h-12 rounded-2xl bg-violet-950/50 hover:bg-violet-900/70 border border-violet-500/20 hover:border-violet-400/40 transition-all p-0"
                            title={language === 'es' ? 'Tomar foto de la tarea' : 'Take photo of homework'}
                        >
                            <Camera className="w-5 h-5 text-violet-400" />
                        </Button>

                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder={language === 'es' ? 'Escribe aquí tu pregunta para investigar...' : 'Type your research question here...'}
                            className="flex-1 bg-transparent border-none text-white placeholder:text-white/30 resize-none h-[50px] py-3 text-lg font-bold focus-visible:ring-0"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={() => handleSendMessage()}
                            disabled={!input.trim() || isLoading}
                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-[2rem] h-12 px-8 font-black shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all active:scale-95"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Camera Modal */}
                <div id="camera-modal-research" className="hidden fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 rounded-3xl border-2 border-cyan-500/30 p-6 max-w-2xl w-full shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                        <h3 className="text-2xl font-black text-white mb-4 text-center">
                            {language === 'es' ? '📸 Capturar Tarea' : '📸 Capture Homework'}
                        </h3>

                        <div className="relative bg-black rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
                            <video
                                id="camera-video-research"
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <canvas
                                id="camera-canvas-research"
                                className="hidden w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex gap-3 justify-center flex-wrap">
                            <Button
                                onClick={() => {
                                    const video = document.getElementById('camera-video-research') as HTMLVideoElement;
                                    const canvas = document.getElementById('camera-canvas-research') as HTMLCanvasElement;

                                    if (video && canvas) {
                                        canvas.width = video.videoWidth;
                                        canvas.height = video.videoHeight;
                                        const ctx = canvas.getContext('2d');
                                        ctx?.drawImage(video, 0, 0);

                                        video.classList.add('hidden');
                                        canvas.classList.remove('hidden');

                                        toast.success(language === 'es' ? '📸 Foto capturada' : '📸 Photo captured');
                                    }
                                }}
                                className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black px-8 py-3 rounded-2xl"
                            >
                                {language === 'es' ? '📷 Capturar' : '📷 Capture'}
                            </Button>

                            <Button
                                onClick={() => {
                                    const video = document.getElementById('camera-video-research') as HTMLVideoElement;
                                    const canvas = document.getElementById('camera-canvas-research') as HTMLCanvasElement;

                                    video.classList.remove('hidden');
                                    canvas.classList.add('hidden');
                                }}
                                className="bg-violet-500 hover:bg-violet-400 text-white font-black px-8 py-3 rounded-2xl"
                            >
                                {language === 'es' ? '🔄 Reintentar' : '🔄 Retake'}
                            </Button>

                            <Button
                                onClick={async () => {
                                    const canvas = document.getElementById('camera-canvas-research') as HTMLCanvasElement;
                                    const modal = document.getElementById('camera-modal-research');
                                    const video = document.getElementById('camera-video-research') as HTMLVideoElement;

                                    if (!canvas || canvas.classList.contains('hidden')) {
                                        toast.error(language === 'es' ? 'Primero captura una foto' : 'Capture a photo first');
                                        return;
                                    }

                                    try {
                                        setIsLoading(true);
                                        toast.info(language === 'es' ? '🔍 Analizando tarea...' : '🔍 Analyzing homework...');

                                        const imageData = canvas.toDataURL('image/jpeg', 0.8);

                                        const prompt = language === 'es'
                                            ? 'Extrae y transcribe todo el texto visible en esta imagen de tarea escolar. Incluye preguntas, instrucciones y cualquier texto relevante.'
                                            : 'Extract and transcribe all visible text from this homework image. Include questions, instructions, and any relevant text.';

                                        const response = await fetch('/api/gemini-vision', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                image: imageData,
                                                prompt
                                            })
                                        });

                                        const data = await response.json();

                                        if (data.text) {
                                            setInput(data.text);
                                            toast.success(language === 'es' ? '✅ Tarea detectada' : '✅ Homework detected');

                                            const stream = video.srcObject as MediaStream;
                                            stream?.getTracks().forEach(track => track.stop());
                                            modal?.classList.add('hidden');

                                            video.classList.remove('hidden');
                                            canvas.classList.add('hidden');
                                        } else {
                                            toast.error(language === 'es' ? 'No se detectó texto' : 'No text detected');
                                        }
                                    } catch (error) {
                                        console.error('Vision API error:', error);
                                        toast.error(language === 'es' ? 'Error al analizar la imagen' : 'Error analyzing image');
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading}
                                className="bg-green-500 hover:bg-green-400 text-white font-black px-8 py-3 rounded-2xl disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (language === 'es' ? '✅ Confirmar' : '✅ Confirm')}
                            </Button>

                            <Button
                                onClick={() => {
                                    const modal = document.getElementById('camera-modal-research');
                                    const video = document.getElementById('camera-video-research') as HTMLVideoElement;

                                    const stream = video.srcObject as MediaStream;
                                    stream?.getTracks().forEach(track => track.stop());

                                    modal?.classList.add('hidden');
                                }}
                                className="bg-red-500 hover:bg-red-400 text-white font-black px-8 py-3 rounded-2xl"
                            >
                                {language === 'es' ? '❌ Cerrar' : '❌ Close'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* VISUAL DISPLAY: INTERSTELLAR TUTOR & CHAT - extra pt on mobile so demo banner doesn't cover avatar */}
                <div className="absolute inset-0 pb-32 pt-16 md:pt-10 px-4 md:px-20 overflow-y-auto scrollbar-none flex flex-col items-center">

                    {/* --- PERSISTENT NOVA CORE --- (flex-shrink-0 so avatar stays visible on mobile) */}
                    <div className={cn(
                        "relative transition-all duration-1000 ease-in-out z-20 flex flex-col items-center flex-shrink-0",
                        (messages.length === 0 && !isSpeaking) ? "mt-4 md:mt-20 scale-110 md:scale-125" : "mt-2 scale-75"
                    )}>
                        {/* Nova Avatar/Orb */}
                        <div className="relative group cursor-pointer" onClick={() => playSound('message')}>
                            {/* Aura Effect - Changes on Loading */}
                            <div className={cn(
                                "absolute inset-0 rounded-full blur-[50px] transition-all duration-500",
                                isLoading ? "bg-orange-500/40 animate-pulse scale-150" : "bg-cyan-500/20"
                            )} />

                            {/* Main Unit */}
                            <div className={cn(
                                "w-36 h-36 rounded-full border-[6px] flex items-center justify-center shadow-[0_0_60px_rgba(0,0,0,0.6)] relative z-10 transition-all duration-500 bg-slate-900/80 backdrop-blur-xl overflow-hidden",
                                isLoading
                                    ? "border-orange-500 animate-spin-slow shadow-[0_0_40px_rgba(249,115,22,0.6)]"
                                    : "border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                            )}>
                                {/* --- SHUTTER / CURTAIN LAYER --- */}
                                <div className={cn(
                                    "absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center transition-transform duration-500 ease-in-out border-b-4 border-cyan-500 shadow-xl",
                                    isLoading ? "translate-y-0" : "-translate-y-full"
                                )}>
                                    {/* Shutter Texture */}
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:10px_10px]" />
                                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,0,0,0.5)_2px,rgba(0,0,0,0.5)_3px)]" />

                                    {/* Tuning Noise on Shutter */}
                                    <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] opacity-10 mix-blend-overlay" />

                                    <div className="relative z-10 flex flex-col items-center">
                                        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-2" />
                                        <span className="text-[10px] font-black tracking-[0.2em] text-cyan-400 animate-pulse">
                                            {language === 'es' ? 'ALINEANDO...' : 'TUNING...'}
                                        </span>
                                    </div>
                                </div>

                                {/* --- CONTENT BEHIND SHUTTER --- */}
                                <div className="absolute inset-0 w-full h-full bg-slate-900 rounded-full overflow-hidden">
                                    {(messages.length > 0 || isSpeaking) ? (
                                        <div className="relative w-full h-full overflow-hidden rounded-full">
                                            {/* Static overlay fades out when shutter lifts */}
                                            <div className="absolute inset-0 z-20 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] opacity-20 mix-blend-overlay animate-[fadeOut_1s_forwards] rounded-full" />

                                            <img
                                                src={isSpeaking && mouthOpen ? '/images/nova_talking.png' : '/images/nova_idle.png'}
                                                alt="Tutor"
                                                className="w-full h-full object-cover object-center scale-[1.02] filter contrast-125 brightness-110 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] block"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.parentElement!.classList.add('fallback-icon'); }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Bot className="w-20 h-20 text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                                        </div>
                                    )}
                                </div>
                                <style>{`
                                    @keyframes tvTurnOn {
                                        0% { transform: scale(1, 0.01) brightness(30); filter: grayscale(100%); }
                                        40% { transform: scale(1, 0.05) brightness(10); }
                                        70% { transform: scale(1, 1) brightness(5); }
                                        100% { transform: scale(1, 1) brightness(1); filter: grayscale(0%); }
                                    }
                                    @keyframes fadeOut {
                                        0% { opacity: 0.5; }
                                        100% { opacity: 0; }
                                    }
                                `}</style>
                                <Bot className="hidden w-20 h-20 text-cyan-300 fallback-icon:block absolute" />
                            </div>
                        </div>

                        {/* Label / Status */}
                        <div className="mt-6 text-center transition-all duration-500">
                            <h2 className={cn(
                                "font-black tracking-widest uppercase mb-1 drop-shadow-lg transition-colors",
                                isLoading ? "text-orange-400 text-lg animate-pulse" : "text-white text-2xl"
                            )}>
                                {isLoading ? 'SEÑAL ENTRANTE...' : (messages.length === 0 ? 'NOVA SENTINEL' : '')}
                            </h2>
                            {messages.length === 0 && (
                                <p className="text-cyan-200/60 font-medium text-sm tracking-wide bg-black/20 px-4 py-1 rounded-full border border-white/5">
                                    {language === 'es' ? 'Soy tu Guía. Hazme una pregunta.' : 'I am your Guide. Ask me anything.'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* --- CHAT CONTENT AREA --- */}
                    {messages.length > 0 && (
                        <div className="w-full max-w-4xl mx-auto mt-6 space-y-8 pb-10">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={cn(
                                    "flex gap-5 animate-in fade-in slide-in-from-top-10 duration-700 font-medium",
                                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                )}>
                                    {/* Avatar Small */}
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-xl border-2 overflow-hidden",
                                        msg.role === 'user'
                                            ? 'bg-blue-600 border-blue-400'
                                            : 'bg-cyan-950 border-cyan-500'
                                    )}>
                                        {msg.role === 'user' ? (
                                            <span className="text-xl">🧑‍🚀</span>
                                        ) : (
                                            <img src="/images/nova_avatar_square.png" alt="Nova" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = ''; e.currentTarget.parentElement!.innerHTML = '<svg class="w-6 h-6 text-cyan-300" ... />' }} />
                                            // Fallback to simple icon if image missing, but try to use a 'cool' image if available. For now using Bot icon as safe fallback in code logic below
                                        )}
                                        {msg.role === 'assistant' && <Bot className="w-7 h-7 text-cyan-300" />}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={cn(
                                        "relative max-w-[85%] rounded-[2rem] px-8 py-6 text-lg shadow-2xl backdrop-blur-xl border transition-all hover:scale-[1.01]",
                                        msg.role === 'user'
                                            ? 'bg-gradient-to-br from-indigo-600/90 to-blue-700/90 border-blue-400/30 text-white rounded-tr-sm'
                                            : 'bg-slate-900/80 border-cyan-500/30 text-cyan-50 rounded-tl-sm shadow-[0_0_30px_rgba(8,145,178,0.15)]'
                                    )}>
                                        {msg.role === 'assistant' && (
                                            <div className="absolute -top-3 left-6 px-3 py-1 bg-cyan-950 border border-cyan-500/50 rounded-full flex items-center gap-2 shadow-lg">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest leading-none pt-0.5">TUTOR EN LÍNEA</span>
                                            </div>
                                        )}
                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Spark Questions (Chips) */}
                            {sparkQuestions.length > 0 && (
                                <div className="pl-16 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                                    {sparkQuestions.map((q, i) => {
                                        const cleanQ = q.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').replace(/[¿?]/g, '').trim();
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    playSound('click');
                                                    handleSendMessage(q);
                                                }}
                                                className="bg-slate-800/60 hover:bg-cyan-900/60 border border-cyan-500/20 text-cyan-100 p-4 rounded-xl text-sm font-bold text-left transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-3 group"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/40 transition-colors">
                                                    <Lightbulb className="w-4 h-4 text-cyan-300" />
                                                </div>
                                                {cleanQ}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Loading Ghost Bubble for UX */}
                            {isLoading && (
                                <div className="flex gap-5 animate-pulse pl-2">
                                    <div className="w-12 h-12 rounded-full border-2 border-orange-500/30 bg-orange-950/20 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                                    </div>
                                    <div className="h-12 w-48 bg-slate-800/50 rounded-[2rem] rounded-tl-sm flex items-center px-6">
                                        <span className="text-xs font-black text-orange-300 uppercase tracking-widest">Decodificando respuesta...</span>
                                    </div>
                                </div>
                            )}

                            <div id="messages-end" className="h-24" />
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
