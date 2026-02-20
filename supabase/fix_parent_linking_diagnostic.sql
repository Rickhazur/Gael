-- 1. Asegurar columna
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES auth.users(id);

-- 2. Versión MEJORADA de la función de unión
-- Esta versión verifica que el perfil exista de verdad
CREATE OR REPLACE FUNCTION link_student_by_email(student_email_param TEXT, parent_id_param UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_student_id UUID;
    v_rows_affected INTEGER;
BEGIN
    -- 1. Buscar el UUID en auth.users
    SELECT u.id INTO v_student_id 
    FROM auth.users u 
    WHERE LOWER(u.email) = LOWER(student_email_param);

    IF v_student_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'No se encontró ninguna cuenta con el correo: ' || student_email_param);
    END IF;

    -- 2. Intentar actualizar el perfil
    UPDATE public.profiles 
    SET parent_id = parent_id_param 
    WHERE id = v_student_id;
    
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

    IF v_rows_affected > 0 THEN
        RETURN jsonb_build_object('success', true, 'message', '¡Vínculo exitoso! Perfil de estudiante actualizado.');
    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Se encontró la cuenta pero el Estudiante no tiene un Perfil creado aún en la base de datos.');
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', 'Error interno de base de datos: ' || SQLERRM);
END;
$$;
