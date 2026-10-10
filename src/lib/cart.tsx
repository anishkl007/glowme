import { createContext, useContext, useState, type ReactNode } from 'react';
import { type Product } from '@/data/sampleData';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedShade?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, shade?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({
  items: [], addItem: () => {}, removeItem: () => {}, updateQuantity: () => {},
  clearCart: () => {}, totalItems: 0, totalPrice: 0,
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, shade?: string) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.selectedShade === shade);
      if (existing) return prev.map(i => i.product.id === product.id && i.selectedShade === shade ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1, selectedShade: shade }];
    });
  };

  const removeItem = (productId: string) => setItems(prev => prev.filter(i => i.product.id !== productId));
  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) return removeItem(productId);
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  };
  const clearCart = () => setItems([]);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}
