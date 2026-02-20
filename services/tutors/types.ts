
export enum TutorState {
    INIT = 'INIT',
    ASKING_PLACE_VALUE = 'ASKING_PV',
    ASKING_COLUMN = 'ASKING_COL',
    VALIDATING = 'VALIDATING',
    GUIDING = 'GUIDING',
    CELEBRATING = 'CELEBRATING',
    SUMMARIZING = 'SUMMARIZING',
    COMPLETE = 'COMPLETE'
}

export enum ErrorType {
    NONE = 'NONE',
    FORGOT_CARRY = 'FORGOT_CARRY',
    WRONG_COLUMN = 'WRONG_COLUMN',
    SUBTRACTION_FLIP = 'SUB_FLIP',
    PLACE_VALUE_CONFUSION = 'PV_CONFUSION',
    PARTIAL_ANSWER = 'PARTIAL',
    OFF_BY_ONE = 'OFF_BY_ONE',
    RANDOM_GUESS = 'RANDOM'
}

export enum HintLevel {
    NONE = 0,
    GENTLE = 1,
    VISUAL = 2,
    EXPLICIT = 3,
    REVEALED = 4
}

export interface VisualState {
    operands?: string[];
    operand1?: string;
    operand2?: string;
    operator?: string;
    result?: string | string[];
    carry?: string;
    highlight?: string;
    dividend?: string;
    divisor?: string;
    quotient?: string;
    remainder?: string;
    num1?: string; den1?: string;
    num2?: string; den2?: string;
    commonDen?: string;
    context?: string;
    type?: string;
    match?: number;
    lists?: any[];
    label?: string;
    value?: string;
    multiplierDigit?: { row: number; col: number };
    highlightDigit?: { row: number; col: number };
    borrows?: { colIndex: number; newValue: string }[];
    augmentedCols?: number[];
    divisionStyle?: 'latin' | 'us';
    history?: any[];
    phase?: 'find_quotient' | 'multiply' | 'subtract' | 'multiplier1' | 'numerator1' | 'multiplier2' | 'numerator2' | 'intro' | 'align_check' | 'mult_count' | 'mult_solve_int' | 'mult_place_point' | 'basic_fact_solve' | 'decide_decimal' | 'chained_same_denom' | 'ask_divisor' | 'solve_division' | 'ask_flip' | 'mcm_intro' | 'add_sub_result' | 'add_sub_done' | 'div_result' | 'div_done' | 'start' | 'direction' | 'final' | 'done' | 'algebra_start' | 'algebra_step' | 'algebra_final' | 'coords_intro' | 'coords_plot' | 'coords_done';
    isNew?: boolean;
    tempVal?: any;
    currentPos?: number;
    expectedValue?: number;
    equation?: string;
    variable?: string;
    targetValue?: number;
    points?: { x: number; y: number; label?: string }[];
    currentPoint?: { x: number; y: number };
    product?: string;
    multiplier?: number;
    newNum1?: string;
    productNum?: number;
    isDone?: boolean;
    expectedSum?: number;
    resultNumerator?: number;
    resultDenom?: number;
    nextNum?: number;
    nextDenom?: number;
    nextOp?: string;
    helpers?: { colIndex: number; value: string }[];
    highlightMatch?: boolean;
    originalOp?: any;
    shape?: string;
    length?: number;
    width?: number;
    labels?: string[];
    text?: string;
    highlights?: { text: string; color: string }[];
    wpPhase?: string;
    wpParsed?: any;
    a1?: string;
    b1?: string;
    a2?: string;
    b2?: string;
    unitA?: string;
    unitB?: string;
}

export interface Step {
    id?: number;
    type?: string;
    text: any; // Can be string or { es: string, en: string }
    speech: any; // Can be string or { es: string, en: string }
    visualType: string;
    visualData: VisualState;
    detailedExplanation?: { es: string; en: string };
    expectedAnswer?: string;
    audioPath?: string;
}

export interface StepResponse {
    steps: Step[];
}
