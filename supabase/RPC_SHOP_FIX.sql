
-- ================================================================
-- SOLUCIÓN TIENDA Y AVATAR (RPC SEGURAS)
-- Ejecuta esto para asegurar que las compras y el equipamiento funcionen
-- sin errores de permisos.
-- ================================================================

-- 1. Comprar Accesorio (Atómico: Descuenta monedas y guarda ítem al mismo tiempo)
CREATE OR REPLACE FUNCTION buy_accessory_secure(p_user_id UUID, p_item_id TEXT, p_cost INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coins INT;
  v_owned TEXT[];
BEGIN
  -- Verificar saldo
  SELECT coins INTO v_coins FROM economy WHERE user_id = p_user_id;
  
  IF v_coins IS NULL OR v_coins < p_cost THEN
    RETURN '{"success": false, "message": "Fondos insuficientes"}'::jsonb;
  END IF;

  -- Descontar monedas
  UPDATE economy SET coins = coins - p_cost, last_updated = NOW() WHERE user_id = p_user_id;

  -- Agregar ítem al inventario (evitando duplicados)
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

-- 2. Guardar Avatar Equipado (Directo, sin RLS)
CREATE OR REPLACE FUNCTION save_avatar_setup(p_user_id UUID, p_avatar_id TEXT, p_equipped JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles 
  SET avatar = p_avatar_id,
      equipped_accessories = p_equipped
  WHERE id = p_user_id;
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;
