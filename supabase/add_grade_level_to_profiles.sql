-- Migration: Add Grade Level to Profiles
-- Description: Adds a grade_level column to store student's primary school grade (1-5)

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS grade_level INTEGER DEFAULT 3 CHECK (grade_level >= 1 AND grade_level <= 5);

-- Update comment for documentation
COMMENT ON COLUMN profiles.grade_level IS 'Student primary school grade level (1-5)';

-- Sync existing student records if needed (optional, they will get the default 3)
-- UPDATE profiles SET grade_level = 3 WHERE role = 'STUDENT' AND grade_level IS NULL;
