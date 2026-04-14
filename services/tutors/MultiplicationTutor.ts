
import { StepResponse } from './types';
import { GradeLevel } from '@/types/tutor';
import { AnswerValidator, HintGenerator, StateHelper, formatForSpeech } from './utils';
import { getCorrectFeedback } from '../../data/feedbackPhrases';

export class MultiplicationTutor {
    static handleMultiplication(input: string, prob: any, lang: 'es' | 'en', history: any[], studentName?: string, grade: GradeLevel = 3): StepResponse | null {
        const lastState = StateHelper.getCurrentVisualState(history);

        // --- PERSISTENCE: Use original operands if we are already in a session ---
        const n1Str = String(lastState?.operand1 || prob.n1 || "0");
        const n2Str = String(lastState?.operand2 || prob.n2 || "0");
        const n1 = parseInt(n1Str) || 0;
        const n2 = parseInt(n2Str) || 0;
        const result = n1 * n2;

        const cleanInput = input.toLowerCase().trim();

        // Helper to normalize results
        const getResults = (state: any): string[] => {
            if (!state) return [""];
            if (Array.isArray(state.result)) return [...state.result];
            return [String(state.result || "")];
        };
        const currentResults = getResults(lastState);

        const currentPhase = lastState?.phase || (prob.isNew ? 'init' : 'solving');

        // =========================================================
        // 🟢 PHASE: INIT (Greeting + Utility + Alignment)
        // =========================================================
        if (currentPhase === 'init') {
            let introEs = "";
            let introEn = "";
            let speechEs = "";
            let speechEn = "";

            if (grade <= 1) {
                introEs = `¡Hola! 🌟 Soy la **Profesora Lina**. ¡Vamos a multiplicar!\n\n¿Sabes qué es multiplicar? 🍭 Es como sumar grupos de cosas ricas. ¡Nos ayuda a contar mucho más rápido!\n\nMira la pizarra: alineé los números uno debajo del otro. ¿Los ves listos para jugar?`;
                introEn = `Hi! 🌟 I'm **Professor Lina**. Let's multiply!\n\nDo you know what multiplying is? 🍭 It's like adding groups of yummy things. It helps us count much faster!\n\nLook at the board: I aligned the numbers one under the other. Are they ready to play?`;
                speechEs = grade >= 6
                    ? `Hola. Soy la profesora Lina. Vamos a trabajar multiplicaciones. Mira la pizarra: los números están organizados por unidades. ¿Los ves?`
                    : `¡Hola, corazón! Soy la profe Lina. Hoy vamos a aprender a multiplicar. Es como un truco de magia para contar súper rápido. Mira la pizarra: puse los números alineaditos. ¿Ya los viste?`;
                speechEn = grade >= 6
                    ? `Hello. I'm Professor Lina. Let's work on multiplication. Look at the board: the numbers are aligned by units. Do you see them?`
                    : `Hi, sweetie! I'm Professor Lina. Today we're going to learn to multiply. It's like a magic trick for counting super fast. Look at the board: I put the numbers all lined up. Do you see them?`;
            } else {
                introEs = `¡Hola! 👋 Soy la **Profesora Lina**. ¡Lista para la Misión Multiplicación!\n\nMultiplicar es una de las herramientas más poderosas 🛠️. Te servirá para calcular áreas, recetas y ¡hasta para programar robots!\n\nPrimero, alineamos los números: **unidades con unidades**. ¿Ves qué bien quedaron en el tablero?`;
                introEn = `Hi! 👋 I'm **Professor Lina**. Ready for the Multiplication Mission!\n\nMultiplying is one of the most powerful tools 🛠️. It will help you calculate areas, recipes, and even program robots!\n\nFirst, we align the numbers: **units with units**. Do they look good on the board?`;
                speechEs = `¡Hola! Soy la profe Lina. ¡Qué emoción! Vamos a multiplicar. Esta operación te va a encantar porque te ahorra mucho tiempo al sumar. Mira la pizarra: ¿viste cómo puse los números alineados por unidades?`;
                speechEn = `Hi! I'm Professor Lina. So excited! Let's multiply. You're going to love this operation because it saves you so much time. Look at the board: did you see how I aligned the numbers by units?`;
            }

            return {
                steps: [{
                    text: introEs,
                    speech: lang === 'es' ? speechEs : speechEn,
                    visualType: "vertical_op",
                    visualData: {
                        operand1: n1Str, operand2: n2Str, operator: "×", result: [""],
                        phase: 'direction_check'
                    },
                    detailedExplanation: { es: "Introducción y Alineación", en: "Intro and Alignment" }
                }]
            };
        }

        // =========================================================
        // 🟢 PHASE: DIRECTION CHECK (Where do we start?)
        // =========================================================
        if (currentPhase === 'direction_check') {
            const startsRight = cleanInput.includes('derecha') || cleanInput.includes('right') || cleanInput.includes('final') || cleanInput.includes('unidades') || cleanInput.includes('units');

            if (startsRight) {
                const mDigit = parseInt(n2Str[n2Str.length - 1]);
                const tDigit = parseInt(n1Str[n1Str.length - 1]);

                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Eso es! 🎯 En la multiplicación también empezamos siempre por la **derecha**, por las **unidades**.\n\nEl **${mDigit}** de abajo visitará primero al **${tDigit}** de arriba. ¿Cuánto es **${mDigit} × ${tDigit}**?`
                            : `That's it! 🎯 In multiplication, we also always start on the **right**, with the **units**.\n\nThe **${mDigit}** from below will first visit the **${tDigit}** above. What is **${mDigit} × ${tDigit}**?`,
                        speech: lang === 'es'
                            ? `¡Muy bien! Siempre por la derecha. Entonces, el ${mDigit} de abajo multiplica al ${tDigit} de arriba. ¿Cuánto es ${mDigit} por ${tDigit}?`
                            : `Very good! Always on the right. So, the ${mDigit} below multiplies the ${tDigit} above. What is ${mDigit} times ${tDigit}?`,
                        visualType: "vertical_op",
                        visualData: {
                            operand1: n1Str, operand2: n2Str, operator: "×", result: [""],
                            highlightDigit: { row: 0, col: 0 },
                            multiplierDigit: { row: 1, col: 0 },
                            phase: 'solving'
                        },
                        detailedExplanation: { es: "Inicio de cálculos", en: "Starting calculations" }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Pensemos un momento! 👀 ¿Por dónde empezamos este viaje? ¿Por la **izquierda** o por la **derecha** (unidades)?`
                            : `Let's think for a moment! 👀 Where do we start this journey? From the **left** or from the **right** (units)?`,
                        speech: lang === 'es'
                            ? `¡Hmm! Para que nos salga perfecto, ¿por dónde empezamos? ¿Por la izquierda o por la derecha?`
                            : `Hmm! To make it perfect, where do we start? From the left or the right?`,
                        visualType: "vertical_op",
                        visualData: {
                            operand1: n1Str, operand2: n2Str, operator: "×", result: [""],
                            phase: 'direction_check'
                        },
                        detailedExplanation: { es: "Pregunta de dirección", en: "Direction question" }
                    }]
                };
            }
        }

        // --- STEP 2: HANDLE POSITIONAL IDENTIFICATION ---
        // If the last state was the "Where are the units?" question (highlight: 'all')
        if (lastState && lastState.highlight === 'all') {
            if (cleanInput.includes('derecha') || cleanInput.includes('right') || cleanInput.includes('aquí')) {
                const mDigit = parseInt(n2Str[n2Str.length - 1]);
                const tDigit = parseInt(n1Str[n1Str.length - 1]);

                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Correcto! 🌟 Empezamos por la derecha. El **${mDigit}** (unidades) visitará a todos los de arriba empezando por el final.\n\n¿Cuánto es **${mDigit} × ${tDigit}**?`
                            : `Correct! 🌟 We start on the right. The **${mDigit}** (units) will visit everyone upstairs starting from the end.\n\nWhat is **${mDigit} × ${tDigit}**?`,
                        speech: lang === 'es' ? `¡Correcto! Primero: ${mDigit} por ${tDigit}.` : `Correct! First: ${mDigit} times ${tDigit}.`,
                        visualType: "vertical_op",
                        visualData: {
                            operand1: n1Str, operand2: n2Str, operator: "×", result: [""],
                            highlightDigit: { row: 0, col: 0 },
                            multiplierDigit: { row: 1, col: 0 },
                            context: lang === 'es' ? "Multiplicando Unidades (Der → Izq)" : "Multiplying Units (R → L)"
                        },
                        detailedExplanation: { es: "Primer producto parcial", en: "First partial product" }
                    }]
                };
            } else if (cleanInput.includes('izquierda') || cleanInput.includes('left')) {
                // Wrong Answer Pedalogy
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Casi! 😄 La izquierda es para los números más grandes (como las centenas). Las **unidades** son las que están al final del camino, a tu mano **derecha** 👉.\n\n¿Probamos de nuevo? ¿Derecha o izquierda?`
                            : `Close! 😄 Left is for the bigger numbers (like hundreds). **Units** are at the very end of the line, on your **right** hand 👉.\n\nLet's try again! Right or left?`,
                        speech: lang === 'es' ? `Casi. Las unidades están a la derecha.` : `Units are on the right.`,
                        visualType: "vertical_op",
                        visualData: lastState,
                        detailedExplanation: { es: "Corrección posicional", en: "Positional correction" }
                    }]
                };
            } else {
                // Handle generic "No sé" or typos
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `No te preocupes. Mira la pizarra... ¿Ves el número que está más a la **derecha**? Esas son las unidades. Escribe "derecha" para continuar.`
                            : `Don't worry. Look at the board... see the number on the far **right**? Those are the units. Type "right" to continue.`,
                        speech: lang === 'es' ? `Mira a la derecha.` : `Look to the right.`,
                        visualType: "vertical_op",
                        visualData: lastState,
                        detailedExplanation: { es: "Ayuda visual", en: "Visual aid" }
                    }]
                };
            }
        }
        // --- STEP 2.5: CHECK FINAL SUM (New Phase) ---
        if (lastState && lastState.highlight === 'sum_check') {
            const userSum = parseInt(cleanInput.replace(/\D/g, ''));
            const contextMsg = lang === 'es' ? "¡Sumando todo!" : "Adding everything up!";

            if (isNaN(userSum)) {
                return {
                    steps: [{
                        text: lang === 'es' ? "Por favor, escribe el resultado final de la suma." : "Please write the final sum result.",
                        speech: lang === 'es' ? "Escribe el resultado." : "Write the result.",
                        visualType: "vertical_op",
                        visualData: { ...lastState, context: contextMsg },
                        detailedExplanation: { es: "Esperando suma", en: "Waiting for sum" }
                    }]
                };
            }

            if (userSum === result) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡FANTÁSTICO! 🎉 La suma es correcta.\n\n**${n1} × ${n2} = ${result}**\n\n¡Has completado toda la misión! 🚀`
                            : `FANTASTIC! 🎉 The sum is correct.\n\n**${n1} × ${n2} = ${result}**\n\nMission complete! 🚀`,
                        speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} El resultado es ${formatForSpeech(result, lang)}.` : `${getCorrectFeedback(lang, studentName)} The result is ${formatForSpeech(result, lang)}.`,
                        visualType: "vertical_op",
                        visualData: {
                            operand1: n1Str, operand2: n2Str, operator: "×",
                            result: [...currentResults, String(result)], // Append final sum
                            highlight: "done",
                            context: lang === 'es' ? "¡Misión Cumplida! 🎉" : "Mission Complete! 🎉"
                        },
                        detailedExplanation: { es: "Multiplicación finalizada", en: "Multiplication finished" }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `Mmm... esa no es la suma correcta. 🧐\n\nRevisa bien las columnas de tus productos parciales y no olvides las llevadas de la suma.\n\n¿Cuánto suman estos números?`
                            : `Hmm... that's not the right sum. 🧐\n\nCheck the columns of your partial products and don't forget the addition carries.\n\nWhat do these numbers add up to?`,
                        speech: lang === 'es' ? "Esa no es la suma. Intenta de nuevo." : "That's not the sum. Try again.",
                        visualType: "vertical_op",
                        visualData: { ...lastState, context: contextMsg },
                        detailedExplanation: { es: "Error en suma final", en: "Final sum error" }
                    }]
                };
            }
        }

        // --- STEP 3: TRANSITION TO NEXT ROW ---
        // If col is -1, we are waiting for the user to confirm they are ready for the next multiplier digit
        if (lastState && lastState.highlightDigit?.col === -1) {
            const nextMDIdx = lastState.multiplierDigit?.col ?? 0;
            const nextMDigit = parseInt(n2Str[n2Str.length - 1 - nextMDIdx]);
            const firstTDigit = parseInt(n1Str[n1Str.length - 1]);

            const pvNamesEs = ['unidades', 'decenas', 'centenas', 'unidades de mil', 'decenas de mil', 'centenas de mil'];
            const pvNamesEn = ['units', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];
            const pvName = lang === 'es' ? pvNamesEs[nextMDIdx] : pvNamesEn[nextMDIdx];

            const zeroRuleEs = nextMDIdx === 1
                ? "dejamos un **espacio vacío** o ponemos un **0** a la derecha"
                : `dejamos **${nextMDIdx} espacios vacíos** o ponemos **${nextMDIdx} ceros** a la derecha`;
            const zeroRuleEn = nextMDIdx === 1
                ? "leave an **empty space** or put a **0** on the right"
                : `leave **${nextMDIdx} empty spaces** or put **${nextMDIdx} zeros** on the right`;

            // Prepare the new row with Zeros
            const nextResults = [...currentResults];
            // Ensure we have a string for the new row
            if (!nextResults[nextMDIdx]) nextResults[nextMDIdx] = "";

            // Auto-fill placeholders (zeros) for the new row based on place value
            // e.g. Row 1 (tens) needs 1 zero at end.
            const placeholders = "0".repeat(nextMDIdx);
            if (!nextResults[nextMDIdx].endsWith(placeholders)) {
                nextResults[nextMDIdx] = placeholders;
            }

            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Excelente! Ahora el **${nextMDigit}** (${pvName}) va a multiplicar a todos los de arriba.\n\n⚠️ **REGLA MÁGICA**: Como estamos en las ${pvName}, ${zeroRuleEs} en la nueva fila.\n\n¿Cuánto es **${nextMDigit} × ${firstTDigit}**?`
                        : `Excellent! Now the **${nextMDigit}** (${pvName}) will multiply everyone upstairs.\n\n⚠️ **MAGIC RULE**: Since we are in the ${pvName}, ${zeroRuleEn} in the new row.\n\nWhat is **${nextMDigit} × ${firstTDigit}**?`,
                    speech: lang === 'es'
                        ? `¡Bien! Ahora el ${nextMDigit} multiplica a todos. No olvides los ${nextMDIdx} ceros a la derecha. ¿Cuánto es ${nextMDigit} por ${firstTDigit}?`
                        : `Good! Now the ${nextMDigit} multiplies everyone. Don't forget the ${nextMDIdx} zeros on the right. What is ${nextMDigit} times ${firstTDigit}?`,
                    visualType: "vertical_op",
                    visualData: {
                        operand1: n1Str, operand2: n2Str, operator: "×", result: nextResults,
                        highlightDigit: { row: 0, col: 0 },
                        multiplierDigit: { row: 1, col: nextMDIdx },
                        carry: ""
                    },
                    detailedExplanation: { es: `Siguiente fila (${pvName})`, en: `Next row (${pvName})` }
                }]
            };
        }

        const currentMD = lastState?.multiplierDigit?.col ?? 0;
        const currentTD = lastState?.highlightDigit?.col ?? 0;
        const currentCarry = lastState?.carry ? parseInt(lastState.carry) : 0;

        const mDigit = parseInt(n2Str[n2Str.length - 1 - currentMD]);
        const tDigit = parseInt(n1Str[n1Str.length - 1 - currentTD]);
        const expectedFullValue = (mDigit * tDigit) + currentCarry;

        const validation = AnswerValidator.validate(input, expectedFullValue);

        if (validation.isNumericInput) {
            if (validation.isCorrect) {
                const nextTDIdx = currentTD + 1;
                const digitToWrite = expectedFullValue % 10;
                const nextCarry = Math.floor(expectedFullValue / 10);

                // Construct result for CURRENT ROW
                const nextResults = [...currentResults];
                const currentRowStr = nextResults[currentMD] || "";
                const newRowStr = String(digitToWrite) + currentRowStr;
                nextResults[currentMD] = newRowStr;

                if (nextTDIdx < n1Str.length) {
                    const nextTDigit = parseInt(n1Str[n1Str.length - 1 - nextTDIdx]);

                    let carryStory = "";
                    if (nextCarry > 0) {
                        carryStory = lang === 'es'
                            ? `\n\n¡Oye! **${expectedFullValue}** es muy grande. Dejamos el **${digitToWrite}** abajo y el **${nextCarry}** se va a la nubecita del vecino.`
                            : `\n\nHey! **${expectedFullValue}** is too big. We leave the **${digitToWrite}** below and the **${nextCarry}** goes to the neighbor's cloud.`;
                    }

                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `¡Excelente cálculo! ✨ ${mDigit} × ${tDigit}${currentCarry > 0 ? ' + ' + currentCarry : ''} es **${expectedFullValue}**. ${carryStory}\n\nAhora seguimos: el **${mDigit}** de abajo vuela a visitar al **${nextTDigit}** de arriba.\n\n¿Cuánto es **${mDigit} × ${nextTDigit}**${nextCarry > 0 ? ' más el **' + nextCarry + '** que llevamos' : ''}?`
                                : `Excellent calculation! ✨ ${mDigit} × ${tDigit}${currentCarry > 0 ? ' + ' + currentCarry : ''} is **${expectedFullValue}**. ${carryStory}\n\nNow we continue: the **${mDigit}** from below flies to visit the **${nextTDigit}** above.\n\nWhat is **${mDigit} × ${nextTDigit}**${nextCarry > 0 ? ' plus the **' + nextCarry + '** we carried' : ''}?`,
                            speech: lang === 'es'
                                ? `${getCorrectFeedback(lang, studentName)} ${mDigit} por ${tDigit} ${currentCarry > 0 ? ' más la que llevábamos ' : ''} nos da ${expectedFullValue}. Ahora: ¿Cuánto es ${mDigit} por ${nextTDigit}${nextCarry > 0 ? ' más el ' + nextCarry + ' que llevamos ahora' : ''}?`
                                : `${getCorrectFeedback(lang, studentName)} ${mDigit} times ${tDigit} ${currentCarry > 0 ? ' plus the carry ' : ''} gives us ${expectedFullValue}. Now: What is ${mDigit} times ${nextTDigit}${nextCarry > 0 ? ' plus the ' + nextCarry + ' we carry now' : ''}?`,
                            visualType: "vertical_op",
                            visualData: {
                                operand1: n1Str, operand2: n2Str, operator: "×", result: nextResults,
                                highlightDigit: { row: 0, col: nextTDIdx },
                                multiplierDigit: { row: 1, col: currentMD },
                                carry: nextCarry > 0 ? String(nextCarry) : "",
                                context: lang === 'es' ? `Multiplicando: ${mDigit} × ${nextTDigit}${nextCarry > 0 ? ' + llevada' : ''}` : `Multiplying: ${mDigit} × ${nextTDigit}`
                            },
                            detailedExplanation: { es: "Multiplicación con llevada", en: "Multiplication with carry" }
                        }]
                    };
                } else {
                    // Row Finished
                    const finalRowResult = nextCarry > 0 ? String(nextCarry) + newRowStr : newRowStr;
                    nextResults[currentMD] = finalRowResult;

                    const nextMDIdx = currentMD + 1;

                    if (nextMDIdx < n2Str.length) {
                        // SKIP CONFIRMATION - JUMP STRAIGHT TO NEXT NUMBER
                        // We replicate the logic from "STEP 3: TRANSITION TO NEXT ROW" immediately here
                        const nextMDigit = parseInt(n2Str[n2Str.length - 1 - nextMDIdx]);
                        const firstTDigit = parseInt(n1Str[n1Str.length - 1]);

                        const pvNamesEs = ['unidades', 'decenas', 'centenas', 'unidades de mil', 'decenas de mil', 'centenas de mil'];
                        const pvNamesEn = ['units', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];
                        const pvName = lang === 'es' ? pvNamesEs[nextMDIdx] : pvNamesEn[nextMDIdx];

                        const zeroRuleEs = nextMDIdx === 1
                            ? `como el **${nextMDigit}** está en las **${pvName}**, en realidad vale **${nextMDigit}0**. Por eso, para mantener el orden, ponemos un **0** al final de esta fila antes de empezar.`
                            : `como el **${nextMDigit}** está en las **${pvName}**, dejamos **${nextMDIdx} ceros** al final para que todo esté en su lugar.`;
                        const zeroRuleEn = nextMDIdx === 1
                            ? `since the **${nextMDigit}** is in the **${pvName}** place, it actually represents **${nextMDigit}0**. To keep everything aligned, we put a **0** at the end of this row first.`
                            : `since the **${nextMDigit}** is in the **${pvName}** place, we leave **${nextMDIdx} zeros** at the end to keep the alignment correct.`;

                        // Pre-fill zeros for the visual immediately
                        if (!nextResults[nextMDIdx]) nextResults[nextMDIdx] = "";
                        const placeholders = "0".repeat(nextMDIdx);
                        if (!nextResults[nextMDIdx].endsWith(placeholders)) {
                            nextResults[nextMDIdx] = placeholders;
                        }

                        return {
                            steps: [{
                                text: lang === 'es'
                                    ? `¡Terminamos esta fila! El resultado es **${finalRowResult}**.\n\nVamos directo al siguiente: el **${nextMDigit}** (${pvName}).\n\n⚠️ Regla: ${zeroRuleEs}.\n\n¿Cuánto es **${nextMDigit} × ${firstTDigit}**?`
                                    : `Row finished! Result is **${finalRowResult}**.\n\nNext up: **${nextMDigit}** (${pvName}).\n\n⚠️ Rule: ${zeroRuleEn}.\n\nWhat is **${nextMDigit} × ${firstTDigit}**?`,
                                speech: lang === 'es' ? `Siguiente: ${nextMDigit} por ${firstTDigit}.` : `Next: ${nextMDigit} times ${firstTDigit}.`,
                                visualType: "vertical_op",
                                visualData: {
                                    operand1: n1Str, operand2: n2Str, operator: "×", result: nextResults,
                                    highlightDigit: { row: 0, col: 0 },
                                    multiplierDigit: { row: 1, col: nextMDIdx },
                                    carry: "",
                                    context: lang === 'es' ? `Siguiente Fila: Multiplicando por ${nextMDigit}` : `Next Row: Multiplying by ${nextMDigit}`
                                },
                                detailedExplanation: { es: "Siguiente fila directa", en: "Next row direct" }
                            }]
                        };
                    } else {
                        // ALL ROWS DONE -> NOW ASK FOR SUM

                        // If there is only 1 row (single digit multiplier), we are done instantly.
                        if (currentResults.length === 1) {
                            return {
                                steps: [{
                                    text: lang === 'es'
                                        ? `¡INCREÍBLE! 🏆 Has completado toda la operación.\n\n**${n1} × ${n2} = ${result}**\n\n¿Quieres intentar otra misión?`
                                        : `INCREDIBLE! 🏆 Operation complete.\n\n**${n1} × ${n2} = ${result}**\n\nWant to try another mission?`,
                                    speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} El resultado es ${formatForSpeech(result, lang)}.` : `${getCorrectFeedback(lang, studentName)} The result is ${formatForSpeech(result, lang)}.`,
                                    visualType: "vertical_op",
                                    visualData: { operand1: n1Str, operand2: n2Str, operator: "×", result: [...nextResults], highlight: "done" },
                                    detailedExplanation: { es: "Multiplicación finalizada", en: "Multiplication finished" }
                                }]
                            };
                        }

                        // MULTI-ROW -> ADDITION PHASE
                        return {
                            steps: [{
                                text: lang === 'es'
                                    ? `¡Muy bien! Ya tenemos los productos parciales. 🧱\n\nAhora la parte final: **SÚMALOS TODOS**.\n\n¿Cuál es el resultado final?`
                                    : `Great! We have the partial products. 🧱\n\nNow the final part: **ADD THEM ALL UP**.\n\nWhat is the final result?`,
                                speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} Ahora suma todo. ¿Cuál es el resultado?` : `${getCorrectFeedback(lang, studentName)} Now add everything. What is the result?`,
                                visualType: "vertical_op",
                                visualData: {
                                    operand1: n1Str, operand2: n2Str, operator: "×",
                                    result: nextResults, // Show partials
                                    highlight: "sum_check", // Enter Sum Check Mode
                                    context: lang === 'es' ? "Fase Final: Sumando Todo ➕" : "Final Phase: Adding All ➕"
                                },
                                detailedExplanation: { es: "Suma final", en: "Final addition" }
                            }]
                        };
                    }
                }
            } else {
                // Incorrect Digit Calculation
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `Mmm, revisa de nuevo. ¿Cuánto es **${mDigit} × ${tDigit}**${currentCarry > 0 ? ' más el **' + currentCarry + '** que llevamos' : ''}?`
                            : `Hmm, check again. What is **${mDigit} × ${tDigit}**${currentCarry > 0 ? ' plus the **' + currentCarry + '** we carried' : ''}?`,
                        speech: lang === 'es'
                            ? `Revisa de nuevo. ¿Cuánto es ${mDigit} por ${tDigit}${currentCarry > 0 ? ' más el ' + currentCarry + ' que llevamos' : ''}?`
                            : `Check again. What is ${mDigit} times ${tDigit}${currentCarry > 0 ? ' plus the ' + currentCarry + ' we carried' : ''}?`,
                        visualType: "vertical_op",
                        visualData: { ...lastState, highlightDigit: { row: 0, col: currentTD }, multiplierDigit: { row: 1, col: currentMD } },
                        detailedExplanation: { es: "Error de cálculo", en: "Calculation error" }
                    }]
                };
            }
        } else if (lastState && lastState.highlightDigit && lastState.multiplierDigit) {
            // Socratic persistence during digit multiplication
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Manten el ritmo! ⚡\n\nSeguimos con el **${mDigit}** de abajo multiplicando al **${tDigit}** de arriba.\n\n¿Cuánto es **${mDigit} × ${tDigit}**${currentCarry > 0 ? ' más los **' + currentCarry + '** que llevamos' : ''}?`
                        : `Keep it up! ⚡\n\nWe continue with the **${mDigit}** from below multiplying the **${tDigit}** above.\n\nWhat is **${mDigit} × ${tDigit}**${currentCarry > 0 ? ' plus the **' + currentCarry + '** we carried' : ''}?`,
                    speech: lang === 'es'
                        ? `¿Cuánto es ${mDigit} por ${tDigit}${currentCarry > 0 ? ' más los ' + currentCarry : ''}?`
                        : `What is ${mDigit} times ${tDigit}${currentCarry > 0 ? ' plus ' + currentCarry : ''}?`,
                    visualType: "vertical_op",
                    visualData: lastState,
                    detailedExplanation: { es: "Persistencia socrática multiplicación", en: "Socratic persistence multiplication" }
                }]
            };
        }

        // --- STEP 4: SOLVE IT ALL (Magic Mode) ---
        const solveKeywords = /(completa|resuelve|todo|final|respuesta|finish|solve|all|complete)/i;
        if (solveKeywords.test(cleanInput)) {
            const solveSteps: any[] = [];
            // Just jump to end
            const finalResult = String(n1 * n2);
            solveSteps.push({
                text: lang === 'es'
                    ? `¡Y listo! Al sumar todo llegamos a:\n\n**${n1} × ${n2} = ${finalResult}**\n\n¿Viste qué fácil? ✨`
                    : `And there we go! Summing it all up we reach:\n\n**${n1} × ${n2} = ${finalResult}**\n\nSee how easy it is? ✨`,
                speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} El resultado es ${finalResult}.` : `${getCorrectFeedback(lang, studentName)} The result is ${finalResult}.`,
                visualType: "vertical_op",
                visualData: {
                    operand1: n1Str, operand2: n2Str, operator: "×", result: [String(finalResult)], // Simplified display
                    highlight: "done"
                },
                detailedExplanation: { es: "Resultado final calculado", en: "Final result calculated" }
            });

            return { steps: solveSteps };
        }

        // Nunca quedarse callada durante la operación
        return {
            steps: [{
                text: lang === 'es'
                    ? `¡No te distraigas! 🚀 Estamos en medio de la multiplicación.\n\n${lastState?.context || 'Mira el tablero y sigamos con el siguiente paso.'}`
                    : `Don't get distracted! 🚀 We're in the middle of the multiplication.\n\n${lastState?.context || 'Look at the board and let\'s continue with the next step.'}`,
                speech: lang === 'es' ? '¡Oye! No te me distraigas. Sigamos con la multiplicación.' : 'Hey! Don\'t get distracted. Let\'s continue with the multiplication.',
                visualType: "vertical_op",
                visualData: lastState || { operand1: n1Str, operand2: n2Str, operator: "×" }
            }]
        };
    }
}
