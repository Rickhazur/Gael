import React from 'react';
import { 
  TrendingUp, Clock, ChevronRight, BarChart3, RotateCw, Home, 
  CheckCircle2, Star, Award
} from 'lucide-react';
import { IcfesCategory, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS } from './services/IcfesQuestionBank';
import { SimulationResults } from './ICFESSimulator';

interface ICFESResultsNewProps {
  results: SimulationResults;
  onRetry: () => void;
  onHome: () => void;
}

export const ICFESResultsNew: React.FC<ICFESResultsNewProps> = ({ results, onRetry, onHome }) => {
  const percent = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} min ${s} seg`;
  };

  const areas: IcfesCategory[] = ['LECTURA_CRITICA', 'MATEMATICAS', 'SOCIALES', 'CIENCIAS', 'INGLES'];
  const bestArea = areas.reduce((best, area) => {
    const aScore = results.areaBreakdown[area]?.total > 0 
      ? results.areaBreakdown[area].correct / results.areaBreakdown[area].total 
      : 0;
    const bScore = results.areaBreakdown[best]?.total > 0 
      ? results.areaBreakdown[best].correct / results.areaBreakdown[best].total 
      : 0;
    return aScore > bScore ? area : best;
  }, areas[0]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-8 px-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1B4D3E] to-[#2D7A5F] rounded-2xl p-8 text-white text-center mb-6 shadow-lg animate-fade-in-up">
          <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
            {percent >= 70 ? <Star className="w-10 h-10 text-yellow-300" /> 
             : percent >= 40 ? <Award className="w-10 h-10 text-emerald-200" /> 
             : <TrendingUp className="w-10 h-10 text-emerald-200" />}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {percent >= 70 ? '¡Excelente resultado!' 
             : percent >= 40 ? '¡Buen esfuerzo!' 
             : '¡Gran práctica!'}
          </h2>
          <p className="text-emerald-200">
            {percent >= 70 ? 'Vas por muy buen camino hacia tu bachillerato.' 
             : percent >= 40 ? 'Cada simulacro te acerca más a tu meta.' 
             : 'La práctica hace al maestro. Sigue así.'}
          </p>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in-up stagger-1">
          <div className="nova-card p-4 text-center">
            <div className="text-3xl font-extrabold text-slate-800">{results.correctAnswers}</div>
            <div className="text-xs text-slate-500 mt-1">Correctas de {results.totalQuestions}</div>
          </div>
          <div className="nova-card p-4 text-center">
            <div className="text-3xl font-extrabold text-[#1B4D3E]">{percent}%</div>
            <div className="text-xs text-slate-500 mt-1">Aciertos</div>
          </div>
          <div className="nova-card p-4 text-center">
            <div className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-1">
              <Clock className="w-5 h-5 text-slate-400" />
              {Math.floor(results.timeSpent / 60)}<span className="text-sm font-normal text-slate-400">min</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Tiempo</div>
          </div>
        </div>

        {/* Estimated Score */}
        <div className="nova-card p-5 mb-6 animate-fade-in-up stagger-2">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#F5A623]" />
            <span className="font-bold text-slate-700">Puntaje Estimado ICFES</span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-extrabold text-slate-800">{results.estimatedScore}</span>
            <span className="text-sm text-slate-400 mb-1">/500</span>
          </div>
          <div className="nova-progress mb-2">
            <div className="nova-progress-bar bg-gradient-to-r from-[#1B4D3E] to-[#2D7A5F]" style={{ width: `${(results.estimatedScore / 500) * 100}%` }} />
          </div>
          <p className="text-xs text-slate-500">
            {results.estimatedScore >= 200 ? '✅ Muy por encima del puntaje mínimo (30 puntos).' 
             : results.estimatedScore >= 100 ? '📈 Vas bien. Con más práctica subiras rápido.' 
             : 'Cada simulacro te acerca a tu meta. ¡No pares!'}
          </p>
        </div>

        {/* Area Breakdown */}
        <div className="nova-card p-6 mb-6 animate-fade-in-up stagger-3">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-400" />
            Resultados por Área
          </h3>
          <div className="space-y-4">
            {areas.map(area => {
              const data = results.areaBreakdown[area];
              if (!data || data.total === 0) return null;
              const areaPercent = Math.round((data.correct / data.total) * 100);
              return (
                <div key={area}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{CATEGORY_ICONS[area]}</span>
                      <span className="text-sm font-semibold text-slate-700">{CATEGORY_LABELS[area]}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: CATEGORY_COLORS[area] }}>
                      {data.correct}/{data.total} ({areaPercent}%)
                    </span>
                  </div>
                  <div className="nova-progress">
                    <div className="nova-progress-bar" style={{ width: `${areaPercent}%`, backgroundColor: CATEGORY_COLORS[area] }} />
                  </div>
                </div>
              );
            })}
          </div>
          {bestArea && results.areaBreakdown[bestArea]?.total > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm text-green-800">
                💪 <strong>Tu área más fuerte:</strong> {CATEGORY_ICONS[bestArea]} {CATEGORY_LABELS[bestArea]}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up stagger-4">
          <button onClick={onRetry} className="nova-btn nova-btn-primary flex-1 rounded-xl">
            <RotateCw className="w-5 h-5" />
            Hacer Otro Simulacro
          </button>
          <button onClick={onHome} className="nova-btn nova-btn-secondary flex-1 rounded-xl">
            <Home className="w-5 h-5" />
            Ir al Inicio
          </button>
        </div>

        {/* Encouragement */}
        <p className="text-center text-sm text-slate-400 mt-8">
          "Cada pregunta practicada es un paso más hacia tu bachillerato." 🎓
        </p>
      </div>
    </div>
  );
};

export default ICFESResultsNew;
