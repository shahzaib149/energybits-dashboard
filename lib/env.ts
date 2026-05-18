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
