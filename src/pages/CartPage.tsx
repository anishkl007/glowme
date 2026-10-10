import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { useCart } from '@/lib/cart';
import { formatPrice, sellers } from '@/data/sampleData';
import { useLang } from '@/lib/lang';
import { toast } from 'sonner';

export default function CartPage() {
  const { t, dir } = useLang();
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="font-display text-2xl font-bold">{t('cart.empty')}</h1>
        <p className="text-muted-foreground mt-2">{t('cart.emptyDesc')}</p>
        <Button asChild className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link to="/discover">{t('cart.startShopping')} {dir === 'rtl' ? '←' : '→'}</Link>
        </Button>
      </div>
    );
  }

  // Group by seller
  const grouped = items.reduce((acc, item) => {
    const sellerId = item.product.brandId;
    if (!acc[sellerId]) acc[sellerId] = [];
    acc[sellerId].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="font-display text-3xl font-bold mb-8">{t('cart.title')}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(grouped).map(([sellerId, sellerItems]) => {
              const seller = sellers.find(s => s.id === sellerId);
              return (
                <div key={sellerId} className="bg-card rounded-xl border border-border overflow-hidden">
                  {seller && (
                    <div className="px-5 py-3 bg-muted/50 border-b border-border flex items-center gap-2">
                      <span className="text-lg">{seller.logo}</span>
                      <span className="font-semibold text-sm">{t('cart.from')} {seller.name}</span>
                      <span className="text-xs text-muted-foreground">· {seller.area}</span>
                    </div>
                  )}
                  <div className="divide-y divide-border">
                    {sellerItems.map(item => (
                      <div key={item.product.id} className="flex gap-4 p-5">
                        <Link to={`/product/${item.product.id}`} className="shrink-0">
                          <img src={item.product.image} alt={item.product.name} className="h-20 w-20 rounded-lg object-cover" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.product.id}`} className="font-semibold text-sm hover:text-accent">{item.product.name}</Link>
                          {item.selectedShade && <p className="text-xs text-muted-foreground mt-0.5">{item.selectedShade}</p>}
                          <p className="font-bold mt-1">{formatPrice(item.product.price)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center border border-border rounded-lg">
                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="h-8 w-8 flex items-center justify-center hover:bg-muted"><Minus className="h-3 w-3" /></button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="h-8 w-8 flex items-center justify-center hover:bg-muted"><Plus className="h-3 w-3" /></button>
                          </div>
                          <button onClick={() => removeItem(item.product.id)} className="text-xs text-destructive hover:underline flex items-center gap-1">
                            <Trash2 className="h-3 w-3" /> {t('cart.remove')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <Link to="/discover" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
              ← {t('cart.continueShopping')}
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">{t('cart.orderSummary')}</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.subtotal')}</span><span className="font-medium">{formatPrice(totalPrice)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.delivery')}</span><span className="text-muted-foreground">{t('cart.calculated')}</span></div>
                <div className="border-t border-border pt-3 flex justify-between text-base"><span className="font-semibold">{t('cart.total')}</span><span className="font-bold">{formatPrice(totalPrice)}</span></div>
              </div>
              <Button asChild className="w-full mt-6 h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                <Link to="/checkout">{t('cart.checkout')} <ArrowRight className="h-4 w-4 ms-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
