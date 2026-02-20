import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { freeVoiceService } from '@/services/freeVoiceService';
import { Play, Pause, Square, Volume2, Settings, TestTube } from 'lucide-react';

interface VoiceTestPanelProps {
  onClose?: () => void;
}

export const VoiceTestPanel: React.FC<VoiceTestPanelProps> = ({ onClose }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentTutor, setCurrentTutor] = useState('lina');
  const [testText, setTestText] = useState('¡Hola! Soy Lina y esta es una prueba de mi voz.');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceInfo, setVoiceInfo] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const tutorProfiles = [
    { id: 'lina', name: 'Lina', language: 'Español', description: 'Tutora entusiasta de matemáticas' },
    { id: 'rachelle', name: 'Rachelle', language: 'Inglés', description: 'English tutor with enthusiasm' },
    { id: 'male', name: 'Voz Masculina', language: 'Español', description: 'Tutor de voz profunda' },
    { id: 'jorge', name: 'Jorge', language: 'Español', description: 'Tutor español profesional' },
    { id: 'dr-mathematics', name: 'Dra. Elena', language: 'Español', description: 'Tutora de matemáticas avanzadas' },
    { id: 'dr-science', name: 'Dr. Carlos', language: 'Español', description: 'Tutor de ciencias' },
    { id: 'prof-literature', name: 'Prof. García', language: 'Español', description: 'Tutor de literatura' },
    { id: 'prof-physics', name: 'Prof. Maria', language: 'Español', description: 'Tutora de física' }
  ];

  const testTexts = {
    lina: '¡Hola! Soy Lina y estoy aquí para ayudarte con tus matemáticas. ¡Vamos a aprender juntos!',
    rachelle: 'Hello! I\'m Rachelle and I\'m excited to help you with your English lessons. Let\'s get started!',
    male: 'Hola, soy tu tutor y estoy aquí para guiarte en tu aprendizaje. Puedo ayudarte con cualquier pregunta.',
    jorge: 'Buenos días. Soy Jorge, tu tutor especializado. Estoy listo para apoyarte en tu educación.',
    'dr-mathematics': 'Bienvenido. Soy la Doctora Elena y te guiaré a través de conceptos matemáticos avanzados.',
    'dr-science': '¡Hola! Soy el Doctor Carlos. Exploraremos juntos los fascinantes mundos de la ciencia.',
    'prof-literature': 'Saludos. Soy el Profesor García y nos sumergiremos en el maravilloso mundo de la literatura.',
    'prof-physics': 'Hola. Soy la Profesora Maria y descubriremos los principios fundamentales de la física.'
  };

  useEffect(() => {
    initializeVoiceService();
  }, []);

  const initializeVoiceService = async () => {
    try {
      await freeVoiceService.initialize();
      setIsInitialized(true);
      
      const voices = freeVoiceService.getAvailableVoices();
      setAvailableVoices(voices);
      
      // Get voice info for current tutor
      const info = freeVoiceService.getTutorVoiceInfo(currentTutor);
      setVoiceInfo(info);
      
      console.log('🎤 Voice service initialized with', voices.length, 'voices');
    } catch (error) {
      console.error('❌ Failed to initialize voice service:', error);
    }
  };

  const handleTutorChange = (tutorId: string) => {
    setCurrentTutor(tutorId);
    setTestText(testTexts[tutorId as keyof typeof testTexts]);
    
    const info = freeVoiceService.getTutorVoiceInfo(tutorId);
    setVoiceInfo(info);
  };

  const handleSpeak = async () => {
    if (isPaused) {
      freeVoiceService.resume();
      setIsPaused(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await freeVoiceService.speak(testText, currentTutor);
    } catch (error) {
      console.error('❌ Speech error:', error);
    } finally {
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (isSpeaking && !isPaused) {
      freeVoiceService.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    freeVoiceService.stop();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const testAllVoices = async () => {
    try {
      setIsSpeaking(true);
      await freeVoiceService.testAllVoices();
    } catch (error) {
      console.error('❌ Test all voices error:', error);
    } finally {
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const getHighQualityVoices = () => {
    const qualityKeywords = ['Microsoft', 'Google', 'Amazon', 'Apple', 'Neural', 'WaveNet', 'Premium'];
    return availableVoices.filter(voice => 
      qualityKeywords.some(keyword => voice.name.includes(keyword))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800">Panel de Prueba de Voces</h1>
                <p className="text-slate-600">Sistema gratuito de voces de alta calidad</p>
              </div>
            </div>
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cerrar
              </motion.button>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Tutor Selection & Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" />
              Control de Voz
            </h2>

            {/* Tutor Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Selecciona Tutor
              </label>
              <div className="grid grid-cols-2 gap-3">
                {tutorProfiles.map((tutor) => (
                  <motion.button
                    key={tutor.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTutorChange(tutor.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      currentTutor === tutor.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-bold text-slate-800">{tutor.name}</div>
                    <div className="text-xs text-slate-600">{tutor.language}</div>
                    <div className="text-xs text-slate-500 mt-1">{tutor.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Texto de Prueba
              </label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
                placeholder="Escribe el texto que quieres escuchar..."
              />
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSpeak}
                disabled={!isInitialized || isSpeaking}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  !isInitialized || isSpeaking
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : isPaused
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4" />
                    Reanudar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    {isSpeaking ? 'Hablando...' : 'Hablar'}
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePause}
                disabled={!isSpeaking || isPaused}
                className="px-4 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Pause className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStop}
                disabled={!isSpeaking}
                className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Square className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Test All Voices */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={testAllVoices}
              disabled={!isInitialized || isSpeaking}
              className="w-full mt-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              Probar Todas las Voces
            </motion.button>
          </motion.div>

          {/* Voice Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Current Voice Info */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-500" />
                Información de Voz Actual
              </h2>

              {voiceInfo ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="text-sm text-slate-600 mb-1">Voz Seleccionada</div>
                    <div className="font-bold text-slate-800">{voiceInfo.voice.name}</div>
                    <div className="text-sm text-slate-600">{voiceInfo.voice.lang}</div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="text-sm text-slate-600 mb-1">Perfil del Tutor</div>
                    <div className="font-bold text-slate-800">{voiceInfo.profile.tutorId}</div>
                    <div className="text-sm text-slate-600">Personalidad: {voiceInfo.profile.personality}</div>
                    <div className="text-sm text-slate-600">
                      Config: Rate={voiceInfo.profile.config.rate}, Pitch={voiceInfo.profile.config.pitch}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="text-sm text-slate-600 mb-1">Estado</div>
                    <div className="font-bold text-green-700">
                      {isSpeaking ? (isPaused ? 'Pausado' : 'Hablando') : 'Inactivo'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Volume2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Selecciona un tutor para ver la información de voz</p>
                </div>
              )}
            </div>

            {/* Available Voices */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-500" />
                  Voces Disponibles
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm transition-colors"
                >
                  {showAdvanced ? 'Simple' : 'Avanzado'}
                </motion.button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {showAdvanced ? (
                  availableVoices.map((voice, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 rounded-lg text-sm"
                    >
                      <div className="font-medium text-slate-800">{voice.name}</div>
                      <div className="text-slate-600">{voice.lang}</div>
                    </div>
                  ))
                ) : (
                  getHighQualityVoices().map((voice, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-sm border border-blue-200"
                    >
                      <div className="font-medium text-slate-800">{voice.name}</div>
                      <div className="text-slate-600">{voice.lang}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 text-center">
                <div className="text-sm text-slate-600">
                  {showAdvanced 
                    ? `Total: ${availableVoices.length} voces`
                    : `Alta calidad: ${getHighQualityVoices().length} voces`
                  }
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-white rounded-3xl shadow-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-yellow-500'} ${isSpeaking ? 'animate-pulse' : ''}`} />
              <span className="text-sm text-slate-600">
                {isInitialized ? 'Servicio inicializado' : 'Inicializando...'}
                {isSpeaking && (isPaused ? ' (Pausado)' : ' (Hablando)')}
              </span>
            </div>
            <div className="text-sm text-slate-500">
              {availableVoices.length} voces disponibles
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
