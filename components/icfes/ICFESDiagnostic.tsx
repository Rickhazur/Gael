import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ArrowLeft, CheckCircle2, Brain, Star, TrendingUp, Pause, Play, Save, Clock } from 'lucide-react';
import { getDiagnosticQuestions, IcfesQuestion, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS, IcfesCategory } from './services/IcfesQuestionBank';
import { processTestResults } from './services/SpacedRepetition';

interface ICFESDiagnosticProps {
  userName: string;
  onComplete: (results: DiagnosticResults) => void;
  onBack: () => void;
}

export interface DiagnosticResults {
  totalCorrect: number;
  totalQuestions: number;
  areaScores: Record<IcfesCategory, { correct: number; total: number; percent: number }>;
  estimatedScore: number;
  strengths: IcfesCategory[];
  weaknesses: IcfesCategory[];
}

const STORAGE_KEY = 'nova_diag_session';

interface SavedSession {
  questions: IcfesQuestion[];
  answers: Record<string, string>;
  currentIndex: number;
  startedAt: string;
}

export const ICFESDiagnostic: React.FC<ICFESDiagnosticProps> = ({ userName, onComplete, onBack }) => {
  // Try to restore a saved session
  const [questions, setQuestions] = useState<IcfesQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<DiagnosticResults | null>(null);
  const [showSavedNotice, setShowSavedNotice] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  const firstName = userName?.split(' ')[0] || 'Estudiante';

  // ─── Initialize: Load saved session or create new one ───
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const session: SavedSession = JSON.parse(saved);
        if (session.questions && session.questions.length > 0) {
          setQuestions(session.questions);
          setAnswers(session.answers || {});
          setCurrentIndex(session.currentIndex || 0);
          setIsResuming(true);
          return;
        }
      } catch { /* corrupted, start fresh */ }
    }
    // Generate new questions
    const newQuestions = getDiagnosticQuestions();
    setQuestions(newQuestions);
    saveSession(newQuestions, {}, 0);
  }, []);

  // ─── Auto-save after every answer ───
  const saveSession = useCallback((qs: IcfesQuestion[], ans: Record<string, string>, idx: number) => {
    const session: SavedSession = {
      questions: qs,
      answers: ans,
      currentIndex: idx,
      startedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, []);

  // Flash "saved" indicator
  const flashSaved = useCallback(() => {
    setShowSavedNotice(true);
    setTimeout(() => setShowSavedNotice(false), 1500);
  }, []);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;
  const isAnswered = currentQuestion && !!answers[currentQuestion.id];

  // Calculate how many answered per area for mini-progress
  const getAreaProgress = (area: IcfesCategory) => {
    const areaQs = questions.filter(q => q.category === area);
    const answered = areaQs.filter(q => answers[q.id]).length;
    return { answered, total: areaQs.length };
  };

  const handleAnswer = (optionId: string) => {
    if (!currentQuestion || answers[currentQuestion.id]) return;
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);
    // Auto-save immediately
    saveSession(questions, newAnswers, currentIndex);
    flashSaved();
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      saveSession(questions, answers, nextIndex);
    } else {
      calculateResults();
    }
  };

  const handlePause = () => {
    // Save current state and go back to dashboard
    saveSession(questions, answers, currentIndex);
    onBack();
  };

  const calculateResults = () => {
    const areas: IcfesCategory[] = ['LECTURA_CRITICA', 'MATEMATICAS', 'SOCIALES', 'CIENCIAS', 'INGLES'];
    const areaScores = {} as DiagnosticResults['areaScores'];
    let totalCorrect = 0;

    for (const area of areas) {
      const areaQs = questions.filter(q => q.category === area);
      const correct = areaQs.filter(q => answers[q.id] === q.correctId).length;
      totalCorrect += correct;
      areaScores[area] = {
        correct,
        total: areaQs.length,
        percent: areaQs.length > 0 ? Math.round((correct / areaQs.length) * 100) : 0
      };
    }

    const overallPercent = (totalCorrect / questions.length) * 100;
    const estimatedScore = Math.round((overallPercent / 100) * 400 + 50);

    const sorted = [...areas].sort((a, b) => areaScores[b].percent - areaScores[a].percent);
    const strengths = sorted.filter(a => areaScores[a].percent >= 60).slice(0, 2);
    const weaknesses = sorted.filter(a => areaScores[a].percent < 50).slice(-2).reverse();

    const diagnosticResults: DiagnosticResults = {
      totalCorrect,
      totalQuestions: questions.length,
      areaScores,
      estimatedScore,
      strengths,
      weaknesses
    };

    setResults(diagnosticResults);
    setShowResults(true);

    // Save final results and clear the in-progress session
    localStorage.setItem('nova_icfes_diagnostic', JSON.stringify(diagnosticResults));
    localStorage.removeItem(STORAGE_KEY); // Clear in-progress session
    
    const existingProgress = JSON.parse(localStorage.getItem('nova_icfes_progress') || '{}');
    const updatedProgress = {
      ...existingProgress,
      estimatedScore,
      areaScores: Object.fromEntries(areas.map(a => [a, areaScores[a].percent]))
    };
    localStorage.setItem('nova_icfes_progress', JSON.stringify(updatedProgress));

    // Feed failed questions into spaced repetition system
    processTestResults(questions, answers);
  };

  // ─── Resume Notice ───
  if (isResuming && answeredCount > 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="max-w-md w-full animate-fade-in-up">
          <div className="nova-card p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play className="w-10 h-10 text-emerald-600 ml-1" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              ¡Hola de nuevo, {firstName}! 👋
            </h2>
            <p className="text-slate-500 mb-2">
              Tienes un examen diagnóstico en progreso.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Respondidas</span>
                <span className="font-bold text-emerald-600">{answeredCount} / {questions.length}</span>
              </div>
              <div className="nova-progress">
                <div 
                  className="nova-progress-bar bg-gradient-to-r from-emerald-500 to-green-600" 
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                />
              </div>
            </div>
            <button 
              onClick={() => setIsResuming(false)}
              className="nova-btn nova-btn-primary w-full rounded-xl mb-3"
            >
              Continuar donde iba <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                // Start fresh
                localStorage.removeItem(STORAGE_KEY);
                const newQuestions = getDiagnosticQuestions();
                setQuestions(newQuestions);
                setAnswers({});
                setCurrentIndex(0);
                setIsResuming(false);
                saveSession(newQuestions, {}, 0);
              }}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Empezar de nuevo (perder progreso)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Results Screen ───
  if (showResults && results) {
    const areas: IcfesCategory[] = ['LECTURA_CRITICA', 'MATEMATICAS', 'SOCIALES', 'CIENCIAS', 'INGLES'];
    return (
      <div className="min-h-screen bg-[#FAFAF8] py-8 px-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#1B4D3E] to-[#2D7A5F] rounded-2xl p-8 text-white text-center mb-6 animate-fade-in-up shadow-lg">
            <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
              <Star className="w-10 h-10 text-yellow-300" />
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Diagnóstico completado, {firstName}!</h2>
            <p className="text-emerald-200">
              Ya sabemos exactamente en qué eres fuerte y dónde Profesora Lina te va a ayudar.
            </p>
          </div>

          {/* Score */}
          <div className="nova-card p-6 mb-6 animate-fade-in-up stagger-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Puntaje estimado ICFES</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-extrabold text-slate-800">{results.estimatedScore}</span>
                  <span className="text-slate-400 text-sm mb-1">/500</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              {results.estimatedScore >= 250 
                ? '✅ ¡Buen punto de partida! Con tu ruta personalizada, vamos a asegurar la aprobación.'
                : '💪 No te preocupes, este es el punto de partida. Con práctica diaria vas a subir ese puntaje rápidamente.'}
            </p>
          </div>

          {/* Area Results */}
          <div className="nova-card p-6 mb-6 animate-fade-in-up stagger-2">
            <h3 className="font-bold text-slate-800 mb-4">Tu nivel por área (10 preguntas c/u)</h3>
            <div className="space-y-4">
              {areas.map(area => {
                const score = results.areaScores[area];
                const color = CATEGORY_COLORS[area];
                return (
                  <div key={area}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{CATEGORY_ICONS[area]}</span>
                        <span className="text-sm font-semibold text-slate-700">{CATEGORY_LABELS[area]}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color }}>{score.percent}%</span>
                    </div>
                    <div className="nova-progress">
                      <div 
                        className="nova-progress-bar" 
                        style={{ width: `${score.percent}%`, backgroundColor: color }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{score.correct}/{score.total} correctas</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-in-up stagger-3">
            <div className="nova-card p-5">
              <h4 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                💪 Tus fortalezas
              </h4>
              {results.strengths.length > 0 ? (
                results.strengths.map(a => (
                  <div key={a} className="flex items-center gap-2 mb-2">
                    <span>{CATEGORY_ICONS[a]}</span>
                    <span className="text-sm text-slate-700">{CATEGORY_LABELS[a]}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Las descubriremos con más práctica.</p>
              )}
            </div>
            <div className="nova-card p-5">
              <h4 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
                🎯 Para mejorar
              </h4>
              {results.weaknesses.length > 0 ? (
                results.weaknesses.map(a => (
                  <div key={a} className="flex items-center gap-2 mb-2">
                    <span>{CATEGORY_ICONS[a]}</span>
                    <span className="text-sm text-slate-700">{CATEGORY_LABELS[a]}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">¡Vas muy bien en todo!</p>
              )}
            </div>
          </div>

          {/* Route Generated */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-2xl p-6 text-white mb-6 animate-fade-in-up stagger-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-white/15 rounded-lg">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Tu ruta personalizada está lista</h3>
                <p className="text-violet-200 text-sm mt-1">
                  Hemos creado un plan que prioriza {results.weaknesses.length > 0 
                    ? results.weaknesses.map(w => CATEGORY_LABELS[w]).join(' y ')
                    : 'las áreas donde más puedes crecer'}.
                </p>
              </div>
            </div>
            <button 
              onClick={() => onComplete(results)}
              className="nova-btn bg-white text-violet-700 font-bold hover:bg-violet-50 w-full rounded-xl"
              id="btn-see-route"
            >
              Ver Mi Ruta de Aprendizaje
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  // Figure out which area section we're in
  const currentArea = currentQuestion.category;
  const areaQs = questions.filter(q => q.category === currentArea);
  const areaIndex = areaQs.findIndex(q => q.id === currentQuestion.id);

  // ─── Question Screen ───
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={handlePause}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-lg"
            >
              <Pause className="w-4 h-4" /> Pausar y salir
            </button>
            <span className="text-sm text-slate-400 font-medium">
              {answeredCount}/{questions.length} respondidas
            </span>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="nova-progress mb-3">
            <div 
              className="nova-progress-bar bg-gradient-to-r from-violet-500 to-indigo-600" 
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>

          {/* Area mini-badges */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {(['LECTURA_CRITICA', 'MATEMATICAS', 'SOCIALES', 'CIENCIAS', 'INGLES'] as IcfesCategory[]).map(area => {
              const ap = getAreaProgress(area);
              const isCurrent = area === currentArea;
              return (
                <div 
                  key={area}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border transition-all ${
                    isCurrent 
                      ? 'bg-white border-2 shadow-sm' 
                      : ap.answered === ap.total 
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}
                  style={isCurrent ? { borderColor: CATEGORY_COLORS[area], color: CATEGORY_COLORS[area] } : {}}
                >
                  <span>{CATEGORY_ICONS[area]}</span>
                  <span>{ap.answered}/{ap.total}</span>
                  {ap.answered === ap.total && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Auto-save indicator */}
      {showSavedNotice && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg animate-fade-in-up">
          <Save className="w-4 h-4" /> Guardado ✓
        </div>
      )}

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full animate-fade-in-up" key={currentQuestion.id}>
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{CATEGORY_ICONS[currentQuestion.category]}</span>
            <span 
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[currentQuestion.category] + '15', color: CATEGORY_COLORS[currentQuestion.category] }}
            >
              {CATEGORY_LABELS[currentQuestion.category]} — Pregunta {areaIndex + 1}/10
            </span>
          </div>

          {/* Context */}
          {currentQuestion.context && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-sm text-slate-600 leading-relaxed italic">
              {currentQuestion.context}
            </div>
          )}

          {/* Question Text */}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed mb-6">
            {currentQuestion.text}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              const isCorrect = currentQuestion.correctId === option.id;
              const showFeedback = !!answers[currentQuestion.id];

              let className = 'nova-option';
              if (showFeedback && isCorrect) className += ' correct';
              else if (showFeedback && isSelected && !isCorrect) className += ' incorrect';
              else if (isSelected) className += ' selected';

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  disabled={!!answers[currentQuestion.id]}
                  className={className}
                  id={`option-${option.id}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 transition-colors ${
                    showFeedback && isCorrect 
                      ? 'border-green-500 bg-green-500 text-white' 
                      : showFeedback && isSelected 
                        ? 'border-red-400 bg-red-400 text-white' 
                        : isSelected 
                          ? 'border-[#1B4D3E] bg-[#1B4D3E] text-white' 
                          : 'border-slate-200 text-slate-400'
                  }`}>
                    {option.id}
                  </div>
                  <span className="flex-1">{option.text}</span>
                  {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {answers[currentQuestion.id] && (
            <div className={`p-4 rounded-xl mb-6 animate-fade-in-up ${
              answers[currentQuestion.id] === currentQuestion.correctId 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-amber-50 border border-amber-200'
            }`}>
              <p className={`text-sm font-semibold mb-1 ${
                answers[currentQuestion.id] === currentQuestion.correctId ? 'text-green-800' : 'text-amber-800'
              }`}>
                {answers[currentQuestion.id] === currentQuestion.correctId ? '¡Correcto! 🎉' : 'No pasa nada, estamos aprendiendo 💪'}
              </p>
              <p className="text-sm text-slate-600">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <button 
              onClick={handleNext}
              className="nova-btn nova-btn-primary w-full rounded-xl animate-fade-in-up"
              id="btn-next-question"
            >
              {currentIndex === questions.length - 1 ? 'Ver Mis Resultados' : 'Siguiente Pregunta'}
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Encouragement */}
          {!isAnswered && (
            <div className="text-center mt-4 space-y-2">
              <p className="text-sm text-slate-400">
                Elige la respuesta que te parezca correcta. No hay cronómetro. 🕊️
              </p>
              <p className="text-xs text-emerald-500 font-medium flex items-center justify-center gap-1">
                <Save className="w-3 h-3" /> Tu progreso se guarda automáticamente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ICFESDiagnostic;
