import type { AdContext, AdSuggestion, SuggestionSeverity } from "./types";

const AI_TIMEOUT_MS = 15_000;

function getModel(): string {
  return process.env.SUGGESTIONS_AI_MODEL ?? "claude-haiku-4-5-20251001";
}

function formatRanking(raw: string): string {
  if (!raw) return "Insufficient data";
  const key = raw.trim().toUpperCase();
  if (key === "ABOVE_AVERAGE") return "Above Average";
  if (key === "AVERAGE") return "Average";
  if (key === "BELOW_AVERAGE_10") return "Below Average (bottom 10%)";
  if (key === "BELOW_AVERAGE_20") return "Below Average (bottom 20%)";
  if (key === "BELOW_AVERAGE_35") return "Below Average (bottom 35%)";
  if (key.startsWith("BELOW")) return "Below Average";
  if (key.startsWith("ABOVE")) return "Above Average";
  return "Insufficient data";
}

function buildPrompt(ctx: AdContext, existing: AdSuggestion[]): string {
  const alreadyCovered = existing.length > 0
    ? `\nThese issues are already surfaced — do NOT repeat them:\n${existing.map((s) => `- ${s.action}`).join("\n")}`
    : "";

  if (ctx.platform === "meta") {
    const hasVideo    = ctx.hookRate > 0 || ctx.thruPlayRate > 0;
    const hasConv     = ctx.purchases > 0 || ctx.formLeads > 0 || ctx.roas > 0;
    const transcript  = ctx.adTranscript ? `\nAD VIDEO ANALYSIS:\n"${ctx.adTranscript.slice(0, 600)}"\nUse this to judge hook quality, value proposition clarity, CTA strength, and tone-audience fit.\n` : "";

    return `You are a senior Meta ads strategist for ENERGYbits (spirulina/chlorella supplements). Diagnose this ad using the funnel framework: Attention → Retention → Click → Conversion → Efficiency.

AD: "${ctx.adName}"

FUNNEL METRICS:
${hasVideo ? `Attention  — Hook rate: ${ctx.hookRate > 0 ? ctx.hookRate.toFixed(1) + "%" : "n/a"} (target ≥25%)
Retention  — ThruPlay rate: ${ctx.thruPlayRate > 0 ? ctx.thruPlayRate.toFixed(1) + "%" : "n/a"} (target ≥15%)` : "Video metrics: not available"}
Click      — CTR: ${ctx.ctrPct.toFixed(2)}% (account avg: ${ctx.accountAverageCtrPct.toFixed(2)}%) | CPC: $${ctx.cpc.toFixed(2)} (avg: $${ctx.accountAverageCpc.toFixed(2)})
Delivery   — Frequency: ${ctx.frequency.toFixed(2)}x | CPM: $${ctx.cpm.toFixed(2)} | Reach: ${ctx.reach.toLocaleString()}
${hasConv ? `Conversion — Purchases: ${ctx.purchases} | Purchase value: $${ctx.purchaseValue.toFixed(2)} | ROAS: ${ctx.roas > 0 ? ctx.roas.toFixed(2) + "x" : "n/a"} | Leads: ${ctx.formLeads}` : "Conversion: no purchase/lead data available"}
Spend: $${ctx.spend.toFixed(2)} | Impressions: ${ctx.impressions.toLocaleString()}

META RELEVANCE RANKINGS:
- Quality Ranking: ${formatRanking(ctx.qualityRanking)}
- Engagement Rate Ranking: ${formatRanking(ctx.engagementRateRanking)}
- Conversion Rate Ranking: ${formatRanking(ctx.conversionRateRanking)}
${transcript}
ANALYSIS RULES (funnel top-down — fix the highest leak first):
1. Hook rate <20% → weak first-3-sec; suggest specific fix (product-in-use, bold benefit, text hook).
2. Hold/ThruPlay rate low (hook OK) → mid-video drop-off; suggest shortening or front-loading value.
3. CTR <0.8% or well below avg → headline/offer/CTA weak; suggest rewrite.
4. CPC high + CTR acceptable → audience/auction issue, not creative.
5. Frequency ≥2.5 + any negative signal → fatigue; suggest creative refresh or audience expansion.
6. Good clicks + no conversions → post-click issue; suggest landing page audit.
7. ROAS <1.0 → unprofitable; suggest pausing.
8. Quality/Engagement/Conversion ranking "Below Average" → cite the specific ranking, name the root cause.
9. High CTR + low Conversion Ranking → click-bait mismatch; name it.
10. If transcript provided → use it to flag weak hook, missing CTA, or poor value prop with specific quotes.

PHRASING RULES:
- "action": direct command starting with a verb, max 6 words. No full sentences.
- "affects": one of — "Hook Rate", "Hold Rate", "CTR", "CPC", "CPM", "ROAS", "Frequency", "Conversion Rate", "Quality Ranking", "Engagement Ranking", "Conversion Ranking".
- "detail": ONE sentence, max 22 words, cite a specific number from the data above.
- "severity": unprofitable/bottom-10% = critical; below avg/missing CTA/fatigue = warning; strong signal = good; data note = info.
${alreadyCovered}

Respond ONLY with a JSON array (no markdown). 2–4 items:
[{"severity":"critical"|"warning"|"good"|"info","action":"≤6 words","affects":"metric or ranking","detail":"one sentence ≤22 words"}]`;
  }

  return `You are a direct-response digital advertising consultant for ENERGYbits (spirulina/chlorella supplements).

Platform: Google Ads
Ad name: ${ctx.adName} | Type: ${ctx.adType}
Campaign: ${ctx.campaignName} | Ad Group: ${ctx.adGroupName}
Spend: $${ctx.spend.toFixed(2)} | Impressions: ${ctx.impressions.toLocaleString()} | Clicks: ${ctx.clicks.toLocaleString()}
CTR: ${ctx.ctrPct.toFixed(2)}% (account avg: ${ctx.accountAverageCtrPct.toFixed(2)}%)
Avg CPC: $${ctx.averageCpc.toFixed(2)} | ROAS: ${ctx.roas.toFixed(2)}x (account avg: ${ctx.accountAverageRoas.toFixed(2)}x)
Conversions: ${ctx.conversions} | Conversion rate: ${ctx.conversionRatePct.toFixed(2)}% (account avg: ${ctx.accountAverageConversionRatePct.toFixed(2)}%)
Cost per conversion: $${ctx.costPerConversion.toFixed(2)}
Campaign optimization score: ${ctx.optimizationScore > 0 ? ctx.optimizationScore.toFixed(0) + "%" : "not available"}
Creative tag suggestions (synced from platform): ${ctx.creativeTagSuggestions || "none"}

PHRASING RULES:
- "action": direct command starting with a verb, max 6 words. E.g. "Add negative keywords now", "Test new RSA headlines", "Pause unprofitable ad group". No full sentences.
- "affects": the specific lever. Use: "ROAS", "CTR", "Conversions", "CPC", or "Opt. Score".
- "detail": ONE sentence, max 22 words, with a specific number from this ad's data.
- "severity": unprofitable/broken = critical; underperforming = warning; strong performance = good; data note = info.
${alreadyCovered}

Respond ONLY with a JSON array (no markdown). 2–4 items:
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
