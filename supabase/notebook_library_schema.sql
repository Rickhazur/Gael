-- ============================================
-- NOTEBOOK LIBRARY SYSTEM
-- Sistema de Biblioteca de Cuadernos para Nova Schola
-- ============================================

-- 0. Crear tabla de notas si no existe
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic VARCHAR(500) NOT NULL,
    date VARCHAR(100),
    subject VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    highlights JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Tabla de Cuadernos
CREATE TABLE IF NOT EXISTS notebooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL, -- 'math', 'english', 'science', 'history', etc.
    color VARCHAR(50) DEFAULT '#4F46E5', -- Color del cuaderno
    description TEXT,
    cover_emoji VARCHAR(10) DEFAULT '📓',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Actualizar tabla de notas para incluir notebook_id
ALTER TABLE notes ADD COLUMN IF NOT EXISTS notebook_id UUID REFERENCES notebooks(id) ON DELETE SET NULL;

-- 3. Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_notebooks_student ON notebooks(student_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_subject ON notebooks(subject);
CREATE INDEX IF NOT EXISTS idx_notebooks_archived ON notebooks(is_archived);
CREATE INDEX IF NOT EXISTS idx_notes_notebook ON notes(notebook_id);

-- 4. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_notebook_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para actualizar timestamp
DROP TRIGGER IF EXISTS update_notebooks_timestamp ON notebooks;
CREATE TRIGGER update_notebooks_timestamp
    BEFORE UPDATE ON notebooks
    FOR EACH ROW
    EXECUTE FUNCTION update_notebook_timestamp();

-- 6. Row Level Security (RLS)
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;

-- Policy: Los estudiantes solo pueden ver sus propios cuadernos
CREATE POLICY "Students can view own notebooks"
    ON notebooks FOR SELECT
    USING (auth.uid() = student_id);

-- Policy: Los estudiantes pueden crear sus propios cuadernos
CREATE POLICY "Students can create own notebooks"
    ON notebooks FOR INSERT
    WITH CHECK (auth.uid() = student_id);

-- Policy: Los estudiantes pueden actualizar sus propios cuadernos
CREATE POLICY "Students can update own notebooks"
    ON notebooks FOR UPDATE
    USING (auth.uid() = student_id);

-- Policy: Los estudiantes pueden eliminar sus propios cuadernos
CREATE POLICY "Students can delete own notebooks"
    ON notebooks FOR DELETE
    USING (auth.uid() = student_id);

-- 7. Vista para estadísticas de cuadernos
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

-- 8. Función para obtener cuadernos con estadísticas
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

-- 9. Cuadernos por defecto para nuevos estudiantes
CREATE OR REPLACE FUNCTION create_default_notebooks()
RETURNS TRIGGER AS $$
BEGIN
    -- Cuaderno de Matemáticas
    INSERT INTO notebooks (student_id, title, subject, color, cover_emoji, description)
    VALUES (
        NEW.id,
        'Matemáticas con Lina',
        'math',
        '#8B5CF6', -- Purple
        '📗',
        'Mis apuntes de matemáticas'
    );
    
    -- Cuaderno de Inglés
    INSERT INTO notebooks (student_id, title, subject, color, cover_emoji, description)
    VALUES (
        NEW.id,
        'English with Rachelle',
        'english',
        '#3B82F6', -- Blue
        '📘',
        'My English notes'
    );
    
    -- Cuaderno de Ciencias
    INSERT INTO notebooks (student_id, title, subject, color, cover_emoji, description)
    VALUES (
        NEW.id,
        'Ciencias',
        'science',
        '#10B981', -- Green
        '📙',
        'Mis experimentos y descubrimientos'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger para crear cuadernos por defecto
DROP TRIGGER IF EXISTS create_default_notebooks_trigger ON auth.users;
CREATE TRIGGER create_default_notebooks_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notebooks();

-- 11. Comentarios para documentación
COMMENT ON TABLE notebooks IS 'Cuadernos personales de los estudiantes organizados por materia';
COMMENT ON COLUMN notebooks.subject IS 'Materia del cuaderno: math, english, science, history, etc.';
COMMENT ON COLUMN notebooks.color IS 'Color hexadecimal para la portada del cuaderno';
COMMENT ON COLUMN notebooks.cover_emoji IS 'Emoji que aparece en la portada del cuaderno';
COMMENT ON COLUMN notebooks.is_archived IS 'Indica si el cuaderno está archivado (no se muestra en la biblioteca principal)';

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL - SOLO PARA TESTING)
-- ============================================

-- Descomentar para crear cuadernos de ejemplo
/*
INSERT INTO notebooks (student_id, title, subject, color, cover_emoji, description) VALUES
    ((SELECT id FROM auth.users LIMIT 1), 'Álgebra Básica', 'math', '#8B5CF6', '📗', 'Ecuaciones y expresiones'),
    ((SELECT id FROM auth.users LIMIT 1), 'Geometría', 'math', '#A855F7', '📐', 'Figuras y medidas'),
    ((SELECT id FROM auth.users LIMIT 1), 'Vocabulario', 'english', '#3B82F6', '📘', 'New words and phrases'),
    ((SELECT id FROM auth.users LIMIT 1), 'Grammar Practice', 'english', '#60A5FA', '✍️', 'Verb tenses and rules');
*/
