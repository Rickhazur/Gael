
import React from 'react';
import { LayoutDashboard, Calendar, BookOpen, Bot, BarChart3, GraduationCap, UserCheck, HeartHandshake, CircleHelp, Users, Trophy, Brain, Map, Layers, Compass, ShoppingBag, LogOut, Settings as SettingsIcon, EyeOff, Receipt, FolderOpen, WifiOff, Zap, Cloud, Activity, Globe, PenTool, Search, Rocket, Swords, UserCircle, Sparkles, Clapperboard, Mic, CreditCard } from 'lucide-react';
import { ViewState, Language, UserLevel } from '../types';
import { AvatarDisplay } from './Gamification/AvatarDisplay';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onStartTour?: () => void;
  onLogout?: () => void;
  userName?: string;
  userRole?: string;
  isSimulationMode?: boolean;
  onExitSimulation?: () => void;
  restrictedMode?: boolean;
  studentMenuConfig?: string[];
  isMock?: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  userLevel?: UserLevel;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onStartTour,
  onLogout,
  userName = "Usuario",
  userRole,
  isSimulationMode = false,
  onExitSimulation,
  restrictedMode = false,
  studentMenuConfig,
  isMock = false,
  language,
  setLanguage,
  userLevel = 'primary'
}): React.ReactElement => {

  const t = {
    es: {
      dashboard: 'Mi Base',
      curriculum: 'Misiones',
      flashcards: 'Tarjetas Mágicas',
      social: 'Arena Nova',
      rewards: 'Tienda Nova',
      progress: userRole === 'ADMIN' ? 'Panel Profe' : 'Salón de la Fama',
      consultant: 'Mi Amigo Robot',
      metrics: 'Mis Poderes',
      settings: 'Mi Perfil',
      tour: 'Ayuda',
      logout: 'Salir',
      exitSim: 'Salir Broma',
      connection: 'CONECTADO',
      remedial: 'Entrenamiento Especial',
      mathTutor: 'Centro de Matemáticas',
      research: 'Centro de Investigación',
      buddyLearn: 'The Nova Times 📰',
      parentDashboard: 'Panel de Padres',
      notebooks: 'Mis Cuadernos',
      mathLab: 'Lab de Bloques', // NEW
      spark: 'Llamada de Rachelle 📞',
      wordProblems: 'Problemas Matemáticos',
      wordProblemsDemo: 'Demo Problemas',
      novaBank: 'Banco Nova 🏦',
    },
    en: {
      dashboard: 'My Base',
      curriculum: 'Missions',
      flashcards: 'Magic Cards',
      social: 'Game Arena',
      rewards: 'Nova Store',
      progress: userRole === 'ADMIN' ? 'Teacher Panel' : 'Hall of Fame',
      consultant: 'Robot Friend',
      metrics: 'My Powers',
      settings: 'My Profile',
      tour: 'Help',
      logout: 'Exit',
      exitSim: 'Exit Prank',
      connection: 'ONLINE',
      remedial: 'Special Training',
      mathTutor: 'Math Center',
      research: 'Research Center',
      buddyLearn: 'The Nova Times 📰',
      parentDashboard: 'Parent Panel',
      notebooks: 'My Notebooks',
      mathLab: 'Block Lab', // NEW
      spark: 'Call with Rachelle 📞',
      wordProblems: 'Word Problems',
      wordProblemsDemo: 'Word Problems Demo',
      novaBank: 'Nova Bank 🏦',
    }
  };

  const labels = t[language as keyof typeof t];

  // Simplified Nav Items for Kids
  const allNavItems = [
    { id: ViewState.DASHBOARD, label: labels.dashboard, icon: HeartHandshake }, // Need to change icons maybe, stick to existing checks
    { id: ViewState.TASK_CONTROL, label: labels.curriculum, icon: Rocket }, // Changed from CURRICULUM/Map to TASK_CONTROL/Rocket
    // { id: ViewState.AI_CONSULTANT, label: labels.consultant, icon: Bot }, // Removed as per request (redundant)
    { id: ViewState.ARENA, label: labels.social, icon: Swords },
    { id: ViewState.REWARDS, label: labels.rewards, icon: ShoppingBag },
    { id: ViewState.WORD_PROBLEMS, label: labels.mathTutor, icon: Brain }, // Replaces old MATH_TUTOR
    { id: ViewState.RESEARCH_CENTER, label: labels.research, icon: Search },
    { id: ViewState.FLASHCARDS, label: labels.flashcards, icon: Layers },
    { id: ViewState.BUDDY_LEARN, label: labels.buddyLearn, icon: Globe },
    { id: ViewState.NOTEBOOK_LIBRARY, label: labels.notebooks, icon: BookOpen },
    { id: ViewState.NOVA_BANK, label: (labels as any).novaBank, icon: CreditCard },
    { id: ViewState.PROGRESS, label: labels.progress, icon: UserCheck },
  ];

  if (userRole === 'ADMIN') {
    allNavItems.push({ id: ViewState.LAB_DEV, label: 'Lab Dev', icon: Zap });
  }

  // Removing Admin-specific extra links for now to simplify, or re-add if needed.
  // Assuming Admin uses same view but sees more data in components.

  let navItems = allNavItems;

  // Active States - Super Colorful
  const itemActive = 'bg-kid-yellow text-black border-2 border-black shadow-comic transform -translate-y-1 font-black';
  const itemInactive = 'text-slate-500 hover:bg-white/50 hover:text-black hover:border-2 hover:border-black/10 transition-all font-bold';

  if (restrictedMode) {
    navItems = allNavItems.filter(item =>
      item.id === ViewState.CURRICULUM || // Keep checking for old viewstate just in case, but usually we filter by ID
      item.id === ViewState.TASK_CONTROL ||
      item.id === ViewState.REWARDS ||
      item.id === ViewState.PROGRESS
    );
  } else if (userRole === 'STUDENT' && studentMenuConfig && studentMenuConfig.length > 0) {
    navItems = allNavItems.filter(item => studentMenuConfig.includes(item.id));
  } else if (userRole === 'PARENT') {
    // Only parents get access to Parent Dashboard
    navItems = [
      { id: ViewState.PARENT_DASHBOARD, label: (labels as any).parentDashboard, icon: HeartHandshake },
      { id: ViewState.PROGRESS, label: labels.progress, icon: UserCheck },
      { id: ViewState.TASK_CONTROL, label: labels.curriculum, icon: Rocket }
    ];
  }

  const handleHomeClick = (): void => {
    if (restrictedMode) return;
    onViewChange(ViewState.DASHBOARD);
  };

  return (
    <aside className={`w-64 bg-white border-r-4 border-black h-screen sticky top-0 flex flex-col z-10 hidden md:flex font-sans transition-colors duration-300 shadow-comic-lg shrink-0`}>
      <div
        className={`p-6 flex items-center space-x-3 border-b-4 border-black/10 ${restrictedMode ? 'cursor-default' : 'cursor-pointer hover:bg-yellow-50'} transition-colors shrink-0`}
        onClick={handleHomeClick}
        title={restrictedMode ? labels.remedial : "Nova Kids"}
      >
        <div className={`p-2 rounded-2xl border-2 border-black shadow-comic ${restrictedMode ? 'bg-kid-pink' : 'bg-kid-blue'}`}>
          <Brain className={`text-white w-8 h-8`} />
        </div>
        <div>
          <h1 className="font-black text-xl text-black leading-tight tracking-tight">NOVA <span className="text-kid-pink">KIDS</span><br />
            <span className={`text-[10px] uppercase tracking-widest font-bold ${restrictedMode ? 'text-rose-500' : 'text-kid-purple'}`}>
              {restrictedMode ? labels.remedial : 'SUPER LEARNING'}
            </span>
          </h1>
        </div>
      </div>

      <nav
        className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar"
        role="navigation"
        aria-label={language === 'es' ? 'Navegación principal' : 'Main navigation'}
      >
        {navItems.map((item) => {
          const isActive = currentView === item.id || (item.id === ViewState.BUDDY_LEARN && (currentView === ViewState.LANGUAGE_CENTER || currentView === ViewState.SPANISH_TUTOR));
          const handleClick = () => {
            // Redirect BUDDY_LEARN to LANGUAGE_CENTER hub
            if (item.id === ViewState.BUDDY_LEARN) {
              onViewChange(ViewState.LANGUAGE_CENTER);
            } else {
              onViewChange(item.id);
            }
          };
          return (
            <button
              key={item.id}
              type="button"
              onClick={handleClick}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl group mb-2 ${isActive
                ? itemActive
                : itemInactive
                }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-black' : 'text-slate-400 group-hover:text-black'} ${item.id === ViewState.ARENA ? 'animate-pulse text-rose-500' : ''}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}

        <div className="my-4 border-t-2 border-dashed border-slate-200"></div>



        {/* Removed redundant Settings/Profile button */}

      </nav>

      <div className="p-4 border-t-4 border-black/10 space-y-3 bg-slate-50 shrink-0">

        {/* Language Toggle */}
        <div className="flex bg-white rounded-xl border-2 border-black p-1 shadow-comic">
          <button
            onClick={() => setLanguage('es')}
            className={`flex-1 flex items-center justify-center gap-1 text-xs font-black py-2 rounded-lg transition-colors ${language === 'es' ? 'bg-kid-yellow text-black border-2 border-black' : 'text-slate-400 hover:text-black'}`}
          >
            ES
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 flex items-center justify-center gap-1 text-xs font-black py-2 rounded-lg transition-colors ${language === 'en' ? 'bg-kid-yellow text-black border-2 border-black' : 'text-slate-400 hover:text-black'}`}
          >
            EN
          </button>
        </div>

        <button
          onClick={isSimulationMode && onExitSimulation ? onExitSimulation : onLogout}
          className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group font-black shadow-comic mb-2 border-2 border-black ${isSimulationMode
            ? 'text-black bg-orange-400 hover:bg-orange-300'
            : 'text-white bg-kid-pink hover:bg-pink-400'
            }`}
        >
          {isSimulationMode ? <EyeOff className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
          <span className="text-xs tracking-wide uppercase">{isSimulationMode ? labels.exitSim : labels.logout}</span>
        </button>

        <div className="p-3 rounded-2xl border-2 border-black shadow-comic flex items-center gap-4 bg-white hover:scale-[1.02] transition-transform cursor-default group">
          <div className="w-12 h-12 flex items-center justify-center relative">
            {/* Padre/acudiente: icono de perfil, no el avatar del hijo */}
            {userRole === 'PARENT' ? (
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-200" aria-hidden>
                <UserCircle className="w-8 h-8 text-indigo-600" />
              </div>
            ) : (
              <AvatarDisplay size="sm" showBackground={true} isCurrentUser={userRole === 'STUDENT'} showName={userRole === 'STUDENT' && typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') !== 'true' && userName !== 'luna'} />
            )}
          </div>
          <div className="flex flex-col overflow-hidden py-1">
            <span className="text-sm font-black truncate w-28 text-slate-800 leading-tight" title={userName}>{userName}</span>
            <span className="text-[9px] uppercase tracking-widest font-black text-indigo-500 mt-0.5">
              {userRole === 'ADMIN' ? 'Profe Nova' : userRole === 'PARENT' ? 'Guardian' : 'Héroe Nova'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
