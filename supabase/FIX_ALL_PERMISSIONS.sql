
-- ================================================================
-- REPARACIÓN INTEGRAL DE PERMISOS (RLS)
-- Ejecuta esto para arreglar:
-- 1. Avatares que no se guardan.
-- 2. Puntos/Monedas que no se guardan.
-- 3. Padres que no ven los datos de sus hijos.
-- ================================================================

-- Habilitar RLS en tablas clave (por seguridad)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 1. PERMISOS PARA EL PROPIO USUARIO (ESTUDIANTE/PADRE)
-- ================================================================

-- PROFILES: Ver y Editar su propio perfil (SOLUCIONA AVATAR)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ECONOMY: Ver su propia economía
DROP POLICY IF EXISTS "Users can view own economy" ON economy;
CREATE POLICY "Users can view own economy" ON economy FOR SELECT USING (auth.uid() = user_id);

-- LEARNING: Ver su propio progreso
DROP POLICY IF EXISTS "Users can view own progress" ON learning_progress;
CREATE POLICY "Users can view own progress" ON learning_progress FOR SELECT USING (auth.uid() = user_id);

-- ================================================================
-- 2. PERMISOS PARA PADRES (SOBRE SUS HIJOS)
-- ================================================================

-- Ver perfiles de sus hijos
DROP POLICY IF EXISTS "Parents can view children profiles" ON profiles;
CREATE POLICY "Parents can view children profiles" ON profiles FOR SELECT 
USING (parent_id = auth.uid());

-- ECONOMY: Ver y Dar Puntos a sus hijos (SOLUCIONA PUNTOS EN CERO)
DROP POLICY IF EXISTS "Parents can view children economy" ON economy;
CREATE POLICY "Parents can view children economy" ON economy FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = economy.user_id AND profiles.parent_id = auth.uid()));

DROP POLICY IF EXISTS "Parents can update children economy" ON economy;
CREATE POLICY "Parents can update children economy" ON economy FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = economy.user_id AND profiles.parent_id = auth.uid()));

DROP POLICY IF EXISTS "Parents can insert children economy" ON economy;
CREATE POLICY "Parents can insert children economy" ON economy FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = economy.user_id AND profiles.parent_id = auth.uid()));

-- PROGRESS: Ver y Dar XP a sus hijos
DROP POLICY IF EXISTS "Parents can view children progress" ON learning_progress;
CREATE POLICY "Parents can view children progress" ON learning_progress FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = learning_progress.user_id AND profiles.parent_id = auth.uid()));

DROP POLICY IF EXISTS "Parents can update children progress" ON learning_progress;
CREATE POLICY "Parents can update children progress" ON learning_progress FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = learning_progress.user_id AND profiles.parent_id = auth.uid()));

DROP POLICY IF EXISTS "Parents can insert children progress" ON learning_progress;
CREATE POLICY "Parents can insert children progress" ON learning_progress FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = learning_progress.user_id AND profiles.parent_id = auth.uid()));

-- ================================================================
-- 3. PERMISOS DE ADMIN (SI APLICA)
-- ================================================================
-- Permitir que usuarios con rol ADMIN hagan todo (Opcional, pero útil)
-- Nota: Esto asume que tienes una forma segura de identificar admins en la metadata o tabla
