import type { ProductStatus } from '@/lib/types';
import { cn, STATUS_DOT_STYLES, STATUS_STYLES } from '@/lib/utils';

export function StatusBadge({
  status,
  className,
  dot = true,
}: {
  status: ProductStatus;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span className={cn('badge', STATUS_STYLES[status], className)}>
      {dot ? (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', STATUS_DOT_STYLES[status])}
          aria-hidden
        />
      ) : null}
      {status}
    </span>
  );
}
