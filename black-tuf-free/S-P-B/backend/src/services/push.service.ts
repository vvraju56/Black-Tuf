import admin from 'firebase-admin';

let initialized = false;
let configured = false;

const initFirebase = (): boolean => {
  if (initialized) return configured;
  initialized = true;

  const credRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const credPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const legacyKey = process.env.FCM_SERVER_KEY;

  if (credRaw) {
    try {
      admin.initializeApp({ credential: admin.credential.cert(JSON.parse(credRaw)) });
      configured = true;
      return true;
    } catch (err) {
      console.error('[push] Invalid FIREBASE_SERVICE_ACCOUNT:', (err as Error).message);
      return false;
    }
  }

  if (credPath) {
    try {
      admin.initializeApp({ credential: admin.credential.cert(credPath) });
      configured = true;
      return true;
    } catch (err) {
      console.error('[push] Cannot load FIREBASE_SERVICE_ACCOUNT_PATH:', (err as Error).message);
      return false;
    }
  }

  if (legacyKey) {
    // Legacy server key: firebase-admin v13 no longer supports legacy keys natively,
    // so we log the requirement and skip actual sending.
    console.warn('[push] FCM_SERVER_KEY is deprecated; provide FIREBASE_SERVICE_ACCOUNT for real push.');
    configured = false;
    return false;
  }

  return false;
};

/**
 * Send a push notification to a user's device.
 * Requires FCM registration tokens to be stored on the user (deviceTokens).
 * No-op when Firebase is not configured.
 */
export const sendPushNotification = async (
  userId: string,
  payload: { title: string; message: string; data?: Record<string, unknown> }
): Promise<void> => {
  if (!initFirebase()) return;

  const User = (await import('../models/User')).default;
  const user = await User.findById(userId).select('deviceTokens');
  const tokens: string[] = (user?.deviceTokens || []).filter(Boolean);
  if (tokens.length === 0) return;

  await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title: payload.title, body: payload.message },
    data: { click_action: 'FLUTTER_NOTIFICATION_CLICK', ...(payload.data || {}) },
  });
};

export default { sendPushNotification };
