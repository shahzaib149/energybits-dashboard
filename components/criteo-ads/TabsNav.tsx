"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "overview", label: COPY.criteoAds.tabs.overview },
  { id: "campaigns", label: COPY.criteoAds.tabs.campaigns },
  { id: "ads", label: COPY.criteoAds.tabs.ads },
  { id: "daily", label: COPY.criteoAds.tabs.daily }
] as const;

export type CriteoAdsTabId = (typeof tabs)[number]["id"];

export function TabsNav({ activeTab }: { activeTab: CriteoAdsTabId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-1">
      {tabs.map((tab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab.id);
        const href = `${pathname}?${params.toString()}`;
        const active = activeTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={href}
            className={cn(
              "rounded-t-lg px-4 py-2.5 text-sm font-medium transition",
              active
                ? "border border-b-0 border-orange-500/40 bg-surface text-orange-200"
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
