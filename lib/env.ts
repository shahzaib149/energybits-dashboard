/**
 * Server-only environment validation for Cairrot integration.
 * Import only from Server Components, Route Handlers, or server actions.
 */

const CAIRROT_REQUIRED_VARS = ["CAIRROT_API_KEY", "CAIRROT_PROJECT_ID"] as const;
const DEFAULT_CAIRROT_BASE_URL = "https://api.cairrot.com";

export type CairrotEnv = {
  CAIRROT_API_KEY: string;
  CAIRROT_API_BASE_URL: string;
  CAIRROT_PROJECT_ID: string;
};

let cached: CairrotEnv | null = null;

function readEnv(): CairrotEnv {
  const missing = CAIRROT_REQUIRED_VARS.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Copy .env.example to .env.local and set your Cairrot credentials."
    );
  }

  return {
    CAIRROT_API_KEY: process.env.CAIRROT_API_KEY!.trim(),
    CAIRROT_API_BASE_URL: (process.env.CAIRROT_API_BASE_URL?.trim() || DEFAULT_CAIRROT_BASE_URL).replace(/\/$/, ""),
    CAIRROT_PROJECT_ID: process.env.CAIRROT_PROJECT_ID!.trim()
  };
}

/** Validated Cairrot env (throws on first access if misconfigured). */
export function getCairrotEnv(): CairrotEnv {
  if (!cached) {
    cached = readEnv();
  }
  return cached;
}

/** Non-throwing check for optional UI messaging. */
export function isCairrotConfigured(): boolean {
  return CAIRROT_REQUIRED_VARS.every((key) => Boolean(process.env[key]?.trim()));
}

const CORE_SERVER_VARS = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;

const OPTIONAL_DOCUMENTED_VARS = [
  "CAIRROT_API_KEY",
  "CAIRROT_API_BASE_URL",
  "CAIRROT_PROJECT_ID",
  "AIRTABLE_API_KEY",
  "AIRTABLE_BASE_ID",
  "AIRTABLE_SEO_TRACKING_TABLE_ID",
  "AIRTABLE_SEO_RUNS_TABLE_ID",
  "AIRTABLE_GA4_PAGE_PERFORMANCE_TABLE_ID",
  "AIRTABLE_GA4_TRAFFIC_SOURCES_TABLE_ID",
  "AIRTABLE_GA4_RUNS_TABLE_ID",
  "AIRTABLE_GOOGLE_ADS_BASE_ID",
  "AIRTABLE_GOOGLE_ADS_CAMPAIGNS_TABLE_ID",
  "AIRTABLE_GOOGLE_ADS_AD_GROUPS_TABLE_ID",
  "AIRTABLE_GOOGLE_ADS_CREATIVES_TABLE_ID",
  "AIRTABLE_GOOGLE_ADS_KEYWORDS_TABLE_ID",
  "AIRTABLE_META_BASE_ID",
  "AIRTABLE_META_CAMPAIGN_TABLE_ID",
  "AIRTABLE_META_AD_INSIGHTS_TABLE_ID"
] as const;

function hasSupabaseAnonKey(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  );
}

/** Returns missing keys from a list (Supabase anon key accepts either env name). */
export function getMissingEnvVars(keys: readonly string[]): string[] {
  return keys.filter((key) => {
    if (key === "NEXT_PUBLIC_SUPABASE_ANON_KEY") return !hasSupabaseAnonKey();
    return !process.env[key]?.trim();
  });
}

/** Validates core auth env — throws with full missing list. */
export function validateCoreServerEnv(): void {
  const missing = [
    ...getMissingEnvVars(CORE_SERVER_VARS),
    ...(hasSupabaseAnonKey() ? [] : ["NEXT_PUBLIC_SUPABASE_ANON_KEY"])
  ];
  if (missing.length > 0) {
    throw new Error(
      `Missing required server environment variables: ${missing.join(", ")}. See .env.example and docs/deployment.md.`
    );
  }
}

export const DOCUMENTED_ENV_KEYS = [
  ...CORE_SERVER_VARS,
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ...OPTIONAL_DOCUMENTED_VARS
] as const;
