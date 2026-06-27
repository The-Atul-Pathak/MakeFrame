-- Screenplay / storyboard / shot list / character persistence support.
--
-- This migration is intentionally incremental. Earlier migrations already
-- created the first-generation tables, so this file adds the app-facing shape
-- used by the Zustand stores without dropping existing data.

-- ── Scenes ───────────────────────────────────────────────────────────────────

alter table scenes add column if not exists number integer;
alter table scenes add column if not exists page_length text;
alter table scenes add column if not exists characters text[] not null default '{}';
alter table scenes add column if not exists special_requirements text[] not null default '{}';

update scenes
set
  number = coalesce(number, nullif(regexp_replace(scene_number, '\D', '', 'g'), '')::integer, position::integer, 1),
  location = coalesce(nullif(location, ''), 'LOCATION'),
  time_of_day = coalesce(time_of_day, 'DAY'),
  act = coalesce(act, 1),
  page_start = coalesce(page_start, 1),
  page_length = coalesce(page_length, case
    when coalesce(length_eighths, 1) >= 8 and coalesce(length_eighths, 1) % 8 = 0 then (coalesce(length_eighths, 1) / 8)::text
    when coalesce(length_eighths, 1) > 8 then ((coalesce(length_eighths, 1) / 8)::integer)::text || ' ' || (coalesce(length_eighths, 1) % 8)::text || '/8'
    else coalesce(length_eighths, 1)::text || '/8'
  end),
  special_requirements = coalesce(special_requirements, special_reqs, '{}');

alter table scenes alter column number set not null;
alter table scenes alter column int_ext set default 'INT';
alter table scenes alter column int_ext set not null;
alter table scenes alter column location set default 'LOCATION';
alter table scenes alter column location set not null;
alter table scenes alter column time_of_day set default 'DAY';
alter table scenes alter column time_of_day set not null;
alter table scenes alter column act set default 1;
alter table scenes alter column act set not null;
alter table scenes alter column page_start set default 1;
alter table scenes alter column page_start set not null;
alter table scenes alter column page_length set default '1/8';
alter table scenes alter column page_length set not null;
alter table scenes alter column position set default 0;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'scenes_number_positive') then
    alter table scenes add constraint scenes_number_positive check (number > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'scenes_act_valid') then
    alter table scenes add constraint scenes_act_valid check (act in (1,2,3));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'scenes_page_start_positive') then
    alter table scenes add constraint scenes_page_start_positive check (page_start > 0);
  end if;
end $$;

create or replace function normalize_scene_for_app()
returns trigger
language plpgsql
as $$
begin
  new.number = coalesce(new.number, nullif(regexp_replace(coalesce(new.scene_number, ''), '\D', '', 'g'), '')::integer, 1);
  new.scene_number = coalesce(nullif(new.scene_number, ''), new.number::text);
  new.position = coalesce(new.position, new.number);
  new.location = coalesce(nullif(new.location, ''), 'LOCATION');
  new.time_of_day = coalesce(new.time_of_day, 'DAY');
  new.act = coalesce(new.act, 1);
  new.page_start = coalesce(new.page_start, 1);
  new.page_length = coalesce(new.page_length, '1/8');
  new.special_reqs = coalesce(new.special_reqs, new.special_requirements, '{}');
  new.special_requirements = coalesce(new.special_requirements, new.special_reqs, '{}');
  return new;
end;
$$;

drop trigger if exists scenes_normalize_for_app on scenes;
create trigger scenes_normalize_for_app
  before insert or update on scenes
  for each row execute function normalize_scene_for_app();

-- ── Screenplay elements ───────────────────────────────────────────────────────

alter table screenplay_elements add column if not exists "order" integer;
alter table screenplay_elements add column if not exists type text;
alter table screenplay_elements add column if not exists text text;

update screenplay_elements
set
  "order" = coalesce("order", position::integer, 1),
  type = coalesce(type, case element_type::text
    when 'scene_heading' then 'scene-heading'
    else element_type::text
  end),
  text = coalesce(text, content, '');

alter table screenplay_elements alter column "order" set default 1;
alter table screenplay_elements alter column "order" set not null;
alter table screenplay_elements alter column type set default 'action';
alter table screenplay_elements alter column type set not null;
alter table screenplay_elements alter column text set default '';
alter table screenplay_elements alter column text set not null;
alter table screenplay_elements alter column position set default 1;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'screenplay_elements_order_positive') then
    alter table screenplay_elements add constraint screenplay_elements_order_positive check ("order" > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'screenplay_elements_type_valid') then
    alter table screenplay_elements add constraint screenplay_elements_type_valid check (type in ('scene-heading','action','character','parenthetical','dialogue','transition'));
  end if;
end $$;

create or replace function normalize_screenplay_element_for_app()
returns trigger
language plpgsql
as $$
begin
  if new.project_id is null and new.scene_id is not null then
    select project_id into new.project_id from scenes where id = new.scene_id;
  end if;

  new."order" = coalesce(new."order", new.position::integer, 1);
  new.position = coalesce(new.position, new."order");
  new.type = coalesce(new.type, case new.element_type::text when 'scene_heading' then 'scene-heading' else new.element_type::text end, 'action');
  new.text = coalesce(new.text, new.content, '');
  new.content = coalesce(new.content, new.text, '');
  new.element_type = case new.type
    when 'scene-heading' then 'scene_heading'::element_type
    else replace(new.type, '-', '_')::element_type
  end;

  return new;
end;
$$;

drop trigger if exists screenplay_elements_normalize_for_app on screenplay_elements;
create trigger screenplay_elements_normalize_for_app
  before insert or update on screenplay_elements
  for each row execute function normalize_screenplay_element_for_app();

-- ── Storyboard panels ─────────────────────────────────────────────────────────

create table if not exists storyboard_panels (
  id                  uuid primary key default gen_random_uuid(),
  scene_id            uuid not null references scenes(id) on delete cascade,
  number              integer not null check (number > 0),
  shot_type           text not null default 'MS'
                        check (shot_type in ('EWS','WS','MS','MCU','CU','ECU','OTS','POV','INSERT','TWO')),
  movement            text not null default 'Static'
                        check (movement in ('Static','Pan','Tilt','Dolly','Track','Crane/Jib','Handheld','Steadicam','Rack Focus','Zoom')),
  lens                integer not null default 50 check (lens > 0),
  action_description  text not null default '',
  dialogue_note       text not null default '',
  duration_estimate   integer not null default 5 check (duration_estimate > 0),
  sketch_storage_path text,
  needs_review        boolean not null default false,
  beat_id             uuid references beats(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (scene_id, number)
);

alter table storyboard_panels enable row level security;

-- ── Shots ─────────────────────────────────────────────────────────────────────

alter table shots add column if not exists lens integer;
alter table shots add column if not exists "cast" text[] not null default '{}';
alter table shots add column if not exists special_equipment text not null default '';
alter table shots add column if not exists estimated_setup_minutes integer not null default 15;
alter table shots add column if not exists needs_review boolean not null default false;

update shots
set
  shot_number = coalesce(shot_number, shoot_order::integer, 1),
  int_ext = coalesce(int_ext, 'INT'),
  location = coalesce(location, ''),
  shot_type = coalesce(shot_type, 'MS'),
  movement = coalesce(movement, 'static'),
  lens = coalesce(lens, lens_mm::integer, 50),
  description = coalesce(description, ''),
  special_equipment = coalesce(special_equipment, special_equip, ''),
  estimated_setup_minutes = coalesce(estimated_setup_minutes, est_setup_min, 15),
  notes = coalesce(notes, '');

alter table shots alter column shot_number set default 1;
alter table shots alter column shot_number set not null;
alter table shots alter column int_ext set default 'INT';
alter table shots alter column int_ext set not null;
alter table shots alter column location set default '';
alter table shots alter column location set not null;
alter table shots alter column shot_type set default 'MS';
alter table shots alter column shot_type set not null;
alter table shots alter column movement set default 'static';
alter table shots alter column movement set not null;
alter table shots alter column lens set default 50;
alter table shots alter column lens set not null;
alter table shots alter column description set default '';
alter table shots alter column description set not null;
alter table shots alter column special_equipment set default '';
alter table shots alter column special_equipment set not null;
alter table shots alter column estimated_setup_minutes set default 15;
alter table shots alter column estimated_setup_minutes set not null;
alter table shots alter column notes set default '';
alter table shots alter column notes set not null;
alter table shots alter column shoot_order set default 1;

alter table shots drop constraint if exists shots_panel_id_fkey;
alter table shots
  add constraint shots_panel_id_fkey
  foreign key (panel_id) references storyboard_panels(id) on delete set null
  not valid;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'shots_shot_number_positive') then
    alter table shots add constraint shots_shot_number_positive check (shot_number > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'shots_lens_positive') then
    alter table shots add constraint shots_lens_positive check (lens > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'shots_estimated_setup_minutes_nonnegative') then
    alter table shots add constraint shots_estimated_setup_minutes_nonnegative check (estimated_setup_minutes >= 0);
  end if;
end $$;

create or replace function normalize_shot_for_app()
returns trigger
language plpgsql
as $$
begin
  new.shot_number = coalesce(new.shot_number, new.shoot_order::integer, 1);
  new.shoot_order = coalesce(new.shoot_order, new.shot_number);
  new.int_ext = coalesce(new.int_ext, 'INT');
  new.location = coalesce(new.location, '');
  new.shot_type = coalesce(new.shot_type, 'MS');
  new.movement = coalesce(new.movement, 'static');
  new.lens = coalesce(new.lens, new.lens_mm::integer, 50);
  new.lens_mm = coalesce(new.lens_mm, new.lens);
  new.description = coalesce(new.description, '');
  new.special_equipment = coalesce(new.special_equipment, new.special_equip, '');
  new.special_equip = coalesce(new.special_equip, new.special_equipment, '');
  new.estimated_setup_minutes = coalesce(new.estimated_setup_minutes, new.est_setup_min, 15);
  new.est_setup_min = coalesce(new.est_setup_min, new.estimated_setup_minutes);
  new.notes = coalesce(new.notes, '');
  return new;
end;
$$;

drop trigger if exists shots_normalize_for_app on shots;
create trigger shots_normalize_for_app
  before insert or update on shots
  for each row execute function normalize_shot_for_app();

-- ── Characters ────────────────────────────────────────────────────────────────

alter table characters add column if not exists physical_description text;
alter table characters add column if not exists voice text;
alter table characters add column if not exists arc text;
alter table characters add column if not exists relationships jsonb not null default '{}';
alter table characters add column if not exists total_scenes integer not null default 0;

update characters
set
  age = coalesce(age, ''),
  occupation = coalesce(occupation, ''),
  physical_desc = coalesce(physical_desc, ''),
  physical_description = coalesce(physical_description, physical_desc, ''),
  backstory = coalesce(backstory, ''),
  want = coalesce(want, ''),
  need = coalesce(need, ''),
  wound = coalesce(wound, ''),
  ghost = coalesce(ghost, ''),
  voice_notes = coalesce(voice_notes, ''),
  voice = coalesce(voice, voice_notes, ''),
  arc = coalesce(arc, nullif(concat_ws(' -> ', nullif(arc_start, ''), nullif(arc_end, '')), ''), ''),
  relationships = coalesce(relationships, '{}'),
  total_scenes = coalesce(total_scenes, 0);

alter table characters alter column age set default '';
alter table characters alter column age set not null;
alter table characters alter column occupation set default '';
alter table characters alter column occupation set not null;
alter table characters alter column physical_description set default '';
alter table characters alter column physical_description set not null;
alter table characters alter column backstory set default '';
alter table characters alter column backstory set not null;
alter table characters alter column want set default '';
alter table characters alter column want set not null;
alter table characters alter column need set default '';
alter table characters alter column need set not null;
alter table characters alter column wound set default '';
alter table characters alter column wound set not null;
alter table characters alter column ghost set default '';
alter table characters alter column ghost set not null;
alter table characters alter column voice set default '';
alter table characters alter column voice set not null;
alter table characters alter column arc set default '';
alter table characters alter column arc set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'characters_total_scenes_nonnegative') then
    alter table characters add constraint characters_total_scenes_nonnegative check (total_scenes >= 0);
  end if;
end $$;

create or replace function normalize_character_for_app()
returns trigger
language plpgsql
as $$
begin
  new.age = coalesce(new.age, '');
  new.occupation = coalesce(new.occupation, '');
  new.physical_description = coalesce(new.physical_description, new.physical_desc, '');
  new.physical_desc = coalesce(new.physical_desc, new.physical_description, '');
  new.backstory = coalesce(new.backstory, '');
  new.want = coalesce(new.want, '');
  new.need = coalesce(new.need, '');
  new.wound = coalesce(new.wound, '');
  new.ghost = coalesce(new.ghost, '');
  new.voice = coalesce(new.voice, new.voice_notes, '');
  new.voice_notes = coalesce(new.voice_notes, new.voice, '');
  new.arc = coalesce(new.arc, '');
  new.relationships = coalesce(new.relationships, '{}');
  new.total_scenes = coalesce(new.total_scenes, 0);
  return new;
end;
$$;

drop trigger if exists characters_normalize_for_app on characters;
create trigger characters_normalize_for_app
  before insert or update on characters
  for each row execute function normalize_character_for_app();

-- ── Policies for new storyboard_panels table ─────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'storyboard_panels' and policyname = 'storyboard_panels_select_access') then
    create policy storyboard_panels_select_access on storyboard_panels
      for select using (exists (select 1 from scenes where scenes.id = storyboard_panels.scene_id and has_project_access(scenes.project_id)));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'storyboard_panels' and policyname = 'storyboard_panels_insert_editor') then
    create policy storyboard_panels_insert_editor on storyboard_panels
      for insert with check (exists (select 1 from scenes where scenes.id = storyboard_panels.scene_id and can_edit_project(scenes.project_id)));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'storyboard_panels' and policyname = 'storyboard_panels_update_editor') then
    create policy storyboard_panels_update_editor on storyboard_panels
      for update using (exists (select 1 from scenes where scenes.id = storyboard_panels.scene_id and can_edit_project(scenes.project_id)))
      with check (exists (select 1 from scenes where scenes.id = storyboard_panels.scene_id and can_edit_project(scenes.project_id)));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'storyboard_panels' and policyname = 'storyboard_panels_delete_editor') then
    create policy storyboard_panels_delete_editor on storyboard_panels
      for delete using (exists (select 1 from scenes where scenes.id = storyboard_panels.scene_id and can_edit_project(scenes.project_id)));
  end if;
end $$;

-- ── Indexes ───────────────────────────────────────────────────────────────────

create index if not exists scenes_project_number_idx           on scenes (project_id, number);
create index if not exists screenplay_elements_scene_order_idx on screenplay_elements (scene_id, "order");
create index if not exists storyboard_panels_scene_id_idx      on storyboard_panels (scene_id);
create index if not exists storyboard_panels_beat_id_idx       on storyboard_panels (beat_id);
create index if not exists shots_shot_number_idx               on shots (project_id, shot_number);
create index if not exists characters_name_idx                 on characters (project_id, name);

-- ── updated_at / project touch triggers ───────────────────────────────────────

drop trigger if exists storyboard_panels_set_updated_at on storyboard_panels;
create trigger storyboard_panels_set_updated_at
  before update on storyboard_panels
  for each row execute function set_updated_at();

create or replace function touch_project_from_scene()
returns trigger language plpgsql as $$
declare
  target_project_id uuid;
begin
  if tg_op = 'DELETE' then
    target_project_id = old.project_id;
  else
    target_project_id = new.project_id;
  end if;

  update projects set updated_at = now()
  where id = target_project_id;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function touch_project_from_storyboard_panel()
returns trigger language plpgsql as $$
declare
  target_scene_id uuid;
begin
  if tg_op = 'DELETE' then
    target_scene_id = old.scene_id;
  else
    target_scene_id = new.scene_id;
  end if;

  update projects
  set updated_at = now()
  where id = (select project_id from scenes where scenes.id = target_scene_id);

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists scenes_touch_project on scenes;
create trigger scenes_touch_project
  after insert or update or delete on scenes
  for each row execute function touch_project_from_scene();

drop trigger if exists characters_touch_project on characters;
create trigger characters_touch_project
  after insert or update or delete on characters
  for each row execute function touch_project_from_scene();

drop trigger if exists shots_touch_project on shots;
create trigger shots_touch_project
  after insert or update or delete on shots
  for each row execute function touch_project_from_scene();

drop trigger if exists storyboard_panels_touch_project on storyboard_panels;
create trigger storyboard_panels_touch_project
  after insert or update or delete on storyboard_panels
  for each row execute function touch_project_from_storyboard_panel();

-- The private sketches storage bucket and project-scoped object policies are
-- created in 0013_storage_buckets.sql.
