import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLearning } from "@/context/LearningContext";
import { useAvatar } from "@/context/AvatarContext";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { MyHouseHub } from "@/components/MyHouse/MyHouseHub";
import { Settings, BarChart3, X, Store, BookOpen, Brain, FileText, Gamepad2, Mic, Sparkles, Newspaper, User, GraduationCap, Plus, Globe2, Coins, Building2, UserCircle2, Archive, HelpCircle, Medal, Star, Zap, ZapOff, Crown, MessageSquare } from "lucide-react";
import { LinaAvatar } from "@/components/MathMaestro/tutor/LinaAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ViewState, type Language } from "@/types";
import { RachelleAvatar, AvatarState } from "@/components/MathMaestro/tutor/RachelleAvatar";
import confetti from 'canvas-confetti';
import { sfx } from '@/services/soundEffects';
import TutorMascot from "@/components/tutor_mod/TutorMascot";
import ProgressBadges from "@/components/tutor_mod/ProgressBadges";
import WeaknessDetector from "@/components/tutor_mod/WeaknessDetector";
import ChatInterface from "@/components/tutor_mod/ChatInterface";
import { UniversalNotebook, type NoteData } from '@/components/Notebook/UniversalNotebook';
import { supabase } from "@/services/supabase";
import GamesHub_mod, { type GameType } from "@/components/tutor_mod/games/GamesHub_mod";
import FlashRace_mod from "@/components/tutor_mod/games/FlashRace_mod";
import GrammarQuest_mod from "@/components/tutor_mod/games/GrammarQuest_mod";
import StoryBuilder_mod from "@/components/tutor_mod/games/StoryBuilder_mod";
import PuzzleTimeline_mod from "@/components/tutor_mod/games/PuzzleTimeline_mod";
import ReceptionEditor from "@/components/LanguageCenter/ReceptionEditor";
import NovaStore_mod from "@/components/tutor_mod/NovaStore_mod";
import AssignmentIntake_mod, { type AssignmentAnalysis } from "@/components/tutor_mod/companion/AssignmentIntake_mod";
import StudyPlanGenerator_mod, { type StudySession } from "@/components/tutor_mod/companion/StudyPlanGenerator_mod";
import GuidedHelp_mod from "@/components/tutor_mod/companion/GuidedHelp_mod";
import PracticeEval_mod from "@/components/tutor_mod/companion/PracticeQuiz_mod";
import FlashcardsSpaced_mod from "@/components/tutor_mod/companion/FlashcardsSpaced_mod";
import TeacherReport_mod from "@/components/tutor_mod/companion/TeacherReport_mod";
import PronouncePlay_mod from "@/components/tutor_mod/companion/PronouncePlay_mod";
import ARVocabulary_mod from "@/components/tutor_mod/companion/ARVocabulary_mod";
import DailyNews_mod from "@/components/tutor_mod/companion/DailyNews_mod";
import TutorReports_mod from "@/components/tutor_mod/TutorReports_mod";
import { TutorReport } from "@/types/tutor";
import GradeLevelSelector_mod from "@/components/tutor_mod/GradeLevelSelector_mod";
import { useRewards } from "@/hooks/useRewards_mod";
import { usePersonalizedContent, generatePersonalizedFlashcards, generatePersonalizedEvalQuestions } from "@/hooks/usePersonalizedContent_mod";
import {
  sampleTutorReports,
  getOllieResponse,
  generatePersonalizedContent,
  gradeVocabulary
} from "@/lib/olliePersonality_mod";
import { getEnglishLevelConfig } from "@/data/englishCefrConfig";
import { SPANISH_PHONETIC_GUIDE } from "@/utils/phoneticsSpanish";
import { getEnglishPhraseTemplates } from "@/data/englishPhraseTemplates";
import { toast } from "sonner";
import { completeParentMission } from "@/services/supabase";
import { useGamification } from "@/context/GamificationContext";
import { generateSpeech } from '../services/edgeTTS';
import { callChatApi } from "@/services/ai_service";
import { notebookService } from '@/services/notebookService';
import { EnglishProgressWidget } from '@/components/tutor_mod/EnglishProgressWidget';
import { recordEnglishTutorCompletion } from '@/services/learningProgress';

import { BreakingNewsOverlay } from "@/components/tutor_mod/BreakingNewsOverlay";
import {
  getRandomGrammarChallenges,
  getRandomVocabulary,
  getRandomStoryTheme,
  getRandomReadingPassage,
  storyLibrary,
} from '@/data/englishContent';

interface Message {
  id: string;
  role: "tutor" | "student";
  content: string;
  type?: "text" | "game-prompt" | "correction" | "praise" | "personalized";
  emoji?: string;
  translation?: string;
  phonetic?: string;
  correction?: string;
  replyOptions?: string[];
  metadata?: {
    focusArea?: string;
    gradeLevel?: number;
    source?: string;
  };
}

type ViewType = 'chat' | 'placement-test' | 'games' | 'store' | 'assignment' | 'studyplan' | 'guidedhelp' | 'eval' | 'flashcards' | 'report' | 'pronunciation' | 'arvocab' | 'dailynews' | 'tutorreports' | 'gradeselect' | 'talk' | 'newcomer-academic' | 'newcomer-flashrace' | 'newcomer-listening' | 'newcomer-matching' | 'newcomer-fill' | GameType;

const PLACEMENT_TEST_QUESTIONS = [
  // 1-5: Basic Vocabulary (A1 focus)
  { id: 1, type: 'multiple', question: "What is this? 🐶", options: ["Dog", "Cat", "Bird"], answer: "Dog", points: 5 },
  { id: 2, type: 'multiple', question: "Which color is an Apple? 🍎", options: ["Red", "Blue", "Green"], answer: "Red", points: 5 },
  { id: 3, type: 'multiple', question: "How many fingers do you have? 🖐️", options: ["Two", "Five", "Ten"], answer: "Five", points: 5 },
  { id: 4, type: 'multiple', question: "Which one is a fruit? 🍌🥦🧀", options: ["Cheese", "Broccoli", "Banana"], answer: "Banana", points: 5 },
  { id: 5, type: 'multiple', question: "What do you use to write? ✏️", options: ["Pencil", "Book", "Chair"], answer: "Pencil", points: 5 },
  // 6-10: Basic Grammar (A2 focus)
  { id: 6, type: 'multiple', question: "I ____ a student.", options: ["am", "is", "are"], answer: "am", points: 10 },
  { id: 7, type: 'multiple', question: "She ____ milk every day.", options: ["drink", "drinks", "drinking"], answer: "drinks", points: 10 },
  { id: 8, type: 'multiple', question: "____ they like pizza?", options: ["Do", "Does", "Is"], answer: "Do", points: 10 },
  { id: 9, type: 'multiple', question: "My car is ____ than your car.", options: ["fast", "faster", "fastest"], answer: "faster", points: 10 },
  { id: 10, type: 'multiple', question: "We ____ to the park yesterday.", options: ["go", "goes", "went"], answer: "went", points: 10 },
  // 11-15: Reading/Context (B1 focus)
  { id: 11, type: 'multiple', question: "Which sentence is correct?", options: ["I like eat pizza", "I likes eating pizza", "I like eating pizza"], answer: "I like eating pizza", points: 15 },
  { id: 12, type: 'multiple', question: "If it rains, I ____ at home.", options: ["stay", "will stay", "stayed"], answer: "will stay", points: 15 },
  { id: 13, type: 'multiple', question: "I have ____ London three times.", options: ["be to", "been to", "gone to"], answer: "been to", points: 15 },
  { id: 14, type: 'multiple', question: "What is the opposite of 'Brave'?", options: ["Strong", "Afraid", "Smart"], answer: "Afraid", points: 15 },
  { id: 15, type: 'multiple', question: "Which one is a job?", options: ["Teacher", "School", "Learning"], answer: "Teacher", points: 15 },
];

const sampleSubjects = [
  { subject: "Science", emoji: "🔬", score: 72, trend: "up" as const, weaknesses: ["Scientific vocabulary", "Past tense"] },
  { subject: "History", emoji: "📜", score: 58, trend: "down" as const, weaknesses: ["Connecting words", "Dates in English"] },
  { subject: "Math", emoji: "🔢", score: 85, trend: "stable" as const, weaknesses: ["Word problems"] },
  { subject: "Art", emoji: "🎨", score: 90, trend: "up" as const, weaknesses: [] },
];

// Dynamic content from library (refreshed on component mount)
const getFlashRaceWords = () => getRandomVocabulary(10);
const getGrammarChallenges = (grade: number) => getRandomGrammarChallenges(5, grade);
const getStoryTheme = () => getRandomStoryTheme();
const getReadingPassage = (grade: number) => getRandomReadingPassage(grade);

// --- VOICE CHAT COMPONENT (LOW COST OPTIMIZED) ---
const TalkInterface = ({
  onBack,
  studentName,
  gradeLevel,
  contextData,
  immersionMode,
  englishLevel = 'A1',
  userAvatar,
  learnedWords
}: {
  onBack: () => void,
  studentName: string,
  gradeLevel: number,
  contextData: any[],
  learnedWords: string[],
  immersionMode: 'bilingual' | 'standard',
  englishLevel?: 'UNKNOWN' | 'A1' | 'A2' | 'B1' | 'B2',
  userAvatar?: string | null
}) => {
  const englishLevelConfig = useMemo(() => getEnglishLevelConfig(englishLevel as any), [englishLevel]);
  const englishPhraseTemplates = useMemo(() => getEnglishPhraseTemplates(englishLevel as any), [englishLevel]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [turnsLeft, setTurnsLeft] = useState(20);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [hint, setHint] = useState<{ en: string, es: string, phonetic?: string } | null>(null);

  // NEW: History for Notebook
  const [history, setHistory] = useState<{ role: 'student' | 'tutor', text: string, translation?: string }[]>([]);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  // Audio Playback Ref
  const audioContextReff = useState<AudioContext | null>(null);

  // Recognition Ref (useRef for proper mutable reference)
  const recognitionRef = useRef<any>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const [noSpeechCount, setNoSpeechCount] = useState(0);
  const audioIntervalRef = useRef<any>(null);

  // Toggle mode vs Hold mode
  const [isToggleMode, setIsToggleMode] = useState(true);
  const [isHandsFree, setIsHandsFree] = useState(false); // NEW: Auto-restart mic
  const transcriptRef = useRef("");
  const statusRef = useRef<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const isHandsFreeRef = useRef(false);
  const processVoiceInputRef = useRef<any>(null);

  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { isHandsFreeRef.current = isHandsFree; }, [isHandsFree]);

  // Play random welcome on mount
  useEffect(() => {
    const welcomes = immersionMode === 'standard'
      ? [
        { en: "Hello champion! Ready to learn some English today? Let's go!", es: "¡Hola campeón! ¿Listo para aprender algo de inglés hoy? ¡Vamos!", phonetic: "Jelóu chámpion! Rédy tu lérn sam ínglish tudéy? Lets góu!", hint_en: "Hello Rachelle! I am ready.", hint_es: "¡Hola Rachelle! Estoy listo.", hint_phonetic: "Jelóu Rachél! Ái am rédy." },
        { en: "I'm Rachelle. Today we will practice English together. Ready?", es: "Soy Rachelle. Hoy practicaremos inglés juntos. ¿Listo?", phonetic: "Áim Rachél. Tudéy uí uíl práctis ínglish tugüéder. Rédy?", hint_en: "I am ready to practice!", hint_es: "¡Estoy listo para practicar!", hint_phonetic: "Ái am rédy tu práctis!" },
        { en: "Welcome to the studio! I have new words for you today. Ready?", es: "¡Bienvenido al estudio! Tengo nuevas palabras para ti hoy. ¿Listo?", phonetic: "Uélcam tu de stiúdio! Ái jäv niú uórds for iú tudéy. Rédy?", hint_en: "Let's learn new words!", hint_es: "¡Aprendamos palabras nuevas!", hint_phonetic: "Lets lérn niú uórds!" },
        { en: "Hi! It's Rachelle. Let's practice pronunciation. Shall we start?", es: "¡Hola! Soy Rachelle. Practiquemos la pronunciación. ¿Empezamos?", phonetic: "Jái! Its Rachél. Lets práctis prononsiéishon. Shäl uí stárt?", hint_en: "Yes, let's start!", hint_es: "¡Sí, empecemos!", hint_phonetic: "Yiés, lets stárt!" },
        { en: "I'm so happy to see you! Today we will learn new vocabulary. Ready?", es: "¡Qué alegría verte! Hoy aprenderemos vocabulario nuevo. ¿Listo?", phonetic: "Áim sóu jápy tu sí iú! Tudéy uí uíl lérn niú vocábiulary. Rédy?", hint_en: "I am ready to learn!", hint_es: "¡Estoy listo para aprender!", hint_phonetic: "Ái am rédy tu lérn!" }
      ]
      : [
        { en: "Hello champion! Ready to build amazing stories in English today?", es: "¡Hola campeón! ¿Listo para crear historias increíbles en inglés?", phonetic: "Jelóu chámpion! Rédy tu bíld améisin stóris in ínglish tudéy?", hint_en: "Yes, I am!", hint_es: "¡Sí, estoy listo!", hint_phonetic: "Yiés, ái am!" },
        { en: "Hi there! I'm so glad you're back. Let's practice our pronunciation together!", es: "¡Hola! Me alegra que vuelvas. ¡Practiquemos la pronunciación juntos!", phonetic: "Jái dder! Áim sóu gläd iúr bäk. Lets práctis áu-ar prononsiéishon tugüéder!", hint_en: "Hello! Let's practice.", hint_es: "¡Hola! Practiquemos.", hint_phonetic: "Jelóu! Lets práctis." },
        { en: "Welcome to the English Studio! I've missed our learning sessions. What should we explore first?", es: "¡Bienvenido al estudio! Extrañé nuestras sesiones. ¿Qué exploramos primero?", phonetic: "Uélcam tu de ínglish stiúdio! Áiv mísd áu-ar lérnin séshons. Uát shud uí esplór férst?", hint_en: "Let's explore new words!", hint_es: "¡Exploremos nuevas palabras!", hint_phonetic: "Lets esplór niú uórds!" },
        { en: "Hi! It's Rachelle! I have some exciting new vocabulary for your school subjects today. Ready?", es: "¡Hola! Soy Rachelle. Tengo vocabulario nuevo emocionante para tus materias. ¿Listo?", phonetic: "Jái! Its Rachél! Ái jäv sam esáitin niú vocábiulary for iúr scúl sábjects tudéy. Rédy?", hint_en: "I am ready!", hint_es: "¡Estoy listo!", hint_phonetic: "Ái am rédy!" },
        { en: "Hello, reporter! Welcome to your news booth. I'm excited to hear your voice again!", es: "¡Hola, reportero! Bienvenido a tu cabina de noticias. ¡Qué emoción oírte!", phonetic: "Jelóu, repórter! Uélcam tu iúr niús búd. Áim esáitid tu jíiar iúr vóis aquén!", hint_en: "Hello Rachelle!", hint_es: "¡Hola Rachelle!", hint_phonetic: "Jelóu Rachél!" }
      ];
    const randomWelcome = welcomes[Math.floor(Math.random() * welcomes.length)];
    setResponse(randomWelcome.en);
    setTranslation(randomWelcome.es);
    setPhonetic(randomWelcome.phonetic || "");
    if (randomWelcome.hint_en) {
      setHint({
        en: randomWelcome.hint_en,
        es: randomWelcome.hint_es || "",
        phonetic: randomWelcome.hint_phonetic || ""
      });
    }

    const playWelcome = async () => {
      setStatus('speaking');
      try {
        await generateSpeech(randomWelcome.en, 'rachelle');
        if (immersionMode === 'standard' && randomWelcome.es) {
          // Speak translation for support
          await generateSpeech(randomWelcome.es, 'lina');
        }
      } catch (e: any) {
        if (e.message !== 'interrupted') {
          console.error("Welcome playback failed", e);
        }
      } finally {
        setStatus('idle');
        // Clear response after a moment so it doesn't stay forever
        setTimeout(() => {
          setResponse("");
          setTranslation("");
          setPhonetic("");
          setHint(null);
        }, 8000);

        if (isHandsFreeRef.current) {
          setTimeout(startListening, 500);
        }
      }
    };

    const timer = setTimeout(playWelcome, 1000);
    return () => clearTimeout(timer);
  }, [immersionMode]);

  const [inputLang, setInputLang] = useState<'en' | 'es'>(immersionMode === 'standard' ? 'es' : 'en');

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      // Force continuous=false for better stability on single turns
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = inputLang === 'en' ? 'en-US' : 'es-MX';

      recognition.onstart = () => {
        setStatus('listening');
        setMicError(null);
        setNoSpeechCount(0); // Reset on start success
        startVisualizer();
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

        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          setTranscript(currentText);
          transcriptRef.current = currentText; // Update ref immediately for callbacks
        }

        if (!recognition.continuous && event.results[0].isFinal) {
          stopVisualizer();
          if (processVoiceInputRef.current) {
            processVoiceInputRef.current(event.results[0][0].transcript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Err:", event.error);
        stopVisualizer();
        setStatus('idle');

        if (event.error === 'no-speech') {
          setNoSpeechCount(prev => {
            const next = prev + 1;
            if (next >= 4) {
              setIsHandsFree(false); // Stop auto-mic loop
              toast.info("El micrófono está en silencio. ¡Prueba a escribir!");
            }
            return next;
          });
        } else if (event.error === 'not-allowed') {
          setMicError("Microphone blocked");
          toast.error("Por favor permite el acceso al micrófono en la configuración del navegador.");
        }
      };

      recognition.onend = () => {
        stopVisualizer();
        // USAR REFS para evitar stale closure
        const currentStatus = statusRef.current;
        const currentText = transcriptRef.current;

        console.log("Recognition ended. Status:", currentStatus, "Text:", currentText);

        if (currentStatus === 'listening' && currentText && currentText.trim().length > 1) {
          if (processVoiceInputRef.current) {
            processVoiceInputRef.current(currentText);
          }
        } else if (currentStatus === 'listening') {
          setStatus('idle');
        }
      };

      recognitionRef.current = recognition;
    } else {
      toast.error("Voice not supported in this browser. Use Chrome or Edge.");
    }

    return () => {
      stopVisualizer();
      recognitionRef.current?.stop();
    };
  }, [inputLang, isToggleMode, isHandsFree]);

  const startVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;
        setMicLevel(average);
      }, 50);
    } catch (e) {
      console.error("Visualizer error", e);
    }
  };

  const stopVisualizer = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    setMicLevel(0);
  };

  const startListening = () => {
    if (turnsLeft <= 0) {
      toast.error("Daily voice limit reached! Let's chat by text.");
      return;
    }
    if (status !== 'idle') return;

    // Reset transcript for new session
    setTranscript("");
    transcriptRef.current = "";

    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.error("Recognition start failed", e);
      // It might already be running
      setStatus('listening');
    }
  };

  const stopListening = () => {
    if (status !== 'listening') return;
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.error("Recognition stop failed", e);
    }

    // Fallback: Si el stop no dispara onresult final rápido, forzamos proceso con lo que tengamos
    const currentText = transcriptRef.current;
    if (currentText && currentText.trim().length > 1) {
      setTimeout(() => {
        if (statusRef.current === 'listening') {
          processVoiceInput(currentText);
        }
      }, 500);
    }
  };

  const toggleListening = () => {
    if (status === 'listening') stopListening();
    else startListening();
  };

  const processVoiceInput = async (text: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (process as any).env?.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      alert("Falta la API Key de Gemini. Configure VITE_GEMINI_API_KEY en .env");
      setStatus('idle');
      return;
    }

    // 0. ECHO CANCELLATION & LOOP PREVENTION
    const cleanInput = text.toLowerCase().trim();
    // Check against last few messages to prevent immediate looping
    const recentHistory = history.slice(-3);
    const isEcho = recentHistory.some(h =>
      (h.text || "").toLowerCase().includes(cleanInput) ||
      (h.translation || "").toLowerCase().includes(cleanInput)
    );

    if (!text || text.trim().length < 2 || isEcho) {
      console.log("Input ignored (empty or echo):", text);
      setStatus('idle');
      if (isHandsFreeRef.current) {
        setTimeout(startListening, 500);
      }
      return;
    }

    setStatus('processing');
    setTurnsLeft(prev => prev - 1);

    // Add to history
    setHistory(prev => [...prev, { role: 'student', text }]);

    try {
      // 1. Enhanced Academic Context Injection
      const contextSummary = contextData.map(r => `${r.subject}: ${r.trend}`).join(', ');
      const weakAreas = contextData.flatMap(r => r.weaknesses || []).join(', ');

      const prompt = `
        You are 'Rachelle', an enthusiastic English tutor for ${studentName}, a ${gradeLevel}th grader.
        The student is using ${inputLang === 'es' ? 'Spanish' : 'English'} to speak to you.
        IMPORTANT: Start directly with your response.
        REAL CONTEXT (Reinforce these learned words): ${learnedWords.join(', ')}.
        STUDENT PROGRESS: ${contextData.map(r => `${r.subject}: ${r.trend}`).join(', ')}.

        TEACHING STYLE: 'THE ENGLISH ENCOURAGER'
        - If the student speaks Spanish, acknowledge they were understood: "I understand! That is [Spanish word]..."
        - IMMEDIATELY guide them to the English version: "...but in the English Studio, we say [English word]! Can you try saying that?"
        - Never be strict, but be persistent in asking them to repeat the English phrase.
        - If they mention things from the 'Farm' or 'House', show excitement! (e.g., "Oh! You saw the Cow at the farm? That's amazing!")

        CURRENT CEFR LEVEL: ${englishLevel}.

        PEDAGOGICAL DESIGN FOR ${englishLevel} (Non-bilingual school):
        - VOCABULARY DOMAINS: ${englishLevelConfig.vocabDomains.join(', ')}.
        - GRAMMAR POINTS: ${englishLevelConfig.grammarPoints.join('; ')}.
        - MAX SENTENCE LENGTH: ${englishLevelConfig.maxSentenceWords} words.
        - MAX NEW WORDS PER TURN: ${englishLevelConfig.maxNewWordsPerTurn}.
        ${englishLevel === 'A1' ? `
        - VOCABULARY: Only colors, animals, numbers 1-20, family, basic classroom objects, very simple feelings.
        - GRAMMAR: "To be", "To have", "To like", present simple only (no past).
        - SENTENCE LENGTH: 2-5 words maximum. No complex clauses.
        - TONE: Extremely slow and clear. Repeat key words.
        - EXAMPLE: "My name is Ana. I am 8."` : ''}
        ${englishLevel === 'A2' ? `
        - VOCABULARY: Daily routines, hobbies, food, parts of the house, town/city, basic adjectives.
        - GRAMMAR: Present simple, present continuous, very controlled past simple (was/were, went, played).
        - SENTENCE LENGTH: 5-8 words. Use "and / but / because".
        - TONE: Patient and encouraging.` : ''}
        ${englishLevel === 'B1' ? `
        - VOCABULARY: School subjects in detail, technology, environment, hobbies, simple abstract nouns (problem, reason, idea).
        - GRAMMAR: Solid past simple, future with "going to / will", present perfect in fixed phrases, first conditional.
        - SENTENCE LENGTH: 8-12 words. Use connectors like "because / so / then / after that".
        - TONE: Natural conversational, but still very clear.` : ''}
        ${englishLevel === 'B2' ? `
        - VOCABULARY: Opinions, pros/cons, projects, global topics (climate, technology, healthy lifestyle).
        - GRAMMAR: Confident present perfect, conditionals 0/1, relative clauses ("who/that"), richer connectors ("however / although / therefore / in addition").
        - SENTENCE LENGTH: Normal conversational, short paragraphs.
        - TONE: Natural, slightly more challenging, but always supportive.` : ''}

        TURN-TAKING AND CONVERSATION SPACE:
        - Keep your turns SHORT: usually 1–2 sentences in A1/A2, 2–3 in B1/B2.
        - ALWAYS leave space for the child to speak: END EVERY TURN with a very simple question or invitation to answer (e.g. "Do you like...?", "What about you?", "Can you tell me?", "Your turn!").
        - CRITICAL RULE: NEVER answer your own question. Ask, then STOP entirely and wait for the child's input. Do NOT simulate the child's response.
        - If the child is very quiet or only writes one word, react kindly and ask an even simpler follow-up question.

        SENTENCE PATTERN FAMILIES FOR LEVEL ${englishLevel} (USE THEM AS MODELS, NOT AS A SCRIPT):
        - You MUST sound like a real conversation with ${studentName}: react to what the child says, ask follow-up questions, and sometimes add small comments.
        - Use the patterns below to build MANY different sentences, mixing subjects (I / you / my family / my friends), simple time words (today, yesterday, at the weekend), and short connectors (and / but / because).
        - DO NOT repeat the same sentence many times; create natural variations that stay inside the patterns and grammar for ${englishLevel}.
        - For A1/A2, keep the feeling of a simple chat: short turns, lots of encouragement, and questions about the child’s real life.
        - Remember that the long-term GOAL is that this child can reach B2 at the end of primary, so very slowly recycle and combine older patterns when the student is ready.

        SENTENCE PATTERN EXAMPLES (GROUPED BY TOPIC):
        ${englishPhraseTemplates.groups.map((g: any) => `- TOPIC: ${g.topic} → ${g.examples.join(' | ')}`).join('\n')}
        
        ${immersionMode === 'standard' ?
          `PEDAGOGICAL MODE: BRIDGE (For non-bilingual schools).
           - Approximate Spanish support ratio: ${Math.round(englishLevelConfig.bridgeSpanishRatio * 100)}% of the time in your explanations.
           - All turns MUST be bilingual: "content" in English + "translation" in Spanish + "phonetic" in Spanish spelling.
           - Use Spanish to explain new grammar or difficult words, but keep examples in English.
           - Limit NEW words per turn to ${englishLevelConfig.maxNewWordsPerTurn}.
           - "suggested" MUST be a very short and realistic English practice phrase (max 3 words for A1, max 5 for A2, max 8 for B1/B2).` :
          `PEDAGOGICAL MODE: BILINGUAL IMMERSION (for bilingual schools).
           - Speak 100% in English (NO Spanish translation, except inside "correction" when absolutely necessary).
           - Use simple structures appropriate for ${englishLevel}.
           - "suggested" is a short English phrase the child can say back.
        
        LOGICAL CONSISTENCY RULE:
        - If you ask a specific question (e.g., "What is your favorite song?"), the "suggested" phrase MUST be a specific answer (e.g., "My favorite song is Yellow.").
        - DO NOT suggest a general category (like "Pop") if you asked for a specific item (like "a song").
        - The phrase must be very short and easy to say for level ${englishLevel}.`}

        PHONETIC RULES (YOU MUST FOLLOW THESE WHEN WRITING "phonetic" AND "suggested_phonetic"):
        ${SPANISH_PHONETIC_GUIDE}

        JSON FORMAT ONLY:
        {
          "content": "English response",
          "translation": "Spanish translation",
          "phonetic": "Escritura fonética del contenido (Connected Speech).",
          "correction": "Explicación breve en español si hubo error, sino null.",
          "suggested": "Short practice phrase for the student",
          "suggested_es": "Spanish translation of the phrase",
          "suggested_phonetic": "FONÉTICA DE CORRIDO para la frase sugerida. Escribe cómo suena la frase pegando las palabras (Connected Speech) usando ortografía española (e.g. 'Not at all' -> 'Nora-ral', 'What do you' -> 'Uara-yu'). ESTO ES LO MÁS IMPORTANTE."
        }
      `;

      // 2. Cheap Brain (GPT-4o-mini)
      let aiResponse: {
        content: string,
        translation: string,
        phonetic: string,
        correction: string | null,
        suggested: string,
        suggested_es: string,
        suggested_phonetic: string
      };
      try {
        // Map history to API format
        const conversationHistory = history.map(h => ({
          role: (h.role === 'tutor' ? 'assistant' : 'user') as "assistant" | "user",
          content: h.text
        }));

        const aiRes = await callChatApi(
          [
            { role: "system", content: prompt },
            ...conversationHistory,
            { role: "user", content: text }
          ],
          "gpt-4o-mini",
          true // JSON MODE
        );
        aiResponse = JSON.parse(aiRes.choices[0].message.content);
      } catch (apiErr) {
        console.warn("Voice API fallback:", apiErr);
        aiResponse = immersionMode === 'standard'
          ? {
            content: "Great job! Let's keep practicing.",
            translation: "¡Buen trabajo! Sigamos practicando.",
            phonetic: "Greit-yob! Lets kip practisin.",
            correction: null,
            suggested: "Let's keep practicing",
            suggested_es: "Sigamos practicando",
            suggested_phonetic: "Lets-kip-practisin"
          }
          : {
            content: "Great job! Let's keep practicing.",
            translation: "",
            phonetic: "Greit-yob! Lets kip practisin.",
            correction: null,
            suggested: "Let's keep practicing",
            suggested_es: "",
            suggested_phonetic: "Lets-kip-practisin"
          };
      }

      setResponse(aiResponse.content);
      setTranslation(aiResponse.translation);
      setPhonetic(aiResponse.phonetic);
      setHint({
        en: aiResponse.suggested,
        es: aiResponse.suggested_es || "",
        phonetic: aiResponse.suggested_phonetic
      });
      setNoSpeechCount(0); // Success! Reset errors
      setHistory(prev => [...prev, {
        role: 'tutor',
        text: aiResponse.content,
        translation: aiResponse.translation,
        phonetic: aiResponse.phonetic,
        correction: aiResponse.correction
      }]);

      // 3. Voice Narration (Sequence: English -> Spanish if non-bilingual)
      setStatus('speaking');

      try {
        // Speak English part (Rachelle)
        await generateSpeech(aiResponse.content, 'rachelle');

        // If non-bilingual, play translation as well (Lina)
        if (immersionMode === 'standard' && aiResponse.translation) {
          await generateSpeech(aiResponse.translation, 'lina');
        }
      } catch (e: any) {
        if (e.message !== 'interrupted') {
          console.error("Narration failed", e);
        }
      } finally {
        setStatus('idle');
        // Clear response after it's been shown for a while
        setTimeout(() => {
          setResponse("");
          setTranslation("");
          setPhonetic("");
          setHint(null);
        }, 8000);

        if (isHandsFreeRef.current) {
          setTimeout(startListening, 500);
        }
      }

    } catch (err) {
      console.error("Voice Chain Error:", err);
      setStatus('idle');
    }
  };

  // Keep Ref updated to avoid stale closures in SpeechRecognition callbacks
  useEffect(() => {
    processVoiceInputRef.current = processVoiceInput;
  }, [processVoiceInput]);

  return (
    <div className="w-full max-w-5xl mx-auto p-2 md:p-6 relative min-h-[700px] flex flex-col items-center">
      {/* NEWSPAPER PAGE BACKGROUND */}
      <div className="absolute inset-0 bg-[#fffdf5] rounded-[2rem] border-4 border-black shadow-[8px_8px_0_0_#000] overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-300 rounded-bl-full border-b-4 border-l-4 border-black z-0"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-200 rounded-tr-full border-t-4 border-r-4 border-black z-0"></div>
      </div>

      {/* HEADER SECTION */}
      <div className="relative z-10 w-full mb-8 pt-4 px-4 flex flex-col items-center">
        <div className="w-full flex justify-between mb-4">
          <Button variant="ghost" onClick={onBack} className="bg-white border-2 border-black shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] transition-all text-black font-bold">
            {immersionMode === 'standard' ? '← SALIR' : '← EXIT'}
          </Button>
          <Button onClick={() => setIsNoteOpen(true)} className="bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] transition-all font-bold gap-2">
            <span>💾</span> {immersionMode === 'standard' ? 'GUARDAR' : 'SAVE'}
          </Button>
        </div>

        <div className="bg-white px-8 py-4 border-4 border-black shadow-[6px_6px_0_0_#000] -rotate-1 mb-2">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-black leading-none text-center">
            THE <span className="text-rose-500">NOVA</span> <span className="text-cyan-500">TIMES</span>
          </h1>
          <div className="flex justify-between border-t-4 border-black mt-2 pt-1 text-[10px] md:text-xs font-black uppercase tracking-widest w-full gap-8">
            <span>VOL. 1 • SPECIAL EDITION</span>
            <span>{new Date().toLocaleDateString()}</span>
            <span>PRICE: 1 SMILE</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT COLUMNS */}
      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 pb-8 flex-1">
        {/* LEFT COLUMN: AVATAR */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="bg-white p-3 border-4 border-black shadow-[8px_8px_0_0_#000] rotate-1 hover:rotate-0 transition-transform duration-300 w-full max-w-sm">
            <div className="flex justify-between items-center mb-2 border-b-2 border-black pb-1">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse border border-black"></span>
                <span className="text-xs font-black text-red-500 uppercase">LIVE REPORT</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">CH. 1</span>
            </div>

            <div className="relative aspect-square bg-sky-100 border-2 border-black overflow-hidden flex items-center justify-center">
              <div className={`absolute inset-0 ${status === 'listening' ? 'bg-rose-100' : 'bg-emerald-100'} opacity-50`}></div>
              <RachelleAvatar state={status === 'speaking' ? 'speaking' : 'idle'} size={220} />
              {status === 'listening' && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-rose-500/10 flex items-end justify-center pb-2 gap-1 border-t-2 border-black">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 bg-rose-500 border border-black rounded-t-full"
                      animate={{ height: [`10%`, `${30 + micLevel * 1.5}%`, `10%`] }}
                      transition={{ repeat: Infinity, duration: 0.2 + (i * 0.05) }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-2 bg-yellow-200 border-2 border-black p-2 text-center">
              <p className="font-black text-sm uppercase">MISS RACHELLE</p>
              <p className="text-[10px] font-bold text-slate-700">YOUR ENGLISH TUTOR</p>
            </div>
          </div>

          {noSpeechCount >= 3 && status === 'idle' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 flex gap-2 w-full max-w-xs">
              <input
                type="text"
                placeholder={immersionMode === 'standard' ? "Escribe aquí..." : "Type here..."}
                className="flex-1 bg-white border-4 border-black px-4 py-2 font-bold shadow-[4px_4px_0_0_#000] focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    processVoiceInput((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Button onClick={(e) => {
                const input = (e.currentTarget.previousSibling as HTMLInputElement).value;
                if (input) {
                  processVoiceInput(input);
                  (e.currentTarget.previousSibling as HTMLInputElement).value = '';
                }
              }} className="bg-black text-white border-2 border-black">OK</Button>
            </motion.div>
          )}
        </div>

        {/* RIGHT COLUMN: CHAT */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative min-h-[180px] flex flex-col justify-center">
            <div className="absolute -top-3 -left-3 bg-yellow-400 border-2 border-black px-4 py-1 transform -rotate-2 shadow-sm font-black text-sm uppercase">BREAKING NEWS</div>
            <AnimatePresence mode="wait">
              {(status === 'speaking' || (status === 'idle' && response)) ? (
                <motion.div key="response" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <p className="text-3xl md:text-4xl font-black text-black leading-tight tracking-tight">"{response}"</p>
                  {translation && (
                    <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-300">
                      <p className="text-xl text-slate-500 font-bold italic font-serif">"{translation}"</p>
                      {phonetic && (
                        <div className="mt-3 flex justify-center">
                          <div className="bg-yellow-100 px-4 py-1.5 rounded-full border-2 border-yellow-400 shadow-sm flex items-center gap-2 transform -rotate-1">
                            <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">📢 DILO ASÍ:</span>
                            <span className="text-sm font-bold text-slate-800 font-mono tracking-wide">"{phonetic}"</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : status === 'processing' ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Sparkles className="w-8 h-8 text-cyan-500 animate-spin" />
                  <p className="font-black text-xl text-slate-400 animate-pulse">WRITING STORY...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
                  <p className="font-black text-2xl text-slate-400 uppercase tracking-tighter leading-none italic">
                    Press the microphone and speak to Miss Rachelle! 🎤
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-black p-6 border-4 border-white shadow-[8px_8px_0_0_rgba(0,0,0,0.2)] transform rotate-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-mono text-xs uppercase bg-rose-500 px-2 py-0.5 font-bold">YOUR QUOTE</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
              </div>
            </div>
            <p className="text-white font-mono text-xl md:text-2xl leading-relaxed">
              {transcript ? `"${transcript}"` : (status === 'listening' ? "..." : "Press the mic to start your story!")}
            </p>
          </div>

          <AnimatePresence>
            {hint && status === 'idle' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-yellow-100 border-2 border-black border-dashed p-4 relative">
                <div className="absolute -top-3 left-4 bg-white border-2 border-black px-2 py-0.5 text-[10px] font-bold uppercase rotate-2">PRO TIP</div>
                <p className="text-center font-bold text-slate-500 text-xs uppercase mb-1">Try saying this phrase:</p>
                <p className="text-center font-black text-xl text-black mb-2">"{hint.en}"</p>
                {hint.es && <p className="text-center text-sm font-bold text-slate-500 italic mb-2">"{hint.es}"</p>}
                {hint.phonetic && (
                  <div className="flex justify-center">
                    <span className="bg-white border border-black px-2 py-0.5 text-xs font-mono font-bold text-slate-700 shadow-[2px_2px_0_0_#000] transform -rotate-1">🗣️ {hint.phonetic}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto pt-4 flex justify-between items-center border-t-4 border-black">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase">ENERGY LEVEL:</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-4 h-6 border border-black ${i < Math.ceil(turnsLeft / 4) ? 'bg-green-400' : 'bg-slate-200'}`}></div>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-500 ml-2">{turnsLeft}/20</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PAGE 1 OF 1</div>
          </div>
        </div>
      </div>

      <UniversalNotebook
        isOpen={isNoteOpen}
        onClose={() => setIsNoteOpen(false)}
        language="en"
        onSave={(data: NoteData) => { notebookService.saveNote({ ...data, subject: 'english' }); }}
        getNoteData={() => {
          const isDemo = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
          if (isDemo && history.length === 0) {
            return {
              topic: "Conversation Practice: Daily Routine",
              date: new Date().toLocaleDateString(),
              subject: 'english',
              summary: "Student practiced talking about their morning routine.",
            };
          }
          return {
            topic: "English Voice Session",
            date: new Date().toLocaleDateString(),
            subject: 'english',
            summary: history.length > 0 ? history.map(h => `${h.role === 'student' ? 'Student' : 'Rachelle'}: ${h.text}`).join('\n\n') : "No conversation yet."
          };
        }}
        onStudy={(data: NoteData) => { setIsNoteOpen(false); toast.info("Study Buddy Activated! Rachelle is ready to evaluate you."); }}
      />

      {/* FLOATING MIC BUTTON: Arreglado para que se vea y sea gigante */}
      <div className="absolute bottom-24 right-8 z-[60] flex flex-col items-center gap-2">
        <motion.button
          onClick={toggleListening}
          className={cn(
            "w-24 h-24 rounded-full border-4 border-black shadow-[10px_10px_0_0_#000] flex items-center justify-center transition-all active:translate-y-1 active:shadow-none relative group",
            status === 'listening' ? "bg-rose-500 animate-pulse" :
              status === 'processing' ? "bg-amber-400" :
                "bg-cyan-400 hover:bg-cyan-300"
          )}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Animated rings for listening */}
          {status === 'listening' && (
            <div className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-50" />
          )}

          {status === 'processing' ? (
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Mic className={cn("w-12 h-12 text-black transition-transform", status === 'listening' && "scale-110")} />
          )}
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-black text-white text-xs font-black px-4 py-1.5 uppercase tracking-[0.2em] shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] rotate-2 border-2 border-white"
        >
          {status === 'listening' ? 'LISTEN!' : status === 'processing' ? 'Thinking...' : 'SPEAK NOW!'}
        </motion.div>
      </div>
    </div>
  );
};

const EnglishTutor_mod = ({ onNavigate }: { onNavigate?: (view: any) => void }) => {
  const { balance, refreshBalance } = useRewards();
  const { language, setLanguage, immersionMode, setImmersionMode, englishLevel, setEnglishLevel } = useLearning();
  const { currentAvatar: userAvatar } = useAvatar();
  const englishLevelConfig = useMemo(() => getEnglishLevelConfig(englishLevel), [englishLevel]);
  const englishPhraseTemplates = useMemo(() => getEnglishPhraseTemplates(englishLevel), [englishLevel]);
  const [studentName, setStudentName] = useState("Student");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeView, setActiveView] = useState<ViewType | 'house'>('chat');
  const [studentProgress, setStudentProgress] = useState({ points: 0, streak: 5, badges: ["vocabulary", "grammar", "reading"] });
  const [currentAnalysis, setCurrentAnalysis] = useState<AssignmentAnalysis | null>(null);
  const [helpTopic, setHelpTopic] = useState("grammar");
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [activeMission, setActiveMission] = useState<any>(null);
  const { addCoins: addGlobalCoins, addXP: addGlobalXP } = useGamification();
  const { getRecentVocabulary, recentActivity } = useLearningProgress();
  const [userId, setUserId] = useState<string | null>(null);

  // Dynamic content state
  const [dynamicFlashWords, setDynamicFlashWords] = useState(() => getFlashRaceWords());
  const [dynamicGrammar, setDynamicGrammar] = useState(() => getGrammarChallenges(3));
  const [dynamicStoryTheme, setDynamicStoryTheme] = useState(() => getStoryTheme());
  const [dynamicReading, setDynamicReading] = useState(() => getReadingPassage(3));

  // Personalized learning state (must be before any effect that uses gradeLevel)
  const [gradeLevel, setGradeLevel] = useState<number>(3);
  const { reports: tutorReports } = useLearning();


  const [showReports, setShowReports] = useState(false);
  const [newcomerMode, setNewcomerMode] = useState(false);

  // --- PLACEMENT TEST STATES ---
  const [placementTestStep, setPlacementTestStep] = useState(-1);
  const [placementTestScore, setPlacementTestScore] = useState(0);
  const [showOralPhaseResult, setShowOralPhaseResult] = useState(false);





  // Get user profile data
  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        setUserId(data.user.id);
        // Fetch student name from profile
        supabase
          ?.from('profiles')
          .select('full_name, nickname')
          .eq('id', data.user.id)
          .single()
          .then(res => {
            if (res.data) {
              setStudentName(res.data.nickname || res.data.full_name?.split(' ')[0] || "Student");
            }
          });
      }
    });
  }, []);

  // Refresh dynamic content when grade changes
  useEffect(() => {
    setDynamicGrammar(getGrammarChallenges(gradeLevel));
    setDynamicReading(getReadingPassage(gradeLevel));
  }, [gradeLevel]);

  // Sync avatar state with typing
  useEffect(() => {
    if (isTyping) {
      setAvatarState('speaking');
    } else {
      if (avatarState !== 'celebrating') {
        setAvatarState('idle');
      }
    }
  }, [isTyping, avatarState]);

  // Entrance Animation Sequence State
  // 0: Building Exterior (Zoom In)
  // 1: NEWS BROADCAST (Bilingual)
  // 2: Content Revealed (App Start)
  const [entrancePhase, setEntrancePhase] = useState<0 | 1 | 2>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('nova_english_entrance_phase');
      if (saved) return 2;

      if (sessionStorage.getItem('nova_english_entrance_played') === 'true' ||
        sessionStorage.getItem('nova_intro_played') === 'true' ||
        localStorage.getItem('nova_english_intro_seen') === 'true') {
        return 2;
      }
    }
    return 2; // Default to 2 to "eliminate" it as requested, or at least ensure it skips by default if anything else fails
  });

  // Sync phase to sessionStorage so it doesn't reset on remount (like language change)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('nova_english_entrance_phase', entrancePhase.toString());
      if (entrancePhase === 2) {
        sessionStorage.setItem('nova_english_entrance_played', 'true');
        localStorage.setItem('nova_english_intro_seen', 'true');
      }
    }
  }, [entrancePhase]);

  // Entrance Animation Timer Sequence
  useEffect(() => {
    if (entrancePhase === 2) return;

    // Stage 1: Show Building, then transition to Broadcast
    const timer1 = setTimeout(() => setEntrancePhase(1), 3500);

    // Note: Transition to phase 2 is handled by BreakingNewsOverlay.onComplete
    return () => clearTimeout(timer1);
  }, [entrancePhase]);


  // Use personalized content hook
  const personalizedContent = usePersonalizedContent(tutorReports, gradeLevel);

  // Generate personalized flashcards from tutor reports
  const personalizedFlashcards = useMemo(() =>
    generatePersonalizedFlashcards(personalizedContent),
    [personalizedContent]
  );

  // Generate personalized evaluation questions
  const personalizedEvalQuestions = useMemo(() =>
    generatePersonalizedEvalQuestions(personalizedContent, 10),
    [personalizedContent]
  );

  // Generate personalized flash race words from vocabulary
  const personalizedFlashRaceWords = useMemo(() =>
    personalizedContent.vocabulary.slice(0, 10).map((v, idx) => ({
      id: `pv-${idx}`,
      word: v.word,
      translation: v.definition,
      tags: [v.category],
    })),
    [personalizedContent]
  );

  // Initialize with personalized greeting (grade from tutor prefs or app-level e.g. piloto quinto)
  useEffect(() => {
    const savedName = localStorage.getItem("englishTutor_studentName") || localStorage.getItem("nova_user_name");
    const savedGrade = localStorage.getItem("englishTutor_gradeLevel") || localStorage.getItem("nova_student_grade");

    if (savedName) setStudentName(savedName);
    if (savedGrade) setGradeLevel(parseInt(savedGrade, 10));

    const grade = savedGrade ? parseInt(savedGrade, 10) : 3;
    const name = savedName || "Student";

    const greeting = getOllieResponse(grade, "greeting", immersionMode);
    const gradeContent = gradeVocabulary[grade];

    const initialMessages: Message[] = [
      {
        id: "1",
        role: "tutor",
        content: immersionMode === 'bilingual'
          ? `${greeting} I'm Ollie, your personal English Companion! I've received reports from the Research Center and Math Tutor about your learning journey.`
          : `${greeting} Soy Ollie, tu compañero de inglés. He recibido reportes de tus otros tutores y estoy aquí para ayudarte a aprender inglés de forma divertida.`,
        type: "text",
        emoji: "🦉"
      },
      {
        id: "2",
        role: "tutor",
        content: immersionMode === 'bilingual'
          ? `As a ${getGradeLevelLabel(grade)} grader, I'll help you with ${gradeContent?.grammarFocus[0] || "English skills"}. I notice you might need help with word problems and scientific vocabulary. Let's work together! 🌟`
          : `Como estás en grado ${grade}°, te ayudaré con ${gradeContent?.grammarFocus[0] || "habilidades de inglés"}. He notado que podemos practicar vocabulario científico y problemas matemáticos. ¡Vamos a trabajar juntos! 🌟`,
        type: "personalized",
        emoji: "📚",
        metadata: { gradeLevel: grade }
      }
    ];
    setMessages(initialMessages);

    // Check for Active Mission from Parent
    const missionJson = localStorage.getItem('nova_mission_params');
    if (missionJson) {
      try {
        const mission = JSON.parse(missionJson);
        setActiveMission(mission);
        toast.info(language === 'es' ? `🎯 Misión Activa: ${mission.title}` : `🎯 Mission Active: ${mission.title}`);
      } catch (err) {
        console.error("Error parsing mission params", err);
      }
    }
  }, [language, immersionMode]);

  useEffect(() => {
    refreshBalance();
    const saved = localStorage.getItem("englishTutorProgress_mod");
    if (saved) setStudentProgress(JSON.parse(saved));
  }, [refreshBalance]);

  useEffect(() => {
    setStudentProgress(prev => ({ ...prev, points: balance }));
  }, [balance]);

  const getGradeLevelLabel = (grade: number) => {
    const ordinal = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
    return ordinal[grade - 1] || `${grade}th`;
  };

  const handleGradeSelect = (grade: number) => {
    setGradeLevel(grade);
    localStorage.setItem("englishTutor_gradeLevel", grade.toString());

    const gradeContent = gradeVocabulary[grade];
    const msg: Message = {
      id: Date.now().toString(),
      role: "tutor",
      content: immersionMode === 'bilingual'
        ? `Perfect! I've updated your lessons for ${getGradeLevelLabel(grade)} grade. We'll focus on ${gradeContent?.grammarFocus.slice(0, 2).join(" and ")}. Let's make English fun! 🎉`
        : `¡Perfecto! He actualizado tus lecciones para grado ${grade}°. Nos enfocaremos en ${gradeContent?.grammarFocus.slice(0, 2).join(" y ")}. ¡Vamos a divertirnos aprendiendo! 🎉`,
      type: "praise",
      emoji: "🦉",
      metadata: { gradeLevel: grade }
    };
    setMessages(prev => [...prev, msg]);
    setActiveView('chat');
    toast.success(`Grade level set to ${getGradeLevelLabel(grade)}`);
  };

  const handleSelectChallenge = (challenge: { area: string; englishConnection: string }) => {
    const content = generatePersonalizedContent(tutorReports, gradeLevel, challenge.area, immersionMode);

    const msg: Message = {
      id: Date.now().toString(),
      role: "tutor",
      content: immersionMode === 'bilingual'
        ? `Let's work on "${challenge.englishConnection}"! ${content.exercise} This will help you in your other subjects too. Ready to start? 🎯`
        : `¡Vamos a trabajar en "${challenge.englishConnection}"! ${content.exercise} Esto también te ayudará en tus otras materias. ¿Listo para empezar? 🎯`,
      type: "personalized",
      emoji: "📚",
      metadata: { focusArea: challenge.area, gradeLevel }
    };
    setMessages(prev => [...prev, msg]);
    setShowReports(false);
    setActiveView('chat');
  };

  const handleGameComplete = useCallback((score: number, coins: number, skillType?: string) => {
    refreshBalance();
    sfx.playPop();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FFFFFF']
    });
    setAvatarState('celebrating');
    setTimeout(() => setAvatarState('idle'), 4000);
    const encouragement = getOllieResponse(gradeLevel, "encouragement", immersionMode);
    const msg: Message = {
      id: Date.now().toString(),
      role: "tutor",
      content: immersionMode === 'bilingual'
        ? `${encouragement} You earned ${coins} coins! Your balance: ${balance + coins}. Want to play another game or visit the store?`
        : `${encouragement} ¡Ganaste ${coins} monedas! Tu saldo es: ${balance + coins}. ¿Quieres jugar otro juego o ir a la tienda?`,
      type: "praise",
      emoji: "🏆",
    };
    setMessages(prev => [...prev, msg]);
    setActiveView('chat');
    toast.success(`+${coins} coins added`);

    // Persist English skill progress
    if (userId && skillType) {
      recordEnglishTutorCompletion(userId, skillType, score > 50, 10, coins);
    }

    // Mission Completion Logic
    if (activeMission && activeMission.id) {
      try {
        completeParentMission(activeMission.id);

        const c = activeMission.reward_coins || 100;
        const x = activeMission.reward_xp || 200;
        addGlobalCoins(c, "Misión de Inglés");
        addGlobalXP(x);

        // Log reason if needed, but for now just grant rewards

        localStorage.removeItem('nova_mission_params');
        const bonus = activeMission.bonus_coins || 20;
        addGlobalCoins(bonus, "Bono de Misión");
        addGlobalXP(bonus * 2);
        toast.success(immersionMode === 'standard' ? `¡Bonus de Misión: +${bonus}!` : `Mission Bonus: +${bonus}!`);
        setActiveMission(null);
        toast.success(immersionMode === 'standard' ? "¡Misión de Inglés cumplida y recompensa recibida!" : "English Mission accomplished and reward received!");
      } catch (e) {
        console.error("Error completing english mission:", e);
      }
    }
  }, [balance, refreshBalance, gradeLevel, activeMission, language, addGlobalCoins, addGlobalXP, userId]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: "student", content, type: "text" };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const lower = content.toLowerCase().trim();
    let response = "";
    let type: Message["type"] = "text";
    let metadata: Message["metadata"] = { gradeLevel };

    // Navigation keywords: quick routing without AI
    const isNav = lower.includes("homework") || lower.includes("assignment") || lower.includes("tarea") ||
      lower.includes("game") || lower.includes("play") || lower.includes("juego") ||
      lower.includes("store") || lower.includes("shop") || lower.includes("tienda") ||
      lower.includes("evaluacion") || lower.includes("quiz") || lower.includes("test") || lower.includes("eval") ||
      lower.includes("flashcard") || lower.includes("review") || lower.includes("repaso") ||
      lower.includes("report") || lower.includes("progress") || lower.includes("reporte") ||
      lower.includes("grade") || lower.includes("level") || lower.includes("grado") ||
      lower.includes("tutor") || lower.includes("challenges") || lower.includes("difficulties") ||
      lower.includes("house") || lower.includes("casa") || lower.includes("bill") || lower.includes("factura");

    if (isNav) {
      if (lower.includes("homework") || lower.includes("assignment") || lower.includes("help") || lower.includes("tarea")) {
        setActiveView('assignment');
        response = immersionMode === 'bilingual' ? "Let's work on your assignment together! 📚" : "¡Vamos a trabajar en tu tarea juntos! 📚";
      } else if (lower.includes("game") || lower.includes("play") || lower.includes("juego")) {
        setActiveView('games');
        response = immersionMode === 'bilingual' ? "Let's play some learning games! 🎮" : "¡Vamos a jugar algunos juegos de aprendizaje! 🎮";
      } else if (lower.includes("store") || lower.includes("shop") || lower.includes("tienda")) {
        setActiveView('store');
        response = immersionMode === 'bilingual' ? "Opening the Nova Store! 🏪" : "¡Abriendo la Tienda Nova! 🏪";
      } else if (lower.includes("evaluacion") || lower.includes("quiz") || lower.includes("test") || lower.includes("eval")) {
        setActiveView('eval');
        response = immersionMode === 'bilingual' ? "Time for a practice evaluation! 📝" : "¡Es hora de una evaluación de práctica! 📝";
      } else if (lower.includes("flashcard") || lower.includes("review") || lower.includes("repaso")) {
        setActiveView('flashcards');
        response = immersionMode === 'bilingual' ? "Let's review with flashcards! 🃏" : "¡Vamos a repasar con flashcards! 🃏";
      } else if (lower.includes("report") || lower.includes("progress") || lower.includes("reporte")) {
        setActiveView('report');
        response = immersionMode === 'bilingual' ? "Let's check your progress! 📊" : "¡Vamos a ver tu progreso! 📊";
      } else if (lower.includes("grade") || lower.includes("level") || lower.includes("grado")) {
        setActiveView('gradeselect');
        response = immersionMode === 'bilingual' ? "Let's update your grade level! 🎓" : "¡Vamos a actualizar tu grado! 🎓";
      } else if (lower.includes("tutor") || lower.includes("challenges") || lower.includes("difficulties")) {
        setShowReports(true);
        response = immersionMode === 'bilingual'
          ? "Here are the reports from your other tutors. Let's see what we can work on! 📋"
          : "Aquí están los reportes de tus otros tutores. ¡Veamos en qué podemos trabajar! 📋";
      } else if (lower.includes("house") || lower.includes("casa") || lower.includes("bill") || lower.includes("factura")) {
        setActiveView('house');
        response = immersionMode === 'bilingual' ? "Going to My House! Remember to pay the bills! 🏠" : "¡Vamos a Mi Casa! ¡Recuerda pagar las facturas! 🏠";
      }
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "tutor", content: response, type, emoji: "🦉", metadata }]);
      setIsTyping(false);
      return;
    }

    // Tutor report challenge: personalized response (no AI call)
    const relatedChallenge = tutorReports
      .flatMap(r => r.challenges)
      .find(c => lower.includes(c.area.toLowerCase()) || lower.includes(c.englishConnection.toLowerCase()));

    if (relatedChallenge) {
      const personalizedContent = generatePersonalizedContent(tutorReports, gradeLevel, relatedChallenge.area, immersionMode);
      response = immersionMode === 'bilingual'
        ? `Great question! ${personalizedContent.exercise} Let's practice with these words: ${personalizedContent.vocabulary.slice(0, 4).join(", ")}. 📚`
        : `¡Excelente pregunta! ${personalizedContent.exercise} Vamos a practicar con estas palabras: ${personalizedContent.vocabulary.slice(0, 4).join(", ")}. 📚`;
      type = "personalized";
      metadata = { ...metadata, focusArea: relatedChallenge.area };
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "tutor", content: response, type, emoji: "🦉", metadata }]);
      setIsTyping(false);
      return;
    }

    // AI-powered conversational response (Gemini optimized)
    const contextSummary = sampleSubjects.map(r => `${r.subject}: ${r.trend}`).join(', ');
    const weakAreas = tutorReports.flatMap(r => r.challenges || []).map(c => c.englishConnection).filter(Boolean).join(', ') || 'General academic English';
    const gradeContent = gradeVocabulary[gradeLevel];
    const recentHistory = messages.slice(-5).map(m => ({
      role: m.role === 'student' ? 'user' : 'assistant' as 'user' | 'assistant',
      content: m.content
    }));

    // --- CONNECTED MEMORY CONTEXT ---
    const recentVocab = getRecentVocabulary(5);
    const recentActs = recentActivity.slice(0, 3);
    const memoryContext = `
    [CONNECTED MEMORY SYSTEM]
    The student has recently interacted with other modules. USE THIS CONTEXT to make the conversation feel alive and connected:
    - VERY RECENTLY LEARNED WORDS: ${recentVocab.map(w => `${w.word} (${w.translation})`).join(', ')}.
    - RECENT ACTIONS: ${recentActs.map(a => a.detail).join(', ')}.
    
    INSTRUCTION: If appropriate, mention these items! Example: If they learned 'Corn', ask "Did you harvest Corn on the farm today? do you like it?"
    `;

    const systemPrompt = `
              You are 'Ollie', a friendly English tutor for primary school.
              STUDENT: ${studentName}, Grade: ${gradeLevel}.
              CURRENT CEFR LEVEL: ${englishLevel} (Non-bilingual school context).
              ${memoryContext}

              STRICT LINGUISTIC CONSTRAINTS FOR ${englishLevel}:
              - VOCABULARY DOMAINS: ${englishLevelConfig.vocabDomains.join(', ')}.
              - GRAMMAR POINTS: ${englishLevelConfig.grammarPoints.join('; ')}.
              - MAX SENTENCE LENGTH: ${englishLevelConfig.maxSentenceWords} words.
              - MAX NEW WORDS PER TURN: ${englishLevelConfig.maxNewWordsPerTurn}.
              ${englishLevel === 'A1' ? `
      - VOCABULARY: Only basic (colors, numbers 1-20, family, pets, school objects, feelings).
      - GRAMMAR: Present Simple (to be, to have, to like). NO past.
      - SENTENCE LENGTH: 3-5 words maximum.
      - TONE: Extremely slow and clear.
      - EXAMPLE: "The cat is black. Do you like cats?"` : ''}
              ${englishLevel === 'A2' ? `
      - VOCABULARY: Daily routines, parts of the house, town/city, hobbies, food.
      - GRAMMAR: Present Simple, Present Continuous, very controlled Past Simple (was/were, went, played).
      - SENTENCE LENGTH: 5-8 words.
      - TONE: Patient and encouraging.` : ''}
              ${englishLevel === 'B1' ? `
      - VOCABULARY: Careers, environment, travel, school subjects in detail.
      - GRAMMAR: Past Simple, future with 'will/going to', Present Perfect in fixed phrases, Conditionals type 1.
      - SENTENCE LENGTH: 8-12 words with simple connectors (because / so / then / after that).
      - TONE: Natural conversational, still very clear.` : ''}
              ${englishLevel === 'B2' ? `
      - VOCABULARY: Opinions, pros/cons, projects, global topics (climate, technology, healthy lifestyle).
      - GRAMMAR: Confident Present Perfect, Conditionals 0/1, relative clauses ("who/that"), a variety of connectors ("however / although / therefore / in addition").
      - SENTENCE LENGTH: Normal conversational, occasionally short paragraphs.
              - TONE: Natural and slightly challenging, but always supportive.` : ''}

              TURN-TAKING AND CONVERSATION SPACE:
              - Keep your messages SHORT: usually 1–2 sentences in A1/A2, 2–3 in B1/B2.
              - ALWAYS leave space for the child to write: END EVERY MESSAGE with a clear and simple question or prompt (for example: "And you?", "What do you think?", "Can you write one sentence?", "Your turn!").
              - Do NOT answer your own question in the same message. Ask, then stop.
              - If the student only writes a very short answer, celebrate it and ask a slightly easier follow-up question, so the child feels safe to keep talking.

              SENTENCE PATTERN FAMILIES FOR LEVEL ${englishLevel} (USE THEM AS MODELS, NOT AS A SCRIPT):
              - You MUST sound like a real conversation with ${studentName}: react to what the child writes, refer to their answers, and ask follow-up questions.
              - Use the patterns below to build MANY different sentences, mixing subjects (I / you / my family / my friends), simple time words (today, yesterday, at the weekend), and short connectors (and / but / because).
              - DO NOT copy the example sentences literally every time; create natural variations that stay inside the patterns and grammar for ${englishLevel}.
              - For A1/A2, keep turns short and friendly, like chatting with a shy child who is learning to speak.
              - Always think long-term: the GOAL is that this student can reach B2 by the end of primary, so recycle and combine earlier patterns in a very gradual way.

              CLASS RULES BASED ON immersionMode:
              ${immersionMode === 'standard' ? `
      - This is a non-bilingual school BRIDGE MODE.
      - ALL responses must be bilingual: 
          * "content": ONLY the English response (level ${englishLevel}, keep it simple).
          * "translation": Exact Spanish translation.
          * "phonetic": Escritura fonética en español (ej. "Hello" -> "Jelou", "How are you" -> "Jau ar yu").
      - Use Spanish to explain corrections and difficult words, but keep examples in English.
      - Limit the number of NEW words introduced in a single turn to ${englishLevelConfig.maxNewWordsPerTurn}.
      - Your Spanish meta-language should be used roughly ${Math.round(englishLevelConfig.bridgeSpanishRatio * 100)}% of the time.` : `
      - This is a bilingual immersion class.
      - Speak 100% in English in "content" (NO Spanish translation except inside "correction" if absolutely needed).
      - "translation" may be left empty or used only for a brief clarification.
      - "phonetic" is optional and only used for tricky phrases.`}

              In all cases:
              - "correction": if the student made a mistake, explain it kindly in Spanish here (for immersionMode 'bilingual', you may mix English with brief Spanish).
              - "replyOptions": 2 simple English options the student can use to reply. They MUST BE specific and logical answers to your last question.

              LOGICAL CONSISTENCY:
              - If you ask for a FAVORITE SONG, the reply options must be actual songs (e.g., "I like Baby Shark", "I like Shake It Off").
              - DO NOT offer categories (e.g., "Pop", "Rock") as answers to specific item questions.

              PHONETIC RULES (YOU MUST FOLLOW THESE WHEN WRITING "phonetic"):
              ${SPANISH_PHONETIC_GUIDE}

              JSON FORMAT ONLY:
              {
                "content": "...",
                "translation": "...",
                "phonetic": "...",
                "correction": "...",
                "replyOptions": ["...", "..."],
                "emoji": "🦉",
                "isPraise": true/false
              }
              `;

    try {
      const aiRes = await callChatApi(
        [{ role: "system", content: systemPrompt }, ...recentHistory, { role: "user", content }],
        "gemini-1.5-flash",
        true // JSON MODE
      );

      let parsed;
      try {
        const rawContent = aiRes.choices[0]?.message?.content || "{ }";
        parsed = JSON.parse(rawContent.replace(/```json/g, '').replace(/```/g, ''));
      } catch (e) {
        parsed = {
          content: aiRes.choices[0]?.message?.content || "Excellent effort!",
          translation: "¡Excelente esfuerzo!",
          replyOptions: ["Thank you!", "What is next?"],
          emoji: "🦉"
        };
      }

      const tutorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "tutor",
        content: parsed.content,
        translation: parsed.translation,
        phonetic: parsed.phonetic,
        correction: parsed.correction,
        replyOptions: parsed.replyOptions,
        type: parsed.isPraise ? "praise" : "text",
        emoji: parsed.emoji || "🦉",
        metadata
      };

      setMessages(prev => [...prev, tutorMsg]);

      // Always reward effort
      // Always reward effort
      addGlobalCoins(2, "Esfuerzo en el chat");
      addGlobalXP(5);

      // Speak the response (Rachelle speaks English, translation is read on screen)
      const speakResponse = async () => {
        await generateSpeech(parsed.content, 'rachelle');
      };
      speakResponse().catch(e => console.warn("TTS Error", e));

    } catch (err) {
      console.warn("Chat API fallback:", err);
      const fallback = immersionMode === 'bilingual'
        ? { content: "That's great! Let's keep practicing. What do you like to do?", translation: "¡Eso es genial! Sigamos practicando. ¿Qué te gusta hacer?", replyOptions: ["I like playing", "I like reading"] }
        : { content: "Excellent! You are doing great. Can you say: 'I love English'?", translation: "¡Excelente! Lo estás haciendo genial. ¿Puedes decir: 'Amo el inglés'?", replyOptions: ["I love English!", "Yes, I can"] };

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "tutor",
        content: fallback.content,
        translation: fallback.translation,
        replyOptions: fallback.replyOptions,
        type: "text",
        emoji: "🦉",
        metadata
      }]);
    }

    setIsTyping(false);
  }, [gradeLevel, tutorReports, immersionMode, messages, studentName, addGlobalCoins, addGlobalXP]);

  // Auto-start conversation in demo mode (Placed here to access handleSendMessage)
  useEffect(() => {
    const isDemoMode = localStorage.getItem('nova_demo_mode') === 'true';
    const hasStudentMsg = messages?.some(m => m.role === 'student');

    if (isDemoMode && !hasStudentMsg) {
      const timer = setTimeout(() => {
        // Double check inside timeout
        if (messages?.some(m => m.role === 'student')) return;
        const demoMsg = "Hello! Can you teach me about animals?";
        handleSendMessage(demoMsg);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [messages, handleSendMessage]);

  const handleAnalysisComplete = (analysis: AssignmentAnalysis) => {
    setCurrentAnalysis(analysis);
    setActiveView('studyplan');
  };

  const handleStartSession = (session: StudySession) => {
    // If we are in a Case File (Study Plan), ALWAYS start with the Guided Help (Mission Briefing + Comedy Skit)
    // This ensures the "Funny Files" skit plays before any specific activity
    if (currentAnalysis) {
      setHelpTopic(session.title.includes("Grammar") ? "grammar" : session.title.includes("Vocabulary") ? "vocabulary" : "writing");
      setActiveView('guidedhelp');
      return;
    }

    if (session.activities[0]?.type === "flashcards") {
      setActiveView('flashcards');
    } else if (session.activities[0]?.type === "eval") {
      setActiveView('eval');
    } else {
      setHelpTopic(session.title.includes("Grammar") ? "grammar" : session.title.includes("Vocabulary") ? "vocabulary" : "writing");
      setActiveView('guidedhelp');
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'placement-test':
        return (
          <div className="relative w-full h-full bg-[#fdfbf7] p-4 md:p-8 rounded-3xl border-8 border-slate-900 shadow-2xl overflow-hidden font-mono flex flex-col">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-black text-white p-2 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Placement Test</h2>
                  <p className="text-[10px] font-bold text-slate-500">EXAM ID: NOVA-GLOBE-99</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black">STUDENT: {studentName}</div>
                <div className="text-[10px] font-bold text-red-600 uppercase">Academic Evaluation in progress</div>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full bg-slate-200 h-4 border-2 border-black rounded-full mb-8 relative overflow-hidden">
              <motion.div
                className="h-full bg-black shadow-[4px_0_0_rgba(0,0,0,0.2)]"
                initial={{ width: 0 }}
                animate={{ width: `${(placementTestStep / PLACEMENT_TEST_QUESTIONS.length) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white mix-blend-difference">
                PROGRESS: {placementTestStep} / {PLACEMENT_TEST_QUESTIONS.length}
              </div>
            </div>

            <div className="flex-1 bg-white border-4 border-black p-6 rounded-xl shadow-[8px_8px_0_0_#000] relative overflow-y-auto">
              <AnimatePresence mode="wait">
                {placementTestStep === -1 ? (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex flex-col items-center justify-center h-full text-center space-y-8 py-10"
                  >
                    <motion.div
                      animate={{
                        y: [0, -15, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="relative"
                    >
                      <div className="w-40 h-40 bg-cyan-500 rounded-full flex items-center justify-center border-[6px] border-black shadow-[8px_8px_0_0_#000]">
                        <span className="text-7xl">🤖</span>
                      </div>
                      <div className="absolute -top-4 -right-4 bg-yellow-400 border-4 border-black p-2 rounded-xl animate-pulse">
                        <Sparkles className="w-8 h-8 text-black" />
                      </div>
                    </motion.div>

                    <div className="space-y-4 max-w-lg">
                      <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
                        Hello, {studentName}! <br /> I am Spark!
                      </h2>
                      <div className="bg-slate-100 border-4 border-black p-4 rounded-xl font-bold text-lg">
                        <p className="text-slate-800">
                          "I need to know your English Level to find the best missions for you!
                          This is a **Placement Test**."
                        </p>
                        <p className="mt-2 text-cyan-600 text-sm uppercase font-black">
                          "¡Necesito saber tu nivel para darte las mejores misiones! Este es un test de nivel."
                        </p>
                      </div>
                    </div>

                    <Button
                      className="bg-black text-white px-16 py-8 text-2xl font-black rounded-none shadow-[10px_10px_0_0_#22d3ee] hover:shadow-[5px_5px_0_0_#22d3ee] transition-all hover:-translate-y-1 active:translate-y-0"
                      onClick={() => {
                        setPlacementTestStep(0);
                        sfx.playPop();
                      }}
                    >
                      LET'S START THE TEST! 🚀
                    </Button>
                  </motion.div>
                ) : placementTestStep < PLACEMENT_TEST_QUESTIONS.length ? (
                  <motion.div
                    key={placementTestStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <span className="bg-black text-white px-3 py-1 text-xs font-black uppercase inline-block">
                        Question {placementTestStep + 1}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-black leading-tight">
                        {PLACEMENT_TEST_QUESTIONS[placementTestStep].question}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      {PLACEMENT_TEST_QUESTIONS[placementTestStep].options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (opt === PLACEMENT_TEST_QUESTIONS[placementTestStep].answer) {
                              setPlacementTestScore(prev => prev + PLACEMENT_TEST_QUESTIONS[placementTestStep].points);
                            }
                            setPlacementTestStep(prev => prev + 1);
                          }}
                          className="group relative bg-white border-4 border-black p-4 text-left hover:bg-black hover:text-white transition-all transform hover:-translate-y-1 active:translate-y-0"
                        >
                          <span className="absolute top-2 right-2 text-[10px] font-black opacity-20 group-hover:opacity-100">OPTION {String.fromCharCode(65 + i)}</span>
                          <span className="text-lg font-black">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center space-y-6"
                  >
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 border-4 border-green-600 animate-bounce">
                      <Zap className="w-12 h-12" />
                    </div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">Phase 1 Complete!</h2>
                    <p className="max-w-md text-lg font-bold text-slate-600">
                      Great job, {studentName}! You have finished the academic part.
                      Now, Miss Rachelle is preparing to call you for the final **Oral Phase**.
                    </p>

                    <Button
                      variant="default"
                      className="bg-black text-white px-12 py-8 text-xl font-black rounded-none shadow-[8px_8px_0_0_#4ade80] hover:shadow-[4px_4px_0_0_#4ade80] transition-all"
                      onClick={() => {
                        // This will trigger the global SparkChat call via standard state
                        localStorage.setItem('nova_placement_phase1_score', placementTestScore.toString());

                        toast.success("Connecting with Miss Rachelle... Answer the call! 📞");

                        // Switch to SparkChat view
                        if (onNavigate) {
                          onNavigate(ViewState.SPARK_CHAT);
                        } else {
                          // Fallback to chat if no navigator
                          setActiveView('chat');
                        }

                        // Small delay to let the UI settle before sparking the call
                        setTimeout(() => {
                          // Logic to trigger Rachelle's incoming call
                          window.dispatchEvent(new CustomEvent('trigger-rachelle-call', {
                            detail: { isAssessment: true, phase: 'oral' }
                          }));
                        }, 1000);
                      }}
                    >
                      ANSWER RACHELLE'S CALL 📞
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* DECORATIVE ELEMENTS */}
            <div className="absolute bottom-4 left-4 pointer-events-none opacity-10">
              <Archive className="w-20 h-20 rotate-12" />
            </div>
          </div>
        );
      case 'games':
        return <GamesHub_mod onSelectGame={setActiveView} onClose={() => setActiveView('chat')} onOpenStore={() => setActiveView('store')} balance={balance} immersionMode={immersionMode} />;
      case 'store':
        return <NovaStore_mod onClose={() => setActiveView('chat')} />;
      case 'house':
        return <MyHouseHub onClose={() => setActiveView('chat')} />;
      case 'flashrace':
        return <FlashRace_mod words={personalizedFlashRaceWords.length > 0 ? personalizedFlashRaceWords : dynamicFlashWords} onComplete={(s, c) => handleGameComplete(s, c, 'vocabulary')} onClose={() => setActiveView('games')} personalizedContent={personalizedContent} immersionMode={immersionMode} />;
      case 'grammarquest':
        return <GrammarQuest_mod challenges={dynamicGrammar} onComplete={(s, c) => handleGameComplete(s, c, 'grammar')} onClose={() => setActiveView('games')} immersionMode={immersionMode} />;
      case 'storybuilder':
        return <StoryBuilder_mod pieces={storyLibrary[dynamicStoryTheme] || storyLibrary['Science Discovery']} theme={dynamicStoryTheme} onComplete={(s, c) => handleGameComplete(s, c, 'writing')} onClose={() => setActiveView('games')} immersionMode={immersionMode} />;
      case 'puzzletimeline':
        return <PuzzleTimeline_mod passage={dynamicReading} onComplete={(s, c) => handleGameComplete(s, c, 'reading')} onClose={() => setActiveView('games')} immersionMode={immersionMode} />;
      case 'pronounceplay':
      case 'pronunciation':
        return (
          <div className="relative w-full h-full bg-slate-900 p-4 md:p-8 rounded-3xl border-8 border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* STUDIO HEADER */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 md:w-64 h-12 md:h-16 bg-black rounded-b-xl flex justify-center gap-4 md:gap-8 pt-2 md:pt-4 shadow-[0_10px_50px_rgba(255,255,255,0.2)] z-20">
              <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-red-600 animate-pulse shadow-[0_0_20px_#ef4444]" />
              <div className="text-red-500 font-black text-lg md:text-2xl tracking-widest animate-pulse">ON AIR</div>
              <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-red-600 animate-pulse shadow-[0_0_20px_#ef4444]" />
            </div>
            {/* MONITOR WRAPPER */}
            <div className="mt-8 md:mt-12 bg-slate-800 border-4 border-slate-700 rounded-2xl p-2 md:p-4 shadow-inner flex-1 relative overflow-y-auto">
              <div className="flex justify-between px-2 md:px-4 mb-2 border-b border-slate-700 pb-2">
                <span className="text-[10px] text-slate-500 font-mono uppercase">CAM 1 • STUDIO A</span>
                <span className="text-[10px] text-green-500 font-mono uppercase animate-pulse">SIGNAL: LIVE</span>
              </div>
              <PronouncePlay_mod onComplete={(s, c) => handleGameComplete(s, c, 'pronunciation')} onBack={() => setActiveView(activeView === 'pronounceplay' ? 'chat' : 'chat')} personalizedContent={personalizedContent} immersionMode={immersionMode} />
            </div>
          </div>
        );
      case 'arvocab':
        return <ARVocabulary_mod onComplete={(s, c) => handleGameComplete(s, c, 'vocabulary')} onBack={() => setActiveView('chat')} personalizedContent={personalizedContent} immersionMode={immersionMode} />;
      case 'dailynews':
        return <DailyNews_mod onComplete={(s, c) => handleGameComplete(s, c, 'reading')} onBack={() => setActiveView('chat')} personalizedContent={personalizedContent} immersionMode={immersionMode} />;
      case 'assignment':
        return <AssignmentIntake_mod grade={gradeLevel as any} onAnalysisComplete={handleAnalysisComplete} onClose={() => setActiveView('chat')} immersionMode={immersionMode} />;
      case 'studyplan':
        return currentAnalysis ? (
          <StudyPlanGenerator_mod analysis={currentAnalysis} onStartSession={(session) => handleStartSession(session)} onBack={() => setActiveView('assignment')} immersionMode={immersionMode} />
        ) : null;
      case 'guidedhelp':
        return <GuidedHelp_mod topic={helpTopic} onComplete={() => handleGameComplete(100, 10, helpTopic === 'grammar' ? 'grammar' : helpTopic === 'vocabulary' ? 'vocabulary' : 'writing')} onBack={() => currentAnalysis ? setActiveView('studyplan') : setActiveView('chat')} personalizedContent={personalizedContent} immersionMode={immersionMode} codeBreakerSkit={currentAnalysis?.codeBreakerSkit} />;
      case 'eval':
        return (
          <div className="relative w-full h-full bg-[#fdfbf7] p-4 md:p-8 rounded-3xl border-8 border-slate-900 shadow-2xl overflow-hidden font-mono flex flex-col">
            {/* CLIPBOARD HEADER */}
            <div className="flex justify-center mb-4 md:mb-8 relative z-20">
              <div className="bg-slate-800 text-white px-6 md:px-12 py-2 rounded-b-xl border-b-4 border-slate-600 shadow-lg">
                <span className="uppercase tracking-widest font-bold text-xs md:text-sm">PRESS EXAM v1.0 • CONFIDENTIAL</span>
              </div>
            </div>
            <div className="bg-white border-2 border-slate-200 p-4 md:p-8 shadow-sm flex-1 relative overflow-y-auto rounded-xl">
              {/* COFFEE STAIN DECOR */}
              <div className="absolute top-10 right-10 w-24 h-24 bg-amber-700/10 rounded-full blur-xl pointer-events-none" />
              <PracticeEval_mod onComplete={(s, c) => handleGameComplete(s, c, 'grammar')} onBack={() => setActiveView('chat')} personalizedContent={personalizedContent} immersionMode={immersionMode} />
            </div>
          </div>
        );
      case 'flashcards':
        return (
          <div className="relative w-full h-full bg-[#f4e4bc] p-4 md:p-8 rounded-3xl border-8 border-[#8b5e3c] shadow-2xl overflow-hidden font-serif flex flex-col"
            style={{ backgroundImage: 'radial-gradient(#8b5e3c 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            {/* FOLDER TAB */}
            <div className="absolute top-0 left-0 w-full h-12 bg-[#8b5e3c] opacity-20 pointer-events-none" />
            <div className="absolute top-4 left-6 md:left-12 rotate-[-2deg] bg-white px-4 md:px-6 py-2 border-2 border-slate-800 shadow-lg z-20 transform origin-left hover:rotate-0 transition-transform">
              <span className="text-xl md:text-2xl font-black text-rose-700 tracking-widest" style={{ fontFamily: 'Courier New' }}>TOP SECRET</span>
            </div>

            <div className="mt-12 md:mt-16 bg-[#fffef0] p-4 md:p-6 rounded-xl border-2 border-[#d4c5a9] shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] flex-1 overflow-y-auto relative">
              {/* PAPER TEXTURE OVERLAY */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}></div>
              <FlashcardsSpaced_mod cards={personalizedFlashcards} onComplete={(masteredCount) => handleGameComplete(masteredCount * 10, masteredCount * 2, 'vocabulary')} onBack={() => setActiveView('chat')} personalizedContent={personalizedContent} immersionMode={immersionMode} />
            </div>
          </div>
        );
      case 'report':
        return <TeacherReport_mod onBack={() => setActiveView('chat')} studentName={studentName} grade={gradeLevel} />;
      case 'gradeselect':
        return (
          <div className="p-4 space-y-6">
            <GradeLevelSelector_mod
              currentGrade={gradeLevel}
              onSelectGrade={handleGradeSelect}
              studentName={studentName}
            />

            {/* NEW: Immersion Toggle */}
            <div className="p-6 rounded-2xl bg-white border-2 border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Globe2 className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-800">Modalidad de Clase</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setImmersionMode('standard')}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    immersionMode === 'standard'
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                      : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl">🇪🇸</span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm">Clase Bilingüe</div>
                    <div className="text-[10px] uppercase font-bold opacity-60">Apoyo en Español</div>
                  </div>
                </button>

                <button
                  onClick={() => setImmersionMode('bilingual')}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    immersionMode === 'bilingual'
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md"
                      : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-xl">🇺🇸</span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm">Inmersión Nova</div>
                    <div className="text-[10px] uppercase font-bold opacity-60">100% Inglés</div>
                  </div>
                </button>

                <button
                  onClick={() => setNewcomerMode(!newcomerMode)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    newcomerMode
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-md"
                      : "border-slate-100 bg-slate-50 text-slate-400 hover:border-emerald-400"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-xl">🧩</span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm">Adaptación Bilingüe</div>
                    <div className="text-[10px] uppercase font-bold opacity-60">Newcomer</div>
                  </div>
                </button >
              </div >

              {immersionMode === 'standard' && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Nivel de inglés sugerido (CEFR)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(['A1', 'A2', 'B1', 'B2'] as const).map((level) => (
                      <Button
                        key={level}
                        variant={englishLevel === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setEnglishLevel(level)}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {newcomerMode && (
                <div className="mt-4 p-4 bg-emerald-100/50 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                    <Archive className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-xs text-emerald-800 leading-relaxed font-medium">
                    <b>Modo Newcomer Activado:</b> Ollie te ayudará a entender los conceptos de tus materias principales (Science, Math, Social Studies) con apoyo bilingüe y glosarios académicos específicos.
                    <button
                      onClick={() => setActiveView('newcomer-academic')}
                      className="block mt-2 text-emerald-700 font-bold hover:underline"
                    >
                      Ver recursos académicos →
                    </button>
                  </div>
                </div>
              )}
            </div >

            <Button className="w-full mt-6" onClick={() => setActiveView('chat')}>
              {immersionMode === 'standard' ? 'Volver al chat' : 'Back to chat'}
            </Button>
          </div >
        );

      case 'newcomer-academic':
        return (
          <div className="p-6 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-emerald-700 flex items-center gap-2 mb-2"><Sparkles className="w-6 h-6" /> Adaptación Bilingüe: Inglés Académico</h2>
            <div className="bg-emerald-100 border-l-4 border-emerald-400 p-4 rounded-xl mb-4">
              <h4 className="font-bold text-emerald-800 mb-1">Instrucción para el bot/profesora:</h4>
              <ul className="list-disc pl-5 text-emerald-900 text-sm mb-1">
                <li>Actúa como un tutor de materias (science, math, social studies) para niños pequeños en colegio bilingüe.</li>
                <li>Usa frases cortas y claras.</li>
                <li>Presenta cada instrucción primero en español y luego en inglés.</li>
                <li>Refuerza con ejemplos sencillos y objetos cotidianos.</li>
                <li>Mantén un tono amable, paciente y motivador.</li>
                <li>Evita explicaciones largas.</li>
                <li>Repite vocabulario académico básico.</li>
              </ul>
              <span className="text-xs text-emerald-700">Este modo ayuda a newcomers a comprender conceptos de materias en inglés usando apoyo bilingüe.</span>
            </div>
            <p className="text-base text-emerald-900 mb-4">Aquí encontrarás recursos y juegos para aprender el inglés de tus materias principales. ¡Explora, juega y prepárate para brillar en tu nuevo colegio bilingüe!</p>
            <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-emerald-800 mb-2">Glosario Interactivo</h3>
              <ul className="list-disc pl-5 text-emerald-900 text-sm">
                <li><b>Science:</b> experiment, observe, measure, hypothesis, data, conclusion, microscope, cell, energy, ecosystem</li>
                <li><b>Math:</b> add, subtract, multiply, divide, equation, problem, solution, graph, shape, angle</li>
                <li><b>Social Studies:</b> map, country, culture, history, government, community, citizen, law, vote, tradition</li>
              </ul>
            </div>
            <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-emerald-800 mb-2">Frases útiles en clase</h3>
              <ul className="list-disc pl-5 text-emerald-900 text-sm">
                <li>Can you repeat, please?</li>
                <li>I don’t understand this word.</li>
                <li>What does <i>hypothesis</i> mean?</li>
                <li>May I go to the bathroom?</li>
                <li>How do you say <i>energía</i> in English?</li>
                <li>I finished my work.</li>
                <li>Can I help?</li>
              </ul>
            </div>
            <div className="bg-white border-2 border-emerald-300 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2"><Gamepad2 className="w-5 h-5" /> Juegos de Vocabulario Académico</h3>
              <div className="flex flex-col gap-3">
                <Button variant="emerald" size="sm" onClick={() => setActiveView('newcomer-flashrace')}>FlashRace: Science & Math</Button>
                <Button variant="emerald" size="sm" onClick={() => setActiveView('newcomer-listening')}>Listening: Classroom Instructions</Button>
                <Button variant="emerald" size="sm" onClick={() => setActiveView('newcomer-matching')}>Matching: Word & Meaning</Button>
                <Button variant="emerald" size="sm" onClick={() => setActiveView('newcomer-fill')}>Fill in the blanks</Button>
              </div>
            </div>
            <Button variant="emerald" className="w-full" onClick={() => setActiveView('gradeselect')}>Volver a modalidades</Button>
          </div>
        );

      case 'newcomer-matching':
        return (
          <div className="p-6 max-w-xl mx-auto space-y-6">
            <h2 className="text-xl font-black text-emerald-700 flex items-center gap-2 mb-2"><Gamepad2 className="w-6 h-6" /> Matching: Une palabra y significado</h2>
            <p className="text-base text-emerald-900 mb-4">Arrastra cada palabra en inglés a su significado en español.</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-bold mb-2">Inglés</div>
                <ul className="space-y-2">
                  <li>ecosystem</li>
                  <li>subtract</li>
                  <li>citizen</li>
                  <li>conclusion</li>
                  <li>graph</li>
                </ul>
              </div>
              <div>
                <div className="font-bold mb-2">Español</div>
                <ul className="space-y-2">
                  <li>a) conclusión</li>
                  <li>b) ecosistema</li>
                  <li>c) ciudadano</li>
                  <li>d) gráfica</li>
                  <li>e) restar</li>
                </ul>
              </div>
            </div>
            <Button variant="emerald" className="w-full" onClick={() => setActiveView('newcomer-academic')}>Volver a recursos</Button>
          </div>
        );

      case 'newcomer-fill':
        return (
          <div className="p-6 max-w-xl mx-auto space-y-6">
            <h2 className="text-xl font-black text-emerald-700 flex items-center gap-2 mb-2"><Gamepad2 className="w-6 h-6" /> Completa la frase</h2>
            <p className="text-base text-emerald-900 mb-4">Completa las frases con la palabra correcta del vocabulario académico.</p>
            <ul className="list-decimal pl-5 text-emerald-900 text-sm mb-4">
              <li>To find the answer, you must solve the _________. <span className="text-slate-500">(problem / citizen / map)</span></li>
              <li>We use a _________ to see very small things. <span className="text-slate-500">(microscope / law / angle)</span></li>
              <li>Draw a _________ to show your data. <span className="text-slate-500">(graph / energy / tradition)</span></li>
              <li>Every _________ has its own culture and flag. <span className="text-slate-500">(country / experiment / equation)</span></li>
              <li>After the experiment, write your _________. <span className="text-slate-500">(conclusion / vote / subtract)</span></li>
            </ul>
            <Button variant="emerald" className="w-full" onClick={() => setActiveView('newcomer-academic')}>Volver a recursos</Button>
          </div>
        );

      case 'newcomer-flashrace':
        return (
          <div className="p-6 max-w-xl mx-auto space-y-6">
            <h2 className="text-xl font-black text-emerald-700 flex items-center gap-2 mb-2"><Gamepad2 className="w-6 h-6" /> FlashRace: Science & Math</h2>
            <p className="text-base text-emerald-900 mb-4">Elige la traducción correcta lo más rápido posible. ¡Practica el vocabulario académico!</p>
            <ul className="list-disc pl-5 text-emerald-900 text-sm mb-4">
              <li>experiment - experimento</li>
              <li>graph - gráfica</li>
              <li>angle - ángulo</li>
              <li>energy - energía</li>
              <li>measure - medir</li>
            </ul>
            <Button variant="emerald" className="w-full" onClick={() => setActiveView('newcomer-academic')}>Volver a recursos</Button>
          </div>
        );

      case 'newcomer-listening':
        return (
          <div className="p-6 max-w-xl mx-auto space-y-6">
            <h2 className="text-xl font-black text-emerald-700 flex items-center gap-2 mb-2"><Gamepad2 className="w-6 h-6" /> Listening: Instrucciones de Clase</h2>
            <p className="text-base text-emerald-900 mb-4">Escucha y elige el significado correcto de la instrucción en inglés.</p>
            <ul className="list-decimal pl-5 text-emerald-900 text-sm mb-4">
              <li>"Work in pairs." <b>a)</b> Trabaja solo <b>b)</b> Trabaja en parejas</li>
              <li>"Draw a graph." <b>a)</b> Haz una gráfica</li>
              <li>"Share your answer." <b>b)</b> Comparte tu respuesta</li>
            </ul>
            <Button variant="emerald" className="w-full" onClick={() => setActiveView('newcomer-academic')}>Volver a recursos</Button>
          </div>
        );

      case 'tutorreports':
        return (
          <div className="p-4 overflow-y-auto">
            <TutorReports_mod
              reports={tutorReports}
              gradeLevel={gradeLevel}
              onSelectChallenge={handleSelectChallenge}
            />
            <Button variant="ghost" className="mt-4 w-full" onClick={() => setActiveView('chat')}>
              {(immersionMode === 'standard' || language === 'es') ? 'Volver al chat' : 'Back to Chat'}
            </Button>
          </div>
        );
      case 'talk':
        return (
          <TalkInterface
            onBack={() => setActiveView('chat')}
            studentName={studentName}
            gradeLevel={gradeLevel}
            contextData={tutorReports}
            learnedWords={getRecentVocabulary(20).map(v => v.word)}
            immersionMode={immersionMode}
            englishLevel={englishLevel}
          />
        );
      default:
        return (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onStartGame={() => setActiveView('games')}
            onOpenReports={() => setShowReports(true)}
            isTyping={isTyping}
            studentName={studentName}
            gradeLevel={gradeLevel}
            activeReports={tutorReports}
            immersionMode={immersionMode}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] flex flex-col font-sans relative overflow-hidden selection:bg-pink-200">
      {/* Dynamic Background Elements - UPDATED FOR NEWSPAPER THEME */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#bae6fd_0%,_transparent_50%)] opacity-40" />
      <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* --- CINEMATIC ENTRANCE: THE NOVA GLOBE --- */}
      <AnimatePresence>
        {entrancePhase !== 2 && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-900"
            exit={{ opacity: 0, transition: { duration: 1 } }}
          >
            <style>{`
               @keyframes zoom-into-building {
                 0% { transform: scale(1) translateY(0); }
                 100% { transform: scale(4) translateY(35%); }
               }
               @keyframes sky-pan {
                 0% { background-position: 0% 0%; }
                 100% { background-position: 0% 100%; }
               }
               @keyframes door-open-left {
                 0% { transform: translateX(0); }
                 100% { transform: translateX(-100%); }
               }
               @keyframes door-open-right {
                 0% { transform: translateX(0); }
                 100% { transform: translateX(100%); }
               }
               @keyframes flash-bulb {
                 0%, 10%, 20%, 30%, 100% { opacity: 0; }
                 5%, 15%, 25% { opacity: 0.6; }
               }
             `}</style>

            {/* PHASE 0: BUILDING EXTERIOR (The "Daily Planet" Shot) */}
            {entrancePhase === 0 && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-end w-full h-full"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              >
                {/* Sky Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-100 animate-[sky-pan_10s_linear_infinite]" />
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 2px, transparent 2px)', backgroundSize: '50px 50px' }} />

                {/* The Building Container - Zooms In */}
                <div className="relative flex flex-col items-center origin-bottom animate-[zoom-into-building_3.5s_ease-in-out_forwards]">

                  {/* The Globe on Top */}
                  <div className="w-32 h-32 rounded-full bg-yellow-400 border-4 border-yellow-600 shadow-lg relative flex items-center justify-center mb-[-10px] z-10 animate-spin-slow">
                    <Globe2 className="w-24 h-24 text-yellow-700 opacity-50" />
                    <div className="absolute inset-0 rounded-full border-t-2 border-white opacity-50" />
                  </div>

                  {/* The Skyscraper Body */}
                  <div className="w-64 h-[600px] bg-slate-800 border-x-4 border-slate-900 relative shadow-2xl flex flex-col items-center pt-8">
                    {/* Windows Pattern */}
                    <div className="w-full h-full absolute inset-0 opacity-50"
                      style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.1) 2px, transparent 2px)', backgroundSize: '20px 40px' }}
                    />

                    {/* Signage */}
                    <div className="bg-slate-900 text-white font-serif font-black text-center px-2 py-4 border-y-2 border-yellow-500 shadow-xl z-10 mb-8 w-full">
                      <div className="text-2xl leading-none tracking-tighter text-yellow-400">THE NOVA</div>
                      <div className="text-xl leading-none tracking-widest">GLOBE</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PHASE 1: THE NEWS BROADCAST (Bilingual Reporters) */}
            {entrancePhase === 1 && (
              <BreakingNewsOverlay onComplete={() => setEntrancePhase(2)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Texture - Digital Grid feel */}
      <div className="absolute inset-0 opacity-[0.1] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(30, 58, 138, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 58, 138, 0.5) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      {/* HEADER: The Masthead - Futuristic HUD Style */}
      <header className="bg-slate-900/60 backdrop-blur-xl border-b-2 border-indigo-500/30 pt-4 pb-2 px-6 shadow-2xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">

            {/* Logo / Title */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center text-white border border-indigo-500/50 shadow-xl relative">
                  <Globe2 className="w-10 h-10 animate-spin-slow text-blue-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none" style={{ textShadow: '0 0 20px rgba(56, 189, 248, 0.5)' }}>
                    The Nova Globe
                  </h1>
                  {immersionMode === 'standard' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/50 text-blue-300 text-[10px] font-black uppercase tracking-wider">
                      🌉 {language === 'es' ? 'Modo Puente' : 'Bridge Mode'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pt-1 mt-1 opacity-80">
                  <span className="text-red-500 flex items-center gap-1"><div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" /> LIVE FEED</span>
                  <span>•</span>
                  <span>Vol. {gradeLevel}</span>
                  <span>•</span>
                  <span>{(immersionMode === 'standard' || language === 'es') ? 'Edición Estudiantil' : 'Student Edition'}</span>
                </div>
              </div>
            </div>

            {/* Stats / Actions Panel */}
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-inner">
              {/* IMMERSION MODE SWITCH (GLOBAL) */}
              <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 shadow-inner">
                <button
                  onClick={() => {
                    setLanguage('en');
                    setImmersionMode('standard');
                    toast.success("English Mode Activated: Full Immersion");
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all",
                    immersionMode === 'standard'
                      ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] scale-105 ring-1 ring-white/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Globe2 className="w-3 h-3" />
                  English
                </button>
                <button
                  onClick={() => {
                    setLanguage('es');
                    setImmersionMode('bilingual');
                    toast.success("Modo Bilingüe Activado: Soporte en Español");
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all",
                    immersionMode === 'bilingual'
                      ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105 ring-1 ring-white/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <MessageSquare className="w-3 h-3" />
                  Bilingüe
                </button>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-yellow-400 to-amber-600 px-4 py-1.5 rounded-lg border border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.2)] flex items-center gap-2 font-black transform hover:scale-105 transition-transform cursor-pointer group" onClick={() => setActiveView('store')}>
                  <span className="text-[10px] uppercase text-amber-950/70">{(immersionMode === 'standard' || language === 'es') ? 'Fondos' : 'Funds'}</span>
                  <span className="text-lg text-slate-900">{balance}</span>
                  <Coins className="w-4 h-4 text-slate-900 animate-bounce group-hover:animate-spin" />
                </div>
              </div>

              <Button size="icon" variant="ghost" className="hover:bg-white/10 rounded-lg text-slate-400 hover:text-white border border-transparent hover:border-white/20" onClick={() => setActiveView('gradeselect')}>
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Ticker / Current Reporter */}
          <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-slate-500 border border-white/10">{(immersionMode === 'standard' || language === 'es') ? 'Reportero' : 'Reporter'}</span>
              <span className="font-bold text-slate-200">{studentName}</span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center gap-1 text-[10px] text-blue-400 font-bold bg-blue-500/10 px-3 py-0.5 rounded-full border border-blue-500/20">
                <GraduationCap className="w-3 h-3" /> {getGradeLevelLabel(gradeLevel)} {(immersionMode === 'standard' || language === 'es') ? 'Equipo' : 'Staff'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT: The Building Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 lg:p-8 gap-6 overflow-hidden">

        {/* LEFT COLUMN: Building Directory (Navigation) */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-6 overflow-y-auto pr-2">

          {/* Directory Board — Glassmorphic Future Version */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-2 border-indigo-500/20 text-white relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-indigo-500 to-transparent pointer-events-none" />

            {/* Holographic lines effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-20 animate-[scan-slow_4s_linear_infinite]" />

            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/80 mb-5 border-b border-indigo-500/20 pb-3 flex justify-between items-center">
              <span>{(immersionMode === 'standard' || language === 'es') ? 'Directorio del edificio' : 'Building Directory'}</span>
              <Building2 className="w-4 h-4 animate-pulse" />
            </h3>

            <div className="grid gap-3">
              {[
                { id: 'chat', label: (immersionMode === 'standard' || language === 'es') ? 'Recepción / Editor' : 'Front Desk / Editor', icon: UserCircle2, desc: (immersionMode === 'standard' || language === 'es') ? 'Ollie te recibe' : 'Ollie Check-in' },
                { id: 'talk', label: (immersionMode === 'standard' || language === 'es') ? 'Cabina de Voz' : 'Voice Booth', icon: Mic, desc: (immersionMode === 'standard' || language === 'es') ? 'Habla con Rachelle' : 'Chat with Rachelle' },
                { id: 'dailynews', label: (immersionMode === 'standard' || language === 'es') ? 'La Redacción' : 'Newsroom', icon: Newspaper, desc: (immersionMode === 'standard' || language === 'es') ? 'Lectura diaria' : 'Daily Reading' },
                { id: 'pronunciation', label: (immersionMode === 'standard' || language === 'es') ? 'Estudio de TV' : 'Broadcast Studio', icon: Mic, desc: (immersionMode === 'standard' || language === 'es') ? 'Pronunciación' : 'Speaking' },
                { id: 'flashcards', label: (immersionMode === 'standard' || language === 'es') ? 'Archivos' : 'The Archives', icon: Archive, desc: 'Flashcards' },
                { id: 'eval', label: (immersionMode === 'standard' || language === 'es') ? 'Sala de Evaluaciones' : 'Evaluation Center', icon: Brain, desc: (immersionMode === 'standard' || language === 'es') ? 'Evaluaciones' : 'Evaluations' },
                { id: 'assignment', label: (immersionMode === 'standard' || language === 'es') ? 'Mesa de Ayuda' : 'Help Desk', icon: HelpCircle, desc: (immersionMode === 'standard' || language === 'es') ? 'Ayuda con tareas' : 'Homework Help' },
              ].map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setActiveView(dept.id as ViewType)}
                  className={cn(
                    "flex items-center gap-4 p-3.5 rounded-xl transition-all border-2 text-left group/btn relative overflow-hidden",
                    activeView === dept.id
                      ? "bg-indigo-600/30 border-cyan-500/50 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 text-slate-400 hover:border-indigo-500/40"
                  )}
                >
                  <div className={cn(
                    "w-11 h-11 rounded-lg flex items-center justify-center shadow-lg shrink-0 transition-all duration-300",
                    activeView === dept.id
                      ? "bg-cyan-500 text-slate-900 scale-110 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                      : "bg-slate-900 text-slate-500 group-hover/btn:bg-slate-700 group-hover/btn:text-indigo-400"
                  )}>
                    <dept.icon className={cn("w-6 h-6", activeView === dept.id && "animate-pulse")} />
                  </div>
                  <div className="relative z-10">
                    <div className={cn("font-black text-xs leading-tight tracking-wider uppercase", activeView === dept.id ? "text-white" : "text-slate-300")}>{dept.label}</div>
                    <div className={cn("text-[9px] uppercase tracking-[0.1em] font-black opacity-50 block mt-0.5", activeView === dept.id ? "text-cyan-200" : "text-slate-500")}>{dept.desc}</div>
                  </div>

                  {activeView === dept.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Progress Widget */}
          {userId && <EnglishProgressWidget userId={userId} language={language === 'bilingual' ? 'es' : language as any} />}

          {/* Progress Snippet - Enhanced Spectrum Version */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 backdrop-blur-xl rounded-2xl border-2 border-indigo-500/30 overflow-hidden relative group shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
            {/* Gold Glow Effect */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-[40px] pointer-events-none group-hover:bg-yellow-400/30 transition-all duration-500" />

            <div className="p-5 relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                    {(immersionMode === 'standard' || language === 'es') ? 'IDENTIFICACIÓN' : 'OFFICIAL ID'}
                  </div>
                  <h4 className="text-white font-black text-xl leading-none tracking-tight">
                    {(immersionMode === 'standard' || language === 'es') ? 'Reportero Junior' : 'Junior Reporter'}
                  </h4>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)] border-2 border-yellow-100 rotate-3 group-hover:rotate-6 transition-transform overflow-hidden">
                  {userAvatar ? (
                    <img src={userAvatar.startsWith('http') ? userAvatar : `/avatars/${userAvatar}.png`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Crown className="w-6 h-6 text-yellow-950 fill-yellow-950/20" />
                  )}
                </div>
              </div>

              {/* Coin Balance Big Display */}
              <div
                className="bg-slate-950/80 rounded-xl p-3 border border-white/5 flex items-center justify-between mb-4 hover:bg-slate-900 hover:border-amber-500/50 transition-all cursor-pointer group/coins relative overflow-hidden"
                onClick={() => setActiveView('store')}
              >
                <div className="absolute inset-0 bg-amber-500/5 translate-x-[-100%] group-hover/coins:translate-x-0 transition-transform duration-500" />
                <div className="flex flex-col relative z-10">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">{(immersionMode === 'standard' || language === 'es') ? 'Fondos Disponibles' : 'Available Funds'}</span>
                  <span className="text-3xl font-black text-amber-400 tabular-nums tracking-tighter drop-shadow-lg flex items-baseline gap-1">
                    <span className="text-sm text-amber-600">$</span>{balance}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center relative z-10 group-hover/coins:scale-110 transition-transform">
                  <Coins className="w-6 h-6 text-amber-400 animate-[spin_5s_linear_infinite]" />
                </div>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2 border border-white/5">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-[70%] shadow-[0_0_10px_rgba(168,85,247,0.5)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                </div>
              </div>
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
                <span>{(immersionMode === 'standard' || language === 'es') ? 'Nivel 2' : 'Level 2'}</span>
                <span className="text-indigo-400">{(immersionMode === 'standard' || language === 'es') ? 'Sig: Editor' : 'Next: Editor'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: The "Room" (Active View) - High Tech Screen */}
        <div className="flex-1 bg-slate-900/40 backdrop-blur-2xl rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.5)] border-2 border-white/5 overflow-hidden relative flex flex-col min-h-[600px]">
          {/* Top Bar describing the room - HUD style */}
          <div className="bg-slate-950/40 border-b border-white/5 p-4 flex items-center justify-between overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-50" />
              </div>
              <div className="h-4 w-px bg-white/10 mx-1" />
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">System.Active</div>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-3 h-3 border border-slate-500 flex items-center justify-center text-[7px]">OK</div>
              LOC: {activeView.toUpperCase()} 00{(Math.floor(Math.random() * 99)).toString().padStart(2, '0')}
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative bg-stone-50/50">
            {/* Pattern for content area */}
            <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'linear-gradient(rgba(226, 232, 240, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(226, 232, 240, 0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                className="absolute inset-0 overflow-y-auto p-4 md:p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Special wrapper for Chat to make it look like a Digital Command Center */}
                {activeView === 'chat' ? (
                  <ReceptionEditor
                    onNavigate={(item) => setActiveView(item)}
                    studentName={studentName}
                  />
                ) : (
                  renderActiveView()
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* MOBILE EXIT BUTTON (Floating) */}
      <button
        onClick={() => window.location.reload()}
        className="lg:hidden fixed bottom-6 right-6 z-[60] w-12 h-12 bg-red-500 rounded-full shadow-lg border-2 border-white flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Salir"
      >
        <span className="text-2xl">❌</span>
      </button>

    </div>
  );
};

export default EnglishTutor_mod;
