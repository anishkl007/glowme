import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@project/components/lib/legacyAuth';
import { placeOrder } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Textarea } from '@project/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { useCart } from '@/lib/cart';
import { useLang } from '@/lib/lang';
import { formatPrice, kuwaitAreas } from '@/data/sampleData';
import { toast } from 'sonner';
import { Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CheckoutPage() {
  const { t } = useLang();
  const { user, isLoading, loginWithRedirect } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) loginWithRedirect({ redirectUrl: window.location.href });
  }, [isLoading, user, loginWithRedirect]);

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
    if (user?.area) setArea(user.area);
  }, [user]);

  if (isLoading || !user) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="font-display text-2xl font-bold">{t('cart.empty')}</h1>
        <Button asChild className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link to="/discover">{t('cart.startShopping')}</Link>
        </Button>
      </div>
    );
  }

  const canSubmit = address && area && phone && payment;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const result = await placeOrder({
        items: items.map(i => ({
          productId: i.product.id,
          productName: i.product.name,
          brand: i.product.brand,
          quantity: i.quantity,
          price: i.product.price,
          shade: i.selectedShade,
          imageUrl: i.product.image,
        })),
        deliveryAddress: address,
        deliveryArea: area,
        phone,
        notes,
        paymentMethod: payment,
      });
      clearCart();
      toast.success(`Order #${result.orderNumber} placed successfully!`);
      navigate('/account');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      toast.error(msg.startsWith('Sorry, only') ? msg : 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>
        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-lg">Delivery Details</h2>
              <div>
                <Label>Delivery Area</Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                  <SelectContent>
                    {kuwaitAreas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Street Address / Block / Building</Label>
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. Block 5, Street 12, Building 8, Apt 3" />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+965 ..." />
              </div>
              <div>
                <Label>Order Notes (optional)</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions..." rows={3} />
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-lg">Payment Method</h2>
              <div className="grid grid-cols-3 gap-3">
                {[{ val: 'Cash on Delivery', label: '💵 Cash', sub: 'Pay at door' }, { val: 'KNET', label: '🏦 KNET', sub: 'Local cards' }, { val: 'Card', label: '💳 Card', sub: 'Visa/Master' }].map(p => (
                  <button key={p.val} onClick={() => setPayment(p.val)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${payment === p.val ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40'}`}>
                    <div className="text-xl mb-1">{p.label.split(' ')[0]}</div>
                    <div className="text-xs font-medium">{p.label.split(' ').slice(1).join(' ')}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{p.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">{t('cart.orderSummary')}</h2>
              <div className="space-y-3 mb-4">
                {items.map(i => (
                  <div key={i.product.id} className="flex gap-3">
                    <img src={i.product.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{i.product.name}</p>
                      <p className="text-xs text-muted-foreground">x{i.quantity} · {formatPrice(i.product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.subtotal')}</span><span>{formatPrice(totalPrice)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.delivery')}</span><span className="text-muted-foreground">Free</span></div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
                  <span>{t('cart.total')}</span><span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
              <Button className="w-full mt-6 h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold" disabled={!canSubmit || submitting} onClick={handleSubmit}>
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin me-2" /> Placing Order...</> : `Place Order · ${formatPrice(totalPrice)}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
