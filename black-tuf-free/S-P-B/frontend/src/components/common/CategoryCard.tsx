import { Category } from '@/types';
import { Link } from 'react-router-dom';
import { getCategoryUrl } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  compact?: boolean;
}

export const CategoryCard = ({ category, compact = false }: CategoryCardProps) => {
  const icon = category.icon || '📦';
  const img = category.image;
  return (
    <Link
      to={getCategoryUrl(category.slug)}
      className={`flex flex-col items-center justify-center text-decoration-none text-center p-${compact ? '2' : '4'} rounded-lg border bg-card hover:shadow-md transition-shadow group`}
    >
      {img ? (
        <div className={`rounded-full overflow-hidden bg-muted ${compact ? 'w-12 h-12' : 'w-20 h-20'}`}>
          <img src={img} alt={category.name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className={`flex items-center justify-center rounded-full bg-primary/10 text-primary ${compact ? 'w-12 h-12 text-2xl' : 'w-20 h-20 text-4xl'}`}>{icon}</div>
      )}
      <span className={`mt-${compact ? '1' : '2'} text-sm font-medium ${compact ? 'text-xs' : ''}`}>{category.name}</span>
      {category.productCount !== undefined && (
        <span className="mt-1 text-xs text-muted-foreground">{category.productCount} items</span>
      )}
    </Link>
  );
};
