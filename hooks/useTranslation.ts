
import { es } from '@/locales/es';
import { en } from '@/locales/en';

export const useTranslation = (lang: 'es' | 'en') => {
    return lang === 'es' ? es : en;
};
