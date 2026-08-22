import { useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchSettings, updateSettings } from '@/lib/admin-api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'react-hot-toast';
import { Settings, Save } from 'lucide-react';

const defaultForm = {
  marketplaceName: 'Black Tuf',
  currency: 'INR',
  currencySymbol: '₹',
  defaultTaxRate: '18',
  minOrderValue: '0',
  returnWindowDays: '7',
  globalCommission: '10',
  maintenanceMessage: '',
  defaultFee: '50',
  freeShippingThreshold: '499',
  estimatedDays: '3-5 business days',
  taxEnabled: true,
  codEnabled: true,
  sellerApprovalRequired: true,
  productApprovalRequired: true,
  maintenanceMode: false,
  emailEnabled: true,
};

export const AdminSettings = () => {
  const qc = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ['admin-settings'], queryFn: fetchSettings });
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (!settings) return;
    const shipping = settings.shipping || {};
    setForm({
      marketplaceName: String(settings.marketplaceName ?? 'Black Tuf'),
      currency: String(settings.currency ?? 'INR'),
      currencySymbol: String(settings.currencySymbol ?? '₹'),
      defaultTaxRate: String(settings.defaultTaxRate ?? 18),
      minOrderValue: String(settings.minOrderValue ?? 0),
      returnWindowDays: String(settings.returnWindowDays ?? 7),
      globalCommission: String(settings.globalCommission ?? 10),
      maintenanceMessage: String(settings.maintenanceMessage ?? ''),
      defaultFee: String(shipping.defaultFee ?? 50),
      freeShippingThreshold: String(shipping.freeShippingThreshold ?? 499),
      estimatedDays: String(shipping.estimatedDays ?? '3-5 business days'),
      taxEnabled: Boolean(settings.taxEnabled),
      codEnabled: Boolean(settings.codEnabled),
      sellerApprovalRequired: Boolean(settings.sellerApprovalRequired),
      productApprovalRequired: Boolean(settings.productApprovalRequired),
      maintenanceMode: Boolean(settings.maintenanceMode),
      emailEnabled: Boolean(settings.emailEnabled),
    });
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateSettings({
        marketplaceName: form.marketplaceName,
        currency: form.currency,
        currencySymbol: form.currencySymbol,
        taxEnabled: form.taxEnabled,
        defaultTaxRate: parseFloat(form.defaultTaxRate) || 0,
        codEnabled: form.codEnabled,
        minOrderValue: parseFloat(form.minOrderValue) || 0,
        returnWindowDays: parseInt(form.returnWindowDays, 10) || 7,
        sellerApprovalRequired: form.sellerApprovalRequired,
        productApprovalRequired: form.productApprovalRequired,
        maintenanceMode: form.maintenanceMode,
        maintenanceMessage: form.maintenanceMessage,
        globalCommission: parseFloat(form.globalCommission) || 0,
        emailEnabled: form.emailEnabled,
        shipping: {
          defaultFee: parseFloat(form.defaultFee) || 0,
          freeShippingThreshold: parseFloat(form.freeShippingThreshold) || 0,
          estimatedDays: form.estimatedDays,
        },
      }),
    onSuccess: () => {
      toast.success('Settings saved');
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const setField = (key: keyof typeof defaultForm, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Settings</h1>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="mb-4 font-semibold">Marketplace</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Marketplace Name" value={form.marketplaceName} onChange={(e) => setField('marketplaceName', e.target.value)} />
            <Input label="Currency" value={form.currency} onChange={(e) => setField('currency', e.target.value)} />
            <Input label="Currency Symbol" value={form.currencySymbol} onChange={(e) => setField('currencySymbol', e.target.value)} />
            <Input label="Global Commission (%)" type="number" value={form.globalCommission} onChange={(e) => setField('globalCommission', e.target.value)} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="mb-4 font-semibold">Orders & Returns</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Default Tax Rate (%)" type="number" value={form.defaultTaxRate} onChange={(e) => setField('defaultTaxRate', e.target.value)} />
            <Input label="Minimum Order Value" type="number" value={form.minOrderValue} onChange={(e) => setField('minOrderValue', e.target.value)} />
            <Input label="Return Window (days)" type="number" value={form.returnWindowDays} onChange={(e) => setField('returnWindowDays', e.target.value)} />
            <Input label="Default Shipping Fee" type="number" value={form.defaultFee} onChange={(e) => setField('defaultFee', e.target.value)} />
            <Input label="Free Shipping Threshold" type="number" value={form.freeShippingThreshold} onChange={(e) => setField('freeShippingThreshold', e.target.value)} />
            <Input label="Estimated Delivery Days" value={form.estimatedDays} onChange={(e) => setField('estimatedDays', e.target.value)} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="mb-4 font-semibold">Maintenance</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.taxEnabled} onChange={(e) => setField('taxEnabled', e.target.checked)} className="h-4 w-4 accent-primary" />
              Enable tax on orders
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.codEnabled} onChange={(e) => setField('codEnabled', e.target.checked)} className="h-4 w-4 accent-primary" />
              Enable Cash on Delivery
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.sellerApprovalRequired} onChange={(e) => setField('sellerApprovalRequired', e.target.checked)} className="h-4 w-4 accent-primary" />
              Require admin approval for new sellers
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.productApprovalRequired} onChange={(e) => setField('productApprovalRequired', e.target.checked)} className="h-4 w-4 accent-primary" />
              Require admin approval for new products
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.emailEnabled} onChange={(e) => setField('emailEnabled', e.target.checked)} className="h-4 w-4 accent-primary" />
              Enable transactional emails
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.maintenanceMode} onChange={(e) => setField('maintenanceMode', e.target.checked)} className="h-4 w-4 accent-primary" />
              Maintenance mode (temporarily hide storefront)
            </label>
            {form.maintenanceMode && (
              <Textarea label="Maintenance message" rows={2} value={form.maintenanceMessage} onChange={(e) => setField('maintenanceMessage', e.target.value)} />
            )}
          </div>
        </div>

        <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
          <Save className="mr-1 h-4 w-4" />Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
