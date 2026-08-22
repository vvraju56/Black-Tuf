"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useActiveServices } from "@/hooks/use-services";
import { SectionHeading } from "@/components/site/section-heading";

export function PopularServices() {
  const { services } = useActiveServices();
  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Popular Services"
          title="Eight specialist disciplines"
          description="From software to industrial automation — one accountable team behind every delivery."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.4) }}
            >
              <Link
                href={`/services/${s.id}`}
                className="glass-card group relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:glass-ring"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-cyan-500/20 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                  {s.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Explore
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
