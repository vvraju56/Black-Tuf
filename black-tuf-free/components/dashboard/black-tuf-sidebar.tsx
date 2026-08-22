"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/app/actions";
import { signOutFirebase } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useModuleFlags } from "@/hooks/use-modules";
import type { NavItem } from "@/components/dashboard/nav-config";
import {
  LayoutDashboard,
  FolderPlus,
  FolderKanban,
  FileText,
  ScrollText,
  MessagesSquare,
  Bell,
  FolderOpen,
  CalendarDays,
  Wallet,
  Receipt,
  Star,
  Bookmark,
  User,
  Settings,
  Compass,
  Send,
  Briefcase,
  Users,
  UserCog,
  BarChart3,
  ClipboardList,
  Layers,
  Newspaper,
  Rocket,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

const NAV_ICONS: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "folder-plus": FolderPlus,
  "folder-kanban": FolderKanban,
  "file-text": FileText,
  "scroll-text": ScrollText,
  "messages-square": MessagesSquare,
  bell: Bell,
  "folder-open": FolderOpen,
  "calendar-days": CalendarDays,
  wallet: Wallet,
  receipt: Receipt,
  star: Star,
  bookmark: Bookmark,
  user: User,
  settings: Settings,
  compass: Compass,
  sparkles: Sparkles,
  send: Send,
  briefcase: Briefcase,
  users: Users,
  "user-cog": UserCog,
  "bar-chart-3": BarChart3,
  "clipboard-list": ClipboardList,
  layers: Layers,
  newspaper: Newspaper,
  rocket: Rocket,
  "help-circle": HelpCircle,
};

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = NAV_ICONS[name] ?? LayoutDashboard;
  return <Icon className={cn("h-[18px] w-[18px]", className)} />;
}

interface SidebarProps {
  nav: { main: NavItem[]; secondary: NavItem[] };
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
  onClose?: () => void;
}

export function BlackTufSidebar({ nav, collapsed, onToggle, mobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();
  const { data: flags } = useModuleFlags();

  const visible = (items: NavItem[]) =>
    items.filter((item) => !item.module || flags?.[item.module] !== false);

  const handleSignOut = async () => {
    onClose?.();
    await signOutFirebase();
    await signOut();
    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/engineer" || href === "/admin") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const renderNavItem = (item: NavItem, index: number) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
        )}
        style={{ animationDelay: `${index * 30}ms` }}
      >
        {active && (
          <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
        )}
        <span className={cn("shrink-0 transition-colors", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
          <NavIcon name={item.icon} />
        </span>
        {!collapsed && <span className="truncate">{item.label}</span>}
        {active && !collapsed && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </Link>
    );
  };

  return (
    <nav
      className={cn(
        "flex h-full flex-col black-tuf-sidebar",
        mobile ? "w-72" : collapsed ? "w-[72px]" : "w-64",
        "sidebar-transition"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center border-b border-white/10 px-4 py-4", collapsed ? "justify-center" : "gap-3")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl black-tuf-gradient">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-white">
            Black Tuf
          </span>
        )}
        {!collapsed && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <ShieldCheck className="h-3 w-3" />
            {profile?.role ?? "portal"}
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto black-tuf-scrollbar px-3 py-4">
        <div className="space-y-1">
          {visible(nav.main).map((item, i) => renderNavItem(item, i))}
        </div>

        {visible(nav.secondary).length > 0 && (
          <div className="mt-6 space-y-1 border-t border-white/10 pt-4">
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Account
              </p>
            )}
            {visible(nav.secondary).map((item, i) => renderNavItem(item, i + nav.main.length))}
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div className="border-t border-white/10 px-3 py-3 space-y-1">
        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
            collapsed && "justify-center"
          )}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Help</span>}
        </Link>
        <button
          onClick={handleSignOut}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle - desktop only */}
      {!mobile && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-card text-muted-foreground shadow-lg transition-colors hover:bg-primary hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      )}
    </nav>
  );
}

export function MobileSidebar({
  open,
  onClose,
  nav,
  collapsed,
  onToggle,
}: SidebarProps & { open: boolean }) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden",
          open ? "block" : "hidden"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <BlackTufSidebar nav={nav} collapsed={collapsed} onToggle={onToggle} mobile onClose={onClose} />
      </div>
    </>
  );
}
