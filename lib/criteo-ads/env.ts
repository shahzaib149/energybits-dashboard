/**
 * Server-only Criteo Ads Analytics env (separate Airtable base).
 */

const CRITEO_ADS_VARS = [
  "AIRTABLE_API_KEY",
  "AIRTABLE_CRITEO_ADS_BASE_ID",
  "AIRTABLE_CRITEO_ADS_DAILY_TABLE_ID",
  "AIRTABLE_CRITEO_ADS_OVERALL_TABLE_ID"
] as const;

export type CriteoAdsEnv = {
  AIRTABLE_API_KEY: string;
  AIRTABLE_CRITEO_ADS_BASE_ID: string;
  AIRTABLE_CRITEO_ADS_DAILY_TABLE_ID: string;
  AIRTABLE_CRITEO_ADS_OVERALL_TABLE_ID: string;
};

let cached: CriteoAdsEnv | null = null;

function readCriteoAdsEnv(): CriteoAdsEnv {
  const missing = CRITEO_ADS_VARS.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `Missing Criteo Ads Analytics environment variables: ${missing.join(", ")}. See .env.example.`
    );
  }

  return {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY!.trim(),
    AIRTABLE_CRITEO_ADS_BASE_ID: process.env.AIRTABLE_CRITEO_ADS_BASE_ID!.trim(),
    AIRTABLE_CRITEO_ADS_DAILY_TABLE_ID: process.env.AIRTABLE_CRITEO_ADS_DAILY_TABLE_ID!.trim(),
    AIRTABLE_CRITEO_ADS_OVERALL_TABLE_ID: process.env.AIRTABLE_CRITEO_ADS_OVERALL_TABLE_ID!.trim()
  };
}

export function getCriteoAdsEnv(): CriteoAdsEnv {
  if (!cached) {
    cached = readCriteoAdsEnv();
  }
  return cached;
}

export function isCriteoAdsConfigured(): boolean {
  return CRITEO_ADS_VARS.every((key) => Boolean(process.env[key]?.trim()));
}
