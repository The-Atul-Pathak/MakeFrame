alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table scenes enable row level security;
alter table screenplay_elements enable row level security;
alter table script_notes enable row level security;
alter table drafts enable row level security;
alter table characters enable row level security;
alter table scene_characters enable row level security;
alter table character_relationships enable row level security;
alter table panels enable row level security;
alter table shoot_days enable row level security;
alter table shots enable row level security;
alter table shot_cast enable row level security;
alter table beats enable row level security;
alter table exports enable row level security;
alter table activity_log enable row level security;

create policy profiles_select_own on profiles
  for select using (id = auth.uid());
create policy profiles_insert_own on profiles
  for insert with check (id = auth.uid());
create policy profiles_update_own on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy projects_select_access on projects
  for select using (has_project_access(id));
create policy projects_insert_owner on projects
  for insert with check (owner_id = auth.uid());
create policy projects_update_owner on projects
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy projects_delete_owner on projects
  for delete using (owner_id = auth.uid());

create policy project_members_select_access on project_members
  for select using (has_project_access(project_id));
create policy project_members_insert_editor on project_members
  for insert with check (can_edit_project(project_id));
create policy project_members_update_editor on project_members
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy project_members_delete_editor on project_members
  for delete using (can_edit_project(project_id));

create policy scenes_select_access on scenes
  for select using (has_project_access(project_id));
create policy scenes_insert_editor on scenes
  for insert with check (can_edit_project(project_id));
create policy scenes_update_editor on scenes
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy scenes_delete_editor on scenes
  for delete using (can_edit_project(project_id));

create policy screenplay_elements_select_access on screenplay_elements
  for select using (has_project_access(project_id));
create policy screenplay_elements_insert_editor on screenplay_elements
  for insert with check (can_edit_project(project_id));
create policy screenplay_elements_update_editor on screenplay_elements
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy screenplay_elements_delete_editor on screenplay_elements
  for delete using (can_edit_project(project_id));

create policy script_notes_select_access on script_notes
  for select using (has_project_access(project_id));
create policy script_notes_insert_editor on script_notes
  for insert with check (can_edit_project(project_id));
create policy script_notes_update_editor on script_notes
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy script_notes_delete_editor on script_notes
  for delete using (can_edit_project(project_id));

create policy drafts_select_access on drafts
  for select using (has_project_access(project_id));
create policy drafts_insert_editor on drafts
  for insert with check (can_edit_project(project_id));
create policy drafts_update_editor on drafts
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy drafts_delete_editor on drafts
  for delete using (can_edit_project(project_id));

create policy characters_select_access on characters
  for select using (has_project_access(project_id));
create policy characters_insert_editor on characters
  for insert with check (can_edit_project(project_id));
create policy characters_update_editor on characters
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy characters_delete_editor on characters
  for delete using (can_edit_project(project_id));

create policy scene_characters_select_access on scene_characters
  for select using (has_project_access(project_id));
create policy scene_characters_insert_editor on scene_characters
  for insert with check (can_edit_project(project_id));
create policy scene_characters_update_editor on scene_characters
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy scene_characters_delete_editor on scene_characters
  for delete using (can_edit_project(project_id));

create policy character_relationships_select_access on character_relationships
  for select using (has_project_access(project_id));
create policy character_relationships_insert_editor on character_relationships
  for insert with check (can_edit_project(project_id));
create policy character_relationships_update_editor on character_relationships
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy character_relationships_delete_editor on character_relationships
  for delete using (can_edit_project(project_id));

create policy panels_select_access on panels
  for select using (has_project_access(project_id));
create policy panels_insert_editor on panels
  for insert with check (can_edit_project(project_id));
create policy panels_update_editor on panels
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy panels_delete_editor on panels
  for delete using (can_edit_project(project_id));

create policy shoot_days_select_access on shoot_days
  for select using (has_project_access(project_id));
create policy shoot_days_insert_editor on shoot_days
  for insert with check (can_edit_project(project_id));
create policy shoot_days_update_editor on shoot_days
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy shoot_days_delete_editor on shoot_days
  for delete using (can_edit_project(project_id));

create policy shots_select_access on shots
  for select using (has_project_access(project_id));
create policy shots_insert_editor on shots
  for insert with check (can_edit_project(project_id));
create policy shots_update_editor on shots
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy shots_delete_editor on shots
  for delete using (can_edit_project(project_id));

create policy shot_cast_select_access on shot_cast
  for select using (
    exists (
      select 1 from shots
      where shots.id = shot_cast.shot_id
        and has_project_access(shots.project_id)
    )
  );
create policy shot_cast_insert_editor on shot_cast
  for insert with check (
    exists (
      select 1 from shots
      where shots.id = shot_cast.shot_id
        and can_edit_project(shots.project_id)
    )
  );
create policy shot_cast_delete_editor on shot_cast
  for delete using (
    exists (
      select 1 from shots
      where shots.id = shot_cast.shot_id
        and can_edit_project(shots.project_id)
    )
  );

create policy beats_select_access on beats
  for select using (has_project_access(project_id));
create policy beats_insert_editor on beats
  for insert with check (can_edit_project(project_id));
create policy beats_update_editor on beats
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy beats_delete_editor on beats
  for delete using (can_edit_project(project_id));

create policy exports_select_access on exports
  for select using (has_project_access(project_id));
create policy exports_insert_editor on exports
  for insert with check (can_edit_project(project_id));
create policy exports_update_editor on exports
  for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy exports_delete_editor on exports
  for delete using (can_edit_project(project_id));

create policy activity_log_select_access on activity_log
  for select using (has_project_access(project_id));
create policy activity_log_insert_editor on activity_log
  for insert with check (can_edit_project(project_id));
create policy activity_log_delete_editor on activity_log
  for delete using (can_edit_project(project_id));
