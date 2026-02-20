
import { useEffect, useCallback, useMemo } from 'react';
import { useGameLogic } from './useGameLogic';
import GameCanvas from './GameCanvas';
import GameUI from './GameUI';
import GameOverlay from './GameOverlay';

const MathPhoenix = () => {
    // Fixed game dimensions
    const dimensions = useMemo(() => ({
        width: 600,
        height: 450, // Reduced height
        playerY: 380, // Adjusted player position
        phoenixY: 60,
    }), []);

    const {
        gameState,
        eggs,
        phoenix,
        player,
        movePlayer,
        setPlayerPosition,
        startGame,
    } = useGameLogic(dimensions);

    // Keyboard controls
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!gameState.isPlaying) return;

        if (e.key === 'ArrowLeft' || e.key === 'a') {
            movePlayer('left');
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            movePlayer('right');
        }
    }, [gameState.isPlaying, movePlayer]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className="math-phoenix-wrapper h-full bg-background flex flex-col items-center p-2 gap-2 w-full overflow-hidden rounded-xl border-4 border-slate-700">
            {/* Header Compact */}
            <div className="text-center shrink-0">
                <h1 className="arcade-text text-xl md:text-2xl glow-text-gold m-0 leading-none">
                    MATH PHOENIX
                </h1>
            </div>

            {/* Game UI - Stats and Question */}
            <div className="shrink-0 w-full max-w-2xl z-10">
                <GameUI gameState={gameState} />
            </div>

            {/* Game Canvas Container - Flexible */}
            <div className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                <div className="relative h-full w-full max-w-[600px] flex items-center justify-center">
                    <GameCanvas
                        eggs={eggs}
                        phoenix={phoenix}
                        player={player}
                        dimensions={dimensions}
                        onPlayerMove={setPlayerPosition}
                        className="w-full h-full object-contain max-h-full rounded-lg neon-border touch-none"
                    />
                    <GameOverlay gameState={gameState} onStart={startGame} />
                </div>
            </div>

            {/* Controls hint */}
            {/* Footer */}
            <footer className="text-center text-xs text-muted-foreground/60">
                <p>Math Phoenix © 2026 - Aprendizaje Gamificado</p>
            </footer>
        </div>
    );
};

export default MathPhoenix;
