"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Mail, Lock, Loader2, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { toast } from "@/components/ui/toast";
import { supabase } from "@/services/client";
import {
  initFirebaseAuth,
  signInWithEmailPasswordFirebase,
  signInWithGoogleFirebase,
  getGoogleCredentialFromError,
  linkGoogleCredentialFirebase,
  sendPasswordResetEmailFirebase,
} from "@/lib/firebase/auth";
import type { AuthCredential } from "firebase/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be 6+ characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22.56 12.25c0-.75-.07-1.49-.19-2.21H12v4.26h5.92c-.26 1.37-1.04 2.52-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.75 3.28-8.13z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.21 1.06-3.52 1.06-2.72 0-5.02-1.83-5.83-4.24H2.84v2.84C4.78 21.57 8.04 23 12 23z" />
      <path d="M4.84 7.56L2.84 9.56c-1.14 1.31-1.84 3.12-1.84 5.06 0 2.72 1.57 5.08 3.85 6.24l3.57-2.77c-.22-.42-.35-.88-.35-1.36 0-1.01.27-1.95.74-2.76L4.84 7.56z" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [linkEmail, setLinkEmail] = useState<string | null>(null);
  const [linkCredential, setLinkCredential] = useState<AuthCredential | null>(null);
  const [linkPassword, setLinkPassword] = useState("");
  const [linking, setLinking] = useState(false);
  const next = searchParams.get("next") ?? "/";

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  React.useEffect(() => {
    void initFirebaseAuth();
    const reason = searchParams.get("reason") ?? searchParams.get("error") ?? "";
    const email = searchParams.get("email");
    if (email) setValue("email", email);
    if (reason === "google") toast.error("Google sign-in failed. Please try again.");
    if (reason === "auth") toast.error("Sign-in link is invalid or expired.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const completeExchange = async (idToken: string) => {
    const res = await fetch("/api/auth/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, next }),
    });
    const data = (await res.json()) as { redirectUrl?: string; tokenHash?: string | null; email?: string; error?: string; emailVerified?: boolean };
    if (!res.ok || !data.tokenHash) {
      throw new Error(data.error ?? "Could not start your session.");
    }
    // Verify the OTP on the client side — this establishes the session in
    // localStorage where the browser client can read it.
    const { error } = await supabase().auth.verifyOtp({
      token_hash: data.tokenHash,
      type: "magiclink",
      email: data.email ?? undefined,
    });
    if (error) throw new Error(error.message);
    // Session is now established — navigate to the dashboard.
    const nextPath = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
    window.location.href = nextPath;
  };

  const onSubmit = async (values: LoginValues) => {
    setPending(true);
    try {
      const { idToken } = await signInWithEmailPasswordFirebase(values.email, values.password);
      await completeExchange(idToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-in failed";
      toast.error(message === "Firebase: Error (auth/invalid-credential)." ? "Invalid email or password." : message);
      setPending(false);
    }
  };

  const onGoogle = async () => {
    setGooglePending(true);
    try {
      const result = await signInWithGoogleFirebase();
      if (!result) throw new Error("Google sign-in is not available.");
      await completeExchange(result.idToken);
    } catch (error) {
      const link = getGoogleCredentialFromError(error);
      if (link) {
        setLinkEmail(link.email);
        setLinkCredential(link.credential);
        setGooglePending(false);
        return;
      }
      const message = error instanceof Error ? error.message : "Google sign-in failed";
      toast.error(message);
      setGooglePending(false);
    }
  };

  const onLinkAccount = async () => {
    if (!linkEmail || !linkCredential) return;
    if (linkPassword.length < 6) return toast.error("Enter your password.");
    setLinking(true);
    try {
      const idToken = await linkGoogleCredentialFirebase(linkEmail, linkPassword, linkCredential);
      await completeExchange(idToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Linking failed";
      toast.error(message.includes("auth/wrong-password") ? "Wrong password." : message);
      setLinking(false);
    }
  };

  const onReset = async () => {
    const email = getValues("email");
    if (!email) return toast.error("Enter your email first.");
    setResetting(true);
    try {
      await sendPasswordResetEmailFirebase(email);
      toast.success("Password reset link sent to your email.");
    } catch {
      toast.error("Could not send reset link. Check your email address.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-cyan-500 p-3 shadow-lg shadow-primary/30">
          <LogIn className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-extrabold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your Black Tuf account</p>
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button type="button" onClick={onReset} disabled={resetting} className="text-xs text-primary hover:underline">
              {resetting ? "Sending…" : "Forgot password?"}
            </button>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...register("password")} />
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-card px-2 text-xs text-muted-foreground">or continue with</span>
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={googlePending}>
        {googlePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </Button>

      {linkEmail && linkCredential && (
        <div className="relative rounded-2xl border border-primary/40 bg-primary/5 p-4">
          <button
            type="button"
            onClick={() => {
              setLinkEmail(null);
              setLinkCredential(null);
              setLinkPassword("");
            }}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Link2 className="h-4 w-4 text-primary" />
            Link your Google account
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            An account with <span className="font-medium text-foreground">{linkEmail}</span> already
            exists. Enter its password to link Google sign-in to it.
          </p>
          <div className="mt-3 space-y-2">
            <Input
              type="password"
              placeholder="Existing password"
              value={linkPassword}
              onChange={(e) => setLinkPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void onLinkAccount()}
            />
            <Button type="button" variant="gradient" className="w-full" disabled={linking} onClick={onLinkAccount}>
              {linking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Linking…
                </>
              ) : (
                "Link & continue"
              )}
            </Button>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Register
        </Link>
      </p>
    </AuthShell>
  );
}
