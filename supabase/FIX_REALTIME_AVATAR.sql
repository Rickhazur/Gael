
-- ================================================================
-- SOLUCIÓN FINAL: PERMISOS Y REALTIME PARA AVATARES
-- ================================================================

-- 1. Habilitar Realtime para la tabla 'profiles' (Crucial para que se vea en vivo)
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- 2. Asegurar Permisos de Lectura (SELECT)
-- Permitir que el usuario vea su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Permitir que los Padres vean el perfil de sus hijos
DROP POLICY IF EXISTS "Parents can view linked student profiles" ON profiles;
CREATE POLICY "Parents can view linked student profiles" 
ON profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM parent_student_link 
    WHERE parent_id = auth.uid() 
    AND student_id = profiles.id
  )
);

-- 3. Asegurar Permisos de Escritura (UPDATE) para el Usuario (Self)
-- Esto es necesario si el RPC falla y hacemos fallback, o para updates simples
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Re-aplicar funciones RPC seguras (por si acaso)
CREATE OR REPLACE FUNCTION buy_accessory_secure(p_user_id UUID, p_item_id TEXT, p_cost INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coins INT;
  v_owned TEXT[];
BEGIN
  SELECT coins INTO v_coins FROM economy WHERE user_id = p_user_id;
  IF v_coins IS NULL OR v_coins < p_cost THEN
    RETURN '{"success": false, "message": "Fondos insuficientes"}'::jsonb;
  END IF;
  UPDATE economy SET coins = coins - p_cost, last_updated = NOW() WHERE user_id = p_user_id;
  SELECT owned_accessories INTO v_owned FROM profiles WHERE id = p_user_id;
  IF v_owned IS NULL THEN 
    UPDATE profiles SET owned_accessories = ARRAY[p_item_id] WHERE id = p_user_id;
  ELSE
    IF NOT (p_item_id = ANY(v_owned)) THEN
        UPDATE profiles SET owned_accessories = array_append(owned_accessories, p_item_id) WHERE id = p_user_id;
    END IF;
  END IF;
  RETURN '{"success": true}'::jsonb;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
