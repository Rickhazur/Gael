import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SocraticWordProblemSolver } from './SocraticWordProblemSolver';
import { Search, Brain, Target, BookOpen, ArrowRight, Grid, Layout, PenTool } from 'lucide-react';
import { normalizePastedFractions } from '@/utils/normalizePastedFractions';
import { MathTutorBoard } from '../MathMaestro/tutor/MathTutorBoard';
import { parseMathProblem } from '@/services/mathValidator';

interface WordProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'enteros' | 'racionales' | 'operaciones_racionales' | 'potenciacion' | 'proporcionalidad' | 'geometria' | 'algebra' | 'estadistica';
  problem: string;
}

interface WordProblemHubProps {
  gradeLevel?: number;
}

export const WordProblemHub: React.FC<WordProblemHubProps> = ({ gradeLevel = 3 }) => {
  const [selectedProblem, setSelectedProblem] = useState<WordProblem | null>(null);
  const [showSolver, setShowSolver] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isMathOpMode, setIsMathOpMode] = useState(false);
  const [customProblemText, setCustomProblemText] = useState('');

  const wordProblems: WordProblem[] = [
    {
      id: 'enteros-1',
      title: 'El termómetro loco',
      description: 'Suma y resta de números enteros (temperaturas).',
      difficulty: 'easy',
      category: 'enteros',
      problem: 'Si la temperatura ayer era de −5°C y hoy subió 8°C, ¿cuál es la nueva temperatura?'
    },
    {
      id: 'racionales-1',
      title: 'El Duelo de Fracciones',
      description: 'Comparación entre fracciones y decimales.',
      difficulty: 'medium',
      category: 'racionales',
      problem: 'María se comió 3/5 de una pizza y Juan se comió el 0.62 de otra pizza del mismo tamaño. ¿Quién comió más?'
    },
    {
      id: 'operaciones-1',
      title: 'Construyendo el Puente',
      description: 'Suma de fracciones con diferente denominador.',
      difficulty: 'medium',
      category: 'operaciones_racionales',
      problem: 'Un obrero instaló 3/4 de metro de tubería en la mañana y 5/8 de metro en la tarde. ¿Cuántos metros de tubería instaló en total?'
    },
    {
      id: 'potenciacion-1',
      title: 'El Cuadrado Misterioso',
      description: 'Conceptos de radicación y potenciación.',
      difficulty: 'hard',
      category: 'potenciacion',
      problem: 'El profesor escribió en la pizarra una ecuación misteriosa: x² = 64. ¿Cuáles serían los posibles valores de x que hacen que la ecuación sea correcta?'
    },
    {
      id: 'proporcionalidad-1',
      title: 'Compras Escolares',
      description: 'Regla de tres simple y proporcionalidad directa.',
      difficulty: 'easy',
      category: 'proporcionalidad',
      problem: 'En la papelería, 3 cuadernos cuestan $12. Si necesitas comprar 5 cuadernos idénticos, ¿cuánto dinero tendrás que pagar en total?'
    },
    {
      id: 'geometria-1',
      title: 'El Cerco del Jardín',
      description: 'Cálculo de perímetro de figuras geométricas.',
      difficulty: 'medium',
      category: 'geometria',
      problem: 'Andrés quiere poner una pequeña cerca alrededor de un jardín en forma de triángulo. Los lados del jardín miden 6 m, 8 m y 10 m. ¿Cuántos metros de cerca necesita en total?'
    },
    {
      id: 'algebra-1',
      title: 'El Acertijo Algebraico',
      description: 'Modelado y resolución de ecuaciones de primer grado.',
      difficulty: 'hard',
      category: 'algebra',
      problem: 'El doble de un número misterioso, restándole 5, da como resultado 13. ¿Cuál es ese número misterioso?'
    },
    {
      id: 'estadistica-1',
      title: 'Las Monedas de la Suerte',
      description: 'Conceptos de probabilidad simple.',
      difficulty: 'easy',
      category: 'estadistica',
      problem: 'Si echas a rodar un dado normal de 6 caras, ¿cuál es la probabilidad de sacar un número que sea mayor que 4?'
    }
  ];

  // Filter problems based on gradeLevel (simple heuristic for MVP)
  const filteredProblems = wordProblems.filter(p => {
    if (gradeLevel <= 2) return p.difficulty === 'easy' && ['enteros', 'proporcionalidad'].includes(p.category);
    if (gradeLevel === 3 || gradeLevel === 4) return p.difficulty !== 'hard' && !['algebra', 'estadistica'].includes(p.category);
    return true; // 5th grade and above see everything
  });

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
      case 'enteros': return '🌡️';
      case 'racionales': return '🍰';
      case 'operaciones_racionales': return '➕';
      case 'potenciacion': return '🚀';
      case 'proporcionalidad': return '⚖️';
      case 'geometria': return '📐';
      case 'algebra': return '🧮';
      case 'estadistica': return '📊';
      default: return '📚';
    }
  };

  const getCategoryName = (cat: string) => {
    const names: Record<string, string> = {
      enteros: 'N. Enteros',
      racionales: 'N. Racionales',
      operaciones_racionales: 'Operaciones',
      potenciacion: 'Potenciación',
      proporcionalidad: 'Proporciones',
      geometria: 'Geometría',
      algebra: 'Álgebra',
      estadistica: 'Estadística'
    };
    return names[cat] || cat;
  };

  const handleProblemSelect = (problem: WordProblem) => {
    // 🧠 INTELLIGENT ROUTING
    // If it looks like a direct operation or is "Grade 1" (which the user stressed before),
    // we prioritize the Interactive Whiteboard (MathTutorBoard).
    const mathKeywords = /sumar|restar|multiplicar|dividir|add|subtract|multiply|divide|total|más|menos|\+|\-|\*|\/|x|÷|=/i;
    const hasLargeNumbers = /\d{3,}/.test(problem.problem); // 100 or more

    // Check if it's primarily an operation (few words or matches simple pattern)
    const isOperationHeavy = problem.category.includes('operaciones') ||
      (hasLargeNumbers && mathKeywords.test(problem.problem)) ||
      (problem.problem.length < 60 && mathKeywords.test(problem.problem));

    if (gradeLevel <= 1 || isOperationHeavy) {
      // Direct to Interactive Whiteboard
      setIsCustomMode(true);
      setIsMathOpMode(true);
      setCustomProblemText(problem.problem);
    } else {
      // Use Socratic Word Problem Solver
      setSelectedProblem(problem);
      setIsMathOpMode(false);
    }
    setShowSolver(true);
  };

  const handleBackToHub = () => {
    setShowSolver(false);
    setSelectedProblem(null);
    setIsCustomMode(false);
    setIsMathOpMode(false);
  };

  const handleSolutionComplete = (solution: any) => {
    console.log('Solution completed:', solution);
    if (solution.completed) {
      setTimeout(() => handleBackToHub(), 500);
    }
  };

  if (showSolver && (selectedProblem || isCustomMode)) {
    return (
      <div className={isMathOpMode ? "w-full h-full" : "word-problem-solver-container p-4"}>
        {!isMathOpMode && (
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
        )}

        {isMathOpMode ? (
          <MathTutorBoard initialGrade={gradeLevel} userName="Estudiante" onNavigate={handleBackToHub as any} initialProblem={isCustomMode ? customProblemText : selectedProblem?.problem} />
        ) : (
          <SocraticWordProblemSolver
            problem={isCustomMode ? customProblemText : selectedProblem!.problem}
            onSolutionComplete={handleSolutionComplete}
            gradeLevel={gradeLevel}
          />
        )}

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
          Centro de Matemáticas
        </h1>
        <p className="text-xl text-gray-600">
          Resuelve problemas o realiza operaciones matemáticas con Lina
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
            <h3 className="text-xl font-black text-slate-900">¿Qué quieres resolver hoy?</h3>
            <p className="text-sm text-slate-400 font-medium">Escribe una operación (ej: 25+14) o un problema con texto, y Lina te ayudará a resolverlo paso a paso.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <textarea
            value={customProblemText}
            onChange={(e) => {
              const rawText = e.target.value;
              const normalized = normalizePastedFractions(rawText);
              setCustomProblemText(normalized);
            }}
            placeholder="Ej: 25 + 40, o Juan tenía 10 manzanas, le dio 3 a María..."
            className="w-full h-32 p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 text-lg font-medium text-slate-900 focus:border-purple-500 focus:bg-white transition-all outline-none resize-none"
          />
          <div className="flex flex-col gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={customProblemText.trim().length < 2}
              onClick={() => {
                setIsCustomMode(true);
                setIsMathOpMode(false);
                setShowSolver(true);
              }}
              className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50 hover:bg-purple-500 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              Guía Socrática <BookOpen size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={customProblemText.trim().length < 2}
              onClick={() => {
                setIsCustomMode(true);
                setIsMathOpMode(true);
                setShowSolver(true);
              }}
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50 hover:bg-blue-500 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              Pizarra (Tutor) <PenTool size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Problem Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProblems.map((problem, index) => (
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
              <div className={`px - 3 py - 1 rounded - full text - xs font - medium border ${getDifficultyColor(problem.difficulty)} `}>
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
              <div className="text-xs text-purple-700 bg-purple-100 px-3 py-1 rounded-full font-bold">
                Categoría: {getCategoryName(problem.category)}
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
