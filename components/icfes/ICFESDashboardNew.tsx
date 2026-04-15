import React, { useState, useEffect } from 'react';
import { 
  Play, Clock, BarChart3, ChevronRight, Flame, BookOpen, Target,
  TrendingUp, Award, Zap, Calendar, ArrowRight, RefreshCw, Brain, CheckCircle2
} from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS, IcfesCategory } from './services/IcfesQuestionBank';
import { getRepetitionStats, getReviewSummary } from './services/SpacedRepetition';

interface UserProgress {
  streak: number;
  xp: number;
  level: number;
  totalCapsules: number;
  totalSimulations: number;
  estimatedScore: number;
  areaScores: Record<IcfesCategory, number>;
  lastActivity?: string;
  weeklyGoal: number;
  weeklyCompleted: number;
}

interface ICFESDashboardNewProps {
  userName: string;
  onStartSimulation: (type: 'quick' | 'area' | 'full', category?: IcfesCategory) => void;
  onStartLearning: (category?: IcfesCategory) => void;
  onStartDiagnostic: () => void;
  onViewProgress: () => void;
  onStartQuickClass?: (category?: IcfesCategory) => void;
  onStartReview?: () => void;
  hasDiagnostic: boolean;
}

const DEFAULT_PROGRESS: UserProgress = {
  streak: 0,
  xp: 0,
  level: 1,
  totalCapsules: 0,
  totalSimulations: 0,
  estimatedScore: 0,
  areaScores: {
    LECTURA_CRITICA: 0,
    MATEMATICAS: 0,
    SOCIALES: 0,
    CIENCIAS: 0,
    INGLES: 0
  },
  weeklyGoal: 5,
  weeklyCompleted: 0
};

export const ICFESDashboardNew: React.FC<ICFESDashboardNewProps> = ({
  userName, onStartSimulation, onStartLearning, onStartDiagnostic, onViewProgress, onStartQuickClass, onStartReview, hasDiagnostic
}) => {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  
  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nova_icfes_progress');
    if (saved) {
      try { setProgress({ ...DEFAULT_PROGRESS, ...JSON.parse(saved) }); } catch {}
    }
  }, []);

  const firstName = userName?.split(' ')[0] || 'Estudiante';
  const timeOfDay = new Date().getHours();
  const greeting = timeOfDay < 12 ? 'Buenos días' : timeOfDay < 18 ? 'Buenas tardes' : 'Buenas noches';
  const scorePercent = Math.min(100, (progress.estimatedScore / 500) * 100);
  const passThreshold = (30 / 500) * 100; // 30 points out of 500 = 6%

  const areas: IcfesCategory[] = ['LECTURA_CRITICA', 'MATEMATICAS', 'SOCIALES', 'CIENCIAS', 'INGLES'];

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ─── Header ─── */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              {greeting}, <span className="text-[#1B4D3E]">{firstName}</span> 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {progress.streak > 0 
                ? `Llevas ${progress.streak} ${progress.streak === 1 ? 'día' : 'días'} seguidos. ¡Sigue así!` 
                : 'Tu ruta al bachillerato empieza aquí.'}
            </p>
          </div>
          {progress.streak > 0 && (
            <div className="nova-streak animate-streak-glow">
              <Flame className="w-4 h-4" />
              <span>{progress.streak}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* ─── Diagnostic CTA (if not done) ─── */}
        {!hasDiagnostic && (
          <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg animate-fade-in-up" id="diagnostic-cta">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-white/15 rounded-lg backdrop-blur-sm">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">PRIMER PASO</span>
                </div>
                <h2 className="text-xl font-bold mb-2">Descubre tu nivel actual</h2>
                <p className="text-violet-200 text-sm">
                  50 preguntas completas para evaluar las 5 áreas. Guarda tu progreso automáticamente para que puedas pausar y retomar en cualquier momento.
                </p>
              </div>
              <button 
                onClick={onStartDiagnostic}
                className="nova-btn bg-white text-violet-700 font-bold hover:bg-violet-50 !px-8 rounded-xl shrink-0"
                id="btn-start-diagnostic"
              >
                Hacer Mi Diagnóstico
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Spaced Repetition Review Card ─── */}
        {(() => {
          const reviewSummary = getReviewSummary();
          const stats = getRepetitionStats();
          if (reviewSummary.urgency === 'none' && stats.totalCards === 0) return null;
          
          const urgencyColors = {
            none: 'from-emerald-50 to-green-50 border-emerald-200',
            low: 'from-blue-50 to-indigo-50 border-blue-200',
            medium: 'from-amber-50 to-yellow-50 border-amber-200',
            high: 'from-red-50 to-rose-50 border-red-200'
          };
          const urgencyText = {
            none: 'text-emerald-700',
            low: 'text-blue-700',
            medium: 'text-amber-700',
            high: 'text-red-700'
          };
          
          return (
            <div className={`bg-gradient-to-r ${urgencyColors[reviewSummary.urgency]} border rounded-2xl p-5 mb-4 animate-fade-in-up`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl ${reviewSummary.urgency === 'high' ? 'bg-red-100' : 'bg-violet-100'}`}>
                  <Brain className={`w-6 h-6 ${reviewSummary.urgency === 'high' ? 'text-red-600' : 'text-violet-600'}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-base ${urgencyText[reviewSummary.urgency]}`}>
                    🔄 Repaso Inteligente
                    {stats.dueToday > 0 && (
                      <span className="ml-2 bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {stats.dueToday} pendientes
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">{reviewSummary.message}</p>
                  {stats.streakDays > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-orange-600 font-bold">
                      <Flame className="w-3 h-3" /> {stats.streakDays} días de racha
                    </div>
                  )}
                </div>
                {stats.dueToday > 0 && onStartReview && (
                  <button
                    onClick={onStartReview}
                    className="shrink-0 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" /> Repasar
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* ─── Daily Study Plan ─── */}
        <div className="mb-6 animate-fade-in-up">
          <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1B4D3E]" /> Tu Plan para Hoy
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
            
            {/* Task 1: Spaced Repetition or Diagnostic */}
            {(() => {
              const reviewSummary = getReviewSummary();
              const stats = getRepetitionStats();
              const needsReview = stats.dueToday > 0;
              const isDone = !needsReview && stats.totalCards > 0;

              return (
                <div className={`p-4 flex items-center justify-between border-b border-slate-100 ${isDone ? 'bg-slate-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={onStartReview}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 ${isDone ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}
                      disabled={isDone}
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                    <div>
                      <h4 className={`font-bold text-sm ${isDone ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                        {stats.totalCards === 0 ? 'Completar Diagnóstico' : 'Repaso Inteligente Diario'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {stats.totalCards === 0 ? 'Evalúa tu nivel base' : (isDone ? '¡Memoria fortalecida hoy!' : `${stats.dueToday} preguntas pendientes`)}
                      </p>
                    </div>
                  </div>
                  {!isDone && (stats.totalCards > 0 ? (
                    <button onClick={onStartReview} className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100">Ir</button>
                  ) : (
                    <button onClick={onStartDiagnostic} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100">Ir</button>
                  ))}
                </div>
              );
            })()}

            {/* Task 2: Quick Class / Concept */}
            <div className={`p-4 flex items-center justify-between border-b border-slate-100 ${progress.totalCapsules > 0 && progress.lastActivity === new Date().toISOString().split('T')[0] ? 'bg-slate-50' : ''}`}>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onStartQuickClass?.()}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 ${progress.totalCapsules > 0 && progress.lastActivity === new Date().toISOString().split('T')[0] ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}
                >
                  {progress.totalCapsules > 0 && progress.lastActivity === new Date().toISOString().split('T')[0] && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
                <div>
                  <h4 className={`font-bold text-sm ${progress.totalCapsules > 0 && progress.lastActivity === new Date().toISOString().split('T')[0] ? 'text-slate-500 line-through' : 'text-slate-800'}`}>1 Clase con Ia Profe Lina</h4>
                  <p className="text-xs text-slate-500">Aprende o repasa un concepto clave</p>
                </div>
              </div>
              {!(progress.totalCapsules > 0 && progress.lastActivity === new Date().toISOString().split('T')[0]) && (
                <button onClick={() => onStartQuickClass?.()} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">Ir</button>
              )}
            </div>

            {/* Task 3: Simulación Corta */}
            <div className={`p-4 flex items-center justify-between ${progress.totalSimulations > 0 && progress.lastActivity === new Date().toISOString().split('T')[0] ? 'bg-slate-50' : ''}`}>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onStartSimulation('quick')}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 ${progress.totalSimulations > 0 && progress.lastActivity === new Date().toISOString().split('T')[0] ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}
                >
                  {progress.totalSimulations > 0 && progress.lastActivity === new Date().toISOString().split('T')[0] && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
                <div>
                  <h4 className={`font-bold text-sm ${progress.totalSimulations > 0 && progress.lastActivity === new Date().toISOString().split('T')[0] ? 'text-slate-500 line-through' : 'text-slate-800'}`}>1 Simulacro Corto</h4>
                  <p className="text-xs text-slate-500">20 preguntas para medir tu progreso</p>
                </div>
              </div>
              {!(progress.totalSimulations > 0 && progress.lastActivity === new Date().toISOString().split('T')[0]) && (
                <button onClick={() => onStartSimulation('quick')} className="text-xs font-bold text-[#1B4D3E] bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100">Ir</button>
              )}
            </div>

          </div>
        </div>

        {/* ─── Quick Actions ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up stagger-1">
          {/* Quick Simulation */}
          <button
            onClick={() => onStartSimulation('quick')}
            className="nova-card p-5 text-left hover:scale-[1.02] transition-all group"
            id="btn-quick-sim"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-[#1B4D3E] to-[#2D7A5F] rounded-xl text-white shadow-md">
                <Play className="w-6 h-6" />
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Recomendado</span>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Simulacro Rápido</h3>
            <p className="text-sm text-slate-500">20 preguntas · ~30 min · 5 áreas</p>
            <div className="flex items-center gap-1 mt-3 text-sm font-semibold text-[#1B4D3E] group-hover:gap-2 transition-all">
              Empezar <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Quick ICFES Class — Socratic */}
          <button
            onClick={() => onStartQuickClass?.()}
            className="nova-card p-5 text-left hover:scale-[1.02] transition-all group relative overflow-hidden"
            id="btn-quick-class"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-violet-100 to-transparent rounded-bl-full opacity-60" />
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white shadow-md">
                <Zap className="w-6 h-6" />
              </div>
              <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-1 rounded animate-pulse">NUEVO</span>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Clase Rápida ICFES 🎤</h3>
            <p className="text-sm text-slate-500">Entrena con la Profe Lina en vivo</p>
            <div className="flex items-center gap-1 mt-3 text-sm font-semibold text-violet-600 group-hover:gap-2 transition-all">
              Empezar <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Continue Learning */}
          <button
            onClick={() => onStartLearning()}
            className="nova-card p-5 text-left hover:scale-[1.02] transition-all group"
            id="btn-continue-learning"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-[#3B82F6] to-blue-600 rounded-xl text-white shadow-md">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Seguir Estudiando</h3>
            <p className="text-sm text-slate-500">Continúa tu ruta de aprendizaje</p>
            <div className="flex items-center gap-1 mt-3 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
              Continuar <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Score Prediction */}
          <div className="nova-card p-5" id="score-card">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-[#F5A623]" />
              <span className="font-bold text-slate-700 text-sm">Tu Puntaje Estimado</span>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-extrabold text-slate-800">{progress.estimatedScore || '—'}</span>
              <span className="text-slate-400 text-sm mb-1">/500</span>
            </div>
            <div className="nova-progress mb-2">
              <div 
                className="nova-progress-bar bg-gradient-to-r from-[#1B4D3E] to-[#2D7A5F]" 
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {progress.estimatedScore >= 30 
                ? '✅ Ya superas el puntaje mínimo de aprobación' 
                : `Meta: 30 puntos para aprobar`}
            </p>
          </div>
        </div>

        {/* ─── Progress by Area ─── */}
        <div className="nova-card p-6 animate-fade-in-up stagger-2" id="area-progress">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-400" />
              Progreso por Área
            </h2>
            <button 
              onClick={onViewProgress}
              className="text-sm font-semibold text-[#1B4D3E] hover:underline"
            >
              Ver detalle →
            </button>
          </div>
          <div className="space-y-4">
            {areas.map((area) => {
              const score = progress.areaScores[area] || 0;
              const color = CATEGORY_COLORS[area];
              return (
                <button
                  key={area}
                  onClick={() => onStartLearning(area)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                >
                  <span className="text-xl">{CATEGORY_ICONS[area]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold text-slate-700 truncate">{CATEGORY_LABELS[area]}</span>
                      <span className="text-sm font-bold" style={{ color }}>{score}%</span>
                    </div>
                    <div className="nova-progress">
                      <div 
                        className="nova-progress-bar transition-all duration-700" 
                        style={{ width: `${score}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Practice by Area ─── */}
        <div className="animate-fade-in-up stagger-3">
          <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#F5A623]" />
            Practica por Área
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => onStartSimulation('area', area)}
                className="nova-card p-4 text-center hover:scale-105 transition-all"
                id={`btn-area-${area.toLowerCase()}`}
              >
                <span className="text-3xl mb-2 block">{CATEGORY_ICONS[area]}</span>
                <span className="text-xs font-semibold text-slate-600 block leading-tight">
                  {CATEGORY_LABELS[area].split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Weekly Goal ─── */}
        <div className="nova-card p-6 animate-fade-in-up stagger-4" id="weekly-goal">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              Meta Semanal
            </h2>
            <span className="text-sm text-slate-500">{progress.weeklyCompleted}/{progress.weeklyGoal} cápsulas</span>
          </div>
          <div className="nova-progress h-3 mb-3">
            <div 
              className="nova-progress-bar bg-gradient-to-r from-[#F5A623] to-orange-500"
              style={{ width: `${Math.min(100, (progress.weeklyCompleted / progress.weeklyGoal) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {progress.weeklyCompleted >= progress.weeklyGoal 
              ? '🎉 ¡Meta cumplida esta semana! Sigue así.' 
              : `Te faltan ${progress.weeklyGoal - progress.weeklyCompleted} cápsulas para cumplir tu meta.`}
          </p>
        </div>

        {/* ─── Recent Activity ─── */}
        <div className="nova-card p-6 animate-fade-in-up stagger-5" id="recent-activity">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Actividad Reciente
          </h2>
          {progress.totalSimulations === 0 && progress.totalCapsules === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aquí verás tu historial de estudio.</p>
              <p className="text-xs mt-1">¡Empieza con el diagnóstico para ver tu primera actividad!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Diagnóstico completado</p>
                  <p className="text-xs text-slate-500">Tu ruta personalizada está lista</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ICFESDashboardNew;
