create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  logline text,
  director_name text,
  dp_name text,
  draft_number int not null default 1,
  last_tool tool_kind not null default 'screenplay',
  last_scene_id uuid,
  thumbnail_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_opened_at timestamptz not null default now()
);

create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  invited_email text not null,
  role project_role not null default 'viewer',
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (project_id, invited_email),
  unique (project_id, user_id)
);
