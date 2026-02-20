/**
 * Normaliza fracciones pegadas o mostradas con espacios que salen mal
 * (Unicode ¾→3/4, "3443"/"2552" sin barra, o "3 4 4 3"/"2 5 5 2" con espacios).
 */
export function normalizePastedFractions(text: string): string {
    let out = text
        .replace(/\u00BE/g, '3/4')   // ¾
        .replace(/\u2156/g, '2/5')   // ⅖
        .replace(/\u00BD/g, '1/2')   // ½
        .replace(/\u2153/g, '1/3')   // ⅓
        .replace(/\u00BC/g, '1/4');  // ¼
    // "3 4 4 3" o "2 5 5 2" con espacios (num den den num) antes de "de kilómetro"
    out = out.replace(/(\d)\s+(\d)\s+\2\s+\1(?=\s*de\s+kil[oó]metro)/gi, '$1/$2');
    // "3443" / "2552" sin espacios antes de "de kilómetro"
    out = out.replace(/(\d)(\d)\2\1(?=\s*de\s+kil[oó]metro)/gi, '$1/$2');
    // Por si quedó "3443" / "2552" o "3 4 4 3" / "2 5 5 2" sin contexto
    out = out.replace(/\b3443\b/g, '3/4').replace(/\b2552\b/g, '2/5');
    out = out.replace(/\b3\s+4\s+4\s+3\b/g, '3/4').replace(/\b2\s+5\s+5\s+2\b/g, '2/5');
    return out;
}
