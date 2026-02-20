import { useState, useEffect } from 'react';
import {
    generateExercises,
    clearExerciseHistory,
    getExerciseStats,
    type MathExercise,
    type MathOperation,
    type DifficultyLevel
} from '../../services/exerciseGenerator';
import { getSuggestedDifficulty } from '../../services/mathPerformance';

interface TrainingCenterProps {
    onExerciseSelect?: (exercise: MathExercise) => void;
    onClose: () => void;
}

export const TrainingCenter = ({ onExerciseSelect, onClose }: TrainingCenterProps) => {
    const [selectedOperation, setSelectedOperation] = useState<MathOperation>('addition');
    const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(() =>
        getSuggestedDifficulty('addition') as DifficultyLevel
    );
    const [exercises, setExercises] = useState<MathExercise[]>([]);
    const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [stats, setStats] = useState<Record<string, number>>({});

    // Load exercises when operation or difficulty changes
    useEffect(() => {
        loadExercises();
    }, [selectedOperation, selectedDifficulty]);

    // Update stats
    useEffect(() => {
        setStats(getExerciseStats());
    }, [exercises]);

    const loadExercises = () => {
        const newExercises = generateExercises({
            operation: selectedOperation,
            difficulty: selectedDifficulty,
            count: 10
        });
        setExercises(newExercises);
        setCurrentExerciseIndex(0);
    };

    const handleExerciseComplete = (exerciseId: string) => {
        setCompletedExercises(prev => new Set(prev).add(exerciseId));
    };

    const handleNextExercise = () => {
        if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
        } else {
            // Generate more exercises
            loadExercises();
        }
    };

    const handlePracticeExercise = (exercise: MathExercise) => {
        if (onExerciseSelect) {
            onExerciseSelect(exercise);
        }
    };

    const currentExercise = exercises[currentExerciseIndex];
    const progress = exercises.length > 0
        ? ((completedExercises.size / exercises.length) * 100).toFixed(0)
        : 0;

    // Curriculum structure (MEN + IB PYP)
    const curriculum = {
        'Grado 1': {
            topics: ['Números hasta 100', 'Suma simple', 'Resta simple', 'Patrones'],
            operations: ['addition', 'subtraction'],
            difficulty: 'easy' as DifficultyLevel
        },
        'Grado 2': {
            topics: ['Números hasta 1000', 'Suma con reagrupación', 'Resta con préstamo', 'Tablas del 2 y 5'],
            operations: ['addition', 'subtraction', 'multiplication'],
            difficulty: 'easy' as DifficultyLevel
        },
        'Grado 3': {
            topics: ['Números hasta 10000', 'Multiplicación', 'División simple', 'Fracciones básicas'],
            operations: ['addition', 'subtraction', 'multiplication', 'division'],
            difficulty: 'medium' as DifficultyLevel
        },
        'Grado 4': {
            topics: ['Números grandes', 'Multiplicación de 2 dígitos', 'División larga', 'Fracciones equivalentes'],
            operations: ['multiplication', 'division', 'fractions'],
            difficulty: 'medium' as DifficultyLevel
        },
        'Grado 5': {
            topics: ['Decimales', 'Operaciones con fracciones', 'División compleja', 'Problemas de aplicación'],
            operations: ['multiplication', 'division', 'fractions'],
            difficulty: 'hard' as DifficultyLevel
        }
    };

    return (
        <div className="training-center-overlay">
            <div className="training-center-modal">
                <div className="training-header">
                    <h1>🎯 Centro de Entrenamiento Matemático</h1>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>

                <div className="training-content">
                    {/* Left Panel: Curriculum & Controls */}
                    <div className="left-panel">
                        <div className="curriculum-section">
                            <h2>📚 Currículum</h2>
                            <div className="curriculum-grid">
                                {Object.entries(curriculum).map(([grade, info]) => (
                                    <div key={grade} className="curriculum-card">
                                        <h3>{grade}</h3>
                                        <ul>
                                            {info.topics.map(topic => (
                                                <li key={topic}>{topic}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="controls-section">
                            <h2>⚙️ Configuración</h2>

                            <div className="control-group">
                                <label>Operación:</label>
                                <select
                                    value={selectedOperation}
                                    onChange={(e) => setSelectedOperation(e.target.value as MathOperation)}
                                    className="control-select"
                                >
                                    <option value="addition">➕ Suma</option>
                                    <option value="subtraction">➖ Resta</option>
                                    <option value="multiplication">✖️ Multiplicación</option>
                                    <option value="division">➗ División</option>
                                    <option value="fractions">🍰 Fracciones</option>
                                </select>
                            </div>

                            <div className="control-group">
                                <label>Dificultad:</label>
                                <select
                                    value={selectedDifficulty}
                                    onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel)}
                                    className="control-select"
                                >
                                    <option value="easy">🌱 Fácil</option>
                                    <option value="medium">🌿 Intermedio</option>
                                    <option value="hard">🌳 Difícil</option>
                                    <option value="expert">🏆 Experto</option>
                                </select>
                            </div>

                            <button onClick={loadExercises} className="generate-btn">
                                🎲 Generar Nuevos Ejercicios
                            </button>

                            <div className="stats-box">
                                <h3>📊 Estadísticas</h3>
                                <p>Ejercicios completados: <strong>{completedExercises.size}</strong></p>
                                <p>Progreso: <strong>{progress}%</strong></p>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Exercise Display */}
                    <div className="right-panel">
                        <div className="exercise-display">
                            {currentExercise ? (
                                <>
                                    <div className="exercise-header">
                                        <span className="exercise-number">
                                            Ejercicio {currentExerciseIndex + 1} de {exercises.length}
                                        </span>
                                        <span className={`difficulty-badge ${selectedDifficulty}`}>
                                            {selectedDifficulty === 'easy' && '🌱 Fácil'}
                                            {selectedDifficulty === 'medium' && '🌿 Intermedio'}
                                            {selectedDifficulty === 'hard' && '🌳 Difícil'}
                                            {selectedDifficulty === 'expert' && '🏆 Experto'}
                                        </span>
                                    </div>

                                    <div className="exercise-problem">
                                        <div className="problem-text">
                                            {currentExercise.problem}
                                        </div>
                                    </div>

                                    <div className="exercise-hint">
                                        <strong>💡 Pista:</strong> {currentExercise.hint}
                                    </div>

                                    <div className="exercise-actions">
                                        <button
                                            onClick={() => handlePracticeExercise(currentExercise)}
                                            className="practice-btn"
                                        >
                                            ✏️ Practicar en el Tablero
                                        </button>

                                        <button
                                            onClick={() => {
                                                handleExerciseComplete(currentExercise.id);
                                                handleNextExercise();
                                            }}
                                            className="next-btn"
                                        >
                                            ➡️ Siguiente Ejercicio
                                        </button>
                                    </div>

                                    <details className="exercise-solution">
                                        <summary>🔍 Ver explicación</summary>
                                        <p>{currentExercise.explanation}</p>
                                    </details>
                                </>
                            ) : (
                                <div className="no-exercises">
                                    <p>🎯 Selecciona una operación y dificultad para comenzar</p>
                                    <button onClick={loadExercises} className="start-btn">
                                        🚀 Comenzar entrenamiento
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="exercise-list">
                            <h3>📋 Lista de Ejercicios</h3>
                            <div className="exercise-items">
                                {exercises.map((ex, idx) => (
                                    <div
                                        key={ex.id}
                                        className={`exercise-item ${idx === currentExerciseIndex ? 'active' : ''} ${completedExercises.has(ex.id) ? 'completed' : ''}`}
                                        onClick={() => setCurrentExerciseIndex(idx)}
                                    >
                                        <span className="item-number">{idx + 1}</span>
                                        <span className="item-problem">{ex.problem}</span>
                                        {completedExercises.has(ex.id) && <span className="check-mark">✓</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .training-center-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(8px);
        }

        .training-center-modal {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          border-radius: 24px;
          width: 95%;
          max-width: 1400px;
          height: 90vh;
          overflow: hidden;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
        }

        .training-header {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }

        .training-header h1 {
          color: white;
          font-size: 28px;
          font-weight: 800;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1) rotate(90deg);
        }

        .training-content {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 24px;
          padding: 24px;
          overflow: auto;
          flex: 1;
        }

        .left-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .curriculum-section {
          background: white;
          border-radius: 16px;
          padding: 20px;
          max-height: 400px;
          overflow-y: auto;
        }

        .curriculum-section h2 {
          margin: 0 0 16px 0;
          color: #1e293b;
          font-size: 20px;
        }

        .curriculum-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .curriculum-card {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 2px solid #0ea5e9;
          border-radius: 12px;
          padding: 12px;
        }

        .curriculum-card h3 {
          margin: 0 0 8px 0;
          color: #0369a1;
          font-size: 16px;
          font-weight: 700;
        }

        .curriculum-card ul {
          margin: 0;
          padding-left: 20px;
          list-style: none;
        }

        .curriculum-card li {
          font-size: 13px;
          color: #334155;
          margin: 4px 0;
          position: relative;
          padding-left: 16px;
        }

        .curriculum-card li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: bold;
        }

        .controls-section {
          background: white;
          border-radius: 16px;
          padding: 20px;
        }

        .controls-section h2 {
          margin: 0 0 16px 0;
          color: #1e293b;
          font-size: 20px;
        }

        .control-group {
          margin-bottom: 16px;
        }

        .control-group label {
          display: block;
          font-weight: 600;
          color: #475569;
          margin-bottom: 8px;
        }

        .control-select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 16px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .control-select:hover {
          border-color: #7c3aed;
        }

        .control-select:focus {
          outline: none;
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        .generate-btn, .start-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .generate-btn:hover, .start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
        }

        .stats-box {
          margin-top: 20px;
          padding: 16px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 12px;
          border: 2px solid #fbbf24;
        }

        .stats-box h3 {
          margin: 0 0 12px 0;
          color: #92400e;
          font-size: 16px;
        }

        .stats-box p {
          margin: 8px 0;
          color: #78350f;
          font-size: 14px;
        }

        .progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          transition: width 0.5s ease;
        }

        .right-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .exercise-display {
          background: white;
          border-radius: 16px;
          padding: 32px;
          min-height: 400px;
          display: flex;
          flex-direction: column;
        }

        .exercise-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .exercise-number {
          font-weight: 600;
          color: #64748b;
        }

        .difficulty-badge {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .difficulty-badge.easy {
          background: #d1fae5;
          color: #065f46;
        }

        .difficulty-badge.medium {
          background: #fef3c7;
          color: #92400e;
        }

        .difficulty-badge.hard {
          background: #fed7aa;
          color: #9a3412;
        }

        .difficulty-badge.expert {
          background: #fecaca;
          color: #991b1b;
        }

        .exercise-problem {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 40px 0;
        }

        .problem-text {
          font-size: 64px;
          font-weight: 800;
          color: #1e293b;
          font-family: 'Courier New', monospace;
          text-align: center;
        }

        .exercise-hint {
          background: #f0f9ff;
          border-left: 4px solid #0ea5e9;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          color: #0369a1;
        }

        .exercise-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .practice-btn, .next-btn {
          flex: 1;
          padding: 16px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .practice-btn {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
        }

        .practice-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.6);
        }

        .next-btn {
          background: #f1f5f9;
          color: #475569;
        }

        .next-btn:hover {
          background: #e2e8f0;
        }

        .exercise-solution {
          margin-top: 16px;
          padding: 16px;
          background: #fef3c7;
          border-radius: 8px;
          cursor: pointer;
        }

        .exercise-solution summary {
          font-weight: 600;
          color: #92400e;
        }

        .exercise-solution p {
          margin-top: 12px;
          color: #78350f;
        }

        .no-exercises {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
        }

        .no-exercises p {
          font-size: 20px;
          color: #64748b;
        }

        .exercise-list {
          background: white;
          border-radius: 16px;
          padding: 20px;
          max-height: 300px;
          overflow-y: auto;
        }

        .exercise-list h3 {
          margin: 0 0 16px 0;
          color: #1e293b;
          font-size: 18px;
        }

        .exercise-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .exercise-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .exercise-item:hover {
          border-color: #7c3aed;
          background: #f5f3ff;
        }

        .exercise-item.active {
          border-color: #7c3aed;
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
        }

        .exercise-item.completed {
          background: #d1fae5;
          border-color: #10b981;
        }

        .item-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #7c3aed;
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 14px;
        }

        .exercise-item.completed .item-number {
          background: #10b981;
        }

        .item-problem {
          flex: 1;
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #1e293b;
        }

        .check-mark {
          color: #10b981;
          font-size: 20px;
          font-weight: bold;
        }

        @media (max-width: 1024px) {
          .training-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};
