"use client";

import { useState } from "react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";
import { BellRing, X } from "lucide-react";

/**
 * Requests browser notification permission after the user is signed in.
 * Dismissible and shown only once per session.
 */
export function NotificationPermissionPrompt() {
  const { permission, preference, enable, enabling } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;
  if (permission === "loading" || permission === "unsupported") return null;
  if (permission === "denied") return null;
  if (preference === "enabled" && permission === "granted") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm animate-black-tuf-fade-in">
      <div className="black-tuf-glass-strong rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl black-tuf-gradient">
            <BellRing className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Stay in the loop</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Get instant push notifications for new proposals, messages and project updates.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => enable()}
                disabled={enabling}
                className="h-8 bg-gradient-to-r from-blue-600 to-cyan-500 text-xs text-white"
              >
                {enabling ? "Enabling…" : "Enable Notifications"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissed(true)}
                className="h-8 text-xs"
              >
                Not now
              </Button>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
