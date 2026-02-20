import { StepResponse } from './types';
import { StateHelper } from './utils';
import { getCorrectFeedback } from '../../data/feedbackPhrases';

type PctPhase = 'total' | 'percent' | 'convert' | 'operation' | 'calc' | 'done';

/** Siempre guardar pctPhase, pctBase, pctPercent en visualData para que el tutor continúe al responder con números. */
function pctVisualData(overrides: Record<string, unknown>, base: number, percentage: number): Record<string, unknown> {
    return { pctPhase: overrides.pctPhase, pctBase: base, pctPercent: percentage, ...overrides };
}

export class PercentageTutor {
    static handlePercentage(input: string, base: number, percentage: number, lang: 'es' | 'en', history: any[], studentName?: string): StepResponse | null {
        const lastState = StateHelper.getCurrentVisualState(history) as any;
        const phase: PctPhase = lastState?.pctPhase || 'total';
        const cleanInput = input.trim().toLowerCase();
        const numberMatch = cleanInput.match(/(\d+(\.\d+)?)/);
        const userAnswer = numberMatch ? parseFloat(numberMatch[1]) : null;
        const result = (base * percentage) / 100;
        const decimal = percentage / 100;
        const tolerance = 0.01;

        if (phase === 'done') return null;

        // --- PASO 1: Identificar total ---
        if (phase === 'total') {
            const correct = userAnswer !== null && Math.abs(userAnswer - base) <= tolerance;
            if (correct) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Exacto! El total es **${base}**. 😊\n\nAhora, ¿qué **porcentaje** nos dan en el problema? (Busca el símbolo %)`
                            : `Exactly! The total is **${base}**. 😊\n\nNow, what **percentage** are we given in the problem? (Look for the % symbol)`,
                        speech: lang === 'es' ? `¿Qué porcentaje nos dan?` : `What percentage are we given?`,
                        visualType: "vertical_op",
                        visualData: pctVisualData({ operands: ["DATOS:", `Total: ${base}`, `Porcentaje: ?`], operator: "", highlight: "n2", pctPhase: 'percent' }, base, percentage),
                        detailedExplanation: { es: "Identificar Porcentaje", en: "Identify Percentage" }
                    }]
                };
            }
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Hola! 😊 Vamos a aprender porcentajes.\n\n¿Cuál es el **total**? (El número del que queremos sacar el porcentaje).`
                        : `Hi! 😊 Let's learn percentages.\n\nWhat is the **total**? (The number we're taking the percent of).`,
                    speech: lang === 'es' ? `¿Cuál es el total?` : `What is the total?`,
                    visualType: "vertical_op",
                    visualData: pctVisualData({ operands: ["DATOS:", `Total: ?`, `Porcentaje: ${percentage}%`], operator: "", highlight: "n1", pctPhase: 'total' }, base, percentage),
                    detailedExplanation: { es: "Identificar Total", en: "Identify Total" }
                }]
            };
        }

        // --- PASO 2: Identificar porcentaje ---
        if (phase === 'percent') {
            const correct = userAnswer !== null && Math.abs(userAnswer - percentage) <= tolerance;
            if (correct) {
                if ([50, 25, 10].includes(percentage)) {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `¡Muy bien! Es el **${percentage}%**. Es un "Porcentaje Amigo".\n- 50% = mitad (/2)\n- 25% = cuarto (/4)\n- 10% = décima (/10)\n\nSeguimos con **decimal**: ${base} × 0.${percentage}. ¿Cuánto te da?`
                                : `Very good! It is **${percentage}%**. A "Friendly Percent".\n- 50% = half (/2)\n- 25% = quarter (/4)\n- 10% = tenth (/10)\n\nWe'll use **decimal**: ${base} × 0.${percentage}. What is the result?`,
                            speech: lang === 'es' ? `Multiplica ${base} por 0.${percentage}.` : `Multiply ${base} by 0.${percentage}.`,
                            visualType: "vertical_op",
                            visualData: pctVisualData({ operand1: String(base), operand2: String(decimal), operator: "×", highlight: "n2", pctPhase: 'calc' }, base, percentage),
                            detailedExplanation: { es: "Calcular", en: "Calculate" }
                        }]
                    };
                }
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Bien! **${percentage}%** = 0.${percentage}.\n\nVamos a calcular: **${base} × 0.${percentage}**. ¿Cuánto te da?`
                            : `Good! **${percentage}%** = 0.${percentage}.\n\nLet's calculate: **${base} × 0.${percentage}**. What is the result?`,
                        speech: lang === 'es' ? `Multiplica ${base} por 0.${percentage}.` : `Multiply ${base} by 0.${percentage}.`,
                        visualType: "vertical_op",
                        visualData: pctVisualData({ operand1: String(base), operand2: String(decimal), operator: "×", highlight: "n2", pctPhase: 'calc' }, base, percentage),
                        detailedExplanation: { es: "Realizar cálculo", en: "Do calculation" }
                    }]
                };
            }
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Exacto! El total es **${base}**. Ahora, ¿qué **porcentaje** nos dan? (Busca el número con el símbolo %)`
                        : `Exactly! The total is **${base}**. Now, what **percentage** are we given? (Look for the number with the % symbol)`,
                    speech: lang === 'es' ? `¿Qué porcentaje?` : `What percentage?`,
                    visualType: "vertical_op",
                    visualData: pctVisualData({ operands: ["DATOS:", `Total: ${base}`, `Porcentaje: ?`], operator: "", highlight: "n2", pctPhase: 'percent' }, base, percentage),
                    detailedExplanation: { es: "Identificar Porcentaje", en: "Identify Percentage" }
                }]
            };
        }

        // --- PASO 3: Cálculo (phase convert/operation van directo a calc con decimal) ---
        if (phase === 'calc' || phase === 'convert' || phase === 'operation') {
            const correct = userAnswer !== null && Math.abs(userAnswer - result) <= tolerance;
            if (correct) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Excelente! 🎉 El resultado es **${result}**. ¿Tiene sentido? (Es menor que el total ${base}).`
                            : `Excellent! 🎉 The result is **${result}**. Does it make sense? (It's less than the total ${base}).`,
                        speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} El resultado es ${result}.` : `${getCorrectFeedback(lang, studentName)} The result is ${result}.`,
                        visualType: "vertical_op",
                        visualData: pctVisualData({
                            operand1: String(base),
                            operand2: String(decimal),
                            result: String(result),
                            operator: "=",
                            highlight: "done",
                            pctPhase: 'done'
                        }, base, percentage),
                        detailedExplanation: { es: "Verificación", en: "Check" }
                    }]
                };
            }
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Sí! Se **multiplica**. ✖️\n\n**${base} × 0.${percentage}** = ? ¿Cuánto te da?`
                        : `Yes! You **multiply**. ✖️\n\n**${base} × 0.${percentage}** = ? What is the result?`,
                    speech: lang === 'es' ? `Multiplica ${base} por 0.${percentage}.` : `Multiply ${base} by 0.${percentage}.`,
                    visualType: "vertical_op",
                    visualData: pctVisualData({ operand1: String(base), operand2: String(decimal), operator: "×", highlight: "n2", pctPhase: 'calc' }, base, percentage),
                    detailedExplanation: { es: "Realizar cálculo", en: "Do calculation" }
                }]
            };
        }

        // Intro (problema nuevo sin lastState)
        return {
            steps: [{
                text: lang === 'es'
                    ? `¡Hola! 😊 Vamos a aprender porcentajes.\n\n¿Cuál es el **total**? (El número del que queremos sacar el ${percentage}%).`
                    : `Hi! 😊 Let's learn percentages.\n\nWhat is the **total**? (The number we're taking the ${percentage}% of).`,
                speech: lang === 'es' ? `¿Cuál es el total?` : `What is the total?`,
                visualType: "vertical_op",
                visualData: pctVisualData({ operands: ["DATOS:", `Total: ?`, `Porcentaje: ${percentage}%`], operator: "", highlight: "n1", pctPhase: 'total' }, base, percentage),
                detailedExplanation: { es: "Identificar Total", en: "Identify Total" }
            }]
        };
    }
}
