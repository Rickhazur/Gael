import React, { useRef, useEffect } from 'react';
import type { Language, TextAnalysis, Grade, TemplateId } from '../../types/research';
import { cn } from '../../lib/utils';
import { PenLine, AlertTriangle, Tv, Landmark, Presentation, FileText, Sparkles, Loader2, Wand2, Mic } from 'lucide-react';
import { callChatApi } from '../../../../../services/ai_service';
import { toast } from '../../hooks/use-toast';

import { findComplexWord } from '../../lib/wordComplexity';

interface ReportEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: Language;
  analysis: TextAnalysis | null;
  disabled?: boolean;
  grade: Grade;
  template?: TemplateId;
  sourceText?: string;
  onRefine?: (newText: string) => void;
}

export function ReportEditor({ value, onChange, language, analysis, disabled, grade, template = 'classic', sourceText = '' }: ReportEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const complexWord = React.useMemo(() => {
    if (value.length < 30) return null;
    return findComplexWord(value, language);
  }, [value, language]);

  const [isRefining, setIsRefining] = React.useState(false);

  const wordCount = value.split(/\s+/).filter(w => w.length > 0).length;
  // Use passed analysis OR local calculation for immediate feedback
  const [realTimePlagiarism, setRealTimePlagiarism] = React.useState(0);

  // Real-time Copy Check
  useEffect(() => {
    if (!sourceText || value.length < 50) {
      setRealTimePlagiarism(0);
      return;
    }
    // Simple 5-gram check
    const sourceWords = sourceText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    const reportWords = value.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);

    if (reportWords.length < 5) return;

    let matches = 0;
    const windowSize = 5;

    for (let i = 0; i < reportWords.length - windowSize + 1; i++) {
      const chunk = reportWords.slice(i, i + windowSize).join(' ');
      if (sourceText.toLowerCase().includes(chunk)) {
        matches += windowSize;
        i += windowSize - 1; // Skip ahead
      }
    }

    const percentage = Math.min(100, Math.round((matches / reportWords.length) * 100));
    setRealTimePlagiarism(percentage);

  }, [value, sourceText]);

  const isPlagiarism = (analysis?.isPlagiarism ?? false) || realTimePlagiarism > 30;
  const plagiarismPercentage = Math.max(analysis?.plagiarismPercentage ?? 0, realTimePlagiarism);

  // Grade-specific word targets (based on reference table)
  const gradeTargets = {
    1: { min: 30, max: 100 },
    2: { min: 50, max: 150 },
    3: { min: 100, max: 250 },
    4: { min: 150, max: 350 },
    5: { min: 300, max: 400 },
  };

  const target = gradeTargets[grade];
  const progress = Math.min((wordCount / target.min) * 100, 100);

  const templateConfig = {
    classic: {
      icon: PenLine,
      title: { es: 'Tu Reporte', en: 'Your Report' },
      placeholder: {
        es: `Escribe tu reporte aquí...\nPara ${grade}º grado: al menos ${target.min} palabras.`,
        en: `Write your report here...\nFor grade ${grade}: at least ${target.min} words.`
      }
    },
    news_script: {
      icon: Tv,
      title: { es: 'Guion de Noticias', en: 'News Script' },
      placeholder: {
        es: `¡Hola a todos! Bienvenidos al noticiero...\n(Escribe tu guion aquí. Recuerda entrevistar a expertos y dar datos curiosos)`,
        en: `Hello everyone! Welcome to the news...\n(Write your script here. Remember to interview experts and give fun facts)`
      }
    },
    museum_card: {
      icon: Landmark,
      title: { es: 'Tarjeta de Exhibición', en: 'Exhibit Card' },
      placeholder: {
        es: `Nombre del Objeto: ...\nAntigüedad: ...\nDescripción: (Describe por qué es importante este objeto para la historia...)`,
        en: `Object Name: ...\nAge: ...\nDescription: (Describe why this object is important regarding history...)`
      }
    },
    scientific_poster: {
      icon: Presentation,
      title: { es: 'Póster Científico', en: 'Scientific Poster' },
      placeholder: {
        es: `Hipótesis: ...\nEvidencia: ...\nConclusión: ...\n(Usa puntos clave y datos exactos)`,
        en: `Hypothesis: ...\nEvidence: ...\nConclusion: ...\n(Use key points and exact data)`
      }
    },
    podcast: {
      icon: Mic,
      title: { es: 'Podcast Educativo', en: 'Educational Podcast' },
      placeholder: {
        es: `Nova: ¡Hola! Hoy vamos a hablar sobre...\nInvitado: Qué interesante, yo sabía que...\n(Escribe tu guion conversacional aquí)`,
        en: `Nova: Hello! Today we are talking about...\nGuest: How interesting, I knew that...\n(Write your conversational script here)`
      }
    }
  };

  const config = templateConfig[template];
  const TemplateIcon = config.icon;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(200, textareaRef.current.scrollHeight)}px`;
    }
  }, [value, template]);

  const insertAtCursor = (text: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + text.length;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleAIRefine = async () => {
    if (value.length < 50) {
      toast({
        title: language === 'es' ? 'Texto muy corto' : 'Text too short',
        description: language === 'es' ? 'Escribe al menos 50 caracteres para poder ayudarte.' : 'Write at least 50 characters so I can help you.',
        variant: 'destructive'
      });
      return;
    }

    setIsRefining(true);
    try {
      const prompt = language === 'es'
        ? `Eres Nova, una tutora experta. Ayuda al estudiante (Grado ${grade}) a mejorar este reporte SIN escribirlo tú por él. 
           Analiza el texto y da 3 sugerencias cortas y motivadoras sobre cómo mejorarlo (ej: vocabulario, conectores, más detalles). 
           Formato: JSON { "suggestions": ["sug1", "sug2", "sug3"] }
           Texto: "${value}"`
        : `You are Nova, an expert tutor. Help the student (Grade ${grade}) improve this report WITHOUT writing it for them.
           Analyze the text and give 3 short, motivating suggestions on how to improve it (e.g., vocabulary, connectors, more details).
           Format: JSON { "suggestions": ["sug1", "sug2", "sug3"] }
           Text: "${value}"`;

      const response = await callChatApi([{ role: 'user', content: prompt }], 'gpt-4o-mini', false);
      const data = JSON.parse(response.choices[0].message.content.match(/\{.*\}/s)[0]);

      toast({
        title: language === 'es' ? '✨ Sugerencias de Nova' : '✨ Nova\'s Suggestions',
        description: (
          <div className="mt-2 space-y-2">
            {data.suggestions.map((s: string, i: number) => (
              <p key={i} className="text-sm">🔹 {s}</p>
            ))}
          </div>
        ),
      });
    } catch (error) {
      console.error("Refine Error:", error);
      toast({
        title: language === 'es' ? 'Error de conexión' : 'Connection Error',
        description: language === 'es' ? 'Intenta de nuevo en un momento.' : 'Try again in a bit.',
        variant: 'destructive'
      });
    } finally {
      setIsRefining(false);
    }
  };

  useEffect(() => {
    (window as any).__insertReportText = insertAtCursor;
    return () => { delete (window as any).__insertReportText; };
  }, [value]);

  return (
    <div className="glass-panel p-6 space-y-4 relative">
      {/* Vocabulary Assistant Popover Suggestion */}
      {complexWord && (
        <div className="absolute top-2 right-6 bg-yellow-100 text-yellow-800 text-xs px-3 py-1.5 rounded-full animate-bounce shadow-md z-10 font-bold border border-yellow-300 flex gap-2 items-center cursor-help group">
          <span>💡</span>
          <span>
            {language === 'es' ? `"${complexWord}" es muy larga.` : `"${complexWord}" is tricky.`}
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 rounded hidden sm:inline-block">
            {language === 'es' ? '¿Hay una más simple?' : 'Try a simpler one?'}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="font-fredoka text-lg font-semibold text-foreground flex items-center gap-2">
          <TemplateIcon className="w-5 h-5 text-primary" />
          {config.title[language]}
        </h3>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-xs px-2 py-1 rounded-full font-medium',
              wordCount >= target.min ? 'bg-success/20 text-success' : 'bg-accent-soft text-accent'
            )}>
              {wordCount}/{target.min} {language === 'es' ? 'palabras' : 'words'}
            </span>
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={cn('h-full transition-all duration-300', wordCount >= target.min ? 'bg-success' : 'bg-accent')} style={{ width: `${progress}%` }} />
            </div>
          </div>

          {isPlagiarism && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-600 font-bold border border-red-500/50 animate-alert-flash">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-red-light" aria-hidden />
              <AlertTriangle className="w-3 h-3 text-red-600" />
              {plagiarismPercentage}% {language === 'es' ? 'similar' : 'similar'}
            </span>
          )}

          <button
            onClick={handleAIRefine}
            disabled={isRefining || value.length < 50}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg",
              "hover:from-violet-500 hover:to-indigo-500 hover:scale-105 active:scale-95 disabled:opacity-50"
            )}
          >
            {isRefining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            {language === 'es' ? 'Pulir con IA' : 'Polish with AI'}
          </button>
        </div>
      </div>

      {isPlagiarism && (
        <div className="rounded-xl overflow-hidden border-2 border-red-500/80 bg-slate-900 text-white animate-alert-flash animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 border-b border-red-500/50">
            <span className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-red-500 animate-red-light" style={{ animationDelay: `${i * 0.2}s` }} aria-hidden />
              ))}
            </span>
            <span className="font-black text-[10px] uppercase tracking-widest text-red-400">
              {language === 'es' ? '⚠ ALERTA DE NAVEGACIÓN — TEXTO MUY PARECIDO AL ORIGINAL' : '⚠ NAVIGATION ALERT — TEXT TOO SIMILAR TO SOURCE'}
            </span>
          </div>
          <div className="p-3 flex items-start gap-3">
            <div className="p-1.5 bg-red-500/20 rounded-full border border-red-500/50">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-200">
                {language === 'es' ? '¡Detecto Copia-Pega!' : 'Copy-Paste Detected!'}
              </p>
              <p className="text-xs text-red-200/90 mt-0.5">
                {language === 'es'
                  ? 'Intenta explicarlo con tus propias palabras, como si se lo contaras a un amigo.'
                  : 'Try to explain it in your own words, like telling a friend.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={config.placeholder[language]}
          className={cn(
            'w-full min-h-[250px] p-4 rounded-xl border-2 bg-background text-foreground resize-none',
            'focus:outline-none transition-all duration-200 font-nunito text-base leading-relaxed placeholder:text-muted-foreground/50',
            isPlagiarism ? 'border-destructive/50 focus:border-destructive focus:ring-2 focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        {!value && !disabled && (
          <div className="absolute bottom-4 left-4 text-muted-foreground/50 pointer-events-none">
            <span className="text-2xl animate-float">✏️</span>
          </div>
        )}
      </div>

      {wordCount > 0 && wordCount < target.min && (
        <p className="text-xs text-accent font-medium p-2 rounded-lg bg-accent/10">
          💡 {language === 'es' ? `Te faltan ${target.min - wordCount} palabras` : `You need ${target.min - wordCount} more words`}
        </p>
      )}

      {wordCount >= target.min && (
        <p className="text-xs text-success font-medium p-2 rounded-lg bg-success/10">
          ✨ {language === 'es' ? `¡Excelente tamaño para ${grade}º grado!` : `Excellent size for grade ${grade}!`}
        </p>
      )}
    </div>
  );
}
