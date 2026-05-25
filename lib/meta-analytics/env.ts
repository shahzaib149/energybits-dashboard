const META_VARS = [
  "AIRTABLE_API_KEY",
  "AIRTABLE_META_BASE_ID",
  "AIRTABLE_META_CAMPAIGN_TABLE_ID",
  "AIRTABLE_META_AD_INSIGHTS_TABLE_ID"
] as const;

export type MetaAnalyticsEnv = {
  AIRTABLE_API_KEY: string;
  AIRTABLE_META_BASE_ID: string;
  AIRTABLE_META_CAMPAIGN_TABLE_ID: string;
  AIRTABLE_META_AD_INSIGHTS_TABLE_ID: string;
};

let cached: MetaAnalyticsEnv | null = null;

function readMetaEnv(): MetaAnalyticsEnv {
  const missing = META_VARS.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing Meta Analytics env vars: ${missing.join(", ")}. See .env.example.`);
  }
  return {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY!.trim(),
    AIRTABLE_META_BASE_ID: process.env.AIRTABLE_META_BASE_ID!.trim(),
    AIRTABLE_META_CAMPAIGN_TABLE_ID: process.env.AIRTABLE_META_CAMPAIGN_TABLE_ID!.trim(),
    AIRTABLE_META_AD_INSIGHTS_TABLE_ID: process.env.AIRTABLE_META_AD_INSIGHTS_TABLE_ID!.trim()
  };
}

export function getMetaAnalyticsEnv(): MetaAnalyticsEnv {
  if (!cached) cached = readMetaEnv();
  return cached;
}

export function isMetaAnalyticsConfigured(): boolean {
  return META_VARS.every((key) => Boolean(process.env[key]?.trim()));
}
