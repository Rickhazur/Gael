import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useResearchState } from '../../hooks/useResearchState';
import { GradeSelector } from './GradeSelector';
import { LanguageToggle } from './LanguageToggle';
import { SaveStatusIndicator } from './SaveStatus';
import { ProgressSteps } from './ProgressSteps';
import { TutorPanel } from './TutorPanel';
import { TextPasteArea } from './TextPasteArea';
import { ReportEditor } from './ReportEditor';
import { ReportCompleteness } from './ReportCompleteness';
import { ReportReview } from './ReportReview';
import { CitationHelper } from './CitationHelper';
import { WritingFeedbackPopup, generateWritingFeedback, type WritingFeedback } from './WritingFeedbackPopup';
import { BookOpen, Sparkles, Lightbulb, FileText } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import tutorAvatar from '../../assets/tutor-avatar.png';
import type { SourceInfo } from '../../types/research';
import { ResearchBrowser } from './ResearchBrowser';
import { AIResearchAssistant } from './AIResearchAssistant';
import { ReportSubmissionDialog } from './ReportSubmissionDialog';
import { supabase, completeParentMission } from '../../../../../services/supabase';
import { useGamification } from '../../../../../context/GamificationContext';
import { TemplateSelector } from './TemplateSelector';
import { ModelGallery } from '../../../../3D/ModelGallery';
import { Search } from 'lucide-react';


export function ResearchCenter({ initialGrade = 3 }: { initialGrade?: number }) {
  const {
    state,
    setSourceText,
    setParaphrasedText,
    analyzeSourceText,
    setGrade,
    setLanguage,
    saveNow,
    addSource,
    removeSource,
    setTemplate, // Added this
    checkStudentAnalysis,
    startPractice,
  } = useResearchState(initialGrade);

  const [currentFeedback, setCurrentFeedback] = useState<WritingFeedback | null>(null);
  const lastFeedbackId = useRef<string>('');
  const feedbackCooldown = useRef<boolean>(false);

  const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
  const [searchContext, setSearchContext] = useState<string>(isDemoMode ? 'El Ciclo del Agua' : ''); // Track what user is researching
  const [reportTitle, setReportTitle] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('Estudiante');
  const [activeMission, setActiveMission] = useState<any>(null);
  const { addCoins, addXP } = useGamification();

  // Fetch student name
  useEffect(() => {
    const fetchStudentName = async () => {
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (data?.name) {
        setStudentName(data.name);
      }
    };

    fetchStudentName();
  }, []);

  // Generate writing feedback as user types
  useEffect(() => {
    if (feedbackCooldown.current) return;

    const feedback = generateWritingFeedback(
      state.paraphrasedText,
      state.grade,
      state.language,
      state.sourceText
    );

    if (feedback && feedback.id !== lastFeedbackId.current) {
      lastFeedbackId.current = feedback.id;
      setCurrentFeedback(feedback);
      feedbackCooldown.current = true;
      const isCopyWarning = feedback.id === 'copy-warning';
      setTimeout(() => {
        feedbackCooldown.current = false;
      }, isCopyWarning ? 3000 : 5000);
    }
  }, [state.paraphrasedText, state.grade, state.language, state.sourceText]);

  const handleDismissFeedback = useCallback(() => {
    setCurrentFeedback(null);
  }, []);

  const handleStarterClick = (starter: string) => {
    // Insert starter text into the report
    const currentText = state.paraphrasedText;
    const newText = currentText
      ? `${currentText}\n\n${starter} `
      : `${starter} `;
    setParaphrasedText(newText);

    // Also trigger the global insert function if available
    if ((window as any).__insertReportText) {
      (window as any).__insertReportText(starter + ' ');
    }
  };

  // Check for Mission on mount
  useEffect(() => {
    const missionJson = localStorage.getItem('nova_mission_params');
    if (missionJson) {
      try {
        const mission = JSON.parse(missionJson);
        setActiveMission(mission);
        toast({
          title: state.language === 'es' ? '🎯 Misión Activa' : '🎯 Active Mission',
          description: mission.title,
        });
      } catch (e) { console.error("Error parsing mission", e); }
    }
  }, [state.language]);

  const handleInsertCitation = (citation: string) => {
    const currentText = state.paraphrasedText;
    const newText = currentText ? `${currentText} ${citation}` : citation;
    setParaphrasedText(newText);

    if ((window as any).__insertReportText) {
      (window as any).__insertReportText(citation);
    }
  };

  const handleSubmitReport = () => {
    saveNow();

    // Mission Completion Logic
    if (activeMission && activeMission.id) {
      try {
        completeParentMission(activeMission.id);

        // NEW: Automatic Reward
        const coins = activeMission.reward_coins || 100;
        const xp = activeMission.reward_xp || 200;
        addCoins(coins, state.language === 'es' ? `¡Investigación completada: ${activeMission.title}!` : `Research completed: ${activeMission.title}!`);
        addXP(xp);

        localStorage.removeItem('nova_mission_params');
        setActiveMission(null);
        toast({
          title: state.language === 'es' ? '¡Misión cumplida y recompensa otorgada!' : 'Mission accomplished and reward granted!',
          description: state.language === 'es'
            ? `Has ganado ${coins} monedas por tu investigación.`
            : `You earned ${coins} coins for your research.`,
        });
      } catch (e) {
        console.error("Error completing research mission:", e);
      }
    }

    toast({
      title: state.language === 'es' ? '¡Reporte enviado!' : 'Report submitted!',
      description: state.language === 'es'
        ? 'Tu reporte ha sido guardado. ¡Buen trabajo!'
        : 'Your report has been saved. Great job!',
    });
  };

  // LAB STATION LOGIC
  const [activeStation, setActiveStation] = useState<'mission' | 'library' | 'museum' | 'design' | 'desk'>('mission');
  const [unlockedStations, setUnlockedStations] = useState<string[]>(['mission']);

  const unlockStation = useCallback((stationId: string) => {
    setUnlockedStations(prev => prev.includes(stationId) ? prev : [...prev, stationId]);
  }, []);
  // Skip entrance animation during demo mode
  const [showEntrance, setShowEntrance] = useState(() => !isDemoMode);

  // Entrance Animation Effect (only if not demo mode)
  useEffect(() => {
    if (isDemoMode) {
      setShowEntrance(false);
      return;
    }

    // Spectacular Opening Sound
    const doorSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2847/2847-preview.mp3');
    const scanSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    doorSound.volume = 0.5;
    scanSound.volume = 0.3;

    // Play scan sound immediately
    scanSound.play().catch(e => console.log("Audio play blocked", e));

    // Play with small delay to match the door opening animation (which has 1.5s delay in CSS)
    const soundTimer = setTimeout(() => {
      doorSound.play().catch(e => console.log("Audio play blocked", e));
    }, 1200);

    // Hide entrance animation after 4.5 seconds (Extended for dramatic effect)
    const timer = setTimeout(() => setShowEntrance(false), 4500);
    return () => {
      clearTimeout(timer);
      clearTimeout(soundTimer);
    };
  }, [isDemoMode]);

  const stations = [
    {
      id: 'mission',
      title: { es: 'Centro de Mando', en: 'Mission Control' },
      icon: Sparkles,
      color: 'bg-yellow-500',
      desc: { es: 'Tu Misión', en: 'Your Mission' }
    },
    {
      id: 'library',
      title: { es: 'La Biblioteca', en: 'The Library' },
      icon: BookOpen,
      color: 'bg-cyan-500',
      desc: { es: 'Datos Técnicos', en: 'Tech Data' }
    },
    {
      id: 'museum',
      title: { es: 'Museo 3D', en: '3D Museum' },
      icon: Search,
      color: 'bg-orange-500',
      desc: { es: 'Explora en AR', en: 'AR Explorer' }
    },
    {
      id: 'design',
      title: { es: 'Idea Lab', en: 'Idea Lab' },
      icon: Lightbulb,
      color: 'bg-purple-500',
      desc: { es: 'Presentación', en: 'Canvas' }
    },
    {
      id: 'desk',
      title: { es: 'Escritorio', en: "Writer's Desk" },
      icon: FileText,
      color: 'bg-emerald-500',
      desc: { es: 'Escribe reporte', en: 'Final Report' }
    }
  ];

  /* Old Animation Block Removed */

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-nunito relative selection:bg-cyan-200 selection:text-cyan-900">

      {/* --- CINEMATIC ENTRANCE OVERLAY (Revealing Main Content) --- */}
      {showEntrance && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          {/* VISUAL STYLES FOR ANIMATION */}
          <style>{`
              @keyframes door-slice-top {
                0% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 85%); transform: translateY(0); }
                100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 85%); transform: translateY(-120%); }
              }
              @keyframes door-slice-bottom {
                0% { clip-path: polygon(0 15%, 100% 0, 100% 100%, 0 100%); transform: translateY(0); }
                100% { clip-path: polygon(0 15%, 100% 0, 100% 100%, 0 100%); transform: translateY(120%); }
              }
              @keyframes fade-grid {
                 0% { opacity: 0.3; }
                 80% { opacity: 0.3; }
                 100% { opacity: 0; }
              }
            `}</style>

          {/* Background Grid - Fades out */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(79,70,229,0)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] animate-[pulse_3s_ease-in-out_infinite]"
            style={{ animation: 'fade-grid 3.5s forwards', backgroundColor: '#020617' }}
          />

          {/* TOP DOOR HALF (Dark Cyber Metal) - Slow Open */}
          <div
            className="absolute top-0 left-0 right-0 h-1/2 bg-slate-950 border-b-2 border-fuchsia-500/50 z-20 flex items-end justify-center shadow-[0_10px_60px_rgba(168,85,247,0.5)]"
            style={{ animation: 'door-slice-top 2.5s cubic-bezier(0.6, 0, 0.4, 1) forwards 1.5s' }}
          >
            <div className="w-full h-full bg-[radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.1),transparent_50%)]" />
            <div className="absolute bottom-6 flex flex-col items-center gap-1 animate-pulse">
              <div className="text-fuchsia-400 text-[10px] tracking-[0.8em] font-black uppercase shadow-fuchsia-500/50 drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]">
                SECURE ACCESS
              </div>
            </div>
          </div>

          {/* BOTTOM DOOR HALF - Slow Open */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-slate-950 border-t-2 border-cyan-500/50 z-20 flex items-start justify-center shadow-[0_-10px_60px_rgba(6,182,212,0.5)]"
            style={{ animation: 'door-slice-bottom 2.5s cubic-bezier(0.6, 0, 0.4, 1) forwards 1.5s' }}
          >
            <div className="w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.1),transparent_50%)]" />
            <div className="absolute top-4 flex gap-6 opacity-80">
              <div className="flex flex-col items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-[ping_1.5s_infinite]" /><span className="text-[8px] text-red-500 font-mono">LOCK</span></div>
              <div className="flex flex-col items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-[pulse_1s_infinite]" /><span className="text-[8px] text-cyan-400 font-mono">SYNC</span></div>
            </div>
          </div>

          {/* CENTRAL LOCK / ACCESS PANEL (Disappears quickly to reveal room behind) */}
          <div className="z-30 animate-out fade-out zoom-out duration-700 delay-[1200ms] fill-mode-forwards scale-150 relative">
            <div className="absolute inset-0 border-t-2 border-r-2 border-fuchsia-500 rounded-full animate-[spin_4s_linear_infinite] w-80 h-80 -m-20" />
            <div className="w-48 h-48 bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-indigo-500/30 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.3)]">
              <Sparkles className="w-16 h-16 text-white mb-4 animate-pulse" />
              <div className="font-black text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400">
                IDENTITY
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Blueprint Grid Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Writing Feedback Popup */}
      <WritingFeedbackPopup
        feedback={currentFeedback}
        onDismiss={handleDismissFeedback}
      />

      {/* TOP NAV: The "Lab Map" */}
      <header className="bg-white/80 backdrop-blur-md border-b-4 border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl border-b-4 border-blue-700 shadow-sm flex items-center justify-center">
                <span className="text-2xl">🧪</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight font-fredoka">
                  {state.language === 'es' ? 'Laboratorio de Investigación' : 'Research Laboratory'}
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {state.language === 'es' ? 'Base de Operaciones' : 'Operations Base'}
                </p>
              </div>
            </div>

            {/* Grade & Save Controls */}
            <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-xl border border-slate-200">
              <GradeSelector grade={state.grade} onChange={setGrade} language={state.language} />
              <LanguageToggle language={state.language} onChange={setLanguage} />
              <div className="w-px h-8 bg-slate-300 mx-1" />
              <SaveStatusIndicator status={state.saveStatus} language={state.language} onSave={saveNow} />
            </div>
          </div>

          {/* STATION NAVIGATION (The "Rooms") */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
            {stations.map(station => {
              const isActive = activeStation === station.id;
              // Check if unlocked
              const isUnlocked = unlockedStations.includes(station.id);
              const Icon = station.icon;

              return (
                <button
                  key={station.id}
                  onClick={() => isUnlocked && setActiveStation(station.id as any)}
                  disabled={!isUnlocked}
                  className={`
                                relative group overflow-hidden rounded-xl transition-all duration-300 md:p-3 p-2 text-left border-2
                                ${isActive
                      ? 'bg-white border-blue-500 shadow-[0_8px_0_rgb(59,130,246)] translate-y-0'
                      : isUnlocked
                        ? 'bg-slate-100 border-transparent hover:bg-white hover:border-slate-300 hover:shadow-sm translate-y-2 cursor-pointer'
                        : 'bg-slate-50 border-transparent opacity-50 cursor-not-allowed translate-y-2 grayscale'
                    }
                            `}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110 ${isUnlocked ? station.color : 'bg-slate-400'}`}>
                      {typeof Icon === 'string' ? Icon : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="hidden md:block">
                      <p className={`font-bold text-sm ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                        {station.title[state.language]}
                        {!isUnlocked && <span className="ml-2 text-xs opacity-50">🔒</span>}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        {station.desc[state.language]}
                      </p>
                    </div>
                  </div>
                  {/* Active Indicator Line */}
                  {isActive && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 animate-slide-in-right" />}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area - Shows only ACTIVE STATION */}
      <main className="container mx-auto px-4 py-8 relative z-10">

        {/* ROOM 1: MISSION CONTROL */}
        {activeStation === 'mission' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl p-2 shadow-xl border-4 border-slate-100">
                <AIResearchAssistant
                  language={state.language}
                  currentGrade={state.grade}
                  searchContext={searchContext}
                  onPlanConfirmed={(plan, keywords) => {
                    // Unlock the Library
                    unlockStation('library');

                    // AUTO-REDIRECT: Move to the library Room after audio finishes
                    setTimeout(() => {
                      setActiveStation('library');
                    }, 4500); // Extended delay for Elevator effect

                    // AUTO-SETUP: Pre-fill the library search with the best keyword only
                    if (keywords && keywords.length > 0) {
                      // We use the first keyword (which is the topic name) for the search browser
                      setSearchContext(keywords[0]);

                      toast({
                        title: state.language === 'es' ? '¡Misión Aceptada! 🚀' : 'Mission Accepted! 🚀',
                        description: state.language === 'es'
                          ? `Iniciando búsqueda sobre: ${keywords[0]}`
                          : `Starting search for: ${keywords[0]}`,
                      });
                    }
                  }}
                />
              </div>
              {/* Guiding Button to Next Room */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setActiveStation('library')}
                  disabled={!unlockedStations.includes('library')}
                  className={`
                    group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xl shadow-[0_6px_0_rgb(202,138,4)] transition-all
                    ${unlockedStations.includes('library')
                      ? 'bg-yellow-400 hover:bg-yellow-300 text-yellow-900 active:shadow-none active:translate-y-1.5'
                      : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed grayscale'}
                  `}>
                  {state.language === 'es' ? '¡Tengo una Misión! Ir a Investigar' : 'I have a Mission! Go Research'}
                  <span className="text-2xl group-hover:animate-bounce">👉</span>
                </button>
              </div>

              {/* 3D/AR Model Exploration - ONLY for Grades 4 & 5 */}

            </div>
          </div>
        )}

        {/* ROOM 2: THE LIBRARY */}
        {activeStation === 'library' && (
          <div className="animate-in slide-in-from-right-8 duration-700 ease-out space-y-8">
            <div className="bg-white rounded-3xl shadow-xl border-4 border-slate-100 overflow-hidden">
              <div className="bg-cyan-500 p-4 flex items-center gap-3 text-white">
                <BookOpen className="w-8 h-8" />
                <h2 className="text-xl font-black font-fredoka">{state.language === 'es' ? 'La Biblioteca Digital' : 'The Digital Library'}</h2>
              </div>
              <div className="p-6">
                <ResearchBrowser
                  language={state.language}
                  currentGrade={state.grade}
                  onGradeChange={setGrade}
                  onSearchChange={setSearchContext}
                  initialQuery={searchContext}

                  // Clipboard Integration
                  notes={state.sourceText}
                  onNotesChange={setSourceText}
                  onDataReady={() => {
                    unlockStation('museum');
                    unlockStation('design');
                    unlockStation('desk');
                    toast({
                      title: state.language === 'es' ? '¡Investigación Completada!' : 'Research Completed!',
                      description: state.language === 'es' ? 'Has desbloqueado el Museo 3D y el Laboratorio de Ideas.' : 'You unlocked the 3D Museum and the Idea Lab.',
                    });
                  }}
                />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setActiveStation('museum')}
                disabled={!unlockedStations.includes('museum')}
                className={`
                   group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xl shadow-[0_6px_0_rgb(234,88,12)] transition-all
                   ${unlockedStations.includes('museum')
                    ? 'bg-orange-500 hover:bg-orange-400 text-white active:shadow-none active:translate-y-1.5'
                    : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed grayscale'}
                `}>
                {state.language === 'es' ? '¡Ver en 3D!' : 'See in 3D!'}
                <span className="text-2xl group-hover:rotate-12 transition-transform">🦖</span>
              </button>

              <button
                onClick={() => setActiveStation('design')}
                disabled={!unlockedStations.includes('design')}
                className={`
                   group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xl shadow-[0_6px_0_rgb(8,145,178)] transition-all
                   ${unlockedStations.includes('design')
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-white active:shadow-none active:translate-y-1.5'
                    : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed grayscale'}
                `}>
                {state.language === 'es' ? 'Ir al Laboratorio' : 'Go to Lab'}
                <span className="text-2xl group-hover:rotate-12 transition-transform">🎨</span>
              </button>
            </div>
          </div>
        )}

        {/* ROOM 2.5: MUSEUM (3D Explorer) */}
        {activeStation === 'museum' && (
          <div className="animate-in zoom-in duration-700 ease-out space-y-6">
            {/* Misión clara arriba del título */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <p className="text-orange-700 font-bold text-lg bg-orange-50 border-2 border-orange-200 rounded-2xl px-6 py-4">
                {state.language === 'es'
                  ? 'Elige al menos un modelo 3D que te ayude a entender tu tema. Luego pulsa el botón de abajo para ir al Laboratorio de Ideas.'
                  : 'Choose at least one 3D model that helps you understand your topic. Then press the button below to go to the Idea Lab.'}
              </p>
              <h2 className="text-3xl font-black text-orange-600 font-fredoka">
                {state.language === 'es' ? 'Museo del Descubrimiento' : 'Discovery Museum'}
              </h2>
              <p className="text-slate-500 font-bold">
                {state.language === 'es' ? 'Explora modelos 3D relacionados con tu investigación' : 'Explore 3D models related to your research'}
              </p>
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow-2xl border-4 border-orange-100">
              <ModelGallery
                grade={state.grade}
                language={state.language}
                initialSearchQuery={searchContext}
                onAddIdeaToReport={(idea) => {
                  const line = state.language === 'es' ? '[Museo 3D] ' : '[3D Museum] ';
                  setParaphrasedText(state.paraphrasedText ? `${state.paraphrasedText}\n\n${line}${idea}` : `${line}${idea}`);
                  if (state.language === 'es') {
                    toast({ title: 'Idea añadida', description: 'Se añadió al borrador de tu reporte.' });
                  } else {
                    toast({ title: 'Idea added', description: 'Added to your report draft.' });
                  }
                }}
              />
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setActiveStation('design')}
                className="group flex items-center gap-3 px-10 py-5 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl font-black text-xl shadow-[0_6px_0_rgb(194,65,12)] transition-all active:shadow-none active:translate-y-1.5 ring-4 ring-orange-200"
              >
                {state.language === 'es' ? 'Continuar al Laboratorio' : 'Continue to Lab'}
                <span className="text-2xl">⚡</span>
              </button>
              <span className="text-slate-500 text-sm font-medium">
                {state.language === 'es' ? 'Ir al Laboratorio de Ideas' : 'Go to Idea Lab'}
              </span>
            </div>
          </div>
        )}

        {/* ROOM 3: IDEA LAB (Template Selector) */}
        {activeStation === 'design' && (
          <div className="animate-in zoom-in duration-700 ease-out max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-purple-600 font-fredoka">
                {state.language === 'es' ? 'Laboratorio de Ideas' : 'Idea Lab'}
              </h2>
              <p className="text-slate-500 font-bold">
                {state.language === 'es' ? '¿Cómo quieres presentar tu descubrimiento?' : 'How do you want to present your discovery?'}
              </p>
            </div>

            <TemplateSelector
              selectedTemplate={state.selectedTemplate}
              onSelect={(t) => {
                setTemplate(t);
                unlockStation('desk');
              }}
              language={state.language}
            />

            <div className="flex justify-center mt-8">
              <button
                onClick={() => setActiveStation('desk')}
                disabled={!unlockedStations.includes('desk')}
                className={`
                  group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xl shadow-[0_6px_0_rgb(147,51,234)] transition-all
                  ${unlockedStations.includes('desk')
                    ? 'bg-purple-500 hover:bg-purple-400 text-white active:shadow-none active:translate-y-1.5'
                    : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed grayscale'}
                `}>
                {state.language === 'es' ? '¡Todo listo! A Escribir' : 'All Set! Let\'s Write'}
                <span className="text-2xl group-hover:animate-pulse">✍️</span>
              </button>
            </div>
          </div>
        )}

        {/* ROOM 4: WRITER'S DESK */}
        {activeStation === 'desk' && (
          <div className="animate-in slide-in-from-bottom-8 duration-700 ease-out grid lg:grid-cols-2 gap-8">
            {/* Left: Source Material */}
            <div className="space-y-4">
              <div className="bg-emerald-100 border-2 border-emerald-300 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-emerald-800 font-bold mb-2">
                  <span>📄</span>
                  {state.language === 'es' ? '1. Pega tu Investigación Aquí' : '1. Paste your Research Here'}
                </div>
                <TextPasteArea
                  value={state.sourceText}
                  onChange={setSourceText}
                  onAnalyze={analyzeSourceText}
                  language={state.language}
                  grade={state.grade}
                  onGradeChange={setGrade}
                  disabled={state.isAnalyzing}
                  searchContext={searchContext}
                />
              </div>
              {/* Show Editor if Analysis Done */}
              {state.analysis && (
                <div className="bg-white rounded-2xl shadow-xl border-4 border-emerald-100 overflow-hidden">
                  <div className="bg-emerald-500 text-white p-3 font-bold flex items-center gap-2">
                    <span>✍️</span> {state.language === 'es' ? 'Tu Reporte' : 'Your Report'}
                  </div>
                  <ReportEditor
                    value={state.paraphrasedText}
                    onChange={setParaphrasedText}
                    language={state.language}
                    analysis={state.analysis}
                    disabled={state.isAnalyzing}
                    grade={state.grade}
                    template={state.selectedTemplate}
                    sourceText={state.sourceText}
                  />
                </div>
              )}
            </div>

            {/* Right: Tutor & Help */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-1 shadow-lg border-2 border-slate-100">
                <TutorPanel
                  messages={state.tutorMessages}
                  isAnalyzing={state.isAnalyzing}
                  language={state.language}
                  onStarterClick={handleStarterClick}
                  grade={state.grade}
                  searchContext={searchContext}
                  tutorPhase={state.tutorPhase}
                  onCheckAnalysis={checkStudentAnalysis}
                  onStartPractice={startPractice}
                />
              </div>

              {state.analysis && (
                <>
                  <ReportCompleteness
                    paraphrasedText={state.paraphrasedText}
                    analysis={state.analysis}
                    grade={state.grade}
                    language={state.language}
                  />
                  <ReportReview
                    paraphrasedText={state.paraphrasedText}
                    sourceText={state.sourceText}
                    analysis={state.analysis}
                    grade={state.grade}
                    language={state.language}
                    onRequestFeedback={handleSubmitReport}
                    reportTitle={reportTitle || searchContext}
                    studentName={studentName}
                    sources={state.sources}
                  />
                </>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-sm text-muted-foreground">
        <p>
          {state.language === 'es'
            ? '🌟 ¡Recuerda usar siempre tus propias palabras!'
            : '🌟 Remember to always use your own words!'
          }
        </p>
      </footer>

      {/* MOBILE EXIT BUTTON (Floating) */}
      <button
        onClick={() => window.location.reload()}
        className="lg:hidden fixed bottom-6 right-6 z-[60] w-12 h-12 bg-red-500 rounded-full shadow-lg border-2 border-white flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Salir"
      >
        <span className="text-2xl">❌</span>
      </button>

    </div >
  );
}
