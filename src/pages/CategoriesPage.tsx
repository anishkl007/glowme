import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { categories } from '@/data/sampleData';
import { getProducts, GetProductsOutputType } from 'zitejs/api';
import { useLang } from '@/lib/lang';
import ProductCard from '@/components/ProductCard';
import { useState, useEffect } from 'react';

const catKeys: Record<string, string> = {
  Skincare: 'cat.skincare', Makeup: 'cat.makeup', Haircare: 'cat.haircare',
  Fragrance: 'cat.fragrance', Tools: 'cat.tools', 'Salon Services': 'cat.salon',
};

const catImages: Record<string, string> = {
  Skincare: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=300&fit=crop',
  Makeup: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=300&fit=crop',
  Haircare: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&h=300&fit=crop',
  Fragrance: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=300&fit=crop',
  Tools: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=300&fit=crop',
  'Salon Services': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=300&fit=crop',
};

export default function CategoriesPage() {
  const { t } = useLang();
  const [allProducts, setAllProducts] = useState<GetProductsOutputType['products']>([]);
  useEffect(() => { getProducts({}).then(r => setAllProducts(r.products)); }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-10 md:py-14">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold">{t('catPage.title')}</h1>
          <p className="text-primary-foreground/70 mt-2">{t('catPage.subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="space-y-16">
          {categories.map(cat => {
            const catProducts = allProducts.filter(p => p.category === cat.name);
            return (
              <section key={cat.name}>
                <div className="relative rounded-2xl overflow-hidden h-40 md:h-52 mb-6">
                  <img src={catImages[cat.name]} alt={cat.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
                  <div className="absolute inset-0 flex items-center px-8">
                    <div>
                      <span className="text-4xl mb-2 block">{cat.icon}</span>
                      <h2 className="font-display text-2xl md:text-3xl font-bold text-white">{t(catKeys[cat.name])}</h2>
                      <p className="text-white/70 text-sm mt-1">{cat.count} {t('cat.products')}</p>
                    </div>
                    <Button asChild variant="secondary" className="ms-auto">
                      <Link to={`/discover?category=${cat.name}`}>{t('catPage.shopNow')} <ArrowRight className="h-4 w-4 ms-1" /></Link>
                    </Button>
                  </div>
                </div>
                {catProducts.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {catProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p as any} />)}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
