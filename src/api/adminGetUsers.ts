import { enrichCurrentUser } from '../lib/currentUser';
import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint, ZiteError } from 'zitejs/backend';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({
    users: z.array(z.object({
      id: z.string(),
      email: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      role: z.string(),
      area: z.string(),
      joinedAt: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    await enrichCurrentUser(context);
    if (context.user.role !== 'Admin') throw new ZiteError({ code: 'FORBIDDEN', message: 'Admin only' });
    const { records } = await zite.users.findAll({ limit: 200 });
    return {
      users: records.map(u => ({
        id: u.id, email: u.email || '', firstName: u.firstName || '',
        lastName: u.lastName || '', role: u.role || 'Customer', area: u.area || '', joinedAt: u.joinedAt || '',
      })),
    };
  },
});
