import { enrichCurrentUser } from '../lib/currentUser';
import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint, ZiteError } from 'zitejs/backend';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    action: z.enum(['list', 'create', 'update', 'delete']),
    id: z.string().optional(),
    customerName: z.string().optional(),
    customerEmail: z.string().optional(),
    status: z.string().optional(),
    subtotal: z.number().optional(),
    tax: z.number().optional(),
    total: z.number().optional(),
    itemsJson: z.string().optional(),
    notes: z.string().optional(),
    dueDate: z.string().optional(),
    paymentMethod: z.string().optional(),
  }),
  outputSchema: z.object({
    invoices: z.array(z.object({
      id: z.string(),
      invoiceNumber: z.any(),
      customerName: z.string(),
      customerEmail: z.string(),
      status: z.string(),
      subtotal: z.number(),
      tax: z.number(),
      total: z.number(),
      itemsJson: z.string(),
      notes: z.string(),
      dueDate: z.string(),
      paymentMethod: z.string(),
      createdAt: z.string(),
    })).optional(),
    invoice: z.object({ id: z.string() }).optional(),
    success: z.boolean(),
  }),
  execute: async ({ input, context }) => {
    await enrichCurrentUser(context);
    if (context.user.role !== 'Admin') throw new ZiteError({ code: 'FORBIDDEN', message: 'Admin only' });

    if (input.action === 'list') {
      const filters: any = {};
      if (input.status) filters.status = input.status;
      const { records } = await zite.invoices.findAll({ filters, limit: 200 });
      const sorted = records.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      return {
        success: true,
        invoices: sorted.map(r => ({
          id: r.id,
          invoiceNumber: r.invoiceNumber,
          customerName: r.customerName || '',
          customerEmail: r.customerEmail || '',
          status: r.status || 'Draft',
          subtotal: r.subtotal || 0,
          tax: r.tax || 0,
          total: r.total || 0,
          itemsJson: r.itemsJson || '[]',
          notes: r.notes || '',
          dueDate: r.dueDate || '',
          paymentMethod: r.paymentMethod || '',
          createdAt: r.createdAt || '',
        })),
      };
    }

    if (input.action === 'create') {
      const created = await zite.invoices.create({
        record: {
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          status: (input.status || 'Draft') as any,
          subtotal: input.subtotal || 0,
          tax: input.tax || 0,
          total: input.total || 0,
          itemsJson: input.itemsJson || '[]',
          notes: input.notes,
          dueDate: input.dueDate,
          paymentMethod: input.paymentMethod as any,
        },
      });
      return { success: true, invoice: { id: created.id } };
    }

    if (input.action === 'update' && input.id) {
      const record: any = {};
      if (input.customerName !== undefined) record.customerName = input.customerName;
      if (input.customerEmail !== undefined) record.customerEmail = input.customerEmail;
      if (input.status) record.status = input.status;
      if (input.subtotal !== undefined) record.subtotal = input.subtotal;
      if (input.tax !== undefined) record.tax = input.tax;
      if (input.total !== undefined) record.total = input.total;
      if (input.itemsJson) record.itemsJson = input.itemsJson;
      if (input.notes !== undefined) record.notes = input.notes;
      if (input.dueDate) record.dueDate = input.dueDate;
      if (input.paymentMethod) record.paymentMethod = input.paymentMethod;
      await zite.invoices.update({ id: input.id, record });
      return { success: true, invoice: { id: input.id } };
    }

    if (input.action === 'delete' && input.id) {
      await zite.invoices.delete({ id: input.id });
      return { success: true };
    }

    return { success: false };
  },
});
