import { AlertTriangle, Info } from "lucide-react";

export interface ApiNoticeBannerProps {
  title: string;
  message: string;
  variant?: "warning" | "info";
}

export function ApiNoticeBanner({
  title,
  message,
  variant = "warning"
}: ApiNoticeBannerProps) {
  const isWarning = variant === "warning";
  const Icon = isWarning ? AlertTriangle : Info;

  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
        isWarning
          ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
          : "border-sky-500/30 bg-sky-500/10 text-sky-200"
      }`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${isWarning ? "text-amber-400" : "text-sky-400"}`} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-textPrimary">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-textSecondary">{message}</p>
      </div>
    </div>
  );
}
