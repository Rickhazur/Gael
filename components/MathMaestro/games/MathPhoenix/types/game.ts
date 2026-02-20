
// Game types and interfaces for Math Phoenix

export interface Position {
    x: number;
    y: number;
}

export interface Egg {
    id: number;
    x: number;
    y: number;
    value: number;
    isCorrect: boolean;
    speed: number;
    rotation: number;
}

export interface Phoenix {
    x: number;
    y: number;
    direction: 1 | -1;
    speed: number;
    wingPhase: number;
}

export interface Player {
    x: number;
    width: number;
}

export interface GameState {
    level: number;
    score: number;
    correctAnswers: number;
    currentMultiplier: number;
    currentNumber: number;
    correctAnswer: number;
    lives: number;
    isPlaying: boolean;
    isGameOver: boolean;
    isVictory: boolean;
    showFeedback: boolean;
    feedbackType: 'correct' | 'wrong' | null;
}

export interface GameDimensions {
    width: number;
    height: number;
    playerY: number;
    phoenixY: number;
}
