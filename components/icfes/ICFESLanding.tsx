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
    <div className="min-h-screen bg-[#FDFEFC] overflow-x-hidden selection:bg-rose-100 selection:text-emerald-900" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
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
                <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase mt-1">Tu Espacio Privado</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {/* Nav links removed for a cleaner, personal feel */}
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
                <Heart className="w-4 h-4 text-rose-500 animate-pulse-heart fill-current" />
                <span className="text-xs font-black text-[#1B4D3E] tracking-widest uppercase">Para ti, de parte de Gael</span>
              </div>

              <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black text-slate-900 leading-[0.85] tracking-tighter animate-fade-in-up">
                Gael<span className="text-rose-400">.</span><br/>
                <span className="text-[#1B4D3E]">Validación</span><br/>
                <span className="text-slate-300">Con Amor.</span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-500 leading-relaxed max-w-xl animate-fade-in-up stagger-1">
                La herramienta de bachillerato diseñada <span className="text-[#1B4D3E] font-bold italic">exclusivamente</span> para mamás. Logra tu meta sin sacrificar un solo segundo con tu bebé.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 animate-fade-in-up stagger-2">
                <button 
                  onClick={onLogin}
                  className="w-full sm:w-auto px-10 py-6 bg-[#1B4D3E] text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-emerald-200 hover:bg-[#2D7A5F] transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                  Entrar a Mi Cuenta
                  <ArrowRight className="w-6 h-6 text-rose-300" />
                </button>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 bg-emerald-50 px-5 py-3 rounded-full border border-emerald-100">
                        <Baby className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-800">100% Manos Libres</span>
                    </div>
                </div>
              </div>
           </div>

           {/* Visual Showcase */}
           <div className="relative animate-float-slow">
              <div className="aspect-[4/5] bg-gradient-to-br from-emerald-100 via-white to-rose-50 rounded-[4rem] shadow-2xl relative overflow-hidden border-[16px] border-white">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                 
                 <div className="absolute inset-0 flex items-center justify-center">
                     <div className="relative">
                        <Baby className="w-48 h-48 text-emerald-200/50" />
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-100 rounded-full blur-2xl opacity-60"></div>
                     </div>
                 </div>

                 {/* Interactive UI Overlays */}
                 <div className="absolute top-10 left-10 right-10 flex flex-col gap-4">
                    <div className="glass-card-luxe p-5 rounded-3xl border-luxe flex items-center gap-4 animate-fade-in-up">
                        <div className="w-10 h-10 rounded-full bg-rose-400 flex items-center justify-center">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-xs">
                            <p className="font-black text-slate-800 uppercase tracking-tighter">Lina te escucha...</p>
                            <p className="text-slate-500 font-medium italic">"Explícame esto, Lina"</p>
                        </div>
                    </div>
                    <div className="glass-card-luxe p-5 rounded-3xl border-luxe flex items-center gap-4 self-end bg-[#1B4D3E] border-none shadow-emerald-900/10 animate-fade-in-up stagger-1">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-xs text-white">
                            <p className="font-black uppercase tracking-tighter opacity-70">Lina responde</p>
                            <p className="font-medium">"Claro Danna, escucha..."</p>
                        </div>
                    </div>
                 </div>

                 <div className="absolute bottom-10 left-10 flex items-center gap-3 glass-card-luxe p-4 rounded-full border-luxe">
                     <Heart className="w-4 h-4 text-rose-500 fill-current" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#1B4D3E]">Hecho para Danna & Gael</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ─── The Socratic Advantage — PERSONALIZED ─── */}
      <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
           <div className="max-w-3xl mb-24">
              <div className="w-16 h-1 bg-rose-500 mb-8" />
              <h2 className="text-4xl sm:text-6xl font-black mb-8 leading-tight">No estás sola.<br/><span className="text-emerald-400 italic">Lina es tu mentora.</span></h2>
              <p className="text-xl text-slate-400 leading-relaxed">Olvídate de clases aburridas de 2 horas. Aquí aprendes en mini-sesiones de 5 minutos mientras tu bebé duerme o juega a tu lado.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <MessageCircle/>, title: "Habla con Voz", desc: "No necesitas escribir. Cuéntale tus dudas a Lina como si fuera una amiga." },
                { icon: <Smartphone/>, title: "En tu Celular", desc: "Desde la cama, el sofá o el parque. Academia Gael va contigo siempre." },
                { icon: <Lightbulb/>, title: "Paso a Paso", desc: "Lina te explica todo de forma sencilla, socrática y amorosa." }
              ].map((f, i) => (
                <div key={i} className="p-10 rounded-[3rem] bg-indigo-50/5 border border-white/5 hover:bg-white/10 transition-all group">
                   <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-all">
                      {React.cloneElement(f.icon as React.ReactElement, { className: "w-8 h-8" })}
                   </div>
                   <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                   <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ─── Proof & Confidence — EMOTIONAL ─── */}
      <section className="py-40 bg-[#FDFEFC] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col lg:flex-row gap-24 items-center">
              <div className="flex-1 space-y-12 animate-fade-in-up">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-100 mb-2">
                    <Heart className="w-4 h-4 text-rose-500 fill-current" />
                    <span className="text-[10px] font-black text-rose-700 tracking-widest uppercase">Tu Futuro</span>
                 </div>
                 <h2 className="text-6xl sm:text-7xl font-black text-slate-900 leading-[0.85] tracking-tighter">
                   Tu título es un<br/>
                   <span className="text-rose-400 italic">regalo</span> para<br/>
                   toda la vida.
                 </h2>
                 
                 <div className="grid grid-cols-1 gap-4">
                    {[
                      { t: "Estudia mientras amamantas", c: "bg-emerald-50 text-emerald-700" },
                      { t: "Clases cortas de 5 minutos", c: "bg-blue-50 text-blue-700" },
                      { t: "Acompañamiento por voz 24/7", c: "bg-rose-50 text-rose-700" }
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center gap-5 p-6 rounded-[2rem] ${item.c} border border-white shadow-cute transform hover:scale-[1.02] transition-all`}>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg">{item.t}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex-1 relative">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* Story Card 1 */}
                    <div className="space-y-8 animate-float">
                        <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden border-8 border-white shadow-2xl relative group">
                            <img 
                                src="/images/studying_mom_baby_gael.png" 
                                alt="Mamá estudiando" 
                                className="w-full h-full object-cover"
                                onError={(e) => (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544126592-807daa215a05?auto=format&fit=crop&q=80&w=800'}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent flex flex-col justify-end p-8 text-white">
                                <p className="font-black text-2xl leading-tight">Por su futuro.</p>
                                <p className="text-emerald-200 text-sm mt-2">Danna & Gael</p>
                            </div>
                        </div>
                        <div className="p-8 bg-white rounded-[2.5rem] shadow-cute border border-emerald-50">
                             <Quote className="w-8 h-8 text-rose-100 mb-4 fill-current" />
                             <p className="text-slate-600 font-medium italic">"Esto es para ti, para que te sientas orgullosa de lo que puedes lograr."</p>
                        </div>
                    </div>

                    {/* Story Card 2 */}
                    <div className="space-y-8 animate-float pt-16" style={{ animationDelay: '1.5s' }}>
                        <div className="p-8 bg-[#1B4D3E] text-white rounded-[2.5rem] shadow-2xl border-l-8 border-rose-400">
                             <Stars className="w-10 h-10 text-rose-300 mb-6 fill-current animate-sparkle" />
                             <h3 className="text-2xl font-black mb-4">Todo a tu ritmo</h3>
                             <p className="text-emerald-100/80 text-sm leading-relaxed">Sin presiones. Sin horarios. Solo tú, Gael y tus sueños.</p>
                        </div>
                        <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden border-8 border-white shadow-2xl relative group">
                            <img 
                                src="/images/graduation_success_academy_gael.png" 
                                alt="Graduación exitosa" 
                                className="w-full h-full object-cover"
                                onError={(e) => (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800'}
                            />
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ─── Final Invitation — PERSONAL ─── */}
      <section className="py-40 bg-rose-50/20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
           <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-rose-100 shadow-sm animate-bounce-soft">
              <Stars className="w-5 h-5 text-rose-400 fill-current" />
              <span className="text-xs font-black text-rose-600 tracking-widest uppercase">Tu Portal Privado</span>
           </div>
           
           <h2 className="text-6xl sm:text-8xl font-black text-[#1B4D3E] leading-[0.8] tracking-tighter">
             Empieza tu<br/>
             <span className="text-rose-400">gran sueño.</span>
           </h2>

           <p className="text-xl text-slate-500 max-w-xl mx-auto">
             Entra a tu cuenta y comienza este camino hoy mismo. Estamos felices de tenerte aquí.
           </p>

           <button 
             onClick={onLogin}
             className="px-16 py-8 bg-[#1B4D3E] text-white rounded-full font-black text-2xl shadow-[0_20px_60px_-15px_rgba(27,77,62,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 mx-auto border-b-8 border-[#143A2F]"
           >
              ENTRAR AHORA
              <ArrowRight className="w-8 h-8 text-rose-300" />
           </button>
        </div>
      </section>
      
      <footer className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
             <Heart className="w-8 h-8 text-rose-400 fill-current animate-pulse-heart" />
          </div>
          <p className="text-xs font-black uppercase text-slate-300 tracking-widest">Academia Gael &bull; Hecho con Amor</p>
        </div>
      </footer>
    </div>
  );
};
