"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock, MailCheck, MailWarning, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEmailVerification } from "@/hooks/use-email-verification";
import { changeEmailFirebase } from "@/lib/firebase/auth";
import { toast } from "sonner";

export function EmailVerificationDialog({
  open,
  onOpenChange,
  onVerified,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onVerified?: () => void;
}) {
  const { verified, email, loading, sending, sent, error, refresh, sendVerificationEmail, resetSent } =
    useEmailVerification();
  const [newEmail, setNewEmail] = useState("");
  const [changing, setChanging] = useState(false);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (open && verified) onVerified?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, verified]);

  const handleChangeEmail = async () => {
    const value = newEmail.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Enter a valid email address");
      return;
    }
    setChanging(true);
    try {
      await changeEmailFirebase(value);
      setChanged(true);
      toast.success("Check your new inbox to confirm the address change.");
    } catch (e: any) {
      toast.error("Could not change email", { description: e.message });
    } finally {
      setChanging(false);
    }
  };

  const handleSend = async () => {
    await sendVerificationEmail();
    if (!error) toast.success("Verification email sent. Check your inbox.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              {verified ? <MailCheck className="h-4.5 w-4.5" /> : <MailWarning className="h-4.5 w-4.5" />}
            </span>
            <DialogTitle>Verify your email to start working</DialogTitle>
          </div>
          <DialogDescription>
            Email verification is required before you can submit proposals or accept
            freelance work.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking verification status…
            </div>
          ) : verified ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-500">
              <MailCheck className="h-4 w-4" /> Email Verified
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-foreground/85">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <p className="font-medium">{email || "Your email"} is not verified yet.</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Once verified you can browse freelancer-matched projects, submit proposals
                    and accept work.
                  </p>
                </div>
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <div className="flex flex-col gap-2">
                <Button variant="gradient" onClick={handleSend} disabled={sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sent ? "Resend Email" : "Send Verification Email"}
                </Button>
                {sent && !error && (
                  <p className="text-center text-xs text-emerald-500">Verification email sent.</p>
                )}
                <Button variant="outline" onClick={() => { resetSent(); setChanged(false); void refresh(); }}>
                  Resend Email
                </Button>
              </div>

              <div className="rounded-lg border border-border/60 p-3">
                {changed ? (
                  <p className="text-sm text-emerald-500">
                    Change email confirmation sent to {newEmail}. Check that inbox to complete the change.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Change Email</Label>
                    <div className="flex gap-2">
                      <Input
                        id="new-email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder={email || "new@example.com"}
                      />
                      <Button variant="secondary" onClick={handleChangeEmail} disabled={changing}>
                        {changing && <Loader2 className="h-4 w-4 animate-spin" />} Change
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!verified && !loading && (
            <Button variant="outline" onClick={() => { resetSent(); void refresh(); }}>
              Check again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
