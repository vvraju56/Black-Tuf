import { StaticPage } from '@/components/StaticPage';
import { INDIAN_STATES } from '@/lib/constants';

const zones = [
  { zone: 'Metros (Delhi, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad)', time: '1 - 3 business days', charge: 'Free above ₹499' },
  { zone: 'Rest of India', time: '3 - 6 business days', charge: 'Free above ₹499' },
  { zone: 'Remote / North-East pin codes', time: '5 - 9 business days', charge: 'Flat ₹79' },
];

export const Shipping = () => (
  <StaticPage
    title="Shipping & Delivery"
    path="/shipping"
    description="Shipping times, charges and delivery information for Black Tuf orders across India."
  >
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Delivery Estimates</h2>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-3 text-left font-medium">Region</th>
              <th className="p-3 text-left font-medium">Delivery Time</th>
              <th className="p-3 text-left font-medium">Shipping Charge</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.zone} className="border-t border-white/10">
                <td className="p-3">{z.zone}</td>
                <td className="p-3">{z.time}</td>
                <td className="p-3">{z.charge}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Important Notes</h2>
      <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>We currently ship to all {INDIAN_STATES.length} states and union territories in India.</li>
        <li>Orders placed before 6 PM on business days are dispatched the same day, subject to seller stock.</li>
        <li>Once shipped, you will receive a tracking link by email and notification.</li>
        <li>Delivery times are estimates and may vary due to courier conditions or remote locations.</li>
        <li>Cash on Delivery is available on orders below ₹10,000 where the courier supports it.</li>
      </ul>
    </section>
  </StaticPage>
);

export default Shipping;
