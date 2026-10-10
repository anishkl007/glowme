import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  brandId: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  category: z.string(),
  image: z.string(),
  shades: z.array(z.object({ name: z.string(), hex: z.string() })),
  rating: z.number(),
  reviewCount: z.number(),
  distance: z.string(),
  pickupAvailable: z.boolean(),
  sameDayDelivery: z.boolean(),
  tags: z.array(z.string()),
  skinTypes: z.array(z.string()),
  inStock: z.boolean(),
  barcode: z.string(),
  itemCode: z.string(),
  stockQuantity: z.number().nullable(),
});

function toProduct(r: any) {
  let shades: { name: string; hex: string }[] = [];
  try { shades = JSON.parse(r.shadesJson || '[]'); } catch {}
  return {
    id: r.id,
    name: r.name || '',
    brand: r.brand || '',
    brandId: r.brandId || '',
    price: r.price || 0,
    originalPrice: r.originalPrice || undefined,
    category: r.category || '',
    image: r.image || '',
    shades,
    rating: r.rating || 0,
    reviewCount: r.reviewCount || 0,
    distance: r.distance || '',
    pickupAvailable: r.pickupAvailable ?? false,
    sameDayDelivery: r.sameDayDelivery ?? false,
    tags: (r.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    skinTypes: (r.skinTypes || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    inStock: r.inStock ?? true,
    barcode: r.barcode || '',
    itemCode: r.itemCode || '',
    stockQuantity: r.stockQuantity ?? null,
  };
}

export default createEndpoint({
  inputSchema: z.object({
    category: z.string().optional(),
    search: z.string().optional(),
    brandId: z.string().optional(),
  }),
  outputSchema: z.object({ products: z.array(productSchema) }),
  execute: async ({ input }) => {
    const filters: any = {};
    if (input.category) filters.category = input.category;
    if (input.brandId) filters.brandId = input.brandId;
    if (input.search) filters.name = { contains: input.search };
    const { records } = await zite.products.findAll({ filters, limit: 2000 });
    return { products: records.map(toProduct) };
  },
});
