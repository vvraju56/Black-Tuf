export type ModuleKey =
  | "portfolio"
  | "blog"
  | "site_visits"
  | "payments"
  | "reviews"
  | "chat"
  | "notifications"
  | "ai"
  | "iot"
  | "plc"
  | "services"
  | "marketplace"
  | "engineers"
  | "analytics"
  | "cms"
  | "files"
  | "feedback"
  | "contracts"
  | "invoices"
  | "roles"
  | "leads"
  | "storage"
  | "profile";

export interface ModuleDef {
  key: ModuleKey;
  label: string;
  description: string;
  icon: string;
  defaultEnabled: boolean;
}

export const MODULES: ModuleDef[] = [
  { key: "services", label: "Services", description: "Service catalogue and landing sections.", icon: "layers", defaultEnabled: true },
  { key: "marketplace", label: "Marketplace", description: "Posting, browsing and matching projects, proposals and assigned work.", icon: "folder-kanban", defaultEnabled: true },
  { key: "engineers", label: "Engineers", description: "Engineer directory and discovery.", icon: "users", defaultEnabled: true },
  { key: "portfolio", label: "Portfolio", description: "Engineer portfolios and public portfolio pages.", icon: "folder-open", defaultEnabled: true },
  { key: "blog", label: "Blog", description: "Blog articles and CMS content.", icon: "newspaper", defaultEnabled: true },
  { key: "site_visits", label: "Site Visits", description: "On-site visit scheduling and tracking.", icon: "calendar-days", defaultEnabled: true },
  { key: "payments", label: "Payments", description: "Payments, earnings and invoices.", icon: "wallet", defaultEnabled: true },
  { key: "reviews", label: "Reviews", description: "Engineer reviews and testimonials.", icon: "star", defaultEnabled: true },
  { key: "chat", label: "Chat", description: "Messages between clients and engineers.", icon: "messages-square", defaultEnabled: true },
  { key: "notifications", label: "Notifications", description: "In-app notifications.", icon: "bell", defaultEnabled: true },
  { key: "ai", label: "AI Assistant", description: "AI assistant features.", icon: "bot", defaultEnabled: true },
  { key: "iot", label: "IoT Services", description: "IoT automation services.", icon: "activity", defaultEnabled: true },
  { key: "plc", label: "PLC Services", description: "PLC programming services.", icon: "cpu", defaultEnabled: true },
  { key: "files", label: "Files", description: "Project file storage and sharing.", icon: "file-archive", defaultEnabled: true },
  { key: "feedback", label: "Feedback", description: "Client feedback submissions.", icon: "star", defaultEnabled: true },
  { key: "contracts", label: "Contracts", description: "Project contracts.", icon: "scroll-text", defaultEnabled: true },
  { key: "invoices", label: "Invoices", description: "Invoice generation and tracking.", icon: "receipt", defaultEnabled: true },
  { key: "analytics", label: "Analytics", description: "Admin analytics dashboards.", icon: "bar-chart-3", defaultEnabled: true },
  { key: "cms", label: "CMS", description: "Content management for the site.", icon: "newspaper", defaultEnabled: true },
  { key: "roles", label: "Roles", description: "Role and permission management.", icon: "gavel", defaultEnabled: true },
  { key: "leads", label: "Leads", description: "Quote requests, bookings and contact messages.", icon: "inbox", defaultEnabled: true },
  { key: "storage", label: "Storage", description: "File bucket management.", icon: "database", defaultEnabled: true },
  { key: "profile", label: "Profile", description: "Unified professional marketplace profile.", icon: "user", defaultEnabled: true },
];

export type ModuleFlags = Record<ModuleKey, boolean>;

export const DEFAULT_MODULE_FLAGS: ModuleFlags = MODULES.reduce((acc, m) => {
  acc[m.key] = m.defaultEnabled;
  return acc;
}, {} as ModuleFlags);

const SLUG_TO_MODULE: Record<string, ModuleKey> = {
  web: "services",
  mobile: "services",
  uiux: "services",
  game: "services",
  ai: "ai",
  iot: "iot",
  plc: "plc",
  electrical: "services",
};

/** Which module gates a given service slug (DB service or static id). */
export function serviceModuleForSlug(slug: string): ModuleKey {
  return SLUG_TO_MODULE[slug] ?? "services";
}

/** Route prefix → module, used to gate dashboard/engineer/admin routes. */
export const ROUTE_MODULES: { prefix: string; module: ModuleKey }[] = [
  { prefix: "/dashboard/projects", module: "marketplace" },
  { prefix: "/dashboard/proposals", module: "marketplace" },
  { prefix: "/dashboard/engineers", module: "engineers" },
  { prefix: "/dashboard/visits", module: "site_visits" },
  { prefix: "/dashboard/payments", module: "payments" },
  { prefix: "/dashboard/invoices", module: "invoices" },
  { prefix: "/dashboard/messages", module: "chat" },
  { prefix: "/dashboard/notifications", module: "notifications" },
  { prefix: "/dashboard/files", module: "files" },
  { prefix: "/dashboard/feedback", module: "feedback" },
  { prefix: "/dashboard/contracts", module: "contracts" },
  { prefix: "/engineer/projects", module: "marketplace" },
  { prefix: "/engineer/recommended", module: "marketplace" },
  { prefix: "/engineer/proposals", module: "marketplace" },
  { prefix: "/engineer/assigned", module: "marketplace" },
  { prefix: "/engineer/portfolio", module: "portfolio" },
  { prefix: "/engineer/reviews", module: "reviews" },
  { prefix: "/engineer/messages", module: "chat" },
  { prefix: "/engineer/payments", module: "payments" },
  { prefix: "/admin/projects", module: "marketplace" },
  { prefix: "/admin/proposals", module: "marketplace" },
  { prefix: "/admin/engineers", module: "engineers" },
  { prefix: "/admin/visits", module: "site_visits" },
  { prefix: "/admin/payments", module: "payments" },
  { prefix: "/admin/invoices", module: "invoices" },
  { prefix: "/admin/messages", module: "chat" },
  { prefix: "/admin/notifications", module: "notifications" },
  { prefix: "/admin/files", module: "files" },
  { prefix: "/admin/feedback", module: "feedback" },
  { prefix: "/admin/contracts", module: "contracts" },
  { prefix: "/admin/analytics", module: "analytics" },
  { prefix: "/admin/cms", module: "cms" },
  { prefix: "/admin/roles", module: "roles" },
  { prefix: "/admin/leads", module: "leads" },
  { prefix: "/admin/storage", module: "storage" },
  { prefix: "/profile", module: "profile" },
];

/** Homepage sections gated by module. */
export const HOMEPAGE_MODULES: { section: string; module: ModuleKey }[] = [
  { section: "PopularServices", module: "services" },
  { section: "FeaturedProjects", module: "marketplace" },
  { section: "TopEngineers", module: "engineers" },
  { section: "Testimonials", module: "reviews" },
  { section: "HowItWorks", module: "marketplace" },
];
