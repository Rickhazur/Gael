import { useGamification as useGamificationContext } from '@/context/GamificationContext';

/**
 * Compatibility hook that redirects to GamificationContext.
 * This ensures all components use the same global, Supabase-backed state.
 */
export const useGamification = () => {
    return useGamificationContext();
};

export default useGamification;
