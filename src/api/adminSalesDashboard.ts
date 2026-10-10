import { enrichCurrentUser } from '../lib/currentUser';
import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint, ZiteError } from 'zitejs/backend';

export default createEndpoint({
  description: 'Sales dashboard stats for admins',
  authenticated: true,
  inputSchema: z.object({ days: z.number().default(30) }),
  outputSchema: z.object({
    totalRevenue: z.number(),
    totalOrders: z.number(),
    avgOrder: z.number(),
    pendingOrders: z.number(),
    revenueByDay: z.array(z.object({ date: z.string(), revenue: z.number(), orders: z.number() })),
    byStatus: z.array(z.object({ status: z.string(), count: z.number() })),
    topProducts: z.array(z.object({ name: z.string(), qty: z.number(), revenue: z.number() })),
    byArea: z.array(z.object({ area: z.string(), revenue: z.number() })),
  }),
  execute: async ({ input, context }) => {
    await enrichCurrentUser(context);
    if (context.user.role !== 'Admin') throw new ZiteError({ code: 'FORBIDDEN', message: 'Admin only' });
    const days = input.days ?? 30;
    const since = `o.created_at >= now() - ($1::int * interval '1 day')`;

    const [totals, byDay, byStatus, top, byArea] = await Promise.all([
      zite.sql({ query: `
        SELECT COALESCE(SUM(o."total") FILTER (WHERE o."status" <> 'Cancelled'), 0) AS "revenue",
               COUNT(*) FILTER (WHERE o."status" <> 'Cancelled') AS "orders",
               COUNT(*) FILTER (WHERE o."status" = 'Pending') AS "pending"
        FROM "Orders" o WHERE ${since}`, params: [days] }),
      zite.sql({ query: `
        SELECT to_char(d::date, 'YYYY-MM-DD') AS "date",
               COALESCE(SUM(o."total"), 0) AS "revenue", COUNT(o.id) AS "orders"
        FROM generate_series(CURRENT_DATE - ($1::int - 1), CURRENT_DATE, interval '1 day') d
        LEFT JOIN "Orders" o ON o.created_at::date = d::date AND o."status" <> 'Cancelled'
        GROUP BY d ORDER BY d`, params: [days] }),
      zite.sql({ query: `
        SELECT COALESCE(o."status", 'Unknown') AS "status", COUNT(*) AS "count"
        FROM "Orders" o WHERE ${since} GROUP BY 1 ORDER BY 2 DESC`, params: [days] }),
      zite.sql({ query: `
        SELECT i."productName" AS "name", SUM(i."quantity") AS "qty", SUM(i."quantity" * i."price") AS "revenue"
        FROM "OrderItems" i
        JOIN "OrderItemsOrders" l ON l."orderItemsId" = i.id
        JOIN "Orders" o ON o.id = l."ordersId"
        WHERE ${since} AND o."status" <> 'Cancelled' AND i."productName" IS NOT NULL
        GROUP BY i."productName" ORDER BY 3 DESC NULLS LAST LIMIT 5`, params: [days] }),
      zite.sql({ query: `
        SELECT COALESCE(NULLIF(o."deliveryArea", ''), 'Other') AS "area", SUM(o."total") AS "revenue"
        FROM "Orders" o WHERE ${since} AND o."status" <> 'Cancelled'
        GROUP BY 1 ORDER BY 2 DESC NULLS LAST LIMIT 6`, params: [days] }),
    ]);

    const t = totals.rows[0] || {};
    const revenue = Number(t.revenue || 0);
    const orders = Number(t.orders || 0);
    return {
      totalRevenue: revenue,
      totalOrders: orders,
      avgOrder: orders ? revenue / orders : 0,
      pendingOrders: Number(t.pending || 0),
      revenueByDay: byDay.rows.map(r => ({ date: String(r.date), revenue: Number(r.revenue), orders: Number(r.orders) })),
      byStatus: byStatus.rows.map(r => ({ status: String(r.status), count: Number(r.count) })),
      topProducts: top.rows.map(r => ({ name: String(r.name), qty: Number(r.qty || 0), revenue: Number(r.revenue || 0) })),
      byArea: byArea.rows.map(r => ({ area: String(r.area), revenue: Number(r.revenue || 0) })),
    };
  },
});
