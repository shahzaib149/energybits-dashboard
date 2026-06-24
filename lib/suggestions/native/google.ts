import type { AdSuggestion, GoogleAdContext } from "../types";

let _n = 0;
function nid(): string { return `native-google-${_n++}`; }

const QS_BELOW = "Below Average";

export function getGoogleNativeSuggestions(ctx: GoogleAdContext): AdSuggestion[] {
  _n = 0;
  const out: AdSuggestion[] = [];

  // ── 1. Optimization Score ──────────────────────────────────────────────────
  const score = ctx.optimizationScore;
  if (score > 0) {
    if (score < 40) {
      out.push({
        id: nid(), severity: "critical", source: "native",
        action: "Apply pending Google recommendations",
        affects: "Opt. Score",
        detail: `Campaign optimization score is ${score.toFixed(0)}% — well below threshold; apply pending recommendations now.`
      });
    } else if (score < 60) {
      out.push({
        id: nid(), severity: "warning", source: "native",
        action: "Review Google optimization suggestions",
        affects: "Opt. Score",
        detail: `Campaign optimization score is ${score.toFixed(0)}% — review and apply recommended changes in Google Ads.`
      });
    }
  }

  // ── 2. Ad Strength ─────────────────────────────────────────────────────────
  const strength = ctx.adStrength ?? "";
  if (strength === "Poor") {
    out.push({
      id: nid(), severity: "critical", source: "native",
      action: "Add headlines and descriptions now",
      affects: "Ad Strength",
      detail: `Ad strength is Poor — add more unique headlines and descriptions to unlock better auction eligibility.`
    });
  } else if (strength === "Low") {
    out.push({
      id: nid(), severity: "warning", source: "native",
      action: "Diversify ad headlines and assets",
      affects: "Ad Strength",
      detail: `Ad strength is Low — add varied headlines and at least 4 descriptions to reach Good or Best.`
    });
  } else if (strength === "Best") {
    out.push({
      id: nid(), severity: "good", source: "native",
      action: "Maintain and scale asset coverage",
      affects: "Ad Strength",
      detail: `Ad strength is Best — all asset slots are well-filled; focus on testing new creative angle variations.`
    });
  }

  // ── 3. Quality Score sub-components ───────────────────────────────────────
  if (ctx.qualityScoreAdRelevance === QS_BELOW) {
    out.push({
      id: nid(), severity: "warning", source: "native",
      action: "Align headlines with ad group keywords",
      affects: "Quality Score",
      detail: `Ad Relevance is Below Average — rewrite headlines to mirror exact keyword intent in this ad group.`
    });
  }
  if (ctx.qualityScoreLandingPage === QS_BELOW) {
    out.push({
      id: nid(), severity: "warning", source: "native",
      action: "Match landing page to ad keywords",
      affects: "Quality Score",
      detail: `Landing Page Experience is Below Average — ensure the target keyword appears in the page headline, body, and URL.`
    });
  }
  if (ctx.qualityScoreExpectedCtr === QS_BELOW) {
    out.push({
      id: nid(), severity: "warning", source: "native",
      action: "Rewrite headlines for higher CTR",
      affects: "Quality Score",
      detail: `Expected CTR is Below Average — include a clear benefit, a number, or urgency in the top headline.`
    });
  }

  // ── 4. Lost Impression Share ───────────────────────────────────────────────
  const lostBudget = ctx.impressionShareLostBudget ?? 0;
  const lostRank   = ctx.impressionShareLostRank ?? 0;
  if (lostBudget > 20) {
    out.push({
      id: nid(), severity: lostBudget > 50 ? "critical" : "warning", source: "native",
      action: "Increase campaign daily budget",
      affects: "Impression Share",
      detail: `${lostBudget.toFixed(0)}% of impressions lost to budget limits — campaigns are capped during peak-demand hours.`
    });
  }
  if (lostRank > 20) {
    out.push({
      id: nid(), severity: lostRank > 50 ? "critical" : "warning", source: "native",
      action: "Improve Quality Score or raise bid",
      affects: "Impression Share",
      detail: `${lostRank.toFixed(0)}% of impressions lost to rank — improve ad relevance or adjust the bid strategy.`
    });
  }

  // ── 5. Video completion quartiles + frequency ─────────────────────────────
  const isVideo = ctx.adType?.includes("VIDEO") || ctx.adType?.includes("DEMAND_GEN");
  if (isVideo) {
    const q25  = ctx.videoQ25  ?? 0;
    const q50  = ctx.videoQ50  ?? 0;
    const q75  = ctx.videoQ75  ?? 0;
    const q100 = ctx.videoQ100 ?? 0;

    if (q25 > 0 && q50 > 0) {
      const drop25 = q25 - q50;
      const drop50 = q75 > 0 ? q50 - q75 : 0;
      const drop75 = q100 > 0 && q75 > 0 ? q75 - q100 : 0;

      if (drop25 > 25) {
        out.push({
          id: nid(), severity: "warning", source: "native",
          action: "Fix mid-video pacing (25–50% drop-off)",
          affects: "Video Completion",
          detail: `${drop25.toFixed(0)}% of viewers drop between 25% and 50% — tighten pacing or cut slow mid-section content.`
        });
      } else if (drop50 > 20) {
        out.push({
          id: nid(), severity: "warning", source: "native",
          action: "Add midpoint hook or CTA at 50%",
          affects: "Video Completion",
          detail: `${drop50.toFixed(0)}% of viewers drop between 50% and 75% — introduce a hook or CTA at the halfway point.`
        });
      } else if (drop75 > 15) {
        out.push({
          id: nid(), severity: "info", source: "native",
          action: "Move CTA earlier in the video",
          affects: "Video Completion",
          detail: `${drop75.toFixed(0)}% of viewers drop in the final stretch — place the CTA earlier to capture near-completers.`
        });
      }
    }

    const freq = ctx.frequency ?? 0;
    if (freq >= 5) {
      out.push({
        id: nid(), severity: "critical", source: "native",
        action: "Rotate video creative immediately",
        affects: "Frequency",
        detail: `Frequency is ${freq.toFixed(1)}x — severe fatigue; the same audience has seen this video ${Math.floor(freq)}+ times.`
      });
    } else if (freq >= 3) {
      out.push({
        id: nid(), severity: "warning", source: "native",
        action: "Refresh video or expand audience",
        affects: "Frequency",
        detail: `Frequency is ${freq.toFixed(1)}x — early fatigue detected; test a new creative angle or broaden targeting.`
      });
    }
  }

  // ── 6. Search terms ────────────────────────────────────────────────────────
  if (ctx.trendingSearchTerms) {
    out.push({
      id: nid(), severity: "good", source: "native",
      action: "Add trending terms as exact match",
      affects: "Search Terms",
      detail: `Trending converting terms: ${ctx.trendingSearchTerms.slice(0, 80)} — add as exact-match keywords to capture high-intent traffic.`
    });
  }
  if (ctx.wastedSpendSearchTerms) {
    out.push({
      id: nid(), severity: "warning", source: "native",
      action: "Add wasted-spend terms as negatives",
      affects: "Search Terms",
      detail: `High-spend zero-conversion terms: ${ctx.wastedSpendSearchTerms.slice(0, 80)} — add as negative keywords to stop wasted spend.`
    });
  }

  // ── 7. Demand Gen platform breakdown ──────────────────────────────────────
  const dgDiscover = ctx.demandGenDiscoverConversions ?? 0;
  const dgGmail    = ctx.demandGenGmailConversions    ?? 0;
  const dgYT       = ctx.demandGenYouTubeConversions  ?? 0;
  const dgTotal    = dgDiscover + dgGmail + dgYT;

  if (dgTotal > 0) {
    const best = Math.max(dgDiscover, dgGmail, dgYT);
    const bestPlatform = best === dgDiscover ? "Discover" : best === dgGmail ? "Gmail" : "YouTube";
    const bestPct = (best / dgTotal) * 100;
    if (bestPct > 60) {
      out.push({
        id: nid(), severity: "good", source: "native",
        action: `Prioritise Demand Gen on ${bestPlatform}`,
        affects: "Demand Gen",
        detail: `${bestPlatform} drives ${bestPct.toFixed(0)}% of Demand Gen conversions (${best} of ${dgTotal}) — allocate more creative assets here.`
      });
    }
    const worst = Math.min(...[dgDiscover, dgGmail, dgYT].filter(v => v > 0));
    const worstPlatform = worst === dgDiscover ? "Discover" : worst === dgGmail ? "Gmail" : "YouTube";
    if (worst / dgTotal < 0.1 && dgTotal > 5) {
      out.push({
        id: nid(), severity: "info", source: "native",
        action: `Test new creative on ${worstPlatform}`,
        affects: "Demand Gen",
        detail: `${worstPlatform} delivers only ${((worst / dgTotal) * 100).toFixed(0)}% of Demand Gen conversions — test a format tailored for that placement.`
      });
    }
  }

  return out;
}
