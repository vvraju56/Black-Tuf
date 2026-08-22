import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchAddresses, addAddress, updateAddress, setDefaultAddress, deleteAddress } from '@/lib/products-api';
import { Address } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { INDIAN_STATES } from '@/lib/constants';
import { TrashIcon, PencilIcon, StarIcon } from '@heroicons/react/24/outline';

interface AddressFormProps {
  initial?: Partial<Address>;
  onSubmit: (a: Partial<Address>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const AddressForm = ({ initial, onSubmit, onCancel, loading }: AddressFormProps) => {
  const [form, setForm] = useState({ fullName: initial?.fullName || '', phone: initial?.phone || '', addressLine1: initial?.addressLine1 || '', addressLine2: initial?.addressLine2 || '', city: initial?.city || '', state: initial?.state || '', postalCode: initial?.postalCode || '', country: initial?.country || 'India' });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <form onSubmit={async (e) => { e.preventDefault(); await onSubmit(form); }} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Input name="fullName" label="Name" value={form.fullName} onChange={handleChange} required />
      <Input name="phone" label="Phone" value={form.phone} onChange={handleChange} required />
      <Input name="addressLine1" label="Address" value={form.addressLine1} onChange={handleChange} required />
      <Input name="addressLine2" label="Line 2" value={form.addressLine2} onChange={handleChange} />
      <Input name="city" label="City" value={form.city} onChange={handleChange} required />
      <Select name="state" label="State" value={form.state} onChange={handleChange} placeholder="Select" required>
        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
      </Select>
      <Input name="postalCode" label="Postal Code" value={form.postalCode} onChange={handleChange} required />
      <Input name="country" label="Country" value={form.country} onChange={handleChange} required />
      <div className="sm:col-span-2 flex gap-2 pt-1">
        <Button type="submit" size="sm" loading={loading}>Save</Button>
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

export const Account = () => {
  const { user, updateUserProfile } = useAuth();
  const qc = useQueryClient();
  const { data: addresses = [], refetch } = useQuery({ queryKey: ['addresses'], queryFn: fetchAddresses, staleTime: 30000 });
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ['addresses'] });

  const handleAddressSubmit = async (addr: Partial<Address>) => {
    setSaving(true);
    try {
      if (editingId) await updateAddress(editingId, addr); else await addAddress({ ...addr, isDefault: addresses.length === 0 } as any);
      refetch(); setEditing(false); setEditingId(null);
    } finally { setSaving(false); }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = (e.target as any).name.value;
    const phone = (e.target as any).phone.value;
    await updateUserProfile({ name, phone });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-lg border p-4 text-center">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2563eb&color=fff`} alt={user?.name} className="mx-auto h-20 w-20 rounded-full object-cover" />
            <h2 className="mt-2 font-medium">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs capitalize">{user?.role}</p>
          </div>
          <div className="space-y-1 text-sm">
            <a href="#profile" className="block rounded py-1 hover:bg-muted px-2">Profile</a>
            <a href="#addresses" className="block rounded py-1 hover:bg-muted px-2">Addresses</a>
            <a href="/orders" className="block rounded py-1 hover:bg-muted px-2">Orders</a>
          </div>
        </div>
        <div className="md:col-span-2 space-y-8">
          <div id="profile" className="rounded-lg border p-4">
            <h2 className="font-medium mb-3">Profile</h2>
            <form onSubmit={saveProfile} className="grid gap-3 sm:grid-cols-2">
              <Input name="name" label="Name" defaultValue={user?.name} required />
              <Input name="phone" label="Phone" defaultValue={user?.phone || ''} />
              <div className="sm:col-span-2"><Button type="submit">Save profile</Button></div>
            </form>
          </div>

          <div id="addresses" className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium">Saved Addresses</h2>
              {!editing && <Button size="sm" variant="outline" onClick={() => { setEditing(true); setEditingId(null); }}><StarIcon className="h-4 w-4 mr-1" /> Add</Button>}
            </div>
            {editing && (
              <div className="mb-4 rounded-md border p-3">
                <AddressForm initial={editingId ? addresses.find((a) => a._id === editingId) : undefined} onSubmit={handleAddressSubmit} onCancel={() => { setEditing(false); setEditingId(null); }} loading={saving} />
              </div>
            )}
            {addresses.map((a) => (
              <div key={a._id} className="flex items-start justify-between border-b py-2">
                <div>
                  <div className="flex items-center gap-1"><strong>{a.fullName}</strong> {a.isDefault && <StarIcon className="h-3 w-3 text-amber-400" />}</div>
                  <p className="text-sm text-muted-foreground">{a.addressLine1}{a.addressLine2 && `, ${a.addressLine2}`}</p>
                  <p className="text-sm text-muted-foreground">{a.city}, {a.state} {a.postalCode}</p>
                  <p className="text-sm">{a.phone}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={async () => setDefaultAddress(a._id).then(refresh)} className="rounded p-1 hover:bg-muted" title="Default"><StarIcon className="h-4 w-4" /></button>
                  <button onClick={() => { setEditing(true); setEditingId(a._id); }} className="rounded p-1 hover:bg-muted" title="Edit"><PencilIcon className="h-4 w-4" /></button>
                  <button onClick={async () => { if (confirm('Delete this address?')) await deleteAddress(a._id).then(refresh); }} className="rounded p-1 hover:bg-muted text-danger" title="Delete"><TrashIcon className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
