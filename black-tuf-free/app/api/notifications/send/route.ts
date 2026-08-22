import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPushTokensForUser } from "@/lib/supabase/push-tokens";
import { sendPushNotification } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.PUSH_WEBHOOK_SECRET;

interface SendBody {
  user_id?: string;
  title?: string;
  body?: string;
  data?: Record<string, string>;
  secret?: string;
}

/**
 * Sends an FCM push notification to a user's registered devices.
 *
 * Two callers are supported:
 *  1. Authenticated clients — the session user_id must match the target user_id.
 *  2. Server webhook (Supabase DB triggers) — must supply the matching
 *     `secret` configured via PUSH_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  let body: SendBody;
  try {
    body = (await request.json()) as SendBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.user_id) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }
  if (!body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  // Authorize: webhook secret OR the authenticated session user.
  const webhookOk = WEBHOOK_SECRET && body.secret && body.secret === WEBHOOK_SECRET;
  if (!webhookOk) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== body.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const tokens = await getPushTokensForUser(body.user_id);
  if (tokens.length === 0) {
    return NextResponse.json({ ok: true, skipped: "no_tokens" });
  }

  await sendPushNotification({
    tokens,
    title: body.title,
    body: body.body,
    data: body.data,
  });

  return NextResponse.json({ ok: true });
}
