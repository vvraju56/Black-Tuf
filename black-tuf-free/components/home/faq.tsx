"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";

const faqs = [
  {
    q: "How does Black Tuf protect my payment?",
    a: "Payments are released in milestones as your project progresses. Both parties agree the milestones upfront in the contract, and each is released only when the agreed deliverable is complete.",
  },
  {
    q: "How are engineers vetted?",
    a: "Every engineer completes a profile with verifiable skills, experience, certificates and a portfolio. Clients can also review ratings and feedback left after real projects before hiring.",
  },
  {
    q: "Can I get on-site work through Black Tuf?",
    a: "Yes. When you post a project you can choose the On-Site type, add your address and request site visits. Admin schedules the visit and an engineer is assigned to confirm it.",
  },
  {
    q: "What happens after I accept a proposal?",
    a: "A contract is created with the agreed price, terms and milestones. You can chat with the engineer, share files and track progress in real time until handover.",
  },
  {
    q: "Do I pay anything to browse or post?",
    a: "Creating an account and posting a project is free. You only commit funds when you accept a proposal and milestones are agreed.",
  },
  {
    q: "What if the delivered work isn't what I expected?",
    a: "Feedback is captured at completion, and milestone gates give you the chance to review before each release. Our support team can mediate any dispute through the project workspace.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Everything you need to know before you start your first Black Tuf project."
      />

      <div className="space-y-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className={`glass-card overflow-hidden rounded-2xl transition-colors ${isOpen ? "glass-ring" : ""}`}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-semibold">{f.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Button variant="secondary" asChild>
          <Link href="/faq">
            <HelpCircle className="h-4 w-4" />
            Read the full FAQ
          </Link>
        </Button>
      </div>
    </section>
  );
}
