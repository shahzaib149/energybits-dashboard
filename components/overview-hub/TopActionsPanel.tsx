import { Info } from "lucide-react";
import { fetchTopActions } from "@/lib/overview/top-actions";
import { COPY } from "@/lib/copy";
import type { DateRange } from "@/lib/date-range/types";
import { TopActionsList } from "@/components/overview-hub/ActionCard";
import type { Role } from "@/lib/auth/permissions";
import { permissions } from "@/lib/auth/permissions";

export async function TopActionsPanel({
  userRole,
  dateRange
}: {
  userRole: Role | null;
  dateRange?: DateRange;
}) {
  const { actions } = await fetchTopActions(dateRange);
  const canDismiss = userRole !== null && permissions.canDismissTopAction(userRole);
  const copy = COPY.overview.topActions;

  return (
    <section className="border-b border-border px-6 py-6 sm:px-8">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-textPrimary">{copy.title}</h3>
          <p className="mt-1 text-sm text-textSecondary">{copy.subtitle}</p>
        </div>
        <span className="shrink-0 text-textMuted" title={copy.panelTooltip}>
          <Info className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <div className="mt-4">
        <TopActionsList initialActions={actions} canDismiss={canDismiss} />
      </div>
    </section>
  );
}
