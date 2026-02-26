-- ================================================================
-- 🚀 REPARACIÓN DE ECONOMÍA: TRIGGER DE BIENVENIDA Y RPC DUAL
-- ================================================================
-- Este script soluciona:
-- 1. El bono de 200 monedas que no se entrega al registrarse.
-- 2. El fallo al "mandar monedas" desde el padre al hijo.
-- 3. Asegura que la tabla economy siempre tenga el registro del usuario.
-- ================================================================

-- 1. Actualizar el trigger de nuevos usuarios para incluir Economía y Progreso
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Crear Perfil
  INSERT INTO public.profiles (id, name, role, email, account_status, level, grade_level, is_bilingual)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT'),
    NEW.email,
    'pending',
    COALESCE(NEW.raw_user_meta_data->>'level', 'primary'),
    COALESCE((NEW.raw_user_meta_data->>'grade_level')::integer, 3),
    COALESCE((NEW.raw_user_meta_data->>'is_bilingual')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, profiles.name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    role = COALESCE(EXCLUDED.role, profiles.role);

  -- INICIALIZAR ECONOMÍA (Bono de 200 monedas)
  INSERT INTO public.economy (user_id, coins, savings_balance, last_updated)
  VALUES (NEW.id, 200, 0, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  -- INICIALIZAR PROGRESO
  INSERT INTO public.learning_progress (user_id, total_xp, last_updated)
  VALUES (NEW.id, 0, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user trigger failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Asegurar que la función dual sea robusta y tenga permisos
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
  RETURN FALSE;
END;
$$;

-- 3. Asegurar permisos de ejecución para todos los roles
GRANT EXECUTE ON FUNCTION public.award_dual_coins_secure(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_dual_coins_secure(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.award_dual_coins_secure(UUID, INTEGER) TO anon;

-- 4. Reparar usuarios existentes que no tengan registro de economía
INSERT INTO public.economy (user_id, coins, savings_balance, last_updated)
SELECT id, 200, 0, NOW()
FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.economy)
AND role = 'STUDENT';

-- 5. Dar permisos de Realtime a economy (muy importante para ver los cambios sin refrescar)
ALTER PUBLICATION supabase_realtime ADD TABLE public.economy;
-- Ignorar si ya existe
