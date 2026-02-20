import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SocraticWordProblemSolver } from './SocraticWordProblemSolver';
import { BookOpen, Brain, Target, Trophy, PenTool, ArrowRight } from 'lucide-react';

interface WordProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'fractions' | 'decimals' | 'percentages' | 'ratios';
  problem: string;
}

export const WordProblemHub: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<WordProblem | null>(null);
  const [showSolver, setShowSolver] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customProblemText, setCustomProblemText] = useState('');

  const wordProblems: WordProblem[] = [
    {
      id: 'ana-juice',
      title: 'El Misterio del Jugo de Ana',
      description: 'Ana tenía jugo y bebió parte de él. ¿Cuánto le queda?',
      difficulty: 'medium',
      category: 'fractions',
      problem: 'Ana tenía 3/4 de litro de jugo. Luego bebió 2/5 de litro. ¿Cuántos litros de jugo bebió en total? ¿Cuánto jugo le quedó?'
    },
    {
      id: 'pizza-party',
      title: 'La Fiesta de Pizza',
      description: 'Carlos compartió pizza con sus amigos. ¿Cuánto le quedó?',
      difficulty: 'easy',
      category: 'fractions',
      problem: 'Carlos tenía 1/2 de pizza y le dio 1/4 a su amigo. ¿Cuánta pizza le quedó?'
    },
    {
      id: 'chocolate-bar',
      title: 'La Tableta de Chocolate',
      description: 'María partió su chocolate. ¿Cuánto comió?',
      difficulty: 'medium',
      category: 'fractions',
      problem: 'María tenía 3/5 de tableta de chocolate. Comió 1/3. ¿Cuánto chocolate le quedó?'
    },
    {
      id: 'water-tank',
      title: 'El Tanque de Agua',
      description: 'Un tanque tenía agua y se usó parte. ¿Cuánto queda?',
      difficulty: 'hard',
      category: 'fractions',
      problem: 'Un tanque estaba lleno hasta 7/8 de su capacidad. Se usaron 3/4 del agua. ¿Qué fracción del tanque queda con agua?'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fractions': return '🔢';
      case 'decimals': return '🔟';
      case 'percentages': return '📊';
      case 'ratios': return '⚖️';
      default: return '📚';
    }
  };

  const handleProblemSelect = (problem: WordProblem) => {
    setSelectedProblem(problem);
    setShowSolver(true);
  };

  const handleBackToHub = () => {
    setShowSolver(false);
    setSelectedProblem(null);
    setIsCustomMode(false);
  };

  const handleSolutionComplete = (solution: any) => {
    console.log('Solution completed:', solution);
    if (solution.completed) {
      setTimeout(() => handleBackToHub(), 500);
    }
  };

  if (showSolver && (selectedProblem || isCustomMode)) {
    return (
      <div className="word-problem-solver-container p-4">
        <div className="mb-6 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackToHub}
            className="px-6 py-3 bg-white shadow-xl rounded-2xl text-purple-600 font-black text-xs uppercase tracking-widest border-2 border-purple-100 flex items-center gap-3"
          >
            ← Regresar al Centro
          </motion.button>

          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {isCustomMode ? 'Desafío Personalizado' : selectedProblem?.title}
            </h2>
            <p className="text-slate-400 font-medium">Lina te guiará paso a paso</p>
          </div>

          <div className="w-32"></div>
        </div>

        <SocraticWordProblemSolver
          problem={isCustomMode ? customProblemText : selectedProblem!.problem}
          onSolutionComplete={handleSolutionComplete}
        />
      </div>
    );
  }

  return (
    <div className="word-problem-hub p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-purple-600 mb-4 flex items-center justify-center gap-3">
          <Brain className="w-10 h-10" />
          Centro de Word Problems
        </h1>
        <p className="text-xl text-gray-600">
          Resuelve problemas usando el Método Socrático con Lina
        </p>

        <div className="flex justify-center gap-8 mt-6">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span className="text-gray-700">Exploración Interactiva</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            <span className="text-gray-700">Método Socrático</span>
          </div>
        </div>
      </motion.div>

      {/* --- CUSTOM PROBLEM INPUT --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-12 bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-purple-900/5 border-4 border-purple-50"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-lg">
            <PenTool size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">¿Tienes un problema propio?</h3>
            <p className="text-sm text-slate-400 font-medium">Escribe tu problema y Lina te ayudará a resolverlo.</p>
          </div>
        </div>

        <div className="relative group">
          <textarea
            value={customProblemText}
            onChange={(e) => setCustomProblemText(e.target.value)}
            placeholder="Ej: Juan tenía 10 manzanas, le dio 3 a María y luego compró 5 más..."
            className="w-full h-32 p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 text-lg font-medium text-slate-900 focus:border-purple-500 focus:bg-white transition-all outline-none resize-none"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={customProblemText.trim().length < 10}
            onClick={() => {
              setIsCustomMode(true);
              setShowSolver(true);
            }}
            className="absolute bottom-4 right-4 px-8 py-3 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50 disabled:grayscale hover:bg-purple-500 transition-all flex items-center gap-2"
          >
            Analizar Problema <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.div>

      {/* Problem Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wordProblems.map((problem, index) => (
          <motion.div
            key={problem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleProblemSelect(problem)}
            className="problem-card bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">
                {getCategoryIcon(problem.category)}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty === 'easy' ? 'Fácil' : problem.difficulty === 'medium' ? 'Medio' : 'Difícil'}
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {problem.title}
            </h3>

            <p className="text-gray-600 text-sm mb-4">
              {problem.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Categoría: {problem.category === 'fractions' ? 'Fracciones' :
                  problem.category === 'decimals' ? 'Decimales' :
                    problem.category === 'percentages' ? 'Porcentajes' : 'Razones'}
              </div>

              <motion.div
                className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Resolver →
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Methodology Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8"
      >
        <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">
          🎓 Nuestra Metodología Socrática
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Extraer Datos</h3>
            <p className="text-gray-600 text-sm">
              Lina te hace preguntas para descubrir los datos importantes del problema
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Entender Qué Hacer</h3>
            <p className="text-gray-600 text-sm">
              Descubres qué operación necesitas mediante razonamiento guiado
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Solución Socrática</h3>
            <p className="text-gray-600 text-sm">
              Encuentras la respuesta por ti mismo con preguntas socráticas
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
