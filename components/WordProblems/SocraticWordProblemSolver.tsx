import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinaAvatar } from '../MathMaestro/tutor/LinaAvatar';
import { edgeTTS } from '@/services/edgeTTS';
import { callDeepSeek } from '@/services/deepseek';
import { callGeminiSocratic } from '@/services/gemini';
import { Brain, Zap, Loader2, BookOpen, Trophy, CheckCircle2, ArrowRight } from 'lucide-react';

interface SocraticQuestion {
  id: string;
  question: string;
  expectedAnswer: string | string[];
  hints: string[]; // Progressive hints
  followUp: string;
  type: 'extraction' | 'reasoning' | 'verification';
}

interface WordProblemData {
  character: string;
  initialAmount: string;
  action: string;
  actionAmount: string;
  questions: string[];
}

interface SocraticWordProblemSolverProps {
  problem: string;
  onSolutionComplete?: (solution: any) => void;
}

export const SocraticWordProblemSolver: React.FC<SocraticWordProblemSolverProps> = ({
  problem,
  onSolutionComplete
}) => {
  // Utility: Normalize text (remove accents, lowercase)
  const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // Utility: Check if answer is correct with flexible matching
  const checkAnswer = (userRaw: string, expectedList: string[]) => {
    const user = normalize(userRaw);

    // Semantic helpers
    const isMult = (t: string) => /multipli|veces|producto|doble|triple|cuadru|por/.test(t);
    const isDiv = (t: string) => /divid|repart|part|cada|grupo|caben|troz/.test(t);
    const isAdd = (t: string) => /sum|mas|agreg|junt|total/.test(t);
    const isSub = (t: string) => /rest|quit|meno|diferen|sobr|qued/.test(t);
    const isComp = (t: string) => /mayor|menor|igual/.test(t);
    const isTime = (t: string) => /año|mes|dia|semana|hora|minuto|pasado|futuro|despues|antes|dentro/.test(t);
    const isAge = (t: string) => /edad|años|cumple/.test(t);

    return expectedList.some(expectedRaw => {
      const expected = normalize(expectedRaw);

      // 1. Direct or Partial Match
      if (user === expected || user.includes(expected) || (user.length >= 4 && expected.includes(user))) return true;

      // 2. Numeric Equality
      const uNum = user.match(/\d+/)?.[0];
      const eNum = expected.match(/\d+/)?.[0];
      if (uNum && eNum && uNum === eNum) return true;

      // 3. Semantic Operation Match
      if (isMult(expected) && isMult(user)) return true;
      if (isDiv(expected) && isDiv(user)) return true;
      if (isAdd(expected) && isAdd(user)) return true;
      if (isSub(expected) && isSub(user)) return true;
      if (isComp(expected) && isComp(user)) return true;
      if (isTime(expected) && isTime(user)) return true;
      if (isAge(expected) && isAge(user)) return true;

      // 4. Advanced Overlap (for sentences)
      const eWords = expected.split(/\s+/).filter(w => w.length > 2);
      const uWords = user.split(/\s+/).filter(w => w.length > 2);
      if (eWords.length >= 1) {
        const overlap = eWords.filter(ew => uWords.some(uw => uw.includes(ew) || ew.includes(uw)));
        // If it's a short expected answer (1-2 words), we need 100% overlap of keywords
        // If it's longer, 60% is enough
        const threshold = eWords.length <= 2 ? 1.0 : 0.6;
        if ((overlap.length / eWords.length) >= threshold) return true;
      }

      // 5. Problem Text Context: If the user is quoting a correct phrase from the original problem 
      // related to the current phase, be very lenient.
      const problemNorm = normalize(problem);
      if (user.length > 5 && problemNorm.includes(user)) {
        return true;
      }

      return false;
    });
  };
  const [currentMission, setCurrentMission] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [dynamicProblemData, setDynamicProblemData] = useState<WordProblemData | null>(null);
  const [dynamicMissions, setDynamicMissions] = useState<{
    m1: SocraticQuestion[],
    m2: SocraticQuestion[],
    m3: SocraticQuestion[]
  }>({ m1: [], m2: [], m3: [] });

  const [foundKeywords, setFoundKeywords] = useState<string[]>([]);

  const [highlightedData, setHighlightedData] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState(''); // Separate input state - does NOT trigger validation
  // Track HINT LEVEL for each question (0=none, 1=first hint, 2=second...)
  const [hintLevel, setHintLevel] = useState<Record<string, number>>({});

  const showNextHint = (questionId: string) => {
    setHintLevel(prev => {
      const currentLevel = prev[questionId] || 0;
      return { ...prev, [questionId]: currentLevel + 1 };
    });
  };
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null); // Show feedback text

  // --- BRAIN: ANALYZE PROBLEM USING AI ---
  useEffect(() => {
    const analyzeProblem = async () => {
      setIsAnalyzing(true);
      try {
        const systemPrompt = `
          Eres Lina, una tutora experta en el método socrático para niños de primaria. 
          Genera un plan de tutoría socrática en 3 misiones.
          Misión 1: Extraer datos (Personajes, cantidades, acciones).
          Misión 2: Razonar la estrategia (¿Sumar o restar? ¿Por qué?).
          Misión 3: Resolver paso a paso (Cálculos específicos).

          REGLAS:
          1. Todas las preguntas y respuestas deben estar en ESPAÑOL.
          2. Usa emojis para que sea amigable.
          3. 'expectedAnswer' DEBE ser un ARRAY con MUCHAS POSIBILIDADES (mínimo 5-10). 
          Cubre todas las formas en que un niño o joven podría responder: solo el número, el número con texto, sinónimos, acciones (ej. "sumar", "añadir"), y conceptos clave.
          Ejemplo para '12 años después': ["12", "12 años", "sumar 12", "pasan 12", "futuro", "mas 12", "dentro de 12", "edad + 12"].
          4. EVITA respuestas que sean oraciones largas y complejas.
          5. No des la respuesta directamente en la pregunta, guíalo.
          6. 'problemData' debe contener info del problema: character, initialAmount, action, actionAmount, y una lista de questions a resolver.
          6. Cada misión debe tener entre 2 y 4 preguntas.

          Responde ÚNICAMENTE con un JSON con la siguiente estructura exacta:
          {
            "problemData": {
              "character": "...",
              "initialAmount": "...",
              "action": "...",
              "actionAmount": "...",
              "questions": ["..."]
            },
            "m1": [
              { "id": "m1q1", "question": "...", "expectedAnswer": ["respuesta1"], "hints": ["Pista 1: ...", "Pista 2: ..."], "followUp": "..." }
            ],
            "m2": [
              { "id": "m2q1", "question": "...", "expectedAnswer": ["respuesta1"], "hints": ["Pista 1...", "Pista 2..."], "followUp": "..." }
            ],
            "m3": [
              { "id": "m3q1", "question": "...", "expectedAnswer": ["respuesta1"], "hints": ["Pista 1...", "Pista 2..."], "followUp": "..." }
            ]
          }

          IMPORTANTE: "expectedAnswer" SIEMPRE debe ser un array de strings con posibles respuestas aceptables.
        `;

        let response;
        try {
          response = await callDeepSeek(systemPrompt, [], `Analiza este problema: "${problem}"`, true);
        } catch (e) {
          console.warn("DeepSeek falló o dio timeout, intentando con Gemini como respaldo...", e);
          response = await callGeminiSocratic(systemPrompt, [], `Analiza este problema: "${problem}"`, 'es', true);
        }

        if (response && response.problemData) {
          setDynamicProblemData(response.problemData);
          // Normalize expectedAnswer to always be an array AND hints to be an array
          const normalize = (questions: any[]) => (questions || []).map((q: any) => ({
            ...q,
            expectedAnswer: Array.isArray(q.expectedAnswer) ? q.expectedAnswer : [String(q.expectedAnswer)],
            hints: Array.isArray(q.hints) ? q.hints : (q.hint ? [q.hint] : ["Piensa en la pregunta..."])
          }));
          setDynamicMissions({
            m1: normalize(response.m1),
            m2: normalize(response.m2),
            m3: normalize(response.m3)
          });
        }
      } catch (error) {
        console.error("Error analyzing problem:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeProblem();
  }, [problem]);

  // --- Lina speaks the current question when step/mission changes ---
  useEffect(() => {
    const questions = getCurrentQuestions();
    if (questions.length > 0 && questions[currentStep]) {
      const q = questions[currentStep];
      edgeTTS.speak(q.question, 'lina');
      setCurrentInput(''); // Reset input for new question
      setFeedback(null);
    }
  }, [currentMission, currentStep, dynamicMissions]);

  const getCurrentQuestions = () => {
    switch (currentMission) {
      case 1: return dynamicMissions.m1;
      case 2: return dynamicMissions.m2;
      case 3: return dynamicMissions.m3;
      default: return [];
    }
  };

  // Only called when pressing "Verificar" button
  const handleVerify = () => {
    const currentQuestions = getCurrentQuestions();
    const currentQuestion = currentQuestions[currentStep];
    if (!currentQuestion) return;

    const answer = currentInput.trim();
    if (!answer) {
      edgeTTS.speak("Escribe tu respuesta primero.", 'lina');
      return;
    }

    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));

    const expectedAnswers = Array.isArray(currentQuestion.expectedAnswer)
      ? currentQuestion.expectedAnswer
      : [String(currentQuestion.expectedAnswer)];

    // SMART VALIDATION: Check using normalized text and stems
    const isCorrect = checkAnswer(answer, expectedAnswers);

    if (isCorrect) {
      setFeedback('✅ ¡Correcto!');
      handleCorrectAnswer(currentQuestion);
    } else {
      setFeedback('❌ Intenta de nuevo.');
      edgeTTS.speak("Intenta de nuevo. Mira la pista para ayudarte.", 'lina');

      // Auto-show next hint on error if not already showing max
      const currentLevel = hintLevel[currentQuestion.id] || 0;
      if (currentLevel < (currentQuestion.hints?.length || 1)) {
        showNextHint(currentQuestion.id);
      }
    }
  };

  const handleCorrectAnswer = async (question: SocraticQuestion) => {
    // Lina celebrates and explains
    // AWAIT the speech so she finishes before moving on
    await edgeTTS.speak(question.followUp, 'lina');

    // Add expected answer to found keywords for highlighting
    if (Array.isArray(question.expectedAnswer)) {
      setFoundKeywords(prev => [...prev, ...question.expectedAnswer]);
    } else {
      setFoundKeywords(prev => [...prev, String(question.expectedAnswer)]);
    }

    // Small pause for effect after speaking
    await new Promise(resolve => setTimeout(resolve, 500));

    if (currentStep < getCurrentQuestions().length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleMissionComplete();
    }
  };

  const handleMissionComplete = () => {
    if (currentMission < 3) {
      edgeTTS.speak("¡Misión completada! Vamos a la siguiente.", 'lina');
      setCurrentMission(prev => prev + 1);
      setCurrentStep(0);
    } else {
      // All missions completed
      setIsCompleted(true);
      edgeTTS.speak("¡Felicidades! ¡Resolviste todo el problema!", 'lina');
      if (onSolutionComplete) {
        onSolutionComplete({
          method: 'socratic'
        });
      }
    }
  };

  const toggleHighlight = (dataType: string) => {
    setHighlightedData(prev =>
      prev.includes(dataType)
        ? prev.filter(d => d !== dataType)
        : [...prev, dataType]
    );
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white/50 backdrop-blur-xl rounded-[3rem] border-4 border-purple-100 shadow-2xl">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="relative"
        >
          <Brain className="w-32 h-32 text-purple-600 mb-8" />
          <motion.div
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-4 -right-4"
          >
            <Zap className="text-yellow-400 w-12 h-12" />
          </motion.div>
        </motion.div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-4 italic">Enlazando Red Neuronal...</h2>
        <div className="flex items-center gap-3 px-6 py-3 bg-purple-600 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl">
          <Loader2 className="animate-spin" size={16} /> Lina está analizando tu problema
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="socratic-celebration"
      >
        <div className="text-center p-8">
          <LinaAvatar state="celebrating" size={200} />

          <motion.h2
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-purple-600 mt-6"
          >
            🏆 ¡LOGRO SOCRÁTICO DESBLOQUEADO!
          </motion.h2>

          <div className="achievement-card bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 mt-6">
            <h3 className="text-xl font-bold text-purple-800">🧠 Pensador Crítico de Word Problems</h3>
            <p className="text-purple-600 mt-2">🔍 Maestro del Método Socrático</p>
            <p className="text-purple-600">⭐ 500 puntos de descubrimiento</p>
          </div>

          <div className="solution-summary bg-white/80 backdrop-blur-md rounded-[3rem] p-8 mt-8 shadow-2xl border-4 border-purple-100 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl" />

            <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center justify-center gap-3">
              <CheckCircle2 className="text-green-500" size={28} />
              RESUMEN DE TU DESCUBRIMIENTO
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-100">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Personaje</p>
                <p className="text-lg font-bold text-blue-900 truncate">👤 {dynamicProblemData?.character}</p>
              </div>
              <div className="bg-pink-50 p-4 rounded-2xl border-2 border-pink-100">
                <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-1">Dato Inicial</p>
                <p className="text-lg font-bold text-pink-900 truncate">📊 {dynamicProblemData?.initialAmount}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-100">
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Acción</p>
                <p className="text-lg font-bold text-orange-900 truncate">🎯 {dynamicProblemData?.action}</p>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] mb-8 shadow-[0_20px_50px_rgba(30,41,59,0.3)] relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] text-center mb-4">Resultado Final Descubierto</p>
              <div className="flex items-center justify-center gap-6">
                <div className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  {/* Get last M3 answer which should be the final result */}
                  {userAnswers[dynamicMissions.m3[dynamicMissions.m3.length - 1]?.id] || "?"}
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
                  <Trophy className="text-white" size={32} />
                </div>
              </div>
              <p className="text-slate-400 text-xs text-center mt-6 font-medium italic">
                "{dynamicProblemData?.character} ahora tiene el resultado correcto gracias a tu ayuda."
              </p>
            </div>

            <button
              onClick={() => onSolutionComplete && onSolutionComplete({
                method: 'socratic',
                completed: true
              })}
              className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-[2rem] font-black text-xl shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
              🚀 FINALIZAR MISIÓN
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="socratic-word-problem-solver p-6 max-w-4xl mx-auto">
      {/* ORIGINAL PROBLEM DISPLAY */}
      <div className="bg-white rounded-3xl p-8 mb-8 shadow-xl border-4 border-slate-100 flex gap-6 items-start">
        <div className="bg-purple-100 p-4 rounded-2xl shrink-0">
          <BookOpen className="text-purple-600 w-8 h-8" />
        </div>
        <div>
          <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">El Problema:</h3>
          <p className="text-2xl font-medium text-slate-800 leading-loose font-sans text-left">
            {problem.split(' ').map((word, i, arr) => {
              // Check if word matches any found keyword (fuzzy match)
              const cleanWord = normalize(word);
              // Determine highlight color based on current mission logic or keyword type
              // Simple heuristic: Numbers = Pink, Nouns = Blue, Verbs = Orange
              let highlightClass = "bg-transparent";
              let textClass = "text-slate-800";

              const isFound = foundKeywords.some(k => normalize(k).includes(cleanWord) || cleanWord.includes(normalize(k)));

              const space = i < arr.length - 1 ? ' ' : '';

              if (isFound && cleanWord.length > 1) {
                // Assign colors cyclically or randomly for variety but consistency
                // Use word length + index to keep same word same color
                const colorIndex = (cleanWord.length + i) % 3;

                if (/\d/.test(cleanWord)) {
                  // Numbers are always high contrast pink
                  highlightClass = "bg-pink-100 decoration-pink-300 underline decoration-4 underline-offset-4 box-decoration-clone px-1 rounded";
                  textClass = "text-pink-700 font-bold";
                } else if (colorIndex === 0) {
                  highlightClass = "bg-blue-100 decoration-blue-300 underline decoration-4 underline-offset-4 box-decoration-clone px-1 rounded";
                  textClass = "text-blue-700 font-bold";
                } else if (colorIndex === 1) {
                  highlightClass = "bg-green-100 decoration-green-300 underline decoration-4 underline-offset-4 box-decoration-clone px-1 rounded";
                  textClass = "text-green-700 font-bold";
                } else {
                  highlightClass = "bg-orange-100 decoration-orange-300 underline decoration-4 underline-offset-4 box-decoration-clone px-1 rounded";
                  textClass = "text-orange-700 font-bold";
                }

                return (
                  <React.Fragment key={i}>
                    <span
                      className={`inline-block transition-colors duration-500 ${highlightClass} ${textClass}`}
                    >
                      {word}
                    </span>
                    {space}
                  </React.Fragment>
                );
              }
              return <React.Fragment key={i}>{word}{space}</React.Fragment>;
            })}
          </p>
        </div>
      </div>

      {/* Mission Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mission-header text-center mb-8"
      >
        <h1 className="text-2xl font-bold text-purple-600">
          🕵️‍♀️ Misión {currentMission}: {currentMission === 1 ? 'Extraer Datos' : currentMission === 2 ? 'Entender Qué Hacer' : 'Solución Socrática'}
        </h1>

        <div className="progress-bar mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Progreso de la Misión</span>
            <span className="text-sm text-gray-600">{currentStep + 1}/{getCurrentQuestions().length || 1}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / (getCurrentQuestions().length || 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Mission 1: Data Coloring Board */}
      {currentMission === 1 && currentStep === 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="data-coloring-board mb-8"
        >
          <h2 className="text-xl font-bold text-blue-600 mb-4">🎨 ¡Vamos a Colorear los Datos!</h2>

          <div className="story-board bg-white rounded-2xl p-6 shadow-lg">
            <p className="story-text text-lg leading-relaxed">
              <span
                className={`data-item cursor-pointer px-3 py-1 rounded transition-all ${highlightedData.includes('character') ? 'bg-blue-200 text-blue-800' : 'hover:bg-blue-100'
                  }`}
                onClick={() => toggleHighlight('character')}
              >
                👧 {dynamicProblemData?.character}
              </span>

              {" tenía "}

              <span
                className={`data-item cursor-pointer px-3 py-1 rounded transition-all ${highlightedData.includes('initial') ? 'bg-green-200 text-green-800' : 'hover:bg-green-100'
                  }`}
                onClick={() => toggleHighlight('initial')}
              >
                📊 {dynamicProblemData?.initialAmount}
              </span>

              {". Luego "}

              <span
                className={`data-item cursor-pointer px-3 py-1 rounded transition-all ${highlightedData.includes('action') ? 'bg-orange-200 text-orange-800' : 'hover:bg-orange-100'
                  }`}
                onClick={() => toggleHighlight('action')}
              >
                🎯 {dynamicProblemData?.action} {dynamicProblemData?.actionAmount}
              </span>

              {"."}
            </p>

            <div className="data-legend mt-6 flex flex-wrap gap-4">
              <div className="legend-item flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-200 rounded"></div>
                <span className="text-sm">👤 Personaje</span>
              </div>
              <div className="legend-item flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 rounded"></div>
                <span className="text-sm">📊 Cantidad inicial</span>
              </div>
              <div className="legend-item flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-200 rounded"></div>
                <span className="text-sm">🎯 Acción/Cambio</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <LinaAvatar state="speaking" />
          </div>
          <p className="text-center text-gray-600 mt-4">
            "¡Mira! Cada color nos ayuda a ver los datos importantes"
          </p>
        </motion.div>
      )}

      {/* Socratic Questions */}
      <AnimatePresence mode="wait">
        {getCurrentQuestions().length > 0 && currentStep < getCurrentQuestions().length && (
          <motion.div
            key={`${currentMission}-${currentStep}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="socratic-question"
          >
            <div className="question-card bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-purple-600 mb-4">🤔 Pregunta Socrática:</h3>
              <p className="text-xl text-gray-800 mb-6">{getCurrentQuestions()[currentStep]?.question}</p>

              {/* Feedback Banner */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 p-3 rounded-xl text-center font-bold text-lg ${feedback.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'
                    }`}
                >
                  {feedback}
                </motion.div>
              )}

              <div className="answer-section">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Escribe tu respuesta..."
                  className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
                  autoFocus
                />

                <div className="actions flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const q = getCurrentQuestions()[currentStep];
                      if (q) showNextHint(q.id);
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors flex items-center gap-2"
                  >
                    <span>💡</span> Pista {(hintLevel[getCurrentQuestions()[currentStep]?.id] || 0) > 0 ? `(${Math.min(hintLevel[getCurrentQuestions()[currentStep]?.id] || 0, getCurrentQuestions()[currentStep]?.hints?.length || 0)}/${getCurrentQuestions()[currentStep]?.hints?.length})` : ''}
                  </button>

                  <button
                    onClick={handleVerify}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-bold flex items-center gap-2"
                  >
                    <span>✅</span> Verificar
                  </button>
                </div>

                {/* VISUALIZACIÓN DE PISTAS PROGRESIVAS */}
                {getCurrentQuestions()[currentStep] && (hintLevel[getCurrentQuestions()[currentStep].id] || 0) > 0 && (
                  <div className="mt-4 space-y-2">
                    {(getCurrentQuestions()[currentStep].hints || []).slice(0, hintLevel[getCurrentQuestions()[currentStep].id]).map((hint, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hint-reveal p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400 flex gap-2 shadow-sm"
                      >
                        <span className="text-xl shrink-0">🤔</span>
                        <p className="text-yellow-900 font-medium text-sm leading-snug">{hint}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <LinaAvatar state="thinking" />
            </div>
            <p className="text-center text-gray-600 mt-4">
              "Piensa detenidamente... ¡tú puedes descubrirlo!"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mission Navigation */}
      <div className="mission-navigation mt-8 flex justify-center gap-4">
        {currentMission > 1 && (
          <button
            onClick={() => {
              setCurrentMission(prev => prev - 1);
              setCurrentStep(0);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
          >
            ← Misión Anterior
          </button>
        )}

        <div className="flex gap-2">
          {[1, 2, 3].map(mission => (
            <div
              key={mission}
              className={`w-3 h-3 rounded-full ${mission === currentMission ? 'bg-purple-500' : mission < currentMission ? 'bg-green-500' : 'bg-gray-300'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Fallback if no questions are generated */}
      {!isAnalyzing && getCurrentQuestions().length === 0 && (
        <div className="mt-8 text-center p-6 bg-red-50 rounded-2xl border-2 border-red-100 animate-pulse">
          <p className="text-red-500 font-bold mb-2">⚠️ Ups, algo salió mal al analizar el problema.</p>
          <p className="text-sm text-red-400">La IA no pudo generar las misiones correctamente.</p>
        </div>
      )}
    </div>
  );
};
