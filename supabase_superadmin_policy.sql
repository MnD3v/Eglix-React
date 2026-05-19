-- -----------------------------------------------------------------------------
-- SCRIPT DE SECURITE SUPER-ADMIN (em.djatika@gmail.com)
-- -----------------------------------------------------------------------------

-- 1. Autoriser le SuperAdmin à voir toutes les églises
DROP POLICY IF EXISTS "Superadmin can view all churches" ON churches;
CREATE POLICY "Superadmin can view all churches" ON churches
  FOR SELECT USING ( auth.jwt() ->> 'email' = 'em.djatika@gmail.com' );

-- 2. Autoriser le SuperAdmin à modifier toutes les églises
DROP POLICY IF EXISTS "Superadmin can update all churches" ON churches;
CREATE POLICY "Superadmin can update all churches" ON churches
  FOR UPDATE USING ( auth.jwt() ->> 'email' = 'em.djatika@gmail.com' );

-- Note : Assurez-vous que la politique de création/modification existante
-- ne crée pas de conflit, mais les politiques dans Postgres "s'additionnent" (OR),
-- donc cela devrait simplement élargir les droits pour cet utilisateur spécifique.
