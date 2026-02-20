import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LinaAvatar } from '@/components/MathMaestro/tutor/LinaAvatar';
import { edgeTTS } from '@/services/edgeTTS';

const SocraticDemoPage: React.FC = () => {
  const [mission, setMission] = useState(1);
  const [step, setStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const problem = "Ana tenía 3/4 de litro de jugo. Luego bebió 2/5 de litro. ¿Cuántos litros de jugo bebió en total? ¿Cuánto jugo le quedó?";

  // MISIÓN 1: Entender el problema
  const mission1Questions = [
    { question: "¿Quién es la protagonista?", answer: "ana", voice: "¡Correcto! Ana es nuestra protagonista." },
    { question: "¿Cuánto jugo tenía Ana?", answer: "3/4", voice: "¡Excelente! Ana tenía 3/4 de litro." },
    { question: "¿Qué hizo Ana?", answer: "bebió", voice: "¡Perfecto! Ana bebió jugo." },
    { question: "¿Cuánto bebió?", answer: "2/5", voice: "¡Muy bien! Ana bebió 2/5 litro." }
  ];

  // MISIÓN 2: Entender qué hacer
  const mission2Questions = [
    { question: "¿Cuánto bebió Ana en total?", answer: "2/5", voice: "¡Correcto! El problema dice directamente 2/5 litro." },
    { question: "Si bebió jugo, ¿le queda más o menos?", answer: "menos", voice: "¡Exacto! Si bebe, le queda menos." },
    { question: "¿Qué operación hacemos?", answer: "resta", voice: "¡Perfecto! Cuando algo disminuye, restamos." }
  ];

  // MISIÓN 3: Solución
  const mission3Questions = [
    { question: "¿Qué operacion hacemos?", answer: "3/4 - 2/5", voice: "¡Exacto! Restamos 3/4 menos 2/5." },
    { question: "¿Podemos restar así directamente?", answer: "no", voice: "¡Correcto! Los denominadores son diferentes." },
    { question: "¿Qué necesitamos?", answer: "mismo denominador", voice: "¡Excelente! Necesitamos el mismo denominador." },
    { question: "¿Qué número funciona para 4 y 5?", answer: "20", voice: "¡Perfecto! 20 es el común denominador." },
    { question: "¿Cuánto es 3/4 en veinteavos?", answer: "15/20", voice: "¡Muy bien! 3×5=15, 4×5=20." },
    { question: "¿Y 2/5 en veinteavos?", answer: "8/20", voice: "¡Correcto! 2×4=8, 5×4=20." },
    { question: "¿Cuánto es 15/20 - 8/20?", answer: "7/20", voice: "¡Genial! 15-8=7, entonces 7/20." }
  ];

  const getCurrentQuestions = () => {
    switch (mission) {
      case 1: return mission1Questions;
      case 2: return mission2Questions;
      case 3: return mission3Questions;
      default: return [];
    }
  };

  const currentQuestions = getCurrentQuestions();
  const currentQuestion = currentQuestions[step];

  const handleAnswer = () => {
    const isCorrect = userAnswer.toLowerCase().includes(currentQuestion.answer.toLowerCase());
    
    if (isCorrect) {
      edgeTTS.speak(currentQuestion.voice, 'lina');
      
      if (step < currentQuestions.length - 1) {
        setStep(prev => prev + 1);
        setUserAnswer('');
      } else {
        if (mission < 3) {
          setMission(prev => prev + 1);
          setStep(0);
          setUserAnswer('');
        } else {
          setIsCompleted(true);
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

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto text-center"
        >
          <LinaAvatar state="celebrating" size={150} />
          
          <h1 className="text-4xl font-bold text-purple-600 mt-6 mb-4">
            🏆 ¡Misión Completada!
          </h1>
          
          <div className="bg-green-50 rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-green-800 mb-4">✅ Solución Encontrada:</h2>
            <p className="text-xl text-gray-700 mb-2">
              📊 Ana bebió: <strong>2/5 litro</strong>
            </p>
            <p className="text-xl text-gray-700 mb-4">
              📊 Ana le quedó: <strong>7/20 litro</strong>
            </p>
            <p className="text-green-600 font-medium text-lg">
              ¡Descubriste la solución usando el método Socrático!
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-purple-800 mb-4">🧠 Las 3 Misiones Completadas:</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
                <span className="text-lg">Entendiste el problema completamente</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
                <span className="text-lg">Supiste exactamente qué hacer</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
                <span className="text-lg">Resolviste el problema paso a paso</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              setMission(1);
              setStep(0);
              setUserAnswer('');
              setIsCompleted(false);
            }}
            className="mt-6 px-8 py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors text-lg font-bold"
          >
            Resolver Otro Problema
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-purple-600 mb-2">
            🕵️‍♀️ Misión {mission}: {mission === 1 ? 'Entender el Problema' : mission === 2 ? 'Entender Qué Hacer' : 'Solución Socrática'}
          </h1>
          
          <div className="flex justify-center gap-4 mb-4">
            {[1, 2, 3].map(m => (
              <div
                key={m}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  m === mission ? 'bg-purple-500 text-white' : m < mission ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {m}
              </div>
            ))}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto">
            <motion.div
              className="bg-purple-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / currentQuestions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
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

        {/* Pregunta Actual */}
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
              <p className="text-2xl text-gray-800">{currentQuestion.question}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu respuesta..."
              className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
              autoFocus
            />
            
            <button
              onClick={handleAnswer}
              className="w-full px-6 py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors text-lg font-bold"
            >
              ✅ Responder
            </button>
          </div>
        </motion.div>

        {/* Progreso */}
        <div className="text-center text-gray-600">
          <p>Paso {step + 1} de {currentQuestions.length} - Misión {mission} de 3</p>
        </div>
      </div>
    </div>
  );
};

export default SocraticDemoPage;
