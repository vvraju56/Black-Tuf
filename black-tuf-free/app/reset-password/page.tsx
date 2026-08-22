"use client";

import React, { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { toast } from "@/components/ui/toast";
import { initFirebaseAuth, confirmPasswordResetFirebase } from "@/lib/firebase/auth";

const schema = z
  .object({
    password: z.string().min(6, "At least 6 characters"),
    confirm: z.string().min(6, "At least 6 characters"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match." });

type Values = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode") ?? "";
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [show, setShow] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  React.useEffect(() => {
    void initFirebaseAuth();
  }, []);

  const onSubmit = async (values: Values) => {
    setPending(true);
    try {
      await confirmPasswordResetFirebase(oobCode, values.password);
      setDone(true);
      toast.success("Password updated. Sign in with your new password.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Reset failed";
      toast.error(message.includes("invalid-action-code") ? "This reset link is invalid or expired." : message);
    } finally {
      setPending(false);
    }
  };

  if (!oobCode) {
    return (
      <AuthShell backHref="/login" backLabel="Back to login">
        <div className="py-6 text-center">
          <KeyRound className="mx-auto mb-4 h-8 w-8 text-primary" />
          <p className="text-sm text-muted-foreground">
            This link is missing the reset code. Please use the link from your email.
          </p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/forgot-password">Request a new reset link</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell backHref="/login" backLabel="Back to login">
        <div className="py-6 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-success" />
          <h1 className="text-2xl font-extrabold">Password updated</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You can now sign in with your new password.
          </p>
          <Button asChild variant="gradient" className="mt-6 w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell backHref="/login" backLabel="Back to login">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-cyan-500 p-3 shadow-lg shadow-primary/30">
          <KeyRound className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-extrabold">Set a new password</h1>
        <p className="text-sm text-muted-foreground">Your new password must be unique.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} className="pr-10" {...register("password")} />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShow(!show)}
              aria-label="Toggle password visibility"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <div className="relative">
            <Input id="confirm" type={show ? "text" : "password"} className="pr-10" {...register("confirm")} />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShow(!show)}
              aria-label="Toggle password visibility"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
        </div>

        <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            "Save new password"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
