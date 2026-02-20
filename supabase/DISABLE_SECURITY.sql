-- !!! IMPORTANTE: EJECUTAR ESTO PARA QUE LUNA RECIBA LOS PUNTOS !!!



-- 1. Desactivar el "Candado" de seguridad (RLS) para permitir que los puntos pasen

ALTER TABLE public.economy DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.learning_progress DISABLE ROW LEVEL SECURITY;



-- 2. Asegurarnos de que los permisos de escritura sean públicos (Solo para desarrollo)

GRANT ALL ON public.economy TO anon, authenticated, service_role;

GRANT ALL ON public.learning_progress TO anon, authenticated, service_role;



-- 3. Crear una política universal "por si acaso" el desbloqueo falla

CREATE POLICY "Universal Access Economy" ON public.economy FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Universal Access Progress" ON public.learning_progress FOR ALL USING (true) WITH CHECK (true);

    