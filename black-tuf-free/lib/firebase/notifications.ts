"use client";

import { requestFcmToken, deleteFcmToken, onForegroundMessage } from "./messaging";
import { upsertPushToken, removePushToken } from "@/services/push-tokens";

export type NotificationPreference = "enabled" | "disabled";

export type EnablePushResult =
  | { ok: true; token: string }
  | { ok: false; reason: "missing-config" | "unsupported" | "denied" | "error"; detail?: string };

const PREF_KEY = "black-tuf-notification-pref";

export function getStoredPreference(): NotificationPreference {
  if (typeof window === "undefined") return "disabled";
  return (localStorage.getItem(PREF_KEY) as NotificationPreference) ?? "disabled";
}

export function setStoredPreference(pref: NotificationPreference) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREF_KEY, pref);
}

/**
 * Enable push notifications: request permission, obtain an FCM token and
 * persist it to Supabase. The result distinguishes a successful token from
 * the specific reason enabling failed (missing VAPID config, unsupported
 * browser, user denial, or token error).
 */
export async function enablePushNotifications(userId: string): Promise<EnablePushResult> {
  const result = await requestFcmToken();
  if (!result.ok) {
    setStoredPreference("disabled");
    return { ok: false, reason: result.reason, detail: result.detail };
  }
  await upsertPushToken(userId, result.token);
  setStoredPreference("enabled");
  return { ok: true, token: result.token };
}

/**
 * Disable push notifications: revoke the browser token and remove it from
 * Supabase.
 */
export async function disablePushNotifications(userId: string, token?: string): Promise<void> {
  if (token) {
    await removePushToken(token);
    await deleteFcmToken();
  }
  setStoredPreference("disabled");
}

/** Subscribe to foreground push messages and surface them via the callback. */
export function subscribeToForegroundMessages(callback: (payload: { title: string; body?: string; data?: Record<string, string> }) => void) {
  return onForegroundMessage(callback);
}
