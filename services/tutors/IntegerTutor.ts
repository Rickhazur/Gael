
import { StepResponse, HintLevel, ErrorType } from './types';
import { AnswerValidator, HintGenerator, StateHelper } from './utils';
import { getCorrectFeedback } from '../../data/feedbackPhrases';

export class IntegerTutor {
    private static hintLevels: Map<string, HintLevel> = new Map();

    private static getHintLevel(problemKey: string): HintLevel {
        return this.hintLevels.get(problemKey) || HintLevel.NONE;
    }

    private static setHintLevel(problemKey: string, level: HintLevel): void {
        this.hintLevels.set(problemKey, level);
    }

    static handleIntegers(input: string, prob: any, lang: 'es' | 'en', history: any[], studentName?: string): StepResponse | null {
        const n1 = parseInt(prob.n1);
        const n2 = parseInt(prob.n2);
        const op = prob.operator;
        const expected = op === '+' ? n1 + n2 : n1 - n2;
        const problemKey = `${n1}${op}${n2}`;

        if (prob.isNew) {
            this.hintLevels.delete(problemKey);
            const introEs = `¡Misión Números Enteros! 🚀 Vamos a resolver **${n1} ${op} ${n2}**.\n\nImagina una **recta numérica**. Los números positivos están a la derecha del cero y los negativos a la izquierda. 📏\n\n¿Cuál crees que es el resultado?`;
            const introEn = `Integer Mission! 🚀 Let's solve **${n1} ${op} ${n2}**.\n\nImagine a **number line**. Positive numbers are to the right of zero, and negatives are to the left. 📏\n\nWhat do you think the result is?`;

            return {
                steps: [{
                    text: lang === 'es' ? introEs : introEn,
                    speech: lang === 'es'
                        ? `¡Hola! Vamos a conquistar los números enteros. Imagina una recta numérica. ¿Cuánto nos da ${n1} ${op === '+' ? 'más' : 'menos'} ${n2}?`
                        : `Hi! Let's master integers. Imagine a number line. What is ${n1} ${op === '+' ? 'plus' : 'minus'} ${n2}?`,
                    visualType: "integer_op",
                    visualData: { operand1: String(n1), operand2: String(n2), operator: op, result: "", type: 'number_line' },
                    detailedExplanation: { es: "Inicio socrático de enteros", en: "Socratic start for integers" }
                }]
            };
        }

        const validation = AnswerValidator.validate(input, expected);
        if (!validation.isNumericInput) {
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Mantente enfocado! 🎯 ¿Cuánto es **${n1} ${op} ${n2}**?`
                        : `Stay focused! 🎯 What is **${n1} ${op} ${n2}**?`,
                    speech: lang === 'es' ? `¡No te distraigas! ¿Cuánto nos da la operación?` : `Don't get distracted! What's the result?`,
                    visualType: "integer_op",
                    visualData: { operand1: String(n1), operand2: String(n2), operator: op, result: "" },
                    detailedExplanation: { es: "Persistencia socrática", en: "Socratic persistence" }
                }]
            };
        }

        if (!validation.isCorrect) {
            const userAnswer = validation.userAnswer!;
            const currentLevel = this.getHintLevel(problemKey);
            let nextLevel = currentLevel + 1;
            if (nextLevel > HintLevel.REVEALED) nextLevel = HintLevel.REVEALED;
            this.setHintLevel(problemKey, nextLevel);

            let hint = { text: "", speech: "" };

            if (currentLevel === HintLevel.NONE) {
                if (Math.abs(userAnswer) === Math.abs(expected)) {
                    hint.text = lang === 'es'
                        ? `¡Casi! El valor es correcto, pero **revisa el signo**. ¿Debería ser positivo (+) o negativo (-)?`
                        : `Almost! The value is correct, but **check the sign**. Should it be positive (+) or negative (-)?`;
                } else {
                    hint.text = lang === 'es'
                        ? `Hmm, no es ese número. 🤔 ¿Quieres intentar de nuevo? Revisa bien la dirección en la recta.`
                        : `Hmm, that's not it. 🤔 Want to try again? Check the direction on the number line.`;
                }
            } else if (currentLevel === HintLevel.GENTLE) {
                hint.text = lang === 'es'
                    ? `Pista visual: Empieza en **${n1}**. Si es ${op === '+' ? 'suma' : 'resta'}, de dondé vienes y a dondé vas? 
                       \n${n2 > 0 ? (op === '+' ? 'Derecha' : 'Izquierda') : (op === '+' ? 'Izquierda' : 'Derecha')} ${Math.abs(n2)} pasos.`
                    : `Visual hint: Start at **${n1}**. If you ${op === '+' ? 'add' : 'subtract'}, where do you go?
                       \nMove ${Math.abs(n2)} steps to the ${n2 > 0 ? (op === '+' ? 'right' : 'left') : (op === '+' ? 'left' : 'right')}.`;
            } else if (currentLevel === HintLevel.VISUAL) {
                const stepByStep = lang === 'es'
                    ? `Pensemos en dinero: Tienes ${n1 > 0 ? 'ganancia' : 'deuda'} de **${Math.abs(n1)}**. Luego ${op === '+' ? (n2 > 0 ? 'ganas' : 'pierdes') : (n2 > 0 ? 'pierdes' : 'ganas')} **${Math.abs(n2)}**. Al final, ¿tienes o debes?`
                    : `Think about money: You have a ${n1 > 0 ? 'gain' : 'debt'} of **${Math.abs(n1)}**. Then you ${op === '+' ? (n2 > 0 ? 'win' : 'lose') : (n2 > 0 ? 'lose' : 'win')} **${Math.abs(n2)}**. In the end, do you have money or do you owe?`;
                hint.text = stepByStep;
            } else {
                hint.text = lang === 'es'
                    ? `¡No te rindas! 💪 La respuesta es **${expected}**. ¿Ves por qué? Porque desde ${n1}, moviéndonos ${Math.abs(n2)} llegamos a ${expected}.`
                    : `Don't give up! 💪 The answer is **${expected}**. See why? Starting from ${n1}, moving ${Math.abs(n2)} leads to ${expected}.`;
                this.hintLevels.delete(problemKey);
            }

            hint.speech = hint.text;
            return {
                steps: [{
                    text: hint.text,
                    speech: hint.speech,
                    visualType: "integer_op",
                    visualData: { operand1: String(n1), operand2: String(n2), operator: op, result: "" },
                    detailedExplanation: { es: "Pista graduada", en: "Graduated hint" }
                }]
            };
        }

        // Correct
        this.hintLevels.delete(problemKey);
        const successEs = `${getCorrectFeedback('es', studentName)} **${n1} ${op} ${n2} = ${expected}**. ¡Eres un maestro de los enteros! 🏆`;
        const successEn = `${getCorrectFeedback('en', studentName)} **${n1} ${op} ${n2} = ${expected}**. You're an integer master! 🏆`;

        return {
            steps: [{
                text: successEs,
                speech: successEs,
                visualType: "integer_op",
                visualData: { operand1: String(n1), operand2: String(n2), operator: op, result: String(expected) },
                detailedExplanation: { es: "Correcto", en: "Correct" }
            }]
        };
    }
}
