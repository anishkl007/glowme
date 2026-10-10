import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

function toProduct(r: any) {
  let shades: { name: string; hex: string }[] = [];
  try { shades = JSON.parse(r.shadesJson || '[]'); } catch {}
  return {
    id: r.id, name: r.name || '', brand: r.brand || '', brandId: r.brandId || '',
    price: r.price || 0, originalPrice: r.originalPrice || undefined,
    category: r.category || '', image: r.image || '', shades,
    rating: r.rating || 0, reviewCount: r.reviewCount || 0, distance: r.distance || '',
    pickupAvailable: r.pickupAvailable ?? false, sameDayDelivery: r.sameDayDelivery ?? false,
    tags: (r.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    skinTypes: (r.skinTypes || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    inStock: r.inStock ?? true,
  };
}

export default createEndpoint({
  inputSchema: z.object({ id: z.string() }),
  outputSchema: z.object({
    product: z.object({
      id: z.string(), name: z.string(), brand: z.string(), brandId: z.string(),
      price: z.number(), originalPrice: z.number().optional(), category: z.string(),
      image: z.string(), shades: z.array(z.object({ name: z.string(), hex: z.string() })),
      rating: z.number(), reviewCount: z.number(), distance: z.string(),
      pickupAvailable: z.boolean(), sameDayDelivery: z.boolean(),
      tags: z.array(z.string()), skinTypes: z.array(z.string()), inStock: z.boolean(),
    }).nullable(),
  }),
  execute: async ({ input }) => {
    const r = await zite.products.findOne({ id: input.id });
    return { product: r ? toProduct(r) : null };
  },
});
