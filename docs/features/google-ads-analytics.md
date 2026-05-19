# Google Ads Analytics Page

Read-only dashboard at `/google-ads-analytics` displaying Google Ads performance synced to Airtable.

## Architecture

| Layer | Location | Notes |
|-------|----------|-------|
| Data source | Airtable REST API (separate base from SEO) | Server-side only |
| Client | `lib/google-ads/client.ts` | 5-min cache, pagination capped at 1000 |
| Env | `lib/google-ads/env.ts` | Separate base ID + 4 table IDs |
| Page | `app/google-ads-analytics/page.tsx` | 4 tabs via `?tab=` URL param |
| UI | `components/google-ads/*` | Amber/gold paid-media accent, Recharts |

## Environment Variables

```
AIRTABLE_API_KEY                          # shared with other Airtable integrations
AIRTABLE_GOOGLE_ADS_BASE_ID=appisc4ZVeCsiv4Lm
AIRTABLE_GOOGLE_ADS_CAMPAIGNS_TABLE_ID=tbl5MxC5skc3hFGRj
AIRTABLE_GOOGLE_ADS_AD_GROUPS_TABLE_ID=tblpWuSuhnTJbSCLP
AIRTABLE_GOOGLE_ADS_CREATIVES_TABLE_ID=tblTzYLczxu6YjTcU
AIRTABLE_GOOGLE_ADS_KEYWORDS_TABLE_ID=tbl7LkPIJMk32Ertj
```

**Note:** The Airtable personal access token must have **read access to this base**. Schema metadata and record data require separate permissions.

## Tabs

| Tab | URL param | Data |
|-----|-----------|------|
| Campaigns | `?tab=campaigns` (default) | Spend chart, channel types, impression share, ROAS leaders |
| Ad Groups | `?tab=ad-groups` | Spend by ad group, full table |
| Creatives | `?tab=creatives` | Ad type donut, top ads chart, creative table |
| Keywords | `?tab=keywords` | Match type breakdown, spend chart, ROAS cards, keyword table |

## Design

Distinct from SEO (organic green) and Overview (AI visibility):
- Amber/gold accent for paid spend metrics
- Google blue for Search campaign elements
- ROAS highlighted in brand green when profitable

## API Routes

- `GET /api/google-ads/campaigns?limit=`
- `GET /api/google-ads/ad-groups?limit=`
- `GET /api/google-ads/creatives?limit=`
- `GET /api/google-ads/keywords?limit=`
