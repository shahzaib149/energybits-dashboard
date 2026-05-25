import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SaveStatus } from "@/hooks/useEditableRecord";

export type EditorTheme = "light" | "dark";

export function SaveIndicator({
  status,
  children,
  editable,
  theme = "light"
}: {
  status: SaveStatus;
  children: ReactNode;
  editable?: boolean;
  theme?: EditorTheme;
}) {
  const isDark = theme === "dark";

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "rounded-lg border border-transparent transition-all",
        editable && (isDark ? "cursor-pointer hover:border-brand/30" : "cursor-pointer hover:border-blue-200"),
        status === "saving" &&
          (isDark ? "animate-pulse border-brand/40 bg-brand/10" : "animate-pulse border-blue-300 bg-blue-50/70"),
        status === "success" && (isDark ? "border-brand/40 bg-brand/10" : "border-emerald-300 bg-emerald-50"),
        status === "error" && (isDark ? "border-competitor/40 bg-competitor/10" : "border-rose-300 bg-rose-50")
      )}
    >
      {children}
    </div>
  );
}
