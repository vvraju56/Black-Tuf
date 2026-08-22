import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/lib/admin-api';
import { formatDate, formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toast } from 'react-hot-toast';
import { Ticket, Plus, Pencil, Trash2, X } from 'lucide-react';

interface CouponForm {
  code: string;
  type: string;
  value: string;
  minOrderAmount: string;
  maxDiscount: string;
  maxUses: string;
  validFrom: string;
  validUntil: string;
  scope: string;
  isActive: boolean;
}

const emptyForm: CouponForm = {
  code: '',
  type: 'percentage',
  value: '',
  minOrderAmount: '',
  maxDiscount: '',
  maxUses: '',
  validFrom: '',
  validUntil: '',
  scope: 'global',
  isActive: true,
};

const toPayload = (f: CouponForm) => ({
  code: f.code.trim(),
  type: f.type,
  value: parseFloat(f.value) || 0,
  minOrderValue: f.minOrderAmount ? parseFloat(f.minOrderAmount) : undefined,
  maxDiscount: f.maxDiscount ? parseFloat(f.maxDiscount) : undefined,
  usageLimit: f.maxUses ? parseInt(f.maxUses, 10) : undefined,
  startDate: f.validFrom ? new Date(f.validFrom).toISOString() : new Date().toISOString(),
  expiryDate: f.validUntil ? new Date(f.validUntil).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  scope: f.scope,
  isActive: f.isActive,
});

const toDateTimeLocal = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');

export const AdminCoupons = () => {
  const qc = useQueryClient();
  const { data: coupons = [], isLoading } = useQuery({ queryKey: ['admin-coupons'], queryFn: listCoupons });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
  };

  const saveMutation = useMutation({
    mutationFn: () => (editingId ? updateCoupon(editingId, toPayload(form)) : createCoupon(toPayload(form))),
    onSuccess: () => {
      toast.success(editingId ? 'Coupon updated' : 'Coupon created');
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      invalidate();
    },
    onError: () => toast.error(editingId ? 'Failed to update coupon' : 'Failed to create coupon'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: () => { toast.success('Coupon deleted'); invalidate(); },
    onError: () => toast.error('Failed to delete coupon'),
  });

  const startEdit = (c: any) => {
    setEditingId(c._id);
    setForm({
      code: c.code ?? '',
      type: c.type ?? 'percentage',
      value: c.value != null ? String(c.value) : '',
      minOrderAmount: c.minOrderValue != null ? String(c.minOrderValue) : '',
      maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : '',
      maxUses: c.usageLimit != null ? String(c.usageLimit) : '',
      validFrom: toDateTimeLocal(c.startDate),
      validUntil: toDateTimeLocal(c.expiryDate),
      scope: c.scope ?? 'global',
      isActive: !!c.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = (c: any) => {
    if (window.confirm(`Delete coupon "${c.code}"?`)) deleteMutation.mutate(c._id);
  };

  const setField = (key: keyof CouponForm, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  if (isLoading) return <div className="container mx-auto py-16">Loading coupons…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Ticket className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Coupons</h1>
        </div>
        <Button size="sm" onClick={() => { setShowForm((v) => !v); setEditingId(null); if (!showForm) setForm(emptyForm); }}>
          {showForm ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
          {showForm ? 'Close' : 'New Coupon'}
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="mb-4 font-semibold">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Code" placeholder="SUMMER10" value={form.code} onChange={(e) => setField('code', e.target.value)} />
            <Select label="Type" value={form.type} onChange={(e) => setField('type', e.target.value)}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </Select>
            <Input label="Value" type="number" placeholder={form.type === 'percentage' ? '10' : '100'} value={form.value} onChange={(e) => setField('value', e.target.value)} />
            <Input label="Min Order Amount" type="number" placeholder="0" value={form.minOrderAmount} onChange={(e) => setField('minOrderAmount', e.target.value)} />
            <Input label="Max Discount" type="number" placeholder="Optional" value={form.maxDiscount} onChange={(e) => setField('maxDiscount', e.target.value)} />
            <Input label="Max Uses" type="number" placeholder="Optional" value={form.maxUses} onChange={(e) => setField('maxUses', e.target.value)} />
            <Input label="Valid From" type="datetime-local" value={form.validFrom} onChange={(e) => setField('validFrom', e.target.value)} />
            <Input label="Valid Until" type="datetime-local" value={form.validUntil} onChange={(e) => setField('validUntil', e.target.value)} />
            <Input label="Scope" placeholder="global, seller, product, category…" value={form.scope} onChange={(e) => setField('scope', e.target.value)} />
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setField('isActive', e.target.checked)} className="h-4 w-4 accent-primary" />
            Active
          </label>
          <div className="mt-4 flex gap-3">
            <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending} disabled={!form.code.trim()}>Save</Button>
            <Button variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Min Order</th>
              <th className="px-4 py-3 font-medium">Usage</th>
              <th className="px-4 py-3 font-medium">Valid</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(coupons as any[]).map((c) => (
              <tr key={c._id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{c.code}</td>
                <td className="px-4 py-3 capitalize">{c.type}</td>
                <td className="px-4 py-3">{c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}</td>
                <td className="px-4 py-3">{formatPrice(c.minOrderValue || 0)}</td>
                <td className="px-4 py-3">{c.usedCount ?? 0}{c.usageLimit != null ? ` / ${c.usageLimit}` : ''}</td>
                <td className="px-4 py-3">
                  {c.startDate || c.expiryDate ? (
                    <span className="text-xs">
                      {c.startDate ? formatDate(c.startDate) : '…'} → {c.expiryDate ? formatDate(c.expiryDate) : '…'}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3"><Badge variant={c.isActive ? 'success' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => startEdit(c)}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>
                    <Button size="sm" variant="ghost" className="text-danger" onClick={() => handleDelete(c)}><Trash2 className="mr-1 h-3.5 w-3.5" />Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">No coupons found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCoupons;
