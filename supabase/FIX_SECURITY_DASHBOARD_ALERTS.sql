/*
  SECURITY DASHBOARD FIX SCRIPT
  =============================
  This script addresses the warnings found in the Supabase Security Advisor:
  1. Enables RLS (Row Level Security) on sensitive tables.
  2. Removes insecure "Universal" policies.
  3. Adds secure "Self" and "Parent" policies.
  4. Fixes the "Security Definer View" warning for notebook_stats.
*/

-- 1. FIX ECONOMY TABLE
ALTER TABLE public.economy ENABLE ROW LEVEL SECURITY;

-- Remove potentially insecure policies
DROP POLICY IF EXISTS "Universal Access Economy" ON public.economy;
DROP POLICY IF EXISTS "Users can manage their own economy" ON public.economy;
DROP POLICY IF EXISTS "Parents can update student economy" ON public.economy;
DROP POLICY IF EXISTS "Parents can insert student economy" ON public.economy;

-- Add Self Access (Students/Users)
CREATE POLICY "Users can manage their own economy" 
ON public.economy
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add Parent Access
CREATE POLICY "Parents can manage student economy" 
ON public.economy
FOR ALLa
USING (
    user_id IN (SELECT id FROM public.profiles WHERE parent_id = auth.uid())
)
WITH CHECK (
    user_id IN (SELECT id FROM public.profiles WHERE parent_id = auth.uid())
);


-- 2. FIX LEARNING PROGRESS TABLE
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- Remove insecure policies
DROP POLICY IF EXISTS "Universal Access Progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Users can manage their own progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Parents can update student progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Parents can insert student progress" ON public.learning_progress;

-- Add Self Access
CREATE POLICY "Users can manage their own progress" 
ON public.learning_progress
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add Parent Access
CREATE POLICY "Parents can manage student progress" 
ON public.learning_progress
FOR ALL
USING (
    user_id IN (SELECT id FROM public.profiles WHERE parent_id = auth.uid())
)
WITH CHECK (
    user_id IN (SELECT id FROM public.profiles WHERE parent_id = auth.uid())
);


-- 3. FIX STEP VALIDATIONS TABLE
ALTER TABLE public.step_validations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can manage their own validations" ON public.step_validations;

-- Add Self Access
CREATE POLICY "Students can manage their own validations" 
ON public.step_validations
FOR ALL
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);


-- 4. FIX NOTES TABLE
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can manage their own notes" ON public.notes;

-- Add Self Access
CREATE POLICY "Students can manage their own notes" 
ON public.notes
FOR ALL
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);


-- 5. FIX NOTEBOOK STATS VIEW
-- Enforce Row Level Security on the view (Security Invoker)
ALTER VIEW public.notebook_stats SET (security_invoker = true);

-- Ensure permissions are correct
GRANT SELECT ON public.notebook_stats TO authenticated;
GRANT SELECT ON public.notebook_stats TO service_role;
