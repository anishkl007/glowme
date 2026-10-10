import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { enrichCurrentUser } from '../lib/currentUser';
import { ids } from '../lib/stores';

const app = z.object({
  id: z.string(), businessName: z.string(), businessType: z.string(), contactName: z.string(), email: z.string(),
  phone: z.string(), area: z.string(), categories: z.string(), instagram: z.string(), about: z.string(),
  status: z.string(), submittedAt: z.string(),
});

export default createEndpoint({
  description: 'Admin: list supplier applications and approve or reject them',
  authenticated: true,
  inputSchema: z.object({ action: z.enum(['list', 'approve', 'reject']), id: z.string().optional() }),
  outputSchema: z.object({ applications: z.array(app) }),
  execute: async ({ input, context }) => {
    await enrichCurrentUser(context);
    if (context.user.role !== 'Admin') throw new ZiteError({ code: 'FORBIDDEN', message: 'Admin only' });

    if (input.id && input.action !== 'list') {
      const a = await zite.supplierApplications.findOne({ id: input.id });
      if (!a) throw new Error('Application not found');
      if (input.action === 'approve' && a.status !== 'Approved') {
        const userIds = ids(a.applicant);
        const store = await zite.stores.create({ record: {
          name: a.businessName || 'New store', storeType: a.businessType || 'Brand', area: a.area || '', phone: a.phone || null,
          categories: a.categories || '', tagline: (a.about || '').slice(0, 120), logo: '🛍️', active: true, verified: false, suppliers: userIds,
        } });
        await zite.stores.update({ id: store.id, record: { storeKey: store.id } });
        for (const uid of userIds) {
          const u = await zite.users.findOne({ id: uid });
          if (u && u.role !== 'Admin') await zite.users.update({ id: uid, record: { role: 'Supplier' } });
        }
      }
      await zite.supplierApplications.update({ id: input.id, record: { status: input.action === 'approve' ? 'Approved' : 'Rejected' } });
    }

    const { records } = await zite.supplierApplications.findAll({ limit: 500 });
    return {
      applications: records.map(r => ({
        id: r.id, businessName: r.businessName || '', businessType: r.businessType || '', contactName: r.contactName || '',
        email: r.email || '', phone: r.phone || '', area: r.area || '', categories: r.categories || '', instagram: r.instagram || '',
        about: r.about || '', status: r.status || 'Pending', submittedAt: r.submittedAt || '',
      })).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    };
  },
});
