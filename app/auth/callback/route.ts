import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";

function redirectWithCookies(
  url: string,
  pendingCookies: Array<{ name: string; value: string; options: CookieOptions }>
) {
  const response = NextResponse.redirect(url);
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const authError = searchParams.get("error");
  const nextParam = searchParams.get("next") ?? "/overview";
  const safeNext = nextParam.startsWith("/") ? nextParam : "/overview";
  const { ipAddress, userAgent } = getRequestContext(request);

  if (authError) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  if (!code && !(tokenHash && type)) {
    // Invite links may use hash fragments — send to client handler
    return NextResponse.redirect(`${origin}/auth/confirm${request.nextUrl.search}`);
  }

  const pendingCookies: Array<{ name: string; value: string; options: CookieOptions }> = [];

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          pendingCookies.push({ name, value, options: options ?? {} });
        });
      }
    }
  });

  let userId: string | undefined;
  let userEmail: string | undefined;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }
    userId = data.user.id;
    userEmail = data.user.email ?? undefined;
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error || !data.user) {
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }
    userId = data.user.id;
    userEmail = data.user.email ?? undefined;
  }

  if (!userId) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  await logAuditEvent({
    userId,
    userEmail: profile?.email ?? userEmail,
    action: "auth.login",
    metadata: { method: tokenHash ? "invite_otp" : "magic_link" },
    ipAddress,
    userAgent
  });

  const destination = profile ? safeNext : "/account-not-provisioned";
  return redirectWithCookies(`${origin}${destination}`, pendingCookies);
}
