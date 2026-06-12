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

    return `You are a Meta ads analyst for ENERGYbits (spirulina/chlorella supplements). Analyze this ad using ONLY the rules below. Do not invent additional rules.

AD: "${ctx.adName}"

METRICS:
${hasVideo ? `Hook rate: ${ctx.hookRate.toFixed(1)}% (target ≥25%) | ThruPlay rate: ${ctx.thruPlayRate.toFixed(1)}% (target ≥15%)` : ""}
CTR: ${ctx.ctrPct.toFixed(2)}% | Account avg CTR: ${ctx.accountAverageCtrPct.toFixed(2)}%
CPC: $${ctx.cpc.toFixed(2)} | Account avg CPC: $${ctx.accountAverageCpc.toFixed(2)}
Frequency: ${ctx.frequency.toFixed(2)}x | Impressions: ${ctx.impressions.toLocaleString()} | Spend: $${ctx.spend.toFixed(2)}
${hasConv ? `Purchases: ${ctx.purchases} | Purchase value: $${ctx.purchaseValue.toFixed(2)} | ROAS: ${ctx.roas.toFixed(2)}x | Leads: ${ctx.formLeads}` : ""}
Clicks: ${ctx.clicks.toLocaleString()}
${transcript}
EXACT RULES TO APPLY (funnel top-down):
1. ATTENTION — ONLY if hook rate data exists AND hookRate < 20%: critical. ONLY if hookRate 20–25%: warning. If no hook data, SKIP entirely.
2. RETENTION — ONLY if thruPlayRate data exists AND thruPlayRate < 15% AND hookRate ≥ 25%: warning. If no data, SKIP entirely.
3. CLICK/CTR — ONLY if CTR < 0.8% OR CTR < 60% of account avg: warning. If CTR is acceptable, SKIP.
4. CLICK/CPC — ONLY if CPC > 1.5× account avg AND CTR ≥ 0.8%: warning. Otherwise SKIP.
5. FATIGUE — ONLY if frequency ≥ 2.5: warning. ONLY if frequency ≥ 5: critical. If frequency < 2.5, DO NOT generate any fatigue suggestion.
6. CONVERSION — ONLY if clicks > 50 AND purchases = 0 AND leads = 0: warning (already handled by rules engine, skip if listed above).
7. EFFICIENCY/ROAS — ONLY if roas > 0 AND roas < 1.0: critical. ONLY if roas > 0 AND roas < 2.0: warning. If roas = 0 or missing, DO NOT generate any ROAS suggestion.
8. POSITIVE — ONLY if CTR ≥ 1.3× account avg: good. ONLY if roas ≥ 1.5× account average: good.
${ctx.adTranscript ? "9. VIDEO — Use transcript to identify weak hook, missing CTA, or unclear value prop. Quote specifics." : ""}

HARD PROHIBITIONS:
- DO NOT suggest "obtain data", "request metrics", "data unavailable", or similar. If a metric is missing/zero, SKIP it.
- DO NOT fire fatigue for frequency below 2.5.
- DO NOT fire ROAS suggestions when roas = 0.
- DO NOT reference Quality, Engagement, or Conversion Rankings.
- DO NOT repeat suggestions already listed above.

PHRASING:
- "action": verb-first command, max 6 words.
- "affects": exactly one of — "Hook Rate", "Hold Rate", "CTR", "CPC", "ROAS", "Frequency", "Conversion Rate".
- "detail": one sentence, max 22 words, must cite a specific number.
- "severity": critical / warning / good / info.
${alreadyCovered}

Return ONLY a JSON array, no markdown. 1–4 items (return [] if nothing genuinely applies):
[{"severity":"...","action":"...","affects":"...","detail":"..."}]`;
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
