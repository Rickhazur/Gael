import { CarryOverHint } from './CarryOverBubble';

/**
 * Detecta las llevadas en una suma
 * @param num1 Primer número (como string para preservar dígitos)
 * @param num2 Segundo número
 * @returns Array de hints con las llevadas detectadas
 */
export function detectAdditionCarries(num1: string, num2: string): CarryOverHint[] {
    const hints: CarryOverHint[] = [];
    const digits1 = num1.split('').reverse();
    const digits2 = num2.split('').reverse();
    const maxLength = Math.max(digits1.length, digits2.length);

    let carry = 0;

    for (let i = 0; i < maxLength; i++) {
        const d1 = parseInt(digits1[i] || '0');
        const d2 = parseInt(digits2[i] || '0');
        const sum = d1 + d2 + carry;

        if (sum >= 10) {
            const newCarry = Math.floor(sum / 10);
            const digit = sum % 10;

            hints.push({
                id: `add-carry-${i}`,
                position: i,
                value: newCarry,
                type: 'carry',
                operation: 'addition',
                explanation: `${d1} + ${d2}${carry > 0 ? ` + ${carry}` : ''} = ${sum}`,
                detailedExplanation: `Escribo ${digit} y llevo ${newCarry} a la siguiente columna`
            });

            carry = newCarry;
        } else {
            carry = 0;
        }
    }

    return hints;
}

/**
 * Detecta los préstamos en una resta
 * @param num1 Minuendo (número de arriba)
 * @param num2 Sustraendo (número de abajo)
 * @returns Array de hints con los préstamos detectados
 */
export function detectSubtractionBorrows(num1: string, num2: string): CarryOverHint[] {
    const hints: CarryOverHint[] = [];
    const digits1 = num1.split('').reverse().map(d => parseInt(d));
    const digits2 = num2.split('').reverse().map(d => parseInt(d || '0'));
    const maxLength = Math.max(digits1.length, digits2.length);

    // Copia modificable para simular los préstamos
    const workingDigits = [...digits1];

    for (let i = 0; i < maxLength; i++) {
        let d1 = workingDigits[i] || 0;
        const d2 = digits2[i] || 0;

        if (d1 < d2) {
            // Necesitamos pedir prestado
            // Buscar la siguiente columna con valor > 0
            let borrowFrom = i + 1;
            while (borrowFrom < workingDigits.length && workingDigits[borrowFrom] === 0) {
                workingDigits[borrowFrom] = 9; // Convertir 0 en 9 después de prestar
                borrowFrom++;
            }

            if (borrowFrom < workingDigits.length) {
                workingDigits[borrowFrom]--; // Restar 1 de la columna de donde prestamos
                workingDigits[i] += 10; // Agregar 10 a la columna actual

                hints.push({
                    id: `sub-borrow-${i}`,
                    position: i,
                    value: 10,
                    type: 'borrow',
                    operation: 'subtraction',
                    explanation: `${d1} es menor que ${d2}`,
                    detailedExplanation: `Pido prestado 10 de la columna siguiente. Ahora tengo ${d1 + 10} - ${d2} = ${d1 + 10 - d2}`
                });
            }
        }
    }

    return hints;
}

/**
 * Detecta las llevadas en una multiplicación
 * @param num Número a multiplicar
 * @param multiplier Multiplicador (un solo dígito)
 * @returns Array de hints con las llevadas detectadas
 */
export function detectMultiplicationCarries(num: string, multiplier: number): CarryOverHint[] {
    const hints: CarryOverHint[] = [];
    const digits = num.split('').reverse();

    let carry = 0;

    for (let i = 0; i < digits.length; i++) {
        const digit = parseInt(digits[i]);
        const product = digit * multiplier + carry;

        if (product >= 10) {
            const newCarry = Math.floor(product / 10);
            const resultDigit = product % 10;

            hints.push({
                id: `mult-carry-${i}`,
                position: i,
                value: newCarry,
                type: 'carry',
                operation: 'multiplication',
                explanation: `${digit} × ${multiplier}${carry > 0 ? ` + ${carry}` : ''} = ${product}`,
                detailedExplanation: `Escribo ${resultDigit} y llevo ${newCarry}`
            });

            carry = newCarry;
        } else {
            carry = 0;
        }
    }

    return hints;
}

/**
 * Detecta las llevadas en una multiplicación de varios dígitos
 * @param num1 Primer número
 * @param num2 Segundo número
 * @returns Array de hints para cada línea de multiplicación parcial
 */
export function detectMultiDigitMultiplicationCarries(num1: string, num2: string): CarryOverHint[][] {
    const allHints: CarryOverHint[][] = [];
    const digits2 = num2.split('').reverse();

    // Para cada dígito del multiplicador
    for (let row = 0; row < digits2.length; row++) {
        const multiplier = parseInt(digits2[row]);
        const rowHints = detectMultiplicationCarries(num1, multiplier);

        // Ajustar posiciones para el offset de la fila
        const adjustedHints = rowHints.map(hint => ({
            ...hint,
            id: `mult-row${row}-${hint.id}`,
            position: hint.position + row // Desplazar según la fila
        }));

        allHints.push(adjustedHints);
    }

    return allHints;
}

/**
 * Detecta las llevadas en una división (para el cociente)
 * @param dividend Dividendo
 * @param divisor Divisor
 * @returns Array de hints con los pasos de la división
 */
export function detectDivisionSteps(dividend: string, divisor: number): CarryOverHint[] {
    const hints: CarryOverHint[] = [];
    const digits = dividend.split('');

    let remainder = 0;
    let position = 0;

    for (let i = 0; i < digits.length; i++) {
        const currentDigit = parseInt(digits[i]);
        const currentNumber = remainder * 10 + currentDigit;

        if (currentNumber >= divisor) {
            const quotient = Math.floor(currentNumber / divisor);
            const newRemainder = currentNumber % divisor;

            hints.push({
                id: `div-step-${i}`,
                position: position++,
                value: quotient,
                type: 'carry', // Usamos 'carry' para el cociente
                operation: 'division',
                explanation: `${currentNumber} ÷ ${divisor} = ${quotient}`,
                detailedExplanation: `${divisor} × ${quotient} = ${divisor * quotient}, sobran ${newRemainder}`
            });

            remainder = newRemainder;
        } else if (i > 0) {
            // No podemos dividir, bajamos el siguiente dígito
            hints.push({
                id: `div-step-${i}`,
                position: position,
                value: 0,
                type: 'carry',
                operation: 'division',
                explanation: `${currentNumber} < ${divisor}`,
                detailedExplanation: `${currentNumber} es menor que ${divisor}, escribo 0 y bajo el siguiente dígito`
            });
        }

        remainder = currentNumber >= divisor ? currentNumber % divisor : currentNumber;
    }

    return hints;
}

/**
 * Función helper para generar hints basados en el tipo de operación
 */
export function generateOperationHints(
    operation: 'addition' | 'subtraction' | 'multiplication' | 'division',
    num1: string,
    num2: string | number
): CarryOverHint[] | CarryOverHint[][] {
    switch (operation) {
        case 'addition':
            return detectAdditionCarries(num1, num2.toString());

        case 'subtraction':
            return detectSubtractionBorrows(num1, num2.toString());

        case 'multiplication':
            if (typeof num2 === 'number' && num2 < 10) {
                return detectMultiplicationCarries(num1, num2);
            } else {
                return detectMultiDigitMultiplicationCarries(num1, num2.toString());
            }

        case 'division':
            return detectDivisionSteps(num1, typeof num2 === 'number' ? num2 : parseInt(num2));

        default:
            return [];
    }
}
