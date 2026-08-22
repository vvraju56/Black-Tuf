import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
        <Sparkles className="h-6 w-6 animate-pulse text-white" />
      </span>
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
