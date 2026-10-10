import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/lib/wishlist';
import { useLang } from '@/lib/lang';

export default function WishlistPage() {
  const { items } = useWishlist();
  const { lang } = useLang();
  const ar = lang === 'ar';

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-7 w-7 text-accent fill-accent" />
        <h1 className="font-display text-3xl font-bold">{ar ? 'المفضلة' : 'My Favorites'}</h1>
        <span className="text-muted-foreground text-sm">({items.length})</span>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="font-medium mb-1">{ar ? 'قائمة المفضلة فارغة' : 'Your favorites list is empty'}</p>
          <p className="text-sm text-muted-foreground mb-6">{ar ? 'اضغطي على القلب لحفظ المنتجات' : 'Tap the heart on any product to save it here'}</p>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to="/discover">{ar ? 'تسوقي الآن' : 'Discover products'}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
