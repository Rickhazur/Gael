-- ================================================================
-- 🔧 FIX COMPLETO DEL SISTEMA NOVA SCHOLA
-- ================================================================
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query → Pegar y Run
-- ================================================================

-- ================================================================
-- PASO 1: COLUMNAS NECESARIAS EN PROFILES
-- ================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS guardian_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS parent_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_bilingual BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grade_level INTEGER DEFAULT 3;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'primary';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar TEXT;

-- ================================================================
-- PASO 2: HABILITAR RLS
-- ================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN ALTER TABLE public.economy ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ================================================================
-- PASO 3: LIMPIAR POLÍTICAS EXISTENTES
-- ================================================================

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Parents can view children profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow service role full access" ON public.profiles;

-- Economy (con protección si no existe la tabla)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own economy" ON public.economy;
  DROP POLICY IF EXISTS "Users can update own economy" ON public.economy;
  DROP POLICY IF EXISTS "Users can insert own economy" ON public.economy;
  DROP POLICY IF EXISTS "Parents can view children economy" ON public.economy;
  DROP POLICY IF EXISTS "Parents can update children economy" ON public.economy;
  DROP POLICY IF EXISTS "Parents can insert children economy" ON public.economy;
  DROP POLICY IF EXISTS "Universal Access Economy" ON public.economy;
  DROP POLICY IF EXISTS "Admin full access economy" ON public.economy;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Learning Progress (con protección si no existe la tabla)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own progress" ON public.learning_progress;
  DROP POLICY IF EXISTS "Users can update own progress" ON public.learning_progress;
  DROP POLICY IF EXISTS "Users can insert own progress" ON public.learning_progress;
  DROP POLICY IF EXISTS "Parents can view children progress" ON public.learning_progress;
  DROP POLICY IF EXISTS "Parents can update children progress" ON public.learning_progress;
  DROP POLICY IF EXISTS "Parents can insert children progress" ON public.learning_progress;
  DROP POLICY IF EXISTS "Universal Access Progress" ON public.learning_progress;
  DROP POLICY IF EXISTS "Admin full access learning" ON public.learning_progress;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ================================================================
-- PASO 4: POLÍTICAS — PROFILES
-- ================================================================

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Parents can view children profiles"
  ON public.profiles FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Admin full access profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users AS u
      WHERE u.id = auth.uid() AND u.email = 'rickhazur@gmail.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users AS u
      WHERE u.id = auth.uid() AND u.email = 'rickhazur@gmail.com'
    )
  );

-- ================================================================
-- PASO 5: POLÍTICAS — ECONOMY (si existe la tabla)
-- ================================================================

DO $$ BEGIN
  CREATE POLICY "Users can view own economy"
    ON public.economy FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can update own economy"
    ON public.economy FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own economy"
    ON public.economy FOR INSERT WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Parents can view children economy"
    ON public.economy FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = economy.user_id AND profiles.parent_id = auth.uid()));
  CREATE POLICY "Parents can update children economy"
    ON public.economy FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = economy.user_id AND profiles.parent_id = auth.uid()));
  CREATE POLICY "Parents can insert children economy"
    ON public.economy FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = economy.user_id AND profiles.parent_id = auth.uid()));

  CREATE POLICY "Admin full access economy"
    ON public.economy FOR ALL
    USING (
      EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
      OR EXISTS (SELECT 1 FROM auth.users AS u WHERE u.id = auth.uid() AND u.email = 'rickhazur@gmail.com')
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
      OR EXISTS (SELECT 1 FROM auth.users AS u WHERE u.id = auth.uid() AND u.email = 'rickhazur@gmail.com')
    );
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Tabla economy no existe, skipping policies';
END $$;

-- ================================================================
-- PASO 6: POLÍTICAS — LEARNING PROGRESS (si existe la tabla)
-- ================================================================

DO $$ BEGIN
  CREATE POLICY "Users can view own progress"
    ON public.learning_progress FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can update own progress"
    ON public.learning_progress FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own progress"
    ON public.learning_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Parents can view children progress"
    ON public.learning_progress FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = learning_progress.user_id AND profiles.parent_id = auth.uid()));
  CREATE POLICY "Parents can update children progress"
    ON public.learning_progress FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = learning_progress.user_id AND profiles.parent_id = auth.uid()));
  CREATE POLICY "Parents can insert children progress"
    ON public.learning_progress FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = learning_progress.user_id AND profiles.parent_id = auth.uid()));

  CREATE POLICY "Admin full access learning"
    ON public.learning_progress FOR ALL
    USING (
      EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
      OR EXISTS (SELECT 1 FROM auth.users AS u WHERE u.id = auth.uid() AND u.email = 'rickhazur@gmail.com')
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
      OR EXISTS (SELECT 1 FROM auth.users AS u WHERE u.id = auth.uid() AND u.email = 'rickhazur@gmail.com')
    );
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Tabla learning_progress no existe, skipping policies';
END $$;

-- ================================================================
-- PASO 7: TRIGGER handle_new_user
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user trigger failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- PASO 8: TRIGGER cuadernos por defecto
-- ================================================================

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
    WHEN undefined_table THEN RETURN NEW;
    WHEN OTHERS THEN RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_default_notebooks_trigger ON auth.users;
CREATE TRIGGER create_default_notebooks_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notebooks();

-- ================================================================
-- PASO 9: PERFIL ADMIN
-- ================================================================

INSERT INTO public.profiles (id, name, role, email, account_status, level)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', 'Admin'),
  'ADMIN',
  u.email,
  'active',
  'TEEN'
FROM auth.users u
WHERE u.email = 'rickhazur@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'ADMIN',
  account_status = 'active';

-- ================================================================
-- PASO 10: ELIMINAR FUNCIONES ANTIGUAS (todas las sobrecargas)
-- ================================================================

DO $$ BEGIN DROP FUNCTION IF EXISTS public.link_student_to_parent(UUID, UUID); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS public.get_user_id_by_email(TEXT); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS public.link_student_by_email(TEXT, UUID); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS public.award_coins_secure(UUID, INTEGER); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS public.award_xp_secure(UUID, INTEGER); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS public.consign_to_bank(UUID, INTEGER); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ================================================================
-- PASO 11: CREAR RPCs LIMPIAS
-- ================================================================

-- link_student_to_parent → retorna BOOLEAN (como el original)
CREATE FUNCTION link_student_to_parent(student_id_param UUID, parent_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles SET parent_id = parent_id_param WHERE id = student_id_param;
  RETURN FOUND;
END;
$$;

-- get_user_id_by_email
CREATE FUNCTION get_user_id_by_email(email_input TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  found_id UUID;
BEGIN
  SELECT id INTO found_id FROM auth.users WHERE email = email_input;
  RETURN found_id;
END;
$$;

-- link_student_by_email
CREATE FUNCTION link_student_by_email(student_email_param TEXT, parent_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID;
BEGIN
  SELECT u.id INTO v_student_id FROM auth.users u WHERE LOWER(u.email) = LOWER(student_email_param);
  IF v_student_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Estudiante no encontrado con ese correo.');
  END IF;
  UPDATE profiles SET parent_id = parent_id_param WHERE id = v_student_id;
  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'message', 'Vinculación exitosa.');
  ELSE
    RETURN jsonb_build_object('success', false, 'message', 'Perfil del estudiante no encontrado.');
  END IF;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', 'Error interno: ' || SQLERRM);
END;
$$;

-- award_coins_secure
CREATE FUNCTION award_coins_secure(p_student_id UUID, p_amount INTEGER)
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
  RAISE WARNING 'award_coins_secure failed: %', SQLERRM;
  RETURN FALSE;
END;
$$;

-- award_xp_secure
CREATE FUNCTION award_xp_secure(p_student_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO learning_progress (user_id, total_xp, last_updated)
  VALUES (p_student_id, p_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = learning_progress.total_xp + p_amount,
    last_updated = NOW();
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'award_xp_secure failed: %', SQLERRM;
  RETURN FALSE;
END;
$$;

-- consign_to_bank
CREATE FUNCTION consign_to_bank(p_student_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE economy
  SET savings_balance = COALESCE(savings_balance, 0) + p_amount,
      last_updated = NOW()
  WHERE user_id = p_student_id;
  RETURN FOUND;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;

-- ================================================================
-- PASO 12: GRANTS
-- ================================================================

GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.profiles TO anon;

DO $$ BEGIN GRANT ALL ON public.economy TO authenticated; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON public.learning_progress TO authenticated; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ================================================================
-- ✅ VERIFICACIÓN
-- ================================================================

SELECT 'Sistema reparado exitosamente ✅' AS resultado;

SELECT id, name, role, account_status, email
FROM public.profiles
WHERE role = 'ADMIN' OR email = 'rickhazur@gmail.com';
