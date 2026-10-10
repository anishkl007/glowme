import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { enrichCurrentUser } from '../lib/currentUser';
import { storeSchema, toStore, storesForUser } from '../lib/stores';

const item = z.object({
  id: z.string(), name: z.string(), brandId: z.string(), price: z.number(), originalPrice: z.number().optional(),
  category: z.string(), image: z.string(), stockQuantity: z.number(), inStock: z.boolean(),
  barcode: z.string(), itemCode: z.string(), tags: z.string(), skinTypes: z.string(), shadesJson: z.string(),
});

export default createEndpoint({
  description: "Returns the signed-in supplier's stores and their products",
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({ stores: z.array(storeSchema), products: z.array(item) }),
  execute: async ({ context }) => {
    await enrichCurrentUser(context);
    if (context.user.role !== 'Supplier' && context.user.role !== 'Admin') throw new ZiteError({ code: 'FORBIDDEN', message: 'Supplier access only' });
    const stores = await storesForUser(context.user.id, context.user.role === 'Admin');
    const keys = stores.map(s => s.storeKey || s.id);
    const products: z.infer<typeof item>[] = [];
    for (const k of keys) {
      const { records } = await zite.products.findAll({ filters: { brandId: k }, limit: 2000 });
      products.push(...records.map(p => ({
        id: p.id, name: p.name || '', brandId: p.brandId || '', price: p.price || 0, originalPrice: p.originalPrice || undefined,
        category: p.category || '', image: p.image || '', stockQuantity: p.stockQuantity ?? 0, inStock: p.inStock ?? true,
        barcode: p.barcode || '', itemCode: p.itemCode || '', tags: p.tags || '', skinTypes: p.skinTypes || '', shadesJson: p.shadesJson || '[]',
      })));
    }
    return { stores: stores.map(s => toStore(s, products.filter(p => p.brandId === (s.storeKey || s.id)).length)), products };
  },
});
