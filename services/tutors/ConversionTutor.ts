
import { StepResponse } from './types';
import { getCorrectFeedback } from '../../data/feedbackPhrases';

export class ConversionTutor {
    static handleConversion(input: string, prob: any, lang: 'es' | 'en', history: any[], studentName?: string): StepResponse | null {
        const val = prob.val || "";
        const direction = prob.direction;
        const historyText = history.map(h => h.content.toLowerCase()).join(' ');

        if (prob.isNew) {
            return {
                steps: [{
                    id: 1,
                    type: "explanation",
                    text: lang === 'es'
                        ? `Hola 😊 Hoy vamos a aprender a convertir decimales y fracciones paso a paso. ¿Qué número quieres convertir hoy?`
                        : `Hi 😊 Today we are going to learn how to convert decimals and fractions step by step. What number do you want to convert today?`,
                    speech: lang === 'es'
                        ? "Hola. Hoy vamos a aprender a convertir decimales y fracciones paso a paso. ¿Qué número quieres convertir hoy?"
                        : "Hi. Today we are going to learn how to convert decimals and fractions step by step. What number do you want to convert today?",
                    visualType: "generic_illustration",
                    visualData: { context: "Conversion Intro" },
                    detailedExplanation: { es: "Mandatory Greeting", en: "Mandatory Greeting" }
                }]
            };
        }

        if (direction === 'decimalToFraction') {
            const parts = val.split('.');
            const decimalPart = parts[1] || "";
            const digitsAfter = decimalPart.length;
            const expectedDen = Math.pow(10, digitsAfter);
            const expectedNum = parseInt(val.replace('.', ''));

            // Step 2: Already said number, now count digits
            if (historyText.includes('qué número quieres convertir') && !historyText.includes('tras el puntico')) {
                return {
                    steps: [{
                        id: 2,
                        type: "explanation",
                        text: lang === 'es'
                            ? `¡Perfecto! Vamos con el **${val}**.\n\n🔢 **PASO 1:** Vamos a ver cuántos números hay después del puntico decimal.\n\n¿Cuántos números ves después del punto?`
                            : `Perfect! Let's go with **${val}**.\n\n🔢 **STEP 1:** Let's see how many numbers are after the decimal point.\n\nHow many numbers do you see after the point?`,
                        speech: lang === 'es' ? `¿Cuántos números hay después del punto?` : `How many numbers after the point?`,
                        visualType: "generic_illustration",
                        visualData: { context: val },
                        detailedExplanation: { es: "Contar decimales", en: "Count decimals" }
                    }]
                };
            }

            // Step 3: Denominator
            if (historyText.includes('ves después del punto') && !historyText.includes('ponemos abajo')) {
                return {
                    steps: [{
                        id: 3,
                        type: "explanation",
                        text: lang === 'es'
                            ? `¡Eso es! Hay ${digitsAfter} número(s).\n\nComo hay ${digitsAfter}, usaremos una "parte de ${expectedDen}".\n\n¿Qué número ponemos abajo en la fracción: 10, 100 o 1000?`
                            : `That's it! There are ${digitsAfter} number(s).\n\nSince there are ${digitsAfter}, we will use a "part of ${expectedDen}".\n\nWhat number do we put at the bottom: 10, 100, or 1000?`,
                        speech: lang === 'es' ? `¿Qué número ponemos abajo?` : `What number at the bottom?`,
                        visualType: "fraction_bar",
                        visualData: { num1: "?", den1: String(expectedDen) },
                        detailedExplanation: { es: "Determinar denominador", en: "Determine denominator" }
                    }]
                };
            }

            // Step 4: Numerator
            if (historyText.includes('ponemos abajo') && !historyText.includes('queda arriba')) {
                return {
                    steps: [{
                        id: 4,
                        type: "explanation",
                        text: lang === 'es'
                            ? `¡Bien hecho! Ponemos el **${expectedDen}** abajo.\n\nAhora, arriba escribimos el número sin el puntico.\n\n¿Qué número queda arriba?`
                            : `Well done! We put **${expectedDen}** at the bottom.\n\nNow, at the top we write the number without the decimal point.\n\nWhat number is left at the top?`,
                        speech: lang === 'es' ? `¿Qué número queda arriba?` : `What number at the top?`,
                        visualType: "fraction_bar",
                        visualData: { num1: "?", den1: String(expectedDen) },
                        detailedExplanation: { es: "Determinar numerador", en: "Determine numerator" }
                    }]
                };
            }

            // Step 5: Final Result
            if (historyText.includes('queda arriba')) {
                return {
                    steps: [{
                        id: 5,
                        type: "explanation",
                        text: lang === 'es'
                            ? `¡Lo logramos! 🎉 El número **${val}** es lo mismo que **${expectedNum}/${expectedDen}**.\n\n¿Representa lo mismo? ¡Claro que sí! 🔁🧮`
                            : `We did it! 🎉 The number **${val}** is the same as **${expectedNum}/${expectedDen}**.\n\nDoes it represent the same? Of course it does! 🔁🧮`,
                        speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} ${val} es lo mismo que ${expectedNum} sobre ${expectedDen}.` : `${getCorrectFeedback(lang, studentName)} ${val} is the same as ${expectedNum} over ${expectedDen}.`,
                        visualType: "fraction_bar",
                        visualData: { num1: String(expectedNum), den1: String(expectedDen) },
                        detailedExplanation: { es: "Conversión completada", en: "Conversion complete" }
                    }]
                };
            }
        }

        if (direction === 'fractionToDecimal') {
            const fParts = val.split('/');
            const num = parseInt(fParts[0] || "0");
            const den = parseInt(fParts[1] || "1");
            const result = num / den;

            // Step 2: Division Instruction
            if (historyText.includes('qué número quieres convertir') && !historyText.includes('dividimos el de arriba')) {
                return {
                    steps: [{
                        id: 2,
                        type: "explanation",
                        text: lang === 'es'
                            ? `¡Me encantan las fracciones! Para convertir **${val}** a decimal, dividimos el de arriba entre el de abajo.\n\n¿Qué operación hacemos?`
                            : `I love fractions! To convert **${val}** to decimal, we divide the top by the bottom.\n\nWhat operation do we do?`,
                        speech: lang === 'es' ? "Dividimos el de arriba entre el de abajo. ¿Qué operación hacemos?" : "We divide the top by the bottom. What operation?",
                        visualType: "generic_illustration",
                        visualData: { context: "Division instruction" },
                        detailedExplanation: { es: "Instrucción de división", en: "Division instruction" }
                    }]
                };
            }

            // Step 3: Result
            if (historyText.includes('qué operación hacemos')) {
                return {
                    steps: [{
                        id: 3,
                        type: "explanation",
                        text: lang === 'es'
                            ? `¡Exacto! Dividimos **${num} ÷ ${den}**.\n\nEl resultado es **${result}**. ¡Ahora ya sabes que representan lo mismo! 🔁🧮`
                            : `Exactly! We divide **${num} ÷ ${den}**.\n\nThe result is **${result}**. Now you know they represent the same! 🔁🧮`,
                        speech: lang === 'es' ? `¡Exacto! El resultado es ${result}.` : `Exactly! The result is ${result}.`,
                        visualType: "division_european",
                        visualData: { dividend: String(num), divisor: String(den), quotient: String(result) },
                        detailedExplanation: { es: "Resultado de conversión", en: "Conversion result" }
                    }]
                };
            }
        }

        return null;
    }
}
