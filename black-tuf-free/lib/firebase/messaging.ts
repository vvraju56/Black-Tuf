import { getToken, onMessage, deleteToken, type Messaging } from "firebase/messaging";
import { getFirebaseMessaging } from "./config";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export type FcmRequestResult =
  | { ok: true; token: string }
  | { ok: false; reason: "missing-config" | "unsupported" | "denied" | "error"; detail?: string };

/**
 * Request browser notification permission and return the FCM token.
 * The result distinguishes a missing VAPID key / unsupported browser from a
 * user denying the permission prompt, so callers can show an accurate message.
 */
export async function requestFcmToken(): Promise<FcmRequestResult> {
  if (typeof window === "undefined" || !VAPID_KEY) {
    return { ok: false, reason: "missing-config" };
  }
  if (!("Notification" in window)) {
    return { ok: false, reason: "unsupported" };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "denied" };

  const messaging: Messaging | null = await getFirebaseMessaging();
  if (!messaging) return { ok: false, reason: "unsupported" };

  try {
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!currentToken) return { ok: false, reason: "error" };
    return { ok: true, token: currentToken };
  } catch (err) {
    console.error("FCM getToken failed:", err);
    return {
      ok: false,
      reason: "error",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Remove a stored FCM token (e.g. when the user disables notifications). */
export async function deleteFcmToken(): Promise<void> {
  const messaging: Messaging | null = await getFirebaseMessaging();
  if (!messaging) return;
  try {
    await deleteToken(messaging);
  } catch {
    // Token may already be invalid; nothing further to do.
  }
}

/**
 * Subscribe to in-app (foreground) push messages.
 * Returns an unsubscribe function. Used to surface realtime in-app toasts.
 */
export function onForegroundMessage(callback: (payload: { title: string; body?: string; data?: Record<string, string> }) => void) {
  let unsubscribe: (() => void) | null = null;

  void getFirebaseMessaging().then((messaging) => {
    if (!messaging) return;
    unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? "Black Tuf";
      const body = payload.notification?.body ?? "";
      callback({ title, body, data: payload.data as Record<string, string> | undefined });
    });
  });

  return () => unsubscribe?.();
}
