import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewState, Language } from '@/types';
import { Globe, Languages, Globe2, Gamepad2, ArrowLeft, Clock, UtensilsCrossed, Ruler, Sparkles, Star as StarIcon, Zap, Layout, BookOpen, Briefcase, CreditCard } from 'lucide-react';


import { useNovaSound } from '@/hooks/useNovaSound';
import { BreakingNewsOverlay } from '@/components/tutor_mod/BreakingNewsOverlay';
import NanoBananaCity from './NanoBananaCity';
import AdventureRadio from './AdventureRadio';
import NeonDiner from './NeonDiner';
import CityInspector from './CityInspector';
import TimeMachine from './TimeMachine';
import SentenceBuilder from './SentenceBuilder';
import LanguageChatbot from './LanguageChatbot';
import StoryLegend from './StoryLegend';
import NovaBank from './NovaBank';

// Helper for Missing Icon
const Building2 = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" /></svg>
);

interface LanguageCenterHubProps {
  onNavigate: (view: ViewState) => void;
  language: Language;
}

export const LanguageCenterHub: React.FC<LanguageCenterHubProps> = ({ onNavigate, language }) => {
  const { playHover, playClick } = useNovaSound();
  const [entrancePhase, setEntrancePhase] = useState<0 | 1 | 2>(() => {
    if (typeof window !== 'undefined') {
      return window.sessionStorage.getItem('nova_intro_played') === 'true' ? 2 : 0;
    }
    return 0;
  });
  const [showEnglishOptions, setShowEnglishOptions] = useState(false);
  const [showNanoBananaCity, setShowNanoBananaCity] = useState(false);
  const [showAdventureRadio, setShowAdventureRadio] = useState(false);
  const [showNeonDiner, setShowNeonDiner] = useState(false);
  const [showCityInspector, setShowCityInspector] = useState(false);
  const [showTimeMachine, setShowTimeMachine] = useState(false);
  const [showSentenceBuilder, setShowSentenceBuilder] = useState(false);
  const [showLanguageChatbot, setShowLanguageChatbot] = useState(false);
  const [showStoryLegend, setShowStoryLegend] = useState(false);
  const [showNovaBank, setShowNovaBank] = useState(false);

  // Entrance Animation Timer Sequence
  useEffect(() => {
    if (entrancePhase === 2) return;
    // Increased to 8000ms to match the new 8s cinematic zoom
    const timer1 = setTimeout(() => setEntrancePhase(1), 8000);
    return () => clearTimeout(timer1);
  }, [entrancePhase]);

  const handleIntroComplete = () => {
    setEntrancePhase(2);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('nova_intro_played', 'true');
    }
  };

  const handleSelectLanguage = (targetView: ViewState) => {
    playClick();
    if (targetView === ViewState.BUDDY_LEARN) {
      setShowEnglishOptions(true);
    } else {
      onNavigate(targetView);
    }
  };

  const handleEnglishOption = (targetView: ViewState) => {
    playClick();
    if (targetView === ViewState.NANO_BANANA_CITY) {
      setShowNanoBananaCity(true);
    } else if (targetView === ViewState.ADVENTURE_RADIO) {
      setShowAdventureRadio(true);
    } else if (targetView === ViewState.NEON_DINER) {
      setShowNeonDiner(true);
    } else if (targetView === ViewState.CITY_INSPECTOR) {
      setShowCityInspector(true);
    } else if (targetView === ViewState.TIME_MACHINE) {
      setShowTimeMachine(true);
    } else if (targetView === ViewState.SENTENCE_BUILDER) {
      setShowSentenceBuilder(true);
    } else if (targetView === ViewState.BUDDY_LEARN) {
      setShowLanguageChatbot(true);
    } else if (targetView === ViewState.STORY_TELLER) {
      setShowStoryLegend(true);
    } else if (targetView === ViewState.NOVA_BANK) {
      setShowNovaBank(true);
    } else {
      onNavigate(targetView);
    }
  };

  const handleBackToLanguages = () => {
    playClick();
    setShowEnglishOptions(false);
  };

  const handleBackToEnglishOptions = () => {
    playClick();
    setShowNanoBananaCity(false);
    setShowAdventureRadio(false);
    setShowNeonDiner(false);
    setShowCityInspector(false);
    setShowTimeMachine(false);
    setShowSentenceBuilder(false);
    setShowLanguageChatbot(false);
    setShowStoryLegend(false);
    setShowNovaBank(false);
  };

  const isAnyGameActive = showNanoBananaCity || showAdventureRadio || showNeonDiner ||
    showCityInspector || showTimeMachine || showSentenceBuilder ||
    showLanguageChatbot || showStoryLegend || showNovaBank;

  const isSpanish = language === 'es';

  return (
    <div className="relative w-full min-h-screen bg-[#f8faff] flex flex-col items-center p-4 overflow-y-auto font-sans text-slate-900">

      {/* VIBRANT LIGHT BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f7ff] via-white to-[#f0f7ff]" />

        {/* Dynamic Light Orbs */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1], x: [0, 100, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-[800px] h-[800px] bg-blue-400/10 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], x: [0, -100, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute -bottom-20 -right-20 w-[800px] h-[800px] bg-purple-400/10 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-cyan-400/5 blur-[200px] rounded-full"
        />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      </div>

      <AnimatePresence>
        {entrancePhase !== 2 && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-white"
            exit={{ opacity: 0, transition: { duration: 1 } }}
          >
            <style>{`
                @keyframes neon-flicker {
                  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; filter: brightness(1) drop-shadow(0 0 10px rgba(34, 211, 238, 0.8)); }
                  20%, 22%, 24%, 55% { opacity: 0.4; filter: brightness(0.5); }
                }
                @keyframes zoom-into-world {
                  0% { transform: scale(0.3) translateY(30%); opacity: 0; }
                  15% { opacity: 1; }
                  100% { transform: scale(5) translateY(45%); opacity: 1; }
                }
              `}</style>

            {entrancePhase === 0 && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-end w-full h-full"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e293b]" />

                {/* STARS/DATA PARTICLES - MORE COLORFUL */}
                <div className="absolute inset-0 opacity-40">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                        y: [-200, 200],
                        filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)']
                      }}
                      transition={{
                        duration: Math.random() * 5 + 3,
                        repeat: Infinity,
                        delay: Math.random() * 5
                      }}
                      className={`absolute w-[2px] h-[2px] rounded-full ${i % 3 === 0 ? 'bg-cyan-400' : i % 3 === 1 ? 'bg-purple-400' : 'bg-pink-400'}`}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`
                      }}
                    />
                  ))}
                </div>

                <div className="relative flex flex-col items-center origin-bottom animate-[zoom-into-world_8s_ease-in-out_forwards]">
                  {/* FLOATING ACADEMY ICON - PREMIUM REWAMP */}
                  <motion.div
                    animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-72 h-72 rounded-[4.5rem] bg-white border-[12px] border-cyan-400 shadow-[0_40px_200px_rgba(34,211,238,0.7)] relative flex items-center justify-center mb-[-90px] z-20 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-indigo-800 to-purple-900" />
                    <Languages className="w-40 h-40 text-white relative z-10 drop-shadow-[0_0_25px_rgba(255,255,255,0.9)]" />

                    {/* Animated Shine */}
                    <motion.div
                      animate={{ x: [-400, 400] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                    />

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.7)_0%,_transparent_75%)]" />
                    <div className="absolute inset-6 border-2 border-white/20 rounded-[3.5rem]" />
                  </motion.div>

                  {/* FUTURISTIC BUILDING - VIBRANT REWAMP */}
                  <div className="w-[800px] h-[1400px] bg-[#020617] relative shadow-[0_0_400px_rgba(59,130,246,0.5)] flex flex-col items-center pt-56 overflow-hidden border-t-[12px] border-cyan-400/80 rounded-t-[5rem]">
                    {/* COLORFUL NEON SIGN */}
                    <div className="absolute top-10 flex flex-col items-center gap-2 animate-[neon-flicker_4s_infinite] pr-4">
                      <span className="text-xl font-black text-cyan-300 tracking-[0.8em] uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">CENTRO DE</span>
                      <div className="px-10 py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 rounded-full shadow-[0_0_40px_rgba(236,72,153,0.6)] border-2 border-white/20">
                        <span className="text-4xl font-black text-white tracking-[0.2em] drop-shadow-md">IDIOMAS</span>
                      </div>
                    </div>

                    {/* Lateral Neon Strips */}
                    <div className="absolute top-0 left-0 w-6 h-full bg-gradient-to-b from-cyan-400 via-purple-600 to-transparent shadow-[15px_0_40px_rgba(34,211,238,0.3)]" />
                    <div className="absolute top-0 right-0 w-6 h-full bg-gradient-to-b from-cyan-400 via-purple-600 to-transparent shadow-[-15px_0_40px_rgba(34,211,238,0.3)]" />

                    {/* Matrix Windows with Colors */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.2) 2px, transparent 2px), linear-gradient(90deg, rgba(34, 211, 238, 0.2) 2px, transparent 2px)',
                      backgroundSize: '50px 80px'
                    }} />

                    {/* Random Glowing Colorful Windows */}
                    {Array.from({ length: 60 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          opacity: [0.1, 0.9, 0.1],
                          backgroundColor: i % 4 === 0 ? ['#22d3ee', '#818cf8', '#22d3ee'] : i % 4 === 1 ? ['#f472b6', '#3b82f6', '#f472b6'] : ['#fbbf24', '#f59e0b', '#fbbf24']
                        }}
                        transition={{ duration: Math.random() * 4 + 2, repeat: Infinity, delay: Math.random() * 5 }}
                        className="absolute w-8 h-5 blur-[1px] rounded-sm shadow-[0_0_10px_currentColor]"
                        style={{
                          left: `${(i % 10) * 60 + 50}px`,
                          top: `${Math.floor(i / 10) * 120 + 200}px`
                        }}
                      />
                    ))}

                    {/* Holographic Academy Sign */}
                    <div className="relative z-10 w-full py-20 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-3xl border-y-2 border-white/20 shadow-[0_20px_100px_rgba(0,0,0,0.5)] flex flex-col items-center">
                      <div className="text-center px-10">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="text-[16px] font-black tracking-[1em] text-cyan-400 mb-6 uppercase drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                        >
                          Linguistic Academy
                        </motion.div>
                        <h2 className="text-8xl font-black text-white tracking-tighter leading-none mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                          NOVA SCHOLA
                        </h2>
                        <div className="flex items-center justify-center gap-6">
                          <div className="w-4 h-4 bg-cyan-400 rounded-full animate-ping" />
                          <div className="text-[14px] font-black text-cyan-200/80 tracking-[0.5em] uppercase">
                            Establishing Neural Protocol...
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Moving Elevator Light Beam */}
                    <motion.div
                      animate={{ y: [-1000, 1000] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute left-1/2 -translate-x-1/2 w-[2px] h-[300px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {entrancePhase === 1 && <BreakingNewsOverlay onComplete={handleIntroComplete} />}
          </motion.div>
        )}
      </AnimatePresence>

      {entrancePhase === 2 && (
        <div className="relative z-10 max-w-7xl w-full flex flex-col items-center px-6">

          {/* NAVIGATION BAR (If in options) */}
          {showEnglishOptions && !showNanoBananaCity && (
            <motion.div
              initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="absolute top-0 left-0 right-0 flex justify-between items-center z-[60]"
            >
              <button
                onClick={handleBackToLanguages}
                className="group flex items-center gap-4 px-8 py-4 bg-white shadow-2xl shadow-blue-900/5 rounded-3xl text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-slate-100"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <ArrowLeft size={16} />
                </div>
                {isSpanish ? 'Regresar' : 'Return Home'}
              </button>

              <div className="flex gap-4">
                <div className="px-8 py-4 bg-white/50 backdrop-blur-3xl rounded-3xl border border-white shadow-xl flex items-center gap-3">
                  <StarIcon className="text-amber-400 fill-amber-400" size={16} />
                  <span className="text-xs font-black text-slate-900 tracking-widest uppercase">Level 12 Architect</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* MAIN CENTERPIECE */}
          <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-20 relative pt-12">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="inline-block p-1 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-[2.5rem] shadow-2xl mb-10"
            >
              <div className="bg-white rounded-[2.3rem] p-6">
                <Languages className="w-20 h-20 text-blue-600" />
              </div>
            </motion.div>

            <h1 className="text-8xl font-black text-slate-900 tracking-tighter mb-6 relative">
              {showEnglishOptions ? (isSpanish ? 'Domo de Inglés' : 'English Dome') : (isSpanish ? 'Centro de Idiomas' : 'Language Center')}
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute -top-10 -right-12 opacity-40">
                <Sparkles size={60} className="text-blue-500" />
              </motion.div>
            </h1>

            <p className="text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              {showEnglishOptions
                ? (isSpanish ? 'Bienvenido a la academia de alta tecnología. Selecciona tu simulación de aprendizaje.' : 'Welcome to the high-tech academy. Select your learning simulation.')
                : (isSpanish ? 'Domina nuevas lenguas explorando mundos diseñados para mentes jóvenes.' : 'Master new tongues by exploring worlds designed for young minds.')}
            </p>
          </motion.div>

          {!showEnglishOptions ? (
            /* MAIN LANGUAGE SELECTOR */
            <div className="grid md:grid-cols-2 gap-12 w-full max-w-5xl">
              <motion.button
                whileHover={{ y: -25, scale: 1.05, rotateY: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectLanguage(ViewState.BUDDY_LEARN)}
                className="group relative h-[550px] rounded-[5rem] overflow-hidden border-4 border-white shadow-[0_40px_100px_rgba(59,130,246,0.3)] flex flex-col items-center justify-center p-14 bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-900 transition-all duration-500 hover:border-cyan-300"
              >
                {/* Animated Background Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(34,211,238,0.4)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

                <div className="relative z-10 flex flex-col items-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-48 h-48 bg-white/20 backdrop-blur-xl rounded-[4rem] flex items-center justify-center mb-10 shadow-2xl border border-white/40 group-hover:bg-cyan-400 group-hover:border-white transition-all duration-500"
                  >
                    <Globe className="w-28 h-28 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                  </motion.div>
                  <h2 className="text-8xl font-black text-white mb-4 tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)]">ENGLISH</h2>
                  <p className="text-cyan-100 text-center text-xl max-w-[340px] font-bold leading-relaxed drop-shadow-md">
                    {isSpanish ? '¡Despega hacia el futuro con Ollie y sus misiones!' : 'Blast off into the future with Ollie and his missions!'}
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(34,211,238,0.8)" }}
                    className="mt-14 flex items-center gap-4 px-14 py-6 bg-white text-blue-700 rounded-[2.5rem] font-extrabold tracking-[0.2em] uppercase text-sm shadow-2xl group-hover:bg-cyan-400 group-hover:text-white transition-all"
                  >
                    {isSpanish ? 'INICIAR VIAJE' : 'START JOURNEY'} <Zap size={20} className="fill-current" />
                  </motion.div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ y: -25, scale: 1.05, rotateY: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectLanguage(ViewState.SPANISH_TUTOR)}
                className="group relative h-[550px] rounded-[5rem] overflow-hidden border-4 border-white shadow-[0_40px_100px_rgba(236,72,153,0.3)] flex flex-col items-center justify-center p-14 bg-gradient-to-br from-pink-600 via-rose-700 to-purple-800 transition-all duration-500 hover:border-pink-300"
              >
                {/* Animated Background Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(251,113,133,0.4)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

                <div className="relative z-10 flex flex-col items-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="w-48 h-48 bg-white/20 backdrop-blur-xl rounded-[4rem] flex items-center justify-center mb-10 shadow-2xl border border-white/40 group-hover:bg-rose-400 group-hover:border-white transition-all duration-500"
                  >
                    <Languages className="w-28 h-28 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                  </motion.div>
                  <h2 className="text-8xl font-black text-white mb-4 tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)]">ESPAÑOL</h2>
                  <p className="text-pink-100 text-center text-xl max-w-[340px] font-bold leading-relaxed drop-shadow-md">
                    {isSpanish ? 'Domina nuestra lengua con retos espectaculares.' : 'Master our language with spectacular challenges.'}
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(251,113,133,0.8)" }}
                    className="mt-14 flex items-center gap-4 px-14 py-6 bg-white text-rose-700 rounded-[2.5rem] font-extrabold tracking-[0.2em] uppercase text-sm shadow-2xl group-hover:bg-rose-500 group-hover:text-white transition-all"
                  >
                    {isSpanish ? 'INICIAR VIAJE' : 'START JOURNEY'} <Zap size={20} className="fill-current" />
                  </motion.div>
                </div>
              </motion.button>
            </div>
          ) : !isAnyGameActive && (
            /* ENGLISH SUBSYSTEMS SELECTOR */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
              {[
                { id: ViewState.BUDDY_LEARN, title: 'Chat Simulator', desc: 'Face-to-face with Ollie', icon: Globe, color: 'from-emerald-500 to-teal-700', shadow: 'shadow-emerald-500/20', emoji: '🤖' },
                { id: ViewState.NANO_BANANA_CITY, title: 'City Architect', desc: 'Design & nomenclature', icon: Building2, color: 'from-blue-500 to-indigo-700', shadow: 'shadow-blue-500/20', emoji: '🏗️' },
                { id: ViewState.NEON_DINER, title: 'Career Academy', desc: 'Simulate high-tech professions', icon: Briefcase, color: 'from-blue-600 to-indigo-800', shadow: 'shadow-blue-500/20', emoji: '🍔' },
                { id: ViewState.ADVENTURE_RADIO, title: 'Global Scout', desc: 'Audio navigation mission', icon: Globe2, color: 'from-indigo-500 to-blue-700', shadow: 'shadow-indigo-500/20', emoji: '🧭' },
                { id: ViewState.TIME_MACHINE, title: 'Chronos Lab', desc: 'Tense & grammar control', icon: Clock, color: 'from-purple-500 to-violet-700', shadow: 'shadow-purple-500/20', emoji: '⏳' },
                { id: ViewState.SENTENCE_BUILDER, title: 'Sentence Architect', desc: 'Blueprint construction', icon: Layout, color: 'from-cyan-500 to-blue-700', shadow: 'shadow-cyan-500/20', emoji: '📐' },
                { id: ViewState.STORY_TELLER, title: 'Story Legend', desc: 'Cinematic world-weaving', icon: BookOpen, color: 'from-amber-500 to-orange-700', shadow: 'shadow-amber-500/20', emoji: '📖' },
                { id: ViewState.CITY_INSPECTOR, title: 'Analysis Hub', desc: 'Comparative inspection', icon: Ruler, color: 'from-slate-700 to-slate-900', shadow: 'shadow-slate-500/20', emoji: '🔍' }
              ].map((item, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -20, scale: item.id === ViewState.NOVA_BANK ? 1.05 : 1.02 }}
                  onClick={() => handleEnglishOption(item.id)}
                  className={`group relative border-4 border-white/30 shadow-2xl ${item.shadow} rounded-[4rem] p-12 flex flex-col items-center text-center transition-all hover:border-white hover:shadow-white/20 overflow-hidden
                    ${item.id === ViewState.NOVA_BANK
                      ? 'bg-gradient-to-br from-blue-500 via-indigo-600 to-sky-400 border-yellow-300/50 shadow-[0_0_50px_rgba(59,130,246,0.2)]'
                      : `bg-gradient-to-br ${item.color}`}
                  `}
                >
                  {/* Decorative Glow */}
                  <div className={`absolute -top-10 -left-10 w-40 h-40 blur-[50px] rounded-full transition-all group-hover:bg-white/20
                    ${item.id === ViewState.NOVA_BANK ? 'bg-white/20' : 'bg-white/10'}
                  `} />

                  {item.id === ViewState.NOVA_BANK && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 opacity-20 pointer-events-none"
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_white_0%,_transparent_60%)] blur-[100px]" />
                    </motion.div>
                  )}

                  <div className="absolute top-8 right-10 text-white/50 group-hover:text-white transition-colors uppercase text-[11px] font-black tracking-[0.4em] font-mono">
                    {item.id === ViewState.NOVA_BANK ? 'HERO ZONE' : `MOD-${idx + 1}`}
                  </div>

                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    className={`w-28 h-28 backdrop-blur-xl rounded-[3rem] flex items-center justify-center mb-10 shadow-xl border transition-all duration-500 group-hover:scale-110
                        ${item.id === ViewState.NOVA_BANK
                        ? 'bg-gradient-to-br from-yellow-300 to-amber-500 border-white shadow-yellow-400/40'
                        : 'bg-white/20 border-white/40 group-hover:bg-white/30'}
                    `}
                  >
                    {item.emoji ? <span className="text-5xl drop-shadow-lg">{item.emoji}</span> : <item.icon className="w-14 h-14 text-white drop-shadow-lg" />}
                  </motion.div>

                  <h3 className="text-3xl font-black text-white mb-4 tracking-tighter drop-shadow-xl">
                    {item.title}
                  </h3>
                  <p className="text-white/90 text-base font-bold leading-relaxed px-4">
                    {item.desc}
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`mt-10 px-10 py-4 rounded-2xl border-2 transition-all flex items-center gap-3 backdrop-blur-md
                        ${item.id === ViewState.NOVA_BANK
                        ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black'
                        : 'bg-white/20 border-white/20 text-white hover:bg-white/30'}
                    `}
                  >
                    <Zap size={18} className="fill-current" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">
                      {item.id === ViewState.NOVA_BANK ? 'ENTER SECURE VAULT' : 'Launch Alpha'}
                    </span>
                  </motion.div>
                </motion.button>
              ))}
            </div>
          )}

          {/* LOWER DECORATIONS */}
          <div className="mt-20 flex items-center gap-10 opacity-30">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600"><Layout size={20} /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Protocol V4</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600"><StarIcon size={20} /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Premium Access</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600"><Gamepad2 size={20} /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Interactive</span>
            </div>
          </div>
        </div >
      )}

      {/* GAME RENDERERS - High Layer Overlay */}
      <AnimatePresence>
        {isAnyGameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            {/* Common Return Bar - Hidden for AdventureRadio which handles its own exit logic */}
            {!showAdventureRadio && (
              <div className="absolute top-6 left-6 z-[110]">
                <button
                  onClick={handleBackToEnglishOptions}
                  className="group flex items-center gap-4 pl-3 pr-8 py-3 bg-white/40 backdrop-blur-3xl hover:bg-blue-600 rounded-full border-2 border-white/50 text-slate-900 hover:text-white transition-all shadow-2xl"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:bg-blue-500 transition-colors">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Return to Academy</span>
                </button>
              </div>
            )}

            <div className="flex-1 w-full h-full relative pt-24">
              {showNanoBananaCity && <NanoBananaCity onBack={handleBackToEnglishOptions} />}
              {showAdventureRadio && <AdventureRadio onBack={handleBackToEnglishOptions} />}
              {showNeonDiner && <NeonDiner />}
              {showCityInspector && <CityInspector />}
              {showTimeMachine && <TimeMachine />}
              {showSentenceBuilder && <SentenceBuilder />}
              {showLanguageChatbot && <LanguageChatbot />}
              {showStoryLegend && <StoryLegend />}
              {showNovaBank && <NovaBank />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div >
  );
};

