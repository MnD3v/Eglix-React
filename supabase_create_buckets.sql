-- ============================================================
-- STORAGE BUCKETS — Configuration des buckets de stockage
-- ============================================================

-- 1. Création des buckets de stockage s'ils n'existent pas
insert into storage.buckets (id, name, public)
values ('members', 'members', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('church-documents', 'church-documents', true)
on conflict (id) do nothing;

-- 2. Configuration de la sécurité (RLS) sur les objets de stockage
-- (Note : RLS est déjà activé par défaut sur la table storage.objects, pas besoin d'altérer la table)

-- Politiques pour le bucket 'members' (Avatars des membres)
drop policy if exists "Allow public read access on members" on storage.objects;
create policy "Allow public read access on members" on storage.objects
    for select using (bucket_id = 'members');

drop policy if exists "Allow authenticated uploads on members" on storage.objects;
create policy "Allow authenticated uploads on members" on storage.objects
    for insert with check (bucket_id = 'members' and auth.role() = 'authenticated');

drop policy if exists "Allow authenticated management on members" on storage.objects;
create policy "Allow authenticated management on members" on storage.objects
    for all using (bucket_id = 'members' and auth.role() = 'authenticated');

-- Politiques pour le bucket 'church-documents' (Fichiers & Documents paroissiaux)
drop policy if exists "Allow public read access on church-documents" on storage.objects;
create policy "Allow public read access on church-documents" on storage.objects
    for select using (bucket_id = 'church-documents');

drop policy if exists "Allow authenticated uploads on church-documents" on storage.objects;
create policy "Allow authenticated uploads on church-documents" on storage.objects
    for insert with check (bucket_id = 'church-documents' and auth.role() = 'authenticated');

drop policy if exists "Allow authenticated management on church-documents" on storage.objects;
create policy "Allow authenticated management on church-documents" on storage.objects
    for all using (bucket_id = 'church-documents' and auth.role() = 'authenticated');
