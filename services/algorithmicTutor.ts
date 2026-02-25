
// services/algorithmicTutor.ts
// ============================================================================
// COMPLETE ELEMENTARY MATH TUTOR ENGINE - ELITE VERSION
// Aligned with: IB PYP, Colombian MEN Standards
// Features: State Machine, Error Detection, Graduated Hints
// Operations: +, -, ×, ÷, Fractions, Percentages, Word Problems
// ============================================================================

import { VisualState, Step, StepResponse, ErrorType, HintLevel } from './tutors/types';
import { GradeLevel } from '@/types/tutor';
import { AdditionTutor } from './tutors/AdditionTutor';
import { StateHelper } from './tutors/utils';
import { ConversionTutor } from './tutors/ConversionTutor';
import { SubtractionTutor } from './tutors/SubtractionTutor';
import { MultiplicationTutor } from './tutors/MultiplicationTutor';
import { PercentageTutor } from './tutors/PercentageTutor';
import { FractionTutor } from './tutors/FractionTutor';
import { DivisionTutor } from './tutors/DivisionTutor';
import { DecimalTutor } from './tutors/DecimalTutor';
import { GeometryTutor } from './tutors/GeometryTutor';
import { WordProblemTutor } from './tutors/WordProblemTutor';
import { IntegerTutor } from './tutors/IntegerTutor';
import { AlgebraTutor } from './tutors/AlgebraTutor';
import { CoordinateTutor } from './tutors/CoordinateTutor';
import { parseWordProblem, parseGenericWordProblem } from '../data/wordProblemParser';

export class AlgorithmicTutor {
    private static hintLevels: Map<string, HintLevel> = new Map();

    private static getHintLevel(problemKey: string): HintLevel {
        return this.hintLevels.get(problemKey) || HintLevel.NONE;
    }

    private static setHintLevel(problemKey: string, level: HintLevel): void {
        this.hintLevels.set(problemKey, level);
    }

    private static resetHintLevel(problemKey: string): void {
        this.hintLevels.delete(problemKey);
    }

    private static validateAnswer(
        input: string,
        expectedAnswer: number,
        tolerance: number = 0.001
    ): { isCorrect: boolean; userAnswer: number | null; isNumericInput: boolean } {
        const cleanInput = input.trim().toLowerCase();
        const normalized = cleanInput.replace(/,/g, '.').replace(/\s/g, '');
        const numberMatch = normalized.match(/-?\d+\.?\d*/);

        if (!numberMatch) {
            return { isCorrect: false, userAnswer: null, isNumericInput: false };
        }

        const userAnswer = parseFloat(numberMatch[0]);

        if (Number.isInteger(expectedAnswer) && tolerance < 0.01) {
            return {
                isCorrect: userAnswer === expectedAnswer,
                userAnswer,
                isNumericInput: true
            };
        }

        return {
            isCorrect: Math.abs(userAnswer - expectedAnswer) <= tolerance,
            userAnswer,
            isNumericInput: true
        };
    }

    private static generateIncorrectHint(
        operation: string,
        expectedAnswer: number,
        userAnswer: number | null,
        lang: 'es' | 'en',
        context?: string
    ): { text: string; speech: string } {
        const wasClose = userAnswer !== null && Math.abs(userAnswer - expectedAnswer) <= 2;

        if (wasClose) {
            return {
                text: lang === 'es'
                    ? `¡Muy cerca! 🎯 Revisa tu cálculo una vez más.\n\n${context || ''}`
                    : `Very close! 🎯 Check your calculation once more.\n\n${context || ''}`,
                speech: lang === 'es' ? '¡Muy cerca! Revisa de nuevo, tú puedes.' : 'Very close! Check again, you\'ve got this.'
            };
        }

        return {
            text: lang === 'es'
                ? `Hmm, no exactamente. 🤔 Intentemos de nuevo.\n\n${context || ''}\n\n💡 Pista: Haz la operación paso a paso.`
                : `Hmm, not quite. 🤔 Let's try again.\n\n${context || ''}\n\n💡 Hint: Do the operation step by step.`,
            speech: lang === 'es' ? '¡Casi! Intentemos de nuevo, ¡vamos!' : 'Almost! Let\'s try again, you can do it!'
        };
    }

    private static generateSummary(
        operationType: string,
        result: string | number,
        lang: 'es' | 'en'
    ): string {
        const summaries: Record<string, { es: string; en: string }> = {
            'subtraction': {
                es: `\n\n📌 **Resumen:**\n• Restamos de derecha a izquierda\n• Si el dígito de arriba es menor, pedimos prestado\n• Verificamos restando del resultado`,
                en: `\n\n📌 **Summary:**\n• Subtract right to left\n• If top digit smaller, borrow\n• Verify by subtracting`
            },
            'multiplication': {
                es: `\n\n📌 **Resumen:**\n• Multiplicamos dígito por dígito\n• Sumamos los productos parciales\n• Las tablas de multiplicar son clave`,
                en: `\n\n📌 **Summary:**\n• Multiply digit by digit\n• Add partial products\n• Times tables are key`
            },
            'division': {
                es: `\n\n📌 **Resumen:**\n• Dividimos grupo por grupo\n• Multiplicamos para verificar\n• El residuo es lo que sobra`,
                en: `\n\n📌 **Summary:**\n• Divide group by group\n• Multiply to verify\n• Remainder is what's left`
            },
            'fraction': {
                es: `\n\n📌 **Resumen:**\n• Con mismo denominador: operamos numeradores\n• Con diferente denominador: buscamos MCM\n• Simplificamos si es posible`,
                en: `\n\n📌 **Summary:**\n• Same denominator: operate numerators\n• Different denominators: find LCM\n• Simplify if possible`
            },
            'percentage': {
                es: `\n\n📌 **Resumen:**\n• Porcentaje ÷ 100 = decimal\n• Decimal × base = resultado\n• 50% = mitad, 25% = cuarto`,
                en: `\n\n📌 **Summary:**\n• Percent ÷ 100 = decimal\n• Decimal × base = result\n• 50% = half, 25% = quarter`
            },
            'wordProblem': {
                es: `\n\n📌 **Resumen:**\n• Identificar qué pide el problema\n• Encontrar los datos importantes\n• Plantear la operación correcta`,
                en: `\n\n📌 **Summary:**\n• Identify what the problem asks\n• Find important data\n• Set up correct operation`
            }
        };

        return summaries[operationType]?.[lang] || '';
    }

    /** Normaliza texto para móvil/teclados: barras Unicode → /, espacios raros → espacio, trim */
    private static normalizeInput(text: string): string {
        if (typeof text !== 'string') return '';
        return text
            .replace(/[\u2212\u2013\u2014\u2015]/g, '-') // Normalize dashes/minuses to ASCII hyphen-minus
            .replace(/\u2044/g, '/')   // Unicode fraction slash ⁄
            .replace(/\u2215/g, '/')   // Division slash ∕
            .replace(/\u00A0/g, ' ')   // Non-breaking space
            .replace(/\s+/g, ' ')
            .trim();
    }

    static generateResponse(
        currentText: string,
        history: { role: string; content: string; visualState?: any }[],
        language: 'es' | 'en',
        divisionStyle?: 'latin' | 'us',
        studentName?: string,
        grade: GradeLevel = 3,
        masteryMode: boolean = false
    ): StepResponse | null {
        const normalized = AlgorithmicTutor.normalizeInput(currentText);
        let problem = AlgorithmicTutor.detectProblem(normalized, history);
        if (!problem) {
            const lastState = AlgorithmicTutor.getCurrentVisualState(history);
            if (lastState?.phase === 'chained_same_denom') {
                problem = { type: 'fraction', isChainedAnswer: true, lastState };
            } else if (lastState?.originalOp && (lastState?.remaining != null || lastState?.type === 'mcm_intro')) {
                problem = { type: 'fraction', isChainedAnswer: true, lastState };
            }
        }
        if (!problem) return null;

        if (problem.type === 'division') {
            problem.divisionStyle = (divisionStyle === 'latin' || divisionStyle === 'us') ? divisionStyle : (problem.divisionStyle || 'us');
        }

        switch (problem.type) {
            case 'addition':
                // if (problem.isDecimal) return DecimalTutor.handleDecimal(currentText, problem, language, history, studentName);
                return AdditionTutor.handleAddition(currentText, problem, language, history, studentName, grade);
            case 'subtraction':
                // if (problem.isDecimal) return DecimalTutor.handleDecimal(currentText, problem, language, history, studentName);
                return SubtractionTutor.handleSubtraction(currentText, problem, language, history, studentName, grade);
            case 'multiplication':
                if (problem.isDecimal) return DecimalTutor.handleDecimal(currentText, problem, language, history, studentName);
                return MultiplicationTutor.handleMultiplication(currentText, problem, language, history, studentName, grade);
            case 'division':
                if (problem.isDecimal) return DecimalTutor.handleDecimal(currentText, { operator: '÷', n1: problem.dividend, n2: problem.divisor, isNew: problem.isNew }, language, history, studentName);
                return AlgorithmicTutor.handleDivision(currentText, problem, language, history, studentName, grade);
            case 'fraction': return FractionTutor.handleFractions(currentText, problem, language, history, studentName);
            case 'percentage': return AlgorithmicTutor.handlePercentage(currentText, problem, language, history, studentName);
            case 'wordProblem': return AlgorithmicTutor.handleWordProblem(currentText, problem, language, history, studentName);
            case 'conversion': return ConversionTutor.handleConversion(currentText, problem, language, history, studentName);
            case 'lcm': return AlgorithmicTutor.handleLCM(currentText, problem, language, history, studentName);
            case 'decimal': return DecimalTutor.handleDecimal(currentText, problem, language, history, studentName);
            case 'geometry': return GeometryTutor.handleGeometry(currentText, problem, language, history, studentName);
            case 'integer': return IntegerTutor.handleIntegers(currentText, problem, language, history, studentName);
            case 'algebra': return AlgebraTutor.handleAlgebra(currentText, problem, language, history, studentName);
            case 'coordinates': return CoordinateTutor.handleCoordinates(currentText, problem, language, history, studentName);
            default: return null;
        }
    }

    static getCurrentVisualState(history: any[]): any {
        for (let i = history.length - 1; i >= 0; i--) {
            const h = history[i];
            if (h.role === 'assistant' || h.role === 'nova') {
                if (h.visualState) return h.visualState;
                try {
                    const jsonMatch = h.content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const json = JSON.parse(jsonMatch[0]);
                        if (json.steps && json.steps[0]?.visualData) return json.steps[0].visualData;
                    }
                } catch (e) { }
            }
        }
        return null;
    }

    private static detectProblem(text: string, history: any[]): any {
        const parse = (str: string): any => {
            // Normalize integer notation with parentheses before any regex matching.
            // Converts: (-9) → -9   (+5) → +5   (5) → 5
            // This handles input like "-5+(-9)", "-3+(5)", "5-(-3)" from students.
            const clean = str.toLowerCase().trim()
                .replace(/\(\s*([+-]?\d+(?:\.\d+)?)\s*\)/g, '$1');

            // 1. PERCENTAGES (High Priority)
            const hasPctSym = clean.includes('%');
            if (hasPctSym) {
                const pValMatch = clean.match(/(\d+(?:\.\d+)?)\s*%/);
                if (pValMatch) {
                    const percent = pValMatch[1];
                    const allNums = clean.match(/\d+(?:\.\d+)?/g) || [];
                    const base = allNums.find(n => n !== percent) || null;
                    return { type: 'percentage', percent, base };
                }
            }

            // 2. FRACTIONS (2 or 3+ fractions, with + and/or -)
            // Permitir espacios alrededor de / (móvil: "1 / 2 + 1 / 3")
            const allFracs = clean.match(/(\d+)\s*\/\s*(\d+)/g);
            const noSpaces = clean.replace(/\s/g, '');
            const hasPlusOrMinus = (noSpaces.match(/[\+\-]/g) || []).length >= 1;
            const onlyFracOps = /^[\d\/\+\-\s]+$/.test(clean); // Simplified, less restrictive
            if (allFracs && allFracs.length >= 2 && hasPlusOrMinus) {
                const opMatches = clean.match(/[\+\-]/g) || [];
                if (opMatches.length !== allFracs.length - 1) { /* invalid */ } else {
                    const parsed = allFracs.map(f => {
                        const parts = f.split('/').map(s => s.trim());
                        const n = parseInt(parts[0], 10);
                        const d = parseInt(parts[1], 10);
                        return { n: isNaN(n) ? 0 : n, d: isNaN(d) ? 1 : d };
                    });
                    const n1 = String(parsed[0].n);
                    const d1 = String(parsed[0].d);
                    const n2 = String(parsed[1].n);
                    const d2 = String(parsed[1].d);
                    const op = opMatches[0];
                    const remaining = parsed.length > 2
                        ? parsed.slice(2).map((f, i) => ({ n: f.n, d: f.d, op: opMatches[i + 1] }))
                        : [];
                    return {
                        type: 'fraction',
                        isNew: true,
                        n1, d1, n2, d2,
                        op,
                        ...(remaining.length > 0 && { isMultiFraction: true, remaining })
                    };
                }
            }
            const fracMatch = clean.match(/(\d+)\s*\/\s*(\d+)\s*([\+\-])\s*(\d+)\s*\/\s*(\d+)/);
            if (fracMatch) {
                return { type: 'fraction', isNew: true, n1: fracMatch[1], d1: fracMatch[2], op: fracMatch[3], n2: fracMatch[4], d2: fracMatch[5] };
            }

            // 3. STANDARD OPS (Division, Mult, Sub, Add)
            const divMatch = clean.match(/^(-?\d+(?:\.\d+)?)\s*(\/|÷|entre|dividido)\s*(-?\d+(?:\.\d+)?)$/) || clean.match(/(-?\d+(?:\.\d+)?)\s*(\/|÷|entre|dividido)\s*(-?\d+(?:\.\d+)?)/i);
            if (divMatch) {
                const isDecimal = divMatch[1].includes('.') || divMatch[3].includes('.');
                const isNegative = divMatch[1].startsWith('-') || divMatch[3].startsWith('-');
                const type = isNegative ? 'integer' : 'division';
                return { isNew: true, type, dividend: divMatch[1], divisor: divMatch[3], isDecimal };
            }

            const mulMatch = clean.match(/^(-?\d+(?:\.\d+)?)\s*(x|\*|×|por)\s*(-?\d+(?:\.\d+)?)$/) || clean.match(/(-?\d+(?:\.\d+)?)\s*(x|\*|×|por)\s*(-?\d+(?:\.\d+)?)/i);
            if (mulMatch) {
                const isNegative = mulMatch[1].startsWith('-') || mulMatch[3].startsWith('-');
                const type = isNegative ? 'integer' : 'multiplication';
                return { isNew: true, type, n1: mulMatch[1], n2: mulMatch[3], operator: '×', isDecimal: mulMatch[1].includes('.') || mulMatch[3].includes('.') };
            }

            // Resume context for "dividir" or "repartir"
            if (clean === 'dividir' || clean === 'repartir' || clean === 'divide' || clean === 'share') {
                const last = AlgorithmicTutor.getCurrentVisualState(history);
                if (last?.dividend && last?.divisor) {
                    return { type: 'division', dividend: last.dividend, divisor: last.divisor, isNew: false, divisionStyle: last.divisionStyle };
                }
            }

            const subMatch = clean.match(/^(-?\d+(?:\.\d+)?)\s*([\-\−\–]|menos)\s*(-?\d+(?:\.\d+)?)$/) || clean.match(/(-?\d+(?:\.\d+)?)\s*([\-\−\–]|menos)\s*(-?\d+(?:\.\d+)?)/i);
            if (subMatch) {
                const isNegative = subMatch[1].startsWith('-') || subMatch[3].startsWith('-');
                const type = isNegative ? 'integer' : 'subtraction';
                return { isNew: true, type, n1: subMatch[1], n2: subMatch[3], isDecimal: subMatch[1].includes('.') || subMatch[3].includes('.'), operator: '-' };
            }

            const addMatch = clean.match(/^(-?\d+(?:\.\d+)?)\s*(\+|más|mas)\s*(-?\d+(?:\.\d+)?)$/) || clean.match(/(-?\d+(?:\.\d+)?)\s*(\+|más|mas)\s*(-?\d+(?:\.\d+)?)/i);
            if (addMatch) {
                const isNegative = addMatch[1].startsWith('-') || addMatch[3].startsWith('-');
                const type = isNegative ? 'integer' : 'addition';
                return { isNew: true, type, n1: addMatch[1], n2: addMatch[3], isDecimal: addMatch[1].includes('.') || addMatch[3].includes('.'), operator: '+' };
            }

            // 4. LCM
            if (clean.includes('lcm') || clean.includes('mcm') || clean.includes('multiplo')) {
                const nums = clean.match(/\d+/g)?.map(Number) || [];
                if (nums.length >= 2) return { type: 'lcm', n1: nums[0], n2: nums[1] };
            }

            // 5. WORD PROBLEMS (Context Detection)
            const wordProblemKeywords = /(tienda|hay|total|vende|compra|regala|repart|encontr|cuesta|price|store|bought|has|had|find|found|litros|km|kilom)/i;
            if (wordProblemKeywords.test(clean) && clean.match(/\d+/)) {
                // Try parsing with structured wp parsers first
                const wp = parseWordProblem(clean) || parseGenericWordProblem(clean);
                if (wp) return { ...wp, type: 'wordProblem', isNew: true };
            }

            // 6. GEOMETRY (Perimeter/Area - rectangle)
            const geometryMatch = clean.match(/(perimetro|área|area|perímetro)\b.*?\b(\d+)\s*(?:x|×|por|,|y)\s*(\d+)/i);
            if (geometryMatch) {
                const type = geometryMatch[1].includes('perim') ? 'perimeter' : 'area';
                return { isNew: true, type: 'geometry', shape: 'rectangle', geometryType: type, n1: geometryMatch[2], n2: geometryMatch[3] };
            }

            // 6.5 GEOMETRY (Word Problem style: length and width)
            const dimMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:m|metro|cm)?\s*(?:de\s*)?(?:largo|ancho|base|altura|alto)/gi);
            if (dimMatch && dimMatch.length >= 2) {
                const n1 = dimMatch[0].match(/\d+(?:\.\d+)?/)?.[0] || "0";
                const n2 = dimMatch[1].match(/\d+(?:\.\d+)?/)?.[0] || "0";
                const type = (clean.includes('perim') || clean.includes('cerca') || clean.includes('borde')) ? 'perimeter' : 'area';
                const shape = (clean.includes('triang') || clean.includes('triangle')) ? 'triangle' : 'rectangle';
                return { isNew: true, type: 'geometry', shape, geometryType: type, n1, n2 };
            }

            // 6.6 GEOMETRY - Triangle area (base × altura / 2)
            const triAreaMatch = clean.match(/(?:área|area)\s*(?:de\s*)?(?:un\s+)?(?:tri[aá]ngulo|triangle).*?(?:base|base)\s*[=:]?\s*(\d+(?:\.\d+)?).*?(?:altura|height)\s*[=:]?\s*(\d+(?:\.\d+)?)/i)
                || clean.match(/(?:tri[aá]ngulo|triangle).*?(?:base|base)\s*(\d+(?:\.\d+)?).*?(?:altura|height)\s*(\d+(?:\.\d+)?)/i)
                || clean.match(/(?:área|area)\s*(?:tri[aá]ngulo|triangle)\s*base\s*(\d+)\s*altura\s*(\d+)/i);
            if (triAreaMatch) {
                return { isNew: true, type: 'geometry', shape: 'triangle', geometryType: 'area', n1: triAreaMatch[1], n2: triAreaMatch[2] };
            }

            // 6.7 GEOMETRY - Circle area (π r²) or circumference (2πr)
            const circleMatch = clean.match(/(?:área|area|circunferencia|circumference|per[ií]metro)\s*(?:de\s*)?(?:un\s+)?(?:c[ií]rculo|circle).*?(?:radio|radius)\s*[=:]?\s*(\d+(?:\.\d+)?)/i)
                || clean.match(/(?:c[ií]rculo|circle).*?(?:radio|radius)\s*(\d+(?:\.\d+)?)/i)
                || clean.match(/(?:área|area)\s*(?:c[ií]rculo|circle)\s*radio\s*(\d+)/i);
            if (circleMatch) {
                const isCircum = /circunferencia|circumference|per[ií]metro\s*(?:de\s*)?(?:un\s+)?c[ií]rculo/i.test(clean);
                return { isNew: true, type: 'geometry', shape: 'circle', geometryType: isCircum ? 'circumference' : 'area', n1: circleMatch[1] };
            }

            // 6.8 GEOMETRY - Volume of cube (lado³)
            const cubeVolMatch = clean.match(/(?:volumen|volume)\s*(?:de\s*)?(?:un\s+)?(?:cubo|cube).*?(?:lado|side)\s*[=:]?\s*(\d+(?:\.\d+)?)/i)
                || clean.match(/(?:cubo|cube).*?(?:lado|side)\s*(\d+)/i)
                || clean.match(/(?:volumen|volume)\s*(?:cubo|cube)\s*(?:lado\s*)?(\d+)/i);
            if (cubeVolMatch) {
                return { isNew: true, type: 'geometry', shape: 'cube', geometryType: 'volume', n1: cubeVolMatch[1] };
            }

            // 6.9 GEOMETRY - Sum of angles in a triangle (180°)
            if (/(?:suma|sum)\s*(?:de\s*)?(?:ángulos|angles|angulos).*?(?:tri[aá]ngulo|triangle)/i.test(clean) ||
                /(?:ángulos|angles)\s*(?:internos|internal)?.*?(?:tri[aá]ngulo|triangle)/i.test(clean) ||
                /(?:tri[aá]ngulo|triangle).*?(?:180|ángulos)/i.test(clean)) {
                return { isNew: true, type: 'geometry', shape: 'triangle', geometryType: 'angle_sum' };
            }

            // 6.10 GEOMETRY - Pythagoras (hipotenusa given two legs)
            const pythNums = clean.match(/(\d+(?:\.\d+)?)\s*[,y\s]\s*(\d+(?:\.\d+)?)/);
            if (pythNums && /teorema\s*de\s*pit[aá]goras|pythagoras|pit[aá]goras|hipotenusa|catetos\s*(\d+)/i.test(clean)) {
                const a = parseFloat(pythNums[1]);
                const b = parseFloat(pythNums[2]);
                if (a > 0 && b > 0) return { isNew: true, type: 'geometry', shape: 'right_triangle', geometryType: 'pythagoras', n1: String(a), n2: String(b) };
            }

            // 7. ALGEBRA (Simple Equations: x + 5 = 10, 2x = 8)
            const eqMatch = clean.replace(/\s+/g, '').match(/([a-z])([\+\-])(\d+)=(\d+)/i)
                || clean.replace(/\s+/g, '').match(/(\d+)([\+\-])([a-z])=(\d+)/i)
                || clean.replace(/\s+/g, '').match(/(\d+)([a-z])=(\d+)/i);
            if (eqMatch) {
                const variable = eqMatch[1].length === 1 && /[a-z]/i.test(eqMatch[1]) ? eqMatch[1] : (eqMatch[3].length === 1 ? eqMatch[3] : (eqMatch[2].length === 1 ? eqMatch[2] : 'x'));
                return { type: 'algebra', equation: clean, variable, isNew: true };
            }

            // 8. COORDINATES: (3, 4), (-2, 5)
            const coordMatch = clean.match(/\((-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\)/);
            if (coordMatch) {
                return { type: 'coordinates', x: coordMatch[1], y: coordMatch[2], isNew: true };
            }

            return null;
        };

        // 1. Check current text (Is New?)
        const lastState = AlgorithmicTutor.getCurrentVisualState(history);

        // 5. WORD PROBLEM GUARD - Relaxed to fall back to Socratic AI for better storytelling/context
        // (Moved back to TutorChat to allow AI-powered CPA pedagogy for complex text)
        const currentProblem = parse(text);

        if (currentProblem) {
            // DUPLICATE GUARD: If we are already solving this exact problem, don't restart it!
            if (lastState && (
                (lastState.operand1 === currentProblem.n1 && lastState.operand2 === currentProblem.n2 && lastState.operator === currentProblem.op) ||
                (lastState.dividend === currentProblem.dividend && lastState.divisor === currentProblem.divisor) ||
                (currentProblem.type === 'geometry' && lastState.shape === (currentProblem as any).shape && lastState.geometryType === (currentProblem as any).geometryType &&
                    String(lastState.n1 ?? lastState.length ?? lastState.radius ?? lastState.base ?? lastState.side) === String((currentProblem as any).n1) &&
                    ((currentProblem as any).n2 == null && (lastState.n2 ?? lastState.width ?? lastState.height) == null || String(lastState.n2 ?? lastState.width ?? lastState.height) === String((currentProblem as any).n2)))
            )) {
                return { ...currentProblem, isNew: false };
            }
            return { ...currentProblem, isNew: true };
        }

        // 2. Check History for Active Context (Is Continued?)
        // Priority 1: Check the last visual state (structured data)
        if (lastState) {
            if (lastState.pctPhase != null && lastState.pctBase != null && lastState.pctPercent != null) {
                return { type: 'percentage', percent: lastState.pctPercent, base: lastState.pctBase, isNew: false };
            }
            if (lastState.operator === '÷' && (String(lastState.operand1 || '').includes('.') || String(lastState.operand2 || '').includes('.'))) {
                return { type: 'division', dividend: lastState.operand1, divisor: lastState.operand2, isNew: false, isDecimal: true };
            }
            if (lastState.dividend && lastState.divisor) {
                return { type: 'division', dividend: lastState.dividend, divisor: lastState.divisor, isNew: false, divisionStyle: lastState.divisionStyle };
            }
            if (lastState.operand1 != null && lastState.operand2 != null) {
                let type = 'addition';
                if (lastState.operator === '-') type = 'subtraction';
                else if (lastState.operator === '×') type = 'multiplication';
                const isDecimal = String(lastState.operand1).includes('.') || String(lastState.operand2).includes('.');
                const isNegative = String(lastState.operand1).startsWith('-') || String(lastState.operand2).startsWith('-');
                if (isNegative && (type === 'addition' || type === 'subtraction')) type = 'integer';
                return { type, n1: lastState.operand1, n2: lastState.operand2, operator: lastState.operator, isNew: false, isDecimal };
            }
            if (lastState.num1 && lastState.den1) {
                const orig = lastState.originalOp;
                return {
                    type: 'fraction',
                    n1: orig?.n1 ?? lastState.num1,
                    d1: orig?.d1 ?? lastState.den1,
                    n2: orig?.n2 ?? lastState.num2,
                    d2: orig?.d2 ?? lastState.den2,
                    op: orig?.operator ?? lastState.operator,
                    isNew: false
                };
            }
            if (lastState.wpPhase) {
                return { type: 'wordProblem', ...(lastState.wpParsed || {}), isNew: false };
            }
            if (lastState.shape && lastState.geometryType) {
                return {
                    type: 'geometry',
                    shape: lastState.shape,
                    geometryType: lastState.geometryType,
                    n1: lastState.n1 ?? lastState.length ?? lastState.radius ?? lastState.base ?? lastState.side,
                    n2: lastState.n2 ?? lastState.width ?? lastState.height,
                    isNew: false
                };
            }
        }

        // Priority 2: Scan backwards through history for problem text
        for (let i = history.length - 1; i >= 0; i--) {
            const h = history[i];
            if (h.role === 'user') {
                const historicProblem = parse(h.content);
                if (historicProblem) {
                    return { ...historicProblem, isNew: false };
                }
            }
        }

        return null;
    }

    private static handleDivision(input: string, prob: any, lang: 'es' | 'en', history: any[], studentName?: string, grade: GradeLevel = 3): StepResponse | null {
        return DivisionTutor.handleDivision(input, prob, lang, history, studentName, grade);
    }

    private static handlePercentage(input: string, prob: any, lang: 'es' | 'en', history: any[], studentName?: string): StepResponse | null {
        const pct = parseFloat(prob.percent);
        const base = parseFloat(prob.base);
        return PercentageTutor.handlePercentage(input, base, pct, lang, history, studentName);
    }

    private static handleWordProblem(input: string, prob: any, lang: 'es' | 'en', history: any[], studentName?: string): StepResponse | null {
        // Cualquier problema verbal con highlights: tanque o genérico (suma/resta cantidades)
        if (prob.highlights && Array.isArray(prob.highlights)) {
            return WordProblemTutor.handleWordProblem(input, prob, lang, history, studentName);
        }
        // Fallback: problema verbal simple (dos números y operación)
        const text = prob.text || '';
        const numbers = text.match(/\d+\.?\d*/g)?.map(Number) || [];
        if (numbers.length < 2) return null;

        let operation = '+';
        if (/(perdió|quitó|menos|restó|quedan|lost|removed|subtracted)/i.test(text)) operation = '-';
        else if (/(veces|cada uno|por|total|times|each)/i.test(text)) operation = '×';
        else if (/(repartió|dividió|entre|divided|shared)/i.test(text)) operation = '÷';

        const [n1, n2] = numbers;
        if (prob.isNew) {
            return {
                steps: [{
                    text: `📖 **Problema detectado**\n\n"${text}"\n\nPlanteemos: **${n1} ${operation} ${n2} = ¿?**`,
                    speech: `Vamos a resolver este problema: ${n1} ${operation} ${n2}.`,
                    visualType: "vertical_op",
                    visualData: { operands: [String(n1), String(n2)], operator: operation },
                    detailedExplanation: { es: "Análisis de problema", en: "Problem analysis" }
                }]
            };
        }
        return null;
    }

    private static handleLCM(currentText: string, prob: any, lang: 'es' | 'en', history: any[], _studentName?: string): StepResponse | null {
        const n1 = Number(prob.n1), n2 = Number(prob.n2);
        const resLcm = StateHelper.lcm(n1, n2);
        return {
            steps: [{
                text: `¡Vamos a encontrar el MCM de ${n1} y ${n2}! 🕵️‍♂️`,
                speech: `¡Vamos a encontrar el mínimo común múltiplo de ${n1} y ${n2}!`,
                visualType: 'lcm_list',
                visualData: {
                    type: 'lcm_list',
                    match: resLcm,
                    lists: [
                        { base: n1, items: [n1, n1 * 2, n1 * 3, n1 * 4, n1 * 5] },
                        { base: n2, items: [n2, n2 * 2, n2 * 3, n2 * 4, n2 * 5] }
                    ]
                } as any,
                detailedExplanation: { es: "Búsqueda de MCM", en: "LCM Search" }
            }]
        };
    }
}
