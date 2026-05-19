# SEO Analytics Page

Read-only dashboard at `/seo-analytics` displaying Google Search Console (GSC) and GA4 data synced to Airtable by Make.com scenarios.

## Architecture

| Layer | Location | Notes |
|-------|----------|-------|
| Data source | Airtable REST API | Server-side only |
| Client | `lib/airtable/client.ts` | Singleton with 5-min cache (`revalidate: 300`) |
| Env validation | `lib/seo-analytics/env.ts` | Table IDs + base ID + API key |
| Page | `app/seo-analytics/page.tsx` | Parallel fetches, URL tab state |
| API proxies | `app/api/airtable/*` | Thin handlers for optional client use |
| UI | `components/seo-analytics/*` | Recharts, dark theme matching Overview |

## Environment Variables

Required in `.env.local` (see `.env.example`):

```
AIRTABLE_API_KEY
AIRTABLE_BASE_ID
AIRTABLE_SEO_TRACKING_TABLE_ID
AIRTABLE_SEO_RUNS_TABLE_ID
AIRTABLE_GA4_PAGE_PERFORMANCE_TABLE_ID
AIRTABLE_GA4_TRAFFIC_SOURCES_TABLE_ID
AIRTABLE_GA4_RUNS_TABLE_ID
```

The API key never reaches the browser bundle.

## Airtable Tables

| Table | ID | Used for |
|-------|-----|----------|
| SEO Tracking | `tblrBHao3YzF9943a` | GSC keyword data |
| SEO Runs | `tblg9NS7BD9DPsEqS` | GSC pull audit (latest-run route) |
| GA4 Page Performance | `tblQBQLS0VkkuYjLS` | Page engagement |
| GA4 Traffic Sources | `tbliV8j2feMn9sAPW` | Channel/source breakdown |
| GA4 Runs | `tblyDFLttECDli98s` | GA4 pull audit |

Field mapping lives in `lib/airtable/map.ts` and types in `lib/airtable/types.ts`.

## Tabs

URL param `?tab=search|pages|sources` (default: `search`).

1. **Search Performance** — GSC keywords, position distribution, critical/low-CTR/page-2 opportunities, priority donut
2. **Page Performance** — GA4 top pages, page-type breakdown, high/low engagement tables
3. **Traffic Sources** — Channel donut, source/medium bars, engagement by channel

## API Routes

- `GET /api/airtable/seo-tracking?limit=&filter=`
- `GET /api/airtable/ga4-pages?limit=`
- `GET /api/airtable/ga4-sources?limit=`
- `GET /api/airtable/latest-run`

## Adding New Metrics

1. Add Airtable field to `lib/airtable/types.ts` and `map.ts`
2. Add client method on `AirtableClient` if filtered fetch needed
3. Add aggregation in `lib/seo-analytics/metrics.ts` if computed
4. Add copy in `lib/copy.ts` under `seoAnalytics`
5. Build component under the appropriate tab folder

## Related

- Overview page uses Cairrot (`lib/cairrot/*`) — separate data pipeline
- Legacy Airtable helper `lib/airtable.ts` serves Keywords/Blog pages by table name
