create table scenes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  position numeric not null,
  scene_number text not null,
  int_ext int_ext,
  location text,
  time_of_day time_of_day,
  act smallint check (act between 1 and 3),
  page_start numeric,
  length_eighths smallint default 0,
  props text[] not null default '{}',
  special_reqs text[] not null default '{}',
  emotional_tone text,
  needs_review boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, scene_number)
);

create table screenplay_elements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  scene_id uuid references scenes(id) on delete cascade,
  element_type element_type not null,
  content text not null default '',
  position numeric not null,
  character_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table script_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  element_id uuid not null references screenplay_elements(id) on delete cascade,
  note_type note_type not null,
  content text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table drafts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  version_number int not null,
  name text,
  snapshot jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (project_id, version_number)
);
