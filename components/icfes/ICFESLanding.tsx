import React, { useState, useEffect } from 'react';
import { 
  Heart, Sparkles, ChevronRight, CheckCircle2, Users, Smartphone, 
  Baby, ShieldCheck, Stars, Globe, ArrowRight, Play, Mic, Brain,
  MessageCircle, Award, Lightbulb, UserCheck
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
    <div className="min-h-screen bg-[#FDFEFC] overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900 selection:bg-rose-100" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* ─── Immersive Floating Universe ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[5%] left-[10%] text-emerald-100/40 animate-float-slow">
          <Heart className="w-48 h-48 fill-current blur-sm" />
        </div>
        <div className="absolute top-[40%] right-[-5%] text-rose-100/30 animate-float" style={{ animationDelay: '2s' }}>
          <Stars className="w-64 h-64 fill-current blur-md" />
        </div>
        <div className="absolute bottom-[-10%] left-[20%] text-emerald-50/50 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-96 h-96 bg-emerald-50 rounded-full blur-[150px]" />
        </div>
        <div className="absolute top-[20%] right-[15%] w-72 h-72 bg-rose-50 rounded-full blur-[120px] opacity-40" />
      </div>

      {/* ─── Luxe Header ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-white/70 backdrop-blur-2xl py-3 border-b border-emerald-50/50' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-[1.25rem] bg-[#1B4D3E] flex items-center justify-center shadow-xl shadow-emerald-200/50 transform group-hover:rotate-12 transition-transform duration-500">
              <span className="text-white font-black text-2xl">G</span>
            </div>
            <div className="flex flex-col">
                <span className="font-black text-xl text-slate-900 leading-none tracking-tight">Academia <span className="text-[#1B4D3E]">Gael</span></span>
                <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase mt-1">Élite Educational</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {['Metodología', 'Profesora Lina', 'Planes', 'Inscribirse'].map((item) => (
              <a key={item} href="#" className="text-sm font-bold text-slate-500 hover:text-[#1B4D3E] transition-colors">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={onLogin}
              className="text-sm font-bold text-slate-600 hover:text-[#1B4D3E] hidden sm:block"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={onLogin}
              className="px-8 py-3 bg-[#1B4D3E] text-white rounded-full font-black text-sm shadow-xl shadow-emerald-200/40 hover:scale-105 active:scale-95 transition-all"
            >
              EMPEZAR
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Dramatic Hero Section ─── */}
      <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 px-6 z-10 max-w-7xl mx-auto min-h-screen flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-card-luxe border-luxe animate-fade-in-up">
                <Heart className="w-4 h-4 text-emerald-500 animate-pulse-heart fill-current" />
                <span className="text-xs font-black text-[#1B4D3E] tracking-widest uppercase">El futuro de tu bebé empieza hoy</span>
              </div>

              <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black text-slate-900 leading-[0.85] tracking-tighter animate-fade-in-up">
                Gael<span className="text-emerald-500">.</span><br/>
                <span className="text-[#1B4D3E]">Validación</span><br/>
                <span className="text-slate-300">Inteligente.</span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-500 leading-relaxed max-w-xl animate-fade-in-up stagger-1">
                La herramienta de bachillerato diseñada <span className="text-[#1B4D3E] font-bold">exclusivamente</span> para mamás. Estudia con tu voz, libres de manos, mientras cuidas lo que más amas.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 animate-fade-in-up stagger-2">
                <button 
                  onClick={onLogin}
                  className="w-full sm:w-auto px-10 py-6 bg-[#1B4D3E] text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-emerald-200 hover:bg-[#2D7A5F] transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                  Empezar Mi Preparación
                  <ArrowRight className="w-6 h-6" />
                </button>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex -space-x-4">
                        {[1,2,3].map(i => <div key={i} className={`w-12 h-12 rounded-full border-4 border-white bg-emerald-${i*100} shadow-sm`} />)}
                    </div>
                    <div className="text-sm">
                        <p className="font-bold text-slate-800">+2.5k Mamás Graduadas</p>
                        <p className="text-slate-500/80">Únete hoy mismo</p>
                    </div>
                </div>
              </div>
           </div>

           {/* Visual Showcase */}
           <div className="relative animate-float-slow">
              <div className="aspect-[4/5] bg-gradient-to-br from-emerald-100 via-white to-rose-50 rounded-[4rem] shadow-2xl relative overflow-hidden border-[16px] border-white">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                 
                 {/* Representación de Gael / Bebé */}
                 <div className="absolute inset-0 flex items-center justify-center">
                     <div className="relative">
                        <Baby className="w-48 h-48 text-emerald-200/50" />
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-100 rounded-full blur-2xl opacity-60"></div>
                     </div>
                 </div>

                 {/* Interactive UI Overlays */}
                 <div className="absolute top-10 left-10 right-10 flex flex-col gap-4">
                    <div className="glass-card-luxe p-5 rounded-3xl border-luxe flex items-center gap-4 animate-fade-in-up">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-xs">
                            <p className="font-black text-slate-800 uppercase tracking-tighter">Escuchando...</p>
                            <p className="text-slate-500 font-medium italic">"Lina, explícame la metáfora"</p>
                        </div>
                    </div>
                    <div className="glass-card-luxe p-5 rounded-3xl border-luxe flex items-center gap-4 self-end bg-[#1B4D3E] border-none shadow-emerald-900/10 animate-fade-in-up stagger-1">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-xs text-white">
                            <p className="font-black uppercase tracking-tighter opacity-70">Lina responde</p>
                            <p className="font-medium">"Es una comparación poética..."</p>
                        </div>
                    </div>
                 </div>

                 <div className="absolute bottom-10 left-10 flex items-center gap-3 glass-card-luxe p-4 rounded-full border-luxe">
                     <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#1B4D3E]">Clase en vivo 24/7</span>
                 </div>
              </div>

              {/* Outside elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400 opacity-20 blur-[80px] rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400 opacity-10 blur-[80px] rounded-full"></div>
           </div>
        </div>
      </section>

      {/* ─── The Socratic Advantage ─── */}
      <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
           <div className="max-w-3xl mb-24">
              <h2 className="text-4xl sm:text-6xl font-black mb-8 leading-tight">No memorices respuestas.<br/><span className="text-emerald-400 italic">Aprende a pensar.</span></h2>
              <p className="text-xl text-slate-400 leading-relaxed">Nuestra metodología socrática no te da el resultado; te hace las preguntas correctas para que tú lo descubras. </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: <MessageCircle/>, title: "Chat de Voz", desc: "Interactúa como en una llamada real con la Profesora Lina." },
                { icon: <Zap/>, title: "Resultados", desc: "Aprobación del 98% en el examen de validación oficial." },
                { icon: <Award/>, title: "Curriculum", desc: "Cubrimos las 5 áreas del ICFES con rigor y empatía." },
                { icon: <Lightbulb/>, title: "Técnicas", desc: "Te enseñamos los trucos del examen: el descarte y la tesis." }
              ].map((f, i) => (
                <div key={i} className="p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                   <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-all">
                      {React.cloneElement(f.icon as React.ReactElement, { className: "w-8 h-8" })}
                   </div>
                   <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                   <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ─── Proof & Confidence ─── */}
      <section className="py-32 bg-[#FDFEFC]">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="flex-1 space-y-12">
                 <h2 className="text-5xl sm:text-6xl font-black text-slate-900 leading-[0.9]">Tú puedes ser la siguiente.</h2>
                 
                 <div className="space-y-8">
                    {[
                      "Material oficial alineado al ICFES 2026",
                      "Adaptable a tu tiempo (clases de 5 min)",
                      "Funciona en móviles antiguos y gama alta",
                      "Acompañamiento por voz 24/7"
                    ].map(text => (
                      <div key={text} className="flex items-center gap-4 p-5 rounded-3xl bg-white shadow-cute border border-emerald-50">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <span className="font-bold text-slate-700">{text}</span>
                      </div>
                    ))}
                 </div>

                 <button 
                  onClick={onLogin}
                  className="px-10 py-5 bg-[#1B4D3E] text-white rounded-full font-black flex items-center gap-3 shadow-xl shadow-emerald-100"
                 >
                    Ver Planes Disponibles
                    <ChevronRight />
                 </button>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-6">
                 <div className="space-y-6">
                    <div className="aspect-square bg-emerald-100 rounded-[3rem] animate-float" style={{ animationDelay: '0s' }}></div>
                    <div className="aspect-[3/4] bg-slate-100 rounded-[3rem] p-8 flex flex-col justify-end">
                        <p className="text-xs font-black uppercase tracking-widest text-[#1B4D3E] mb-2">Caso de Éxito</p>
                        <p className="text-xl font-bold text-slate-800">"Validé mi bachillerato amamantando a mi hijo."</p>
                    </div>
                 </div>
                 <div className="space-y-6 pt-12">
                    <div className="aspect-[3/4] bg-stone-100 rounded-[3rem] p-8 flex flex-col justify-end">
                        <p className="text-xs font-black uppercase tracking-widest text-[#1B4D3E] mb-2">Metodología</p>
                        <p className="text-xl font-bold text-slate-800">Aprendizaje 10x más rápido que un instituto.</p>
                    </div>
                    <div className="aspect-square bg-rose-50 rounded-[3rem] animate-float" style={{ animationDelay: '1s' }}></div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ─── Final Invitation ─── */}
      <section className="py-40 bg-emerald-50/50">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
           <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-emerald-100 shadow-sm animate-bounce-soft">
              <Stars className="w-5 h-5 text-amber-500 fill-current" />
              <span className="text-xs font-black text-[#1B4D3E] tracking-widest uppercase">Matrículas Abiertas - Cupos Limitados</span>
           </div>
           
           <h2 className="text-6xl sm:text-8xl font-black text-[#1B4D3E] leading-[0.8] tracking-tighter">
             Transforma tu mundo<br/>
             <span className="text-slate-300">desde casa.</span>
           </h2>

           <p className="text-xl text-slate-500 max-w-xl mx-auto">
             Entra a la Academia Gael y descubre por qué somos la herramienta preferida de las nuevas mamás en Colombia.
           </p>

           <button 
             onClick={onLogin}
             className="px-16 py-8 bg-[#1B4D3E] text-white rounded-full font-black text-2xl shadow-[0_20px_60px_-15px_rgba(27,77,62,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 mx-auto"
           >
              Entrar Ahora
              <ArrowRight className="w-8 h-8" />
           </button>
        </div>
      </section>

      <footer className="py-20 border-t border-emerald-50 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B4D3E] flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">G</span>
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tight italic">Academia Gael</span>
          </div>

          <div className="flex items-center gap-8 text-xs font-bold text-slate-400">
             <a href="#" className="hover:text-[#1B4D3E] transition-colors">POLÍTICAS</a>
             <a href="#" className="hover:text-[#1B4D3E] transition-colors">SOPORTE</a>
             <a href="#" className="hover:text-[#1B4D3E] transition-colors">INSTITUCIONAL</a>
          </div>

          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <Globe className="w-5 h-5 text-indigo-400" />
             </div>
             <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">&copy; 2026 Academia Gael. Élite en Validación.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
