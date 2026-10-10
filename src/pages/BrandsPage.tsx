import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, ArrowRight, Store, Sparkles, Search } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Skeleton } from '@project/components/ui/skeleton';
import { getStores, GetStoresOutputType } from 'zitejs/api';
import { useLang } from '@/lib/lang';
import { useEffect, useMemo, useState } from 'react';

type StoreT = GetStoresOutputType['stores'][0];
const FILTERS = ['All', 'Brand', 'Store'] as const;

export default function BrandsPage() {
  const { t } = useLang();
  const [stores, setStores] = useState<StoreT[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [q, setQ] = useState('');

  useEffect(() => { getStores({}).then(r => setStores(r.stores)).catch(() => setStores([])); }, []);

  const shown = useMemo(() => (stores || []).filter(s =>
    (filter === 'All' || s.type === filter) &&
    `${s.name} ${s.area} ${s.categories.join(' ')}`.toLowerCase().includes(q.toLowerCase())), [stores, filter, q]);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-10 md:py-14">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold">{t('brandsPage.title')}</h1>
          <p className="text-primary-foreground/70 mt-2">{t('brandsPage.subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-6">
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="gap-1.5">
                {f === 'Brand' ? <Sparkles className="h-3.5 w-3.5" /> : f === 'Store' ? <Store className="h-3.5 w-3.5" /> : null}
                {f === 'All' ? 'All' : f === 'Brand' ? 'Local Brands' : 'Stores'}
              </Button>
            ))}
          </div>
          <div className="relative sm:w-72">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or area" className="ps-9" />
          </div>
        </div>

        {!stores ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}</div>
        ) : shown.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No brands or stores match your search.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{shown.map(s => <BrandCard key={s.id} s={s} t={t} />)}</div>
        )}

        <div className="mt-12 rounded-2xl border border-border bg-secondary p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Own a local brand or beauty store?</h2>
            <p className="text-sm text-muted-foreground mt-1">Join GlowMe as a supplier and manage your products and stock yourself.</p>
          </div>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90"><Link to="/join-as-seller">{t('nav.seller')}</Link></Button>
        </div>
      </div>
    </div>
  );
}

function BrandCard({ s, t }: { s: StoreT; t: (k: string) => string }) {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-all">
      <div className="relative h-40">
        <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute top-3 end-3 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-background/90">{s.type === 'Store' ? 'Store' : 'Local Brand'}</span>
        <div className="absolute bottom-4 start-4 flex items-center gap-3">
          <span className="text-3xl">{s.logo}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-lg">{s.name}</h3>
              {s.verified && <ShieldCheck className="h-4 w-4 text-amber-400" />}
            </div>
            {s.area && <span className="text-xs text-white/80 flex items-center gap-1"><MapPin className="h-3 w-3" />{s.area}</span>}
          </div>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm text-muted-foreground">{s.tagline}</p>
        <p className="text-sm mt-3 text-muted-foreground">{s.productCount} {t('cat.products')}</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          {s.tags.map(tag => <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">{tag}</span>)}
        </div>
        <Button asChild size="sm" className="w-full mt-4">
          <Link to={`/brand/${s.key}`}>{t('brandsPage.viewProducts')} <ArrowRight className="h-3 w-3 ms-1" /></Link>
        </Button>
      </div>
    </div>
  );
}
