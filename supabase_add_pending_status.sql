-- Modifier la contrainte de statut pour inclure 'pending'
-- D'abord, supprimer l'ancienne contrainte
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_status_check;

-- Ajouter la nouvelle contrainte avec 'pending'
ALTER TABLE members ADD CONSTRAINT members_status_check 
CHECK (status IN ('active', 'inactive', 'archived', 'pending'));
