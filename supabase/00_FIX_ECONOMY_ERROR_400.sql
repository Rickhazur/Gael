-- ================================================================
-- 🚀 CREADOR DE LA TABLA ECONOMY (FIX DEFINITIVO ERROR 400)
-- ================================================================
-- 1. Ve a tu dashboard de Supabase (https://supabase.com/dashboard)
-- 2. Entra a tu proyecto (fwpnhxmktwvmsvrxbuat)
-- 3. Ve a la pestaña "SQL Editor" en el menú izquierdo.
-- 4. Dale a "New query".
-- 5. Copia todo este código, pégalo allí y dale al botón "RUN".
-- ================================================================

-- 1. CREAR LA TABLA PRINCIPAL DE ECONOMÍA
CREATE TABLE IF NOT EXISTS public.economy (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    coins INTEGER DEFAULT 0 NOT NULL,
    savings_balance INTEGER DEFAULT 0 NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ASEGURARNOS DE QUE EXISTAN LOS AHORROS SI LA TABLA YA EXISTÍA
ALTER TABLE public.economy
ADD COLUMN IF NOT EXISTS savings_balance INTEGER DEFAULT 0;

-- 3. HABILITAR LA SEGURIDAD (RLS)
ALTER TABLE public.economy ENABLE ROW LEVEL SECURITY;

-- 4. ASEGURAR LA COLUMNA PARENT_ID EN PROFILES (Para RLS de Padres)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS parent_id UUID;

-- 5. POLÍTICAS DE SEGURIDAD PARA ECONOMY
--  El estudiante puede ver, crear y actualizar la suya propia.
DROP POLICY IF EXISTS "Users can view own economy" ON public.economy;
CREATE POLICY "Users can view own economy" ON public.economy FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own economy" ON public.economy;
CREATE POLICY "Users can update own economy" ON public.economy FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own economy" ON public.economy;
CREATE POLICY "Users can insert own economy" ON public.economy FOR INSERT WITH CHECK (auth.uid() = user_id);

--  Admins pueden hacer todo
DROP POLICY IF EXISTS "Admin full access economy" ON public.economy;
CREATE POLICY "Admin full access economy" ON public.economy FOR ALL
USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.email = 'rickhazur@gmail.com'));

-- 6. HABILITAR EL TIEMPO REAL (Para actualizaciones del Padre -> Hijo instantáneas)
ALTER PUBLICATION supabase_realtime ADD TABLE public.economy;

-- 7. DAR PERMISOS DE USO DESDE LA APP
GRANT ALL ON public.economy TO authenticated;

-- 8. REPARAR LA VINCULACIÓN DE PADRE-HIJOS AUTOMÁTICA EN LA RECOMPENSA
CREATE OR REPLACE FUNCTION award_coins_secure(p_student_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO economy (user_id, coins, last_updated)
  VALUES (p_student_id, p_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    coins = economy.coins + p_amount,
    last_updated = NOW();
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;
