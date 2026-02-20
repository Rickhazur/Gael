export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Language = 'es' | 'en';

export type Step = 'type_selection' | 'hypothesis' | 'paste' | 'analyze' | 'paraphrase' | 'review';

export type ResearchType = 'scientific' | 'informative';

export type TemplateId = 'classic' | 'news_script' | 'museum_card' | 'scientific_poster' | 'podcast';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface ParagraphAnalysis {
    content: string;
    mainIdea: string;
    supportingPhrases: string[];
    explanation: string; // How the tutor found the idea
    isDiscovered: boolean; // Has the child correctly identified it?
}

export interface TextAnalysis {
    hasLists: boolean;
    hasDates: boolean;
    isLongText: boolean;
    mainIdeas: string[];
    keyPoints: string[];
    importantDates: string[];
    wordCount: number;
    isPlagiarism: boolean;
    plagiarismPercentage: number;
    paragraphs?: ParagraphAnalysis[];
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
    hypothesis: string;
    sourceText: string;
    paraphrasedText: string;
    grade: Grade;
    language: Language;
    researchType: ResearchType;
    createdAt: Date;
    updatedAt: Date;
}

export interface SourceInfo {
    title: string;
    source: string;
    url: string;
    date: string;
}

export interface ResearchState {
    currentStep: Step;
    researchType: ResearchType | null;
    hypothesis: string;
    sourceText: string;
    paraphrasedText: string;
    grade: Grade;
    language: Language;
    analysis: TextAnalysis | null;
    tutorMessages: TutorMessage[];
    saveStatus: SaveStatus;
    isAnalyzing: boolean;
    sources: SourceInfo[];
    currentParagraphIndex: number;
}
