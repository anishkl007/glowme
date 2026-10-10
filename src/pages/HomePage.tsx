import { Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, ArrowLeft, Sparkles, ShieldCheck, Clock, Play, Zap } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { Skeleton } from '@project/components/ui/skeleton';
import { Input } from '@project/components/ui/input';
import ProductCard from '@/components/ProductCard';
import { categories, sellers, liveSessions, deals, testimonials, formatPrice, kuwaitAreas } from '@/data/sampleData';
import { getProducts, GetProductsOutputType } from 'zitejs/api';
import { useLang } from '@/lib/lang';
import { useState, useEffect } from 'react';

const catKeys: Record<string, string> = {
  Skincare: 'cat.skincare', Makeup: 'cat.makeup', Haircare: 'cat.haircare',
  Fragrance: 'cat.fragrance', Tools: 'cat.tools', 'Salon Services': 'cat.salon',
};

function Arrow() {
  const { dir } = useLang();
  return dir === 'rtl' ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />;
}

function HeroSection() {
  const [area, setArea] = useState('');
  const { t } = useLang();
  return (
    <section className="relative w-full min-h-[600px] md:min-h-[680px]">
      <img src="https://images.fillout.com/orgid-739995/flowpublicid-qar2rgzuug/widgetid-default/qAz5FYHFGSFV4GHKdY8EM5/pasted-image-1791370409588-u6srd6ar.jpg" alt="Pink cosmetics with peonies on marble" className="absolute inset-0 w-full h-full object-cover object-[75%_center]" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent md:via-background/20" />
      <div className="relative h-full flex flex-col justify-end px-4 md:px-12 py-16 md:py-20 max-w-7xl mx-auto min-h-[600px] md:min-h-[680px]">
        <span className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">{t('hero.badge')}</span>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-[1.1] max-w-3xl">
          {t('hero.title')}
        </h1>
        <p className="mt-4 text-lg md:text-xl text-foreground/75 max-w-xl leading-relaxed">{t('hero.subtitle')}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg">
          <div className="relative flex-1">
            <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('hero.placeholder')} value={area} onChange={e => setArea(e.target.value)} className="ps-10 h-12 bg-white text-foreground border border-border shadow-sm rounded-lg" list="areas-list" />
            <datalist id="areas-list">{kuwaitAreas.map(a => <option key={a} value={a} />)}</datalist>
          </div>
          <Button asChild className="h-12 px-6 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-semibold">
            <Link to="/discover"><Search className="h-4 w-4 me-2" /> {t('hero.cta')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const { t } = useLang();
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">{t('cat.title')}</h2>
            <p className="text-muted-foreground mt-2">{t('cat.subtitle')}</p>
          </div>
          <Link to="/categories" className="hidden md:flex items-center gap-1 text-sm font-medium text-accent hover:underline">
            {t('cat.viewAll')} <Arrow />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(c => (
            <Link key={c.name} to={`/discover?category=${c.name}`} className="group bg-card rounded-xl p-5 text-center border border-border/50 hover:border-accent/30 hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl" style={{ backgroundColor: c.color + '22' }}>{c.icon}</div>
              <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">{t(catKeys[c.name] || c.name)}</h3>
              <p className="text-xs text-muted-foreground mt-1">{c.count} {t('cat.products')}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrendingSection() {
  const { t } = useLang();
  const [trendingProducts, setTrendingProducts] = useState<GetProductsOutputType['products']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({}).then(r => setTrendingProducts(r.products.slice(0, 4))).finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 md:py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">{t('trending.title')}</h2>
            <p className="text-muted-foreground mt-2">{t('trending.subtitle')}</p>
          </div>
          <Link to="/discover" className="hidden md:flex items-center gap-1 text-sm font-medium text-accent hover:underline">
            {t('trending.seeAll')} <Arrow />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1,2,3,4].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {trendingProducts.map(p => <ProductCard key={p.id} product={p as any} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function DealsSection() {
  const { t } = useLang();
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center"><Zap className="h-5 w-5 text-accent" /></div>
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">{t('deals.title')}</h2>
              <p className="text-muted-foreground mt-0.5">{t('deals.subtitle')}</p>
            </div>
          </div>
          <Link to="/deals" className="hidden md:flex items-center gap-1 text-sm font-medium text-accent hover:underline">
            {t('deals.allDeals')} <Arrow />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {deals.map(d => (
            <div key={d.id} className="flex bg-card rounded-xl overflow-hidden border border-border/50 hover:shadow-md transition-all group">
              <div className="w-28 sm:w-32 shrink-0"><img src={d.image} alt={d.productName} className="w-full h-full object-cover" /></div>
              <div className="p-4 flex flex-col justify-center">
                <span className="text-xs text-muted-foreground">{d.brand}</span>
                <h3 className="font-semibold text-sm mt-0.5 group-hover:text-accent transition-colors">{d.productName}</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-bold text-accent">{formatPrice(d.salePrice)}</span>
                  <span className="text-xs text-muted-foreground line-through">{formatPrice(d.originalPrice)}</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {t('deals.endsIn')} {d.endsIn}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveSection() {
  const { t } = useLang();
  return (
    <section className="py-16 md:py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">{t('live.title')}</h2>
            <p className="text-primary-foreground/70 mt-2">{t('live.subtitle')}</p>
          </div>
          <Link to="/live" className="hidden md:flex items-center gap-1 text-sm font-medium text-accent hover:underline">
            {t('live.seeAll')} <Arrow />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {liveSessions.map(s => (
            <div key={s.id} className="bg-primary-foreground/10 rounded-xl overflow-hidden hover:bg-primary-foreground/15 transition-colors group cursor-pointer">
              <div className="relative aspect-video">
                <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center"><Play className="h-5 w-5 text-accent-foreground fill-accent-foreground" /></div>
                </div>
                {s.isLive && (
                  <span className="absolute top-3 start-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> LIVE · {s.viewers} {t('live.watching')}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm">{s.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <img src={s.hostImage} alt={s.host} className="h-6 w-6 rounded-full object-cover" />
                  <span className="text-xs text-primary-foreground/70">{s.host}</span>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-primary-foreground/60">
                  <span>{s.startTime}</span>
                  <span>{s.products} {t('live.products')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalBrandsSection() {
  const { t } = useLang();
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">{t('brands.title')}</h2>
            <p className="text-muted-foreground mt-2">{t('brands.subtitle')}</p>
          </div>
          <Link to="/brands" className="hidden md:flex items-center gap-1 text-sm font-medium text-accent hover:underline">
            {t('brands.viewDir')} <Arrow />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {sellers.map(s => (
            <div key={s.id} className="bg-card rounded-xl overflow-hidden border border-border/50 hover:shadow-md transition-all group cursor-pointer">
              <div className="relative h-36">
                <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 start-3 flex items-center gap-2">
                  <span className="text-2xl">{s.logo}</span>
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-semibold text-sm text-white">{s.name}</h3>
                      {s.verified && <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />}
                    </div>
                    <span className="text-xs text-white/70">{s.area} · {s.distance}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground line-clamp-2">{s.tagline}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-amber-500">★</span>
                    <span className="font-medium">{s.rating}</span>
                    <span className="text-muted-foreground">({s.reviewCount})</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{s.productCount} {t('cat.products')}</span>
                </div>
                <div className="flex gap-1 mt-3 flex-wrap">
                  {s.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuizCTA() {
  const { t } = useLang();
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden">
          <img src="https://images.fillout.com/739995/qar2rgzuug/generated-images/dRCgEy8z5SvMSp5z1eZ6u9/img_H4YReEAZVcu3MBnc.jpg" alt="Color swatches" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60 rtl:bg-gradient-to-l" />
          <div className="relative px-8 md:px-16 py-16 md:py-20 max-w-xl">
            <Sparkles className="h-8 w-8 text-accent mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">{t('quiz.title')}</h2>
            <p className="text-white/80 mt-3 leading-relaxed">{t('quiz.subtitle')}</p>
            <Button asChild className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-12 px-8">
              <Link to="/quiz">{t('quiz.cta')} <Arrow /></Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { t } = useLang();
  return (
    <section className="py-16 md:py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center">{t('test.title')}</h2>
        <p className="text-muted-foreground text-center mt-2 mb-10">{t('test.subtitle')}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((tm, i) => (
            <div key={i} className="bg-card rounded-xl p-6 border border-border/50">
              <p className="text-sm leading-relaxed text-foreground/80 italic">"{tm.text}"</p>
              <div className="flex items-center gap-3 mt-5">
                <span className="text-2xl">{tm.avatar}</span>
                <div>
                  <p className="font-semibold text-sm">{tm.name}</p>
                  <p className="text-xs text-muted-foreground">{tm.role}{tm.skinTone ? ` · ${tm.skinTone}` : ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SellerCTA() {
  const { t } = useLang();
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden grid md:grid-cols-2">
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <span className="text-accent font-semibold text-sm tracking-widest uppercase">{t('seller.badge')}</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-3">{t('seller.title')}</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">{t('seller.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button asChild className="bg-primary hover:bg-primary/90 font-semibold h-12 px-6">
                <Link to="/join-as-seller">{t('seller.startSelling')} <Arrow /></Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-6">
                <Link to="/about">{t('seller.learnMore')}</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block relative min-h-[300px]">
            <img src="https://images.fillout.com/739995/qar2rgzuug/generated-images/8qq6BvdxHpVpdJMuDU2h9Z/img_qX8MIFvtb21L7ln8.jpg" alt="Boutique beauty store" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <CategoriesSection />
      <TrendingSection />
      <DealsSection />
      <LiveSection />
      <LocalBrandsSection />
      <QuizCTA />
      <TestimonialsSection />
      <SellerCTA />
    </div>
  );
}
