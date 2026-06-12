import { type NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { getAdRecommendations } from "@/lib/suggestions";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { AdContext, AdSuggestion } from "@/lib/suggestions/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_TIMEOUT_MS = 4_000;

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

type CachedRecord = Record<string, unknown>;

function normalizeFromCache(s: CachedRecord): AdSuggestion | null {
  const validSev = ["critical", "warning", "good", "info"] as const;
  const severity = validSev.includes(s.severity as AdSuggestion["severity"])
    ? (s.severity as AdSuggestion["severity"])
    : null;
  if (!severity) return null;
  // Support both old format (title field) and new format (action field)
  const action =
    typeof s.action === "string" && s.action.trim()
      ? s.action.trim()
      : typeof s.title === "string" && s.title.trim()
      ? s.title.trim()
      : null;
  if (!action) return null;
  return {
    id: typeof s.id === "string" ? s.id : `cache-${String(Math.random()).slice(2)}`,
    severity,
    action,
    affects: typeof s.affects === "string" ? s.affects : "",
    detail: typeof s.detail === "string" ? s.detail : "",
    source: s.source === "rules" || s.source === "ai" || s.source === "native" ? s.source : "ai",
    link: typeof s.link === "string" ? s.link : undefined
  };
}

/** Race a promise against a timeout; returns null if it loses or throws. */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    p.catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))
  ]);
}

async function readCache(
  adId: string,
  platform: string
): Promise<AdSuggestion[] | null> {
  const supabase = createServiceRoleClient();
  if (!supabase) return null;
  const result = await withTimeout(
    Promise.resolve(
      supabase
        .from("ad_suggestions_cache")
        .select("suggestions")
        .eq("ad_id", adId)
        .eq("platform", platform)
        .eq("cache_date", todayString())
        .maybeSingle()
        .then(({ data }) => {
          if (!data?.suggestions || !Array.isArray(data.suggestions)) return null;
          const normalized = (data.suggestions as CachedRecord[])
            .map(normalizeFromCache)
            .filter((s): s is AdSuggestion => s !== null);
          return normalized.length > 0 ? normalized : null;
        })
    ),
    SUPABASE_TIMEOUT_MS
  );
  return result ?? null;
}

async function writeCache(
  adId: string,
  platform: string,
  suggestions: AdSuggestion[]
): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    if (!supabase) return;
    await supabase.from("ad_suggestions_cache").upsert(
      { ad_id: adId, platform, cache_date: todayString(), suggestions },
      { onConflict: "ad_id,platform,cache_date" }
    );
  } catch {
    // Cache write failures are non-fatal
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Auth is best-effort: try to identify the user for audit logging only.
  // Suggestions are generated purely from the context in the request body —
  // no user-specific data is read — so we never block on auth failures.
  let user: Awaited<ReturnType<typeof getServerUser>> = null;
  try {
    const authRace = await Promise.race([
      getServerUser().then((u) => ({ responded: true as const, user: u })),
      new Promise<{ responded: false }>((resolve) =>
        setTimeout(() => resolve({ responded: false }), SUPABASE_TIMEOUT_MS)
      )
    ]);
    if (authRace.responded) user = authRace.user;
  } catch {
    // Supabase unavailable — proceed without user identity
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("platform" in body) ||
    !("adId" in body) ||
    !("adContext" in body)
  ) {
    return NextResponse.json(
      { error: "Body must include: platform, adId, adContext" },
      { status: 400 }
    );
  }

  const { platform, adId, adContext, adTranscript } = body as {
    platform: unknown;
    adId: unknown;
    adContext: unknown;
    adTranscript?: string;
  };

  if (platform !== "meta" && platform !== "google") {
    return NextResponse.json(
      { error: "platform must be 'meta' or 'google'" },
      { status: 400 }
    );
  }

  // Normalise adId — fall back to adName from context if adId is blank
  const adIdStr =
    typeof adId === "string" && adId.trim()
      ? adId.trim()
      : typeof adContext === "object" &&
        adContext !== null &&
        "adName" in adContext &&
        typeof (adContext as { adName: unknown }).adName === "string"
      ? ((adContext as { adName: string }).adName.trim() || null)
      : null;

  if (!adIdStr) {
    return NextResponse.json(
      { error: "adId must be a non-empty string" },
      { status: 400 }
    );
  }

  // Merge transcript into context when provided (bypass cache — transcript enriches suggestions)
  const hasTranscript = typeof adTranscript === "string" && adTranscript.trim().length > 0;
  const enrichedContext: AdContext = hasTranscript
    ? ({ ...(adContext as AdContext), adTranscript: adTranscript!.trim() } as AdContext)
    : (adContext as AdContext);

  // Serve from cache only when no transcript is present
  if (!hasTranscript) {
    const cached = await readCache(adIdStr, platform);
    if (cached) {
      return NextResponse.json({
        suggestions: cached,
        cached: true,
        generatedAt: todayString()
      });
    }
  }

  // Generate suggestions (native + rules + AI)
  const suggestions = await getAdRecommendations(enrichedContext);

  // Persist to cache (fire-and-forget, non-blocking)
  void writeCache(adIdStr, platform, suggestions);

  // Audit log is fire-and-forget — never block the response for logging
  if (user) {
    const { ipAddress, userAgent } = getRequestContext(req);
    void logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "ad_suggestion.viewed",
      resourceType: platform === "meta" ? "meta-ad" : "google-ad",
      resourceId: adIdStr,
      metadata: { suggestionCount: suggestions.length },
      ipAddress,
      userAgent
    });
  }

  return NextResponse.json({
    suggestions,
    cached: false,
    generatedAt: new Date().toISOString()
  });
}
