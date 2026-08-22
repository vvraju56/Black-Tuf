import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://black-tuf.vercel.app").replace(/\/+$/, "");
const siteName = "Black Tuf";
const title = "Black Tuf — Engineering Digital & Industrial Solutions";
const description =
  "Black Tuf is a marketplace connecting clients with vetted engineers for web development, mobile apps, UI/UX, AI, game development, IoT automation, PLC programming and electrical works.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · Black Tuf",
  },
  description,
  applicationName: siteName,
  keywords: [
    "web development",
    "mobile apps",
    "UI UX design",
    "game development",
    "AI development",
    "IoT automation",
    "PLC programming",
    "electrical works",
    "freelance engineers",
    "hire developers",
  ],
  authors: [{ name: "Black Tuf" }],
  creator: "Black Tuf",
  publisher: "Black Tuf",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title,
    description,
    images: [
      {
        url: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
        alt: siteName,
      },
    ],
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: [`${siteUrl}/icon-512.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#07080f",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/icon-512.png`,
    description,
    sameAs: [],
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
