-- Création de la table offering_types
CREATE TABLE IF NOT EXISTS public.offering_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id BIGINT REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activation RLS
ALTER TABLE public.offering_types ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour offering_types
CREATE POLICY "Users can view offering types of their church"
    ON public.offering_types FOR SELECT
    USING (church_id IN (
        SELECT church_id FROM public.church_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create offering types for their church"
    ON public.offering_types FOR INSERT
    WITH CHECK (church_id IN (
        SELECT church_id FROM public.church_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update offering types of their church"
    ON public.offering_types FOR UPDATE
    USING (church_id IN (
        SELECT church_id FROM public.church_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete offering types of their church"
    ON public.offering_types FOR DELETE
    USING (church_id IN (
        SELECT church_id FROM public.church_users WHERE user_id = auth.uid()
    ));

-- Ajout de la colonne offering_type_id à la table offerings
-- (Note : Assure-toi d'avoir d'abord exécuté supabase_add_offerings.sql)
ALTER TABLE public.offerings
ADD COLUMN IF NOT EXISTS offering_type_id UUID REFERENCES public.offering_types(id) ON DELETE SET NULL;
