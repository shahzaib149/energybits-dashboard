import { createServiceRoleClient } from "@/lib/supabase/admin";
import { readLocalCache, writeLocalCache } from "./local-cache";

export interface CronSettings {
  enabled: boolean;
  last_run_at: string | null;
  last_run_status: "success" | "error" | "running" | null;
  last_run_gap_count: number | null;
  last_run_error: string | null;
}

const DEFAULTS: CronSettings = {
  enabled: false,
  last_run_at: null,
  last_run_status: null,
  last_run_gap_count: null,
  last_run_error: null
};

const SUPABASE_TIMEOUT_MS = 4_000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    p.catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))
  ]);
}

export async function getCronSettings(): Promise<CronSettings> {
  const supabase = createServiceRoleClient();
  if (supabase) {
    const result = await withTimeout(
      supabase
        .from("cron_settings")
        .select("enabled, last_run_at, last_run_status, last_run_gap_count, last_run_error")
        .eq("id", 1)
        .single()
        .then(({ data, error }) => (error || !data ? null : (data as CronSettings))),
      SUPABASE_TIMEOUT_MS
    );
    if (result) {
      writeLocalCache(result); // keep local cache in sync
      return result;
    }
  }

  // Supabase unreachable — use local file cache so the user's setting is preserved
  return readLocalCache() ?? DEFAULTS;
}

export async function updateCronSettings(
  updates: Partial<CronSettings & { updated_at: string }>
): Promise<void> {
  // Always write to local cache immediately so it survives Supabase outages
  writeLocalCache(updates);

  const supabase = createServiceRoleClient();
  if (!supabase) return;

  await withTimeout(
    supabase
      .from("cron_settings")
      .upsert({ id: 1, ...updates, updated_at: new Date().toISOString() }, { onConflict: "id" })
      .then(() => true),
    SUPABASE_TIMEOUT_MS
  );
}
