import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Product } from '@/data/sampleData';

interface WishlistCtx {
  items: Product[];
  isLiked: (id: string) => boolean;
  toggle: (p: Product) => void;
  remove: (id: string) => void;
}

const Ctx = createContext<WishlistCtx | null>(null);
const KEY = 'glowme-wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const isLiked = (id: string) => items.some(i => i.id === id);
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const toggle = (p: Product) => setItems(prev => prev.some(i => i.id === p.id) ? prev.filter(i => i.id !== p.id) : [p, ...prev]);

  return <Ctx.Provider value={{ items, isLiked, toggle, remove }}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useWishlist must be used inside WishlistProvider');
  return c;
}
