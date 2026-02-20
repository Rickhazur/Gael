import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { edgeTTS } from '@/services/edgeTTS';

const WordProblemSimplePage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const problem = "Ana tenía 3/4 de litro de jugo. Luego bebió 2/5 de litro. ¿Cuántos litros de jugo bebió en total? ¿Cuánto jugo le quedó?";

  // Pasos simples y directos
  const steps = [
    {
      question: "¿Cuánto bebió Ana?",
      answer: "2/5",
      explanation: "El problema dice directamente que Ana bebió 2/5 litro."
    },
    {
      question: "Si Ana bebió jugo, ¿le queda más o menos?",
      answer: "menos",
      explanation: "Cuando alguien bebe algo, le queda menos cantidad."
    },
    {
      question: "¿Qué operación hacemos para saber cuánto le queda?",
      answer: "resta",
      explanation: "Para saber cuánto queda, restamos lo que bebió de lo que tenía."
    },
    {
      question: "¿Cuál es la operación?",
      answer: "3/4 - 2/5",
      explanation: "Tenemos que restar 3/4 menos 2/5."
    },
    {
      question: "¿Podemos restar 3/4 y 2/5 así directamente?",
      answer: "no",
      explanation: "No podemos restar fracciones con denominadores diferentes."
    },
    {
      question: "¿Qué número es divisible por 4 y por 5?",
      answer: "20",
      explanation: "20 es el número que funciona como común denominador."
    },
    {
      question: "¿Cuánto es 3/4 en veinteavos?",
      answer: "15/20",
      explanation: "Multiplicamos por 5: 3×5=15, 4×5=20."
    },
    {
      question: "¿Cuánto es 2/5 en veinteavos?",
      answer: "8/20",
      explanation: "Multiplicamos por 4: 2×4=8, 5×4=20."
    },
    {
      question: "¿Cuánto es 15/20 - 8/20?",
      answer: "7/20",
      explanation: "Restamos solo los números de arriba: 15-8=7."
    },
    {
      question: "¿Cuánto jugo le quedó a Ana?",
      answer: "7/20 litro",
      explanation: "Ana le quedó 7/20 litro de jugo."
    }
  ];

  const currentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const handleAnswer = () => {
    const isCorrect = userAnswer.toLowerCase().trim() === currentStep.answer.toLowerCase().trim();

    if (isCorrect) {
      edgeTTS.speak(currentStep.explanation, 'lina');

      if (step < steps.length - 1) {
        setStep(prev => prev + 1);
        setUserAnswer('');
        setErrors([]);
      } else {
        setShowResult(true);
      }
    } else {
      edgeTTS.speak('No es correcto. Intenta de nuevo.', 'lina');
      setErrors(prev => [...prev, `Respuesta incorrecta. La respuesta correcta es: ${currentStep.answer}`]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnswer();
    }
  };

  const reset = () => {
    setStep(0);
    setUserAnswer('');
    setShowResult(false);
    setErrors([]);
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto text-center"
        >
          <h1 className="text-3xl font-bold text-purple-600 mb-6">
            🎉 ¡Problema Resuelto!
          </h1>

          <div className="bg-green-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-green-800 mb-4">✅ Solución Encontrada:</h2>
            <div className="space-y-3">
              <p className="text-lg text-gray-700">
                📊 <strong>Respuesta fácil:</strong> Ana bebió <span className="text-purple-600 font-bold">2/5 litro</span>
              </p>
              <p className="text-lg text-gray-700">
                📊 <strong>Respuesta difícil:</strong> Ana le quedó <span className="text-purple-600 font-bold">7/20 litro</span>
              </p>
            </div>
            <p className="text-green-600 font-medium text-sm">
              ¡Descubriste la solución paso a paso!
            </p>
          </div>

          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-purple-800 mb-4">🧠 Resumen del Proceso:</h3>
            <div className="text-left space-y-2 text-sm">
              <p>1. Identificamos que Ana bebió 2/5 litro (respuesta fácil)</p>
              <p>2. Determinamos que necesitamos restar para saber cuánto le quedó</p>
              <p>3. Encontramos el común denominador: 20</p>
              <p>4. Convertimos ambas fracciones a veinteavos</p>
              <p>5. Restamos: 15/20 - 8/20 = 7/20</p>
            </div>
          </div>

          <button
            onClick={reset}
            className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-bold"
          >
            Resolver Otro Problema
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-purple-600 mb-2">
            🧠 Problema de Ana y su Jugo
          </h1>
          <p className="text-xl text-gray-600">
            Método Socrático - Descubre la solución tú mismo
          </p>
        </motion.div>

        {/* Problema */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-purple-600 mb-4">📚 Problema:</h2>
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-lg text-gray-800 leading-relaxed">
              {problem}
            </p>
          </div>
        </motion.div>

        {/* Progreso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Paso {step + 1} de {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% completado
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-purple-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Pregunta Actual */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h3 className="text-xl font-bold text-purple-600 mb-4">
            Pregunta {step + 1}:
          </h3>
          <p className="text-2xl text-gray-800 mb-6">
            {currentStep.question}
          </p>

          <div className="space-y-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu respuesta aquí..."
              className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
              autoFocus
            />

            <button
              onClick={handleAnswer}
              className="w-full px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-bold text-lg"
            >
              ✅ Responder
            </button>

            {errors.length > 0 && (
              <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                <p className="text-red-800 text-sm">
                  {errors[errors.length - 1]}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Explicación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-blue-600 mb-3">
            💡 Pista:
          </h3>
          <p className="text-gray-700">
            {currentStep.explanation}
          </p>
        </motion.div>

        {/* Botón de Reset */}
        <div className="text-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
          >
            🔄 Empezar de Nuevo
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordProblemSimplePage;
