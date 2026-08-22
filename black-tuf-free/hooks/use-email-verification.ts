"use client";

import { useCallback, useEffect, useState } from "react";
import { getCurrentIdToken, sendVerificationEmailFirebase } from "@/lib/firebase/auth";

export interface VerificationStatus {
  emailVerified: boolean;
  email: string;
}

/**
 * Live email-verification state backed by the server. The server verifies the
 * caller's Firebase ID token (never a client-supplied boolean), so the value
 * can't be spoofed.
 */
export function useEmailVerification() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idToken = await getCurrentIdToken();
      if (!idToken) {
        setStatus(null);
        return;
      }
      const res = await fetch("/api/auth/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Could not check verification status");
      }
      const data = (await res.json()) as VerificationStatus;
      setStatus(data);
    } catch (e: any) {
      setError(e.message ?? "Could not check verification status");
    } finally {
      setLoading(false);
    }
  }, []);

  const sendVerificationEmail = useCallback(async () => {
    setSending(true);
    setError(null);
    try {
      const ok = await sendVerificationEmailFirebase();
      if (!ok) throw new Error("No Firebase session. Sign in and try again.");
      setSent(true);
    } catch (e: any) {
      setError(e.message ?? "Failed to send verification email");
    } finally {
      setSending(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    status,
    verified: status?.emailVerified ?? false,
    email: status?.email ?? "",
    loading,
    sending,
    sent,
    error,
    refresh,
    sendVerificationEmail,
    resetSent: () => setSent(false),
  };
}
