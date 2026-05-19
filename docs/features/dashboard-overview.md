# Dashboard Overview Hub

The `/overview` page is a **cross-channel command center** — not a deep-dive into any single analytics source.

## Pages

| Route | Purpose |
|-------|---------|
| `/overview` | Summary cards for AEO, GEO, SEO, Google Ads with key stats + links |
| `/aeo-analytics` | Full AI search visibility (formerly on Overview) |
| `/geo-analytics` | Site AI readiness score + category breakdown |
| `/seo-analytics` | Google Search Console + GA4 |
| `/google-ads-analytics` | Paid campaign performance |

## Overview data flow

`lib/overview/summary.ts` → `fetchOverviewHubData()` pulls from:

- **Cairrot** — AEO + GEO stats (when `CAIRROT_*` env configured)
- **Airtable SEO base** — clicks, CTR, position (when SEO table IDs configured)
- **Airtable Google Ads base** — spend, ROAS, conversions (when Google Ads table IDs configured)

Each source is fetched independently; partial failures show "not connected" or error state per channel without breaking the whole page.

## Sidebar order

Overview → AEO → GEO → SEO → Google Ads → Recommendations → Blogs
