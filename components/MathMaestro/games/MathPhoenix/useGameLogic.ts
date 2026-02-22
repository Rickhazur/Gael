
import { useState, useCallback, useRef, useEffect } from 'react';
import { Egg, Phoenix, Player, GameState, GameDimensions } from './types/game';
import { useGamification } from '@/context/GamificationContext';

const ANSWERS_TO_LEVEL_UP = 5;
const MAX_LEVEL = 10; // Table of 11 is level 10 (starts at table 2)
const INITIAL_LIVES = 3;

// Generate a random number for multiplication (1-10)
const getRandomMultiplier = () => Math.floor(Math.random() * 10) + 1;

// Generate plausible wrong answers
const generateWrongAnswers = (correctAnswer: number): number[] => {
    const wrongAnswers: number[] = [];
    const offsets = [-2, -1, 1, 2, 3, -3, 4, -4, 5, -5];

    while (wrongAnswers.length < 2) {
        // Obtenemos un offset aleatorio
        const offset = offsets[Math.floor(Math.random() * offsets.length)];
        const wrongAnswer = correctAnswer + offset;

        // Validamos que sea lógica (mayor que 0), diferente a la correcta y que NO se repita en nuestro array de respuestas falsas
        if (wrongAnswer > 0 && wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
            wrongAnswers.push(wrongAnswer);
        }
    }

    return wrongAnswers;
};

// Simple Synth Sound Effect
const playSound = (type: 'catch' | 'wrong' | 'levelup' | 'victory') => {
    try {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'catch') {
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'wrong') {
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.type = 'sawtooth';
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'levelup') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554, now + 0.1);
            osc.frequency.setValueAtTime(659, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    } catch (e) {
        // Audio failed
    }
};

// Shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const useGameLogic = (dimensions: GameDimensions) => {
    const { earnCoins, recordCorrectAnswer, recordIncorrectAnswer, addXP } = useGamification();
    const [gameState, setGameState] = useState<GameState>({
        level: 1,
        score: 0,
        correctAnswers: 0,
        currentMultiplier: 2, // Start with table of 2
        currentNumber: getRandomMultiplier(),
        correctAnswer: 0,
        lives: INITIAL_LIVES,
        isPlaying: false,
        isGameOver: false,
        isVictory: false,
        showFeedback: false,
        feedbackType: null,
    });

    const [eggs, setEggs] = useState<Egg[]>([]);
    const [phoenix, setPhoenix] = useState<Phoenix>({
        x: dimensions.width / 2,
        y: dimensions.phoenixY,
        direction: 1,
        speed: 2,
        wingPhase: 0,
    });
    const [player, setPlayer] = useState<Player>({
        x: dimensions.width / 2,
        width: 80,
    });

    const eggIdRef = useRef(0);
    const lastDropTime = useRef(0);
    const gameLoopRef = useRef<number>();

    // Generate new question
    const generateNewQuestion = useCallback(() => {
        const multiplier = gameState.currentMultiplier;
        const number = getRandomMultiplier();
        const correctAnswer = multiplier * number;

        setGameState(prev => ({
            ...prev,
            currentNumber: number,
            correctAnswer: correctAnswer,
        }));

        return { number, correctAnswer };
    }, [gameState.currentMultiplier]);

    // Drop eggs with answers
    const dropEggs = useCallback(() => {
        const { correctAnswer } = generateNewQuestion();
        const wrongAnswers = generateWrongAnswers(correctAnswer);

        const allAnswers = shuffleArray([
            { value: correctAnswer, isCorrect: true },
            { value: wrongAnswers[0], isCorrect: false },
            { value: wrongAnswers[1], isCorrect: false },
        ]);

        const spacing = dimensions.width / 4;
        const newEggs: Egg[] = allAnswers.map((answer, index) => ({
            id: eggIdRef.current++,
            x: spacing * (index + 1),
            y: dimensions.phoenixY + 60,
            value: answer.value,
            isCorrect: answer.isCorrect,
            speed: 0.4 + gameState.level * 0.08, // Velocidad reducida para dar más tiempo al niño
            rotation: 0,
        }));

        setEggs(newEggs);
    }, [generateNewQuestion, dimensions, gameState.level]);

    // Handle catching egg
    const handleEggCatch = useCallback((egg: Egg) => {
        if (egg.isCorrect) {
            // Correct answer!
            playSound('catch');
            recordCorrectAnswer();
            addXP(5);

            setGameState(prev => {
                const newCorrectAnswers = prev.correctAnswers + 1;
                const levelUp = newCorrectAnswers >= ANSWERS_TO_LEVEL_UP;

                if (levelUp && prev.level >= MAX_LEVEL) {
                    // Victory!
                    playSound('victory');
                    earnCoins(500, "Victoria en Math Phoenix");
                    return {
                        ...prev,
                        score: prev.score + 100 * prev.level,
                        correctAnswers: 0,
                        isVictory: true,
                        isPlaying: false,
                        showFeedback: true,
                        feedbackType: 'correct',
                    };
                }

                if (levelUp) {
                    playSound('levelup');
                    earnCoins(50 * prev.level, `Subida de nivel en Math Phoenix Lvl ${prev.level + 1}`);
                }
                return {
                    ...prev,
                    score: prev.score + 100 * prev.level,
                    correctAnswers: levelUp ? 0 : newCorrectAnswers,
                    level: levelUp ? prev.level + 1 : prev.level,
                    currentMultiplier: levelUp ? prev.currentMultiplier + 1 : prev.currentMultiplier,
                    showFeedback: true,
                    feedbackType: 'correct',
                };
            });
        } else {
            // Wrong answer
            playSound('wrong');
            recordIncorrectAnswer();
            setGameState(prev => {
                const newLives = prev.lives - 1;
                return {
                    ...prev,
                    lives: newLives,
                    correctAnswers: 0, // Reset progress
                    isGameOver: newLives <= 0,
                    isPlaying: newLives > 0,
                    showFeedback: true,
                    feedbackType: 'wrong',
                };
            });
        }

        // Clear eggs and drop new ones after delay
        setEggs([]);
        setTimeout(() => {
            setGameState(prev => ({ ...prev, showFeedback: false, feedbackType: null }));
            if (gameState.lives > 0 && !gameState.isVictory) {
                dropEggs();
            }
        }, 1000);
    }, [dropEggs, gameState.lives, gameState.isVictory]);

    // Check for egg missed (fell through)
    const handleEggMissed = useCallback((egg: Egg) => {
        if (egg.isCorrect) {
            // Missed the correct egg - lose a life
            playSound('wrong');
            setGameState(prev => {
                const newLives = prev.lives - 1;
                return {
                    ...prev,
                    lives: newLives,
                    correctAnswers: 0,
                    isGameOver: newLives <= 0,
                    isPlaying: newLives > 0,
                    showFeedback: true,
                    feedbackType: 'wrong',
                };
            });

            setEggs([]);
            setTimeout(() => {
                setGameState(prev => ({ ...prev, showFeedback: false, feedbackType: null }));
                if (gameState.lives > 0) {
                    dropEggs();
                }
            }, 1000);
        }
    }, [dropEggs, gameState.lives]);

    // Move player
    const movePlayer = useCallback((direction: 'left' | 'right') => {
        setPlayer(prev => {
            const speed = 15;
            const newX = direction === 'left'
                ? Math.max(prev.width / 2, prev.x - speed)
                : Math.min(dimensions.width - prev.width / 2, prev.x + speed);
            return { ...prev, x: newX };
        });
    }, [dimensions.width]);

    // Set player position directly (for touch/mouse)
    const setPlayerPosition = useCallback((x: number) => {
        setPlayer(prev => ({
            ...prev,
            x: Math.max(prev.width / 2, Math.min(dimensions.width - prev.width / 2, x)),
        }));
    }, [dimensions.width]);

    // Start game
    const startGame = useCallback(() => {
        setGameState({
            level: 1,
            score: 0,
            correctAnswers: 0,
            currentMultiplier: 2,
            currentNumber: getRandomMultiplier(),
            correctAnswer: 0,
            lives: INITIAL_LIVES,
            isPlaying: true,
            isGameOver: false,
            isVictory: false,
            showFeedback: false,
            feedbackType: null,
        });
        setPlayer({ x: dimensions.width / 2, width: 80 });
        setPhoenix({
            x: dimensions.width / 2,
            y: dimensions.phoenixY,
            direction: 1,
            speed: 2,
            wingPhase: 0,
        });
        setEggs([]);

        setTimeout(() => dropEggs(), 500);
    }, [dimensions, dropEggs]);

    // Game loop
    useEffect(() => {
        if (!gameState.isPlaying) return;

        const gameLoop = () => {
            // Move phoenix
            setPhoenix(prev => {
                let newX = prev.x + prev.speed * prev.direction;
                let newDirection = prev.direction;

                if (newX > dimensions.width - 60) {
                    newDirection = -1;
                    newX = dimensions.width - 60;
                } else if (newX < 60) {
                    newDirection = 1;
                    newX = 60;
                }

                return {
                    ...prev,
                    x: newX,
                    direction: newDirection,
                    wingPhase: (prev.wingPhase + 0.15) % (Math.PI * 2),
                };
            });

            // Move eggs and check collisions
            setEggs(prevEggs => {
                const updatedEggs: Egg[] = [];

                for (const egg of prevEggs) {
                    const newY = egg.y + egg.speed;
                    const newRotation = egg.rotation + 2;

                    // Check collision with player (Basket)
                    const playerLeft = player.x - 50; // Wider hitbox
                    const playerRight = player.x + 50;
                    const playerTop = dimensions.playerY - 40; // Higher catch zone

                    if (newY > playerTop && newY < dimensions.playerY + 30 &&
                        egg.x > playerLeft && egg.x < playerRight) {
                        handleEggCatch(egg);
                        return []; // Remove egg
                    }

                    // Check if egg fell through
                    if (newY > dimensions.height) {
                        handleEggMissed(egg);
                        return [];
                    }

                    updatedEggs.push({
                        ...egg,
                        y: newY,
                        rotation: newRotation,
                    });
                }

                return updatedEggs;
            });

            gameLoopRef.current = requestAnimationFrame(gameLoop);
        };

        gameLoopRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameState.isPlaying, player, dimensions, handleEggCatch, handleEggMissed]);

    return {
        gameState,
        eggs,
        phoenix,
        player,
        movePlayer,
        setPlayerPosition,
        startGame,
    };
};
