create or replace function has_project_access(p uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from projects
    where id = p
      and owner_id = auth.uid()
  )
  or exists (
    select 1
    from project_members m
    where m.project_id = p
      and m.user_id = auth.uid()
      and m.accepted_at is not null
  );
$$;

create or replace function can_edit_project(p uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from projects
    where id = p
      and owner_id = auth.uid()
  )
  or exists (
    select 1
    from project_members m
    where m.project_id = p
      and m.user_id = auth.uid()
      and m.accepted_at is not null
      and m.role in ('owner', 'editor')
  );
$$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

create trigger scenes_set_updated_at
  before update on scenes
  for each row execute function set_updated_at();

create trigger screenplay_elements_set_updated_at
  before update on screenplay_elements
  for each row execute function set_updated_at();

create trigger characters_set_updated_at
  before update on characters
  for each row execute function set_updated_at();

create trigger panels_set_updated_at
  before update on panels
  for each row execute function set_updated_at();

create trigger shots_set_updated_at
  before update on shots
  for each row execute function set_updated_at();

create or replace function flag_panels_for_screenplay_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    update panels
    set needs_review = true
    where scene_id = old.scene_id;
    return old;
  end if;

  update panels
  set needs_review = true
  where scene_id = new.scene_id;

  if tg_op = 'UPDATE' and old.scene_id is distinct from new.scene_id then
    update panels
    set needs_review = true
    where scene_id = old.scene_id;
  end if;

  return new;
end;
$$;

create trigger screenplay_elements_flag_panels
  after insert or delete or update of content, scene_id on screenplay_elements
  for each row execute function flag_panels_for_screenplay_change();

create or replace function set_draft_version()
returns trigger
language plpgsql
as $$
begin
  if new.version_number is null or new.version_number <= 0 then
    select coalesce(max(version_number), 0) + 1
    into new.version_number
    from drafts
    where project_id = new.project_id;
  end if;

  return new;
end;
$$;

create trigger drafts_set_version
  before insert on drafts
  for each row execute function set_draft_version();

create or replace function bump_project_draft_number()
returns trigger
language plpgsql
as $$
begin
  update projects
  set draft_number = greatest(draft_number, new.version_number)
  where id = new.project_id;
  return new;
end;
$$;

create trigger drafts_bump_project
  after insert on drafts
  for each row execute function bump_project_draft_number();

create or replace function write_activity_log()
returns trigger
language plpgsql
as $$
begin
  insert into activity_log (project_id, user_id, item_type, item_id, action)
  values (
    new.project_id,
    auth.uid(),
    tg_argv[0],
    new.id,
    lower(tg_op)
  );

  return new;
end;
$$;

create trigger scenes_activity_log
  after insert or update on scenes
  for each row execute function write_activity_log('scene');

create trigger panels_activity_log
  after insert or update on panels
  for each row execute function write_activity_log('panel');

create trigger shots_activity_log
  after insert or update on shots
  for each row execute function write_activity_log('shot');

create trigger characters_activity_log
  after insert or update on characters
  for each row execute function write_activity_log('character');

create or replace function set_project_thumbnail_from_panel()
returns trigger
language plpgsql
as $$
begin
  if new.sketch_url is not null and (tg_op = 'INSERT' or old.sketch_url is distinct from new.sketch_url) then
    update projects
    set thumbnail_url = new.sketch_url
    where id = new.project_id
      and thumbnail_url is null;
  end if;

  return new;
end;
$$;

create trigger panels_set_project_thumbnail
  after insert or update of sketch_url on panels
  for each row execute function set_project_thumbnail_from_panel();
