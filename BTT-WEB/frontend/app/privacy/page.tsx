import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal/LegalPage';
import { JsonLd } from '@/components/ui/JsonLd';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Privacy Policy',
  description:
    'How BlackTuf Technologies collects, uses, stores, and protects information submitted through this website.',
  path: '/privacy',
});

const UPDATED = '6 November 2026';

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Privacy Policy', path: '/privacy' },
        ])}
      />
      <LegalPage
        eyebrow="Privacy Policy"
        title={
          <>
            Your data, handled <span className="text-gradient">deliberately.</span>
          </>
        }
        description="This policy explains what information this website collects, why it is collected, and how it is handled."
        updated={UPDATED}
        sections={[
          {
            id: 'scope',
            title: 'Scope',
            body: (
              <>
                <p>
                  This policy applies to the BlackTuf Technologies website and the product hub at
                  this domain. It covers the contact form, the support request form, product launch
                  notification signups, and the private admin dashboard.
                </p>
                <p>
                  Individual BlackTuf products may run on separate domains and may have their own
                  privacy policies. Those policies apply when you use those products.
                </p>
              </>
            ),
          },
          {
            id: 'information-we-collect',
            title: 'Information we collect',
            body: (
              <>
                <p>We collect information you choose to submit through this website:</p>
                <ul>
                  <li>
                    <strong>Contact messages:</strong> name, email address, optional company,
                    subject, optional product, project type and budget, and your message.
                  </li>
                  <li>
                    <strong>Support requests:</strong> name, email address, optional product, issue
                    type, message, and an optional attachment you upload.
                  </li>
                  <li>
                    <strong>Launch notifications:</strong> the email address you submit for a
                    specific product that has not launched yet.
                  </li>
                  <li>
                    <strong>Admin accounts:</strong> a name, email address, hashed password, and
                    sign-in timestamps for authorised administrators.
                  </li>
                </ul>
                <p>
                  We also process limited technical information that a web server normally receives,
                  such as the request path and approximate request metadata, to operate and secure
                  the service.
                </p>
              </>
            ),
          },
          {
            id: 'how-we-use-it',
            title: 'How we use information',
            body: (
              <>
                <ul>
                  <li>To read and respond to contact and support requests.</li>
                  <li>To send launch updates only to addresses that requested them.</li>
                  <li>To operate, protect, and troubleshoot the website and its API.</li>
                  <li>To authenticate administrators and keep the admin area private.</li>
                  <li>To meet legal obligations where they apply.</li>
                </ul>
                <p>
                  We do not sell personal information. We do not use contact or support submissions
                  for advertising.
                </p>
              </>
            ),
          },
          {
            id: 'storage-and-processors',
            title: 'Storage and service providers',
            body: (
              <>
                <p>
                  Website content, messages, support requests, and notification signups are stored
                  in a MongoDB database. Support attachments may be stored with Cloudinary. The
                  website and API are hosted on third-party infrastructure providers.
                </p>
                <p>
                  These providers process data on our behalf so the service can operate. Access to
                  production credentials is limited to authorised administrators.
                </p>
              </>
            ),
          },
          {
            id: 'cookies',
            title: 'Cookies',
            body: (
              <>
                <p>
                  The public website does not require a cookie to browse products, read
                  documentation, or submit a form. The admin dashboard uses an HTTP-only
                  authentication cookie after sign-in.
                </p>
                <p>
                  If a web analytics identifier is configured, a third-party analytics script may set
                  cookies or similar identifiers. See the{' '}
                  <Link href="/cookies">Cookie Notice</Link> for details.
                </p>
              </>
            ),
          },
          {
            id: 'retention',
            title: 'Retention',
            body: (
              <p>
                Messages, support requests, and notification signups are kept for as long as needed
                to handle the request, maintain a record of the conversation, or operate the
                service. When information is no longer needed, it is deleted or anonymised. Some
                records may be retained where required by law.
              </p>
            ),
          },
          {
            id: 'security',
            title: 'Security',
            body: (
              <>
                <p>
                  Passwords for admin accounts are stored as bcrypt hashes. Admin authentication
                  uses a signed token in an HTTP-only cookie. Form input is validated on the server,
                  and administration endpoints require authentication.
                </p>
                <p>
                  No system is completely secure. Do not submit passwords, access tokens, or private
                  records through a general contact or support form.
                </p>
              </>
            ),
          },
          {
            id: 'your-choices',
            title: 'Your choices and requests',
            body: (
              <>
                <p>
                  You can ask what information we hold about you, request a correction, or ask for
                  deletion. Use the <Link href="/contact">contact form</Link> and describe your
                  request. We may need to verify that the request relates to you before acting on it.
                </p>
                <p>
                  You can stop receiving launch updates by replying to a launch email or contacting
                  us.
                </p>
              </>
            ),
          },
          {
            id: 'children',
            title: 'Children',
            body: (
              <p>
                This website is not directed at children, and we do not knowingly collect personal
                information from children through the contact or support forms.
              </p>
            ),
          },
          {
            id: 'changes',
            title: 'Changes to this policy',
            body: (
              <p>
                This policy may be updated as the website or its services change. The date at the top
                of this page shows when it was last revised. Material changes will be reflected in
                the text of this page.
              </p>
            ),
          },
          {
            id: 'contact',
            title: 'Contact',
            body: (
              <p>
                Questions about this policy can be sent through the{' '}
                <Link href="/contact">contact form</Link>. Product support is handled separately
                through the <Link href="/support">support centre</Link>.
              </p>
            ),
          },
        ]}
      />
    </>
  );
}
