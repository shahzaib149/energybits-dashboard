"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "campaigns", label: COPY.googleAds.tabs.campaigns },
  { id: "ad-groups", label: COPY.googleAds.tabs.adGroups },
  { id: "creatives", label: COPY.googleAds.tabs.creatives },
  { id: "keywords", label: COPY.googleAds.tabs.keywords }
] as const;

export type GoogleAdsTabId = (typeof tabs)[number]["id"];

export function TabsNav({ activeTab }: { activeTab: GoogleAdsTabId }) {
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
                ? "border border-b-0 border-amber-500/40 bg-surface text-amber-200"
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
