-- Script pour créer la table des dîmes (tithes)
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Créer la table tithes
CREATE TABLE IF NOT EXISTS public.tithes (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
    member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'mobile', 'bank', 'check')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_tithes_church_id ON public.tithes(church_id);
CREATE INDEX IF NOT EXISTS idx_tithes_member_id ON public.tithes(member_id);
CREATE INDEX IF NOT EXISTS idx_tithes_date ON public.tithes(date);
CREATE INDEX IF NOT EXISTS idx_tithes_payment_method ON public.tithes(payment_method);

-- 3. Activer Row Level Security (RLS)
ALTER TABLE public.tithes ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
-- Politique pour SELECT: Les utilisateurs peuvent voir les dîmes de leurs églises
CREATE POLICY "Users can view tithes from their churches" ON public.tithes
    FOR SELECT
    USING (
        church_id IN (
            SELECT church_id FROM public.church_users WHERE user_id = auth.uid()
        )
    );

-- Politique pour INSERT: Les utilisateurs peuvent ajouter des dîmes à leurs églises
CREATE POLICY "Users can insert tithes to their churches" ON public.tithes
    FOR INSERT
    WITH CHECK (
        church_id IN (
            SELECT church_id FROM public.church_users WHERE user_id = auth.uid()
        )
    );

-- Politique pour UPDATE: Les utilisateurs peuvent modifier les dîmes de leurs églises
CREATE POLICY "Users can update tithes from their churches" ON public.tithes
    FOR UPDATE
    USING (
        church_id IN (
            SELECT church_id FROM public.church_users WHERE user_id = auth.uid()
        )
    );

-- Politique pour DELETE: Les utilisateurs peuvent supprimer les dîmes de leurs églises
CREATE POLICY "Users can delete tithes from their churches" ON public.tithes
    FOR DELETE
    USING (
        church_id IN (
            SELECT church_id FROM public.church_users WHERE user_id = auth.uid()
        )
    );

-- 5. Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_tithes_updated_at ON public.tithes;
CREATE TRIGGER update_tithes_updated_at
    BEFORE UPDATE ON public.tithes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Ajouter quelques données de test (optionnel)
-- Décommentez les lignes ci-dessous si vous voulez ajouter des données de test
/*
INSERT INTO public.tithes (church_id, member_id, amount, date, payment_method, description)
VALUES 
    (1, 1, 50000, '2026-01-15', 'cash', 'Dîme du dimanche'),
    (1, 2, 75000, '2026-01-15', 'mobile', 'Dîme via Mobile Money'),
    (1, NULL, 100000, '2026-01-08', 'bank', 'Dîme anonyme par virement');
*/

-- Vérifier que tout est bien créé
SELECT 
    'Table tithes créée avec succès!' as message,
    COUNT(*) as nombre_de_dimes
FROM public.tithes;
