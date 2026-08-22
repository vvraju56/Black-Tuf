import { useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchSellerProfile, updateSellerProfile } from '@/lib/seller-api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { toast } from 'react-hot-toast';
import { Store, Mail, Landmark, MapPin } from 'lucide-react';

const businessTypes = ['individual', 'sole_proprietorship', 'partnership', 'private_limited', 'llp', 'other'];

export const SellerProfile = () => {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ['seller-profile'], queryFn: fetchSellerProfile });

  const [form, setForm] = useState({
    storeName: '',
    storeDescription: '',
    businessType: 'individual',
    businessAddress: '',
    phone: '',
    taxId: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        storeName: profile.storeName || '',
        storeDescription: profile.storeDescription || '',
        businessType: profile.businessType || 'individual',
        businessAddress: profile.businessAddress || '',
        phone: profile.phone || '',
        taxId: profile.taxId || '',
      });
    }
  }, [profile]);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const saveMutation = useMutation({
    mutationFn: () =>
      updateSellerProfile({
        storeName: form.storeName,
        storeDescription: form.storeDescription,
        businessType: form.businessType,
        businessAddress: form.businessAddress,
        phone: form.phone,
        taxId: form.taxId,
      }),
    onSuccess: () => {
      toast.success('Profile updated');
      qc.invalidateQueries({ queryKey: ['seller-profile'] });
    },
    onError: () => toast.error('Failed to update profile'),
  });

  if (isLoading) return <div className="container mx-auto px-4 py-16">Loading profile…</div>;

  const bank = profile?.bankDetails || {};
  const bankLabel = bank.bankName || bank.accountHolderName || 'Bank';

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Seller Profile</h1>
      <p className="mb-6 text-sm text-muted-foreground">Manage your store details.</p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Mail className="h-5 w-5" /></div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Account email</p>
            <p className="truncate text-sm font-medium">{profile?.user?.email || profile?.email || 'N/A'}</p>
          </div>
        </div>
        {(bank.accountNumber || bank.ifscCode || bank.bankName) && (
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success"><Landmark className="h-5 w-5" /></div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Payout account</p>
              <p className="truncate text-sm font-medium">
                {bankLabel}
                {bank.accountNumber ? ` · ${String(bank.accountNumber).slice(-4).padStart(String(bank.accountNumber).length, '*')}` : ''}
              </p>
              {bank.ifscCode && <p className="truncate text-xs text-muted-foreground">{bank.ifscCode}</p>}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-5 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex items-center gap-2 text-primary">
          <Store className="h-5 w-5" />
          <h2 className="font-semibold">Store details</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Store name" value={form.storeName} onChange={(e) => set('storeName', e.target.value)} required />
          <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <div className="sm:col-span-2">
            <Textarea label="About / Description" rows={4} value={form.storeDescription} onChange={(e) => set('storeDescription', e.target.value)} placeholder="Tell customers about your store…" />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 text-primary">
          <MapPin className="h-5 w-5" />
          <h2 className="font-semibold">Business details</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Business type" value={form.businessType} onChange={(e) => set('businessType', e.target.value)}>
            {businessTypes.map((b) => <option key={b} value={b}>{b.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
          </Select>
          <Input label="GST / Tax ID" value={form.taxId} onChange={(e) => set('taxId', e.target.value)} />
          <div className="sm:col-span-2">
            <Input label="Business address" value={form.businessAddress} onChange={(e) => set('businessAddress', e.target.value)} placeholder="Full business address" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={saveMutation.isPending}>Save changes</Button>
        </div>
      </form>
    </div>
  );
};

export default SellerProfile;
