import { StepResponse, VisualState } from './types';
import { StateHelper } from './utils';

type ProportionPhase = 'intro' | 'step1' | 'calc' | 'done';

export class ProportionTutor {
    static handleProportion(input: string, prob: any, lang: 'es' | 'en', history: any[], studentName?: string): StepResponse | null {
        const lastState = StateHelper.getCurrentVisualState(history) as any;
        const phase: ProportionPhase = lastState?.wpPhase || 'intro';
        const cleanInput = input.trim().toLowerCase();

        const a1 = prob.a1;
        const b1 = prob.b1;
        const a2 = prob.a2;
        const expected = (b1 * a2) / a1;
        const unitA = prob.unitA || 'unidades';
        const unitB = prob.unitB || 'resultado';

        const parseFloatInput = (s: string): number | null => {
            const m = s.match(/(-?\d+(?:[.,]\d+)?)/);
            if (!m) return null;
            return parseFloat(m[1].replace(',', '.'));
        };

        const userNum = parseFloatInput(cleanInput);

        // --- STEP 0: INTRO ---
        if (prob.isNew && phase === 'intro') {
            return {
                steps: [{
                    text: lang === 'es'
                        ? `🧩 **Problema de Proporcionalidad**\n\n${prob.text}\n\nPara resolverlo, vamos a organizar los datos en una tabla. \n\nSi **${a1}** ${unitA} corresponden a **${b1}** ${unitB}... ¿cuántos ${unitB} corresponden a **${a2}** ${unitA}?`
                        : `🧩 **Proportionality Problem**\n\n${prob.text}\n\nTo solve it, let's organize the data in a table.\n\nIf **${a1}** ${unitA} correspond to **${b1}** ${unitB}... how many ${unitB} correspond to **${a2}** ${unitA}?`,
                    speech: lang === 'es'
                        ? `Vamos a usar una tabla. Si ${a1} son ${b1}, ¿cuántos son ${a2}?`
                        : `Let's use a table. If ${a1} are ${b1}, how many are ${a2}?`,
                    visualType: 'proportion_table',
                    visualData: {
                        a1: String(a1), b1: String(b1), a2: String(a2), b2: '',
                        unitA, unitB, wpPhase: 'calc', wpParsed: prob
                    },
                    detailedExplanation: { es: 'Organizar datos en tabla de proporcionalidad', en: 'Organize data in proportionality table' },
                }],
            };
        }

        // --- STEP 1: CALC ---
        if (phase === 'calc') {
            const correct = userNum !== null && Math.abs(userNum - expected) <= 0.01;

            if (correct) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🎯 **¡Excelente!** La respuesta es **${expected}** ${unitB}.\n\nComo ${a2} es ${a2 / a1} veces ${a1}, el resultado también es ${a2 / a1} veces ${b1}.`
                            : `🎯 **Excellent!** The answer is **${expected}** ${unitB}.\n\nSince ${a2} is ${a2 / a1} times ${a1}, the result is also ${a2 / a1} times ${b1}.`,
                        speech: lang === 'es' ? `¡Muy bien! El resultado es ${expected}.` : `Well done! The result is ${expected}.`,
                        visualType: 'proportion_table',
                        visualData: {
                            a1: String(a1), b1: String(b1), a2: String(a2), b2: String(expected),
                            unitA, unitB, wpPhase: 'done', wpParsed: prob
                        },
                        detailedExplanation: { es: 'Resultado final de proporcionalidad', en: 'Final proportionality result' },
                    }],
                };
            }

            if (userNum !== null && Math.abs(userNum - (b1 / a1)) <= 0.01) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Casi! 😮 Has encontrado el **valor unitario** (cuánto vale 1 ${unitA}), que es **${b1 / a1}**. \n\nAhora solo multiplícalo por **${a2}** para saber cuánto valen ${a2}.`
                            : `Almost! 😮 You found the **unit value** (how much 1 ${unitA} costs), which is **${b1 / a1}**.\n\nNow just multiply it by **${a2}** to find the total for ${a2}.`,
                        speech: lang === 'es' ? `Ese es el valor de uno solo. Multiplícalo por ${a2}.` : `That's the value for just one. Multiply it by ${a2}.`,
                        visualType: 'proportion_table',
                        visualData: {
                            a1: String(a1), b1: String(b1), a2: String(a2), b2: '',
                            unitA, unitB, wpPhase: 'calc', highlight: 'b1', wpParsed: prob
                        },
                        detailedExplanation: { es: 'Error de valor unitario vs total', en: 'Unit value vs total error' },
                    }],
                };
            }

            return {
                steps: [{
                    text: lang === 'es'
                        ? `💡 **Pista:** Puedes calcular cuánto vale **1 ${unitA}** dividiendo **${b1} ÷ ${a1}**. \n\nLuego, multiplica ese resultado por **${a2}**. ¿Cuánto te da?`
                        : `💡 **Hint:** You can calculate how much **1 ${unitA}** costs by dividing **${b1} ÷ ${a1}**.\n\nThen, multiply that result by **${a2}**. What is the answer?`,
                    speech: lang === 'es' ? `Divide ${b1} entre ${a1} y luego multiplica por ${a2}.` : `Divide ${b1} by ${a1} and then multiply by ${a2}.`,
                    visualType: 'proportion_table',
                    visualData: {
                        a1: String(a1), b1: String(b1), a2: String(a2), b2: '',
                        unitA, unitB, wpPhase: 'calc', wpParsed: prob
                    },
                    detailedExplanation: { es: 'Pista de resolución por valor unitario', en: 'Unit value resolution hint' },
                }],
            };
        }

        return null;
    }
}
