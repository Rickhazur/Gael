
import React from 'react';
import { Brain, Sparkles, Coins, Zap, ShieldCheck, ArrowRight, Video, Palette, GraduationCap, CheckCircle2, Play, BookOpen, Globe, Mail, BarChart3, TrendingUp, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContactModal from './ContactModal';

interface LandingPageProps {
    onLogin: (mode: 'STUDENT' | 'ADMIN' | 'PARENT') => void;
    onEnterIcfes?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onEnterIcfes }) => {
    const [isContactOpen, setIsContactOpen] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-white font-poppins selection:bg-elite-blue selection:text-white overflow-x-hidden" role="document">
            <ContactModal isOpen={isContactOpen} onOpenChange={setIsContactOpen} />

            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-elite-blue/5 rounded-full blur-3xl animate-blob opacity-50"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-elite-purple/5 rounded-full blur-3xl animate-blob animation-delay-2000 opacity-50"></div>
                <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-elite-cyan/10 rounded-full blur-3xl animate-blob animation-delay-4000 opacity-50"></div>
            </div>

            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer group">
                        <div className="w-10 h-10 bg-gradient-elite rounded-xl flex items-center justify-center shadow-lg shadow-elite-blue/20 group-hover:scale-105 transition-all">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-elite-dark to-elite-blue">
                            Nova Schola
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        {[
                            { label: 'Cómo Funciona', href: '#features' },
                            { label: 'Módulos', href: '#modules' },
                            { label: 'Precios', href: '#pricing' },
                            { label: 'Contacto', href: 'mailto:novaschola25@gmail.com' }
                        ].map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="text-sm font-medium text-gray-600 hover:text-elite-blue transition-colors relative group"
                            >
                                {item.label}
                                <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-elite-blue transition-all group-hover:w-full"></span>
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onLogin('STUDENT')}
                            className="hidden md:block text-sm font-semibold text-elite-blue hover:text-elite-indigo transition-colors"
                        >
                            Iniciar Sesión
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden text-slate-600 hover:text-elite-blue transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl py-6 px-6 flex flex-col gap-6 animate-in slide-in-from-top-4">
                        <nav className="flex flex-col gap-4">
                            {[
                                { label: 'Cómo Funciona', href: '#features' },
                                { label: 'Módulos', href: '#modules' },
                                { label: 'Precios', href: '#pricing' },
                                { label: 'Contacto', href: 'mailto:rickhazur@gmail.com' }
                            ].map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={(e) => {
                                        if (item.label === 'Contacto') {
                                            e.preventDefault();
                                            setIsContactOpen(true);
                                        }
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="text-lg font-medium text-gray-600 hover:text-elite-blue transition-colors"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                        <hr className="border-gray-100" />
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    onLogin('STUDENT');
                                }}
                                className="w-full h-12 bg-elite-blue text-white font-bold rounded-xl"
                            >
                                Iniciar Sesión
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    localStorage.setItem('nova_demo_mode', 'true');
                                    setIsMobileMenuOpen(false);
                                    onLogin('STUDENT');
                                }}
                                className="w-full h-12 border-2 border-elite-blue text-elite-blue font-bold rounded-xl"
                            >
                                Ver Demo
                            </Button>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content Landmark for Accessibility */}
            <main id="main-content">

                {/* Hero Section */}
                <section className="relative pt-24 pb-12 lg:pt-48 lg:pb-32 z-10">
                    <div className="container mx-auto px-6 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-elite-purple/5 border border-elite-purple/10 mb-8 animate-fade-in-up shadow-sm">
                            <Sparkles className="w-4 h-4 text-elite-purple" />
                            <span className="text-xs sm:text-sm font-medium text-elite-purple text-left sm:text-center">¡La revolución bilingüe ha llegado para transformar tu aprendizaje!</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-elite-dark tracking-tight mb-6 lg:mb-8 leading-[1.1]">
                            La Mejor Primaria <br className="hidden sm:block" />
                            <span className="bg-clip-text text-transparent bg-gradient-cyan block sm:inline mt-2 sm:mt-0">Bilingüe desde Casa</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium px-2">
                            Tutoría impulsada por IA especializada en niños de 1° a 5°, inmersión bilingüe total y el mapa al éxito escolar garantizado. <strong>Bienvenidos al futuro de la educación básica.</strong>
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 w-full max-w-md sm:max-w-none mx-auto">
                            <Button
                                onClick={() => {
                                    localStorage.setItem('nova_demo_mode', 'true');
                                    onLogin('STUDENT');
                                }}
                                className="w-full sm:w-auto h-14 px-8 sm:px-10 bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-bold rounded-full text-lg sm:text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all group active:scale-95"
                            >
                                <Play className="mr-3 w-5 h-5 sm:w-6 sm:h-6 fill-white group-hover:scale-110 transition-transform" />
                                Probar Demo
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto h-14 px-8 sm:px-10 border-2 border-gray-200 text-gray-700 font-bold rounded-full text-lg hover:bg-gray-50 hover:border-elite-blue/30 transition-all active:scale-95"
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Ver Características
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500 mb-16">
                            ✅ Integración LMS • ✅ Escaneo de Evaluaciones • ✅ Soporte Pedagógico
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-12 text-sm font-medium text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-teal-600" aria-hidden="true" />
                                Alineación Curricular Exacta
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-teal-600" aria-hidden="true" />
                                Reportes Docentes Automatizados
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-teal-600" aria-hidden="true" />
                                Innovación Bilingüe (CLIL)
                            </div>
                        </div>
                    </div>
                </section>


                {/* Main Modules Grid */}
                <section id="modules" className="relative z-20 container mx-auto px-6 mt-8 sm:-mt-10 lg:-mt-24 mb-24" aria-labelledby="modules-heading">
                    <h2 id="modules-heading" className="sr-only">Módulos Principales</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Module 1: Research */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-white hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-50 rounded-bl-[2rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-4 shadow-sm">
                                    <BookOpen className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-2">Research Center 🌌</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Investiga desde una <strong>estación espacial interactiva</strong> con asteroides realistas. <strong>📸 Captura tu tarea</strong> con la cámara - la IA extrae el texto automáticamente. Buscador seguro y cuaderno inteligente.
                                </p>
                            </div>
                        </div>

                        {/* Module 2: Arena */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-white hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-[2rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4 shadow-sm">
                                    <Sparkles className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-2">Arena Gamer</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Misiones sincronizadas: <strong>DBA (Colombia) + IB (International Baccalaureate)</strong>. Gana 'Nova Coins' completando retos globales.
                                </p>
                            </div>
                        </div>

                        {/* Module 3: Tutor */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-white hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-bl-[2rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4 shadow-sm">
                                    <Brain className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-2">Tutoras Especializadas 🗣️</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    <strong>Miss Lina</strong> enseña Matemáticas en <strong>español</strong> con calidez local, mientras que <strong>Miss Rachelle</strong> lidera la inmersión en <strong>inglés</strong> académico. Dos profesoras, un solo ecosistema bilingüe.
                                </p>
                            </div>
                        </div>

                        {/* Module 4: Parents */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-white hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-[2rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4 shadow-sm">
                                    <GraduationCap className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-2">Nova Family</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Control total para padres. Otorga premios reales, asigna tareas del hogar y monitorea el progreso académico semanal.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* NEW: Teacher Reports Section */}
                <section id="features" className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
                    <div className="container mx-auto px-6 relative z-10">
                        {/* Badge */}
                        <div className="text-center mb-12">
                            <div className="inline-block px-4 py-2 rounded-full bg-green-100 border border-green-200 mb-6 animate-pulse">
                                <span className="text-xs font-black text-green-700 uppercase tracking-widest">✨ Tranquilidad Total</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-elite-dark mb-6 tracking-tight leading-tight">
                                Reportes que celebran el <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 block sm:inline">Éxito Académico</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                La <strong>única plataforma</strong> que une a la Familia y el Colegio con reportes detallados que impulsan el crecimiento de cada estudiante.
                            </p>
                        </div>


                        {/* Features Grid */}
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Feature 1 */}
                            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 hover:-translate-y-2 transition-all duration-300">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                                    <Mail className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Reportes Semanales</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Email automático cada viernes con progreso detallado, fortalezas y áreas de mejora de cada estudiante.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 hover:-translate-y-2 transition-all duration-300">
                                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                                    <BarChart3 className="w-8 h-8 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Datos Precisos</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Identifica automáticamente qué estudiantes necesitan refuerzo y en qué temas específicos.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 hover:-translate-y-2 transition-all duration-300">
                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                                    <TrendingUp className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Recomendaciones IA</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Sugerencias personalizadas generadas con inteligencia artificial para cada estudiante.
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="text-center mt-16">
                            <Button
                                onClick={() => {
                                    localStorage.setItem('nova_demo_mode', 'true');
                                    onLogin('STUDENT');
                                }}
                                className="h-14 px-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full text-lg shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:scale-105 transition-all"
                            >
                                Probar Demo Interactiva Ahora
                            </Button>
                            <p className="text-sm text-gray-500 mt-4">
                                Únete a los colegios que ya usan Nova Schola
                            </p>
                        </div>
                    </div>
                </section>

                {/* Pricing Comparison Section */}
                <section id="pricing" className="py-20 lg:py-32 bg-white relative overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl lg:text-5xl font-extrabold text-elite-dark mb-4 drop-shadow-sm">
                                Excelencia en <span className="text-blue-600">Primaria</span>
                            </h2>
                            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
                                Construimos las bases del bilingüismo y el pensamiento lógico durante los años más importantes del aprendizaje.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                            {/* Traditional Tutoring Card */}
                            <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl opacity-60 transform hover:scale-[1.01] transition-all">
                                <h3 className="text-2xl font-bold text-gray-400 mb-6 uppercase tracking-widest text-center">Tutoría Privada</h3>
                                <div className="text-center mb-8">
                                    <span className="text-5xl font-light text-gray-400">$450,000</span>
                                    <span className="text-gray-400 text-lg"> /mes</span>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center gap-3 text-gray-400 font-medium">
                                        <X className="w-5 h-5 text-gray-300" /> 2-3 horas por semana solamente
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-400 font-medium">
                                        <X className="w-5 h-5 text-gray-300" /> Sin soporte inmediato 24/7
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-400 font-medium">
                                        <X className="w-5 h-5 text-gray-300" /> Dependencia de horarios ajenos
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-400 font-medium">
                                        <X className="w-5 h-5 text-gray-300" /> Sin reportes por email detallados
                                    </li>
                                </ul>
                            </div>

                            {/* Nova Schola Card */}
                            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-8 lg:p-12 rounded-[3.5rem] shadow-[0_20px_50px_rgba(37,_99,_235,_0.3)] relative overflow-hidden transform hover:scale-105 transition-all duration-500 border-4 border-blue-400/20">
                                <div className="absolute top-0 right-0 p-8">
                                    <Zap className="w-16 h-16 text-white/10 animate-pulse" />
                                </div>

                                <div className="absolute top-6 left-6">
                                    <div className="px-4 py-1.5 bg-blue-500/20 rounded-full border border-blue-400/30 backdrop-blur-md">
                                        <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em]">Más Inteligente</span>
                                    </div>
                                </div>

                                <h3 className="text-3xl font-black text-white mb-8 mt-4 uppercase tracking-widest text-center">Nova Schola AI</h3>
                                <div className="text-center mb-10">
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl text-blue-300 line-through font-bold opacity-60 mb-2">$450,000</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-7xl font-black text-white">$49,900</span>
                                            <span className="text-blue-100 text-xl font-bold">/mes</span>
                                        </div>
                                    </div>
                                </div>

                                <ul className="space-y-6 mb-12">
                                    <li className="flex items-center gap-4 text-white font-bold group">
                                        <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center border border-green-400/30">
                                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        </div>
                                        <span>Acceso <span className="text-green-300">ILIMITADO 24/7</span></span>
                                    </li>
                                    <li className="flex items-center gap-4 text-white font-bold">
                                        <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center border border-green-400/30">
                                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        </div>
                                        <span>Tutoría Bilingüe Instantánea</span>
                                    </li>
                                    <li className="flex items-center gap-4 text-white font-bold">
                                        <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center border border-green-400/30">
                                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        </div>
                                        <span>Reportes por Email Automáticos</span>
                                    </li>
                                    <li className="flex items-center gap-4 text-white font-bold">
                                        <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center border border-green-400/30">
                                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        </div>
                                        <span>Gamificación y Motivación Real</span>
                                    </li>
                                </ul>

                                <Button
                                    onClick={() => onLogin('PARENT')}
                                    className="w-full h-16 bg-white text-blue-800 hover:bg-blue-50 font-black text-2xl rounded-[2rem] shadow-2xl transition-all active:scale-95 border-b-4 border-blue-200"
                                >
                                    ¡7 Días Gratis Ahora!
                                </Button>
                                <p className="text-center text-white/80 text-[10px] mt-2 font-bold uppercase tracking-wider">Sin tarjeta de crédito requerida</p>
                                <div className="text-center mt-6">
                                    <span className="px-4 py-1 bg-white/10 rounded-full text-blue-100 text-xs font-bold italic border border-white/5">
                                        90% más económico que un tutor tradicional
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Impact Section: The Connected Bilingual Brain */}
                <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden border-y border-gray-100">
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="max-w-4xl mx-auto text-center mb-12 lg:mb-20">
                            <div className="inline-block px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">
                                Metodología Internacional CLIL
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-elite-dark mb-6 tracking-tight leading-tight">
                                Más que apps separadas, un <span className="bg-clip-text text-transparent bg-gradient-cyan block sm:inline">Ecosistema Vivo</span>
                            </h2>
                            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                                En un entorno bilingüe de alto nivel, el inglés no es un fin, es el medio.
                                Nuestra IA conecta el lenguaje con el contenido STEM para un aprendizaje real.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8 items-center">
                            {/* Research Center Impact */}
                            <div className="space-y-6 lg:text-left order-2 lg:order-1">
                                <div className="p-8 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:bg-white hover:border-teal-300 transition-all group">
                                    <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto lg:mr-auto lg:ml-0 group-hover:scale-110 transition-transform shadow-lg shadow-teal-500/20">
                                        <BookOpen className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Research Center 🌌</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        Investiga en una <strong>estación espacial con asteroides 3D</strong>. <strong>📸 Captura fotos de tus tareas</strong> y la IA extrae el texto automáticamente. Enseñamos a investigar, no a copiar, <strong>construyendo ideas propias</strong> desde 1º de primaria.
                                    </p>
                                </div>
                            </div>

                            {/* Central Visual: The Hub */}
                            <div className="relative flex justify-center order-1 lg:order-2">
                                <div className="w-64 h-64 lg:w-72 lg:h-72 bg-gradient-to-br from-elite-blue via-elite-indigo to-elite-purple rounded-full flex items-center justify-center p-1.5 shadow-2xl shadow-elite-indigo/20 animate-pulse-slow">
                                    <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center p-8 text-center ring-4 ring-white/50">
                                        <Zap className="w-10 h-10 text-elite-blue mb-3" />
                                        <span className="text-xs font-black text-elite-dark uppercase tracking-widest">
                                            HUB DE IA SINCRO
                                        </span>
                                        <div className="h-px w-8 bg-gray-100 my-4"></div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Sincronización DBA + IB</p>
                                    </div>
                                </div>

                                {/* Decorative Blobs */}
                                <div className="absolute inset-0 bg-elite-blue/5 blur-3xl rounded-full -z-10 animate-blob"></div>
                            </div>

                            {/* English Integration Impact */}
                            <div className="space-y-6 lg:text-left order-3 lg:order-3">
                                <div className="p-8 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:bg-white hover:border-indigo-300 transition-all group">
                                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto lg:mr-auto lg:ml-0 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-600/20">
                                        <Globe className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Inglés Integrado (CLIL) 🗣️</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        <strong>Rachelle</strong> sabe qué aprendió tu hijo en Matemáticas y Ciencias. Introduce <strong>vocabulario académico</strong> en cada conversación, corrige con explicaciones y conecta el inglés con el contenido STEM, preparando ciudadanos globales.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16 lg:py-20 bg-gray-50/50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12 lg:mb-16">
                            <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4">
                                Experiencia Nova Schola Elementary
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-elite-dark">
                                Todo lo que <span className="text-blue-700">tu hijo</span> necesita
                            </h2>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Student Experience Card */}
                            <div className="bg-[#FFFDF5] p-6 lg:p-12 rounded-[2.5rem] border border-orange-100 relative overflow-hidden group hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                                <div className="w-14 h-14 bg-orange-400 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-orange-400/30 text-white">
                                    <Palette className="w-7 h-7" />
                                </div>

                                <h3 className="text-3xl font-bold text-gray-900 mb-2">Para el Estudiante</h3>
                                <p className="text-orange-700 font-medium mb-6">Aprendizaje Mágico y Poderoso</p>

                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    Un entorno interactivo donde las matemáticas se dibujan y los conceptos se conversan.
                                    Nuestra IA interconectada sabe qué aprendió tu hijo en matemáticas para reforzarlo mientras practica inglés.
                                </p>

                                <div className="space-y-4 mb-8">
                                    {[
                                        '100% Cobertura de currículo Primaria',
                                        'Investigación: Estación Espacial + Cámara IA',
                                        'Escanear Evaluación para detectar debilidades',
                                        'Miss Lina: Matemáticas en Español',
                                        'Miss Rachelle: Inmersión Académica en Inglés',
                                        'Misiones auto-sincronizadas (Google Classroom)'
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <span className="text-gray-700 font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => onLogin('STUDENT')}
                                    className="w-full h-12 bg-gradient-orange hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20"
                                >
                                    Iniciar Mi Aventura
                                </Button>
                            </div>

                            {/* Parent/Admin Experience Card */}
                            <div className="bg-white p-6 lg:p-12 rounded-[2.5rem] border border-indigo-50 relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                                <div className="w-14 h-14 bg-elite-blue rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-elite-blue/30 text-white">
                                    <GraduationCap className="w-7 h-7" />
                                </div>

                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Para los Padres</h3>
                                <p className="text-elite-blue font-medium mb-6">Tranquilidad y Control Total</p>

                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    Supervisa el progreso de tu hijo y motiva su esfuerzo con nuestro nuevo Panel de Padres.
                                    Otorga coins por tareas del mundo real, gestiona premios personalizados y celebra cada logro juntos.
                                </p>

                                <div className="space-y-4 mb-8">
                                    {[
                                        'Gestión de Coins y Premios reales',
                                        'Monitoreo de progreso en tiempo real',
                                        'Sugerencias de refuerzo inteligente',
                                        'Panel de recompensas personalizadas',
                                        'Visibilidad de tareas Google Classroom',
                                        'Navegación Web Segura (Filtro de Contenido)'
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-elite-blue">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <span className="text-gray-700 font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => onLogin('PARENT')}
                                    variant="outline"
                                    className="w-full h-12 border-2 border-elite-blue/20 text-elite-blue font-bold rounded-xl hover:bg-elite-blue hover:text-white transition-all"
                                >
                                    Acceder como Padre
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>


            </main>

            {/* Footer */}
            <footer className="bg-white py-12 border-t border-gray-100">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-gray-500 text-sm mb-4">© 2025 Nova Schola AI Academy. Todos los derechos reservados.</p>

                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
