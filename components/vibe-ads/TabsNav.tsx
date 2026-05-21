"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "overview", label: COPY.vibeAds.tabs.overview },
  { id: "campaigns", label: COPY.vibeAds.tabs.campaigns },
  { id: "channels", label: COPY.vibeAds.tabs.channels },
  { id: "creatives", label: COPY.vibeAds.tabs.creatives },
  { id: "detail", label: COPY.vibeAds.tabs.detail }
] as const;

export type VibeAdsTabId = (typeof tabs)[number]["id"];

export function TabsNav({ activeTab }: { activeTab: VibeAdsTabId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-1">
      {tabs.map((tab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab.id);
        const href = `${pathname}?${params.toString()}`;
        return (
          <Link key={tab.id} href={href} className={cn("rounded-t-lg px-4 py-2.5 text-sm font-medium transition", activeTab === tab.id ? "border border-b-0 border-violet-500/40 bg-surface text-violet-200" : "text-textSecondary hover:bg-surfaceElevated hover:text-textPrimary")}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
