create table shoot_days (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  day_number int not null,
  shoot_date date,
  call_time time,
  notes text,
  unique (project_id, day_number)
);

create table shots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  scene_id uuid references scenes(id) on delete set null,
  panel_id uuid references panels(id) on delete set null,
  shoot_day_id uuid references shoot_days(id) on delete set null,
  shot_number int,
  shoot_order numeric not null,
  int_ext int_ext,
  location text,
  shot_type shot_type,
  movement camera_movement,
  lens_mm smallint,
  description text,
  special_equip text,
  est_setup_min int,
  notes text,
  status shot_status not null default 'not_shot',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table shot_cast (
  shot_id uuid not null references shots(id) on delete cascade,
  character_id uuid not null references characters(id) on delete cascade,
  primary key (shot_id, character_id)
);
