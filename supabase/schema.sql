-- Run this once in the Supabase SQL editor for your project.
create extension if not exists "uuid-ossp";

create table if not exists habits (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  emoji text not null default '✨',
  color text not null default '#6366f1',
  input_type text not null default 'checkbox' check (input_type in ('checkbox','counter','slider','number')),
  unit text,
  min_value numeric not null default 0,
  max_value numeric not null default 10,
  step numeric not null default 1,
  target numeric,
  position integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists entries (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid not null references habits(id) on delete cascade,
  value numeric not null,
  logged_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (habit_id, logged_date)
);

create index if not exists entries_logged_date_idx on entries(logged_date);
create index if not exists entries_habit_date_idx on entries(habit_id, logged_date);
