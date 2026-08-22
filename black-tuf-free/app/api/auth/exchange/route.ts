import { NextResponse } from "next/server";
import { exchangeFirebaseToken } from "@/lib/auth/exchange";

export const runtime = "nodejs";

/**
 * POST /api/auth/exchange
 * Body: { idToken: string, next?: string }
 *
 * Exchanges a verified Firebase ID token for a Supabase session. Returns a
 * token_hash that the client verifies directly (establishing a localStorage
 * session the browser client can read).
 */
export async function POST(request: Request) {
  let body: { idToken?: string; next?: string; role?: string };
  try {
    body = (await request.json()) as { idToken?: string; next?: string; role?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.idToken || typeof body.idToken !== "string") {
    return NextResponse.json({ error: "idToken is required" }, { status: 400 });
  }

  try {
    const result = await exchangeFirebaseToken(body.idToken, body.next ?? null, body.role ?? null);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
