import React, { useState, useEffect, useRef } from 'react';
import { edgeTTS } from '@/services/edgeTTS';
import { motion, AnimatePresence } from 'framer-motion';
import { useNovaSound } from '@/hooks/useNovaSound';
import { AvatarDisplay } from '@/components/Gamification/AvatarDisplay';
import {
    Mic, Activity, ZoomIn, ZoomOut, Maximize2, RotateCcw, Eye, Map, ArrowLeft, Volume2
} from 'lucide-react';
import { CATALOG, CityItem } from './CityCatalog';

const hexToEmoji = (hex: string) => {
    if (!hex) return '❓';
    return hex.split('-').map(part => String.fromCodePoint(parseInt(part, 16))).join('');
};

// --- ZOO ZONES ---
interface ZooZoneDef {
    id: string;
    name: string;
    nameEs: string;
    icon: string;
    color: string;
    borderColor: string;
    bgGradient: string;
    x: number; y: number; w: number; h: number;
    categories: string[];
    maxSlots: number;
    decoration: string;
}

const ZOO_ZONES: ZooZoneDef[] = [
    {
        id: 'savanna', name: 'SAVANNA', nameEs: 'Sabana', icon: '🦁',
        color: '#fef3c7', borderColor: '#d97706', bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fde68a 100%)',
        x: 5, y: 10, w: 28, h: 35,
        categories: ['Animals'],
        maxSlots: 15,
        decoration: '🌾🦒🐘'
    },
    {
        id: 'jungle', name: 'JUNGLE', nameEs: 'Selva', icon: '🦍',
        color: '#dcfce7', borderColor: '#15803d', bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #86efac 100%)',
        x: 36, y: 10, w: 28, h: 35,
        categories: ['Animals'],
        maxSlots: 15,
        decoration: '🌴🐒🐍'
    },
    {
        id: 'arctic', name: 'ARCTIC', nameEs: 'Ártico', icon: '🐧',
        color: '#eff6ff', borderColor: '#3b82f6', bgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #bfdbfe 100%)',
        x: 67, y: 10, w: 28, h: 35,
        categories: ['Animals', 'Sky & Weather'],
        maxSlots: 12,
        decoration: '❄️🐻‍❄️🧊'
    },
    {
        id: 'aquarium', name: 'AQUARIUM', nameEs: 'Acuario', icon: '🐬',
        color: '#e0f2fe', borderColor: '#0ea5e9', bgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #7dd3fc 100%)',
        x: 5, y: 55, w: 28, h: 35,
        categories: ['Animals', 'Nature'],
        maxSlots: 15,
        decoration: '🌊🐠🐡'
    },
    {
        id: 'reptiles', name: 'REPTILES', nameEs: 'Reptiles', icon: '🐊',
        color: '#ecfccb', borderColor: '#65a30d', bgGradient: 'linear-gradient(135deg, #f7fee7 0%, #bef264 100%)',
        x: 36, y: 55, w: 28, h: 35,
        categories: ['Animals'],
        maxSlots: 12,
        decoration: '🦎🐢🌿'
    },
    {
        id: 'aviary', name: 'AVIARY', nameEs: 'Aviario', icon: '🦜',
        color: '#fae8ff', borderColor: '#c026d3', bgGradient: 'linear-gradient(135deg, #fdf4ff 0%, #f0abfc 100%)',
        x: 67, y: 55, w: 28, h: 35,
        categories: ['Animals'],
        maxSlots: 15,
        decoration: '🦅🦉🦋'
    }
];

interface PlacedItem {
    id: string; hex: string; x: number; y: number; zoneId: string;
    enS: string; esS: string; w: string; scale: number;
}

interface ZooZoneProps {
    onBack: () => void;
}

const ZooZone: React.FC<ZooZoneProps> = ({ onBack }) => {
    const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
    const { playClick, playHover, playSuccess, playStickerApply } = useNovaSound();
    const [selected, setSelected] = useState<any | null>(null);
    const [isListening, setIsListening] = useState(false);

    const [isUnlocked, setIsUnlocked] = useState(false);
    const [tutorText, setTutorText] = useState({ en: "Pick an animal!", es: "¡Elige un animal!" });
    const [xp, setXp] = useState(0);

    const [hoveredZone, setHoveredZone] = useState<string | null>(null);
    const [wrongZone, setWrongZone] = useState<string | null>(null);
    const [currentSubtitle, setCurrentSubtitle] = useState<{ en: string, es: string } | null>(null);

    const [zoomLevel, setZoomLevel] = useState(1);
    const [focusedZone, setFocusedZone] = useState<string | null>(null);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const mapRef = useRef<HTMLDivElement>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Load specific animals for Zoo
    // We filter catalog for Animals mainly, but enable general placement
    const zooItems = CATALOG['Animals'] || [];

    useEffect(() => {
        const saved = localStorage.getItem('nova_zoo_items');
        if (saved) setPlacedItems(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('nova_zoo_items', JSON.stringify(placedItems));
    }, [placedItems]);

    const speakBilingual = async (target: any, bypassUnlock = false) => {
        // 1. Basic pronunciation
        setTutorText({ en: target.w, es: target.es });
        setCurrentSubtitle({ en: target.w, es: target.es });

        await edgeTTS.speak(target.tts || target.w, "rachelle");
        await edgeTTS.speak(target.es, "lina");

        await new Promise(r => setTimeout(r, 1000));
        setCurrentSubtitle(null);

        // 2. Example sentences
        if (target.enS) {
            setTutorText({ en: target.enS, es: target.esS });
            setCurrentSubtitle({ en: target.enS, es: target.esS });

            await edgeTTS.speak("Listen to the example.", "rachelle");
            await edgeTTS.speak(target.enS, "rachelle");
            await edgeTTS.speak(target.esS, "lina");

            await new Promise(r => setTimeout(r, 1500));
            setCurrentSubtitle(null);
        }

        if (!bypassUnlock) {
            setTutorText({ en: `Say: ${target.w}`, es: `Di: ${target.w}` });
            startVoice(target);
        }
    };

    const startVoice = (target: any) => {
        if (!('webkitSpeechRecognition' in window)) {
            // Fallback for no speech recognition
            setIsUnlocked(true);
            return;
        }
        setIsListening(true);
        const rec = new (window as any).webkitSpeechRecognition();
        rec.lang = 'en-US';
        rec.onresult = (e: any) => {
            const heard = e.results[0][0].transcript.toLowerCase();
            const confidence = e.results[0][0].confidence;

            // Relaxed match logic - if word is heard, accept it regardless of confidence
            if (heard.includes(target.w.toLowerCase()) || (target.w.length > 3 && heard.includes(target.w.toLowerCase().slice(0, 3)))) {
                setIsUnlocked(true);
                setTutorText({ en: "Great! Place it in a habitat!", es: "¡Bien! ¡Ponlo en un hábitat!" });
                playSuccess();
            } else {
                setTutorText({ en: "Almost! Try again.", es: "¡Casi! Inténtalo de nuevo." });
            }
        };
        rec.onend = () => setIsListening(false);
        rec.start();
    };

    const zoomToZone = (zoneId: string) => {
        const zone = ZOO_ZONES.find(z => z.id === zoneId);
        if (!zone || !mapContainerRef.current) return;
        setFocusedZone(zoneId);
        setZoomLevel(2.2);
        const containerRect = mapContainerRef.current.getBoundingClientRect();
        const zoneCenterX = (zone.x + zone.w / 2) / 100;
        const zoneCenterY = (zone.y + zone.h / 2) / 100;
        const offsetX = (0.5 - zoneCenterX) * containerRect.width;
        const offsetY = (0.5 - zoneCenterY) * containerRect.height;
        setPanOffset({ x: offsetX, y: offsetY });
    };

    const resetZoom = () => {
        setZoomLevel(1);
        setFocusedZone(null);
        setPanOffset({ x: 0, y: 0 });
    };

    const handleZoneClick = (e: React.MouseEvent, zone: ZooZoneDef) => {
        e.stopPropagation();
        if (!selected || !isUnlocked) return;

        // In Zoo, we are a bit more flexible - any animal fits any zone? 
        // Or we could enforce logic (Penguin -> Arctic).
        // Let's enforce basic logic if we can infer it, otherwise allow.
        // For now, allow freedom to encourage play, maybe add hints later.

        // Simple logic check for Arctic
        if (zone.id === 'arctic' && !['penguin', 'bear', 'wolf', 'fish', 'whale'].some(s => selected.id.includes(s))) {
            // Optional: warn user? For now let's just let it happen but maybe change background color or something.
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const localX = ((e.clientX - rect.left) / rect.width) * 100;
        const localY = ((e.clientY - rect.top) / rect.height) * 100;

        playStickerApply();

        const newItem: PlacedItem = {
            id: selected.id, hex: selected.hex,
            x: localX, y: localY, zoneId: zone.id,
            enS: selected.enS, esS: selected.esS, w: selected.w, scale: 1
        };

        setPlacedItems(prev => [...prev, newItem]);
        setXp(v => v + 30);
        playSuccess();
        zoomToZone(zone.id);
        setTimeout(() => {
            resetZoom();
        }, 2000);
        setSelected(null);
        setIsUnlocked(false);
    };

    const getZoneItems = (zoneId: string) => placedItems.filter(i => i.zoneId === zoneId);

    return (
        <div className="h-full bg-green-50 flex flex-col md:flex-row overflow-hidden font-sans text-gray-800 relative">
            {/* SIDEBAR */}
            <div className="w-full md:w-[280px] h-full flex flex-col bg-white border-r-4 border-green-500 relative z-20 shadow-2xl">
                <div className="p-3 bg-green-500 text-white">
                    <button onClick={onBack} className="flex items-center gap-2 mb-2 hover:bg-green-600 p-1 rounded transition-colors">
                        <ArrowLeft size={16} /> <span className="text-xs font-black uppercase">Back to Map</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="text-3xl">🦁</div>
                        <div>
                            <h1 className="text-lg font-black leading-none">WILD ZOO</h1>
                            <p className="text-[10px] opacity-80 font-bold uppercase">Animal Sanctuary</p>
                        </div>
                    </div>
                </div>

                {/* SELECTION AREA */}
                <div className="p-3 bg-green-50 border-b-2 border-green-200">
                    <div className="bg-white rounded-xl p-3 border-2 border-green-200 min-h-[80px] flex flex-col justify-center items-center text-center">
                        {selected ? (
                            <div className="w-full">
                                <div className="w-10 h-10 mx-auto mb-1 flex items-center justify-center text-3xl">{hexToEmoji(selected.hex)}</div>
                                <p className="font-black text-sm">{selected.w}</p>
                                {!isUnlocked ? (
                                    <button onClick={() => speakBilingual(selected)} className={`mt-2 w-full py-1.5 rounded-lg text-xs font-black uppercase ${isListening ? 'bg-red-500 text-white' : 'bg-green-500 text-white shadow-lg  hover:bg-green-400'}`}>
                                        {isListening ? 'Listening...' : '🎤 Say It!'}
                                    </button>
                                ) : (
                                    <div className="mt-2 text-[10px] font-black text-green-600 bg-green-100 py-1 rounded">Select a Habitat! 👉</div>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs font-bold text-gray-400">Select an animal to place!</p>
                        )}
                    </div>
                </div>

                {/* ANIMAL LIST */}
                <div className="flex-1 overflow-y-auto p-2">
                    <div className="grid grid-cols-3 gap-2">
                        {zooItems.map((item) => (
                            <button key={item.id} onClick={() => {
                                playClick();
                                setSelected(item);
                                const isPilot = localStorage.getItem('nova_user_name') === 'Andrés (Test Pilot)';
                                setIsUnlocked(isPilot);
                            }}
                                className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${selected?.id === item.id ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-100 hover:border-green-300'}`}>
                                <div className="w-8 h-8 flex items-center justify-center text-2xl">{hexToEmoji(item.hex)}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAP AREA */}
            <div ref={mapContainerRef} className="flex-1 relative overflow-hidden bg-[#86efac]">
                {/* Background Decoration */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(#15803d 2px, transparent 2px)',
                    backgroundSize: '30px 30px'
                }} />

                {/* CONTROLS */}
                <div className="absolute top-4 right-4 z-[50] flex flex-col gap-2">
                    <button onClick={() => setZoomLevel(z => Math.min(z + 0.5, 3))} className="p-2 bg-white rounded-lg shadow-lg"><ZoomIn size={20} /></button>
                    <button onClick={() => setZoomLevel(z => Math.max(z - 0.5, 0.5))} className="p-2 bg-white rounded-lg shadow-lg"><ZoomOut size={20} /></button>
                    <button onClick={resetZoom} className="p-2 bg-white rounded-lg shadow-lg"><Maximize2 size={20} /></button>
                </div>

                {/* CANVAS */}
                <div className="w-full h-full relative transition-transform duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)"
                    style={{
                        transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                        transformOrigin: 'center center'
                    }}
                >
                    {/* PATHS */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.3 }}>
                        <path d="M 15% 50% Q 50% 20% 85% 50%" stroke="#fcd34d" strokeWidth="20" fill="none" strokeDasharray="10 10" />
                        <path d="M 50% 10% V 90%" stroke="#fcd34d" strokeWidth="20" fill="none" strokeDasharray="10 10" />
                    </svg>

                    {ZOO_ZONES.map(zone => {
                        const isTarget = selected && isUnlocked;
                        const items = getZoneItems(zone.id);

                        return (
                            <div key={zone.id}
                                onClick={(e) => handleZoneClick(e, zone)}
                                className={`absolute rounded-[2rem] border-4 transition-all duration-300 cursor-pointer overflow-hidden ${isTarget ? 'hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]' : ''}`}
                                style={{
                                    left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%`,
                                    background: zone.bgGradient,
                                    borderColor: zone.borderColor,
                                    boxShadow: `0 10px 20px -5px ${zone.borderColor}66`
                                }}
                            >
                                {/* HEADER */}
                                <div className="absolute top-0 inset-x-0 h-8 bg-black/5 flex items-center justify-center border-b border-black/5">
                                    <span className="text-[10px] font-black uppercase text-black/50 tracking-widest">{zone.name}</span>
                                </div>

                                {/* ITEMS */}
                                {items.map((item, i) => (
                                    <motion.div key={i}
                                        initial={{ scale: 0 }} animate={{ scale: item.scale }}
                                        className="absolute cursor-pointer"
                                        style={{ left: `${item.x}%`, top: `${item.y}%`, width: '30px', height: '30px', transform: 'translate(-50%, -50%)' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playClick();
                                            speakBilingual(item, true); // Repeat pronunciation
                                        }}
                                    >
                                        <div className="w-full h-full flex items-center justify-center text-2xl drop-shadow-md">
                                            {hexToEmoji(item.hex)}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* BILINGUAL SUBTITLE OVERLAY */}
                <AnimatePresence>
                    {currentSubtitle && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
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
                                <div className="h-px w-24 bg-white/20 my-1" />
                                <p className="text-indigo-300 text-lg md:text-xl font-bold italic opacity-90">
                                    {currentSubtitle.es}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ZooZone;
