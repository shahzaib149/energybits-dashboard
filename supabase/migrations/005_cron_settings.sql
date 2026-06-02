-- Weekly auto-trigger schedule config (single-row settings table)
create table if not exists public.cron_settings (
  id            integer primary key default 1,
  enabled       boolean not null default false,
  last_run_at   timestamptz,
  last_run_status text check (last_run_status in ('success', 'error', 'running')),
  last_run_gap_count integer,
  last_run_error text,
  updated_at    timestamptz default now()
);

-- Enforce single-row invariant
create unique index if not exists cron_settings_single_row on public.cron_settings ((true));

-- Seed the one row
insert into public.cron_settings (id, enabled) values (1, false) on conflict (id) do nothing;

-- Only the service role can read/write (accessed from server-only API routes)
alter table public.cron_settings enable row level security;

create policy "cron_settings_service_only" on public.cron_settings
  using (false)
  with check (false);
