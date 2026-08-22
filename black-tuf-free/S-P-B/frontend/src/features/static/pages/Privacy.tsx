import { StaticPage } from '@/components/StaticPage';
import { SITE_NAME } from '@/lib/constants';

export const Privacy = () => (
  <StaticPage
    title="Privacy Policy"
    path="/privacy"
    description={`How ${SITE_NAME} collects, uses and protects your personal information.`}
  >
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">1. Information We Collect</h2>
      <p className="text-sm text-muted-foreground">
        We collect information you provide directly — such as your name, email, phone number, delivery address and
        payment details — along with usage data like pages visited and orders placed.
      </p>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">2. How We Use It</h2>
      <p className="text-sm text-muted-foreground">
        We use your information to process orders, provide support, send order-related notifications, prevent fraud
        and improve the platform. We never sell your personal data.
      </p>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">3. Payments</h2>
      <p className="text-sm text-muted-foreground">
        Card details are handled entirely by our payment partner (Razorpay). We do not store full card numbers on
        our servers.
      </p>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">4. Cookies</h2>
      <p className="text-sm text-muted-foreground">
        We use cookies to keep you signed in and remember your cart. You can disable cookies in your browser, though
        some features may stop working.
      </p>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">5. Data Security</h2>
      <p className="text-sm text-muted-foreground">
        We protect your data with encryption in transit, hashed passwords and restricted access controls. No system
        is completely secure, and we cannot guarantee absolute security.
      </p>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">6. Your Rights</h2>
      <p className="text-sm text-muted-foreground">
        You can access, correct or delete your personal data at any time from your account settings, or by
        contacting our support team.
      </p>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">7. Contact</h2>
      <p className="text-sm text-muted-foreground">
        For any privacy questions, email us at support@blacktuf.com.
      </p>
    </section>
  </StaticPage>
);

export default Privacy;
