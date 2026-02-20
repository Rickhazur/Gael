import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Award,
  Target,
  TrendingUp,
  Users,
  Clock,
  BookOpen,
  Zap,
  CheckCircle,
  AlertCircle,
  Medal,
  Crown,
  Flame,
  Rocket,
  Gem
} from 'lucide-react';

interface CalificationLevel {
  level: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requirements: {
    minScore: number;
    maxErrors: number;
    timeLimit: number;
    wordsRequired: number;
  };
  rewards: string[];
  privileges: string[];
}

interface UserCalification {
  currentLevel: number;
  currentScore: number;
  totalXP: number;
  streak: number;
  badges: string[];
  certificates: string[];
  nextLevelProgress: number;
  achievements: {
    total: number;
    unlocked: number;
  };
}

interface CalificationTest {
  id: string;
  title: string;
  type: 'grammar' | 'vocabulary' | 'pronunciation' | 'conversation' | 'listening' | 'reading' | 'writing';
  difficulty: number;
  questions: TestQuestion[];
  timeLimit: number;
  passingScore: number;
}

interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hints: string[];
}

interface TestResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  level: number;
  passed: boolean;
  feedback: string;
}

const CalificationSystem: React.FC = () => {
  const [userCalification, setUserCalification] = useState<UserCalification>({
    currentLevel: 1,
    currentScore: 850,
    totalXP: 2450,
    streak: 5,
    badges: ['first_conversation', 'week_warrior', 'grammar_novice'],
    certificates: ['basic_spanish'],
    nextLevelProgress: 65,
    achievements: {
      total: 25,
      unlocked: 8
    }
  });

  const [currentTest, setCurrentTest] = useState<CalificationTest | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestActive, setIsTestActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [testStartTime, setTestStartTime] = useState<number>(0);

  const calificationLevels: CalificationLevel[] = [
    {
      level: 1,
      name: 'Principiante',
      description: 'Comenzando tu viaje en el idioma',
      icon: <Star className="w-8 h-8" />,
      color: 'from-green-400 to-green-600',
      requirements: {
        minScore: 0,
        maxErrors: 10,
        timeLimit: 600,
        wordsRequired: 50
      },
      rewards: ['Acceso a conversaciones básicas', 'Certificado digital'],
      privileges: ['Participar en foros', 'Acceso a material introductorio']
    },
    {
      level: 2,
      name: 'Básico',
      description: 'Construyendo vocabulario fundamental',
      icon: <Medal className="w-8 h-8" />,
      color: 'from-blue-400 to-blue-600',
      requirements: {
        minScore: 1000,
        maxErrors: 7,
        timeLimit: 540,
        wordsRequired: 200
      },
      rewards: ['Conversaciones intermedias', 'Ejercicios de gramática'],
      privileges: ['Foros avanzados', 'Tutor personalizado']
    },
    {
      level: 3,
      name: 'Intermedio',
      description: 'Desarrollando fluidez en conversación',
      icon: <Award className="w-8 h-8" />,
      color: 'from-purple-400 to-purple-600',
      requirements: {
        minScore: 2500,
        maxErrors: 5,
        timeLimit: 480,
        wordsRequired: 500
      },
      rewards: ['Conversaciones avanzadas', 'Acceso a contenido exclusivo'],
      privileges: ['Mentoría personal', 'Eventos especiales']
    },
    {
      level: 4,
      name: 'Avanzado',
      description: 'Dominando el idioma con fluidez nativa',
      icon: <Crown className="w-8 h-8" />,
      color: 'from-orange-400 to-orange-600',
      requirements: {
        minScore: 5000,
        maxErrors: 3,
        timeLimit: 420,
        wordsRequired: 1000
      },
      rewards: ['Certificado avanzado', 'Acceso a ilimitado'],
      privileges: ['Contenido premium', 'Eventos VIP']
    },
    {
      level: 5,
      name: 'Experto',
      description: 'Nivel de dominio completo del idioma',
      icon: <Flame className="w-8 h-8" />,
      color: 'from-red-400 to-red-600',
      requirements: {
        minScore: 10000,
        maxErrors: 2,
        timeLimit: 360,
        wordsRequired: 2000
      },
      rewards: ['Certificado experto', 'Acceso ilimitado'],
      privileges: ['Mentoría de élite', 'Contenido exclusivo']
    },
    {
      level: 6,
      name: 'Maestro',
      description: 'Nivel más alto de dominio del idioma',
      icon: <Rocket className="w-8 h-8" />,
      color: 'from-yellow-400 to-yellow-600',
      requirements: {
        minScore: 20000,
        maxErrors: 1,
        timeLimit: 300,
        wordsRequired: 5000
      },
      rewards: ['Certificado maestro', 'Acceso ilimitado'],
      privileges: ['Contenido exclusivo', 'Mentoría premium']
    },
    {
      level: 7,
      name: 'Leyenda',
      description: 'Nivel legendario de dominio absoluto',
      icon: <Gem className="w-8 h-8" />,
      color: 'from-purple-400 to-pink-600',
      requirements: {
        minScore: 50000,
        maxErrors: 0,
        timeLimit: 240,
        wordsRequired: 10000
      },
      rewards: ['Certificado legendario', 'Acceso ilimitado'],
      privileges: ['Contenido exclusivo', 'Mentoría VIP']
    },
    {
      level: 8,
      name: 'Inmortal',
      description: 'Dominio absoluto y maestría del idioma',
      icon: <Trophy className="w-8 h-8" />,
      color: 'from-indigo-400 to-indigo-600',
      requirements: {
        minScore: 100000,
        maxErrors: 0,
        timeLimit: 180,
        wordsRequired: 20000
      },
      rewards: ['Certificado inmortal', 'Acceso ilimitado'],
      privileges: ['Contenido exclusivo', 'Mentoría premium', 'Eventos especiales']
    },
    {
      level: 9,
      name: 'Dios',
      description: 'Dominio divino del idioma',
      icon: <Crown className="w-8 h-8" />,
      color: 'from-yellow-400 to-amber-600',
      requirements: {
        minScore: 250000,
        maxErrors: 0,
        timeLimit: 120,
        wordsRequired: 50000
      },
      rewards: ['Certificado divino', 'Acceso ilimitado'],
      privileges: ['Contenido exclusivo', 'Mentoría premium', 'Eventos VIP']
    },
    {
      level: 10,
      name: 'Supremo',
      description: 'El nivel más alto posible de dominio',
      icon: <Flame className="w-8 h-8" />,
      color: 'from-red-600 to-pink-600',
      requirements: {
        minScore: 500000,
        maxErrors: 0,
        timeLimit: 60,
        wordsRequired: 100000
      },
      rewards: ['Certificado supremo', 'Acceso ilimitado'],
      privileges: ['Contenido exclusivo', 'Mentoría premium', 'Eventos VIP']
    }
  ];

  const availableTests: CalificationTest[] = [
    {
      id: 'grammar_basic',
      title: 'Test de Gramática Básica',
      type: 'grammar',
      difficulty: 1,
      questions: [
        {
          id: 'q1',
          question: '¿Cuál es el verbo "to be" en presente simple para "yo"?',
          options: ['am', 'is', 'are', 'be'],
          correctAnswer: 1,
          explanation: 'El verbo "to be" en presente simple para "yo" es "am"',
          hints: ['Piensa en la forma "I am"', 'Es el verbo más básico']
        },
        {
          id: 'q2',
          question: '¿Cuál es el plural de "book"?',
          options: ['books', 'bookes', 'book', 'bookies'],
          correctAnswer: 0,
          explanation: 'El plural de "book" es "books"',
          hints: ['Añade "s" a sustantivos regulares', 'Es una regla básica']
        },
        {
          id: 'q3',
          question: '¿Cuál es el pasado de "go"?',
          options: ['went', 'goed', 'gone', 'going'],
          correctAnswer: 0,
          explanation: 'El pasado de "go" es "went"',
          hints: ['Es un verbo irregular', 'Go -> went -> gone']
        }
      ],
      timeLimit: 300,
      passingScore: 60
    },
    {
      id: 'vocabulary_intermediate',
      title: 'Test de Vocabulario Intermedio',
      type: 'vocabulary',
      difficulty: 3,
      questions: [
        {
          id: 'q1',
          question: '¿Qué significa "ubiquitous"?',
          options: ['En todas partes', 'Ocasional', 'Raro', 'Común'],
          correctAnswer: 0,
          explanation: '"Ubiquitous" significa "en todas partes"',
          hints: ['Piensa en palabras avanzadas', 'Es un sinónimo de "everywhere"']
        },
        {
          id: 'q2',
          question: '¿Cuál es el sinónimo de "ephemeral"?',
          options: ['Temporal', 'Permanente', 'Eterno', 'Inmediato'],
          correctAnswer: 0,
          explanation: '"Ephemeral" significa "temporal"',
          hints: ['Piensa en palabras que duran poco tiempo', 'Es lo opuesto de "permanent"']
        },
        {
          id: 'q3',
          question: '¿Qué significa "meticulous"?',
          options: ['Descuidado', 'Cuidadoso', 'Exacto', 'Rápido'],
          correctAnswer: 2,
          explanation: '"Meticulous" significa "muy cuidadoso o exacto"',
          hints: ['Piensa en atención al detalle', 'Es una palabra positiva']
        }
      ],
      timeLimit: 240,
      passingScore: 70
    },
    {
      id: 'pronunciation_advanced',
      title: 'Test de Pronunciación Avanzada',
      type: 'pronunciation',
      difficulty: 4,
      questions: [
        {
          id: 'q1',
          question: '¿Cómo se pronuncia "thorough"?',
          options: ['zoro', 'zoro', 'zoro', 'zoro'],
          correctAnswer: 0,
          explanation: 'Se pronuncia "zoro" (sonido "th")',
          hints: ['El sonido "th" en inglés', 'Es un sonido difícil']
        },
        {
          id: 'q2',
          question: '¿Cuál palabra tiene el sonido "ʃ"?',
          options: ['ship', 'shop', 'sheep', 'shape'],
          correctAnswer: 2,
          explanation: 'La palabra "sheep" tiene el sonido "ʃ"',
          hints: ['Es un sonido único del inglés', 'Piensa en el sonido de las ovejas']
        }
      ],
      timeLimit: 180,
      passingScore: 80
    }
  ];

  const getCurrentLevel = () => {
    return calificationLevels.find(level => level.level === userCalification.currentLevel) || calificationLevels[0];
  };

  const startTest = (test: CalificationTest) => {
    setCurrentTest(test);
    setIsTestActive(true);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setTestStartTime(Date.now());
  };

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const finishTest = () => {
    if (!currentTest) return;

    const correctAnswers = selectedAnswers.filter((answer, index) =>
      answer === currentTest.questions[index].correctAnswer
    ).length;

    const score = Math.round((correctAnswers / currentTest.questions.length) * 100);
    const timeTaken = Math.round((Date.now() - testStartTime) / 1000);
    const passed = score >= currentTest.passingScore;

    const result: TestResult = {
      score,
      totalQuestions: currentTest.questions.length,
      correctAnswers,
      timeTaken,
      level: userCalification.currentLevel,
      passed,
      feedback: passed
        ? '¡Excelente! Has aprobado el test.'
        : `Necesitas ${currentTest.passingScore - score}% más para aprobar. ¡Sigue practicando!`
    };

    setTestResults(prev => [...prev, result]);
    setIsTestActive(false);
    setCurrentTest(null);

    // Update user calification
    if (passed) {
      const xpGained = score * 10;
      const newTotalXP = userCalification.totalXP + xpGained;
      const newLevelProgress = userCalification.nextLevelProgress + (score / currentTest.passingScore) * 10;

      setUserCalification(prev => ({
        ...prev,
        totalXP: newTotalXP,
        nextLevelProgress: Math.min(newLevelProgress, 100)
      }));

      // Check level up
      const currentLevelData = getCurrentLevel();
      if (newTotalXP >= currentLevelData.requirements.minScore) {
        const nextLevel = Math.min(userCalification.currentLevel + 1, 10);
        setUserCalification(prev => ({
          ...prev,
          currentLevel: nextLevel
        }));
      }
    }
  };

  const currentLevel = getCurrentLevel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
            Sistema de Calificación 1-10
          </h1>
          <p className="text-xl text-gray-600">
            Evalúa tu progreso y sube de nivel
          </p>
        </motion.div>

        {!isTestActive ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tu Progreso</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Nivel Actual</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-12 h-12 bg-gradient-to-r ${currentLevel.color} rounded-full flex items-center justify-center`}>
                      {currentLevel.icon}
                    </div>
                    <span className="text-lg font-bold text-gray-800">{currentLevel.name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Puntuación</span>
                  <span className="text-2xl font-bold text-blue-600">{userCalification.currentScore}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">XP Total</span>
                  <span className="text-lg font-bold text-purple-600">{userCalification.totalXP.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Racha</span>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="text-lg font-bold text-orange-600">{userCalification.streak} días</span>
                  </div>
                </div>
              </div>

              {/* Progress to Next Level */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progreso Nivel {userCalification.currentLevel + 1}</span>
                  <span className="font-medium text-gray-800">{userCalification.nextLevelProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <motion.div
                    className={`h-4 rounded-full bg-gradient-to-r ${currentLevel.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${userCalification.nextLevelProgress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Current Level Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                {currentLevel.icon}
                <span className="ml-3">Nivel {currentLevel.level}: {currentLevel.name}</span>
              </h2>

              <p className="text-gray-600 mb-4">{currentLevel.description}</p>

              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Requisitos</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Puntuación mínima:</span>
                      <span className="font-medium text-gray-800">{currentLevel.requirements.minScore.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Errores máximos:</span>
                      <span className="font-medium text-gray-800">{currentLevel.requirements.maxErrors}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tiempo límite:</span>
                      <span className="font-medium text-gray-800">{currentLevel.requirements.timeLimit}s</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Palabras requeridas:</span>
                      <span className="font-medium text-gray-800">{currentLevel.requirements.wordsRequired.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Recompensas</h3>
                  <div className="space-y-1">
                    {currentLevel.rewards.map((reward, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">{reward}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Privilegios</h3>
                  <div className="space-y-1">
                    {currentLevel.privileges.map((privilege, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-700">{privilege}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Available Tests */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tests Disponibles</h2>

              <div className="space-y-3">
                {availableTests.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                    onClick={() => startTest(test)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800">{test.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {test.type}
                        </span>
                        <span className="text-sm text-gray-600">
                          Dificultad: {test.difficulty}/10
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{test.questions.length} preguntas</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Tiempo límite: {test.timeLimit}s</span>
                      <span>Aprobado con: {test.passingScore}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4">Resultados de Tests</h2>

                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border rounded-xl p-4 ${result.passed
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800">
                          Test {index + 1}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${result.passed
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                          }`}>
                          {result.passed ? 'APROBADO' : 'REPROBADO'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div>
                          <span className="text-gray-600">Puntuación:</span>
                          <span className={`font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {result.score}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Correctas:</span>
                          <span className="font-bold text-gray-800">
                            {result.correctAnswers}/{result.totalQuestions}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Tiempo:</span>
                          <span className="font-bold text-gray-800">{result.timeTaken}s</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Nivel:</span>
                          <span className="font-bold text-gray-800">{result.level}</span>
                        </div>
                      </div>
                      <p className={`text-sm ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {result.feedback}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* Active Test */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-blue-500" />
                  {currentTest?.title}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Pregunta {currentQuestion + 1} de {currentTest?.questions.length}
                  </span>
                  <span className="text-sm text-gray-600">
                    Tiempo: {Math.round((Date.now() - testStartTime) / 1000)}s
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <motion.div
                  className="bg-blue-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / currentTest!.questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {currentTest?.questions[currentQuestion].question}
              </h3>

              <div className="space-y-3">
                {currentTest?.questions[currentQuestion].options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleAnswer(currentQuestion, index)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedAnswers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${selectedAnswers[currentQuestion] === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                        }`}>
                        {selectedAnswers[currentQuestion] === index && (
                          <div className="w-2 h-2 bg-white rounded-full mt-1"></div>
                        )}
                      </div>
                      <span className="text-gray-800">{option}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  if (currentQuestion > 0) {
                    setCurrentQuestion(currentQuestion - 1);
                    const newAnswers = [...selectedAnswers];
                    newAnswers[currentQuestion - 1] = -1;
                    setSelectedAnswers(newAnswers);
                  }
                }}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>

              <button
                onClick={finishTest}
                disabled={selectedAnswers.length !== currentTest?.questions.length}
                className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Finalizar Test
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CalificationSystem;
