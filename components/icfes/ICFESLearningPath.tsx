import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, CheckCircle, ChevronDown, Lock, Play, Star, ChevronLeft, AlertTriangle, TrendingUp, Target, Zap, Brain } from 'lucide-react';
import { CURRICULUM, getGrade, GradeModule } from '../../data/curriculumByGrade';
import VirtualClassroom from './VirtualClassroom';
import SocraticClassroom from './SocraticClassroom';
import { IcfesCategory, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS, COMPETENCY_LABELS, IcfesCompetency } from './services/IcfesQuestionBank';
import { DiagnosticResults } from './ICFESDiagnostic';

interface ICFESLearningPathProps {
  onBack: () => void;
}

// Map ICFES areas to curriculum module area field
const AREA_MAP: Record<IcfesCategory, string> = {
  LECTURA_CRITICA: 'LECTURA_CRITICA',
  MATEMATICAS: 'MATEMATICAS',
  SOCIALES: 'SOCIALES',
  CIENCIAS: 'CIENCIAS',
  INGLES: 'INGLES'
};

interface AreaDiagnostic {
  area: IcfesCategory;
  percent: number;
  correct: number;
  total: number;
  status: 'strong' | 'moderate' | 'weak' | 'critical';
  label: string;
}

const ICFESLearningPath: React.FC<ICFESLearningPathProps> = ({ onBack }) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResults | null>(null);
  
  // Progress tracking from localStorage
  const [progress, setProgress] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('nova_learning_progress');
    if (saved) {
      try { return JSON.parse(saved); } catch { return {}; }
    }
    return {};
  });

  // Load diagnostic results
  useEffect(() => {
    const diag = localStorage.getItem('nova_icfes_diagnostic');
    if (diag) {
      try {
        setDiagnosticResults(JSON.parse(diag));
      } catch { /* no diagnostic */ }
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('nova_learning_progress', JSON.stringify(progress));
  }, [progress]);

  // ─── Analyze diagnostic to create priority ranking ───
  const areaDiagnostics: AreaDiagnostic[] = useMemo(() => {
    if (!diagnosticResults?.areaScores) return [];
    
    const areas: IcfesCategory[] = ['LECTURA_CRITICA', 'MATEMATICAS', 'SOCIALES', 'CIENCIAS', 'INGLES'];
    return areas.map(area => {
      const score = diagnosticResults.areaScores[area];
      const percent = typeof score === 'object' ? score.percent : (typeof score === 'number' ? score : 0);
      const correct = typeof score === 'object' ? score.correct : 0;
      const total = typeof score === 'object' ? score.total : 10;
      
      let status: AreaDiagnostic['status'];
      if (percent >= 70) status = 'strong';
      else if (percent >= 50) status = 'moderate';
      else if (percent >= 30) status = 'weak';
      else status = 'critical';
      
      return { area, percent, correct, total, status, label: CATEGORY_LABELS[area] };
    }).sort((a, b) => a.percent - b.percent); // Weakest first
  }, [diagnosticResults]);

  // ─── Get the priority area (weakest) ───
  const priorityArea = areaDiagnostics.length > 0 ? areaDiagnostics[0] : null;
  const recommendedGrade = useMemo(() => {
    // If very weak (<30%), start from grade 6 foundations
    // If moderate (30-50%), start from grade 8-9
    // If strong (>50%), go to grade 10-11 for polishing
    if (!priorityArea) return 6;
    if (priorityArea.percent < 30) return 6;
    if (priorityArea.percent < 50) return 8;
    return 10;
  }, [priorityArea]);

  // ─── Auto-set grade based on diagnostic on first load ───
  useEffect(() => {
    if (diagnosticResults && !localStorage.getItem('nova_grade_set_by_diag')) {
      setSelectedGrade(recommendedGrade);
      localStorage.setItem('nova_grade_set_by_diag', 'true');
    }
  }, [diagnosticResults, recommendedGrade]);

  // ─── Reorder modules: weakest areas first ───
  const currentGradeData = getGrade(selectedGrade);
  const sortedModules = useMemo(() => {
    if (!currentGradeData?.modules) return [];
    if (areaDiagnostics.length === 0) return currentGradeData.modules;
    
    // Create a priority map: lower percent = higher priority (lower index)
    const priorityMap: Record<string, number> = {};
    areaDiagnostics.forEach((ad, idx) => {
      priorityMap[ad.area] = idx;
    });
    
    return [...currentGradeData.modules].sort((a, b) => {
      const aPriority = priorityMap[a.area] ?? 99;
      const bPriority = priorityMap[b.area] ?? 99;
      return aPriority - bPriority;
    });
  }, [currentGradeData, areaDiagnostics]);

  const toggleArea = (areaId: string) => {
    setExpandedArea(expandedArea === areaId ? null : areaId);
  };

  const handleStartLesson = (lesson: any, areaName: string, areaIcon: string, areaColor: string) => {
    setActiveLesson({ lesson, areaName, areaIcon, areaColor });
  };

  const handleCompleteLesson = (score: number) => {
    if (activeLesson) {
      setProgress(prev => ({
        ...prev,
        [activeLesson.lesson.id]: score
      }));
    }
    setActiveLesson(null);
  };

  // ─── Get diagnostic status for a module area ───
  const getAreaStatus = (moduleArea: string): AreaDiagnostic | undefined => {
    return areaDiagnostics.find(ad => ad.area === moduleArea);
  };

  const statusConfig = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: '🚨 Prioridad Alta', badgeBg: 'bg-red-100' },
    weak: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: '⚠️ Necesita refuerzo', badgeBg: 'bg-amber-100' },
    moderate: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: '📈 En desarrollo', badgeBg: 'bg-blue-100' },
    strong: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: '💪 Fortaleza', badgeBg: 'bg-green-100' },
  };

  if (activeLesson) {
    return (
      <VirtualClassroom
        lesson={activeLesson.lesson}
        gradeName={`Grado ${selectedGrade}°`}
        areaName={activeLesson.areaName}
        areaIcon={activeLesson.icon}
        areaColor={activeLesson.color}
        onBack={() => setActiveLesson(null)}
        onComplete={handleCompleteLesson}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFAF8]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-1 -ml-1 hover:bg-slate-50 rounded-lg text-slate-500">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              🎯 Tu Ruta Personalizada
            </h1>
            <p className="text-sm text-slate-500">
              {diagnosticResults ? 'Organizada según tu diagnóstico' : 'Del grado 6° al 11° para el ICFES'}
            </p>
          </div>
        </div>

        {/* Grade Selector */}
        <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
          {CURRICULUM.map(grade => {
            const isRecommended = grade.grade === recommendedGrade && diagnosticResults;
            return (
              <button
                key={grade.grade}
                onClick={() => setSelectedGrade(grade.grade)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors relative ${
                  selectedGrade === grade.grade 
                    ? 'bg-emerald-600 text-white' 
                    : isRecommended
                      ? 'bg-amber-50 border-2 border-amber-300 text-amber-700'
                      : 'bg-white border text-slate-600 hover:bg-slate-50'
                }`}
              >
                Grado {grade.grade}°
                {isRecommended && selectedGrade !== grade.grade && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Curriculum Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        
        {/* ─── Diagnostic Summary Banner ─── */}
        {diagnosticResults && areaDiagnostics.length > 0 && (
          <div className="mb-6 animate-fade-in-up">
            {/* Priority Alert */}
            {priorityArea && priorityArea.percent < 50 && (
              <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-2xl p-5 text-white mb-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/15 rounded-xl shrink-0">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Profesora Lina recomienda:</h3>
                    <p className="text-violet-200 text-sm mt-1">
                      Enfócate primero en <strong className="text-white">{priorityArea.label}</strong> ({priorityArea.percent}% en el diagnóstico). 
                      Los módulos están organizados para que trabajes tus debilidades primero.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Area Status Cards */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {areaDiagnostics.map(ad => {
                const config = statusConfig[ad.status];
                return (
                  <div key={ad.area} className={`rounded-xl p-2 text-center ${config.bg} border ${config.border}`}>
                    <span className="text-lg">{CATEGORY_ICONS[ad.area]}</span>
                    <p className={`text-lg font-extrabold ${config.text}`}>{ad.percent}%</p>
                    <p className="text-[9px] font-bold text-slate-500 leading-tight mt-0.5">
                      {ad.area === 'LECTURA_CRITICA' ? 'Lectura' : 
                       ad.area === 'MATEMATICAS' ? 'Mate' :
                       ad.area === 'SOCIALES' ? 'Sociales' :
                       ad.area === 'CIENCIAS' ? 'Ciencias' : 'Inglés'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentGradeData && (
          <div className="mb-6 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
            <h2 className="font-bold text-emerald-800">{currentGradeData.name}</h2>
            <p className="text-sm text-emerald-700 mt-1">{currentGradeData.description}</p>
          </div>
        )}

        <div className="space-y-4">
          {sortedModules.map((module, moduleIdx) => {
            const isExpanded = expandedArea === module.id;
            const completedCount = module.lessons.filter(l => (progress[l.id] || 0) >= 80).length;
            const totalCount = module.lessons.length;
            const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
            const areaStatus = getAreaStatus(module.area);
            const config = areaStatus ? statusConfig[areaStatus.status] : null;

            return (
              <div key={module.id} className={`nova-card overflow-hidden ${moduleIdx === 0 && areaStatus?.status === 'critical' ? 'ring-2 ring-red-300 ring-offset-2' : ''}`}>
                {/* Priority Badge */}
                {areaStatus && moduleIdx < 2 && areaStatus.percent < 50 && (
                  <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest ${config?.badgeBg} ${config?.text} flex items-center gap-1.5`}>
                    {areaStatus.status === 'critical' ? <AlertTriangle className="w-3 h-3" /> : <Target className="w-3 h-3" />}
                    {config?.badge} — Diagnóstico: {areaStatus.percent}%
                  </div>
                )}
                {areaStatus && areaStatus.status === 'strong' && (
                  <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest ${config?.badgeBg} ${config?.text} flex items-center gap-1.5`}>
                    <TrendingUp className="w-3 h-3" />
                    {config?.badge} — Diagnóstico: {areaStatus.percent}%
                  </div>
                )}

                {/* Area Header */}
                <button 
                  onClick={() => toggleArea(module.id)}
                  className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                      style={{ backgroundColor: `${module.color}15`, color: module.color }}
                    >
                      {module.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-800">{module.areaName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, backgroundColor: module.color }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{percentage}%</span>
                        {totalCount === 0 && (
                          <span className="text-[10px] text-slate-400">(próximamente)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'bg-slate-100 rotate-180' : 'bg-slate-50'}`}>
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  </div>
                </button>

                {/* Lessons List */}
                {isExpanded && (
                  <div className="bg-slate-50/50 border-t border-slate-100 p-4 space-y-3">
                    {module.lessons.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-sm text-slate-400 mb-2">Módulos en desarrollo para este grado.</p>
                        <p className="text-xs text-slate-300">
                          Mientras tanto, puedes practicar con la Profesora Lina en "Clase IA" 🤖
                        </p>
                      </div>
                    ) : (
                      module.lessons.map((lesson, index) => {
                        const score = progress[lesson.id] || 0;
                        const isCompleted = score >= 80;
                        const isLocked = false;

                        return (
                          <div 
                            key={lesson.id}
                            className={`nova-card p-3 flex gap-3 ${isLocked ? 'opacity-70 bg-slate-50' : 'bg-white'}`}
                          >
                            <div className="shrink-0 mt-1">
                              {isLocked ? (
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                  <Lock className="w-4 h-4 text-slate-400" />
                                </div>
                              ) : isCompleted ? (
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Play className="w-4 h-4 text-blue-600 ml-0.5" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{lesson.title}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{lesson.duration} · {lesson.type === 'lesson' ? 'Clase Guiada' : 'Práctica'}</p>
                            </div>
                            
                            {!isLocked && (
                              <button 
                                onClick={() => handleStartLesson(lesson, module.areaName, module.icon, module.color)}
                                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                  isCompleted 
                                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                }`}
                                style={isCompleted ? {} : {
                                  backgroundColor: `${module.color}15`,
                                  color: module.color
                                }}
                              >
                                {isCompleted ? 'Repasar' : 'Empezar'}
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center pb-24">
          <p className="text-sm text-slate-400 flex items-center justify-center gap-1">
            <Star className="w-4 h-4 text-amber-400" /> Selecciona otro grado en la barra superior.
          </p>
        </div>
      </div>
    </div>
  );
};

export { ICFESLearningPath };
