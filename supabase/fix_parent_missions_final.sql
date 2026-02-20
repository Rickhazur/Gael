-- Consolidation and Fix for Parent Missions and Notifications
-- Run this in Supabase SQL Editor to ensure all features work correctly.

-- 1. Ensure parent_missions table exists with correct schema
CREATE TABLE IF NOT EXISTS public.parent_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES auth.users(id),
    student_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    reward_coins INTEGER DEFAULT 50,
    reward_xp INTEGER DEFAULT 100,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Enable RLS
ALTER TABLE public.parent_missions ENABLE ROW LEVEL SECURITY;

-- 3. DROP old generic policy if it exists
DROP POLICY IF EXISTS "Parents can manage their students' missions" ON public.parent_missions;

-- 4. Create explicit RLS policies for parent_missions
CREATE POLICY "Parents can insert missions for students"
ON public.parent_missions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = parent_id
);

CREATE POLICY "Parents and students can view missions"
ON public.parent_missions
FOR SELECT
TO authenticated
USING (
  auth.uid() = parent_id OR auth.uid() = student_id
);

CREATE POLICY "Parents and students can update missions"
ON public.parent_missions
FOR UPDATE
TO authenticated
USING (
  auth.uid() = parent_id OR auth.uid() = student_id
)
WITH CHECK (
  auth.uid() = parent_id OR auth.uid() = student_id
);

-- 5. Fix Notifications RLS for Parents
-- Parents need to be able to insert notifications for their students
DROP POLICY IF EXISTS "Parents can notify students" ON public.notifications;

CREATE POLICY "Parents can notify students"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = notifications.user_id
    AND public.profiles.parent_id = auth.uid()
  ) OR auth.uid() = user_id
);

-- 6. Ensure profiles has parent_id and it's visible
-- This is critical for the previous policy to work
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='parent_id') THEN
        ALTER TABLE public.profiles ADD COLUMN parent_id UUID REFERENCES auth.users(id);
    END IF;
END $$;
