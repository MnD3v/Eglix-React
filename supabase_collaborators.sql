-- ======================================================================
-- SYSTEME DE GESTION DES COLLABORATEURS ET AUTORISATIONS
-- Exécutez ce script dans l'éditeur SQL de Supabase pour configurer la base.
-- ======================================================================

-- 1. Assurer une relation claire entre church_users et profiles pour faciliter les jointures PostgREST
DO $$ 
BEGIN 
  -- Tente d'ajouter la contrainte si elle n'existe pas
  -- (On ne supprime pas l'ancienne pour éviter des verrous bloquants, mais PostgreSQL autorise plusieurs FK sur le même champ)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'church_users_user_id_profiles_fkey'
  ) THEN
    ALTER TABLE public.church_users 
    ADD CONSTRAINT church_users_user_id_profiles_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Fonctions Security Definer pour contourner la récursion infinie de RLS sur la table church_users

-- Fonction pour vérifier si l'utilisateur authentifié est l'Admin ou le Propriétaire de l'église
CREATE OR REPLACE FUNCTION public.check_is_church_admin(p_church_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Exécuté en tant que super-utilisateur pour contourner RLS
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM church_users 
    WHERE church_id = p_church_id 
    AND user_id = auth.uid() 
    AND (role = 'owner' OR role = 'admin')
  );
END;
$$;

-- Fonction pour vérifier si l'utilisateur authentifié est un membre de l'église
CREATE OR REPLACE FUNCTION public.check_is_church_member(p_church_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM church_users 
    WHERE church_id = p_church_id 
    AND user_id = auth.uid()
  );
END;
$$;

-- 2. Nettoyage des anciennes politiques sur church_users si existantes (pour éviter les doublons/erreurs)
DROP POLICY IF EXISTS "Users can view their own church memberships" ON public.church_users;
DROP POLICY IF EXISTS "Users can view their own church associations" ON public.church_users;
DROP POLICY IF EXISTS "Users can insert their own church association" ON public.church_users;
DROP POLICY IF EXISTS "Admins can manage church users" ON public.church_users;
DROP POLICY IF EXISTS "Members can view other church users" ON public.church_users;

-- 3. Nouvelles politiques RLS robustes pour church_users

-- Permet à tout utilisateur d'insérer sa propre association 
-- (Nécessaire lors de la création d'une nouvelle église)
CREATE POLICY "Users can insert their own association"
ON public.church_users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Permet aux membres d'une église de voir la liste de tous les membres/collaborateurs de cette église
CREATE POLICY "Members can view other church users"
ON public.church_users
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  public.check_is_church_member(church_id)
);

-- Permet aux Administrateurs et Propriétaires de gérer les permissions, ajouter et supprimer des collaborateurs
CREATE POLICY "Admins can manage church users"
ON public.church_users
FOR ALL
TO authenticated
USING ( public.check_is_church_admin(church_id) )
WITH CHECK ( public.check_is_church_admin(church_id) );

-- Informez l'utilisateur du succès de l'exécution
COMMENT ON FUNCTION public.check_is_church_admin IS 'Vérifie si l''utilisateur actuel a un rôle administratif dans l''église donnée.';
COMMENT ON FUNCTION public.check_is_church_member IS 'Vérifie si l''utilisateur actuel fait partie de l''église donnée.';
