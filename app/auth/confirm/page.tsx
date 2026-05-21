"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Fallback for invite links that return tokens in the URL hash (#access_token=...)
 * Server route handlers cannot read hash fragments.
 */
export default function AuthConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    async function completeAuth() {
      const supabase = createClient();

      // Query params: token_hash + type (some Supabase invite flows)
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "invite" | "recovery" | "signup" | "email"
        });
        if (error) {
          setMessage("Sign-in link expired or invalid. Request a new invite.");
          router.replace("/login?error=auth");
          return;
        }
        router.replace("/overview");
        return;
      }

      // Hash fragment: implicit flow
      const hash = window.location.hash.replace(/^#/, "");
      if (hash) {
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (error) {
            setMessage("Sign-in link expired or invalid. Request a new invite.");
            router.replace("/login?error=auth");
            return;
          }
          router.replace("/overview");
          return;
        }
      }

      setMessage("No sign-in token found. Use the link from your invite email.");
      router.replace("/login?error=auth");
    }

    void completeAuth();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
      <p className="text-sm">{message}</p>
    </div>
  );
}
