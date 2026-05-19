/**
 * Server-only SEO Analytics env (Airtable table IDs).
 */

const SEO_ANALYTICS_VARS = [
  "AIRTABLE_API_KEY",
  "AIRTABLE_BASE_ID",
  "AIRTABLE_SEO_TRACKING_TABLE_ID",
  "AIRTABLE_SEO_RUNS_TABLE_ID",
  "AIRTABLE_GA4_PAGE_PERFORMANCE_TABLE_ID",
  "AIRTABLE_GA4_TRAFFIC_SOURCES_TABLE_ID",
  "AIRTABLE_GA4_RUNS_TABLE_ID"
] as const;

export type SEOAnalyticsEnv = {
  AIRTABLE_API_KEY: string;
  AIRTABLE_BASE_ID: string;
  AIRTABLE_SEO_TRACKING_TABLE_ID: string;
  AIRTABLE_SEO_RUNS_TABLE_ID: string;
  AIRTABLE_GA4_PAGE_PERFORMANCE_TABLE_ID: string;
  AIRTABLE_GA4_TRAFFIC_SOURCES_TABLE_ID: string;
  AIRTABLE_GA4_RUNS_TABLE_ID: string;
};

let seoCached: SEOAnalyticsEnv | null = null;

function readSEOAnalyticsEnv(): SEOAnalyticsEnv {
  const missing = SEO_ANALYTICS_VARS.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `Missing SEO Analytics environment variables: ${missing.join(", ")}. See .env.example.`
    );
  }

  return {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY!.trim(),
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID!.trim(),
    AIRTABLE_SEO_TRACKING_TABLE_ID: process.env.AIRTABLE_SEO_TRACKING_TABLE_ID!.trim(),
    AIRTABLE_SEO_RUNS_TABLE_ID: process.env.AIRTABLE_SEO_RUNS_TABLE_ID!.trim(),
    AIRTABLE_GA4_PAGE_PERFORMANCE_TABLE_ID: process.env.AIRTABLE_GA4_PAGE_PERFORMANCE_TABLE_ID!.trim(),
    AIRTABLE_GA4_TRAFFIC_SOURCES_TABLE_ID: process.env.AIRTABLE_GA4_TRAFFIC_SOURCES_TABLE_ID!.trim(),
    AIRTABLE_GA4_RUNS_TABLE_ID: process.env.AIRTABLE_GA4_RUNS_TABLE_ID!.trim()
  };
}

export function getSEOAnalyticsEnv(): SEOAnalyticsEnv {
  if (!seoCached) {
    seoCached = readSEOAnalyticsEnv();
  }
  return seoCached;
}

export function isSEOAnalyticsConfigured(): boolean {
  return SEO_ANALYTICS_VARS.every((key) => Boolean(process.env[key]?.trim()));
}
