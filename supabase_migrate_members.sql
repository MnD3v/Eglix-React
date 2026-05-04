-- Script pour migrer les membres existants vers la nouvelle église de l'utilisateur
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Vérifier la situation actuelle
SELECT 
    'Utilisateurs' as type,
    au.email,
    cu.church_id,
    c.name as church_name
FROM auth.users au
LEFT JOIN church_users cu ON au.id = cu.user_id
LEFT JOIN churches c ON cu.church_id = c.id
ORDER BY au.created_at DESC;

-- 2. Vérifier les membres orphelins (membres dont l'église n'est pas associée à un utilisateur actif)
SELECT 
    m.id,
    m.first_name,
    m.last_name,
    m.church_id,
    c.name as church_name,
    'Orphelin' as status
FROM members m
LEFT JOIN churches c ON m.church_id = c.id
LEFT JOIN church_users cu ON c.id = cu.church_id
WHERE cu.church_id IS NULL;

-- 3. Migrer TOUS les membres vers l'église de l'utilisateur connecté
-- IMPORTANT: Remplacez 'votre-email@example.com' par votre vrai email
/*
DO $$
DECLARE
    v_user_id uuid;
    v_new_church_id bigint;
    v_old_church_id bigint;
    v_members_count int;
BEGIN
    -- Récupérer l'ID de l'utilisateur et son église
    SELECT au.id, cu.church_id 
    INTO v_user_id, v_new_church_id
    FROM auth.users au
    JOIN church_users cu ON au.id = cu.user_id
    WHERE au.email = 'votre-email@example.com'
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non trouvé';
    END IF;
    
    IF v_new_church_id IS NULL THEN
        RAISE EXCEPTION 'Aucune église trouvée pour cet utilisateur';
    END IF;
    
    -- Migrer tous les membres qui ne sont pas déjà dans cette église
    UPDATE members 
    SET church_id = v_new_church_id
    WHERE church_id != v_new_church_id;
    
    GET DIAGNOSTICS v_members_count = ROW_COUNT;
    
    RAISE NOTICE 'Migration terminée: % membres migrés vers l''église % (ID: %)', 
                 v_members_count, 
                 (SELECT name FROM churches WHERE id = v_new_church_id),
                 v_new_church_id;
END $$;
*/

-- 4. Alternative: Migrer uniquement les membres orphelins
-- IMPORTANT: Remplacez 'votre-email@example.com' par votre vrai email
/*
DO $$
DECLARE
    v_user_id uuid;
    v_new_church_id bigint;
    v_members_count int;
BEGIN
    -- Récupérer l'ID de l'utilisateur et son église
    SELECT au.id, cu.church_id 
    INTO v_user_id, v_new_church_id
    FROM auth.users au
    JOIN church_users cu ON au.id = cu.user_id
    WHERE au.email = 'votre-email@example.com'
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non trouvé';
    END IF;
    
    IF v_new_church_id IS NULL THEN
        RAISE EXCEPTION 'Aucune église trouvée pour cet utilisateur';
    END IF;
    
    -- Migrer uniquement les membres orphelins
    UPDATE members m
    SET church_id = v_new_church_id
    FROM churches c
    LEFT JOIN church_users cu ON c.id = cu.church_id
    WHERE m.church_id = c.id
    AND cu.church_id IS NULL;
    
    GET DIAGNOSTICS v_members_count = ROW_COUNT;
    
    RAISE NOTICE 'Migration terminée: % membres orphelins migrés vers l''église % (ID: %)', 
                 v_members_count, 
                 (SELECT name FROM churches WHERE id = v_new_church_id),
                 v_new_church_id;
END $$;
*/
