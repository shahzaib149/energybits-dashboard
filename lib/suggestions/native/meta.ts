import type { AdSuggestion, MetaAdContext } from "../types";

type RankingEntry = { severity: AdSuggestion["severity"]; action: string; detail: string };

const QUALITY_MAP: Record<string, RankingEntry> = {
  ABOVE_AVERAGE: {
    severity: "good",
    action: "Scale budget or expand audience",
    detail: "Meta rates creative quality as above average — strong signal to scale."
  },
  BELOW_AVERAGE_20: {
    severity: "warning",
    action: "Review creative-audience mismatch",
    detail: "Meta flags quality as below average; check for misleading claims, excessive text, or landing page mismatch."
  },
  BELOW_AVERAGE_35: {
    severity: "warning",
    action: "Remove engagement bait or text overlay",
    detail: "Bottom 35% quality — signals engagement-bait language or image text above 20%."
  },
  BELOW_AVERAGE_10: {
    severity: "critical",
    action: "Pause and redesign creative",
    detail: "Bottom 10% quality — ad is generating negative user signals such as 'not relevant' reports."
  }
};

const ENGAGEMENT_MAP: Record<string, RankingEntry> = {
  ABOVE_AVERAGE: {
    severity: "good",
    action: "Scale or test Advantage+ audience",
    detail: "Meta rates engagement as above average — test higher budgets or lookalike expansion."
  },
  BELOW_AVERAGE_20: {
    severity: "warning",
    action: "Test stronger hook or carousel",
    detail: "Engagement is below average — switch from static to Reels or carousel to improve the opening hook."
  },
  BELOW_AVERAGE_35: {
    severity: "warning",
    action: "Refresh opening frame and headline",
    detail: "Bottom 35% engagement — opening frame isn't stopping the scroll; lead with a bold claim."
  },
  BELOW_AVERAGE_10: {
    severity: "critical",
    action: "Pause and refresh creative entirely",
    detail: "Bottom 10% engagement — creative format or hook is failing to capture attention."
  }
};

const CONVERSION_MAP: Record<string, RankingEntry> = {
  ABOVE_AVERAGE: {
    severity: "good",
    action: "Scale budget or add lookalike",
    detail: "Meta rates post-click conversion as above average — scale budget or expand to a lookalike audience."
  },
  BELOW_AVERAGE_20: {
    severity: "warning",
    action: "Review landing page and offer clarity",
    detail: "Post-click conversion is below average — review landing page relevance and offer match to creative."
  },
  BELOW_AVERAGE_35: {
    severity: "warning",
    action: "Test a more targeted offer",
    detail: "Bottom 35% conversion — landing page or offer likely has a mismatch with this audience."
  },
  BELOW_AVERAGE_10: {
    severity: "critical",
    action: "Pause and redesign post-click funnel",
    detail: "Bottom 10% conversion — creative audience and landing page are misaligned."
  }
};

function rankingSignal(
  map: Record<string, RankingEntry>,
  rawValue: string,
  id: string,
  affects: string,
  link?: string
): AdSuggestion | null {
  const key = rawValue?.trim().toUpperCase();
  if (!key || key === "AVERAGE") return null;
  const entry = map[key];
  if (!entry) return null;
  return {
    id,
    severity: entry.severity,
    action: entry.action,
    affects,
    detail: entry.detail,
    source: "native",
    link: link || undefined
  };
}

/** Surfaces Meta's three native relevance-ranking signals as structured suggestions. */
export function getMetaNativeSuggestions(ctx: MetaAdContext): AdSuggestion[] {
  const link = ctx.adLink || undefined;
  return [
    rankingSignal(QUALITY_MAP,    ctx.qualityRanking,          "native-meta-quality-ranking",     "Quality Ranking",    link),
    rankingSignal(ENGAGEMENT_MAP, ctx.engagementRateRanking,   "native-meta-engagement-ranking",  "Engagement Ranking", link),
    rankingSignal(CONVERSION_MAP, ctx.conversionRateRanking,   "native-meta-conv-ranking",        "Conversion Ranking", link)
  ].filter((s): s is AdSuggestion => s !== null);
}
