import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sword, Shield, Zap, Star, Trophy, ArrowLeft, Heart, Sparkles, Skull } from "lucide-react";
import { useRewards } from "@/hooks/useRewards_mod";
import { getSpanishAdventureWorlds, type SpanishAdventureLevel, type SpanishChallenge } from "@/data/spanishAdventureGames";
import confetti from 'canvas-confetti';
import { sfx } from '@/services/soundEffects';

interface SpanishAdventureQuestProps {
  grade: 1 | 2 | 3 | 4 | 5;
  onComplete: (score: number, coins: number) => void;
  onClose: () => void;
}

export default function SpanishAdventureQuest({ grade, onComplete, onClose }: SpanishAdventureQuestProps) {
  const { addCoins } = useRewards();
  const worlds = getSpanishAdventureWorlds(grade);
  const [currentWorldIndex, setCurrentWorldIndex] = useState(0);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [gameState, setGameState] = useState<'world-select' | 'battle' | 'boss' | 'victory'>('world-select');
  const [playerHealth, setPlayerHealth] = useState(100);
  const [bossHealth, setBossHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [powerUps, setPowerUps] = useState<string[]>([]);
  const [defeatedEnemies, setDefeatedEnemies] = useState<string[]>([]);

  const currentWorld = worlds[currentWorldIndex];
  const currentChallenge = currentWorld?.challenges[currentChallengeIndex];

  const startWorld = (worldIndex: number) => {
    setCurrentWorldIndex(worldIndex);
    setCurrentChallengeIndex(0);
    setPlayerHealth(100);
    setBossHealth(100);
    setScore(0);
    setCoins(0);
    setStreak(0);
    setPowerUps([]);
    setDefeatedEnemies([]);
    setGameState('battle');
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    const correct = answer === currentChallenge.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      // Player attacks boss
      const damage = 20 + (streak * 5);
      setBossHealth(prev => Math.max(0, prev - damage));
      setStreak(prev => prev + 1);
      setScore(prev => prev + 10);
      
      // Add power-up
      if (currentChallenge.powerUp) {
        setPowerUps(prev => [...prev, currentChallenge.powerUp!]);
      }

      // Victory animation
      sfx.playSuccess();
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#8B5CF6']
      });
    } else {
      // Boss attacks player
      const damage = 15;
      setPlayerHealth(prev => Math.max(0, prev - damage));
      setStreak(0);
      
      // Add enemy
      if (currentChallenge.enemy) {
        setDefeatedEnemies(prev => [...prev, currentChallenge.enemy!]);
      }
    }

    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);

      if (correct) {
        if (currentChallengeIndex + 1 < currentWorld.challenges.length) {
          setCurrentChallengeIndex(prev => prev + 1);
        } else {
          // All challenges done, fight boss
          setGameState('boss');
        }
      }
    }, 2000);
  };

  const attackBoss = () => {
    const damage = 25 + (streak * 3);
    setBossHealth(prev => {
      const newHealth = Math.max(0, prev - damage);
      if (newHealth === 0) {
        // Boss defeated!
        setTimeout(() => {
          const finalCoins = currentWorld.reward.coins + (streak * 5);
          const finalScore = score + currentWorld.reward.xp;
          setCoins(finalCoins);
          addCoins(finalCoins);
          onComplete(finalScore, finalCoins);
          setGameState('victory');
          
          // Epic celebration
          confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
          });
        }, 1000);
      }
      return newHealth;
    });
  };

  if (gameState === 'world-select') {
    return (
      <div className="p-6 bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 text-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black mb-4">⚔️ Aventuras Épicas del Español ⚔️</h1>
            <p className="text-xl text-purple-200">Elige tu aventura y conviértete en un héroe de la gramática</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {worlds.map((world, index) => (
              <motion.button
                key={world.id}
                onClick={() => startWorld(index)}
                className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-800/80 to-pink-800/80 border-4 border-purple-400 text-left hover:scale-105 transition-all shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-6xl">{world.worldEmoji}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-black mb-2">{world.worldName}</h2>
                    <p className="text-purple-200 mb-4">{world.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span>{world.reward.coins} monedas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{world.reward.xp} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-purple-300" />
                        <span>{world.reward.badge}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-purple-600">
                      <p className="text-xs text-purple-300">
                        Jefe Final: <span className="font-bold">{world.bossEmoji} {world.bossName}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <Button onClick={onClose} variant="outline" className="mt-8 mx-auto block">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'battle' && currentChallenge) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Health Bars */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-bold">Tu Vida</span>
              </div>
              <div className="flex-1 mx-4 bg-slate-800 rounded-full h-6 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-pink-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${playerHealth}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="font-bold">{playerHealth}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skull className="w-5 h-5 text-purple-400" />
                <span className="font-bold">{currentWorld.bossName}</span>
              </div>
              <div className="flex-1 mx-4 bg-slate-800 rounded-full h-6 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${bossHealth}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="font-bold">{bossHealth}%</span>
            </div>
          </div>

          {/* Challenge Card */}
          <motion.div
            className="bg-gradient-to-br from-purple-800/90 to-pink-800/90 rounded-2xl p-8 shadow-2xl border-4 border-purple-400 mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black mb-2">{currentWorld.worldName}</h2>
              <p className="text-purple-200">Desafío {currentChallengeIndex + 1} de {currentWorld.challenges.length}</p>
            </div>

            <div className="bg-white/10 rounded-xl p-6 mb-6">
              <p className="text-xl font-bold mb-4 text-center">{currentChallenge.question}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentChallenge.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={showResult}
                    className={`p-4 rounded-xl font-bold text-lg transition-all ${
                      showResult
                        ? option === currentChallenge.correctAnswer
                          ? 'bg-green-500 border-4 border-green-300'
                          : selectedAnswer === option
                          ? 'bg-red-500 border-4 border-red-300'
                          : 'bg-slate-700 opacity-50'
                        : 'bg-purple-700 hover:bg-purple-600 border-4 border-purple-500 hover:border-purple-400'
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
                  className="mt-6 p-4 rounded-xl bg-white/20"
                >
                  {isCorrect ? (
                    <div className="text-center">
                      <p className="text-2xl font-black text-green-400 mb-2">¡CORRECTO! ⚔️</p>
                      <p className="text-purple-200">{currentChallenge.explanation}</p>
                      {currentChallenge.powerUp && (
                        <p className="text-yellow-400 font-bold mt-2">
                          ✨ Obtuviste: {currentChallenge.powerUp}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-2xl font-black text-red-400 mb-2">¡OH NO! 💥</p>
                      <p className="text-purple-200">La respuesta correcta era: <strong>{currentChallenge.correctAnswer}</strong></p>
                      <p className="text-purple-300 mt-2">{currentChallenge.explanation}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Racha: {streak}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>Puntos: {score}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>Monedas: {coins}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (gameState === 'boss') {
    return (
      <div className="p-6 bg-gradient-to-br from-red-900 via-purple-900 to-red-900 text-white min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-8"
          >
            <div className="text-8xl mb-4">{currentWorld.bossEmoji}</div>
            <h1 className="text-5xl font-black mb-4">¡BATALLA FINAL!</h1>
            <p className="text-2xl text-purple-200">{currentWorld.bossName} ha aparecido</p>
          </motion.div>

          <div className="bg-gradient-to-br from-purple-800/90 to-red-800/90 rounded-2xl p-8 shadow-2xl border-4 border-red-400 mb-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">Tu Vida</span>
                <span className="font-bold">{playerHealth}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-8 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-pink-500"
                  animate={{ width: `${playerHealth}%` }}
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{currentWorld.bossName}</span>
                <span className="font-bold">{bossHealth}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-8 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  animate={{ width: `${bossHealth}%` }}
                />
              </div>
            </div>

            <Button
              onClick={attackBoss}
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-black text-xl px-8 py-6 rounded-xl shadow-2xl"
            >
              <Sword className="w-6 h-6 mr-2" />
              ¡ATACAR CON GRAMÁTICA!
            </Button>

            <p className="mt-4 text-purple-200">
              Usa tu conocimiento de español para derrotar al jefe
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'victory') {
    return (
      <div className="p-6 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 text-white min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-center max-w-2xl"
        >
          <div className="text-9xl mb-6">🏆</div>
          <h1 className="text-6xl font-black mb-4">¡VICTORIA ÉPICA!</h1>
          <p className="text-3xl mb-8">Has derrotado a {currentWorld.bossName}</p>
          
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 mb-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-4xl font-black">{score}</div>
                <div className="text-sm">Puntos</div>
              </div>
              <div>
                <div className="text-4xl font-black">{coins}</div>
                <div className="text-sm">Monedas</div>
              </div>
              <div>
                <div className="text-4xl font-black">{streak}</div>
                <div className="text-sm">Racha</div>
              </div>
            </div>
            
            {currentWorld.reward.badge && (
              <div className="bg-yellow-400/30 rounded-xl p-4 mb-4">
                <p className="text-xl font-black">✨ Insignia Desbloqueada ✨</p>
                <p className="text-2xl">{currentWorld.reward.badge}</p>
              </div>
            )}
          </div>

          <Button
            onClick={onClose}
            size="lg"
            className="bg-white text-purple-900 font-black text-xl px-8 py-6 rounded-xl shadow-2xl"
          >
            Continuar Aventura
          </Button>
        </motion.div>
      </div>
    );
  }

  return null;
}
