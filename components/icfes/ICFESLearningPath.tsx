import React, { useState } from 'react';
import { BookOpen, CheckCircle, ChevronDown, Lock, Play, Star, ChevronLeft } from 'lucide-react';
import { CURRICULUM, getGrade } from '../../data/curriculumByGrade';
import VirtualClassroom from './VirtualClassroom';
import SocraticClassroom from './SocraticClassroom';

interface ICFESLearningPathProps {
  onBack: () => void;
}

const ICFESLearningPath: React.FC<ICFESLearningPathProps> = ({ onBack }) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(6); // Start at 6th grade
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null); // State to hold the actively playing lesson
  
  // Progress tracking (simulated for now, would be in localStorage/Supabase)
  const [progress, setProgress] = useState<Record<string, number>>({
    'g6-mat-01': 100, // Completed
    'g6-mat-02': 0,
    'g6-lc-01': 100
  });

  const currentGradeData = getGrade(selectedGrade);

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
              📚 Tu Ruta de Aprendizaje
            </h1>
            <p className="text-sm text-slate-500">Del grado 6° al 11° para el ICFES</p>
          </div>
        </div>

        {/* Grade Selector */}
        <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
          {CURRICULUM.map(grade => (
            <button
              key={grade.grade}
              onClick={() => setSelectedGrade(grade.grade)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedGrade === grade.grade 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white border text-slate-600 hover:bg-slate-50'
              }`}
            >
              Grado {grade.grade}°
            </button>
          ))}
        </div>
      </div>

      {/* Curriculum Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {currentGradeData && (
          <div className="mb-6 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
            <h2 className="font-bold text-emerald-800">{currentGradeData.name}</h2>
            <p className="text-sm text-emerald-700 mt-1">{currentGradeData.description}</p>
          </div>
        )}

        <div className="space-y-4">
          {currentGradeData?.modules.map(module => {
            const isExpanded = expandedArea === module.id;
            const completedCount = module.lessons.filter(l => (progress[l.id] || 0) >= 80).length;
            const totalCount = module.lessons.length;
            const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

            return (
              <div key={module.id} className="nova-card overflow-hidden">
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
                      <p className="text-sm text-slate-400 text-center py-4">Módulos en desarrollo para este grado.</p>
                    ) : (
                      module.lessons.map((lesson, index) => {
                        const score = progress[lesson.id] || 0;
                        const isCompleted = score >= 80;
                        const isLocked = false; // Desbloqueado por petición del administrador

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
