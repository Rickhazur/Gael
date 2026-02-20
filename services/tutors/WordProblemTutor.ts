/**
 * Tutor estructurado para problemas verbales: tanque (capacidad, mitad, fracción, añadir, faltan)
 * y genéricos (suma/resta de cantidades). Misma secuencia para todos: pizarra con palabras clave
 * coloreadas y respuesta siempre (incl. "no sé" / respuestas negativas).
 */

import { StepResponse } from './types';
import { StateHelper } from './utils';
import type { WordProblemParsed, GenericWordProblemParsed, MultiStepWordProblemParsed, GeometryWordProblemParsed, ProportionWordProblemParsed } from '../../data/wordProblemParser';
import { ProportionTutor } from './ProportionTutor';

type WPPhase = 'intro' | 'dato_1' | 'dato_2' | 'dato_3' | 'op' | 'parte_1_intro' | 'parte_1_resolver' | 'parte_2_intro' | 'parte_2_resolver' | 'intro_understand' | 'socratic_1' | 'socratic_2' | 'socratic_3' | 'socratic_4' | 'socratic_5' | 'socratic_6' | 'socratic_7' | 'socratic_8' | 'socratic_9' | 'socratic_10' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'strategy' | 'calc_units' | 'calc_revenue' | 'calc_profit' | 'perimeter' | 'area' | 'squares' | 'done';

type AnyWordProblem = any;

function parseFloatInput(input: string): number | null {
    // Acepta "100", "100L", "100 L", "100 litros", "100.5", "100,5" etc.
    const normalized = input.trim().replace(',', '.').replace(/\s*(L|litros?|liters?)\s*$/i, '').trim();
    const m = normalized.match(/-?\d+\.?\d*/);
    return m ? parseFloat(m[0]) : null;
}

/** Cualquier respuesta negativa o de duda: no sé, no entiendo, vacío, ayuda, pista, etc. → continuar con la explicación. Nunca dejar al niño sin respuesta. */
function isDontKnow(input: string): boolean {
    const t = input.trim().toLowerCase().replace(/\s+/g, ' ');
    // Vacío o solo espacios → tratar como "no sé" para no quedarnos callados
    if (!t) return true;
    // Respuestas cortas negativas
    if (/^(no|nope|nose|nono|na|n)$/i.test(t)) return true;
    // "No sé / no se" (con o sin tilde) y con posible punto o interrogación al final
    if (/^no\s*s[eé]\s*[.?]?$/i.test(t)) return true;
    // "No sé / no entiendo / no puedo" y variantes (ES/EN)
    if (/^(no\s+(se|sé|lo\s+se|lo\s+sé|sabemos?|entiendo|lo\s+entiendo|puedo|puedo\s+hacerlo|recuerdo|tengo\s+idea|me\s+sale|me\s+da)|no\s+se\s+como|no\s+sé\s+cómo)\s*[.?]?$/i.test(t)) return true;
    if (/^(i\s+don'?t\s+know|dunno|i\s+don'?t\s+understand|i\s+can'?t|i\s+don'?t\s+get\s+it|no\s+idea)/i.test(t)) return true;
    // "Ni idea / quién sabe / no tengo idea / paso / siguiente"
    if (/^(ni\s+idea|qui[eé]n\s+sabe|no\s+tengo\s+idea|paso|siguiente|skip|no\s+tengo)/i.test(t)) return true;
    // Petición de ayuda
    if (/^(ayuda|help|socorro|pista|hint|explicame|explícame|explicame\s+otra\s+vez|no\s+entendi)/i.test(t)) return true;
    // "Estoy trabado / atascado"
    if (/^(estoy\s+(trabado|atascado|perdido)|i'?m\s+stuck|trabado|atascado)/i.test(t)) return true;
    // "No lo logro / no me sale"
    if (/^(no\s+lo\s+logro|no\s+me\s+sale|no\s+me\s+da|no\s+da\s+bien)/i.test(t)) return true;
    return false;
}

/** Detecta respuestas típicas del niño en el diálogo socrático (fracciones + km). Más variantes. */
function matchesSocratic(input: string, step: 'story' | 'once_twice' | 'moments' | 'morning' | 'afternoon' | 'compare' | 'op' | 'write_op' | 'same_denom' | 'what_first' | 'mcm_num', frac1?: { num: number; den: number }, frac2?: { num: number; den: number }): boolean {
    const t = input.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!t) return false;
    switch (step) {
        case 'story':
            return /\b(juan|caminando|caminar|caminó|camino|historia|problema|kilómetro|kilometro|km|excursi[oó]n|de\s+juan|juan\s+que\s+camina|un\s+niño|una\s+persona|un\s+señor|habla\s+de|trata\s+de)\b/i.test(t) || t.length > 3;
        case 'once_twice':
            return /\b(dos|2|dos\s+veces|dos\s+momentos|en\s+dos|dos\s+partes|primero\s+y\s+después|en\s+dos\s+momentos|two|twice|two\s+times)\b/i.test(t);
        case 'moments':
            return /\b(mañana|tarde|morning|afternoon|por\s+la\s+mañana|por\s+la\s+tarde|la\s+mañana\s+y\s+la\s+tarde|mañana\s+y\s+tarde|in\s+the\s+morning|in\s+the\s+afternoon)\b/i.test(t);
        case 'morning':
            if (frac1 == null) return false;
            const morningTerms = /\b(mañana|morning|primera?|first|comió|ate|pizza|kilómetro|kilometro|km)\b/i;
            return t.includes(`${frac1.num}/${frac1.den}`) || t.includes(`${frac1.num} ${frac1.den}`) ||
                morningTerms.test(t) ||
                (/\b(3|tres|tres\s*cuartos?|3\s*cuartos?)\b/i.test(t) && frac1.num === 3 && frac1.den === 4) ||
                new RegExp(`\\b${frac1.num}\\s*[\\/\\s]\\s*${frac1.den}\\b`).test(t);
        case 'afternoon':
            if (frac2 == null) return false;
            const afternoonTerms = /\b(tarde|afternoon|segunda?|second|hermano|brother|pizza|kilómetro|kilometro|km)\b/i;
            return t.includes(`${frac2.num}/${frac2.den}`) || t.includes(`${frac2.num} ${frac2.den}`) ||
                afternoonTerms.test(t) ||
                (/\b(2|dos|dos\s*quintos?|2\s*quintos?|un\s*sexto|1\s*sexto)\b/i.test(t)) ||
                new RegExp(`\\b${frac2.num}\\s*[\\/\\s]\\s*${frac2.den}\\b`).test(t);
        case 'compare':
            return /\b(juntar|sumar|add|total|en\s+total|juntar\s+todo|sumar\s+todo|el\s+total|cuánto\s+en\s+total|agregar|reunir|juntar\s+las\s+cantidades|put\s+together)\b/i.test(t);
        case 'op':
            return /\b(sumar|suma|add|más|\+|plus|la\s+suma|agregar|adicionar)\b/i.test(t);
        case 'write_op':
            if (frac1 == null || frac2 == null) return false;
            const hasPlus = /\+|\bmás\b|plus/i.test(t);
            const hasF1 = t.includes(`${frac1.num}/${frac1.den}`) || t.includes('3/4') || (frac1.num === 3 && frac1.den === 4 && /\b3\s*\/\s*4\b/.test(t));
            const hasF2 = t.includes(`${frac2.num}/${frac2.den}`) || t.includes('2/5') || (frac2.num === 2 && frac2.den === 5 && /\b2\s*\/\s*5\b/.test(t));
            return hasPlus && (hasF1 || hasF2 || /\d+\s*\/\s*\d+/.test(t));
        case 'same_denom':
            return /\b(no|nope|distintos?|diferentes?|iguales?\s*no|no\s+son\s+iguales|uno\s+es\s+4|uno\s+es\s+5|not\s+equal|different)\b/i.test(t);
        case 'what_first':
            return /\b(hacerlos?\s+iguales?|mcm|mínimo\s+común|m\.?c\.?m\.?|denominador\s+común|igualar|buscar\s+un\s+común|común\s+denominador|convertir|un\s+número\s+que\s+sirva|igualar\s+denominadores|lcm|least\s+common)\b/i.test(t);
        case 'mcm_num':
            return true;
        default:
            return false;
    }
}

/** Highlights con los primeros `confirmedCount` datos en dorado (confirmados). El resto igual. */
function highlightsWithConfirmed(highlights: { text: string; color: string }[] | undefined, confirmedCount: number): { text: string; color: string }[] {
    if (!highlights || !highlights.length) return [];
    return highlights.map((h, i) => i < confirmedCount ? { ...h, color: 'gold' } : { ...h });
}

/** Para multi_step con todo el problema: solo los números (índices en numberIndices) pasan a dorado al confirmar. */
function highlightsWithConfirmedMultiStep(
    fullHighlights: { text: string; color: string }[],
    numberIndices: number[],
    confirmedNumberCount: number
): { text: string; color: string }[] {
    return fullHighlights.map((h, i) => {
        const pos = numberIndices.indexOf(i);
        const turnGold = pos >= 0 && confirmedNumberCount >= pos + 1;
        return turnGold ? { ...h, color: 'gold' } : { ...h };
    });
}

/** Detecta si el niño dijo "suma" o "resta" (ES/EN). */
function saidOperation(input: string, op: '+' | '-' | '×' | '÷'): boolean {
    const t = input.trim().toLowerCase().replace(/\s+/g, ' ');
    if (op === '-') return /\b(resta|restar|menos|restamos|subtract|minus|subtraction)\b/i.test(t) || t === '-';
    if (op === '+') return /\b(suma|sumar|más|más\s*que|plus|add|addition)\b/i.test(t) || t === '+';
    if (op === '×') return /\b(multiplicaci[oó]n|multiplicar|por|veces|multiply|times)\b/i.test(t) || t === '×' || t === '*' || t === 'x';
    if (op === '÷') return /\b(divisi[oó]n|dividir|entre|repartir|divide|share)\b/i.test(t) || t === '÷' || t === '/';
    return false;
}

/** Siempre incluir texto del problema y highlights para que la pizarra mantenga el mismo formato y coloree las palabras clave. */
function visualDataWithProblem(prob: AnyWordProblem, lastState: any, overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        ...lastState,
        ...overrides,
        text: (overrides.text as string | undefined) ?? prob.text,
        highlights: (overrides.highlights as { text: string; color: string }[] | undefined) ?? prob.highlights,
        wpParsed: prob,
    };
}

function gcd(a: number, b: number): number {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
        const t = y;
        y = x % y;
        x = t;
    }
    return x;
}

export class WordProblemTutor {
    static handleWordProblem(
        input: string,
        prob: AnyWordProblem,
        lang: 'es' | 'en',
        history: any[],
        _studentName?: string
    ): StepResponse | null {
        const lastState = StateHelper.getCurrentVisualState(history) as any;
        const type = prob.wpType || prob.type;
        const phase: WPPhase = lastState?.wpPhase || (prob.isNew ? 'intro' : 'intro');

        if (type === 'proportion') {
            return ProportionTutor.handleProportion(input, prob, lang, history, _studentName);
        }

        // --- FLUJO SUMA DE FRACCIONES: 3/4 km + 2/5 km, ¿cuántos en total? ---
        if (type === 'add_fraction_quantities' && prob.frac1 && prob.frac2) {
            const { frac1, frac2 } = prob;
            const unit = prob.unit || (lang === 'es' ? 'unidad' : 'unit');
            const f1Str = `${frac1.num}/${frac1.den}`;
            const f2Str = `${frac2.num}/${frac2.den}`;
            const lcm = (a: number, b: number) => { let m = Math.max(a, b); while (m % a !== 0 || m % b !== 0) m++; return m; };
            const mcm = lcm(frac1.den, frac2.den);

            // --- PRIMERO: dato por dato (primer dato → segundo → tercero; al acertar el dato cambia a dorado) ---
            if (prob.isNew && phase === 'intro') {
                const h = prob.highlights && prob.highlights[0];
                const primerDatoLabel = h ? (lang === 'es' ? `el que está en **rojo** (${h.text})` : `the one in **red** (${h.text})`) : (lang === 'es' ? 'el primero en rojo' : 'the first one in red');
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🧩 **Vamos a analizar este problema juntos** 😊\n\nIdentifiquemos primero los **datos** importantes. Mira el tablero: resalté las fracciones y las **palabras clave**.\n\n👉 **¿Cuál es el primer dato?** (Es el que está en **rojo** / ${primerDatoLabel})`
                            : `🧩 **Let's analyze this problem together** 😊\n\nFirst, let's identify the important **data**. Look at the board: I've highlighted the fractions and **keywords**.\n\n👉 **What is the first data point?** (It's the one in **red** / ${primerDatoLabel})`,
                        speech: lang === 'es' ? 'Miremos el primer dato. ¿Cuál es?' : 'Let\'s look at the first piece of data. What is it?',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, null, { wpPhase: 'dato_1' }),
                        detailedExplanation: { es: 'Paso 1: Primer dato', en: 'Step 1: First datum' },
                    }],
                };
            }
            if (phase === 'dato_1') {
                const saidFirst = matchesSocratic(input, 'morning', frac1, frac2) || input.includes(f1Str) || (parseFloatInput(input) != null && parseFloatInput(input) === frac1.num);
                if (isDontKnow(input)) {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `💡 Mira el **primer número** que está en rojo en el problema: es una fracción. Dice **${f1Str}** de ${unit}. ¿Cuál es el primer dato?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                                : `💡 Look at the **first number** in red in the problem: it's a fraction. It says **${f1Str}** of ${unit}. What is the first piece of data?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                            speech: lang === 'es' ? 'El primer dato es ' + f1Str + ' de ' + unit + '. Si no sabes, di no sé.' : 'The first piece of data is ' + f1Str + ' of ' + unit + '. If you don\'t know, say I don\'t know.',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_1' }),
                            detailedExplanation: { es: 'Pista primer dato', en: 'First datum hint' },
                        }],
                    };
                }
                if (saidFirst || input.trim().length > 0) {
                    const highlightsConfirmed = highlightsWithConfirmed(prob.highlights, 1);
                    const segundoLabel = prob.highlights && prob.highlights[1] ? (lang === 'es' ? `el **segundo** (${prob.highlights[1].text})` : `the **second** (${prob.highlights[1].text})`) : (lang === 'es' ? 'el segundo dato en rojo' : 'the second piece of data in red');
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ **Muy bien.** El primer dato es **${f1Str}** de ${unit}. (Mira: ya lo marqué en dorado en el tablero).\n\n👉 Ahora **miremos el segundo dato.** ¿Cuál es? (Es ${segundoLabel})`
                                : `✔️ **Good.** The first piece of data is **${f1Str}** of ${unit}. (Look: I marked it in gold on the board).\n\n👉 Now **let's look at the second piece of data.** What is it? (It's ${segundoLabel})`,
                            speech: lang === 'es' ? 'Muy bien, el primer dato es ' + f1Str + '. Ahora miremos el segundo dato. ¿Cuál es?' : 'Good, the first piece of data is ' + f1Str + '. Now let\'s look at the second. What is it?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_2', highlights: highlightsConfirmed }),
                            detailedExplanation: { es: 'Primer dato correcto, pedir segundo', en: 'First datum correct, ask second' },
                        }],
                    };
                }
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `Mira el **primer dato** en rojo en el tablero. Es la cantidad **${f1Str}** de ${unit}. ¿Cuál es el primer dato?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                            : `Look at the **first piece of data** in red on the board. It's the amount **${f1Str}** of ${unit}. What is the first piece of data?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                        speech: lang === 'es' ? 'El primer dato es ' + f1Str + '. Si no sabes, di no sé.' : 'The first piece of data is ' + f1Str + '. If you don\'t know, say I don\'t know.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_1' }),
                        detailedExplanation: { es: 'Re-preguntar primer dato', en: 'Re-ask first datum' },
                    }],
                };
            }
            if (phase === 'dato_2') {
                const saidSecond = matchesSocratic(input, 'afternoon', frac1, frac2) || input.includes(f2Str) || (parseFloatInput(input) != null && parseFloatInput(input) === frac2.num);
                if (isDontKnow(input)) {
                    const highlights1 = highlightsWithConfirmed(prob.highlights, 1);
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `💡 Mira el **segundo número** en rojo: dice **${f2Str}** de ${unit}. ¿Cuál es el segundo dato?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                                : `💡 Look at the **second number** in red: it says **${f2Str}** of ${unit}. What is the second piece of data?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                            speech: lang === 'es' ? 'El segundo dato es ' + f2Str + ' de ' + unit + '. Si no sabes, di no sé.' : 'The second piece of data is ' + f2Str + ' of ' + unit + '. If you don\'t know, say I don\'t know.',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_2', highlights: highlights1 }),
                            detailedExplanation: { es: 'Pista segundo dato', en: 'Second datum hint' },
                        }],
                    };
                }
                if (saidSecond || input.trim().length > 0) {
                    const highlightsConfirmed = highlightsWithConfirmed(prob.highlights, 2);
                    const terceroLabel = prob.highlights && prob.highlights[2] ? (lang === 'es' ? `**qué nos piden** (${prob.highlights[2].text})` : `**what they ask** (${prob.highlights[2].text})`) : (lang === 'es' ? 'qué nos piden' : 'what they ask');
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ **Muy bien.** El segundo dato es **${f2Str}** de ${unit}. (Ya está en dorado en el tablero).\n\n👉 Ahora **miremos el tercer dato**: ¿qué nos piden? (Mira lo que está en rojo: ${terceroLabel})`
                                : `✔️ **Good.** The second piece of data is **${f2Str}** of ${unit}. (It's marked in gold on the board).\n\n👉 Now **let's look at the third**: what do they ask? (Look at what's in red: ${terceroLabel})`,
                            speech: lang === 'es' ? 'Muy bien, el segundo dato es ' + f2Str + '. Ahora, ¿qué nos piden?' : 'Good, the second piece of data is ' + f2Str + '. Now, what do they ask?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_3', highlights: highlightsConfirmed }),
                            detailedExplanation: { es: 'Segundo dato correcto, pedir tercero', en: 'Second datum correct, ask third' },
                        }],
                    };
                }
                const highlights1 = highlightsWithConfirmed(prob.highlights, 1);
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `El **segundo dato** en rojo es la cantidad **${f2Str}** de ${unit}. ¿Cuál es el segundo dato?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                            : `The **second piece of data** in red is the amount **${f2Str}** of ${unit}. What is the second piece of data?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                        speech: lang === 'es' ? 'El segundo dato es ' + f2Str + '. Si no sabes, di no sé.' : 'The second piece of data is ' + f2Str + '. If you don\'t know, say I don\'t know.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_2', highlights: highlights1 }),
                        detailedExplanation: { es: 'Re-preguntar segundo dato', en: 'Re-ask second datum' },
                    }],
                };
            }
            if (phase === 'dato_3') {
                const saidTotal = matchesSocratic(input, 'compare', frac1, frac2) || /\b(total|en\s+total|cuántos?\s+kil|juntar)\b/i.test(input.trim());
                if (isDontKnow(input)) {
                    const highlights2 = highlightsWithConfirmed(prob.highlights, 2);
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `💡 Mira la **pregunta** que está en rojo: dice algo como "¿**Cuánto** en total?" Eso es lo que nos piden. ¿Qué nos piden?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                                : `💡 Look at the **question** in red: it says something like "How much **in total**?" That's what they ask. What do they ask?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                            speech: lang === 'es' ? 'Nos piden el total de ' + unit + '. Si no sabes, di no sé.' : 'They ask for the total ' + unit + '. If you don\'t know, say I don\'t know.',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_3', highlights: highlights2 }),
                            detailedExplanation: { es: 'Pista tercer dato', en: 'Third datum hint' },
                        }],
                    };
                }
                if (saidTotal || input.trim().length > 0) {
                    const highlightsConfirmed = highlightsWithConfirmed(prob.highlights, 3);
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ **Muy bien.** Nos piden el **total**. (Ya está en dorado en el tablero).\n\nAhora sí: **¿De qué habla la historia?** (En una frase)`
                                : `✔️ **Good.** They ask for the **total**. (It's marked in gold on the board).\n\nNow: **What is the story about?** (In one sentence)`,
                            speech: lang === 'es' ? 'Muy bien, nos piden el total. ¿De qué habla la historia?' : 'Good, they ask for the total. What is the story about?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_1', highlights: highlightsConfirmed }),
                            detailedExplanation: { es: 'Tercer dato correcto, pasar a historia', en: 'Third datum correct, move to story' },
                        }],
                    };
                }
                const highlights2 = highlightsWithConfirmed(prob.highlights, 2);
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `El **tercer dato** es lo que nos piden: el **total**. Mira la pregunta en rojo. ¿Qué nos piden?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                            : `The **third piece of data** is what they ask: the **total**. Look at the question in red. What do they ask?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                        speech: lang === 'es' ? 'Nos piden el total. Si no sabes, di no sé.' : 'They ask for the total. If you don\'t know, say I don\'t know.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_3', highlights: highlights2 }),
                        detailedExplanation: { es: 'Re-preguntar tercer dato', en: 'Re-ask third datum' },
                    }],
                };
            }
            if (phase === 'socratic_1') {
                if (isDontKnow(input)) {
                    return { steps: [{ text: lang === 'es' ? `💡 Pista: Habla de algo que se reparte o se junta (como ${unit}). ¿De quién o de qué habla la historia?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `💡 Hint: It's about something being shared or put together (like ${unit}). Who or what is the story about?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? 'Habla de ' + unit + '. Si no sabes, di no sé y te lo explico.' : 'It\'s about ' + unit + '. If you don\'t know, say I don\'t know and I\'ll explain.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_1' }), detailedExplanation: { es: 'Pista', en: 'Hint' } }] };
                }
                return {
                    steps: [{
                        text: lang === 'es' ? `¡Bien! 👌\n\n¿Sucedió una sola vez o en **dos momentos o partes**?` : `Good! 👌\n\nDid it happen once or in **two different times or parts**?`,
                        speech: lang === 'es' ? '¡Bien! ¿Sucedió una sola vez o en dos momentos o partes?' : 'Good! Did it happen once or in two different times or parts?',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_2' }),
                        detailedExplanation: { es: 'Paso 2: Una vez o dos momentos', en: 'Step 2: Once or two times' },
                    }],
                };
            }
            if (phase === 'socratic_2') {
                if (isDontKnow(input)) {
                    return { steps: [{ text: lang === 'es' ? `💡 Mira el problema: hay dos cantidades distintas de **${unit}**. ¿Fue una sola vez o en dos partes?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `💡 Look at the problem: there are two different amounts of **${unit}**. Once or in two parts?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? 'Hay dos partes. Si no sabes, di no sé.' : 'There are two parts. If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_2' }), detailedExplanation: { es: 'Pista', en: 'Hint' } }] };
                }
                return {
                    steps: [{
                        text: lang === 'es' ? `Exacto. ¿**Cuáles** son esas dos partes o momentos?` : `Right. **What** are those two parts or times?`,
                        speech: lang === 'es' ? 'Exacto. ¿Cuáles son esas dos partes?' : 'Right. What are those two parts?',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_3' }),
                        detailedExplanation: { es: 'Paso 3: Cuáles son los dos momentos', en: 'Step 3: What are the two times' },
                    }],
                };
            }
            if (phase === 'socratic_3') {
                if (isDontKnow(input)) {
                    return { steps: [{ text: lang === 'es' ? `💡 Mira lo que está en rojo o púrpura. Por ejemplo: "**María**" y "**su hermano**" (o mañana y tarde). ¿Cuáles son esas dos partes?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `💡 Look at what's in red or purple. For example: "**María**" and "**her brother**" (or morning and afternoon). What are those two parts?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? 'Son dos partes. Si no sabes, di no sé.' : 'They are two parts. If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_3' }), detailedExplanation: { es: 'Pista', en: 'Hint' } }] };
                }
                return {
                    steps: [{
                        text: lang === 'es' ? `Muy bien 👍\n\nAhora, dime: ¿**qué cantidad** se menciona primero?` : `Good 👍\n\nNow, tell me: **what amount** is mentioned first?`,
                        speech: lang === 'es' ? 'Muy bien. ¿Qué cantidad se menciona primero?' : 'Good. What amount is mentioned first?',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_4' }),
                        detailedExplanation: { es: 'Paso 4: Cantidad inicial', en: 'Step 4: Initial amount' },
                    }],
                };
            }
            if (phase === 'socratic_4') {
                const saidMorning = matchesSocratic(input, 'morning', frac1, frac2) || (parseFloatInput(input) != null && parseFloatInput(input) === frac1.num);
                if (isDontKnow(input)) {
                    return { steps: [{ text: lang === 'es' ? `💡 Busca en el problema un número con una **raya** (fracción). Dice algo como "**${f1Str}**". ¿Cuál es esa primera cantidad?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `💡 Look for a number with a **slash** (fraction). It says something like "**${f1Str}**". What is that first amount?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? 'La primera es ' + f1Str + '. Si no sabes, di no sé.' : 'The first one is ' + f1Str + '. If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_4' }), detailedExplanation: { es: 'Pista', en: 'Hint' } }] };
                }
                if (saidMorning || input.trim().length > 0) {
                    return {
                        steps: [{
                            text: lang === 'es' ? `Perfecto. ¿Y **la segunda**?` : `Perfect. And **the second**?`,
                            speech: lang === 'es' ? 'Perfecto. ¿Y la segunda?' : 'Perfect. And the second?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_5' }),
                            detailedExplanation: { es: 'Paso 5: Cantidad siguiente', en: 'Step 5: Next amount' },
                        }],
                    };
                }
                // Cualquier otra respuesta → re-preguntar y decir cómo continuar (nunca quedarse callada)
                return { steps: [{ text: lang === 'es' ? `No te preocupes. ¿Qué cantidad se menciona primero? (Mira el problema: dice **${f1Str}**).\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `No worries. What amount is mentioned first? (Look at the problem: it says **${f1Str}**).\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? '¿Qué cantidad primero? Si no sabes, di no sé.' : 'What amount first? If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_4' }), detailedExplanation: { es: 'Re-preguntar y continuar', en: 'Re-ask and continue' } }] };
            }
            if (phase === 'socratic_5') {
                const saidAfternoon = matchesSocratic(input, 'afternoon', frac1, frac2);
                if (isDontKnow(input)) {
                    return { steps: [{ text: lang === 'es' ? `💡 La segunda fracción que aparece es "**${f2Str}**". ¿Qué cantidad es la segunda?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `💡 The second fraction that appears is "**${f2Str}**". What is the second amount?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? 'La segunda es ' + f2Str + '. Si no sabes, di no sé.' : 'The second one is ' + f2Str + '. If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_5' }), detailedExplanation: { es: 'Pista', en: 'Hint' } }] };
                }
                if (saidAfternoon || input.trim().length > 0) {
                    return {
                        steps: [{
                            text: lang === 'es' ? `Genial 😊\n\nAhora piensa en la **pregunta final**: ¿Nos piden **comparar**, **quitar** o **juntar** estas partes?` : `Great 😊\n\nNow think about the **final question**: Do they ask us to **compare**, **take away**, or **put together** these parts?`,
                            speech: lang === 'es' ? 'Genial. ¿Nos piden comparar, quitar o juntar estas partes?' : 'Great. Do they ask us to compare, take away, or put together these parts?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_6' }),
                            detailedExplanation: { es: 'Paso 6: Comparar, quitar o juntar', en: 'Step 6: Compare, subtract, or add' },
                        }],
                    };
                }
                return { steps: [{ text: lang === 'es' ? `¿Cuál es la **segunda cantidad**? (En el problema dice **${f2Str}**).\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `What is the **second amount**? (The problem says **${f2Str}**).\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? '¿Qué cantidad sigue? Si no sabes, di no sé.' : 'What amount is next? If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_5' }), detailedExplanation: { es: 'Re-preguntar y continuar', en: 'Re-ask and continue' } }] };
            }
            if (phase === 'socratic_6') {
                if (isDontKnow(input)) {
                    return { steps: [{ text: lang === 'es' ? `💡 La pregunta dice "¿Cuánto **en total**?" Cuando hablamos de **total**, ¿estamos comparando, quitando o **juntando**?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `💡 The question says "How much **in total**?" When we say **total**, are we comparing, taking away, or **putting together**?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? 'En total es juntar. Si no sabes, di no sé.' : 'In total means put together. If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_6' }), detailedExplanation: { es: 'Pista', en: 'Hint' } }] };
                }
                if (matchesSocratic(input, 'compare', frac1, frac2) || input.trim().length > 0) {
                    return {
                        steps: [{
                            text: lang === 'es' ? `Exacto 💡\n\nCuando **juntamos** cantidades, ¿qué operación usamos?` : `Right 💡\n\nWhen we **put together** amounts, what operation do we use?`,
                            speech: lang === 'es' ? 'Exacto. Cuando juntamos cantidades, ¿qué operación usamos?' : 'Right. When we put together amounts, what operation do we use?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_7' }),
                            detailedExplanation: { es: 'Paso 7: Operación (sumar)', en: 'Step 7: Operation (add)' },
                        }],
                    };
                }
                return { steps: [{ text: lang === 'es' ? `¿Nos piden **comparar**, **quitar** o **juntar** las cantidades? (La pregunta dice "en total" → eso es **juntar**).\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `Do they ask us to **compare**, **take away**, or **put together** the amounts? (The question says "in total" → that's **putting together**).\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? '¿Comparar, quitar o juntar? Si no sabes, di no sé.' : 'Compare, take away, or put together? If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_6' }), detailedExplanation: { es: 'Re-preguntar y continuar', en: 'Re-ask and continue' } }] };
            }
            if (phase === 'socratic_7') {
                if (isDontKnow(input)) {
                    return { steps: [{ text: lang === 'es' ? `💡 Juntar es **sumar**. ¿Qué operación usamos cuando juntamos?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `💡 Putting together is **adding**. What operation do we use?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? 'Juntar es sumar. Si no sabes, di no sé.' : 'Putting together is adding. If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_7' }), detailedExplanation: { es: 'Pista', en: 'Hint' } }] };
                }
                if (matchesSocratic(input, 'op', frac1, frac2) || input.trim().length > 0) {
                    return {
                        steps: [{
                            text: lang === 'es' ? `Muy bien. Entonces, ¿**qué operación** escribirías? (Puedes escribir ${f1Str} + ${f2Str})` : `Good. So **what operation** would you write? (You can write ${f1Str} + ${f2Str})`,
                            speech: lang === 'es' ? 'Muy bien. ¿Qué operación escribirías?' : 'Good. What operation would you write?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_8' }),
                            detailedExplanation: { es: 'Paso 8: Escribir la operación', en: 'Step 8: Write the operation' },
                        }],
                    };
                }
                return { steps: [{ text: lang === 'es' ? `Cuando **juntamos** cantidades usamos **sumar**. ¿Qué operación escribirías? (Ej: ${f1Str} + ${f2Str}).\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `When we **put together** amounts we **add**. What operation would you write? (e.g. ${f1Str} + ${f2Str}).\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? 'Juntar es sumar. Si no sabes, di no sé.' : 'Putting together is adding. If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_7' }), detailedExplanation: { es: 'Re-preguntar y continuar', en: 'Re-ask and continue' } }] };
            }
            if (phase === 'socratic_8') {
                if (isDontKnow(input)) {
                    return { steps: [{ text: lang === 'es' ? `💡 La operación es **sumar** las dos cantidades: **${f1Str} + ${f2Str}**. Escríbela cuando quieras y di "listo".\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `💡 The operation is to **add** the two amounts: **${f1Str} + ${f2Str}**. Write it when you want and say "done".\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? 'Suma ' + f1Str + ' más ' + f2Str + '. Si no sabes, di no sé.' : 'Add ' + f1Str + ' plus ' + f2Str + '. If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_8' }), detailedExplanation: { es: 'Pista', en: 'Hint' } }] };
                }
                if (matchesSocratic(input, 'write_op', frac1, frac2) || input.includes('+') || input.includes(f1Str) || input.includes(f2Str)) {
                    return {
                        steps: [{
                            text: lang === 'es' ? `Excelente 👏\n\nAntes de sumar, dime: ¿los números de **abajo** (${frac1.den} y ${frac2.den}) son **iguales**?` : `Excellent 👏\n\nBefore we add, tell me: are the **bottom** numbers (${frac1.den} and ${frac2.den}) **equal**?`,
                            speech: lang === 'es' ? 'Excelente. ¿Los números de abajo, ' + frac1.den + ' y ' + frac2.den + ', son iguales?' : 'Excellent. Are the bottom numbers, ' + frac1.den + ' and ' + frac2.den + ', equal?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_9' }),
                            detailedExplanation: { es: 'Paso 9: ¿Mismo denominador?', en: 'Step 9: Same denominator?' },
                        }],
                    };
                }
                return { steps: [{ text: lang === 'es' ? `La operación es **sumar** ${f1Str} + ${f2Str}. Escríbela en la pizarra o di "listo".\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `The operation is to **add** ${f1Str} + ${f2Str}. Write it on the board or say "done".\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? 'Suma ' + f1Str + ' más ' + f2Str + '. Si no sabes, di no sé.' : 'Add ' + f1Str + ' plus ' + f2Str + '. If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_8' }), detailedExplanation: { es: 'Re-preguntar y continuar', en: 'Re-ask and continue' } }] };
            }
            if (phase === 'socratic_9') {
                if (isDontKnow(input)) {
                    return { steps: [{ text: lang === 'es' ? `💡 Mira: en ${f1Str} el de abajo es **${frac1.den}** y en ${f2Str} el de abajo es **${frac2.den}**. ¿Son iguales?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `💡 Look: in ${f1Str} the bottom is **${frac1.den}** and in ${f2Str} the bottom is **${frac2.den}**. Are they equal?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? 'No, son distintos. Si no sabes, di no sé.' : 'No, they\'re different. If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_9' }), detailedExplanation: { es: 'Pista', en: 'Hint' } }] };
                }
                if (matchesSocratic(input, 'same_denom', frac1, frac2) || input.trim().toLowerCase() === 'no') {
                    return {
                        steps: [{
                            text: lang === 'es' ? `Ajá 🤔\n\nCuando **no** son iguales, ¿qué crees que necesitamos hacer **primero**?` : `Aha 🤔\n\nWhen they're **not** equal, what do you think we need to do **first**?`,
                            speech: lang === 'es' ? 'Cuando no son iguales, ¿qué necesitamos hacer primero?' : 'When they\'re not equal, what do we need to do first?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_10' }),
                            detailedExplanation: { es: 'Paso 10: Hacer denominadores iguales', en: 'Step 10: Make denominators equal' },
                        }],
                    };
                }
                return { steps: [{ text: lang === 'es' ? `Mira: en ${f1Str} el de abajo es **${frac1.den}** y en ${f2Str} es **${frac2.den}**. ¿Son iguales? (Responde sí o no).\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `Look: in ${f1Str} the bottom is **${frac1.den}** and in ${f2Str} it's **${frac2.den}**. Are they equal? (Answer yes or no).\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? '¿Son iguales los de abajo? Si no sabes, di no sé.' : 'Are the bottom numbers equal? If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_9' }), detailedExplanation: { es: 'Re-preguntar y continuar', en: 'Re-ask and continue' } }] };
            }
            if (phase === 'socratic_10') {
                if (isDontKnow(input)) {
                    return { steps: [{ text: lang === 'es' ? `💡 Necesitamos **hacerlos iguales** (buscar un número que sirva para los dos). Ese número se llama **MCM**. ¿Sabes un número que sirva para **${frac1.den}** y para **${frac2.den}**?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `💡 We need to **make them equal** (find a number that works for both). That number is the **LCM**. Do you know a number that works for **${frac1.den}** and **${frac2.den}**?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? 'Hacerlos iguales. Si no sabes, di no sé.' : 'Make them equal. If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_10' }), detailedExplanation: { es: 'Pista MCM', en: 'LCM hint' } }] };
                }
                if (matchesSocratic(input, 'what_first', frac1, frac2) || input.trim().length > 0) {
                    return {
                        steps: [{
                            text: lang === 'es' ? `¡Exacto! 🎉\n\n¿Sabes un número que **sirva para ${frac1.den} y para ${frac2.den}**? (Ese número se llama MCM)` : `Exactly! 🎉\n\nDo you know a number that **works for ${frac1.den} and for ${frac2.den}**? (That number is the LCM)`,
                            speech: lang === 'es' ? '¡Exacto! ¿Sabes un número que sirva para ' + frac1.den + ' y para ' + frac2.den + '?' : 'Exactly! Do you know a number that works for ' + frac1.den + ' and ' + frac2.den + '?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'step1' }),
                            detailedExplanation: { es: 'Paso 11: MCM', en: 'Step 11: LCM' },
                        }],
                    };
                }
                return { steps: [{ text: lang === 'es' ? `Necesitamos **hacer iguales** los de abajo (buscar un número que sirva para **${frac1.den}** y **${frac2.den}**). Ese número se llama MCM.\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.` : `We need to **make the bottom numbers equal** (find a number that works for **${frac1.den}** and **${frac2.den}**). That number is the LCM.\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`, speech: lang === 'es' ? 'Hacer iguales los de abajo. Si no sabes, di no sé.' : 'Make the bottom numbers equal. If you don\'t know, say I don\'t know.', visualType: 'text_only', visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'socratic_10' }), detailedExplanation: { es: 'Re-preguntar y continuar', en: 'Re-ask and continue' } }] };
            }
            const userNum = parseFloatInput(input);
            const correctMcm = userNum !== null && userNum === mcm;
            if (correctMcm) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🎯 **¡Correcto!** El MCM de ${frac1.den} y ${frac2.den} es **${mcm}**. Ahora podemos escribir ${f1Str} y ${f2Str} con denominador ${mcm} y sumar. ¿Cuánto te da **${f1Str} + ${f2Str}**? (Puedes escribir la fracción o el decimal.)`
                            : `🎯 **Correct!** The LCM of ${frac1.den} and ${frac2.den} is **${mcm}**. Now we can write ${f1Str} and ${f2Str} with denominator ${mcm} and add. What is **${f1Str} + ${f2Str}**? (You can write the fraction or the decimal.)`,
                        speech: lang === 'es' ? '¡Muy bien! El MCM es ' + mcm + '. Ahora suma las fracciones.' : 'Well done! The LCM is ' + mcm + '. Now add the fractions.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'step2' }),
                        detailedExplanation: { es: 'MCM correcto, siguiente paso', en: 'LCM correct, next step' },
                    }],
                };
            }
            if (isDontKnow(input)) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `💡 Pista: El **MCM** es el número más pequeño en el que caben **${frac1.den}** y **${frac2.den}**. Prueba con los múltiplos de ${frac2.den}: ${frac2.den}, ${frac2.den * 2}, ${frac2.den * 3}... ¿Cuál es divisible por ${frac1.den}?`
                            : `💡 Hint: The **LCM** is the smallest number that **${frac1.den}** and **${frac2.den}** both go into. Try multiples of ${frac2.den}: ${frac2.den}, ${frac2.den * 2}, ${frac2.den * 3}... Which one is divisible by ${frac1.den}?`,
                        speech: lang === 'es' ? 'Busca el MCM de ' + frac1.den + ' y ' + frac2.den + '.' : 'Find the LCM of ' + frac1.den + ' and ' + frac2.den + '.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'step1' }),
                        detailedExplanation: { es: 'Pista MCM', en: 'LCM hint' },
                    }],
                };
            }
            return {
                steps: [{
                    text: lang === 'es'
                        ? `💡 Casi. El MCM de **${frac1.den}** y **${frac2.den}** es **${mcm}**. Vuelve a intentarlo.`
                        : `💡 Close. The LCM of **${frac1.den}** and **${frac2.den}** is **${mcm}**. Try again.`,
                    speech: lang === 'es' ? 'El MCM es ' + mcm + '.' : 'The LCM is ' + mcm + '.',
                    visualType: 'text_only',
                    visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'step1' }),
                    detailedExplanation: { es: 'Corrección MCM', en: 'LCM correction' },
                }],
            };
        }

        // --- FLUJO GEOMETRÍA: la profesora dibuja la figura en el tablero y hace preguntas (todo muy colorido) ---
        if (type === 'geometry') {
            const gProb = prob as any;
            const shape = gProb.shape;
            const b = gProb.base ?? 0;
            const h = gProb.height ?? 0;
            const r = gProb.radius ?? 0;
            const subQ = gProb.subQuestion;
            const side = gProb.squareSide;

            const perimeterExpected = shape === 'rectangle' ? 2 * (b + h) : (shape === 'square' ? 4 * b : (shape === 'circle' ? 2 * Math.PI * r : 0));
            const areaExpected = shape === 'rectangle' ? b * h : (shape === 'square' ? b * b : (shape === 'triangle' ? (b * h) / 2 : (shape === 'circle' ? Math.PI * r * r : 0)));
            const squaresExpected = (side && areaExpected > 0) ? areaExpected / (side * side) : 0;

            // Determinamos qué fases necesitamos recorrer
            const hasPerimeter = /per[ií]metro/i.test(gProb.text);
            const hasArea = /\b(?:área|area)\b/i.test(gProb.text);

            let currentPhase = (phase === 'intro' || !phase) ? 'dato_1' : phase;
            const userNum = parseFloatInput(input);

            // Labels para visualGeometry
            const labels: string[] = [];
            if (shape === 'circle') labels.push(`r = ${r}`);
            else {
                labels.push(`${lang === 'es' ? 'base' : 'base'} ${b}`);
                labels.push(`${lang === 'es' ? 'altura' : 'height'} ${h}`);
            }

            // PASO 1: Identificar datos
            if (currentPhase === 'dato_1') {
                if (userNum === b || userNum === h || userNum === r) {
                    currentPhase = hasPerimeter ? 'perimeter' : (hasArea ? 'area' : 'done');
                } else {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `🧩 **Analicemos las medidas.**\n\nEl patio mide **${b}m** de largo y **${h}m** de ancho.\n\n¿Cuál es la primera medida que ves?`
                                : `🧩 **Let's analyze the measurements.**\n\nThe patio is **${b}m** long and **${h}m** wide.\n\nWhat is the first measurement you see?`,
                            speech: lang === 'es' ? 'Primero identifiquemos las medidas. ¿Cuánto mide de largo?' : 'First, let\'s identify the measurements. How long is it?',
                            visualType: 'geometry',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'dato_1' }), shape, labels: [lang === 'es' ? 'largo = ?' : 'length = ?', lang === 'es' ? 'ancho = ?' : 'width = ?'] }
                        }]
                    };
                }
                // Si acabamos de validar dato_1, mostramos el siguiente paso
                if (currentPhase === 'perimeter') {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ **¡Buen ojo!** Las medidas son ${b} y ${h}.\n\n📏 **Paso 1: El Perímetro**\n\nEl perímetro es la suma de **todos los lados**.\n\nComo es un rectángulo, sumamos: **${b} + ${h} + ${b} + ${h}**.\n\n👉 ¿Cuánto da el perímetro total?`
                                : `✔️ **Good eye!** The measurements are ${b} and ${h}.\n\n📏 **Step 1: Perimeter**\n\nThe perimeter is the sum of **all sides**.\n\nSince it's a rectangle, we add: **${b} + ${h} + ${b} + ${h}**.\n\n👉 What is the total perimeter?`,
                            speech: lang === 'es' ? 'Muy bien. Ahora el perímetro. Suma los cuatro lados.' : 'Well done. Now the perimeter. Sum the four sides.',
                            visualType: 'geometry',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'perimeter' }), shape, labels: [...labels, lang === 'es' ? 'Perímetro = ?' : 'Perimeter = ?'] }
                        }]
                    };
                }
                if (currentPhase === 'area') {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ **¡Mucho mejor!** El patio mide ${b}m por ${h}m.\n\n🟦 **Paso 1: El Área**\n\nPara el área multiplicamos **largo x ancho**.\n\nCalcula: **${b} × ${h}**.`
                                : `✔️ **Much better!** The patio is ${b}m by ${h}m.\n\n🟦 **Step 1: Area**\n\nFor the area we multiply **length x width**.\n\nCalculate: **${b} × ${h}**.`,
                            speech: lang === 'es' ? '¡Bien! Ahora el área. Multiplica largo por ancho.' : 'Great! Now the area. Multiply length by width.',
                            visualType: 'geometry',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'area' }), shape, labels: [...labels, lang === 'es' ? 'Área = ?' : 'Area = ?'] }
                        }]
                    };
                }
                if (currentPhase === 'done') {
                    return {
                        steps: [{
                            text: lang === 'es' ? `🎯 ¡Correcto! Las dimensiones son **${b}** y **${h}**.` : `🎯 Correct! The dimensions are **${b}** and **${h}**.`,
                            speech: lang === 'es' ? '¡Correcto!' : 'Correct!',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'done', highlight: 'done' })
                        }]
                    };
                }
            }

            // PASO 2: Perímetro
            if (currentPhase === 'perimeter') {
                if (userNum === Math.round(perimeterExpected)) {
                    currentPhase = hasArea ? 'area' : (subQ ? 'squares' : 'done');
                } else {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `📏 **Paso 1: El Perímetro**\n\nEl perímetro es la suma de **todos los lados**.\n\nComo es un rectángulo, sumamos: **${b} + ${h} + ${b} + ${h}**.\n\n👉 ¿Cuánto da el perímetro total?`
                                : `📏 **Step 1: Perimeter**\n\nThe perimeter is the sum of **all sides**.\n\nSince it's a rectangle, we add: **${b} + ${h} + ${b} + ${h}**.\n\n👉 What is the total perimeter?`,
                            speech: lang === 'es' ? 'El perímetro es la suma de los cuatro lados. ¿Cuánto suma?' : 'Perimeter is the sum of the four sides. What is the total?',
                            visualType: 'geometry',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'perimeter' }), shape, labels: [...labels, lang === 'es' ? 'Perímetro = ?' : 'Perimeter = ?'] }
                        }]
                    };
                }
                // Si acabamos de validar perimeter, mostramos area, squares o done
                if (currentPhase === 'area') {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ ¡Correcto! El perímetro es **${Math.round(perimeterExpected)}m**.\n\n🟦 **Paso 2: El Área**\n\nPara el área del rectángulo multiplicamos **largo x ancho**.\n\nCalcula: **${b} × ${h}**.`
                                : `✔️ Correct! The perimeter is **${Math.round(perimeterExpected)}m**.\n\n🟦 **Step 2: Area**\n\nFor the area of the rectangle we multiply **length x width**.\n\nCalculate: **${b} × ${h}**.`,
                            speech: lang === 'es' ? '¡Correcto! Ahora el área. Multiplica largo por ancho.' : 'Correct! Now the area. Multiply length by width.',
                            visualType: 'geometry',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'area' }), shape, labels: [...labels, lang === 'es' ? 'Área = ?' : 'Area = ?'] }
                        }]
                    };
                }
                if (currentPhase === 'squares') {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ ¡Correcto! El perímetro es **${Math.round(perimeterExpected)}m**.\n\n✂️ **Último reto: Dividir en cuadrados**\n\nQueremos poner cuadrados de **${side}m x ${side}m**.\n\n1. Área de cada cuadradito: ${side} × ${side} = **${side * side} m²**.\n2. Dividimos el total entre el área del cuadradito.\n\n👉 **¿Cuántos cuadrados caben?**`
                                : `✔️ Correct! The perimeter is **${Math.round(perimeterExpected)}m**.\n\n✂️ **Final challenge: Divide into squares**\n\nWe want to put squares of **${side}m x ${side}m**.\n\n1. Area of each small square: ${side} × ${side} = **${side * side} m²**.\n2. Divide the total area by the area of the small square.\n\n👉 **How many squares fit?**`,
                            speech: lang === 'es' ? '¡Correcto! Ahora el último paso. Divide el área total entre el área de cada cuadradito.' : 'Correct! Now the last step. Divide the total area by the area of each small square.',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'squares' })
                        }]
                    };
                }
                if (currentPhase === 'done') {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `🎯 **¡Excelente!** El perímetro es **${Math.round(perimeterExpected)}m**.\n\n¡Has resuelto este problema de geometría como un profesional! 🚀`
                                : `🎯 **Excellent!** The perimeter is **${Math.round(perimeterExpected)}m**.\n\nYou solved this geometry problem like a pro! 🚀`,
                            speech: lang === 'es' ? '¡Excelente! Has resuelto todo el problema.' : 'Excellent! You have solved the whole problem.',
                            visualType: 'geometry',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'done', highlight: 'done' }), shape, labels: [...labels, `Perímetro = ${Math.round(perimeterExpected)}`] }
                        }]
                    };
                }
            }

            // PASO 3: Área
            if (currentPhase === 'area') {
                if (Math.abs((userNum || 0) - areaExpected) < 0.1) {
                    currentPhase = subQ ? 'squares' : 'done';
                } else {
                    return {
                        steps: [{
                            text: (lang === 'es'
                                ? `🟦 **Paso 2: El Área**\n\nPara el área del rectángulo multiplicamos **largo x ancho**.\n\nCalcula: **${b} × ${h}**.`
                                : `🟦 **Step 2: Area**\n\nFor the area of the rectangle we multiply **length x width**.\n\nCalculate: **${b} × ${h}**.`),
                            speech: lang === 'es' ? 'Ahora el área. Multiplica largo por ancho.' : 'Now the area. Multiply length by width.',
                            visualType: 'geometry',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'area' }), shape, labels: [...labels, lang === 'es' ? 'Área = ?' : 'Area = ?'] }
                        }]
                    };
                }
                // Si acabamos de validar area, mostramos squares o done
                if (currentPhase === 'squares') {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ ¡Excelente! El área es **${areaExpected} m²**.\n\n✂️ **Último reto: Dividir en cuadrados**\n\nQueremos poner cuadrados de **${side}m x ${side}m**.\n\n1. Área de cada cuadradito: ${side} × ${side} = **${side * side} m²**.\n2. Dividimos el total entre el área del cuadradito.\n\n👉 **¿Cuántos cuadrados caben?**`
                                : `✔️ Excellent! The area is **${areaExpected} m²**.\n\n✂️ **Final challenge: Divide into squares**\n\nWe want to put squares of **${side}m x ${side}m**.\n\n1. Area of each small square: ${side} × ${side} = **${side * side} m²**.\n2. Divide the total area by the area of the small square.\n\n👉 **How many squares fit?**`,
                            speech: lang === 'es' ? '¡Excelente! Ahora el último paso. Divide el área total entre el área de cada cuadradito.' : 'Excellent! Now the last step. Divide the total area by the area of each small square.',
                            visualType: 'geometry',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'squares' }), shape, labels: [...labels, `Área = ${areaExpected}`, `lado = ${side}`] }
                        }]
                    };
                }
                if (currentPhase === 'done') {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `🎯 **¡Magnífico!** El área total es **${areaExpected}m²**.\n\n¡Has resuelto este problema de geometría a la perfección! 🏆`
                                : `🎯 **Magnificent!** The total area is **${areaExpected}m²**.\n\nYou solved this geometry problem perfectly! 🏆`,
                            speech: lang === 'es' ? '¡Magnífico! El área es ' + areaExpected + '. ¡Lo lograste!' : 'Magnificent! The area is ' + areaExpected + '. You did it!',
                            visualType: 'geometry',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'done', highlight: 'done' }), shape, labels: [...labels, `Área = ${areaExpected}`] }
                        }]
                    };
                }
            }

            // PASO 4: Sub-pregunta (Cuadrados)
            if (currentPhase === 'squares') {
                if (userNum === squaresExpected) {
                    currentPhase = 'done';
                } else {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✂️ **Último reto: Dividir en cuadrados**\n\nEl área total es **${areaExpected} m²**. Queremos poner cuadrados de **${side}m x ${side}m**.\n\n1. Área de cada cuadradito: ${side} × ${side} = **${side * side} m²**.\n2. Dividimos el total entre el área del cuadradito.\n\n👉 **¿Cuántos cuadrados de ${side}m caben en ${areaExpected}m²?**`
                                : `✂️ **Final challenge: Divide into squares**\n\nThe total area is **${areaExpected} m²**. We want to put squares of **${side}m x ${side}m**.\n\n1. Area of each small square: ${side} × ${side} = **${side * side} m²**.\n2. Divide the total by the area of the small square.\n\n👉 **How many ${side}m squares fit in ${areaExpected}m²?**`,
                            speech: lang === 'es' ? 'Divide el área total entre el área de cada cuadradito. ¿Cuántos salen?' : 'Divide the total area by the area of each small square. How many fit?',
                            visualType: 'geometry',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'squares' }), shape, labels: [...labels, `Área = ${areaExpected}`, `lado = ${side}`] }
                        }]
                    };
                }
            }

            if (currentPhase === 'done') {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🏆 **¡Excelente trabajo!**\n\n- Perímetro: **${Math.round(perimeterExpected)}m**\n- Área: **${areaExpected}m²**\n` + (subQ ? `- Cuadrados: **${squaresExpected}**` : '') + `\n\n¡Has resuelto este problema de geometría como un profesional! 🚀`
                            : `🏆 **Excellent job!**\n\n- Perimeter: **${Math.round(perimeterExpected)}m**\n- Area: **${areaExpected}m²**\n` + (subQ ? `- Squares: **${squaresExpected}**` : '') + `\n\nYou solved this geometry problem like a pro! 🚀`,
                        speech: lang === 'es' ? '¡Excelente! Has resuelto todo el problema.' : 'Excellent! You have solved the whole problem.',
                        visualType: 'geometry',
                        visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'done', highlight: 'done' }), shape, labels: [...labels, `Área = ${areaExpected}`, subQ ? `Cuadros = ${squaresExpected}` : ''] }
                    }]
                };
            }
        }

        // --- FLUJO GENÉRICO: suma/resta de cantidades (ej. Ana compró 2.5 kg y 1.75 kg, ¿cuántos kg en total?) ---
        if (type === 'add_quantities' || type === 'subtract_quantities') {
            const n1 = prob.n1!;
            const n2 = prob.n2!;
            const unit = prob.unit || 'unidades';
            const expected = type === 'add_quantities' ? n1 + n2 : n1 - n2;
            const opSymbol = type === 'add_quantities' ? '+' : '−';
            const highlights = prob.highlights && prob.highlights.length >= 2 ? prob.highlights : [
                { text: String(n1), color: 'blue' },
                { text: String(n2), color: 'green' },
                { text: lang === 'es' ? 'en total' : 'in total', color: 'red' },
            ];

            if (prob.isNew && phase === 'intro') {
                const h0 = highlights[0];
                const primerLabel = h0 ? (lang === 'es' ? `el primero (${h0.text} ${unit})` : `the first one (${h0.text} ${unit})`) : (lang === 'es' ? 'el primer número' : 'the first number');
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🧩 **Vamos a analizar este problema juntos** para resolverlo con éxito 😊\n\nPrimero, identifiquemos los **datos (números)** importantes. Mira el tablero: he resaltado los datos y la **palabra clave** con colores.\n\n👉 **¿Cuál es el primer dato?** (Es ${primerLabel})`
                            : `🧩 **Let's analyze this problem together** to solve it successfully 😊\n\nFirst, let's identify the important **data (numbers)**. Look at the board: I've highlighted the data and the **key word** with colors.\n\n👉 **What is the first piece of data?** (It's ${primerLabel})`,
                        speech: lang === 'es' ? 'Miremos el primer dato. ¿Cuál es?' : 'Let\'s look at the first piece of data. What is it?',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, null, { wpPhase: 'dato_1' }),
                        detailedExplanation: { es: 'Primer dato', en: 'First datum' },
                    }],
                };
            }
            if (phase === 'dato_1') {
                const userNum1 = parseFloatInput(input);
                const correct1 = userNum1 !== null && Math.abs(userNum1 - n1) <= 0.01;
                if (isDontKnow(input)) {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `💡 Mira el **primer número** que está coloreado en el problema. Es **${n1}** ${unit}. ¿Cuál es el primer dato?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                                : `💡 Look at the **first number** colored in the problem. It's **${n1}** ${unit}. What is the first piece of data?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                            speech: lang === 'es' ? 'El primer dato es ' + n1 + ' ' + unit + '. Si no sabes, di no sé.' : 'The first piece of data is ' + n1 + ' ' + unit + '. If you don\'t know, say I don\'t know.',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_1' }),
                            detailedExplanation: { es: 'Pista primer dato', en: 'First datum hint' },
                        }],
                    };
                }
                if (correct1 || input.trim().includes(String(n1))) {
                    const hl1 = highlightsWithConfirmed(highlights, 1);
                    const h1 = highlights[1];
                    const segundoLabel = h1 ? (lang === 'es' ? `el **segundo** (${h1.text} ${unit})` : `the **second** (${h1.text} ${unit})`) : (lang === 'es' ? 'el segundo dato' : 'the second piece of data');
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ **Muy bien.** El primer dato es **${n1}** ${unit}. (Mira: ya lo marqué en dorado en el tablero).\n\n👉 Ahora **miremos el segundo dato.** ¿Cuál es? (Es ${segundoLabel})`
                                : `✔️ **Good.** The first piece of data is **${n1}** ${unit}. (Look: I marked it in gold on the board).\n\n👉 Now **let's look at the second piece of data.** What is it? (It's ${segundoLabel})`,
                            speech: lang === 'es' ? 'Muy bien, el primer dato es ' + n1 + '. Ahora miremos el segundo dato. ¿Cuál es?' : 'Good, the first piece of data is ' + n1 + '. Now let\'s look at the second. What is it?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_2', highlights: hl1 }),
                            detailedExplanation: { es: 'Primer dato correcto', en: 'First datum correct' },
                        }],
                    };
                }
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `Mira el **primer dato** en el tablero. Es **${n1}** ${unit}. ¿Cuál es el primer dato?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                            : `Look at the **first piece of data** on the board. It's **${n1}** ${unit}. What is the first piece of data?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                        speech: lang === 'es' ? 'El primer dato es ' + n1 + '. Si no sabes, di no sé.' : 'The first piece of data is ' + n1 + '. If you don\'t know, say I don\'t know.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_1' }),
                        detailedExplanation: { es: 'Re-preguntar primer dato', en: 'Re-ask first datum' },
                    }],
                };
            }
            if (phase === 'dato_2') {
                const userNum2 = parseFloatInput(input);
                const correct2 = userNum2 !== null && Math.abs(userNum2 - n2) <= 0.01;
                if (isDontKnow(input)) {
                    const hl1 = highlightsWithConfirmed(highlights, 1);
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `💡 Mira el **segundo número** coloreado. Es **${n2}** ${unit}. ¿Cuál es el segundo dato?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                                : `💡 Look at the **second number** colored. It's **${n2}** ${unit}. What is the second piece of data?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                            speech: lang === 'es' ? 'El segundo dato es ' + n2 + '. Si no sabes, di no sé.' : 'The second piece of data is ' + n2 + '. If you don\'t know, say I don\'t know.',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_2', highlights: hl1 }),
                            detailedExplanation: { es: 'Pista segundo dato', en: 'Second datum hint' },
                        }],
                    };
                }
                if (correct2 || input.trim().includes(String(n2))) {
                    const hl2 = highlightsWithConfirmed(highlights, 2);
                    const h2 = highlights[2];
                    const terceroLabel = h2 ? (lang === 'es' ? `**qué nos piden** (${h2.text})` : `**what they ask** (${h2.text})`) : (lang === 'es' ? 'qué nos piden' : 'what they ask');
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ **Muy bien.** El segundo dato es **${n2}** ${unit}. (Ya está en dorado en el tablero).\n\n👉 Ahora **miremos el tercer dato**: ¿qué nos piden? (Mira lo que está en rojo: ${terceroLabel})`
                                : `✔️ **Good.** The second piece of data is **${n2}** ${unit}. (It's marked in gold on the board).\n\n👉 Now **let's look at the third**: what do they ask? (Look at what's in red: ${terceroLabel})`,
                            speech: lang === 'es' ? 'Muy bien, el segundo dato es ' + n2 + '. ¿Qué nos piden?' : 'Good, the second piece of data is ' + n2 + '. What do they ask?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_3', highlights: hl2 }),
                            detailedExplanation: { es: 'Segundo dato correcto', en: 'Second datum correct' },
                        }],
                    };
                }
                const hl1 = highlightsWithConfirmed(highlights, 1);
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `El **segundo dato** es **${n2}** ${unit}. ¿Cuál es el segundo dato?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                            : `The **second piece of data** is **${n2}** ${unit}. What is the second piece of data?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                        speech: lang === 'es' ? 'El segundo dato es ' + n2 + '. Si no sabes, di no sé.' : 'The second piece of data is ' + n2 + '. If you don\'t know, say I don\'t know.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_2', highlights: hl1 }),
                        detailedExplanation: { es: 'Re-preguntar segundo dato', en: 'Re-ask second datum' },
                    }],
                };
            }
            if (phase === 'dato_3') {
                const saidTotal = /\b(total|en\s+total|cuántos?|how\s+many)\b/i.test(input.trim());
                if (isDontKnow(input)) {
                    const hl2 = highlightsWithConfirmed(highlights, 2);
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `💡 Mira la **pregunta** en rojo: nos piden **cuántos ${unit} en total**. ¿Qué nos piden?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                                : `💡 Look at the **question** in red: they ask **how many ${unit} in total**. What do they ask?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                            speech: lang === 'es' ? 'Nos piden el total de ' + unit + '. Si no sabes, di no sé.' : 'They ask for the total of ' + unit + '. If you don\'t know, say I don\'t know.',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_3', highlights: hl2 }),
                            detailedExplanation: { es: 'Pista tercer dato', en: 'Third datum hint' },
                        }],
                    };
                }
                if (saidTotal || input.trim().length > 0) {
                    const opForVertical = type === 'add_quantities' ? '+' : '-';
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ **Muy bien.** Nos piden el **total**. (Marcado en dorado).\n\nMira las palabras clave: **"total"** o **"más"**. \n\n👉 Cuando queremos agrupar cantidades para saber el total, la operación es una **${type === 'add_quantities' ? 'SUMA' : 'RESTA'}**.\n\n💭 Mira el tablero en columnas. ¿Cuántos **${unit}** son en total?`
                                : `✔️ **Good.** They ask for the **total**. (Marked in gold).\n\nLook at the keywords: **"total"** or **"plus"**.\n\n👉 When we want to group amounts to find the total, the operation is an **${type === 'add_quantities' ? 'ADDITION' : 'SUBTRACTION'}**.\n\n💭 Look at the board in columns. How many **${unit}** in total?`,
                            speech: lang === 'es' ? 'Muy bien. Como nos piden el total, vamos a sumar. Mira el tablero en columnas. ¿Cuántos son?' : 'Good. Since they ask for the total, we add. Look at the board in columns. How many are there?',
                            visualType: 'vertical_op',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'step1', highlights: highlightsWithConfirmed(highlights, 3) }), operand1: String(n1), operand2: String(n2), operator: opForVertical, result: '' },
                            detailedExplanation: { es: 'Operación en columnas, pedir total', en: 'Operation in columns, ask total' },
                        }],
                    };
                }
                const hl2 = highlightsWithConfirmed(highlights, 2);
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `El **tercer dato** es lo que nos piden: **cuántos ${unit} en total**. Mira la pregunta en rojo. ¿Qué nos piden?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                            : `The **third piece of data** is what they ask: **how many ${unit} in total**. Look at the question in red. What do they ask?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                        speech: lang === 'es' ? 'Nos piden el total. Si no sabes, di no sé.' : 'They ask for the total. If you don\'t know, say I don\'t know.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_3', highlights: hl2 }),
                        detailedExplanation: { es: 'Re-preguntar tercer dato', en: 'Re-ask third datum' },
                    }],
                };
            }
            if (phase === 'intro_understand') {
                const opForVertical = type === 'add_quantities' ? '+' : '-';
                const verticalData = { ...visualDataWithProblem(prob, lastState, { wpPhase: 'step1' }), operand1: String(n1), operand2: String(n2), operator: opForVertical, result: '' };
                if (isDontKnow(input)) {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✅ **Te explico:**\n\nSe trata de cuántos **${unit}** son **en total**. Los datos son **${n1}** (azul) y **${n2}** (verde). Mira el tablero: puse los números **en columnas** con colores. Para el total hay que **${type === 'add_quantities' ? 'sumar' : 'restar'}**.\n\n💭 ¿Cuántos **${unit}** son en total?`
                                : `✅ **I'll explain:**\n\nIt's about how many **${unit}** **in total**. The information we have: **${n1}** (blue) and **${n2}** (green). Look at the board: I put the numbers **in columns** with colors. For the total we **${type === 'add_quantities' ? 'add' : 'subtract'}**.\n\n💭 How many **${unit}** in total?`,
                            speech: lang === 'es' ? 'Te explico. Mira el tablero en columnas. ¿Cuántos ' + unit + ' son en total?' : 'I\'ll explain. Look at the board in columns. How many ' + unit + ' in total?',
                            visualType: 'vertical_op',
                            visualData: verticalData,
                            detailedExplanation: { es: 'Explicación con operación en columnas', en: 'Explanation with operation in columns' },
                        }],
                    };
                }
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `👍 Bien. Mira el tablero **en columnas** (con colores). Para el total hay que **${type === 'add_quantities' ? 'sumar' : 'restar'}**. ¿Cuántos **${unit}** son en total?`
                            : `👍 Good. Look at the board **in columns** (with colors). For the total we **${type === 'add_quantities' ? 'add' : 'subtract'}**. How many **${unit}** in total?`,
                        speech: lang === 'es' ? 'Bien. Mira el tablero en columnas. ¿Cuántos ' + unit + ' son en total?' : 'Good. Look at the board in columns. How many ' + unit + ' in total?',
                        visualType: 'vertical_op',
                        visualData: verticalData,
                        detailedExplanation: { es: 'Pasar a la pregunta del total', en: 'Move to total question' },
                    }],
                };
            }

            const userNum = parseFloatInput(input);
            const tolerance = 0.01;
            const correct = userNum !== null && Math.abs(userNum - expected) <= tolerance;

            if (correct) {
                const boardFinal = lang === 'es' ? `¡Resultado final!\n\n${expected} ${unit}` : `Final answer!\n\n${expected} ${unit}`;
                const highlightsFinal: { text: string; color: string }[] = [{ text: String(expected), color: 'green' }, { text: unit, color: 'blue' }];
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🎯 **¡Muy bien!** ${n1} ${opSymbol} ${n2} = **${expected}** ${unit}.\n\n🟦 Respuesta final: **${expected} ${unit}** en total.`
                            : `🎯 **Well done!** ${n1} ${opSymbol} ${n2} = **${expected}** ${unit}.\n\n🟦 Final answer: **${expected} ${unit}** in total.`,
                        speech: lang === 'es' ? '¡Muy bien! Son ' + expected + ' ' + unit + ' en total.' : 'Well done! That is ' + expected + ' ' + unit + ' in total.',
                        visualType: 'text_only',
                        visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'done', highlight: 'done' }), text: boardFinal, highlights: highlightsFinal },
                        detailedExplanation: { es: 'Problema completado', en: 'Problem completed' },
                    }],
                };
            }

            // Sign check for 6th/7th grade integers
            if (userNum !== null && Math.abs(userNum) === Math.abs(expected) && userNum !== expected) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Casi! 😮 El número es correcto, pero **revisa el signo**. \n\nRecuerda: si la temperatura era **${n1}** y **${type === 'add_quantities' ? 'subió' : 'bajó'}** **${n2}**, ¿en qué dirección nos movemos? ¿Debería ser positivo (+) o negativo (-)?`
                            : `Almost! 😮 The value is correct, but **check the sign**. \n\nRemember: if the temperature was **${n1}** and it **${type === 'add_quantities' ? 'went up' : 'went down'}** **${n2}**, which way are we moving? Should it be positive (+) or negative (-)?`,
                        speech: lang === 'es' ? '¡Muy cerca! Revisa el signo. ¿Es positivo o negativo?' : 'Very close! Check the sign. Is it positive or negative?',
                        visualType: 'vertical_op',
                        visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'step1' }), operand1: String(n1), operand2: String(n2), operator: opSymbol, result: '' },
                        detailedExplanation: { es: 'Error de signo detectado', en: 'Sign error detected' },
                    }],
                };
            }

            const opForVertical = type === 'add_quantities' ? '+' : '-';
            return {
                steps: [{
                    text: lang === 'es'
                        ? `💡 Mira el tablero **en columnas** (con colores): **${n1}** ${type === 'add_quantities' ? 'más' : 'menos'} **${n2}** = ? \n\nEmpieza por la columna de las **unidades** (la de la derecha). ¿Cuánto da?`
                        : `💡 Look at the board **in columns** (with colors): **${n1}** ${type === 'add_quantities' ? 'plus' : 'minus'} **${n2}** = ? \n\nStart with the **units** column (the one on the right). What do you get?`,
                    speech: lang === 'es' ? (type === 'add_quantities' ? 'Suma primero las unidades.' : 'Resta primero las unidades.') : (type === 'add_quantities' ? 'Add the units first.' : 'Subtract the units first.'),
                    visualType: 'vertical_op',
                    visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'step1' }), operand1: String(n1), operand2: String(n2), operator: opForVertical, result: '' },
                    detailedExplanation: { es: 'Pista total en columnas', en: 'Total hint in columns' },
                }],
            };
        }

        // --- FLUJO MULTIPLICACIÓN: mismo formato (datos con colores → operación en columnas) ---
        if (type === 'multiply_quantities') {
            const { n1, n2, unit } = prob;
            const expected = n1 * n2;

            // Phase: Intro - Start with Dato 1
            if (prob.isNew && phase === 'intro') {
                const primerDatoLabel = prob.highlights && prob.highlights[0] ? (lang === 'es' ? `el que está en **azul** (${prob.highlights[0].text})` : `the one in **blue** (${prob.highlights[0].text})`) : String(n1);
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🧩 **Analicemos este problema juntos** 😊\n\nPrimero, identifiquemos los **datos** importantes. Mira el tablero: resalté los números y las **palabras clave**.\n\n👉 **¿Cuál es el primer dato?** (Es ${primerDatoLabel})`
                            : `🧩 **Let's analyze this problem together** 😊\n\nFirst, let's identify the important **data**. Look at the board: I've highlighted the numbers and **keywords**.\n\n👉 **What is the first piece of data?** (It's ${primerDatoLabel})`,
                        speech: lang === 'es' ? 'Miremos el primer dato. ¿Cuál es?' : 'Let\'s look at the first piece of data. What is it?',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, null, { wpPhase: 'dato_1' }),
                        detailedExplanation: { es: 'Multiplicación: Paso 1', en: 'Multiplication: Step 1' },
                    }],
                };
            }

            if (phase === 'dato_1') {
                const userNum = parseFloatInput(input);
                if (userNum === n1 || input.includes(String(n1))) {
                    const nextLabel = prob.highlights && prob.highlights[1] ? (lang === 'es' ? `el que está en **verde** (${prob.highlights[1].text})` : `the one in **green** (${prob.highlights[1].text})`) : String(n2);
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ **¡Exacto!** Tenemos **${n1}** grupos. (Ya lo marqué en dorado).\n\n👉 Ahora miremos el **segundo dato**. ¿Cuántos ${unit} hay en cada uno? (Es ${nextLabel})`
                                : `✔️ **Exactly!** We have **${n1}** groups. (I marked it in gold).\n\n👉 Now let's look at the **second piece of data**. How many ${unit} are in each? (It's ${nextLabel})`,
                            speech: lang === 'es' ? '¡Muy bien! Ahora dime el segundo dato, el que está en verde.' : 'Well done! Now tell me the second piece of data, the one in green.',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_2', highlights: highlightsWithConfirmed(prob.highlights, 1) }),
                            detailedExplanation: { es: 'Multiplicación: Dato 2', en: 'Multiplication: Data 2' },
                        }],
                    };
                }
            }

            if (phase === 'dato_2') {
                const userNum = parseFloatInput(input);
                if (userNum === n2 || input.includes(String(n2))) {
                    const keyword = prob.highlights && prob.highlights[2] ? prob.highlights[2].text : (lang === 'es' ? 'en total' : 'total');
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `🌟 **¡Magnífico!** Datos listos: **${n1}** y **${n2}** (marcados en dorado).\n\nAhora, fíjate en la palabra en **rojo**: **"${keyword}"**.\n\n👉 Como queremos saber el total de varios grupos iguales, la operación es una **MULTIPLICACIÓN**. \n\n¿Cuánto es **${n1} × ${n2}**? Mira el tablero en columnas.`
                                : `🌟 **Magnificent!** Data ready: **${n1}** and **${n2}** (marked in gold).\n\nNow, look at the word in **red**: **"${keyword}"**.\n\n👉 Since we want to know the total of several equal groups, the operation is a **MULTIPLICATION**.\n\nHow much is **${n1} × ${n2}**? Look at the board in columns.`,
                            speech: lang === 'es' ? '¡Magnífico! Como hay que hallar el total, vamos a multiplicar. ¿Cuánto es?' : 'Magnificent! Since we have to find the total, we are going to multiply. How much is it?',
                            visualType: 'vertical_op',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'step1', highlights: highlightsWithConfirmed(prob.highlights, 2) }), operand1: String(n1), operand2: String(n2), operator: '×', result: '' },
                            detailedExplanation: { es: 'Multiplicación: Disectar palabras clave', en: 'Multiplication: Dissect keywords' },
                        }],
                    };
                }
            }

            const userNum = parseFloatInput(input);
            const correct = userNum !== null && Math.abs(userNum - expected) <= 0.01;

            if (correct) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🎯 **¡Muy bien!** ${n1} × ${n2} = **${expected}** ${unit}.\n\n🟦 Respuesta final: **${expected} ${unit}** en total.`
                            : `🎯 **Well done!** ${n1} × ${n2} = **${expected}** ${unit}.\n\n🟦 Final answer: **${expected} ${unit}** in total.`,
                        speech: lang === 'es' ? '¡Muy bien! Son ' + expected + ' ' + unit + ' en total.' : 'Well done! That is ' + expected + ' ' + unit + ' in total.',
                        visualType: 'text_only',
                        visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'done', highlight: 'done' }), text: (lang === 'es' ? `¡Logrado!\nRespuesta: ${expected} ${unit}` : `Achieved!\nAnswer: ${expected} ${unit}`), highlights: [{ text: String(expected), color: 'gold' }] },
                        detailedExplanation: { es: 'Multiplicación: Final', en: 'Multiplication: Final' },
                    }],
                };
            }

            return {
                steps: [{
                    text: lang === 'es'
                        ? `💡 Mira el tablero **en columnas** (con colores): **${n1} × ${n2}** = ? \n\nHaz la multiplicación paso a paso. ¿Cuánto es **${n1}** veces el **${n2}**?`
                        : `💡 Look at the board **in columns** (with colors): **${n1} × ${n2}** = ? \n\nDo the multiplication step by step. How much is **${n1}** times **${n2}**?`,
                    speech: lang === 'es' ? 'Multiplica ' + n1 + ' por ' + n2 + '. ¿Cuánto da?' : 'Multiply ' + n1 + ' times ' + n2 + '. What do you get?',
                    visualType: 'vertical_op',
                    visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'step1' }), operand1: String(n1), operand2: String(n2), operator: '×', result: '' },
                    detailedExplanation: { es: 'Pista multiplicación en columnas', en: 'Multiplication hint in columns' },
                }],
            };
        }

        // --- FLUJO MCD (Máximo Común Divisor): para repartir en el mayor número posible ---
        if (type === 'mcd_problem') {
            const { n1, n2, unit } = prob;
            const expected = gcd(n1, n2);

            // Phase: Intro - Start with Dato 1
            if (prob.isNew && phase === 'intro') {
                const primerDatoLabel = prob.highlights && prob.highlights[0] ? (lang === 'es' ? `el que está en **azul** (${prob.highlights[0].text})` : `the one in **blue** (${prob.highlights[0].text})`) : String(n1);
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🧩 **¡Nuestra misión como detectives empieza ahora!** 😊\n\nMira el tablero: he resaltado con colores los datos clave para que los analicemos.\n\n👉 **Primero, dime:** ¿cuál es el **primer dato**? (Es ${primerDatoLabel})`
                            : `🧩 **Our detective mission starts now!** 😊\n\nLook at the board: I've highlighted the key data with colors for us to analyze.\n\n👉 **First, tell me:** what is the **first data point**? (It's ${primerDatoLabel})`,
                        speech: lang === 'es' ? '¡Hola detective! Mira el tablero con colores. ¿Cuál es el primer dato?' : 'Hello detective! Look at the board with colors. What is the first piece of data?',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, null, { wpPhase: 'dato_1' }),
                        detailedExplanation: { es: 'MCD: Paso 1', en: 'GCD: Step 1' },
                    }],
                };
            }

            if (phase === 'dato_1') {
                const userNum = parseFloatInput(input);
                if (userNum === n1 || input.includes(String(n1))) {
                    const nextLabel = prob.highlights && prob.highlights[1] ? (lang === 'es' ? `el que está en **verde** (${prob.highlights[1].text})` : `the one in **green** (${prob.highlights[1].text})`) : String(n2);
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✅ **¡Exacto!** El primer dato es **${n1}** ${unit}. ¡Muy buen ojo 👁️! (Ya lo marqué en dorado).\n\n👉 Ahora miremos el **segundo dato**. ¿Cuántos ${unit} hay en total? (Es ${nextLabel})`
                                : `✔️ **Exactly!** The first datum is **${n1}** ${unit}. Great eye 👁️! (I marked it in gold).\n\n👉 Now let's look at the **second piece of data**. How many ${unit} are there? (It's ${nextLabel})`,
                            speech: lang === 'es' ? '¡Muy bien! Ahora dime el segundo dato, el que está en verde.' : 'Well done! Now tell me the second piece of data, the one in green.',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_2', highlights: highlightsWithConfirmed(prob.highlights, 1) }),
                            detailedExplanation: { es: 'MCD: Dato 2', en: 'GCD: Data 2' },
                        }],
                    };
                }
            }

            if (phase === 'dato_2') {
                const userNum = parseFloatInput(input);
                if (userNum === n2 || input.includes(String(n2))) {
                    const keyword = prob.highlights && prob.highlights[2] ? prob.highlights[2].text : (lang === 'es' ? 'el mayor número' : 'the highest number');
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `🌟 **¡Magnífico!** Ya tenemos los datos: **${n1}** y **${n2}** (marcados en dorado).\n\nAhora, fíjate en la palabra en **rojo**: **"${keyword}"**. También dice **"repartir"**.\n\n👉 Cuando queremos repartir cosas en el **mayor grupo posible**, usamos el **Máximo Común Divisor (MCD)**. \n\n¿Cuál es el número más grande que divide a ${n1} y ${n2} al mismo tiempo?`
                                : `🌟 **Magnificent!** We have the data: **${n1}** and **${n2}** (marked in gold).\n\nNow, look at the word in **red**: **"${keyword}"**. It also says **"share"**.\n\n👉 When we want to share things in the **largest possible group**, we use the **Greatest Common Divisor (GCD)**.\n\nWhat is the largest number that divides ${n1} and ${n2} at the same time?`,
                            speech: lang === 'es' ? '¡Magnífico! Ahora vamos a usar el Máximo Común Divisor. ¿Qué número divide a ambos?' : 'Magnificent! Now we are going to use the Greatest Common Divisor. What number divides both?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'op', highlights: highlightsWithConfirmed(prob.highlights, 2) }),
                            detailedExplanation: { es: 'MCD: Disectar palabras clave', en: 'GCD: Dissect keywords' },
                        }],
                    };
                }
            }

            if (phase === 'op' || phase === 'step1') {
                const userNum = parseFloatInput(input);
                if (userNum === expected) {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `🚀 **¡BOOM! ¡Lo lograste!** El mayor número por caja es **${expected}**. \n\n¡Eres un genio del MCD! 🏆`
                                : `🚀 **BOOM! You did it!** The highest number per box is **${expected}**.\n\nYou're a GCD genius! 🏆`,
                            speech: lang === 'es' ? '¡Lo lograste! La respuesta es ' + expected + '. ¡Eres un genio!' : 'You did it! The answer is ' + expected + '. You are a genius!',
                            visualType: 'text_only',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'done', highlight: 'done' }), text: (lang === 'es' ? `¡Logrado!\nRespuesta: ${expected} ${unit}` : `Achieved!\nAnswer: ${expected} ${unit}`), highlights: [{ text: String(expected), color: 'gold' }] },
                            detailedExplanation: { es: 'MCD: Final', en: 'GCD: Final' },
                        }],
                    };
                }
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `💡 Debemos buscar el número más grande que divida a **${n1}** y **${n2}** al mismo tiempo. \n\n¿Qué números pueden dividir a ambos? Piensa en las tablas del 2, 3, 5... ¿Cuál es el más grande que sirve que no deje residuo?`
                            : `💡 We must look for the largest number that divides both **${n1}** and **${n2}** at the same time.\n\nWhat numbers can divide both? Think about the 2, 3, 5 tables... Which is the largest one that works without remainder?`,
                        speech: lang === 'es' ? 'Debemos buscar el divisor común más grande. Piensa en qué números dividen a ambos.' : 'We must look for the largest common divisor. Think about what numbers divide both.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'step1' }),
                    }],
                };
            }

            return {
                steps: [{
                    text: lang === 'es' ? '¿Podemos seguir analizando los datos?' : 'Can we continue analyzing the data?',
                    speech: lang === 'es' ? '¿Seguimos?' : 'Shall we continue?',
                    visualType: 'text_only',
                    visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_1' }),
                }],
            };
        }

        // --- FLUJO RETO FINANCIERO (Multi-Paso) ---
        if (type === 'financial_challenge') {
            const { productChain, revenue, profit } = prob as any;
            const factors = productChain.factors;
            const items = productChain.unitName || 'unidades';
            const op = productChain.operation || 'multiply';

            let totalUnits = 0;
            let remainder = 0;
            if (op === 'multiply') {
                totalUnits = factors.reduce((a: number, b: number) => a * b, 1);
            } else {
                totalUnits = factors.length >= 2 ? Math.floor(factors[0] / factors[1]) : factors[0];
                remainder = factors.length >= 2 ? factors[0] % factors[1] : 0;
            }
            const totalRevenue = totalUnits * revenue.pricePerUnit;
            const net = totalRevenue - profit.cost;

            // Fase inicial: 'intro' -> 'dato_1' -> 'dato_2' -> 'strategy' -> 'calc_units'
            let currentPhase = (phase === 'intro' || !phase) ? 'dato_1' : phase;

            const userNum = parseFloatInput(input);
            const inputLower = input.toLowerCase();
            const saysDivision = /divi|repar|partir/i.test(inputLower);
            const saysMult = /multi|juntar|veces/i.test(inputLower);

            // PASO 1: Identificar datos
            if (currentPhase === 'dato_1') {
                if (userNum === factors[0]) currentPhase = 'dato_2';
                else {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `🧩 **Paso 1: Entender el problema**\n\nAntes de calcular, busquemos los datos importantes. ¿Cuál es el **primer número** (el total a repartir o multiplicar) que ves en el problema?`
                                : `🧩 **Step 1: Understand the problem**\n\nBefore calculating, let's find the important data. What is the **first number** (the total to split or multiply) you see in the problem?`,
                            speech: lang === 'es' ? 'Primero identifiquemos los datos. ¿Cuál es el número de naranjas?' : 'First, let\'s identify the data. What is the number of oranges?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_1' })
                        }]
                    };
                }
            }

            if (currentPhase === 'dato_2') {
                if (userNum === factors[1]) currentPhase = 'strategy';
                else {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ ¡Bien! Tenemos **${factors[0]}**. \n\nAhora, ¿de cuántos kilos es cada caja? Busquemos el **segundo dato**.`
                                : `✔️ Good! We have **${factors[0]}**. \n\nNow, how many kilos does each box hold? Let's find the **second piece of data**.`,
                            speech: lang === 'es' ? 'Bien. ¿Cuántos kilos entran en cada caja?' : 'Good. How many kilos go into each box?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_2' }),
                        }]
                    };
                }
            }

            // PASO 2: Operación (Razonamiento)
            if (currentPhase === 'strategy') {
                if (saysDivision || saysMult) currentPhase = 'calc_units';
                else {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `🤔 **Paso 2: Elegir la operación**\n\nTenemos ${factors[0]} kg y los queremos meter en cajas de ${factors[1]} kg.\n\nPara **repartir** en partes iguales, ¿qué operación debemos usar?`
                                : `🤔 **Step 2: Choose the operation**\n\nWe have ${factors[0]} kg and want to put them into boxes of ${factors[1]} kg.\n\nTo **distribute** equally, what operation should we use?`,
                            speech: lang === 'es' ? '¿Qué operación usamos para repartir?' : 'What operation do we use to distribute?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'strategy' })
                        }]
                    };
                }
            }

            // PASO 3: Cálculo
            if (currentPhase === 'calc_units' && userNum !== totalUnits) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🙌 ¡Exacto! Vamos a **dividir**.\n\nCalcula: **${factors[0]} ÷ ${factors[1]}**.\n\n👉 ¿Cuántas cajas completas se llenan?`
                            : `🙌 Exactly! Let's **divide**.\n\nCalculate: **${factors[0]} ÷ ${factors[1]}**.\n\n👉 How many full boxes are filled?`,
                        speech: lang === 'es' ? '¡Exacto! Vamos a dividir. ¿Cuántas cajas salen?' : 'Exactly! Let\'s divide. How many boxes?',
                        visualType: 'vertical_op',
                        visualData: {
                            ...visualDataWithProblem(prob, lastState, { wpPhase: 'calc_units' }),
                            operand1: String(factors[0]), operand2: String(factors[1]), operator: '÷', result: ''
                        }
                    }]
                };
            }

            if (currentPhase === 'calc_units' && userNum === totalUnits) {
                currentPhase = 'calc_revenue';
            }

            if (currentPhase === 'calc_revenue' && userNum !== totalRevenue) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `✅ **¡Muy bien!** Salen **${totalUnits}** cajas.` + (remainder > 0 ? ` (Y sobran ${remainder} kg).` : '') + `\n\nSi cada caja vale **$${revenue.pricePerUnit}**...\n\n👉 **¿Cuánto dinero obtiene en total?**`
                            : `✅ **Very well!** We have **${totalUnits}** boxes.` + (remainder > 0 ? ` (And ${remainder} kg left over).` : '') + `\n\nIf each box is worth **$${revenue.pricePerUnit}**...\n\n👉 **How much money in total?**`,
                        speech: lang === 'es' ? '¡Muy bien! Ahora calcula el dinero total de las ventas.' : 'Very well! Now calculate the total money from sales.',
                        visualType: 'vertical_op',
                        visualData: {
                            ...visualDataWithProblem(prob, lastState, { wpPhase: 'calc_revenue' }),
                            operand1: String(totalUnits), operand2: String(revenue.pricePerUnit), operator: '×', result: ''
                        }
                    }]
                };
            }

            if (currentPhase === 'calc_revenue' && userNum === totalRevenue) {
                currentPhase = 'calc_profit';
            }

            if (currentPhase === 'calc_profit' && (userNum === Math.abs(net) || userNum === net)) {
                const isProfit = net >= 0;
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🏆 **¡Excelente razonamiento!**\n\nIngresos: $${totalRevenue}\nGastos: $${profit.cost}\nResultado: **${isProfit ? 'Ganancia' : 'Pérdida'} de $${Math.abs(net)}**.\n\n¡Has resuelto el reto financiero! 🚀`
                            : `🏆 **Excellent reasoning!**\n\nRevenue: $${totalRevenue}\nExpenses: $${profit.cost}\nResult: **${isProfit ? 'Profit' : 'Loss'} of $${Math.abs(net)}**.\n\nYou solved the financial challenge! 🚀`,
                        speech: lang === 'es' ? '¡Excelente! Has resuelto el problema paso a paso.' : 'Excellent! You solved the problem step by step.',
                        visualType: 'text_only',
                        visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'done', highlight: 'done' }) }
                    }]
                };
            }

            if (currentPhase === 'calc_profit') {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `💵 **Paso Final: ¿Ganó o perdió?**\n\nVendió: **$${totalRevenue}**\nGastó: **$${profit.cost}**\n\n👉 ¿Cuál es la diferencia? ¿Fue ganancia o pérdida?`
                            : `💵 **Final Step: Profit or loss?**\n\nSold: **$${totalRevenue}**\nSpent: **$${profit.cost}**\n\n👉 What is the difference? Was it a profit or loss?`,
                        speech: lang === 'es' ? 'Calcula la diferencia entre ventas y gastos.' : 'Calculate the difference between sales and expenses.',
                        visualType: 'vertical_op',
                        visualData: {
                            ...visualDataWithProblem(prob, lastState, { wpPhase: 'calc_profit' }),
                            operand1: String(Math.max(totalRevenue, profit.cost)), operand2: String(Math.min(totalRevenue, profit.cost)), operator: '-', result: ''
                        }
                    }]
                };
            }
        }

        // --- FLUJO DIVISIÓN: mismo formato (datos con colores → operación en columnas) ---
        // --- FLUJO DIVISIÓN: Análisis paso a paso ---
        if (type === 'divide_quantities') {
            const { n1, n2, unit } = prob;
            const expected = Math.floor(n1 / n2);

            // Phase: Intro - Start with Dato 1
            // Force text_only if we are just starting or purely analyzing
            if (phase === 'intro' || phase === 'dato_1') {
                const primerDatoLabel = prob.highlights && prob.highlights[0] ? (lang === 'es' ? `el que está en **azul**` : `the one in **blue**`) : String(n1);

                // If user already typed the first number correct, move to next
                const userNum = parseFloatInput(input);
                if (phase === 'dato_1' && (userNum === n1 || input.includes(String(n1)))) {
                    const nextLabel = prob.highlights && prob.highlights[1] ? (lang === 'es' ? `el que está en **verde**` : `the one in **green**`) : String(n2);
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ **¡Correcto!** Tenemos **${n1}** ${unit}. (Ya lo marqué en el texto).\n\n👉 Ahora busca el **segundo dato**. ¿Entre cuántos (o cada cuánto) vamos a repartir? Miralo en **verde**.`
                                : `✔️ **Correct!** We have **${n1}** ${unit}. (I marked it in the text).\n\n👉 Now look for the **second piece of data**. Between how many (or each what) are we sharing? Look at **green**.`,
                            speech: lang === 'es' ? '¡Bien! Ahora dime el segundo dato, el verde.' : 'Good! Now tell me the second data, the green one.',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_2', highlights: highlightsWithConfirmed(prob.highlights, 1) }),
                            detailedExplanation: { es: 'División: Dato 2', en: 'Division: Data 2' },
                        }],
                    };
                }

                // Default Intro msg
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🧩 **Vamos despacio.** Para resolver este problema, primero debemos entender los datos.\n\nHe resaltado el texto en la pizarra. \n\n👉 **¿Cuál es el número total** del que nos habla la historia? (Está en **azul**)`
                            : `🧩 **Let's go slowly.** To solve this problem, we must first understand the data.\n\nI've highlighted the text on the board.\n\n👉 **What is the total number** the story talks about? (It's in **blue**)`,
                        speech: lang === 'es' ? 'Vamos paso a paso. Dime, ¿cuál es el número total?' : 'Let\'s go step by step. Tell me, what is the total number?',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, null, { wpPhase: 'dato_1' }),
                        detailedExplanation: { es: 'División: Paso 1 Análisis', en: 'Division: Step 1 Analysis' },
                    }],
                };
            }

            if (phase === 'dato_2') {
                const userNum = parseFloatInput(input);
                if (userNum === n2 || input.includes(String(n2))) {
                    const keyword = prob.highlights && prob.highlights[2] ? prob.highlights[2].text : (lang === 'es' ? 'repartir' : 'share');
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `🌟 **¡Muy bien!** \n\nTenemos el total (**${n1}**) y el tamaño de cada grupo (**${n2}**).\n\nFíjate que la pregunta dice **"${keyword}"** o pregunta cuántos grupos se necesitan.\n\n👉 ¿Qué operación matemática usamos para **repartir** o **agrupar** cantidades iguales?\n(Suma, Resta, Multiplicación o División)`
                                : `🌟 **Very good!** \n\nWe have the total (**${n1}**) and the size of each group (**${n2}**).\n\nNotice the question says **"${keyword}"** or asks how many groups are needed.\n\n👉 What math operation do we use to **share** or **group** equal quantities?\n(Addition, Subtraction, Multiplication or Division)`,
                            speech: lang === 'es' ? 'Tenemos los datos. ¿Qué operación hacemos para repartir?' : 'We have the data. What operation do we use to share?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'step1', highlights: highlightsWithConfirmed(prob.highlights, 2) }), // Transition to step1 (calc) BUT keep visual as text first? No, let's ask op first.
                            detailedExplanation: { es: 'División: Elegir Operación', en: 'Division: Choose Operation' },
                        }],
                    };
                }
            }

            // Logic for calculation phase (step1) matches the previous fix...
            // But if we fall through here, it implies the user hasn't answered the data questions yet. 
            // SO WE MUST NOT SHOW THE VERTICAL OP YET unless we are sure.

            const userNum = parseFloatInput(input);
            const remainder = n1 % n2;
            const floorVal = Math.floor(n1 / n2);
            const ceilVal = Math.ceil(n1 / n2);
            // Check if context implies grouping, containers, or capacity limits (requiring ceiling rounding)
            const isGroupingContext = /\b(autobuses|buses|cajas|botes|viajes|bolsas|necesitan|transportar|llevar|caben|grupos|equipos|estantes|mesas|habitaciones|rooms|boxes|trips|groups|teams)\b/i.test(prob.text);

            // Correct if user gives the floor (quotient) OR ceil (if grouping) OR exact if no remainder
            const correctFloor = userNum !== null && (userNum === floorVal);
            const correctCeil = userNum !== null && (userNum === ceilVal);

            // CASE 1: Perfect division
            if (remainder === 0 && correctFloor) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🎯 **¡Muy bien!** ${n1} ÷ ${n2} = **${floorVal}**. No sobra nada.\n\n🟦 Respuesta final: **${floorVal} ${unit}**.`
                            : `🎯 **Well done!** ${n1} ÷ ${n2} = **${floorVal}**. Nothing left over.\n\n🟦 Final answer: **${floorVal} ${unit}**.`,
                        speech: lang === 'es' ? '¡Muy bien! La respuesta es ' + floorVal + '.' : 'Well done! The answer is ' + floorVal + '.',
                        visualType: 'text_only',
                        visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'done', highlight: 'done' }), text: (lang === 'es' ? `¡Logrado!\nRespuesta: ${floorVal}` : `Achieved!\nAnswer: ${floorVal}`), highlights: [{ text: String(floorVal), color: 'green' }] },
                        detailedExplanation: { es: 'División exacta completada', en: 'Exact division completed' },
                    }],
                };
            }

            // CASE 2: Remainder exists - User answered CEIL (Total buses needed) - Correct for grouping!
            if (isGroupingContext && remainder > 0 && correctCeil) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🎯 **¡Excelente análisis!**\n\n${n1} ÷ ${n2} es igual a **${floorVal}** y sobran **${remainder}**.\n\nComo no podemos dejar a nadie, sumamos 1 grupo más.\n\n🟦 Respuesta final: **${ceilVal}** (grupos/autobuses).`
                            : `🎯 **Excellent analysis!**\n\n${n1} ÷ ${n2} equals **${floorVal}** with **${remainder}** left over.\n\nSince we can't leave anyone behind, we add 1 more group.\n\n🟦 Final answer: **${ceilVal}** (groups/buses).`,
                        speech: lang === 'es' ? '¡Excelente! Necesitamos ' + ceilVal + ' en total porque sobraban algunos.' : 'Excellent! We need ' + ceilVal + ' in total because some were left over.',
                        visualType: 'text_only',
                        visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'done', highlight: 'done' }), text: (lang === 'es' ? `¡Logrado!\nRespuesta: ${ceilVal}` : `Achieved!\nAnswer: ${ceilVal}`), highlights: [{ text: String(ceilVal), color: 'green' }] },
                        detailedExplanation: { es: 'División con resto interpretado (buses)', en: 'Division with interpreted remainder (buses)' },
                    }],
                };
            }

            // CASE 3: Remainder exists - User answered FLOOR (Full buses only)
            if (remainder > 0 && correctFloor) {
                if (isGroupingContext) {
                    // Guiding question: What about the leftovers?
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `👍 Vale, llenamos **${floorVal}** grupos completos.\n\n⚠️ Pero nos **sobran ${remainder}**. \n\nNo podemos dejarlos fuera. ¿Entonces cuántos necesitamos en TOTAL? (¿${floorVal} o ${floorVal + 1}?)`
                                : `👍 Okay, we stick to **${floorVal}** full groups.\n\n⚠️ But we have **${remainder} left over**.\n\nWe can't leave them out. So how many do we need in TOTAL? (${floorVal} or ${floorVal + 1}?)`,
                            speech: lang === 'es' ? 'Llenamos ' + floorVal + ', pero sobran ' + remainder + '. ¿Cuántos necesitamos en total para llevarlos a todos?' : 'We filled ' + floorVal + ', but ' + remainder + ' are left. How many do we need in total?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'step1' }), // Keep open
                            detailedExplanation: { es: 'Interpretar resto', en: 'Interpret remainder' },
                        }],
                    };
                } else {
                    // Standard division with remainder
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `🎯 **¡Correcto!**\n\nCociente: **${floorVal}**\nResiduo: **${remainder}**\n\n(En este caso la respuesta es exacta o no necesitamos otro grupo).`
                                : `🎯 **Correct!**\n\nQuotient: **${floorVal}**\nRemainder: **${remainder}**\n\n(In this case the answer is exact or we don't need another group).`,
                            speech: lang === 'es' ? 'Correcto. Cociente ' + floorVal + ' y sobran ' + remainder + '.' : 'Correct. Quotient ' + floorVal + ' with remainder ' + remainder + '.',
                            visualType: 'text_only',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'done', highlight: 'done' }), text: (lang === 'es' ? `¡Logrado!\n${floorVal} (res: ${remainder})` : `Achieved!\n${floorVal} (rem: ${remainder})`), highlights: [{ text: String(floorVal), color: 'green' }] },
                            detailedExplanation: { es: 'División con resto completada', en: 'Division with remainder completed' },
                        }],
                    };
                }
            }

            // FALLBACK: If we are not in 'step1' but input wasn't recognized as data, 
            // AND we haven't shown the operation yet... stick to text analysis.
            if (phase !== 'step1' && phase !== 'done') {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🤔 No estoy segura. Miremos el tablero de nuevo.\n\nEstamos buscando los datos del problema.\n\n¿Puedes decirme el **número en azul** o el **número en verde**?`
                            : `🤔 I'm not sure. Let's look at the board again.\n\nWe are looking for the problem data.\n\nCan you tell me the **number in blue** or the **number in green**?`,
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: phase }),
                        speech: lang === 'es' ? 'No te entendí. ¿Cuál es el dato azul o verde?' : 'I didn\'t understand. What is the blue or green data?'
                    }],
                };
            }

            // ONLY if phase is 'step1' (Calculation), show vertical op
            return {
                steps: [{
                    text: lang === 'es'
                        ? `💡 Ahora vamos a calcular. \n\nMira la operación: **${n1} ÷ ${n2}**.\n\n¿Cuántas veces cabe el **${n2}** en el **${n1}**?`
                        : `💡 Now let's calculate.\n\nLook at the operation: **${n1} ÷ ${n2}**.\n\nHow many times does **${n2}** fit into **${n1}**?`,
                    speech: lang === 'es' ? 'A calcular. ¿Cuántas veces cabe ' + n2 + ' en ' + n1 + '?' : 'Let\'s calculate. How many times does ' + n2 + ' fit into ' + n1 + '?',
                    visualType: 'vertical_op',
                    visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'step1' }), operand1: String(n1), operand2: String(n2), operator: '÷', result: '' },
                    detailedExplanation: { es: 'Pista división en columnas', en: 'Division hint in columns' },
                }],
            };
        }

        // --- FLUJO MULTI-PASO: dato por dato (primer dato → segundo → tercero) y luego cálculo ---
        if (type === 'multi_step') {
            const { n1, n2, n3, op2, op3, unit } = prob;
            const multiProb = prob as import('../../data/wordProblemParser').MultiStepWordProblemParsed;
            const keyword1 = multiProb.keyword1;
            const keyword2 = multiProb.keyword2;
            const firstPartText = multiProb.firstPartText;
            const secondPartText = multiProb.secondPartText;
            const mid = op2 === '+' ? n1 + n2 : n1 - n2;
            const expected = op3 === '+' ? mid + n3 : mid - n3;
            const highlights = prob.highlights && prob.highlights.length >= 3 ? prob.highlights : [
                { text: String(n1), color: 'red' as const },
                { text: String(n2), color: 'red' as const },
                { text: String(n3), color: 'red' as const },
            ];
            // Todo el problema: números + palabras clave (keyword1, keyword2) en color para todas las fases
            const fullProblemHighlights: { text: string; color: string }[] = [];
            const numberIndices: number[] = [];
            fullProblemHighlights.push({ text: highlights[0].text, color: 'blue' }); numberIndices.push(fullProblemHighlights.length - 1);
            if (keyword1) fullProblemHighlights.push({ text: keyword1, color: 'orange' });
            fullProblemHighlights.push({ text: highlights[1].text, color: 'green' }); numberIndices.push(fullProblemHighlights.length - 1);
            if (keyword2) fullProblemHighlights.push({ text: keyword2, color: 'orange' });
            fullProblemHighlights.push({ text: highlights[2].text, color: 'red' }); numberIndices.push(fullProblemHighlights.length - 1);
            if (highlights[3]) fullProblemHighlights.push(highlights[3]);

            // Intro: "Miremos el primer dato" — mostramos todo el problema con números y palabras clave en color
            if (prob.isNew && phase === 'intro') {
                const h = highlights[0];
                const primerDatoLabel = h ? (lang === 'es' ? `el que está en **azul** (${h.text})` : `the one in **blue** (${h.text})`) : (lang === 'es' ? 'el primero' : 'the first one');
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🧩 **Vamos a analizar este problema juntos** paso a paso 😊\n\nIdentifiquemos primero los **datos (números)**. Mira el tablero: está **todo el problema** con los datos y las **palabras clave** en color.\n\n👉 **¿Cuál es el primer dato?** (Es el que está en **azul** / ${primerDatoLabel})`
                            : `🧩 **Let's analyze this problem together** step by step 😊\n\nLet's first identify the **data (numbers)**. Look at the board: the **whole problem** is there with the data and the **keywords** in color.\n\n👉 **What is the first piece of data?** (It's the one in **blue** / ${primerDatoLabel})`,
                        speech: lang === 'es' ? 'Miremos el primer dato. ¿Cuál es?' : 'Let\'s look at the first piece of data. What is it?',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, null, { wpPhase: 'dato_1', highlights: fullProblemHighlights }),
                        detailedExplanation: { es: 'Paso 1: Primer dato', en: 'Step 1: First datum' },
                    }],
                };
            }

            // Dato 1: validar n1 — todo el problema con números y palabras clave en color
            if (phase === 'dato_1') {
                const saidFirst = parseFloatInput(input) != null && Math.abs((parseFloatInput(input) ?? 0) - n1) <= 0.01;
                if (isDontKnow(input)) {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `💡 Mira el **primer número** (en azul) en el problema: es **${n1}** ${unit}. ¿Cuál es el primer dato?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                                : `💡 Look at the **first number** (in blue) in the problem: it's **${n1}** ${unit}. What is the first piece of data?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                            speech: lang === 'es' ? 'El primer dato es ' + n1 + ' ' + unit + '. Si no sabes, di no sé.' : 'The first piece of data is ' + n1 + ' ' + unit + '. If you don\'t know, say I don\'t know.',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_1', highlights: fullProblemHighlights }),
                            detailedExplanation: { es: 'Pista primer dato', en: 'First datum hint' },
                        }],
                    };
                }
                if (saidFirst) {
                    const highlightsConfirmed = highlightsWithConfirmedMultiStep(fullProblemHighlights, numberIndices, 1);
                    const segundoLabel = highlights[1] ? (lang === 'es' ? `el **segundo** (${highlights[1].text})` : `the **second** (${highlights[1].text})`) : (lang === 'es' ? 'el segundo dato en verde' : 'the second piece of data in green');
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ **Muy bien.** El primer dato es **${n1}** ${unit}. (Mira: ya lo marqué en dorado en el tablero).\n\n👉 Ahora **miremos el segundo dato.** ¿Cuál es? (Es ${segundoLabel})`
                                : `✔️ **Good.** The first piece of data is **${n1}** ${unit}. (Look: I marked it in gold on the board).\n\n👉 Now **let's look at the second piece of data.** What is it? (It's ${segundoLabel})`,
                            speech: lang === 'es' ? 'Muy bien, el primer dato es ' + n1 + '. Ahora miremos el segundo dato. ¿Cuál es?' : 'Good, the first piece of data is ' + n1 + '. Now let\'s look at the second. What is it?',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_2', highlights: highlightsConfirmed }),
                            detailedExplanation: { es: 'Primer dato correcto, pedir segundo', en: 'First datum correct, ask second' },
                        }],
                    };
                }
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `Mira el **primer dato** (en azul) en el tablero. Es **${n1}** ${unit}. ¿Cuál es el primer dato?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                            : `Look at the **first piece of data** (in blue) on the board. It's **${n1}** ${unit}. What is the first piece of data?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                        speech: lang === 'es' ? 'El primer dato es ' + n1 + '. Si no sabes, di no sé.' : 'The first piece of data is ' + n1 + '. If you don\'t know, say I don\'t know.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_1', highlights: fullProblemHighlights }),
                        detailedExplanation: { es: 'Re-preguntar primer dato', en: 'Re-ask first datum' },
                    }],
                };
            }

            // Dato 2: validar n2 — todo el problema con números y palabras clave
            // Dato 2: validar n2
            if (phase === 'dato_2') {
                const userNum = parseFloatInput(input);
                if (userNum === n2 || input.includes(String(n2))) {
                    const highlightsConfirmed = highlightsWithConfirmedMultiStep(fullProblemHighlights, numberIndices, 2);
                    const terceroLabel = highlights[2] ? (lang === 'es' ? `el **tercero** en rojo (${highlights[2].text})` : `the **third** in red (${highlights[2].text})`) : (lang === 'es' ? 'el tercer dato en rojo' : 'the third piece of data in red');
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ **¡Buen trabajo!** El segundo dato es **${n2}** ${unit}. (Ya está en dorado).\n\n👉 Ahora **miremos el tercer dato.** ¿Cuál es? (Es ${terceroLabel})`
                                : `✔️ **Good job!** The second piece of data is **${n2}** ${unit}. (It's marked in gold).\n\n👉 Now **let's look at the third piece of data.** What is it? (It's ${terceroLabel})`,
                            speech: lang === 'es' ? '¡Buen trabajo! Ahora dime el tercer dato, el que está en rojo.' : 'Good job! Now tell me the third piece of data, the one in red.',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_3', highlights: highlightsConfirmed }),
                            detailedExplanation: { es: 'Segundo dato correcto, pedir tercero', en: 'Second datum correct, ask third' },
                        }],
                    };
                }
            }

            // Dato 3: validar n3 — todo el problema con números y palabras clave; luego pasar a primera parte
            if (phase === 'dato_3') {
                const saidThird = parseFloatInput(input) != null && Math.abs((parseFloatInput(input) ?? 0) - n3) <= 0.01;
                if (isDontKnow(input)) {
                    const highlights2 = highlightsWithConfirmedMultiStep(fullProblemHighlights, numberIndices, 2);
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `💡 Mira el **tercer número** (en rojo) en el problema: es **${n3}** ${unit}. ¿Cuál es el tercer dato?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                                : `💡 Look at the **third number** (in red) in the problem: it's **${n3}** ${unit}. What is the third piece of data?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                            speech: lang === 'es' ? 'El tercer dato es ' + n3 + ' ' + unit + '. Si no sabes, di no sé.' : 'The third piece of data is ' + n3 + ' ' + unit + '. If you don\'t know, say I don\'t know.',
                            visualType: 'text_only',
                            visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_3', highlights: highlights2 }),
                            detailedExplanation: { es: 'Pista tercer dato', en: 'Third datum hint' },
                        }],
                    };
                }
                if (saidThird) {
                    // Primera parte: texto del problema con números y palabra clave (ej. "prestan") en color; luego preguntar operación
                    const titulo1 = lang === 'es' ? 'Primera parte' : 'First part';
                    const boardParte1 = firstPartText
                        ? `${titulo1}\n\n${firstPartText}`
                        : `${titulo1}\n\n${n1}\n\n${n2}`;
                    const highlightsParte1: { text: string; color: string }[] = firstPartText
                        ? [
                            { text: lang === 'es' ? 'Primera' : 'First', color: 'purple' },
                            { text: lang === 'es' ? 'parte' : 'part', color: 'purple' },
                            { text: highlights[0].text, color: 'blue' },
                            ...(keyword1 ? [{ text: keyword1, color: 'orange' }] : []),
                            { text: highlights[1].text, color: 'green' },
                        ]
                        : [
                            { text: lang === 'es' ? 'Primera' : 'First', color: 'purple' },
                            { text: lang === 'es' ? 'parte' : 'part', color: 'purple' },
                            { text: String(n1), color: 'blue' },
                            { text: String(n2), color: 'green' },
                        ];
                    const opNames = lang === 'es' ? 'suma, resta, multiplicación o división' : 'addition, subtraction, multiplication or division';
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ **Muy bien.** Los tres datos son **${n1}**, **${n2}** y **${n3}** ${unit}.\n\n👉 **Listo, empecemos con la primera parte.** Mira el tablero: está la primera parte del problema con los números y la **palabra clave** en color.\n\n💭 **¿Qué operación es?** (${opNames})`
                                : `✔️ **Good.** The three pieces of data are **${n1}**, **${n2}** and **${n3}** ${unit}.\n\n👉 **Let's start with the first part.** Look at the board: the first part of the problem with the numbers and the **key word** in color.\n\n💭 **What operation is it?** (${opNames})`,
                            speech: lang === 'es' ? 'Listo, empecemos con la primera parte. Mira el tablero. ¿Qué operación necesitamos?' : 'Let\'s start with the first part. Look at the board. What operation do we need?',
                            visualType: 'text_only',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'parte_1_intro' }), text: boardParte1, highlights: highlightsParte1 },
                            detailedExplanation: { es: 'Primera parte: pedir operación', en: 'First part: ask operation' },
                        }],
                    };
                }
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `Mira el **tercer dato** (en rojo) en el tablero. Es **${n3}** ${unit}. ¿Cuál es el tercer dato?\n\nSi no sabes, di **no sé** y te lo explico. Así seguimos.`
                            : `Look at the **third piece of data** (in red) on the board. It's **${n3}** ${unit}. What is the third piece of data?\n\nIf you don't know, say **I don't know** and I'll explain. Then we continue.`,
                        speech: lang === 'es' ? 'El tercer dato es ' + n3 + '. Si no sabes, di no sé.' : 'The third piece of data is ' + n3 + '. If you don\'t know, say I don\'t know.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'dato_3', highlights: highlightsWithConfirmedMultiStep(fullProblemHighlights, numberIndices, 2) }),
                        detailedExplanation: { es: 'Re-preguntar tercer dato', en: 'Re-ask third datum' },
                    }],
                };
            }

            const calc = (a: number, b: number, op: string) => {
                if (op === '+') return a + b;
                if (op === '-') return a - b;
                if (op === '×') return a * b;
                if (op === '÷') return b !== 0 ? Math.floor(a / b) : a;
                return a;
            };
            const getOpName = (op: string) => {
                const names: Record<string, { es: string; en: string }> = {
                    '+': { es: 'suma', en: 'addition' },
                    '-': { es: 'resta', en: 'subtraction' },
                    '×': { es: 'multiplicación', en: 'multiplication' },
                    '÷': { es: 'división', en: 'division' }
                };
                return names[op]?.[lang] || 'operación';
            };
            const midVal = calc(n1, n2, op2);
            const op2Symbol = op2;
            const op3Symbol = op3;
            const op2ForVertical = op2 === '÷' ? '÷' : (op2 === '×' ? '×' : op2);
            const op3ForVertical = op3 === '÷' ? '÷' : (op3 === '×' ? '×' : op3);

            // --- Parte 1: "¿Qué operación es?" → mostrar primera parte del problema con números y palabra clave en color; luego preguntar ---
            if (phase === 'parte_1_intro') {
                const titulo1 = lang === 'es' ? 'Primera parte' : 'First part';
                const boardParte1Base = firstPartText
                    ? `${titulo1}\n\n${firstPartText}`
                    : `${titulo1}\n\n${n1}\n\n${n2}`;
                const highlightsParte1: { text: string; color: string }[] = firstPartText
                    ? [
                        { text: lang === 'es' ? 'Primera' : 'First', color: 'purple' },
                        { text: lang === 'es' ? 'parte' : 'part', color: 'purple' },
                        { text: highlights[0].text, color: 'blue' },
                        ...(keyword1 ? [{ text: keyword1, color: 'orange' }] : []),
                        { text: highlights[1].text, color: 'green' },
                    ]
                    : [
                        { text: lang === 'es' ? 'Primera' : 'First', color: 'purple' },
                        { text: lang === 'es' ? 'parte' : 'part', color: 'purple' },
                        { text: String(n1), color: 'blue' },
                        { text: String(n2), color: 'green' },
                    ];
                if (saidOperation(input, op2)) {
                    // Mostrar operación en columnas (vertical) con colores por posición
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ **Muy bien, es ${getOpName(op2)}.** Mira el tablero: puse los números **en columnas** para que podamos operar. \n\n💭 **¿Cuánto es ${n1} ${op2Symbol} ${n2}?** Responde con el resultado. Si no sabes, di **no sé** y te ayudo con preguntas.`
                                : `✔️ **Good, it's ${getOpName(op2)}.** Look at the board: I put the numbers **in columns** so we can calculate.\n\n💭 **How much is ${n1} ${op2Symbol} ${n2}?** Answer with the result. If you don't know, say **I don't know** and I'll help with questions.`,
                            speech: lang === 'es' ? 'Muy bien, es ' + getOpName(op2) + '. Mira el tablero en columnas. ¿Cuánto es ' + n1 + ' ' + op2Symbol + ' ' + n2 + '?' : 'Good, it\'s ' + getOpName(op2) + '. Look at the board in columns. How much is ' + n1 + ' ' + op2Symbol + ' ' + n2 + '?',
                            visualType: 'vertical_op',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'parte_1_resolver', midVal }), operand1: String(n1), operand2: String(n2), operator: op2ForVertical, result: '' },
                            detailedExplanation: { es: 'Operación en columnas, pedir resultado primera parte', en: 'Operation in columns, ask first result' },
                        }],
                    };
                }
                if (isDontKnow(input)) {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `💡 Mira los dos números en el tablero (en azul y verde): **${n1}** y **${n2}**. En el problema, ¿los **juntamos** (sumamos) o **quitamos** uno del otro (restamos)? ¿Qué operación es?\n\nSi no sabes, di **no sé** y te lo explico.`
                                : `💡 Look at the two numbers on the board (in blue and green): **${n1}** and **${n2}**. In the problem, do we **put them together** (add) or **take one away** from the other (subtract)? What operation is it?\n\nIf you don't know, say **I don't know** and I'll explain.`,
                            speech: lang === 'es' ? '¿Los juntamos o quitamos? ¿Suma o resta?' : 'Do we add them or subtract? What operation?',
                            visualType: 'text_only',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'parte_1_intro' }), text: boardParte1Base, highlights: highlightsParte1 },
                            detailedExplanation: { es: 'Pista operación primera parte', en: 'Hint first part operation' },
                        }],
                    };
                }
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `Mira el tablero: tenemos **${n1}** (azul) y **${n2}** (verde). Según el problema, ¿qué hay que hacer? ¿Sumar, restar, multiplicar o dividir?\n\nSi no sabes, di **no sé** y te lo explico.`
                            : `Look at the board: we have **${n1}** (blue) and **${n2}** (green). According to the problem, what do we have to do? Add, subtract, multiply or divide?\n\nIf you don't know, say **I don't know** and I'll explain.`,
                        speech: lang === 'es' ? '¿Qué operación es?' : 'What operation is it?',
                        visualType: 'text_only',
                        visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'parte_1_intro' }), text: boardParte1Base, highlights: highlightsParte1 },
                        detailedExplanation: { es: 'Re-preguntar operación', en: 'Re-ask operation' },
                    }],
                };
            }

            // --- Parte 1: resolver n1 op2 n2 = ? en columnas (hasta que diga midVal) ---
            if (phase === 'parte_1_resolver') {
                const verticalOp1 = { operand1: String(n1), operand2: String(n2), operator: op2ForVertical, result: '' as string };
                const userNum = parseFloatInput(input);
                const correctMid = userNum !== null && Math.abs(userNum - midVal) <= 0.01;
                if (correctMid) {
                    const titulo2 = lang === 'es' ? 'Segunda parte' : 'Second part';
                    const boardParte2 = secondPartText
                        ? `${titulo2}\n\n${secondPartText}`
                        : `${titulo2}\n\n${midVal}\n\n${n3}`;
                    const highlightsParte2: { text: string; color: string }[] = secondPartText
                        ? [
                            { text: lang === 'es' ? 'Segunda' : 'Second', color: 'purple' },
                            { text: lang === 'es' ? 'parte' : 'part', color: 'purple' },
                            ...(keyword2 ? [{ text: keyword2, color: 'orange' }] : []),
                            { text: highlights[2].text, color: 'green' },
                        ]
                        : [
                            { text: lang === 'es' ? 'Segunda' : 'Second', color: 'purple' },
                            { text: lang === 'es' ? 'parte' : 'part', color: 'purple' },
                            { text: String(midVal), color: 'gold' },
                            { text: String(n3), color: 'orange' },
                        ];
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `🎯 **¡Muy bien!** ${n1} ${op2Symbol} ${n2} = **${midVal}** ${unit}.\n\n👉 **Ahora la segunda parte.** Mira el tablero: está la segunda parte del problema con la **palabra clave** en color.\n\n💭 **¿Qué operación es ahora?**`
                                : `🎯 **Well done!** ${n1} ${op2Symbol} ${n2} = **${midVal}** ${unit}.\n\n👉 **Now the second part.** Look at the board: the second part of the problem with the **key word** in color.\n\n💭 **What operation is it now?**`,
                            speech: lang === 'es' ? 'Muy bien. Ahora la segunda parte. ¿Qué operación necesitamos ahora?' : 'Well done. Now the second part. What operation do we need now?',
                            visualType: 'text_only',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'parte_2_intro', midVal }), text: boardParte2, highlights: highlightsParte2 },
                            detailedExplanation: { es: 'Segunda parte: pedir operación', en: 'Second part: ask operation' },
                        }],
                    };
                }
                if (isDontKnow(input)) {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `💡 Vamos paso a paso. Mira los números **en columnas** en el tablero (cada cifra con su color). **${n1} ${op2 === '+' ? 'más' : 'menos'} ${n2}**: ¿cuánto da? Piensa en las ${op2 === '+' ? 'unidades primero, luego las decenas' : 'unidades: ¿cuántas quedan? Luego decenas'}. Si quieres, dime **no sé** y te hago más preguntas.`
                                : `💡 Let's go step by step. Look at the numbers **in columns** on the board (each digit with its color). **${n1} ${op2 === '+' ? 'plus' : 'minus'} ${n2}**: what does it equal? Think about ${op2 === '+' ? 'units first, then tens' : 'units: how many are left? Then tens'}. If you want, say **I don't know** and I'll ask you more questions.`,
                            speech: lang === 'es' ? '¿Cuánto es ' + n1 + (op2 === '+' ? ' más ' : ' menos ') + n2 + '?' : 'How much is ' + n1 + ' ' + (op2 === '+' ? 'plus' : 'minus') + ' ' + n2 + '?',
                            visualType: 'vertical_op',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'parte_1_resolver', midVal }), ...verticalOp1 },
                            detailedExplanation: { es: 'Pista resultado primera parte', en: 'Hint first part result' },
                        }],
                    };
                }
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `💡 Mira la operación **en columnas** en el tablero: **${n1} ${op2Symbol} ${n2} = ?** \n\n¿Cuánto te da esa cuenta? Empieza por las unidades.`
                            : `💡 Look at the operation **in columns** on the board: **${n1} ${op2Symbol} ${n2} = ?** \n\nWhat do you get? Start with the units.`,
                        speech: lang === 'es' ? 'Resuelve la operación en columnas. Empieza por las unidades.' : 'Solve the operation in columns. Start with the units.',
                        visualType: 'vertical_op',
                        visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'parte_1_resolver', midVal }), ...verticalOp1 },
                        detailedExplanation: { es: 'Pista resultado primera parte', en: 'Hint first part result' },
                    }],
                };
            }

            // --- Parte 2: "¿Qué operación es?" → colocar operación con colores y ayudar a resolver ---
            if (phase === 'parte_2_intro') {
                const titulo2 = lang === 'es' ? 'Segunda parte' : 'Second part';
                const boardParte2Base = `${titulo2}\n\n${midVal}\n\n${n3}`;
                const highlightsParte2: { text: string; color: string }[] = [
                    { text: lang === 'es' ? 'Segunda' : 'Second', color: 'purple' },
                    { text: lang === 'es' ? 'parte' : 'part', color: 'purple' },
                    { text: String(midVal), color: 'gold' },
                    { text: String(n3), color: 'orange' },
                ];
                if (saidOperation(input, op3)) {
                    // Mostrar operación en columnas (vertical) con colores
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `✔️ **Muy bien, es ${getOpName(op3)}.** Mira el tablero: puse los números **en columnas** para operar. \n\n💭 **¿Cuánto es ${midVal} ${op3Symbol} ${n3}?** Este es el resultado final. Si no sabes, di **no sé** y te ayudo.`
                                : `✔️ **Good, it's ${getOpName(op3)}.** Look at the board: I put the numbers **in columns** to calculate.\n\n💭 **How much is ${midVal} ${op3Symbol} ${n3}?** This is the final result. If you don't know, say **I don't know** and I'll help.`,
                            speech: lang === 'es' ? 'Muy bien. Mira el tablero en columnas. ¿Cuánto es ' + midVal + ' ' + op3Symbol + ' ' + n3 + '?' : 'Good. Look at the board in columns. How much is ' + midVal + ' ' + op3Symbol + ' ' + n3 + '?',
                            visualType: 'vertical_op',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'parte_2_resolver', midVal }), operand1: String(midVal), operand2: String(n3), operator: op3ForVertical, result: '' },
                            detailedExplanation: { es: 'Operación en columnas, pedir resultado final', en: 'Operation in columns, ask final result' },
                        }],
                    };
                }
                if (isDontKnow(input)) {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `💡 Tenemos **${midVal}** (dorado, lo que nos dio antes) y **${n3}** (naranja, el tercer dato). ¿Qué operación hay que hacer? ¿Sumar, restar, multiplicar o dividir?\n\nSi no sabes, di **no sé** y te lo explico.`
                                : `💡 We have **${midVal}** (gold, what we got before) and **${n3}** (orange, the third number). What operation do we have to do? Add, subtract, multiply or divide?\n\nIf you don't know, say **I don't know** and I'll explain.`,
                            speech: lang === 'es' ? '¿Qué operación es?' : 'What operation is it?',
                            visualType: 'text_only',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'parte_2_intro', midVal }), text: boardParte2Base, highlights: highlightsParte2 },
                            detailedExplanation: { es: 'Pista operación segunda parte', en: 'Hint second part operation' },
                        }],
                    };
                }
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `Mira el tablero: **${midVal}** (dorado) y **${n3}** (naranja). ¿Hay que sumar, restar, multiplicar o dividir? ¿Qué operación es?\n\nSi no sabes, di **no sé** y te lo explico.`
                            : `Look at the board: **${midVal}** (gold) and **${n3}** (orange). Do we add, subtract, multiply or divide? What operation is it?\n\nIf you don't know, say **I don't know** and I'll explain.`,
                        speech: lang === 'es' ? '¿Qué operación es?' : 'What operation is it?',
                        visualType: 'text_only',
                        visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'parte_2_intro', midVal }), text: boardParte2Base, highlights: highlightsParte2 },
                        detailedExplanation: { es: 'Re-preguntar operación', en: 'Re-ask operation' },
                    }],
                };
            }

            // --- Parte 2: resolver midVal op3 n3 = ? en columnas (hasta que diga expected) ---
            if (phase === 'parte_2_resolver') {
                const verticalOp2 = { operand1: String(midVal), operand2: String(n3), operator: op3ForVertical, result: '' as string };
                const userNum = parseFloatInput(input);
                const correct = userNum !== null && Math.abs(userNum - expected) <= 0.01;
                if (correct) {
                    const boardFinal = lang === 'es' ? `¡Resultado final!\n\n${expected} ${unit}` : `Final answer!\n\n${expected} ${unit}`;
                    const highlightsFinal: { text: string; color: string }[] = [
                        { text: String(expected), color: 'green' },
                        { text: unit, color: 'blue' },
                    ];
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `🎯 **¡Muy bien!** ${midVal} ${op3Symbol} ${n3} = **${expected}** ${unit}.\n\n🟦 **Resultado final: ${expected} ${unit}.**`
                                : `🎯 **Well done!** ${midVal} ${op3Symbol} ${n3} = **${expected}** ${unit}.\n\n🟦 **Final answer: ${expected} ${unit}.**`,
                            speech: lang === 'es' ? '¡Correcto! Son ' + expected + ' ' + unit + '.' : 'Correct! That is ' + expected + ' ' + unit + '.',
                            visualType: 'text_only',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'done', highlight: 'done' }), text: boardFinal, highlights: highlightsFinal },
                            detailedExplanation: { es: 'Problema completado', en: 'Problem completed' },
                        }],
                    };
                }
                if (isDontKnow(input)) {
                    return {
                        steps: [{
                            text: lang === 'es'
                                ? `💡 Mira los números **en columnas** en el tablero (cada cifra con su color). **${midVal} ${op3Symbol} ${n3}**: ¿cuánto da? Es el último paso. Si quieres, dime **no sé** y te hago preguntas para que lo resuelvas.`
                                : `💡 Look at the numbers **in columns** on the board (each digit with its color). **${midVal} ${op3Symbol} ${n3}**: what does it equal? It's the last step. If you want, say **I don't know** and I'll ask you questions to solve it.`,
                            speech: lang === 'es' ? `¿Cuánto es ${midVal} ${op3Symbol} ${n3}?` : `How much is ${midVal} ${op3Symbol} ${n3}?`,
                            visualType: 'vertical_op',
                            visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'parte_2_resolver', midVal }), ...verticalOp2 },
                            detailedExplanation: { es: 'Pista resultado final', en: 'Hint final result' },
                        }],
                    };
                }
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `💡 Mira la operación **en columnas** en el tablero: **${midVal} ${op3Symbol} ${n3} = ?** \n\n¿Cuánto es el resultado final? Tómate tu tiempo para calcularlo.`
                            : `💡 Look at the operation **in columns** on the board: **${midVal} ${op3Symbol} ${n3} = ?** \n\nWhat is the final result? Take your time to calculate it.`,
                        speech: lang === 'es' ? 'Resuelve la última operación en columnas. ¿Cuánto da?' : 'Solve the last operation in columns. What do you get?',
                        visualType: 'vertical_op',
                        visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'parte_2_resolver', midVal }), ...verticalOp2 },
                        detailedExplanation: { es: 'Pista resultado final', en: 'Hint final result' },
                    }],
                };
            }

            // step1 (legacy / fallback): usuario escribe el resultado final
            const userNum = parseFloatInput(input);
            const correct = userNum !== null && Math.abs(userNum - expected) <= 0.01;
            if (correct) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🎯 **¡Muy bien!** Resultado final: **${expected}** ${unit}.`
                            : `🎯 **Well done!** Final answer: **${expected}** ${unit}.`,
                        speech: lang === 'es' ? '¡Correcto! Son ' + expected + ' ' + unit + '.' : 'Correct! That is ' + expected + ' ' + unit + '.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'done', highlight: 'done' }),
                        detailedExplanation: { es: 'Problema completado', en: 'Problem completed' },
                    }],
                };
            }
            const boardHint = `${n1} ${op2Symbol} ${n2} = ${midVal}\n${midVal} ${op3Symbol} ${n3} = ?`;
            return {
                steps: [{
                    text: lang === 'es'
                        ? `💡 Paso 1: ${n1} ${op2} ${n2} = **${midVal}**. Paso 2: ${midVal} ${op3} ${n3} = ? El resultado final es **${expected}** ${unit}.`
                        : `💡 Step 1: ${n1} ${op2} ${n2} = **${midVal}**. Step 2: ${midVal} ${op3} ${n3} = ? The final answer is **${expected}** ${unit}.`,
                    speech: lang === 'es' ? `Primero ${n1} ${op2Symbol} ${n2} da ${midVal}. Luego ${op3Symbol} ${n3}.` : `First ${n1} ${op2Symbol} ${n2} equals ${midVal}. Then ${op3Symbol} ${n3}.`,
                    visualType: 'text_only',
                    visualData: { ...visualDataWithProblem(prob, lastState, { wpPhase: 'step1' }), text: boardHint, highlights: [] },
                    detailedExplanation: { es: 'Pista multi-paso', en: 'Multi-step hint' },
                }],
            };
        }

        // --- FLUJO TANQUE: capacidad, mitad, fracción, añadir, faltan ---
        const total = (prob as WordProblemParsed).total;
        const initialValue = (prob as WordProblemParsed).initialType === 'mitad' ? total! / 2 : (prob as WordProblemParsed).initialValue ?? total! / 2;
        const frac = (prob as WordProblemParsed).fractionSubtract;
        const spent = frac ? (initialValue * frac.num) / frac.den : 0;
        const afterSpent = initialValue - spent;
        const addAmount = (prob as WordProblemParsed).addAmount ?? 0;
        const afterAdd = afterSpent + addAmount;
        const finalAnswer = total! - afterAdd;

        // --- PASO 0: Mostrar problema en pizarra con highlights ---
        if (prob.isNew && phase === 'intro') {
            return {
                steps: [{
                    text: lang === 'es'
                        ? `🧩 **Problema**\n\n${prob.text}\n\n👉 Empecemos con calma. El tanque puede tener **${total} litros** cuando está lleno.\n\nSi estaba lleno solo hasta la **mitad**, ¿cuántos litros había al principio?`
                        : `🧩 **Problem**\n\n${prob.text}\n\n👉 Let's start calmly. The tank can hold **${total} liters** when full.\n\nIf it was only **half** full, how many liters were there at the start?`,
                    speech: lang === 'es' ? 'Empecemos con calma. El tanque puede tener ' + total + ' litros cuando está lleno. Si estaba lleno solo hasta la mitad, ¿cuántos litros había al principio?' : 'Let\'s start calmly. The tank can hold ' + total + ' liters when full. If it was only half full, how many liters were there at the start?',
                    visualType: 'text_only',
                    visualData: visualDataWithProblem(prob, null, { wpPhase: 'step1' }),
                    detailedExplanation: { es: 'Análisis de palabras clave', en: 'Keyword analysis' },
                }],
            };
        }

        const userNum = parseFloatInput(input);
        const tolerance = 0.01;

        // --- PASO 1: ¿Mitad? → 100 ---
        if (phase === 'step1' || (phase === 'intro' && !prob.isNew)) {
            const correct = userNum !== null && Math.abs(userNum - initialValue) <= tolerance;
            if (correct) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `✔️ Muy bien, la mitad de ${total} es **${initialValue}** litros.\n\nAhora mira esta parte importante: Se gastaron **${frac ? frac.num + '/' + frac.den : '?'}** de lo que había.\n\n💭 Si había ${initialValue} litros, ¿cuántos litros son ${frac ? frac.num + '/' + frac.den : '?'} de ${initialValue}?`
                            : `✔️ Good, half of ${total} is **${initialValue}** liters.\n\nNow look at this part: **${frac ? frac.num + '/' + frac.den : '?'}** of what was there was used.\n\n💭 If there were ${initialValue} liters, how many liters is ${frac ? frac.num + '/' + frac.den : '?'} of ${initialValue}?`,
                        speech: lang === 'es' ? 'Muy bien, la mitad de ' + total + ' es ' + initialValue + ' litros. Ahora: se gastaron ' + (frac ? frac.num + ' quintos' : '') + ' de lo que había. Si había ' + initialValue + ', ¿cuántos litros son ' + (frac ? frac.num + '/' + frac.den : '') + ' de ' + initialValue + '?' : 'Good, half of ' + total + ' is ' + initialValue + ' liters. Now: ' + (frac ? frac.num + '/' + frac.den : '') + ' of what was there was used. How many liters is that?',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'step2', initialValue }),
                        detailedExplanation: { es: 'Paso 1 correcto', en: 'Step 1 correct' },
                    }],
                };
            }
            // Respuesta incorrecta o "no sé" → pista manteniendo problema + highlights
            if (userNum !== null || isDontKnow(input)) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `💡 Sin problema. Mira el problema: estaba lleno hasta la **mitad**. La **mitad** de ${total} es... (divide ${total} entre 2). ¿Cuántos litros había al principio?`
                            : `💡 No problem. Look at the problem: it was **half** full. **Half** of ${total} is... (divide ${total} by 2). How many liters were there at the start?`,
                        speech: lang === 'es' ? 'La mitad se obtiene dividiendo entre dos.' : 'Half of ' + total + ' is dividing by two.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'step1' }),
                        detailedExplanation: { es: 'Pista mitad', en: 'Half hint' },
                    }],
                };
            }
        }

        // --- PASO 2: ¿2/5 de 100? → 40 ---
        if (phase === 'step2' && frac) {
            const correct = userNum !== null && Math.abs(userNum - spent) <= tolerance;
            if (correct) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `✔️ Excelente. Se gastaron **${spent}** litros.\n\n💭 Si había ${initialValue} litros y se gastaron ${spent} litros, ¿cuántos litros **quedaron**?`
                            : `✔️ Excellent. **${spent}** liters were used.\n\n💭 If there were ${initialValue} liters and ${spent} were used, how many liters **remained**?`,
                        speech: lang === 'es' ? 'Excelente. Se gastaron ' + spent + ' litros. Si había ' + initialValue + ' y se gastaron ' + spent + ', ¿cuántos litros quedaron?' : 'Excellent. ' + spent + ' liters were used. How many liters remained?',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'step3', afterSpent }),
                        detailedExplanation: { es: 'Paso 2 correcto', en: 'Step 2 correct' },
                    }],
                };
            }
            if (userNum !== null || isDontKnow(input)) {
                const useFixedClip = lang === 'es' && frac.num === 2 && frac.den === 5;
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `💡 Mira la parte naranja: se gastaron **${frac.num}/${frac.den}** de lo que había. Para calcular: dividir ${initialValue} entre ${frac.den}, luego multiplicar por ${frac.num}. ¿Cuántos litros son?`
                            : `💡 Look at the orange part: **${frac.num}/${frac.den}** of what was there was used. To calculate: divide ${initialValue} by ${frac.den}, then multiply by ${frac.num}. How many liters?`,
                        speech: useFixedClip ? 'Divide entre cinco y multiplica por dos.' : (lang === 'es' ? 'Divide ' + initialValue + ' entre ' + frac.den + ' y multiplica por ' + frac.num + '.' : 'Divide ' + initialValue + ' by ' + frac.den + ', then multiply by ' + frac.num + '.'),
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'step2' }),
                        detailedExplanation: { es: 'Pista fracción', en: 'Fraction hint' },
                    }],
                };
            }
        }

        // --- PASO 3: ¿Cuántos quedaron? → 60 ---
        if (phase === 'step3') {
            const correct = userNum !== null && Math.abs(userNum - afterSpent) <= tolerance;
            if (correct) {
                const addText = addAmount > 0
                    ? (lang === 'es' ? `Después ocurrió algo bueno 🌧️ Se añadieron **${addAmount}** litros.\n\n💭 ¿Cuánto hay ahora si sumamos ${afterSpent} + ${addAmount}?` : `Then something good happened 🌧️ **${addAmount}** liters were added.\n\n💭 How much is there now if we add ${afterSpent} + ${addAmount}?`)
                    : (lang === 'es' ? `Ahora: ¿cuántos litros **faltan** para llenar el tanque por completo? (Lleno = ${total} litros, ahora hay ${afterSpent}).` : `Now: how many liters are **missing** to fill the tank? (Full = ${total} liters, now there are ${afterSpent}).`);
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `✔️ Correcto, quedaron **${afterSpent}** litros.\n\n${addText}`
                            : `✔️ Correct, **${afterSpent}** liters remained.\n\n${addText}`,
                        speech: lang === 'es' ? 'Correcto, quedaron ' + afterSpent + ' litros. ' + (addAmount > 0 ? 'Se añadieron ' + addAmount + ' litros. ¿Cuánto hay ahora si sumamos ' + afterSpent + ' más ' + addAmount + '?' : '¿Cuántos litros faltan para llenar el tanque?') : 'Correct, ' + afterSpent + ' liters remained. ' + (addAmount > 0 ? 'How much is there now?' : 'How many liters are missing?'),
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: addAmount > 0 ? 'step4' : 'step5', afterAdd: addAmount > 0 ? afterAdd : afterSpent }),
                        detailedExplanation: { es: 'Paso 3 correcto', en: 'Step 3 correct' },
                    }],
                };
            }
            if (userNum !== null || isDontKnow(input)) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `💡 Había **${initialValue}** litros y se gastaron **${spent}** litros. ¿Cuántos **quedaron**? (Resta: ${initialValue} − ${spent} = ?)`
                            : `💡 There were **${initialValue}** liters and **${spent}** were used. How many **remained**? (Subtract: ${initialValue} − ${spent} = ?)`,
                        speech: lang === 'es' ? 'Había ' + initialValue + ' y se gastaron ' + spent + '. Quedaron: resta.' : 'There were ' + initialValue + ' and ' + spent + ' were used. Remainder: subtract.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'step3' }),
                        detailedExplanation: { es: 'Pista quedaron', en: 'Remainder hint' },
                    }],
                };
            }
        }

        // --- PASO 4: ¿Cuánto hay ahora? → 75.5 ---
        if (phase === 'step4' && addAmount > 0) {
            const correct = userNum !== null && Math.abs(userNum - afterAdd) <= tolerance;
            if (correct) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `✔️ Muy bien, ahora hay **${afterAdd}** litros.\n\nAhora lee la pregunta final: ¿Cuántos litros **faltan** para llenar el tanque por completo?\n\n💭 Lleno son ${total} litros. Ahora hay ${afterAdd} litros. ¿Cuánto falta para llegar a ${total}?`
                            : `✔️ Good, now there are **${afterAdd}** liters.\n\nNow the final question: How many liters are **missing** to fill the tank?\n\n💭 Full is ${total} liters. Now there are ${afterAdd}. How much is missing to reach ${total}?`,
                        speech: lang === 'es' ? 'Muy bien, ahora hay ' + afterAdd + ' litros. ¿Cuántos litros faltan para llenar el tanque? Lleno son ' + total + ', ahora hay ' + afterAdd + '.' : 'Good, now there are ' + afterAdd + ' liters. How many liters are missing to fill the tank?',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'step5' }),
                        detailedExplanation: { es: 'Paso 4 correcto', en: 'Step 4 correct' },
                    }],
                };
            }
            if (userNum !== null || isDontKnow(input)) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `💡 Mira la parte morada: se **añadieron** ${addAmount} litros. Había ${afterSpent} litros. ¿Cuánto hay **ahora**? (Suma: ${afterSpent} + ${addAmount} = ?)`
                            : `💡 Look at the purple part: **${addAmount}** liters were added. There were ${afterSpent} liters. How much is there **now**? (Add: ${afterSpent} + ${addAmount} = ?)`,
                        speech: lang === 'es' ? 'Suma ' + afterSpent + ' más ' + addAmount + '.' : 'Add ' + afterSpent + ' plus ' + addAmount + '.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'step4' }),
                        detailedExplanation: { es: 'Pista suma', en: 'Add hint' },
                    }],
                };
            }
        }

        // --- PASO 5: ¿Cuánto falta? → 124.5 ---
        if (phase === 'step5') {
            const correct = userNum !== null && Math.abs(userNum - finalAnswer) <= tolerance;
            if (correct) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `🎯 **¡Muy bien!** Faltan **${finalAnswer}** litros para llenar completamente el tanque.\n\n🟦 Respuesta final: **Faltan ${finalAnswer} litros** para llenar completamente el tanque.`
                            : `🎯 **Well done!** **${finalAnswer}** liters are missing to fill the tank completely.\n\n🟦 Final answer: **${finalAnswer} liters** are missing to fill the tank completely.`,
                        speech: lang === 'es' ? '¡Muy bien! Faltan ' + finalAnswer + ' litros para llenar completamente el tanque.' : 'Well done! ' + finalAnswer + ' liters are missing to fill the tank completely.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'done', highlight: 'done' }),
                        detailedExplanation: { es: 'Problema completado', en: 'Problem completed' },
                    }],
                };
            }
            if (userNum !== null || isDontKnow(input)) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `💡 Mira la pregunta en rojo: ¿cuántos litros **faltan**? Lleno = **${total}** litros. Ahora hay **${afterAdd}** litros. Faltan = ${total} − ${afterAdd} = ?`
                            : `💡 Look at the red question: how many liters are **missing**? Full = **${total}** liters. Now there are **${afterAdd}**. Missing = ${total} − ${afterAdd} = ?`,
                        speech: lang === 'es' ? 'Faltan se calcula restando del total lo que hay ahora.' : 'Missing is the total minus what we have now.',
                        visualType: 'text_only',
                        visualData: visualDataWithProblem(prob, lastState, { wpPhase: 'step5' }),
                        detailedExplanation: { es: 'Pista faltan', en: 'Missing hint' },
                    }],
                };
            }
        }

        // Nunca quedarse callada: si llegamos aquí, re-preguntar y decir cómo continuar
        const reAskEs = 'Mira el tablero y responde con lo que veas. Si no sabes, di **no sé** y te lo explico. Así seguimos.';
        const reAskEn = 'Look at the board and answer with what you see. If you don\'t know, say **I don\'t know** and I\'ll explain. Then we continue.';
        return {
            steps: [{
                text: lang === 'es' ? `🧩 ${reAskEs}` : `🧩 ${reAskEn}`,
                speech: lang === 'es' ? 'Si no sabes, di no sé y te lo explico. Así seguimos.' : 'If you don\'t know, say I don\'t know and I\'ll explain. Then we continue.',
                visualType: 'text_only',
                visualData: lastState ? { ...lastState, text: (prob as any).text, highlights: (prob as any).highlights, wpParsed: prob, wpPhase: lastState.wpPhase || 'intro' } : { text: (prob as any).text, highlights: (prob as any).highlights, wpParsed: prob, wpPhase: 'intro' },
                detailedExplanation: { es: 'Continuar sin quedarse callada', en: 'Continue without staying silent' },
            }],
        };
    }
}
