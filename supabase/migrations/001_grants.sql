-- Run once if invite/profile scripts show "permission denied for table profiles"
-- Supabase SQL Editor → paste → Run

grant all on table public.profiles to postgres, anon, authenticated, service_role;
grant all on table public.audit_log to postgres, anon, authenticated, service_role;
grant all on table public.dismissed_actions to postgres, anon, authenticated, service_role;
