"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { SERVICES } from "@/utils/constants";

export function FeaturedServices() {
  const highlights = [
    "Fixed-price & milestone quotes",
    "Code in escrow on request",
    "SLA-backed timelines",
  ];

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Services"
          title="Featured service lines"
          description="Every engagement is scoped, quoted and delivered through a transparent Black Tuf workflow."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.slice(0, 4).map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="glass-card group flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:glass-ring"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan-500 text-primary-foreground shadow-lg shadow-primary/30">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {s.technologies.slice(0, 3).map((t) => (
                  <span key={t} className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
              <Link
                href={`/services/${s.id}`}
                className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Explore {s.short} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="glass-card mt-8 flex flex-col items-center justify-between gap-5 rounded-2xl p-6 sm:flex-row"
        >
          <div>
            <h3 className="text-lg font-bold">Need something from every discipline?</h3>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              {highlights.map((h) => (
                <li key={h} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" /> {h}
                </li>
              ))}
            </ul>
          </div>
          <Button variant="gradient" asChild>
            <Link href="/register">
              <FolderKanban className="h-4 w-4" />
              Request a Project
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
