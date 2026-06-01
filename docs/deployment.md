# Deployment — Vercel Environment Variables

Production runs on [Vercel](https://vercel.com). All secrets must be configured in **Project Settings → Environment Variables**. Never commit real values to git.

## Required (all environments)

| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — safe to expose in browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Audit log writes, admin scripts — **never** prefix with `NEXT_PUBLIC_` |

## Cairrot (AEO / GEO analytics)

| Variable | Scope |
|----------|-------|
| `CAIRROT_API_KEY` | Server only |
| `CAIRROT_API_BASE_URL` | Server only (default: `https://api.cairrot.com`) |
| `CAIRROT_PROJECT_ID` | Server only |

## Airtable (all integrations)

| Variable | Scope |
|----------|-------|
| `AIRTABLE_API_KEY` | Server only — personal access token with access to all ENERGYbits bases |

Base and table IDs are resolved at runtime via the Airtable Meta API. See [Airtable configuration](./features/airtable-configuration.md).

## Optional

| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SITE_URL` | All | Production URL for auth redirects (magic links, password reset) |

## Supabase auth redirect URLs

In **Supabase → Authentication → URL Configuration**, add these **Redirect URLs**:

- `http://localhost:3000/auth/reset-password`
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/confirm`
- Production equivalents using your Vercel domain

Set **Site URL** to your primary app URL. Password reset will not work if these URLs are missing. See [Password reset](./features/password-reset.md).

## Local setup

1. Copy `.env.example` → `.env.local`
2. Fill in values from Supabase, Cairrot, and Airtable dashboards
3. Run `npm run dev`

## Database migrations

Apply SQL migrations in order via Supabase SQL Editor:

1. `supabase/migrations/001_profiles.sql` (if not already applied)
2. `supabase/migrations/003_profiles_roles_audit_log.sql`
3. `supabase/migrations/004_dismissed_actions.sql`

## User onboarding (one-time)

```bash
# 1. Ban legacy test accounts
npm run auth:disable-test-users

# 2. Invite real users (set INVITE_* emails in .env.local first)
npm run auth:invite-users
```

## Pre-deploy checklist

- [ ] All variables above set in Vercel for Production (and Preview if needed)
- [ ] Migration `003_profiles_roles_audit_log.sql` applied in Supabase
- [ ] Test users disabled; real users invited
- [ ] `NEXT_PUBLIC_SITE_URL` matches production domain for auth redirects
- [ ] Supabase redirect URLs include `/auth/reset-password`, `/auth/callback`, `/auth/confirm`
- [ ] Production build passes: `npm run build`
