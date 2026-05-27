create index projects_owner_id_idx on projects (owner_id);
create index projects_last_opened_at_idx on projects (last_opened_at desc);

create index project_members_project_id_idx on project_members (project_id);
create index project_members_user_id_idx on project_members (user_id);

create index scenes_project_id_idx on scenes (project_id);
create index scenes_project_position_idx on scenes (project_id, position);
create index scenes_props_gin_idx on scenes using gin (props);
create index scenes_special_reqs_gin_idx on scenes using gin (special_reqs);
create index scenes_location_trgm_idx on scenes using gin (location gin_trgm_ops);

create index screenplay_elements_project_id_idx on screenplay_elements (project_id);
create index screenplay_elements_scene_id_idx on screenplay_elements (scene_id);
create index screenplay_elements_project_position_idx on screenplay_elements (project_id, position);
create index screenplay_elements_character_id_idx on screenplay_elements (character_id);
create index screenplay_elements_content_fts_idx on screenplay_elements using gin (to_tsvector('english', content));

create index script_notes_project_id_idx on script_notes (project_id);
create index script_notes_element_id_idx on script_notes (element_id);

create index drafts_project_id_idx on drafts (project_id);

create index characters_project_id_idx on characters (project_id);
create unique index characters_project_lower_name_idx on characters (project_id, lower(name));
create index characters_name_trgm_idx on characters using gin (name gin_trgm_ops);

create index scene_characters_project_id_idx on scene_characters (project_id);
create index scene_characters_character_id_idx on scene_characters (character_id);

create index character_relationships_project_id_idx on character_relationships (project_id);
create index character_relationships_character_a_idx on character_relationships (character_a);
create index character_relationships_character_b_idx on character_relationships (character_b);

create index panels_project_id_idx on panels (project_id);
create index panels_scene_id_idx on panels (scene_id);
create index panels_scene_panel_number_idx on panels (scene_id, panel_number);
create index panels_linked_element_id_idx on panels (linked_element_id);
create index panels_tags_gin_idx on panels using gin (tags);
create index panels_action_desc_fts_idx on panels using gin (to_tsvector('english', coalesce(action_desc, '') || ' ' || coalesce(dialogue_note, '')));

create index shoot_days_project_id_idx on shoot_days (project_id);

create index shots_project_id_idx on shots (project_id);
create index shots_scene_id_idx on shots (scene_id);
create index shots_panel_id_idx on shots (panel_id);
create index shots_shoot_day_id_idx on shots (shoot_day_id);
create index shots_project_shoot_order_idx on shots (project_id, shoot_order);
create index shots_description_fts_idx on shots using gin (to_tsvector('english', coalesce(description, '') || ' ' || coalesce(notes, '')));

create index shot_cast_character_id_idx on shot_cast (character_id);

create index beats_project_id_idx on beats (project_id);
create index beats_assigned_scene_id_idx on beats (assigned_scene_id);

create index exports_project_id_idx on exports (project_id);
create index exports_expires_at_idx on exports (expires_at) where expires_at is not null;

create index activity_log_project_id_idx on activity_log (project_id);
create index activity_log_user_occurred_at_idx on activity_log (user_id, occurred_at desc);
create index activity_log_item_idx on activity_log (item_type, item_id);
