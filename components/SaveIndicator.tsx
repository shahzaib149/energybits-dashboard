import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SaveStatus } from "@/hooks/useEditableRecord";

export function SaveIndicator({
  status,
  children,
  editable
}: {
  status: SaveStatus;
  children: ReactNode;
  editable?: boolean;
}) {
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "rounded-lg border border-transparent transition-all",
        editable ? "cursor-pointer hover:border-blue-200" : "",
        status === "saving" ? "animate-pulse border-blue-300 bg-blue-50/70" : "",
        status === "success" ? "border-emerald-300 bg-emerald-50" : "",
        status === "error" ? "border-rose-300 bg-rose-50" : ""
      )}
    >
      {children}
    </div>
  );
}
