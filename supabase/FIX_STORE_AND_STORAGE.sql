
-- ACTUALIZACIÓN DE LA TABLA store_items PARA LA NUEVA TIENDA NOVA
-- Este script alinea la base de datos con la interfaz StoreItem de TypeScript

-- 1. Asegurar que la tabla existe con las columnas base
CREATE TABLE IF NOT EXISTS store_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cost INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Agregar nuevas columnas (usando comillas para mantener camelCase si es necesario, 
-- pero el frontend espera camelCase en los objetos devueltos por Supabase JS)
ALTER TABLE store_items ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'accessory';
ALTER TABLE store_items ADD COLUMN IF NOT EXISTS "subType" TEXT;
ALTER TABLE store_items ADD COLUMN IF NOT EXISTS type TEXT; -- Legacy compatibility
ALTER TABLE store_items ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE store_items ADD COLUMN IF NOT EXISTS icon TEXT; -- Por compatibilidad legacy
ALTER TABLE store_items ADD COLUMN IF NOT EXISTS color TEXT;a
ALTER TABLE store_items ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'rare';
ALTER TABLE store_items ADD COLUMN IF NOT EXISTS "minLevel" INTEGER DEFAULT 1;

-- 3. Sincronizar columnas legacy si existen
-- Si icon tiene data y image está vacío, copiar de icon a image
UPDATE store_items SET image = icon WHERE image IS NULL AND icon IS NOT NULL;
-- Viceversa
UPDATE store_items SET icon = image WHERE icon IS NULL AND image IS NOT NULL;

-- 4. Habilitar RLS
ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de acceso
DROP POLICY IF EXISTS "Cualquiera puede ver items de la tienda" ON store_items;
CREATE POLICY "Cualquiera puede ver items de la tienda" 
ON store_items FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Solo admins pueden modificar items" ON store_items;
CREATE POLICY "Solo admins pueden modificar items" 
ON store_items FOR ALL 
USING (
  auth.jwt() ->> 'email' = 'rickhazur@gmail.com'
);

-- 6. CONFIGURACIÓN DE STORAGE (BUCKETS)
-- Intentar crear el bucket 'nova-store' si no existe
-- Nota: Esto requiere que las extensiones de storage estén activas
INSERT INTO storage.buckets (id, name, public)
SELECT 'nova-store', 'nova-store', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'nova-store'
);

-- Habilitar acceso público al bucket nova-store
DROP POLICY IF EXISTS "Acceso Público Store" ON storage.objects;
CREATE POLICY "Acceso Público Store"
ON storage.objects FOR SELECT
USING ( bucket_id = 'nova-store' );

DROP POLICY IF EXISTS "Subida para Admins Store" ON storage.objects;
CREATE POLICY "Subida para Admins Store"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'nova-store' AND
  auth.jwt() ->> 'email' = 'rickhazur@gmail.com'
);

DROP POLICY IF EXISTS "Borrado para Admins Store" ON storage.objects;
CREATE POLICY "Borrado para Admins Store"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'nova-store' AND
  auth.jwt() ->> 'email' = 'rickhazur@gmail.com'
);

-- También para el bucket 'assets' por si acaso
INSERT INTO storage.buckets (id, name, public)
SELECT 'assets', 'assets', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'assets'
);

DROP POLICY IF EXISTS "Acceso Público Assets" ON storage.objects;
CREATE POLICY "Acceso Público Assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'assets' );

DROP POLICY IF EXISTS "Subida para Admins Assets" ON storage.objects;
CREATE POLICY "Subida para Admins Assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assets' AND
  auth.jwt() ->> 'email' = 'rickhazur@gmail.com'
);
