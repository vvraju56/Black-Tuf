import type { Metadata } from 'next';
import { JsonLd } from '@/components/ui/JsonLd';
import { PageHero } from '@/components/ui/PageHero';
import { ProductExplorer } from '@/components/products/ProductExplorer';
import { getAllProducts, getCategories } from '@/lib/api';
import { breadcrumbJsonLd, createMetadata, itemListJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Products',
  description:
    'Discover the software and technology products built by BlackTuf Technologies. Search, filter, and explore every product in one directory.',
  path: '/products',
  keywords: ['BlackTuf products', 'software products', 'developer tools', 'apps'],
});

type SortValue = 'featured' | 'newest' | 'oldest' | 'name';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [products, categories, params] = await Promise.all([
    getAllProducts(),
    getCategories(),
    searchParams,
  ]);

  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value || '';

  const search = first(params.search).slice(0, 120);
  const category = first(params.category).slice(0, 80);
  const status = first(params.status).slice(0, 40);
  const featured = first(params.featured) === 'true';
  const sortParam = first(params.sort);
  const sort: SortValue = ['featured', 'newest', 'oldest', 'name'].includes(sortParam)
    ? (sortParam as SortValue)
    : 'featured';

  return (
    <>
      <JsonLd
        data={[
          itemListJsonLd(products),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Products', path: '/products' },
          ]),
        ]}
      />
      <PageHero
        eyebrow="Our Products"
        title={
          <>
            Discover what we&apos;ve <span className="text-gradient">built.</span>
          </>
        }
        description="Discover the software and technology products built by BlackTuf Technologies."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Products' }]}
      />
      <section className="py-12 sm:py-16">
        <div className="container-page">
          <ProductExplorer
            products={products}
            categories={categories}
            initialSearch={search}
            initialCategory={category}
            initialStatus={status}
            initialFeatured={featured}
            initialSort={sort}
          />
        </div>
      </section>
    </>
  );
}
