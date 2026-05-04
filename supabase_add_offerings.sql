-- 1. Création de la table offerings
CREATE TABLE IF NOT EXISTS public.offerings (
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
CREATE INDEX IF NOT EXISTS idx_offerings_church_id ON public.offerings(church_id);
CREATE INDEX IF NOT EXISTS idx_offerings_member_id ON public.offerings(member_id);
CREATE INDEX IF NOT EXISTS idx_offerings_date ON public.offerings(date);
CREATE INDEX IF NOT EXISTS idx_offerings_payment_method ON public.offerings(payment_method);

-- 3. Activer Row Level Security (RLS)
ALTER TABLE public.offerings ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
CREATE POLICY "Users can view offerings from their churches" ON public.offerings
    FOR SELECT
    USING (church_id IN (SELECT church_id FROM public.church_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert offerings to their churches" ON public.offerings
    FOR INSERT
    WITH CHECK (church_id IN (SELECT church_id FROM public.church_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can update offerings from their churches" ON public.offerings
    FOR UPDATE
    USING (church_id IN (SELECT church_id FROM public.church_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete offerings from their churches" ON public.offerings
    FOR DELETE
    USING (church_id IN (SELECT church_id FROM public.church_users WHERE user_id = auth.uid()));

-- 5. Créer le trigger pour updated_at (utilise la fonction existante des dîmes)
DROP TRIGGER IF EXISTS update_offerings_updated_at ON public.offerings;
CREATE TRIGGER update_offerings_updated_at
    BEFORE UPDATE ON public.offerings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
