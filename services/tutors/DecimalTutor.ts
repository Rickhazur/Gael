
import { StepResponse, VisualState } from './types';
import { AnswerValidator, StateHelper } from './utils';
import { getCorrectFeedback } from '../../data/feedbackPhrases';

export class DecimalTutor {
    static handleDecimal(input: string, prob: any, lang: 'es' | 'en', history: any[], studentName?: string): StepResponse | null {
        const lastState = StateHelper.getCurrentVisualState(history);
        const phase = lastState?.phase || 'intro';

        const op = prob.operator || lastState?.operator || '+';
        const n1 = String(prob.n1 ?? lastState?.tempVal?.n1 ?? lastState?.operand1 ?? '');
        const n2 = String(prob.n2 ?? lastState?.tempVal?.n2 ?? lastState?.operand2 ?? '');

        if (prob.isNew) {
            if (op === '×' || op === 'x' || op === '*' || op === 'multiplication') return this.introMultiplication(n1, n2, lang);
            if (op === '÷' || op === '/') return this.introDecimalDivision(n1, n2, lang);
            return this.introAlignment(n1, n2, op, lang);
        }

        switch (phase) {
            case 'align_check':
            case 'add_sub_result':
                return this.handleAlignCheck(input, n1, n2, op, lang, history);
            case 'div_result':
                return this.handleDivResult(input, n1, n2, lang, history, studentName);
            case 'mult_count':
                return this.handleMultCount(input, n1, n2, lang, history);
            case 'mult_solve_int':
                return this.handleMultSolveInt(input, n1, n2, lang, history, studentName);
            case 'mult_place_point':
                return this.handleMultPlacePoint(input, n1, n2, lang, history, studentName);
            default:
                return null;
        }
    }

    private static handleMultSolveInt(input: string, n1: string, n2: string, lang: 'es' | 'en', history: any[], studentName?: string): StepResponse | null {
        const lastState = StateHelper.getCurrentVisualState(history);
        const originalN1 = lastState?.tempVal?.n1 || n1;
        const originalN2 = lastState?.tempVal?.n2 || n2;
        const int1 = originalN1.replace('.', '');
        const int2 = originalN2.replace('.', '');
        const expectedInt = parseInt(int1) * parseInt(int2);

        // Recalculate totalDec if missing (safety net)
        let totalDec = lastState?.tempVal?.totalDec;
        if (totalDec === undefined) {
            const d1 = (n1.split('.')[1] || "").length;
            const d2 = (n2.split('.')[1] || "").length;
            totalDec = d1 + d2;
        }

        const expectedFinal = expectedInt / Math.pow(10, totalDec);
        const cleanedInput = input.replace(',', '.').trim();

        // 1. Did they solve the whole thing? (Skip ahead)
        const valFinal = AnswerValidator.validate(cleanedInput, expectedFinal);
        if (valFinal.isCorrect) {
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡WOW! Saltaste directo al final. 🚀\n\n**${int1} × ${int2} = ${expectedInt}**.\n\nComo teníamos **${totalDec}** decimales en total, moviste el punto **${totalDec}** veces.\n\nResultado: **${expectedFinal}**. ¡Perfecto!`
                        : `WOW! You skipped straight to the end. 🚀\n\n**${int1} × ${int2} = ${expectedInt}**.\n\nSince we had **${totalDec}** decimals total, you moved the point **${totalDec}** places.\n\nResult: **${expectedFinal}**. Perfect!`,
                    speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} ¡Directo al resultado! Es ${expectedFinal}.` : `${getCorrectFeedback(lang, studentName)} Straight to the answer! It is ${expectedFinal}.`,
                    visualType: "vertical_op",
                    visualData: {
                        operand1: n1, operand2: n2, operator: "×",
                        result: String(expectedFinal),
                        highlight: "done",
                        phase: 'done'
                    },
                    detailedExplanation: { es: "Multiplicación decimal completada", en: "Decimal multiplication finished" }
                }]
            };
        }

        // 2. Did they solve just the integer part? (Standard flow)
        const valInt = AnswerValidator.validate(cleanedInput, expectedInt);
        if (valInt.isCorrect) {
            const dec1 = (n1.split('.')[1] || "").length;
            const dec2 = (n2.split('.')[1] || "").length;

            const explanationEs = `✅ Operación correcta: **${int1} × ${int2} = ${expectedInt}**.\n\nAhora, ¿dónde va el punto? 🤔\n\n1. **${n1}** tiene ${dec1} decimal${dec1 === 1 ? '' : 'es'}.\n2. **${n2}** tiene ${dec2} decimal${dec2 === 1 ? '' : 'es'}.\nEn total son **${totalDec}** decimales.\n\n👉 Escribe el número **${expectedInt}** y mueve el punto **${totalDec}** saltos desde la derecha. ¿Cuál es el resultado final?`;

            const explanationEn = `✅ Correct operation: **${int1} × ${int2} = ${expectedInt}**.\n\nNow, where does the point go? 🤔\n\n1. **${n1}** has ${dec1} decimal${dec1 === 1 ? '' : 's'}.\n2. **${n2}** has ${dec2} decimal${dec2 === 1 ? '' : 's'}.\nTotal is **${totalDec}** decimals.\n\n👉 Write number **${expectedInt}** and move the point **${totalDec}** jumps from the right. What is the final result?`;

            return {
                steps: [{
                    text: lang === 'es' ? explanationEs : explanationEn,
                    speech: lang === 'es'
                        ? `${getCorrectFeedback(lang, studentName)} Multiplicación correcta. Ahora mueve el punto ${totalDec} lugares desde la derecha.`
                        : `${getCorrectFeedback(lang, studentName)} Multiplication correct. Now move the point ${totalDec} places from the right.`,
                    visualType: "vertical_op",
                    visualData: {
                        operand1: n1,
                        operand2: n2,
                        operator: "×",
                        result: String(expectedInt),
                        phase: 'mult_place_point',
                        tempVal: { totalDec, intResult: expectedInt, n1: originalN1, n2: originalN2 }
                    },
                    detailedExplanation: { es: "Colocación de punto decimal final", en: "Final decimal point placement" }
                }]
            };
        }

        return {
            steps: [{
                text: lang === 'es'
                    ? `Primero multiplica como si no hubiera puntos: **${int1} × ${int2}**. (Es como ${parseInt(int1) > 1000 ? 'una multiplicación grande' : 'una multiplicación normal'}).`
                    : `First multiply as if there were no points: **${int1} × ${int2}**.`,
                speech: lang === 'es' ? `Multiplica ${int1} por ${int2}.` : `Multiply ${int1} by ${int2}.`,
                visualType: "vertical_op",
                visualData: { ...lastState, phase: 'mult_solve_int' },
                detailedExplanation: { es: "Pista multiplicación enteros", en: "Integer multiplication hint" }
            }]
        };
    }

    private static handleMultPlacePoint(input: string, n1: string, n2: string, lang: 'es' | 'en', history: any[], studentName?: string): StepResponse | null {
        const lastState = StateHelper.getCurrentVisualState(history);

        let intResult = lastState?.tempVal?.intResult;
        let totalDec = lastState?.tempVal?.totalDec;

        // Safety Net
        if (intResult === undefined || totalDec === undefined) {
            const originalN1 = lastState?.tempVal?.n1 || n1;
            const originalN2 = lastState?.tempVal?.n2 || n2;
            const int1 = originalN1.replace('.', '');
            const int2 = originalN2.replace('.', '');
            intResult = parseInt(int1) * parseInt(int2);

            const d1 = (originalN1.split('.')[1] || "").length;
            const d2 = (originalN2.split('.')[1] || "").length;
            totalDec = d1 + d2;
        }

        // Calculate expected final float
        const expectedFinal = intResult / Math.pow(10, totalDec);
        const cleanedInput = input.replace(',', '.').trim();
        const validation = AnswerValidator.validate(cleanedInput, expectedFinal);

        if (validation.isCorrect) {
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡MISIÓN CUMPLIDA! ✨🏆\n\nHas multiplicado **${n1} × ${n2}** con éxito.\n\nEl resultado final es **${expectedFinal}**.\n\n¿Viste? Solo fue multiplicar normal y saltar el punto al final. ¡Eres un genio! 🧠`
                        : `MISSION ACCOMPLISHED! ✨🏆\n\nYou successfully multiplied **${n1} × ${n2}**.\n\nThe final result is **${expectedFinal}**.\n\nSee? Just multiply normally and jump the point at the end. You're a genius! 🧠`,
                    speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} El resultado es ${expectedFinal}.` : `${getCorrectFeedback(lang, studentName)} The result is ${expectedFinal}.`,
                    visualType: "vertical_op",
                    visualData: { ...lastState, result: String(expectedFinal), highlight: "done" },
                    detailedExplanation: { es: "Multiplicación decimal completada", en: "Decimal multiplication finished" }
                }]
            };
        } else {
            return {
                steps: [{
                    text: lang === 'es'
                        ? `Mmm... recuerda saltar exactamente **${totalDec}** lugares desde la derecha.\n\nSi el número es **${intResult}**, ¿dónde quedaría el punto?`
                        : `Hmm... remember to jump exactly **${totalDec}** places from the right.\n\nIf the number is **${intResult}**, where would the point go?`,
                    speech: lang === 'es' ? `Salta ${totalDec} lugares.` : `Jump ${totalDec} places.`,
                    visualType: "vertical_op",
                    visualData: lastState || {},
                    detailedExplanation: { es: "Error colocación punto", en: "Point placement error" }
                }]
            };
        }
    }

    // --- ADDITION / SUBTRACTION: ALIGNMENT ---
    private static introAlignment(n1: string, n2: string, op: string, lang: 'es' | 'en'): StepResponse {
        const d1 = n1.split('.')[1] || "";
        const d2 = n2.split('.')[1] || "";
        const maxDecimals = Math.max(d1.length, d2.length);

        const n1Align = n1.includes('.') ? n1.padEnd(n1.split('.')[0].length + 1 + maxDecimals, '0') : n1 + '.' + '0'.repeat(maxDecimals);
        const n2Align = n2.includes('.') ? n2.padEnd(n2.split('.')[0].length + 1 + maxDecimals, '0') : n2 + '.' + '0'.repeat(maxDecimals);

        return {
            steps: [{
                text: lang === 'es'
                    ? `¡Misión Decimal! 💎 Vamos a ${op === '+' ? 'sumar' : 'restar'} **${n1}** y **${n2}**.\n\n⚠️ **REGLA DE ORO**: El punto decimal es como un **faro**. ¡Todos los puntos deben estar alineados!\n\n💡 Agregamos ceros al final: **${n1Align}** ${op} **${n2Align}**.\n\n¿Cuánto te da la operación?`
                    : `Decimal Mission! 💎 Let's ${op === '+' ? 'add' : 'subtract'} **${n1}** and **${n2}**.\n\n⚠️ **GOLDEN RULE**: The decimal point is like a **lighthouse**. All points must be aligned!\n\n💡 We add zeros at the end: **${n1Align}** ${op} **${n2Align}**.\n\nWhat is the result?`,
                speech: lang === 'es'
                    ? `¡Misión Decimal! Puntos alineados. ¿Cuánto es ${n1Align} ${op === '+' ? 'más' : 'menos'} ${n2Align}?`
                    : `Decimal Mission! Points aligned. What is ${n1Align} ${op} ${n2Align}?`,
                visualType: "vertical_op",
                visualData: {
                    operand1: n1Align,
                    operand2: n2Align,
                    operator: op,
                    highlight: "points",
                    phase: 'add_sub_result'
                },
                detailedExplanation: { es: "Alineación y resultado", en: "Alignment and result" }
            }]
        };
    }

    private static handleAlignCheck(input: string, n1: string, n2: string, op: string, lang: 'es' | 'en', history: any[]): StepResponse | null {
        const lastState = StateHelper.getCurrentVisualState(history);
        const n1Use = lastState?.operand1 ?? n1;
        const n2Use = lastState?.operand2 ?? n2;
        const opUse = lastState?.operator ?? op;
        const num1 = parseFloat(String(n1Use).replace(',', '.'));
        const num2 = parseFloat(String(n2Use).replace(',', '.'));
        const cleanedInput = input.replace(',', '.').trim();
        const inputNum = parseFloat(cleanedInput);
        const expected = opUse === '-' ? num1 - num2 : num1 + num2;

        // Validate with tolerance for float precision
        const isCorrect = !isNaN(inputNum) && Math.abs(inputNum - expected) < 0.0001;
        const validation = { isCorrect, isNumericInput: !isNaN(inputNum) };

        if (validation.isCorrect) {
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Misión cumplida! ✨ **${n1Use}** ${opUse} **${n2Use}** = **${expected}**.\n\nEl punto queda alineado en el resultado. ¡Muy bien!`
                        : `Mission accomplished! ✨ **${n1Use}** ${opUse} **${n2Use}** = **${expected}**.\n\nThe decimal point stays aligned in the result. Well done!`,
                    speech: lang === 'es' ? `${getCorrectFeedback(lang, undefined)} El resultado es ${expected}.` : `${getCorrectFeedback(lang, undefined)} The result is ${expected}.`,
                    visualType: "vertical_op",
                    visualData: {
                        operand1: n1Use,
                        operand2: n2Use,
                        operator: opUse,
                        result: String(expected),
                        highlight: "done",
                        phase: 'add_sub_done'
                    },
                    detailedExplanation: { es: "Suma/resta decimal completada", en: "Decimal add/subtract finished" }
                }]
            };
        }
        return {
            steps: [{
                text: lang === 'es'
                    ? `Recuerda: alinea las columnas y opera. **${n1Use}** ${opUse} **${n2Use}** = ? ¿Cuánto te da?`
                    : `Remember: align the columns and compute. **${n1Use}** ${opUse} **${n2Use}** = ? What is the result?`,
                speech: lang === 'es' ? `Suma o resta columna por columna.` : `Add or subtract column by column.`,
                visualType: "vertical_op",
                visualData: { ...lastState, phase: 'add_sub_result' },
                detailedExplanation: { es: "Pista suma/resta decimal", en: "Decimal add/subtract hint" }
            }]
        };
    }

    // --- DIVISION WITH DECIMALS ---
    private static introDecimalDivision(n1: string, n2: string, lang: 'es' | 'en'): StepResponse {
        const d1 = (n1.split('.')[1] || "").length;
        const d2 = (n2.split('.')[1] || "").length;
        const maxDec = Math.max(d1, d2);
        const mult = Math.pow(10, maxDec);

        // Calculate integers
        const val1 = Math.round(parseFloat(n1.replace(',', '.')) * mult);
        const val2 = Math.round(parseFloat(n2.replace(',', '.')) * mult);
        const s1 = String(val1);
        const s2 = String(val2);

        const promptTextEs = `💡 **Truco de Magia**: ¡A nadie le gusta dividir con decimales! 🎩✨\n\nVamos a mover el punto decimal **${maxDec}** veces a la derecha en ambos números.\n\n👉 **${n1}** se convierte en **${s1}**.\n👉 **${n2}** se convierte en **${s2}**.\n\nAhora resuelve la división más fácil: **${s1} ÷ ${s2}**. ¿Cuál es el primer paso?`;

        const promptTextEn = `💡 **Magic Trick**: Nobody likes dividing with decimals! 🎩✨\n\nLet's move the decimal point **${maxDec}** times to the right on both numbers.\n\n👉 **${n1}** becomes **${s1}**.\n👉 **${n2}** becomes **${s2}**.\n\nNow, solve the easier division: **${s1} ÷ ${s2}**. What is the first step?`;

        return {
            steps: [{
                text: lang === 'es' ? promptTextEs : promptTextEn,
                speech: lang === 'es'
                    ? `Movemos el punto para que sean enteros. Ahora divide ${s1} entre ${s2}.`
                    : `We move the point to make them whole numbers. Now divide ${s1} by ${s2}.`,
                visualType: "vertical_op",
                visualData: {
                    operand1: s1,
                    operand2: s2,
                    operator: "÷",
                    highlight: "n2",
                    phase: 'find_quotient' // Handover to DivisionTutor
                },
                detailedExplanation: { es: "Transformación a enteros", en: "Transformation to integers" }
            }]
        };
    }

    private static handleDivResult(input: string, n1: string, n2: string, lang: 'es' | 'en', history: any[], studentName?: string): StepResponse | null {
        const lastState = StateHelper.getCurrentVisualState(history);
        const a = parseFloat(String(lastState?.operand1 ?? n1).replace(',', '.'));
        const b = parseFloat(String(lastState?.operand2 ?? n2).replace(',', '.'));
        const expected = a / b;
        const cleanedInput = input.replace(',', '.').trim();
        const validation = AnswerValidator.validate(cleanedInput, expected, 0.01);

        if (validation.isCorrect) {
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Misión cumplida! ✨ **${n1} ÷ ${n2}** = **${expected}**.\n\nEl resultado es correcto. ¡Muy bien!`
                        : `Mission accomplished! ✨ **${n1} ÷ ${n2}** = **${expected}**.\n\nThe result is correct. Well done!`,
                    speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} El resultado es ${expected}.` : `${getCorrectFeedback(lang, studentName)} The result is ${expected}.`,
                    visualType: "vertical_op",
                    visualData: {
                        operand1: n1,
                        operand2: n2,
                        operator: "÷",
                        result: String(expected),
                        highlight: "done",
                        phase: 'div_done'
                    },
                    detailedExplanation: { es: "División decimal completada", en: "Decimal division finished" }
                }]
            };
        }
        return {
            steps: [{
                text: lang === 'es'
                    ? `Recuerda: **${n1} ÷ ${n2}**. Multiplica ambos por 10 hasta que el divisor sea entero, divide y coloca el punto. ¿Cuánto te da? (Redondea si hace falta).`
                    : `Remember: **${n1} ÷ ${n2}**. Multiply both by 10 until the divisor is whole, divide and place the point. What is the result? (Round if needed).`,
                speech: lang === 'es' ? `Divide ${n1} entre ${n2}.` : `Divide ${n1} by ${n2}.`,
                visualType: "vertical_op",
                visualData: { ...lastState, phase: 'div_result' },
                detailedExplanation: { es: "Pista división decimal", en: "Decimal division hint" }
            }]
        };
    }

    // --- MULTIPLICATION: THE "GHOST POINT" STRATEGY ---
    private static introMultiplication(n1: string, n2: string, lang: 'es' | 'en'): StepResponse {
        const dec1 = (n1.split('.')[1] || "").length;
        const dec2 = (n2.split('.')[1] || "").length;
        const totalDec = dec1 + dec2;

        return {
            steps: [{
                text: lang === 'es'
                    ? `¡Ojo de Águila! 🦅 Para multiplicar **${n1} × ${n2}**, usaremos el **Truco del Punto Fantasma**.\n\n1️⃣ Cuenta cuántos números hay después de los puntos decimales en TOTAL.\n\n¿Cuántos decimales ves entre los dos números?`
                    : `Eagle Eye! 🦅 To multiply **${n1} × ${n2}**, we'll use the **Ghost Point Trick**.\n\n1️⃣ Count how many total decimal places there are in BOTH numbers.\n\nHow many decimal places do you see in total?`,
                speech: lang === 'es'
                    ? `¡Truco del punto fantasma! Cuenta cuántos números hay después de los puntos en total. ¿Cuántos ves?`
                    : `Ghost point trick! Count the total decimal places in both numbers. How many?`,
                visualType: "vertical_op",
                visualData: {
                    operand1: n1,
                    operand2: n2,
                    operator: "×",
                    highlight: "decimals",
                    phase: 'mult_count',
                    tempVal: { totalDec, n1, n2 }
                },
                detailedExplanation: { es: "Contar decimales para multiplicación", en: "Count decimal places for mult" }
            }]
        };
    }

    private static handleMultCount(input: string, n1: string, n2: string, lang: 'es' | 'en', history: any[]): StepResponse | null {
        const lastState = StateHelper.getCurrentVisualState(history);
        const expected = lastState?.tempVal?.totalDec;
        const validation = AnswerValidator.validate(input, expected);

        if (validation.isCorrect) {
            const int1 = n1.replace('.', '');
            const int2 = n2.replace('.', '');

            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Excelente! Son **${expected}** decimales en total. 🎯\n\nAhora, olvida los puntos por un momento y multiplica como si fueran números normales: **${int1} × ${int2}**.\n\n¿Cuánto da esa multiplicación?`
                        : `Excellent! That's **${expected}** decimal places in total. 🎯\n\nNow, forget the points for a moment and multiply them as normal numbers: **${int1} × ${int2}**.\n\nWhat is the result?`,
                    speech: lang === 'es'
                        ? `¡Bien! Son ${expected}. Ahora multiplica ${int1} por ${int2} sin los puntos.`
                        : `Good! ${expected} places. Now multiply ${int1} by ${int2} without the points.`,
                    visualType: "vertical_op",
                    visualData: {
                        operand1: int1,
                        operand2: int2,
                        operator: "×",
                        phase: 'mult_solve_int',
                        tempVal: { totalDec: expected, n1, n2 }
                    },
                    detailedExplanation: { es: "Multiplicación como enteros", en: "Multiplying as integers" }
                }]
            };
        } else {
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Casi! Cuenta de nuevo los números que están a la DERECHA del punto decimal en ambos números. 🕵️‍♂️`
                        : `Close! Count the numbers to the RIGHT of the decimal point in both numbers again. 🕵️‍♂️`,
                    speech: lang === 'es' ? "Cuenta de nuevo los decimales." : "Count the decimals again.",
                    visualType: "vertical_op",
                    visualData: lastState || {},
                    detailedExplanation: { es: "Error conteo decimales", en: "Decimal counting error" }
                }]
            };
        }
    }
}
