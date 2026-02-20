import React from 'react';
import type { Step } from '@/types/research';
import { cn } from '@/lib/utils';
import { ClipboardPaste, Search, PenLine, CheckCircle, Lightbulb, Target } from 'lucide-react';

interface ProgressStepsProps {
  currentStep: Step;
  language: 'es' | 'en';
  subject?: 'science' | 'history' | 'geography' | 'other';
  researchType?: 'scientific' | 'informative' | null;
}

const steps: { id: Step; icon: typeof ClipboardPaste; labelEs: string; labelEn: string }[] = [
  { id: 'type_selection', icon: Target, labelEs: 'Tipo', labelEn: 'Type' },
  { id: 'hypothesis', icon: Lightbulb, labelEs: 'Hipótesis', labelEn: 'Hypothesis' },
  { id: 'paste', icon: ClipboardPaste, labelEs: 'Pegar', labelEn: 'Paste' },
  { id: 'analyze', icon: Search, labelEs: 'Analizar', labelEn: 'Analyze' },
  { id: 'paraphrase', icon: PenLine, labelEs: 'Escribir', labelEn: 'Write' },
  { id: 'review', icon: CheckCircle, labelEs: 'Revisar', labelEn: 'Review' },
];

const stepOrder: Step[] = ['type_selection', 'hypothesis', 'paste', 'analyze', 'paraphrase', 'review'];

export function ProgressSteps({ currentStep, language, subject = 'science', researchType }: ProgressStepsProps) {
  const visibleSteps = steps.filter((s: { id: Step }) => {
    if (s.id === 'hypothesis' && researchType === 'informative') return false;
    return true;
  });

  const currentIndex = visibleSteps.findIndex((s: { id: Step }) => s.id === currentStep);

  return (
    <div className="flex items-center justify-between w-full max-w-xl mx-auto">
      {visibleSteps.map((step: any, index: number) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        // Logic for completion depends on visible order
        const actualStepIndex = stepOrder.indexOf(step.id);
        const currentStepIndex = stepOrder.indexOf(currentStep);
        const isCompleted = actualStepIndex < currentStepIndex;
        const isPending = actualStepIndex > currentStepIndex;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'step-indicator',
                  isActive && 'active',
                  isCompleted && 'completed',
                  isPending && 'pending'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-300',
                  isActive && 'text-primary',
                  isCompleted && 'text-success',
                  isPending && 'text-muted-foreground'
                )}
              >
                {step.id === 'hypothesis' ? (
                  researchType === 'scientific'
                    ? (language === 'es' ? 'Hipótesis' : 'Hypothesis')
                    : (language === 'es' ? 'Meta' : 'Goal')
                ) : (language === 'es' ? step.labelEs : step.labelEn)}
              </span>
            </div>

            {index < visibleSteps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2 rounded-full transition-colors duration-300',
                  isCompleted ? 'bg-success' : 'bg-muted'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
