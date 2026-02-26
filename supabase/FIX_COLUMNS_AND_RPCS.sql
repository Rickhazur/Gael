-- 1. ASEGURAR COLUMNAS EN ECONOMY
DO $$ 
BEGIN 
  ALTER TABLE public.economy ADD COLUMN IF NOT EXISTS savings_balance INTEGER DEFAULT 0;
  ALTER TABLE public.economy ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN OTHERS THEN 
  CREATE TABLE IF NOT EXISTS public.economy (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    coins INTEGER DEFAULT 0,
    savings_balance INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END $$;

-- 2. ASEGURAR COLUMNAS EN LEARNING_PROGRESS
DO $$ 
BEGIN 
  ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN OTHERS THEN 
  CREATE TABLE IF NOT EXISTS public.learning_progress (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    quests_by_category JSONB DEFAULT '{"math":0,"science":0,"language":0}',
    total_quests_completed INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END $$;

-- 3. RECOMPENSA DUAL (EFECTIVO + BANCO)
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

-- 4. RECOMPENSA DE EXPERIENCIA (XP)
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

-- 5. CONSIGNAR AL BANCO
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

-- 6. PERMISOS
GRANT EXECUTE ON FUNCTION public.award_dual_coins_secure(UUID, INTEGER) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.award_xp_secure(UUID, INTEGER) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.consign_to_bank(UUID, INTEGER) TO authenticated, anon, service_role;
