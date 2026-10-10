import { zite } from 'zitejs/db';

/** Adjusts stock for products that track a quantity. sign -1 = sell, +1 = restore. */
export async function adjustStock(items: { productId?: string; quantity?: number }[], sign: 1 | -1, check = false) {
  const qty: Record<string, number> = {};
  for (const i of items) if (i.productId) qty[i.productId] = (qty[i.productId] || 0) + (i.quantity || 0);
  const products = await Promise.all(Object.keys(qty).map(id => zite.products.findOne({ id })));
  const tracked = products.filter(p => p && p.stockQuantity != null) as NonNullable<(typeof products)[0]>[];
  if (check && sign < 0) {
    const short = tracked.find(p => (p.stockQuantity || 0) < qty[p.id]);
    if (short) throw new Error(`Sorry, only ${short.stockQuantity || 0} left of ${short.name}`);
  }
  await Promise.all(tracked.map(p => {
    const next = Math.max(0, (p.stockQuantity || 0) + sign * qty[p.id]);
    return zite.products.update({ id: p.id, record: { stockQuantity: next, inStock: next > 0 } });
  }));
}
