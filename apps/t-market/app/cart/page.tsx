'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart-store';
import { Trash2, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, total, clearCart } = useCartStore();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <ShoppingBag className="w-24 h-24 mx-auto mb-4 opacity-50" />
          <h2 className="text-3xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-white/70 mb-6">Browse our marketplace to find modules</p>
          <Link
            href="/store"
            className="inline-block bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Browse Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Shopping Cart</h1>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 flex justify-between items-center"
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                <p className="text-white/70 text-sm">{item.description}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-2xl font-bold text-white">
                  ${item.price}
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  title="Remove item"
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl text-white">Total:</span>
            <span className="text-3xl font-bold text-white">${total}</span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => clearCart()}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Clear Cart
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
