-- Ajout d'un champ donor_name sur la table tithes
-- Permet d'enregistrer des dîmes de personnes non-membres (nom libre)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tithes' and column_name = 'donor_name'
  ) then
    alter table public.tithes add column donor_name text;
  end if;
end $$;
