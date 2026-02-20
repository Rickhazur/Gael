import { useState, useCallback, useEffect, useRef } from 'react';
import type { ResearchState, Step, Grade, Language, Report, SaveStatus, SourceInfo, TutorMessage, ParagraphAnalysis } from '@/types/research';
import { analyzeText, checkPlagiarism, generateTutorMessages } from '@/lib/textAnalyzer';
import { callOpenAI } from '@/services/openai';

const STORAGE_KEY = 'nova-research-reports';
const AUTOSAVE_DELAY = 2000;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function loadReports(): Report[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const reports = JSON.parse(stored);
      return reports.map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
      }));
    }
  } catch (e) {
    console.error('Error loading reports:', e);
  }
  return [];
}

function saveReports(reports: Report[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('Error saving reports:', e);
  }
}

const initialState: ResearchState = {
  currentStep: 'type_selection',
  researchType: null,
  hypothesis: '',
  sourceText: '',
  paraphrasedText: '',
  grade: 3,
  language: 'es',
  analysis: null,
  tutorMessages: [],
  saveStatus: 'idle',
  isAnalyzing: false,
  sources: [],
  currentParagraphIndex: 0,
};

export function useResearchState() {
  const [state, setState] = useState<ResearchState>(initialState);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>(() => loadReports());

  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Save reports to localStorage whenever they change
  useEffect(() => {
    saveReports(reports);
  }, [reports]);

  // Autosave functionality
  const triggerAutosave = useCallback(() => {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }

    setState(prev => ({ ...prev, saveStatus: 'saving' }));

    autosaveTimer.current = setTimeout(() => {
      setReports(prev => {
        if (!currentReportId) return prev;

        const index = prev.findIndex(r => r.id === currentReportId);
        if (index === -1) return prev;

        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          hypothesis: state.hypothesis,
          sourceText: state.sourceText,
          paraphrasedText: state.paraphrasedText,
          grade: state.grade,
          language: state.language,
          researchType: state.researchType || 'informative',
          updatedAt: new Date(),
        };
        return updated;
      });

      setState(prev => ({ ...prev, saveStatus: 'saved' }));

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, saveStatus: 'idle' }));
      }, 2000);
    }, AUTOSAVE_DELAY);
  }, [currentReportId, state.hypothesis, state.sourceText, state.paraphrasedText, state.grade, state.language]);

  // Set Research Type (optional: pre-fill hypothesis with the selected research question)
  const setResearchType = useCallback((type: 'scientific' | 'informative', initialQuestion?: string) => {
    setState(prev => ({
      ...prev,
      researchType: type,
      hypothesis: initialQuestion?.trim() || prev.hypothesis,
      currentStep: type === 'scientific' ? 'hypothesis' : 'paste', // Informative skips hypothesis
    }));
  }, []);

  // Set hypothesis
  const setHypothesis = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      hypothesis: text,
      currentStep: text.trim() ? (prev.sourceText ? prev.currentStep : 'hypothesis') : 'hypothesis',
    }));

    if (currentReportId && text.trim()) {
      triggerAutosave();
    }
  }, [currentReportId, triggerAutosave]);

  // Set source text
  const setSourceText = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      sourceText: text,
      currentStep: text.trim() ? 'analyze' : 'paste',
    }));

    if (currentReportId && text.trim()) {
      triggerAutosave();
    }
  }, [currentReportId, triggerAutosave]);

  // Set paraphrased text
  const setParaphrasedText = useCallback((text: string) => {
    setState(prev => {
      // Check for plagiarism in real-time
      if (prev.sourceText && text.length > 20) {
        const plagiarismResult = checkPlagiarism(prev.sourceText, text);
        const updatedAnalysis = prev.analysis
          ? { ...prev.analysis, ...plagiarismResult }
          : null;

        // Regenerate messages if plagiarism detected
        const messages = updatedAnalysis
          ? generateTutorMessages(updatedAnalysis, prev.grade, prev.language, 'paraphrase')
          : prev.tutorMessages;

        return {
          ...prev,
          paraphrasedText: text,
          analysis: updatedAnalysis,
          tutorMessages: messages,
          currentStep: text.trim() ? 'paraphrase' : 'analyze',
        };
      }

      return {
        ...prev,
        paraphrasedText: text,
        currentStep: text.trim() ? 'paraphrase' : 'analyze',
      };
    });

    if (currentReportId && text.trim()) {
      triggerAutosave();
    }
  }, [currentReportId, triggerAutosave]);

  // Analyze source text with pedagogical breakdown
  const analyzeSourceText = useCallback(async () => {
    setState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      const isSpanish = state.language === 'es';
      const prompt = `Actúa como un Tutor Pedagógico (Estilo Sherlock Holmes o Detective) para un niño de ${state.grade} grado.
      Divide este texto en párrafos coherentes (máximo 4).
      Para cada párrafo, identifica:
      1. La Idea Principal (Main Idea).
      2. 2-3 frases de soporte exactas del texto.
      3. Técnica Detectiva: Explica PASO A PASO cómo llegaste a la conclusión.
         - Paso 1 (Sujeto): ¿De qué o de quién se habla principalmente? (El protagonista del párrafo).
         - Paso 2 (Idea): ¿Qué es lo más importante que hace o que se dice de él?
         - Paso 3 (Umbrella): Di por qué esa frase "abre un paraguas" que cubre todo lo demás.
      
      IMPORTANTE: Responde SOLO en formato JSON.
      Idioma de la respuesta: ${isSpanish ? 'Español' : 'Inglés'}.

      Texto: ${state.sourceText}`;

      const response = await callOpenAI(
        "Eres un Tutor Detectiva experto en enseñar comprensión lectora a niños.",
        [],
        prompt,
        true
      );

      const paragraphs: ParagraphAnalysis[] = response.paragraphs.map((p: any, index: number) => ({
        ...p,
        isDiscovered: index === 0
      }));

      setState(prev => {
        const analysis = analyzeText(prev.sourceText, prev.language);
        analysis.paragraphs = paragraphs;

        const messages = generateTutorMessages(analysis, prev.grade, prev.language, 'analyze');

        // ANIMATED BREAKDOWN FOR FIRST PARAGRAPH
        const firstP = paragraphs[0];
        if (firstP) {
          // Message 1: Simple explanation with examples
          messages.push({
            id: 'pedagogical-intro-1',
            type: 'analysis',
            icon: '💡',
            message: isSpanish
              ? `Aqui te muestro el truco! 🎯\n\nLa idea principal es LO MAS IMPORTANTE:\n[MAIN_IDEA]${firstP.mainIdea}[/MAIN_IDEA]\n\nEs como LO QUE NO DEBES OLVIDAR del texto.\n\nPiensa en esto: si lees sobre tu pelicula favorita, lo importante es QUE TRATA (superheroes, animales, etc.). Los detalles (que colores, cuantos personajes) ayudan pero NO son lo MAS importante.`
              : `Here's the trick! 🎯\n\nThe Main Idea is the MOST IMPORTANT THING:\n[MAIN_IDEA]${firstP.mainIdea}[/MAIN_IDEA]\n\nIt's like WHAT YOU SHOULD NOT FORGET from the text.\n\nThink about this: if you read about your favorite movie, what's important is WHAT IT'S ABOUT (superheroes, animals, etc.). Details (what colors, how many characters) help but are NOT the most important.`,
          });

          // Message 2: Secondary ideas explanation
          messages.push({
            id: 'pedagogical-intro-2',
            type: 'tip',
            icon: '📌',
            message: isSpanish
              ? `La Idea Secundaria son los DETALLES que completan la principal:\n[SECONDARY_IDEA]${firstP.secondaryIdea || 'informacion que ayuda a entender mas'}[/SECONDARY_IDEA]\n\nUn ejemplo facil:\n🎯 Idea Principal: "Voy a la escuela"\n📌 Idea Secundaria: "Para aprender y jugar con mis amigos"\n\nLa secundaria responde a preguntas como: Por que? o Como?`
              : `The Secondary Idea is the DETAILS that complete the main one:\n[SECONDARY_IDEA]${firstP.secondaryIdea || 'information that helps us understand more'}[/SECONDARY_IDEA]\n\nAn easy example:\n🎯 Main Idea: "I go to school"\n📌 Secondary Idea: "To learn and play with my friends"\n\nThe secondary answers questions like: Why? or How?`,
          });

          if (paragraphs.length > 1) {
            messages.push({
              id: 'pedagogical-challenge',
              type: 'encouragement',
              icon: '⚡',
              message: isSpanish
                ? `PERFECTO! Ya entendiste el truco? 🎉\n\nAhora VAS A INTENTARLO TU en el siguiente parrafo.\n\nRecuerda:\n💡 Busca LO MAS IMPORTANTE (idea principal)\n📌 Busca LOS DETALLES que la ayudan (idea secundaria)\n\nVAS A PODER! 💪`
                : `PERFECT! Did you get the trick? 🎉\n\nNow YOU'RE GOING TO TRY it in the next paragraph.\n\nRemember:\n💡 Find THE MOST IMPORTANT (main idea)\n📌 Find THE DETAILS that help it (secondary idea)\n\nYOU CAN DO IT! 💪`,
            });
          }
        }

        return {
          ...prev,
          analysis,
          tutorMessages: messages,
          isAnalyzing: false,
          currentStep: 'paraphrase',
          currentParagraphIndex: 0,
        };
      });
    } catch (error) {
      console.error("Pedagogical analysis failed:", error);
      // Fallback to basic analysis
      setState(prev => {
        const analysis = analyzeText(prev.sourceText, prev.language);
        const messages = generateTutorMessages(analysis, prev.grade, prev.language, 'analyze');
        return {
          ...prev,
          analysis,
          tutorMessages: messages,
          isAnalyzing: false,
          currentStep: 'paraphrase',
        };
      });
    }
  }, [state.sourceText, state.language, state.grade]);

  // Set grade
  const setGrade = useCallback((grade: Grade) => {
    setState(prev => {
      const messages = prev.analysis
        ? generateTutorMessages(prev.analysis, grade, prev.language, prev.currentStep)
        : prev.tutorMessages;

      return { ...prev, grade, tutorMessages: messages };
    });

    if (currentReportId) {
      triggerAutosave();
    }
  }, [currentReportId, triggerAutosave]);

  // Set language
  const setLanguage = useCallback((language: Language) => {
    setState(prev => {
      const messages = prev.analysis
        ? generateTutorMessages(prev.analysis, prev.grade, language, prev.currentStep)
        : prev.tutorMessages;

      return { ...prev, language, tutorMessages: messages };
    });

    if (currentReportId) {
      triggerAutosave();
    }
  }, [currentReportId, triggerAutosave]);

  // Create new report
  const createNewReport = useCallback((title: string) => {
    const newReport: Report = {
      id: generateId(),
      title,
      hypothesis: state.hypothesis,
      sourceText: state.sourceText,
      paraphrasedText: state.paraphrasedText,
      grade: state.grade,
      language: state.language,
      researchType: state.researchType || 'informative',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setReports(prev => [...prev, newReport]);
    setCurrentReportId(newReport.id);
    setState(prev => ({ ...prev, saveStatus: 'saved' }));

    return newReport.id;
  }, [state]);

  // Load existing report
  const loadReport = useCallback((reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setCurrentReportId(reportId);
      setState(prev => ({
        ...prev,
        hypothesis: report.hypothesis || '',
        sourceText: report.sourceText,
        paraphrasedText: report.paraphrasedText,
        grade: report.grade,
        language: report.language,
        researchType: report.researchType || 'informative',
        currentStep: report.paraphrasedText ? 'review' : report.sourceText ? 'analyze' : (report.hypothesis ? 'paste' : 'hypothesis'),
        saveStatus: 'saved',
      }));

      // Re-analyze if there's source text
      if (report.sourceText) {
        const analysis = analyzeText(report.sourceText, report.language);
        if (report.paraphrasedText) {
          const plagiarismResult = checkPlagiarism(report.sourceText, report.paraphrasedText);
          Object.assign(analysis, plagiarismResult);
        }
        const messages = generateTutorMessages(analysis, report.grade, report.language, 'analyze');
        setState(prev => ({ ...prev, analysis, tutorMessages: messages }));
      }
    }
  }, [reports]);

  // Reset state
  const resetState = useCallback(() => {
    setState(initialState);
    setCurrentReportId(null);
  }, []);

  // Manual save
  const saveNow = useCallback(() => {
    if (!currentReportId) {
      // Create a new report with auto-generated title
      const title = state.language === 'es'
        ? `Mi Reporte ${new Date().toLocaleDateString('es')}`
        : `My Report ${new Date().toLocaleDateString('en')}`;
      createNewReport(title);
    } else {
      // Force immediate save
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }

      setState(prev => ({ ...prev, saveStatus: 'saving' }));

      setReports(prev => {
        const index = prev.findIndex(r => r.id === currentReportId);
        if (index === -1) return prev;

        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          hypothesis: state.hypothesis,
          sourceText: state.sourceText,
          paraphrasedText: state.paraphrasedText,
          grade: state.grade,
          language: state.language,
          researchType: state.researchType || 'informative',
          updatedAt: new Date(),
        };
        return updated;
      });

      setState(prev => ({ ...prev, saveStatus: 'saved' }));

      setTimeout(() => {
        setState(prev => ({ ...prev, saveStatus: 'idle' }));
      }, 2000);
    }
  }, [currentReportId, state, createNewReport]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
    };
  }, []);

  // Add source
  const addSource = useCallback((source: SourceInfo) => {
    setState(prev => ({
      ...prev,
      sources: [...prev.sources, source],
    }));
  }, []);

  // Remove source
  const removeSource = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index),
    }));
  }, []);

  // Add Tutor Message manually
  const addTutorMessage = useCallback((message: TutorMessage) => {
    setState(prev => ({
      ...prev,
      tutorMessages: [...prev.tutorMessages, message]
    }));
  }, []);

  // Mission Detection logic
  useEffect(() => {
    const missionParams = localStorage.getItem('nova_mission_params');
    if (missionParams) {
      try {
        const mission = JSON.parse(missionParams);
        if (mission.missionTitle || mission.topic || mission.title) {
          const title = mission.missionTitle || mission.topic || mission.title;
          const isSpanish = state.language === 'es';

          addTutorMessage({
            id: 'mission-intro',
            type: 'encouragement',
            message: isSpanish
              ? `🚀 ¡Misión Detectada! Vamos a investigar sobre: **${title}**. Cuéntame, ¿qué es lo primero que quieres descubrir?`
              : `🚀 Mission Detected! Let's research about: **${title}**. Tell me, what's the first thing you want to find out?`,
            icon: '🌟'
          });
        }
      } catch (e) {
        console.error("Error parsing mission params in ResearchCenter", e);
      }
    }
  }, []); // Only on mount

  return {
    state,
    reports,
    currentReportId,
    setHypothesis,
    setSourceText,
    setParaphrasedText,
    analyzeSourceText,
    setGrade,
    setLanguage,
    setResearchType,
    createNewReport,
    loadReport,
    resetState,
    saveNow,
    addSource,
    removeSource,
    addTutorMessage,
    checkChildIdea: useCallback(async (childIdea: string) => {
      setState(prev => {
        if (!prev.analysis?.paragraphs) return prev;

        const currentIndex = prev.currentParagraphIndex;
        const targetP = prev.analysis.paragraphs[currentIndex + 1]; // We check the NEXT one to discover

        if (!targetP) return prev;

        const isSpanish = prev.language === 'es';

        // Use AI to validate if the child's idea is close enough to the target main idea
        // For now, let's update state immediately and we could add an AI validation step if needed
        // but let's do a simple similarity check or just another AI call for feedback
        return { ...prev, isAnalyzing: true };
      });

      // AI Validation for more "human" feedback
      try {
        const { analysis, currentParagraphIndex, language, grade } = state;
        const targetP = analysis?.paragraphs?.[currentParagraphIndex + 1];
        if (!targetP) return;

        const isSpanish = language === 'es';
        const prompt = `Actúa como un Tutor Socrático muy amable para un niño de ${grade} grado.
        El niño dice que la idea principal de este párrafo es: "${childIdea}".
        La idea principal real es: "${targetP.mainIdea}".
        Soportas reales: ${targetP.supportingPhrases.join(', ')}.
        Explicación pedagógica: ${targetP.explanation}.

        Instrucciones:
        - Evalúa si el niño captó la esencia (sé muy generoso y alentador, ajustado a su edad).
        - Si es 1º-2º grado, usa palabras muy simples y cortas.
        - Si es 4º-5º grado, puedes ser un poco más técnico pero mantente motivador.
        - Responde en JSON con:
          {
            "isCorrect": boolean,
            "feedback": "Mensaje motivador explicando por qué sí o por qué no, usando lenguaje para ${grade} grado. Si es correcto, dile que es un gran investigador. Si no, dale una pista suave basada en el razonamiento pedagógico."
          }
        Idioma de la respuesta: ${isSpanish ? 'Español' : 'Inglés'}.`;

        const response = await callOpenAI(
          "Eres un Tutor Socrático amable.",
          [],
          prompt,
          true
        );

        setState(prev => {
          if (!prev.analysis?.paragraphs) return prev;

          const newIndex = response.isCorrect ? prev.currentParagraphIndex + 1 : prev.currentParagraphIndex;
          const updatedParagraphs = [...prev.analysis.paragraphs];
          if (response.isCorrect) {
            updatedParagraphs[newIndex].isDiscovered = true;
          }

          const newMessage: TutorMessage = {
            id: Date.now().toString(),
            type: response.isCorrect ? 'encouragement' : 'tip',
            icon: response.isCorrect ? '🌟' : '🤔',
            message: response.feedback,
            starters: response.isCorrect ? [] : [isSpanish ? '¿Me das una pista?' : 'Can you give me a hint?']
          };

          return {
            ...prev,
            isAnalyzing: false,
            currentParagraphIndex: newIndex,
            analysis: { ...prev.analysis, paragraphs: updatedParagraphs },
            tutorMessages: [...prev.tutorMessages, newMessage]
          };
        });

      } catch (e) {
        console.error("Validation failed", e);
        setState(prev => ({ ...prev, isAnalyzing: false }));
      }
    }, [state])
  };
}
