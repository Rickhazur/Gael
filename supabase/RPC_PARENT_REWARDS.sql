-- Function to award coins securely
CREATE OR REPLACE FUNCTION award_coins_secure(p_student_id UUID, p_amount INTEGER)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    current_coins INTEGER;
BEGIN
    -- Check if economy record exists
    SELECT coins INTO current_coins FROM public.economy WHERE user_id = p_student_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.economy (user_id, coins, last_updated)
        VALUES (p_student_id, p_amount, NOW());
    ELSE
        UPDATE public.economy
        SET coins = coins + p_amount,
            last_updated = NOW()
        WHERE user_id = p_student_id;
    END IF;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to award XP securely
CREATE OR REPLACE FUNCTION award_xp_secure(p_student_id UUID, p_amount INTEGER)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    current_xp INTEGER;
BEGIN
    -- Check if learning_progress record exists
    SELECT total_xp INTO current_xp FROM public.learning_progress WHERE user_id = p_student_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.learning_progress (user_id, total_xp, last_updated, quests_by_category, total_quests_completed)
        VALUES (p_student_id, p_amount, NOW(), '{"math": 0, "science": 0, "language": 0}'::jsonb, 0);
    ELSE
        UPDATE public.learning_progress
        SET total_xp = total_xp + p_amount,
            last_updated = NOW()
        WHERE user_id = p_student_id;
    END IF;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Helper to get user ID (for parent registration flow)
CREATE OR REPLACE FUNCTION get_user_id_by_email(email_input TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  found_id UUID;
BEGIN
  SELECT id INTO found_id FROM auth.users WHERE email = email_input;
  RETURN found_id;
END;
$$;
