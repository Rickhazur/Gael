-- Enable RLS on tables (just in case)
ALTER TABLE google_classroom_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_classroom_assignments ENABLE ROW LEVEL SECURITY;

-- 1. Policies for google_classroom_courses

-- Allow users to insert their own courses
DROP POLICY IF EXISTS "Users can insert their own courses" ON google_classroom_courses;
CREATE POLICY "Users can insert their own courses" 
ON google_classroom_courses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own courses
DROP POLICY IF EXISTS "Users can view their own courses" ON google_classroom_courses;
CREATE POLICY "Users can view their own courses" 
ON google_classroom_courses FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update their own courses
DROP POLICY IF EXISTS "Users can update their own courses" ON google_classroom_courses;
CREATE POLICY "Users can update their own courses" 
ON google_classroom_courses FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own courses
DROP POLICY IF EXISTS "Users can delete their own courses" ON google_classroom_courses;
CREATE POLICY "Users can delete their own courses" 
ON google_classroom_courses FOR DELETE 
USING (auth.uid() = user_id);


-- 2. Policies for google_classroom_assignments

-- Allow users to insert their own assignments
DROP POLICY IF EXISTS "Users can insert their own assignments" ON google_classroom_assignments;
CREATE POLICY "Users can insert their own assignments" 
ON google_classroom_assignments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own assignments
DROP POLICY IF EXISTS "Users can view their own assignments" ON google_classroom_assignments;
CREATE POLICY "Users can view their own assignments" 
ON google_classroom_assignments FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update their own assignments
DROP POLICY IF EXISTS "Users can update their own assignments" ON google_classroom_assignments;
CREATE POLICY "Users can update their own assignments" 
ON google_classroom_assignments FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own assignments
DROP POLICY IF EXISTS "Users can delete their own assignments" ON google_classroom_assignments;
CREATE POLICY "Users can delete their own assignments" 
ON google_classroom_assignments FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Fix profiles RLS just in case (optional but good practice)
-- Sometimes profile read fails and cascades
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);
