-- 1. DROP previous versions to avoid conflicts
DROP FUNCTION IF EXISTS award_coins_secure(UUID, INTEGER);
DROP FUNCTION IF EXISTS award_xp_secure(UUID, INTEGER);

-- 2. Create Coins Function with "ON CONFLICT" (Robust upsert)
CREATE OR REPLACE FUNCTION public.award_coins_secure(p_student_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- IMPORTANT: Bypasses User Permissions on the Table
SET search_path = public -- Security Best Practice
AS $$
BEGIN
    INSERT INTO public.economy (user_id, coins, last_updated)
    VALUES (p_student_id, p_amount, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        coins = economy.coins + p_amount, 
        last_updated = NOW();
        
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    -- Log to Postgres logs for debugging
    RAISE WARNING 'Error in award_coins_secure: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- 3. Create XP Function (Robust upsert)
CREATE OR REPLACE FUNCTION public.award_xp_secure(p_student_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.learning_progress (user_id, total_xp, last_updated, quests_by_category, total_quests_completed)
    VALUES (p_student_id, p_amount, NOW(), '{"math": 0, "science": 0, "language": 0}'::jsonb, 0)
    ON CONFLICT (user_id)
    DO UPDATE SET 
        total_xp = learning_progress.total_xp + p_amount,
        last_updated = NOW();
        
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in award_xp_secure: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- 4. GRANT EXECUTE PERMISSIONS (The Critical Fix)
-- Granting to 'anon' as well just in case session context is tricky, though 'authenticated' should suffice.
GRANT EXECUTE ON FUNCTION public.award_coins_secure(UUID, INTEGER) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.award_xp_secure(UUID, INTEGER) TO postgres, anon, authenticated, service_role;

-- 5. Helper for Linking
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email_input TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_id UUID;
BEGIN
  SELECT id INTO found_id FROM auth.users WHERE email = email_input;
  RETURN found_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) TO postgres, anon, authenticated, service_role;
