import { cache } from 'react';
import type {
  Category,
  Product,
  ProductUpdate,
  Service,
  SiteSettings,
} from './types';
import { DEFAULT_SETTINGS } from './site';

const API_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000'
).replace(/\/$/, '');

const REVALIDATE_SECONDS = 60;

type ApiEnvelope<T> = { success: boolean; data: T };

async function apiGet<T>(path: string, revalidate = REVALIDATE_SECONDS): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as ApiEnvelope<T>;
    if (!payload?.success) return null;
    return payload.data;
  } catch {
    // The public site degrades to empty states if the API is unreachable.
    return null;
  }
}

export const getAllProducts = cache(async (): Promise<Product[]> => {
  return (await apiGet<Product[]>('/api/products?sort=featured')) ?? [];
});

export const getPublishedProduct = cache(async (slug: string): Promise<Product | null> => {
  return apiGet<Product>(`/api/products/${encodeURIComponent(slug)}`);
});

export const getFeaturedProducts = cache(async (limit = 3): Promise<Product[]> => {
  const products = (await apiGet<Product[]>('/api/products?featured=true&sort=featured')) ?? [];
  return products.slice(0, limit);
});

export const getCategories = cache(async (): Promise<Category[]> => {
  return (await apiGet<Category[]>('/api/categories')) ?? [];
});

export const getServices = cache(async (): Promise<Service[]> => {
  return (await apiGet<Service[]>('/api/services')) ?? [];
});

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const settings = await apiGet<SiteSettings>('/api/settings');
  return settings ?? DEFAULT_SETTINGS;
});

export async function getProductSlugs(): Promise<Product[]> {
  const products = await getAllProducts();
  return products.map((product) => ({
    ...product,
    updatedAt: product.updatedAt,
  }));
}

/** Real changelog entries if configured, otherwise recently added products. */
export async function getLatestUpdates(limit = 4): Promise<ProductUpdate[]> {
  const products = await getAllProducts();
  const entries: ProductUpdate[] = [];

  for (const product of products) {
    if (product.changelog.length) {
      for (const entry of product.changelog) {
        entries.push({
          id: `${product.id}-${entry.id}`,
          productName: product.name,
          productSlug: product.slug,
          version: entry.version,
          releaseDate: entry.releaseDate,
          notes: entry.notes,
          createdAt: product.updatedAt,
          isChangelog: true,
        });
      }
    }
  }

  if (entries.length) {
    return entries
      .sort((a, b) => (b.releaseDate || b.createdAt).localeCompare(a.releaseDate || a.createdAt))
      .slice(0, limit);
  }

  return products.slice(0, limit).map((product) => ({
    id: product.id,
    productName: product.name,
    productSlug: product.slug,
    version: product.version,
    releaseDate: product.releaseDate,
    notes: [],
    createdAt: product.createdAt,
    isChangelog: false,
  }));
}

export function clearProductCacheHint() {
  return REVALIDATE_SECONDS;
}
