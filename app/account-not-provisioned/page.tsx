import { Mail } from "lucide-react";
import Link from "next/link";
import { COPY } from "@/lib/copy";

export default function AccountNotProvisionedPage() {
  const copy = COPY.auth.notProvisioned;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15">
          <Mail className="h-6 w-6 text-amber-400" />
        </div>
        <h1 className="text-xl font-semibold text-white">{copy.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{copy.description}</p>
        <form action="/auth/signout" method="post" className="mt-6">
          <button
            type="submit"
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            {copy.signOutLabel}
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-500">
          {copy.adminHint}{" "}
          <Link href="mailto:shahzaibhamid02@gmail.com" className="text-cyan-400 hover:underline">
            {copy.contactAdmin}
          </Link>
        </p>
      </div>
    </div>
  );
}
