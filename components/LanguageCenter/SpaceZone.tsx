import React, { useState, useEffect } from 'react';
import { edgeTTS } from '@/services/edgeTTS';
import { motion, AnimatePresence } from 'framer-motion';
import { useNovaSound } from '@/hooks/useNovaSound';
import {
    ArrowLeft, Rocket, Zap, User, Layers, Wind, Flame, Cloud,
    RotateCw, RefreshCcw, Globe, Compass, Target, Sparkles,
    Truck, Sun, Ghost, Cpu, Star, CheckCircle2, AlertCircle, Mic, Volume2
} from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import EarningsExitModal from '@/components/Gamification/EarningsExitModal';

const MISSIONS = [
    {
        id: 'ground_prep',
        level: 1,
        title: 'LEVEL 1: GROUND PREPARATION',
        titleEs: 'NIVEL 1: PREPARACIÓN EN TIERRA',
        description: 'Check the Fuel and put on your Helmet. Ready for launch!',
        descriptionEs: 'Revisa el combustible y ponte el casco. ¡Listos para el lanzamiento!',
        phrase: 'Ready for takeoff!',
        phraseEs: '¡Listos para despegar!',
        vocab: [
            { en: 'Fuel', es: 'Combustible', icon: <Zap className="text-yellow-400" /> },
            { en: 'Helmet', es: 'Casco', icon: <User className="text-blue-400" /> },
            { en: 'Gantry', es: 'Pasarela', icon: <Layers className="text-gray-400" /> },
            { en: 'Oxygen', es: 'Oxígeno', icon: <Wind className="text-cyan-400" /> }
        ],
        bg: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        scene: 'launchpad'
    },
    {
        id: 'liftoff',
        level: 2,
        title: 'LEVEL 2: ATMOSPHERIC ASCENT',
        titleEs: 'NIVEL 2: ASCENSO ATMOSFÉRICO',
        description: 'Ignite the Engines and break the Sound barrier!',
        descriptionEs: '¡Enciende los motores y rompe la barrera del sonido!',
        phrase: 'Full power to the engines!',
        phraseEs: '¡Toda la potencia a los motores!',
        vocab: [
            { en: 'Ignition', es: 'Ignición', icon: <Flame className="text-orange-500" /> },
            { en: 'Rocket', es: 'Cohete', icon: <Rocket className="text-red-500" /> },
            { en: 'Sky', es: 'Cielo', icon: <Cloud className="text-blue-300" /> },
            { en: 'Speed', es: 'Velocidad', icon: <Zap className="text-yellow-500" /> }
        ],
        bg: 'linear-gradient(180deg, #3b82f6 0%, #1e1b4b 100%)',
        scene: 'ascent'
    },
    {
        id: 'orbital_sync',
        level: 3,
        title: 'LEVEL 3: ORBITAL SYNC',
        titleEs: 'NIVEL 3: SINCRONIZACIÓN ORBITAL',
        description: 'Deploy the Satellite and enjoy the view of Earth.',
        descriptionEs: 'Despliega el Satélite y disfruta la vista de la Tierra.',
        phrase: 'Floating in zero gravity!',
        phraseEs: '¡Flotando en gravedad cero!',
        vocab: [
            { en: 'Satellite', es: 'Satélite', icon: <RotateCw className="text-slate-400" /> },
            { en: 'Orbit', es: 'Órbita', icon: <RefreshCcw className="text-indigo-400" /> },
            { en: 'Earth', es: 'Tierra', icon: <Globe className="text-emerald-500" /> },
            { en: 'Gravity', es: 'Gravedad', icon: <Compass className="text-purple-400" /> }
        ],
        bg: 'linear-gradient(180deg, #1e1b4b 0%, #020617 100%)',
        scene: 'orbit'
    },
    {
        id: 'lunar_lab',
        level: 4,
        title: 'LEVEL 4: LUNAR LABORATORY',
        titleEs: 'NIVEL 4: LABORATORIO LUNAR',
        description: 'Land on the Moon and collect Lunar Dust.',
        descriptionEs: 'Aterriza en la Luna y recolecta polvo lunar.',
        phrase: 'One small step for man!',
        phraseEs: '¡Un pequeño paso para el hombre!',
        vocab: [
            { en: 'Moon', es: 'Luna', icon: <Target className="text-slate-200" /> },
            { en: 'Crater', es: 'Cráter', icon: <Target className="text-slate-500" /> },
            { en: 'Dust', es: 'Polvo', icon: <Sparkles className="text-yellow-200" /> },
            { en: 'Rover', es: 'Vehículo', icon: <Truck className="text-blue-600" /> }
        ],
        bg: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)',
        scene: 'moon'
    },
    {
        id: 'deep_trans',
        level: 5,
        title: 'LEVEL 5: SIGNAL FOUND',
        titleEs: 'NIVEL 5: SEÑAL ENCONTRADA',
        phrase: 'We are not alone!',
        phraseEs: '¡No estamos solos!',
        description: 'Search for Aliens in a distant Galaxy.',
        descriptionEs: 'Busca extraterrestres en una galaxia distante.',
        vocab: [
            { en: 'Mars', es: 'Marte', icon: <Sun className="text-red-600" /> },
            { en: 'Alien', es: 'Extraterrestre', icon: <Ghost className="text-lime-400" /> },
            { en: 'Galaxy', es: 'Galaxia', icon: <Star className="text-white" /> },
            { en: 'Robot', es: 'Robot', icon: <Cpu className="text-cyan-400" /> }
        ],
        bg: 'linear-gradient(180deg, #450a0a 0%, #020617 100%)',
        scene: 'deep'
    },
    {
        id: 'space_station',
        level: 6,
        title: 'LEVEL 6: SPACE HABITAT',
        titleEs: 'NIVEL 6: HÁBITAT ESPACIAL',
        description: 'Dock with the Station and plant some food.',
        descriptionEs: 'Atraca con la estación y planta comida.',
        phrase: 'Welcome to the space station!',
        phraseEs: '¡Bienvenido a la estación espacial!',
        vocab: [
            { en: 'Dock', es: 'Atracar', icon: <Target className="text-blue-400" /> },
            { en: 'Panel', es: 'Panel', icon: <Star className="text-yellow-400" /> },
            { en: 'Grow', es: 'Crecer', icon: <Wind className="text-green-400" /> },
            { en: 'Hatch', es: 'Escotilla', icon: <Layers className="text-gray-400" /> }
        ],
        bg: 'linear-gradient(180deg, #1e293b 0%, #020617 100%)',
        scene: 'orbit' // Using some existing scenes for now or variants
    },
    {
        id: 'asteroid_mining',
        level: 7,
        title: 'LEVEL 7: ASTEROID MINER',
        titleEs: 'NIVEL 7: MINERO DE ASTEROIDES',
        description: 'Collect crystals from the Asteroid Belt.',
        descriptionEs: 'Recolecta cristales del cinturón de asteroides.',
        phrase: 'Searching for shiny crystals!',
        phraseEs: '¡Buscando cristales brillantes!',
        vocab: [
            { en: 'Rock', es: 'Roca', icon: <Target className="text-gray-500" /> },
            { en: 'Laser', es: 'Láser', icon: <Zap className="text-red-500" /> },
            { en: 'Gold', es: 'Oro', icon: <Star className="text-yellow-500" /> },
            { en: 'Belt', es: 'Cinturón', icon: <Layers className="text-slate-400" /> }
        ],
        bg: 'linear-gradient(180deg, #020617 0%, #1e1b4b 100%)',
        scene: 'orbit'
    },
    {
        id: 'black_hole',
        level: 8,
        title: 'LEVEL 8: THE EVENT HORIZON',
        titleEs: 'NIVEL 8: EL HORIZONTE DE EVENTOS',
        description: 'Collect data near the Black Hole.',
        descriptionEs: 'Recolecta datos cerca del agujero negro.',
        phrase: 'Do not cross the horizon!',
        phraseEs: '¡No cruces el horizonte!',
        vocab: [
            { en: 'Hole', es: 'Agujero', icon: <Target className="text-black" /> },
            { en: 'Data', es: 'Datos', icon: <Cpu className="text-blue-400" /> },
            { en: 'Time', es: 'Tiempo', icon: <RefreshCcw className="text-amber-500" /> },
            { en: 'Light', es: 'Luz', icon: <Star className="text-white" /> }
        ],
        bg: 'linear-gradient(180deg, #020617 0%, #312e81 100%)',
        scene: 'deep'
    },
    {
        id: 'exoplanet',
        level: 9,
        title: 'LEVEL 9: UNKNOWN WORLD',
        titleEs: 'NIVEL 9: MUNDO DESCONOCIDO',
        description: 'Land on the red exoplanet.',
        descriptionEs: 'Aterriza en el exoplaneta rojo.',
        phrase: 'A new world discovered!',
        phraseEs: '¡Un nuevo mundo descubierto!',
        vocab: [
            { en: 'Plant', es: 'Planta', icon: <Wind className="text-purple-400" /> },
            { en: 'Water', es: 'Agua', icon: <Wind className="text-blue-400" /> },
            { en: 'Air', es: 'Aire', icon: <Wind className="text-white" /> },
            { en: 'Star', es: 'Estrella', icon: <Sun className="text-orange-500" /> }
        ],
        bg: 'linear-gradient(180deg, #7f1d1d 0%, #020617 100%)',
        scene: 'moon'
    },
    {
        id: 'homecoming',
        level: 10,
        title: 'LEVEL 10: MISSION ACCOMPLISHED',
        titleEs: 'NIVEL 10: MISIÓN CUMPLIDA',
        description: 'Return home and see the blue planet.',
        descriptionEs: 'Regresa a casa y mira el planeta azul.',
        phrase: 'Coming home to Earth!',
        phraseEs: '¡Regresando a casa a la Tierra!',
        vocab: [
            { en: 'Shield', es: 'Escudo', icon: <Layers className="text-orange-400" /> },
            { en: 'Ocean', es: 'Océano', icon: <Globe className="text-blue-500" /> },
            { en: 'Coast', es: 'Costa', icon: <Cloud className="text-yellow-200" /> },
            { en: 'Home', es: 'Casa', icon: <Rocket className="text-red-500" /> }
        ],
        bg: 'linear-gradient(180deg, #020617 0%, #3b82f6 100%)',
        scene: 'ascent'
    }
];

interface SpaceZoneProps {
    onBack: () => void;
}

const SpaceZone: React.FC<SpaceZoneProps> = ({ onBack }) => {
    const { playClick, playSuccess, playStickerApply } = useNovaSound();
    const [currentLevel, setCurrentLevel] = useState(0);
    const [step, setStep] = useState(0); // 0: Learning, 1: Ready, 2: Action, 3: Success
    const [learnedVocab, setLearnedVocab] = useState<string[]>([]);
    const [activeVocab, setActiveVocab] = useState<any>(null); // For floating holograms in scene
    const [isAnimating, setIsAnimating] = useState(false);
    const [showLevelIntro, setShowLevelIntro] = useState(true);
    const [lockClicks, setLockClicks] = useState(0);

    // NEW SPEAKING STATES
    const [phraseStatus, setPhraseStatus] = useState({ en: false, es: false });
    const [isListening, setIsListening] = useState<'en' | 'es' | null>(null);
    const [currentSubtitle, setCurrentSubtitle] = useState<{ en: string, es: string } | null>(null);

    // GAMIFICATION
    const { addRewards } = useGamification();
    const [sessionEarnings, setSessionEarnings] = useState(0);
    const [showEarningsModal, setShowEarningsModal] = useState(false);

    const handleBack = () => {
        if (sessionEarnings > 0) {
            playSuccess();
            setShowEarningsModal(true);
        } else {
            onBack();
        }
    };

    const mission = MISSIONS[currentLevel];

    useEffect(() => {
        const saved = localStorage.getItem('nova_space_level_v2');
        if (saved) setCurrentLevel(parseInt(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('nova_space_level_v2', currentLevel.toString());
    }, [currentLevel]);

    useEffect(() => {
        if (!showLevelIntro && learnedVocab.length < mission.vocab.length) {
            const timer = setTimeout(async () => {
                const txt = "Commander, system protocols are still pending. Click the glowing modules in Mission Control!";
                setCurrentSubtitle({ en: txt, es: "¡Comandante, faltan protocolos. ¡Haz clic en los módulos brillantes en Control de Misión!" });
                await edgeTTS.speak(txt, "rachelle");
                setTimeout(() => setCurrentSubtitle(null), 3000);
            }, 10000); // Remind every 10s if stuck
            return () => clearTimeout(timer);
        }
    }, [showLevelIntro, learnedVocab, currentLevel]);

    useEffect(() => {
        if (activeVocab) {
            const timer = setTimeout(() => setActiveVocab(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [activeVocab]);

    const handleLevelUp = () => {
        setIsAnimating(true);
        playSuccess();
        setActiveVocab(null);
        setTimeout(() => {
            if (currentLevel < MISSIONS.length - 1) {
                setCurrentLevel(prev => prev + 1);
                setStep(0);
                setLearnedVocab([]);
                setPhraseStatus({ en: false, es: false });
                setShowLevelIntro(true);
            } else {
                const txt = "Congratulations Commander! All missions complete. You have explored the entire galaxy!";
                setCurrentSubtitle({ en: txt, es: "¡Felicidades Comandante! Todas las misiones terminadas. ¡Has explorado toda la galaxia!" });
                edgeTTS.speak(txt, "rachelle");
                // Reset to 0 but keep showing subtitle for a bit
                setTimeout(() => setCurrentSubtitle(null), 5000);
                setCurrentLevel(0);
                setStep(0);
                setLearnedVocab([]);
                setPhraseStatus({ en: false, es: false });
            }
            setIsAnimating(false);
        }, 3000);
    };

    const startPhraseRecognition = (lang: 'en' | 'es') => {
        if (!('webkitSpeechRecognition' in window)) {
            setPhraseStatus(prev => ({ ...prev, [lang]: true }));
            return;
        }

        setIsListening(lang);
        const rec = new (window as any).webkitSpeechRecognition();
        rec.lang = lang === 'en' ? 'en-US' : 'es-ES';
        rec.continuous = false;

        rec.onresult = (e: any) => {
            const heard = e.results[0][0].transcript.toLowerCase();
            const target = lang === 'en' ? mission.phrase.toLowerCase() : mission.phraseEs.toLowerCase();

            // Simple match logic
            if (heard.includes(target.split(' ')[0]) || heard.length > 3) {
                setPhraseStatus(prev => ({ ...prev, [lang]: true }));
                playSuccess();
                // Award points for repetition
                addRewards(50, 50);
                setSessionEarnings(prev => prev + 50);
                edgeTTS.speak(lang === 'en' ? "Voice print verified. +50 Credits" : "Confirmación de voz aceptada. +50 Créditos", lang === 'en' ? "rachelle" : "lina");
            } else {
                edgeTTS.speak(lang === 'en' ? "Nice try! Let's try saying it one more time." : "¡Buen intento! Vamos a decirlo una vez más.", lang === 'en' ? "rachelle" : "lina");
                setTimeout(() => {
                    startPhraseRecognition(lang);
                }, 3000);
            }
        };

        rec.onend = () => setIsListening(null);
        rec.start();
    };

    const learnWord = async (word: any) => {
        const isPilot = localStorage.getItem('nova_user_name') === 'Andrés (Test Pilot)';

        if (learnedVocab.includes(word.en)) {
            setActiveVocab(word); // Show it again if clicked
            setCurrentSubtitle({ en: word.en, es: word.es });
            await edgeTTS.speak(word.en, "rachelle");
            await edgeTTS.speak(word.es, "lina");

            await new Promise(r => setTimeout(r, 1000));
            setCurrentSubtitle(null);
            return;
        }

        setActiveVocab(word);
        setCurrentSubtitle({ en: word.en, es: word.es });
        await edgeTTS.speak(word.en, "rachelle");
        await edgeTTS.speak(word.es, "lina");

        await new Promise(r => setTimeout(r, 1000));
        setCurrentSubtitle(null);

        setLearnedVocab(prev => [...prev, word.en]);
        playStickerApply();

        // REDUCED REQUIREMENT: Launch after 2 words for faster engagement
        const requiredCount = Math.min(2, mission.vocab.length);
        if (learnedVocab.length + 1 >= requiredCount || isPilot) {
            setStep(1); // Ready for action
            if (isPilot) setPhraseStatus({ en: true, es: true }); // Skip voice for pilot

            const txt = "System protocol synchronized. Rocket is cleared for takeoff!";
            setCurrentSubtitle({ en: txt, es: "Protocolo sincronizado. ¡El cohete tiene permiso para despegar!" });
            await edgeTTS.speak(txt, "rachelle");
            setTimeout(() => setCurrentSubtitle(null), 3000);
        }
    };

    const renderVocabHologram = () => (
        <AnimatePresence>
            {activeVocab && (
                <motion.div
                    key={activeVocab.en}
                    initial={{ scale: 0, y: 100, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, y: -50, opacity: 0 }}
                    className="absolute top-[30%] left-[60%] -translate-x-1/2 z-[60] bg-slate-900/90 backdrop-blur-2xl border-2 border-cyan-400 p-6 rounded-[2.5rem] shadow-[0_0_60px_rgba(34,211,238,0.5)] flex flex-col items-center gap-4 min-w-[220px]"
                >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-[12px] uppercase rounded-full shadow-lg italic tracking-tighter">DATA LOG 📡</div>
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-cyan-400 border-4 border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        {React.cloneElement(activeVocab.icon as React.ReactElement, { size: 48 })}
                    </div>
                    <div className="text-center">
                        <h3 className="text-white font-black text-4xl uppercase italic tracking-tighter leading-none mb-1 drop-shadow-md">{activeVocab.en}</h3>
                        <div className="h-px bg-white/20 w-1/2 mx-auto my-2" />
                        <p className="text-cyan-400 font-bold uppercase tracking-[0.2em] text-sm">{activeVocab.es}</p>
                    </div>
                    {/* Glowing pulse effect behind card */}
                    <div className="absolute -inset-4 bg-cyan-500/10 blur-3xl -z-10 rounded-full animate-pulse" />
                </motion.div>
            )}
        </AnimatePresence>
    );

    const renderLaunchpad = () => (
        <div className="relative w-full h-full flex items-end justify-center pb-0 overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #1e293b 0%, #334155 40%, #fdba74 85%, #fb923c 100%)' }}>

            {renderVocabHologram()}

            {/* TWILIGHT STARS */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

            {/* COASTAL OCEAN AT HORIZON */}
            <div className="absolute bottom-24 w-full h-20 bg-blue-900/40 backdrop-blur-sm z-0">
                <motion.div
                    animate={{ x: [-20, 20] }}
                    transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
                    className="absolute inset-0 opacity-30"
                    style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, #fff 50%, transparent 100%)', backgroundSize: '200% 100%' }}
                />
            </div>

            {/* FLOODLIGHT TOWERS */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute left-[10%] bottom-24 w-4 h-64 bg-slate-800 border-x-2 border-slate-700">
                    <div className="absolute -top-4 -left-4 w-12 h-8 bg-white rounded-lg shadow-[0_0_50px_#fff]" />
                </div>
                <div className="absolute right-[10%] bottom-24 w-4 h-64 bg-slate-800 border-x-2 border-slate-700">
                    <div className="absolute -top-4 -left-4 w-12 h-8 bg-white rounded-lg shadow-[0_0_50px_#fff]" />
                </div>
            </div>

            {/* TECHNICAL GANTRY TOWER */}
            <div className="absolute left-[30%] bottom-24 w-24 h-[75%] bg-slate-800/80 border-r-4 border-slate-700 z-10 shadow-2xl">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 2px, transparent 2px, transparent 40px)' }} />
                <motion.div
                    animate={step === 2 ? { rotate: -60, x: -100, opacity: 0 } : { rotate: 0 }}
                    className="absolute top-[30%] right-[-100px] w-32 h-4 bg-slate-700 rounded-full border-t-2 border-slate-600"
                />
            </div>

            {/* LAUNCH PLATFORM (The Ground) */}
            <div className="absolute bottom-0 w-full h-24 bg-[#1e293b] z-20 border-t-8 border-slate-800 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-full bg-slate-900 border-x-4 border-slate-800 shadow-inner flex justify-around p-4 text-white/5 font-black text-4xl italic overflow-hidden">
                    <span>NASA</span><span>SPACE</span><span>ZONE</span>
                </div>
                {/* Safety Lights */}
                <div className="absolute top-2 inset-x-0 flex justify-center gap-20">
                    {[1, 2, 3, 4].map(i => <motion.div key={i} animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-4 h-4 bg-red-600 rounded-full shadow-[0_0_15px_red] border border-red-400" />)}
                </div>
            </div>

            {/* VOLUMINOUS SMOKE VAPOR */}
            <AnimatePresence>
                {step === 2 && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 50 }}
                            animate={{ opacity: 1, scale: 3, y: 0 }}
                            className="absolute bottom-20 left-[45%] w-64 h-64 bg-white/40 blur-[50px] rounded-full z-[15] pointer-events-none"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 50 }}
                            animate={{ opacity: 1, scale: 3, y: 0 }}
                            className="absolute bottom-20 left-[55%] w-64 h-64 bg-white/30 blur-[60px] rounded-full z-[15] pointer-events-none"
                        />
                    </>
                )}
            </AnimatePresence>

            {/* ROCKET */}
            <motion.div
                onClick={async () => {
                    if (isAnimating) return;
                    if (step === 1) {
                        setStep(2);
                        playClick();
                        await edgeTTS.speak("Ignition sequence started. Liftoff!", "ana");
                        setTimeout(handleLevelUp, 5000);
                    } else if (step === 0) {
                        setLockClicks(prev => prev + 1);
                        if (lockClicks >= 2) {
                            setStep(1);
                            setLockClicks(0);
                            edgeTTS.speak("Manual override accepted. Systems ready.", "rachelle");
                        } else {
                            const txt = "Engines locked! Tap the glowing protocols on the left first.";
                            setCurrentSubtitle({ en: txt, es: "¡Motores bloqueados! Toca los protocolos brillantes primero." });
                            await edgeTTS.speak(txt, "rachelle");
                            setTimeout(() => setCurrentSubtitle(null), 3000);
                        }
                    }
                }}
                className={`relative z-30 text-[18rem] leading-none flex flex-col items-center ${step === 1 ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                style={{ marginBottom: '40px' }}
                animate={step === 2
                    ? { y: -2500, scale: 0.4, x: [0, 8, -8, 0], rotate: -45 }
                    : { y: 0, x: [0, 1, -1, 0], rotate: -45 }
                }
                transition={step === 2
                    ? { y: { duration: 7, ease: 'easeIn' }, scale: { duration: 7 }, x: { repeat: Infinity, duration: 0.04 } }
                    : { x: { duration: 0.2, repeat: Infinity } }
                }
            >
                <span className="drop-shadow-[0_0_50px_rgba(255,255,255,0.4)] block">🚀</span>

                {/* ENGINE FIRE */}
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-40 h-[600px] flex flex-col items-center pointer-events-none"
                        style={{ rotate: 45, transformOrigin: 'top center' }}
                    >
                        <div className="w-full h-full bg-gradient-to-t from-transparent via-orange-500/80 to-yellow-400 blur-3xl rounded-full" />
                        <motion.div animate={{ scaleY: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.05 }} className="absolute top-0 w-24 h-[400px] bg-white/60 blur-xl rounded-full" />
                    </motion.div>
                )}
            </motion.div>

            {/* MAIN SCENE TRIGGER BUTTON */}
            {step === 1 && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={async () => {
                        if (isAnimating) return;
                        setStep(2);
                        playClick();
                        await edgeTTS.speak("Engines starting. T-minus 3. 2. 1. Liftoff!", "ana");
                        setTimeout(handleLevelUp, 5000);
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-red-600 hover:bg-red-500 text-white font-black text-4xl px-12 py-6 rounded-full shadow-[0_0_50px_rgba(220,38,38,0.8)] border-4 border-white uppercase italic tracking-tighter animate-bounce"
                >
                    LIFT OFF! 🔥
                </motion.button>
            )}

            {/* HUD / CAMERA NOISE EFFECT */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[40]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/pinstriped-dark.png")' }} />
        </div>
    );

    const renderAscent = () => (
        <div className="relative w-full h-full flex flex-col items-center justify-center pt-20">
            {renderVocabHologram()}
            <motion.div
                animate={{ y: [-20, 20], x: [-5, 5] }}
                transition={{ duration: 0.05, repeat: Infinity }}
                className="text-[14rem] relative z-20"
            >
                🚀
                <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-40 h-80 bg-cyan-400/30 blur-3xl rounded-full animate-pulse" />
            </motion.div>

            <motion.div
                animate={{ y: [0, 1000] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 w-full h-full pointer-events-none opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }}
            />

            <div className="mt-2 text-center relative z-30">
                <h2 className="text-6xl font-black italic uppercase text-white tracking-widest drop-shadow-2xl">MAX THRUST</h2>
                <motion.div animate={{ opacity: [0.5, 1] }} transition={{ repeat: Infinity }} className="mt-4 text-cyan-400 font-bold text-xl uppercase tracking-[0.5em]">T-plus 45 seconds</motion.div>

                {step === 1 && (
                    <motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        onClick={handleLevelUp}
                        className="mt-10 px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-3xl border-4 border-indigo-400 uppercase tracking-widest shadow-[0_0_30px_rgba(79,70,229,0.5)]"
                    >
                        Enter Orbit 🌌
                    </motion.button>
                )}
            </div>
        </div>
    );

    const renderOrbit = () => (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {renderVocabHologram()}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 200, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-[70%] w-[140%] aspect-square rounded-full shadow-[inset_0_0_100px_rgba(0,0,0,0.8),0_0_80px_rgba(30,64,175,0.4)]"
                style={{ background: 'radial-gradient(circle at 50% 10%, #3b82f6 0%, #1e3a8a 40%, #020617 100%)' }}
            >
                <div className="absolute top-20 left-1/3 text-9xl opacity-10">☁️</div>
                <div className="absolute top-60 right-1/4 text-white/5 text-8xl font-black">PACIFIC OCEAN</div>
            </motion.div>

            <motion.div
                animate={{ x: [-200, 200], y: [-50, 50], rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="text-[10rem] z-20 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
                🛰️
            </motion.div>

            {step === 1 && (
                <button onClick={handleLevelUp} className="absolute bottom-20 px-12 py-5 bg-cyan-600 text-white font-black rounded-full border-4 border-cyan-400 shadow-2xl uppercase italic tracking-tighter">
                    Initiate Lunar Descent Lunar 🌑
                </button>
            )}
        </div>
    );

    const renderMoon = () => (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#020617]">
            {renderVocabHologram()}

            {/* DEEP SPACE BACKGROUND */}
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle, #fff 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />

            {/* DISTANT EARTH */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="absolute top-20 right-20 w-32 h-32 rounded-full shadow-[0_0_60px_rgba(59,130,246,0.3)] z-0 overflow-hidden"
                style={{ background: 'radial-gradient(circle at 30% 30%, #60a5fa 0%, #2563eb 40%, #1e3a8a 100%)' }}
            >
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                <div className="absolute top-4 left-4 w-20 h-10 bg-white/10 rounded-full blur-xl rotate-45" />
            </motion.div>

            {/* LUNAR SURFACE LAYERS */}
            <div className="absolute -bottom-20 w-[150%] h-[60%] bg-[#94a3b8] rounded-[50%] shadow-[inset_0_40px_100px_rgba(0,0,0,0.4)] border-t-[10px] border-white/10 z-10" />
            <div className="absolute -bottom-40 w-[180%] h-[70%] bg-[#475569] rounded-[50%] z-0" />

            {/* CRATERS */}
            <div className="absolute bottom-20 left-1/4 w-32 h-10 bg-black/20 rounded-full blur-sm z-20 shadow-inner" />
            <div className="absolute bottom-40 right-1/3 w-20 h-6 bg-black/10 rounded-full blur-sm z-20 shadow-inner" />
            <div className="absolute bottom-10 right-1/4 w-48 h-12 bg-black/25 rounded-full blur-md z-20 shadow-inner" />

            {/* ROCKS */}
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute bottom-[30%] left-[15%] text-4xl z-20 opacity-80">🪨</motion.div>
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute bottom-[25%] right-[20%] text-5xl z-20 opacity-60">🪨</motion.div>

            {/* SPACE DUST PARTICLES */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, Math.random() * 50 - 25, 0],
                        opacity: [0, 0.5, 0]
                    }}
                    transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5 }}
                    className="absolute w-1 h-1 bg-white rounded-full z-20"
                    style={{ left: `${Math.random() * 100}%`, top: `${60 + Math.random() * 40}%` }}
                />
            ))}

            {/* ASTRONAUT */}
            <motion.div
                animate={{ y: [-15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-30 text-[14rem] mb-20"
            >
                <span className="drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">👨‍🚀</span>
                {/* Shadow beneath astronaut */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-8 bg-black/20 rounded-full blur-2xl" />
            </motion.div>

            {/* FLAG (Appears when step 1) */}
            {learnedVocab.length > 0 && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute bottom-[35%] left-[60%] text-8xl z-20 drop-shadow-lg"
                >
                    🚩
                </motion.div>
            )}

            {/* ACTION BUTTON MOON */}
            {step === 1 && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLevelUp}
                    className="absolute bottom-10 px-12 py-5 bg-slate-800 text-white font-black rounded-3xl border-4 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.5)] uppercase italic animate-pulse z-50"
                >
                    COMPLETE RESEARCH 🚩
                </motion.button>
            )}
        </div>
    );

    const renderDeep = () => (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-slate-950">
            {renderVocabHologram()}

            {/* NEBULA BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_black_100%)] z-10" />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-[-50%] opacity-30"
                    style={{
                        background: 'radial-gradient(circle at 30% 30%, #4c1d95 0%, transparent 50%), radial-gradient(circle at 70% 60%, #831843 0%, transparent 50%)',
                        filter: 'blur(100px)'
                    }}
                />
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 0.5px, transparent 0.5px)', backgroundSize: '50px 50px' }} />
            </div>

            {/* MARS IN THE DISTANCE */}
            <motion.div
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="absolute -left-20 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full z-0 opacity-40 overflow-hidden shadow-[0_0_100px_rgba(239,68,68,0.2)]"
                style={{ background: 'radial-gradient(circle at 70% 30%, #f87171 0%, #b91c1c 40%, #7f1d1d 100%)' }}
            >
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                <div className="absolute top-0 left-0 w-full h-full shadow-[inset_-50px_50px_100px_rgba(0,0,0,0.8)]" />
            </motion.div>

            {/* UFO WITH LIGHTS */}
            <motion.div
                animate={{
                    y: [-20, 20],
                    rotate: [11, 15, 11],
                    x: [-10, 10, -10]
                }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="relative z-30 text-[18rem] mb-10 group"
            >
                <div className="drop-shadow-[0_0_60px_rgba(168,85,247,0.6)]">🛸</div>

                {/* UFO NEON LIGHTS */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-4 opacity-80">
                    {[...Array(4)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                        />
                    ))}
                </div>

                {/* TRACTOR BEAM LIGHT */}
                <motion.div
                    animate={{ opacity: [0.1, 0.3, 0.1], scaleX: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-48 h-80 bg-gradient-to-t from-transparent via-cyan-400/20 to-cyan-400/10 blur-2xl rounded-[50%] -z-10"
                    style={{ transformOrigin: 'top center', rotate: '-13deg' }}
                />
            </motion.div>

            {/* SIGNAL INTERFACE */}
            <div className="relative z-40 flex flex-col items-center">
                <motion.div
                    animate={{
                        opacity: [1, 0.7, 1],
                        textShadow: [
                            '0 0 10px rgba(239,68,68,0.5)',
                            '0 0 20px rgba(239,68,68,0.8), 2px 0 0 rgba(0,255,255,0.5), -2px 0 0 rgba(255,0,255,0.5)',
                            '0 0 10px rgba(239,68,68,0.5)'
                        ]
                    }}
                    transition={{ repeat: Infinity, duration: 0.1, repeatDelay: 3 }}
                    className="text-white font-black text-6xl uppercase italic tracking-[0.5em] mb-8"
                >
                    SIGNAL FOUND
                </motion.div>

                {/* HIGH-TECH AUDIO WAVE */}
                <div className="flex gap-2 mb-12 h-32 items-center">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                height: [10, Math.random() * 100 + 20, 10],
                                backgroundColor: ['#22d3ee', '#818cf8', '#22d3ee']
                            }}
                            transition={{ repeat: Infinity, duration: 0.4 + Math.random() * 0.3, delay: i * 0.05 }}
                            className="w-2 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                        />
                    ))}
                </div>

                {step === 1 && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.1, boxShadow: '0 0 50px rgba(239,68,68,0.6)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleLevelUp}
                        className="px-16 py-6 bg-red-600 text-white font-black rounded-full shadow-2xl uppercase italic tracking-widest border-4 border-white animate-bounce text-2xl"
                    >
                        END MISSION 📡
                    </motion.button>
                )}
            </div>

            {/* AMBIENT SCANLINE EFFECT */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50" style={{ backgroundSize: '100% 4px, 3px 100%' }} />
        </div>
    );

    return (
        <div className="h-full flex flex-col md:flex-row overflow-hidden font-sans text-gray-100 relative" style={{ background: mission.bg }}>

            {/* LEVEL INTRO OVERLAY */}
            <AnimatePresence>
                {showLevelIntro && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="max-w-xl w-full"
                        >
                            <div className="inline-block p-8 bg-white/5 rounded-[3rem] border border-white/10 shadow-2xl mb-8">
                                <Rocket className="text-cyan-400" size={80} />
                            </div>
                            <h1 className="text-white font-black text-5xl mb-4 tracking-tighter uppercase italic">{mission.title}</h1>
                            <p className="text-cyan-400 font-bold text-sm tracking-[0.3em] mb-4 uppercase">{mission.titleEs}</p>
                            <div className="bg-white/5 p-8 rounded-3xl border border-white/5 mb-10">
                                <p className="text-white font-bold text-xl mb-2">"{mission.description}"</p>
                                <p className="text-white/40 italic">"{mission.descriptionEs}"</p>
                            </div>
                            <button
                                onClick={() => { playClick(); setShowLevelIntro(false); }}
                                className="px-16 py-6 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-3xl text-2xl shadow-[0_0_40px_rgba(8,145,178,0.5)] hover:scale-105 transition-all uppercase italic tracking-tighter"
                            >
                                Start Mission 🚀
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SIDEBAR: MISSION CONTROL */}
            <div className="w-full md:w-[400px] h-full flex flex-col bg-slate-950/95 backdrop-blur-2xl border-r border-white/10 relative z-30">
                <div className="p-8 bg-slate-900 border-b border-white/5">
                    <button onClick={handleBack} className="flex items-center gap-2 mb-6 text-[10px] uppercase font-black tracking-widest text-white/40 hover:text-white transition-colors">
                        <ArrowLeft size={14} /> Abort Mission
                    </button>
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-cyan-500/10 rounded-[1.5rem] border border-cyan-500/20 shadow-inner">
                            <Compass className="text-cyan-400" size={32} />
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black text-cyan-500 tracking-[0.3em] mb-1 uppercase">Mission Control</h2>
                            <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Status: Level {mission.level}</h1>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8 flex-1 overflow-y-auto pb-40">
                    {/* Guiding Instruction Header */}
                    {learnedVocab.length < mission.vocab.length && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20"
                        >
                            <Target className="text-cyan-400 animate-pulse" size={20} />
                            <p className="text-[10px] font-black text-cyan-200 uppercase tracking-widest leading-tight">Click the buttons below to verify systems!</p>
                        </motion.div>
                    )}

                    {/* SYSTEM PROTOCOLS LIST */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">System Protocols</h3>
                            <div className="flex gap-1">
                                {learnedVocab.length === mission.vocab.length ? <CheckCircle2 className="text-green-500" size={16} /> : <AlertCircle className="text-amber-500 animate-pulse" size={16} />}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {mission.vocab.map((v, idx) => {
                                const isLearned = learnedVocab.includes(v.en);
                                const isFirstUnlearned = !isLearned && (learnedVocab.length === idx);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => learnWord(v)}
                                        className={`flex items-center gap-5 p-5 rounded-[1.5rem] border-2 transition-all duration-300 text-left group overflow-hidden relative ${isLearned
                                            ? "bg-emerald-500/10 border-emerald-500/50 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]"
                                            : isFirstUnlearned
                                                ? "bg-cyan-500/30 border-cyan-400 animate-pulse scale-105 shadow-[0_0_30px_rgba(34,211,238,0.5)] z-10"
                                                : "bg-white/5 border-white/5 opacity-40"
                                            }`}
                                    >
                                        <div className={`p-4 rounded-2xl transition-all duration-300 ${isLearned ? "bg-emerald-500 text-white scale-110 shadow-lg" : "bg-slate-900 text-slate-500 group-hover:text-cyan-400"
                                            }`}>
                                            {v.icon}
                                        </div>
                                        <div className="flex-1 relative z-10">
                                            <p className={`font-black text-lg uppercase italic leading-none mb-1 transition-colors ${isLearned ? "text-emerald-400" : "text-white"}`}>{v.en}</p>
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{v.es}</p>
                                        </div>
                                        {isLearned && (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500">
                                                <CheckCircle2 size={24} />
                                            </motion.div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* VOICE IDENTIFICATION SECTION */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-6 bg-slate-900 border border-cyan-500/30 rounded-[2rem] space-y-4 shadow-[0_0_30px_rgba(34,211,238,0.1)]"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Mic className="text-cyan-400" size={18} />
                                <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Voice Identification</h4>
                            </div>

                            <div className="space-y-3">
                                {/* English Phrase */}
                                <button
                                    onClick={() => startPhraseRecognition('en')}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${phraseStatus.en ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-950 border-white/10 hover:border-cyan-500/50'}`}
                                >
                                    <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Say in English:</p>
                                    <p className={`text-sm font-black italic uppercase ${phraseStatus.en ? 'text-emerald-400' : 'text-white'}`}>{mission.phrase}</p>
                                    {isListening === 'en' && <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity }} className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_red]" />}
                                    {phraseStatus.en && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />}
                                </button>

                                {/* Spanish Phrase */}
                                <button
                                    onClick={() => startPhraseRecognition('es')}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${phraseStatus.es ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-950 border-white/10 hover:border-cyan-500/50'}`}
                                >
                                    <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Repite en Español:</p>
                                    <p className={`text-sm font-black italic uppercase ${phraseStatus.es ? 'text-emerald-400' : 'text-white'}`}>{mission.phraseEs}</p>
                                    {isListening === 'es' && <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity }} className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_red]" />}
                                    {phraseStatus.es && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ACTION BUTTON AT THE BOTTOM FOR FLOW */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className={`p-6 rounded-[2rem] shadow-2xl space-y-4 border-t-4 mt-4 mb-20 transition-all duration-500 ${phraseStatus.en && phraseStatus.es ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-white/5 opacity-50 grayscale'}`}
                        >
                            <h4 className="text-indigo-200 font-black text-[10px] uppercase tracking-widest">Protocol Verified</h4>
                            <p className="text-white font-black text-lg leading-tight uppercase italic tracking-tighter">
                                {phraseStatus.en && phraseStatus.es ? 'Access Granted!' : 'Voice Locked...'}
                            </p>
                            <button
                                disabled={!(phraseStatus.en && phraseStatus.es)}
                                onClick={async () => {
                                    if (isAnimating) return;
                                    setStep(2);
                                    playClick();
                                    await edgeTTS.speak("Executing mission protocol. Ready?", "ana");
                                    if (mission.scene === 'launchpad') {
                                        setTimeout(handleLevelUp, 5000);
                                    } else {
                                        handleLevelUp();
                                    }
                                }}
                                className={`w-full py-5 font-black rounded-2xl shadow-xl uppercase italic tracking-tighter transition-all text-xl ${phraseStatus.en && phraseStatus.es
                                    ? 'bg-white text-indigo-700 hover:scale-[1.05] active:scale-95'
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                            >
                                EXECUTE SEQUENCE ⚡
                            </button>
                        </motion.div>
                    )}
                </div>

                <div className="p-8 bg-slate-900 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">
                        <span>Learning Status</span>
                        <span>{Math.round((learnedVocab.length / mission.vocab.length) * 100)}%</span>
                    </div>
                    <div className="h-3 bg-slate-950 rounded-full overflow-hidden p-1 border border-white/5">
                        <motion.div
                            animate={{ width: `${(learnedVocab.length / mission.vocab.length) * 100}%` }}
                            className={`h-full rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-colors duration-500 ${learnedVocab.length === mission.vocab.length ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                        />
                    </div>
                </div>
            </div>

            {/* MAIN ACTION AREA */}
            <div className="flex-1 relative overflow-hidden bg-slate-950">
                <AnimatePresence mode="wait">
                    {isAnimating ? (
                        <motion.div
                            key="anim"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-12 text-center"
                        >
                            <motion.div
                                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="text-cyan-400 mb-8"
                            >
                                <RefreshCcw size={80} />
                            </motion.div>
                            <h2 className="text-white font-black text-5xl italic uppercase tracking-tighter mb-4">Level Up!</h2>
                            <p className="text-cyan-500 font-bold uppercase tracking-[0.5em] animate-pulse">Calculating Trajectory...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={mission.id}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            className="w-full h-full"
                        >
                            {mission.scene === 'launchpad' && renderLaunchpad()}
                            {mission.scene === 'ascent' && renderAscent()}
                            {mission.scene === 'orbit' && renderOrbit()}
                            {mission.scene === 'moon' && renderMoon()}
                            {mission.scene === 'deep' && renderDeep()}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* HUD Overlay Elements */}
                <div className="absolute inset-0 pointer-events-none z-40">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

                    {/* Viewport Frame */}
                    <div className="absolute inset-10 border-2 border-white/5 rounded-[3rem] pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-1 bg-slate-950 border border-white/10 rounded-full text-[10px] font-black text-cyan-500/60 uppercase tracking-widest">Live Feed #0{currentLevel + 1}</div>
                        <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-cyan-500/20 rounded-tl-3xl translate-x-[-2px] translate-y-[-2px]" />
                        <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-cyan-500/20 rounded-tr-3xl translate-x-[2px] translate-y-[-2px]" />
                        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-cyan-500/20 rounded-bl-3xl translate-x-[-2px] translate-y-[2px]" />
                        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-cyan-500/20 rounded-br-3xl translate-x-[2px] translate-y-[2px]" />
                    </div>

                    {/* Scanning Text */}
                    <div className="absolute bottom-20 right-20 text-right opacity-30">
                        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Coordinates</p>
                        <p className="text-white font-mono text-xs">X: {Math.floor(Math.random() * 1000)} Y: {Math.floor(Math.random() * 1000)} Z: {Math.floor(Math.random() * 1000)}</p>
                    </div>
                </div>

                {/* BILINGUAL SUBTITLE OVERLAY */}
                <AnimatePresence>
                    {currentSubtitle && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-[100] pointer-events-none"
                        >
                            <div className="bg-black/80 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center gap-2">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                        <Volume2 size={16} className="text-white" />
                                    </div>
                                    <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Listen & Learn</span>
                                </div>

                                <h2 className="text-white text-2xl md:text-3xl font-black tracking-tight leading-tight">
                                    {currentSubtitle.en}
                                </h2>
                                {currentSubtitle.es && (
                                    <>
                                        <div className="h-px w-24 bg-white/20 my-1" />
                                        <p className="text-indigo-300 text-lg md:text-xl font-bold italic opacity-90">
                                            {currentSubtitle.es}
                                        </p>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* EARNINGS MODAL */}
                <AnimatePresence>
                    {showEarningsModal && (
                        <EarningsExitModal
                            sessionEarnings={sessionEarnings}
                            onComplete={onBack}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SpaceZone;
