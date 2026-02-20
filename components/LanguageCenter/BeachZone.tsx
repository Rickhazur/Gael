import React, { useState, useEffect } from 'react';
import { edgeTTS } from '@/services/edgeTTS';
import { motion, AnimatePresence } from 'framer-motion';
import { useNovaSound } from '@/hooks/useNovaSound';
import { ArrowLeft, ZoomIn, ZoomOut, Compass, Volume2 } from 'lucide-react';
import { CATALOG } from './CityCatalog';

const hexToEmoji = (hex: string) => {
    if (!hex) return '❓';
    return hex.split('-').map(part => String.fromCodePoint(parseInt(part, 16))).join('');
};

const BEACH_ZONES = [
    {
        id: 'deep_sea', name: 'DEEP OCEAN', nameEs: 'Océano Profundo', icon: '🐳',
        color: '#1e3a8a', borderColor: '#172554', bgGradient: 'linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%)',
        x: 0, y: 70, w: 100, h: 30,
        categories: ['Animals', 'Vehicles'],
        decoration: '🐙🦈⚓'
    },
    {
        id: 'shore', name: 'SHORELINE', nameEs: 'Orilla', icon: '🌊',
        color: '#60a5fa', borderColor: '#2563eb', bgGradient: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
        x: 0, y: 40, w: 100, h: 30,
        categories: ['Animals', 'Vehicles'],
        decoration: '🐠🚤🏄'
    },
    {
        id: 'sand', name: 'SANDY BEACH', nameEs: 'Playa de Arena', icon: '🏖️',
        color: '#fde047', borderColor: '#ca8a04', bgGradient: 'linear-gradient(180deg, #fef08a 0%, #fde047 100%)',
        x: 0, y: 0, w: 70, h: 40,
        categories: ['Nature', 'People', 'Food & Items'],
        decoration: '🦀🌴⛱️'
    },
    {
        id: 'island', name: 'ISLAND', nameEs: 'Isla', icon: '🏝️',
        color: '#86efac', borderColor: '#16a34a', bgGradient: 'linear-gradient(135deg, #bbf7d0 0%, #4ade80 100%)',
        x: 75, y: 5, w: 20, h: 30,
        categories: ['Nature'],
        decoration: '🌋🏴‍☠️🦜'
    }
];

interface PlacedItem {
    id: string; hex: string; x: number; y: number; zoneId: string;
    enS: string; esS: string; w: string; scale: number;
}

interface BeachZoneProps {
    onBack: () => void;
}

const BeachZone: React.FC<BeachZoneProps> = ({ onBack }) => {
    const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
    const { playClick, playSuccess, playStickerApply } = useNovaSound();
    const [selected, setSelected] = useState<any | null>(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [currentSubtitle, setCurrentSubtitle] = useState<{ en: string, es: string } | null>(null);

    // Custom filter for Beach items
    const beachItems = [
        ...(CATALOG['Nature'] || []).filter(i => ['beach', 'sand', 'palm', 'island', 'water', 'ocean', 'sun'].some(k => i.id.includes(k) || i.w.toLowerCase().includes(k))),
        ...(CATALOG['Animals'] || []).filter(i => ['fish', 'shark', 'whale', 'dolphin', 'octopus', 'crab', 'turtle', 'seagull'].some(k => i.id.includes(k) || i.w.toLowerCase().includes(k))),
        ...(CATALOG['Vehicles'] || []).filter(i => ['boat', 'ship', 'sub', 'canoe', 'kayak', 'ferry'].some(k => i.id.includes(k) || i.w.toLowerCase().includes(k))),
        // Add some random beach stuff if found
    ];

    useEffect(() => {
        const saved = localStorage.getItem('nova_beach_items');
        if (saved) setPlacedItems(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('nova_beach_items', JSON.stringify(placedItems));
    }, [placedItems]);

    const speakBilingual = async (target: any, bypassUnlock = false) => {
        // 1. Basic pronunciation
        setCurrentSubtitle({ en: target.w, es: target.es });
        await edgeTTS.speak(target.w, "rachelle");
        await edgeTTS.speak(target.es, "lina");

        await new Promise(r => setTimeout(r, 1000));
        setCurrentSubtitle(null);

        // 2. Example sentences
        if (target.enS) {
            setCurrentSubtitle({ en: target.enS, es: target.esS });
            await edgeTTS.speak("Listen to the example.", "rachelle");
            await edgeTTS.speak(target.enS, "rachelle");
            await edgeTTS.speak(target.esS, "lina");

            await new Promise(r => setTimeout(r, 1500));
            setCurrentSubtitle(null);
        }

        if (!bypassUnlock) setIsUnlocked(true);
    };

    const handleZoneClick = (e: React.MouseEvent, zone: any) => {
        e.stopPropagation();
        if (!selected || !isUnlocked) return;

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
        playSuccess();
        setSelected(null);
        setIsUnlocked(false);
    };

    const getZoneItems = (zoneId: string) => placedItems.filter(i => i.zoneId === zoneId);

    return (
        <div className="h-full bg-cyan-100 flex flex-col md:flex-row overflow-hidden font-sans text-gray-800 relative">
            <div className="w-full md:w-[280px] h-full flex flex-col bg-white border-r-4 border-cyan-500 relative z-20 shadow-2xl">
                <div className="p-3 bg-cyan-500 text-white">
                    <button onClick={onBack} className="flex items-center gap-2 mb-2 hover:bg-cyan-600 p-1 rounded transition-colors">
                        <ArrowLeft size={16} /> <span className="text-xs font-black uppercase">Back to Map</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="text-3xl">🏖️</div>
                        <div>
                            <h1 className="text-lg font-black leading-none">SUNNY BEACH</h1>
                            <p className="text-[10px] opacity-80 font-bold uppercase">Ocean Adventures</p>
                        </div>
                    </div>
                </div>

                <div className="p-3 bg-cyan-50 border-b-2 border-cyan-200">
                    <div className="bg-white rounded-xl p-3 border-2 border-cyan-200 min-h-[80px] flex flex-col justify-center items-center text-center">
                        {selected ? (
                            <div className="w-full">
                                <div className="w-10 h-10 mx-auto mb-1 flex items-center justify-center text-3xl">{hexToEmoji(selected.hex)}</div>
                                <p className="font-black text-sm">{selected.w}</p>
                                {!isUnlocked ? (
                                    <button onClick={() => speakBilingual(selected)} className="mt-2 w-full py-1.5 rounded-lg text-xs font-black uppercase bg-cyan-500 text-white shadow-lg hover:bg-cyan-400">
                                        🔊 Life Guard!
                                    </button>
                                ) : (
                                    <div className="mt-2 text-[10px] font-black text-cyan-600 bg-cyan-100 py-1 rounded">Splash it! 👇</div>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs font-bold text-gray-400">Surf's up!</p>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    <div className="grid grid-cols-3 gap-2">
                        {beachItems.map((item) => (
                            <button key={item.id} onClick={() => {
                                playClick();
                                setSelected(item);
                                const isPilot = localStorage.getItem('nova_user_name') === 'Andrés (Test Pilot)';
                                setIsUnlocked(isPilot);
                            }}
                                className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${selected?.id === item.id ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-200' : 'border-gray-100 hover:border-cyan-300'}`}>
                                <div className="w-8 h-8 flex items-center justify-center text-2xl">{hexToEmoji(item.hex)}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAP AREA */}
            <div className="flex-1 relative overflow-hidden bg-[#bae6fd]">

                {/* Wave Animation */}
                <div className="absolute inset-x-0 bottom-[60%] h-4 bg-white/30 animate-pulse" />
                <div className="absolute inset-x-0 bottom-[30%] h-4 bg-white/20 animate-pulse delay-75" />

                {BEACH_ZONES.map(zone => {
                    const items = getZoneItems(zone.id);
                    const isTarget = selected && isUnlocked;

                    return (
                        <div key={zone.id}
                            onClick={(e) => handleZoneClick(e, zone)}
                            className={`absolute overflow-hidden transition-all duration-300 cursor-pointer ${isTarget ? 'ring-4 ring-cyan-300 z-10' : ''}`}
                            style={{
                                left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%`,
                                background: zone.bgGradient,
                                borderColor: zone.borderColor
                            }}
                        >
                            <div className="absolute top-2 left-2 text-white/50 text-[10px] font-black uppercase">{zone.name}</div>
                            {/* Items */}
                            {items.map((item, i) => (
                                <motion.div key={i}
                                    initial={{ scale: 0 }} animate={{ scale: item.scale }}
                                    className="absolute cursor-pointer"
                                    style={{ left: `${item.x}%`, top: `${item.y}%`, width: '32px', height: '32px', transform: 'translate(-50%, -50%)' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        playClick();
                                        speakBilingual(item, true); // Repeat pronunciation
                                    }}
                                >
                                    <div className="w-full h-full flex items-center justify-center text-3xl drop-shadow-md">
                                        {hexToEmoji(item.hex)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    );
                })}

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

export default BeachZone;
