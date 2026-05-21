-- Fix: authenticated users must be able to read their own profile row
-- Run in Supabase SQL Editor if you see "Account not provisioned" after login

-- Admin check without RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "profiles_self_read" on public.profiles;
drop policy if exists "profiles_admin_read" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;

create policy "profiles_self_read" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

create policy "profiles_admin_read" on public.profiles
  for select to authenticated
  using (public.is_admin());

create policy "profiles_admin_update" on public.profiles
  for update to authenticated
  using (public.is_admin());

grant select on table public.profiles to authenticated;
grant select on table public.audit_log to authenticated;
grant select, insert on table public.dismissed_actions to authenticated;
