alter table projects
  add column if not exists format text,
  add column if not exists genres text[] not null default '{}';

-- make thumbnails publicly accessible so cards can display them via URL
update storage.buckets set public = true where id = 'thumbnails';
