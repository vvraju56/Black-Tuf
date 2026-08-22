"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/home/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvatarWithFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLogo, NavLinks, ServiceMegaMenuContent } from "@/components/layout/site-logo";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCounts } from "@/hooks/use-unread-counts";
import { signOut } from "@/app/actions";
import { signOutFirebase } from "@/lib/firebase/auth";
import { initials } from "@/lib/utils";

function dashboardHref(role?: string | null) {
  if (role === "admin") return "/admin";
  if (role === "engineer") return "/engineer";
  return "/dashboard";
}

export function SiteNav() {
  const { user, profile, loading } = useAuth();
  const { messages, notifications } = useUnreadCounts();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onHome = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled || !onHome
          ? "border-b border-border/60 bg-background/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <SiteLogo />
          <NavLinks className="hidden lg:flex" />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {loading ? (
            <>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-9 w-24" />
            </>
          ) : user && profile ? (
            <>
              <Link
                href={dashboardHref(profile.role)}
                className="hidden sm:inline-flex"
              >
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link href={`${dashboardHref(profile.role)}/messages`} aria-label="Messages">
                  <MessageSquare className="h-4.5 w-4.5" />
                  {messages > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[9px]">
                      {messages}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link href={`${dashboardHref(profile.role)}/notifications`} aria-label="Notifications">
                  <Bell className="h-4.5 w-4.5" />
                  {notifications > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[9px]">
                      {notifications}
                    </Badge>
                  )}
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-ring transition-shadow focus-visible:outline-none focus-visible:ring-2">
                    <AvatarWithFallback
                      src={profile.avatar_url}
                      name={profile.full_name}
                      email={profile.email}
                      size="sm"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm font-medium">{profile.full_name || initials(profile.email)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(dashboardHref(profile.role))}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`${dashboardHref(profile.role)}/profile`)}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`${dashboardHref(profile.role)}/settings`)}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await signOutFirebase(); await signOut(); }}>
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Join Black Tuf</Link>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[300px] flex-col overflow-y-auto glass-strong p-5 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <SiteLogo />
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Services
              </p>
              <ServiceMegaMenuContent onNavigate={() => setMobileOpen(false)} />
              <div className="my-4 h-px bg-border" />
              <div className="flex flex-col gap-1">
                <NavLinks onNavigate={() => setMobileOpen(false)} className="flex-col items-stretch" />
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                >
                  Become an Engineer
                </Link>
              </div>
              <div className="mt-auto pt-6">
                {user && profile ? (
                  <Button
                    className="w-full"
                    variant="gradient"
                    onClick={() => {
                      router.push(dashboardHref(profile.role));
                      setMobileOpen(false);
                    }}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant="gradient"
                    asChild
                    onClick={() => setMobileOpen(false)}
                  >
                    <Link href="/register">Create Free Account</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export function useNavRedirect() {
  const router = useRouter();
  return (href: string) => router.push(href);
}
