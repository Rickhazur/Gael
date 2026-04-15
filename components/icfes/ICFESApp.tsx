/**
 * Nova ICFES — Main Application Wrapper
 * Orchestrates all views: Landing → Login → Diagnostic → Dashboard → Simulator → Results → Learning → QuickClass
 */
import React, { useState, useEffect, Suspense } from 'react';
import { Home, BookOpen, Target, User, Zap } from 'lucide-react';
import { IcfesCategory } from './services/IcfesQuestionBank';

// Components
import { ICFESLanding } from './ICFESLanding';
import { ICFESDashboardNew } from './ICFESDashboardNew';
import { ICFESDiagnostic, DiagnosticResults } from './ICFESDiagnostic';
import { ICFESSimulator, SimulationResults } from './ICFESSimulator';
import { ICFESResultsNew } from './ICFESResultsNew';
import { ICFESLearningPath } from './ICFESLearningPath';
import { SocraticClassroom } from './SocraticClassroom';
import { ReviewMode } from './ReviewMode';
import { AIQuestionGenerator } from './admin/AIQuestionGenerator';
import { Lesson } from '../../data/curriculumByGrade';

type AppView = 'landing' | 'login' | 'diagnostic' | 'dashboard' | 'simulator' | 'results' | 'learning' | 'profile' | 'quickclass' | 'review' | 'generator';

interface ICFESAppProps {
  // Optional: pass in auth state from parent App.tsx
  isAuthenticated?: boolean;
  userName?: string;
  userId?: string;
  onLogin?: (mode: string) => void;
  onLogout?: () => void;
}

// A generic lesson for quick ICFES training when no specific lesson is selected
const QUICK_ICFES_LESSON: Lesson = {
  id: 'quick-icfes',
  title: 'Entrenamiento ICFES General',
  objective: 'Practicar preguntas tipo ICFES de todas las áreas',
  explanation: '',
  examples: [],
  practiceQuestions: [],
  duration: '∞',
  type: 'practice'
};

// Area-specific quick lessons
const AREA_QUICK_LESSONS: Record<string, Lesson> = {
  'LECTURA_CRITICA': { ...QUICK_ICFES_LESSON, id: 'quick-lc', title: 'Lectura Crítica — Entrenamiento ICFES' },
  'MATEMATICAS': { ...QUICK_ICFES_LESSON, id: 'quick-mat', title: 'Matemáticas — Entrenamiento ICFES' },
  'CIENCIAS': { ...QUICK_ICFES_LESSON, id: 'quick-cie', title: 'Ciencias Naturales — Entrenamiento ICFES' },
  'SOCIALES': { ...QUICK_ICFES_LESSON, id: 'quick-soc', title: 'Sociales — Entrenamiento ICFES' },
  'INGLES': { ...QUICK_ICFES_LESSON, id: 'quick-eng', title: 'Inglés — Entrenamiento ICFES' },
};

const AREA_NAME_MAP: Record<string, string> = {
  'LECTURA_CRITICA': 'Lectura Crítica',
  'MATEMATICAS': 'Matemáticas',
  'CIENCIAS': 'Ciencias Naturales',
  'SOCIALES': 'Sociales y Ciudadanas',
  'INGLES': 'Inglés',
};

export const ICFESApp: React.FC<ICFESAppProps> = ({ 
  isAuthenticated: externalAuth, 
  userName: externalName,
  userId,
  onLogin: externalLogin,
  onLogout 
}) => {
  const [view, setView] = useState<AppView>('landing');
  const [userName, setUserName] = useState(externalName || '');
  const [isAuthenticated, setIsAuthenticated] = useState(externalAuth || false);
  const [hasDiagnostic, setHasDiagnostic] = useState(false);
  const [simMode, setSimMode] = useState<'quick' | 'area' | 'full'>('quick');
  const [simCategory, setSimCategory] = useState<IcfesCategory | undefined>();
  const [simResults, setSimResults] = useState<SimulationResults | null>(null);
  const [learningCategory, setLearningCategory] = useState<IcfesCategory | undefined>();
  const [quickClassLesson, setQuickClassLesson] = useState<Lesson>(QUICK_ICFES_LESSON);
  const [quickClassArea, setQuickClassArea] = useState<string>('Matemáticas');

  // Sync with external auth
  useEffect(() => {
    if (externalAuth !== undefined) setIsAuthenticated(externalAuth);
    if (externalName) setUserName(externalName);
  }, [externalAuth, externalName]);

  // Check for diagnostic on mount
  useEffect(() => {
    const diag = localStorage.getItem('nova_icfes_diagnostic');
    if (diag) setHasDiagnostic(true);
  }, []);

  // Determine initial view
  useEffect(() => {
    if (isAuthenticated) {
      // MANDATORY: If diagnostic not done, force it
      if (!hasDiagnostic) {
        setView('diagnostic');
      } else {
        setView('dashboard');
      }
    } else {
      setView('landing');
    }
  }, [isAuthenticated, hasDiagnostic]);

  // ─── Demo login (no Supabase needed) ───
  const handleDemoLogin = () => {
    setIsAuthenticated(true);
    setUserName('Estudiante');
    localStorage.setItem('nova_icfes_user', JSON.stringify({ name: 'Estudiante', demo: true }));
    setView('dashboard');
  };

  // ─── Navigation handlers ───
  const handleStartSimulation = (type: 'quick' | 'area' | 'full', category?: IcfesCategory) => {
    setSimMode(type);
    setSimCategory(category);
    setSimResults(null);
    setView('simulator');
  };

  const handleSimulationComplete = (results: SimulationResults) => {
    setSimResults(results);
    setView('results');
  };

  const handleDiagnosticComplete = (results: DiagnosticResults) => {
    setHasDiagnostic(true);
    setView('dashboard');
  };

  const handleStartLearning = (category?: IcfesCategory) => {
    setLearningCategory(category);
    setView('learning');
  };

  const handleStartQuickClass = (category?: IcfesCategory) => {
    if (category && AREA_QUICK_LESSONS[category]) {
      setQuickClassLesson(AREA_QUICK_LESSONS[category]);
      setQuickClassArea(AREA_NAME_MAP[category] || 'Matemáticas');
    } else {
      // Random area for variety
      const areas = Object.keys(AREA_QUICK_LESSONS);
      const randomArea = areas[Math.floor(Math.random() * areas.length)];
      setQuickClassLesson(AREA_QUICK_LESSONS[randomArea]);
      setQuickClassArea(AREA_NAME_MAP[randomArea] || 'Matemáticas');
    }
    setView('quickclass');
  };

  // ─── Render active view ───
  const renderView = () => {
    switch (view) {
      case 'landing':
        return (
          <ICFESLanding 
            onStart={() => externalLogin ? externalLogin('STUDENT') : null}
            onLogin={() => externalLogin ? externalLogin('STUDENT') : null}
          />
        );

      case 'diagnostic':
        return (
          <ICFESDiagnostic 
            userName={userName}
            onComplete={handleDiagnosticComplete}
            onBack={() => {
              // If diagnostic incomplete, show a gentle reminder but allow pause
              if (!hasDiagnostic) {
                // Stay on diagnostic — they can still pause internally
                setView('diagnostic');
              } else {
                setView('dashboard');
              }
            }}
          />
        );

      case 'dashboard':
        return (
          <ICFESDashboardNew
            userName={userName}
            onStartSimulation={handleStartSimulation}
            onStartLearning={handleStartLearning}
            onStartDiagnostic={() => setView('diagnostic')}
            onViewProgress={() => setView('learning')}
            onStartQuickClass={handleStartQuickClass}
            onStartReview={() => setView('review')}
            hasDiagnostic={hasDiagnostic}
          />
        );

      case 'review':
        return (
          <ReviewMode
            onBack={() => setView('dashboard')}
            onComplete={() => setView('dashboard')}
          />
        );

      case 'simulator':
        return (
          <ICFESSimulator
            mode={simMode}
            category={simCategory}
            onExit={() => setView('dashboard')}
            onComplete={handleSimulationComplete}
          />
        );

      case 'results':
        return simResults ? (
          <ICFESResultsNew
            results={simResults}
            onRetry={() => handleStartSimulation(simMode, simCategory)}
            onHome={() => setView('dashboard')}
          />
        ) : null;

      case 'learning':
        return (
          <ICFESLearningPath
            onBack={() => setView('dashboard')}
          />
        );

      case 'quickclass':
        return (
          <SocraticClassroom
            lesson={quickClassLesson}
            gradeName="ICFES"
            areaName={quickClassArea}
            onBack={() => setView('dashboard')}
            onComplete={(score) => {
              // Update progress
              const existing = JSON.parse(localStorage.getItem('nova_icfes_progress') || '{}');
              existing.totalCapsules = (existing.totalCapsules || 0) + 1;
              existing.weeklyCompleted = (existing.weeklyCompleted || 0) + 1;
              localStorage.setItem('nova_icfes_progress', JSON.stringify(existing));
              setView('dashboard');
            }}
            quickMode={true}
          />
        );

      case 'profile':
        return (
          <div className="min-h-screen bg-[#FAFAF8] py-8 px-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div className="max-w-lg mx-auto">
              <div className="nova-card p-6 text-center mb-6">
                <div className="w-20 h-20 bg-[#1B4D3E] rounded-full flex items-center justify-center text-3xl text-white mx-auto mb-4">
                  {userName.charAt(0).toUpperCase() || '👤'}
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">{userName || 'Estudiante'}</h2>
                <p className="text-sm text-slate-500">Preparándose para el ICFES</p>
                
                {/* Student Profile Memory */}
                {localStorage.getItem('icfes_global_profile') && (
                  <div className="mt-4 bg-violet-50 border border-violet-100 rounded-xl p-3 text-left">
                    <p className="text-xs font-bold text-violet-700 mb-1">🧠 Lo que Lina sabe de ti:</p>
                    <p className="text-xs text-violet-600">{localStorage.getItem('icfes_global_profile')}</p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => setView('generator')}
                  className="nova-card p-4 w-full text-left hover:bg-indigo-50 transition-colors border-indigo-100"
                >
                  <span className="text-sm font-bold text-indigo-600 flex items-center gap-2">⚡ Creador de Preguntas IA (Admin)</span>
                  <p className="text-xs text-slate-500 mt-1">Generar preguntas tipo ICFES usando Gemini 2.0 Flash.</p>
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('nova_icfes_progress');
                    localStorage.removeItem('nova_icfes_diagnostic');
                    localStorage.removeItem('nova_icfes_user');
                    localStorage.removeItem('icfes_global_profile');
                    setHasDiagnostic(false);
                    setView('dashboard');
                  }}
                  className="nova-card p-4 w-full text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-amber-600">🔄 Reiniciar progreso</span>
                  <p className="text-xs text-slate-500 mt-1">Volver a hacer el diagnóstico y empezar de cero.</p>
                </button>
                <button 
                  onClick={() => {
                    setIsAuthenticated(false);
                    setView('landing');
                    if (onLogout) onLogout();
                  }}
                  className="nova-card p-4 w-full text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-red-600">🚪 Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'generator':
        return (
          <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div className="p-4 bg-white border-b sticky top-0 z-10 flex items-center gap-4">
              <button onClick={() => setView('profile')} className="p-2 bg-slate-100 rounded-lg">Volver</button>
              <h1 className="font-bold">Panel Admin</h1>
            </div>
            <div className="p-4">
              <AIQuestionGenerator />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Don't show tab bar on landing, diagnostic, simulator, or quickclass
  const showTabBar = isAuthenticated && !['landing', 'login', 'diagnostic', 'simulator', 'quickclass'].includes(view);

  return (
    <div className="relative">
      {renderView()}

      {/* ─── Bottom Tab Bar ─── */}
      {showTabBar && (
        <nav className="nova-tab-bar" id="bottom-tabs">
          <button 
            onClick={() => setView('dashboard')} 
            className={`nova-tab-item ${view === 'dashboard' ? 'active' : ''}`}
            id="tab-home"
          >
            <Home className="w-6 h-6" />
            <span>Inicio</span>
          </button>
          <button 
            onClick={() => handleStartQuickClass()} 
            className={`nova-tab-item ${view === 'quickclass' ? 'active' : ''}`}
            id="tab-quickclass"
          >
            <Zap className="w-6 h-6" />
            <span>Clase IA</span>
          </button>
          <button 
            onClick={() => handleStartLearning()} 
            className={`nova-tab-item ${view === 'learning' ? 'active' : ''}`}
            id="tab-learn"
          >
            <BookOpen className="w-6 h-6" />
            <span>Aprender</span>
          </button>
          <button 
            onClick={() => handleStartSimulation('quick')} 
            className={`nova-tab-item ${view === 'simulator' || view === 'results' ? 'active' : ''}`}
            id="tab-practice"
          >
            <Target className="w-6 h-6" />
            <span>Simulacros</span>
          </button>
          <button 
            onClick={() => setView('profile')} 
            className={`nova-tab-item ${view === 'profile' ? 'active' : ''}`}
            id="tab-profile"
          >
            <User className="w-6 h-6" />
            <span>Perfil</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default ICFESApp;
