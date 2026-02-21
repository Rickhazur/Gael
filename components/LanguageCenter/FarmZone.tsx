import React, { useState, useEffect, useRef, useMemo } from 'react';
import { edgeTTS } from '@/services/edgeTTS';
import { motion, AnimatePresence } from 'framer-motion';
import { useNovaSound } from '@/hooks/useNovaSound';
import { ArrowLeft, Sun, Moon, CloudRain, Droplets, Milk, CheckCircle, Sparkles, Volume2, Star, Mic, Play, Wallet, Building2, RotateCcw, RotateCw } from 'lucide-react';
import { ShoppingBag, Plus } from 'lucide-react';
import { CATALOG } from './CityCatalog';
import { useLearningProgress } from '../../hooks/useLearningProgress';
import { useGamification } from '@/hooks/useGamification';
import { AvatarDisplay } from '@/components/Gamification/AvatarDisplay';
import { AvatarProvider } from '@/context/AvatarContext';
import EarningsExitModal from '@/components/Gamification/EarningsExitModal';
import { cn } from '@/lib/utils';

// --- DATA ---
const CROP_CATEGORIES = {
    basics: { name: 'Grains & Forage', nameEs: 'Granos y Forrajes', color: 'bg-yellow-100' },
    veggies: { name: 'Veggies & Fruits', nameEs: 'Hortalizas y Frutas', color: 'bg-green-100' },
    herbs: { name: 'Herbs & Plants', nameEs: 'Hierbas y Plantas', color: 'bg-emerald-50' },
    fast: { name: 'Fast Crops', nameEs: 'Rápido Crecimiento', color: 'bg-blue-50' }
};

const CROP_TYPES = [
    { id: 'grass', category: 'basics', name: 'Grass', nameEs: 'Pasto', article: 'El', seed: '🟤', sprout: '🌱', ripe: '🌿' },
    { id: 'corn', category: 'basics', name: 'Corn', nameEs: 'Maíz', article: 'El', seed: '🟤', sprout: '🌱', ripe: '🌽' },
    { id: 'wheat', category: 'basics', name: 'Wheat', nameEs: 'Trigo', article: 'El', seed: '🟤', sprout: '🌿', ripe: '🌾' },
    { id: 'cotton', category: 'basics', name: 'Cotton', nameEs: 'Algodón', article: 'El', seed: '🔘', sprout: '🌱', ripe: '☁️' },
    { id: 'canola', category: 'basics', name: 'Canola', nameEs: 'Canola', article: 'La', seed: '🟡', sprout: '🌿', ripe: '🌼' },
    { id: 'soy', category: 'basics', name: 'Soybean', nameEs: 'Soja', article: 'La', seed: '🫘', sprout: '🌱', ripe: '🫛' },
    { id: 'hay', category: 'basics', name: 'Hay', nameEs: 'Heno', article: 'El', seed: '🟤', sprout: '🌿', ripe: '🧺' },
    { id: 'alfalfa', category: 'basics', name: 'Alfalfa', nameEs: 'Alfalfa', article: 'La', seed: '🟢', sprout: '🌱', ripe: '🍀' },
    { id: 'carrot', category: 'veggies', name: 'Carrot', nameEs: 'Zanahoria', article: 'La', seed: '🌰', sprout: '🌱', ripe: '🥕' },
    { id: 'spinach_v', category: 'veggies', name: 'Spinach', nameEs: 'Espinacas', article: 'Las', seed: '🔘', sprout: '🌱', ripe: '🥬' },
    { id: 'tomato_cherry', category: 'veggies', name: 'Cherry Tomato', nameEs: 'Tomate Cherry', article: 'El', seed: '🔴', sprout: '🪴', ripe: '🍒' },
    { id: 'tomato_san', category: 'veggies', name: 'San Marzano', nameEs: 'Tomate', article: 'El', seed: '🟤', sprout: '🌱', ripe: '🍅' },
    { id: 'beans', category: 'veggies', name: 'Beans', nameEs: 'Frijoles', article: 'Los', seed: '🫘', sprout: '🌿', ripe: '🫘' },
    { id: 'turmeric', category: 'veggies', name: 'Turmeric', nameEs: 'Cúrcuma', article: 'La', seed: '🟧', sprout: '🌱', ripe: '🟠' },
    { id: 'fennel', category: 'veggies', name: 'Fennel', nameEs: 'Hinojo', article: 'El', seed: '🟤', sprout: '🌿', ripe: '🌿' },
    { id: 'potato', category: 'veggies', name: 'Potato', nameEs: 'Patata', article: 'La', seed: '🥔', sprout: '🌱', ripe: '🥔' },
    { id: 'avocado', category: 'veggies', name: 'Avocado', nameEs: 'Aguacate', article: 'El', seed: '🥑', sprout: '🌳', ripe: '🥑' },
    { id: 'guava', category: 'veggies', name: 'Guava', nameEs: 'Guayaba', article: 'La', seed: '🍈', sprout: '🌳', ripe: '🍈' },
    { id: 'passion', category: 'herbs', name: 'Passion Fruit', nameEs: 'Pasionaria', article: 'La', seed: '🟣', sprout: '🌿', ripe: '🟣' },
    { id: 'ficus', category: 'herbs', name: 'Ficus', nameEs: 'Ficus', article: 'El', seed: '🟤', sprout: '🌱', ripe: '🌳' },
    { id: 'melissa', category: 'herbs', name: 'Lemon Balm', nameEs: 'Toronjil', article: 'El', seed: '🟢', sprout: '🌱', ripe: '🌿' },
    { id: 'jade', category: 'herbs', name: 'Jade Tree', nameEs: 'Árbol de Jade', article: 'El', seed: '🟢', sprout: '🌱', ripe: '🪴' },
    { id: 'daisy', category: 'herbs', name: 'Daisy', nameEs: 'Margaritas', article: 'Las', seed: '🟡', sprout: '🌱', ripe: '💐' },
    { id: 'beet', category: 'herbs', name: 'Beetroot', nameEs: 'Remolacha', article: 'La', seed: '🟤', sprout: '🌱', ripe: '🍠' },
    { id: 'lettuce', category: 'fast', name: 'Lettuce', nameEs: 'Lechuga', article: 'La', seed: '🔘', sprout: '🌱', ripe: '🥬' },
    { id: 'radish', category: 'fast', name: 'Radish', nameEs: 'Rábano', article: 'El', seed: '🔴', sprout: '🌱', ripe: '🔴' },
    { id: 'onion', category: 'fast', name: 'Green Onion', nameEs: 'Cebolla', article: 'La', seed: '🟤', sprout: '🌱', ripe: '🧅' },
    { id: 'oats', category: 'basics', name: 'Oats', nameEs: 'Avena', article: 'La', seed: '🟤', sprout: '🌱', ripe: '🌾' },
    { id: 'grains', category: 'basics', name: 'Grains', nameEs: 'Granos', article: 'Los', seed: '🟤', sprout: '🌱', ripe: '🌾' },
    { id: 'aquatic_plants', category: 'herbs', name: 'Aquatic Plants', nameEs: 'Plantas acuáticas', article: 'Las', seed: '🟢', sprout: '🌱', ripe: '🌿' },
    { id: 'algae', category: 'herbs', name: 'Algae', nameEs: 'Algas', article: 'Las', seed: '🟢', sprout: '🌱', ripe: '🌿' },
    { id: 'shrubs', category: 'basics', name: 'Shrubs', nameEs: 'Arbustos', article: 'Los', seed: '🟤', sprout: '🌱', ripe: '🌿' },
    { id: 'roots', category: 'veggies', name: 'Roots', nameEs: 'Raíces', article: 'Las', seed: '🟤', sprout: '🌱', ripe: '🍠' },
    { id: 'pellets', category: 'fast', name: 'Animal Food', nameEs: 'Croquetas', article: 'Las', seed: '🔘', sprout: '🌱', ripe: '📦' },
];

const ANIMALS = [
    { id: 'cow', name: 'Cow', nameEs: 'Vaca', article: 'La', icon: '🐄', food: ['grass', 'hay', 'alfalfa', 'corn', 'grains'], product: 'Milk 🥛', productId: 'milk', sound: 'Moo' },
    { id: 'chicken', name: 'Chicken', nameEs: 'Gallina', article: 'La', icon: '🐔', food: ['corn', 'wheat', 'seed', 'lettuce'], product: 'Eggs 🥚', productId: 'eggs', sound: 'Cluck' },
    { id: 'duck', name: 'Duck', nameEs: 'Pato', article: 'El', icon: '🦆', food: ['aquatic_plants', 'seed', 'lettuce'], product: 'Feathers 🪶', productId: 'feathers', sound: 'Quack' },
    { id: 'rabbit', name: 'Rabbit', nameEs: 'Conejo', article: 'El', icon: '🐰', food: ['grass', 'hay', 'carrot', 'lettuce'], product: 'Love ❤️', productId: 'love', sound: 'Sniff' },
    { id: 'goat', name: 'Goat', nameEs: 'Cabra', article: 'La', icon: '🐐', food: ['grass', 'lettuce', 'shrubs', 'hay'], product: 'Cheese 🧀', productId: 'cheese', sound: 'Baa' },
    { id: 'sheep', name: 'Sheep', nameEs: 'Oveja', article: 'La', icon: '🐑', food: ['grass', 'lettuce', 'hay', 'alfalfa'], product: 'Wool 🧶', productId: 'wool', sound: 'Baa' },
    { id: 'fish', name: 'Fish', nameEs: 'Pez', article: 'El', icon: '🐟', food: ['algae', 'aquatic_plants'], product: 'Joy ✨', productId: 'joy', sound: 'Blub' },
    { id: 'dog', name: 'Dog', nameEs: 'Perro', article: 'El', icon: '🐶', food: ['pellets', 'lettuce'], product: 'Protection 🛡️', productId: 'protection', sound: 'Woof' },
    { id: 'cat', name: 'Cat', nameEs: 'Gato', article: 'El', icon: '🐱', food: ['pellets'], product: 'Purr 🐾', productId: 'purr', sound: 'Meow' },
    { id: 'pig', name: 'Pig', nameEs: 'Cerdo', article: 'El', icon: '🐷', food: ['corn', 'grains', 'passion', 'lettuce', 'roots'], product: 'Joy ✨', productId: 'joy_pig', sound: 'Oink' },
    { id: 'horse', name: 'Horse', nameEs: 'Caballo', article: 'El', icon: '🐴', food: ['grass', 'hay', 'oats', 'grains'], product: 'Speed ⚡', productId: 'speed', sound: 'Neigh' },
    { id: 'donkey', name: 'Donkey', nameEs: 'Burro', article: 'El', icon: '🫏', food: ['grass', 'hay', 'carrot'], product: 'Load 📦', productId: 'load', sound: 'Hee-haw' },
];

const getRandomFood = (animalId: string) => {
    const config = ANIMALS.find(a => a.id === animalId);
    if (!config || !config.food.length) return undefined;
    return config.food[Math.floor(Math.random() * config.food.length)];
};

const TOOLS = [
    { id: 'plow', name: 'Arado', icon: '🚜', action: 'Plow', color: 'bg-orange-600' },
    { id: 'seed', name: 'Plantar', icon: '🌱', action: 'Plant', color: 'bg-green-600' },
    { id: 'water', name: 'Regar', icon: '🚿', action: 'Water', color: 'bg-blue-500' },
    { id: 'harvest', name: 'Cosechar', icon: '🧺', action: 'Pick', color: 'bg-amber-600' },
    { id: 'bucket', name: 'Balde', icon: '🪣', action: 'Milk', color: 'bg-sky-400' },
    { id: 'animal_add', name: 'Animales', icon: '🐾', action: 'Place', color: 'bg-red-500' },
    { id: 'feed', name: 'Alimentar', icon: '🌾', action: 'Feed', color: 'bg-yellow-600' }
];

interface FarmItem {
    id: string;
    type: 'crop' | 'animal';
    cropId?: string;
    stage?: 'idle' | 'seed' | 'sprout' | 'ripe';
    animalId?: string;
    animalState?: 'hungry' | 'eating' | 'happy' | 'sleeping';
    requestedFood?: string;
    isPlowed?: boolean;
}

interface Floater {
    id: number;
    text: string;
    x: number;
    y: number;
    color: string;
}

interface FarmZoneProps {
    onBack: () => void;
}

// --- ICONS ---
interface IconProps {
    size: number;
    className?: string;
}

const PlusIcon: React.FC<IconProps> = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const BasketIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="m15 11-1 9" /><path d="m19 11-4-7" /><path d="M2 11h20" /><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8c.9 0 1.8-.7 2-1.6l1.7-7.4" /><path d="m4.5 11 4-7" /><path d="M9 11V6c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v5" />
    </svg>
);

const FarmZone: React.FC<FarmZoneProps> = ({ onBack }) => {
    const { learnWord } = useLearningProgress();
    const { earnCoins: globalAddRewards, spendCoins } = useGamification();

    const [sessionEarnings, setSessionEarnings] = useState(0);
    const [showEarningsModal, setShowEarningsModal] = useState(false);

    const [plots, setPlots] = useState<FarmItem[]>([]);
    const [animals, setAnimals] = useState<FarmItem[]>([]);
    const [inventory, setInventory] = useState<{ [key: string]: number }>({});

    const FARM_KEYWORDS: Record<string, string> = {
        'farm': 'granja', 'granja': 'farm',
        'nova': 'nova', 'welcome': 'bienvenido', 'bienvenido': 'welcome',
        'ground': 'tierra', 'tierra': 'ground',
        'dry': 'seca', 'seca': 'dry',
        'prepare': 'preparar', 'preparar': 'prepare',
        'soil': 'suelo', 'suelo': 'soil',
        'plow': 'arado', 'arado': 'plow', 'plowing': 'arando', 'arando': 'plowing',
        'earth': 'tierra', 'soft': 'suave', 'suave': 'soft',
        'seeds': 'semillas', 'semillas': 'seeds', 'plant': 'sembrar', 'planted': 'plantado',
        'water': 'agua', 'agua': 'water', 'watering': 'regando',
        'plants': 'plantas', 'plantas': 'plants',
        'harvest': 'cosecha', 'cosecha': 'harvest',
        'tractor': 'tractor', 'corn': 'maíz', 'maíz': 'corn',
        'cow': 'vaca', 'vaca': 'cow',
        'chicken': 'gallina', 'gallina': 'chicken',
        'sheep': 'oveja', 'oveja': 'sheep',
        'hungry': 'hambriento', 'hambriento': 'hungry',
        'happy': 'feliz', 'feliz': 'happy',
        'milk': 'leche', 'leche': 'milk',
        'eggs': 'huevos', 'huevos': 'eggs',
        'barn': 'granero', 'granero': 'barn'
    };

    const [scanningItem, setScanningItem] = useState<{ id: string, name: string, nameEs: string, article: string, image: string, type: 'crop' | 'animal' } | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);
    const [scanResult, setScanResult] = useState<'idle' | 'listening' | 'success' | 'retry'>('idle');

    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [floaters, setFloaters] = useState<Floater[]>([]);
    const [narrativeStep, setNarrativeStep] = useState(0); // Start mission at step 0
    const [weather, setWeather] = useState<'sun' | 'rain'>('sun');
    const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day');
    const [currentSubtitle, setCurrentSubtitle] = useState<{ en: string, es: string } | null>(null);
    const [rotation, setRotation] = useState(45); // Isometric default angle

    const [view, setView] = useState<'field' | 'barn'>('field'); // 'field' or 'barn'
    const [selectedTool, setSelectedTool] = useState<string>(''); // Default no tool selected
    const [selectedSeedId, setSelectedSeedId] = useState<string>('corn');
    const [activeCategory, setActiveCategory] = useState<keyof typeof CROP_CATEGORIES>('basics');
    const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
    const [isPlowing, setIsPlowing] = useState(false);

    const { playClick, playSuccess, playStickerApply, playNudge } = useNovaSound();

    // Pre-compute random values to avoid re-render loops
    const starPositions = useMemo(() => Array.from({ length: 15 }).map(() => ({
        top: `${Math.floor(Math.random() * 60)}%`,
        left: `${Math.floor(Math.random() * 100)}%`,
        dur: 2 + Math.random() * 2,
        delay: Math.random() * 2,
    })), []);
    const rainDrops = useMemo(() => Array.from({ length: 40 }).map(() => ({
        x: `${Math.floor(Math.random() * 100)}%`,
        dur: 0.6 + Math.random() * 0.4,
        delay: Math.random() * 0.5,
    })), []);

    const grassTufts = useMemo(() => Array.from({ length: 150 }).map(() => ({
        top: `${Math.floor(Math.random() * 100)}%`,
        left: `${Math.floor(Math.random() * 100)}%`,
        scale: 0.5 + Math.random() * 0.8,
        opacity: 0.6 + Math.random() * 0.4,
        rotate: Math.random() * 60 - 30,
        type: Math.random() > 0.7 ? (Math.random() > 0.5 ? '🌼' : '🌻') : (Math.random() > 0.5 ? '🌾' : '🌿')
    })), []);

    const birds = useMemo(() => Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        y: 10 + Math.random() * 30, // Top 10-40% of screen
        delay: Math.random() * 10,
        duration: 15 + Math.random() * 10,
        scale: 0.5 + Math.random() * 0.5
    })), []);

    const trees = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
        x: Math.random() * 100, // % across screen
        z: -500 - Math.random() * 1000, // Distance into background
        scale: 2 + Math.random() * 3,
        type: Math.random() > 0.3 ? '🌳' : '🌲'
    })), []);

    useEffect(() => {
        let rec: any = null;
        if (typeof window !== 'undefined' && scanningItem) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                rec = new SpeechRecognition();
                rec.continuous = false;
                rec.lang = 'en-US';
                rec.interimResults = false;

                rec.onstart = () => setIsListening(true);

                rec.onend = () => {
                    setIsListening(false);
                    // If we were listening but got no result, reset to idle after delay
                    if (scanResult === 'listening') {
                        setScanResult('idle');
                    }
                };

                rec.onerror = (event: any) => {
                    console.error("Speech Error:", event.error);
                    setIsListening(false);
                    setScanResult('retry');
                    speakItem("I didn't hear you clearly. Try again!", "en", "No te escuché bien. ¡Inténtalo de nuevo!");
                };

                rec.onnomatch = () => {
                    setIsListening(false);
                    setScanResult('retry');
                    speakItem("I didn't capture that. Say it again!", "en", "No capté eso. ¡Dilo otra vez!");
                };

                rec.onresult = (event: any) => {
                    if (event.results && event.results[0]) {
                        const transcript = event.results[0][0].transcript.toLowerCase();
                        const confidence = event.results[0][0].confidence;
                        checkPronunciation(transcript, confidence);
                    }
                };
                setRecognition(rec);
            }
        }

        return () => {
            if (rec) {
                rec.onend = null; // Prevent state updates after unmount
                rec.abort();
            }
        };
    }, [scanningItem]);

    const checkPronunciation = (transcript: string, confidence: number) => {
        if (!scanningItem) return;
        const target = scanningItem.name.toLowerCase();

        // Relaxed match logic - if word is heard, accept it regardless of confidence
        if (transcript.includes(target) || target.includes(transcript)) {
            setScanResult('success');
            playSuccess();
            addXp(50);
            learnWord(scanningItem.name, scanningItem.nameEs, scanningItem.type === 'crop' ? 'Farm - Crops' : 'Farm - Animals');
            speakItem("Excellent pronunciation! +50 XP", "en", "¡Excelente pronunciación! +50 XP");
            setTimeout(() => setScanningItem(null), 2500);
        } else {
            speakItem("Almost! Try saying: " + scanningItem.name, "en", "¡Casi! Intenta decir: " + scanningItem.nameEs);
            setScanResult('retry');
            setTimeout(() => setScanResult('idle'), 2500);
        }
    };

    const startListening = () => {
        if (recognition) {
            setScanResult('listening');
            try {
                recognition.start();
            } catch (e) {
                console.error("Speech Recognition Error", e);
                setScanResult('idle');
            }
        } else {
            speakItem("Voice commands not supported in this browser.", "en", "Comandos de voz no permitidos en este navegador.");
            setScanResult('idle');
        }
    };

    const speakItem = async (text: string, lang: 'en' | 'es' = 'en', esText?: string) => {
        if (esText) setCurrentSubtitle({ en: text, es: esText });
        else if (lang === 'es') setCurrentSubtitle({ en: "", es: text });
        else setCurrentSubtitle({ en: text, es: "" });

        if (esText) {
            await edgeTTS.speak(text, "rachelle");
            await edgeTTS.speak(esText, "lina");
        } else {
            const voice = lang === 'en' ? "rachelle" : "lina";
            await edgeTTS.speak(text, voice);
        }

        await new Promise(r => setTimeout(r, 1000));
        setCurrentSubtitle(null);
    };

    const speakBilingual = async (en: string, es: string) => {
        // 1. Basic pronunciation
        setCurrentSubtitle({ en, es });
        await edgeTTS.speak(en, "rachelle");
        await edgeTTS.speak(es, "lina");

        await new Promise(r => setTimeout(r, 1000));
        setCurrentSubtitle(null);

        // 2. Try to find example sentences in CATALOG
        let enS = "";
        let esS = "";

        for (const cat in CATALOG) {
            const item = (CATALOG as any)[cat].find((i: any) => i.w === en || i.es === es);
            if (item && item.enS) {
                enS = item.enS;
                esS = item.esS || "";
                break;
            }
        }

        if (enS) {
            setCurrentSubtitle({ en: enS, es: esS });
            await edgeTTS.speak("Listen to the example.", "rachelle");
            await edgeTTS.speak(enS, "rachelle");
            if (esS) await edgeTTS.speak(esS, "lina");

            await new Promise(r => setTimeout(r, 1500));
            setCurrentSubtitle(null);
        }
    };

    const activateScanner = async (item: { name: string, nameEs: string, article: string, seed?: string, icon?: string, type: 'crop' | 'animal' }) => {
        setScanningItem({
            id: Date.now().toString(),
            name: item.name,
            nameEs: item.nameEs,
            article: item.article,
            image: item.seed || item.icon || '❓',
            type: item.type
        });
        setScanResult('idle');
        await speakBilingual(item.name, item.nameEs);
    };

    const addFloater = (text: string, x: number, y: number, color: string = 'text-white') => {
        const id = Date.now();
        setFloaters((prev: Floater[]) => [...prev, { id, text, x, y, color }]);
        setTimeout(() => setFloaters((prev: Floater[]) => prev.filter(f => f.id !== id)), 2000);
    };

    const addXp = (amount: number, clientX?: number, clientY?: number) => {
        setXp(prev => {
            const next = prev + amount;
            if (next >= level * 100) {
                setLevel(l => l + 1);
                playSuccess();
                speakItem(`Level Up! You are level ${level + 1}!`, "en", `¡Subiste de nivel! ¡Eres nivel ${level + 1}!`);
            }
            return next;
        });
        if (clientX && clientY) addFloater(`+ ${amount} XP`, clientX, clientY, 'text-yellow-400');
        globalAddRewards(amount, "Farm work");
        setSessionEarnings(prev => prev + amount);
    };

    const handleBack = () => {
        if (sessionEarnings > 0) {
            playSuccess();
            setShowEarningsModal(true);
        } else {
            onBack();
        }
    };

    useEffect(() => {
        const initialPlots: FarmItem[] = [];
        for (let i = 0; i < 9; i++) initialPlots.push({ id: `plot-${i}`, type: 'crop', stage: 'idle', cropId: 'corn', isPlowed: false });
        setPlots(initialPlots);
        setAnimals([
            { id: 'start-rabbit', type: 'animal', animalId: 'rabbit', animalState: 'hungry', requestedFood: 'grass' },
            { id: 'start-cow', type: 'animal', animalId: 'cow', animalState: 'hungry', requestedFood: 'hay' }
        ]);
    }, []);

    // --- BULK ACTIONS ---
    const handlePlowAll = () => {
        if (isPlowing) return;
        setIsPlowing(true);
        playStickerApply();

        // Staggered plowing row by row
        // Row 1
        setTimeout(() => {
            setPlots(prev => prev.map((p, i) => i < 3 ? { ...p, isPlowed: true } : p));
        }, 1200);

        // Row 2
        setTimeout(() => {
            setPlots(prev => prev.map((p, i) => i >= 3 && i < 6 ? { ...p, isPlowed: true } : p));
        }, 2200);

        // Row 3 + Finish
        setTimeout(() => {
            setPlots(prev => prev.map((p, i) => i >= 6 ? { ...p, isPlowed: true } : p));
            addXp(20);
            setIsPlowing(false);
            if (narrativeStep === 0) {
                setNarrativeStep(1);
            } else {
                speakItem("The land is ready for sowing! Now choose what to plant, one by one.", "en", "¡La tierra está lista para sembrar! Ahora elige qué sembrar, uno por uno.");
            }
        }, 3800);
    };

    const handleWaterAll = () => {
        playSuccess();
        setPlots(prev => prev.map(p => {
            if (p.stage === 'seed') return { ...p, stage: 'sprout' };
            if (p.stage === 'sprout') return { ...p, stage: 'ripe' };
            return p;
        }));
        addXp(20);
        speakItem("Watering all plants!", "en", "¡Regando todas las plantas!");
    };

    const handleHarvestAll = (e: React.MouseEvent) => {
        playSuccess();
        let harvestCount = 0;
        setPlots(prev => prev.map(p => {
            if (p.stage === 'ripe') {
                harvestCount++;
                const crop = CROP_TYPES.find(c => c.id === p.cropId);
                setInventory(inv => ({ ...inv, [p.cropId!]: (inv[p.cropId!] || 0) + 1 }));
                addFloater(`+1 ${crop?.name}`, e.clientX || 500, e.clientY || 500, 'text-green-500');
                return { ...p, stage: 'idle' };
            }
            return p;
        }));
        if (harvestCount > 0) {
            addXp(harvestCount * 20);
            speakItem("Great Harvest!", "en", "¡Gran Cosecha!");
            if (narrativeStep === 3) setNarrativeStep(4);
        }
    };

    // MISSION NARRATIVE SYSTEM
    useEffect(() => {
        const runNarrative = async () => {
            if (narrativeStep === 0) {
                await new Promise(r => setTimeout(r, 1000));
                speakItem(
                    "Welcome to Nova Farm! Look at the ground, it's too dry. First, we must Prepare the Soil with the plow! It's very important to make the earth soft for the seeds.",
                    "en",
                    "¡Bienvenido a la Granja Nova! La tierra está muy seca. Primero, ¡debemos prepararla con el arado! Es muy importante suavizar la tierra para las semillas."
                );
            } else if (narrativeStep === 1) {
                speakItem(
                    "Great job plowing! Now the soil is ready. Select the seeds and plant them in the ground.",
                    "en",
                    "¡Buen trabajo arando! Ahora el suelo está listo. Selecciona las semillas y siémbralas en la tierra."
                );
            } else if (narrativeStep === 2) {
                speakItem(
                    "The seeds are in! Now they need water to grow. Use the water tool or wait for rain.",
                    "en",
                    "¡Las semillas están puestas! Ahora necesitan agua para crecer. Usa la herramienta de agua o espera a que llueva."
                );
            } else if (narrativeStep === 4) {
                speakItem(
                    "Look at all these crops! You did it! Now, let's check the Barn to see our animals.",
                    "en",
                    "¡Mira todos estos cultivos! ¡Lo lograste! Ahora, vayamos al Granero para ver a nuestros animales."
                );
            }
        };
        runNarrative();
    }, [narrativeStep]);

    useEffect(() => {
        if (weather === 'rain') {
            const interval = setInterval(() => {
                setPlots(currentPlots => {
                    return currentPlots.map(plot => {
                        if (plot.stage === 'seed') return { ...plot, stage: 'sprout' };
                        if (plot.stage === 'sprout') return { ...plot, stage: 'ripe' };
                        return plot;
                    });
                });
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [weather]);

    useEffect(() => {
        if (timeOfDay === 'night') {
            setAnimals(prev => prev.map(a => ({ ...a, animalState: 'sleeping' })));
        } else {
            setAnimals(prev => prev.map(a => ({ ...a, animalState: 'hungry', requestedFood: getRandomFood(a.animalId!) })));
        }
    }, [timeOfDay]);

    const handlePlotClick = async (index: number, e: React.MouseEvent) => {
        const plot = plots[index];
        const newPlots = [...plots];

        if (selectedTool === 'plow' && !plot.isPlowed) {
            // Individual plowing? User wants truck animation though. 
            // We'll let handlePlantAll handle the big animation but maybe allow individual plowing too?
            // Actually user said "When narrator tells him to use plow... and child clicks tractor... animation of truck moving".
            // So plowing is bulk, but planting is one-by-one.
            handlePlowAll();
            return;
        }

        if (selectedTool === 'seed' && plot.stage === 'idle' && plot.isPlowed) {
            playStickerApply();
            const currentSeed = CROP_TYPES.find(c => c.id === selectedSeedId);
            newPlots[index] = { ...plot, stage: 'seed', cropId: selectedSeedId };
            setPlots(newPlots);
            addXp(5, e.clientX, e.clientY);

            // Visual feedback for planting seed
            addFloater(`${currentSeed?.seed}`, e.clientX, e.clientY - 20, 'text-2xl');
            speakItem(`Planting ${currentSeed?.name}`, 'en', `Plantando ${currentSeed?.nameEs}`);
        }
        else if (selectedTool === 'water') {
            if (plot.stage === 'seed') {
                playSuccess();
                newPlots[index] = { ...plot, stage: 'sprout' };
                setPlots(newPlots);
                addXp(5, e.clientX, e.clientY);
                addFloater('🌱', e.clientX, e.clientY - 20, 'text-2xl');
                speakItem("It sprouts!", "en", "¡Brota!");
                if (narrativeStep === 2) setNarrativeStep(3);
            } else if (plot.stage === 'sprout') {
                playSuccess();
                newPlots[index] = { ...plot, stage: 'ripe' };
                setPlots(newPlots);
                addXp(5, e.clientX, e.clientY);
                addFloater('✨', e.clientX, e.clientY - 20, 'text-blue-500 text-2xl');
                speakItem("Ready to harvest!", "en", "¡Listo para cosechar!");
            }
        }
        else if (selectedTool === 'harvest' && plot.stage === 'ripe') {
            playSuccess();
            const harvestedCrop = CROP_TYPES.find(c => c.id === plot.cropId);
            newPlots[index] = { ...plot, stage: 'idle' };
            setPlots(newPlots);
            addXp(20, e.clientX, e.clientY);
            addFloater(`+ 1 ${harvestedCrop?.name}`, e.clientX, e.clientY, 'text-green-500 font-black');
            if (harvestedCrop) activateScanner({ ...harvestedCrop, type: 'crop' });

            // Basket animation hint
            const basket = document.getElementById('basket-target');
            if (basket) {
                basket.classList.add('scale-125');
                setTimeout(() => basket.classList.remove('scale-125'), 300);
            }
        }
    };

    const playAnimalSound = (animalId: string) => {
        const soundMap: Record<string, { text: string, pitch: number, rate: number }> = {
            'cow': { text: 'Moooooooo', pitch: 0.5, rate: 0.8 },
            'pig': { text: 'Oink Oink Oink', pitch: 1.5, rate: 1.2 },
            'chicken': { text: 'Cluck Cluck', pitch: 1.2, rate: 1.5 },
            'sheep': { text: 'Baaaaaa', pitch: 0.8, rate: 0.9 },
            'rabbit': { text: 'Sniff Sniff', pitch: 1.8, rate: 2.0 },
            'duck': { text: 'Quack Quack', pitch: 1.2, rate: 1.1 },
            'goat': { text: 'Baaaaaaah', pitch: 1.0, rate: 1.0 },
            'fish': { text: 'Blub Blub', pitch: 2.0, rate: 1.0 },
            'dog': { text: 'Woof Woof', pitch: 1.2, rate: 1.2 },
            'cat': { text: 'Meow Meow', pitch: 1.5, rate: 1.5 },
            'horse': { text: 'Neigh Neigh', pitch: 0.8, rate: 0.8 },
        };

        const sound = soundMap[animalId];
        // Visual feedback
        const animIndex = animals.findIndex(a => a.animalId === animalId);
        if (animIndex >= 0) {
            // We can't easily get X/Y here without event, but we can rely on handleAnimalClick doing it
        }

        if (sound && window.speechSynthesis) {
            // Cancel previous to avoid lag
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(sound.text);
            utterance.pitch = sound.pitch;
            utterance.rate = sound.rate;
            utterance.volume = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleAnimalClick = (index: number, e: React.MouseEvent) => {
        playClick();
        const anim = animals[index];
        const config = ANIMALS.find(a => a.id === anim.animalId);

        if (anim.animalId) {
            playAnimalSound(anim.animalId);
            addFloater('🔊', e.clientX, e.clientY - 40, 'text-slate-700 text-3xl animate-ping');
        }

        if (selectedTool === 'feed') {
            if (anim.animalState === 'hungry') {
                playSuccess();
                const newAnimals = [...animals];
                newAnimals[index] = { ...anim, animalState: 'eating' };
                setAnimals(newAnimals);

                // Add XP and bilingual feedback
                addXp(15, e.clientX, e.clientY);
                addFloater('😋', e.clientX, e.clientY - 20, 'text-2xl');
                speakItem(`Yum! The ${config?.name} is eating.`, 'en', `¡Ñam! ${config?.article} ${config?.nameEs} está comiendo.`);

                setTimeout(() => {
                    setAnimals(prev => {
                        const next = [...prev];
                        if (next[index]) next[index] = { ...next[index], animalState: 'happy' };
                        return next;
                    });
                }, 3000);
            } else {
                speakItem("I'm not hungry right now!", "en", "¡No tengo hambre ahora!");
            }
        }
        else if (selectedTool === 'harvest' && anim.animalState === 'happy') {
            // ... existing harvest logic ...
            playSuccess();
            addXp(30, e.clientX, e.clientY);
            setAnimals(prev => {
                const next = [...prev];
                next[index] = { ...next[index], animalState: 'hungry' }; // Reset to hungry after harvest? Or sleep?
                return next;
            });
            speakItem(`You collected ${config?.product}!`, 'en', `¡Recolectaste ${config?.product}!`);
            addFloater(`${config?.product}`, e.clientX, e.clientY - 30, 'text-2xl font-bold');
            if (config?.productId) {
                setInventory(inv => ({ ...inv, [config.productId!]: (inv[config.productId!] || 0) + 1 }));
            }
        }
        else {
            // Just petting
            playNudge();
            if (config) activateScanner({ ...config, type: 'animal' });
            addFloater('❤️', e.clientX, e.clientY - 20, 'text-red-500 text-2xl');
        }
    };

    const addAnimal = (id: string) => {
        playSuccess();
        const config = ANIMALS.find(a => a.id === id);
        setAnimals([...animals, { id: Date.now().toString(), type: 'animal', animalId: id, animalState: 'hungry', requestedFood: getRandomFood(id) }]);
        speakItem(`Hello ${config?.name}!`, "en", `¡Hola ${config?.nameEs}!`);
    };

    const handleFeedAnimal = (id: string, e?: React.MouseEvent) => {
        const index = animals.findIndex(a => a.id === id);
        if (index === -1) return;
        const animal = animals[index];
        const config = ANIMALS.find(a => a.id === animal.animalId);
        if (!config) return;

        if (animal.animalState === 'hungry') {
            const requestedFoodId = animal.requestedFood || config.food[0];
            const requestedCrop = CROP_TYPES.find(c => c.id === requestedFoodId);

            if (selectedTool !== 'feed') {
                speakItem(`Pick the food and use the FEED tool!`, "en", `¡Elige la comida y usa la herramienta ALIMENTAR!`);
                return;
            }

            if ((inventory[requestedFoodId] || 0) <= 0) {
                speakItem(`You don't have enough ${requestedCrop?.name}!`, "en", `¡No tienes suficiente ${requestedCrop?.nameEs}!`);
                return;
            }

            // Consume food
            setInventory(inv => ({ ...inv, [requestedFoodId]: inv[requestedFoodId] - 1 }));

            playSuccess();
            const newAnimals = [...animals];
            newAnimals[index] = { ...animal, animalState: 'eating' };
            setAnimals(newAnimals);
            addXp(15, e?.clientX, e?.clientY);

            speakItem(`Yum! The ${config.name} is eating ${requestedCrop?.name}.`, 'en', `¡Ñam! ${config.article} ${config.nameEs} está comiendo ${requestedCrop?.nameEs}.`);

            setTimeout(() => {
                setAnimals(prev => {
                    const next = [...prev];
                    const idx = next.findIndex(a => a.id === id);
                    if (idx !== -1) next[idx] = { ...next[idx], animalState: 'happy' };
                    return next;
                });

                if (narrativeStep === 5) {
                    speakItem("Amazing! Now the animal is happy. Look at the product it yields. You can collect it now!", "en", "¡Increíble! Ahora el animal está feliz. Mira el producto que produce. ¡Puedes recogerlo ahora!");
                    setNarrativeStep(6);
                }
            }, 3000);
        } else if (animal.animalState === 'happy') {
            const isMilky = config.id === 'cow' || config.id === 'goat';
            const isChicken = config.id === 'chicken';
            const actionReq = isMilky ? 'Bucket 🪣' : isChicken ? 'Basket 🧺' : 'Hand 🖐️';
            const actionReqEs = isMilky ? 'Balde 🪣' : isChicken ? 'Canasta 🧺' : 'Mano 🖐️';
            const toolIdReq = isMilky ? 'bucket' : isChicken ? 'harvest' : 'feed';

            if (selectedTool !== toolIdReq) {
                speakItem(`Now you need the ${actionReq} to collect the ${config.product}!`, "en", `¡Ahora necesitas ${config.article === 'La' ? 'la' : 'el'} ${actionReqEs} para recoger ${config.article === 'La' ? 'la' : 'el'} ${config.product}!`);
                return;
            }

            playSuccess();
            addXp(50, e?.clientX, e?.clientY);
            addFloater(config.product, e?.clientX || 500, (e?.clientY || 500) - 50, 'text-6xl animate-bounce');

            const actionVerb = isMilky ? 'milked' : isChicken ? 'collected eggs from' : 'interacted with';
            const actionVerbEs = isMilky ? 'ordeñaste a' : isChicken ? 'recogiste los huevos de' : 'interactuaste con';

            speakItem(`Brilliant! You ${actionVerb} the ${config.name} and got ${config.product}.`, 'en', `¡Brillante! ${actionVerbEs} ${config.article} ${config.nameEs} y obtuviste ${config.product}.`);

            setAnimals(prev => {
                const next = [...prev];
                const idx = next.findIndex(a => a.id === id);
                if (idx !== -1) next[idx] = { ...next[idx], animalState: 'hungry', requestedFood: getRandomFood(animal.animalId!) };
                return next;
            });

            if (narrativeStep === 6) {
                speakItem("You are a master farmer! Continue exploring and taking care of your animals.", "en", "¡Eres un maestro granjero! Continúa explorando y cuidando a tus animales.");
                setNarrativeStep(7);
            }
        }
    };

    const filteredSeeds = CROP_TYPES.filter(c => c.category === activeCategory);

    return (
        <div className={`h-full w-full relative overflow-hidden font-sans text-gray-800 select-none transition-colors duration-1000 ${timeOfDay === 'day' ? 'bg-[#8FBF5A]' : 'bg-[#1a2332]'}`}>

            {/* === HUD LAYER (UI) === */}
            <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between p-4 md:p-6">



                {/* --- HEADER --- */}
                <div className="flex justify-between items-start pointer-events-auto">

                    {/* LEFT: Back & Avatar */}
                    <div className="flex items-center gap-4">
                        <button onClick={handleBack} className="bg-white/90 backdrop-blur text-amber-900 border-b-4 border-amber-700 p-3 rounded-xl shadow-lg active:scale-95 transition-all hover:bg-white group">
                            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                        </button>

                        <div className="relative w-16 h-16 md:w-20 md:h-20 bg-amber-200/90 rounded-full border-4 border-white shadow-xl overflow-hidden flex items-center justify-center ring-4 ring-amber-500/20">
                            <div className="scale-[1.8] translate-y-[5%]">
                                <AvatarDisplay size="md" showBackground={false} isCurrentUser={true} />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Stats & Settings */}
                    <div className="flex flex-col items-end gap-2">
                        {/* Level/XP */}
                        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl border-b-4 border-amber-200 shadow-lg flex flex-col items-end">
                            <div className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Level {level}</div>
                            <div className="w-32 h-3 bg-black/10 rounded-full overflow-hidden mt-1">
                                <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min((xp / (level * 100)) * 100, 100)}%` }}></div>
                            </div>
                        </div>

                        {/* Inventory HUD */}
                        <div className="flex flex-wrap justify-end gap-1 max-w-[240px] mt-1">
                            {Object.entries(inventory).map(([id, count]) => {
                                if (count <= 0) return null;
                                const crop = CROP_TYPES.find(c => c.id === id);
                                return (
                                    <div key={id} className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg border border-amber-100 shadow-sm flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                                        <span className="text-sm">{crop?.ripe || '📦'}</span>
                                        <span className="text-[10px] font-black">{count}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Toggles */}
                        <div className="flex gap-2">
                            <button onClick={() => setTimeOfDay(t => t === 'day' ? 'night' : 'day')} className={`p-3 rounded-xl border-b-4 shadow-lg transition-all active:scale-95 ${timeOfDay === 'day' ? 'bg-yellow-400 border-yellow-600 text-yellow-900' : 'bg-slate-700 border-slate-900 text-white'}`}>
                                {timeOfDay === 'day' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button onClick={() => setWeather(w => w === 'sun' ? 'rain' : 'sun')} className={`p-3 rounded-xl border-b-4 shadow-lg transition-all active:scale-95 ${weather === 'rain' ? 'bg-blue-500 border-blue-700 text-white' : 'bg-white border-blue-200 text-blue-500'}`}>
                                {weather === 'sun' ? <CloudRain size={20} /> : <Droplets size={20} className="animate-bounce" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER / DOCK --- */}
                <div className="pointer-events-auto flex flex-col items-center gap-4 pb-2 z-50">

                    {/* View Specific Alerts/Buttons (Exit Barn) */}
                    <AnimatePresence>
                        {view === 'barn' && (
                            <motion.button
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 50, opacity: 0 }}
                                onClick={() => setView('field')}
                                className="bg-red-500 hover:bg-red-600 text-white font-black py-3 px-8 rounded-full shadow-[0_10px_0_#991b1b] active:shadow-none active:translate-y-[10px] transition-all flex items-center gap-3 border-4 border-white mb-2"
                            >
                                <ArrowLeft size={24} /> EXIT BARN
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* NEW COLLAPSIBLE TOOL MENU */}
                    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
                        <AnimatePresence>
                            {isToolMenuOpen && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                                    className="bg-white/95 backdrop-blur-xl border-4 border-white rounded-[2rem] p-6 shadow-2xl mb-2 w-80 md:w-96 max-h-[60vh] overflow-y-auto custom-scrollbar"
                                >
                                    {/* Sub-Menu Header */}
                                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">
                                            {selectedTool === 'seed' ? 'Select Seeds' : selectedTool === 'animal_add' ? 'Select Animal' : 'Farm Tools'}
                                        </h3>
                                        {selectedTool && (selectedTool === 'seed' || selectedTool === 'animal_add') && (
                                            <button onClick={() => setSelectedTool('')} className="bg-slate-100 hover:bg-slate-200 p-1 rounded-full"><ArrowLeft size={16} /></button>
                                        )}
                                    </div>

                                    {/* MAIN TOOLS MENU */}
                                    {!selectedTool || (selectedTool !== 'seed' && selectedTool !== 'animal_add') ? (
                                        <div className="grid grid-cols-3 gap-3">
                                            {TOOLS.map(tool => (
                                                <button key={tool.id} onClick={() => {
                                                    setSelectedTool(tool.id);
                                                    playClick();
                                                    if (tool.id !== 'seed' && tool.id !== 'animal_add') {
                                                        setIsToolMenuOpen(false); // Close menu for simple tools
                                                    }
                                                }}
                                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all aspect-square justify-center border-2
                                                        ${selectedTool === tool.id ? 'bg-blue-50 border-blue-500 shadow-md scale-105' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-300'}
                                                    `}>
                                                    <span className="text-3xl drop-shadow-sm">{tool.icon}</span>
                                                    <span className="text-[10px] font-black uppercase text-slate-600 text-center leading-none">{tool.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : null}

                                    {/* SEED SELECTION SUB-MENU */}
                                    {selectedTool === 'seed' && (
                                        <div className="space-y-4">
                                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                                {(Object.keys(CROP_CATEGORIES) as Array<keyof typeof CROP_CATEGORIES>).map(catKey => (
                                                    <button key={catKey} onClick={() => setActiveCategory(catKey)}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap border-2 ${activeCategory === catKey ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-slate-200 text-slate-500'}`}>
                                                        {CROP_CATEGORIES[catKey].name}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {filteredSeeds.map(crop => (
                                                    <button key={crop.id} onClick={() => { setSelectedSeedId(crop.id); playClick(); speakItem(crop.name); setIsToolMenuOpen(false); /* Close on select */ }}
                                                        className={`aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all p-1 ${selectedSeedId === crop.id ? 'bg-green-50 border-green-500 ring-2 ring-green-200' : 'bg-white border-slate-100 hover:border-green-300'}`}>
                                                        <span className="text-2xl mb-1">{crop.seed}</span>
                                                        <span className="text-[8px] font-bold uppercase text-center leading-none text-slate-500">{crop.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ANIMAL SELECTION SUB-MENU */}
                                    {selectedTool === 'animal_add' && (
                                        <div className="grid grid-cols-3 gap-3">
                                            {ANIMALS.map(anim => (
                                                <button key={anim.id} onClick={() => { addAnimal(anim.id); setIsToolMenuOpen(false); }}
                                                    className="aspect-square rounded-xl flex flex-col items-center justify-center p-2 bg-white border-2 border-slate-100 hover:border-red-300 hover:bg-red-50 transition-all shadow-sm">
                                                    <span className="text-4xl mb-1">{anim.icon}</span>
                                                    <span className="text-[10px] font-bold uppercase text-center leading-none text-slate-600">{anim.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* FAB TOOL TOGGLE */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsToolMenuOpen(!isToolMenuOpen)}
                            className={`w-20 h-20 rounded-[2rem] shadow-2xl flex items-center justify-center text-white relative z-[70] transition-colors border-4 border-white ${isToolMenuOpen ? 'bg-red-500 rotate-45' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}
                        >
                            {isToolMenuOpen ? <Plus size={40} /> : <ShoppingBag size={32} />}
                            {selectedTool && !isToolMenuOpen && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                            )}
                        </motion.button>

                        {/* ACTIVE TOOL INDICATOR (When menu closed) */}
                        {!isToolMenuOpen && selectedTool && (
                            <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute right-24 bottom-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border-2 border-white flex items-center gap-3 whitespace-nowrap">
                                <span className="text-xs font-black uppercase text-slate-500">Active:</span>
                                <span className="text-lg">{selectedTool === 'seed' ? CROP_TYPES.find(c => c.id === selectedSeedId)?.seed : TOOLS.find(t => t.id === selectedTool)?.icon}</span>
                                <span className="text-sm font-bold text-slate-800 capitalize">{selectedTool === 'seed' ? CROP_TYPES.find(c => c.id === selectedSeedId)?.name : TOOLS.find(t => t.id === selectedTool)?.name}</span>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* === EFFECTS LAYER === */}
            <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                <AnimatePresence>
                    {floaters.map(f => (
                        <motion.div key={f.id} initial={{ x: f.x, y: f.y, opacity: 1, scale: 0.5 }} animate={{ y: f.y - 100, opacity: 0, scale: 1.5 }} exit={{ opacity: 0 }}
                            className={`absolute font-black text-2xl drop-shadow-md ${f.color}`}
                        >{f.text}</motion.div>
                    ))}
                </AnimatePresence>

                {weather === 'rain' && (
                    <div className="absolute inset-0 z-40">
                        <div className="absolute inset-0 bg-blue-900/10" />
                        {/* Animated rain drops */}
                        {rainDrops.map((drop, i) => (
                            <motion.div key={`rain-${i}`}
                                initial={{ y: -20, opacity: 0.7 }}
                                animate={{ y: '110vh', opacity: [0.7, 0.4] }}
                                transition={{ repeat: Infinity, duration: drop.dur, delay: drop.delay, ease: 'linear' }}
                                className="absolute w-[2px] h-4 bg-gradient-to-b from-transparent to-blue-400/60 rounded-full"
                                style={{ left: drop.x }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* === MAIN SCENE — CLAY TOY FARM DIORAMA === */}
            <div className={`absolute inset-0 overflow-hidden transition-all duration-1000 ${timeOfDay === 'day'
                ? 'bg-gradient-to-b from-[#87CEEB] via-[#B5E3F5] to-[#8FBF5A]'
                : 'bg-gradient-to-b from-[#0f1729] via-[#1a2744] to-[#1a3320]'
                }`}>

                {/* Sun / Moon — soft clay style */}
                <div className={`absolute top-8 right-12 w-20 h-20 rounded-full transition-all duration-1000 ${timeOfDay === 'day' ? 'bg-[#FFE066] shadow-[0_0_40px_rgba(255,224,102,0.5),0_4px_0_#F0C040]' : 'bg-[#C8D6E5] shadow-[0_0_20px_rgba(200,214,229,0.3),0_4px_0_#9FB3C8]'}`} />

                {/* Clouds — soft puffy clay */}
                {timeOfDay === 'day' && (
                    <div className="absolute inset-0 z-5 pointer-events-none">
                        <motion.div animate={{ x: [0, 30, 0] }} transition={{ repeat: Infinity, duration: 20, ease: 'easeInOut' }} className="absolute top-[8%] left-[15%] w-28 h-12 bg-white/70 rounded-full shadow-[0_4px_0_rgba(200,200,200,0.3)]" />
                        <motion.div animate={{ x: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 25, ease: 'easeInOut' }} className="absolute top-[12%] left-[50%] w-36 h-14 bg-white/60 rounded-full shadow-[0_4px_0_rgba(200,200,200,0.3)]" />
                        <motion.div animate={{ x: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }} className="absolute top-[5%] left-[75%] w-24 h-10 bg-white/50 rounded-full shadow-[0_4px_0_rgba(200,200,200,0.2)]" />
                    </div>
                )}

                {/* Birds Layer */}
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                    {birds.map(bird => (
                        <motion.div
                            key={bird.id}
                            initial={{ x: '-10%', y: `${bird.y}%` }}
                            animate={{ x: '110%' }}
                            transition={{ repeat: Infinity, duration: bird.duration, delay: bird.delay, ease: "linear" }}
                            className="absolute text-3xl opacity-70"
                            style={{ scale: bird.scale }}
                        >
                            🐦
                        </motion.div>
                    ))}
                </div>

                {/* === ILLUSTRATED FARM SCENE (2D Storybook Style) === */}
                {view === 'field' && (
                    <div className="absolute inset-0 overflow-hidden">

                        {/* Rolling green hills (background) */}
                        <div className="absolute bottom-0 w-full h-[65%]">
                            <div className="absolute bottom-0 left-[-10%] w-[60%] h-[90%] bg-[#6BAA3C] rounded-t-[50%]" />
                            <div className="absolute bottom-0 right-[-10%] w-[60%] h-[80%] bg-[#5D9A2E] rounded-t-[50%]" />
                            <div className="absolute bottom-0 left-[20%] w-[70%] h-[95%] bg-[#7CB342] rounded-t-[50%]" />
                        </div>

                        {/* Ground base */}
                        <div className="absolute bottom-0 w-full h-[40%] bg-[#7CB342]" />

                        {/* Dirt path */}
                        <div className="absolute bottom-[5%] left-[35%] w-[30%] h-[35%] bg-[#C4A882] rounded-t-full opacity-40" />
                        <div className="absolute bottom-0 left-[40%] w-[20%] h-[8%] bg-[#D4B896] rounded-t-lg opacity-50" />

                        {/* === WOODEN FENCE === */}
                        <div className="absolute bottom-[38%] left-[5%] w-[90%] h-2 bg-[#D4A574] rounded-full shadow-[0_2px_0_#B8854A] z-20" />
                        <div className="absolute bottom-[41%] left-[5%] w-[90%] h-2 bg-[#D4A574] rounded-full shadow-[0_2px_0_#B8854A] z-20" />
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div key={`fp-${i}`} className="absolute bottom-[37%] w-2 h-10 bg-[#C4956A] rounded-sm shadow-sm z-20" style={{ left: `${5 + i * 5.6}%` }} />
                        ))}

                        {/* === FARM SIGN === */}
                        <div className="absolute bottom-[42%] left-[8%] z-30">
                            <div className="bg-[#8B6914] text-[#FFF8DC] text-xs font-black px-4 py-2 rounded-xl border-3 border-[#6B4F12] shadow-[0_4px_0_#5B3F0A] whitespace-nowrap">
                                🌾 NOVA FARM
                            </div>
                            <div className="w-2 h-8 bg-[#6B4F12] mx-auto rounded-b" />
                        </div>

                        {/* === CUTE RED BARN === */}
                        <motion.div
                            className="absolute bottom-[38%] left-[12%] z-30 cursor-pointer"
                            whileHover={{ scale: 1.05, y: -5 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                playClick();
                                setView('barn');
                                speakItem("Entering the Barn!", "en", "¡Entrando al Granero!");
                            }}
                        >
                            {/* Barn shadow */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-6 bg-black/15 rounded-full blur-md" />
                            {/* Barn body */}
                            <div className="relative w-44 h-28 bg-[#C0392B] rounded-lg border-4 border-[#922B21] shadow-[0_6px_0_#7B241C]">
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-[2px] h-full bg-[#E74C3C] opacity-30" />
                                    <div className="absolute w-full h-[2px] bg-[#E74C3C] opacity-30" />
                                </div>
                                {/* Door */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-20 bg-[#5D4037] rounded-t-xl border-3 border-[#3E2723]">
                                    <div className="absolute top-1/2 right-2 w-2.5 h-2.5 bg-[#F39C12] rounded-full shadow-sm" />
                                </div>
                                {/* Windows */}
                                <div className="absolute top-3 left-3 w-9 h-9 bg-[#FFECB3] rounded-lg border-2 border-[#922B21] shadow-inner" />
                                <div className="absolute top-3 right-3 w-9 h-9 bg-[#FFECB3] rounded-lg border-2 border-[#922B21] shadow-inner" />
                                <div className="absolute top-2.5 left-5 text-base">🐄</div>
                            </div>
                            {/* Green roof (triangle) */}
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-0 h-0"
                                style={{
                                    borderLeft: '96px solid transparent',
                                    borderRight: '96px solid transparent',
                                    borderBottom: '56px solid #27AE60',
                                    filter: 'drop-shadow(0 -2px 0 #1E8449)'
                                }}
                            />
                            <div className="absolute -top-[54px] left-1/2 -translate-x-1/2 w-8 h-3 bg-[#1E8449] rounded-full" />
                            {/* ENTER label */}
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#F5E6D3] text-[#5D4037] text-[10px] font-black px-3 py-1 rounded-lg border-2 border-[#D4B896] shadow-[0_3px_0_#C4A882] whitespace-nowrap animate-bounce">
                                CLICK TO ENTER 🏠
                            </div>
                        </motion.div>

                        {/* === ANIMALS ON HILL (Interactive) === */}
                        {[
                            { id: 'cow', x: '20%', y: '22%', scale: 1 },
                            { id: 'horse', x: '75%', y: '24%', scale: 0.95, flip: true },
                            { id: 'sheep', x: '40%', y: '20%', scale: 0.8 },
                            { id: 'pig', x: '60%', y: '28%', scale: 0.75 },
                            { id: 'chicken', x: '50%', y: '30%', scale: 0.6 },
                        ].map((anim, i) => {
                            const config = ANIMALS.find(a => a.id === anim.id);
                            return (
                                <motion.div
                                    key={`anim-${i}`}
                                    className="absolute z-10 cursor-pointer group"
                                    style={{ left: anim.x, top: anim.y, transform: `scale(${anim.scale})` }}
                                    whileHover={{ scale: anim.scale * 1.1 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (config) activateScanner({ ...config, type: 'animal' });
                                    }}
                                >
                                    <div className={`relative ${anim.flip ? '-scale-x-100' : ''}`}>
                                        {/* Detailed SVG Rendering matching Reference Image */}
                                        <svg viewBox="0 0 100 80" className="w-32 h-24 drop-shadow-lg overflow-visible">

                                            {anim.id === 'cow' && (
                                                <g> {/* Black & White Cow */}
                                                    <path d="M20,40 Q25,30 40,30 L70,30 Q80,30 85,45 L85,65 Q85,75 75,75 L70,75 L70,60 L60,60 L60,75 L35,75 L35,60 L25,60 L25,75 L20,75 Q10,75 10,60 Z" fill="#FFFFFF" stroke="#333" strokeWidth="2" />
                                                    {/* Spots */}
                                                    <path d="M30,35 Q40,40 30,55 Q20,50 20,40" fill="#333" />
                                                    <path d="M55,35 Q65,45 60,55 Q50,55 50,45" fill="#333" />
                                                    <path d="M75,40 Q80,50 85,45 L85,40 Z" fill="#333" />
                                                    {/* Udder */}
                                                    <path d="M60,60 Q65,65 70,60" fill="#FFC0CB" stroke="#333" strokeWidth="1" />
                                                    {/* Head */}
                                                    <circle cx="85" cy="35" r="12" fill="#FFFFFF" stroke="#333" strokeWidth="2" />
                                                    <path d="M85,35 Q90,45 85,50 Q80,45 85,35" fill="#FFC0CB" /> {/* Muzzle */}
                                                    <circle cx="83" cy="32" r="1.5" fill="#000" /> <circle cx="87" cy="32" r="1.5" fill="#000" />
                                                    <path d="M80,25 L75,20 L82,24 Z" fill="#333" /> <path d="M90,25 L95,20 L88,24 Z" fill="#333" /> {/* Horns */}
                                                </g>
                                            )}

                                            {anim.id === 'horse' && (
                                                <g> {/* Brown Horse */}
                                                    <path d="M25,40 Q30,30 45,30 L75,30 Q85,30 85,50 L85,70 Q85,75 75,75 L70,75 L70,60 L60,60 L60,75 L40,75 L40,60 L30,60 L30,75 L25,75 Q15,75 15,60 Z" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
                                                    {/* Tail */}
                                                    <path d="M15,45 Q5,50 10,65" fill="#5D4037" stroke="#3E2723" strokeWidth="3" />
                                                    {/* Neck & Head */}
                                                    <path d="M75,30 Q80,15 75,10 L85,10 Q90,15 90,30" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
                                                    <ellipse cx="80" cy="12" rx="10" ry="8" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" transform="rotate(-15 80 12)" />
                                                    {/* Mane */}
                                                    <path d="M75,10 Q73,15 75,30" fill="none" stroke="#3E2723" strokeWidth="4" />
                                                    {/* Eye & Feet */}
                                                    <circle cx="78" cy="10" r="1.5" fill="#000" />
                                                    <path d="M25,75 L30,75 L30,70 L25,70 Z" fill="#3E2723" /> <path d="M60,75 L70,75 L70,70 L60,70 Z" fill="#3E2723" />
                                                </g>
                                            )}

                                            {anim.id === 'sheep' && (
                                                <g transform="scale(0.9) translate(10,10)"> {/* Fluffy Sheep */}
                                                    {/* Wool Body (Cloud shape) */}
                                                    <path d="M20,50 Q15,40 25,35 Q30,25 45,25 Q60,20 75,30 Q85,25 90,40 Q95,50 85,60 Q80,70 65,70 Q50,75 35,70 Q20,70 20,50 Z" fill="#FFF" stroke="#E0E0E0" strokeWidth="2" />
                                                    {/* Legs */}
                                                    <rect x="30" y="65" width="8" height="15" fill="#333" rx="2" />
                                                    <rect x="70" y="65" width="8" height="15" fill="#333" rx="2" />
                                                    {/* Head */}
                                                    <circle cx="80" cy="40" r="12" fill="#EEE" stroke="#E0E0E0" strokeWidth="2" />
                                                    <circle cx="76" cy="38" r="1.5" fill="#000" /> <circle cx="84" cy="38" r="1.5" fill="#000" />
                                                    <ellipse cx="80" cy="45" rx="3" ry="2" fill="#FFC0CB" />
                                                    {/* Ears */}
                                                    <ellipse cx="68" cy="38" rx="6" ry="3" fill="#EEE" stroke="#E0E0E0" transform="rotate(-20 68 38)" />
                                                    <ellipse cx="92" cy="38" rx="6" ry="3" fill="#EEE" stroke="#E0E0E0" transform="rotate(20 92 38)" />
                                                </g>
                                            )}

                                            {anim.id === 'pig' && (
                                                <g transform="scale(0.85) translate(20,20)"> {/* Pink Pig */}
                                                    <path d="M20,45 Q20,30 40,30 L70,30 Q90,30 90,50 Q90,70 70,70 L40,70 Q20,70 20,45 Z" fill="#FFCDD2" stroke="#E57373" strokeWidth="2" />
                                                    {/* Legs */}
                                                    <rect x="35" y="65" width="8" height="10" fill="#FFCDD2" stroke="#E57373" strokeWidth="2" />
                                                    <rect x="70" y="65" width="8" height="10" fill="#FFCDD2" stroke="#E57373" strokeWidth="2" />
                                                    {/* Head */}
                                                    <circle cx="80" cy="40" r="15" fill="#FFCDD2" stroke="#E57373" strokeWidth="2" />
                                                    <ellipse cx="80" cy="42" rx="6" ry="4" fill="#E53935" /> {/* Snout */}
                                                    <circle cx="78" cy="42" r="1" fill="#5D4037" /> <circle cx="82" cy="42" r="1" fill="#5D4037" />
                                                    <circle cx="76" cy="36" r="1.5" fill="#000" /> <circle cx="84" cy="36" r="1.5" fill="#000" />
                                                    {/* Ears */}
                                                    <path d="M70,28 L65,20 L75,25 Z" fill="#FFCDD2" stroke="#E57373" />
                                                    <path d="M90,28 L95,20 L85,25 Z" fill="#FFCDD2" stroke="#E57373" />
                                                    {/* Tail */}
                                                    <path d="M20,45 Q10,45 15,35" fill="none" stroke="#E57373" strokeWidth="3" />
                                                </g>
                                            )}

                                            {anim.id === 'chicken' && (
                                                <g transform="scale(0.7) translate(30,10)"> {/* Chicken */}
                                                    <path d="M30,50 Q25,35 40,35 Q50,35 60,45 L70,40 Q80,30 85,40 Q90,50 80,60 Q70,70 50,65 Q35,65 30,50 Z" fill="#F57C00" stroke="#E65100" strokeWidth="2" />
                                                    {/* Tail Feathers */}
                                                    <path d="M30,50 Q20,40 25,30 Q30,20 40,35" fill="#F57C00" stroke="#E65100" />
                                                    {/* Head */}
                                                    <circle cx="75" cy="30" r="10" fill="#F57C00" stroke="#E65100" />
                                                    <path d="M75,20 L75,15 L78,20 L82,16 L80,22 Z" fill="#D50000" /> {/* Comb */}
                                                    <path d="M85,30 L90,32 L85,34 Z" fill="#FFEA00" /> {/* Beak */}
                                                    <circle cx="78" cy="28" r="1.5" fill="#000" />
                                                    {/* Legs */}
                                                    <path d="M50,65 L50,75 L45,80" fill="none" stroke="#E65100" strokeWidth="3" />
                                                    <path d="M60,65 L60,75 L65,80" fill="none" stroke="#E65100" strokeWidth="3" />
                                                </g>
                                            )}
                                        </svg>
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-black/50 px-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            {config?.nameEs}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}


                        <div className="absolute bottom-[21%] right-[2%] z-20 w-48 h-32">
                            <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-xl overflow-visible">
                                {/* Shore/Bank */}
                                <path
                                    d="M10,60 Q30,20 90,25 Q160,30 180,60 Q190,90 150,110 Q90,125 40,110 Q5,90 10,60 Z"
                                    fill="#8D6E63" stroke="#5D4037" strokeWidth="3"
                                />
                                {/* Water */}
                                <path
                                    d="M15,60 Q35,25 90,30 Q155,35 175,60 Q185,85 145,105 Q85,120 40,105 Q10,85 15,60 Z"
                                    fill="#29B6F6" opacity="0.9"
                                />

                                {/* Water Ripples */}
                                <path d="M40,70 Q60,65 80,70" fill="none" stroke="#E1F5FE" strokeWidth="1.5" opacity="0.6" />
                                <path d="M100,80 Q120,75 140,80" fill="none" stroke="#E1F5FE" strokeWidth="1.5" opacity="0.6" />

                                {/* Lily Pads */}
                                <g transform="translate(40, 90)">
                                    <path d="M0,0 C-5,-5 5,-10 10,-5 C15,0 10,10 0,10 C-10,10 -15,0 -10,-5 L0,0" fill="#66BB6A" stroke="#2E7D32" strokeWidth="0.5" />
                                </g>
                                <g transform="translate(130, 50) scale(0.8)">
                                    <path d="M0,0 C-5,-5 5,-10 10,-5 C15,0 10,10 0,10 C-10,10 -15,0 -10,-5 L0,0" fill="#66BB6A" stroke="#2E7D32" strokeWidth="0.5" />
                                </g>

                                {/* Reeds */}
                                <g transform="translate(160, 50)">
                                    <path d="M0,0 Q2,-15 5,-25" fill="none" stroke="#33691E" strokeWidth="2" />
                                    <ellipse cx="5" cy="-25" rx="3" ry="8" fill="#5D4037" />
                                    <path d="M5,0 Q8,-12 12,-20" fill="none" stroke="#33691E" strokeWidth="2" />
                                    <ellipse cx="12" cy="-20" rx="2" ry="6" fill="#5D4037" />
                                </g>

                                {/* Mother Duck - Clickable */}
                                <g className="animate-pulse cursor-pointer hover:scale-110 transition-transform origin-center"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const duck = ANIMALS.find(a => a.id === 'duck');
                                        if (duck) activateScanner({ ...duck, type: 'animal' });
                                    }}
                                >
                                    <motion.g animate={{ x: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}>
                                        {/* Body */}
                                        <ellipse cx="80" cy="60" rx="15" ry="10" fill="#8D6E63" />
                                        <path d="M65,60 Q55,50 65,40 L95,40 Q105,50 95,60 Z" fill="#8D6E63" opacity="0" />
                                        <path d="M75,60 Q85,55 90,62" fill="none" stroke="#4E342E" strokeWidth="1.5" />
                                        <circle cx="92" cy="52" r="7" fill="#1B5E20" />
                                        <circle cx="93" cy="51" r="1.5" fill="white" /> <circle cx="93.5" cy="51" r="0.5" fill="black" />
                                        <path d="M98,52 L104,54 L98,56 Z" fill="#FBC02D" />
                                    </motion.g>
                                </g>

                                {/* Ducklings - Clickable Group */}
                                <g className="cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const duck = ANIMALS.find(a => a.id === 'duck');
                                        if (duck) activateScanner({ ...duck, type: 'animal' });
                                    }}
                                >
                                    {[0, 1, 2].map((d, i) => (
                                        <motion.g key={i} animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5, delay: i * 0.5, ease: "easeInOut" }}>
                                            <g transform={`translate(${50 - i * 12}, ${70 + (i % 2) * 5}) scale(0.6)`}>
                                                <ellipse cx="0" cy="0" rx="10" ry="7" fill="#FFEB3B" />
                                                <circle cx="8" cy="-5" r="5" fill="#FFEB3B" />
                                                <circle cx="9" cy="-6" r="1" fill="black" />
                                                <path d="M12,-5 L16,-3 L12,-1 Z" fill="#F57F17" />
                                            </g>
                                        </motion.g>
                                    ))}
                                </g>
                            </svg>
                        </div>

                        {/* === FRUIT TREES === */}
                        {/* === FRUIT TREES (Detailed Vector Style) === */}
                        {[
                            { bottom: '45%', right: '15%', fruit: '🍎', size: 140 },
                            { bottom: '50%', right: '8%', fruit: '🍊', size: 120 },
                            { bottom: '42%', right: '25%', fruit: '🍐', size: 130 },
                        ].map((tree, i) => (
                            <motion.div
                                key={`tree-${i}`}
                                className="absolute z-20 cursor-pointer group origin-bottom"
                                style={{ bottom: tree.bottom, right: tree.right, width: tree.size, height: tree.size }}
                                whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                            >
                                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
                                    {/* Trunk Base */}
                                    <path
                                        d="M45 100 L55 100 L55 60 Q65 45 75 35 L70 35 Q60 50 50 70 L48 70 Q35 50 25 35 L20 35 Q35 50 45 60 Z"
                                        fill="#5D4037" stroke="#3E2723" strokeWidth="2"
                                    />

                                    {/* Foliage - Irregular Cloud Shape */}
                                    <g>
                                        <circle cx="30" cy="40" r="25" fill="#27AE60" />
                                        <circle cx="70" cy="40" r="25" fill="#27AE60" />
                                        <circle cx="50" cy="25" r="28" fill="#2ECC71" />
                                        <circle cx="50" cy="50" r="25" fill="#229954" />
                                        <circle cx="20" cy="55" r="15" fill="#27AE60" />
                                        <circle cx="80" cy="55" r="15" fill="#27AE60" />
                                    </g>
                                </svg>

                                {/* Scattered Fruits */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <span className="absolute top-[25%] left-[30%] text-xl drop-shadow-md group-hover:animate-bounce delay-75">{tree.fruit}</span>
                                    <span className="absolute top-[20%] right-[30%] text-lg drop-shadow-md group-hover:animate-bounce delay-100">{tree.fruit}</span>
                                    <span className="absolute top-[40%] left-[45%] text-2xl drop-shadow-md group-hover:animate-bounce">{tree.fruit}</span>
                                    <span className="absolute top-[35%] right-[15%] text-sm drop-shadow-md group-hover:animate-bounce delay-150">{tree.fruit}</span>
                                    <span className="absolute top-[35%] left-[15%] text-sm drop-shadow-md group-hover:animate-bounce delay-200">{tree.fruit}</span>
                                </div>
                            </motion.div>
                        ))}

                        {/* === FLOWERS === */}
                        <div className="absolute bottom-[32%] left-[55%] text-3xl z-10">🌻</div>
                        <div className="absolute bottom-[28%] left-[60%] text-2xl z-10">🌼</div>
                        <div className="absolute bottom-[35%] left-[50%] text-2xl z-10">🌷</div>
                        <div className="absolute bottom-[15%] right-[20%] text-xl z-10">🌻</div>
                        <div className="absolute bottom-[20%] left-[70%] text-2xl z-10">🌺</div>

                        {/* === FARM FIELD — Crop Plots Grid === */}
                        {/* === FARM FIELD — Crop Plots Grid (Horizontal) === */}
                        <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[95%] max-w-[1100px] z-30">
                            <div className="bg-[#5D4037] rounded-3xl border-4 border-[#4E342E] shadow-[0_8px_0_#3E2723] p-3">
                                <div className="flex flex-row justify-between gap-2 w-full px-2">
                                    {plots.map((plot, i) => (
                                        <div key={plot.id}
                                            onClick={(e) => handlePlotClick(i, e)}
                                            className={`relative rounded-2xl transition-all duration-300 border-2 cursor-pointer group hover:scale-[1.05] hover:brightness-110 aspect-square flex-1 min-w-0
                                                        ${plot.isPlowed ? 'bg-[#6D4C41] border-[#5D4037] shadow-[inset_0_3px_6px_rgba(0,0,0,0.3)]' : 'bg-[#8D6E63] border-[#A1887F] shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]'}`}
                                        >
                                            {plot.isPlowed && <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_10px,rgba(0,0,0,0.12)_10px,rgba(0,0,0,0.12)_12px)] opacity-60 rounded-xl" />}
                                            {plot.stage !== 'idle' && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-4xl filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.3)] transform group-hover:scale-110 transition-transform">
                                                        {plot.stage === 'seed' ? '🌰' :
                                                            plot.stage === 'sprout' ? '🌱' :
                                                                CROP_TYPES.find(c => c.id === plot.cropId)?.ripe}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#3E2723]/90 text-white text-[9px] px-2 py-0.5 rounded-lg font-bold">
                                                {plot.stage === 'idle' ? (plot.isPlowed ? '🌱 Plant' : '🚜 Plow') : plot.stage}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* === ANIMALS roaming === */}
                        {animals.slice(0, 4).map((animal, i) => {
                            const config = ANIMALS.find(a => a.id === animal.animalId);
                            if (!config) return null;
                            const positions = [
                                { bottom: '22%', left: '38%' },
                                { bottom: '18%', left: '48%' },
                                { bottom: '26%', left: '44%' },
                                { bottom: '14%', left: '55%' },
                            ];
                            const pos = positions[i] || positions[0];
                            return (
                                <motion.div key={animal.id}
                                    className="absolute z-25 cursor-pointer"
                                    style={{ bottom: pos.bottom, left: pos.left }}
                                    whileHover={{ scale: 1.3, y: -5 }}
                                    animate={{ y: [0, -3, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 + i * 0.5, ease: 'easeInOut' }}
                                    onClick={(e) => handleAnimalClick(animals.indexOf(animal), e)}
                                >
                                    <span className="text-4xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]">{config.icon}</span>
                                </motion.div>
                            );
                        })}

                        {/* === WINDMILL (decorative) === */}
                        <div className="absolute bottom-[48%] right-[5%] z-15">
                            <div className="w-6 h-20 bg-[#F5E6D3] mx-auto rounded-sm border border-[#D4B896]" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                                className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl"
                            >
                                🌀
                            </motion.div>
                        </div>

                    </div>
                )}



                {/* === BARN INTERIOR VIEW — Warm Clay Toy Style === */}
                {
                    view === 'barn' && (
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key="barn-view"
                                initial={{ y: -500, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -500, opacity: 0 }}
                                className="absolute inset-x-0 bottom-0 top-[8vh] max-w-5xl mx-auto bg-[#8B6914] rounded-t-[40px] shadow-2xl overflow-hidden border-x-[12px] border-t-[12px] border-[#6B4F12] flex flex-col items-center z-50 pointer-events-auto"
                            >

                                {/* Barn Interior Background */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#A67C00] to-[#5D4037]" />
                                    {/* Wooden plank texture */}
                                    <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,#000_0px,#000_1px,transparent_1px,transparent_50px)]" />
                                    {/* Hay on floor */}
                                    <div className="absolute bottom-0 inset-x-0 h-[15%] bg-gradient-to-t from-[#F0C040]/30 to-transparent" />
                                </div>

                                {/* Barn Interior Header */}
                                <div className="w-full p-6 flex justify-between items-start z-20 relative">
                                    <button onClick={() => setView('field')} className="bg-[#C0392B] hover:bg-[#E74C3C] text-white px-5 py-3 rounded-2xl font-black text-sm border-b-4 border-[#922B21] transition-all flex items-center gap-2 shadow-lg active:translate-y-1 active:border-b-0">
                                        <ArrowLeft size={20} />
                                        {narrativeStep >= 7 ? '✅ Done!' : '← Back'}
                                    </button>
                                    <div className="bg-[#5D4037]/90 backdrop-blur-sm px-6 py-2.5 rounded-2xl border-b-4 border-[#3E2723] shadow-lg border-2 border-[#8D6E63]">
                                        <h2 className="text-xl font-black text-[#FFECB3] uppercase tracking-widest flex items-center gap-2">
                                            🏠 The Barn
                                        </h2>
                                    </div>
                                    <div className="w-16" />
                                </div>

                                {/* Stalls Container — Warm clay grid */}
                                <div className="flex-1 w-full max-w-5xl grid grid-cols-2 md:grid-cols-3 gap-6 p-6 overflow-y-auto z-10 custom-scrollbar">
                                    {animals
                                        .filter(a => a.id !== 'tractor')
                                        .map((animal) => {
                                            const config = ANIMALS.find(a => a.id === animal.animalId);
                                            if (!config) return null;
                                            return (
                                                <motion.div
                                                    key={animal.id}
                                                    layoutId={`animal-${animal.id}`}
                                                    className="bg-[#8D6E63] rounded-3xl border-4 border-[#6D4C41] p-5 relative group hover:bg-[#A1887F] transition-all shadow-[0_6px_0_#5D4037,0_10px_20px_rgba(0,0,0,0.2)] min-h-[400px] flex flex-col items-center"
                                                    whileHover={{ y: -6 }}
                                                >
                                                    {/* Stall Gate (Front) — simplified */}
                                                    <div className="absolute bottom-0 left-0 w-full h-[30%] bg-[repeating-linear-gradient(90deg,#5D4037_0px,#5D4037_8px,transparent_8px,transparent_40px)] border-t-4 border-[#5D4037] rounded-b-[1.4rem] z-20 opacity-40" />

                                                    {/* Animal Display */}
                                                    <div className="flex flex-col items-center justify-center pt-6 pb-3 relative z-10 w-full">
                                                        <div className="text-8xl mb-3 filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)] transform group-hover:scale-110 transition-transform cursor-pointer"
                                                            onClick={(e) => {
                                                                if (selectedTool === 'feed' || animal.animalState === 'happy') {
                                                                    handleFeedAnimal(animal.id, e as any);
                                                                } else {
                                                                    speakItem(config.name, 'en');
                                                                    setScanningItem({
                                                                        id: animal.id,
                                                                        name: config.name,
                                                                        image: config.icon,
                                                                        nameEs: config.nameEs,
                                                                        article: config.article,
                                                                        type: 'animal'
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            {config.icon}
                                                        </div>
                                                        <div className="bg-[#5D4037] px-4 py-1.5 rounded-xl text-[#FFECB3] font-extrabold text-sm uppercase tracking-widest border-2 border-[#8D6E63] shadow-md">
                                                            {config.name}
                                                        </div>

                                                        {/* Diet Summary Tags */}
                                                        <div className="mt-3 flex flex-wrap justify-center gap-1.5 opacity-80">
                                                            {config.food.slice(0, 3).map(fId => {
                                                                const fCrop = CROP_TYPES.find(c => c.id === fId);
                                                                return (
                                                                    <span key={fId} className="text-[11px] bg-[#6D4C41] px-2 py-0.5 rounded-lg text-[#FFECB3] border border-[#8D6E63] font-bold">
                                                                        {fCrop?.ripe}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Status Icon Overlay */}
                                                        {animal.animalState === 'hungry' && (
                                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-2 bg-red-500 text-white p-3 rounded-full animate-bounce shadow-2xl border-4 border-white z-20">
                                                                <span className="text-2xl">🍽️</span>
                                                            </motion.div>
                                                        )}
                                                        {animal.animalState === 'eating' && (
                                                            <div className="absolute -top-4 -right-2 bg-green-500 text-white p-3 rounded-full shadow-2xl border-4 border-white z-20">
                                                                <span className="text-2xl">😋</span>
                                                            </div>
                                                        )}
                                                        {animal.animalState === 'happy' && (
                                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }} className="absolute -top-4 -right-2 bg-amber-400 text-white p-3 rounded-full shadow-2xl border-4 border-white animate-pulse z-20">
                                                                <span className="text-2xl">✨</span>
                                                            </motion.div>
                                                        )}
                                                    </div>

                                                    {/* Food Request Interaction */}
                                                    {animal.animalState === 'hungry' && (
                                                        <div className="mt-2 w-full px-2 pb-4 flex flex-col gap-3 relative z-20">
                                                            <button
                                                                onClick={(e) => handleFeedAnimal(animal.id, e as any)}
                                                                className="w-full bg-[#F39C12] hover:bg-[#E67E22] text-white py-3 rounded-2xl font-black text-sm shadow-[0_4px_0_#D35400] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                                                            >
                                                                <span className="text-xl">🌽</span>
                                                                <span>FEED {CROP_TYPES.find(c => c.id === animal.requestedFood)?.name.toUpperCase()}</span>
                                                            </button>

                                                            <div className="flex flex-col items-center bg-[#5D4037]/60 p-4 rounded-2xl border-2 border-[#8D6E63] w-full shadow-inner">
                                                                <div className="flex items-center gap-3 bg-[#6D4C41] px-4 py-3 rounded-xl border-2 border-[#8D6E63] w-full justify-between shadow-md">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="relative">
                                                                            <span className="text-4xl filter drop-shadow-xl block">{CROP_TYPES.find(c => c.id === animal.requestedFood)?.ripe}</span>
                                                                            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-white/20 rounded-full blur-md" />
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[10px] font-black text-[#F39C12] uppercase leading-none mb-1">Requested / Pidiendo</span>
                                                                            <span className="text-sm font-black text-[#FFECB3] uppercase tracking-tight">
                                                                                {CROP_TYPES.find(c => c.id === animal.requestedFood)?.name}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className={cn(
                                                                        "px-3 py-1.5 rounded-xl font-black text-lg min-w-[45px] text-center shadow-md border-2",
                                                                        (inventory[animal.requestedFood!] || 0) > 0 ? 'bg-[#27AE60] text-white border-[#1E8449] shadow-[0_3px_0_#196F3D]' : 'bg-[#C0392B] text-white border-[#922B21] shadow-[0_3px_0_#7B241C]'
                                                                    )}>
                                                                        {inventory[animal.requestedFood!] || 0}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                </motion.div>
                                            );
                                        })}
                                    {/* Empty Stall for Adding */}
                                    <div className="bg-[#6D4C41]/30 border-4 border-dashed border-[#A1887F] rounded-3xl flex flex-col items-center justify-center p-6 opacity-50 hover:opacity-100 transition-all cursor-pointer text-[#D7CCC8] hover:text-white hover:bg-[#6D4C41]/40 hover:scale-[1.02] shadow-lg">
                                        <div className="w-16 h-16 rounded-full border-4 border-dashed border-current flex items-center justify-center mb-3">
                                            <Plus size={36} />
                                        </div>
                                        <span className="font-black uppercase tracking-widest text-xs">Add Animal</span>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )
                }
            </div>









            <AnimatePresence>
                {scanningItem && (
                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-6 right-6 z-50 bg-[#FFF8DC] backdrop-blur-xl border-4 border-[#F39C12] p-5 rounded-3xl shadow-[0_8px_0_#D4A574,0_12px_30px_rgba(0,0,0,0.2)] w-80">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <span className="text-4xl bg-[#FFECB3] p-2.5 rounded-2xl border-2 border-[#F0C040]">{scanningItem.image}</span>
                                <div>
                                    <h3 className="text-2xl font-black text-[#5D4037] leading-tight mb-0.5">{scanningItem.name}</h3>
                                    <p className="text-xs text-[#8B6914] font-bold uppercase tracking-wider">{scanningItem.article} {scanningItem.nameEs}</p>
                                </div>
                            </div>
                            <button onClick={() => setScanningItem(null)} className="text-slate-300 hover:text-red-500 transition-colors">
                                <CheckCircle size={28} />
                            </button>
                        </div>

                        <div className="bg-[#FFECB3] rounded-2xl p-3 mb-3 border-2 border-[#F0C040]">
                            <div className="flex gap-2">
                                <button onClick={() => speakItem(scanningItem.name, 'en')} className="flex-1 py-3 bg-white border-2 border-[#F0C040] rounded-xl hover:bg-[#FFF8DC] transition-all flex flex-col items-center gap-1 group">
                                    <Volume2 size={22} className="text-[#8B6914] group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black text-[#8B6914] uppercase">Listen</span>
                                </button>
                                <button onClick={startListening} disabled={scanResult === 'success'}
                                    className={`flex-1 py-4 border-b-4 rounded-2xl transition-all flex flex-col items-center gap-1 active:border-b-0 active:translate-y-1
                                        ${scanResult === 'success' ? 'bg-green-500 border-green-700 text-white' :
                                            scanResult === 'listening' ? 'bg-red-500 border-red-700 text-white animate-pulse' :
                                                'bg-yellow-400 border-yellow-600 hover:bg-yellow-300 text-yellow-900'
                                        }`}
                                >
                                    {scanResult === 'success' ? <Star size={24} className="animate-spin" /> : <Mic size={24} />}
                                    <span className="text-[10px] font-black uppercase">
                                        {scanResult === 'listening' ? 'Listening' : scanResult === 'success' ? 'Great!' : 'Speak'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="text-center">
                            {scanResult === 'idle' && <p className="text-xs font-bold text-slate-400">Say the word in English!</p>}
                            {scanResult === 'listening' && <p className="text-xs font-bold text-blue-500 animate-pulse">Say "{scanningItem.name}"</p>}
                            {scanResult === 'retry' && <p className="text-xs font-bold text-red-500">Not quite, try again!</p>}
                            {scanResult === 'success' && <p className="text-sm font-black text-green-500 animate-bounce">Excellent! / ¡Excelente!</p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BILINGUAL SUBTITLE OVERLAY */}
            <AnimatePresence>
                {currentSubtitle && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-[100]"
                    >
                        <div className="bg-black/80 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center gap-2 pointer-events-auto">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                    <Volume2 size={16} className="text-white" />
                                </div>
                                <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Listen & Learn • Click words!</span>
                            </div>

                            <div className="text-white text-2xl md:text-3xl font-black tracking-tight leading-loose flex flex-wrap justify-center gap-x-2">
                                {currentSubtitle.en.split(' ').map((word, i) => {
                                    const cleanWord = word.toLowerCase().replace(/[.,!¡¿?;:"'()]/g, '');
                                    const hasMatch = FARM_KEYWORDS[cleanWord];
                                    return (
                                        <motion.span
                                            key={`en-${i}`}
                                            whileHover={hasMatch ? { scale: 1.1, color: '#facc15' } : {}}
                                            onClick={() => {
                                                if (hasMatch) {
                                                    playNudge();
                                                    addFloater(hasMatch.toUpperCase(), 500, 700, 'text-yellow-400 font-bold drop-shadow-md');
                                                    speakItem(hasMatch, 'es');
                                                }
                                            }}
                                            className={cn(
                                                "cursor-pointer transition-all px-1 rounded-lg",
                                                hasMatch
                                                    ? "text-yellow-400 font-bold underline decoration-yellow-500 decoration-2 underline-offset-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                                                    : "text-white"
                                            )}
                                        >
                                            {word}
                                        </motion.span>
                                    );
                                })}
                            </div>

                            {currentSubtitle.es && (
                                <>
                                    <div className="h-px w-24 bg-white/20 my-2" />
                                    <div className="text-indigo-100 text-lg md:text-xl font-bold italic flex flex-wrap justify-center gap-x-2">
                                        {currentSubtitle.es.split(' ').map((word, i) => {
                                            const cleanWord = word.toLowerCase().replace(/[.,!¡¿?;:"'()]/g, '');
                                            const hasMatch = FARM_KEYWORDS[cleanWord];
                                            return (
                                                <span
                                                    key={`es-${i}`}
                                                    onClick={() => {
                                                        if (hasMatch) {
                                                            playNudge();
                                                            addFloater(hasMatch.toUpperCase(), 500, 700, 'text-amber-300 font-bold drop-shadow-md');
                                                            speakItem(hasMatch, 'en');
                                                        }
                                                    }}
                                                    className={cn(
                                                        "cursor-pointer transition-all px-1 rounded-lg",
                                                        hasMatch ? "text-amber-300 font-bold underline decoration-amber-400 decoration-2 underline-offset-4 not-italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" : "opacity-80"
                                                    )}
                                                >
                                                    {word}
                                                </span>
                                            );
                                        })}
                                    </div>
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
            {/* CSS for Roof */}
            <style>{`
                    .clip-path-roof { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
                    .transform-style-3d { transform-style: preserve-3d; }
                `}</style>
        </div>
    );
};

export default FarmZone;
