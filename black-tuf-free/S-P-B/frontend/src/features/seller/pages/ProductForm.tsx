import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createSellerProduct, updateSellerProduct, fetchSellerProducts } from '@/lib/seller-api';
import { fetchCategories } from '@/lib/products-api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'react-hot-toast';
import { Plus, X, Package } from 'lucide-react';
import { Category } from '@/types';

const emptyForm = {
  name: '',
  description: '',
  brand: '',
  category: '',
  price: '',
  compareAtPrice: '',
  stock: '',
  sku: '',
  tags: '',
  images: [''] as string[],
};

export const ProductForm = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState(emptyForm);

  const { data: sellerData } = useQuery({ queryKey: ['seller-products'], queryFn: fetchSellerProducts });
  const products = sellerData?.products || [];
  const product = isEdit ? products.find((p) => p._id === id) : undefined;

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        brand: product.brand || '',
        category: typeof product.category === 'string' ? product.category : product.category?._id || '',
        price: product.price != null ? String(product.price) : '',
        compareAtPrice: product.compareAtPrice != null ? String(product.compareAtPrice) : '',
        stock: product.stock != null ? String(product.stock) : '',
        sku: product.sku || '',
        tags: (product.tags || []).join(', '),
        images: product.images && product.images.length ? [...product.images] : [''],
      });
    }
  }, [product]);

  const set = (key: keyof typeof emptyForm, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const setImage = (i: number, value: string) => setForm((f) => ({ ...f, images: f.images.map((img, idx) => (idx === i ? value : img)) }));
  const addImage = () => setForm((f) => (f.images.length < 4 ? { ...f, images: [...f.images, ''] } : f));
  const removeImage = (i: number) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const mutation = useMutation({
    mutationFn: (payload: any) => (isEdit && id ? updateSellerProduct(id, payload) : createSellerProduct(payload)),
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated' : 'Product created');
      qc.invalidateQueries({ queryKey: ['seller-products'] });
      navigate('/seller/products');
    },
    onError: () => toast.error('Failed to save product'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name: form.name.trim(),
      description: form.description.trim(),
      brand: form.brand.trim(),
      category: form.category,
      price: Number(form.price) || 0,
      compareAtPrice: Number(form.compareAtPrice) || 0,
      stock: Number(form.stock) || 0,
      sku: form.sku.trim(),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      images: form.images.map((i) => i.trim()).filter(Boolean),
    });
  };

  const valid = !!form.name.trim() && !!form.category && form.price !== '' && form.stock !== '';

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
          <p className="text-sm text-muted-foreground">{isEdit ? 'Update your product listing.' : 'Create a new product listing.'}</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Product name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Wireless Bluetooth Earbuds" required />
          </div>
          <div className="sm:col-span-2">
            <Textarea label="Description" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe your product…" />
          </div>
          <Input label="Brand" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Black Tuf" />
          <Select label="Category" value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="Select a category">
            {categories.map((c: Category) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </Select>
          <Input label="Price (₹)" type="number" min={0} value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="0" required />
          <Input label="Compare-at price (₹)" type="number" min={0} value={form.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} placeholder="Optional" />
          <Input label="Stock" type="number" min={0} value={form.stock} onChange={(e) => set('stock', e.target.value)} placeholder="0" required />
          <Input label="SKU" value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="Optional" />
          <div className="sm:col-span-2">
            <Input label="Tags" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="Comma separated, e.g. wireless, audio, bluetooth" />
          </div>
        </div>

        <div>
          <p className="mb-1 block text-sm font-medium">Images</p>
          <div className="space-y-2">
            {form.images.map((img, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={img} onChange={(e) => setImage(i, e.target.value)} placeholder={`Image URL ${i + 1}`} />
                {form.images.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(i)}><X className="h-4 w-4" /></Button>
                )}
              </div>
            ))}
          </div>
          {form.images.length < 4 && (
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addImage}><Plus className="mr-1 h-4 w-4" /> Add image</Button>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending} disabled={!valid}>{isEdit ? 'Update Product' : 'Create Product'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/seller/products')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
