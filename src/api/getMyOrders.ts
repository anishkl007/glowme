import { enrichCurrentUser } from '../lib/currentUser';
import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({
    orders: z.array(z.object({
      id: z.string(),
      orderNumber: z.any(),
      status: z.string(),
      total: z.number(),
      deliveryArea: z.string(),
      paymentMethod: z.string(),
      createdAt: z.string(),
      items: z.array(z.object({
        productName: z.string(),
        quantity: z.number(),
        price: z.number(),
        shade: z.string(),
        imageUrl: z.string(),
      })),
    })),
  }),
  execute: async ({ context }) => {
    await enrichCurrentUser(context);
    const { records } = await zite.orders.findAll({
      filters: { customer: context.user.id },
      limit: 50,
    });
    const sorted = records.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    const orders = await Promise.all(sorted.map(async (o) => {
      const { records: items } = await zite.orderItems.findAll({ filters: { order: o.id } });
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status || 'Pending',
        total: o.total || 0,
        deliveryArea: o.deliveryArea || '',
        paymentMethod: o.paymentMethod || '',
        createdAt: o.createdAt || '',
        items: items.map(i => ({
          productName: i.productName || '',
          quantity: i.quantity || 0,
          price: i.price || 0,
          shade: i.shade || '',
          imageUrl: i.imageUrl || '',
        })),
      };
    }));
    return { orders };
  },
});
