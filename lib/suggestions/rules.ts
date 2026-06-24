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

  // ── Low impressions guard ──────────────────────────────────────────────────
  if (ctx.impressions < t.lowImpressionsMin) {
    out.push({
      id: rid(), severity: "info", source: "rules",
      action: "Increase budget or wait for data",
      affects: "All metrics",
      detail: `Only ${ctx.impressions.toLocaleString()} impressions — increase budget or wait before optimising.`
    });
    return out;
  }

  // ── Baseline resolution ────────────────────────────────────────────────────
  // Campaign trailing baseline preferred; fall back to account average
  const baselineCtr = (ctx.campaignBaselineCtrPct ?? 0) > 0
    ? ctx.campaignBaselineCtrPct!
    : ctx.accountAverageCtrPct;
  const baselineCvr = (ctx.campaignBaselineCvr ?? 0) > 0
    ? ctx.campaignBaselineCvr!
    : ctx.accountAverageConversionRatePct;

  const hasBaselineCtr = baselineCtr > 0;
  const hasBaselineCvr = baselineCvr > 0 && ctx.conversions > 0;

  // Low = <0.75× baseline (or <1.0% absolute); High = >1.25× baseline (or >2.0% absolute)
  const ctrLow  = hasBaselineCtr ? ctx.ctrPct < baselineCtr * 0.75 : ctx.ctrPct < t.ctrAbsLow;
  const ctrHigh = hasBaselineCtr ? ctx.ctrPct > baselineCtr * 1.25 : ctx.ctrPct >= t.ctrAbsLow * 2;
  const cvrLow  = hasBaselineCvr && ctx.conversionRatePct < baselineCvr * 0.75;
  const cvrHigh = hasBaselineCvr && ctx.conversionRatePct > baselineCvr * 1.25;

  // ── 4-State CTR/CVR diagnostic ─────────────────────────────────────────────
  if (ctrLow && cvrLow) {
    // State 3: Both below baseline → structural / targeting issue
    out.push({
      id: rid(), severity: "critical", source: "rules",
      action: "Audit targeting and keyword match types",
      affects: "CTR + CVR",
      detail: hasBaselineCtr && hasBaselineCvr
        ? `CTR ${ctx.ctrPct.toFixed(2)}% and CVR ${ctx.conversionRatePct.toFixed(2)}% are both below campaign baseline — structural keyword and targeting review needed.`
        : `CTR ${ctx.ctrPct.toFixed(2)}% and CVR ${ctx.conversionRatePct.toFixed(2)}% are both weak — review keyword relevance and match types.`
    });
  } else if (ctrLow && !cvrLow) {
    // State 1: Low CTR only → ad copy / creative issue
    out.push({
      id: rid(), severity: "warning", source: "rules",
      action: "Rewrite ad copy to match search intent",
      affects: "CTR",
      detail: hasBaselineCtr
        ? `CTR ${ctx.ctrPct.toFixed(2)}% is below campaign baseline ${baselineCtr.toFixed(2)}% — landing page converts but ad copy isn't compelling enough to click.`
        : `CTR ${ctx.ctrPct.toFixed(2)}% is below ${t.ctrAbsLow}% benchmark — rewrite headlines to match search intent more closely.`
    });
  } else if (ctrHigh && cvrLow) {
    // State 2: High CTR + Low CVR → landing page / intent mismatch
    out.push({
      id: rid(), severity: "critical", source: "rules",
      action: "Fix landing page and offer mismatch",
      affects: "CVR",
      detail: hasBaselineCtr && hasBaselineCvr
        ? `CTR ${ctx.ctrPct.toFixed(2)}% exceeds baseline but CVR ${ctx.conversionRatePct.toFixed(2)}% is below — ad promise doesn't match the landing page experience.`
        : `CTR is strong but CVR ${ctx.conversionRatePct.toFixed(2)}% is low — check ad-to-page promise alignment and traffic intent.`
    });
  } else if (ctrHigh && cvrHigh) {
    // State 4: Both above baseline → scale it
    out.push({
      id: rid(), severity: "good", source: "rules",
      action: "Scale budget — CTR and CVR both strong",
      affects: "CTR + CVR",
      detail: hasBaselineCtr && hasBaselineCvr
        ? `CTR ${ctx.ctrPct.toFixed(2)}% and CVR ${ctx.conversionRatePct.toFixed(2)}% both exceed campaign baseline — increase budget or duplicate to new audiences.`
        : `Both CTR and CVR are above average — strong on click and conversion metrics; scale budget.`
    });
  } else if (ctrHigh && !hasBaselineCvr) {
    // High CTR but no CVR baseline available
    out.push({
      id: rid(), severity: "good", source: "rules",
      action: "Scale budget — strong CTR signal",
      affects: "CTR",
      detail: `CTR ${ctx.ctrPct.toFixed(2)}% exceeds ${hasBaselineCtr ? `campaign baseline ${baselineCtr.toFixed(2)}%` : "benchmark"} — consider scaling budget or duplicating to new audiences.`
    });
  }

  // ── ROAS ──────────────────────────────────────────────────────────────────
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

  // ── Zero conversions with significant spend ────────────────────────────────
  if (ctx.conversions === 0 && ctx.spend > t.zeroConversionsSpendMin) {
    out.push({
      id: rid(), severity: "warning", source: "rules",
      action: "Check conversion tracking setup",
      affects: "Conversions",
      detail: `$${ctx.spend.toFixed(0)} spent with zero conversions — verify tracking tags and landing page load time.`
    });
  }

  // ── Strong ROAS — scale signal ─────────────────────────────────────────────
  if (ctx.roas >= t.roasGood) {
    out.push({
      id: rid(), severity: "good", source: "rules",
      action: "Increase budget or duplicate ad group",
      affects: "ROAS",
      detail: `ROAS of ${ctx.roas.toFixed(2)}x is performing well — scale budget or duplicate the ad group to capture more volume.`
    });
  }

  return out;
}
