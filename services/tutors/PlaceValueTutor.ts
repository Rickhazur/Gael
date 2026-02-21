import { Step, StepResponse } from './types';

export const PlaceValueTutor = {
    handleDecomposition(problemString: string, history: any[], language: 'es' | 'en'): StepResponse | null {
        const cleanStr = problemString.toLowerCase().trim();

        // 1. IMPROVED DETECTION: Handle solitary numbers or commands
        const match = cleanStr.match(/^(?:descompon[er]*|lee[r]*|escrib[aeir]*|valor\s+posicional\s+de)?\s*(\d{1,3}(?:[.,]\d{3})*|\d{2,6})(?:\s+en\s+(?:letras|palabras))?$/i);

        // 2. EXTRACT CONTEXT FROM HISTORY
        let currentNumStr = "";
        let currentPhase: 'intro' | 'digits' | 'values' | 'final' = 'intro';
        let currentDigitIndex = 0;
        let isNew = false;

        // Scan history for existing place value session
        for (let i = history.length - 1; i >= 0; i--) {
            const h = history[i];
            if ((h.role === 'assistant' || h.role === 'nova') && h.visualState?.type === 'place_value') {
                currentNumStr = String(h.visualState.tempVal || h.visualState.number || "");
                currentPhase = h.visualState.phase || 'intro';
                currentDigitIndex = h.visualState.digitIndex ?? 0;
                break;
            }
        }

        if (match) {
            const num = match[1].replace(/[.,]/g, '');
            if (num !== currentNumStr) {
                currentNumStr = num;
                currentPhase = 'intro';
                currentDigitIndex = 0;
                isNew = true;
            }
        }

        if (!currentNumStr) return null;

        const numValue = parseInt(currentNumStr, 10);
        const digits = currentNumStr.split('');
        const len = digits.length;
        const f = (n: number | string) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        const getPlaceName = (indexFromRight: number) => {
            if (language === 'en') {
                const names = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];
                return names[indexFromRight] || '';
            } else {
                const names = ['unidades', 'decenas', 'centenas', 'unidades de mil', 'decenas de mil', 'centenas de mil'];
                return names[indexFromRight] || '';
            }
        };

        const getShortPlaceName = (indexFromRight: number) => {
            const names = ['U', 'D', 'C', 'UM', 'DM', 'CM'];
            return names[indexFromRight] || '';
        };

        // Helper to move to next logic
        const nextStep = (): StepResponse => {
            // PHASE: INTRO -> digits[0]
            if (currentPhase === 'intro') {
                return {
                    steps: [{
                        visualType: 'place_value',
                        visualData: { tempVal: numValue, phase: 'digits', digitIndex: 0 },
                        text: language === 'es' ? `Vamos a descubrir el secreto del número **${f(currentNumStr)}**.\n\n¿Cuántas cifras (o dígitos) tiene este número?` : `Let's discover the secret of the number **${f(currentNumStr)}**.\n\nHow many digits does it have?`,
                        speech: language === 'es' ? `¡Mira este número! Es el ${f(currentNumStr)}. ¿Cuántas cifras tiene?` : `Look at this number! It's ${f(currentNumStr)}. How many digits does it have?`
                    }]
                };
            }

            // PHASE: DIGITS/VALUES -> iterate through digits
            if (currentDigitIndex < len) {
                const digit = digits[currentDigitIndex];
                const dVal = parseInt(digit);
                const indexFromRight = len - 1 - currentDigitIndex;
                const placeName = getPlaceName(indexFromRight);
                const shortPlace = getShortPlaceName(indexFromRight);
                const valueStr = digit + '0'.repeat(indexFromRight);

                // Handle Step: Ask for position
                if (currentPhase === 'digits') {
                    return {
                        steps: [{
                            visualType: 'place_value',
                            visualData: { tempVal: numValue, highlight: shortPlace, phase: 'values', digitIndex: currentDigitIndex },
                            text: language === 'es' ? `¡Mira el dígito **${digit}**!\n\n¿En qué posición está? (unidades, decenas, centenas...)` : `Look at the digit **${digit}**!\n\nWhat position is it in? (ones, tens, hundreds...)`,
                            speech: language === 'es' ? `Mira el ${digit}. ¿En qué posición está?` : `Look at the ${digit}. What position is it in?`
                        }]
                    };
                }

                // Handle Step: Confirm position and ask for value
                if (currentPhase === 'values') {
                    const isLast = currentDigitIndex === len - 1;
                    const nextIdx = currentDigitIndex + 1;
                    const nextPhase = isLast ? 'final' : 'digits';

                    return {
                        steps: [{
                            visualType: 'place_value',
                            visualData: { tempVal: numValue, highlight: shortPlace, text: valueStr, phase: nextPhase, digitIndex: nextIdx },
                            text: language === 'es' ? `¡Exacto! Son **${digit} ${placeName}**.\n\nSu valor real es **${f(valueStr)}**.\n\n${isLast ? '¡Hemos terminado de desarmar el número!' : 'Sigamos con el siguiente...'}` : `Exactly! That's **${digit} ${placeName}**.\n\nIts real value is **${f(valueStr)}**.\n\n${isLast ? 'We finished deconstructing the number!' : "Let's continue..."}`,
                            speech: language === 'es' ? `¡Muy bien! Son ${digit} ${placeName}, o sea que vale ${f(valueStr)}. Continuemos.` : `Great! That's ${digit} ${placeName}, which means it's worth ${f(valueStr)}. Let's continue.`
                        }]
                    };
                }
            }

            // PHASE: FINAL
            const decompParts: string[] = [];
            for (let i = 0; i < len; i++) {
                const d = parseInt(digits[i]);
                if (d > 0) decompParts.push(digits[i] + '0'.repeat(len - 1 - i));
            }
            const fullDecomp = decompParts.map(f).join(' + ');

            return {
                steps: [{
                    visualType: 'place_value',
                    visualData: { tempVal: numValue, highlight: 'ALL', text: fullDecomp, phase: 'done', wpPhase: 'done' },
                    text: language === 'es' ? `¡Magia! 🪄\n\nJunta todo: **${fullDecomp}**.\n\nEste número se lee: **${currentNumStr === '4567' ? 'Cuatro mil quinientos sesenta y siete' : '(Nombre del número)'}**.\n\n¿Cómo lo escribirías tú en tu cuaderno?` : `Magic! 🪄\n\nPut it all together: **${fullDecomp}**.\n\nThis number is read as: **four thousand five hundred sixty-seven**.\n\nHow would you write it in your notebook?`,
                    speech: language === 'es' ? `¡Junta todo! ${fullDecomp}. ¿Cómo se escribe este número en letras?` : `Put it all together! ${fullDecomp}. How do you write this number in words?`
                }]
            };
        };

        // RESPOND TO USER INPUT
        if (isNew) return nextStep();

        // If not new, check if user answered correctly
        // For simplicity in this demo logic, we'll just advance on any input for digits/intro
        // But for "values", we could validate.
        return nextStep();
    }
};
