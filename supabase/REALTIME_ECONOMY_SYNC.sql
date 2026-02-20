-- ================================================================
-- REALTIME: PUNTOS PADRE → HIJO
-- ================================================================
-- Para que los puntos que da el padre en la Torre de Control
-- se reflejen al instante en la cuenta del hijo, la tabla economy
-- debe estar en la publicación de Realtime.
-- Ejecuta en Supabase: SQL Editor → New query → pegar y Run
-- ================================================================

-- Añadir economy a Realtime (si no está ya)
ALTER PUBLICATION supabase_realtime ADD TABLE public.economy;

-- Añadir learning_progress para que el XP que da el padre también sincronice
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_progress;

-- Si da error "already in publication", ignóralo (ya estaba configurado).
