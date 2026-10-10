import { enrichCurrentUser } from '../lib/currentUser';
import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint } from 'zitejs/backend';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({ phone: z.string().optional(), area: z.string().optional() }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ input, context }) => {
    await enrichCurrentUser(context);
    const record: any = {};
    if (input.phone !== undefined) record.phone = input.phone;
    if (input.area !== undefined) record.area = input.area;
    await zite.users.update({ id: context.user.id, record });
    return { success: true };
  },
});
