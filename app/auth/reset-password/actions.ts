"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit/logger";
import { COPY } from "@/lib/copy";

export type ResetPasswordState = {
  error?: string;
};

function getClientMeta() {
  const h = headers();
  return {
    ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent") ?? null
  };
}

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const copy = COPY.auth.resetPassword;
  const { ipAddress, userAgent } = getClientMeta();

  if (password.length < 8) {
    return { error: copy.tooShort };
  }
  if (password !== confirm) {
    return { error: copy.mismatch };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: copy.missingSession };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });

  if (updateError) {
    return { error: updateError.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();

  await logAuditEvent({
    userId: user.id,
    userEmail: profile?.email ?? user.email ?? undefined,
    action: "auth.password_reset",
    metadata: { method: "recovery_link" },
    ipAddress,
    userAgent
  });

  await supabase.auth.signOut();
  redirect("/login?reset=success");
}
