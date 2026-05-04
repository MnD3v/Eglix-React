-- Allow users to update churches they belong to
create policy "Users can update their own churches" on churches
  for update using (
    exists (
      select 1 from church_users cu
      where cu.church_id = churches.id
      and cu.user_id = auth.uid()
    )
  );
