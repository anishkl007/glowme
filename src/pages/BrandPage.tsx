import { useParams, Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Clock, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@project/components/ui/tabs';
import { getProducts, GetProductsOutputType, getStores, GetStoresOutputType } from 'zitejs/api';
import { Skeleton } from '@project/components/ui/skeleton';
import { useLang } from '@/lib/lang';
import ProductCard from '@/components/ProductCard';
import { useState, useEffect } from 'react';

export default function BrandPage() {
  const { id } = useParams();
  const { t } = useLang();
  const [seller, setSeller] = useState<GetStoresOutputType['stores'][0] | null | undefined>(undefined);
  const [following, setFollowing] = useState(false);
  const [brandProducts, setBrandProducts] = useState<GetProductsOutputType['products']>([]);

  useEffect(() => {
    if (!id) return;
    setSeller(undefined);
    getStores({ key: id }).then(r => setSeller(r.stores[0] ?? null)).catch(() => setSeller(null));
    getProducts({ brandId: id }).then(r => setBrandProducts(r.products));
  }, [id]);

  if (seller === undefined) return <div className="container mx-auto px-4 py-8 space-y-4"><Skeleton className="h-56 w-full rounded-xl" /><Skeleton className="h-8 w-64" /></div>;
  if (!seller) return <div className="container mx-auto px-4 py-20 text-center"><p className="text-lg font-semibold">Brand not found</p></div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-48 md:h-64">
        <img src={seller.image} alt={seller.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <Link to="/brands" className="absolute top-4 start-4 inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> {t('nav.brands')}
        </Link>
      </div>

      <div className="container mx-auto px-4">
        <div className="relative -mt-12 flex flex-col md:flex-row md:items-end gap-4 mb-8">
          <div className="h-20 w-20 rounded-2xl bg-card border-4 border-background flex items-center justify-center text-4xl shadow-md">
            {seller.logo}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl md:text-3xl font-bold">{seller.name}</h1>
              {seller.verified && <ShieldCheck className="h-5 w-5 text-amber-500" />}
            </div>
            <p className="text-muted-foreground text-sm mt-1">{seller.tagline}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {seller.area && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {seller.area}</span>}
              <span>{brandProducts.length} {t('cat.products')}</span>
              {seller.phone && <a href={`tel:${seller.phone}`} className="flex items-center gap-1 hover:text-foreground"><Phone className="h-4 w-4" /> {seller.phone}</a>}
            </div>
          </div>
          <Button onClick={() => setFollowing(!following)} variant={following ? 'secondary' : 'default'} className="self-start md:self-auto">
            {following ? t('brandsPage.following') : t('brandsPage.follow')}
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {seller.tags.map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full font-medium bg-secondary text-secondary-foreground">{tag}</span>
          ))}
        </div>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">{t('brand.products')} ({brandProducts.length})</TabsTrigger>
            <TabsTrigger value="about">{t('brand.about')}</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {brandProducts.map(p => <ProductCard key={p.id} product={p as any} />)}
            </div>
            {brandProducts.length === 0 && <p className="text-center text-muted-foreground py-12">No products listed yet.</p>}
          </TabsContent>

          <TabsContent value="about" className="mt-6 max-w-2xl">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">{t('brand.location')}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-4 w-4" /> {seller.area}, Kuwait</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('brand.storeHours')}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1"><Clock className="h-4 w-4" /> Sat–Thu: 10:00 AM – 10:00 PM</p>
                  <p className="ps-5">Fri: 2:00 PM – 10:00 PM</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('nav.categories')}</h3>
                <div className="flex gap-2">{seller.categories.map(c => <span key={c} className="text-xs px-3 py-1 rounded-full bg-muted">{c}</span>)}</div>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
