-- Migration script to add missing features for public member registration
-- Run this in Supabase SQL Editor

-- 1. Add logo_url column to churches if it doesn't exist
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'churches' and column_name = 'logo_url') then
    alter table churches add column logo_url text;
  end if;
end $$;

-- 2. Add public read policy for churches (for registration page)
drop policy if exists "Public can view basic church info" on churches;
create policy "Public can view basic church info" on churches
  for select using ( true );

-- 3. Create or replace the RPC function for public member registration
create or replace function register_member_via_link(
  p_church_id bigint,
  p_first_name text,
  p_last_name text,
  p_gender text,
  p_marital_status text default null,
  p_birth_date date default null,
  p_email text default null,
  p_phone text default null,
  p_address text default null,
  p_function text default null,
  p_joined_at date default null,
  p_baptized_at date default null,
  p_baptism_responsible text default null,
  p_notes text default null,
  p_photo_url text default null
)
returns json
language plpgsql
security definer -- Bypass RLS
as $$
declare
  new_member_id bigint;
begin
  -- Validate inputs
  if p_first_name is null or p_last_name is null then
    raise exception 'First name and last name are required';
  end if;

  -- Insert member with status 'pending' (en attente de validation par l'admin)
  insert into members (
    church_id, first_name, last_name, gender, marital_status, 
    birth_date, email, phone, address, function, 
    joined_at, baptized_at, baptism_responsible, notes, photo_url, status
  )
  values (
    p_church_id, p_first_name, p_last_name, p_gender, p_marital_status,
    p_birth_date, p_email, p_phone, p_address, p_function,
    p_joined_at, p_baptized_at, p_baptism_responsible, p_notes, p_photo_url, 'pending'
  )
  returning id into new_member_id;

  return json_build_object('id', new_member_id, 'success', true);
end;
$$;
