-- ============================================================
-- PROJECTS — Projets d'une église
-- ============================================================

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id BIGINT REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2),
    collected_amount DECIMAL(15,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activation RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour projects
CREATE POLICY "Users can view projects of their church"
    ON public.projects FOR SELECT
    USING (church_id IN (
        SELECT church_id FROM public.church_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create projects for their church"
    ON public.projects FOR INSERT
    WITH CHECK (church_id IN (
        SELECT church_id FROM public.church_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update projects of their church"
    ON public.projects FOR UPDATE
    USING (church_id IN (
        SELECT church_id FROM public.church_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete projects of their church"
    ON public.projects FOR DELETE
    USING (church_id IN (
        SELECT church_id FROM public.church_users WHERE user_id = auth.uid()
    ));
