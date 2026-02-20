import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewState, Language } from '@/types';
import { Trophy, Rocket, Gamepad2, BookOpen, Globe } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { useNovaSound } from '@/hooks/useNovaSound';
import { AvatarDisplay } from '../Gamification/AvatarDisplay';
import { FullCampusView } from './FullCampusView';
import { RocketLaunchOverlay } from '../Missions/RocketLaunchOverlay';
import { generateSpeech } from '@/services/edgeTTS';

interface NovaCityProps {
    onNavigate: (view: ViewState) => void;
    language: Language;
    userName: string;
    showFullCampus?: boolean; // For demo step 1
    onOpenPetPanel?: () => void;
}

export const NovaCampus: React.FC<NovaCityProps> = ({ onNavigate, language, userName, showFullCampus = false, onOpenPetPanel }) => {
    const { coins } = useGamification();
    const { playHover, playClick, playClassroomChatter } = useNovaSound();
    const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
    const [isLaunching, setIsLaunching] = useState(false);
    const [isStartingGame, setIsStartingGame] = useState(false);
    const [isStartingEnglish, setIsStartingEnglish] = useState(false);

    // Check for mobile screen
    const [isMobile, setIsMobile] = useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // MOBILE DEMO: Show full campus image only on small screens
    if (showFullCampus && isMobile) {
        return <FullCampusView language={language} userName={userName} />;
    }

    // --- HANDLERS ---
    const handleMissionsClick = () => {
        setIsLaunching(true);
        // Navigation is now handled by RocketLaunchOverlay's onComplete
    };

    const handleGamesClick = () => {
        setIsStartingGame(true);
        setTimeout(() => onNavigate(ViewState.ARENA), 3000);
    };

    const handleEnglishClick = async () => {
        setIsStartingEnglish(true);
        playClick();

        try {
            await generateSpeech("Welcome to the Language Lab!", "rachelle");
            await generateSpeech("¡Bienvenidos al centro de idiomas!", "lina");
        } catch (e) {
            console.warn("Transition audio error:", e);
        }

        onNavigate(ViewState.BUDDY_LEARN);
        setTimeout(() => setIsStartingEnglish(false), 1000);
    };

    return (
        // MOBILE: Flex Column Layout | DESKTOP: Fixed Absolute Layout
        <div className="
            relative w-full overflow-hidden bg-[#142438] font-nunito group select-none
            h-auto min-h-[120vh]
            lg:h-[85vh] lg:rounded-[2.5rem] lg:border lg:border-white/10 lg:shadow-[0_0_40px_rgba(20,36,56,0.6)]
        ">

            {/* 1. GALAXY CAMPUS BACKGROUND - Estilo cartoon: hub CPU, flujos de datos, plataformas asteroidales, galaxia espiral */}
            <div className="fixed inset-0 h-screen w-screen z-0 lg:absolute lg:inset-0 lg:h-full lg:w-full pointer-events-none overflow-hidden">
                <img
                    src="/assets/city/galaxy_campus_background.png?v=2"
                    alt="Galaxy Campus"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    loading="lazy"
                />
                {/* Estrellas titilando */}
                <div className="absolute inset-0" aria-hidden>
                    {[...Array(24)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-white"
                            style={{
                                left: `${8 + (i * 4) % 90}%`,
                                top: `${5 + (i * 7) % 85}%`,
                                animation: `starTwinkle ${1.5 + (i % 5) * 0.4}s ease-in-out infinite`,
                                animationDelay: `${(i * 0.15) % 2}s`,
                                boxShadow: '0 0 4px 1px rgba(255,255,255,0.8)',
                            }}
                        />
                    ))}
                </div>
                {/* Cometas cruzando */}
                <div className="absolute inset-0 overflow-hidden" aria-hidden>
                    <div
                        className="absolute w-2 h-2 rounded-full bg-white"
                        style={{
                            left: 0,
                            top: 0,
                            animation: 'cometPass 12s linear infinite',
                            boxShadow: '0 0 12px 4px rgba(255,255,255,0.9), 0 0 24px 8px rgba(34,211,238,0.5)',
                        }}
                    />
                    <div
                        className="absolute w-1.5 h-1.5 rounded-full bg-cyan-200"
                        style={{
                            left: 0,
                            top: '20%',
                            animation: 'cometPass 15s linear infinite',
                            animationDelay: '3s',
                            boxShadow: '0 0 10px 3px rgba(34,211,238,0.8)',
                        }}
                    />
                    <div
                        className="absolute w-1 h-1 rounded-full bg-white/90"
                        style={{
                            left: 0,
                            top: '45%',
                            animation: 'cometPass 18s linear infinite',
                            animationDelay: '7s',
                            boxShadow: '0 0 8px 2px rgba(255,255,255,0.7)',
                        }}
                    />
                    <div
                        className="absolute w-1.5 h-1.5 rounded-full bg-amber-200"
                        style={{
                            right: 0,
                            left: 'auto',
                            top: '15%',
                            animation: 'cometPassRev 14s linear infinite',
                            animationDelay: '5s',
                            boxShadow: '0 0 10px 3px rgba(251,191,36,0.7)',
                        }}
                    />
                </div>
                {/* Circuitos cargados de electricidad: centro de mando → edificios (solo desktop) */}
                <div className="hidden lg:block absolute inset-0 z-[1]" aria-hidden>
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(34,211,238,0.2)" />
                                <stop offset="50%" stopColor="rgba(34,211,238,0.9)" />
                                <stop offset="100%" stopColor="rgba(34,211,238,0.3)" />
                            </linearGradient>
                            <filter id="circuitGlow">
                                <feGaussianBlur stdDeviation="0.4" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Líneas del centro (55,50) a cada edificio */}
                        {[
                            { to: [24, 26], delay: 0 },    // Research
                            { to: [76, 24], delay: 0.3 },  // Arena
                            { to: [18, 72], delay: 0.6 },  // Math
                            { to: [80, 75], delay: 0.9 },  // English
                        ].map(({ to, delay }, i) => (
                            <g key={i}>
                                {/* Línea base con glow */}
                                <line x1="50" y1="55" x2={to[0]} y2={to[1]} stroke="url(#circuitGrad)" strokeWidth="0.35" strokeLinecap="round" filter="url(#circuitGlow)" opacity="0.85" className="animate-[electricityPulse_2.5s_ease-in-out_infinite]" style={{ animationDelay: `${delay}s` }} />
                                {/* Línea animada (electricidad fluyendo) */}
                                <line x1="50" y1="55" x2={to[0]} y2={to[1]} stroke="rgba(34,211,238,0.95)" strokeWidth="0.25" strokeLinecap="round" strokeDasharray="3 2" fill="none" className="animate-[electricityFlow_1.2s_linear_infinite]" style={{ animationDelay: `${delay}s`, filter: 'drop-shadow(0 0 2px rgba(34,211,238,0.9))' }} />
                            </g>
                        ))}
                        {/* Núcleo del centro de mando - brillo pulsante */}
                        <circle cx="50" cy="55" r="2.5" fill="rgba(34,211,238,0.4)" className="animate-[electricityPulse_1.5s_ease-in-out_infinite]" />
                        <circle cx="50" cy="55" r="1.2" fill="rgba(255,255,255,0.9)" className="animate-[electricityPulse_1s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }} />
                    </svg>
                </div>
            </div>

            {/* 2. MOBILE DASHBOARD: "NANO" PREMIUM EXPERIENCE - fondo galaxy visible sin recuadros */}
            <div className="relative z-10 w-full flex flex-col min-h-screen pb-32 lg:hidden font-nunito bg-transparent">

                {/* --- HEADER: PROFILE & STATUS --- */}
                <div className="w-full px-6 pt-12 pb-6 flex items-center justify-between z-20">
                    {/* User Avatar */}
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] bg-black/40 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-900/50 mix-blend-overlay" />
                            <AvatarDisplay size="md" showBackground={false} className="scale-125 translate-y-2" showName={true} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Cadete</span>
                            <span className="text-lg font-black text-white leading-none">{userName.split(' ')[0]}</span>
                        </div>
                    </div>

                    {/* Stats Pill */}
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1">
                                <span className="text-yellow-400 animate-pulse">🔥</span>
                                <span className="text-sm font-bold text-white">12</span>
                            </div>
                            <div className="w-24 h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '65%' }}
                                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- HERO: CURRENT MISSION CARD --- */}
                <div className="w-full px-4 mb-8 z-20">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-indigo-500/20"
                        onClick={() => { playClick(); handleMissionsClick(); }}
                    >
                        {/* Card Background */}
                        <div className="absolute inset-0 bg-indigo-950">
                            <img src="/assets/city/mission_control_3d.png" className="w-full h-full object-cover opacity-60 mix-blend-screen scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-900/50 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center text-center">
                            <div className="px-3 py-1 bg-indigo-500/30 border border-indigo-400/30 backdrop-blur-md rounded-full mb-3">
                                <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Rocket className="w-3 h-3" />
                                    Misión Activa
                                </span>
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2 leading-tight">
                                {language === 'es' ? "Operación Decimales" : "Operation Decimals"}
                            </h2>
                            <p className="text-indigo-200 text-sm mb-6 line-clamp-2">
                                {language === 'es' ? "Ayuda a Lina a recuperar los códigos numéricos perdidos." : "Help Lina recover the lost numerical codes."}
                            </p>

                            <button className="w-full py-4 bg-white text-indigo-950 font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2">
                                <Gamepad2 className="w-5 h-5" />
                                {language === 'es' ? "JUGAR AHORA" : "PLAY NOW"}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* --- GRID: QUICK TOOLS --- */}
                <div className="grid grid-cols-2 gap-4 px-4 pb-32 z-20">
                    <MobileFeatureCard
                        title={language === 'es' ? "Matemáticas" : "Math"}
                        icon="🧮"
                        color="from-blue-500 to-cyan-500"
                        onClick={() => onNavigate(ViewState.MATH_TUTOR)}
                        delay={0.1}
                    />
                    <MobileFeatureCard
                        title="English"
                        icon="🌍"
                        color="from-purple-500 to-pink-500"
                        onClick={handleEnglishClick}
                        delay={0.15}
                    />
                    <MobileFeatureCard
                        title={language === 'es' ? "Ciencias" : "Science"}
                        icon="🧬"
                        color="from-emerald-500 to-teal-500"
                        onClick={() => onNavigate(ViewState.RESEARCH_CENTER)}
                        delay={0.2}
                    />
                    <MobileFeatureCard
                        title="Arena"
                        icon="🏆"
                        color="from-orange-500 to-amber-500"
                        onClick={handleGamesClick}
                        delay={0.25}
                    />
                    {/* EXPANDED MODULES */}
                    <MobileFeatureCard
                        title={language === 'es' ? "Tienda" : "Store"}
                        icon="🛍️"
                        color="from-pink-500 to-rose-500"
                        onClick={() => onNavigate(ViewState.REWARDS)}
                        delay={0.3}
                    />
                    <MobileFeatureCard
                        title={language === 'es' ? "Cuadernos" : "Notebooks"}
                        icon="📚"
                        color="from-violet-500 to-indigo-500"
                        onClick={() => onNavigate(ViewState.NOTEBOOK_LIBRARY)}
                        delay={0.35}
                    />
                    <MobileFeatureCard
                        title={language === 'es' ? "Flashcards" : "Flashcards"}
                        icon="⚡"
                        color="from-yellow-400 to-amber-500"
                        onClick={() => onNavigate(ViewState.FLASHCARDS)}
                        delay={0.4}
                    />
                    <MobileFeatureCard
                        title={language === 'es' ? "Progreso" : "Progress"}
                        icon="📊"
                        color="from-cyan-500 to-blue-600"
                        onClick={() => onNavigate(ViewState.PROGRESS)}
                        delay={0.45}
                    />
                </div>

                {/* ATMOSPHERE PARTICLES */}
                <FloatingParticles />
            </div>


            {/* 3. DESKTOP LAYOUT: ABSOLUTE 3D MAP - La imagen de fondo ya incluye líneas y hub; edificios interactivos encima */}
            <div className="hidden lg:block absolute inset-0 z-10 perspective-[1000px]">
                {/* --- CENTER: MISSION CONTROL HQ (zona clickeable - el hub está en la imagen de fondo) --- */}
                <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                    <div
                        className="relative w-80 h-80 cursor-pointer group/hq rounded-full"
                        onMouseEnter={() => { playHover(); setHoveredDistrict('missions'); }}
                        onMouseLeave={() => setHoveredDistrict(null)}
                        onClick={() => { playClick(); handleMissionsClick(); }}
                    >
                        <div className="absolute inset-0 bg-cyan-500/0 group-hover/hq:bg-cyan-500/10 rounded-full transition-colors" />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 scale-0 group-hover/hq:scale-100 transition-transform duration-300">
                            <div className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full shadow-lg border border-amber-400/50">
                                <span className="text-sm font-black text-white uppercase tracking-widest text-shadow">
                                    MISSION BASE
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ARENA DE JUEGOS - Centro del asteroide superior derecho --- */}
                <Building3DDesktop
                    top="24%" left="76%"
                    width="w-[20rem]" height="h-[18rem]"
                    imgSrc={`/assets/city/campus_arena_asteroid.png?v=5`}
                    view={ViewState.ARENA}
                    label={{ es: "Arena de Juegos", en: "Game Arena" }}
                    onNavigate={handleGamesClick}
                    id="arena" hovered={hoveredDistrict} setHovered={setHoveredDistrict} language={language} floatDuration={4}
                    edgeDiffuse
                    blendWithBg
                    showSign
                    objectPosition="38% 38%"
                    signOffsetX="-25%"
                    imageOffsetX="20%"
                />

                {/* --- TORRE DE MATEMÁTICAS - Asteroide inferior izquierdo --- */}
                <Building3DDesktop
                    top="72%" left="18%"
                    width="w-[20rem]" height="h-[18rem]"
                    imgSrc={`/assets/city/campus_math_asteroid.png?v=1`}
                    view={ViewState.MATH_TUTOR}
                    label={{ es: "Torre de Matemáticas", en: "Math Tower" }}
                    onNavigate={onNavigate}
                    id="math" hovered={hoveredDistrict} setHovered={setHoveredDistrict} language={language} floatDuration={4}
                    edgeDiffuse
                    blendWithBg
                    showSign
                    objectPosition="50% 62%"
                />

                {/* --- CENTRO DE INVESTIGACIÓN (primer asteroide, blend integrado con galaxia) --- */}
                <Building3DDesktop
                    top="26%" left="24%"
                    width="w-[20rem]" height="h-[18rem]"
                    imgSrc={`/assets/city/campus_research_building.png?v=4`}
                    view={ViewState.RESEARCH_CENTER}
                    label={{ es: "Centro de Investigación", en: "Research Center" }}
                    onNavigate={onNavigate}
                    id="research" hovered={hoveredDistrict} setHovered={setHoveredDistrict} language={language} floatDuration={4}
                    edgeDiffuse
                    blendWithBg
                    showSign
                    objectPosition="50% 62%"
                />

                {/* --- SEGUNDO ASTEROIDE - Centro de Inglés en esquina inferior derecha --- */}
                <Building3DDesktop
                    top="75%" left="80%"
                    width="w-[20rem]" height="h-[18rem]"
                    imgSrc={`/assets/city/campus_asteroid_2.png?v=3`}
                    view={ViewState.BUDDY_LEARN}
                    label={{ es: "Centro de Lenguas", en: "Language Center" }}
                    onNavigate={handleEnglishClick}
                    id="english" hovered={hoveredDistrict} setHovered={setHoveredDistrict} language={language} floatDuration={4}
                    edgeDiffuse
                    blendWithBg
                    showSign
                    objectPosition="50% 62%"
                    signOffsetX="-25%"
                    imageOffsetX="20%"
                />

            </div>


            {/* 5. HUD TOP - Barra oscura con Nivel, Monedas, Cuaderno */}
            <div className="fixed lg:absolute top-4 left-4 z-50 flex gap-4 w-full pr-8 lg:pr-0 pointer-events-none">
                <motion.div
                    initial={{ y: -50 }} animate={{ y: 0 }}
                    className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-2 lg:p-3 pr-4 lg:pr-6 rounded-2xl shadow-2xl shadow-indigo-500/10 shrink-0 pointer-events-auto"
                >
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                        <Trophy className="w-4 h-4 lg:w-6 lg:h-6 text-white mb-0.5" />
                    </div>
                    <div className="hidden sm:block">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">NIVEL 5</div>
                        <div className="text-xl font-black text-white leading-none">Cadete</div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: -50 }} animate={{ y: 0 }} transition={{ delay: 0.1 }}
                    className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-xl border border-white/10 px-3 py-2 lg:px-4 lg:py-3 rounded-2xl shadow-lg shrink-0 pointer-events-auto"
                >
                    <span className="text-xl lg:text-2xl drop-shadow-md">🪙</span>
                    <span className="text-xl lg:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600">{coins}</span>
                </motion.div>

                {/* Notebook Button */}
                <motion.div
                    initial={{ y: -50 }} animate={{ y: 0 }} transition={{ delay: 0.2 }}
                    onClick={() => onNavigate(ViewState.NOTEBOOK_LIBRARY)}
                    className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-2 lg:p-3 pr-2 lg:pr-6 rounded-2xl shadow-2xl hover:bg-slate-800 transition-colors cursor-pointer group ml-auto lg:ml-0 pointer-events-auto"
                >
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <BookOpen className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                </motion.div>
            </div>

            {/* OVERLAYS */}
            <AnimatePresence>
                <RocketLaunchOverlay
                    isVisible={isLaunching}
                    onComplete={() => onNavigate(ViewState.TASK_CONTROL)}
                />
                {isStartingGame && <TransitionOverlay type="arcade" />}
                {isStartingEnglish && <LanguageCenterTransition />}
            </AnimatePresence>

        </div>
    );
};

// --- COMPONENT: Floating Particles (Atmosphere) ---
const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(8)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full blur-[1px]"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.3 + Math.random() * 0.5,
                }}
                animate={{
                    y: [0, -100, 0],
                    x: [0, Math.random() * 50 - 25, 0],
                    opacity: [0, 0.8, 0],
                }}
                transition={{
                    duration: 5 + Math.random() * 5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 5
                }}
            />
        ))}
    </div>
);

// --- HELPER: Mobile Building Card (Interactive & Holographic) ---
const MobileBuildingCard = ({ imgSrc, label, icon, onClick }: { imgSrc: string, label: string, icon?: string, onClick: () => void }) => (
    <motion.div
        className="relative w-40 h-40"
        onClick={onClick}
        initial={{ opacity: 0.3, scale: 0.8, filter: 'grayscale(100%)' }}
        whileInView={{
            opacity: 1,
            scale: 1.15,
            filter: 'grayscale(0%)'
        }}
        viewport={{ amount: 0.6, margin: "-100px" }} // Trigger when near center
        transition={{ duration: 0.5 }}
    >
        <motion.img
            src={imgSrc}
            alt={label}
            className="w-full h-full object-contain drop-shadow-2xl"
            style={{
                mixBlendMode: 'screen',
                filter: 'contrast(1.3) brightness(1.3) saturate(1.8)',
                maskImage: 'radial-gradient(closest-side at center, black 50%, transparent 95%)',
                WebkitMaskImage: 'radial-gradient(closest-side at center, black 50%, transparent 95%)'
            }}
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Holographic Label */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 min-w-[120px] text-center">
            <div className="relative px-4 py-2 bg-slate-900/40 backdrop-blur-md rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] group-active:scale-95 transition-transform overflow-hidden">
                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                <span className="text-[10px] sm:text-xs font-black text-cyan-200 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    {icon && <span className="text-sm filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{icon}</span>}
                    {label}
                </span>
            </div>
        </div>
    </motion.div>
);


// Cache-bust para forzar carga de imágenes campus regeneradas
const CAMPUS_IMG_V = 2;

// --- HELPER: Desktop Building 3D (Absolute Positioning) ---
interface Building3DProps {
    id: string;
    top: string;
    left: string;
    width: string;
    height: string;
    imgSrc: string;
    view: ViewState;
    label: { es: string; en: string };
    onNavigate: (v: ViewState) => void;
    hovered: string | null;
    setHovered: (id: string | null) => void;
    language: Language;
    floatDuration: number;
    /** Quita fondo blanco (mix-blend multiply) para integrar sobre asteroide */
    whiteBgRemoval?: boolean;
    /** Imagen con fondo transparente (mix-blend normal) - se integra sobre asteroide */
    transparentBg?: boolean;
    /** Difumina los bordes para que se integren con el background */
    edgeDiffuse?: boolean;
    /** Blend suave + filtros para integrar con el fondo galaxia */
    blendWithBg?: boolean;
    /** Muestra un letrero bilingüe debajo del edificio */
    showSign?: boolean;
    /** object-position para la imagen (ej: bajar el asteroide sin mover el edificio) */
    objectPosition?: string;
    /** Desplazamiento horizontal del letrero (ej: "-15%" mueve a la izquierda) */
    signOffsetX?: string;
    /** Desplazamiento horizontal solo de la imagen (ej: "8%" mueve a la derecha sin afectar el letrero) */
    imageOffsetX?: string;
}

const Building3DDesktop: React.FC<Building3DProps> = ({ id, top, left, width, height, imgSrc, view, label, onNavigate, hovered, setHovered, language, floatDuration, whiteBgRemoval, transparentBg, edgeDiffuse, blendWithBg, showSign, objectPosition, signOffsetX, imageOffsetX }) => {
    const isHovered = hovered === id;
    const { playHover, playClick, playTypewriter } = useNovaSound();

    return (
        <div
            className="absolute z-20"
            style={{ top, left, transform: 'translate(-50%, -50%)' }}
        >
            <div
                className={`relative ${width} ${height} cursor-pointer group perspective-1000 overflow-visible`}
                onMouseEnter={() => { playHover(); setHovered(id); }}
                onMouseLeave={() => setHovered(null)}
                onClick={() => { playClick(); onNavigate(view); }}
            >
                {/* 1. Base Glow Highlight */}
                {!['math', 'english'].includes(id) && (
                    <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-10 bg-cyan-500/0 blur-xl rounded-full transition-all duration-500 ${isHovered ? 'bg-cyan-400/60 scale-150' : ''}`} />
                )}

                {/* Sombra anclaje para edificio transparente (integra con asteroide) */}
                {transparentBg && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-gradient-to-t from-slate-900/50 via-slate-800/20 to-transparent rounded-full blur-md pointer-events-none" />
                )}

                {/* 2. Imagen - blendWithBg=soft-light+color match; screen/multiply para otros */}
                <div className="absolute inset-0" style={imageOffsetX ? { transform: `translateX(${imageOffsetX})` } : undefined}>
                    <motion.img
                        src={imgSrc}
                        alt={label.en}
                        className={`absolute inset-0 w-full h-full object-contain transition-all duration-300 block outline-none ${transparentBg ? 'drop-shadow-[0_4px_20px_rgba(15,23,42,0.5)]' : 'drop-shadow-[0_0_40px_rgba(34,211,238,0.15)]'} ${isHovered ? 'scale-110' : 'scale-100'}`}
                        style={{
                            objectPosition: objectPosition ?? 'center',
                            mixBlendMode: blendWithBg ? 'overlay' : (transparentBg ? 'soft-light' : (whiteBgRemoval ? 'multiply' : 'screen')),
                            opacity: blendWithBg ? 1 : 1,
                            ...(edgeDiffuse && {
                                maskImage: blendWithBg
                                    ? 'radial-gradient(ellipse 85% 110% at 50% 48%, black 14%, rgba(0,0,0,0.9) 22%, rgba(0,0,0,0.5) 34%, transparent 48%)'
                                    : 'radial-gradient(ellipse 100% 100% at 50% 50%, black 45%, rgba(0,0,0,0.6) 65%, transparent 100%)',
                                WebkitMaskImage: blendWithBg
                                    ? 'radial-gradient(ellipse 85% 110% at 50% 48%, black 14%, rgba(0,0,0,0.9) 22%, rgba(0,0,0,0.5) 34%, transparent 48%)'
                                    : 'radial-gradient(ellipse 100% 100% at 50% 50%, black 45%, rgba(0,0,0,0.6) 65%, transparent 100%)',
                                maskSize: '100% 100%',
                                WebkitMaskSize: '100% 100%',
                            }),
                            filter: blendWithBg
                                ? (isHovered ? 'contrast(1.28) brightness(1.15) saturate(1.7) hue-rotate(-1deg)' : 'contrast(1.25) brightness(1.12) saturate(1.6) hue-rotate(-2deg)')
                                : transparentBg
                                    ? (isHovered ? 'contrast(1.0) brightness(0.95) saturate(1.08) hue-rotate(-2deg)' : 'contrast(0.97) brightness(0.91) saturate(1.03) hue-rotate(-4deg)')
                                    : whiteBgRemoval
                                        ? (isHovered ? 'contrast(1.15) brightness(1.15) saturate(1.4)' : 'contrast(1.1) brightness(1.1) saturate(1.3)')
                                        : ['math', 'english'].includes(id)
                                            ? (isHovered ? 'contrast(1.1) brightness(1.1) saturate(1.6)' : 'contrast(1.05) brightness(1.02) saturate(1.4)')
                                            : (isHovered ? 'contrast(1.08) brightness(1.05) saturate(1.35)' : 'contrast(1.02) brightness(1.0) saturate(1.2)')
                        }}
                        animate={{ y: [-8, 8, -8] }}
                        transition={{
                            duration: floatDuration,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>

                {/* Cool bilingual sign */}
                {showSign && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-12 left-1/2 -translate-x-1/2 pointer-events-none"
                        style={signOffsetX ? { transform: `translate(-50%, 0) translateX(${signOffsetX})` } : undefined}
                    >
                        <div className="relative flex items-center justify-center px-8 py-3.5 rounded-xl min-w-[14rem]">
                            {/* Neon frame */}
                            <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/70 shadow-[0_0_20px_rgba(34,211,238,0.5),inset_0_0_20px_rgba(34,211,238,0.1)] bg-slate-950/85 backdrop-blur-md" />
                            {/* Glow bar */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
                            {/* Text - sci-fi font, bien cuadrado en la caja */}
                            <span className="relative text-sm sm:text-base font-bold text-cyan-200 tracking-[0.12em] drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] whitespace-nowrap font-['Orbitron']">
                                {language === 'es' ? label.es : label.en}
                            </span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// --- OVERLAY ---
const TransitionOverlay = ({ type }: { type: 'rocket' | 'arcade' }) => (
    <motion.div
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        {type === 'rocket' ? (
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-950" />
                <motion.div
                    animate={{ y: [200, -1000] }}
                    transition={{ duration: 2, ease: "easeIn" }}
                    className="relative z-10"
                >
                    <Rocket className="w-64 h-64 text-white drop-shadow-2xl" />
                    <div className="mx-auto w-20 h-64 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent blur-md -mt-10 rounded-full" />
                </motion.div>
                <h2 className="absolute bottom-20 text-4xl text-white font-black tracking-[0.5em] animate-pulse">INITIATING LAUNCH</h2>
            </div>
        ) : (
            <div className="relative w-full h-full bg-black flex items-center justify-center font-mono">
                <div className="text-center z-10">
                    <h2 className="text-9xl font-black text-green-500 animate-pulse text-shadow-glow">READY</h2>
                </div>
                <div className="absolute bottom-0 w-full h-[50%] bg-[linear-gradient(rgba(0,255,0,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.2)_1px,transparent_1px)] bg-[length:50px_50px] transform perspective-[500px] rotate-x-60 origin-bottom" />
            </div>
        )}
    </motion.div>
);

// --- HELPER: Mobile Feature Card (Nano Style) ---
const MobileFeatureCard = ({ title, icon, color, onClick, delay }: { title: string, icon: string, color: string, onClick: () => void, delay: number }) => (
    <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay }}
        onClick={onClick}
        className="relative h-32 rounded-[1.5rem] bg-slate-800/50 border border-white/5 overflow-hidden group active:scale-95 transition-transform"
    >
        {/* Hover Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 transition-opacity`} />

        {/* Glow Blob */}
        <div className={`absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br ${color} blur-[40px] opacity-40`} />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="text-4xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">{icon}</span>
            <span className="text-sm font-bold text-white/90">{title}</span>
        </div>
    </motion.button>
);

// --- COMPONENT: Language Center Transition ---
const LanguageCenterTransition = () => (
    <motion.div
        className="fixed inset-0 z-[100] bg-indigo-950 flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        {/* Animated Hallway/Tunnel Effect */}
        <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute border-4 border-indigo-400/20 rounded-full"
                    initial={{ width: 0, height: 0, opacity: 0 }}
                    animate={{
                        width: "150vw",
                        height: "150vw",
                        opacity: [0, 0.5, 0]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.6,
                        ease: "easeOut"
                    }}
                />
            ))}
        </div>

        <div className="relative z-10 text-center space-y-8">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-48 h-48 bg-white/10 backdrop-blur-2xl rounded-[3rem] border-2 border-white/20 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)] mx-auto"
            >
                <Globe className="w-24 h-24 text-white animate-pulse" />
            </motion.div>

            <div className="space-y-2">
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-black text-white tracking-widest font-fredoka uppercase"
                >
                    Centro de Lenguas
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 0.6 }}
                    transition={{ delay: 0.4 }}
                    className="text-indigo-200 font-bold uppercase tracking-[0.3em] text-sm"
                >
                    Language Lab Incoming
                </motion.p>
            </div>

            {/* Glowing Scanline */}
            <motion.div
                className="w-64 h-1 bg-white/20 mx-auto rounded-full overflow-hidden relative"
            >
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            </motion.div>
        </div>
    </motion.div>
);
