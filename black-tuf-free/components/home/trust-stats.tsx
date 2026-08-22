"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, animate, motion, useInView } from "framer-motion";
import {
  Award,
  Building2,
  Globe2,
  Headset,
  Lock,
  Rocket,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicStats, type PublicStats } from "@/hooks/use-public-stats";

const statMeta = [
  { key: "projectsCompleted", label: "Projects Completed", icon: Rocket, suffix: "+" },
  { key: "professionals", label: "Verified Professionals", icon: Users, suffix: "+" },
  { key: "clients", label: "Active Clients", icon: Building2, suffix: "+" },
  { key: "successRate", label: "Success Rate", icon: ShieldCheck, suffix: "%" },
  { key: "countries", label: "Countries Served", icon: Globe2, suffix: "+" },
  { key: "yearsExperience", label: "Years Experience", icon: Award, suffix: "+" },
] as const;

const trustCards = [
  {
    icon: ShieldCheck,
    title: "Verified Professionals",
    body: "Every engineer and developer is manually reviewed before joining Black Tuf.",
  },
  {
    icon: Zap,
    title: "Fast Project Delivery",
    body: "Efficient workflows with real-time progress tracking and dedicated support.",
  },
  {
    icon: Lock,
    title: "Secure & Transparent",
    body: "Milestone-based project management with secure communication and file sharing.",
  },
  {
    icon: Globe2,
    title: "Modern Technology Stack",
    body: "Experts in Web Development, Mobile Apps, AI, IoT, PLC Programming, and Electrical Engineering.",
  },
  {
    icon: Headset,
    title: "24/7 Customer Support",
    body: "Our team is available to assist you throughout your project lifecycle.",
  },
  {
    icon: Rocket,
    title: "Ready to Build",
    body: "Start your project today and receive professional proposals from experienced experts.",
  },
];

function hasRealData(stats: PublicStats): boolean {
  return Object.values(stats).some((v) => v > 0);
}

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, suffix]);

  return (
    <span ref={ref} className="text-gradient text-4xl font-black tracking-tight sm:text-5xl">
      {0}
      {suffix}
    </span>
  );
}

export function TrustStats() {
  const { data, isLoading } = usePublicStats();

  const showCounters = !!data && hasRealData(data);

  return (
    <section className="relative border-y border-border/40 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 text-center">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {showCounters ? (
              <motion.div
                key="counters"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6"
              >
                {statMeta.map((s, i) => (
                  <motion.div
                    key={s.key}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="flex flex-col items-center gap-1.5 text-center"
                  >
                    <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <AnimatedCounter value={data?.[s.key] ?? 0} suffix={s.suffix} />
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="trust"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {trustCards.map((c, i) => (
                  <motion.div
                    key={c.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="glass-card group flex items-start gap-4 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:glass-ring"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform duration-300 group-hover:scale-110">
                      <c.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-bold leading-tight">{c.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {c.body}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
