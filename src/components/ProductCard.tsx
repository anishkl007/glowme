import { Link } from 'react-router-dom';
import { Heart, MapPin, Truck, Store } from 'lucide-react';
import { Badge } from '@project/components/ui/badge';
import type { Product } from '@/data/sampleData';
import { formatPrice } from '@/data/sampleData';
import { useLang } from '@/lib/lang';
import { useState } from 'react';
import { toast } from 'sonner';
import { useWishlist } from '@/lib/wishlist';

export default function ProductCard({ product }: { product: Product }) {
  const { isLiked, toggle } = useWishlist();
  const liked = isLiked(product.id);
  const [selectedShade, setSelectedShade] = useState(0);
  const { t } = useLang();

  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-border/50">
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.originalPrice && (
          <Badge className="absolute top-3 start-3 bg-accent text-accent-foreground text-xs font-bold">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </Badge>
        )}
        <button
          onClick={e => { e.preventDefault(); toggle(product); toast(liked ? 'Removed from favorites' : 'Saved to favorites'); }}
          className="absolute top-3 end-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-accent text-accent' : 'text-foreground'}`} />
        </button>
        <div className="absolute bottom-3 start-3 end-3 flex gap-1.5 flex-wrap">
          {product.pickupAvailable && (
            <span className="flex items-center gap-1 text-[10px] font-medium bg-background/90 backdrop-blur px-2 py-1 rounded-full">
              <Store className="h-3 w-3" /> {t('product.pickup')}
            </span>
          )}
          {product.sameDayDelivery && (
            <span className="flex items-center gap-1 text-[10px] font-medium bg-background/90 backdrop-blur px-2 py-1 rounded-full">
              <Truck className="h-3 w-3" /> {t('product.sameDay')}
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
          <MapPin className="h-3 w-3" />
          <span>{product.distance}</span>
          <span className="mx-1">·</span>
          <Link to={`/brand/${product.brandId}`} className="hover:text-accent">{product.brand}</Link>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm leading-tight mb-2 group-hover:text-accent transition-colors">{product.name}</h3>
        </Link>

        {product.shades.length > 0 && (
          <div className="flex items-center gap-1 mb-2.5">
            {product.shades.map((s, i) => (
              <button
                key={s.name}
                onClick={() => setSelectedShade(i)}
                className={`h-5 w-5 rounded-full border-2 transition-all ${i === selectedShade ? 'border-foreground scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: s.hex }}
                title={s.name}
              />
            ))}
            {product.shades.length > 5 && (
              <span className="text-[10px] text-muted-foreground ms-1">+{product.shades.length - 5}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-amber-500">★</span>
            <span className="font-medium">{product.rating}</span>
            <span>({product.reviewCount})</span>
          </div>
        </div>

        {product.tags.length > 0 && (
          <div className="flex gap-1 mt-2.5 flex-wrap">
            {product.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  tag === 'Clean Beauty' || tag === 'Vegan'
                    ? 'bg-emerald-50 text-emerald-700'
                    : tag === 'Cruelty-Free'
                    ? 'bg-pink-50 text-pink-700'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
