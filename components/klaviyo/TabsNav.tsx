"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "overview", label: COPY.klaviyo.tabs.overview },
  { id: "metrics", label: COPY.klaviyo.tabs.metrics },
  { id: "records", label: COPY.klaviyo.tabs.records }
] as const;

export type KlaviyoTabId = (typeof tabs)[number]["id"];

export function TabsNav({ activeTab }: { activeTab: KlaviyoTabId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-1">
      {tabs.map((tab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab.id);
        const href = `${pathname}?${params.toString()}`;
        return (
          <Link
            key={tab.id}
            href={href}
            className={cn(
              "rounded-t-lg px-4 py-2.5 text-sm font-medium transition",
              activeTab === tab.id
                ? "border border-b-0 border-emerald-500/40 bg-surface text-emerald-200"
                : "text-textSecondary hover:bg-surfaceElevated hover:text-textPrimary"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
