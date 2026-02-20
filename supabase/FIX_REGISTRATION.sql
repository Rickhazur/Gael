-- ================================================================
-- ARREGLO DE REGISTRO / CREAR CUENTA
-- ================================================================
-- Si ves "AuthApiError: Database error saving new user" o
-- "No se pudo guardar la cuenta en la base de datos", ejecuta
-- ESTE ARCHIVO en Supabase:
--    Dashboard → SQL Editor → New query → pegar y Run
-- ================================================================

-- 1. Columna email en profiles (para notificaciones al activar cuenta)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;
COMMENT ON COLUMN public.profiles.email IS 'Email para notificaciones (ej. activación por admin).';

-- 2. Columna account_status si no existe (cuentas pendientes de activación)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending';

-- 3. Política para que el usuario recién registrado pueda INSERTAR su fila en profiles
--    (sin esto, el upsert falla con "new row violates row-level security policy")
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 4. Asegurar políticas de ver/actualizar propio perfil (por si faltan)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5. Trigger que crea cuadernos por defecto al registrar: debe usar SECURITY DEFINER
--    para que el INSERT en notebooks no falle por RLS (auth.uid() es NULL en el trigger).
CREATE OR REPLACE FUNCTION create_default_notebooks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO notebooks (student_id, title, subject, color, cover_emoji, description)
    VALUES (NEW.id, 'Matemáticas con Lina', 'math', '#8B5CF6', '📗', 'Mis apuntes de matemáticas');
    INSERT INTO notebooks (student_id, title, subject, color, cover_emoji, description)
    VALUES (NEW.id, 'English with Rachelle', 'english', '#3B82F6', '📘', 'My English notes');
    INSERT INTO notebooks (student_id, title, subject, color, cover_emoji, description)
    VALUES (NEW.id, 'Ciencias', 'science', '#10B981', '📙', 'Mis experimentos y descubrimientos');
    RETURN NEW;
EXCEPTION
    WHEN undefined_table THEN RETURN NEW;  -- Si notebooks no existe, no fallar el registro
    WHEN OTHERS THEN RETURN NEW;          -- Cualquier otro error no debe bloquear crear usuario
END;
$$;
DROP TRIGGER IF EXISTS create_default_notebooks_trigger ON auth.users;
CREATE TRIGGER create_default_notebooks_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notebooks();

-- Listo. Vuelve a intentar crear la cuenta desde la app.
