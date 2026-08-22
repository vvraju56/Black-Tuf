import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

/**
 * POST /api/auth/freelancer
 * "Start Working" — enables the freelancer/engineer mode for the caller.
 * Requires a verified email: the Firebase ID token is verified server-side and
 * email_verified must be true, otherwise the request is rejected with 403.
 *
 * Body: { idToken: string }
 * Returns: { freelancerEnabled, role }
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

  // The hard requirement: no freelancer mode until the email is verified.
  if (!firebaseUser.emailVerified) {
    return NextResponse.json(
      { error: "Email verification is required before you can start working.", verified: false },
      { status: 403 }
    );
  }

  const admin = createServiceRoleClient();

  const { data: profile, error: fetchError } = await admin
    .from("profiles")
    .select("id, role, email_verified")
    .eq("email", firebaseUser.email)
    .maybeSingle();
  if (fetchError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      email_verified: true,
      freelancer_enabled: true,
      freelancer_enabled_at: new Date().toISOString(),
      role: "engineer",
    })
    .eq("id", profile.id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ freelancerEnabled: true, role: "engineer" });
}
