import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/products-api';
import { ProductCard } from '@/components/common/ProductCard';
import { Input } from '@/components/ui/Input';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const Search = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  const { data: result, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => fetchProducts(query ? { q: query, limit: 20 } : { limit: 0 }),
    enabled: !!query,
    staleTime: 30000,
  });

  const products = result?.products || [];
  const suggestions = [];

  return (
    <div className="container mx-auto py-8 px-4">
      <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/search?q=${encodeURIComponent(query)}`; }} className="relative max-w-2xl mx-auto">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, brands, categories..." className="pl-10" />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </form>

      {query ? (
        <>
          {isLoading ? (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-3">{products.length} results</p>
              {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No products found.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="mt-8">
          <h2 className="font-medium">Try searching for products like "phone", "laptop", "shirt"</h2>
        </div>
      )}
    </div>
  );
};

export default Search;
