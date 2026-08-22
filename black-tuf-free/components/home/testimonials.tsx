"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageSquareQuote, Quote, Star } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { AvatarWithFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/client";
import type { Feedback } from "@/types";

async function getPublicTestimonials(): Promise<Feedback[]> {
  const { data, error } = await supabase()
    .from("feedback")
    .select(
      "*, client:client_id(id, full_name, email, avatar_url), project:project_id(id, name, service)"
    )
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) throw error;
  return (data ?? []) as unknown as Feedback[];
}

export function Testimonials() {
  const { data, isLoading } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: getPublicTestimonials,
    staleTime: 60_000,
  });

  const items = data ?? [];
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length]);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title="What clients say"
          description="Verified feedback left by clients after project completion."
        />
        <div className="glass-card mx-auto max-w-2xl rounded-3xl p-8">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-5 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-5/6" />
          <div className="mt-6 flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title="What clients say"
          description="Verified feedback left by clients after project completion."
        />

        {items.length === 0 ? (
          <EmptyState
            icon={MessageSquareQuote}
            title="No feedback yet"
            description="Client reviews appear here once the first projects are completed."
          />
        ) : (
          <div className="relative mx-auto max-w-3xl">
            <div className="glass-card relative overflow-hidden rounded-3xl p-8 sm:p-10">
              <Quote className="absolute right-8 top-8 h-12 w-12 text-primary/10" />
              <AnimatePresence mode="wait">
                <motion.figure
                  key={items[index].id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`h-5 w-5 ${s < items[index].rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  <blockquote className="min-h-28 text-lg font-medium leading-relaxed text-foreground/90">
                    “{items[index].comment}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-4 border-t border-border/60 pt-5">
                    <AvatarWithFallback
                      src={items[index].client?.avatar_url}
                      name={items[index].client?.full_name}
                      email={items[index].client?.email}
                    />
                    <div>
                      <p className="font-bold">{items[index].client?.full_name ?? "Client"}</p>
                      <p className="text-sm text-muted-foreground">
                        {items[index].project?.service ?? "Client"} project · Completed
                      </p>
                    </div>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => setIndex((index - 1 + items.length) % items.length)}
                className="glass-card flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5">
                {items.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setIndex((index + 1) % items.length)}
                className="glass-card flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
