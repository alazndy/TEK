'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, userId: user.uid }),
      });

      const { sessionId, error: apiError } = await response.json();

      if (apiError) {
        setError(apiError);
        setLoading(false);
        return;
      }

      // Redirect to Stripe checkout using the session URL
      // The API should return the session URL directly
      if (sessionId) {
        // For now, use the Stripe hosted checkout page
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Checkout</h1>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-white">
                <span>{item.name}</span>
                <span className="font-semibold">${item.price}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/20 mt-4 pt-4 flex justify-between text-white">
            <span className="text-xl font-bold">Total:</span>
            <span className="text-2xl font-bold">${total}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-white text-purple-600 px-6 py-4 rounded-lg font-bold text-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Pay with Stripe'}
        </button>

        <p className="text-white/60 text-center mt-4 text-sm">
          Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
}
