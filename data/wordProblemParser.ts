/**
 * Parser para problemas verbales: tanque (capacidad, mitad, fracción, añadir, faltan)
 * y genéricos (suma/resta de cantidades con unidades: kg, litros, etc.).
 * Extrae datos y genera highlights para la pizarra virtual (misma secuencia para todos).
 */

/** Problema multi-paso: tenía X, compró/gastó Y, añadió/quitó Z → resultado */
export interface MultiStepWordProblemParsed {
    type: 'multi_step';
    n1: number;
    n2: number;
    n3: number;
    op2: '+' | '-' | '×' | '÷';  // n1 op2 n2
    op3: '+' | '-' | '×' | '÷';  // (n1 op2 n2) op3 n3
    unit: string;
    text: string;
    highlights: { text: string; color: string }[];
    /** Palabra clave de la primera parte (ej. "prestan", "compró") para resaltar en color */
    keyword1?: string;
    /** Palabra clave de la segunda parte (ej. "llegan", "vendió") */
    keyword2?: string;
    /** Texto de la primera parte del problema (hasta n2) para mostrar con números y keyword en color */
    firstPartText?: string;
    /** Texto de la segunda parte del problema (desde n3) */
    secondPartText?: string;
}

/** Problema tipo "suma/resta de cantidades": X + Y total, o X - Y quedan. Incluye suma de fracciones (ej. 3/4 km + 2/5 km). */
export interface GenericWordProblemParsed {
    type: 'add_quantities' | 'subtract_quantities' | 'multiply_quantities' | 'divide_quantities' | 'add_fraction_quantities' | 'mcd_problem';
    /** Primer número (o factor/cociente); no usado en add_fraction_quantities */
    n1?: number;
    /** Segundo número (o factor/divisor); no usado en add_fraction_quantities */
    n2?: number;
    /** Para add_fraction_quantities: primera fracción (ej. 3/4 de km) */
    frac1?: { num: number; den: number };
    /** Para add_fraction_quantities: segunda fracción (ej. 2/5 de km) */
    frac2?: { num: number; den: number };
    /** Unidad: kg, litros, kilómetro, etc. */
    unit: string;
    /** Texto original */
    text: string;
    highlights: { text: string; color: string }[];
}

/** Problema financiero multi-paso: Cajas -> Paquetes -> Unidades -> Precio Venta -> Costo -> Ganancia */
export interface FinancialChallengeParsed {
    type: 'financial_challenge';
    text: string;
    productChain: {
        factors: number[]; // [3, 24, 15] or [3750, 24]
        totalUnits?: number;
        unitName: string;
        operation?: 'multiply' | 'divide';
    };
    revenue: {
        pricePerUnit: number; // 7
        totalRevenue?: number;
    };
    profit: {
        cost: number; // 5000
    };
    highlights: { text: string; color: string }[];
}

/** Problema de Regla de Tres (Proporcionalidad): A -> B, C -> X */
export interface ProportionWordProblemParsed {
    type: 'proportion';
    /** Primer dato (ej. 2 libros) */
    a1: number;
    /** Segundo dato (ej. 10 dólares) */
    b1: number;
    /** Tercer dato (ej. 5 libros) */
    a2: number;
    /** Unidad A (ej. libros) */
    unitA: string;
    /** Unidad B (ej. dólares) */
    unitB: string;
    text: string;
    highlights: { text: string; color: string }[];
}

export interface WordProblemParsed {
    type?: string;
    /** Texto original del problema */
    text: string;
    /** Capacidad total (ej. 200 litros) */
    total: number;
    /** Inicio: 'mitad' → total/2, o número explícito */
    initialType: 'mitad' | 'number';
    initialValue?: number;
    /** Fracción que se resta (ej. 2/5 de lo que había) */
    fractionSubtract?: { num: number; den: number };
    /** Cantidad que se suma (ej. 15.5 litros) */
    addAmount?: number;
    /** Pregunta final: 'faltan' | 'quedan' | 'hay' */
    questionType: 'faltan' | 'quedan' | 'hay';
    /** Highlights para la pizarra: texto a resaltar y color (blue, green, orange, purple, red) */
    highlights: { text: string; color: string }[];
}

const CAPACITY_PATTERNS = [
    /capacidad\s+de\s+(\d+(?:[.,]\d+)?)\s*(?:litros?|L)/i,
    /(\d+(?:[.,]\d+)?)\s*litros?\s*(?:de\s+capacidad|cuando está lleno)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:litros?|L)\s*(?:en\s+total|total)/i,
];

const FRACTION_PATTERNS = [
    /gastaron\s+(\d+)\/(\d+)\s+de\s+lo\s+que\s+había/i,
    /se\s+gastaron\s+(\d+)\/(\d+)/i,
    /(\d+)\/(\d+)\s+de\s+lo\s+que\s+había/i,
    /perdió\s+(\d+)\/(\d+)/i,
];
/** Fracciones en palabras (típico en colegios colombianos): "dos quintos", "tres cuartos" */
const FRACTION_WORDS: { regex: RegExp; num: number; den: number }[] = [
    { regex: /dos\s+quintos|2\s*\/\s*5/i, num: 2, den: 5 },
    { regex: /tres\s+cuartos|3\s*\/\s*4/i, num: 3, den: 4 },
    { regex: /un\s+tercio|1\s*\/\s*3/i, num: 1, den: 3 },
    { regex: /un\s+cuarto|1\s*\/\s*4/i, num: 1, den: 4 },
];
function parseFractionWords(trimmed: string): { num: number; den: number } | undefined {
    for (const { regex, num, den } of FRACTION_WORDS) {
        if (regex.test(trimmed)) return { num, den };
    }
    return undefined;
}

const ADD_PATTERNS = [
    /añadieron\s+(\d+(?:[.,]\d+)?)\s*(?:litros?|L)/i,
    /se\s+añadieron\s+(\d+(?:[.,]\d+)?)/i,
    /sumaron\s+(\d+(?:[.,]\d+)?)/i,
    /agregaron\s+(\d+(?:[.,]\d+)?)/i,
];

function parseNumber(s: string): number {
    const trimmed = s.trim().replace(/\s/g, '');
    // Caso 1: Formato "-1.260,50" o "1.260" (punto miles, coma decimal)
    if (/^-?\d{1,3}(\.\d{3})*(,\d+)?$/.test(trimmed)) {
        return parseFloat(trimmed.replace(/\./g, '').replace(',', '.'));
    }
    // Caso 2: Formato "-1,260.50" o "1,260" (coma miles, punto decimal)
    if (/^-?\d{1,3}(,\d{3})*(\.\d+)?$/.test(trimmed)) {
        return parseFloat(trimmed.replace(/,/g, ''));
    }
    // Caso 3: Solo número con punto o coma decimal simple (ej. "-10.5" o "10,5")
    return parseFloat(trimmed.replace(',', '.'));
}

/**
 * Intenta parsear un problema verbal tipo "tanque" (capacidad, mitad, fracción, añadir, faltan).
 * Devuelve null si no reconoce el patrón.
 */
export function parseWordProblem(text: string): WordProblemParsed | null {
    const trimmed = text.trim();
    if (trimmed.length < 30) return null;

    let total = 0;
    for (const re of CAPACITY_PATTERNS) {
        const m = trimmed.match(re);
        if (m) {
            total = parseNumber(m[1]);
            break;
        }
    }
    if (total <= 0) {
        const anyNum = trimmed.match(/((?:\d+[.,])*\d+)\s*litros?/i);
        if (anyNum) total = parseNumber(anyNum[1]);
    }
    if (total <= 0) return null;

    const hasMitad = /\bmitad\b|hasta\s+la\s+mitad|lleno\s+hasta\s+la\s+mitad/i.test(trimmed);
    const initialType: 'mitad' | 'number' = hasMitad ? 'mitad' : 'number';
    const initialValue = hasMitad ? total / 2 : undefined;

    let fractionSubtract: { num: number; den: number } | undefined;
    for (const re of FRACTION_PATTERNS) {
        const m = trimmed.match(re);
        if (m) {
            fractionSubtract = { num: parseInt(m[1], 10), den: parseInt(m[2], 10) };
            break;
        }
    }
    if (!fractionSubtract && (/\bgastaron\b|\bse\s+gastaron\b|\bperdió\b/i.test(trimmed))) {
        fractionSubtract = parseFractionWords(trimmed);
    }

    let addAmount: number | undefined;
    for (const re of ADD_PATTERNS) {
        const m = trimmed.match(re);
        if (m) {
            addAmount = parseNumber(m[1]);
            break;
        }
    }

    const hasFaltan = /\bfaltan\b|cuántos?\s+faltan|litros?\s+faltan/i.test(trimmed);
    const hasQuedan = /\bquedan\b|cuántos?\s+quedan/i.test(trimmed);
    const questionType: 'faltan' | 'quedan' | 'hay' = hasFaltan ? 'faltan' : hasQuedan ? 'quedan' : 'hay';

    // Construir highlights (palabras clave para la pizarra)
    const highlights: { text: string; color: string }[] = [];
    const totalStr = String(total);
    if (trimmed.includes(totalStr)) {
        highlights.push({ text: totalStr + (trimmed.includes('litros') ? ' litros' : ''), color: 'blue' });
    }
    if (hasMitad && trimmed.includes('mitad')) highlights.push({ text: 'mitad', color: 'green' });
    if (fractionSubtract) {
        const fracStr = `${fractionSubtract.num}/${fractionSubtract.den}`;
        if (trimmed.includes(fracStr)) highlights.push({ text: fracStr + ' de lo que había', color: 'orange' });
    }
    if (addAmount != null) {
        const addStr = String(addAmount).replace('.', ',');
        if (trimmed.includes(String(addAmount)) || trimmed.includes(addStr))
            highlights.push({ text: addAmount + ' litros', color: 'purple' });
    }
    if (questionType === 'faltan' && trimmed.includes('faltan')) highlights.push({ text: 'faltan', color: 'red' });

    return {
        text: trimmed,
        total,
        initialType,
        initialValue,
        fractionSubtract,
        addAmount,
        questionType,
        highlights: highlights.length > 0 ? highlights : [{ text: totalStr, color: 'blue' }],
    };
}

/** Número con decimal opcional (acepta coma o punto). */
function parseNum(s: string): number {
    return parseFloat(s.replace(',', '.')) || 0;
}

/** Para multi-paso: acepta separador de miles (1.260 → 1260, 1,260 → 1260). */
function parseNumMultiStep(s: string): number {
    const trimmed = s.trim();
    if (/^\d{1,3}([.,]\d{3})+$/.test(trimmed)) {
        const asInt = parseInt(trimmed.replace(/[.,]/g, ''), 10);
        return Number.isNaN(asInt) ? parseNum(trimmed) : asInt;
    }
    return parseNum(trimmed);
}

/** Problema de geometría: rectángulo/círculo/triángulo con medidas; la profesora dibuja la figura y hace preguntas. */
export interface GeometryWordProblemParsed {
    type: 'geometry';
    shape: 'rectangle' | 'circle' | 'triangle' | 'square';
    /** Base (rectángulo, triángulo) o lado (cuadrado) */
    base?: number;
    /** Altura (rectángulo, triángulo) */
    height?: number;
    /** Radio (círculo) */
    radius?: number;
    text: string;
    highlights: { text: string; color: string }[];
}

/**
 * Problemas verbales genéricos: suma/resta de cantidades (kg, litros, etc.).
 * Misma secuencia: mostrar problema con palabras clave coloreadas → preguntar → validar o pista.
 */
export type AnyWordProblemParsed = GenericWordProblemParsed | MultiStepWordProblemParsed | GeometryWordProblemParsed | FinancialChallengeParsed | ProportionWordProblemParsed;

export function parseGenericWordProblem(text: string): AnyWordProblemParsed | null {
    const t = text.trim();
    if (t.length < 20) return null;

    // CHALLENGE FINANCIERO (Multi-paso: Multiplicación/División + Dinero)
    // Ej: "3750 kg. Empacó en cajas de 24. Vendió a $180. Gastó $25000."
    const isFinancial = (/ganancia|pérdida|profit|loss|ganó|perdió|dinero/i.test(t) && /(\$|vendió|sold|gastó|costo|cost)/i.test(t));

    if (isFinancial) {
        // Regex mejorado: Soporta "3 750", "3.750", "25 000"
        // Captura: (Currency)? (Number with spaces/dots/commas)
        const allNumsMatches = [...t.matchAll(/(\$|USD|pesos)?\s*(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d+)?)/gi)];

        if (allNumsMatches && allNumsMatches.length >= 3) {
            const factors: number[] = [];
            let cost = 0;
            let price = 0;

            const parsedNums = allNumsMatches.map(m => {
                const raw = m[0];
                const isCurrency = raw.includes('$') || raw.toLowerCase().includes('usd') || raw.toLowerCase().includes('pesos');
                const valStr = m[2].replace(/\s/g, ''); // Remove spaces for parsing
                const val = parseNumMultiStep(valStr);
                return { val, isCurrency, original: raw.trim() };
            });

            // 1. Costo: Mayor valor (>1000 usualmente)
            const maxVal = Math.max(...parsedNums.map(p => p.val));
            parsedNums.forEach(p => {
                if (p.val === maxVal) cost = p.val;
                else if (p.isCurrency || (p.val < 500 && (t.includes(`$${p.val}`) || t.includes(`$ ${p.val}`)))) price = p.val;
                else factors.push(p.val);
            });

            // Fallback precio
            if (price === 0 && factors.length > 2) {
                const last = factors[factors.length - 1];
                if (last < 500) { price = last; factors.pop(); }
            }

            // Detectar operación: División si hay palabras de empacar/repartir
            const isDivision = /empac[óo]|envas[óo]|dividi[óo]|reparti[óo]|llen[óo]|caben|distribui[óo]|cada\s+una/i.test(t) && /cajas?|bolsas?|boxes|bags/i.test(t);

            if (factors.length >= 1 && cost > 0) {
                const highlights = parsedNums.map(p => ({
                    text: p.original,
                    color: p.val === cost ? 'red' : (p.val === price ? 'green' : 'blue')
                }));

                return {
                    type: 'financial_challenge',
                    text: t,
                    productChain: {
                        factors,
                        unitName: isDivision ? 'cajas/bolsas' : 'artículos',
                        operation: isDivision ? 'divide' : 'multiply'
                    },
                    revenue: { pricePerUnit: price > 0 ? price : 0 },
                    profit: { cost },
                    highlights
                };
            }
        }
    }

    // PRIORIDAD 1: Suma de fracciones general (3/4 pizza + 2/5 pizza, 3/4 km + 2/5 km, ¿cuántos en total?)
    // Debe ir primero para no confundir con "dos números y total" (que tomaría 3 y 2 de 3/4 y 2/5)
    const hasFractionGeneral = /\d+\s*\/\s*\d+/.test(t) && (/\b(?:en\s+)?total\b|cuánt[oa]s?\b|\bcomieron\b|\bquedan\b|\btotal\b/i.test(t));
    if (hasFractionGeneral) {
        // Regex que busca dos fracciones (num/den) separadas por palabras de unión
        const fracMatch = t.match(/(\d+)\s*\/\s*(\d+)[\s\S]*?(?:y|and|más|plus|con)[\s\S]*?(\d+)\s*\/\s*(\d+)/i);
        if (fracMatch) {
            const n1 = parseInt(fracMatch[1], 10);
            const d1 = parseInt(fracMatch[2], 10);
            const n2 = parseInt(fracMatch[3], 10);
            const d2 = parseInt(fracMatch[4], 10);
            if (d1 > 0 && d2 > 0 && n1 > 0 && n2 > 0) {
                const f1 = `${fracMatch[1]}/${fracMatch[2]}`;
                const f2 = `${fracMatch[3]}/${fracMatch[4]}`;

                // Datos importantes para colorear en la pizarra
                const totalPhrase = (t.match(/\b(en\s+)?total\b/i)?.[0] || t.match(/cuánt[oa]s?[^.?]*/i)?.[0]?.trim() || 'en total').trim();
                const highlights: { text: string; color: string }[] = [
                    { text: f1, color: 'blue' },
                    { text: f2, color: 'green' },
                    { text: totalPhrase, color: 'red' },
                ];

                // Detectar unidad (pizza, km, litros, etc.)
                const unitMatch = t.match(/pizza|pastel|torta|tarta|litros?|L|kg|kilogramos?|km|kil[oó]metros?|metro|m\b/i);
                const unit = unitMatch ? unitMatch[0] : 'unidades';
                if (unitMatch) highlights.push({ text: unitMatch[0], color: 'purple' });

                // Contexto temporal opcional
                const mananaMatch = t.match(/por\s+la\s+mañana|mañana/i)?.[0];
                if (mananaMatch) highlights.push({ text: mananaMatch.trim(), color: 'orange' });
                const tardeMatch = t.match(/por\s+la\s+tarde|tarde/i)?.[0];
                if (tardeMatch) highlights.push({ text: tardeMatch.trim(), color: 'orange' });

                return {
                    type: 'add_fraction_quantities',
                    frac1: { num: n1, den: d1 },
                    frac2: { num: n2, den: d2 },
                    unit,
                    text: t,
                    highlights,
                };
            }
        }
    }

    // Geometría: rectángulo/cuadrado/círculo/triángulo con base, altura o radio
    // Geometría: rectángulo/cuadrado/círculo/triángulo con base, altura o radio
    const rectMatch = t.match(/(?:rect[aá]ngulo|cuadrado|forma\s+de\s+rect[aá]ngulo)[\s\S]*?(?:largo|base)\s*(?:de\s+)?(\d+(?:[.,]\d+)?)\s*[\s\S]*?(?:ancho|altura)\s*(?:de\s+)?(\d+(?:[.,]\d+)?)/i)
        || t.match(/(?:base|largo)\s+(\d+(?:[.,]\d+)?)\s*(?:y|,|\.)\s*(?:altura|ancho)\s+(\d+(?:[.,]\d+)?)/i)
        || t.match(/(?:rect[aá]ngulo|cuadrado)\s+(?:de\s+)?(\d+(?:[.,]\d+)?)\s*(?:por|x|×)\s*(\d+(?:[.,]\d+)?)/i)
        // "5 m de largo y 3 m de ancho" - number BEFORE dimension keyword
        || t.match(/(\d+(?:[.,]\d+)?)\s*(?:m|cm|metros?|cent[ií]metros?)?\s*(?:de\s+)?(?:largo|base)[\s\S]*?(\d+(?:[.,]\d+)?)\s*(?:m|cm|metros?|cent[ií]metros?)?\s*(?:de\s+)?(?:ancho|altura)/i);

    if (rectMatch && /\b(?:área|area|per[ií]metro|cu[aá]nto\s+mide)\b/i.test(t)) {
        const b = parseNum(rectMatch[1] || '0');
        const h = parseNum(rectMatch[2] || '0');
        if (b > 0 && h > 0) {
            const isSquare = /\bcuadrado\b/i.test(t) || Math.abs(b - h) < 0.01;
            const shape: 'rectangle' | 'square' = isSquare ? 'square' : 'rectangle';
            const highlights: { text: string; color: string }[] = [
                { text: String(b), color: 'blue' },
                { text: String(h), color: 'green' },
                { text: t.match(/\b(?:área|area|per[ií]metro|cu[aá]nto\s+mide)\b/i)?.[0] || 'área', color: 'red' },
            ];

            // Sub-dato: dividir en cuadrados de X lado
            const subDivide = t.match(/dividir\s+en\s+cuadrados\s+(?:iguales\s+)?de\s+(\d+(?:[.,]\d+)?)/i);
            const side = subDivide ? parseNum(subDivide[1]) : undefined;

            return {
                type: 'geometry',
                shape,
                base: b,
                height: h,
                text: t,
                highlights,
                ...(side ? { subQuestion: 'divide_into_squares', squareSide: side } : {})
            };
        }
    }
    const circleMatch = t.match(/(?:c[ií]rculo)\s+(?:de\s+)?(?:radio\s+)?(\d+(?:[.,]\d+)?)|radio\s+(\d+(?:[.,]\d+)?)/i);
    if (circleMatch && /\b(?:área|area|per[ií]metro|circunferencia|cu[aá]nto\s+mide)\b/i.test(t)) {
        const r = parseNum(circleMatch[1] || circleMatch[2] || '0');
        if (r > 0) {
            const highlights: { text: string; color: string }[] = [
                { text: String(r), color: 'blue' },
                { text: t.match(/\b(?:área|area|per[ií]metro|circunferencia)\b/i)?.[0] || 'área', color: 'red' },
            ];
            return { type: 'geometry', shape: 'circle', radius: r, text: t, highlights };
        }
    }
    const triMatch = t.match(/(?:tri[aá]ngulo)\s+(?:de\s+)?(?:base\s+)?(\d+(?:[.,]\d+)?)\s*(?:y|,|\s)\s*(?:altura\s+)?(\d+(?:[.,]\d+)?)|base\s+(\d+(?:[.,]\d+)?)\s*(?:y|,|\s)\s*altura\s+(\d+(?:[.,]\d+)?)/i);
    if (triMatch && /\b(?:área|area|tri[aá]ngulo|cu[aá]nto\s+mide)\b/i.test(t)) {
        const b = parseNum(triMatch[1] || triMatch[3] || '0');
        const h = parseNum(triMatch[2] || triMatch[4] || '0');
        if (b > 0 && h > 0) {
            const highlights: { text: string; color: string }[] = [
                { text: String(b), color: 'blue' },
                { text: String(h), color: 'green' },
                { text: t.match(/\b(?:área|area)\b/i)?.[0] || 'área', color: 'red' },
            ];
            return { type: 'geometry', shape: 'triangle', base: b, height: h, text: t, highlights };
        }
    }

    // Resta: "tenía X kg, vendió/usó Y kg, ¿cuántos kg quedan?"
    const subtractTwo = t.match(/(-?\d+(?:[.,]\d+)?)\s*(?:kg|litros?|L|unidades?|°C|grados)?[\s\S]*?(?:vendió|vendieron|gastó|gastaron|usó|usaron|perdió|perdieron|sold|spent|used|lost|bajó|descendió|disminuyó|decreció)[\s\S]*?(-?\d+(?:[.,]\d+)?)\s*(?:kg|litros?|L|°C|grados)?/i);
    if (subtractTwo && /\bquedan\b|cuántos?\s+quedan|how\s+many\s+(?:left|remain)|quedaron|restan|final\b/i.test(t)) {
        const n1 = parseNum(subtractTwo[1]);
        const n2 = parseNum(subtractTwo[2]);
        if (n1 !== 0 || n2 !== 0) {
            const unit = /\bkg\b|kilogramos?/i.test(t) ? 'kg' : /\blitros?\b|L\b/i.test(t) ? 'litros' : 'unidades';
            const keywordSub = t.match(/\b(vendió|vendieron|gastó|gastaron|usó|usaron|perdió|perdieron|sold|spent|used|lost)\b/i)?.[0];
            const highlights: { text: string; color: string }[] = [
                { text: subtractTwo[1], color: 'blue' },
                { text: subtractTwo[2], color: 'green' },
                { text: t.match(/\bquedan\b|cuántos?\s+quedan|how\s+many\s+left/i)?.[0] || 'quedan', color: 'red' },
            ];
            if (keywordSub) highlights.splice(2, 0, { text: keywordSub, color: 'orange' });
            return { type: 'subtract_quantities', n1, n2, unit, text: t, highlights };
        }
    }

    // Multiplicación: "4 cajas con 12 manzanas cada una", "4 × 12", "4 packs of 6"
    // Also supports inverted order: "paquetes de 6 galletas. Si compro 5 paquetes"
    const multMatch = t.match(/(-?\d+)\s*(?:cajas?|paquetes?|packs?|bolsas?|veces)\s*(?:de|con|of)\s*(-?\d+)\s*(?:unidades?|manzanas?|galletas?|each)?/i)
        || t.match(/(?:paquetes?|cajas?|bolsas?)\s*(?:de|con)\s*(-?\d+)\s*(?:unidades?|manzanas?|galletas?|dulces?)?[\s\S]*?(?:compro|compré|compramos|bought|tiene|tengo)\s+(-?\d+)\s*(?:paquetes?|cajas?|bolsas?)/i)
        || t.match(/(?:compro|compré|compramos|bought|tiene|tengo)\s+(-?\d+)\s*(?:paquetes?|cajas?|bolsas?)\s*(?:de|con)\s*(-?\d+)/i)
        || t.match(/(-?\d+)\s*(?:×|x|\*|por|times)\s*(-?\d+)/)
        || t.match(/(-?\d+)\s*(?:cada\s+una|cada\s+uno|each)\s*[^.]*?(-?\d+)/i);
    if (multMatch && (/\bcuántas?\b|total\b|how\s+many|in\s+total/i.test(t) || multMatch[0].includes('×') || multMatch[0].includes('x'))) {
        const n1 = parseNum(multMatch[1]);
        const n2 = parseNum(multMatch[2]);
        if (n1 > 0 && n2 > 0) {
            const unit = /\bmanzanas?\b|naranjas?\b|peras?\b/i.test(t) ? (t.match(/\b(manzanas?|naranjas?|peras?)/i)?.[1] || 'unidades') : /\bkg\b/i.test(t) ? 'kg' : 'unidades';
            const keyMult = t.match(/\b(cajas?|paquetes?|packs?|bolsas?|veces|con|cada\s+una|cada\s+uno|times|each)\b/i)?.[0];
            const highlights: { text: string; color: string }[] = [
                { text: multMatch[1], color: 'blue' },
                { text: multMatch[2], color: 'green' },
                { text: t.match(/\bcuántas?\b|total\b|how\s+many/i)?.[0] || 'total', color: 'red' },
            ];
            if (keyMult) highlights.splice(2, 0, { text: keyMult, color: 'orange' });
            return { type: 'multiply_quantities', n1, n2, unit, text: t, highlights };
        }
    }

    // División: "36 manzanas entre 6 niños", "36 ÷ 6", "repartir 36 entre 6", "Se reparten 36 galletas entre 6"
    const divMatch = t.match(/(-?\d+)\s*(?:manzanas?|galletas?|dulces?|hojas?|entre|÷|\/)\s*(-?\d+)\s*(?:niños?|personas?|estudiantes?|children|people)?/i)
        || t.match(/(?:repartir|reparten|repartieron|repartirse|reparte)\s+(-?\d+)\s+entre\s+(-?\d+)/i)
        || t.match(/(?:se\s+)?(?:reparten|repartieron|repartirse|reparte|repartir)\s+(-?\d+)\s*(?:manzanas?|galletas?|dulces?|hojas?|caramelos?)?\s+entre\s+(-?\d+)/i)
        || t.match(/(-?\d+)\s*[÷\/]\s*(-?\d+)/);

    // División Agrupación (Contenedores): "125 alumnos. Cada autobús lleva 48. ¿Cuántos autobuses...?"
    // Patrón: (Num Total) ... Cada (Singular) ... (Num Capacidad) ... Cuántos (Plural)
    const groupingMatch = t.match(/(-?\d+)\s*(?:alumnos?|personas?|litros?|kg|libros?|unidades?)?[\s\S]*?cada\s+(?:uno|autobús|bus|caja|bote|auto|coche|viaje|bolsa)\s*(?:puede\s+llevar|caben|tiene|lleva|hace)?\s*(-?\d+)/i);

    if ((divMatch && (/\bcuántas?\b[^.?]*?\bcada\s+(?:uno|una|niño|niña|persona|estudiante)\b|\bcuántas?\s+(?:le\s+)?tocan\b|how\s+many\s+each|cada\s+uno|per\s+person|cuántas?\s+(?:galletas?|manzanas?|dulces?|hojas?)\s+(?:le\s+)?(?:tocan|recibe)/i.test(t) || divMatch[0].includes('÷') || /\b(?:repartir|reparten|repartieron|repartirse|reparte)\b/i.test(t))) ||
        (groupingMatch && /\bcuántos?\s+(?:autobuses|buses|cajas|botes|viajes|bolsas|necesitan)\b/i.test(t))) {

        const match = divMatch || groupingMatch;
        if (!match) return null; // Should not happen given if condition

        const n1 = parseNum(match[1]);
        const n2 = parseNum(match[2]);
        if (n1 > 0 && n2 > 0) {
            const unit = /\bmanzanas?\b|galletas?\b|dulces?\b/i.test(t) ? (t.match(/\b(manzanas?|galletas?|dulces?)/i)?.[1] || 'unidades') : /\blitros?\b|L\b/i.test(t) ? 'litros' : /\bkg\b|kilogramos?/i.test(t) ? 'kg' : /\balumnos?|personas?/i.test(t) ? 'personas' : 'unidades';

            // Detect keywords for highlighting
            const keyDiv = t.match(/\b(entre|repartir|reparten|repartieron|÷|\/|cada\s+uno|cada\s+autobús|cada\s+bus|cada\s+caja)\b/i)?.[0];
            const keyQuestion = t.match(/\bcuántas?\b[^.?]*?\bcada\b|\bcuántas?\s+(?:cada|autobuses|buses|cajas|viajes|necesitan|le\s+tocan|recibe)\b|how\s+many\s+each|cada\s+uno/i)?.[0] || 'cuántos';

            const highlights: { text: string; color: string }[] = [
                { text: match[1], color: 'blue' },
                { text: match[2], color: 'green' },
                { text: keyQuestion, color: 'red' },
            ];
            if (keyDiv) highlights.splice(2, 0, { text: keyDiv, color: 'orange' });

            // If it's a grouping problem, we might want to flag it, but for now 'divide_quantities' is the base type
            return { type: 'divide_quantities', n1, n2, unit, text: t, highlights };
        }
    }

    // MCD (Máximo Común Divisor): "repartir en cajas iguales", "el mayor número", "máxima cantidad"
    const mcdKeywords = /\b(?:repartir|dividir|distribuir|cajas|paquetes|grupos)\s+[^.]*?\b(?:iguales|misma\s+cantidad|mayor\s+número|m[aá]ximo|máxima|sin\s+sobre|no\s+sobre)\b/i;
    const isGeometryContext = /\b(?:rect[aá]ngulo|tri[aá]ngulo|c[ií]rculo|cuadrado|per[ií]metro|área|perimetro|area)\b/i.test(t);
    if (mcdKeywords.test(t) && !isGeometryContext) {
        const allNums = t.match(/(\d+)/g);
        if (allNums && allNums.length >= 2) {
            const n1 = parseInt(allNums[0], 10);
            const n2 = parseInt(allNums[1], 10);
            if (n1 > 0 && n2 > 0) {
                const highlights: { text: string; color: string }[] = [
                    { text: allNums[0], color: 'blue' },
                    { text: allNums[1], color: 'green' },
                    { text: t.match(/\b(?:mayor\s+número|m[aá]ximo|máxima|iguales|repartir)\b/i)?.[0] || 'repartir', color: 'red' }
                ];
                const unit = t.match(/\b(libros?|manzanas?|dulces?|objetos?|niños?|personas?|litros?|L|kg|kilogramos?)\b/i)?.[0] || 'unidades';
                return {
                    type: 'mcd_problem',
                    n1,
                    n2,
                    unit,
                    text: t,
                    highlights
                };
            }
        }
    }

    // Suma: "X kg ... y Y kg ... ¿cuántos kg (en total)?"
    const addKg = t.match(/(\d+(?:[.,]\d+)?)\s*kg\b[^.]*?\b(?:y|and)\b[^.]*?(\d+(?:[.,]\d+)?)\s*kg/i);
    if (addKg) {
        const n1 = parseNum(addKg[1]);
        const n2 = parseNum(addKg[2]);
        const hasTotal = /\b(?:en\s+)?total\b|cuántos?\s+kg|kilogramos?\s+(?:de\s+)?(?:fruta|en\s+total)/i.test(t);
        if (hasTotal && n1 > 0 && n2 > 0) {
            const s1 = addKg[1].replace(',', '.');
            const s2 = addKg[2].replace(',', '.');
            const totalPhrase = /\b(en\s+)?total\b/i.test(t) ? (t.match(/\b(en\s+)?total\b/i)?.[0] || 'en total') : 'cuántos kg';
            const highlights: { text: string; color: string }[] = [
                { text: s1 + ' kg', color: 'blue' },
                { text: s2 + ' kg', color: 'green' },
                { text: totalPhrase, color: 'red' },
            ];
            const keyAddKg = t.match(/\b(en\s+)?total\b|compr[oó]|más\b/i)?.[0];
            if (keyAddKg) highlights.splice(2, 0, { text: keyAddKg, color: 'orange' });
            return { type: 'add_quantities', n1, n2, unit: 'kg', text: t, highlights };
        }
    }

    // Multi-paso: "hay 1.260 libros, se prestan 378, llegan 245" o "tenía 50, compró 30, vendió 20" - tres números, dos operaciones
    const threeNums = t.match(/(-?\d+(?:[.,]\d+)?)[\s\S]*?(-?\d+(?:[.,]\d+)?)[\s\S]*?(-?\d+(?:[.,]\d+)?)/);
    if (threeNums && t.length > 45) {
        const n1 = parseNumMultiStep(threeNums[1]);
        const n2 = parseNumMultiStep(threeNums[2]);
        const n3 = parseNumMultiStep(threeNums[3]);
        const between1and2 = t.split(threeNums[1])[1]?.split(threeNums[2])[0] || '';
        const between2and3 = t.split(threeNums[2])[1]?.split(threeNums[3])[0] || '';
        const addRe = /compr[oóé]|añadi[oó]|agreg[oó]|recibi[oó]|sum[oó]|regalaron|llegaron|llegan|más|más\s+que|subi[oó]|aument[oó]|bought|added|received|got|more|up|increased/i;
        const subRe = /gast[oó]|vend[ií]|regal[oó]|perdi[oó]|prestan|prestaron|se\s+prestan|quitan|quedan|sobran|baj[oó]|descendi[oó]|disminuy[oó]|decreci[oó]|spent|sold|gave|lost|left|remain|down|decreased/i;
        const multRe = /cada\s+alumno|cada\s+uno|cada\s+una|cada\s+bus|cada\s+vehículo|por\s+cada|veces|times|each|per/i;
        const divRe = /repartir|dividir|reparten|distribuir|repartido|entre|en\s+grupos|en\s+buses|en\s+cajas|divide|share|distribute/i;

        const getOp = (s: string) => {
            if (divRe.test(s)) return '÷';
            if (multRe.test(s)) return '×';
            // Check subtract BEFORE add: "más" can appear in filler text ("litros más") 
            // even when the actual verb is a subtraction word like "Vendí"
            if (subRe.test(s)) return '-';
            if (addRe.test(s)) return '+';
            return null;
        };

        const op2 = getOp(between1and2);
        const op3 = getOp(between2and3);
        if (n1 > 0 && n2 > 0 && n3 > 0 && op2 && op3) {
            const calc = (a: number, b: number, op: string) => {
                if (op === '+') return a + b;
                if (op === '-') return a - b;
                if (op === '×') return a * b;
                if (op === '÷') return b !== 0 ? a / b : a;
                return a;
            };
            const mid = calc(n1, n2, op2);
            const res = calc(mid, n3, op3);
            if (res >= 0 && res < 1000000) {
                const unit = /\blibros?\b/i.test(t) ? 'libros' : /\bkg\b|kilogramos?/i.test(t) ? 'kg' : /\blitros?\b|L\b/i.test(t) ? 'litros' : /\bpesos?\b|dólares?|\$|money|dinero/i.test(t) ? 'dinero' : /\balumnos?|personas?|niños?/i.test(t) ? 'personas' : 'unidades';
                const highlights: { text: string; color: string }[] = [
                    { text: threeNums[1], color: 'blue' },
                    { text: threeNums[2], color: 'green' },
                    { text: threeNums[3], color: 'red' },
                ];
                const qPhrase = t.match(/\bcuántos?\s+hay\b|\bcuántos?\s+quedan\b|cuántos?\s+libros?\s+(?:hay|quedan)?/i)?.[0]?.trim();
                if (qPhrase) highlights.push({ text: qPhrase, color: 'red' });
                const match1 = between1and2.match(addRe) || between1and2.match(subRe);
                const match2 = between2and3.match(addRe) || between2and3.match(subRe);
                const keyword1 = match1 ? match1[0].trim() : undefined;
                const keyword2 = match2 ? match2[0].trim() : undefined;
                const idx2 = t.indexOf(threeNums[2]);
                const firstPartText = idx2 >= 0 ? t.substring(0, idx2 + threeNums[2].length).trim() : undefined;
                const secondPartText = idx2 >= 0 ? t.substring(idx2 + threeNums[2].length).trim() : undefined;
                return { type: 'multi_step', n1, n2, n3, op2, op3, unit, text: t, highlights, keyword1, keyword2, firstPartText, secondPartText };
            }
        }
    }

    // Suma: "X más que el año pasado. El año pasado Y. ¿Cuántos en total?" (típico Colombia)
    if (/\bmás\b.*\bpasado\b|\bpasado\b.*\b(total|dos\s+años)/i.test(t) && /\b(?:en\s+)?total\b|cuántos?|dos\s+años/i.test(t)) {
        const allNums = t.match(/(\d+(?:[.,]\d+)?)/g);
        if (allNums && allNums.length >= 2) {
            const n1 = parseNum(allNums[0]);
            const n2 = parseNum(allNums[1]);
            if (n1 > 0 && n2 > 0) {
                const unit = /\bkg\b|kilogramos?/i.test(t) ? 'kg' : /\blitros?\b|L\b/i.test(t) ? 'litros' : /\bpesos?\b|dólares?\b/i.test(t) ? 'pesos' : /\balmendrucos?\b|galletas?\b/i.test(t) ? (t.match(/\b(almendrucos?|galletas?)/i)?.[1] || 'unidades') : 'unidades';
                return {
                    type: 'add_quantities',
                    n1,
                    n2,
                    unit,
                    text: t,
                    highlights: [
                        { text: allNums[0], color: 'blue' },
                        { text: allNums[1], color: 'green' },
                        { text: t.match(/\b(en\s+)?total\b|dos\s+años|cuántos?/i)?.[0] || 'total', color: 'red' },
                    ],
                };
            }
        }
    }

    // Suma genérica: dos números y "total" / "cuántos" / "subió"
    const twoNums = t.match(/(-?\d+(?:[.,]\d+)?)\s*(?:kg|litros?|L|m|metros?|°C|grados)?[^.]*?(?:y|and|y|entonces|subió|aumentó|increased|up)\s*[^.]*?(-?\d+(?:[.,]\d+)?)\s*(?:kg|litros?|L|m|°C|grados)?/i);
    if (twoNums && /\b(?:en\s+)?total\b|cuántos?|how\s+many|final|resultado\b/i.test(t)) {
        if (/\d+\s*\/\s*\d+/.test(t) && /kil[oó]metro|km/i.test(t)) return null;
        const n1 = parseNum(twoNums[1]);
        const n2 = parseNum(twoNums[2]);
        if (n1 !== 0 || n2 !== 0) {
            const unit = /\bkg\b|kilogramos?/i.test(t) ? 'kg' : /\blitros?\b|L\b/i.test(t) ? 'litros' : /\b°C|grados\b/i.test(t) ? 'grados' : '';
            const keyAdd = t.match(/\b(en\s+)?total\b|compr[oó]|más\b|sumar|subi[oó]|aument[oó]|bought|added|plus\b/i)?.[0];
            const highlights: { text: string; color: string }[] = [
                { text: twoNums[1], color: 'blue' },
                { text: twoNums[2], color: 'green' },
                { text: (t.match(/\b(en\s+)?total\b/i)?.[0] || t.match(/cuántos?[^.?]*/i)?.[0] || t.match(/\bfinal\b/i)?.[0] || 'total')?.trim() || 'total', color: 'red' },
            ];
            if (keyAdd) highlights.splice(2, 0, { text: keyAdd.trim(), color: 'orange' });
            return { type: 'add_quantities', n1, n2, unit: unit || 'unidades', text: t, highlights };
        }
    }

    // REGLA DE TRES: "Si 2 libros cuestan 10, ¿cuánto cuestan 5?"
    if (t.length > 25 && (t.includes('si') || t.includes('if')) && (t.includes('cuestan') || t.includes('valen') || t.includes('cada') || t.includes('cost'))) {
        const allNums = t.match(/(-?\d+(?:[.,]\d+)?)/g);
        if (allNums && allNums.length >= 3) {
            const a1 = parseNum(allNums[0]);
            const b1 = parseNum(allNums[1]);
            const a2 = parseNum(allNums[2]);
            if (a1 > 0 && b1 !== 0 && a2 > 0) {
                // Tries to extract units
                const unitMatch = t.match(/(\d+(?:[.,]\d+)?)\s*([a-zA-ZñÑáéíóúÁÉÍÓÚ]+)/g);
                let unitA = 'unidades';
                let unitB = 'resultado';
                if (unitMatch && unitMatch.length >= 2) {
                    unitA = unitMatch[0].replace(/[\d\s\.,]+/g, '').trim() || 'unidades';
                    unitB = unitMatch[1].replace(/[\d\s\.,]+/g, '').trim() || 'resultado';
                }
                const highlights: { text: string; color: string }[] = [
                    { text: allNums[0], color: 'blue' },
                    { text: allNums[1], color: 'green' },
                    { text: allNums[2], color: 'orange' },
                ];
                return { type: 'proportion', a1, b1, a2, unitA, unitB, text: t, highlights };
            }
        }
    }

    return null;
}


