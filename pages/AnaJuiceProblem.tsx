import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SimpleWordProblemSolver } from '@/components/WordProblems';
import { edgeTTS } from '@/services/edgeTTS';

const AnaJuiceProblemPage: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [showSolver, setShowSolver] = useState(false);

  const problem = "Ana tenía 3/4 de litro de jugo. Luego bebió 2/5 de litro. ¿Cuántos litros de jugo beció en total? ¿Cuánto jugo le quedó?";

  const handleStart = async () => {
    // Lina's introduction
    await edgeTTS.speak("¡Excelente! Veo que tenemos un problema de Ana y su jugo. ¡Vamos a resolverlo paso a paso usando el método Socrático!", 'lina');
    setShowIntro(false);
    setShowSolver(true);
  };

  const handleSolutionComplete = (solution: any) => {
    console.log("Problem solved!", solution);
    // Could add celebration or navigation here
  };

  if (showSolver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
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

          <SimpleWordProblemSolver 
            problem={problem}
            onSolutionComplete={handleSolutionComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto text-center"
      >
        <div className="mb-6">
          <div className="w-32 h-32 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">🧠</span>
          </div>
          <h1 className="text-3xl font-bold text-purple-600 mb-4">
            Problema de Ana y su Jugo
          </h1>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-purple-800 mb-4">📚 Problema:</h2>
          <p className="text-lg text-gray-800 leading-relaxed">
            {problem}
          </p>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-blue-800 mb-4">🎯 ¿Qué haremos?</h3>
          <div className="text-left space-y-2 text-gray-700">
            <p>✅ Extraer los datos importantes del problema</p>
            <p>✅ Entender qué operación necesitamos hacer</p>
            <p>✅ Resolver paso a paso con preguntas socráticas</p>
            <p>✅ Descubrir la solución juntos</p>
          </div>
        </div>
        
        <button
          onClick={handleStart}
          className="px-8 py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-bold text-lg"
        >
          🚀 Comenzar a Resolver
        </button>
      </motion.div>
    </div>
  );
};

export default AnaJuiceProblemPage;
