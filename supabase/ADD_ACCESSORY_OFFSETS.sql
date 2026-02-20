
-- Migration: Add custom accessory offsets to student profiles
-- This allows students to manually adjust the position and scale of their items (Modo Estilista)

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS accessory_offsets JSONB DEFAULT '{}'::jsonb;

-- Ensure RLS allows updating this column (already covered by existing UPDATE policy on profiles)
COMMENT ON COLUMN profiles.accessory_offsets IS 'Stores manual X, Y, and Scale offsets for individual equipped accessories.';
