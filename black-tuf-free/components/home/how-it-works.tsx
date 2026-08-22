"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileSearch,
  Handshake,
  MessageSquareText,
  Rocket,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";

const steps = [
  {
    icon: FileSearch,
    step: "01",
    title: "Post your project",
    body: "Describe what you need — service, budget and timeline — in under five minutes with our guided wizard.",
  },
  {
    icon: Handshake,
    step: "02",
    title: "Receive proposals",
    body: "Vetted engineers submit priced proposals with portfolios, ratings and experience. Shortlist the best fit.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Award & sign",
    body: "Accept a proposal, agree milestones and sign a contract. Payments are protected at each milestone.",
  },
  {
    icon: MessageSquareText,
    step: "04",
    title: "Collaborate in real time",
    body: "Chat instantly, share files and sample work, and request on-site visits whenever the project needs them.",
  },
  {
    icon: CheckCircle2,
    step: "05",
    title: "Track & deliver",
    body: "Watch progress update live against agreed milestones until the engineer hands over the finished work.",
  },
  {
    icon: Wallet,
    step: "06",
    title: "Release payment & review",
    body: "Approve each milestone, leave feedback and build a trusted history for your next engagement.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="How Black Tuf Works"
          title="From brief to delivery in six steps"
          description="A structured workflow that removes ambiguity — so you always know what happens next."
        />

        <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="glass-card relative rounded-2xl p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan-500 text-primary-foreground shadow-lg shadow-primary/30">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="text-3xl font-black text-foreground/10">{s.step}</span>
              </div>
              <h3 className="font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-12 flex flex-col items-center justify-center gap-4 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-1.5 text-xs text-success">
            <Wallet className="h-3.5 w-3.5" />
            Payments released per milestone — never pay upfront for everything.
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="gradient" asChild>
              <Link href="/dashboard/projects/new">Start a Project</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/register?role=engineer">Join as Engineer</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
