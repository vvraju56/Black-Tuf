'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export function ProductViewTracker({
  slug,
  name,
  status,
}: {
  slug: string;
  name: string;
  status: string;
}) {
  useEffect(() => {
    trackEvent('product_view', { product: slug, name, status });
  }, [slug, name, status]);

  return null;
}
