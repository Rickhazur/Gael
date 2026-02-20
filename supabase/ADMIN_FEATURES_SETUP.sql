/*
  ADMIN DASHBOARD SETUP
  =====================
  This script prepares the database for the Admin Dashboard functionality.
  1. Adds necessary columns to profiles (subscription, admin status).
  2. Creates secure policies for Admin access.
  3. Ensures account_status column exists.
*/

-- 1. ADD COLUMNS TO PROFILES
-- We add these columns if they don't exist yet to avoid errors.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'pending' CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'trial', 'pending')),
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending'; -- Ensure this exists as used in services

-- 2. CREATE ADMIN POLICIES
-- First, drop existing admin policies to avoid duplicates
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Policy: Admins can VIEW all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Policy: Admins can UPDATE all profiles (to activate subscriptions)
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- 3. MAKE EXISTING USERS ADMIN (OPTIONAL BUT HELPFUL FOR DEV)
-- Uncomment the line below and replace with your email to make yourself admin immediately
-- UPDATE public.profiles SET is_admin = true WHERE id = auth.uid(); 
-- Since we can't run dynamic auth.uid() in a script easily without context, 
-- we recommend running this manually in the SQL Editor:
-- UPDATE profiles SET is_admin = true WHERE email = 'your_email@example.com';

-- 4. GRANT PERMISSIONS (Just in case)
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
