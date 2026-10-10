import { whatsappLink, WhatsAppIcon } from '@/components/WhatsApp';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ShieldCheck, Store, Truck, Heart, Star, ShoppingBag } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Skeleton } from '@project/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@project/components/ui/tabs';
import { sellers, formatPrice } from '@/data/sampleData';
import { getProduct, GetProductOutputType, getProducts, GetProductsOutputType } from 'zitejs/api';
import { useLang } from '@/lib/lang';
import { useCart } from '@/lib/cart';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type ProductType = NonNullable<GetProductOutputType['product']>;

export default function ProductPage() {
  const { id } = useParams();
  const { t } = useLang();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [related, setRelated] = useState<GetProductsOutputType['products']>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShade, setSelectedShade] = useState(0);
  const [liked, setLiked] = useState(false);
  const [stats, setStats] = useState<{ avg: number; count: number } | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setSelectedShade(0);
    setStats(null);
    getProduct({ id }).then(r => {
      setProduct(r.product);
      if (r.product) {
        getProducts({}).then(pr => {
          setRelated(pr.products.filter(p => p.id !== id && (p.category === r.product!.category || p.brandId === r.product!.brandId)).slice(0, 4));
        });
      }
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4"><Skeleton className="h-10 w-3/4" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-12 w-full" /></div>
      </div>
    </div>
  );

  if (!product) return <div className="container mx-auto px-4 py-20 text-center"><p className="text-lg font-semibold">Product not found</p></div>;

  const rating = stats && stats.count > 0 ? stats.avg : product.rating;
  const reviewCount = stats ? stats.count : product.reviewCount;
  const seller = sellers.find(s => s.id === product.brandId);

  const handleAddToCart = () => {
    addItem(product as any, product.shades[selectedShade]?.name);
    toast.success(t('pd.added'));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Link to="/discover" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> {t('nav.discover')}
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            {product.originalPrice && (
              <Badge className="absolute top-4 start-4 bg-accent text-accent-foreground font-bold">{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF</Badge>
            )}
            <button onClick={() => setLiked(!liked)} className="absolute top-4 end-4 h-10 w-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
              <Heart className={`h-5 w-5 ${liked ? 'fill-accent text-accent' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col">
            <div className="flex gap-2 flex-wrap mb-2">
              {product.tags.map(tag => (
                <span key={tag} className={`text-xs px-2.5 py-1 rounded-full font-medium ${tag === 'Clean Beauty' || tag === 'Vegan' ? 'bg-emerald-50 text-emerald-700' : tag === 'Cruelty-Free' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>{tag}</span>
              ))}
            </div>

            <Link to={`/brand/${product.brandId}`} className="text-sm text-muted-foreground hover:text-accent">{product.brand}</Link>
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">{product.name}</h1>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-current' : ''}`} />)}
              </div>
              <span className="text-sm font-medium">{rating}</span>
              <span className="text-sm text-muted-foreground">({reviewCount} {t('pd.reviews')})</span>
            </div>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
              {product.originalPrice && <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>}
            </div>

            {product.shades.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">{t('pd.selectShade')}: <span className="text-muted-foreground">{product.shades[selectedShade]?.name}</span></p>
                <div className="flex gap-2 flex-wrap">
                  {product.shades.map((s, i) => (
                    <button key={s.name} onClick={() => setSelectedShade(i)}
                      className={`h-10 w-10 rounded-full border-2 transition-all ${i === selectedShade ? 'border-foreground scale-110 ring-2 ring-offset-2 ring-foreground/20' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: s.hex }} title={s.name} />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-3 text-sm text-muted-foreground">
              {product.pickupAvailable && <span className="flex items-center gap-1"><Store className="h-4 w-4" /> {t('product.pickup')}</span>}
              {product.sameDayDelivery && <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> {t('product.sameDay')}</span>}
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {product.distance}</span>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleAddToCart} className="flex-1 h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                <ShoppingBag className="h-4 w-4 me-2" /> {t('pd.addToCart')}
              </Button>
              <Button asChild variant="outline" className="flex-1 h-12 font-semibold border-[#25D366] text-[#128C7E]">
                <a href={whatsappLink(`Hi GlowMe! I'd like to order:\n${product.name} (${product.brand})${product.shades[selectedShade] ? `\nShade: ${product.shades[selectedShade].name}` : ''}\nPrice: ${product.price} KD\n${window.location.href}`)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="h-4 w-4 me-2" /> Order on WhatsApp
                </a>
              </Button>
            </div>

            <span className="text-sm mt-3 text-emerald-600 font-medium">{product.inStock ? `✓ ${t('pd.inStock')}` : t('pd.outOfStock')}</span>

            {seller && (
              <Link to={`/brand/${seller.id}`} className="mt-6 p-4 rounded-xl border border-border bg-card flex items-center gap-4 hover:shadow-sm transition-shadow">
                <span className="text-3xl">{seller.logo}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm">{seller.name}</span>
                    {seller.verified && <ShieldCheck className="h-4 w-4 text-amber-500" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{seller.area} · {seller.distance}</span>
                </div>
                <span className="text-sm font-medium text-accent">{t('pd.visitStore')} →</span>
              </Link>
            )}
          </div>
        </div>

        <Tabs defaultValue="reviews" className="mt-12">
          <TabsList>
            <TabsTrigger value="reviews">{t('pd.reviews')} ({reviewCount})</TabsTrigger>
            <TabsTrigger value="description">{t('pd.description')}</TabsTrigger>
          </TabsList>
          <TabsContent value="reviews" className="mt-6">
            <ProductReviews productId={product.id} onStats={(avg, count) => setStats({ avg, count })} />
          </TabsContent>
          <TabsContent value="description" className="mt-6 max-w-2xl">
            <p className="text-sm leading-relaxed text-foreground/80">
              Premium quality {product.category.toLowerCase()} product by {product.brand}. {product.shades.length > 0 ? `Available in ${product.shades.length} beautiful shades.` : ''} {product.tags.join(', ')}. Perfect for {product.skinTypes?.join(', ') || 'all'} skin types.
            </p>
          </TabsContent>
        </Tabs>

        {related.length > 0 && (
          <section className="mt-16 mb-8">
            <h2 className="font-display text-2xl font-bold mb-6">{t('pd.alsoLike')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p.id} product={p as any} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
