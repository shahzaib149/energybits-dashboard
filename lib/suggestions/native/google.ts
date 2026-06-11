import type { AdSuggestion, GoogleAdContext } from "../types";

// Google Ads optimization score is synced at campaign level via the existing
// Make.com → Airtable flow (GoogleAdsCampaignRow.optimizationScore).
// We surface it here as a native signal so the AI layer knows it's platform-authoritative.

const OPT_SCORE_CRITICAL_THRESHOLD = 40;
const OPT_SCORE_WARNING_THRESHOLD = 60;

/** Surfaces Google's campaign optimization score as a structured native signal. */
export function getGoogleNativeSuggestions(ctx: GoogleAdContext): AdSuggestion[] {
  const suggestions: AdSuggestion[] = [];
  const score = ctx.optimizationScore;

  if (score <= 0) return suggestions; // score not available

  if (score < OPT_SCORE_CRITICAL_THRESHOLD) {
    suggestions.push({
      id: "native-google-opt-score",
      severity: "critical",
      action: "Apply pending Google recommendations",
      affects: "Opt. Score",
      detail: `Campaign optimization score is ${score.toFixed(0)}% — well below threshold; apply pending automated recommendations now.`,
      source: "native"
    });
  } else if (score < OPT_SCORE_WARNING_THRESHOLD) {
    suggestions.push({
      id: "native-google-opt-score",
      severity: "warning",
      action: "Review Google optimization suggestions",
      affects: "Opt. Score",
      detail: `Campaign optimization score is ${score.toFixed(0)}% — review and apply recommended changes in Google Ads.`,
      source: "native"
    });
  }

  return suggestions;
}
