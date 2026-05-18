import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: "slate" | "green" | "blue" | "amber" | "rose" | "teal";
}

const tones = {
  slate: "bg-slate-100 text-slate-700",
  green: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  teal: "bg-teal-100 text-teal-700"
};

export function KPICard({ label, value, icon, tone = "slate" }: KPICardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={cn("rounded-xl p-3", tones[tone])}>{icon}</div>
      </div>
    </div>
  );
}
