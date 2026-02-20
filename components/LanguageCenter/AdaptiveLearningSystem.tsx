import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  BookOpen, 
  Target, 
  Trophy, 
  Star, 
  Zap, 
  Users, 
  Clock, 
  Award, 
  TrendingUp, 
  Brain, 
  Sparkles, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Headphones, 
  Mic, 
  Volume2
} from 'lucide-react';
import { edgeTTS } from '@/services/edgeTTS';

interface LearningLevel {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  requirements: {
    minScore: number;
    maxScore: number;
    vocabulary: number;
    grammar: number;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
  objectives: string[];
  duration: string;
  skills: string[];
}

interface AdaptiveActivity {
  id: string;
  title: string;
  type: 'vocabulary' | 'grammar' | 'speaking' | 'listening' | 'reading' | 'writing' | 'conversation' | 'game';
  level: string;
  difficulty: number;
  duration: number;
  description: string;
  objectives: string[];
  materials: string[];
  instructions: string[];
  assessment: {
    type: string;
    criteria: string[];
    weight: number;
  };
}

interface LearningPath {
  id: string;
  level: string;
  name: string;
  description: string;
  totalActivities: number;
  completedActivities: number;
  estimatedDuration: string;
  activities: AdaptiveActivity[];
  milestones: {
    name: string;
    activities: number;
    reward: string;
  }[];
}

interface StudentProfile {
  id: string;
  name: string;
  age: number;
  currentLevel: LearningLevel;
  diagnosticScore: number;
  strengths: string[];
  weaknesses: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  pace: 'slow' | 'normal' | 'fast';
  interests: string[];
  goals: string[];
  completedLevels: string[];
  currentPath: LearningPath | null;
  progress: {
    vocabulary: number;
    grammar: number;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
    overall: number;
  };
}

const AdaptiveLearningSystem: React.FC = () => {
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    id: 'student_001',
    name: 'Alex',
    age: 10,
    currentLevel: {
      id: 'a1',
      name: 'Beginner',
      code: 'A1',
      description: 'Comienzo del aprendizaje del inglés',
      color: 'from-green-400 to-green-600',
      icon: <Star className="w-6 h-6" />,
      requirements: {
        minScore: 0,
        maxScore: 35,
        vocabulary: 100,
        grammar: 50,
        speaking: 20,
        listening: 30,
        reading: 40,
        writing: 25
      },
      objectives: [
        'Presentarse y presentarse a otros',
        'Hacer preguntas básicas',
        'Entender frases simples',
        'Escribir frases cortas'
      ],
      duration: '3-4 meses',
      skills: ['Greetings', 'Basic Vocabulary', 'Simple Questions', 'Everyday Phrases']
    },
    diagnosticScore: 28,
    strengths: ['Visual Learning', 'Pattern Recognition'],
    weaknesses: ['Speaking Fluency', 'Complex Grammar'],
    learningStyle: 'visual',
    pace: 'normal',
    interests: ['Games', 'Animals', 'Sports'],
    goals: ['Conversar con amigos', 'Ver películas en inglés'],
    completedLevels: [],
    currentPath: null,
    progress: {
      vocabulary: 65,
      grammar: 45,
      speaking: 30,
      listening: 55,
      reading: 70,
      writing: 40,
      overall: 52
    }
  });

  const [currentActivity, setCurrentActivity] = useState<AdaptiveActivity | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LearningLevel | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);

  const learningLevels: LearningLevel[] = [
    {
      id: 'a1',
      name: 'Beginner',
      code: 'A1',
      description: 'Comienzo del aprendizaje del inglés',
      color: 'from-green-400 to-green-600',
      icon: <Star className="w-6 h-6" />,
      requirements: {
        minScore: 0,
        maxScore: 35,
        vocabulary: 100,
        grammar: 50,
        speaking: 20,
        listening: 30,
        reading: 40,
        writing: 25
      },
      objectives: [
        'Presentarse y presentarse a otros',
        'Hacer preguntas básicas',
        'Entender frases simples',
        'Escribir frases cortas'
      ],
      duration: '3-4 meses',
      skills: ['Greetings', 'Basic Vocabulary', 'Simple Questions', 'Everyday Phrases']
    },
    {
      id: 'a2',
      name: 'Elementary',
      code: 'A2',
      description: 'Nivel elemental con comunicación básica',
      color: 'from-blue-400 to-blue-600',
      icon: <BookOpen className="w-6 h-6" />,
      requirements: {
        minScore: 36,
        maxScore: 50,
        vocabulary: 300,
        grammar: 100,
        speaking: 50,
        listening: 60,
        reading: 80,
        writing: 60
      },
      objectives: [
        'Describir experiencias pasadas',
        'Hablar de planes futuros',
        'Entender conversaciones simples',
        'Escribir párrafos cortos'
      ],
      duration: '4-5 meses',
      skills: ['Past Tense', 'Future Plans', 'Descriptions', 'Short Conversations']
    },
    {
      id: 'b1',
      name: 'Intermediate',
      code: 'B1',
      description: 'Nivel intermedio con fluidez básica',
      color: 'from-yellow-400 to-yellow-600',
      icon: <Target className="w-6 h-6" />,
      requirements: {
        minScore: 51,
        maxScore: 65,
        vocabulary: 800,
        grammar: 200,
        speaking: 100,
        listening: 120,
        reading: 150,
        writing: 100
      },
      objectives: [
        'Mantener conversaciones fluidas',
        'Expresar opiniones y argumentos',
        'Entender textos complejos',
        'Escribir ensayos estructurados'
      ],
      duration: '5-6 meses',
      skills: ['Fluent Conversation', 'Opinions', 'Complex Texts', 'Structured Writing']
    },
    {
      id: 'b2',
      name: 'Upper-Intermediate',
      code: 'B2',
      description: 'Nivel intermedio-alto con autonomía',
      color: 'from-orange-400 to-orange-600',
      icon: <Trophy className="w-6 h-6" />,
      requirements: {
        minScore: 66,
        maxScore: 80,
        vocabulary: 1500,
        grammar: 400,
        speaking: 200,
        listening: 200,
        reading: 250,
        writing: 180
      },
      objectives: [
        'Participar en debates técnicos',
        'Entender medios de comunicación',
        'Escribir informes detallados',
        'Comunicarse con naturalidad'
      ],
      duration: '6-8 meses',
      skills: ['Technical Discussions', 'Media Understanding', 'Report Writing', 'Natural Communication']
    },
    {
      id: 'c1',
      name: 'Advanced',
      code: 'C1',
      description: 'Nivel avanzado con dominio flexible',
      color: 'from-red-400 to-red-600',
      icon: <Award className="w-6 h-6" />,
      requirements: {
        minScore: 81,
        maxScore: 90,
        vocabulary: 3000,
        grammar: 800,
        speaking: 400,
        listening: 350,
        reading: 400,
        writing: 350
      },
      objectives: [
        'Usar lenguaje flexible y efectivo',
        'Entender textos académicos',
        'Producir escritura creativa',
        'Comunicarse en contextos profesionales'
      ],
      duration: '8-10 meses',
      skills: ['Flexible Language', 'Academic Texts', 'Creative Writing', 'Professional Communication']
    },
    {
      id: 'c2',
      name: 'Proficient',
      code: 'C2',
      description: 'Nivel de dominio casi nativo',
      color: 'from-purple-400 to-purple-600',
      icon: <GraduationCap className="w-6 h-6" />,
      requirements: {
        minScore: 91,
        maxScore: 100,
        vocabulary: 5000,
        grammar: 1500,
        speaking: 800,
        listening: 700,
        reading: 800,
        writing: 700
      },
      objectives: [
        'Comprender prácticamente todo',
        'Expresar ideas espontáneamente',
        'Distinguir matices finos',
        'Comunicarse con precisión'
      ],
      duration: '10-12 meses',
      skills: ['Near-Native Comprehension', 'Spontaneous Expression', 'Fine Nuances', 'Precise Communication']
    }
  ];

  const generateAdaptiveActivities = (level: LearningLevel): AdaptiveActivity[] => {
    const baseActivities = {
      vocabulary: [
        {
          id: 'vocab_basic',
          title: 'Vocabulary Builder',
          type: 'vocabulary' as const,
          level: level.id,
          difficulty: 1,
          duration: 15,
          description: 'Aprende 10 palabras nuevas con flashcards y juegos',
          objectives: ['Memorizar palabras', 'Usar en contexto', 'Pronunciar correctamente'],
          materials: ['Flashcards', 'Audio', 'Images'],
          instructions: [
            'Ve cada palabra con su imagen',
            'Escucha la pronunciación',
            'Repite la palabra',
            'Usa en una frase'
          ],
          assessment: {
            type: 'quiz',
            criteria: ['Recognition', 'Usage', 'Pronunciation'],
            weight: 20
          }
        }
      ],
      grammar: [
        {
          id: 'grammar_basic',
          title: 'Grammar Essentials',
          type: 'grammar' as const,
          level: level.id,
          difficulty: 2,
          duration: 20,
          description: 'Practica estructuras gramaticales básicas',
          objectives: ['Comprender reglas', 'Aplicar correctamente', 'Identificar errores'],
          materials: ['Exercises', 'Examples', 'Practice Sheets'],
          instructions: [
            'Lee la regla gramatical',
            'Ve los ejemplos',
            'Completa los ejercicios',
            'Revisa tus respuestas'
          ],
          assessment: {
            type: 'exercises',
            criteria: ['Accuracy', 'Application', 'Error Detection'],
            weight: 25
          }
        }
      ],
      speaking: [
        {
          id: 'speaking_practice',
          title: 'Speaking Practice',
          type: 'speaking' as const,
          level: level.id,
          difficulty: 3,
          duration: 25,
          description: 'Practica conversación con IA y compañeros',
          objectives: ['Fluidez básica', 'Pronunciación', 'Confianza'],
          materials: ['Conversation Prompts', 'AI Tutor', 'Recording Tools'],
          instructions: [
            'Escucha el modelo',
            'Practica en voz alta',
            'Graba tu respuesta',
            'Recibe feedback'
          ],
          assessment: {
            type: 'oral',
            criteria: ['Fluency', 'Pronunciation', 'Confidence'],
            weight: 30
          }
        }
      ],
      listening: [
        {
          id: 'listening_comprehension',
          title: 'Listening Comprehension',
          type: 'listening' as const,
          level: level.id,
          difficulty: 2,
          duration: 20,
          description: 'Mejora tu comprensión auditiva',
          objectives: ['Entender diálogos', 'Identificar información clave', 'Retener detalles'],
          materials: ['Audio Clips', 'Transcripts', 'Questions'],
          instructions: [
            'Escucha el audio',
            'Responde las preguntas',
            'Revisa con transcripción',
            'Escucha de nuevo'
          ],
          assessment: {
            type: 'comprehension',
            criteria: ['Understanding', 'Detail Retention', 'Inference'],
            weight: 25
          }
        }
      ],
      reading: [
        {
          id: 'reading_comprehension',
          title: 'Reading Comprehension',
          type: 'reading' as const,
          level: level.id,
          difficulty: 2,
          duration: 25,
          description: 'Desarrolla tu comprensión lectora',
          objectives: ['Entender textos', 'Identificar ideas principales', 'Vocabulary in context'],
          materials: ['Reading Texts', 'Questions', 'Vocabulary Lists'],
          instructions: [
            'Lee el texto atentamente',
            'Responde las preguntas',
            'Busca palabras desconocidas',
            'Resume el contenido'
          ],
          assessment: {
            type: 'comprehension',
            criteria: ['Main Ideas', 'Details', 'Vocabulary'],
            weight: 25
          }
        }
      ],
      writing: [
        {
          id: 'writing_practice',
          title: 'Writing Practice',
          type: 'writing' as const,
          level: level.id,
          difficulty: 3,
          duration: 30,
          description: 'Practica escritura guiada',
          objectives: ['Estructura de frases', 'Uso de vocabulario', 'Cohesión'],
          materials: ['Writing Prompts', 'Templates', 'Checklists'],
          instructions: [
            'Lee el prompt',
            'Organiza tus ideas',
            'Escribe el borrador',
            'Revisa y edita'
          ],
          assessment: {
            type: 'writing',
            criteria: ['Structure', 'Vocabulary', 'Cohesion'],
            weight: 30
          }
        }
      ]
    };

    return [
      ...baseActivities.vocabulary,
      ...baseActivities.grammar,
      ...baseActivities.speaking,
      ...baseActivities.listening,
      ...baseActivities.reading,
      ...baseActivities.writing
    ];
  };

  const generateLearningPath = (level: LearningLevel): LearningPath => {
    const activities = generateAdaptiveActivities(level);
    
    return {
      id: `path_${level.id}`,
      level: level.id,
      name: `Ruta de Aprendizaje - ${level.name}`,
      description: `Camino personalizado para dominar el nivel ${level.code}`,
      totalActivities: activities.length,
      completedActivities: 0,
      estimatedDuration: level.duration,
      activities,
      milestones: [
        {
          name: 'Foundation Complete',
          activities: Math.floor(activities.length * 0.25),
          reward: 'Basic Vocabulary Badge'
        },
        {
          name: 'Grammar Master',
          activities: Math.floor(activities.length * 0.5),
          reward: 'Grammar Certificate'
        },
        {
          name: 'Conversation Ready',
          activities: Math.floor(activities.length * 0.75),
          reward: 'Speaking Badge'
        },
        {
          name: 'Level Complete',
          activities: activities.length,
          reward: `${level.code} Certificate`
        }
      ]
    };
  };

  useEffect(() => {
    if (studentProfile.currentLevel) {
      const path = generateLearningPath(studentProfile.currentLevel);
      setLearningPaths([path]);
      setStudentProfile(prev => ({ ...prev, currentPath: path }));
    }
  }, [studentProfile.currentLevel]);

  const handleDiagnosticComplete = (score: number, level: LearningLevel) => {
    setStudentProfile(prev => ({
      ...prev,
      diagnosticScore: score,
      currentLevel: level,
      currentPath: generateLearningPath(level)
    }));
    setShowDiagnostic(false);
  };

  const startActivity = (activity: AdaptiveActivity) => {
    setCurrentActivity(activity);
  };

  const completeActivity = (activity: AdaptiveActivity, score: number) => {
    if (studentProfile.currentPath) {
      const updatedPath = {
        ...studentProfile.currentPath,
        completedActivities: studentProfile.currentPath.completedActivities + 1
      };
      
      setStudentProfile(prev => ({
        ...prev,
        currentPath: updatedPath,
        progress: {
          ...prev.progress,
          overall: Math.min(100, prev.progress.overall + (100 / studentProfile.currentPath!.totalActivities))
        }
      }));
      
      setCurrentActivity(null);
    }
  };

  const getLevelProgress = () => {
    if (!studentProfile.currentPath) return 0;
    return (studentProfile.currentPath.completedActivities / studentProfile.currentPath.totalActivities) * 100;
  };

  const getRecommendedActivities = () => {
    if (!studentProfile.currentPath) return [];
    
    // Filter activities based on student's weaknesses and learning style
    return studentProfile.currentPath.activities.filter(activity => {
      if (studentProfile.learningStyle === 'visual' && ['reading', 'vocabulary'].includes(activity.type)) {
        return true;
      }
      if (studentProfile.learningStyle === 'auditory' && ['listening', 'speaking'].includes(activity.type)) {
        return true;
      }
      if (studentProfile.learningStyle === 'kinesthetic' && ['game', 'conversation'].includes(activity.type)) {
        return true;
      }
      return true; // Show all for mixed style
    }).slice(0, 6);
  };

  if (showDiagnostic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
              <Target className="w-8 h-8 mr-3 text-blue-500" />
              Examen de Nivelación
            </h1>
            <p className="text-xl text-gray-600">
              Determinaremos tu nivel exacto para personalizar tu aprendizaje
            </p>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                El examen tomará aproximadamente 30 minutos y evaluará todas las habilidades del inglés.
              </p>
              
              <button
                onClick={() => handleDiagnosticComplete(28, learningLevels[0])}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-bold text-lg"
              >
                Comenzar Examen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentActivity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentActivity.title}</h2>
              <p className="text-gray-600">{currentActivity.description}</p>
              
              <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                <span>Duración: {currentActivity.duration} min</span>
                <span>Dificultad: {'⭐'.repeat(currentActivity.difficulty)}</span>
                <span>Tipo: {currentActivity.type}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-3">Instrucciones:</h3>
              <ol className="space-y-2">
                {currentActivity.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="font-medium mr-2">{index + 1}.</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-3">Objetivos:</h3>
              <ul className="space-y-1">
                {currentActivity.objectives.map((objective, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentActivity(null)}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={() => completeActivity(currentActivity, 85)}
                className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                Completar Actividad
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 bg-gradient-to-r ${studentProfile.currentLevel.color} rounded-full flex items-center justify-center text-white`}>
                {studentProfile.currentLevel.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Sistema de Aprendizaje Adaptativo
                </h1>
                <p className="text-gray-600">
                  Hola {studentProfile.name}! Nivel actual: {studentProfile.currentLevel.name} ({studentProfile.currentLevel.code})
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Puntuación Diagnóstica</div>
              <div className="text-2xl font-bold text-blue-600">{studentProfile.diagnosticScore}/100</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Profile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Perfil del Estudiante
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Edad:</span>
                <span className="font-medium">{studentProfile.age} años</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Estilo de aprendizaje:</span>
                <span className="font-medium capitalize">{studentProfile.learningStyle}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Ritmo:</span>
                <span className="font-medium capitalize">{studentProfile.pace}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Intereses:</span>
                <span className="font-medium">{studentProfile.interests.join(', ')}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2">Fortalezas:</h3>
              <div className="space-y-1">
                {studentProfile.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {strength}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2">Áreas de mejora:</h3>
              <div className="space-y-1">
                {studentProfile.weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-center text-sm text-orange-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {weakness}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Current Level Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Progreso del Nivel
            </h2>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progreso general</span>
                <span className="font-medium">{Math.round(getLevelProgress())}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getLevelProgress()}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800">Progreso por Habilidad:</h3>
              
              {Object.entries(studentProfile.progress).map(([skill, value]) => (
                <div key={skill} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{skill}</span>
                    <span className="font-medium">{value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ delay: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2">Objetivos del Nivel:</h3>
              <ul className="space-y-1">
                {studentProfile.currentLevel.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <Target className="w-4 h-4 mr-1 mt-0.5 text-blue-500" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Learning Path */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-500" />
              Ruta de Aprendizaje
            </h2>
            
            {studentProfile.currentPath && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-bold text-gray-800">{studentProfile.currentPath.name}</h3>
                  <p className="text-sm text-gray-600">{studentProfile.currentPath.description}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Actividades completadas:</span>
                    <span className="font-medium">
                      {studentProfile.currentPath.completedActivities}/{studentProfile.currentPath.totalActivities}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duración estimada:</span>
                    <span className="font-medium">{studentProfile.currentPath.estimatedDuration}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-800">Hitos:</h4>
                  {studentProfile.currentPath.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                        <span className="text-sm">{milestone.name}</span>
                      </div>
                      <span className="text-xs text-gray-600">{milestone.reward}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recommended Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
            Actividades Recomendadas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getRecommendedActivities().map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => startActivity(activity)}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800">{activity.title}</h3>
                  <span className="text-xs bg-white px-2 py-1 rounded-full">
                    {activity.type}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{activity.duration} min</span>
                  <span>{'⭐'.repeat(activity.difficulty)}</span>
                </div>
                
                <div className="mt-3 flex items-center text-blue-600 font-medium">
                  <Play className="w-4 h-4 mr-1" />
                  <span>Comenzar</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Level Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center">
                <GraduationCap className="w-6 h-6 mr-2" />
                Tu Nivel Actual: {studentProfile.currentLevel.name}
              </h3>
              <p className="text-blue-100 mb-4">{studentProfile.currentLevel.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-200">Vocabulario:</span>
                  <span className="font-medium ml-2">{studentProfile.currentLevel.requirements.vocabulary} palabras</span>
                </div>
                <div>
                  <span className="text-blue-200">Gramática:</span>
                  <span className="font-medium ml-2">{studentProfile.currentLevel.requirements.grammar} puntos</span>
                </div>
                <div>
                  <span className="text-blue-200">Duración:</span>
                  <span className="font-medium ml-2">{studentProfile.currentLevel.duration}</span>
                </div>
                <div>
                  <span className="text-blue-200">Próximo nivel:</span>
                  <span className="font-medium ml-2">
                    {learningLevels.find(l => l.id === String.fromCharCode(studentProfile.currentLevel.id.charCodeAt(0) + 1))?.name || 'C2'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Brain className="w-16 h-16 text-yellow-300 mb-2" />
              <p className="text-sm text-blue-200">
                Aprendizaje adaptado a tu nivel exacto
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdaptiveLearningSystem;
