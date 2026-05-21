# Criteo Ads Analytics

Retargeting and display performance dashboard backed by a dedicated Airtable base.

## Airtable tables

| Table | Purpose | Date field |
|-------|---------|------------|
| **Criteo Daily Analytics** | Granular daily campaign/ad metrics | `Day` |
| **Criteo Overall Analytics** | All-time summary (single row) | — |

## Environment variables

```env
AIRTABLE_API_KEY=...
AIRTABLE_CRITEO_ADS_BASE_ID=appZVYGQx7fnNfpLZ
AIRTABLE_CRITEO_ADS_DAILY_TABLE_ID=tblhOlWZNYW1OEzMm
AIRTABLE_CRITEO_ADS_OVERALL_TABLE_ID=tbl4kkAMqhmuaj1Gy
```

The Airtable personal access token must have **read** access to the Criteo base.

## Route

`/criteo-ads-analytics` — tabs: Overview, Campaigns, Ads, Daily

## Architecture

```
lib/criteo-ads/          env, client, map, metrics, types
app/criteo-ads-analytics/ page, loading, error
components/criteo-ads/   header, metrics, tabs, charts, tables
```

Date range filtering applies to **Daily Analytics** via `Day`. Overall summary is always fetched in full.

## CSV export

- Campaigns → `criteo-ads-campaigns`
- Ads → `criteo-ads-ads`
- Daily → `criteo-ads-daily`
