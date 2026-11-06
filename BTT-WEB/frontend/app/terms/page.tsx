import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal/LegalPage';
import { JsonLd } from '@/components/ui/JsonLd';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Terms of Use',
  description:
    'Terms for using the BlackTuf Technologies website, product directory, documentation, and public forms.',
  path: '/terms',
});

const UPDATED = '6 November 2026';

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Terms of Use', path: '/terms' },
        ])}
      />
      <LegalPage
        eyebrow="Terms of Use"
        title={
          <>
            Simple terms for a <span className="text-gradient">straightforward site.</span>
          </>
        }
        description="These terms apply when you use the BlackTuf Technologies website, product directory, documentation, and public forms."
        updated={UPDATED}
        sections={[
          {
            id: 'acceptance',
            title: 'Acceptance',
            body: (
              <p>
                By using this website, you agree to these terms. If you do not agree, do not use the
                site. These terms apply to this website; separate terms may apply to individual
                products or to a written project agreement.
              </p>
            ),
          },
          {
            id: 'website-use',
            title: 'Using the website',
            body: (
              <>
                <p>You may use this website for lawful purposes and in the ordinary way it is intended.</p>
                <ul>
                  <li>Do not attempt to gain unauthorised access to the admin area or API.</li>
                  <li>Do not interfere with the availability or integrity of the service.</li>
                  <li>Do not submit spam, malware, or unlawful content through any form.</li>
                  <li>Do not use automated scraping in a way that degrades the service.</li>
                </ul>
              </>
            ),
          },
          {
            id: 'product-information',
            title: 'Product information',
            body: (
              <>
                <p>
                  The product directory describes products that BlackTuf Technologies builds and
                  operates. Status labels, feature lists, release notes, and links are maintained as
                  accurately as practical, but products change over time.
                </p>
                <p>
                  If a link, price, or availability detail is not configured, it is not shown.
                  Nothing on this site is a guarantee that a product will remain available, retain a
                  particular feature, or be offered on particular terms.
                </p>
              </>
            ),
          },
          {
            id: 'no-professional-advice',
            title: 'No professional advice',
            body: (
              <p>
                Documentation and website content are provided for general information. They are not
                legal, financial, security, or other professional advice. You are responsible for how
                you apply the information.
              </p>
            ),
          },
          {
            id: 'third-party-links',
            title: 'Third-party links',
            body: (
              <p>
                Product pages may link to external websites, repositories, or app stores. Those
                destinations are controlled by their own operators, and their terms and privacy
                practices apply. BlackTuf Technologies is not responsible for third-party content.
              </p>
            ),
          },
          {
            id: 'intellectual-property',
            title: 'Intellectual property',
            body: (
              <>
                <p>
                  The BlackTuf Technologies name, branding, website design, and original written
                  content on this site belong to BlackTuf Technologies unless stated otherwise.
                </p>
                <p>
                  You may read, link to, and quote short excerpts with attribution. Do not reproduce
                  substantial parts of the site, copy its design wholesale, or use the branding in a
                  way that suggests endorsement or partnership without permission.
                </p>
                <p>
                  Third-party product names and logos remain the property of their respective owners.
                </p>
              </>
            ),
          },
          {
            id: 'submissions',
            title: 'Information you submit',
            body: (
              <>
                <p>
                  When you submit a contact message or support request, you confirm that the
                  information is accurate and that you have the right to share it. Do not submit
                  confidential material belonging to someone else without permission.
                </p>
                <p>
                  Do not include passwords, access tokens, or private personal records in a general
                  form. See the <Link href="/privacy">Privacy Policy</Link> for how submissions are
                  handled.
                </p>
              </>
            ),
          },
          {
            id: 'availability',
            title: 'Availability',
            body: (
              <p>
                The website is provided on an “as available” basis. It may be unavailable during
                maintenance, deployment, or infrastructure incidents. BlackTuf Technologies does not
                promise uninterrupted access.
              </p>
            ),
          },
          {
            id: 'limitation',
            title: 'Limitation of liability',
            body: (
              <p>
                To the extent permitted by applicable law, BlackTuf Technologies is not liable for
                indirect or consequential loss arising from use of this website, reliance on its
                content, or the unavailability of the service. Nothing in these terms excludes
                liability that cannot lawfully be excluded.
              </p>
            ),
          },
          {
            id: 'governing-law',
            title: 'Governing law',
            body: (
              <p>
                These terms are governed by the laws of India. Disputes relating to this website are
                subject to the jurisdiction of the competent courts in India, unless applicable law
                requires otherwise.
              </p>
            ),
          },
          {
            id: 'changes',
            title: 'Changes to these terms',
            body: (
              <p>
                These terms may be updated as the website changes. The date at the top of this page
                shows the latest revision. Continued use of the site after an update means the
                revised terms apply.
              </p>
            ),
          },
          {
            id: 'contact',
            title: 'Contact',
            body: (
              <p>
                Questions about these terms can be sent through the{' '}
                <Link href="/contact">contact form</Link>.
              </p>
            ),
          },
        ]}
      />
    </>
  );
}
