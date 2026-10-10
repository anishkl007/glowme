import { enrichCurrentUser } from '../lib/currentUser';
import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint, ZiteError } from 'zitejs/backend';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({ userId: z.string(), role: z.string() }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ context, input }) => {
    await enrichCurrentUser(context);
    if (context.user.role !== 'Admin') throw new ZiteError({ code: 'FORBIDDEN', message: 'Admin only' });
    await zite.users.update({ id: input.userId, record: { role: input.role as any } });
    return { success: true };
  },
});
