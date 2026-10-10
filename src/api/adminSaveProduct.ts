import { enrichCurrentUser } from '../lib/currentUser';
import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint, ZiteError } from 'zitejs/backend';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    id: z.string().optional(),
    name: z.string(),
    brand: z.string(),
    brandId: z.string(),
    price: z.number(),
    originalPrice: z.number().optional(),
    category: z.string(),
    image: z.string(),
    shadesJson: z.string(),
    rating: z.number(),
    reviewCount: z.number(),
    distance: z.string(),
    pickupAvailable: z.boolean(),
    sameDayDelivery: z.boolean(),
    tags: z.string(),
    skinTypes: z.string(),
    inStock: z.boolean(),
    barcode: z.string().optional(),
    itemCode: z.string().optional(),
  }),
  outputSchema: z.object({ id: z.string(), success: z.boolean() }),
  execute: async ({ input, context }) => {
    await enrichCurrentUser(context);
    if (context.user.role !== 'Admin') throw new ZiteError({ code: 'FORBIDDEN', message: 'Admin only' });
    const record: any = {
      name: input.name, brand: input.brand, brandId: input.brandId || 'glowme',
      price: input.price, originalPrice: input.originalPrice, category: input.category as any,
      image: input.image, shadesJson: input.shadesJson, rating: input.rating,
      reviewCount: input.reviewCount, distance: input.distance,
      pickupAvailable: input.pickupAvailable, sameDayDelivery: input.sameDayDelivery,
      tags: input.tags, skinTypes: input.skinTypes, inStock: input.inStock,
      barcode: input.barcode, itemCode: input.itemCode,
    };
    if (input.id) {
      await zite.products.update({ id: input.id, record });
      return { id: input.id, success: true };
    } else {
      const created = await zite.products.create({ record });
      return { id: created.id, success: true };
    }
  },
});
