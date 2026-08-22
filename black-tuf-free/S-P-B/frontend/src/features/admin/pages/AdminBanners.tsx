import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { listAdminBanners, createBanner, updateBanner, deleteBanner } from '@/lib/admin-api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { Image as ImageIcon, Plus, Pencil, Trash2, X } from 'lucide-react';

interface BannerForm {
  title: string;
  image: string;
  alt: string;
  link: string;
  order: string;
  active: boolean;
}

const emptyForm: BannerForm = { title: '', image: '', alt: '', link: '', order: '0', active: true };

export const AdminBanners = () => {
  const qc = useQueryClient();
  const { data: banners = [], isLoading } = useQuery({ queryKey: ['admin-banners'], queryFn: listAdminBanners });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-banners'] });

  const toPayload = (f: BannerForm) => ({
    title: f.title.trim(),
    image: f.image.trim(),
    alt: f.alt.trim(),
    link: f.link.trim(),
    order: parseInt(f.order, 10) || 0,
    active: f.active,
  });

  const saveMutation = useMutation({
    mutationFn: () => (editingId ? updateBanner(editingId, toPayload(form)) : createBanner(toPayload(form))),
    onSuccess: () => {
      toast.success(editingId ? 'Banner updated' : 'Banner created');
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      invalidate();
    },
    onError: () => toast.error(editingId ? 'Failed to update banner' : 'Failed to create banner'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: () => { toast.success('Banner deleted'); invalidate(); },
    onError: () => toast.error('Failed to delete banner'),
  });

  const startEdit = (b: any) => {
    setEditingId(b._id);
    setForm({
      title: b.title ?? '',
      image: b.image ?? '',
      alt: b.alt ?? '',
      link: b.link ?? '',
      order: b.order != null ? String(b.order) : '0',
      active: !!b.active,
    });
    setShowForm(true);
  };

  const handleDelete = (b: any) => {
    if (window.confirm(`Delete banner "${b.title}"?`)) deleteMutation.mutate(b._id);
  };

  const setField = (key: keyof BannerForm, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  if (isLoading) return <div className="container mx-auto py-16">Loading banners…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Banners</h1>
        </div>
        <Button size="sm" onClick={() => { setShowForm((v) => !v); setEditingId(null); if (!showForm) setForm(emptyForm); }}>
          {showForm ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
          {showForm ? 'Close' : 'New Banner'}
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="mb-4 font-semibold">{editingId ? 'Edit Banner' : 'Create Banner'}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Title" placeholder="Hero banner" value={form.title} onChange={(e) => setField('title', e.target.value)} />
            <Input label="Image URL" placeholder="https://…" value={form.image} onChange={(e) => setField('image', e.target.value)} />
            <Input label="Alt Text" placeholder="Accessibility text" value={form.alt} onChange={(e) => setField('alt', e.target.value)} />
            <Input label="Link" placeholder="/products" value={form.link} onChange={(e) => setField('link', e.target.value)} />
            <Input label="Order" type="number" placeholder="0" value={form.order} onChange={(e) => setField('order', e.target.value)} />
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setField('active', e.target.checked)} className="h-4 w-4 accent-primary" />
            Active
          </label>
          <div className="mt-4 flex gap-3">
            <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending} disabled={!form.title.trim() || !form.image.trim()}>Save</Button>
            <Button variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(banners as any[]).map((b) => (
          <div key={b._id} className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur">
            {b.image && <img src={b.image} alt={b.alt || b.title} className="h-36 w-full object-cover" />}
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-semibold">{b.title || 'Untitled'}</p>
                <Badge variant={b.active ? 'success' : 'secondary'}>{b.active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{b.link || 'No link'}</p>
              <p className="text-xs text-muted-foreground">Order: {b.order ?? 0}</p>
              <div className="mt-3 flex gap-1.5">
                <Button size="sm" variant="outline" onClick={() => startEdit(b)}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>
                <Button size="sm" variant="ghost" className="text-danger" onClick={() => handleDelete(b)}><Trash2 className="mr-1 h-3.5 w-3.5" />Delete</Button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-muted-foreground sm:col-span-2 lg:col-span-3">
            No banners found
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBanners;
