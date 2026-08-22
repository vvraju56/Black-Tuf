import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart';
import { fetchAddresses, addAddress, validateOrderTotals, createOrder } from '@/lib/products-api';
import { fetchRazorpayKey, createRazorpayPayment, verifyRazorpayPayment, RazorpayKey } from '@/lib/payments-api';
import { openRazorpayCheckout } from '@/lib/razorpay';
import { Address, CartItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { INDIAN_STATES } from '@/lib/constants';
import { MapPinIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AddressFormProps {
  initial?: Partial<Address>;
  onSubmit: (address: Partial<Address>) => void;
  onCancel: () => void;
}

const AddressForm = ({ initial, onSubmit, onCancel }: AddressFormProps) => {
  const [form, setForm] = useState({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India' });

  useEffect(() => {
    if (initial) setForm({ fullName: initial.fullName || '', phone: initial.phone || '', addressLine1: initial.addressLine1 || '', addressLine2: initial.addressLine2 || '', city: initial.city || '', state: initial.state || '', postalCode: initial.postalCode || '', country: initial.country || 'India' });
  }, [initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input name="fullName" label="Full Name" value={form.fullName} onChange={handleChange} required />
      <Input name="phone" label="Phone" value={form.phone} onChange={handleChange} required />
      <Input name="addressLine1" label="Address Line 1" value={form.addressLine1} onChange={handleChange} required />
      <Input name="addressLine2" label="Address Line 2 (optional)" value={form.addressLine2} onChange={handleChange} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input name="city" label="City" value={form.city} onChange={handleChange} required />
        <Select name="state" label="State" value={form.state} onChange={handleChange} placeholder="Select state" required>
          {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input name="postalCode" label="Postal Code" value={form.postalCode} onChange={handleChange} required />
        <Input name="country" label="Country" value={form.country} onChange={handleChange} required />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm">Save</Button>
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

export const Checkout = () => {
  const { items, subtotal } = useCart();
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [coupon, setCoupon] = useState('');
  const [placing, setPlacing] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState<RazorpayKey | null>(null);

  useEffect(() => {
    fetchRazorpayKey()
      .then(setRazorpayKey)
      .catch(() => setRazorpayKey(null));
  }, []);

  const { data: addresses = [], refetch: refetchAddresses } = useQuery({ queryKey: ['addresses'], queryFn: fetchAddresses, staleTime: 30000 });

  useEffect(() => {
    if (addresses.length && !selectedAddress) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      if (def) setSelectedAddress(def._id);
    }
  }, [addresses, selectedAddress]);

  const itemsPayload = items.map((i) => ({ price: i.price, quantity: i.quantity }));
  const [totals, setTotals] = useState<{ subtotal: number; tax: number; shipping: number; discount: number; total: number } | null>(null);
  const [validating, setValidating] = useState(false);

  const validateTotals = async () => {
    if (!items.length) return;
    setValidating(true);
    try {
      const res = await validateOrderTotals({ items: itemsPayload, couponCode: coupon });
      setTotals({ subtotal: res.subtotal, tax: res.tax, shipping: res.shipping, discount: res.discount, total: res.total });
    } catch {
      setTotals({ subtotal, tax: subtotal * 0.18, shipping: subtotal >= 499 ? 0 : 50, discount: 0, total: subtotal + subtotal * 0.18 + (subtotal >= 499 ? 0 : 50) });
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    validateTotals();
  }, [items, coupon, subtotal]);

  const handleAddAddress = async (address: Partial<Address>) => {
    await addAddress({ ...address, isDefault: addresses.length === 0 } as any);
    refetchAddresses();
    setShowAddressForm(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return;
    setPlacing(true);
    try {
      const address = addresses.find((a) => a._id === selectedAddress)!;
      const created = await createOrder({
        shippingAddress: address,
        paymentMethod,
        couponCode: coupon || undefined,
      });
      toast.success(`Order #${created.orderNumber} placed`);
      if (paymentMethod === 'razorpay') {
        const key = await fetchRazorpayKey();
        const amount = totals ? totals.total : subtotal + (subtotal * 0.18) + (subtotal >= 499 ? 0 : 50);
        const payment = await createRazorpayPayment({ orderId: created.order._id, amount });
        if (key.mode === 'live' && !payment.razorpayOrderId) {
          throw new Error('Unable to initialize online payment. Please try again.');
        }
        if (key.mode === 'mock') {
          await verifyRazorpayPayment({ orderId: created.order._id, paymentId: 'mock_payment', signature: 'mock', mode: 'mock' });
          toast.success('Payment successful (test mode), order confirmed');
          navigate(`/orders/${created.orderNumber}`);
          return;
        }
        await openRazorpayCheckout({
          key: key.mode === 'live' && payment.razorpayOrderId ? payment.keyId : '',
          order_id: payment.razorpayOrderId || payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          name: payment.name,
          description: payment.description,
          prefill: { email: address.fullName, contact: address.phone },
          theme: payment.theme,
          handler: async (response) => {
            try {
              await verifyRazorpayPayment({
                orderId: created.order._id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                mode: key.mode,
              });
              toast.success('Payment successful, order confirmed');
              navigate(`/orders/${created.orderNumber}`);
            } catch (e: any) {
              toast.error(e?.response?.data?.message || 'Payment verification failed');
            }
          },
          modal: { ondismiss: () => {} },
        });
      } else {
        navigate('/orders');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!items.length) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p className="mb-4">Your cart is empty.</p>
        <Button onClick={() => navigate('/products')}>Continue shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Shipping Address</h2>
              {!showAddressForm && (
                <Button variant="outline" size="sm" onClick={() => setShowAddressForm(true)}>
                  <PlusIcon className="h-4 w-4 mr-1" /> Add
                </Button>
              )}
            </div>
            {showAddressForm ? (
              <div className="mt-3 rounded-lg border p-3"><AddressForm onSubmit={handleAddAddress} onCancel={() => setShowAddressForm(false)} /></div>
            ) : (
              <div className="mt-3 space-y-2">
                {addresses.map((a) => (
                  <label key={a._id} className="flex items-start gap-3 rounded-md border p-3 cursor-pointer">
                    <input type="radio" name="address" checked={selectedAddress === a._id} onChange={() => setSelectedAddress(a._id)} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1"><MapPinIcon className="h-4 w-4" /><strong>{a.fullName}</strong></div>
                      <p className="text-sm">{a.addressLine1}{a.addressLine2 && `, ${a.addressLine2}`}</p>
                      <p className="text-sm">{a.city}, {a.state} {a.postalCode}</p>
                      <p className="text-sm">{a.phone}</p>
                      {a.isDefault && <span className="text-xs text-success">Default</span>}
                    </div>
                  </label>
                ))}
                {addresses.length === 0 && <p className="text-sm text-muted-foreground">Add a shipping address to continue.</p>}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-medium">Payment Method</h2>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <label className="flex items-center gap-2"><input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /> Cash on Delivery</label>
              <label className="flex items-center gap-2"><input type="radio" name="payment" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} /> Razorpay
                <span className={`rounded-full px-2 py-0.5 text-xs ${razorpayKey?.mode === 'live' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                  {razorpayKey?.mode === 'live' ? 'Live' : razorpayKey ? 'Test mode' : 'Checking…'}
                </span>
              </label>
            </div>
            {razorpayKey?.mode === 'mock' && <p className="mt-2 text-xs text-muted-foreground">No Razorpay keys configured — online payments will be simulated in test mode.</p>}
          </div>
        </div>

        <div className="rounded-lg border p-4 h-fit">
          <h2 className="font-medium mb-2">Order Summary</h2>
          <div className="space-y-1 text-sm">
            {items.map((i) => (
              <div key={i.product._id} className="flex justify-between">{i.product.name} × {i.quantity}</div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t pt-2 text-sm">
            <div className="flex justify-between">Subtotal: {totals ? formatPrice(totals.subtotal) : formatPrice(subtotal)}</div>
            <div className="flex justify-between">Tax: {totals ? formatPrice(totals.tax) : formatPrice(subtotal * 0.18)}</div>
            <div className="flex justify-between">Shipping: {totals ? formatPrice(totals.shipping) : formatPrice(subtotal >= 499 ? 0 : 50)}</div>
          {totals && totals.discount > 0 && <div className="flex justify-between text-success">Discount: -{formatPrice(totals.discount)}</div>}
          <div className="flex justify-between border-t pt-1 font-bold">{formatPrice(totals ? totals.total : subtotal + subtotal * 0.18 + (subtotal >= 499 ? 0 : 50))}</div>
          </div>
          <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code" className="mt-3 w-full rounded-md border px-2 py-1 text-sm" />
          <Button className="mt-4 w-full" onClick={handlePlaceOrder} loading={placing} variant={paymentMethod === 'cod' ? 'primary' : 'secondary'}>Place Order · {totals ? formatPrice(totals.total) : formatPrice(subtotal)}</Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
