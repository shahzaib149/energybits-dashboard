import type { LLMBreakdown as LLMBreakdownType } from "@/lib/cairrot/types";
import { COPY } from "@/lib/copy";
import { ColorLegend } from "@/components/overview/ColorLegend";
import { LLMCard } from "@/components/overview/LLMCard";
import { SectionTitle } from "@/components/ui/SectionTitle";

export interface LLMBreakdownProps {
  llms: LLMBreakdownType[];
}

export function LLMBreakdown({ llms }: LLMBreakdownProps) {
  const copy = COPY.overview.llmBreakdown;

  if (llms.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <ColorLegend />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {llms.map((llm) => (
          <LLMCard key={llm.name} llm={llm} />
        ))}
      </div>
    </section>
  );
}
