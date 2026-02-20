-- =====================================================
-- SCRIPT 2: CREAR USUARIO DEMO
-- =====================================================
-- Ejecuta este script DESPUÉS del Script 1
-- Crea el usuario: sofia.demo@novaschola.com
-- Contraseña: demo2024
-- =====================================================

-- Eliminar usuario demo si existe (para empezar limpio)
DELETE FROM auth.identities WHERE provider = 'email' AND identity_data->>'email' = 'sofia.demo@novaschola.com';
DELETE FROM auth.users WHERE email = 'sofia.demo@novaschola.com';

-- Crear el usuario demo
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
    'sofia.demo@novaschola.com',
    crypt('demo2024', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Sofía Martínez","role":"STUDENT"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Crear identidad de email para el usuario
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
        'email', 'sofia.demo@novaschola.com',
        'email_verified', true,
        'phone_verified', false
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'sofia.demo@novaschola.com';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Mostrar los datos del usuario creado
SELECT 
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data->>'name' as name,
    raw_user_meta_data->>'role' as role,
    created_at
FROM auth.users 
WHERE email = 'sofia.demo@novaschola.com';

-- =====================================================
-- ÉXITO
-- =====================================================
-- Si ves los datos del usuario arriba, el script funcionó correctamente:
-- Email: sofia.demo@novaschola.com
-- Password: demo2024
-- Name: Sofía Martínez
-- Role: STUDENT
--
-- Ahora puedes ejecutar el Script 3 (SCRIPT_3_LLENAR_DATOS.sql)
-- =====================================================
