-- Migration: Moodle integration
-- Tables for Moodle sync (URL + token per user, assignments)

-- TABLA: moodle_credentials
create table if not exists moodle_credentials (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null unique,
  moodle_url text not null,
  moodle_token text not null,
  site_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: moodle_assignments
create table if not exists moodle_assignments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  moodle_assignment_id text not null,
  course_id bigint not null,
  course_name text not null,
  course_shortname text,
  title text not null,
  description text,
  due_date timestamp with time zone,
  max_points numeric,
  synced_to_mission boolean default false,
  mission_id uuid,
  submission_state text default 'NEW',
  reward_claimed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, moodle_assignment_id)
);

-- RLS
alter table moodle_credentials enable row level security;
alter table moodle_assignments enable row level security;

drop policy if exists "Users can view own moodle credentials" on moodle_credentials;
create policy "Users can view own moodle credentials"
  on moodle_credentials for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own moodle credentials" on moodle_credentials;
create policy "Users can insert own moodle credentials"
  on moodle_credentials for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own moodle credentials" on moodle_credentials;
create policy "Users can update own moodle credentials"
  on moodle_credentials for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own moodle credentials" on moodle_credentials;
create policy "Users can delete own moodle credentials"
  on moodle_credentials for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own moodle assignments" on moodle_assignments;
create policy "Users can view own moodle assignments"
  on moodle_assignments for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own moodle assignments" on moodle_assignments;
create policy "Users can insert own moodle assignments"
  on moodle_assignments for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own moodle assignments" on moodle_assignments;
create policy "Users can update own moodle assignments"
  on moodle_assignments for update using (auth.uid() = user_id);
