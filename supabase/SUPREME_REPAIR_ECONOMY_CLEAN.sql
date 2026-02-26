CREATE OR REPLACE FUNCTION public.award_dual_coins_secure(p_student_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.economy (user_id, coins, savings_balance, last_updated)
  VALUES (p_student_id, p_amount, p_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    coins = COALESCE(economy.coins, 0) + p_amount,
    savings_balance = COALESCE(economy.savings_balance, 0) + p_amount,
    last_updated = NOW();
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.award_xp_secure(p_student_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.learning_progress (user_id, total_xp, last_updated)
  VALUES (p_student_id, p_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = COALESCE(learning_progress.total_xp, 0) + p_amount,
    last_updated = NOW();
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.consign_to_bank(p_student_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.economy (user_id, coins, savings_balance, last_updated)
  VALUES (p_student_id, 0, p_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    savings_balance = COALESCE(economy.savings_balance, 0) + p_amount,
    last_updated = NOW();
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.award_coins_secure(p_student_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.economy (user_id, coins, last_updated)
  VALUES (p_student_id, p_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    coins = COALESCE(economy.coins, 0) + p_amount,
    last_updated = NOW();
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_dual_coins_secure(UUID, INTEGER) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.award_xp_secure(UUID, INTEGER) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.consign_to_bank(UUID, INTEGER) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.award_coins_secure(UUID, INTEGER) TO authenticated, anon, service_role;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE tablename = 'economy') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.economy;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE tablename = 'learning_progress') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_progress;
  END IF;
EXCEPTION WHEN OTHERS THEN 
  NULL;
END $$;
