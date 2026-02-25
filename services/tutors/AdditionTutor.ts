
import { StepResponse, HintLevel, ErrorType } from './types';
import { GradeLevel } from '@/types/tutor';
import { ErrorDetector, HintGenerator, AnswerValidator, StateHelper } from './utils';
import { getCorrectFeedback } from '../../data/feedbackPhrases';

export class AdditionTutor {
    // Track hint levels per session (static for simplicity, could be more sophisticated)
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

    private static buildAdditionColumns(s1: string, s2: string) {
        // Ensure same length
        const len = Math.max(s1.length, s2.length);
        s1 = s1.padStart(len, '0');
        s2 = s2.padStart(len, '0');

        const cols: any[] = [];
        let carry = 0;
        for (let i = len - 1; i >= 0; i--) {
            if (s1[i] === '.') {
                cols.push({ isDot: true, char: '.', d1: '.', d2: '.', idx: i });
                continue;
            }
            const d1 = parseInt(s1[i]), d2 = parseInt(s2[i]);
            const sum = d1 + d2 + carry;
            cols.push({
                isDot: false,
                d1, d2, carryIn: carry,
                sumFull: sum,
                digitOut: sum % 10,
                carryOut: Math.floor(sum / 10),
                idx: i
            });
            carry = Math.floor(sum / 10);
        }
        return cols;
    }

    static handleAddition(input: string, prob: any, lang: 'es' | 'en', history: any[], studentName?: string, grade: GradeLevel = 3): StepResponse | null {
        let s1 = prob.n1, s2 = prob.n2;
        const isDecimal = s1.includes('.') || s2.includes('.');

        // Decimal Alignment
        if (isDecimal) {
            if (!s1.includes('.')) s1 += '.0';
            if (!s2.includes('.')) s2 += '.0';
            const d1 = s1.split('.'), d2 = s2.split('.');
            const maxDec = Math.max(d1[1].length, d2[1].length);
            s1 = d1[0] + '.' + d1[1].padEnd(maxDec, '0');
            s2 = d2[0] + '.' + d2[1].padEnd(maxDec, '0');
        }

        // Build columns
        const cols = this.buildAdditionColumns(s1, s2);
        const colNames = ['unidades', 'decenas', 'centenas', 'unidades de mil', 'decenas de mil', 'centenas de mil'];
        const colNamesEn = ['units', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];

        // Detect phases from history
        const lastState = StateHelper.getCurrentVisualState(history);
        const currentPhase = lastState?.phase || (prob.isNew ? 'init' : 'solving');

        // =========================================================
        // 🟢 PHASE: INIT (Greeting + Utility + Alignment)
        // =========================================================
        if (currentPhase === 'init') {
            const firstDigitCol = cols.find(c => !c.isDot);
            let introEs = "";
            let introEn = "";
            let speechEs = "";
            let speechEn = "";

            if (grade <= 1) {
                introEs = `¡Hola! 🌟 Soy la **Profesora Lina**. ¡Vamos a sumar juntos!\n\n¿Sabes por qué es útil sumar? 🍎 Porque nos ayuda a contar nuestras frutas, juguetes y ¡hasta estrellas!\n\nMira la pizarra: puse los números uno debajo del otro para que sea más fácil. ¿Ves cómo están bien sentaditos?`;
                introEn = `Hi! 🌟 I'm **Professor Lina**. Let's add together!\n\nDo you know why adding is useful? 🍎 It helps us count our fruits, toys, and even stars!\n\nLook at the board: I put the numbers one under the other to make it easy. Do they look ready?`;
                speechEs = `¡Hola, corazón! Soy la profe Lina. Hoy vamos a sumar. Sumar es súper útil para contar todas las cosas que nos gustan. Mira cómo acomodé los números en la pizarra. ¿Están bien alineados?`;
                speechEn = `Hi, sweetie! I'm Professor Lina. Today we're going to add. Adding is super useful for counting everything we love. Look how I placed the numbers on the board. Are they well aligned?`;
            } else {
                introEs = `¡Hola! 👋 Soy la **Profesora Lina**. ¡Lista para esta misión de suma!\n\nSaber sumar es como tener un súper poder ⚡. Nos ayuda en el mercado, con nuestro dinero y en los videojuegos.\n\nPrimero, los escribí bien alineados: **unidades con unidades** y **decenas con decenas**. ¿Los ves listos en el tablero?`;
                introEn = `Hi! 👋 I'm **Professor Lina**. Ready for this addition mission!\n\nKnowing how to add is like having a superpower ⚡. It helps at the store, with money, and in video games.\n\nFirst, I wrote them well aligned: **units with units** and **tens with tens**. Do they look ready on the board?`;
                speechEs = `¡Hola! Soy la profe Lina. ¡Qué alegría saludarte! Sumar es un súper poder que te servirá para toda la vida. Mira la pizarra: puse los números uno debajo del otro, unidades con unidades. ¿Ya los viste?`;
                speechEn = `Hi! I'm Professor Lina. So happy to see you! Adding is a superpower that will serve you for life. Look at the board: I put the numbers one under the other, units with units. Do you see them?`;
            }

            return {
                steps: [{
                    text: lang === 'es' ? introEs : introEn,
                    speech: lang === 'es' ? speechEs : speechEn,
                    visualType: "vertical_op",
                    visualData: {
                        operand1: s1, operand2: s2, operator: "+", result: "", carry: "",
                        phase: 'direction_check'
                    },
                    detailedExplanation: { es: "Introducción y Alineación", en: "Intro and Alignment" }
                }]
            } as any;
        }

        // =========================================================
        // 🟢 PHASE: DIRECTION CHECK (Where do we start?)
        // =========================================================
        if (currentPhase === 'direction_check') {
            const cleanInput = input.toLowerCase();
            const startsRight = cleanInput.includes('derecha') || cleanInput.includes('right') || cleanInput.includes('final') || cleanInput.includes('unidades') || cleanInput.includes('units');

            if (startsRight) {
                const firstDigitCol = cols.find(c => !c.isDot);
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Exacto! 🎯 Siempre empezamos por la **derecha**, por las **unidades**.\n\nAhora sí, ¿cuánto es **${firstDigitCol?.d1} + ${firstDigitCol?.d2}**?`
                            : `Exactly! 🎯 We always start on the **right**, with the **units**.\n\nNow, how much is **${firstDigitCol?.d1} + ${firstDigitCol?.d2}**?`,
                        speech: lang === 'es'
                            ? `¡Eso es! Muy bien. Siempre empezamos por la derecha, por las unidades. Entonces, ¿cuánto es ${firstDigitCol?.d1} más ${firstDigitCol?.d2}?`
                            : `That's it! Very good. We always start on the right, with the units. So, how much is ${firstDigitCol?.d1} plus ${firstDigitCol?.d2}?`,
                        visualType: "vertical_op",
                        visualData: {
                            operand1: s1, operand2: s2, operator: "+", result: "", carry: "",
                            highlightDigit: { row: 0, col: 0 },
                            phase: 'solving'
                        },
                        detailedExplanation: { es: "Inicio de cálculos", en: "Starting calculations" }
                    }]
                } as any;
            } else {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Miremos con cuidado! 👀 Para que la suma salga perfecta, ¿empezamos por la **izquierda** o por la **derecha** (las unidades)?`
                            : `Let's look carefully! 👀 To make the addition perfect, do we start from the **left** or from the **right** (the units)?`,
                        speech: lang === 'es'
                            ? `¡Pensemos un poquito! Para no equivocarnos, ¿por dónde empezamos? ¿Por la izquierda o por la derecha?`
                            : `Let's think for a bit! To avoid mistakes, where do we start? From the left or the right?`,
                        visualType: "vertical_op",
                        visualData: {
                            operand1: s1, operand2: s2, operator: "+", result: "", carry: "",
                            phase: 'direction_check'
                        },
                        detailedExplanation: { es: "Pregunta de dirección", en: "Direction question" }
                    }]
                } as any;
            }
        }

        const cleanInput = input.toLowerCase().trim();
        const isHintReq = AnswerValidator.isHintRequest(input);

        // Check if user correctly identified units position
        if (cleanInput.includes('derecha') || cleanInput.includes('right') || cleanInput.includes('aquí') || cleanInput.includes('este lado')) {
            const firstDigitCol = cols.find(c => !c.isDot);

            if (!firstDigitCol) {
                // Safety fallback if no digit columns found (should be impossible for valid numbers)
                return null;
            }

            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Excelente! 🌟 Las **unidades** siempre están a la **derecha**.\n\nAhora empecemos a sumar columna por columna, de derecha a izquierda.\n\n**Columna de unidades:** ${firstDigitCol?.d1} + ${firstDigitCol?.d2} = ¿cuánto es?`
                        : `Excellent! 🌟 The **units** are always on the **right**.\n\nNow let's add column by column, from right to left.\n\n**Units column:** ${firstDigitCol?.d1} + ${firstDigitCol?.d2} = how much?`,
                    speech: lang === 'es'
                        ? `¡Eso es! ¡Excelente! Las unidades están siempre a la derecha. Ahora sí, sumemos. ¿Cuánto es ${firstDigitCol?.d1} más ${firstDigitCol?.d2}?`
                        : `That's it! Excellent! Units are always on the right. Now let's add them up. What is ${firstDigitCol?.d1} plus ${firstDigitCol?.d2}?`,
                    visualType: "vertical_op",
                    visualData: { operand1: s1, operand2: s2, operator: "+", result: "", carry: "", highlight: "n1" },
                    detailedExplanation: { es: "Columna de unidades", en: "Units column" }
                }]
            } as any;
        }

        // If user says left incorrectly - teach place value
        if (cleanInput.includes('izquierda') || cleanInput.includes('left')) {
            const numDigits = prob.n1.length;
            let placeValueExample = "";
            if (numDigits >= 6) {
                placeValueExample = lang === 'es'
                    ? `👆 De **derecha a izquierda**:\n\n1️⃣ **Unidades** (el primer dígito)\n2️⃣ **Decenas** (el segundo)\n3️⃣ **Centenas** (el tercero)\n4️⃣ **Unidades de mil** (el cuarto)\n5️⃣ **Decenas de mil** (el quinto)\n6️⃣ **Centenas de mil** (el sexto)`
                    : `👆 From **right to left**:\n\n1️⃣ **Units** (first digit)\n2️⃣ **Tens** (second)\n3️⃣ **Hundreds** (third)\n4️⃣ **Thousands** (fourth)\n5️⃣ **Ten thousands** (fifth)\n6️⃣ **Hundred thousands** (sixth)`;
            } else {
                placeValueExample = lang === 'es'
                    ? `👆 De **derecha a izquierda**:\n\n1️⃣ **Unidades**\n2️⃣ **Decenas**\n3️⃣ **Centenas**\n...y así sigue.`
                    : `👆 From **right to left**:\n\n1️⃣ **Units** (first digit)\n2️⃣ **Tens** (second)\n3️⃣ **Hundreds** (third)\n...and so on.`;
            }

            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Casi! 🤔 Pero recuerda:\n\nLas **unidades** siempre están a la **DERECHA** del número.\n\n${placeValueExample}\n\n¿Entonces, donde están las unidades?`
                        : `Almost! 🤔 But remember:\n\nThe **units** are always on the **RIGHT** of the number.\n\n${placeValueExample}\n\nSo, where are the units?`,
                    speech: lang === 'es'
                        ? `¡Ay, casi! Pero no te preocupes, recuerda que las unidades siempre están a tu derecha. Como cuando saludas. ¿Entonces, dónde están las unidades?`
                        : `Oh, almost! But don't worry, remember that units are always on your right side. So, where are the units?`,
                    visualType: "vertical_op",
                    visualData: { operand1: s1, operand2: s2, operator: "+", result: "", carry: "", highlight: "n1" },
                    detailedExplanation: { es: "Enseñanza de valor posicional", en: "Place value teaching" }
                }]
            } as any;
        }

        // If user says "no sé" or similar - teach place value patiently
        const historyText = history.map(h => h.content.toLowerCase()).join(' ');
        const hasAskedUnits = historyText.includes('unidades') || historyText.includes('units');

        if (isHintReq || (hasAskedUnits && !cleanInput.match(/\d/) && !cleanInput.includes('derecha') && !cleanInput.includes('izquierda') && !cleanInput.includes('right') && !cleanInput.includes('left'))) {
            const firstDigitCol = cols.find(c => !c.isDot);
            let placeValueExample = "";
            const numDigits = prob.n1.length;

            if (numDigits >= 6) {
                placeValueExample = lang === 'es'
                    ? `Mira el número **${prob.n1}**. Vamos de **derecha a izquierda**:\n\n1️⃣ El **${s1[s1.length - 1]}** está en las **Unidades** (a la derecha)\n2️⃣ El **${s1[s1.length - 2]}** está en las **Decenas**\n3️⃣ El **${s1[s1.length - 3]}** está en las **Centenas**\n4️⃣ El **${s1[s1.length - 4]}** está en las **Unidades de mil**\n5️⃣ El **${s1[s1.length - 5]}** está en las **Decenas de mil**\n6️⃣ El **${s1[s1.length - 6]}** está en las **Centenas de mil** (a la izquierda)`
                    : `Look at the number **${prob.n1}**. From **right to left**:\n\n1️⃣ **${s1[s1.length - 1]}** is in the **Units** (on the right)\n2️⃣ **${s1[s1.length - 2]}** is in the **Tens**\n3️⃣ **${s1[s1.length - 3]}** is in the **Hundreds**\n4️⃣ **${s1[s1.length - 4]}** is in the **Thousands**\n5️⃣ **${s1[s1.length - 5]}** is in the **Ten Thousands**\n6️⃣ **${s1[s1.length - 6]}** is in the **Hundred Thousands** (on the left)`;
            } else {
                placeValueExample = lang === 'es'
                    ? `Mira el número. Las **unidades** siempre están a la **derecha** 👉\n\nDe derecha a izquierda: **Unidades**, **Decenas**, **Centenas**...`
                    : `Look at the number. The **units** are always on the **right** 👉\n\nFrom right to left: **Units**, **Tens**, **Hundreds**...`;
            }

            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡No te preocupes! 😊 Te explico:\n\n${placeValueExample}\n\n👉 **Las UNIDADES siempre están a la DERECHA.**\n\nAhora que ya sabes, empecemos a sumar por la **columna de unidades**:\n\n**${firstDigitCol?.d1} + ${firstDigitCol?.d2} = ¿cuánto es?**`
                        : `Don't worry! 😊 Let me explain:\n\n${placeValueExample}\n\n👉 **UNITS are always on the RIGHT.**\n\nNow that you know, let's start adding from the **units column**:\n\n**${firstDigitCol?.d1} + ${firstDigitCol?.d2} = how much?**`,
                    speech: lang === 'es'
                        ? `¡No te preocupes, yo te ayudo! Mira, las unidades siempre están al final, a la derecha. ¡Es muy fácil! Ahora que ya sabes, sumemos la primera columna. ¿Cuánto es ${firstDigitCol?.d1} más ${firstDigitCol?.d2}?`
                        : `Don't worry, I'll help you! Look, units are always at the end, on the right. It's super easy! Now that you know, let's add the first column. What is ${firstDigitCol?.d1} plus ${firstDigitCol?.d2}?`,
                    visualType: "vertical_op",
                    visualData: { operand1: s1, operand2: s2, operator: "+", result: "", carry: "", highlight: "n1" },
                    detailedExplanation: { es: "Enseñanza de valor posicional - No sé", en: "Place value teaching - Don't know" }
                }]
            } as any;
        }

        return this.checkColumnAnswerWithCarry(input, cols, s1, s2, "+", lang, colNames, colNamesEn, history, studentName);
    }

    private static checkColumnAnswerWithCarry(input: string, cols: any[], s1: string, s2: string, op: string, lang: 'es' | 'en', colNames: string[], colNamesEn: string[], history: any[], studentName?: string): StepResponse | null {
        // Find the last visual state from history to get accumulated result
        let accumulatedResult = "";
        let currentColIndex = 0;

        for (let i = history.length - 1; i >= 0; i--) {
            const h = history[i];
            if (h.role === 'assistant' || h.role === 'nova') {
                // 1. Prioridad máxima: Marcador de estado invisible que inyectamos nosotros
                const visualStateMatch = h.content.match(/\[VISUAL_STATE\]\s*result="(\d*)"/);
                if (visualStateMatch) {
                    accumulatedResult = visualStateMatch[1] || "";
                    break;
                }

                // 2. Segunda prioridad: Bloque JSON estructurado
                try {
                    const jsonMatch = h.content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const json = JSON.parse(jsonMatch[0]);
                        // Intentar sacar de visualData o de un campo 'result' específico
                        const res = json.steps?.[0]?.visualData?.result ?? json.result;
                        if (res !== undefined) {
                            accumulatedResult = String(res);
                            break;
                        }
                    }
                } catch (e) { }

                // 3. Tercera prioridad: Si el objeto de historia ya viene con el estado visual tipado
                if (h.visualState?.result !== undefined) {
                    accumulatedResult = String(h.visualState.result);
                    break;
                }
            }
        }

        const digitCols = cols.filter(c => !c.isDot);
        // Important: ignore decimal point when calculating which digit we are on
        currentColIndex = accumulatedResult.replace('.', '').length;

        if (currentColIndex >= digitCols.length) {
            return null;
        }

        const currentCol = digitCols[currentColIndex];
        if (!currentCol) return null;

        // --- AUTO-SKIP DOT ---
        // If the NEXT column in the FULL list 'cols' is a dot, we should handle it.
        // The current visual column index is accumulatedResult.length
        const totalProcessed = accumulatedResult.length;
        if (totalProcessed < cols.length) {
            const nextInFull = cols[totalProcessed];
            if (nextInFull?.isDot) {
                const nextResWithDot = "." + accumulatedResult;
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Llegamos al punto decimal! 🎯 Lo escribimos y seguimos.`
                            : `Decimal point reached! 🎯 Write it down and continue.`,
                        speech: lang === 'es' ? "Ponemos el punto decimal y seguimos." : "We put the decimal point and continue.",
                        visualType: "vertical_op",
                        visualData: {
                            operand1: s1, operand2: s2, operator: op,
                            result: nextResWithDot,
                            carry: currentCol.carryIn > 0 ? String(currentCol.carryIn) : "",
                            highlight: `c${(() => {
                                const dotIdx = s1.indexOf('.') === -1 ? s1.length : s1.indexOf('.');
                                return currentCol.idx < dotIdx ? dotIdx - 1 - currentCol.idx : dotIdx - currentCol.idx;
                            })()}`
                        },
                        detailedExplanation: { es: "Punto decimal", en: "Decimal point" }
                    }]
                } as any;
            }
        }

        const expectedSum = currentCol.sumFull;
        const expectedDigit = currentCol.digitOut;
        const validation = AnswerValidator.validate(input, expectedSum);

        if (!validation.isNumericInput) {
            // SOCRATIC PERSISTENCE: Refocus student on current column (incl. when no number/word detected)
            const currentColName = lang === 'es' ? (colNames[currentColIndex] || 'esta columna') : (colNamesEn[currentColIndex] || 'this column');
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Vamos! 🚀 Sigue concentrado.\n\nEstamos en la columna de las **${currentColName}**. ¿Cuánto suma **${currentCol.d1} + ${currentCol.d2}**${currentCol.carryIn > 0 ? ' más la llevada de **' + currentCol.carryIn + '**' : ''}?`
                        : `Let's go! 🚀 Stay focused.\n\nWe're in the **${currentColName}** column. What is **${currentCol.d1} + ${currentCol.d2}**${currentCol.carryIn > 0 ? ' plus the carry of **' + currentCol.carryIn + '**' : ''}?`,
                    speech: lang === 'es'
                        ? `¡Oye, no te me distraigas! 🚀 Estamos en la columna de las ${currentColName}. ¿Cuánto nos da ${currentCol.d1} más ${currentCol.d2}${currentCol.carryIn > 0 ? ' más la que llevamos que es ' + currentCol.carryIn : ''}?`
                        : `Hey, don't get distracted! 🚀 We are in the ${currentColName} column. What is ${currentCol.d1} plus ${currentCol.d2}${currentCol.carryIn > 0 ? ' plus the carry of ' + currentCol.carryIn : ''}?`,
                    visualType: "vertical_op",
                    visualData: { operand1: s1, operand2: s2, operator: op, result: accumulatedResult, carry: currentCol.carryIn > 0 ? String(currentCol.carryIn) : "", highlight: `c${currentCol.idx}` },
                    detailedExplanation: { es: "Persistencia socrática - suma", en: "Socratic persistence - addition" }
                }]
            } as any;
        }

        const userAnswer = validation.userAnswer!;
        const isCorrect = validation.isCorrect;

        const problemKey = `${s1}${op}${s2}_col${currentColIndex}`;
        const allColumnSums = digitCols.map(c => c.sumFull);

        if (!isCorrect) {
            const errorType = ErrorDetector.categorize(
                userAnswer,
                expectedSum,
                expectedDigit,
                currentCol.carryIn,
                allColumnSums,
                op === '-',
                currentCol.d1,
                currentCol.d2
            );

            const currentHintLevel = this.getHintLevel(problemKey);

            const hint = HintGenerator.generate(
                errorType,
                currentHintLevel,
                lang,
                {
                    d1: currentCol.d1,
                    d2: currentCol.d2,
                    carryIn: currentCol.carryIn,
                    expectedSum: expectedSum,
                    expectedDigit: expectedDigit,
                    columnName: lang === 'es' ? colNames[currentColIndex] || `columna ${currentColIndex + 1}` : colNamesEn[currentColIndex] || `column ${currentColIndex + 1}`,
                    operator: op,
                    userAnswer: userAnswer
                }
            );

            // Increase hint level for next time
            if (hint.newHintLevel > currentHintLevel) {
                this.setHintLevel(problemKey, hint.newHintLevel);
            }

            return {
                steps: [{
                    text: hint.text,
                    speech: hint.speech,
                    visualType: "vertical_op",
                    visualData: { operand1: s1, operand2: s2, operator: op, result: accumulatedResult, carry: "", highlight: `c${currentCol.idx}` }, // Simplification
                    detailedExplanation: { es: "Pista correctiva", en: "Corrective hint" }
                }]
            } as any;
        }

        // CORRECT ANSWER LOGIC
        this.resetHintLevel(problemKey);
        const nextDigit = String(expectedDigit);
        let nextResult = nextDigit + accumulatedResult; // Prepend because we go right-to-left
        const nextCarry = currentCol.carryOut > 0 ? String(currentCol.carryOut) : "";

        // --- EAGER DOT HANDLING ---
        // Check if the NEXT item in the FULL column list is a dot. 
        // If so, add it NOW to prevent visual misalignment in vertical math.
        const totalWithNewDigit = nextResult.length;
        let foundDot = false;
        if (totalWithNewDigit < cols.length) {
            const nextInFull = cols[totalWithNewDigit];
            if (nextInFull?.isDot) {
                nextResult = "." + nextResult;
                foundDot = true;
            }
        }

        // Check if this was the last column
        const isFinished = currentColIndex === digitCols.length - 1;

        let successMsg = "";
        let successSpeech = "";

        if (isFinished) {
            // Include the carry in the final result if any
            const finalRest = nextCarry ? nextCarry + nextResult : nextResult;

            successMsg = lang === 'es'
                ? `¡Correcto! 🎉 ${currentCol.d1} + ${currentCol.d2}${currentCol.carryIn > 0 ? ' + ' + currentCol.carryIn : ''} = ${expectedSum}.\n\n¡Hemos terminado! El resultado final es **${finalRest}**.`
                : `Correct! 🎉 ${currentCol.d1} + ${currentCol.d2}${currentCol.carryIn > 0 ? ' + ' + currentCol.carryIn : ''} = ${expectedSum}.\n\nWe are done! The final result is **${finalRest}**.`;
            successSpeech = lang === 'es' ? `¡Correcto! Hemos terminado. El resultado es ${finalRest}.` : `Correct! We are done. The result is ${finalRest}.`;

            return {
                steps: [{
                    text: successMsg,
                    speech: successSpeech,
                    visualType: "vertical_op",
                    visualData: { operand1: s1, operand2: s2, operator: op, result: finalRest, carry: "", highlight: "done" },
                    detailedExplanation: { es: "Suma completada", en: "Addition completed" }
                }]
            } as any;
        } else {
            successMsg = lang === 'es'
                ? `¡Bien! 👍 ${currentCol.d1} + ${currentCol.d2}${currentCol.carryIn > 0 ? ' + ' + currentCol.carryIn : ''} = ${expectedSum}.\n\nEscribimos **${expectedDigit}**${currentCol.carryOut > 0 ? ` y llevamos **${currentCol.carryOut}**` : ''}${foundDot ? '... ¡y no olvidamos el punto decimal! •' : '.'}\n\nVamos con la siguiente columna ⬅️`
                : `Good! 👍 ${currentCol.d1} + ${currentCol.d2}${currentCol.carryIn > 0 ? ' + ' + currentCol.carryIn : ''} = ${expectedSum}.\n\nWrite **${expectedDigit}**${currentCol.carryOut > 0 ? ` and carry **${currentCol.carryOut}**` : ''}${foundDot ? '... and don\'t forget the decimal point! •' : '.'}\n\nNext column ⬅️`;

            successSpeech = lang === 'es'
                ? `${getCorrectFeedback(lang, studentName)} ${currentCol.d1} más ${currentCol.d2}${currentCol.carryIn > 0 ? ' más la que llevábamos' : ''} nos da ${expectedSum}. Escribimos el ${expectedDigit} ${currentCol.carryOut > 0 ? ' y llevamos el ' + currentCol.carryOut : ''}${foundDot ? '. ¡Y súper importante!, ponemos el punto decimal.' : '. '} Vamos a la siguiente columna.`
                : `${getCorrectFeedback(lang, studentName)} ${currentCol.d1} plus ${currentCol.d2}${currentCol.carryIn > 0 ? ' plus the carry' : ''} gives us ${expectedSum}. Write ${expectedDigit} ${currentCol.carryOut > 0 ? ' and carry the ' + currentCol.carryOut : ''}${foundDot ? '. And super important, we place the decimal point.' : '. '} Next column.`;

            // Inject hidden state for persistence mechanism
            const hiddenState = ` [VISUAL_STATE] result="${nextResult}"`;

            return {
                steps: [{
                    text: successMsg + hiddenState, // Append invisible state for parser
                    speech: successSpeech,
                    visualType: "vertical_op",
                    visualData: {
                        operand1: s1, operand2: s2, operator: op, result: nextResult, carry: nextCarry,
                        highlight: `c${(() => {
                            const nextCol = digitCols[currentColIndex + 1];
                            if (!nextCol) return '';
                            const dotIdx = s1.indexOf('.') === -1 ? s1.length : s1.indexOf('.');
                            return nextCol.idx < dotIdx ? dotIdx - 1 - nextCol.idx : dotIdx - nextCol.idx;
                        })()}`
                    },
                    detailedExplanation: { es: "Paso correcto", en: "Correct step" }
                }]
            } as any;
        }
    }
}
