
// Utility to convert numbers to Spanish words for perfect TTS pronunciation
// Handles integers, decimals, and basic fractions if passed as text

const UNITS = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const TEENS = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
const TENS = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const HUNDREDS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

function convertGroup(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'cien';

    let str = '';

    // Hundreds
    if (n >= 100) {
        str += HUNDREDS[Math.floor(n / 100)] + ' ';
        n %= 100;
    }

    // Tens and Units
    if (n >= 10 && n <= 19) {
        str += TEENS[n - 10];
    } else if (n >= 20) {
        if (n >= 21 && n <= 29) {
            str += 'veinti' + UNITS[n % 10];
            if (n === 21) str = 'veintiún'; // Optional: "veintiuno" is also fine, "veintiún" before masculine nouns. Keep "veintiuno" for isolation.
            if (n === 21) str = 'veintiuno';
        } else {
            str += TENS[Math.floor(n / 10)];
            if (n % 10 !== 0) {
                str += ' y ' + UNITS[n % 10];
            }
        }
    } else if (n > 0) {
        str += UNITS[n];
    }

    return str.trim();
}

export function numberToSpanish(n: number): string {
    if (n === 0) return 'cero';
    if (n < 0) return 'menos ' + numberToSpanish(-n);

    // Handle Decimals
    if (!Number.isInteger(n)) {
        const parts = n.toString().split('.');
        return numberToSpanish(parseInt(parts[0])) + ' punto ' + parts[1].split('').map(d => numberToSpanish(parseInt(d))).join(' ');
    }

    let str = '';

    // Millions
    if (n >= 1000000) {
        const millions = Math.floor(n / 1000000);
        if (millions === 1) str += 'un millón ';
        else str += numberToSpanish(millions) + ' millones ';
        n %= 1000000;
    }

    // Thousands
    if (n >= 1000) {
        const thousands = Math.floor(n / 1000);
        if (thousands === 1) str += 'mil ';
        else str += convertGroup(thousands) + ' mil ';
        n %= 1000;
    }

    // Previous logic had a recursion issue here if I used numberToSpanish for thousands > 999 (e.g. 500,000)
    // convertGroup handles up to 999.
    // If thousands > 999, convertGroup fails.
    // Actually, typical use case for Elem Math is < 1,000,000. 
    // If thousands part is > 999 (e.g. 500,000,000), we need recursion.
    // But for safety within < 100 Million:

    // Remaining < 1000
    str += convertGroup(n);

    return str.trim();
}

export function preprocessTextForSpeech(text: string, language: 'es' | 'en'): string {
    if (language !== 'es') return text; // English usually handles numbers well

    // 1. Replace mathematical symbols
    let processed = text
        .replace(/\+/g, " más ")
        .replace(/\-/g, " menos ")
        .replace(/\*/g, " por ")
        .replace(/\//g, " entre ") // Be careful with dates 1/2/2023, but usually okay in math context
        .replace(/\=/g, " es igual a ");

    // 2. Find numbers and convert to words

    // SMART FIX: Remove dots from thousands (e.g. 1.234 -> 1234) to prevent decimal parsing.
    processed = processed.replace(/\b(\d{1,3}(?:\.\d{3})+)\b/g, (m) => m.replace(/\./g, ''));

    // Match numbers like "1345", "10", "3.5"
    // Look for isolated numbers or numbers followed by punctuation
    processed = processed.replace(/\b\d+(\.\d+)?\b/g, (match) => {
        // Avoid converting if it looks like a year? No, usually in math tutor we want full read.
        // Exception: Dont convert if it's part of a known ID or something, but usually fine.
        const num = parseFloat(match);
        if (!isNaN(num)) {
            // Check specifically for "un" vs "uno"
            // "Uno" is default, but "un" is used before nouns.
            // TTS is forgiving. 'Uno' is safer for pure numbers.
            return numberToSpanish(num);
        }
        return match;
    });

    return processed;
}
