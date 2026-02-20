import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { edgeTTS } from '@/services/edgeTTS';

const WordProblemDirectPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [highlightedData, setHighlightedData] = useState<string[]>([]);

  const problem = "Ana tenía 3/4 de litro de jugo. Luego bebió 2/5 de litro. ¿Cuántos litros de jugo bebió en total? ¿Cuánto jugo le quedó?";

  const steps = [
    {
      id: 'character',
      question: '📚 ¿Quién es la protagonista de nuestra historia?',
      expectedAnswer: 'ana',
      explanation: '¡Correcto! Ana es nuestra protagonista',
      highlightData: ['character']
    },
    {
      id: 'initial',
      question: '🥤 ¿Cuánto jugo tenía Ana al principio?',
      expectedAnswer: '3/4',
      explanation: '¡Excelente! 3/4 es nuestra primera cantidad clave',
      highlightData: ['initial']
    },
    {
      id: 'action',
      question: '👀 ¿Qué hizo Ana con su jugo?',
      expectedAnswer: 'bebió',
      explanation: '¡Correcto! Beber es la acción importante',
      highlightData: ['action']
    },
    {
      id: 'actionAmount',
      question: '🥤 ¿Cuánto jugo bebió Ana?',
      expectedAnswer: '2/5',
      explanation: '¡Perfecto! 2/5 es nuestra segunda cantidad clave',
      highlightData: ['actionAmount']
    },
    {
      id: 'easyQuestion',
      question: '❓ ¿Cuánto bebió Ana en total? (la pregunta fácil)',
      expectedAnswer: '2/5',
      explanation: '¡Correcto! El problema dice directamente que bebió 2/5 litro',
      highlightData: ['actionAmount']
    },
    {
      id: 'operation',
      question: '🤔 Si Ana bebió jugo, ¿tendrá más o menos jugo al final?',
      expectedAnswer: 'menos',
      explanation: '¡Exacto! Si bebe, disminuye la cantidad',
      highlightData: []
    },
    {
      id: 'mathOperation',
      question: '🧮 Si tenemos menos cantidad, ¿qué operación matemática usamos?',
      expectedAnswer: 'resta',
      explanation: '¡Perfecto! Cuando algo disminuye, restamos',
      highlightData: []
    },
    {
      id: 'commonDenominator',
      question: '🌟 ¿Qué número es divisible por 4 y por 5?',
      expectedAnswer: '20',
      explanation: '¡Correcto! 20 funciona para ambos',
      highlightData: []
    },
    {
      id: 'convertFirst',
      question: '🔄 Si convertimos 3/4 a veinteavos... ¿cuánto es?',
      expectedAnswer: '15/20',
      explanation: '¡Excelente! 3 × 5 = 15, entonces 15/20',
      highlightData: []
    },
    {
      id: 'convertSecond',
      question: '🔄 Y 2/5... ¿cuánto es en veinteavos?',
      expectedAnswer: '8/20',
      explanation: '¡Perfecto! 2 × 4 = 8, entonces 8/20',
      highlightData: []
    },
    {
      id: 'finalSubtraction',
      question: '✨ Ahora sí... 15/20 - 8/20 = ?',
      expectedAnswer: '7/20',
      explanation: '¡Genial! 15 - 8 = 7, entonces 7/20',
      highlightData: []
    }
  ];

  const currentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const renderHighlightedProblem = () => {
    const parts = [
      { text: 'Ana', type: 'character' },
      { text: ' tenía ', type: 'normal' },
      { text: '3/4', type: 'initial' },
      { text: ' de litro de jugo. Luego ', type: 'normal' },
      { text: 'bebió', type: 'action' },
      { text: ' ', type: 'normal' },
      { text: '2/5', type: 'actionAmount' },
      { text: ' de litro.', type: 'normal' }
    ];

    return parts.map((part, index) => {
      const isHighlighted = highlightedData.includes(part.type);
      const highlightClass = {
        character: 'bg-blue-200 text-blue-800 px-2 py-1 rounded',
        initial: 'bg-green-200 text-green-800 px-2 py-1 rounded',
        action: 'bg-orange-200 text-orange-800 px-2 py-1 rounded',
        actionAmount: 'bg-purple-200 text-purple-800 px-2 py-1 rounded',
        normal: ''
      }[part.type];

      return (
        <span key={index} className={highlightClass}>
          {part.text}
        </span>
      );
    });
  };

  const handleAnswer = async () => {
    const isCorrect = userAnswer.toLowerCase().trim() === currentStep.expectedAnswer.toLowerCase().trim();
    
    if (isCorrect) {
      // Highlight the data for this step
      if (currentStep.highlightData) {
        setHighlightedData(prev => [...new Set([...prev, ...currentStep.highlightData])]);
      }
      
      // Lina celebrates
      await edgeTTS.speak(currentStep.explanation, 'lina');
      
      if (step < steps.length - 1) {
        setStep(prev => prev + 1);
        setUserAnswer('');
      } else {
        setShowResult(true);
        await edgeTTS.speak('¡Felicidades! Has completado todo el problema. ¡Excelente trabajo!', 'lina');
      }
    } else {
      await edgeTTS.speak('No es correcto. Intenta de nuevo.', 'lina');
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
    setHighlightedData([]);
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
              {renderHighlightedProblem()}
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
          </div>
        </motion.div>

        {/* Datos Extraídos */}
        {highlightedData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-blue-600 mb-4">📊 Datos que descubrimos:</h3>
            <div className="grid grid-cols-2 gap-4">
              {highlightedData.includes('character') && (
                <div className="bg-blue-200 border-2 border-blue-400 rounded-xl p-3">
                  <p className="text-sm text-blue-800 font-medium">👤 Personaje:</p>
                  <p className="font-bold text-blue-900">Ana</p>
                </div>
              )}
              {highlightedData.includes('initial') && (
                <div className="bg-green-200 border-2 border-green-400 rounded-xl p-3">
                  <p className="text-sm text-green-800 font-medium">🥤 Tenía:</p>
                  <p className="font-bold text-green-900">3/4</p>
                </div>
              )}
              {highlightedData.includes('action') && (
                <div className="bg-orange-200 border-2 border-orange-400 rounded-xl p-3">
                  <p className="text-sm text-orange-800 font-medium">👀 Acción:</p>
                  <p className="font-bold text-orange-900">bebió</p>
                </div>
              )}
              {highlightedData.includes('actionAmount') && (
                <div className="bg-purple-200 border-2 border-purple-400 rounded-xl p-3">
                  <p className="text-sm text-purple-800 font-medium">🥤 Cantidad:</p>
                  <p className="font-bold text-purple-900">2/5</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WordProblemDirectPage;
