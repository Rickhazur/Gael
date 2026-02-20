import React from 'react';
import type { Grade, Language, TextAnalysis } from '../../types/research';
import { cn } from '../../lib/utils';
import { CheckCircle2, Circle, AlertTriangle, FileText, List, Calendar, Quote } from 'lucide-react';
import { Progress } from '../ui/progress';

interface ReportCompletenessProps {
  paraphrasedText: string;
  analysis: TextAnalysis | null;
  grade: Grade;
  language: Language;
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  icon: React.ReactNode;
  required: boolean;
}

export function ReportCompleteness({ paraphrasedText, analysis, grade, language }: ReportCompletenessProps) {
  const wordCount = paraphrasedText.split(/\s+/).filter(w => w.length > 0).length;
  const sentenceCount = paraphrasedText.split(/[.!?]+/).filter(s => s.trim().length > 5).length;

  // Grade-specific requirements (based on new user specifications)
  const gradeRequirements = {
    1: {
      minWords: 30,
      maxWords: 100,
      minSentences: 3,
      maxSentences: 6,
      needsList: false,
      needsDates: false,
      minParagraphs: 1,
      maxParagraphs: 1,
      focus: { es: 'Uso de imágenes con etiquetas', en: 'Use of images with labels' }
    },
    2: {
      minWords: 50,
      maxWords: 150,
      minSentences: 5,
      maxSentences: 10,
      needsList: false,
      needsDates: false,
      minParagraphs: 1,
      maxParagraphs: 2,
      focus: { es: 'Agrupar ideas similares', en: 'Group similar ideas' }
    },
    3: {
      minWords: 100,
      maxWords: 250,
      minSentences: 8,
      maxSentences: 15,
      needsList: true,
      needsDates: false,
      minParagraphs: 2,
      maxParagraphs: 3,
      focus: { es: 'Organización lógica (Inicio, Cuerpo, Fin)', en: 'Logical organization (Intro, Body, End)' }
    },
    4: {
      minWords: 150,
      maxWords: 350,
      minSentences: 12,
      maxSentences: 20,
      needsList: true,
      needsDates: true,
      minParagraphs: 3,
      maxParagraphs: 4,
      focus: { es: 'Uso de subtítulos para organizar', en: 'Use subtitles to organize' }
    },
    5: {
      minWords: 300,
      maxWords: 400,
      minSentences: 15,
      maxSentences: 30,
      needsList: true,
      needsDates: true,
      minParagraphs: 4,
      maxParagraphs: 6,
      focus: { es: 'Argumentación y pensamiento crítico', en: 'Argumentation and critical thinking' }
    },
  };

  const requirements = gradeRequirements[grade];
  const paragraphCount = paraphrasedText.split(/\n\n+/).filter(p => p.trim().length > 20).length;

  // Check if text mentions key points from analysis
  const mentionsKeyPoints = analysis?.keyPoints.some(kp => {
    const keywords = kp.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    return keywords.some(kw => paraphrasedText.toLowerCase().includes(kw));
  }) ?? false;

  // Check if text mentions dates from source
  const mentionsDates = analysis?.importantDates.some(date =>
    paraphrasedText.includes(date)
  ) ?? false;

  // Build checklist
  const checklist: ChecklistItem[] = [
    {
      id: 'min-words',
      label: language === 'es'
        ? `Mínimo ${requirements.minWords} palabras (${wordCount}/${requirements.minWords})`
        : `Minimum ${requirements.minWords} words (${wordCount}/${requirements.minWords})`,
      completed: wordCount >= requirements.minWords,
      icon: <FileText className="w-4 h-4" />,
      required: true,
    },
    {
      id: 'min-sentences',
      label: language === 'es'
        ? `Al menos ${requirements.minSentences} oraciones (${sentenceCount}/${requirements.minSentences})`
        : `At least ${requirements.minSentences} sentences (${sentenceCount}/${requirements.minSentences})`,
      completed: sentenceCount >= requirements.minSentences,
      icon: <Quote className="w-4 h-4" />,
      required: true,
    },
  ];

  // Add paragraph requirement for higher grades
  if (requirements.minParagraphs > 0) {
    checklist.push({
      id: 'paragraphs',
      label: language === 'es'
        ? `${requirements.minParagraphs} a ${requirements.maxParagraphs} párrafos (${paragraphCount})`
        : `${requirements.minParagraphs} to ${requirements.maxParagraphs} paragraphs (${paragraphCount})`,
      completed: paragraphCount >= requirements.minParagraphs,
      icon: <FileText className="w-4 h-4" />,
      required: grade >= 3,
    });
  }

  // Add Focus Tip (New)
  checklist.push({
    id: 'focus-tip',
    label: language === 'es'
      ? `Enfoque: ${requirements.focus.es}`
      : `Focus: ${requirements.focus.en}`,
    completed: true, // Always shows as info/completed
    icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />,
    required: false,
  });

  // Add key points requirement if source has key points
  if (analysis?.keyPoints && analysis.keyPoints.length > 0) {
    checklist.push({
      id: 'key-points',
      label: language === 'es'
        ? 'Menciona ideas principales del texto'
        : 'Mentions main ideas from the text',
      completed: mentionsKeyPoints,
      icon: <List className="w-4 h-4" />,
      required: grade >= 3,
    });
  }

  // Add dates requirement if source has dates
  if (analysis?.hasDates && requirements.needsDates) {
    checklist.push({
      id: 'dates',
      label: language === 'es'
        ? 'Incluye fechas importantes'
        : 'Includes important dates',
      completed: mentionsDates,
      icon: <Calendar className="w-4 h-4" />,
      required: false,
    });
  }

  // Check for plagiarism
  const isPlagiarism = analysis?.isPlagiarism ?? false;
  if (wordCount > 10) {
    checklist.push({
      id: 'original',
      label: language === 'es'
        ? 'Escrito con tus propias palabras'
        : 'Written in your own words',
      completed: !isPlagiarism,
      icon: isPlagiarism ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />,
      required: true,
    });
  }

  // Calculate progress
  const requiredItems = checklist.filter(item => item.required);
  const completedRequired = requiredItems.filter(item => item.completed).length;
  const progress = requiredItems.length > 0 ? (completedRequired / requiredItems.length) * 100 : 0;

  const isComplete = requiredItems.every(item => item.completed);
  const needsMoreContent = wordCount < requirements.minWords || sentenceCount < requirements.minSentences;

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-fredoka text-lg font-semibold text-foreground">
          {language === 'es' ? '📋 Tu progreso' : '📋 Your progress'}
        </h3>
        <span className={cn(
          'text-xs font-bold px-2 py-1 rounded-full',
          isComplete ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
        )}>
          {Math.round(progress)}%
        </span>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Checklist */}
      <ul className="space-y-2">
        {checklist.map(item => (
          <li
            key={item.id}
            className={cn(
              'flex items-center gap-2 text-sm p-2 rounded-lg transition-colors',
              item.completed ? 'bg-success/10 text-success' : 'bg-muted/50 text-muted-foreground'
            )}
          >
            {item.completed ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className={cn(item.completed && 'line-through opacity-70')}>
              {item.label}
            </span>
            {!item.required && (
              <span className="text-xs opacity-50 ml-auto">
                {language === 'es' ? 'opcional' : 'optional'}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Need more content message */}
      {needsMoreContent && wordCount > 0 && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-sm text-primary font-medium">
            {language === 'es'
              ? `💡 Necesitas ${Math.max(0, requirements.minWords - wordCount)} palabras más para completar tu reporte.`
              : `💡 You need ${Math.max(0, requirements.minWords - wordCount)} more words to complete your report.`
            }
          </p>
        </div>
      )}

      {/* Complete message */}
      {isComplete && (
        <div className="p-3 rounded-xl bg-success/10 border border-success/20 animate-pulse-soft">
          <p className="text-sm text-success font-medium">
            {language === 'es'
              ? '🎉 ¡Tu reporte está listo para revisar!'
              : '🎉 Your report is ready for review!'
            }
          </p>
        </div>
      )}
    </div>
  );
}
