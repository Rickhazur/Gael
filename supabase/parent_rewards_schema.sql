-- Premios personalizados del padre (ej. "2000 monedas → cine").
-- Persisten en Supabase para que sigan visibles después del logout.

CREATE TABLE IF NOT EXISTS public.parent_rewards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    cost integer NOT NULL CHECK (cost >= 0),
    description text DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parent_rewards_parent_student
    ON public.parent_rewards(parent_id, student_id);

ALTER TABLE public.parent_rewards ENABLE ROW LEVEL SECURITY;

-- El padre solo ve/crea/actualiza/elimina premios propios y solo para sus hijos
DROP POLICY IF EXISTS "Parents can view own rewards" ON public.parent_rewards;
CREATE POLICY "Parents can view own rewards"
    ON public.parent_rewards FOR SELECT
    USING (parent_id = auth.uid());

DROP POLICY IF EXISTS "Parents can insert rewards for their children" ON public.parent_rewards;
CREATE POLICY "Parents can insert rewards for their children"
    ON public.parent_rewards FOR INSERT
    WITH CHECK (
        parent_id = auth.uid()
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = student_id AND parent_id = auth.uid())
    );

DROP POLICY IF EXISTS "Parents can update own rewards" ON public.parent_rewards;
CREATE POLICY "Parents can update own rewards"
    ON public.parent_rewards FOR UPDATE
    USING (parent_id = auth.uid())
    WITH CHECK (parent_id = auth.uid());

DROP POLICY IF EXISTS "Parents can delete own rewards" ON public.parent_rewards;
CREATE POLICY "Parents can delete own rewards"
    ON public.parent_rewards FOR DELETE
    USING (parent_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_rewards TO authenticated;

COMMENT ON TABLE public.parent_rewards IS 'Premios por meta que el padre crea para el niño (ej. 2000 monedas → cine).';
