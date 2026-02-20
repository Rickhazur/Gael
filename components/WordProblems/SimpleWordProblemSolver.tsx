import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LinaAvatar } from '../MathMaestro/tutor/LinaAvatar';
import { edgeTTS } from '@/services/edgeTTS';

interface SimpleWordProblemSolverProps {
  problem: string;
  onSolutionComplete?: (solution: any) => void;
}

export const SimpleWordProblemSolver: React.FC<SimpleWordProblemSolverProps> = ({
  problem,
  onSolutionComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [highlightedData, setHighlightedData] = useState<string[]>([]);

  // El problema de Ana y el jugo
  const problemData = {
    character: 'Ana',
    initialAmount: '3/4 de litro',
    action: 'bebió',
    actionAmount: '2/5 de litro',
    questions: ['¿Cuánto bebió en total?', '¿Cuánto le quedó?']
  };

  const steps = [
    {
      id: 'character',
      question: '📚 ¿Quién es la protagonista de nuestra historia?',
      expectedAnswer: 'ana',
      hint: 'Busca el nombre de la persona en el problema',
      explanation: '¡Correcto! Ana es nuestra protagonista',
      highlightData: ['character']
    },
    {
      id: 'initial',
      question: '🥤 ¿Cuánto jugo tenía Ana al principio?',
      expectedAnswer: '3/4',
      hint: 'Busca la primera cantidad que aparece',
      explanation: '¡Excelente! 3/4 es nuestra primera cantidad clave',
      highlightData: ['initial']
    },
    {
      id: 'action',
      question: '👀 ¿Qué hizo Ana con su jugo?',
      expectedAnswer: 'bebió',
      hint: 'Busca el verbo que describe la acción',
      explanation: '¡Correcto! Beber es la acción importante',
      highlightData: ['action']
    },
    {
      id: 'actionAmount',
      question: '🥤 ¿Cuánto jugo bebió Ana?',
      expectedAnswer: '2/5',
      hint: 'Busca la segunda cantidad que aparece',
      explanation: '¡Perfecto! 2/5 es nuestra segunda cantidad clave',
      highlightData: ['actionAmount']
    },
    {
      id: 'easyQuestion',
      question: '❓ ¿Cuánto beció Ana en total? (la pregunta fácil)',
      expectedAnswer: '2/5',
      hint: '¿Qué dice directamente el problema?',
      explanation: '¡Correcto! El problema dice directamente que beció 2/5 litro',
      highlightData: ['actionAmount']
    },
    {
      id: 'operation',
      question: '🤔 Si Ana beció jugo, ¿tendrá más o menos jugo al final?',
      expectedAnswer: 'menos',
      hint: 'Piensa: si bebes algo, ¿te queda más o menos?',
      explanation: '¡Exacto! Si bebe, disminuye la cantidad',
      highlightData: []
    },
    {
      id: 'mathOperation',
      question: '🧮 Si tenemos menos cantidad, ¿qué operación matemática usamos?',
      expectedAnswer: 'resta',
      hint: '¿Sumamos, restamos, multiplicamos o dividimos cuando algo disminuye?',
      explanation: '¡Perfecto! Cuando algo disminuye, restamos',
      highlightData: []
    },
    {
      id: 'commonDenominator',
      question: '🌟 ¿Qué número es divisible por 4 y por 5?',
      expectedAnswer: '20',
      hint: 'Piensa en la tabla del 4 y del 5',
      explanation: '¡Correcto! 20 funciona para ambos',
      highlightData: []
    },
    {
      id: 'convertFirst',
      question: '🔄 Si convertimos 3/4 a veinteavos... ¿cuánto es?',
      expectedAnswer: '15/20',
      hint: '3/4 = ?/20 (multiplica por 5)',
      explanation: '¡Excelente! 3 × 5 = 15, entonces 15/20',
      highlightData: []
    },
    {
      id: 'convertSecond',
      question: '🔄 Y 2/5... ¿cuánto es en veinteavos?',
      expectedAnswer: '8/20',
      hint: '2/5 = ?/20 (multiplica por 4)',
      explanation: '¡Perfecto! 2 × 4 = 8, entonces 8/20',
      highlightData: []
    },
    {
      id: 'finalSubtraction',
      question: '✨ Ahora sí... 15/20 - 8/20 = ?',
      expectedAnswer: '7/20',
      hint: 'Solo resta los números de arriba',
      explanation: '¡Genial! 15 - 8 = 7, entonces 7/20',
      highlightData: []
    }
  ];

  const handleAnswer = () => {
    const currentStepData = steps[currentStep];
    const isCorrect = userAnswer.toLowerCase().includes(currentStepData.expectedAnswer.toLowerCase());
    
    if (isCorrect) {
      // Highlight the data for this step
      if (currentStepData.highlightData) {
        setHighlightedData(prev => [...new Set([...prev, ...currentStepData.highlightData])]);
      }
      
      // Lina celebra
      edgeTTS.speak(currentStepData.explanation, 'lina');
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        setUserAnswer('');
        setShowHint(false);
      } else {
        // Completado
        setIsCompleted(true);
        if (onSolutionComplete) {
          onSolutionComplete({
            easyAnswer: '2/5 litro',
            hardAnswer: '7/20 litro'
          });
        }
      }
    } else {
      // Respuesta incorrecta
      edgeTTS.speak('No es correcto. Intenta de nuevo.', 'lina');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnswer();
    }
  };

  // Function to render problem with highlighted data
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

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-white rounded-2xl shadow-lg"
      >
        <LinaAvatar state="celebrating" size={150} />
        
        <h2 className="text-3xl font-bold text-purple-600 mt-6 mb-4">
          🏆 ¡Problema Resuelto!
        </h2>
        
        <div className="bg-green-50 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-green-800 mb-4">✅ Solución Encontrada:</h3>
          <p className="text-lg text-gray-700 mb-2">
            📊 Ana bebió: <strong>2/5 litro</strong>
          </p>
          <p className="text-lg text-gray-700 mb-4">
            📊 Ana le quedó: <strong>7/20 litro</strong>
          </p>
          <p className="text-green-600 font-medium">
            ¡Descubriste la solución paso a paso!
          </p>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-6">
          <h4 className="text-lg font-bold text-purple-800 mb-3">🧠 ¿Qué aprendiste?</h4>
          <ul className="text-left text-gray-700 space-y-2">
            <li>✅ Extraer datos importantes de un problema</li>
            <li>✅ Entender qué operación necesitas</li>
            <li>✅ Restar fracciones con diferente denominador</li>
            <li>✅ Encontrar el común denominador</li>
          </ul>
        </div>
        
        <button
          onClick={() => {
            setCurrentStep(0);
            setUserAnswer('');
            setIsCompleted(false);
          }}
          className="mt-6 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
        >
          Resolver Otro Problema
        </button>
      </motion.div>
    );
  }

  return (
    <div className="simple-word-problem-solver p-6 max-w-2xl mx-auto">
      {/* Problema */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
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
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Paso {currentStep + 1} de {steps.length}</span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% completado
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Pregunta Actual */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <LinaAvatar state="thinking" size={60} />
          <div>
            <h3 className="text-lg font-bold text-purple-600">Pregunta Socrática:</h3>
            <p className="text-xl text-gray-800">{steps[currentStep].question}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu respuesta..."
            className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
            autoFocus
          />
          
          <div className="flex gap-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
            >
              💡 Pista
            </button>
            
            <button
              onClick={handleAnswer}
              className="px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
            >
              ✅ Responder
            </button>
          </div>
          
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200"
            >
              <p className="text-yellow-800">💡 {steps[currentStep].hint}</p>
            </motion.div>
          )}
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
                <p className="font-bold text-blue-900">{problemData.character}</p>
              </div>
            )}
            {highlightedData.includes('initial') && (
              <div className="bg-green-200 border-2 border-green-400 rounded-xl p-3">
                <p className="text-sm text-green-800 font-medium">🥤 Tenía:</p>
                <p className="font-bold text-green-900">{problemData.initialAmount}</p>
              </div>
            )}
            {highlightedData.includes('action') && (
              <div className="bg-orange-200 border-2 border-orange-400 rounded-xl p-3">
                <p className="text-sm text-orange-800 font-medium">👀 Acción:</p>
                <p className="font-bold text-orange-900">{problemData.action}</p>
              </div>
            )}
            {highlightedData.includes('actionAmount') && (
              <div className="bg-purple-200 border-2 border-purple-400 rounded-xl p-3">
                <p className="text-sm text-purple-800 font-medium">🥤 Cantidad:</p>
                <p className="font-bold text-purple-900">{problemData.actionAmount}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
