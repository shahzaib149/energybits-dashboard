import { cn } from "@/lib/utils";

type BadgeContext =
  | "priority"
  | "searchIntent"
  | "blogStatus"
  | "seoStatus"
  | "contentStatus"
  | "aeoStatus"
  | "platform"
  | "generic";

const contextMaps: Record<BadgeContext, Record<string, string>> = {
  priority: {
    High: "bg-rose-100 text-rose-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-emerald-100 text-emerald-700"
  },
  searchIntent: {
    Informational: "bg-blue-100 text-blue-700",
    Commercial: "bg-cyan-100 text-cyan-700",
    Transactional: "bg-teal-100 text-teal-700",
    Navigational: "bg-emerald-100 text-emerald-700"
  },
  blogStatus: {
    Ready: "bg-slate-100 text-slate-700",
    "Draft Generated": "bg-indigo-100 text-indigo-700",
    "Needs Review": "bg-amber-100 text-amber-700",
    "Revision Needed": "bg-orange-100 text-orange-700",
    Approved: "bg-emerald-100 text-emerald-700",
    "Image Ready": "bg-blue-100 text-blue-700",
    "Shopify Draft Created": "bg-purple-100 text-purple-700",
    Scheduled: "bg-cyan-100 text-cyan-700",
    Published: "bg-green-100 text-green-700"
  },
  seoStatus: {
    Optimized: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    "Needs Update": "bg-rose-100 text-rose-700"
  },
  contentStatus: {
    Pending: "bg-slate-100 text-slate-700",
    Generated: "bg-blue-100 text-blue-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Published: "bg-teal-100 text-teal-700"
  },
  aeoStatus: {
    Tracking: "bg-blue-100 text-blue-700",
    Improved: "bg-emerald-100 text-emerald-700",
    Declined: "bg-rose-100 text-rose-700"
  },
  platform: {
    ChatGPT: "bg-emerald-100 text-emerald-700",
    Perplexity: "bg-indigo-100 text-indigo-700",
    Gemini: "bg-sky-100 text-sky-700",
    Claude: "bg-amber-100 text-amber-700",
    "Google AI Overview": "bg-rose-100 text-rose-700"
  },
  generic: {}
};

export function getBadgeClasses(value: string, context: BadgeContext = "generic") {
  return (
    contextMaps[context][value] ??
    {
      Published: "bg-green-100 text-green-700",
      "Needs Review": "bg-amber-100 text-amber-700",
      Declined: "bg-rose-100 text-rose-700"
    }[value] ??
    "bg-slate-100 text-slate-700"
  );
}

interface BadgeProps {
  value?: string | null;
  context?: BadgeContext;
  className?: string;
}

export function Badge({ value, context = "generic", className }: BadgeProps) {
  if (!value) {
    return <span className="text-sm text-slate-400">—</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        getBadgeClasses(value, context),
        className
      )}
    >
      {value}
    </span>
  );
}
