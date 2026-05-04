-- Ajouter la colonne description à la table churches
ALTER TABLE churches ADD COLUMN IF NOT EXISTS description text;
