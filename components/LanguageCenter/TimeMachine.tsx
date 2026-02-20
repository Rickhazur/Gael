import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { edgeTTS } from '@/services/edgeTTS';
import {
    Zap,
    Trophy,
    RefreshCw,
    Mic,
    MicOff,
    Cpu,
    ShieldAlert,
    Compass,
    Sparkles,
    Wind,
    CloudFlash,
    Trees
} from 'lucide-react';

type Era = 'past' | 'present' | 'future';

interface EraTheme {
    id: Era;
    name: string;
    esName: string;
    color: string;
    bgGradient: string;
    crystalColor: string;
    emoji: string;
    description: string;
    descriptionEs: string;
    targetSentence: string;
    targetSentenceEs: string;
    tenseKey: string;
}

const ERA_THEMES: Record<Era, EraTheme> = {
    past: {
        id: 'past',
        name: 'Ancient World',
        esName: 'Mundo Antiguo',
        color: 'from-amber-600 to-orange-900',
        bgGradient: 'from-amber-900/40 via-orange-950/20 to-stone-950',
        crystalColor: 'bg-amber-500',
        emoji: '1f332', // Forest
        description: "Long ago, there was a giant forest here.",
        descriptionEs: "Hace mucho tiempo, había un bosque gigante aquí.",
        targetSentence: "There was a giant forest",
        targetSentenceEs: "Había un bosque gigante",
        tenseKey: 'WAS / WERE'
    },
    present: {
        id: 'present',
        name: 'Modern City',
        esName: 'Ciudad Moderna',
        color: 'from-emerald-500 to-teal-900',
        bgGradient: 'from-emerald-900/30 via-teal-950/20 to-slate-950',
        crystalColor: 'bg-emerald-500',
        emoji: '1f3d9', // Cityscape
        description: "Right now, there is a big city with tall buildings.",
        descriptionEs: "Ahora mismo, hay una gran ciudad con edificios altos.",
        targetSentence: "There is a big city",
        targetSentenceEs: "Hay una gran ciudad",
        tenseKey: 'IS / ARE'
    },
    future: {
        id: 'future',
        name: 'Neo Galaxy',
        esName: 'Neo Galaxia',
        color: 'from-cyan-500 to-blue-900',
        bgGradient: 'from-blue-900/40 via-indigo-950/20 to-black',
        crystalColor: 'bg-cyan-500',
        emoji: '1f6f0', // Space Station
        description: "In the future, there will be a giant space station.",
        descriptionEs: "En el futuro, habrá una estación espacial gigante.",
        targetSentence: "There will be a space station",
        targetSentenceEs: "Habrá una estación espacial",
        tenseKey: 'WILL BE'
    }
};

const hexToEmoji = (hex: string) => {
    if (!hex) return '❓';
    return hex.split('-').map(part => String.fromCodePoint(parseInt(part, 16))).join('');
};

const ChronosGateway: React.FC = () => {
    const [xp, setXp] = useState(0);
    const [activeEra, setActiveEra] = useState<Era | null>(null);
    const [isStabilizing, setIsStabilizing] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [heardText, setHeardText] = useState("");
    const [currentSubtitle, setCurrentSubtitle] = useState<{ en: string, es: string } | null>(null);
    const [gatewayStatus, setGatewayStatus] = useState<'idle' | 'scanning' | 'unstable' | 'synced'>('idle');

    const initializeEra = async (eraId: Era) => {
        const era = ERA_THEMES[eraId];
        setActiveEra(eraId);
        setGatewayStatus('scanning');
        setHeardText("");

        setIsStabilizing(true);
        setCurrentSubtitle({ en: era.description, es: era.descriptionEs });
        await edgeTTS.speak(era.description, "rachelle");
        await edgeTTS.speak(era.descriptionEs, "lina");

        await new Promise(r => setTimeout(r, 800));
        setGatewayStatus('unstable');
        setIsStabilizing(false);
    };

    const startSpeech = () => {
        if (!('webkitSpeechRecognition' in window)) return;
        setIsListening(true);
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
            const speechResult = event.results[0][0].transcript;
            setHeardText(speechResult);
            verifyStabilization(speechResult);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const verifyStabilization = async (text: string) => {
        if (!activeEra) return;
        const target = ERA_THEMES[activeEra].targetSentence.toLowerCase().replace(/[.,!]/g, "");
        const heard = text.toLowerCase().replace(/[.,!]/g, "");

        if (heard.includes(target) || target.includes(heard)) {
            setGatewayStatus('synced');
            setXp(v => v + 250);
            setCurrentSubtitle({ en: "Temporal synchronization complete! Timeline stabilized.", es: "¡Sincronización temporal completada! Línea de tiempo estabilizada." });
            await edgeTTS.speak("Temporal synchronization complete! Timeline stabilized.", "rachelle");
            await edgeTTS.speak("¡Sincronización temporal completada! Línea de tiempo estabilizada.", "lina");
            setTimeout(() => {
                setGatewayStatus('idle');
                setActiveEra(null);
                setCurrentSubtitle(null);
            }, 5000);
        } else {
            setGatewayStatus('unstable');
            setCurrentSubtitle({ en: `Energy mismatch! I heard "${text}". Try again!`, es: `¡Desajuste de energía! Escuché "${text}". ¡Inténtalo de nuevo!` });
            await edgeTTS.speak(`Mismatch! I heard "${text}". Use the phrase: ${ERA_THEMES[activeEra].targetSentence}`, "rachelle");
        }
    };

    return (
        <div className={`h-screen w-full transition-colors duration-1000 flex flex-col items-center justify-center p-8 overflow-hidden font-sans relative ${activeEra ? ERA_THEMES[activeEra].bgGradient : 'bg-slate-950'}`}>

            {/* --- THE HUBBLE / REACTOR CORE BACKGROUND --- */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #4f46e5 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />
            </div>

            {/* --- TOP HUD --- */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-50">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Chronos Gateway</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${gatewayStatus === 'synced' ? 'bg-emerald-500' : (gatewayStatus === 'idle' ? 'bg-slate-500' : 'bg-rose-500')}`} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reactor Status: {gatewayStatus}</span>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-3xl border border-white/20 px-8 py-4 rounded-3xl flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase text-indigo-300">Temporal Sync</span>
                        <span className="text-3xl font-black text-white">{xp} <span className="text-sm font-medium opacity-50">XP</span></span>
                    </div>
                    <Trophy size={32} className="text-amber-400" />
                </div>
            </div>

            {/* --- THE VORTEX CORE (THE "WOW" CENTER) --- */}
            <div className="flex-1 w-full max-w-6xl flex items-center justify-center relative z-10">

                {/* Visual Vortex Rings */}
                <div className="relative w-[35vw] h-[35vw] max-w-[500px] max-h-[500px]">

                    {/* Outer Plasma Ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                        className={`absolute inset-[-10%] border-4 border-dashed rounded-full opacity-30 shadow-[0_0_100px_rgba(79,70,229,0.2)] ${activeEra ? ERA_THEMES[activeEra].crystalColor : 'border-indigo-500'}`}
                    />

                    {/* Inner Rotating Ring */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                        className={`absolute inset-[-5%] border-2 rounded-full opacity-20 ${activeEra ? ERA_THEMES[activeEra].crystalColor : 'border-blue-400'}`}
                    />

                    {/* THE MAIN GATEWAY SURFACE */}
                    <motion.div
                        initial={false}
                        animate={activeEra ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0.8 }}
                        className="w-full h-full rounded-full bg-slate-900 border-8 border-white/10 shadow-[0_0_150px_rgba(0,0,0,0.5)] relative overflow-hidden flex items-center justify-center"
                    >
                        {/* Dynamic Background Mesh */}
                        <div className={`absolute inset-0 opacity-40 transition-colors duration-1000 ${activeEra ? ERA_THEMES[activeEra].crystalColor : 'bg-indigo-900/40'}`} style={{
                            backgroundImage: 'radial-gradient(circle, transparent 20%, #020617 70%)'
                        }} />

                        {/* HOLOGRAM PREVIEW */}
                        <AnimatePresence mode="wait">
                            {activeEra ? (
                                <motion.div
                                    key={activeEra}
                                    initial={{ scale: 0, rotate: 180, opacity: 0, filter: 'blur(40px)' }}
                                    animate={{ scale: 1, rotate: 0, opacity: 1, filter: 'blur(0px)' }}
                                    exit={{ scale: 2, opacity: 0, filter: 'blur(60px)' }}
                                    transition={{ type: 'spring', damping: 12 }}
                                    className="relative z-20 flex flex-col items-center gap-4"
                                >
                                    <span className="text-9xl drop-shadow-[0_0_50px_rgba(255,255,255,0.4)]">
                                        {hexToEmoji(ERA_THEMES[activeEra].emoji)}
                                    </span>
                                    <div className="px-6 py-2 bg-black/60 backdrop-blur-xl border border-white/20 rounded-full">
                                        <span className="text-xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">
                                            {ERA_THEMES[activeEra].name}
                                        </span>
                                    </div>

                                    {/* Stabilization Glitch FX */}
                                    {gatewayStatus === 'unstable' && (
                                        <motion.div
                                            animate={{ opacity: [0, 1, 0], x: [-2, 2, -2] }}
                                            transition={{ repeat: Infinity, duration: 0.1 }}
                                            className="absolute inset-0 bg-rose-500/20 mix-blend-overlay pointer-events-none rounded-full"
                                        />
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div key="idle" className="text-center p-12 flex flex-col items-center gap-6">
                                    <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border-4 border-dashed border-white/20 animate-pulse">
                                        <Cpu size={64} className="text-slate-600" />
                                    </div>
                                    <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">Awaiting Crystal Input</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Warp Particles */}
                        {isStabilizing && (
                            <motion.div
                                animate={{ scale: [1, 5], opacity: [0.5, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="absolute inset-0 border-[40px] border-white/30 rounded-full"
                            />
                        )}
                    </motion.div>
                </div>
            </div>

            {/* --- THE POWER CRYSTALS (LOWER CONTROLS) --- */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-end gap-12 z-50">
                {(Object.values(ERA_THEMES)).map((era) => (
                    <div key={era.id} className="flex flex-col items-center gap-4 group">
                        <div className="text-[10px] font-black text-white opacity-0 group-hover:opacity-60 transition-opacity uppercase tracking-widest">{era.esName}</div>
                        <motion.button
                            whileHover={{ scale: 1.1, y: -20 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => initializeEra(era.id)}
                            className={`w-24 h-40 ${era.crystalColor} rounded-t-[3rem] rounded-b-[1rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/20 relative overflow-hidden transition-all duration-500 ${activeEra === era.id ? 'brightness-150 scale-110 -translate-y-10 ring-8 ring-white/20' : 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}
                        >
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-white/30" />
                            {/* Refraction Lines */}
                            <div className="absolute top-0 left-4 w-px h-full bg-white/20" />
                            <div className="absolute top-0 right-4 w-px h-full bg-white/10" />

                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl drop-shadow-lg">{hexToEmoji(era.emoji)}</span>
                            </div>

                            {/* Tense Indicator */}
                            <div className="absolute bottom-4 inset-x-0 text-center">
                                <div className="text-[9px] font-black text-white/80 uppercase tracking-tighter leading-none mb-1">Charge</div>
                                <div className="text-xs font-black text-white italic">{era.tenseKey}</div>
                            </div>
                        </motion.button>
                        <div className={`w-20 h-1 rounded-full shadow-[0_0_20px_white] transition-colors ${activeEra === era.id ? era.crystalColor : 'bg-white/5'}`} />
                    </div>
                ))}
            </div>

            {/* --- SIDEBAR PANEL (MISSION INFO) --- */}
            <AnimatePresence>
                {activeEra && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className="fixed right-10 top-1/2 -translate-y-1/2 w-80 bg-white/10 backdrop-blur-3xl border border-white/20 p-10 rounded-[3rem] shadow-2xl flex flex-col gap-8 z-[60]"
                    >
                        <div className="flex items-center gap-3">
                            <Compass className="text-cyan-400 animate-spin-slow" />
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Protocol Active</span>
                        </div>

                        <div className="space-y-4">
                            <p className="text-2xl font-black text-white leading-tight italic uppercase tracking-tighter">
                                "{ERA_THEMES[activeEra].targetSentence}"
                            </p>
                            <div className="h-1 w-12 bg-white/20" />
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                                Required Tense: <span className="text-cyan-400">{ERA_THEMES[activeEra].tenseKey}</span>
                            </p>
                        </div>

                        <button
                            onClick={startSpeech}
                            disabled={isListening || gatewayStatus === 'synced'}
                            className={`w-full py-8 rounded-[2.5rem] flex flex-col items-center gap-2 border-4 transition-all ${isListening ? 'bg-rose-600 border-white animate-pulse' : 'bg-cyan-600 border-white hover:scale-105 shadow-[0_0_40px_rgba(6,182,212,0.4)]'}`}
                        >
                            {isListening ? (
                                <>
                                    <MicOff size={32} className="text-white" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Scanning Voice...</span>
                                </>
                            ) : (
                                <>
                                    <Mic size={32} className="text-white" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Inject Grammar</span>
                                </>
                            )}
                        </button>

                        {heardText && (
                            <div className="text-center p-4 bg-black/40 rounded-2xl border border-white/10">
                                <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Signal Received:</p>
                                <p className="text-xs font-black text-cyan-400 italic">"{heardText}"</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- BILINGUAL SUBTITLES --- */}
            <AnimatePresence>
                {currentSubtitle && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-8"
                    >
                        <div className="bg-white/90 backdrop-blur-2xl border-4 border-indigo-600 p-8 rounded-[3rem] shadow-2xl text-center relative">
                            <p className="text-2xl md:text-3xl font-black text-indigo-950 leading-tight">
                                {currentSubtitle.en}
                            </p>
                            <div className="h-[2px] w-full bg-slate-100 my-4 border-dashed border" />
                            <p className="text-lg md:text-xl text-slate-500 font-bold italic">
                                {currentSubtitle.es}
                            </p>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-6 py-1 rounded-full uppercase tracking-widest">
                                Translation Sync
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChronosGateway;
