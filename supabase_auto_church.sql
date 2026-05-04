-- Script pour créer automatiquement une église lors de l'inscription
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Fonction pour créer une église par défaut et associer l'utilisateur
create or replace function public.handle_new_user_church() 
returns trigger as $$
declare
  new_church_id bigint;
  church_name text;
begin
  -- Générer un nom d'église par défaut basé sur le nom de l'utilisateur
  church_name := coalesce(new.raw_user_meta_data->>'church_name', 'Église de ' || coalesce(new.raw_user_meta_data->>'full_name', 'Mon Église'));
  
  -- Créer une nouvelle église
  insert into public.churches (name, email)
  values (church_name, new.email)
  returning id into new_church_id;
  
  -- Associer l'utilisateur à cette église en tant que propriétaire
  insert into public.church_users (church_id, user_id, role, permissions)
  values (
    new_church_id, 
    new.id, 
    'owner', 
    '{"members": ["view", "create", "edit", "delete"], "guests": ["view", "create", "edit", "delete"], "finances": ["view", "create", "edit", "delete"]}'::jsonb
  );
  
  return new;
end;
$$ language plpgsql security definer;

-- 2. Créer le trigger (supprimer l'ancien s'il existe)
drop trigger if exists on_auth_user_created_church on auth.users;
create trigger on_auth_user_created_church
  after insert on auth.users
  for each row execute procedure public.handle_new_user_church();

-- 3. Pour les utilisateurs existants qui n'ont pas d'église, en créer une
do $$
declare
  user_record record;
  new_church_id bigint;
  church_name text;
begin
  for user_record in 
    select au.id, au.email, au.raw_user_meta_data
    from auth.users au
    left join church_users cu on au.id = cu.user_id
    where cu.user_id is null
  loop
    -- Générer un nom d'église
    church_name := coalesce(user_record.raw_user_meta_data->>'full_name', 'Mon Église');
    
    -- Créer l'église
    insert into churches (name, email)
    values ('Église de ' || church_name, user_record.email)
    returning id into new_church_id;
    
    -- Associer l'utilisateur
    insert into church_users (church_id, user_id, role, permissions)
    values (
      new_church_id, 
      user_record.id, 
      'owner',
      '{"members": ["view", "create", "edit", "delete"], "guests": ["view", "create", "edit", "delete"], "finances": ["view", "create", "edit", "delete"]}'::jsonb
    );
    
    raise notice 'Église créée pour l''utilisateur %', user_record.email;
  end loop;
end $$;
