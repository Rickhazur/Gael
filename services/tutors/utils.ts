import { ErrorType, HintLevel, VisualState } from './types';

// ============================================================================
// ERROR DETECTION HELPERS
// ============================================================================
export class ErrorDetector {
    // Detect if user forgot to carry (e.g., 6+5=11, user said 11 when should write 1)
    static detectForgotCarry(userAnswer: number, expectedSum: number, expectedDigit: number): boolean {
        return userAnswer === expectedSum && expectedSum >= 10;
    }

    // Detect if answer is off by the carry amount
    static detectOffByCarry(userAnswer: number, expectedSum: number, carryIn: number): boolean {
        return userAnswer === (expectedSum - carryIn) && carryIn > 0;
    }

    // Detect if user answered for wrong column (gave column+1 or column-1 answer)
    static detectWrongColumn(userAnswer: number, allColumnSums: number[]): number {
        const idx = allColumnSums.indexOf(userAnswer);
        return idx !== -1 ? idx : -1;
    }

    // Detect subtraction flip (e.g., 3-7, user said 4 instead of needing to borrow)
    static detectSubtractionFlip(userAnswer: number, d1: number, d2: number): boolean {
        return d1 < d2 && userAnswer === (d2 - d1);
    }

    // Detect close guess (off by 1)
    static detectOffByOne(userAnswer: number, expected: number): boolean {
        return Math.abs(userAnswer - expected) === 1;
    }

    // Categorize the error
    static categorize(
        userAnswer: number,
        expectedSum: number,
        expectedDigit: number,
        carryIn: number,
        allColumnSums: number[],
        isSubtraction: boolean = false,
        d1: number = 0,
        d2: number = 0
    ): ErrorType {
        if (userAnswer === expectedSum) return ErrorType.NONE;

        if (this.detectOffByCarry(userAnswer, expectedSum, carryIn)) {
            return ErrorType.FORGOT_CARRY;
        }

        if (this.detectOffByOne(userAnswer, expectedSum)) {
            return ErrorType.OFF_BY_ONE;
        }

        if (this.detectWrongColumn(userAnswer, allColumnSums) !== -1) {
            return ErrorType.WRONG_COLUMN;
        }

        if (isSubtraction && this.detectSubtractionFlip(userAnswer, d1, d2)) {
            return ErrorType.SUBTRACTION_FLIP;
        }

        return ErrorType.RANDOM_GUESS;
    }
}

// ============================================================================
// GRADUATED HINT GENERATOR
// ============================================================================
export class HintGenerator {
    static generate(
        errorType: ErrorType,
        hintLevel: HintLevel,
        lang: 'es' | 'en',
        context: {
            d1: number,
            d2: number,
            carryIn: number,
            expectedSum: number,
            expectedDigit: number,
            columnName: string,
            operator: string,
            userAnswer: number
        }
    ): { text: string, speech: string, newHintLevel: HintLevel } {
        const { d1, d2, carryIn, expectedSum, expectedDigit, columnName, operator, userAnswer } = context;

        // Build the question string
        const questionParts = carryIn > 0
            ? `${d1} ${operator} ${d2} + ${carryIn}`
            : `${d1} ${operator} ${d2}`;

        // LEVEL 1: Gentle redirect
        if (hintLevel === HintLevel.NONE || hintLevel === HintLevel.GENTLE) {
            if (errorType === ErrorType.FORGOT_CARRY) {
                const isTwoDigitSum = expectedSum >= 10;

                if (isTwoDigitSum) {
                    return {
                        text: lang === 'es'
                            ? `¡Casi perfecto! 🤔 ${d1} + ${d2}${carryIn > 0 ? ' + ' + carryIn : ''} = ${expectedSum}. ¡Pero **${expectedSum}** tiene dos dígitos!\n\n💡 **Escribimos ${expectedDigit}** abajo y llevamos el **1** para el vecino. ¿Entiendes?`
                            : `Almost perfect! 🤔 ${d1} + ${d2}${carryIn > 0 ? ' + ' + carryIn : ''} = ${expectedSum}. But **${expectedSum}** has two digits!\n\n💡 **Write ${expectedDigit}** below and carry the **1** to the neighbor. Got it?`,
                        speech: lang === 'es'
                            ? `¡Casi! ${expectedSum} tiene dos dígitos. Escribimos ${expectedDigit} y llevamos una.`
                            : `Almost! ${expectedSum} has two digits. Write ${expectedDigit} and carry one.`,
                        newHintLevel: HintLevel.VISUAL
                    };
                } else {
                    return {
                        text: lang === 'es'
                            ? `¡Muy cerca! ✨ Te dio **${userAnswer}**, pero recuerda que **llevábamos ${carryIn}** del vecino.\n\nRevisa: **${d1} + ${d2} + ${carryIn} (llevada)** = ¿cuánto es?`
                            : `So close! ✨ You got **${userAnswer}**, but remember we **carried ${carryIn}** from the neighbor.\n\nCheck: **${d1} + ${d2} + ${carryIn} (carry)** = how much?`,
                        speech: lang === 'es'
                            ? `¡Muy cerca! Pero te falta sumar la que llevas del vecino. Revisa.`
                            : `So close! But you forgot to add the carry from the neighbor. Check again.`,
                        newHintLevel: HintLevel.VISUAL
                    };
                }
            }

            if (errorType === ErrorType.OFF_BY_ONE) {
                return {
                    text: lang === 'es'
                        ? `¡Muy cerca! 🎯 Estás a solo 1 de distancia.\n\n${questionParts} = ¿? Cuenta de nuevo.`
                        : `So close! 🎯 You're just 1 away.\n\n${questionParts} = ? Count again.`,
                    speech: lang === 'es'
                        ? `Muy cerca. Cuenta de nuevo.`
                        : `So close. Count again.`,
                    newHintLevel: HintLevel.VISUAL
                };
            }

            return {
                text: lang === 'es'
                    ? `Hmm, no exactamente. 🤔\n\nRevisa: **${questionParts}** = ¿cuánto es?\n\n💡 Pista: Cuenta con tus dedos.`
                    : `Hmm, not quite. 🤔\n\nCheck: **${questionParts}** = how much?\n\n💡 Hint: Count on your fingers.`,
                speech: lang === 'es'
                    ? `Hmm, casi. Revisa. ${questionParts}`
                    : `Hmm, close. Check. ${questionParts}`,
                newHintLevel: HintLevel.GENTLE
            };
        }

        // LEVEL 2: Visual/Counting Aid
        if (hintLevel === HintLevel.VISUAL) {
            const countingAid = lang === 'es'
                ? `🖐️ Imagina ${d1} manzanas. ${operator === '+' ? 'Agrega' : 'Quita'} ${d2}${carryIn > 0 ? ` y luego suma ${carryIn} más` : ''}. ¿Cuántas hay?`
                : `🖐️ Imagine ${d1} apples. ${operator === '+' ? 'Add' : 'Remove'} ${d2}${carryIn > 0 ? ` then add ${carryIn} more` : ''}. How many?`;

            return {
                text: lang === 'es'
                    ? `${countingAid}\n\n**${questionParts}** = ¿?`
                    : `${countingAid}\n\n**${questionParts}** = ?`,
                speech: lang === 'es'
                    ? `Imagina ${d1} manzanas. ¿Cuántas quedan si ${operator === '+' ? 'agregas' : 'quitas'} ${d2}?`
                    : `Imagine ${d1} apples. How many if you ${operator === '+' ? 'add' : 'remove'} ${d2}?`,
                newHintLevel: HintLevel.EXPLICIT
            };
        }

        // LEVEL 3: Explicit guidance (almost tells them)
        if (hintLevel === HintLevel.EXPLICIT) {
            return {
                text: lang === 'es'
                    ? `Te ayudo: ${d1} ${operator} ${d2} = ${d1 + (operator === '+' ? d2 : -d2)}${carryIn > 0 ? `. Y si sumamos ${carryIn}, da ${expectedSum}` : ''}.\n\n¿Cuánto es **${questionParts}**?`
                    : `Let me help: ${d1} ${operator} ${d2} = ${d1 + (operator === '+' ? d2 : -d2)}${carryIn > 0 ? `. And adding ${carryIn} gives ${expectedSum}` : ''}.\n\nHow much is **${questionParts}**?`,
                speech: lang === 'es'
                    ? `Te ayudo. ${d1} más ${d2} es ${d1 + d2}. ¿Y con el que llevamos?`
                    : `Let me help. ${d1} plus ${d2} is ${d1 + d2}. And with the carry?`,
                newHintLevel: HintLevel.REVEALED
            };
        }

        // LEVEL 4: Reveal (after too many attempts)
        return {
            text: lang === 'es'
                ? `No te preocupes, esto es difícil. 💪\n\nLa respuesta es: **${expectedSum}**.\n\n${expectedSum >= 10 ? `Escribimos ${expectedDigit} y llevamos ${Math.floor(expectedSum / 10)}.` : `Escribimos ${expectedDigit}.`}\n\n¡Ahora sigamos con la siguiente columna!`
                : `Don't worry, this is tricky. 💪\n\nThe answer is: **${expectedSum}**.\n\n${expectedSum >= 10 ? `Write ${expectedDigit} and carry ${Math.floor(expectedSum / 10)}.` : `Write ${expectedDigit}.`}\n\nLet's continue with the next column!`,
            speech: lang === 'es'
                ? `No te preocupes. La respuesta es ${expectedSum}. Sigamos adelante.`
                : `Don't worry. The answer is ${expectedSum}. Let's continue.`,
            newHintLevel: HintLevel.NONE // Reset for next column
        };
    }

    // Generic simple hint for non-socratic steps
    static generateGenericIncorrect(
        operation: string,
        expectedAnswer: number,
        userAnswer: number | null,
        lang: 'es' | 'en',
        context?: string
    ): { text: string; speech: string } {
        const wasClose = userAnswer !== null && Math.abs(userAnswer - expectedAnswer) <= 2;

        if (wasClose) {
            return {
                text: lang === 'es'
                    ? `¡Muy cerca! 🎯 Revisa tu cálculo una vez más.\n\n${context || ''}`
                    : `Very close! 🎯 Check your calculation once more.\n\n${context || ''}`,
                speech: lang === 'es' ? 'Muy cerca. Revisa de nuevo.' : 'Very close. Check again.'
            };
        }

        return {
            text: lang === 'es'
                ? `Hmm, no exactamente. 🤔 Intentemos de nuevo.\n\n${context || ''}\n\n💡 Pista: Haz la operación paso a paso.`
                : `Hmm, not quite. 🤔 Let's try again.\n\n${context || ''}\n\n💡 Hint: Do the operation step by step.`,
            speech: lang === 'es' ? 'Hmm, casi. Intentemos de nuevo.' : 'Hmm, close. Let\'s try again.'
        };
    }

    /**
     * GENERATE PEDAGOGICAL SUMMARY
     */
    static generateSummary(
        operationType: string,
        result: string | number,
        lang: 'es' | 'en'
    ): string {
        const summaries: Record<string, { es: string; en: string }> = {
            'subtraction': {
                es: `\n\n📝 **Resumen:**\n• Restamos de derecha a izquierda\n• Si el dígito de arriba es menor, pedimos prestado\n• Verificamos restando del resultado`,
                en: `\n\n📝 **Summary:**\n• Subtract right to left\n• If top digit smaller, borrow\n• Verify by subtracting`
            },
            'multiplication': {
                es: `\n\n📝 **Resumen:**\n• Multiplicamos dígito por dígito\n• Sumamos los productos parciales\n• Las tablas de multiplicar son clave`,
                en: `\n\n📝 **Summary:**\n• Multiply digit by digit\n• Add partial products\n• Times tables are key`
            },
            'division': {
                es: `\n\n📝 **Resumen:**\n• Dividimos grupo por grupo\n• Multiplicamos para verificar\n• El residuo es lo que sobra`,
                en: `\n\n📝 **Summary:**\n• Divide group by group\n• Multiply to verify\n• Remainder is what's left`
            },
            'fraction': {
                es: `\n\n📝 **Resumen:**\n• Con mismo denominador: operamos numeradores\n• Con diferente denominador: buscamos MCM\n• Simplificamos si es posible`,
                en: `\n\n📝 **Summary:**\n• Same denominator: operate numerators\n• Different denominators: find LCM\n• Simplify if possible`
            },
            'percentage': {
                es: `\n\n📝 **Resumen:**\n• Porcentaje ÷ 100 = decimal\n• Decimal × base = resultado\n• 50% = mitad, 25% = cuarto`,
                en: `\n\n📝 **Summary:**\n• Percent ÷ 100 = decimal\n• Decimal × base = result\n• 50% = half, 25% = quarter`
            },
            'wordProblem': {
                es: `\n\n📝 **Resumen:**\n• Identificar qué pide el problema\n• Encontrar los datos importantes\n• Plantear la operación correcta`,
                en: `\n\n📝 **Summary:**\n• Identify what the problem asks\n• Find important data\n• Set up correct operation`
            }
        };

        return summaries[operationType]?.[lang] || '';
    }
}

// ============================================================================
// ANSWER VALIDATOR
// ============================================================================
export class AnswerValidator {
    /**
     * Extracts and validates numeric answers from user input
     * Returns: { isCorrect: boolean, userAnswer: number | null, isNumericInput: boolean }
     */
    /** Mapa de palabras numéricas ES/EN → número (0-99) */
    private static readonly WORD_TO_NUMBER: Record<string, number> = {
        cero: 0, zero: 0, uno: 1, una: 1, one: 1, dos: 2, two: 2, tres: 3, three: 3, cuatro: 4, four: 4,
        cinco: 5, five: 5, seis: 6, six: 6, siete: 7, seven: 7, ocho: 8, eight: 8, nueve: 9, nine: 9,
        diez: 10, ten: 10, once: 11, eleven: 11, doce: 12, twelve: 12, trece: 13, thirteen: 13,
        catorce: 14, fourteen: 14, quince: 15, fifteen: 15, dieciséis: 16, dieciseis: 16, sixteen: 16,
        diecisiete: 17, seventeen: 17, dieciocho: 18, eighteen: 18, diecinueve: 19, nineteen: 19,
        veinte: 20, twenty: 20,
        veintiuno: 21, veintidós: 22, veintidos: 22, veintitrés: 23, veintitres: 23, veinticuatro: 24,
        veinticinco: 25, veintiséis: 26, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
        treinta: 30, thirty: 30, cuarenta: 40, forty: 40, cincuenta: 50, fifty: 50,
        sesenta: 60, sixty: 60, setenta: 70, seventy: 70, ochenta: 80, eighty: 80, noventa: 90, ninety: 90,
        'twenty-one': 21, 'twenty-two': 22, 'twenty-three': 23, 'twenty-four': 24, 'twenty-five': 25,
        'twenty-six': 26, 'twenty-seven': 27, 'twenty-eight': 28, 'twenty-nine': 29,
        'thirty-one': 31, 'thirty-two': 32, 'thirty-three': 33, 'thirty-four': 34, 'thirty-five': 35,
        'thirty-six': 36, 'thirty-seven': 37, 'thirty-eight': 38, 'thirty-nine': 39,
        'forty-one': 41, 'forty-two': 42, 'forty-three': 43, 'forty-four': 44, 'forty-five': 45,
        'forty-six': 46, 'forty-seven': 47, 'forty-eight': 48, 'forty-nine': 49,
        'fifty-one': 51, 'fifty-two': 52, 'fifty-three': 53, 'fifty-four': 54, 'fifty-five': 55,
        'fifty-six': 56, 'fifty-seven': 57, 'fifty-eight': 58, 'fifty-nine': 59,
        'sixty-one': 61, 'sixty-two': 62, 'sixty-three': 63, 'sixty-four': 64, 'sixty-five': 65,
        'sixty-six': 66, 'sixty-seven': 67, 'sixty-eight': 68, 'sixty-nine': 69,
        'seventy-one': 71, 'seventy-two': 72, 'seventy-three': 73, 'seventy-four': 74, 'seventy-five': 75,
        'seventy-six': 76, 'seventy-seven': 77, 'seventy-eight': 78, 'seventy-nine': 79,
        'eighty-one': 81, 'eighty-two': 82, 'eighty-three': 83, 'eighty-four': 84, 'eighty-five': 85,
        'eighty-six': 86, 'eighty-seven': 87, 'eighty-eight': 88, 'eighty-nine': 89,
        'ninety-one': 91, 'ninety-two': 92, 'ninety-three': 93, 'ninety-four': 94, 'ninety-five': 95,
        'ninety-six': 96, 'ninety-seven': 97, 'ninety-eight': 98, 'ninety-nine': 99,
        cien: 100, hundred: 100, mil: 1000, thousand: 1000
    };

    /** Tens for Spanish "X y Y" compounds (treinta y uno = 31) */
    private static readonly TENS_ES: Record<string, number> = {
        treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90
    };
    private static readonly UNITS_ES: Record<string, number> = {
        uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9
    };

    /** Parse compound phrase like "treinta y dos" or "la respuesta es veinticinco" */
    private static parseWordNumber(input: string): number | null {
        const lower = input.trim().toLowerCase().replace(/[.,!?¿¡]/g, ' ').replace(/\s+/g, ' ');
        const words = lower.split(/\s+/);
        const joined = ' ' + lower + ' ';

        // 1) Spanish "treinta y uno" - check BEFORE single words (so "treinta y dos" → 32, not 30)
        const esMatch = joined.match(/\s(treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa)\s+y\s+(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)\s/);
        if (esMatch) {
            const tens = this.TENS_ES[esMatch[1]];
            const units = this.UNITS_ES[esMatch[2]];
            if (tens !== undefined && units !== undefined) return tens + units;
        }

        // 2) English "thirty two" (adjacent words) - before single-word (so "forty five" → 45)
        const tensEn: Record<string, number> = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
        const unitsEn: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 };
        for (let i = 0; i < words.length - 1; i++) {
            const t = tensEn[words[i]];
            const u = unitsEn[words[i + 1]];
            if (t !== undefined && u !== undefined) return t + u;
        }

        // 3) Spanish "ciento veinticinco" / English "one hundred twenty five" - before single-word, "doscientos", etc.
        const hundredsEs: Record<string, number> = { ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400, quinientos: 500, seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900 };
        if (words[0] && hundredsEs[words[0]] !== undefined) {
            const h = hundredsEs[words[0]];
            if (words.length === 1) return h;
            const restStr = words.slice(1).join(' ');
            const rest = this.parseWordNumber(restStr);
            if (rest !== null && rest < 100) return h + rest;
        }

        // 5) English "one hundred twenty five"
        const hundredsEn: Record<string, number> = { one: 100, two: 200, three: 300, four: 400, five: 500, six: 600, seven: 700, eight: 800, nine: 900 };
        const hundIdx = words.findIndex((w, i) => w === 'hundred' && hundredsEn[words[i - 1]] !== undefined);
        if (hundIdx >= 1) {
            const h = hundredsEn[words[hundIdx - 1]];
            if (words.length > hundIdx + 1) {
                const restStr = words.slice(hundIdx + 1).join(' ').replace(/-/g, ' ');
                const rest = this.parseWordNumber(restStr);
                if (rest !== null && rest < 100) return h + rest;
            }
            return h;
        }

        // 5) Fractions in words: "tres cuartos" -> 0.75, "un medio" -> 0.5 (before single-word so "tres" doesn't match)
        const fracEs: Record<string, number> = { medio: 0.5, medios: 0.5, tercio: 1 / 3, tercios: 1 / 3, cuarto: 0.25, cuartos: 0.25, quinto: 0.2, quintos: 0.2, sexto: 1 / 6, séptimo: 1 / 7, octavo: 0.125, noveno: 1 / 9, décimo: 0.1 };
        const fracEn: Record<string, number> = { half: 0.5, halves: 0.5, third: 1 / 3, thirds: 1 / 3, fourth: 0.25, fourths: 0.25, quarter: 0.25, quarters: 0.25, fifth: 0.2, fifths: 0.2, sixth: 1 / 6, seventh: 1 / 7, eighth: 0.125, ninth: 1 / 9, tenth: 0.1 };
        const numWords: Record<string, number> = { un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, one: 1, two: 2, three: 3, four: 4, five: 5 };
        for (let i = 0; i < words.length - 1; i++) {
            const num = numWords[words[i]] ?? this.WORD_TO_NUMBER[words[i]];
            const denom = fracEs[words[i + 1]] ?? fracEn[words[i + 1]];
            if (num !== undefined && denom !== undefined) return num * denom;
        }
        const singleFrac = fracEs[lower] ?? fracEn[lower];
        if (singleFrac !== undefined) return singleFrac;

        // 6) Single word in map (last resort)
        for (const w of words) {
            const n = this.WORD_TO_NUMBER[w];
            if (n !== undefined) return n;
        }

        return null;
    }

    /**
     * Checks if the input is a request for a hint or to continue
     */
    static isHintRequest(input: string): boolean {
        const clean = input.trim().toLowerCase();
        const hintKeywords = [
            'pista', 'ayuda', 'ayúdame', 'ayudame', 'no sé', 'no se', 'siga', 'sigue', 'continuar', 'continua', 'no entiendo',
            'hint', 'help', 'don\'t know', 'dont know', 'continue', 'next', 'siga', 'don\'t understand'
        ];
        return hintKeywords.some(k => clean.includes(k));
    }

    static validate(
        input: string,
        expectedAnswer: number,
        tolerance: number = 0.001 // For decimals/percentages
    ): { isCorrect: boolean; userAnswer: number | null; isNumericInput: boolean } {
        const cleanInput = input.trim().toLowerCase();

        // 1) Intentar extraer número de palabras (ej: "quince", "veinticinco", "treinta y dos", "twenty-five")
        const num = this.parseWordNumber(input);
        if (num !== null) {
            const isCorrect = Number.isInteger(expectedAnswer) && tolerance < 0.01
                ? num === expectedAnswer
                : Math.abs(num - expectedAnswer) <= tolerance;
            return { isCorrect, userAnswer: num, isNumericInput: true };
        }

        // 2) Strip common units (metros, cm, unidades, etc.) then extract number
        const unitsPattern = /\s*(metros?|m\b|centímetros?|cm\b|unidades?|u\b|manzanas?|peras?|objetos?|items?)\s*$/gi;
        const withoutUnits = cleanInput.replace(unitsPattern, ' ').trim();

        // 3) Normalize decimals: EU (1.000,50) vs US (1,000.50), EU thousands (1.000)
        let normalized = withoutUnits.replace(/\s/g, '');
        if (/^\d{1,3}(\.\d{3})*,\d+$/.test(normalized)) {
            normalized = normalized.replace(/\./g, '').replace(',', '.');
        } else if (/^\d{1,3}(\.\d{3})+$/.test(normalized)) {
            normalized = normalized.replace(/\./g, '');
        } else {
            normalized = normalized.replace(/,/g, '.');
        }

        // 4) Extract first number from input (can be decimal/negative)
        const numberMatch = normalized.match(/-?\d+\.?\d*/);

        if (!numberMatch) {
            return { isCorrect: false, userAnswer: null, isNumericInput: false };
        }

        const userAnswer = parseFloat(numberMatch[0]);

        // For whole numbers, exact match
        if (Number.isInteger(expectedAnswer) && tolerance < 0.01) {
            return {
                isCorrect: userAnswer === expectedAnswer,
                userAnswer,
                isNumericInput: true
            };
        }

        // For decimals/percentages, use tolerance
        return {
            isCorrect: Math.abs(userAnswer - expectedAnswer) <= tolerance,
            userAnswer,
            isNumericInput: true
        };
    }
}

// ============================================================================
// STATE HELPER
// ============================================================================
export class StateHelper {
    static getCurrentVisualState(history: any[]): VisualState | null {
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].role === 'assistant' || history[i].role === 'nova') {
                if (history[i].visualState) return history[i].visualState;
                try {
                    const match = history[i].content.match(/\{[\s\S]*\}/);
                    if (match) {
                        const json = JSON.parse(match[0]);
                        if (json.steps && json.steps.length > 0) {
                            return json.steps[json.steps.length - 1].visualData;
                        }
                    }
                } catch (e) { }
            }
        }
        return null;
    }

    static gcd(a: number, b: number): number { return b === 0 ? a : StateHelper.gcd(b, a % b); }
    static lcm(a: number, b: number): number { return (a * b) / StateHelper.gcd(a, b); }
    static lcmOfMany(nums: number[]): number {
        if (nums.length === 0) return 1;
        return nums.reduce((acc, n) => StateHelper.lcm(acc, n), nums[0]);
    }
}

/**
 * Helper to format large numbers for clearer TTS pronunciation.
 */
export function formatForSpeech(num: number | string, lang: 'es' | 'en'): string {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return String(num);
    if (n < 100) return String(n);
    // Use Intl.NumberFormat for proper reading
    try {
        return new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-US').format(n);
    } catch (e) {
        return String(n);
    }
}
