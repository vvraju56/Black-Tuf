"use client";

import React, { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { toast } from "@/components/ui/toast";
import { initFirebaseAuth, sendPasswordResetEmailFirebase } from "@/lib/firebase/auth";

const schema = z.object({ email: z.string().email() });
type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
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
      await sendPasswordResetEmailFirebase(values.email);
      toast.success("Password reset link sent to your email.");
    } catch {
      toast.error("Could not send reset link. Check your email address.");
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell backHref="/login" backLabel="Back to login">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-cyan-500 p-3 shadow-lg shadow-primary/30">
          <Send className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-extrabold">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@company.com" className="pl-9" {...register("email")} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending…
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
