-- ===========================================================================
-- PLAYERMIND – מיגרציה 0004: הרחבת מוצר
-- לו״ז שבועי, מעקב הרגלים, הכנה מנטלית, דוחות יומיים,
-- הרחבת זיכרון (דומיין/הסתרה) ושדה מגמה בתובנות.
-- אידמפוטנטי – הרץ ב-SQL Editor אחרי הקבצים הקודמים.
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
