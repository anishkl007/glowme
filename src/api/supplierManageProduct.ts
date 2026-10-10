import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { enrichCurrentUser } from '../lib/currentUser';
import { storesForUser } from '../lib/stores';

const forbidden = (m: string) => new ZiteError({ code: 'FORBIDDEN', message: m });

export default createEndpoint({
  description: "Lets a supplier add, edit, restock or remove products in their own store",
  authenticated: true,
  inputSchema: z.object({
    action: z.enum(['save', 'stock', 'delete']),
    id: z.string().optional(),
    storeKey: z.string().optional(),
    stockQuantity: z.number().optional(),
    product: z.object({
      name: z.string(), price: z.number(), originalPrice: z.number().optional(), category: z.string(),
      image: z.string(), barcode: z.string(), itemCode: z.string(), tags: z.string(), skinTypes: z.string(), shadesJson: z.string(),
    }).optional(),
  }),
  outputSchema: z.object({ id: z.string() }),
  execute: async ({ input, context }) => {
    await enrichCurrentUser(context);
    if (context.user.role !== 'Supplier' && context.user.role !== 'Admin') throw forbidden('Supplier access only');
    const stores = await storesForUser(context.user.id, context.user.role === 'Admin');
    const allowed = new Set(stores.map(s => s.storeKey || s.id));

    let existing: Awaited<ReturnType<typeof zite.products.findOne>> | null = null;
    if (input.id) {
      existing = await zite.products.findOne({ id: input.id });
      if (!existing || !allowed.has(existing.brandId || '')) throw forbidden('This product is not in your store');
    }

    if (input.action === 'delete') {
      await zite.products.delete({ id: input.id! });
      return { id: input.id! };
    }

    if (input.action === 'stock') {
      const qty = Math.max(0, Math.round(input.stockQuantity ?? 0));
      await zite.products.update({ id: input.id!, record: { stockQuantity: qty, inStock: qty > 0 } });
      return { id: input.id! };
    }

    const p = input.product;
    if (!p || !p.name.trim() || p.price <= 0) throw new Error('Name and price are required');
    const key = existing?.brandId || input.storeKey || '';
    if (!allowed.has(key)) throw forbidden('Choose one of your stores');
    const store = stores.find(s => (s.storeKey || s.id) === key)!;
    const qty = Math.max(0, Math.round(input.stockQuantity ?? 0));
    const record = {
      name: p.name.trim(), price: p.price, originalPrice: p.originalPrice ?? null, category: p.category, image: p.image,
      barcode: p.barcode, itemCode: p.itemCode, tags: p.tags, skinTypes: p.skinTypes, shadesJson: p.shadesJson,
      brand: store.name || '', brandId: key, stockQuantity: qty, inStock: qty > 0,
    };
    if (existing) {
      await zite.products.update({ id: existing.id, record });
      return { id: existing.id };
    }
    const created = await zite.products.create({ record: { ...record, rating: 0, reviewCount: 0, distance: store.area || '' } });
    return { id: created.id };
  },
});
