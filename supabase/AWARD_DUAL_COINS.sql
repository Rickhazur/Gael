-- ================================================================
-- NOVA: PREMIO DUAL (EFECTIVO + BANCO)
-- ================================================================
-- Esta función asegura que el premio llegue a ambos lados en una sola transacción
-- evitando problemas de sincronización.

CREATE OR REPLACE FUNCTION public.award_dual_coins_secure(p_student_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insertamos o actualizamos sumando a ambos balances
  INSERT INTO public.economy (user_id, coins, savings_balance, last_updated)
  VALUES (p_student_id, p_amount, p_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    coins = economy.coins + p_amount,
    savings_balance = economy.savings_balance + p_amount,
    last_updated = NOW();
    
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  -- En caso de error, retornamos falso para que el frontend intente el fallback
  RETURN FALSE;
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION public.award_dual_coins_secure(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_dual_coins_secure(UUID, INTEGER) TO service_role;
