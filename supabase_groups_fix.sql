-- Correctif : remplace la politique group_members qui accédait à auth.users
-- Exécute ce script dans le SQL Editor de Supabase

drop policy if exists "Users can view group members" on group_members;

create policy "Users can view group members" on group_members
  for select using (
    exists (
      select 1 from groups g
      join church_users cu on cu.church_id = g.church_id
      where g.id = group_members.group_id
      and cu.user_id = auth.uid()
      and (
        cu.role in ('admin', 'owner')
        or exists (
          select 1 from group_permissions gp
          where gp.group_id = group_members.group_id
          and gp.member_id = (
            select m.id from members m
            where m.church_id = g.church_id
            and m.email = auth.email()
            limit 1
          )
          and gp.can_view = true
        )
      )
    )
  );
