import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/ui/JsonLd';
import {
  ProductBody,
  ProductHero,
  RelatedProducts,
} from '@/components/products/ProductDetailSections';
import { ProductViewTracker } from '@/components/products/ProductViewTracker';
import { getAllProducts, getPublishedProduct } from '@/lib/api';
import {
  absoluteUrl,
  breadcrumbJsonLd,
  createMetadata,
  softwareApplicationJsonLd,
} from '@/lib/seo';

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);

  if (!product) {
    return createMetadata({
      title: 'Product not found',
      description: 'This product could not be found in the BlackTuf directory.',
      path: `/products/${slug}`,
      noIndex: true,
    });
  }

  const title = product.seoTitle || `${product.name}`;
  const description =
    product.seoDescription || product.shortDescription || `A BlackTuf Technologies product.`;
  const image = product.bannerImage || product.logo || '/og-image.png';

  return createMetadata({
    title,
    description,
    path: `/products/${product.slug}`,
    absoluteTitle: true,
    image: image.startsWith('http') ? image : absoluteUrl(image),
    keywords: [
      product.name,
      product.categoryName,
      ...product.technologies.map((technology) => technology.name),
      'BlackTuf',
    ],
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, products] = await Promise.all([getPublishedProduct(slug), getAllProducts()]);

  if (!product) notFound();

  return (
    <>
      <JsonLd
        data={[
          softwareApplicationJsonLd(product),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Products', path: '/products' },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
        ]}
      />
      <ProductViewTracker slug={product.slug} name={product.name} status={product.status} />
      <ProductHero product={product} />
      <ProductBody product={product} />
      <RelatedProducts products={products} currentSlug={product.slug} />
    </>
  );
}
