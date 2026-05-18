import { Suspense } from "react";
import { SignInForm } from "@/components/auth/SignInForm";

export const dynamic = "force-dynamic";

function SignInFormFallback() {
  return (
    <div className="h-48 animate-pulse rounded-xl bg-slate-800/50" aria-hidden />
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(34,211,238,0.18),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-12 lg:flex-row lg:gap-16 lg:px-8">
        <section className="mb-10 max-w-lg text-center lg:mb-0 lg:text-left">
          <div className="mb-8 inline-flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4 backdrop-blur-sm">
            <div className="rounded-xl bg-cyan-500/15 p-3">
              <img src="/logo.svg" alt="Energybits" className="h-10 w-10 object-contain" />
            </div>
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">Energybits</p>
              <p className="text-lg font-semibold text-white">Content Dashboard</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            AI visibility &amp; content, one place.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
            Sign in to manage SEO recommendations, AEO prompts, blog pipeline, and Cairrot performance for energybits.com.
          </p>
        </section>

        <section className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8">
            <h2 className="text-xl font-semibold text-white">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-400">Use your team credentials to continue.</p>
            <div className="mt-6">
              <Suspense fallback={<SignInFormFallback />}>
                <SignInForm />
              </Suspense>
            </div>
            <p className="mt-6 border-t border-slate-800 pt-4 text-center text-xs text-slate-500">
              Secured with Supabase · Internal use only
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
