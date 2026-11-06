'use client';

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Send a lightweight, non-personal analytics event.
 * Analytics is entirely optional and only runs when an ID is configured.
 */
export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_ANALYTICS_ID) return;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params);
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...params });
  } catch {
    // Analytics must never break the interface.
  }
}
