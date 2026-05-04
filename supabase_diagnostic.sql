-- Script de diagnostic et correction pour les problèmes RLS
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Vérifier les utilisateurs et leurs églises
SELECT 
    au.id as user_id,
    au.email,
    cu.church_id,
    c.name as church_name,
    cu.role
FROM auth.users au
LEFT JOIN church_users cu ON au.id = cu.user_id
LEFT JOIN churches c ON cu.church_id = c.id
ORDER BY au.created_at DESC;

-- 2. Si vous voyez votre email mais church_id est NULL, cela signifie que vous n'êtes pas associé à une église
-- Dans ce cas, vous devez créer une église et vous y associer

-- Exemple pour créer une église et s'y associer (REMPLACEZ 'votre-email@example.com' par votre vrai email):
/*
DO $$
DECLARE
    v_user_id uuid;
    v_church_id bigint;
BEGIN
    -- Récupérer l'ID de l'utilisateur
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'votre-email@example.com';
    
    -- Créer une église si elle n'existe pas
    INSERT INTO churches (name, address, phone, email)
    VALUES ('Mon Église', '123 Rue Example', '01 23 45 67 89', 'contact@eglise.com')
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_church_id;
    
    -- Si l'église existait déjà, récupérer son ID
    IF v_church_id IS NULL THEN
        SELECT id INTO v_church_id FROM churches LIMIT 1;
    END IF;
    
    -- Associer l'utilisateur à l'église comme propriétaire
    INSERT INTO church_users (church_id, user_id, role, permissions)
    VALUES (v_church_id, v_user_id, 'owner', '{"members": ["view", "create", "edit", "delete"]}'::jsonb)
    ON CONFLICT (church_id, user_id) DO NOTHING;
    
    RAISE NOTICE 'Utilisateur % associé à l''église % (ID: %)', v_user_id, v_church_id, v_church_id;
END $$;
*/
