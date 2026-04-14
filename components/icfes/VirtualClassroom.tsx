/**
 * Nova ICFES — Aula Virtual con Profesora Lina
 * Simulación de clase real con enseñanza socrática paso a paso.
 * La profesora explica, hace preguntas, da ejemplos y evalúa.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, ChevronRight, ChevronDown, Play, Pause, Volume2,
  BookOpen, Lightbulb, CheckCircle2, XCircle, Brain, MessageCircle,
  PenTool, Star, Award, GraduationCap, Clock, Sparkles, Loader2
} from 'lucide-react';
import { Lesson } from '../../data/curriculumByGrade';
import { AiQuestionGenerator } from './services/AiQuestionGenerator';
import { IcfesCategory } from './services/IcfesQuestionBank';
import { SocraticClassroom } from './SocraticClassroom';

interface VirtualClassroomProps {
  lesson: Lesson;
  gradeName: string;
  areaName: string;
  areaIcon: string;
  areaColor: string;
  onBack: () => void;
  onComplete: (score: number) => void;
}

type ClassPhase = 'intro' | 'teaching' | 'example' | 'terms' | 'practice' | 'results';

export const VirtualClassroom: React.FC<VirtualClassroomProps> = ({
  lesson, gradeName, areaName, areaIcon, areaColor, onBack, onComplete
}) => {
  const [phase, setPhase] = useState<ClassPhase>('intro');
  const [teachingParagraph, setTeachingParagraph] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  
  // AI Questions State
  const [dynamicQuestions, setDynamicQuestions] = useState<any[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  // Combine static lesson questions with AI generated ones
  const allQuestions = [...lesson.practiceQuestions, ...dynamicQuestions];

  // Split explanation into paragraphs for step-by-step teaching
  const paragraphs = lesson.explanation.split('\n\n').filter(p => p.trim());
  const currentParagraphs = paragraphs.slice(0, teachingParagraph + 1);

  // Typewriter effect for Lina's teaching
  useEffect(() => {
    if (phase === 'teaching' && teachingParagraph < paragraphs.length) {
      const text = paragraphs[teachingParagraph];
      setIsTyping(true);
      setDisplayedText('');
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.substring(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
          setIsTyping(false);
        }
      }, 8); // Fast typing
      return () => clearInterval(timer);
    }
  }, [phase, teachingParagraph]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayedText, phase, currentQuestion, showExplanation]);

  const handleAnswer = (optionId: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(optionId);
    const q = allQuestions[currentQuestion];
    if (optionId === q.correctId) {
      setScore(prev => prev + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowHint(false);
      setHintIndex(0);
    } else {
      setPhase('results');
    }
  };

  const mapAreaToCategory = (areaName: string): IcfesCategory => {
    const map: Record<string, IcfesCategory> = {
      'Lectura Crítica': 'LECTURA_CRITICA',
      'Matemáticas': 'MATEMATICAS',
      'Ciencias Naturales': 'CIENCIAS',
      'Sociales y Ciudadanas': 'SOCIALES',
      'Inglés': 'INGLES'
    };
    return map[areaName] || 'LECTURA_CRITICA';
  };

  const generateAiQuestion = async () => {
    setIsGeneratingAi(true);
    setPhase('practice');
    
    // Extract grade number from string like "Grado 6°"
    const gradeMatch = gradeName.match(/\d+/);
    const gradeStr = gradeMatch ? gradeMatch[0] : '11';
    
    const newQ = await AiQuestionGenerator.generateUniqueQuestion({
      category: mapAreaToCategory(areaName),
      topic: lesson.title,
      difficulty: 'medium',
      grade: parseInt(gradeStr)
    });
    
    setIsGeneratingAi(false);
    
    if (newQ) {
      setDynamicQuestions(prev => [...prev, newQ]);
      setCurrentQuestion(allQuestions.length); // Point to the new question
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowHint(false);
    } else {
      alert("Lo siento, no pude generar una pregunta en este momento. Revisa tu conexión de IA.");
    }
  };

  const advanceTeaching = () => {
    if (isTyping) {
      // Skip typing animation
      setDisplayedText(paragraphs[teachingParagraph]);
      setIsTyping(false);
      return;
    }
    if (teachingParagraph < paragraphs.length - 1) {
      setTeachingParagraph(prev => prev + 1);
    } else {
      // Done teaching, go to examples or terms
      if (lesson.examples.length > 0) {
        setPhase('example');
      } else if (lesson.keyTerms && lesson.keyTerms.length > 0) {
        setPhase('terms');
      } else {
        setPhase('practice');
      }
    }
  };

  const renderLinaAvatar = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-12 h-12 text-xl', lg: 'w-16 h-16 text-2xl' };
    return (
      <div className={`${sizes[size]} bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-md`}>
        👩‍🏫
      </div>
    );
  };

  const renderChatBubble = (content: React.ReactNode, isLina: boolean = true) => (
    <div className={`flex gap-3 mb-4 animate-fade-in-up ${isLina ? '' : 'flex-row-reverse'}`}>
      {isLina && renderLinaAvatar('sm')}
      <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
        isLina 
          ? 'bg-white border border-slate-200 rounded-tl-none shadow-sm' 
          : 'bg-[#1B4D3E] text-white rounded-tr-none'
      }`}>
        {content}
      </div>
    </div>
  );

  // Format markdown-like text to HTML
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '&bull; ')
      .replace(/→ /g, '→ ')
      .replace(/\| /g, '| ');
  };

  // ─── INTRO PHASE ───
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="bg-white border-b border-slate-100 px-4 py-3">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center animate-fade-in-up">
            {renderLinaAvatar('lg')}
            <div className="mt-6 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                style={{ backgroundColor: areaColor + '15', color: areaColor }}>
                {areaIcon} {areaName} · {gradeName}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mt-4 mb-2">{lesson.title}</h1>
            <p className="text-slate-500 mb-2">{lesson.objective}</p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mb-8">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {lesson.duration}</span>
              <span className="flex items-center gap-1"><PenTool className="w-3.5 h-3.5" /> {lesson.practiceQuestions.length} preguntas</span>
              <span className="flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5" /> {lesson.examples.length} ejemplos</span>
            </div>

            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                {renderLinaAvatar('sm')}
                <div>
                  <p className="text-sm font-semibold text-violet-900">Profesora Lina</p>
                  <p className="text-sm text-violet-700 mt-1">
                    ¡Hola! 😊 Hoy vamos a aprender <strong>{lesson.title}</strong>. 
                    Yo te explico paso a paso, con ejemplos de la vida real. 
                    Después practicamos juntos. ¿Listo?
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setPhase('teaching')}
              className="nova-btn nova-btn-primary w-full rounded-xl text-lg !py-4"
              id="btn-start-class"
            >
              <Play className="w-5 h-5" />
              Empezar la Clase
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS PHASE ───
  if (phase === 'results') {
    const percent = Math.round((score / allQuestions.length) * 100);
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="max-w-lg w-full text-center animate-fade-in-up">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
            percent >= 80 ? 'bg-green-100' : percent >= 50 ? 'bg-amber-100' : 'bg-orange-100'
          }`}>
            {percent >= 80 ? <Star className="w-12 h-12 text-green-600" />
             : percent >= 50 ? <Award className="w-12 h-12 text-amber-600" />
             : <GraduationCap className="w-12 h-12 text-orange-600" />}
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {percent >= 80 ? '¡Excelente clase!' : percent >= 50 ? '¡Buen trabajo!' : '¡Seguimos aprendiendo!'}
          </h2>
          <p className="text-slate-500 mb-6">{lesson.title}</p>

          <div className="nova-card p-6 mb-6">
            <div className="text-4xl font-extrabold text-slate-800 mb-1">{score}/{allQuestions.length}</div>
            <p className="text-sm text-slate-500">respuestas correctas</p>
            <div className="nova-progress mt-4">
              <div className="nova-progress-bar" style={{ width: `${percent}%`, backgroundColor: percent >= 80 ? '#059669' : percent >= 50 ? '#D97706' : '#EA580C' }} />
            </div>
          </div>

          <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              {renderLinaAvatar('sm')}
              <p className="text-sm text-violet-700 text-left">
                {percent >= 80 
                  ? "¡Fantástico! Dominas este tema. Puedes avanzar a la siguiente lección con confianza. 🌟"
                  : percent >= 50 
                    ? "Vas bien, pero te recomiendo repasar los conceptos que fallaste. ¡La práctica hace al maestro! 💪"
                    : "No te preocupes, este tema es difícil para muchos. Te recomiendo volver a leer la explicación y repetir la práctica. ¡Tú puedes! 🙌"
                }
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={generateAiQuestion} 
              disabled={isGeneratingAi}
              className="nova-btn border-2 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300 w-full rounded-xl bg-white flex justify-center py-4"
            >
              {isGeneratingAi ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isGeneratingAi ? 'Pensando pregunta...' : 'Generar más práctica con IA'}
            </button>
            <div className="flex gap-3">
              <button onClick={onBack} className="nova-btn nova-btn-secondary flex-1 rounded-xl">
                Volver a Ruta
              </button>
              <button onClick={() => onComplete(percent)} className="nova-btn nova-btn-primary flex-1 rounded-xl">
                Completar ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN CLASS VIEW (Teaching, Examples, Practice) ───
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 hover:bg-slate-50 rounded-lg">
              <ArrowLeft className="w-4 h-4 text-slate-500" />
            </button>
            <div>
              <p className="text-sm font-bold text-slate-800">{lesson.title}</p>
              <p className="text-xs text-slate-400">{areaIcon} {areaName} · {gradeName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              phase === 'teaching' ? 'bg-violet-100 text-violet-700' 
              : phase === 'example' ? 'bg-blue-100 text-blue-700'
              : phase === 'terms' ? 'bg-amber-100 text-amber-700'
              : 'bg-green-100 text-green-700'
            }`}>
              {phase === 'teaching' ? '📖 Clase' 
               : phase === 'example' ? '💡 Ejemplo'
               : phase === 'terms' ? '📝 Términos'
               : `✏️ ${currentQuestion + 1}/${allQuestions.length}${currentQuestion >= lesson.practiceQuestions.length ? ' ✨ IA' : ''}`}
            </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto" ref={contentRef}>
        <div className="max-w-3xl mx-auto px-4 py-6">

          {/* ─── TEACHING PHASE ─── */}
          {phase === 'teaching' && (
            <div className="space-y-4">
              {/* Previous paragraphs */}
              {currentParagraphs.slice(0, -1).map((p, i) => (
                <div key={i}>
                  {renderChatBubble(
                    <div dangerouslySetInnerHTML={{ __html: formatText(p) }} />
                  )}
                </div>
              ))}

              {/* Current paragraph (typing) */}
              {renderChatBubble(
                <div>
                  <div dangerouslySetInnerHTML={{ __html: formatText(displayedText) }} />
                  {isTyping && <span className="inline-block w-2 h-4 bg-violet-400 ml-1 animate-pulse" />}
                </div>
              )}

              {/* Continue button */}
              <div className="flex justify-center pt-2">
                <button 
                  onClick={advanceTeaching}
                  className="nova-btn nova-btn-primary rounded-xl !px-8 animate-fade-in-up"
                >
                  {isTyping ? 'Saltar animación' : teachingParagraph < paragraphs.length - 1 ? 'Continuar →' : '¡Vamos a los ejemplos! →'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 pt-2">
                {paragraphs.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${
                    i <= teachingParagraph ? 'bg-violet-500' : 'bg-slate-200'
                  }`} />
                ))}
              </div>
            </div>
          )}

          {/* ─── EXAMPLE PHASE ─── */}
          {phase === 'example' && (
            <div className="space-y-4">
              {renderChatBubble(
                <div>
                  <p className="font-bold text-violet-800 mb-2">💡 Ejemplo {currentExample + 1} de {lesson.examples.length}</p>
                  <div className="bg-slate-50 rounded-lg p-3 mb-3">
                    <p className="font-semibold text-slate-700">{lesson.examples[currentExample].problem}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-green-800">
                      <strong>Solución:</strong> {lesson.examples[currentExample].solution}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-2">
                <button 
                  onClick={() => {
                    if (currentExample < lesson.examples.length - 1) {
                      setCurrentExample(prev => prev + 1);
                    } else {
                      if (lesson.keyTerms && lesson.keyTerms.length > 0) setPhase('terms');
                      else setPhase('practice');
                    }
                  }}
                  className="nova-btn nova-btn-primary rounded-xl !px-8 animate-fade-in-up"
                >
                  {currentExample < lesson.examples.length - 1 ? 'Siguiente ejemplo →' 
                   : lesson.keyTerms && lesson.keyTerms.length > 0 ? 'Ver vocabulario clave →'
                   : '¡A practicar! →'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── KEY TERMS PHASE ─── */}
          {phase === 'terms' && (
            <div className="space-y-4">
              {renderChatBubble(
                <div>
                  <p className="font-bold text-amber-800 mb-3">📝 Vocabulario clave de esta lección:</p>
                  <div className="space-y-2">
                    {lesson.keyTerms?.map((t, i) => (
                      <div key={i} className="bg-amber-50 rounded-lg p-3">
                        <p className="font-bold text-slate-800">{t.term}</p>
                        <p className="text-sm text-slate-600">{t.definition}</p>
                      </div>
                    ))}
                  </div>
                  {lesson.keyFormulas && (
                    <div className="mt-4">
                      <p className="font-bold text-blue-800 mb-2">📐 Fórmulas:</p>
                      <div className="bg-blue-50 rounded-lg p-3 space-y-1">
                        {lesson.keyFormulas.map((f, i) => (
                          <p key={i} className="text-sm font-mono text-blue-900">{f}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center pt-2">
                <button 
                  onClick={() => setPhase('practice')}
                  className="nova-btn nova-btn-primary rounded-xl !px-8 animate-fade-in-up"
                >
                  ¡A practicar! →
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── PRACTICE PHASE (SOCRATIC CHAT) ─── */}
          {phase === 'practice' && (
            <div className="h-[600px] border border-slate-200 rounded-2xl overflow-hidden shadow-lg relative">
              {/* Import and render the new Socratic Chat automatically */}
              <SocraticClassroom 
                lesson={lesson} 
                gradeName={gradeName} 
                areaName={areaName}
                onBack={onBack} 
                onComplete={onComplete} 
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VirtualClassroom;
