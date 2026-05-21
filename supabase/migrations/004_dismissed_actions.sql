-- Session 2: dismissed overview actions (GA4 / Ads)

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
