import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import { Product } from '@/types';

export const cn = (...inputs: (string | false | null | undefined)[]) => twMerge(clsx(inputs));

export const formatPrice = (price: number): string => {
  if (price === undefined || price === null || Number.isNaN(price)) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
};

export const calculateDiscount = (price: number, compareAtPrice?: number): number | null => {
  if (!compareAtPrice || compareAtPrice <= 0 || price >= compareAtPrice) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
};

export const getProductPrice = (product: Product): number => {
  return product.price || 0;
};

export const getCategoryUrl = (slug: string) => `/category/${slug}`;

export const getProductUrl = (slug: string) => `/product/${slug}`;

export const classNames = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(' ');

export const formatDate = (date: string) => dayjs(date).format('MMM D, YYYY');

export const formatDateTime = (date: string) => dayjs(date).format('MMM D, YYYY h:mm A');

export const timeAgo = (date: string) => {
  const d = dayjs(date);
  const now = dayjs();
  const diff = now.diff(d, 'second');
  if (diff < 60) return `${diff}s ago`;
  const m = now.diff(d, 'minute');
  if (m < 60) return `${m}m ago`;
  const h = now.diff(d, 'hour');
  if (h < 24) return `${h}h ago`;
  const day = now.diff(d, 'day');
  if (day < 7) return `${day}d ago`;
  return d.format('MMM D, YYYY');
};

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};
