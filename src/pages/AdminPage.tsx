import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@project/components/lib/legacyAuth';
import { adminGetOrders, AdminGetOrdersOutputType, adminUpdateOrder, AdminUpdateOrderOutputType, adminGetUsers, AdminGetUsersOutputType, adminUpdateUser, getProducts, GetProductsOutputType, adminSaveProduct, adminDeleteProduct } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Textarea } from '@project/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Skeleton } from '@project/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@project/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@project/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@project/components/ui/alert-dialog';
import { Switch } from '@project/components/ui/switch';
import { formatPrice } from '@/data/sampleData';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ShieldCheck, Package, Users, ChevronDown, ChevronUp, ArrowLeft, Plus, Pencil, Trash2, ShoppingBasket, Upload, Receipt, Truck, Search, BarChart3, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BulkUploadTab from '@/components/admin/BulkUploadTab';
import DashboardTab from '@/components/admin/DashboardTab';
import InvoicesTab from '@/components/admin/InvoicesTab';
import PurchaseOrdersTab from '@/components/admin/PurchaseOrdersTab';
import StoresTab from '@/components/admin/StoresTab';
import AdminProductsTable from '@/components/admin/AdminProductsTable';
import { getStores, GetStoresOutputType } from 'zitejs/api';

type OrderType = AdminGetOrdersOutputType['orders'][0];
type UserType = AdminGetUsersOutputType['users'][0];
type ProductType = GetProductsOutputType['products'][0];

const statuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
const statusColor: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800', Confirmed: 'bg-blue-100 text-blue-800',
  Preparing: 'bg-orange-100 text-orange-800', 'Out for Delivery': 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800', Cancelled: 'bg-red-100 text-red-800',
};

const categoryOptions = ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Tools', 'Salon Services'];

function AdminOrderCard({ order, onUpdate, onInvoiceCreated }: { order: OrderType; onUpdate: () => void; onInvoiceCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const changeStatus = async (s: string) => {
    setUpdating(true);
    try {
      const result = await adminUpdateOrder({ orderId: order.id, status: s });
      if (result.invoiceCreated) {
        toast.success(`Order #${order.orderNumber} confirmed — Invoice created automatically!`, { duration: 5000 });
        onInvoiceCreated?.();
      } else {
        toast.success(`Order #${order.orderNumber} → ${s}`);
      }
      onUpdate();
    }
    catch { toast.error('Failed to update'); }
    setUpdating(false);
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors text-start">
        <div className="flex items-center gap-4 min-w-0">
          <Package className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-sm">#{order.orderNumber} — {order.customerName || order.customerEmail}</p>
            <p className="text-xs text-muted-foreground">{order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy h:mm a') : ''} · {order.deliveryArea}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[order.status] || 'bg-muted text-muted-foreground'}`}>{order.status}</span>
          <span className="font-bold text-sm">{formatPrice(order.total)}</span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <p><span className="text-muted-foreground">Address:</span> {order.deliveryAddress}</p>
            <p><span className="text-muted-foreground">Phone:</span> {order.phone}</p>
            <p><span className="text-muted-foreground">Payment:</span> {order.paymentMethod}</p>
            {order.notes && <p><span className="text-muted-foreground">Notes:</span> {order.notes}</p>}
          </div>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.imageUrl && <img src={item.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.shade ? `${item.shade} · ` : ''}{(item as any).itemCode ? `Code: ${(item as any).itemCode}` : ''}{(item as any).itemCode && (item as any).barcode ? ' · ' : ''}{(item as any).barcode ? `BC: ${(item as any).barcode}` : ''}
                  </p>
                </div>
                <p className="text-sm shrink-0">x{item.quantity} · {formatPrice(item.price)}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <span className="text-sm font-medium">Update Status:</span>
            <Select value={order.status} onValueChange={changeStatus} disabled={updating}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersTab({ onInvoiceCreated }: { onInvoiceCreated?: () => void }) {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    adminGetOrders({ status: filter === 'all' ? undefined : filter }).then(r => setOrders(r.orders)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    orders.forEach(o => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [orders]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant={filter === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilter('all')}>All ({orders.length})</Badge>
        {statuses.map(s => counts[s] ? <Badge key={s} variant={filter === s ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilter(s)}>{s} ({counts[s]})</Badge> : null)}
      </div>
      {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        : orders.length === 0 ? <p className="text-center py-16 text-muted-foreground">No orders found</p>
        : <div className="space-y-3">{orders.map(o => <AdminOrderCard key={o.id} order={o} onUpdate={load} onInvoiceCreated={onInvoiceCreated} />)}</div>}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminGetUsers({}).then(r => setUsers(r.users)).finally(() => setLoading(false)); }, []);

  const changeRole = async (userId: string, role: string) => {
    try { await adminUpdateUser({ userId, role }); setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u)); toast.success('Role updated'); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;

  return (
    <div className="space-y-2">
      {users.map(u => (
        <div key={u.id} className="bg-card rounded-xl border border-border px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">{u.firstName} {u.lastName} <span className="text-muted-foreground">· {u.email}</span></p>
            <p className="text-xs text-muted-foreground">{u.area || 'No area'} · Joined {u.joinedAt ? format(new Date(u.joinedAt), 'MMM d, yyyy') : '—'}</p>
          </div>
          <Select value={u.role} onValueChange={v => changeRole(u.id, v)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Customer">Customer</SelectItem>
              <SelectItem value="Supplier">Supplier</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}

interface ProductForm {
  id?: string; name: string; brand: string; brandId: string; price: number;
  originalPrice?: number; category: string; image: string; shadesJson: string;
  rating: number; reviewCount: number; distance: string;
  pickupAvailable: boolean; sameDayDelivery: boolean; tags: string; skinTypes: string; inStock: boolean;
  barcode: string; itemCode: string;
}

const emptyForm: ProductForm = {
  name: '', brand: 'Glowme', brandId: 'glowme', price: 0, category: 'Makeup', image: '',
  shadesJson: '[]', rating: 0, reviewCount: 0, distance: '', pickupAvailable: false,
  sameDayDelivery: false, tags: '', skinTypes: '', inStock: true,
  barcode: '', itemCode: '',
};

function ProductFormDialog({ product, open, onClose, onSaved, stores }: { product?: ProductForm; open: boolean; onClose: () => void; onSaved: () => void; stores: GetStoresOutputType['stores'] }) {
  const [form, setForm] = useState<ProductForm>(product || emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(product || emptyForm); }, [product, open]);

  const set = (key: keyof ProductForm, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.name || !form.brand) { toast.error('Name and brand are required'); return; }
    setSaving(true);
    try {
      await adminSaveProduct({
        id: form.id, name: form.name, brand: form.brand, brandId: form.brandId,
        price: form.price, originalPrice: form.originalPrice, category: form.category,
        image: form.image, shadesJson: form.shadesJson, rating: form.rating,
        reviewCount: form.reviewCount, distance: form.distance,
        pickupAvailable: form.pickupAvailable, sameDayDelivery: form.sameDayDelivery,
        tags: form.tags, skinTypes: form.skinTypes, inStock: form.inStock,
        barcode: form.barcode, itemCode: form.itemCode,
      });
      toast.success(form.id ? 'Product updated' : 'Product created');
      onSaved();
      onClose();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{form.id ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Product Name *</Label><Input value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Store *</Label>
              <Select value={form.brandId || 'glowme'} onValueChange={v => {
                const s = stores.find(s => s.key === v);
                set('brandId', v);
                if (s && v !== 'glowme' && (!form.brand || stores.some(x => x.name === form.brand))) set('brand', s.name);
              }}>
                <SelectTrigger><SelectValue placeholder="Select store" /></SelectTrigger>
                <SelectContent>
                  {!stores.some(s => s.key === 'glowme') && <SelectItem value="glowme">Glowme Products</SelectItem>}
                  {stores.map(s => <SelectItem key={s.key} value={s.key}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Label className="mt-3 block">Brand *</Label>
              <Input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Brand name" />
            </div>
            <div><Label>Category</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categoryOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Price (KD)</Label><Input type="number" step="0.1" value={form.price} onChange={e => set('price', parseFloat(e.target.value) || 0)} /></div>
            <div><Label>Original Price (KD)</Label><Input type="number" step="0.1" value={form.originalPrice || ''} onChange={e => set('originalPrice', parseFloat(e.target.value) || undefined)} /></div>
          </div>
          <div><Label>Image URL</Label><Input value={form.image} onChange={e => set('image', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Item Code</Label><Input value={form.itemCode} onChange={e => set('itemCode', e.target.value)} placeholder="e.g. SKU-001" /></div>
            <div><Label>Barcode</Label><Input value={form.barcode} onChange={e => set('barcode', e.target.value)} placeholder="e.g. 6291234567890" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Rating</Label><Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => set('rating', parseFloat(e.target.value) || 0)} /></div>
            <div><Label>Distance</Label><Input value={form.distance} onChange={e => set('distance', e.target.value)} placeholder="e.g. 1.2 km" /></div>
          </div>
          <div><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Clean Beauty,Vegan" /></div>
          <div><Label>Skin Types (comma-separated)</Label><Input value={form.skinTypes} onChange={e => set('skinTypes', e.target.value)} placeholder="All,Oily,Dry" /></div>
          <div><Label>Shades JSON</Label><Textarea value={form.shadesJson} onChange={e => set('shadesJson', e.target.value)} rows={3} className="font-mono text-xs" /></div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm"><Switch checked={form.pickupAvailable} onCheckedChange={v => set('pickupAvailable', v)} /> Pickup Available</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={form.sameDayDelivery} onCheckedChange={v => set('sameDayDelivery', v)} /> Same-day Delivery</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={form.inStock} onCheckedChange={v => set('inStock', v)} /> In Stock</label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90 text-accent-foreground">{saving ? 'Saving...' : 'Save Product'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductForm | undefined>();
  const [search, setSearch] = useState('');
  const [stores, setStores] = useState<GetStoresOutputType['stores']>([]);
  const [storeFilter, setStoreFilter] = useState('all');
  useEffect(() => { getStores({}).then(r => setStores(r.stores)).catch(() => {}); }, []);
  const storeName = useMemo(() => {
    const m = new Map(stores.map(s => [s.key, s.name]));
    return (p: ProductType) => m.get(p.brandId) || p.brand;
  }, [stores]);

  const load = () => { setLoading(true); getProducts({}).then(r => setProducts(r.products)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const base = storeFilter === 'all' ? products : products.filter(p => p.brandId === storeFilter);
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter(p =>
      storeName(p).toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      ((p as any).itemCode || '').toLowerCase().includes(q) ||
      ((p as any).barcode || '').toLowerCase().includes(q)
    );
  }, [products, search, storeFilter, storeName]);

  const handleDelete = async (id: string) => {
    try { await adminDeleteProduct({ id }); toast.success('Product deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const openEdit = (p: ProductType) => {
    setEditing({
      id: p.id, name: p.name, brand: p.brand, brandId: p.brandId,
      price: p.price, originalPrice: p.originalPrice, category: p.category,
      image: p.image, shadesJson: JSON.stringify(p.shades),
      rating: p.rating, reviewCount: p.reviewCount, distance: p.distance,
      pickupAvailable: p.pickupAvailable, sameDayDelivery: p.sameDayDelivery,
      tags: p.tags.join(','), skinTypes: p.skinTypes.join(','), inStock: p.inStock,
      barcode: (p as any).barcode || '', itemCode: (p as any).itemCode || '',
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name, store, item code, barcode…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={storeFilter} onValueChange={setStoreFilter}>
          <SelectTrigger className="w-48 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stores</SelectItem>
            {stores.map(s => <SelectItem key={s.key} value={s.key}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground whitespace-nowrap">{filtered.length} of {products.length} products</p>
          <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>
      {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div> : (
        filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No products match your filters</div>
        ) : <AdminProductsTable products={filtered} storeName={storeName} onEdit={openEdit} onDelete={handleDelete} />
      )}
      <ProductFormDialog product={editing} open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} stores={stores} />
    </div>
  );
}

export default function AdminPage() {
  const { user, isLoading, loginWithRedirect } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) loginWithRedirect({ redirectUrl: window.location.href });
  }, [isLoading, user, loginWithRedirect]);

  useEffect(() => {
    if (user && user.role !== 'Admin') { toast.error('Admin access only'); navigate('/'); }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [invoiceKey, setInvoiceKey] = useState(0);

  if (isLoading || !user || user.role !== 'Admin') return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <Link to="/account" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Account
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="h-7 w-7 text-accent" />
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard" className="gap-1.5"><BarChart3 className="h-4 w-4" /> Dashboard</TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5"><Package className="h-4 w-4" /> Orders</TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5"><ShoppingBasket className="h-4 w-4" /> Products</TabsTrigger>
            <TabsTrigger value="bulk" className="gap-1.5"><Upload className="h-4 w-4" /> Bulk Upload</TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1.5"><Receipt className="h-4 w-4" /> Invoices</TabsTrigger>
            <TabsTrigger value="purchasing" className="gap-1.5"><Truck className="h-4 w-4" /> Purchasing</TabsTrigger>
            <TabsTrigger value="stores" className="gap-1.5"><Store className="h-4 w-4" /> Stores</TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5"><Users className="h-4 w-4" /> Users</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="orders"><OrdersTab onInvoiceCreated={() => { setInvoiceKey(k => k + 1); setTimeout(() => setActiveTab('invoices'), 1500); }} /></TabsContent>
          <TabsContent value="products"><ProductsTab /></TabsContent>
          <TabsContent value="bulk"><BulkUploadTab /></TabsContent>
          <TabsContent value="invoices"><InvoicesTab key={invoiceKey} /></TabsContent>
          <TabsContent value="purchasing"><PurchaseOrdersTab /></TabsContent>
          <TabsContent value="stores"><StoresTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
