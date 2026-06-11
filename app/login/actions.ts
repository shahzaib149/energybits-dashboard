"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit/logger";

export type SignInState = {
  error?: string;
};

function getClientMeta() {
  const h = headers();
  return {
    ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent") ?? null
  };
}

export async function signInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/overview");
  const { ipAddress, userAgent } = getClientMeta();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
  } catch {
    return { error: "Authentication service unavailable. Please try again in a moment." };
  }

  let data: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["data"];
  let error: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["error"];
  try {
    ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
  } catch {
    return { error: "Could not reach authentication service. Check your network and try again." };
  }

  if (error) {
    void logAuditEvent({
      userEmail: email,
      action: "auth.login_failed",
      metadata: { reason: error.message },
      ipAddress,
      userAgent
    });
    return {
      error: error.message === "Invalid login credentials" ? "Invalid email or password." : error.message
    };
  }

  const userId = data.user?.id;
  if (!userId) {
    redirect("/account-not-provisioned");
  }

  const { data: profile } = await Promise.resolve(
    supabase
      .from("profiles")
      .select("role, email, full_name")
      .eq("id", userId)
      .maybeSingle()
  ).catch(() => ({ data: null }));

  void logAuditEvent({
    userId,
    userEmail: profile?.email ?? email,
    action: "auth.login",
    metadata: { method: "password" },
    ipAddress,
    userAgent
  });

  if (!profile) {
    redirect("/account-not-provisioned");
  }

  redirect(nextPath.startsWith("/") ? nextPath : "/overview");
}
