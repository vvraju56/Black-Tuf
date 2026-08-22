import type { ModuleKey } from "@/utils/modules";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  module?: ModuleKey;
}

export interface NavSection {
  main: NavItem[];
  secondary: NavItem[];
}

/** Client portal — per spec: Dashboard, Post Project, My Projects,
 * Messages, Payments, Site Visits, Files, Feedback, Profile, Settings. */
export const clientNav: NavSection = {
  main: [
    { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
    { href: "/dashboard/projects/new", label: "Post Project", icon: "folder-plus", module: "marketplace" },
    { href: "/dashboard/messages", label: "Messages", icon: "messages-square", module: "chat" },
    { href: "/dashboard/payments", label: "Payments", icon: "wallet", module: "payments" },
    { href: "/dashboard/visits", label: "Site Visits", icon: "calendar-days", module: "site_visits" },
    { href: "/dashboard/feedback", label: "Feedback", icon: "star", module: "feedback" },
  ],
  secondary: [
    { href: "/dashboard/profile", label: "Profile", icon: "user" },
    { href: "/dashboard/settings", label: "Settings", icon: "settings" },
  ],
};

/** Engineer portal (Freelancer menu) — per spec: Dashboard, Recommended
 * Projects, Global Projects, My Proposals, Assigned Projects, Messages,
 * Earnings, Portfolio, Reviews, Profile, Settings. */
export const engineerNav: NavSection = {
  main: [
    { href: "/engineer", label: "Dashboard", icon: "layout-dashboard" },
    { href: "/engineer/recommended", label: "Recommended Projects", icon: "sparkles", module: "marketplace" },
    { href: "/engineer/projects", label: "Global Projects", icon: "compass", module: "marketplace" },
    { href: "/engineer/proposals", label: "My Proposals", icon: "send", module: "marketplace" },
    { href: "/engineer/assigned", label: "Assigned Projects", icon: "briefcase", module: "marketplace" },
    { href: "/engineer/messages", label: "Messages", icon: "messages-square", module: "chat" },
    { href: "/engineer/payments", label: "Earnings", icon: "wallet", module: "payments" },
    { href: "/engineer/portfolio", label: "Portfolio", icon: "folder-open", module: "portfolio" },
    { href: "/engineer/reviews", label: "Reviews", icon: "star", module: "reviews" },
  ],
  secondary: [
    { href: "/engineer/settings", label: "Skills & Availability", icon: "settings" },
  ],
};

/** Admin portal — per spec: Dashboard, Users, Clients, Freelancers,
 * Engineers, Projects, Services, Categories, Analytics, Settings. */
export const adminNav: NavSection = {
  main: [
    { href: "/admin", label: "Dashboard", icon: "layout-dashboard" },
    { href: "/admin/users", label: "Users", icon: "users" },
    { href: "/admin/clients", label: "Clients", icon: "users" },
    { href: "/admin/engineers", label: "Engineers", icon: "user-cog", module: "engineers" },
    { href: "/admin/projects", label: "Projects", icon: "folder-kanban", module: "marketplace" },
    { href: "/admin/services", label: "Services", icon: "layers", module: "services" },
    { href: "/admin/categories", label: "Categories", icon: "clipboard-list", module: "services" },
    { href: "/admin/analytics", label: "Analytics", icon: "bar-chart-3", module: "analytics" },
  ],
  secondary: [
    { href: "/admin/settings", label: "Settings", icon: "settings" },
  ],
};

export const engineerCta: NavItem = { href: "/engineer/projects", label: "Find Work", icon: "rocket", module: "marketplace" };
