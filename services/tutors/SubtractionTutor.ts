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

        // --- FIRST STEP INTRO ---
        if (prob.isNew && vColIdx === 0) {
            const q = col.borrowed
                ? (lang === 'es' ? `¿A ${col.d1} le podemos quitar ${col.d2}?` : `Can we take ${col.d2} from ${col.d1}?`)
                : (lang === 'es' ? `¿Cuánto es ${col.d1} menos ${col.d2}?` : `What is ${col.d1} minus ${col.d2}?`);

            // 🎓 GRADE-BASED PEDAGOGY
            let introEs = "";
            let introEn = "";
            let speechEs = "";
            let speechEn = "";

            if (grade <= 1) { // 1st Grade
                introEs = `¡Hola! 🦋 Soy la **Profesora Lina**. ¡Vamos a restar!\n\n¿Cuánto es **${prob.n1} − ${prob.n2}**? Puedes usar colores o contar hacia atrás. 🎨`;
                introEn = `Hi! 🦋 I'm **Professor Lina**. Let's subtract!\n\nHow much is **${prob.n1} − ${prob.n2}**? You can use colors or count backwards. 🎨`;
                speechEs = `¡Hola! Soy la profe Lina. Hoy vamos a jugar a quitar cosas. ¿Cuánto es ${prob.n1} menos ${prob.n2}? Puedes imaginar que tienes caramelos y me das algunos. ¿Cuántos te quedan?`;
                speechEn = `Hi! I'm Professor Lina. Today we're going to play at taking things away. What is ${prob.n1} minus ${prob.n2}? You can imagine you have candies and give me some. How many do you have left?`;
            } else if (grade === 2) { // 2nd Grade
                introEs = `¡Hola! 👋 Vamos a restar estos números.\n\nEmpezamos por la derecha 👉 **${q}**`;
                introEn = `Hi! 👋 Let's subtract these numbers.\n\nStart on the right 👉 **${q}**`;
                speechEs = `¡Hola! Vamos a restar. Siempre empezamos por el ladito de la derecha. ${q}`;
                speechEn = `Hi! Let's subtract. We always start on the right side. ${q}`;
            } else { // 3rd Grade+
                introEs = `¡Vamos a restar! 📉 **${prob.n1} − ${prob.n2}**\n\nEmpezamos por la derecha 👉 **${q}**`;
                introEn = `Let's subtract! 📉 **${prob.n1} − ${prob.n2}**\n\nStart on the right 👉 **${q}**`;
                speechEs = `¡Misión resta activada! Empezamos por la derecha. ${q}`;
                speechEn = `Subtraction mission activated! Start on the right. ${q}`;
            }

            return {
                steps: [{
                    text: lang === 'es' ? introEs : introEn,
                    speech: lang === 'es' ? speechEs : speechEn,
                    visualType: "vertical_op",
                    visualData: { operand1: s1, operand2: s2, operator: "-", result: "", highlightDigit: { row: 0, col: 0 } },
                    detailedExplanation: { es: "Inicio de resta", en: "Starting subtraction" }
                }]
            };
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
