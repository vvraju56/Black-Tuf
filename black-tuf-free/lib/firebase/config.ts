import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getMessaging, isSupported as isMessagingSupported, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0
);

export function isFirebaseConfigured(): boolean {
  return hasConfig;
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!hasConfig) return null;
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig as Record<string, string>);
}

let messagingInstance: Messaging | null | undefined;

/** Lazily initialised Firebase Cloud Messaging (browser + service worker support). */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (messagingInstance !== undefined) return messagingInstance;
  if (typeof window === "undefined" || !hasConfig) {
    messagingInstance = null;
    return null;
  }
  try {
    const app = getFirebaseApp();
    if (!app || !(await isMessagingSupported())) {
      messagingInstance = null;
      return null;
    }
    messagingInstance = getMessaging(app);
  } catch {
    messagingInstance = null;
  }
  return messagingInstance;
}
