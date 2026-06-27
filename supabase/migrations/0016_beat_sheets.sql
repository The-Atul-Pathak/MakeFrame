drop trigger if exists projects_seed_beats on projects;
drop function if exists seed_project_beats();

drop policy if exists beats_select_access on beats;
drop policy if exists beats_insert_editor on beats;
drop policy if exists beats_update_editor on beats;
drop policy if exists beats_delete_editor on beats;

alter table if exists beats rename to legacy_project_beats;

create table beat_sheets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  framework text not null check (
    framework in (
      'save_the_cat',
      'three_act',
      'hero_journey',
      'story_circle',
      'seven_point'
    )
  ),
  total_pages integer not null default 110 check (total_pages > 0),
  genre text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id)
);

create table beats (
  id uuid primary key default gen_random_uuid(),
  beat_sheet_id uuid not null references beat_sheets(id) on delete cascade,
  "order" integer not null check ("order" > 0),
  name text not null,
  description text not null default '',
  page_start integer not null check (page_start > 0),
  page_end integer not null check (page_end >= page_start),
  act_key text not null,
  framework_beat_id text,
  needs_review boolean not null default false,
  percentage numeric not null default 0 check (percentage >= 0),
  emotional_tone text check (
    emotional_tone is null
    or emotional_tone in (
      'hopeful',
      'melancholic',
      'tense',
      'triumphant',
      'comedic',
      'tragic',
      'mysterious',
      'romantic',
      'action',
      'contemplative',
      'dark',
      'neutral'
    )
  ),
  characters text[] not null default '{}',
  location text,
  notes text not null default '',
  status text not null default 'draft' check (status in ('draft', 'approved', 'locked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (beat_sheet_id, "order")
);

insert into beat_sheets (project_id, framework, total_pages, genre)
select distinct project_id, 'save_the_cat', 110, null
from legacy_project_beats
on conflict (project_id) do nothing;

insert into beats (
  beat_sheet_id,
  "order",
  name,
  description,
  page_start,
  page_end,
  act_key,
  framework_beat_id,
  needs_review,
  percentage,
  emotional_tone,
  characters,
  location,
  notes,
  status
)
select
  beat_sheets.id,
  legacy_project_beats.beat_index,
  legacy_project_beats.label,
  coalesce(legacy_project_beats.description, ''),
  greatest(1, coalesce(legacy_project_beats.target_page_min, 1)::integer),
  greatest(
    greatest(1, coalesce(legacy_project_beats.target_page_min, 1)::integer),
    coalesce(legacy_project_beats.target_page_max, legacy_project_beats.target_page_min, 1)::integer
  ),
  case
    when legacy_project_beats.beat_index between 1 and 6 then 'act1'
    when legacy_project_beats.beat_index between 7 and 9 then 'act2a'
    when legacy_project_beats.beat_index between 10 and 13 then 'act2b'
    else 'act3'
  end,
  case
    when legacy_project_beats.beat_key = 'dark_night_of_the_soul' then 'dark_night'
    else legacy_project_beats.beat_key
  end,
  false,
  greatest(0, coalesce(legacy_project_beats.target_page_min, 1) / 110),
  null,
  '{}',
  null,
  '',
  'draft'
from legacy_project_beats
join beat_sheets on beat_sheets.project_id = legacy_project_beats.project_id
on conflict (beat_sheet_id, "order") do nothing;

alter table beat_sheets enable row level security;
alter table beats enable row level security;

create policy beat_sheets_select_access on beat_sheets
  for select using (has_project_access(project_id));
create policy beat_sheets_insert_editor on beat_sheets
  for insert with check (can_edit_project(project_id));
create policy beat_sheets_update_editor on beat_sheets
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy beat_sheets_delete_editor on beat_sheets
  for delete using (can_edit_project(project_id));

create policy beats_select_access on beats
  for select using (
    exists (
      select 1
      from beat_sheets
      where beat_sheets.id = beats.beat_sheet_id
        and has_project_access(beat_sheets.project_id)
    )
  );
create policy beats_insert_editor on beats
  for insert with check (
    exists (
      select 1
      from beat_sheets
      where beat_sheets.id = beats.beat_sheet_id
        and can_edit_project(beat_sheets.project_id)
    )
  );
create policy beats_update_editor on beats
  for update using (
    exists (
      select 1
      from beat_sheets
      where beat_sheets.id = beats.beat_sheet_id
        and can_edit_project(beat_sheets.project_id)
    )
  )
  with check (
    exists (
      select 1
      from beat_sheets
      where beat_sheets.id = beats.beat_sheet_id
        and can_edit_project(beat_sheets.project_id)
    )
  );
create policy beats_delete_editor on beats
  for delete using (
    exists (
      select 1
      from beat_sheets
      where beat_sheets.id = beats.beat_sheet_id
        and can_edit_project(beat_sheets.project_id)
    )
  );

create index beat_sheets_project_id_idx on beat_sheets (project_id);
create index beats_beat_sheet_id_idx on beats (beat_sheet_id);
create index beats_beat_sheet_order_idx on beats (beat_sheet_id, "order");
create index beats_framework_beat_id_idx on beats (framework_beat_id);
create index beats_characters_gin_idx on beats using gin (characters);

create trigger beat_sheets_set_updated_at
  before update on beat_sheets
  for each row execute function set_updated_at();

create trigger beats_set_updated_at
  before update on beats
  for each row execute function set_updated_at();

create or replace function touch_beat_sheet_from_beat()
returns trigger
language plpgsql
as $$
begin
  update beat_sheets
  set updated_at = now()
  where id = coalesce(new.beat_sheet_id, old.beat_sheet_id);

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger beats_touch_beat_sheet
  after insert or update or delete on beats
  for each row execute function touch_beat_sheet_from_beat();

create or replace function confirm_beat_sheet_framework_switch(
  p_project_id uuid,
  p_to_framework text,
  p_remappings jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_beat_sheet_id uuid;
begin
  if p_to_framework not in (
    'save_the_cat',
    'three_act',
    'hero_journey',
    'story_circle',
    'seven_point'
  ) then
    raise exception 'Unsupported beat sheet framework: %', p_to_framework;
  end if;

  if not can_edit_project(p_project_id) then
    raise exception 'Not allowed to edit project %', p_project_id using errcode = '42501';
  end if;

  select id
  into target_beat_sheet_id
  from beat_sheets
  where project_id = p_project_id
  for update;

  if target_beat_sheet_id is null then
    raise exception 'Beat sheet not found for project %', p_project_id;
  end if;

  update beat_sheets
  set framework = p_to_framework
  where id = target_beat_sheet_id;

  update beats
  set
    framework_beat_id = remap.confirmed_target_id,
    needs_review = remap.needs_review,
    act_key = coalesce(remap.act_key, beats.act_key)
  from (
    select
      coalesce(
        remap_item.value ->> 'beat_id',
        remap_item.value ->> 'beatId',
        remap_item.value ->> 'userBeatId'
      )::uuid as beat_id,
      coalesce(
        remap_item.value ->> 'confirmed_target_id',
        remap_item.value ->> 'confirmedTargetId',
        remap_item.value ->> 'frameworkBeatId'
      ) as confirmed_target_id,
      coalesce(
        nullif(remap_item.value ->> 'needs_review', '')::boolean,
        nullif(remap_item.value ->> 'needsReview', '')::boolean,
        nullif(remap_item.value ->> 'isAmbiguous', '')::boolean,
        false
      ) as needs_review,
      coalesce(
        remap_item.value ->> 'act_key',
        remap_item.value ->> 'actKey'
      ) as act_key
    from jsonb_array_elements(p_remappings) as remap_item(value)
  ) as remap
  where beats.beat_sheet_id = target_beat_sheet_id
    and beats.id = remap.beat_id;
end;
$$;
