import { Clock, Zap } from 'lucide-react';
import { deals, formatPrice } from '@/data/sampleData';
import { getProducts, GetProductsOutputType } from 'zitejs/api';
import { useLang } from '@/lib/lang';
import ProductCard from '@/components/ProductCard';
import { useState, useEffect } from 'react';

export default function DealsPage() {
  const { t } = useLang();
  const [saleProducts, setSaleProducts] = useState<GetProductsOutputType['products']>([]);
  useEffect(() => { getProducts({}).then(r => setSaleProducts(r.products.filter(p => p.originalPrice))); }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-accent text-accent-foreground py-10 md:py-14">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Zap className="h-8 w-8" />
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">{t('dealsPage.title')}</h1>
            <p className="text-accent-foreground/80 mt-1">{t('dealsPage.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Featured Deals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {deals.map(d => (
            <div key={d.id} className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-all group">
              <div className="relative aspect-square">
                <img src={d.image} alt={d.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 start-3 bg-accent text-accent-foreground text-sm font-bold px-3 py-1.5 rounded-full">
                  -{d.discount}%
                </div>
              </div>
              <div className="p-5">
                <span className="text-xs text-muted-foreground">{d.brand}</span>
                <h3 className="font-semibold mt-0.5">{d.productName}</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-xl font-bold text-accent">{formatPrice(d.salePrice)}</span>
                  <span className="text-sm text-muted-foreground line-through">{formatPrice(d.originalPrice)}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                  <Clock className="h-4 w-4" />
                  <span>{t('deals.endsIn')} <span className="font-semibold text-foreground">{d.endsIn}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Products on Sale */}
        <h2 className="font-display text-2xl font-bold mb-6">{t('trending.seeAll')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {saleProducts.map(p => <ProductCard key={p.id} product={p as any} />)}
        </div>
      </div>
    </div>
  );
}
