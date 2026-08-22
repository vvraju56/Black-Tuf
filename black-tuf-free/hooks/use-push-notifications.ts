"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  enablePushNotifications,
  disablePushNotifications,
  subscribeToForegroundMessages,
  getStoredPreference,
  setStoredPreference,
  type NotificationPreference,
} from "@/lib/firebase/notifications";
import { toast } from "sonner";

export type PushPermissionState = "loading" | "granted" | "denied" | "unsupported" | "default";

/**
 * Manages Firebase push-notification state for the signed-in user:
 * FCM token lifecycle, permission status, enable/disable, foreground listener.
 */
export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<PushPermissionState>("loading");
  const [preference, setPreference] = useState<NotificationPreference>(getStoredPreference());
  const [token, setToken] = useState<string | null>(null);
  const [enabling, setEnabling] = useState(false);
  const [disabling, setDisabling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PushPermissionState);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToForegroundMessages((payload) => {
      toast.message(payload.title, { description: payload.body });
    });

    return () => unsubscribe();
  }, [user?.id]);

  const enable = useCallback(async () => {
    if (!user?.id) return;
    setEnabling(true);
    try {
      const result = await enablePushNotifications(user.id);
      if (result.ok) {
        setToken(result.token);
        setPreference("enabled");
        setPermission("granted");
        toast.message("Push notifications enabled", {
          description: "You'll now receive notifications for project updates.",
        });
      } else {
        setPreference("disabled");
        setPermission(Notification.permission as PushPermissionState);
        if (result.reason === "missing-config") {
          toast.error("Push notifications aren't configured", {
            description:
              "NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing from .env.local. Add the web push VAPID key and restart the dev server.",
          });
        } else if (result.reason === "denied") {
          toast.message("Notification permission denied", {
            description: "Allow notifications in your browser to receive push updates.",
          });
        } else {
          toast.error("Failed to enable push notifications", {
            description: result.detail ?? undefined,
          });
        }
      }
    } catch {
      setPreference("disabled");
      toast.error("Failed to enable push notifications");
    } finally {
      setEnabling(false);
    }
  }, [user?.id]);

  const disable = useCallback(async () => {
    if (!user?.id) return;
    setDisabling(true);
    try {
      await disablePushNotifications(user.id, token ?? undefined);
      setToken(null);
      setPreference("disabled");
      toast.message("Push notifications disabled");
    } finally {
      setDisabling(false);
    }
  }, [user?.id, token]);

  const toggle = useCallback(() => {
    if (preference === "enabled") {
      void disable();
    } else {
      void enable();
    }
  }, [preference, disable, enable]);

  const setPreferenceExternal = (pref: NotificationPreference) => {
    setStoredPreference(pref);
    setPreference(pref);
  };

  return {
    permission,
    preference,
    token,
    enabling,
    disabling,
    enable,
    disable,
    toggle,
    setPreference: setPreferenceExternal,
  };
}
