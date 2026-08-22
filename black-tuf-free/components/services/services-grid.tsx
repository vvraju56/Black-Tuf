"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Compass } from "lucide-react";
import { useActiveServices } from "@/hooks/use-services";
import { Button } from "@/components/ui/button";

export function ServicesGrid() {
  const { services } = useActiveServices();
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
          >
            <Link
              href={`/services/${s.id}`}
              className="glass-card group flex h-full flex-col rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:glass-ring"
            >
              <div className="mb-4 flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan-500 text-primary-foreground shadow-lg shadow-primary/30 transition-transform group-hover:scale-110">
                  <s.icon className="h-6 w-6" />
                </span>
                <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                  {s.short}
                </span>
              </div>
              <h2 className="text-xl font-bold">{s.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {s.description}
              </p>
              <div className="mt-5 flex items-center gap-2 border-t border-border/60 pt-4">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Explore service <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="glass-card mx-auto mt-12 max-w-3xl rounded-3xl p-8 text-center"
      >
        <Compass className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-3 text-2xl font-bold">Not sure which service fits?</h2>
        <p className="mt-3 text-muted-foreground">
          Book a free consultation and our engineers will help scope your project.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button variant="gradient" asChild>
            <Link href="/book-consultation">Book a consultation</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/contact">
              Talk to us <Check className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </>
  );
}
