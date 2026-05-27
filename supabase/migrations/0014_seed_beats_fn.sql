create or replace function seed_project_beats()
returns trigger
language plpgsql
as $$
begin
  insert into beats (
    project_id,
    beat_index,
    beat_key,
    label,
    target_page_min,
    target_page_max,
    description
  )
  values
    (new.id, 1, 'opening_image', 'Opening Image', 1, 1, 'A snapshot of the world before the story changes.'),
    (new.id, 2, 'theme_stated', 'Theme Stated', 5, 5, 'A hint at what the protagonist must learn.'),
    (new.id, 3, 'setup', 'Setup', 1, 10, 'The ordinary world, stakes, tone, and key relationships.'),
    (new.id, 4, 'catalyst', 'Catalyst', 12, 12, 'The inciting incident that disrupts the status quo.'),
    (new.id, 5, 'debate', 'Debate', 12, 25, 'The protagonist resists, questions, or weighs the journey.'),
    (new.id, 6, 'break_into_two', 'Break into Two', 25, 25, 'The protagonist commits to the new world of Act II.'),
    (new.id, 7, 'b_story', 'B Story', 30, 30, 'A relationship or subplot that carries the theme.'),
    (new.id, 8, 'fun_and_games', 'Fun and Games', 30, 55, 'The promise of the premise.'),
    (new.id, 9, 'midpoint', 'Midpoint', 55, 55, 'A false victory or false defeat that raises stakes.'),
    (new.id, 10, 'bad_guys_close_in', 'Bad Guys Close In', 55, 75, 'External and internal pressure tightens.'),
    (new.id, 11, 'all_is_lost', 'All Is Lost', 75, 75, 'The lowest point, often with a whiff of death.'),
    (new.id, 12, 'dark_night_of_the_soul', 'Dark Night of the Soul', 75, 85, 'The protagonist processes the loss and lesson.'),
    (new.id, 13, 'break_into_three', 'Break into Three', 85, 85, 'The solution appears through the theme and B story.'),
    (new.id, 14, 'finale', 'Finale', 85, 110, 'The protagonist executes the new plan and resolves the story.'),
    (new.id, 15, 'final_image', 'Final Image', 110, 110, 'A closing snapshot showing transformation.')
  on conflict (project_id, beat_index) do nothing;

  return new;
end;
$$;

create trigger projects_seed_beats
  after insert on projects
  for each row execute function seed_project_beats();
