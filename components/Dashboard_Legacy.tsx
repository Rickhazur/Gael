import React, { useEffect } from 'react';
import { ViewState, Language } from '../types';
import {
  Calculator,
  Languages,
  ArrowRight,
  Trophy,
  Search,
  Rocket,
  BookOpen,
  Sparkles,
  Zap
} from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { Button } from '@/components/ui/button';
import { NotificationBell } from './Notifications/NotificationBell';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface DashboardProps {
  onNavigate?: (view: ViewState) => void;
  language: Language;
  userName?: string;
}

interface ToolCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  bgGradient: string;
  viewState: ViewState;
  featured?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, language, userName }) => {
  const { coins, xp } = useGamification();

  const triggerSupernova = () => {
    console.log("💥 Triggering Supernova Explosion!");
    // Stage 1: Central bright burst
    const count = 300;
    const defaults = {
      origin: { y: 0.6 },
      zIndex: 9999, // Super high z-index
      gravity: 1.2,
      ticks: 300,
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8']
    });

    fire(0.2, {
      spread: 60,
      colors: ['#ffffff', '#FFD700']
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#8B5CF6', '#EC4899', '#6366F1'] // Nova/Cosmic colors
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  useEffect(() => {
    // Trigger explosion on mount!
    const timer = setTimeout(() => {
      triggerSupernova();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const speakGreeting = () => {
    triggerSupernova(); // Trigger it manually too!

    const greeting = language === 'es'
      ? `¡Hola ${userName} !Soy Nova, tu asistente de aprendizaje. ¿Qué misión vamos a conquistar hoy ? `
      : `Hi ${userName} !I'm Nova, your learning assistant. Which mission are we conquering today?`;

    const utterance = new SpeechSynthesisUtterance(greeting);
    utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);

    toast.success("Nova Burst! 💥", {
      description: language === 'es' ? "¡Energía Nova liberada!" : "Nova Energy unleashed!",
      icon: <Sparkles className="w-5 h-5 text-yellow-500" />
    });
  };

  const tools: ToolCard[] = [
    {
      id: 'mission-control',
      name: language === 'es' ? '🎯 Centro de Mando' : '🎯 Mission Control',
      description: language === 'es'
        ? 'Tus tareas escolares convertidas en misiones épicas'
        : 'Your school tasks turned into epic missions',
      icon: <Rocket className="w-12 h-12 text-white" />,
      bgGradient: 'from-indigo-600 via-violet-600 to-purple-600',
      viewState: ViewState.TASK_CONTROL,
      featured: true
    },
    {
      id: 'math-tutor',
      name: language === 'es' ? '🧮 Tutor de Matemáticas' : '🧮 Math Tutor',
      description: language === 'es'
        ? 'Ms. Lina te ayuda paso a paso con cualquier problema'
        : 'Ms. Lina helps you step-by-step with any problem',
      icon: <Calculator className="w-12 h-12 text-white" />,
      bgGradient: 'from-blue-600 via-cyan-500 to-teal-500',
      viewState: ViewState.MATH_TUTOR,
      featured: true
    },
    {
      id: 'google-classroom',
      name: language === 'es' ? '📚 Classroom Sync' : '📚 Classroom Sync',
      description: language === 'es'
        ? 'Sincroniza tus tareas de Google Classroom automáticamente'
        : 'Sync your Google Classroom tasks automatically',
      icon: <BookOpen className="w-12 h-12 text-white" />,
      bgGradient: 'from-green-600 via-emerald-500 to-teal-500',
      viewState: ViewState.GOOGLE_CLASSROOM
    },
    {
      id: 'research-lab',
      name: language === 'es' ? '🔬 Laboratorio de Investigación' : '🔬 Research Lab',
      description: language === 'es'
        ? 'Investiga cualquier tema y crea reportes increíbles'
        : 'Research any topic and create amazing reports',
      icon: <Search className="w-12 h-12 text-white" />,
      bgGradient: 'from-purple-600 via-pink-500 to-rose-500',
      viewState: ViewState.RESEARCH_CENTER
    },
    {
      id: 'english-buddy',
      name: language === 'es' ? '🌍 English Buddy' : '🌍 English Buddy',
      description: language === 'es'
        ? 'Practica inglés con conversaciones divertidas'
        : 'Practice English with fun conversations',
      icon: <Languages className="w-12 h-12 text-white" />,
      bgGradient: 'from-orange-600 via-amber-500 to-yellow-500',
      viewState: ViewState.BUDDY_LEARN
    }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-16 font-poppins animate-fade-in px-4 sm:px-6 lg:px-8">

      {/* Welcome Header with Nova Buddy */}
      <div className="mb-12 flex flex-col md:flex-row items-center md:items-center justify-between gap-8 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-8 rounded-[3rem] shadow-2xl shadow-indigo-500/30 relative overflow-visible">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="flex flex-col md:flex-row items-center gap-8 z-10">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={speakGreeting}
            className="w-28 h-28 bg-white/20 backdrop-blur-xl rounded-[2rem] shadow-xl flex items-center justify-center relative group overflow-hidden border-4 border-white/30 cursor-pointer"
          >
            <Rocket className="w-14 h-14 text-white group-hover:scale-110 transition-transform drop-shadow-lg" />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white animate-bounce shadow-lg">
              <Sparkles className="w-4 h-4 text-yellow-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </motion.button>

          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-3 font-fredoka tracking-tight drop-shadow-lg">
              {language === 'es' ? '¡Hola,' : 'Hello,'}{' '}
              <span className="text-yellow-300 drop-shadow-xl animate-pulse">
                {userName || (language === 'es' ? 'Explorador' : 'Explorer')}!
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-bold drop-shadow-md">
              {language === 'es'
                ? '¿Qué aventura vamos a vivir hoy? 🌟'
                : 'What adventure are we going on today? 🌟'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 z-10">
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl px-6 py-3 border-2 border-white/30 shadow-xl">
            <p className="text-xs text-white/80 font-bold mb-1">{language === 'es' ? 'Puntos XP' : 'XP Points'}</p>
            <p className="text-3xl font-black text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-300" />
              {xp}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl px-6 py-3 border-2 border-white/30 shadow-xl">
            <p className="text-xs text-white/80 font-bold mb-1">{language === 'es' ? 'Monedas' : 'Coins'}</p>
            <p className="text-3xl font-black text-white flex items-center gap-2">
              🪙
              {coins}
            </p>
          </div>
        </div>
      </div>

      {/* Main Title */}
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 font-fredoka">
          {language === 'es' ? '🎮 Tus Herramientas Mágicas' : '🎮 Your Magic Tools'}
        </h2>
        <p className="text-lg text-slate-600 font-medium">
          {language === 'es'
            ? 'Elige una herramienta y comienza tu aventura de aprendizaje'
            : 'Choose a tool and start your learning adventure'}
        </p>
      </div>

      {/* Tools Grid - Simplified and More Attractive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative bg-white rounded-[2.5rem] shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 overflow-hidden ${tool.featured ? 'md:col-span-1 lg:col-span-1' : ''
              }`}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${tool.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Content */}
            <div className="relative z-10 p-8 flex flex-col h-full">
              {/* Icon */}
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${tool.bgGradient} flex items-center justify-center shadow-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                {tool.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-white transition-colors duration-300">
                {tool.name}
              </h3>

              {/* Description */}
              <p className="text-slate-600 font-medium mb-8 leading-relaxed group-hover:text-white/90 transition-colors duration-300 flex-1">
                {tool.description}
              </p>

              {/* Button */}
              <Button
                onClick={() => onNavigate?.(tool.viewState)}
                className={`w-full h-16 rounded-2xl text-lg font-black shadow-lg transition-all
                  bg-gradient-to-r ${tool.bgGradient}
                  group-hover:bg-white group-hover:text-slate-900
                  hover:scale-105 active:scale-95
                  text-white
                `}
              >
                <span className="flex items-center justify-center gap-3">
                  {language === 'es' ? '¡Vamos!' : 'Let\'s Go!'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Access Footer */}
      <div className="mt-16 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-3xl p-8 border-2 border-indigo-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-bold mb-1">
                {language === 'es' ? '¿Necesitas ayuda?' : 'Need help?'}
              </p>
              <p className="text-lg font-black text-slate-900">
                {language === 'es' ? 'Haz clic en Nova para que te guíe' : 'Click Nova to guide you'}
              </p>
            </div>
          </div>
          <Button
            onClick={speakGreeting}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Rocket className="w-5 h-5 mr-2" />
            {language === 'es' ? 'Hablar con Nova' : 'Talk to Nova'}
          </Button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
