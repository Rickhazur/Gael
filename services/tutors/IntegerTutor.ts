
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
        let expected = 0;
        if (op === '+') expected = n1 + n2;
        else if (op === '-') expected = n1 - n2;
        else if (op === '×' || op === 'x' || op === '*') expected = n1 * n2;
        else if (op === '÷' || op === '/') expected = Math.floor(n1 / n2);
        const problemKey = `${n1}${op}${n2}`;

        // Get last state to track phases
        let lastState: any = null;
        for (let i = history.length - 2; i >= 0; i--) {
            const h = history[i];
            if (h.role === 'assistant' || h.role === 'nova') {
                if (h.visualState?.operand1 === String(n1) && h.visualState?.operand2 === String(n2)) {
                    lastState = h.visualState;
                    break;
                }
            }
        }

        if (prob.isNew || !lastState) {
            this.hintLevels.delete(problemKey);
            const introEs = `¡Misión Números Enteros! 🚀 Vamos a resolver **${n1} ${op} ${n2}**.\n\nImagina una **recta numérica**. Los números positivos están a la derecha (derecha = ganar 🟢) y los negativos a la izquierda (izquierda = deber 🔴).\n\n**¿En qué número empezamos esta aventura?**`;
            const introEn = `Integer Mission! 🚀 Let's solve **${n1} ${op} ${n2}**.\n\nImagine a **number line**. Positive numbers are to the right (right = gain 🟢) and negatives are to the left (left = owe 🔴).\n\n**Where do we start this adventure?**`;

            return {
                steps: [{
                    text: introEs,
                    speech: lang === 'es'
                        ? `¡Hola! Vamos a conquistar los números enteros. Imagina una recta numérica. ¿En qué número empezamos?`
                        : `Hi! Let's master integers. Imagine a number line. Where do we start?`,
                    visualType: "integer_op",
                    visualData: {
                        operand1: String(n1), operand2: String(n2), operator: op,
                        phase: 'start', currentPos: n1,
                        type: 'number_line'
                    },
                    detailedExplanation: { es: "Inicio socrático: posición inicial", en: "Socratic start: initial position" }
                }]
            };
        }

        // --- PHASE 1: IDENTIFY START ---
        if (lastState.phase === 'start') {
            const val = parseInt(input.replace(/[^\d-]/g, ''));
            if (val === n1) {
                const nextEs = `¡Exacto! Empezamos en el **${n1}**. 📍\n\nAhora, el segundo paso: tenemos **${op} ${n2}**. ¿Hacia dónde nos movemos y cuántos pasos?`;
                const nextEn = `Exactly! We start at **${n1}**. 📍\n\nNow, the second step: we have **${op} ${n2}**. Which way do we move and how many steps?`;
                return {
                    steps: [{
                        text: lang === 'es' ? nextEs : nextEn,
                        speech: lang === 'es' ? `¡Bien! Empezamos en ${n1}. Ahora, ¿hacia dónde vamos y cuántos pasos?` : `Good! We start at ${n1}. Now, which way and how many steps?`,
                        visualType: "integer_op",
                        visualData: { ...lastState, phase: 'direction', correctValue: n2 },
                        detailedExplanation: { es: "Fase de dirección", en: "Direction phase" }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es' ? `Mira bien la operación: **${n1}** ${op} ${n2}. El primer número nos dice dónde pararnos. ¿Cuál es?` : `Look at the operation: **${n1}** ${op} ${n2}. The first number tells us where to stand. Which one is it?`,
                        speech: lang === 'es' ? `Mira el primer número. ¿Cuál es?` : `Look at the first number. What is it?`,
                        visualType: "integer_op",
                        visualData: lastState
                    }]
                };
            }
        }

        // --- PHASE 2: DIRECTION ---
        if (lastState.phase === 'direction') {
            const isRight = input.match(/derecha|gan|win|right|plus|más/i);
            const isLeft = input.match(/izquierda|deb|owe|left|minus|menos|pierd|loss/i);
            const hasSteps = input.includes(String(Math.abs(n2)));

            if ((isRight || isLeft) && hasSteps) {
                const finalEs = `¡Excelente análisis! 🧠\n\nSi estamos en **${n1}** y nos movemos **${Math.abs(n2)}** hacia la ${isRight ? 'derecha' : 'izquierda'}... \n\n**¿A qué número llegamos?**`;
                const finalEn = `Excellent analysis! 🧠\n\nIf we are at **${n1}** and move **${Math.abs(n2)}** to the ${isRight ? 'right' : 'left'}... \n\n**What number do we reach?**`;
                return {
                    steps: [{
                        text: lang === 'es' ? finalEs : finalEn,
                        speech: lang === 'es' ? `¡Eso es! ¿A qué número final llegamos?` : `That's it! What's the final number?`,
                        visualType: "integer_op",
                        visualData: { ...lastState, phase: 'final', expectedValue: expected },
                        detailedExplanation: { es: "Fase de resultado final", en: "Final result phase" }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es' ? `Pista: El **${n2}** con el signo **${op}** nos dice si ganamos (derecha) o perdemos (izquierda). ¿Qué crees?` : `Hint: The **${n2}** with the **${op}** sign tells us if we gain (right) or lose (left). What do you think?`,
                        speech: lang === 'es' ? `El signo nos dice la dirección. ¿Derecha o izquierda?` : `The sign tells us the direction. Right or left?`,
                        visualType: "integer_op",
                        visualData: lastState
                    }]
                };
            }
        }

        // --- PHASE 3: FINAL ANSWER ---
        const validation = AnswerValidator.validate(input, expected);
        if (validation.isCorrect) {
            this.hintLevels.delete(problemKey);
            const successEs = `${getCorrectFeedback('es', studentName)} **${n1} ${op} ${n2} = ${expected}**. ¡Eres un maestro de los enteros! 🏆`;
            const successEn = `${getCorrectFeedback('en', studentName)} **${n1} ${op} ${n2} = ${expected}**. You're an integer master! 🏆`;

            return {
                steps: [{
                    text: lang === 'es' ? successEs : successEn,
                    speech: lang === 'es' ? successEs : successEn,
                    visualType: "integer_op",
                    visualData: { ...lastState, phase: 'done', result: String(expected) },
                    detailedExplanation: { es: "Correcto", en: "Correct" }
                }]
            };
        }

        // Incorrect Answer / Hinting
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
                    ? `Hmm, no es ese número. 🤔 ¿Quieres intentar de nuevo? Recuerda que empezamos en ${n1} y nos movemos ${Math.abs(n2)} pasos.`
                    : `Hmm, that's not it. 🤔 Want to try again? Remember we start at ${n1} and move ${Math.abs(n2)} steps.`;
            }
        } else {
            hint.text = lang === 'es'
                ? `¡No te rindas! 💪 La respuesta es **${expected}**. Porque desde ${n1}, moviéndonos hacia la ${expected > n1 ? 'derecha' : 'izquierda'} llegamos a ${expected}.`
                : `Don't give up! 💪 The answer is **${expected}**. Because from ${n1}, moving to the ${expected > n1 ? 'right' : 'left'} we reach ${expected}.`;
            this.hintLevels.delete(problemKey);
        }

        hint.speech = hint.text;
        return {
            steps: [{
                text: hint.text,
                speech: hint.speech,
                visualType: "integer_op",
                visualData: { ...lastState, result: "" },
                detailedExplanation: { es: "Pista graduada", en: "Graduated hint" }
            }]
        };
    }
}
