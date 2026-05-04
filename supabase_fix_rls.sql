-- Script de diagnostic et correction rapide
-- Exécutez ce script dans Supabase SQL Editor

-- 1. DIAGNOSTIC: Voir tous les utilisateurs et leurs églises
SELECT 
    au.id as user_id,
    au.email,
    cu.church_id,
    c.name as church_name,
    cu.role,
    CASE 
        WHEN cu.church_id IS NULL THEN '❌ PAS D''ÉGLISE'
        ELSE '✅ OK'
    END as status
FROM auth.users au
LEFT JOIN church_users cu ON au.id = cu.user_id
LEFT JOIN churches c ON cu.church_id = c.id
ORDER BY au.created_at DESC;

-- 2. SOLUTION RAPIDE: Créer automatiquement une église pour TOUS les utilisateurs sans église
DO $$
DECLARE
    user_record record;
    new_church_id bigint;
    church_name text;
BEGIN
    FOR user_record IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN church_users cu ON au.id = cu.user_id
        WHERE cu.user_id IS NULL
    LOOP
        -- Générer un nom d'église
        church_name := COALESCE(
            user_record.raw_user_meta_data->>'full_name', 
            SPLIT_PART(user_record.email, '@', 1)
        );
        
        -- Créer l'église
        INSERT INTO churches (name, email)
        VALUES ('Église de ' || church_name, user_record.email)
        RETURNING id INTO new_church_id;
        
        -- Associer l'utilisateur comme propriétaire
        INSERT INTO church_users (church_id, user_id, role, permissions)
        VALUES (
            new_church_id, 
            user_record.id, 
            'owner',
            '{"members": ["view", "create", "edit", "delete"], "guests": ["view", "create", "edit", "delete"], "finances": ["view", "create", "edit", "delete"]}'::jsonb
        );
        
        RAISE NOTICE '✅ Église créée pour: % (ID église: %)', user_record.email, new_church_id;
    END LOOP;
    
    -- Vérifier s'il y a eu des créations
    IF NOT FOUND THEN
        RAISE NOTICE '✅ Tous les utilisateurs ont déjà une église';
    END IF;
END $$;

-- 3. VÉRIFICATION FINALE: Afficher à nouveau les utilisateurs
SELECT 
    au.id as user_id,
    au.email,
    cu.church_id,
    c.name as church_name,
    cu.role,
    '✅ CORRIGÉ' as status
FROM auth.users au
JOIN church_users cu ON au.id = cu.user_id
JOIN churches c ON cu.church_id = c.id
ORDER BY au.created_at DESC;
