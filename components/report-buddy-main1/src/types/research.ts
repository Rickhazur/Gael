export type Grade = 1 | 2 | 3 | 4 | 5;

export type Language = 'es' | 'en';

export type Step = 'paste' | 'analyze' | 'paraphrase' | 'review';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface TextAnalysis {
  hasLists: boolean;
  hasDates: boolean;
  isLongText: boolean;
  mainIdeas: string[];
  secondaryIdeas?: string[]; // Added for pedagogical tracking
  keyPoints: string[];
  importantDates: string[];
  wordCount: number;
  isPlagiarism: boolean;
  plagiarismPercentage: number;
}

export interface TutorMessage {
  id: string;
  type: 'tip' | 'warning' | 'encouragement' | 'analysis';
  icon: string;
  message: string;
  starters?: string[];
}

export interface Report {
  id: string;
  title: string;
  sourceText: string;
  paraphrasedText: string;
  grade: Grade;
  language: Language;
  createdAt: Date;
  updatedAt: Date;
}

export interface SourceInfo {
  title: string;
  source: string;
  url: string;
  date: string;
}

export type TemplateId = 'classic' | 'news_script' | 'museum_card' | 'scientific_poster' | 'podcast';

export interface ReportTemplate {
  id: TemplateId;
  name: { es: string; en: string };
  description: { es: string; en: string };
  icon: any; // We'll pass Lucide icons
}

export interface ResearchState {
  currentStep: Step;
  sourceText: string;
  paraphrasedText: string;
  grade: Grade;
  language: Language;
  analysis: TextAnalysis | null;
  tutorMessages: TutorMessage[];
  saveStatus: SaveStatus;
  isAnalyzing: boolean;
  sources: SourceInfo[];
  selectedTemplate: TemplateId;
  tutorPhase: 'modeling' | 'practice' | 'feedback' | 'generation' | 'idle';
  studentAnalysis?: {
    mainIdea: string;
    secondaryIdea: string;
  };
  currentParagraphIndex: number;
  studentAnalysisHistory: Array<{
    paragraphIndex: number;
    mainIdea: string;
    secondaryIdea: string;
    isCorrect: boolean;
  }>;
  paragraphs: string[];
}
