#!/usr/bin/env node
/**
 * Aplica la migración de Moodle en Supabase.
 *
 * OPCIÓN 1 (recomendada): Ejecutar manualmente en Supabase Dashboard
 *   1. Ve a https://supabase.com/dashboard
 *   2. Selecciona tu proyecto
 *   3. SQL Editor → New query
 *   4. Copia el contenido de supabase/migrations/20250131_moodle_schema.sql
 *   5. Pega y Run
 *
 * OPCIÓN 2: Si tienes Supabase CLI instalado:
 *   npx supabase db push
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250131_moodle_schema.sql');

console.log('\n📚 Migración Moodle para Nova Schola\n');
console.log('Ejecuta el siguiente SQL en Supabase Dashboard → SQL Editor:\n');
console.log('─'.repeat(60));
console.log(readFileSync(migrationPath, 'utf8'));
console.log('─'.repeat(60));
console.log('\nO copia desde: supabase/migrations/20250131_moodle_schema.sql\n');
