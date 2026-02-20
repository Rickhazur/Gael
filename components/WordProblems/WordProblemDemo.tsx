import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SocraticWordProblemSolver } from './SocraticWordProblemSolver';
import { Play, Settings, BookOpen, Brain } from 'lucide-react';

export const WordProblemDemo: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [currentStep, setCurrentStep] = useState('intro');

  const anaJuiceProblem = 'Ana tenía 3/4 de litro de jugo. Luego bebió 2/5 de litro. ¿Cuántos litros de jugo bebió en total? ¿Cuánto jugo le quedó?';

  const handleStartDemo = () => {
    setShowDemo(true);
    setCurrentStep('solver');
  };

  const handleSolutionComplete = (solution: any) => {
    console.log('Demo solution completed:', solution);
    setCurrentStep('completed');
  };

  if (showDemo && currentStep === 'solver') {
    return (
      <div className="word-problem-demo min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Demo Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-800">Demo: Método Socrático</h1>
                  <p className="text-slate-600">Resolviendo el problema de Ana y su jugo</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDemo(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cerrar Demo
              </motion.button>
            </div>
          </motion.div>

          {/* Problem Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-purple-600 mb-4">📚 Problema a Resolver:</h2>
            <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-200">
              <p className="text-lg text-gray-800 leading-relaxed">
                {anaJuiceProblem}
              </p>
            </div>
          </motion.div>

          {/* Socratic Solver */}
          <SocraticWordProblemSolver
            problem={anaJuiceProblem}
            onSolutionComplete={handleSolutionComplete}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'completed') {
    return (
      <div className="word-problem-demo-completed min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-purple-600 mb-4">¡Demo Completado!</h1>
          
          <div className="bg-green-50 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-green-800 mb-4">✅ Solución Descubierta:</h2>
            <p className="text-gray-700 mb-2">📊 Ana bebió: <strong>2/5 litro</strong></p>
            <p className="text-gray-700 mb-4">📊 Ana le quedó: <strong>7/20 litro</strong></p>
            <p className="text-green-600 font-medium">¡Descubriste la solución usando el método Socrático!</p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentStep('intro');
                setShowDemo(false);
              }}
              className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
            >
              Repetir Demo
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDemo(false)}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="word-problem-demo-intro min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-black text-purple-600 mb-4">
            Demo: Método Socrático para Word Problems
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            Descubre cómo Lina enseña a resolver problemas de matemáticas usando preguntas socráticas
          </p>
        </div>

        {/* Problem Preview */}
        <div className="bg-purple-50 rounded-2xl p-6 mb-8 border-2 border-purple-200">
          <h2 className="text-xl font-bold text-purple-600 mb-4">📚 Problema de Ejemplo:</h2>
          <p className="text-lg text-gray-800 leading-relaxed text-center">
            {anaJuiceProblem}
          </p>
        </div>

        {/* Methodology Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">🔍 Extraer Datos</h3>
            <p className="text-gray-600 text-sm">
              Lina hace preguntas para identificar los datos importantes del problema
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">🎯 Entender Qué Hacer</h3>
            <p className="text-gray-600 text-sm">
              Descubres qué operación necesitas mediante razonamiento guiado
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">🧠 Solución Socrática</h3>
            <p className="text-gray-600 text-sm">
              Encuentras la respuesta por ti mismo con preguntas socráticas
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">✨ Características del Sistema:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-gray-700">Aprendizaje profundo y duradero</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-700">Adaptación individual al ritmo</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700">Desarrollo del pensamiento crítico</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-gray-700">Gamificación y motivación</span>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartDemo}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg"
          >
            🚀 Iniciar Demo Interactiva
          </motion.button>
          
          <p className="text-gray-500 text-sm mt-4">
            Duración estimada: 15-20 minutos
          </p>
        </div>
      </motion.div>
    </div>
  );
};
