import React from 'react';
import type { TutorMessage, Language } from '@/types/research';
import { cn } from '@/lib/utils';
import { Lightbulb, AlertTriangle, Sparkles, Brain } from 'lucide-react';
import tutorAvatar from '@/assets/tutor-avatar.png';

interface TutorPanelProps {
  messages: TutorMessage[];
  isAnalyzing: boolean;
  language: Language;
  onStarterClick: (starter: string) => void;
  /** Oculta los botones "Empieza con:" (opciones) cuando el estudiante escribe la hipótesis en el chat */
  hideStarters?: boolean;
  onCheckIdea?: (idea: string) => void;
  showSocraticInput?: boolean;
  targetParagraphText?: string;
}

// Function to parse and render highlighted ideas
function renderHighlightedMessage(message: string) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Pattern to match [MAIN_IDEA]...[/MAIN_IDEA] and [SECONDARY_IDEA]...[/SECONDARY_IDEA]
  const mainIdeasPattern = /\[MAIN_IDEA\](.*?)\[\/MAIN_IDEA\]/g;
  const secondaryIdeasPattern = /\[SECONDARY_IDEA\](.*?)\[\/SECONDARY_IDEA\]/g;

  // Split by main ideas first
  let match;
  let tempHtml = message;
  let mainMatches = [];

  // Find all main idea matches
  const mainRegex = /\[MAIN_IDEA\](.*?)\[\/MAIN_IDEA\]/g;
  while ((match = mainRegex.exec(message)) !== null) {
    mainMatches.push({ start: match.index, end: match.index + match[0].length, type: 'main', content: match[1] });
  }

  // Find all secondary idea matches
  const secondaryRegex = /\[SECONDARY_IDEA\](.*?)\[\/SECONDARY_IDEA\]/g;
  while ((match = secondaryRegex.exec(message)) !== null) {
    mainMatches.push({ start: match.index, end: match.index + match[0].length, type: 'secondary', content: match[1] });
  }

  // Sort by position
  mainMatches.sort((a, b) => a.start - b.start);

  // Build the rendered output
  let currentPos = 0;
  mainMatches.forEach((item, index) => {
    if (currentPos < item.start) {
      parts.push(<span key={`text-${index}`}>{message.substring(currentPos, item.start)}</span>);
    }

    if (item.type === 'main') {
      parts.push(
        <span key={`main-${index}`} className="bg-yellow-200 font-bold px-1 rounded border border-yellow-400">
          {item.content}
        </span>
      );
    } else if (item.type === 'secondary') {
      parts.push(
        <span key={`secondary-${index}`} className="bg-blue-200 font-bold px-1 rounded border border-blue-400">
          {item.content}
        </span>
      );
    }

    currentPos = item.end;
  });

  if (currentPos < message.length) {
    parts.push(<span key="text-final">{message.substring(currentPos)}</span>);
  }

  return parts.length > 0 ? parts : message;
}

const typeIcons = {
  tip: Lightbulb,
  warning: AlertTriangle,
  encouragement: Sparkles,
  analysis: Brain,
};

const typeStyles = {
  tip: 'border-l-accent bg-accent-soft',
  warning: 'border-l-destructive bg-destructive/10',
  encouragement: 'border-l-success bg-success/10',
  analysis: 'border-l-secondary bg-secondary-soft',
};

export function TutorPanel({
  messages,
  isAnalyzing,
  language,
  onStarterClick,
  hideStarters = false,
  onCheckIdea,
  showSocraticInput = false,
  targetParagraphText
}: TutorPanelProps) {
  const [ideaInput, setIdeaInput] = React.useState('');

  if (isAnalyzing) {
    return (
      <div className="glass-panel p-6">
        <div className="flex flex-col gap-2">
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
    );
  }

  if (messages.length === 0) {
    return (
      <div className="glass-panel p-6">
        <div>
          <h3 className="font-fredoka text-lg font-semibold text-foreground mb-1">
            {language === 'es' ? '¡Hola! Soy tu tutor' : 'Hello! I\'m your tutor'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'es'
              ? 'Pega un texto sobre Historia, Geografía, Ciencias u otra asignatura y te ayudaré a escribir tu reporte.'
              : 'Paste text about History, Geography, Sciences or another subject and I\'ll help you write your report.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const Icon = typeIcons[message.type];
        const isWarning = message.type === 'warning';

        return (
          <div
            key={message.id}
            className={cn(
              'rounded-2xl p-5 border-l-4 animate-bubble-in',
              typeStyles[message.type],
              isWarning && 'plagiarism-warning'
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{message.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn(
                    'w-4 h-4',
                    isWarning ? 'text-destructive' : 'text-accent'
                  )} />
                  <span className="font-semibold text-sm uppercase tracking-wide">
                    {isWarning
                      ? (language === 'es' ? 'Alerta' : 'Alert')
                      : (language === 'es' ? 'Pista' : 'Tip')
                    }
                  </span>
                </div>
                <p className={cn(
                  'text-sm leading-relaxed mb-4',
                  isWarning ? 'text-destructive font-medium' : 'text-foreground'
                )}>
                  {renderHighlightedMessage(message.message)}
                </p>

                {!hideStarters && message.starters && message.starters.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {language === 'es' ? 'Empieza con:' : 'Start with:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.starters.map((starter, i) => (
                        <button
                          key={i}
                          onClick={() => onStarterClick(starter)}
                          className="starter-pill"
                          style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                        >
                          <span>✨</span>
                          <span>{starter}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {showSocraticInput && onCheckIdea && (
        <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-200 animate-bubble-in">
          {targetParagraphText && (
            <div className="mb-4 bg-white/50 p-3 rounded-xl border border-indigo-100 text-xs text-slate-600 italic leading-relaxed">
              <span className="font-bold block mb-1 text-indigo-400 uppercase tracking-widest text-[10px]">Párrafo a analizar:</span>
              "{targetParagraphText}"
            </div>
          )}
          <p className="text-sm font-bold text-indigo-700 mb-2">
            {language === 'es' ? '¿Cuál crees que es la idea principal?' : 'What do you think is the main idea?'}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={ideaInput}
              onChange={(e) => setIdeaInput(e.target.value)}
              placeholder={language === 'es' ? 'Escribe tu idea aquí...' : 'Write your idea here...'}
              className="flex-1 px-3 py-2 rounded-xl border-2 border-indigo-100 focus:border-indigo-400 focus:outline-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && ideaInput.trim()) {
                  onCheckIdea(ideaInput);
                  setIdeaInput('');
                }
              }}
            />
            <button
              onClick={() => {
                if (ideaInput.trim()) {
                  onCheckIdea(ideaInput);
                  setIdeaInput('');
                }
              }}
              disabled={!ideaInput.trim()}
              className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-bold text-xs hover:bg-indigo-600 disabled:opacity-50"
            >
              {language === 'es' ? 'Revisar' : 'Check'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
