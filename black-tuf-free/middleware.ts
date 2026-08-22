import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types";

function getRole(userProfileRole: unknown): Role | null {
  if (userProfileRole === "admin" || userProfileRole === "engineer" || userProfileRole === "client")
    return userProfileRole;
  return "client";
}

function redirectToLogin(request: NextRequest, reason?: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  if (reason) url.searchParams.set("reason", reason);
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Public routes that need no auth check.
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/auth/callback",
    "/offline",
    "/api/projects",
  ];
  const { pathname } = request.nextUrl;
  if (publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    // Let auth pages themselves redirect an already-signed-in user.
    return response;
  }

  const supabase = await createClient();

  // Refresh auth cookies (important for Server Components using createClient).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const role = user ? getRole(profile?.role) : null;

  const isAuthed = Boolean(user);
  const isAdmin = role === "admin";
  const isEngineer = role === "engineer" || isAdmin;

  // Protected client area
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthed) return redirectToLogin(request);
    if (isAdmin) return NextResponse.redirect(new URL("/admin", request.url));
    if (isEngineer) return NextResponse.redirect(new URL("/engineer", request.url));
    return response;
  }

  // Protected admin area
  if (pathname.startsWith("/admin")) {
    if (!isAuthed) return redirectToLogin(request, "login");
    if (!isAdmin) return NextResponse.redirect(new URL("/dashboard", request.url));
    return response;
  }

  // Protected engineer area
  if (pathname.startsWith("/engineer")) {
    if (!isAuthed) return redirectToLogin(request, "login");
    if (!isEngineer) return NextResponse.redirect(new URL("/dashboard", request.url));
    return response;
  }

  // Root: send authenticated root visitors to their role-specific dashboard.
  if (pathname === "/" && isAuthed) {
    const target = isAdmin ? "/admin" : role === "engineer" ? "/engineer" : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|firebase-messaging-sw.js|api/auth|sitemap.xml|robots.txt|manifest.webmanifest|icon-.*\\.png|apple-icon.png|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
