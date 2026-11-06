import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ProductStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string | Date | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
}

export const STATUS_STYLES: Record<ProductStatus, string> = {
  Active: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
  Beta: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
  'Coming Soon': 'border-accent/25 bg-accent/10 text-accent-soft',
  Maintenance: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  Archived: 'border-white/15 bg-white/5 text-ink-faint',
};

export const STATUS_DOT_STYLES: Record<ProductStatus, string> = {
  Active: 'bg-emerald-400',
  Beta: 'bg-sky-400',
  'Coming Soon': 'bg-accent',
  Maintenance: 'bg-amber-400',
  Archived: 'bg-ink-faint',
};

export function excerpt(value: string, length = 160) {
  if (value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}…`;
}

export function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export function safeExternalUrl(value: string) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}
