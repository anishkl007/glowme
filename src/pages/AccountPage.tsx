import { useState, useEffect } from 'react';
import { useAuth } from '@project/components/lib/legacyAuth';
import { getMyOrders, GetMyOrdersOutputType, updateProfile } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Badge } from '@project/components/ui/badge';
import { Skeleton } from '@project/components/ui/skeleton';
import { useLang } from '@/lib/lang';
import { formatPrice } from '@/data/sampleData';
import OrderTimeline from '@/components/OrderTimeline';
import { Package, User, LogOut, MapPin, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

type OrderType = GetMyOrdersOutputType['orders'][0];

const statusColor: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Preparing: 'bg-orange-100 text-orange-800',
  'Out for Delivery': 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

function OrderCard({ order }: { order: OrderType }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-4">
          <Package className="h-5 w-5 text-muted-foreground" />
          <div className="text-start">
            <p className="font-semibold text-sm">Order #{order.orderNumber}</p>
            <p className="text-xs text-muted-foreground">{order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy') : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[order.status] || 'bg-muted text-muted-foreground'}`}>{order.status}</span>
          <span className="font-bold text-sm">{formatPrice(order.total)}</span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-border pt-3 space-y-2">
          <div className="py-3 mb-2 border-b border-border"><OrderTimeline status={order.status} /></div>
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.imageUrl && <img src={item.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />}
              <div className="flex-1">
                <p className="text-sm font-medium">{item.productName}</p>
                {item.shade && <p className="text-xs text-muted-foreground">{item.shade}</p>}
              </div>
              <p className="text-sm">x{item.quantity} · {formatPrice(item.price)}</p>
            </div>
          ))}
          <div className="flex gap-4 text-xs text-muted-foreground pt-2">
            <span>📍 {order.deliveryArea}</span>
            <span>💳 {order.paymentMethod}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  const { t } = useLang();
  const { user, isLoading, loginWithRedirect, logout } = useAuth();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) loginWithRedirect({ redirectUrl: window.location.href });
  }, [isLoading, user, loginWithRedirect]);

  useEffect(() => {
    if (!user) return;
    setPhone(user.phone || '');
    setArea(user.area || '');
    getMyOrders({}).then(r => setOrders(r.orders)).finally(() => setLoading(false));
  }, [user]);

  if (isLoading || !user) return null;

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ phone, area });
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">My Account</h1>
          <Button variant="outline" size="sm" onClick={() => logout({ returnTo: '/' })} className="gap-1.5">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>

        {/* Profile */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center">
              <User className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-semibold">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.role === 'Admin' && <Badge variant="secondary" className="mt-1">Admin</Badge>}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+965 ..." className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Area</label>
              <Input value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. Salmiya" className="mt-1" />
            </div>
          </div>
          <Button size="sm" className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={saving} onClick={saveProfile}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          {user.role === 'Admin' && (
            <Button asChild variant="outline" size="sm" className="mt-4 ms-2">
              <Link to="/admin">Admin Dashboard →</Link>
            </Button>
          )}
        </div>

        {/* Orders */}
        <h2 className="font-semibold text-xl mb-4">Order History</h2>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No orders yet</p>
            <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/discover">{t('cart.startShopping')}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">{orders.map(o => <OrderCard key={o.id} order={o} />)}</div>
        )}
      </div>
    </div>
  );
}
