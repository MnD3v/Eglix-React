-- Ajouter les colonnes d'abonnement à la table churches
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'churches' and column_name = 'subscription_status') then
    alter table churches add column subscription_status text default 'inactive' check (subscription_status in ('active', 'inactive', 'trial'));
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'churches' and column_name = 'subscription_plan') then
    alter table churches add column subscription_plan text default 'free';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'churches' and column_name = 'subscription_end_date') then
    alter table churches add column subscription_end_date timestamp with time zone;
  end if;
end $$;

-- ----------------------------------------------------
-- COMMENT TESTER LA REDIRECTION ?
-- ----------------------------------------------------
-- Par défaut, le script ci-dessus définit toutes les nouvelles églises
-- et les églises existantes sur 'inactive'.
-- Cela va déclencher la redirection vers /subscription.
--
-- Pour réactiver manuellement une église (remplacez ID par l'id de votre église) :
-- UPDATE churches SET subscription_status = 'active' WHERE id = 1;
-- ----------------------------------------------------
