import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Target, Brain, TrendingUp, Clock, Star, Shield,
  ChevronRight, CheckCircle2, Users, Smartphone, Zap, Award
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
    <div className="min-h-screen bg-[#FAFAF8] overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100" id="nav-main">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B4D3E] to-[#2D7A5F] flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-lg text-slate-800">Academia <span className="text-[#1B4D3E]">Gael</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onLogin}
              className="text-sm font-semibold text-slate-600 hover:text-[#1B4D3E] transition-colors px-4 py-2"
              id="btn-login"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={onStart}
              className="nova-btn-primary text-sm !py-2.5 !px-5 !min-h-0 rounded-xl"
              id="btn-start-hero"
            >
              Empezar Gratis
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 relative" id="hero-section">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/30 to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-6 animate-fade-in-up">
            <span className="w-2 h-2 bg-[#059669] rounded-full animate-pulse-gentle" />
            <span className="text-sm font-medium text-[#1B4D3E]">100% gratis — Sin tarjeta de crédito</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1] animate-fade-in-up stagger-1">
            Gael.
          </h1>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1B4D3E] tracking-tight mb-6 leading-[1.1] animate-fade-in-up stagger-1">
            Tu bachillerato SIN descuidar a tu bebé.
          </h2>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up stagger-2">
            La mejor herramienta diseñada para mamás. Prepárate para validar tu bachillerato usando el <strong>micrófono</strong> libres de manos, tutoría por voz interactiva, y clases diseñadas de 5 minutos.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up stagger-3">
            <button 
              onClick={onStart}
              className="nova-btn nova-btn-primary text-lg !px-10 !py-4 rounded-2xl w-full sm:w-auto"
              id="btn-cta-main"
            >
              Empezar Mi Preparación
              <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={onLogin}
              className="nova-btn nova-btn-secondary text-lg !px-8 !py-4 rounded-2xl w-full sm:w-auto"
              id="btn-cta-login"
            >
              Ya tengo cuenta
            </button>
          </div>

          {/* Trust badges */}
          <div className={`flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 transition-all duration-700 ${visibleStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1B4D3E]" />
              <span>+2.500 estudiantes</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#F5A623]" />
              <span>4.8/5 satisfacción</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#3B82F6]" />
              <span>Formato ICFES real</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Exam Info Card ─── */}
      <section className="px-4 pb-16 sm:pb-24" id="exam-info">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#1B4D3E] to-[#2D7A5F] p-6 sm:p-8 text-white">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">¿Qué es el examen ICFES de validación?</h2>
              <p className="text-emerald-100 text-sm sm:text-base">
                Es tu camino para obtener el título de bachiller. Apruebas con <strong>30 puntos</strong> y nosotros te ayudamos a llegar.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-slate-100">
              {[
                { icon: "📖", name: "Lectura Crítica", color: "bg-violet-50 text-violet-700" },
                { icon: "🔢", name: "Matemáticas", color: "bg-blue-50 text-blue-700" },
                { icon: "🏛️", name: "Sociales", color: "bg-amber-50 text-amber-700" },
                { icon: "🔬", name: "Ciencias", color: "bg-emerald-50 text-emerald-700" },
                { icon: "🇬🇧", name: "Inglés", color: "bg-red-50 text-red-700" },
              ].map((area, i) => (
                <div key={i} className="p-4 sm:p-6 text-center">
                  <span className="text-2xl mb-2 block">{area.icon}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${area.color}`}>{area.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it Works ─── */}
      <section className="px-4 pb-16 sm:pb-24 bg-white" id="how-it-works">
        <div className="max-w-5xl mx-auto py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">¿Cómo funciona?</h2>
            <p className="text-slate-500 text-lg">3 pasos. Sin complicaciones.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: <Brain className="w-8 h-8" />,
                title: "Diagnóstico Inteligente",
                desc: "Respondemos 15 preguntas rápidas para conocer tu nivel real. Sin presión, sin cronómetro.",
                color: "from-violet-500 to-purple-600"
              },
              {
                step: "2",
                icon: <Target className="w-8 h-8" />,
                title: "Tu Ruta Personalizada",
                desc: "Micro-cápsulas de 5 minutos cuando tu bebé duerme. No hay presión, no hay horarios que seguir.",
                color: "from-[#1B4D3E] to-[#2D7A5F]"
              },
              {
                step: "3",
                icon: <Award className="w-8 h-8" />,
                title: "Simulacros Reales",
                desc: "Practica con exámenes idénticos al ICFES real. Si fallas, un tutor con IA te explica paso a paso.",
                color: "from-[#F5A623] to-orange-500"
              }
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="nova-card p-8 h-full hover:scale-[1.02] transition-transform">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-5 shadow-lg`}>
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Paso {item.step}</div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="px-4 pb-16 sm:pb-24" id="features">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Todo lo que necesitas, mamá</h2>
            <p className="text-slate-500 text-lg">Sabemos lo difícil que es encontrar tiempo.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Clock className="w-6 h-6" />, title: "Cápsulas de 5 minutos", desc: "Lecciones cortas que alcanzas a hacer cuando hay un respiro en casa.", color: "text-blue-600 bg-blue-50" },
              { icon: <Brain className="w-6 h-6" />, title: "Tutor con voz y micrófono", desc: "Puedes hablar con la Profe Lina y escuchar sus respuestas sin usar las manos.", color: "text-violet-600 bg-violet-50" },
              { icon: <Smartphone className="w-6 h-6" />, title: "Funciona en el celular", desc: "No necesitas un PC de escritorio. Estudia mientras caminas o amamantas.", color: "text-emerald-600 bg-emerald-50" },
              { icon: <TrendingUp className="w-6 h-6" />, title: "Socrático", desc: "Entrenamiento directo, al grano y enfocado solo en el examen.", color: "text-orange-600 bg-orange-50" },
              { icon: <Zap className="w-6 h-6" />, title: "Sin Estrés", desc: "Tu progreso se guarda automáticamente cada segundo.", color: "text-yellow-600 bg-yellow-50" },
              { icon: <BookOpen className="w-6 h-6" />, title: "Rachas Diarias", desc: "Mantén tu mente activa conectándote al menos un ratito al día.", color: "text-pink-600 bg-pink-50" },
            ].map((feat, i) => (
              <div key={i} className="nova-card p-6 flex gap-4 items-start">
                <div className={`p-3 rounded-xl ${feat.color} shrink-0`}>
                  {feat.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">{feat.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="px-4 pb-16 sm:pb-24 bg-white" id="testimonials">
        <div className="max-w-4xl mx-auto py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Historias reales</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Mariana T.",
                role: "Mamá de 2, 28 años",
                text: "Es lo máximo poder escuchar a la profesora Lina y hablarle por el celular mientras cambio pañales. Es la única forma en la que he podido retomar mi bachillerato.",
                avatar: "👩"
              },
              {
                name: "Yuliana G.",
                role: "Vendedora, 23 años",
                text: "Lo mejor es el tutor que te explica cuando te equivocas. No te hace sentir mal, te guía. Como tener una profe particular en el celular.",
                avatar: "👩"
              }
            ].map((t, i) => (
              <div key={i} className="nova-card p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">{t.avatar}</div>
                  <div>
                    <div className="font-bold text-slate-800">{t.name}</div>
                    <div className="text-sm text-slate-500">{t.role}</div>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed italic">"{t.text}"</p>
                <div className="flex gap-1 mt-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="px-4 pb-16 sm:pb-24" id="faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Preguntas frecuentes</h2>
          {[
            { q: "¿Realmente es gratis?", a: "Sí. La preparación básica, el diagnóstico y los simulacros son 100% gratis. No pedimos tarjeta de crédito." },
            { q: "¿Necesito computador?", a: "No. Funciona perfecto desde tu celular. Incluso funciona offline si descargas las lecciones con WiFi." },
            { q: "¿Cuánto tiempo necesito para prepararme?", a: "Con 15-30 minutos diarios, en 8-12 semanas estarás listo. Pero puedes ir a tu ritmo, sin presión." },
            { q: "¿Las preguntas son como las del examen real?", a: "Sí. Seguimos la estructura oficial del ICFES: selección múltiple con única respuesta en las 5 áreas." },
            { q: "¿Qué puntaje necesito para aprobar?", a: "Necesitas un puntaje total igual o superior a 30 puntos. Nuestra app te muestra tu puntaje estimado en tiempo real." }
          ].map((faq, i) => (
            <details key={i} className="nova-card mb-3 group">
              <summary className="p-5 cursor-pointer font-semibold text-slate-800 flex items-center justify-between list-none">
                {faq.q}
                <ChevronRight className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-5 pb-5 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="px-4 pb-16 sm:pb-24" id="final-cta">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-[#1B4D3E] to-[#143A2F] rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl shadow-emerald-900/20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Tu bachillerato empieza hoy</h2>
            <p className="text-emerald-200 text-lg mb-8 max-w-xl mx-auto">
              No importa cuánto tiempo haya pasado. Cada minuto que estudias te acerca a tu título.
            </p>
            <button 
              onClick={onStart}
              className="nova-btn nova-btn-accent text-lg !px-10 !py-4 rounded-2xl"
              id="btn-final-cta"
            >
              Empezar Mi Preparación Gratis
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-white border-t border-slate-100 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1B4D3E] to-[#2D7A5F] flex items-center justify-center">
              <span className="text-white font-bold text-xs">G</span>
            </div>
            <span className="font-bold text-slate-700">Academia Gael</span>
          </div>
          <p className="text-sm text-slate-500">
            Hecho con ❤️ en honor a Gael para todas las mamás hermosas y valientes.
          </p>
          <p className="text-xs text-slate-400 mt-2">© 2026 Academia Gael. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default ICFESLanding;
