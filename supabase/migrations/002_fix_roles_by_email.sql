-- Run only if users exist in Authentication but profiles.role is wrong or missing.
-- Supabase → Authentication → Users must list admin@gmail.com and user@gmail.com first.

insert into public.profiles (id, email, role)
select
  u.id,
  u.email,
  case
    when lower(u.email) = 'admin@gmail.com' then 'admin'
    when lower(u.email) = 'user@gmail.com' then 'user'
    else 'user'
  end
from auth.users u
where lower(u.email) in ('admin@gmail.com', 'user@gmail.com')
on conflict (id) do update set
  email = excluded.email,
  role = excluded.role;
