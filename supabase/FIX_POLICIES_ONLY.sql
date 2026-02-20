-- ================================================================
-- SOLUCIÓN FINAL (SOLO POLÍTICAS)
-- ================================================================
-- Nota: Omitimos "ALTER PUBLICATION" porque ya está activo.

-- 1. Permiso para que el ESTUDIANTE vea y guarde SU propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Permiso para que el PADRE vea el perfil de su hijo (CORREGIDO)
DROP POLICY IF EXISTS "Parents can view linked student profiles" ON profiles;
CREATE POLICY "Parents can view linked student profiles" 
ON profiles FOR SELECT 
USING (parent_id = auth.uid());
