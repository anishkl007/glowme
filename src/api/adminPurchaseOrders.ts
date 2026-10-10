import { enrichCurrentUser } from '../lib/currentUser';
import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint, ZiteError } from 'zitejs/backend';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    action: z.enum(['list', 'create', 'update', 'delete', 'listProducts']),
    id: z.string().optional(),
    supplier: z.string().optional(),
    status: z.string().optional(),
    itemsJson: z.string().optional(),
    totalCost: z.number().optional(),
    notes: z.string().optional(),
    expectedDelivery: z.string().optional(),
  }),
  outputSchema: z.object({
    purchaseOrders: z.array(z.object({
      id: z.string(),
      poNumber: z.any(),
      supplier: z.string(),
      status: z.string(),
      itemsJson: z.string(),
      totalCost: z.number(),
      notes: z.string(),
      expectedDelivery: z.string(),
      createdAt: z.string(),
    })).optional(),
    purchaseOrder: z.object({ id: z.string() }).optional(),
    products: z.array(z.object({
      id: z.string(),
      name: z.string(),
      brand: z.string(),
      price: z.number(),
      category: z.string(),
      barcode: z.string(),
      itemCode: z.string(),
    })).optional(),
    success: z.boolean(),
  }),
  execute: async ({ input, context }) => {
    await enrichCurrentUser(context);
    if (context.user.role !== 'Admin') throw new ZiteError({ code: 'FORBIDDEN', message: 'Admin only' });

    if (input.action === 'list') {
      const filters: any = {};
      if (input.status) filters.status = input.status;
      const { records } = await zite.purchaseOrders.findAll({ filters, limit: 200 });
      const sorted = records.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      return {
        success: true,
        purchaseOrders: sorted.map(r => ({
          id: r.id,
          poNumber: r.poNumber,
          supplier: r.supplier || '',
          status: r.status || 'Quotation',
          itemsJson: r.itemsJson || '[]',
          totalCost: r.totalCost || 0,
          notes: r.notes || '',
          expectedDelivery: r.expectedDelivery || '',
          createdAt: r.createdAt || '',
        })),
      };
    }

    if (input.action === 'create') {
      const created = await zite.purchaseOrders.create({
        record: {
          supplier: input.supplier,
          status: (input.status || 'Quotation') as any,
          itemsJson: input.itemsJson || '[]',
          totalCost: input.totalCost || 0,
          notes: input.notes,
          expectedDelivery: input.expectedDelivery,
        },
      });
      return { success: true, purchaseOrder: { id: created.id } };
    }

    if (input.action === 'update' && input.id) {
      const record: any = {};
      if (input.supplier !== undefined) record.supplier = input.supplier;
      if (input.status) record.status = input.status;
      if (input.itemsJson) record.itemsJson = input.itemsJson;
      if (input.totalCost !== undefined) record.totalCost = input.totalCost;
      if (input.notes !== undefined) record.notes = input.notes;
      if (input.expectedDelivery) record.expectedDelivery = input.expectedDelivery;
      await zite.purchaseOrders.update({ id: input.id, record });
      return { success: true, purchaseOrder: { id: input.id } };
    }

    if (input.action === 'delete' && input.id) {
      await zite.purchaseOrders.delete({ id: input.id });
      return { success: true };
    }

    if (input.action === 'listProducts') {
      const { records } = await zite.products.findAll({ limit: 500, fields: ['name', 'brand', 'price', 'category'] });
      return {
        success: true,
        products: records.map(r => ({
          id: r.id,
          name: r.name || '',
          brand: r.brand || '',
          price: r.price || 0,
          category: r.category || '',
          barcode: r.barcode || '',
          itemCode: r.itemCode || '',
        })),
      };
    }

    return { success: false };
  },
});
