-- Add email to profiles for activation notifications (admin activates -> email to parent/student)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;
COMMENT ON COLUMN public.profiles.email IS 'User email for notifications (e.g. activation email to parent).';

-- Allow new users to INSERT their own profile row (for upsert on signup when no trigger exists)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
