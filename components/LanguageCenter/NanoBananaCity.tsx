import React, { useState, useEffect, useMemo, useRef } from 'react';
import { edgeTTS } from '@/services/edgeTTS';
import { motion, AnimatePresence } from 'framer-motion';
import { useNovaSound } from '@/hooks/useNovaSound';
import { AvatarDisplay } from '@/components/Gamification/AvatarDisplay';
import {
  Mic, Check, RotateCcw, ArrowLeft,
  Construction, Map, Volume2, Globe, Navigation, Compass, Pencil,
  Heart, VolumeX, Bot, Layout as LayoutIcon, ZoomIn, ZoomOut, Maximize2, Eye,
  Building2, Tractor, Anchor, Rocket, Moon, Sun, Cloud, Footprints, Trophy, Coins, Music,
  Home, Trees, GraduationCap, Landmark, Shield, Palette, Hospital, Castle, MapPin
} from 'lucide-react';

import { CATALOG, CityItem } from './CityCatalog';
// Import the separate worlds
import ZooZone from './ZooZone';
import SupermarketZone from './SupermarketZone';
import SportsZone from './SportsZone';
import FarmZone from './FarmZone';
import BeachZone from './BeachZone';
import SpaceZone from './SpaceZone';
import { MyHouseHub } from '@/components/MyHouse/MyHouseHub';

const hexToEmoji = (hex: string) => {
  if (!hex) return '❓';
  return hex.split('-').map(part => String.fromCodePoint(parseInt(part, 16))).join('');
};

// --- MAIN CITY ZONES ONLY (Urban & Services) ---
interface CityZone {
  id: string;
  name: string;
  nameEs: string;
  icon: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  x: number; y: number; w: number; h: number;
  categories: string[];   // which catalog categories belong here
  maxSlots: number;
  decoration: string;
}

const ZONES: CityZone[] = [
  // ROW 1 - RESIDENTIAL
  {
    id: 'residential', name: 'NEIGHBORHOOD', nameEs: 'Vecindario', icon: 'home',
    color: '#eff6ff', borderColor: '#3b82f6', bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)',
    x: 3, y: 3, w: 28, h: 27,
    categories: ['Home Items', 'Furniture', 'Clothes', 'Buildings'], // Houses go here
    maxSlots: 20,
    decoration: '1f4eb,1f6b2,1f415' // 📫🚲🐕 hex codes
  },
  // ROW 1 - CENTER: PLAZA / PARK
  {
    id: 'park', name: 'CENTRAL PARK', nameEs: 'Parque Central', icon: 'trees',
    color: '#f0fdf4', borderColor: '#16a34a', bgGradient: 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)',
    x: 40, y: 3, w: 24, h: 27,
    categories: ['Nature', 'Sky & Weather'],
    maxSlots: 20,
    decoration: '26f2,1f337,1f98b' // ⛲🌷🦋
  },
  // ROW 1 - RIGHT: SCHOOL/EDUCATION
  {
    id: 'school_zone', name: 'SCHOOL DIST.', nameEs: 'Zona Escolar', icon: 'graduation-cap',
    color: '#fff7ed', borderColor: '#ea580c', bgGradient: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
    x: 73, y: 3, w: 25, h: 27,
    categories: ['School & Learning'],
    maxSlots: 15,
    decoration: '1f4da,1f393,270f' // 📚🎓✏️
  },

  // ROW 2 - CITY CENTER (Downtown)
  {
    id: 'downtown', name: 'DOWNTOWN', nameEs: 'Centro', icon: 'landmark',
    color: '#f8fafc', borderColor: '#475569', bgGradient: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)',
    x: 3, y: 40, w: 28, h: 23,
    categories: ['Buildings', 'Infrastructure', 'Time & Dates'],
    maxSlots: 25,
    decoration: '1f3e2,1f3e6,1f696' // 🏢🏦🚕
  },
  // ROW 2 - CENTER: ROADS/TRANSIT HUB
  {
    id: 'transit', name: 'TRANSIT HUB', nameEs: 'Estación Central', icon: 'map-pin',
    color: '#f3f4f6', borderColor: '#1f2937', bgGradient: 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)',
    x: 40, y: 40, w: 24, h: 23,
    categories: ['Vehicles'],
    maxSlots: 20,
    decoration: '1f68c,1f689,1f6d1' // 🚌🚉🛑
  },
  // ROW 2 - RIGHT: SERVICES
  {
    id: 'services', name: 'SERVICES', nameEs: 'Servicios', icon: 'shield',
    color: '#e0e7ff', borderColor: '#4338ca', bgGradient: 'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 100%)',
    x: 73, y: 40, w: 25, h: 23,
    categories: ['People', 'Tools & Jobs'],
    maxSlots: 20,
    decoration: '1f692,1f693,1f6e0' // 🚒🚔🛠️
  },

  // ROW 3 - CULTURE & HEALTH
  {
    id: 'culture', name: 'CULTURE', nameEs: 'Cultura', icon: 'masks',
    color: '#fdf4ff', borderColor: '#a21caf', bgGradient: 'linear-gradient(135deg, #fae8ff 0%, #e879f9 100%)',
    x: 3, y: 73, w: 28, h: 25,
    categories: ['Arts & Expression', 'Musical Instruments', 'Emotions', 'Colors'],
    maxSlots: 20,
    decoration: '1f3a8,1f3bb,1f968' // 🎨🎻🥨
  },
  // ROW 3 - CENTER: HOSPITAL
  {
    id: 'hospital_zone', name: 'MEDICAL', nameEs: 'Zona Médica', icon: 'hospital',
    color: '#fef2f2', borderColor: '#dc2626', bgGradient: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)',
    x: 40, y: 73, w: 24, h: 25,
    categories: ['Body'],
    maxSlots: 15,
    decoration: '1f691,1f67a,1f48a' // 🚑🩺💊
  },
  // ROW 3 - RIGHT: FANTASY / SPECIAL
  {
    id: 'fantasy_zone', name: 'MAGIC LAND', nameEs: 'Tierra Mágica', icon: 'castle',
    color: '#fff1f2', borderColor: '#be123c', bgGradient: 'linear-gradient(135deg, #ffe4e6 0%, #fda4af 100%)',
    x: 73, y: 73, w: 25, h: 25,
    categories: ['Fantasy', 'Adjectives'], // Drag fantasy things here
    maxSlots: 15,
    decoration: '1f409,2728,1f9d9' // 🐉✨🧙‍♂️
  }
];

// Combine all categories that belong to the city
const CITY_CATEGORIES = ZONES.flatMap(z => z.categories);

// Map every catalog category to one or more zones
const categoryToZones: Record<string, string[]> = {};
ZONES.forEach(z => z.categories.forEach(cat => {
  if (!categoryToZones[cat]) categoryToZones[cat] = [];
  categoryToZones[cat].push(z.id);
}));

interface PlacedItem {
  id: string; hex: string; x: number; y: number; zoneId: string;
  enS: string; esS: string; w: string; scale: number;
}

type ViewState = 'city' | 'zoo' | 'market' | 'sports' | 'farm' | 'beach' | 'space' | 'house';

// BLUEPRINT MISSIONS (Bilingual)
const MISSIONS = [
  { id: 1, title: "Suburban Architect", titleEs: "Arquitecto", desc: "Place 3 Houses", descEs: "Pon 3 Casas", target: { cat: 'Buildings', count: 3, items: ['house', 'home'] }, reward: 50 },
  { id: 2, title: "Green Thumb", titleEs: "Jardinero", desc: "Plant 5 Trees", descEs: "Planta 5 Árboles", target: { cat: 'Nature', count: 5, items: ['tree', 'flower'] }, reward: 40 },
  { id: 3, title: "Traffic Control", titleEs: "Tráfico", desc: "Place 4 Vehicles", descEs: "Pon 4 Vehículos", target: { cat: 'Vehicles', count: 4, items: ['car', 'bus', 'truck'] }, reward: 60 },
  { id: 4, title: "Animal Lover", titleEs: "Amante de Animales", desc: "Find 2 Dogs", descEs: "Encuentra 2 Perros", target: { cat: 'Animals', count: 2, items: ['dog', 'puppy'] }, reward: 70 },
  { id: 5, title: "Space Explorer", titleEs: "Explorador Espacial", desc: "Launch 1 Rocket", descEs: "Lanza 1 Cohete", target: { cat: 'Vehicles', count: 1, items: ['rocket'] }, reward: 100 },
];

interface NanoBananaCityProps {
  onBack: () => void;
}

const NanoBananaCity: React.FC<NanoBananaCityProps> = ({ onBack }) => {
  const [currentView, setCurrentView] = useState<ViewState>('city');
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const { playClick, playHover, playSuccess, playStickerApply } = useNovaSound();
  const [selected, setSelected] = useState<any | null>(null);
  const [activeCat, setActiveCat] = useState('Buildings');
  const [isListening, setIsListening] = useState(false);

  // Earnings State
  const [sessionEarnings, setSessionEarnings] = useState(0);
  const [showEarningsModal, setShowEarningsModal] = useState(false);

  // Traffic Animation State
  const [trafficLight, setTrafficLight] = useState<'green' | 'red'>('green');

  // --- WOW FEATURES ---
  const [isNight, setIsNight] = useState(false);
  const [weather, setWeather] = useState<'sunny' | 'rain' | 'snow'>('sunny');
  const [speakingItem, setSpeakingItem] = useState<{ id: string, textEn: string, textEs: string } | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);

  // --- NEW: MISSIONS & ECONOMY & VISIT MODE ---
  const [novaCoins, setNovaCoins] = useState(150); // Start with some coins
  const [activeMission, setActiveMission] = useState(MISSIONS[0]);
  const [missionProgress, setMissionProgress] = useState(0);
  const [isVisitMode, setIsVisitMode] = useState(false);
  const [avatarPos, setAvatarPos] = useState({ x: 50, y: 50 }); // % coordinates
  const [currentSubtitle, setCurrentSubtitle] = useState<{ en: string, es: string } | null>(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [tutorText, setTutorText] = useState({ en: "Pick an item!", es: "¡Elige algo!" });
  const [xp, setXp] = useState(0);

  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [wrongZone, setWrongZone] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [focusedZone, setFocusedZone] = useState<string | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('nano_city_items_v2');
    if (saved) setPlacedItems(JSON.parse(saved));
    const savedCoins = localStorage.getItem('nano_coins');
    if (savedCoins) setNovaCoins(parseInt(savedCoins));
  }, []);

  useEffect(() => {
    localStorage.setItem('nano_city_items_v2', JSON.stringify(placedItems));
    localStorage.setItem('nano_coins', novaCoins.toString());
  }, [placedItems, novaCoins]);

  // Handle Mission Progress
  useEffect(() => {
    const relevantItems = placedItems.filter(p => {
      const itemCatalogEntry = Object.values(CATALOG).flat().find(i => i.id === p.id);
      if (!itemCatalogEntry) return false;
      return activeMission.target.items.some(k => p.id.includes(k) || p.w.toLowerCase().includes(k) || p.enS.toLowerCase().includes(k));
    });
    setMissionProgress(Math.min(relevantItems.length, activeMission.target.count));

    if (relevantItems.length >= activeMission.target.count) {
      if (!localStorage.getItem(`mission_${activeMission.id}_completed`)) {
        triggerFireworks();
        setNovaCoins(prev => prev + activeMission.reward);
        const msgEn = "Mission Completed! You earned Nova Coins!";
        const msgEs = "¡Misión Completada! ¡Ganaste Monedas Nova!";
        setCurrentSubtitle({ en: msgEn, es: msgEs });
        edgeTTS.speak(msgEn, "rachelle");
        edgeTTS.speak(msgEs, "lina");
        localStorage.setItem(`mission_${activeMission.id}_completed`, 'true');
        const nextId = (activeMission.id % MISSIONS.length) + 1;
        setActiveMission(MISSIONS.find(m => m.id === nextId) || MISSIONS[0]);
        setMissionProgress(0);
        setSessionEarnings(prev => prev + activeMission.reward);
        setTimeout(() => setCurrentSubtitle(null), 4000);
      }
    }
  }, [placedItems, activeMission]);

  const handleBankTransfer = () => {
    // 1. Deduct from Local Wallet (since rewards were added there)
    setNovaCoins(prev => Math.max(0, prev - sessionEarnings));

    // 2. Add to Savings (LocalStorage manual update to match NovaBank)
    const currentSavings = Number(localStorage.getItem('nova_bank_savings') || '200');
    const newSavings = currentSavings + sessionEarnings;
    localStorage.setItem('nova_bank_savings', newSavings.toString());

    // 3. Add Transaction
    const history = JSON.parse(localStorage.getItem('nova_bank_history') || '[]');
    const newTx = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'deposit',
      amount: sessionEarnings,
      description: 'Deposit from City Mission',
      descriptionEs: 'Depósito de Misión de Ciudad',
      date: new Date(),
      category: 'Bank'
    };
    localStorage.setItem('nova_bank_history', JSON.stringify([newTx, ...history].slice(0, 50)));

    playSuccess();
    onBack();
  };

  const handleBack = () => {
    if (sessionEarnings > 0) {
      playSuccess();
      setShowEarningsModal(true);
    } else {
      onBack();
    }
  };

  // Traffic Cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficLight(prev => prev === 'green' ? 'red' : 'green');
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Avatar Movement
  useEffect(() => {
    if (!isVisitMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      setAvatarPos(prev => {
        const step = 2;
        let newX = prev.x; let newY = prev.y;
        if (e.key === 'ArrowUp') newY -= step;
        if (e.key === 'ArrowDown') newY += step;
        if (e.key === 'ArrowLeft') newX -= step;
        if (e.key === 'ArrowRight') newX += step;
        return { x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) };
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisitMode]);

  // Citizens Loop
  useEffect(() => {
    const talkInterval = setInterval(() => {
      const citizens = placedItems;
      if (citizens.length > 0 && Math.random() > 0.6) {
        const randomCitizen = citizens[Math.floor(Math.random() * citizens.length)];
        const phrases = [
          { en: "Hello!", es: "¡Hola!" }, { en: "Nice day!", es: "¡Lindo día!" },
          { en: "I like this city!", es: "¡Me gusta esta ciudad!" }, { en: "So many cars!", es: "¡Tantos autos!" },
          { en: "I am happy!", es: "¡Estoy feliz!" }, { en: "Look at the sky!", es: "¡Mira el cielo!" },
        ];
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        setSpeakingItem({
          id: randomCitizen.id + randomCitizen.x,
          textEn: randomPhrase.en,
          textEs: randomPhrase.es
        });
        setTimeout(() => setSpeakingItem(null), 4000);
      }
    }, 8000);
    return () => clearInterval(talkInterval);
  }, [placedItems]);

  const triggerFireworks = () => {
    setShowFireworks(true);
    setTimeout(() => setShowFireworks(false), 3000);
  };

  const getTargetZones = (item: any): string[] => {
    const cat = Object.entries(CATALOG).find(([_, items]) => items.some(i => i.id === item.id));
    if (!cat) return [];
    return categoryToZones[cat[0]] || [];
  };

  const speakBilingual = async (target: any) => {
    // 1. Basic pronunciation
    setTutorText({ en: target.w, es: target.es });
    setCurrentSubtitle({ en: target.w, es: target.es });

    await edgeTTS.speak(target.w, "rachelle");
    await edgeTTS.speak(target.es, "lina");

    // Small delay before clearing or next part
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

    // 3. Prompt for repetition
    setTutorText({ en: `Pronounce: ${target.w}`, es: `Pronuncia: ${target.w}` });
    const promptEn = "Now, your turn! Repeat after me: " + target.w;
    const promptEs = "¡Ahora, tu turno! Repite después de mí: " + target.w;
    setCurrentSubtitle({ en: promptEn, es: promptEs });
    await edgeTTS.speak(promptEn, "rachelle");
    await edgeTTS.speak(promptEs, "lina");
    setTimeout(() => setCurrentSubtitle(null), 3000);

    startVoice(target);
  };

  const startVoice = (target: any) => {
    if (!('webkitSpeechRecognition' in window)) {
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
      if (heard.includes(target.w.toLowerCase()) || (target.w.length > 4 && heard.includes(target.w.toLowerCase().slice(0, 4)))) {
        setIsUnlocked(true);
        setTutorText({ en: "Great! Place it!", es: "¡Bien! ¡Ponlo!" });
        playSuccess();
      } else {
        setTutorText({ en: "Almost! Try again!", es: "¡Casi! ¡Intenta de nuevo!" });
      }
    };
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  // ZOOM LOGIC
  const zoomToZone = (zoneId: string) => {
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone || !mapContainerRef.current) return;
    setFocusedZone(zoneId);
    setZoomLevel(2.2);
    const containerRect = mapContainerRef.current.getBoundingClientRect();
    const zoneCenterX = (zone.x + zone.w / 2) / 100;
    const zoneCenterY = (zone.y + zone.h / 2) / 100;
    const offsetX = (0.5 - zoneCenterX) * containerRect.width;
    const offsetY = (0.5 - zoneCenterY) * (containerRect.height * 1.5); // Tune this multiplier
    setPanOffset({ x: offsetX, y: offsetY });
  };
  const resetZoom = () => {
    setZoomLevel(1);
    setIsVisitMode(false); // Creating building mode quits visit mode
    setFocusedZone(null);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoneClick = (e: React.MouseEvent, zone: CityZone) => {
    e.stopPropagation();
    if (isVisitMode) return; // Can't build in visit mode
    if (!selected || !isUnlocked) return;

    // ECONOMY CHECK
    const cost = 10;
    if (novaCoins < cost) {
      const msgEn = "You need more Nova Coins! Do missions!";
      const msgEs = "¡Necesitas más Monedas Nova! ¡Haz misiones!";
      setCurrentSubtitle({ en: msgEn, es: msgEs });
      edgeTTS.speak(msgEn, "rachelle");
      edgeTTS.speak(msgEs, "lina");
      setTimeout(() => setCurrentSubtitle(null), 3000);
      return;
    }

    const validZones = getTargetZones(selected);
    if (validZones.length > 0 && !validZones.includes(zone.id)) {
      setWrongZone(zone.id);
      setTimeout(() => setWrongZone(null), 1000);

      const firstValidZoneName = ZONES.find(z => z.id === validZones[0])?.name || 'correct zone';
      const firstValidZoneNameEs = ZONES.find(z => z.id === validZones[0])?.nameEs || 'zona correcta';
      const msgEn = `That goes in the ${firstValidZoneName}!`;
      const msgEs = `¡Eso va en la ${firstValidZoneNameEs}!`;
      setCurrentSubtitle({ en: msgEn, es: msgEs });
      edgeTTS.speak(msgEn, "rachelle");
      edgeTTS.speak(msgEs, "lina");
      playClick();
      setTimeout(() => setCurrentSubtitle(null), 3000);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    let localX = ((e.clientX - rect.left) / rect.width) * 100;
    let localY = ((e.clientY - rect.top) / rect.height) * 100;

    // COLLISION PREVENTION (Nudge items away from existing ones)
    const overlapThreshold = 8; // % distance
    let attempts = 0;
    let collision = true;

    while (collision && attempts < 8) {
      collision = false;
      // Check against all items in this specific zone
      const zoneItems = getZoneItems(zone.id);

      for (const item of zoneItems) {
        const dx = localX - item.x;
        const dy = localY - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < overlapThreshold) {
          collision = true;
          // Push away in the direction of the offset, or random if perfect overlap
          let angle = Math.atan2(dy, dx);
          if (dist === 0) angle = Math.random() * Math.PI * 2;

          localX += Math.cos(angle) * (overlapThreshold + 2);
          localY += Math.sin(angle) * (overlapThreshold + 2);
          break;
        }
      }
      attempts++;
    }
    // Clamp to keep inside zone
    localX = Math.max(5, Math.min(95, localX));
    localY = Math.max(5, Math.min(95, localY));

    playStickerApply();

    const newItem: PlacedItem = {
      id: selected.id, hex: selected.hex,
      x: localX, y: localY, zoneId: zone.id,
      enS: selected.enS, esS: selected.esS, w: selected.w, scale: 1
    };

    setPlacedItems(prev => [...prev, newItem]);
    setNovaCoins(prev => prev - cost); // DEDUCT COST

    // Auto Zoom
    zoomToZone(zone.id);
    setTimeout(() => resetZoom(), 2500);

    setSelected(null);
    setIsUnlocked(false);
  };

  const getZoneItems = (zoneId: string) => placedItems.filter(i => i.zoneId === zoneId);

  // --- SUB-VIEWS ---
  if (currentView === 'zoo') return <ZooZone onBack={() => setCurrentView('city')} />;
  if (currentView === 'market') return <SupermarketZone onBack={() => setCurrentView('city')} />;
  if (currentView === 'sports') return <SportsZone onBack={() => setCurrentView('city')} />;
  if (currentView === 'farm') return <FarmZone onBack={() => setCurrentView('city')} />;
  if (currentView === 'beach') return <BeachZone onBack={() => setCurrentView('city')} />;
  if (currentView === 'space') return <SpaceZone onBack={() => setCurrentView('city')} />;

  // @ts-ignore
  if (currentView === 'house') return <MyHouseHub onClose={() => setCurrentView('city')} />;

  // Dynamic Audio Label & Weather with Bilingual support
  const getAmbientSoundLabel = () => {
    // Return a JSX element with both lines
    if (isNight) return (<span>Night Crickets 🦗 <br /><span className="text-[9px] italic opacity-80">Grillos Nocturnos</span></span>);
    if (weather === 'rain') return (<span>Heavy Rain 🌧️ <br /><span className="text-[9px] italic opacity-80">Lluvia Fuerte</span></span>);
    if (weather === 'snow') return (<span>Winter Wind 🌬️ <br /><span className="text-[9px] italic opacity-80">Viento de Invierno</span></span>);
    return (<span>City Bustle 🏙️ <br /><span className="text-[9px] italic opacity-80">Ruido de Ciudad</span></span>);
  };

  return (
    <div className={`h-screen flex flex-col md:flex-row overflow-hidden font-sans transition-colors duration-1000 ${isNight ? 'bg-slate-900 text-gray-100' : 'bg-[#f0f4f8] text-gray-800'}`}>

      {/* SIDEBAR - REDESIGNED */}
      <div className={`w-full md:w-[380px] h-full flex flex-col relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.15)] transition-colors duration-1000 shrink-0 ${isNight ? 'bg-slate-900 border-r border-slate-700' : 'bg-white border-r border-indigo-100'}`}>

        {/* 1. HEADER & STATUS */}
        <div className={`p-4 pb-2 z-10 transition-colors duration-1000 ${isNight ? 'bg-slate-900' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={handleBack} className={`p-2 rounded-xl transition-all active:scale-95 ${isNight ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <ArrowLeft size={20} />
            </button>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform overflow-hidden ${isNight ? 'bg-indigo-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
              <AvatarDisplay size="md" showBackground={false} />
            </div>
            <div className="flex-1">
              <h1 className={`text-2xl font-black italic tracking-tighter leading-none mb-1 ${isNight ? 'text-indigo-300' : 'text-slate-800'}`}>
                CITY BUILDER
              </h1>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isNight ? 'text-slate-500' : 'text-slate-400'}`}>Architect Mode</span>
                <div className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-black flex items-center gap-1 shadow-sm">
                  <Coins size={12} strokeWidth={3} /> {novaCoins}
                </div>
              </div>
            </div>

            {/* TOOLBAR */}
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => setIsNight(!isNight)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-sm ${isNight ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {isNight ? <Moon size={18} fill="currentColor" /> : <Sun size={18} className="text-orange-500" fill="currentColor" />}
              </button>
              <button onClick={() => setWeather(w => w === 'sunny' ? 'rain' : w === 'rain' ? 'snow' : 'sunny')}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-sm ${isNight ? 'bg-slate-800 text-blue-300' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'}`}
              >
                {weather === 'sunny' ? <Sun size={18} /> : weather === 'rain' ? <Cloud size={18} /> : <span className="text-lg">❄️</span>}
              </button>
            </div>
          </div>


          {/* WORLD TRAVEL GRID - MINI APPS */}
          <div className={`mx-0 mb-4 px-1 py-2 rounded-2xl border transition-colors ${isNight ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex justify-between items-center mb-2 px-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isNight ? 'text-indigo-300' : 'text-slate-400'}`}>Travel / Viajar</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => setCurrentView('zoo')} className="group flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all group-active:scale-95 group-hover:scale-110 ${isNight ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-600'}`}>🦁</div>
                <span className={`text-[9px] font-bold ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>Zoo</span>
              </button>
              <button onClick={() => setCurrentView('market')} className="group flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all group-active:scale-95 group-hover:scale-110 ${isNight ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-600'}`}>🛒</div>
                <span className={`text-[9px] font-bold ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>Mart</span>
              </button>
              <button onClick={() => setCurrentView('sports')} className="group flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all group-active:scale-95 group-hover:scale-110 ${isNight ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-600'}`}>⚽</div>
                <span className={`text-[9px] font-bold ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>Sport</span>
              </button>
              <button onClick={() => setCurrentView('farm')} className="group flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all group-active:scale-95 group-hover:scale-110 ${isNight ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-600'}`}>🚜</div>
                <span className={`text-[9px] font-bold ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>Farm</span>
              </button>
              {/* Row 2 */}
              <button onClick={() => setCurrentView('beach')} className="group flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all group-active:scale-95 group-hover:scale-110 ${isNight ? 'bg-cyan-900 text-cyan-200' : 'bg-cyan-100 text-cyan-600'}`}>🏖️</div>
                <span className={`text-[9px] font-bold ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>Beach</span>
              </button>
              <button onClick={() => setCurrentView('space')} className="group flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all group-active:scale-95 group-hover:scale-110 ${isNight ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-600'}`}>🚀</div>
                <span className={`text-[9px] font-bold ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>Space</span>
              </button>
              <button onClick={() => setCurrentView('house')} className="group flex flex-col items-center gap-1 col-span-2">
                <div className={`w-full h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-all group-active:scale-95 group-hover:scale-105 ${isNight ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-600'}`}>🏠 My House</div>
              </button>
            </div>
          </div>

          {/* CATEGORY NAVIGATOR - PILL SHAPED */}
          <div className="relative">
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar snap-x">
              {[
                { id: 'Buildings', icon: '🏙️', label: 'City' },
                { id: 'Infrastructure', icon: '🚦', label: 'Roads' },
                { id: 'Nature', icon: '🌳', label: 'Nature' },
                { id: 'Vehicles', icon: '🚗', label: 'Cars' },
                { id: 'People', icon: '👮', label: 'People' },
                { id: 'School & Learning', icon: '🎒', label: 'School' },
                { id: 'Home Items', icon: '🏠', label: 'Home' },
                { id: 'Fantasy', icon: '🏰', label: 'Magic' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { playClick(); setActiveCat(cat.id); }}
                  className={`flex-none snap-center px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 border-2 ${activeCat === cat.id
                    ? (isNight ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-105' : 'bg-slate-800 border-slate-900 text-white shadow-lg scale-105')
                    : (isNight ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300')
                    }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-xs font-black uppercase whitespace-nowrap">{cat.label}</span>
                </button>
              ))}
            </div>
            {/* Gradient fade for scroll hint */}
            <div className={`absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l pointer-events-none ${isNight ? 'from-slate-900' : 'from-white'}`} />
          </div>
        </div>

        {/* 2. MAIN GRID AREA - SCROLLABLE */}
        <div className={`flex-1 overflow-y-auto px-4 py-2 custom-scrollbar ${isNight ? ('bg-slate-900/50') : 'bg-slate-50'}`}>
          <h3 className={`text-[10px] font-black uppercase tracking-widest mb-3 opacity-60 ml-1 ${isNight ? 'text-indigo-200' : 'text-slate-500'}`}>
            {activeCat} - Catalog
          </h3>

          <div className="grid grid-cols-2 gap-3 pb-32"> {/* Extra padding bottom for fixed panel */}
            {(CATALOG[activeCat] || []).map((item: CityItem) => (
              <button
                key={item.id}
                onClick={() => {
                  playClick();
                  setSelected(item);
                  const isPilot = localStorage.getItem('nova_user_name') === 'Andrés (Test Pilot)';
                  setIsUnlocked(isPilot);
                  speakBilingual(item);
                }}
                className={`group relative aspect-[4/3] rounded-2xl border-b-4 transition-all duration-200 flex flex-col items-center justify-center gap-2
                            ${selected?.id === item.id
                    ? (isNight ? 'bg-indigo-600 border-indigo-800 ring-4 ring-indigo-500/30 translate-y-1' : 'bg-blue-500 border-blue-700 text-white ring-4 ring-blue-200 translate-y-1')
                    : (isNight ? 'bg-slate-800 border-slate-950 text-slate-300 hover:bg-slate-700 hover:-translate-y-1' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1')
                  }
                        `}
              >
                {/* HOLOGRAPHIC BG EFFECT FOR SELECTED */}
                {selected?.id === item.id && (
                  <div className="absolute inset-0 bg-white/10 animate-pulse rounded-xl" />
                )}

                <div className="w-12 h-12 transition-transform duration-300 group-hover:scale-110 drop-shadow-md flex items-center justify-center text-4xl">
                  {hexToEmoji(item.hex)}
                </div>

                <div className="flex flex-col items-center leading-none z-10">
                  <span className={`text-xs font-black uppercase ${selected?.id === item.id ? 'text-white' : ''}`}>{item.w}</span>
                  <span className={`text-[9px] font-bold ${selected?.id === item.id ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-500'}`}>{item.es}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. BOTTOM PANEL - BUILDER STATION (FIXED) */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className={`absolute bottom-0 left-0 right-0 p-4 border-t-2 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30 
                        ${isNight ? 'bg-slate-800 border-indigo-500/50' : 'bg-white border-blue-100'}
                    `}
            >
              <div className="flex items-center gap-4">
                {/* BIG PREVIEW */}
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner
                            ${isNight ? 'bg-indigo-900/50' : 'bg-blue-50'}
                        `}>
                  <motion.div
                    key={selected.id}
                    initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                    className="text-5xl drop-shadow-xl"
                  >
                    {hexToEmoji(selected.hex)}
                  </motion.div>
                </div>

                {/* INFO & ACTION */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-lg font-black truncate ${isNight ? 'text-white' : 'text-slate-800'}`}>{tutorText.en}</h4>
                  <p className={`text-xs font-bold italic mb-2 truncate ${isNight ? 'text-indigo-300' : 'text-slate-400'}`}>{tutorText.es}</p>

                  {!isUnlocked ? (
                    <button onClick={() => speakBilingual(selected)}
                      className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95
                                        ${isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 hover:shadow-lg'
                        }
                                    `}
                    >
                      {isListening ? <><Mic size={14} /> LISTENING...</> : <><Volume2 size={14} /> SAY TO UNLOCK</>}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 rounded-xl bg-green-500 text-white text-xs font-black uppercase flex items-center justify-center gap-2 animate-bounce shadow-green-200 shadow-lg">
                      <Check size={16} strokeWidth={4} /> UNLOCKED! PLACE IT!
                    </div>
                  )}
                </div>
              </div>
              {/* COST BADGE */}
              <div className="absolute top-0 right-4 -translate-y-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-[10px] font-black border-2 border-white shadow-sm flex items-center gap-1">
                COST: 10 <Coins size={10} />
              </div>
            </motion.div>
          ) : (
            // EMPTY STATE HINT
            <div className={`absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center text-center opacity-50 pointer-events-none pb-8
                    ${isNight ? 'text-slate-600' : 'text-slate-300'}
                `}>
              <Construction size={48} className="mb-2" />
              <p className="text-sm font-black uppercase">Select an item to build</p>
            </div>
          )}
        </AnimatePresence>

      </div>

      {/* MAP CANVAS (RESTORED ANIMATIONS + NIGHT MODE + WEATHER + NEWS) */}
      <div ref={mapContainerRef} className="flex-1 relative overflow-hidden">

        {/* === NEWS TICKER (Fixed at Bottom) === */}
        <div className="absolute bottom-4 inset-x-4 h-8 bg-black/80 backdrop-blur rounded-lg z-[80] flex items-center overflow-hidden border border-white/20">
          <div className="px-2 bg-red-600 h-full flex items-center text-[10px] font-black text-white uppercase z-10 shrink-0">News / Noticias</div>
          <div className="flex-1 overflow-hidden relative h-full">
            <div className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap animate-[marquee_20s_linear_infinite] text-white text-[10px] font-bold">
              BREAKING: New Zoo opening this weekend! 🦁 • ÚLTIMA HORA: ¡Abre Zoológico este fin de semana! 🦁 • Mayor says "Eat more bananas!" 🍌 • El Alcalde dice "¡Coman más bananas!" 🍌 • Space Station launch! 🚀 • ¡Lanzamiento de Estación Espacial! 🚀 • School is open! 🏫 • ¡La Escuela está abierta! 🏫
            </div>
          </div>
        </div>

        {/* SOUNDSCAPE BADGE */}
        <div className="absolute top-4 left-4 z-[60] bg-black/50 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur hover:bg-black/70 cursor-pointer">
          <Volume2 size={12} className="text-green-400 animate-pulse" /> {getAmbientSoundLabel()}
        </div>

        {/* ZOOM & VISIT UI */}
        <div className="absolute top-4 right-4 z-[60] flex flex-col gap-2">
          {/* VISIT MODE BUTTON */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button onClick={() => { setIsVisitMode(!isVisitMode); if (!isVisitMode) { setZoomLevel(2.5); setAvatarPos({ x: 50, y: 50 }); } else resetZoom(); }}
              className={`w-12 h-12 rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)] flex items-center justify-center transition-all active:translate-y-1 active:shadow-none border-2 ${isVisitMode ? 'bg-orange-500 border-orange-600 text-white scale-110 ring-4 ring-orange-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <Footprints size={24} />
            </button>

            <div className="h-2" /> {/* spacer */}

            <button onClick={() => setZoomLevel(z => Math.min(z + 0.3, 2.5))} className={`w-12 h-12 rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)] flex items-center justify-center transition-all active:translate-y-1 active:shadow-none border-2 ${isNight ? 'bg-slate-700 border-slate-900 text-white hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}><ZoomIn size={24} /></button>
            <button onClick={() => setZoomLevel(z => Math.max(z - 0.3, 0.6))} className={`w-12 h-12 rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)] flex items-center justify-center transition-all active:translate-y-1 active:shadow-none border-2 ${isNight ? 'bg-slate-700 border-slate-900 text-white hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}><ZoomOut size={24} /></button>
            <button onClick={resetZoom} className={`w-12 h-12 rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)] flex items-center justify-center transition-all active:translate-y-1 active:shadow-none border-2 ${isNight ? 'bg-indigo-600 border-indigo-800 text-white hover:bg-indigo-500' : 'bg-yellow-400 border-yellow-600 text-white hover:bg-yellow-500'}`}><Maximize2 size={24} /></button>
          </div>
        </div>

        {/* VISIT MODE INSTRUCTIONS */}
        <AnimatePresence>
          {isVisitMode && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-16 left-1/2 -translate-x-1/2 z-[70] bg-orange-500 text-white px-4 py-2 rounded-full font-black text-xs shadow-lg flex flex-col items-center">
              <div className="flex items-center gap-2"><Navigation size={12} className="animate-spin-slow" /> ARROW KEYS TO WALK!</div>
              <div className="text-[10px] opacity-90 italic">¡FLECHAS PARA CAMINAR!</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full h-full relative"
          style={{
            transform: `scale(${zoomLevel}) translate(${isVisitMode ? (-avatarPos.x + 50) * 2 : panOffset.x / zoomLevel}px, ${isVisitMode ? (-avatarPos.y + 50) * 2 : panOffset.y / zoomLevel}px)`,
            transformOrigin: isVisitMode ? 'center center' : 'center center',
            transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
          }}>

          {/* SKY BACKGROUND (Animated & Dynamic) */}
          <div className={`absolute top-0 left-0 right-0 h-[35%] overflow-hidden transition-colors duration-2000 ease-in-out ${isNight ? 'bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#312e81]' : (weather === 'rain' ? 'bg-gradient-to-b from-slate-600 to-slate-400' : (weather === 'snow' ? 'bg-gradient-to-b from-slate-300 to-white' : 'bg-gradient-to-b from-blue-400 via-sky-300 to-blue-100'))}`}>

            {/* Sun / Moon */}
            <div className={`absolute top-10 right-20 w-16 h-16 rounded-full shadow-[0_0_40px_rgba(253,224,71,0.6)] transition-all duration-1000 ${isNight ? 'bg-slate-100 shadow-[0_0_50px_rgba(255,255,255,0.8)] scale-75' : (weather !== 'sunny' ? 'opacity-20' : 'bg-yellow-300 animate-pulse')}`}>
              {isNight && <div className="absolute top-2 left-3 w-4 h-4 bg-slate-300 rounded-full opacity-50" />}
            </div>

            {/* Stars (Night Only) */}
            <AnimatePresence>
              {isNight && weather === 'sunny' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                      style={{ top: `${Math.random() * 80}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clouds */}
            <div className={`absolute top-[20%] left-[10%] animate-[float_20s_linear_infinite] transition-opacity duration-1000 ${isNight ? 'opacity-10' : 'opacity-80'}`} style={{ animationDuration: '30s' }}>
              <svg width="100" height="40" viewBox="0 0 100 40" className={`fill-current ${weather !== 'sunny' ? 'text-gray-400' : 'text-white'}`}><path d="M10,30 Q25,10 50,30 T90,30" stroke="currentColor" strokeWidth="20" strokeLinecap="round" /></svg>
            </div>
          </div>

          {/* GROUND */}
          <div className={`absolute bottom-0 left-0 right-0 h-[65%] transition-colors duration-1000 ${isNight ? 'bg-[#064e3b]' : (weather === 'snow' ? 'bg-slate-100' : 'bg-[#86efac]')}`}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #16a34a 0, #16a34a 1px, transparent 0, transparent 50%)', backgroundSize: '16px 16px' }} />
          </div>

          {/* === ANIMATED ROADS === */}
          {/* Vertical Roads */}
          <div className="absolute left-[33%] top-0 bottom-0 w-[5%] bg-gray-700 shadow-xl z-10 flex justify-center">
            <div className="h-full w-[2px] dashed-line opacity-50" style={{ backgroundImage: `linear-gradient(to bottom, ${isNight ? '#f59e0b' : '#facc15'} 50%, transparent 50%)`, backgroundSize: '1px 20px' }} />
          </div>
          <div className="absolute left-[66%] top-0 bottom-0 w-[5%] bg-gray-700 shadow-xl z-10 flex justify-center">
            <div className="h-full w-[2px] dashed-line opacity-50" style={{ backgroundImage: `linear-gradient(to bottom, ${isNight ? '#f59e0b' : '#facc15'} 50%, transparent 50%)`, backgroundSize: '1px 20px' }} />
          </div>

          {/* Horizontal Roads */}
          <div className="absolute top-[32%] left-0 right-0 h-[6%] bg-gray-700 shadow-xl z-20 flex items-center">
            <div className="w-full h-[2px] dashed-line opacity-50" style={{ backgroundImage: `linear-gradient(to right, ${isNight ? '#f59e0b' : '#facc15'} 50%, transparent 50%)`, backgroundSize: '20px 1px' }} />
          </div>
          <div className="absolute top-[65%] left-0 right-0 h-[6%] bg-gray-700 shadow-xl z-20 flex items-center">
            <div className="w-full h-[2px] dashed-line opacity-50" style={{ backgroundImage: `linear-gradient(to right, ${isNight ? '#f59e0b' : '#facc15'} 50%, transparent 50%)`, backgroundSize: '20px 1px' }} />
          </div>

          {/* === TRAFFIC LIGHTS & CARS === */}
          <div className="absolute top-[28%] left-[30%] z-50 bg-gray-800 p-1 rounded-lg border border-gray-600 shadow-lg flex flex-col gap-1 w-4">
            <div className={`w-2 h-2 rounded-full ${trafficLight === 'red' ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-red-900'}`} />
            <div className={`w-2 h-2 rounded-full ${trafficLight === 'green' ? 'bg-green-500 shadow-[0_0_8px_lime]' : 'bg-green-900'}`} />
          </div>

          {/* Animated Vehicles with HEADLIGHTS at night! */}
          {trafficLight === 'green' ? (
            <>
              <div className="absolute left-[34%] text-2xl z-30 transition-all duration-[4000ms] ease-linear" style={{ top: '100%', animation: 'driveDown 4s linear infinite' }}>
                🚘 {isNight && <div className="absolute top-full left-0 w-8 h-12 bg-yellow-200/30 blur-md transform -translate-x-1" />}
              </div>
              <div className="absolute left-[67%] text-2xl z-30 transition-all duration-[5000ms] ease-linear delay-700" style={{ top: '-10%', animation: 'driveDown 5s linear infinite' }}>🚍</div>
              {/* MOTORCYCLE - ZOOMING! */}
              <div className="absolute left-[36%] text-xl z-40 transition-all duration-[3000ms] ease-linear delay-200" style={{ top: '-10%', animation: 'driveDown 2.5s linear infinite' }}>🏍️</div>
            </>
          ) : (
            <>
              <div className="absolute left-[34%] top-[25%] text-2xl z-30">🚘</div>
              <div className="absolute left-[67%] top-[25%] text-2xl z-30">🚍</div>
              {/* Taxi moves Right (Left->Right), needs to face Right (Flip) */}
              <div className="absolute top-[33%] text-2xl z-30 scale-x-[-1]" style={{ left: '-10%', animation: 'driveRight 6s linear infinite' }}>🚕</div>
              {/* Race Car moves Left (Right->Left), needs to face Left (Default) */}
              <div className="absolute top-[66%] text-2xl z-30" style={{ right: '-10%', animation: 'driveLeft 7s linear infinite' }}>🏎️</div>
              {/* MOTORCYCLE - CROSSING! */}
              <div className="absolute top-[35%] text-xl z-40 scale-x-[-1]" style={{ left: '-10%', animation: 'driveRight 3s linear infinite', animationDelay: '1s' }}>🏍️</div>
            </>
          )}

          {/* Pedestrians */}
          <div className="absolute top-[40%] left-[10%] text-xl z-20 animate-bounce" style={{ animationDuration: '2s' }}>🚶</div>
          <div className="absolute top-[60%] right-[5%] text-xl z-20 animate-bounce" style={{ animationDuration: '1.5s' }}>🚶‍♀️</div>
          <div className="absolute top-[10%] left-[50%] text-xl z-20 animate-bounce" style={{ animationDuration: '3s' }}>🐕</div>


          {/* === CITY ZONES === */}
          {ZONES.map(zone => {
            const items = getZoneItems(zone.id);
            const isTarget = selected && isUnlocked && getTargetZones(selected).includes(zone.id);
            const isWrong = wrongZone === zone.id;
            const isHovered = hoveredZone === zone.id;

            return (
              <div key={zone.id}
                onClick={(e) => handleZoneClick(e, zone)}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`absolute z-40 transition-all duration-300 cursor-pointer ${isTarget ? 'ring-4 ring-yellow-400 shadow-[0_0_60px_rgba(253,224,71,0.6)] scale-[1.02]' : ''}`}
                style={{
                  left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%`
                }}
              >
                <div className={`absolute inset-x-0 bottom-0 h-[80%] rounded-2xl overflow-hidden border-2 border-b-6 shadow-xl transition-all duration-300 ${isNight ? 'brightness-75' : 'brightness-100'}`}
                  style={{
                    background: zone.bgGradient,
                    borderColor: zone.borderColor,
                    transform: isHovered ? 'translateY(-5px)' : 'translateY(0)'
                  }}>

                  {/* DECORATIVE ROOF */}
                  <div className="absolute -top-3 left-0 right-0 h-4 bg-black/5 rounded-[50%]" />

                  {/* Zone Name Badge - REDESIGNED: NO BACKGROUND, ELEGANT HUD STYLE */}
                  <div className={`absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-1 z-20 transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
                    <div className={`p-2 rounded-2xl flex items-center justify-center shadow-lg transition-colors overflow-hidden border backdrop-blur-md ${isNight ? 'bg-indigo-950/40 border-indigo-400/30' : 'bg-white/40 border-white/60'}`}>
                      {zone.id === 'residential' && <Home size={24} className={isNight ? 'text-indigo-300' : 'text-blue-600'} />}
                      {zone.id === 'park' && <Trees size={24} className={isNight ? 'text-green-300' : 'text-green-600'} />}
                      {zone.id === 'school_zone' && <GraduationCap size={24} className={isNight ? 'text-orange-300' : 'text-orange-600'} />}
                      {zone.id === 'downtown' && <Landmark size={24} className={isNight ? 'text-slate-300' : 'text-slate-600'} />}
                      {zone.id === 'transit' && <MapPin size={24} className={isNight ? 'text-amber-300' : 'text-amber-600'} />}
                      {zone.id === 'services' && <Shield size={24} className={isNight ? 'text-indigo-300' : 'text-indigo-600'} />}
                      {zone.id === 'culture' && <Palette size={24} className={isNight ? 'text-fuchsia-300' : 'text-fuchsia-600'} />}
                      {zone.id === 'hospital_zone' && <Hospital size={24} className={isNight ? 'text-red-300' : 'text-red-600'} />}
                      {zone.id === 'fantasy_zone' && <Castle size={24} className={isNight ? 'text-rose-300' : 'text-rose-600'} />}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] text-center drop-shadow-md ${isNight ? 'text-white' : 'text-slate-800'}`}>
                      {zone.name}
                    </span>
                  </div>

                  {/* NIGHT LIGHTS (Windows) */}
                  <AnimatePresence>
                    {isNight && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="absolute w-2 h-3 bg-yellow-200 rounded-sm shadow-[0_0_10px_orange]"
                            style={{ top: `${20 + Math.random() * 60}%`, left: `${10 + Math.random() * 80}%` }} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Feedback Overlay */}
                  {isWrong && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center animate-pulse z-50">
                      <span className="text-4xl filter drop-shadow-md">❌</span>
                    </div>
                  )}

                  {/* Items */}
                  {items.map((item, i) => (
                    <motion.div key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Play click sound
                        playClick();
                        // Speak name again!
                        speakBilingual(item);
                        // Optional: Highlight briefly?
                      }}
                      initial={{ scale: 0, opacity: 0, y: -20 }} animate={{ scale: item.scale, opacity: 1, y: 0 }}
                      className="absolute z-10 flex items-center justify-center text-3xl select-none cursor-pointer hover:scale-125 transition-transform"
                      style={{ left: `${item.x}%`, top: `${item.y}%`, width: '28px', height: '28px', transform: 'translate(-50%, -50%)' }}
                    >
                      {hexToEmoji(item.hex)}

                      {/* TALKING BUBBLE */}
                      <AnimatePresence>
                        {speakingItem?.id === (item.id + item.x) && ( // simple matching
                          <motion.div initial={{ opacity: 0, scale: 0, y: 10 }} animate={{ opacity: 1, scale: 1, y: -40 }} exit={{ opacity: 0, scale: 0 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 bg-white rounded-xl p-2 shadow-xl border-2 border-black z-50 whitespace-nowrap">
                            <div className="text-[10px] font-black text-black leading-tight">{speakingItem.textEn}</div>
                            <div className="text-[8px] font-bold text-gray-500 italic leading-tight">{speakingItem.textEs}</div>
                            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-black transform rotate-45"></div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}

                  {/* Decoration Emoji Background - REDESIGNED: HIGH QUALITY SVGS, NO BACKGROUND */}
                  <div className="absolute bottom-2 right-2 flex gap-1 opacity-10 group-hover:opacity-40 transition-all duration-700 text-sm">
                    {zone.decoration.split(',').map((hex, idx) => (
                      <span key={idx} className="grayscale hover:grayscale-0 transition-all cursor-default">
                        {hexToEmoji(hex.trim())}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* === PLAYER AVATAR (VISIT MODE) === */}
          <AnimatePresence>
            {isVisitMode && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                className="absolute z-50 w-16 h-16 drop-shadow-2xl filter"
                style={{
                  left: `${avatarPos.x}%`,
                  top: `${avatarPos.y}%`,
                  transform: 'translate(-50%, -100%)' // Anchor at feet
                }}
              >
                <AvatarDisplay size="md" showBackground={false} />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/30 rounded-[50%]" /> {/* Shadow */}
              </motion.div>
            )}
          </AnimatePresence>

          {/* === WEATHER OVERLAYS === */}
          {/* RAIN */}
          {weather === 'rain' && (
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden bg-blue-900/10">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="absolute w-[2px] h-[30px] bg-blue-400 opacity-60 animate-[rain_1s_linear_infinite]"
                  style={{
                    top: '-30px',
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                    animationDelay: `${Math.random()}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* SNOW */}
          {weather === 'snow' && (
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden bg-white/10">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="absolute w-2 h-2 bg-white rounded-full opacity-80 animate-[snow_3s_linear_infinite]"
                  style={{
                    top: '-10px',
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                    animationDelay: `${Math.random()}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* FIREWORKS OVERLAY */}
          <AnimatePresence>
            {showFireworks && (
              <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center">
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} className="text-6xl">
                  🎆
                </motion.div>
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} className="text-6xl absolute top-1/4 left-1/4">
                  ✨
                </motion.div>
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} className="text-6xl absolute bottom-1/4 right-1/4">
                  🎉
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>

        {/* BILINGUAL SUBTITLE OVERLAY */}
        <AnimatePresence>
          {currentSubtitle && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-[100] pointer-events-none"
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

        {/* Global Styles & Animations */}
        <style>{`
          @keyframes driveDown { from { top: -10%; } to { top: 110%; } }
          @keyframes driveRight { from { left: -10%; } to { left: 110%; } }
          @keyframes driveLeft { from { right: -10%; } to { right: 110%; } }
          @keyframes float { 0% { transform: translateX(-10px); } 50% { transform: translateX(10px); } 100% { transform: translateX(-10px); } }
          @keyframes rain { from { transform: translateY(0); } to { transform: translateY(100vh); } }
          @keyframes snow { from { transform: translateY(0) rotate(0deg); } to { transform: translateY(100vh) rotate(360deg); } }
          @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        `}</style>
      </div>
      {/* EARNINGS MODAL */}
      <AnimatePresence>
        {showEarningsModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border-4 border-yellow-400 relative overflow-hidden text-center"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Coins size={120} /></div>

              <h2 className="text-2xl font-black text-slate-800 mb-1 uppercase">Session Complete!</h2>
              <p className="text-slate-500 font-bold mb-6">¡Sesión Completada!</p>

              <div className="bg-yellow-50 rounded-2xl p-6 mb-8 border-2 border-yellow-200">
                <p className="text-xs font-black text-yellow-600 uppercase mb-2">You Earned / Ganaste</p>
                <div className="text-5xl font-black text-slate-900 flex items-center justify-center gap-2">
                  <span>🪙</span> {sessionEarnings}
                </div>
              </div>

              <p className="text-sm font-bold text-slate-600 mb-4 px-4">
                Where do you want to keep your coins?
                <br />
                <span className="text-slate-400 font-normal">¿Dónde quieres guardar tus monedas?</span>
              </p>

              <div className="space-y-3 relative z-10">
                <button onClick={onBack} className="w-full py-4 bg-white border-4 border-slate-100 rounded-2xl font-black text-slate-600 uppercase hover:bg-slate-50 transition-colors flex items-center justify-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform"><Coins size={16} /></div>
                  <span>Keep in Wallet / Billetera</span>
                </button>
                <button onClick={handleBankTransfer} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase hover:bg-emerald-600 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Building2 size={16} /></div>
                  <span>Send to Bank / Banco</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default NanoBananaCity;