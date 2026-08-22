import { Product } from '@/types';
import { Link } from 'react-router-dom';
import { RatingStars } from '@/components/common/RatingStars';
import { formatPrice, calculateDiscount, getProductUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const ProductCard = ({ product, compact = false }: ProductCardProps) => {
  const price = product.price;
  const discount = calculateDiscount(price, product.compareAtPrice);
  const mainImage = product.images?.[0] || '/placeholder.png';

  return (
    <Link to={getProductUrl(product.slug)} className="group block bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
        <img src={mainImage} alt={product.name} className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform" loading="lazy" />
        {discount !== null && <Badge className="absolute top-2 right-2" variant="danger">-{discount}%</Badge>}
        {product.isFlashSale && <Badge className="absolute top-2 left-2" variant="warning">Flash Sale</Badge>}
        {product.stock === 0 && <Badge className="absolute bottom-2 right-2" variant="secondary">Out of stock</Badge>}
      </div>
      <div className={`p-${compact ? '3' : '4'}`}>
        <p className="text-xs text-muted-foreground uppercase">{product.brand}</p>
        <h3 className={`font-medium ${compact ? 'text-sm' : 'text-base'} line-clamp-1`}>{product.name}</h3>
        <div className="mt-1 flex items-center">
          <span className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>{formatPrice(price)}</span>
          {product.compareAtPrice && product.compareAtPrice > price && (
            <span className="ml-2 text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
        {!compact && (
          <div className="mt-2 flex items-center">
            <RatingStars rating={product.ratings} size="sm" />
            <span className="ml-2 text-xs text-muted-foreground">{product.reviewCount} reviews</span>
          </div>
        )}
        {!compact && product.seller && typeof product.seller === 'object' && (
          <p className="mt-1 text-xs text-muted-foreground">Sold by {product.seller.storeName}</p>
        )}
      </div>
    </Link>
  );
};
