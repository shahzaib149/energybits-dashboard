"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { Loader2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordAction, type ResetPasswordState } from "@/app/auth/reset-password/actions";
import { COPY } from "@/lib/copy";

type ResetPasswordFormProps = {
  initialHasSession?: boolean;
};

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ initialHasSession = false }: ResetPasswordFormProps) {
  const copy = COPY.auth.resetPassword;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(initialHasSession);
  const [checkingSession, setCheckingSession] = useState(!initialHasSession);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();

    async function establishSessionFromHash() {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return false;

      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (!accessToken || !refreshToken || type !== "recovery") {
        return false;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (sessionError) {
        return false;
      }

      window.history.replaceState(null, "", window.location.pathname);
      return true;
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(Boolean(session));
        setCheckingSession(false);
      }
    });

    async function init() {
      const fromHash = await establishSessionFromHash();
      if (fromHash) {
        setHasSession(true);
        setCheckingSession(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      setHasSession(Boolean(data.session));
      setCheckingSession(false);
    }

    void init();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("password", password);
    formData.set("confirm", confirm);

    startTransition(async () => {
      const result = await resetPasswordAction(initialState, formData);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  if (checkingSession) {
    return <p className="text-sm text-slate-400">Verifying reset link…</p>;
  }

  if (!hasSession) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {copy.missingSession}
        </p>
        <Link
          href="/login/forgot-password"
          className="inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300"
        >
          {copy.requestNewLink}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-200">
          {copy.passwordLabel}
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/80" />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm" className="text-sm font-medium text-slate-200">
          {copy.confirmLabel}
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/80" />
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:from-cyan-400 hover:to-teal-400 disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {copy.submitLabel}
      </button>
    </form>
  );
}
