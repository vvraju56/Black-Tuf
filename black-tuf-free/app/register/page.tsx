"use client";

import React, { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { toast } from "@/components/ui/toast";
import {
  initFirebaseAuth,
  signUpWithEmailPasswordFirebase,
  signInWithGoogleFirebase,
} from "@/lib/firebase/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be 6+ characters"),
  role: z.enum(["client", "engineer"]),
});

type RegisterValues = z.infer<typeof registerSchema>;

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22.56 12.25c0-.75-.07-1.49-.19-2.21H12v4.26h5.92c-.26 1.37-1.04 2.52-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.75 3.28-8.13z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.21 1.06-3.52 1.06-2.72 0-5.02-1.83-5.83-4.24H2.84v2.84C4.78 21.57 8.04 23 12 23z" />
      <path d="M4.84 7.56L2.84 9.56c-1.14 1.31-1.84 3.12-1.84 5.06 0 2.72 1.57 5.08 3.85 6.24l3.57-2.77c-.22-.42-.35-.88-.35-1.36 0-1.01.27-1.95.74-2.76L4.84 7.56z" />
    </svg>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselect = searchParams.get("role");
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: preselect === "engineer" ? "engineer" : "client" },
  });

  const role = watch("role");

  React.useEffect(() => {
    void initFirebaseAuth();
  }, []);

  const completeExchange = async (idToken: string) => {
    const res = await fetch("/api/auth/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken,
        next: role === "engineer" ? "/engineer/settings" : "/dashboard",
        role,
      }),
    });
    const data = (await res.json()) as { redirectUrl?: string; error?: string };
    if (!res.ok || !data.redirectUrl) {
      throw new Error(data.error ?? "Could not start your session.");
    }
    window.location.href = data.redirectUrl;
  };

  const onSubmit = async (values: RegisterValues) => {
    setPending(true);
    try {
      const { idToken } = await signUpWithEmailPasswordFirebase(values.name, values.email, values.password);
      await completeExchange(idToken);
      toast.success("Account created. Check your inbox to verify your email.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      if (message.includes("auth/email-already-in-use")) {
        toast.error("This email is already registered. Try signing in instead.");
        router.push(`/login?email=${encodeURIComponent(values.email)}`);
        return;
      }
      toast.error(message);
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
      const message = error instanceof Error ? error.message : "Google sign-in failed";
      toast.error(message);
      setGooglePending(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-cyan-500 p-3 shadow-lg shadow-primary/30">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-extrabold">Join Black Tuf</h1>
        <p className="text-sm text-muted-foreground">Create a free account to start working</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-muted/30 p-1.5">
          {(["client", "engineer"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                const el = document.querySelector<HTMLInputElement>(`input[name="role"][value="${r}"]`);
                el?.click();
              }}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                role === r ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r === "client" ? "I need work done" : "I'm an engineer"}
            </button>
          ))}
          <input type="hidden" {...register("role")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="name" placeholder="Jane Doe" className="pl-9" {...register("name")} />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@company.com" className="pl-9" {...register("email")} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" placeholder="Minimum 6 characters" className="pl-9" {...register("password")} />
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-card px-2 text-xs text-muted-foreground">or</span>
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={googlePending}>
        {googlePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </Button>

      <p className="mt-5 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
