import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Adds a review from the signed-in customer',
  authenticated: true,
  inputSchema: z.object({
    productId: z.string(),
    rating: z.number(),
    text: z.string(),
    skinType: z.string().optional(),
  }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ input, context }) => {
    const rating = Math.round(input.rating);
    const text = input.text.trim();
    if (rating < 1 || rating > 5) throw new Error('Rating must be 1–5');
    if (text.length < 3) throw new Error('Please write a short review');
    const u = context.user;
    const name = [u.firstName, u.lastName?.[0] ? `${u.lastName[0]}.` : ''].filter(Boolean).join(' ') || u.email.split('@')[0];
    await zite.reviews.create({ record: {
      reviewText: text.slice(0, 2000), product: [input.productId], rating,
      authorName: name, author: u.id, skinType: input.skinType || null,
    } });
    return { success: true };
  },
});
