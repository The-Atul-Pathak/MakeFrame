create or replace view v_project_stats
with (security_invoker = true)
as
with scene_stats as (
  select
    project_id,
    count(*) as scene_count,
    coalesce(sum(length_eighths), 0)::numeric / 8 as total_pages
  from scenes
  group by project_id
),
panel_stats as (
  select
    project_id,
    count(*) as panel_count,
    coalesce(sum(duration_sec), 0) as runtime_seconds
  from panels
  group by project_id
),
shot_stats as (
  select
    project_id,
    count(*) as shot_count
  from shots
  group by project_id
)
select
  p.id as project_id,
  coalesce(scene_stats.scene_count, 0) as scene_count,
  coalesce(panel_stats.panel_count, 0) as panel_count,
  coalesce(shot_stats.shot_count, 0) as shot_count,
  coalesce(scene_stats.total_pages, 0) as total_pages,
  coalesce(panel_stats.runtime_seconds, 0) as runtime_seconds
from projects p
left join scene_stats on scene_stats.project_id = p.id
left join panel_stats on panel_stats.project_id = p.id
left join shot_stats on shot_stats.project_id = p.id;

create or replace view v_flags
with (security_invoker = true)
as
select
  panels.project_id,
  'panel'::text as item_type,
  panels.id as item_id,
  'needs_review'::text as reason,
  panels.updated_at as occurred_at
from panels
where panels.needs_review
union all
select
  shots.project_id,
  'shot'::text as item_type,
  shots.id as item_id,
  'missing_required_metadata'::text as reason,
  shots.updated_at as occurred_at
from shots
where shots.shot_type is null
   or shots.lens_mm is null
   or not exists (
     select 1
     from shot_cast
     where shot_cast.shot_id = shots.id
   )
union all
select
  characters.project_id,
  'character'::text as item_type,
  characters.id as item_id,
  'empty_or_stub_profile'::text as reason,
  characters.updated_at as occurred_at
from characters
where characters.is_stub
   or (
     nullif(trim(coalesce(characters.age, '')), '') is null
     and nullif(trim(coalesce(characters.occupation, '')), '') is null
     and nullif(trim(coalesce(characters.physical_desc, '')), '') is null
     and nullif(trim(coalesce(characters.backstory, '')), '') is null
   );

create or replace view v_recently_edited
with (security_invoker = true)
as
select *
from (
  select
    activity_log.*,
    row_number() over (
      partition by activity_log.user_id
      order by activity_log.occurred_at desc
    ) as recent_rank
  from activity_log
  where activity_log.user_id = auth.uid()
) ranked
where recent_rank <= 10;

create or replace view v_global_search
with (security_invoker = true)
as
select
  scenes.project_id,
  'scene'::text as item_type,
  scenes.id as item_id,
  concat_ws(' ', scenes.scene_number, scenes.int_ext::text, scenes.location, scenes.time_of_day::text) as title,
  to_tsvector(
    'english',
    concat_ws(' ', scenes.scene_number, scenes.location, scenes.emotional_tone, array_to_string(scenes.props, ' '), array_to_string(scenes.special_reqs, ' '))
  ) as search_vector
from scenes
union all
select
  characters.project_id,
  'character'::text as item_type,
  characters.id as item_id,
  characters.name as title,
  to_tsvector(
    'english',
    concat_ws(' ', characters.name, characters.age, characters.occupation, characters.physical_desc, characters.backstory, characters.want, characters.need, characters.voice_notes)
  ) as search_vector
from characters
union all
select
  screenplay_elements.project_id,
  'screenplay_element'::text as item_type,
  screenplay_elements.id as item_id,
  left(screenplay_elements.content, 80) as title,
  to_tsvector('english', screenplay_elements.content) as search_vector
from screenplay_elements
union all
select
  panels.project_id,
  'panel'::text as item_type,
  panels.id as item_id,
  left(coalesce(panels.action_desc, panels.dialogue_note, 'Panel'), 80) as title,
  to_tsvector('english', concat_ws(' ', panels.action_desc, panels.dialogue_note, panels.shot_type::text, panels.camera_movement::text)) as search_vector
from panels
union all
select
  shots.project_id,
  'shot'::text as item_type,
  shots.id as item_id,
  left(coalesce(shots.description, shots.notes, 'Shot'), 80) as title,
  to_tsvector('english', concat_ws(' ', shots.description, shots.notes, shots.location, shots.special_equip, shots.shot_type::text, shots.movement::text)) as search_vector
from shots;
