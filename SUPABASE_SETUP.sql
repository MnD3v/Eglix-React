-- ============================================
-- SCRIPTS SQL À EXÉCUTER DANS SUPABASE
-- Ordre d'exécution recommandé
-- ============================================

-- 1. CRITIQUE : Ajouter la colonne visit_type pour les invités
-- Sans cela, l'ajout/modification d'invités ne fonctionne pas
ALTER TABLE guests ADD COLUMN IF NOT EXISTS visit_type text DEFAULT 'first' CHECK (visit_type IN ('first', 'second', 'third', 'regular'));

-- 2. CRITIQUE : Permettre la mise à jour des informations d'église
-- Sans cela, la page Paramètres ne peut pas sauvegarder les modifications
CREATE POLICY IF NOT EXISTS "Users can update their own churches" ON churches
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM church_users cu
      WHERE cu.church_id = churches.id
      AND cu.user_id = auth.uid()
    )
  );

-- 3. OPTIONNEL : Ajouter la colonne website si elle n'existe pas
ALTER TABLE churches ADD COLUMN IF NOT EXISTS website text;

-- 4. OPTIONNEL : Ajouter la colonne description si elle n'existe pas
ALTER TABLE churches ADD COLUMN IF NOT EXISTS description text;

-- 5. OPTIONNEL : Ajouter la colonne remarks pour les membres si elle n'existe pas
ALTER TABLE members ADD COLUMN IF NOT EXISTS remarks text;

-- 6. OPTIONNEL : S'assurer que le statut 'pending' est autorisé pour les membres
-- Vérifier d'abord si la contrainte existe, sinon l'ajouter
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'members_status_check'
    ) THEN
        ALTER TABLE members ADD CONSTRAINT members_status_check 
        CHECK (status IN ('active', 'inactive', 'pending'));
    END IF;
END $$;

-- ============================================
-- VÉRIFICATION POST-EXÉCUTION
-- ============================================
-- Exécutez ces requêtes pour vérifier que tout est en place :

-- Vérifier les colonnes de la table guests
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'guests' 
ORDER BY ordinal_position;

-- Vérifier les colonnes de la table churches
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'churches' 
ORDER BY ordinal_position;

-- Vérifier les politiques RLS sur churches
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'churches';

-- Vérifier les colonnes de la table members
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'members' 
ORDER BY ordinal_position;
