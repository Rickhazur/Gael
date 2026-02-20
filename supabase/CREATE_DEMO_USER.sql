-- =====================================================
-- NOVA SCHOLA - CREATE DEMO USER
-- =====================================================
-- This script creates the demo user account
-- Run this AFTER CREATE_DEMO_TABLES.sql
-- and BEFORE DEMO_MODE_SETUP.sql
-- =====================================================

-- Create the demo user using Supabase Auth Admin API
-- Note: This uses the auth.users table directly

-- Insert demo user into auth.users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'sofia.demo@novaschola.com',
    crypt('demo2024', gen_salt('bf')), -- Password: demo2024
    NOW(), -- Email confirmed immediately
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"name":"Sofía Martínez","role":"STUDENT"}',
    false,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    false,
    NULL
) ON CONFLICT (email) DO NOTHING;

-- Also insert into auth.identities for email provider
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com'),
    jsonb_build_object(
        'sub', (SELECT id::text FROM auth.users WHERE email = 'sofia.demo@novaschola.com'),
        'email', 'sofia.demo@novaschola.com'
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (provider, id) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Verify the user was created:
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data->>'name' as name,
    raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email = 'sofia.demo@novaschola.com';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- If you see the user details above, the demo user was created successfully!
-- Email: sofia.demo@novaschola.com
-- Password: demo2024
-- 
-- Now you can run DEMO_MODE_SETUP.sql to populate the demo data.
-- =====================================================
