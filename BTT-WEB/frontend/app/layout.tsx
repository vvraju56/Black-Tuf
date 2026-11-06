import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Analytics } from '@/components/layout/Analytics';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { SiteChrome } from '@/components/layout/SiteChrome';
import { JsonLd } from '@/components/ui/JsonLd';
import { MotionProvider } from '@/components/ui/Motion';
import { getAllProducts, getServices, getSiteSettings } from '@/lib/api';
import { DOC_PAGES } from '@/lib/docs';
import { createMetadata, organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const revalidate = 30;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...createMetadata({
    title: 'BlackTuf Technologies — Software, Products & Technology',
    description: SITE_DESCRIPTION,
    path: '/',
    absoluteTitle: true,
  }),
  title: {
    default: 'BlackTuf Technologies — Software, Products & Technology',
    template: '%s — BlackTuf Technologies',
  },
  applicationName: SITE_NAME,
  authors: [{ name: 'BlackTuf Technologies' }],
  creator: 'BlackTuf Technologies',
  publisher: 'BlackTuf Technologies',
  category: 'technology',
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#050505',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [products, services, settings] = await Promise.all([
    getAllProducts(),
    getServices(),
    getSiteSettings(),
  ]);

  const docs = DOC_PAGES.map((page) => ({
    title: page.title,
    slug: page.slug,
    description: page.description,
    keywords: page.sections.map((section) => section.title).join(' '),
  }));

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[200] -translate-y-24 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#180514] transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <MotionProvider>
          <div className="flex min-h-screen flex-col">
            <SiteChrome
              navbar={
                <Navbar
                  products={products}
                  services={services}
                  docs={docs}
                  supportHandle={settings.supportHandle}
                  supportUrl={settings.supportUrl}
                />
              }
              footer={<Footer products={products} settings={settings} />}
            >
              {children}
            </SiteChrome>
          </div>
        </MotionProvider>
        <JsonLd data={[organizationJsonLd(settings), websiteJsonLd()]} />
        <Analytics />
      </body>
    </html>
  );
}
