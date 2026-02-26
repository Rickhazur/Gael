-- ================================================================
-- 🔧 REPARACIÓN DEFINITIVA: PREMIO DUAL (EFECTIVO + BANCO)
-- ================================================================
-- Esta función asegura que el premio llegue a ambos lados en una sola transacción
-- Maneja casos donde la fila no existe y asegura que no haya nulos.
-- ================================================================

CREATE OR REPLACE FUNCTION public.award_dual_coins_secure(p_student_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Asegurar que el estudiante existe en la tabla profiles (opcional pero recomendado)
  -- Perform an UPSERT on economy
  INSERT INTO public.economy (user_id, coins, savings_balance, last_updated)
  VALUES (p_student_id, p_amount, p_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    coins = COALESCE(economy.coins, 0) + p_amount,
    savings_balance = COALESCE(economy.savings_balance, 0) + p_amount,
    last_updated = NOW();
    
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  -- Log error in postgres log (visible in Supabase)
  RAISE WARNING 'Error en award_dual_coins_secure para %: %', p_student_id, SQLERRM;
  RETURN FALSE;
END;
$$;

-- Permisos necesarios
GRANT EXECUTE ON FUNCTION public.award_dual_coins_secure(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_dual_coins_secure(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.award_dual_coins_secure(UUID, INTEGER) TO anon;

-- Asegurar que la tabla economy esté en realtime
DO $$ 
BEGIN 
  ALTER PUBLICATION supabase_realtime ADD TABLE public.economy;
EXCEPTION 
  WHEN OTHERS THEN -- Probablemente ya existe en la publicación
    NULL;
END $$;

-- Asegurar políticas de RLS para el padre (fallback directo)
-- Permitir que un padre actualice la economía de sus hijos vinculados
DROP POLICY IF EXISTS "Parents can UPDATE children economy" ON public.economy;
CREATE POLICY "Parents can UPDATE children economy" ON public.economy
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = economy.user_id
    AND profiles.parent_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Parents can SELECT children economy" ON public.economy;
CREATE POLICY "Parents can SELECT children economy" ON public.economy
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = economy.user_id
    AND profiles.parent_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Parents can INSERT children economy" ON public.economy;
CREATE POLICY "Parents can INSERT children economy" ON public.economy
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = public.economy.user_id
    AND profiles.parent_id = auth.uid()
  )
);
