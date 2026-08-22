import "server-only";
import { initializeApp, cert, getApps, getApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

/**
 * Server-side Firebase Admin. Used for FCM push messages and Firebase
 * ID-token verification. Requires the service-account JSON exported from the
 * Firebase console, configured via FIREBASE_SERVICE_ACCOUNT_JSON.
 */
function getAdminApp(): App | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;
  try {
    if (getApps().length > 0) return getApp();
    // Env-var storage can turn the escaped \n in the private key into raw
    // newlines, which makes the JSON invalid. Re-escape them before parsing.
    const normalized = json.replace(/\r?\n/g, "\\n");
    const account = JSON.parse(normalized) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
    return initializeApp({
      credential: cert({
        projectId: account.project_id,
        clientEmail: account.client_email,
        privateKey: account.private_key,
      }),
    });
  } catch {
    return null;
  }
}

function getAdminAuth(): Auth | null {
  const app = getAdminApp();
  if (!app) return null;
  try {
    return getAuth(app);
  } catch {
    return null;
  }
}

function getAdminMessaging(): Messaging | null {
  const app = getAdminApp();
  if (!app) return null;
  try {
    return getMessaging(app);
  } catch {
    return null;
  }
}

export interface VerifiedFirebaseUser {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  phone: string | null;
  emailVerified: boolean;
}

/**
 * Verifies a Firebase ID token server-side and returns the trusted claims.
 * Throws when the token is invalid or the admin SDK is not configured.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseUser> {
  const auth = getAdminAuth();
  if (!auth) throw new Error("Firebase admin SDK is not configured");
  const decoded = await auth.verifyIdToken(idToken);
  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    name: (decoded.name as string | undefined) ?? null,
    picture: (decoded.picture as string | undefined) ?? null,
    phone: (decoded.phone_number as string | undefined) ?? null,
    emailVerified: Boolean(decoded.email_verified),
  };
}

export interface PushMessageInput {
  tokens: string[];
  title: string;
  body?: string;
  data?: Record<string, string>;
}

/**
 * Send a web push notification to the given FCM tokens.
 * Returns a per-token send result. No-ops when admin SDK is not configured.
 */
export async function sendPushNotification(input: PushMessageInput): Promise<void> {
  const messaging = getAdminMessaging();
  if (!messaging || input.tokens.length === 0) return;

  const message = {
    data: {
      title: input.title,
      body: input.body ?? "",
      ...(input.data ?? {}),
    },
    tokens: input.tokens,
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    // Prune any tokens that FCM reports as invalid/registered to a different app.
    const invalidTokens: string[] = [];
    response.responses.forEach((res, index) => {
      if (!res.success) invalidTokens.push(input.tokens[index]);
    });
    if (invalidTokens.length > 0) {
      const { createClient } = await import("@/lib/supabase/push-tokens-admin");
      await createClient().removePushTokens(invalidTokens);
    }
  } catch {
    // Best effort push delivery.
  }
}
