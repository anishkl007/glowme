import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';
import { storeSchema, toStore, productCounts } from '../lib/stores';

export default createEndpoint({
  description: 'Lists active local brands and stores, or one store by key',
  inputSchema: z.object({ key: z.string().optional() }),
  outputSchema: z.object({ stores: z.array(storeSchema) }),
  execute: async ({ input }) => {
    const filters: any = { active: true };
    if (input.key) filters.storeKey = input.key;
    const [{ records }, counts] = await Promise.all([zite.stores.findAll({ filters, limit: 500 }), productCounts()]);
    return { stores: records.map(r => toStore(r, counts[r.storeKey || r.id] || 0)).sort((a, b) => a.name.localeCompare(b.name)) };
  },
});
