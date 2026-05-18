"use client";

import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function SignOutButton({ collapsed }: { collapsed?: boolean }) {
  return (
    <form action="/auth/signout" method="post" className="w-full">
      <button
        type="submit"
        title="Sign out"
        className={cn(
          "flex w-full items-center gap-2 rounded-xl border border-slate-800 px-3 py-2.5 text-sm text-slate-400 transition hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200",
          collapsed ? "justify-center" : ""
        )}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed ? <span>Sign out</span> : null}
      </button>
    </form>
  );
}
