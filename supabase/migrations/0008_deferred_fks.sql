alter table projects
  add constraint projects_last_scene_fk
  foreign key (last_scene_id)
  references scenes(id)
  on delete set null;

alter table screenplay_elements
  add constraint screenplay_elements_character_fk
  foreign key (character_id)
  references characters(id)
  on delete set null;
