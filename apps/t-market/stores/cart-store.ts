import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Module } from '@/types';

export interface CartItem extends Module {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
}

interface CartActions {
  addToCart: (module: Module) => void;
  removeFromCart: (moduleId: string) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
  checkout: () => Promise<void>;
}

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      total: 0,

      addToCart: (module) => {
        const { items } = get();
        const existing = items.find(i => i.id === module.id);
        
        if (existing) {
          // If already in cart, just open the cart
          set({ isOpen: true });
          return;
        }

        const newItems = [...items, { ...module, quantity: 1 }];
        const newTotal = newItems.reduce((sum, item) => sum + item.price, 0);

        set({ items: newItems, total: newTotal, isOpen: true });
      },

      removeFromCart: (moduleId) => {
        const { items } = get();
        const newItems = items.filter(i => i.id !== moduleId);
        const newTotal = newItems.reduce((sum, item) => sum + item.price, 0);
        
        set({ items: newItems, total: newTotal });
      },

      clearCart: () => {
        set({ items: [], total: 0 });
      },

      toggleCart: (open) => {
        set((state) => ({ isOpen: open ?? !state.isOpen }));
      },

      checkout: async () => {
        // Simulate checkout process
        await new Promise(resolve => setTimeout(resolve, 1500));
        get().clearCart();
      }
    }),
    {
      name: 't-market-cart-storage',
    }
  )
);
