import { cn } from "@/lib/utils";

export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="animate-aurora absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-indigo-600/25 blur-3xl" />
      <div
        className="animate-aurora absolute right-[-10%] top-[-5%] h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-3xl"
        style={{ animationDelay: "-5s" }}
      />
      <div
        className="animate-aurora absolute bottom-[-20%] left-[30%] h-[460px] w-[460px] rounded-full bg-violet-600/20 blur-3xl"
        style={{ animationDelay: "-9s" }}
      />
      <div
        className="animate-pulse-slow absolute left-[55%] top-[40%] h-[300px] w-[300px] rounded-full bg-fuchsia-500/10 blur-3xl"
      />
    </div>
  );
}
