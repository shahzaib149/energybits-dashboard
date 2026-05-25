# Meta Analytics

Read-only dashboard at `/meta-analytics` displaying Facebook/Instagram ad performance synced to Airtable from the Meta Ads API.

## Airtable base

| Variable | Value | Table |
|----------|-------|-------|
| `AIRTABLE_META_BASE_ID` | `appT4Zh37Im2Ks4Lh` | Metadata Analysis base |
| `AIRTABLE_META_CAMPAIGN_TABLE_ID` | `tblPCs5ljx6U3PycE` | Meta Campaign Analytics |
| `AIRTABLE_META_AD_INSIGHTS_TABLE_ID` | `tblsnn3RSlhdISrAx` | facebook_ads_insights |

Uses shared `AIRTABLE_API_KEY`.

## Tabs

| Tab | Data source | Description |
|-----|-------------|-------------|
| Overview | Campaigns | Spend trend, top campaigns, spend distribution |
| Campaigns | Meta Campaign Analytics | Aggregated campaign performance table |
| Ads | facebook_ads_insights | Aggregated ad-level performance |
| Ad Insights | facebook_ads_insights | Row-level detail with Ads Manager links |

## Modules

| Path | Role |
|------|------|
| `lib/meta-analytics/` | Env, client, map, metrics |
| `components/meta-analytics/` | UI components |
| `app/meta-analytics/` | Page route |

Date filtering uses `Date Start` (campaigns) and `date_start` (ad insights).
