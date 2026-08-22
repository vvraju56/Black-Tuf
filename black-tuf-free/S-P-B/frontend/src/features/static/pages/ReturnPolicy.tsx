import { StaticPage } from '@/components/StaticPage';
import { SITE_NAME } from '@/lib/constants';

export const ReturnPolicy = () => (
  <StaticPage
    title="Return Policy"
    path="/return-policy"
    description={`Easy 7-day returns and refunds on ${SITE_NAME}.`}
  >
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">7-Day Easy Returns</h2>
      <p className="text-sm text-muted-foreground">
        Most items can be returned within <strong>7 days</strong> of delivery. If you received a wrong, damaged or
        defective item, or simply changed your mind, request a return from your order in the dashboard.
      </p>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Eligibility</h2>
      <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>The item must be unused, unwashed and in its original packaging with all tags and accessories.</li>
        <li>Perishables, personalized items and digital products are non-returnable unless defective.</li>
        <li>Items marked "Final Sale" cannot be returned.</li>
      </ul>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">How to Return</h2>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Go to your orders and select the item you want to return.</li>
        <li>Choose a reason and submit the request.</li>
        <li>We schedule a free pickup from your address within 2 business days.</li>
        <li>Once the seller receives and verifies the item, your refund is initiated.</li>
      </ol>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Refunds</h2>
      <p className="text-sm text-muted-foreground">
        Approved refunds are processed back to your original payment method within <strong>5-7 business days</strong>.
        For Cash on Delivery orders, the amount is refunded to your linked bank account or wallet.
      </p>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Need Help?</h2>
      <p className="text-sm text-muted-foreground">
        Questions about a return? Contact support at support@blacktuf.com and we will sort it out.
      </p>
    </section>
  </StaticPage>
);

export default ReturnPolicy;
