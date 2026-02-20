import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Mic, 
  MicOff, 
  Volume2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Award, 
  Target, 
  Brain, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Star, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw,
  FileText,
  MessageSquare,
  Headphones,
  Video,
  PenTool,
  Eye,
  Ear,
  Hand
} from 'lucide-react';
import { edgeTTS } from '@/services/edgeTTS';

interface DiagnosticSection {
  id: string;
  name: string;
  type: 'oral' | 'written';
  description: string;
  duration: number;
  questions: DiagnosticQuestion[];
  weight: number;
  skills: string[];
}

interface DiagnosticQuestion {
  id: string;
  type: 'speaking' | 'listening' | 'reading' | 'writing' | 'grammar' | 'vocabulary';
  question: string;
  instructions: string;
  difficulty: number;
  timeLimit: number;
  points: number;
  audioUrl?: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer?: any;
  rubric?: {
    criteria: string[];
    levels: string[];
  };
}

interface TestResult {
  section: string;
  score: number;
  maxScore: number;
  percentage: number;
  details: {
    [key: string]: number;
  };
  feedback: string;
  recommendations: string[];
}

interface DiagnosticReport {
  overallLevel: string;
  overallScore: number;
  sectionResults: TestResult[];
  strengths: string[];
  weaknesses: string[];
  learningPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  estimatedTimeToNextLevel: string;
  confidenceLevel: number;
}

const StrategicDiagnosticTest: React.FC = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: any}>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testResults, setTestResults] = useState<DiagnosticReport | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const diagnosticSections: DiagnosticSection[] = [
    {
      id: 'oral_comprehension',
      name: 'Comprensión Oral',
      type: 'oral',
      description: 'Evalúa tu capacidad para entender y responder en inglés hablado',
      duration: 15,
      weight: 40,
      skills: ['Listening Comprehension', 'Speaking Fluency', 'Pronunciation'],
      questions: [
        {
          id: 'oral_1',
          type: 'speaking',
          question: 'Describe tu familia en inglés. Habla sobre cuántos hermanos tienes y qué les gusta hacer.',
          instructions: 'Tienes 2 minutos para responder. Habla claramente y usa frases completas.',
          difficulty: 2,
          timeLimit: 120,
          points: 25,
          rubric: {
            criteria: ['Fluidez', 'Pronunciación', 'Gramática', 'Vocabulario'],
            levels: ['Básico', 'Intermedio', 'Avanzado', 'Nativo']
          }
        },
        {
          id: 'oral_2',
          type: 'listening',
          question: 'Escucha la conversación y responde las preguntas.',
          instructions: 'Escucha atentamente y responde lo que entendiste.',
          difficulty: 2,
          timeLimit: 60,
          points: 25,
          audioUrl: '/audio/conversation.mp3'
        },
        {
          id: 'oral_3',
          type: 'speaking',
          question: '¿Qué hiciste ayer? Describe tu día de ayer en inglés.',
          instructions: 'Usa el pasado simple y describe al menos 3 actividades.',
          difficulty: 3,
          timeLimit: 90,
          points: 25,
          rubric: {
            criteria: ['Uso de pasado', 'Fluidez', 'Vocabulario', 'Estructura'],
            levels: ['Básico', 'Intermedio', 'Avanzado', 'Nativo']
          }
        }
      ]
    },
    {
      id: 'written_comprehension',
      name: 'Comprensión Escrita',
      type: 'written',
      description: 'Evalúa tu capacidad para leer, escribir y entender inglés escrito',
      duration: 20,
      weight: 60,
      skills: ['Reading Comprehension', 'Writing Skills', 'Grammar', 'Vocabulary'],
      questions: [
        {
          id: 'written_1',
          type: 'reading',
          question: 'Lee el siguiente texto y responde las preguntas:',
          instructions: 'Lee atentamente y responde con frases completas.',
          difficulty: 2,
          timeLimit: 300,
          points: 20,
          imageUrl: '/images/reading_text.png'
        },
        {
          id: 'written_2',
          type: 'writing',
          question: 'Escribe un párrafo sobre tu animal favorito.',
          instructions: 'Mínimo 5 frases. Usa adjetivos y describe por qué te gusta.',
          difficulty: 2,
          timeLimit: 600,
          points: 30,
          rubric: {
            criteria: ['Estructura', 'Gramática', 'Vocabulario', 'Creatividad'],
            levels: ['Básico', 'Intermedio', 'Avanzado', 'Nativo']
          }
        },
        {
          id: 'written_3',
          type: 'grammar',
          question: 'Completa las frases con la forma correcta del verbo:',
          instructions: 'Usa el tiempo verbal correcto para cada situación.',
          difficulty: 3,
          timeLimit: 180,
          points: 25,
          options: [
            'She ___ (go) to school every day.',
            'They ___ (play) soccer yesterday.',
            'I ___ (study) English now.',
            'We ___ (visit) grandma next week.'
          ]
        },
        {
          id: 'written_4',
          type: 'vocabulary',
          question: 'Une las palabras con sus definiciones:',
          instructions: 'Arrastra cada palabra a su definición correcta.',
          difficulty: 2,
          timeLimit: 120,
          points: 25,
          options: [
            'Happy', 'Sad', 'Big', 'Small', 'Fast', 'Slow'
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    if (testStarted && !testCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, testCompleted, currentSection]);

  const startTest = () => {
    setTestStarted(true);
    setTimeRemaining(diagnosticSections[0].duration * 60);
    setCurrentSection(0);
    setCurrentQuestion(0);
  };

  const handleTimeUp = () => {
    if (currentSection < diagnosticSections.length - 1) {
      moveToNextSection();
    } else {
      completeTest();
    }
  };

  const moveToNextSection = () => {
    if (currentSection < diagnosticSections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
      setTimeRemaining(diagnosticSections[currentSection + 1].duration * 60);
      setWrittenAnswer('');
      setAudioBlob(null);
    } else {
      completeTest();
    }
  };

  const moveToNextQuestion = () => {
    const currentQuestions = diagnosticSections[currentSection].questions;
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setWrittenAnswer('');
      setAudioBlob(null);
    } else {
      moveToNextSection();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
    }
  };

  const handleAnswerSubmit = () => {
    const questionId = diagnosticSections[currentSection].questions[currentQuestion].id;
    const questionType = diagnosticSections[currentSection].questions[currentQuestion].type;

    let answer;
    if (questionType === 'speaking') {
      answer = audioBlob;
    } else if (questionType === 'writing' || questionType === 'grammar') {
      answer = writtenAnswer;
    } else if (questionType === 'reading' || questionType === 'vocabulary') {
      answer = selectedAnswers[questionId];
    }

    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    moveToNextQuestion();
  };

  const completeTest = () => {
    setTestCompleted(true);
    generateDiagnosticReport();
  };

  const generateDiagnosticReport = () => {
    // Simulate AI analysis of answers
    const report: DiagnosticReport = {
      overallLevel: 'Intermediate',
      overallScore: 73,
      sectionResults: [
        {
          section: 'Comprensión Oral',
          score: 68,
          maxScore: 100,
          percentage: 68,
          details: {
            speaking: 65,
            listening: 71,
            pronunciation: 68
          },
          feedback: 'Buena comprensión general, pero necesita mejorar fluidez en conversaciones largas.',
          recommendations: [
            'Practicar conversaciones diarias de 5 minutos',
            'Ver películas en inglés con subtítulos',
            'Usar aplicaciones de pronunciación'
          ]
        },
        {
          section: 'Comprensión Escrita',
          score: 78,
          maxScore: 100,
          percentage: 78,
          details: {
            reading: 82,
            writing: 75,
            grammar: 76,
            vocabulary: 79
          },
          feedback: 'Lectura comprensiva buena, escritura necesita más estructura.',
          recommendations: [
            'Escribir un diario en inglés',
            'Leer libros adaptados a tu nivel',
            'Practicar ejercicios de gramática'
          ]
        }
      ],
      strengths: [
        'Buen vocabulario básico',
        'Comprensión de lectura sólida',
        'Motivación para aprender',
        'Buena pronunciación de palabras simples'
      ],
      weaknesses: [
        'Fluidez en conversaciones largas',
        'Uso de tiempos verbales complejos',
        'Estructura de párrafos',
        'Velocidad de respuesta oral'
      ],
      learningPlan: {
        immediate: [
          'Practicar preguntas y respuestas básicas',
          'Memorizar 20 verbos comunes en pasado',
          'Escribir 3 frases diarias'
        ],
        shortTerm: [
          'Completar curso de gramática intermedia',
          'Participar en conversaciones grupales',
          'Leer un libro corto en inglés'
        ],
        longTerm: [
          'Alcanzar nivel B1 en 6 meses',
          'Mantener conversaciones de 10 minutos',
          'Escribir ensayos de 200 palabras'
        ]
      },
      estimatedTimeToNextLevel: '3-4 meses con práctica diaria',
      confidenceLevel: 85
    };

    setTestResults(report);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'Beginner': 'bg-green-500',
      'Elementary': 'bg-blue-500',
      'Intermediate': 'bg-yellow-500',
      'Upper-Intermediate': 'bg-orange-500',
      'Advanced': 'bg-red-500',
      'Proficient': 'bg-purple-500'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500';
  };

  const currentSectionData = diagnosticSections[currentSection];
  const currentQuestionData = currentSectionData?.questions[currentQuestion];

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
              <ClipboardList className="w-8 h-8 mr-3 text-blue-500" />
              Examen Diagnóstico Estratégico
            </h1>
            <p className="text-xl text-gray-600">
              Evaluación completa oral y escrita para determinar tu nivel exacto
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">¿Qué evalúa este examen?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center mb-3">
                    <Mic className="w-6 h-6 mr-2 text-blue-500" />
                    <h3 className="font-bold text-gray-800">Evaluación Oral (40%)</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Comprensión auditiva</li>
                    <li>• Fluidez conversacional</li>
                    <li>• Pronunciación</li>
                    <li>• Respuesta espontánea</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center mb-3">
                    <PenTool className="w-6 h-6 mr-2 text-green-500" />
                    <h3 className="font-bold text-gray-800">Evaluación Escrita (60%)</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Comprensión lectora</li>
                    <li>• Redacción y estructura</li>
                    <li>• Gramática y sintaxis</li>
                    <li>• Vocabulario</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                <div className="flex items-center mb-3">
                  <Clock className="w-6 h-6 mr-2 text-yellow-500" />
                  <h3 className="font-bold text-gray-800">Duración Total</h3>
                </div>
                <p className="text-gray-700">
                  35 minutos (15 minutos oral + 20 minutos escrito)
                </p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <Brain className="w-6 h-6 mr-2 text-purple-500" />
                  <h3 className="font-bold text-gray-800">Resultados Inmediatos</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Nivel exacto (A1-C2)</li>
                  <li>• Fortalezas y áreas de mejora</li>
                  <li>• Plan de aprendizaje personalizado</li>
                  <li>• Tiempo estimado para siguiente nivel</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={startTest}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-bold text-lg shadow-lg"
              >
                <Play className="w-5 h-5 inline mr-2" />
                Comenzar Examen
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (testCompleted && testResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
              <Award className="w-8 h-8 mr-3 text-green-500" />
              Resultados del Examen Diagnóstico
            </h1>
            <p className="text-xl text-gray-600">
              Tu evaluación personalizada está lista
            </p>
          </motion.div>

          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-6"
          >
            <div className="text-center mb-6">
              <div className={`w-32 h-32 mx-auto mb-4 ${getLevelColor(testResults.overallLevel)} rounded-full flex items-center justify-center text-white text-4xl font-bold`}>
                {testResults.overallScore}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Nivel: {testResults.overallLevel}
              </h2>
              <p className="text-gray-600">
                Confianza en el diagnóstico: {testResults.confidenceLevel}%
              </p>
            </div>

            {/* Section Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {testResults.sectionResults.map((section, index) => (
                <motion.div
                  key={section.section}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-4"
                >
                  <h3 className="font-bold text-gray-800 mb-3">{section.section}</h3>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Puntuación</span>
                      <span className="font-medium">{section.score}/{section.maxScore}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-blue-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${section.percentage}%` }}
                        transition={{ delay: index * 0.2, duration: 0.8 }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    {Object.entries(section.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key}</span>
                        <span className="font-medium">{value}%</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-gray-700 mb-2">{section.feedback}</p>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-800">Recomendaciones:</p>
                    {section.recommendations.map((rec, i) => (
                      <p key={i} className="text-xs text-gray-600">• {rec}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-green-50 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                Fortalezas
              </h3>
              <ul className="space-y-2">
                {testResults.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center text-green-700">
                    <Star className="w-4 h-4 mr-2 text-green-500" />
                    {strength}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-orange-50 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
                <AlertCircle className="w-6 h-6 mr-2" />
                Áreas de Mejora
              </h3>
              <ul className="space-y-2">
                {testResults.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-center text-orange-700">
                    <Target className="w-4 h-4 mr-2 text-orange-500" />
                    {weakness}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Learning Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white"
          >
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2" />
              Plan de Aprendizaje Personalizado
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold mb-2">Inmediato (1-2 semanas)</h4>
                <ul className="space-y-1 text-sm">
                  {testResults.learningPlan.immediate.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-2">Corto Plazo (1-3 meses)</h4>
                <ul className="space-y-1 text-sm">
                  {testResults.learningPlan.shortTerm.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-2">Largo Plazo (3-6 meses)</h4>
                <ul className="space-y-1 text-sm">
                  {testResults.learningPlan.longTerm.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-lg font-medium">
                Tiempo estimado para siguiente nivel: {testResults.estimatedTimeToNextLevel}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              {currentSectionData.type === 'oral' ? <Mic className="w-6 h-6 mr-2 text-blue-500" /> : <PenTool className="w-6 h-6 mr-2 text-green-500" />}
              {currentSectionData.name}
            </h1>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">{formatTime(timeRemaining)}</span>
              </div>
              
              <div className="text-sm text-gray-600">
                Pregunta {currentQuestion + 1} de {currentSectionData.questions.length}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / currentSectionData.questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {currentQuestionData?.question}
            </h2>
            <p className="text-gray-600 mb-4">
              {currentQuestionData?.instructions}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Tiempo límite: {currentQuestionData?.timeLimit}s</span>
              <span>Puntos: {currentQuestionData?.points}</span>
              <span>Dificultad: {'⭐'.repeat(currentQuestionData?.difficulty || 1)}</span>
            </div>
          </div>

          {/* Question Type Interface */}
          {currentQuestionData?.type === 'speaking' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <Mic className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                <p className="text-gray-700 mb-4">
                  Haz clic en el botón para grabar tu respuesta
                </p>
                
                <div className="flex justify-center space-x-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Grabar
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors flex items-center animate-pulse"
                    >
                      <MicOff className="w-5 h-5 mr-2" />
                      Detener
                    </button>
                  )}
                  
                  {audioBlob && (
                    <button
                      onClick={playRecording}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center"
                    >
                      <Volume2 className="w-5 h-5 mr-2" />
                      Reproducir
                    </button>
                  )}
                </div>
              </div>
              
              {audioBlob && (
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-green-700 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Audio grabado correctamente
                  </p>
                </div>
              )}
            </div>
          )}

          {currentQuestionData?.type === 'writing' && (
            <div className="space-y-4">
              <textarea
                value={writtenAnswer}
                onChange={(e) => setWrittenAnswer(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className="w-full h-40 p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
              />
              
              <div className="text-right text-sm text-gray-500">
                {writtenAnswer.split(' ').filter(word => word.length > 0).length} palabras
              </div>
            </div>
          )}

          {currentQuestionData?.type === 'grammar' && (
            <div className="space-y-4">
              {currentQuestionData.options?.map((option, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-800">{option}</p>
                  <input
                    type="text"
                    placeholder="Tu respuesta..."
                    className="mt-2 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            
            <button
              onClick={handleAnswerSubmit}
              disabled={
                (currentQuestionData?.type === 'speaking' && !audioBlob) ||
                (currentQuestionData?.type === 'writing' && !writtenAnswer.trim())
              }
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {currentQuestion === currentSectionData.questions.length - 1 ? 'Finalizar Sección' : 'Siguiente'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StrategicDiagnosticTest;
