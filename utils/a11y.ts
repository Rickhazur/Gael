// A11y utility functions for Nova Schola

/**
 * Announces a message to screen readers
 * @param message - The message to announce
 * @param priority - 'polite' (default) or 'assertive'
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (typeof document === 'undefined') return;

    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement is made
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
};

/**
 * Create or get a live region for announcements
 */
export const getLiveRegion = () => {
    if (typeof document === 'undefined') return null;

    let region = document.getElementById('nova-live-region');

    if (!region) {
        region = document.createElement('div');
        region.id = 'nova-live-region';
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        region.className = 'sr-only';
        document.body.appendChild(region);
    }

    return region;
};

/**
 * Announce navigational changes
 */
export const announceNavigation = (destination: string) => {
    announceToScreenReader(`Navegando a ${destination}`, 'polite');
};

/**
 * Announce student achievement
 */
export const announceAchievement = (achievement: string) => {
    announceToScreenReader(`¡Logro desbloqueado! ${achievement}`, 'assertive');
};

/**
 * Announce errors
 */
export const announceError = (error: string) => {
    announceToScreenReader(`Error: ${error}`, 'assertive');
};

/**
 * Announce loading states
 */
export const announceLoading = (isLoading: boolean, context: string) => {
    const message = isLoading ? `Cargando ${context}...` : `${context} cargado`;
    announceToScreenReader(message, 'polite');
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get accessible label for grade level
 */
export const getGradeLabel = (grade: number, lang: 'es' | 'en'): string => {
    if (lang === 'es') {
        return `Grado ${grade}`;
    }
    return `Grade ${grade}`;
};

/**
 * Generate ARIA label for score/progress
 */
export const getScoreLabel = (score: number, total: number, lang: 'es' | 'en'): string => {
    const percentage = Math.round((score / total) * 100);
    if (lang === 'es') {
        return `Puntuación: ${score} de ${total}, ${percentage} por ciento`;
    }
    return `Score: ${score} out of ${total}, ${percentage} percent`;
};
