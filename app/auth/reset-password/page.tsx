import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";
import { COPY } from "@/lib/copy";

export const dynamic = "force-dynamic";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    code?: string;
    token_hash?: string;
    type?: string;
    error?: string;
  }>;
};

async function establishRecoverySession(searchParams: {
  code?: string;
  token_hash?: string;
  type?: string;
}) {
  const supabase = await createClient();

  if (searchParams.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(searchParams.code);
    return !error;
  }

  if (searchParams.token_hash && searchParams.type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: searchParams.token_hash,
      type: "recovery"
    });
    return !error;
  }

  return false;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const copy = COPY.auth.resetPassword;

  if (params.error) {
    redirect("/login/forgot-password?error=expired");
  }

  const hasAuthParams = Boolean(params.code || (params.token_hash && params.type === "recovery"));

  if (hasAuthParams) {
    const ok = await establishRecoverySession(params);
    if (!ok) {
      redirect("/login/forgot-password?error=expired");
    }
    redirect("/auth/reset-password");
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12">
        <div className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8">
          <h1 className="text-xl font-semibold text-white">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{copy.subtitle}</p>
          <div className="mt-6">
            <ResetPasswordForm initialHasSession={Boolean(user)} />
          </div>
        </div>
      </div>
    </div>
  );
}
