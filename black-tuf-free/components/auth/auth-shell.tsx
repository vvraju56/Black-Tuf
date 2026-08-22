"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/home/aurora-background";
import { SiteLogo } from "@/components/layout/site-logo";

export function AuthShell({
  backHref = "/",
  backLabel = "Back to Black Tuf",
  children,
  footer,
}: {
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <AuroraBackground />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <SiteLogo />
          <Button variant="ghost" size="sm" asChild>
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {backLabel}
            </Link>
          </Button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-3xl p-7 shadow-2xl shadow-black/30 sm:p-8"
        >
          {children}
        </motion.div>
        {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
      </div>
    </main>
  );
}
