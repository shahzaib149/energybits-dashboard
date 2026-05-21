# Secrets Audit - May 2026

Audit date: 2026-05-19  
Scope: ENERGYbits Dashboard (`EnergybitsDashboard` repo)

## Findings

- ✅ **No API keys in application source** — grep for `sk-`, `pat…`, `AIza`, `ya29.`, and `Bearer …` in `*.ts` / `*.tsx` / `*.js` under `app/`, `lib/`, `components/` returned zero matches.
- ✅ **Only safe `NEXT_PUBLIC_*` vars** — Supabase URL and anon/publishable key are the only public env vars. All Cairrot, Airtable, and service-role keys are server-only.
- ✅ **`.env.local` gitignored** — `.gitignore` includes `.env.local`, `.env.production`, and `.env*.local`.
- ✅ **No secrets committed to git** — only `.env.example` (placeholders) is tracked.
- ✅ **`lib/env.ts` validates core server env** — throws a single error listing all missing vars for Supabase + service role.
- ✅ **Service role client is server-only** — `lib/supabase/admin.ts` used only from route handlers, server actions, and scripts.
- ⚠️ **Legacy test credentials in seed scripts** — `scripts/seed-supabase-users.mjs` and `lib/supabase/admin.ts` still reference `admin@gmail.com` / `user@gmail.com` for local dev seeding. These accounts should remain banned in production via `npm run auth:disable-test-users`.
- ⚠️ **Historical migrations reference test emails** — `001_profiles.sql` / `002_fix_roles_by_email.sql` mention test addresses for one-time role fixes; no secrets embedded.

## Action Items

- [ ] Confirm all env vars from `docs/deployment.md` are set in Vercel Production (manual — requires Vercel dashboard access).
- [ ] Run `npm run auth:disable-test-users` after migration 003 is applied.
- [ ] Set `INVITE_CATHARINE_EMAIL` and `INVITE_BRANDON_EMAIL`, then run `npm run auth:invite-users`.
- [ ] Consider removing or gating `scripts/seed-supabase-users.mjs` once all real users are onboarded.

## Verification

Env vars confirmed present in `.env.local` (values not reproduced here):

| Variable | In `.env.local` | Hardcoded in source |
|----------|-----------------|---------------------|
| `CAIRROT_API_KEY` | ✅ | ❌ |
| `CAIRROT_API_BASE_URL` | ✅ | ❌ |
| `CAIRROT_PROJECT_ID` | ✅ | ❌ |
| `AIRTABLE_API_KEY` | ✅ | ❌ |
| `AIRTABLE_BASE_ID` | ✅ | ❌ |
| `AIRTABLE_SEO_TRACKING_TABLE_ID` | ✅ | ❌ |
| `AIRTABLE_SEO_RUNS_TABLE_ID` | ✅ | ❌ |
| `AIRTABLE_GA4_PAGE_PERFORMANCE_TABLE_ID` | ✅ | ❌ |
| `AIRTABLE_GA4_TRAFFIC_SOURCES_TABLE_ID` | ✅ | ❌ |
| `AIRTABLE_GA4_RUNS_TABLE_ID` | ✅ | ❌ |
| `AIRTABLE_GOOGLE_ADS_BASE_ID` | ✅ | ❌ |
| `AIRTABLE_GOOGLE_ADS_CAMPAIGNS_TABLE_ID` | ✅ | ❌ |
| `AIRTABLE_GOOGLE_ADS_AD_GROUPS_TABLE_ID` | ✅ | ❌ |
| `AIRTABLE_GOOGLE_ADS_CREATIVES_TABLE_ID` | ✅ | ❌ |
| `AIRTABLE_GOOGLE_ADS_KEYWORDS_TABLE_ID` | ✅ | ❌ |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ❌ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` / publishable | ✅ | ❌ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ❌ |

Grep command used:

```powershell
rg -E "(sk-|pat[A-Z0-9]+|AIza|ya29\.|Bearer\s+[A-Za-z0-9._-]+)" --glob "*.{ts,tsx,js}" app lib components
```

Result: **0 matches** in source (`.env*` files excluded by design).
