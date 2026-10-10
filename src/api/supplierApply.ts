import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';
import { enrichCurrentUser } from '../lib/currentUser';
import { ids } from '../lib/stores';

export default createEndpoint({
  description: 'Submits or reads the signed-in user’s supplier application',
  authenticated: true,
  inputSchema: z.object({
    application: z.object({
      businessName: z.string(), businessType: z.string(), contactName: z.string(), phone: z.string(),
      area: z.string(), categories: z.string(), instagram: z.string(), about: z.string(),
    }).optional(),
  }),
  outputSchema: z.object({ status: z.string().nullable(), businessName: z.string().nullable() }),
  execute: async ({ input, context }) => {
    await enrichCurrentUser(context);
    const { records } = await zite.supplierApplications.findAll({ limit: 2000 });
    const mine = records.filter(r => ids(r.applicant).includes(context.user.id))
      .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))[0];
    if (input.application) {
      const a = input.application;
      if (!a.businessName.trim() || !a.contactName.trim() || a.phone.trim().length < 7) throw new Error('Please fill in business name, contact name and phone');
      if (mine && mine.status !== 'Rejected') return { status: mine.status || 'Pending', businessName: mine.businessName || '' };
      await zite.supplierApplications.create({ record: {
        ...a, businessName: a.businessName.trim(), email: context.user.email, status: 'Pending', applicant: [context.user.id],
      } });
      return { status: 'Pending', businessName: a.businessName };
    }
    return { status: mine?.status ?? null, businessName: mine?.businessName ?? null };
  },
});
