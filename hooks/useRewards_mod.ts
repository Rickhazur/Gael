import { useCallback } from 'react';
import { useGamification } from '@/context/GamificationContext';
import {
  calculateGameScore
} from '@/lib/rewards_mod';

/**
 * useRewards Hook - Refactored to use Global Gamification State
 * This ensures coins earned in English Tutor persist across the entire app and Supabase.
 */
export const useRewards = () => {
  const { coins: balance, addCoins: globalAddCoins, spendCoins: globalSpendCoins } = useGamification();

  // Refresh balance (now handled by global context, but kept for compatibility)
  const refreshBalance = useCallback(() => {
    // Global context handles this automatically via Supabase/Realtime
  }, []);

  // Add coins after game completion
  const addCoins = useCallback(async (
    coins: number,
    gameId: string
  ): Promise<{ success: boolean; coinsAdded: number; message?: string }> => {
    try {
      if (coins > 0) {
        globalAddCoins(coins, `English Game: ${gameId}`);
      }
      return {
        success: true,
        coinsAdded: coins,
      };
    } catch (err) {
      console.error("Reward error:", err);
      return { success: false, coinsAdded: 0, message: "Error adding coins" };
    }
  }, [globalAddCoins]);

  // Spend coins on store items
  const purchaseItem = useCallback(async (
    amount: number,
    itemId: string
  ): Promise<{ success: boolean; message?: string }> => {
    const success = globalSpendCoins(amount, `Nova Store: ${itemId}`, true); // Sync to DB
    return {
      success,
      message: success ? undefined : 'Saldo insuficiente o error en la compra',
    };
  }, [globalSpendCoins]);

  // Calculate and add score from game
  const completeGame = useCallback(async (
    gameId: string,
    correctAnswers: number,
    totalQuestions: number,
    options?: {
      timeBonus?: boolean;
      streak?: number;
      usedHints?: boolean;
    }
  ) => {
    const scoreResult = calculateGameScore(
      correctAnswers,
      totalQuestions,
      options?.timeBonus,
      options?.streak,
      options?.usedHints
    );

    // Max coins per game safety (similar to lib/rewards_mod)
    const cappedCoins = Math.min(scoreResult.coins, 100);
    const creditResult = await addCoins(cappedCoins, gameId);

    return {
      ...scoreResult,
      credited: creditResult.success,
      actualCoinsAdded: creditResult.coinsAdded,
      message: creditResult.message,
    };
  }, [addCoins]);

  return {
    balance,
    totalEarned: balance, // Simplified mapping
    isLoading: false,
    refreshBalance,
    addCoins,
    purchaseItem,
    completeGame,
  };
};

export default useRewards;
