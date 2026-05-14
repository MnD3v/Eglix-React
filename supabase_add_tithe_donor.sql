
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tithes' and column_name = 'donor_name'
  ) then
    alter table public.tithes add column donor_name text;
  end if;
end $$;
