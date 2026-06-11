import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { CronSettings } from "./settings";

const CACHE_PATH = join(process.cwd(), ".cron-cache.json");

export function readLocalCache(): CronSettings | null {
  try {
    if (!existsSync(CACHE_PATH)) return null;
    return JSON.parse(readFileSync(CACHE_PATH, "utf-8")) as CronSettings;
  } catch {
    return null;
  }
}

export function writeLocalCache(settings: Partial<CronSettings>): void {
  try {
    const current = readLocalCache() ?? {};
    writeFileSync(CACHE_PATH, JSON.stringify({ ...current, ...settings }), "utf-8");
  } catch {
    // Read-only filesystem (e.g. Vercel) — silently skip
  }
}
