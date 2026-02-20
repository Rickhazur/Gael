import React, { useEffect, useState } from 'react';
import type { Grade, Language } from '../../types/research';
import { cn } from '../../lib/utils';
import { CheckCircle, AlertCircle, Lightbulb, Star, TrendingUp } from 'lucide-react';

export type FeedbackType = 'success' | 'warning' | 'tip' | 'encouragement' | 'progress';

export interface WritingFeedback {
  id: string;
  type: FeedbackType;
  message: string;
  icon: React.ReactNode;
}

interface WritingFeedbackPopupProps {
  feedback: WritingFeedback | null;
  onDismiss: () => void;
}

const feedbackStyles: Record<FeedbackType, string> = {
  success: 'bg-success/95 text-success-foreground border-success',
  warning: 'bg-destructive/95 text-destructive-foreground border-destructive',
  tip: 'bg-accent/95 text-accent-foreground border-accent',
  encouragement: 'bg-primary/95 text-primary-foreground border-primary',
  progress: 'bg-secondary/95 text-secondary-foreground border-secondary',
};

export function WritingFeedbackPopup({ feedback, onDismiss }: WritingFeedbackPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isNovaAlert = feedback?.id === 'copy-warning';

  useEffect(() => {
    if (feedback) {
      setIsVisible(true);
      // La alarma de copy-paste se muestra más tiempo para que el niño la lea
      const isCopyWarning = feedback.id === 'copy-warning';
      const duration = isCopyWarning ? 10000 : 4000;
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [feedback, onDismiss]);

  if (!feedback) return null;

  if (isNovaAlert) {
    return (
      <div
        className={cn(
          'fixed bottom-24 right-6 z-50 max-w-sm rounded-2xl overflow-hidden border-2 border-red-500/80 shadow-xl',
          'transform transition-all duration-300 ease-out bg-slate-900 text-white animate-alert-flash',
          isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 border-b border-red-500/50">
          <span className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-red-500 animate-red-light" style={{ animationDelay: `${i * 0.15}s` }} aria-hidden />
            ))}
          </span>
          <span className="font-black text-[10px] uppercase tracking-widest text-red-400">
            ⚠ Alerta de navegación
          </span>
        </div>
        <div className="p-4 flex items-start gap-3">
          <span className="text-xl flex-shrink-0">{feedback.icon}</span>
          <p className="text-sm font-medium leading-relaxed text-red-100">{feedback.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed bottom-24 right-6 z-50 max-w-sm p-4 rounded-2xl border-2 shadow-xl',
        'transform transition-all duration-300 ease-out',
        feedbackStyles[feedback.type],
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{feedback.icon}</span>
        <p className="text-sm font-medium leading-relaxed">{feedback.message}</p>
      </div>
    </div>
  );
}

// Grade-specific writing expectations and feedback generator
export function generateWritingFeedback(
  text: string,
  grade: Grade,
  language: Language,
  sourceText: string
): WritingFeedback | null {
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 5).length;

  // Grade-specific expectations
  const gradeExpectations = {
    1: { minWords: 15, minSentences: 2, maxWords: 40 },
    2: { minWords: 25, minSentences: 3, maxWords: 60 },
    3: { minWords: 40, minSentences: 4, maxWords: 100 },
    4: { minWords: 60, minSentences: 5, maxWords: 150 },
    5: { minWords: 300, minSentences: 6, maxWords: 400 },
  };

  const expectations = gradeExpectations[grade];

  // Alarma cuando el reporte tiene muchas palabras copiadas del texto de investigación
  if (sourceText && text.trim().length > 15) {
    const sourceWords = sourceText.toLowerCase().replace(/[^\w\sáéíóúñ]/g, '').split(/\s+/).filter(w => w.length > 2);
    const textWords = text.toLowerCase().replace(/[^\w\sáéíóúñ]/g, '').split(/\s+/).filter(w => w.length > 2);
    const copiedCount = textWords.filter(w => sourceWords.includes(w)).length;
    const copyRatio = textWords.length > 0 ? copiedCount / textWords.length : 0;

    // Umbral más bajo (40%): avisar cuando está copiando del research
    if (copyRatio >= 0.4) {
      return {
        id: 'copy-warning',
        type: 'warning',
        message: language === 'es'
          ? '⚠️ ¡Alerta! Estás usando muchas palabras del texto que investigaste. Debes escribir tu reporte con tus propias palabras. Explica las ideas como si se lo contaras a un amigo.'
          : '⚠️ Alert! You\'re using too many words from the text you researched. You must write your report in your own words. Explain the ideas as if you were telling a friend.',
        icon: <AlertCircle className="w-6 h-6" />,
      };
    }
  }

  // Progress milestones
  if (wordCount === 10 || wordCount === 25 || wordCount === 50 || wordCount === 75 || wordCount === 100) {
    return {
      id: `milestone-${wordCount}`,
      type: 'encouragement',
      message: language === 'es'
        ? `🎉 ¡Genial! Ya escribiste ${wordCount} palabras. ¡Sigue así!`
        : `🎉 Great! You wrote ${wordCount} words. Keep going!`,
      icon: <Star className="w-6 h-6" />,
    };
  }

  // Check sentence completion
  if (text.endsWith('.') || text.endsWith('!') || text.endsWith('?')) {
    if (sentenceCount === 1) {
      return {
        id: 'first-sentence',
        type: 'success',
        message: language === 'es'
          ? '✨ ¡Excelente primera oración! ¿Puedes agregar otra idea?'
          : '✨ Excellent first sentence! Can you add another idea?',
        icon: <CheckCircle className="w-6 h-6" />,
      };
    }
    if (sentenceCount === expectations.minSentences) {
      return {
        id: 'min-sentences',
        type: 'progress',
        message: language === 'es'
          ? `🌟 ¡Ya tienes ${sentenceCount} oraciones! Buen trabajo para ${grade}º grado.`
          : `🌟 You have ${sentenceCount} sentences! Good work for grade ${grade}.`,
        icon: <TrendingUp className="w-6 h-6" />,
      };
    }
  }

  // Short writing tip based on grade
  if (wordCount > 5 && wordCount < expectations.minWords && wordCount % 8 === 0) {
    const tips = language === 'es' ? {
      1: '💡 Tip: Describe qué ves o qué pasó.',
      2: '💡 Tip: Agrega cómo te hace sentir esto.',
      3: '💡 Tip: Explica por qué es importante.',
      4: '💡 Tip: Conecta esta idea con otra que conoces.',
      5: '💡 Tip: Añade un ejemplo o evidencia.',
    } : {
      1: '💡 Tip: Describe what you see or what happened.',
      2: '💡 Tip: Add how this makes you feel.',
      3: '💡 Tip: Explain why this is important.',
      4: '💡 Tip: Connect this idea to something you know.',
      5: '💡 Tip: Add an example or evidence.',
    };

    return {
      id: `grade-tip-${grade}`,
      type: 'tip',
      message: tips[grade],
      icon: <Lightbulb className="w-6 h-6" />,
    };
  }

  // Reached minimum word count
  if (wordCount >= expectations.minWords && wordCount < expectations.minWords + 5) {
    return {
      id: 'min-words-reached',
      type: 'success',
      message: language === 'es'
        ? `🎯 ¡Llegaste a ${expectations.minWords} palabras! Tu reporte tiene buen tamaño.`
        : `🎯 You reached ${expectations.minWords} words! Your report is a good size.`,
      icon: <CheckCircle className="w-6 h-6" />,
    };
  }

  return null;
}
