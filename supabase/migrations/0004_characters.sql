create table characters (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  age text,
  occupation text,
  physical_desc text,
  backstory text,
  want text,
  need text,
  wound text,
  ghost text,
  voice_notes text,
  arc_start text,
  arc_end text,
  first_appearance_scene_id uuid references scenes(id) on delete set null,
  is_stub boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table scene_characters (
  scene_id uuid not null references scenes(id) on delete cascade,
  character_id uuid not null references characters(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  primary key (scene_id, character_id)
);

create table character_relationships (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  character_a uuid not null references characters(id) on delete cascade,
  character_b uuid not null references characters(id) on delete cascade,
  rel_type relationship_type not null,
  note text,
  created_at timestamptz not null default now(),
  check (character_a <> character_b),
  unique (project_id, character_a, character_b)
);
