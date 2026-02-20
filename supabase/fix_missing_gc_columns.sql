-- Add reward_claimed and submission_state columns to Google Classroom Assignments
ALTER TABLE google_classroom_assignments
ADD COLUMN IF NOT EXISTS reward_claimed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS submission_state text DEFAULT 'NEW';

-- Add unique constraint to google_classroom_assignments if it doesn't exist (handling potential duplicates before adding)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'google_classroom_assignments_user_id_google_assignment_id_key'
    ) THEN
        -- Optional: clean up duplicates here if needed, but for now assuming data is clean or we want error on conflict
        ALTER TABLE google_classroom_assignments
        ADD CONSTRAINT google_classroom_assignments_user_id_google_assignment_id_key UNIQUE (user_id, google_assignment_id);
    END IF;
END $$;
