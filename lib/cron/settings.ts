import { createServiceRoleClient } from "@/lib/supabase/admin";

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

export async function getCronSettings(): Promise<CronSettings> {
  const supabase = createServiceRoleClient();
  if (!supabase) return DEFAULTS;

  const { data, error } = await supabase
    .from("cron_settings")
    .select("enabled, last_run_at, last_run_status, last_run_gap_count, last_run_error")
    .eq("id", 1)
    .single();

  if (error || !data) return DEFAULTS;
  return data as CronSettings;
}

export async function updateCronSettings(
  updates: Partial<CronSettings & { updated_at: string }>
): Promise<void> {
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  await supabase
    .from("cron_settings")
    .upsert({ id: 1, ...updates, updated_at: new Date().toISOString() }, { onConflict: "id" });
}
