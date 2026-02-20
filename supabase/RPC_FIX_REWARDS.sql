
-- ================================================================
-- SOLUCIÓN FINAL: FUNCIONES SEGURAS (RPC)
-- Ejecuta este script para arreglar definitivamente el problema de permisos.
-- Esto crea funciones que se ejecutan como "Administrador", saltándose las reglas
-- confusas de RLS, pero verificando manualmente que seas Padre o Profe.
-- ================================================================

-- 1. Función Segura para Dar MONEDAS
CREATE OR REPLACE FUNCTION award_coins_secure(p_student_id UUID, p_amount INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- ¡Importante! Esto le da poderes de admin a la función
AS $$
DECLARE
  v_caller_id UUID;
  v_is_parent BOOLEAN;
  v_is_admin BOOLEAN;
  v_current_coins INT;
BEGIN
  v_caller_id := auth.uid();

  -- Verificar si quien llama es ADMIN
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = v_caller_id AND role = 'ADMIN') INTO v_is_admin;
  
  -- Verificar si quien llama es PADRE del estudiante
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = p_student_id AND parent_id = v_caller_id) INTO v_is_parent;

  -- Regla: Solo Admins o el Padre legítimo pueden dar monedas
  IF v_is_admin OR v_is_parent THEN
    
    -- Insertar o Actualizar (Atomic Increment)
    -- Primero intentamos leer para evitar duplicados raros, pero UPSERT es mejor
    
    -- Leemos saldo actual para asegurar (opcional, pero upsert maneja todo)
    -- Vamos directo al UPSERT con suma
    INSERT INTO economy (user_id, coins, last_updated)
    VALUES (p_student_id, p_amount, NOW()) -- Si es nuevo, empieza con el monto
    ON CONFLICT (user_id)
    DO UPDATE SET
      coins = economy.coins + p_amount, -- Si existe, se le suma
      last_updated = NOW();
    
    RETURN TRUE;
  ELSE
    -- Permiso denegado
    RETURN FALSE;
  END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 2. Función Segura para Dar XP (Experiencia)
CREATE OR REPLACE FUNCTION award_xp_secure(p_student_id UUID, p_amount INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_id UUID;
  v_is_parent BOOLEAN;
  v_is_admin BOOLEAN;
BEGIN
  v_caller_id := auth.uid();

  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = v_caller_id AND role = 'ADMIN') INTO v_is_admin;
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = p_student_id AND parent_id = v_caller_id) INTO v_is_parent;

  IF v_is_admin OR v_is_parent THEN
    INSERT INTO learning_progress (user_id, total_xp, last_updated)
    VALUES (p_student_id, p_amount, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      total_xp = learning_progress.total_xp + p_amount,
      last_updated = NOW();
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;
