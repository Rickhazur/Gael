import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Map, BookOpen, Clock, Store, Mic } from "lucide-react";

export type GameType = 'flashrace' | 'grammarquest' | 'storybuilder' | 'puzzletimeline' | 'pronounceplay' | 'vocabulary' | 'grammar' | 'arvocab' | 'dailynews';

interface Game {
  id: GameType;
  name: string;
  description: string;
  emoji: string;
  color: string;
  difficulty: string;
  nameEs: string;
  descriptionEs: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'All';
}

const games: Game[] = [
  {
    id: 'flashrace',
    name: 'FlashRace',
    description: 'Speed and vocabulary! Choose the correct translation as fast as you can.',
    emoji: '🏎️',
    color: 'bg-gradient-to-br from-amber-400 to-orange-500',
    difficulty: 'Easy',
    nameEs: 'Carrera de Palabras',
    descriptionEs: '¡Rapidez y vocabulario! Elige la traducción correcta lo más rápido que puedas.',
    level: 'A1'
  },
  {
    id: 'arvocab',
    name: 'AR Vocabulary',
    description: 'Learn words using Augmented Reality! Explore and discover.',
    emoji: '🕶️',
    color: 'bg-gradient-to-br from-cyan-400 to-blue-500',
    difficulty: 'Easy',
    nameEs: 'Vocabulario AR',
    descriptionEs: '¡Aprende palabras usando Realidad Aumentada! Explora y descubre.',
    level: 'A1'
  },
  {
    id: 'grammarquest',
    name: 'Grammar Quest',
    description: 'A level-based adventure fixing grammar and earning stars.',
    emoji: '🗺️',
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    difficulty: 'Medium',
    nameEs: 'Misión Gramatical',
    descriptionEs: 'Una aventura por niveles corrigiendo gramática y ganando estrellas.',
    level: 'A2'
  },
  {
    id: 'storybuilder',
    name: 'Story Builder',
    description: 'Build stories by dragging and ordering pieces. Be creative!',
    emoji: '📖',
    color: 'bg-gradient-to-br from-emerald-400 to-teal-600',
    difficulty: 'Medium',
    nameEs: 'Creador de Historias',
    descriptionEs: 'Construye historias arrastrando y ordenando piezas. ¡Sé creativo!',
    level: 'B1'
  },
  {
    id: 'dailynews',
    name: 'Daily News',
    description: 'Read the latest news in English and practice comprehension.',
    emoji: '📰',
    color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    difficulty: 'Challenge',
    nameEs: 'Noticias Diarias',
    descriptionEs: 'Lee las últimas noticias en inglés y practica la comprensión.',
    level: 'B1'
  },
  {
    id: 'puzzletimeline',
    name: 'Puzzle Timeline',
    description: 'Read a text and order the events. Fun reading comprehension!',
    emoji: '🧩',
    color: 'bg-gradient-to-br from-rose-400 to-pink-600',
    difficulty: 'Medium',
    nameEs: 'Línea de Tiempo',
    descriptionEs: 'Lee un texto y ordena los eventos. ¡Divertida comprensión lectora!',
    level: 'B2'
  },
  {
    id: 'pronounceplay',
    name: 'PronouncePlay',
    description: 'Practice pronunciation! Earn coins based on how well you speak.',
    emoji: '🎤',
    color: 'bg-gradient-to-br from-pink-500 to-rose-600',
    difficulty: 'All Levels',
    nameEs: 'Pronuncia y Gana',
    descriptionEs: '¡Practica la pronunciación! Gana monedas según qué tan bien hables.',
    level: 'All'
  },
];

interface GamesHubProps {
  onSelectGame: (gameId: GameType) => void;
  onClose: () => void;
  onOpenStore: () => void;
  balance: number;
  immersionMode?: 'bilingual' | 'standard';
}

const GamesHub_mod = ({ onSelectGame, onClose, onOpenStore, balance, immersionMode = 'bilingual' }: GamesHubProps) => {
  const levels = ['A1', 'A2', 'B1', 'B2', 'All'] as const;

  return (
    <motion.div
      className="p-6 bg-card rounded-3xl shadow-medium max-h-[80vh] overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {immersionMode === 'standard' ? 'Cerrar' : 'Back'}
        </Button>
        <Button variant="playful" size="sm" onClick={onOpenStore}>
          <Store className="w-4 h-4 mr-2" />
          {immersionMode === 'standard' ? 'Tienda' : 'Store'} ({balance})
        </Button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {immersionMode === 'standard' ? '🎮 Centro de Juegos' : '🎮 Games Center'}
        </h2>
        <p className="text-muted-foreground">
          {immersionMode === 'standard'
            ? '¡Elige un juego y gana monedas mientras aprendes inglés!'
            : 'Pick a game and earn coins while learning English!'}
        </p>
      </div>

      {/* Levels grouping */}
      <div className="space-y-8">
        {levels.map((level) => {
          const levelGames = games.filter(g => g.level === level);
          if (levelGames.length === 0) return null;

          const levelLabel = immersionMode === 'standard'
            ? (level === 'A1' ? 'A1: Inicial' : level === 'A2' ? 'A2: Elemental' : level === 'B1' ? 'B1: Intermedio' : level === 'B2' ? 'B2: Intermedio Alto' : 'Todos los Niveles')
            : `Level ${level}`;

          return (
            <div key={level} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-widest uppercase border border-primary/20">
                  {levelLabel}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {levelGames.map((game, index) => (
                  <motion.button
                    key={game.id}
                    onClick={() => onSelectGame(game.id)}
                    className={`p-5 rounded-2xl text-left transition-all hover:scale-[1.02] ${game.color}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-4xl">{game.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-primary-foreground mb-1">
                          {immersionMode === 'standard' ? game.nameEs : game.name}
                        </h3>
                        <p className="text-sm text-primary-foreground/80 mb-2">
                          {immersionMode === 'standard' ? game.descriptionEs : game.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-background/20 rounded-full text-xs font-medium text-primary-foreground">
                            {immersionMode === 'standard'
                              ? (game.difficulty === 'Easy' ? 'Fácil' : game.difficulty === 'Medium' ? 'Medio' : 'Todos los Niveles')
                              : game.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick play tips */}
      <div className="mt-6 p-4 bg-muted/50 rounded-xl">
        <p className="text-sm text-muted-foreground text-center">
          💡 <strong>{immersionMode === 'standard' ? 'Tip:' : 'Tip:'}</strong> {immersionMode === 'standard'
            ? '¡Juega cada día para mantener tu racha y ganar monedas extra!'
            : 'Play every day to keep your streak and earn bonus coins'}
        </p>
      </div>
    </motion.div>
  );
};

export default GamesHub_mod;
