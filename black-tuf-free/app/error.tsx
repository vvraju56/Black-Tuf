"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight">
        Something went wrong
      </h1>
      <p className="max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button variant="gradient" onClick={reset}>
          Try again
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </main>
  );
}
