-- =====================================================
-- CREAR USUARIO DE PRUEBA: PADRE DE ANDRÉS
-- =====================================================
-- Cuenta de padre/acudiente para probar el panel de padres.
-- Vinculado al estudiante piloto (piloto.quinto@novaschola.com)
-- para ver progreso, misiones y recompensas.
--
-- Email:    padre.andres@novaschola.com
-- Password: padre2024
-- =====================================================

-- Eliminar padre si existe (para poder re-ejecutar el script)
DELETE FROM auth.identities WHERE provider = 'email' AND identity_data->>'email' = 'padre.andres@novaschola.com';
DELETE FROM auth.users WHERE email = 'padre.andres@novaschola.com';

-- Crear el usuario padre en Auth
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
    'padre.andres@novaschola.com',
    crypt('padre2024', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Padre de Andrés","role":"PARENT"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Identidad de email
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
        'email', 'padre.andres@novaschola.com',
        'email_verified', true,
        'phone_verified', false
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
FROM auth.users
WHERE email = 'padre.andres@novaschola.com';

-- Perfil de padre (profiles)
INSERT INTO public.profiles (id, name, role, account_status)
SELECT id, 'Padre de Andrés', 'PARENT', 'active'
FROM auth.users
WHERE email = 'padre.andres@novaschola.com'
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = 'PARENT', account_status = 'active';

-- Vincular estudiante piloto (Piloto Quinto) con este padre
-- Así el padre puede ver a "Piloto Quinto" como su hijo en el panel
SELECT link_student_to_parent(
    (SELECT id FROM auth.users WHERE email = 'piloto.quinto@novaschola.com'),
    (SELECT id FROM auth.users WHERE email = 'padre.andres@novaschola.com')
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT
    u.email,
    p.name,
    p.role,
    p.account_status,
    (SELECT email FROM auth.users WHERE id = (SELECT id FROM auth.users WHERE email = 'piloto.quinto@novaschola.com')) AS estudiante_vinculado
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'padre.andres@novaschola.com';

-- =====================================================
-- CREDENCIALES
-- =====================================================
-- Email:    padre.andres@novaschola.com
-- Password: padre2024
-- Rol:      Padre/Acudiente (ve al estudiante Piloto Quinto como hijo)
-- =====================================================
