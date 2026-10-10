import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { enrichCurrentUser } from '../lib/currentUser';
import { storeSchema, toStore, productCounts, ids } from '../lib/stores';

const storeInput = z.object({
  id: z.string().optional(), name: z.string(), type: z.string(), tagline: z.string(), area: z.string(),
  logo: z.string(), image: z.string(), categories: z.string(), tags: z.string(), phone: z.string(),
  verified: z.boolean(), active: z.boolean(),
});

export default createEndpoint({
  description: 'Admin: list, create, edit and delete stores and assign supplier accounts',
  authenticated: true,
  inputSchema: z.object({
    action: z.enum(['list', 'save', 'delete', 'addSupplier', 'removeSupplier']),
    id: z.string().optional(),
    store: storeInput.optional(),
    email: z.string().optional(),
    userId: z.string().optional(),
  }),
  outputSchema: z.object({
    stores: z.array(storeSchema.extend({ suppliers: z.array(z.object({ id: z.string(), email: z.string(), name: z.string() })) })),
  }),
  execute: async ({ input, context }) => {
    await enrichCurrentUser(context);
    if (context.user.role !== 'Admin') throw new ZiteError({ code: 'FORBIDDEN', message: 'Admin only' });

    if (input.action === 'save' && input.store) {
      const s = input.store;
      if (!s.name.trim()) throw new Error('Store name is required');
      const record = {
        name: s.name.trim(), storeType: s.type, tagline: s.tagline, area: s.area, logo: s.logo, coverImage: s.image || null,
        categories: s.categories, tags: s.tags, phone: s.phone || null, verified: s.verified, active: s.active,
      };
      if (s.id) await zite.stores.update({ id: s.id, record });
      else {
        const c = await zite.stores.create({ record });
        await zite.stores.update({ id: c.id, record: { storeKey: c.id } });
      }
    }
    if (input.action === 'delete' && input.id) await zite.stores.delete({ id: input.id });

    if ((input.action === 'addSupplier' || input.action === 'removeSupplier') && input.id) {
      const store = await zite.stores.findOne({ id: input.id });
      if (!store) throw new Error('Store not found');
      let current = ids(store.suppliers);
      if (input.action === 'addSupplier') {
        const email = (input.email || '').trim().toLowerCase();
        const { records } = await zite.users.findAll({ filters: { email: { contains: email } }, limit: 20 });
        const user = records.find(u => (u.email || '').toLowerCase() === email);
        if (!user) throw new ZiteError({ code: 'NOT_FOUND', message: 'No account with that email — ask them to sign up first', userFacingMessage: 'No account with that email — ask them to sign up on the site first.' });
        if (!current.includes(user.id)) current = [...current, user.id];
        if (user.role !== 'Admin') await zite.users.update({ id: user.id, record: { role: 'Supplier' } });
      } else {
        current = current.filter(x => x !== input.userId);
      }
      await zite.stores.update({ id: input.id, record: { suppliers: current } });
    }

    const [{ records }, counts, users] = await Promise.all([
      zite.stores.findAll({ limit: 500 }), productCounts(), zite.users.findAll({ limit: 2000 }),
    ]);
    const byId = new Map(users.records.map(u => [u.id, u]));
    return {
      stores: records.map(r => ({
        ...toStore(r, counts[r.storeKey || r.id] || 0),
        suppliers: ids(r.suppliers).map(id => {
          const u = byId.get(id);
          return { id, email: u?.email || '', name: [u?.firstName, u?.lastName].filter(Boolean).join(' ') };
        }),
      })).sort((a, b) => a.name.localeCompare(b.name)),
    };
  },
});
