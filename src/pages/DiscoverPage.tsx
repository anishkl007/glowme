import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin, Square as Grid3X3, List, X } from 'lucide-react';
import { Input } from '@project/components/ui/input';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Skeleton } from '@project/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import ProductCard from '@/components/ProductCard';
import { categories, kuwaitAreas } from '@/data/sampleData';
import { getProducts, GetProductsOutputType } from 'zitejs/api';
import { useLang } from '@/lib/lang';

type ProductType = GetProductsOutputType['products'][0];

const catKeys: Record<string, string> = {
  Skincare: 'cat.skincare', Makeup: 'cat.makeup', Haircare: 'cat.haircare',
  Fragrance: 'cat.fragrance', Tools: 'cat.tools', 'Salon Services': 'cat.salon',
};

const tagOptions = ['Clean Beauty', 'Cruelty-Free', 'Vegan', 'Dermatologist Tested'];

const priceRanges = [
  { key: 'price.all', min: 0, max: Infinity },
  { key: 'price.under5', min: 0, max: 5 },
  { key: 'price.5to10', min: 5, max: 10 },
  { key: 'price.10to15', min: 10, max: 15 },
  { key: 'price.over15', min: 15, max: Infinity },
];

export default function DiscoverPage() {
  const { t } = useLang();
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pickupOnly, setPickupOnly] = useState(false);
  const [sameDayOnly, setSameDayOnly] = useState(false);

  useEffect(() => {
    getProducts({}).then(r => setAllProducts(r.products)).finally(() => setLoading(false));
  }, []);

  const toggleTag = (tag: string) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t2 => t2 !== tag) : [...prev, tag]);

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));
    if (selectedCategory !== 'All') result = result.filter(p => p.category === selectedCategory);
    if (selectedTags.length) result = result.filter(p => selectedTags.every(tg => p.tags.includes(tg)));
    const range = priceRanges[priceRange];
    result = result.filter(p => p.price >= range.min && p.price < range.max);
    if (pickupOnly) result = result.filter(p => p.pickupAvailable);
    if (sameDayOnly) result = result.filter(p => p.sameDayDelivery);
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [allProducts, search, selectedCategory, selectedTags, priceRange, pickupOnly, sameDayOnly, sortBy]);

  const activeFilterCount = selectedTags.length + (priceRange ? 1 : 0) + (pickupOnly ? 1 : 0) + (sameDayOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-10 md:py-14">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold">{t('discover.title')}</h1>
          <p className="text-primary-foreground/70 mt-2">{t('discover.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('discover.search')} value={search} onChange={e => setSearch(e.target.value)} className="ps-10 h-11 bg-white text-foreground border-0" />
            </div>
            <div className="relative flex-shrink-0">
              <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('discover.area')} defaultValue="Salmiya" className="ps-10 h-11 bg-white text-foreground border-0 w-full sm:w-44" list="area-list" />
              <datalist id="area-list">{kuwaitAreas.map(a => <option key={a} value={a} />)}</datalist>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          <button onClick={() => setSelectedCategory('All')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'All' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {t('discover.all')}
          </button>
          {categories.map(c => (
            <button key={c.name} onClick={() => setSelectedCategory(c.name)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === c.name ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
              {c.icon} {t(catKeys[c.name] || c.name)}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1.5">
              <SlidersHorizontal className="h-4 w-4" />
              {t('discover.filters')}
              {activeFilterCount > 0 && <Badge className="ms-1 h-5 w-5 p-0 flex items-center justify-center bg-accent text-accent-foreground text-[10px]">{activeFilterCount}</Badge>}
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">{t('sort.nearest')}</SelectItem>
                <SelectItem value="rating">{t('sort.topRated')}</SelectItem>
                <SelectItem value="price-low">{t('sort.priceLow')}</SelectItem>
                <SelectItem value="price-high">{t('sort.priceHigh')}</SelectItem>
                <SelectItem value="newest">{t('sort.newest')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground me-2 hidden sm:block">{filtered.length} {t('discover.results')}</span>
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('grid')}><Grid3X3 className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-card rounded-xl border border-border p-5 mb-6 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">{t('discover.filters')}</h3>
              <Button variant="ghost" size="sm" onClick={() => { setSelectedTags([]); setPriceRange(0); setPickupOnly(false); setSameDayOnly(false); }}>{t('discover.clearAll')}</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('discover.priceRange')}</label>
                <div className="flex flex-col gap-1.5 mt-2">
                  {priceRanges.map((r, i) => (
                    <button key={r.key} onClick={() => setPriceRange(i)} className={`text-start text-sm px-3 py-1.5 rounded-md transition-colors ${i === priceRange ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                      {t(r.key)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('discover.tags')}</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tagOptions.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedTags.includes(tag) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-foreground/30'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('discover.fulfillment')}</label>
                <div className="flex flex-col gap-2 mt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={pickupOnly} onChange={e => setPickupOnly(e.target.checked)} className="rounded border-border" />
                    {t('discover.pickupAvailable')}
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={sameDayOnly} onChange={e => setSameDayOnly(e.target.checked)} className="rounded border-border" />
                    {t('discover.sameDayDelivery')}
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeFilterCount > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleTag(tag)}>{tag} <X className="h-3 w-3" /></Badge>
            ))}
            {priceRange > 0 && <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setPriceRange(0)}>{t(priceRanges[priceRange].key)} <X className="h-3 w-3" /></Badge>}
            {pickupOnly && <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setPickupOnly(false)}>{t('product.pickup')} <X className="h-3 w-3" /></Badge>}
            {sameDayOnly && <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSameDayOnly(false)}>{t('product.sameDay')} <X className="h-3 w-3" /></Badge>}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6' : 'flex flex-col gap-4'}>
            {filtered.map(p => <ProductCard key={p.id} product={p as any} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg font-semibold">{t('discover.noProducts')}</p>
            <p className="text-muted-foreground mt-1">{t('discover.tryAdjusting')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
