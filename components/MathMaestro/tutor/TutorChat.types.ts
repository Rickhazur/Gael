export interface TutorChatProps {
    language: 'es' | 'en';
    grade?: number;
    curriculum?: string;
    studentName?: string;
    tutor?: 'lina' | 'rachelle';
    initialTask?: string;
    onSendToBoard?: (text: string, highlights?: string[]) => void;
    onDrawText?: (text: string, highlights?: { text: string; color?: string }[]) => void;
    onDrawDivisionStep?: (dividend: string, divisor: string, quotient: string, product?: string, remainder?: string, highlight?: string, style?: 'latin' | 'us', columnIndex?: number, visualData?: any) => void;
    onDrawGeometry?: (shape: string, params: any) => void;
    onDrawFraction?: (dataOrNum: any, denominator?: number, type?: string) => void;
    onDrawFractionEquation?: (visualData: any) => void;
    onDrawDataPlot?: (data: number[]) => void;
    onDrawVerticalOp?: (n1: string | string[], n2?: string, result?: string | string[], operator?: string, carry?: string, highlight?: string, borrows?: any[], helpers?: any[], visualData?: any) => void;
    onDrawBase10Blocks?: (value: number) => void;
    onDrawDecomposition?: (n1: number, f1: number[], n2: number, f2: number[]) => void;
    onDrawMultiplicationGroups?: (numGroups: number, itemsPerGroup: number, itemType?: string) => void;
    onTriggerCelebration?: (type?: 'stars' | 'confetti' | 'bubbles') => void;
    divisionStyle?: 'latin' | 'us' | null;
    onShowDivisionSelector?: () => void;
    onDrawImage?: (url: string) => void;
    masteryMode?: boolean;
    isDemo?: boolean;
    onExerciseComplete?: (operationType: string) => void;
    onPersistProgress?: (operationType: string) => void;
    onSetupDragAndDrop?: (bgUrl: string, items: { id: string, imgUrl: string, count: number }[]) => void;
}
