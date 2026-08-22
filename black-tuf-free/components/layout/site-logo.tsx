"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useActiveServices } from "@/hooks/use-services";
import { Sparkles, ChevronRight } from "lucide-react";

export function SiteLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
        <Sparkles className="h-4 w-4 text-white" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </span>
      <span className="text-xl font-extrabold tracking-tight">
        <span className="text-gradient">Black Tuf</span>
      </span>
    </Link>
  );
}

export function ServiceMegaMenuContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  return (
    <div className="grid gap-1 p-3 sm:grid-cols-2 lg:w-[640px]">
      <ServicesMenuItems onNavigate={onNavigate} />
    </div>
  );
}

function ServicesMenuItems({ onNavigate }: { onNavigate?: () => void }) {
  const { services } = useActiveServices();
  return (
    <>
      {services.map((s) => (
        <Link
          key={s.id}
          href={`/services/${s.id}`}
          onClick={onNavigate}
          className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary transition-transform group-hover:scale-110">
            <s.icon className="h-4.5 w-4.5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">{s.title}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">
              {s.description}
            </span>
          </span>
        </Link>
      ))}
    </>
  );
}

export function NavLinks({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className={cn("flex items-center gap-1 text-sm", className)}>
      <div className="group relative">
        <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground">
          Services
          <ChevronRight className="h-3.5 w-3.5 rotate-90 transition-transform group-hover:-rotate-90" />
        </button>
        <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
          <div className="glass-strong overflow-hidden rounded-2xl shadow-2xl shadow-black/40">
            <ServiceMegaMenuContent onNavigate={onNavigate} />
          </div>
        </div>
      </div>
      <Link
        href="/projects"
        onClick={onNavigate}
        className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
      >
        Browse Projects
      </Link>
      <Link
        href="/engineers"
        onClick={onNavigate}
        className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
      >
        Engineers
      </Link>
      <Link
        href="/#how-it-works"
        onClick={onNavigate}
        className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
      >
        How it Works
      </Link>
    </nav>
  );
}
