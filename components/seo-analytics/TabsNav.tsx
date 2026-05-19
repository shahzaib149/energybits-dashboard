"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "search", label: COPY.seoAnalytics.tabs.search },
  { id: "pages", label: COPY.seoAnalytics.tabs.pages },
  { id: "sources", label: COPY.seoAnalytics.tabs.sources }
] as const;

export type SEOTabId = (typeof tabs)[number]["id"];

export function TabsNav({ activeTab }: { activeTab: SEOTabId }) {
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
                ? "border border-b-0 border-border bg-surface text-textPrimary"
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
