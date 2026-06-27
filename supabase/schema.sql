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

-- ===========================================================================
-- חלק ב' – טבלאות השקה (זהה ל-migrations/0002_launch.sql)
-- ===========================================================================
-- ----------------------------------------------------------------------------
-- תפקיד משתמש
-- ----------------------------------------------------------------------------
alter table public.player_profile
  add column if not exists role text not null default 'player';   -- player / coach / admin

-- ----------------------------------------------------------------------------
-- קישור מאמן ↔ שחקן
-- ----------------------------------------------------------------------------
create table if not exists public.coach_players (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  player_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (coach_id, player_id)
);
create index if not exists idx_coach_players_coach on public.coach_players (coach_id);

-- ----------------------------------------------------------------------------
-- רשימת המתנה (Waitlist) – פתוחה גם למבקרים לא מחוברים
-- ----------------------------------------------------------------------------
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  role text,                    -- שחקן / מאמן / הורה / אחר
  source text,
  created_at timestamptz not null default now(),
  unique (email)
);

-- ----------------------------------------------------------------------------
-- משוב משתמשים
-- ----------------------------------------------------------------------------
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  type text,                    -- באג / רעיון / שבח / אחר
  rating int,                   -- 1..5
  message text not null,
  page text,
  created_at timestamptz not null default now()
);
create index if not exists idx_feedback_created on public.feedback (created_at desc);

-- ----------------------------------------------------------------------------
-- מעקב שגיאות (Error tracking)
-- ----------------------------------------------------------------------------
create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  message text,
  stack text,
  source text,                  -- boundary / window / promise / manual
  url text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists idx_errors_created on public.error_logs (created_at desc);

-- ----------------------------------------------------------------------------
-- מעקב שימוש (Usage / Analytics events)
-- ----------------------------------------------------------------------------
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event text not null,          -- page_view / action ...
  path text,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_usage_user on public.usage_events (user_id);
create index if not exists idx_usage_created on public.usage_events (created_at desc);
create index if not exists idx_usage_event on public.usage_events (event);

-- ----------------------------------------------------------------------------
-- פונקציות עזר (SECURITY DEFINER – עוקפות RLS באופן מבוקר)
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.player_profile
    where user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_coach_of(target uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.coach_players
    where coach_id = auth.uid() and player_id = target
  );
$$;

-- ----------------------------------------------------------------------------
-- RLS לטבלאות החדשות
-- ----------------------------------------------------------------------------
alter table public.coach_players enable row level security;
alter table public.waitlist enable row level security;
alter table public.feedback enable row level security;
alter table public.error_logs enable row level security;
alter table public.usage_events enable row level security;

-- coach_players: מאמן רואה את הקישורים שלו; אדמין מנהל הכל
drop policy if exists cp_select on public.coach_players;
create policy cp_select on public.coach_players
  for select using (auth.uid() = coach_id or public.is_admin());
drop policy if exists cp_admin_all on public.coach_players;
create policy cp_admin_all on public.coach_players
  for all using (public.is_admin()) with check (public.is_admin());

-- waitlist: כל אחד יכול להירשם; רק אדמין קורא
drop policy if exists wl_insert on public.waitlist;
create policy wl_insert on public.waitlist
  for insert with check (true);
drop policy if exists wl_admin_select on public.waitlist;
create policy wl_admin_select on public.waitlist
  for select using (public.is_admin());

-- feedback: משתמש מחובר מוסיף משוב משלו; קורא משוב משלו; אדמין קורא הכל
drop policy if exists fb_insert on public.feedback;
create policy fb_insert on public.feedback
  for insert with check (auth.uid() = user_id);
drop policy if exists fb_select on public.feedback;
create policy fb_select on public.feedback
  for select using (auth.uid() = user_id or public.is_admin());

-- error_logs: ניתן לתעד שגיאה תמיד (גם לפני התחברות); רק אדמין קורא
drop policy if exists el_insert on public.error_logs;
create policy el_insert on public.error_logs
  for insert with check (true);
drop policy if exists el_admin_select on public.error_logs;
create policy el_admin_select on public.error_logs
  for select using (public.is_admin());

-- usage_events: משתמש מתעד את עצמו; רק אדמין קורא
drop policy if exists ue_insert on public.usage_events;
create policy ue_insert on public.usage_events
  for insert with check (auth.uid() = user_id);
drop policy if exists ue_admin_select on public.usage_events;
create policy ue_admin_select on public.usage_events
  for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- מדיניות נוספת: אדמין ומאמן רשאים לקרוא נתוני שחקנים
-- (פוליסות SELECT נוספות מתווספות ב-OR לפוליסת הבעלים הקיימת)
-- ----------------------------------------------------------------------------
do $$
declare t text;
begin
  -- אדמין: קריאה לכל טבלאות הנתונים
  foreach t in array array[
    'player_profile','daily_checkins','training_sessions','matches',
    'recovery_logs','nutrition_logs','sleep_logs','mental_logs',
    'life_balance_logs','success_journal','injury_history','player_goals',
    'insights','weekly_reports','monthly_reports','ai_memory'
  ]
  loop
    execute format('drop policy if exists "admin_select_%1$s" on public.%1$I;', t);
    execute format('create policy "admin_select_%1$s" on public.%1$I for select using (public.is_admin());', t);
  end loop;

  -- מאמן: קריאה לנתוני השחקנים המקושרים אליו
  foreach t in array array[
    'player_profile','daily_checkins','training_sessions','matches',
    'recovery_logs','life_balance_logs','success_journal','injury_history',
    'player_goals','insights','ai_memory'
  ]
  loop
    execute format('drop policy if exists "coach_select_%1$s" on public.%1$I;', t);
    execute format('create policy "coach_select_%1$s" on public.%1$I for select using (public.is_coach_of(user_id));', t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- הרשאות: אפשר למבקרים לא מחוברים להירשם לרשימה ולתעד שגיאות
-- ----------------------------------------------------------------------------
grant insert on public.waitlist to anon;
grant insert on public.error_logs to anon;

-- כדי להפוך משתמש לאדמין/מאמן, עדכן ידנית:
--   update public.player_profile set role = 'admin' where user_id = '<uuid>';
--   update public.player_profile set role = 'coach' where user_id = '<uuid>';
--   insert into public.coach_players (coach_id, player_id) values ('<coach>', '<player>');
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

-- ===========================================================================
-- חלק ב' – טבלאות השקה (זהה ל-migrations/0002_launch.sql)
-- ===========================================================================
-- ----------------------------------------------------------------------------
-- תפקיד משתמש
-- ----------------------------------------------------------------------------
alter table public.player_profile
  add column if not exists role text not null default 'player';   -- player / coach / admin

-- ----------------------------------------------------------------------------
-- קישור מאמן ↔ שחקן
-- ----------------------------------------------------------------------------
create table if not exists public.coach_players (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  player_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (coach_id, player_id)
);
create index if not exists idx_coach_players_coach on public.coach_players (coach_id);

-- ----------------------------------------------------------------------------
-- רשימת המתנה (Waitlist) – פתוחה גם למבקרים לא מחוברים
-- ----------------------------------------------------------------------------
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  role text,                    -- שחקן / מאמן / הורה / אחר
  source text,
  created_at timestamptz not null default now(),
  unique (email)
);

-- ----------------------------------------------------------------------------
-- משוב משתמשים
-- ----------------------------------------------------------------------------
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  type text,                    -- באג / רעיון / שבח / אחר
  rating int,                   -- 1..5
  message text not null,
  page text,
  created_at timestamptz not null default now()
);
create index if not exists idx_feedback_created on public.feedback (created_at desc);

-- ----------------------------------------------------------------------------
-- מעקב שגיאות (Error tracking)
-- ----------------------------------------------------------------------------
create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  message text,
  stack text,
  source text,                  -- boundary / window / promise / manual
  url text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists idx_errors_created on public.error_logs (created_at desc);

-- ----------------------------------------------------------------------------
-- מעקב שימוש (Usage / Analytics events)
-- ----------------------------------------------------------------------------
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event text not null,          -- page_view / action ...
  path text,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_usage_user on public.usage_events (user_id);
create index if not exists idx_usage_created on public.usage_events (created_at desc);
create index if not exists idx_usage_event on public.usage_events (event);

-- ----------------------------------------------------------------------------
-- פונקציות עזר (SECURITY DEFINER – עוקפות RLS באופן מבוקר)
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.player_profile
    where user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_coach_of(target uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.coach_players
    where coach_id = auth.uid() and player_id = target
  );
$$;

-- ----------------------------------------------------------------------------
-- RLS לטבלאות החדשות
-- ----------------------------------------------------------------------------
alter table public.coach_players enable row level security;
alter table public.waitlist enable row level security;
alter table public.feedback enable row level security;
alter table public.error_logs enable row level security;
alter table public.usage_events enable row level security;

-- coach_players: מאמן רואה את הקישורים שלו; אדמין מנהל הכל
drop policy if exists cp_select on public.coach_players;
create policy cp_select on public.coach_players
  for select using (auth.uid() = coach_id or public.is_admin());
drop policy if exists cp_admin_all on public.coach_players;
create policy cp_admin_all on public.coach_players
  for all using (public.is_admin()) with check (public.is_admin());

-- waitlist: כל אחד יכול להירשם; רק אדמין קורא
drop policy if exists wl_insert on public.waitlist;
create policy wl_insert on public.waitlist
  for insert with check (true);
drop policy if exists wl_admin_select on public.waitlist;
create policy wl_admin_select on public.waitlist
  for select using (public.is_admin());

-- feedback: משתמש מחובר מוסיף משוב משלו; קורא משוב משלו; אדמין קורא הכל
drop policy if exists fb_insert on public.feedback;
create policy fb_insert on public.feedback
  for insert with check (auth.uid() = user_id);
drop policy if exists fb_select on public.feedback;
create policy fb_select on public.feedback
  for select using (auth.uid() = user_id or public.is_admin());

-- error_logs: ניתן לתעד שגיאה תמיד (גם לפני התחברות); רק אדמין קורא
drop policy if exists el_insert on public.error_logs;
create policy el_insert on public.error_logs
  for insert with check (true);
drop policy if exists el_admin_select on public.error_logs;
create policy el_admin_select on public.error_logs
  for select using (public.is_admin());

-- usage_events: משתמש מתעד את עצמו; רק אדמין קורא
drop policy if exists ue_insert on public.usage_events;
create policy ue_insert on public.usage_events
  for insert with check (auth.uid() = user_id);
drop policy if exists ue_admin_select on public.usage_events;
create policy ue_admin_select on public.usage_events
  for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- מדיניות נוספת: אדמין ומאמן רשאים לקרוא נתוני שחקנים
-- (פוליסות SELECT נוספות מתווספות ב-OR לפוליסת הבעלים הקיימת)
-- ----------------------------------------------------------------------------
do $$
declare t text;
begin
  -- אדמין: קריאה לכל טבלאות הנתונים
  foreach t in array array[
    'player_profile','daily_checkins','training_sessions','matches',
    'recovery_logs','nutrition_logs','sleep_logs','mental_logs',
    'life_balance_logs','success_journal','injury_history','player_goals',
    'insights','weekly_reports','monthly_reports','ai_memory'
  ]
  loop
    execute format('drop policy if exists "admin_select_%1$s" on public.%1$I;', t);
    execute format('create policy "admin_select_%1$s" on public.%1$I for select using (public.is_admin());', t);
  end loop;

  -- מאמן: קריאה לנתוני השחקנים המקושרים אליו
  foreach t in array array[
    'player_profile','daily_checkins','training_sessions','matches',
    'recovery_logs','life_balance_logs','success_journal','injury_history',
    'player_goals','insights','ai_memory'
  ]
  loop
    execute format('drop policy if exists "coach_select_%1$s" on public.%1$I;', t);
    execute format('create policy "coach_select_%1$s" on public.%1$I for select using (public.is_coach_of(user_id));', t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- הרשאות: אפשר למבקרים לא מחוברים להירשם לרשימה ולתעד שגיאות
-- ----------------------------------------------------------------------------
grant insert on public.waitlist to anon;
grant insert on public.error_logs to anon;

-- כדי להפוך משתמש לאדמין/מאמן, עדכן ידנית:
--   update public.player_profile set role = 'admin' where user_id = '<uuid>';
--   update public.player_profile set role = 'coach' where user_id = '<uuid>';
--   insert into public.coach_players (coach_id, player_id) values ('<coach>', '<player>');
-- ===========================================================================
-- PLAYERMIND – מיגרציה 0003: שיחות מאמן ה-AI
-- שומרת את כל השיחות וההודעות מול מאמן ה-AI (לכל משתמש, עם RLS).
-- ===========================================================================

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_ai_conv_user on public.ai_conversations (user_id, updated_at desc);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,                 -- user / coach
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_msg_conv on public.ai_messages (conversation_id, created_at);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

do $$
declare t text;
begin
  foreach t in array array['ai_conversations','ai_messages']
  loop
    execute format('drop policy if exists "own_select_%1$s" on public.%1$I;', t);
    execute format('create policy "own_select_%1$s" on public.%1$I for select using (auth.uid() = user_id);', t);
    execute format('drop policy if exists "own_insert_%1$s" on public.%1$I;', t);
    execute format('create policy "own_insert_%1$s" on public.%1$I for insert with check (auth.uid() = user_id);', t);
    execute format('drop policy if exists "own_update_%1$s" on public.%1$I;', t);
    execute format('create policy "own_update_%1$s" on public.%1$I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
    execute format('drop policy if exists "own_delete_%1$s" on public.%1$I;', t);
    execute format('create policy "own_delete_%1$s" on public.%1$I for delete using (auth.uid() = user_id);', t);
  end loop;
end $$;


-- ===========================================================================
-- חלק ג' – הרחבת מוצר (זהה ל-migrations/0004_expansion.sql)
-- ===========================================================================
-- לו״ז שבועי
create table if not exists public.weekly_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  category text,                 -- אימון קבוצתי / משחק / חדר כושר / ...
  date date not null,
  start_time text,
  end_time text,
  intensity text,                -- קל / בינוני / גבוה
  notes text,
  recurring boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_schedule_user_date on public.weekly_schedule (user_id, date);

-- מעקב הרגלים
create table if not exists public.habit_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_type text not null,      -- מזהה ההרגל
  date date not null default current_date,
  completed boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, habit_type, date)
);
create index if not exists idx_habit_user on public.habit_tracking (user_id, habit_type, date);

-- הכנה מנטלית
create table if not exists public.mental_preparation (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,            -- training / match
  date date not null default current_date,
  professional_goal text,
  mental_goal text,
  first_action text,
  focus_word text,
  obstacle text,
  response_plan text,
  team_contribution text,
  generated_card text,
  created_at timestamptz not null default now()
);
create index if not exists idx_mental_user on public.mental_preparation (user_id, date);

-- דוחות יומיים
create table if not exists public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_date date not null default current_date,
  content_json jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, report_date)
);
create index if not exists idx_daily_reports_user on public.daily_reports (user_id, report_date desc);

-- הרחבת זיכרון אישי
alter table public.ai_memory add column if not exists domain text;   -- מקצועי/פיזי/מנטלי/התאוששות/חיים/כללי
alter table public.ai_memory add column if not exists hidden boolean not null default false;

-- שדה מגמה בתובנות (trend / single point)
alter table public.insights add column if not exists trend text;

-- RLS לטבלאות החדשות
alter table public.weekly_schedule enable row level security;
alter table public.habit_tracking enable row level security;
alter table public.mental_preparation enable row level security;
alter table public.daily_reports enable row level security;

do $$
declare t text;
begin
  foreach t in array array['weekly_schedule','habit_tracking','mental_preparation','daily_reports']
  loop
    execute format('drop policy if exists "own_select_%1$s" on public.%1$I;', t);
    execute format('create policy "own_select_%1$s" on public.%1$I for select using (auth.uid() = user_id);', t);
    execute format('drop policy if exists "own_insert_%1$s" on public.%1$I;', t);
    execute format('create policy "own_insert_%1$s" on public.%1$I for insert with check (auth.uid() = user_id);', t);
    execute format('drop policy if exists "own_update_%1$s" on public.%1$I;', t);
    execute format('create policy "own_update_%1$s" on public.%1$I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
    execute format('drop policy if exists "own_delete_%1$s" on public.%1$I;', t);
    execute format('create policy "own_delete_%1$s" on public.%1$I for delete using (auth.uid() = user_id);', t);
  end loop;
end $$;

-- אדמין/מאמן: קריאה ללו״ז ולהכנה מנטלית של שחקנים (תואם דפוס הפוליסות הקיים)
do $$
declare t text;
begin
  foreach t in array array['weekly_schedule','habit_tracking','mental_preparation','daily_reports']
  loop
    execute format('drop policy if exists "admin_select_%1$s" on public.%1$I;', t);
    execute format('create policy "admin_select_%1$s" on public.%1$I for select using (public.is_admin());', t);
    execute format('drop policy if exists "coach_select_%1$s" on public.%1$I;', t);
    execute format('create policy "coach_select_%1$s" on public.%1$I for select using (public.is_coach_of(user_id));', t);
  end loop;
end $$;
