-- ============================================
-- FIX NOTEBOOK SYSTEM DATABASE
-- Run this if you cannot save notes or notebooks
-- ============================================

-- 1. Ensure extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure Notebooks Table
CREATE TABLE IF NOT EXISTS notebooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    color VARCHAR(50) DEFAULT '#4F46E5',
    description TEXT,
    cover_emoji VARCHAR(10) DEFAULT '📓',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ensure Notes Table columns
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic VARCHAR(500) NOT NULL,
    date VARCHAR(100),
    subject VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add missing columns to notes
ALTER TABLE notes ADD COLUMN IF NOT EXISTS notebook_id UUID REFERENCES notebooks(id) ON DELETE SET NULL;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]';

-- 5. Row Level Security for Notebooks
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view own notebooks" ON notebooks;
CREATE POLICY "Students can view own notebooks" ON notebooks FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can create own notebooks" ON notebooks;
CREATE POLICY "Students can create own notebooks" ON notebooks FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update own notebooks" ON notebooks;
CREATE POLICY "Students can update own notebooks" ON notebooks FOR UPDATE USING (auth.uid() = student_id);

-- 6. View for Statistics
CREATE OR REPLACE VIEW notebook_stats AS
SELECT 
    n.id,
    n.student_id,
    n.title,
    n.subject,
    n.color,
    n.cover_emoji,
    n.is_archived,
    n.created_at,
    n.updated_at,
    COUNT(nt.id) as note_count,
    MAX(nt.created_at) as last_note_date
FROM notebooks n
LEFT JOIN notes nt ON nt.notebook_id = n.id
GROUP BY n.id, n.student_id, n.title, n.subject, n.color, n.cover_emoji, n.is_archived, n.created_at, n.updated_at;

-- 7. RPC for Student Notebooks
CREATE OR REPLACE FUNCTION get_student_notebooks(student_uuid UUID)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    subject VARCHAR,
    color VARCHAR,
    cover_emoji VARCHAR,
    description TEXT,
    is_archived BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    note_count BIGINT,
    last_note_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ns.id,
        ns.title,
        ns.subject,
        ns.color,
        ns.cover_emoji,
        n.description,
        ns.is_archived,
        ns.created_at,
        ns.updated_at,
        ns.note_count,
        ns.last_note_date
    FROM notebook_stats ns
    JOIN notebooks n ON n.id = ns.id
    WHERE ns.student_id = student_uuid
    ORDER BY ns.updated_at DESC;
END;
$$ LANGUAGE plpgsql;
