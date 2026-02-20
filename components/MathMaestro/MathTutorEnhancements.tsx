import { useState } from 'react';
import { ExerciseScanner } from './ExerciseScanner';
import { TrainingCenter } from './TrainingCenter';
import type { MathExercise } from '../../services/exerciseGenerator';

interface MathTutorEnhancementsProps {
    onFeedbackReceived?: (feedback: string, problem?: string) => void;
    onExerciseSelected?: (exercise: MathExercise) => void;
}

export const MathTutorEnhancements = ({
    onFeedbackReceived,
    onExerciseSelected
}: MathTutorEnhancementsProps) => {
    const [showScanner, setShowScanner] = useState(false);
    const [showTraining, setShowTraining] = useState(false);

    const handleScannerAnalysis = (feedback: string, problem?: string) => {
        if (onFeedbackReceived) {
            onFeedbackReceived(feedback, problem);
        }
    };

    const handleExerciseSelect = (exercise: MathExercise) => {
        setShowTraining(false);
        if (onExerciseSelected) {
            onExerciseSelected(exercise);
        }
    };

    return (
        <>
            {/* Action Buttons */}
            <div className="tutor-enhancements">
                <button
                    onClick={() => setShowTraining(true)}
                    className="enhancement-btn training-btn"
                    title="Zona de Entrenamiento"
                >
                    <span className="btn-icon">🎯</span>
                    <span className="btn-label">Entrenamiento</span>
                </button>

                <button
                    onClick={() => setShowScanner(true)}
                    className="enhancement-btn scanner-btn"
                    title="Escanear ejercicio del cuaderno"
                >
                    <span className="btn-icon">📸</span>
                    <span className="btn-label">Escanear Cuaderno</span>
                </button>
            </div>

            {/* Modals */}
            {showScanner && (
                <ExerciseScanner
                    onAnalysisComplete={handleScannerAnalysis}
                    onClose={() => setShowScanner(false)}
                />
            )}

            {showTraining && (
                <TrainingCenter
                    onExerciseSelect={handleExerciseSelect}
                    onClose={() => setShowTraining(false)}
                />
            )}

            <style jsx>{`
        .tutor-enhancements {
          display: flex;
          gap: 12px;
          margin: 12px 0;
          flex-wrap: wrap;
        }

        .enhancement-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .enhancement-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .enhancement-btn:active {
          transform: translateY(0);
        }

        .training-btn {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
        }

        .scanner-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .btn-icon {
          font-size: 20px;
        }

        .btn-label {
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .tutor-enhancements {
            flex-direction: column;
          }

          .enhancement-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
        </>
    );
};
