"use client";

import { useEffect, useState } from "react";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useAuth } from "@/hooks/use-auth";
import { testPushNotification } from "@/services/push-tokens";
import { Monitor, Moon, Sun, Bell, BellRing, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Theme = "light" | "dark" | "system";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("theme") as Theme) ?? "system";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", dark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}

const PERMISSION_LABEL: Record<string, string> = {
  granted: "Allowed",
  denied: "Blocked",
  default: "Not requested",
  unsupported: "Not supported",
  loading: "Checking…",
};

export default function SettingsPage() {
  useDashboardTitle("Settings");
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const [testing, setTesting] = useState(false);
  const { user } = useAuth();

  const {
    permission,
    preference,
    enabling,
    disabling,
    enable,
    disable,
    setPreference,
  } = usePushNotifications();

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleTest = async () => {
    setTesting(true);
    try {
      await testPushNotification(user?.id ?? "");
      toast.message("Test notification sent", {
        description: "If you don't see it, check your browser settings.",
      });
    } catch {
      toast.error("Failed to send test notification");
    } finally {
      setTesting(false);
    }
  };

  const handleInAppToggle = (value: boolean) => {
    setPreference(value ? "enabled" : "disabled");
    toast.message(value ? "In-app notifications enabled" : "In-app notifications disabled");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how the app looks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 rounded-md border p-1">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1.5 text-sm transition-colors ${theme === "light" ? "bg-primary text-primary-foreground" : ""}`}
            >
              <Sun className="h-4 w-4" /> Light
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1.5 text-sm transition-colors ${theme === "dark" ? "bg-primary text-primary-foreground" : ""}`}
            >
              <Moon className="h-4 w-4" /> Dark
            </button>
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1.5 text-sm transition-colors ${theme === "system" ? "bg-primary text-primary-foreground" : ""}`}
            >
              <Monitor className="h-4 w-4" /> System
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Receive browser notifications via Firebase Cloud Messaging.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Browser push notifications</Label>
              <p className="text-sm text-muted-foreground">
                Permission:{" "}
                <Badge
                  variant="outline"
                  className={`ml-1 text-[10px] ${
                    permission === "granted"
                      ? "border-success/40 bg-success/10 text-success"
                      : permission === "denied"
                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                        : ""
                  }`}
                >
                  {PERMISSION_LABEL[permission] ?? permission}
                </Badge>
              </p>
            </div>
            <Switch
              checked={preference === "enabled"}
              onCheckedChange={(v) => {
                if (v) void enable();
                else void disable();
              }}
              disabled={enabling || disabling}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-3">
            <div className="space-y-1">
              <Label className="text-sm">In-app notifications</Label>
              <p className="text-xs text-muted-foreground">
                Show toast notifications inside the app.
              </p>
            </div>
            <Switch
              checked={preference === "enabled"}
              onCheckedChange={handleInAppToggle}
            />
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleTest}
            disabled={testing || preference !== "enabled"}
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {preference === "enabled" ? "Test Notification" : "Enable notifications to test"}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            What you'll be notified about
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "New proposal received",
              "New message from an engineer",
              "Project assigned to engineer",
              "Project status update",
              "Site visit scheduled",
              "Payment received",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-xl border border-border/50 px-3 py-2.5 text-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
