import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Map, BookOpen, Clock, Store, Mic, Sword, Shield } from "lucide-react";

export type SpanishGameType = 'flashrace' | 'grammarquest' | 'storybuilder' | 'puzzletimeline' | 'pronounceplay' | 'spanish-adventure' | 'spanish-spelling-battle' | 'spanish-city-builder';

interface SpanishGame {
  id: SpanishGameType;
  name: string;
  description: string;
  emoji: string;
  color: string;
  difficulty: string;
  isEpic?: boolean; // Mark epic games
}

const spanishGames: SpanishGame[] = [
  {
    id: 'spanish-adventure',
    name: 'Aventuras Épicas del Español',
    description: '⚔️ Conviértete en un héroe de la gramática. Derrota jefes y salva el reino de las palabras.',
    emoji: '⚔️',
    color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600',
    difficulty: 'Épico',
    isEpic: true,
  },
  {
    id: 'spanish-spelling-battle',
    name: 'Batalla de Ortografía',
    description: '💥 Combate monstruos de ortografía. Cada palabra correcta es un ataque poderoso.',
    emoji: '💥',
    color: 'bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600',
    difficulty: 'Épico',
    isEpic: true,
  },
  {
    id: 'spanish-city-builder',
    name: 'Constructor de Ciudad Mágica',
    description: '🏗️ Construye una ciudad increíble. Cada palabra correcta construye un edificio nuevo con tecnología Nano Banana Pro.',
    emoji: '🏗️',
    color: 'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700',
    difficulty: 'Épico',
    isEpic: true,
  },
  {
    id: 'flashrace',
    name: 'Carrera de Vocabulario',
    description: '🏎️ Velocidad y vocabulario. Elige la palabra correcta lo más rápido que puedas.',
    emoji: '🏎️',
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    difficulty: 'Fácil',
  },
  {
    id: 'grammarquest',
    name: 'Misión Gramatical',
    description: '🗺️ Aventura por niveles corrigiendo gramática y ganando estrellas.',
    emoji: '🗺️',
    color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    difficulty: 'Medio',
  },
  {
    id: 'storybuilder',
    name: 'Creador de Historias',
    description: '📖 Construye historias arrastrando y ordenando piezas. ¡Sé creativo!',
    emoji: '📖',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    difficulty: 'Medio',
  },
  {
    id: 'puzzletimeline',
    name: 'Línea de Tiempo',
    description: '🧩 Lee un texto y ordena los eventos. ¡Divertida comprensión lectora!',
    emoji: '🧩',
    color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    difficulty: 'Medio',
  },
  {
    id: 'pronounceplay',
    name: 'Pronuncia y Gana',
    description: '🎤 Practica la pronunciación. Gana monedas según qué tan bien hables.',
    emoji: '🎤',
    color: 'bg-gradient-to-br from-pink-500 to-rose-600',
    difficulty: 'Todos los Niveles',
  },
];

interface SpanishGamesHubProps {
  onSelectGame: (gameId: SpanishGameType) => void;
  onClose: () => void;
  onOpenStore: () => void;
  balance: number;
}

const SpanishGamesHub = ({ onSelectGame, onClose, onOpenStore, balance }: SpanishGamesHubProps) => {
  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-purple-900/90 via-pink-900/90 to-indigo-900/90 rounded-3xl shadow-2xl border-4 border-purple-400"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cerrar
        </Button>
        <Button variant="playful" size="sm" onClick={onOpenStore} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
          <Store className="w-4 h-4 mr-2" />
          Tienda ({balance})
        </Button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
          ⚔️ Centro de Juegos Épicos ⚔️
        </h2>
        <p className="text-purple-200 text-lg">
          ¡Conviértete en un héroe del español! Gramática y ortografía nunca fueron tan divertidas.
        </p>
      </div>

      {/* Epic Games Section */}
      <div className="mb-6">
        <h3 className="text-2xl font-black text-yellow-400 mb-4 flex items-center gap-2">
          <Sword className="w-6 h-6" />
          Aventuras Épicas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {spanishGames.filter(g => g.isEpic).map((game, index) => (
            <motion.button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`p-6 rounded-2xl text-left transition-all hover:scale-[1.03] ${game.color} border-4 border-yellow-400 shadow-2xl relative overflow-hidden`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-black">
                ÉPICO
              </div>
              <div className="flex items-start gap-4">
                <span className="text-5xl">{game.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-black text-xl text-white mb-2 drop-shadow-lg">
                    {game.name}
                  </h3>
                  <p className="text-sm text-white/90 mb-3">
                    {game.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white/30 rounded-full text-xs font-bold text-white">
                      {game.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Regular Games Section */}
      <div>
        <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Juegos Clásicos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {spanishGames.filter(g => !g.isEpic).map((game, index) => (
            <motion.button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`p-5 rounded-2xl text-left transition-all hover:scale-[1.02] ${game.color} border-2 border-white/20 shadow-lg`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (spanishGames.filter(g => g.isEpic).length + index) * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-4xl">{game.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white mb-1">
                    {game.name}
                  </h3>
                  <p className="text-sm text-white/80 mb-2">
                    {game.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium text-white">
                      {game.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Motivation Tip */}
      <div className="mt-8 p-5 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-xl border-2 border-yellow-400/50">
        <p className="text-center text-white font-bold text-lg">
          💡 <span className="text-yellow-300">Tip:</span> ¡Juega las aventuras épicas cada día para mantener tu racha y ganar monedas extra! Conviértete en el héroe definitivo del español.
        </p>
      </div>
    </motion.div>
  );
};

export default SpanishGamesHub;
