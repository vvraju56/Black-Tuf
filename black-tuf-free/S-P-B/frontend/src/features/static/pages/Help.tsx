import { Link } from 'react-router-dom';
import { StaticPage } from '@/components/StaticPage';

const faqs = [
  { q: 'How do I place an order?', a: 'Browse the store, add items to your cart, and head to checkout. Choose your address, apply a coupon if you have one, and pay securely via Razorpay.' },
  { q: 'How do I track my order?', a: 'Open the order in your dashboard. Each item shows a live status — placed, packed, shipped or delivered — with a tracking number where available.' },
  { q: 'What is the return policy?', a: 'Eligible items can be returned within 7 days of delivery. Open the order in your dashboard and request a return; we will arrange pickup and refund once the seller approves.' },
  { q: 'How do payments work?', a: 'We accept all major UPI apps, cards, netbanking and wallets through Razorpay. Refunds go back to the original payment method within 5-7 business days.' },
  { q: 'How do I become a seller?', a: 'Create an account, apply as a seller, and wait for approval. Once approved, add products and start selling. Sell on Black Tuf is free to join.' },
  { q: 'When do I get paid as a seller?', a: 'Earnings are released when orders are delivered. Withdraw anytime from your seller dashboard; payments are processed within 3-5 business days.' },
];

export const Help = () => (
  <StaticPage
    title="Help Center"
    path="/help"
    description="Frequently asked questions about shopping, selling, orders, payments and returns on Black Tuf."
  >
    <div className="space-y-6">
      {faqs.map((f) => (
        <div key={f.q} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <h2 className="font-semibold mb-1">{f.q}</h2>
          <p className="text-sm text-muted-foreground">{f.a}</p>
        </div>
      ))}
    </div>
    <p className="text-muted-foreground">
      Still need help? <Link to="/contact" className="text-primary hover:underline">Contact our support team</Link> — we
      are available 7 days a week.
    </p>
  </StaticPage>
);

export default Help;
