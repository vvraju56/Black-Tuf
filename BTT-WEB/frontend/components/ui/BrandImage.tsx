import Image from 'next/image';
import { cn } from '@/lib/utils';

const OPTIMIZABLE_HOSTS = new Set(['res.cloudinary.com', 'images.unsplash.com']);

function canOptimize(src: string) {
  if (src.startsWith('/')) return true;
  try {
    const url = new URL(src);
    return url.protocol === 'https:' && OPTIMIZABLE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function BrandImage({
  src,
  alt,
  className,
  width = 512,
  height = 512,
  sizes,
  priority = false,
  fill = false,
  unoptimized = false,
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  unoptimized?: boolean;
}) {
  if (!src) return null;

  if (!canOptimize(src) || unoptimized) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={cn('absolute inset-0 h-full w-full object-cover', className)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
        className={className}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
