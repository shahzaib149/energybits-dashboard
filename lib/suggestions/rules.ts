import type { AdSuggestion, GoogleAdContext, MetaAdContext } from "./types";

const THRESHOLDS = {
  meta: {
    frequencyFatigue: 3,
    frequencyFatigueSevere: 5,
    ctrBelowAverageFactor: 0.6,
    ctrAbsoluteMinPct: 0.5,
    cpcAboveAverageFactor: 1.5,
    ctrGoodFactor: 1.3,
    lowImpressionsMin: 1000
  },
  google: {
    roasUnprofitable: 1.0,
    roasLow: 2.0,
    roasGood: 4.0,
    ctrBelowAverageFactor: 0.6,
    ctrAbsoluteMinPct: 1.0,
    zeroConversionsSpendMin: 50,
    optimizationScoreLow: 60,
    lowImpressionsMin: 500
  }
} as const;

let _ruleCounter = 0;
function ruleId(): string { return `rule-${_ruleCounter++}`; }

export function runMetaRules(ctx: MetaAdContext): AdSuggestion[] {
  _ruleCounter = 0;
  const suggestions: AdSuggestion[] = [];
  const t = THRESHOLDS.meta;

  if (ctx.impressions < t.lowImpressionsMin) {
    suggestions.push({
      id: ruleId(), severity: "info",
      action: "Wait for more delivery data",
      affects: "All metrics",
      detail: `Only ${ctx.impressions.toLocaleString()} impressions — results are unreliable at this volume.`,
      source: "rules"
    });
    return suggestions;
  }

  if (ctx.frequency >= t.frequencyFatigueSevere) {
    suggestions.push({
      id: ruleId(), severity: "critical",
      action: "Rotate creative immediately",
      affects: "Frequency",
      detail: `Frequency is ${ctx.frequency.toFixed(1)}x — each person has seen this ad ${Math.floor(ctx.frequency)}+ times.`,
      source: "rules"
    });
  } else if (ctx.frequency >= t.frequencyFatigue) {
    suggestions.push({
      id: ruleId(), severity: "warning",
      action: "Introduce a fresh creative variant",
      affects: "Frequency",
      detail: `Frequency is ${ctx.frequency.toFixed(1)}x — audience is seeing this ad repeatedly.`,
      source: "rules"
    });
  }

  const hasAccountCtr = ctx.accountAverageCtrPct > 0;
  const ctrBelowAvg = hasAccountCtr && ctx.ctrPct < ctx.accountAverageCtrPct * t.ctrBelowAverageFactor;
  const ctrAbsolutelyLow = ctx.ctrPct < t.ctrAbsoluteMinPct;

  if (ctrBelowAvg || ctrAbsolutelyLow) {
    suggestions.push({
      id: ruleId(), severity: "warning",
      action: "Test a stronger hook or visual",
      affects: "CTR",
      detail: hasAccountCtr
        ? `CTR is ${ctx.ctrPct.toFixed(2)}% vs account avg ${ctx.accountAverageCtrPct.toFixed(2)}% — opening frame isn't grabbing attention.`
        : `CTR is ${ctx.ctrPct.toFixed(2)}% — below the ${t.ctrAbsoluteMinPct}% baseline; try a more direct CTA.`,
      source: "rules"
    });
  }

  if (ctx.accountAverageCpc > 0 && ctx.cpc > ctx.accountAverageCpc * t.cpcAboveAverageFactor) {
    suggestions.push({
      id: ruleId(), severity: "warning",
      action: "Review audience overlap or bid caps",
      affects: "CPC",
      detail: `CPC is $${ctx.cpc.toFixed(2)} vs account avg $${ctx.accountAverageCpc.toFixed(2)} — paying a premium per click.`,
      source: "rules"
    });
  }

  if (hasAccountCtr && ctx.ctrPct >= ctx.accountAverageCtrPct * t.ctrGoodFactor) {
    suggestions.push({
      id: ruleId(), severity: "good",
      action: "Scale budget or broaden audience",
      affects: "CTR",
      detail: `CTR of ${ctx.ctrPct.toFixed(2)}% is above account average — strong creative signal.`,
      source: "rules"
    });
  }

  return suggestions;
}

export function runGoogleRules(ctx: GoogleAdContext): AdSuggestion[] {
  _ruleCounter = 0;
  const suggestions: AdSuggestion[] = [];
  const t = THRESHOLDS.google;

  if (ctx.impressions < t.lowImpressionsMin) {
    suggestions.push({
      id: ruleId(), severity: "info",
      action: "Increase budget or wait for data",
      affects: "All metrics",
      detail: `Only ${ctx.impressions.toLocaleString()} impressions — increase budget or wait before optimising.`,
      source: "rules"
    });
    return suggestions;
  }

  if (ctx.roas > 0 && ctx.roas < t.roasUnprofitable) {
    suggestions.push({
      id: ruleId(), severity: "critical",
      action: "Pause and fix targeting now",
      affects: "ROAS",
      detail: `ROAS is ${ctx.roas.toFixed(2)}x — spending more than earning; pause before more budget is consumed.`,
      source: "rules"
    });
  } else if (ctx.roas > 0 && ctx.roas < t.roasLow) {
    suggestions.push({
      id: ruleId(), severity: "warning",
      action: "Review keywords and landing page",
      affects: "ROAS",
      detail: `ROAS is ${ctx.roas.toFixed(2)}x — review keyword match types, add negatives, and check landing page relevance.`,
      source: "rules"
    });
  }

  if (ctx.conversions === 0 && ctx.spend > t.zeroConversionsSpendMin) {
    suggestions.push({
      id: ruleId(), severity: "warning",
      action: "Check conversion tracking setup",
      affects: "Conversions",
      detail: `$${ctx.spend.toFixed(0)} spent with zero conversions — verify tracking and landing page load time.`,
      source: "rules"
    });
  }

  const hasAccountCtr = ctx.accountAverageCtrPct > 0;
  const ctrBelowAvg = hasAccountCtr && ctx.ctrPct < ctx.accountAverageCtrPct * t.ctrBelowAverageFactor;
  const ctrAbsolutelyLow = ctx.ctrPct < t.ctrAbsoluteMinPct;

  if (ctrBelowAvg || ctrAbsolutelyLow) {
    suggestions.push({
      id: ruleId(), severity: "warning",
      action: "Rewrite headlines to match intent",
      affects: "CTR",
      detail: hasAccountCtr
        ? `CTR is ${ctx.ctrPct.toFixed(2)}% vs account avg ${ctx.accountAverageCtrPct.toFixed(2)}% — tighten keyword match types.`
        : `CTR is ${ctx.ctrPct.toFixed(2)}% — rewrite headlines to match search intent more closely.`,
      source: "rules"
    });
  }

  if (ctx.optimizationScore > 0 && ctx.optimizationScore < t.optimizationScoreLow) {
    suggestions.push({
      id: ruleId(), severity: "warning",
      action: "Apply Google's pending recommendations",
      affects: "Opt. Score",
      detail: `Campaign optimization score is ${ctx.optimizationScore.toFixed(0)}% — apply pending recommendations in Google Ads.`,
      source: "rules"
    });
  }

  if (ctx.roas >= t.roasGood) {
    suggestions.push({
      id: ruleId(), severity: "good",
      action: "Increase budget or duplicate ad group",
      affects: "ROAS",
      detail: `ROAS of ${ctx.roas.toFixed(2)}x is performing well — scale budget or duplicate to capture more volume.`,
      source: "rules"
    });
  }

  return suggestions;
}
