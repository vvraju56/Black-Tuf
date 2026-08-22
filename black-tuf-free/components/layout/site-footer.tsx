"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteLogo } from "@/components/layout/site-logo";
import { useActiveServices } from "@/hooks/use-services";
import { useSubscribeNewsletter } from "@/hooks/use-newsletter";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const subscribe = useSubscribeNewsletter();
  const { services } = useActiveServices();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribe.mutate(email.trim(), {
      onSuccess: () => setEmail(""),
    });
  };

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border/60">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 border-b border-border/60 py-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SiteLogo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Engineering Digital &amp; Industrial Solutions — a marketplace
              connecting ambitious clients with vetted engineers across software
              and industrial automation.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Bengaluru, India · Remote-friendly
            </div>
            <div className="mt-5 flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild aria-label="GitHub">
                <Link href="https://github.com" target="_blank"><GithubIcon /></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild aria-label="LinkedIn">
                <Link href="https://linkedin.com" target="_blank"><LinkedinIcon /></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild aria-label="Email">
                <Link href="mailto:hello@black-tuf.dev"><Mail className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h4 className="mb-4 text-sm font-semibold">Services</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {services.slice(0, 5).map((s) => (
                  <li key={s.id}>
                    <Link href={`/services/${s.id}`} className="transition-colors hover:text-foreground">
                      {s.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/services" className="text-primary hover:underline">
                    View all services
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Resources</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/projects" className="transition-colors hover:text-foreground">Browse Projects</Link></li>
                <li><Link href="/engineers" className="transition-colors hover:text-foreground">Find Engineers</Link></li>
                <li><Link href="/register" className="transition-colors hover:text-foreground">Post a Project</Link></li>
                <li><Link href="/register" className="transition-colors hover:text-foreground">Become an Engineer</Link></li>
                <li><Link href="/#how-it-works" className="transition-colors hover:text-foreground">How it Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Support</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/about" className="transition-colors hover:text-foreground">About</Link></li>
                <li><Link href="/faq" className="transition-colors hover:text-foreground">FAQ</Link></li>
                <li><Link href="/contact" className="transition-colors hover:text-foreground">Contact</Link></li>
                <li><Link href="/privacy" className="transition-colors hover:text-foreground">Privacy</Link></li>
                <li><Link href="/terms" className="transition-colors hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid gap-8 py-12 lg:grid-cols-2">
          <div>
            <h4 className="text-lg font-bold">Get the Black Tuf newsletter</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Engineering trends, marketplace updates and new project drops. No spam, unsubscribe anytime.
            </p>
          </div>
          <form onSubmit={onSubmit} className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-11 pl-10"
              />
            </div>
            <Button type="submit" className="h-11" disabled={subscribe.isPending}>
              {subscribe.isPending ? "Subscribing…" : <><span>Subscribe</span><ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Black Tuf. Engineering Digital &amp; Industrial Solutions.</span>
          <span>Built with Next.js · Supabase · Tailwind</span>
        </div>
      </div>
    </footer>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}
