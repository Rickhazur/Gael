import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useResearchState } from '@/hooks/useResearchState';
import { useLearning } from '@/context/LearningContext';
import { useGamification } from '@/context/GamificationContext';
import { useDemoTour } from '@/context/DemoTourContext';
import { supabase } from '@/services/supabase';
import { recordResearchCompletion } from '@/services/learningProgress';
import { GradeSelector } from './GradeSelector';
import { LanguageToggle } from './LanguageToggle';
import { SaveStatusIndicator } from './SaveStatus';
import { ProgressSteps } from './ProgressSteps';
import { TutorPanel } from './TutorPanel';
import { TextPasteArea } from './TextPasteArea';
import { ReportCompleteness } from './ReportCompleteness';
import { ReportReview } from './ReportReview';
import { CitationHelper } from './CitationHelper';
import { ReportEditor } from './ReportEditor';
import { WritingFeedbackPopup, generateWritingFeedback, type WritingFeedback } from './WritingFeedbackPopup';
import { ResearchTypeSelection } from './ResearchTypeSelection';
import { BookOpen, Sparkles, Search, Loader2, Volume2 } from 'lucide-react';
import { streamConsultation } from '@/services/ai_service';
import { toast } from '@/hooks/use-toast';
import { StationAvatar } from './StationAvatar';
import { LinaAvatar } from '../MathMaestro/tutor/LinaAvatar';
import confetti from 'canvas-confetti';
import { sfx } from '@/services/soundEffects';
import { UniversalNotebook, type NoteData } from '@/components/Notebook/UniversalNotebook';
import type { SourceInfo, Grade } from '@/types/research';
import { notebookService } from '@/services/notebookService';
import { motion } from 'framer-motion';
import { ModelGallery } from '@/components/3D/ModelGallery';
import { edgeTTS } from '@/services/edgeTTS';

interface ResearchCenterProps {
  gradeLevel?: number;
}

export function ResearchCenter({ gradeLevel }: ResearchCenterProps) {
  const {
    state,
    setHypothesis,
    setSourceText,
    setParaphrasedText,
    analyzeSourceText,
    setGrade,
    setLanguage,
    setResearchType,
    saveNow,
    addSource,
    removeSource,
    addTutorMessage,
    checkChildIdea,
  } = useResearchState();

  const { addReport, language: globalLanguage, setLanguage: setGlobalLanguage } = useLearning();
  const { coins, addCoins, addXP } = useGamification();
  const { tourState } = useDemoTour();
  const isTourPlayingStep5 = tourState.isActive && tourState.currentStep === 7;

  // Sync app grade (e.g. pilot quinto) to Research Center
  useEffect(() => {
    if (gradeLevel != null && gradeLevel >= 1 && gradeLevel <= 7 && gradeLevel !== state.grade) {
      setGrade(gradeLevel as Grade);
    }
  }, [gradeLevel, state.grade, setGrade]);

  // Sync global language changes to local state
  useEffect(() => {
    if (globalLanguage) {
      const effectiveLang = globalLanguage === 'bilingual' ? 'es' : globalLanguage;
      if (effectiveLang !== state.language) {
        setLanguage(effectiveLang as any);
      }
    }
  }, [globalLanguage, state.language, setLanguage]);

  const [currentFeedback, setCurrentFeedback] = useState<WritingFeedback | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [hypothesisChatInput, setHypothesisChatInput] = useState('');
  const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
  const [searchQuery, setSearchQuery] = useState(isDemoMode ? 'The Cycle of Water' : '');
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [detectedSubject, setDetectedSubject] = useState<'science' | 'history' | 'geography' | 'other'>('science');
  const lastFeedbackId = useRef<string>('');
  const feedbackCooldown = useRef<boolean>(false);

  // User ID for Supabase persistence
  const [userId, setUserId] = useState<string | null>(null);

  // Conversation history for AI context
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'student' | 'tutor', text: string }>>([]);

  // Audio paths for station voice
  const STATION_GREETING_ES = '/audio/station/research_greeting_es.mp3';
  const STATION_GREETING_EN = '/audio/station/research_greeting_en.mp3';

  // Fetch userId on mount
  useEffect(() => {
    async function fetchUserId() {
      try {
        const { data: { user } } = await supabase?.auth.getUser() || { data: { user: null } };
        if (user?.id) setUserId(user.id);
      } catch (e) {
        console.warn('Could not fetch user for research progress:', e);
      }
    }
    fetchUserId();
  }, []);

  // Detect subject from various sources
  useEffect(() => {
    const textToAnalyze = (state.hypothesis + ' ' + (searchQuery || '')).toLowerCase();
    if (textToAnalyze.match(/(célula|animal|planta|ecosistema|volcán|espacio|planeta|energía|química|experimento|hipótesis|laboratorio|biología|física|science|plant|animal|planet|energy|experiment|biology|physics)/i)) {
      setDetectedSubject('science');
    } else if (textToAnalyze.match(/(historia|época|rey|revolución|cristóbal colón|independencia|imperio|antiguo|maya|azteca|inca|war|history|empire|revolution|war|king|ancient)/i)) {
      setDetectedSubject('history');
    } else if (textToAnalyze.match(/(mapa|país|continente|río|montaña|geografía|clima|océano|población|city|map|country|continent|river|mountain|geography|climate|ocean)/i)) {
      setDetectedSubject('geography');
    }
  }, [state.hypothesis, searchQuery]);

  // Generate writing feedback as user types
  useEffect(() => {
    if (feedbackCooldown.current) return;

    const feedback = generateWritingFeedback(
      state.paraphrasedText,
      state.grade,
      state.language,
      state.sourceText
    );

    if (feedback && feedback.id !== lastFeedbackId.current) {
      lastFeedbackId.current = feedback.id;
      setCurrentFeedback(feedback);
      feedbackCooldown.current = true;
      setTimeout(() => {
        feedbackCooldown.current = false;
      }, 5000);
    }
  }, [state.paraphrasedText, state.grade, state.language, state.sourceText]);

  // Send report to BuddyLearn when analysis updates
  useEffect(() => {
    if (state.analysis) {
      addReport({
        id: `rc-${Date.now()}`,
        source: "research-center",
        subject: "Social Studies",
        emoji: "🌍",
        date: new Date().toISOString(),
        overallScore: 75,
        trend: "stable",
        challenges: [
          {
            id: `c-${Date.now()}`,
            area: "Paraphrasing",
            severity: "medium",
            description: "Improving paraphrasing skills",
            englishConnection: "Writing",
          }
        ],
        recommendations: ["Practice more reading"]
      });
    }
  }, [state.analysis]);

  const handleDismissFeedback = useCallback(() => {
    setCurrentFeedback(null);
  }, []);

  const handleStarterClick = (starter: string) => {
    const currentText = state.paraphrasedText;
    const newText = currentText ? `${currentText}\n\n${starter} ` : `${starter} `;
    setParaphrasedText(newText);
  };

  const handleInsertCitation = (citation: string) => {
    const currentText = state.paraphrasedText;
    const newText = currentText ? `${currentText} ${citation}` : citation;
    setParaphrasedText(newText);
  };

  /* HYPOTHESIS HANDLER (puede recibir texto enviado por chat) */
  const handleHypothesisSubmit = async (submittedText?: string) => {
    const text = (submittedText != null && submittedText.trim() !== '') ? submittedText.trim() : state.hypothesis;
    if (submittedText != null && submittedText.trim() !== '') {
      setHypothesis(submittedText.trim());
    }

    // Add to conversation history
    setConversationHistory(prev => [...prev.slice(-10), { role: 'student', text }]);

    // Check for "I don't know" - uncertainty
    const uncertaintyRegex = /(no\s*s[eé]|i\s*don'?t\s*know|no\s*idea|ayuda|help|no\s*sé\s*qué\s*poner|i\s*am\s*stuck)/i;

    if (uncertaintyRegex.test(text) || text.length < 5) {
      // Trigger AI Help (hipótesis solo para ciencias/matemáticas; otras materias: preguntas/metas)
      setIsResearching(true);
      try {
        const useHypothesis = state.researchType === 'scientific';

        // Build conversation context
        const recentHistory = conversationHistory.slice(-6).map(m =>
          `${m.role === 'student' ? 'Estudiante' : 'Tutor'}: ${m.text}`
        ).join('\n');

        const prompt = `Actúa como un profesor guía para un niño de ${state.grade} grado.
         El niño está tratando de formular un ${useHypothesis ? 'hipótesis' : 'objetivo de investigación'} para un reporte pero dice: "${text}".
         
         ${recentHistory ? `CONVERSACIÓN RECIENTE:\n${recentHistory}\n\n` : ''}
         REGLA DE ORO:
         - Si el tipo de investigación es CIENTÍFICO (ciencias/matemáticas): Dale 3 Hipótesis (ej: "Si hago X, entonces pasará Y").
         - Si es INFORMATIVO (historia, geografía, otros): NO uses la palabra 'hipótesis'. Dale 3 "Preguntas de Investigación" o "Metas de Descubrimiento" interesantes.
         
         Sé breve, amable y motivador.
         Formato: Solo dame las 3 ideas enumeradas.
         Idioma: ${state.language === 'es' ? 'Español' : 'Inglés'}.`;

        let hintText = "";
        const stream = streamConsultation([], prompt, undefined, false);
        for await (const chunk of stream) {
          if (chunk.text) hintText += chunk.text;
        }

        // Add tutor response to history
        setConversationHistory(prev => [...prev.slice(-10), { role: 'tutor', text: hintText.slice(0, 200) }]);

        addTutorMessage({
          id: Date.now().toString(),
          type: 'tip',
          message: state.language === 'es' ? '¡No te preocupes! Aquí tienes algunas ideas:' : 'Don\'t worry! Here are some ideas:',
          icon: '💡',
          starters: []
        });

        addTutorMessage({
          id: Date.now().toString() + '2',
          type: 'encouragement',
          message: hintText,
          icon: '✨'
        });

      } catch (e) {
        console.error("Hypothesis help failed:", e);
      } finally {
        setIsResearching(false);
      }
      return;
    }

    // If valid hypothesis
    setSourceText(''); // Triggers step advance

    const isScientific = state.researchType === 'scientific';
    addCoins(10, state.language === 'es' ? (isScientific ? '¡Buena Hipótesis!' : '¡Buena Meta!') : (isScientific ? 'Good Hypothesis!' : 'Good Goal!'));
    sfx.playSuccess();

    // Persist hypothesis to Supabase
    if (userId) {
      recordResearchCompletion(userId, 'hypothesis', true, 10, 5);
    }

    toast({
      title: state.language === 'es' ? (isScientific ? '¡Hipótesis Registrada!' : '¡Meta Registrada!') : (isScientific ? 'Hypothesis Saved!' : 'Goal Saved!'),
      description: state.language === 'es' ? 'Ahora busquemos información para tu investigación.' : 'Now let\'s find information for your research.',
    });
  };

  const handleSmartSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery || searchQuery;
    if (!queryToUse.trim() || isResearching) return;

    setIsResearching(true);
    setSourceText('');
    let fullText = '';

    try {
      // INCLUDE HYPOTHESIS/GOAL IN CONTEXT (hipótesis solo para tipo científico)
      const isScientific = state.researchType === 'scientific';
      const hypothesisContext = state.hypothesis
        ? (state.language === 'es'
          ? `${isScientific ? 'Hipótesis' : 'Meta'} del estudiante: "${state.hypothesis}". Contextualiza la búsqueda para investigar esto.`
          : `${isScientific ? 'Student Hypothesis' : 'Student Goal'}: "${state.hypothesis}". Contextualize search to investigate this.`)
        : "";

      const prompt = `Actúa como un Bibliotecario Experto para niños de ${state.grade} grado.
            Investiga sobre: "${queryToUse}".
            ${hypothesisContext}
            Proporciona un texto fuente informativo, veraz y fácil de entender de unas 300 palabras.
            Al final, incluye una pequeña cita bibliográfica sugerida.
            Idioma: ${state.language === 'es' ? 'Español' : 'Inglés'}.`;

      const stream = streamConsultation([], prompt, undefined, true);

      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
          setSourceText(fullText);
        }
      }

      addCoins(20, state.language === 'es' ? 'Investigación IA completada' : 'AI Research completed');
      addXP(40);
      sfx.playSuccess();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      // Add to conversation history
      setConversationHistory(prev => [...prev.slice(-10), { role: 'tutor', text: `Investigación: ${fullText.slice(0, 150)}...` }]);

      // Persist analysis completion to Supabase
      if (userId) {
        recordResearchCompletion(userId, 'analysis', true, 40, 20);
      }

      toast({
        title: state.language === 'es' ? '¡Investigación lista!' : 'Research ready!',
        description: state.language === 'es' ? 'He encontrado información para tu reporte.' : 'I found information for your report.',
      });
    } catch (error) {
      console.error("Research Error:", error);
      toast({
        title: "Error",
        description: "No pude completar la investigación. Intenta pegar el texto manualmente.",
        variant: "destructive"
      });
    } finally {
      setIsResearching(false);
    }
  };

  // Subject for notebook: science, history, geography, other (guarda en el cuaderno correspondiente)
  const notebookSubject = detectedSubject;

  const saveReportToNotebook = useCallback(
    (opts?: { silent?: boolean }) => {
      const topic = (searchQuery || state.hypothesis?.slice(0, 80) || 'Research').trim().slice(0, 100) || 'Research';
      const summary = state.paraphrasedText?.trim() || state.sourceText?.trim().slice(0, 2000) || '';
      if (!summary) return;

      const note: NoteData = {
        topic,
        date: new Date().toLocaleDateString(),
        summary,
        boardImage: null,
        subject: notebookSubject as any,
      };
      notebookService.saveNote(note as any, { silent: opts?.silent ?? true });
    },
    [searchQuery, state.hypothesis, state.paraphrasedText, state.sourceText, notebookSubject]
  );

  const handleSubmitReport = () => {
    saveNow();
    saveReportToNotebook({ silent: true });
    setIsNotebookOpen(true);
    addCoins(50, state.language === 'es' ? 'Reporte completado' : 'Report completed');
    addXP(100);
    sfx.playSuccess();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });

    // Persist progress to Supabase
    if (userId) {
      const isPlagiarismFree = !(state.analysis?.isPlagiarism);
      recordResearchCompletion(userId, 'report_complete', isPlagiarismFree, 100, 50);
      if (isPlagiarismFree) {
        recordResearchCompletion(userId, 'paraphrasing', true, 20, 10);
      }
      if (state.sources && state.sources.length > 0) {
        recordResearchCompletion(userId, 'citations', true, 15, 5);
      }
    }

    const subjectLabel = state.language === 'es'
      ? (notebookSubject === 'science' ? 'Ciencias' : notebookSubject === 'history' ? 'Historia' : notebookSubject === 'geography' ? 'Geografía' : 'notas')
      : notebookSubject;
    toast({
      title: state.language === 'es' ? 'Guardado en tu cuaderno' : 'Saved to your notebook',
      description: state.language === 'es' ? `El reporte se guardó en el cuaderno de ${subjectLabel}.` : `Report saved to your ${subjectLabel} notebook.`,
    });
  };

  // Auto-guardar en cuaderno si el niño tiene contenido pero no pulsa "Guardar"
  const lastAutoSavedRef = useRef<string>('');
  useEffect(() => {
    const summary = state.paraphrasedText?.trim() || '';
    if (!state.analysis || summary.length < 30) return;
    const key = `${summary.length}-${summary.slice(0, 50)}`;
    if (lastAutoSavedRef.current === key) return;
    const t = setTimeout(() => {
      lastAutoSavedRef.current = key;
      saveReportToNotebook({ silent: true });
    }, 4000);
    return () => clearTimeout(t);
  }, [state.paraphrasedText, state.analysis, saveReportToNotebook]);

  // LISTENER FOR DEMO AUDIO ANIMATION + STATION VOICE (deep/robotic Spanish)
  const [isDemoSpeaking, setIsDemoSpeaking] = useState(false);
  const [currentDemoVoice, setCurrentDemoVoice] = useState<string>('');

  useEffect(() => {
    const startSpeaking = (e: any) => {
      setIsDemoSpeaking(true);
      if (e.detail?.voice) setCurrentDemoVoice(e.detail.voice);
    };
    const stopSpeaking = () => {
      setIsDemoSpeaking(false);
      setCurrentDemoVoice('');
    };

    window.addEventListener('nova-demo-voice', startSpeaking);
    window.addEventListener('nova-demo-voice-end', stopSpeaking);

    return () => {
      window.removeEventListener('nova-demo-voice', startSpeaking);
      window.removeEventListener('nova-demo-voice-end', stopSpeaking);
    };
  }, []);

  const handlePlayStationVoice = async () => {
    if (isTourPlayingStep5) return;

    // Dispatch voice start event for animation
    window.dispatchEvent(new CustomEvent('nova-demo-voice', { detail: { voice: 'onyx', lang: state.language } }));

    try {
      // Use Edge TTS to generate the greeting
      const greetingText = state.language === 'es'
        ? "Bienvenido al Centro de Investigación Nova. Sistema de análisis activado. Listo para asistir en tu proyecto."
        : "Welcome to Nova Research Center. Analysis system activated. Ready to assist with your project.";

      // Use Lina's voice with slightly lower pitch for a more "robotic" station feel
      await edgeTTS.speak(greetingText, 'lina', { pitch: 0.9, rate: 0.95 });

    } catch (error) {
      console.warn('Station voice playback error:', error);
    } finally {
      // Dispatch voice end event
      window.dispatchEvent(new CustomEvent('nova-demo-voice-end'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-poppins relative overflow-hidden selection:bg-cyan-300 selection:text-slate-900">

      {/* COSMIC LAB BACKGROUND */}
      <div className="absolute inset-0 z-0">
        {/* Deep Space Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a1a] to-black" />

        {/* Twinkling Stars */}
        <div className="absolute inset-0 opacity-60">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute bg-white rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                scale: Math.random() * 0.5 + 0.5,
                opacity: Math.random()
              }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1 }}
            />
          ))}
        </div>

        {/* Animated Comets */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-64 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-white rounded-full blur-[1px]"
            initial={{ x: -300, y: 100, opacity: 0, rotate: 45 }}
            animate={{ x: 2000, y: -500, opacity: [0, 1, 0] }}
            transition={{ duration: 7, repeat: Infinity, repeatDelay: 5, ease: "linear" }}
          />
          <motion.div
            className="absolute w-40 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-white rounded-full blur-[1px]"
            initial={{ x: -200, y: 600, opacity: 0, rotate: -15 }}
            animate={{ x: 2000, y: 800, opacity: [0, 0.8, 0] }}
            transition={{ duration: 12, repeat: Infinity, repeatDelay: 8, ease: "linear" }}
          />
        </div>

        {/* Floating Asteroids */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`asteroid-${i}`}
            className="absolute opacity-80"
            initial={{
              x: -100,
              y: 100 + i * 200,
              rotate: 0
            }}
            animate={{
              x: '120vw',
              y: 100 + i * 200 + (i % 2 === 0 ? 50 : -50),
              rotate: 360
            }}
            transition={{
              duration: 30 + i * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className={`w-${16 + i * 8} h-${16 + i * 8} bg-gradient-to-br from-slate-600 to-slate-800 rounded-full blur-[1px] shadow-lg border border-slate-500/30`} />
          </motion.div>
        ))}

        {/* Planet Effect (Subtle) */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-transparent rounded-full blur-3xl opacity-50" />
      </div>

      {/* Lab Window Grid Overlay (To create the "Window" feel) */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]"></div>

      <WritingFeedbackPopup feedback={currentFeedback} onDismiss={handleDismissFeedback} />


      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-4 border-black/5 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md p-2 rounded-2xl border-2 border-dashed border-stone-200">
              <div className="w-12 h-12 rounded-xl bg-kids-blue flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-fredoka text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
                  {state.language === 'es' ? 'Centro de Investigación' : 'Research Center'}
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-bounce" />
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {state.language === 'es' ? 'Objetivo: redactar un buen documento de investigación sin copiar ni pegar.' : 'Goal: write a good research document without copy-paste.'}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {state.language === 'es' ? '📚 Historia • 🌍 Geografía • 🔬 Ciencias' : '📚 History • 🌍 Geography • 🔬 Sciences'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap bg-white/90 backdrop-blur-md p-2 rounded-2xl border-2 border-stone-100 shadow-sm">
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-xl border-2 border-yellow-400/50">
                <span className="text-xl">🪙</span>
                <span className="font-black text-slate-800">{coins}</span>
              </div>
              <div className="w-px h-8 bg-stone-200"></div>
              <GradeSelector grade={state.grade} onChange={setGrade} language={state.language} />
              <div className="w-px h-8 bg-stone-200"></div>
              <LanguageToggle language={state.language} onChange={(lang) => { setLanguage(lang as any); setGlobalLanguage(lang); }} />
              <div className="w-px h-8 bg-stone-200"></div>
              <SaveStatusIndicator status={state.saveStatus} language={state.language} onSave={saveNow} />
            </div>
          </div>
          <div className="mt-6 max-w-3xl mx-auto">
            <ProgressSteps currentStep={state.currentStep} language={state.language} subject={detectedSubject} researchType={state.researchType} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">

            {/* STEP 0: TYPE SELECTION */}
            {state.currentStep === 'type_selection' && (
              <ResearchTypeSelection
                language={state.language}
                onSelect={(type, initialQuestion) => {
                  setResearchType(type, initialQuestion);
                  sfx.playClick();
                  addTutorMessage({
                    id: 'type-select',
                    type: 'encouragement',
                    message: state.language === 'es'
                      ? `¡Excelente! Tu pregunta de investigación ya está lista. Ahora busca información y redacta con tus propias palabras.`
                      : `Great! Your research question is set. Now find information and write in your own words.`,
                    icon: '🚀'
                  });
                }}
              />
            )}

            {/* STEP 1: HYPOTHESIS — el estudiante escribe en el chat (columna derecha), no hay panel de opciones aquí */}

            {/* STEP 2: SEARCH & SOURCE (Visible if NOT hypothesis or type_selection) */}
            {state.currentStep !== 'hypothesis' && state.currentStep !== 'type_selection' && !state.analysis && (
              <>
                <div className="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 border-2 border-dashed border-indigo-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                  <h3 className="font-fredoka text-lg font-bold text-indigo-600 mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    {state.language === 'es' ? '¿Sobre qué quieres investigar?' : 'What do you want to research?'}
                  </h3>
                  <form onSubmit={handleSmartSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={state.language === 'es' ? 'Ej: El Ciclo del Agua, Los Volcanes...' : 'Ex: The Water Cycle, Volcanoes...'}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-100 focus:border-indigo-400 focus:outline-none text-sm font-medium"
                      disabled={isResearching}
                    />
                    <button
                      type="submit"
                      disabled={isResearching || !searchQuery.trim()}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center"
                    >
                      {isResearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {state.language === 'es' ? 'Investigar' : 'Research'}
                    </button>
                  </form>

                  {/* Research Suggestions */}
                  <div className="mt-4 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">
                      {state.language === 'es' ? 'Sugerencias:' : 'Suggestions:'}
                    </span>
                    {[
                      { es: 'El Ciclo del Agua', en: 'The Water Cycle', icon: '💧' },
                      { es: 'Los Volcanes', en: 'Volcanoes', icon: '🌋' },
                      { es: 'Sistema Solar', en: 'Solar System', icon: '🪐' },
                      { es: 'Dinosaurios', en: 'Dinosaurs', icon: '🦖' }
                    ].map((s, i) => (
                      <button
                        key={i}
                        onClick={() => { setSearchQuery(state.language === 'es' ? s.es : s.en); handleSmartSearch(undefined, state.language === 'es' ? s.es : s.en); }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100 transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <span>{s.icon}</span>
                        {state.language === 'es' ? s.es : s.en}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-3xl p-1 border-2 border-stone-100 shadow-lg">
                  <TextPasteArea value={state.sourceText} onChange={setSourceText} onAnalyze={analyzeSourceText} language={state.language} disabled={state.isAnalyzing} />
                </div>
              </>
            )}

            {/* STEP 3+: REPORT EDITOR (When Analysis is Ready) */}
            {state.analysis && (
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-1 border-2 border-indigo-400 shadow-[8px_8px_0px_0px_rgba(79,70,229,1)]">
                <ReportEditor value={state.paraphrasedText} onChange={setParaphrasedText} language={state.language} analysis={state.analysis} disabled={state.isAnalyzing} grade={state.grade} />
              </div>
            )}

          </div>

          <div className="lg:sticky lg:top-40 lg:self-start space-y-6">
            <div className={`flex items-center gap-4 p-5 bg-white/90 backdrop-blur-md rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${currentDemoVoice === 'onyx' && !isTourPlayingStep5 ? 'ring-4 ring-cyan-400 animate-pulse' : ''} ${isTourPlayingStep5 ? 'opacity-45' : ''}`}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-bl-full"></div>
              <div className="relative -mt-2">
                {currentDemoVoice === 'onyx' ? (
                  <StationAvatar isSpeaking={isDemoSpeaking} size={80} />
                ) : (
                  <LinaAvatar state={isDemoSpeaking ? 'speaking' : (state.isAnalyzing || isResearching ? 'thinking' : 'idle')} size={80} />
                )}
              </div>
              <div className="relative z-10 flex-1">
                <h2 className="font-fredoka text-xl font-black text-slate-800">
                  {currentDemoVoice === 'onyx'
                    ? (state.language === 'es' ? 'Inteligencia de Estación' : 'Station Intelligence')
                    : (state.language === 'es' ? 'La Profe Lina' : 'Ms. Rachelle')}
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  {currentDemoVoice === 'onyx'
                    ? (state.language === 'es' ? 'Sincronizando datos galácticos...' : 'Syncing galactic data...')
                    : (state.language === 'es' ? '¡Estoy aquí para ayudarte a escribir!' : 'I\'m here to help you write!')}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border-2 border-black ${state.grade <= 2 ? 'bg-pink-500 text-white' : 'bg-green-500 text-white'}`}>
                    <Sparkles className="w-3 h-3" />
                    {state.language === 'es' ? `${state.grade}º Grado` : `Grade ${state.grade}`}
                  </div>
                  <button
                    type="button"
                    onClick={handlePlayStationVoice}
                    disabled={isTourPlayingStep5}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 border-cyan-500 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    title={state.language === 'es' ? 'Escuchar voz de la estación (profunda, robotizada)' : 'Listen to station voice (deep, robotic)'}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {state.language === 'es' ? 'Escuchar' : 'Listen'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-3xl border-2 border-stone-200 shadow-sm overflow-hidden flex flex-col">
              {state.currentStep === 'hypothesis' && (
                <div className="p-6 flex flex-col gap-4 border-b border-stone-100">
                  <p className="font-fredoka text-lg font-bold text-slate-800">
                    {state.researchType === 'scientific'
                      ? (state.language === 'es' ? '¿Cuál es tu hipótesis? Escríbela en el chat de abajo.' : 'What is your hypothesis? Write it in the chat below.')
                      : (state.language === 'es' ? '¿Cuál es tu meta de investigación? Escríbela en el chat de abajo.' : 'What is your research goal? Write it in the chat below.')}
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const text = hypothesisChatInput.trim();
                      if (text.length >= 5) {
                        handleHypothesisSubmit(text);
                        setHypothesisChatInput('');
                      }
                    }}
                    className="flex flex-col gap-3"
                  >
                    <textarea
                      value={hypothesisChatInput}
                      onChange={(e) => setHypothesisChatInput(e.target.value)}
                      placeholder={state.language === 'es'
                        ? 'Ej: Creo que las plantas crecen más con luz solar...'
                        : 'E.g. I think plants grow more with sunlight...'}
                      className="w-full min-h-[100px] p-4 rounded-xl border-2 border-stone-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 focus:outline-none resize-none text-slate-700 placeholder:text-stone-400"
                      disabled={isResearching}
                    />
                    <button
                      type="submit"
                      disabled={isResearching || hypothesisChatInput.trim().length < 5}
                      className="self-end px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center gap-2"
                    >
                      {isResearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {state.language === 'es' ? 'Enviar hipótesis' : 'Submit hypothesis'}
                    </button>
                  </form>
                </div>
              )}
              <div className={state.currentStep === 'hypothesis' ? 'p-4' : ''}>
                <TutorPanel
                  messages={state.tutorMessages}
                  isAnalyzing={state.isAnalyzing}
                  language={state.language}
                  onStarterClick={handleStarterClick}
                  hideStarters={state.currentStep === 'hypothesis'}
                  onCheckIdea={checkChildIdea}
                  showSocraticInput={!!state.analysis?.paragraphs && state.currentParagraphIndex < (state.analysis.paragraphs.length - 1)}
                  targetParagraphText={state.analysis?.paragraphs?.[state.currentParagraphIndex + 1]?.content}
                />
              </div>
            </div>

            {state.analysis && (
              <div className="space-y-6">
                <div className="bg-indigo-50 rounded-3xl border-2 border-indigo-200 p-4">
                  <CitationHelper grade={state.grade} language={state.language} sources={state.sources} onAddSource={addSource} onRemoveSource={removeSource} onInsertCitation={handleInsertCitation} />
                </div>
                <div className="bg-white/90 backdrop-blur-md rounded-3xl border-2 border-stone-200 p-4 shadow-sm">
                  <ReportCompleteness paraphrasedText={state.paraphrasedText} analysis={state.analysis} grade={state.grade} language={state.language} />
                </div>
                <ReportReview paraphrasedText={state.paraphrasedText} sourceText={state.sourceText} analysis={state.analysis} grade={state.grade} language={state.language} onRequestFeedback={handleSubmitReport} />
              </div>
            )}
          </div>
        </div>

        {/* 3D/AR MODEL EXPLORATION SECTION */}
        <div className="mt-16 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-400/30 rounded-3xl p-8 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-white mb-3 flex items-center justify-center gap-3">
                <span className="text-5xl">🔬</span>
                {state.language === 'es' ? 'Exploración 3D/AR' : '3D/AR Exploration'}
              </h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                {state.language === 'es'
                  ? 'Visualiza lo que estás investigando en 3D. En el móvil, usa AR para verlo en tu espacio.'
                  : 'Visualize what you\'re researching in 3D. On mobile, use AR to see it in your space.'}
              </p>
            </div>

            <ModelGallery
              language={state.language}
              grade={state.grade}
              initialSearchQuery={searchQuery}
              onAddIdeaToReport={(idea) => {
                const currentText = state.paraphrasedText;
                const newText = currentText ? `${currentText}\n\n${idea}` : idea;
                setParaphrasedText(newText);
                toast({
                  title: state.language === 'es' ? '💡 Idea agregada' : '💡 Idea added',
                  description: state.language === 'es' ? 'La idea del modelo 3D se agregó a tu reporte.' : 'The 3D model idea was added to your report.',
                });
              }}
            />
          </div>
        </div>
      </main>

      <footer className="mt-auto py-8 text-center text-sm font-bold text-stone-400 bg-white/90 backdrop-blur-md border-t-4 border-black/5">
        <p className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          {state.language === 'es' ? 'Nova te enseña a escribir, no a copiar y pegar.' : 'Nova teaches you to write, not to copy-paste.'}
          <Sparkles className="w-4 h-4 text-yellow-500" />
        </p>
      </footer>

      <UniversalNotebook
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        language={state.language === 'es' ? 'es' : 'en'}
        onSave={(data: NoteData) => {
          notebookService.saveNote({ ...data, subject: notebookSubject as any });
        }}
        getNoteData={() => {
          return {
            topic: searchQuery || state.hypothesis?.slice(0, 80) || "Research Project",
            date: new Date().toLocaleDateString(),
            summary: state.paraphrasedText || "No text content properly saved.",
            boardImage: null,
            subject: notebookSubject as any
          };
        }}
        onStudy={() => {
          setIsNotebookOpen(false);
          toast({
            title: state.language === 'es' ? 'Ollie está leyendo tu reporte...' : 'Ollie is reading your report...',
            description: state.language === 'es' ? '¡Prepárate para preguntas!' : 'Get ready for questions!'
          });
        }}
      />
    </div>
  );
}
