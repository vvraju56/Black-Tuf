import type { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './site';
import type { Product, SiteSettings } from './types';

interface SeoInput {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
  absoluteTitle?: boolean;
  keywords?: string[];
}

export function absoluteUrl(path = '/') {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function createMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = '/',
  image = '/og-image.png',
  type = 'website',
  noIndex = false,
  absoluteTitle = false,
  keywords,
}: SeoInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = image.startsWith('http') ? image : absoluteUrl(image);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${SITE_NAME} — ${title}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  };
}

export function organizationJsonLd(settings?: SiteSettings) {
  const sameAs = [
    settings?.socialWebsite,
    settings?.socialGithub,
    settings?.socialLinkedin,
  ].filter(Boolean) as string[];

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings?.companyName || SITE_NAME,
    alternateName: settings?.brandName || 'BlackTuf',
    url: SITE_URL,
    logo: absoluteUrl('/apple-icon.png'),
    description: settings?.description || SITE_DESCRIPTION,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: 'BlackTuf',
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function softwareApplicationJsonLd(product: Product) {
  const productUrl = absoluteUrl(`/products/${product.slug}`);
  const free = product.pricing?.type === 'Free';
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.seoDescription || product.shortDescription,
    url: product.websiteUrl || productUrl,
    applicationCategory: product.categoryName,
    ...(product.technologies.length
      ? { softwareRequirements: product.technologies.map((item) => item.name).join(', ') }
      : {}),
    ...(product.version ? { softwareVersion: product.version } : {}),
    ...(product.releaseDate ? { datePublished: product.releaseDate } : {}),
    ...(product.screenshots.length
      ? { screenshot: product.screenshots.map((shot) => shot.url) }
      : {}),
    ...(free
      ? {
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(product.logo ? { image: product.logo.startsWith('http') ? product.logo : absoluteUrl(product.logo) } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function itemListJsonLd(products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE_NAME} products`,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/products/${product.slug}`),
      name: product.name,
    })),
  };
}
