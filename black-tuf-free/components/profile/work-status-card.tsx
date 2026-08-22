"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2, Lock, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEmailVerification } from "@/hooks/use-email-verification";
import { getCurrentIdToken } from "@/lib/firebase/auth";
import { EmailVerificationDialog } from "@/components/profile/email-verification-dialog";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

/**
 * Work Status section shown on the user's own profile.
 * - Not verified → "Email verification required" + [ Verify Email ]
 * - Verified + not freelancer → [ Start Working ]
 * - Verified + freelancer → "Email Verified" badge
 *   (availability is toggled from the profile header, gated by verification)
 */
export function WorkStatusCard() {
  const { profile } = useAuth();
  const { verified, loading } = useEmailVerification();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [starting, setStarting] = useState(false);

  const isFreelancer = profile?.role === "engineer" || profile?.freelancer_enabled;

  const startWorking = async () => {
    setStarting(true);
    try {
      const idToken = await getCurrentIdToken();
      if (!idToken) throw new Error("No Firebase session. Sign in and try again.");
      const res = await fetch("/api/auth/freelancer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; verified?: boolean };
      if (!res.ok) {
        if (res.status === 403) {
          setDialogOpen(true);
          return;
        }
        throw new Error(body.error ?? "Could not enable freelancer mode");
      }
      toast.success("Freelancer mode enabled. Welcome aboard!");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong");
    } finally {
      setStarting(false);
    }
  };

  return (
    <section className="glass-card rounded-2xl p-5 sm:p-6">
      <h2 className="text-sm font-semibold">Work Status</h2>

      {loading ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking verification…
        </div>
      ) : verified ? (
        <div className="mt-3">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-500">
            <BadgeCheck className="h-4 w-4" /> Email Verified
          </p>
          {isFreelancer ? (
            <p className="mt-1 text-xs text-muted-foreground">
              You're set up to find work. Toggle "Available for Work" from your profile header.
            </p>
          ) : (
            <Button className="mt-3" size="sm" onClick={startWorking} disabled={starting}>
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              Start Working
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-3">
          <p className="flex items-center gap-2 text-sm font-medium text-amber-500">
            <Lock className="h-4 w-4" /> Email verification required
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Email verification is required before you can submit proposals or accept
            freelance work.
          </p>
          <Button className="mt-3" size="sm" onClick={() => setDialogOpen(true)}>
            Verify Email
          </Button>
        </div>
      )}

      <EmailVerificationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onVerified={() => {
          setDialogOpen(false);
          toast.success("Email verified. You can now start working.");
          router.refresh();
        }}
      />
    </section>
  );
}
