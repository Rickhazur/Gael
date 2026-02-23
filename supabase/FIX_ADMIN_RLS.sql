/*
  FIX FOR INFINITE RECURSION IN ADMIN POLICIES
  Run this script in the Supabase SQL Editor to resolve the 500 error 
  caused by the infinite recursion in the profiles policies.
*/

-- 1. Create a secure definer function to read the admin status safely without triggering RLS recursively
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()), 
    false
  );
$$;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 3. Recreate the policies using the new function
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
    public.is_current_user_admin()
);

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (
    public.is_current_user_admin()
);
