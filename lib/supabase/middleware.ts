import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeRole, permissions } from "@/lib/auth/permissions";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/auth/confirm", "/account-not-provisioned", "/api/auth/seed"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = isPublicPath(pathname);

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  let profileRole: ReturnType<typeof normalizeRole> | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile && pathname !== "/account-not-provisioned" && !isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/account-not-provisioned";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (profile) {
      profileRole = normalizeRole(profile.role);
    }

    if (isAdminPath(pathname) && (!profileRole || !permissions.canViewAuditLog(profileRole))) {
      const url = request.nextUrl.clone();
      url.pathname = "/overview";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = profileRole ? "/overview" : "/account-not-provisioned";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = profileRole ? "/overview" : "/account-not-provisioned";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
