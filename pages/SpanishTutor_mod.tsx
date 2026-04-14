import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLearning } from "@/context/LearningContext";
import { Settings, BarChart3, X, Store, BookOpen, Brain, FileText, Gamepad2, Mic, Sparkles, Newspaper, User, GraduationCap, Plus, Globe2, Coins, Building2, UserCircle2, Archive, HelpCircle, Medal, Star, Zap, Languages } from "lucide-react";
import { LinaAvatar, AvatarState } from "@/components/MathMaestro/tutor/LinaAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';
import { sfx } from '@/services/soundEffects';
import ChatInterface from "@/components/tutor_mod/ChatInterface";
import { UniversalNotebook, type NoteData } from '@/components/Notebook/UniversalNotebook';
import GamesHub_mod, { type GameType } from "@/components/tutor_mod/games/GamesHub_mod";
import SpanishGamesHub, { type SpanishGameType } from "@/components/tutor_mod/games/SpanishGamesHub";
import FlashRace_mod from "@/components/tutor_mod/games/FlashRace_mod";
import GrammarQuest_mod from "@/components/tutor_mod/games/GrammarQuest_mod";
import StoryBuilder_mod from "@/components/tutor_mod/games/StoryBuilder_mod";
import PuzzleTimeline_mod from "@/components/tutor_mod/games/PuzzleTimeline_mod";
import NovaStore_mod from "@/components/tutor_mod/NovaStore_mod";
import AssignmentIntake_mod, { type AssignmentAnalysis } from "@/components/tutor_mod/companion/AssignmentIntake_mod";
import StudyPlanGenerator_mod, { type StudySession } from "@/components/tutor_mod/companion/StudyPlanGenerator_mod";
import GuidedHelp_mod from "@/components/tutor_mod/companion/GuidedHelp_mod";
import PracticeEval_mod from "@/components/tutor_mod/companion/PracticeQuiz_mod";
import FlashcardsSpaced_mod from "@/components/tutor_mod/companion/FlashcardsSpaced_mod";
import TeacherReport_mod from "@/components/tutor_mod/companion/TeacherReport_mod";
import DailyNews_mod from "@/components/tutor_mod/companion/DailyNews_mod";
import TutorReports_mod from "@/components/tutor_mod/TutorReports_mod";
import { TutorReport } from "@/types/tutor";
import GradeLevelSelector_mod from "@/components/tutor_mod/GradeLevelSelector_mod";
import { useRewards } from "@/hooks/useRewards_mod";
import { usePersonalizedContent, generatePersonalizedFlashcards, generatePersonalizedEvalQuestions } from "@/hooks/usePersonalizedContent_mod";
import { sampleTutorReports, generatePersonalizedContent } from "@/lib/olliePersonality_mod";
import { getSpanishGradeConfig } from "@/data/spanishMenConfig";
import { toast } from "sonner";
import { completeParentMission } from "@/services/supabase";
import { useGamification } from "@/context/GamificationContext";
import { generateSpeech } from '../services/edgeTTS';
import { callChatApi } from "@/services/ai_service";
import { notebookService } from '@/services/notebookService';
import { supabase } from '@/services/supabase';
import { SpanishProgressWidget } from '@/components/tutor_mod/SpanishProgressWidget';
import { recordSpanishTutorCompletion } from '@/services/learningProgress';
import { getSpanishGrammarChallenges, getSpanishVocabulary, getSpanishStoryTheme, getSpanishReadingPassage, spanishStoryLibrary } from '@/data/spanishContent';
import SpanishAdventureQuest from '@/components/tutor_mod/games/SpanishAdventureQuest';
import SpanishSpellingBattle from '@/components/tutor_mod/games/SpanishSpellingBattle';
import SpanishCityBuilder from '@/components/tutor_mod/games/SpanishCityBuilder';
import { Student, ParentMission } from '@/types';

interface Message {
  id: string;
  role: "tutor" | "student";
  content: string;
  type?: "text" | "game-prompt" | "correction" | "praise" | "personalized";
  emoji?: string;
  correction?: string;
  replyOptions?: string[];
  metadata?: {
    focusArea?: string;
    gradeLevel?: number;
    source?: string;
  };
}

type ViewType = 'chat' | 'games' | 'store' | 'assignment' | 'studyplan' | 'guidedhelp' | 'eval' | 'flashcards' | 'report' | 'dailynews' | 'tutorreports' | 'gradeselect' | 'talk' | 'spanish-adventure' | 'spanish-spelling-battle' | 'spanish-city-builder' | GameType | SpanishGameType;

// Contexto de materias para la cabina de voz (similar a EnglishTutor_mod, adaptado a español)
const sampleSubjects = [
  { subject: "Lenguaje", emoji: "📖", score: 75, trend: "up" as const, weaknesses: ["ortografía", "acentuación"] },
  { subject: "Ciencias", emoji: "🔬", score: 68, trend: "stable" as const, weaknesses: ["vocabulario científico"] },
  { subject: "Matemáticas", emoji: "🔢", score: 82, trend: "up" as const, weaknesses: ["problemas de enunciado"] },
  { subject: "Sociales", emoji: "🌎", score: 60, trend: "down" as const, weaknesses: ["comprensión de textos largos"] },
];

// Dynamic content helpers (reuse from English for now, will be replaced with Spanish-specific content)
// Dynamic content helpers
const getFlashRaceWords = () => getSpanishVocabulary(10);
const getGrammarChallenges = (grade: number) => getSpanishGrammarChallenges(5, grade);
const getStoryTheme = () => getSpanishStoryTheme();
const getReadingPassage = (grade: number) => getSpanishReadingPassage(grade);

// --- SPANISH VOICE CHAT COMPONENT ---
const SpanishTalkInterface = ({
  onBack,
  studentName,
  gradeLevel,
  contextData,
  language = 'es'
}: {
  onBack: () => void,
  studentName: string,
  gradeLevel: number,
  contextData: any[],
  language?: 'es' | 'en'
}) => {
  const { spanishGrade, spanishLevel } = useLearning();
  const spanishConfig = useMemo(() => getSpanishGradeConfig(spanishGrade), [spanishGrade]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [turnsLeft, setTurnsLeft] = useState(20);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [hint, setHint] = useState<{ es: string } | null>(null);
  const [history, setHistory] = useState<{ role: 'student' | 'tutor', text: string }[]>([]);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const [noSpeechCount, setNoSpeechCount] = useState(0);
  const audioIntervalRef = useRef<any>(null);
  const [isToggleMode, setIsToggleMode] = useState(true);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const transcriptRef = useRef("");
  const statusRef = useRef<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const isHandsFreeRef = useRef(false);

  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { isHandsFreeRef.current = isHandsFree; }, [isHandsFree]);

  // Welcome message on mount
  useEffect(() => {
    const welcomes = [
      { es: "¡Hola campeón! ¿Listo para practicar español hoy? ¡Vamos!", hint_es: "Hola Lina, estoy listo." },
      { es: "Soy Lina, tu tutora de español. Hoy practicaremos juntos. ¿Listo?", hint_es: "Sí, estoy listo." },
      { es: "¡Bienvenido! Tengo nuevas palabras y ejercicios para ti hoy. ¿Empezamos?", hint_es: "Sí, empecemos." },
      { es: "¡Hola! Vamos a mejorar tu lectura y escritura. ¿Estás preparado?", hint_es: "Sí, estoy preparado." },
    ];
    const randomWelcome = welcomes[Math.floor(Math.random() * welcomes.length)];
    setResponse(randomWelcome.es);
    if (randomWelcome.hint_es) {
      setHint({ es: randomWelcome.hint_es });
    }

    const playWelcome = async () => {
      setStatus('speaking');
      try {
        await generateSpeech(randomWelcome.es, 'lina');
      } catch (e: any) {
        if (e.message !== 'interrupted') {
          console.error("Welcome playback failed", e);
        }
      } finally {
        setStatus('idle');
        if (isHandsFreeRef.current) {
          setTimeout(startListening, 500);
        }
      }
    };

    const timer = setTimeout(playWelcome, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // More stable
      recognition.interimResults = true;
      recognition.lang = 'es-MX';

      recognition.onstart = () => {
        setStatus('listening');
        setMicError(null);
        setNoSpeechCount(0); // Reset on success
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
          transcriptRef.current = currentText;
        }

        if (!recognition.continuous && event.results[0].isFinal) {
          stopVisualizer();
          processVoiceInput(event.results[0][0].transcript);
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
              setIsHandsFree(false);
              toast.info("No te escuché bien. ¡Prueba a escribir!");
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
        const currentStatus = statusRef.current;
        const currentText = transcriptRef.current;

        if (currentStatus === 'listening' && currentText && currentText.trim().length > 1) {
          processVoiceInput(currentText);
        } else if (currentStatus === 'listening') {
          setStatus('idle');
        }
      };

      recognitionRef.current = recognition;
    } else {
      toast.error("El reconocimiento de voz no está soportado en este navegador. Usa Chrome o Edge.");
    }

    return () => {
      stopVisualizer();
      recognitionRef.current?.stop();
    };
  }, [isToggleMode, isHandsFree]);

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
      toast.error("¡Límite diario de voz alcanzado! Hablemos por texto.");
      return;
    }
    if (status !== 'idle') return;

    setTranscript("");
    transcriptRef.current = "";

    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.error("Recognition start failed", e);
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

    if (!text || text.trim().length < 2) {
      setStatus('idle');
      return;
    }

    setStatus('processing');
    setTurnsLeft(prev => prev - 1);
    setHistory(prev => [...prev, { role: 'student', text }]);

    try {
      const contextSummary = contextData.map(r => `${r.subject}: ${r.trend}`).join(', ');
      const weakAreas = contextData.flatMap(r => r.weaknesses || []).join(', ');

      const prompt = `
        Eres 'Lina', una tutora entusiasta de español para ${studentName}, estudiante de ${gradeLevel}° grado en Colombia.
        NIVEL ACTUAL: Grado ${gradeLevel} (Estándares MEN).

        OBJETIVOS MEN PARA GRADO ${gradeLevel}:
        - LECTURA: ${spanishConfig.readingStandards.join(', ')}
        - ESCRITURA: ${spanishConfig.writingStandards.join(', ')}
        - ORALIDAD: ${spanishConfig.oralStandards.join(', ')}

        CONSTRAINTS LINGÜÍSTICOS:
        - VOCABULARIO: ${spanishConfig.vocabDomains.join(', ')}
        - GRAMÁTICA: ${spanishConfig.grammarPoints.join('; ')}
        - LONGITUD MÁXIMA DE FRASE: ${spanishConfig.maxSentenceWords} palabras
        - MÁXIMO DE PALABRAS NUEVAS POR TURNO: ${spanishConfig.maxNewWordsPerTurn}

        TURN-TAKING Y ESPACIO CONVERSACIONAL:
        - Mantén turnos CORTOS: 1-2 frases en grados 1-2, 2-3 en grados 3-5
        - SIEMPRE termina con pregunta o invitación para que el niño hable
        - Reacciona a lo que el niño dice, haz preguntas de seguimiento
        - Si el niño está muy callado o solo dice una palabra, reacciona amablemente y haz una pregunta aún más simple

        VARIANTE COLOMBIANA:
        - Usa expresiones colombianas apropiadas para niños (ej: "chévere", "bacano", "genial")
        - Contexto cultural colombiano en ejemplos y situaciones
        - Acento y entonación colombiana (pero clara y educativa)

        JSON FORMAT ONLY:
        {
          "content": "Respuesta en español",
          "suggested": "Frase corta para que el niño practique",
          "correction": "Explicación si hubo error (null si no hay)"
        }
      `;

      let aiResponse: {
        content: string,
        suggested: string,
        correction: string | null
      };

      try {
        const aiRes = await callChatApi(
          [{ role: "system", content: prompt }, { role: "user", content: text }],
          "gpt-4o-mini",
          true
        );
        aiResponse = JSON.parse(aiRes.choices[0].message.content);
      } catch (apiErr) {
        console.warn("Voice API fallback:", apiErr);
        aiResponse = {
          content: "¡Buen trabajo! Sigamos practicando.",
          suggested: "Sí, estoy listo",
          correction: null
        };
      }

      setResponse(aiResponse.content);
      if (aiResponse.suggested) {
        setHint({ es: aiResponse.suggested });
      }
      setNoSpeechCount(0); // Reset on success
      setHistory(prev => [...prev, { role: 'tutor', text: aiResponse.content }]);

      setStatus('speaking');
      try {
        await generateSpeech(aiResponse.content, 'lina');
      } catch (e: any) {
        if (e.message !== 'interrupted') {
          console.error("Narration failed", e);
        }
      } finally {
        setStatus('idle');
        if (isHandsFreeRef.current) {
          setTimeout(startListening, 500);
        }
      }

    } catch (err) {
      console.error("Voice Chain Error:", err);
      setStatus('idle');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full max-w-4xl mx-auto p-6 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative mb-12 text-center flex flex-col items-center z-10 w-full">
        <div className="relative">
          <AnimatePresence>
            {(status === 'listening' || status === 'speaking') &&
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute inset-0 rounded-full blur-3xl -z-10 ${status === 'listening' ? 'bg-red-400' : 'bg-green-400'}`}
              />
            }
          </AnimatePresence>

          <div className={`w-48 h-48 rounded-full border-[12px] flex items-center justify-center 
          transition-all duration-700 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative z-10
          backdrop-blur-sm bg-white/20
          ${status === 'listening' ? 'border-red-500/80 ring-8 ring-red-100 shadow-red-200/50 scale-110' :
              status === 'speaking' ? 'border-green-500/80 ring-8 ring-green-100 shadow-green-200/50' :
                status === 'processing' ? 'border-purple-400 animate-pulse ring-8 ring-purple-50' : 'border-white shadow-xl'}`}>
            <LinaAvatar state={status === 'speaking' ? 'speaking' : 'idle'} size={170} mode="spanish" />

            {status === 'listening' && (
              <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden bg-red-500/10 backdrop-blur-[2px]">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-red-500/80 rounded-full mx-0.5 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    animate={{
                      height: [`${20 + Math.random() * 10}%`, `${40 + micLevel * 1.2}%`, `${20 + Math.random() * 10}%`],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ repeat: Infinity, duration: 0.2 + (i * 0.02), ease: "easeInOut" }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-10 min-h-[140px] max-w-2xl px-4">
            <AnimatePresence mode="wait">
              {status === 'listening' && (
                <motion.div
                  key="listening"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="flex flex-col items-center gap-3 bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <p className="text-2xl font-black text-red-600 uppercase tracking-tight">Escuchando...</p>
                  </div>
                  <div className="bg-white/80 px-6 py-2 rounded-2xl border border-red-100 italic text-slate-600 shadow-sm min-w-[200px]">
                    "{transcript || '...'}"
                  </div>
                </motion.div>
              )}
              {status === 'processing' && (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-lg font-bold text-purple-600">Pensando...</p>
                </motion.div>
              )}
              {status === 'speaking' && response && (
                <motion.div key="speaking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
                  <p className="text-lg font-medium text-slate-800 leading-relaxed text-center">{response}</p>
                </motion.div>
              )}
              {status === 'idle' && hint && (
                <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-2xl shadow-sm">
                  <p className="text-sm font-bold text-yellow-800 mb-1">💡 Puedes decir:</p>
                  <p className="text-base text-yellow-900 italic">"{hint.es}"</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="flex items-center gap-4">
          <Button
            onClick={toggleListening}
            disabled={status === 'processing'}
            className={cn(
              "px-8 py-4 rounded-2xl font-black text-lg shadow-lg transition-all",
              status === 'listening' ? "bg-red-500 hover:bg-red-600 text-white" :
                status === 'speaking' ? "bg-green-500 text-white cursor-not-allowed" :
                  status === 'processing' ? "bg-purple-500 text-white cursor-wait" :
                    "bg-blue-500 hover:bg-blue-600 text-white"
            )}
          >
            {status === 'listening' ? '🛑 Detener' :
              status === 'speaking' ? '🔊 Hablando...' :
                status === 'processing' ? '⏳ Procesando...' :
                  '🎤 Hablar'}
          </Button>
          <Button onClick={() => setIsHandsFree(!isHandsFree)} variant="outline" className="px-4 py-2">
            {isHandsFree ? '🔇 Manual' : '🔄 Automático'}
          </Button>
        </div>
        <p className="text-sm text-slate-500">
          Turnos restantes: {turnsLeft} | {micError && <span className="text-red-500">{micError}</span>}
        </p>
      </div>

      {noSpeechCount >= 3 && status === 'idle' && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 flex gap-2 w-full max-w-sm z-20">
          <input
            type="text"
            placeholder="Escribe tu respuesta aquí..."
            className="flex-1 bg-white/80 border-4 border-black px-4 py-2 font-bold shadow-[4px_4px_0_0_#000] focus:outline-none rounded-xl"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                processVoiceInput((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          <Button
            onClick={(e) => {
              const input = (e.currentTarget.previousSibling as HTMLInputElement).value;
              if (input) {
                processVoiceInput(input);
                (e.currentTarget.previousSibling as HTMLInputElement).value = '';
              }
            }}
            className="bg-blue-600 text-white font-bold border-2 border-black rounded-xl px-6"
          >
            ENVIAR
          </Button>
        </motion.div>
      )}

      <Button onClick={onBack} variant="ghost" className="mt-8">← Volver</Button>

      <UniversalNotebook
        isOpen={isNoteOpen}
        onClose={() => setIsNoteOpen(false)}
        language={language}
        getNoteData={() => ({
          topic: "Clase de Español",
          date: new Date().toLocaleDateString(),
          summary: history.length > 0
            ? history.map(h => `${h.role === 'student' ? 'Estudiante' : 'Lina'}: ${h.text}`).join('\n\n')
            : "No hay conversación aún.",
          subject: 'spanish' as any
        })}
        onSave={async (data: NoteData) => {
          await notebookService.saveNote({ ...data, subject: 'spanish' });
        }}
        onStudy={(data: NoteData) => {
          setIsNoteOpen(false);
          toast.info("¡Modo Estudio Activado! Lina está lista para evaluarte.");
        }}
      />
    </div>
  );
};

const SpanishTutor_mod = () => {
  const { balance, refreshBalance } = useRewards();
  const { language, setLanguage, spanishGrade, setSpanishGrade, spanishLevel } = useLearning();
  const spanishConfig = useMemo(() => getSpanishGradeConfig(spanishGrade), [spanishGrade]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [currentAnalysis, setCurrentAnalysis] = useState<AssignmentAnalysis | null>(null);
  const [helpTopic, setHelpTopic] = useState("gramática");
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const { addCoins, addXP } = useGamification();
  const [userId, setUserId] = useState<string | null>(null);

  const [dynamicFlashWords, setDynamicFlashWords] = useState(() => getSpanishVocabulary());
  const [dynamicGrammar, setDynamicGrammar] = useState(() => getGrammarChallenges(3));
  const [dynamicStoryTheme, setDynamicStoryTheme] = useState(() => getSpanishStoryTheme());
  const [dynamicReading, setDynamicReading] = useState(() => getSpanishReadingPassage(3));

  const [studentName, setStudentName] = useState("Estudiante");
  const [gradeLevel, setGradeLevel] = useState<number>(3);
  const { reports: tutorReports } = useLearning();
  const [showReports, setShowReports] = useState(false);
  const [activeMission, setActiveMission] = useState<ParentMission | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!supabase) return;
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        setUserId(authData.user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, nickname')
          .eq('id', authData.user.id)
          .single();
        if (profile) {
          setStudentName(profile.nickname || profile.full_name?.split(' ')[0] || "Estudiante");
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    setDynamicGrammar(getGrammarChallenges(gradeLevel));
    setDynamicReading(getReadingPassage(gradeLevel));
  }, [gradeLevel]);

  useEffect(() => {
    if (isTyping) {
      setAvatarState('speaking');
    } else {
      if (avatarState !== 'celebrating') {
        setAvatarState('idle');
      }
    }
  }, [isTyping, avatarState]);


  const personalizedContent = usePersonalizedContent(tutorReports, gradeLevel);

  const personalizedFlashcards = useMemo(() =>
    generatePersonalizedFlashcards(personalizedContent),
    [personalizedContent]
  );

  const personalizedEvalQuestions = useMemo(() =>
    generatePersonalizedEvalQuestions(personalizedContent, 10),
    [personalizedContent]
  );

  const personalizedFlashRaceWords = useMemo(() =>
    personalizedContent.vocabulary.slice(0, 10).map((v, idx) => ({
      id: `pv-${idx}`,
      word: v.word,
      translation: v.definition,
      tags: [v.category],
    })),
    [personalizedContent]
  );

  useEffect(() => {
    const savedName = localStorage.getItem("spanishTutor_studentName") || localStorage.getItem("nova_user_name");
    const savedGrade = localStorage.getItem("spanishTutor_gradeLevel") || localStorage.getItem("nova_student_grade");

    if (savedName) setStudentName(savedName);
    if (savedGrade) {
      const grade = parseInt(savedGrade, 10);
      setGradeLevel(grade);
      setSpanishGrade(grade as 1 | 2 | 3 | 4 | 5);
    }

    const grade = savedGrade ? parseInt(savedGrade, 10) : 3;
    const name = savedName || "Estudiante";

    const initialMessages: Message[] = [
      {
        id: "1",
        role: "tutor",
        content: `¡Hola ${name}! Soy Lina, tu tutora de español. Estoy aquí para ayudarte a mejorar tu lectura, escritura y expresión oral según los estándares del MEN.`,
        type: "text",
        emoji: "📚"
      },
      {
        id: "2",
        role: "tutor",
        content: `Como estás en grado ${grade}°, trabajaremos en: ${spanishConfig.readingStandards[0]}. ¡Vamos a aprender juntos! 🌟`,
        type: "personalized",
        emoji: "✨",
        metadata: { gradeLevel: grade }
      }
    ];
    setMessages(initialMessages);

    const missionJson = localStorage.getItem('nova_mission_params');
    if (missionJson) {
      try {
        const mission = JSON.parse(missionJson);
        setActiveMission(mission);
        toast.info(`🎯 Misión Activa: ${mission.title}`);
      } catch (err) {
        console.error("Error parsing mission params", err);
      }
    }
  }, [language, spanishConfig]);

  useEffect(() => {
    refreshBalance();
    // Progress is now managed via contexts and supabase, but we can still check local flags if needed
  }, [refreshBalance]);

  const getGradeLevelLabel = (grade: number) => {
    const labels = ["Primero", "Segundo", "Tercero", "Cuarto", "Quinto", "Sexto", "Séptimo"];
    return labels[grade - 1] || `Grado ${grade}`;
  };

  const handleGradeSelect = (grade: number) => {
    setGradeLevel(grade);
    setSpanishGrade(grade as 1 | 2 | 3 | 4 | 5 | 6 | 7);
    localStorage.setItem("spanishTutor_gradeLevel", grade.toString());

    const msg: Message = {
      id: Date.now().toString(),
      role: "tutor",
      content: `¡Perfecto! Ahora trabajaremos con los estándares de grado ${grade}°. ¿Qué te gustaría practicar primero?`,
      type: "text",
      emoji: "🎓"
    };
    setMessages(prev => [...prev, msg]);
  };

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "student",
      content: content.trim(),
      type: "text"
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const lower = content.toLowerCase().trim();
    let response = "";
    let type: Message["type"] = "text";
    let metadata: Message["metadata"] = { gradeLevel };

    const isNav = lower.includes("tarea") || lower.includes("juego") || lower.includes("tienda") ||
      lower.includes("evaluacion") || lower.includes("flashcard") || lower.includes("reporte") ||
      lower.includes("grado") || lower.includes("tutor");

    if (isNav) {
      if (lower.includes("tarea") || lower.includes("ayuda")) {
        setActiveView('assignment');
        response = "¡Vamos a trabajar en tu tarea juntos! 📚";
      } else if (lower.includes("juego")) {
        setActiveView('games');
        response = "¡Vamos a jugar algunos juegos de aprendizaje! 🎮";
      } else if (lower.includes("tienda")) {
        setActiveView('store');
        response = "¡Abriendo la Tienda Nova! 🏪";
      } else if (lower.includes("evaluacion") || lower.includes("test")) {
        setActiveView('eval');
        response = "¡Es hora de una evaluación de práctica! 📝";
      } else if (lower.includes("flashcard") || lower.includes("repaso")) {
        setActiveView('flashcards');
        response = "¡Vamos a repasar con flashcards! 🃏";
      } else if (lower.includes("reporte") || lower.includes("progreso")) {
        setActiveView('report');
        response = "¡Vamos a ver tu progreso! 📊";
      } else if (lower.includes("grado") || lower.includes("nivel")) {
        setActiveView('gradeselect');
        response = "¡Vamos a actualizar tu grado! 🎓";
      } else if (lower.includes("tutor") || lower.includes("desafios")) {
        setShowReports(true);
        response = "Aquí están los reportes de tus otros tutores. ¡Veamos en qué podemos trabajar! 📋";
      }
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "tutor", content: response, type, emoji: "📚", metadata }]);
      setIsTyping(false);
      return;
    }

    const recentHistory = messages.slice(-5).map(m => ({
      role: m.role === 'student' ? 'user' : 'assistant' as 'user' | 'assistant',
      content: m.content
    }));

    const systemPrompt = `
            Eres 'Lina', una tutora amigable de español para primaria.
            ESTUDIANTE: ${studentName}, Grado: ${gradeLevel}.
            NIVEL ACTUAL: Grado ${gradeLevel} (Estándares MEN).

            CONSTRAINTS LINGÜÍSTICOS PARA GRADO ${gradeLevel}:
            - VOCABULARIO: ${spanishConfig.vocabDomains.join(', ')}.
            - GRAMÁTICA: ${spanishConfig.grammarPoints.join('; ')}.
            - LONGITUD MÁXIMA DE FRASE: ${spanishConfig.maxSentenceWords} palabras.
            - MÁXIMO DE PALABRAS NUEVAS POR TURNO: ${spanishConfig.maxNewWordsPerTurn}.

            OBJETIVOS MEN:
            - LECTURA: ${spanishConfig.readingStandards.join(', ')}
            - ESCRITURA: ${spanishConfig.writingStandards.join(', ')}
            - ORALIDAD: ${spanishConfig.oralStandards.join(', ')}

            TURN-TAKING:
            - Mantén mensajes CORTOS: 1-2 frases en grados 1-2, 2-3 en grados 3-5
            - SIEMPRE termina con pregunta o invitación clara
            - Reacciona a lo que el niño escribe, haz preguntas de seguimiento
            - Si el estudiante solo escribe una respuesta muy corta, celébrala y haz una pregunta aún más simple

            VARIANTE COLOMBIANA:
            - Usa expresiones colombianas apropiadas (ej: "chévere", "bacano", "genial")
            - Contexto cultural colombiano
            - Acento colombiano pero claro y educativo

            JSON FORMAT ONLY:
            {
              "content": "Respuesta en español",
            "correction": "Explicación si hubo error (null si no hay)",
            "replyOptions": ["Opción 1", "Opción 2"]
      }
            `;

    try {
      const aiRes = await callChatApi(
        [
          { role: "system", content: systemPrompt },
          ...recentHistory,
          { role: "user", content: content }
        ],
        "gemini-1.5-flash",
        true
      );

      const aiResponse = JSON.parse(aiRes.choices[0].message.content);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "tutor",
        content: aiResponse.content,
        correction: aiResponse.correction || undefined,
        replyOptions: aiResponse.replyOptions,
        type: "text",
        emoji: "📚",
        metadata
      }]);

      if (aiResponse.correction) {
        addCoins(5, "Corrección gramatical");
        addXP(10);
      } else {
        addCoins(2, "Participación en chat");
        addXP(5);
      }

    } catch (err) {
      console.warn("Chat API fallback:", err);
      const fallback = {
        content: "¡Eso es genial! Sigamos practicando. ¿Qué te gusta hacer?",
        replyOptions: ["Me gusta jugar", "Me gusta leer"]
      };

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "tutor",
        content: fallback.content,
        replyOptions: fallback.replyOptions,
        type: "text",
        emoji: "📚",
        metadata
      }]);
    }

    setIsTyping(false);
  }, [gradeLevel, tutorReports, messages, studentName, addCoins, spanishConfig]);

  const handleGameComplete = (score: number, coins: number, category: string) => {
    refreshBalance();
    addCoins(coins, `Juego completado: ${category}`);
    addXP(score);
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FFFFFF']
    });
    setAvatarState('celebrating');
    setTimeout(() => setAvatarState('idle'), 4000);
    const msg: Message = {
      id: Date.now().toString(),
      role: "tutor",
      content: `¡Excelente trabajo! Ganaste ${coins} monedas. Tu saldo es: ${balance + coins}. ¿Quieres jugar otro juego o ir a la tienda?`,
      type: "praise",
      emoji: "🎉"
    };
    setMessages(prev => [...prev, msg]);
    setActiveView('chat');

    // Persist Spanish skill progress
    if (userId && category) {
      recordSpanishTutorCompletion(userId, category, score > 50, score, coins);
    }

    // Mission Completion Logic
    if (activeMission && activeMission.id) {
      try {
        completeParentMission(activeMission.id);

        const c = activeMission.reward_coins || 100;
        const x = activeMission.reward_xp || 200;
        addCoins(c, "Misión de Español");
        addXP(x);

        localStorage.removeItem('nova_mission_params');
        const bonus = activeMission.bonus_coins || 20;
        addCoins(bonus, "Bono de Misión");
        addXP(bonus * 2);
        toast.success(`¡Misión cumplida! Bono de Misión: +${bonus}!`);
        setActiveMission(null);
      } catch (e) {
        console.error("Error completing spanish mission:", e);
      }
    }
  };

  const handleAnalysisComplete = (analysis: AssignmentAnalysis) => {
    setCurrentAnalysis(analysis);
    setActiveView('studyplan');
  };

  const handleStartSession = (session: StudySession) => {
    if (session.activities[0]?.type === "flashcards") {
      setActiveView('flashcards');
    } else if (session.activities[0]?.type === "eval") {
      setActiveView('eval');
    } else {
      setHelpTopic(session.title.includes("Gramática") ? "gramática" : session.title.includes("Vocabulario") ? "vocabulario" : "escritura");
      setActiveView('guidedhelp');
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'talk':
        return <SpanishTalkInterface onBack={() => setActiveView('chat')} studentName={studentName} gradeLevel={gradeLevel} contextData={sampleSubjects} language={language === 'bilingual' ? 'es' : language} />;
      case 'games':
        return <SpanishGamesHub onSelectGame={setActiveView} onClose={() => setActiveView('chat')} onOpenStore={() => setActiveView('store')} balance={balance} />;
      case 'store':
        return <NovaStore_mod onClose={() => setActiveView('chat')} />;
      case 'flashrace':
        return <FlashRace_mod words={personalizedFlashRaceWords.length > 0 ? personalizedFlashRaceWords : dynamicFlashWords} onComplete={(s, c) => handleGameComplete(s, c, 'vocabulario')} onClose={() => setActiveView('games')} personalizedContent={personalizedContent} immersionMode="standard" />;
      case 'grammarquest':
        return <GrammarQuest_mod challenges={dynamicGrammar} onComplete={(s, c) => handleGameComplete(s, c, 'gramática')} onClose={() => setActiveView('games')} immersionMode="standard" />;
      case 'storybuilder':
        return <StoryBuilder_mod pieces={spanishStoryLibrary[dynamicStoryTheme] || spanishStoryLibrary['Aventura en la Selva']} theme={dynamicStoryTheme} onComplete={(s, c) => handleGameComplete(s, c, 'escritura')} onClose={() => setActiveView('games')} immersionMode="standard" />;
      case 'puzzletimeline':
        return <PuzzleTimeline_mod passage={dynamicReading} onComplete={(s, c) => handleGameComplete(s, c, 'lectura')} onClose={() => setActiveView('games')} immersionMode="standard" />;
      case 'dailynews':
        return <DailyNews_mod onComplete={(s, c) => handleGameComplete(s, c, 'lectura')} onBack={() => setActiveView('chat')} personalizedContent={personalizedContent} immersionMode="standard" />;
      case 'assignment':
        return <AssignmentIntake_mod grade={gradeLevel as any} onAnalysisComplete={handleAnalysisComplete} onClose={() => setActiveView('chat')} immersionMode="standard" />;
      case 'studyplan':
        return currentAnalysis ? (
          <StudyPlanGenerator_mod analysis={currentAnalysis} onStartSession={(session) => handleStartSession(session)} onBack={() => setActiveView('assignment')} immersionMode="standard" />
        ) : null;
      case 'guidedhelp':
        return <GuidedHelp_mod topic={helpTopic} onComplete={() => handleGameComplete(100, 10, helpTopic === 'gramática' ? 'gramática' : helpTopic === 'vocabulario' ? 'vocabulario' : 'escritura')} onBack={() => setActiveView('chat')} personalizedContent={personalizedContent} immersionMode="standard" />;
      case 'eval':
        return <PracticeEval_mod onComplete={(s, c) => handleGameComplete(s, c, 'gramática')} onBack={() => setActiveView('chat')} personalizedContent={personalizedContent} immersionMode="standard" />;
      case 'flashcards':
        return <FlashcardsSpaced_mod cards={personalizedFlashcards} onComplete={(masteredCount) => handleGameComplete(masteredCount * 10, masteredCount * 2, 'vocabulario')} onBack={() => setActiveView('chat')} personalizedContent={personalizedContent} immersionMode="standard" />;
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
          </div>
        );
      case 'tutorreports':
        return <TutorReports_mod reports={tutorReports} gradeLevel={gradeLevel} />;
      case 'spanish-adventure':
        return <SpanishAdventureQuest grade={gradeLevel as 1 | 2 | 3 | 4 | 5} onComplete={(s, c) => handleGameComplete(s, c, 'gramática')} onClose={() => setActiveView('games')} />;
      case 'spanish-spelling-battle':
        return <SpanishSpellingBattle grade={gradeLevel as 1 | 2 | 3 | 4 | 5} onComplete={(s, c) => handleGameComplete(s, c, 'ortografía')} onClose={() => setActiveView('games')} />;
      case 'spanish-city-builder':
        return <SpanishCityBuilder grade={gradeLevel as 1 | 2 | 3 | 4 | 5} onComplete={(s, c) => handleGameComplete(s, c, 'ortografía')} onClose={() => setActiveView('games')} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 overflow-hidden">
      <header className="bg-white border-b-4 border-slate-200 shadow-lg p-4 md:p-6 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center text-white border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
              <Languages className="w-10 h-10 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 uppercase leading-none" style={{ textShadow: '2px 2px 0px #cbd5e1' }}>
                  Centro de Español
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-100 border-2 border-purple-400 text-purple-800 text-xs font-black uppercase tracking-wider">
                  🇨🇴 Español Colombiano
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-[0.2em] border-t-2 border-slate-200 pt-1 mt-1">
                <span className="text-red-600 flex items-center gap-1"><div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> EN VIVO</span>
                <span>•</span>
                <span>Grado {gradeLevel}</span>
                <span>•</span>
                <span>Estándares MEN</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-xl border-2 border-slate-200">
            <div className="flex items-center bg-white rounded-lg p-1 border border-slate-300">
              <button
                onClick={() => setLanguage('es')}
                className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-black transition-all",
                  language === 'es' ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-900"
                )}
              >
                ES
              </button>
            </div>

            <div className="h-8 w-px bg-slate-300" />

            <div className="flex items-center gap-2">
              <div className="bg-yellow-400 px-3 py-1 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-1 font-black transform hover:scale-105 transition-transform cursor-pointer" onClick={() => setActiveView('store')}>
                <span className="text-xs uppercase mr-1">Fondos</span>
                <span className="text-lg">{balance}</span>
                <Coins className="w-4 h-4" />
              </div>
            </div>

            <Button size="icon" variant="ghost" className="hover:bg-slate-200 rounded-lg text-slate-600" onClick={() => setActiveView('gradeselect')}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t-2 border-slate-100 pt-2 mt-2 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <span className="bg-slate-200 px-2 py-0.5 rounded text-xs font-bold uppercase text-slate-500">Estudiante</span>
            <span className="font-bold text-slate-900">{studentName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
              <GraduationCap className="w-3 h-3" /> {getGradeLevelLabel(gradeLevel)}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 lg:p-8 gap-6 overflow-hidden">
        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-6 overflow-y-auto pr-2">
          <div className="bg-slate-800 rounded-xl p-4 shadow-xl border-4 border-slate-900 text-white relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-600 pb-2 flex justify-between">
              <span>Directorio del edificio</span>
              <Building2 className="w-4 h-4" />
            </h3>

            <div className="grid gap-2">
              {[
                { id: 'chat', label: 'Recepción / Editor', icon: UserCircle2, desc: 'Lina te recibe' },
                { id: 'talk', label: 'Cabina de Voz', icon: Mic, desc: 'Habla con Lina' },
                { id: 'dailynews', label: 'La Redacción', icon: Newspaper, desc: 'Lectura diaria' },
                { id: 'games', label: 'Arcade', icon: Gamepad2, desc: 'Juegos' },
                { id: 'flashcards', label: 'Archivos', icon: Archive, desc: 'Flashcards' },
                { id: 'eval', label: 'Sala de Evaluaciones', icon: Brain, desc: 'Evaluaciones' },
                { id: 'assignment', label: 'Mesa de Ayuda', icon: HelpCircle, desc: 'Ayuda con tareas' },
              ].map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setActiveView(dept.id as ViewType)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all border-2 text-left group/btn relative overflow-hidden",
                    activeView === dept.id
                      ? "bg-yellow-400 border-yellow-400 text-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.4)]"
                      : "bg-slate-700/50 border-slate-700 hover:bg-slate-700 text-slate-200 hover:border-slate-500"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-md flex items-center justify-center shadow-lg shrink-0 transition-colors",
                    activeView === dept.id ? "bg-slate-900 text-yellow-400" : "bg-slate-800 text-slate-400 group-hover/btn:bg-slate-600"
                  )}>
                    <dept.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm leading-tight">{dept.label}</div>
                    <div className={cn("text-[10px] uppercase tracking-wider font-medium opacity-60", activeView === dept.id ? "text-slate-800" : "text-slate-400")}>{dept.desc}</div>
                  </div>

                  {activeView === dept.id && (
                    <div className="absolute right-3 w-2 h-2 bg-slate-900 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Progress Widget */}
          {userId && <SpanishProgressWidget userId={userId} language={language as 'es' | 'en'} />}

          <div className="bg-white rounded-xl p-4 shadow-md border-2 border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-400">Tu insignia</span>
              <Medal className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Star className="w-6 h-6 text-orange-500 fill-orange-500" />
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">Escritor junior</div>
                <div className="text-xs text-slate-500">Nivel {Math.floor(balance / 100) + 1}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden relative flex flex-col min-h-[500px]">
          <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500" />
            </div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              LOC: {activeView.toUpperCase()}
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative bg-stone-50/50">
            <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'linear-gradient(rgba(226, 232, 240, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(226, 232, 240, 0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                className="absolute inset-0 overflow-y-auto p-4 md:p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {activeView === 'chat' ? (
                  <div className="max-w-3xl mx-auto h-full flex flex-col">
                    <div className="flex items-center gap-6 mb-8 p-6 bg-white rounded-2xl border-2 border-slate-100 shadow-sm relative overflow-visible">
                      <div className="relative -ml-2">
                        <div className="absolute -inset-2 bg-purple-300 rounded-full blur opacity-40 animate-pulse" />
                        <LinaAvatar state={avatarState} size={100} mode="spanish" />
                        <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white text-[10px] lowercase font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                          @editor_lina
                        </div>
                      </div>
                      <div className="relative z-10 bubble-left bg-purple-50 p-4 rounded-2xl rounded-tl-none border border-purple-100 text-slate-700 text-sm md:text-base italic leading-relaxed shadow-sm">
                        "¡Hola! Aquí Lina, tu Editor Jefe. ¿Qué historia vamos a cubrir hoy en el mundo del Español?"
                      </div>
                    </div>

                    <div className="flex-1 bg-white border-l-8 border-slate-300 shadow-md rounded-r-lg relative flex flex-col overflow-hidden min-h-[400px]">
                      <div className="absolute left-[-12px] top-0 bottom-0 w-4 flex flex-col gap-4 py-4 z-20">
                        {[...Array(20)].map((_, i) => (
                          <div key={i} className="h-3 w-6 bg-slate-400 rounded-full shadow-inner transform -rotate-6" />
                        ))}
                      </div>

                      <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'linear-gradient(transparent 23px, #94a3b8 24px)', backgroundSize: '100% 24px' }} />
                      <div className="absolute left-6 top-0 bottom-0 w-px bg-red-200/50 pointer-events-none" />

                      <div className="flex-1 relative z-10 pl-6">
                        <ChatInterface
                          messages={messages}
                          onSendMessage={handleSendMessage}
                          onStartGame={() => setActiveView('games')}
                          onOpenReports={() => setShowReports(true)}
                          isTyping={isTyping}
                          studentName={studentName}
                          gradeLevel={gradeLevel}
                          activeReports={tutorReports}
                          immersionMode="standard"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  renderActiveView()
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

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

export default SpanishTutor_mod;
