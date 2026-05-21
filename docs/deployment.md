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

## Airtable — SEO / GA4 base

| Variable | Scope |
|----------|-------|
| `AIRTABLE_API_KEY` | Server only |
| `AIRTABLE_BASE_ID` | Server only |
| `AIRTABLE_SEO_TRACKING_TABLE_ID` | Server only |
| `AIRTABLE_SEO_RUNS_TABLE_ID` | Server only |
| `AIRTABLE_GA4_PAGE_PERFORMANCE_TABLE_ID` | Server only |
| `AIRTABLE_GA4_TRAFFIC_SOURCES_TABLE_ID` | Server only |
| `AIRTABLE_GA4_RUNS_TABLE_ID` | Server only |

## Airtable — Google Ads base

| Variable | Scope |
|----------|-------|
| `AIRTABLE_GOOGLE_ADS_BASE_ID` | Server only |
| `AIRTABLE_GOOGLE_ADS_CAMPAIGNS_TABLE_ID` | Server only |
| `AIRTABLE_GOOGLE_ADS_AD_GROUPS_TABLE_ID` | Server only |
| `AIRTABLE_GOOGLE_ADS_CREATIVES_TABLE_ID` | Server only |
| `AIRTABLE_GOOGLE_ADS_KEYWORDS_TABLE_ID` | Server only |

## Optional

| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SITE_URL` | All | Production URL for magic-link redirects (e.g. `https://your-app.vercel.app`) |

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
- [ ] `NEXT_PUBLIC_SITE_URL` matches production domain for magic links
- [ ] Production build passes: `npm run build`
