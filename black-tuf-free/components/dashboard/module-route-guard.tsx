"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useModuleFlags } from "@/hooks/use-modules";
import { ROUTE_MODULES } from "@/utils/modules";
import { useAuth } from "@/hooks/use-auth";

function areaHome(role?: string | null): string {
  if (role === "admin") return "/admin";
  if (role === "engineer") return "/engineer";
  return "/dashboard";
}

/** Redirects to the area home when the current route's module is disabled. */
export function ModuleRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading } = useAuth();
  const { data: flags } = useModuleFlags();

  useEffect(() => {
    if (loading || !flags) return;
    const match = ROUTE_MODULES.find(
      (r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/")
    );
    if (match && flags[match.module] === false) {
      router.replace(areaHome(profile?.role));
    }
  }, [pathname, flags, loading, profile?.role, router]);

  return <>{children}</>;
}
