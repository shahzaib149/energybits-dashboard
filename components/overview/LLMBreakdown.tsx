import type { LLMBreakdown as LLMBreakdownType } from "@/lib/cairrot/types";
import { LLMCard } from "@/components/overview/LLMCard";

export interface LLMBreakdownProps {
  llms: LLMBreakdownType[];
}

export function LLMBreakdown({ llms }: LLMBreakdownProps) {
  if (llms.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-textSecondary">LLM breakdown</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {llms.map((llm) => (
          <LLMCard key={llm.name} llm={llm} />
        ))}
      </div>
    </section>
  );
}
