-- ================================================================
-- AÑADIR CAMPO DE TELÉFONO DEL ACUDIENTE
-- ================================================================
-- Ejecuta esto en el SQL Editor de Supabase para poder guardar
-- el número de WhatsApp/Teléfono del padre y que aparezca en el panel de admin.
-- ================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS guardian_phone TEXT;

COMMENT ON COLUMN public.profiles.guardian_phone IS 'Teléfono/WhatsApp del acudiente (Padre).';
