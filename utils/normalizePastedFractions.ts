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
        .replace(/\u00BC/g, '1/4')   // ¼
        .replace(/\u2154/g, '2/3')   // ⅔
        .replace(/\u2151/g, '1/6')   // ⅙
        .replace(/\u215B/g, '1/8')   // ⅛
        .replace(/\u2152/g, '5/6');  // ⅚

    // 📚 MODO PDF/WORD: Fracciones verticales multinivel
    // Formato 1: Numerador \n Raya \n Denominador
    out = out.replace(/(\d+)\s*[\r\n]+\s*[-—_]+\s*[\r\n]+\s*(\d+)/g, ' $1/$2 ');

    // Formato 2: Numerador \n Denominador \n PalabraClave (Ej: "3 \n 5 \n del total")
    out = out.replace(/(\d+)\s*[\r\n]+\s*(\d+)\s+((?:de|del|los|las|juegan|pertenecen|al|total|que)\b)/gi, ' $1/$2 $3');

    // Formato 3: Viñeta Numerador \n Denominador (Ej: "• 3 \n 5")
    out = out.replace(/([•\-\*]\s*|^\s*)(\d+)\s*[\r\n]+\s*(\d+)\s+/gm, '$1$2/$3 ');

    // 🍕 GENERIC: "2 3 de pizza", "1 6 de pastel", "3 4 de km"
    // Detects (Number) (Space) (Number) followed by " de " or units
    out = out.replace(/(\d+)\s+(\d+)(?=\s*de\s+(?:una?|la|el|los|las|pizza|tarta|pastel|litro|kg|kil[oó]metro|torta|camino|recorrido|obra))/gi, '$1/$2');

    // "3 \n 4 \n 4 \n 3" o "2 \n 5 \n 5 \n 2" con espacios/saltos de línea intercalados
    // Este caso se da al copiar de ciertos PDFs interactivos
    out = out.replace(/(\d+)([\s\r\n\t]+)(\d+)([\s\r\n\t]+)\3([\s\r\n\t]+)\1/g, ' $1/$3 ');

    // "3443" / "2552" sin espacios antes de texto, solo dígitos 1-9 para que no afecte años como 1881
    out = out.replace(/\b([1-9])([1-9])\2\1\b/g, '$1/$2');

    return out;
}
