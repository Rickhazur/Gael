import React, { useState, useEffect } from 'react';
import { 
  Heart, Sparkles, ChevronRight, CheckCircle2, Users, Smartphone, 
  Baby, ShieldCheck, Stars, Globe, ArrowRight, Play, Mic, Brain,
  MessageCircle, Award, Lightbulb, UserCheck, Zap, Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ICFESLandingProps {
  onStart: () => void;
  onLogin: () => void;
}

export const ICFESLanding: React.FC<ICFESLandingProps> = ({ onStart, onLogin }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FEFDFB] overflow-x-hidden selection:bg-rose-100 selection:text-emerald-900" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* ─── Soft Ambient Decoration ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[5%] left-[10%] text-emerald-50/60 animate-float-slow">
          <Heart className="w-48 h-48 fill-current blur-2xl" />
        </div>
        <div className="absolute top-[40%] right-[-5%] text-rose-50/40 animate-float" style={{ animationDelay: '2s' }}>
          <Stars className="w-64 h-64 fill-current blur-2xl" />
        </div>
        <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-emerald-50/30 rounded-full blur-[150px]" />
        <div className="absolute top-[20%] right-[15%] w-72 h-72 bg-rose-50/20 rounded-full blur-[120px]" />
      </div>

      {/* ─── Elegant Minimal Header ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-white/80 backdrop-blur-2xl py-3 border-b border-emerald-50/50 shadow-sm' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-[#1B4D3E] flex items-center justify-center shadow-lg shadow-emerald-100 transform group-hover:scale-110 transition-transform duration-500">
              <span className="text-white font-bold text-2xl">G</span>
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-xl text-slate-800 leading-none tracking-tight">Academia <span className="text-emerald-700">Gael</span></span>
                <span className="text-[9px] font-bold text-emerald-500 tracking-[0.2em] uppercase mt-1">Tu Espacio de Sueños</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={onLogin}
              className="text-sm font-bold text-slate-400 hover:text-emerald-700 transition-colors hidden sm:block"
            >
              Ya tengo cuenta
            </button>
            <button 
              onClick={onLogin}
              className="px-10 py-3.5 bg-emerald-900 text-white rounded-full font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-800 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              ENTRAR
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Refined Hero Section ─── */}
      <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 px-8 z-10 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white border border-rose-50 mb-12 animate-fade-in-up shadow-sm">
            <Heart className="w-4 h-4 text-rose-300 fill-current animate-pulse-heart" />
            <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Para Danna, con todo nuestro amor</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 leading-[1] tracking-tight mb-10 animate-fade-in-up">
            Gael<span className="text-rose-300">.</span><br/>
            <span className="text-emerald-800 italic">Tu Bachillerato.</span><br/>
            <span className="text-slate-200">En tu tiempo.</span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-400 leading-relaxed max-w-2xl mb-14 animate-fade-in-up stagger-1 font-medium">
            Logra tu meta de validar tu bachillerato con un sistema diseñado para el ritmo de vida de una mamá moderna. <span className="text-emerald-700">Sin presiones, solo progreso.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-8 animate-fade-in-up stagger-2">
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto px-14 py-7 bg-emerald-900 text-white rounded-[2rem] font-bold text-xl shadow-2xl shadow-emerald-200/50 hover:bg-emerald-800 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-4"
            >
              Comenzar esta aventura
              <ArrowRight className="w-6 h-6 text-rose-200" />
            </button>
          </div>

          {/* Visual Placeholder (Subtle & Elegant) */}
          <div className="mt-28 w-full max-w-4xl relative group">
              <div className="aspect-video bg-gradient-to-br from-white to-emerald-50 rounded-[4rem] shadow-2xl border-[12px] border-white overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-3xl p-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                          <div className="space-y-6 text-left">
                              <div className="w-16 h-16 rounded-3xl bg-emerald-900 flex items-center justify-center shadow-lg">
                                  <Mic className="w-8 h-8 text-white" />
                              </div>
                              <h3 className="text-3xl font-bold text-slate-800">Estudia con tu voz.</h3>
                              <p className="text-slate-500 font-medium">Libres de manos. Lina te acompaña en sesiones cortas y efectivas, pensadas para cuando tienes las manos ocupadas.</p>
                          </div>
                          <div className="relative">
                              <div className="w-full aspect-square bg-rose-50 rounded-[3rem] rotate-6 animate-float" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <Baby className="w-24 h-24 text-rose-200" />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-rose-100 opacity-20 blur-3xl animate-pulse-heart" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-100 opacity-20 blur-3xl" />
          </div>
      </section>

      {/* ─── Simple Three Steps ─── */}
      <section className="py-40 bg-[#143A2F] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                { icon: <Stars/>, title: "Sueña", desc: "El título de bachiller es el primer gran paso para el futuro que quieres." },
                { icon: <MessageCircle/>, title: "Aprende", desc: "Lina es tu mentora personal. Te explica todo de forma sencilla y humana." },
                { icon: <Heart/>, title: "Logra", desc: "Avanza a tu ritmo, sin sacrificar tiempo con los que más amas." }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-8 animate-fade-in-up" style={{ animationDelay: `${i * 0.2}s` }}>
                   <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center hover:bg-rose-500/20 transition-all border border-white/5">
                      {React.cloneElement(step.icon as React.ReactElement, { className: "w-10 h-10 text-rose-300 fill-current" })}
                   </div>
                   <h3 className="text-3xl font-bold">{step.title}</h3>
                   <p className="text-emerald-100/60 leading-relaxed font-medium">{step.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ─── Final Personal Message ─── */}
      <section className="py-40 text-center px-8 relative">
        <div className="max-w-3xl mx-auto space-y-12 relative z-10">
           <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-float">
              <Heart className="w-12 h-12 text-rose-400 fill-current" />
           </div>
           
           <h2 className="text-5xl sm:text-6xl font-black text-slate-800 leading-[1] tracking-tight">
             Estamos felices de<br/>
             <span className="text-emerald-800">tenerte aquí.</span>
           </h2>

           <p className="text-xl text-slate-400 max-w-xl mx-auto font-medium lead-relaxed">
             Tu portal está listo. Solo entra y descubre cómo vamos a revolucionar tu aprendizaje juntas.
           </p>

           <button 
             onClick={onLogin}
             className="px-16 py-8 bg-emerald-900 text-white rounded-full font-bold text-2xl shadow-2xl shadow-emerald-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 mx-auto"
           >
              Entrar a Academia Gael
              <ArrowRight className="w-8 h-8 text-rose-300" />
           </button>
        </div>
      </section>
      
      <footer className="py-20 border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center gap-8">
           <div className="flex items-center gap-3 grayscale opacity-30">
               <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
                   <span className="text-white font-bold text-xs">G</span>
               </div>
               <span className="font-bold text-slate-900 text-sm italic tracking-tighter">Academia Gael</span>
           </div>
           <p className="text-[10px] font-bold text-slate-300 tracking-[0.3em] uppercase">Hecho con todo nuestro corazón</p>
        </div>
      </footer>
    </div>
  );
};
