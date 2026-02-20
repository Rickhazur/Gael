
-- 1. Profiles: Permitir que los padres vean a sus hijos
DROP POLICY IF EXISTS "Parents can view their children's profiles" ON profiles;
CREATE POLICY "Parents can view their children's profiles"
ON profiles FOR SELECT
USING (parent_id = auth.uid());

-- 2. Economy: Permitir que los padres vean la economía de sus hijos
DROP POLICY IF EXISTS "Parents can view their children's economy" ON economy;
CREATE POLICY "Parents can view their children's economy"
ON economy FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = economy.user_id
    AND profiles.parent_id = auth.uid()
  )
);

-- 3. Economy: Permitir que los padres actualicen (den monedas) a sus hijos
DROP POLICY IF EXISTS "Parents can update their children's economy" ON economy;
CREATE POLICY "Parents can update their children's economy"
ON economy FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = economy.user_id
    AND profiles.parent_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Parents can insert their children's economy" ON economy;
CREATE POLICY "Parents can insert their children's economy"
ON economy FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = economy.user_id
    AND profiles.parent_id = auth.uid()
  )
);

-- 4. Learning Progress: Permitir ver el progreso
DROP POLICY IF EXISTS "Parents can view their children's progress" ON learning_progress;
CREATE POLICY "Parents can view their children's progress"
ON learning_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = learning_progress.user_id
    AND profiles.parent_id = auth.uid()
  )
);

-- 5. Learning Progress: Permitir actualizar (dar XP) a sus hijos
DROP POLICY IF EXISTS "Parents can update their children's progress" ON learning_progress;
CREATE POLICY "Parents can update their children's progress"
ON learning_progress FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = learning_progress.user_id
    AND profiles.parent_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Parents can insert their children's progress" ON learning_progress;
CREATE POLICY "Parents can insert their children's progress"
ON learning_progress FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = learning_progress.user_id
    AND profiles.parent_id = auth.uid()
  )
);
