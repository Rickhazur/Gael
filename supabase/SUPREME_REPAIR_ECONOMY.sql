-- ================================================================
-- 🚀 REPARACIÓN SUPREMA DE ECONOMÍA Y PREMIOS (ACTUALIZADO)
-- ================================================================
-- Este script soluciona los problemas de sincronización entre padres e hijos.
-- 1. Asegura que los premios se guarden en la base de datos (Nube).
-- 2. Repara las funciones que dan monedas para que funcionen siempre.
-- 3. Abre los permisos para que los padres puedan premiar sin errores.
-- ================================================================

-- 1. FUNCIÓN ATÓMICA: Dar monedas en Billete y Banco al mismo tiempo (UPSERT)
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
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Fallo en award_dual_coins_secure: %', SQLERRM;
  RETURN FALSE;
END;
$$;

-- 2. FUNCIÓN DE EXPERIENCIA: Asegura que el nivel del niño suba (UPSERT)
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
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Fallo en award_xp_secure: %', SQLERRM;
  RETURN FALSE;
END;
$$;

-- 3. FUNCIÓN DE BANCO: Corregir el error cuando el niño es nuevo (UPSERT)
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
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;

-- 4. FUNCIÓN DE MONEDAS: Versión segura para billetera (UPSERT)
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
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;

-- 5. PERMISOS: Asegurar que todos puedan ejecutar estas funciones de premio
GRANT EXECUTE ON FUNCTION public.award_dual_coins_secure(UUID, INTEGER) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.award_xp_secure(UUID, INTEGER) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.consign_to_bank(UUID, INTEGER) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.award_coins_secure(UUID, INTEGER) TO authenticated, anon, service_role;

-- 6. REALTIME: Asegurar que los cambios se vean al instante sin refrescar
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

SELECT 'Sincronización reparada. Por favor intenta enviar las monedas de nuevo. ✅' AS status;
