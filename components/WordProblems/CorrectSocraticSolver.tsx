import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LinaAvatar } from '../MathMaestro/tutor/LinaAvatar';
import { edgeTTS } from '@/services/edgeTTS';

interface CorrectSocraticSolverProps {
  problem: string;
  onSolutionComplete?: (solution: any) => void;
}

export const CorrectSocraticSolver: React.FC<CorrectSocraticSolverProps> = ({
  problem,
  onSolutionComplete
}) => {
  const [mission, setMission] = useState(1);
  const [step, setStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [highlightedData, setHighlightedData] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // MISIÓN 1: Hacer entender el problema
  const mission1Steps = [
    {
      id: 'readStory',
      instruction: 'Lee la historia con atención',
      text: 'Ana tenía 3/4 de litro de jugo. Luego bebió 2/5 de litro.',
      linaVoice: 'Vamos a leer esta historia juntos. Ana es una niña que tiene jugo...',
      highlight: ['character', 'initial', 'action', 'amount']
    },
    {
      id: 'identifyCharacter',
      question: '¿Quién es la protagonista de esta historia?',
      expectedAnswer: 'Ana',
      linaVoice: 'Muy bien. Ana es nuestra protagonista. ¿Qué tiene Ana?',
      highlight: ['character']
    },
    {
      id: 'identifyInitial',
      question: '¿Qué cantidad de jugo tenía Ana al principio?',
      expectedAnswer: '3/4',
      linaVoice: 'Excelente. Ana tenía 3/4 de litro. ¿Qué pasó después?',
      highlight: ['initial']
    },
    {
      id: 'identifyAction',
      question: '¿Qué acción hizo Ana con el jugo?',
      expectedAnswer: 'bebió',
      linaVoice: 'Correcto. Ana bebió jugo. ¿Cuánto bebió?',
      highlight: ['action']
    },
    {
      id: 'identifyAmount',
      question: '¿Cuánto jugo bebió Ana?',
      expectedAnswer: '2/5',
      linaVoice: 'Perfecto. Ana bebió 2/5 de litro. ¿Qué necesitamos averiguar?',
      highlight: ['amount']
    },
    {
      id: 'identifyQuestions',
      question: '¿Qué dos preguntas nos hace el problema?',
      expectedAnswer: ['cuánto bebió', 'cuánto le quedó'],
      linaVoice: '¡Genial! Necesitamos saber cuánto bebió y cuánto le quedó.',
      highlight: ['questions']
    }
  ];

  // MISIÓN 2: Entender qué hacer
  const mission2Steps = [
    {
      id: 'easyAnswer',
      question: '¿Cuánto bebió Ana en total? (la pregunta fácil)',
      expectedAnswer: '2/5',
      linaVoice: '¡Correcto! El problema nos dice directamente que bebió 2/5 litro.',
      explanation: 'La primera pregunta es fácil porque el problema dice la respuesta directamente.'
    },
    {
      id: 'hardQuestion',
      question: '¿Cuánto le queda? (la pregunta difícil)',
      expectedAnswer: 'hay que calcular',
      linaVoice: '¡Exacto! Esta pregunta necesita cálculo.',
      explanation: 'La segunda pregunta es difícil porque tenemos que calcularla.'
    },
    {
      id: 'moreOrLess',
      question: 'Si Ana bebió jugo, ¿le queda más o menos jugo?',
      expectedAnswer: 'menos',
      linaVoice: '¡Muy bien pensado! Si bebe, le queda menos.',
      explanation: 'Cuando bebemos algo, la cantidad disminuye.'
    },
    {
      id: 'whatOperation',
      question: '¿Qué operación matemática hacemos cuando algo disminuye?',
      expectedAnswer: 'resta',
      linaVoice: '¡Perfecto! Cuando algo disminuye, restamos.',
      explanation: 'La resta es la operación para cuando algo disminuye.'
    }
  ];

  // MISIÓN 3: Solución Socrática
  const mission3Steps = [
    {
      id: 'problemStatement',
      question: '¿Qué operación necesitamos hacer?',
      expectedAnswer: '3/4 - 2/5',
      linaVoice: '¡Exacto! Necesitamos restar 3/4 menos 2/5.',
      explanation: 'Tenemos: 3/4 - 2/5 = ?'
    },
    {
      id: 'denominatorProblem',
      question: '¿Podemos restar 3/4 y 2/5 así directamente?',
      expectedAnswer: 'no',
      linaVoice: '¡Correcto! No podemos restar así.',
      explanation: 'Los denominadores 4 y 5 son diferentes.'
    },
    {
      id: 'sameLanguage',
      question: '¿Qué necesitamos para que las fracciones se puedan restar?',
      expectedAnswer: 'mismo denominador',
      linaVoice: '¡Excelente! Necesitamos el mismo denominador.',
      explanation: 'Ambas fracciones deben hablar el mismo idioma matemático.'
    },
    {
      id: 'findCommon',
      question: '¿Qué número es divisible por 4 y por 5?',
      expectedAnswer: '20',
      linaVoice: '¡Perfecto! 20 funciona para ambos.',
      explanation: '20 es el común denominador.'
    },
    {
      id: 'convertFirst',
      question: '¿Cómo convertimos 3/4 a veinteavos?',
      expectedAnswer: 'multiplicar por 5',
      linaVoice: '¡Muy bien! Multiplicamos por 5.',
      explanation: '3/4 = (3×5)/(4×5) = 15/20'
    },
    {
      id: 'convertSecond',
      question: '¿Y 2/5 a veinteavos?',
      expectedAnswer: 'multiplicar por 4',
      linaVoice: '¡Correcto! Multiplicamos por 4.',
      explanation: '2/5 = (2×4)/(5×4) = 8/20'
    },
    {
      id: 'finalSubtraction',
      question: '¿Cuánto es 15/20 - 8/20?',
      expectedAnswer: '7/20',
      linaVoice: '¡Genial! 15 - 8 = 7.',
      explanation: '15/20 - 8/20 = 7/20'
    },
    {
      id: 'finalAnswer',
      question: '¿Cuánto jugo le quedó a Ana?',
      expectedAnswer: '7/20 litro',
      linaVoice: '¡Perfecto! Ana le quedó 7/20 litro.',
      explanation: 'Esa es la respuesta final.'
    }
  ];

  const getCurrentSteps = () => {
    switch (mission) {
      case 1: return mission1Steps;
      case 2: return mission2Steps;
      case 3: return mission3Steps;
      default: return [];
    }
  };

  const currentSteps = getCurrentSteps();
  const currentStepData = currentSteps[step];

  const handleAnswer = () => {
    if (!currentStepData || !currentStepData.expectedAnswer) return;

    const isCorrect = Array.isArray(currentStepData.expectedAnswer)
      ? currentStepData.expectedAnswer.some(answer =>
        userAnswer.toLowerCase().includes(answer.toLowerCase())
      )
      : userAnswer.toLowerCase().includes(currentStepData.expectedAnswer.toLowerCase());

    if (isCorrect) {
      // Lina celebra
      if (currentStepData.linaVoice) {
        edgeTTS.speak(currentStepData.linaVoice, 'lina');
      }

      if (step < currentSteps.length - 1) {
        setStep(prev => prev + 1);
        setUserAnswer('');
      } else {
        // Misión completada
        if (mission < 3) {
          setMission(prev => prev + 1);
          setStep(0);
          setUserAnswer('');
        } else {
          // Todo completado
          setIsCompleted(true);
          if (onSolutionComplete) {
            onSolutionComplete({
              easyAnswer: '2/5 litro',
              hardAnswer: '7/20 litro'
            });
          }
        }
      }
    } else {
      // Respuesta incorrecta - Lina guía
      import('@/services/remediationStore').then(m => m.remediationStore.addFailureMapping('fractions'));
      edgeTTS.speak('Piensa de nuevo. Lee con atención la pregunta.', 'lina');
    }
  };

  const toggleHighlight = (type: string) => {
    setHighlightedData(prev =>
      prev.includes(type)
        ? prev.filter(d => d !== type)
        : [...prev, type]
    );
  };

  const getHighlightClass = (type: string) => {
    if (!highlightedData.includes(type)) return '';

    const colors: Record<string, string> = {
      character: 'bg-blue-200 text-blue-800',
      initial: 'bg-green-200 text-green-800',
      action: 'bg-orange-200 text-orange-800',
      amount: 'bg-purple-200 text-purple-800',
      questions: 'bg-red-200 text-red-800'
    };

    return colors[type] || 'bg-yellow-200 text-yellow-800';
  };

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto"
      >
        <LinaAvatar state="celebrating" size={150} />

        <h2 className="text-3xl font-bold text-purple-600 mt-6 mb-4">
          🏆 ¡Misión Completada!
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
            ¡Descubriste la solución usando el método Socrático!
          </p>
        </div>

        <div className="bg-purple-50 rounded-xl p-6">
          <h4 className="text-lg font-bold text-purple-800 mb-3">🧠 Las 3 Misiones:</h4>
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
              <span>Entendiste el problema</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
              <span>Supiste qué hacer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
              <span>Resolviste paso a paso</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="correct-socratic-solver p-6 max-w-4xl mx-auto">
      {/* Header de Misión */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-purple-600 mb-2">
          🕵️‍♀️ Misión {mission}: {mission === 1 ? 'Entender el Problema' : mission === 2 ? 'Entender Qué Hacer' : 'Solución Socrática'}
        </h1>

        <div className="flex justify-center gap-4 mb-4">
          {[1, 2, 3].map(m => (
            <div
              key={m}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${m === mission ? 'bg-purple-500 text-white' : m < mission ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}
            >
              {m}
            </div>
          ))}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-purple-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / currentSteps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* MISIÓN 1: Colorear Datos */}
      {mission === 1 && step === 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-blue-600 mb-4">🎨 Coloremos los Datos Importantes</h2>

          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <p className="text-lg leading-relaxed">
              <span
                className={`cursor-pointer px-2 py-1 rounded transition-all ${getHighlightClass('character')}`}
                onClick={() => toggleHighlight('character')}
              >
                👧 Ana
              </span>

              {" tenía "}

              <span
                className={`cursor-pointer px-2 py-1 rounded transition-all ${getHighlightClass('initial')}`}
                onClick={() => toggleHighlight('initial')}
              >
                🥤 3/4 de litro de jugo
              </span>

              {". Luego "}

              <span
                className={`cursor-pointer px-2 py-1 rounded transition-all ${getHighlightClass('action')}`}
                onClick={() => toggleHighlight('action')}
              >
                🥤 bebió
              </span>

              {" "}

              <span
                className={`cursor-pointer px-2 py-1 rounded transition-all ${getHighlightClass('amount')}`}
                onClick={() => toggleHighlight('amount')}
              >
                🥤 2/5 de litro
              </span>

              {". "}

              <span
                className={`cursor-pointer px-2 py-1 rounded transition-all ${getHighlightClass('questions')}`}
                onClick={() => toggleHighlight('questions')}
              >
                ❓ ¿Cuántos litros de jugo bebió en total? ¿Cuánto jugo le quedó?
              </span>
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-4">
            <LinaAvatar state="speaking" />
          </div>

          <p className="text-center text-gray-600 mb-4">
            "Haz clic en cada parte para colorear los datos importantes"
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Continuar →
            </button>
          </div>
        </motion.div>
      )}

      {/* Preguntas Socráticas */}
      {!(mission === 1 && step === 0) && (
        <motion.div
          key={`${mission}-${step}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <LinaAvatar state="thinking" size={80} />
            <div>
              <h3 className="text-xl font-bold text-purple-600">Pregunta Socrática:</h3>
              <p className="text-2xl text-gray-800">{currentStepData.question}</p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnswer()}
              placeholder="Escribe tu respuesta..."
              className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
              autoFocus
            />

            <div className="flex gap-4">
              <button
                onClick={handleAnswer}
                className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
              >
                ✅ Responder
              </button>
            </div>

            {(currentStepData as any).explanation && showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200"
              >
                <p className="text-blue-800">{(currentStepData as any).explanation}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Resumen de Datos Extraídos (Misión 1) */}
      {mission === 1 && step > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-blue-600 mb-4">📊 Datos que hemos descubierto:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-3">
              <p className="text-sm text-gray-600">Protagonista:</p>
              <p className="font-bold">Ana</p>
            </div>
            <div className="bg-white rounded-xl p-3">
              <p className="text-sm text-gray-600">Tenía:</p>
              <p className="font-bold">3/4 litro</p>
            </div>
            <div className="bg-white rounded-xl p-3">
              <p className="text-sm text-gray-600">Acción:</p>
              <p className="font-bold">Bebió</p>
            </div>
            <div className="bg-white rounded-xl p-3">
              <p className="text-sm text-gray-600">Cantidad:</p>
              <p className="font-bold">2/5 litro</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
