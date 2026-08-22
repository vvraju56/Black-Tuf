import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

/**
 * POST /api/auth/verification
 * Server-side source of truth for email verification. Verifies the caller's
 * Firebase ID token (so the flag can never be forged client-side), syncs the
 * result into profiles.email_verified, and returns the live status.
 *
 * Body: { idToken: string }
 * Returns: { emailVerified, email }
 */
export async function POST(request: Request) {
  let body: { idToken?: string };
  try {
    body = (await request.json()) as { idToken?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  let firebaseUser;
  try {
    firebaseUser = await verifyFirebaseIdToken(body.idToken);
  } catch {
    return NextResponse.json({ error: "Invalid Firebase session" }, { status: 401 });
  }

  if (!firebaseUser.email) {
    return NextResponse.json({ error: "Account has no email" }, { status: 400 });
  }

  const admin = createServiceRoleClient();

  // Sync the authoritative verification status into the profile (used by RLS
  // for proposals/availability). Firestore of truth remains Firebase.
  const { error } = await admin
    .from("profiles")
    .update({ email_verified: firebaseUser.emailVerified })
    .eq("email", firebaseUser.email);
  if (error) {
    console.error("[api/auth/verification] profile sync failed:", error.message);
  }

  return NextResponse.json({
    emailVerified: firebaseUser.emailVerified,
    email: firebaseUser.email,
  });
}
