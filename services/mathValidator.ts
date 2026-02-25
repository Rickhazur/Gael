/**
 * 🧮 MATH VALIDATOR & CARRY-OVER ENGINE
 * 
 * This service provides:
 * 1. Accurate mathematical validation (so the tutor never makes mistakes)
 * 2. Automatic carry-over calculation for addition/subtraction
 * 3. Step-by-step problem solving with visual data for animations
 */

export interface VerticalOpStep {
    text?: string; // Optional direct text fallback
    operand1: string;
    operand2: string;
    operator: '+' | '-' | '×' | '÷' | '=' | '...' | '→' | '✓';
    result: string;          // Partial result so far (built right-to-left)
    carry: string;           // Current carry value (e.g., "1" for tens)
    highlight?: string;      // What to highlight: 'n1', 'n2', 'result', 'carry', 'done'
    columnIndex: number;     // Which column we're solving (0 = units, 1 = tens, etc.)
    visualType?: 'fraction_bar' | 'pie' | 'geometry' | 'division' | 'vertical_op' | 'base10' | 'multi_groups' | 'decomposition' | 'fraction_equation' | 'generated_image' | 'story_image'; // Extended visual support
    visualData?: any;        // Payload for complex visuals (shapes, fractions)
    message: {
        es: string;
        en: string;
    };
    speech: {
        es: string;
        en: string;
    };
    hint?: {
        es: string;
        en: string;
    };
    detailedExplanation?: {
        es: string;
        en: string;
    };
}

export interface ValidationResult {
    isCorrect: boolean;
    correctAnswer: number | string;
    explanation: {
        es: string;
        en: string;
    };
}

/**
 * Validates if a student's answer is correct
 */
export function validateAnswer(
    operand1: number,
    operand2: number,
    operator: '+' | '-' | '×' | '÷',
    studentAnswer: number
): ValidationResult {
    let correctAnswer: number;

    switch (operator) {
        case '+':
            correctAnswer = operand1 + operand2;
            break;
        case '-':
            correctAnswer = operand1 - operand2;
            break;
        case '×':
            correctAnswer = operand1 * operand2;
            break;
        case '÷':
            correctAnswer = Math.floor(operand1 / operand2);
            break;
        default:
            correctAnswer = 0;
    }

    const isCorrect = studentAnswer === correctAnswer;

    return {
        isCorrect,
        correctAnswer,
        explanation: {
            es: isCorrect
                ? `¡Correcto! ${operand1} ${operator} ${operand2} = ${correctAnswer}`
                : `No exactamente. ${operand1} ${operator} ${operand2} = ${correctAnswer}, no ${studentAnswer}`,
            en: isCorrect
                ? `Correct! ${operand1} ${operator} ${operand2} = ${correctAnswer}`
                : `Not quite. ${operand1} ${operator} ${operand2} = ${correctAnswer}, not ${studentAnswer}`
        }
    };
}

/**
 * Generates all steps for solving a vertical addition problem with carry-over
 */
export function generateAdditionSteps(input: number | number[], optionalNum2?: number): VerticalOpStep[] {
    let numbers: number[] = [];
    if (Array.isArray(input)) {
        numbers = input;
    } else if (typeof input === 'number' && typeof optionalNum2 === 'number') {
        numbers = [input, optionalNum2];
    } else {
        return [];
    }

    const steps: VerticalOpStep[] = [];
    const strings = numbers.map(n => n.toString());
    const maxLen = Math.max(...strings.map(s => s.length));

    // Pad numbers
    const padded = strings.map(s => s.padStart(maxLen, '0'));

    let carry = 0;
    let resultStr = '';

    // Used for visual persistence in whiteboard
    const operandsPayload = strings;

    // Process from right to left (units → tens → hundreds)
    for (let i = maxLen - 1; i >= 0; i--) {
        let columnSum = carry;
        const columnDigits: number[] = [];

        padded.forEach(nStr => {
            const digit = parseInt(nStr[i]);
            columnSum += digit;
            columnDigits.push(digit);
        });

        const resultDigit = columnSum % 10;
        const newCarry = Math.floor(columnSum / 10);

        // Store PREVIOUS result string for the Question step (HIDE result)
        const resultStrBefore = resultStr;

        // Build NEW result string for the Feedback step (SHOW result)
        resultStr = resultDigit + resultStr;

        const columnName = getColumnName(maxLen - 1 - i);

        // Build question string dynamically
        // "7 + 8 + 5 + 1(carry)..."
        const digitsExpression = columnDigits.join(' más ');
        const digitsExpressionEn = columnDigits.join(' plus ');

        const carryES = carry > 0 ? ` más ${carry} que llevamos` : '';
        const carryEN = carry > 0 ? ` plus ${carry} we're carrying` : '';

        // Step 1: Ask about the column
        steps.push({
            operand1: strings[0], // Legacy placeholders
            operand2: strings[1] || "",
            operator: '+',
            result: resultStrBefore, // HIDDEN ANSWER
            carry: carry > 0 ? carry.toString() : '',
            highlight: 'n1', // Highlight all?
            columnIndex: maxLen - 1 - i,
            visualType: 'vertical_op',
            visualData: {
                operands: operandsPayload,
                correctValue: (newCarry * 10) + resultDigit,
                operator: '+',
                result: resultStrBefore,
                carry: carry > 0 ? carry.toString() : ''
            },
            message: {
                es: `¿Cuánto es ${digitsExpression}${carryES}?`,
                en: `What is ${digitsExpressionEn}${carryEN}?`
            },
            speech: {
                es: `¿Cuánto es ${digitsExpression}${carryES}?`,
                en: `What is ${digitsExpressionEn}${carryEN}?`
            }
        });

        // Step 2: Show the answer
        steps.push({
            operand1: strings[0],
            operand2: strings[1] || "",
            operator: '+',
            result: resultStr,
            carry: newCarry > 0 ? newCarry.toString() : '',
            highlight: 'result',
            columnIndex: maxLen - 1 - i,
            visualType: 'vertical_op',
            visualData: {
                operands: operandsPayload,
                operator: '+',
                result: resultStr,
                carry: newCarry > 0 ? newCarry.toString() : ''
            },
            message: {
                es: `¡Correcto! ${columnSum}. Escribimos ${resultDigit}${newCarry > 0 ? ` y llevamos ${newCarry}` : ''}.`,
                en: `Correct! ${columnSum}. We write ${resultDigit}${newCarry > 0 ? ` and carry ${newCarry}` : ''}.`
            },
            speech: {
                es: `¡Correcto! ${columnSum}. Escribimos ${resultDigit}${newCarry > 0 ? ` y llevamos ${newCarry}` : ''}.`,
                en: `Correct! ${columnSum}. We write ${resultDigit}${newCarry > 0 ? ` and carry ${newCarry}` : ''}.`
            }
        });

        carry = newCarry;
    }

    // Final carry if exists
    if (carry > 0) {
        resultStr = carry + resultStr;
        steps.push({
            operand1: strings[0],
            operand2: strings[1] || "",
            operator: '+',
            result: resultStr,
            carry: '',
            highlight: 'done',
            columnIndex: maxLen,
            visualType: 'vertical_op',
            visualData: {
                operands: operandsPayload,
                operator: '+',
                result: resultStr,
                carry: ''
            },
            message: {
                es: `¡Y bajamos el ${carry}! Resultado final: ${resultStr}`,
                en: `And we bring down the ${carry}! Final result: ${resultStr}`
            },
            speech: {
                es: `Resultado final: ${resultStr}`,
                en: `Final result: ${resultStr}`
            }
        });
    } else {
        // Mark as done
        steps[steps.length - 1].highlight = 'done';
        steps[steps.length - 1].message.es += ` ¡Terminamos! Resultado: ${resultStr}`;
        steps[steps.length - 1].message.en += ` Done! Result: ${resultStr}`;
    }

    return steps;
}

/**
 * Generates all steps for solving a vertical subtraction problem with borrowing
 */
export function generateSubtractionSteps(num1: number, num2: number): VerticalOpStep[] {
    const steps: VerticalOpStep[] = [];

    if (num1 < num2) {
        // Can't subtract larger from smaller (for elementary level)
        return [{
            operand1: num1.toString(),
            operand2: num2.toString(),
            operator: '-',
            result: '',
            carry: '',
            highlight: 'n1',
            columnIndex: 0,
            message: {
                es: `Hmm, ${num1} es menor que ${num2}. ¿Estás seguro de esta resta?`,
                en: `Hmm, ${num1} is less than ${num2}. Are you sure about this subtraction?`
            },
            speech: {
                es: `Hmm, ${numberToSpanish(num1)} es menor que ${numberToSpanish(num2)}. ¿Estás seguro de esta resta?`,
                en: `Hmm, ${num1} is less than ${num2}. Are you sure about this subtraction?`
            }
        }];
    }

    const str1 = num1.toString();
    const str2 = num2.toString();
    const maxLen = Math.max(str1.length, str2.length);

    // Pad numbers
    const n1Arr = str1.padStart(maxLen, '0').split('').map(Number);
    const n2Arr = str2.padStart(maxLen, '0');

    let resultStr = '';

    // 🖍️ VISUAL TRACKING FOR BORROWS
    const currentBorrows: { colIndex: number, newValue: string }[] = [];

    // Process from right to left
    for (let i = maxLen - 1; i >= 0; i--) {
        let digit1 = n1Arr[i];
        const digit2 = parseInt(n2Arr[i]);

        // Socratic Borrowing Logic
        if (digit1 < digit2) {
            // 1. Find the Source (The digit that can lend)
            let sourceIdx = i - 1;
            while (sourceIdx >= 0 && n1Arr[sourceIdx] === 0) {
                sourceIdx--;
            }

            if (sourceIdx >= 0) {
                const sourceVal = n1Arr[sourceIdx];
                const newVal = sourceVal - 1;

                // [Step A] Ask about the Source
                const chainLen = (i - 1) - sourceIdx;
                const contextES = chainLen > 0
                    ? `A ${digit1} no le podemos quitar ${digit2}. El vecino 0 no tiene nada 😢. Vamos hasta el ${sourceVal}. `
                    : `A ${digit1} no le alcanza para quitarle ${digit2}. Así que le pide ayuda al vecino ${sourceVal}. `;
                const contextEN = chainLen > 0
                    ? `We can't take ${digit2} from ${digit1}. Neighbor 0 has nothing. Let's go to ${sourceVal}. `
                    : `We can't take ${digit2} from ${digit1}. Let's ask neighbor ${sourceVal} for help. `;

                steps.push({
                    operand1: str1, operand2: str2, operator: '-', result: resultStr, carry: '',
                    highlight: 'n1', columnIndex: maxLen - 1 - sourceIdx,
                    visualData: {
                        operands: [str1, str2],
                        borrows: [...currentBorrows],
                        correctValue: newVal
                    },
                    message: {
                        es: `${contextES}El ${sourceVal} es muy amable y nos presta 1. Si tienes ${sourceVal} y regalas 1, ¿cuántos te quedan?`,
                        en: `${contextEN}The ${sourceVal} is nice and lends us 1. If you have ${sourceVal} and give 1 away, how many are left?`
                    },
                    speech: {
                        es: `${contextES}El ${sourceVal} nos presta uno. Si a ${sourceVal} le quitamos uno, ¿cuánto queda?`,
                        en: `${contextEN}The ${sourceVal} lends one. If we take one from ${sourceVal}, what is left?`
                    }
                });

                // Mutate Source & Update Visuals
                n1Arr[sourceIdx] = newVal;
                const sourceColIdx = maxLen - 1 - sourceIdx;
                currentBorrows.push({ colIndex: sourceColIdx, newValue: newVal.toString() });

                // [Step B] Handle Intermediate Zeros (Chain)
                for (let k = sourceIdx + 1; k < i; k++) {
                    const zColIdx = maxLen - 1 - k;

                    // STEP B1: SHOW THE "10" ARRIVING
                    steps.push({
                        operand1: str1, operand2: str2, operator: '-', result: resultStr, carry: '',
                        highlight: 'result', // ⚡ AUTO-ADVANCE
                        columnIndex: zColIdx,
                        visualData: {
                            operands: [str1, str2],
                            borrows: [...currentBorrows],
                            helpers: [{ colIndex: zColIdx, value: '1' }]
                        },
                        message: {
                            es: `¡El vecino ${n1Arr[k - 1] === 9 ? '9' : n1Arr[sourceIdx]} le pasa 1 al 0! Mira, el 0 se convirtió en un 10.`,
                            en: `Neighbor ${n1Arr[k - 1] === 9 ? '9' : n1Arr[sourceIdx]} passes 1 to the 0! Look, the 0 became a 10.`
                        },
                        speech: {
                            es: `¡Mira! Con el uno que llegó, el cero ahora es un diez.`,
                            en: `Look! With the one that arrived, the zero is now a ten.`
                        }
                    });

                    // STEP B2: SHOW THE TRANSFORMATION TO 9
                    steps.push({
                        operand1: str1, operand2: str2, operator: '-', result: resultStr, carry: '',
                        highlight: 'n1', columnIndex: zColIdx,
                        visualData: {
                            operands: [str1, str2],
                            borrows: [...currentBorrows],
                            helpers: [{ colIndex: zColIdx, value: '1' }],
                            correctValue: 9
                        },
                        message: {
                            es: `Pero este 10 también debe ayudar al siguiente. Si al 10 le quitamos 1, ¿cuánto queda?`,
                            en: `But this 10 must also help the next one. If we take 1 from 10, what is left?`
                        },
                        speech: {
                            es: `Pero este diez es generoso y le da uno al siguiente. ¿Cuánto le queda?`,
                            en: `But this ten is generous and gives one to the next. What is left?`
                        }
                    });

                    // Mutate Zero & Update Visuals
                    n1Arr[k] = 9;
                    currentBorrows.push({ colIndex: zColIdx, newValue: '9' });
                }

                // STEP C: Final Update for Current Digit (Receive 10) - SHOW IT ARRIVING
                const finalColIdx = maxLen - 1 - i;
                steps.push({
                    operand1: str1, operand2: str2, operator: '-', result: resultStr, carry: '',
                    highlight: 'result', // ⚡ AUTO-ADVANCE
                    columnIndex: finalColIdx,
                    visualData: {
                        operands: [str1, str2],
                        borrows: [...currentBorrows],
                        helpers: [{ colIndex: finalColIdx, value: '1' }]
                    },
                    message: {
                        es: `¡Por fin llegó el 1 hasta aquí! Ahora el ${digit1} se convirtió en un ${digit1 + 10}.`,
                        en: `The 1 finally reached us! Now the ${digit1} became a ${digit1 + 10}.`
                    },
                    speech: {
                        es: `¡Genial! Con el uno que llegó, ahora tenemos ${numberToSpanish(digit1 + 10)}.`,
                        en: `Great! With the one that arrived, now we have ${digit1 + 10}.`
                    }
                });

                digit1 += 10;
                n1Arr[i] = digit1;
            }
        }

        const diff = digit1 - digit2;
        const resultStrBefore = resultStr;
        resultStr = diff + resultStr;

        // Step 1: Main Column Question
        steps.push({
            operand1: str1, operand2: str2, operator: '-', result: resultStrBefore, carry: '',
            highlight: 'n1', columnIndex: maxLen - 1 - i,
            visualData: {
                operands: [str1, str2],
                correctValue: diff,
                borrows: [...currentBorrows],
                helpers: (digit1 >= 10) ? [{ colIndex: maxLen - 1 - i, value: '1' }] : undefined
            },
            message: {
                es: `Ahora tenemos ${digit1}. ¿Cuánto es ${digit1} menos ${digit2}?`,
                en: `Now we have ${digit1}. What is ${digit1} minus ${digit2}?`
            },
            speech: {
                es: `Ahora el número es ${numberToSpanish(digit1)}. ¿Cuánto es ${numberToSpanish(digit1)} menos ${numberToSpanish(digit2)}?`,
                en: `Now the number is ${digit1}. What is ${digit1} minus ${digit2}?`
            }
        });

        // Step 2: Feedback (Show Answer)
        steps.push({
            operand1: str1, operand2: str2, operator: '-', result: resultStr, carry: '',
            highlight: 'result', columnIndex: maxLen - 1 - i,
            visualData: {
                operands: [str1, str2],
                borrows: [...currentBorrows],
                helpers: (digit1 >= 10) ? [{ colIndex: maxLen - 1 - i, value: '1' }] : undefined
            },
            message: { es: `¡Correcto! ${digit1} - ${digit2} = ${diff}.`, en: `Correct! ${digit1} - ${digit2} = ${diff}.` },
            speech: { es: `Correcto, es ${numberToSpanish(diff)}.`, en: `Correct, it is ${diff}.` }
        });
    }

    // Remove leading zeros
    resultStr = parseInt(resultStr).toString();

    steps[steps.length - 1].highlight = 'done';
    steps[steps.length - 1].result = resultStr;
    steps[steps.length - 1].message = {
        es: `¡Perfecto! ${num1} - ${num2} = ${resultStr}`,
        en: `Perfect! ${num1} - ${num2} = ${resultStr}`
    };
    steps[steps.length - 1].speech = {
        es: `¡Perfecto! ${numberToSpanish(num1)} menos ${numberToSpanish(num2)} es igual a ${numberToSpanish(parseInt(resultStr))}`,
        en: `Perfect! ${num1} minus ${num2} equals ${resultStr}`
    };

    return steps;
}

/**
 * Helper: Get column name in Spanish/English
 */
function getColumnName(index: number): string {
    const names = ['unidades', 'decenas', 'centenas', 'unidades de mil', 'decenas de mil'];
    return names[index] || 'siguiente columna';
}

/**
 * Helper: Convert number to Spanish words (for better TTS)
 */
function numberToSpanish(num: number): string {
    const ones = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];

    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
        const ten = Math.floor(num / 10);
        const one = num % 10;
        return one === 0 ? tens[ten] : `${tens[ten]} y ${ones[one]}`;
    }

    // For larger numbers, use formatted string
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Parse a math problem string (e.g., "123 + 456" or "789 - 234")
 */
export function parseMathProblem(problem: string): {
    num1: number;
    num2: number;
    operator: '+' | '-' | '×' | '÷';
    operands?: number[];
} | null {
    // 🛡️ WORD PROBLEM GUARD (The "Sentence" Check)
    // If text is long and has words, IT IS A WORD PROBLEM.
    // The previous regexes were catching "2/5" inside text like "gastaron 2/5 de lo que había".
    const hasWords = /[a-zA-ZñÑáéíóúÁÉÍÓÚ]/.test(problem);
    if (problem.length > 20 && hasWords && !problem.includes('=') && !/calc|resuelve|solve/i.test(problem)) {
        return null;
    }

    // 0. Parentheses: (12 + 8) × 3 or (20-5)/3 - evaluate inner, then outer
    const parenMatch = problem.match(/\(\s*(\d+(?:\.\d+)?)\s*([+\-×x*÷/])\s*(\d+(?:\.\d+)?)\s*\)\s*([×x*÷/+\-])\s*(\d+(?:\.\d+)?)/);
    if (parenMatch) {
        const a = parseFloat(parenMatch[1]);
        const b = parseFloat(parenMatch[3]);
        const innerOp = parenMatch[2].replace(/[x*]/g, '×').replace(/\//g, '÷');
        let inner = 0;
        if (innerOp === '+') inner = a + b;
        else if (innerOp === '-') inner = a - b;
        else if (innerOp === '×') inner = a * b;
        else if (innerOp === '÷') inner = b !== 0 ? a / b : 0;
        const outerOp = (parenMatch[4].replace(/[x*]/g, '×').replace(/\//g, '÷')) as '+' | '-' | '×' | '÷';
        const c = parseFloat(parenMatch[5]);
        return { num1: inner, num2: c, operator: outerOp };
    }

    // 1. Multiple addition (e.g. "12.5 + 34.2 + 56.1") - only when no minus or slashes (fractions)
    const allNums = problem.match(/\d+(\.\d+)?/g);
    if (problem.includes('+') && !problem.includes('-') && !problem.includes('/') && allNums && allNums.length > 2) {
        const nums = allNums.map(Number);
        return { num1: nums[0], num2: nums[1], operator: '+', operands: nums };
    }

    // 1b. Chained add-subtract: "25 + 18 - 10" -> take first op (25 + 18)
    const addSubMatch = problem.match(/^(\d+(?:\.\d+)?)\s*([+])\s*(\d+(?:\.\d+)?)(?:\s*[-]\s*\d+)?/);
    if (addSubMatch) return { num1: parseFloat(addSubMatch[1]), num2: parseFloat(addSubMatch[3]), operator: '+' };

    // 2. Pair operations (more flexible regexes to catch inside text)
    // IMPORTANT: If it looks like a fraction equation (multiple slashes or fraction pattern), 
    // we SKIP this simple pair detection so generateStepsForProblem can handle it correctly.
    const isFractionEquation = (problem.match(/\//g) || []).length >= 2 || /(\d+)\/\d+[\+\-\*]/.test(problem.replace(/\s+/g, ''));

    const mulMatch = !isFractionEquation ? problem.match(/(-?\d+(?:\.\d+)?)\s*[×x*]\s*(-?\d+(?:\.\d+)?)/i) : null;
    const divMatch = !isFractionEquation ? problem.match(/(-?\d+(?:\.\d+)?)\s*[÷/]\s*(-?\d+(?:\.\d+)?)/i) : null;
    const addMatch = !isFractionEquation ? problem.match(/(-?\d+(?:\.\d+)?)\s*[+]\s*(-?\d+(?:\.\d+)?)/) : null;
    const subMatch = !isFractionEquation ? problem.match(/(-?\d+(?:\.\d+)?)\s*[-]\s*(-?\d+(?:\.\d+)?)/) : null;

    if (mulMatch) {
        const n1 = parseFloat(mulMatch[1]), n2 = parseFloat(mulMatch[2]);
        if (n1 < 0 || n2 < 0) return null; // Delegate to AlgorithmicTutor for negative numbers
        return { num1: n1, num2: n2, operator: '×' };
    }
    if (divMatch) {
        const n1 = parseFloat(divMatch[1]), n2 = parseFloat(divMatch[2]);
        if (n1 < 0 || n2 < 0) return null;
        return { num1: n1, num2: n2, operator: '÷' };
    }
    if (addMatch) {
        const n1 = parseFloat(addMatch[1]), n2 = parseFloat(addMatch[2]);
        if (n1 < 0 || n2 < 0) return null;
        return { num1: n1, num2: n2, operator: '+' };
    }
    if (subMatch) {
        const n1 = parseFloat(subMatch[1]), n2 = parseFloat(subMatch[2]);
        if (n1 < 0 || n2 < 0) return null;
        return { num1: n1, num2: n2, operator: '-' };
    }

    // 3. Geometry & Word Problems (Greedy detection)
    /* 
       DISABLED: Previously, this block was catching words like "metro" and "largo" and forcing a 0+0 geometry step.
       Now we let the Socratic AI handle context-heavy geometry verbal problems.
    */
    /*
    const geoKeywords = /(perimetro|área|area|perímetro|fracción|fraccion|mcm|lcm|metro|largo|ancho)/i;
    const hasNumbers = /(\d+)/.test(problem);

    if (geoKeywords.test(problem) && hasNumbers) {
        // Return a dummy object just to trigger the internalAnalyzeText flow
        return { num1: 0, num2: 0, operator: '+' };
    }
    */

    return null;
}

// --- 🔢 MULTIPLICATION ---
/**
 * Generates all steps for solving a vertical multiplication problem
 */
export function generateMultiplicationSteps(num1: number, num2: number, grade?: number): VerticalOpStep[] {
    const steps: VerticalOpStep[] = [];

    // 🌟 SPECIAL STRATEGY FOR 2ND GRADE: Visual Groups
    if (grade === 2 && num1 <= 10 && num2 <= 10) {
        steps.push({
            operand1: num1.toString(),
            operand2: num2.toString(),
            operator: '×',
            result: (num1 * num2).toString(),
            carry: '',
            columnIndex: 0,
            highlight: 'intro',
            message: {
                es: `¡Misión Tablas de Multiplicar! 🚀\n\nMultiplicar **${num1} × ${num2}** es lo mismo que decir que tenemos **${num1} grupos de ${num2}**. ¡Mira el tablero! ✨`,
                en: `Times Tables Mission! 🚀\n\nMultiplying **${num1} × ${num2}** is the same as saying we have **${num1} groups of ${num2}**. Look at the board! ✨`
            },
            speech: {
                es: `Multiplicar ${num1} por ${num2} es como tener ${num1} grupos de ${num2}. ¡Cúentalos en el tablero!`,
                en: `Multiplying ${num1} by ${num2} is like having ${num1} groups of ${num2}. Count them on the board!`
            },
            visualType: 'multi_groups',
            visualData: { numGroups: num1, itemsPerGroup: num2, itemType: "⭐" },
            detailedExplanation: {
                es: "La multiplicación es una suma repetida. Ver los grupos ayuda a entender el concepto.",
                en: "Multiplication is repeated addition. Seeing groups helps understand the concept."
            }
        });
        return steps;
    }

    const str1 = num1.toString();
    const str2 = num2.toString();



    const finalResult = (num1 * num2).toString();
    const partialProducts: string[] = [];
    const multiplierDigits = str2.split('').map(Number).reverse();

    // For each digit in the multiplier
    for (let j = 0; j < multiplierDigits.length; j++) {
        const mDigit = multiplierDigits[j];
        let carry = 0;
        let currentPP = ''; // Current partial product string (un-shifted)

        // Instructional context strings (units vs tens/hundreds)
        let rowIntroES = "";
        let rowIntroEN = "";

        // Introduction logic to explain the "distributive" concept to the child
        if (j === 0) {
            // First row (Units)
            // Explanation: The bottom unit visits everyone upstairs
            rowIntroES = `¡Hora de multiplicar! El ${mDigit} (unidades) debe multiplicar a todos los números de arriba, uno por uno, empezando por la derecha. `;
            rowIntroEN = `Time to multiply! The ${mDigit} (ones) must multiply every number on top, one by one, starting from the right. `;
        } else {
            // Subsequent rows
            const placeNameES = j === 1 ? 'decenas' : 'centenas';
            const placeNameEN = j === 1 ? 'tens' : 'hundreds';
            // Explanation: different value, reminder of the zero/space
            rowIntroES = `¡Turno del ${mDigit}! Como está en las ${placeNameES}, este ${mDigit} vale más. Por eso ponemos un 0 (o dejamos un espacio) antes de empezar. Ahora, el ${mDigit} también multiplica a todos los de arriba. `;
            rowIntroEN = `Turn for the ${mDigit}! Since it's in the ${placeNameEN}, this ${mDigit} is worth more. That's why we put a 0 (or leave a space) before starting. Now, the ${mDigit} also multiplies everyone on top. `;
        }

        // Multiply multiplicand by mDigit
        for (let i = str1.length - 1; i >= 0; i--) {
            const digit = parseInt(str1[i]);
            const product = digit * mDigit + carry;
            const resDigit = product % 10;
            const nextCarry = Math.floor(product / 10);

            const ppLineBefore = currentPP;
            currentPP = resDigit + currentPP;

            // Determine if we should include the intro message on this specific step?
            // Yes, ONLY if it is the very first calculation of the row (i === str1.length - 1).
            const isFirstStepOfRow = (i === str1.length - 1);
            const prefixES = isFirstStepOfRow ? rowIntroES : "";
            const prefixEN = isFirstStepOfRow ? rowIntroEN : "";

            // Dynamic question text
            // If it's the first step, we merge the intro.
            // "Time to multiply! ... Starting from the right. How much is 3 x 4?"
            // For subsequent steps, we can simply ask the math question or give a tiny nudge "Now the next one: ..."
            let questionES = `¿Cuánto es ${digit} × ${mDigit}${carry > 0 ? ` + ${carry} (que llevamos)` : ''}?`;
            let questionEN = `What is ${digit} × ${mDigit}${carry > 0 ? ` + ${carry} (carried)` : ''}?`;

            if (!isFirstStepOfRow) {
                // Add a small connector for flow
                questionES = `Sigamos: ${questionES}`;
                questionEN = `Next: ${questionEN}`;
            }

            // Step: Question
            steps.push({
                operand1: str1, operand2: str2, operator: '×', result: '', carry: carry > 0 ? carry.toString() : '',
                highlight: 'n1', columnIndex: str1.length - 1 - i,
                visualData: {
                    operands: [str1, str2, ...partialProducts, ppLineBefore.padEnd(ppLineBefore.length + j, '0')],
                    operator: '×',
                    highlightDigit: { row: 0, col: str1.length - 1 - i }, // Corrected: Col is 0-based from Right
                    multiplierDigit: { row: 1, col: j }, // Corrected: j is already 0-based from Right (Units=0)
                    correctValue: product // Validation matches the FULL product (e.g. 10 for 5*2)
                },
                message: {
                    es: `${prefixES}${questionES}`,
                    en: `${prefixEN}${questionEN}`
                },
                speech: {
                    es: `${prefixES}¿Cuánto es ${numberToSpanish(digit)} por ${numberToSpanish(mDigit)}${carry > 0 ? ` más ${numberToSpanish(carry)} que llevamos` : ''}?`,
                    en: `${prefixEN}What is ${digit} times ${mDigit}${carry > 0 ? ` plus ${carry} we're carrying` : ''}?`
                }
            });

            // Step: Feedback
            const isLastDigit = (i === 0);
            const feedbackPP = isLastDigit && nextCarry > 0 ? (nextCarry + currentPP) : currentPP;

            steps.push({
                operand1: str1, operand2: str2, operator: '×', result: '', carry: nextCarry > 0 ? nextCarry.toString() : '',
                highlight: 'result', columnIndex: str1.length - 1 - i,
                visualData: {
                    operands: [str1, str2, ...partialProducts, feedbackPP.padEnd(feedbackPP.length + j, '0')],
                    operator: '×'
                },
                message: {
                    es: isLastDigit && nextCarry > 0
                        ? `¡Correcto! Ponemos el ${product}.`
                        : `¡Bien! Ponemos el ${resDigit}${nextCarry > 0 ? ` y llevamos ${nextCarry}` : ''}.`,
                    en: isLastDigit && nextCarry > 0
                        ? `Correct! We put ${product}.`
                        : `Good! We put ${resDigit}${nextCarry > 0 ? ` and carry ${nextCarry}` : ''}.`
                },
                speech: {
                    es: `Correcto.`,
                    en: `Correct.`
                }
            });

            carry = nextCarry;
        }

        // Add the finished (and potentially leading-zero padded for alignment) partial product to the list
        partialProducts.push(currentPP.padEnd(currentPP.length + j, '0'));
    }


    // If we have multiple partial products, we must sum them interactively
    if (partialProducts.length > 1) {
        let carry = 0;
        let runningResult = "";

        // Determine the maximum length among partial products for column iteration
        const maxLength = Math.max(...partialProducts.map(s => s.length));

        // Loop from right (units) to left
        for (let i = 0; i < maxLength; i++) {
            let columnSum = carry;
            const digitTerms: number[] = [];

            // Sum digits at this column position (i) for all partial products
            // Partial products are strings aligned to the right (effectively).
            // Actually, in our logic `partialProducts` strings are like "24" and "120".
            // Since they are strings, index 0 is left-most. We want index from the RIGHT.
            for (const pp of partialProducts) {
                const digitIndexFromRight = i;
                const charIndex = pp.length - 1 - digitIndexFromRight;

                if (charIndex >= 0) {
                    const val = parseInt(pp[charIndex]);
                    columnSum += val;
                    if (val > 0 || pp.length > i + 1) {
                        // Only add to terms if it's a significant digit or part of the number structure
                        // Actually, just add it if it exists to be explicit.
                        digitTerms.push(val);
                    } else if (digitTerms.length === 0 && val === 0) {
                        // Keep 0 if it's the only thing (e.g. 0+0)
                        digitTerms.push(0);
                    }
                }
            }

            // If no terms found (e.g. beyond length of all numbers?), break (shouldn't happen with maxLength logic)
            if (digitTerms.length === 0 && carry === 0) continue;

            // Calculate result digit and new carry
            const resDigit = columnSum % 10;
            const nextCarry = Math.floor(columnSum / 10);

            // Current visual result string (building from right to left)
            const resultSoFar = resDigit + runningResult;

            // Build User Question
            // e.g. "0 + 4" or "2 + 1 + 1 (carry)"
            let termsStr = digitTerms.join(' + ');
            if (digitTerms.length < 2 && carry === 0 && digitTerms.length > 0) {
                // Single number drop down? Usually we just say "And the 1 drops down".
                // But consistently asking "What is 1?" is fine too for kids.
            }
            const sumExpr = termsStr + (carry > 0 ? ` + ${carry}` : '');

            const prefixES = i === 0 ? "¡Ahora sumamos los resultados parciales! " : "";
            const prefixEN = i === 0 ? "Now let's add the partial results! " : "";

            // Step: Question for this column sum
            steps.push({
                operand1: str1, operand2: str2,
                operator: '×',
                result: runningResult, // Show what we have solved so far (to the right of current col)
                carry: carry > 0 ? carry.toString() : '',
                highlight: 'n1',
                columnIndex: i, // Matches column index logic usually
                visualData: {
                    operands: [str1, str2, ...partialProducts],
                    result: runningResult, // Previous result
                    operator: '×',
                    correctValue: columnSum // Validation expects full sum (e.g. 15)
                },
                message: {
                    es: `${prefixES}En la columna de las ${i === 0 ? 'unidades' : i === 1 ? 'decenas' : 'siguientes'}, ¿cuánto es ${sumExpr}?`,
                    en: `${prefixEN}In the ${i === 0 ? 'ones' : i === 1 ? 'tens' : 'next'} column, what is ${sumExpr}?`
                },
                speech: {
                    es: `${prefixES}Suma ${sumExpr.replace(/\+/g, 'más')}.`,
                    en: `${prefixEN}Add ${sumExpr.replace(/\+/g, 'plus')}.`
                }
            });

            // Step: Feedback / Update Result
            // Update running result to include the new digit
            runningResult = resultSoFar;

            steps.push({
                operand1: str1, operand2: str2, operator: '×', result: runningResult,
                carry: nextCarry > 0 ? nextCarry.toString() : '',
                highlight: 'result',
                columnIndex: i,
                visualData: {
                    operands: [str1, str2, ...partialProducts],
                    result: runningResult,
                    operator: '×'
                },
                message: {
                    es: `¡Bien! Ponemos el ${resDigit}${nextCarry > 0 ? ` y llevamos ${nextCarry}` : ''}.`,
                    en: `Good! Post ${resDigit}${nextCarry > 0 ? ` and carry ${nextCarry}` : ''}.`
                },
                speech: { es: "Bien.", en: "Good." }
            });

            carry = nextCarry;
        }

        // Handle remaining carry if any (e.g. 99 * 99 -> last sum has carry)
        if (carry > 0) {
            runningResult = carry + runningResult;
            // Final update step to show the full number including last carry
            steps.push({
                operand1: str1, operand2: str2, operator: '×', result: runningResult, carry: '', highlight: 'result', columnIndex: maxLength,
                visualData: { operands: [str1, str2, ...partialProducts], result: runningResult, operator: '×' },
                message: {
                    es: `Y bajamos el ${carry}.`,
                    en: `And we bring down the ${carry}.`
                },
                speech: { es: `Bajamos el ${carry}.`, en: `Bring down the ${carry}.` }
            });
        }

        // Final Celebration Step
        steps.push({
            operand1: str1, operand2: str2, operator: '×', result: runningResult, carry: '', highlight: 'done', columnIndex: 0,
            visualData: {
                operands: [str1, str2, ...partialProducts],
                result: runningResult,
                operator: '×'
            },
            message: {
                es: `¡Excelente trabajo! El resultado final es ${runningResult}.`,
                en: `Excellent work! The final result is ${runningResult}.`
            },
            speech: {
                es: `¡Fantástico! Ya tienes el resultado final. ${numberToSpanish(num1)} por ${numberToSpanish(num2)} es ${numberToSpanish(parseInt(runningResult))}.`,
                en: `Fantastic! You have the final result. ${num1} times ${num2} is ${runningResult}.`
            }
        });

    } else {
        // Single row multiplication (no addition needed)
        steps.push({
            operand1: str1, operand2: str2, operator: '×', result: finalResult, carry: '', highlight: 'done', columnIndex: 0,
            visualData: {
                operands: [str1, str2, ...partialProducts],
                result: finalResult,
                operator: '×'
            },
            message: {
                es: `¡Excelente trabajo! El resultado es ${finalResult}.`,
                en: `Excellent work! The result is ${finalResult}.`
            },
            speech: {
                es: `¡Fantástico! ${numberToSpanish(num1)} por ${numberToSpanish(num2)} es ${numberToSpanish(parseInt(finalResult))}.`,
                en: `Fantastic! ${num1} times ${num2} is ${finalResult}.`
            }
        });
    }

    return steps;
}

/**
 * Generates all steps for solving a division problem
 */
export function generateDivisionSteps(dividend: number, divisor: number): VerticalOpStep[] {
    const steps: VerticalOpStep[] = [];

    if (divisor === 0) {
        return [{
            operand1: dividend.toString(), operand2: divisor.toString(), operator: '÷', result: '', carry: '', highlight: 'n2', columnIndex: 0,
            message: { es: '¡No podemos dividir entre cero!', en: 'We cannot divide by zero!' },
            speech: { es: '¡No podemos dividir entre cero!', en: 'We cannot divide by zero!' }
        }];
    }

    const dividendStr = dividend.toString();
    const divisorStr = divisor.toString();
    let currentRemainder = 0;
    let quotientStr = "";

    // STEP 1: IDENTIFY
    steps.push({
        operand1: dividendStr, operand2: divisorStr, operator: '÷', result: '?', carry: '', columnIndex: 0,
        highlight: 'setup', visualType: 'division',
        visualData: { dividend: dividendStr, divisor: divisorStr, highlight: 'dividend', correctValue: 'sí' },
        message: {
            es: `¡Hola! 👋 Vamos a aprender a dividir paso a paso.\n\n¿Qué número vamos a repartir hoy? Es el **${dividendStr}**, ¿verdad?`,
            en: `Hi! 👋 Let's learn to divide step by step.\n\nWhat number are we sharing today? It's **${dividendStr}**, right?`
        },
        speech: { es: `Hola. Vamos a aprender a dividir. El número grande es el ${dividendStr}.`, en: `Hi. Let's learn to divide. The big number is ${dividendStr}.` }
    });

    steps.push({
        operand1: dividendStr, operand2: divisorStr, operator: '÷', result: '?', carry: '', columnIndex: 0,
        highlight: 'setup', visualType: 'division',
        visualData: {
            dividend: dividendStr,
            divisor: divisorStr,
            highlight: 'divisor',
            correctValue: divisor
        },
        message: {
            es: `¡Muy bien! El **${dividendStr}** va adentro de la casita. ¿Y en cuántas partes lo vamos a repartir?`,
            en: `Great! The **${dividendStr}** goes inside the house. And how many parts are we sharing it into?`
        },
        speech: { es: `El número va adentro de la casita. ¿Entre cuántos lo vamos a repartir?`, en: `The number goes inside. How many parts?` }
    });

    // STEP 2: LOOK AT DIGITS (Socratic discovery of how many digits to take)
    let currentPartIdx = 0;
    let currentPartStr = dividendStr[0];
    let currentPart = parseInt(currentPartStr);

    if (currentPart < divisor && dividendStr.length > 1) {
        // Initial question for 1st digit
        steps.push({
            operand1: dividendStr, operand2: divisorStr, operator: '÷', result: '?', carry: '', columnIndex: 0,
            highlight: 'n1', visualType: 'division',
            visualData: {
                dividend: dividendStr, divisor: divisorStr,
                highlight: 'dividend', highlightPart: currentPart,
                correctValue: 'no'
            },
            message: {
                es: `Miremos el primer número: es el **${currentPart}**. ¿El **${divisor}** cabe en el **${currentPart}**?`,
                en: `Look at the first number: it's **${currentPart}**. Does **${divisor}** fit in **${currentPart}**?`
            },
            speech: { es: `Miremos el primer número. ¿El ${divisor} cabe dentro del ${currentPart}?`, en: `Look at the first number. Does it fit?` }
        });

        // Loop to find enough digits
        while (currentPart < divisor && currentPartIdx < dividendStr.length - 1) {
            currentPartIdx++;
            currentPartStr = dividendStr.substring(0, currentPartIdx + 1);
            currentPart = parseInt(currentPartStr);

            const isLastAttempt = currentPart >= divisor || currentPartIdx === dividendStr.length - 1;

            steps.push({
                operand1: dividendStr, operand2: divisorStr, operator: '÷', result: '?', carry: '', columnIndex: 0,
                highlight: 'n1', visualType: 'division',
                visualData: {
                    dividend: dividendStr, divisor: dividendStr,
                    highlight: 'dividend', highlightPart: currentPart,
                    correctValue: isLastAttempt ? 'sí' : 'no'
                },
                message: {
                    es: `Como no cabe, miremos los **${currentPartIdx + 1}** primeros: **${currentPart}**. ¿Ahora sí cabe?`,
                    en: `Since it doesn't fit, let's look at the first **${currentPartIdx + 1}**: **${currentPart}**. Does it fit now?`
                },
                speech: { es: `Tomamos ${currentPartIdx + 1} números. Ahora es el ${currentPart}. ¿Acaso cabe el ${divisor} dentro de ${currentPart}?`, en: `Take ${currentPartIdx + 1} numbers. Does it fit now?` }
            });
        }
    }

    const subtractionHistory: any[] = [];

    for (let i = 0; i < dividendStr.length; i++) {
        if (dividendStr[i] === '.' || dividendStr[i] === ',') {
            quotientStr += ".";
            steps.push({
                operand1: dividendStr, operand2: divisorStr, operator: '÷', result: quotientStr, carry: '', highlight: 'result', columnIndex: i,
                visualType: 'division',
                visualData: { dividend: dividendStr, divisor: divisorStr, quotient: quotientStr, highlight: 'quotient', correctValue: 'sí' },
                message: {
                    es: `¡Llegamos al punto! Lo subimos directamente al resultado. ✨ ¿Lo ves arriba?`,
                    en: `We reached the decimal point! We bring it straight up to the result. ✨ See it up there?`
                },
                speech: { es: "Subimos el punto al resultado.", en: "Bring the point up." }
            });
            continue;
        }

        const digit = parseInt(dividendStr[i]);
        const currentVal = currentRemainder * 10 + digit;
        const qDigit = Math.floor(currentVal / divisor);

        // Skip leading zeros
        if (quotientStr === "" && qDigit === 0 && i < dividendStr.length - 1) {
            currentRemainder = currentVal;
            continue;
        }

        // STEP 3: CALCULATE DIGIT
        steps.push({
            operand1: dividendStr, operand2: divisorStr, operator: '÷', result: quotientStr + '?', columnIndex: i,
            highlight: 'n1', visualType: 'division', carry: '',
            visualData: {
                dividend: dividendStr, divisor: divisorStr, quotient: quotientStr + '_',
                remainder: currentVal.toString(),
                highlight: 'dividend', highlightPart: currentVal, correctValue: qDigit,
                history: [...subtractionHistory]
            },
            message: {
                es: quotientStr === ""
                    ? `¿Cuántas veces cabe el **${divisor}** en el **${currentVal}**?`
                    : `Bajamos el **${digit}**. Ahora tenemos **${currentVal}**. ¿Cuántas veces cabe el **${divisor}** aquí?`,
                en: quotientStr === ""
                    ? `How many times does **${divisor}** fit in **${currentVal}**?`
                    : `Bring down **${digit}**. Now we have **${currentVal}**. How many times does **${divisor}** fit?`
            },
            speech: { es: `¿Cuántas veces cabe el ${divisor} dentro del ${currentVal}?`, en: `How many times?` },
            hint: {
                es: `Piensa: ${divisor} × algo = cerca de ${currentVal}. ¡Sin pasarse!`,
                en: `Think: ${divisor} × something = close to ${currentVal}. Don't go over!`
            }
        });

        quotientStr += qDigit.toString();
        const product = qDigit * divisor;
        const newRemainder = currentVal - product;

        // STEP 4: MULTIPLY
        steps.push({
            operand1: dividendStr, operand2: divisorStr, operator: '÷', result: quotientStr, columnIndex: i,
            highlight: 'result', visualType: 'division', carry: '',
            visualData: {
                dividend: dividendStr, divisor: divisorStr, quotient: quotientStr,
                remainder: currentVal.toString(),
                highlight: 'quotient', correctValue: product,
                history: [...subtractionHistory]
            },
            message: {
                es: `¡Muy bien! Escribimos el **${qDigit}** arriba. Ahora, para ver cuánto restamos, debemos multiplicar: ¿Cuánto es **${qDigit}** × **${divisor}**?`,
                en: `Great! We write **${qDigit}** on top. Now, to see how much we subtract, we must multiply: What is **${qDigit}** × **${divisor}**?`
            },
            speech: {
                es: `Escribimos el ${qDigit} arriba. Ahora, ¿cuánto es ${numberToSpanish(qDigit)} por ${numberToSpanish(divisor)}?`,
                en: `We write ${qDigit} on top. Now, what is ${qDigit} times ${divisor}?`
            }
        });

        // STEP 5: SUBTRACT
        steps.push({
            operand1: dividendStr, operand2: divisorStr, operator: '÷', result: quotientStr, columnIndex: i,
            highlight: 'product', visualType: 'division', carry: '',
            visualData: {
                dividend: dividendStr, divisor: divisorStr, quotient: quotientStr,
                remainder: currentVal.toString(),
                product: product.toString(), highlight: 'dividend', highlightPart: currentVal,
                correctValue: newRemainder,
                history: [...subtractionHistory]
            },
            message: {
                es: `¡Eso es! Ponemos el **${product}** abajo. Ahora restamos para ver cuánto sobra: **${currentVal}** - **${product}**. ¿Cuánto nos queda?`,
                en: `That's it! Put **${product}** below. Now subtract to see what's left: **${currentVal}** - **${product}**. What's left?`
            },
            speech: { es: `Restamos ${currentVal} menos ${product}.`, en: `Subtract them.` }
        });

        // STEP 6: RESULT OF SUBTRACTION (Feedback step)
        steps.push({
            operand1: dividendStr, operand2: divisorStr, operator: '÷', result: quotientStr, columnIndex: i,
            highlight: 'remainder', visualType: 'division', carry: '',
            visualData: {
                dividend: dividendStr, divisor: divisorStr, quotient: quotientStr,
                product: product.toString(), remainder: newRemainder.toString(),
                highlight: 'remainder', correctValue: 'sí',
                history: [...subtractionHistory]
            },
            message: {
                es: `¡Excelente! Sobran **${newRemainder}**. ¿Seguimos con el siguiente paso?`,
                en: `Excellent! Remainder is **${newRemainder}**. Shall we continue?`
            },
            speech: { es: `Sobran ${newRemainder}. ¿Continuamos?`, en: `Remainder ${newRemainder}. Continue?` }
        });

        subtractionHistory.push({
            val: currentVal.toString(),
            product: product.toString(),
            remainder: newRemainder.toString(),
            columnIndex: i
        });

        currentRemainder = newRemainder;
    }

    // FINAL STEPS: EXPLAIN & CHECK
    const finalQuotient = quotientStr;
    const finalRemainder = currentRemainder;

    steps.push({
        operand1: dividendStr, operand2: divisorStr, operator: '÷', result: finalQuotient, columnIndex: 0,
        highlight: 'done', visualType: 'division', carry: '',
        visualData: {
            dividend: dividendStr, divisor: divisorStr, quotient: finalQuotient,
            remainder: finalRemainder.toString(), highlight: 'quotient', correctValue: 'sí',
            history: [...subtractionHistory]
        },
        message: {
            es: `¡Hemos terminado! 🥳 El número de arriba (**${finalQuotient}**) es el resultado (cociente).\n\nLo que sobró (**${finalRemainder}**) es el residuo. ¿Lo ves ahí abajo?`,
            en: `We are done! 🥳 The number on top (**${finalQuotient}**) is the result (quotient).\n\nWhat's left (**${finalRemainder}**) is the remainder. See it down there?`
        },
        speech: { es: `¡Terminamos! El resultado es ${finalQuotient}.`, en: `Finished! The answer is ${finalQuotient}.` }
    });

    // STEP 9: COMPROBAR
    const checkValue = (parseInt(finalQuotient || "0") * divisor) + finalRemainder;
    steps.push({
        operand1: dividendStr, operand2: divisorStr, operator: '÷', result: finalQuotient, columnIndex: 0,
        highlight: 'setup', visualType: 'division', carry: '',
        visualData: {
            dividend: dividendStr, divisor: divisorStr, quotient: finalQuotient,
            remainder: finalRemainder.toString(), highlight: 'dividend',
            correctValue: checkValue,
            history: [...subtractionHistory]
        },
        message: {
            es: `Vamos a comprobarlo: multiplicamos **${finalQuotient}** × **${divisor}** y sumamos **${finalRemainder}**.\n\n¿Cuánto nos da eso?`,
            en: `Let's check it: we multiply **${finalQuotient}** × **${divisor}** and add **${finalRemainder}**.\n\nWhat do we get?`
        },
        speech: { es: `Vamos a comprobar la cuenta. Multiplica y suma el residuo.`, en: `Let's check the result.` },
        hint: {
            es: `Si el resultado es igual a **${dividendStr}**, ¡entonces está perfecto!`,
            en: `If the result is **${dividendStr}**, then it is perfect!`
        }
    });

    // STEP 10: REFLEXION
    steps.push({
        operand1: dividendStr, operand2: divisorStr, operator: '÷', result: finalQuotient, columnIndex: 0,
        highlight: 'done', visualType: 'division', carry: '',
        visualData: {
            dividend: dividendStr, divisor: divisorStr, quotient: finalQuotient,
            remainder: finalRemainder.toString(), highlight: 'dividend',
            history: [...subtractionHistory]
        },
        message: {
            es: `¡Exacto! Nos da **${dividendStr}**, justo el número con el que empezamos. ¿Ves qué fácil es repartir en partes iguales? 😊🎉`,
            en: `Exactly! We get **${dividendStr}**, the exact number we started with. See how easy it is to share fairly? 😊🎉`
        },
        speech: { es: `¡Muy bien! Repartimos perfectamente.`, en: `Very well! We shared perfectly.` }
    });

    return steps;
}

// --- 🔢 DECIMAL OPERATIONS (NEW ANIMATED SOCRATIC FLOW) ---

export function generateDecimalSteps(num1OrArray: number | number[], optionalNum2: number, operator: '+' | '-' | '×' | '÷'): VerticalOpStep[] {
    const steps: VerticalOpStep[] = [];
    let numbers: number[] = [];
    if (Array.isArray(num1OrArray)) {
        numbers = num1OrArray;
    } else {
        numbers = [num1OrArray, optionalNum2];
    }
    const num1 = numbers[0];
    const num2 = numbers[1]; // Fallback for binary ops

    const s1 = num1.toString();
    const s2 = num2.toString();
    const p1 = s1.split('.');
    const p2 = s2.split('.');

    // --- 🔢 MULTIPLICATION DECIMAL CASE ---
    if (operator === '×') {
        const d1 = s1.includes('.') ? s1.split('.')[1].length : 0;
        const d2 = s2.includes('.') ? s2.split('.')[1].length : 0;
        const totalDecimals = d1 + d2;

        const int1 = Math.round(num1 * Math.pow(10, d1));
        const int2 = Math.round(num2 * Math.pow(10, d2));

        // STEP 1: MULTIPLY AS INTEGERS INTRO
        steps.push({
            operand1: s1, operand2: s2, operator: '×', result: '?', carry: '', columnIndex: 0,
            highlight: 'setup', visualType: 'vertical_op',
            visualData: { operands: [s1, s2], operator: '×', highlight: 'points' },
            message: {
                es: `¡Para multiplicar decimales tenemos un truco! 🪄 Primero, multiplicamos como si los puntos **no estuvieran ahí**. Como si fueran números normales.\n\n**¿Listos para multiplicar ${int1} × ${int2}?**`,
                en: `To multiply decimals, we have a trick! 🪄 First, we multiply as if the dots **weren't there**. Just like normal numbers.\n\n**Ready to multiply ${int1} × ${int2}?**`
            },
            speech: {
                es: `Primero multiplicamos como si fueran números normales. ¿Listos?`,
                en: `First we multiply as if they were normal numbers. Ready?`
            }
        });

        const intSteps = generateMultiplicationSteps(int1, int2);

        // Helper to format integer strings placeholder in multiplier logic
        const mapIntToDisplay = (intStr: string) => {
            if (!intStr || intStr === '?' || isNaN(Number(intStr))) return intStr;
            return intStr; // For multiplication, partial products are shown as integers on the board
        };

        // MAP CALCULATION STEPS
        intSteps.forEach((s) => {
            if (s.highlight === 'intro') return; // Skip the multi-groups intro if any

            steps.push({
                ...s,
                operand1: s1,
                operand2: s2,
                visualData: {
                    ...s.visualData,
                    operands: [s1, s2, ...(s.visualData?.operands?.slice(2) || [])],
                }
            });
        });

        // STEP: COUNT DECIMAL PLACES
        const lastIntRes = intSteps[intSteps.length - 1].result;
        steps.push({
            operand1: s1, operand2: s2, operator: '×', result: lastIntRes, carry: '', columnIndex: 0,
            highlight: 'points', visualType: 'vertical_op',
            visualData: { operands: [s1, s2], result: lastIntRes, operator: '×', highlight: 'points', correctValue: totalDecimals },
            message: {
                es: `¡Genial! Ahora recuperamos la magia de los puntos. ✨\n\nCuenta cuántos números hay después del punto en total (arriba y abajo juntos).\n\n**¿Cuántos lugares decimales hay en total?**`,
                en: `Great! Now let's bring back the magic of the dots. ✨\n\nCount how many numbers are after the decimal point in total (top and bottom together).\n\n**How many decimal places are there in total?**`
            },
            speech: {
                es: `Cuenta cuántos números hay después del punto en total. ¿Cuántos son?`,
                en: `Count how many numbers are after the point in total. How many?`
            }
        });

        // STEP: PLACING THE POINT (Saltitos)
        const finalRes = (num1 * num2).toFixed(totalDecimals);
        steps.push({
            operand1: s1, operand2: s2, operator: '×', result: finalRes, carry: '', columnIndex: 0,
            highlight: 'decimal_point', visualType: 'vertical_op',
            visualData: { operands: [s1, s2], result: finalRes, operator: '×', highlight: 'decimal_point' },
            message: {
                es: `¡Exacto! Contamos **${totalDecimals}** lugares desde la derecha y ponemos el punto. ¡Mira cómo salta! 🐸✨\n\nEl resultado final es **${finalRes}**.`,
                en: `Exactly! We count **${totalDecimals}** places from the right and place the dot. Watch it jump! 🐸✨\n\nThe final result is **${finalRes}**.`
            },
            speech: {
                es: `Contamos ${totalDecimals} lugares desde la derecha y ponemos el puntico. ¡Listo!`,
                en: `We count ${totalDecimals} places from the right and place the point. Done!`
            }
        });

        return steps;
    }

    // --- 🔢 DIVISION DECIMAL CASE ---
    if (operator === '÷') {
        let currentDividend = num1;
        let currentDivisor = num2;
        let shiftCount = 0;

        const sDiv = currentDivisor.toString();
        if (sDiv.includes('.')) {
            shiftCount = sDiv.split('.')[1].length;
            currentDividend = num1 * Math.pow(10, shiftCount);
            currentDivisor = num2 * Math.pow(10, shiftCount);

            steps.push({
                operand1: s1, operand2: s2, operator: '÷', result: '?', carry: '', columnIndex: 0,
                highlight: 'setup', visualType: 'division',
                message: {
                    es: `¡Oye! No podemos dividir si hay un punto en el divisor (el de afuera). 🛑\n\nPara quitarlo, lo movemos **${shiftCount}** lugares a la derecha en ambos números.\n\n**¿Cómo queda el dividendo después de mover el punto?**`,
                    en: `Hey! We can't divide if there's a dot in the divisor (the one outside). 🛑\n\nTo remove it, we move it **${shiftCount}** places to the right in both numbers.\n\n**What does the dividend become after moving the point?**`
                },
                speech: {
                    es: `No podemos dividir con un punto afuera. Lo movemos ${shiftCount} lugares en ambos. ¿En qué número se convierte el dividendo?`,
                    en: `We can't divide with a point outside. Move it ${shiftCount} places in both. What does the dividend become?`
                },
                visualData: { dividend: s1, divisor: s2, highlight: 'divisor', correctValue: currentDividend }
            });
        }

        // Generate base division steps
        // Now generateDivisionSteps is decimal-aware.
        const intSteps = generateDivisionSteps(currentDividend, currentDivisor);

        intSteps.forEach((s) => {
            steps.push({
                ...s,
                operand1: currentDividend.toString(),
                operand2: currentDivisor.toString(),
                visualData: {
                    ...s.visualData,
                    dividend: currentDividend.toString(),
                    divisor: currentDivisor.toString()
                }
            });
        });

        return steps;
    }

    // STEP 2: UNDERSTAND THE POINT
    const numListEs = numbers.map(n => `**${n}**`).join(' y ');
    const numListEn = numbers.map(n => `**${n}**`).join(' and ');
    steps.push({
        operand1: numbers[0].toString(),
        operand2: (numbers[1] || 0).toString(),
        operator: operator,
        result: '?',
        carry: '',
        columnIndex: 0,
        highlight: 'setup',
        visualType: 'vertical_op',
        visualData: { operands: numbers.map(n => n.toString()), operator, highlight: 'points', correctValue: parseFloat(p1[0] || '0') },
        message: {
            es: `¡Hola! 👋 Mira estos números: ${numListEs}. El puntico separa los enteros de las "partes pequeñas".\n\n**¿Qué número ves antes del punto en el primer número (${numbers[0]})?**`,
            en: `Hi! 👋 Look at these numbers: ${numListEn}. The little dot separates the whole numbers from the "small parts".\n\n**What number do you see before the dot in the first one (${numbers[0]})?**`
        },
        speech: {
            es: `¡Hola! Mira estos números. El puntico separa los enteros de las partes pequeñas. ¿Qué número ves antes del punto en el primero?`,
            en: `Hi! Look at these numbers. The little dot separates the whole numbers from the "small parts". What number do you see before the dot in the first one?`
        },
        hint: {
            es: `¡Cuidado! El número **después** del punto es el ${p1[1] || '0'}, pero yo te pregunté por el que está **antes** (a la izquierda) del puntico.`,
            en: `Careful! The number **after** the dot is ${p1[1] || '0'}, but I asked for the one **before** (to the left) of the dot.`
        }
    });

    // STEP 3: ALIGNMENT
    steps.push({
        operand1: numbers[0].toString(),
        operand2: numbers[1].toString(),
        operator: operator,
        result: '?',
        carry: '',
        columnIndex: 0,
        highlight: 'setup',
        visualType: 'vertical_op',
        visualData: { operands: numbers.map(n => n.toString()), operator, highlight: 'alignment', correctValue: 'sí' },
        message: {
            es: `¡Muy bien! Ahora, lo más importante es que los puntos estén **alineados**, como en un ascensor 🛗.\n\nHe puesto una **guía mágica** en la pizarra para ayudarte. **¿Están los punticos uno debajo del otro sobre la línea?**`,
            en: `Great! Now, the most important thing is that the dots must be **aligned**, just like in an elevator 🛗.\n\nI've placed a **magic guide line** on the board to help you. **Are the dots one below the other on the line?**`
        },
        speech: {
            es: `¡Muy bien! Ahora, lo más importante es que los puntos estén alineados. ¿Están los punticos uno debajo del otro?`,
            en: `Great! Now, the most important thing is that the dots must be aligned. Are the dots aligned one below the other?`
        }
    });

    // PRE-CALCULATION LOGIC: Padding with Zeros
    const decCounts = numbers.map(n => {
        const s = n.toString();
        return s.includes('.') ? s.split('.')[1].length : 0;
    });
    const maxDec = Math.max(...decCounts);
    const nPadded = numbers.map(n => n.toFixed(maxDec));

    // STEP 4: PADDING WITH ZEROS
    const needsPadding = decCounts.some(d => d !== maxDec);
    if (needsPadding && operator === '+') {
        steps.push({
            operand1: nPadded[0],
            operand2: nPadded[1],
            operator: operator,
            result: '?',
            carry: '',
            columnIndex: 0,
            highlight: 'setup',
            visualType: 'vertical_op',
            visualData: { operands: nPadded, operator, highlight: 'padding', correctValue: maxDec },
            message: {
                es: `¡Mira! Agregamos ceritos al final para que todos tengan la misma cantidad de números después del punto. Así es más fácil de ordenar.\n\n**¿Cuántos números hay después del punto ahora en todos?**`,
                en: `Look! We added zeros at the end so everyone has the same number of digits after the dot. This makes it easier to order.\n\n**How many numbers are after the dot now in all of them?**`
            },
            speech: {
                es: `¡Mira! Agregamos ceritos al final para que sea más fácil. ¿Cuántos números hay después del punto ahora?`,
                en: `Look! We added small zeros at the end to make it easier. How many numbers are after the dot now?`
            }
        });
    }

    // CALCULATION (As integers)
    const factor = Math.pow(10, maxDec);
    const intNumbers = numbers.map(n => Math.round(n * factor));

    let calcSteps = operator === '+' ? generateAdditionSteps(intNumbers) : generateSubtractionSteps(intNumbers[0], intNumbers[1]);

    // Filter out the initial setup steps from calcSteps to avoid duplication
    calcSteps = calcSteps.filter(s => s.highlight !== 'setup');

    // Helper to map integer string back to decimal string
    const toDecimalStr = (s: string) => {
        if (!s || s === '?' || isNaN(Number(s))) return s;
        const val = Number(s);
        const decVal = val / factor;
        return decVal.toFixed(maxDec);
    };

    // MAP CALCULATION STEPS
    calcSteps.forEach((s, idx) => {
        steps.push({
            ...s,
            operand1: nPadded[0],
            operand2: nPadded[1],
            result: toDecimalStr(s.result),
            visualType: 'vertical_op',
            visualData: {
                operands: nPadded,
                operator,
                result: toDecimalStr(s.result),
                carry: s.carry,
                highlight: s.highlight,
                columnIndex: s.columnIndex
            },
            message: s.message,
            speech: s.speech
        });
    });

    // STEP 6: DROP THE POINT (Reinforcement)
    const finalRes = toDecimalStr(calcSteps[calcSteps.length - 1].result);
    steps.push({
        operand1: nPadded[0],
        operand2: nPadded[1],
        operator: operator,
        result: finalRes,
        carry: '',
        columnIndex: 0,
        highlight: 'point_drop',
        visualType: 'vertical_op',
        visualData: { operands: nPadded, operator, result: finalRes, highlight: 'decimal_point' },
        message: {
            es: `¡Y el paso final! El punto baja **derechito** hasta el resultado. ¡No se mueve de su lugar! 🛗\n\n**¿Ves cómo quedó justo debajo de los otros?**`,
            en: `And the final step! The dot drops **straight down** to the result. It doesn't move! 🛗\n\n**Do you see how it stayed right under the others?**`
        },
        speech: {
            es: `¡Y el paso final! El punto baja derechito hasta el resultado. ¿Ves cómo quedó?`,
            en: `And the final step! The dot drops straight down to the result. Do you see where it landed?`
        }
    });

    // STEP 7: VERIFICATION
    steps.push({
        operand1: nPadded[0],
        operand2: nPadded[1],
        operator: operator,
        result: finalRes,
        carry: '',
        columnIndex: 0,
        highlight: 'done',
        visualType: 'vertical_op',
        visualData: { operands: nPadded, operator, result: finalRes, highlight: 'done' },
        message: {
            es: `¡Excelente trabajo! 🎉 El resultado final es **${finalRes}**. ¡Lo hiciste genial! 💪`,
            en: `Excellent work! 🎉 The final result is **${finalRes}**. You did great! 💪`
        },
        speech: {
            es: `¡Excelente trabajo! El resultado es ${finalRes}. ¡Muy bien!`,
            en: `Excellent work! The result is ${finalRes}. Well done!`
        }
    });

    return steps;
}


// --- 🍰 FRACTION OPERATIONS ---

export interface FractionStep extends VerticalOpStep {
    visualType?: VerticalOpStep['visualType'];
    visualData?: any;
}

export function generateFractionSteps(n1: number, d1: number, n2: number, d2: number, operator: '+' | '-' | '×' | '÷'): FractionStep[] {
    const steps: FractionStep[] = [];


    if (operator === '+' || operator === '-') {
        if (d1 === d2) {
            // --- HOMOGENEOUS ---
            const resNum = operator === '+' ? n1 + n2 : n1 - n2;
            // 1. Setup Step
            steps.push({
                operand1: `${n1}/${d1}`,
                operand2: `${n2}/${d2}`,
                operator: operator,
                result: '',
                carry: '',
                highlight: 'setup',
                columnIndex: 0,
                message: { es: `¡Vamos a operar estas fracciones! Como tienen el mismo denominador (${d1}), solo tenemos que mirar los numeradores.`, en: `Let's operate! Since they have the same denominator (${d1}), we just look at the numerators.` },
                visualType: 'fraction_equation',
                visualData: { num1: n1, den1: d1, num2: n2, den2: d2, operator, result: '?', highlight: 'all' },
                speech: { es: "Mismo denominador, ¡esto es fácil!", en: "Same denominator, this is easy!" }
            });

            steps.push({
                operand1: `${n1}/${d1}`,
                operand2: `${n2}/${d2}`,
                operator: operator,
                result: `${resNum}/${d1}`,
                carry: '',
                highlight: 'result',
                columnIndex: 0,
                message: {
                    es: `¡Correcto! Sumamos/restamos los numeradores y mantenemos el denominador: ${resNum}/${d1}`,
                    en: `Correct! Add/sub the numerators and keep the denominator: ${resNum}/${d1}`
                },
                visualType: 'fraction_equation',
                visualData: { num1: n1, den1: d1, num2: n2, den2: d2, operator, result: `${resNum}/${d1}`, highlight: 'done' },
                speech: { es: "Sumamos arriba y dejamos abajo igual.", en: "Add the top, keep the bottom." }
            });
            return steps;
        } else {
            // --- HETEROGENEOUS (GUIDED DISCOVERY FLOW - 8 STEP MANDATORY) ---
            const mcm = getLCM(d1, d2);
            const factor1 = mcm / d1;
            const factor2 = mcm / d2;
            const newN1 = n1 * factor1;
            const newN2 = n2 * factor2;
            const resNum = operator === '+' ? newN1 + newN2 : newN1 - newN2;

            // PASO 2 – IDENTIFICAR DENOMINADORES Y MOSTRAR TABLAS
            // Generamos suficientes múltiplos para que el encuentro sea VISIBLE (LCM + 1 extra)
            const count1 = Math.max(6, Math.ceil(mcm / d1) + 1);
            const count2 = Math.max(6, Math.ceil(mcm / d2) + 1);

            steps.push({
                operand1: `${n1}/${d1}`,
                operand2: `${n2}/${d2}`,
                operator: operator,
                result: '',
                carry: '',
                highlight: 'setup',
                columnIndex: 0,
                visualData: {
                    type: 'lcm_list',
                    lists: [
                        { base: d1, items: getMultiplesList(d1, count1) },
                        { base: d2, items: getMultiplesList(d2, count2) }
                    ],
                    match: mcm,
                    highlightMatch: false,
                    correctValue: mcm,
                    originalOp: { n1, d1, n2, d2, operator }
                },
                message: {
                    es: `¡Hola! Vamos a aprender a sumar o restar fracciones usando el MCM 😊✨\n\nVamos a mirar los números de abajo: son el **${d1}** y el **${d2}**. Como son diferentes, necesitamos encontrar el primer número que aparezca en las tablas de ambos.\n\n**¿Cuál es el primer número que ves repetido en ambas listas?**`,
                    en: `Hi! Let's learn to add or subtract fractions using the LCM 😊✨\n\nLet's look at the bottom numbers: they are **${d1}** and **${d2}**. Since they are different, we need to find the first number that appears in both tables.\n\n**What is the first number you see repeated in both lists?**`
                },
                speech: {
                    es: `¡Hola! Vamos a operar fracciones. Miremos los números de abajo. Mira las tablas en la pizarra, ¿puedes encontrar el primer número que aparece en las dos listas?`,
                    en: `Hi! Let's operate fractions. Let's look at the bottom numbers. Check the tables on the board, can you find the first number that appears in both lists?`
                }
            });

            // PASO 3 & 4 – BUSCAR MÚLTIPLOS Y ENCONTRAR EL MCM (PIZARRA)
            const discoverySteps = generateLCMSteps(d1, d2);
            discoverySteps.forEach(s => {
                if (s.visualData) s.visualData.originalOp = { n1, d1, n2, d2, operator };
            });
            steps.push(...discoverySteps);

            // PASO 5 – CONVERTIR FRACCION 1 (SOCRÁTICO)
            steps.push({
                operand1: `${n1}/${d1}`,
                operand2: `?/${mcm}`,
                operator: '→',
                result: '',
                carry: '',
                highlight: 'calculation',
                columnIndex: 0,
                visualType: 'fraction_equation',
                visualData: { num1: n1, den1: d1, result: `?/${mcm}`, highlight: 'all', correctValue: factor1, originalOp: { n1, d1, n2, d2, operator } },
                message: {
                    es: `¡Muy bien! El número que comparten es el **${mcm}**. Ahora vamos a cambiar la primera fracción (${n1}/${d1}) para que tenga ese número abajo.\n\n**¿Por cuánto multiplicamos el ${d1} para llegar a ${mcm}?**`,
                    en: `Great! The number they share is **${mcm}**. Now let's change the first fraction (${n1}/${d1}) to have that number at the bottom.\n\n**By what do we multiply ${d1} to get ${mcm}?**`
                },
                speech: {
                    es: `¡Muy bien! El número que comparten es el ${mcm}. Ahora, ¿por cuánto multiplicamos el ${d1} para llegar al ${mcm}?`,
                    en: `Great! The shared number is ${mcm}. Now, by what do we multiply ${d1} to get to ${mcm}?`
                }
            });

            // PASO 5 – CONVERTIR FRACCION 2 (SOCRÁTICO)
            steps.push({
                operand1: `${n2}/${d2}`,
                operand2: `?/${mcm}`,
                operator: '→',
                result: '',
                carry: '',
                highlight: 'calculation',
                columnIndex: 0,
                visualType: 'fraction_equation',
                visualData: { num1: n2, den1: d2, result: `?/${mcm}`, highlight: 'all', correctValue: factor2, originalOp: { n1, d1, n2, d2, operator } },
                message: {
                    es: `¡Eso es! Ahora hagamos lo mismo con la segunda fracción (${n2}/${d2}).\n\n**¿Por cuánto multiplicamos el ${d2} para llegar a ${mcm}?**`,
                    en: `That's it! Now let's do the same with the second fraction (${n2}/${d2}).\n\n**By what do we multiply ${d2} to get ${mcm}?**`
                },
                speech: {
                    es: `¡Eso es! Ahora con la segunda fracción. ¿Por cuánto multiplicamos el ${d2} para que nos de ${mcm}?`,
                    en: `That's it! Now for the second fraction. By what do we multiply ${d2} to get ${mcm}?`
                }
            });

            // PASO 6 – OPERAR (SOLO CUANDO SON IGUALES)
            steps.push({
                operand1: `${newN1}/${mcm}`,
                operand2: `${newN2}/${mcm}`,
                operator: operator,
                result: `${resNum}/${mcm}`,
                carry: '',
                highlight: 'result',
                columnIndex: 0,
                visualType: 'fraction_equation',
                visualData: { num1: newN1, den1: mcm, num2: newN2, den2: mcm, operator, result: `${resNum}/${mcm}`, highlight: 'done' },
                message: {
                    es: `¡Excelente! Ahora que las dos fracciones tienen el mismo número abajo, ¡ya hablan el mismo idioma! 🍕\n\nSolo operamos los números de arriba: ${newN1} ${operator} ${newN2} = **${resNum}**.`,
                    en: `Excellent! Now that both fractions have the same bottom number, they speak the same language! 🍕\n\nJust operate the top numbers: ${newN1} ${operator} ${newN2} = **${resNum}**.`
                },
                speech: {
                    es: `¡Excelente! Como ya tienen el mismo número abajo, solo operamos los de arriba.`,
                    en: `Excellent! Since they have the same bottom number, we just operate the top ones.`
                }
            });

            // PASO 7 & 8 – VERIFICACIÓN Y PRÁCTICA
            // PASO 7 & 8 – VERIFICACIÓN Y PRÁCTICA
            steps.push({
                operand1: `${resNum}/${mcm}`,
                operand2: '',
                operator: '=',
                result: `${resNum}/${mcm}`,
                carry: '',
                highlight: 'done',
                columnIndex: 0,
                visualType: 'fraction_equation',
                visualData: { num1: newN1, den1: mcm, num2: newN2, den2: mcm, operator, result: `${resNum}/${mcm}`, highlight: 'done' },
                message: {
                    es: `¡Misión cumplida! 🏆 El resultado final es **${resNum}/${mcm}**.\n\n¿Tiene sentido para ti? ¡Lo hiciste genial! ¿Quieres intentar otro tú solo? 💪`,
                    en: `Mission accomplished! 🏆 The final result is **${resNum}/${mcm}**.\n\nDoes it make sense to you? You did great! Want to try another one on your own? 💪`
                },
                speech: {
                    es: `¡Misión cumplida! El resultado es ${resNum} sobre ${mcm}. ¿Te animas a probar con otro?`,
                    en: `Mission accomplished! The result is ${resNum} over ${mcm}. Want to try another one?`
                }
            });
            return steps;
        }
    } else if (operator === '×') {
        steps.push({
            operand1: `${n1}/${d1}`,
            operand2: `${n2}/${d2}`,
            operator: operator,
            result: `${n1 * n2}/${d1 * d2}`,
            carry: '',
            highlight: 'done',
            columnIndex: 0,
            message: { es: `Multiplicamos directo: ${n1}×${n2} arriba, ${d1}×${d2} abajo.`, en: `Multiply straight: ${n1}×${n2} top, ${d1}×${d2} bottom.` },
            speech: { es: "Directo: arriba con arriba, abajo con abajo.", en: "Straight across: top top, bottom bottom." }
        });
        return steps;
    } else if (operator === '÷') {
        steps.push({
            operand1: `${n1}/${d1}`,
            operand2: `${n2}/${d2}`,
            operator: operator,
            result: `${n1 * d2}/${d1 * n2}`,
            carry: '',
            highlight: 'done',
            columnIndex: 0,
            message: { es: `Multiplicamos en cruz: ${n1}×${d2} arriba, ${d1}×${n2} abajo.`, en: `Cross multiply: ${n1}×${d2} top, ${d1}×${n2} bottom.` },
            speech: { es: "Cruzado: sube y baja.", en: "Cross multiply." }
        });
        return steps;
    }
    return steps;
}

// --- 🛠️ HELPERS: LCM & GCD ---

function getGCD(a: number, b: number): number {
    return b === 0 ? a : getGCD(b, a % b);
}

function getLCM(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / getGCD(a, b);
}

function getMultiplesList(num: number, count: number): number[] {
    return Array.from({ length: count }, (_, i) => num * (i + 1));
}

// --- 🔄 CONVERSION OPERATIONS ---

export function generateDecimalToFractionSteps(decimal: number): VerticalOpStep[] {
    const steps: VerticalOpStep[] = [];
    const s = decimal.toString();
    const decimalPart = s.split('.')[1] || '';
    const power = Math.pow(10, decimalPart.length);
    const numerator = Math.round(decimal * power);
    const denominator = power;

    // Step 1: Write as fraction over 10/100/1000
    steps.push({
        operand1: s,
        operand2: '',
        operator: '=',
        result: `${numerator}/${denominator}`,
        carry: '',
        columnIndex: 0,
        highlight: 'setup',
        message: {
            es: `Para convertir ${s} a fracción, miramos los decimales. Como tiene ${decimalPart.length} decimales, dividimos por ${power}.`,
            en: `To convert ${s} to a fraction, look at decimals. Since it has ${decimalPart.length} decimals, divide by ${power}.`
        },
        speech: { es: `Escribimos el número sobre ${power}.`, en: `Write the number over ${power}.` },
        visualType: 'fraction_bar',
        visualData: { numerator: numerator, denominator: denominator }
    });

    // Step 2: Simplify (using GCD)
    const common = getGCD(numerator, denominator);
    if (common > 1) {
        const simpleNum = numerator / common;
        const simpleDenom = denominator / common;

        steps.push({
            operand1: `${numerator}/${denominator}`,
            operand2: `${common}`,
            operator: '÷',
            result: `${simpleNum}/${simpleDenom}`,
            carry: '',
            columnIndex: 0,
            highlight: 'done',
            message: {
                es: `¡Podemos simplificar! Ambos se pueden dividir por ${common}. La fracción irreducible es ${simpleNum}/${simpleDenom}.`,
                en: `We can simplify! Both can be divided by ${common}. The simplest fraction is ${simpleNum}/${simpleDenom}.`
            },
            speech: { es: `Simplificando por ${common}, nos queda ${simpleNum} sobre ${simpleDenom}.`, en: `Simplifying by ${common}, we get ${simpleNum} over ${simpleDenom}.` },
            visualType: 'fraction_bar',
            visualData: { numerator: simpleNum, denominator: simpleDenom }
        });
    } else {
        steps.push({
            operand1: `${numerator}/${denominator}`,
            operand2: '',
            operator: '=',
            result: `${numerator}/${denominator}`,
            carry: '',
            columnIndex: 0,
            highlight: 'done',
            message: { es: "Esta fracción ya no se puede simplificar más.", en: "This fraction cannot be simplified further." },
            speech: { es: "Ya está lista.", en: "It is ready." },
            visualType: 'fraction_bar',
            visualData: { numerator, denominator }
        });
    }

    return steps;
}

export function generateFractionToDecimalSteps(num: number, den: number): VerticalOpStep[] {
    const steps: VerticalOpStep[] = [];

    // Step 1: Concept Question
    steps.push({
        operand1: `${num}/${den}`, operand2: '', operator: '=', result: '?', carry: '', columnIndex: 0, highlight: 'setup',
        message: {
            es: "Una fracción es una división. Para convertirla a decimal, dividimos el numerador entre el denominador. ¿Qué dividimos?",
            en: "A fraction is a division. To convert, we divide numerator by denominator. What do we divide?"
        },
        speech: { es: `¿Qué operación hacemos?`, en: `What operation do we do?` },
        visualType: 'fraction_bar',
        visualData: { numerator: num, denominator: den }
    });

    // Step 2: Transition to Division
    steps.push({
        operand1: `${num}/${den}`, operand2: '', operator: '=', result: `${num}÷${den}`, carry: '', columnIndex: 0, highlight: 'result', // Auto-advance
        message: { es: `¡Exacto! Dividimos ${num} entre ${den}.`, en: `Exactly! Divide ${num} by ${den}.` },
        speech: { es: `Exacto, ${num} entre ${den}.`, en: `Exact, ${num} by ${den}.` },
        visualType: 'fraction_bar',
        visualData: { numerator: num, denominator: den }
    });

    // Treat as division
    const divSteps = generateDecimalSteps(num, den, '÷');
    return [...steps, ...divSteps];
}

// --- 🔢 LCM GRAPHIC STEPS ---

// --- 🔢 LCM GRAPHIC STEPS (STEP-BY-STEP DISCOVERY) ---

export function generateLCMSteps(n1: number, n2: number): VerticalOpStep[] {
    const steps: VerticalOpStep[] = [];
    const lcm = getLCM(n1, n2);

    // Generate full lists up to LCM + extra for visual completeness
    const full1 = getMultiplesList(n1, Math.ceil(lcm / n1) + 2);
    const full2 = getMultiplesList(n2, Math.ceil(lcm / n2) + 2);

    // Only one step here: Highlight/Celebrate the match
    // Because the question was asked in the fraction intro step.
    steps.push({
        operand1: `MCM`,
        operand2: `${lcm}`,
        operator: '=',
        result: `${lcm}`,
        carry: '',
        columnIndex: 0,
        highlight: 'lcm_found',
        visualData: {
            type: 'lcm_list',
            lists: [{ base: n1, items: full1 }, { base: n2, items: full2 }],
            match: lcm,
            highlightMatch: true
        },
        message: {
            es: `¡Perfecto! 🎉 El **${lcm}** es el primer número que aparece en ambas listas. ¡Ese es nuestro Mínimo Común Múltiplo (MCM)!`,
            en: `Perfect! 🎉 **${lcm}** is the first number that appears in both lists. That's our Least Common Multiple (LCM)!`
        },
        speech: {
            es: `¡Perfecto! El ${lcm} es nuestro M C M. Ahora vamos a usarlo para convertir las fracciones.`,
            en: `Perfect! ${lcm} is our L C M. Now let's use it to convert the fractions.`
        }
    });

    return steps;
}

// --- 📐 GEOMETRY OPERATIONS ---

export function generateGeometrySteps(shape: string, type: 'area' | 'perimeter', params: any): VerticalOpStep[] {
    const steps: VerticalOpStep[] = [];
    let formula = "", calc = "", res = 0;

    if (shape === 'square' || shape === 'cuadrado') {
        const s = params.side || params.lado || 0;
        if (type === 'area') {
            res = s * s; formula = "Lado × Lado"; calc = `${s} × ${s}`;
        } else {
            res = s * 4; formula = "Lado × 4"; calc = `${s} × 4`;
        }
        // Question
        steps.push({
            operand1: formula, operand2: calc, operator: '=', result: '?', columnIndex: 0, carry: '', highlight: 'setup',
            visualType: 'geometry', visualData: { shape: 'square', labels: [`Side=${s}`], correctValue: res },
            message: { es: `${type === 'area' ? 'Área' : 'Perímetro'} = ${formula}. ¿Cuánto es ${calc}?`, en: `${type === 'area' ? 'Area' : 'Perimeter'} = ${formula}. What is ${calc}?` },
            speech: { es: `¿Cuánto es ${calc}?`, en: `What is ${calc}?` }
        });
    } else if (shape === 'rectangle' || shape === 'rectangulo') {
        const b = params.base || params.width || 0;
        const h = params.height || params.altura || 0;
        if (type === 'area') {
            res = b * h; formula = "Base × Altura"; calc = `${b} × ${h}`;
        } else {
            res = 2 * b + 2 * h; formula = "2(Base) + 2(Altura)"; calc = `2(${b}) + 2(${h})`;
        }
        // Question
        steps.push({
            operand1: formula, operand2: calc, operator: '=', result: '?', columnIndex: 0, carry: '', highlight: 'setup',
            visualType: 'geometry', visualData: { shape: 'rectangle', labels: [`b=${b}`, `h=${h}`], correctValue: res },
            message: { es: `${type === 'area' ? 'Área' : 'Perímetro'} = ${formula}. ¿Cuánto es ${calc}?`, en: `${type === 'area' ? 'Area' : 'Perimeter'} = ${formula}. What is ${calc}?` },
            speech: { es: `¿Cuánto es ${calc}?`, en: `What is ${calc}?` }
        });
    } else if (shape === 'triangle' || shape === 'triangulo') {
        const b = params.base || 0;
        const h = params.height || params.altura || 0;
        if (type === 'area') {
            res = (b * h) / 2; formula = "(Base × Altura) / 2"; calc = `(${b} × ${h}) / 2`;
            steps.push({
                operand1: formula, operand2: calc, operator: '=', result: '?', columnIndex: 0, carry: '', highlight: 'setup',
                visualType: 'geometry', visualData: { shape: 'triangle', labels: [`b=${b}`, `h=${h}`], correctValue: res },
                message: { es: `Área = ${formula}. ¿Cuánto es ${calc}?`, en: `Area = ${formula}. What is ${calc}?` },
                speech: { es: `¿Cuánto es ${calc}?`, en: `What is ${calc}?` }
            });
        }
    }

    // Common Feedback Step
    steps.push({
        operand1: formula, operand2: calc, operator: '=', result: res.toString(), columnIndex: 0, carry: '', highlight: 'done',
        visualType: 'geometry', visualData: { shape: shape, labels: [] },
        message: { es: `¡Correcto! ${calc} = ${res}.`, en: `Correct! ${calc} = ${res}.` },
        speech: { es: `Correcto, es ${res}.`, en: `Correct, it is ${res}.` }
    });

    return steps;
}

// --- % PERCENTAGE OPERATIONS ---

/**
 * 🔢 GENERATE PERCENTAGE STEPS (6-STEP CONVERT & MULTIPLY METHOD)
 * Strictly follows the pedagogical rule of converting to decimal first, then multiplying.
 */
export function generatePercentageSteps(percent: number, total: number): VerticalOpStep[] {
    const steps: VerticalOpStep[] = [];
    const decimal = percent / 100;
    const result = (total * percent) / 100;

    // Formatting numbers for speech (thousands separator)
    const totalStr = total.toLocaleString('es-CO');
    const percentStr = percent.toString();

    // STEP 1: IDENTIFY DATA
    steps.push({
        operand1: `${percent}%`,
        operand2: total.toString(),
        operator: '...',
        result: '',
        carry: '',
        highlight: 'setup',
        columnIndex: 0,
        message: {
            es: `¡Hola! Vamos a calcular el **${percent}%** de **${totalStr}**. Lo primero es identificar nuestros datos. ¿Estás listo para empezar?`,
            en: `Hi! Let's calculate **${percent}%** of **${totalStr}**. First, let's identify our data. Ready to start?`
        },
        speech: {
            es: `Hola. Vamos a calcular el ${percentStr} por ciento de ${numberToSpanish(total)}. Primero identifiquemos los datos.`,
            en: `Hi. Let's find ${percentStr} percent of ${totalStr}. Let's identify the data.`
        }
    });

    // STEP 2: SOCRATIC CONVERSION (Percent to Decimal)
    steps.push({
        operand1: `${percent}%`,
        operand2: '100',
        operator: '÷',
        result: decimal.toString(),
        carry: '',
        highlight: 'calculation',
        columnIndex: 0,
        visualData: {
            type: 'equation',
            text: `${percent}% = ${percent}/100 = ?`,
            correctValue: decimal,
            label: { es: 'Convertir a Decimal', en: 'Convert to Decimal' }
        },
        message: {
            es: `Para calcular porcentajes, el truco secreto es convertir el porcentaje en un número decimal. \n\n**¿Cómo escribirías ${percent}% como decimal?** (Pista: divide ${percent} entre 100).`,
            en: `To calculate percentages, the secret trick is to convert the percentage into a decimal. \n\n**How would you write ${percent}% as a decimal?** (Hint: divide ${percent} by 100).`
        },
        speech: {
            es: `El truco secreto es convertir el porcentaje en decimal. ¿Cómo escribes ${percentStr} por ciento como decimal? Divide entre cien.`,
            en: `The secret trick is converting the percentage to decimal. How do you write ${percentStr} percent as a decimal? Divide by one hundred.`
        }
    });

    // STEP 3: ESTABLISH MULTIPLICATION RELATIONSHIP
    steps.push({
        operand1: total.toString(),
        operand2: decimal.toString(),
        operator: '×',
        result: '',
        carry: '',
        highlight: 'setup',
        columnIndex: 0,
        message: {
            es: `¡Exacto! **${percent}%** es lo mismo que **${decimal}**. Ahora, para hallar el resultado, debemos multiplicar nuestro total (**${totalStr}**) por ese decimal.\n\n**¿Qué operación vamos a realizar ahora?**`,
            en: `Exactly! **${percent}%** is the same as **${decimal}**. Now, to find the result, we must multiply our total (**${totalStr}**) by that decimal.\n\n**What operation are we going to do now?**`
        },
        speech: {
            es: `Exacto. Punto ${percentStr} es lo mismo. Ahora multiplicamos el total por el decimal. ¿Qué operación sigue?`,
            en: `Exactly. Point ${percentStr} is the same. Now we multiply the total by the decimal. What's next?`
        }
    });

    // STEP 4: VERTICAL SETUP (The math begins)
    steps.push({
        operand1: total.toString(),
        operand2: decimal.toString(),
        operator: '×',
        result: '',
        carry: '',
        highlight: 'calculation',
        columnIndex: 0,
        visualType: 'vertical_op',
        visualData: {
            operand1: total.toString(),
            operand2: decimal.toString(),
            operator: '×',
            showDecimal: true
        },
        message: {
            es: `¡Muy bien! Vamos a colocar los números uno sobre otro. No te preocupes por el punto decimal por ahora, multipliquemos como si fueran números enteros.\n\n**¿Cuánto es ${total} multiplicado por ${percent}?**`,
            en: `Very good! Let's stack the numbers. Don't worry about the decimal point for now, let's multiply as if they were whole numbers.\n\n**How much is ${total} times ${percent}?**`
        },
        speech: {
            es: `Muy bien. Pongamos los números uno sobre otro. Multiplica normal, sin pensar en el punto. ¿Cuánto es ${numberToSpanish(total)} por ${percentStr}?`,
            en: `Good. Let's stack them. Multiply normally, ignoring the dot. What is ${totalStr} times ${percentStr}?`
        }
    });

    // STEP 5: DECIMAL PLACEMENT GUIDE
    steps.push({
        operand1: total.toString(),
        operand2: decimal.toString(),
        operator: '×',
        result: result.toString(),
        carry: '',
        highlight: 'result',
        columnIndex: 0,
        visualType: 'vertical_op',
        visualData: {
            operand1: total.toString(),
            operand2: decimal.toString(),
            operator: '×',
            result: result.toString(),
            highlight: 'decimal'
        },
        message: {
            es: `¡Casi lo tenemos! Recuerda que nuestro decimal tenía dos lugares después del punto. Debemos mover el punto dos espacios en nuestro resultado final.\n\n**¿Dónde crees que debe ir el punto decimal ahora?**`,
            en: `Almost there! Remember our decimal had two places. We must move the point two spaces in our final result.\n\n**Where do you think the decimal point should go now?**`
        },
        speech: {
            es: `Casi terminamos. Mueve el punto dos espacios hacia la izquierda. ¿Cuál es el resultado final con el punto?`,
            en: `Almost done. Move the point two spaces to the left. What is the final result with the dot?`
        }
    });

    // STEP 6: FINAL VERIFICATION
    steps.push({
        operand1: `${percent}% de ${totalStr}`,
        operand2: '',
        operator: '=',
        result: result.toString(),
        carry: '',
        highlight: 'done',
        columnIndex: 0,
        message: {
            es: `¡Fabuloso! El **${percent}%** de **${totalStr}** es **${result}**. 🌟\n\nHas aprendido el método de "Convertir y Multiplicar". ¡Eres un experto! ¿Quieres intentar otro?`,
            en: `Fabulous! **${percent}%** of **${totalStr}** is **${result}**. 🌟\n\nYou've learned the "Convert and Multiply" method. You're an expert! Want to try another?`
        },
        speech: {
            es: `¡Fabuloso! El ${percentStr} por ciento de ${numberToSpanish(total)} es ${result}. Aprendiste el método de convertir y multiplicar. ¡Eres un experto!`,
            en: `Fabulous! ${percentStr} percent of ${totalStr} is ${result}. You learned the convert and multiply method. Expert!`
        }
    });

    return steps;
}

// WRAPPER TO GENERATE FROM STRING

export function generateStepsForProblem(problemText: string, grade?: number): VerticalOpStep[] {
    const p = parseMathProblem(problemText);
    const lower = problemText.toLowerCase();

    // 1. CONVERSION DETECTION
    if ((lower.includes('convert') || lower.includes('cambia') || lower.includes('pasar') || lower.includes('transforma')) && (lower.includes('frac') || lower.includes('dec'))) {
        const nums = problemText.match(/\d+(\.\d+)?/g)?.map(Number);
        if (nums && nums.length > 0) {
            if (problemText.includes('.')) return generateDecimalToFractionSteps(nums[0]);
            if (problemText.includes('/')) {
                const match = problemText.match(/(\d+)\s*\/\s*(\d+)/);
                if (match) return generateFractionToDecimalSteps(parseInt(match[1]), parseInt(match[2]));
            }
        }
    }

    // 2. PERCENTAGE
    // Only handle simple "integer % integer" patterns. 
    // Delegate word problems, decimals, or formatted numbers to AlgorithmicTutor.
    const isWordProblem = /(cuesta|tienda|precio|pagar|descuento|cost|store|price|pay|discount|ofrece|offers|compró|vendió|total|quedan|repartir|cada uno|diferencia|ahorro|interés|incremento|bought|sold|shared|each|difference|savings|interest|increase)/i.test(lower);
    if ((problemText.includes('%') || lower.includes('porcentaje') || lower.includes('percent')) &&
        !isWordProblem &&
        problemText.length < 60 &&
        !problemText.includes('.') &&
        !problemText.includes(',')) {
        const nums = problemText.match(/\d+/g)?.map(Number) || [];
        if (nums.length >= 2) return generatePercentageSteps(nums[0], nums[1]);
    }

    // 3. GEOMETRY
    if (lower.includes('area') || lower.includes('perimetro') || lower.includes('perimeter')) {
        const type = (lower.includes('area') ? 'area' : 'perimeter');
        let shape = '';
        if (lower.includes('cuadrado') || lower.includes('square')) shape = 'square';
        if (lower.includes('rectangulo') || lower.includes('rectangle')) shape = 'rectangle';
        if (lower.includes('triangulo') || lower.includes('triangle')) shape = 'triangle';

        const nums = problemText.match(/\d+/g)?.map(Number) || [];
        const params: any = {};
        if (shape === 'square') params.side = nums[0];
        if (shape === 'rectangle' || shape === 'triangle') {
            params.base = nums[0];
            params.height = nums[1] || nums[0];
        }
        if (shape) return generateGeometrySteps(shape, type, params);
    }

    // 4. FRACTIONS (Unified LCM Discovery Flow) - Robust Detection
    // Check for "number/number operator number/number" pattern
    // Supports standard *, x, X for multiplication, and / or ÷ for division
    const fractionRegex = /(\d+)\s*\/\s*(\d+)\s*([+\-*xX÷/])\s*(\d+)\s*\/\s*(\d+)/;

    if (problemText.includes('/') && problemText.match(fractionRegex)) {
        const match = problemText.match(fractionRegex);
        if (match) {
            const n1 = parseInt(match[1]);
            const d1 = parseInt(match[2]);
            let op = match[3];

            // Normalize Operator
            if (op === '*' || op === 'x' || op === 'X') op = '×';
            if (op === '/') op = '÷';

            const n2 = parseInt(match[4]);
            const d2 = parseInt(match[5]);

            // Now generateFractionSteps handles the entire flow including visual discovery
            return generateFractionSteps(n1, d1, n2, d2, op as any);
        }
    }

    if (!p) return [];

    // 5. DECIMALS & INTEGERS
    if (Number(p.num1) % 1 !== 0 || Number(p.num2) % 1 !== 0 || problemText.includes('.')) {
        return generateDecimalSteps(p.operands || [p.num1, p.num2], 0, p.operator);
    }
    if (p.operator === '+') return generateAdditionSteps(p.operands || [p.num1, p.num2]);
    if (p.operator === '-') return generateSubtractionSteps(p.num1, p.num2);
    if (p.operator === '×') return generateMultiplicationSteps(p.num1, p.num2, grade);
    if (p.operator === '÷') return generateDivisionSteps(p.num1, p.num2);

    return [];
}


