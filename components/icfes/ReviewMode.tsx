/**
 * Modo Repaso — Repetición Espaciada
 * Muestra las preguntas que Danna falló y que están "vencidas" para repaso.
 * Si acierta → la pregunta se programa para más adelante (nivel sube).
 * Si falla → la pregunta vuelve al inicio (nivel 0, repaso mañana).
 */
import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Brain, RefreshCw, Star, Flame, Trophy } from 'lucide-react';
import { IcfesQuestion, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS, IcfesCategory } from './services/IcfesQuestionBank';
import { getDueQuestions, promoteCard, demoteCard, recordReviewSession, getRepetitionStats } from './services/SpacedRepetition';

interface ReviewModeProps {
  onBack: () => void;
  onComplete: () => void;
}

export const ReviewMode: React.FC<ReviewModeProps> = ({ onBack, onComplete }) => {
  const [questions] = useState<IcfesQuestion[]>(() => getDueQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (optionId: string) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
    setShowResult(true);
    setSessionTotal(prev => prev + 1);

    const isCorrect = optionId === currentQuestion.correctId;
    if (isCorrect) {
      promoteCard(currentQuestion.id);
      setSessionCorrect(prev => prev + 1);
    } else {
      demoteCard(currentQuestion.id);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Session complete
      recordReviewSession();
      setIsComplete(true);
    }
  };

  // ─── No questions due ───
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="max-w-md w-full text-center animate-fade-in-up">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">¡Estás al día! 🎉</h2>
          <p className="text-slate-500 mb-6">
            No tienes preguntas pendientes de repaso. Vuelve mañana para mantener frescos tus conocimientos.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-emerald-700">
              <strong>Consejo de Lina:</strong> Mientras tanto, puedes practicar con un simulacro rápido para descubrir nuevos temas a reforzar.
            </p>
          </div>
          <button 
            onClick={onBack}
            className="nova-btn nova-btn-primary w-full rounded-xl"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // ─── Session Complete ───
  if (isComplete) {
    const percentage = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    const stats = getRepetitionStats();
    
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="max-w-md w-full animate-fade-in-up">
          <div className="nova-card p-8 text-center">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Repaso completado!</h2>
            <p className="text-slate-500 mb-6">Tu cerebro se hace más fuerte cada día 💪</p>

            {/* Score */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500">Aciertos</span>
                <span className="text-2xl font-extrabold text-emerald-600">{sessionCorrect}/{sessionTotal}</span>
              </div>
              <div className="nova-progress">
                <div 
                  className={`nova-progress-bar ${percentage >= 70 ? 'bg-emerald-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {percentage >= 70 ? '¡Excelente retención!' : percentage >= 40 ? 'Vas mejorando, sigue repasando.' : 'Estos temas necesitan más práctica.'}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-violet-50 rounded-xl p-3">
                <p className="text-xl font-extrabold text-violet-700">{stats.mastered}</p>
                <p className="text-[10px] font-bold text-violet-500">DOMINADAS</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-xl font-extrabold text-amber-700">{stats.totalCards - stats.mastered}</p>
                <p className="text-[10px] font-bold text-amber-500">EN REPASO</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <p className="text-xl font-extrabold text-emerald-700">{stats.streakDays}</p>
                </div>
                <p className="text-[10px] font-bold text-emerald-500">RACHA</p>
              </div>
            </div>

            <button 
              onClick={onComplete}
              className="nova-btn nova-btn-primary w-full rounded-xl"
            >
              Volver al Inicio <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Review Question ───
  if (!currentQuestion) return null;

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
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-bold text-violet-600">
                Repaso {currentIndex + 1}/{questions.length}
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="nova-progress">
            <div 
              className="nova-progress-bar bg-gradient-to-r from-violet-500 to-purple-600" 
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          {/* Session score */}
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>✅ {sessionCorrect} correctas</span>
            <span>❌ {sessionTotal - sessionCorrect} por repasar</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full animate-fade-in-up" key={currentQuestion.id}>
          {/* Area + Review Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{CATEGORY_ICONS[currentQuestion.category]}</span>
            <span 
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[currentQuestion.category] + '15', color: CATEGORY_COLORS[currentQuestion.category] }}
            >
              {CATEGORY_LABELS[currentQuestion.category]}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-violet-100 text-violet-700">
              🔄 Repaso
            </span>
          </div>

          {/* Context */}
          {currentQuestion.context && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-sm text-slate-600 leading-relaxed italic max-h-48 overflow-y-auto">
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
              const isSelected = selectedAnswer === option.id;
              const isCorrect = currentQuestion.correctId === option.id;

              let className = 'nova-option';
              if (showResult && isCorrect) className += ' correct';
              else if (showResult && isSelected && !isCorrect) className += ' incorrect';
              else if (isSelected) className += ' selected';

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  disabled={showResult}
                  className={className}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 transition-colors ${
                    showResult && isCorrect 
                      ? 'border-green-500 bg-green-500 text-white' 
                      : showResult && isSelected 
                        ? 'border-red-400 bg-red-400 text-white' 
                        : 'border-slate-200 text-slate-400'
                  }`}>
                    {option.id}
                  </div>
                  <span className="flex-1">{option.text}</span>
                  {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showResult && (
            <div className={`p-4 rounded-xl mb-6 animate-fade-in-up ${
              selectedAnswer === currentQuestion.correctId 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-amber-50 border border-amber-200'
            }`}>
              <p className={`text-sm font-semibold mb-1 ${
                selectedAnswer === currentQuestion.correctId ? 'text-green-800' : 'text-amber-800'
              }`}>
                {selectedAnswer === currentQuestion.correctId 
                  ? '¡Bien! Tu memoria mejora 🧠 (próximo repaso más adelante)'
                  : 'Aún no la dominas 💪 (volverá mañana para que la practiques)'}
              </p>
              <p className="text-sm text-slate-600">{currentQuestion.explanation}</p>
              {currentQuestion.techniqueTip && (
                <p className="text-xs text-violet-600 mt-2 font-medium">
                  💡 Tip: {currentQuestion.techniqueTip}
                </p>
              )}
            </div>
          )}

          {/* Next Button */}
          {showResult && (
            <button 
              onClick={handleNext}
              className="nova-btn nova-btn-primary w-full rounded-xl animate-fade-in-up"
            >
              {currentIndex === questions.length - 1 ? 'Ver Resultados del Repaso' : 'Siguiente Pregunta'}
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewMode;
