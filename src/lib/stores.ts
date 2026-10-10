// Shared backend helpers for Stores (brands & local shops) and supplier access.
import { z } from 'zod';
import { zite } from 'zitejs/db';
import type { StoresRecordType } from 'zitejs/db';

export const storeSchema = z.object({
  id: z.string(), key: z.string(), name: z.string(), type: z.string(),
  tagline: z.string(), area: z.string(), logo: z.string(), image: z.string(),
  categories: z.array(z.string()), tags: z.array(z.string()), phone: z.string(),
  verified: z.boolean(), active: z.boolean(), productCount: z.number(),
});

const list = (s?: string) => (s || '').split(',').map(x => x.trim()).filter(Boolean);
export const ids = (v?: string | string[]) => (Array.isArray(v) ? v : v ? [v] : []);

export function toStore(r: StoresRecordType, productCount = 0) {
  return {
    id: r.id, key: r.storeKey || r.id, name: r.name || '', type: r.storeType || 'Brand',
    tagline: r.tagline || '', area: r.area || '', logo: r.logo || '🛍️',
    image: r.coverImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=400&fit=crop',
    categories: list(r.categories), tags: list(r.tags), phone: r.phone || '',
    verified: !!r.verified, active: r.active !== false, productCount,
  };
}

export async function productCounts() {
  const { records } = await zite.products.findAll({ limit: 2000 });
  const m: Record<string, number> = {};
  for (const p of records) if (p.brandId) m[p.brandId] = (m[p.brandId] || 0) + 1;
  return m;
}

/** Stores the given Users-table row is a supplier for. Admins always manage the Glowme Products store. */
export async function storesForUser(userId: string, isAdmin = false) {
  const { records } = await zite.stores.findAll({ limit: 500 });
  return records.filter(s => ids(s.suppliers).includes(userId) || (isAdmin && s.storeKey === 'glowme'));
}
