-- Run once in the Supabase SQL editor to upgrade an existing habit_tracker
-- install with the "direction" column for negative habits (stay-under-target).
alter table habits
  add column if not exists direction text not null default 'positive'
  check (direction in ('positive','negative'));
