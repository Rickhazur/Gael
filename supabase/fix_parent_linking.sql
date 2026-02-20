-- Add parent_id column if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES auth.users(id);

-- Function to link student to parent safely bypassing RLS (via ID)
CREATE OR REPLACE FUNCTION link_student_to_parent(student_id_param UUID, parent_id_param UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET parent_id = parent_id_param
  WHERE id = student_id_param;
  RETURN FOUND;
END;
$$;

-- Function to link student to parent safely bypassing RLS (via Email)
CREATE OR REPLACE FUNCTION link_student_by_email(student_email_param TEXT, parent_id_param UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_student_id UUID;
BEGIN
    -- Find student profile by email (assuming profiles table has email or joining with auth.users)
    -- If profiles doesn't have email DIRECTLY, we join with auth.users
    SELECT u.id INTO v_student_id
    FROM auth.users u
    WHERE LOWER(u.email) = LOWER(student_email_param);

    IF v_student_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Estudiante no encontrado con ese correo.');
    END IF;

    -- Update the student's profile 
    UPDATE public.profiles
    SET parent_id = parent_id_param
    WHERE id = v_student_id;

    IF FOUND THEN
        RETURN jsonb_build_object('success', true, 'message', 'Vinculación exitosa.');
    ELSE
        -- Maybe the profile record itself is missing (shouldn't happen with correct trigger, but let's be safe)
        RETURN jsonb_build_object('success', false, 'message', 'Perfil del estudiante no encontrado.');
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', 'Error interno: ' || SQLERRM);
END;
$$;
