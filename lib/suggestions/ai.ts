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
