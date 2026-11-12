import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  Bookmark,
  CheckCircle2,
  Download,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

import { GlassCard } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Download Android App",
  description:
    "Download the Makeable Jobs Android app. One search across 10,000+ jobs indexed daily from 6+ sources with saved jobs, alerts and AI resume tools.",
};

const FEATURES = [
  {
    title: "10,000+ jobs daily",
    description:
      "Fresh listings indexed every day from LinkedIn, Indeed, Naukri, Internshala, Wellfound and company career pages.",
    icon: Search,
  },
  {
    title: "Save & track jobs",
    description:
      "Bookmark favorites and track your applications from a single dashboard.",
    icon: Bookmark,
  },
  {
    title: "Job alerts",
    description:
      "Get notified the moment a role matching your search and filters goes live.",
    icon: Bell,
  },
  {
    title: "AI resume tools",
    description:
      "ATS score, cover letter, skill gap analysis and interview prep built right in.",
    icon: Sparkles,
  },
];

const STEPS = [
  {
    title: "Download the APK",
    description:
      "Tap the download button below to save the installer file to your phone.",
  },
  {
    title: "Allow installs from this source",
    description:
      "On Android, open Settings → Security and enable “Install unknown apps” for your browser or file manager.",
  },
  {
    title: "Install & sign in",
    description:
      "Open the downloaded file, tap Install, then sign in with your Makeable Jobs account.",
  },
];

export default function DownloadPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="bg-hero-glow pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
            Android App
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Take Makeable Jobs{" "}
            <span className="text-brand-gradient">on the go</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Search thousands of jobs, save favorites, set alerts and run AI
            resume tools — all from your Android phone.
          </p>
        </div>

        <div className="mx-auto mb-12 max-w-md">
          <GlassCard className="p-8 text-center">
            <span className="btn-brand-gradient mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl shadow-glow">
              <Smartphone className="h-10 w-10" />
            </span>
            <h2 className="text-xl font-bold">Makeable Jobs for Android</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Version 1.0.0 · Free · No ads
            </p>
            <a
              href="/makeable-jobs.apk"
              download
              className="btn-brand-gradient mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
            >
              <Download className="h-4 w-4" />
              Download APK (74 MB)
            </a>
            <p className="mt-3 text-xs text-muted-foreground">
              Works on Android 6.0 and above
            </p>
          </GlassCard>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <GlassCard key={feature.title} className="card-hover p-6">
              <span className="btn-brand-gradient mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-glow">
                <feature.icon className="h-6 w-6" />
              </span>
              <h3 className="font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>

        <div className="mt-12">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            How to install
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <GlassCard key={step.title} className="border-dashed p-6">
                <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-accent">
                  {index + 1}
                </span>
                <h3 className="font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="mt-12 flex items-start gap-3 rounded-2xl border border-dashed border-border bg-surface/40 p-5 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <p>
            <span className="font-semibold text-foreground">
              Is it safe?
            </span>{" "}
            Yes. This APK is built directly from our open source repository. It
            only talks to the Makeable Jobs API and uses your existing account
            — it contains no ads and no trackers.
          </p>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-accent"
          >
            <CheckCircle2 className="h-4 w-4" />
            Back to the website
          </Link>
        </div>
      </div>
    </div>
  );
}