import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/config";

export type SeedAccount = {
  email: string;
  password: string;
  role: "admin" | "editor" | "viewer";
};

/** @deprecated Test accounts — disable via scripts/disable-test-users.mjs */
export const DEFAULT_SEED_ACCOUNTS: SeedAccount[] = [
  { email: "admin@gmail.com", password: "energybits123", role: "admin" },
  { email: "user@gmail.com", password: "energybits321", role: "editor" }
];

/** Server-only Supabase client with service role. Never import from client components. */
export function createServiceRoleClient(): SupabaseClient | null {
  return getServiceRoleClient();
}

export function getServiceRoleClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceKey) {
    return null;
  }
  return createClient(getSupabaseUrl(), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function seedAuthUsers(accounts: SeedAccount[] = DEFAULT_SEED_ACCOUNTS) {
  const supabase = getServiceRoleClient();
  if (!supabase) {
    return { ok: false as const, error: "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local" };
  }

  const results: Array<{ email: string; status: string; role: string }> = [];

  for (const account of accounts) {
    const email = account.email.toLowerCase();
    const { data: listData } = await supabase.auth.admin.listUsers();
    const found = listData.users.find((u) => u.email?.toLowerCase() === email);

    let userId = found?.id;

    if (found) {
      const { error } = await supabase.auth.admin.updateUserById(found.id, {
        password: account.password,
        email_confirm: true
      });
      if (error) {
        results.push({ email, status: `error: ${error.message}`, role: account.role });
        continue;
      }
      results.push({ email, status: "updated", role: account.role });
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: account.password,
        email_confirm: true
      });
      if (error) {
        results.push({ email, status: `error: ${error.message}`, role: account.role });
        continue;
      }
      userId = data.user?.id;
      results.push({ email, status: "created", role: account.role });
    }

    if (userId) {
      await supabase.from("profiles").upsert(
        { id: userId, email, role: account.role },
        { onConflict: "id" }
      );
    }
  }

  return { ok: true as const, results };
}
