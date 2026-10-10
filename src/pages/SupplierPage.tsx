import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Package, AlertTriangle, Store, Minus } from 'lucide-react';
import { useAuth } from '@project/components/lib/legacyAuth';
import { supplierGetMyStore, supplierManageProduct, SupplierGetMyStoreOutputType } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Badge } from '@project/components/ui/badge';
import { Skeleton } from '@project/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@project/components/ui/alert-dialog';
import SupplierProductDialog, { SupplierProduct } from '@/components/supplier/SupplierProductDialog';
import { formatPrice } from '@/data/sampleData';

export default function SupplierPage() {
  const { user, isLoading, loginWithRedirect } = useAuth();
  const [data, setData] = useState<SupplierGetMyStoreOutputType | null>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<SupplierProduct | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<SupplierProduct | null>(null);

  const load = () => supplierGetMyStore({}).then(setData).catch(e => setError(e instanceof Error ? e.message : 'Access denied'));
  useEffect(() => { if (user) load(); }, [user]);

  const products = useMemo(() => (data?.products || []).filter(p =>
    `${p.name} ${p.itemCode} ${p.barcode}`.toLowerCase().includes(q.toLowerCase())), [data, q]);

  if (isLoading) return null;
  if (!user) return <Center><p className="mb-4">Sign in to manage your store.</p><Button onClick={() => loginWithRedirect()}>Sign in</Button></Center>;
  if (error) return <Center><p className="font-semibold">Supplier access only</p><p className="text-sm text-muted-foreground mt-1">Ask the GlowMe team to link your account to your store.</p><Button asChild variant="outline" className="mt-4"><Link to="/join-as-seller">Become a supplier</Link></Button></Center>;
  if (!data) return <div className="container mx-auto px-4 py-8 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;
  if (data.stores.length === 0) return <Center><Store className="h-8 w-8 mx-auto mb-3 text-muted-foreground" /><p className="font-semibold">No store linked yet</p><p className="text-sm text-muted-foreground mt-1">The GlowMe team will connect your account to your store.</p></Center>;

  const lowStock = data.products.filter(p => p.stockQuantity <= 5).length;

  const setStock = async (p: SupplierProduct, qty: number) => {
    qty = Math.max(0, qty);
    const prev = data;
    setData({ ...data, products: data.products.map(x => x.id === p.id ? { ...x, stockQuantity: qty, inStock: qty > 0 } : x) });
    try { await supplierManageProduct({ action: 'stock', id: p.id, stockQuantity: qty }); }
    catch { setData(prev); toast.error('Could not update stock'); }
  };

  const remove = async () => {
    if (!toDelete) return;
    try { await supplierManageProduct({ action: 'delete', id: toDelete.id }); toast.success('Product removed'); load(); }
    catch { toast.error('Could not remove product'); } finally { setToDelete(null); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Supplier portal</p>
          <h1 className="font-display text-3xl font-bold">{data.stores.map(s => `${s.logo} ${s.name}`).join(' · ')}</h1>
          <div className="flex gap-2 mt-2 text-sm">
            <Badge variant="secondary"><Package className="h-3 w-3 me-1" />{data.products.length} products</Badge>
            {lowStock > 0 && <Badge variant="outline" className="text-destructive border-destructive/40"><AlertTriangle className="h-3 w-3 me-1" />{lowStock} low on stock</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          {data.stores.map(s => <Button key={s.id} asChild variant="outline"><Link to={`/brand/${s.key}`}>View store page</Link></Button>)}
          <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 me-1" />Add product</Button>
        </div>
      </div>

      <div className="relative max-w-sm mb-4">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, SKU or barcode" className="ps-9" />
      </div>

      <div className="space-y-2">
        {products.length === 0 && <p className="text-center text-muted-foreground py-12">{data.products.length ? 'No products match your search.' : 'No products yet — add your first one.'}</p>}
        {products.map(p => (
          <div key={p.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <img src={p.image || 'https://placehold.co/80x80?text=%20'} alt="" className="h-14 w-14 rounded-lg object-cover bg-muted" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.category} · {formatPrice(p.price)}{p.itemCode && ` · ${p.itemCode}`}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setStock(p, p.stockQuantity - 1)} disabled={p.stockQuantity <= 0}><Minus className="h-3 w-3" /></Button>
              <Input type="number" min={0} value={p.stockQuantity} onChange={e => setStock(p, Number(e.target.value) || 0)} className={`h-8 w-16 text-center ${p.stockQuantity <= 5 ? 'border-destructive/50 text-destructive' : ''}`} />
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setStock(p, p.stockQuantity + 1)}><Plus className="h-3 w-3" /></Button>
            </div>
            <Badge variant={p.stockQuantity > 0 ? 'secondary' : 'outline'} className="w-24 justify-center">{p.stockQuantity > 0 ? 'In stock' : 'Out of stock'}</Badge>
            <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => setToDelete(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
      </div>

      <SupplierProductDialog open={dialogOpen} product={editing} stores={data.stores} onClose={() => setDialogOpen(false)} onSaved={load} />
      <AlertDialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>It will no longer be shown to customers.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={remove}>Remove</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="container mx-auto px-4 py-20 text-center max-w-md">{children}</div>;
}
