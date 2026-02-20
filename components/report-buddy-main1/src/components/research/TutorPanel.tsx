import React from 'react';
import type { TutorMessage, Language, Grade } from '../../types/research';
import { cn } from '../../lib/utils';
import { Lightbulb, AlertTriangle, Sparkles, Brain, Send } from 'lucide-react';
import { StationAvatar } from '../../../../ResearchCenter/StationAvatar';
import { motion } from 'framer-motion';

interface TutorPanelProps {
  messages: TutorMessage[];
  isAnalyzing: boolean;
  language: Language;
  onStarterClick: (starter: string) => void;
  grade: Grade;
  searchContext?: string;
  tutorPhase: 'modeling' | 'practice' | 'feedback' | 'generation' | 'idle';
  onCheckAnalysis?: (main: string, sec: string) => void;
  onStartPractice?: () => void;
}

const typeIcons = {
  tip: Lightbulb,
  warning: AlertTriangle,
  encouragement: Sparkles,
  analysis: Brain,
};

const gradeColors: Record<Grade, string> = {
  1: 'bg-blue-100 text-blue-800 border-blue-300',
  2: 'bg-green-100 text-green-800 border-green-300',
  3: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  4: 'bg-orange-100 text-orange-800 border-orange-300',
  5: 'bg-purple-100 text-purple-800 border-purple-300',
};

const highlightColors: Record<Grade, string> = {
  1: 'bg-blue-200 text-blue-900',
  2: 'bg-green-200 text-green-900',
  3: 'bg-yellow-200 text-yellow-900',
  4: 'bg-orange-200 text-orange-900',
  5: 'bg-purple-200 text-purple-900',
};

const formatMessage = (text: string, grade: Grade) => {
  // Simple heuristic: highlight words inside *asterisks* or just specific key phrases if needed.
  // For now, let's assume we highlight text between ** ** like markdown bold, but apply specific colors.
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={index} className={cn("px-1 rounded mx-0.5 font-extrabold", highlightColors[grade])}>
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
};

export function TutorPanel({
  messages,
  isAnalyzing,
  language,
  onStarterClick,
  grade,
  searchContext,
  tutorPhase,
  onCheckAnalysis,
  onStartPractice
}: TutorPanelProps) {
  const [studentMain, setStudentMain] = React.useState('');
  const [studentSec, setStudentSec] = React.useState('');
  if (isAnalyzing) {
    return (
      <div className="glass-panel p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16">
            <StationAvatar isSpeaking={false} isLoading={true} size={64} />
          </div>
          <div>
            <h3 className="font-fredoka text-lg font-semibold text-foreground mb-1">
              {language === 'es' ? 'Analizando...' : 'Analyzing...'}
            </h3>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    const hasContext = !!searchContext;
    return (
      <div className="glass-panel p-6 border-2 border-indigo-100 bg-indigo-50/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 relative">
            <StationAvatar isSpeaking={false} size={64} />
            <motion.div
              className="absolute -right-2 -bottom-2 text-2xl"
              animate={{ y: [0, -5, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🖐️
            </motion.div>
          </div>
          <div>
            <h3 className="font-fredoka text-lg font-semibold text-indigo-900 mb-1">
              {language === 'es' ? '¡Hola! Soy tu tutor' : 'Hello! I\'m your tutor'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-bold">
              {language === 'es'
                ? (hasContext
                  ? `¡Veo que ya tienes información sobre ${searchContext.toUpperCase()}! 🚀 Pulsa el botón "Analizar texto" para que empecemos.`
                  : 'Pega un texto sobre tu investigación y te ayudaré a escribir tu reporte.')
                : (hasContext
                  ? `I see you have information about ${searchContext.toUpperCase()}! 🚀 Press "Analyze text" to start.`
                  : 'Paste text from your research and I\'ll help you write your report.')
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const Icon = typeIcons[message.type];
        const isWarning = message.type === 'warning';

        // Nova espacial: alerta tipo "nave a punto de estrellarse" con señales rojas parpadeantes
        if (isWarning) {
          return (
            <div
              key={message.id}
              className={cn(
                'rounded-2xl overflow-hidden border-2 border-red-500/80 bg-slate-900 text-white animate-alert-flash',
                'animate-bubble-in'
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Barra tipo cabina: luces rojas que se prenden y apagan */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border-b border-red-500/50">
                <span className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-red-500 animate-red-light"
                      style={{ animationDelay: `${i * 0.15}s` }}
                      aria-hidden
                    />
                  ))}
                </span>
                <span className="font-black text-xs uppercase tracking-[0.2em] text-red-400">
                  {language === 'es' ? '⚠ ALERTA DE NAVEGACIÓN' : '⚠ NAVIGATION ALERT'}
                </span>
                <span className="flex gap-1.5 ml-auto">
                  {[6, 7, 8].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-red-500 animate-red-light"
                      style={{ animationDelay: `${i * 0.12}s` }}
                      aria-hidden
                    />
                  ))}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/20 rounded-full border border-red-500/50">
                    <Icon className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black uppercase tracking-wider text-red-400 mb-1">
                      {language === 'es' ? 'Texto muy parecido al original — reescribe con tus palabras' : 'Text too similar to original — rewrite in your own words'}
                    </p>
                    <div className="text-sm leading-relaxed text-red-100 font-medium">
                      {formatMessage(message.message, grade)}
                    </div>

                    {message.starters && message.starters.length > 0 && (
                      <div className="space-y-2 mt-4 pt-3 border-t border-red-500/30">
                        <p className="text-xs font-bold text-red-300 uppercase tracking-wide">
                          {language === 'es' ? 'Puedes empezar así:' : 'Start with:'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.starters.map((starter, i) => (
                            <button
                              key={i}
                              onClick={() => onStarterClick(starter)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-red-500/30 hover:bg-slate-700 hover:border-red-400/50 text-red-100 text-xs font-bold transition-all"
                            >
                              <span>✨ </span>
                              <span>{starter}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        const cardStyle = gradeColors[grade];
        const hasCustomIcon = !!message.icon && typeof message.icon === 'string' && message.icon.length <= 2;

        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={cn(
              'rounded-2xl p-5 border-l-4 shadow-sm relative overflow-hidden',
              cardStyle
            )}
          >
            {/* Background decorative element for analysis */}
            {message.type === 'analysis' && (
              <div className="absolute top-0 right-0 p-2 opacity-10 rotate-12 pointer-events-none">
                <Brain className="w-12 h-12" />
              </div>
            )}

            <div className="flex items-start gap-3 relative z-10">
              <div className="p-2 bg-white/50 rounded-full flex items-center justify-center min-w-[40px] h-[40px]">
                {hasCustomIcon ? (
                  <span className="text-xl leading-none">{message.icon}</span>
                ) : (
                  <Icon className="w-6 h-6 text-current opacity-80" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-xs uppercase tracking-widest opacity-60">
                    {message.type === 'analysis' ? (language === 'es' ? 'Protocolo Detective' : "Detective Protocol") : (language === 'es' ? 'Pista de Nova' : 'Nova\'s Clue')}
                  </span>
                </div>
                <div className="text-sm leading-relaxed mb-4 font-medium whitespace-pre-wrap">
                  {formatMessage(message.message, grade)}
                </div>

                {message.starters && message.starters.length > 0 && (
                  <div className="space-y-2 mt-4 pt-3 border-t border-black/5">
                    <p className="text-xs font-bold opacity-70 uppercase tracking-wide">
                      {language === 'es' ? 'Puedes empezar así:' : 'Start with:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.starters.map((starter, i) => (
                        <button
                          key={i}
                          onClick={() => onStarterClick(starter)}
                          className="px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-xs font-bold shadow-sm hover:shadow transition-all text-current"
                        >
                          <span>✨ </span>
                          <span>{starter}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* PHASE 1: CONTINUE TO PRACTICE */}
      {tutorPhase === 'modeling' && (
        <div className="mt-4 flex justify-center animate-in slide-in-from-bottom-2">
          <button
            onClick={onStartPractice}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all outline-none ring-4 ring-blue-500/20"
          >
            <Sparkles className="w-5 h-5" />
            {language === 'es' ? '¡Quiero probar yo!' : 'I want to try!'}
          </button>
        </div>
      )}

      {/* PHASE 2: PRACTICE INPUTS */}
      {tutorPhase === 'practice' && (
        <div className="mt-4 glass-panel p-5 border-2 border-indigo-400/50 bg-indigo-50/30 animate-in zoom-in-95">
          <h4 className="font-fredoka font-bold text-indigo-900 mb-3 flex items-center gap-2 text-lg">
            <Brain className="w-6 h-6" />
            {language === 'es' ? `Tu turno: Parrafo 2` : `Your turn: Paragraph 2`}
          </h4>

          <div className="space-y-4">
            <div className="bg-white/60 p-3 rounded-xl border border-indigo-200 shadow-inner">
              <label className="text-xs font-black uppercase tracking-wider text-indigo-700 block mb-1">
                {language === 'es' ? '¿Cuál es la idea principal?' : 'What is the main idea?'}
              </label>
              <textarea
                value={studentMain}
                onChange={(e) => setStudentMain(e.target.value)}
                placeholder={language === 'es' ? "Escribe la idea principal aquí..." : "Write the main idea here..."}
                className="w-full p-3 rounded-xl border-0 bg-transparent focus:ring-0 min-h-[60px] text-sm resize-none"
              />
            </div>

            <div className="bg-white/60 p-3 rounded-xl border border-indigo-200 shadow-inner">
              <label className="text-xs font-black uppercase tracking-wider text-indigo-700 block mb-1">
                {language === 'es' ? '¿Cuál es la idea secundaria?' : 'What is the secondary idea?'}
              </label>
              <textarea
                value={studentSec}
                onChange={(e) => setStudentSec(e.target.value)}
                placeholder={language === 'es' ? "Escribe un detalle o idea secundaria..." : "Write a detail or secondary idea..."}
                className="w-full p-3 rounded-xl border-0 bg-transparent focus:ring-0 min-h-[60px] text-sm resize-none"
              />
            </div>

            <button
              onClick={() => {
                onCheckAnalysis?.(studentMain, studentSec);
                // Clear inputs after submission? Maybe wait for feedback.
              }}
              disabled={!studentMain || !studentSec || isAnalyzing}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
            >
              {isAnalyzing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  {language === 'es' ? 'Enviar a Nova' : 'Send to Nova'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
