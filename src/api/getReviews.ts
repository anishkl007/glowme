import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Lists customer reviews for a product',
  inputSchema: z.object({ productId: z.string() }),
  outputSchema: z.object({
    reviews: z.array(z.object({
      id: z.string(), text: z.string(), rating: z.number(), author: z.string(),
      skinType: z.string(), createdAt: z.string(),
    })),
    average: z.number(),
    count: z.number(),
  }),
  execute: async ({ input }) => {
    const { records } = await zite.reviews.findAll({ filters: { product: input.productId }, limit: 500 });
    const reviews = records
      .map(r => ({
        id: r.id, text: r.reviewText ?? '', rating: Number(r.rating ?? 0),
        author: r.authorName || 'Customer', skinType: r.skinType ?? '', createdAt: r.createdAt ?? '',
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const count = reviews.length;
    const average = count ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
    return { reviews, average, count };
  },
});
