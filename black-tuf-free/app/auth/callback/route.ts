import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback for both flows:
 *  - Magic link (Hybrid Firebase → Supabase): exchange token_hash via verifyOtp.
 *  - OAuth callback: exchange the `code` for a session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const code = searchParams.get("code");
  const type = searchParams.get("type") as "magiclink" | null;
  const next = searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type === "magiclink" ? "magiclink" : "email",
    });
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }
    // Middleware redirects the now-authenticated user to their dashboard.
    return NextResponse.redirect(`${origin}${safeNext}`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }
    return NextResponse.redirect(`${origin}${safeNext}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
