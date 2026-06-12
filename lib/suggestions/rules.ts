import type { AdSuggestion, GoogleAdContext, MetaAdContext } from "./types";

// ─── Thresholds (tunable) ─────────────────────────────────────────────────────

const META = {
  // Attention
  hookRateLow: 20,        // % — below this = weak hook
  hookRateWarn: 25,       // % — below this = hook warning
  // Retention
  thruPlayRateLow: 15,    // % — below this = drop-off issue
  // Click
  ctrAbsLow: 0.8,         // % — absolute CTR floor (PDF: 0.8–1%)
  ctrBelowAvgFactor: 0.6, // relative to account avg
  ctrGoodFactor: 1.3,
  // CPC
  cpcAboveAvgFactor: 1.5,
  // Fatigue
  frequencyFatigue: 2.5,
  frequencyFatigueSevere: 5,
  // ROAS
  roasTarget: 2.0,        // below this = warning
  roasLow: 1.0,           // below this = critical (unprofitable)
  // CPA
  cpaHighMultiple: 2.0,   // CPA > 2× account avg = warning
  // Data
  lowImpressionsMin: 1000
} as const;

const GOOGLE = {
  roasUnprofitable: 1.0,
  roasLow: 2.0,
  roasGood: 4.0,
  ctrBelowAvgFactor: 0.6,
  ctrAbsLow: 1.0,
  zeroConversionsSpendMin: 50,
  optimizationScoreLow: 60,
  lowImpressionsMin: 500
} as const;

let _counter = 0;
function rid(): string { return `rule-${_counter++}`; }

// ─── Meta rules ───────────────────────────────────────────────────────────────

export function runMetaRules(ctx: MetaAdContext): AdSuggestion[] {
  _counter = 0;
  const out: AdSuggestion[] = [];

  // ── Not enough data ────────────────────────────────────────────────────────
  if (ctx.impressions < META.lowImpressionsMin) {
    out.push({
      id: rid(), severity: "info", source: "rules",
      action: "Wait for more delivery data",
      affects: "All metrics",
      detail: `Only ${ctx.impressions.toLocaleString()} impressions — results are unreliable at this volume.`
    });
    return out;
  }

  // ── 1. ATTENTION — Hook rate ───────────────────────────────────────────────
  if (ctx.hookRate > 0) {
    if (ctx.hookRate < META.hookRateLow) {
      out.push({
        id: rid(), severity: "critical", source: "rules",
        action: "Strengthen the opening 3 seconds",
        affects: "Hook Rate",
        detail: `Hook rate is ${ctx.hookRate.toFixed(1)}% (target ≥${META.hookRateWarn}%) — lead with product-in-use, a bold benefit, or a text hook in the first frame.`
      });
    } else if (ctx.hookRate < META.hookRateWarn) {
      out.push({
        id: rid(), severity: "warning", source: "rules",
        action: "Test a stronger visual hook",
        affects: "Hook Rate",
        detail: `Hook rate is ${ctx.hookRate.toFixed(1)}% — just below the ${META.hookRateWarn}% benchmark; try an attention-grabbing opener.`
      });
    }
  }

  // ── 2. RETENTION — Hold / ThruPlay rate ───────────────────────────────────
  if (ctx.thruPlayRate > 0 && ctx.hookRate >= META.hookRateWarn) {
    if (ctx.thruPlayRate < META.thruPlayRateLow) {
      out.push({
        id: rid(), severity: "warning", source: "rules",
        action: "Trim mid-video slow sections",
        affects: "Hold Rate",
        detail: `ThruPlay rate is ${ctx.thruPlayRate.toFixed(1)}% — hook is working but viewers drop off mid-video; shorten or cut to value faster.`
      });
    }
  }

  // ── 3. CLICK — CTR ────────────────────────────────────────────────────────
  const hasAvgCtr = ctx.accountAverageCtrPct > 0;
  const ctrBelowAvg = hasAvgCtr && ctx.ctrPct < ctx.accountAverageCtrPct * META.ctrBelowAvgFactor;
  const ctrAbsLow   = ctx.ctrPct < META.ctrAbsLow;

  if (ctrBelowAvg || ctrAbsLow) {
    out.push({
      id: rid(), severity: "warning", source: "rules",
      action: "Sharpen headline, offer or CTA",
      affects: "CTR",
      detail: hasAvgCtr
        ? `CTR is ${ctx.ctrPct.toFixed(2)}% vs account avg ${ctx.accountAverageCtrPct.toFixed(2)}% — rewrite primary text around a clearer benefit.`
        : `CTR is ${ctx.ctrPct.toFixed(2)}% (benchmark ${META.ctrAbsLow}%) — the creative isn't compelling enough to click.`
    });
  }

  // ── 4. CLICK — CPC ────────────────────────────────────────────────────────
  if (ctx.accountAverageCpc > 0 && ctx.ctrPct >= META.ctrAbsLow && ctx.cpc > ctx.accountAverageCpc * META.cpcAboveAvgFactor) {
    out.push({
      id: rid(), severity: "warning", source: "rules",
      action: "Test a new or broader audience",
      affects: "CPC",
      detail: `CPC is $${ctx.cpc.toFixed(2)} vs account avg $${ctx.accountAverageCpc.toFixed(2)} — CTR is fine so this points to the audience or auction, not the creative.`
    });
  }

  // ── 5. FATIGUE ────────────────────────────────────────────────────────────
  if (ctx.frequency >= META.frequencyFatigueSevere) {
    out.push({
      id: rid(), severity: "critical", source: "rules",
      action: "Rotate creative immediately",
      affects: "Frequency",
      detail: `Frequency is ${ctx.frequency.toFixed(1)}x — severe fatigue; the same audience has seen this ad ${Math.floor(ctx.frequency)}+ times.`
    });
  } else if (ctx.frequency >= META.frequencyFatigue) {
    out.push({
      id: rid(), severity: "warning", source: "rules",
      action: "Refresh creative or expand audience",
      affects: "Frequency",
      detail: `Frequency is ${ctx.frequency.toFixed(1)}x — engagement is likely dropping; try a new hook, angle, or audience segment.`
    });
  }

  // ── 6. CONVERSION — No purchases AND no leads (general post-click issue) ──
  if (ctx.clicks > 50 && ctx.purchases === 0 && ctx.formLeads === 0) {
    out.push({
      id: rid(), severity: "warning", source: "rules",
      action: "Check landing page match and speed",
      affects: "Conversion Rate",
      detail: `${ctx.clicks.toLocaleString()} clicks but 0 conversions — traffic is landing but not converting; check page-offer alignment and load time.`
    });
  }

  // ── 6b. CONVERSION — Leads specifically not converting (purchases OK) ──────
  if (ctx.clicks > 100 && ctx.spend > 20 && ctx.formLeads === 0 && ctx.purchases > 0) {
    out.push({
      id: rid(), severity: "warning", source: "rules",
      action: "Improve form / email-sign-up conversion",
      affects: "Conversion Rate",
      detail: `${ctx.clicks.toLocaleString()} clicks with purchases but 0 form leads — try simplifying the form, clarifying the value prop, or strengthening the incentive to submit.`
    });
  }

  // ── 7. EFFICIENCY — ROAS ──────────────────────────────────────────────────
  if (ctx.roas > 0) {
    if (ctx.roas < META.roasLow) {
      out.push({
        id: rid(), severity: "critical", source: "rules",
        action: "Pause ad — ROAS is unprofitable",
        affects: "ROAS",
        detail: `ROAS is ${ctx.roas.toFixed(2)}x — spending more than earning; diagnose funnel leaks before adding more budget.`
      });
    } else if (ctx.roas < META.roasTarget) {
      out.push({
        id: rid(), severity: "warning", source: "rules",
        action: "Find and fix the funnel leak",
        affects: "ROAS",
        detail: `ROAS is ${ctx.roas.toFixed(2)}x (target ${META.roasTarget}x) — shift budget toward top performers and pause weakest ads.`
      });
    }
  }

  // ── 8. POSITIVE signal ────────────────────────────────────────────────────
  if (hasAvgCtr && ctx.ctrPct >= ctx.accountAverageCtrPct * META.ctrGoodFactor) {
    out.push({
      id: rid(), severity: "good", source: "rules",
      action: "Scale budget or broaden audience",
      affects: "CTR",
      detail: `CTR of ${ctx.ctrPct.toFixed(2)}% is well above the account average — strong creative signal worth scaling.`
    });
  }

  if (ctx.roas > 0 && ctx.accountAverageRoas > 0 && ctx.roas >= ctx.accountAverageRoas * 1.5) {
    out.push({
      id: rid(), severity: "good", source: "rules",
      action: "Increase budget — ROAS is strong",
      affects: "ROAS",
      detail: `ROAS of ${ctx.roas.toFixed(2)}x is significantly above account average — this ad is worth scaling.`
    });
  }

  return out;
}

// ─── Google rules ─────────────────────────────────────────────────────────────

export function runGoogleRules(ctx: GoogleAdContext): AdSuggestion[] {
  _counter = 0;
  const out: AdSuggestion[] = [];
  const t = GOOGLE;

  if (ctx.impressions < t.lowImpressionsMin) {
    out.push({
      id: rid(), severity: "info", source: "rules",
      action: "Increase budget or wait for data",
      affects: "All metrics",
      detail: `Only ${ctx.impressions.toLocaleString()} impressions — increase budget or wait before optimising.`
    });
    return out;
  }

  if (ctx.roas > 0 && ctx.roas < t.roasUnprofitable) {
    out.push({
      id: rid(), severity: "critical", source: "rules",
      action: "Pause and fix targeting now",
      affects: "ROAS",
      detail: `ROAS is ${ctx.roas.toFixed(2)}x — spending more than earning; pause before more budget is consumed.`
    });
  } else if (ctx.roas > 0 && ctx.roas < t.roasLow) {
    out.push({
      id: rid(), severity: "warning", source: "rules",
      action: "Review keywords and landing page",
      affects: "ROAS",
      detail: `ROAS is ${ctx.roas.toFixed(2)}x — review keyword match types, add negatives, and check landing page relevance.`
    });
  }

  if (ctx.conversions === 0 && ctx.spend > t.zeroConversionsSpendMin) {
    out.push({
      id: rid(), severity: "warning", source: "rules",
      action: "Check conversion tracking setup",
      affects: "Conversions",
      detail: `$${ctx.spend.toFixed(0)} spent with zero conversions — verify tracking and landing page load time.`
    });
  }

  const hasAvgCtr = ctx.accountAverageCtrPct > 0;
  if ((hasAvgCtr && ctx.ctrPct < ctx.accountAverageCtrPct * t.ctrBelowAvgFactor) || ctx.ctrPct < t.ctrAbsLow) {
    out.push({
      id: rid(), severity: "warning", source: "rules",
      action: "Rewrite headlines to match intent",
      affects: "CTR",
      detail: hasAvgCtr
        ? `CTR is ${ctx.ctrPct.toFixed(2)}% vs account avg ${ctx.accountAverageCtrPct.toFixed(2)}% — tighten keyword match types.`
        : `CTR is ${ctx.ctrPct.toFixed(2)}% — rewrite headlines to match search intent more closely.`
    });
  }

  if (ctx.optimizationScore > 0 && ctx.optimizationScore < t.optimizationScoreLow) {
    out.push({
      id: rid(), severity: "warning", source: "rules",
      action: "Apply Google's pending recommendations",
      affects: "Opt. Score",
      detail: `Campaign optimization score is ${ctx.optimizationScore.toFixed(0)}% — apply pending recommendations in Google Ads.`
    });
  }

  if (ctx.roas >= t.roasGood) {
    out.push({
      id: rid(), severity: "good", source: "rules",
      action: "Increase budget or duplicate ad group",
      affects: "ROAS",
      detail: `ROAS of ${ctx.roas.toFixed(2)}x is performing well — scale budget or duplicate to capture more volume.`
    });
  }

  return out;
}
