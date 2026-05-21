-- Session 1: profiles roles (admin/editor/viewer) + audit_log

-- Extend profiles
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Drop OLD constraint first (was admin|user only — blocks editor before we add it)
alter table public.profiles drop constraint if exists profiles_role_check;

-- Migrate legacy role values (safe after constraint removed)
update public.profiles set role = 'editor' where role = 'user';

-- Add NEW constraint with admin|editor|viewer
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin', 'editor', 'viewer'));

-- Stop auto-creating profiles on signup (admin invites only)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Replace RLS policies
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_admin_read" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles_admin_update" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Audit log
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
