-- ================================================================
-- ELIMINAR CUENTAS DEFINITIVAMENTE DESDE LA APP
-- ================================================================
-- Ejecuta esto en el SQL Editor de Supabase para poder borrar
-- estudiantes/padres completamente y liberar sus correos.
-- ================================================================

-- Esta función requiere ejecutarse con privilegios elevados (SECURITY DEFINER)
-- para poder saltarse el RLS y borrar datos de auth.users y auth.identities
CREATE OR REPLACE FUNCTION delete_student_completely(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Borrar todas las referencias en public (Si hay FKs sin CASCADE, ayuda)
    DELETE FROM public.economy WHERE user_id = target_user_id;
    DELETE FROM public.learning_progress WHERE user_id = target_user_id;
    DELETE FROM public.notebooks WHERE student_id = target_user_id;
    DELETE FROM public.student_avatars WHERE user_id = target_user_id;
    DELETE FROM public.student_profiles WHERE user_id = target_user_id;
    
    -- El perfil público se borra (generalmente detona borrados en cascada)
    DELETE FROM public.profiles WHERE id = target_user_id;

    -- 2. Borrar dentidades y usuario de sistema Auth (LIBERA EL CORREO)
    DELETE FROM auth.identities WHERE user_id = target_user_id;
    DELETE FROM auth.users WHERE id = target_user_id;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error eliminando usuario: %', SQLERRM;
        RETURN FALSE;
END;
$$;
