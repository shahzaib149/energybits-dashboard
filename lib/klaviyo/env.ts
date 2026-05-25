const KLAVIYO_VARS = [
  "AIRTABLE_API_KEY",
  "AIRTABLE_KLAVIYO_BASE_ID",
  "AIRTABLE_KLAVIYO_ANALYTICS_TABLE_ID"
] as const;

export type KlaviyoEnv = {
  AIRTABLE_API_KEY: string;
  AIRTABLE_KLAVIYO_BASE_ID: string;
  AIRTABLE_KLAVIYO_ANALYTICS_TABLE_ID: string;
};

let cached: KlaviyoEnv | null = null;

function readKlaviyoEnv(): KlaviyoEnv {
  const missing = KLAVIYO_VARS.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing Klaviyo Analytics env vars: ${missing.join(", ")}. See .env.example.`);
  }
  return {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY!.trim(),
    AIRTABLE_KLAVIYO_BASE_ID: process.env.AIRTABLE_KLAVIYO_BASE_ID!.trim(),
    AIRTABLE_KLAVIYO_ANALYTICS_TABLE_ID: process.env.AIRTABLE_KLAVIYO_ANALYTICS_TABLE_ID!.trim()
  };
}

export function getKlaviyoEnv(): KlaviyoEnv {
  if (!cached) cached = readKlaviyoEnv();
  return cached;
}

export function isKlaviyoConfigured(): boolean {
  return KLAVIYO_VARS.every((key) => Boolean(process.env[key]?.trim()));
}
