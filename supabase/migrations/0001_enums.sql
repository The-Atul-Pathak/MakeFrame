create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type tool_kind as enum ('screenplay', 'storyboard', 'shotlist');
create type int_ext as enum ('INT', 'EXT', 'INT_EXT');
create type time_of_day as enum (
  'DAY',
  'NIGHT',
  'DAWN',
  'DUSK',
  'CONTINUOUS',
  'LATER',
  'MOMENTS_LATER'
);
create type element_type as enum (
  'scene_heading',
  'action',
  'character',
  'parenthetical',
  'dialogue',
  'transition'
);
create type note_type as enum ('continuity', 'story', 'positive');
create type shot_type as enum (
  'EWS',
  'WS',
  'MS',
  'MCU',
  'CU',
  'ECU',
  'OTS',
  'POV',
  'INSERT',
  'TWO'
);
create type camera_movement as enum (
  'static',
  'pan',
  'tilt',
  'dolly',
  'track',
  'crane',
  'handheld',
  'steadicam',
  'rack_focus',
  'zoom'
);
create type panel_tag as enum ('master', 'coverage', 'insert', 'key');
create type shot_status as enum ('not_shot', 'done', 'cut');
create type relationship_type as enum (
  'ally',
  'antagonist',
  'romantic',
  'familial',
  'other'
);
create type project_role as enum ('owner', 'editor', 'viewer');
create type export_type as enum (
  'screenplay_pdf',
  'directors_package',
  'production_schedule'
);
create type export_status as enum ('pending', 'ready', 'failed');
