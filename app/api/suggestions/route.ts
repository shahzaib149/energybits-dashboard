import { type NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { getAdRecommendations } from "@/lib/suggestions";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { AdContext, AdSuggestion } from "@/lib/suggestions/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_TIMEOUT_MS = 4_000;

type CachedRecord = Record<string, unknown>;

function normalizeFromCache(s: CachedRecord): AdSuggestion | null {
  const validSev = ["critical", "warning", "good", "info"] as const;
  const severity = validSev.includes(s.severity as AdSuggestion["severity"])
    ? (s.severity as AdSuggestion["severity"])
    : null;
  if (!severity) return null;
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

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    p.catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))
  ]);
}

type CacheRow = { suggestions: unknown; generated_at: string | null };

async function readCache(
  adId: string,
  platform: string
): Promise<{ suggestions: AdSuggestion[]; generatedAt: string } | null> {
  const supabase = createServiceRoleClient();
  if (!supabase) return null;

  const result = await withTimeout(
    Promise.resolve(
      supabase
        .from("ad_suggestions_cache")
        .select("suggestions, generated_at")
        .eq("ad_id", adId)
        .eq("platform", platform)
        .maybeSingle()
        .then(({ data }) => {
          const row = data as CacheRow | null;
          if (!row?.suggestions || !Array.isArray(row.suggestions)) return null;
          const normalized = (row.suggestions as CachedRecord[])
            .map(normalizeFromCache)
            .filter((s): s is AdSuggestion => s !== null);
          if (normalized.length === 0) return null;
          return {
            suggestions: normalized,
            generatedAt: row.generated_at ?? new Date().toISOString()
          };
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
): Promise<string> {
  const now = new Date().toISOString();
  try {
    const supabase = createServiceRoleClient();
    if (!supabase) return now;
    await supabase.from("ad_suggestions_cache").upsert(
      {
        ad_id: adId,
        platform,
        suggestions,
        generated_at: now,
        // keep cache_date for backwards compat with old rows
        cache_date: now.slice(0, 10)
      },
      { onConflict: "ad_id,platform" }
    );
  } catch {
    // Cache write failures are non-fatal
  }
  return now;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
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

  const { platform, adId, adContext, adTranscript, force } = body as {
    platform: unknown;
    adId: unknown;
    adContext: unknown;
    adTranscript?: string;
    force?: boolean;
  };

  if (platform !== "meta" && platform !== "google") {
    return NextResponse.json(
      { error: "platform must be 'meta' or 'google'" },
      { status: 400 }
    );
  }

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

  const hasTranscript = typeof adTranscript === "string" && adTranscript.trim().length > 0;
  const forceRefresh  = force === true;

  const enrichedContext: AdContext = hasTranscript
    ? ({ ...(adContext as AdContext), adTranscript: adTranscript!.trim() } as AdContext)
    : (adContext as AdContext);

  // Serve from persistent cache unless user explicitly forced a refresh or has transcript
  if (!hasTranscript && !forceRefresh) {
    const cached = await readCache(adIdStr, platform);
    if (cached) {
      return NextResponse.json({
        suggestions: cached.suggestions,
        cached: true,
        generatedAt: cached.generatedAt
      });
    }
  }

  // Generate fresh suggestions (native + rules + AI)
  const suggestions = await getAdRecommendations(enrichedContext);

  // Persist to cache (await so we get the real timestamp back)
  const generatedAt = await writeCache(adIdStr, platform, suggestions);

  if (user) {
    const { ipAddress, userAgent } = getRequestContext(req);
    void logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "ad_suggestion.viewed",
      resourceType: platform === "meta" ? "meta-ad" : "google-ad",
      resourceId: adIdStr,
      metadata: { suggestionCount: suggestions.length, forced: forceRefresh },
      ipAddress,
      userAgent
    });
  }

  return NextResponse.json({
    suggestions,
    cached: false,
    generatedAt
  });
}
