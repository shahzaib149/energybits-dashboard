const VIBE_ADS_VARS = [
  "AIRTABLE_API_KEY",
  "AIRTABLE_VIBE_ADS_BASE_ID",
  "AIRTABLE_VIBE_ADS_ANALYTICS_TABLE_ID"
] as const;

export type VibeAdsEnv = {
  AIRTABLE_API_KEY: string;
  AIRTABLE_VIBE_ADS_BASE_ID: string;
  AIRTABLE_VIBE_ADS_ANALYTICS_TABLE_ID: string;
};

let cached: VibeAdsEnv | null = null;

function readVibeAdsEnv(): VibeAdsEnv {
  const missing = VIBE_ADS_VARS.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing Vibe.co Analytics env vars: ${missing.join(", ")}. See .env.example.`);
  }
  return {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY!.trim(),
    AIRTABLE_VIBE_ADS_BASE_ID: process.env.AIRTABLE_VIBE_ADS_BASE_ID!.trim(),
    AIRTABLE_VIBE_ADS_ANALYTICS_TABLE_ID: process.env.AIRTABLE_VIBE_ADS_ANALYTICS_TABLE_ID!.trim()
  };
}

export function getVibeAdsEnv(): VibeAdsEnv {
  if (!cached) cached = readVibeAdsEnv();
  return cached;
}

export function isVibeAdsConfigured(): boolean {
  return VIBE_ADS_VARS.every((key) => Boolean(process.env[key]?.trim()));
}
