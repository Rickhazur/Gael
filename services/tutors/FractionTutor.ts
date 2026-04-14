
import { StepResponse, VisualState } from './types';
import { GradeLevel } from '@/types/tutor';
import { AnswerValidator, StateHelper } from './utils';
import { getCorrectFeedback } from '../../data/feedbackPhrases';

export class FractionTutor {
    static handleFractions(input: string, prob: any, lang: 'es' | 'en', history: any[], studentName?: string, grade: GradeLevel = 4): StepResponse | null {
        const lastState = StateHelper.getCurrentVisualState(history);

        // -- NEW: Route to post-analysis if active --
        if (lastState?.phase && ((lastState.phase as any).startsWith('post_analysis') || (lastState.phase as any) === 'result_analysis_start')) {
            return this.handlePostAnalysis(input, prob, lang, history, lastState as any, studentName);
        }
        // -------------------------------------------

        // Normalize operator: 'x' -> '*', ':' -> '/'
        let op = lastState?.operator || prob.op || '+';
        if (op === 'x' || op === '×') op = '*';
        if (op === ':' || op === '÷') op = '/';

        // Dispatch based on operator
        if (op === '*') {
            return this.handleMultiplication(input, prob, lang, history, lastState, studentName);
        } else if (op === '/') {
            return this.handleDivision(input, prob, lang, history, lastState, studentName);
        } else if (op === 'simplify') {
            return this.handleSimplification(input, prob, lang, history, lastState, studentName);
        } else if (op === 'to_decimal') {
            return this.handleDecimalConversion(input, prob, lang, history, lastState, studentName);
        } else {
            return this.handleAddSubtraction(input, prob, lang, history, lastState, studentName);
        }
    }

    // ==========================================
    // 🧠 POST-RESULT ANALYSIS (Pedagogical Flow)
    // ==========================================
    private static handlePostAnalysis(input: string, prob: any, lang: 'es' | 'en', history: any[], lastState: any, studentName?: string): StepResponse | null {
        const n = parseInt(lastState?.finalNum || lastState?.num1);
        const d = parseInt(lastState?.finalDen || lastState?.den1);

        // 1. Classification (Proper vs Improper)
        if (lastState.phase === 'result_analysis_start') {
            const isProper = n < d;
            const cleanInput = input.trim().toLowerCase();
            const isCorrect = isProper
                ? (cleanInput.includes('propia') || cleanInput.includes('proper')) && !cleanInput.includes('im')
                : (cleanInput.includes('impropia') || cleanInput.includes('improper'));

            if (isCorrect) {
                // Determine if simplifiable
                const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
                const divisor = gcd(n, d);
                const canSimplify = divisor > 1;

                if (canSimplify) {
                    const sn = n / divisor;
                    const sd = d / divisor;
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `¡Excelente! 🌟 Es **${isProper ? 'propia' : 'impropia'}** porque el numerador es ${isProper ? 'menor' : 'mayor'}.\n\nAhora, **Simplificación**: He notado que ambos números se pueden dividir por **${divisor}**. 👇\n\n• ${n} ÷ ${divisor} = **${sn}**\n• ${d} ÷ ${divisor} = **${sd}**\n\nNuestra fracción simplificada es **${sn}/${sd}**.`
                                : `Excellent! 🌟 It is **${isProper ? 'proper' : 'improper'}**.\n\nNow, **Simplification**: Both numbers can be divided by **${divisor}**. 👇\n\n• ${n} ÷ ${divisor} = **${sn}**\n• ${d} ÷ ${divisor} = **${sd}**\n\nSimplified: **${sn}/${sd}**.`,
                            speech: lang === 'es' ? `Correcto. Ahora simplificamos dividiendo por ${divisor}.` : `Correct. Now we simplify by dividing by ${divisor}.`,
                            visualType: "fraction_equation",
                            visualData: { ...lastState, phase: 'post_analysis_menu', finalNum: sn, finalDen: sd, result: `${sn}/${sd}`, highlight: 'done', originalN: n, originalD: d },
                            detailedExplanation: { es: "Simplificación automática", en: "Auto simplification" }
                        }]
                    };
                } else {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `¡Correcto! 🌟 Es **${isProper ? 'propia' : 'impropia'}**.\n\nAhora, **Simplificación**: Busqué divisores (2, 3, 5...) pero no encontré ninguno común. 🛑\n\nEsto significa que **ya está simplificada** al máximo. ¡Genial!`
                                : `Correct! 🌟 It is **${isProper ? 'proper' : 'improper'}**.\n\nNow, **Simplification**: I checked for divisors but found none. 🛑\n\nIt is **already simplified**. Great!`,
                            speech: lang === 'es' ? `Correcto. No se puede simplificar más.` : `Correct. Cannot simplify further.`,
                            visualType: "fraction_op",
                            visualData: { ...lastState, phase: 'post_analysis_menu', highlight: 'done' }, // Keep same N/D
                            detailedExplanation: { es: "No simplificable", en: "Not simplifiable" }
                        }]
                    };
                }
            } else {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `Casi... Recuerda: \n🟢 **Propia**: Numerador < Denominador (pequeño/grande).\n🔴 **Impropia**: Numerador ≥ Denominador (grande/pequeño).\n\nTu fracción es **${n}/${d}**. ¿Cuál es?`
                            : `Close... Remember: \n🟢 **Proper**: Num < Den.\n🔴 **Improper**: Num ≥ Den.\n\nYours is **${n}/${d}**. Which one is it?`,
                        visualType: "fraction_op", visualData: lastState,
                        speech: lang === 'es' ? "Intenta de nuevo." : "Try again."
                    }]
                };
            }
        }

        // 2. Menu
        if (lastState.phase === 'post_analysis_menu') {
            const isImproper = n >= d;
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¿Qué quieres hacer con este **${n}/${d}**? Elige:\n\n1️⃣ Dejarla así (Fracción)\n2️⃣ Volverla Número Mixto ${isImproper ? '✅' : '(No se puede ❌)'}\n3️⃣ Volverla Decimal (0.xxx)\n4️⃣ Usarla en un problema real 🍕`
                        : `What do you want to do with **${n}/${d}**? Choose:\n\n1️⃣ Leave it check\n2️⃣ Mixed Number ${isImproper ? '✅' : '❌'}\n3️⃣ Decimal (0.xxx)\n4️⃣ Real world problem 🍕`,
                    visualType: "text_only", // Use text only to focus on menu or keep fraction visual
                    visualData: { ...lastState, phase: 'post_analysis_choice', customText: "Menú de Opciones" },
                    speech: lang === 'es' ? "¿Qué hacemos ahora? Elige una opción." : "What next? Choose an option."
                }]
            };
        }

        // 3. Handle Menu Choice
        if (lastState.phase === 'post_analysis_choice') {
            const choice = input.toLowerCase();
            const isOne = choice.includes('1') || choice.includes('dejar') || choice.includes('así') || choice.includes('fraction') || choice.includes('leave');
            const isTwo = choice.includes('2') || choice.includes('mixto') || choice.includes('mixed');
            const isThree = choice.includes('3') || choice.includes('decimal');
            const isFour = choice.includes('4') || choice.includes('real') || choice.includes('problema') || choice.includes('vida');

            if (isTwo) {
                if (n < d) {
                    return { steps: [{ text: lang === 'es' ? "¡Ups! Solo las fracciones **impropias** (el de arriba más grande) se vuelven mixtas. Esta es propia. Elige otra opción." : "Oops! Only improper fractions become mixed. Choose another.", visualType: "text_only", visualData: lastState, speech: lang === 'es' ? "Solo las impropias se vuelven mixtas." : "Only improper ones become mixed." }] };
                }
                const whole = Math.floor(n / d);
                const rem = n % d;
                const mixedStr = `${whole} ${rem}/${d}`;
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Vamos a convertirla! 🌀\n\nDividimos **${n} ÷ ${d}**.\n• Cabe **${whole}** veces completas (Entero).\n• Sobran **${rem}**.\n\nResultado Mixto: **${mixedStr}**. ¡Magnífico!`
                            : `Let's convert! 🌀\n\nDivide **${n} ÷ ${d}**.\n• Fits **${whole}** times (Whole).\n• Remainder **${rem}**.\n\nMixed Result: **${mixedStr}**.`,
                        visualType: "text_only",
                        visualData: { ...lastState, phase: 'post_analysis_closing' },
                        speech: lang === 'es' ? `Convertimos a mixto: ${whole} enteros y ${rem} sobrantes.` : `Converted to mixed: ${whole} and ${rem} remainder.`,
                        detailedExplanation: { es: "Conversión mixta", en: "Mixed conversion" }
                    }]
                };
            } else if (isThree) {
                const dec = (n / d).toFixed(2);
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Modo decimal activado! 🤖\n\nDividimos el de arriba por el de abajo: **${n} ÷ ${d}**.\n\nResultado: **${dec}**. ¡Parece dinero!`
                            : `Decimal mode! 🤖\n\nDivide top by bottom: **${n} ÷ ${d}**.\n\nResult: **${dec}**.`,
                        visualType: "text_only",
                        visualData: { ...lastState, phase: 'post_analysis_closing' },
                        speech: lang === 'es' ? `En decimal es ${dec}.` : `It's ${dec} in decimal.`
                    }]
                };
            } else if (isFour) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡A la vida real! 🍕\n\nImagina que tienes pizzas cortadas en **${d}** pedazos.\nTú tienes **${n}** pedazos.\n\n¡Eso es lo que significa **${n}/${d}**! ¿Te dio hambre?`
                            : `Real life! 🍕\n\nImagine pizzas cut into **${d}** slices.\nYou have **${n}** slices.\n\nThat's what **${n}/${d}** means! Hungry?`,
                        visualType: "text_only",
                        visualData: { ...lastState, phase: 'post_analysis_closing' },
                        speech: lang === 'es' ? "Imagina pizzas." : "Imagine pizzas."
                    }]
                };
            } else if (isOne) {
                return {
                    steps: [{
                        text: lang === 'es' ? "¡Perfecto! Nos quedamos con la fracción clásica. Es elegante y pura. ✨" : "Perfect! We keep the classic fraction.",
                        visualType: "text_only",
                        visualData: { ...lastState, phase: 'post_analysis_closing' },
                        speech: lang === 'es' ? "Dejamos la fracción así." : "We keep the fraction."
                    }]
                };
            }
        }

        // 4. Closing / Final Verification
        if (lastState.phase === 'post_analysis_closing') {
            return {
                steps: [{
                    text: lang === 'es' ? "¡Has hecho un trabajo increíble! 🌈\n\nPregunta rápida para irnos: ¿Te gustó aprender sobre fracciones hoy? (Sí/No)" : "Amazing work! 🌈\n\nQuick question: Did you enjoy learning fractions today?",
                    visualType: "text_only",
                    visualData: { ...lastState, phase: 'post_analysis_done' },
                    speech: lang === 'es' ? "¡Buen trabajo! ¿Te gustó la clase?" : "Good job! Did you like the class?"
                }]
            };
        }

        if (lastState.phase === 'post_analysis_done') {
            return {
                steps: [{
                    text: lang === 'es' ? "¡Esa es la actitud! Sigue así, campeón/a. 🚀 Fin." : "That's the spirit! Keep it up. 🚀 The End.",
                    visualType: "text_only",
                    visualData: { ...lastState, isDone: true, highlight: 'done' },
                    speech: lang === 'es' ? "¡Hasta la próxima!" : "See you next time!"
                }]
            };
        }

        return this.handleAddSubtraction(input, prob, lang, history, lastState, studentName); // Fallback
    }

    // ==========================================
    // ✂️ SIMPLIFICATION
    // ==========================================
    private static handleSimplification(input: string, prob: any, lang: 'es' | 'en', history: any[], lastState: any, studentName?: string): StepResponse | null {
        const n1 = parseInt(lastState?.num1 || prob.n1);
        const d1 = parseInt(lastState?.den1 || prob.d1);

        // AUTO-CALCULATE GCD for validation
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(n1, d1);
        const isIrreducible = divisor === 1;

        if (prob.isNew) {
            if (isIrreducible) {
                return {
                    steps: [{
                        text: lang === 'es' ? `¡Esta fracción ya es irreductible! No podemos simplificarla más.` : `This fraction is already irreducible!`,
                        speech: lang === 'es' ? `Ya está simplificada.` : `It is already simple.`,
                        visualType: "fraction",
                        visualData: { num1: String(n1), den1: String(d1), highlight: "done" } as any,
                        detailedExplanation: { es: "Fracción irreductible", en: "Irreducible fraction" }
                    }]
                };
            }

            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Vamos a simplificar! ✂️\n\nSimplificar significa hacer los números más pequeños pero manteniendo el mismo valor.\n\nEl truco es: Dividir arriba y abajo por el **mismo número**.\n\n¿Por cuál número podemos dividir al **${n1}** y al **${d1}** exactamente? (Prueba con 2, 3 o 5)`
                        : `Let's simplify! ✂️\n\nSimplifying means making the numbers smaller but keeping the value the same.\n\nThe trick is: Divide top and bottom by the **same number**.\n\nWhat number can we divide both **${n1}** and **${d1}** by exactly? (Try 2, 3, or 5)`,
                    speech: lang === 'es'
                        ? `¡Hola! ¡Vamos a poner esta fracción a dieta! Jajaja. Simplificar es súper fácil: solo divide arriba y abajo por el mismo número. ¿Por cuál número podemos dividir al ${n1} y al ${d1}? ¡Intenta con el 2 o el 3!`
                        : `Hi! Let's put this fraction on a diet! Hahaha. Simplifying is super easy: just divide top and bottom by the same number. What number divides both ${n1} and ${d1}? Try 2 or 3!`,
                    visualType: "fraction_expression",
                    visualData: { num1: String(n1), den1: String(d1), operator: 'simplify', phase: 'ask_divisor' } as any,
                    detailedExplanation: { es: "Introducción simplificación", en: "Simplification intro" }
                }]
            };
        }

        if (lastState?.phase === 'ask_divisor') {
            const userDivisor = parseInt(input);
            const isValidDivisor = !isNaN(userDivisor) && (n1 % userDivisor === 0) && (d1 % userDivisor === 0) && userDivisor > 1;

            if (isValidDivisor) {
                const newN = n1 / userDivisor;
                const newD = d1 / userDivisor;
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Muy bien! Ambos se pueden dividir por **${userDivisor}**. ✅\n\nSi dividimos:\n• ${n1} ÷ ${userDivisor} = **${newN}**\n• ${d1} ÷ ${userDivisor} = **${newD}**\n\n¡Nuestra fracción simplificada es **${newN}/${newD}**! ¿Ves qué fácil?`
                            : `Very good! Both can be divided by **${userDivisor}**. ✅\n\nIf we divide:\n• ${n1} ÷ ${userDivisor} = **${newN}**\n• ${d1} ÷ ${userDivisor} = **${newD}**\n\nOur simplified fraction is **${newN}/${newD}**! See how easy?`,
                        speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} Dividimos por ${userDivisor} y nos queda ${newN} sobre ${newD}.` : `${getCorrectFeedback(lang, studentName)} We divide by ${userDivisor} and get ${newN} over ${newD}.`,
                        visualType: "fraction_equation",
                        visualData: { num1: String(n1), den1: String(d1), operator: '→', result: `${newN}/${newD}`, multiplier: userDivisor, highlight: 'done' } as any,
                        detailedExplanation: { es: "Divisor correcto", en: "Factor de división correcto" }
                    }]
                };
            } else if (!isNaN(userDivisor)) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `Mmm, ese número no divide a los dos exactamente. 🤔\n\nIntenta con otro. Busca un número que esté en la tabla del **${n1}** y del **${d1}**.`
                            : `Hmm, that number doesn't divide both exactly. 🤔\n\nTry another one. Look for a number that fits into both **${n1}** and **${d1}**.`,
                        visualType: "fraction",
                        visualData: lastState,
                        speech: lang === 'es' ? `Intenta con otro número.` : `Try another number.`,
                        detailedExplanation: { es: "Divisor incorrecto", en: "Wrong divisor" }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡No te pierdas! 🚀\n\nEstamos buscando un número que pueda dividir al **${n1}** y al **${d1}** al mismo tiempo.\n\nPrueba con el **2**, el **3** o el **5**. ¿Cuál sirve?`
                            : `Stay with me! 🚀\n\nWe need a number that can divide both **${n1}** and **${d1}** at the same time.\n\nTry **2**, **3**, or **5**. Which one works?`,
                        speech: lang === 'es' ? `Dime un número para dividir.` : `Give me a number to divide by.`,
                        visualType: "fraction_expression",
                        visualData: lastState,
                        detailedExplanation: { es: "Persistencia socrática - divisor", en: "Socratic persistence - divisor" }
                    }]
                };
            }
        }
        return null;
    }

    private static handleDecimalConversion(input: string, prob: any, lang: 'es' | 'en', history: any[], lastState: any, studentName?: string): StepResponse | null {
        const n1 = parseInt(lastState?.num1 || prob.n1);
        const d1 = parseInt(lastState?.den1 || prob.d1);

        if (prob.isNew) {
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Convirtamos esta fracción en un número decimal! 🤖\n\nUna fracción es en realidad una **división esperando suceder**.\n\nPara obtener el decimal, solo debemos dividir al de arriba (**${n1}**) por el de abajo (**${d1}**).\n\n¿Cuánto es **${n1} ÷ ${d1}**?`
                        : `Let's turn this fraction into a decimal! 🤖\n\nA fraction is actually a **division waiting to happen**.\n\nTo get the decimal, we just divide the top (**${n1}**) by the bottom (**${d1}**).\n\nHow much is **${n1} ÷ ${d1}**?`,
                    speech: lang === 'es' ? `Para volverlo decimal, solo divide el de arriba por el de abajo.` : `To get a decimal, just divide the top by the bottom.`,
                    visualType: "fraction_expression",
                    visualData: { num1: String(n1), den1: String(d1), operator: '=', result: '?', phase: 'solve_division' } as any,
                    detailedExplanation: { es: "Introducción decimales", en: "Decimal intro" }
                }]
            };
        }

        if (lastState?.phase === 'solve_division') {
            const result = n1 / d1;
            const cleanInput = input.replace(',', '.');
            const validation = AnswerValidator.validate(cleanInput, result);

            if (validation.isCorrect) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Brillante! ✨\n\n**${n1} ÷ ${d1} = ${result}**\n\nAsí que la fracción **${n1}/${d1}** es lo mismo que el decimal **${result}**. ¡Ahora son gemelos!`
                            : `Brilliant! ✨\n\n**${n1} ÷ ${d1} = ${result}**\n\nSo the fraction **${n1}/${d1}** is the same as the decimal **${result}**. Now they are twins!`,
                        speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} Esa es la forma decimal.` : `${getCorrectFeedback(lang, studentName)} That is the decimal form.`,
                        visualType: "fraction_expression",
                        visualData: { ...lastState, result: String(result), highlight: 'done' },
                        detailedExplanation: { es: "Conversión exitosa", en: "Conversion success" }
                    }]
                };
            } else if (validation.isNumericInput) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `Casi... revisa tu división. ¿Cuánto da **${n1} ÷ ${d1}**?`
                            : `Close... check your division. What is **${n1} ÷ ${d1}**?`,
                        visualType: "fraction_expression",
                        visualData: lastState,
                        speech: lang === 'es' ? "Revisa la división." : "Check the division.",
                        detailedExplanation: { es: "Error en división", en: "Division error" }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Vamos! 🤖 Estamos buscando cuánto es **${n1} ÷ ${d1}**.\n\nPuedes usar una hoja o hacerlo mentalmente. ¿Cuál es el resultado?`
                            : `Come on! 🤖 We're looking for **${n1} ÷ ${d1}**.\n\nYou can use paper or do it mentally. What's the result?`,
                        speech: lang === 'es' ? `Divide ${n1} entre ${d1}.` : `Divide ${n1} by ${d1}.`,
                        visualType: "fraction_expression",
                        visualData: lastState,
                        detailedExplanation: { es: "Persistencia socrática - decimal", en: "Socratic persistence - decimal" }
                    }]
                };
            }
        }
        return null;
    }

    private static handleMultiplication(input: string, prob: any, lang: 'es' | 'en', history: any[], lastState: any, studentName?: string): StepResponse | null {
        const n1 = parseInt(lastState?.num1 || prob.n1);
        const d1 = parseInt(lastState?.den1 || prob.d1);
        const n2 = parseInt(lastState?.num2 || prob.n2);
        const d2 = parseInt(lastState?.den2 || prob.d2);

        if (prob.isNew) {
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Las fracciones son muy amigables para multiplicar! 🤝\n\nEl secreto es ir **directo**: multiplicamos el de arriba con el de arriba, y el de abajo con el de abajo.\n\nEmpecemos con los numeradores (arriba): ¿Cuánto es **${n1} × ${n2}**?`
                        : `Fractions are very friendly to multiply! 🤝\n\nThe secret is to go **straight across**: top times top, bottom times bottom.\n\nLet's start with the numerators (top): What is **${n1} × ${n2}**?`,
                    speech: lang === 'es'
                        ? `¡Las fracciones son mis mejores amigas! Multiplicarlas es lo más fácil del mundo porque vamos directo. ¡Como un carrito por la autopista! Multiplica los numeradores: ¿Cuánto es ${n1} por ${n2}?`
                        : `Fractions are my best friends! Multiplying them is the easiest thing ever because we go straight across. Like a car on a highway! Multiply the numerators: what is ${n1} times ${n2}?`,
                    visualType: "fraction_op",
                    visualData: { num1: String(n1), den1: String(d1), num2: String(n2), den2: String(d2), operator: '*', highlight: 'num' } as any,
                    detailedExplanation: { es: "Introducción a multiplicación", en: "Multiplication intro" }
                }]
            };
        }

        if (!lastState.productNum) {
            const expectNum = n1 * n2;
            const validation = AnswerValidator.validate(input, expectNum);
            if (validation.isCorrect) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Correcto! 💪 El nuevo numerador es **${expectNum}**.\n\nAhora vamos con los de abajo (denominadores). ¿Cuánto es **${d1} × ${d2}**?`
                            : `Correct! 💪 The new numerator is **${expectNum}**.\n\nNow for the bottom ones (denominators). What is **${d1} × ${d2}**?`,
                        speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} Ahora multiplica los denominadores de abajo.` : `${getCorrectFeedback(lang, studentName)} Now multiply the bottom denominators.`,
                        visualType: "fraction_op",
                        visualData: { ...lastState, result: `${expectNum}/?`, highlight: 'den', productNum: expectNum },
                        detailedExplanation: { es: "Multiplicación denominadores", en: "Denom mult" }
                    }]
                };
            } else if (validation.isNumericInput) {
                return {
                    steps: [{
                        text: lang === 'es' ? `Casi... ¿Cuánto es **${n1} × ${n2}**?` : `Close... what is **${n1} × ${n2}**?`,
                        visualType: "fraction_op",
                        visualData: { ...lastState, highlight: 'num' },
                        speech: lang === 'es' ? "Intenta de nuevo." : "Try again.",
                        detailedExplanation: { es: "Error en numerador", en: "Numerator error" }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es' ? `¡No te detengas! Multiplica los de arriba: **${n1} × ${n2}**.` : `Don't stop! Multiply the top: **${n1} × ${n2}**.`,
                        visualType: "fraction_op",
                        visualData: lastState,
                        speech: lang === 'es' ? "¿Cuánto es el de arriba?" : "What's the top number?",
                        detailedExplanation: { es: "Persistencia mult numerador", en: "Mult num persistence" }
                    }]
                };
            }
        }

        if (lastState.productNum && !lastState.isDone) {
            const expectDen = d1 * d2;
            const validation = AnswerValidator.validate(input, expectDen);
            if (validation.isCorrect) {
                const finalRes = `${lastState.productNum}/${expectDen}`;
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Eso es! 🎉 El resultado es **${finalRes}**.\n\nAhora vamos a analizar lo que obtuvimos. 👇\n\nExisten dos tipos de fracciones:\n🟢 **Propia**: El número de arriba es MENOR (ej: 1/2).\n🔴 **Impropia**: El número de arriba es MAYOR o igual (ej: 3/2).\n\nTu resultado es **${lastState.productNum}/${expectDen}**. ¿Es **propia** o **impropia**?`
                            : `That's it! 🎉 Result: **${finalRes}**.\n\nLet's analyze it. 👇\n\n🟢 **Proper**: Top number is SMALLER.\n🔴 **Improper**: Top number is BIGGER.\n\nIs **${lastState.productNum}/${expectDen}** **proper** or **improper**?`,
                        speech: lang === 'es' ? `Muy bien. Ahora dime, ¿esa fracción es propia o impropia?` : `Good. Now tell me, is it proper or improper?`,
                        visualType: "fraction_op",
                        visualData: { ...lastState, result: finalRes, highlight: 'done', isDone: false, phase: 'result_analysis_start', finalNum: lastState.productNum, finalDen: expectDen },
                        detailedExplanation: { es: "Análisis final", en: "Final analysis" }
                    }]
                };
            } else if (validation.isNumericInput) {
                return {
                    steps: [{
                        text: lang === 'es' ? `Casi... ¿Cuánto es **${d1} × ${d2}**?` : `Close... what is **${d1} × ${d2}**?`,
                        visualType: "fraction_op",
                        visualData: { ...lastState, highlight: 'den' },
                        speech: lang === 'es' ? "Intenta de nuevo." : "Try again.",
                        detailedExplanation: { es: "Error en denominador", en: "Denom error" }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es' ? `¡Ya casi! Multiplica los de abajo: **${d1} × ${d2}**.` : `Almost there! Multiply the bottom: **${d1} × ${d2}**.`,
                        visualType: "fraction_op",
                        visualData: lastState,
                        speech: lang === 'es' ? "¿Cuánto es el de abajo?" : "What's the bottom number?",
                        detailedExplanation: { es: "Persistencia mult denominador", en: "Mult den persistence" }
                    }]
                };
            }
        }
        return null;
    }

    private static handleDivision(input: string, prob: any, lang: 'es' | 'en', history: any[], lastState: any, studentName?: string): StepResponse | null {
        const n1 = parseInt(lastState?.num1 || prob.n1);
        const d1 = parseInt(lastState?.den1 || prob.d1);
        const n2 = parseInt(lastState?.num2 || prob.n2);
        const d2 = parseInt(lastState?.den2 || prob.d2);

        if (prob.isNew) {
            return {
                steps: [{
                    text: lang === 'es'
                        ? `La división de fracciones tiene un truco secreto... 🎩\n\nNo dividimos directamente. ¡Convertimos la división en multiplicación!\n\nPara hacerlo, debemos darle la vuelta a la **segunda fracción**. Si giramos **${n2}/${d2}**, ¿cómo nos queda?`
                        : `Fraction division has a secret trick... 🎩\n\nWe don't divide directly. We turn it into multiplication!\n\nTo do that, we must flip the **second fraction**. If we flip **${n2}/${d2}**, what do we get?`,
                    speech: lang === 'es'
                        ? `¡Huy, la división de fracciones tiene un truco de magia! 🎩 En realidad no se divide, ¡se voltea la segunda fracción y se multiplica! Girala: ¿Cómo queda ese ${n2} sobre ${d2} si lo ponemos de cabeza?`
                        : `Ooh, fraction division has a magic trick! 🎩 We don't actually divide, we flip the second fraction and multiply! Flip it: what does ${n2} over ${d2} look like upside down?`,
                    visualType: "fraction_expression",
                    visualData: { num1: String(n1), den1: String(d1), num2: String(n2), den2: String(d2), operator: '÷', highlight: 'num2', phase: 'ask_flip' } as any,
                    detailedExplanation: { es: "Introducción a división", en: "Division intro" }
                }]
            };
        }

        if (lastState?.phase === 'ask_flip') {
            const correctFraction = `${d2}/${n2}`;
            const clean = input.replace(/\s/g, '');
            const isMatch = clean.includes(correctFraction) || (clean.includes(String(d2)) && clean.includes(String(n2)));

            if (isMatch || AnswerValidator.validate(input, d2).isCorrect) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Exacto! 🤸‍♀️ Se convierte en **${d2}/${n2}** y el signo ahora es **multiplicación**! ✖️\n\n¿Cuál es el nuevo numerador? **${n1} × ${d2} = ?**`
                            : `Exactly! 🤸‍♀️ It becomes **${d2}/${n2}** and the sign is now **multiplication**! ✖️\n\nWhat's the new numerator? **${n1} × ${d2} = ?**`,
                        speech: lang === 'es' ? `${getCorrectFeedback(lang, studentName)} Ahora multiplicamos. ¿Cuánto es ${n1} por ${d2}?` : `${getCorrectFeedback(lang, studentName)} Now multiply. ${n1} times ${d2}?`,
                        visualType: "fraction_op",
                        visualData: { num1: String(n1), den1: String(d1), num2: String(d2), den2: String(n2), operator: '*', highlight: 'num', phase: 'solve_mult_num' } as any,
                        detailedExplanation: { es: "Conversión a multiplicación", en: "Convert to mult" }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `Recuerda: el de abajo sube y el de arriba baja. 🙃 ¿Cómo queda **${n2}/${d2}** al girarla?`
                            : `Remember: bottom goes up, top goes down. 🙃 How does **${n2}/${d2}** look flipped?`,
                        visualType: "fraction_op",
                        visualData: lastState,
                        speech: lang === 'es' ? "Solo dale la vuelta." : "Just flip it.",
                        detailedExplanation: { es: "Ayuda con inverso", en: "Reciprocal help" }
                    }]
                };
            }
        }

        if (lastState?.phase === 'solve_mult_num') {
            const effectiveN2 = parseInt(lastState.num2);
            const expectNum = n1 * effectiveN2;
            if (AnswerValidator.validate(input, expectNum).isCorrect) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Bien! Tenemos **${expectNum}** arriba.\n\nAhora los de abajo: **${d1} × ${lastState.den2}**. ¿Cuánto da?`
                            : `Good! We have **${expectNum}** on top.\n\nNow the bottom ones: **${d1} × ${lastState.den2}**. Result?`,
                        speech: lang === 'es' ? `Bien. Ahora los de abajo.` : `Good. Now the bottom ones.`,
                        visualType: "fraction_op",
                        visualData: { ...lastState, result: `${expectNum}/?`, highlight: 'den', phase: 'solve_mult_den', productNum: expectNum },
                        detailedExplanation: { es: "Multiplicación final", en: "Final mult" }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es' ? `Casi... ¿Cuánto es **${n1} × ${effectiveN2}**?` : `Close... what is **${n1} × ${effectiveN2}**?`,
                        visualType: "fraction_op",
                        visualData: lastState,
                        speech: lang === 'es' ? "Intenta de nuevo." : "Try again.",
                        detailedExplanation: { es: "Error mult num", en: "Error mult num" }
                    }]
                };
            }
        }

        if (lastState?.phase === 'solve_mult_den') {
            const effectiveD2 = parseInt(lastState.den2);
            const expectDen = d1 * effectiveD2;
            if (AnswerValidator.validate(input, expectDen).isCorrect) {
                const finalRes = `${lastState.productNum}/${expectDen}`;
                return {
                    steps: [{
                        text: lang === 'es' ? `¡Fantástico! 🎩✨ El resultado es **${finalRes}**.\n\nNow: ¿Es **propia** (arriba menor) o **impropia** (arriba mayor)?` : `Fantastic! 🎩✨ Result: **${finalRes}**.\n\nNow: Is it **proper** (top smaller) or **improper** (top bigger)?`,
                        speech: lang === 'es'
                            ? `¡Fantástico! Resultado ${finalRes}. ¿Es propia o impropia?`
                            : `Fantastic! Result ${finalRes}. Is it proper or improper?`,
                        visualType: "fraction_op",
                        visualData: { ...lastState, result: finalRes, highlight: 'done', isDone: false, phase: 'result_analysis_start', finalNum: lastState.productNum, finalDen: expectDen },
                        detailedExplanation: { es: "División completada", en: "Division complete" }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es' ? `Casi... ¿Cuánto es **${d1} × ${effectiveD2}**?` : `Close... what is **${d1} × ${effectiveD2}**?`,
                        visualType: "fraction_op",
                        visualData: lastState,
                        speech: lang === 'es' ? "Intenta de nuevo." : "Try again.",
                        detailedExplanation: { es: "Error mult den", en: "Error mult den" }
                    }]
                };
            }
        }
        return null;
    }

    private static readonly FRACTION_MCM_SEEN_KEY = 'nova_math_fraction_mcm_seen';

    /** Detect "no sé" / "no entiendo" / "ayuda" etc. to offer hints and rephrase with target. */
    private static isDontKnow(input: string): boolean {
        const t = input.trim().toLowerCase().replace(/\s+/g, ' ');
        if (/^(no\s+(se|sé|lo\s+se|lo\s+sé|sabemos?|entiendo|lo\s+entiendo|puedo|puedo\s+hacerlo|recuerdo|tengo\s+idea|me\s+sale|me\s+da)|no\s+se\s+como|no\s+sé\s+cómo)/i.test(t)) return true;
        if (/^(i\s+don'?t\s+know|dunno|i\s+don'?t\s+understand|i\s+can'?t|i\s+don'?t\s+get\s+it|no\s+idea|ayuda|help|pista|hint)/i.test(t)) return true;
        return false;
    }

    private static hasSeenMCMExplanation(): boolean {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem(FractionTutor.FRACTION_MCM_SEEN_KEY) === '1';
        } catch {
            return false;
        }
    }

    private static setMCMExplanationSeen(): void {
        try {
            if (typeof window !== 'undefined') localStorage.setItem(FractionTutor.FRACTION_MCM_SEEN_KEY, '1');
        } catch { /* ignore */ }
    }

    private static handleAddSubtraction(input: string, prob: any, lang: 'es' | 'en', history: any[], lastState: any, studentName?: string): StepResponse | null {
        // --- PRE-CALCULATE VARIABLES ---
        let n1: number, d1: number, n2: number, d2: number, op: string;
        let effectiveRemaining: { n: number; d: number; op?: string }[] | undefined;

        if (lastState?.originalOp) {
            const o = lastState.originalOp;
            n1 = parseInt(String(o.n1));
            d1 = parseInt(String(o.d1));
            n2 = parseInt(String(o.n2));
            d2 = parseInt(String(o.d2));
            op = o.operator || '+';
            effectiveRemaining = o.extraFracs || o.remaining;
        } else {
            n1 = parseInt(lastState?.num1 || prob?.n1);
            d1 = parseInt(lastState?.den1 || prob?.d1);
            n2 = parseInt(lastState?.num2 || prob?.n2);
            d2 = parseInt(lastState?.den2 || prob?.d2);
            op = lastState?.operator || prob?.op || '+';
            effectiveRemaining = prob?.remaining;
        }

        const isHomogeneous = !isNaN(d1) && !isNaN(d2) && d1 === d2;

        // --- PHASE ROUTING ---

        // 1. Chained Answer (Same Denom)
        if (prob?.isChainedAnswer && lastState?.phase === 'chained_same_denom') {
            const expected = lastState.expectedSum;
            if (AnswerValidator.validate(input, expected).isCorrect) {
                const resN = lastState.resultNumerator + (lastState.nextOp === '-' ? -lastState.nextNum : lastState.nextNum);
                const den = lastState.resultDenom;
                const finalRes = resN === den ? '1' : resN <= 0 ? '0' : `${resN}/${den}`;
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Perfecto! 🎉 Resultado: **${finalRes}**.\n\nRepaso flash: ⚡\n🟢 **Propia**: Numerador < Denominador.\n🔴 **Impropia**: Numerador ≥ Denominador.\n\n¿Esta fracción es **propia** o **impropia**?`
                            : `Perfect! 🎉 Result: **${finalRes}**.\n\nFlash review: ⚡\n🟢 **Proper**: Num < Den.\n🔴 **Improper**: Num ≥ Den.\n\nIs this one **proper** or **improper**?`,
                        speech: lang === 'es' ? `¡Bien hecho! El resultado es ${finalRes}. ¿Es propia o impropia?` : `Well done! The result is ${finalRes}. Is it proper or improper?`,
                        visualType: "fraction_op",
                        visualData: { ...lastState, result: finalRes, highlight: "done", isDone: false, phase: 'result_analysis_start', finalNum: resN, finalDen: den } as any,
                        detailedExplanation: { es: "Completado", en: "Completed" }
                    }]
                };
            }
        }

        // 2. New Problem Intro
        if (prob.isNew) {
            if (isHomogeneous) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Muy bien! Los denominadores son iguales (**${d1}**). 🤩\n\nSolo **${op === '+' ? 'sumas' : 'restas'} los números de arriba** y mantienes el mismo denominador abajo. ¿Cuánto da?`
                            : `Very well! The denominators are the same (**${d1}**). 🤩\n\nJust **${op === '+' ? 'add' : 'subtract'} the numbers on top** and keep the same denominator. What is it?`,
                        speech: lang === 'es' ? `Denominadores iguales. Opera los de arriba.` : `Same denominators. Opera los de arriba.`,
                        visualType: "fraction_op",
                        visualData: { num1: String(n1), den1: String(d1), num2: String(n2), den2: String(d2), operator: op, highlight: "num" },
                        detailedExplanation: { es: "Fracciones homogéneas", en: "Homogeneous fractions" }
                    }]
                };
            } else {
                // Return LCM List immediately (The "Dos Listos" method)
                const allDenomsMcm = effectiveRemaining?.length ? [d1, d2, ...effectiveRemaining.map((x: any) => x.d)] : [d1, d2];
                const lcm = allDenomsMcm.length > 2 ? StateHelper.lcmOfMany(allDenomsMcm) : StateHelper.lcm(d1, d2);
                const lists = allDenomsMcm.map(den => ({
                    base: den,
                    items: Array.from({ length: 10 }, (_, i) => den * (i + 1))
                }));

                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Hola! 👋 Como los denominadores son diferentes (**${allDenomsMcm.join(', ')}**), necesitamos encontrar el **mínimo común múltiplo (MCM)** para que sean iguales.\n\nHe puesto las tablas de multiplicar de los denominadores en la pizarra. 👇\n\n**¿Cuál es el primer número que aparece en todas las tablas?**`
                            : `Hi! 👋 Since the denominators are different (**${allDenomsMcm.join(', ')}**), we need the **lowest common multiple (LCM)** to make them equal.\n\nI've put the multiplication tables on the board. 👇\n\n**What's the first number that appears in all tables?**`,
                        speech: lang === 'es'
                            ? `Hola. Como los denominadores son diferentes, busquemos el mínimo común múltiplo en las tablas. ¿Cuál es el primer número que se repite?`
                            : `Since the denominators are different, let's find the LCM in the tables. Which number repeats first?`,
                        visualType: "fraction",
                        visualData: {
                            type: "lcm_list",
                            num1: String(n1), den1: String(d1), num2: String(n2), den2: String(d2),
                            operator: op,
                            lists: lists,
                            match: lcm,
                            highlightMatch: false,
                            originalOp: { n1, d1, n2, d2, operator: op, extraFracs: effectiveRemaining }
                        } as any,
                        detailedExplanation: { es: "Búsqueda directa de MCM", en: "Direct LCM search" }
                    }]
                };
            }
        }

        // 3. MCM List
        if (lastState?.phase === 'mcm_intro' || (lastState?.type === 'mcm_intro')) {
            const allDenomsMcm = effectiveRemaining?.length ? [d1, d2, ...effectiveRemaining.map((x: any) => x.d)] : [d1, d2];
            const lcm = allDenomsMcm.length > 2 ? StateHelper.lcmOfMany(allDenomsMcm) : StateHelper.lcm(d1, d2);
            const lists = allDenomsMcm.map(den => ({
                base: den,
                items: Array.from({ length: 10 }, (_, i) => den * (i + 1))
            }));

            return {
                steps: [{
                    text: lang === 'es'
                        ? `Busquemos el **MCM**. ¿Cuál es el primer número que se repite en todas las tablas de abajo?`
                        : `Let's find the **LCM**. Which is the first number that repeats in all tables below?`,
                    speech: lang === 'es' ? `Busca el MCM en las tablas.` : `Find the LCM in the tables.`,
                    visualType: "fraction",
                    visualData: {
                        type: "lcm_list",
                        num1: String(n1), den1: String(d1), num2: String(n2), den2: String(d2),
                        operator: op,
                        lists: lists,
                        match: lcm,
                        highlightMatch: false,
                        originalOp: { n1, d1, n2, d2, operator: op, extraFracs: effectiveRemaining }
                    } as any,
                    detailedExplanation: { es: "Búsqueda de MCM", en: "LCM search" }
                }]
            };
        }

        // 4. LCM Validation
        if (lastState?.type === 'lcm_list' && !lastState.highlightMatch) {
            const lcm = lastState?.match ?? StateHelper.lcm(d1, d2);
            if (this.isDontKnow(input)) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Tranquilo! 💙 El **MCM** es **${lcm}**. Es el **primer número que se repite** en las tablas. ¿Lo ves? Escribe ese número.`
                            : `No worries! 💙 The **LCM** is **${lcm}**. It's the **first number that appears** in the tables. See it? Type that number.`,
                        speech: lang === 'es' ? `El MCM es ${lcm}.` : `The LCM is ${lcm}.`,
                        visualType: "fraction", visualData: lastState
                    }]
                };
            }
            if (AnswerValidator.validate(input, lcm).isCorrect) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Exacto! El **${lcm}** es nuestro MCM. 🌟\n\nAhora: **¿Por cuánto multiplicamos al ${d1} para que dé ${lcm}?**`
                            : `Exactly! **${lcm}** is our LCM. 🌟\n\nNow: **What do we multiply ${d1} by to get ${lcm}?**`,
                        speech: lang === 'es' ? `MCM es ${lcm}. ¿Por cuánto multiplicamos al ${d1}?` : `LCM is ${lcm}. What do we multiply ${d1} by?`,
                        visualType: "fraction_equation",
                        visualData: { ...lastState, phase: 'multiplier1', highlight: 'den1', commonDen: String(lcm) } as any
                    }]
                };
            }
        }

        // 5. Mult 1
        if (lastState?.phase === 'multiplier1') {
            const commonDen = parseInt(lastState?.commonDen || "1");
            const mult = commonDen / d1;
            if (AnswerValidator.validate(input, mult).isCorrect) {
                return {
                    steps: [{
                        text: lang === 'es' ? `¡Bien! Multiplicamos por **${mult}**. ¿Cuánto es **${n1} × ${mult}** arriba?` : `Good! Multiply by **${mult}**. What's **${n1} × ${mult}** on top?`,
                        speech: lang === 'es' ? `Multiplica arriba por ${mult}.` : `Multiply top by ${mult}.`,
                        visualType: "fraction_equation",
                        visualData: { ...lastState, phase: 'numerator1', multiplier: mult, highlight: 'num1' }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Vamos! 💪 Estamos buscando por qué número hay que multiplicar al **${d1}** para llegar a **${commonDen}**.\n\nPiensa: **${d1} × ? = ${commonDen}**`
                            : `Let's go! 💪 We are looking for the number to multiply **${d1}** by to get **${commonDen}**.\n\nThink: **${d1} × ? = ${commonDen}**`,
                        speech: lang === 'es' ? `¿Por cuánto multiplicamos al ${d1} para que nos dé ${commonDen}?` : `What do we multiply ${d1} by to get ${commonDen}?`,
                        visualType: "fraction_equation",
                        visualData: lastState
                    }]
                };
            }
        }

        // 6. Num 1
        if (lastState?.phase === 'numerator1') {
            const mult = lastState?.multiplier || 1;
            const expectedN1 = n1 * mult;
            if (AnswerValidator.validate(input, expectedN1).isCorrect) {
                const lcm = parseInt(lastState?.commonDen || "1");
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Listo! Ya tenemos **${expectedN1}/${lcm}**.\n\nAhora la segunda: **¿Por cuánto multiplicamos al ${d2} para que dé ${lcm}?**`
                            : `Done! We have **${expectedN1}/${lcm}**.\n\nNow the second: **What do we multiply ${d2} by to get ${lcm}?**`,
                        speech: lang === 'es' ? `Segunda fracción: ¿Por cuánto multiplicamos al ${d2} para que dé ${lcm}?` : `Second fraction: What do we multiply ${d2} by to get ${lcm}?`,
                        visualType: "fraction_equation",
                        visualData: { ...lastState, num1: String(n2), den1: String(d2), newNum1: String(expectedN1), phase: 'multiplier2', highlight: 'den1' } as any
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Casi! No olvides multiplicar arriba también por **${mult}**.\n\n¿Cuánto es **${n1} × ${mult}**?`
                            : `Close! Don't forget to multiply the top by **${mult}** as well.\n\nWhat is **${n1} × ${mult}**?`,
                        speech: lang === 'es' ? `¿Cuánto es ${n1} por ${mult}?` : `What is ${n1} times ${mult}?`,
                        visualType: "fraction_equation",
                        visualData: lastState
                    }]
                };
            }
        }

        // 7. Mult 2
        if (lastState?.phase === 'multiplier2') {
            const commonDen = parseInt(lastState?.commonDen || "1");
            const mult = commonDen / d2;
            if (AnswerValidator.validate(input, mult).isCorrect) {
                return {
                    steps: [{
                        text: lang === 'es' ? `¡Eso! Multiplicamos por **${mult}**. ¿Cuánto es **${n2} × ${mult}** arriba?` : `That's it! Multiply by **${mult}**. What's **${n2} × ${mult}** on top?`,
                        speech: lang === 'es' ? `Ahora arriba: ${n2} por ${mult}.` : `Now top: ${n2} times ${mult}.`,
                        visualType: "fraction_equation",
                        visualData: { ...lastState, phase: 'numerator2', multiplier: mult, highlight: 'num1' }
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Tú puedes! 💪 Piensa por cuánto multiplicamos al **${d2}** para llegar a **${commonDen}**.\n\n**${d2} × ? = ${commonDen}**`
                            : `You can do it! 💪 Think: what do we multiply **${d2}** by to reach **${commonDen}**.\n\n**${d2} × ? = ${commonDen}**`,
                        speech: lang === 'es' ? `¿Por cuánto multiplicamos al ${d2} para que nos dé ${commonDen}?` : `What do we multiply ${d2} by to get ${commonDen}?`,
                        visualType: "fraction_equation",
                        visualData: lastState
                    }]
                };
            }
        }

        // 8. Num 2
        if (lastState?.phase === 'numerator2') {
            const mult = lastState?.multiplier || 1;
            const expectedN2 = n2 * mult;
            if (AnswerValidator.validate(input, expectedN2).isCorrect) {
                const n1_c = parseInt(lastState?.newNum1 || "0");
                const den = parseInt(lastState?.commonDen || "1");
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Increíble! Ya son iguales:\n**${n1_c}/${den} ${op} ${expectedN2}/${den}**\n\n¿Cuál es el resultado final?`
                            : `Incredible! Now they are equal:\n**${n1_c}/${den} ${op} ${expectedN2}/${den}**\n\nWhat's the final result?`,
                        speech: lang === 'es' ? `Ya son iguales. Haz la operación final.` : `Now equal. Final operation.`,
                        visualType: "fraction_op",
                        visualData: { num1: String(n1_c), den1: String(den), num2: String(expectedN2), den2: String(den), operator: op, highlight: 'num', commonDen: String(den), originalOp: lastState.originalOp } as any
                    }]
                };
            } else {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Casi! Multiplica el de arriba también por **${mult}**.\n\n¿Cuánto es **${n2} × ${mult}**?`
                            : `Close! Multiply the top by **${mult}** as well.\n\nWhat is **${n2} × ${mult}**?`,
                        speech: lang === 'es' ? `¿Cuánto es ${n2} por ${mult}?` : `What is ${n2} times ${mult}?`,
                        visualType: "fraction_equation",
                        visualData: lastState
                    }]
                };
            }
        }

        // 9. Final Sum Validation
        const resN = op === '+' ? n1 + n2 : n1 - n2;
        const denV = d1; // Logic assumes d1=d2 at this point

        let isCorrect = false;
        const cleanInput = input.trim().toLowerCase().replace(/\s/g, '');
        if (cleanInput.includes('/')) {
            const parts = cleanInput.split('/');
            isCorrect = (parseInt(parts[0]) === resN && parseInt(parts[1]) === denV);
        } else {
            isCorrect = AnswerValidator.validate(input, resN).isCorrect;
        }

        if (isCorrect) {
            const finalRes = `${resN}/${denV}`;
            // Handle Chained
            if (effectiveRemaining?.length) {
                const next = effectiveRemaining[0];
                const nextOp = next.op || '+';
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Perfecto! **${finalRes}**. Ahora sigue **${finalRes} ${nextOp} ${next.n}/${next.d}**.`
                            : `Perfect! **${finalRes}**. Now next is **${finalRes} ${nextOp} ${next.n}/${next.d}**.`,
                        speech: lang === 'es' ? `Perfecto. Ahora sigue con ${next.n}/${next.d}.` : `Perfect. Now continue with ${next.n}/${next.d}.`,
                        visualType: "fraction_op",
                        visualData: {
                            num1: String(resN), den1: String(denV), num2: String(next.n), den2: String(next.d),
                            operator: nextOp, phase: 'chained_same_denom',
                            resultNumerator: resN, resultDenom: denV, nextNum: next.n, nextDenom: next.d, nextOp,
                            originalOp: { ...lastState.originalOp, n1: resN, d1: denV, n2: next.n, d2: next.d, operator: nextOp, extraFracs: effectiveRemaining.slice(1) }
                        } as any
                    }]
                };
            }
            // Not chained, do analysis
            return {
                steps: [{
                    text: lang === 'es' ? `¡Fantástico! 🎉 El resultado es **${finalRes}**. ¿Es propia o impropia?` : `Fantastic! 🎉 Result: **${finalRes}**. Proper or improper?`,
                    speech: lang === 'es' ? `Resultado ${finalRes}. ¿Propia o impropia?` : `Result ${finalRes}. Proper or improper?`,
                    visualType: "fraction_op",
                    visualData: { ...lastState, result: finalRes, highlight: 'done', isDone: false, phase: 'result_analysis_start', finalNum: resN, finalDen: denV } as any
                }]
            };
        } else {
            // Reprompt for final sum if not correct and in this scope
            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡No te rindas! 🤖 Opera los números de arriba: **${n1}/${d1} ${op} ${n2}/${d1}**.\n\n¿Cuál es el resultado?`
                        : `Don't give up! 🤖 Just operate the numbers on top: **${n1}/${d1} ${op} ${n2}/${d1}**.\n\nWhat is the result?`,
                    speech: lang === 'es' ? `Opera los de arriba y mantén el denominador.` : `Operate the top numbers and keep the denominator.`,
                    visualType: "fraction_op",
                    visualData: lastState
                }]
            };
        }

        return null;
    }
}
