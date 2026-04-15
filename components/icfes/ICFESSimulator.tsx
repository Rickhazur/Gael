import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Clock, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft,
  Lightbulb, MousePointer2, Flag, BarChart3, X
} from 'lucide-react';
import { SocraticTutor } from './SocraticTutor';
import { 
  getSimulationQuestions, IcfesQuestion, IcfesCategory,
  CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS 
} from './services/IcfesQuestionBank';
import { processTestResults } from './services/SpacedRepetition';

interface SimulatorProps {
  mode: 'quick' | 'area' | 'full';
  category?: IcfesCategory;
  onExit: () => void;
  onComplete: (results: SimulationResults) => void;
}

export interface SimulationResults {
  totalQuestions: number;
  correctAnswers: number;
  areaBreakdown: Record<IcfesCategory, { correct: number; total: number }>;
  timeSpent: number;
  estimatedScore: number;
}

export const ICFESSimulator: React.FC<SimulatorProps> = ({ mode, category, onExit, onComplete }) => {
  const SIM_SAVE_KEY = `nova_icfes_sim_${mode}_${category || 'all'}`;
  
  const loadSavedSession = () => {
    try {
      const saved = localStorage.getItem(SIM_SAVE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { return null; }
    return null;
  };

  const initialSession = loadSavedSession();

  const questionCount = mode === 'quick' ? 20 : mode === 'area' ? 15 : 50;
  const [questions] = useState<IcfesQuestion[]>(() => {
    if (initialSession?.questions) return initialSession.questions;
    return getSimulationQuestions(questionCount, category);
  });
  const [currentIndex, setCurrentIndex] = useState(() => initialSession?.currentIndex || 0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => initialSession?.answers || {});
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, string[]>>(() => initialSession?.eliminatedOptions || {});
  const [flagged, setFlagged] = useState<Set<string>>(() => new Set(initialSession?.flagged || []));
  
  const [isEliminationMode, setIsEliminationMode] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG_SOCRATIC'>('IDLE');
  const [showSocratic, setShowSocratic] = useState(false);
  
  const [startTime] = useState(() => {
    if (initialSession?.elapsed) return Date.now() - (initialSession.elapsed * 1000);
    return Date.now();
  });
  const [elapsed, setElapsed] = useState(() => initialSession?.elapsed || 0);
  const [showMap, setShowMap] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // ─── Auto-Save Effect ───
  useEffect(() => {
    // We throttle the saving slightly by using an interval or just relying on state updates
    const sessionToSave = {
      questions,
      currentIndex,
      answers,
      eliminatedOptions,
      flagged: Array.from(flagged),
      elapsed
    };
    localStorage.setItem(SIM_SAVE_KEY, JSON.stringify(sessionToSave));
  }, [questions, currentIndex, answers, eliminatedOptions, flagged, elapsed, SIM_SAVE_KEY]);

  // Timer - with countdown for 'full' mode (4h like real ICFES)
  const TIME_LIMITS: Record<string, number> = { quick: 40 * 60, area: 30 * 60, full: 240 * 60 }; // seconds
  const timeLimit = TIME_LIMITS[mode] || 0;
  const [timeUp, setTimeUp] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      const newElapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(newElapsed);
      if (timeLimit > 0 && newElapsed >= timeLimit) {
        clearInterval(timer);
        setTimeUp(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, timeLimit]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeUp) {
      finishSimulation();
    }
  }, [timeUp]);

  const remaining = Math.max(0, timeLimit - elapsed);
  const isRunningLow = remaining < 300 && remaining > 0; // Less than 5 min
  
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}` : `${m}:${s.toString().padStart(2,'0')}`;
  };

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    setIsEliminationMode(false);
    setShowTip(false);
    setSelectedOption(null);
    setStatus('IDLE');
    setShowSocratic(false);
  }, [currentIndex]);

  const handleOptionClick = (optionId: string) => {
    if (isEliminationMode) {
      setEliminatedOptions(prev => {
        const current = prev[currentQuestion.id] || [];
        const isEliminated = current.includes(optionId);
        return { ...prev, [currentQuestion.id]: isEliminated ? current.filter(id => id !== optionId) : [...current, optionId] };
      });
      return;
    }
    if (status !== 'IDLE') return;
    const isEliminated = (eliminatedOptions[currentQuestion.id] || []).includes(optionId);
    if (isEliminated) return;

    setSelectedOption(optionId);
    if (optionId === currentQuestion.correctId) {
      setStatus('CORRECT');
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    } else {
      setStatus('WRONG_SOCRATIC');
      setShowSocratic(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishSimulation();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev);
      next.has(currentQuestion.id) ? next.delete(currentQuestion.id) : next.add(currentQuestion.id);
      return next;
    });
  };

  const finishSimulation = useCallback(() => {
    const areas: IcfesCategory[] = ['LECTURA_CRITICA', 'MATEMATICAS', 'SOCIALES', 'CIENCIAS', 'INGLES'];
    const areaBreakdown = {} as SimulationResults['areaBreakdown'];
    let totalCorrect = 0;

    for (const area of areas) {
      const areaQs = questions.filter(q => q.category === area);
      const correct = areaQs.filter(q => answers[q.id] === q.correctId).length;
      totalCorrect += correct;
      areaBreakdown[area] = { correct, total: areaQs.length };
    }

    const percent = (totalCorrect / questions.length) * 100;
    const estimatedScore = Math.round((percent / 100) * 400 + 50);

    // Update progress
    const existing = JSON.parse(localStorage.getItem('nova_icfes_progress') || '{}');
    const updated = {
      ...existing,
      estimatedScore: Math.max(existing.estimatedScore || 0, estimatedScore),
      totalSimulations: (existing.totalSimulations || 0) + 1,
      areaScores: { ...(existing.areaScores || {}) }
    };
    for (const area of areas) {
      if (areaBreakdown[area].total > 0) {
        const newPercent = Math.round((areaBreakdown[area].correct / areaBreakdown[area].total) * 100);
        updated.areaScores[area] = Math.max(updated.areaScores[area] || 0, newPercent);
      }
    }
    localStorage.setItem('nova_icfes_progress', JSON.stringify(updated));

    // Cleanup Auto-Save cleanly
    const SIM_SAVE_KEY = `nova_icfes_sim_${mode}_${category || 'all'}`;
    localStorage.removeItem(SIM_SAVE_KEY);

    // Feed failed questions into spaced repetition
    processTestResults(questions, answers);

    onComplete({
      totalQuestions: questions.length,
      correctAnswers: totalCorrect,
      areaBreakdown,
      timeSpent: elapsed,
      estimatedScore
    });
  }, [questions, answers, elapsed, onComplete]);

  if (!currentQuestion) return null;

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => setShowExitConfirm(true)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Salir
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium hidden sm:block">
              {answeredCount}/{questions.length} respondidas
            </span>
            <button 
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <BarChart3 className="w-3.5 h-3.5" /> Mapa
            </button>
            <div className={`flex items-center gap-1.5 text-sm bg-slate-50 px-3 py-1.5 rounded-lg font-mono ${isRunningLow ? 'text-red-600 font-bold animate-pulse ring-1 ring-red-400 bg-red-50' : 'text-slate-600'}`}>
              <Clock className={`w-3.5 h-3.5 ${isRunningLow ? 'text-red-500' : 'text-blue-500'}`} /> 
              {timeLimit > 0 ? formatTime(remaining) : formatTime(elapsed)}
            </div>
          </div>
        </div>
        {/* Progress */}
        <div className="max-w-4xl mx-auto mt-2">
          <div className="nova-progress h-1.5">
            <div className="nova-progress-bar bg-gradient-to-r from-[#1B4D3E] to-[#2D7A5F]" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Question Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowMap(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:w-96 max-h-[70vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Mapa de Preguntas</h3>
              <button onClick={() => setShowMap(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, i) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = i === currentIndex;
                const isFlagged = flagged.has(q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => { setCurrentIndex(i); setShowMap(false); }}
                    className={`w-full aspect-square rounded-lg text-xs font-bold flex items-center justify-center border-2 transition-all ${
                      isCurrent ? 'border-[#1B4D3E] bg-[#1B4D3E] text-white'
                      : isAnswered ? 'border-green-300 bg-green-50 text-green-700'
                      : isFlagged ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : 'border-slate-200 text-slate-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <button onClick={finishSimulation} className="nova-btn nova-btn-primary w-full rounded-xl mt-4 text-sm">
              Finalizar Simulacro
            </button>
          </div>
        </div>
      )}

      {/* Exit Confirm Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <h2 className="text-xl font-bold text-slate-800 mb-2">¿Pausar Simulacro?</h2>
            <p className="text-slate-500 text-sm mb-6">
              Tu progreso se guardará automáticamente de forma local. Podrás retomar este simulacro exactamente donde lo dejaste la próxima vez.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  onExit();
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition"
              >
                Sí, salir por ahora
              </button>
              <button 
                onClick={() => {
                  const SIM_SAVE_KEY = `nova_icfes_sim_${mode}_${category || 'all'}`;
                  localStorage.removeItem(SIM_SAVE_KEY);
                  onExit();
                }}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition"
              >
                Salir y descartar simulacro
              </button>
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="w-full text-slate-500 font-bold py-3 hover:bg-slate-50 rounded-xl transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex ${showSocratic ? 'flex-col lg:flex-row' : ''}`}>
        {/* Question Area */}
        <div className={`flex-1 px-4 py-6 ${showSocratic ? 'lg:w-2/3' : ''}`}>
          <div className="max-w-3xl mx-auto animate-fade-in">
            {/* Category + Tools */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span 
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[currentQuestion.category] + '15', color: CATEGORY_COLORS[currentQuestion.category] }}
                >
                  {CATEGORY_ICONS[currentQuestion.category]} {CATEGORY_LABELS[currentQuestion.category]}
                </span>
                <span className="text-slate-400 text-sm">Pregunta {currentIndex + 1}/{questions.length}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleFlag}
                  className={`p-2 rounded-lg border transition-colors ${flagged.has(currentQuestion.id) ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                  title="Marcar para revisar"
                >
                  <Flag className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEliminationMode(!isEliminationMode)}
                  className={`p-2 rounded-lg border transition-colors ${isEliminationMode ? 'bg-orange-50 border-orange-300 text-orange-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                  title="Modo descarte"
                >
                  <MousePointer2 className="w-4 h-4" />
                </button>
                {currentQuestion.techniqueTip && (
                  <div className="relative">
                    <button
                      onClick={() => setShowTip(!showTip)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors text-sm ${showTip ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span className="hidden sm:inline font-medium">Estrategia</span>
                    </button>
                    {showTip && (
                      <div className="absolute top-12 right-0 w-72 bg-yellow-50 border border-yellow-200 p-4 rounded-xl shadow-lg z-20 text-sm text-yellow-800 animate-fade-in-up">
                        <strong className="flex items-center gap-1 mb-1">💡 Tip Táctico</strong>
                        <p>{currentQuestion.techniqueTip}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Context */}
            {currentQuestion.context && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-sm text-slate-600 leading-relaxed italic">
                {currentQuestion.context}
              </div>
            )}

            {/* Question */}
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800 leading-relaxed mb-6">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map(option => {
                const isEliminated = (eliminatedOptions[currentQuestion.id] || []).includes(option.id);
                const isSelected = selectedOption === option.id;
                const isCorrectOption = currentQuestion.correctId === option.id;

                let cls = 'nova-option';
                if (status === 'CORRECT' && isCorrectOption) cls += ' correct';
                else if (status === 'WRONG_SOCRATIC' && isSelected) cls += ' incorrect';
                else if (status === 'CORRECT' && isSelected) cls += ' correct';
                if (isEliminated && status === 'IDLE') cls += ' eliminated';
                if (isEliminationMode) cls += ' cursor-crosshair';

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option.id)}
                    disabled={status !== 'IDLE' && !isEliminationMode}
                    className={cls}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 transition-colors ${
                      status === 'CORRECT' && isCorrectOption ? 'border-green-500 bg-green-500 text-white'
                      : status === 'WRONG_SOCRATIC' && isSelected ? 'border-red-400 bg-red-400 text-white'
                      : isEliminated ? 'border-slate-200 text-slate-300'
                      : 'border-slate-200 text-slate-400'
                    }`}>
                      {option.id}
                    </div>
                    <span className={`flex-1 ${isEliminated ? 'line-through text-slate-300' : ''}`}>{option.text}</span>
                    {status === 'CORRECT' && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                    {status === 'WRONG_SOCRATIC' && isSelected && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Socratic Prompt */}
            {status === 'WRONG_SOCRATIC' && !showSocratic && (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-4 animate-fade-in-up">
                <div className="p-2 bg-white rounded-full shadow-sm border border-indigo-100 shrink-0">
                  <AlertCircle className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-indigo-900 text-sm">¡Vamos a entenderlo juntos!</h4>
                  <p className="text-xs text-indigo-700">Tu tutora Lina te guiará para que encuentres la respuesta.</p>
                </div>
                <button onClick={() => setShowSocratic(true)} className="nova-btn nova-btn-primary text-sm !py-2 !px-4 rounded-lg shrink-0">
                  Ver ayuda
                </button>
              </div>
            )}

            {/* Navigation */}
            {status === 'CORRECT' && (
              <div className="flex items-center justify-between mt-6 animate-fade-in-up">
                <button onClick={handlePrev} disabled={currentIndex === 0} className="flex items-center gap-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 text-sm font-medium">
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <button onClick={handleNext} className="nova-btn nova-btn-primary rounded-xl !px-8">
                  {currentIndex === questions.length - 1 ? 'Ver Resultados' : 'Siguiente'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {status === 'IDLE' && (
              <div className="flex items-center justify-between mt-6">
                <button onClick={handlePrev} disabled={currentIndex === 0} className="flex items-center gap-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 text-sm font-medium">
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <button onClick={handleNext} disabled={!answers[currentQuestion.id]} className="text-sm text-slate-400 hover:text-slate-600 disabled:opacity-30 font-medium flex items-center gap-1">
                  Saltar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Socratic Tutor Panel */}
        {showSocratic && status === 'WRONG_SOCRATIC' && (
          <div className="lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white animate-fade-in">
            <SocraticTutor
              questionContext={currentQuestion.text}
              studentAnswer={selectedOption || ''}
              correctAnswer={currentQuestion.options.find(o => o.id === currentQuestion.correctId)?.text || ''}
              hints={currentQuestion.socraticHints}
              onSolved={() => {
                setStatus('CORRECT');
                setSelectedOption(currentQuestion.correctId);
                setAnswers(prev => ({ ...prev, [currentQuestion.id]: currentQuestion.correctId }));
                setShowSocratic(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ICFESSimulator;
