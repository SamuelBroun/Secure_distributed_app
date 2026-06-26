-- ===========================================================================
-- PLAYERMIND – מיגרציית השקה (Launch / Beta)
-- מוסיפה: תפקידים (player/coach/admin), קישור מאמן-שחקן, רשימת המתנה,
--         משוב, מעקב שגיאות, מעקב שימוש – כולל RLS.
-- הרץ קובץ זה ב-SQL Editor אחרי schema.sql (אידמפוטנטי).
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
