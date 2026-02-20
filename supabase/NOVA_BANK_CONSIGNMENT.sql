-- ================================================================
-- NOVA BANK: CONSIGNACIÓN DIRECTA PADRE → HIJO
-- ================================================================

-- 1. Agregar columna de ahorros a la tabla economy
ALTER TABLE public.economy
ADD COLUMN IF NOT EXISTS savings_balance INTEGER DEFAULT 0;

-- 2. Función segura para que el padre consigne directamente al banco
CREATE OR REPLACE FUNCTION public.consign_to_bank(p_student_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.economy (user_id, coins, savings_balance, last_updated)
    VALUES (p_student_id, 0, p_amount, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        savings_balance = economy.savings_balance + p_amount, 
        last_updated = NOW();
        
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in consign_to_bank: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- 3. Permisos de ejecución
GRANT EXECUTE ON FUNCTION public.consign_to_bank(UUID, INTEGER) TO postgres, anon, authenticated, service_role;

-- 4. Asegurar que economy esté en Realtime para que el hijo vea el depósito al instante
-- (Repetimos por si acaso, aunque ya debería estar)
ALTER PUBLICATION supabase_realtime ADD TABLE public.economy;
-- Ignora el error si ya existe en la publicación
