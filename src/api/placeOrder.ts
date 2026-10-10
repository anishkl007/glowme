import { enrichCurrentUser } from '../lib/currentUser';
import { adjustStock } from '../lib/stock';
import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    items: z.array(z.object({
      productId: z.string(),
      productName: z.string(),
      brand: z.string(),
      quantity: z.number(),
      price: z.number(),
      shade: z.string().optional(),
      imageUrl: z.string().optional(),
    })),
    deliveryAddress: z.string(),
    deliveryArea: z.string(),
    phone: z.string(),
    notes: z.string().optional(),
    paymentMethod: z.string(),
  }),
  outputSchema: z.object({ orderId: z.string(), orderNumber: z.any() }),
  execute: async ({ input, context }) => {
    await enrichCurrentUser(context);
    // Check availability and reserve stock before creating the order
    await adjustStock(input.items, -1, true);
    const total = input.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = await zite.orders.create({
      record: {
        customer: context.user.id,
        status: 'Pending',
        total,
        deliveryAddress: input.deliveryAddress,
        deliveryArea: input.deliveryArea,
        phone: input.phone,
        notes: input.notes || '',
        paymentMethod: input.paymentMethod as any,
      },
    });
    await zite.orderItems.bulkCreate({
      records: input.items.map(i => ({
        productName: i.productName,
        order: order.id,
        productId: i.productId,
        brand: i.brand,
        quantity: i.quantity,
        price: i.price,
        shade: i.shade || '',
        imageUrl: i.imageUrl || '',
      })),
    });
    return { orderId: order.id, orderNumber: order.orderNumber };
  },
});
