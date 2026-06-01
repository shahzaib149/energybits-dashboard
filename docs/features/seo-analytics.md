# SEO Analytics Page

Read-only dashboard at `/seo-analytics` displaying Google Search Console (GSC) and GA4 data synced to Airtable by Make.com scenarios.

## Architecture

| Layer | Location | Notes |
|-------|----------|-------|
| Data source | Airtable REST API | Server-side only |
| Client | `lib/airtable/client.ts` | Singleton with 5-min cache (`revalidate: 300`) |
| Env validation | `lib/seo-analytics/env.ts` | Checks `AIRTABLE_API_KEY` only |
| Registry | `lib/airtable/config/registry.ts` | Base/table names (IDs resolved via Meta API) |
| Page | `app/seo-analytics/page.tsx` | Parallel fetches, URL tab state |
| API proxies | `app/api/airtable/*` | Thin handlers for optional client use |
| UI | `components/seo-analytics/*` | Recharts, dark theme matching Overview |

## Environment Variables

Only `AIRTABLE_API_KEY` is required. Base and table IDs are resolved automatically — see [airtable-configuration.md](./airtable-configuration.md).

```
AIRTABLE_API_KEY=pat...
```

The API key never reaches the browser bundle.

## Airtable Tables

| Table | Used for |
|-------|----------|
| SEO Tracking | GSC keyword data |
| SEO Runs | GSC pull audit (latest-run route) |
| GA4 Page Performance | Page engagement |
| GA4 Traffic Sources | Channel/source breakdown |
| GA4 Runs | GA4 pull audit |

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
