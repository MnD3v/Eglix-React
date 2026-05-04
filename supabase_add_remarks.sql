-- Ajouter la colonne remarks à la table members pour stocker l'historique des remarques
ALTER TABLE members ADD COLUMN IF NOT EXISTS remarks jsonb DEFAULT '[]'::jsonb;

-- Structure d'une remarque dans le tableau JSON :
-- {
--   "id": "uuid",
--   "type": "spiritual" | "social" | "administrative" | "other",
--   "content": "texte de la remarque",
--   "created_at": "2024-01-20T10:30:00Z",
--   "created_by": "user_id ou nom"
-- }
