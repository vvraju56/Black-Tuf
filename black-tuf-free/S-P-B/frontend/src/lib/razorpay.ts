type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { email?: string; contact?: string };
  theme: { color: string };
  handler: (response: { razorpay_payment_id: string; razorpay_signature: string }) => void;
  modal: { ondismiss: () => void };
};

export const loadRazorpayScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if ((window as any).Razorpay) return resolve();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });

export const openRazorpayCheckout = async (opts: RazorpayOptions): Promise<void> => {
  await loadRazorpayScript();
  const R = (window as any).Razorpay;
  if (!R) throw new Error('Razorpay SDK not loaded');
  const rzp = new R(opts);
  rzp.open();
  rzp.on('payment.failed', () => opts.modal.ondismiss());
};
