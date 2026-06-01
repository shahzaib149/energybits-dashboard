# Combined Intelligence Report

Cross-pillar JSON export merging **SEO** (Airtable), **AEO** (Cairrot run data), and **GEO** (Cairrot readiness) for Make.com automation and manual analysis.

## Endpoint

`GET /api/reports/combined-intelligence`

Requires authenticated session. Query params:

| Param | Description |
|-------|-------------|
| `days` | SEO date window (default `28`) |
| `from` / `to` | Custom SEO range (`YYYY-MM-DD`) — overrides `days` |
| `runId` | Optional Cairrot run ID (defaults to latest) |

Response shape: see `lib/reports/types.ts` (`CombinedIntelligenceReport`).

## Audit

- `POST /api/reports/combined-intelligence/audit` — download events (`intelligence_report.downloaded`)
- `POST /api/reports/trigger-recommendations` — Make.com trigger events (`intelligence_recommendations_triggered`)
- `POST /api/reports/combined-intelligence/trigger` — legacy client-posted payload (`intelligence_report.triggered`)

## Make.com trigger

**Trigger AI** on `/overview`:

1. `POST /api/reports/trigger-recommendations?days=28` (or `from`/`to`) — builds the report server-side and POSTs JSON to Make.com
2. UI shows a success toast and enforces a 60-second cooldown between triggers

Env: `MAKE_INTELLIGENCE_WEBHOOK_URL` (server-only). Optional `MAKE_INTELLIGENCE_LANGUAGE` (default `en`) — required by Make modules that expect a `language` parameter on the webhook payload.

## UI

Overview page (`/overview`) shows **Intelligence Gaps** card with overlap priority counts and **Download Full Report** button.

## Key modules

| Path | Role |
|------|------|
| `lib/reports/combined-intelligence.ts` | Fetch, merge, gap computation |
| `lib/reports/types.ts` | TypeScript interfaces |
| `app/api/reports/combined-intelligence/route.ts` | HTTP handler |
| `components/overview/IntelligenceGapsCard.tsx` | Overview UI |

## Gap logic

- **seoAeoOverlap** — Page-2 SEO keywords matched to AEO zero-presence prompts via dynamic topic signals (derived from Cairrot prompt topics) plus literal keyword-in-prompt checks
- **contentGaps** — AEO prompts with no brand mention; priority by competitor presence (>40% critical, >0% high, else medium)
- **technicalGaps** — GEO categories below 70; priority by score (<50 critical, <65 high, else medium)
- **criticalGaps / highGaps / mediumGaps** — Counts across all three gap arrays (not overlaps only)

## Caching

Matches existing strategy: `revalidate: 300` on upstream Airtable/Cairrot fetches.
