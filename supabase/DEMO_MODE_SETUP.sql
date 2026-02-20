-- =====================================================
-- NOVA SCHOLA - DEMO MODE DATABASE SETUP
-- =====================================================
-- This script creates a complete demo user with realistic data
-- for presentations to schools and parents.
-- 
-- Demo User: Sofía Martínez (sofia.demo@novaschola.com)
-- Password: demo2024
-- =====================================================

-- 1. Create Demo Student Profile
-- Note: The actual user creation must be done through Supabase Auth UI or API
-- This script assumes the user 'sofia.demo@novaschola.com' already exists in auth.users

-- Insert student profile
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
    (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com'),
    'Sofía Martínez',
    3,
    1250,
    450,
    7,
    12,
    NOW() - INTERVAL '30 days'
) ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    grade_level = EXCLUDED.grade_level,
    total_xp = EXCLUDED.total_xp,
    total_coins = EXCLUDED.total_coins,
    current_streak = EXCLUDED.current_streak,
    longest_streak = EXCLUDED.longest_streak;

-- 2. Set Avatar and Accessories
INSERT INTO student_avatars (
    user_id,
    avatar_id,
    equipped_accessories,
    owned_accessories,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com'),
    'girl_superhero',
    '{"head": "crown_gold", "body": "cape_red"}',
    '["crown_gold", "cape_red", "glasses_star", "wand_magic"]',
    NOW() - INTERVAL '30 days',
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    avatar_id = EXCLUDED.avatar_id,
    equipped_accessories = EXCLUDED.equipped_accessories,
    owned_accessories = EXCLUDED.owned_accessories,
    updated_at = NOW();

-- 3. Create Completed Missions
INSERT INTO quest_completions (
    user_id,
    quest_id,
    category,
    difficulty,
    xp_earned,
    coins_earned,
    was_correct,
    completed_at
) VALUES
    (
        (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com'),
        'mission-006',
        'math',
        'medium',
        100,
        35,
        true,
        NOW() - INTERVAL '3 days'
    ),
    (
        (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com'),
        'mission-007',
        'science',
        'medium',
        90,
        30,
        true,
        NOW() - INTERVAL '4 days'
    ),
    (
        (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com'),
        'mission-008',
        'language',
        'medium',
        110,
        40,
        true,
        NOW() - INTERVAL '5 days'
    ),
    (
        (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com'),
        'mission-003',
        'language',
        'medium',
        120,
        40,
        true,
        NOW() - INTERVAL '2 days'
    )
ON CONFLICT (user_id, quest_id) DO NOTHING;

-- 4. Unlock Badges
INSERT INTO unlocked_badges (
    user_id,
    badge_id,
    unlocked_at
) VALUES
    (
        (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com'),
        'first-quest',
        NOW() - INTERVAL '28 days'
    ),
    (
        (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com'),
        'streak-3',
        NOW() - INTERVAL '26 days'
    ),
    (
        (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com'),
        'streak-7',
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- 5. Create Google Classroom Assignments (Demo)
INSERT INTO google_classroom_assignments (
    user_id,
    google_assignment_id,
    course_id,
    title,
    description,
    state,
    due_date,
    created_at
) VALUES
    (
        (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com'),
        'demo-assignment-001',
        'demo-course-math',
        'Examen de Matemáticas - Fracciones y Decimales',
        'Repaso completo de fracciones, decimales y operaciones básicas para el examen del viernes.',
        'CREATED',
        NOW() + INTERVAL '5 days',
        NOW() - INTERVAL '7 days'
    ),
    (
        (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com'),
        'demo-assignment-002',
        'demo-course-science',
        'Quiz de Ciencias Naturales - El Ciclo del Agua',
        'Estudiar las etapas del ciclo del agua: evaporación, condensación, precipitación.',
        'CREATED',
        NOW() + INTERVAL '2 days',
        NOW() - INTERVAL '5 days'
    ),
    (
        (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com'),
        'demo-assignment-004',
        'demo-course-social',
        'Proyecto de Ciencias Sociales - Mi Ciudad',
        'Crear una presentación sobre la historia y cultura de tu ciudad.',
        'CREATED',
        NOW() + INTERVAL '10 days',
        NOW() - INTERVAL '3 days'
    )
ON CONFLICT (google_assignment_id) DO NOTHING;

-- 6. Create Learning Progress Records
INSERT INTO learning_progress (
    user_id,
    total_quests_completed,
    total_xp,
    total_coins,
    current_streak,
    longest_streak,
    accuracy_rate,
    quests_by_category,
    unlocked_badges,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com'),
    15,
    1250,
    450,
    7,
    12,
    87,
    '{"math": 5, "science": 4, "language": 4, "social_studies": 2}',
    '["first-quest", "streak-3", "streak-7"]',
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    total_quests_completed = EXCLUDED.total_quests_completed,
    total_xp = EXCLUDED.total_xp,
    total_coins = EXCLUDED.total_coins,
    current_streak = EXCLUDED.current_streak,
    longest_streak = EXCLUDED.longest_streak,
    accuracy_rate = EXCLUDED.accuracy_rate,
    quests_by_category = EXCLUDED.quests_by_category,
    unlocked_badges = EXCLUDED.unlocked_badges,
    updated_at = NOW();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the demo data was created correctly:

-- Check student profile
-- SELECT * FROM student_profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com');

-- Check avatar
-- SELECT * FROM student_avatars WHERE user_id = (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com');

-- Check completed missions
-- SELECT * FROM quest_completions WHERE user_id = (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com');

-- Check badges
-- SELECT * FROM unlocked_badges WHERE user_id = (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com');

-- Check assignments
-- SELECT * FROM google_classroom_assignments WHERE user_id = (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com');

-- =====================================================
-- NOTES FOR MANUAL SETUP:
-- =====================================================
-- 1. First, create the user in Supabase Auth Dashboard:
--    Email: sofia.demo@novaschola.com
--    Password: demo2024
--    Auto-confirm: YES (skip email verification)
--
-- 2. Then run this SQL script in the Supabase SQL Editor
--
-- 3. The demo mode will automatically load this data when
--    the user clicks "VER DEMO INTERACTIVA" on the login page
-- =====================================================
