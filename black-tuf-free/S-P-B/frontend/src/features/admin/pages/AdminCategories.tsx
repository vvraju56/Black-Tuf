import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { listAdminCategories, createCategory } from '@/lib/admin-api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'react-hot-toast';
import { LayoutGrid, Plus, X } from 'lucide-react';

export const AdminCategories = () => {
  const qc = useQueryClient();
  const { data: categories = [], isLoading } = useQuery({ queryKey: ['admin-categories'], queryFn: listAdminCategories });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parent, setParent] = useState('');
  const [order, setOrder] = useState('0');

  const createMutation = useMutation({
    mutationFn: () =>
      createCategory({
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        parent: parent || undefined,
        order: parseInt(order, 10) || 0,
      }),
    onSuccess: () => {
      toast.success('Category created');
      setShowForm(false);
      setName(''); setSlug(''); setDescription(''); setParent(''); setOrder('0');
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: () => toast.error('Failed to create category'),
  });

  const topLevel = (categories as any[]).filter((c) => c.level === 0 || !c.parent);

  if (isLoading) return <div className="container mx-auto py-16">Loading categories…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Categories</h1>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
          {showForm ? 'Close' : 'New Category'}
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="mb-4 font-semibold">Create Category</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" placeholder="Electronics" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Slug (optional)" placeholder="electronics" value={slug} onChange={(e) => setSlug(e.target.value)} />
            <Select label="Parent (optional)" value={parent} onChange={(e) => setParent(e.target.value)}>
              <option value="">None (top-level)</option>
              {topLevel.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
            <Input label="Order" type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
            <div className="sm:col-span-2">
              <Textarea label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!name.trim()}>Create</Button>
            <Button variant="ghost" onClick={() => { setShowForm(false); setName(''); setSlug(''); setDescription(''); setParent(''); setOrder('0'); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Level</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Products</th>
            </tr>
          </thead>
          <tbody>
            {(categories as any[]).map((c) => (
              <tr key={c._id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.slug || '—'}</td>
                <td className="px-4 py-3">{c.level ?? 0}</td>
                <td className="px-4 py-3">{c.order ?? 0}</td>
                <td className="px-4 py-3"><Badge variant={c.isActive ? 'success' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></td>
                <td className="px-4 py-3">{c.productCount ?? 0}</td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No categories found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;
