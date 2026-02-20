
import { memo } from 'react';
import { GameState } from './types/game';
import { Heart, Star, Zap, Trophy } from 'lucide-react';

interface GameUIProps {
    gameState: GameState;
}

const GameUI = memo(({ gameState }: GameUIProps) => {
    const { level, score, correctAnswers, currentMultiplier, currentNumber, lives } = gameState;
    const progressPercentage = (correctAnswers / 5) * 100;

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">
            {/* Top stats bar */}
            <div className="flex justify-between items-center gap-4 flex-wrap">
                {/* Level indicator */}
                <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-4 py-2 neon-border">
                    <Trophy className="w-5 h-5 text-accent" />
                    <span className="arcade-text text-xs text-accent">NIVEL {level}</span>
                </div>

                {/* Score */}
                <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-4 py-2 neon-border-magenta">
                    <Star className="w-5 h-5 text-secondary" />
                    <span className="arcade-text text-xs text-secondary">{score.toLocaleString()}</span>
                </div>

                {/* Lives */}
                <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-4 py-2 neon-border">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Heart
                            key={i}
                            className={`w-5 h-5 ${i < lives ? 'text-destructive fill-destructive' : 'text-muted-foreground'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Math question - prominently displayed */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-xl rounded-2xl" />
                <div className="relative bg-card/90 backdrop-blur-sm rounded-2xl p-6 neon-border-gold text-center">
                    <p className="text-muted-foreground text-sm mb-2">Tabla del {currentMultiplier}</p>
                    <div className="arcade-text text-3xl md:text-4xl glow-text-gold">
                        {currentMultiplier} × {currentNumber} = ?
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="bg-card/80 backdrop-blur-sm rounded-lg p-3 neon-border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Zap className="w-4 h-4 text-primary" />
                        Progreso
                    </span>
                    <span className="arcade-text text-xs text-primary">
                        {correctAnswers}/5
                    </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
});

GameUI.displayName = 'GameUI';

export default GameUI;
