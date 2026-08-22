import { Link } from 'react-router-dom';
import { StaticPage } from '@/components/StaticPage';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants';

const values = [
  { title: 'Genuine Products', text: 'Every seller on our platform is verified and every product is checked before it goes live, so you always get authentic goods.' },
  { title: 'Fair Pricing', text: 'We keep our commission transparent and competitive, letting sellers price fairly while customers get the best deals.' },
  { title: 'Fast Delivery', text: 'With a distributed seller network across India, we deliver quickly to more than 19,000 pin codes.' },
  { title: 'Support That Cares', text: 'Our support team is here 7 days a week to help with orders, returns and anything else you need.' },
];

export const About = () => (
  <StaticPage
    title="About Us"
    path="/about"
    description={`Learn about ${SITE_NAME}, a modern multi-vendor marketplace built for Indian buyers and sellers.`}
  >
    <section className="space-y-4">
      <p>
        {SITE_NAME} is a modern multi-vendor marketplace built to connect Indian shoppers with verified sellers
        across the country. Our tagline, “{SITE_TAGLINE}”, says it all — whether you are shopping or selling,
        we make the platform work for you.
      </p>
      <p>
        We started with a simple idea: online commerce should be transparent. Buyers should know exactly who they
        are buying from, and sellers should be able to grow without hidden fees or unfair policies. Today that idea
        powers every order placed on our platform.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-bold">Our Mission</h2>
      <p>
        To give every seller a fair stage and every buyer a trusted store. We combine verified sellers, secure
        payments, effortless returns and real support so that the entire shopping experience just works.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-bold">What We Value</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {values.map((v) => (
          <div key={v.title} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h3 className="font-semibold mb-1">{v.title}</h3>
            <p className="text-sm text-muted-foreground">{v.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-bold">Get Started</h2>
      <p className="text-muted-foreground">
        Ready to start shopping or selling?{' '}
        <Link to="/products" className="text-primary hover:underline">Browse the store</Link> or{' '}
        <Link to="/auth/register?seller=1" className="text-primary hover:underline">become a seller</Link>.
      </p>
    </section>
  </StaticPage>
);

export default About;
