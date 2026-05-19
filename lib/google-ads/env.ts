/**
 * Server-only Google Ads Analytics env (separate Airtable base).
 */

const GOOGLE_ADS_VARS = [
  "AIRTABLE_API_KEY",
  "AIRTABLE_GOOGLE_ADS_BASE_ID",
  "AIRTABLE_GOOGLE_ADS_CAMPAIGNS_TABLE_ID",
  "AIRTABLE_GOOGLE_ADS_AD_GROUPS_TABLE_ID",
  "AIRTABLE_GOOGLE_ADS_CREATIVES_TABLE_ID",
  "AIRTABLE_GOOGLE_ADS_KEYWORDS_TABLE_ID"
] as const;

export type GoogleAdsEnv = {
  AIRTABLE_API_KEY: string;
  AIRTABLE_GOOGLE_ADS_BASE_ID: string;
  AIRTABLE_GOOGLE_ADS_CAMPAIGNS_TABLE_ID: string;
  AIRTABLE_GOOGLE_ADS_AD_GROUPS_TABLE_ID: string;
  AIRTABLE_GOOGLE_ADS_CREATIVES_TABLE_ID: string;
  AIRTABLE_GOOGLE_ADS_KEYWORDS_TABLE_ID: string;
};

let cached: GoogleAdsEnv | null = null;

function readGoogleAdsEnv(): GoogleAdsEnv {
  const missing = GOOGLE_ADS_VARS.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `Missing Google Ads Analytics environment variables: ${missing.join(", ")}. See .env.example.`
    );
  }

  return {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY!.trim(),
    AIRTABLE_GOOGLE_ADS_BASE_ID: process.env.AIRTABLE_GOOGLE_ADS_BASE_ID!.trim(),
    AIRTABLE_GOOGLE_ADS_CAMPAIGNS_TABLE_ID: process.env.AIRTABLE_GOOGLE_ADS_CAMPAIGNS_TABLE_ID!.trim(),
    AIRTABLE_GOOGLE_ADS_AD_GROUPS_TABLE_ID: process.env.AIRTABLE_GOOGLE_ADS_AD_GROUPS_TABLE_ID!.trim(),
    AIRTABLE_GOOGLE_ADS_CREATIVES_TABLE_ID: process.env.AIRTABLE_GOOGLE_ADS_CREATIVES_TABLE_ID!.trim(),
    AIRTABLE_GOOGLE_ADS_KEYWORDS_TABLE_ID: process.env.AIRTABLE_GOOGLE_ADS_KEYWORDS_TABLE_ID!.trim()
  };
}

export function getGoogleAdsEnv(): GoogleAdsEnv {
  if (!cached) {
    cached = readGoogleAdsEnv();
  }
  return cached;
}

export function isGoogleAdsConfigured(): boolean {
  return GOOGLE_ADS_VARS.every((key) => Boolean(process.env[key]?.trim()));
}
