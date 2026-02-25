
import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { ChevronRight, ChevronLeft, X, Sparkles, MapPin, Trophy, Coins, Brain, Compass, ShoppingBag } from 'lucide-react';

interface Step {
  title: string;
  content: string;
  view: ViewState;
  icon?: React.ReactNode;
}

const TOUR_STEPS: Step[] = [
  {
    view: ViewState.DASHBOARD,
    title: "🚀 Bienvenido a Nova Schola",
    content: "Has entrado a la plataforma de **Tutoría de Alto Rendimiento** más avanzada del mundo.\n\nOlvídate de los colegios tradicionales. Aquí combinamos Inteligencia Artificial, Disciplina y Metodología IB para acelerar tu aprendizaje.",
    icon: <Sparkles className="w-6 h-6 text-yellow-300" />
  },
  {
    view: ViewState.DASHBOARD,
    title: "🛡️ Check-in Diario (Disciplina)",
    content: "Antes de empezar, la disciplina es clave.\n\nSi el 'Room Check' está activo, la cámara verificará que tu **cama esté tendida y tu cuarto ordenado**. Sin orden, no se desbloquean las clases.",
    icon: <MapPin className="w-6 h-6 text-white" />
  },
  {
    view: ViewState.SCHEDULE,
    title: "🗺️ Tu Ruta de Aprendizaje",
    content: "Ya no tienes un horario rígido. Tienes una **Misión Diaria**.\n\n🔹 **Google Classroom:** Usa el botón 'Sincronizar' para que la IA importe tus tareas del colegio y cree sesiones de tutoría automáticas para ayudarte a resolverlas.",
    icon: <MapPin className="w-6 h-6 text-white" />
  },
  {
    view: ViewState.CURRICULUM,
    title: "🧠 Tutoría IA en Vivo",
    content: "Este es el corazón de Nova Schola. Tu tutor habla **100% en Inglés**.\n\n🗣️ **Habla:** Interrúmpelo cuando quieras.\n🎨 **Pizarra:** Él dibujará diagramas. ¡Tú puedes rayar encima para resolver problemas juntos!",
    icon: <Brain className="w-6 h-6 text-white" />
  },
  {
    view: ViewState.CURRICULUM,
    title: "👁️ Anti-Cheat & Focus",
    content: "Tomamos el estudio en serio.\n\nSi cambias de pestaña (YouTube/Juegos) durante una clase o examen, **el sistema lo detecta** y te pone una falta. También haremos 'Check-ins' sorpresa para ver si sigues ahí.",
    icon: <Brain className="w-6 h-6 text-white" />
  },
  {
    view: ViewState.AI_CONSULTANT,
    title: "📸 Visión Artificial (Snap & Solve)",
    content: "¿Tienes un libro físico o una hoja de papel?\n\nSube una foto aquí. La IA leerá el ejercicio y, en lugar de darte la respuesta, te guiará paso a paso con el Método Socrático.",
    icon: <Brain className="w-6 h-6 text-white" />
  },
  {
    view: ViewState.FLASHCARDS,
    title: "⚡ AI Flashcards",
    content: "No olvides lo que aprendes.\n\nGenera tarjetas de estudio automáticas sobre cualquier tema (ej: 'Vectores'). Úsalas para repasar conceptos clave en 5 minutos.",
    icon: <Brain className="w-6 h-6 text-white" />
  },
  {
    view: ViewState.SOCIAL,
    title: "🏆 Arena Social",
    content: "Estudiar no es solitario.\n\nCompite en el **Ranking Global**, reta a tus amigos a 'Duelos Matemáticos' en tiempo real y gana medallas por tu constancia.",
    icon: <Trophy className="w-6 h-6 text-yellow-300" />
  },

  {
    view: ViewState.REWARDS,
    title: "🛍️ Tienda Nova (Economía)",
    content: "El esfuerzo paga.\n\nCada clase completada te da **Nova Coins**. Úsalos aquí para comprar Avatares, Temas para la App o **Premios Reales** (Cine, Pizza) configurados por tus padres/admin.",
    icon: <ShoppingBag className="w-6 h-6 text-white" />
  },
  {
    view: ViewState.PROGRESS,
    title: "📈 Reportes a Padres",
    content: "Tus padres reciben un resumen diario por **Email**.\n\nSaben si estudiaste, si te distrajiste y cómo te sientes (análisis de sentimiento). ¡Mantén tus métricas en verde!",
    icon: <Coins className="w-6 h-6 text-white" />
  },
  {
    view: ViewState.DASHBOARD,
    title: "🎓 ¡Estás Listo!",
    content: "Tienes las mejores herramientas del mundo en tus manos.\n\nEs hora de aprender a velocidad luz. ¡Bienvenido a la élite!",
    icon: <Sparkles className="w-6 h-6 text-yellow-300" />
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose, currentView, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Sync the app view with the current tour step
  useEffect(() => {
    if (isOpen) {
      onNavigate(TOUR_STEPS[currentStep].view);
    }
  }, [currentStep, isOpen, onNavigate]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const nextStep = () => {
    if (isLast) {
      onClose();
      setTimeout(() => setCurrentStep(0), 500); // Reset for next time
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center pointer-events-none p-4 sm:p-0 font-sans">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>

      {/* Tour Card */}
      <div className="bg-white pointer-events-auto w-full max-w-lg rounded-3xl shadow-2xl border border-teal-100 overflow-hidden transform transition-all animate-fade-in relative z-50 mb-4 sm:mb-0">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-start text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>

          <div className="flex gap-4 relative z-10">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
              {step.icon}
            </div>
            <div>
              <span className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-1 block">
                Paso {currentStep + 1} de {TOUR_STEPS.length}
              </span>
              <h3 className="text-2xl font-bold text-white leading-tight">{step.title}</h3>
            </div>
          </div>

          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 bg-white">
          <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
            {step.content}
          </p>
        </div>

        {/* Footer / Controls */}
        <div className="p-5 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-stone-400 hover:text-stone-700 disabled:opacity-30 font-bold text-sm flex items-center gap-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <div key={idx} className={`h-2 rounded-full transition-all duration-500 ${idx === currentStep ? 'w-8 bg-teal-500' : 'w-2 bg-stone-200'}`}></div>
            ))}
          </div>

          <button
            onClick={nextStep}
            className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-200 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            {isLast ? '¡Comenzar!' : 'Siguiente'}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
