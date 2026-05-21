import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { normalizeRole, type Role } from "@/lib/auth/permissions";

export type ServerUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
};

export const getServerUser = cache(async (): Promise<ServerUser | null> => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    id: user.id,
    email: profile.email ?? user.email ?? "",
    fullName: profile.full_name ?? null,
    role: normalizeRole(profile.role)
  };
});
