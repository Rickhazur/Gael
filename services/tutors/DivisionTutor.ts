
import { StepResponse, VisualState } from './types';
import { GradeLevel } from '@/types/tutor';
import { AnswerValidator, StateHelper } from './utils';
import { getCorrectFeedback } from '../../data/feedbackPhrases';

export class DivisionTutor {
    static handleDivision(input: string, prob: any, lang: 'es' | 'en', history: any[], studentName?: string, grade: GradeLevel = 3): StepResponse | null {
        const lastState = StateHelper.getCurrentVisualState(history);

        const dividendStr = String(lastState?.dividend || prob.dividend);
        const divisorStr = String(lastState?.divisor || prob.divisor);
        const dividend = parseInt(dividendStr);
        const divisor = parseInt(divisorStr);

        // 🛡️ DIVISION BY ZERO: No podemos dividir entre cero
        if (divisor === 0 || isNaN(divisor)) {
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Uy! 😅 **No podemos dividir entre cero.**\n\nDividir entre cero no tiene sentido matemático. Imagina repartir dulces entre **0** amigos: ¡no tiene sentido!\n\nEscribe otra división, por ejemplo: 10 ÷ 2`
                        : `Oops! 😅 **We cannot divide by zero.**\n\nDividing by zero doesn't make mathematical sense. Imagine sharing candies among **0** friends: it doesn't work!\n\nTry another division, e.g.: 10 ÷ 2`,
                    speech: lang === 'es' ? '¡No podemos dividir entre cero! Prueba con otro divisor.' : "We can't divide by zero! Try another divisor.",
                    visualType: "text_only",
                    visualData: { text: `⚠️ ${lang === 'es' ? 'Divisor no puede ser 0' : 'Divisor cannot be 0'}` },
                    detailedExplanation: { es: "División entre cero indefinida", en: "Division by zero undefined" }
                }]
            };
        }

        const style: 'latin' | 'us' = prob.divisionStyle || lastState?.divisionStyle || 'us';
        const historyWork = lastState?.history || [];
        const quotient = lastState?.quotient || "";
        const col = lastState?.highlightDigit?.col ?? 0;
        const phase = lastState?.phase || 'intro';

        // =========================================================
        // 🟢 GRADE 1 & 2: BASIC FACTS & SHARING (Mental Math)
        // =========================================================
        const isBasicFact = dividend <= 100 && divisor <= 10 && dividend % divisor === 0;

        if (prob.isNew || phase === 'init') {
            // 🎓 FIRST-TIME INTRO (Greeting + Utility + Setup)
            let introEs = "";
            let introEn = "";
            let speechEs = "";
            let speechEn = "";

            if (grade <= 1) {
                introEs = `¡Hola! 🌈 Soy la **Profesora Lina**. ¡Vamos a aprender a repartir!\n\nRepartir es la base de la división. Nos ayuda a compartir dulces con amigos para que todos tengan la misma cantidad. 🍬\n\nMira la pizarra: el número grande (**${dividend}**) está adentro de la casita, y el pequeño (**${divisor}**) está afuera. ¿Los ves listos?`;
                introEn = `Hi! 🌈 I'm **Professor Lina**. Let's learn to share!\n\nSharing is the basis of division. It helps us share candies with friends so everyone has the same amount. 🍬\n\nLook at the board: the big number (**${dividend}**) is inside the house, and the small one (**${divisor}**) is outside. Ready?`;
                speechEs = `¡Hola, corazón! Soy la profe Lina. Hoy vamos a jugar a repartir cosas ricas. Repartir es dividir. Mira la pizarra: el número grande va adentro de la casita y el pequeño afuera. ¿Ya los viste?`;
                speechEn = `Hi, sweetie! I'm Professor Lina. Today we're going to play at sharing yummy things. Sharing is dividing. Look at the board: the big number goes inside the house and the small one outside. Do you see them?`;
            } else {
                introEs = `¡Hola! 👋 Soy la **Profesora Lina**. ¡Lista para la Misión División!\n\nDividir es un súper poder que usamos para organizar grupos, repartir premios y calcular tiempos ⏳.\n\nPara empezar, recuerda: **el número más grande (${dividend}) va adentro de la casita, y el más pequeño (${divisor}) va afuera.** ¿Están bien colocaditos?`;
                introEn = `Hi! 👋 I'm **Professor Lina**. Ready for the Division Mission!\n\nDivision is a superpower we use to organize groups, share prizes, and calculate times ⏳.\n\nTo start, remember: **the larger number (${dividend}) goes inside the house, and the smaller one (${divisor}) goes outside.** Are they in their places?`;
                speechEs = `¡Hola! Soy la profe Lina. ¡Qué alegría! Vamos a aprender a dividir. Es súper útil para cuando tienes que repartir algo entre tus amigos. Mira la pizarra: el secreto es poner el grande adentro y el pequeño afuera. ¿Lo ves?`;
                speechEn = `Hi! I'm Professor Lina. So glad to see you! Let's learn to divide. It's super useful for when you have to share something with friends. Look at the board: the secret is to put the big one inside and the small one outside. Do you see it?`;
            }

            return {
                steps: [{
                    text: introEs,
                    speech: lang === 'es' ? speechEs : speechEn,
                    visualType: "division",
                    visualData: {
                        dividend: dividendStr, divisor: divisorStr, quotient: "", divisionStyle: style,
                        highlight: "all",
                        phase: 'intro', // Next step will be the standard intro or solving
                        context: lang === 'es' ? "Alistando la división" : "Setting up division",
                        isNew: true
                    },
                    detailedExplanation: { es: "Introducción y Colocación", en: "Intro and Placement" }
                }]
            };
        }

        if (phase === 'intro') {
            if (isBasicFact) {
                // If it's a basic fact, we transition to basic_fact_solve
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Muy bien! Ahora, ¿cuántas veces cabe el **${divisor}** en el **${dividend}**? Piénsalo como el juego de las tablas. 🎲`
                            : `Very good! Now, how many times does **${divisor}** fit in **${dividend}**? Think of it as the multiplication table game. 🎲`,
                        speech: lang === 'es' ? `¡Eso es! ¿Cuántas veces cabe el ${divisor} en el ${dividend}?` : `That's it! How many times does ${divisor} fit in ${dividend}?`,
                        visualType: "division",
                        visualData: {
                            dividend: dividendStr, divisor: divisorStr, quotient: "", divisionStyle: style,
                            highlight: "all",
                            phase: 'basic_fact_solve',
                            context: lang === 'es' ? "Reparto equitativo" : "Fair sharing"
                        },
                        detailedExplanation: { es: "División básica", en: "Basic division" }
                    }]
                };
            }

            // Standard Introduction for Larger Numbers
            let take = 1;
            while (parseInt(dividendStr.substring(0, take)) < divisor && take < dividendStr.length) {
                take++;
            }
            const part = dividendStr.substring(0, take);
            const colIdx = take - 1;
            const isGrandisimo = dividendStr.length > 4;
            const sizeWordEs = isGrandisimo ? 'grandísimo' : 'grande';
            const sizeWordEn = isGrandisimo ? 'huge' : 'large';

            let breakdownEs = "";
            let breakdownEn = "";
            let breakdownSpeechEs = "";
            let breakdownSpeechEn = "";

            if (take === 1) {
                breakdownEs = `¡Misión de División Larga! 🚀\n\nComo el ${dividend} es un número ${sizeWordEs}, lo dividiremos por partes.\n\nPrimero miramos el **${part}**. Piensa: ¿Cuántas veces cabe el **${divisor}** en el **${part}**?`;
                breakdownEn = `Long Division Mission! 🚀\n\nSince ${dividend} is a ${sizeWordEn} number, we'll do it step by step.\n\nWe take **${part}**. How many times does **${divisor}** fit in **${part}** without going over?`;
                breakdownSpeechEs = `¡Misión División Activada! 🚀 El número ${dividend} es ${sizeWordEs}, ¡pero no te asustes que lo haremos por partes! Tomemos el ${part}. ¿Cuántas veces nos cabe el ${divisor} ahí adentro? Miremos bien...`;
                breakdownSpeechEn = `Long Division Mission! 🚀 The number ${dividend} is ${sizeWordEn}, but don't worry, we'll do it bit by bit, champ! Let's take ${part}. How many times does ${divisor} fit in there? Let's see...`;
            } else {
                // Explain skip logic
                const skipped = dividendStr.substring(0, take - 1);
                breakdownEs = `¡Misión de División Larga! 🚀\n\nComo el ${divisor} es más grande que el **${skipped}**, necesitamos tomar una cifra más. ¡Vamos con el **${part}**!\n\nPiensa: ¿Cuántas veces cabe el **${divisor}** en el **${part}**?`;
                breakdownEn = `Long Division Mission! 🚀\n\nSince ${divisor} is larger than **${skipped}**, we need to take one more digit. Let's go with **${part}**!\n\nThink: How many times does **${divisor}** fit in **${part}**?`;
                breakdownSpeechEs = `¡Vamos con el primer paso! Como el ${divisor} no cabe en el ${skipped}, vamos a tomar tres cifras: el ${part}. ¿Ya lo viste? Ahora, ¿cuántas veces nos cabe el ${divisor} en el ${part}?`;
                breakdownSpeechEn = `Let's start the first step! Since ${divisor} doesn't fit in ${skipped}, we'll take three digits: ${part}. See it? Now, how many times does ${divisor} fit in ${part}?`;
            }

            return {
                steps: [{
                    text: lang === 'es' ? breakdownEs : breakdownEn,
                    speech: lang === 'es' ? breakdownSpeechEs : breakdownSpeechEn,
                    visualType: "division",
                    visualData: {
                        dividend: dividendStr, divisor: divisorStr, quotient: "", divisionStyle: style,
                        highlightDigit: { row: 0, col: colIdx },
                        phase: 'find_quotient',
                        context: lang === 'es' ? `Dividiendo ${part}` : `Dividing ${part}`
                    },
                    detailedExplanation: { es: "Inicio algoritmo división", en: "Start division algorithm" }
                }]
            };
        }

        // --- HANDLE BASIC FACT ANSWER ---
        if (phase === 'basic_fact_solve') {
            const expected = dividend / divisor;
            const validation = AnswerValidator.validate(input, expected);
            if (validation.isCorrect) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Exacto! 🎉 **${divisor} × ${expected} = ${dividend}**.\n\nEntonces, **${dividend} ÷ ${divisor} = ${expected}**.\n\nHas repartido todo perfectamente.`
                            : `Exactly! 🎉 **${divisor} × ${expected} = ${dividend}**.\n\nSo, **${dividend} ÷ ${divisor} = ${expected}**.\n\nYou shared everything perfectly.`,
                        speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} El resultado es ${expected}.` : `${getCorrectFeedback(lang, studentName)} The result is ${expected}.`,
                        visualType: "division",
                        visualData: {
                            dividend: dividendStr, divisor: divisorStr, quotient: String(expected), divisionStyle: style,
                            highlight: "done",
                            history: [{ product: String(dividend), remainder: "0", columnIndex: dividendStr.length - 1 }]
                        },
                        detailedExplanation: { es: "División exacta completada", en: "Exact division done" }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es' ? `Casi... busca en la tabla del **${divisor}**. ¿${divisor} por cuánto da **${dividend}**?` : `Close... look at the **${divisor}** table. ${divisor} times what equals **${dividend}**?`,
                        speech: lang === 'es' ? `Revisa la tabla del ${divisor}.` : `Check the ${divisor} table.`,
                        visualType: "division",
                        visualData: { ...(lastState || {}), divisionStyle: (lastState?.divisionStyle ?? style), isNew: false },
                        detailedExplanation: { es: "Error tabla multiplicar", en: "Times table error" }
                    }]
                };
            }
        }

        // =========================================================
        // 🟢 GRADE 3, 4, 5: ALGORITHM (Integer & Decimal)
        // =========================================================

        return this.processAlgorithmSteps(input, dividendStr, divisorStr, style, historyWork, quotient, col, phase, lastState?.tempVal, lang, lastState, history, studentName);
    }

    private static processAlgorithmSteps(
        input: string,
        divStr: string,
        dvrStr: string,
        style: 'latin' | 'us',
        historyWork: any[],
        quotient: string,
        col: number,
        phase: string,
        tempVal: any,
        lang: 'es' | 'en',
        lastState: any,
        fullHistory: any[],
        studentName?: string
    ): StepResponse | null {
        const divisor = parseInt(dvrStr);
        let currentValStr = "";

        // Calculate current value to divide based on history
        if (historyWork.length === 0) {
            currentValStr = divStr.substring(0, col + 1);
        } else {
            const lastRem = historyWork[historyWork.length - 1].remainder;
            // CHECK DECIMAL MODE
            if (col >= divStr.length) {
                // We are in decimal territory ("virtual zeros")
                currentValStr = lastRem + "0";
            } else {
                currentValStr = lastRem + divStr[col];
            }
        }
        const currentVal = parseInt(currentValStr);

        // --- PHASE: FIND QUOTIENT ---
        if (phase === 'find_quotient') {
            const expectedDigit = Math.floor(currentVal / divisor);
            const validation = AnswerValidator.validate(input, expectedDigit);

            if (validation.isNumericInput) {
                if (validation.isCorrect) {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `¡Excelente! Cabe **${expectedDigit}** veces. ✨\n\nAhora multiplicamos: **${expectedDigit} × ${divisor}**.`
                                : `Excellent! It fits **${expectedDigit}** times. ✨\n\nNow we multiply: **${expectedDigit} × ${divisor}**.`,
                            speech: lang === 'es'
                                ? `¡Eso! ¡Fantástico! Cabe ${expectedDigit} veces perfectamente. Ahora multipliquemos ese ${expectedDigit} por el ${divisor} para ver qué tanto nos da.`
                                : `That's it, champ! Fantastic! It fits ${expectedDigit} times perfectly. Now let's multiply that ${expectedDigit} by ${divisor} to see what we get.`,
                            visualType: "division",
                            visualData: {
                                ...lastState,
                                quotient: quotient + String(expectedDigit),
                                phase: 'multiply',
                                tempVal: { digit: expectedDigit },
                                highlightDigit: { row: 0, col },
                                isNew: false
                            },
                            detailedExplanation: { es: "Cálculo cociente", en: "Quotient found" }
                        }]
                    };
                } else {
                    const wrongVal = parseInt(input);
                    let feedback = lang === 'es'
                        ? `Mmm... no es exacto. ¿Cuántas veces cabe el **${divisor}** en **${currentVal}**?`
                        : `Hmm... not quite. How many times does **${divisor}** fit in **${currentVal}**?`;

                    if (!isNaN(wrongVal)) {
                        if (wrongVal > expectedDigit) {
                            feedback = lang === 'es'
                                ? `¡Uy, te pasaste un poquito! 😅 **${divisor} × ${wrongVal} = ${divisor * wrongVal}**, y eso ya es más grande que el **${currentVal}**. ¡Hágale pues con uno más chiquito!`
                                : `Too high! 😅 **${divisor} × ${wrongVal} = ${divisor * wrongVal}**, which is bigger than **${currentVal}**. Try a smaller number, champ!`;
                        } else {
                            feedback = lang === 'es'
                                ? `¡Casi! Pero cabe más veces. **${divisor} × ${wrongVal} = ${divisor * wrongVal}**. Aún nos sobra mucho. ¡Prueba uno mayor!`
                                : `Almost! But it fits more times. **${divisor} × ${wrongVal} = ${divisor * wrongVal}**. We still have too much left. Try bigger!`;
                        }
                    }

                    const hint = lang === 'es'
                        ? `\n\nPista Maestra: Prueba multiplicando **${divisor}** por números cercanos. ¿Qué tal **${divisor} × ${expectedDigit}**?`
                        : `\n\nMaster Hint: Try multiplying **${divisor}** by nearby numbers. How about **${divisor} × ${expectedDigit}**?`;

                    const boardHint = lang === 'es'
                        ? `Multiplica ${divisor} por un número de veces; asegúrate de que no se pase de ${currentVal}.`
                        : `Multiply ${divisor} by a number of times; make sure it doesn't exceed ${currentVal}.`;

                    return {
                        steps: [{
                            text: feedback + hint,
                            speech: lang === 'es' ? `¡Ah carachas! Piénsalo bien. ${feedback.split('.')[0]}.` : `Oops! Think about it, champ. ${feedback.split('.')[0]}.`,
                            visualType: "division",
                            visualData: { ...lastState, context: boardHint, divisionStyle: lastState?.divisionStyle ?? style, isNew: false },
                            detailedExplanation: { es: "Error estimación cociente", en: "Quotient estimation error" }
                        }]
                    };
                }
            } else {
                const boardHint = lang === 'es'
                    ? `Multiplica ${divisor} por un número de veces; asegúrate de que no se pase de ${currentVal}.`
                    : `Multiply ${divisor} by a number of times; make sure it doesn't exceed ${currentVal}.`;

                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Sigamos concentrados! 🚀\n\nEstamos dividiendo **${currentVal}** entre **${divisor}**. Mira la tabla del **${divisor}**.\n\n¿Cuántas veces cabe el **${divisor}** en el **${currentVal}**?`
                            : `Let's stay focused! 🚀\n\nWe are dividing **${currentVal}** by **${divisor}**. Look at the **${divisor}** table.\n\nHow many times does **${divisor}** fit in **${currentVal}**?`,
                        speech: lang === 'es' ? `¿Cuántas veces cabe el ${divisor} en el ${currentVal}?` : `How many times does ${divisor} fit in ${currentVal}?`,
                        visualType: "division",
                        visualData: { ...lastState, context: boardHint, divisionStyle: lastState?.divisionStyle ?? style, isNew: false },
                        detailedExplanation: { es: "Persistencia socrática - cociente", en: "Socratic persistence - quotient" }
                    }]
                };
            }
        }

        // --- PHASE: MULTIPLY ---
        if (phase === 'multiply') {
            const digit = tempVal.digit;
            const expectedProd = digit * divisor;
            const validation = AnswerValidator.validate(input, expectedProd);

            if (validation.isNumericInput) {
                if (validation.isCorrect) {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `¡Eso! **${digit} × ${divisor} = ${expectedProd}**.\n\nAhora restamos: **${currentVal} − ${expectedProd}**.`
                                : `Right! **${digit} × ${divisor} = ${expectedProd}**.\n\nNow subtract: **${currentVal} − ${expectedProd}**.`,
                            speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} Ahora vamos a restar para ver cuánto nos sobra, ¿te parece?` : `${getCorrectFeedback(lang, studentName)} Now let's subtract to see how much is left!`,
                            visualType: "division",
                            visualData: {
                                ...lastState,
                                phase: 'subtract',
                                tempVal: { digit, product: expectedProd },
                                product: String(expectedProd),
                                helpers: [{ colIndex: 0, value: `-${expectedProd}` }],
                                context: lang === 'es' ? 'Restar' : 'Subtract',
                                isNew: false
                            },
                            detailedExplanation: { es: "Multiplicación correcta", en: "Correct mult" }
                        }]
                    };
                } else {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `Mmm, casi. Revisa la multiplicación: ¿Cuánto es **${digit} × ${divisor}**?`
                                : `Hmm, close. Check the multiplication: What is **${digit} × ${divisor}**?`,
                            speech: lang === 'es' ? `¿Cuánto es ${digit} por ${divisor}?` : `What is ${digit} times ${divisor}?`,
                            visualType: "division",
                            visualData: { ...lastState, divisionStyle: lastState?.divisionStyle ?? style, isNew: false },
                            detailedExplanation: { es: "Error en multiplicación", en: "Mult error" }
                        }]
                    };
                }
            } else {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡No te detengas! 💪\n\nPara el siguiente paso necesitamos multiplicar el **${digit}** del cociente por el divisor **${divisor}**.\n\n¿Cuánto es **${digit} × ${divisor}**?`
                            : `Don't stop now! 💪\n\nFor the next step we need to multiply the quotient's **${digit}** by the divisor **${divisor}**.\n\nHow much is **${digit} × ${divisor}**?`,
                        speech: lang === 'es' ? `¿Cuánto es ${digit} por ${divisor}?` : `What is ${digit} times ${divisor}?`,
                        visualType: "division",
                        visualData: { ...lastState, divisionStyle: lastState?.divisionStyle ?? style, isNew: false },
                        detailedExplanation: { es: "Persistencia socrática - multiplicación", en: "Socratic persistence - multiplication" }
                    }]
                };
            }
        }

        // --- PHASE: SUBTRACT ---
        if (phase === 'subtract') {
            const { digit, product } = tempVal;
            const expectedRem = currentVal - product;
            const validation = AnswerValidator.validate(input, expectedRem);

            if (validation.isNumericInput) {
                if (validation.isCorrect) {
                    const nextCol = col + 1;
                    const isEndOfInt = nextCol >= divStr.length;

                    if (isEndOfInt) {
                        if (expectedRem === 0) {
                            return {
                                steps: [{
                                    text: lang === 'es'
                                        ? `¡TERMINAMOS! 🎉\n\nEl residuo es **0**, así que es una división exacta.\n\nEl resultado final de **${divStr} ÷ ${dvrStr}** es **${quotient}**.\n\n¡Eres un maestro de la división! 🏆`
                                        : `FINISHED! 🎉\n\nThe remainder is **0**, so it's exact.\n\nThe final result for **${divStr} ÷ ${dvrStr}** is **${quotient}**.\n\nYou're a division master! 🏆`,
                                    speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} El resultado es ${quotient}. ¡Lo hiciste de maravilla!` : `${getCorrectFeedback(lang, studentName)} The result is ${quotient}. You did a marvelous job!`,
                                    visualType: "division",
                                    visualData: {
                                        ...lastState,
                                        history: [...historyWork, { product: String(product), remainder: "0", columnIndex: col }],
                                        highlight: "done",
                                        isNew: false
                                    },
                                    detailedExplanation: { es: "Fin exacto", en: "Exact finish" }
                                }]
                            };
                        } else {
                            const hasDecimal = quotient.includes('.');
                            if (hasDecimal) {
                                return {
                                    steps: [{
                                        text: lang === 'es'
                                            ? `Sobran **${expectedRem}**. ¡Sigamos con los decimales! Agregamos un cero imaginario abajo y continuamos dividiendo. 👇\n\n¿Cuántas veces cabe el **${divisor}** en **${expectedRem}0**?`
                                            : `Remainder is **${expectedRem}**. Let's keep going with decimals! Add a phantom zero below and continue dividing. 👇\n\nHow many times does **${divisor}** fit in **${expectedRem}0**?`,
                                        speech: lang === 'es' ? `¡Mira! Nos sobran ${expectedRem}. Pero no nos vamos a detener, ¡agregamos un cero imaginario y seguimos con toda!` : `Look! We have ${expectedRem} left. But we won't stop, let's add a phantom zero and keep going!`,
                                        visualType: "division",
                                        visualData: {
                                            ...lastState,
                                            history: [...historyWork, { product: String(product), remainder: String(expectedRem), columnIndex: col }],
                                            phase: 'find_quotient',
                                            highlightDigit: { row: 0, col: nextCol },
                                            product: undefined, // CLEANUP
                                            remainder: undefined, // CLEANUP
                                            tempVal: undefined, // CLEANUP
                                            isNew: false
                                        },
                                        detailedExplanation: { es: "Continuando decimales", en: "Continuing decimals" }
                                    }]
                                };
                            } else {
                                return {
                                    steps: [{
                                        text: lang === 'es'
                                            ? `¡Llegamos al final de las cifras enteras!\n\n**Aquí termina la división** si quieres: el residuo es **${expectedRem}**.\n\nPuedes **terminar aquí** (escribe **"fin"**) y el resultado será cociente **${quotient}** con residuo **${expectedRem}**, o **sacar decimales** (escribe **"punto"**) para seguir.`
                                            : `Reached the end of integer digits!\n\n**The division ends here** if you want: the remainder is **${expectedRem}**.\n\nYou can **finish here** (type **"end"**) and the result will be quotient **${quotient}** with remainder **${expectedRem}**, or **get decimals** (type **"point"**) to continue.`,
                                        speech: lang === 'es' ? `Aquí puede terminar la división. El residuo es ${expectedRem}. ¿Terminamos o sacamos decimales?` : `The division can end here. The remainder is ${expectedRem}. Finish or get decimals?`,
                                        visualType: "division",
                                        visualData: {
                                            ...lastState,
                                            history: [...historyWork, { product: String(product), remainder: String(expectedRem), columnIndex: col }],
                                            phase: 'decide_decimal',
                                            context: lang === 'es' ? `Terminar (residuo ${expectedRem}) o decimales` : `End (remainder ${expectedRem}) or decimals`,
                                            product: undefined, // CLEANUP
                                            remainder: undefined, // CLEANUP
                                            tempVal: undefined, // CLEANUP
                                            isNew: false
                                        },
                                        detailedExplanation: { es: "Decisión decimal", en: "Decimal decision" }
                                    }]
                                };
                            }
                        }
                    } else {
                        // Bring down: history already has (product, remainder). Do NOT pass product/remainder
                        // so the whiteboard doesn't draw 119 again as "current" row.
                        const newHistory = [...historyWork, { product: String(product), remainder: String(expectedRem), columnIndex: col }];
                        return {
                            steps: [{
                                text: lang === 'es'
                                    ? `¡Bien restado! 🎉 Quedan **${expectedRem}**. Ahora bajamos el siguiente número: el **${divStr[nextCol]}**.\n\n👇 **PREGUNTA CLAVE**: 👇\n\n¿Cuántas veces cabe el **${divisor}** en el nuevo número **${expectedRem}${divStr[nextCol]}**?`
                                    : `Good subtraction! 🎉 Left with **${expectedRem}**. Now we bring down the next number: **${divStr[nextCol]}**.\n\n👇 **KEY QUESTION**: 👇\n\nHow many times does **${divisor}** fit in the new number **${expectedRem}${divStr[nextCol]}**?`,
                                speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} Ahora bajamos el siguiente numerito para seguir la fiesta.` : `${getCorrectFeedback(lang, studentName)} Now we bring down the next number to keep the party going!`,
                                visualType: "division",
                                visualData: {
                                    ...lastState,
                                    history: newHistory,
                                    phase: 'find_quotient',
                                    highlightDigit: { row: 0, col: nextCol },
                                    product: undefined,
                                    remainder: undefined,
                                    tempVal: undefined,
                                    isNew: false
                                },
                                detailedExplanation: { es: "Bajando cifra", en: "Bring down" }
                            }]
                        };
                    }
                } else {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `¡Casi! Revisa la resta. **${currentVal} − ${product}** = ¿cuánto?`
                                : `Close! Check the subtraction. **${currentVal} − ${product}** = how much?`,
                            speech: lang === 'es' ? `Revisa la resta.` : `Check the subtraction.`,
                            visualType: "division",
                            visualData: { ...lastState, divisionStyle: lastState?.divisionStyle ?? style, isNew: false },
                            detailedExplanation: { es: "Error en resta", en: "Sub error" }
                        }]
                    };
                }
            } else {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Vamos, tú puedes! 💪\n\nEstamos restando lo que ya dividimos: **${currentVal} − ${product}**.\n\n¿Cuál es el resultado?`
                            : `Come on, you can do it! 💪\n\nWe are subtracting what we already divided: **${currentVal} − ${product}**.\n\nWhat is the result?`,
                        speech: lang === 'es' ? `¿Cuánto es ${currentVal} menos ${product}?` : `What is ${currentVal} minus ${product}?`,
                        visualType: "division",
                        visualData: { ...lastState, divisionStyle: lastState?.divisionStyle ?? style, isNew: false },
                        detailedExplanation: { es: "Persistencia socrática - resta", en: "Socratic persistence - subtraction" }
                    }]
                };
            }
        }

        // --- PHASE: DECIDE DECIMAL ---
        if (phase === 'decide_decimal') {
            if (input.toLowerCase().includes('punto') || input.toLowerCase().includes('point') || input.includes('.')) {
                const lastRem = historyWork[historyWork.length - 1]?.remainder ?? "0";
                const remainderWithZero = lastRem + "0";

                const explanationEs = `¡Muy bien! Vamos a **sacar decimales**. Para eso hacemos dos cosas muy importantes:\n\n**1️⃣ ¿Por qué ponemos la coma en el resultado?** Porque ya terminamos la **parte entera** del cociente. Lo que nos sobra (el residuo **${lastRem}**) ya no son unidades enteras; a partir de ahora vamos a dividir ese sobrante en partes más pequeñas (décimas, centésimas…). Por eso ponemos la **coma decimal** en el cociente: todo lo que salga de aquí en adelante irá **después de la coma**.\n\n**2️⃣ ¿Por qué añadimos UN cero al residuo?** El residuo **${lastRem}** significa “${lastRem} unidades”. Para seguir dividiendo, tratamos esas unidades como **décimas**: añadimos **un solo cero** y formamos **${remainderWithZero}**. Así podemos preguntar: “¿Cuántas veces cabe el **${divisor}** en **${remainderWithZero}**?” y obtener la **primera cifra decimal**.\n\nEn la pizarra verás el cociente con la coma (**${quotient}.**) y el residuo con el cero (**${remainderWithZero}**). ¿Cuántas veces cabe el **${divisor}** en **${remainderWithZero}**?`;

                const explanationEn = `Great! We're going to **get decimals**. To do that we do two important things:\n\n**1️⃣ Why do we put the decimal point in the result?** Because we've finished the **whole number part** of the quotient. What's left (the remainder **${lastRem}**) is no longer whole units; from now on we're dividing that leftover into smaller parts (tenths, hundredths…). So we put the **decimal point** in the quotient: everything we get from now on will go **after the decimal point**.\n\n**2️⃣ Why do we add ONE zero to the remainder?** The remainder **${lastRem}** means "${lastRem} units". To keep dividing, we treat those units as **tenths**: we add **one zero** and get **${remainderWithZero}**. Then we ask: "How many times does **${divisor}** fit in **${remainderWithZero}**?" and we get the **first decimal digit**.\n\nOn the board you'll see the quotient with the point (**${quotient}.**) and the remainder with the zero (**${remainderWithZero}**). How many times does **${divisor}** fit in **${remainderWithZero}**?`;

                return {
                    steps: [{
                        text: lang === 'es' ? explanationEs : explanationEn,
                        speech: lang === 'es'
                            ? `Perfecto. Ponemos la coma en el resultado porque ya terminamos la parte entera, y añadimos un solo cero al residuo para seguir con los decimales. ¿Cuántas veces cabe el ${divisor} en ${remainderWithZero}?`
                            : `We put the decimal point because we finished the whole part, and we add one zero to the remainder to continue. How many times does ${divisor} fit in ${remainderWithZero}?`,
                        visualType: "division",
                        visualData: {
                            ...lastState,
                            quotient: quotient + ".",
                            phase: 'find_quotient',
                            divisionStyle: style,
                            highlightDigit: { row: 0, col: divStr.length },
                            decimalPhase: true,
                            remainderWithZero: remainderWithZero,
                            isNew: false
                        },
                        detailedExplanation: { es: "Inicio decimales", en: "Start decimals" }
                    }]
                };
            } else if (input.toLowerCase().includes('fin') || input.toLowerCase().includes('end') || input.toLowerCase().includes('terminar')) {
                const finalRem = historyWork[historyWork.length - 1]?.remainder || "0";
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Listo! **La división termina aquí.**\n\nResultado: cociente **${quotient}**, residuo **${finalRem}**.\n\n¡Excelente trabajo! 🚀`
                            : `Done! **The division ends here.**\n\nResult: quotient **${quotient}**, remainder **${finalRem}**.\n\nExcellent work! 🚀`,
                        visualType: "division",
                        visualData: { ...lastState, highlight: "done", divisionStyle: lastState?.divisionStyle ?? style, isNew: false },
                        speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} Terminamos por hoy, ¡lo hiciste increíble!` : `${getCorrectFeedback(lang, studentName)} We're done for today, you did amazing!`,
                        detailedExplanation: { es: "Fin con residuo", en: "End with remainder" }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¿Qué prefieres hacer? ✨\n\nEscribe **"punto"** para seguir dividiendo con decimales o **"fin"** para terminar aquí con el residuo.`
                            : `What would you like to do? ✨\n\nType **"point"** to continue dividing with decimals or **"end"** to finish here with the remainder.`,
                        speech: lang === 'es' ? `Piénsalo bien: ¿Punto para seguir o fin para terminar?` : `Think about it, champ: Point to continue or end to finish?`,
                        visualType: "division",
                        visualData: { ...lastState, divisionStyle: lastState?.divisionStyle ?? style, isNew: false },
                        detailedExplanation: { es: "Decisión decimal persistente", en: "Persistent decimal decision" }
                    }]
                };
            }
        }

        return null;
    }
}

function digitFromTempVal(state: any): string {
    return state?.tempVal?.digit !== undefined ? String(state.tempVal.digit) : "";
}
