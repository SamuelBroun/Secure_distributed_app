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
