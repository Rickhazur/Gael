
import { memo } from 'react';
import { GameState } from './types/game';
import { Button } from '../../../ui/button';
import { Rocket, Trophy, RefreshCcw, CheckCircle, XCircle, Frown } from 'lucide-react';

interface GameOverlayProps {
    gameState: GameState;
    onStart: () => void;
}

const GameOverlay = memo(({ gameState, onStart }: GameOverlayProps) => {
    const { isPlaying, isGameOver, isVictory, showFeedback, feedbackType, score } = gameState;

    // Feedback flash overlay
    if (showFeedback && feedbackType) {
        return (
            <div className={`absolute inset-0 flex items-center justify-center z-20 pointer-events-none
        ${feedbackType === 'correct' ? 'bg-success/20' : 'bg-destructive/20'} 
        animate-pulse backdrop-blur-sm rounded-lg`}>
                <div className="flex flex-col items-center gap-4">
                    {feedbackType === 'correct' ? (
                        <>
                            <CheckCircle className="w-24 h-24 text-success animate-bounce" />
                            <p className="arcade-text text-2xl text-success glow-text-cyan">¡CORRECTO!</p>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-24 h-24 text-destructive animate-bounce" />
                            <p className="arcade-text text-2xl text-destructive">¡INCORRECTO!</p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Start screen
    if (!isPlaying && !isGameOver && !isVictory) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-md z-10 rounded-lg overflow-y-auto custom-scrollbar">
                <div className="text-center space-y-4 p-4 w-full h-full flex flex-col justify-center">
                    <div className="space-y-2">
                        <h1 className="arcade-text text-2xl md:text-4xl glow-text-gold animate-pulse-glow leading-tight">
                            MATH PHOENIX
                        </h1>
                        <div className="flex justify-center gap-2 text-2xl">
                            <span>🔥</span>
                            <span>🦅</span>
                            <span>🔥</span>
                        </div>
                        <p className="text-muted-foreground text-sm max-w-md mx-auto">
                            ¡Atrapa los huevos correctos!
                        </p>
                    </div>

                    <div className="bg-card/50 rounded-xl p-4 max-w-sm mx-auto neon-border">
                        <h3 className="arcade-text text-xs text-primary mb-2">CÓMO JUGAR:</h3>
                        <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-muted-foreground text-left">
                            <li className="flex items-center gap-1">
                                <span className="text-accent">→</span>
                                Mover: Flechas
                            </li>
                            <li className="flex items-center gap-1">
                                <span className="text-accent">→</span>
                                Atrapa: Respuesta
                            </li>
                            <li className="flex items-center gap-1 col-span-2">
                                <span className="text-accent">→</span>
                                5 aciertos = Nivel Up!
                            </li>
                        </ul>
                    </div>

                    <div className="pt-2">
                        <Button
                            size="lg"
                            onClick={onStart}
                            className="arcade-text text-sm md:text-base px-8 py-4 bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 transition-all hover:scale-105 text-primary-foreground shadow-lg w-auto mx-auto"
                        >
                            <Rocket className="w-5 h-5 mr-2" />
                            ¡INICIAR!
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Victory screen
    if (isVictory) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-md z-10 rounded-lg">
                <div className="text-center space-y-8 p-8">
                    <div className="space-y-4">
                        <Trophy className="w-24 h-24 mx-auto text-accent animate-bounce" />
                        <h1 className="arcade-text text-3xl md:text-4xl glow-text-gold">
                            ¡VICTORIA!
                        </h1>
                        <p className="text-xl text-foreground">
                            ¡Has dominado todas las tablas de multiplicar!
                        </p>
                        <div className="arcade-text text-2xl text-secondary glow-text-magenta">
                            PUNTUACIÓN: {score.toLocaleString()}
                        </div>
                    </div>

                    <div className="flex justify-center gap-2">
                        {['🌟', '🏆', '🎉', '🦅', '🎉', '🏆', '🌟'].map((emoji, i) => (
                            <span key={i} className="text-3xl animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>
                                {emoji}
                            </span>
                        ))}
                    </div>

                    <Button
                        size="lg"
                        onClick={onStart}
                        className="arcade-text px-8 py-6 bg-gradient-to-r from-accent to-secondary hover:opacity-90 transition-all hover:scale-105 text-primary-foreground"
                    >
                        <RefreshCcw className="w-5 h-5 mr-2" />
                        JUGAR DE NUEVO
                    </Button>
                </div>
            </div>
        );
    }

    // Game over screen
    if (isGameOver) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-md z-10 rounded-lg">
                <div className="text-center space-y-8 p-8">
                    <div className="space-y-4">
                        <div className="text-8xl animate-bounce">😢</div>
                        <h1 className="arcade-text text-3xl md:text-4xl text-accent">
                            ¡INTENTÉMOSLO DE NUEVO!
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            ¡Tú puedes! ¡Ánimo campeón!
                        </p>
                        <div className="arcade-text text-2xl text-secondary glow-text-magenta">
                            PUNTUACIÓN: {score.toLocaleString()}
                        </div>
                    </div>

                    <Button
                        size="lg"
                        onClick={onStart}
                        className="arcade-text px-8 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-105 text-primary-foreground"
                    >
                        <RefreshCcw className="w-5 h-5 mr-2" />
                        INTENTAR DE NUEVO
                    </Button>
                </div>
            </div>
        );
    }

    return null;
});

GameOverlay.displayName = 'GameOverlay';

export default GameOverlay;
