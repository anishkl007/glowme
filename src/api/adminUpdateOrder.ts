import { enrichCurrentUser } from '../lib/currentUser';
import { adjustStock } from '../lib/stock';
import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint, ZiteError } from 'zitejs/backend';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({ orderId: z.string(), status: z.string() }),
  outputSchema: z.object({ success: z.boolean(), invoiceCreated: z.boolean(), invoiceId: z.string().optional() }),
  execute: async ({ input, context }) => {
    await enrichCurrentUser(context);
    if (context.user.role !== 'Admin') throw new ZiteError({ code: 'FORBIDDEN', message: 'Admin only' });
    const before = await zite.orders.findOne({ id: input.orderId });
    await zite.orders.update({ id: input.orderId, record: { status: input.status as any } });

    // Put stock back when an order is cancelled, take it again if un-cancelled
    const wasCancelled = before?.status === 'Cancelled';
    const nowCancelled = input.status === 'Cancelled';
    if (wasCancelled !== nowCancelled) {
      const { records: its } = await zite.orderItems.findAll({ filters: { order: input.orderId } });
      await adjustStock(its, nowCancelled ? 1 : -1);
    }

    // Auto-create invoice when order is confirmed
    if (input.status === 'Confirmed') {
      const order = await zite.orders.findOne({ id: input.orderId });
      if (!order) return { success: true, invoiceCreated: false };

      // Get order items
      const { records: items } = await zite.orderItems.findAll({ filters: { order: input.orderId } });

      // Get customer info
      const custId = Array.isArray(order.customer) ? order.customer[0] : order.customer;
      let customerName = '';
      let customerEmail = '';
      if (custId) {
        const u = await zite.users.findOne({ id: custId });
        if (u) {
          customerName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
          customerEmail = u.email || '';
        }
      }

      // Look up barcode/itemCode from Products table
      const { records: prods } = await zite.products.findAll({ limit: 500, fields: ['name', 'barcode', 'itemCode'] });
      const prodMap: Record<string, { barcode: string; itemCode: string }> = {};
      for (const p of prods) {
        if (p.name) prodMap[p.name.toLowerCase()] = { barcode: p.barcode || '', itemCode: p.itemCode || '' };
      }

      // Build invoice line items from order items
      const lineItems = items.map(i => {
        const lookup = prodMap[(i.productName || '').toLowerCase()] || { barcode: '', itemCode: '' };
        return {
          description: `${i.productName || 'Product'}${i.shade ? ` (${i.shade})` : ''}`,
          quantity: i.quantity || 1,
          unitPrice: i.price || 0,
          barcode: lookup.barcode,
          itemCode: lookup.itemCode,
        };
      });

      const subtotal = lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);

      const invoice = await zite.invoices.create({
        record: {
          customerName: customerName || 'Walk-in Customer',
          customerEmail,
          status: 'Draft',
          subtotal,
          tax: 0,
          total: subtotal,
          itemsJson: JSON.stringify(lineItems),
          notes: `Auto-generated from Order #${order.orderNumber}`,
          paymentMethod: (order.paymentMethod === 'Cash on Delivery' ? 'Cash' : order.paymentMethod) as any,
        },
      });

      return { success: true, invoiceCreated: true, invoiceId: invoice.id };
    }

    return { success: true, invoiceCreated: false };
  },
});
