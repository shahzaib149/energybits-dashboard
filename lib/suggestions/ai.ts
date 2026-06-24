import type { AdContext, AdSuggestion, SuggestionSeverity } from "./types";

const AI_TIMEOUT_MS = 15_000;

function getModel(): string {
  return process.env.SUGGESTIONS_AI_MODEL ?? "claude-haiku-4-5-20251001";
}


function buildPrompt(ctx: AdContext, existing: AdSuggestion[]): string {
  const alreadyCovered = existing.length > 0
    ? `\nThese issues are already surfaced — do NOT repeat them:\n${existing.map((s) => `- ${s.action}`).join("\n")}`
    : "";

  if (ctx.platform === "meta") {
    const hasVideo    = ctx.hookRate > 0 || ctx.thruPlayRate > 0;
    const hasConv     = ctx.purchases > 0 || ctx.formLeads > 0 || ctx.roas > 0;
    const transcript  = ctx.adTranscript ? `\nAD VIDEO ANALYSIS:\n"${ctx.adTranscript.slice(0, 600)}"\nUse this to judge hook quality, value proposition clarity, CTA strength, and tone-audience fit.\n` : "";

    return `You are a senior Meta ads strategist for ENERGYbits (spirulina/chlorella supplements). Diagnose this ad using the funnel framework: Attention → Retention → Click → Fatigue → Conversion → Efficiency.

AD: "${ctx.adName}"

METRICS:
${hasVideo ? `Hook rate: ${ctx.hookRate.toFixed(1)}% (target ≥25%) | ThruPlay rate: ${ctx.thruPlayRate.toFixed(1)}% (target ≥15%)` : "Video metrics: not available"}
CTR: ${ctx.ctrPct.toFixed(2)}% | Account avg CTR: ${ctx.accountAverageCtrPct.toFixed(2)}%
CPC: $${ctx.cpc.toFixed(2)} | Account avg CPC: $${ctx.accountAverageCpc.toFixed(2)}
Frequency: ${ctx.frequency.toFixed(2)}x | Impressions: ${ctx.impressions.toLocaleString()} | Spend: $${ctx.spend.toFixed(2)}
${hasConv ? `Purchases: ${ctx.purchases} | Purchase value: $${ctx.purchaseValue.toFixed(2)} | ROAS: ${ctx.roas.toFixed(2)}x | Leads: ${ctx.formLeads}` : "Purchases/leads: no conversion data"}
Clicks: ${ctx.clicks.toLocaleString()}
${transcript}
THRESHOLD RULES (follow exactly — no exceptions):
- Hook rate: fire ONLY if hookRate > 0 AND < 20% (critical) or 20–25% (warning). Zero/missing = SKIP.
- ThruPlay: fire ONLY if thruPlayRate > 0 AND < 15% AND hookRate ≥ 25%. Zero/missing = SKIP.
- CTR: fire ONLY if CTR < 0.8% OR CTR < 60% of account avg (warning). Positive signal only if CTR ≥ 130% of account avg (good).
- CPC: fire ONLY if CPC > 1.5× account avg AND CTR ≥ 0.8% (warning).
- Frequency: ONLY fire if frequency ≥ 2.5 (warning) or ≥ 5 (critical). NEVER fire fatigue below 2.5x.
- ROAS: ONLY fire if roas > 0 AND < 1.0 (critical) or roas > 0 AND < 2.0 (warning). If roas = 0, NEVER fire a ROAS suggestion.
- Positive ROAS: fire ONLY if roas ≥ 1.5× account average ROAS (good).

ADDITIONAL ANALYSIS (apply after threshold rules):
- If clicks > 200 and zero conversions despite good CTR: suggest auditing Meta Pixel / conversion tracking setup as a separate item from the landing page check.
- If CTR is notably strong (≥ account avg) but conversions are zero: flag creative-to-landing-page mismatch.
- If spend > $500 with zero conversions: highlight the budget risk with the specific spend figure.
${ctx.adTranscript ? "- Video transcript provided: flag weak hook, missing CTA, or unclear value prop with specific quotes." : ""}

ABSOLUTE PROHIBITIONS:
- Never suggest "obtain data", "request metrics", "data unavailable", or any variant. Silence on missing data.
- Never fire fatigue if frequency < 2.5. Never.
- Never fire ROAS suggestion if roas = 0.
- Never reference Quality Ranking, Engagement Ranking, or Conversion Ranking.
- Never repeat an action already listed in the existing suggestions below.

PHRASING:
- "action": verb-first command, max 6 words (e.g. "Audit Meta Pixel tracking setup").
- "affects": one of — "Hook Rate", "Hold Rate", "CTR", "CPC", "ROAS", "Frequency", "Conversion Rate".
- "detail": one sentence, max 22 words, cite a specific number from the data.
- "severity": critical / warning / good / info.
${alreadyCovered}

Return ONLY a JSON array, no markdown. 1–4 items. Return [] only if nothing genuinely applies:
[{"severity":"...","action":"...","affects":"...","detail":"..."}]`;
  }

  // Compute CTR/CVR diagnostic state for the prompt
  const _baselineCtr = (ctx.campaignBaselineCtrPct ?? 0) > 0 ? ctx.campaignBaselineCtrPct! : ctx.accountAverageCtrPct;
  const _baselineCvr = (ctx.campaignBaselineCvr ?? 0) > 0 ? ctx.campaignBaselineCvr! : ctx.accountAverageConversionRatePct;
  const _ctrLow  = _baselineCtr > 0 ? ctx.ctrPct < _baselineCtr * 0.75 : ctx.ctrPct < 1.0;
  const _ctrHigh = _baselineCtr > 0 ? ctx.ctrPct > _baselineCtr * 1.25 : ctx.ctrPct >= 2.0;
  const _cvrLow  = _baselineCvr > 0 && ctx.conversions > 0 && ctx.conversionRatePct < _baselineCvr * 0.75;
  const _cvrHigh = _baselineCvr > 0 && ctx.conversions > 0 && ctx.conversionRatePct > _baselineCvr * 1.25;
  const ctrCvrState =
    _ctrLow && _cvrLow   ? "LOW_CTR_LOW_CVR (structural/targeting issue)" :
    _ctrLow && !_cvrLow  ? "LOW_CTR_NORMAL_CVR (ad copy/creative issue)" :
    _ctrHigh && _cvrLow  ? "HIGH_CTR_LOW_CVR (landing page/intent mismatch)" :
    _ctrHigh && _cvrHigh ? "HIGH_CTR_HIGH_CVR (scale it)" : "NORMAL";

  const qsLine = [
    ctx.qualityScoreAdRelevance  ? `Ad Relevance: ${ctx.qualityScoreAdRelevance}` : "",
    ctx.qualityScoreLandingPage  ? `Landing Page: ${ctx.qualityScoreLandingPage}` : "",
    ctx.qualityScoreExpectedCtr  ? `Expected CTR: ${ctx.qualityScoreExpectedCtr}` : "",
  ].filter(Boolean).join(" | ") || "n/a";

  const isLine = [
    (ctx.impressionShareLostBudget ?? 0) > 0 ? `Budget: ${ctx.impressionShareLostBudget!.toFixed(0)}%` : "",
    (ctx.impressionShareLostRank   ?? 0) > 0 ? `Rank: ${ctx.impressionShareLostRank!.toFixed(0)}%` : "",
  ].filter(Boolean).join(" | ") || "n/a";

  const videoLine = (() => {
    const parts = [];
    if (ctx.videoQ25)  parts.push(`25%: ${ctx.videoQ25.toFixed(0)}%`);
    if (ctx.videoQ50)  parts.push(`50%: ${ctx.videoQ50.toFixed(0)}%`);
    if (ctx.videoQ75)  parts.push(`75%: ${ctx.videoQ75.toFixed(0)}%`);
    if (ctx.videoQ100) parts.push(`100%: ${ctx.videoQ100.toFixed(0)}%`);
    return parts.length ? parts.join(" | ") : "n/a";
  })();

  const dgLine = (() => {
    const d = ctx.demandGenDiscoverConversions, g = ctx.demandGenGmailConversions, y = ctx.demandGenYouTubeConversions;
    return (d || g || y) ? `Discover: ${d ?? 0} | Gmail: ${g ?? 0} | YouTube: ${y ?? 0}` : "n/a";
  })();

  return `You are a direct-response Google Ads consultant for ENERGYbits (spirulina/chlorella supplements). Diagnose this ad using ALL signals provided.

AD: "${ctx.adName}" | Type: ${ctx.adType}
Campaign: ${ctx.campaignName} | Ad Group: ${ctx.adGroupName}

PERFORMANCE:
Spend: $${ctx.spend.toFixed(2)} | Impressions: ${ctx.impressions.toLocaleString()} | Clicks: ${ctx.clicks.toLocaleString()}
CTR: ${ctx.ctrPct.toFixed(2)}% | Baseline CTR: ${_baselineCtr > 0 ? _baselineCtr.toFixed(2) + "%" : "n/a"}
Avg CPC: $${ctx.averageCpc.toFixed(2)}
ROAS: ${ctx.roas.toFixed(2)}x | Acct avg ROAS: ${ctx.accountAverageRoas > 0 ? ctx.accountAverageRoas.toFixed(2) + "x" : "n/a"}
Conversions: ${ctx.conversions} | CVR: ${ctx.conversionRatePct.toFixed(2)}% | Baseline CVR: ${_baselineCvr > 0 ? _baselineCvr.toFixed(2) + "%" : "n/a"}
Cost/Conv: $${ctx.costPerConversion.toFixed(2)}

EXTENDED SIGNALS:
CTR/CVR State: ${ctrCvrState}
Quality Score sub-components: ${qsLine}
Impression Share lost (Budget | Rank): ${isLine}
Ad Strength: ${ctx.adStrength ?? "n/a"}
Video completion (25/50/75/100%): ${videoLine}
Frequency: ${(ctx.frequency ?? 0) > 0 ? ctx.frequency!.toFixed(1) + "x" : "n/a"}
Demand Gen by platform: ${dgLine}
Trending search terms: ${ctx.trendingSearchTerms ?? "none"}
Wasted-spend search terms: ${ctx.wastedSpendSearchTerms ?? "none"}
Opt. Score: ${ctx.optimizationScore > 0 ? ctx.optimizationScore.toFixed(0) + "%" : "n/a"}
Creative tags: ${ctx.creativeTagSuggestions || "none"}

RULES:
- CTR/CVR state drives the PRIMARY recommendation: LOW_CTR_LOW_CVR = targeting; LOW_CTR = copy; HIGH_CTR_LOW_CVR = landing page; HIGH_CTR_HIGH_CVR = scale.
- Quality Score "Below Average" sub-component → specific fix for that sub-component.
- IS Lost Budget >20% → increase budget. IS Lost Rank >20% → improve QS or bid.
- Ad Strength "Poor" → critical; "Low" → warning; "Best" → good.
- Video: flag drop-off WHERE it's biggest (>20pp between adjacent quartiles).
- Frequency ≥3 = warning; ≥5 = critical (video/display only).
- Trending terms → add as exact match. Wasted terms → add as negatives.
- Demand Gen: platform with >60% of conversions → prioritise it.

PROHIBITIONS:
- Never mention missing data or suggest obtaining metrics.
- Never repeat an action already listed in existing suggestions.
- Never fire CTR warning when CTR/CVR state is HIGH_CTR_*.

PHRASING:
- "action": verb-first, max 6 words (e.g. "Add negative keywords now").
- "affects": "CTR", "CVR", "ROAS", "Conversions", "Quality Score", "Impression Share", "Ad Strength", "Frequency", "Video Completion", "Search Terms", "Demand Gen", or "Opt. Score".
- "detail": one sentence, max 22 words, cite a specific number.
- "severity": critical / warning / good / info.
${alreadyCovered}

Respond ONLY with a JSON array (no markdown). 1–4 items ([] if nothing genuinely new applies):
[{"severity":"critical"|"warning"|"good"|"info","action":"≤6 words","affects":"metric","detail":"one sentence ≤22 words"}]`;
}

function isValidSeverity(s: unknown): s is SuggestionSeverity {
  return s === "critical" || s === "warning" || s === "good" || s === "info";
}

function parseAIResponse(raw: string): AdSuggestion[] {
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const parsed: unknown = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return [];
    return (parsed as Array<Record<string, unknown>>)
      .filter(
        (item) =>
          isValidSeverity(item.severity) &&
          typeof item.action === "string" &&
          item.action.trim() &&
          typeof item.detail === "string" &&
          item.detail.trim()
      )
      .slice(0, 4)
      .map((item, i) => ({
        id: `ai-${i}`,
        severity: item.severity as SuggestionSeverity,
        action: String(item.action).trim(),
        affects: typeof item.affects === "string" ? String(item.affects).trim() : "",
        detail: String(item.detail).trim(),
        source: "ai" as const
      }));
  } catch {
    return [];
  }
}

/** Calls the Claude Messages API server-side. Returns [] on any failure — never throws. */
export async function getAISuggestions(
  ctx: AdContext,
  existingSuggestions: AdSuggestion[]
): Promise<AdSuggestion[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: getModel(),
        max_tokens: 1024,
        messages: [{ role: "user", content: buildPrompt(ctx, existingSuggestions) }]
      }),
      signal: controller.signal
    });

    clearTimeout(timer);
    if (!res.ok) return [];

    const data = (await res.json()) as {
      content?: Array<{ type: string; text: string }>;
    };
    const text = data.content?.find((c) => c.type === "text")?.text ?? "";
    return parseAIResponse(text);
  } catch {
    clearTimeout(timer);
    return [];
  }
}
