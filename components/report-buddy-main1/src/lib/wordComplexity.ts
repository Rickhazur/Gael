export const COMMON_SAFE_WORDS = {
    es: ['elefante', 'dinosaurio', 'mariposa', 'computadora', 'biblioteca', 'importante', 'interesante', 'diferente', 'hipopotamo', 'vacaciones', 'chocolate', 'imaginacion'],
    en: ['elephant', 'dinosaur', 'butterfly', 'computer', 'library', 'important', 'interesting', 'different', 'hippopotamus', 'vacation', 'chocolate', 'imagination']
};

export const COMPLEX_SUFFIXES = {
    es: ['mente', 'dad', 'cion', 'sión', 'logía', 'grafía', 'miento'],
    en: ['ment', 'tion', 'sion', 'ology', 'graphy', 'ness', 'istically']
};

export function findComplexWord(text: string, language: 'es' | 'en'): string | null {
    const words = text.toLowerCase().replace(/[.,!?;()]/g, '').split(/\s+/);

    // Heuristic: Length > 9 (Spanish tends to be longer) or 8 (English)
    const lengthThreshold = language === 'es' ? 10 : 9;

    const complexWord = words.find(word => {
        if (word.length < lengthThreshold) return false;

        // Check allowlist
        if (COMMON_SAFE_WORDS[language].includes(word)) return false;

        // Check endings (suffixes often indicate abstract nouns/adverbs)
        const hasComplexSuffix = COMPLEX_SUFFIXES[language].some(suffix => word.endsWith(suffix));

        // If it's very long OR has a complex suffix, flag it
        return word.length > 13 || hasComplexSuffix;
    });

    return complexWord || null;
}
