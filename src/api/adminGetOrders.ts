import { enrichCurrentUser } from '../lib/currentUser';
import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint, ZiteError } from 'zitejs/backend';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({ status: z.string().optional() }),
  outputSchema: z.object({
    orders: z.array(z.object({
      id: z.string(),
      orderNumber: z.any(),
      status: z.string(),
      total: z.number(),
      deliveryAddress: z.string(),
      deliveryArea: z.string(),
      phone: z.string(),
      notes: z.string(),
      paymentMethod: z.string(),
      createdAt: z.string(),
      customerEmail: z.string(),
      customerName: z.string(),
      items: z.array(z.object({
        productName: z.string(),
        quantity: z.number(),
        price: z.number(),
        shade: z.string(),
        imageUrl: z.string(),
        barcode: z.string(),
        itemCode: z.string(),
      })),
    })),
  }),
  execute: async ({ input, context }) => {
    await enrichCurrentUser(context);
    if (context.user.role !== 'Admin') throw new ZiteError({ code: 'FORBIDDEN', message: 'Admin only' });
    const filters: any = {};
    if (input.status) filters.status = input.status;
    const { records } = await zite.orders.findAll({ filters, limit: 100 });
    // Load product barcode/itemCode lookup
    const { records: allProducts } = await zite.products.findAll({ limit: 500, fields: ['name', 'barcode', 'itemCode'] });
    const prodMap: Record<string, { barcode: string; itemCode: string }> = {};
    for (const p of allProducts) {
      if (p.name) prodMap[p.name.toLowerCase()] = { barcode: p.barcode || '', itemCode: p.itemCode || '' };
    }

    const sorted = records.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    const orders = await Promise.all(sorted.map(async (o) => {
      const { records: items } = await zite.orderItems.findAll({ filters: { order: o.id } });
      const custId = Array.isArray(o.customer) ? o.customer[0] : o.customer;
      let customerEmail = '';
      let customerName = '';
      if (custId) {
        const u = await zite.users.findOne({ id: custId });
        if (u) { customerEmail = u.email || ''; customerName = `${u.firstName || ''} ${u.lastName || ''}`.trim(); }
      }
      return {
        id: o.id, orderNumber: o.orderNumber, status: o.status || 'Pending',
        total: o.total || 0, deliveryAddress: o.deliveryAddress || '', deliveryArea: o.deliveryArea || '',
        phone: o.phone || '', notes: o.notes || '', paymentMethod: o.paymentMethod || '',
        createdAt: o.createdAt || '', customerEmail, customerName,
        items: items.map(i => {
          const lookup = prodMap[(i.productName || '').toLowerCase()] || { barcode: '', itemCode: '' };
          return { productName: i.productName || '', quantity: i.quantity || 0, price: i.price || 0, shade: i.shade || '', imageUrl: i.imageUrl || '', barcode: lookup.barcode, itemCode: lookup.itemCode };
        }),
      };
    }));
    return { orders };
  },
});
