import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchCategories } from '@/lib/products-api';
import { ProductCard } from '@/components/common/ProductCard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ProductsParams } from '@/lib/products-api';
import { Product, Pagination } from '@/types';

interface ProductsResult { products: Product[]; pagination: Pagination }

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const query = useMemo(() => {
    const p: ProductsParams = {};
    const q = searchParams.get('q'); if (q) p.q = q;
    const cat = searchParams.get('category'); if (cat) p.category = cat;
    const sub = searchParams.get('subcategory'); if (sub) p.subcategory = sub;
    const brand = searchParams.get('brand'); if (brand) p.brand = brand;
    const seller = searchParams.get('seller'); if (seller) p.seller = seller;
    p.page = Number(searchParams.get('page')) || 1;
    p.limit = Number(searchParams.get('limit')) || 12;
    p.sort = searchParams.get('sort') || 'createdAt';
    p.order = (searchParams.get('order') as 'asc' | 'desc') || 'desc';
    const min = searchParams.get('minPrice'); if (min) p.minPrice = Number(min);
    const max = searchParams.get('maxPrice'); if (max) p.maxPrice = Number(max);
    const rating = searchParams.get('rating'); if (rating) p.rating = Number(rating);
    const instock = searchParams.get('inStock'); if (instock === 'true') p.inStock = true;
    const disc = searchParams.get('discount'); if (disc === 'true') p.discount = true;
    return p;
  }, [searchParams]);

  const { data: result, isLoading, isError } = useQuery<ProductsResult>({
    queryKey: ['products', query],
    queryFn: () => fetchProducts(query),
    placeholderData: { products: [], pagination: { page: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false, limit: 12 } },
    staleTime: 60000,
  });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories, staleTime: 600000 });

  const products = result?.products || [];
  const pagination = result?.pagination;

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  const removeFilter = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
  };

  const activeFilters = Object.fromEntries(searchParams.entries());

  const sortOptions = [
    { value: 'createdAt|desc', label: 'Newest' },
    { value: 'price|asc', label: 'Price: Low to High' },
    { value: 'price|desc', label: 'Price: High to Low' },
    { value: 'ratings|desc', label: 'Top Rated' },
    { value: 'discount|desc', label: 'Best Discount' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Products</h1>
        <button className="md:hidden" onClick={() => setMobileFiltersOpen(true)}>
          <FunnelIcon className="h-6 w-6" />
        </button>
      </div>

      {Object.keys(activeFilters).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, val]) => (
            <span key={key} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
              {key}: {val}
              <button onClick={() => removeFilter(key)} className="hover:text-danger">
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 flex gap-6">
        <aside className="hidden w-64 shrink-0 md:block">
        <Filters
          categories={categories}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          updateParam={updateParam}
          removeFilter={removeFilter}
        />
        </aside>
        <main className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{pagination?.total || 0} products</p>
            <Select
              value={`${searchParams.get('sort') || 'createdAt'}|${searchParams.get('order') || 'desc'}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('|');
                setSearchParams({ sort, order });
              }}
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          {isLoading ? (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <p className="mt-6 text-center text-muted-foreground">Failed to load products.</p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
          {pagination && (
            <div className="mt-8 flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={!pagination.hasPrev} onClick={() => updateParam('page', String(pagination.page - 1))}>Prev</Button>
              <span className="text-sm">Page {pagination.page} of {pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => updateParam('page', String(pagination.page + 1))}>Next</Button>
            </div>
          )}
        </main>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur" onClick={() => setMobileFiltersOpen(false)}>
          <div className="h-full w-72 overflow-y-auto p-4 shadow-lg bg-background" onClick={(e) => e.stopPropagation()}>
            <Filters
              categories={categories}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              updateParam={updateParam}
              removeFilter={removeFilter}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface FiltersProps {
  categories: any[];
  searchParams: any;
  setSearchParams: (params: any) => void;
  updateParam: (key: string, value: string) => void;
  removeFilter: (key: string) => void;
}

const Filters = ({ categories, searchParams, setSearchParams, updateParam, removeFilter }: FiltersProps) => {
  const priceRanges = [{ label: 'Under ₹500', max: 500 }, { label: '₹500 - ₹1000', min: 500, max: 1000 }, { label: '₹1000 - ₹2000', min: 1000, max: 2000 }, { label: 'Above ₹2000', min: 2000 }];
  const ratings = [4, 3, 2, 1];
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">Categories</h3>
        <ul className="space-y-1 text-sm">
          {categories.map((c) => (
            <li key={c._id}>
              <button
                className={`block w-full text-left rounded py-1 px-2 ${c.slug === searchParams.get('category') ? 'bg-primary/10 font-medium' : 'hover:bg-muted'}`}
                onClick={() => updateParam('category', c.slug)}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-medium mb-2">Price</h3>
        <div className="space-y-1">
          {priceRanges.map((r) => (
            <button
              key={r.label}
              className="text-sm"
              onClick={() => {
                updateParam('minPrice', String(r.min || ''));
                updateParam('maxPrice', String(r.max || ''));
              }}
            >{r.label}</button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-medium mb-2">Rating</h3>
        <div className="space-y-1">
          {ratings.map((r) => (
            <button key={r} className="text-sm" onClick={() => updateParam('rating', String(r))}>{r}+ stars</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="inStock" checked={searchParams.get('inStock') === 'true'} onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')} />
        <label htmlFor="inStock" className="text-sm">In stock only</label>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="discount" checked={searchParams.get('discount') === 'true'} onChange={(e) => updateParam('discount', e.target.checked ? 'true' : '')} />
        <label htmlFor="discount" className="text-sm">On discount</label>
      </div>
      <Button variant="ghost" size="sm" onClick={() => { const keep: any = { sort: searchParams.get('sort') || 'createdAt', order: searchParams.get('order') || 'desc' }; setSearchParams(keep); }}>Reset filters</Button>
    </div>
  );
};

export default Products;
