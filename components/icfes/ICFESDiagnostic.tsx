import React, { useState } from 'react';
import { ChevronRight, ArrowLeft, CheckCircle2, Brain, Star, TrendingUp } from 'lucide-react';
import { getDiagnosticQuestions, IcfesQuestion, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS, IcfesCategory } from './services/IcfesQuestionBank';

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

export const ICFESDiagnostic: React.FC<ICFESDiagnosticProps> = ({ userName, onComplete, onBack }) => {
  const [questions] = useState<IcfesQuestion[]>(() => getDiagnosticQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<DiagnosticResults | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isAnswered = currentQuestion && !!answers[currentQuestion.id];
  const firstName = userName?.split(' ')[0] || 'Estudiante';

  const handleAnswer = (optionId: string) => {
    if (answers[currentQuestion.id]) return; // Already answered
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Calculate results
      calculateResults();
    }
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

    // Estimate ICFES score (rough: scale 0-500 based on performance)
    const overallPercent = (totalCorrect / questions.length) * 100;
    const estimatedScore = Math.round((overallPercent / 100) * 400 + 50); // Range ~50-450

    // Determine strengths and weaknesses
    const sorted = areas.sort((a, b) => areaScores[b].percent - areaScores[a].percent);
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

    // Save to localStorage
    localStorage.setItem('nova_icfes_diagnostic', JSON.stringify(diagnosticResults));
    const existingProgress = JSON.parse(localStorage.getItem('nova_icfes_progress') || '{}');
    const updatedProgress = {
      ...existingProgress,
      estimatedScore,
      areaScores: Object.fromEntries(areas.map(a => [a, areaScores[a].percent]))
    };
    localStorage.setItem('nova_icfes_progress', JSON.stringify(updatedProgress));
  };

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
            <h2 className="text-2xl font-bold mb-2">¡Gran punto de partida, {firstName}!</h2>
            <p className="text-emerald-200">
              Ya sabemos en qué eres fuerte y dónde podemos mejorar juntos.
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
              {results.estimatedScore >= 30 
                ? '✅ Ya estás cerca del puntaje de aprobación. ¡Vamos a asegurarlo!'
                : 'Con tu ruta personalizada, vas a subir ese puntaje rápidamente.'}
            </p>
          </div>

          {/* Area Results */}
          <div className="nova-card p-6 mb-6 animate-fade-in-up stagger-2">
            <h3 className="font-bold text-slate-800 mb-4">Tu nivel por área</h3>
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

  // ─── Question Screen ───
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Salir
            </button>
            <span className="text-sm text-slate-400 font-medium">
              Test Diagnóstico · {currentIndex + 1}/{questions.length}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="nova-progress">
            <div 
              className="nova-progress-bar bg-gradient-to-r from-violet-500 to-indigo-600" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full animate-fade-in-up">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{CATEGORY_ICONS[currentQuestion.category]}</span>
            <span 
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[currentQuestion.category] + '15', color: CATEGORY_COLORS[currentQuestion.category] }}
            >
              {CATEGORY_LABELS[currentQuestion.category]}
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
            <p className="text-center text-sm text-slate-400 mt-4">
              Elige la respuesta que te parezca correcta. No hay cronómetro. 🕊️
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ICFESDiagnostic;
