"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PreviewButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      onClick={(event) => event.stopPropagation()}
      className="inline-flex items-center gap-1 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-100"
    >
      Preview
      <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  );
}
