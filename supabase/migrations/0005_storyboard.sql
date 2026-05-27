create table panels (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  scene_id uuid not null references scenes(id) on delete cascade,
  panel_number numeric not null,
  sketch_url text,
  shot_type shot_type,
  camera_movement camera_movement,
  lens_mm smallint,
  action_desc text,
  dialogue_note text,
  duration_sec numeric,
  tags panel_tag[] not null default '{}',
  linked_element_id uuid references screenplay_elements(id) on delete set null,
  needs_review boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scene_id, panel_number)
);
