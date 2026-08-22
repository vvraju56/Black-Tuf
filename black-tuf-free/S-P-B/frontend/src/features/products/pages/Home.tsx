import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, fetchProducts } from '@/lib/products-api';
import { CategoryCard } from '@/components/common/CategoryCard';
import { ProductCard } from '@/components/common/ProductCard';
import { Carousel } from '@/components/common/Carousel';
import { Product, Pagination, Category } from '@/types';

interface ProductsResult { products: Product[]; pagination: Pagination }

export const Home = () => {
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ['categories'], queryFn: fetchCategories, staleTime: 600000 });
  const { data: featured, isLoading } = useQuery<ProductsResult>({
    queryKey: ['products-featured'],
    queryFn: () => fetchProducts({ isFeatured: true, limit: 8 }),
    staleTime: 60000,
  });
  const { data: flash } = useQuery<ProductsResult>({
    queryKey: ['products-flash'],
    queryFn: () => fetchProducts({ isFlashSale: true, limit: 8 }),
    staleTime: 60000,
  });

  const featuredProducts = featured?.products || [];
  const flashProducts = flash?.products || [];

  return (
    <div className="space-y-12 pb-16">
      <Carousel />
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Shop by Category</h2>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline">See all</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.slice(0, 12).map((c) => (
            <CategoryCard key={c._id} category={c} compact />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Flash Sale</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {flashProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline">See all</Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
