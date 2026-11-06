import { getFirebaseMessaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export async function registerFcmToken(apiUrl: string): Promise<string | null> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) return null;

  try {
    const token = await getToken(messaging, { vapidKey });
    if (!token) return null;
    // Persist token to backend (best-effort).
    await fetch(`${apiUrl}/api/notifications/fcm-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      credentials: 'include',
    }).catch(() => undefined);
    return token;
  } catch {
    return null;
  }
}

export function listenForegroundMessages(callback: (payload: unknown) => void) {
  getFirebaseMessaging().then((messaging) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => callback(payload));
  });
}