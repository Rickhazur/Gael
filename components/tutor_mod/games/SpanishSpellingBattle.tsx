import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Sword, Heart, Skull, ArrowLeft, Sparkles } from "lucide-react";
import { useRewards } from "@/hooks/useRewards_mod";
import confetti from 'canvas-confetti';
import { sfx } from '@/services/soundEffects';
import { getRandomSpellingWords } from '@/data/spanishSpellingWords';

interface SpanishSpellingBattleProps {
  grade: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  onComplete: (score: number, coins: number) => void;
  onClose: () => void;
}

export default function SpanishSpellingBattle({ grade, onComplete, onClose }: SpanishSpellingBattleProps) {
  const { addCoins } = useRewards();

  // Seleccionar palabras aleatorias cada vez que se inicia el juego (6-8 palabras)
  const words = useMemo(() => getRandomSpellingWords(grade, 6 + Math.floor(Math.random() * 3)), [grade]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [powerUps, setPowerUps] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentWord = words[currentWordIndex];
  // Filtrar duplicados y asegurar que las opciones incorrectas sean únicas y diferentes de la correcta
  const uniqueIncorrect = [...new Set(currentWord.incorrect.filter(opt => opt !== currentWord.correct))];
  // Si no hay suficientes opciones incorrectas únicas, agregar variaciones comunes
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
    if (timeLeft > 0 && !showResult) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      // Time's up - wrong answer
      handleAnswer('timeout');
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, showResult]);

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    const correct = answer === currentWord.correct;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const damage = 25 + (streak * 5);
      setEnemyHealth(prev => Math.max(0, prev - damage));
      setStreak(prev => prev + 1);
      setScore(prev => prev + 15);
      if (currentWord.powerUp) {
        setPowerUps(prev => [...prev, currentWord.powerUp!]);
      }
      sfx.playSuccess();
      confetti({ particleCount: 20, spread: 50, origin: { y: 0.6 } });
    } else {
      const damage = 20;
      setPlayerHealth(prev => Math.max(0, prev - damage));
      setStreak(0);
    }

    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);
      setTimeLeft(30);

      if (correct) {
        if (currentWordIndex + 1 < words.length) {
          setCurrentWordIndex(prev => prev + 1);
        } else {
          // Victory!
          const finalCoins = 100 + (streak * 10);
          const finalScore = score + 50;
          setCoins(finalCoins);
          addCoins(finalCoins, 'spanish-spelling-battle');
          onComplete(finalScore, finalCoins);

          confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4']
          });
        }
      } else if (playerHealth <= 0) {
        // Game Over
        onComplete(score, coins);
      }
    }, 2000);
  };

  if (playerHealth <= 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-red-900 to-slate-900 text-white min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-center"
        >
          <div className="text-8xl mb-6">💀</div>
          <h1 className="text-5xl font-black mb-4">¡Derrotado!</h1>
          <p className="text-2xl mb-8">Pero ganaste {coins} monedas</p>
          <Button onClick={onClose} size="lg">Intentar de Nuevo</Button>
        </motion.div>
      </div>
    );
  }

  if (currentWordIndex >= words.length) {
    return (
      <div className="p-6 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 text-white min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="text-9xl mb-6">🏆</div>
          <h1 className="text-6xl font-black mb-4">¡VICTORIA!</h1>
          <p className="text-3xl mb-8">Has vencido a todos los monstruos de ortografía</p>
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 mb-6">
            <div className="text-4xl font-black mb-2">{coins} monedas</div>
            <div className="text-2xl font-bold">{score} puntos</div>
          </div>
          <Button onClick={onClose} size="lg">Continuar</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onClose} variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Salir
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-black">⚔️ Batalla de Ortografía ⚔️</h1>
            <p className="text-purple-200">Palabra {currentWordIndex + 1} de {words.length}</p>
          </div>
          <div className="w-24" />
        </div>

        {/* Health Bars */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-bold">Tu Vida</span>
              </div>
              <span className="font-bold">{playerHealth}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-pink-500"
                animate={{ width: `${playerHealth}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Skull className="w-5 h-5 text-purple-400" />
                <span className="font-bold">Monstruo</span>
              </div>
              <span className="font-bold">{enemyHealth}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                animate={{ width: `${enemyHealth}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          <div className={`text-4xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
            ⏱️ {timeLeft}s
          </div>
        </div>

        {/* Challenge Card */}
        <motion.div
          className="bg-gradient-to-br from-purple-800/90 to-pink-800/90 rounded-2xl p-8 shadow-2xl border-4 border-purple-400 mb-6"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">👹</div>
            <p className="text-2xl font-bold mb-2">¿Cómo se escribe correctamente?</p>
            <div className="bg-white/20 rounded-xl p-6 mb-6">
              <p className="text-5xl font-black text-yellow-400">{currentWord.word}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {options.map((option, idx) => (
              <motion.button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
                className={`p-6 rounded-xl font-bold text-xl transition-all ${showResult
                  ? option === currentWord.correct
                    ? 'bg-green-500 border-4 border-green-300 scale-105'
                    : selectedAnswer === option
                      ? 'bg-red-500 border-4 border-red-300'
                      : 'bg-slate-700 opacity-50'
                  : 'bg-purple-700 hover:bg-purple-600 border-4 border-purple-500 hover:border-purple-400 hover:scale-105'
                  }`}
                whileHover={!showResult ? { scale: 1.05 } : {}}
                whileTap={!showResult ? { scale: 0.95 } : {}}
              >
                {option}
              </motion.button>
            ))}
          </div>

          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/20 rounded-xl p-6"
            >
              {isCorrect ? (
                <div className="text-center">
                  <p className="text-3xl font-black text-green-400 mb-2">¡CORRECTO! ⚔️</p>
                  <p className="text-purple-200 mb-2">{currentWord.hint}</p>
                  {currentWord.powerUp && (
                    <p className="text-yellow-400 font-bold">
                      ✨ {currentWord.powerUp} obtenido
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-3xl font-black text-red-400 mb-2">¡ERROR! 💥</p>
                  <p className="text-purple-200 mb-2">La respuesta correcta es: <strong className="text-green-400">{currentWord.correct}</strong></p>
                  <p className="text-purple-300">{currentWord.hint}</p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 text-lg">
          <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span>Racha: {streak}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>Puntos: {score}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl">
            <Shield className="w-5 h-5 text-blue-400" />
            <span>Poderes: {powerUps.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
