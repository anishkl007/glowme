import { enrichCurrentUser } from '../lib/currentUser';
import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint, ZiteError } from 'zitejs/backend';

const productRowSchema = z.object({
  name: z.string(),
  brand: z.string(),
  brandId: z.string().optional(),
  store: z.string().optional(),
  stockQuantity: z.number().optional(),
  price: z.number(),
  originalPrice: z.number().optional(),
  category: z.string().optional(),
  image: z.string().optional(),
  tags: z.string().optional(),
  skinTypes: z.string().optional(),
  inStock: z.boolean().optional(),
  pickupAvailable: z.boolean().optional(),
  sameDayDelivery: z.boolean().optional(),
  barcode: z.string().optional(),
  itemCode: z.string().optional(),
});

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    products: z.array(productRowSchema).min(1).max(100),
  }),
  outputSchema: z.object({
    created: z.number(),
    errors: z.array(z.object({ row: z.number(), message: z.string() })),
  }),
  execute: async ({ input, context }) => {
    await enrichCurrentUser(context);
    if (context.user.role !== 'Admin') throw new ZiteError({ code: 'FORBIDDEN', message: 'Admin only' });

    const validRecords: any[] = [];
    const errors: { row: number; message: string }[] = [];
    const { records: stores } = await zite.stores.findAll({ limit: 500 });
    const storeKey = (v?: string) => {
      const q = (v || '').trim().toLowerCase();
      if (!q) return 'glowme';
      const s = stores.find(s => (s.storeKey || '').toLowerCase() === q || (s.name || '').toLowerCase() === q);
      return s ? (s.storeKey || s.id) : null;
    };

    input.products.forEach((p, i) => {
      if (!p.name || !p.brand) {
        errors.push({ row: i + 1, message: 'Name and brand are required' });
        return;
      }
      const brandId = storeKey(p.store || p.brandId);
      if (!brandId) {
        errors.push({ row: i + 1, message: `Store "${p.store || p.brandId}" not found` });
        return;
      }
      validRecords.push({
        name: p.name,
        brand: p.brand,
        brandId,
        stockQuantity: p.stockQuantity,
        price: p.price,
        originalPrice: p.originalPrice,
        category: p.category || 'Makeup',
        image: p.image || '',
        tags: p.tags || '',
        skinTypes: p.skinTypes || '',
        inStock: p.inStock ?? (p.stockQuantity !== undefined ? p.stockQuantity > 0 : true),
        pickupAvailable: p.pickupAvailable ?? false,
        sameDayDelivery: p.sameDayDelivery ?? false,
        barcode: p.barcode || '',
        itemCode: p.itemCode || '',
      });
    });

    if (validRecords.length > 0) {
      await zite.products.bulkCreate({ records: validRecords });
    }

    return { created: validRecords.length, errors };
  },
});
