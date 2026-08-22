import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Offline() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="rounded-full bg-muted p-4 text-muted-foreground">
        <WifiOff className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight">You&apos;re offline</h1>
      <p className="max-w-md text-muted-foreground">
        Check your internet connection and try again.
      </p>
      <div className="mt-2">
        <Button variant="gradient" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
      <Link href="/" className="mt-4 text-sm text-primary hover:underline">
        Back home
      </Link>
    </main>
  );
}
