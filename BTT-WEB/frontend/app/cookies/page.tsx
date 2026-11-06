import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal/LegalPage';
import { JsonLd } from '@/components/ui/JsonLd';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Cookie Notice',
  description:
    'What cookies and similar technologies the BlackTuf Technologies website uses, and what they are for.',
  path: '/cookies',
});

const UPDATED = '6 November 2026';

export default function CookiesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Cookie Notice', path: '/cookies' },
        ])}
      />
      <LegalPage
        eyebrow="Cookie Notice"
        title={
          <>
            A short note about <span className="text-gradient">cookies.</span>
          </>
        }
        description="This notice explains the cookies and similar technologies used by this website and what they do."
        updated={UPDATED}
        sections={[
          {
            id: 'what-are-cookies',
            title: 'What cookies are',
            body: (
              <p>
                Cookies are small pieces of data that a website can store in your browser. Similar
                technologies include local storage and session storage. They can be used to keep you
                signed in, remember a preference, or measure how a site is used.
              </p>
            ),
          },
          {
            id: 'cookies-we-use',
            title: 'Cookies used by this website',
            body: (
              <>
                <p>The public website is designed to work without cookies for ordinary browsing.</p>
                <ul>
                  <li>
                    <strong>btt_admin_token</strong> — an essential, HTTP-only authentication cookie
                    set only after an administrator signs in to the private dashboard. It is not used
                    by public visitors.
                  </li>
                  <li>
                    <strong>Analytics cookies</strong> — only present if a web analytics identifier
                    is configured for the deployment. They are used to understand aggregate site
                    usage, not to identify you personally.
                  </li>
                </ul>
                <p>
                  Forms do not require a cookie to work. The site does not intentionally set
                  advertising or cross-site tracking cookies.
                </p>
              </>
            ),
          },
          {
            id: 'analytics',
            title: 'Analytics',
            body: (
              <p>
                When analytics is enabled, the site may send event names and non-identifying context
                — such as which product page was viewed or which outbound link was clicked — to the
                configured analytics provider. Analytics is disabled when no identifier is
                configured. You can block analytics scripts with browser settings or an extension
                without affecting the core site.
              </p>
            ),
          },
          {
            id: 'managing-cookies',
            title: 'Managing cookies',
            body: (
              <>
                <p>
                  You can delete or block cookies in your browser settings. Blocking the admin
                  authentication cookie will prevent administrators from signing in. Blocking
                  analytics cookies does not affect browsing, search, or forms.
                </p>
                <p>
                  Because the only essential cookie is for admin authentication, public visitors do
                  not need to make a cookie choice to use the site.
                </p>
              </>
            ),
          },
          {
            id: 'third-parties',
            title: 'Third-party services',
            body: (
              <p>
                Hosting, database, media storage, and optional analytics providers may process
                limited technical data as described in the <Link href="/privacy">Privacy Policy</Link>.
                External product links open destinations with their own cookie practices.
              </p>
            ),
          },
          {
            id: 'changes',
            title: 'Changes',
            body: (
              <p>
                This notice may be updated if the cookies used by the site change. The date at the top
                of the page shows the latest revision.
              </p>
            ),
          },
          {
            id: 'contact',
            title: 'Contact',
            body: (
              <p>
                Questions about cookies or privacy can be sent through the{' '}
                <Link href="/contact">contact form</Link>.
              </p>
            ),
          },
        ]}
      />
    </>
  );
}
