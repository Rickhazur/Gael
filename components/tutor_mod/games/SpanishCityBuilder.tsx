import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Building2, Sparkles, Star, Trophy, ArrowLeft, Hammer, Zap, Coins, MapPin, Globe } from "lucide-react";
import { useRewards } from "@/hooks/useRewards_mod";
import confetti from 'canvas-confetti';
import { sfx } from '@/services/soundEffects';
import { getRandomSpellingWords, type SpellingWord } from '@/data/spanishSpellingWords';

interface SpanishCityBuilderProps {
  grade: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  onComplete: (score: number, coins: number) => void;
  onClose: () => void;
}

interface Building {
  id: string;
  type: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  progress: number;
}

interface CoinParticle {
  id: string;
  x: number;
  y: number;
  value: number;
  progress: number;
}

// ─── City Theme Definitions ───────────────────────────────────────
interface CityTheme {
  id: string;
  name: string;
  country: string;
  flag: string;
  landmark: string;
  description: string;
  bgGradient: string;
  groundGradient: string;
  skyColors: string[];
  accentColor: string;
  glowColor: string;
  buildings: { emoji: string; name: string }[];
  landmarks: { emoji: string; name: string }[];
  atmosphere: { emoji: string; count: number }[];
  bgImage?: string;
}

const CITY_THEMES: CityTheme[] = [
  {
    id: 'new-york',
    name: 'New York',
    country: 'USA',
    flag: '🇺🇸',
    landmark: '🗽',
    description: 'The city that never sleeps',
    bgGradient: 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)',
    groundGradient: 'linear-gradient(to top, #2d2d2d, #404040, #555555)',
    skyColors: ['#1a1a2e', '#16213e', '#0f3460'],
    accentColor: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.3)',
    buildings: [
      { emoji: '🏙️', name: 'Skyscraper' },
      { emoji: '🏢', name: 'Office Tower' },
      { emoji: '🏬', name: 'Department Store' },
      { emoji: '🏗️', name: 'Construction' },
      { emoji: '🏛️', name: 'Federal Hall' },
      { emoji: '🌉', name: 'Bridge' },
      { emoji: '🏟️', name: 'Stadium' },
      { emoji: '🚕', name: 'Taxi Station' },
    ],
    landmarks: [
      { emoji: '🗽', name: 'Statue of Liberty' },
      { emoji: '🌆', name: 'Manhattan Skyline' },
    ],
    atmosphere: [
      { emoji: '✨', count: 20 },
      { emoji: '🌟', count: 8 },
    ],
    bgImage: '/assets/city/city_new_york.png',
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    landmark: '⛩️',
    description: 'Where tradition meets the future',
    bgGradient: 'linear-gradient(to bottom, #fce4ec 0%, #f8bbd0 25%, #f48fb1 50%, #ec407a 80%, #c62828 100%)',
    groundGradient: 'linear-gradient(to top, #4a4a4a, #5c5c5c, #6e6e6e)',
    skyColors: ['#fce4ec', '#f8bbd0', '#f48fb1'],
    accentColor: '#FF4081',
    glowColor: 'rgba(255, 64, 129, 0.3)',
    buildings: [
      { emoji: '🏯', name: 'Castle' },
      { emoji: '⛩️', name: 'Torii Gate' },
      { emoji: '🗼', name: 'Tokyo Tower' },
      { emoji: '🏢', name: 'Modern Tower' },
      { emoji: '🎪', name: 'Festival' },
      { emoji: '🏮', name: 'Lantern Shop' },
      { emoji: '🍱', name: 'Bento House' },
      { emoji: '🚅', name: 'Station' },
    ],
    landmarks: [
      { emoji: '🗻', name: 'Mt. Fuji' },
      { emoji: '🌸', name: 'Cherry Blossoms' },
    ],
    atmosphere: [
      { emoji: '🌸', count: 25 },
      { emoji: '🎐', count: 5 },
      { emoji: '✨', count: 10 },
    ],
    bgImage: '/assets/city/city_tokyo.png',
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    landmark: '🗼',
    description: 'The city of light and love',
    bgGradient: 'linear-gradient(to bottom, #e8eaf6 0%, #c5cae9 25%, #9fa8da 50%, #7986cb 80%, #3f51b5 100%)',
    groundGradient: 'linear-gradient(to top, #8d6e63, #a1887f, #bcaaa4)',
    skyColors: ['#e8eaf6', '#c5cae9', '#9fa8da'],
    accentColor: '#3F51B5',
    glowColor: 'rgba(63, 81, 181, 0.3)',
    buildings: [
      { emoji: '🏰', name: 'Château' },
      { emoji: '🗼', name: 'Eiffel Tower' },
      { emoji: '🎭', name: 'Théâtre' },
      { emoji: '🏛️', name: 'Musée' },
      { emoji: '🥐', name: 'Boulangerie' },
      { emoji: '🎨', name: 'Art Gallery' },
      { emoji: '⛪', name: 'Cathédrale' },
      { emoji: '🍷', name: 'Bistro' },
    ],
    landmarks: [
      { emoji: '🗼', name: 'Tour Eiffel' },
      { emoji: '🎠', name: 'Carousel' },
    ],
    atmosphere: [
      { emoji: '🌹', count: 12 },
      { emoji: '✨', count: 15 },
      { emoji: '🕊️', count: 5 },
    ],
    bgImage: '/assets/city/city_paris.png',
  },
  {
    id: 'london',
    name: 'London',
    country: 'UK',
    flag: '🇬🇧',
    landmark: '🎡',
    description: 'The crown jewel of Europe',
    bgGradient: 'linear-gradient(to bottom, #cfd8dc 0%, #b0bec5 25%, #90a4ae 50%, #607d8b 80%, #455a64 100%)',
    groundGradient: 'linear-gradient(to top, #3e2723, #4e342e, #5d4037)',
    skyColors: ['#cfd8dc', '#b0bec5', '#90a4ae'],
    accentColor: '#D32F2F',
    glowColor: 'rgba(211, 47, 47, 0.3)',
    buildings: [
      { emoji: '🏰', name: 'Tower of London' },
      { emoji: '🎡', name: 'London Eye' },
      { emoji: '⏰', name: 'Big Ben' },
      { emoji: '🏛️', name: 'Parliament' },
      { emoji: '🚌', name: 'Bus Stop' },
      { emoji: '☕', name: 'Tea House' },
      { emoji: '👑', name: 'Palace' },
      { emoji: '📞', name: 'Phone Box' },
    ],
    landmarks: [
      { emoji: '⏰', name: 'Big Ben' },
      { emoji: '🎡', name: 'London Eye' },
    ],
    atmosphere: [
      { emoji: '☁️', count: 15 },
      { emoji: '🌧️', count: 5 },
      { emoji: '✨', count: 8 },
    ],
    bgImage: '/assets/city/city_london.png',
  },
];

export default function SpanishCityBuilder({ grade, onComplete, onClose }: SpanishCityBuilderProps) {
  const { addCoins, balance } = useRewards();

  const [selectedCity, setSelectedCity] = useState<CityTheme | null>(null);
  const [gamePhase, setGamePhase] = useState<'city-select' | 'playing' | 'victory'>('city-select');

  const words = useMemo(() => getRandomSpellingWords(grade, 6 + Math.floor(Math.random() * 3)), [grade]);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [coinParticles, setCoinParticles] = useState<CoinParticle[]>([]);
  const [buildingInProgress, setBuildingInProgress] = useState<Building | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  const currentWord = words[currentWordIndex];
  const uniqueIncorrect = [...new Set(currentWord.incorrect.filter(opt => opt !== currentWord.correct))];
  while (uniqueIncorrect.length < 3) {
    const variations = [
      currentWord.correct + 'x',
      currentWord.correct.replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u'),
      currentWord.correct.toUpperCase(),
    ];
    const newVar = variations.find(v => v !== currentWord.correct && !uniqueIncorrect.includes(v));
    if (newVar) uniqueIncorrect.push(newVar);
    else break;
  }
  const options = [currentWord.correct, ...uniqueIncorrect.slice(0, 3)].sort(() => Math.random() - 0.5);

  useEffect(() => {
    if (gamePhase === 'playing' && timeLeft > 0 && !showResult) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gamePhase === 'playing') {
      handleAnswer('timeout');
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, showResult, gamePhase]);

  useEffect(() => {
    if (buildingInProgress) {
      const interval = setInterval(() => {
        setBuildings(prev => prev.map(b =>
          b.id === buildingInProgress.id
            ? { ...b, progress: Math.min(100, b.progress + 2) }
            : b
        ));
      }, 30);
      return () => clearInterval(interval);
    }
  }, [buildingInProgress]);

  const createCoinParticles = (amount: number, x: number, y: number) => {
    const particles: CoinParticle[] = [];
    for (let i = 0; i < Math.min(amount, 10); i++) {
      particles.push({
        id: `coin-${Date.now()}-${i}`,
        x: x + (Math.random() - 0.5) * 100,
        y: y + (Math.random() - 0.5) * 100,
        value: Math.floor(amount / Math.min(amount, 10)),
        progress: 0,
      });
    }
    setCoinParticles(prev => [...prev, ...particles]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCoinParticles(prev =>
        prev.map(p => ({ ...p, progress: Math.min(100, p.progress + 3) }))
          .filter(p => p.progress < 100)
      );
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const getRandomCityBuilding = () => {
    if (!selectedCity) return { emoji: '🏢', name: 'Edificio' };
    const all = [...selectedCity.buildings, ...selectedCity.landmarks];
    return all[Math.floor(Math.random() * all.length)];
  };

  const addBuilding = (word: SpellingWord) => {
    const existingX = buildings.map(b => b.x);
    let newX = Math.random() * 60 + 20;
    let attempts = 0;
    while (existingX.some(x => Math.abs(x - newX) < 15) && attempts < 10) {
      newX = Math.random() * 60 + 20;
      attempts++;
    }

    const cityBuilding = getRandomCityBuilding();

    const newBuilding: Building = {
      id: `building-${Date.now()}`,
      type: cityBuilding.name,
      emoji: cityBuilding.emoji,
      x: newX,
      y: Math.random() * 25 + 25,
      size: 60 + (streak * 5),
      progress: 0,
    };
    setBuildings(prev => [...prev, newBuilding]);
    setBuildingInProgress(newBuilding);

    if (cityRef.current) {
      const rect = cityRef.current.getBoundingClientRect();
      createCoinParticles(20 + (streak * 5), rect.left + rect.width * (newBuilding.x / 100), rect.top + rect.height * (1 - newBuilding.y / 100));
    }
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    const correct = answer === currentWord.correct;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const earnedCoins = 20 + (streak * 5);
      const earnedScore = 15 + (streak * 3);
      setStreak(prev => prev + 1);
      setScore(prev => prev + earnedScore);
      setCoinsEarned(prev => prev + earnedCoins);
      addCoins(earnedCoins, 'spanish-city-builder');
      addBuilding(currentWord);
      sfx.playSuccess();
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B']
      });
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);
      setTimeLeft(30);
      setBuildingInProgress(null);

      if (correct) {
        if (currentWordIndex + 1 < words.length) {
          setCurrentWordIndex(prev => prev + 1);
        } else {
          const finalCoins = coinsEarned + 50;
          setCoinsEarned(finalCoins);
          addCoins(50, 'spanish-city-builder');
          setGamePhase('victory');
          confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
          });
        }
      }
    }, 2000);
  };

  const handleCitySelect = (city: CityTheme) => {
    setSelectedCity(city);
    setGamePhase('playing');
    sfx.playSuccess();
  };

  // ─── CITY SELECTION SCREEN ─────────────────────────────────────
  if (gamePhase === 'city-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
        {/* Animated background particles */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 100%)`,
            }}
            animate={{
              y: [0, -30 - Math.random() * 40, 0],
              opacity: [0.1, 0.7, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Header */}
        <div className="relative z-20 pt-8 pb-4 px-6">
          <div className="flex items-center justify-between mb-8">
            <Button onClick={onClose} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Salir
            </Button>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-white">{balance}</span>
            </div>
          </div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              🌍
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
              City <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Architect</span>
            </h1>
            <p className="text-lg text-indigo-300 font-medium">Elige una ciudad para construir</p>
          </motion.div>
        </div>

        {/* City Cards */}
        <div className="relative z-20 px-6 pb-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {CITY_THEMES.map((city, idx) => (
              <motion.button
                key={city.id}
                onClick={() => handleCitySelect(city)}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.15, type: "spring", stiffness: 200, damping: 20 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative rounded-3xl overflow-hidden border-2 border-white/10 hover:border-white/30 transition-all duration-300 text-left"
                style={{ minHeight: '220px' }}
              >
                {/* Background gradient */}
                <div
                  className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: city.bgGradient }}
                />

                {/* Background image if available */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                  style={{ backgroundImage: `url(${city.bgImage})` }}
                />

                {/* Glass overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Floating city emojis */}
                <div className="absolute inset-0 overflow-hidden">
                  {city.atmosphere.map((atm, ai) =>
                    [...Array(Math.min(atm.count, 8))].map((_, pi) => (
                      <motion.div
                        key={`${ai}-${pi}`}
                        className="absolute text-xl opacity-30 group-hover:opacity-60 transition-opacity"
                        style={{
                          left: `${Math.random() * 80 + 10}%`,
                          top: `${Math.random() * 60 + 10}%`,
                        }}
                        animate={{
                          y: [0, -15, 0],
                          x: [0, Math.random() * 10 - 5, 0],
                          rotate: [0, Math.random() * 20 - 10, 0],
                        }}
                        transition={{
                          duration: 3 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                          ease: "easeInOut",
                        }}
                      >
                        {atm.emoji}
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Content */}
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{city.flag}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/50">{city.country}</span>
                      </div>
                      <h2 className="text-3xl font-black text-white tracking-tight">{city.name}</h2>
                      <p className="text-sm text-white/60 mt-1">{city.description}</p>
                    </div>
                    <motion.div
                      className="text-5xl"
                      animate={{
                        scale: [1, 1.15, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {city.landmark}
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <div className="flex gap-2">
                      {city.buildings.slice(0, 5).map((b, bi) => (
                        <motion.span
                          key={bi}
                          className="text-2xl"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.15 + bi * 0.05, type: "spring" }}
                        >
                          {b.emoji}
                        </motion.span>
                      ))}
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 group-hover:bg-white/30 transition-all">
                      <MapPin className="w-4 h-4 text-white" />
                      <span className="text-sm font-bold text-white">Construir</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── VICTORY SCREEN ────────────────────────────────────────────
  if (gamePhase === 'victory') {
    const city = selectedCity!;
    return (
      <div
        className="p-6 text-white min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: city.bgGradient }}
      >
        {/* Atmospheric emojis */}
        {city.atmosphere.map((atm, ai) =>
          [...Array(atm.count)].map((_, pi) => (
            <motion.div
              key={`victory-atm-${ai}-${pi}`}
              className="absolute text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            >
              {atm.emoji}
            </motion.div>
          ))
        )}

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-center max-w-2xl relative z-10"
        >
          <motion.div
            className="text-9xl mb-6"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {city.landmark}
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">¡{city.name} COMPLETADA!</h1>
          <p className="text-2xl mb-8 opacity-80">Has construido una ciudad increíble con tu ortografía perfecta</p>

          <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 mb-6 border border-white/20">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-4xl font-black">{score}</div>
                <div className="text-sm opacity-70">Puntos</div>
              </div>
              <div>
                <div className="text-4xl font-black flex items-center justify-center gap-2">
                  <Coins className="w-8 h-8 text-yellow-300" />
                  {coinsEarned}
                </div>
                <div className="text-sm opacity-70">Monedas</div>
              </div>
              <div>
                <div className="text-4xl font-black">{buildings.length}</div>
                <div className="text-sm opacity-70">Edificios</div>
              </div>
            </div>

            {/* Built buildings showcase */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              {buildings.map((b, i) => (
                <motion.span
                  key={i}
                  className="text-4xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                >
                  {b.emoji}
                </motion.span>
              ))}
            </div>
          </div>

          <Button
            onClick={() => {
              onComplete(score, coinsEarned);
              onClose();
            }}
            size="lg"
            className="bg-white text-purple-900 font-black text-xl px-8 py-6 rounded-xl shadow-2xl hover:bg-white/90"
          >
            {city.flag} Ver Mi {city.name}
          </Button>
        </motion.div>
      </div>
    );
  }

  // ─── MAIN GAME SCREEN ──────────────────────────────────────────
  const city = selectedCity!;

  return (
    <div
      className="p-4 md:p-6 text-white min-h-screen relative overflow-hidden"
      style={{ background: city.bgGradient }}
    >
      {/* Atmospheric particles */}
      {city.atmosphere.map((atm, ai) =>
        [...Array(atm.count)].map((_, pi) => (
          <motion.div
            key={`atm-${ai}-${pi}`}
            className="absolute text-lg pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20 - Math.random() * 30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.15, 0.5, 0.15],
              rotate: [0, Math.random() * 30 - 15, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut",
            }}
          >
            {atm.emoji}
          </motion.div>
        ))
      )}

      {/* Header */}
      <div className="relative z-20 flex items-center justify-between mb-4">
        <Button onClick={onClose} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Salir
        </Button>
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2 justify-center">
            {city.landmark} {city.name} Architect
          </h1>
          <p className="text-sm opacity-70">Palabra {currentWordIndex + 1} de {words.length}</p>
        </div>
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="font-bold">{balance + coinsEarned}</span>
        </div>
      </div>

      {/* Timer */}
      <div className="relative z-20 text-center mb-3">
        <div className={`text-3xl font-black ${timeLeft <= 10 ? 'text-red-300 animate-pulse' : 'text-yellow-300'}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {/* City Canvas */}
      <div
        ref={cityRef}
        className="relative z-10 w-full rounded-2xl border-2 border-white/20 shadow-2xl mb-4 overflow-hidden"
        style={{
          minHeight: '400px',
          height: '45vh',
          maxHeight: '500px',
          boxShadow: `0 20px 60px rgba(0,0,0,0.3), 0 0 80px ${city.glowColor}`,
        }}
      >
        {/* Sky */}
        <div className="absolute inset-0" style={{ background: city.bgGradient }} />

        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${city.bgImage})` }}
        />

        {/* Landmark in background */}
        <motion.div
          className="absolute text-8xl opacity-20"
          style={{ right: '10%', top: '10%' }}
          animate={{
            scale: [1, 1.05, 1],
            y: [0, -5, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {city.landmarks[0]?.emoji}
        </motion.div>

        {/* Ground */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[30%]"
          style={{ background: city.groundGradient }}
        >
          {/* Street */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gray-600/50" />
          <div className="absolute top-1 left-0 right-0 h-1 bg-yellow-400/40" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,200,0,0.5) 20px, rgba(255,200,0,0.5) 40px)'
          }} />
        </div>

        {/* Buildings */}
        <AnimatePresence>
          {buildings.map((building) => (
            <motion.div
              key={building.id}
              initial={{ scale: 0, y: 300, opacity: 0 }}
              animate={{
                scale: building.progress / 100,
                y: 0,
                opacity: building.progress / 100,
              }}
              exit={{ scale: 0, opacity: 0, y: 200 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="absolute"
              style={{
                left: `${building.x}%`,
                bottom: `${building.y}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="relative">
                {/* Shadow */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-14 h-3 bg-black/25 rounded-full blur-md" />

                {/* Building emoji */}
                <motion.div
                  animate={{
                    scale: building.progress < 100 ? [1, 1.08, 1] : 1,
                    y: building.progress < 100 ? [0, -3, 0] : 0,
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: building.progress < 100 ? Infinity : 0,
                  }}
                  style={{
                    filter: building.progress < 100
                      ? `drop-shadow(0 0 12px ${city.glowColor})`
                      : 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                  }}
                >
                  <div className="text-6xl md:text-7xl relative z-10" style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  }}>
                    {building.emoji}
                  </div>

                  {/* Construction glow */}
                  {building.progress < 100 && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: `radial-gradient(circle, ${city.glowColor} 0%, transparent 70%)` }}
                      animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Progress bar */}
                {building.progress < 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-20"
                  >
                    <div className="h-2.5 bg-white/20 rounded-full overflow-hidden border border-white/30">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${city.accentColor}, ${city.accentColor}dd)`,
                          width: `${building.progress}%`
                        }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Label */}
                {building.progress >= 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg border border-white/30 whitespace-nowrap"
                    style={{ background: city.accentColor }}
                  >
                    {building.type}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Coin particles */}
        <AnimatePresence>
          {coinParticles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 1, scale: 1 }}
              animate={{
                y: -particle.progress * 2,
                opacity: 1 - particle.progress / 100,
                scale: 1 + particle.progress / 50,
              }}
              exit={{ opacity: 0 }}
              className="absolute text-yellow-400 font-black text-lg pointer-events-none"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              +{particle.value}🪙
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Construction animation */}
        {isCorrect && showResult && buildingInProgress && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [1, 1.2, 1], rotate: 0 }}
            exit={{ scale: 0 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl z-50 pointer-events-none"
          >
            🔨
          </motion.div>
        )}
      </div>

      {/* Challenge Card */}
      <div className="relative z-20 bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border-2 mb-4"
        style={{ borderColor: city.accentColor + '60' }}
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{city.landmark}</div>
          <p className="text-xl font-bold mb-2 text-gray-800">¿Cómo se escribe correctamente?</p>
          <div
            className="rounded-xl p-4 mb-4 border-2"
            style={{
              background: `linear-gradient(135deg, ${city.accentColor}10, ${city.accentColor}20)`,
              borderColor: city.accentColor + '30',
            }}
          >
            <p
              className="text-4xl font-black tracking-wide select-none"
              style={{
                color: city.accentColor,
                textShadow: '1px 1px 2px rgba(0,0,0,0.05)',
                textRendering: 'optimizeLegibility',
              }}
            >
              {currentWord.word}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option)}
              disabled={showResult}
              className={`p-4 rounded-xl font-bold text-lg transition-colors duration-200 ${showResult
                ? option === currentWord.correct
                  ? 'bg-green-500 border-3 border-green-300 text-white'
                  : selectedAnswer === option
                    ? 'bg-red-500 border-3 border-red-300 text-white'
                    : 'bg-gray-200 opacity-50 text-gray-500'
                : 'border-3 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-transform'
                }`}
              style={showResult ? {} : {
                background: `linear-gradient(135deg, ${city.accentColor}, ${city.accentColor}cc)`,
                borderColor: city.accentColor + '80',
              }}
            >
              <span className="block select-none" style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.5px',
                textRendering: 'optimizeLegibility',
              }}>
                {option}
              </span>
            </button>
          ))}
        </div>

        {showResult && (
          <div className="rounded-xl p-4 border-2" style={{
            background: isCorrect ? '#f0fdf4' : '#fef2f2',
            borderColor: isCorrect ? '#86efac' : '#fca5a5',
          }}>
            {isCorrect ? (
              <div className="text-center">
                <p className="text-2xl font-black text-green-600 mb-1">¡CORRECTO! 🎉</p>
                <p className="text-gray-700 mb-1 text-sm">{currentWord.hint}</p>
                <p className="font-bold text-lg mt-2" style={{ color: city.accentColor }}>
                  ✨ {buildings[buildings.length - 1]?.emoji} {buildings[buildings.length - 1]?.type} construido ✨
                </p>
                <p className="text-yellow-600 font-bold mt-1">
                  +{20 + (streak * 5)} 🪙 monedas ganadas!
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-2xl font-black text-red-600 mb-1">¡OH NO! 💥</p>
                <p className="text-gray-700 mb-1">La respuesta correcta era: <strong className="text-green-600">{currentWord.correct}</strong></p>
                <p className="text-gray-500 text-sm">{currentWord.hint}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="relative z-20 flex items-center justify-center gap-3 md:gap-6 text-sm md:text-base flex-wrap">
        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10">
          <Zap className="w-4 h-4 text-yellow-300" />
          <span>Racha: {streak}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10">
          <Star className="w-4 h-4 text-yellow-300" />
          <span>Puntos: {score}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10">
          <Building2 className="w-4 h-4 text-blue-300" />
          <span>Edificios: {buildings.length}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10">
          <Coins className="w-4 h-4 text-yellow-300" />
          <span>Monedas: {coinsEarned}</span>
        </div>
      </div>
    </div>
  );
}
