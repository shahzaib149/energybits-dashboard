"use client";

import { FormEvent, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";
import { signInAction, type SignInState } from "@/app/login/actions";
import { COPY } from "@/lib/copy";

const initialState: SignInState = {};

export function SignInForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/overview";
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    authError ? COPY.auth.login.authCallbackError : null
  );
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("email", email.trim());
    formData.set("password", password);
    formData.set("next", nextPath);

    startTransition(async () => {
      const result = await signInAction(initialState, formData);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  const copy = COPY.auth.login;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-200">
          {copy.emailLabel}
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/80" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={copy.emailPlaceholder}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30"
          />
        </div>
      </div>

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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={copy.passwordPlaceholder}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30"
          />
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-500">{copy.helperText}</p>

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
