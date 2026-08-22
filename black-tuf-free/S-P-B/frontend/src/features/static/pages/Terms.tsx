import { StaticPage } from '@/components/StaticPage';
import { SITE_NAME } from '@/lib/constants';

export const Terms = () => (
  <StaticPage
    title="Terms of Service"
    path="/terms"
    description={`Terms and conditions governing the use of ${SITE_NAME}.`}
  >
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
      <p className="text-sm text-muted-foreground">
        By accessing or using {SITE_NAME}, you agree to be bound by these Terms of Service. If you do not agree,
        please do not use the platform.
      </p>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">2. Accounts</h2>
      <p className="text-sm text-muted-foreground">
        You are responsible for safeguarding your account credentials and for all activity under your account.
        You must provide accurate information and keep it updated.
      </p>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">3. Buying and Selling</h2>
      <p className="text-sm text-muted-foreground">
        Buyers must pay for orders at checkout. Sellers must list genuine products and fulfil orders promptly.
        {SITE_NAME} reserves the right to suspend accounts that violate this policy.
      </p>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">4. Payments</h2>
      <p className="text-sm text-muted-foreground">
        Payments are processed securely through Razorpay. Refunds follow the timeline described in our Return Policy.
      </p>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">5. Prohibited Conduct</h2>
      <p className="text-sm text-muted-foreground">
        You may not misuse the platform, attempt unauthorized access, list counterfeit or prohibited goods, or engage
        in fraudulent transactions.
      </p>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">6. Limitation of Liability</h2>
      <p className="text-sm text-muted-foreground">
        {SITE_NAME} acts as a marketplace connecting buyers and sellers. To the maximum extent permitted by law,
        our liability is limited to the amount paid for the order in question.
      </p>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">7. Changes</h2>
      <p className="text-sm text-muted-foreground">
        We may update these terms from time to time. Continued use of the platform after changes constitutes
        acceptance of the revised terms.
      </p>
    </section>
  </StaticPage>
);

export default Terms;
