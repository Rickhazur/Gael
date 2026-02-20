-- POLICY FIX: ALLOW PARENTS TO VIEW AND MANAGE THEIR STUDENTS' DATA
-- This acts as a robust fallback if RPCs fail, allowing direct frontend updates.

-- 1. Enable RLS on main tables (just in case)
ALTER TABLE public.economy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_classroom_assignments ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Parents can UPDATE Economy for their Linked Students
DROP POLICY IF EXISTS "Parents can update student economy" ON public.economy;
CREATE POLICY "Parents can update student economy"
ON public.economy
FOR UPDATE
USING (
    user_id IN (
        SELECT id FROM public.profiles 
        WHERE parent_id = auth.uid()
    )
);

-- 3. Policy: Parents can INSERT Economy (if missing)
DROP POLICY IF EXISTS "Parents can insert student economy" ON public.economy;
CREATE POLICY "Parents can insert student economy"
ON public.economy
FOR INSERT
WITH CHECK (
    user_id IN (
        SELECT id FROM public.profiles 
        WHERE parent_id = auth.uid()
    )
);

-- 4. Policy: Parents can UPDATE Learning Progress
DROP POLICY IF EXISTS "Parents can update student progress" ON public.learning_progress;
CREATE POLICY "Parents can update student progress"
ON public.learning_progress
FOR UPDATE
USING (
    user_id IN (
        SELECT id FROM public.profiles 
        WHERE parent_id = auth.uid()
    )
);

-- 5. Policy: Parents can INSERT Learning Progress
DROP POLICY IF EXISTS "Parents can insert student progress" ON public.learning_progress;
CREATE POLICY "Parents can insert student progress"
ON public.learning_progress
FOR INSERT
WITH CHECK (
    user_id IN (
        SELECT id FROM public.profiles 
        WHERE parent_id = auth.uid()
    )
);

-- 6. Policy: Parents can VIEW their students' Classroom Assignments
DROP POLICY IF EXISTS "Parents can view student assignments" ON public.google_classroom_assignments;
CREATE POLICY "Parents can view student assignments"
ON public.google_classroom_assignments
FOR SELECT
USING (
    user_id IN (
        SELECT id FROM public.profiles 
        WHERE parent_id = auth.uid()
    )
);

-- 7. Policy: Parents can VIEW their students' Classroom Courses (Related to assignments)
DROP POLICY IF EXISTS "Parents can view student courses" ON public.google_classroom_courses;
CREATE POLICY "Parents can view student courses"
ON public.google_classroom_courses
FOR SELECT
USING (
    user_id IN (
        SELECT id FROM public.profiles 
        WHERE parent_id = auth.uid()
    )
);
