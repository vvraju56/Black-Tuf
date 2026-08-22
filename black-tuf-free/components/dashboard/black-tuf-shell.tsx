"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardTitleProvider } from "@/components/dashboard/dashboard-context";
import { BlackTufSidebar, MobileSidebar } from "@/components/dashboard/black-tuf-sidebar";
import { BlackTufHeader } from "@/components/dashboard/black-tuf-header";
import { BlackTufRightSidebar } from "@/components/dashboard/black-tuf-right-sidebar";
import { NotificationPermissionPrompt } from "@/components/dashboard/notification-permission-prompt";
import { ModuleRouteGuard } from "@/components/dashboard/module-route-guard";
import type { NavItem } from "@/components/dashboard/nav-config";
import { cn } from "@/lib/utils";

export function BlackTufDashboardShell({
  children,
  nav,
  showRightSidebar = true,
}: {
  children: React.ReactNode;
  nav: { main: NavItem[]; secondary: NavItem[] };
  showRightSidebar?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("black-tuf-theme");
    if (saved) {
      setDark(saved === "dark");
    }
    const savedCollapse = localStorage.getItem("black-tuf-sidebar-collapsed");
    if (savedCollapse) {
      setSidebarCollapsed(savedCollapse === "true");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("black-tuf-theme", dark ? "dark" : "light");
  }, [dark]);

  const handleThemeToggle = useCallback(() => {
    setDark((prev) => !prev);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("black-tuf-sidebar-collapsed", String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <DashboardTitleProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-40 sidebar-transition",
              sidebarCollapsed ? "w-[72px]" : "w-64"
            )}
          >
            <BlackTufSidebar
              nav={nav}
              collapsed={sidebarCollapsed}
              onToggle={handleSidebarToggle}
            />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          nav={nav}
          collapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
        />

        {/* Main content area */}
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col sidebar-transition",
            "lg:ml-64",
            sidebarCollapsed && "lg:ml-[72px]"
          )}
        >
          <BlackTufHeader
            onMenuOpen={() => setSidebarOpen(true)}
            onThemeToggle={handleThemeToggle}
            dark={dark}
          />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto black-tuf-scrollbar">
              <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                <ModuleRouteGuard>{children}</ModuleRouteGuard>
              </div>
            </main>
            {showRightSidebar && <BlackTufRightSidebar />}
          </div>
        </div>
      </div>
      <NotificationPermissionPrompt />
    </DashboardTitleProvider>
  );
}
