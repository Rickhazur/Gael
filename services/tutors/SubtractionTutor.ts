import { StepResponse, HintLevel, ErrorType } from './types';
import { GradeLevel } from '@/types/tutor';
import { AnswerValidator, HintGenerator, StateHelper } from './utils';
import { getCorrectFeedback } from '../../data/feedbackPhrases';

export class SubtractionTutor {

    private static buildSubtractionColumns(s1: string, s2: string) {
        const len = s1.length;
        // Logic to build columns from Left (0) to Right (len-1)
        // But borrowing calculations must happen Right-to-Left or be simulated carefully.
        // We'll simulate borrowing from Right-to-Left.

        const digits1 = s1.split('').map(c => c === '.' ? -1 : parseInt(c));
        const digits2 = s2.split('').map(c => c === '.' ? -1 : parseInt(c));
        const originalDigits1 = [...digits1];

        const computedCols = new Array(len);

        // Iterate Right to Left
        for (let i = len - 1; i >= 0; i--) {
            if (digits1[i] === -1) {
                computedCols[i] = { isDot: true, d1: '.', d2: '.', idx: i, result: '.', resultDigit: '.' };
                continue;
            }

            let d1 = digits1[i];
            const d2 = digits2[i];
            let borrowed = false;
            let d1Eff = d1;
            let d1Display = originalDigits1[i];

            if (d1 < d2) {
                // Borrow from left
                let found = false;
                for (let j = i - 1; j >= 0; j--) {
                    if (digits1[j] === -1) continue;
                    if (digits1[j] > 0) {
                        digits1[j]--;
                        for (let k = j + 1; k < i; k++) {
                            if (digits1[k] !== -1) digits1[k] = 9;
                        }
                        d1Eff = d1 + 10;
                        borrowed = true;
                        found = true;
                        break;
                    }
                }
            }

            computedCols[i] = {
                isDot: false,
                d1: d1Display,
                d2: d2,
                d1Eff: d1Eff,
                borrowed: borrowed,
                result: d1Eff - d2,
                idx: i
            };
        }
        return computedCols;
    }

    private static getBorrowList(s1: string, s2: string, upToColIndexFromRight: number) {
        const bList: any[] = [];
        const digits1 = s1.split('').map(c => c === '.' ? -1 : parseInt(c));
        const digits2 = s2.split('').map(c => c === '.' ? -1 : parseInt(c));
        const len = s1.length;

        // Convert "Visual Col Index" (Right-based 0..N) to "String Index" (Left-based 0..N)
        // e.g. length 5. Col 0 (Right) -> Idx 4.
        const strIndex = (vCol: number) => len - 1 - vCol;

        const maxStrIdx = strIndex(0); // Rightmost char index
        const limitStrIdx = strIndex(upToColIndexFromRight); // Current char index

        // Simulate borrowings from Right (end) to Current Column
        for (let i = maxStrIdx; i >= limitStrIdx; i--) {
            if (digits1[i] === -1) continue;
            let d1 = digits1[i];
            const d2 = digits2[i];

            if (d1 < d2) {
                // Borrow from left
                for (let j = i - 1; j >= 0; j--) {
                    if (digits1[j] === -1) continue;
                    if (digits1[j] > 0) {
                        digits1[j]--;

                        // Record the NEW value of the neighbor we borrowed from
                        // Visualizer expects: { colIndex: <VisualIndex>, newValue: "7" }
                        // Visual Index of neighbor j is: len - 1 - j
                        bList.push({
                            colIndex: len - 1 - j,
                            newValue: String(digits1[j])
                        });

                        // Intermediate zeros becoming 9s
                        for (let k = j + 1; k < i; k++) {
                            if (digits1[k] !== -1) {
                                digits1[k] = 9;
                                bList.push({
                                    colIndex: len - 1 - k,
                                    newValue: "9"
                                });
                            }
                        }
                        break;
                    }
                }
            }
        }
        return bList;
    }

    static handleSubtraction(input: string, prob: any, lang: 'es' | 'en', history: any[], studentName?: string, grade: GradeLevel = 3): StepResponse | null {
        // 1. ALIGNMENT & PADDING
        let s1 = prob.n1, s2 = prob.n2;
        const isDecimal = s1.includes('.') || s2.includes('.');

        if (isDecimal) {
            if (!s1.includes('.')) s1 += '.0';
            if (!s2.includes('.')) s2 += '.0';
            const [i1, f1] = s1.split('.');
            const [i2, f2] = s2.split('.');
            const maxF = Math.max(f1.length, f2.length);
            const maxI = Math.max(i1.length, i2.length);
            s1 = i1.padStart(maxI, '0') + '.' + f1.padEnd(maxF, '0');
            s2 = i2.padStart(maxI, '0') + '.' + f2.padEnd(maxF, '0');
        } else {
            const max = Math.max(s1.length, s2.length);
            s1 = s1.padStart(max, '0');
            s2 = s2.padStart(max, '0');
        }

        const lastState = StateHelper.getCurrentVisualState(history);
        const solvedResult = lastState?.result || "";

        const cols = this.buildSubtractionColumns(s1, s2);

        // Count how many visual items (digits + dots) we have solved
        const processedCount = solvedResult.length;

        // Current Visual Column Index (0 = Rightmost)
        const vColIdx = processedCount;

        // If finished, return null (or success if not handled by caller)
        if (vColIdx >= cols.length) return null;

        // Get actual column object (Index mapping: Right 0 -> Array Last)
        const col = cols[cols.length - 1 - vColIdx];
        const borrows = this.getBorrowList(s1, s2, vColIdx);

        // --- AUTO-SKIP DOT ---
        if (col.isDot) {
            const newRes = "." + solvedResult;
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Llegamos al punto decimal! 🎯 Lo escribimos y seguimos.`
                        : `Decimal point reached! 🎯 Write it down and continue.`,
                    speech: lang === 'es' ? "Ponemos el punto." : "Place the point.",
                    visualType: "vertical_op",
                    visualData: {
                        operand1: s1, operand2: s2, operator: "-", result: newRes,
                        highlightDigit: { row: 0, col: vColIdx + 1 }, // Highlight next digit
                        borrows: borrows
                    },
                    detailedExplanation: { es: "Punto decimal", en: "Decimal point" }
                }]
            };
        }

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
                introEs = `¡Hola! 🦋 Soy la **Profesora Lina**. ¡Vamos a restar!\n\n¿Sabes por qué es útil restar? 🎨 Nos ayuda a saber cuántas cosas nos quedan después de regalar o usar algunas. ¡Como cuando compartes tus dulces!\n\nMira el tablero: puse los números uno debajo del otro, bien ordenaditos. ¿Los ves?`;
                introEn = `Hi! 🦋 I'm **Professor Lina**. Let's subtract!\n\nDo you know why subtracting is useful? 🎨 It helps us know how many things we have left after giving away or using some. Like when you share your candies!\n\nLook at the board: I put the numbers one under the other, very neat. Do you see them?`;
                speechEs = grade >= 6
                    ? `Hola. Soy la profesora Lina. Vamos a trabajar restas. Mira cómo están organizados los números en la pizarra, uno debajo del otro.`
                    : `¡Hola, corazón! Soy la profe Lina. Hoy vamos a restar. Restar es genial para saber cuánto te queda de algo rico. Mira cómo puse los números en la pizarra. ¿Están bien peinaditos uno debajo del otro?`;
                speechEn = grade >= 6
                    ? `Hello. I'm Professor Lina. Let's work on subtraction. Look how the numbers are organized on the board, one under the other.`
                    : `Hi, sweetie! I'm Professor Lina. Today we're going to subtract. Subtracting is great for knowing how much you have left of something yummy. Look how I placed the numbers on the board. Are they nicely lined up?`;
            } else {
                introEs = `¡Hola! 👋 Soy la **Profesora Lina**. ¡Preparados para restar!\n\nLa resta es como un juego de quitar pistas 🔍. Nos sirve para calcular vueltos, distancias y tiempos.\n\nPrimero, alineé los números: **unidades con unidades** y **decenas con decenas**. ¿Los ves listos en su lugar?`;
                introEn = `Hi! 👋 I'm **Professor Lina**. Ready to subtract!\n\nSubtraction is like a game of taking away clues 🔍. It helps us calculate change, distances, and times.\n\nFirst, I aligned the numbers: **units with units** and **tens with tens**. Do they look ready?`;
                speechEs = `¡Hola! Soy la profe Lina. ¡Vamos a restar! Esta operación es súper útil para cuando vas a la tienda. Mira la pizarra: los números están alineaditos, uno debajo del otro. ¿Ya los viste?`;
                speechEn = `Hi! I'm Professor Lina. Let's subtract! This operation is super useful for when you go to the store. Look at the board: the numbers are all lined up, one under the other. Do you see them?`;
            }

            return {
                steps: [{
                    text: lang === 'es' ? introEs : introEn,
                    speech: lang === 'es' ? speechEs : speechEn,
                    visualType: grade <= 1 ? "concrete_math" : "vertical_op",
                    visualData: {
                        operand1: s1, operand2: s2, operator: "-", result: "",
                        phase: 'direction_check',
                        n1: parseInt(s1),
                        n2: parseInt(s2),
                        itemEmoji: "🔵"
                    },
                    detailedExplanation: { es: "Introducción y Alineación", en: "Intro and Alignment" }
                }]
            };
        }

        // =========================================================
        // 🟢 PHASE: DIRECTION CHECK (Where do we start?)
        // =========================================================
        if (currentPhase === 'direction_check') {
            const cleanInput = input.toLowerCase();
            const startsRight = cleanInput.includes('derecha') || cleanInput.includes('right') || cleanInput.includes('final') || cleanInput.includes('unidades') || cleanInput.includes('units');

            if (startsRight) {
                const q = col.borrowed
                    ? (lang === 'es' ? `¿A ${col.d1} le podemos quitar ${col.d2}?` : `Can we take ${col.d2} from ${col.d1}?`)
                    : (lang === 'es' ? `¿Cuánto es ${col.d1} menos ${col.d2}?` : `What is ${col.d1} minus ${col.d2}?`);

                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Exacto! 🎯 Siempre empezamos por la **derecha**, por las **unidades**.\n\nAhora sí, **${q}**`
                            : `Exactly! 🎯 We always start on the **right**, with the **units**.\n\nNow, **${q}**`,
                        speech: lang === 'es'
                            ? (grade >= 6 ? `Correcto. Siempre empezamos por la derecha.` : `¡Eso es! Muy bien. Siempre empezamos por la derecha. Entonces, ${q}`)
                            : (grade >= 6 ? `Correct. We always start on the right.` : `That's it! Very good. We always start on the right. So, ${q}`),
                        visualType: "vertical_op",
                        visualData: {
                            operand1: s1, operand2: s2, operator: "-", result: "",
                            highlightDigit: { row: 0, col: 0 },
                            phase: 'solving'
                        },
                        detailedExplanation: { es: "Inicio de cálculos", en: "Starting calculations" }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Miremos con cuidado! 👀 Para que la resta salga perfecta, ¿empezamos por la **izquierda** o por la **derecha** (las unidades)?`
                            : `Let's look carefully! 👀 To make the subtraction perfect, do we start from the **left** or from the **right** (the units)?`,
                        speech: lang === 'es'
                            ? `¡Pensemos un poquito! Para no equivocarnos, ¿por dónde empezamos? ¿Por la izquierda o por la derecha?`
                            : `Let's think for a bit! To avoid mistakes, where do we start? From the left or the right?`,
                        visualType: "vertical_op",
                        visualData: {
                            operand1: s1, operand2: s2, operator: "-", result: "",
                            phase: 'direction_check'
                        },
                        detailedExplanation: { es: "Pregunta de dirección", en: "Direction question" }
                    }]
                };
            }
        }

        // --- CHECK BORROW INTERACTION ---
        const borrowKeywords = /(prestado|prestar|vecino|borrow|help|neighbor|no|can't)/i;
        if (col.borrowed && borrowKeywords.test(input)) {
            // Calculate neighbor value for display
            const neighborVIdx = vColIdx + 1;
            const neighborVal = borrows.find(b => b.colIndex === neighborVIdx)?.newValue || "?";

            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Correcto! El vecino nos presta 1. 🏠\n\nAhora tu número es un **${col.d1Eff}**.\n\n**${col.d1Eff} − ${col.d2}** = ?`
                        : `Correct! Neighbor lends us 1. 🏠\n\nNow you have **${col.d1Eff}**.\n\n**${col.d1Eff} − ${col.d2}** = ?`,
                    speech: lang === 'es' ? `El vecino presta y quedamos con ${col.d1Eff}. Restamos.` : `Neighbor lends, we have ${col.d1Eff}. Subtract.`,
                    visualType: "vertical_op",
                    visualData: {
                        operand1: s1, operand2: s2, operator: "-", result: solvedResult,
                        highlightDigit: { row: 0, col: vColIdx },
                        borrows: borrows
                    },
                    detailedExplanation: { es: "Préstamo", en: "Borrow" }
                }]
            };
        }

        // --- VALIDATE ANSWER ---
        const val = AnswerValidator.validate(input, col.result);

        if (val.isCorrect) {
            const nextRes = String(val.userAnswer) + String(solvedResult); // Prepend digit
            const isLast = vColIdx >= cols.length - 1;

            if (isLast) {
                // Final cleanup of leading zeros
                let finalStr = parseFloat(nextRes).toString();
                // Keep decimal if exists (parseFloat keeps it). 
                // BUT parseFloat("05.2") -> 5.2. Correct.
                // parseFloat("00") -> 0. Correct.

                return {
                    steps: [{
                        text: lang === 'es' ? `¡Terminamos! 🎉 Resultado: **${finalStr}**` : `Finished! 🎉 Result: **${finalStr}**`,
                        speech: lang === 'es' ? `¡Muy bien! El resultado es ${finalStr}.` : `Great! Result is ${finalStr}.`,
                        visualType: "vertical_op",
                        visualData: {
                            operand1: s1, operand2: s2, operator: "-", result: finalStr,
                            highlight: "done",
                            borrows: borrows
                        },
                        detailedExplanation: { es: "Fin", en: "End" }
                    }]
                };
            }

            // Next Column Prompt
            const nextVIdx = vColIdx + 1;
            const nextCol = cols[cols.length - 1 - nextVIdx];

            // If next is Dot, we will handle it in NEXT turn (by user acknowledging or auto step?)
            // For now, prompt normally. If it's a dot, user types anything and we catch it in step handle 'isDot'.
            // Actually, better to say "Write answer... now decimal point!" in one go?
            // Let's explicitly prompt for next digit.

            let prompt = "";
            let speech = "";

            if (nextCol.isDot) {
                prompt = lang === 'es' ? `¡Bien! Ahora... ¡cuidado con el punto decimal! •` : `Good! Now... watch out for the decimal point! •`;
            } else {
                const q = nextCol.borrowed
                    ? (lang === 'es' ? `Siguiente: ¿A ${nextCol.d1} (-1) le quitamos ${nextCol.d2}?` : `Next: Can we take ${nextCol.d2} from ${nextCol.d1}?`)
                    : (lang === 'es' ? `Siguiente columna: **${nextCol.d1} − ${nextCol.d2}**` : `Next column: **${nextCol.d1} − ${nextCol.d2}**`);
                prompt = lang === 'es' ? `¡Bien! Escribimos **${val.userAnswer}**. ${q}` : `Good! Write **${val.userAnswer}**. ${q}`;
            }

            return {
                steps: [{
                    text: prompt,
                    speech: `Siguiente.`,
                    visualType: "vertical_op",
                    visualData: {
                        operand1: s1, operand2: s2, operator: "-", result: nextRes,
                        highlightDigit: { row: 0, col: nextVIdx },
                        borrows: borrows
                    },
                    detailedExplanation: { es: "Correcto y siguiente", en: "Correct and next" }
                }]
            };
        }

        // --- INCORRECT ---
        const hint = HintGenerator.generateGenericIncorrect('subtraction', col.result, val.userAnswer || 0, lang);
        return {
            steps: [{
                text: hint.text,
                speech: hint.speech,
                visualType: "vertical_op",
                visualData: {
                    operand1: s1, operand2: s2, operator: "-", result: solvedResult,
                    highlightDigit: { row: 0, col: vColIdx },
                    borrows: borrows
                },
                detailedExplanation: { es: "Incorrecto", en: "Incorrect" }
            }]
        };
    }
}
