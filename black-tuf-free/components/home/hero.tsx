"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Bot,
  Briefcase,
  Building2,
  FolderKanban,
  MessageSquare,
  Rocket,
  Search,
  Sparkles,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuroraBackground } from "@/components/home/aurora-background";
import { useActiveServices } from "@/hooks/use-services";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Hero() {
  const router = useRouter();
  const { services } = useActiveServices();
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return services
      .filter((s) =>
        (s.title + " " + s.short + " " + s.description).toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [query, services]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    const found = services.find((s) => s.title.toLowerCase() === q.toLowerCase());
    if (found) {
      router.push(`/services/${found.id}`);
    } else if (q) {
      router.push(`/projects?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <section className="relative overflow-hidden">
      <AuroraBackground />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pt-20">
        {/* Left — copy */}
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl">
          <motion.div
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Engineering Digital &amp; Industrial Solutions
          </motion.div>

          <motion.h1
            variants={item}
            className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl"
          >
            Build your next project with{" "}
            <span className="text-gradient block">trusted technology experts</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            Post a project, review real proposals and hire vetted engineers for web,
            mobile, AI, IoT, PLC and electrical works — with milestone-protected
            payments on every engagement.
          </motion.p>

          <motion.div variants={item} className="mt-7 flex flex-wrap items-center gap-3">
            <Button size="lg" variant="gradient" asChild>
              <Link href="/dashboard/projects/new">
                <Rocket className="h-4 w-4" />
                Post a Project
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register?role=engineer">
                <UserPlus className="h-4 w-4" />
                Join as an Engineer
              </Link>
            </Button>
          </motion.div>

          {/* Search bar */}
          <motion.form
            variants={item}
            onSubmit={onSearch}
            className="glass-strong relative mt-8 flex max-w-xl items-center gap-2 rounded-2xl p-2 shadow-2xl shadow-black/30"
          >
            <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="What service are you looking for today?"
              className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
              aria-label="Search for a service"
            />
            <Button type="submit" className="h-11 shrink-0 px-5" variant="gradient">
              Search
            </Button>

            {showSuggestions && query.trim() && matches.length > 0 && (
              <div className="glass-strong absolute inset-x-2 top-full z-30 mt-2 overflow-hidden rounded-2xl p-1.5 shadow-2xl shadow-black/40">
                {matches.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onMouseDown={() => {
                      router.push(`/services/${s.id}`);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent/60"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <s.icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{s.title}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.form>

          {/* Suggested searches */}
          <motion.div variants={item} className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {services.slice(0, 6).map((s) => (
              <Link
                key={s.id}
                href={`/services/${s.id}`}
                className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {s.title}
              </Link>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — animated illustration */}
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  const cards = [
    {
      icon: TrendingUp,
      label: "Live Projects",
      sub: "12 active now",
      className: "left-0 top-[4%] animate-float",
      delay: "0s",
    },
    {
      icon: BadgeCheck,
      label: "Verified Engineers",
      sub: "Skills verified",
      className: "right-0 top-[14%] animate-float",
      delay: "-2.5s",
    },
    {
      icon: Building2,
      label: "Active Clients",
      sub: "Across 30+ countries",
      className: "bottom-[16%] left-[4%] animate-float",
      delay: "-5s",
    },
    {
      icon: MessageSquare,
      label: "Real-time Chat",
      sub: "Instant updates",
      className: "bottom-[4%] right-[10%] animate-float",
      delay: "-3.5s",
    },
    {
      icon: FolderKanban,
      label: "Project Progress",
      sub: "Milestone tracked",
      className: "right-[26%] top-[2%] hidden xl:flex animate-float",
      delay: "-1.2s",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      className="relative hidden lg:block"
      aria-hidden
    >
      {/* Center dashboard card */}
      <div className="glass-card relative mx-auto max-w-sm rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg shadow-primary/30">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold">Project Dashboard</p>
              <p className="text-xs text-muted-foreground">Black Tuf Workspace</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Live
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {[
            { name: "E-commerce platform", pct: 82, color: "bg-gradient-to-r from-indigo-500 to-cyan-400" },
            { name: "IoT monitoring app", pct: 64, color: "bg-gradient-to-r from-violet-500 to-fuchsia-400" },
            { name: "PLC line automation", pct: 45, color: "bg-gradient-to-r from-cyan-400 to-emerald-400" },
          ].map((p, i) => (
            <div key={p.name} className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium">{p.name}</span>
                <span className="text-muted-foreground">{p.pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-border/70">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.pct}%` }}
                  transition={{ duration: 1.1, delay: 0.6 + i * 0.18, ease: "easeOut" }}
                  className={`h-full rounded-full ${p.color}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3">
          <div>
            <p className="text-xs text-muted-foreground">Milestone released</p>
            <p className="text-sm font-bold text-success">₹ 48,500</p>
          </div>
          <span className="rounded-lg bg-success/15 px-2 py-1 text-[11px] font-medium text-success">
            Escrow protected
          </span>
        </div>
      </div>

      {/* Floating glass cards */}
      {cards.map((c) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 + Number(c.delay.replace("-", "")) * 0.02 }}
          className={`absolute ${c.className}`}
        >
          <div className="glass-strong flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-xl shadow-black/30">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <c.icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-xs font-bold leading-tight">{c.label}</p>
              <p className="text-[10px] text-muted-foreground">{c.sub}</p>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Animated connecting lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 560 560"
        fill="none"
      >
        <motion.path
          d="M140 60 C 210 160, 150 220, 280 270"
          stroke="url(#lineGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: 1 }}
        />
        <motion.path
          d="M430 90 C 420 180, 380 220, 320 280"
          stroke="url(#lineGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: 1.2 }}
        />
        <motion.path
          d="M60 430 C 140 360, 220 340, 290 330"
          stroke="url(#lineGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: 1.4 }}
        />
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
        <div className="glass-strong inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium">
          <Briefcase className="h-3.5 w-3.5 text-primary" />
          Trusted by ambitious teams worldwide
        </div>
      </div>
    </motion.div>
  );
}
