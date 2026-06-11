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
    return `You are a senior Meta ads strategist for ENERGYbits (spirulina/chlorella supplements). Improve this ad's Meta relevance rankings and delivery efficiency.

AD: "${ctx.adName}"

RELEVANCE RANKINGS:
- Quality Ranking: ${formatRanking(ctx.qualityRanking)} — how well the creative matches audience expectations
- Engagement Rate Ranking: ${formatRanking(ctx.engagementRateRanking)} — how often people engage vs. similar ads
- Conversion Rate Ranking: ${formatRanking(ctx.conversionRateRanking)} — post-click conversion vs. similar ads

PERFORMANCE METRICS:
Spend: $${ctx.spend.toFixed(2)} | Impressions: ${ctx.impressions.toLocaleString()} | Reach: ${ctx.reach.toLocaleString()} | Frequency: ${ctx.frequency.toFixed(2)}x
Clicks: ${ctx.clicks.toLocaleString()} | CTR: ${ctx.ctrPct.toFixed(2)}% (account avg: ${ctx.accountAverageCtrPct.toFixed(2)}%)
CPC: $${ctx.cpc.toFixed(2)} (account avg: $${ctx.accountAverageCpc.toFixed(2)}) | CPM: $${ctx.cpm.toFixed(2)}

ANALYSIS RULES:
1. Every suggestion MUST cite a specific ranking or metric — no generic advice.
2. Order: "Below Average" rankings first, then "Average", then scaling opportunities.
3. Diagnostic logic:
   - Quality Ranking low → negative feedback / ad fatigue / image text >20% / sensationalism / creative-audience mismatch
   - Engagement Ranking low → weak hook in first 3 sec / wrong format (try Reels or carousel over static) / unclear value prop
   - Conversion Ranking low → landing page mismatch / checkout friction / mobile UX / Pixel or CAPI tracking gaps
   - High CTR + low Conversion Ranking → click-bait or landing-page mismatch; name it explicitly
   - Frequency above 3.0x + any "Below Average" → ad fatigue; name it explicitly
4. If any ranking shows "Insufficient data" → only suggest how to reach ≥500 impressions or fix tracking.

PHRASING RULES:
- "action": direct command starting with a verb, max 6 words. E.g. "Verify CAPI is firing", "Cut image text below 20%", "Test video over static image". No full sentences.
- "affects": the specific lever. Use: "Quality Ranking", "Engagement Ranking", "Conversion Ranking", "CTR", "CPM", or "CPC".
- "detail": ONE sentence, max 22 words, with a specific number from this ad's data.
- "severity": Below Average ranking = critical; Average ranking = warning; Above Average/scaling = good; data note = info.
${alreadyCovered}

Respond ONLY with a JSON array (no markdown). 2–4 items:
[{"severity":"critical"|"warning"|"good"|"info","action":"≤6 words","affects":"ranking or metric","detail":"one sentence ≤22 words"}]`;
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
