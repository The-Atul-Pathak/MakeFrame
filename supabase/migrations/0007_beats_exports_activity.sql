create table beats (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  beat_index smallint not null check (beat_index between 1 and 15),
  beat_key text not null,
  label text not null,
  target_page_min numeric,
  target_page_max numeric,
  assigned_scene_id uuid references scenes(id) on delete set null,
  description text,
  unique (project_id, beat_index),
  unique (project_id, beat_key)
);

create table exports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  export_type export_type not null,
  status export_status not null default 'pending',
  file_url text,
  requested_by uuid references auth.users(id),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  item_type text not null,
  item_id uuid not null,
  action text not null,
  occurred_at timestamptz not null default now()
);
