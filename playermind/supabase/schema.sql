-- ===========================================================================
-- PLAYERMIND – סכמת מסד נתונים ל-Supabase (Postgres)
-- כולל את כל הטבלאות, אינדקסים, מדיניות RLS וטריגרים.
-- הרץ קובץ זה ב-SQL Editor של פרויקט ה-Supabase שלך.
-- ===========================================================================

-- ----------------------------------------------------------------------------
-- player_profile
-- (טבלת users מנוהלת על ידי Supabase Auth → auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.player_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  full_name text,
  birth_date date,
  height_cm int,
  weight_kg numeric,
  strong_foot text,
  shirt_number int,
  team text,
  league text,
  main_position text,
  secondary_position text,
  personal_goals text,
  professional_goals text,
  physical_goals text,
  mental_goals text,
  team_goals text,
  onboarded boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  sleep_hours numeric,
  sleep_quality text,
  wake_feeling text,
  body_feeling text,
  mood text,
  pain_level text,
  today_type text,
  daily_goal text,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  phase text not null default 'pre',           -- pre / post
  arrival_state text,
  focus_today text,
  ate boolean,
  drank boolean,
  pro_goal text,
  mental_goal text,
  what_was_good text,
  what_learned text,
  what_improve text,
  challenging_moment text,
  how_handled text,
  load_level text,
  pain_after text,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  phase text not null default 'pre',           -- pre / post
  arrival_state text,
  goal text,
  in_control text,
  first_action text,
  minutes_played int,
  what_worked text,
  what_less_worked text,
  take_to_next text,
  lost_focus_moment text,
  how_recovered text,
  created_at timestamptz not null default now()
);

create table if not exists public.recovery_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  stretching boolean default false,
  walking boolean default false,
  massage boolean default false,
  foam_roll boolean default false,
  ice boolean default false,
  breathing boolean default false,
  early_sleep boolean default false,
  post_meal boolean default false,
  hydration boolean default false,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  ate boolean,
  drank boolean,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  hours numeric,
  quality text,
  created_at timestamptz not null default now()
);

create table if not exists public.mental_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  mood text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.life_balance_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  family_time text,
  met_friends text,
  did_enjoyable text,
  week_feeling text,
  good_moment text,
  created_at timestamptz not null default now()
);

create table if not exists public.success_journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  did_well text,
  proud_of text,
  what_advanced text,
  learned_about_self text,
  created_at timestamptz not null default now()
);

create table if not exists public.injury_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body_part text,
  injury_date date,
  status text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.player_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text,
  title text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period text not null,
  category text,
  title text,
  detected text,
  why text,
  action text,
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date,
  content_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_label text,
  content_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text,
  content text,
  weight int not null default 1,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- אינדקסים
-- ----------------------------------------------------------------------------
create index if not exists idx_checkins_user_date on public.daily_checkins (user_id, log_date);
create index if not exists idx_training_user_date on public.training_sessions (user_id, log_date);
create index if not exists idx_matches_user_date on public.matches (user_id, log_date);
create index if not exists idx_recovery_user_date on public.recovery_logs (user_id, log_date);
create index if not exists idx_life_user_date on public.life_balance_logs (user_id, log_date);
create index if not exists idx_insights_user_period on public.insights (user_id, period);
create index if not exists idx_memory_user on public.ai_memory (user_id);

-- ----------------------------------------------------------------------------
-- Row Level Security – כל משתמש ניגש רק לנתונים שלו
-- ----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'player_profile','daily_checkins','training_sessions','matches',
    'recovery_logs','nutrition_logs','sleep_logs','mental_logs',
    'life_balance_logs','success_journal','injury_history','player_goals',
    'insights','weekly_reports','monthly_reports','ai_memory'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);

    execute format($f$
      drop policy if exists "own_select_%1$s" on public.%1$I;
      create policy "own_select_%1$s" on public.%1$I
        for select using (auth.uid() = user_id);
    $f$, t);

    execute format($f$
      drop policy if exists "own_insert_%1$s" on public.%1$I;
      create policy "own_insert_%1$s" on public.%1$I
        for insert with check (auth.uid() = user_id);
    $f$, t);

    execute format($f$
      drop policy if exists "own_update_%1$s" on public.%1$I;
      create policy "own_update_%1$s" on public.%1$I
        for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
    $f$, t);

    execute format($f$
      drop policy if exists "own_delete_%1$s" on public.%1$I;
      create policy "own_delete_%1$s" on public.%1$I
        for delete using (auth.uid() = user_id);
    $f$, t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- טריגר: יצירת פרופיל אוטומטית בעת הרשמת משתמש חדש
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.player_profile (user_id, full_name, onboarded)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), false)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
