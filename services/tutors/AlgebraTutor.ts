import { StepResponse, VisualState } from './types';
import { StateHelper } from './utils';
import { getCorrectFeedback } from '../../data/feedbackPhrases';

export class AlgebraTutor {
    static handleAlgebra(input: string, prob: any, lang: 'es' | 'en', history: any[], studentName?: string): StepResponse | null {
        const lastState = StateHelper.getCurrentVisualState(history) as VisualState;
        const cleanInput = input.trim().toLowerCase();

        // Equation parsing (simple ax + b = c)
        // If prob is new, we initialize.
        if (prob.isNew || !lastState?.phase || !lastState.equation) {
            const eq = prob.equation || input;
            const variable = prob.variable || 'x';

            // Basic detection for x + 5 = 10
            const match = eq.replace(/\s+/g, '').match(/([a-z])([\+\-])(\d+)=(\d+)/i)
                || eq.replace(/\s+/g, '').match(/(\d+)([\+\-])([a-z])=(\d+)/i)
                || eq.replace(/\s+/g, '').match(/(\d+)([a-z])=(\d+)/i);

            if (!match) return null; // Let the AI handle complex ones

            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Hola! Vamos a despejar la **${variable}** en la ecuación **${eq}**. 😊\n\n¿Qué operación está haciendo el número que acompaña a la ${variable}?`
                        : `Hi! Let's solve for **${variable}** in the equation **${eq}**. 😊\n\nWhat operation is the number doing to the ${variable}?`,
                    speech: lang === 'es' ? `Vamos a resolver esta ecuación. ¿Qué operación ves?` : `Let's solve this equation. What operation do you see?`,
                    visualType: "algebra_op",
                    visualData: {
                        equation: eq,
                        variable,
                        phase: 'algebra_start',
                        highlight: 'operator'
                    },
                    detailedExplanation: { es: "Identificar operación inicial", en: "Identify initial operation" }
                }]
            };
        }

        const phase = lastState.phase;
        const eq = lastState.equation || "";
        const variable = lastState.variable || "x";

        // Logic for solving x + a = b
        if (phase === 'algebra_start') {
            const isAddition = eq.includes('+');
            const isSubtraction = eq.includes('-') && !eq.startsWith('-');
            const isMultiplication = /^\d+[a-z]/i.test(eq.replace(/\s/g, ''));

            if ((isAddition && (cleanInput.includes('suma') || cleanInput.includes('add') || cleanInput.includes('+'))) ||
                (isSubtraction && (cleanInput.includes('resta') || cleanInput.includes('sub') || cleanInput.includes('-'))) ||
                (isMultiplication && (cleanInput.includes('mult') || cleanInput.includes('por') || cleanInput.includes('×')))) {

                let nextStepEs = "";
                let nextStepEn = "";
                let operation = "";

                if (isAddition) {
                    nextStepEs = `¡Exacto! Es una suma. Para "despejar" la ${variable}, debemos hacer lo contrario.\n\n¿Cuál es el contrario de sumar?`;
                    nextStepEn = `Exactly! It's addition. To "isolate" ${variable}, we must do the opposite.\n\nWhat is the opposite of addition?`;
                    operation = "subtraction";
                } else if (isSubtraction) {
                    nextStepEs = `¡Bien! Es una resta. ¿Qué es lo contrario de restar?`;
                    nextStepEn = `Good! It's subtraction. What is the opposite of subtraction?`;
                    operation = "addition";
                } else {
                    nextStepEs = `¡Muy bien! Están multiplicando. ¿Qué es lo contrario de multiplicar?`;
                    nextStepEn = `Very good! They are multiplying. What is the opposite of multiplication?`;
                    operation = "division";
                }

                return {
                    steps: [{
                        text: lang === 'es' ? nextStepEs : nextStepEn,
                        speech: lang === 'es' ? `¿Qué es lo contrario?` : `What is the opposite?`,
                        visualType: "algebra_op",
                        visualData: { ...lastState, phase: 'algebra_step', tempVal: operation },
                        detailedExplanation: { es: "Concepto de operación inversa", en: "Inverse operation concept" }
                    }]
                };
            }
        }

        if (phase === 'algebra_step') {
            const opposite = lastState.tempVal;
            const correct = (opposite === 'subtraction' && (cleanInput.includes('rest') || cleanInput.includes('sub') || cleanInput.includes('-'))) ||
                (opposite === 'addition' && (cleanInput.includes('sum') || cleanInput.includes('add') || cleanInput.includes('+'))) ||
                (opposite === 'division' && (cleanInput.includes('div') || cleanInput.includes('entre') || cleanInput.includes('/')));

            if (correct) {
                // Extract numbers to give the final calculation
                const nums = eq.match(/\d+/g)?.map(Number) || [];
                if (nums.length >= 2) {
                    const n1 = nums[0];
                    const n2 = nums[1];
                    let result = 0;
                    let calcText = "";

                    if (opposite === 'subtraction') {
                        result = n2 - n1;
                        calcText = `${n2} - ${n1}`;
                    } else if (opposite === 'addition') {
                        result = n1 + n2;
                        calcText = `${n1} + ${n2}`;
                    } else if (opposite === 'division') {
                        result = n2 / n1;
                        calcText = `${n2} ÷ ${n1}`;
                    }

                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `¡Perfecto! 🎉 Entonces, para encontrar **${variable}**, calculamos: **${calcText}**.\n\n¿Cuánto te da?`
                                : `Perfect! 🎉 So, to find **${variable}**, we calculate: **${calcText}**.\n\nWhat is the result?`,
                            speech: lang === 'es' ? `Calcula ${calcText}.` : `Calculate ${calcText}.`,
                            visualType: "algebra_op",
                            visualData: { ...lastState, phase: 'algebra_final', targetValue: result },
                            detailedExplanation: { es: "Cálculo final del valor", en: "Final value calculation" }
                        }]
                    };
                }
            }
        }

        if (phase === 'algebra_final') {
            const target = lastState.targetValue;
            const numMatch = cleanInput.match(/(\d+(\.\d+)?)/);
            const userAnswer = numMatch ? parseFloat(numMatch[1]) : null;

            if (userAnswer !== null && Math.abs(userAnswer - (target || 0)) < 0.01) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Fantástico! 🚀 La solución es **${variable} = ${target}**. ¡Has resuelto tu primera ecuación!\n\nSi reemplazas la ${variable} por ${target} en **${eq}**, verás que funciona.`
                            : `Fantastic! 🚀 The solution is **${variable} = ${target}**. You've solved your first equation!\n\nIf you replace ${variable} with ${target} in **${eq}**, you'll see it works.`,
                        speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} La respuesta es ${target}.` : `${getCorrectFeedback(lang, studentName)} The answer is ${target}.`,
                        visualType: "algebra_op",
                        visualData: { ...lastState, phase: 'done', result: String(target) },
                        detailedExplanation: { es: "Ecuación resuelta", en: "Equation solved" }
                    }]
                };
            }
        }

        return null;
    }
}
