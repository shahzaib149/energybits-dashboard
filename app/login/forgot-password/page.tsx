import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { COPY } from "@/lib/copy";

export const dynamic = "force-dynamic";

type ForgotPasswordPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const copy = COPY.auth.forgotPassword;
  const loginCopy = COPY.auth.login;
  const linkExpired = params.error === "expired";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12">
        <div className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8">
          <Link href="/login" className="text-xs font-medium uppercase tracking-wide text-slate-500 hover:text-slate-300">
            Energybits Dashboard
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-white">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{copy.subtitle}</p>
          {linkExpired ? (
            <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              {copy.linkExpired}
            </p>
          ) : null}
          <div className="mt-6">
            <ForgotPasswordForm />
          </div>
          <p className="mt-6 border-t border-slate-800 pt-4 text-center text-xs text-slate-500">
            <Link href="/login" className="hover:text-slate-300">
              {loginCopy.backToSignIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
