-- =====================================================
-- CREAR USUARIO DE PRUEBA: PILOTO QUINTO GRADO
-- =====================================================
-- Cuenta para probar la experiencia de 5° grado (colegio NO bilingüe).
-- (Arena Ciudadela del Tiempo, avatares 5°, misiones g5).
--
-- Email:    piloto.quinto@novaschola.com
-- Password: piloto2024
-- =====================================================

-- Eliminar usuario si existe (para poder re-ejecutar el script)
DELETE FROM auth.identities WHERE provider = 'email' AND identity_data->>'email' = 'piloto.quinto@novaschola.com';
DELETE FROM auth.users WHERE email = 'piloto.quinto@novaschola.com';

-- Crear el usuario en Auth
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'piloto.quinto@novaschola.com',
    crypt('piloto2024', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Piloto Quinto","role":"STUDENT"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Crear identidad de email
INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    id,
    id::text,
    jsonb_build_object(
        'sub', id::text,
        'email', 'piloto.quinto@novaschola.com',
        'email_verified', true,
        'phone_verified', false
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'piloto.quinto@novaschola.com';

-- Perfil público (profiles): colegio NO bilingüe (is_bilingual = false)
-- LearningContext usa profiles.is_bilingual para immersionMode 'standard' vs 'bilingual'
INSERT INTO public.profiles (id, name, role, is_bilingual)
SELECT id, 'Piloto Quinto', 'STUDENT', false
FROM auth.users
WHERE email = 'piloto.quinto@novaschola.com'
ON CONFLICT (id) DO UPDATE SET is_bilingual = false;

-- Perfil de estudiante (5° grado) con muchas monedas para comprar en la tienda
INSERT INTO student_profiles (
    user_id,
    name,
    grade_level,
    total_xp,
    total_coins,
    current_streak,
    longest_streak,
    created_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'piloto.quinto@novaschola.com'),
    'Piloto Quinto',
    5,
    0,
    99999,
    0,
    0,
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    grade_level = 5,
    total_xp = EXCLUDED.total_xp,
    total_coins = 99999,
    current_streak = EXCLUDED.current_streak,
    longest_streak = EXCLUDED.longest_streak;

-- Economía: muchas monedas para la tienda (la app usa economy.coins)
INSERT INTO public.economy (user_id, coins, last_updated)
SELECT id, 99999, NOW()
FROM auth.users
WHERE email = 'piloto.quinto@novaschola.com'
ON CONFLICT (user_id) DO UPDATE SET coins = 99999, last_updated = NOW();

-- Avatar de 5° grado (dragón)
INSERT INTO student_avatars (
    user_id,
    avatar_id,
    equipped_accessories,
    owned_accessories,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'piloto.quinto@novaschola.com'),
    'dragon_quinto',
    '{}',
    '[]',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    avatar_id = 'dragon_quinto',
    updated_at = NOW();

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.raw_user_meta_data->>'name' AS name,
    sp.grade_level AS grado,
    sp.total_coins AS monedas
FROM auth.users u
LEFT JOIN student_profiles sp ON sp.user_id = u.id
WHERE u.email = 'piloto.quinto@novaschola.com';

-- =====================================================
-- CREDENCIALES
-- =====================================================
-- Email:    piloto.quinto@novaschola.com
-- Password: piloto2024
-- Grado:    5° (Arena Ciudadela del Tiempo, misiones g5)
-- Colegio:  NO bilingüe (modo estándar, is_bilingual = false)
-- Monedas:  99.999 (estudiante de prueba, para comprar en la tienda)
-- =====================================================
