"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Headset, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl p-10 sm:p-14"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="animate-aurora pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />

        <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to start your project?
            </h2>
            <p className="mt-3 text-base text-white/85">
              Post a project in minutes and get real proposals from vetted engineers.
              Or talk to our team about scoping something larger.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" className="bg-white text-indigo-700 shadow-lg shadow-black/20 hover:bg-white/90" asChild>
              <Link href="/dashboard/projects/new">
                <Rocket className="h-4 w-4" />
                Post a Project
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
              asChild
            >
              <Link href="/contact">
                <Headset className="h-4 w-4" />
                Contact Sales
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
