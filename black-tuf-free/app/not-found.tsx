import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="rounded-full bg-primary/10 p-4 text-primary">
        <FileQuestion className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
      <p className="max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button variant="gradient" asChild>
          <Link href="/">Back home</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/services">Browse services</Link>
        </Button>
      </div>
    </main>
  );
}
