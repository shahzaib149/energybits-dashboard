-- ENERGYbits Dashboard — full setup for a NEW Supabase project
-- Paste this entire file into Supabase → SQL Editor → Run

-- ─── 1. Profiles (roles: admin / editor / viewer) ───
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- No auto-create trigger — users are invited by admin only

-- ─── 2. Audit log ───
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create index if not exists audit_log_user_id_idx on public.audit_log(user_id);
create index if not exists audit_log_created_at_idx on public.audit_log(created_at desc);
create index if not exists audit_log_action_idx on public.audit_log(action);

alter table public.audit_log enable row level security;

drop policy if exists "audit_log_admin_read" on public.audit_log;
create policy "audit_log_admin_read" on public.audit_log
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─── 3. Dismissed overview actions (GA4 / Ads) ───
create table if not exists public.dismissed_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action_key text not null,
  source text not null,
  dismissed_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb,
  unique(action_key)
);

create index if not exists dismissed_actions_dismissed_at_idx on public.dismissed_actions(dismissed_at desc);

alter table public.dismissed_actions enable row level security;

drop policy if exists "dismissed_actions_read_all_auth" on public.dismissed_actions;
create policy "dismissed_actions_read_all_auth" on public.dismissed_actions
  for select using (auth.uid() is not null);

drop policy if exists "dismissed_actions_insert_editor_admin" on public.dismissed_actions;
create policy "dismissed_actions_insert_editor_admin" on public.dismissed_actions
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- Required so service_role (invite script + audit log) can write
grant all on table public.profiles to postgres, anon, authenticated, service_role;
grant all on table public.audit_log to postgres, anon, authenticated, service_role;
grant all on table public.dismissed_actions to postgres, anon, authenticated, service_role;
