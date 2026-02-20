-- =====================================================
-- SCRIPT 1: LIMPIAR Y CREAR TABLAS DEMO
-- =====================================================
-- Este script elimina las tablas existentes y las crea de nuevo
-- Ejecuta SOLO este script primero
-- =====================================================

-- PASO 1: Eliminar tablas existentes (si existen)
DROP TABLE IF EXISTS learning_progress CASCADE;
DROP TABLE IF EXISTS google_classroom_assignments CASCADE;
DROP TABLE IF EXISTS unlocked_badges CASCADE;
DROP TABLE IF EXISTS quest_completions CASCADE;
DROP TABLE IF EXISTS student_avatars CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;

-- PASO 2: Crear tablas nuevas

-- Tabla: student_profiles
CREATE TABLE student_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade_level INTEGER NOT NULL DEFAULT 3,
    total_xp INTEGER NOT NULL DEFAULT 0,
    total_coins INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON student_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON student_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tabla: student_avatars
CREATE TABLE student_avatars (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    avatar_id TEXT NOT NULL DEFAULT 'boy_default',
    equipped_accessories JSONB DEFAULT '{}',
    owned_accessories JSONB DEFAULT '[]',
    accessory_offsets JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE student_avatars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own avatar" ON student_avatars FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own avatar" ON student_avatars FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own avatar" ON student_avatars FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tabla: quest_completions
CREATE TABLE quest_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quest_id TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    coins_earned INTEGER NOT NULL DEFAULT 0,
    was_correct BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, quest_id)
);

ALTER TABLE quest_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions" ON quest_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON quest_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_quest_completions_user_id ON quest_completions(user_id);
CREATE INDEX idx_quest_completions_completed_at ON quest_completions(completed_at DESC);

-- Tabla: unlocked_badges
CREATE TABLE unlocked_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

ALTER TABLE unlocked_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON unlocked_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON unlocked_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_unlocked_badges_user_id ON unlocked_badges(user_id);

-- Tabla: google_classroom_assignments
CREATE TABLE google_classroom_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    google_assignment_id TEXT NOT NULL UNIQUE,
    course_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    state TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE google_classroom_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assignments" ON google_classroom_assignments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assignments" ON google_classroom_assignments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assignments" ON google_classroom_assignments FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_google_assignments_user_id ON google_classroom_assignments(user_id);
CREATE INDEX idx_google_assignments_due_date ON google_classroom_assignments(due_date);

-- Tabla: learning_progress
CREATE TABLE learning_progress (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_quests_completed INTEGER NOT NULL DEFAULT 0,
    total_xp INTEGER NOT NULL DEFAULT 0,
    total_coins INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    accuracy_rate INTEGER NOT NULL DEFAULT 0,
    quests_by_category JSONB DEFAULT '{}',
    unlocked_badges JSONB DEFAULT '[]',
    unlocked_trophies JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON learning_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON learning_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON learning_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Listar todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'student_profiles',
    'student_avatars',
    'quest_completions',
    'unlocked_badges',
    'google_classroom_assignments',
    'learning_progress'
)
ORDER BY table_name;

-- =====================================================
-- ÉXITO
-- =====================================================
-- Si ves las 6 tablas listadas arriba, el script funcionó correctamente.
-- Ahora puedes ejecutar el Script 2 (CREATE_DEMO_USER.sql)
-- =====================================================
