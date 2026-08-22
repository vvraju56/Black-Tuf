import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const RatingStars = ({ rating, reviewCount, size = 'sm', showCount = false, className }: RatingStarsProps) => {
  const stars = Math.min(5, Math.max(0, Math.round(rating)));
  const iconSize = size === 'lg' ? 5 : size === 'md' ? 4 : 4;
  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < stars ? (
              <StarIcon className={`h-${iconSize} w-${iconSize} text-amber-400`} />
            ) : (
              <StarOutlineIcon className={`h-${iconSize} w-${iconSize} text-gray-300`} />
            )}
          </span>
        ))}
      </div>
      {showCount && reviewCount !== undefined && <span className="ml-2 text-xs text-muted-foreground">({reviewCount})</span>}
    </div>
  );
};
