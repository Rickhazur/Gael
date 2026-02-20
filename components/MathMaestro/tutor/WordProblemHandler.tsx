import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LinaAvatar } from './LinaAvatar';
import { edgeTTS } from '@/services/edgeTTS';

interface WordProblemHandlerProps {
  problem: string;
  onComplete?: (solution: any) => void;
}

export const WordProblemHandler: React.FC<WordProblemHandlerProps> = ({
  problem,
  onComplete
}) => {
  const [mission, setMission] = useState(1);
  const [step, setStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);

  // Detectar si es un word problem
  const isWordProblem = problem.length > 25 && /[a-zA-ZñÑáéíóúÁÉÍÓÚ]/.test(problem) && !problem.includes('=') && !/^[\d\s\+\-\*\/\(\)\.]*$/.test(problem);

  // Si no es un word problem, no mostrar nada
  if (!isWordProblem) {
    return null;
  }

  // Pasos socráticos para el problema de Ana
  const steps = [
    { question: "¿Quién es la protagonista?", answer: "ana", response: "¡Correcto! Ana es nuestra protagonista." },
    { question: "¿Cuánto jugo tenía Ana?", answer: "3/4", response: "¡Excelente! Ana tenía 3/4 de litro." },
    { question: "¿Qué hizo Ana?", answer: "bebió", response: "¡Perfecto! Ana bebió jugo." },
    { question: "¿Cuánto bebió?", answer: "2/5", response: "¡Muy bien! Ana bebió 2/5 litro." },
    { question: "¿Cuánto bebió en total?", answer: "2/5", response: "¡Correcto! El problema dice directamente 2/5 litro." },
    { question: "Si bebió, ¿le queda más o menos?", answer: "menos", response: "¡Exacto! Si bebe, le queda menos." },
    { question: "¿Qué operación hacemos?", answer: "resta", response: "¡Perfecto! Cuando algo disminuye, restamos." },
    { question: "¿Qué operación necesitamos?", answer: "3/4 - 2/5", response: "¡Exacto! Restamos 3/4 menos 2/5." },
    { question: "¿Podemos restar así directamente?", answer: "no", response: "¡Correcto! Los denominadores son diferentes." },
    { question: "¿Qué necesitamos?", answer: "mismo denominador", response: "¡Excelente! Necesitamos el mismo denominador." },
    { question: "¿Qué número funciona para 4 y 5?", answer: "20", response: "¡Perfecto! 20 es el común denominador." },
    { question: "¿Cuánto es 3/4 en veinteavos?", answer: "15/20", response: "¡Muy bien! 3×5=15, 4×5=20." },
    { question: "¿Y 2/5 en veinteavos?", answer: "8/20", response: "¡Correcto! 2×4=8, 5×4=20." },
    { question: "¿Cuánto es 15/20 - 8/20?", answer: "7/20", response: "¡Genial! 15-8=7, entonces 7/20." }
  ];

  const currentStepData = steps[step];

  const handleAnswer = () => {
    const isCorrect = userAnswer.toLowerCase().includes(currentStepData.answer.toLowerCase());
    
    if (isCorrect) {
      edgeTTS.speak(currentStepData.response, 'lina');
      
      if (step < steps.length - 1) {
        setStep(prev => prev + 1);
        setUserAnswer('');
      } else {
        setShowResult(true);
        if (onComplete) {
          onComplete({
            easyAnswer: '2/5 litro',
            hardAnswer: '7/20 litro'
          });
        }
      }
    } else {
      edgeTTS.speak('Intenta de nuevo, piensa cuidadosamente', 'lina');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnswer();
    }
  };

  if (showResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto"
      >
        <div className="text-center">
          <LinaAvatar state="celebrating" size={100} />
          
          <h2 className="text-2xl font-bold text-purple-600 mt-4 mb-4">
            🏆 ¡Problema Resuelto!
          </h2>
          
          <div className="bg-green-50 rounded-xl p-4 mb-4">
            <h3 className="text-lg font-bold text-green-800 mb-3">✅ Solución Encontrada:</h3>
            <p className="text-gray-700 mb-2">
              📊 Ana bebió: <strong>2/5 litro</strong>
            </p>
            <p className="text-gray-700 mb-3">
              📊 Ana le quedó: <strong>7/20 litro</strong>
            </p>
            <p className="text-green-600 font-medium">
              ¡Descubriste la solución usando el método Socrático!
            </p>
          </div>
          
          <button
            onClick={() => {
              setStep(0);
              setUserAnswer('');
              setShowResult(false);
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            Resolver Otro Problema
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto"
    >
      <div className="mb-4">
        <h2 className="text-xl font-bold text-purple-600 mb-2">🧠 Método Socrático</h2>
        <div className="bg-purple-50 rounded-xl p-3">
          <p className="text-sm text-gray-700">{problem}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <LinaAvatar state="thinking" size={60} />
        <div>
          <h3 className="text-lg font-bold text-purple-600">Pregunta {step + 1} de {steps.length}:</h3>
          <p className="text-lg text-gray-800">{currentStepData.question}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe tu respuesta..."
          className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
          autoFocus
        />
        
        <button
          onClick={handleAnswer}
          className="w-full px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-bold"
        >
          ✅ Responder
        </button>
      </div>
    </motion.div>
  );
};
