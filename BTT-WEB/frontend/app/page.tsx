import type { Metadata } from 'next';
import { CompanyIntro } from '@/components/home/CompanyIntro';
import { Hero } from '@/components/home/Hero';
import { FeaturedProducts, ProductDirectoryPreview, WhatWeBuild } from '@/components/home/ProductSections';
import {
  Capabilities,
  HomeCTA,
  LatestUpdates,
  WhyBlackTuf,
} from '@/components/home/Sections';
import { JsonLd } from '@/components/ui/JsonLd';
import { getAllProducts, getFeaturedProducts, getLatestUpdates, getServices, getSiteSettings } from '@/lib/api';
import { createMetadata, itemListJsonLd } from '@/lib/seo';
import { SITE_DESCRIPTION } from '@/lib/site';

export const metadata: Metadata = createMetadata({
  title: 'BlackTuf Technologies — Software, Products & Technology',
  description: SITE_DESCRIPTION,
  path: '/',
  absoluteTitle: true,
  keywords: [
    'BlackTuf',
    'BlackTuf Technologies',
    'software products',
    'technology company',
    'developer tools',
    'digital platforms',
  ],
});

export default async function HomePage() {
  const [products, featured, services, settings, updates] = await Promise.all([
    getAllProducts(),
    getFeaturedProducts(3),
    getServices(),
    getSiteSettings(),
    getLatestUpdates(4),
  ]);

  const featuredOrRecent = featured.length ? featured : products.slice(0, 3);

  return (
    <>
      <JsonLd data={itemListJsonLd(products)} />
      <Hero products={products} />
      {settings.business.showBusinessInfo ? <CompanyIntro settings={settings} /> : null}
      <FeaturedProducts products={featuredOrRecent} />
      <ProductDirectoryPreview products={products} />
      <WhatWeBuild services={services} />
      <Capabilities products={products} />
      <WhyBlackTuf />
      <LatestUpdates updates={updates} />
      <HomeCTA />
    </>
  );
}
