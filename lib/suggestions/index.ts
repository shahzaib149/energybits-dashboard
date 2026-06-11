import type { AdContext, AdSuggestion, SuggestionSeverity } from "./types";
import { runMetaRules, runGoogleRules } from "./rules";
import { getAISuggestions } from "./ai";
import { getMetaNativeSuggestions } from "./native/meta";
import { getGoogleNativeSuggestions } from "./native/google";

const SEVERITY_ORDER: Record<SuggestionSeverity, number> = {
  critical: 0,
  warning: 1,
  good: 2,
  info: 3
};

function deduplicateByTitle(suggestions: AdSuggestion[]): AdSuggestion[] {
  const seen = new Set<string>();
  return suggestions.filter((s) => {
    const key = s.action.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortBySeverity(suggestions: AdSuggestion[]): AdSuggestion[] {
  return [...suggestions].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );
}

/**
 * Combines three sources into a single ranked list:
 *   1. Native platform signals  (authoritative, always run)
 *   2. Deterministic rule checks (always run, never fail)
 *   3. Claude AI synthesis      (server-side only, falls back to [] on failure)
 *
 * Results are deduplicated by title prefix and sorted critical → warning → good → info.
 */
export async function getAdRecommendations(ctx: AdContext): Promise<AdSuggestion[]> {
  const native =
    ctx.platform === "meta"
      ? getMetaNativeSuggestions(ctx)
      : getGoogleNativeSuggestions(ctx);

  const rules =
    ctx.platform === "meta"
      ? runMetaRules(ctx)
      : runGoogleRules(ctx);

  const deterministic = [...native, ...rules];

  const ai = await getAISuggestions(ctx, deterministic);

  return sortBySeverity(deduplicateByTitle([...deterministic, ...ai]));
}
