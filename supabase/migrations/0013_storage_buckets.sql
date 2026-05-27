insert into storage.buckets (id, name, public)
values
  ('sketches', 'sketches', false),
  ('thumbnails', 'thumbnails', false),
  ('exports', 'exports', false)
on conflict (id) do nothing;

create policy storage_sketches_select_access on storage.objects
  for select using (
    bucket_id = 'sketches'
    and has_project_access(((storage.foldername(name))[1])::uuid)
  );

create policy storage_sketches_insert_editor on storage.objects
  for insert with check (
    bucket_id = 'sketches'
    and can_edit_project(((storage.foldername(name))[1])::uuid)
  );

create policy storage_sketches_update_editor on storage.objects
  for update using (
    bucket_id = 'sketches'
    and can_edit_project(((storage.foldername(name))[1])::uuid)
  ) with check (
    bucket_id = 'sketches'
    and can_edit_project(((storage.foldername(name))[1])::uuid)
  );

create policy storage_sketches_delete_editor on storage.objects
  for delete using (
    bucket_id = 'sketches'
    and can_edit_project(((storage.foldername(name))[1])::uuid)
  );

create policy storage_thumbnails_select_access on storage.objects
  for select using (
    bucket_id = 'thumbnails'
    and has_project_access(((storage.foldername(name))[1])::uuid)
  );

create policy storage_thumbnails_insert_editor on storage.objects
  for insert with check (
    bucket_id = 'thumbnails'
    and can_edit_project(((storage.foldername(name))[1])::uuid)
  );

create policy storage_thumbnails_update_editor on storage.objects
  for update using (
    bucket_id = 'thumbnails'
    and can_edit_project(((storage.foldername(name))[1])::uuid)
  ) with check (
    bucket_id = 'thumbnails'
    and can_edit_project(((storage.foldername(name))[1])::uuid)
  );

create policy storage_thumbnails_delete_editor on storage.objects
  for delete using (
    bucket_id = 'thumbnails'
    and can_edit_project(((storage.foldername(name))[1])::uuid)
  );

create policy storage_exports_select_access on storage.objects
  for select using (
    bucket_id = 'exports'
    and has_project_access(((storage.foldername(name))[1])::uuid)
  );

create policy storage_exports_insert_editor on storage.objects
  for insert with check (
    bucket_id = 'exports'
    and can_edit_project(((storage.foldername(name))[1])::uuid)
  );

create policy storage_exports_update_editor on storage.objects
  for update using (
    bucket_id = 'exports'
    and can_edit_project(((storage.foldername(name))[1])::uuid)
  ) with check (
    bucket_id = 'exports'
    and can_edit_project(((storage.foldername(name))[1])::uuid)
  );

create policy storage_exports_delete_editor on storage.objects
  for delete using (
    bucket_id = 'exports'
    and can_edit_project(((storage.foldername(name))[1])::uuid)
  );
