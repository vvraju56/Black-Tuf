"use client";

import { getFirebaseApp } from "./config";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  linkWithCredential,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  confirmPasswordReset,
  verifyBeforeUpdateEmail,
  signOut,
  onAuthStateChanged,
  type Auth,
  type AuthCredential,
  type User,
} from "firebase/auth";

let authInstance: Auth | null | undefined;

function getFirebaseAuth(): Auth | null {
  if (authInstance !== undefined) return authInstance;
  const app = getFirebaseApp();
  if (!app) {
    authInstance = null;
    return null;
  }
  authInstance = getAuth(app);
  return authInstance;
}

function origin() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  return window.location.origin;
}

/** Persist the Firebase session across page reloads. */
export async function initFirebaseAuth(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await setPersistence(auth, browserLocalPersistence);
}

/** Get the current Firebase ID token, if a session exists. */
export async function getCurrentIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}

function mapUser(user: User): {
  uid: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  phone: string | null;
  emailVerified: boolean;
} {
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    avatar: user.photoURL,
    phone: user.phoneNumber,
    emailVerified: user.emailVerified,
  };
}

/**
 * Google Sign-In via Firebase popup. Resolves with the idToken + profile.
 * (Popup is used instead of redirect because signInWithRedirect gets stuck
 * during the Google -> Firebase handler round-trip on localhost.)
 */
export async function signInWithGoogleFirebase(): Promise<{
  idToken: string;
  user: ReturnType<typeof mapUser>;
} | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken();
  return { idToken: token, user: mapUser(result.user) };
}

/** Email/password sign-in via Firebase. Resolves with the idToken + profile. */
export async function signInWithEmailPasswordFirebase(
  email: string,
  password: string
): Promise<{ idToken: string; user: ReturnType<typeof mapUser> }> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured");
  const result = await signInWithEmailAndPassword(auth, email, password);
  const token = await result.user.getIdToken();
  return { idToken: token, user: mapUser(result.user) };
}

/** Create a new account via Firebase, then send an email verification. */
export async function signUpWithEmailPasswordFirebase(
  name: string,
  email: string,
  password: string
): Promise<{ idToken: string; user: ReturnType<typeof mapUser> }> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured");
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  await sendEmailVerification(result.user, { url: `${origin()}/verify-email` });
  const token = await result.user.getIdToken();
  return { idToken: token, user: mapUser(result.user) };
}

/** Send a Firebase password-reset email. */
export async function sendPasswordResetEmailFirebase(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured");
  await sendPasswordResetEmail(auth, email, {
    url: `${origin()}/reset-password`,
  });
}

/** Complete a Firebase password reset using the oobCode from the email link. */
export async function confirmPasswordResetFirebase(code: string, password: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured");
  await confirmPasswordReset(auth, code, password);
}

/** Send an email verification link to the currently signed-in Firebase user. */
export async function sendVerificationEmailFirebase(): Promise<boolean> {
  const auth = getFirebaseAuth();
  if (!auth || !auth.currentUser) return false;
  await sendEmailVerification(auth.currentUser, { url: `${origin()}/verify-email` });
  return true;
}

/**
 * Change the current user's email. Firebase sends a verification link to the
 * new address first; the change applies once that link is confirmed.
 */
export async function changeEmailFirebase(newEmail: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth || !auth.currentUser) throw new Error("No Firebase session. Sign in and try again.");
  await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
}

/** Sign out of Firebase (session cookie/Supabase handled by /api/auth/logout). */
export async function signOutFirebase(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}

/** Subscribe to Firebase auth state changes (returns unsubscribe). */
export function onFirebaseAuthStateChange(cb: (user: ReturnType<typeof mapUser> | null) => void) {
  const auth = getFirebaseAuth();
  if (!auth) return () => {};
  return onAuthStateChanged(auth, (user) => cb(user ? mapUser(user) : null));
}

/**
 * Extract the pending Google credential when Google sign-in fails with
 * "account already registered with a different credential". Callers can then
 * sign in with the email/password and link the Google credential to that user.
 */
export function getGoogleCredentialFromError(
  error: unknown
): { email: string; credential: AuthCredential } | null {
  if (
    error &&
    typeof error === "object" &&
    (error as { code?: string }).code === "auth/account-exists-with-different-credential"
  ) {
    const email = (error as { email?: string }).email ?? "";
    const credential = GoogleAuthProvider.credentialFromError(
      error as Parameters<typeof GoogleAuthProvider.credentialFromError>[0]
    );
    if (credential && email) return { email, credential };
  }
  return null;
}

/**
 * Sign in with email/password, then link the Google credential to that
 * account. Returns the current idToken afterwards (covers both email and
 * Google sign-in in one session).
 */
export async function linkGoogleCredentialFirebase(
  email: string,
  password: string,
  credential: AuthCredential
): Promise<string> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured");
  const result = await signInWithEmailAndPassword(auth, email, password);
  const linked = await linkWithCredential(result.user, credential);
  const token = await linked.user.getIdToken();
  return token;
}
