import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i._id === item._id);
        
        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i._id === item._id
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
                : i
            ),
          });
        } else {
          set({ items: [...currentItems, { ...item, quantity: Math.min(item.quantity, item.stock) }] });
        }
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item._id !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        const item = get().items.find((i) => i._id === id);
        if (item) {
          set({
            items: get().items.map((i) =>
              i._id === id ? { ...i, quantity: Math.max(0, Math.min(quantity, i.stock)) } : i
            ),
          });
        }
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
