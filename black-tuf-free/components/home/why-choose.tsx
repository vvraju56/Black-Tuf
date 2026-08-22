"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Headset,
  LineChart,
  Lock,
  ShieldCheck,
  Tag,
  Users,
} from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";

const features = [
  {
    icon: Users,
    title: "Verified Professionals",
    body: "Every engineer is profile-checked with verifiable skills, certificates and a real portfolio before joining.",
  },
  {
    icon: LineChart,
    title: "Real-time Project Tracking",
    body: "Live progress updates against agreed milestones keep you informed at every stage of delivery.",
  },
  {
    icon: Lock,
    title: "Secure Communication",
    body: "Everything happens inside the Black Tuf workspace — protected chats, file sharing and a clear audit trail.",
  },
  {
    icon: Tag,
    title: "Transparent Pricing",
    body: "Fixed quotes with milestone-linked releases. Know exactly what you pay before work begins.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Assurance",
    body: "Milestone gates and post-completion feedback keep engineers accountable for every deliverable.",
  },
  {
    icon: Headset,
    title: "Dedicated Support",
    body: "A real team behind every project — from scoping help to mediation if anything needs resolving.",
  },
  {
    icon: Building2,
    title: "Enterprise Solutions",
    body: "From embedded systems to factory automation, we structure large-scale engagements with SLAs.",
  },
];

export function WhyChoose() {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Why Choose Black Tuf"
          title="Built to make hiring effortless"
          description="The trust, tooling and transparency you'd expect from a managed engineering team."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.4) }}
              className={`glass-card group flex gap-4 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:glass-ring ${
                i === 6 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform duration-300 group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
