import { useState, useCallback, useEffect, useRef } from 'react';
import type { ResearchState, Step, Grade, Language, Report, SaveStatus, SourceInfo, TemplateId, TutorMessage } from '../types/research';
import { analyzeText, checkPlagiarism, generateTutorMessages } from '../lib/textAnalyzer';
import { callChatApi } from '../../../../services/ai_service';
import { useLearning } from '../../../../context/LearningContext';

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
  currentStep: 'paste',
  sourceText: '',
  paraphrasedText: '',
  grade: 3,
  language: 'es',
  analysis: null,
  tutorMessages: [],
  saveStatus: 'idle',
  isAnalyzing: false,
  sources: [],
  selectedTemplate: 'classic',
  tutorPhase: 'idle',
  currentParagraphIndex: 0,
  studentAnalysisHistory: [],
  paragraphs: [],
};

export function useResearchState(initialGrade: number = 3) {
  const { language: globalLanguage, setLanguage: setGlobalLanguage } = useLearning();

  // Initialize with global language
  const [state, setState] = useState<ResearchState>({
    ...initialState,
    grade: initialGrade as Grade,
    language: globalLanguage
  });

  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>(() => loadReports());

  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync with global language changes
  useEffect(() => {
    setState(prev => {
      if (prev.language === globalLanguage) return prev;

      const messages = prev.analysis
        ? generateTutorMessages(prev.analysis, prev.grade, globalLanguage, prev.currentStep)
        : prev.tutorMessages;

      return { ...prev, language: globalLanguage, tutorMessages: messages };
    });
  }, [globalLanguage]);

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
          sourceText: state.sourceText,
          paraphrasedText: state.paraphrasedText,
          grade: state.grade,
          language: state.language,
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
  }, [currentReportId, state.sourceText, state.paraphrasedText, state.grade, state.language]);

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

  // Analyze source text with Pedagogical AI
  const analyzeSourceText = useCallback(async () => {
    setState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      // First, split text into paragraphs
      const paragraphTexts = state.sourceText
        .split(/\n\n+/)
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0);

      const prompt = state.language === 'es'
        ? `Actua como Nova, tutora experta. Analiza este texto de investigacion para un nino de ${state.grade}o grado.

Para CADA PARRAFO, identifica:
- Idea Principal: LO MAS IMPORTANTE del parrafo
- Idea Secundaria: LOS DETALLES que ayudan a la principal

El texto tiene ${paragraphTexts.length} parrafos.

Responde SOLO con JSON (sin explicaciones extras):
{
  "paragraphs": [
    { "index": 0, "main": "...", "sec": "..." },
    { "index": 1, "main": "...", "sec": "..." },
    ...
  ]
}

TEXTO COMPLETO:
"${state.sourceText}"`
        : `Act as Nova, expert tutor. Analyze this research text for a ${state.grade}th grade child.

For EACH PARAGRAPH, identify:
- Main Idea: THE MOST IMPORTANT of the paragraph
- Secondary Idea: THE DETAILS that help the main one

The text has ${paragraphTexts.length} paragraphs.

Respond ONLY with JSON (no extra explanations):
{
  "paragraphs": [
    { "index": 0, "main": "...", "sec": "..." },
    { "index": 1, "main": "...", "sec": "..." },
    ...
  ]
}

FULL TEXT:
"${state.sourceText}"`;

      const response = await callChatApi([{ role: 'user', content: prompt }], 'gpt-4o-mini', true);
      const analysisData = JSON.parse(response.choices[0].message.content.match(/\{[\s\S]*\}/)[0]);

      setState(prev => {
        const simpleAnalysis = analyzeText(prev.sourceText, prev.language);
        
        // Extract main and secondary ideas from analysis
        const mainIdeas = analysisData.paragraphs.map((p: any) => p.main);
        const secondaryIdeas = analysisData.paragraphs.map((p: any) => p.sec);

        // Modeling message for first paragraph
        const firstParagraphData = analysisData.paragraphs[0];
        const modelingMessage: TutorMessage = {
          id: 'modeling-phase',
          type: 'analysis',
          icon: '🎯',
          message: state.language === 'es'
            ? `Perfecto! Mira como lo hago: 👇\n\nParrafo 1: "${paragraphTexts[0]}"\n\nLO MAS IMPORTANTE:\n💡 [MAIN_IDEA]${firstParagraphData.main}[/MAIN_IDEA]\n\nLOS DETALLES QUE AYUDAN:\n📌 [SECONDARY_IDEA]${firstParagraphData.sec}[/SECONDARY_IDEA]\n\nEl secreto: Es como un juego - busca LO QUE EL TEXTO QUIERE QUE RECUERDES.\n\nAHORA TE TOCA A TI! Vamos al parrafo 2. Tu puedes!`
            : `Perfect! Look how I do it: 👇\n\nParagraph 1: "${paragraphTexts[0]}"\n\nTHE MOST IMPORTANT:\n💡 [MAIN_IDEA]${firstParagraphData.main}[/MAIN_IDEA]\n\nTHE DETAILS THAT HELP:\n📌 [SECONDARY_IDEA]${firstParagraphData.sec}[/SECONDARY_IDEA]\n\nThe secret: It's like a game - find WHAT THE TEXT WANTS YOU TO REMEMBER.\n\nNOW IT'S YOUR TURN! Let's go to paragraph 2. You can do it!`,
          starters: state.language === 'es' ? ['Listo! Voy a intentar.', 'Me das pistas?'] : ['Ready! I will try.', 'Do you give me hints?']
        };

        // Message for second paragraph analysis
        const secondParagraphMessage: TutorMessage = {
          id: 'second-para-msg',
          type: 'analysis',
          icon: '📖',
          message: state.language === 'es'
            ? `Excelente! Ahora analiza el PARRAFO 2:\n\n"${paragraphTexts[1]}"\n\n💡 Cual es la idea MAS IMPORTANTE?\n📌 Que detalles la ayudan?`
            : `Excellent! Now analyze PARAGRAPH 2:\n\n"${paragraphTexts[1]}"\n\n💡 What is the MOST IMPORTANT idea?\n📌 What details help it?`,
          starters: []
        };

        return {
          ...prev,
          paragraphs: paragraphTexts,
          analysis: {
            ...simpleAnalysis,
            mainIdeas,
            secondaryIdeas
          },
          tutorMessages: paragraphTexts.length > 1 
            ? [secondParagraphMessage, modelingMessage]
            : [modelingMessage],
          isAnalyzing: false,
          tutorPhase: 'modeling',
          currentStep: 'paraphrase',
          currentParagraphIndex: 1,
          studentAnalysisHistory: []
        };
      });
    } catch (error) {
      console.error("Tutoring Analysis Error:", error);
      // Fallback to simple analysis if AI fails
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        currentStep: 'paraphrase',
        tutorPhase: 'modeling'
      }));
    }
  }, [state.sourceText, state.language, state.grade]);

  const checkStudentAnalysis = useCallback(async (main: string, secondary: string) => {
    setState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      const paragraphIndex = state.currentParagraphIndex;
      const correctMain = state.analysis?.mainIdeas[paragraphIndex] || "";
      const correctSec = state.analysis?.secondaryIdeas?.[paragraphIndex] || "";
      const isLastParagraph = paragraphIndex === state.paragraphs.length - 1;

      // Build prompt with simple concatenation to avoid complex nesting
      let prompt = '';
      if (state.language === 'es') {
        prompt += 'Eres Nova. El nino dice que en el PARRAFO ' + (paragraphIndex + 1) + ':\n';
        prompt += 'Idea Principal: "' + main + '"\n';
        prompt += 'Idea Secundaria: "' + secondary + '"\n\n';
        prompt += 'La respuesta correcta es:\nMain: "' + correctMain + '"\nSec: "' + correctSec + '"\n\n';
        prompt += 'Dile si esta bien de forma motivadora. Si se equivoco, ayudale a ver por que pero sin darle la respuesta exacta de inmediato.\n';
        prompt += isLastParagraph
          ? 'Si esta perfecto, dile que ya analizo todos los parrafos y que ahora puede generar su reporte.\n'
          : 'Si esta bien, dile que vamos al siguiente parrafo.\n';
        prompt += 'JSON: { "isCorrect": boolean, "feedback": "mensaje de nova", "starters": ["opcion1", "opcion2"] }';
      } else {
        prompt += 'You are Nova. The child says that in PARAGRAPH ' + (paragraphIndex + 1) + ':\n';
        prompt += 'Main Idea: "' + main + '"\n';
        prompt += 'Secondary Idea: "' + secondary + '"\n\n';
        prompt += 'The correct answer is:\nMain: "' + correctMain + '"\nSec: "' + correctSec + '"\n\n';
        prompt += 'Tell them if they are right in a motivating way. If wrong, help them see why without giving the exact answer immediately.\n';
        prompt += isLastParagraph
          ? 'If correct, tell them they analyzed all paragraphs and can now generate their report.\n'
          : 'If correct, tell them let\'s move to the next paragraph.\n';
        prompt += 'JSON: { "isCorrect": boolean, "feedback": "nova message", "starters": ["option1", "option2"] }';
      }

      const response = await callChatApi([{ role: 'user', content: prompt }], 'gpt-4o-mini', true);
      const data = JSON.parse(response.choices[0].message.content.match(/\{.*\}/s)[0]);

      let feedbackWithHighlighting = data.feedback;
      if (!data.isCorrect && correctMain && correctSec) {
        feedbackWithHighlighting = feedbackWithHighlighting
          .replace(new RegExp(correctMain.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'gi'), `[MAIN_IDEA]${correctMain}[/MAIN_IDEA]`)
          .replace(new RegExp(correctSec.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'gi'), `[SECONDARY_IDEA]${correctSec}[/SECONDARY_IDEA]`);
      }

      setState(prev => {
        let newState = { ...prev };

        if (data.isCorrect) {
          newState.studentAnalysisHistory = [
            ...prev.studentAnalysisHistory,
            { paragraphIndex, mainIdea: main, secondaryIdea: secondary, isCorrect: true }
          ];
        }

        const feedbackMsg: TutorMessage = {
          id: `feedback-${Date.now()}`,
          type: data.isCorrect ? 'encouragement' : 'tip',
          icon: data.isCorrect ? '✅' : '🧐',
          message: feedbackWithHighlighting,
          starters: data.starters
        };

        newState.tutorMessages = [feedbackMsg, ...newState.tutorMessages];
        newState.isAnalyzing = false;
        newState.studentAnalysis = { mainIdea: main, secondaryIdea: secondary };

        if (data.isCorrect && !isLastParagraph) {
          const nextIndex = paragraphIndex + 1;
          const nextParagraph = prev.paragraphs[nextIndex];

          newState.currentParagraphIndex = nextIndex;
          newState.tutorPhase = 'practice';

          const nextMsg: TutorMessage = {
            id: `next-para-${nextIndex}`,
            type: 'analysis',
            icon: '📖',
            message: state.language === 'es'
              ? `Excelente! Ahora analiza el PARRAFO ${nextIndex + 1}:\n\n"${nextParagraph}"\n\nCual es la idea MAS IMPORTANTE? Que detalles la ayudan?`
              : `Excellent! Now analyze PARAGRAPH ${nextIndex + 1}:\n\n"${nextParagraph}"\n\nWhat is the MOST IMPORTANT idea? What details help it?`,
            starters: []
          };

          newState.tutorMessages = [nextMsg, ...newState.tutorMessages];
        } else if (data.isCorrect && isLastParagraph) {
          newState.tutorPhase = 'generation';

          const completionMsg: TutorMessage = {
            id: 'completion-msg',
            type: 'encouragement',
            icon: '🎉',
            message: state.language === 'es'
              ? `Felicidades! Analizaste todos los parrafos correctamente! 🏆\n\nAhora tienes todas las ideas principales y secundarias. Es hora de escribir tu reporte final.\n\nVamos a generar tu escrito con toda la informacion que recopilaste.`
              : `Congratulations! You correctly analyzed all paragraphs! 🏆\n\nNow you have all the main and secondary ideas. It's time to write your final report.\n\nLet's generate your essay with all the information you gathered.`,
            starters: []
          };

          newState.tutorMessages = [completionMsg, ...newState.tutorMessages];
        }

        return newState;
      });
    } catch (error) {
      console.error("Analysis check error:", error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, [state.analysis, state.language, state.currentParagraphIndex, state.paragraphs]);

  const startPractice = useCallback(() => {
    setState(prev => ({
      ...prev,
      tutorPhase: 'practice',
      tutorMessages: [{
        id: 'practice-phase',
        type: 'tip',
        icon: '🎯',
        message: state.language === 'es'
          ? "AHORA TE TOCA! 🎮\n\nLee el SEGUNDO PARRAFO.\n\n💡 Escribe: Cual es la idea MAS IMPORTANTE?\n📌 Escribe: Que detalles la ayudan?\n\nEs como el juego que acabamos de ver! 🎪"
          : "YOUR TURN NOW! 🎮\n\nRead the SECOND PARAGRAPH.\n\n💡 Write: What is the MOST IMPORTANT idea?\n📌 Write: What details help it?\n\nIt's like the game we just did! 🎪",
        starters: []
      }, ...prev.tutorMessages]
    }));
  }, [state.language]);

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
    setGlobalLanguage(language); // Sync to global
    // Local update will be handled by useEffect
  }, [setGlobalLanguage]);

  // Create new report
  const createNewReport = useCallback((title: string) => {
    const newReport: Report = {
      id: generateId(),
      title,
      sourceText: state.sourceText,
      paraphrasedText: state.paraphrasedText,
      grade: state.grade,
      language: state.language,
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
        sourceText: report.sourceText,
        paraphrasedText: report.paraphrasedText,
        grade: report.grade,
        language: report.language,
        currentStep: report.paraphrasedText ? 'review' : report.sourceText ? 'analyze' : 'paste',
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
          sourceText: state.sourceText,
          paraphrasedText: state.paraphrasedText,
          grade: state.grade,
          language: state.language,
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

  const setTemplate = useCallback((templateId: TemplateId) => {
    setState(prev => ({ ...prev, selectedTemplate: templateId }));
  }, []);

  // Generate report from analyzed paragraphs
  const generateReport = useCallback(async () => {
    setState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      // Build synthesis from all student's analyzed ideas
      const synthesisText = state.studentAnalysisHistory
        .map((analysis, idx) => {
          const paragraph = state.paragraphs[analysis.paragraphIndex];
          return `Parrafo ${idx + 1}:\nIdea Principal: ${analysis.mainIdea}\nIdea Secundaria: ${analysis.secondaryIdea}`;
        })
        .join('\n\n');

      const prompt = state.language === 'es'
        ? `Eres Nova. Un estudiante de ${state.grade}o grado analizo este texto y encontro estas ideas principales y secundarias:\n\n${synthesisText}\n\nAhora genera un REPORTE BIEN ESCRITO (200-300 palabras) que use estas ideas. El reporte debe:\n1. Tener introduccion, desarrollo y conclusion\n2. Estar en tercera persona\n3. Usar lenguaje claro para su edad\n4. Integrar naturalmente las ideas principales y secundarias\n5. NO copiar texto - parafrasear bien\n\nResponde SOLO el reporte, sin explicaciones extras.`
        : `You are Nova. A ${state.grade}th grade student analyzed this text and found these main and secondary ideas:\n\n${synthesisText}\n\nNow generate a WELL-WRITTEN REPORT (200-300 words) that uses these ideas. The report should:\n1. Have introduction, development and conclusion\n2. Be in third person\n3. Use clear language for their age\n4. Naturally integrate main and secondary ideas\n5. NOT copy text - paraphrase well\n\nRespond ONLY with the report, no extra explanations.`;

      const response = await callChatApi([{ role: 'user', content: prompt }], 'gpt-4o-mini', true);
      const generatedReport = response.choices[0].message.content;

      setState(prev => ({
        ...prev,
        paraphrasedText: generatedReport,
        isAnalyzing: false,
        currentStep: 'review',
        tutorPhase: 'generation'
      }));

      // Show success message
      setState(prev => ({
        ...prev,
        tutorMessages: [{
          id: 'report-generated',
          type: 'encouragement',
          icon: '🎉',
          message: state.language === 'es'
            ? `Excelente! Tu reporte esta listo! 📝\n\nHe organizado todas tus ideas principales y secundarias en un texto bien escrito.\n\nLee tu reporte y si quieres hacer cambios, puedes editarlo. Cuando estes satisfecho, puedes guardarlo o descargarlo.`
            : `Excellent! Your report is ready! 📝\n\nI've organized all your main and secondary ideas into a well-written text.\n\nRead your report and if you want to make changes, you can edit it. When you're satisfied, you can save or download it.`,
          starters: []
        }, ...prev.tutorMessages]
      }));

      if (currentReportId) {
        triggerAutosave();
      }
    } catch (error) {
      console.error("Report generation error:", error);
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        tutorMessages: [{
          id: 'report-error',
          type: 'warning',
          icon: '⚠️',
          message: state.language === 'es'
            ? 'Hubo un error generando tu reporte. Intenta de nuevo.'
            : 'There was an error generating your report. Try again.',
          starters: []
        }, ...prev.tutorMessages]
      }));
    }
  }, [state.studentAnalysisHistory, state.paragraphs, state.grade, state.language, currentReportId, triggerAutosave]);

  return {
    state,
    reports,
    currentReportId,
    setSourceText,
    setParaphrasedText,
    analyzeSourceText,
    setGrade,
    setLanguage,
    createNewReport,
    loadReport,
    resetState,
    saveNow,
    addSource,
    removeSource,
    setTemplate,
    checkStudentAnalysis,
    startPractice,
    generateReport,
  };
}
