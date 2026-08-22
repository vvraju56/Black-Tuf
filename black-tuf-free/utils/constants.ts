import {
  Globe,
  Smartphone,
  Palette,
  Gamepad2,
  Brain,
  Activity,
  Cpu,
  Zap,
} from "lucide-react";
import type { ServiceId } from "@/types";

export interface ServiceMeta {
  id: ServiceId;
  title: string;
  short: string;
  description: string;
  technologies: string[];
  icon: React.ElementType;
}

export const SERVICES: ServiceMeta[] = [
  {
    id: "web",
    title: "Web Development",
    short: "Web Dev",
    description: "High-performance, scalable web applications and portals built with modern frameworks and cloud-native architecture.",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js"],
    icon: Globe,
  },
  {
    id: "mobile",
    title: "Mobile Application Development",
    short: "Mobile",
    description: "Native and cross-platform mobile apps for iOS and Android with seamless Supabase backend integration.",
    technologies: ["React Native", "iOS", "Android", "Firebase", "Supabase"],
    icon: Smartphone,
  },
  {
    id: "uiux",
    title: "UI/UX & Graphic Design",
    short: "Design",
    description: "Pixel-perfect interfaces, branding, and user research that turn complex products into intuitive experiences.",
    technologies: ["Figma", "Adobe XD", "Sketch", "Framer", "Illustrator"],
    icon: Palette,
  },
  {
    id: "game",
    title: "Game Development",
    short: "Games",
    description: "Immersive 2D and 3D games and interactive experiences for mobile, web, and desktop platforms.",
    technologies: ["Unity", "Unreal Engine", "C#", "Blender", "Godot"],
    icon: Gamepad2,
  },
  {
    id: "ai",
    title: "AI Development",
    short: "AI",
    description: "Custom AI agents, machine learning pipelines, and generative AI integrations tailored to your domain.",
    technologies: ["Python", "PyTorch", "TensorFlow", "OpenAI", "LangChain"],
    icon: Brain,
  },
  {
    id: "iot",
    title: "IoT Automation",
    short: "IoT",
    description: "Connected device ecosystems, real-time monitoring dashboards, and automated edge-to-cloud pipelines.",
    technologies: ["ESP32", "MQTT", "Edge IoT", "Grafana", "InfluxDB"],
    icon: Activity,
  },
  {
    id: "plc",
    title: "PLC Programming",
    short: "PLC",
    description: "Industrial automation logic for PLCs across Siemens, Allen Bradley, and Mitsubishi platforms.",
    technologies: ["TIA Portal", "Studio 5000", "GX Works", " ladder logic"],
    icon: Cpu,
  },
  {
    id: "electrical",
    title: "Electrical Works",
    short: "Electrical",
    description: "Design, installation, and commissioning of LV panels, wiring, and power distribution systems.",
    technologies: ["AutoCAD E", "ETAP", "High voltage", "LV panels", "SCADA"],
    icon: Zap,
  },
];

export const SERVICE_BY_ID = Object.fromEntries(SERVICES.map((s) => [s.id, s])) as Record<
  ServiceId,
  ServiceMeta
>;

export interface CurrencyMeta {
  code: string;
  label: string;
  symbol: string;
  flag: string;
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: "USD", label: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "INR", label: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "EUR", label: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", label: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "AED", label: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "CNY", label: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
];

export const CURRENCY_BY_ID = Object.fromEntries(CURRENCIES.map((c) => [c.code, c])) as Record<
  string,
  CurrencyMeta
>;

export interface CountryMeta {
  code: string;
  name: string;
  flag: string;
  currencyCode: string;
  currencySymbol: string;
}

export const COUNTRIES: CountryMeta[] = [
  { code: "IN", name: "India", flag: "🇮🇳", currencyCode: "INR", currencySymbol: "₹" },
  { code: "US", name: "United States", flag: "🇺🇸", currencyCode: "USD", currencySymbol: "$" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currencyCode: "GBP", currencySymbol: "£" },
  { code: "DE", name: "Germany", flag: "🇩🇪", currencyCode: "EUR", currencySymbol: "€" },
  { code: "FR", name: "France", flag: "🇫🇷", currencyCode: "EUR", currencySymbol: "€" },
  { code: "IT", name: "Italy", flag: "🇮🇹", currencyCode: "EUR", currencySymbol: "€" },
  { code: "ES", name: "Spain", flag: "🇪🇸", currencyCode: "EUR", currencySymbol: "€" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", currencyCode: "EUR", currencySymbol: "€" },
  { code: "CA", name: "Canada", flag: "🇨🇦", currencyCode: "CAD", currencySymbol: "C$" },
  { code: "AU", name: "Australia", flag: "🇦🇺", currencyCode: "AUD", currencySymbol: "A$" },
  { code: "JP", name: "Japan", flag: "🇯🇵", currencyCode: "JPY", currencySymbol: "¥" },
  { code: "CN", name: "China", flag: "🇨🇳", currencyCode: "CNY", currencySymbol: "¥" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", currencyCode: "SGD", currencySymbol: "S$" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", currencyCode: "AED", currencySymbol: "د.إ" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", currencyCode: "SAR", currencySymbol: "﷼" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", currencyCode: "MYR", currencySymbol: "RM" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", currencyCode: "LKR", currencySymbol: "Rs" },
  { code: "NP", name: "Nepal", flag: "🇳🇵", currencyCode: "NPR", currencySymbol: "Rs" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", currencyCode: "BDT", currencySymbol: "৳" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", currencyCode: "PKR", currencySymbol: "Rs" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", currencyCode: "KRW", currencySymbol: "₩" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", currencyCode: "THB", currencySymbol: "฿" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", currencyCode: "PHP", currencySymbol: "₱" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", currencyCode: "IDR", currencySymbol: "Rp" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", currencyCode: "VND", currencySymbol: "₫" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", currencyCode: "NZD", currencySymbol: "NZ$" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", currencyCode: "EUR", currencySymbol: "€" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", currencyCode: "CHF", currencySymbol: "CHF" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", currencyCode: "SEK", currencySymbol: "kr" },
  { code: "NO", name: "Norway", flag: "🇳🇴", currencyCode: "NOK", currencySymbol: "kr" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", currencyCode: "DKK", currencySymbol: "kr" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", currencyCode: "BRL", currencySymbol: "R$" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", currencyCode: "MXN", currencySymbol: "$" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", currencyCode: "ZAR", currencySymbol: "R" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", currencyCode: "EGP", currencySymbol: "£" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", currencyCode: "NGN", currencySymbol: "₦" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", currencyCode: "KES", currencySymbol: "KSh" },
  { code: "IL", name: "Israel", flag: "🇮🇱", currencyCode: "ILS", currencySymbol: "₪" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", currencyCode: "TRY", currencySymbol: "₺" },
  { code: "PL", name: "Poland", flag: "🇵🇱", currencyCode: "PLN", currencySymbol: "zł" },
];

export const COUNTRY_BY_CODE = Object.fromEntries(COUNTRIES.map((c) => [c.code, c])) as Record<
  string,
  CountryMeta
>;

/** Maps a timezone (e.g. "Asia/Kolkata") to a country code (e.g. "IN"). */
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Asia/Dubai": "AE",
  "Asia/Riyadh": "SA",
  "Asia/Singapore": "SG",
  "Asia/Shanghai": "CN",
  "Asia/Hong_Kong": "CN",
  "Asia/Tokyo": "JP",
  "Asia/Seoul": "KR",
  "Asia/Bangkok": "TH",
  "Asia/Manila": "PH",
  "Asia/Jakarta": "ID",
  "Asia/Ho_Chi_Minh": "VN",
  "Asia/Kuala_Lumpur": "MY",
  "Asia/Colombo": "LK",
  "Asia/Kathmandu": "NP",
  "Asia/Dhaka": "BD",
  "Asia/Karachi": "PK",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Mexico_City": "MX",
  "America/Sao_Paulo": "BR",
  "America/Argentina/Buenos_Aires": "AR",
  "Europe/London": "GB",
  "Europe/Berlin": "DE",
  "Europe/Paris": "FR",
  "Europe/Rome": "IT",
  "Europe/Madrid": "ES",
  "Europe/Amsterdam": "NL",
  "Europe/Dublin": "IE",
  "Europe/Zurich": "CH",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK",
  "Europe/Istanbul": "TR",
  "Europe/Warsaw": "PL",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Perth": "AU",
  "Pacific/Auckland": "NZ",
  "Africa/Johannesburg": "ZA",
  "Africa/Cairo": "EG",
  "Africa/Lagos": "NG",
  "Africa/Nairobi": "KE",
  "Asia/Jerusalem": "IL",
};

export function detectCountryFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_TO_COUNTRY[tz] ?? "US";
  } catch {
    return "US";
  }
}

export function detectCountryFromLocale(): string {
  try {
    const lang = (navigator.language || "en-US").toUpperCase();
    const region = lang.split("-")[1];
    if (region && COUNTRY_BY_CODE[region]) return region;
    return "US";
  } catch {
    return "US";
  }
}

export function detectCountry(): string {
  return detectCountryFromTimezone() || detectCountryFromLocale() || "US";
}

export const TECHNOLOGIES = [
  "Next.js",
  "React",
  "TypeScript",
  "Supabase",
  "Tailwind CSS",
  "shadcn/ui",
  "Framer Motion",
  "React Hook Form",
  "Zod",
  "TanStack Query",
  "PostgreSQL",
  "Realtime",
  "Vercel",
];

export const PROJECT_STATUS = {
  pending: { label: "Pending", color: "secondary" },
  in_progress: { label: "In Progress", color: "warning" },
  completed: { label: "Completed", color: "success" },
  cancelled: { label: "Cancelled", color: "destructive" },
} as const;

export const VISIT_STATUS = {
  requested: { label: "Requested", color: "secondary" },
  scheduled: { label: "Scheduled", color: "warning" },
  confirmed: { label: "Confirmed", color: "primary" },
  completed: { label: "Completed", color: "success" },
  cancelled: { label: "Cancelled", color: "destructive" },
} as const;

export const INVOICE_STATUS = {
  pending: { label: "Pending", color: "warning" },
  paid: { label: "Paid", color: "success" },
  overdue: { label: "Overdue", color: "destructive" },
  cancelled: { label: "Cancelled", color: "destructive" },
} as const;
