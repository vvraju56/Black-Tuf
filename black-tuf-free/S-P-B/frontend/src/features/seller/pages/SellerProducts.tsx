import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchSellerProducts, deleteSellerProduct } from '@/lib/seller-api';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import { Package, Plus, Pencil, Trash2 } from 'lucide-react';
import { Product } from '@/types';

const productStatusVariant = (s: string) => {
  if (s === 'active') return 'success';
  if (s === 'inactive') return 'secondary';
  return 'outline';
};

const approvalVariant = (s: string) => {
  if (s === 'approved') return 'success';
  if (s === 'rejected') return 'danger';
  return 'warning';
};

export const SellerProducts = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['seller-products'], queryFn: fetchSellerProducts });
  const products = data?.products || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSellerProduct(id),
    onSuccess: () => {
      toast.success('Product deleted');
      qc.invalidateQueries({ queryKey: ['seller-products'] });
      qc.invalidateQueries({ queryKey: ['seller-stats'] });
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const handleDelete = (p: Product) => {
    if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(p._id);
    }
  };

  if (isLoading) return <div className="container mx-auto px-4 py-16">Loading products…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} product{products.length === 1 ? '' : 's'}</p>
        </div>
        <Link to="/seller/add-product"><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Product</Button></Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
          <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="mb-1 font-medium">No products yet</p>
          <p className="mb-4 text-sm text-muted-foreground">Add your first product to start selling on Black Tuf.</p>
          <Link to="/seller/add-product"><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Product</Button></Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5">
                <th className="p-3 text-left font-medium">Product</th>
                <th className="p-3 text-left font-medium">Price</th>
                <th className="p-3 text-left font-medium">Stock</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Approval</th>
                <th className="p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: Product) => (
                <tr key={p._id} className="border-t border-white/10">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="h-12 w-12 rounded-lg border border-white/10 object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="max-w-[240px] truncate font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku || p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{formatPrice(p.price)}</td>
                  <td className="p-3">
                    <span className={p.stock > 0 ? 'text-success' : 'text-danger'}>{p.stock}</span>
                  </td>
                  <td className="p-3"><Badge variant={productStatusVariant(p.status)}>{p.status}</Badge></td>
                  <td className="p-3"><Badge variant={approvalVariant(p.approvalStatus)}>{p.approvalStatus}</Badge></td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Link to={`/seller/products/${p._id}/edit`} title="Edit">
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="text-danger" title="Delete" loading={deleteMutation.isPending && deleteMutation.variables === p._id} onClick={() => handleDelete(p)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
