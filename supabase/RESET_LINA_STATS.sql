
-- ================================================================
-- SCRIPT PARA REINICIAR PUNTOS DE "LINA" (O CUALQUIER ESTUDIANTE)
-- ================================================================

-- 1. Reiniciar Monedas (Economy)
UPDATE economy
SET coins = 0,
    last_updated = NOW()
WHERE user_id IN (SELECT id FROM profiles WHERE name ILIKE '%Lina%'); -- Busca nombres que contengan "Lina"

-- 2. Reiniciar XP y Progreso (Learning Progress)
UPDATE learning_progress
SET total_xp = 0,
    quests_by_category = '{"math": 0, "science": 0, "language": 0}'::jsonb,
    total_quests_completed = 0,
    last_updated = NOW()
WHERE user_id IN (SELECT id FROM profiles WHERE name ILIKE '%Lina%');

-- Verificación (Opcional: muestra cómo quedaron)
SELECT p.name, e.coins, lp.total_xp 
FROM profiles p
LEFT JOIN economy e ON p.id = e.user_id
LEFT JOIN learning_progress lp ON p.id = lp.user_id
WHERE p.name ILIKE '%Lina%';
