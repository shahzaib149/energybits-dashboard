import type { Metadata } from "next";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = {
  title: COPY.hub.meta.title,
  description: COPY.hub.meta.description
};

export default function OverviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
