import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, ArrowLeft, Star, Play, Volume2, VolumeX, Mic, MicOff, Zap, HelpCircle, SkipForward, ThumbsUp } from 'lucide-react';
import { Lesson } from '../../data/curriculumByGrade';
import { AiTutorService, ChatMessage } from './services/AiTutorService';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { generateSpeech, edgeTTS } from '../../services/edgeTTS';

interface SocraticClassroomProps {
  lesson: Lesson;
  gradeName: string;
  areaName: string;
  onBack: () => void;
  onComplete: (score: number) => void;
  /** If true, skip intro and go straight to ICFES training mode */
  quickMode?: boolean;
}

// ─── Speech Recognition Setup ───
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const SocraticClassroom: React.FC<SocraticClassroomProps> = ({
  lesson, gradeName, areaName, onBack, onComplete, quickMode = false
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (quickMode) return []; // Always fresh in quick mode
    const saved = localStorage.getItem(`icfes_chat_${lesson.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'chat' | 'results'>(quickMode ? 'chat' : 'intro');
  const [correctCount, setCorrectCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // ─── Auto-scroll to bottom ───
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ─── Persist chat history ───
  useEffect(() => {
    if (messages.length > 0 && !quickMode) {
      localStorage.setItem(`icfes_chat_${lesson.id}`, JSON.stringify(messages));
    }
  }, [messages, lesson.id, quickMode]);

  // ─── Speech events ───
  useEffect(() => {
    const onStart = () => setIsSpeaking(true);
    const onEnd = () => setIsSpeaking(false);
    window.addEventListener('nova-demo-voice', onStart);
    window.addEventListener('nova-demo-voice-end', onEnd);
    return () => {
      window.removeEventListener('nova-demo-voice', onStart);
      window.removeEventListener('nova-demo-voice-end', onEnd);
    };
  }, []);

  // ─── Auto-play voice for new assistant messages ───
  useEffect(() => {
    if (!isMuted && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        generateSpeech(lastMessage.content, 'lina');
      }
    }
  }, [messages, isMuted]);

  // ─── Track correct answers for celebrations ───
  useEffect(() => {
    if (messages.length >= 2) {
      const last = messages[messages.length - 1];
      if (last.role === 'assistant') {
        const content = last.content.toLowerCase();
        if (content.includes('exacto') || content.includes('correcto') || content.includes('¡bien!') || content.includes('🎉') || content.includes('excelente')) {
          setCorrectCount(prev => prev + 1);
          triggerConfetti();
        }
        // Count questions asked by Lina
        if (content.includes('?')) {
          setQuestionCount(prev => prev + 1);
        }
      }
    }
  }, [messages]);

  // ─── Auto-start in quick mode ───
  useEffect(() => {
    if (quickMode && messages.length === 0) {
      startClass();
    }
  }, [quickMode]);

  // ─── Speech Recognition ───
  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }
    
    // Stop Lina from speaking while listening
    edgeTTS.stop();
    
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'es-CO';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      if (event.results[0].isFinal) {
        setIsListening(false);
        // Auto-send after speech recognition completes
        setTimeout(() => {
          const form = document.getElementById('chat-form') as HTMLFormElement;
          form?.requestSubmit();
        }, 300);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // ─── Confetti effect ───
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  // ─── Lina Avatar with speaking animation ───
  const renderLinaAvatar = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-12 h-12 text-xl', lg: 'w-16 h-16 text-2xl' };
    return (
      <div className={`${sizes[size]} bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-md relative ${isSpeaking ? 'animate-pulse ring-2 ring-violet-400 ring-offset-2' : ''}`}>
        👩‍🏫
        {isSpeaking && size !== 'sm' && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center animate-bounce">
            <Volume2 className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
    );
  };

  // ─── Quick Reply Buttons ───
  const quickReplies = [
    { text: 'No entiendo 😅', icon: HelpCircle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { text: 'Dame otra pista', icon: Zap, color: 'text-violet-600 bg-violet-50 border-violet-200' },
    { text: 'Siguiente pregunta →', icon: SkipForward, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { text: '¡Ya entendí! 👍', icon: ThumbsUp, color: 'text-green-600 bg-green-50 border-green-200' },
  ];

  const handleQuickReply = (text: string) => {
    setInputValue(text);
    setTimeout(() => {
      const form = document.getElementById('chat-form') as HTMLFormElement;
      form?.requestSubmit();
    }, 100);
  };

  // ─── Start class ───
  const startClass = async () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    }
    
    setPhase('chat');
    
    if (messages.length > 0) return;

    setIsTyping(true);
    
    try {
      const prompt = quickMode
        ? AiTutorService.generateQuickICFESPrompt(lesson.title, areaName)
        : `Inicia la clase sobre "${lesson.title}".

REGLAS PARA TU PRIMER MENSAJE:
1. Saluda en 1 línea.
2. Plantea de inmediato un problema corto de la vida real en Colombia sobre el tema.
3. Preséntalo como pregunta tipo ICFES con 4 opciones (A, B, C, D).
4. ESPERA su respuesta. No des la respuesta.
5. Máximo 8 líneas en total.`;

      const responseText = await AiTutorService.getLinaResponse([
        { role: 'user', content: prompt }
      ], lesson.title, areaName);
      
      setMessages([{ role: 'assistant', content: responseText }]);
    } catch (error) {
      const fallback = AiTutorService.generateWelcomeMessage(lesson.title);
      setMessages([{ role: 'assistant', content: fallback }]);
    }
    setIsTyping(false);
  };

  // ─── Send message ───
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    // Stop Lina from speaking when student sends message
    edgeTTS.stop();

    const userMsg = inputValue.trim();
    setInputValue('');
    
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsTyping(true);

    const responseText = await AiTutorService.getLinaResponse(newMessages, lesson.title, areaName);
    
    setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    setIsTyping(false);
    
    // Focus input for quick response
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ─── Finish class ───
  const handleFinishClass = async () => {
    if (messages.length > 2) {
      await AiTutorService.updateStudentProfile(messages);
    }
    setPhase('results');
  };

  // ═══════════════════════════════════════════
  // INTRO PHASE
  // ═══════════════════════════════════════════
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="bg-white border-b border-slate-100 px-4 py-3">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-lg w-full text-center nova-card p-8 animate-fade-in-up">
            {renderLinaAvatar('lg')}
            <h1 className="text-2xl font-bold text-slate-800 mt-6 mb-2">Clase en Vivo con Lina</h1>
            <p className="text-violet-600 font-semibold mb-2">{lesson.title} ({gradeName})</p>
            
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4 mt-4 mb-6 text-left">
              <p className="text-sm text-violet-800 font-medium mb-2">🎯 Método Socrático ICFES:</p>
              <ul className="text-xs text-violet-700 space-y-1">
                <li>✅ Preguntas tipo examen real con 4 opciones</li>
                <li>✅ Lina te guía paso a paso sin darte la respuesta</li>
                <li>✅ Puedes hablar con el micrófono 🎤</li>
                <li>✅ Estrategias de descarte para el examen</li>
              </ul>
            </div>

            <button 
              onClick={startClass}
              className="nova-btn nova-btn-primary w-full rounded-xl !py-4 flex justify-center text-lg"
            >
              <Play className="w-5 h-5" /> Iniciar Entrenamiento ICFES
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RESULTS PHASE
  // ═══════════════════════════════════════════
  if (phase === 'results') {
    const score = questionCount > 0 ? Math.round((correctCount / questionCount) * 100) : 0;
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="max-w-lg w-full text-center animate-fade-in-up">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Star className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Clase Completada! 🎉</h2>
          <p className="text-slate-500 mb-4">{lesson.title}</p>
          
          <div className="nova-card p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-extrabold text-violet-600">{messages.filter(m => m.role === 'user').length}</p>
                <p className="text-xs text-slate-500">Respuestas</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-green-600">{correctCount}</p>
                <p className="text-xs text-slate-500">Aciertos</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-blue-600">{questionCount}</p>
                <p className="text-xs text-slate-500">Preguntas</p>
              </div>
            </div>
          </div>

          <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              {renderLinaAvatar('sm')}
              <p className="text-sm text-violet-700 text-left">
                {correctCount >= 3 
                  ? "¡Fantástico, parce! Estás progresando MUY bien. Sigue así y el ICFES será pan comido. 💪🔥"
                  : correctCount >= 1 
                    ? "¡Vas bien! Cada error es una oportunidad de aprender. Te recomiendo practicar este tema otra vez mañana. 🙌"
                    : "Tranquilo, esto es un proceso. Lo importante es que estás aquí aprendiendo. ¡Vamos a repetir esta clase! 💖"}
              </p>
            </div>
          </div>
          
          <button onClick={() => onComplete(score)} className="nova-btn nova-btn-primary w-full rounded-xl !py-4 text-lg">
            Continuar ✓
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // CHAT PHASE (Main interaction)
  // ═══════════════════════════════════════════
  return (
    <div className="h-screen bg-[#FAFAF8] flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ─── Confetti Overlay ─── */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-5%',
                width: `${8 + Math.random() * 8}px`,
                height: `${8 + Math.random() * 8}px`,
                backgroundColor: ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'][Math.floor(Math.random() * 5)],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animationDuration: `${1.5 + Math.random() * 1.5}s`,
                animationDelay: `${Math.random() * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ─── Header ─── */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 hover:bg-slate-50 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div className="flex items-center gap-2">
            {renderLinaAvatar('sm')}
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">
                Profe Lina 
                <span className={`text-xs font-normal ml-1 px-1.5 rounded border ${isSpeaking ? 'text-green-500 border-green-200 bg-green-50 animate-pulse' : 'text-emerald-500 border-emerald-200 bg-emerald-50'}`}>
                  {isSpeaking ? '🔊 Hablando' : 'IA'}
                </span>
              </p>
              <p className="text-[10px] text-slate-400 capitalize truncate max-w-[140px]">{lesson.title}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Score indicator */}
          {correctCount > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
              ⭐ {correctCount}
            </div>
          )}
          
          {/* Mute toggle */}
          <button 
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted) { edgeTTS.stop(); }
            }}
            className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-slate-100 text-slate-400' : 'bg-violet-50 text-violet-600'}`}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button 
            onClick={handleFinishClass}
            className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100"
          >
            Terminar ✓
          </button>
        </div>
      </div>
      
      {/* ─── Chat Messages ─── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 bg-slate-50" id="chat-container">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full">
              🎯 Entrenamiento ICFES — {areaName}
            </span>
          </div>

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 animate-fade-in-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && renderLinaAvatar('sm')}
              
              <div className={`relative group max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                msg.role === 'assistant' 
                  ? 'bg-white border border-slate-200 rounded-tl-none text-slate-700 prose prose-sm prose-violet max-w-none' 
                  : 'bg-gradient-to-br from-[#1B4D3E] to-[#2D7A5F] text-white rounded-tr-none'
              }`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <>
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                    >
                      {msg.content.replace(/\$(\d+[\d.,]*)/g, '$1 pesos').replace(/\$/g, 'pesos')}
                    </ReactMarkdown>
                    <button 
                      onClick={() => generateSpeech(msg.content, 'lina')}
                      className="absolute -right-10 top-2 p-2 bg-white border border-slate-100 rounded-full shadow-sm text-slate-400 hover:text-violet-600 opacity-0 group-hover:opacity-100 transition-all"
                      title="Escuchar mensaje"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 animate-fade-in-up">
              {renderLinaAvatar('sm')}
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex gap-1.5 items-center h-[52px]">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-400 ml-2">Lina está pensando...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* ─── Quick Replies ─── */}
      {!isTyping && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
        <div className="bg-white border-t border-slate-100 px-4 py-2">
          <div className="max-w-3xl mx-auto flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {quickReplies.map((qr, i) => (
              <button
                key={i}
                onClick={() => handleQuickReply(qr.text)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border whitespace-nowrap transition-all hover:scale-105 active:scale-95 ${qr.color}`}
              >
                <qr.icon className="w-3.5 h-3.5" />
                {qr.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Input Area ─── */}
      <div className="bg-white border-t border-slate-200 p-3 sm:p-4 pb-20 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <form id="chat-form" onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
          <div className={`relative flex items-center ${shakeInput ? 'animate-shake' : ''}`}>
            {/* Microphone button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`absolute left-2 w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' 
                  : 'bg-slate-100 text-slate-500 hover:bg-violet-100 hover:text-violet-600'
              }`}
              title={isListening ? 'Detener grabación' : 'Hablar con micrófono'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isListening ? "🎤 Escuchando..." : isTyping ? "Lina está pensando..." : "Escribe tu respuesta o usa el micrófono 🎤"}
              disabled={isTyping}
              className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 border border-transparent focus:border-violet-500 rounded-full py-4 pl-14 pr-14 text-sm transition-all disabled:opacity-50"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-2 w-10 h-10 bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">
              Impulsado por Nova IA · Método Socrático · {SpeechRecognitionAPI ? '🎤 Voz activada' : '⌨️ Solo texto'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SocraticClassroom;
