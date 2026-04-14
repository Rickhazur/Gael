import React, { useState, useEffect } from 'react';
import { 
  Heart, Sparkles, ChevronRight, CheckCircle2, Users, Smartphone, 
  Baby, ShieldCheck, Stars, Globe, ArrowRight, Play
} from 'lucide-react';

interface ICFESLandingProps {
  onStart: () => void;
  onLogin: () => void;
}

export const ICFESLanding: React.FC<ICFESLandingProps> = ({ onStart, onLogin }) => {
  const [visibleStats, setVisibleStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisibleStats(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFEFC] overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* ─── Animated Floating Background Objects ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[5%] text-emerald-100 opacity-40 animate-float" style={{ animationDelay: '0s' }}>
          <Heart className="w-24 h-24 fill-current" />
        </div>
        <div className="absolute top-[60%] right-[10%] text-emerald-100 opacity-40 animate-float" style={{ animationDelay: '2s' }}>
          <Stars className="w-32 h-32 fill-current" />
        </div>
        <div className="absolute bottom-[10%] left-[15%] text-emerald-50 opacity-30 animate-float" style={{ animationDelay: '1s' }}>
          <Baby className="w-20 h-20" />
        </div>
        <div className="absolute top-[20%] right-[20%] w-96 h-96 bg-emerald-50 rounded-full blur-[120px] opacity-60" />
      </div>

      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-emerald-50/50" id="nav-main">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1B4D3E] to-[#2D7A5F] flex items-center justify-center shadow-lg shadow-emerald-200/50 rotate-3">
              <span className="text-white font-black text-xl">G</span>
            </div>
            <div className="flex flex-col">
                <span className="font-black text-lg text-slate-800 leading-none">Academia <span className="text-[#1B4D3E]">Gael</span></span>
                <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase mt-1">Bachillerato Pro</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="text-sm font-bold text-slate-600 hover:text-[#1B4D3E] transition-colors"
            >
              Ya tengo cuenta
            </button>
            <button 
              onClick={onLogin} // Redirige a cuenta directamente
              className="btn-cute !py-2.5 !px-6 !min-h-0 text-sm"
              id="btn-start-hero"
            >
              Empezar
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="pt-32 pb-16 sm:pt-48 sm:pb-32 px-4 relative z-10" id="hero-section">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-50 border border-emerald-100 mb-8 animate-fade-in-up shadow-sm">
            <Heart className="w-4 h-4 text-emerald-500 animate-pulse-heart fill-current" />
            <span className="text-sm font-bold text-[#1B4D3E]">Diseñado con amor para mamás ocupadas</span>
          </div>

          {/* Title */}
          <div className="relative mb-8">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] animate-fade-in-up stagger-1">
              Gael<span className="text-emerald-500">.</span>
            </h1>
            <div className="absolute -top-6 -right-4 sm:-right-8 animate-sparkle">
               <Sparkles className="w-12 h-12 text-emerald-400" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1B4D3E] tracking-tight mb-8 leading-tight animate-fade-in-up stagger-1 max-w-3xl mx-auto">
            Tu bachillerato <span className="underline decoration-emerald-300 decoration-8 underline-offset-4">SIN</span> descuidar a tu bebé.
          </h2>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up stagger-2 bg-white/40 p-4 rounded-3xl backdrop-blur-sm">
            Prepárate para validar tu bachillerato usando el <strong>micrófono</strong> libres de manos. Tutoría socrática por voz y clases de 5 minutos diseñadas para el ritmo de una mamá.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 animate-fade-in-up stagger-3">
            <button 
              onClick={onLogin} // Redirige a cuenta DIRECTAMENTE
              className="btn-cute text-xl !px-12 !py-6 w-full sm:w-auto shadow-2xl shadow-emerald-200"
              id="btn-cta-main"
            >
              Empezar Mi Preparación
              <ArrowRight className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4 text-emerald-700 font-bold bg-emerald-50/50 px-6 py-4 rounded-3xl border border-emerald-100">
                <Play className="w-5 h-5 fill-current" />
                <span>Ver cómo funciona</span>
            </div>
          </div>

          {/* Minimalist Visual (Baby representation) */}
          <div className="relative max-w-2xl mx-auto p-4 animate-float">
             <div className="aspect-video bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-[3rem] shadow-inner flex items-center justify-center border-8 border-white">
                <div className="flex flex-col items-center">
                    <Baby className="w-24 h-24 text-emerald-200" />
                    <p className="text-emerald-300 font-black tracking-widest uppercase text-xs mt-4">Pausa para lactancia: Activa</p>
                </div>
             </div>
             {/* Floating chat bubbles */}
             <div className="absolute -top-4 -left-8 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-50">
                <div className="w-8 h-8 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-700">"¿Lina, qué es una tesis?"</span>
             </div>
             <div className="absolute -bottom-4 -right-8 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-50">
                <div className="w-8 h-8 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-slate-700">"Es la idea principal, Danna."</span>
             </div>
          </div>

          {/* Trust badges */}
          <div className={`mt-24 flex flex-wrap items-center justify-center gap-12 text-sm text-slate-500 transition-all duration-700 ${visibleStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex flex-col items-center gap-2">
              <Users className="w-10 h-10 text-emerald-100 p-2 bg-emerald-50 rounded-full" />
              <span className="font-bold text-slate-700">+2.500 estudiantes</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Globe className="w-10 h-10 text-emerald-100 p-2 bg-emerald-50 rounded-full" />
              <span className="font-bold text-slate-700">Acceso Privado</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="w-10 h-10 text-emerald-100 p-2 bg-emerald-50 rounded-full" />
              <span className="font-bold text-slate-700">Validación Oficial</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Cute Features Grid ─── */}
      <section className="py-24 bg-emerald-50/30">
        <div className="max-w-6xl mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center text-slate-800 font-medium">
             <div className="p-8 rounded-[2.5rem] bg-white shadow-xl shadow-emerald-100/30 transform hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Smartphone className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Manos Libres</h3>
                <p className="text-slate-500 text-sm">Estudia mientras amamantas o juegas con tu bebé usando solo tu voz.</p>
             </div>
             <div className="p-8 rounded-[2.5rem] bg-white shadow-xl shadow-emerald-100/30 transform hover:-translate-y-2 transition-transform md:translate-y-8">
                <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Tutoría Personal</h3>
                <p className="text-slate-500 text-sm">Nuestra IA socrática te enseña a pensar, no solo a memorizar respuestas.</p>
             </div>
             <div className="p-8 rounded-[2.5rem] bg-white shadow-xl shadow-emerald-100/30 transform hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">100% Privado</h3>
                <p className="text-slate-500 text-sm">Sin publicidad. Sin distracciones. Solo tu progreso y tu futuro.</p>
             </div>
           </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-32 text-center px-4 relative">
          <div className="max-w-xl mx-auto bg-[#1B4D3E] p-12 rounded-[3.5rem] shadow-3xl relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 opacity-20 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400 opacity-20 blur-3xl" />
                
                <h2 className="text-3xl font-black text-white mb-6">¿Lista para el siguiente paso?</h2>
                <p className="text-emerald-100 mb-10 text-lg">Únete a cientos de mamás que ya están validando su bachillerato con nosotros.</p>
                <button 
                  onClick={onLogin} // Redirige a cuenta DIRECTAMENTE
                  className="w-full bg-white text-[#1B4D3E] py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-3"
                  id="btn-final-cta"
                >
                  Empezar Ahora
                  <ChevronRight />
                </button>
          </div>
      </section>
      
      <footer className="py-12 border-t border-emerald-50 text-center text-slate-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
             <Heart className="w-4 h-4 text-emerald-200 fill-current" />
             <span className="font-bold text-slate-300">Academia Gael v3.0</span>
        </div>
        <p>&copy; 2026 Academia Gael. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};
