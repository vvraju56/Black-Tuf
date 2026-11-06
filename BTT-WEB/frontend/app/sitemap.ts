import type { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/api';
import { DOC_PAGES } from '@/lib/docs';
import { SITE_URL } from '@/lib/site';

const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/products', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/docs', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/support', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
    changeFrequency: 'monthly',
    priority: product.featured ? 0.9 : 0.8,
  }));

  const docEntries: MetadataRoute.Sitemap = DOC_PAGES.map((page) => ({
    url: `${SITE_URL}/docs/${page.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticEntries, ...productEntries, ...docEntries];
}
